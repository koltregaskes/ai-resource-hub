"""Task loader for the Day-to-Day Bench.

``load_tasks(public_dir, held_out_dir=None)`` reads every ``*.json`` file in the
public folder (and, when given, the private held-out folder), validates each
task and returns a list of ``Task`` objects.

Rules this module keeps:

* Task files are read with Python's ``json`` module, so integers stay exact
  however large they are. ``NaN`` and ``Infinity`` are refused.
* An unknown grader type, an unknown grader option or a missing field stops the
  load with a ``TaskSetError`` that names the file and the task id.
* Held-out files are checked against the SHA-256 hashes in
  ``held-out-manifest.json`` before any of them is parsed.
* Prompt text is never logged, never put in an error message and never shown by
  ``repr(task)``.
"""
from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

GRADER_TYPES = (
    "exact", "one_of", "regex", "numeric", "json", "constraints",
    "python_tests", "formula", "abstain", "checklist",
)

# The same required fields as task-set-v1/validate_set.py.
REQUIRED_FIELDS = (
    "id", "version", "family", "split", "answerable", "prompt", "max_output_tokens",
    "grader", "expected", "accept_examples", "reject_examples", "sources",
    "why_hard", "verification", "author", "written_on",
)

CONSTRAINT_CHECKS = (
    "max_words", "min_words", "max_chars", "must_include", "must_not_include",
    "regex", "match_count", "line_count", "starts_with", "ends_with",
)

REGEX_FLAG_LETTERS = {"i": re.IGNORECASE, "m": re.MULTILINE, "s": re.DOTALL}

_ID_RE = re.compile(r"\Af([1-7])-(pub|ho)-(\d{2})\Z")
_CELL_RE = re.compile(r"\A[A-Z]{1,3}[1-9][0-9]{0,6}\Z")
_NOTE_KEY_RE = re.compile(r"\AR([1-9][0-9]*)\Z")
_IDENT_RE = re.compile(r"\A[A-Za-z_][A-Za-z0-9_]*\Z")

# Options each grader type may carry besides "type". Anything else is refused,
# so a misspelt option can't silently change how a task is graded.
_GRADER_KEYS = {
    "exact": {"value", "case_sensitive", "trim"},
    "one_of": {"values", "case_sensitive", "trim"},
    "regex": {"pattern", "flags", "search"},
    "numeric": {"value", "tolerance", "extract", "allow_affixes"},
    "json": {"expected", "numeric_tolerance", "allow_extra_keys", "string_compare", "integer_keys"},
    "constraints": {"all"},
    "python_tests": {"entry", "tests"},
    "formula": {"dialect", "cases", "home_cell"},
    "abstain": set(),
    "checklist": {"checks"},
}


class TaskSetError(ValueError):
    """A task file, a task or the held-out manifest is not valid."""


@dataclass(frozen=True)
class Task:
    """One validated task. ``raw`` is the task exactly as it was in its file."""

    id: str
    family: int
    split: str
    answerable: bool
    floor: bool
    prompt: str = field(repr=False)
    max_output_tokens: int = 4096
    grader: dict = field(default_factory=dict, repr=False)
    expected: Any = field(default=None, repr=False)
    accept_examples: tuple = field(default=(), repr=False)
    reject_examples: tuple = field(default=(), repr=False)
    reject_notes: tuple = field(default=(), repr=False)
    raw: dict = field(default_factory=dict, repr=False, compare=False)

    @property
    def grader_type(self) -> str:
        return self.grader["type"]


def compile_flags(flags: Any, where: str = "regex") -> int:
    """Turn a string of flag letters (i, m, s) into ``re`` flags."""
    if flags is None or flags == "":
        return 0
    if not isinstance(flags, str):
        raise TaskSetError(f"{where}: flags must be a string of letters")
    value = 0
    for letter in flags:
        if letter not in REGEX_FLAG_LETTERS:
            raise TaskSetError(f"{where}: unknown regex flag {letter!r} (allowed: i, m, s)")
        value |= REGEX_FLAG_LETTERS[letter]
    return value


def _refuse_constant(name: str):
    raise ValueError(f"{name} is not allowed in a task file")


def _loads(text: str) -> Any:
    # Python's json keeps integers exact at any size, which the python_tests
    # grader relies on.
    return json.loads(text, parse_constant=_refuse_constant)


def _is_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def _need(cond: bool, where: str, message: str) -> None:
    if not cond:
        raise TaskSetError(f"{where}: {message}")


def _check_pattern(pattern: Any, flags: Any, where: str) -> None:
    _need(isinstance(pattern, str), where, "pattern must be a string")
    try:
        re.compile(pattern, compile_flags(flags, where))
    except re.error as exc:
        raise TaskSetError(f"{where}: pattern does not compile ({exc})") from None


def validate_constraint_check(check: Any, where: str) -> None:
    """Validate one ``constraints`` check (also used for checklist script checks)."""
    _need(isinstance(check, dict), where, "a check must be an object")
    name = check.get("check")
    _need(name in CONSTRAINT_CHECKS, where, f"unknown check type {name!r}")
    allowed = {"check", "note"}
    if name in ("max_words", "min_words", "max_chars", "line_count"):
        allowed |= {"value"}
        _need(isinstance(check.get("value"), int) and not isinstance(check.get("value"), bool)
              and check["value"] >= 0, where, f"{name} needs a whole number 'value'")
    elif name in ("must_include", "must_not_include"):
        allowed |= {"values"}
        values = check.get("values")
        _need(isinstance(values, list) and values and all(isinstance(v, str) and v for v in values),
              where, f"{name} needs a non-empty list of strings 'values'")
    elif name == "regex":
        allowed |= {"pattern", "flags"}
        _check_pattern(check.get("pattern"), check.get("flags"), where)
    elif name == "match_count":
        allowed |= {"pattern", "flags", "value"}
        _check_pattern(check.get("pattern"), check.get("flags"), where)
        _need(isinstance(check.get("value"), int) and not isinstance(check.get("value"), bool)
              and check["value"] >= 0, where, "match_count needs a whole number 'value'")
    else:  # starts_with, ends_with
        allowed |= {"value"}
        _need(isinstance(check.get("value"), str) and check["value"] != "", where,
              f"{name} needs a string 'value'")
    extra = sorted(set(check) - allowed)
    _need(not extra, where, f"unknown key(s) on a {name} check: {', '.join(extra)}")


def validate_grader(grader: Any, where: str) -> None:
    """Check a grader block. Raises ``TaskSetError`` on anything unknown or missing."""
    _need(isinstance(grader, dict), where, "grader must be an object")
    kind = grader.get("type")
    _need(isinstance(kind, str), where, "grader has no 'type'")
    _need(kind in GRADER_TYPES, where, f"unknown grader type {kind!r}")
    extra = sorted(set(grader) - _GRADER_KEYS[kind] - {"type"})
    _need(not extra, where, f"unknown option(s) for a {kind} grader: {', '.join(extra)}")

    def has(key: str) -> None:
        _need(key in grader, where, f"{kind} grader is missing '{key}'")

    if kind in ("exact", "one_of"):
        if kind == "exact":
            has("value")
            _need(isinstance(grader["value"], str), where, "exact 'value' must be a string")
        else:
            has("values")
            values = grader["values"]
            _need(isinstance(values, list) and values and all(isinstance(v, str) for v in values),
                  where, "one_of 'values' must be a non-empty list of strings")
        _need(isinstance(grader.get("case_sensitive", False), bool), where, "'case_sensitive' must be true or false")
        _need(grader.get("trim", True) is True, where, "'trim' can only be true: answers are always trimmed")
    elif kind == "regex":
        has("pattern")
        _check_pattern(grader["pattern"], grader.get("flags"), where)
        _need(isinstance(grader.get("search", False), bool), where, "'search' must be true or false")
    elif kind == "numeric":
        for key in ("value", "tolerance", "extract"):
            has(key)
        _need(_is_number(grader["value"]), where, "numeric 'value' must be a number")
        _need(_is_number(grader["tolerance"]) and grader["tolerance"] >= 0, where,
              "numeric 'tolerance' must be a number of 0 or more")
        _need(grader["extract"] in ("only_number", "last_number"), where,
              "numeric 'extract' must be only_number or last_number")
        if "allow_affixes" in grader:
            _need(grader["extract"] == "only_number", where, "'allow_affixes' is for only_number")
            affixes = grader["allow_affixes"]
            _need(isinstance(affixes, list) and all(isinstance(a, str) and a.strip() for a in affixes),
                  where, "'allow_affixes' must be a list of non-empty strings")
    elif kind == "json":
        has("expected")
        _need(_is_number(grader.get("numeric_tolerance", 0)) and grader.get("numeric_tolerance", 0) >= 0,
              where, "'numeric_tolerance' must be a number of 0 or more")
        _need(isinstance(grader.get("allow_extra_keys", False), bool), where, "'allow_extra_keys' must be true or false")
        _need(grader.get("string_compare", "exact") in ("exact", "casefold_trim"), where,
              "'string_compare' must be exact or casefold_trim")
        keys = grader.get("integer_keys", [])
        _need(isinstance(keys, list) and all(isinstance(k, str) for k in keys), where,
              "'integer_keys' must be a list of key names")
    elif kind == "constraints":
        has("all")
        _need(isinstance(grader["all"], list) and grader["all"], where, "constraints 'all' must be a non-empty list")
        for n, check in enumerate(grader["all"], 1):
            validate_constraint_check(check, f"{where} check {n}")
    elif kind == "python_tests":
        has("entry")
        has("tests")
        _need(isinstance(grader["entry"], str) and _IDENT_RE.match(grader["entry"]) is not None, where,
              "python_tests 'entry' must be a function name")
        _need(isinstance(grader["tests"], list) and grader["tests"], where, "python_tests 'tests' must be a non-empty list")
        for n, test in enumerate(grader["tests"], 1):
            spot = f"{where} test {n}"
            _need(isinstance(test, dict), spot, "a test must be an object")
            _need(isinstance(test.get("args"), list), spot, "a test needs an 'args' list")
            _need(("expect" in test) != ("raises" in test), spot, "a test needs exactly one of 'expect' and 'raises'")
            if "raises" in test:
                _need(isinstance(test["raises"], str) and _IDENT_RE.match(test["raises"]) is not None, spot,
                      "'raises' must be an exception name")
            extra = sorted(set(test) - {"args", "expect", "raises", "note"})
            _need(not extra, spot, f"unknown key(s): {', '.join(extra)}")
    elif kind == "formula":
        has("cases")
        _need(grader.get("dialect", "excel") == "excel", where, "formula 'dialect' must be excel")
        if "home_cell" in grader:
            _need(isinstance(grader["home_cell"], str) and _CELL_RE.match(grader["home_cell"]) is not None,
                  where, "'home_cell' must be a cell such as C2")
        _need(isinstance(grader["cases"], list) and grader["cases"], where, "formula 'cases' must be a non-empty list")
        for n, case in enumerate(grader["cases"], 1):
            spot = f"{where} case {n}"
            _need(isinstance(case, dict), spot, "a case must be an object")
            _need(isinstance(case.get("cells"), dict), spot, "a case needs a 'cells' object")
            for cell, value in case["cells"].items():
                _need(_CELL_RE.match(cell) is not None, spot, f"bad cell reference {cell!r}")
                _need(isinstance(value, (str, int, float, bool)), spot, f"cell {cell} must hold text, a number or true/false")
            _need("expect" in case, spot, "a case needs 'expect'")
            _need(isinstance(case["expect"], (str, int, float, bool)), spot, "'expect' must be text, a number or true/false")
            if "target_cell" in case:
                _need(isinstance(case["target_cell"], str) and _CELL_RE.match(case["target_cell"]) is not None,
                      spot, "'target_cell' must be a cell such as C3")
            extra = sorted(set(case) - {"cells", "expect", "target_cell", "note"})
            _need(not extra, spot, f"unknown key(s): {', '.join(extra)}")
    elif kind == "checklist":
        has("checks")
        checks = grader["checks"]
        _need(isinstance(checks, list) and checks, where, "checklist 'checks' must be a non-empty list")
        seen = set()
        for n, check in enumerate(checks, 1):
            spot = f"{where} check {n}"
            _need(isinstance(check, dict), spot, "a check must be an object")
            _need(isinstance(check.get("id"), str) and check["id"], spot, "a check needs an 'id'")
            _need(check["id"] not in seen, spot, f"duplicate check id {check['id']!r}")
            seen.add(check["id"])
            _need(isinstance(check.get("text"), str) and check["text"].strip(), spot, "a check needs 'text'")
            by = check.get("by")
            _need(by in ("script", "judge"), spot, "'by' must be script or judge")
            if by == "script":
                _need("script" in check, spot, "a script check needs a 'script' block")
                validate_constraint_check(check["script"], spot)
                extra = sorted(set(check) - {"id", "text", "by", "script", "note"})
            else:
                extra = sorted(set(check) - {"id", "text", "by", "note"})
            _need(not extra, spot, f"unknown key(s): {', '.join(extra)}")


def _normalise_reject_notes(notes: Any, count: int, where: str) -> tuple:
    """Return one note (or None) per reject example, whichever form the file used."""
    if notes is None:
        return (None,) * count
    if isinstance(notes, list):
        _need(len(notes) == count, where, "reject_notes list must be in step with reject_examples")
        _need(all(n is None or isinstance(n, str) for n in notes), where, "reject_notes entries must be text or null")
        return tuple(notes)
    if isinstance(notes, dict):
        out = [None] * count
        for key, note in notes.items():
            match = _NOTE_KEY_RE.match(key) if isinstance(key, str) else None
            _need(match is not None, where, f"reject_notes key {key!r} is not R1, R2, ...")
            index = int(match.group(1))
            _need(1 <= index <= count, where, f"reject_notes key {key} has no matching reject example")
            _need(isinstance(note, str) and note.strip(), where, f"reject_notes {key} must be text")
            out[index - 1] = note
        return tuple(out)
    raise TaskSetError(f"{where}: reject_notes must be an object, a list or absent")


def _build_task(item: Any, split: str, where: str) -> Task:
    _need(isinstance(item, dict), where, "a task must be an object")
    task_id = item.get("id")
    _need(isinstance(task_id, str) and _ID_RE.match(task_id) is not None, where,
          "task id is missing or not of the form f<family>-<pub|ho>-<nn>")
    where = f"{where} {task_id}"
    missing = [key for key in REQUIRED_FIELDS if key not in item]
    _need(not missing, where, f"missing field(s): {', '.join(missing)}")

    match = _ID_RE.match(task_id)
    family = item["family"]
    _need(isinstance(family, int) and not isinstance(family, bool) and 1 <= family <= 7, where, "family must be 1 to 7")
    _need(int(match.group(1)) == family, where, "family does not match the id")
    _need(item["split"] == split, where, f"split is {item['split']!r}, expected {split!r}")
    _need(match.group(2) == ("pub" if split == "public" else "ho"), where, "id does not match the split")
    _need(isinstance(item["answerable"], bool), where, "answerable must be true or false")
    _need(isinstance(item.get("floor", False), bool), where, "floor must be true or false")
    _need(isinstance(item["prompt"], str) and item["prompt"].strip() != "", where, "prompt must be non-empty text")
    _need(item["max_output_tokens"] in (4096, 8192), where, "max_output_tokens must be 4096 or 8192")

    validate_grader(item["grader"], where)
    is_abstain = item["grader"]["type"] == "abstain"
    _need(is_abstain == (not item["answerable"]), where, "the answerable flag and the abstain grader disagree")

    for key in ("accept_examples", "reject_examples"):
        _need(isinstance(item[key], list) and all(isinstance(e, str) for e in item[key]), where,
              f"{key} must be a list of strings")
    _need(len(item["accept_examples"]) >= 1, where, "needs at least one accept example")
    _need(len(item["reject_examples"]) >= 1, where, "needs at least one reject example")
    notes = _normalise_reject_notes(item.get("reject_notes"), len(item["reject_examples"]), where)

    return Task(
        id=task_id, family=family, split=split, answerable=item["answerable"],
        floor=item.get("floor", False), prompt=item["prompt"],
        max_output_tokens=item["max_output_tokens"], grader=item["grader"],
        expected=item["expected"], accept_examples=tuple(item["accept_examples"]),
        reject_examples=tuple(item["reject_examples"]), reject_notes=notes, raw=item,
    )


def _load_folder(folder: Path, split: str) -> list:
    _need(folder.is_dir(), str(folder.name), "task folder not found")
    paths = sorted(folder.glob("*.json"))
    _need(bool(paths), str(folder.name), "no task files found")
    tasks = []
    for path in paths:
        raw = path.read_bytes()
        _need(raw[:3] != b"\xef\xbb\xbf", path.name, "file has a byte order mark")
        try:
            data = _loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, ValueError) as exc:
            # Only the position is reported, never the surrounding text.
            position = f" at line {exc.lineno}" if isinstance(exc, json.JSONDecodeError) else ""
            raise TaskSetError(f"{path.name}: not valid UTF-8 JSON{position}") from None
        _need(isinstance(data, list), path.name, "a task file must hold a JSON list of tasks")
        for n, item in enumerate(data, 1):
            tasks.append(_build_task(item, split, f"{path.name} task {n}:"))
    return tasks


def _verify_held_out(folder: Path, manifest_path: Path, tasks: Optional[list], verify_hashes: bool) -> None:
    _need(manifest_path.is_file(), manifest_path.name, "held-out manifest not found")
    try:
        manifest = _loads(manifest_path.read_text(encoding="utf-8"))
        listed_files = {entry["name"]: entry for entry in manifest["files"]}
        listed_tasks = {entry["id"]: entry for entry in manifest["tasks"]}
    except (ValueError, KeyError, TypeError):
        raise TaskSetError(f"{manifest_path.name}: manifest is not in the expected form") from None

    if tasks is None:
        # First pass, before anything is parsed: files and hashes.
        present = {path.name for path in folder.glob("*.json")}
        for name in sorted(set(listed_files) - present):
            raise TaskSetError(f"held-out file missing: {name}")
        for name in sorted(present - set(listed_files)):
            raise TaskSetError(f"held-out file not in the manifest: {name}")
        if verify_hashes:
            for name, entry in sorted(listed_files.items()):
                digest = hashlib.sha256((folder / name).read_bytes()).hexdigest()
                if digest != entry.get("sha256"):
                    raise TaskSetError(f"held-out file does not match its manifest hash: {name}")
        return

    # Second pass: the tasks themselves against the manifest's list.
    loaded = {task.id: task for task in tasks}
    if sorted(loaded) != sorted(listed_tasks):
        odd = sorted(set(loaded) ^ set(listed_tasks))
        raise TaskSetError(f"held-out ids do not match the manifest: {', '.join(odd)}")
    for task_id, entry in listed_tasks.items():
        task = loaded[task_id]
        if "family" in entry and entry["family"] != task.family:
            raise TaskSetError(f"{task_id}: family differs from the manifest")
        if "answerable" in entry and entry["answerable"] != task.answerable:
            raise TaskSetError(f"{task_id}: answerable flag differs from the manifest")


def load_tasks(public_dir, held_out_dir=None, *, manifest_path=None, verify_hashes: bool = True) -> list:
    """Load and validate the task set.

    ``public_dir`` is the folder of public task files. ``held_out_dir`` is the
    private folder, given at run time; when it's set, every held-out file must
    match its SHA-256 hash in the manifest (``manifest_path``, by default
    ``held-out-manifest.json`` beside the public folder).

    ``verify_hashes=False`` skips only the hash comparison. It exists for a
    local check while held-out files are being edited and must never be used
    for a real run.

    Returns public tasks first, then held-out tasks, each in file order.
    """
    public_dir = Path(public_dir)
    tasks = _load_folder(public_dir, "public")
    if held_out_dir is not None:
        held_out_dir = Path(held_out_dir)
        _need(held_out_dir.is_dir(), "held-out", "held-out folder not found")
        manifest = Path(manifest_path) if manifest_path is not None else public_dir.parent / "held-out-manifest.json"
        _verify_held_out(held_out_dir, manifest, None, verify_hashes)
        held_out = _load_folder(held_out_dir, "held-out")
        _verify_held_out(held_out_dir, manifest, held_out, verify_hashes)
        tasks += held_out

    seen = set()
    for task in tasks:
        _need(task.id not in seen, task.id, "duplicate task id")
        seen.add(task.id)
    return tasks
