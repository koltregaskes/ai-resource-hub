"""Offline regressions for PR 148's remaining paid-run gate."""
import copy
import json
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import test_run_recovery as recovery

runner = recovery.runner
ledger = recovery.ledger


class PaidGateTests(recovery.KillCase):
    def test_changed_marking_criteria_refuses_resume_before_any_call(self):
        run_id = self.kill("before_grade")
        before = self.calls()
        for change in ("check_text", "reference", "answerable", "family", "split"):
            with self.subTest(change=change):
                tasks = copy.deepcopy(self.tasks)
                if change == "check_text":
                    tasks[0]["grader"]["checks"][0]["text"] = "Different criterion"
                elif change == "reference":
                    tasks[0]["grader"]["reference"] = "Different answer"
                else:
                    tasks[0][change] = {"answerable": False, "family": 3,
                                        "split": "held-out"}[change]
                with self.assertRaisesRegex(recovery.records.RecordError, "task set has changed"):
                    self.resume(run_id, tasks=tasks)
                self.assertEqual(self.calls(), before)
        done, _, _ = self.resume(run_id, tasks=list(reversed(self.tasks)))
        self.finished(done)
        self.assertEqual(self.calls(), recovery.ONCE)

    def test_stage_mid_append_kill_recovers_sealed_run_and_keeps_bytes(self):
        run_id = self.kill("before_rename")
        path = os.path.join(self.store, runner.STAGE_INDEX)
        earlier = {"run_id": "earlier", "stage": "qualify", "live": True}
        runner._record_stage(self.store, earlier)
        with open(path, "rb") as stream:
            prefix = stream.read()
        # Kill in the actual append used by _record_stage, after flushing
        # half the record. No exception handler can finish the write.
        code = '''
import builtins, os, sys
sys.path.insert(0, sys.argv[1])
import runner
real = builtins.open
class Half:
    def __init__(self, stream): self.stream = stream
    def __enter__(self): return self
    def __exit__(self, *args): self.stream.close()
    def write(self, data):
        self.stream.write(data[:len(data)//2]); self.stream.flush()
        os.fsync(self.stream.fileno()); os._exit(74)
def opened(path, mode='r', *args, **kwargs):
    stream = real(path, mode, *args, **kwargs)
    return Half(stream) if str(path).endswith('stages.jsonl') and mode == 'a' else stream
builtins.open = opened
runner._record_stage(sys.argv[2], {'run_id': sys.argv[3], 'stage': 'canary'})
'''
        killed = subprocess.run([sys.executable, "-I", "-B", "-c", code,
                                 os.path.dirname(runner.__file__), self.store, run_id],
                                capture_output=True, timeout=30)
        self.assertEqual(killed.returncode, recovery.KILLED, killed.stderr)
        with open(path, "rb") as stream:
            tail = stream.read()[len(prefix):]
        done, transport, _ = self.resume(run_id)
        self.finished(done)
        self.assertEqual((transport.requests, self.calls()), ([], recovery.ONCE))
        with open(path + ".torn", encoding="utf-8") as stream:
            saved = json.loads(stream.readline())
        self.assertEqual(recovery.base64.b64decode(saved["bytes_base64"]), tail)
        with open(path, "rb") as stream:
            self.assertEqual(stream.read(), prefix)
        entry = {"run_id": run_id, "stage": "canary"}
        runner._record_stage(self.store, entry)
        runner._record_stage(self.store, entry)
        self.assertEqual(runner._stage_history(self.store), [earlier, entry])
        with open(path, "ab") as stream:
            stream.write(b'broken middle\n{"run_id":"later"}\n')
        with self.assertRaises(ValueError):
            runner._stage_history(self.store)

    def test_positive_zero_and_maximum_reconciliation_keep_lost_calls_blocked(self):
        for kind in ("model", "judge"):
            for amount in ("0", "0.00018", None):
                with self.subTest(kind=kind, amount=amount):
                    self.setUp()
                    run_id = self.kill("before_received", kind)
                    ((request, _),) = self.in_flight(run_id)
                    self.resume(run_id)
                    before = self.calls()
                    self.reconcile(run_id, usd=amount)
                    for _ in range(3):
                        waiting, transport, _ = self.resume(run_id)
                        self.assertIn(request, waiting["awaiting_reconciliation"])
                        self.assertEqual(transport.requests, [])
                        self.assertEqual(self.calls(), before)
                    self.reconcile(run_id, usd=amount, retry_lost_paid=True)
                    printed = []
                    transport = recovery.CountingTransport(self.calls_path)

                    def send(call):
                        self.assertTrue(any("SECOND PAID CALL for request " + request
                                            in line for line in printed))
                        return transport(call)

                    done = self.run_stage(stage="canary", resume=run_id, transport=send,
                                          grade=recovery.cases.JudgingTests.grade,
                                          out=printed.append)
                    self.finished(done)
                    self.assertEqual(len(transport.requests), 3 if kind == "model" else 1)
                    self.assertEqual(sorted(self.calls().values()), [1, 1, 1, 1, 1, 2])
                    self.doCleanups()
