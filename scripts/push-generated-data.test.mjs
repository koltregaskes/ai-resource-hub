import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const script = resolve('scripts/push-generated-data.sh');
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'data-push-'));
  const remote = join(root, 'remote.git');
  const writer = join(root, 'writer');
  const peer = join(root, 'peer');
  const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  git(root, 'init', '--bare', '--initial-branch=main', remote);
  git(root, 'clone', remote, writer);
  const identity = cwd => { git(cwd, 'config', 'user.name', 'Fixture'); git(cwd, 'config', 'user.email', 'fixture@example.com'); };
  identity(writer);
  const commit = (cwd, file, text) => { writeFileSync(join(cwd, file), text); git(cwd, 'add', file); git(cwd, 'commit', '-m', file); };
  commit(writer, 'data.json', 'baseline\n');
  git(writer, 'push', 'origin', 'HEAD:main');
  git(root, 'clone', remote, peer);
  identity(peer);
  const run = () => spawnSync('bash', [script], { cwd: writer, encoding: 'utf8', timeout: 20000 });
  return { root, remote, writer, peer, git, commit, run };
}
test('rebases generated data over an unrelated concurrent merge and preserves both', () => {
  const f = fixture();
  f.commit(f.writer, 'data.json', 'generated\n');
  f.commit(f.peer, 'reviewed.txt', 'reviewed change\n');
  f.git(f.peer, 'push', 'origin', 'HEAD:main');
  assert.equal(f.run().status, 0);
  assert.equal(f.git(f.root, '--git-dir=' + f.remote, 'show', 'main:data.json'), 'generated');
  assert.equal(f.git(f.root, '--git-dir=' + f.remote, 'show', 'main:reviewed.txt'), 'reviewed change');
  assert.equal(f.git(f.writer, 'rev-parse', 'HEAD'), f.git(f.root, '--git-dir=' + f.remote, 'rev-parse', 'main'));
});
test('conflicting data fails without overwriting the remote', () => {
  const f = fixture();
  f.commit(f.writer, 'data.json', 'writer\n');
  f.commit(f.peer, 'data.json', 'peer\n');
  f.git(f.peer, 'push', 'origin', 'HEAD:main');
  const before = f.git(f.peer, 'rev-parse', 'HEAD');
  assert.notEqual(f.run().status, 0);
  assert.equal(f.git(f.root, '--git-dir=' + f.remote, 'rev-parse', 'main'), before);
  assert.equal(f.git(f.root, '--git-dir=' + f.remote, 'show', 'main:data.json'), 'peer');
});
test('dirty working trees fail without losing uncommitted output', () => {
  const f = fixture();
  writeFileSync(join(f.writer, 'data.json'), 'uncommitted\n');
  const result = f.run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /uncommitted/);
  assert.equal(readFileSync(join(f.writer, 'data.json'), 'utf8'), 'uncommitted\n');
});
test('an unchanged refresh is a successful no-op', () => {
  const f = fixture();
  const before = f.git(f.writer, 'rev-parse', 'HEAD');
  assert.equal(f.run().status, 0);
  assert.equal(f.git(f.writer, 'rev-parse', 'HEAD'), before);
});
test('a persistent push rejection fails after three attempts', () => {
  const f = fixture();
  f.git(f.root, '--git-dir=' + f.remote, 'config', 'receive.denyNonFastForwards', 'true');
  f.git(f.root, '--git-dir=' + f.remote, 'config', 'receive.denyDeletes', 'true');
  // A bad push URL exercises rejection without contacting any external service.
  f.git(f.writer, 'remote', 'set-url', '--push', 'origin', join(f.root, 'missing.git'));
  const result = f.run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /three attempts/);
  assert.equal((result.stderr.match(/does not appear to be a git repository/g) || []).length, 3);
});
