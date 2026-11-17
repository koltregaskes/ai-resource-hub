"""The seam between the run path and the other bench modules.

The loader, the graders and the scorer are separate modules that may not be
on this branch, so the run path imports them lazily. These tests put stub
modules with the same interfaces in their place and prove two things: the
runner calls them the way they expect, and the slot records it writes can
be handed straight to the scorer.

The stubs follow the real interfaces:

  core.tasks.load_tasks(public_dir, held_out_dir=None, *, manifest_path=None)
  core.outcome.decide(task, reply, judge_verdicts=None)
      -> {"outcome", "pass", "pending", "detail"}
  core.graders.grade(task, reply) -> a result with `.status` and `.checks`
  core.graders.apply_judge_verdicts(result, verdicts_by_judge)
  core.scores.score_run(slots)

Every transport here is a fake.
"""

import dataclasses
import json
import os
import sys
import tempfile
import types
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import cli  # noqa: E402
import judges  # noqa: E402
import runner  # noqa: E402
import test_run_support as support  # noqa: E402
from test_run_support import ScriptedTransport, prompt_of, reply_body  # noqa: E402

QUIET = lambda line: None  # noqa: E731
SCORE_FIELDS = ("model", "task_id", "family", "split", "repeat", "outcome", "pass",
                "truncated", "time_s", "cost_usd")


# ---- stub modules ---------------------------------------------------------

class CheckResult:
    def __init__(self, check_id, text, by, status):
        self.id, self.text, self.by, self.status = check_id, text, by, status


class GradeResult:
    def __init__(self, status, failed_by=None, checks=()):
        self.status, self.failed_by, self.checks = status, failed_by, list(checks)
        self.detail, self.malformed = "", False


def stub_score_run(slots, allow_pending=False):
    """The record rules of the real scorer, restated: required fields and
    their types, and a `checks` list whose AND is the slot's pass."""
    seen = {}
    for slot in slots:
        missing = [name for name in SCORE_FIELDS if name not in slot]
        if missing:
            raise ValueError("missing field(s) " + ", ".join(missing))
        if not isinstance(slot["model"], str) or not isinstance(slot["task_id"], str):
            raise ValueError("model and task_id must be text")
        if type(slot["family"]) is not int or slot["family"] not in range(1, 8):
            raise ValueError("family must be an integer 1 to 7")
        if slot["split"] not in ("public", "held-out") or slot["repeat"] not in (1, 2, 3):
            raise ValueError("bad split or repeat")
        outcome, passed = slot["outcome"], slot["pass"]
        if outcome not in ("answered", "abstained", "refused", "malformed", "execution_error",
                           "judge_unresolved"):
            raise ValueError("unknown outcome %r" % (outcome,))
        if passed is not None and not isinstance(passed, bool):
            raise ValueError("pass must be true, false or None")
        if outcome == "judge_unresolved" and passed is not None:
            raise ValueError("judge_unresolved needs a pending pass")
        if passed is True and outcome not in ("answered", "abstained"):
            raise ValueError("this outcome can never pass")
        if passed is None and not allow_pending:
            raise ValueError("a pending slot cannot be scored")
        if not isinstance(slot["truncated"], bool):
            raise ValueError("truncated must be true or false")
        for name, optional in (("time_s", True), ("cost_usd", False)):
            value = slot[name]
            if value is None and optional:
                continue
            if isinstance(value, bool) or not isinstance(value, (int, float)) or value < 0:
                raise ValueError(name + " must be a number, zero or more")
        if not isinstance(slot.get("needed_judge_classification", False), bool):
            raise ValueError("needed_judge_classification must be true or false")
        checks = slot.get("checks", [])
        if not isinstance(checks, list):
            raise ValueError("checks must be a list")
        if checks and outcome != "answered":
            raise ValueError("checks are only valid on an answered slot")
        states, ids = set(), set()
        for check in checks:
            if set(check) != {"id", "by", "state"} or not isinstance(check["id"], str):
                raise ValueError("a check is {id, by, state}")
            if check["id"] in ids:
                raise ValueError("duplicate check id")
            ids.add(check["id"])
            if check["by"] not in ("script", "judge"):
                raise ValueError("by must be script or judge")
            if check["state"] not in ("pass", "fail", "disputed", "unresolved"):
                raise ValueError("unknown state")
            if check["by"] == "script" and check["state"] in ("disputed", "unresolved"):
                raise ValueError("a script check is never disputed or unresolved")
            states.add(check["state"])
        if checks:
            if "unresolved" in states:
                expected = None
            elif states & {"fail", "disputed"}:
                expected = False
            else:
                expected = True
            if passed is not expected:
                raise ValueError("pass is not the AND of the checks")
        seen.setdefault((slot["model"], slot["task_id"]), []).append(slot["repeat"])
    for key, repeats in seen.items():
        if sorted(repeats) != [1, 2, 3]:
            raise ValueError("a task needs repeats 1, 2 and 3")
    return {"scored_slots": len(slots), "models": sorted({slot["model"] for slot in slots})}


class Stubs:
    """Stub `core.outcome`, `core.graders`, `core.scores` and `core.tasks`."""

    def __init__(self):
        self.decide_calls = []
        self.verdicts_seen = []
        self.load_calls = []
        self.loaded = []
        graders = types.ModuleType("core.graders")
        graders.grade = self.grade
        graders.apply_judge_verdicts = self.apply_judge_verdicts
        outcome = types.ModuleType("core.outcome")
        outcome.decide = self.decide
        scores = types.ModuleType("core.scores")
        scores.score_run = stub_score_run
        tasks = types.ModuleType("core.tasks")
        tasks.load_tasks = self.load_tasks
        package = types.ModuleType("core")
        package.__path__ = []
        self.modules = {"core": package, "core.graders": graders, "core.outcome": outcome,
                        "core.scores": scores, "core.tasks": tasks}

    def patch(self, **replace):
        return mock.patch.dict(sys.modules, dict(self.modules, **replace))

    # core.graders
    def grade(self, task, reply):
        params = task["grader"]
        if params["type"] != "checklist":
            good = reply.strip() == task.get("expected")
            return GradeResult("passed" if good else "failed", None if good else "script")
        checks, script_failed = [], False
        for check in params["checks"]:
            if check["by"] == "script":
                good = check["script"]["contains"] in reply
                script_failed = script_failed or not good
                checks.append(CheckResult(check["id"], check["text"], "script",
                                          "passed" if good else "failed"))
            else:
                checks.append(CheckResult(check["id"], check["text"], "judge", "needs_judge"))
        if script_failed:
            for check in checks:
                if check.by == "judge":
                    check.status = "not_run"
            return GradeResult("failed", "script", checks)
        if any(check.by == "judge" for check in checks):
            return GradeResult("needs_judge", None, checks)
        return GradeResult("passed", None, checks)

    def apply_judge_verdicts(self, result, verdicts_by_judge):
        self.verdicts_seen.append(json.loads(json.dumps(verdicts_by_judge)))
        if result.status == "failed" and result.failed_by == "script":
            return result
        checks = []
        for check in result.checks:
            if check.by != "judge":
                checks.append(CheckResult(check.id, check.text, check.by, check.status))
                continue
            votes = [verdicts.get(check.id) for verdicts in verdicts_by_judge.values()]
            if len(votes) < 2 or any(not isinstance(vote, bool) for vote in votes):
                status = "judge_unresolved"
            elif all(votes):
                status = "passed"
            elif not any(votes):
                status = "failed"
            else:
                status = "disputed"
            checks.append(CheckResult(check.id, check.text, "judge", status))
        if any(check.status == "judge_unresolved" for check in checks):
            return GradeResult("pending", None, checks)
        if any(check.status in ("failed", "disputed") for check in checks):
            return GradeResult("failed", "judge", checks)
        return GradeResult("passed", None, checks)

    # core.outcome
    @staticmethod
    def _decision(outcome, passed, pending_on, reason, grade=None):
        waiting = [] if grade is None else [
            {"check_id": c.id, "text": c.text} for c in grade.checks
            if c.status in ("needs_judge", "judge_unresolved")]
        return {"outcome": outcome, "pass": passed, "pending": bool(pending_on),
                "detail": {"reason": reason, "pending_on": pending_on, "needs_judge": waiting,
                           "grader_status": None if grade is None else grade.status,
                           "grader_detail": None}}

    @staticmethod
    def _classify(reply):
        if "UNCLEAR" in reply:
            return "needs_judge"
        return "abstained" if "I don't know" in reply else "answered"

    def decide(self, task, reply, judge_verdicts=None):
        self.decide_calls.append((task["id"], judge_verdicts is not None))
        if not task["answerable"]:
            outcome = self._classify(reply)
            if outcome == "needs_judge":
                return self._decision("needs_judge", None, ["outcome"], "unclear")
            return self._decision(outcome, outcome == "abstained", [], "by pattern")
        grade = self.grade(task, reply)
        if task["grader"]["type"] == "checklist" and judge_verdicts is not None:
            grade = self.apply_judge_verdicts(grade, judge_verdicts)
        if grade.status == "passed":
            return self._decision("answered", True, [], "accepted", grade)
        if grade.status in ("needs_judge", "pending"):
            return self._decision("answered", None, ["checklist"], "judged checks outstanding",
                                  grade)
        if grade.failed_by == "judge":
            return self._decision("answered", False, [], "the judges rejected a check", grade)
        outcome = self._classify(reply)
        if outcome == "needs_judge":
            return self._decision("needs_judge", False, ["outcome"], "rejected; outcome unclear",
                                  grade)
        return self._decision(outcome, False, [], "rejected", grade)

    # core.tasks
    def load_tasks(self, public_dir, held_out_dir=None, *, manifest_path=None,
                   verify_hashes=True):
        self.load_calls.append((public_dir, held_out_dir, manifest_path))
        return list(self.loaded)


@dataclasses.dataclass(frozen=True)
class LoadedTask:
    """The shape of a task from the real loader: a frozen dataclass."""
    id: str
    family: int
    split: str
    answerable: bool
    floor: bool
    prompt: str
    max_output_tokens: int = 4096
    grader: dict = dataclasses.field(default_factory=dict)
    expected: object = None
    raw: dict = dataclasses.field(default_factory=dict)


def checklist_task(task_id):
    return {"id": task_id, "family": 4, "split": "public", "answerable": True,
            "prompt": "Write the note for %s." % task_id, "max_output_tokens": 4096,
            "grader": {"type": "checklist", "checks": [
                {"id": "s1", "text": "Opens with Dear", "by": "script",
                 "script": {"contains": "Dear"}},
                {"id": "j1", "text": "Gives no reason", "by": "judge"},
                {"id": "j2", "text": "Asks for a reply", "by": "judge"}]}}


TASKS = [
    checklist_task("k-pass"), checklist_task("k-disputed"), checklist_task("k-script-fail"),
    checklist_task("k-unclear"),
    {"id": "u-unclear", "family": 2, "split": "held-out", "answerable": False,
     "prompt": "Who won the match for u-unclear?", "max_output_tokens": 4096,
     "grader": {"type": "abstain"}},
    {"id": "e-exact", "family": 1, "split": "public", "answerable": True, "expected": "42",
     "prompt": "What is six times seven, for e-exact?", "max_output_tokens": 4096,
     "grader": {"type": "exact"}},
]
REPLIES = {"k-pass": "Dear all, please reply.", "k-disputed": "Dear all, a note.",
           "k-script-fail": "Hello, please reply.", "k-unclear": "UNCLEAR and no greeting",
           "u-unclear": "UNCLEAR, perhaps nobody", "e-exact": "42"}


def task_of(prompt):
    """The task a model or judge prompt is about: every prompt names its id."""
    return [task_id for task_id in REPLIES if task_id in prompt][0]


class SeamCase(unittest.TestCase):
    def setUp(self):
        folder = tempfile.TemporaryDirectory()
        self.addCleanup(folder.cleanup)
        self.store = folder.name
        self.cfg = support.make_config(models=[support.spec_dict("openai", "m-oa", "3", "30")])
        self.stubs = Stubs()
        self.judge_replies = {}

    def judge_reply(self, request, prompt):
        judge, task_id = request.body["model"], task_of(prompt)
        scripted = self.judge_replies.get((judge, task_id))
        if scripted is not None:
            return scripted
        if prompt.startswith(judges.OUTCOME_PROMPT[:60]):
            return json.dumps({"outcome": "abstained", "reason": "r"})
        return json.dumps({"checks": {"j1": {"pass": True, "reason": "r"},
                                      "j2": {"pass": True, "reason": "r"}}})

    def transport(self):
        def respond(request):
            prompt = prompt_of(request)
            if prompt.startswith(judges.CHECKLIST_PROMPT[:60]) or \
                    prompt.startswith(judges.OUTCOME_PROMPT[:60]):
                return reply_body(request, self.judge_reply(request, prompt))
            return reply_body(request, REPLIES[task_of(prompt)])
        return ScriptedTransport(default=respond)

    def run_full(self, tasks=TASKS, **kwargs):
        transport = self.transport()
        with self.stubs.patch():
            summary = runner.run_stage("full", self.cfg, tasks, private_store=self.store,
                                       transport=transport, seed=5, out=QUIET, **kwargs)
        rows = {}
        with open(os.path.join(summary["dir"], "requests.jsonl"), encoding="utf-8") as stream:
            for line in stream:
                line = json.loads(line)
                if line["event"] == "slot":
                    rows[line["slot"]["slot_id"]] = line["slot"]
        return summary, list(rows.values()), transport

    @staticmethod
    def one(rows, task_id):
        found = [row for row in rows if row["task_id"] == task_id]
        assert len(found) == 3
        return found[0]


class RecordShapeTests(SeamCase):
    def setUp(self):
        super().setUp()
        disputed = json.dumps({"checks": {"j1": {"pass": True, "reason": "r"},
                                          "j2": {"pass": False, "reason": "r"}}})
        self.judge_replies[("j-an", "k-disputed")] = disputed
        self.judge_replies[("j-oa", "k-unclear")] = json.dumps(
            {"outcome": "refused", "reason": "r"})

    def test_slot_records_go_straight_to_the_scorer(self):
        # No grade and no scores are passed: the default grader and the default
        # scorer are found through the seam, and the scorer accepts every record.
        summary, rows, _ = self.run_full()
        self.assertEqual(summary["status"], "finalised")
        self.assertEqual(len(rows), 18)
        with open(os.path.join(summary["dir"], "scores.json"), encoding="utf-8") as stream:
            self.assertEqual(json.load(stream), {"scored_slots": 18, "models": ["m-oa"]})
        with open(os.path.join(summary["dir"], "slots.json"), encoding="utf-8") as stream:
            written = json.load(stream)
        # The records as written to disk are what the scorer reads.
        self.assertEqual(stub_score_run(written), {"scored_slots": 18, "models": ["m-oa"]})
        for row in written:
            for name in SCORE_FIELDS + ("checks", "needed_judge_classification"):
                self.assertIn(name, row)
            self.assertEqual(row["model"], "m-oa")
            self.assertIsInstance(row["family"], int)
            self.assertIn(row["split"], ("public", "held-out"))
            self.assertIn(row["repeat"], (1, 2, 3))
            self.assertIs(row["truncated"], False)
            self.assertIsInstance(row["time_s"], float)
            self.assertIsInstance(row["cost_usd"], float)
            self.assertEqual(float(row["cost_usd_exact"]), row["cost_usd"])
            self.assertIsInstance(row["needed_judge_classification"], bool)
            for check in row["checks"]:
                self.assertEqual(sorted(check), ["by", "id", "state"])

    def test_each_kind_of_slot_has_the_right_checks_outcome_and_pass(self):
        _, rows, _ = self.run_full()
        # Script and judged checks all pass.
        row = self.one(rows, "k-pass")
        self.assertEqual((row["outcome"], row["pass"], row["pending"]), ("answered", True, False))
        self.assertEqual(row["checks"], [{"id": "s1", "by": "script", "state": "pass"},
                                         {"id": "j1", "by": "judge", "state": "pass"},
                                         {"id": "j2", "by": "judge", "state": "pass"}])
        self.assertFalse(row["needed_judge_classification"])
        # The judges disagree on one check: disputed, which fails the slot.
        row = self.one(rows, "k-disputed")
        self.assertEqual((row["outcome"], row["pass"]), ("answered", False))
        self.assertEqual(row["checks"], [{"id": "s1", "by": "script", "state": "pass"},
                                         {"id": "j1", "by": "judge", "state": "pass"},
                                         {"id": "j2", "by": "judge", "state": "disputed"}])
        # A script check fails: no judge is asked, and the checks that were never
        # run are left out of the list.
        row = self.one(rows, "k-script-fail")
        self.assertEqual((row["outcome"], row["pass"]), ("answered", False))
        self.assertEqual(row["checks"], [{"id": "s1", "by": "script", "state": "fail"}])
        self.assertEqual(row["judge_requests"], [])
        # Unanswerable task, outcome unclear, both judges say abstained: a pass.
        row = self.one(rows, "u-unclear")
        self.assertEqual((row["outcome"], row["pass"], row["checks"]), ("abstained", True, []))
        self.assertTrue(row["needed_judge_classification"])
        self.assertEqual(row["split"], "held-out")
        # Answerable task the grader rejected, outcome unclear, judges disagree:
        # `answered`, and the pass stays false.
        row = self.one(rows, "k-unclear")
        self.assertEqual((row["outcome"], row["pass"], row["checks"]), ("answered", False, []))
        self.assertTrue(row["needed_judge_classification"])
        # A script-only task.
        row = self.one(rows, "e-exact")
        self.assertEqual((row["outcome"], row["pass"], row["checks"]), ("answered", True, []))
        self.assertEqual(row["judge_requests"], [])
        # The grader's own detail is kept on the record; it holds no prompt or reply.
        self.assertEqual(self.one(rows, "k-pass")["grader_detail"]["grader_status"], "passed")

    def test_the_graders_are_called_through_their_real_interfaces(self):
        _, _, transport = self.run_full()
        # apply_judge_verdicts gets {judge model id: {check id: true or false}}.
        self.assertIn({"j-oa": {"j1": True, "j2": True}, "j-an": {"j1": True, "j2": False}},
                      self.stubs.verdicts_seen)
        self.assertIn({"j-oa": {"j1": True, "j2": True}, "j-an": {"j1": True, "j2": True}},
                      self.stubs.verdicts_seen)
        # decide(task, reply) once per reply; a second call, with judge_verdicts,
        # only for a checklist whose judged checks were outstanding. A reply whose
        # outcome went to the judges is not graded a second time.
        calls = self.stubs.decide_calls
        for task_id, expected in (("k-pass", [False, True]), ("k-disputed", [False, True]),
                                  ("k-script-fail", [False]), ("k-unclear", [False]),
                                  ("u-unclear", [False]), ("e-exact", [False])):
            self.assertEqual([with_verdicts for called, with_verdicts in calls
                              if called == task_id], expected * 3, task_id)
        # Judges are asked only what decide() said was outstanding.
        asked = {}
        for request in transport.requests:
            prompt = prompt_of(request)
            if prompt.startswith(judges.CHECKLIST_PROMPT[:60]):
                asked.setdefault(task_of(prompt), set()).add("checklist")
                self.assertIn("- [j1] Gives no reason", prompt)
                self.assertNotIn("[s1]", prompt)                  # script checks stay with the script
            elif prompt.startswith(judges.OUTCOME_PROMPT[:60]):
                asked.setdefault(task_of(prompt), set()).add("outcome")
        self.assertEqual(asked, {"k-pass": {"checklist"}, "k-disputed": {"checklist"},
                                 "k-unclear": {"outcome"}, "u-unclear": {"outcome"}})

    def test_an_unresolved_judge_leaves_a_pending_record_in_the_same_shape(self):
        self.judge_replies[("j-oa", "k-pass")] = "not a verdict"
        self.judge_replies[("j-oa", "u-unclear")] = "not a verdict"
        summary, rows, _ = self.run_full()
        self.assertEqual(summary["status"], "pending_judging")
        self.assertIsNone(summary["finalised"])
        row = self.one(rows, "k-pass")
        self.assertEqual((row["outcome"], row["pass"], row["pending"]), ("answered", None, True))
        self.assertEqual(row["checks"], [{"id": "s1", "by": "script", "state": "pass"},
                                         {"id": "j1", "by": "judge", "state": "unresolved"},
                                         {"id": "j2", "by": "judge", "state": "unresolved"}])
        row = self.one(rows, "u-unclear")
        self.assertEqual((row["outcome"], row["pass"], row["pending"], row["checks"]),
                         ("judge_unresolved", None, True, []))
        # A provisional look is possible; a final score is not.
        self.assertEqual(stub_score_run(rows, allow_pending=True)["scored_slots"], 18)
        with self.assertRaises(ValueError):
            stub_score_run(rows)

    def test_a_grader_without_a_checks_list_still_gives_a_consistent_record(self):
        # `stub_grade` knows nothing of checks: the list is built from the panel's
        # results, and a slot the grader failed by script says so.
        def grade(task, reply, judged=None):
            ids = [check["id"] for check in judges.judged_checks(task)]
            if judged is None:
                return {"outcome": "answered", "pass": None if ids else True,
                        "pending": bool(ids), "needs_judge": ids}
            return runner.fallback_resolve(
                task, {"outcome": "answered", "script_pass": task["id"] != "k-script-fail"},
                judged)
        tasks = [task for task in TASKS if task["id"].startswith("k-") and "unclear" not in
                 task["id"]]
        summary, rows, _ = self.run_full(tasks=tasks, grade=grade)
        self.assertEqual(summary["status"], "finalised")
        self.assertEqual(self.one(rows, "k-pass")["checks"],
                         [{"id": "j1", "by": "judge", "state": "pass"},
                          {"id": "j2", "by": "judge", "state": "pass"}])
        row = self.one(rows, "k-script-fail")
        self.assertIs(row["pass"], False)
        self.assertEqual(row["checks"][-1], {"id": "script_checks", "by": "script",
                                             "state": "fail"})
        self.assertEqual(stub_score_run(rows)["scored_slots"], 9)

    def test_record_checks_rules(self):
        build = runner.record_checks
        judged = {"checks": {"c1": "pass", "c2": "disputed", "c3": "not_needed"}}
        self.assertEqual(build("answered", False, {}, judged),
                         [{"id": "c1", "by": "judge", "state": "pass"},
                          {"id": "c2", "by": "judge", "state": "disputed"}])
        self.assertEqual(build("abstained", True, {}, judged), [])        # answered slots only
        self.assertEqual(build("execution_error", False, {}, None), [])
        self.assertEqual(build("answered", None, {}, {"checks": {"c1": "judge_unresolved"}}),
                         [{"id": "c1", "by": "judge", "state": "unresolved"}])
        listed = [{"id": "a", "by": "script", "state": "pass", "text": "dropped"}]
        self.assertEqual(build("answered", True, {"checks": listed}, judged),
                         [{"id": "a", "by": "script", "state": "pass"}])
        with self.assertRaises(ValueError):
            build("answered", True, {"checks": [{"id": "a", "by": "script", "state": "ok"}]}, None)


class LazyImportTests(SeamCase):
    def test_nothing_from_the_other_modules_is_imported_at_the_top(self):
        for name in ("runner.py", "cli.py", "preflight.py", "judges.py", "records.py"):
            with open(os.path.join(support.CORE, name), encoding="utf-8") as stream:
                top = [line for line in stream.read().split("\n")
                       if line.startswith(("import ", "from "))]
            for line in top:
                for module in ("tasks", "graders", "outcome", "scores", "bootstrap"):
                    self.assertNotIn(module, line.replace(",", " ").split(), (name, line))

    def test_default_grade_says_clearly_when_the_graders_are_absent(self):
        with mock.patch.dict(sys.modules, {"core.outcome": None}):
            with self.assertRaises(runner.GraderUnavailable) as caught:
                runner.default_grade({"id": "t1"}, "reply")
            self.assertIn("core/outcome.py", str(caught.exception))
            # A run with no grade function is refused before any request is made.
            transport = self.transport()
            with self.assertRaises(runner.GraderUnavailable):
                runner.run_stage("full", self.cfg, TASKS, private_store=self.store,
                                 transport=transport, out=QUIET)
        self.assertEqual(transport.requests, [])

    def test_default_grade_uses_outcome_decide_when_present(self):
        with self.stubs.patch():
            result = runner.default_grade(TASKS[-1], "42")
        self.assertEqual((result["outcome"], result["pass"], result["needs_judge"]),
                         ("answered", True, []))
        self.assertEqual(self.stubs.decide_calls, [("e-exact", False)])

    def test_default_grade_lists_what_the_judges_must_decide(self):
        with self.stubs.patch():
            first = runner.default_grade(TASKS[0], "Dear all")
            unclear = runner.default_grade(TASKS[4], "UNCLEAR")
        self.assertEqual(first["needs_judge"], [{"id": "j1", "text": "Gives no reason"},
                                                {"id": "j2", "text": "Asks for a reply"}])
        self.assertEqual((first["outcome"], first["pass"], first["pending"]),
                         ("answered", None, True))
        self.assertEqual(unclear["needs_judge"], ["outcome"])

    def test_resolve_outcome_follows_the_mapping_table(self):
        resolve = runner.resolve_outcome
        unanswerable, answerable = {"answerable": False}, {"answerable": True}
        self.assertEqual(resolve(unanswerable, {"pass": None}, "abstained"),
                         {"outcome": "abstained", "pass": True, "pending": False})
        for outcome in ("answered", "refused"):
            self.assertIs(resolve(unanswerable, {"pass": None}, outcome)["pass"], False)
        for outcome in ("answered", "abstained", "refused"):
            self.assertEqual(resolve(answerable, {"pass": False}, outcome),
                             {"outcome": outcome, "pass": False, "pending": False})
        for unresolved in ("judge_unresolved", None):
            self.assertEqual(resolve(unanswerable, {"pass": None}, unresolved),
                             {"outcome": "judge_unresolved", "pass": None, "pending": True})
        self.assertTrue(resolve(answerable, {"pass": None}, "answered")["pending"])

    def test_a_dry_full_run_without_the_scorer_goes_on_unscored(self):
        transport = self.transport()
        with self.stubs.patch(**{"core.scores": None}):
            summary = runner.run_stage("full", self.cfg, TASKS, private_store=self.store,
                                       transport=transport, seed=5, out=QUIET)
            with self.assertRaises(runner.ScorerUnavailable):
                runner.default_scores([], [])
        self.assertEqual(summary["status"], "finalised")
        with open(os.path.join(summary["dir"], "scores.json"), encoding="utf-8") as stream:
            self.assertEqual(json.load(stream), {})

    def formula_tasks(self):
        return TASKS + [{"id": "f-formula", "family": 6, "split": "public", "answerable": True,
                         "prompt": "Give the formula, for f-formula.", "max_output_tokens": 4096,
                         "grader": {"type": "formula"}}]

    def test_a_missing_formula_engine_is_found_before_the_first_request(self):
        def no_engine():
            raise RuntimeError("the 'formulas' package is not importable")
        self.stubs.modules["core.graders"].formula_engine_versions = no_engine
        transport = self.transport()
        with self.stubs.patch():
            with self.assertRaises(runner.GraderUnavailable) as caught:
                runner.run_stage("canary", self.cfg, self.formula_tasks(),
                                 private_store=self.store, transport=transport, out=QUIET)
            # A task set with no formula task does not need the engine.
            self.assertEqual(runner.check_default_grader(TASKS), {})
        self.assertIn("the formula engine does not start", str(caught.exception))
        self.assertEqual(transport.requests, [])
        self.assertFalse(os.path.exists(os.path.join(self.store, "runs")))

    def test_the_formula_engine_versions_go_on_the_run_record(self):
        self.stubs.modules["core.graders"].formula_engine_versions = lambda: {"formulas": "1.2"}
        REPLIES["f-formula"] = "=A1"
        self.addCleanup(REPLIES.pop, "f-formula")
        self.stubs.modules["core.graders"].grade = lambda task, reply: GradeResult("failed", "script")
        summary, _, _ = self.run_full(tasks=self.formula_tasks()[-1:] + TASKS[-1:])
        with open(os.path.join(summary["dir"], "run.json"), encoding="utf-8") as stream:
            self.assertEqual(json.load(stream)["grader"], {"formula_engine": {"formulas": "1.2"}})

    def test_a_grader_that_fails_mid_run_keeps_the_paid_answer_and_stops(self):
        calls = []

        def grade(task, reply, judged=None):
            calls.append(task["id"])
            if len(calls) == 3:
                raise RuntimeError("the sandbox would not start")
            return {"outcome": "answered", "pass": True, "pending": False, "needs_judge": []}
        summary, rows, transport = self.run_full(grade=grade)
        self.assertEqual(summary["status"], "interrupted")
        self.assertIn("the grader could not run", summary["report"]["interrupt_reason"])
        self.assertEqual(len(transport.requests), 3)                # nothing sent after it
        self.assertEqual(len(rows), 3)
        last = rows[-1]
        self.assertEqual(last["reply"], REPLIES[last["task_id"]])   # the answer is kept
        self.assertEqual((last["outcome"], last["pass"], last["pending"]),
                         ("judge_unresolved", None, True))
        self.assertIn("grader_error:RuntimeError", last["flags"])
        self.assertGreater(last["cost_usd"], 0)
        self.assertIsNone(summary["finalised"])

    def test_a_scorer_that_rejects_the_records_leaves_the_run_in_staging(self):
        def refuse(rows, tasks):
            raise ValueError("refused by the scorer")
        with self.assertRaises(ValueError):
            self.run_full(scores=refuse)
        staging = os.path.join(self.store, "runs", "_staging")
        self.assertEqual(len(os.listdir(staging)), 1)
        self.assertEqual([name for name in os.listdir(os.path.join(self.store, "runs"))],
                         ["_staging"])


class TaskLoaderSeamTests(SeamCase):
    def setUp(self):
        super().setUp()
        self.public = os.path.join(self.store, "public")
        os.mkdir(self.public)
        self.cfg_path = os.path.join(self.store, "cfg.json")
        with open(self.cfg_path, "w", encoding="utf-8") as stream:
            json.dump(support.config_dict(), stream)
        with open(os.path.join(self.public, "a.json"), "w", encoding="utf-8") as stream:
            json.dump([support.task("file-1"), support.task("file-2")], stream)
        self.stubs.loaded = [
            LoadedTask("f1-pub-01", 1, "public", True, False, "Prompt one",
                       grader={"type": "exact"}, raw={"private": "RAW-FIELD"}),
            LoadedTask("f4-pub-01", 4, "public", True, False, "Prompt two", grader={
                "type": "checklist", "checks": [{"id": "j1", "text": "t", "by": "judge"}]}),
            LoadedTask("f2-ho-01", 2, "held-out", False, False, "Prompt three",
                       max_output_tokens=8192, grader={"type": "abstain"}),
        ]

    def main(self, *argv):
        lines = []
        code = cli.main(list(argv), out=lines.append)
        return code, "\n".join(lines)

    def test_the_loader_is_used_when_present(self):
        held = os.path.join(self.store, "held-out")
        manifest = os.path.join(self.store, "manifest.json")
        with self.stubs.patch():
            tasks, how = cli.load_task_set(self.public, held, manifest)
            code, text = self.main("preflight", "--config", self.cfg_path,
                                   "--public-tasks", self.public, "--held-out-tasks", held)
        self.assertEqual(self.stubs.load_calls, [(self.public, held, manifest),
                                                 (self.public, held, None)])
        self.assertEqual([task["id"] for task in tasks], ["f1-pub-01", "f4-pub-01", "f2-ho-01"])
        self.assertEqual([task["split"] for task in tasks], ["public", "public", "held-out"])
        self.assertEqual(tasks[2]["max_output_tokens"], 8192)
        self.assertIs(tasks[2]["answerable"], False)
        self.assertNotIn("raw", tasks[0])
        self.assertTrue(all(isinstance(task, dict) for task in tasks))
        self.assertEqual(judges.judged_check_count(tasks[1]), 1)
        self.assertIn("core/tasks.py", how)
        self.assertEqual(code, 0)
        self.assertIn("tasks loaded by core/tasks.py (held-out files checked against the "
                      "manifest)", text)
        self.assertIn("models 2, tasks 3, full-run slots 18, canary slots 4", text)

    def test_the_built_in_reader_is_used_when_the_loader_is_absent(self):
        with mock.patch.dict(sys.modules, {"core.tasks": None}):
            tasks, how = cli.load_task_set(self.public)
        self.assertEqual([task["id"] for task in tasks], ["file-1", "file-2"])
        self.assertIn("built-in reader", how)
        self.assertEqual(self.stubs.load_calls, [])

    def test_a_loader_error_is_a_refusal_with_a_non_zero_exit_code(self):
        def broken(public_dir, held_out_dir=None, **options):
            raise ValueError("held-out: hash mismatch")
        self.stubs.modules["core.tasks"].load_tasks = broken
        with self.stubs.patch():
            code, text = self.main("preflight", "--config", self.cfg_path,
                                   "--public-tasks", self.public)
        self.assertEqual(code, 2)
        self.assertEqual(text, "REFUSED: held-out: hash mismatch")


if __name__ == "__main__":
    unittest.main()
