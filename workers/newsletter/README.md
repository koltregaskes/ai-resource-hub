# Newsletter Worker

Sign-up, double opt-in, category preferences, one-click unsubscribe and the daily send for the AI Resource Hub daily edition (hub #1497).

**Status: built and tested locally only. Not deployed.** Nothing here has a Cloudflare account, a Resend key or a database behind it yet.

## How it fits together
1. **Sign-up.** A reader picks categories on the site and submits the form. `POST /subscribe` stores a `pending` row and sends a confirmation email through Resend.
2. **Confirmation.** The reader clicks the signed link (`GET /confirm`), which marks them `subscribed`.
3. **Daily send.** Every morning the cron trigger calls `sendDaily`. It reads `https://theairesourcehub.com/newsletter/latest.json`, which is the most recent complete UK day (normally yesterday), and sends nothing unless that edition is yesterday's. It builds one email per reader from only their categories and sends them in batches of 100. The 06:30 writer job (`editorial/writer/`) adds the "why it matters" notes before the 07:15 UTC send.
   - Each email has `List-Unsubscribe` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (RFC 8058).
   - A `sends` row per reader per edition stops double sends.
4. **Signed links.** Every email has signed links to `/manage` (change categories) and `/unsubscribe`. Tokens are HMAC-SHA256 and bound to one purpose. Confirmation links expire after 7 days. A `GET` on the unsubscribe link only shows a button, because mail scanners prefetch links; the unsubscribe happens on `POST`.

The categories come from `shared/news-categories.json`, the same file the site uses. The tables are in `schema.sql` (Neon, schema `newsletter`).

## Run the tests
```bash
cd workers/newsletter
npm install
npm test
```
The tests run the bundled Worker in Miniflare (the real workerd runtime), with no listening port and no network:
- Resend and the edition feed are answered by an outbound mock.
- Storage is in memory, which the Worker only allows when `ENVIRONMENT=test`.

To preview an email built from a real edition (nothing is sent), run this from the repo root:
```bash
npx tsx workers/newsletter/scripts/render-sample.ts 2026-11-11 models,agents,policy sample.html
```

## What Kol needs to do before this goes live
Each step needs Kol's yes, because it covers accounts, spending, DNS or going public.
1. **Resend account.** Create a free account at resend.com.
   - Add the sending domain, suggested `mail.theairesourcehub.com`.
   - Create an API key with "sending access" only.
2. **Cloudflare account.** This may already exist under the IONOS exit (#1413). We need Workers on the free plan, and optionally Turnstile for the form.
3. **DNS.** Add the SPF, DKIM and DMARC records Resend shows for the sending domain. Add a route or custom domain for the Worker (suggested `newsletter.theairesourcehub.com`).
4. **Neon.** Run `schema.sql` on the Rooms OS database, ideally with a role that can only touch the `newsletter` schema.
5. **Secrets.** Set these with `wrangler secret put`, never in files:
   - `SIGNING_KEY` (any random string of at least 32 characters);
   - `RESEND_API_KEY`;
   - `DATABASE_URL`;
   - `SEND_TOKEN`;
   - optionally `TURNSTILE_SECRET`.
6. **Postal address.** Fill in `POSTAL_ADDRESS` in `wrangler.toml`. UK and US email rules expect a sender address in the footer. [CHECK: Kol, which address?]
7. **Deploy and switch on.** Deploy with `wrangler deploy`. Then set `PUBLIC_NEWSLETTER_API` (and `PUBLIC_TURNSTILE_SITE_KEY` if used) in the site's deploy workflow, so the sign-up form appears and the page CSP allows the Worker.

## Not covered yet
- **Bounce and complaint webhooks** from Resend. These should mark addresses `unsubscribed`. That's a small follow-up once the account exists.
- **Rate limiting** beyond Turnstile. Cloudflare's rate-limiting rules can do this at the edge once the account exists.
