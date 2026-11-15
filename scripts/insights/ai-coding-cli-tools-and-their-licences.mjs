#!/usr/bin/env node
/**
 * Which of the 13 AI command-line coding tools in our catalogue are open source, and under what licence?
 *
 * Input:  data/pg-cache/cli_tools.json (our catalogue; fields open_source, license, github_url are OUR records).
 * Also:   the licence files below, read as raw text with curl on 14 November 2026 (rows are embedded as read, with
 *         address, first line and SHA-256 of the file as fetched). Nothing is re-fetched by this script.
 * Output: src/data/insights/2026-11-14-ai-coding-cli-tools-and-their-licences.json (frozen; refuses to overwrite without --force).
 *
 * Classification rule (ours, stated in the article): a tool counts as "open source by an OSI-style licence as the file
 * states" when the licence file names MIT, Apache-2.0 or AGPL-3.0, each of which has a page on opensource.org (read 14 Nov 2026).
 * FSL-1.1-MIT (Crush) and "All rights reserved" (Claude Code) do not count. No file found: not classified.
 *
 * Usage: node scripts/insights/ai-coding-cli-tools-and-their-licences.mjs [--force]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const raw = readFileSync(join(root, 'data/pg-cache/cli_tools.json'));
const tools = JSON.parse(raw.toString('utf8'));
const READ = '2026-11-14';
const OSI_STYLE = new Set(['MIT', 'Apache-2.0', 'AGPL-3.0']);
const gh = (p) => `https://raw.githubusercontent.com/${p}`;

// What we read. spdx is the licence the file names. files: every licence file read (url, first line(s) as read, sha256).
const observed = {
  aider: { repo: 'https://github.com/Aider-AI/aider', branch: 'main', spdx: 'Apache-2.0',
    files: [{ url: gh('Aider-AI/aider/main/LICENSE.txt'), firstLine: 'Apache License / Version 2.0, January 2004', sha256: 'cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30' }] },
  'amazon-q-cli': { repo: 'https://github.com/aws/amazon-q-developer-cli', branch: 'main', spdx: 'MIT and Apache-2.0', foundByUs: true,
    files: [
      { url: gh('aws/amazon-q-developer-cli/main/LICENSE.APACHE'), firstLine: 'Apache License / Version 2.0, January 2004', sha256: 'a6cba85bc92e0cff7a450b1d873c0eaa2e9fc96bf472df0247a26bec77bf3ff9' },
      { url: gh('aws/amazon-q-developer-cli/main/LICENSE.MIT'), firstLine: 'MIT License', sha256: '2b96c4c28ee2d49ba1b87f0bf8b2a92b098ef2b1ff8fe69e5f5426a9c14daaaa' }],
    readme: { url: gh('aws/amazon-q-developer-cli/main/README.md'), quote: 'no longer being actively maintained', note: 'README says the project only receives critical security fixes and that Amazon Q Developer CLI is now Kiro CLI, a closed-source product.' },
    osiStyle: true },
  'claude-code': { repo: 'https://github.com/anthropics/claude-code', branch: 'main', spdx: 'All rights reserved', foundByUs: true,
    files: [{ url: gh('anthropics/claude-code/main/LICENSE.md'), firstLine: '© Anthropic PBC. All rights reserved. (the file is this one line, which goes on to point to Anthropic Commercial Terms of Service)', sha256: '728158fd1037143fad6907e8fa34804177e598b7326519503fe83cafdef849e6' }],
    osiStyle: false },
  'coderabbit-cli': { repo: null, spdx: null, foundByUs: true, files: [],
    checked: 'The catalogue has no repository address. We read https://www.coderabbit.ai/cli (no github.com link in the page) and the repository list of the coderabbitai organisation on GitHub through api.github.com/orgs/coderabbitai/repos (40 repositories, none whose name or description says it is the command-line tool).' },
  codebuff: { repo: 'https://github.com/CodebuffAI/codebuff', branch: 'main', spdx: 'Apache-2.0', foundByUs: true,
    files: [{ url: gh('CodebuffAI/codebuff/main/LICENSE'), firstLine: 'Apache License / Version 2.0, January 2004', sha256: '9c4dbb2a50bff1fa68a3f9ce758c374c5e47d57aea2b08013de2f2a3caea7469' }],
    readme: { url: gh('CodebuffAI/codebuff/main/README.md'), note: 'The address redirects to a repository now named freebuff, and its README is titled Freebuff.' } },
  'openai-codex': { repo: 'https://github.com/openai/codex', branch: 'main', spdx: 'Apache-2.0',
    files: [{ url: gh('openai/codex/main/LICENSE'), firstLine: 'Apache License / Version 2.0, January 2004', sha256: 'd17f227e4df5da1600391338865ce0f3055211760a36688f816941d58232d8dc' }] },
  'crush-cli': { repo: 'https://github.com/charmbracelet/crush', branch: 'main', spdx: 'FSL-1.1-MIT',
    files: [{ url: gh('charmbracelet/crush/main/LICENSE.md'), firstLine: '# Functional Source License, Version 1.1, MIT Future License', sha256: '3faa5d4f3a51f07e4963b993f27af4b9344d7c509fa20aa856dd878788ba5f18' }],
    osiStyle: false },
  'firecrawl-cli': { repo: 'https://github.com/firecrawl/firecrawl', branch: 'main', spdx: 'AGPL-3.0',
    files: [{ url: gh('firecrawl/firecrawl/main/LICENSE'), firstLine: 'GNU AFFERO GENERAL PUBLIC LICENSE / Version 3, 19 November 2007', sha256: '9b4649365c4f29d8f41301f4cda1e5bd9da51cf1bbb19ab9d568ff57d56e3b33' }],
    extra: { repo: 'https://github.com/firecrawl/cli', note: 'The command-line tool has its own repository. Its top level holds no licence file (listing read through api.github.com), and its package.json has "license": "ISC".', packageJson: gh('firecrawl/cli/main/package.json'), packageJsonSha256: '84955b0ba03c216bb8aebd078a51438a5a24d4bc21eb7a46b1932e184e5999a5' } },
  'gemini-cli': { repo: 'https://github.com/google-gemini/gemini-cli', branch: 'main', spdx: 'Apache-2.0',
    files: [{ url: gh('google-gemini/gemini-cli/main/LICENSE'), firstLine: 'Apache License / Version 2.0, January 2004', sha256: '58d1e17ffe5109a7ae296caafcadfdbe6a7d176f0bc4ab01e12a689b0499d8bd' }] },
  goose: { repo: 'https://github.com/block/goose', branch: 'main', spdx: 'Apache-2.0',
    files: [{ url: gh('block/goose/main/LICENSE'), firstLine: 'Apache License / Version 2.0, January 2004', sha256: '44459b86c2e96fdbfd8a6b5c33d30d4b04b5293fcb2ec96fe4dcc4e0f90b8962' }],
    extra: { note: 'The address now redirects to github.com/aaif-goose/goose; the file there has the same SHA-256.' } },
  plandex: { repo: 'https://github.com/plandex-ai/plandex', branch: 'main', spdx: 'MIT',
    files: [{ url: gh('plandex-ai/plandex/main/LICENSE'), firstLine: 'MIT License', sha256: 'eda5a26207e5a30cbad304444ea650a588c54f7404368cbefdb7b9a3e206bcd0' }] },
  'qwen-code': { repo: 'https://github.com/QwenLM/qwen-code', branch: 'main', spdx: 'Apache-2.0',
    files: [{ url: gh('QwenLM/qwen-code/main/LICENSE'), firstLine: 'Apache License / Version 2.0, January 2004', sha256: '55367b61ccd2a016a0159ad886bd66a3ee6cb5e873d0c75c803c897dd245b075' }] },
  warp: { repo: 'https://github.com/warpdotdev/warp', branch: 'master', spdx: 'AGPL-3.0 and MIT', foundByUs: true,
    files: [
      { url: gh('warpdotdev/warp/master/LICENSE-AGPL'), firstLine: 'Copyright (C) 2020-2026 Denver Technologies, Inc. / GNU AFFERO GENERAL PUBLIC LICENSE / Version 3, 19 November 2007', sha256: '16f8dac5fd5755d74ba05cb377c23f49e794252d200548fb3b227e1c5dcbfaec' },
      { url: gh('warpdotdev/warp/master/LICENSE-MIT'), firstLine: 'Copyright (C) 2020-2026 Denver Technologies, Inc. / then the MIT permission text (no title line)', sha256: '0cb5f8a282734dd41844fc3bdc28bda274cc71db8de289a9959263b61210daa9' }],
    readme: { url: gh('warpdotdev/warp/master/README.md'), note: 'README: the warpui_core and warpui crates are MIT; the rest of the code in the repository is AGPL v3.' },
    osiStyle: true },
};

const rows = [];
for (const t of tools) {
  const o = observed[t.id];
  if (!o) throw new Error(`no observation recorded for ${t.id}`);
  if (t.github_url && o.repo && t.github_url !== o.repo) throw new Error(`catalogue address differs for ${t.id}`);
  const verified = o.files.length > 0;
  const osiStyle = verified ? (o.osiStyle !== undefined ? o.osiStyle : OSI_STYLE.has(o.spdx)) : null;
  const cat = { openSource: t.open_source, license: t.license || null, githubUrl: t.github_url || null, pricingType: t.pricing_type, status: t.status };
  const flagAgrees = osiStyle === null ? null : cat.openSource === (osiStyle ? 1 : 0);
  const nameAgrees = cat.license && verified ? cat.license === o.spdx : null;
  rows.push({
    id: t.id, name: t.name, maker: t.maker,
    catalogue: cat,
    read: { date: READ, repo: o.repo, branch: o.branch || null, addressFromCatalogue: !o.foundByUs, licence: o.spdx, files: o.files, readme: o.readme || null, extra: o.extra || null, checked: o.checked || null },
    verified, osiStyle, flagAgrees, nameAgrees,
  });
}

const n = rows.length;
const verifiedRows = rows.filter((r) => r.verified);
const osi = rows.filter((r) => r.osiStyle === true);
const notOsi = rows.filter((r) => r.osiStyle === false);
const pricingOfOsi = {};
for (const r of osi) pricingOfOsi[r.catalogue.pricingType] = (pricingOfOsi[r.catalogue.pricingType] || 0) + 1;

const out = {
  snapshotDate: READ,
  inputs: { cliToolsSha256: createHash('sha256').update(raw).digest('hex'), records: n },
  method: {
    read: 'Each licence file was fetched as raw text with curl on 14 November 2026; the address, the first line as read and the SHA-256 of the fetched file are in rows[].read.files. For tools with no repository address in the catalogue, the repository was found by us and is marked addressFromCatalogue false.',
    rule: 'A tool counts as open source by an OSI-style licence as the file states when the file names MIT, Apache-2.0 or AGPL-3.0 (pages for each read on opensource.org on 14 November 2026). FSL-1.1-MIT and "All rights reserved" do not count. A licence applies to the code in that repository only.',
  },
  counts: {
    tools: n,
    withLicenceFileRead: verifiedRows.length,
    noPublicLicenceFound: n - verifiedRows.length,
    osiStyle: osi.length,
    notOsiStyle: notOsi.length,
    catalogueFlagAgrees: rows.filter((r) => r.flagAgrees === true).length,
    catalogueFlagDisagrees: rows.filter((r) => r.flagAgrees === false).length,
    catalogueNamedALicence: rows.filter((r) => r.catalogue.license).length,
    catalogueNameAgrees: rows.filter((r) => r.nameAgrees === true).length,
    catalogueNameDisagrees: rows.filter((r) => r.nameAgrees === false).length,
    catalogueAddressBlank: rows.filter((r) => !r.catalogue.githubUrl).length,
    catalogueFlaggedOpen: rows.filter((r) => r.catalogue.openSource === 1).length,
  },
  flagDisagreements: rows.filter((r) => r.flagAgrees === false).map((r) => r.id),
  nameDisagreements: rows.filter((r) => r.nameAgrees === false).map((r) => ({ id: r.id, catalogue: r.catalogue.license, file: r.read.licence })),
  notOsiStyle: notOsi.map((r) => r.id),
  noLicenceFound: rows.filter((r) => !r.verified).map((r) => r.id),
  pricingTypeOfOsiStyleTools: pricingOfOsi,
  rows,
};

const outPath = join(root, 'src/data/insights/2026-11-14-ai-coding-cli-tools-and-their-licences.json');
if (existsSync(outPath) && !process.argv.includes('--force')) {
  console.error(`${outPath} already exists. Snapshots are frozen; pass --force to rebuild.`);
  process.exit(1);
}
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
console.log(`wrote ${outPath}`);
console.log(JSON.stringify(out.counts), out.flagDisagreements.join(','), JSON.stringify(out.nameDisagreements), JSON.stringify(pricingOfOsi));
