/**
 * Email bodies. Every email built here is plain, light HTML plus a text part.
 * The daily email opens with a short prose round-up (Kol rejected the 24 Oct
 * test for having none, hub #618), then the reader's stories only.
 */
export interface EditionStory {
  rank: number;
  title: string;
  url: string;
  source: string;
  summary: string;
  category: string;
  categoryLabel: string;
  company: string | null;
  whyItMatters: string | null;
}

export interface EditionPayload {
  date: string;
  dateLabel: string;
  url: string;
  sixtySeconds: string;
  stories: EditionStory[];
}

export interface BuiltEmail {
  subject: string;
  html: string;
  text: string;
}

const esc = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function listJoin(parts: string[]): string {
  if (parts.length <= 1) return parts.join('');
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

function shell(body: string, footer: string): string {
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"></head>
<body style="margin:0;padding:0;background:#f6f0e3;">
<div style="max-width:620px;margin:0 auto;padding:24px 20px;font-family:Arial,Helvetica,sans-serif;color:#1d1915;line-height:1.5;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;"><tr>
<td style="padding:0 10px 0 0;vertical-align:middle;"><img src="https://theairesourcehub.com/logo-email.png" width="36" height="36" alt="" style="display:block;border:0;border-radius:8px;"></td>
<td style="vertical-align:middle;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#b4561f;font-weight:bold;">The AI Resource Hub</td>
</tr></table>
${body}
<hr style="border:none;border-top:1px solid #d9cfbd;margin:28px 0 16px;">
<div style="font-size:12px;color:#6b6155;">${footer}</div>
</div></body></html>`;
}

export function buildConfirmEmail(confirmUrl: string, categoryLabels: string[]): BuiltEmail {
  const picks = listJoin(categoryLabels);
  const subject = 'Confirm your AI Resource Hub daily edition';
  const html = shell(
    `<h1 style="font-size:22px;margin:0 0 12px;">One click to confirm</h1>
<p>Someone, hopefully you, asked for the AI Resource Hub daily edition with stories about ${esc(picks)}.</p>
<p><a href="${esc(confirmUrl)}" style="display:inline-block;background:#1d1915;color:#fffaf0;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:bold;">Confirm my sign-up</a></p>
<p>The link works for 7 days. If you didn't ask for this, ignore this email and nothing else will arrive.</p>`,
    'You got this email because this address was entered on theairesourcehub.com.',
  );
  const text = `One click to confirm\n\nSomeone, hopefully you, asked for the AI Resource Hub daily edition with stories about ${picks}.\n\nConfirm: ${confirmUrl}\n\nThe link works for 7 days. If you didn't ask for this, ignore this email and nothing else will arrive.\n`;
  return { subject, html, text };
}

export interface DailyLinks {
  manageUrl: string;
  unsubscribeUrl: string;
  postalAddress?: string;
}

/** Returns null when none of the day's stories match the reader's categories. */
export function buildDailyEmail(edition: EditionPayload, categories: string[], labels: Record<string, string>, links: DailyLinks): BuiltEmail | null {
  const mine = edition.stories.filter((story) => categories.includes(story.category));
  if (mine.length === 0) return null;

  const pickedLabels = categories.map((id) => labels[id] ?? id);
  const counts = new Map<string, number>();
  for (const story of mine) counts.set(story.categoryLabel, (counts.get(story.categoryLabel) ?? 0) + 1);
  const countText = listJoin([...counts.entries()].sort((a, b) => b[1] - a[1]).map(([label, count]) => `${count} ${label}`));
  const storyWord = mine.length === 1 ? 'story' : 'stories';

  const opening = `Here's ${edition.dateLabel} in AI, picked for ${listJoin(pickedLabels)}. ${mine.length} of the day's ${edition.stories.length} ${edition.stories.length === 1 ? 'story matches' : 'stories match'} your categories: ${countText}. The one to read first is "${mine[0].title}" from ${mine[0].source}.`;

  const subject = `AI daily edition, ${edition.dateLabel.replace(/^\w+ /, '')}: ${mine[0].title}`.slice(0, 140);

  const storyHtml = mine
    .map((story, index) => {
      const meta = [...new Set([story.categoryLabel, story.company, story.source].filter(Boolean))].map((part) => esc(part!)).join(' · ');
      return `<div style="margin:0 0 20px;">
<p style="margin:0;font-size:12px;color:#6b6155;">${String(index + 1).padStart(2, '0')} · ${meta}</p>
<p style="margin:4px 0;font-size:17px;font-weight:bold;"><a href="${esc(story.url)}" style="color:#1d1915;">${esc(story.title)}</a></p>
${story.summary ? `<p style="margin:4px 0;font-size:14px;color:#3b342d;">${esc(story.summary)}</p>` : ''}
${story.whyItMatters ? `<p style="margin:4px 0;font-size:14px;"><strong>Why it matters:</strong> ${esc(story.whyItMatters)}</p>` : ''}
<p style="margin:4px 0;font-size:13px;"><a href="${esc(story.url)}" style="color:#b4561f;">Read it at ${esc(story.source)}</a></p>
</div>`;
    })
    .join('\n');

  const footer = `You picked ${esc(listJoin(pickedLabels))}. <a href="${esc(links.manageUrl)}" style="color:#6b6155;">Change categories</a> · <a href="${esc(links.unsubscribeUrl)}" style="color:#6b6155;">Unsubscribe</a> · <a href="${esc(edition.url)}" style="color:#6b6155;">Read on the web</a>${
    links.postalAddress ? `<br>${esc(links.postalAddress)}` : ''
  }`;

  const html = shell(
    `<h1 style="font-size:24px;margin:0 0 12px;">${esc(edition.dateLabel)}</h1>
<p style="font-size:16px;">${esc(opening)}</p>
<p style="font-size:14px;color:#3b342d;"><strong>The whole day in 60 seconds:</strong> ${esc(edition.sixtySeconds)}</p>
<h2 style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#6b6155;margin:24px 0 12px;">Your ${storyWord}</h2>
${storyHtml}`,
    footer,
  );

  const text = [
    edition.dateLabel,
    '',
    opening,
    '',
    `The whole day in 60 seconds: ${edition.sixtySeconds}`,
    '',
    ...mine.map((story, index) =>
      [
        `${index + 1}. ${story.title} (${[story.categoryLabel, story.company, story.source].filter(Boolean).join(', ')})`,
        story.summary,
        story.whyItMatters ? `Why it matters: ${story.whyItMatters}` : '',
        story.url,
        '',
      ]
        .filter((line) => line !== '')
        .join('\n'),
    ),
    '',
    `Change categories: ${links.manageUrl}`,
    `Unsubscribe: ${links.unsubscribeUrl}`,
    `Read on the web: ${edition.url}`,
    links.postalAddress ?? '',
  ].join('\n');

  return { subject, html, text };
}
