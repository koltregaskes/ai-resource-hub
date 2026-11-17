import { registerHooks } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// Run the same TypeScript modules as CI without tsx's platform probing.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.')) {
      const url = new URL(specifier, context.parentURL);
      if (!existsSync(url) && existsSync(new URL(url.href + '.ts'))) {
        return nextResolve(url.href + '.ts', context);
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith('.ts')) {
      return { format: 'module', shortCircuit: true, source: ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText };
    }
    if (url.endsWith('.json')) {
      return { format: 'module', shortCircuit: true, source: 'export default ' + readFileSync(fileURLToPath(url), 'utf8') + ';' };
    }
    return nextLoad(url, context);
  },
});
