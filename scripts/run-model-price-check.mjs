// Runs the model price checker and its tests before every build (npm prebuild).
// A missing Python or a failing check stops the build, so invalid price data
// can never be published.
import { spawnSync } from 'node:child_process';

const steps = [
  ['scripts/check-model-prices.py'],
  ['scripts/test_check_model_prices.py'],
];

function findPython() {
  for (const candidate of ['python3', 'python']) {
    const probe = spawnSync(candidate, ['--version'], { encoding: 'utf8' });
    if (probe.status === 0 && /Python 3\./.test(`${probe.stdout}${probe.stderr}`)) return candidate;
  }
  return null;
}

const python = findPython();
if (!python) {
  console.error('[model-prices] Python 3 is required to validate data/model-prices.json; build stopped.');
  process.exit(1);
}

for (const args of steps) {
  const result = spawnSync(python, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`[model-prices] ${args[0]} failed; build stopped.`);
    process.exit(result.status ?? 1);
  }
}
