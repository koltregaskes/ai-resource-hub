"""Graders for the Day-to-Day Bench, one function per grader type.

The binding rules are in ``task-set-v1/README.md`` ("Grader rules") and in the
method's "Grading" section. In short:

* The answer is the model's whole reply with leading and trailing whitespace
  removed.
* A single Markdown code fence is unwrapped for ``json``, ``formula`` and
  ``python_tests`` only. For every other grader the fence is part of the answer.
* A script verdict is final. Only ``by: "judge"`` checklist checks, and replies
  the outcome patterns can't classify, ever go to a judge.

Every grader returns a ``GradeResult``. ``grade(task, reply)`` picks the grader
from the task. Nothing here calls a model or the network.
"""
from __future__ import annotations

import ast
import atexit
import importlib.util
import json
import os
import queue
import re
import subprocess
import sys
import tempfile
import threading
from dataclasses import dataclass, field
from decimal import Decimal, DecimalException
from pathlib import Path
from typing import Any, Mapping, Optional

from . import sandbox
from .tasks import TaskSetError, compile_flags

SANDBOX_TIMEOUT_SECONDS = 10
FORMULA_TOLERANCE = Decimal("0.005")
FORMULA_DEFAULT_CELL = "C2"
FORMULA_ENGINE_START_SECONDS = 180
MAX_FORMULA_CHARS = 2000
# A JSON number further from zero than 10**400, or closer to it than 10**-400,
# is outside the supported range and is rejected.
MAX_NUMBER_EXPONENT = 400
MAX_INT_DIGITS = 4000
MIN_JUDGES = 2

PASSED = "passed"
FAILED = "failed"
NEEDS_JUDGE = "needs_judge"
PENDING = "pending"
# A python_tests reply that could not be run because there is no proven
# sandbox. It is not a verdict: the task has not been graded.
SANDBOX_UNAVAILABLE = "sandbox_unavailable"

# States of one checklist check.
CHECK_PASSED = "passed"
CHECK_FAILED = "failed"
CHECK_NEEDS_JUDGE = "needs_judge"
CHECK_DISPUTED = "disputed"
CHECK_UNRESOLVED = "judge_unresolved"
CHECK_NOT_RUN = "not_run"


class FormulaEngineUnavailable(RuntimeError):
    """The formula engine can't be used, so formula tasks must not be graded."""


class GraderConfigError(TaskSetError):
    """A grader block can't be applied as written."""


@dataclass(frozen=True)
class NeedsJudge:
    """A marker for one model-judged check that still needs the judge panel."""

    check_id: str
    text: str


@dataclass
class CheckResult:
    """The state of one checklist check."""

    id: str
    text: str
    by: str
    status: str


@dataclass
class GradeResult:
    """What a grader decided.

    ``status`` is one of:

    * ``passed``: the answer is accepted.
    * ``failed``: the answer is rejected. ``failed_by`` says whether a script
      or the judges rejected it.
    * ``needs_judge``: every script check passed and judge verdicts are still
      needed (a checklist), or the outcome patterns couldn't classify the reply
      (an abstain task).
    * ``pending``: verdicts were supplied but at least one check is
      ``judge_unresolved``.
    * ``sandbox_unavailable``: a ``python_tests`` reply was not run because
      there is no proven sandbox. The task has not been graded.

    ``malformed`` is true when the reply couldn't be parsed in the format the
    task requires (JSON that doesn't parse, Python with a syntax error, a
    formula the engine can't read).
    """

    status: str
    detail: str = ""
    malformed: bool = False
    failed_by: Optional[str] = None
    checks: list = field(default_factory=list)

    @property
    def passed(self) -> Optional[bool]:
        """True, False, or None while a judge is still needed."""
        if self.status == PASSED:
            return True
        if self.status == FAILED:
            return False
        return None

    @property
    def needs_judge(self) -> list:
        """A ``NeedsJudge`` marker for every check still waiting for the judges."""
        return [NeedsJudge(c.id, c.text) for c in self.checks
                if c.status in (CHECK_NEEDS_JUDGE, CHECK_UNRESOLVED)]


def _ok(detail: str = "") -> GradeResult:
    return GradeResult(PASSED, detail)


def _fail(detail: str, malformed: bool = False) -> GradeResult:
    return GradeResult(FAILED, detail, malformed=malformed, failed_by="script")


# ---------------------------------------------------------------- answers

_FENCE_RE = re.compile(r"\A(`{3,}|~{3,})[^\n`]*\n(.*?)\n?[ \t]*\1[ \t]*\Z", re.DOTALL)
_FENCE_LINE_RE = re.compile(r"^[ \t]*(?:`{3,}|~{3,})", re.MULTILINE)


def trim(reply: Any) -> str:
    """The answer: the full reply with leading and trailing whitespace removed."""
    if not isinstance(reply, str):
        raise TypeError("a reply must be a string")
    return reply.strip()


def unwrap_fence(answer: str) -> str:
    """Unwrap a reply that is exactly one Markdown code fence.

    Used for ``json``, ``formula`` and ``python_tests`` only. A reply with
    prose around the fence, or with more than one fence, is left as it is.
    """
    match = _FENCE_RE.match(answer)
    if match is None or _FENCE_LINE_RE.search(match.group(2)):
        return answer
    return match.group(2).strip()


def word_count(answer: str) -> int:
    """Words are counted by splitting on whitespace."""
    return len(answer.split())


# ---------------------------------------------------------------- exact, one_of, regex

def _same_text(answer: str, value: str, case_sensitive: bool) -> bool:
    value = value.strip()
    if case_sensitive:
        return answer == value
    return answer.casefold() == value.casefold()


def grade_exact(reply: str, params: Mapping) -> GradeResult:
    """Equal to ``value`` after trimming; case-insensitive unless ``case_sensitive``."""
    answer = trim(reply)
    if _same_text(answer, params["value"], bool(params.get("case_sensitive", False))):
        return _ok()
    return _fail("not equal to the expected value")


def grade_one_of(reply: str, params: Mapping) -> GradeResult:
    """``exact`` against any of ``values``."""
    answer = trim(reply)
    case_sensitive = bool(params.get("case_sensitive", False))
    if any(_same_text(answer, value, case_sensitive) for value in params["values"]):
        return _ok()
    return _fail("not one of the expected values")


def grade_regex(reply: str, params: Mapping) -> GradeResult:
    """The pattern must match the whole answer, unless ``search`` is true."""
    answer = trim(reply)
    pattern = re.compile(params["pattern"], compile_flags(params.get("flags")))
    found = pattern.search(answer) if params.get("search", False) else pattern.fullmatch(answer)
    return _ok() if found else _fail("the pattern does not match")


# ---------------------------------------------------------------- numeric

_NUMBER = r"-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?"
_ONLY_NUMBER_RE = re.compile(_NUMBER)
# For last_number: a minus sign counts only when it doesn't follow a word
# character, so "10-14" ends in 14, not in -14.
_ANY_NUMBER_RE = re.compile(r"(?:(?<![\w.,)])-)?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?")


def _to_decimal(text: str) -> Decimal:
    return Decimal(text.replace(",", ""))


def _decimal_of(value: Any) -> Decimal:
    """A task-file number as a decimal, read the way it was written."""
    return Decimal(str(value))


def _supported_number(number: Decimal) -> bool:
    """Finite, and within 10**-400 to 10**400 in size (or zero)."""
    if not number.is_finite():
        return False
    return number == 0 or -MAX_NUMBER_EXPONENT <= number.adjusted() <= MAX_NUMBER_EXPONENT


def grade_numeric(reply: str, params: Mapping) -> GradeResult:
    """A number within ``tolerance`` of ``value``, compared as decimals.

    ``only_number``: the whole answer must be one number and nothing else,
    except for at most one ``allow_affixes`` string straight before it and one
    straight after it. ``last_number``: the last number in the answer.
    """
    answer = trim(reply)
    if params["extract"] == "only_number":
        affixes = params.get("allow_affixes") or []
        if affixes:
            choice = "|".join(re.escape(a) for a in sorted(affixes, key=len, reverse=True))
            pattern = re.compile(rf"(?:(?:{choice})[ \t\u00a0]*)?({_NUMBER})(?:[ \t\u00a0]*(?:{choice}))?")
            match = pattern.fullmatch(answer)
            text = match.group(1) if match else None
        else:
            text = answer if _ONLY_NUMBER_RE.fullmatch(answer) else None
        if text is None:
            return _fail("the answer is not one number and nothing else")
    else:
        found = _ANY_NUMBER_RE.findall(answer)
        if not found:
            return _fail("no number in the answer")
        text = found[-1]
    try:
        number = _to_decimal(text)
        if not _supported_number(number):
            return _fail("the number is outside the supported range")
        close = abs(number - _decimal_of(params["value"])) <= _decimal_of(params["tolerance"])
    except DecimalException:
        return _fail("the number could not be read")
    return _ok() if close else _fail("the number is outside the tolerance")


# ---------------------------------------------------------------- json

def _refuse_constant(name: str):
    raise ValueError(name)


_OUT_OF_RANGE = Decimal("Infinity")


def _json_float(text: str) -> Decimal:
    try:
        number = Decimal(text)
    except DecimalException:
        return _OUT_OF_RANGE
    return number if _supported_number(number) else _OUT_OF_RANGE


def _json_int(text: str):
    if len(text) > MAX_INT_DIGITS:
        return _OUT_OF_RANGE
    return int(text)


def parse_json_answer(answer: str):
    """Parse the answer as one JSON value. Returns ``(ok, value)``.

    Decimal numbers are read as ``Decimal`` so that they compare as written.
    A number outside the supported range (see ``MAX_NUMBER_EXPONENT`` and
    ``MAX_INT_DIGITS``) is still valid JSON: it is read as a marker that never
    equals an expected number, so the answer fails and nothing is raised.
    """
    try:
        return True, json.loads(unwrap_fence(answer), parse_float=_json_float, parse_int=_json_int,
                                parse_constant=_refuse_constant)
    except (ValueError, RecursionError, DecimalException, MemoryError):
        return False, None


def _is_json_number(value: Any) -> bool:
    return isinstance(value, (int, float, Decimal)) and not isinstance(value, bool)


def _json_equal(got: Any, want: Any, params: Mapping, key: Optional[str], path: str) -> Optional[str]:
    """Return None when ``got`` matches ``want``, else a short reason."""
    if want is None:
        return None if got is None else f"{path}: expected null"
    if isinstance(want, bool):
        return None if isinstance(got, bool) and got == want else f"{path}: expected true or false, as given"
    if _is_json_number(want):
        if not _is_json_number(got):
            return f"{path}: expected a number"
        try:
            got_d, want_d = _decimal_of(got), _decimal_of(want)
            if not _supported_number(got_d):
                return f"{path}: number outside the supported range"
            if key is not None and key in (params.get("integer_keys") or []):
                if got_d != got_d.to_integral_value() or got_d != want_d:
                    return f"{path}: expected an exact whole number"
                return None
            if abs(got_d - want_d) > _decimal_of(params.get("numeric_tolerance", 0)):
                return f"{path}: number outside the tolerance"
        except DecimalException:
            return f"{path}: number outside the supported range"
        return None
    if isinstance(want, str):
        if not isinstance(got, str):
            return f"{path}: expected a string"
        if params.get("string_compare", "exact") == "casefold_trim":
            same = got.strip().casefold() == want.strip().casefold()
        else:
            same = got == want
        return None if same else f"{path}: string differs"
    if isinstance(want, list):
        if not isinstance(got, list):
            return f"{path}: expected an array"
        if len(got) != len(want):
            return f"{path}: array length differs"
        for index, (g, w) in enumerate(zip(got, want)):
            reason = _json_equal(g, w, params, key, f"{path}[{index}]")
            if reason:
                return reason
        return None
    if isinstance(want, dict):
        if not isinstance(got, dict):
            return f"{path}: expected an object"
        missing = [k for k in want if k not in got]
        if missing:
            return f"{path}: missing key(s)"
        if not params.get("allow_extra_keys", False) and any(k not in want for k in got):
            return f"{path}: extra key(s)"
        for k, w in want.items():
            reason = _json_equal(got[k], w, params, k, f"{path}.{k}")
            if reason:
                return reason
        return None
    raise GraderConfigError(f"json grader: unsupported expected value at {path}")


def grade_json(reply: str, params: Mapping) -> GradeResult:
    """One JSON value, no prose around it, compared with ``expected``.

    Objects compare by key in any order, arrays in order. A number is never a
    string, a string is never a number, and true or false is never a number.
    """
    ok, value = parse_json_answer(trim(reply))
    if not ok:
        return _fail("the answer is not one JSON value", malformed=True)
    try:
        reason = _json_equal(value, params["expected"], params, None, "$")
    except RecursionError:
        reason = "$: nested too deeply"
    return _fail(reason) if reason else _ok()


# ---------------------------------------------------------------- constraints

_LINE_SPLIT_RE = re.compile(r"\r\n|\r|\n")


def run_constraint_check(check: Mapping, answer: str) -> bool:
    """Run one ``constraints`` check on an already trimmed answer."""
    name = check["check"]
    if name == "max_words":
        return word_count(answer) <= check["value"]
    if name == "min_words":
        return word_count(answer) >= check["value"]
    if name == "max_chars":
        return len(answer) <= check["value"]
    if name == "must_include":
        folded = answer.casefold()
        return all(value.casefold() in folded for value in check["values"])
    if name == "must_not_include":
        folded = answer.casefold()
        return not any(value.casefold() in folded for value in check["values"])
    if name == "regex":
        return re.search(check["pattern"], answer, compile_flags(check.get("flags"))) is not None
    if name == "match_count":
        found = sum(1 for _ in re.finditer(check["pattern"], answer, compile_flags(check.get("flags"))))
        return found == check["value"]
    if name == "line_count":
        return sum(1 for line in _LINE_SPLIT_RE.split(answer) if line.strip() != "") == check["value"]
    if name == "starts_with":
        return answer.startswith(check["value"])
    if name == "ends_with":
        return answer.endswith(check["value"])
    raise GraderConfigError(f"unknown constraints check {name!r}")


def grade_constraints(reply: str, params: Mapping) -> GradeResult:
    """Every check in ``all`` must pass."""
    answer = trim(reply)
    failed = [str(n) for n, check in enumerate(params["all"], 1) if not run_constraint_check(check, answer)]
    if failed:
        return _fail("failed check(s): " + ", ".join(failed))
    return _ok()


# ---------------------------------------------------------------- python_tests

# Modules an honest answer to a small scripting task has no need for.
_BANNED_MODULES = frozenset({
    "socket", "ssl", "http", "urllib", "ftplib", "smtplib", "poplib", "imaplib", "telnetlib",
    "xmlrpc", "socketserver", "asyncio", "selectors", "select", "requests", "httpx", "aiohttp",
    "urllib3", "subprocess", "multiprocessing", "concurrent", "threading", "_thread",
    "ctypes", "_ctypes", "winreg", "_winapi", "msvcrt", "nt", "posix", "pty", "signal",
    "importlib", "runpy", "pkgutil", "webbrowser", "shutil", "tempfile", "glob", "pathlib",
    "fileinput", "builtins", "site", "code", "codeop", "pickle", "shelve", "marshal",
    "sqlite3", "zipfile", "tarfile", "mmap",
})
# ``import os`` is allowed (os.path, os.sep) but these attributes are not.
_BANNED_OS_ATTRS = frozenset({
    "environ", "environb", "getenv", "getenvb", "putenv", "unsetenv", "system", "popen",
    "startfile", "fork", "forkpty", "kill", "killpg", "abort", "_exit", "remove", "unlink",
    "rmdir", "removedirs", "rename", "renames", "replace", "chdir", "fchdir", "chmod", "chown",
    "listdir", "scandir", "walk", "fwalk", "open", "fdopen", "pipe", "dup", "dup2", "mkdir",
    "makedirs", "link", "symlink", "truncate", "getcwd", "getcwdb", "access", "stat", "lstat",
    "add_dll_directory", "get_exec_path", "getlogin", "urandom",
    "spawnl", "spawnle", "spawnlp", "spawnlpe", "spawnv", "spawnve", "spawnvp", "spawnvpe",
    "execl", "execle", "execlp", "execlpe", "execv", "execve", "execvp", "execvpe",
    "posix_spawn", "posix_spawnp", "readlink", "chroot",
})
# Attributes refused on any object, because they reach the environment, a
# shell or a file whatever they hang off.
_BANNED_ATTRS = frozenset({"environ", "environb", "system", "popen", "startfile", "open", "modules"})
_BANNED_NAMES = frozenset({"__import__", "eval", "exec", "compile", "breakpoint"})
_BANNED_DUNDERS = frozenset({
    "__subclasses__", "__globals__", "__builtins__", "__import__", "__code__", "__closure__",
    "__loader__", "__spec__", "__getattribute__",
})


def _safe_open_target(node: ast.Call) -> bool:
    """True when ``open`` is called on a literal relative path inside the working folder."""
    if not node.args or not isinstance(node.args[0], ast.Constant) or not isinstance(node.args[0].value, str):
        return False
    target = node.args[0].value
    if target == "" or target.startswith(("/", "\\", "~")) or ":" in target:
        return False
    return ".." not in re.split(r"[\\/]", target)


def static_source_problems(source: str) -> list:
    """List the reasons the pre-run check refuses ``source`` (empty when it's fine).

    A cheap pre-filter, run before the sandbox is started. It walks the syntax
    tree and refuses code that is obviously outside a small scripting task:
    networking, ``subprocess``, ``ctypes`` or similar imports, ``os.environ``
    and the process and file calls on ``os``, ``eval``, ``exec`` or
    ``__import__``, or opening a file by anything other than a literal
    relative path. Its use is the clear failure message it gives.

    THIS IS NOT A SECURITY BOUNDARY. A program written to get round it can do
    so. The boundary is the sandbox in ``sandbox.py``: source that passes
    this check still runs only inside it, and never on the host.
    """
    try:
        tree = ast.parse(source)
    except (SyntaxError, ValueError, RecursionError, MemoryError):
        return ["syntax error"]
    problems = []
    open_calls = set()
    os_names = {"os", "_os"}
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            os_names.update(alias.asname for alias in node.names if alias.name == "os" and alias.asname)
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "open":
            open_calls.add(id(node.func))
            if not _safe_open_target(node):
                problems.append("opens a file outside the working folder")
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                root = alias.name.split(".")[0]
                if root in _BANNED_MODULES:
                    problems.append(f"imports {root}")
        elif isinstance(node, ast.ImportFrom):
            root = (node.module or "").split(".")[0]
            if node.level or root in _BANNED_MODULES:
                problems.append(f"imports {root or 'a relative module'}")
            elif root == "os":
                for alias in node.names:
                    if alias.name in _BANNED_OS_ATTRS or alias.name == "*":
                        problems.append(f"imports os.{alias.name}")
        elif isinstance(node, ast.Attribute):
            if node.attr in _BANNED_DUNDERS:
                problems.append(f"uses {node.attr}")
            elif node.attr in _BANNED_OS_ATTRS and isinstance(node.value, ast.Name) and node.value.id in os_names:
                problems.append(f"uses os.{node.attr}")
            elif node.attr in _BANNED_ATTRS:
                problems.append(f"uses .{node.attr}")
        elif isinstance(node, ast.Name):
            if node.id in _BANNED_NAMES:
                problems.append(f"names {node.id}")
            elif node.id == "open" and id(node) not in open_calls:
                problems.append("uses open other than as a direct call")
    return sorted(set(problems))


def _child_environment() -> dict:
    """An empty environment, plus only what Windows needs to start a process.

    Used for the formula worker. Model-written Python never runs in a host
    process at all (see ``sandbox.py``).
    """
    env = {}
    if os.name == "nt":
        env["SYSTEMROOT"] = os.environ.get("SYSTEMROOT", r"C:\Windows")
    return env


def grade_python_tests(reply: str, params: Mapping, timeout: float = SANDBOX_TIMEOUT_SECONDS,
                       backend: Any = None) -> GradeResult:
    """Run the reply as Python inside the sandbox and call ``entry`` once per test.

    No model-written code runs on the host. How it goes:

    * a reply that isn't valid Python fails as malformed, and source the
      static pre-filter refuses (``static_source_problems``) fails with the
      reason. Neither is run anywhere;
    * the source runs only inside a real sandbox (``sandbox.py``: a Docker
      container or bubblewrap under WSL, chosen with ``DTD_SANDBOX``), with no
      network, no host files, no host environment and limits on processes,
      memory and disk. The sandbox must have passed its self-test in this
      process. If there is no such sandbox the result is
      ``sandbox_unavailable``: the task is NOT graded, here or any other way;
    * only the source, the entry name and each test's arguments go in. The
      expected values stay on the host. What each call returned comes back
      with explicit type tags and is compared here;
    * results compare with Python ``==``, with ``bool`` never equal to a
      number, at any depth and in dictionary keys; integers of any size are
      exact;
    * one wall-clock limit of 10 seconds covers loading the code and running
      every test, counted from the moment the sandboxed interpreter is up;
    * output is capped at 64 KB per test and 1 MB in all;
    * any exception, timeout, overrun or syntax error fails the task.

    ``backend`` is for tests; real runs leave it out.
    """
    source = unwrap_fence(trim(reply))
    try:
        ast.parse(source)
    except (SyntaxError, ValueError, RecursionError, MemoryError):
        return _fail("syntax error", malformed=True)
    if len(source) > sandbox.MAX_SOURCE_CHARS:
        return _fail("the code is too long to run")
    problems = static_source_problems(source)
    if problems:
        return _fail("refused before running: " + "; ".join(problems))

    tests = params["tests"]
    try:
        if backend is None:
            backend = sandbox.ready_backend()
        run = sandbox.run_tests(backend, source, params["entry"], tests, timeout)
    except sandbox.SandboxUnavailable as exc:
        return GradeResult(SANDBOX_UNAVAILABLE, f"not graded: {exc}")
    if run.status == "timeout":
        return _fail(f"timed out after {timeout:g} seconds")
    if run.status == "output_cap":
        return _fail("the output went over the cap")
    if run.status == "load_error":
        return _fail(f"the code could not be loaded: {run.detail}")
    if run.status != "ok":
        return _fail("the sandboxed run ended without a report")
    failed = [f"{n} ({why or 'failed'})" for n, (ok, why) in enumerate(zip(run.passed, run.why), 1) if ok is not True]
    if failed:
        return _fail("failed test(s): " + ", ".join(failed))
    return _ok(f"{len(tests)} tests passed")


# ---------------------------------------------------------------- formula

class _FormulaEngine:
    """A long-lived child process holding the formula engine.

    The engine takes several seconds to import, so it's started once and
    reused. Each answer's cases are then evaluated under the 10 second limit;
    a worker that overruns is killed and a new one is started next time.
    """

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._process = None
        self._lines = None
        self._folder = None
        self.versions = {}

    @staticmethod
    def _package_folders() -> list:
        folders = []
        for name in ("formulas", "openpyxl"):
            try:
                spec = importlib.util.find_spec(name)
            except (ImportError, ValueError):
                spec = None
            if spec is None or not spec.origin:
                raise FormulaEngineUnavailable(
                    f"the '{name}' package is not importable, so formula tasks can't be graded "
                    "(see core/requirements.txt)")
            folder = str(Path(spec.origin).resolve().parent.parent)
            if folder not in folders:
                folders.append(folder)
        return folders

    def _start(self) -> None:
        folders = self._package_folders()
        self._folder = tempfile.TemporaryDirectory(prefix="dtd-formula-", ignore_cleanup_errors=True)
        worker = Path(__file__).resolve().with_name("_formula_worker.py")
        try:
            self._process = subprocess.Popen(
                [sys.executable, "-I", str(worker), *folders],
                cwd=self._folder.name, env=_child_environment(), stdin=subprocess.PIPE,
                stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
                creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
            )
        except OSError as exc:
            self._stop()
            raise FormulaEngineUnavailable(f"the formula engine could not be started: {type(exc).__name__}") from None
        self._lines = queue.Queue()
        threading.Thread(target=self._pump, args=(self._process, self._lines), daemon=True).start()
        hello = self._read(FORMULA_ENGINE_START_SECONDS)
        if not isinstance(hello, dict) or hello.get("ready") is not True:
            self._stop()
            raise FormulaEngineUnavailable("the formula engine did not start (is 'formulas' fully installed?)")
        self.versions = {k: hello.get(k) for k in ("formulas", "openpyxl")}

    @staticmethod
    def _pump(process, lines) -> None:
        try:
            for raw in process.stdout:
                lines.put(raw)
        except (OSError, ValueError):
            pass
        lines.put(None)

    def _read(self, timeout: float):
        try:
            raw = self._lines.get(timeout=timeout)
        except queue.Empty:
            return "timeout"
        if raw is None:
            return None
        try:
            return json.loads(raw.decode("utf-8"))
        except ValueError:
            return None

    def _stop(self) -> None:
        process, self._process = self._process, None
        if process is not None:
            try:
                process.kill()
                process.wait(timeout=10)
            except (OSError, subprocess.SubprocessError):
                pass
            for stream in (process.stdin, process.stdout):
                try:
                    stream.close()
                except (OSError, ValueError, AttributeError):
                    pass
        folder, self._folder = self._folder, None
        if folder is not None:
            folder.cleanup()

    def close(self) -> None:
        with self._lock:
            self._stop()

    def evaluate(self, cases: list, timeout: float):
        """Return a list of results, or the string "timeout"."""
        with self._lock:
            if self._process is None or self._process.poll() is not None:
                self._stop()
                self._start()
            try:
                self._process.stdin.write((json.dumps({"cases": cases}) + "\n").encode("utf-8"))
                self._process.stdin.flush()
            except (OSError, ValueError):
                self._stop()
                raise FormulaEngineUnavailable("the formula engine stopped unexpectedly") from None
            answer = self._read(timeout)
            if answer == "timeout":
                self._stop()
                return "timeout"
            if not isinstance(answer, dict) or not isinstance(answer.get("results"), list):
                self._stop()
                raise FormulaEngineUnavailable("the formula engine stopped unexpectedly")
            return answer["results"]


_ENGINE = _FormulaEngine()
atexit.register(_ENGINE.close)


def formula_engine_versions() -> dict:
    """Start the engine if need be and return the versions it reports."""
    _ENGINE.evaluate([], SANDBOX_TIMEOUT_SECONDS)
    return dict(_ENGINE.versions)


def close_formula_engine() -> None:
    """Stop the engine's child process. It restarts on the next formula."""
    _ENGINE.close()


_PROMPT_CELL_RE = re.compile(
    r"\b(?:formula\s+(?:for|in|into)|(?:in|into|for)\s+cell)\s+\$?([A-Z]{1,3})\$?([1-9][0-9]{0,6})\b")


def formula_home_cell(params: Mapping, prompt: Optional[str] = None) -> str:
    """The cell the submitted formula is written for.

    The README's rule is "C2 unless the task's prompt names another". In
    order:

    1. the grader's own ``home_cell``, if it has one;
    2. the cell the prompt names with "formula for X", "formula in X" or
       "in cell X", leaving out cells that a case fills with data. One such
       cell is the home cell, whether or not C2 is free;
    3. C2, when the prompt names no such cell and no case puts data in C2.

    If the prompt names more than one such cell, or names none while C2 holds
    data, the task can't be graded as written and ``home_cell`` must be added
    to its grader.
    """
    if params.get("home_cell"):
        return params["home_cell"]
    data_cells = {cell for case in params["cases"] for cell in case["cells"]}
    named = {a + b for a, b in _PROMPT_CELL_RE.findall(prompt or "")} - data_cells
    if len(named) == 1:
        return named.pop()
    if not named and FORMULA_DEFAULT_CELL not in data_cells:
        return FORMULA_DEFAULT_CELL
    raise GraderConfigError(
        "formula grader: the home cell is not clear from the prompt; add 'home_cell' to the grader")


_FORMULA_STRING_RE = re.compile(r'"(?:[^"]|"")*"')
_FORMULA_ERROR_RE = re.compile(r"#(?:DIV/0|REF|VALUE|NUM|NULL|N/A|NAME\?|GETTING_DATA|SPILL|CALC)!?", re.IGNORECASE)


def formula_out_of_scope(formula: str) -> Optional[str]:
    """A reason to refuse a formula before the engine sees it, or None.

    A task formula works on one sheet. A reference to another sheet or
    workbook (``!`` or square brackets outside a text literal) is refused, so
    the engine is never asked to open another file.
    """
    bare = _FORMULA_ERROR_RE.sub("", _FORMULA_STRING_RE.sub('""', formula))
    if "!" in bare or "[" in bare or "]" in bare:
        return "the formula refers to another sheet or workbook"
    if any(ord(ch) < 32 and ch not in "\t\r\n" for ch in formula):
        return "the formula contains a control character"
    return None


def _translate_formula(formula: str, home: str, target: str) -> str:
    """Copy a formula from ``home`` to ``target`` the way a spreadsheet fill does."""
    from openpyxl.formula.translate import Translator  # lazy: only formula tasks need it
    return Translator(formula, origin=home).translate_formula(target)


def grade_formula(reply: str, params: Mapping, prompt: Optional[str] = None,
                  timeout: float = SANDBOX_TIMEOUT_SECONDS) -> GradeResult:
    """Evaluate the reply, one Excel formula, in a real formula engine.

    The engine is the ``formulas`` package (with ``openpyxl``), found lazily
    and run in a separate worker process with an empty environment. If it
    isn't importable this raises ``FormulaEngineUnavailable`` and the task is
    NOT graded. A formula is never judged by matching its text.

    The engine evaluates spreadsheet expressions; it does not run code. It
    does still parse model-written text, in a host process, so the input is
    kept small: at most 2,000 characters, no reference to another
    sheet or workbook, and 10 seconds for all the cases. The remaining risk
    is a fault in the engine's own parser; see the README.

    For each case the listed cells are set, every other cell is empty, and the
    formula is evaluated in its home cell (see ``formula_home_cell``). A case
    with ``target_cell`` has the formula copied there first, with relative
    references shifted and ``$`` references kept, as a spreadsheet fill does.
    A numeric result must be within 0.005 of ``expect``; a text result must
    equal it exactly.
    """
    _FormulaEngine._package_folders()  # raises FormulaEngineUnavailable before anything is graded
    formula = unwrap_fence(trim(reply))
    if formula == "":
        return _fail("no formula in the answer", malformed=True)
    if len(formula) > MAX_FORMULA_CHARS:
        return _fail(f"the formula is longer than {MAX_FORMULA_CHARS} characters")
    refused = formula_out_of_scope(formula)
    if refused:
        return _fail(refused)
    if not formula.startswith("="):
        formula = "=" + formula
    home = formula_home_cell(params, prompt)

    jobs = []
    for case in params["cases"]:
        cell = case.get("target_cell") or home
        text = formula
        if cell != home:
            try:
                text = _translate_formula(formula, home, cell)
            except ImportError:
                raise FormulaEngineUnavailable("the 'openpyxl' package is not importable") from None
            except Exception:
                return _fail("the formula could not be read", malformed=True)
        jobs.append({"cells": {k: v for k, v in case["cells"].items() if k != cell}, "formula": text, "cell": cell})

    results = _ENGINE.evaluate(jobs, timeout)
    if results == "timeout":
        return _fail(f"timed out after {timeout:g} seconds")
    if len(results) != len(jobs):
        raise FormulaEngineUnavailable("the formula engine gave an incomplete answer")
    if any(r.get("kind") == "exception" and r.get("parse_error") for r in results):
        return _fail("the engine could not read the formula", malformed=True)

    failed = []
    for n, (case, result) in enumerate(zip(params["cases"], results), 1):
        want, kind = case["expect"], result.get("kind")
        if isinstance(want, bool):
            good = kind == "bool" and result["value"] is want
        elif isinstance(want, (int, float)):
            good = kind == "number" and abs(_decimal_of(result["value"]) - _decimal_of(want)) <= FORMULA_TOLERANCE
        else:
            good = kind == "text" and result["value"] == want
        if not good:
            failed.append(str(n))
    if failed:
        return _fail("wrong result in case(s): " + ", ".join(failed))
    return _ok(f"{len(jobs)} cases passed")


# ---------------------------------------------------------------- abstain

def grade_abstain(reply: str, params: Mapping, task: Any = None) -> GradeResult:
    """Pass when the outcome is ``abstained`` under the method's precedence rules.

    Detection is by the published pattern list in ``outcome.py``. A reply the
    patterns can't classify comes back as ``needs_judge``.
    """
    from . import outcome  # here, not at the top: outcome imports this module

    verdict = outcome.classify_outcome(reply, task)
    if verdict == outcome.ABSTAINED:
        return _ok("outcome: abstained")
    if verdict == outcome.NEEDS_JUDGE:
        return GradeResult(NEEDS_JUDGE, "the outcome patterns can't classify this reply")
    return _fail(f"outcome: {verdict}")


# ---------------------------------------------------------------- checklist

def grade_checklist(reply: str, params: Mapping) -> GradeResult:
    """Run the script checks and list the judged checks still to be decided.

    ``by: "script"`` checks use the ``constraints`` check types and are final.
    The result is one of three things:

    * ``failed`` with ``failed_by == "script"``: a script check failed. The
      judged checks are marked ``not_run``; no judge is needed.
    * ``needs_judge``: every script check passed, and ``result.needs_judge``
      lists a marker (check id and text) for each ``by: "judge"`` check.
    * ``passed``: every check is a script check and all of them passed.

    Pass the judges' verdicts to ``apply_judge_verdicts`` to finish the job.
    """
    answer = trim(reply)
    checks = []
    script_failed = []
    for check in params["checks"]:
        if check["by"] == "script":
            good = run_constraint_check(check["script"], answer)
            checks.append(CheckResult(check["id"], check["text"], "script", CHECK_PASSED if good else CHECK_FAILED))
            if not good:
                script_failed.append(check["id"])
        else:
            checks.append(CheckResult(check["id"], check["text"], "judge", CHECK_NEEDS_JUDGE))
    if script_failed:
        for check in checks:
            if check.by == "judge":
                check.status = CHECK_NOT_RUN
        return GradeResult(FAILED, "failed script check(s): " + ", ".join(script_failed),
                           failed_by="script", checks=checks)
    if any(check.by == "judge" for check in checks):
        return GradeResult(NEEDS_JUDGE, "all script checks passed; judge verdicts needed", checks=checks)
    return GradeResult(PASSED, "all checks passed", checks=checks)


def _read_verdict(verdicts: Any, check_id: str) -> Optional[bool]:
    """One judge's verdict on one check: True, False, or None when missing or malformed."""
    if not isinstance(verdicts, Mapping) or check_id not in verdicts:
        return None
    value = verdicts[check_id]
    if isinstance(value, Mapping):
        for key in ("pass", "verdict"):
            if key in value:
                value = value[key]
                break
        else:
            return None
    return value if isinstance(value, bool) else None


def apply_judge_verdicts(result: GradeResult, verdicts_by_judge: Mapping) -> GradeResult:
    """Combine a checklist result with the judges' verdicts. Returns a new result.

    ``verdicts_by_judge`` maps each judge's name to that judge's verdicts,
    which map a check id to ``true`` or ``false`` (or to an object carrying
    the verdict under ``"pass"`` or ``"verdict"``, beside a reason).

    The method's rules:

    * a judged check passes only if every judge says true;
    * if the judges disagree, the check is ``disputed`` and counts as failed;
    * if any judge's verdict on a check is missing or malformed (or fewer than
      two judges are given), the check is ``judge_unresolved`` and the overall
      pass stays pending, whatever the other checks say;
    * a result a script already failed stays failed, and judges are ignored.
    """
    if result.status == FAILED and result.failed_by == "script":
        return result
    judges = list(verdicts_by_judge.items()) if isinstance(verdicts_by_judge, Mapping) else []
    checks = []
    for check in result.checks:
        if check.by != "judge":
            checks.append(CheckResult(check.id, check.text, check.by, check.status))
            continue
        votes = [_read_verdict(verdicts, check.id) for _, verdicts in judges]
        if len(votes) < MIN_JUDGES or any(vote is None for vote in votes):
            status = CHECK_UNRESOLVED
        elif all(votes):
            status = CHECK_PASSED
        elif not any(votes):
            status = CHECK_FAILED
        else:
            status = CHECK_DISPUTED
        checks.append(CheckResult(check.id, check.text, "judge", status))

    unresolved = [c.id for c in checks if c.status == CHECK_UNRESOLVED]
    rejected = [c.id for c in checks if c.status in (CHECK_FAILED, CHECK_DISPUTED)]
    if unresolved:
        return GradeResult(PENDING, "judge verdict missing or malformed for: " + ", ".join(unresolved), checks=checks)
    if rejected:
        return GradeResult(FAILED, "failed or disputed judged check(s): " + ", ".join(rejected),
                           failed_by="judge", checks=checks)
    return GradeResult(PASSED, "all checks passed", checks=checks)


# ---------------------------------------------------------------- dispatch

def _field(task: Any, name: str, default: Any = None) -> Any:
    if isinstance(task, Mapping):
        return task.get(name, default)
    return getattr(task, name, default)


def is_malformed(task: Any, reply: str) -> bool:
    """True when the reply can't be parsed in the format the task requires.

    This is the cheap, static part: an empty reply, JSON that doesn't parse,
    Python with a syntax error. A formula the engine can't read is reported by
    ``grade_formula`` on its result instead.
    """
    answer = trim(reply)
    if answer == "":
        return True
    kind = (_field(task, "grader") or {}).get("type") if task is not None else None
    if kind == "json":
        return not parse_json_answer(answer)[0]
    if kind == "python_tests":
        try:
            ast.parse(unwrap_fence(answer))
        except (SyntaxError, ValueError, RecursionError, MemoryError):
            return True
    return False


def grade(task: Any, reply: str) -> GradeResult:
    """Grade ``reply`` with the task's own grader.

    ``task`` is a ``tasks.Task`` or a plain task dictionary. Raises
    ``FormulaEngineUnavailable`` for a formula task when there is no engine.
    """
    params = _field(task, "grader")
    kind = params["type"]
    if kind == "exact":
        return grade_exact(reply, params)
    if kind == "one_of":
        return grade_one_of(reply, params)
    if kind == "regex":
        return grade_regex(reply, params)
    if kind == "numeric":
        return grade_numeric(reply, params)
    if kind == "json":
        return grade_json(reply, params)
    if kind == "constraints":
        return grade_constraints(reply, params)
    if kind == "python_tests":
        return grade_python_tests(reply, params)
    if kind == "formula":
        return grade_formula(reply, params, prompt=_field(task, "prompt"))
    if kind == "abstain":
        return grade_abstain(reply, params, task)
    if kind == "checklist":
        return grade_checklist(reply, params)
    raise GraderConfigError(f"unknown grader type {kind!r}")
