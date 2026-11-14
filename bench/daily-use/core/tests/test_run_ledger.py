"""The money ledger: Decimal arithmetic, caps, reconciliation, durability."""

import json
import os
import sys
import tempfile
import unittest
from decimal import Decimal
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import ledger  # noqa: E402
import test_run_support as support  # noqa: E402

D = Decimal


def receipt(price_in="3", price_out="30", cached="0.30", billing="in_output", reasoning=None):
    raw = support.spec_dict("openai", "m", price_in, price_out, cached=cached)
    raw["price"]["reasoning_billing"] = billing
    raw["price"]["reasoning_per_mtok"] = reasoning
    cfg = support.config.validate(support.config_dict(models=[raw]))
    return cfg.models[0].price


def usage(uncached=0, cached=0, output=0, reasoning=None, unpriced=()):
    return {"input_uncached": uncached, "cached_input": cached, "output": output,
            "reasoning": reasoning, "unpriced": list(unpriced)}


class ArithmeticTests(unittest.TestCase):
    def test_the_input_bound_is_utf8_bytes_plus_the_framing_allowance(self):
        self.assertEqual(ledger.FRAMING_ALLOWANCE_TOKENS, 256)
        bound = ledger.input_token_bound
        self.assertEqual(bound(""), 256)
        self.assertEqual(bound("abc"), 3 + 256)
        self.assertEqual(bound("x" * 300), 300 + 256)
        # Bytes, not characters: text that the old characters / 3 undercounted.
        self.assertEqual(bound("\u00e9"), 2 + 256)                    # e acute
        self.assertEqual(bound("\u20ac"), 3 + 256)                    # euro sign
        self.assertEqual(bound("\u65e5\u672c\u8a9e"), 9 + 256)        # three CJK characters
        self.assertEqual(bound("\U0001f600"), 4 + 256)                # one emoji
        self.assertEqual(bound("{}[]();:,.<>!?"), 14 + 256)           # punctuation
        # Every text field sent is counted; the allowance is per request, once.
        self.assertEqual(bound("system text", "prompt"), 11 + 6 + 256)
        self.assertEqual(bound(), 256)
        # A lone surrogate from a JSON escape is counted, not an error.
        self.assertEqual(bound("\ud800"), 3 + 256)

    def test_the_input_bound_is_never_below_one_token_per_byte(self):
        for text in ("plain words", "def f(x):\n    return {x: [x]}", "\u00e9\u00e8\u00ea",
                     "\u4e2d\u6587\u6587\u672c", "\U0001f600" * 5, "a" * 10000):
            self.assertGreaterEqual(ledger.input_token_bound(text),
                                    len(text.encode("utf-8")))
            self.assertGreaterEqual(ledger.input_token_bound(text), len(text))

    def test_there_is_one_input_figure_and_no_second_estimate(self):
        self.assertFalse(hasattr(ledger, "count_input_tokens"))
        folder = support.CORE
        for name in ("ledger.py", "preflight.py", "runner.py"):
            with open(os.path.join(folder, name), encoding="utf-8") as stream:
                text = stream.read()
            self.assertNotIn("tokeniser=", text, name)
            self.assertNotIn("chars_per_token", text.lower(), name)
        with open(os.path.join(folder, "ledger.py"), encoding="utf-8") as stream:
            text = stream.read()
        self.assertNotIn("/ 3", text)
        self.assertNotIn("// 3", text)

    def test_worst_case_covers_reasoning_billed_separately_and_a_dearer_cached_rate(self):
        # Separate reasoning: the limit is priced at output + reasoning.
        # 100 x 3 + 4096 x (30 + 40) = 300 + 286720 = 287020 per million
        price = receipt(billing="separate", reasoning="40")
        self.assertEqual(ledger.worst_case_usd(100, 4096, price), D("0.28702"))
        # ...so the dearest charge the limit allows is never above it.
        charge, _ = ledger.charge_usd(usage(100, 0, 4096, reasoning=4096), price)
        self.assertEqual(charge, D("0.28702"))
        # A cached rate above the input rate: the dearer one is reserved.
        # 100 x 5 + 4096 x 30 = 500 + 122880 = 123380 per million
        price = receipt(cached="5")
        self.assertEqual(ledger.worst_case_usd(100, 4096, price), D("0.12338"))
        charge, _ = ledger.charge_usd(usage(0, 100, 4096), price)
        self.assertEqual(charge, D("0.12338"))

    def test_a_request_within_the_bound_and_the_limit_never_costs_more_than_reserved(self):
        price = receipt()
        prompt = "Summarise: \u00e9t\u00e9 {code}; " * 40
        tokens = ledger.input_token_bound(prompt)
        reserved = ledger.worst_case_usd(tokens, 4096, price)
        for uncached, cached, output in ((tokens, 0, 4096), (0, tokens, 4096),
                                         (tokens // 2, tokens // 2, 4096), (10, 0, 1)):
            charge, _ = ledger.charge_usd(usage(uncached, cached, output, reasoning=output),
                                          price)
            self.assertLessEqual(charge, reserved)

    def test_worst_case_is_input_plus_the_output_limit(self):
        # 100 x 3 + 4096 x 30 = 300 + 122880 = 123180 per million = 0.12318
        self.assertEqual(ledger.worst_case_usd(100, 4096, receipt()), D("0.12318"))
        self.assertIsInstance(ledger.worst_case_usd(100, 4096, receipt()), Decimal)

    def test_charge_with_cached_input_and_reasoning_billed_once_as_output(self):
        # uncached 1000 x 3 = 3000; cached 200 x 0.30 = 60; output 500 x 30 = 15000
        # (the 320 reasoning tokens are a part of the 500 and are not billed again)
        charge, flags = ledger.charge_usd(usage(1000, 200, 500, reasoning=320), receipt())
        self.assertEqual(charge, D("0.01806"))
        self.assertEqual(flags, ["cached_tokens_reported"])

    def test_charge_with_reasoning_billed_separately(self):
        # 1000 x 3 + 500 x 30 + 320 x 40 = 3000 + 15000 + 12800 = 30800
        charge, flags = ledger.charge_usd(
            usage(1000, 0, 500, reasoning=320), receipt(billing="separate", reasoning="40"))
        self.assertEqual(charge, D("0.0308"))
        self.assertEqual(flags, [])
        charge, flags = ledger.charge_usd(
            usage(1000, 0, 500, reasoning=None), receipt(billing="separate", reasoning="40"))
        self.assertIsNone(charge)
        self.assertEqual(flags, ["reasoning_usage_missing"])

    def test_charge_cannot_be_worked_out(self):
        self.assertEqual(ledger.charge_usd(None, receipt()), (None, ["missing_usage"]))
        charge, flags = ledger.charge_usd(usage(1, 0, 1, unpriced=["cache_creation_input_tokens"]),
                                          receipt())
        self.assertIsNone(charge)
        self.assertEqual(flags, ["unpriced_tokens:cache_creation_input_tokens"])
        charge, flags = ledger.charge_usd(usage(1, 5, 1), receipt(cached=None))
        self.assertIsNone(charge)
        self.assertIn("cached_rate_missing", flags)

    def test_no_binary_float_error(self):
        # 0.10 per million x 3 tokens, ten times over, is exactly 0.000003.
        price = receipt(price_in="0.10", price_out="0.50")
        total = sum((ledger.charge_usd(usage(3, 0, 0), price)[0] for _ in range(10)), D(0))
        self.assertEqual(total, D("0.000003"))


class LedgerTests(unittest.TestCase):
    def setUp(self):
        folder = tempfile.TemporaryDirectory()
        self.addCleanup(folder.cleanup)
        self.path = os.path.join(folder.name, "ledgers", "openai.jsonl")

    def book(self, cap="1.00"):
        return ledger.ProviderLedger("openai", cap, self.path)

    def lines(self):
        with open(self.path, encoding="utf-8") as stream:
            return [json.loads(line) for line in stream]

    def test_reserve_then_settle_reconciles_to_the_actual_charge(self):
        book = self.book()
        book.reserve("r/1", D("0.12318"))
        self.assertEqual((book.spent, book.reserved, book.remaining),
                         (D(0), D("0.12318"), D("0.87682")))
        settled = book.settle("r/1", usage(1000, 200, 500, reasoning=320), receipt())
        self.assertEqual(settled["charge"], D("0.01806"))
        self.assertTrue(settled["reconciled"])
        self.assertEqual((book.spent, book.reserved, book.remaining),
                         (D("0.01806"), D(0), D("0.98194")))

    def test_cap_refusal_at_the_exact_boundary(self):
        book = self.book(cap="0.30")
        book.reserve("r/1", D("0.10"))
        book.settle("r/1", usage(0, 0, 0), receipt())          # actual charge 0
        book.reserve("r/2", D("0.10"))                         # still in flight
        book.reserve("r/3", D("0.20"))                         # 0 + 0.10 + 0.20 = cap exactly
        with self.assertRaises(ledger.CapExceeded) as caught:
            book.reserve("r/4", D("0.000001"))
        self.assertEqual(caught.exception.provider, "openai")
        # The refused request left no trace in memory or on disk.
        self.assertNotIn("r/4", book.entries)
        self.assertEqual([line["request_id"] for line in self.lines()],
                         ["r/1", "r/1", "r/2", "r/3"])

    def test_spent_counts_against_the_cap(self):
        book = self.book(cap="0.05")
        book.reserve("r/1", D("0.05"))
        book.settle("r/1", usage(10000, 0, 0), receipt())      # 10000 x 3 = 0.03 spent
        with self.assertRaises(ledger.CapExceeded):
            book.reserve("r/2", D("0.03"))                     # 0.03 + 0.03 > 0.05
        book.reserve("r/3", D("0.02"))                         # 0.03 + 0.02 = cap

    def test_missing_usage_keeps_the_full_reservation_and_flags_it(self):
        book = self.book()
        book.reserve("r/1", D("0.12318"))
        settled = book.settle("r/1", None, receipt())
        self.assertEqual(settled["charge"], D("0.12318"))
        self.assertFalse(settled["reconciled"])
        self.assertEqual(settled["flags"], ["missing_usage", "charged_at_reserved_maximum"])
        self.assertEqual(book.spent, D("0.12318"))
        self.assertEqual(book.unreconciled(), ["r/1"])
        book.reconcile("r/1", "0.004", "console figure 14 Nov")
        self.assertEqual(book.spent, D("0.004"))
        self.assertEqual(book.unreconciled(), [])

    def test_zero_reason_settles_to_nothing(self):
        book = self.book()
        book.reserve("r/1", D("0.5"))
        settled = book.settle("r/1", None, receipt(), zero_reason="http_error_not_billed")
        self.assertEqual((settled["charge"], settled["flags"]), (D(0), ["http_error_not_billed"]))
        self.assertEqual(book.remaining, D("1.00"))

    def test_charge_above_reservation_is_recorded_and_flagged(self):
        book = self.book()
        book.reserve("r/1", D("0.001"))
        settled = book.settle("r/1", usage(1000, 0, 0), receipt())   # 0.003
        self.assertEqual(settled["charge"], D("0.003"))
        self.assertIn("charge_above_reservation", settled["flags"])
        self.assertEqual(ledger.OVERRUN_FLAG, "charge_above_reservation")
        # The overrun is on disk with both figures, and it counts as spent in full.
        line = self.lines()[-1]
        self.assertEqual((line["event"], line["usd"], line["reserved_usd"]),
                         ("settle", "0.003", "0.001"))
        self.assertIn("charge_above_reservation", line["flags"])
        self.assertEqual(book.spent, D("0.003"))
        self.assertIn("charge_above_reservation", self.book().entries["r/1"]["flags"])

    def test_misuse_is_refused(self):
        book = self.book()
        book.reserve("r/1", D("0.1"))
        with self.assertRaises(ledger.LedgerError):
            book.reserve("r/1", D("0.1"))                      # ids are never reused
        with self.assertRaises(ledger.LedgerError):
            book.settle("r/9", None, receipt())
        book.settle("r/1", usage(1, 0, 1), receipt())
        with self.assertRaises(ledger.LedgerError):
            book.settle("r/1", usage(1, 0, 1), receipt())
        with self.assertRaises(ledger.LedgerError):
            book.reserve("r/2", D("-1"))

    def test_durable_across_a_restart(self):
        book = self.book()
        book.reserve("r/1", D("0.10"))
        book.settle("r/1", usage(1000, 0, 500), receipt())      # 0.018
        book.reserve("r/2", D("0.20"))                          # in flight at the crash
        book.reserve("r/3", D("0.30"))
        book.settle("r/3", None, receipt())                     # missing usage
        del book
        again = self.book()
        self.assertEqual(again.spent, D("0.318"))               # 0.018 + 0.30
        self.assertEqual(again.reserved, D("0.20"))             # the in-flight one stays counted
        self.assertEqual(again.remaining, D("0.482"))
        self.assertEqual(again.unreconciled(), ["r/2", "r/3"])
        with self.assertRaises(ledger.LedgerError):
            again.reserve("r/2", D("0.01"))
        with self.assertRaises(ledger.CapExceeded):
            again.reserve("r/4", D("0.49"))
        again.reserve("r/4", D("0.48"))

    def test_reservation_is_on_disk_and_fsynced_before_reserve_returns(self):
        book = self.book()
        events = []
        real_fsync = os.fsync

        def watching_fsync(descriptor):
            real_fsync(descriptor)
            events.append("fsync")

        with mock.patch("os.fsync", watching_fsync):
            book.reserve("r/1", D("0.10"))
            events.append("returned")
        self.assertEqual(events, ["fsync", "returned"])
        self.assertEqual(self.lines()[-1]["event"], "reserve")
        self.assertEqual(self.lines()[-1]["usd"], "0.10")
        with mock.patch("os.fsync", watching_fsync):
            book.settle("r/1", usage(1, 0, 1), receipt())
        self.assertEqual(events, ["fsync", "returned", "fsync"])

    def test_write_before_send_ordering(self):
        """The reservation line is on disk at the moment the request is sent."""
        book = self.book()
        seen = []

        def send(request_id):
            seen.append([line["request_id"] for line in self.lines()
                         if line["event"] == "reserve"])

        for request_id in ("r/1", "r/2"):
            book.reserve(request_id, D("0.10"))
            send(request_id)
            book.settle(request_id, usage(1, 0, 1), receipt())
        self.assertEqual(seen, [["r/1"], ["r/1", "r/2"]])

    def test_damaged_file_stops_all_spending(self):
        book = self.book()
        book.reserve("r/1", D("0.10"))
        with open(self.path, "a", encoding="utf-8") as stream:
            stream.write('{"event": "reserve", "request_id": "r/2", "us')
        with self.assertRaises(ledger.LedgerError) as caught:
            self.book()
        self.assertIn("damaged at line 2", str(caught.exception))

    def test_money_is_stored_as_text_not_float(self):
        book = self.book()
        book.reserve("r/1", D("0.1"))
        self.assertIsInstance(self.lines()[0]["usd"], str)
        self.assertIsInstance(book.spent, Decimal)


class BudgetTests(unittest.TestCase):
    def setUp(self):
        folder = tempfile.TemporaryDirectory()
        self.addCleanup(folder.cleanup)
        self.books = {
            "openai": ledger.ProviderLedger("openai", "1.00",
                                            os.path.join(folder.name, "openai.jsonl")),
            "anthropic": ledger.ProviderLedger("anthropic", "1.00",
                                               os.path.join(folder.name, "anthropic.jsonl")),
        }

    def test_one_ledger_per_provider_shared_by_model_and_judge_calls(self):
        budget = ledger.Budget(self.books, "run1")
        budget.reserve("openai", "run1/m/t/1/1", D("0.60"))
        with self.assertRaises(ledger.CapExceeded):
            budget.reserve("openai", "run1/m/t/1/judge/j/outcome/1", D("0.50"))
        budget.reserve("anthropic", "run1/m/t/1/judge/j2/outcome/1", D("0.50"))
        self.assertEqual(budget.remaining(), {"openai": D("0.40"), "anthropic": D("0.50")})

    def test_max_usd_is_a_lower_cap_for_this_run_across_providers(self):
        budget = ledger.Budget(self.books, "run1", max_usd="0.50")
        budget.reserve("openai", "run1/a", D("0.30"))
        with self.assertRaises(ledger.CapExceeded) as caught:
            budget.reserve("anthropic", "run1/b", D("0.21"))
        self.assertEqual(caught.exception.scope, "max-usd")
        budget.reserve("anthropic", "run1/b", D("0.20"))
        # Settling below the reservation frees room under --max-usd.
        budget.settle("openai", "run1/a", usage(0, 0, 0), receipt())
        budget.reserve("openai", "run1/c", D("0.30"))
        self.assertEqual(budget.run_committed(), D("0.50"))

    def test_max_usd_cannot_raise_a_provider_cap(self):
        budget = ledger.Budget(self.books, "run1", max_usd="100")
        with self.assertRaises(ledger.CapExceeded) as caught:
            budget.reserve("openai", "run1/a", D("1.01"))
        self.assertEqual(caught.exception.scope, "provider")

    def test_earlier_runs_count_against_the_provider_cap_but_not_max_usd(self):
        first = ledger.Budget(self.books, "run1")
        first.reserve("openai", "run1/a", D("0.70"))
        second = ledger.Budget(self.books, "run2", max_usd="0.30")
        self.assertEqual(second.run_committed(), D(0))
        second.reserve("openai", "run2/a", D("0.30"))
        with self.assertRaises(ledger.LedgerError):
            second.reserve("openai", "run1/zzz", D("0.01"))


if __name__ == "__main__":
    unittest.main()
