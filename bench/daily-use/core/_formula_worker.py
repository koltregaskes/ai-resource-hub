"""Formula engine worker. Run by graders.py in a separate process; not imported.

Protocol, one JSON document per line:

* On start the worker imports the engine, evaluates one warm-up formula and
  prints ``{"ready": true, "formulas": "<version>", "openpyxl": "<version>"}``.
* For each request line ``{"cases": [{"cells": {...}, "formula": "=...", "cell": "C2"}]}``
  it prints ``{"results": [...]}`` with one result per case.

A result is one of:
``{"kind": "number", "value": 1.5}``, ``{"kind": "text", "value": "abc"}``,
``{"kind": "bool", "value": true}``, ``{"kind": "error", "value": "#DIV/0!"}``,
``{"kind": "empty"}``, ``{"kind": "other"}`` or
``{"kind": "exception", "name": "...", "parse_error": true or false}``.

The engine evaluates spreadsheet expressions; it does not run code. It still
parses model-written text, so the parent caps what reaches it (see
``grade_formula``) and this worker refuses a request line or a formula over
its own limits as well. The parent enforces the time limit and kills a worker
that overruns.

The folders holding the engine packages are passed as command-line arguments
and put on ``sys.path``. The worker writes its scratch workbook in its current
directory, which the parent sets to a temporary folder.
"""
import json
import numbers
import os
import sys

MAX_FORMULA_CHARS = 2100       # the parent's cap is 2,000, plus a leading "="
MAX_REQUEST_CHARS = 1_000_000


def main() -> int:
    for folder in reversed(sys.argv[1:]):
        sys.path.insert(0, folder)
    out = sys.stdout
    # Keep the protocol channel clean whatever the engine prints.
    sys.stdout = open(os.devnull, "w", encoding="utf-8")
    sys.stderr = sys.stdout

    import formulas
    import openpyxl
    import schedula
    from formulas.errors import FormulaError
    from formulas.tokens.operand import XlError

    def evaluate(case):
        try:
            if not isinstance(case.get("formula"), str) or len(case["formula"]) > MAX_FORMULA_CHARS:
                return {"kind": "exception", "name": "FormulaTooLong", "parse_error": False}
            book = openpyxl.Workbook()
            sheet = book.active
            sheet.title = "S"
            for ref, value in case["cells"].items():
                sheet[ref] = value
            sheet[case["cell"]] = case["formula"]
            book.save("case.xlsx")
            model = formulas.ExcelModel().loads("case.xlsx").finish()
            solution = model.calculate()
            wanted = "!" + case["cell"].upper()
            keys = [key for key in solution if isinstance(key, str) and key.upper().endswith(wanted)]
            if len(keys) != 1:
                return {"kind": "exception", "name": "CellNotCalculated", "parse_error": False}
            value = solution[keys[0]].value[0, 0]
        except FormulaError as exc:
            return {"kind": "exception", "name": type(exc).__name__, "parse_error": True}
        except BaseException as exc:  # the engine failing is the formula failing
            return {"kind": "exception", "name": type(exc).__name__, "parse_error": False}
        if isinstance(value, XlError):
            return {"kind": "error", "value": str(value)}
        if value is schedula.EMPTY or value is None:
            return {"kind": "empty"}
        if isinstance(value, bool) or type(value).__name__ in ("bool_", "bool"):
            return {"kind": "bool", "value": bool(value)}
        if isinstance(value, numbers.Number):
            number = float(value)
            if number != number or number in (float("inf"), float("-inf")):
                return {"kind": "error", "value": "#NUM!"}
            return {"kind": "number", "value": number}
        if isinstance(value, str):
            return {"kind": "text", "value": value}
        return {"kind": "other"}

    evaluate({"cells": {"A1": 1, "A2": "x"}, "formula": '=SUMIF(A2:A2,"x",A1:A1)+ROUND(1.234,2)', "cell": "B1"})
    out.write(json.dumps({"ready": True, "formulas": formulas.__version__, "openpyxl": openpyxl.__version__}) + "\n")
    out.flush()

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        if len(line) > MAX_REQUEST_CHARS:
            out.write(json.dumps({"results": None}) + "\n")
            out.flush()
            continue
        request = json.loads(line)
        results = [evaluate(case) for case in request["cases"]]
        out.write(json.dumps({"results": results}) + "\n")
        out.flush()
    return 0


if __name__ == "__main__":
    sys.exit(main())
