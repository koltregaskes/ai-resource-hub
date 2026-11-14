"""Tests for the script graders: exact, one_of, regex, numeric, json, constraints."""
import unittest

import _support  # noqa: F401  (sets up the import path)
from _support import graders


def passed(result):
    return result.passed is True


def failed(result):
    return result.passed is False and result.failed_by == "script"


class AnswerTest(unittest.TestCase):
    def test_trim_removes_outer_whitespace_only(self):
        self.assertEqual(graders.trim("\n  a  b \t\n"), "a  b")

    def test_a_single_fence_is_unwrapped(self):
        self.assertEqual(graders.unwrap_fence('```json\n{"a": 1}\n```'), '{"a": 1}')
        self.assertEqual(graders.unwrap_fence("```\nx = 1\n```"), "x = 1")
        self.assertEqual(graders.unwrap_fence("~~~python\nx = 1\n~~~"), "x = 1")

    def test_prose_around_a_fence_or_two_fences_are_left_alone(self):
        for text in ('Here you go:\n```json\n{"a": 1}\n```',
                     '```json\n{"a": 1}\n```\nHope that helps.',
                     "```\na\n```\n```\nb\n```",
                     "`inline`"):
            self.assertEqual(graders.unwrap_fence(text), text)

    def test_words_are_split_on_whitespace(self):
        self.assertEqual(graders.word_count("one  two\nthree\tfour-five"), 4)


class ExactTest(unittest.TestCase):
    def test_trimmed_and_case_insensitive_by_default(self):
        params = {"type": "exact", "value": "CONFLICT"}
        self.assertTrue(passed(graders.grade_exact("  conflict\n", params)))
        self.assertTrue(failed(graders.grade_exact("conflict.", params)))
        self.assertTrue(failed(graders.grade_exact("a conflict", params)))

    def test_case_sensitive_when_asked(self):
        params = {"type": "exact", "value": "Yes", "case_sensitive": True}
        self.assertTrue(passed(graders.grade_exact("Yes", params)))
        self.assertTrue(failed(graders.grade_exact("yes", params)))

    def test_a_fence_is_part_of_the_answer(self):
        params = {"type": "exact", "value": "09:10"}
        self.assertTrue(failed(graders.grade_exact("```\n09:10\n```", params)))


class OneOfTest(unittest.TestCase):
    def test_any_listed_value(self):
        params = {"type": "one_of", "values": ["grey", "gray"]}
        self.assertTrue(passed(graders.grade_one_of(" Gray ", params)))
        self.assertTrue(failed(graders.grade_one_of("green", params)))
        strict = {"type": "one_of", "values": ["grey", "gray"], "case_sensitive": True}
        self.assertTrue(failed(graders.grade_one_of("Gray", strict)))


class RegexTest(unittest.TestCase):
    def test_whole_answer_by_default_even_without_anchors(self):
        params = {"type": "regex", "pattern": r"\d{2}:\d{2}"}
        self.assertTrue(passed(graders.grade_regex(" 10:15 ", params)))
        self.assertTrue(failed(graders.grade_regex("at 10:15", params)))
        self.assertTrue(failed(graders.grade_regex("10:15 sharp", params)))

    def test_search_finds_it_anywhere(self):
        params = {"type": "regex", "pattern": r"\d{2}:\d{2}", "search": True}
        self.assertTrue(passed(graders.grade_regex("at 10:15 sharp", params)))
        self.assertTrue(failed(graders.grade_regex("at ten", params)))

    def test_flags(self):
        self.assertTrue(failed(graders.grade_regex("MONDAY", {"type": "regex", "pattern": "monday"})))
        self.assertTrue(failed(graders.grade_regex("MONDAY", {"type": "regex", "pattern": "monday", "flags": ""})))
        self.assertTrue(passed(graders.grade_regex("MONDAY", {"type": "regex", "pattern": "monday", "flags": "i"})))
        dotall = {"type": "regex", "pattern": "a.b", "flags": "s"}
        self.assertTrue(passed(graders.grade_regex("a\nb", dotall)))
        self.assertTrue(failed(graders.grade_regex("a\nb", {"type": "regex", "pattern": "a.b"})))
        multiline = {"type": "regex", "pattern": r"^b$", "flags": "m", "search": True}
        self.assertTrue(passed(graders.grade_regex("a\nb\nc", multiline)))
        self.assertTrue(failed(graders.grade_regex("a\nb\nc", {"type": "regex", "pattern": r"^b$", "search": True})))


class NumericTest(unittest.TestCase):
    ONLY = {"type": "numeric", "value": 1830, "tolerance": 0, "extract": "only_number"}

    def test_only_number_accepts_one_bare_number(self):
        for answer in ("1830", " 1,830 ", "1830.0", "1,830.00"):
            self.assertTrue(passed(graders.grade_numeric(answer, self.ONLY)), answer)

    def test_only_number_refuses_anything_else(self):
        for answer in ("1830.", "1830 miles", "about 1830", "**1830**", "1830 1830", "£1830", "1830%",
                       "one thousand", "1,83,0", "1830,", "+1830", "1.830,00", ".5", "```\n1830\n```", ""):
            self.assertTrue(failed(graders.grade_numeric(answer, self.ONLY)), answer)

    def test_minus_sign(self):
        params = {"type": "numeric", "value": -4.5, "tolerance": 0, "extract": "only_number"}
        self.assertTrue(passed(graders.grade_numeric("-4.5", params)))
        self.assertTrue(failed(graders.grade_numeric("4.5", params)))

    def test_tolerance_zero_means_exactly_equal(self):
        params = {"type": "numeric", "value": 14, "tolerance": 0, "extract": "only_number"}
        self.assertTrue(passed(graders.grade_numeric("14.0", params)))
        self.assertTrue(failed(graders.grade_numeric("14.01", params)))
        exact = {"type": "numeric", "value": 568.26125, "tolerance": 0, "extract": "only_number"}
        self.assertTrue(passed(graders.grade_numeric("568.26125", exact)))
        self.assertTrue(failed(graders.grade_numeric("568.26", exact)))

    def test_tolerance_is_inclusive_and_compared_as_decimals(self):
        params = {"type": "numeric", "value": 80.5, "tolerance": 0.005, "extract": "only_number"}
        for answer in ("80.5", "80.495", "80.505", "80.50"):
            self.assertTrue(passed(graders.grade_numeric(answer, params)), answer)
        for answer in ("80.4949", "80.5051", "80.51", "81"):
            self.assertTrue(failed(graders.grade_numeric(answer, params)), answer)

    def test_allow_affixes(self):
        params = {"type": "numeric", "value": 80.5, "tolerance": 0.005, "extract": "only_number",
                  "allow_affixes": ["£", "GBP"]}
        for answer in ("£80.50", "£ 80.50", "80.50 GBP", "80.50", "£80.50 GBP"):
            self.assertTrue(passed(graders.grade_numeric(answer, params)), answer)
        for answer in ("$80.50", "££80.50", "80.50 gbp", "80.50 pounds", "£80.50.", "GBP GBP 80.50", "£80.50 each"):
            self.assertTrue(failed(graders.grade_numeric(answer, params)), answer)

    def test_last_number(self):
        params = {"type": "numeric", "value": 1830, "tolerance": 0, "extract": "last_number"}
        self.assertTrue(passed(graders.grade_numeric("3 trains and 12 stops, so the total is 1,830.", params)))
        self.assertTrue(passed(graders.grade_numeric("**1830** miles", params)))
        self.assertTrue(failed(graders.grade_numeric("1830 miles in 2 days", params)))
        self.assertTrue(failed(graders.grade_numeric("no number here", params)))
        ranged = {"type": "numeric", "value": 14, "tolerance": 0, "extract": "last_number"}
        self.assertTrue(passed(graders.grade_numeric("pages 10-14", ranged)))
        negative = {"type": "numeric", "value": -14, "tolerance": 0, "extract": "last_number"}
        self.assertTrue(passed(graders.grade_numeric("the change is -14", negative)))


class JsonTest(unittest.TestCase):
    BASE = {"type": "json", "expected": {"status": "ready", "count": 3}, "numeric_tolerance": 0}

    def test_key_order_is_free(self):
        self.assertTrue(passed(graders.grade_json('{"count": 3, "status": "ready"}', self.BASE)))

    def test_fenced_json_passes(self):
        # Probe 1: a JSON task accepts a reply wrapped in one code fence.
        self.assertTrue(passed(graders.grade_json('```json\n{"status": "ready", "count": 3}\n```', self.BASE)))
        self.assertTrue(passed(graders.grade_json('```\n{"status": "ready", "count": 3}\n```', self.BASE)))

    def test_prose_around_the_json_is_malformed(self):
        for answer in ('Here it is: {"status": "ready", "count": 3}',
                       '{"status": "ready", "count": 3} Done.',
                       '```json\n{"status": "ready", "count": 3}\n```\nLet me know.',
                       "{'status': 'ready', 'count': 3}", '{"status": "ready", "count": 3', "", "NaN"):
            result = graders.grade_json(answer, self.BASE)
            self.assertTrue(failed(result), answer)
            self.assertTrue(result.malformed, answer)

    def test_a_wrong_value_is_failed_but_not_malformed(self):
        result = graders.grade_json('{"status": "ready", "count": 4}', self.BASE)
        self.assertTrue(failed(result))
        self.assertFalse(result.malformed)

    def test_true_is_not_one(self):
        # Probe 2: true or false is never accepted for a number.
        one = {"type": "json", "expected": {"count": 1, "flag": True}, "numeric_tolerance": 0.5}
        self.assertTrue(passed(graders.grade_json('{"count": 1, "flag": true}', one)))
        self.assertTrue(failed(graders.grade_json('{"count": true, "flag": true}', one)))
        self.assertTrue(failed(graders.grade_json('{"count": 1, "flag": 1}', one)))
        zero = {"type": "json", "expected": {"count": 0}, "numeric_tolerance": 0}
        self.assertTrue(failed(graders.grade_json('{"count": false}', zero)))

    def test_number_versus_string_is_strict(self):
        self.assertTrue(failed(graders.grade_json('{"status": "ready", "count": "3"}', self.BASE)))
        text = {"type": "json", "expected": {"ref": "41"}}
        self.assertTrue(passed(graders.grade_json('{"ref": "41"}', text)))
        self.assertTrue(failed(graders.grade_json('{"ref": 41}', text)))

    def test_numeric_tolerance(self):
        # Probe 3: numbers compare within the task's tolerance, as decimals.
        params = {"type": "json", "expected": {"total": 28.8}, "numeric_tolerance": 0.005}
        for answer in ('{"total": 28.8}', '{"total": 28.80}', '{"total": 28.805}', '{"total": 28.795}', '{"total": 2.88e1}'):
            self.assertTrue(passed(graders.grade_json(answer, params)), answer)
        for answer in ('{"total": 28.81}', '{"total": 28.7949}', '{"total": 29}', '{"total": "28.8"}'):
            self.assertTrue(failed(graders.grade_json(answer, params)), answer)
        whole = {"type": "json", "expected": {"total": 1240.0}, "numeric_tolerance": 0.005}
        self.assertTrue(passed(graders.grade_json('{"total": 1240}', whole)))

    def test_no_tolerance_means_exact(self):
        self.assertTrue(passed(graders.grade_json('{"status": "ready", "count": 3.0}', self.BASE)))
        self.assertTrue(failed(graders.grade_json('{"status": "ready", "count": 3.001}', self.BASE)))

    def test_extra_and_missing_keys(self):
        self.assertTrue(failed(graders.grade_json('{"status": "ready", "count": 3, "note": "x"}', self.BASE)))
        self.assertTrue(failed(graders.grade_json('{"status": "ready"}', self.BASE)))
        loose = dict(self.BASE, allow_extra_keys=True)
        self.assertTrue(passed(graders.grade_json('{"status": "ready", "count": 3, "note": "x"}', loose)))
        self.assertTrue(failed(graders.grade_json('{"status": "ready", "note": "x"}', loose)))

    def test_string_compare(self):
        self.assertTrue(failed(graders.grade_json('{"status": " Ready ", "count": 3}', self.BASE)))
        folded = dict(self.BASE, string_compare="casefold_trim")
        self.assertTrue(passed(graders.grade_json('{"status": " Ready ", "count": 3}', folded)))
        self.assertTrue(failed(graders.grade_json('{"status": "re ady", "count": 3}', folded)))

    def test_null_matches_only_null(self):
        params = {"type": "json", "expected": {"code": None}, "string_compare": "casefold_trim"}
        self.assertTrue(passed(graders.grade_json('{"code": null}', params)))
        for answer in ('{"code": ""}', '{"code": "null"}', '{"code": 0}', '{"code": false}', "{}"):
            self.assertTrue(failed(graders.grade_json(answer, params)), answer)
        filled = {"type": "json", "expected": {"code": "A1"}}
        self.assertTrue(failed(graders.grade_json('{"code": null}', filled)))

    def test_arrays_compare_in_order(self):
        params = {"type": "json", "expected": {"days": ["Monday", "Tuesday"]}}
        self.assertTrue(passed(graders.grade_json('{"days": ["Monday", "Tuesday"]}', params)))
        self.assertTrue(failed(graders.grade_json('{"days": ["Tuesday", "Monday"]}', params)))
        self.assertTrue(failed(graders.grade_json('{"days": ["Monday"]}', params)))
        self.assertTrue(failed(graders.grade_json('{"days": "Monday, Tuesday"}', params)))

    def test_nested_objects_follow_the_same_rules(self):
        params = {"type": "json", "expected": {"actions": [{"owner": "Alex", "day": "Monday"}]},
                  "string_compare": "casefold_trim"}
        self.assertTrue(passed(graders.grade_json('{"actions": [{"day": "monday", "owner": "ALEX"}]}', params)))
        self.assertTrue(failed(graders.grade_json('{"actions": [{"day": "monday", "owner": "ALEX", "x": 1}]}', params)))

    def test_integer_keys(self):
        params = {"type": "json", "expected": {"nets": 10, "litres": 33.0}, "numeric_tolerance": 0.5,
                  "integer_keys": ["nets"]}
        self.assertTrue(passed(graders.grade_json('{"nets": 10, "litres": 33.4}', params)))
        self.assertTrue(passed(graders.grade_json('{"nets": 10.0, "litres": 33}', params)))
        for answer in ('{"nets": 10.2, "litres": 33}', '{"nets": 9.6, "litres": 33}', '{"nets": 11, "litres": 33}',
                       '{"nets": "10", "litres": 33}', '{"nets": true, "litres": 33}'):
            self.assertTrue(failed(graders.grade_json(answer, params)), answer)

    def test_a_top_level_value_other_than_an_object(self):
        params = {"type": "json", "expected": [1, 2]}
        self.assertTrue(passed(graders.grade_json("[1, 2]", params)))
        self.assertTrue(failed(graders.grade_json("[2, 1]", params)))


class ConstraintsTest(unittest.TestCase):
    def check(self, answer, **check):
        return graders.run_constraint_check(check, graders.trim(answer))

    def test_word_limits_are_inclusive(self):
        self.assertTrue(self.check("one two three", check="max_words", value=3))
        self.assertFalse(self.check("one two three four", check="max_words", value=3))
        self.assertTrue(self.check("one two three", check="min_words", value=3))
        self.assertFalse(self.check("one two", check="min_words", value=3))

    def test_max_chars_is_inclusive_and_counted_after_trimming(self):
        self.assertTrue(self.check("  abcde  ", check="max_chars", value=5))
        self.assertFalse(self.check("abcdef", check="max_chars", value=5))

    def test_must_include_every_value_ignoring_case(self):
        self.assertTrue(self.check("Mill Street and Mr OSEI", check="must_include", values=["mill street", "Osei"]))
        self.assertFalse(self.check("Mill Street", check="must_include", values=["mill street", "Osei"]))

    def test_must_not_include_any_value_ignoring_case(self):
        self.assertTrue(self.check("a calm note", check="must_not_include", values=["refund", "angry"]))
        self.assertFalse(self.check("a REFUND please", check="must_not_include", values=["refund", "angry"]))

    def test_regex_is_a_search(self):
        self.assertTrue(self.check("call 01632 960114 now", check="regex", pattern=r"\d{5} \d{6}"))
        self.assertFalse(self.check("call us now", check="regex", pattern=r"\d{5} \d{6}"))
        self.assertFalse(self.check("REPLACE it", check="regex", pattern="replace"))
        self.assertTrue(self.check("REPLACE it", check="regex", pattern="replace", flags="i"))

    def test_match_count(self):
        self.assertTrue(self.check("at 2:30pm", check="match_count", pattern=r"\d:\d\d", value=1))
        self.assertFalse(self.check("at 2:30pm or 2:40pm", check="match_count", pattern=r"\d:\d\d", value=1))
        self.assertTrue(self.check("no times", check="match_count", pattern=r"\d:\d\d", value=0))
        self.assertFalse(self.check("at 2:30pm", check="match_count", pattern=r"\d:\d\d", value=0))
        self.assertTrue(self.check("aaaa", check="match_count", pattern="aa", value=2))  # non-overlapping
        self.assertTrue(self.check("Mon mon", check="match_count", pattern="mon", flags="i", value=2))

    def test_line_count_ignores_empty_lines(self):
        self.assertTrue(self.check("one\n\n   \ntwo\r\nthree", check="line_count", value=3))
        self.assertFalse(self.check("one\ntwo", check="line_count", value=3))

    def test_starts_with_and_ends_with_are_case_sensitive(self):
        self.assertTrue(self.check("  Elm Row Dental: hello  ", check="starts_with", value="Elm Row Dental:"))
        self.assertFalse(self.check("elm row dental: hello", check="starts_with", value="Elm Row Dental:"))
        self.assertTrue(self.check("bye. Reply STOP to opt out.\n", check="ends_with", value="Reply STOP to opt out."))
        self.assertFalse(self.check("Reply stop to opt out.", check="ends_with", value="Reply STOP to opt out."))

    def test_a_note_is_ignored(self):
        self.assertTrue(self.check("one", check="max_words", value=1, note="for readers only"))

    def test_grade_constraints_needs_every_check(self):
        params = {"type": "constraints", "all": [
            {"check": "max_words", "value": 4},
            {"check": "must_include", "values": ["Tuesday"]},
            {"check": "ends_with", "value": "."},
        ]}
        self.assertTrue(passed(graders.grade_constraints("Meet on Tuesday.", params)))
        result = graders.grade_constraints("Meet on Wednesday", params)
        self.assertTrue(failed(result))
        self.assertEqual(result.detail, "failed check(s): 2, 3")

    def test_a_fence_counts_as_part_of_the_answer(self):
        params = {"type": "constraints", "all": [{"check": "starts_with", "value": "Dear"}]}
        self.assertTrue(failed(graders.grade_constraints("```\nDear all\n```", params)))


class DispatchTest(unittest.TestCase):
    def test_grade_picks_the_grader_from_the_task(self):
        task = {"grader": {"type": "exact", "value": "Unknown"}, "prompt": "p", "answerable": True}
        self.assertTrue(passed(graders.grade(task, "unknown")))
        with self.assertRaises(graders.GraderConfigError):
            graders.grade({"grader": {"type": "vibes"}}, "x")

    def test_is_malformed(self):
        json_task = {"grader": {"type": "json", "expected": {}}}
        self.assertTrue(graders.is_malformed(json_task, "not json"))
        self.assertFalse(graders.is_malformed(json_task, "{}"))
        code_task = {"grader": {"type": "python_tests", "entry": "f", "tests": []}}
        self.assertTrue(graders.is_malformed(code_task, "def f(:"))
        self.assertFalse(graders.is_malformed(code_task, "```python\ndef f():\n    return 1\n```"))
        self.assertTrue(graders.is_malformed(None, "   "))
        self.assertFalse(graders.is_malformed(None, "anything"))


if __name__ == "__main__":
    unittest.main()
