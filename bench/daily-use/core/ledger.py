"""The money ledger: no spending without a reservation.

One ledger per provider, shared by model calls and judge calls.

- `reserve(request_id, worst_case_usd)` runs before each request. The worst
  case is counted input tokens x input price + the output limit x output
  price. It raises `CapExceeded` when spent + reserved + the new reservation
  would pass the provider cap.
- `settle(request_id, billable, receipt)` reconciles to the actual charge at
  the frozen price receipt. Missing usage keeps the full reservation as the
  charge and flags the request.
- Every reserve and settle is appended to a JSONL file, flushed and fsynced
  before the call returns, so the reservation is on disk before the request
  is sent. A restart reloads the file; a reservation that was never settled
  stays counted in full.

Money is `decimal.Decimal` throughout and is written to disk as text.
"""

import datetime
import json
import math
import os
from decimal import Decimal

MTOK = Decimal(1000000)
ZERO = Decimal(0)


class CapExceeded(Exception):
    """The reservation would take spent plus reserved above a cap."""

    def __init__(self, message, provider=None, scope="provider"):
        super().__init__(message)
        self.provider = provider
        self.scope = scope


class LedgerError(Exception):
    """The ledger was used wrongly or its file is damaged."""


def count_input_tokens(text, tokeniser=None):
    """Count input tokens for a reservation.

    Without a tokeniser the count is the conservative ceil(len(text) / 3).
    """
    if tokeniser is not None:
        return int(tokeniser(text))
    return math.ceil(len(text) / 3)


def worst_case_usd(input_tokens, output_limit, receipt):
    """Input tokens x input price + the output limit x output price."""
    return (Decimal(input_tokens) * receipt.input_per_mtok
            + Decimal(output_limit) * receipt.output_per_mtok) / MTOK


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


class ProviderLedger:
    """The durable ledger for one provider."""

    def __init__(self, provider, cap_usd, path):
        self.provider = provider
        self.cap = Decimal(str(cap_usd))
        if not self.cap.is_finite() or self.cap < 0:
            raise LedgerError("invalid cap")
        self.path = os.fspath(path)
        self.entries = {}
        self._load()

    def _load(self):
        if not os.path.exists(self.path):
            return
        with open(self.path, encoding="utf-8") as stream:
            for number, line in enumerate(stream, 1):
                if not line.strip():
                    continue
                try:
                    event = json.loads(line)
                    kind = event["event"]
                    request_id = event["request_id"]
                    amount = Decimal(event["usd"])
                except (ValueError, KeyError, TypeError, ArithmeticError):
                    raise LedgerError(
                        "ledger for %s is damaged at line %d; repair it by hand before "
                        "any further spending" % (self.provider, number)) from None
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
                        % (self.provider, number))

    def _append(self, event):
        event = dict(event, provider=self.provider, at_utc=_now())
        os.makedirs(os.path.dirname(self.path) or ".", exist_ok=True)
        with open(self.path, "a", encoding="utf-8", newline="\n") as stream:
            stream.write(json.dumps(event, sort_keys=True) + "\n")
            stream.flush()
            os.fsync(stream.fileno())

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

    def check(self, worst_case):
        if self.spent + self.reserved + worst_case > self.cap:
            raise CapExceeded(
                "%s cap reached: spent %s + reserved %s + this request %s is above %s USD"
                % (self.provider, self.spent, self.reserved, worst_case, self.cap),
                provider=self.provider)

    def reserve(self, request_id, worst_case_usd_amount):
        worst_case = Decimal(str(worst_case_usd_amount))
        if not worst_case.is_finite() or worst_case < 0:
            raise LedgerError("invalid reservation")
        if request_id in self.entries:
            raise LedgerError("request id used twice: " + request_id)
        self.check(worst_case)
        self._append({"event": "reserve", "request_id": request_id, "usd": str(worst_case)})
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
            flags = flags + ["charge_above_reservation"]
        self._append({"event": "settle", "request_id": request_id, "usd": str(charge),
                      "reserved_usd": str(entry["reserved"]), "flags": flags,
                      "reconciled": reconciled})
        entry.update(charge=charge, flags=flags, reconciled=reconciled)
        return {"charge": charge, "reserved": entry["reserved"], "flags": flags,
                "reconciled": reconciled}

    def reconcile(self, request_id, actual_usd, note):
        """Replace a charge with the provider console figure."""
        entry = self.entries.get(request_id)
        if entry is None:
            raise LedgerError("no reservation for " + request_id)
        actual = Decimal(str(actual_usd))
        if not actual.is_finite() or actual < 0:
            raise LedgerError("invalid amount")
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
        ledger.check(worst_case)
        if self.max_usd is not None and self.run_committed() + worst_case > self.max_usd:
            raise CapExceeded(
                "--max-usd reached: this run has committed %s and this request needs %s, "
                "above %s USD" % (self.run_committed(), worst_case, self.max_usd),
                provider=provider, scope="max-usd")
        return ledger.reserve(request_id, worst_case)

    def settle(self, provider, request_id, billable, receipt, zero_reason=None):
        return self.ledgers[provider].settle(request_id, billable, receipt,
                                             zero_reason=zero_reason)

    def remaining(self):
        return {provider: ledger.remaining for provider, ledger in self.ledgers.items()}
