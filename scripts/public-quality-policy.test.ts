import assert from 'node:assert/strict';
import test from 'node:test';
import { getPublicQualityPolicyFailures } from './public-quality-policy';

test('legacy model quality is suppressed from every public ranking and export surface', () => {
  assert.deepEqual(getPublicQualityPolicyFailures(), []);
});
