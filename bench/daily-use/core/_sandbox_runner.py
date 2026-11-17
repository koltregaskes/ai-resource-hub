"""The program that runs INSIDE the sandbox for a ``python_tests`` task.

``sandbox.py`` sends this file's text to the sandboxed interpreter on standard
input, followed by one line that calls ``_main`` with the job as a JSON string.
It is never run on the host by the graders.

The job holds only the submitted source, the entry name and the test
ARGUMENTS. Expected values never come in here. For each test the program
reports what the entry function returned, as JSON with explicit type tags, or
which exception it raised. The host does the comparing.

Report, one JSON document on the last line of output:

* ``{"load_error": "<exception type>"}`` when the source can't be loaded, or
* ``{"results": [...]}`` with one item per test, each one of
  ``{"value": <tagged value>}``, ``{"raised": ["<type>", "<base>", ...]}`` or
  ``{"error": "output_too_large" | "unserialisable"}``.

A tagged value is ``{"t": "none"}``, ``{"t": "bool", "v": true}``,
``{"t": "int", "v": "<digits>"}`` (a string, so integers of any size are
exact), ``{"t": "float", "v": "<repr>"}``, ``{"t": "str", "v": "..."}``,
``{"t": "list" | "tuple", "v": [...]}``, ``{"t": "dict", "v": [[key, value],
...]}``, ``{"t": "decimal", "v": "<text>"}`` or ``{"t": "other", "type":
"<type name>"}``.

Kept to the standard library and to syntax an old Python 3 can read.
"""
import json
import os
import sys

MAX_RESULT_BYTES = 64 * 1024
MAX_DEPTH = 64


class _TooLarge(Exception):
    pass


def _spend(budget, amount):
    budget[0] -= amount
    if budget[0] < 0:
        raise _TooLarge()


def encode(value, budget=None, depth=0):
    """Turn a returned value into its tagged form, within a size budget."""
    if budget is None:
        budget = [MAX_RESULT_BYTES]
    if depth > MAX_DEPTH:
        raise _TooLarge()
    _spend(budget, 16)
    if value is None:
        return {"t": "none"}
    if value is True or value is False:
        return {"t": "bool", "v": value}
    if isinstance(value, int):
        if int.bit_length(value) > 4 * MAX_RESULT_BYTES:
            raise _TooLarge()
        text = int.__repr__(value)
        _spend(budget, len(text))
        return {"t": "int", "v": text}
    if isinstance(value, float):
        return {"t": "float", "v": float.__repr__(value)}
    if isinstance(value, str):
        _spend(budget, 6 * str.__len__(value))
        return {"t": "str", "v": str.__str__(value)}
    if isinstance(value, (list, tuple)):
        tag = "list" if isinstance(value, list) else "tuple"
        items = list.__iter__(value) if tag == "list" else tuple.__iter__(value)
        return {"t": tag, "v": [encode(item, budget, depth + 1) for item in items]}
    if isinstance(value, dict):
        return {"t": "dict", "v": [[encode(k, budget, depth + 1), encode(v, budget, depth + 1)]
                                   for k, v in dict.items(value)]}
    kind = type(value)
    if getattr(kind, "__module__", "") == "decimal" and getattr(kind, "__name__", "") == "Decimal":
        text = str(value)
        _spend(budget, len(text))
        return {"t": "decimal", "v": text}
    return {"t": "other", "type": _name(kind)}


def _name(kind):
    try:
        text = type.__dict__["__name__"].__get__(kind)
    except Exception:
        text = "object"
    return "".join(ch for ch in str(text)[:60] if ch.isalnum() or ch == "_") or "object"


def run_job(job):
    """Load the submitted source and call the entry once per test."""
    try:
        namespace = {"__name__": "submission"}
        exec(compile(job["source"], "submission.py", "exec"), namespace)
        entry = namespace[job["entry"]]
        if not callable(entry):
            raise TypeError("entry is not callable")
    except BaseException as exc:
        return {"load_error": _name(type(exc))}
    results = []
    for args in job["tests"]:
        try:
            got = entry(*args)
        except BaseException as exc:
            results.append({"raised": [_name(c) for c in type(exc).__mro__[:20]]})
            continue
        try:
            results.append({"value": encode(got)})
        except _TooLarge:
            results.append({"error": "output_too_large"})
        except BaseException:
            results.append({"error": "unserialisable"})
    return {"results": results}


def _write_all(fd, data):
    while data:
        data = data[os.write(fd, data):]


def _main(job_text):
    channel = os.dup(1)
    null = os.open(os.devnull, os.O_RDWR)
    # Whatever the submitted code prints goes nowhere: nothing accumulates.
    os.dup2(null, 0)
    os.dup2(null, 1)
    os.dup2(null, 2)
    sys.stdout = sys.stderr = open(os.devnull, "w")
    _write_all(channel, b'{"started": true}\n')
    try:
        report = json.dumps(run_job(json.loads(job_text)))
    except BaseException:
        report = json.dumps({"load_error": "ReportError"})
    _write_all(channel, (report + "\n").encode("utf-8"))
    os._exit(0)
