# Newsletter Worker

Sign-up, double opt-in, category preferences, one-click unsubscribe and the daily send for the AI Resource Hub daily edition (hub #1497).

**Status: built and tested locally only. Not deployed.** Kol has a free Resend account (12 Nov 2026). There is no sending domain, Worker, key or database behind this yet; see "Going live" below.

## How it fits together
1. **Sign-up.** A reader picks categories on the site and submits the form. `POST /subscribe` stores a `pending` row and sends a confirmation email through Resend.
2. **Confirmation.** The reader clicks the signed link (`GET /confirm`), which marks them `subscribed`.
3. **Daily send.** Every morning the cron trigger calls `sendDaily`. It reads `https://theairesourcehub.com/newsletter/latest.json`, builds one email per reader from only their categories, and sends them in batches of 100.
   - Each email has `List-Unsubscribe` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (RFC 8058).
   - Before any daily provider call, an immutable outbox batch stores the exact JSON body, ordered recipients and idempotency key. A transaction reserves each reader/edition uniquely; a lease prevents concurrent recovery.
   - Accepted provider IDs are saved before per-reader send records. Recovery completes only missing records without another send. If acceptance was uncertain, recovery replays the original bytes and key, including the original tokens, even if the feed changes.
   - [Resend retains idempotency keys for 24 hours](https://resend.com/docs/dashboard/emails/idempotency-keys). Uncertain batches at least 23 hours old fail closed with a manual-reconciliation error; never clear reservations or retry under a new key. An operator must reconcile provider delivery before changing recovery state. Accepted batches can complete records after that window without calling Resend.
   - Apply the outbox tables in schema.sql during the approved database setup before deploying this version. No schema is applied by tests or builds. The stored bodies contain subscriber addresses and signed links and stay in the private operational database; never post them in logs or GitHub.
4. **Sign-up limits.** Checked in Neon before anything is stored or sent: one confirmation email per address per 15 minutes and five a day (extra requests get the same answer but nothing happens), 10 attempts per IP an hour and 300 for the whole site (both answer HTTP 429). Buckets store keyed hashes, never raw addresses or IPs. `RATE_IP_PER_HOUR` and `RATE_GLOBAL_PER_HOUR` override the two hourly limits.
5. **Consent.** Every sign-up gets a fresh single-use confirmation link; confirming uses it up and unsubscribing kills it, so an old link can't re-subscribe anyone. A sign-up from an address that is already subscribed doesn't touch its categories: it emails a link to confirm the new picks first.
6. **Signed links.** Every email has signed links to `/manage` (change categories) and `/unsubscribe`. Tokens are HMAC-SHA256 and bound to one purpose. Confirmation links expire after 7 days. Manage links expire after 45 days and stop at once on unsubscribe; unsubscribe links never expire. A `GET` on the unsubscribe link only shows a button, because mail scanners prefetch links; the unsubscribe happens on `POST`.

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

## Going live: the order, and who does what
Each step needs Kol's yes, because it covers accounts, DNS, secrets or going public. **Secrets rule: Kol runs every `wrangler secret put` command himself and pastes the value into its prompt. No agent reads, types, relays or stores a secret, and none goes into chat, files, issues or commits.**

1. **Resend account.** Done: Kol made a free account on 12 Nov 2026. Nothing more happens in Resend until step 3.
2. **Move the domain to Cloudflare.** theairesourcehub.com becomes a Cloudflare zone in the IONOS exit (hub #1413; website domains move on 26 Nov). That way the email DNS records go into Cloudflare once, rather than into IONOS and then again into Cloudflare.
3. **Sending domain.** Add `mail.theairesourcehub.com` in Resend. Kol does this himself, or an agent does it in his signed-in browser with his yes for that click. Then add the SPF, DKIM and return-path (MX) records Resend shows to the Cloudflare zone, plus a DMARC record. Wait until Resend shows the domain as verified.
4. **Worker domain.** In Cloudflare, add a route or custom domain for the Worker. Suggested: `newsletter.theairesourcehub.com`, which matches `API_URL` in `wrangler.toml`.
5. **Neon.** Run `schema.sql` on the Rooms OS database, ideally using a role that can only touch the `newsletter` schema.
6. **Secrets.** Kol runs these himself, in `workers/newsletter`, after `npx wrangler login`. Each command prompts for the value; nothing is echoed or saved locally.
   - **`npx wrangler secret put RESEND_API_KEY`.** Create the key in Resend at this point: "Sending access" only, restricted to `mail.theairesourcehub.com`. Paste it straight into the prompt.
   - **`npx wrangler secret put DATABASE_URL`.** Paste the connection string for the `newsletter` role.
   - **`npx wrangler secret put SIGNING_KEY`.** Paste any random string of at least 32 characters, for example from a password manager's generator. Changing it later breaks every link in emails already sent, so set it once.
   - **`npx wrangler secret put SEND_TOKEN`.** Paste another random string. It protects the manual `POST /send-daily` trigger.
   - **Optional: `npx wrangler secret put TURNSTILE_SECRET`**, if Turnstile is used on the form.
7. **Postal address.** Kol chooses the sender address for the email footer (UK PECR and US CAN-SPAM). An agent puts it in `POSTAL_ADDRESS` in `wrangler.toml`. It's not a secret, but it is personal, so check with Kol before it goes into a public repo. [CHECK: Kol, which address, and is a PO box or business address fine?]
8. **Deploy.** Run `npx wrangler deploy`, with Kol's yes, because it's a first public deploy.
9. **Test send.** With Kol's yes, sign up with Kol's own address, confirm it, then call `POST /send-daily?force=1` once. Check the email arrives, renders properly, and that one-click unsubscribe works from Gmail's own "Unsubscribe" button.
10. **Switch on the form.** Set `PUBLIC_NEWSLETTER_API` (and `PUBLIC_TURNSTILE_SITE_KEY` if used) in the site's deploy workflow, so the sign-up form appears and the page CSP allows the Worker. This is the "going public" moment for email.
11. **After deploy:** add the Resend bounce and complaint webhook (see below).

## Not covered yet
- **Bounce and complaint webhooks** from Resend. These should mark addresses `unsubscribed`. Add them after the deploy. The webhook signing secret follows the same rule: Kol sets it with `wrangler secret put`.
- **Edge rate limiting.** The Worker already limits sign-ups in the database (see below). Cloudflare's edge rules can add a cheaper first layer once the account exists.

### Closing a reconciled batch

A definite provider rejection closes its batch and preserves recipient reservations for that edition only. Recovery failures are reported in recoveryFailures, one batch at a time, without preventing a later edition. Ambiguous acceptance remains reserved and must never be retried after the safe key window. After checking the provider dashboard, an operator can close that exact batch in one SQL statement (replace the batch key, never invent provider IDs):

```sql
UPDATE newsletter.send_batches SET state='closed', request_body='', lease_token=NULL, lease_until=NULL WHERE site='ai-resource-hub' AND batch_key='<reconciled-batch-key>' AND state IN ('prepared','accepted');
```

Apply the updated schema at approved database setup before deploying this Worker. Completed or rejected requests have their sensitive request body erased immediately. Each send run also erases bodies at least 24 hours old, including ambiguous and accepted batches; accepted IDs and reservations survive. Run the sender regularly for this expiry sweep; it is not a database TTL when the Worker is stopped. No live schema or provider changes are performed by tests.
