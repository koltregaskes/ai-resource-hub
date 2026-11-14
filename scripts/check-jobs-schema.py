import json, sqlite3, subprocess, sys, tempfile
from pathlib import Path
db=sqlite3.connect(':memory:')
db.executescript(Path('scripts/schema/ai-and-jobs.sql').read_text())
data=json.loads(Path('data/ai-and-jobs/2026-11-14.json').read_text())
for table in ['jobs_rights','jobs_sources','jobs_series','jobs_series_versions','jobs_observations','jobs_studies','jobs_study_results','jobs_company_claims']:
    for row in data[table]:
        values=[json.dumps(v) if isinstance(v,(list,dict)) else v for v in row.values()]
        db.execute(f'INSERT INTO {table} ({",".join(row)}) VALUES ({",".join("?" for _ in row)})',values)
try:
    db.execute('UPDATE jobs_observations SET value=0')
except sqlite3.IntegrityError:
    pass
else:
    raise AssertionError('Observation history could be overwritten')
assert not db.execute('PRAGMA foreign_key_check').fetchall()
print('SQLite schema, snapshot import, foreign keys and immutability verified')
temporary=Path(tempfile.mkdtemp(prefix='airh-jobs-import-check-'))
raw=temporary/'sample.csv'
raw.write_text('date,jobcountry,AI_share_postings\n2025-09-30,GB,3\n2026-09-30,GB,4\n')
first=temporary/'first.json';second=temporary/'second.json';third=temporary/'third.json'
base=[sys.executable,'scripts/collect-jobs-indeed.py',str(raw),'bca9fe5176050c03643b86989669778ef671454a']
subprocess.run(base+['2026-10-08','2026-11-14',str(first)],check=True)
subprocess.run(base+['2026-10-08','2026-11-15',str(second),str(first)],check=True)
assert json.loads(second.read_text())['jobs_observations']==json.loads(first.read_text())['jobs_observations']
subprocess.run(base+['2026-11-08','2026-11-16',str(third),str(second)],check=True)
assert len(json.loads(third.read_text())['jobs_observations'])==4
subprocess.run(['node','scripts/validate-ai-and-jobs.mjs',str(third),str(second)],check=True)
print('Repeated fetch preserves observations; new vintage appends without overwriting')
