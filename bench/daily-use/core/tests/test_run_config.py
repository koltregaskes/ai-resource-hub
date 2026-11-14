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

    def test_example_prices_match_the_brief(self):
        loaded = config.load_config(EXAMPLE, mode="dry", today=TODAY)
        prices = {m.model_id: (m.price.input_per_mtok, m.price.output_per_mtok,
                               m.price.cached_input_per_mtok) for m in loaded.models}
        D = Decimal
        self.assertEqual(prices, {
            "gpt-6-astra": (D("10"), D("50"), D("1.00")),
            "gpt-6.1-sol": (D("2"), D("10"), D("0.10")),
            "gpt-6.1-terra": (D("1"), D("5"), D("0.05")),
            "gpt-6-luna": (D("0.10"), D("0.50"), D("0.01")),
            "claude-opus-5-5": (D("4"), D("20"), None),
            "claude-sonnet-5-5": (D("2"), D("10"), None),
            "claude-haiku-5-5": (D("0.10"), D("0.50"), None),
        })
        for model in loaded.models:
            self.assertEqual(model.price.read_on, "2026-11-14")
            expected = ("https://developers.openai.com/api/docs/pricing"
                        if model.provider == "openai"
                        else "https://platform.claude.com/docs/en/about-claude/pricing")
            self.assertEqual(model.price.source_url, expected)
            if model.provider == "anthropic":
                self.assertIn("re-read before the run", model.price.note)
        # 0.10 stays exact: it never passes through a binary float.
        self.assertEqual(str(prices["gpt-6-luna"][0]), "0.10")

    def test_example_is_rejected_for_a_live_run(self):
        with self.assertRaises(config.ConfigError) as caught:
            config.load_config(EXAMPLE, mode="live", today=TODAY)
        message = str(caught.exception)
        self.assertIn("TO PIN BEFORE RUN", message)
        self.assertIn("cached_input_per_mtok is null", message)

    def test_example_judges_come_from_two_providers(self):
        loaded = config.load_config(EXAMPLE, mode="dry", today=TODAY)
        self.assertEqual(sorted(j.provider for j in loaded.judges), ["anthropic", "openai"])


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
