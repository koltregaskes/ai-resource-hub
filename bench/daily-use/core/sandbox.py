"""The sandbox that runs model-written Python for ``python_tests`` tasks.

No model-written code runs on the host. There is no in-process mode and no
plain-subprocess mode, and nothing falls back to one.

How it works:

1. The host builds a job holding only the submitted source, the entry name
   and the test ARGUMENTS. Expected values and expected exceptions never
   leave the host (``build_job``).
2. A backend starts a real sandbox and sends it the runner program
   (``_sandbox_runner.py``) with the job, on standard input. Nothing is
   mounted into the sandbox and no file is written for it.
3. The runner reports, per test, the returned value with explicit type tags,
   or the exception raised. Output is capped: 64 KB per test, 1 MB in all.
4. The host compares each returned value with the task's ``expect``
   (``values_equal``): Python ``==``, with ``bool`` never equal to a number,
   at any depth, dictionary keys included.

Backends:

* ``DockerBackend`` (``DTD_SANDBOX=docker``): a throwaway container with no
  network, a read-only root, no capabilities, a process limit, a memory limit
  and no volume mounts.
* ``WslBwrapBackend`` (``DTD_SANDBOX=wsl-bwrap``): bubblewrap inside WSL, with
  every namespace unshared, only ``/usr`` bound (read-only), and ``timeout``
  and ``prlimit`` limits.

A backend is chosen explicitly, by argument or by the ``DTD_SANDBOX``
environment variable. There is no default. Before any grading, the backend's
``self_test()`` must pass IN THIS PROCESS: it runs a fixed, benign probe inside
the sandbox that tries to reach the host's files, the network, more processes,
more disk and more memory than allowed, and it passes only if every attempt
failed or was contained. If no backend is chosen, the tool is missing, or the
self-test fails, ``ready_backend`` raises ``SandboxUnavailable`` and the task
is not graded at all.

Nothing here installs, downloads or pulls anything.
"""
from __future__ import annotations

import json
import os
import re
import secrets
import shutil
import subprocess
import tempfile
import threading
from dataclasses import dataclass, field
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any, Optional, Sequence

ENV_BACKEND = "DTD_SANDBOX"
ENV_WSL_DISTRO = "DTD_WSL_DISTRO"

# The pinned official Python image, named by its content digest so that the
# availability check, the self-test and every grading run use identical image
# contents (a tag can be moved; a digest cannot). ``DOCKER_IMAGE_TAG`` is the
# tag the digest was read from and is for people, never passed to Docker.
# The image must already be present locally: containers are started with
# ``--pull never``.
DOCKER_IMAGE_TAG = "python:3.12.7-slim-bookworm"
DOCKER_IMAGE = "python@sha256:60d9996b6a8a3689d36db740b49f4327be3be09a21122bd02fb8895abb38b50d"
DOCKER_USER = "65534:65534"
DOCKER_UID = 65534

PIDS_LIMIT = 64
MEMORY_MB = 256
TMP_MB = 16
CPU_SECONDS = 20

MAX_RESULT_BYTES = 64 * 1024
MAX_TOTAL_OUTPUT_BYTES = 1024 * 1024
MAX_SOURCE_CHARS = 100_000
MAX_INT_DIGITS = 4000

START_SECONDS = 60          # for the sandbox to come up; not charged to the answer
SELF_TEST_SECONDS = 120
TOOL_CHECK_SECONDS = 30

_HERE = Path(__file__).resolve().parent
_CREATE_NO_WINDOW = getattr(subprocess, "CREATE_NO_WINDOW", 0)

# What a contained sandbox may show at its root.
ALLOWED_ROOT_ENTRIES = frozenset({
    "bin", "boot", "dev", "etc", "home", "lib", "lib32", "lib64", "libx32", "media", "mnt", "opt",
    "proc", "root", "run", "sbin", "srv", "sys", "tmp", "usr", "var", ".dockerenv",
})
# Loopback ports tried from inside: none may connect. 4173 and 5432 are the
# estate's own web server and database.
LOOPBACK_PORTS = (80, 135, 443, 445, 4173, 5432)
PROBE_SPAWN_ATTEMPTS = 256
PROBE_FILE_MB = 100
PROBE_ALLOC_MB = 1024


class SandboxUnavailable(RuntimeError):
    """No proven sandbox, so model-written code must not be run or graded."""


@dataclass(frozen=True)
class RunOutput:
    """What came back from one sandbox run. ``status`` is ``done``,
    ``timeout`` or ``overflow`` (more output than the cap)."""

    status: str
    stdout: bytes = b""


@dataclass
class ProbeResult:
    name: str
    contained: bool
    detail: str


@dataclass
class SelfTestReport:
    backend: str
    passed: bool
    results: list = field(default_factory=list)
    detail: str = ""

    def lines(self) -> list:
        """One line per probe, for a log or a report."""
        return [f"{'contained' if r.contained else 'NOT CONTAINED'}: {r.name} ({r.detail})" for r in self.results]


# ---------------------------------------------------------------- the job and its program

def build_job(source: str, entry: str, tests: Sequence) -> dict:
    """The job sent into the sandbox: source, entry name and arguments only.

    ``tests`` is the task's test list. Only each test's ``args`` is copied;
    ``expect`` and ``raises`` stay on the host.
    """
    return {"source": source, "entry": entry, "tests": [list(test["args"]) for test in tests]}


def _program(script_name: str, argument: Any) -> bytes:
    """A script's text followed by one call of its ``_main`` with a JSON string."""
    text = (_HERE / script_name).read_text(encoding="utf-8")
    return (text + "\n\n_main(" + repr(json.dumps(argument)) + ")\n").encode("utf-8")


# ---------------------------------------------------------------- running a command-line tool

def _run_tool(command: list, program: bytes, timeout: float, kill=None, env=None) -> RunOutput:
    """Start a sandbox tool, feed it ``program`` and collect its capped output.

    The time limit runs from the moment the sandboxed program reports that it
    has started (its first output line), so the sandbox coming up is not
    charged to the answer. If it never starts, ``SandboxUnavailable`` is raised.
    """
    try:
        process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                   stderr=subprocess.DEVNULL, env=env, creationflags=_CREATE_NO_WINDOW)
    except OSError as exc:
        raise SandboxUnavailable(f"the sandbox tool could not be started: {type(exc).__name__}") from None
    data = bytearray()
    state = {"overflow": False}
    started, done, woke = threading.Event(), threading.Event(), threading.Event()

    def read():
        try:
            while True:
                chunk = process.stdout.read1(65536)
                if not chunk:
                    break
                data.extend(chunk)
                if not started.is_set() and b"\n" in data:
                    started.set()
                    woke.set()
                if len(data) > MAX_TOTAL_OUTPUT_BYTES:
                    state["overflow"] = True
                    break
        except (OSError, ValueError):
            pass
        finally:
            done.set()
            woke.set()

    def write():
        try:
            process.stdin.write(program)
            process.stdin.close()
        except (OSError, ValueError):
            pass

    threading.Thread(target=read, daemon=True).start()
    threading.Thread(target=write, daemon=True).start()
    try:
        woke.wait(START_SECONDS)
        if not started.is_set():
            raise SandboxUnavailable("the sandbox did not start; nothing was graded")
        finished = done.wait(timeout)
    finally:
        if kill is not None:
            kill()
        try:
            process.kill()
        except OSError:
            pass
        try:
            process.wait(timeout=20)
        except (OSError, subprocess.SubprocessError):
            pass
        for stream in (process.stdin, process.stdout):
            try:
                stream.close()
            except (OSError, ValueError, AttributeError):
                pass
    if state["overflow"]:
        return RunOutput("overflow")
    if not finished:
        return RunOutput("timeout")
    return RunOutput("done", bytes(data))


def _tool_ok(command: list) -> bool:
    try:
        done = subprocess.run(command, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                              stderr=subprocess.DEVNULL, timeout=TOOL_CHECK_SECONDS,
                              creationflags=_CREATE_NO_WINDOW)
    except (OSError, subprocess.SubprocessError):
        return False
    return done.returncode == 0


# ---------------------------------------------------------------- backends

class SandboxBackend:
    """A real sandbox. Subclasses supply ``available`` and ``_execute``."""

    name = "none"
    expected_uid: Optional[int] = None

    def __init__(self) -> None:
        self.verified = False
        self.last_self_test: Optional[SelfTestReport] = None

    def available(self) -> tuple:
        """``(True, "")`` when the tool is there, else ``(False, reason)``. Installs nothing."""
        raise NotImplementedError

    def _execute(self, program: bytes, timeout: float, env_extra: Optional[dict] = None) -> RunOutput:
        """Run ``program`` (Python source) inside the sandbox, fed on standard input."""
        raise NotImplementedError

    def run_job(self, job: dict, timeout: float) -> RunOutput:
        return self._execute(_program("_sandbox_runner.py", job), timeout)

    def self_test(self, host_paths: Optional[Sequence[str]] = None) -> SelfTestReport:
        """Run the fixed probe inside the sandbox and check every attempt was contained.

        ``host_paths`` are host files the sandbox must not be able to read.
        With none given, a throwaway file is made in the host's temporary
        folder for the purpose. The report lists each attempt and its result.
        """
        self.verified = False
        ok, reason = self.available()
        if not ok:
            self.last_self_test = SelfTestReport(self.name, False, [], reason)
            return self.last_self_test
        env_name = "DTD_SANDBOX_CANARY_" + secrets.token_hex(4).upper()
        made = None
        try:
            if host_paths is None:
                handle = tempfile.NamedTemporaryFile(prefix="dtd-sandbox-canary-", suffix=".txt", delete=False)
                handle.write(secrets.token_hex(16).encode("ascii"))
                handle.close()
                made = handle.name
                host_paths = [made]
            config = {
                "env_name": env_name,
                "list_paths": ["/", "/mnt", "/mnt/c", "/mnt/w"],
                "read_paths": sorted({c for path in host_paths for c in host_path_spellings(path)}),
                "write_paths": ["/usr/dtd-probe"],
                "tcp_targets": [["1.1.1.1", 53]] + [["127.0.0.1", port] for port in LOOPBACK_PORTS],
                "spawn_attempts": PROBE_SPAWN_ATTEMPTS,
                "file_mb": PROBE_FILE_MB,
                "alloc_mb": PROBE_ALLOC_MB,
            }
            try:
                output = self._execute(_program("_sandbox_probe.py", config), SELF_TEST_SECONDS,
                                       env_extra={env_name: "1"})
            except SandboxUnavailable as exc:
                self.last_self_test = SelfTestReport(self.name, False, [], str(exc))
                return self.last_self_test
        finally:
            if made is not None:
                try:
                    os.unlink(made)
                except OSError:
                    pass
        facts = _last_json_line(output.stdout) if output.status == "done" else None
        if not isinstance(facts, dict):
            self.last_self_test = SelfTestReport(self.name, False, [], f"the probe gave no report ({output.status})")
            return self.last_self_test
        results = judge_probe(facts, config, self.expected_uid)
        passed = bool(results) and all(r.contained for r in results)
        self.last_self_test = SelfTestReport(self.name, passed, results,
                                             "every attempt was contained" if passed else "an attempt was not contained")
        self.verified = passed
        return self.last_self_test


class DockerBackend(SandboxBackend):
    """A throwaway Docker container: no network, read-only, no mounts."""

    name = "docker"
    expected_uid = DOCKER_UID

    def available(self) -> tuple:
        if shutil.which("docker") is None:
            return False, "the docker command is not installed"
        if not _tool_ok(["docker", "version", "--format", "{{.Server.Version}}"]):
            return False, "the Docker engine is not running"
        if not _tool_ok(["docker", "image", "inspect", DOCKER_IMAGE]):
            return False, f"the pinned image {DOCKER_IMAGE} is not present locally (nothing is pulled automatically)"
        return True, ""

    @staticmethod
    def command(name: str) -> list:
        return [
            "docker", "run", "--rm", "-i", "--pull", "never", "--name", name,
            "--network", "none", "--read-only", "--cap-drop", "ALL",
            "--security-opt", "no-new-privileges", "--pids-limit", str(PIDS_LIMIT),
            "--memory", f"{MEMORY_MB}m", "--memory-swap", f"{MEMORY_MB}m", "--cpus", "1",
            "--user", DOCKER_USER, "--tmpfs", f"/tmp:rw,size={TMP_MB}m,noexec", "--workdir", "/tmp",
            DOCKER_IMAGE, "python", "-I", "-S", "-",
        ]

    def _execute(self, program: bytes, timeout: float, env_extra: Optional[dict] = None) -> RunOutput:
        name = "dtd-sbx-" + secrets.token_hex(8)
        # The docker client keeps the host's environment (it needs it to find
        # the engine). None of it is passed into the container: there is no -e.
        env = dict(os.environ)
        env.update(env_extra or {})

        def kill():
            try:
                subprocess.run(["docker", "kill", name], stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                               stderr=subprocess.DEVNULL, timeout=TOOL_CHECK_SECONDS,
                               creationflags=_CREATE_NO_WINDOW)
            except (OSError, subprocess.SubprocessError):
                pass

        return _run_tool(self.command(name), program, timeout, kill=kill, env=env)


class WslBwrapBackend(SandboxBackend):
    """bubblewrap inside WSL: every namespace unshared, only /usr bound."""

    name = "wsl-bwrap"

    @staticmethod
    def _wsl() -> list:
        distro = os.environ.get(ENV_WSL_DISTRO)
        return ["wsl.exe"] + (["-d", distro] if distro else [])

    def available(self) -> tuple:
        if shutil.which("wsl.exe") is None:
            return False, "wsl.exe is not installed"
        check = "command -v bwrap && command -v timeout && command -v prlimit && command -v python3"
        if not _tool_ok(self._wsl() + ["-e", "sh", "-c", check]):
            return False, "bwrap, timeout, prlimit or python3 is missing inside WSL"
        return True, ""

    def command(self, timeout: float) -> list:
        megabyte = 1024 * 1024
        return self._wsl() + [
            "--cd", "/", "-e", "timeout", "-s", "KILL", str(int(timeout + START_SECONDS)),
            "bwrap", "--unshare-all", "--die-with-parent", "--new-session",
            "--ro-bind", "/usr", "/usr", "--symlink", "usr/lib", "/lib", "--symlink", "usr/lib64", "/lib64",
            "--symlink", "usr/bin", "/bin", "--proc", "/proc", "--dev", "/dev", "--tmpfs", "/tmp",
            "--clearenv", "--chdir", "/tmp",
            "/usr/bin/prlimit", f"--cpu={CPU_SECONDS}", f"--as={MEMORY_MB * megabyte}",
            f"--fsize={TMP_MB * megabyte}", f"--nproc={PIDS_LIMIT}", "--core=0",
            "/usr/bin/python3", "-I", "-S", "-",
        ]

    def _execute(self, program: bytes, timeout: float, env_extra: Optional[dict] = None) -> RunOutput:
        env = dict(os.environ)
        env.update(env_extra or {})
        # Killing wsl.exe ends the Windows side; inside WSL, "timeout -s KILL"
        # and bwrap's --die-with-parent end the sandboxed process.
        return _run_tool(self.command(timeout), program, timeout, env=env)


BACKENDS = {DockerBackend.name: DockerBackend, WslBwrapBackend.name: WslBwrapBackend}
_ready: dict = {}
_ready_lock = threading.Lock()


def ready_backend(name: Optional[str] = None) -> SandboxBackend:
    """The chosen backend, once its self-test has passed in this process.

    ``name`` is ``docker`` or ``wsl-bwrap``; without it the ``DTD_SANDBOX``
    environment variable is read. There is no default. The self-test runs
    once per process and its result, pass or fail, is kept. Raises
    ``SandboxUnavailable`` with the reason otherwise.
    """
    chosen = (name or os.environ.get(ENV_BACKEND) or "").strip().lower()
    if not chosen:
        raise SandboxUnavailable(f"no sandbox is chosen (set {ENV_BACKEND} to docker or wsl-bwrap)")
    if chosen not in BACKENDS:
        raise SandboxUnavailable(f"unknown sandbox {chosen!r} (use docker or wsl-bwrap)")
    with _ready_lock:
        backend = _ready.get(chosen)
        if backend is None:
            backend = BACKENDS[chosen]()
            backend.self_test()
            _ready[chosen] = backend
    if not backend.verified:
        report = backend.last_self_test
        failed = [r.name for r in report.results if not r.contained] if report else []
        reason = report.detail if report else "the self-test did not run"
        raise SandboxUnavailable(f"sandbox {chosen}: {reason}" + (f" ({', '.join(failed)})" if failed else ""))
    return backend


def reset() -> None:
    """Forget every self-test result (for tests)."""
    with _ready_lock:
        _ready.clear()


# ---------------------------------------------------------------- judging the probe

def host_path_spellings(path: str) -> list:
    """The ways a host path might show up inside a sandbox that leaked a mount."""
    spellings = {path, path.replace("\\", "/")}
    match = re.match(r"^([A-Za-z]):[\\/](.*)$", path)
    if match:
        drive, rest = match.group(1).lower(), match.group(2).replace("\\", "/")
        for root in ("/mnt", "/host_mnt", "/run/desktop/mnt/host", ""):
            spellings.add(f"{root}/{drive}/{rest}")
    else:
        spellings.add("/host" + path)
    return sorted(spellings)


def judge_probe(facts: dict, config: dict, expected_uid: Optional[int] = None) -> list:
    """Decide, for each attempt the probe made, whether it was contained.

    A missing or unreadable fact counts as NOT contained, so a probe that
    didn't really run can't pass.
    """
    results = []

    def add(name, contained, detail):
        results.append(ProbeResult(name, bool(contained), str(detail)[:200]))

    def get(key, sub=None):
        value = facts.get(key)
        if sub is not None:
            value = value.get(sub) if isinstance(value, dict) else None
        return value if isinstance(value, dict) else {}

    for path in config["list_paths"]:
        fact = get("list", path)
        listed = fact.get("listed", "missing")
        if path == "/":
            ok = isinstance(listed, list) and set(listed) <= ALLOWED_ROOT_ENTRIES
            add("list /", ok, "only the sandbox's own root" if ok else f"unexpected entries: {listed}")
        else:
            ok = listed is None or listed == []
            add(f"list {path}", ok, fact.get("error", "empty") if ok else f"entries visible: {listed}")
    for path in config["read_paths"]:
        fact = get("read", path)
        ok = fact.get("readable") is False
        add("read host path", ok, fact.get("error", "") if ok else "a host file could be read")
    add("host environment", facts.get("env_seen") is False,
        "host variable not visible" if facts.get("env_seen") is False else "a host variable was visible")
    if expected_uid is not None:
        add("user", facts.get("uid") == expected_uid, f"uid {facts.get('uid')}")
    for path in config["write_paths"]:
        fact = get("write", path)
        ok = fact.get("written") is False
        add(f"write {path}", ok, fact.get("error", "") if ok else "the write succeeded")
    for host, port in config["tcp_targets"]:
        fact = get("tcp", f"{host}:{port}")
        ok = fact.get("connected") is False
        add(f"tcp {host}:{port}", ok, fact.get("error", "") if ok else "connected, or no result")
    spawn = get("spawn")
    count = spawn.get("spawned")
    ok = isinstance(count, int) and count <= PIDS_LIMIT and count < config["spawn_attempts"] and bool(spawn.get("error"))
    add("spawn processes", ok, f"{count} started before {spawn.get('error')}" if ok else f"{count} started, no limit hit")
    written = get("file")
    megabytes = written.get("written_mb")
    ok = (isinstance(megabytes, int) and megabytes < config["file_mb"]) or "died" in written
    add(f"write {config['file_mb']} MB file", ok,
        f"stopped at {megabytes} MB ({written.get('error')})" if isinstance(megabytes, int) else f"{written}")
    alloc = get("alloc")
    ok = alloc.get("allocated") is False or "died" in alloc
    add(f"allocate {config['alloc_mb']} MB", ok,
        alloc.get("error") or (f"killed by signal {alloc.get('died')}" if "died" in alloc else "allocated"))
    return results


# ---------------------------------------------------------------- the host side of a test run

def _last_json_line(data: bytes):
    for raw in reversed(data.split(b"\n")):
        if raw.strip():
            try:
                return json.loads(raw.decode("utf-8"))
            except (ValueError, RecursionError):
                return None
    return None


def _number(tagged: dict):
    """The Python number a tagged value stands for, or None."""
    kind, text = tagged.get("t"), tagged.get("v")
    if not isinstance(text, str):
        return None
    try:
        if kind == "int":
            if len(text) > MAX_INT_DIGITS or not re.fullmatch(r"-?[0-9]+", text):
                return None
            return int(text)
        if kind == "float":
            return float(text)
        if kind == "decimal":
            return Decimal(text)
    except (ValueError, InvalidOperation):
        return None
    return None


def values_equal(got: Any, want: Any) -> bool:
    """Whether a tagged returned value equals an expected value from the task file.

    Python ``==``, except that ``bool`` equals only the same ``bool``. A list
    never equals a tuple. Dictionary keys follow the same rules, so the key
    ``True`` is not the key ``1``.
    """
    if not isinstance(got, dict):
        return False
    kind = got.get("t")
    if want is None:
        return kind == "none"
    if isinstance(want, bool):
        return kind == "bool" and got.get("v") is want
    if isinstance(want, (int, float, Decimal)):
        number = _number(got)
        try:
            return number is not None and bool(number == want)
        except (ArithmeticError, ValueError):
            return False
    if isinstance(want, str):
        return kind == "str" and got.get("v") == want
    if isinstance(want, (list, tuple)):
        items = got.get("v")
        return (kind == ("list" if isinstance(want, list) else "tuple") and isinstance(items, list)
                and len(items) == len(want) and all(values_equal(g, w) for g, w in zip(items, want)))
    if isinstance(want, dict):
        pairs = got.get("v")
        if kind != "dict" or not isinstance(pairs, list) or len(pairs) != len(want):
            return False
        if not all(isinstance(pair, list) and len(pair) == 2 for pair in pairs):
            return False
        for key, value in want.items():
            if not any(values_equal(k, key) and values_equal(v, value) for k, v in pairs):
                return False
        return True
    return False


def _clean(name: Any) -> str:
    return "".join(ch for ch in str(name)[:60] if ch.isalnum() or ch == "_") or "object"


@dataclass
class SandboxRun:
    """The host's verdict on one sandbox run.

    ``status`` is ``ok`` (every test has a verdict in ``passed`` and a reason
    in ``why``), ``load_error``, ``timeout``, ``output_cap`` or ``no_report``.
    """

    status: str
    passed: list = field(default_factory=list)
    why: list = field(default_factory=list)
    detail: str = ""


def run_tests(backend: SandboxBackend, source: str, entry: str, tests: Sequence, timeout: float) -> SandboxRun:
    """Run the submitted source in the sandbox and compare, on the host.

    Refuses (``SandboxUnavailable``) unless the backend's self-test has passed
    in this process.
    """
    if backend is None or getattr(backend, "verified", False) is not True:
        raise SandboxUnavailable("the sandbox self-test has not passed in this process")
    output = backend.run_job(build_job(source, entry, tests), timeout)
    if output.status == "timeout":
        return SandboxRun("timeout")
    if output.status == "overflow":
        return SandboxRun("output_cap")
    report = _last_json_line(output.stdout)
    if not isinstance(report, dict) or report.get("started") is True:
        return SandboxRun("no_report")
    if "load_error" in report:
        return SandboxRun("load_error", detail=_clean(report["load_error"]))
    results = report.get("results")
    if not isinstance(results, list) or len(results) != len(tests):
        return SandboxRun("no_report")
    run = SandboxRun("ok")
    for test, result in zip(tests, results):
        ok, why = False, "failed"
        if not isinstance(result, dict):
            why = "no result"
        elif len(json.dumps(result)) > MAX_RESULT_BYTES or result.get("error") == "output_too_large":
            why = "output over the cap"
        elif "error" in result:
            why = "result could not be reported"
        elif "raised" in result:
            names = [_clean(n) for n in result["raised"]] if isinstance(result["raised"], list) else []
            ok = "raises" in test and test["raises"] in names
            why = "raised " + (names[0] if names else "an exception")
        elif "raises" in test:
            why = "no exception"
        else:
            try:
                ok = values_equal(result.get("value"), test["expect"])
            except RecursionError:
                ok = False
            why = "" if ok else "wrong result"
        run.passed.append(ok)
        run.why.append(why)
    return run
