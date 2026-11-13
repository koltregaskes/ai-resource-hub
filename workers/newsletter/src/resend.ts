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
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`Resend ${path} failed: HTTP ${response.status} ${JSON.stringify(payload).slice(0, 200)}`);
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
