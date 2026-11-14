"""Public source only; writes a candidate for review, never pushes or publishes."""
import datetime, hashlib, json, subprocess, sys, tempfile, urllib.request
from pathlib import Path
def fetch(url):
    request=urllib.request.Request(url,headers={'User-Agent':'AIRH-source-review/1.0'})
    with urllib.request.urlopen(request,timeout=60) as response: return response.read()
api='https://api.github.com/repos/hiring-lab/ai-tracker/'
head=json.loads(fetch(api+'commits/main'))
commit=head['sha']; vintage=head['commit']['committer']['date'][:10]
checked='bca9fe5176050c03643b86989669778ef671454a'
for file in ['README.md','LICENSE']:
    original=fetch(f'https://raw.githubusercontent.com/hiring-lab/ai-tracker/{checked}/{file}')
    current=fetch(f'https://raw.githubusercontent.com/hiring-lab/ai-tracker/{commit}/{file}')
    if original!=current: raise RuntimeError(f'{file} changed: rights/method review required')
today=datetime.datetime.now(datetime.timezone.utc).date().isoformat()
output=Path(f'data/ai-and-jobs/{today}.json')
if output.exists():
    raise RuntimeError('Snapshot already exists; refusing overwrite')
previous=sorted(Path('data/ai-and-jobs').glob('*.json'))[-1]
with tempfile.TemporaryDirectory() as temporary:
    raw=Path(temporary)/'AI_posting.csv'
    raw.write_bytes(fetch(f'https://raw.githubusercontent.com/hiring-lab/ai-tracker/{commit}/AI_posting.csv'))
    subprocess.run([sys.executable,'scripts/collect-jobs-indeed.py',str(raw),commit,vintage,today,str(output),str(previous)],check=True)
subprocess.run(['node','scripts/validate-ai-and-jobs.mjs',str(output),str(previous)],check=True)
