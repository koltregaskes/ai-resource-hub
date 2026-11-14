"""Run records: ids, staging, finalising, the allowlist and amendments."""

import datetime
import hashlib
import json
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import records  # noqa: E402
import test_run_support as support  # noqa: E402

HELD_OUT_PROMPT = "HELD-OUT PROMPT TEXT that must never be published"
HELD_OUT_REPLY = "HELD-OUT RAW ANSWER that must never be published"
PUBLIC_PROMPT = "Public prompt text"
PUBLIC_REPLY = "Public raw answer"


def row(run_id, model, task_id, repeat, split="public", outcome="answered", passed=True,
        pending=False):
    held = split == "held-out"
    slot = records.slot_id(run_id, model, task_id, repeat)
    return {
        "slot_id": slot, "model_id": model, "provider": "openai", "task_id": task_id,
        "family": 2, "split": split, "repeat": repeat,
        "prompt": HELD_OUT_PROMPT if held else PUBLIC_PROMPT,
        "reply": HELD_OUT_REPLY if held else PUBLIC_REPLY,
        "outcome": outcome, "pass": passed, "pending": pending, "truncated": False,
        "finish_reason": "completed", "flags": [],
        "tokens": {"input_tokens": 12, "output_tokens": 34}, "cost_usd": "0.0011",
        "judge_cost_usd": "0.0002",
        "timing": {"slot_time_seconds": 1.25, "first_token_seconds": None},
        "requests": [{"request_id": records.request_id(slot, 1), "status": "ok",
                      "http_status": 200, "error": None, "finish_reason": "completed",
                      "charge_usd": "0.0011", "request_time_seconds": 1.25,
                      "usage": {"input_tokens": 12, "output_tokens": 34},
                      "ledger_flags": []}],
        "judge_requests": [{"request_id": slot + "/judge/j/outcome/1",
                            "note": HELD_OUT_REPLY if held else "x"}],
        "judged": {"detail": HELD_OUT_REPLY if held else "public judge material"},
        "failure_reason": None,
    }


class IdentityTests(unittest.TestCase):
    def test_run_id_format(self):
        run_id = records.new_run_id()
        self.assertRegex(run_id, r"^\d{4}-\d{2}-\d{2}T\d{6}Z-[0-9a-f]{8}$")
        moment = datetime.datetime(2026, 11, 14, 18, 30, 5, tzinfo=datetime.timezone.utc)
        self.assertEqual(records.new_run_id(moment, "1a2b3c4d"), "2026-11-14T183005Z-1a2b3c4d")
        # Local times are converted to UTC.
        london_summer = datetime.timezone(datetime.timedelta(hours=1))
        moment = datetime.datetime(2026, 7, 1, 0, 30, 0, tzinfo=london_summer)
        self.assertEqual(records.new_run_id(moment, "00000000"), "2026-06-30T233000Z-00000000")
        self.assertNotEqual(records.new_run_id(), records.new_run_id())

    def test_slot_and_request_ids(self):
        slot = records.slot_id("RUN", "gpt-6.1-sol", "f2-pub-01", 3)
        self.assertEqual(slot, "RUN/gpt-6.1-sol/f2-pub-01/3")
        self.assertEqual(records.request_id(slot, 2), "RUN/gpt-6.1-sol/f2-pub-01/3/2")


class RecordTests(unittest.TestCase):
    def setUp(self):
        folder = tempfile.TemporaryDirectory()
        self.addCleanup(folder.cleanup)
        self.store = folder.name
        self.run_id = records.new_run_id()

    def record(self, stage="full", live=True, guard=None, run_id=None):
        record = records.RunRecord(self.store, run_id or self.run_id, stage, {
            "live": live, "task_set_version": "test", "seed": 7,
            "settings": [{"model_id": "m1"}], "judge_settings": [],
            "private_note": "PRIVATE RUN NOTE"}, guard=guard)
        self.addCleanup(record._log.close)
        return record

    def planned(self, record, specs):
        slots = [{"slot_id": records.slot_id(record.run_id, model, task_id, repeat),
                  "model_id": model, "task_id": task_id, "repeat": repeat}
                 for model, task_id, repeat in specs]
        record.plan(slots)
        return slots

    def log_lines(self, record):
        with open(os.path.join(record.dir, records.REQUEST_LOG), encoding="utf-8") as stream:
            return [json.loads(line) for line in stream]

    def complete(self, stage="full", live=True):
        record = self.record(stage=stage, live=live)
        self.planned(record, [("m1", "pub-1", 1), ("m1", "held-1", 1), ("m2", "pub-1", 1)])
        for model, task_id, split in (("m1", "pub-1", "public"), ("m1", "held-1", "held-out"),
                                      ("m2", "pub-1", "public")):
            data = row(record.run_id, model, task_id, 1, split=split)
            request = data["requests"][0]["request_id"]
            record.request_sent(request, {"reserved_usd": "0.1"})
            record.request_done(request, {"charge_usd": "0.0011"})
            record.slot_done(data)
        return record

    def test_staging_folder_and_status_file(self):
        record = self.record()
        self.assertEqual(record.dir, os.path.join(self.store, "runs", "_staging", self.run_id))
        self.assertTrue(os.path.isdir(record.dir))
        with open(os.path.join(record.dir, "run.json"), encoding="utf-8") as stream:
            status = json.load(stream)
        self.assertEqual((status["status"], status["publishable"]), ("running", False))
        record.close()

    def test_run_id_is_never_reused(self):
        self.record().close()
        with self.assertRaises(records.RecordError):
            self.record()

    def test_request_line_is_on_disk_before_the_request_is_sent(self):
        record = self.record()
        self.planned(record, [("m1", "pub-1", 1)])
        request = records.request_id(records.slot_id(self.run_id, "m1", "pub-1", 1), 1)
        record.request_sent(request, {"reserved_usd": "0.12318", "kind": "model"})
        # Read through a second handle while the run is still open: the line is there.
        lines = self.log_lines(record)
        self.assertEqual(lines[-1]["event"], "sent")
        self.assertEqual(lines[-1]["request_id"], request)
        self.assertEqual(lines[-1]["reserved_usd"], "0.12318")
        record.request_done(request, {"charge_usd": "0.004"})
        lines = self.log_lines(record)
        self.assertEqual([line["event"] for line in lines], ["sent", "done"])
        with self.assertRaises(records.RecordError):
            record.request_sent(request, {})                      # ids are never reused
        with self.assertRaises(records.RecordError):
            record.request_done("unknown/1", {})
        record.close()

    def test_a_crash_leaves_what_was_in_flight(self):
        record = self.record()
        self.planned(record, [("m1", "pub-1", 1)])
        request = records.request_id(records.slot_id(self.run_id, "m1", "pub-1", 1), 1)
        record.request_sent(request, {"reserved_usd": "0.1"})
        # No close, no response: simulate the crash by reading what is on disk.
        lines = self.log_lines(record)
        sent = {line["request_id"] for line in lines if line["event"] == "sent"}
        done = {line["request_id"] for line in lines if line["event"] == "done"}
        self.assertEqual(sent - done, {request})
        record.close()

    def test_finalise_is_refused_while_a_slot_is_pending(self):
        record = self.record()
        self.planned(record, [("m1", "pub-1", 1), ("m1", "pub-1", 2)])
        record.slot_done(row(self.run_id, "m1", "pub-1", 1))
        record.slot_done(row(self.run_id, "m1", "pub-1", 2, outcome="judge_unresolved",
                             passed=None, pending=True))
        with self.assertRaises(records.RecordError):
            record.finalise({"score": 1})
        self.assertFalse(record.finalised)
        self.assertFalse(record.publishable)
        self.assertEqual(record.status, "pending_judging")
        self.assertTrue(os.path.isdir(os.path.join(self.store, "runs", "_staging", self.run_id)))
        self.assertFalse(os.path.exists(os.path.join(self.store, "runs", self.run_id)))
        self.assertFalse(os.path.exists(os.path.join(self.store, "public")))
        # Once judging completes the pending slot may be stored again, then finalised.
        record.slot_done(row(self.run_id, "m1", "pub-1", 2))
        with self.assertRaises(records.RecordError):
            record.slot_done(row(self.run_id, "m1", "pub-1", 2, passed=False))
        self.assertTrue(record.finalise({"score": 1})["dir"].endswith(self.run_id))

    def test_finalise_is_refused_while_a_slot_is_unstarted(self):
        record = self.record()
        self.planned(record, [("m1", "pub-1", 1), ("m1", "pub-1", 2)])
        record.slot_done(row(self.run_id, "m1", "pub-1", 1))
        with self.assertRaises(records.RecordError):
            record.finalise({})
        self.assertEqual(record.status, "interrupted")
        self.assertFalse(record.publishable)

    def test_a_pass_that_is_not_true_or_false_is_not_final(self):
        record = self.record()
        self.planned(record, [("m1", "pub-1", 1)])
        record.slot_done(row(self.run_id, "m1", "pub-1", 1, passed=None))
        with self.assertRaises(records.RecordError):
            record.finalise({})

    def test_finalise_writes_a_manifest_of_sha256_and_moves_the_folder(self):
        record = self.complete()
        result = record.finalise({"day_to_day": 66.7})
        final = os.path.join(self.store, "runs", self.run_id)
        self.assertEqual(result["dir"], final)
        self.assertFalse(os.path.exists(os.path.join(self.store, "runs", "_staging", self.run_id)))
        with open(os.path.join(final, "manifest.json"), "rb") as stream:
            manifest_bytes = stream.read()
        manifest = json.loads(manifest_bytes)
        names = sorted(n for n in os.listdir(final) if n != "manifest.json")
        self.assertEqual(names, ["plan.json", "requests.jsonl", "run.json", "scores.json",
                                 "slots.json"])
        self.assertEqual(sorted(manifest["files"]), names)
        for name in names:
            with open(os.path.join(final, name), "rb") as stream:
                self.assertEqual(manifest["files"][name],
                                 hashlib.sha256(stream.read()).hexdigest())
        self.assertEqual(result["manifest_sha256"], hashlib.sha256(manifest_bytes).hexdigest())
        self.assertEqual(records.verify_manifest(final), result["manifest_sha256"])
        with open(os.path.join(final, "scores.json"), encoding="utf-8") as stream:
            self.assertEqual(json.load(stream), {"day_to_day": 66.7})   # injected, not computed
        with open(os.path.join(final, "run.json"), encoding="utf-8") as stream:
            document = json.load(stream)
        self.assertEqual((document["status"], document["publishable"]), ("finalised", True))
        self.assertTrue(record.publishable)

    def test_a_finalised_folder_is_never_written_to_again(self):
        record = self.complete()
        result = record.finalise({})
        before = support.read_everything(result["dir"])
        slot = records.slot_id(self.run_id, "m1", "pub-1", 1)
        for action in (lambda: record.request_sent(slot + "/9", {}),
                       lambda: record.slot_done(row(self.run_id, "m9", "pub-1", 1)),
                       lambda: record.write_json("extra.json", {}),
                       lambda: record.mark_interrupted("late"),
                       lambda: record.finalise({})):
            with self.assertRaises((records.RecordError, ValueError)):
                action()
        self.assertEqual(support.read_everything(result["dir"]), before)
        records.verify_manifest(result["dir"])
        # A tampered file is caught.
        with open(os.path.join(result["dir"], "scores.json"), "a", encoding="utf-8") as stream:
            stream.write(" ")
        with self.assertRaises(records.RecordError):
            records.verify_manifest(result["dir"])

    def test_public_record_keeps_only_the_allowlist_for_held_out_tasks(self):
        record = self.complete()
        result = record.finalise({"day_to_day": 66.7})
        public = result["public_record"]
        text = json.dumps(public)
        self.assertNotIn(HELD_OUT_PROMPT, text)
        self.assertNotIn(HELD_OUT_REPLY, text)
        self.assertNotIn("PRIVATE RUN NOTE", text)
        slots = public["models"]["m1"]["slots"]
        held = [s for s in slots if s["task_id"] == "held-1"][0]
        self.assertEqual(sorted(held), sorted(
            ["task_id", "family", "outcome", "pass", "tokens", "cost_usd", "timing"]))
        self.assertEqual(held["tokens"], {"input_tokens": 12, "output_tokens": 34})
        shown = [s for s in slots if s["task_id"] == "pub-1"][0]
        self.assertEqual(shown["prompt"], PUBLIC_PROMPT)
        self.assertEqual(shown["reply"], PUBLIC_REPLY)
        self.assertNotIn("judge_requests", shown)
        self.assertNotIn("ledger_flags", shown["requests"][0])
        self.assertEqual(public["manifest_sha256"], result["manifest_sha256"])
        self.assertEqual(public["scores"], {"day_to_day": 66.7})
        # The public record sits outside the finalised folder, and matches what was returned.
        self.assertEqual(result["public_path"], os.path.join(
            self.store, "public", self.run_id, "public-record.json"))
        with open(result["public_path"], encoding="utf-8") as stream:
            self.assertEqual(json.load(stream), json.loads(json.dumps(public)))
        self.assertNotIn(HELD_OUT_PROMPT, support.read_everything(
            os.path.join(self.store, "public")))
        # The private record still holds everything.
        self.assertIn(HELD_OUT_PROMPT, support.read_everything(result["dir"]))

    def test_public_record_refuses_unknown_splits_and_leaks(self):
        document = {"run_id": "R", "stage": "full", "live": True}
        odd = row("R", "m1", "x", 1)
        odd["split"] = "mystery"
        with self.assertRaises(records.RecordError):
            records.build_public_record(document, [odd], {}, "0" * 64)
        held = row("R", "m1", "held-1", 1, split="held-out")
        with self.assertRaises(records.RecordError):
            records.build_public_record(document, [held], {"note": HELD_OUT_PROMPT}, "0" * 64)

    def test_canary_and_dry_runs_are_never_publishable(self):
        canary = self.complete(stage="canary")
        result = canary.finalise({})
        self.assertFalse(canary.publishable)
        self.assertIsNone(result["public_record"])
        self.assertFalse(os.path.exists(os.path.join(self.store, "public")))
        self.run_id = records.new_run_id()
        dry = self.complete(live=False)
        result = dry.finalise({})
        self.assertFalse(dry.publishable)
        self.assertFalse(result["public_record"]["publishable"])
        self.assertFalse(result["public_record"]["live"])

    def test_interrupted_run_stays_in_staging_and_is_not_publishable(self):
        record = self.record()
        self.planned(record, [("m1", "pub-1", 1), ("m1", "pub-1", 2), ("m1", "pub-1", 3),
                              ("m2", "pub-1", 1), ("m2", "pub-1", 2)])
        record.slot_done(row(self.run_id, "m1", "pub-1", 1))
        record.slot_done(row(self.run_id, "m1", "pub-1", 2, outcome="execution_error",
                             passed=False))
        record.mark_interrupted("interrupted by cap: openai cap reached", "openai")
        with self.assertRaises(records.RecordError):
            record.finalise({})
        record.close()
        self.assertFalse(record.publishable)
        staging = os.path.join(self.store, "runs", "_staging", self.run_id)
        with open(os.path.join(staging, "run.json"), encoding="utf-8") as stream:
            status = json.load(stream)
        self.assertEqual(status["status"], "interrupted")
        self.assertFalse(status["publishable"])
        self.assertFalse(os.path.exists(os.path.join(self.store, "runs", self.run_id)))
        report = record.report()
        self.assertEqual(report["stopped_providers"], ["openai"])
        self.assertEqual(report["models"]["m1"]["planned"], 3)
        self.assertEqual(report["models"]["m1"]["attempted"], 2)
        self.assertEqual(report["models"]["m1"]["unstarted"], 1)
        self.assertEqual(report["models"]["m1"]["unstarted_slots"],
                         [records.slot_id(self.run_id, "m1", "pub-1", 3)])
        self.assertEqual((report["models"]["m2"]["planned"], report["models"]["m2"]["attempted"],
                          report["models"]["m2"]["unstarted"]), (2, 0, 2))
        self.assertEqual(status["report"], json.loads(json.dumps(report)))

    def test_guard_refuses_to_write_a_key_value(self):
        guard = lambda text: support.FAKE_OPENAI_KEY in text  # noqa: E731
        record = self.record(guard=guard)
        self.planned(record, [("m1", "pub-1", 1)])
        slot = records.slot_id(self.run_id, "m1", "pub-1", 1)
        with self.assertRaises(records.RecordError):
            record.request_sent(slot + "/1", {"headers": {"Authorization":
                                                           "Bearer " + support.FAKE_OPENAI_KEY}})
        leaky = row(self.run_id, "m1", "pub-1", 1)
        leaky["reply"] = "echo " + support.FAKE_OPENAI_KEY
        with self.assertRaises(records.RecordError):
            record.slot_done(leaky)
        record.close()
        self.assertNotIn(support.FAKE_OPENAI_KEY, support.read_everything(self.store))

    def test_plan_is_written_once_with_unique_slots(self):
        record = self.record()
        with self.assertRaises(records.RecordError):
            self.planned(record, [("m1", "pub-1", 1), ("m1", "pub-1", 1)])
        self.planned(record, [("m1", "pub-1", 1)])
        with self.assertRaises(records.RecordError):
            self.planned(record, [("m1", "pub-1", 2)])
        record.close()


class AmendmentTests(unittest.TestCase):
    def setUp(self):
        folder = tempfile.TemporaryDirectory()
        self.addCleanup(folder.cleanup)
        self.store = folder.name
        self.run_id = records.new_run_id()
        record = records.RunRecord(self.store, self.run_id, "full", {"live": True})
        slot = records.slot_id(self.run_id, "m1", "pub-1", 1)
        record.plan([{"slot_id": slot, "model_id": "m1", "task_id": "pub-1", "repeat": 1}])
        record.slot_done(row(self.run_id, "m1", "pub-1", 1))
        self.final = record.finalise({"day_to_day": 100})

    def test_amendments_go_to_their_own_tree_with_the_original_manifest_hash(self):
        before = support.read_everything(self.final["dir"])
        first = records.write_amendment(
            self.store, self.run_id, [{"slot_id": "x", "check": "c1", "from": "pass",
                                       "to": "fail"}],
            "grading mistake in c1", "Claude (AI Resource Hub session)", {"day_to_day": 66.7})
        second = records.write_amendment(
            self.store, self.run_id, [], "second look", "Reviewer", {"day_to_day": 66.7})
        self.assertEqual(first["path"], os.path.join(
            self.store, "amendments", self.run_id, "1", "amendment.json"))
        self.assertEqual(second["amendment"], 2)
        self.assertTrue(os.path.isfile(os.path.join(
            self.store, "amendments", self.run_id, "2", "amendment.json")))
        with open(first["path"], encoding="utf-8") as stream:
            document = json.load(stream)
        self.assertEqual(document["original_manifest_sha256"], self.final["manifest_sha256"])
        self.assertEqual(document["reason"], "grading mistake in c1")
        self.assertEqual(document["changed_by"], "Claude (AI Resource Hub session)")
        self.assertEqual(document["recomputed_scores"], {"day_to_day": 66.7})
        self.assertEqual(document["run_id"], self.run_id)
        # The finalised folder is exactly as it was, and amendments sit outside runs/.
        self.assertEqual(support.read_everything(self.final["dir"]), before)
        records.verify_manifest(self.final["dir"])
        self.assertNotIn("amendments", os.listdir(os.path.join(self.store, "runs")))

    def test_amendment_needs_a_finalised_run_a_reason_and_an_author(self):
        with self.assertRaises(records.RecordError):
            records.write_amendment(self.store, "no-such-run", [], "r", "a", {})
        with self.assertRaises(records.RecordError):
            records.write_amendment(self.store, self.run_id, [], "", "a", {})
        with self.assertRaises(records.RecordError):
            records.write_amendment(self.store, self.run_id, [], "r", "", {})
        self.assertFalse(os.path.exists(os.path.join(self.store, "amendments")))

    def test_amendment_is_refused_when_the_original_was_tampered_with(self):
        with open(os.path.join(self.final["dir"], "slots.json"), "a", encoding="utf-8") as stream:
            stream.write(" ")
        with self.assertRaises(records.RecordError):
            records.write_amendment(self.store, self.run_id, [], "r", "a", {})


if __name__ == "__main__":
    unittest.main()
