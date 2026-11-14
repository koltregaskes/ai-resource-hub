"""Standard-library-only daily-use benchmark. Offline unless --live is explicit."""
import argparse
import json
import os
import re
import time
import urllib.request
import hashlib
import math
import subprocess
from statistics import mean
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parent
D = Decimal

def grade(task, text):
    check = task['check']
    expected = check['expected']
    if check['kind'] == 'json':
        try:
            return json.loads(text) == expected
        except ValueError:
            return False
    if check['kind'] == 'rubric':
        limit = 60 if task['category'] == 'email' else 40 if task['category'] == 'summary' else 25
        return len(text.split()) <= limit and all(re.search(r'\b' + re.escape(word) + r'\b', text, re.I) for word in expected)
    return text.strip().casefold() == expected.strip().casefold()

class Budget:
    """Never release reservations: errors and missing usage cannot bypass the cap."""
    def __init__(self, caps):
        self.caps = {k: D(str(v)) for k, v in caps.items()}
        if any(not v.is_finite() or v < 0 for v in self.caps.values()):
            raise ValueError('Invalid cap')
        self.reserved = dict.fromkeys(caps, D(0))

    def reserve(self, provider, amount):
        if self.reserved[provider] + amount > self.caps[provider]:
            return False
        self.reserved[provider] += amount
        return True

def cost(model, inputs, outputs):
    return (D(str(model['input_usd_per_million'])) * inputs + D(str(model['output_usd_per_million'])) * outputs) / D(1000000)

def validate(config):
    seen = set()
    for m in config['models']:
        for setting in ('effort','temperature','system_prompt','shot'):
            if setting not in m:
                raise ValueError('Missing explicit setting')
        if m['system_prompt'] != '' or m['shot'] != 'zero-shot':
            raise ValueError('Only empty system, zero-shot supported')
        if m['provider'] not in ('openai', 'anthropic') or (m['provider'], m['model']) in seen:
            raise ValueError('Invalid or duplicate model')
        seen.add((m['provider'], m['model']))
        for key in ('input_usd_per_million', 'output_usd_per_million'):
            v = D(str(m[key]))
            if not v.is_finite() or v <= 0:
                raise ValueError('Prices must be positive finite ceilings')
        for key in ('context_tokens', 'max_output_tokens'):
            if type(m[key]) is not int or m[key] <= 0:
                raise ValueError('Token bounds must be positive integers')
        if m['max_output_tokens'] > m['context_tokens']:
            raise ValueError('Output exceeds context')
    return config

def request_json(url, headers, body):
    # Fixed HTTPS endpoints, no redirects, no retries, no proxy credentials.
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *args, **kwargs):
            return None
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())
    req = urllib.request.Request(url, json.dumps(body).encode(), headers | {'Content-Type': 'application/json'})
    with opener.open(req, timeout=90) as response:
        return json.load(response)

def complete(model, prompt):
    provider = model['provider']
    key = os.environ.get('OPENAI_API_KEY' if provider == 'openai' else 'ANTHROPIC_API_KEY')
    if not key:
        raise RuntimeError('Missing process environment key')
    body = dict(model=model['model'], messages=[dict(role='user', content=prompt)])
    start = time.perf_counter()
    if provider == 'openai':
        body['max_completion_tokens'] = model['max_output_tokens']
        r = request_json('https://api.openai.com/v1/chat/completions', {'Authorization': 'Bearer ' + key}, body)
        text = r['choices'][0]['message']['content']
        inputs, outputs = r['usage']['prompt_tokens'], r['usage']['completion_tokens']
    else:
        body['max_tokens'] = model['max_output_tokens']
        r = request_json('https://api.anthropic.com/v1/messages', {'x-api-key': key, 'anthropic-version': '2023-06-01'}, body)
        text = ''.join(b['text'] for b in r['content'] if b['type'] == 'text')
        inputs, outputs = r['usage']['input_tokens'], r['usage']['output_tokens']
    # Never persist raw provider responses or echoed credentials.
    for name in ('OPENAI_API_KEY', 'ANTHROPIC_API_KEY'):
        secret = os.environ.get(name)
        if secret:
            text = text.replace(secret, '[REDACTED]')
    if any(type(n) is not int or n < 0 for n in (inputs, outputs)):
        raise ValueError('Invalid usage')
    if inputs > model['context_tokens'] or outputs > model['max_output_tokens']:
        raise ValueError('Usage exceeded configured bounds')
    return dict(text=text, input_tokens=inputs, output_tokens=outputs, latency_ms=round((time.perf_counter()-start)*1000, 3))

RETRY_POLICY = {'transport_retries': 2, 'other_retries': 0}

def with_retries(call):
    """Transport only; no retries for HTTP status, format, refusal or grading."""
    import urllib.error
    for attempt in range(3):
        try:
            return call(), attempt
        except urllib.error.HTTPError:
            raise
        except (TimeoutError, ConnectionError, urllib.error.URLError):
            if attempt == 2:
                raise

def interval(success, total):
    if not total:
        return [0, 1]
    z=1.959963984540054; p=success/total
    centre=(p+z*z/(2*total))/(1+z*z/total)
    radius=z*math.sqrt(p*(1-p)/total+z*z/(4*total*total))/(1+z*z/total)
    return [max(0,centre-radius), min(1,centre+radius)]

def score(task, response):
    text=response.get('text','')
    if response.get('error') or not isinstance(text,str) or not text.strip():
        return 'wrong', False
    abstained=text.strip().casefold().rstrip('.') in ("i don't know",'i do not know')
    passed=bool(grade(task,text))
    return ('abstained' if abstained else 'correct' if passed else 'wrong'), passed

def guard_live():
    # Child provenance cannot be established by a self-asserted environment flag.
    # Until the owner supplies the wrapper contract, fail closed BEFORE any call.
    raise RuntimeError('Live disabled: credit-key wrapper provenance is not verified')

def run(config, out, live=False, max_usd='20', repeats=None):
    if live:
        guard_live()
    validate(config)
    repeats=config['repeats'] if repeats is None else repeats
    if type(repeats) is not int or repeats < 1:
        raise ValueError('Invalid repeats')
    global_cap=D(str(max_usd))
    if not global_cap.is_finite() or global_cap < 0:
        raise ValueError('Invalid total cap')
    tasks=json.loads((ROOT/'public/tasks.json').read_text())
    fixtures=json.loads((ROOT/'fixtures.json').read_text())
    budget=Budget(config['caps_usd'])
    estimate=sum((cost(m,m['context_tokens'],m['max_output_tokens'])*len(tasks)*repeats*3 for m in config['models']),D(0))
    print(f'Pre-flight worst-case reservation USD {estimate}; total cap USD {global_cap}; mode dry-run; no network')
    # Three transport attempts are fully reserved, even though fixtures need none.
    rows=[]; stopped=set(); reserved=D(0)
    for model in config['models']:
        provider=model['provider']
        for task in tasks:
            for repeat in range(1,repeats+1):
                amount=cost(model,model['context_tokens'],model['max_output_tokens'])*3
                if provider in stopped:
                    continue
                if reserved+amount>global_cap or not budget.reserve(provider,amount):
                    stopped.add(provider)
                    continue
                reserved+=amount
                response=fixtures[task['id']].copy()
                outcome,passed=score(task,response)
                model_cost=cost(model,response.get('input_tokens',0),response.get('output_tokens',0))
                verdicts=[]
                if task['grader']=='rubric':
                    for judge in config['judge_panel']:
                        recorded=response['judges'][judge['model']]
                        verdicts.append(dict(**judge,source='recorded-fixture',checklist=recorded['checklist'],passed=all(c['passed'] for c in recorded['checklist']),cost_usd='0',simulated_cost_usd=recorded['simulated_cost_usd']))
                    passed=all(v['passed'] for v in verdicts)
                rows.append(dict(provider=provider,model_id=model['model'],effort=model['effort'],temperature=model['temperature'],max_output_tokens=model['max_output_tokens'],system_prompt='',shot='zero-shot',task=task['id'],repeat=repeat,grader=task['grader'],input=task['prompt'],output=response.get('text',''),outcome=outcome,passed=passed,honesty_score=(-2 if outcome=='wrong' else 0 if outcome=='abstained' else 1) if task['honesty'] else None,input_tokens=response.get('input_tokens'),output_tokens=response.get('output_tokens'),reasoning_tokens=None,token_source='fixture',ttft_ms=None,ttft_status='not recorded in fixture',total_time_ms=response.get('latency_ms'),model_cost_usd='0',simulated_model_cost_usd=str(model_cost),judge_cost_usd='0',judges=verdicts,retry_policy=RETRY_POLICY,retries_used=0,error=response.get('error')))
    summaries=[]
    for m in config['models']:
        subset=[r for r in rows if r['provider']==m['provider'] and r['model_id']==m['model']]
        count=len(subset); successes=sum(r['passed'] for r in subset)
        summaries.append(dict(provider=m['provider'],model_id=m['model'],attempts=count,correct=sum(r['outcome']=='correct' for r in subset),wrong=sum(r['outcome']=='wrong' for r in subset),abstained=sum(r['outcome']=='abstained' for r in subset),passed=successes,pass_rate=successes/count if count else None,interval_95=interval(successes,count),model_cost_usd='0',judge_cost_usd='0',cost_per_task_usd='0' if count else None,cost_per_successful_task_usd='0' if successes else None,simulated_model_cost_usd=str(sum((D(r['simulated_model_cost_usd']) for r in subset),D(0)))))
    comparisons=[]
    for i,a in enumerate(summaries):
        for b in summaries[i+1:]:
            comparisons.append(dict(models=[a['model_id'],b['model_id']],not_separable=max(a['interval_95'][0],b['interval_95'][0])<=min(a['interval_95'][1],b['interval_95'][1])))
    commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    result=dict(mode='dry-run',git_commit=commit,task_set_version=config['task_set_version'],repeats=repeats,retry_policy=RETRY_POLICY,preflight_usd=str(estimate),caps_usd=config['caps_usd'],max_usd=str(global_cap),reserved_usd={k:str(v) for k,v in budget.reserved.items()},stopped=sorted(stopped),rows=rows,summary=summaries,comparisons=comparisons,config=config)
    # Run directories are single-write snapshots: no overwrite or resume path.
    out.mkdir(parents=True,exist_ok=False)
    (out/'results.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    (out/'public-tasks.json').write_text(json.dumps(tasks,indent=2)+'\n',encoding='utf-8')
    (out/'report.md').write_text('# Fixture-only daily-use report\n\n'+f'{sum(r["passed"] for r in rows)}/{len(rows)} passed. Actual model and judge spend: USD 0.\n\n'+'Synthetic fixture results validate plumbing, not model quality. Wilson 95% intervals treat attempts as independent; repeated tasks are correlated. See results.json for outcomes, costs, timings and overlap comparisons.\n\nMethod: ../../../../docs/DAY-TO-DAY-BENCH-METHOD.md\n',encoding='utf-8')
    hashes={f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in out.iterdir()}
    hashes['harness.py']=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    hashes['fixtures.json']=hashlib.sha256((ROOT/'fixtures.json').read_bytes()).hexdigest()
    (out/'manifest.json').write_text(json.dumps(dict(git_commit=commit,task_set_version=config['task_set_version'],sha256=hashes),indent=2)+'\n')
    for f in out.iterdir():
        f.chmod(0o444)
    return result

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--config',type=Path,default=ROOT/'config.fixture.json')
    parser.add_argument('--out',type=Path,required=True)
    parser.add_argument('--dry-run',action='store_true')
    parser.add_argument('--live',action='store_true')
    parser.add_argument('--max-usd',default='20')
    parser.add_argument('--repeats',type=int)
    args=parser.parse_args()
    if args.live and args.dry_run:
        parser.error('Choose one mode')
    result=run(json.loads(args.config.read_text()),args.out,args.live,args.max_usd,args.repeats)
    return 0 if not result['stopped'] and all(r['passed'] for r in result['rows']) else 1

if __name__=='__main__':
    try:
        raise SystemExit(main())
    except Exception:
        print('Run refused or failed; sensitive error details suppressed.')
        raise SystemExit(2)

