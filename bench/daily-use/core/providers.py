"""Provider adapters for the Day-to-Day Bench run path.

Two adapters, `OpenAIResponses` and `AnthropicMessages`, sit on an injectable
`transport(request) -> response`. Tests and dry runs pass a fake transport,
so nothing here touches the network unless the runner's live gate is open.

REQUEST SHAPES. Read against the providers' own API references on
14 November 2026 (the pages are listed in RUNNER.md). Nothing below has been
sent to a provider: the canary is still the first real exchange.

OpenAI Responses API
    POST https://api.openai.com/v1/responses
    headers: Authorization: Bearer <key>, Content-Type: application/json
    No version header exists; the config records `api_version` as text.
    body: {"model": <id>, "input": <prompt text>,
           "max_output_tokens": <task limit>, "store": false,
           "prompt_cache_options": {"mode": "explicit"},
           "reasoning": {"effort": <value>}   (only if send_reasoning_effort)
           "temperature": <value>}            (only if send_temperature)
    `max_output_tokens` covers reasoning tokens as well as the visible
    answer (minimum 16). `prompt_cache_options.mode` "explicit" with no
    breakpoint turns prompt caching off: on GPT-5.6 and later the default
    ("implicit") writes any prompt of 1,024 tokens or more to the cache and
    bills those tokens at 1.25 times the input rate, which the price receipt
    does not hold. The GPT-6 family rejects `temperature` unless the effort
    is "none"; config.py refuses that combination.
    No `instructions` field (empty system prompt) and no `tools` field.
    Reply text: output[] items of type "message", content[] parts of type
    "output_text" (a "refusal" part is kept as text so it can be graded, and
    the result is flagged "refusal").
    Finish: status "completed", or "incomplete" with
    incomplete_details.reason; reason "max_output_tokens" means truncated,
    "content_filter" is flagged "refusal". Status "failed", "cancelled",
    "queued" or "in_progress" on a 200 is a provider error.
    Usage: usage.input_tokens, usage.output_tokens,
    usage.input_tokens_details.cached_tokens and .cache_write_tokens (both a
    part of input_tokens), usage.output_tokens_details.reasoning_tokens (a
    part of output_tokens, billed as output). Cache-write tokens are not
    priced here, so a reply that reports any keeps its full reservation.

Anthropic Messages API
    POST https://api.anthropic.com/v1/messages
    headers: x-api-key: <key>, anthropic-version: <api_version from config>,
             Content-Type: application/json
    `anthropic-version` is "2026-10-21" (current) or "2023-06-01". The
    reference now lists `Authorization: Bearer` first and calls `x-api-key`
    a legacy form that is still supported.
    body: {"model": <id>, "max_tokens": <task limit>,
           "messages": [{"role": "user", "content": <prompt text>}],
           "output_config": {"effort": <value>}  (only if send_reasoning_effort)
           "temperature": <value>}               (only if send_temperature)
    `max_tokens` covers thinking tokens as well as the answer. No `thinking`
    field is sent, so the model's default applies (adaptive thinking, on).
    Version 2026-10-21 rejects `temperature` on every model; config.py
    allows it only with 2023-06-01.
    No `system` field (empty system prompt) and no `tools` field.
    Reply text: content[] blocks of type "text" (thinking blocks are skipped).
    Finish: stop_reason; "max_tokens" or "model_context_window_exceeded"
    means truncated; "refusal" is an HTTP 200 with empty content, flagged
    "refusal".
    Usage: usage.input_tokens (excludes cache reads and cache writes),
    usage.output_tokens (includes thinking),
    usage.cache_read_input_tokens, usage.cache_creation_input_tokens,
    usage.output_tokens_details.thinking_tokens (a part of output_tokens).

Failure classes
    transport error: connection failure, HTTP 429, HTTP 5xx (Anthropic's 529
                     "overloaded" included). Retryable. A `Retry-After`
                     header in seconds lengthens the wait; one longer than
                     60 s ends the attempt.
    provider error:  any other non-200 status, a 429 that says the account
                     is out of credit or over a spend limit (retrying cannot
                     help), or a 200 that cannot be used. Not retryable.
    timeout:         120 s from send to the last byte. Not retried.
"""

import json
import math
import threading
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field

TIMEOUT_SECONDS = 120
MAX_REQUESTS_PER_SLOT = 3
RETRY_WAITS_SECONDS = (2, 8)
RETRY_AFTER_MAX_SECONDS = 60
# A 429 carrying one of these is about money or quota, not pace. OpenAI:
# error.type or error.code. Anthropic: error.details.error_code.
PERMANENT_429_CODES = frozenset({
    "insufficient_quota", "credit_balance_exhausted",
    "organization_spend_limit_exceeded", "project_spend_limit_exceeded",
    "organization_usage_limit_exceeded", "enforced_spend_limit_reached"})
LIVE_HOSTS = {"openai": "api.openai.com", "anthropic": "api.anthropic.com"}

OK = "ok"
TRANSPORT_ERROR = "transport_error"
PROVIDER_ERROR = "provider_error"
TIMEOUT = "timeout"


class TransportFailure(Exception):
    """A connection failure. Holds a short kind, never request contents."""

    def __init__(self, kind="connection failure"):
        super().__init__(kind)
        self.kind = kind


class TransportTimeout(Exception):
    """The request passed the 120 s deadline and was cancelled."""


class ReplyNotUsable(Exception):
    """An HTTP 200 whose body says the request did not produce a reply."""


class Request:
    """One HTTP request. The key stays inside `secret` and is never recorded."""

    __slots__ = ("provider", "url", "headers", "body", "auth_header", "auth_prefix",
                 "secret", "timeout_seconds")

    def __init__(self, provider, url, headers, body, auth_header, auth_prefix, secret):
        self.provider = provider
        self.url = url
        self.headers = headers
        self.body = body
        self.auth_header = auth_header
        self.auth_prefix = auth_prefix
        self.secret = secret
        self.timeout_seconds = TIMEOUT_SECONDS

    def to_record(self):
        """What goes in the run record: everything but the key."""
        return {"provider": self.provider, "url": self.url,
                "headers": dict(self.headers), "body": self.body}

    def __repr__(self):
        return "<Request %s %s>" % (self.provider, self.url)


@dataclass
class Response:
    """What a transport returns: status, body and the harness-clock timing."""
    status: int
    body: object = b""
    elapsed_seconds: object = None
    first_byte_seconds: object = None
    retry_after_seconds: object = None


@dataclass
class Result:
    """One request, classified."""
    status: str
    retryable: bool = False
    http_status: object = None
    text: str = ""
    finish_reason: object = None
    truncated: bool = False
    usage: object = None
    billable: object = None
    error: object = None
    request_time_seconds: object = None
    first_token_seconds: object = None
    flags: list = field(default_factory=list)
    retry_after_seconds: object = None

    def to_record(self):
        return {
            "status": self.status, "retryable": self.retryable,
            "http_status": self.http_status, "text": self.text,
            "finish_reason": self.finish_reason, "truncated": self.truncated,
            "usage": self.usage, "error": self.error,
            "request_time_seconds": self.request_time_seconds,
            "first_token_seconds": self.first_token_seconds,
            "flags": list(self.flags),
        }


def _whole(value):
    return isinstance(value, int) and not isinstance(value, bool) and value >= 0


def _error_codes(payload):
    """The short provider error type and codes, in order. The message text
    is dropped, because providers can echo part of a key in an error
    message."""
    error = payload.get("error") if isinstance(payload, dict) else None
    if not isinstance(error, dict):
        return []
    details = error.get("details") if isinstance(error.get("details"), dict) else {}
    found = []
    for value in (error.get("type"), error.get("code"), details.get("error_code")):
        if isinstance(value, str) and 0 < len(value) <= 60 and \
                all(c.isalnum() or c in "_-." for c in value):
            found.append(value)
    return found


def _error_kind(payload):
    codes = _error_codes(payload)
    return codes[0] if codes else None


def retry_after_seconds(value):
    """A `Retry-After` header as seconds, or None. Both providers send a
    number of seconds; any other form is ignored."""
    try:
        seconds = float(str(value).strip())
    except (TypeError, ValueError):
        return None
    return seconds if math.isfinite(seconds) and seconds >= 0 else None


class _Adapter:
    provider = ""
    url = ""

    def __init__(self, spec):
        if spec.provider != self.provider:
            raise ValueError("model %s is not a %s model" % (spec.model_id, self.provider))
        self.spec = spec

    def _number(self, value):
        if isinstance(value, str):
            # An unpinned placeholder. Only a dry run can get this far.
            return value
        number = float(value)
        return int(number) if number == math.floor(number) else number

    def build_request(self, prompt, max_output_tokens, secret):
        raise NotImplementedError

    def parse_success(self, payload):
        raise NotImplementedError

    def billable(self, usage):
        raise NotImplementedError

    def reply_flags(self, payload):
        return []

    def call(self, transport, prompt, max_output_tokens, secret, clock=time.monotonic):
        """Send one request and classify what came back. Never retries."""
        request = self.build_request(prompt, max_output_tokens, secret)
        started = clock()
        try:
            response = transport(request)
        except TransportTimeout:
            return Result(TIMEOUT, error="timeout after %d s" % TIMEOUT_SECONDS,
                          request_time_seconds=clock() - started)
        except TransportFailure as failure:
            return Result(TRANSPORT_ERROR, retryable=True,
                          error="connection failure: " + failure.kind,
                          request_time_seconds=clock() - started)
        elapsed = response.elapsed_seconds
        if elapsed is None:
            elapsed = clock() - started
        if elapsed > TIMEOUT_SECONDS:
            return Result(TIMEOUT, error="timeout after %d s" % TIMEOUT_SECONDS,
                          request_time_seconds=elapsed)
        status = response.status
        body = response.body
        if isinstance(body, (bytes, bytearray)):
            body = bytes(body).decode("utf-8", "replace")
        try:
            payload = json.loads(body) if body else None
        except ValueError:
            payload = None
        base = dict(http_status=status, request_time_seconds=elapsed,
                    first_token_seconds=response.first_byte_seconds)
        if status == 429:
            permanent = [code for code in _error_codes(payload) if code in PERMANENT_429_CODES]
            if permanent:
                return Result(PROVIDER_ERROR, error="HTTP 429 " + permanent[0], **base)
        if status == 429 or (isinstance(status, int) and 500 <= status <= 599):
            return Result(TRANSPORT_ERROR, retryable=True, error="HTTP %d" % status,
                          retry_after_seconds=retry_after_seconds(response.retry_after_seconds),
                          **base)
        if status != 200:
            kind = _error_kind(payload)
            return Result(PROVIDER_ERROR, error="HTTP %s%s" % (
                status, " " + kind if kind else ""), **base)
        if not isinstance(payload, dict):
            return Result(PROVIDER_ERROR, error="HTTP 200 with an unreadable body", **base)
        try:
            text, finish, truncated = self.parse_success(payload)
            flags = self.reply_flags(payload)
        except ReplyNotUsable as unusable:
            return Result(PROVIDER_ERROR, error="HTTP 200 " + str(unusable), **base)
        except (KeyError, TypeError, ValueError, AttributeError):
            return Result(PROVIDER_ERROR, error="HTTP 200 with an unexpected shape", **base)
        usage = payload.get("usage") if isinstance(payload.get("usage"), dict) else None
        result = Result(OK, text=text, finish_reason=finish, truncated=truncated,
                        usage=usage, billable=self.billable(usage), **base)
        if truncated:
            result.flags.append("truncated")
        result.flags.extend(flags)
        if usage is None or result.billable is None:
            result.flags.append("missing_usage")
        return result


class OpenAIResponses(_Adapter):
    provider = "openai"
    url = "https://api.openai.com/v1/responses"

    def build_request(self, prompt, max_output_tokens, secret):
        body = {"model": self.spec.model_id, "input": prompt,
                self.spec.output_limit_parameter: max_output_tokens, "store": False,
                "prompt_cache_options": {"mode": "explicit"}}
        if self.spec.send_reasoning_effort:
            body["reasoning"] = {"effort": self.spec.reasoning_effort}
        if self.spec.send_temperature:
            body["temperature"] = self._number(self.spec.temperature)
        headers = {"Content-Type": "application/json"}
        return Request(self.provider, self.url, headers, body, "Authorization", "Bearer ", secret)

    def parse_success(self, payload):
        if payload.get("status") in ("failed", "cancelled", "queued", "in_progress"):
            kind = _error_kind(payload)
            raise ReplyNotUsable("status %s%s" % (payload["status"], " " + kind if kind else ""))
        parts = []
        for item in payload["output"]:
            if item.get("type") != "message":
                continue
            for part in item.get("content") or []:
                if part.get("type") == "output_text":
                    parts.append(part["text"])
                elif part.get("type") == "refusal":
                    parts.append(part.get("refusal") or "")
        status = payload.get("status")
        reason = (payload.get("incomplete_details") or {}).get("reason")
        finish = "%s:%s" % (status, reason) if reason else status
        return "".join(parts), finish, reason == "max_output_tokens"

    def reply_flags(self, payload):
        refused = (payload.get("incomplete_details") or {}).get("reason") == "content_filter"
        for item in payload["output"]:
            if item.get("type") == "message":
                refused = refused or any(part.get("type") == "refusal"
                                         for part in item.get("content") or [])
        return ["refusal"] if refused else []

    def billable(self, usage):
        if not usage or not _whole(usage.get("input_tokens")) \
                or not _whole(usage.get("output_tokens")):
            return None
        details = usage.get("input_tokens_details") or {}
        cached = details.get("cached_tokens") or 0
        written = details.get("cache_write_tokens") or 0
        reasoning = (usage.get("output_tokens_details") or {}).get("reasoning_tokens")
        if not _whole(cached) or not _whole(written) \
                or cached + written > usage["input_tokens"]:
            return None
        return {"input_uncached": usage["input_tokens"] - cached - written,
                "cached_input": cached, "output": usage["output_tokens"],
                "reasoning": reasoning if _whole(reasoning) else None,
                "unpriced": ["cache_write_tokens"] if written else []}


class AnthropicMessages(_Adapter):
    provider = "anthropic"
    url = "https://api.anthropic.com/v1/messages"

    def build_request(self, prompt, max_output_tokens, secret):
        body = {"model": self.spec.model_id,
                self.spec.output_limit_parameter: max_output_tokens,
                "messages": [{"role": "user", "content": prompt}]}
        if self.spec.send_reasoning_effort:
            body["output_config"] = {"effort": self.spec.reasoning_effort}
        if self.spec.send_temperature:
            body["temperature"] = self._number(self.spec.temperature)
        headers = {"Content-Type": "application/json",
                   "anthropic-version": self.spec.api_version}
        return Request(self.provider, self.url, headers, body, "x-api-key", "", secret)

    def parse_success(self, payload):
        parts = [block["text"] for block in payload["content"] if block.get("type") == "text"]
        finish = payload.get("stop_reason")
        return "".join(parts), finish, finish in ("max_tokens", "model_context_window_exceeded")

    def reply_flags(self, payload):
        return ["refusal"] if payload.get("stop_reason") == "refusal" else []

    def billable(self, usage):
        if not usage or not _whole(usage.get("input_tokens")) \
                or not _whole(usage.get("output_tokens")):
            return None
        cached = usage.get("cache_read_input_tokens") or 0
        created = usage.get("cache_creation_input_tokens") or 0
        thinking = (usage.get("output_tokens_details") or {}).get("thinking_tokens")
        if not _whole(cached) or not _whole(created):
            return None
        return {"input_uncached": usage["input_tokens"], "cached_input": cached,
                "output": usage["output_tokens"],
                "reasoning": thinking if _whole(thinking) else None,
                "unpriced": ["cache_creation_input_tokens"] if created else []}


ADAPTERS = {"openai": OpenAIResponses, "anthropic": AnthropicMessages}


def adapter_for(spec):
    return ADAPTERS[spec.provider](spec)


def call_with_retries(adapter, transport, prompt, max_output_tokens, secret, *,
                      max_requests=MAX_REQUESTS_PER_SLOT, before_send=None,
                      after_result=None, sleep=None, clock=time.monotonic):
    """Up to `max_requests` requests: the first, then retries of transport
    errors only. A timeout or a provider error ends the attempt at once.
    The wait before a retry is 2 s, then 8 s, or the provider's `Retry-After`
    if that is longer; a `Retry-After` above 60 s ends the attempt instead.

    `before_send(n)` runs before request n is sent (the runner reserves money
    and writes the record there; if it raises, nothing is sent).
    `after_result(n, result)` runs when request n is classified.
    Returns the list of results, the last one being the outcome.
    """
    results = []
    for number in range(1, max_requests + 1):
        if before_send:
            before_send(number)
        result = adapter.call(transport, prompt, max_output_tokens, secret, clock=clock)
        results.append(result)
        if after_result:
            after_result(number, result)
        if result.status == OK or not result.retryable:
            break
        if number < max_requests:
            wait = RETRY_WAITS_SECONDS[min(number - 1, len(RETRY_WAITS_SECONDS) - 1)]
            asked = result.retry_after_seconds
            if asked is not None:
                if asked > RETRY_AFTER_MAX_SECONDS:
                    break
                wait = max(wait, asked)
            if sleep:
                sleep(wait)
    return results


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    """A redirect could carry the key header to another host. Refuse it."""

    def redirect_request(self, *args, **kwargs):
        return None


class UrllibTransport:
    """The real transport. It can only be built with a pass from the
    runner's live gate, and it checks the pass again on every call.

    One POST, no streaming, no redirects, no proxies, and only the two
    provider hosts over https. The whole exchange has 120 s; when the
    deadline passes the request is abandoned and reported as a timeout.

    NOT YET EXERCISED AGAINST A PROVIDER. Review it at the canary.
    """

    def __init__(self, gate_pass):
        self._runner = _runner_module()
        self._runner.require_live_pass(gate_pass)
        self._pass = gate_pass

    def __call__(self, request):
        self._runner.require_live_pass(self._pass)
        expected = "https://%s/" % LIVE_HOSTS.get(request.provider, "")
        if not request.url.startswith(expected):
            raise TransportFailure("address not allowed")
        box = {}
        worker = threading.Thread(target=self._exchange, args=(request, box), daemon=True)
        started = time.monotonic()
        worker.start()
        worker.join(TIMEOUT_SECONDS)
        if worker.is_alive():
            box["abandoned"] = True
            stream = box.get("stream")
            if stream is not None:
                try:
                    stream.close()
                except Exception:
                    pass
            raise TransportTimeout()
        if "timeout" in box:
            raise TransportTimeout()
        if "failure" in box:
            raise TransportFailure(box["failure"])
        response = box["response"]
        response.elapsed_seconds = time.monotonic() - started
        return response

    @staticmethod
    def _exchange(request, box):
        started = time.monotonic()
        try:
            headers = dict(request.headers)
            headers[request.auth_header] = request.auth_prefix + request.secret.reveal()
            data = json.dumps(request.body).encode("utf-8")
            outgoing = urllib.request.Request(request.url, data=data, headers=headers,
                                              method="POST")
            opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), _NoRedirect())
            try:
                stream = opener.open(outgoing, timeout=TIMEOUT_SECONDS)
            except urllib.error.HTTPError as http_error:
                stream = http_error
            finally:
                headers = None
                outgoing = None
            box["stream"] = stream
            chunks = []
            while True:
                chunk = stream.read(65536)
                if not chunk:
                    break
                chunks.append(chunk)
                if time.monotonic() - started > TIMEOUT_SECONDS:
                    box["timeout"] = True
                    return
            status = getattr(stream, "status", None) or stream.getcode()
            reply_headers = getattr(stream, "headers", None)
            wait_hint = reply_headers.get("Retry-After") if reply_headers is not None else None
            stream.close()
            box["response"] = Response(status=status, body=b"".join(chunks),
                                       retry_after_seconds=retry_after_seconds(wait_hint))
        except TimeoutError:
            box["timeout"] = True
        except urllib.error.URLError as url_error:
            if isinstance(getattr(url_error, "reason", None), TimeoutError):
                box["timeout"] = True
            else:
                box["failure"] = "connection failure (%s)" % type(
                    getattr(url_error, "reason", url_error)).__name__
        except Exception as other:  # the text of the error is never kept
            box["failure"] = "connection failure (%s)" % type(other).__name__


def _runner_module():
    try:
        from . import runner
    except ImportError:
        import runner
    return runner
