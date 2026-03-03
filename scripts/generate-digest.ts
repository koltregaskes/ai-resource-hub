#!/usr/bin/env npx tsx
/**
 * Weekly newsletter digest generator.
 *
 * Run: npx tsx scripts/generate-digest.ts
 *
 * Generates a beautiful HTML newsletter from the past week's data:
 * - Top news stories
 * - New model releases
 * - Price changes (drops and increases)
 * - Notable benchmark updates
 * - Stealth model sightings
 *
 * Output: dist/newsletter/digest-YYYY-MM-DD.html
 * This can be pasted into Buttondown or sent via their API.
 */
import Database from 'better-sqlite3';
import path from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';

const DB_PATH = path.join(process.cwd(), 'data', 'the-ai-resource-hub.db');
const OUTPUT_DIR = path.join(process.cwd(), 'dist', 'newsletter');

function main() {
  const db = new Database(DB_PATH, { readonly: true });
  db.pragma('foreign_keys = ON');

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];
  const dateStr = now.toISOString().split('T')[0];

  console.log(`Generating weekly digest for ${weekAgoStr} to ${dateStr}...`);

  // ─── Gather Data ───────────────────────────────────────────

  // Recent news
  const news = db.prepare(`
    SELECT title, source, url, published_at, category
    FROM news
    WHERE published_at >= ?
    ORDER BY published_at DESC
    LIMIT 10
  `).all(weekAgoStr) as Array<{
    title: string; source: string; url: string; published_at: string; category: string;
  }>;

  // Price changes (significant drops)
  const priceDrops = db.prepare(`
    SELECT DISTINCT m.name, m.id,
           ph1.input_price AS old_input, ph1.output_price AS old_output,
           ph2.input_price AS new_input, ph2.output_price AS new_output,
           p.name AS provider, p.colour AS colour
    FROM price_history ph2
    JOIN price_history ph1 ON ph1.model_id = ph2.model_id
      AND ph1.recorded_at < ph2.recorded_at
      AND ph1.recorded_at >= datetime(?, '-7 days')
    JOIN models m ON ph2.model_id = m.id
    JOIN providers p ON m.provider_id = p.id
    WHERE ph2.recorded_at >= ?
      AND m.status = 'active'
      AND ((ph2.input_price + 3 * ph2.output_price) / 4) < ((ph1.input_price + 3 * ph1.output_price) / 4) * 0.9
    ORDER BY ((ph2.input_price + 3 * ph2.output_price) / 4) / ((ph1.input_price + 3 * ph1.output_price) / 4) ASC
    LIMIT 5
  `).all(weekAgoStr, weekAgoStr) as Array<{
    name: string; id: string;
    old_input: number; old_output: number;
    new_input: number; new_output: number;
    provider: string; colour: string;
  }>;

  // New models added this week
  const newModels = db.prepare(`
    SELECT m.name, m.id, m.quality_score, m.input_price, m.output_price,
           p.name AS provider, p.colour AS colour
    FROM models m
    JOIN providers p ON m.provider_id = p.id
    WHERE m.status = 'active'
      AND m.created_at >= ?
    ORDER BY m.quality_score DESC
    LIMIT 5
  `).all(weekAgoStr) as Array<{
    name: string; id: string; quality_score: number;
    input_price: number; output_price: number;
    provider: string; colour: string;
  }>;

  // Rumoured models
  const rumours = db.prepare(`
    SELECT codename, provider_id, status, notes
    FROM rumoured_models
    WHERE status = 'rumoured'
    ORDER BY first_seen DESC
    LIMIT 3
  `).all() as Array<{
    codename: string; provider_id: string | null; status: string; notes: string | null;
  }>;

  // Stats
  const totalModels = (db.prepare("SELECT COUNT(*) AS c FROM models WHERE status = 'active'").get() as { c: number }).c;
  const totalBenchmarks = (db.prepare('SELECT COUNT(*) AS c FROM benchmarks').get() as { c: number }).c;

  db.close();

  // ─── Generate HTML ─────────────────────────────────────────

  const siteUrl = 'https://theairesourcehub.com';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>The AI Resource Hub — Weekly Digest — ${dateStr}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f1117; color: #e1e4eb; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 30px 0 20px; border-bottom: 1px solid #2a2d37; margin-bottom: 24px; }
    .header h1 { font-size: 22px; font-weight: 800; color: #f0f2f5; margin: 0 0 4px; }
    .header p { font-size: 13px; color: #8b8fa3; margin: 0; }
    .section { margin-bottom: 28px; }
    .section h2 { font-size: 16px; font-weight: 700; color: #f0f2f5; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid #2a2d37; }
    .card { background: #1a1d27; border: 1px solid #2a2d37; border-radius: 10px; padding: 14px; margin-bottom: 10px; }
    .card-title { font-size: 14px; font-weight: 600; color: #f0f2f5; margin: 0 0 4px; }
    .card-title a { color: #6c8aff; text-decoration: none; }
    .card-title a:hover { text-decoration: underline; }
    .card-meta { font-size: 11px; color: #8b8fa3; margin: 0; }
    .card-body { font-size: 13px; color: #b0b4c3; margin: 6px 0 0; line-height: 1.5; }
    .badge { display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 99px; font-weight: 500; }
    .badge-yellow { background: rgba(234, 179, 8, 0.1); color: #eab308; }
    .badge-green { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
    .badge-blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }
    .price-change { font-family: monospace; font-size: 12px; }
    .price-drop { color: #22c55e; }
    .stats-row { display: flex; gap: 12px; margin-bottom: 16px; }
    .stat-card { flex: 1; background: #1a1d27; border: 1px solid #2a2d37; border-radius: 10px; padding: 12px; text-align: center; }
    .stat-number { font-size: 24px; font-weight: 800; color: #6c8aff; }
    .stat-label { font-size: 11px; color: #8b8fa3; }
    .cta { display: block; text-align: center; background: #6c8aff; color: #fff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 20px 0; }
    .cta:hover { opacity: 0.9; }
    .footer { text-align: center; padding: 24px 0; border-top: 1px solid #2a2d37; margin-top: 24px; }
    .footer p { font-size: 11px; color: #8b8fa3; margin: 4px 0; }
    .footer a { color: #6c8aff; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>The AI Resource Hub</h1>
      <p>Weekly Digest — ${new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-number">${totalModels}</div>
        <div class="stat-label">Models tracked</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${totalBenchmarks}</div>
        <div class="stat-label">Benchmarks</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${news.length}</div>
        <div class="stat-label">Stories this week</div>
      </div>
    </div>

    ${newModels.length > 0 ? `
    <!-- New Models -->
    <div class="section">
      <h2>New Model Releases</h2>
      ${newModels.map(m => `
        <div class="card">
          <p class="card-title">
            <span class="dot" style="background-color: ${m.colour}"></span>
            <a href="${siteUrl}/models/${m.id}/">${m.name}</a>
          </p>
          <p class="card-meta">${m.provider} &middot; Quality: ${m.quality_score}/100 &middot; $${((m.input_price + 3 * m.output_price) / 4).toFixed(2)}/1M tokens (blended)</p>
        </div>
      `).join('')}
    </div>` : ''}

    ${priceDrops.length > 0 ? `
    <!-- Price Drops -->
    <div class="section">
      <h2>Notable Price Changes</h2>
      ${priceDrops.map(d => {
        const oldBlend = (d.old_input + 3 * d.old_output) / 4;
        const newBlend = (d.new_input + 3 * d.new_output) / 4;
        const pct = ((newBlend - oldBlend) / oldBlend * 100).toFixed(0);
        return `
        <div class="card">
          <p class="card-title">
            <span class="dot" style="background-color: ${d.colour}"></span>
            <a href="${siteUrl}/models/${d.id}/">${d.name}</a>
            <span class="badge badge-green">${pct}%</span>
          </p>
          <p class="card-meta price-change">
            $${oldBlend.toFixed(2)} &rarr; <span class="price-drop">$${newBlend.toFixed(2)}</span> per 1M tokens (blended)
          </p>
        </div>`;
      }).join('')}
    </div>` : ''}

    ${news.length > 0 ? `
    <!-- Top News -->
    <div class="section">
      <h2>Top Stories</h2>
      ${news.map(n => `
        <div class="card">
          <p class="card-title"><a href="${n.url}">${n.title}</a></p>
          <p class="card-meta">${n.source} &middot; ${new Date(n.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
        </div>
      `).join('')}
    </div>` : ''}

    ${rumours.length > 0 ? `
    <!-- Rumours -->
    <div class="section">
      <h2>Stealth Model Watch</h2>
      ${rumours.map(r => `
        <div class="card">
          <p class="card-title">${r.codename} <span class="badge badge-yellow">Rumoured</span></p>
          ${r.notes ? `<p class="card-body">${r.notes}</p>` : ''}
        </div>
      `).join('')}
      <p style="font-size: 12px; color: #8b8fa3; margin-top: 8px;">
        <a href="${siteUrl}/rumours/" style="color: #6c8aff;">See all rumours &rarr;</a>
      </p>
    </div>` : ''}

    <a href="${siteUrl}" class="cta">Explore The AI Resource Hub</a>

    <div class="footer">
      <p>You're receiving this because you subscribed to The AI Resource Hub newsletter.</p>
      <p><a href="${siteUrl}">Website</a> &middot; <a href="${siteUrl}/references/">Sources</a> &middot; <a href="${siteUrl}/methodology/">Methodology</a></p>
      <p style="margin-top: 12px;">Independent. Not affiliated with any AI provider.</p>
    </div>
  </div>
</body>
</html>`;

  // ─── Write Output ──────────────────────────────────────────
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const outputPath = path.join(OUTPUT_DIR, `digest-${dateStr}.html`);
  writeFileSync(outputPath, html, 'utf-8');

  console.log(`\nDigest generated: ${outputPath}`);
  console.log(`  News stories: ${news.length}`);
  console.log(`  New models: ${newModels.length}`);
  console.log(`  Price drops: ${priceDrops.length}`);
  console.log(`  Active rumours: ${rumours.length}`);
}

main();
