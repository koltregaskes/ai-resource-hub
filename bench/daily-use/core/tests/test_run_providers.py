"""Provider adapters on fake transports. Nothing here touches the network."""

import json
import os
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import keys  # noqa: E402
import providers  # noqa: E402
import runner  # noqa: E402
import test_run_support as support  # noqa: E402
from test_run_support import ScriptedTransport, anthropic_body, http, ok, openai_body  # noqa: E402

SECRET = keys.Secret(support.FAKE_OPENAI_KEY)


def adapters():
    cfg = support.make_config()
    return providers.adapter_for(cfg.models[0]), providers.adapter_for(cfg.models[1])


class RequestShapeTests(unittest.TestCase):
    def test_openai_request(self):
        adapter, _ = adapters()
        request = adapter.build_request("Hello there", 4096, SECRET)
        self.assertEqual(request.url, "https://api.openai.com/v1/responses")
        self.assertEqual(request.body, {
            "model": "m-oa", "input": "Hello there", "max_output_tokens": 4096,
            "store": False, "prompt_cache_options": {"mode": "explicit"},
            "reasoning": {"effort": "medium"}})
        for absent in ("instructions", "tools", "tool_choice", "previous_response_id"):
            self.assertNotIn(absent, request.body)
        self.assertEqual((request.auth_header, request.auth_prefix), ("Authorization", "Bearer "))
        self.assertEqual(request.timeout_seconds, 120)

    def test_anthropic_request(self):
        _, adapter = adapters()
        request = adapter.build_request("Hello there", 8192, SECRET)
        self.assertEqual(request.url, "https://api.anthropic.com/v1/messages")
        self.assertEqual(request.body, {
            "model": "m-an", "max_tokens": 8192,
            "messages": [{"role": "user", "content": "Hello there"}],
            "output_config": {"effort": "medium"}})
        for absent in ("system", "tools", "tool_choice", "thinking", "temperature",
                       "top_p", "top_k"):
            self.assertNotIn(absent, request.body)
        self.assertEqual(request.headers, {"Content-Type": "application/json",
                                           "anthropic-version": "2026-10-21"})
        self.assertEqual((request.auth_header, request.auth_prefix), ("x-api-key", ""))

    def test_settings_are_left_out_when_the_config_says_not_to_send_them(self):
        raw = support.config_dict()
        raw["models"][0].update(send_reasoning_effort=False)
        raw["models"][1].update(send_reasoning_effort=False)
        cfg = support.config.validate(raw)
        body = providers.adapter_for(cfg.models[0]).build_request("p", 4096, SECRET).body
        self.assertNotIn("reasoning", body)
        self.assertNotIn("temperature", body)
        body = providers.adapter_for(cfg.models[1]).build_request("p", 4096, SECRET).body
        self.assertNotIn("output_config", body)

    def test_temperature_is_sent_only_where_the_api_takes_it(self):
        # OpenAI: only with reasoning effort "none". Anthropic: only on the
        # older API version. config.py refuses every other combination.
        raw = support.config_dict()
        raw["models"][0].update(reasoning_effort="none", send_temperature=True, temperature=0)
        raw["models"][1].update(api_version="2023-06-01", send_temperature=True)
        cfg = support.config.validate(raw)
        body = providers.adapter_for(cfg.models[0]).build_request("p", 4096, SECRET).body
        self.assertEqual((body["reasoning"], body["temperature"]), ({"effort": "none"}, 0))
        request = providers.adapter_for(cfg.models[1]).build_request("p", 4096, SECRET)
        self.assertEqual(request.body["temperature"], 1)
        self.assertEqual(request.headers["anthropic-version"], "2023-06-01")

    def test_the_key_is_not_in_the_request_record_or_repr(self):
        for adapter in adapters():
            request = adapter.build_request("p", 4096, SECRET)
            text = json.dumps(request.to_record()) + repr(request) + repr(request.headers)
            self.assertNotIn(support.FAKE_OPENAI_KEY, text)
            self.assertNotIn("Authorization", request.headers)
            self.assertNotIn("x-api-key", request.headers)

    def test_adapter_refuses_a_model_from_the_other_provider(self):
        cfg = support.make_config()
        with self.assertRaises(ValueError):
            providers.OpenAIResponses(cfg.models[1])


class ParsingTests(unittest.TestCase):
    def test_openai_success_with_reasoning_and_cached_tokens(self):
        adapter, _ = adapters()
        body = openai_body("The answer is 4.", input_tokens=120, output_tokens=80,
                           cached=20, reasoning=64)
        result = adapter.call(ScriptedTransport([ok(body, elapsed=1.5)]), "p", 4096, SECRET)
        self.assertEqual(result.status, providers.OK)
        self.assertEqual(result.text, "The answer is 4.")
        self.assertEqual(result.finish_reason, "completed")
        self.assertFalse(result.truncated)
        self.assertEqual(result.request_time_seconds, 1.5)
        self.assertIsNone(result.first_token_seconds)
        # Usage is kept under the provider's own field names.
        self.assertEqual(result.usage, body["usage"])
        self.assertEqual(result.usage["output_tokens_details"]["reasoning_tokens"], 64)
        self.assertEqual(result.usage["input_tokens_details"]["cached_tokens"], 20)
        self.assertEqual(result.billable, {"input_uncached": 100, "cached_input": 20,
                                           "output": 80, "reasoning": 64, "unpriced": []})

    def test_anthropic_success_with_cache_fields(self):
        _, adapter = adapters()
        body = anthropic_body("Paris.", input_tokens=50, output_tokens=7, cache_read=30)
        result = adapter.call(ScriptedTransport([ok(body)]), "p", 4096, SECRET)
        self.assertEqual((result.status, result.text, result.finish_reason),
                         (providers.OK, "Paris.", "end_turn"))
        self.assertEqual(result.usage, body["usage"])
        self.assertEqual(result.billable, {"input_uncached": 50, "cached_input": 30,
                                           "output": 7, "reasoning": None, "unpriced": []})
        body = anthropic_body("Paris.", cache_creation=12)
        result = adapter.call(ScriptedTransport([ok(body)]), "p", 4096, SECRET)
        self.assertEqual(result.billable["unpriced"], ["cache_creation_input_tokens"])

    def test_truncation_is_detected_and_the_text_is_kept(self):
        openai, anthropic = adapters()
        result = openai.call(ScriptedTransport([ok(openai_body(
            "Cut off mid", status="incomplete", reason="max_output_tokens"))]), "p", 4096, SECRET)
        self.assertEqual(result.status, providers.OK)
        self.assertTrue(result.truncated)
        self.assertEqual(result.text, "Cut off mid")
        self.assertEqual(result.finish_reason, "incomplete:max_output_tokens")
        self.assertIn("truncated", result.flags)
        result = anthropic.call(ScriptedTransport([ok(anthropic_body(
            "Cut off mid", stop_reason="max_tokens"))]), "p", 4096, SECRET)
        self.assertTrue(result.truncated)
        self.assertEqual(result.text, "Cut off mid")
        # Another incomplete reason is not truncation.
        result = openai.call(ScriptedTransport([ok(openai_body(
            "", status="incomplete", reason="content_filter"))]), "p", 4096, SECRET)
        self.assertFalse(result.truncated)

    def test_refusal_part_is_kept_as_text(self):
        adapter, _ = adapters()
        body = {"status": "completed", "output": [{"type": "message", "content": [
            {"type": "refusal", "refusal": "I can't help with that."}]}],
            "usage": {"input_tokens": 5, "output_tokens": 6}}
        result = adapter.call(ScriptedTransport([ok(body)]), "p", 4096, SECRET)
        self.assertEqual(result.text, "I can't help with that.")

    def test_missing_usage_is_flagged(self):
        for adapter, body in zip(adapters(), (openai_body("x", usage=False),
                                              anthropic_body("x", usage=False))):
            result = adapter.call(ScriptedTransport([ok(body)]), "p", 4096, SECRET)
            self.assertEqual(result.status, providers.OK)
            self.assertIsNone(result.billable)
            self.assertIn("missing_usage", result.flags)

    def test_unreadable_200_is_a_provider_error(self):
        adapter, _ = adapters()
        for body in ("<html>", json.dumps({"unexpected": True}), json.dumps([1, 2])):
            response = providers.Response(status=200, body=body, elapsed_seconds=0.1)
            result = adapter.call(ScriptedTransport([response]), "p", 4096, SECRET)
            self.assertEqual(result.status, providers.PROVIDER_ERROR)
            self.assertFalse(result.retryable)


class FailureClassTests(unittest.TestCase):
    def run_with(self, steps, adapter=None):
        adapter = adapter or adapters()[0]
        transport = ScriptedTransport(steps)
        waits = []
        results = providers.call_with_retries(adapter, transport, "p", 4096, SECRET,
                                              sleep=waits.append)
        return results, transport, waits

    def test_429_then_success(self):
        results, transport, waits = self.run_with([http(429), ok(openai_body("fine"))])
        self.assertEqual([r.status for r in results], [providers.TRANSPORT_ERROR, providers.OK])
        self.assertTrue(results[0].retryable)
        self.assertEqual(results[0].error, "HTTP 429")
        self.assertEqual(len(transport.requests), 2)
        self.assertEqual(waits, [2])

    def test_5xx_three_times_is_exhausted(self):
        results, transport, waits = self.run_with([http(500), http(503), http(529)])
        self.assertEqual([r.status for r in results], [providers.TRANSPORT_ERROR] * 3)
        self.assertEqual([r.http_status for r in results], [500, 503, 529])
        self.assertEqual(len(transport.requests), 3)
        self.assertEqual(waits, [2, 8])

    def test_connection_failure_is_retried(self):
        results, transport, _ = self.run_with(
            [providers.TransportFailure("connection reset"), ok(openai_body("fine"))])
        self.assertEqual([r.status for r in results], [providers.TRANSPORT_ERROR, providers.OK])
        self.assertEqual(results[0].error, "connection failure: connection reset")
        self.assertIsNone(results[0].http_status)

    def test_400_is_not_retried(self):
        for status in (400, 401, 403, 404, 422):
            results, transport, waits = self.run_with([http(status), ok(openai_body("never"))])
            self.assertEqual([r.status for r in results], [providers.PROVIDER_ERROR])
            self.assertFalse(results[0].retryable)
            self.assertEqual(len(transport.requests), 1)
            self.assertEqual(waits, [])

    def test_timeout_is_not_retried(self):
        results, transport, waits = self.run_with(
            [providers.TransportTimeout(), ok(openai_body("never"))])
        self.assertEqual([r.status for r in results], [providers.TIMEOUT])
        self.assertFalse(results[0].retryable)
        self.assertEqual(len(transport.requests), 1)
        self.assertEqual(waits, [])

    def test_a_reply_after_the_deadline_counts_as_a_timeout(self):
        results, transport, _ = self.run_with([ok(openai_body("late"), elapsed=120.5),
                                               ok(openai_body("never"))])
        self.assertEqual([r.status for r in results], [providers.TIMEOUT])
        self.assertEqual(results[0].text, "")
        self.assertEqual(len(transport.requests), 1)
        results, _, _ = self.run_with([ok(openai_body("in time"), elapsed=119.9)])
        self.assertEqual(results[0].status, providers.OK)

    def test_each_request_is_a_fresh_conversation(self):
        _, anthropic = adapters()
        results, transport, _ = self.run_with([http(500), ok(anthropic_body("fine"))], anthropic)
        self.assertEqual(results[-1].text, "fine")
        for request in transport.requests:
            self.assertEqual(request.body["messages"], [{"role": "user", "content": "p"}])

    def test_before_send_can_stop_a_request(self):
        adapter, _ = adapters()
        transport = ScriptedTransport([http(500)])

        def before_send(number):
            if number == 2:
                raise RuntimeError("no money")

        with self.assertRaises(RuntimeError):
            providers.call_with_retries(adapter, transport, "p", 4096, SECRET,
                                        before_send=before_send)
        self.assertEqual(len(transport.requests), 1)

    def test_provider_error_message_is_dropped_because_it_can_echo_a_key(self):
        body = {"error": {"type": "invalid_request_error", "code": "invalid_api_key",
                          "message": "Incorrect API key provided: " + support.FAKE_OPENAI_KEY}}
        results, _, _ = self.run_with([http(401, body)])
        self.assertEqual(results[0].error, "HTTP 401 invalid_request_error")
        self.assertNotIn(support.FAKE_OPENAI_KEY,
                         repr(results[0]) + json.dumps(results[0].to_record()))
        odd = {"error": {"type": support.FAKE_OPENAI_KEY + " with spaces"}}
        results, _, _ = self.run_with([http(400, odd)])
        self.assertEqual(results[0].error, "HTTP 400")


class RealTransportGateTests(unittest.TestCase):
    def test_real_transport_cannot_be_built_while_live_is_disabled(self):
        with mock.patch.object(runner, "LIVE_ENABLED", False):
            with self.assertRaises(runner.LiveRefused):
                providers.UrllibTransport(object())
            with self.assertRaises(runner.LiveRefused):
                providers.UrllibTransport(runner.LiveGatePass(None))

    def test_real_transport_needs_a_pass_issued_by_the_gate_when_live_is_enabled(self):
        # With the switch on, a pass that the gate did not issue is still refused.
        with mock.patch.object(runner, "LIVE_ENABLED", True):
            with self.assertRaises(runner.LiveRefused):
                providers.UrllibTransport(object())
            with self.assertRaises(runner.LiveRefused):
                providers.UrllibTransport(runner.LiveGatePass(None))

    def test_real_transport_needs_a_pass_issued_by_the_gate(self):
        with mock.patch.object(runner, "LIVE_ENABLED", True):
            with self.assertRaises(runner.LiveRefused):
                providers.UrllibTransport(runner.LiveGatePass(None))
            with self.assertRaises(runner.LiveRefused):
                providers.UrllibTransport(object())

    def test_real_transport_is_limited_to_the_two_provider_hosts(self):
        self.assertEqual(providers.LIVE_HOSTS, {"openai": "api.openai.com",
                                                "anthropic": "api.anthropic.com"})
        for adapter in adapters():
            self.assertTrue(adapter.url.startswith(
                "https://%s/" % providers.LIVE_HOSTS[adapter.provider]))


# Replies in the shape of the examples in the providers' API references, read
# on 14 November 2026. The field names and nesting are theirs; the ids, text
# and numbers are made up.
OPENAI_REFERENCE_REPLY = {
    "id": "resp_test0001", "object": "response", "access_programs": None,
    "created_at": 1700000000, "status": "completed", "completed_at": 1700000001,
    "error": None, "incomplete_details": None, "instructions": None,
    "max_output_tokens": 4096, "model": "m-oa",
    "output": [
        {"type": "reasoning", "id": "rs_test0001", "summary": [],
         "encrypted_content": "opaque"},
        {"type": "message", "id": "msg_test0001", "status": "completed",
         "role": "assistant", "content": [
             {"type": "output_text", "text": "Four.", "annotations": [], "logprobs": []}]},
    ],
    "parallel_tool_calls": True, "previous_response_id": None,
    "reasoning": {"effort": "medium", "summary": None, "context": None},
    "store": False, "temperature": 1, "text": {"format": {"type": "text"}},
    "tool_choice": "auto", "tools": [], "top_p": 1, "truncation": "disabled",
    "usage": {
        "input_tokens": 81,
        "input_tokens_details": {"cached_tokens": 0, "cache_write_tokens": 0},
        "output_tokens": 1035,
        "output_tokens_details": {"reasoning_tokens": 832},
        "total_tokens": 1116,
    },
    "user": None, "metadata": {},
}

ANTHROPIC_REFERENCE_REPLY = {
    "id": "msg_test0002", "container": None,
    "content": [
        {"type": "thinking", "thinking": "", "signature": "opaque"},
        {"type": "text", "text": "Four.", "citations": None},
    ],
    "diagnostics": None, "model": "m-an", "role": "assistant",
    "stop_details": None, "stop_reason": "end_turn", "stop_sequence": None,
    "type": "message",
    "usage": {
        "cache_creation": {"ephemeral_1h_input_tokens": 0, "ephemeral_5m_input_tokens": 0},
        "cache_creation_input_tokens": 0, "cache_read_input_tokens": 0,
        "inference_geo": "global", "input_tokens": 95, "output_tokens": 503,
        "output_tokens_details": {"thinking_tokens": 410},
        "server_tool_use": None, "service_tier": "standard", "speed": "standard",
    },
}

ANTHROPIC_REFERENCE_REFUSAL = {
    "id": "msg_test0003", "type": "message", "role": "assistant", "model": "m-an",
    "content": [], "stop_reason": "refusal",
    "stop_details": {"type": "refusal", "category": "cyber",
                     "explanation": "Declined for a made-up reason."},
    "usage": {"input_tokens": 412, "output_tokens": 0},
}


class ReferenceShapeTests(unittest.TestCase):
    def call(self, adapter, body):
        return adapter.call(ScriptedTransport([ok(body)]), "p", 4096, SECRET)

    def test_openai_reply_in_the_reference_shape(self):
        adapter, _ = adapters()
        result = self.call(adapter, OPENAI_REFERENCE_REPLY)
        self.assertEqual((result.status, result.text, result.finish_reason, result.truncated),
                         (providers.OK, "Four.", "completed", False))
        self.assertEqual(result.flags, [])
        # Reasoning tokens are a part of output tokens and are billed once.
        self.assertEqual(result.billable, {"input_uncached": 81, "cached_input": 0,
                                           "output": 1035, "reasoning": 832, "unpriced": []})

    def test_anthropic_reply_in_the_reference_shape(self):
        _, adapter = adapters()
        result = self.call(adapter, ANTHROPIC_REFERENCE_REPLY)
        # The thinking block is skipped; only text blocks are the answer.
        self.assertEqual((result.status, result.text, result.finish_reason, result.truncated),
                         (providers.OK, "Four.", "end_turn", False))
        self.assertEqual(result.flags, [])
        self.assertEqual(result.billable, {"input_uncached": 95, "cached_input": 0,
                                           "output": 503, "reasoning": 410, "unpriced": []})

    def test_anthropic_refusal_is_a_200_with_no_content(self):
        _, adapter = adapters()
        result = self.call(adapter, ANTHROPIC_REFERENCE_REFUSAL)
        self.assertEqual((result.status, result.text, result.finish_reason, result.truncated),
                         (providers.OK, "", "refusal", False))
        self.assertEqual(result.flags, ["refusal"])
        self.assertEqual(result.billable["input_uncached"], 412)

    def test_openai_refusals_are_flagged(self):
        adapter, _ = adapters()
        body = dict(OPENAI_REFERENCE_REPLY, output=[{"type": "message", "content": [
            {"type": "refusal", "refusal": "I can't help with that."}]}])
        result = self.call(adapter, body)
        self.assertEqual((result.text, result.flags), ("I can't help with that.", ["refusal"]))
        result = self.call(adapter, openai_body("", status="incomplete",
                                                reason="content_filter"))
        self.assertEqual((result.finish_reason, result.truncated, result.flags),
                         ("incomplete:content_filter", False, ["refusal"]))

    def test_anthropic_full_context_window_counts_as_truncated(self):
        _, adapter = adapters()
        result = self.call(adapter, anthropic_body(
            "Cut off mid", stop_reason="model_context_window_exceeded"))
        self.assertTrue(result.truncated)
        self.assertEqual(result.flags, ["truncated"])

    def test_openai_200_that_did_not_finish_is_a_provider_error(self):
        adapter, _ = adapters()
        body = dict(OPENAI_REFERENCE_REPLY, status="failed", output=[],
                    error={"code": "server_error", "message": "made up"})
        result = self.call(adapter, body)
        self.assertEqual((result.status, result.retryable, result.error),
                         (providers.PROVIDER_ERROR, False, "HTTP 200 status failed server_error"))
        # No charge can be worked out, so the ledger keeps the reservation.
        self.assertIsNone(result.billable)
        for status in ("cancelled", "queued", "in_progress"):
            result = self.call(adapter, dict(OPENAI_REFERENCE_REPLY, status=status))
            self.assertEqual(result.error, "HTTP 200 status " + status)

    def test_openai_cache_writes_are_not_priced(self):
        adapter, _ = adapters()
        result = self.call(adapter, openai_body("x", input_tokens=3000, cached=1000,
                                                cache_write=1500))
        self.assertEqual(result.billable, {"input_uncached": 500, "cached_input": 1000,
                                           "output": 5, "reasoning": 0,
                                           "unpriced": ["cache_write_tokens"]})
        result = self.call(adapter, openai_body("x", input_tokens=100, cached=60,
                                                cache_write=60))
        self.assertIsNone(result.billable)


class RetryRuleTests(unittest.TestCase):
    def run_with(self, steps, adapter=None):
        transport = ScriptedTransport(steps)
        waits = []
        results = providers.call_with_retries(adapter or adapters()[0], transport, "p", 4096,
                                              SECRET, sleep=waits.append)
        return results, transport, waits

    def limited(self, status, seconds):
        return providers.Response(status=status, body="{}", elapsed_seconds=0.2,
                                  retry_after_seconds=seconds)

    def test_a_429_about_money_or_quota_is_not_retried(self):
        openai, anthropic = adapters()
        bodies = [(openai, {"error": {"type": "insufficient_quota",
                                      "code": "credit_balance_exhausted", "message": "m"}},
                   "HTTP 429 insufficient_quota"),
                  (openai, {"error": {"type": "invalid_request_error",
                                      "code": "project_spend_limit_exceeded", "message": "m"}},
                   "HTTP 429 project_spend_limit_exceeded"),
                  (anthropic, {"type": "error", "error": {
                      "type": "rate_limit_error", "message": "m",
                      "details": {"error_code": "enforced_spend_limit_reached"}}},
                   "HTTP 429 enforced_spend_limit_reached")]
        for adapter, body, error in bodies:
            results, transport, waits = self.run_with([http(429, body)], adapter)
            self.assertEqual([r.status for r in results], [providers.PROVIDER_ERROR])
            self.assertEqual((results[0].error, results[0].retryable), (error, False))
            self.assertEqual((len(transport.requests), waits), (1, []))

    def test_a_429_about_pace_is_still_retried(self):
        openai, anthropic = adapters()
        bodies = [(openai, {"error": {"type": "rate_limit_error", "code": "slow_down"}}),
                  (anthropic, {"type": "error", "error": {
                      "type": "rate_limit_error",
                      "details": {"error_code": "ramp_limit_exceeded"}}})]
        for adapter, body in bodies:
            reply = openai_body("fine") if adapter is openai else anthropic_body("fine")
            results, _, waits = self.run_with([http(429, body), ok(reply)], adapter)
            self.assertEqual([r.status for r in results], [providers.TRANSPORT_ERROR, providers.OK])
            self.assertEqual((results[0].error, waits), ("HTTP 429", [2]))

    def test_overload_statuses_are_retried(self):
        openai, anthropic = adapters()
        body = {"type": "error", "error": {"type": "overloaded_error", "message": "m"}}
        results, _, _ = self.run_with([http(529, body), ok(anthropic_body("fine"))], anthropic)
        self.assertEqual([r.status for r in results], [providers.TRANSPORT_ERROR, providers.OK])
        body = {"error": {"type": "service_unavailable_error", "code": "server_is_overloaded"}}
        results, _, _ = self.run_with([http(503, body), ok(openai_body("fine"))], openai)
        self.assertEqual([r.status for r in results], [providers.TRANSPORT_ERROR, providers.OK])

    def test_retry_after_lengthens_the_wait(self):
        results, _, waits = self.run_with([self.limited(429, 20), self.limited(503, 1),
                                           ok(openai_body("fine"))])
        self.assertEqual(results[-1].status, providers.OK)
        # 20 s asked beats the fixed 2 s; 1 s asked does not beat the fixed 8 s.
        self.assertEqual(waits, [20, 8])

    def test_a_long_retry_after_ends_the_attempt(self):
        results, transport, waits = self.run_with([self.limited(429, 61),
                                                   ok(openai_body("never"))])
        self.assertEqual([r.status for r in results], [providers.TRANSPORT_ERROR])
        self.assertEqual((len(transport.requests), waits), (1, []))

    def test_retry_after_header_is_read_as_seconds(self):
        for value, seconds in (("56", 56.0), (" 3 ", 3.0), (7, 7.0), ("0", 0.0),
                               ("Wed, 21 Oct 2026 07:28:00 GMT", None), ("-1", None),
                               ("nan", None), (None, None), ("", None)):
            self.assertEqual(providers.retry_after_seconds(value), seconds, value)


if __name__ == "__main__":
    unittest.main()
