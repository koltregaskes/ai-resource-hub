"""Tests for the python_tests grader.

No test here runs submitted code on the host. The grader is driven through
``FakeBackend``, which runs nothing: it records the job it is sent and answers
with what the submission is pretending to have returned.
"""
import json
import os
import unittest
from unittest import mock

import _support  # noqa: F401
from _support import FakeBackend, Raised, RawResult, graders, outcome, sandbox


def params(entry, *tests):
    return {"type": "python_tests", "entry": entry, "tests": list(tests)}


def passed(result):
    return result.passed is True


def failed(result):
    return result.passed is False


CODE = "def first(xs):\n    return xs[0] if xs else None\n"
FIRST = params("first", {"args": [[]], "expect": None}, {"args": [[0]], "expect": 0},
               {"args": [[False]], "expect": False}, {"args": [[1, 2]], "expect": 1})
RIGHT = [None, 0, False, 1]


def run(returns, tests=FIRST, code=CODE, **kwargs):
    backend = FakeBackend(returns=returns, **kwargs)
    return graders.grade_python_tests(code, tests, backend=backend), backend


class GraderTest(unittest.TestCase):
    def test_right_values_pass(self):
        result, backend = run(RIGHT)
        self.assertTrue(passed(result), result.detail)
        self.assertEqual(result.detail, "4 tests passed")
        self.assertEqual(len(backend.jobs), 1)

    def test_a_wrong_value_fails(self):
        result, _ = run([None, 0, None, 1])
        self.assertTrue(failed(result))
        self.assertFalse(result.malformed)
        self.assertEqual(result.detail, "failed test(s): 3 (wrong result)")

    def test_fenced_code_is_unwrapped_before_it_is_sent(self):
        result, backend = run(RIGHT, code="```python\n" + CODE + "```")
        self.assertTrue(passed(result))
        self.assertEqual(backend.jobs[0]["source"], CODE.strip())

    def test_an_exception_fails(self):
        result, _ = run([None, 0, False, Raised("IndexError", "LookupError", "Exception", "BaseException", "object")])
        self.assertTrue(failed(result))
        self.assertIn("4 (raised IndexError)", result.detail)

    def test_a_syntax_error_is_malformed_and_is_never_sent(self):
        backend = FakeBackend(returns=RIGHT)
        result = graders.grade_python_tests("def first(xs:\n    return 1\n", FIRST, backend=backend)
        self.assertTrue(failed(result) and result.malformed)
        prose = graders.grade_python_tests("Here is the function:\n\ndef first(xs):\n    return 1", FIRST, backend=backend)
        self.assertTrue(failed(prose) and prose.malformed)
        self.assertEqual(backend.jobs, [])

    def test_code_that_cannot_be_loaded_fails(self):
        backend = FakeBackend(output=_support.report_output({"load_error": "KeyError"}))
        result = graders.grade_python_tests(CODE, FIRST, backend=backend)
        self.assertTrue(failed(result))
        self.assertEqual(result.detail, "the code could not be loaded: KeyError")

    def test_a_timeout_fails(self):
        self.assertEqual(graders.SANDBOX_TIMEOUT_SECONDS, 10)
        backend = FakeBackend(output=sandbox.RunOutput("timeout"))
        result = graders.grade_python_tests(CODE, FIRST, backend=backend)
        self.assertTrue(failed(result))
        self.assertEqual(result.detail, "timed out after 10 seconds")

    def test_too_much_output_fails(self):
        backend = FakeBackend(output=sandbox.RunOutput("overflow"))
        result = graders.grade_python_tests(CODE, FIRST, backend=backend)
        self.assertTrue(failed(result))
        self.assertIn("over the cap", result.detail)

    def test_no_report_or_a_short_report_fails(self):
        for output in (sandbox.RunOutput("done", b""), sandbox.RunOutput("done", b'{"started": true}\n'),
                       sandbox.RunOutput("done", b'{"started": true}\nnot json\n'),
                       _support.report_output({"results": [{"value": {"t": "none"}}]}),
                       _support.report_output(["a", "list"])):
            result = graders.grade_python_tests(CODE, FIRST, backend=FakeBackend(output=output))
            self.assertTrue(failed(result), output)
            self.assertIn("without a report", result.detail)

    def test_a_forged_report_gains_nothing(self):
        # The submission can write to the report channel, but it does not
        # know the expected values, so all it can do is state its own.
        forged = _support.report_output({"results": [{"ok": True}] * 4})
        self.assertTrue(failed(graders.grade_python_tests(CODE, FIRST, backend=FakeBackend(output=forged))))
        forged = _support.report_output({"results": [{"value": {"t": "str", "v": "wrong"}}] * 4, "ok": True})
        self.assertTrue(failed(graders.grade_python_tests(CODE, FIRST, backend=FakeBackend(output=forged))))

    def test_raises(self):
        wants = params("f", {"args": ["x"], "raises": "ValueError"})
        self.assertTrue(passed(run([Raised("ValueError", "Exception", "BaseException", "object")], wants)[0]))
        subclass = Raised("Bad", "ValueError", "Exception", "BaseException", "object")
        self.assertTrue(passed(run([subclass], wants)[0]))
        nothing, _ = run([0], wants)
        self.assertTrue(failed(nothing))
        self.assertIn("no exception", nothing.detail)
        other, _ = run([Raised("KeyError", "LookupError", "Exception", "BaseException", "object")], wants)
        self.assertTrue(failed(other))

    def test_code_that_is_too_long_is_not_sent(self):
        backend = FakeBackend(returns=RIGHT)
        long_code = CODE + "# " + "x" * sandbox.MAX_SOURCE_CHARS + "\n"
        self.assertTrue(failed(graders.grade_python_tests(long_code, FIRST, backend=backend)))
        self.assertEqual(backend.jobs, [])


class NothingExpectedIsSentTest(unittest.TestCase):
    """The sandbox gets the source, the entry name and the arguments. Nothing else."""

    SECRET = "ZZ-EXPECTED-7731"
    TESTS = params("f", {"args": ["in-1"], "expect": SECRET},
                   {"args": [41], "expect": {"key": [SECRET, 990017]}},
                   {"args": ["in-3"], "raises": "ZzSecretError"})

    def test_the_job_holds_no_expected_value(self):
        result, backend = run([self.SECRET, {"key": [self.SECRET, 990017]}, Raised("ZzSecretError", "object")],
                              tests=self.TESTS, code="def f(x):\n    return x\n")
        self.assertTrue(passed(result), result.detail)
        job = backend.jobs[0]
        self.assertEqual(sorted(job), ["entry", "source", "tests"])
        self.assertEqual(job["tests"], [["in-1"], [41], ["in-3"]])
        text = json.dumps(job)
        for hidden in ("expect", "raises", self.SECRET, "990017", "ZzSecretError"):
            self.assertNotIn(hidden, text)

    def test_the_program_sent_holds_no_expected_value(self):
        job = sandbox.build_job("def f(x):\n    return x\n", "f", self.TESTS["tests"])
        program = sandbox._program("_sandbox_runner.py", job).decode("utf-8")
        for hidden in (self.SECRET, "990017", "ZzSecretError"):
            self.assertNotIn(hidden, program)
        self.assertIn("in-1", program)

    def test_no_file_is_written_for_the_job(self):
        with mock.patch("tempfile.TemporaryDirectory") as folder, mock.patch("tempfile.mkdtemp") as mkdtemp:
            run(RIGHT)
        folder.assert_not_called()
        mkdtemp.assert_not_called()


class ComparisonTest(unittest.TestCase):
    """The host compares; the sandbox only reports."""

    def check(self, returned, expect):
        return passed(run([returned], params("f", {"args": [], "expect": expect}), "def f():\n    return 0\n")[0])

    def test_bool_is_not_int(self):
        self.assertTrue(self.check(1, 1))
        self.assertFalse(self.check(True, 1))
        self.assertTrue(self.check(True, True))
        self.assertFalse(self.check(1, True))
        self.assertFalse(self.check(False, 0))
        self.assertFalse(self.check(0, False))
        self.assertFalse(self.check(1.0, True))

    def test_bool_is_not_int_inside_a_list_or_dict(self):
        self.assertTrue(self.check({"a": [1, 0]}, {"a": [1, 0]}))
        self.assertFalse(self.check({"a": [True, False]}, {"a": [1, 0]}))
        self.assertFalse(self.check({"a": [1, 0]}, {"a": [True, False]}))

    def test_dictionary_keys_are_compared_strictly(self):
        # The reviewer's point: the key True must not stand in for the key 1.
        tag = _support._sandbox_runner.encode
        self.assertTrue(sandbox.values_equal(tag({1: "a"}), {1: "a"}))
        self.assertFalse(sandbox.values_equal(tag({True: "a"}), {1: "a"}))
        self.assertFalse(sandbox.values_equal(tag({1: "a"}), {True: "a"}))
        self.assertFalse(sandbox.values_equal(tag({1: "a"}), {"1": "a"}))
        self.assertFalse(self.check({"a": 1, "b": 2}, {"a": 1}))
        self.assertFalse(self.check({"a": 1}, {"a": 1, "b": 2}))
        self.assertTrue(self.check({"b": 2, "a": 1}, {"a": 1, "b": 2}))

    def test_plain_equality_otherwise(self):
        self.assertTrue(self.check(2.0, 2))
        self.assertTrue(self.check(2, 2.0))
        self.assertFalse(self.check(0, None))
        self.assertFalse(self.check("", None))
        self.assertFalse(self.check(None, 0))
        self.assertFalse(self.check("1", 1))
        self.assertFalse(self.check(1, "1"))
        self.assertFalse(self.check(float("nan"), 1))
        self.assertFalse(self.check((1, 2), [1, 2]))
        self.assertTrue(self.check([1, [2, "x"]], [1, [2, "x"]]))
        self.assertFalse(self.check({1, 2}, [1, 2]))
        self.assertFalse(self.check(b"x", "x"))

    def test_very_large_integers_are_exact(self):
        big = 10 ** 28 + 1
        self.assertTrue(self.check(big + 1, big + 1))
        self.assertFalse(self.check(big, big + 1))
        self.assertFalse(self.check(int(float(big) + 1), big + 1))
        self.assertTrue(self.check(2 ** 53 + 1, 2 ** 53 + 1))
        self.assertFalse(self.check(float(2 ** 53 + 1), 2 ** 53 + 1))
        self.assertTrue(self.check(-(10 ** 400), -(10 ** 400)))

    def test_big_integers_travel_as_text(self):
        tagged = _support._sandbox_runner.encode(10 ** 28 + 1)
        self.assertEqual(tagged, {"t": "int", "v": "10000000000000000000000000001"})
        self.assertEqual(_support._sandbox_runner.encode(True), {"t": "bool", "v": True})
        self.assertEqual(_support._sandbox_runner.encode(1), {"t": "int", "v": "1"})

    def test_a_result_over_the_cap_fails(self):
        result, _ = run(["x" * 70000], params("f", {"args": [], "expect": "x" * 70000}))
        self.assertTrue(failed(result))
        self.assertIn("output over the cap", result.detail)
        # A result that slips past the runner's own cap is stopped by the host's.
        raw = RawResult({"value": {"t": "str", "v": "x" * 70000}})
        result, _ = run([raw], params("f", {"args": [], "expect": "x" * 70000}))
        self.assertTrue(failed(result))
        self.assertIn("output over the cap", result.detail)
        self.assertEqual(sandbox.MAX_RESULT_BYTES, 64 * 1024)
        self.assertEqual(sandbox.MAX_TOTAL_OUTPUT_BYTES, 1024 * 1024)

    def test_malformed_tagged_values_never_match(self):
        for value in (None, "x", 1, [], {"t": "int", "v": 1}, {"t": "int", "v": "1e3"}, {"t": "int", "v": "9" * 5000},
                      {"t": "list", "v": "x"}, {"t": "dict", "v": [[1]]}, {"t": "other", "type": "Thing"}):
            for want in (1, "x", None, [1], {"a": 1}, True):
                self.assertFalse(sandbox.values_equal(value, want), (value, want))


class StaticCheckTest(unittest.TestCase):
    REFUSED = (
        "import socket\n",
        "import subprocess\n",
        "from subprocess import run\n",
        "import ctypes\n",
        "import urllib.request\n",
        "from http import client\n",
        "import os\nx = os.environ\n",
        "import os\nx = os.getenv('HOME')\n",
        "from os import environ\n",
        "import os\nos.system('dir')\n",
        "import os as o\nx = o.environ['A']\n",
        "import os as x\nx.listdir('.')\n",
        "import os\nos.spawnv(0, 'a', ['a'])\n",
        "from os import execv\n",
        "x = __import__('socket')\n",
        "eval('1')\n",
        "exec('x = 1')\n",
        "open('C:/Windows/win.ini')\n",
        "open('/etc/passwd')\n",
        "open('../secrets.txt')\n",
        "open('..\\\\secrets.txt')\n",
        "p = 'notes.txt'\nopen(p)\n",
        "f = open\n",
        "import io\nio.open('x.txt')\n",
        "import pathlib\n",
        "import sys\nsys.modules['os']\n",
        "().__class__.__base__.__subclasses__()\n",
        "import importlib\n",
    )
    ALLOWED = (
        "import re, math, datetime, decimal, calendar, itertools, functools, collections, string\n",
        "from datetime import date\nimport os.path\nimport sys\n",
        "def f(xs):\n    return sorted(xs)\n",
        "with open('scratch.txt', 'w') as fh:\n    fh.write('x')\n",
        "open('sub/scratch.txt')\n",
        "environment = 'test'\nsystem = 1\n",
    )

    def test_refused_sources(self):
        for source in self.REFUSED:
            self.assertTrue(graders.static_source_problems(source), source)

    def test_allowed_sources(self):
        for source in self.ALLOWED:
            self.assertEqual(graders.static_source_problems(source), [], source)

    def test_refused_code_is_never_sent_to_a_sandbox(self):
        backend = FakeBackend(returns=RIGHT)
        result = graders.grade_python_tests("import socket\n" + CODE, FIRST, backend=backend)
        self.assertTrue(failed(result))
        self.assertIn("refused before running: imports socket", result.detail)
        self.assertEqual(backend.jobs, [])

    def test_the_check_is_documented_as_not_the_boundary(self):
        self.assertIn("NOT A SECURITY BOUNDARY", graders.static_source_problems.__doc__)
        self.assertIn("No model-written code runs on the host", graders.grade_python_tests.__doc__)


class NoSandboxTest(unittest.TestCase):
    """Without a proven sandbox nothing runs and nothing is graded."""

    def setUp(self):
        sandbox.reset()
        self.addCleanup(sandbox.reset)

    def grade_with_no_process_allowed(self, **env):
        with mock.patch.dict(os.environ, env, clear=False), \
                mock.patch.object(sandbox.subprocess, "Popen", side_effect=AssertionError("started a process")), \
                mock.patch.object(sandbox.subprocess, "run", side_effect=AssertionError("started a process")), \
                mock.patch.object(graders.subprocess, "Popen", side_effect=AssertionError("started a process")):
            os.environ.pop(sandbox.ENV_BACKEND, None)
            os.environ.update(env)
            return graders.grade_python_tests(CODE, FIRST)

    def test_no_backend_chosen_means_not_graded(self):
        result = self.grade_with_no_process_allowed()
        self.assertEqual(result.status, graders.SANDBOX_UNAVAILABLE)
        self.assertIsNone(result.passed)
        self.assertIn("no sandbox is chosen", result.detail)

    def test_an_unknown_backend_means_not_graded(self):
        for name in ("subprocess", "host", "inprocess", "none", "unsafe"):
            result = self.grade_with_no_process_allowed(**{sandbox.ENV_BACKEND: name})
            self.assertEqual(result.status, graders.SANDBOX_UNAVAILABLE, name)

    def test_there_is_no_host_mode(self):
        self.assertEqual(sorted(sandbox.BACKENDS), ["docker", "wsl-bwrap"])

    def test_a_backend_whose_self_test_has_not_passed_is_refused(self):
        never_tested = FakeBackend(returns=RIGHT, verify=False)
        result = graders.grade_python_tests(CODE, FIRST, backend=never_tested)
        self.assertEqual(result.status, graders.SANDBOX_UNAVAILABLE)
        self.assertEqual(never_tested.jobs, [])
        leaky = FakeBackend(returns=RIGHT, leak=lambda facts, config: facts["tcp"].update(
            {"1.1.1.1:53": {"connected": True}}))
        self.assertFalse(leaky.verified)
        result = graders.grade_python_tests(CODE, FIRST, backend=leaky)
        self.assertEqual(result.status, graders.SANDBOX_UNAVAILABLE)
        self.assertEqual(leaky.jobs, [])

    def test_decide_keeps_the_slot_pending(self):
        task = {"id": "f7-pub-99", "answerable": True, "prompt": "A made-up task.", "grader": FIRST}
        with mock.patch.dict(os.environ, {}, clear=False):
            os.environ.pop(sandbox.ENV_BACKEND, None)
            decision = outcome.decide(task, CODE)
        self.assertEqual(decision["outcome"], "sandbox_unavailable")
        self.assertIsNone(decision["pass"])
        self.assertTrue(decision["pending"])
        self.assertEqual(decision["detail"]["pending_on"], ["sandbox"])
        self.assertNotIn("sandbox_unavailable", outcome.OUTCOMES)
        # A reply that isn't Python, or that the pre-filter refuses, still has a verdict.
        self.assertEqual(outcome.decide(task, "def first(:")["outcome"], "malformed")
        self.assertIs(outcome.decide(task, "import socket\n" + CODE)["pass"], False)


if __name__ == "__main__":
    unittest.main()
