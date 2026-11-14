"""Synthetic-only regressions. Run with Python 3.11+; no network or real keys."""
import copy
import hashlib
import io
import json
import os
from contextlib import redirect_stdout, redirect_stderr
from decimal import Decimal
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch, Mock
import harness as h
import contracts as c


class BenchTests(unittest.TestCase):
    def setUp(self):
        self.config = json.loads((h.ROOT/'config.fixture.json').read_text(encoding='utf-8'))
        self.env = patch.dict(os.environ, {}, clear=True)
        self.env.start()
        self.addCleanup(self.env.stop)

    def task(self, **extra):
        return dict(id='fake', family='know_check_abstain', split='public',
                    answerable=True, check=dict(kind='exact', expected='42'),
                    grader='script', **extra)

    def cleanup_run(self, out):
        if out.exists():
            for f in out.iterdir():
                f.chmod(0o666)

    def test_full_offline_pipeline_and_unique_identity(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(
                h, 'request_json', side_effect=AssertionError('NETWORK FORBIDDEN')):
            a, b = Path(tmp)/'a', Path(tmp)/'b'
            try:
                first = h.run(self.config, a)
                second = h.run(self.config, b)
                self.assertEqual(len(first['rows']), 360)
                self.assertEqual(first['status'], 'complete')
                self.assertNotEqual(first['run_id'], second['run_id'])
                self.assertTrue(all(r['pass'] for r in first['rows']))
                self.assertEqual(sum(r['outcome']=='abstained' for r in first['rows']), 36)
                self.assertTrue(all(r['max_output_tokens']==4096 for r in first['rows']))
                self.assertTrue(all(s['planned']==180 and s['unstarted']==0 for s in first['summary']))
                for directory in (a, b):
                    manifest = json.loads((directory/'manifest.json').read_text())
                    for name, digest in manifest['sha256'].items():
                        data = (directory/name).read_bytes()
                        self.assertNotIn(b'\r\n', data)
                        self.assertEqual(hashlib.sha256(data).hexdigest(), digest)
                before = (a/'results.json').read_bytes()
                with self.assertRaises(FileExistsError):
                    h.run(self.config, a)
                self.assertEqual(before, (a/'results.json').read_bytes())
            finally:
                self.cleanup_run(a)
                self.cleanup_run(b)

    def test_global_and_provider_preflight_refuse_entire_run(self):
        for provider_cap, global_cap in [('30', '0'), ('0', '60')]:
            config = copy.deepcopy(self.config)
            config['caps_usd']['openai'] = provider_cap
            with tempfile.TemporaryDirectory() as tmp:
                out = Path(tmp)/'run'
                try:
                    result = h.run(config, out, max_usd=global_cap)
                    self.assertEqual(result['status'], 'preflight_refused')
                    self.assertFalse(result['rows'])
                    self.assertEqual(set(result['stopped']), {'openai', 'anthropic'})
                    self.assertTrue(all(s['attempted']==0 and s['unstarted']==180 for s in result['summary']))
                    text = (out/'report.md').read_text()
                    self.assertIn('Unstarted', text)
                    self.assertNotIn('0/0 passed', text)
                finally:
                    self.cleanup_run(out)

    def test_partial_report_and_zero_attempt_model(self):
        models = self.config['models']
        rows = [dict(provider='openai', model_id=models[0]['model'], **{'pass': True})]
        summary = c.coverage(models, [self.task()], 3, rows, {'openai', 'anthropic'})
        self.assertEqual(summary[0]['unstarted'], 2)
        self.assertEqual(summary[1]['attempted'], 0)
        text = c.report(dict(status='incomplete', stopped=['openai', 'anthropic'], summary=summary))
        self.assertIn('incomplete', text)
        self.assertIn('anthropic', text)
        self.assertNotIn('1/1 passed', text)

    def test_all_error_slots_remain_attempted_failed(self):
        rows = [dict(provider='openai', model_id=self.config['models'][0]['model'], **{'pass': False})]*3
        summary = c.coverage(self.config['models'], [self.task()], 3, rows, set())
        self.assertEqual(summary[0]['attempted'], 3)
        self.assertEqual(summary[0]['failed'], 3)
        self.assertEqual(summary[0]['passed'], 0)

    def test_outcome_precedence(self):
        task = self.task()
        for response, expected in [
            ({'text':'42', 'error':'timeout'}, ('execution_error', False)),
            ({'text':''}, ('execution_error', False)),
            ({'text':'I refuse to answer'}, ('refused', False)),
            ({'text':"I don't know"}, ('abstained', False)),
            ({'text':"I'm not sure, but probably London"}, ('answered', False)),
            ({'text':'The source says "I don\'t know"; answer is 42'}, ('answered', False)),
            ({'text':'42'}, ('answered', True)),
        ]:
            self.assertEqual(h.score(task, response), expected)
        task['answerable'] = False
        self.assertEqual(h.score(task, {'text':"I don't know"}), ('abstained', True))
        self.assertEqual(h.score(task, {'text':'42'}), ('answered', False))
        task['check'] = dict(kind='json', expected={'a':1})
        self.assertEqual(h.score(task, {'text':'I refuse'}), ('malformed', False))

    def test_case_sensitive_code_and_explicit_opt_out(self):
        task = self.task()
        task['check']['expected'] = 'def calculate():\n    return 2 + 3'
        self.assertFalse(h.grade(task, 'DEF CALCULATE():\n    RETURN 2 + 3'))
        self.assertTrue(h.grade(task, task['check']['expected']))
        task['check']['case_sensitive'] = False
        self.assertTrue(h.grade(task, task['check']['expected'].upper()))

    def test_rubric_cannot_overwrite_hard_failure(self):
        task = dict(check=dict(checklist=['required']))
        response = {'judges': {}}
        self.assertEqual(h.fixture_checklist(task, response, False, self.config['judge_panel']), (False, []))
        self.assertEqual(h.fixture_checklist(task, response, True, self.config['judge_panel']), (None, []))
        response['judges'] = {j['model']: {'checklist':[{'item':'required','passed':True}]}
                              for j in self.config['judge_panel']}
        self.assertTrue(h.fixture_checklist(task, response, True, self.config['judge_panel'])[0])
        response['judges'][self.config['judge_panel'][0]['model']]['checklist'][0]['passed'] = False
        self.assertFalse(h.fixture_checklist(task, response, True, self.config['judge_panel'])[0])

    def test_retry_exhaustion_is_one_failed_slot(self):
        ledger = c.Ledger({'openai':'1'}, '1')
        call = Mock(return_value={'error':'connection'})
        response, requests, stopped = h.dispatch_slot(call, ledger, 'openai', '.1')
        self.assertEqual(call.call_count, 3)
        self.assertEqual(len(requests), 3)
        self.assertFalse(stopped)
        self.assertEqual(h.score(self.task(), response), ('execution_error', False))
        self.assertEqual(ledger.reserved['openai'], Decimal('.3'))

    def test_transport_only_retry_and_timeout(self):
        for error, count in [('connection',3), ('429',3), ('5xx',3), ('timeout',1), ('format',1)]:
            call = Mock(return_value={'error':error})
            response, requests, _ = h.dispatch_slot(call, c.Ledger({'openai':1},1), 'openai', '.1')
            self.assertEqual(call.call_count, count)
        call = Mock(side_effect=[{'error':'connection'}, {'text':'42'}])
        response, requests, _ = h.dispatch_slot(call, c.Ledger({'openai':1},1), 'openai', '.1')
        self.assertEqual(len(requests), 2)
        self.assertTrue(h.score(self.task(), response)[1])

    def test_cap_blocks_dispatch_and_retry(self):
        for cap, expected in [('0',0), ('.1',1)]:
            call = Mock(return_value={'error':'connection'})
            response, requests, stopped = h.dispatch_slot(call, c.Ledger({'openai':cap},cap), 'openai', '.1')
            self.assertEqual(call.call_count, expected)
            self.assertEqual(len(requests), expected)
            self.assertTrue(stopped)
            self.assertFalse(h.score(self.task(), response)[1])

    def test_atomic_provider_global_ledger(self):
        ledger = c.Ledger({'openai':1, 'anthropic':1}, '1')
        self.assertTrue(ledger.reserve('openai', '.6'))
        self.assertFalse(ledger.reserve('anthropic', '.5'))
        self.assertEqual(ledger.reserved['anthropic'], 0)
        for invalid in ['NaN', '-1', 'Infinity']:
            with self.assertRaises(ValueError):
                ledger.reserve('openai', invalid)

    def test_output_default_and_long_opt_in(self):
        self.assertEqual(c.output_limit({}), 4096)
        self.assertEqual(c.output_limit({'max_output_tokens':8192,'long_answer_reason':'long document'}), 8192)
        for task in [{'max_output_tokens':8192}, {'max_output_tokens':4097}, {'max_output_tokens':True}]:
            with self.assertRaises(ValueError):
                c.output_limit(task)

    def test_preflight_includes_judging_and_qualification(self):
        tasks = json.loads((h.ROOT/'public/tasks.json').read_text())
        total = h.preflight(self.config, tasks, 3)
        maker = sum((h.cost(m,m['context_tokens'],4096)*len(tasks)*9 for m in self.config['models']), Decimal(0))
        self.assertGreater(sum(total.values()), maker)
        self.assertTrue(all(total[p] <= Decimal(self.config['caps_usd'][p]) for p in total))

    def test_key_file_found_case_matching_and_explicit_alternative(self):
        with tempfile.TemporaryDirectory() as tmp:
            file = Path(tmp)/'synthetic-key-fixture.txt'
            file.write_text('UNRELATED=do-not-retain\nopenai_api_key=fake-o\nCLAUDE_API="fake-a"\n')
            before = dict(os.environ)
            self.assertEqual(c.load_keys(file, self.config), {'openai':'fake-o','anthropic':'fake-a'})
            self.assertEqual(dict(os.environ), before)
            config = copy.deepcopy(self.config)
            config['key_names']['openai'] = ['MISSING_EXPLICIT', 'OPENAI_API_KEY']
            self.assertEqual(c.load_keys(file, config)['openai'], 'fake-o')

    def test_missing_key_name_only_and_no_guessing(self):
        with tempfile.TemporaryDirectory() as tmp:
            file = Path(tmp)/'synthetic-key-fixture.txt'
            file.write_text('OTHER=private-unrelated\nCLAUDE_API=fake-a\n')
            output = io.StringIO()
            with redirect_stdout(output), redirect_stderr(output):
                with self.assertRaises(c.MissingKey) as caught:
                    c.load_keys(file, self.config)
            self.assertEqual(str(caught.exception), 'key not found: OPENAI_API_KEY')
            self.assertEqual(output.getvalue(), '')
            self.assertNotIn('fake-a', str(caught.exception))

    def test_duplicate_missing_empty_ambiguous_keys(self):
        with tempfile.TemporaryDirectory() as tmp:
            file = Path(tmp)/'synthetic-key-fixture.txt'
            for content in ['OPENAI_API_KEY=a\nopenai_api_key=b\nCLAUDE_API=c',
                            'OPENAI_API_KEY=\nCLAUDE_API=c',
                            'OPENAI_API_KEY="unfinished\nCLAUDE_API=c']:
                file.write_text(content)
                with self.assertRaises(ValueError):
                    c.load_keys(file, self.config)
            config = copy.deepcopy(self.config)
            config['key_names']['anthropic'] = ['openai_api_key']
            with self.assertRaises(ValueError):
                c.load_keys(file, config)

    def test_ambient_env_refused_even_empty(self):
        for name in ('OPENAI_API_KEY', 'ANTHROPIC_API_KEY'):
            for value in ('', 'synthetic-only'):
                with self.assertRaises(ValueError):
                    c.load_keys(Path('never-read'), self.config, {name:value})

    def test_live_and_dry_key_file_never_read(self):
        with patch.object(h, 'load_keys', side_effect=AssertionError('KEY READ')), patch.object(
                h, 'load_private_tasks', side_effect=AssertionError('PRIVATE READ')), patch.object(
                h, 'request_json', side_effect=AssertionError('NETWORK')):
            with self.assertRaises(RuntimeError):
                h.run(self.config, Path('never-created'), live=True, key_file=Path('never-read'))
            with self.assertRaises(ValueError):
                h.run(self.config, Path('never-created'), key_file=Path('never-read'))

    def test_public_allowlist_excludes_heldout_and_unknown_data(self):
        row = dict(task='H-fake', family='grounded', split='held-out',
                   input='PRIVATE-PROMPT', output='PRIVATE-ANSWER', judges='PRIVATE-JUDGE',
                   unexpected='PRIVATE-EXTRA', **{'pass':False, 'outcome':'answered'})
        private = dict(rows=[row], config={'secret':'PRIVATE-CONFIG'}, key_file='PRIVATE-PATH')
        public = c.public_record(private)
        serialized = json.dumps(public)
        self.assertNotIn('PRIVATE-', serialized)
        self.assertEqual(set(public['rows'][0]), {'task','family','pass','outcome'})
        row['split'] = 'public'
        self.assertIn('PRIVATE-PROMPT', json.dumps(c.public_record(private)))
        self.assertNotIn('PRIVATE-EXTRA', json.dumps(c.public_record(private)))

    def test_secret_artifact_echo_refused(self):
        with self.assertRaises(ValueError) as caught:
            c.ensure_no_secrets({'answer':'echo fake-key'}, ('fake-key',))
        self.assertNotIn('fake-key', str(caught.exception))

    def test_adapter_direct_key_synthetic_transport(self):
        with patch.object(h,'request_json',return_value={
                'choices':[{'message':{'content':'ok'}}],
                'usage':{'prompt_tokens':10,'completion_tokens':4}}) as transport:
            result = h.complete(self.config['models'][0], 'hello', 'fake-o', ('fake-a',))
            self.assertEqual(result['text'], 'ok')
            self.assertEqual(transport.call_args.args[2]['max_completion_tokens'], 4096)
        with patch.object(h,'request_json',return_value={
                'choices':[{'message':{'content':'fake-a'}}],
                'usage':{'prompt_tokens':10,'completion_tokens':4}}):
            with self.assertRaises(ValueError):
                h.complete(self.config['models'][0], 'hello', 'fake-o', ('fake-a',))

    def test_hard_deadline_terminates_worker(self):
        parent, child, worker = Mock(), Mock(), Mock()
        parent.poll.return_value = False
        context = Mock()
        context.Pipe.return_value = (parent, child)
        context.Process.return_value = worker
        with patch('multiprocessing.get_context', return_value=context):
            with self.assertRaises(TimeoutError):
                h.request_json('https://example.invalid', {}, {})
        worker.terminate.assert_called_once()
        worker.join.assert_called_once()

    def test_synthetic_private_loader_only(self):
        with tempfile.TemporaryDirectory() as tmp:
            file = Path(tmp)/'fake-tasks.json'
            file.write_text(json.dumps([dict(self.task(), split='held-out')]))
            self.assertEqual(len(c.load_private_tasks(file, h.ROOT)), 1)
            with self.assertRaises(ValueError):
                c.load_private_tasks(file, tmp)

    def test_seven_family_contract_and_non_admission(self):
        self.assertEqual(sum(v[0] for v in c.FAMILIES.values()), 60)
        self.assertEqual(sum(v[1] for v in c.FAMILIES.values()), 40)
        self.assertEqual(sum(v[2] for v in c.FAMILIES.values()), 20)
        tasks = json.loads((h.ROOT/'public/tasks.json').read_text())
        self.assertEqual(len(tasks), 60)
        self.assertTrue(all(t['admitted'] is False and t['split']=='public' for t in tasks))

    def test_lf_baseline_committed_bytes(self):
        root = h.ROOT/'runs/fixture-baseline'
        manifest = json.loads((root/'manifest.json').read_text())
        for name, expected in manifest['sha256'].items():
            data = (root/name).read_bytes()
            self.assertNotIn(b'\r\n', data)
            self.assertEqual(hashlib.sha256(data).hexdigest(), expected)


if __name__ == '__main__':
    unittest.main()
