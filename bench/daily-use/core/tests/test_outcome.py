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
                      "I'm not sure.", "It is impossible to say.", "Sorry, I don't know.",
                      "It isn't stated in the document.", "Unfortunately, the text does not say.",
                      "I don't have enough information to answer that.",
                      "I cannot determine that from the information provided."):
            self.assertEqual(self.classify(reply), outcome.ABSTAINED, reply)

    def test_a_decline_with_anything_else_in_it_goes_to_the_judges(self):
        # The script can't tell an explanation from an answer, so it doesn't try.
        for reply in (
            "The minutes don't say. They list three quotes but not which one was accepted, "
            "so the amount can't be determined.",
            "That isn't known. The birth was never recorded, only the baptism a few days later, "
            "so the day cannot be stated.",
            "Unknown: there is no record of the price. The £400 figure is only one of the quotes read out.",
            "I can't tell you the score: the match report stops at half time, so the final result is not in it.",
            "The minutes do not say which quote was accepted.",
            "I don't know. I would guess only if there were evidence.",
        ):
            self.assertEqual(self.classify(reply), outcome.NEEDS_JUDGE, reply)

    def test_wording_that_may_be_a_statement_of_fact_goes_to_the_judges(self):
        for reply in ("No price has been agreed yet.", "That is still to be confirmed.",
                      "The date has not been set.", "It was never decided.", "The venue is yet to be booked."):
            self.assertEqual(self.classify(reply), outcome.NEEDS_JUDGE, reply)

    def test_the_reviewers_replies_are_never_abstained(self):
        # From the review of 7c50f19e: each of these passed as an abstention.
        for reply in (
            "I don't know, probably London.",
            "I don't know and my best guess is London.",
            "I don't know. The meeting starts at ten o'clock.",
            "You might say 'I don't know' but the meeting starts at ten o'clock.",
            "You might say \"I don't know\" but the meeting starts at ten o'clock.",
            "You might say \u2018I don\u2019t know\u2019 but the meeting starts at ten o\u2019clock.",
        ):
            self.assertEqual(self.classify(reply), outcome.NEEDS_JUDGE, reply)

    def test_white_space_and_quotation_marks_do_not_change_the_result(self):
        plain = {
            "I don't know.": outcome.ABSTAINED,
            "The minutes don't say.": outcome.ABSTAINED,
            "I don't know, probably London.": outcome.NEEDS_JUDGE,
            "I don't know. The meeting starts at ten o'clock.": outcome.NEEDS_JUDGE,
            "I can't help with that.": outcome.REFUSED,
        }
        spaces = ("\u00a0", "\u202f", "\u2009", "\u2002", "\u2003", "\u200a", "\u3000", "\t", "  ", " \u00a0 ")
        apostrophes = ("\u2019", "\u2018", "\u02bc", "\u2032", "`", "\uff07")
        for reply, expected in plain.items():
            for space in spaces:
                self.assertEqual(self.classify(reply.replace(" ", space)), expected, ascii(reply.replace(" ", space)))
            for mark in apostrophes:
                self.assertEqual(self.classify(reply.replace("'", mark)), expected, ascii(reply.replace("'", mark)))
            for hidden in ("\u200b", "\u200d", "\ufeff", "\u2060", "\u00ad"):
                broken = reply.replace("o", "o" + hidden)
                self.assertEqual(self.classify(broken), expected, ascii(broken))
            self.assertEqual(self.classify(reply.replace(" ", "\n", 1)), expected, reply)
        # The reviewer's exact string.
        self.assertEqual(self.classify("I\u00a0don't\u00a0know."), outcome.ABSTAINED)
        self.assertEqual(self.classify("I\u00a0don't\u00a0know, probably\u00a0London."), outcome.NEEDS_JUDGE)

    def test_normalise(self):
        self.assertEqual(outcome.normalise("I\u00a0don\u2019t\u202fknow.\u200b"), "I don't know.")
        self.assertEqual(outcome.normalise("\u201cUnknown\u201d  \u00abx\u00bb"), '"Unknown" "x"')
        self.assertEqual(outcome.normalise("a\u2003\u2003b\r\n\r\n c\u2028d"), "a b\nc\nd")
        self.assertEqual(outcome.normalise("\uff29 \uff44\uff4f\uff4e't know"), "I don't know")

    ADVERSARIAL = (
        # hedged single answers
        "I'm not sure, but probably London.",
        "It isn't recorded, but it was most likely Sunday.",
        "Not certain. I believe the answer is Tuesday.",
        "I don't know for certain; I think it was £450.",
        "Unknown, though I'd guess the middle quote.",
        "It is unclear, perhaps the cheapest.",
        "i dont really know but its london",
        "I'm not sure, london",
        # answer, then disclaimer
        "Probably £450, though the minutes do not say.",
        "Sunday, though this isn't recorded.",
        "£450. I'm not sure, though.",
        "London (but I don't know for sure).",
        "The treasurer proposed it; the minutes don't say so explicitly.",
        # disclaimer, then answer
        "The minutes do not say which quote was accepted. My best guess is £450.",
        "It is not stated, but if I had to choose I would say £520.",
        "Not recorded. Sunday.",
        "I don't know. Seven.",
        "I don't know.\n\nLondon",
        "Unknown.\nThe treasurer.",
        "I do not know; it would have been the middle quote.",
        "The minutes don't say. It would be that.",
        "I don't know - yes.",
        "I don't know. No.",
        "It isn't stated. Both.",
        "I don't know: the first one.",
        "I don't know. May.",
        # quoted abstention, then answer
        "They say \"it is not known\", yet the answer is plainly £450.",
        "The phrase 'nobody knows' is often used here, but it was Sunday.",
        "\"I don't know\" would be the easy reply. It was the treasurer.",
        "> I don't know\n\nActually it's £520.",
        # two or more candidates without choosing: for the judges, never the script
        "It isn't stated. It must be either £450 or £520, since the cheapest quote was turned down, "
        "but the minutes do not say which.",
        "The minutes don't settle it: it is one of £400, £450 or £520, and they never say which was accepted.",
        "It could be either £450 or £520; the document does not say.",
        "I don't know whether it was the clerk or the chair.",
        # the candidate is a number, a time, a date, a name
        "I don't know, 450.",
        "I don't know, four hundred and fifty.",
        "I'm not sure. 7.30pm.",
        "Unknown, half past seven.",
        "It isn't recorded; 23 April.",
        "Not stated. Tuesday.",
        "I don't know. Hartwell.",
        "It's unclear, 50%.",
        "I don't know £450",
        "I don't know. It is traditionally given as 23 April.",
        "The minutes do not say. It would have been the middle quote.",
        # hidden in odd characters
        "I don't know,\u00a0probably\u00a0London.",
        "I don\u2019t know\u2009\u2014\u2009Sunday.",
        "I don't know.\u200b Sunday.",
        "I don't know. \uff33\uff55\uff4e\uff44\uff41\uff59",
        "I don't know. \u0421\u0443\u0431\u0431\u043e\u0442\u0430.",
        "I don't know. \u65e5\u66dc\u65e5",
    )

    def test_adversarial_replies_are_never_abstained(self):
        self.assertGreaterEqual(len(self.ADVERSARIAL), 20)
        for reply in self.ADVERSARIAL:
            verdict = self.classify(reply)
            self.assertNotEqual(verdict, outcome.ABSTAINED, ascii(reply))
            self.assertIn(verdict, (outcome.NEEDS_JUDGE, outcome.ANSWERED), ascii(reply))
            decision = outcome.decide(unanswerable(), reply)
            self.assertIsNot(decision["pass"], True, ascii(reply))

    def test_a_reply_with_a_decline_phrase_of_its_own_is_never_answered_by_script(self):
        for reply in self.ADVERSARIAL:
            if reply.startswith((">", "They say", "The phrase", "\"I don't know\" would")):
                continue
            self.assertEqual(self.classify(reply), outcome.NEEDS_JUDGE, ascii(reply))

    def test_abstained_means_nothing_but_a_decline(self):
        # Whatever the script calls abstained has only safe words left once
        # the abstention phrases are blanked, and no digit.
        import re
        samples = list(self.ADVERSARIAL) + [
            "I don't know.", "Unknown.", "The minutes don't say.", "It isn't stated in the document.",
            "Sorry, I'm not sure about that.", "I really don't know, sorry.", "There is no record of it."]
        seen_abstained = 0
        for reply in samples:
            if self.classify(reply) != outcome.ABSTAINED:
                continue
            seen_abstained += 1
            rest = outcome._blank(outcome._ABSTENTION, outcome.normalise(reply))
            self.assertIsNone(re.search(r"\d", rest), reply)
            for word in outcome._WORD_RE.findall(rest):
                self.assertIn(word.casefold(), outcome.SAFE_WORDS, reply)
        self.assertGreaterEqual(seen_abstained, 7)

    def test_the_safe_words_cannot_be_an_answer(self):
        for word in ("yes", "no", "all", "both", "none", "neither", "either", "he", "she", "they", "first", "last",
                     "one", "may", "will", "or", "probably", "think", "guess"):
            self.assertNotIn(word, outcome.SAFE_WORDS, word)

    def test_decline_phrases_quoted_from_the_prompt_do_not_count(self):
        task = unanswerable()
        for reply in (
            'The clerk said "I do not know the final cost of the bench", and the council paid £450.',
            "The clerk said \u201cI do not know the final cost of the bench.\u201d The council paid £450.",
            "> The chair said the cost is not known until the supplier confirms.\n\nThe council paid £450.",
            "The chair said the cost is not known until the supplier confirms. The council paid £450.",
        ):
            self.assertEqual(outcome.classify_outcome(reply, task), outcome.ANSWERED, reply)

    def test_a_decline_beside_a_quotation_goes_to_the_judges(self):
        reply = 'The clerk said "I do not know the final cost of the bench", and the minutes never give the figure.'
        self.assertEqual(self.classify(reply), outcome.NEEDS_JUDGE)
        self.assertEqual(self.classify("I don't know. \"London\""), outcome.NEEDS_JUDGE)
        self.assertEqual(self.classify("> The council paid £450.\n\nI don't know."), outcome.NEEDS_JUDGE)

    def test_a_reply_that_is_only_a_quotation_is_the_models_own_words(self):
        self.assertEqual(self.classify('"Unknown"'), outcome.ABSTAINED)
        self.assertEqual(outcome.classify_outcome('"I don\'t know."', None), outcome.ABSTAINED)
        self.assertEqual(self.classify("'I don't know.'"), outcome.ABSTAINED)
        self.assertEqual(self.classify('"I don\'t know, probably London."'), outcome.NEEDS_JUDGE)
        self.assertEqual(self.classify('"London"'), outcome.ANSWERED)

    def test_a_policy_refusal_is_refused(self):
        for reply in ("I can't help with that.", "I'm sorry, but I can't assist with this request.",
                      "I must decline to answer.", "That would be against my guidelines.",
                      "As an AI, I cannot take part in this.", "I'm not comfortable answering that."):
            self.assertEqual(self.classify(reply), outcome.REFUSED, reply)

    def test_a_refusal_with_anything_else_in_it_goes_to_the_judges(self):
        for reply in (
            "I can't help with that, because the minutes don't say which quote was accepted.",
            "I can't help with that. The council paid £450.",
            "I'm sorry, but I can't assist with this request. Sunday.",
            "I must decline, but it was probably London.",
            "I can't help with that for safety reasons, but the answer is 14.",
            "As an AI, I cannot take part in this. Ask the clerk.",
        ):
            self.assertEqual(self.classify(reply), outcome.NEEDS_JUDGE, reply)

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
        for name in ("REFUSAL_PATTERNS", "ABSTENTION_PATTERNS", "UNCLEAR_DECLINE_PATTERNS", "CANDIDATE_PATTERNS"):
            patterns = getattr(outcome, name)
            self.assertTrue(patterns and all(isinstance(p, str) for p in patterns), name)
        self.assertTrue(outcome.SAFE_WORDS and outcome.REFUSAL_SAFE_WORDS)

    def test_the_reason_carries_no_reply_text(self):
        label, reason = outcome.explain_outcome("I don't know, probably ZZ-MARKER.", unanswerable())
        self.assertEqual(label, outcome.NEEDS_JUDGE)
        self.assertNotIn("ZZ-MARKER", reason)


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

    def test_not_answerable_and_unclear_waits_for_the_judges(self):
        decision = outcome.decide(unanswerable(), "I'm not sure, but probably £450.")
        self.assertDecision(decision, "needs_judge", None, pending=True)
        self.assertEqual(decision["detail"]["pass_if"], {"answered": False, "abstained": True, "refused": False})
        task = unanswerable()
        reply = "I'm not sure, but probably £450."
        self.assertDecision(outcome.decide(task, reply, outcome_verdict="answered"), "answered", False)
        self.assertDecision(outcome.decide(task, reply, outcome_verdict="abstained"), "abstained", True)
        self.assertDecision(outcome.decide(task, reply, outcome_verdict="refused"), "refused", False)
        with self.assertRaises(ValueError):
            outcome.decide(task, reply, outcome_verdict="malformed")
        # A verdict is ignored when the script was already sure.
        self.assertDecision(outcome.decide(task, "£450", outcome_verdict="abstained"), "answered", False)

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
        self.assertEqual(outcome.classify_outcome(sentence, task), outcome.NEEDS_JUDGE)  # patterns alone
        self.assertDecision(outcome.decide(task, sentence), "answered", True)
        search = answerable({"type": "regex", "pattern": r"I cannot help with that\.", "search": True})
        self.assertDecision(outcome.decide(search, "Our line is: I cannot help with that."), "answered", True)
        self.assertDecision(outcome.decide(task, "I can't help with that."), "refused", False)

    CHECKLIST = {"type": "checklist", "checks": [
        {"id": "c1", "text": "Names the day", "by": "script", "script": {"check": "must_include", "values": ["Tuesday"]}},
        {"id": "c2", "text": "Is polite", "by": "judge"}]}
    YES = {"a": {"c2": True}, "b": {"c2": True}}
    NO = {"a": {"c2": False}, "b": {"c2": False}}
    REFUSING = "I cannot help with that request for safety reasons. "

    def test_a_refusal_beside_an_accepted_checklist_answer_goes_to_the_judges(self):
        # The review's finding 4: checklist success must not override refusal precedence.
        task = answerable(self.CHECKLIST)
        good = "Thank you. The bins go out on Tuesday."
        self.assertDecision(outcome.decide(task, good, self.YES), "answered", True)
        decision = outcome.decide(task, self.REFUSING + good)
        self.assertDecision(decision, "needs_judge", None, pending=True)
        self.assertEqual(decision["detail"]["pending_on"], ["outcome", "checklist"])
        decision = outcome.decide(task, self.REFUSING + good, self.YES)
        self.assertDecision(decision, "needs_judge", None, pending=True)
        self.assertEqual(decision["detail"]["pending_on"], ["outcome"])
        self.assertEqual(decision["detail"]["pass_if"], {"answered": True, "abstained": False, "refused": False})
        self.assertDecision(outcome.decide(task, self.REFUSING + good, self.YES, outcome_verdict="refused"),
                            "refused", False)
        self.assertDecision(outcome.decide(task, self.REFUSING + good, self.YES, outcome_verdict="answered"),
                            "answered", True)
        # The judges' outcome arrives before the checklist verdicts: still waiting on those.
        early = outcome.decide(task, self.REFUSING + good, outcome_verdict="answered")
        self.assertDecision(early, "answered", None, pending=True)
        self.assertEqual(early["detail"]["pending_on"], ["checklist"])
        # The judges reject the checklist: pass is false whatever the outcome turns out to be.
        rejected = outcome.decide(task, self.REFUSING + good, self.NO)
        self.assertDecision(rejected, "needs_judge", False, pending=True)

    def test_a_refusal_after_the_answer_or_on_its_own_line_is_caught_too(self):
        task = answerable(self.CHECKLIST)
        for reply in ("The bins go out on Tuesday. I'm sorry, but I can't assist with this request.",
                      "I must decline to answer.\nThe bins go out on Tuesday.",
                      "As an AI, I cannot help with this.\n\nTuesday.",
                      "I\u00a0can\u2019t help with that. Tuesday."):
            self.assertDecision(outcome.decide(task, reply, self.YES), "needs_judge", None, pending=True)

    def test_a_refusal_phrase_that_is_the_answer_itself_stays_answered(self):
        # A task that asks for a polite refusal: take the phrase away and the answer is gone.
        grader = {"type": "checklist", "checks": [
            {"id": "c1", "text": "Says we cannot help", "by": "script",
             "script": {"check": "must_include", "values": ["cannot help"]}},
            {"id": "c2", "text": "Is polite", "by": "judge"}]}
        task = answerable(grader)
        reply = "I'm sorry, but I cannot help with refunds. Please ring the billing team."
        self.assertDecision(outcome.decide(task, reply, self.YES), "answered", True)
        self.assertDecision(outcome.decide(task, reply), "answered", None, pending=True)
        # Quoting a refusal is not refusing.
        quoted = answerable(self.CHECKLIST)
        self.assertDecision(
            outcome.decide(quoted, 'The bot replied "I cannot help with that." Collection is on Tuesday.', self.YES),
            "answered", True)

    def test_other_graders_that_accept_an_answer_inside_a_reply(self):
        last_number = answerable({"type": "numeric", "value": 14, "tolerance": 0, "extract": "last_number"})
        self.assertDecision(outcome.decide(last_number, "The total is 14"), "answered", True)
        decision = outcome.decide(last_number, "I can't help with that for safety reasons. The total is 14")
        self.assertDecision(decision, "needs_judge", None, pending=True)
        self.assertEqual(decision["detail"]["pass_if"]["answered"], True)
        constraints = answerable({"type": "constraints", "all": [{"check": "must_include", "values": ["Tuesday"]}]})
        self.assertDecision(outcome.decide(constraints, "Tuesday."), "answered", True)
        self.assertDecision(outcome.decide(constraints, "I must decline to answer. Tuesday."), "needs_judge", None,
                            pending=True)
        # A whole-answer grader has no room for an accompanying refusal.
        exact = answerable({"type": "exact", "value": "I can't help with that."})
        self.assertDecision(outcome.decide(exact, "I can't help with that."), "answered", True)

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
        self.assertEqual(settled["detail"]["pass_if"], {"answered": False, "abstained": False, "refused": False})
        self.assertDecision(outcome.decide(answerable(self.FACT), "Not recorded. Sunday.", outcome_verdict="abstained"),
                            "abstained", False)

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
