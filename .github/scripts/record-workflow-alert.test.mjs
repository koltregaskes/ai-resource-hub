import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
import { alertConnectionOptions } from "./alert-connection-options.mjs";

// Read source only. The VM receives a synthetic process, fs and pg; it cannot
// read the host environment, load pg, open a connection or write a summary file.
const source = readFileSync(new URL("./record-workflow-alert.mjs", import.meta.url), "utf8")
  .replace('import fs from "node:fs";', 'const fs = fakeFs;')
  .replace('import { alertConnectionOptions } from "./alert-connection-options.mjs";', '')
  .replace('await import("pg")', 'fakePg');
assert.ok(!/\bimport\s*(?:\(|[\s{])/.test(source), "all imports must be isolated");

async function run({ url = "postgresql://fake:fixture@db.invalid/fixture", missing = false,
  trusted = true, rows = [[{ id: "fixture-id", ingested_at: "2026-11-15T21:33:00Z" }]],
  queryError = false, mutateOptions } = {}) {
  const env = {
    ROOMS_OS_DATABASE_URL: url, ALERT_RUN_ID: "123", ALERT_REPOSITORY: "fixture/repo",
    ALERT_WORKFLOW: "Validate", ALERT_HTML_URL: "https://example.invalid/runs/123",
    ALERT_OCCURRED_AT: "2026-11-15T21:33:00Z", ALERT_HEAD_SHA: "a".repeat(40),
    ALERT_HEAD_BRANCH: "fixture-branch", ALERT_EVENT: "pull_request", ALERT_CONCLUSION: "failure",
  };
  if (missing) delete env.ROOMS_OS_DATABASE_URL;
  const state = { logs: [], queries: [], connects: 0, ends: 0, code: 0 };
  const exit = new Error("synthetic exit");
  class Client {
    constructor(options) { state.options = options; mutateOptions?.(options); }
    async connect() {
      state.connects++;
      // A fake certificate authority rejects the untrusted peer only when the
      // production policy enables verification. This is not a real TLS test.
      if (!trusted && state.options.ssl?.rejectUnauthorized !== false) {
        throw new Error("certificate is not trusted");
      }
    }
    async query(sql, params) {
      state.queries.push({ sql, params });
      if (queryError) throw new Error("fixture database failure");
      return { rows: rows.shift() || [] };
    }
    async end() { state.ends++; }
  }
  const context = vm.createContext({
    fakeFs: { appendFileSync() { throw new Error("unexpected filesystem write"); } },
    fakePg: { Client }, alertConnectionOptions,
    process: { env, exit(code) { state.code = code; throw exit; } },
    console: { log(value) { state.logs.push(value); } },
  });
  try { await vm.runInContext(`(async () => { ${source}\n })()`, context); }
  catch (error) { if (error !== exit) throw error; }
  state.output = state.logs.join("\n");
  return state;
}

test("connection URL cannot replace verified TLS or read certificate files", () => {
  for (const suffix of ["", "?sslmode=disable", "?sslmode=no-verify", "?sslmode=require",
    "?ssl=false", "?sslmode=prefer&uselibpqcompat=true", "?sslcert=x&sslkey=y&sslrootcert=z",
    "?SSLMODE=disable&sslmode=require&application_name=alert"]) {
    const options = alertConnectionOptions(`postgres://fake:fixture@db.invalid/fixture${suffix}`);
    assert.equal(options.ssl.rejectUnauthorized, true);
    const parsed = new URL(options.connectionString);
    assert.ok([...parsed.searchParams.keys()].every(key => !/^(ssl|uselibpqcompat)/i.test(key)));
    assert.equal(parsed.hostname, "db.invalid");
    if (suffix.includes("application_name")) assert.equal(parsed.searchParams.get("application_name"), "alert");
  }
});
test("trusted fake connection inserts parameterized payload and closes", async () => {
  const state = await run();
  assert.equal(state.code, 0);
  assert.equal(state.options.ssl.rejectUnauthorized, true);
  assert.equal(state.queries.length, 1);
  assert.match(state.queries[0].sql, /ON CONFLICT.*DO NOTHING/s);
  assert.equal(state.queries[0].params[0], "fixture/repo");
  assert.equal(state.queries[0].params[1], "123");
  assert.match(state.output, /^# DELIVERED:/);
  assert.equal(state.ends, 1);
});
test("untrusted fake peer fails before INSERT, including URL override attempts", async () => {
  for (const suffix of ["", "?sslmode=disable", "?sslmode=no-verify", "?ssl=false"]) {
    const state = await run({ trusted: false, url: `postgres://fake:fixture@db.invalid/db${suffix}` });
    assert.equal(state.code, 1);
    assert.equal(state.queries.length, 0);
    assert.match(state.output, /^# NOT DELIVERED:/);
    assert.equal(state.ends, 1);
  }
});
test("negative control: old unsafe policy accepts fake untrusted peer", async () => {
  const state = await run({ trusted: false, mutateOptions(options) { options.ssl.rejectUnauthorized = false; } });
  assert.equal(state.queries.length, 1);
  assert.match(state.output, /^# DELIVERED:/);
});
test("missing connection fails without constructing or connecting pg", async () => {
  const state = await run({ missing: true });
  assert.equal(state.code, 1);
  assert.equal(state.connects, 0);
  assert.match(state.output, /^# NOT DELIVERED:/);
});
test("invalid connection URL fails closed with no URL disclosure", async () => {
  for (const url of ["fixture-not-a-url", "https://fake:fixture@db.invalid/db"]) {
    const state = await run({ url });
    assert.equal(state.code, 1);
    assert.equal(state.connects, 0);
    assert.ok(!state.output.includes(url));
    assert.match(state.output, /^# NOT DELIVERED:/);
  }
});
test("duplicate run returns the existing ledger id", async () => {
  const state = await run({ rows: [[], [{ id: "existing", ingested_at: "fixture-time" }]] });
  assert.equal(state.code, 0);
  assert.equal(state.queries.length, 2);
  assert.match(state.output, /Deduped:/);
  assert.match(state.output, /Alert id: existing/);
});
test("no returned or existing id fails delivery", async () => {
  const state = await run({ rows: [[], []] });
  assert.equal(state.code, 1);
  assert.match(state.output, /^# NOT DELIVERED:/);
});
test("query failure reports undelivered and closes", async () => {
  const state = await run({ queryError: true });
  assert.equal(state.code, 1);
  assert.match(state.output, /^# NOT DELIVERED:/);
  assert.equal(state.ends, 1);
});
