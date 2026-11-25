"""Tests for scripts/check-model-prices.py (standard library only).

Rule and date-boundary tests run against a fixed fixture
(scripts/fixtures/model-prices.fixture.json, checked 25 Nov 2026) with a
pinned date, so daily data refreshes never change their outcome. The live
data file is checked once, against the real current UTC date.

Run: python scripts/test_check_model_prices.py
"""
import copy
import importlib.util
import json
import unittest
from datetime import date, datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('checker', ROOT / 'scripts' / 'check-model-prices.py')
checker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(checker)

RULES = json.loads((ROOT / 'data' / 'model-price-rules.json').read_text(encoding='utf-8'))
FIXTURE = json.loads((ROOT / 'scripts' / 'fixtures' / 'model-prices.fixture.json').read_text(encoding='utf-8'))
FIXTURE_DAY = date(2026, 11, 25)


def errors_for(mutate):
    data = copy.deepcopy(FIXTURE)
    mutate(data)
    return checker.check(data, RULES, FIXTURE_DAY)[0]


def row(data, row_id):
    return next(r for r in data['rows'] if r['id'] == row_id)


class LiveDataTests(unittest.TestCase):
    def test_live_data_is_valid_today(self):
        live = json.loads((ROOT / 'data' / 'model-prices.json').read_text(encoding='utf-8'))
        today = datetime.now(timezone.utc).date()
        self.assertEqual(checker.check(live, RULES, today)[0], [])


class FixtureRuleTests(unittest.TestCase):
    def test_fixture_is_clean(self):
        self.assertEqual(checker.check(FIXTURE, RULES, FIXTURE_DAY)[0], [])

    def test_rejects_empty_or_wrong_schema(self):
        self.assertTrue(errors_for(lambda d: d.update(rows=[])))
        self.assertTrue(errors_for(lambda d: d.update(schema='model-prices/v1')))
        self.assertTrue(checker.check({}, RULES, FIXTURE_DAY)[0])

    def test_rejects_non_finite_and_bad_values(self):
        for bad in (float('nan'), float('inf'), -1, True, '2', 1e-21):
            self.assertTrue(errors_for(lambda d, b=bad: row(d, 'anthropic:claude-opus-5-5')['prices'].update(input=b)), bad)

    def test_accepts_tiny_finite_rate(self):
        self.assertEqual(errors_for(lambda d: row(d, 'anthropic:claude-opus-5-5')['prices'].update(input=1e-7)), [])

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

    def test_allowance_unit_must_belong_to_provider(self):
        self.assertTrue(errors_for(lambda d: row(d, 'suno:pro')['allowance'].update(unit='Midjourney Fast GPU minutes')))
        self.assertTrue(errors_for(lambda d: row(d, 'midjourney:basic')['allowance'].update(unit='Suno song credits')))

    def test_rejects_unapproved_or_insecure_source(self):
        self.assertTrue(errors_for(lambda d: row(d, 'anthropic:claude-opus-5-5').update(source_url='http://platform.claude.com/x')))
        self.assertTrue(errors_for(lambda d: row(d, 'anthropic:claude-opus-5-5').update(source_url='https://example.com/pricing')))
        self.assertTrue(errors_for(lambda d: row(d, 'anthropic:claude-opus-5-5').update(source_url='javascript:alert(1)')))
        self.assertTrue(errors_for(lambda d: row(d, 'anthropic:claude-opus-5-5').update(source_url='https://docs.x.ai/developers/models')))

    def test_rejects_duplicates_and_bad_dates(self):
        self.assertTrue(errors_for(lambda d: d['rows'].append(copy.deepcopy(d['rows'][0]))))
        self.assertTrue(errors_for(lambda d: d['rows'][0].update(checked_at='2026-13-01')))
        self.assertTrue(errors_for(lambda d: d['rows'][0].update(checked_at='2026-11-26')))
        self.assertTrue(errors_for(lambda d: d['rows'][0].update(effective_from='2026-12-02', effective_to='2026-12-01')))

    def test_stale_uses_calendar_days(self):
        _, stale, _ = checker.check(FIXTURE, RULES, date(2026, 12, 2))
        self.assertEqual(stale, [])
        _, stale, _ = checker.check(FIXTURE, RULES, date(2026, 12, 3))
        self.assertEqual(len(stale), len(FIXTURE['rows']))

    def test_effective_dates_flag_ended_rates(self):
        _, _, expired = checker.check(FIXTURE, RULES, date(2026, 11, 30))
        self.assertEqual(expired, [])
        _, _, expired = checker.check(FIXTURE, RULES, date(2026, 12, 1))
        self.assertEqual(len(expired), 1)
        self.assertIn('google:gemini-4-argon:to-2026-11-30', expired[0])


if __name__ == '__main__':
    unittest.main()
