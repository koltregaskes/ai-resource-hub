import { getReleaseStoryMappingFailures } from './release-story-mapping-policy';

const failures = getReleaseStoryMappingFailures();

console.log('Release Desk story-mapping verification');
if (failures.length > 0) {
  console.error(`BLOCK: ${failures.length} aliasless model-story mapping(s) found.`);
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log('OK every model-level related story contains an exact model or assigned family alias');
