"""Standard-library-only daily-use benchmark. Offline unless --live is explicit."""
import argparse
import json
import os
import re
import time
import urllib.request
import hashlib
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path

ATTEMPT_TIMEOUT_SECONDS = 120
MAX_OUTPUT_TOKENS = 4096
ROOT = Path(__file__).resolve().parent
D = Decimal
from contracts import (
    METHOD_REF, IMPLEMENTATION_BASE, METHOD_PENDING, FAMILIES, DECLINES, REFUSALS,
    Ledger, MissingKey, load_keys, key_names, refuse_ambient_keys, ensure_no_secrets,
    output_limit, public_record, load_private_tasks, coverage, report,
)

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
    if check.get('case_sensitive', True):
        return text.strip() == expected.strip()
    return text.strip().casefold() == expected.strip().casefold()

def cost(model, inputs, outputs):
    return (D(str(model['input_usd_per_million'])) * inputs + D(str(model['output_usd_per_million'])) * outputs) / D(1000000)

def validate(config):
    seen = set()
    if not config['models'] or not config['judge_panel']:
        raise ValueError('Models and fixture judges required')
    for m in config['models'] + config['judge_panel']:
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
        if m['max_output_tokens'] != MAX_OUTPUT_TOKENS:
            raise ValueError('Model default must be 4096; long tasks opt in explicitly')
        if m['effort'] != 'provider_default' or m['temperature'] != 'provider_default':
            raise ValueError('Method requires explicit provider_default settings')
        if m['max_output_tokens'] > m['context_tokens']:
            raise ValueError('Output exceeds context')
    key_names(config)
    return config

def _request_json_sync(url, headers, body):
    # Fixed HTTPS endpoints, no redirects, no retries, no proxy credentials.
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *args, **kwargs):
            return None
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())
    req = urllib.request.Request(url, json.dumps(body).encode(), headers | {'Content-Type': 'application/json'})
    with opener.open(req, timeout=ATTEMPT_TIMEOUT_SECONDS) as response:
        return json.load(response)

def _request_worker(pipe, url, headers, body):
    import urllib.error
    try:
        pipe.send(('ok',_request_json_sync(url,headers,body)))
    except TimeoutError:
        pipe.send(('timeout',None))
    except urllib.error.HTTPError as error:
        pipe.send(('http',error.code))
    except urllib.error.URLError as error:
        pipe.send(('timeout' if isinstance(error.reason,TimeoutError) else 'connection',None))
    except Exception:
        pipe.send(('invalid',None))
    finally:
        pipe.close()

def request_json(url, headers, body):
    """Hard wall-clock deadline, including connect and reading the whole response."""
    import multiprocessing
    import urllib.error
    context=multiprocessing.get_context('spawn')
    parent,child=context.Pipe(duplex=False)
    worker=context.Process(target=_request_worker,args=(child,url,headers,body))
    deadline=time.monotonic()+ATTEMPT_TIMEOUT_SECONDS
    worker.start()
    child.close()
    try:
        if not parent.poll(max(0,deadline-time.monotonic())):
            raise TimeoutError('Attempt exceeded 120 seconds')
        status,value=parent.recv()
        if status=='ok':
            return value
        if status=='timeout':
            raise TimeoutError('Attempt timed out')
        if status=='http':
            raise urllib.error.HTTPError(url,value,'Provider status',{},None)
        if status=='connection':
            raise ConnectionError('Transport failed')
        raise ValueError('Invalid provider response')
    finally:
        if worker.is_alive():
            worker.terminate()
        worker.join()
        parent.close()

def complete(model, prompt, key, secrets=()):
    refuse_ambient_keys()
    provider = model['provider']
    if not isinstance(key, str) or not key:
        raise ValueError('Missing runtime key')
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
    # Reject echoed secrets, including the other provider's key. No raw error bodies.
    ensure_no_secrets(text, (key, *secrets))
    if any(type(n) is not int or n < 0 for n in (inputs, outputs)):
        raise ValueError('Invalid usage')
    if inputs > model['context_tokens'] or outputs > model['max_output_tokens']:
        raise ValueError('Usage exceeded configured bounds')
    return dict(text=text, input_tokens=inputs, output_tokens=outputs, latency_ms=round((time.perf_counter()-start)*1000, 3))

RETRY_POLICY = {'transport_retries': 2, 'rate_limit_retries': 2, 'timeout_retries': 0, 'other_retries': 0}

def replay_attempt(fixture):
    response=fixture.copy()
    if response.get('latency_ms',0) >= ATTEMPT_TIMEOUT_SECONDS*1000:
        response['error']='timeout'
        response['latency_ms']=ATTEMPT_TIMEOUT_SECONDS*1000
    return response

def score(task, response):
    text = response.get('text', '')
    if response.get('error') or not isinstance(text, str) or not text.strip():
        return 'execution_error', False
    if type(task.get('answerable')) is not bool:
        raise ValueError('Task answerability required')
    # Format precedence applies even to refusals/declines.
    if task['check']['kind'] == 'json':
        try:
            json.loads(text)
        except ValueError:
            return 'malformed', False
    if any(re.search(pattern, text, re.I) for pattern in REFUSALS):
        return 'refused', False
    # Quotes cannot become a bare decline; hedged substantive answers are answered.
    if any(re.fullmatch(pattern + r'[.!]?', text.strip(), re.I) for pattern in DECLINES):
        return 'abstained', not task['answerable']
    return 'answered', bool(task['answerable'] and grade(task, text))


def fixture_checklist(task, response, base_pass, panel):
    """Hard checks remain final. Missing/malformed judging is pending, not success."""
    if base_pass is not True:
        return False, []
    verdicts = []
    expected = task['check']['checklist']
    if not expected or not panel:
        return None, []
    providers = {j['provider'] for j in panel}
    if len(providers) < 2:
        return None, []
    for judge in panel:
        recorded = response.get('judges', {}).get(judge['model'], {})
        checks = recorded.get('checklist', [])
        if (len(checks) != len(expected)
                or [c.get('item') for c in checks] != expected
                or any(type(c.get('passed')) is not bool for c in checks)):
            return None, verdicts
        verdicts.append(dict(provider=judge['provider'], model=judge['model'],
                             source='synthetic-fixture', passed=all(c['passed'] for c in checks)))
    return all(v['passed'] for v in verdicts), verdicts


def guard_live():
    raise RuntimeError('Live refused: method, harness, config, tasks, judges and run approval pending')


def dispatch_slot(call, ledger, provider, amount):
    """Transport-only retries. Keep every dispatched request and its reservation."""
    requests = []
    for attempt in range(3):
        if not ledger.reserve(provider, amount):
            return dict(error='cap', text=''), requests, True
        response = replay_attempt(call(attempt))
        error = response.get('error')
        # Only stable reason codes enter records. Never persist exception messages.
        reason = error if error in ('connection', '429', '5xx', 'timeout') else 'provider_error' if error else None
        requests.append(dict(number=attempt+1, error=reason, reserved_usd=str(amount)))
        if not error or error not in ('connection', '429', '5xx') or attempt == 2:
            return response, requests, False
    raise AssertionError('Unreachable')


def preflight(config, tasks, repeats):
    """Conservative offline bound, NOT final live method/canary acceptance."""
    total = dict.fromkeys(config['caps_usd'], D(0))
    for model in config['models']:
        for task in tasks:
            total[model['provider']] += cost(model, model['context_tokens'], output_limit(task)) * repeats * 3
            if task['grader'] == 'rubric':
                for judge in config['judge_panel']:
                    total[judge['provider']] += cost(judge, judge['context_tokens'], judge['max_output_tokens']) * repeats * 2
    # 40 qualification samples per judge, two possible requests each.
    for judge in config['judge_panel']:
        total[judge['provider']] += cost(judge, judge['context_tokens'], judge['max_output_tokens']) * 40 * 2
    return total


def write_lf(path, text):
    # Exclusive create, UTF-8 bytes, no platform newline translation.
    with path.open('xb') as stream:
        stream.write(text.replace('\r\n', '\n').encode('utf-8'))


def run(config, out, live=False, max_usd='60', repeats=None, key_file=None,
        private_tasks=None, private_out=None):
    # Refusal precedes ALL key/private-file access. CLI dry runs never load keys.
    if live:
        guard_live()
    refuse_ambient_keys()
    if key_file is not None:
        raise ValueError('Dry run does not read key files')
    validate(config)
    repeats = config['repeats'] if repeats is None else repeats
    if type(repeats) is not int or repeats < 1:
        raise ValueError('Invalid repeats')
    if out.exists() or (private_out is not None and private_out.exists()):
        raise FileExistsError('Run destination exists')
    tasks = json.loads((ROOT/'public/tasks.json').read_text(encoding='utf-8'))
    if private_tasks is not None:
        if private_out is None or private_out.resolve().is_relative_to(ROOT.parent.parent.resolve()):
            raise ValueError('External private output required')
        tasks += load_private_tasks(private_tasks, ROOT.parent.parent)
    if len({t['id'] for t in tasks}) != len(tasks):
        raise ValueError('Duplicate task id')
    fixtures = json.loads((ROOT/'fixtures.json').read_text(encoding='utf-8'))
    ledger = Ledger(config['caps_usd'], max_usd)
    estimates = preflight(config, tasks, repeats)
    refused = {p for p, amount in estimates.items() if amount > ledger.caps[p]}
    if refused or sum(estimates.values()) > ledger.global_cap:
        refused.update(m['provider'] for m in config['models'])
    run_id = str(uuid.uuid4())
    run_date = datetime.now(timezone.utc).isoformat()
    rows, stopped = [], set(refused)
    for model in config['models']:
        provider = model['provider']
        for task in tasks:
            for repeat in range(1, repeats+1):
                if provider in stopped:
                    continue
                limit = output_limit(task)
                amount = cost(model, model['context_tokens'], limit)
                fixture = fixtures.get(task['id'], {'error': 'fixture_missing'})
                sequence = fixture.get('requests', [fixture])
                response, requests, cap_stop = dispatch_slot(
                    lambda n: sequence[min(n, len(sequence)-1)], ledger, provider, amount)
                if cap_stop:
                    stopped.add(provider)
                if not requests:
                    continue
                outcome, passed = score(task, response)
                judges = []
                if task['grader'] == 'rubric' and outcome == 'answered':
                    # Reserve judge requests through the SAME provider/global ledger.
                    # No fixture judge call is dispatched above cap.
                    judge_stop = False
                    for judge in config['judge_panel']:
                        if not ledger.reserve(judge['provider'], cost(
                                judge, judge['context_tokens'], judge['max_output_tokens'])):
                            stopped.add(judge['provider'])
                            judge_stop = True
                    if judge_stop:
                        passed = False if passed is False else None
                    else:
                        passed, judges = fixture_checklist(task, response, passed, config['judge_panel'])
                row = dict(provider=provider, model_id=model['model'], run_id=run_id,
                           run_date=run_date, task=task['id'], family=task['family'],
                           split=task['split'], answerable=task['answerable'], repeat=repeat,
                           input=task['prompt'], output=response.get('text', ''),
                           grader=task['grader'], outcome=outcome,
                           execution_status='error' if response.get('error') else 'returned',
                           requests=requests, judges=judges,
                           input_tokens=response.get('input_tokens'),
                           output_tokens=response.get('output_tokens'), reasoning_tokens=None,
                           ttft_ms=None, total_time_ms=response.get('latency_ms'),
                           model_cost_usd='0', judge_cost_usd='0',
                           max_output_tokens=limit, timeout_seconds=120,
                           effort=model['effort'], temperature=model['temperature'],
                           truncated=response.get('finish_reason') in ('length', 'max_tokens'),
                           adjudication_required=outcome == 'answered' and not passed)
                row['pass'] = passed
                rows.append(row)
    summaries = coverage(config['models'], tasks, repeats, rows, stopped)
    incomplete = any(s['unstarted'] for s in summaries)
    status = 'preflight_refused' if refused else 'incomplete' if incomplete else 'pending' if any(
        s['pending'] for s in summaries) else 'complete'
    result = dict(run_id=run_id, method_source=METHOD_REF,
                  implementation_base=IMPLEMENTATION_BASE, method_conformant=False,
                  method_pending=METHOD_PENDING, mode='dry-run', status=status,
                  task_set_version=config['task_set_version'], stopped=sorted(stopped),
                  summary=summaries, rows=rows, tasks=tasks, preflight=dict(
                      policy='conservative offline bound; final live bound pending',
                      provider_usd={p: str(v) for p, v in estimates.items()},
                      total_usd=str(sum(estimates.values())),
                      reserved_usd={p: str(v) for p, v in ledger.reserved.items()}))
    # No config dump and no private task path is serialized.
    ensure_no_secrets(result)
    public = public_record(result)
    if private_out is not None and (
            out.resolve().is_relative_to(private_out.resolve())
            or private_out.resolve().is_relative_to(out.resolve())):
        raise ValueError('Public and private destinations must be disjoint')
    out.mkdir(parents=True, exist_ok=False)
    write_lf(out/'results.json', json.dumps(public, indent=2)+'\n')
    write_lf(out/'report.md', report(result))
    if private_out is not None:
        private_out.mkdir(parents=True, exist_ok=False, mode=0o700)
        write_lf(private_out/'private-results.json', json.dumps(result, indent=2)+'\n')
    hashes = {f.name: hashlib.sha256(f.read_bytes()).hexdigest() for f in out.iterdir()}
    write_lf(out/'manifest.json', json.dumps(dict(
        run_id=run_id, method_source=METHOD_REF, sha256=hashes,
        source_sha256={name: hashlib.sha256((ROOT/name).read_bytes()).hexdigest()
                       for name in ('harness.py', 'contracts.py', 'fixtures.json', 'public/tasks.json')},
        finalization='exclusive LF writes; crash/immutable acceptance pending'), indent=2)+'\n')
    # No merge/resume/append path. Read-only is only an accidental-edit guard.
    for f in out.iterdir():
        f.chmod(0o444)
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', type=Path, default=ROOT/'config.fixture.json')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--live', action='store_true')
    parser.add_argument('--max-usd', default='60')
    parser.add_argument('--repeats', type=int)
    parser.add_argument('--key-file', type=Path)
    parser.add_argument('--private-tasks', type=Path)
    parser.add_argument('--private-out', type=Path)
    args = parser.parse_args()
    if args.live and args.dry_run:
        parser.error('Choose one mode')
    result = run(json.loads(args.config.read_text(encoding='utf-8')), args.out,
                 args.live, args.max_usd, args.repeats, args.key_file,
                 args.private_tasks, args.private_out)
    return 0 if result['status'] == 'complete' and all(r['pass'] is True for r in result['rows']) else 1


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except MissingKey as error:
        print(str(error))  # Validated configuration NAME only.
        raise SystemExit(2)
    except Exception:
        print('Run refused or failed; sensitive error details suppressed.')
        raise SystemExit(2)
