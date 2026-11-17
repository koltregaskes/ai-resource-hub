import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const [mode, directory] = process.argv.slice(2);
if (mode === 'create') {
  fs.mkdirSync(directory, { recursive: true });
  // Random synthetic data has no provider/account and must still trigger the credential rule.
  fs.writeFileSync(path.join(directory, 'credential-pattern.txt'), "const DEMO_API_KEY = '" + crypto.randomBytes(32).toString('hex') + "';\n");
  fs.writeFileSync(path.join(directory, 'public-proof.txt'), "export const INDEXNOW_KEY = '" + crypto.randomBytes(32).toString('hex') + "'; // gitleaks:allow\n");
} else if (mode === 'verify') {
  const findings = JSON.parse(fs.readFileSync(path.join(directory, 'controls.json'), 'utf8'));
  assert.ok(findings.length === 1, 'Exactly one synthetic credential control must be detected');
  assert.ok(findings[0].RuleID === 'generic-api-key', 'The generic credential rule remains active');
  assert.ok(path.basename(findings[0].File) === 'credential-pattern.txt', 'Only the unannotated control must fail');
  console.log('Credential negative control detected; public-proof annotation control passed; values withheld');
} else {
  throw new Error('Use create or verify with the task-owned directory');
}
