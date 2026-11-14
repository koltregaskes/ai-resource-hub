"""Shared fixtures for the run-path tests. Holds no tests of its own.

Every key value here is an obvious fake, and every transport is a fake:
no test in this folder touches the network or a real key file.
"""

import copy
import json
import os
import sys

CORE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if CORE not in sys.path:
    sys.path.insert(0, CORE)

import config  # noqa: E402
import providers  # noqa: E402

FAKE_OPENAI_KEY = "FAKE-OPENAI-VALUE-not-a-real-key-0001"
FAKE_ANTHROPIC_KEY = "FAKE-ANTHROPIC-VALUE-not-a-real-key-0002"
FAKE_UNRELATED = "FAKE-UNRELATED-VALUE-must-never-be-kept-0003"
FAKE_VALUES = (FAKE_OPENAI_KEY, FAKE_ANTHROPIC_KEY, FAKE_UNRELATED)
KEY_NAMES = {"openai": ["OPENAI_API_KEY"], "anthropic": ["CLAUDE_API", "CLAUDE_API_KEY"]}


def write_key_file(folder, lines=None):
    """A temporary key file with fake values and unrelated lines."""
    path = os.path.join(folder, "fake-keys.txt")
    if lines is None:
        lines = [
            "# a comment",
            "UNRELATED_TOKEN=" + FAKE_UNRELATED,
            "OPENAI_API_KEY=" + FAKE_OPENAI_KEY,
            "",
            'export CLAUDE_API="' + FAKE_ANTHROPIC_KEY + '"',
        ]
    with open(path, "w", encoding="utf-8") as stream:
        stream.write("\n".join(lines) + "\n")
    return path


def spec_dict(provider, model_id, price_in, price_out, cached="0", judge=False, **over):
    item = {
        "provider": provider, "model_id": model_id,
        "api_version": "2026-01-01", "reasoning_effort": "medium",
        "send_reasoning_effort": True, "temperature": 1, "send_temperature": True,
        "output_limit_parameter": config.OUTPUT_LIMIT_PARAMETER[provider],
        "data_retention": "30 days, no training",
        "price": {
            "input_per_mtok": price_in, "output_per_mtok": price_out,
            "cached_input_per_mtok": cached, "reasoning_billing": "in_output",
            "reasoning_per_mtok": None, "source_url": "https://example.test/pricing",
            "read_on": "2026-11-14", "promo_ends": None,
        },
    }
    if judge:
        item["max_output_tokens"] = 1000
    item.update(over)
    return item


def config_dict(**over):
    """A small config that is ready for a live run (nothing left to pin)."""
    raw = {
        "task_set_version": "test",
        "live_approved": True,
        "approved_by": "Test Owner",
        "key_names": copy.deepcopy(KEY_NAMES),
        "caps_usd": {"openai": "50", "anthropic": "50"},
        "planning": {"expected_output_tokens": 300, "judge_expected_output_tokens": 100},
        "canary": {"public_tasks_per_model": 2, "repeats": 1, "task_ids": []},
        "models": [spec_dict("openai", "m-oa", "3", "30"),
                   spec_dict("anthropic", "m-an", "3", "15")],
        "judges": [spec_dict("openai", "j-oa", "6", "12", judge=True),
                   spec_dict("anthropic", "j-an", "9", "18", judge=True)],
    }
    raw.update(over)
    return raw


def make_config(**over):
    return config.validate(config_dict(**over), mode="dry")


def task(task_id, family=1, split="public", prompt=None, limit=4096, checks=0,
         answerable=True):
    item = {"id": task_id, "family": family, "split": split, "answerable": answerable,
            "prompt": prompt or "Prompt for %s: please answer plainly." % task_id,
            "max_output_tokens": limit, "grader": {"type": "exact", "checks": []}}
    if checks:
        item["grader"] = {"type": "checklist", "checks": [
            {"id": "c%d" % n, "text": "Check %d holds" % n, "by": "judge"}
            for n in range(1, checks + 1)]}
    return item


def openai_body(text, input_tokens=10, output_tokens=5, status="completed", reason=None,
                cached=0, reasoning=0, usage=True):
    body = {"status": status, "output": [
        {"type": "reasoning", "summary": []},
        {"type": "message", "content": [{"type": "output_text", "text": text}]}]}
    if reason:
        body["incomplete_details"] = {"reason": reason}
    if usage:
        body["usage"] = {"input_tokens": input_tokens, "output_tokens": output_tokens,
                         "total_tokens": input_tokens + output_tokens,
                         "input_tokens_details": {"cached_tokens": cached},
                         "output_tokens_details": {"reasoning_tokens": reasoning}}
    return body


def anthropic_body(text, input_tokens=10, output_tokens=5, stop_reason="end_turn",
                   cache_read=0, cache_creation=0, usage=True):
    body = {"content": [{"type": "text", "text": text}], "stop_reason": stop_reason}
    if usage:
        body["usage"] = {"input_tokens": input_tokens, "output_tokens": output_tokens,
                         "cache_read_input_tokens": cache_read,
                         "cache_creation_input_tokens": cache_creation}
    return body


def ok(body, elapsed=0.5):
    return providers.Response(status=200, body=json.dumps(body), elapsed_seconds=elapsed)


def http(status, body=None, elapsed=0.2):
    return providers.Response(status=status, body=json.dumps(body or {}),
                              elapsed_seconds=elapsed)


class ScriptedTransport:
    """A fake transport that plays back a list of steps in order. A step is
    a Response, an exception to raise, or a function of the request. When
    the list runs out, `default` is used for every further request."""

    def __init__(self, steps=(), default=None):
        self.steps = list(steps)
        self.default = default
        self.requests = []
        self.in_flight = 0
        self.max_in_flight = 0

    def __call__(self, request):
        self.in_flight += 1
        self.max_in_flight = max(self.max_in_flight, self.in_flight)
        try:
            self.requests.append(request)
            step = self.steps.pop(0) if self.steps else self.default
            if step is None:
                raise AssertionError("the fake transport ran out of steps")
            if isinstance(step, BaseException):
                raise step
            if callable(step):
                return step(request)
            return step
        finally:
            self.in_flight -= 1


def prompt_of(request):
    if request.provider == "openai":
        return request.body["input"]
    return request.body["messages"][0]["content"]


def reply_body(request, text):
    """A 200 reply in the right shape for the request's provider."""
    if request.provider == "openai":
        return ok(openai_body(text))
    return ok(anthropic_body(text))


def read_everything(folder):
    """The text of every file under a folder, for scanning for leaks."""
    chunks = []
    for root, _, names in os.walk(folder):
        for name in names:
            chunks.append(name)
            with open(os.path.join(root, name), "rb") as stream:
                chunks.append(stream.read().decode("utf-8", "replace"))
    return "\n".join(chunks)
