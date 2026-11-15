"""Tests for the task loader."""
import copy
import hashlib
import json
import tempfile
import unittest
from pathlib import Path

import _support
from _support import tasks

SECRET_PROMPT = "ZZ-PROMPT-TEXT-THAT-MUST-NEVER-BE-LOGGED-ZZ"


def make_task(task_id="f6-pub-01", split="public", **changes):
    """A small made-up task. Nothing here comes from a real task file."""
    task = {
        "id": task_id, "version": 1, "family": int(task_id[1]), "split": split, "answerable": True,
        "prompt": SECRET_PROMPT, "max_output_tokens": 4096,
        "grader": {"type": "exact", "value": "42"}, "expected": "42",
        "accept_examples": ["42"], "reject_examples": ["41"], "sources": [],
        "why_hard": "-", "verification": "-", "author": "test", "written_on": "2026-11-14",
    }
    task.update(changes)
    return task


class Folder:
    """A temporary task set: a public folder, a held-out folder and a manifest."""

    def __init__(self, public, held_out=None):
        self._tmp = tempfile.TemporaryDirectory()
        self.root = Path(self._tmp.name)
        self.public = self.root / "public"
        self.public.mkdir()
        self.write(self.public / "tasks.json", public)
        self.held_out = None
        if held_out is not None:
            self.held_out = self.root / "private-store"
            self.held_out.mkdir()
            self.write(self.held_out / "set.json", held_out)
            self.write_manifest(held_out)

    @staticmethod
    def write(path, data):
        path.write_text(json.dumps(data, indent=1), encoding="utf-8")

    def write_manifest(self, held_out, names=("set.json",)):
        files = [{"name": n, "sha256": hashlib.sha256((self.held_out / n).read_bytes()).hexdigest()} for n in names]
        listed = [{"id": t["id"], "family": t["family"], "answerable": t["answerable"]} for t in held_out]
        self.write(self.root / "held-out-manifest.json", {"task_set_version": 1, "files": files, "tasks": listed})

    def close(self):
        self._tmp.cleanup()


class LoaderCase(unittest.TestCase):
    def folder(self, public, held_out=None):
        made = Folder(public, held_out)
        self.addCleanup(made.close)
        return made

    def load_error(self, public):
        with self.assertRaises(tasks.TaskSetError) as caught:
            tasks.load_tasks(self.folder(public).public)
        message = str(caught.exception)
        self.assertNotIn(SECRET_PROMPT, message)
        return message


class PublicSetTest(unittest.TestCase):
    def test_the_real_public_set_loads(self):
        loaded = tasks.load_tasks(_support.PUBLIC_DIR)
        self.assertEqual(len(loaded), 40)
        self.assertEqual(len({t.id for t in loaded}), 40)
        self.assertTrue(all(t.split == "public" for t in loaded))
        self.assertEqual(sorted(t.id for t in loaded if not t.answerable), ["f2-pub-07", "f3-pub-05"])

    def test_reject_notes_become_one_entry_per_reject_example(self):
        for task in tasks.load_tasks(_support.PUBLIC_DIR):
            self.assertEqual(len(task.reject_notes), len(task.reject_examples), task.id)


class ValidationTest(LoaderCase):
    def test_a_good_task_loads(self):
        loaded = tasks.load_tasks(self.folder([make_task()]).public)
        self.assertEqual(loaded[0].id, "f6-pub-01")
        self.assertEqual(loaded[0].grader_type, "exact")
        self.assertFalse(loaded[0].floor)

    def test_unknown_grader_type_is_refused(self):
        message = self.load_error([make_task(grader={"type": "vibes"})])
        self.assertIn("unknown grader type 'vibes'", message)
        self.assertIn("f6-pub-01", message)

    def test_missing_field_is_refused_and_named(self):
        bad = make_task()
        del bad["expected"]
        del bad["sources"]
        message = self.load_error([bad])
        self.assertIn("missing field(s): expected, sources", message)

    def test_missing_grader_option_is_refused(self):
        self.assertIn("missing 'tolerance'", self.load_error(
            [make_task(grader={"type": "numeric", "value": 1, "extract": "only_number"})]))
        self.assertIn("missing 'pattern'", self.load_error([make_task(grader={"type": "regex"})]))
        self.assertIn("missing 'checks'", self.load_error([make_task(grader={"type": "checklist"})]))

    def test_unknown_grader_option_is_refused(self):
        message = self.load_error([make_task(grader={"type": "exact", "value": "42", "case_sensitve": True})])
        self.assertIn("unknown option(s) for a exact grader: case_sensitve", message)

    def test_unknown_check_type_and_bad_flags_are_refused(self):
        bad_check = {"type": "constraints", "all": [{"check": "max_sentences", "value": 2}]}
        self.assertIn("unknown check type", self.load_error([make_task(grader=bad_check)]))
        bad_flag = {"type": "regex", "pattern": "a", "flags": "x"}
        self.assertIn("unknown regex flag 'x'", self.load_error([make_task(grader=bad_flag)]))
        bad_pattern = {"type": "regex", "pattern": "(a"}
        self.assertIn("does not compile", self.load_error([make_task(grader=bad_pattern)]))

    def test_checklist_checks_are_validated(self):
        no_script = {"type": "checklist", "checks": [{"id": "c1", "text": "t", "by": "script"}]}
        self.assertIn("needs a 'script' block", self.load_error([make_task(grader=no_script)]))
        twice = {"type": "checklist", "checks": [{"id": "c1", "text": "t", "by": "judge"},
                                                 {"id": "c1", "text": "u", "by": "judge"}]}
        self.assertIn("duplicate check id", self.load_error([make_task(grader=twice)]))

    def test_abstain_grader_and_answerable_flag_must_agree(self):
        self.assertIn("disagree", self.load_error([make_task(grader={"type": "abstain"})]))
        self.assertIn("disagree", self.load_error([make_task(answerable=False)]))

    def test_id_family_and_split_must_agree(self):
        self.assertIn("family does not match", self.load_error([make_task(family=3)]))
        self.assertIn("split is 'held-out'", self.load_error([make_task(split="held-out")]))
        self.assertIn("not of the form", self.load_error([make_task(task_id="f6-pub-1")]))

    def test_duplicate_ids_are_refused(self):
        self.assertIn("duplicate task id", self.load_error([make_task(), make_task()]))

    def test_a_byte_order_mark_is_refused(self):
        made = self.folder([make_task()])
        path = made.public / "tasks.json"
        path.write_bytes(b"\xef\xbb\xbf" + path.read_bytes())
        with self.assertRaises(tasks.TaskSetError) as caught:
            tasks.load_tasks(made.public)
        self.assertIn("byte order mark", str(caught.exception))

    def test_broken_json_is_refused_without_quoting_the_file(self):
        made = self.folder([make_task()])
        (made.public / "tasks.json").write_text('[{"prompt": "' + SECRET_PROMPT + '", ]', encoding="utf-8")
        with self.assertRaises(tasks.TaskSetError) as caught:
            tasks.load_tasks(made.public)
        self.assertIn("not valid UTF-8 JSON", str(caught.exception))
        self.assertNotIn(SECRET_PROMPT, str(caught.exception))

    def test_integers_stay_exact(self):
        huge = 10000000000000000000000000001
        grader = {"type": "python_tests", "entry": "f", "tests": [{"args": [huge], "expect": huge + 1}]}
        loaded = tasks.load_tasks(self.folder([make_task(grader=grader)]).public)
        test = loaded[0].grader["tests"][0]
        self.assertIsInstance(test["args"][0], int)
        self.assertEqual(test["args"][0], huge)
        self.assertEqual(test["expect"] - test["args"][0], 1)

    def test_nan_is_refused(self):
        made = self.folder([make_task()])
        text = (made.public / "tasks.json").read_text(encoding="utf-8").replace('"value": "42"', '"value": NaN')
        (made.public / "tasks.json").write_text(text, encoding="utf-8")
        with self.assertRaises(tasks.TaskSetError):
            tasks.load_tasks(made.public)

    def test_prompt_text_is_not_in_repr(self):
        loaded = tasks.load_tasks(self.folder([make_task()]).public)
        self.assertNotIn(SECRET_PROMPT, repr(loaded[0]))
        self.assertNotIn(SECRET_PROMPT, str(loaded))
        self.assertEqual(loaded[0].prompt, SECRET_PROMPT)

    def test_reject_notes_forms(self):
        as_object = make_task(reject_examples=["a", "b", "c"], reject_notes={"R3": "judge check c9"})
        as_list = make_task(task_id="f6-pub-02", reject_examples=["a", "b"], reject_notes=[None, "judge check c2"])
        loaded = tasks.load_tasks(self.folder([as_object, as_list]).public)
        self.assertEqual(loaded[0].reject_notes, (None, None, "judge check c9"))
        self.assertEqual(loaded[1].reject_notes, (None, "judge check c2"))
        self.assertIn("no matching reject example", self.load_error([make_task(reject_notes={"R2": "x"})]))
        self.assertIn("in step", self.load_error([make_task(reject_notes=[None, None])]))


class HeldOutTest(LoaderCase):
    """Uses a made-up held-out folder in a temporary directory, never the real one."""

    def held_out_tasks(self):
        return [make_task("f2-ho-01", "held-out"),
                make_task("f3-ho-01", "held-out", answerable=False, grader={"type": "abstain"})]

    def test_matching_hashes_load(self):
        made = self.folder([make_task()], self.held_out_tasks())
        loaded = tasks.load_tasks(made.public, made.held_out)
        self.assertEqual([t.id for t in loaded], ["f6-pub-01", "f2-ho-01", "f3-ho-01"])
        self.assertEqual([t.split for t in loaded], ["public", "held-out", "held-out"])

    def test_a_changed_file_is_refused(self):
        held_out = self.held_out_tasks()
        made = self.folder([make_task()], held_out)
        changed = copy.deepcopy(held_out)
        changed[0]["expected"] = "43"
        made.write(made.held_out / "set.json", changed)
        with self.assertRaises(tasks.TaskSetError) as caught:
            tasks.load_tasks(made.public, made.held_out)
        self.assertIn("does not match its manifest hash: set.json", str(caught.exception))
        self.assertNotIn(SECRET_PROMPT, str(caught.exception))

    def test_one_changed_byte_is_enough(self):
        made = self.folder([make_task()], self.held_out_tasks())
        path = made.held_out / "set.json"
        path.write_bytes(path.read_bytes() + b"\n")
        with self.assertRaises(tasks.TaskSetError):
            tasks.load_tasks(made.public, made.held_out)

    def test_skipping_the_hash_check_is_explicit(self):
        made = self.folder([make_task()], self.held_out_tasks())
        path = made.held_out / "set.json"
        path.write_bytes(path.read_bytes() + b"\n")
        loaded = tasks.load_tasks(made.public, made.held_out, verify_hashes=False)
        self.assertEqual(len(loaded), 3)

    def test_missing_and_unlisted_files_are_refused(self):
        made = self.folder([make_task()], self.held_out_tasks())
        made.write(made.held_out / "extra.json", [])
        with self.assertRaises(tasks.TaskSetError) as caught:
            tasks.load_tasks(made.public, made.held_out)
        self.assertIn("not in the manifest: extra.json", str(caught.exception))
        (made.held_out / "extra.json").unlink()
        (made.held_out / "set.json").unlink()
        with self.assertRaises(tasks.TaskSetError) as caught:
            tasks.load_tasks(made.public, made.held_out)
        self.assertIn("held-out file missing: set.json", str(caught.exception))

    def test_ids_must_match_the_manifest(self):
        held_out = self.held_out_tasks()
        made = self.folder([make_task()], held_out)
        made.write_manifest(held_out[:1])
        with self.assertRaises(tasks.TaskSetError) as caught:
            tasks.load_tasks(made.public, made.held_out)
        self.assertIn("held-out ids do not match the manifest: f3-ho-01", str(caught.exception))

    def test_a_missing_manifest_is_refused(self):
        made = self.folder([make_task()], self.held_out_tasks())
        (made.root / "held-out-manifest.json").unlink()
        with self.assertRaises(tasks.TaskSetError):
            tasks.load_tasks(made.public, made.held_out)

    def test_a_public_task_in_the_held_out_folder_is_refused(self):
        made = self.folder([make_task()], [make_task("f2-pub-01", "public")])
        with self.assertRaises(tasks.TaskSetError):
            tasks.load_tasks(made.public, made.held_out)

    def test_the_committed_manifest_lists_twenty_tasks(self):
        manifest = json.loads((_support.TASK_SET_DIR / "held-out-manifest.json").read_text(encoding="utf-8"))
        self.assertEqual(len(manifest["tasks"]), 20)
        self.assertTrue(all(len(entry["sha256"]) == 64 for entry in manifest["files"]))


if __name__ == "__main__":
    unittest.main()
