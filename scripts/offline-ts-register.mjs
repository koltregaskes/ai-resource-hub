// Dependency-free TypeScript resolution for Node 26 offline regression tests.
import { registerHooks } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

globalThis.fetch = async () => { throw new Error('Network disabled for offline tests'); };
registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith('.json')) {
      return { format: 'module', source: `export default ${JSON.stringify(JSON.parse(readFileSync(new URL(url), 'utf8')))};`, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && context.parentURL) {
      const url = new URL(specifier, context.parentURL);
      for (const suffix of ['', '.ts', '.mjs', '/index.ts']) {
        const candidate = new URL(url.href + suffix);
        if (existsSync(fileURLToPath(candidate)) && !candidate.pathname.endsWith('/')) {
          try { return nextResolve(candidate.href, context); } catch (error) {
            if (error.code !== 'ERR_UNSUPPORTED_DIR_IMPORT') throw error;
          }
        }
      }
    }
    return nextResolve(specifier, context);
  },
});
