"""Tests for scripts/check-model-prices.py (standard library only).

Run: python scripts/test_check_model_prices.py
"""
import copy
import importlib.util
import json
import unittest
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('checker', ROOT / 'scripts' / 'check-model-prices.py')
checker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(checker)

DATA = json.loads((ROOT / 'data' / 'model-prices.json').read_text(encoding='utf-8'))
RULES = json.loads((ROOT / 'data' / 'model-price-rules.json').read_text(encoding='utf-8'))
TODAY = date(2026, 11, 25)


def errors_for(mutate):
    data = copy.deepcopy(DATA)
    mutate(data)
    return checker.check(data, RULES, TODAY)[0]


def row(data, row_id):
    return next(r for r in data['rows'] if r['id'] == row_id)


class CheckerTests(unittest.TestCase):
    def test_shipped_data_is_clean(self):
        self.assertEqual(checker.check(DATA, RULES, TODAY)[0], [])

    def test_rejects_empty_or_wrong_schema(self):
        self.assertTrue(errors_for(lambda d: d.update(rows=[])))
        self.assertTrue(errors_for(lambda d: d.update(schema='model-prices/v1')))
        self.assertTrue(checker.check({}, RULES, TODAY)[0])

    def test_rejects_non_finite_and_bad_values(self):
        for bad in (float('nan'), float('inf'), -1, True, '2'):
            self.assertTrue(errors_for(lambda d, b=bad: row(d, 'anthropic:claude-opus-5-5')['prices'].update(input=b)), bad)

    def test_rejects_key_not_valid_for_unit(self):
        self.assertTrue(errors_for(lambda d: row(d, 'anthropic:claude-opus-5-5')['prices'].update(per_image=1)))

    def test_rejects_wrong_currency(self):
        self.assertTrue(errors_for(lambda d: row(d, 'suno:credits-per-song').update(currency='USD')))

    def test_unverified_rate_must_stay_empty(self):
        self.assertTrue(errors_for(lambda d: row(d, 'krea:basic')['prices'].update(monthly_billing_per_month=5.25)))

    def test_status_must_match_rates(self):
        self.assertTrue(errors_for(lambda d: row(d, 'elevenlabs:creator').update(status='verified')))

    def test_rejects_bad_allowance(self):
        self.assertTrue(errors_for(lambda d: row(d, 'suno:pro')['allowance'].update(period='week')))
        self.assertTrue(errors_for(lambda d: row(d, 'suno:pro')['allowance'].update(unit='credits')))
        self.assertTrue(errors_for(lambda d: row(d, 'anthropic:claude-opus-5-5').update(
            allowance={'amount': 1, 'unit': 'ElevenLabs credits', 'period': 'month', 'status': 'verified'})))

    def test_rejects_unapproved_or_insecure_source(self):
        self.assertTrue(errors_for(lambda d: row(d, 'anthropic:claude-opus-5-5').update(source_url='http://platform.claude.com/x')))
        self.assertTrue(errors_for(lambda d: row(d, 'anthropic:claude-opus-5-5').update(source_url='https://example.com/pricing')))
        self.assertTrue(errors_for(lambda d: row(d, 'anthropic:claude-opus-5-5').update(source_url='javascript:alert(1)')))

    def test_rejects_duplicates_and_bad_dates(self):
        self.assertTrue(errors_for(lambda d: d['rows'].append(copy.deepcopy(d['rows'][0]))))
        self.assertTrue(errors_for(lambda d: d['rows'][0].update(checked_at='2026-13-01')))
        self.assertTrue(errors_for(lambda d: d['rows'][0].update(checked_at='2026-11-26')))
        self.assertTrue(errors_for(lambda d: d['rows'][0].update(effective_from='2026-12-02', effective_to='2026-12-01')))

    def test_stale_uses_calendar_days(self):
        _, stale, _ = checker.check(DATA, RULES, date(2026, 12, 2))
        self.assertEqual(stale, [])
        _, stale, _ = checker.check(DATA, RULES, date(2026, 12, 3))
        self.assertEqual(len(stale), len(DATA['rows']))


if __name__ == '__main__':
    unittest.main()
