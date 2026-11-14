"""Run records: identity, staging, finalising, the public record, amendments.

Layout inside the private store (a path given at run time, outside the repo):

    runs/_staging/<run id>/     a run in progress, interrupted or pending
    runs/<run id>/              a finalised run, never written to again
    amendments/<run id>/<n>/    corrections, each written once
    public/<run id>/            the public record built through the allowlist

- A run id is `<UTC date>T<UTC time>-<8 hex>`; a slot id is
  `<run id>/<model id>/<task id>/<repeat>`; a request id is the slot id plus
  the request number. Ids are never reused.
- Before a request is sent, a line with its id and reservation is appended
  to `requests.jsonl`, flushed and fsynced. The response is appended when it
  arrives. A crash leaves a record of what was in flight.
- Finalising happens only when every planned slot has a final outcome and
  pass and nothing is pending. Scores are injected; this module computes
  none. The manifest holds a SHA-256 of every file, taken from the bytes as
  they were written.
- The public record is built by an allowlist. For held-out tasks it carries
  only the task id, family, outcome, pass, tokens, cost and timing.
"""

import datetime
import hashlib
import json
import os
import secrets as _random

FINAL_OUTCOMES = ("answered", "abstained", "refused", "malformed", "execution_error")
REQUEST_LOG = "requests.jsonl"
MANIFEST = "manifest.json"

HELD_OUT_FIELDS = ("task_id", "family", "outcome", "pass", "tokens", "cost_usd", "timing")
PUBLIC_FIELDS = HELD_OUT_FIELDS + (
    "split", "repeat", "slot_id", "prompt", "reply", "finish_reason", "truncated",
    "flags", "requests", "judge_cost_usd", "judged", "needed_judge_classification",
)
PUBLIC_REQUEST_FIELDS = ("request_id", "status", "http_status", "error", "finish_reason",
                         "charge_usd", "request_time_seconds", "usage")
PUBLIC_RUN_FIELDS = ("run_id", "stage", "live", "status", "publishable", "task_set_version",
                     "seed", "started_utc", "finalised_utc", "config_sha256", "settings",
                     "judge_settings", "report")


class RecordError(Exception):
    """A run record rule was broken. Nothing was written past the rule."""


def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)


def stamp(moment=None):
    return (moment or utc_now()).strftime("%Y-%m-%dT%H:%M:%SZ")


def new_run_id(moment=None, token=None):
    """`<UTC date>T<UTC time>-<8 random hex characters>`, for example
    `2026-11-14T183000Z-1a2b3c4d`. The time has no colons so the id is a
    valid folder name on Windows."""
    moment = moment or utc_now()
    token = token or _random.token_hex(4)
    return "%s-%s" % (moment.astimezone(datetime.timezone.utc).strftime("%Y-%m-%dT%H%M%SZ"),
                      token)


def slot_id(run_id, model_id, task_id, repeat):
    return "%s/%s/%s/%d" % (run_id, model_id, task_id, repeat)


def request_id(slot, number):
    return "%s/%d" % (slot, number)


def _dump(value):
    return (json.dumps(value, indent=2, sort_keys=True, default=str) + "\n").encode("utf-8")


def _line(value):
    return (json.dumps(value, sort_keys=True, default=str) + "\n").encode("utf-8")


def _sha(data):
    return hashlib.sha256(data).hexdigest()


class RunRecord:
    """One run's record while it is in staging.

    `guard(text)` is called on everything before it is written and must
    return True when the text holds a key; the write is then refused.
    """

    def __init__(self, private_store, run_id, stage, meta, guard=None):
        self.private_store = os.fspath(private_store)
        self.run_id = run_id
        self.stage = stage
        self.meta = dict(meta)
        self.guard = guard
        self.dir = os.path.join(self.private_store, "runs", "_staging", run_id)
        self.final_dir = os.path.join(self.private_store, "runs", run_id)
        if os.path.exists(self.dir) or os.path.exists(self.final_dir):
            raise RecordError("run id already used: " + run_id)
        os.makedirs(self.dir)
        self.status = "running"
        self.finalised = False
        self.stopped_providers = []
        self.interrupt_reason = None
        self.planned = []
        self.rows = {}
        self.extra_files = {}
        self._issued = set()
        self._hashes = {}
        self._log_hash = hashlib.sha256()
        self._log = open(os.path.join(self.dir, REQUEST_LOG), "ab")
        self.started_utc = stamp()
        self._write_status()

    # ---- writing -------------------------------------------------------

    def _check(self, data):
        if self.finalised:
            raise RecordError("run %s is finalised; it is never written to again" % self.run_id)
        if self.guard is not None and self.guard(data.decode("utf-8")):
            raise RecordError("a key value was about to be written to the run record; refused")

    def _write(self, name, data):
        self._check(data)
        with open(os.path.join(self.dir, name), "wb") as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        self._hashes[name] = _sha(data)

    def _append(self, value):
        data = _line(value)
        self._check(data)
        self._log.write(data)
        self._log.flush()
        os.fsync(self._log.fileno())
        self._log_hash.update(data)

    def _write_status(self):
        self._write("run.json", _dump(self._run_document()))

    def _run_document(self):
        return dict(self.meta, run_id=self.run_id, stage=self.stage, status=self.status,
                    publishable=self.publishable, started_utc=self.started_utc,
                    interrupt_reason=self.interrupt_reason,
                    stopped_providers=list(self.stopped_providers), report=self.report())

    def write_json(self, name, value):
        """Write an extra file into staging (for example the qualification
        result). It is hashed into the manifest at finalise."""
        if name in ("run.json", "slots.json", "scores.json", "plan.json", MANIFEST, REQUEST_LOG):
            raise RecordError("reserved file name: " + name)
        self._write(name, _dump(value))
        self.extra_files[name] = True

    # ---- the plan and the requests -------------------------------------

    def plan(self, slots):
        """Record every planned slot: [{"slot_id", "model_id", "task_id",
        "repeat", ...}]."""
        if self.planned:
            raise RecordError("the plan is written once")
        ids = [slot["slot_id"] for slot in slots]
        if len(set(ids)) != len(ids):
            raise RecordError("a slot id appears twice in the plan")
        self.planned = [dict(slot) for slot in slots]
        self._write("plan.json", _dump(self.planned))
        self._write_status()

    def request_sent(self, request, payload):
        """Append the before-send line. Must be called before the request
        leaves; the line is on disk when this returns."""
        if request in self._issued:
            raise RecordError("request id used twice: " + request)
        self._issued.add(request)
        self._append(dict(payload, event="sent", request_id=request, at_utc=stamp()))

    def request_done(self, request, payload):
        if request not in self._issued:
            raise RecordError("no sent line for request " + request)
        self._append(dict(payload, event="done", request_id=request, at_utc=stamp()))

    def slot_done(self, row):
        """Store the row for one slot. A pending slot may be stored again
        once its judging completes; a final slot may not be changed."""
        slot = row["slot_id"]
        earlier = self.rows.get(slot)
        if earlier is not None and not earlier.get("pending"):
            raise RecordError("slot already has a final result: " + slot)
        self._append({"event": "slot", "slot": row, "at_utc": stamp()})
        self.rows[slot] = dict(row)

    # ---- status --------------------------------------------------------

    @property
    def publishable(self):
        return bool(self.finalised and self.meta.get("live") and self.stage == "full")

    def mark_interrupted(self, reason, stopped_provider=None):
        if self.finalised:
            raise RecordError("run %s is finalised; it is never written to again" % self.run_id)
        self.status = "interrupted"
        self.interrupt_reason = reason
        if stopped_provider and stopped_provider not in self.stopped_providers:
            self.stopped_providers.append(stopped_provider)
        self._write_status()

    def pending_slots(self):
        return sorted(s for s, row in self.rows.items() if not _is_final(row))

    def unstarted_slots(self):
        return [slot["slot_id"] for slot in self.planned if slot["slot_id"] not in self.rows]

    def report(self):
        """Planned, attempted and unstarted slots per model, and any
        stopped provider."""
        models = {}
        for slot in self.planned:
            entry = models.setdefault(slot["model_id"], {
                "planned": 0, "attempted": 0, "unstarted": 0, "pending": 0,
                "unstarted_slots": []})
            entry["planned"] += 1
            row = self.rows.get(slot["slot_id"])
            if row is None:
                entry["unstarted"] += 1
                entry["unstarted_slots"].append(slot["slot_id"])
            else:
                entry["attempted"] += 1
                if not _is_final(row):
                    entry["pending"] += 1
        return {"models": models, "stopped_providers": list(self.stopped_providers),
                "interrupt_reason": self.interrupt_reason, "status": self.status}

    def close(self):
        """Leave the run in staging, with its status on disk."""
        if self.finalised:
            return
        if self.status == "running":
            if self.unstarted_slots():
                self.status = "interrupted"
                self.interrupt_reason = self.interrupt_reason or "stopped before every slot started"
            elif self.pending_slots():
                self.status = "pending_judging"
            else:
                self.status = "complete"
        self._write_status()
        self._log.close()

    # ---- finalising ----------------------------------------------------

    def finalise(self, scores, build_public=None):
        """Finalise the run: scores (injected), the manifest, the move to
        `runs/<run id>/`, then the public record through the allowlist.

        Refused while a slot is unstarted or pending, or after an interrupt.
        Returns {"dir", "manifest_sha256", "public_record", "public_path"}.
        """
        if self.finalised:
            raise RecordError("run %s is already finalised" % self.run_id)
        if self.status == "interrupted":
            self._write_status()
            raise RecordError("an interrupted run is never finalised")
        if self.unstarted_slots() or self.pending_slots():
            self.status = "pending_judging" if not self.unstarted_slots() else "interrupted"
            self._write_status()
            raise RecordError("run has slots that are unstarted or pending; it stays in staging")
        if os.path.exists(self.final_dir):
            raise RecordError("a finalised folder already exists for " + self.run_id)
        rows = [self.rows[slot["slot_id"]] for slot in self.planned]
        self.status = "finalised"
        finalised_utc = stamp()
        document = self._run_document()
        document["finalised_utc"] = finalised_utc
        will_publish = bool(self.meta.get("live") and self.stage == "full")
        if build_public is None:
            # A dry full run builds the record too, as a rehearsal of the
            # allowlist. It is marked not publishable and not live.
            build_public = self.stage == "full"
        document["publishable"] = will_publish
        self._write("slots.json", _dump(rows))
        self._write("scores.json", _dump(scores if scores is not None else {}))
        self._write("run.json", _dump(document))
        self._log.close()
        self._hashes[REQUEST_LOG] = self._log_hash.hexdigest()
        for name, digest in sorted(self._hashes.items()):
            with open(os.path.join(self.dir, name), "rb") as stream:
                if _sha(stream.read()) != digest:
                    raise RecordError("file changed on disk after it was written: " + name)
        manifest = _dump({"run_id": self.run_id, "created_utc": finalised_utc,
                          "files": dict(sorted(self._hashes.items()))})
        self._check(manifest)
        with open(os.path.join(self.dir, MANIFEST), "wb") as stream:
            stream.write(manifest)
            stream.flush()
            os.fsync(stream.fileno())
        os.rename(self.dir, self.final_dir)
        self.finalised = True
        self.dir = self.final_dir
        result = {"dir": self.final_dir, "manifest_sha256": _sha(manifest),
                  "public_record": None, "public_path": None}
        if build_public:
            public = build_public_record(document, rows, scores, result["manifest_sha256"])
            data = _dump(public)
            if self.guard is not None and self.guard(data.decode("utf-8")):
                raise RecordError("a key value was about to be published; refused")
            folder = os.path.join(self.private_store, "public", self.run_id)
            os.makedirs(folder)
            path = os.path.join(folder, "public-record.json")
            with open(path, "xb") as stream:
                stream.write(data)
            result.update(public_record=public, public_path=path)
        return result


def _is_final(row):
    return (row.get("outcome") in FINAL_OUTCOMES and isinstance(row.get("pass"), bool)
            and not row.get("pending"))


def _strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for key, child in value.items():
            yield str(key)
            yield from _strings(child)
    elif isinstance(value, (list, tuple)):
        for child in value:
            yield from _strings(child)


def build_public_record(run_document, rows, scores, manifest_sha256):
    """Build the public record through the allowlist.

    Held-out slots keep only task id, family, outcome, pass, tokens, cost
    and timing, grouped under their model. Public slots also keep the
    prompt, the raw answer and the request trail. Nothing else is copied:
    a field that is not on a list is dropped.

    As a second check, the finished record is searched for every held-out
    prompt and answer; finding one raises instead of publishing.
    """
    public = {name: run_document[name] for name in PUBLIC_RUN_FIELDS if name in run_document}
    public["manifest_sha256"] = manifest_sha256
    public["scores"] = scores if scores is not None else {}
    public["models"] = {}
    withheld = []
    for row in rows:
        split = row.get("split")
        if split == "held-out":
            kept = {name: row[name] for name in HELD_OUT_FIELDS if name in row}
            for name in ("prompt", "reply"):
                if isinstance(row.get(name), str) and len(row[name]) >= 12:
                    withheld.append(row[name])
        elif split == "public":
            kept = {name: row[name] for name in PUBLIC_FIELDS if name in row}
            kept["requests"] = [{name: item[name] for name in PUBLIC_REQUEST_FIELDS
                                 if name in item} for item in row.get("requests", [])]
        else:
            raise RecordError("slot has an unknown split; nothing published")
        public["models"].setdefault(row["model_id"], {"slots": []})["slots"].append(kept)
    text = [s for s in _strings(public)]
    for secret_text in withheld:
        if any(secret_text in s for s in text):
            raise RecordError("held-out material found in the public record; nothing published")
    return public


def verify_manifest(run_dir):
    """Recompute every hash in a finalised folder. Returns the manifest's
    own SHA-256; raises when a file is missing, changed or unlisted."""
    with open(os.path.join(run_dir, MANIFEST), "rb") as stream:
        data = stream.read()
    manifest = json.loads(data)
    listed = manifest["files"]
    present = sorted(n for n in os.listdir(run_dir) if n != MANIFEST)
    if present != sorted(listed):
        raise RecordError("files in the folder do not match the manifest")
    for name, digest in listed.items():
        with open(os.path.join(run_dir, name), "rb") as stream:
            if _sha(stream.read()) != digest:
                raise RecordError("file does not match the manifest: " + name)
    return _sha(data)


def write_amendment(private_store, run_id, changed_verdicts, reason, author, scores):
    """Write correction `<n>` for a finalised run, in its own tree.

    The finalised folder is read, never written. The amendment holds the
    changed verdicts, the reason, who made the change, the recomputed scores
    (injected) and the hash of the original manifest. Each amendment is
    written once; a further correction is the next number.
    """
    run_dir = os.path.join(os.fspath(private_store), "runs", run_id)
    if not os.path.isfile(os.path.join(run_dir, MANIFEST)):
        raise RecordError("no finalised run to amend: " + run_id)
    if not reason or not author:
        raise RecordError("an amendment needs a reason and an author")
    manifest_sha = verify_manifest(run_dir)
    tree = os.path.join(os.fspath(private_store), "amendments", run_id)
    os.makedirs(tree, exist_ok=True)
    numbers = [int(name) for name in os.listdir(tree) if name.isdigit()]
    number = max(numbers, default=0) + 1
    folder = os.path.join(tree, str(number))
    os.makedirs(folder)
    document = {
        "run_id": run_id, "amendment": number, "original_manifest_sha256": manifest_sha,
        "changed_verdicts": changed_verdicts, "reason": reason, "changed_by": author,
        "recomputed_scores": scores, "written_utc": stamp(),
    }
    path = os.path.join(folder, "amendment.json")
    with open(path, "xb") as stream:
        stream.write(_dump(document))
        stream.flush()
        os.fsync(stream.fileno())
    return {"path": path, "amendment": number, "original_manifest_sha256": manifest_sha}
