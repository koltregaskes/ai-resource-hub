"""The money ledger: no spending without a reservation.

One ledger per provider, shared by model calls and judge calls.

- `reserve(request_id, worst_case_usd)` runs before each request. The worst
  case is the input-token bound x input price + the output limit x output
  price. It raises `CapExceeded` when spent + reserved + the new reservation
  would pass the provider cap.
- The input-token bound is `input_token_bound`: the UTF-8 byte length of
  every text field sent, plus `FRAMING_ALLOWANCE_TOKENS`. It is an upper
  bound, not an estimate, and it is the only input-token figure that ever
  feeds a reservation or a pre-flight bound.
- `settle(request_id, billable, receipt)` reconciles to the actual charge at
  the frozen price receipt. Missing usage keeps the full reservation as the
  charge and flags the request.
- A settled charge above its reservation is recorded and flagged
  `charge_above_reservation`; the runner then stops before the next request
  (`ReservationExceeded`). `overruns()` lists such requests, and every later
  start is refused until the run config acknowledges each one by request id.
- Every reserve and settle is appended to a JSONL file, flushed and fsynced
  before the call returns, so the reservation is on disk before the request
  is sent. A restart reloads the file; a reservation that was never settled
  stays counted in full.
- One writer at a time, across processes, in two layers. `StoreLock` is the
  execution lock of a private store: one process owns the store for as long
  as it runs, and a second one is refused. Under that, every reserve, settle
  and reconcile holds an operating-system lock on the ledger, reads what
  any other writer has appended since, checks, appends and fsyncs before it
  lets go. Two writers can therefore never both fit the same room under a
  cap. Both locks are held by the operating system and end with the
  process, so a crashed run does not leave the store stuck.

Money is `decimal.Decimal` throughout and is written to disk as text.
"""

import contextlib
import datetime
import json
import os
import time
from decimal import Decimal

try:
    import msvcrt
except ImportError:                     # not Windows
    msvcrt = None
    import fcntl

MTOK = Decimal(1000000)
ZERO = Decimal(0)
# Tokens allowed per request, on top of the bytes of the text, for what the
# provider wraps round it: role markers and message wrappers.
FRAMING_ALLOWANCE_TOKENS = 256
OVERRUN_FLAG = "charge_above_reservation"


class CapExceeded(Exception):
    """The reservation would take spent plus reserved above a cap."""

    def __init__(self, message, provider=None, scope="provider"):
        super().__init__(message)
        self.provider = provider
        self.scope = scope


class LedgerError(Exception):
    """The ledger was used wrongly or its file is damaged."""


class StoreLocked(LedgerError):
    """Another owner holds the execution lock of the private store."""


class ReservationExceeded(Exception):
    """A settled charge was above its reservation. Nothing more is sent."""

    def __init__(self, message, provider=None, request_id=None):
        super().__init__(message)
        self.provider = provider
        self.request_id = request_id


def input_token_bound(*texts):
    """An upper bound on the input tokens of one request.

    `texts` is every text field sent in the request (the system text, if
    any, and the prompt or every message). The bound is their UTF-8 byte
    length plus `FRAMING_ALLOWANCE_TOKENS`.

    Why it is a bound and not an estimate: a byte-level BPE tokeniser starts
    from the bytes of the text and only ever merges them, so it never emits
    more tokens than the text has bytes. The framing allowance covers the
    role and message wrappers the provider adds round the text.

    This is the one function behind every input-token figure in a
    reservation, the pre-flight planning bound and the absolute bound.
    """
    return sum(len(text.encode("utf-8", "surrogatepass")) for text in texts)         + FRAMING_ALLOWANCE_TOKENS


def worst_case_usd(input_tokens, output_limit, receipt):
    """The input-token bound x input price + the output limit x output price.

    The output side is the full output limit at the output price. Reasoning
    and thinking tokens are inside the output limit on both APIs and are
    billed as output, so the limit covers them. If a receipt says reasoning
    is billed separately, the limit is priced at the output rate plus the
    reasoning rate. The input side uses the dearer of the input rate and
    the cached-input rate, so a cached token can never cost more than was
    reserved for it.
    """
    input_rate = receipt.input_per_mtok
    if receipt.cached_input_per_mtok is not None:
        input_rate = max(input_rate, receipt.cached_input_per_mtok)
    output_rate = receipt.output_per_mtok
    if receipt.reasoning_billing == "separate" and receipt.reasoning_per_mtok is not None:
        output_rate += receipt.reasoning_per_mtok
    return (Decimal(input_tokens) * input_rate + Decimal(output_limit) * output_rate) / MTOK


def charge_usd(billable, receipt):
    """The actual charge for one request at the frozen price receipt.

    Returns (charge, flags). The charge is None when it cannot be worked out
    (missing usage, an unpriced token class, a missing rate); the caller then
    keeps the full reservation.

    Reasoning tokens: with `reasoning_billing` "in_output" they are a part of
    output tokens and are billed once, as output. With "separate" they are
    billed at the receipt's reasoning rate on top of output tokens.
    Cached input is billed at the cached rate.
    """
    if billable is None:
        return None, ["missing_usage"]
    flags = []
    if billable.get("unpriced"):
        return None, ["unpriced_tokens:" + ",".join(billable["unpriced"])]
    cached = billable.get("cached_input") or 0
    total = Decimal(billable["input_uncached"]) * receipt.input_per_mtok
    if cached:
        flags.append("cached_tokens_reported")
        if receipt.cached_input_per_mtok is None:
            return None, flags + ["cached_rate_missing"]
        total += Decimal(cached) * receipt.cached_input_per_mtok
    total += Decimal(billable["output"]) * receipt.output_per_mtok
    if receipt.reasoning_billing == "separate":
        reasoning = billable.get("reasoning")
        if reasoning is None or receipt.reasoning_per_mtok is None:
            return None, flags + ["reasoning_usage_missing"]
        total += Decimal(reasoning) * receipt.reasoning_per_mtok
    return total / MTOK, flags


def _now():
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# ---- operating-system locks ---------------------------------------------

# The byte that is locked. It is far past the end of the file, so the text
# at the start of a lock file stays readable by a process that is refused
# (on Windows a locked byte cannot be read through another handle).
_LOCK_OFFSET = 1 << 30
LEDGER_LOCK_WAIT_SECONDS = 30.0
STORE_LOCK_NAME = "execution.lock"


def _try_lock(descriptor):
    """Take an exclusive lock on an open file without waiting. True when
    taken. The operating system drops the lock when the descriptor is
    closed or the process ends, however it ends."""
    try:
        if msvcrt is not None:
            os.lseek(descriptor, _LOCK_OFFSET, os.SEEK_SET)
            msvcrt.locking(descriptor, msvcrt.LK_NBLCK, 1)
        else:
            fcntl.flock(descriptor, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        return False
    return True


def _unlock(descriptor):
    try:
        if msvcrt is not None:
            os.lseek(descriptor, _LOCK_OFFSET, os.SEEK_SET)
            msvcrt.locking(descriptor, msvcrt.LK_UNLCK, 1)
        else:
            fcntl.flock(descriptor, fcntl.LOCK_UN)
    except OSError:
        pass


def _read_owner(descriptor):
    try:
        os.lseek(descriptor, 0, os.SEEK_SET)
        return os.read(descriptor, 200).decode("utf-8", "replace").strip()
    except OSError:
        return ""


class StoreLock:
    """The execution lock of a private store: one owner at a time.

    `acquire` takes an operating-system lock on `<store>/execution.lock`
    without waiting and raises `StoreLocked` when another process (or
    another owner in this process) holds it. It is taken before any ledger
    is read and before any run record is opened, and it is kept until
    `release` or until the process ends. The file holds the owner's pid,
    run id and start time as plain text, for the refusal message. The lock
    is the operating-system lock, never the text or the file being there:
    a file left behind by a run that has ended locks nothing.
    """

    def __init__(self, private_store):
        self.path = os.path.join(os.fspath(private_store), STORE_LOCK_NAME)
        self._descriptor = None
        self._started = None

    @property
    def held(self):
        return self._descriptor is not None

    def acquire(self, run_id=None):
        if self.held:
            raise LedgerError("the store lock is already held by this owner")
        os.makedirs(os.path.dirname(self.path) or ".", exist_ok=True)
        descriptor = os.open(self.path, os.O_RDWR | os.O_CREAT, 0o600)
        if not _try_lock(descriptor):
            owner = _read_owner(descriptor)
            os.close(descriptor)
            raise StoreLocked(
                "the private store is in use by another run (%s). One run at a time may "
                "use a private store; wait for it to end. The lock ends with the process "
                "that holds it." % (owner or "owner not readable"))
        self._descriptor = descriptor
        self._started = _now()
        self.describe(run_id)
        return self

    def describe(self, run_id):
        """Write who holds the lock: pid, run id and start time."""
        text = "pid %d, run %s, started %s\n" % (
            os.getpid(), run_id or "not yet named", self._started)
        os.lseek(self._descriptor, 0, os.SEEK_SET)
        os.ftruncate(self._descriptor, 0)
        os.write(self._descriptor, text.encode("utf-8"))
        os.fsync(self._descriptor)

    def release(self):
        if self._descriptor is None:
            return
        descriptor, self._descriptor = self._descriptor, None
        try:
            os.lseek(descriptor, 0, os.SEEK_SET)
            os.ftruncate(descriptor, 0)
        except OSError:
            pass
        _unlock(descriptor)
        os.close(descriptor)

    def __enter__(self):
        return self if self.held else self.acquire()

    def __exit__(self, *exc):
        self.release()
        return False


def store_owner(private_store):
    """Who holds the execution lock of this store right now, as text, or
    None when nobody does. Nothing is created."""
    path = os.path.join(os.fspath(private_store), STORE_LOCK_NAME)
    try:
        descriptor = os.open(path, os.O_RDWR)
    except OSError:
        return None
    try:
        if _try_lock(descriptor):
            _unlock(descriptor)
            return None
        return _read_owner(descriptor) or "owner not readable"
    finally:
        os.close(descriptor)


@contextlib.contextmanager
def _file_lock(path, wait_seconds=None):
    """Hold an exclusive operating-system lock on `path` (made if absent),
    waiting for another holder to let go."""
    wait = LEDGER_LOCK_WAIT_SECONDS if wait_seconds is None else wait_seconds
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    descriptor = os.open(path, os.O_RDWR | os.O_CREAT, 0o600)
    try:
        deadline = time.monotonic() + wait
        while not _try_lock(descriptor):
            if time.monotonic() >= deadline:
                raise LedgerError(
                    "the ledger lock %s was not free after %d seconds; nothing was "
                    "reserved or written" % (os.path.basename(path), wait))
            time.sleep(0.005)
        try:
            yield
        finally:
            _unlock(descriptor)
    finally:
        os.close(descriptor)


class ProviderLedger:
    """The durable ledger for one provider.

    The file on disk is the truth, and it may have more than one writer.
    `reserve`, `settle` and `reconcile` each run as one step under the
    ledger's lock file (`<ledger>.lock`): read what has been appended since
    the last look, check, append, fsync, let go. `spent`, `reserved` and
    `remaining` are as of the last look; `refresh` looks again.
    """

    def __init__(self, provider, cap_usd, path):
        self.provider = provider
        self.cap = Decimal(str(cap_usd))
        if not self.cap.is_finite() or self.cap < 0:
            raise LedgerError("invalid cap")
        self.path = os.fspath(path)
        self.lock_path = self.path + ".lock"
        self.entries = {}
        self._read_to = 0               # bytes of the file already read
        self._lines = 0
        # Nothing is made on disk for a ledger that does not exist yet.
        if os.path.exists(self.path):
            self.refresh()

    def _locked(self):
        return _file_lock(self.lock_path)

    def refresh(self):
        """Read what any writer has appended since the last look."""
        with self._locked():
            self._load()

    def _load(self):
        """Bring `entries` up to date with the file. Call under the lock.

        The file is only ever appended to, so only the part added since the
        last look is read. A file that has become shorter (edited by hand)
        is read again from the top. Under the lock no writer is part-way
        through a line, so a line without its newline is damage.
        """
        try:
            with open(self.path, "rb") as stream:
                stream.seek(0, os.SEEK_END)
                if stream.tell() < self._read_to:
                    self.entries, self._read_to, self._lines = {}, 0, 0
                stream.seek(self._read_to)
                data = stream.read()
        except FileNotFoundError:
            if self._read_to:
                raise LedgerError("ledger for %s has gone from disk" % self.provider) from None
            return
        for line in data.splitlines(keepends=True):
            self._lines += 1
            self._read_to += len(line)
            if not line.strip():
                continue
            try:
                if not line.endswith(b"\n"):
                    raise ValueError("part-written line")
                event = json.loads(line.decode("utf-8"))
                kind = event["event"]
                request_id = event["request_id"]
                amount = Decimal(event["usd"])
            except (ValueError, KeyError, TypeError, ArithmeticError):
                raise LedgerError(
                    "ledger for %s is damaged at line %d; repair it by hand before "
                    "any further spending" % (self.provider, self._lines)) from None
            if kind == "reserve":
                self.entries[request_id] = {"reserved": amount, "charge": None,
                                            "flags": [], "reconciled": True}
            elif kind in ("settle", "reconcile") and request_id in self.entries:
                entry = self.entries[request_id]
                entry["charge"] = amount
                entry["flags"] = list(event.get("flags", []))
                entry["reconciled"] = bool(event.get("reconciled", True))
            else:
                raise LedgerError(
                    "ledger for %s has an unexpected entry at line %d"
                    % (self.provider, self._lines))

    def _append(self, event):
        """Append one event and fsync. Call under the lock, after `_load`."""
        event = dict(event, provider=self.provider, at_utc=_now())
        data = (json.dumps(event, sort_keys=True) + "\n").encode("utf-8")
        with open(self.path, "ab") as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        self._read_to += len(data)
        self._lines += 1

    @property
    def spent(self):
        return sum((e["charge"] for e in self.entries.values() if e["charge"] is not None), ZERO)

    @property
    def reserved(self):
        """Open reservations: requests in flight or never settled."""
        return sum((e["reserved"] for e in self.entries.values() if e["charge"] is None), ZERO)

    @property
    def remaining(self):
        return self.cap - self.spent - self.reserved

    def committed(self, prefix=""):
        """Spent plus open reservations for request ids with this prefix."""
        total = ZERO
        for request_id, entry in self.entries.items():
            if request_id.startswith(prefix):
                total += entry["reserved"] if entry["charge"] is None else entry["charge"]
        return total

    def unreconciled(self):
        """Request ids charged at their reserved maximum, awaiting the console figure."""
        return sorted(r for r, e in self.entries.items()
                      if e["charge"] is None or not e["reconciled"])

    def overruns(self):
        """Request ids whose settled charge is above their reservation.

        An overrun on file refuses every later start until the run config
        names the request id in `acknowledged_overruns`. A charge corrected
        by hand to its reservation or below is no longer an overrun.
        """
        return sorted(r for r, e in self.entries.items()
                      if e["charge"] is not None
                      and (e["charge"] > e["reserved"] or OVERRUN_FLAG in e["flags"]))

    def check(self, worst_case):
        if self.spent + self.reserved + worst_case > self.cap:
            raise CapExceeded(
                "%s cap reached: spent %s + reserved %s + this request %s is above %s USD"
                % (self.provider, self.spent, self.reserved, worst_case, self.cap),
                provider=self.provider)

    def reserve(self, request_id, worst_case_usd_amount, also=None):
        """Reserve the worst case of one request, as one step under the
        ledger lock: read the file again, add up spent plus reserved, check
        the cap, append, fsync. A second writer, in this process or another,
        waits for the lock and then sees this reservation.

        `also(worst_case)` is a further check run inside the same step,
        after the cap check and before anything is written; it refuses by
        raising.
        """
        worst_case = Decimal(str(worst_case_usd_amount))
        if not worst_case.is_finite() or worst_case < 0:
            raise LedgerError("invalid reservation")
        with self._locked():
            self._load()
            if request_id in self.entries:
                raise LedgerError("request id used twice: " + request_id)
            self.check(worst_case)
            if also is not None:
                also(worst_case)
            self._append({"event": "reserve", "request_id": request_id,
                          "usd": str(worst_case)})
            self.entries[request_id] = {"reserved": worst_case, "charge": None, "flags": [],
                                        "reconciled": True}
        return worst_case

    def settle(self, request_id, billable, receipt, zero_reason=None):
        """Reconcile one request to its actual charge.

        `zero_reason` settles the reservation to zero and records why, for a
        request that was never sent or that the provider rejected with an
        HTTP error status and so did not bill.
        Returns {"charge", "reserved", "flags", "reconciled"}.
        """
        with self._locked():
            self._load()
            entry = self.entries.get(request_id)
            if entry is None:
                raise LedgerError("no reservation for " + request_id)
            if entry["charge"] is not None:
                raise LedgerError("already settled: " + request_id)
            if zero_reason:
                charge, flags = ZERO, [str(zero_reason)]
            else:
                charge, flags = charge_usd(billable, receipt)
            reconciled = charge is not None
            if charge is None:
                charge = entry["reserved"]
                flags = flags + ["charged_at_reserved_maximum"]
            elif charge > entry["reserved"]:
                # Recorded here; the runner stops before the next request.
                flags = flags + [OVERRUN_FLAG]
            self._append({"event": "settle", "request_id": request_id, "usd": str(charge),
                          "reserved_usd": str(entry["reserved"]), "flags": flags,
                          "reconciled": reconciled})
            entry.update(charge=charge, flags=flags, reconciled=reconciled)
            return {"charge": charge, "reserved": entry["reserved"], "flags": flags,
                    "reconciled": reconciled}

    def reconcile(self, request_id, actual_usd, note):
        """Replace a charge with the provider console figure."""
        actual = Decimal(str(actual_usd))
        if not actual.is_finite() or actual < 0:
            raise LedgerError("invalid amount")
        with self._locked():
            self._load()
            entry = self.entries.get(request_id)
            if entry is None:
                raise LedgerError("no reservation for " + request_id)
            flags = ["reconciled_by_hand"]
            self._append({"event": "reconcile", "request_id": request_id, "usd": str(actual),
                          "flags": flags, "reconciled": True, "note": str(note)})
            entry.update(charge=actual, flags=flags, reconciled=True)


class Budget:
    """The provider ledgers for one run, plus the optional `--max-usd` cap.

    `--max-usd` is a lower cap on this run's own spending across providers.
    It can never raise a provider cap: both checks always apply.
    """

    def __init__(self, ledgers, run_id, max_usd=None):
        self.ledgers = dict(ledgers)
        self.run_prefix = run_id + "/"
        self.max_usd = None if max_usd is None else Decimal(str(max_usd))
        if self.max_usd is not None and (not self.max_usd.is_finite() or self.max_usd < 0):
            raise LedgerError("invalid --max-usd")

    def run_committed(self):
        return sum((ledger.committed(self.run_prefix) for ledger in self.ledgers.values()), ZERO)

    def reserve(self, provider, request_id, worst_case):
        worst_case = Decimal(str(worst_case))
        if not request_id.startswith(self.run_prefix):
            raise LedgerError("request id does not belong to this run")
        ledger = self.ledgers[provider]

        def within_max_usd(amount):
            # Runs inside the ledger's locked step, on figures just read
            # from disk, after the provider cap check.
            if self.max_usd is not None and self.run_committed() + amount > self.max_usd:
                raise CapExceeded(
                    "--max-usd reached: this run has committed %s and this request needs "
                    "%s, above %s USD" % (self.run_committed(), amount, self.max_usd),
                    provider=provider, scope="max-usd")
        return ledger.reserve(request_id, worst_case, also=within_max_usd)

    def settle(self, provider, request_id, billable, receipt, zero_reason=None):
        return self.ledgers[provider].settle(request_id, billable, receipt,
                                             zero_reason=zero_reason)

    def remaining(self):
        return {provider: ledger.remaining for provider, ledger in self.ledgers.items()}
