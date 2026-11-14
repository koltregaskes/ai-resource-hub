"""Outcome classification and the final decision for one reply.

The method records two separate fields for every attempt: ``outcome`` (what
the model did) and ``pass`` (whether that was right). This module works out
both from a reply, by script.

``classify_outcome(reply, task)`` returns ``answered``, ``abstained``,
``refused`` or ``malformed``, or ``needs_judge`` when the published patterns
below can't decide. ``execution_error`` is set by the runner, never here.

``decide(task, reply)`` combines the task's grader with the outcome, following
the method's mapping table.

Precedence for a mixed reply, from the method:

1. no gradable answer: ``execution_error`` (the runner's job);
2. can't be parsed in the required format: ``malformed``;
3. a policy refusal: ``refused``;
4. a substantive answer is present, even hedged: ``answered``;
5. only a decline: ``abstained``.

How the script applies it, in order:

a. An empty reply, JSON that doesn't parse on a ``json`` task, or Python with
   a syntax error on a ``python_tests`` task is ``malformed``.
b. Quotations of the prompt are removed first, so a decline phrase quoted from
   the question or the document doesn't count.
c. A refusal phrase and no abstention phrase: ``refused``. Both: ``needs_judge``.
d. No abstention phrase at all: ``answered``.
e. An abstention phrase, plus a clause that commits to one candidate
   ("probably London", "my best guess is"): ``answered``. The hedge doesn't
   make it an abstention.
f. An abstention phrase and nothing that offers a candidate: ``abstained``.
   Giving the reason for declining, or naming several candidates without
   choosing one, is still an abstention.
g. Anything else, such as a weaker sign of a candidate, a very short stray
   sentence beside the decline, or a long reply: ``needs_judge``.

The patterns are deliberately published here as plain constants. They are
matched without regard to case, after curly apostrophes are straightened.
"""
from __future__ import annotations

import re
from typing import Any, Mapping, Optional

from . import graders

ANSWERED = "answered"
ABSTAINED = "abstained"
REFUSED = "refused"
MALFORMED = "malformed"
EXECUTION_ERROR = "execution_error"  # set by the runner only
NEEDS_JUDGE = "needs_judge"

OUTCOMES = (ANSWERED, ABSTAINED, REFUSED, MALFORMED, EXECUTION_ERROR)

# A reply longer than this that contains an abstention phrase goes to the
# judges: a real abstention is short, and a long reply may hold an answer.
LONG_REPLY_WORDS = 120

# A sentence or clause of at most this many words, with no pattern in it,
# standing beside an abstention ("Not recorded. Sunday.") might be a bare
# answer: judge it.
BARE_FRAGMENT_MAX_WORDS = 3

# A sentence or quoted span copied from the prompt is ignored when it has at
# least this many words (sentences) or characters (quoted spans).
QUOTED_SENTENCE_MIN_WORDS = 5
QUOTED_SPAN_MIN_CHARS = 8

# ---------------------------------------------------------------- published patterns

# REFUSAL: the model declines for policy or safety reasons.
REFUSAL_PATTERNS = (
    # "I can't help with that", "I cannot assist", "I won't comply"
    r"\bI (?:can't|cannot|can not|won't|will not|am unable to|'m unable to|am not able to|'m not able to)"
    r" (?:help|assist|comply|engage|continue|fulfil|fulfill|do that|do this|take part)\b",
    # "I'm sorry, but I can't ..."
    r"\b(?:I'm|I am) sorry,? but I (?:can't|cannot|can not|won't|will not)\b",
    # "I must decline", "I have to refuse"
    r"\bI (?:must|have to|need to|am going to|'m going to|will have to) (?:decline|refuse)\b",
    # "that is against my guidelines", "violates our content policy"
    r"\b(?:against|violates?|in breach of|not (?:allowed|permitted) (?:by|under)) (?:my|our|the)"
    r" (?:content |usage |safety |use )?(?:guidelines?|polic(?:y|ies)|rules|terms)\b",
    # "I'm not comfortable ...", "I don't feel comfortable ..."
    r"\bI(?:'m| am) not comfortable\b",
    r"\bI (?:don't|do not) feel comfortable\b",
    # "As an AI, I can't ..."
    r"\bas an AI(?: language model| assistant| model)?,? I (?:can't|cannot|can not|won't|am not able|am unable|'m not able|'m unable)\b",
    # "I can't provide medical advice", "I cannot give legal advice"
    r"\bI (?:can't|cannot|can not|won't|will not) (?:provide|give|offer|share) (?:medical|legal|financial|professional) advice\b",
    # "not something I can help with", "unable to help with this request"
    r"\b(?:not something I can|unable to|not able to) (?:help|assist) with\b",
)

# ABSTENTION: the model declines because it doesn't know or the source doesn't say.
ABSTENTION_PATTERNS = (
    # "isn't known", "was never recorded", "is not stated", "not specified"
    r"\b(?:isn't|aren't|wasn't|weren't|is not|are not|was not|were not|not|never|hasn't been|has not been"
    r"|haven't been|have not been|has never been|have never been)\s+"
    r"(?:(?:actually|really|explicitly|specifically|clearly|ever|been|directly|officially|reliably|definitively)\s+)*"
    r"(?:known|recorded|stated|specified|given|mentioned|documented|determined|provided|listed|identified"
    r"|named|shown|disclosed|included|clear|certain|settled|said|established|determinable|knowable|answerable"
    r"|set|fixed|agreed|decided|arranged|confirmed|chosen|scheduled|announced|booked|finalised|finalized|published)\b",
    # "no winner has been named", "no price has yet been agreed"
    r"\bno (?:\w+ ){1,3}(?:has|have|had) (?:yet |ever |so far )?been (?:set|fixed|agreed|decided|arranged|confirmed"
    r"|given|recorded|chosen|made|named|scheduled|announced|settled|stated|specified|booked|published|determined"
    r"|finalised|finalized|kept|found)\b",
    # "yet to be decided", "still to be confirmed"
    r"\b(?:yet|still|remains?|remaining) to be (?:set|fixed|agreed|decided|arranged|confirmed|determined|announced"
    r"|scheduled|booked|finalised|finalized|settled|known|seen)\b",
    # "the minutes don't say", "does not state", "never mentions", "fails to specify"
    r"\b(?:don't|doesn't|didn't|do not|does not|did not|never|fails? to|won't|will not)\s+"
    r"(?:(?:actually|explicitly|specifically|clearly|ever|directly|really)\s+)*"
    r"(?:say|says|state|states|specify|specifies|mention|mentions|give|gives|tell|tells|record|records"
    r"|identify|identifies|indicate|indicates|reveal|reveals|show|shows|settle|settles|include|includes"
    r"|provide|provides|list|lists|name|names|disclose|discloses|make (?:it )?clear)\b",
    # "can't be determined", "cannot be stated", "impossible to say", "no way to know"
    r"\b(?:cannot|can't|can not|could not|couldn't|can never|unable to|impossible to|not possible to"
    r"|no way to|no way of|not able to)\s+(?:be\s+)?"
    r"(?:(?:reliably|really|actually|definitively|accurately|truly|simply)\s+)*"
    r"(?:determined?|say|said|tell|told|telling|know|known|knowing|stated?|answer(?:ed)?|establish(?:ed)?"
    r"|work(?:ed)? out|confirm(?:ed)?|identif(?:y|ied)|calculated?|deduced?|infer(?:red)?|given?|verif(?:y|ied)"
    r"|be sure|be certain)\b",
    # single words
    r"\b(?:unknown|unknowable|undetermined|indeterminate|unrecorded|unspecified|unclear|uncertain|unstated)\b",
    # "I don't know", "I'm not sure", "I have no information"
    r"\bI (?:really |honestly |simply )?(?:don't|do not) (?:know|have (?:enough |that |this |any |the )?(?:information|data|details?|record))\b",
    r"\bI(?:'m| am) (?:not (?:sure|certain|aware)|unsure|uncertain)\b",
    r"\bI have no (?:information|record|way|data|knowledge)\b",
    r"\b(?:nobody|no one|no-one) knows\b",
    # "there is no record", "no surviving evidence", "no way of knowing"
    r"\b(?:there is|there's|there are|there was|there were|we have|history has|has|have|gives?|contains?|offers?) no"
    r" (?:(?:surviving|known|reliable|written|official|documentary|clear|definitive|firm|such|direct)\s+)*"
    r"(?:record|records|evidence|way|information|mention|indication|data|answer|documentation|source|figure|detail|details)\b",
    r"\bno (?:(?:surviving|known|reliable|written|official)\s+)*record\b",
    # "not enough information", "insufficient detail"
    r"\b(?:not enough|insufficient|too little|lacks?|lacking|without (?:enough|sufficient)) (?:information|detail|details|data|evidence|context)\b",
    # "any figure would be a guess", "pure speculation"
    r"\b(?:would|could|can) (?:only |just |simply )?be (?:a |pure |mere |just |only |nothing but )*(?:guess|guessing|guesswork|speculation|speculating|conjecture)\b",
    r"\b(?:pure|mere|only|just) (?:guesswork|speculation|conjecture)\b",
)

# STRONG COMMITMENT: a clause that puts one candidate forward, however hedged.
# With an abstention phrase elsewhere in the reply, the outcome is "answered".
STRONG_COMMITMENT_PATTERNS = (
    r"\b(?:probably|presumably|most likely|very likely|quite likely|likely|possibly|perhaps|maybe|arguably)\b",
    r"\b(?:my|a|an|our|the) (?:best |educated |rough |reasonable )?(?:guess|estimate|bet)\b",
    r"\bif I (?:had|have) to\b",
    r"\bI(?:'d| would) (?:say|guess|go with|estimate|suggest|assume|bet|lean)\b",
    r"\bI (?:think|believe|suspect|guess|assume|reckon|estimate|imagine)\b",
    r"\bI(?:'ll| will) (?:go with|say|guess)\b",
    r"\banswer (?:is|would be|was)\b|\banswer:",
)

# WEAK SIGNS of a candidate. Not enough to call the reply "answered" by script,
# because the same words turn up in honest reasons for declining; with an
# abstention phrase elsewhere, the reply goes to the judges.
WEAK_COMMITMENT_PATTERNS = (
    # "traditionally said to be", "generally accepted as", "tradition holds"
    r"\b(?:tradition|traditionally|convention|conventionally|commonly|generally|usually|widely|often|popularly|typically)"
    r"\s+(?:\w+\s+){0,3}?(?:says?|holds?|has it|gives?|given|accepted|said|held|believed|thought|assumed|celebrated"
    r"|cited|taken|placed|puts?|observed|reckoned|regarded|considered|quoted|stated|dated|listed|reported)\b",
    # "it must be", "would have been", "might be"
    r"\b(?:must|has to|would|should|could|might|may) (?:have been|be)\b",
)

# SEVERAL CANDIDATES WITHOUT CHOOSING: cancels a commitment sign in the same
# clause ("it must be either X or Y").
SEVERAL_CANDIDATES_PATTERNS = (
    r"\beither\b[^.;]*\bor\b",
    r"\bone of\b",
    r"\bbetween\b[^.;]*\band\b",
    r"\b(?:two|three|four|several|multiple|both|a few|a number of) (?:possib\w+|candidates?|options?|figures?|answers?|dates?|values?)\b",
)

# Words that may stand alone as a sentence or clause without counting as a bare answer.
FILLER_WORDS = frozenset({
    "sorry", "apologies", "unfortunately", "sadly", "no", "note", "hi", "hello", "thanks",
    "thank", "you", "regrettably", "honestly", "well", "hmm", "ok", "okay", "answer", "short",
})

_FLAGS = re.IGNORECASE
_REFUSAL = tuple(re.compile(p, _FLAGS) for p in REFUSAL_PATTERNS)
_ABSTENTION = tuple(re.compile(p, _FLAGS) for p in ABSTENTION_PATTERNS)
_STRONG = tuple(re.compile(p, _FLAGS) for p in STRONG_COMMITMENT_PATTERNS)
_WEAK = tuple(re.compile(p, _FLAGS) for p in WEAK_COMMITMENT_PATTERNS)
_SEVERAL = tuple(re.compile(p, _FLAGS) for p in SEVERAL_CANDIDATES_PATTERNS)

_SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])[\"')\]]*\s+|\n+")
_CLAUSE_SPLIT_RE = re.compile(
    r"[;:]\s+|\s+[-\u2013\u2014]\s+|,?\s+(?:but|though|although|however|whereas)\s+", _FLAGS)
_QUOTED_SPAN_RES = (
    re.compile(r"\"([^\"\n]{1,600})\""),
    re.compile(r"\u201c([^\u201d]{1,600})\u201d"),
    re.compile(r"\u2018([^\u2019]{1,600})\u2019(?!\w)"),
    re.compile(r"\u00ab([^\u00bb]{1,600})\u00bb"),
    re.compile(r"(?<!\w)'([^'\n]{1,600})'(?!\w)"),
)
_WORD_RE = re.compile(r"[A-Za-z0-9£$\u20ac%]+")


def _any(patterns, text: str) -> bool:
    return any(p.search(text) for p in patterns)


def _straighten(text: str) -> str:
    return text.replace("\u2019", "'").replace("\u2018", "'").replace("\u02bc", "'")


def _normalise(text: str) -> str:
    """Lower-case, straighten quotes and squeeze whitespace, for prompt lookups."""
    text = _straighten(text).replace("\u201c", '"').replace("\u201d", '"')
    return re.sub(r"\s+", " ", text).strip().casefold()


def strip_prompt_quotations(reply: str, prompt: Optional[str]) -> str:
    """Remove the parts of a reply that quote the prompt.

    Three things are removed: Markdown block-quote lines; a quoted span whose
    text appears in the prompt; and a whole sentence that appears word for
    word in the prompt. Without a prompt only block-quote lines are removed,
    because a quoted span might then be the model's own answer.
    """
    lines = [line for line in reply.splitlines() if not line.lstrip().startswith(">")]
    text = "\n".join(lines)
    if not prompt:
        return text
    source = _normalise(prompt)

    def drop_if_quoted(match):
        inner = _normalise(match.group(1)).strip(" .,;:!?")
        if len(inner) >= QUOTED_SPAN_MIN_CHARS and inner in source:
            return " "
        return match.group(0)

    for pattern in _QUOTED_SPAN_RES:
        text = pattern.sub(drop_if_quoted, text)

    kept = []
    for sentence in _SENTENCE_SPLIT_RE.split(text):
        plain = _normalise(sentence).strip(" .,;:!?\"'")
        if len(plain.split()) >= QUOTED_SENTENCE_MIN_WORDS and plain in source:
            continue
        kept.append(sentence)
    return " ".join(kept)


def _field(task: Any, name: str) -> Any:
    if task is None:
        return None
    if isinstance(task, Mapping):
        return task.get(name)
    return getattr(task, name, None)


def classify_outcome(reply: str, task: Any = None) -> str:
    """Classify what the model did, by the published patterns.

    Returns ``answered``, ``abstained``, ``refused``, ``malformed`` or
    ``needs_judge``. ``task`` (a ``Task`` or a task dictionary) supplies the
    prompt, for removing quotations, and the grader type, for the format
    check; it may be left out. The answer key is never looked at.

    This is the pattern step only. For a task with an answer, call ``decide``:
    it runs the task's grader first, so a correct answer that happens to read
    like a decline ("Unknown") is never taken for one.
    """
    if graders.is_malformed(task, reply):
        return MALFORMED

    text = _straighten(strip_prompt_quotations(graders.trim(reply), _field(task, "prompt")))
    refusing = _any(_REFUSAL, text)
    abstaining = _any(_ABSTENTION, text)

    if refusing and abstaining:
        return NEEDS_JUDGE
    if refusing:
        return REFUSED
    if not abstaining:
        return ANSWERED

    strong = weak = bare = False
    for sentence in _SENTENCE_SPLIT_RE.split(text):
        sentence = sentence.strip()
        if not sentence:
            continue
        for clause in _CLAUSE_SPLIT_RE.split(sentence):
            if not clause or not clause.strip():
                continue
            if _any(_ABSTENTION, clause):
                continue
            several = _any(_SEVERAL, clause)
            marked = False
            if _any(_STRONG, clause):
                marked = True
                strong = strong or not several
            if _any(_WEAK, clause):
                marked = True
                weak = weak or not several
            if not marked and not several:
                words = [w.casefold() for w in _WORD_RE.findall(clause)]
                if 0 < len(words) <= BARE_FRAGMENT_MAX_WORDS and not all(w in FILLER_WORDS for w in words):
                    bare = True

    if strong:
        return ANSWERED
    if weak or bare or graders.word_count(text) > LONG_REPLY_WORDS:
        return NEEDS_JUDGE
    return ABSTAINED


def _decision(outcome: str, passed: Optional[bool], pending_on: list, detail: str, grade=None) -> dict:
    return {
        "outcome": outcome,
        "pass": passed,
        "pending": bool(pending_on),
        "detail": {
            "reason": detail,
            "pending_on": pending_on,
            "needs_judge": [{"check_id": m.check_id, "text": m.text} for m in grade.needs_judge] if grade else [],
            "grader_status": grade.status if grade else None,
            "grader_detail": grade.detail if grade else None,
        },
    }


def decide(task: Any, reply: str, judge_verdicts: Optional[Mapping] = None) -> dict:
    """Decide ``outcome`` and ``pass`` for one reply to one task.

    Returns ``{"outcome", "pass", "pending", "detail"}``:

    * ``outcome``: ``answered``, ``abstained``, ``refused`` or ``malformed``,
      or ``needs_judge`` when the patterns couldn't classify the reply.
    * ``pass``: true or false, or ``None`` while it depends on a judge.
    * ``pending``: true while any judge call is still needed, for the outcome
      or for a checklist. ``detail["pending_on"]`` says which.
    * ``detail``: the reason, the judged checks still needed, and the grader's
      own status. It never contains prompt or reply text.

    The method's mapping table:

    ============== ============================ =====
    Task           Outcome                      Pass
    ============== ============================ =====
    Answerable     answered, grader accepts     true
    Answerable     answered, grader rejects     false
    Answerable     abstained                    false
    Not answerable abstained                    true
    Not answerable answered                     false
    Any            refused or malformed         false
    ============== ============================ =====

    For an answerable task the grader runs FIRST. If it accepts the reply the
    outcome is ``answered`` and pass is true, whatever the reply's wording, so
    a correct answer such as "Unknown", or a required sentence that contains
    "I cannot help", is never mistaken for a decline. The outcome patterns are
    consulted only for a reply the grader didn't accept.

    ``judge_verdicts`` (optional) is passed to ``apply_judge_verdicts`` for a
    checklist task. A formula task with no engine raises
    ``FormulaEngineUnavailable``; it is never graded another way.
    """
    answerable = _field(task, "answerable")
    kind = (_field(task, "grader") or {}).get("type")
    if answerable is None or kind is None:
        raise ValueError("decide needs a task with 'answerable' and 'grader'")

    if graders.trim(reply) == "":
        return _decision(MALFORMED, False, [], "the reply is empty")

    if not answerable:
        outcome = classify_outcome(reply, task)
        if outcome == NEEDS_JUDGE:
            return _decision(NEEDS_JUDGE, None, ["outcome"], "the outcome patterns can't classify this reply")
        if outcome == ABSTAINED:
            return _decision(ABSTAINED, True, [], "abstained on a task with no knowable answer")
        return _decision(outcome, False, [], f"{outcome} on a task with no knowable answer")

    grade = graders.grade(task, reply)
    if kind == "checklist" and judge_verdicts is not None:
        grade = graders.apply_judge_verdicts(grade, judge_verdicts)

    if grade.status == graders.PASSED:
        return _decision(ANSWERED, True, [], "the grader accepts the answer", grade)
    if grade.status in (graders.NEEDS_JUDGE, graders.PENDING):
        # Every script check passed, so there is a substantive answer to judge.
        return _decision(ANSWERED, None, ["checklist"], "script checks passed; judged checks outstanding", grade)
    if grade.failed_by == "judge":
        return _decision(ANSWERED, False, [], "the judges rejected a checklist check", grade)
    if grade.malformed:
        return _decision(MALFORMED, False, [], "the reply can't be parsed in the required format", grade)

    outcome = classify_outcome(reply, task)
    if outcome == NEEDS_JUDGE:
        # Pass is already settled (the grader rejected the reply); only the
        # outcome label still needs the judges.
        return _decision(NEEDS_JUDGE, False, ["outcome"], "the grader rejects the reply; outcome unclear", grade)
    if outcome == ANSWERED:
        return _decision(ANSWERED, False, [], "the grader rejects the answer", grade)
    return _decision(outcome, False, [], f"{outcome} on a task that has an answer", grade)
