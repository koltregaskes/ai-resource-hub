/**
 * Signed links: no accounts, no passwords. A token is
 *   base64url(JSON payload) + "." + base64url(HMAC-SHA256(payload, SIGNING_KEY))
 * and is bound to one purpose so an unsubscribe link can't confirm, and so on.
 */
export type TokenPurpose = 'confirm' | 'manage' | 'unsubscribe';

export interface TokenPayload {
  p: TokenPurpose;
  sid: string; // subscriber id
  exp?: number; // unix seconds; confirm and manage links expire, unsubscribe links do not
  n?: string; // confirm: single-use nonce, must match the reader's current pending confirmation
  g?: number; // manage: token generation, bumped on unsubscribe so old manage links stop working
}

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  if (!secret || secret.length < 32) throw new Error('SIGNING_KEY must be at least 32 characters');
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function signToken(payload: TokenPayload, secret: string): Promise<string> {
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifyToken(
  token: string | null,
  purpose: TokenPurpose,
  secret: string,
  now: number = Math.floor(Date.now() / 1000),
): Promise<TokenPayload | null> {
  if (!token) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  let valid = false;
  try {
    valid = await crypto.subtle.verify('HMAC', await hmacKey(secret), new Uint8Array(fromBase64Url(signature)), encoder.encode(body));
  } catch {
    return null;
  }
  if (!valid) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as TokenPayload;
    if (payload.p !== purpose || typeof payload.sid !== 'string') return null;
    if (payload.exp !== undefined && payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Keyed hash for rate-limit buckets, so raw addresses and IPs are never stored. */
export async function keyedHash(value: string, secret: string): Promise<string> {
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(value));
  return [...new Uint8Array(signature)].slice(0, 16).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** SHA-256 hex, used for stable provider idempotency keys. */
export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}