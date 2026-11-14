"""Pinned public CSV -> append-only review candidate. No keys, environment or network calls."""
import csv, json, hashlib, sys
from pathlib import Path

raw, commit, vintage, retrieved, output, *previous_paths = sys.argv[1:]
if len(commit) != 40 or any(c not in '0123456789abcdef' for c in commit):
    raise ValueError('Expected full upstream commit')
content = Path(raw).read_bytes()
rows = list(csv.DictReader(content.decode('utf-8-sig').splitlines()))
if set(rows[0]) != {'date', 'jobcountry', 'AI_share_postings'}:
    raise ValueError('Upstream schema changed; review required')
url = f'https://github.com/hiring-lab/ai-tracker/blob/{commit}/AI_posting.csv'
method_commit = 'bca9fe5176050c03643b86989669778ef671454a'
method = f'https://github.com/hiring-lab/ai-tracker/blob/{method_commit}/README.md'
data = {key: [] for key in ['jobs_rights','jobs_sources','jobs_series','jobs_series_versions','jobs_observations','jobs_studies','jobs_study_results','jobs_company_claims']}
data.update({'retrieved_at':retrieved,'upstream_commit':commit,'raw_sha256':hashlib.sha256(content).hexdigest(),
    'selection':'Latest daily observation per country plus the observation on the same date one year earlier, if available. These are selected daily snapshots, not monthly means.'})
data['jobs_rights'] = [{'id':'indeed-ai-tracker','scope':'dataset','covers':'hiring-lab/ai-tracker:AI_posting.csv',
    'licence':'CC BY 4.0','licence_url':f'https://github.com/hiring-lab/ai-tracker/blob/{method_commit}/LICENSE',
    'attribution_text':'Source: Indeed Hiring Lab. Licensed under CC BY 4.0. Selected observations; formatting adapted by AIRH.',
    'commercial_use':'allowed','verified_on':'2026-11-14','verified_by':'Codex worker B2','evidence_url':method,'status':'confirmed'}]
data['jobs_sources'] = [{'id':'indeed','publisher':'Indeed Hiring Lab','name':'Indeed AI Tracker','source_type':'job_postings','rights_id':'indeed-ai-tracker',
    'access_route':url,'method_url':method,'refresh_cadence_days':30}]
for country in sorted(set(r['jobcountry'] for r in rows)):
    own = sorted([r for r in rows if r['jobcountry']==country],key=lambda r:r['date'])
    latest = own[-1]
    prior_date = str(int(latest['date'][:4])-1)+latest['date'][4:]
    selected = [r for r in own if r['date'] in (latest['date'],prior_date)]
    series_id = f'indeed-ai-{country.lower()}'
    version_id = series_id+'-keywords-v1'
    data['jobs_series'].append({'id':series_id,'source_id':'indeed','title':'Share of AI job postings','geography':country,
        'unit':'percent of Indeed job postings','frequency':'daily','averaging_window_days':7,'kind':'measured','rights_id':'indeed-ai-tracker'})
    data['jobs_series_versions'].append({'id':version_id,'series_id':series_id,'version_label':'Published keyword method, read 2026-11-14',
        'valid_from':own[0]['date'],'valid_to':None,'backcast_of':None,'backcast_periods':None,'question_wording':None,'questionnaire_url':None,
        'population':f'Job postings on Indeed in {country}; not the whole labour market',
        'definition':'Share of postings mentioning AI-related keywords. Seven-day trailing average.',
        'methodology_version':'AI Tracker README at '+method_commit,'methodology_url':method})
    for r in selected:
        value = float(r['AI_share_postings'])
        if not 0 <= value <= 100: raise ValueError('Invalid percentage')
        data['jobs_observations'].append({'series_version_id':version_id,'period':r['date'],'value':value,
            'standard_error':None,'relative_standard_error':None,'interval_lower':None,'interval_upper':None,'interval_type':None,'confidence_level':None,
            'uncertainty_status':'not_published','status':'provisional','vintage':vintage,'retrieved_at':retrieved,'source_url':url})
destination = Path(output)
if previous_paths:
    previous = json.loads(Path(previous_paths[0]).read_text(encoding='utf-8'))
    old_versions={row['id']:row for row in previous['jobs_series_versions']}
    for version in data['jobs_series_versions']:
        if version['id'] in old_versions and version!=old_versions[version['id']]:
            raise ValueError('Method changed; explicitly version before appending')
    for old in previous['jobs_series_versions']:
        if old not in data['jobs_series_versions']: data['jobs_series_versions'].append(old)
    old_rows={(r['series_version_id'],r['period'],r['vintage']):r for r in previous['jobs_observations']}
    new_rows=[]
    for row in data['jobs_observations']:
        key=(row['series_version_id'],row['period'],row['vintage'])
        if key in old_rows:
            old=old_rows[key]
            if any(row[k]!=old[k] for k in row if k not in ['retrieved_at','source_url']):
                raise ValueError('Same-vintage observation changed; explicit revision required')
        else:
            new_rows.append(row)
    data['jobs_observations']=previous['jobs_observations']+new_rows
    if any(v not in data['jobs_series_versions'] for v in previous['jobs_series_versions']):
        raise ValueError('Method changed; explicitly version before appending')
else:
    destination.parent.mkdir(parents=True,exist_ok=True)
with destination.open('x',encoding='utf-8') as handle:
    handle.write(json.dumps(data,indent=2)+'\n')
print(f'Candidate: {len(data["jobs_series"])} country series, {len(data["jobs_observations"])} observations')
