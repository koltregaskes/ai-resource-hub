// Test-only bundle: fault injection never enters the production Worker bundle.
import { sendDaily } from '../src/index';
import { memoryStore, memorySeed, memorySnapshot } from '../src/store';
let seeded = false;
let calls = 0;
let failed = false;
const writes: Record<string, number> = {};
export default {
  async fetch(request: Request, env: any) {
    const store = memoryStore();
    if (!seeded) { memorySeed(Number(env.TEST_READERS)||2, ['models'], 'recovery'); seeded = true; }
    if (new URL(request.url).pathname === '/state') return Response.json({ pending: await store.listPendingBatches(), batches: memorySnapshot().batches, sends: memorySnapshot().sends, writes });
    const faultStore = { ...store,
      async recordSend(id: string, date: string, provider: string | null) {
        calls++;
        if (env.FAIL_MODE === 'record' && calls === 2 && !failed) { failed = true; throw new Error('injected recordSend failure after provider acceptance'); }
        writes[id] = (writes[id] || 0) + 1;
        return store.recordSend(id, date, provider);
      },
      async acceptBatch(key: string, token: string, ids: string[]) {
        if (env.FAIL_MODE === 'accept' && !failed) { failed = true; throw new Error('injected acceptance persistence failure'); }
        return store.acceptBatch(key, token, ids);
      },
    };
    try { const options = await request.json() as any; return Response.json(await sendDaily(env, faultStore, { force: true, nowMs: options.now })); }
    catch (error) { return Response.json({ error: String(error) }, { status: 500 }); }
  },
};
