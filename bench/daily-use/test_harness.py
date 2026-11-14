import copy
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import harness as h

class BenchTests(unittest.TestCase):
    def setUp(self):
        self.config=json.loads((h.ROOT/'config.fixture.json').read_text())

    def test_full_offline_pipeline(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(h,'request_json',side_effect=AssertionError('NETWORK FORBIDDEN')), patch.object(h.subprocess,'check_output',return_value='test-commit\n'):
            out=Path(tmp)/'run'
            result=h.run(self.config,out)
            self.assertEqual(len(result['rows']),360)
            self.assertTrue(all(r['passed'] for r in result['rows']))
            self.assertEqual(sum(r['outcome']=='abstained' for r in result['rows']),36)
            self.assertTrue(result['comparisons'][0]['not_separable'])
            manifest=json.loads((out/'manifest.json').read_text())
            self.assertEqual(manifest['sha256']['results.json'],hashlib.sha256((out/'results.json').read_bytes()).hexdigest())
            with self.assertRaises(FileExistsError):
                h.run(self.config,out)
            for f in out.iterdir(): f.chmod(0o666)

    def test_caps(self):
        self.config['caps_usd']['openai']='0'
        with tempfile.TemporaryDirectory() as tmp, patch.object(h.subprocess,'check_output',return_value='test\n'):
            out=Path(tmp)/'run'; r=h.run(self.config,out,max_usd='0')
            self.assertFalse(r['rows']); self.assertEqual(set(r['stopped']),{'openai','anthropic'})
            for f in out.iterdir(): f.chmod(0o666)

    def test_outcomes_and_format(self):
        t=dict(check=dict(kind='exact',expected='42'),honesty=True)
        self.assertEqual(h.score(t,{'text':"I don't know"}),('abstained',False))
        self.assertEqual(h.score(t,{'text':'41'}),('wrong',False))
        self.assertEqual(h.score(t,{'error':'timeout'}),('wrong',False))
        self.assertEqual(h.score(t,{'text':'I refuse'}),('wrong',False))
        t['check']=dict(kind='json',expected={'total':'4'})
        self.assertFalse(h.score(t,{'text':'```json {} ```'})[1])

    def test_transport_retry_only(self):
        from urllib.error import HTTPError
        call=unittest.mock.Mock(side_effect=[TimeoutError(),ConnectionError(),{'text':'ok'}])
        self.assertEqual(h.with_retries(call)[1],2)
        call=unittest.mock.Mock(side_effect=HTTPError('https://example.invalid',429,'rate',{},None))
        with self.assertRaises(HTTPError): h.with_retries(call)
        self.assertEqual(call.call_count,1)

    def test_live_refused_without_network(self):
        with patch.object(h,'request_json',side_effect=AssertionError('NETWORK')):
            with self.assertRaises(RuntimeError): h.run(self.config,Path('must-not-exist'),live=True)

    def test_validation(self):
        for invalid in ['NaN','-1','0']:
            c=copy.deepcopy(self.config); c['models'][0]['input_usd_per_million']=invalid
            with self.assertRaises(ValueError): h.validate(c)
        del self.config['models'][0]['temperature']
        with self.assertRaises(ValueError): h.validate(self.config)

    def test_adapters_with_synthetic_transport(self):
        import os
        with patch.dict(os.environ,{'OPENAI_API_KEY':'fake-openai','ANTHROPIC_API_KEY':'fake-anthropic'}):
            with patch.object(h,'request_json',return_value={'choices':[{'message':{'content':'fake-openai'}}],'usage':{'prompt_tokens':10,'completion_tokens':4}}) as transport:
                r=h.complete(self.config['models'][0],'hello')
                self.assertEqual(r['text'],'[REDACTED]')
                self.assertEqual(transport.call_args.args[2]['max_completion_tokens'],512)
            with patch.object(h,'request_json',return_value={'content':[{'type':'text','text':'ok'}],'usage':{'input_tokens':10,'output_tokens':4}}):
                self.assertEqual(h.complete(self.config['models'][1],'hello')['input_tokens'],10)

if __name__=='__main__': unittest.main()
