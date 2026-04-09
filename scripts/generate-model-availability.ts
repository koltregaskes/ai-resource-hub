import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { getAvailabilitySnapshot } from '../src/data/model-availability';

const ROOT = process.cwd();
const outPath = path.join(ROOT, 'public', 'data', 'model-availability.json');

mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(getAvailabilitySnapshot(), null, 2)}\n`, 'utf8');

console.log(`Generated ${outPath}`);
