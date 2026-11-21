"""Offline contracts. No secret-source discovery, paid admission, or network here."""
import json
import os
import re
from decimal import Decimal
from pathlib import Path

METHOD_REF = '5127575a52d02217cdd3dce48a52a54112c98b4e'
METHOD_LATEST_READ = 'e2008381600abe713e557ad40551bf0b9adec926'
IMPLEMENTATION_BASE = '595f672d7a28c217a010e86f6a4ae0c4c5995594'
METHOD_PENDING = [
    'checklist conjunction and outcome fallback adjudication',
    'calibration class balance',
    'full retry/canary reservation bound',
    'PRNG and quantile specification',
    'immutable finalization acceptance',
]
# (total, public, held-out); method table, not the synthetic fixture distribution.
FAMILIES = {
    'follow_brief': (10, 7, 3),
    'know_check_abstain': (10, 7, 3),
    'grounded': (8, 5, 3),
    'summarise_extract': (8, 5, 3),
    'rewrite_edit': (8, 5, 3),
    'numbers_planning': (8, 6, 2),
    'spreadsheet_code': (8, 5, 3),
}


class MissingKey(ValueError):
    """Only a validated configuration name may appear in this message."""


def refuse_ambient_keys(environ=None):
    env = os.environ if environ is None else environ
    if any(name in env for name in ('OPENAI_API_KEY', 'ANTHROPIC_API_KEY')):
        raise ValueError('Ambient provider keys forbidden')


def key_names(config):
    entries = config.get('key_names')
    if not isinstance(entries, dict) or set(entries) != {'openai', 'anthropic'}:
        raise ValueError('Explicit provider key names required')
    result = {}
    seen = set()
    for provider, names in entries.items():
        if isinstance(names, str):
            names = [names]
        if not isinstance(names, list) or not names:
            raise ValueError('Explicit key-name list required')
        for name in names:
            if not isinstance(name, str) or not re.fullmatch(r'[A-Za-z_][A-Za-z0-9_]{0,79}', name):
                raise ValueError('Invalid key name')
            folded = name.casefold()
            if folded in seen:
                raise ValueError('Ambiguous key-name configuration')
            seen.add(folded)
        result[provider] = names
    return result


def load_keys(path, config, environ=None):
    """Runtime-only, explicitly named file. Tests must use synthetic files.

    Lines for unselected names are not parsed as values or retained. Reading
    a file necessarily buffers bytes; this is no protection against memory dumps.
    No interpolation, shell execution, dotenv discovery, or environment writes.
    """
    refuse_ambient_keys(environ)
    names = key_names(config)
    wanted = {n.casefold() for values in names.values() for n in values}
    found = {}
    try:
        with Path(path).open(encoding='utf-8-sig') as stream:
            for line in stream:
                name, separator, raw = line.partition('=')
                folded = name.strip().casefold()
                if not separator or folded not in wanted:
                    continue
                if folded in found:
                    raise ValueError('Duplicate selected key entry')
                value = raw.strip()
                if value[:1] in ('"', "'"):
                    if len(value) < 2 or value[-1] != value[0]:
                        raise ValueError('Invalid selected key entry')
                    value = value[1:-1]
                if not value or any(c.isspace() for c in value):
                    raise ValueError('Invalid selected key entry')
                found[folded] = value
    except OSError:
        raise ValueError('Key file unavailable') from None
    except UnicodeError:
        raise ValueError('Invalid key file encoding') from None
    result = {}
    for provider, alternatives in names.items():
        # Only explicitly listed alternatives, in their configured order.
        for name in alternatives:
            if name.casefold() in found:
                result[provider] = found[name.casefold()]
                break
        else:
            raise MissingKey('key not found: ' + alternatives[0]) from None
    return result


def ensure_no_secrets(value, secrets=()):
    """Fail closed before persistence; never print the matching value."""
    def strings(item):
        if isinstance(item, str):
            yield item
        elif isinstance(item, dict):
            for key, child in item.items():
                yield from strings(key)
                yield from strings(child)
        elif isinstance(item, (list, tuple)):
            for child in item:
                yield from strings(child)
    if any(secret and secret in text for text in strings(value) for secret in secrets):
        raise ValueError('Secret detected; artifact refused')
    return value


class Ledger:
    """Conservative hard caps: reservations are never released in offline v3.

    This deliberately over-reserves. Live reconciliation and the final method's
    canary/retry preflight are gated, not silently inferred from a 15% allowance.
    """
    def __init__(self, caps, global_cap):
        self.caps = {p: Decimal(str(v)) for p, v in caps.items()}
        self.global_cap = Decimal(str(global_cap))
        if any(not v.is_finite() or v < 0 for v in [*self.caps.values(), self.global_cap]):
            raise ValueError('Invalid cap')
        self.reserved = dict.fromkeys(self.caps, Decimal(0))

    def reserve(self, provider, amount):
        amount = Decimal(str(amount))
        if provider not in self.caps or not amount.is_finite() or amount < 0:
            raise ValueError('Invalid reservation')
        if self.reserved[provider] + amount > self.caps[provider]:
            return False
        if sum(self.reserved.values()) + amount > self.global_cap:
            return False
        self.reserved[provider] += amount
        return True


def output_limit(task):
    limit = task.get('max_output_tokens', 4096)
    if type(limit) is not int or limit not in (4096, 8192):
        raise ValueError('Invalid task output limit')
    if limit == 8192 and not task.get('long_answer_reason'):
        raise ValueError('8192 requires explicit task justification')
    return limit


# Published deterministic patterns; exact declines only. Hedges followed by
# an assertion remain answered. Unknown language is flagged for adjudication.
DECLINES = (
    r"i (?:do not|don't) know",
    r"i (?:cannot|can't) (?:answer|determine)(?: (?:that|this|from the (?:source|information)))?",
    r"(?:the )?(?:source|document) (?:does not|doesn't) (?:say|provide (?:that|this|the answer))",
    r"unknown",
)
REFUSALS = (
    r"i (?:refuse|cannot comply|can't comply)\b",
    r"i (?:cannot|can't) (?:help|assist) with (?:that|this)(?: request)?\b",
)
HELDOUT_FIELDS = ('task', 'family', 'outcome', 'pass', 'input_tokens',
                 'output_tokens', 'reasoning_tokens', 'model_cost_usd',
                 'judge_cost_usd', 'ttft_ms', 'total_time_ms')
PUBLIC_FIELDS = HELDOUT_FIELDS + (
    'provider', 'model_id', 'run_id', 'run_date', 'repeat', 'answerable',
    'input', 'output', 'grader', 'execution_status', 'requests',
    'max_output_tokens', 'timeout_seconds', 'effort', 'temperature',
    'adjudication_required', 'truncated',
)


def public_record(private):
    # No config, error text, paths, judge prompts, or freeform metadata.
    result = {k: private[k] for k in (
        'run_id', 'mode', 'method_source', 'implementation_base',
        'method_conformant', 'method_pending', 'status', 'stopped',
        'summary', 'preflight', 'task_set_version',
    ) if k in private}
    result['rows'] = []
    for row in private['rows']:
        if row.get('split') not in ('public', 'held-out'):
            raise ValueError('Unknown task split')
        fields = HELDOUT_FIELDS if row['split'] == 'held-out' else PUBLIC_FIELDS
        result['rows'].append({k: row[k] for k in fields if k in row})
    return result


def load_private_tasks(path, repository):
    """Owner runtime only; this task never loads a real private set."""
    resolved = Path(path).resolve()
    if resolved.is_relative_to(Path(repository).resolve()):
        raise ValueError('Held-out tasks must be outside repository')
    try:
        tasks = json.loads(resolved.read_text(encoding='utf-8'))
    except (OSError, ValueError):
        raise ValueError('Private task file unavailable or invalid') from None
    if not isinstance(tasks, list):
        raise ValueError('Invalid private tasks')
    ids = set()
    for task in tasks:
        if (not isinstance(task, dict) or task.get('split') != 'held-out'
                or task.get('family') not in FAMILIES
                or type(task.get('answerable')) is not bool
                or not isinstance(task.get('id'), str) or task['id'] in ids):
            raise ValueError('Invalid private task')
        ids.add(task['id'])
    return tasks


def coverage(models, tasks, repeats, rows, stopped):
    result = []
    for model in models:
        subset = [r for r in rows if r['provider'] == model['provider']
                  and r['model_id'] == model['model']]
        planned = len(tasks) * repeats
        attempted = len(subset)
        if attempted > planned:
            raise ValueError('Duplicate or excess slots')
        passed = sum(r['pass'] is True for r in subset)
        pending = sum(r['pass'] is None for r in subset)
        result.append(dict(
            provider=model['provider'], model_id=model['model'],
            planned=planned, attempted=attempted, unstarted=planned-attempted,
            passed=passed, failed=attempted-passed-pending, pending=pending,
            stopped=model['provider'] in stopped,
            pass_rate_planned=passed/planned if planned else None,
        ))
    return result


def report(result):
    lines = ['# Synthetic fixture report', '',
             'Status: ' + result['status'] + '. Not admitted benchmark evidence.',
             'Stopped providers: ' + (', '.join(result['stopped']) or 'none'), '',
             '| Provider / model | Planned | Attempted | Unstarted | Passed | Failed | Pending |',
             '| --- | ---: | ---: | ---: | ---: | ---: | ---: |']
    for row in result['summary']:
        lines.append('| ' + row['provider'] + ' / ' + row['model_id'] + ' | ' +
                     ' | '.join(str(row[k]) for k in (
                         'planned', 'attempted', 'unstarted', 'passed', 'failed', 'pending')) + ' |')
    lines += ['', 'Actual maker/judge spend: USD 0. No network.',
              'Source implementation base: ' + IMPLEMENTATION_BASE,
              'Implementation method source: ' + METHOD_REF,
              'Latest owner method reread before push: ' + METHOD_LATEST_READ,
              'Budget/statistical/finalization acceptance remains gated: ' + '; '.join(METHOD_PENDING),
              'Intervals withheld pending final PRNG/quantile method decision.',
              '60 development fixtures remain non-admitted; no model-quality claim.', '']
    return '\n'.join(lines)
