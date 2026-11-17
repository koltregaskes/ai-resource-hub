/** Serialize JSON-LD safely inside an HTML script element. */
export function serializeJsonLd(data: unknown): string {
  const escapes: Record<string, string> = {
    '<': '\\u003c',
    '>': '\\u003e',
    '&': '\\u0026',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029',
  };
  return JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (character) => escapes[character]);
}
