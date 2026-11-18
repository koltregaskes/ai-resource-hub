"""Oneshot accounting, output and gates. All exchanges use fake transports."""

import dataclasses
import json
import os
import sys
import tempfile
import unittest
from decimal import Decimal
from pathlib import Path
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import cli
import config
import keys
import ledger
import oneshot
import preflight
import providers
import records
import runner
import test_run_support as support

QUIET = lambda line: None


class OneshotTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.store, self.dest = self.root / "store", self.root / "out"
        self.cfg = support.make_config()
        self.prompts = [{"id": "brief-1", "prompt": "Build a demo.\nKeep this exact. £"}]

    def run_oneshot(self, **options):
        cfg = options.pop("config", self.cfg)
        prompts = options.pop("prompts", self.prompts)
        models = options.pop("model_ids", [s.model_id for s in cfg.models])
        limit = options.pop("output_limit", 4096)
        options.setdefault("out_dir", self.dest)
        return oneshot.run(cfg, prompts, models, limit, private_store=self.store,
                           out=QUIET, **options)

    def log(self, summary):
        return [json.loads(line) for line in Path(summary["log"]).read_text(encoding="utf-8").splitlines()]

    def test_dry_run_writes_each_pair_and_summary_without_reading_keys_or_grading(self):
        with mock.patch.object(keys, "load_keys", side_effect=AssertionError("no key reads")), \
                mock.patch.object(runner, "default_grade", side_effect=AssertionError("no grading")), \
                mock.patch.object(preflight, "preflight", side_effect=AssertionError("no plan gate")), \
                mock.patch.object(preflight, "pass_gate", side_effect=AssertionError("no pass gate")):
            summary = self.run_oneshot(key_file="never-read")
        self.assertEqual(summary["status"], "complete")
        self.assertFalse(summary["live"])
        self.assertEqual(len(summary["pairs"]), 2)
        self.assertEqual(json.loads((self.dest / "summary.json").read_text()), summary)
        for spec in self.cfg.models:
            base = self.dest / "brief-1" / spec.model_id
            receipt = json.loads(Path(str(base) + ".json").read_text())
            self.assertEqual(receipt["model"], spec.model_id)
            self.assertEqual(receipt["effort"], spec.reasoning_effort)
            self.assertEqual(receipt["output_limit"], 4096)
            for field in ("input_tokens", "output_tokens", "reasoning_tokens", "charge_usd",
                          "finish_reason", "truncated", "seconds", "utc_time", "request_id"):
                self.assertIn(field, receipt)
            self.assertTrue(Path(str(base) + ".txt").read_text().startswith("stub answer"))
            self.assertFalse(Path(str(base) + ".html").exists())
            self.assertTrue((self.store / "ledgers-dry" / summary["run_id"] /
                             (spec.provider + ".jsonl")).exists())
        self.assertFalse((self.store / "ledgers").exists())
        self.assertFalse((self.store / runner.STAGE_INDEX).exists())
        self.assertEqual([e["event"] for e in self.log(summary)],
                         ["started", "sent", "received", "done", "sent", "received", "done", "finished"])

    def test_exactly_one_user_prompt_for_both_providers_with_config_settings(self):
        transport = support.ScriptedTransport(default=lambda req: support.reply_body(req, "answer"))
        self.run_oneshot(transport=transport, output_limit=32768)
        self.assertEqual(len(transport.requests), 2)
        for req, spec in zip(transport.requests, self.cfg.models):
            self.assertEqual(support.prompt_of(req), self.prompts[0]["prompt"])
            self.assertEqual(req.body[spec.output_limit_parameter], 32768)
            self.assertEqual(req.timeout_seconds, 900)
            for field in ("system", "instructions", "tools", "previous_response_id"):
                self.assertNotIn(field, req.body)
            if spec.provider == "openai":
                self.assertEqual(req.body["input"], self.prompts[0]["prompt"])
                self.assertEqual(req.body["reasoning"], {"effort": spec.reasoning_effort})
            else:
                self.assertEqual(req.body["messages"], [{"role": "user", "content": self.prompts[0]["prompt"]}])
                self.assertEqual(req.headers["anthropic-version"], spec.api_version)
                self.assertEqual(req.body["output_config"], {"effort": spec.reasoning_effort})

    def test_four_prompts_and_four_models_send_sixteen_requests(self):
        models = [support.spec_dict(p, "model-%d" % n, "3", "15")
                  for n, p in enumerate(("openai", "anthropic", "openai", "anthropic"))]
        cfg = support.make_config(models=models)
        prompts = [{"id": "demo-%d" % n, "prompt": "Brief %d" % n} for n in range(4)]
        transport = runner.StubTransport()
        summary = self.run_oneshot(config=cfg, prompts=prompts, transport=transport)
        self.assertEqual(transport.calls, 16)
        self.assertEqual(len(summary["pairs"]), 16)

    def test_reservation_at_exact_provider_cap_and_next_request_refused(self):
        spec = self.cfg.models[0]
        worst = ledger.worst_case_usd(ledger.input_token_bound(self.prompts[0]["prompt"]), 4096, spec.price)
        cfg = dataclasses.replace(self.cfg, caps_usd={"openai": worst, "anthropic": Decimal("50")})
        prompts = self.prompts + [{"id": "brief-2", "prompt": self.prompts[0]["prompt"]}]
        transport = support.ScriptedTransport(default=support.ok(support.openai_body("no usage", usage=False)))
        lines = []
        summary = oneshot.run(cfg, prompts, [spec.model_id], 4096, out_dir=self.dest,
                              private_store=self.store, transport=transport, out=lines.append)
        self.assertEqual(len(transport.requests), 1)
        self.assertEqual([p["status"] for p in summary["pairs"]], ["ok", "refused"])
        self.assertEqual(Decimal(summary["total_cost_per_provider"]["openai"]), worst)
        self.assertIn("SKIPPED", lines[0])
        self.assertTrue((self.dest / "brief-2" / "m-oa.txt").exists())

    def test_provider_cap_refusal_skips_to_next_model(self):
        cfg = dataclasses.replace(self.cfg, caps_usd={"openai": Decimal("0"), "anthropic": Decimal("50")})
        summary = self.run_oneshot(config=cfg)
        self.assertEqual([p["status"] for p in summary["pairs"]], ["refused", "ok"])
        self.assertIsNone(summary["pairs"][0]["request_id"])

    def test_max_usd_covers_all_providers_and_can_fit_next_cheaper_model(self):
        spec = self.cfg.models[1]
        worst = ledger.worst_case_usd(ledger.input_token_bound(self.prompts[0]["prompt"]), 4096, spec.price)
        summary = self.run_oneshot(max_usd=worst)
        self.assertEqual([p["status"] for p in summary["pairs"]], ["refused", "ok"])
        self.assertIn("--max-usd", summary["pairs"][0]["error"])

    def test_max_usd_uses_settled_charges_and_reservations_across_providers(self):
        # The second request fits alone but not after paying for the first.
        spec = self.cfg.models[0]
        worst = ledger.worst_case_usd(ledger.input_token_bound(self.prompts[0]["prompt"]), 4096, spec.price)
        cap = worst + Decimal("0.01")
        transport = support.ScriptedTransport(default=support.ok(support.openai_body("held", usage=False)))
        summary = self.run_oneshot(max_usd=cap, transport=transport)
        self.assertEqual(len(transport.requests), 1)
        self.assertEqual(summary["pairs"][1]["status"], "refused")

    def test_live_reuses_existing_lifetime_ledger_without_stage_or_plan_gates(self):
        book = runner._ledgers(self.cfg, self.store, True, "old")["openai"]
        book.reserve("earlier/request", "49.99")
        book.settle("earlier/request", None, self.cfg.models[0].price)
        loaded = keys.LoadedKeys({p: keys.Secret.placeholder() for p in ("openai", "anthropic")})
        # Live branch is tested only with a fake loader and fake transport.
        with mock.patch.object(keys, "load_keys", return_value=loaded) as loader, \
                mock.patch.object(preflight, "preflight", side_effect=AssertionError("no plan gate")), \
                mock.patch.object(runner, "_earlier_steps_missing", side_effect=AssertionError("no stages")):
            summary = self.run_oneshot(live=True, key_file="not-opened",
                                      live_transport_factory=lambda gate: runner.StubTransport())
        loader.assert_called_once_with("not-opened", self.cfg.key_names)
        self.assertEqual([p["status"] for p in summary["pairs"]], ["refused", "ok"])
        self.assertEqual(runner._ledgers(self.cfg, self.store, True, "after")["openai"].spent,
                         Decimal("49.99"))

    def test_authorised_ceiling_is_also_enforced(self):
        with mock.patch.dict(config.AUTHORISED_CAPS_USD, {"openai": Decimal("0")}):
            summary = self.run_oneshot()
        self.assertEqual([p["status"] for p in summary["pairs"]], ["refused", "ok"])

    def test_lock_held_during_ledger_gate_transport_and_outputs_then_released(self):
        def check_lock():
            other = ledger.StoreLock(self.store)
            try:
                with self.assertRaises(ledger.StoreLocked):
                    other.acquire("competitor")
            finally:
                other.release()

        def exchange(request):
            check_lock()
            return support.reply_body(request, "answer")

        original = runner._ledgers

        def books(*args):
            check_lock()
            return original(*args)

        original_write = records.atomic_write

        def write(*args):
            check_lock()
            return original_write(*args)

        with mock.patch.object(runner, "_ledgers", side_effect=books), \
                mock.patch.object(records, "atomic_write", side_effect=write):
            self.run_oneshot(transport=exchange)
        other = ledger.StoreLock(self.store)
        other.acquire("after")
        other.release()

    def test_locked_store_refused_before_ledger_or_key_read(self):
        lock = ledger.StoreLock(self.store)
        lock.acquire("existing")
        try:
            with mock.patch.object(runner, "_ledgers", side_effect=AssertionError("no ledger")), \
                    mock.patch.object(keys, "load_keys", side_effect=AssertionError("no keys")):
                with self.assertRaises(runner.LiveRefused):
                    self.run_oneshot()
        finally:
            lock.release()
        self.assertFalse(self.dest.exists())

    def test_reserve_sent_received_settle_done_order_and_amount(self):
        spec = self.cfg.models[0]

        def exchange(req):
            files = list((self.store / "oneshot").glob("*.jsonl"))
            log = [json.loads(line) for line in files[0].read_text().splitlines()]
            self.assertEqual(log[-1]["event"], "sent")
            run_id = log[0]["run_id"]
            book = runner._ledgers(self.cfg, self.store, False, run_id)[spec.provider]
            expected = ledger.worst_case_usd(ledger.input_token_bound(self.prompts[0]["prompt"]), 4096, spec.price)
            self.assertEqual(book.reserved, expected)
            return support.reply_body(req, "answer")

        summary = self.run_oneshot(model_ids=[spec.model_id], transport=exchange)
        log = self.log(summary)
        self.assertEqual([e["event"] for e in log], ["started", "sent", "received", "done", "finished"])
        self.assertEqual(log[2]["result"]["text"], "answer")
        self.assertEqual(log[3]["charge_usd"], summary["pairs"][0]["charge_usd"])

    def test_transport_retries_have_independent_reservations_and_stage_limits(self):
        transport = support.ScriptedTransport(default=support.http(503))
        waits = []
        summary = self.run_oneshot(model_ids=["m-oa"], transport=transport, sleep=waits.append)
        self.assertEqual(len(transport.requests), providers.MAX_REQUESTS_PER_SLOT)
        self.assertEqual(waits, list(providers.RETRY_WAITS_SECONDS))
        self.assertEqual(len(summary["pairs"][0]["attempts"]), 3)
        self.assertEqual(Decimal(summary["pairs"][0]["charge_usd"]), 0)

    def test_timeout_and_provider_error_are_not_retried(self):
        for index, response in enumerate((providers.TransportTimeout(), support.http(400),
                                          support.http(429, {"error": {"code": "insufficient_quota"}}))):
            with self.subTest(response=response):
                transport = support.ScriptedTransport(default=response)
                self.run_oneshot(model_ids=["m-oa"], transport=transport, out_dir=self.root / str(index))
                self.assertEqual(len(transport.requests), 1)

    def test_retry_reservation_refused_without_sending_again(self):
        spec = self.cfg.models[0]
        worst = ledger.worst_case_usd(ledger.input_token_bound(self.prompts[0]["prompt"]), 4096, spec.price)
        transport = support.ScriptedTransport(default=providers.TransportFailure())
        summary = self.run_oneshot(model_ids=[spec.model_id], transport=transport, max_usd=worst)
        self.assertEqual(len(transport.requests), 1)
        self.assertEqual(summary["pairs"][0]["status"], "refused")
        self.assertEqual(Decimal(summary["pairs"][0]["charge_usd"]), worst)

    def test_overrun_stops_all_later_pairs_and_is_recorded(self):
        transport = support.ScriptedTransport(default=support.ok(support.openai_body("paid", output_tokens=9000)))
        summary = self.run_oneshot(transport=transport)
        self.assertEqual(len(transport.requests), 1)
        self.assertEqual([p["status"] for p in summary["pairs"]], ["interrupted", "skipped_after_overrun"])
        self.assertEqual((self.dest / "brief-1" / "m-oa.txt").read_text(), "paid")

    def test_unacknowledged_prior_overrun_refused_before_keys(self):
        books = runner._ledgers(self.cfg, self.store, True, "old")
        book = books["openai"]
        book.reserve("old/request", "0")
        book.settle("old/request", {"input_uncached": 10, "cached_input": 0, "output": 10},
                    self.cfg.models[0].price)
        with mock.patch.object(keys, "load_keys", side_effect=AssertionError("no keys")):
            with self.assertRaises(runner.LiveRefused):
                self.run_oneshot(live=True, key_file="not-opened")

    def test_scaled_adapter_deadlines_leave_stage_default_unchanged(self):
        adapter = providers.adapter_for(self.cfg.models[0])
        for limit, timeout in oneshot.TIMEOUTS.items():
            with self.subTest(limit=limit):
                transport = support.ScriptedTransport(default=support.ok(support.openai_body("answer"), elapsed=timeout - 1))
                result = adapter.call(transport, "prompt", limit, keys.Secret.placeholder(), timeout_seconds=timeout)
                self.assertEqual(result.status, providers.OK)
                self.assertEqual(transport.requests[0].timeout_seconds, timeout)
        result = adapter.call(support.ScriptedTransport(default=support.ok(support.openai_body("late"), elapsed=121)),
                              "prompt", 4096, keys.Secret.placeholder())
        self.assertEqual(result.status, providers.TIMEOUT)
        self.assertEqual(adapter.build_request("prompt", 4096, keys.Secret.placeholder()).timeout_seconds, 120)

    def test_real_transport_plumbing_uses_request_deadline_without_network(self):
        loaded = keys.LoadedKeys({"openai": keys.Secret("fictional-test-credential")})
        # Issuing a pass is mocked by the same loader as other live-gate tests.
        with mock.patch.object(keys, "load_keys", return_value=loaded):
            gate, _, _ = runner.open_live_gate(
                live=True, config=self.cfg, key_file="not-opened", tasks=[], stage="oneshot",
                private_store=self.store, remaining_caps=self.cfg.caps_usd)
        request = providers.adapter_for(self.cfg.models[0]).build_request(
            "prompt", 32768, loaded.secret("openai"))
        request.timeout_seconds = 900
        worker = mock.Mock()
        worker.is_alive.return_value = False

        def fake_worker(*, target, args, daemon):
            args[1]["response"] = support.ok(support.openai_body("answer"))
            return worker

        with mock.patch.object(providers.threading, "Thread", side_effect=fake_worker):
            providers.UrllibTransport(gate)(request)
        worker.join.assert_called_once_with(900)

        stream = mock.Mock()
        stream.read.side_effect = [b'{}', b'']
        stream.status = 200
        stream.headers = {}
        opener = mock.Mock()
        opener.open.return_value = stream
        box = {}
        with mock.patch.object(providers.urllib.request, "build_opener", return_value=opener):
            providers.UrllibTransport._exchange(request, box)
        self.assertEqual(opener.open.call_args.kwargs["timeout"], 900)
        self.assertNotIn("failure", box)
        self.assertEqual(box["response"].status, 200)

    def test_request_specific_timeout_classification(self):
        adapter = providers.adapter_for(self.cfg.models[0])
        transport = support.ScriptedTransport(default=support.ok(support.openai_body("late"), elapsed=601))
        result = adapter.call(transport, "prompt", 16384, keys.Secret.placeholder(), timeout_seconds=600)
        self.assertEqual(result.status, providers.TIMEOUT)
        self.assertEqual(result.error, "timeout after 600 s")

    def test_raw_html_tokens_truncation_and_exact_files(self):
        raw = "Here it is:\n```html\n<!DOCTYPE html><html><body>£</body></html>\n```\nDone."
        response = support.ok(support.openai_body(raw, input_tokens=42, output_tokens=100,
                                                reasoning=30, reason="max_output_tokens", status="incomplete"))
        summary = self.run_oneshot(model_ids=["m-oa"], transport=support.ScriptedTransport(default=response))
        receipt = summary["pairs"][0]
        self.assertEqual((receipt["input_tokens"], receipt["output_tokens"], receipt["reasoning_tokens"]), (42, 100, 30))
        self.assertTrue(receipt["truncated"])
        self.assertEqual((self.dest / "brief-1/m-oa.txt").read_text(encoding="utf-8"), raw)
        self.assertEqual((self.dest / "brief-1/m-oa.html").read_text(encoding="utf-8"),
                         "<!DOCTYPE html><html><body>£</body></html>")

    def test_reject_bad_ids_duplicate_prompts_and_missing_models_before_calls(self):
        for bad in ("../escape", "CON", "foo/bar", "foo\\bar", "C:foo", "name.", "NUL.txt"):
            with self.subTest(bad=bad), self.assertRaises(ValueError):
                self.run_oneshot(prompts=[{"id": bad, "prompt": "prompt"}])
        for prompts in ([], [{"id": "same", "prompt": "a"}, {"id": "SAME", "prompt": "b"}],
                        [{"id": "x", "prompt": ""}]):
            with self.assertRaises(ValueError):
                self.run_oneshot(prompts=prompts)
        for models in (["missing"], ["j-oa"], ["m-oa", "m-oa"], []):
            with self.assertRaises(ValueError):
                self.run_oneshot(model_ids=models)
        self.assertFalse(self.store.exists())

    def test_invalid_limits_are_rejected_before_the_store_is_created(self):
        for value in (400, 0, 32769, True, 4096.0):
            with self.subTest(value=value), self.assertRaises(ValueError):
                self.run_oneshot(output_limit=value)
        self.assertFalse(self.store.exists())

    def test_secret_guard_checks_both_journal_and_output(self):
        guard = lambda text: "fictional-private-value" in text
        import io
        journal = oneshot._Journal(io.BytesIO(), guard)
        with self.assertRaises(records.RecordError):
            journal.append("sent", request={"body": "fictional-private-value"})
        with self.assertRaises(records.RecordError):
            journal.write(self.dest / "answer.txt", "fictional-private-value")
        self.assertFalse(self.dest.exists())

    def test_never_overwrite_an_existing_output(self):
        self.dest.mkdir()
        (self.dest / "summary.json").write_text("previous")
        with self.assertRaises(ValueError):
            self.run_oneshot()
        self.assertEqual((self.dest / "summary.json").read_text(), "previous")

    def test_cli_dry_mode(self):
        cfg, prompts = self.root / "config.json", self.root / "prompts.json"
        cfg.write_text(json.dumps(support.config_dict()))
        prompts.write_text(json.dumps(self.prompts))
        args = ["oneshot", "--config", str(cfg), "--prompts", str(prompts),
                "--models", "m-oa,m-an", "--output-limit", "8192", "--out-dir", str(self.dest),
                "--private-store", str(self.store), "--max-usd", "1", "--key-file", "not-opened"]
        with mock.patch.object(keys, "load_keys", side_effect=AssertionError("no keys")):
            self.assertEqual(cli.main(args, out=QUIET), 0)
        self.assertTrue((self.dest / "summary.json").exists())

    def test_live_gate_refusals_never_load_keys(self):
        cases = [dict(live=False), dict(config=dataclasses.replace(self.cfg, live_approved=False)),
                 dict(config=dataclasses.replace(self.cfg, approved_by="")), dict(key_file=None),
                 dict(config=dataclasses.replace(self.cfg, live_blockers=("not ready",)))]
        for case in cases:
            args = dict(live=True, config=self.cfg, key_file="not-opened", tasks=[], stage="oneshot",
                        private_store=self.store, remaining_caps=self.cfg.caps_usd)
            args.update(case)
            with self.subTest(case=case), mock.patch.object(keys, "load_keys", side_effect=AssertionError("no keys")):
                with self.assertRaises(runner.LiveRefused):
                    runner.open_live_gate(**args)
        with mock.patch.object(runner, "LIVE_ENABLED", False), \
                mock.patch.object(keys, "load_keys", side_effect=AssertionError("no keys")):
            with self.assertRaises(runner.LiveRefused):
                self.run_oneshot(live=True, key_file="not-opened")

    def test_environment_guard_before_input_reads(self):
        with mock.patch.dict(os.environ, {"OPENAI_API_KEY": "fake-environment-value"}), \
                mock.patch.object(config, "load_config", side_effect=AssertionError("no reads")):
            self.assertEqual(cli.main(["oneshot"], out=QUIET), 2)
            with self.assertRaises(keys.EnvironmentNotClean):
                self.run_oneshot()


class HtmlExtractionTests(unittest.TestCase):
    def test_fences_documents_prose_and_fragments(self):
        for text, expected in [
            ("plain prose", None),
            ("before <!doctype html><html>x</html> after", "<!doctype html><html>x</html>"),
            ("before <HTML lang='en'>x</HTML> after", "<HTML lang='en'>x</HTML>"),
            ("```HTML\n<html>x</html>\n```\nprose", "<html>x</html>"),
            ("~~~html\n<div>x</div>\n~~~\nprose", "<div>x</div>"),
            ("```html\n<html>truncated", "<html>truncated"),
            ("```html\n<div>x</div>\n```", "<div>x</div>"),
            ("<html>truncated", "<html>truncated"),
        ]:
            with self.subTest(text=text):
                self.assertEqual(oneshot.extract_html(text), expected)


if __name__ == "__main__":
    unittest.main()
