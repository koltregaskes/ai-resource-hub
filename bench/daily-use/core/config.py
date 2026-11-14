"""Load and validate the frozen run config (`run-config.json`).

The config names, for every model and both judges: the provider, the exact
model id, the API version, the resolved reasoning or effort setting and
temperature as actual values, the output-limit parameter for that API, a
data-retention note and a dated price receipt. It also holds the caps per
provider, the key names per provider, the canary settings and the approval
fields for a live run.

A config never holds a key. Any value that looks like a secret is rejected,
and the error names only where it was found, never the value.

Values marked `TO PIN BEFORE RUN` are accepted for a dry run and rejected
for a live run.
"""

import datetime
import hashlib
import json
import math
import re
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation

PLACEHOLDER = "TO PIN BEFORE RUN"
PROVIDERS = ("openai", "anthropic")
OUTPUT_LIMIT_PARAMETER = {"openai": "max_output_tokens", "anthropic": "max_tokens"}
REASONING_BILLING = ("in_output", "separate")
OUTPUT_LIMITS = (4096, 8192)

_TOP_LEVEL = {
    "task_set_version", "live_approved", "approved_by", "key_names",
    "caps_usd", "planning", "canary", "models", "judges",
}
_MODEL_FIELDS = {
    "provider", "model_id", "api_version", "reasoning_effort",
    "send_reasoning_effort", "temperature", "send_temperature",
    "output_limit_parameter", "data_retention", "price",
}
_JUDGE_FIELDS = _MODEL_FIELDS | {"max_output_tokens"}
_PRICE_FIELDS = {
    "input_per_mtok", "output_per_mtok", "cached_input_per_mtok",
    "reasoning_billing", "reasoning_per_mtok", "source_url", "read_on",
    "promo_ends", "note",
}
_KEY_NAME = re.compile(r"[A-Za-z_][A-Za-z0-9_]{0,79}\Z")
_SECRET_PREFIX = re.compile(
    r"(?:\b|_)(?:sk-|sk_live|sk_test|rk-|pk_live|xox[abprs]-|ghp_|gho_|ghs_|"
    r"github_pat_|AKIA|AIza)|\bBearer\s+\S", re.IGNORECASE)
_LONG_TOKEN = re.compile(r"[A-Za-z0-9_\-+=]{32,}")


class ConfigError(ValueError):
    """The run config is not acceptable. Messages never quote a value."""


def _entropy(text):
    counts = {}
    for char in text:
        counts[char] = counts.get(char, 0) + 1
    total = len(text)
    return -sum(n / total * math.log2(n / total) for n in counts.values())


def looks_like_secret(text):
    """True for `sk-` style prefixes and long high-entropy strings."""
    if not isinstance(text, str):
        return False
    if _SECRET_PREFIX.search(text):
        return True
    for token in _LONG_TOKEN.findall(text):
        has_digit = any(char.isdigit() for char in token)
        has_letter = any(char.isalpha() for char in token)
        if has_digit and has_letter and _entropy(token) >= 3.5:
            return True
    return False


def find_secrets(value, where="config"):
    """Return the places (never the values) that look like secrets."""
    places = []
    if isinstance(value, str):
        if looks_like_secret(value):
            places.append(where)
    elif isinstance(value, dict):
        for key, child in value.items():
            if looks_like_secret(key):
                places.append(where + " (a field name)")
            places.extend(find_secrets(child, "%s.%s" % (where, _safe_name(key))))
    elif isinstance(value, (list, tuple)):
        for index, child in enumerate(value):
            places.extend(find_secrets(child, "%s[%d]" % (where, index)))
    return places


def _safe_name(key):
    text = str(key)
    return text if _KEY_NAME.match(text) and not looks_like_secret(text) else "<field>"


def find_placeholders(value, where="config"):
    places = []
    if isinstance(value, str):
        if PLACEHOLDER.casefold() in value.casefold():
            places.append(where)
    elif isinstance(value, dict):
        for key, child in value.items():
            if str(key).startswith("_"):
                continue
            places.extend(find_placeholders(child, "%s.%s" % (where, _safe_name(key))))
    elif isinstance(value, (list, tuple)):
        for index, child in enumerate(value):
            places.extend(find_placeholders(child, "%s[%d]" % (where, index)))
    return places


@dataclass(frozen=True)
class PriceReceipt:
    """Prices in USD per million tokens, frozen for the whole run."""
    input_per_mtok: Decimal
    output_per_mtok: Decimal
    cached_input_per_mtok: object
    reasoning_billing: str
    reasoning_per_mtok: object
    source_url: str
    read_on: str
    promo_ends: object
    note: str = ""

    def public(self):
        return {
            "input_per_mtok": str(self.input_per_mtok),
            "output_per_mtok": str(self.output_per_mtok),
            "cached_input_per_mtok": None if self.cached_input_per_mtok is None
            else str(self.cached_input_per_mtok),
            "reasoning_billing": self.reasoning_billing,
            "reasoning_per_mtok": None if self.reasoning_per_mtok is None
            else str(self.reasoning_per_mtok),
            "source_url": self.source_url,
            "read_on": self.read_on,
            "promo_ends": self.promo_ends,
            "note": self.note,
        }


@dataclass(frozen=True)
class ModelSpec:
    """One model or judge with every setting written out."""
    role: str
    provider: str
    model_id: str
    api_version: str
    reasoning_effort: str
    send_reasoning_effort: bool
    temperature: object
    send_temperature: bool
    output_limit_parameter: str
    data_retention: str
    price: PriceReceipt
    max_output_tokens: object = None

    def public(self):
        return {
            "role": self.role,
            "provider": self.provider,
            "model_id": self.model_id,
            "api_version": self.api_version,
            "reasoning_effort": self.reasoning_effort,
            "send_reasoning_effort": self.send_reasoning_effort,
            "temperature": None if self.temperature is None else str(self.temperature),
            "send_temperature": self.send_temperature,
            "output_limit_parameter": self.output_limit_parameter,
            "data_retention": self.data_retention,
            "price": self.price.public(),
            "max_output_tokens": self.max_output_tokens,
        }


@dataclass(frozen=True)
class RunConfig:
    task_set_version: str
    live_approved: bool
    approved_by: str
    key_names: dict
    caps_usd: dict
    expected_output_tokens: int
    judge_expected_output_tokens: int
    canary_task_ids: tuple
    models: tuple
    judges: tuple
    placeholders: tuple
    live_blockers: tuple
    sha256: str = ""

    def spec(self, model_id):
        for item in self.models + self.judges:
            if item.model_id == model_id:
                return item
        raise KeyError(model_id)

    def require_live_ready(self):
        if self.live_blockers:
            raise ConfigError(
                "config is not ready for a live run: " + "; ".join(self.live_blockers))


def _money(value, where, problems, allow_none=False):
    if value is None and allow_none:
        return None
    if isinstance(value, bool) or not isinstance(value, (int, float, Decimal, str)):
        problems.append(where + " must be a number")
        return None
    try:
        amount = Decimal(str(value))
    except InvalidOperation:
        problems.append(where + " must be a number")
        return None
    if not amount.is_finite() or amount < 0:
        problems.append(where + " must be a finite number, zero or above")
        return None
    return amount


def _iso_date(value, where, problems, allow_none=False):
    if value is None and allow_none:
        return None
    try:
        return datetime.date.fromisoformat(value)
    except (TypeError, ValueError):
        problems.append(where + " must be a date written YYYY-MM-DD")
        return None


def _text(value, where, problems):
    if not isinstance(value, str) or not value.strip():
        problems.append(where + " must be a non-empty text value")
        return ""
    if value.strip().casefold() == "default":
        problems.append(where + ' must be the actual value, not "default"')
    return value


def _is_placeholder(value):
    return isinstance(value, str) and PLACEHOLDER.casefold() in value.casefold()


def _price(raw, where, problems, blockers, today):
    if not isinstance(raw, dict):
        problems.append(where + " must be a price receipt")
        return None
    for name in sorted(set(raw) - _PRICE_FIELDS):
        if not str(name).startswith("_"):
            problems.append("%s has an unknown field" % where)
    for name in ("input_per_mtok", "output_per_mtok", "cached_input_per_mtok",
                 "reasoning_billing", "source_url", "read_on", "promo_ends"):
        if name not in raw:
            problems.append("%s.%s is missing" % (where, name))
    cached = _money(raw.get("cached_input_per_mtok"), where + ".cached_input_per_mtok",
                    problems, allow_none=True)
    if cached is None and "cached_input_per_mtok" in raw:
        blockers.append(where + ".cached_input_per_mtok is null; re-read the price page")
    billing = raw.get("reasoning_billing")
    if billing not in REASONING_BILLING:
        problems.append(where + '.reasoning_billing must be "in_output" or "separate"')
    reasoning_rate = _money(raw.get("reasoning_per_mtok"), where + ".reasoning_per_mtok",
                            problems, allow_none=True)
    if billing == "separate" and reasoning_rate is None:
        problems.append(where + ".reasoning_per_mtok is needed when billing is separate")
    url = raw.get("source_url")
    if not isinstance(url, str) or not url.startswith("https://"):
        problems.append(where + ".source_url must be an https address")
    _iso_date(raw.get("read_on"), where + ".read_on", problems)
    promo = _iso_date(raw.get("promo_ends"), where + ".promo_ends", problems, allow_none=True)
    if promo is not None and promo < today:
        blockers.append(where + ".promo_ends has passed; re-read the price page")
    note = raw.get("note", "")
    if not isinstance(note, str):
        problems.append(where + ".note must be text")
        note = ""
    return PriceReceipt(
        input_per_mtok=_money(raw.get("input_per_mtok"), where + ".input_per_mtok", problems),
        output_per_mtok=_money(raw.get("output_per_mtok"), where + ".output_per_mtok", problems),
        cached_input_per_mtok=cached,
        reasoning_billing=billing,
        reasoning_per_mtok=reasoning_rate,
        source_url=url if isinstance(url, str) else "",
        read_on=raw.get("read_on") if isinstance(raw.get("read_on"), str) else "",
        promo_ends=raw.get("promo_ends"),
        note=note,
    )


def _spec(raw, role, where, problems, blockers, today):
    if not isinstance(raw, dict):
        problems.append(where + " must be an object")
        return None
    allowed = _JUDGE_FIELDS if role == "judge" else _MODEL_FIELDS
    for name in sorted(set(raw) - allowed):
        if not str(name).startswith("_"):
            problems.append("%s has an unknown field" % where)
    for name in sorted(allowed - set(raw)):
        problems.append("%s.%s is missing" % (where, name))
    provider = raw.get("provider")
    if provider not in PROVIDERS:
        problems.append(where + ".provider must be openai or anthropic")
    model_id = _text(raw.get("model_id"), where + ".model_id", problems)
    api_version = _text(raw.get("api_version"), where + ".api_version", problems)
    effort = _text(raw.get("reasoning_effort"), where + ".reasoning_effort", problems)
    temperature = raw.get("temperature")
    if _is_placeholder(temperature):
        pass
    elif isinstance(temperature, bool) or not isinstance(temperature, (int, float, Decimal)):
        problems.append(where + ".temperature must be the actual number")
        temperature = None
    else:
        temperature = Decimal(str(temperature))
        if not temperature.is_finite() or not Decimal(0) <= temperature <= Decimal(2):
            problems.append(where + ".temperature must be between 0 and 2")
    for name in ("send_reasoning_effort", "send_temperature"):
        if not isinstance(raw.get(name), bool):
            problems.append("%s.%s must be true or false" % (where, name))
    parameter = raw.get("output_limit_parameter")
    if provider in PROVIDERS and parameter != OUTPUT_LIMIT_PARAMETER[provider]:
        problems.append("%s.output_limit_parameter must be %s for %s" % (
            where, OUTPUT_LIMIT_PARAMETER[provider], provider))
    retention = _text(raw.get("data_retention"), where + ".data_retention", problems)
    limit = None
    if role == "judge":
        limit = raw.get("max_output_tokens")
        if isinstance(limit, bool) or not isinstance(limit, int) or not 0 < limit <= 8192:
            problems.append(where + ".max_output_tokens must be a whole number up to 8192")
            limit = None
    return ModelSpec(
        role=role, provider=provider, model_id=model_id, api_version=api_version,
        reasoning_effort=effort,
        send_reasoning_effort=raw.get("send_reasoning_effort") is True,
        temperature=temperature, send_temperature=raw.get("send_temperature") is True,
        output_limit_parameter=parameter, data_retention=retention,
        price=_price(raw.get("price"), where + ".price", problems, blockers, today),
        max_output_tokens=limit,
    )


def validate(raw, mode="dry", today=None, sha256=""):
    """Check a parsed config and return a `RunConfig`.

    `mode` is "dry" or "live". A dry run accepts `TO PIN BEFORE RUN` values
    and null cached rates; a live run rejects them.
    """
    if mode not in ("dry", "live"):
        raise ConfigError("mode must be dry or live")
    if not isinstance(raw, dict):
        raise ConfigError("config must be a JSON object")
    today = today or datetime.datetime.now(datetime.timezone.utc).date()
    secrets = find_secrets(raw)
    if secrets:
        raise ConfigError(
            "config holds a value that looks like a secret at: " + ", ".join(secrets)
            + ". Keys are never written in a config.")
    problems = []
    blockers = []
    for name in sorted(set(raw) - _TOP_LEVEL):
        if not str(name).startswith("_"):
            problems.append("config has an unknown top-level field")
    for name in sorted(_TOP_LEVEL - set(raw)):
        problems.append("config.%s is missing" % name)

    version = _text(raw.get("task_set_version"), "config.task_set_version", problems)
    live_approved = raw.get("live_approved")
    if not isinstance(live_approved, bool):
        problems.append("config.live_approved must be true or false")
    approved_by = raw.get("approved_by")
    if not isinstance(approved_by, str):
        problems.append("config.approved_by must be text")
        approved_by = ""

    key_names = {}
    names = raw.get("key_names")
    if not isinstance(names, dict) or set(names) != set(PROVIDERS):
        problems.append("config.key_names must list names for openai and anthropic")
    else:
        seen = set()
        for provider, listed in names.items():
            if not isinstance(listed, list) or not listed:
                problems.append("config.key_names.%s must be a list of names" % provider)
                continue
            for name in listed:
                if not isinstance(name, str) or not _KEY_NAME.match(name):
                    problems.append("config.key_names.%s holds an invalid name" % provider)
                elif name.casefold() in seen:
                    problems.append("config.key_names lists a name twice")
                else:
                    seen.add(name.casefold())
            key_names[provider] = list(listed)

    caps = {}
    raw_caps = raw.get("caps_usd")
    if not isinstance(raw_caps, dict) or set(raw_caps) != set(PROVIDERS):
        problems.append("config.caps_usd must give a cap for openai and anthropic")
    else:
        for provider, value in raw_caps.items():
            amount = _money(value, "config.caps_usd." + provider, problems)
            if amount is not None:
                caps[provider] = amount

    planning = raw.get("planning") if isinstance(raw.get("planning"), dict) else {}
    expected = {}
    for name in ("expected_output_tokens", "judge_expected_output_tokens"):
        value = planning.get(name)
        if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
            problems.append("config.planning.%s must be a whole number above zero" % name)
            value = 1
        expected[name] = value

    canary = raw.get("canary") if isinstance(raw.get("canary"), dict) else {}
    if canary.get("public_tasks_per_model") != 2 or canary.get("repeats") != 1:
        problems.append(
            "config.canary must be 2 public tasks per model with 1 repeat, as the method says")
    canary_ids = canary.get("task_ids", [])
    if not isinstance(canary_ids, list) or not all(isinstance(i, str) for i in canary_ids) \
            or len(canary_ids) not in (0, 2):
        problems.append("config.canary.task_ids must be empty or name exactly 2 public tasks")
        canary_ids = []

    models = []
    raw_models = raw.get("models")
    if not isinstance(raw_models, list) or not raw_models:
        problems.append("config.models must list at least one model")
        raw_models = []
    for index, item in enumerate(raw_models):
        spec = _spec(item, "model", "config.models[%d]" % index, problems, blockers, today)
        if spec:
            models.append(spec)
    judges = []
    raw_judges = raw.get("judges")
    if not isinstance(raw_judges, list) or len(raw_judges) != 2:
        problems.append("config.judges must list exactly two judges")
        raw_judges = []
    for index, item in enumerate(raw_judges):
        spec = _spec(item, "judge", "config.judges[%d]" % index, problems, blockers, today)
        if spec:
            judges.append(spec)
    if len(judges) == 2 and judges[0].provider == judges[1].provider:
        problems.append("config.judges must come from two different providers")
    ids = [m.model_id for m in models]
    if len(set(ids)) != len(ids):
        problems.append("config.models lists a model id twice")

    placeholders = find_placeholders(raw)
    for place in placeholders:
        blockers.append(place + " still says " + PLACEHOLDER)
    if problems:
        raise ConfigError("config rejected: " + "; ".join(problems))
    if mode == "live" and blockers:
        raise ConfigError("config is not ready for a live run: " + "; ".join(blockers))
    return RunConfig(
        task_set_version=version,
        live_approved=live_approved,
        approved_by=approved_by,
        key_names=key_names,
        caps_usd=caps,
        expected_output_tokens=expected["expected_output_tokens"],
        judge_expected_output_tokens=expected["judge_expected_output_tokens"],
        canary_task_ids=tuple(canary_ids),
        models=tuple(models),
        judges=tuple(judges),
        placeholders=tuple(placeholders),
        live_blockers=tuple(blockers),
        sha256=sha256,
    )


def load_config(path, mode="dry", today=None):
    """Read `run-config.json` from disk and validate it."""
    with open(path, "rb") as stream:
        data = stream.read()
    try:
        raw = json.loads(data.decode("utf-8-sig"), parse_float=Decimal)
    except (UnicodeError, ValueError):
        raise ConfigError("config is not valid JSON") from None
    return validate(raw, mode=mode, today=today, sha256=hashlib.sha256(data).hexdigest())
