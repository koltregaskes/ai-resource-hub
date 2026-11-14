"""Tests for the python_tests grader and its child process."""
import os
import unittest
from unittest import mock

import _support  # noqa: F401
from _support import graders


def params(entry, *tests):
    return {"type": "python_tests", "entry": entry, "tests": list(tests)}


def passed(result):
    return result.passed is True


def failed(result):
    return result.passed is False


FIRST = params("first", {"args": [[]], "expect": None}, {"args": [[0]], "expect": 0},
               {"args": [[False]], "expect": False}, {"args": [[1, 2]], "expect": 1})


class RunTest(unittest.TestCase):
    def test_correct_code_passes(self):
        code = "def first(xs):\n    return xs[0] if xs else None\n"
        result = graders.grade_python_tests(code, FIRST)
        self.assertTrue(passed(result), result.detail)

    def test_fenced_code_is_unwrapped(self):
        code = "```python\ndef first(xs):\n    return xs[0] if xs else None\n```"
        self.assertTrue(passed(graders.grade_python_tests(code, FIRST)))

    def test_wrong_code_fails(self):
        result = graders.grade_python_tests("def first(xs):\n    return xs[0] or None\n", FIRST)
        self.assertTrue(failed(result))
        self.assertFalse(result.malformed)

    def test_an_exception_fails(self):
        result = graders.grade_python_tests("def first(xs):\n    return xs[0]\n", FIRST)
        self.assertTrue(failed(result))
        self.assertIn("raised IndexError", result.detail)

    def test_a_syntax_error_fails_and_is_malformed(self):
        result = graders.grade_python_tests("def first(xs:\n    return 1\n", FIRST)
        self.assertTrue(failed(result))
        self.assertTrue(result.malformed)
        prose = graders.grade_python_tests("Here is the function:\n\ndef first(xs):\n    return 1", FIRST)
        self.assertTrue(failed(prose) and prose.malformed)

    def test_a_missing_entry_function_fails(self):
        result = graders.grade_python_tests("def other(xs):\n    return None\n", FIRST)
        self.assertTrue(failed(result))
        self.assertIn("could not be loaded", result.detail)

    def test_code_that_exits_or_prints_cannot_fake_a_pass(self):
        for code in ("raise SystemExit(0)\n",
                     "def first(xs):\n    raise SystemExit(0)\n",
                     'print(\'{"results": [{"ok": true}, {"ok": true}, {"ok": true}, {"ok": true}]}\')\n'
                     "def first(xs):\n    return 'wrong'\n"):
            self.assertTrue(failed(graders.grade_python_tests(code, FIRST)), code)

    def test_bool_is_not_int(self):
        one = params("f", {"args": [], "expect": 1})
        true = params("f", {"args": [], "expect": True})
        self.assertTrue(passed(graders.grade_python_tests("def f():\n    return 1\n", one)))
        self.assertTrue(failed(graders.grade_python_tests("def f():\n    return True\n", one)))
        self.assertTrue(passed(graders.grade_python_tests("def f():\n    return True\n", true)))
        self.assertTrue(failed(graders.grade_python_tests("def f():\n    return 1\n", true)))
        zero = params("f", {"args": [], "expect": 0})
        self.assertTrue(failed(graders.grade_python_tests("def f():\n    return False\n", zero)))

    def test_bool_is_not_int_inside_a_list_or_dict(self):
        nested = params("f", {"args": [], "expect": {"a": [1, 0]}})
        self.assertTrue(passed(graders.grade_python_tests("def f():\n    return {'a': [1, 0]}\n", nested)))
        self.assertTrue(failed(graders.grade_python_tests("def f():\n    return {'a': [True, False]}\n", nested)))

    def test_plain_equality_otherwise(self):
        number = params("f", {"args": [], "expect": 2})
        self.assertTrue(passed(graders.grade_python_tests("def f():\n    return 2.0\n", number)))
        nothing = params("f", {"args": [], "expect": None})
        self.assertTrue(failed(graders.grade_python_tests("def f():\n    return 0\n", nothing)))
        self.assertTrue(failed(graders.grade_python_tests("def f():\n    return ''\n", nothing)))

    def test_very_large_integers_are_exact(self):
        big = 10 ** 28 + 1
        tests = params("add_one", {"args": [big], "expect": big + 1}, {"args": [2 ** 53], "expect": 2 ** 53 + 1})
        self.assertTrue(passed(graders.grade_python_tests("def add_one(n):\n    return n + 1\n", tests)))
        lossy = "def add_one(n):\n    return int(float(n) + 1)\n"
        self.assertTrue(failed(graders.grade_python_tests(lossy, tests)))

    def test_raises(self):
        wants = params("f", {"args": ["x"], "raises": "ValueError"})
        self.assertTrue(passed(graders.grade_python_tests("def f(s):\n    return int(s)\n", wants)))
        self.assertTrue(failed(graders.grade_python_tests("def f(s):\n    return 0\n", wants)))
        self.assertTrue(failed(graders.grade_python_tests("def f(s):\n    raise KeyError(s)\n", wants)))
        subclass = "class Bad(ValueError):\n    pass\n\ndef f(s):\n    raise Bad(s)\n"
        self.assertTrue(passed(graders.grade_python_tests(subclass, wants)))

    def test_standard_library_imports_work_without_site_packages(self):
        code = ("from decimal import Decimal\nimport re, math, datetime\n"
                "def f(s):\n    return int(Decimal(s) * 100)\n")
        self.assertTrue(passed(graders.grade_python_tests(code, params("f", {"args": ["0.29"], "expect": 29}))))

    def test_a_slow_import_at_load_time_also_times_out(self):
        code = "while True:\n    pass\n\ndef first(xs):\n    return None\n"
        result = graders.grade_python_tests(code, FIRST, timeout=1.5)
        self.assertTrue(failed(result))
        self.assertIn("timed out", result.detail)

    def test_a_timeout_fails(self):
        self.assertEqual(graders.SANDBOX_TIMEOUT_SECONDS, 10)
        code = "def first(xs):\n    while True:\n        pass\n"
        result = graders.grade_python_tests(code, FIRST, timeout=1.5)
        self.assertTrue(failed(result))
        self.assertIn("timed out", result.detail)


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

    def test_refused_code_is_never_run(self):
        code = "import socket\ndef first(xs):\n    return xs[0] if xs else None\n"
        with mock.patch.object(graders.subprocess, "Popen") as popen:
            result = graders.grade_python_tests(code, FIRST)
        popen.assert_not_called()
        self.assertTrue(failed(result))
        self.assertIn("refused before running: imports socket", result.detail)

    def test_the_caveat_is_documented(self):
        for doc in (graders.static_source_problems.__doc__, graders.grade_python_tests.__doc__):
            self.assertIn("NOT A SECURITY BOUNDARY", doc)


class ChildProcessTest(unittest.TestCase):
    """What the child process can see. The static check is switched off for these probes."""

    def probe(self, code, expect):
        with mock.patch.object(graders, "static_source_problems", return_value=[]):
            return graders.grade_python_tests(code, params("probe", {"args": [], "expect": expect}))

    def test_the_environment_is_empty(self):
        os.environ["DTD_TEST_PROBE_VALUE"] = "must-not-reach-the-child"
        self.addCleanup(os.environ.pop, "DTD_TEST_PROBE_VALUE", None)
        allowed = sorted(graders._child_environment())
        self.assertLessEqual(set(allowed), {"SYSTEMROOT"})
        code = "import os\ndef probe():\n    return sorted(k.upper() for k in os.environ)\n"
        result = self.probe(code, allowed)
        self.assertTrue(passed(result), result.detail)

    def test_the_working_directory_is_a_fresh_temporary_folder(self):
        code = ("import os\ndef probe():\n"
                "    here = os.getcwd()\n"
                "    return [os.path.basename(here).startswith('dtd-py-'), sorted(os.listdir(here))]\n")
        result = self.probe(code, [True, ["job.json", "runner.py", "submission.py"]])
        self.assertTrue(passed(result), result.detail)

    def test_isolated_mode_with_no_site_packages(self):
        code = ("import sys\ndef probe():\n"
                "    return [bool(sys.flags.isolated), bool(sys.flags.no_site), 'core' in sys.modules]\n")
        result = self.probe(code, [True, True, False])
        self.assertTrue(passed(result), result.detail)

    def test_the_command_line_uses_isolated_flags_and_an_empty_environment(self):
        real_popen = graders.subprocess.Popen
        seen = {}

        def spy(command, **kwargs):
            seen["command"], seen["kwargs"] = command, kwargs
            return real_popen(command, **kwargs)

        with mock.patch.object(graders.subprocess, "Popen", side_effect=spy):
            result = graders.grade_python_tests("def first(xs):\n    return xs[0] if xs else None\n", FIRST)
        self.assertTrue(passed(result), result.detail)
        self.assertEqual(seen["command"][1:3], ["-I", "-S"])
        self.assertLessEqual(set(seen["kwargs"]["env"]), {"SYSTEMROOT"})
        self.assertNotEqual(os.path.realpath(seen["kwargs"]["cwd"]), os.path.realpath(os.getcwd()))


if __name__ == "__main__":
    unittest.main()
