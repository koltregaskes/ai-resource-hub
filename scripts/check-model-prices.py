"""Validate data/model-prices.json (standard library only).

Checks: required fields, ISO checked_at dates (not in the future), https
source URLs, known units and statuses, numeric prices, verified rows carry
at least one price, unverified rows explain why, and no duplicate rows.
Rows older than stale_after_days (default 7) are flagged as stale.

Usage: python scripts/check-model-prices.py [path] [--today YYYY-MM-DD] [--fail-on-stale]
Exit code 1 on any error (or on stale rows with --fail-on-stale).
"""
import json
import sys
from collections import Counter
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

REQUIRED = ['id', 'provider', 'product', 'unit', 'prices', 'currency',
            'source_url', 'checked_at', 'status', 'notes']
STATUSES = {'verified', 'unverified'}


def main(argv):
    args = list(argv)
    today = date.today()
    fail_on_stale = '--fail-on-stale' in args
    if fail_on_stale:
        args.remove('--fail-on-stale')
    if '--today' in args:
        i = args.index('--today')
        today = date.fromisoformat(args[i + 1])
        del args[i:i + 2]
    path = Path(args[0]) if args else Path(__file__).resolve().parent.parent / 'data' / 'model-prices.json'

    data = json.loads(path.read_text(encoding='utf-8'))
    units = set(data.get('units', {}))
    stale_days = int(data.get('stale_after_days', 7))
    rows = data.get('rows', [])
    errors, stale = [], []
    ids = Counter(r.get('id') for r in rows)
    keys = Counter((r.get('provider'), r.get('model_id'), r.get('unit'), r.get('variant')) for r in rows)

    for n, row in enumerate(rows):
        label = row.get('id') or f'row {n}'
        for field in REQUIRED:
            if field not in row or row[field] is None or (field != 'notes' and row[field] == ''):
                errors.append(f'{label}: missing {field}')
        if ids[row.get('id')] > 1:
            errors.append(f'{label}: duplicate id')
        key = (row.get('provider'), row.get('model_id'), row.get('unit'), row.get('variant'))
        if keys[key] > 1:
            errors.append(f'{label}: duplicate provider/model/unit/variant')
        if units and row.get('unit') not in units:
            errors.append(f'{label}: unknown unit {row.get("unit")!r}')
        if row.get('status') not in STATUSES:
            errors.append(f'{label}: status must be verified or unverified')
        url = urlparse(str(row.get('source_url', '')))
        if url.scheme != 'https' or not url.netloc:
            errors.append(f'{label}: source_url must be an https URL')
        try:
            checked = date.fromisoformat(str(row.get('checked_at')))
        except ValueError:
            errors.append(f'{label}: checked_at is not an ISO date')
        else:
            if checked > today:
                errors.append(f'{label}: checked_at is in the future')
            elif (today - checked).days > stale_days:
                stale.append(f'{label}: checked {checked}, {(today - checked).days} days old')
        prices = row.get('prices')
        if not isinstance(prices, dict) or not prices:
            errors.append(f'{label}: prices must be a non-empty object')
            continue
        for k, v in prices.items():
            if v is not None and (isinstance(v, bool) or not isinstance(v, (int, float)) or v < 0):
                errors.append(f'{label}: price {k} must be a non-negative number or null')
        if row.get('status') == 'verified' and all(v is None for v in prices.values()):
            errors.append(f'{label}: verified row has no prices')
        if row.get('status') == 'unverified' and not str(row.get('notes', '')).strip():
            errors.append(f'{label}: unverified row needs a reason in notes')

    by_provider = {}
    for row in rows:
        counts = by_provider.setdefault(row.get('provider'), Counter())
        counts[row.get('status')] += 1
    print(f'{path.name}: {len(rows)} rows, checked against {today}')
    for provider, counts in by_provider.items():
        print(f'  {provider}: {counts["verified"]} verified, {counts["unverified"]} unverified')
    total = Counter(r.get('status') for r in rows)
    print(f'  total: {total["verified"]} verified, {total["unverified"]} unverified')
    for line in stale:
        print(f'STALE {line}')
    for line in errors:
        print(f'ERROR {line}')
    print(f'{len(errors)} errors, {len(stale)} stale rows (over {stale_days} days)')
    return 1 if errors or (fail_on_stale and stale) else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
