"""Tests for outcome classification and the outcome and pass decision.

Every prompt and reply here is made up for the tests.
"""
import unittest

import _support  # noqa: F401
from _support import graders, outcome

DOC_PROMPT = (
    "These are the minutes. How much did the council agree to pay for the bench?\n\n"
    "The clerk said: \"I do not know the final cost of the bench.\" Three quotes were read out, "
    "for £400, £450 and £520. The chair said the cost is not known until the supplier confirms. "
    "A quote was accepted."
)


def unanswerable(prompt=DOC_PROMPT):
    return {"id": "f3-pub-99", "answerable": False, "prompt": prompt, "grader": {"type": "abstain"}}


def answerable(grader, prompt="A made-up question."):
    return {"id": "f2-pub-99", "answerable": True, "prompt": prompt, "grader": grader}


class ClassifyTest(unittest.TestCase):
    def classify(self, reply, task=None):
        return outcome.classify_outcome(reply, task if task is not None else unanswerable())

    def test_a_plain_answer_is_answered(self):
        for reply in ("Sunday", "£450", "The council agreed to pay £450.", "About £1,000", "London."):
            self.assertEqual(self.classify(reply), outcome.ANSWERED, reply)

    def test_a_plain_decline_is_abstained(self):
        for reply in ("I don't know.", "Unknown.", "The minutes don't say.", "It isn't stated.",
                      "That cannot be determined from the document.", "There is no record of it.",
                      "I'm not sure.", "It is impossible to say.", "No price has been agreed yet.",
                      "That is still to be confirmed."):
            self.assertEqual(self.classify(reply), outcome.ABSTAINED, reply)

    def test_an_abstention_that_gives_its_reason_is_still_abstained(self):
        for reply in (
            "The minutes don't say. They list three quotes but not which one was accepted, "
            "so the amount can't be determined.",
            "That isn't known. The birth was never recorded, only the baptism a few days later, "
            "so the day cannot be stated.",
            "Unknown: there is no record of the price. The £400 figure is only one of the quotes read out.",
            "I can't tell you the score: the match report stops at half time, so the final result is not in it.",
        ):
            self.assertEqual(self.classify(reply), outcome.ABSTAINED, reply)

    def test_one_candidate_even_hedged_is_answered(self):
        for reply in (
            "I'm not sure, but probably London.",
            "It isn't recorded, but it was most likely Sunday.",
            "The minutes do not say which quote was accepted. My best guess is £450.",
            "I don't know for certain; I think it was £450.",
            "It is not stated, but if I had to choose I would say £520.",
            "Probably £450, though the minutes do not say.",
            "Not certain. I believe the answer is Tuesday.",
        ):
            self.assertEqual(self.classify(reply), outcome.ANSWERED, reply)

    def test_several_candidates_without_choosing_is_abstained(self):
        for reply in (
            "It isn't stated. It must be either £450 or £520, since the cheapest quote was turned down, "
            "but the minutes do not say which.",
            "The minutes don't settle it: it is one of £400, £450 or £520, and they never say which was accepted.",
            "It could be either £450 or £520; the document does not say.",
        ):
            self.assertEqual(self.classify(reply), outcome.ABSTAINED, reply)

    def test_decline_phrases_quoted_from_the_prompt_do_not_count(self):
        task = unanswerable()
        for reply in (
            'The clerk said "I do not know the final cost of the bench", and the council paid £450.',
            "The clerk said \u201cI do not know the final cost of the bench.\u201d The council paid £450.",
            "> The chair said the cost is not known until the supplier confirms.\n\nThe council paid £450.",
            "The chair said the cost is not known until the supplier confirms. The council paid £450.",
        ):
            self.assertEqual(outcome.classify_outcome(reply, task), outcome.ANSWERED, reply)

    def test_the_models_own_decline_still_counts_beside_a_quotation(self):
        reply = 'The clerk said "I do not know the final cost of the bench", and the minutes never give the figure.'
        self.assertEqual(self.classify(reply), outcome.ABSTAINED)

    def test_a_quoted_phrase_that_is_not_in_the_prompt_is_the_models_own(self):
        self.assertEqual(self.classify('"Unknown"'), outcome.ABSTAINED)
        self.assertEqual(outcome.classify_outcome('"I don\'t know."', None), outcome.ABSTAINED)

    def test_a_policy_refusal_is_refused(self):
        for reply in ("I can't help with that.", "I'm sorry, but I can't assist with this request.",
                      "I must decline to answer.", "That would be against my guidelines.",
                      "As an AI, I cannot take part in this.", "I'm not comfortable answering that."):
            self.assertEqual(self.classify(reply), outcome.REFUSED, reply)

    def test_refusal_and_abstention_together_go_to_the_judges(self):
        reply = "I can't help with that, because the minutes don't say which quote was accepted."
        self.assertEqual(self.classify(reply), outcome.NEEDS_JUDGE)

    def test_unclear_replies_go_to_the_judges(self):
        for reply in (
            "Not recorded. Sunday.",
            "Sunday, though this isn't recorded.",
            "It isn't recorded. It is traditionally given as 23 April.",
            "The minutes do not say. It would have been the middle quote.",
        ):
            self.assertEqual(self.classify(reply), outcome.NEEDS_JUDGE, reply)

    def test_a_long_reply_with_a_decline_phrase_goes_to_the_judges(self):
        reply = "The minutes do not say. " + "The council discussed many other matters at length. " * 20
        self.assertEqual(self.classify(reply), outcome.NEEDS_JUDGE)

    def test_malformed(self):
        self.assertEqual(self.classify("   \n"), outcome.MALFORMED)
        json_task = answerable({"type": "json", "expected": {"a": 1}})
        self.assertEqual(outcome.classify_outcome("I don't know.", json_task), outcome.MALFORMED)
        self.assertEqual(outcome.classify_outcome('{"a": 2}', json_task), outcome.ANSWERED)
        code_task = answerable({"type": "python_tests", "entry": "f", "tests": [{"args": [], "expect": 1}]})
        self.assertEqual(outcome.classify_outcome("I can't write this.", code_task), outcome.MALFORMED)

    def test_execution_error_is_never_returned_here(self):
        for reply in ("", "x", "I don't know.", "I can't help with that."):
            self.assertNotEqual(self.classify(reply), outcome.EXECUTION_ERROR)

    def test_the_patterns_are_published(self):
        for name in ("REFUSAL_PATTERNS", "ABSTENTION_PATTERNS", "STRONG_COMMITMENT_PATTERNS",
                     "WEAK_COMMITMENT_PATTERNS", "SEVERAL_CANDIDATES_PATTERNS"):
            patterns = getattr(outcome, name)
            self.assertTrue(patterns and all(isinstance(p, str) for p in patterns), name)


class DecideTest(unittest.TestCase):
    """The method's mapping table, row by row."""

    FACT = {"type": "numeric", "value": 14, "tolerance": 0, "extract": "only_number"}

    def assertDecision(self, decision, expected_outcome, expected_pass, pending=False):
        self.assertEqual(decision["outcome"], expected_outcome, decision)
        self.assertIs(decision["pass"], expected_pass, decision)
        self.assertIs(decision["pending"], pending, decision)
        self.assertEqual(sorted(decision), ["detail", "outcome", "pass", "pending"])

    def test_answerable_answered_and_accepted(self):
        self.assertDecision(outcome.decide(answerable(self.FACT), "14"), "answered", True)

    def test_answerable_answered_and_rejected(self):
        self.assertDecision(outcome.decide(answerable(self.FACT), "15"), "answered", False)

    def test_answerable_abstained_fails(self):
        self.assertDecision(outcome.decide(answerable(self.FACT), "I don't know."), "abstained", False)

    def test_not_answerable_abstained_passes(self):
        self.assertDecision(outcome.decide(unanswerable(), "The minutes don't say."), "abstained", True)

    def test_not_answerable_answered_fails(self):
        self.assertDecision(outcome.decide(unanswerable(), "£450"), "answered", False)
        self.assertDecision(outcome.decide(unanswerable(), "I'm not sure, but probably £450."), "answered", False)

    def test_refused_fails_on_any_task(self):
        self.assertDecision(outcome.decide(answerable(self.FACT), "I can't help with that."), "refused", False)
        self.assertDecision(outcome.decide(unanswerable(), "I can't help with that."), "refused", False)

    def test_malformed_fails_on_any_task(self):
        json_task = answerable({"type": "json", "expected": {"a": 1}})
        self.assertDecision(outcome.decide(json_task, "The value of a is 1."), "malformed", False)
        self.assertDecision(outcome.decide(json_task, ""), "malformed", False)
        self.assertDecision(outcome.decide(unanswerable(), "  "), "malformed", False)
        code_task = answerable({"type": "python_tests", "entry": "f", "tests": [{"args": [], "expect": 1}]})
        self.assertDecision(outcome.decide(code_task, "def f(:"), "malformed", False)

    def test_malformed_comes_before_abstained_and_refused(self):
        json_task = answerable({"type": "json", "expected": {"a": 1}})
        self.assertDecision(outcome.decide(json_task, "I don't know."), "malformed", False)
        self.assertDecision(outcome.decide(json_task, "I can't help with that."), "malformed", False)

    def test_fenced_json_passes(self):
        # Probe 1.
        json_task = answerable({"type": "json", "expected": {"a": 1}})
        self.assertDecision(outcome.decide(json_task, '```json\n{"a": 1}\n```'), "answered", True)

    def test_true_is_not_accepted_for_one(self):
        # Probe 2.
        json_task = answerable({"type": "json", "expected": {"a": 1}})
        self.assertDecision(outcome.decide(json_task, '{"a": true}'), "answered", False)

    def test_numeric_tolerance(self):
        # Probe 3.
        task = answerable({"type": "numeric", "value": 80.5, "tolerance": 0.005, "extract": "only_number"})
        self.assertDecision(outcome.decide(task, "80.504"), "answered", True)
        self.assertDecision(outcome.decide(task, "80.51"), "answered", False)

    def test_a_correct_answer_of_unknown_is_graded_by_its_grader(self):
        # Probe 4: the right answer is the word "Unknown". The outcome
        # patterns must not turn it into an abstention.
        task = answerable({"type": "exact", "value": "Unknown"})
        self.assertEqual(outcome.classify_outcome("Unknown", task), outcome.ABSTAINED)  # patterns alone
        self.assertDecision(outcome.decide(task, "Unknown"), "answered", True)
        self.assertDecision(outcome.decide(task, " unknown\n"), "answered", True)
        self.assertDecision(outcome.decide(task, "Recorded"), "answered", False)
        self.assertDecision(outcome.decide(task, "I don't know."), "abstained", False)

    def test_a_required_answer_containing_a_refusal_phrase_is_graded_by_its_grader(self):
        # Probe 5: the task asks for a sentence that reads like a refusal.
        sentence = "I cannot help with refunds, but our billing team can."
        task = answerable({"type": "exact", "value": sentence, "case_sensitive": True})
        self.assertEqual(outcome.classify_outcome(sentence, task), outcome.REFUSED)  # patterns alone
        self.assertDecision(outcome.decide(task, sentence), "answered", True)
        search = answerable({"type": "regex", "pattern": r"I cannot help with that\.", "search": True})
        self.assertDecision(outcome.decide(search, "Our line is: I cannot help with that."), "answered", True)
        self.assertDecision(outcome.decide(task, "I can't help with that."), "refused", False)

    def test_a_checklist_answer_that_declines_in_its_own_words_is_still_answered(self):
        grader = {"type": "checklist", "checks": [
            {"id": "c1", "text": "Says the date is unknown", "by": "script",
             "script": {"check": "must_include", "values": ["not known"]}},
            {"id": "c2", "text": "Is polite", "by": "judge"}]}
        decision = outcome.decide(answerable(grader), "Sorry, the delivery date is not known yet.")
        self.assertDecision(decision, "answered", None, pending=True)
        self.assertEqual(decision["detail"]["pending_on"], ["checklist"])
        self.assertEqual(decision["detail"]["needs_judge"], [{"check_id": "c2", "text": "Is polite"}])

    def test_checklist_with_judge_verdicts(self):
        grader = {"type": "checklist", "checks": [
            {"id": "c1", "text": "Short", "by": "script", "script": {"check": "max_words", "value": 5}},
            {"id": "c2", "text": "Is polite", "by": "judge"}]}
        task = answerable(grader)
        yes = {"a": {"c2": True}, "b": {"c2": True}}
        split = {"a": {"c2": True}, "b": {"c2": False}}
        half = {"a": {"c2": True}, "b": {}}
        self.assertDecision(outcome.decide(task, "Thank you kindly.", yes), "answered", True)
        self.assertDecision(outcome.decide(task, "Thank you kindly.", split), "answered", False)
        self.assertDecision(outcome.decide(task, "Thank you kindly.", half), "answered", None, pending=True)
        self.assertDecision(outcome.decide(task, "This reply is far too long to pass.", yes), "answered", False)

    def test_an_unclear_outcome_is_pending(self):
        decision = outcome.decide(unanswerable(), "Not recorded. Sunday.")
        self.assertDecision(decision, "needs_judge", None, pending=True)
        self.assertEqual(decision["detail"]["pending_on"], ["outcome"])
        settled = outcome.decide(answerable(self.FACT), "Not recorded. Sunday.")
        self.assertDecision(settled, "needs_judge", False, pending=True)

    def test_the_abstain_grader_follows_the_outcome(self):
        task = unanswerable()
        self.assertEqual(graders.grade(task, "The minutes don't say.").status, graders.PASSED)
        self.assertEqual(graders.grade(task, "£450").status, graders.FAILED)
        self.assertEqual(graders.grade(task, "Not recorded. Sunday.").status, graders.NEEDS_JUDGE)

    def test_detail_carries_no_prompt_or_reply_text(self):
        reply = "ZZ-REPLY-MARKER 15"
        task = answerable(self.FACT, prompt="ZZ-PROMPT-MARKER what is the number?")
        text = repr(outcome.decide(task, reply))
        self.assertNotIn("ZZ-REPLY-MARKER", text)
        self.assertNotIn("ZZ-PROMPT-MARKER", text)

    def test_a_task_object_works_as_well_as_a_dictionary(self):
        loaded = {t.id: t for t in _support.tasks.load_tasks(_support.PUBLIC_DIR)}
        self.assertDecision(outcome.decide(loaded["f2-pub-01"], "14"), "answered", True)
        self.assertDecision(outcome.decide(loaded["f2-pub-07"], "Sunday"), "answered", False)


if __name__ == "__main__":
    unittest.main()
