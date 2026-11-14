"""Tests for the sandbox: the backends' command lines, the self-test's
judgement, the transport, and the program that runs inside.

Nothing here runs model-written code on the host.

* The self-test's judgement is tested on made-up probe reports.
* The transport (``_run_tool``) is tested with a few fixed one-line programs
  written in this file.
* The runner program's own functions are called directly on fixed fixtures
  written in this file, to check its report format.
* The real backends are tested only when one is available AND
  ``DTD_SANDBOX_TESTS=1`` is set. Their hostile probes run only inside the
  sandbox, and only after its self-test has passed.
"""
import os
import re
import sys
import unittest
from unittest import mock

import _support
from _support import FakeBackend, _sandbox_runner, graders, sandbox

REAL_TESTS = os.environ.get("DTD_SANDBOX_TESTS") == "1"


def config_for_judging():
    return {
        "env_name": "X", "list_paths": ["/", "/mnt", "/mnt/c", "/mnt/w"],
        "read_paths": ["/mnt/c/made-up/canary.txt"], "write_paths": ["/usr/dtd-probe"],
        "tcp_targets": [["1.1.1.1", 53], ["127.0.0.1", 5432]],
        "spawn_attempts": 256, "file_mb": 100, "alloc_mb": 1024,
    }


class SelfTestJudgementTest(unittest.TestCase):
    def judge(self, change=None):
        config = config_for_judging()
        facts = _support.contained_facts(config)
        if change:
            change(facts)
        results = sandbox.judge_probe(facts, config, expected_uid=65534)
        return [r.name for r in results if not r.contained], results

    def test_a_contained_sandbox_passes_every_attempt(self):
        leaks, results = self.judge()
        self.assertEqual(leaks, [])
        names = [r.name for r in results]
        for needed in ("list /", "list /mnt", "list /mnt/c", "list /mnt/w", "read host path", "host environment",
                       "user", "write /usr/dtd-probe", "tcp 1.1.1.1:53", "tcp 127.0.0.1:5432", "spawn processes",
                       "write 100 MB file", "allocate 1024 MB"):
            self.assertIn(needed, names)

    def test_each_leak_fails_the_self_test(self):
        leaks = {
            "list /mnt/c": lambda f: f["list"].update({"/mnt/c": {"listed": ["Users", "Windows"]}}),
            "list /mnt/w": lambda f: f["list"].update({"/mnt/w": {"listed": ["x"]}}),
            "list /mnt": lambda f: f["list"].update({"/mnt": {"listed": ["c", "wsl"]}}),
            "list /": lambda f: f["list"].update({"/": {"listed": ["bin", "init", "snap", "usr"]}}),
            "read host path": lambda f: f["read"].update({"/mnt/c/made-up/canary.txt": {"readable": True, "size": 32}}),
            "host environment": lambda f: f.update({"env_seen": True}),
            "user": lambda f: f.update({"uid": 0}),
            "write /usr/dtd-probe": lambda f: f["write"].update({"/usr/dtd-probe": {"written": True}}),
            "tcp 1.1.1.1:53": lambda f: f["tcp"].update({"1.1.1.1:53": {"connected": True}}),
            "tcp 127.0.0.1:5432": lambda f: f["tcp"].update({"127.0.0.1:5432": {"connected": True}}),
            "spawn processes": lambda f: f.update({"spawn": {"spawned": 256, "error": None}}),
            "write 100 MB file": lambda f: f.update({"file": {"written_mb": 100, "error": None}}),
            "allocate 1024 MB": lambda f: f.update({"alloc": {"allocated": True}}),
        }
        for name, change in leaks.items():
            self.assertEqual(self.judge(change)[0], [name], name)

    def test_a_limit_above_the_cap_is_not_contained(self):
        self.assertEqual(self.judge(lambda f: f.update({"spawn": {"spawned": 200, "error": "BlockingIOError"}}))[0],
                         ["spawn processes"])

    def test_missing_facts_count_as_leaks(self):
        for key in ("list", "read", "write", "tcp", "spawn", "file", "alloc", "env_seen", "uid"):
            leaks, _ = self.judge(lambda f, key=key: f.pop(key))
            self.assertTrue(leaks, key)
        leaks, _ = self.judge(lambda f: f.clear())
        self.assertGreaterEqual(len(leaks), 13)

    def test_being_killed_for_it_counts_as_contained(self):
        self.assertEqual(self.judge(lambda f: f.update({"alloc": {"died": 9}, "file": {"died": 25}}))[0], [])
        self.assertEqual(self.judge(lambda f: f.update({"alloc": {"allocated": False, "error": "MemoryError"}}))[0], [])

    def test_self_test_sets_verified_only_on_a_full_pass(self):
        good = FakeBackend()
        self.assertTrue(good.verified and good.last_self_test.passed)
        self.assertTrue(all(line.startswith("contained: ") for line in good.last_self_test.lines()))
        bad = FakeBackend(leak=lambda facts, config: facts["read"].update(
            {path: {"readable": True, "size": 1} for path in config["read_paths"]}))
        self.assertFalse(bad.verified)
        self.assertFalse(bad.last_self_test.passed)
        self.assertTrue(any(line.startswith("NOT CONTAINED: read host path") for line in bad.last_self_test.lines()))

    def test_the_probe_is_asked_to_try_everything(self):
        backend = FakeBackend()
        program = backend.programs[0].decode("utf-8")
        for needed in ('"/mnt"', '"/mnt/c"', '"/mnt/w"', '"/"', "1.1.1.1", "127.0.0.1", "/mnt/c/made-up/canary.txt",
                       '"file_mb": 100', '"alloc_mb": 1024', '"spawn_attempts": 256'):
            self.assertIn(needed, program)

    def test_host_path_spellings(self):
        spellings = sandbox.host_path_spellings(r"D:\Temp\canary.txt")
        for needed in (r"D:\Temp\canary.txt", "D:/Temp/canary.txt", "/mnt/d/Temp/canary.txt",
                       "/host_mnt/d/Temp/canary.txt", "/run/desktop/mnt/host/d/Temp/canary.txt"):
            self.assertIn(needed, spellings)
        self.assertIn("/host/tmp/canary", sandbox.host_path_spellings("/tmp/canary"))

    def test_a_self_test_that_cannot_start_fails_closed(self):
        class Broken(FakeBackend):
            def _execute(self, program, timeout, env_extra=None):
                raise sandbox.SandboxUnavailable("the sandbox did not start")

        self.assertFalse(Broken().verified)

        class Silent(FakeBackend):
            def _execute(self, program, timeout, env_extra=None):
                return sandbox.RunOutput("done", b'{"started": true}\n')

        self.assertFalse(Silent().verified)

        class Missing(FakeBackend):
            def available(self):
                return False, "the tool is not installed"

        missing = Missing()
        self.assertFalse(missing.verified)
        self.assertEqual(missing.last_self_test.detail, "the tool is not installed")


class SelectionTest(unittest.TestCase):
    def setUp(self):
        sandbox.reset()
        self.addCleanup(sandbox.reset)

    def test_no_default_backend(self):
        with mock.patch.dict(os.environ, {}, clear=False):
            os.environ.pop(sandbox.ENV_BACKEND, None)
            with self.assertRaisesRegex(sandbox.SandboxUnavailable, "no sandbox is chosen"):
                sandbox.ready_backend()

    def test_an_unavailable_backend_is_refused_with_its_reason(self):
        for name, cls in sandbox.BACKENDS.items():
            sandbox.reset()
            with mock.patch.object(cls, "available", return_value=(False, "made-up reason")):
                with self.assertRaisesRegex(sandbox.SandboxUnavailable, "made-up reason"):
                    sandbox.ready_backend(name)

    def test_the_self_test_runs_once_and_its_failure_sticks(self):
        calls = []

        def fake_self_test(self, host_paths=None):
            calls.append(1)
            self.verified = False
            self.last_self_test = sandbox.SelfTestReport(self.name, False, [
                sandbox.ProbeResult("tcp 1.1.1.1:53", False, "connected")], "an attempt was not contained")
            return self.last_self_test

        with mock.patch.object(sandbox.DockerBackend, "self_test", fake_self_test):
            for _ in range(3):
                with self.assertRaisesRegex(sandbox.SandboxUnavailable, r"tcp 1\.1\.1\.1:53"):
                    sandbox.ready_backend("docker")
        self.assertEqual(len(calls), 1)

    def test_availability_checks_install_nothing(self):
        seen = []

        def spy(command, **kwargs):
            seen.append(command)
            raise OSError("not run in this test")

        with mock.patch.object(sandbox.subprocess, "run", side_effect=spy), \
                mock.patch.object(sandbox.shutil, "which", return_value="found"):
            sandbox.DockerBackend().available()
            sandbox.WslBwrapBackend().available()
        text = " ".join(" ".join(command) for command in seen)
        for word in ("pull", "install", "apt", "start", "run "):
            self.assertNotIn(word, text)


class CommandLineTest(unittest.TestCase):
    def test_docker_command(self):
        command = sandbox.DockerBackend.command("dtd-sbx-test")
        text = " ".join(command)
        for needed in ("docker run --rm -i", "--pull never", "--name dtd-sbx-test", "--network none", "--read-only",
                       "--cap-drop ALL", "--security-opt no-new-privileges", "--pids-limit 64", "--memory 256m",
                       "--cpus 1", "--user 65534:65534", "--tmpfs /tmp:rw,size=16m,noexec"):
            self.assertIn(needed, text)
        for forbidden in ("-v", "--volume", "--mount", "-e", "--env", "--env-file", "--privileged", "-p", "--publish",
                          "--pid", "--ipc", "--device", "--cap-add"):
            self.assertNotIn(forbidden, command)
        self.assertEqual(command[-5:], [sandbox.DOCKER_IMAGE, "python", "-I", "-S", "-"])

    def test_the_docker_image_is_pinned(self):
        self.assertRegex(sandbox.DOCKER_IMAGE, r"^python:\d+\.\d+\.\d+-[a-z-]+$")
        self.assertNotIn("latest", sandbox.DOCKER_IMAGE)

    def test_wsl_bwrap_command(self):
        with mock.patch.dict(os.environ, {}, clear=False):
            os.environ.pop(sandbox.ENV_WSL_DISTRO, None)
            command = sandbox.WslBwrapBackend().command(10)
        text = " ".join(command)
        for needed in ("timeout -s KILL", "bwrap --unshare-all --die-with-parent --new-session",
                       "--ro-bind /usr /usr", "--symlink usr/lib /lib", "--symlink usr/lib64 /lib64",
                       "--symlink usr/bin /bin", "--proc /proc", "--dev /dev", "--tmpfs /tmp", "--clearenv",
                       "--chdir /tmp", "prlimit", "--cpu=", "--as=", "--fsize=", "--nproc=64"):
            self.assertIn(needed, text)
        self.assertEqual(command[0], "wsl.exe")
        self.assertEqual(command[-4:], ["/usr/bin/python3", "-I", "-S", "-"])
        self.assertNotIn("/mnt", text)
        self.assertNotIn("--share-net", text)
        binds = [command[i + 1] for i, word in enumerate(command) if word in ("--bind", "--ro-bind", "--dev-bind")]
        self.assertEqual(binds, ["/usr"])

    def test_docker_kills_the_named_container_on_expiry(self):
        seen = {}

        def fake_run_tool(command, program, timeout, kill=None, env=None):
            seen["name"] = command[command.index("--name") + 1]
            kill()
            return sandbox.RunOutput("timeout")

        with mock.patch.object(sandbox, "_run_tool", side_effect=fake_run_tool), \
                mock.patch.object(sandbox.subprocess, "run") as run:
            output = sandbox.DockerBackend()._execute(b"", 10)
        self.assertEqual(output.status, "timeout")
        self.assertEqual(run.call_args[0][0], ["docker", "kill", seen["name"]])
        self.assertRegex(seen["name"], r"^dtd-sbx-[0-9a-f]{16}$")


class TransportTest(unittest.TestCase):
    """``_run_tool`` with fixed, harmless one-line programs written here."""

    def tool(self, code, timeout=20.0, program=b""):
        return sandbox._run_tool([sys.executable, "-I", "-S", "-c", code], program, timeout)

    def test_output_is_returned(self):
        output = self.tool("import sys; print('{\"started\": true}', flush=True); print(sys.stdin.read().upper())",
                           program=b"hello")
        self.assertEqual(output.status, "done")
        self.assertEqual(output.stdout.split(), [b'{"started":', b"true}", b"HELLO"])

    def test_the_time_limit_is_enforced_from_the_host(self):
        output = self.tool("import time; print('{\"started\": true}', flush=True); time.sleep(60)", timeout=1.0)
        self.assertEqual(output.status, "timeout")

    def test_output_over_one_megabyte_is_cut_off(self):
        output = self.tool("import sys; print('{\"started\": true}', flush=True)\n"
                           "for _ in range(40): sys.stdout.write('x' * 65536); sys.stdout.flush()")
        self.assertEqual(output.status, "overflow")
        self.assertEqual(output.stdout, b"")

    def test_a_tool_that_never_starts_is_unavailable_not_a_failed_answer(self):
        with self.assertRaises(sandbox.SandboxUnavailable):
            self.tool("raise SystemExit(3)")
        with self.assertRaises(sandbox.SandboxUnavailable):
            sandbox._run_tool(["dtd-no-such-tool-zz"], b"", 5)

    def test_the_kill_hook_always_runs(self):
        calls = []
        sandbox._run_tool([sys.executable, "-I", "-S", "-c", "print('{}', flush=True)"], b"", 20,
                          kill=lambda: calls.append(1))
        self.assertEqual(calls, [1])


class RunnerProgramTest(unittest.TestCase):
    """The program that runs inside the sandbox, checked on fixtures written here."""

    def test_tags(self):
        tag = _sandbox_runner.encode
        self.assertEqual(tag(None), {"t": "none"})
        self.assertEqual(tag(False), {"t": "bool", "v": False})
        self.assertEqual(tag(0), {"t": "int", "v": "0"})
        self.assertEqual(tag(1.5), {"t": "float", "v": "1.5"})
        self.assertEqual(tag("a"), {"t": "str", "v": "a"})
        self.assertEqual(tag([1, (2,)]), {"t": "list", "v": [{"t": "int", "v": "1"},
                                                              {"t": "tuple", "v": [{"t": "int", "v": "2"}]}]})
        self.assertEqual(tag({True: None}), {"t": "dict", "v": [[{"t": "bool", "v": True}, {"t": "none"}]]})
        self.assertEqual(tag({1, 2})["t"], "other")
        import decimal
        self.assertEqual(tag(decimal.Decimal("1.50")), {"t": "decimal", "v": "1.50"})

    def test_the_size_and_depth_caps(self):
        with self.assertRaises(_sandbox_runner._TooLarge):
            _sandbox_runner.encode("x" * 70000)
        with self.assertRaises(_sandbox_runner._TooLarge):
            _sandbox_runner.encode(list(range(10000)))
        nested = []
        for _ in range(100):
            nested = [nested]
        with self.assertRaises(_sandbox_runner._TooLarge):
            _sandbox_runner.encode(nested)
        with self.assertRaises(_sandbox_runner._TooLarge):
            _sandbox_runner.encode(10 ** 100000)

    def test_run_job_reports_values_and_exceptions(self):
        fixture = ("class Bad(ValueError):\n    pass\n\n"
                   "def f(x):\n"
                   "    if x == 'boom':\n        raise Bad(x)\n"
                   "    if x == 'exit':\n        raise SystemExit(0)\n"
                   "    if x == 'big':\n        return 'y' * 100000\n"
                   "    return [x, True, 10 ** 30]\n")
        report = _sandbox_runner.run_job({"source": fixture, "entry": "f", "tests": [[1], ["boom"], ["exit"], ["big"]]})
        values = report["results"]
        self.assertTrue(sandbox.values_equal(values[0]["value"], [1, True, 10 ** 30]))
        self.assertEqual(values[1]["raised"][:2], ["Bad", "ValueError"])
        self.assertEqual(values[2]["raised"][0], "SystemExit")
        self.assertEqual(values[3], {"error": "output_too_large"})

    def test_run_job_reports_a_load_error(self):
        for source, entry in (("def g():\n    return 1\n", "f"), ("f = 3\n", "f"), ("raise SystemExit(0)\n", "f"),
                              ("import no_such_module_zz\n", "f")):
            report = _sandbox_runner.run_job({"source": source, "entry": entry, "tests": [[]]})
            self.assertEqual(sorted(report), ["load_error"], source)

    def test_the_runner_and_probe_need_nothing_but_the_standard_library(self):
        for name in ("_sandbox_runner.py", "_sandbox_probe.py"):
            text = (_support.CORE_DIR / name).read_text(encoding="utf-8")
            imports = set(re.findall(r"^(?:import|from) (\w+)", text, re.MULTILINE))
            self.assertLessEqual(imports, {"json", "os", "sys", "select", "signal", "socket", "time"}, name)
            self.assertNotIn("expect", text.split('"""')[2], name)


def _real_backends():
    if not REAL_TESTS:
        return []
    found = []
    for name, cls in sandbox.BACKENDS.items():
        if cls().available()[0]:
            found.append(name)
    return found


@unittest.skipUnless(_real_backends(), "no real sandbox available, or DTD_SANDBOX_TESTS is not 1")
class RealBackendTest(unittest.TestCase):
    """A real sandbox. Hostile probes run only inside it, after its self-test passed."""

    @classmethod
    def setUpClass(cls):
        sandbox.reset()
        cls.backends = {}
        for name in _real_backends():
            backend = sandbox.BACKENDS[name]()
            report = backend.self_test()
            sys.stderr.write(f"\nsandbox self-test, {name}: {'PASSED' if report.passed else 'FAILED'} ({report.detail})\n")
            for line in report.lines():
                sys.stderr.write("  " + line + "\n")
            cls.backends[name] = backend

    def test_the_self_test_passes(self):
        for name, backend in self.backends.items():
            self.assertTrue(backend.verified, f"{name}: {backend.last_self_test.lines()}")

    def grade(self, backend, code, *tests, timeout=10):
        return graders.grade_python_tests(code, {"type": "python_tests", "entry": "f", "tests": list(tests)},
                                          timeout=timeout, backend=backend)

    def test_grading_inside_the_sandbox(self):
        for name, backend in self.backends.items():
            if not backend.verified:
                self.skipTest(f"{name} failed its self-test; nothing is run in it")
            good = self.grade(backend, "def f(n):\n    return n + 1\n", {"args": [10 ** 28], "expect": 10 ** 28 + 1},
                              {"args": [1], "expect": 2})
            self.assertIs(good.passed, True, good.detail)
            self.assertIs(self.grade(backend, "def f(n):\n    return True\n", {"args": [0], "expect": 1}).passed, False)
            slow = self.grade(backend, "def f():\n    while True:\n        pass\n", {"args": [], "expect": 1}, timeout=2)
            self.assertIn("timed out", slow.detail)
            loud = self.grade(backend, "def f():\n    return 'x' * 10 ** 7\n", {"args": [], "expect": 1})
            self.assertIn("over the cap", loud.detail)

    def test_hostile_probes_are_contained(self):
        # Each probe returns "LEAK" only if the sandbox let it through. The
        # pre-filter is switched off so that they reach the sandbox. They run
        # nowhere else, and only after the self-test above has passed.
        probes = (
            "import os\ndef f():\n    return 'LEAK' if os.listdir('/mnt/c') else 'empty'\n",
            "import os\ndef f():\n    return 'LEAK' if 'USERPROFILE' in os.environ or 'WSLENV' in os.environ else 'clean'\n",
            "import socket\ndef f():\n    socket.create_connection(('1.1.1.1', 53), 3)\n    return 'LEAK'\n",
            "def f():\n    block = bytearray(1 << 30)\n    block[::4096] = b'x' * len(block[::4096])\n    return 'LEAK'\n",
            "def f():\n    with open('/usr/dtd-probe', 'w') as handle:\n        handle.write('x')\n    return 'LEAK'\n",
        )
        for name, backend in self.backends.items():
            if not backend.verified:
                self.skipTest(f"{name} failed its self-test; nothing is run in it")
            with mock.patch.object(graders, "static_source_problems", return_value=[]):
                for code in probes:
                    result = self.grade(backend, code, {"args": [], "expect": "LEAK"})
                    self.assertIs(result.passed, False, f"{name}: {code}")


if __name__ == "__main__":
    unittest.main()
