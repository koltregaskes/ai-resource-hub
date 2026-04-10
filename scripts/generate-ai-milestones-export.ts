import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { getAiMilestonesSnapshot } from '../src/data/ai-milestones';

const ROOT = process.cwd();
const outPath = path.join(ROOT, 'public', 'data', 'ai-milestones.json');

mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(getAiMilestonesSnapshot(), null, 2)}\n`, 'utf8');

console.log(`Generated ${outPath}`);
