import { registerHooks, stripTypeScriptTypes } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
registerHooks({
 resolve(specifier, context, next) {
  if (specifier.startsWith('.')) {
   const url = new URL(specifier, context.parentURL);
   if (!existsSync(url) && existsSync(new URL(url.href + '.ts'))) return next(url.href + '.ts', context);
  }
  return next(specifier, context);
 },
 load(url, context, next) {
  if (url.endsWith('.ts')) return {format:'module',shortCircuit:true,source:stripTypeScriptTypes(readFileSync(new URL(url),'utf8'))};
  if (url.endsWith('.json')) return {format:'module',shortCircuit:true,source:'export default '+readFileSync(new URL(url),'utf8')+';'};
  return next(url,context);
 }
});
