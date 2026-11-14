"""Outcome classification and the final decision for one reply.

The method records two separate fields for every attempt: ``outcome`` (what
the model did) and ``pass`` (whether that was right). This module works out
both from a reply, by script.

``classify_outcome(reply, task)`` returns ``answered``, ``abstained``,
``refused`` or ``malformed``, or ``needs_judge`` when the script can't be
sure. ``execution_error`` is set by the runner, never here.

``decide(task, reply)`` combines the task's grader with the outcome, following
the method's mapping table.

Precedence for a mixed reply, from the method:

1. no gradable answer: ``execution_error`` (the runner's job);
2. can't be parsed in the required format: ``malformed``;
3. a policy refusal: ``refused``;
4. a substantive answer is present, even hedged: ``answered``;
5. only a decline: ``abstained``.

THE SCRIPT DECIDES ONLY THE CLEAR CASES. Everything else goes to the judges.
A substantive answer must never be passed as an abstention, so the script
says ``abstained`` only when the reply holds a decline and nothing that could
possibly be an answer. In order:

a. An empty reply, JSON that doesn't parse on a ``json`` task, or Python with
   a syntax error on a ``python_tests`` task is ``malformed``.
b. The reply is normalised (``normalise``): Unicode NFKC, every kind of
   Unicode space turned into a plain space, typographic quotation marks and
   apostrophes turned into ASCII ones, zero-width characters removed.
c. Quotations are taken out before any phrase is looked for: Markdown
   block-quote lines, text inside quotation marks, and sentences copied word
   for word from the prompt.
d. No abstention, refusal or unclear-decline phrase outside quotations:
   ``answered``. (If such a phrase sits inside a quotation that is NOT from
   the prompt, the script can't tell whose words they are: ``needs_judge``.
   A reply that is nothing but one quotation is read as the model's own
   words.)
e. Wording that may be a decline or may be a statement of fact ("no price
   has been agreed", "the date is yet to be set": ``UNCLEAR_DECLINE_PATTERNS``)
   always goes to the judges.
f. An abstention phrase is present. ``abstained`` only if ALL of these hold;
   otherwise ``needs_judge``:

   * there is no refusal phrase;
   * the reply has no quotation of any kind;
   * with the abstention phrases themselves blanked out, nothing left is a
     candidate answer. A candidate answer is, conservatively: any digit,
     money sign or percent sign; any match of ``CANDIDATE_PATTERNS`` (a clause
     introduced by "probably", "I think", "my guess", "it is", "the answer
     is", "should be" and the like, or several candidates named without
     choosing); or ANY word that isn't in ``SAFE_WORDS``, a short list of
     function words and words about the source ("the", "document", "from").
     That last rule catches every name, day, month, number word and other
     content word, whether or not it is in the prompt.

   So "I don't know." and "The minutes don't say." are ``abstained`` by
   script, and "I don't know, probably London", "I don't know. The meeting
   starts at ten o'clock." and a decline that goes on to explain itself all
   go to the judges. Naming two or more candidates without choosing also goes
   to the judges, never to a script verdict.
g. A refusal phrase is present and no abstention phrase. ``refused`` only if
   nothing else is in the reply (the same test, with a few more safe words
   such as "help" and "request"); otherwise ``needs_judge``.

The script never returns ``answered`` for a reply that has an abstention or
refusal phrase of its own, and never returns ``abstained`` for one that has
anything else in it. The patterns and word lists are published below as plain
constants. They are English only.
"""
from __future__ import annotations

import re
import unicodedata
from typing import Any, Mapping, Optional

from . import graders

ANSWERED = "answered"
ABSTAINED = "abstained"
REFUSED = "refused"
MALFORMED = "malformed"
EXECUTION_ERROR = "execution_error"  # set by the runner only
NEEDS_JUDGE = "needs_judge"
# Not an outcome: a python_tests reply that wasn't run because there is no
# proven sandbox. The slot stays pending.
SANDBOX_UNAVAILABLE = "sandbox_unavailable"

OUTCOMES = (ANSWERED, ABSTAINED, REFUSED, MALFORMED, EXECUTION_ERROR)
JUDGED_OUTCOMES = (ANSWERED, ABSTAINED, REFUSED)

# A sentence copied from the prompt is ignored when it has at least this many words.
QUOTED_SENTENCE_MIN_WORDS = 5

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
    r"|named|shown|disclosed|included|clear|certain|said|established|determinable|knowable|answerable)\b",
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
    r"\bI (?:really |honestly |simply )?(?:don't|do not) (?:really |actually |honestly |quite |exactly )?(?:know|have (?:enough |that |this |any |the )?(?:information|data|details?|record))\b",
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

# UNCLEAR DECLINES: wording that may be a decline ("the date has not been
# set") or may be a statement of fact about the world, which is an answer.
# The script never decides these: a reply with one always goes to the judges.
UNCLEAR_DECLINE_PATTERNS = (
    # "has not been agreed", "was never confirmed", "isn't settled"
    r"\b(?:isn't|aren't|wasn't|weren't|is not|are not|was not|were not|not|never|hasn't been|has not been"
    r"|haven't been|have not been|has never been|have never been)\s+"
    r"(?:(?:actually|really|explicitly|specifically|clearly|ever|been|yet|officially|formally)\s+)*"
    r"(?:set|fixed|agreed|decided|arranged|confirmed|chosen|scheduled|announced|booked|finalised|finalized"
    r"|published|settled|made)\b",
    # "no winner has been named", "no price has yet been agreed"
    r"\bno (?:\w+ ){1,3}(?:has|have|had) (?:yet |ever |so far )?been (?:set|fixed|agreed|decided|arranged|confirmed"
    r"|given|recorded|chosen|made|named|scheduled|announced|settled|stated|specified|booked|published|determined"
    r"|finalised|finalized|kept|found)\b",
    # "yet to be decided", "still to be confirmed"
    r"\b(?:yet|still|remains?|remaining) to be (?:set|fixed|agreed|decided|arranged|confirmed|determined|announced"
    r"|scheduled|booked|finalised|finalized|settled|known|seen)\b",
)

# CANDIDATE ANSWER signs, looked for in what is left of the reply once the
# abstention phrases are blanked. Any match stops the script from saying
# "abstained"; the reply goes to the judges.
_NOT_FILLER = r"(?!(?:simply|just|really|actually|still|not|also|currently|yet|unfortunately|sadly)\b)"
CANDIDATE_PATTERNS = (
    # a number, a time, a date, a money amount, a percentage
    r"\d",
    r"[£$€¥%]",
    r"\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen"
    r"|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million"
    r"|billion|half|quarter|dozen|first|second|third|fourth|fifth|noon|midday|midnight|o'clock)\b",
    r"\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july"
    r"|august|september|october|november|december|today|tomorrow|yesterday)\b",
    # a clause that puts a candidate forward, however hedged
    r"\b(?:probably|presumably|likely|possibly|perhaps|maybe|arguably|apparently|supposedly|roughly|approximately|around)\b",
    r"\b(?:guess|guessing|estimate|bet|hunch|assume|assuming)\b",
    r"\bI(?:'d|'ll| would| will)? (?:think|believe|suspect|guess|assume|reckon|estimate|imagine|say|suggest|go with|lean)\b",
    r"\bif I (?:had|have) to\b",
    r"\banswer (?:is|was|would be|should be|must be|could be|might be)\b|\banswer:",
    r"\b(?:it|that|this|which)(?:'s| is| was| would be| should be| must be| could be| might be| may be| will be"
    r"| would have been| has to be)\s+" + _NOT_FILLER + r"\w",
    r"\b(?:should|would|must|might|could|may|has to) (?:have been|be)\s+" + _NOT_FILLER + r"\w",
    r"\b(?:traditionally|conventionally|commonly|generally|usually|widely|often|popularly|typically)\b",
    # several candidates named without choosing: for the judges, by the README's rule
    r"\beither\b|\bneither\b|\bone of\b|\bbetween\b[^.;]*\band\b",
    r"\b(?:two|three|four|several|multiple|both|a few|a number of) (?:possib\w+|candidates?|options?|figures?|answers?|dates?|values?)\b",
)

# SAFE WORDS: the only words that may stand beside an abstention phrase in a
# reply the script calls "abstained". Function words and words about the
# source, none of which is likely to be an answer on its own. Deliberately
# short: "yes", "no", "all", "both", "none", "he", "she", "they", "first",
# "last", "or", "may", "will", "can" and every content word are left out.
SAFE_WORDS = frozenset("""
a an the this that these those any such it its it's that's there's i i'm i've me my we our us you your
of in on at to for from by with about as into within than
and but so because since if though although however therefore thus while
is are was were be been being am do does did has have had could would should might
just simply really actually unfortunately sadly regrettably honestly frankly currently yet still ever
exactly precisely specifically explicitly clearly directly definitively reliably alone also too very quite
enough here there not
sorry apologies afraid please thanks thank
document documents text passage source sources minutes record records information info data detail details
question answer context material evidence time moment knowledge anything
provided given supplied based according contained included shown
sure certain certainty
""".split())

# Extra words that may stand beside a refusal phrase in a reply the script
# calls "refused".
REFUSAL_SAFE_WORDS = frozenset("""
help assist comply answer answering respond responding provide providing discuss discussing request requests
engage continue kind type sort content guidelines guideline policy policies safety reason reasons comfortable
""".split())

# ---------------------------------------------------------------- normalising

_QUOTE_TABLE = {}
for _ch in "‘’‚‛ʼ′´`＇ʹ‵":
    _QUOTE_TABLE[ord(_ch)] = "'"
for _ch in "“”„‟«»″＂‶〝〞":
    _QUOTE_TABLE[ord(_ch)] = '"'
# Zero-width and invisible formatting characters.
for _ch in ("​‌‍‎‏⁠⁡⁢⁣⁤﻿­᠎͏"
            "‪‫‬‭‮⁦⁧⁨⁩"):
    _QUOTE_TABLE[ord(_ch)] = None
del _ch

_FLAGS = re.IGNORECASE


def _compile(patterns) -> tuple:
    """Compile a pattern list. Every apostrophe is optional, so "dont" and
    "cant" are read like "don't" and "can't"."""
    return tuple(re.compile(p.replace("'", "'?"), _FLAGS) for p in patterns)


_REFUSAL = _compile(REFUSAL_PATTERNS)
_ABSTENTION = _compile(ABSTENTION_PATTERNS)
_UNCLEAR = _compile(UNCLEAR_DECLINE_PATTERNS)
_CANDIDATE = _compile(CANDIDATE_PATTERNS)

_SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])[\"')\]]*\s+|\n+")
_SENTENCE_KEEP_RE = re.compile(r"((?<=[.!?])[\"')\]]*\s+|\n+)")
_QUOTED_SPAN_RES = (
    re.compile(r"\"([^\"\n]{1,600})\""),
    # A single-quoted span may hold apostrophes inside words: 'I don't know'.
    re.compile(r"(?<![\w'])'((?:[^'\n]|'(?=\w)){1,600}?)'(?!\w)"),
)
_WORD_RE = re.compile(r"[^\W\d_]+(?:'[^\W\d_]+)*")


def normalise(text: str) -> str:
    """The form every pattern is matched against.

    Unicode NFKC; typographic quotation marks and apostrophes to ASCII ones;
    zero-width characters removed; every run of Unicode white space (the
    no-break space, the narrow no-break space and the thin spaces included)
    to one plain space. Lines are kept, separated by a newline.
    """
    text = unicodedata.normalize("NFKC", text.translate(_QUOTE_TABLE)).translate(_QUOTE_TABLE)
    lines = (re.sub(r"\s+", " ", line).strip() for line in text.splitlines())
    return "\n".join(line for line in lines if line)


def _any(patterns, text: str) -> bool:
    return any(p.search(text) for p in patterns)


def _blank(patterns, text: str) -> str:
    """``text`` with every match of every pattern replaced by spaces.

    All the matches are found on the text as it stands, then blanked together,
    so two phrases that overlap are both removed.
    """
    chars = list(text)
    for pattern in patterns:
        for match in pattern.finditer(text):
            for index in range(match.start(), match.end()):
                chars[index] = " "
    return "".join(chars)


def _lookup_form(text: str) -> str:
    return re.sub(r"\s+", " ", normalise(text)).strip().casefold()


def split_quotations(reply: str, prompt: Optional[str]):
    """Take the quotations out of a normalised reply.

    Returns ``(body, own_quotes, quoted)``. ``body`` is the reply with
    block-quote lines, quoted spans and sentences copied from the prompt
    removed. ``own_quotes`` lists the quoted spans that are NOT found in the
    prompt (they may be the model's own words). ``quoted`` is true when
    anything at all was removed.
    """
    kept_lines = [line for line in reply.split("\n") if not line.lstrip().startswith(">")]
    quoted = len(kept_lines) != len(reply.split("\n"))
    text = "\n".join(kept_lines)
    source = _lookup_form(prompt) if prompt else ""
    own_quotes = []

    def take(match):
        nonlocal quoted
        quoted = True
        inner = match.group(1).strip().casefold().strip(" .,;:!?")
        if not (source and inner and inner in source):
            own_quotes.append(match.group(1))
        return " "

    for pattern in _QUOTED_SPAN_RES:
        text = pattern.sub(take, text)

    kept = []
    for sentence in _SENTENCE_SPLIT_RE.split(text):
        plain = sentence.strip().casefold().strip(" .,;:!?\"'")
        if source and len(plain.split()) >= QUOTED_SENTENCE_MIN_WORDS and plain in source:
            quoted = True
            continue
        kept.append(sentence)
    return " ".join(kept), own_quotes, quoted


def _only_safe_words(text: str, extra: frozenset = frozenset()) -> bool:
    return all(word.casefold() in SAFE_WORDS or word.casefold() in extra for word in _WORD_RE.findall(text))


def _field(task: Any, name: str) -> Any:
    if task is None:
        return None
    if isinstance(task, Mapping):
        return task.get(name)
    return getattr(task, name, None)


def _classify_text(text: str, prompt: Optional[str], unwrap: bool = True):
    """Classify an already normalised reply. Returns ``(label, reason)``."""
    body, own_quotes, quoted = split_quotations(text, prompt)
    refusing = _any(_REFUSAL, body)
    abstaining = _any(_ABSTENTION, body)
    unclear = _any(_UNCLEAR, body)

    if not refusing and not abstaining and not unclear:
        own = " ".join(own_quotes)
        if own and (_any(_REFUSAL, own) or _any(_ABSTENTION, own) or _any(_UNCLEAR, own)):
            if unwrap and not _WORD_RE.search(body) and not re.search(r"\d", body):
                # The whole reply is quoted: read it as the model's own words.
                return _classify_text(own, None, unwrap=False)
            return NEEDS_JUDGE, "a decline phrase sits inside a quotation that is not from the prompt"
        return ANSWERED, "no decline phrase outside quotations"

    if unclear:
        return NEEDS_JUDGE, "wording that may be a decline or a statement of fact"
    if refusing and abstaining:
        return NEEDS_JUDGE, "both a refusal phrase and an abstention phrase"
    if quoted:
        return NEEDS_JUDGE, "a decline phrase beside a quotation"

    patterns, extra, label = (_REFUSAL, REFUSAL_SAFE_WORDS, REFUSED) if refusing else (_ABSTENTION, frozenset(), ABSTAINED)
    rest = re.sub(r"\s+", " ", _blank(patterns, body))
    if _any(_CANDIDATE, rest):
        return NEEDS_JUDGE, "a decline phrase beside a possible answer"
    if not _only_safe_words(rest, extra):
        return NEEDS_JUDGE, "a decline phrase beside other content"
    return label, "only a decline" if label == ABSTAINED else "only a refusal"


def explain_outcome(reply: str, task: Any = None):
    """``classify_outcome`` with its reason: ``(label, reason)``. No reply text is in the reason."""
    if graders.is_malformed(task, reply):
        return MALFORMED, "the reply can't be parsed in the required format"
    return _classify_text(normalise(graders.trim(reply)), _field(task, "prompt"))


def classify_outcome(reply: str, task: Any = None) -> str:
    """Classify what the model did, by the published patterns.

    Returns ``answered``, ``abstained``, ``refused``, ``malformed`` or
    ``needs_judge``. ``task`` (a ``Task`` or a task dictionary) supplies the
    prompt, for removing quotations, and the grader type, for the format
    check; it may be left out. The answer key is never looked at.

    The script decides only the clear cases (see the module docstring); a
    reply with a decline phrase and anything else in it is ``needs_judge``.

    This is the pattern step only. For a task with an answer, call ``decide``:
    it runs the task's grader first, so a correct answer that happens to read
    like a decline ("Unknown") is never taken for one.
    """
    return explain_outcome(reply, task)[0]


def has_refusal_phrase(reply: str, task: Any = None) -> bool:
    """True when a refusal phrase stands in the reply outside quotations."""
    body, _, _ = split_quotations(normalise(graders.trim(reply)), _field(task, "prompt"))
    return _any(_REFUSAL, body)


def without_refusal_sentences(reply: str) -> str:
    """The reply with every sentence that holds a refusal phrase taken out."""
    parts = _SENTENCE_KEEP_RE.split(reply)
    kept = []
    for index in range(0, len(parts), 2):
        sentence = parts[index]
        if _any(_REFUSAL, normalise(sentence).replace("\n", " ")):
            continue
        kept.append(sentence)
        if index + 1 < len(parts):
            kept.append(parts[index + 1])
    return "".join(kept)


# ---------------------------------------------------------------- the decision

def _free_text(grader: Mapping) -> bool:
    """Graders that accept an answer inside a longer reply.

    The others (``exact``, ``one_of``, a whole-answer ``regex``, ``numeric``
    with ``only_number``, ``json``, ``python_tests``, ``formula``) accept only
    a reply that is the answer and nothing else, so nothing can accompany it.
    """
    kind = grader.get("type")
    if kind in ("checklist", "constraints"):
        return True
    if kind == "regex":
        return bool(grader.get("search", False))
    if kind == "numeric":
        return grader.get("extract") != "only_number"
    return False


def _decision(outcome: str, passed: Optional[bool], pending_on: list, detail: str, grade=None,
              pass_if: Optional[Mapping] = None) -> dict:
    return {
        "outcome": outcome,
        "pass": passed,
        "pending": bool(pending_on),
        "detail": {
            "reason": detail,
            "pending_on": pending_on,
            "pass_if": dict(pass_if) if pass_if is not None else None,
            "needs_judge": [{"check_id": m.check_id, "text": m.text} for m in grade.needs_judge] if grade else [],
            "grader_status": grade.status if grade else None,
            "grader_detail": grade.detail if grade else None,
        },
    }


def decide(task: Any, reply: str, judge_verdicts: Optional[Mapping] = None,
           outcome_verdict: Optional[str] = None) -> dict:
    """Decide ``outcome`` and ``pass`` for one reply to one task.

    Returns ``{"outcome", "pass", "pending", "detail"}``:

    * ``outcome``: ``answered``, ``abstained``, ``refused`` or ``malformed``;
      ``needs_judge`` when the script couldn't classify the reply; or
      ``sandbox_unavailable`` when a ``python_tests`` reply wasn't run because
      there is no proven sandbox (nothing has been graded).
    * ``pass``: true or false, or ``None`` while it depends on a judge or on
      a sandbox.
    * ``pending``: true while anything is still needed. ``detail["pending_on"]``
      lists what: ``"outcome"`` (the judges' outcome label), ``"checklist"``
      (judged checks) or ``"sandbox"``.
    * ``detail``: the reason, the judged checks still needed, the grader's own
      status, and, when the outcome needs the judges, ``pass_if``: what
      ``pass`` becomes for each label they might give (``None`` there means
      it would still wait on the checklist). It never contains prompt or
      reply text.

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
    outcome is ``answered`` and pass is true, so a correct answer such as
    "Unknown", or a required sentence that contains "I cannot help", is never
    mistaken for a decline.

    One exception keeps the method's refusal precedence. A grader that
    accepts an answer inside a longer reply (a checklist, ``constraints``, a
    searching ``regex``, ``numeric`` with ``last_number``) could accept a
    reply that also refuses. So when such a reply holds a refusal phrase
    outside quotations, the refusal sentences are taken out and the rest is
    graded again. If the rest is still accepted, the refusal was not part of
    the answer: the outcome goes to the judges and pass waits for them. If
    the rest is no longer accepted, the phrase was the answer itself and the
    outcome stays ``answered``.

    ``judge_verdicts`` (optional) is passed to ``apply_judge_verdicts`` for a
    checklist task. ``outcome_verdict`` (optional) is the judges' agreed
    outcome label for a reply the script returned as ``needs_judge``; with it
    the decision is finished from ``pass_if``. A formula task with no engine
    raises ``FormulaEngineUnavailable``; it is never graded another way.
    """
    decision = _decide(task, reply, judge_verdicts)
    if decision["outcome"] == NEEDS_JUDGE and outcome_verdict is not None:
        if outcome_verdict not in JUDGED_OUTCOMES:
            raise ValueError("outcome_verdict must be answered, abstained or refused")
        passed = decision["detail"]["pass_if"][outcome_verdict]
        pending_on = [item for item in decision["detail"]["pending_on"] if item != "outcome"]
        if passed is not None:
            pending_on = []
        detail = dict(decision["detail"], pending_on=pending_on, pass_if=None,
                      reason="outcome given by the judges; " + decision["detail"]["reason"])
        return {"outcome": outcome_verdict, "pass": passed, "pending": bool(pending_on), "detail": detail}
    return decision


_ALL_FAIL = {ANSWERED: False, ABSTAINED: False, REFUSED: False}


def _decide(task: Any, reply: str, judge_verdicts: Optional[Mapping]) -> dict:
    answerable = _field(task, "answerable")
    grader = _field(task, "grader") or {}
    kind = grader.get("type")
    if answerable is None or kind is None:
        raise ValueError("decide needs a task with 'answerable' and 'grader'")

    if graders.trim(reply) == "":
        return _decision(MALFORMED, False, [], "the reply is empty")

    if not answerable:
        outcome, why = explain_outcome(reply, task)
        if outcome == NEEDS_JUDGE:
            return _decision(NEEDS_JUDGE, None, ["outcome"], "the script can't classify this reply: " + why,
                             pass_if={ANSWERED: False, ABSTAINED: True, REFUSED: False})
        if outcome == ABSTAINED:
            return _decision(ABSTAINED, True, [], "abstained on a task with no knowable answer")
        return _decision(outcome, False, [], f"{outcome} on a task with no knowable answer")

    grade = graders.grade(task, reply)
    if grade.status == graders.SANDBOX_UNAVAILABLE:
        return _decision(SANDBOX_UNAVAILABLE, None, ["sandbox"], "not graded: no proven sandbox", grade)
    if kind == "checklist" and judge_verdicts is not None:
        grade = graders.apply_judge_verdicts(grade, judge_verdicts)

    accepted = grade.status in (graders.PASSED, graders.NEEDS_JUDGE, graders.PENDING) or grade.failed_by == "judge"
    if accepted:
        # Every script check passed, so there is a substantive answer.
        if grade.status == graders.PASSED:
            passed, pending_on, why = True, [], "the grader accepts the answer"
        elif grade.failed_by == "judge":
            passed, pending_on, why = False, [], "the judges rejected a checklist check"
        else:
            passed, pending_on, why = None, ["checklist"], "script checks passed; judged checks outstanding"
        if _free_text(grader) and has_refusal_phrase(reply, task):
            rest = without_refusal_sentences(graders.trim(reply))
            still = graders.grade(task, rest) if rest.strip() else None
            if still is not None and still.status in (graders.PASSED, graders.NEEDS_JUDGE):
                return _decision(
                    NEEDS_JUDGE, False if passed is False else None, ["outcome"] + pending_on,
                    "a refusal phrase accompanies an accepted answer; the outcome needs the judges", grade,
                    pass_if={ANSWERED: passed, ABSTAINED: False, REFUSED: False})
        return _decision(ANSWERED, passed, pending_on, why, grade)
    if grade.malformed:
        return _decision(MALFORMED, False, [], "the reply can't be parsed in the required format", grade)

    outcome, why = explain_outcome(reply, task)
    if outcome == NEEDS_JUDGE:
        # Pass is already settled (the grader rejected the reply); only the
        # outcome label still needs the judges.
        return _decision(NEEDS_JUDGE, False, ["outcome"], "the grader rejects the reply; outcome unclear: " + why,
                         grade, pass_if=_ALL_FAIL)
    if outcome == ANSWERED:
        return _decision(ANSWERED, False, [], "the grader rejects the answer", grade)
    return _decision(outcome, False, [], f"{outcome} on a task that has an answer", grade)
