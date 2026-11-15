/**
 * Minimal Resend client (https://resend.com/docs/api-reference/emails).
 * RESEND_API_BASE can point at a mock for local tests.
 */
export interface OutgoingEmail {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
  tags?: Array<{ name: string; value: string }>;
}

export class ProviderHttpError extends Error {
  constructor(public readonly status: number) { super('Resend request failed: HTTP ' + status); }
}
export class ProviderRejection extends ProviderHttpError {}
export class ProviderSetupError extends ProviderHttpError {}

/** Allowlisted metadata only; never retain provider messages, bodies, addresses or tokens. */
export function safeSendError(error: unknown): { errorClass: string; status: number | null } {
  if (error instanceof ProviderHttpError) return {errorClass: error instanceof ProviderSetupError ? 'ProviderSetupError' : error instanceof ProviderRejection ? 'ProviderRejection' : 'ProviderHttpError', status: error.status};
  return {errorClass: error instanceof TypeError ? 'TypeError' : error instanceof SyntaxError ? 'SyntaxError' : 'Error', status: null};
}

export class ResendClient {
  constructor(
    private readonly apiKey: string,
    private readonly base = 'https://api.resend.com',
  ) {}

  private async post(path: string, body: string, idempotencyKey?: string): Promise<any> {
    const response = await fetch(`${this.base}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body,
    });
    if (!response.ok) {
      // Inspect only this documented discriminator; never log/store the error payload.
      const invalidKey400 = response.status === 400 && await response.json().then(value => value?.message === 'API key is invalid').catch(() => false);
      if (response.status !== 400) await response.body?.cancel();
      // Checked 2026-11-14: https://resend.com/docs/api-reference/errors
      // Sending 401/403 may be key/permission/domain setup faults. Keep the exact
      // request recoverable within our existing 23h window; other 400/422 are terminal.
      if (invalidKey400 || [401,403].includes(response.status)) {
        console.error('Newsletter operator action required: Resend HTTP ' + response.status + '. Check key, permissions and verified sending domain; retry the same batch within 23 hours.');
        throw new ProviderSetupError(response.status);
      }
      throw new ([400,404,405,413,415,422].includes(response.status) ? ProviderRejection : ProviderHttpError)(response.status);
    }
    const payload = await response.json().catch(() => ({}));
    return payload;
  }

  async send(email: OutgoingEmail, idempotencyKey?: string): Promise<string | null> {
    const result = await this.post('/emails', JSON.stringify(email), idempotencyKey);
    return result?.id ?? null;
  }

  /** Up to 100 emails per call. Returns provider ids in the same order. */
  async sendBatch(emails: OutgoingEmail[], idempotencyKey?: string): Promise<Array<string | null>> {
    return this.sendStoredBatch(JSON.stringify(emails), idempotencyKey);
  }

  /** Replay the exact bytes persisted before the first attempt. */
  async sendStoredBatch(body: string, idempotencyKey?: string): Promise<string[]> {
    const result = await this.post('/emails/batch', body, idempotencyKey);
    const data: Array<{ id?: string }> = Array.isArray(result?.data) ? result.data : [];
    if (data.length !== JSON.parse(body).length || data.some(row => typeof row.id !== 'string' || !row.id)) throw new Error('Resend batch response is incomplete; retain request for recovery');
    return data.map(row => row.id!);
  }
}
