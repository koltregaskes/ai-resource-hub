"""Validate the Day-to-Day Bench task set v1.

Usage:
  python validate_set.py                      # public tasks and the held-out manifest
  python validate_set.py --held-out <folder>  # also the private held-out files, checked against the manifest

Checks counts per family and split, unique ids, required fields, and that the held-out
files match the hashes in held-out-manifest.json. Exits 1 on any problem.
"""
import hashlib
import json
import sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WANT = {1: (7, 3), 2: (7, 3), 3: (5, 3), 4: (5, 3), 5: (5, 3), 6: (6, 2), 7: (5, 3)}
REQUIRED = ["id", "version", "family", "split", "answerable", "prompt", "max_output_tokens", "grader", "expected",
            "accept_examples", "reject_examples", "sources", "why_hard", "verification", "author", "written_on"]


def load(folder, split, problems):
    tasks = []
    for path in sorted(Path(folder).glob("*.json")):
        raw = path.read_bytes()
        if raw[:3] == b"\xef\xbb\xbf":
            problems.append(f"{path.name}: has a BOM")
        for task in json.loads(raw.decode("utf-8")):
            if task.get("split") != split:
                problems.append(f"{task.get('id')}: split {task.get('split')!r}, expected {split!r}")
            for key in REQUIRED:
                if key not in task:
                    problems.append(f"{task.get('id')}: missing {key}")
            tasks.append(task)
    return tasks


def main():
    problems = []
    held_out_dir = sys.argv[sys.argv.index("--held-out") + 1] if "--held-out" in sys.argv else None
    manifest = json.loads((HERE / "held-out-manifest.json").read_text(encoding="utf-8"))

    public = load(HERE / "public", "public", problems)
    count = Counter(t["family"] for t in public)
    for family, (want_public, _) in WANT.items():
        if count[family] != want_public:
            problems.append(f"family {family}: {count[family]} public tasks, expected {want_public}")
    floor = Counter(t["family"] for t in public if t.get("floor"))
    problems += [f"family {f}: {n} floor tasks, at most 2 allowed" for f, n in floor.items() if n > 2]

    listed = Counter(t["family"] for t in manifest["tasks"])
    for family, (_, want_held_out) in WANT.items():
        if listed[family] != want_held_out:
            problems.append(f"family {family}: manifest lists {listed[family]} held-out tasks, expected {want_held_out}")

    everything = list(public)
    if held_out_dir:
        for entry in manifest["files"]:
            path = Path(held_out_dir) / entry["name"]
            if not path.exists():
                problems.append(f"held-out file missing: {entry['name']}")
            elif hashlib.sha256(path.read_bytes()).hexdigest() != entry["sha256"]:
                problems.append(f"held-out file changed since the manifest: {entry['name']}")
        held_out = load(held_out_dir, "held-out", problems)
        if sorted(t["id"] for t in held_out) != sorted(t["id"] for t in manifest["tasks"]):
            problems.append("held-out ids don't match the manifest")
        everything += held_out

    ids = Counter(t["id"] for t in everything) + Counter(t["id"] for t in manifest["tasks"] if not held_out_dir)
    problems += [f"duplicate id {i}" for i, n in ids.items() if n > 1]

    unanswerable = Counter((t["family"], t["split"]) for t in everything if not t["answerable"])
    splits = ("public", "held-out") if held_out_dir else ("public",)
    for family in (2, 3):
        for split in splits:
            if unanswerable[(family, split)] != 1:
                problems.append(f"family {family} {split}: {unanswerable[(family, split)]} unanswerable tasks, expected 1")
    for task in everything:
        grader = task["grader"]["type"]
        if (not task["answerable"]) != (grader == "abstain"):
            problems.append(f"{task['id']}: answerable flag and abstain grader disagree")
        if not task["answerable"] and task["family"] not in (2, 3):
            problems.append(f"{task['id']}: unanswerable task outside families 2 and 3")
        if task["family"] == 2 and task["answerable"] and not task["sources"]:
            problems.append(f"{task['id']}: family 2 fact with no source")
        if task["max_output_tokens"] not in (4096, 8192):
            problems.append(f"{task['id']}: max_output_tokens {task['max_output_tokens']}")
        if grader != "abstain" and (len(task["accept_examples"]) < 2 or len(task["reject_examples"]) < 3):
            problems.append(f"{task['id']}: needs 2 accept and 3 reject examples")

    print(f"public: {len(public)} | held-out listed: {len(manifest['tasks'])} | held-out files checked: {'yes' if held_out_dir else 'no'}")
    print("graders:", dict(Counter(t["grader"]["type"] for t in everything)))
    print("PROBLEMS:" if problems else "NO PROBLEMS")
    for problem in problems:
        print(" -", problem)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
