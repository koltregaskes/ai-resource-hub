"""Key loading: only the named entries, and the value is never shown."""

import copy
import gc
import io
import json
import logging
import os
import pickle
import sys
import tempfile
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import keys  # noqa: E402
import test_run_support as support  # noqa: E402


def reachable_strings(root):
    """Every string reachable from an object, by walking its referents."""
    seen = set()
    stack = [root]
    found = []
    while stack:
        item = stack.pop()
        if id(item) in seen or isinstance(item, type) or callable(item):
            continue
        seen.add(id(item))
        if isinstance(item, str):
            found.append(item)
            continue
        stack.extend(gc.get_referents(item))
    return found


class KeyLoadingTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)

    def load(self, lines=None, names=None):
        path = support.write_key_file(self.folder.name, lines)
        return keys.load_keys(path, names or support.KEY_NAMES)

    def test_found(self):
        loaded = self.load()
        self.assertEqual(loaded.providers(), ["anthropic", "openai"])
        self.assertEqual(loaded.secret("openai").reveal(), support.FAKE_OPENAI_KEY)
        self.assertEqual(loaded.secret("anthropic").reveal(), support.FAKE_ANTHROPIC_KEY)

    def test_alternative_name_is_used_when_the_first_is_absent(self):
        loaded = self.load(["OPENAI_API_KEY=" + support.FAKE_OPENAI_KEY,
                            "CLAUDE_API_KEY=" + support.FAKE_ANTHROPIC_KEY])
        self.assertEqual(loaded.secret("anthropic").reveal(), support.FAKE_ANTHROPIC_KEY)

    def test_first_listed_name_wins_and_the_other_is_dropped(self):
        other = "FAKE-SECOND-CHOICE-VALUE-0004"
        loaded = self.load(["OPENAI_API_KEY=" + support.FAKE_OPENAI_KEY,
                            "CLAUDE_API_KEY=" + other,
                            "CLAUDE_API=" + support.FAKE_ANTHROPIC_KEY])
        self.assertEqual(loaded.secret("anthropic").reveal(), support.FAKE_ANTHROPIC_KEY)
        self.assertNotIn(other, reachable_strings(loaded))

    def test_name_match_ignores_case_and_accepts_export_and_quotes(self):
        loaded = self.load(["openai_api_key = '" + support.FAKE_OPENAI_KEY + "'",
                            "export   Claude_Api=" + support.FAKE_ANTHROPIC_KEY])
        self.assertEqual(loaded.secret("openai").reveal(), support.FAKE_OPENAI_KEY)
        self.assertEqual(loaded.secret("anthropic").reveal(), support.FAKE_ANTHROPIC_KEY)

    def test_missing_name_gives_the_exact_message(self):
        with self.assertRaises(keys.KeyNotFound) as caught:
            self.load(["OPENAI_API_KEY=" + support.FAKE_OPENAI_KEY,
                       "UNRELATED_TOKEN=" + support.FAKE_UNRELATED])
        self.assertEqual(str(caught.exception), "key not found: CLAUDE_API")
        for value in support.FAKE_VALUES:
            self.assertNotIn(value, repr(caught.exception))

    def test_nothing_outside_the_list_is_tried(self):
        with self.assertRaises(keys.KeyNotFound) as caught:
            self.load(["OPENAI_KEY=" + support.FAKE_OPENAI_KEY,
                       "ANTHROPIC_API_KEY=" + support.FAKE_ANTHROPIC_KEY,
                       "CLAUDE_API=" + support.FAKE_ANTHROPIC_KEY])
        self.assertEqual(str(caught.exception), "key not found: OPENAI_API_KEY")

    def test_other_lines_are_never_retained(self):
        handler_output = io.StringIO()
        handler = logging.StreamHandler(handler_output)
        logging.getLogger().addHandler(handler)
        self.addCleanup(logging.getLogger().removeHandler, handler)
        stdout, stderr = io.StringIO(), io.StringIO()
        with mock.patch("sys.stdout", stdout), mock.patch("sys.stderr", stderr):
            loaded = self.load()
        # The returned object holds exactly the two kept values and no other string.
        strings = reachable_strings(loaded)
        self.assertNotIn(support.FAKE_UNRELATED, "\n".join(strings))
        self.assertEqual(sorted(s for s in strings if s.startswith("FAKE-")),
                         sorted([support.FAKE_OPENAI_KEY, support.FAKE_ANTHROPIC_KEY]))
        # Nothing was logged or printed.
        self.assertEqual(handler_output.getvalue() + stdout.getvalue() + stderr.getvalue(), "")
        # A memory-light check: the object is two small slots, not a copy of the file.
        self.assertEqual(len(loaded._secrets), 2)
        self.assertLess(sum(sys.getsizeof(s) for s in strings), 400)

    def test_keys_never_enter_the_environment(self):
        before = dict(os.environ)
        self.load()
        self.assertEqual(dict(os.environ), before)
        for value in support.FAKE_VALUES:
            self.assertNotIn(value, "\n".join(os.environ.values()))

    def test_value_never_in_repr_str_format_or_serialised_form(self):
        loaded = self.load()
        secret = loaded.secret("openai")
        shown = [repr(loaded), str(loaded), "%s %r" % (loaded, loaded), "{}".format(loaded),
                 f"{loaded}", repr(secret), str(secret), f"{secret!r} {secret!s} {secret}",
                 "%s" % secret, repr([secret]), repr({"k": secret}), repr(vars(keys).get("x"))]
        for text in shown:
            for value in support.FAKE_VALUES:
                self.assertNotIn(value, text)
        for item in (secret, loaded):
            with self.assertRaises(TypeError):
                pickle.dumps(item)
            with self.assertRaises(TypeError):
                copy.deepcopy(item)
            with self.assertRaises(TypeError):
                json.dumps(item)
        with self.assertRaises(AttributeError):
            secret.other = 1

    def test_leak_check_detects_a_value_without_showing_it(self):
        loaded = self.load()
        self.assertTrue(loaded.leaks_into("x " + support.FAKE_ANTHROPIC_KEY + " y"))
        self.assertFalse(loaded.leaks_into("nothing here"))

    def test_bad_entries_raise_without_the_value(self):
        cases = [
            ["OPENAI_API_KEY=" + support.FAKE_OPENAI_KEY + " trailing words",
             "CLAUDE_API=" + support.FAKE_ANTHROPIC_KEY],
            ["OPENAI_API_KEY='" + support.FAKE_OPENAI_KEY,
             "CLAUDE_API=" + support.FAKE_ANTHROPIC_KEY],
            ["OPENAI_API_KEY=" + support.FAKE_OPENAI_KEY,
             "OPENAI_API_KEY=" + support.FAKE_UNRELATED,
             "CLAUDE_API=" + support.FAKE_ANTHROPIC_KEY],
            ["OPENAI_API_KEY=", "CLAUDE_API=" + support.FAKE_ANTHROPIC_KEY],
        ]
        for lines in cases:
            with self.assertRaises(keys.KeyFileError) as caught:
                self.load(lines)
            for value in support.FAKE_VALUES:
                self.assertNotIn(value, str(caught.exception))
                self.assertNotIn(value, repr(caught.exception))
            self.assertIsNone(caught.exception.__cause__)

    def test_missing_file_raises_a_plain_error(self):
        with self.assertRaises(keys.KeyFileError) as caught:
            keys.load_keys(os.path.join(self.folder.name, "absent.txt"), support.KEY_NAMES)
        self.assertEqual(str(caught.exception), "key file unavailable")

    def test_placeholder_secret_cannot_be_revealed(self):
        with self.assertRaises(keys.KeyFileError):
            keys.Secret.placeholder().reveal()


class CleanEnvironmentTests(unittest.TestCase):
    def test_refuses_when_a_provider_variable_is_set(self):
        for name in ("OPENAI_API_KEY", "ANTHROPIC_API_KEY"):
            with self.assertRaises(keys.EnvironmentNotClean) as caught:
                keys.assert_clean_environment({name: support.FAKE_OPENAI_KEY})
            self.assertIn(name, str(caught.exception))
            self.assertNotIn(support.FAKE_OPENAI_KEY, str(caught.exception))

    def test_refuses_even_when_the_variable_is_empty(self):
        with self.assertRaises(keys.EnvironmentNotClean):
            keys.assert_clean_environment({"OPENAI_API_KEY": ""})

    def test_reads_the_real_environment_by_default(self):
        with mock.patch.dict(os.environ, {"ANTHROPIC_API_KEY": "FAKE-ENV-VALUE"}):
            with self.assertRaises(keys.EnvironmentNotClean):
                keys.assert_clean_environment()

    def test_passes_when_clean(self):
        keys.assert_clean_environment({"PATH": "x", "OPENAI_ORG": "y"})


if __name__ == "__main__":
    unittest.main()
