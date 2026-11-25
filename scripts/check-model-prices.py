"""Validate data/model-prices.json against data/model-price-rules.json.

Standard library only. Runs before every `npm run build` (prebuild).

Checks: expected schema and a non-empty row list; required fields; known
unit, the unit's currency and only the unit's price keys; finite
non-negative numbers; one rate_status per price, with verified rates
non-empty and unverified rates left empty; allowances only on units that
allow them, with a known unit, period and status; a row status that matches
its rates; https sources on the provider's approved hosts; ISO dates that
are not in the future; ordered effective dates; no duplicate rows.
Rows checked more than stale_after_days calendar days ago (UTC) are flagged.

Usage: python scripts/check-model-prices.py [data.json] [--rules rules.json]
                                             [--today YYYY-MM-DD] [--fail-on-stale]
Exit code 1 on any error (or on stale rows with --fail-on-stale).
"""
import json
import math
import sys
from collections import Counter
from datetime import date, datetime, timezone
from decimal import Decimal
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
REQUIRED = ['id', 'provider', 'product', 'model_id', 'unit', 'variant', 'prices', 'rate_status',
            'currency', 'source_url', 'checked_at', 'status', 'notes']
OPTIONAL = {'category', 'effective_from', 'effective_to', 'allowance', 'unresolved_observations'}


MAX_DECIMALS = 20  # the page can show up to 20 decimal places without rounding


def is_number(value):
    if not isinstance(value, (int, float)) or isinstance(value, bool) or not math.isfinite(value) or value < 0:
        return False
    return -min(0, Decimal(repr(value)).as_tuple().exponent) <= MAX_DECIMALS


def parse_date(value):
    try:
        return date.fromisoformat(value) if isinstance(value, str) and len(value) == 10 else None
    except ValueError:
        return None


def check(data, rules, today):
    errors, stale, expired = [], [], []
    if not isinstance(data, dict) or data.get('schema') != rules['data_schema']:
        return [f"schema must be {rules['data_schema']!r}"], stale, expired
    stale_days = data.get('stale_after_days')
    if not isinstance(stale_days, int) or isinstance(stale_days, bool) or stale_days < 1:
        errors.append('stale_after_days must be a positive integer')
        stale_days = 7
    try:
        datetime.fromisoformat(str(data.get('generated_at')).replace('Z', '+00:00'))
    except ValueError:
        errors.append('generated_at must be an ISO date-time')
    rows = data.get('rows')
    if not isinstance(rows, list) or not rows:
        return errors + ['rows must be a non-empty list'], stale, expired

    units, statuses = rules['units'], set(rules['statuses'])
    hosts = rules['source_hosts']
    ids = Counter(r.get('id') for r in rows if isinstance(r, dict))
    keys = Counter((r.get('provider'), r.get('model_id'), r.get('unit'), r.get('variant'), r.get('effective_from'))
                   for r in rows if isinstance(r, dict))

    for n, row in enumerate(rows):
        if not isinstance(row, dict):
            errors.append(f'row {n}: not an object')
            continue
        label = row.get('id') or f'row {n}'
        for field in REQUIRED:
            value = row.get(field)
            if value is None or (isinstance(value, str) and field != 'notes' and not value.strip()):
                errors.append(f'{label}: missing {field}')
        unknown = set(row) - set(REQUIRED) - OPTIONAL
        if unknown:
            errors.append(f'{label}: unknown fields {sorted(unknown)}')
        if ids[row.get('id')] > 1:
            errors.append(f'{label}: duplicate id')
        if keys[(row.get('provider'), row.get('model_id'), row.get('unit'), row.get('variant'), row.get('effective_from'))] > 1:
            errors.append(f'{label}: duplicate provider/model/unit/variant/effective_from')

        spec = units.get(row.get('unit'))
        if spec is None:
            errors.append(f'{label}: unknown unit {row.get("unit")!r}')
            continue
        if row.get('currency') != spec['currency']:
            errors.append(f'{label}: currency must be {spec["currency"]!r} for {row["unit"]}')

        prices, rate_status = row.get('prices'), row.get('rate_status')
        if not isinstance(prices, dict) or not prices:
            errors.append(f'{label}: prices must be a non-empty object')
            prices = {}
        if not isinstance(rate_status, dict):
            rate_status = {}
        bad_keys = set(prices) - set(spec['price_keys'])
        if bad_keys:
            errors.append(f'{label}: price keys {sorted(bad_keys)} not valid for {row["unit"]}')
        if set(rate_status) != set(prices):
            errors.append(f'{label}: rate_status must have exactly one entry per price')
        rate_ok = []
        for key, value in prices.items():
            state = rate_status.get(key)
            if value is not None and not is_number(value):
                errors.append(f'{label}: price {key} must be a finite non-negative number or null')
            if state not in statuses:
                errors.append(f'{label}: rate_status {key} must be verified or unverified')
            elif state == 'verified' and value is None:
                errors.append(f'{label}: verified rate {key} has no value')
            elif state == 'unverified' and value is not None:
                errors.append(f'{label}: unverified rate {key} must be left empty (record it in unresolved_observations)')
            rate_ok.append(state == 'verified')

        allowance = row.get('allowance')
        if allowance is not None:
            if not spec.get('allowance'):
                errors.append(f'{label}: unit {row["unit"]} does not take an allowance')
            elif not isinstance(allowance, dict):
                errors.append(f'{label}: allowance must be an object')
            else:
                if allowance.get('unit') not in rules['allowance_units'].get(row.get('provider'), []):
                    errors.append(f'{label}: allowance unit {allowance.get("unit")!r} is not valid for {row.get("provider")!r}')
                if allowance.get('period') not in rules['allowance_periods']:
                    errors.append(f'{label}: allowance period must be one of {rules["allowance_periods"]}')
                amount, state = allowance.get('amount'), allowance.get('status')
                if amount is not None and not is_number(amount):
                    errors.append(f'{label}: allowance amount must be a finite non-negative number or null')
                if state not in statuses:
                    errors.append(f'{label}: allowance status must be verified or unverified')
                elif (state == 'verified') != (amount is not None):
                    errors.append(f'{label}: allowance amount must be set if and only if it is verified')
                rate_ok.append(state == 'verified')

        expected = 'verified' if rate_ok and all(rate_ok) else 'unverified'
        if row.get('status') != expected:
            errors.append(f'{label}: status must be {expected!r} to match its rates')
        if row.get('status') == 'unverified' and not str(row.get('notes', '')).strip():
            errors.append(f'{label}: unverified row needs a reason in notes')
        observations = row.get('unresolved_observations')
        if observations is not None and (not isinstance(observations, list) or not observations
                                         or not all(isinstance(o, str) and o.strip() for o in observations)):
            errors.append(f'{label}: unresolved_observations must be a non-empty list of strings')

        url = urlparse(str(row.get('source_url', '')))
        if url.scheme != 'https' or not url.netloc or url.username or url.password or url.port:
            errors.append(f'{label}: source_url must be a plain https URL')
        elif url.hostname not in hosts.get(row.get('provider'), []):
            errors.append(f'{label}: source host {url.hostname!r} is not approved for {row.get("provider")!r}')

        checked = parse_date(row.get('checked_at'))
        if checked is None:
            errors.append(f'{label}: checked_at is not an ISO date')
        elif checked > today:
            errors.append(f'{label}: checked_at is in the future')
        elif (today - checked).days > stale_days:
            stale.append(f'{label}: checked {checked}, {(today - checked).days} days ago')
        start, end = row.get('effective_from'), row.get('effective_to')
        start_d, end_d = parse_date(start), parse_date(end)
        if start is not None and start_d is None:
            errors.append(f'{label}: effective_from is not an ISO date')
        if end is not None and end_d is None:
            errors.append(f'{label}: effective_to is not an ISO date')
        if start_d and end_d and start_d > end_d:
            errors.append(f'{label}: effective_from is after effective_to')
        if end_d and end_d < today:
            expired.append(f'{label}: rate ended {end_d}; the page hides it')
    return errors, stale, expired


def main(argv):
    args = list(argv)
    fail_on_stale = '--fail-on-stale' in args
    if fail_on_stale:
        args.remove('--fail-on-stale')
    today = datetime.now(timezone.utc).date()
    rules_path = ROOT / 'data' / 'model-price-rules.json'
    for flag in ('--today', '--rules'):
        if flag in args:
            i = args.index(flag)
            if flag == '--today':
                today = date.fromisoformat(args[i + 1])
            else:
                rules_path = Path(args[i + 1])
            del args[i:i + 2]
    path = Path(args[0]) if args else ROOT / 'data' / 'model-prices.json'

    try:
        data = json.loads(path.read_text(encoding='utf-8'))
        rules = json.loads(rules_path.read_text(encoding='utf-8'))
    except (OSError, ValueError) as exc:
        print(f'ERROR cannot read price data or rules: {exc}')
        return 1
    errors, stale, expired = check(data, rules, today)

    rows = data.get('rows') if isinstance(data, dict) and isinstance(data.get('rows'), list) else []
    print(f'{path.name}: {len(rows)} rows, checked against {today} (UTC)')
    by_provider = {}
    for row in rows:
        if isinstance(row, dict):
            by_provider.setdefault(row.get('provider'), Counter())[row.get('status')] += 1
    for provider, counts in by_provider.items():
        print(f'  {provider}: {counts["verified"]} verified, {counts["unverified"]} unverified')
    for line in expired:
        print(f'EXPIRED {line}')
    for line in stale:
        print(f'STALE {line}')
    for line in errors:
        print(f'ERROR {line}')
    print(f'{len(errors)} errors, {len(stale)} stale rows')
    return 1 if errors or (fail_on_stale and stale) else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
