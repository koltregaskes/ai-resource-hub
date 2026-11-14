"""Run config validation: actual values, price receipts, no secrets."""

import datetime
import json
import os
import sys
import tempfile
import unittest
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config  # noqa: E402
import test_run_support as support  # noqa: E402

EXAMPLE = os.path.join(support.CORE, "example-run-config.json")
TODAY = datetime.date(2026, 11, 14)


class ExampleConfigTests(unittest.TestCase):
    def test_example_is_marked_and_loads_for_a_dry_run(self):
        with open(EXAMPLE, encoding="utf-8") as stream:
            raw = json.load(stream)
        self.assertTrue(raw["_comment"].startswith("EXAMPLE"))
        self.assertIs(raw["live_approved"], False)
        loaded = config.load_config(EXAMPLE, mode="dry", today=TODAY)
        self.assertEqual(len(loaded.sha256), 64)
        self.assertTrue(loaded.placeholders)
        self.assertEqual(loaded.key_names, support.KEY_NAMES)
        self.assertEqual(loaded.caps_usd, {"openai": Decimal("90"), "anthropic": Decimal("60")})

    def test_example_prices_match_the_price_pages(self):
        # As read on 14 November 2026 from the two pricing pages named below.
        loaded = config.load_config(EXAMPLE, mode="dry", today=TODAY)
        prices = {m.model_id: (m.price.input_per_mtok, m.price.output_per_mtok,
                               m.price.cached_input_per_mtok) for m in loaded.models}
        D = Decimal
        self.assertEqual(prices, {
            "gpt-6-astra": (D("10"), D("50"), D("1.00")),
            "gpt-6.1-sol": (D("2"), D("10"), D("0.10")),
            "gpt-6.1-terra": (D("1"), D("5"), D("0.05")),
            "gpt-6-luna": (D("0.10"), D("0.50"), D("0.01")),
            "claude-opus-5-5": (D("4"), D("20"), D("0.20")),
            "claude-sonnet-5-5": (D("2"), D("10"), D("0.10")),
            "claude-haiku-5-5": (D("0.10"), D("0.50"), D("0.01")),
        })
        for model in loaded.models:
            self.assertEqual(model.price.read_on, "2026-11-14")
            expected = ("https://developers.openai.com/api/docs/pricing"
                        if model.provider == "openai"
                        else "https://platform.claude.com/docs/en/about-claude/pricing")
            self.assertEqual(model.price.source_url, expected)
            self.assertEqual(model.price.reasoning_billing, "in_output")
        # Both cheap tiers have a dearer rate for long prompts; the note says so.
        notes = {m.model_id: m.price.note for m in loaded.models}
        self.assertIn("up to 100,000 tokens", notes["claude-haiku-5-5"])
        self.assertIn("up to 272,000 input tokens", notes["gpt-6-luna"])
        # 0.10 stays exact: it never passes through a binary float.
        self.assertEqual(str(prices["gpt-6-luna"][0]), "0.10")

    def test_example_is_rejected_for_a_live_run(self):
        with self.assertRaises(config.ConfigError) as caught:
            config.load_config(EXAMPLE, mode="live", today=TODAY)
        message = str(caught.exception)
        self.assertIn("TO PIN BEFORE RUN", message)
        self.assertNotIn("cached_input_per_mtok is null", message)

    def test_example_settings_are_ones_the_providers_accept(self):
        loaded = config.load_config(EXAMPLE, mode="dry", today=TODAY)
        for spec in loaded.models + loaded.judges + loaded.all_judge_candidates():
            self.assertIs(spec.send_temperature, False)
            self.assertEqual(spec.temperature, Decimal("1"))
            self.assertEqual(spec.api_version,
                             "v1" if spec.provider == "openai" else "2026-10-21")
        # Effort and data retention are still the owner's to pin.
        self.assertTrue(all("reasoning_effort" in place or "data_retention" in place
                            for place in loaded.placeholders))

    def test_example_judges_come_from_two_providers(self):
        loaded = config.load_config(EXAMPLE, mode="dry", today=TODAY)
        self.assertEqual(sorted(j.provider for j in loaded.judges), ["anthropic", "openai"])

    def test_example_lists_the_judge_candidates_with_a_400_token_limit(self):
        loaded = config.load_config(EXAMPLE, mode="dry", today=TODAY)
        self.assertEqual(
            {provider: [spec.model_id for spec in specs]
             for provider, specs in loaded.judge_candidates.items()},
            {"openai": ["gpt-6-luna", "gpt-6.1-terra", "gpt-6.1-sol"],
             "anthropic": ["claude-haiku-5-5", "claude-sonnet-5-5"]})
        by_model = {model.model_id: model for model in loaded.models}
        for judge in loaded.judges + loaded.all_judge_candidates():
            self.assertEqual(judge.max_output_tokens, 400)
            self.assertEqual(judge.role, "judge")
            # The same price receipt as the model entry of the same id.
            self.assertEqual(judge.price, by_model[judge.model_id].price)
        for judge in loaded.judges:
            self.assertIn(judge, loaded.judge_candidates[judge.provider])
        # The benchmarked models carry no limit of their own: the task's value applies.
        with open(EXAMPLE, encoding="utf-8") as stream:
            raw = json.load(stream)
        for model in raw["models"]:
            self.assertNotIn("max_output_tokens", model)
        self.assertTrue(all(m.max_output_tokens is None for m in loaded.models))


class ValidationTests(unittest.TestCase):
    def check(self, mode="dry", **over):
        return config.validate(support.config_dict(**over), mode=mode, today=TODAY)

    def rejects(self, fragment, mode="dry", **over):
        with self.assertRaises(config.ConfigError) as caught:
            self.check(mode=mode, **over)
        self.assertIn(fragment, str(caught.exception))
        return str(caught.exception)

    def test_a_pinned_config_passes_for_live(self):
        loaded = self.check(mode="live")
        self.assertEqual(loaded.live_blockers, ())
        self.assertEqual(loaded.models[0].temperature, Decimal("1"))
        self.assertEqual(loaded.models[0].output_limit_parameter, "max_output_tokens")
        self.assertEqual(loaded.models[1].output_limit_parameter, "max_tokens")
        loaded.require_live_ready()

    def test_placeholders_pass_dry_and_fail_live(self):
        for field in ("api_version", "reasoning_effort", "temperature", "data_retention"):
            models = [support.spec_dict("openai", "m-oa", "3", "30", **{field: config.PLACEHOLDER}),
                      support.spec_dict("anthropic", "m-an", "3", "15")]
            loaded = self.check(models=models)
            self.assertEqual(len(loaded.placeholders), 1)
            self.assertIn(field, loaded.placeholders[0])
            with self.assertRaises(config.ConfigError):
                loaded.require_live_ready()
            self.rejects("TO PIN BEFORE RUN", mode="live", models=models)

    def test_settings_a_provider_would_reject_are_refused(self):
        def model(provider, **over):
            other = "anthropic" if provider == "openai" else "openai"
            return [support.spec_dict(provider, "m-x", "3", "30", **over),
                    support.spec_dict(other, "m-y", "3", "15")]
        # Anthropic: the version header has two values, and the current one
        # rejects temperature on every model.
        self.rejects("api_version must be 2026-10-21 or 2023-06-01",
                     models=model("anthropic", api_version="2026-01-01"))
        self.rejects("send_temperature must be false",
                     models=model("anthropic", send_temperature=True))
        self.check(models=model("anthropic", api_version="2023-06-01", send_temperature=True))
        # OpenAI: temperature only goes with reasoning effort "none".
        self.rejects("send_temperature must be false",
                     models=model("openai", send_temperature=True))
        self.rejects("send_temperature must be false",
                     models=model("openai", send_temperature=True, reasoning_effort="none",
                                  send_reasoning_effort=False))
        self.check(models=model("openai", send_temperature=True, reasoning_effort="none"))
        # Effort values are per API.
        self.rejects("reasoning_effort must be one of low, medium, high, xhigh, max",
                     models=model("anthropic", reasoning_effort="none"))
        self.rejects("reasoning_effort must be one of",
                     models=model("openai", reasoning_effort="extreme"))
        for effort in ("none", "minimal", "low", "medium", "high", "xhigh", "max"):
            self.check(models=model("openai", reasoning_effort=effort))
        # A value still to be pinned is not second-guessed; it blocks a live run.
        self.check(models=model("anthropic", api_version=config.PLACEHOLDER,
                                send_temperature=True))
        self.check(models=model("openai", reasoning_effort=config.PLACEHOLDER,
                                send_temperature=True))

    def test_default_is_not_an_actual_value(self):
        for field in ("api_version", "reasoning_effort"):
            models = [support.spec_dict("openai", "m-oa", "3", "30", **{field: "default"})]
            self.rejects('not "default"', models=models)
        models = [support.spec_dict("openai", "m-oa", "3", "30", temperature="default")]
        self.rejects("temperature must be the actual number", models=models)
        models = [support.spec_dict("openai", "m-oa", "3", "30", temperature=None)]
        self.rejects("temperature must be the actual number", models=models)

    def test_secret_looking_values_are_rejected_and_never_echoed(self):
        prefixed = "sk" + "-" + "FAKEFAKEFAKE1234"
        long_token = support.FAKE_OPENAI_KEY
        for value in (prefixed, long_token, "Bearer " + "abc123"):
            for place in ("approved_by", "task_set_version"):
                message = self.rejects("looks like a secret", **{place: value})
                self.assertNotIn(value, message)
                self.assertIn("config." + place, message)
        models = [support.spec_dict("openai", "m-oa", "3", "30", data_retention=prefixed)]
        message = self.rejects("looks like a secret", models=models)
        self.assertNotIn(prefixed, message)
        self.assertIn("config.models[0].data_retention", message)
        raw = support.config_dict()
        raw[prefixed] = "x"
        with self.assertRaises(config.ConfigError) as caught:
            config.validate(raw, today=TODAY)
        self.assertNotIn(prefixed, str(caught.exception))

    def test_secret_detector_leaves_ordinary_values_alone(self):
        for value in ("claude-sonnet-5-5-20261101", "gpt-6.1-terra", "OPENAI_API_KEY",
                      "https://developers.openai.com/api/docs/pricing",
                      "a task-based risk-free desk-top note", "TO PIN BEFORE RUN",
                      "30 days retention, zero data retention not enabled"):
            self.assertFalse(config.looks_like_secret(value), value)
        self.assertTrue(config.looks_like_secret("sk" + "-" + "abcdefgh12345678"))
        self.assertTrue(config.looks_like_secret(support.FAKE_ANTHROPIC_KEY))

    def test_judges_must_be_two_from_different_providers(self):
        same = [support.spec_dict("openai", "j1", "1", "2", judge=True),
                support.spec_dict("openai", "j2", "1", "2", judge=True)]
        self.rejects("two different providers", judges=same)
        self.rejects("exactly two judges", judges=same[:1])

    def test_judge_candidates_default_to_the_two_judges(self):
        loaded = self.check()
        self.assertEqual({p: [s.model_id for s in specs]
                          for p, specs in loaded.judge_candidates.items()},
                         {"openai": ["j-oa"], "anthropic": ["j-an"]})
        self.assertEqual([s.model_id for s in loaded.all_judge_candidates()], ["j-oa", "j-an"])

    def test_judge_candidates_are_checked(self):
        loaded = self.check(judge_candidates=support.candidates_dict())
        self.assertEqual([s.model_id for s in loaded.all_judge_candidates()],
                         ["j-oa-cheap", "j-oa", "j-oa-dear", "j-an-cheap", "j-an"])
        self.assertEqual(loaded.spec("j-oa-dear").provider, "openai")
        self.assertEqual(self.check(mode="live",
                                    judge_candidates=support.candidates_dict()).live_blockers, ())
        one_side = support.candidates_dict()
        del one_side["anthropic"]
        self.rejects("candidates for openai and anthropic", judge_candidates=one_side)
        empty = support.candidates_dict()
        empty["openai"] = []
        self.rejects("must list at least one judge", judge_candidates=empty)
        wrong_side = support.candidates_dict()
        wrong_side["openai"].append(support.spec_dict("anthropic", "j-x", "1", "2", judge=True))
        self.rejects("provider must be openai", judge_candidates=wrong_side)
        twice = support.candidates_dict()
        twice["openai"].append(support.spec_dict("openai", "j-oa", "6", "12", judge=True))
        self.rejects("model id twice", judge_candidates=twice)
        no_limit = support.candidates_dict()
        del no_limit["openai"][0]["max_output_tokens"]
        self.rejects("max_output_tokens is missing", judge_candidates=no_limit)
        # The panel must be drawn from the candidates, entry for entry.
        missing = support.candidates_dict()
        missing["openai"] = missing["openai"][:1]
        self.rejects("must be one of the judge candidates", judge_candidates=missing)
        changed = support.candidates_dict()
        changed["anthropic"][1]["reasoning_effort"] = "high"
        self.rejects("must be one of the judge candidates", judge_candidates=changed)
        unpinned = support.candidates_dict()
        unpinned["openai"][2]["api_version"] = config.PLACEHOLDER
        self.assertTrue(self.check(judge_candidates=unpinned).live_blockers)
        self.rejects("TO PIN BEFORE RUN", mode="live", judge_candidates=unpinned)

    def test_settings_fingerprint_follows_the_settings_not_the_price(self):
        base = self.check().judges[0]
        repriced = support.spec_dict("openai", "j-oa", "7", "14", judge=True)
        repriced["price"]["read_on"] = "2026-11-20"
        same = self.check(judges=[repriced, support.spec_dict("anthropic", "j-an", "9", "18",
                                                              judge=True)]).judges[0]
        self.assertEqual(base.settings_sha256(), same.settings_sha256())
        self.assertEqual(len(base.settings_sha256()), 64)
        for field, value in (("reasoning_effort", "high"), ("temperature", 0),
                             ("max_output_tokens", 400), ("api_version", "2026-06-01"),
                             ("send_reasoning_effort", False)):
            other = support.spec_dict("openai", "j-oa", "6", "12", judge=True, **{field: value})
            moved = self.check(judges=[other, support.spec_dict("anthropic", "j-an", "9", "18",
                                                                judge=True)]).judges[0]
            self.assertNotEqual(base.settings_sha256(), moved.settings_sha256(), field)

    def test_price_receipt_is_checked(self):
        bad_url = support.spec_dict("openai", "m-oa", "3", "30")
        bad_url["price"]["source_url"] = "http://example.test"
        self.rejects("source_url must be an https address", models=[bad_url])
        bad_date = support.spec_dict("openai", "m-oa", "3", "30")
        bad_date["price"]["read_on"] = "14 Nov"
        self.rejects("read_on must be a date", models=[bad_date])
        bad_billing = support.spec_dict("openai", "m-oa", "3", "30")
        bad_billing["price"]["reasoning_billing"] = "free"
        self.rejects("reasoning_billing", models=[bad_billing])
        separate = support.spec_dict("openai", "m-oa", "3", "30")
        separate["price"]["reasoning_billing"] = "separate"
        self.rejects("reasoning_per_mtok is needed", models=[separate])
        negative = support.spec_dict("openai", "m-oa", "-3", "30")
        self.rejects("input_per_mtok", models=[negative])

    def test_null_cached_rate_and_ended_promotion_block_live_only(self):
        null_cached = support.spec_dict("anthropic", "m-an", "3", "15", cached=None)
        self.assertTrue(self.check(models=[null_cached]).live_blockers)
        self.rejects("cached_input_per_mtok is null", mode="live", models=[null_cached])
        promo = support.spec_dict("openai", "m-oa", "3", "30")
        promo["price"]["promo_ends"] = "2026-11-13"
        self.assertTrue(self.check(models=[promo]).live_blockers)
        self.rejects("promo_ends has passed", mode="live", models=[promo])
        promo["price"]["promo_ends"] = "2026-11-30"
        self.assertEqual(self.check(mode="live", models=[promo]).live_blockers, ())

    def test_structure_is_strict(self):
        self.rejects("unknown top-level field", api_key_file="somewhere")
        extra = support.spec_dict("openai", "m-oa", "3", "30", system_prompt="hello")
        self.rejects("unknown field", models=[extra])
        wrong_parameter = support.spec_dict("anthropic", "m-an", "3", "15",
                                            output_limit_parameter="max_output_tokens")
        self.rejects("output_limit_parameter must be max_tokens", models=[wrong_parameter])
        self.rejects("caps_usd", caps_usd={"openai": "90"})
        self.rejects("key_names", key_names={"openai": ["A"]})
        self.rejects("2 public tasks per model with 1 repeat",
                     canary={"public_tasks_per_model": 5, "repeats": 1})
        self.rejects("model id twice", models=[support.spec_dict("openai", "m", "1", "2"),
                                               support.spec_dict("openai", "m", "1", "2")])
        self.rejects("live_approved", live_approved="yes")

    def test_caps_and_prices_are_decimals(self):
        loaded = self.check(caps_usd={"openai": 90, "anthropic": 60.5})
        self.assertEqual(loaded.caps_usd["anthropic"], Decimal("60.5"))
        self.assertIsInstance(loaded.models[0].price.input_per_mtok, Decimal)

    def test_load_config_rejects_bad_json(self):
        with tempfile.TemporaryDirectory() as folder:
            path = os.path.join(folder, "c.json")
            with open(path, "w", encoding="utf-8") as stream:
                stream.write("{not json")
            with self.assertRaises(config.ConfigError):
                config.load_config(path)


if __name__ == "__main__":
    unittest.main()
