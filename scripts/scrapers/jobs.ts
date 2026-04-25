#!/usr/bin/env npx tsx
/**
 * AI jobs-market scraper.
 *
 * Pulls public openings from structured ATS feeds instead of generic "AI jobs" boards:
 * - Greenhouse job board API
 * - Lever postings API
 *
 * The goal is not to become a broad job board. It is to track realistic hiring signal from
 * a small set of AI-relevant companies and keep daily snapshots for trend charts.
 */
import { createHash } from 'node:crypto';
import { logScrapeRun } from './base';
import { getDB } from '../../src/db/schema';

type BoardType = 'greenhouse' | 'lever';

interface CompanyConfig {
  id: string;
  name: string;
  providerId: string | null;
  careersUrl: string;
  boardType: BoardType;
  boardToken: string;
  boardUrl: string;
  notes?: string;
}

interface NormalisedJob {
  id: string;
  companyId: string;
  providerId: string | null;
  title: string;
  team: string | null;
  location: string | null;
  locationGroup: string;
  workplaceType: string;
  commitment: string | null;
  functionCategory: string;
  url: string;
  postedAt: string | null;
  listedAt: string | null;
  source: string;
}

const COMPANIES: CompanyConfig[] = [
  {
    id: 'anthropic-jobs',
    name: 'Anthropic',
    providerId: 'anthropic',
    careersUrl: 'https://www.anthropic.com/careers',
    boardType: 'greenhouse',
    boardToken: 'anthropic',
    boardUrl: 'https://boards-api.greenhouse.io/v1/boards/anthropic/jobs',
    notes: 'Public Greenhouse board',
  },
  {
    id: 'mistral-jobs',
    name: 'Mistral AI',
    providerId: 'mistral',
    careersUrl: 'https://mistral.ai/careers',
    boardType: 'lever',
    boardToken: 'mistral',
    boardUrl: 'https://api.lever.co/v0/postings/mistral?mode=json',
    notes: 'Public Lever board',
  },
  {
    id: 'deepmind-jobs',
    name: 'Google DeepMind',
    providerId: 'google',
    careersUrl: 'https://deepmind.google/about/careers/',
    boardType: 'greenhouse',
    boardToken: 'deepmind',
    boardUrl: 'https://boards-api.greenhouse.io/v1/boards/deepmind/jobs',
    notes: 'Public Greenhouse board',
  },
  {
    id: 'runway-jobs',
    name: 'Runway',
    providerId: 'runway',
    careersUrl: 'https://runwayml.com/careers/',
    boardType: 'greenhouse',
    boardToken: 'runwayml',
    boardUrl: 'https://boards-api.greenhouse.io/v1/boards/runwayml/jobs',
    notes: 'Public Greenhouse board',
  },
  {
    id: 'scaleai-jobs',
    name: 'Scale AI',
    providerId: null,
    careersUrl: 'https://scale.com/careers',
    boardType: 'greenhouse',
    boardToken: 'scaleai',
    boardUrl: 'https://boards-api.greenhouse.io/v1/boards/scaleai/jobs',
    notes: 'Public Greenhouse board; useful as infrastructure hiring signal around AI deployment',
  },
  {
    id: 'stability-jobs',
    name: 'Stability AI',
    providerId: 'stability',
    careersUrl: 'https://stability.ai/careers',
    boardType: 'greenhouse',
    boardToken: 'stabilityai',
    boardUrl: 'https://boards-api.greenhouse.io/v1/boards/stabilityai/jobs',
    notes: 'Public Greenhouse board',
  },
  {
    id: 'togetherai-jobs',
    name: 'Together AI',
    providerId: null,
    careersUrl: 'https://www.together.ai/careers',
    boardType: 'greenhouse',
    boardToken: 'togetherai',
    boardUrl: 'https://boards-api.greenhouse.io/v1/boards/togetherai/jobs',
    notes: 'Public Greenhouse board',
  },
  {
    id: 'figureai-jobs',
    name: 'Figure',
    providerId: null,
    careersUrl: 'https://www.figure.ai/careers',
    boardType: 'greenhouse',
    boardToken: 'figureai',
    boardUrl: 'https://boards-api.greenhouse.io/v1/boards/figureai/jobs',
    notes: 'Public Greenhouse board; robotics and embodied AI hiring signal',
  },
  {
    id: 'wayve-jobs',
    name: 'Wayve',
    providerId: null,
    careersUrl: 'https://wayve.ai/careers/',
    boardType: 'greenhouse',
    boardToken: 'wayve',
    boardUrl: 'https://boards-api.greenhouse.io/v1/boards/wayve/jobs',
    notes: 'Public Greenhouse board; autonomous-driving AI hiring signal',
  },
  {
    id: 'youcom-jobs',
    name: 'You.com',
    providerId: null,
    careersUrl: 'https://you.com/careers',
    boardType: 'greenhouse',
    boardToken: 'youcom',
    boardUrl: 'https://boards-api.greenhouse.io/v1/boards/youcom/jobs',
    notes: 'Public Greenhouse board',
  },
];

function normaliseDate(value: string | number | null | undefined): string | null {
  if (value == null || value === '') return null;
  const parsed = typeof value === 'number' ? new Date(value) : new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function makeJobId(companyId: string, sourceId: string | number, url: string): string {
  const stable = `${companyId}:${sourceId}:${url}`;
  return `job-${createHash('sha1').update(stable).digest('hex').slice(0, 20)}`;
}

function cleanText(value: string | null | undefined): string | null {
  if (!value) return null;
  const text = value.replace(/\s+/g, ' ').trim();
  return text.length > 0 ? text : null;
}

function getLocationGroup(location: string | null): string {
  const text = (location ?? '').toLowerCase();
  if (!text) return 'Unknown';
  if (/\b(remote|distributed|anywhere)\b/i.test(text)) return 'Remote';
  if (/\b(united states|usa|u\.s\.a?|\bnew york\b|\bsan francisco\b|\bseattle\b|\baustin\b|\blos angeles\b|\bboston\b|\bwashington\b|\bcalifornia\b|\bca\b|\bny\b|\btx\b|\bdc\b|\bma\b|\bwa\b)\b/i.test(text)) {
    return 'United States';
  }
  if (/\b(london|paris|berlin|munich|france|germany|uk|united kingdom|europe|emea|amsterdam|dublin|zurich|stockholm|madrid)\b/i.test(text)) {
    return 'Europe / EMEA';
  }
  if (/\b(singapore|tokyo|japan|seoul|korea|hong kong|apac|sydney|melbourne|australia|india)\b/i.test(text)) {
    return 'APAC';
  }
  return 'Other';
}

function getWorkplaceType(location: string | null, hints: Array<string | null | undefined>): string {
  const merged = [location, ...hints].filter(Boolean).join(' ').toLowerCase();
  if (merged.includes('remote')) return 'remote';
  if (merged.includes('hybrid')) return 'hybrid';
  if (merged.includes('on-site') || merged.includes('onsite')) return 'onsite';
  return 'unknown';
}

function getFunctionCategory(title: string, team: string | null): string {
  const text = `${title} ${team ?? ''}`.toLowerCase();

  if (/(research|scientist|alignment|policy|economist|safety|interpretability)/i.test(text)) return 'research';
  if (/(engineer|engineering|infrastructure|platform|ml |machine learning|applied ai|data science|developer relations|security)/i.test(text)) return 'engineering';
  if (/(product|design|ux|ui|pm\b|program manager)/i.test(text)) return 'product';
  if (/(sales|marketing|revenue|customer success|partnership|business development|account executive|gtm|go to market)/i.test(text)) return 'gtm';
  if (/(finance|legal|operations|people|talent|recruit|hr\b|workplace|office|administrative|procurement)/i.test(text)) return 'operations';
  return 'other';
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'The-AI-Resource-Hub-Bot/1.0 (jobs market tracker; public ATS access only)',
      Accept: 'application/json,text/plain,*/*',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

function getGreenhouseMetadataValue(metadata: Array<{ name?: string; value?: string | null }> | undefined, names: string[]): string | null {
  if (!metadata) return null;
  const target = metadata.find((item) => item.name && names.some((name) => item.name?.toLowerCase() === name.toLowerCase()));
  return cleanText(target?.value ?? null);
}

function parseGreenhouseJobs(company: CompanyConfig, payload: unknown): NormalisedJob[] {
  const jobs = (payload as { jobs?: Array<Record<string, unknown>> }).jobs ?? [];

  return jobs.map((job) => {
    const locationName = cleanText((job.location as { name?: string } | undefined)?.name ?? null);
    const metadata = Array.isArray(job.metadata) ? job.metadata as Array<{ name?: string; value?: string | null }> : [];
    const department =
      getGreenhouseMetadataValue(metadata, ['External Department', 'Department', 'Team']) ??
      getGreenhouseMetadataValue(metadata, ['Group']);
    const locationType = getGreenhouseMetadataValue(metadata, ['Location Type', 'Workplace Type']);
    const title = String(job.title ?? 'Untitled role');
    const url = String(job.absolute_url ?? company.careersUrl);

    return {
      id: makeJobId(company.id, String(job.id ?? url), url),
      companyId: company.id,
      providerId: company.providerId,
      title,
      team: department,
      location: locationName,
      locationGroup: getLocationGroup(locationName),
      workplaceType: getWorkplaceType(locationName, [locationType]),
      commitment: null,
      functionCategory: getFunctionCategory(title, department),
      url,
      postedAt: normaliseDate(job.first_published as string | null | undefined),
      listedAt: normaliseDate(job.updated_at as string | null | undefined),
      source: `greenhouse:${company.boardToken}`,
    };
  });
}

function parseLeverJobs(company: CompanyConfig, payload: unknown): NormalisedJob[] {
  const jobs = Array.isArray(payload) ? payload as Array<Record<string, unknown>> : [];

  return jobs.map((job) => {
    const categories = (job.categories ?? {}) as {
      team?: string;
      location?: string;
      commitment?: string;
    };
    const location = cleanText(categories.location ?? null);
    const team = cleanText(categories.team ?? null);
    const workplaceType = cleanText(job.workplaceType as string | null | undefined);
    const title = String(job.text ?? 'Untitled role');
    const url = String(job.hostedUrl ?? job.applyUrl ?? company.careersUrl);

    return {
      id: makeJobId(company.id, String(job.id ?? url), url),
      companyId: company.id,
      providerId: company.providerId,
      title,
      team,
      location,
      locationGroup: getLocationGroup(location),
      workplaceType: getWorkplaceType(location, [workplaceType]),
      commitment: cleanText(categories.commitment ?? null),
      functionCategory: getFunctionCategory(title, team),
      url,
      postedAt: normaliseDate(job.createdAt as number | null | undefined),
      listedAt: normaliseDate(job.createdAt as number | null | undefined),
      source: `lever:${company.boardToken}`,
    };
  });
}

function buildSnapshotSummary(jobs: NormalisedJob[]) {
  return {
    openRoleCount: jobs.length,
    remoteRoleCount: jobs.filter((job) => job.workplaceType === 'remote').length,
    researchRoleCount: jobs.filter((job) => job.functionCategory === 'research').length,
    engineeringRoleCount: jobs.filter((job) => job.functionCategory === 'engineering').length,
    productRoleCount: jobs.filter((job) => job.functionCategory === 'product').length,
    gtmRoleCount: jobs.filter((job) => job.functionCategory === 'gtm').length,
    operationsRoleCount: jobs.filter((job) => job.functionCategory === 'operations').length,
    otherRoleCount: jobs.filter((job) => job.functionCategory === 'other').length,
  };
}

async function main() {
  const db = getDB();
  const snapshotDate = new Date().toISOString().slice(0, 10);
  const providerExists = db.prepare('SELECT 1 FROM providers WHERE id = ? LIMIT 1');

  function resolveProviderId(company: CompanyConfig): string | null {
    if (!company.providerId) return null;
    if (providerExists.get(company.providerId)) return company.providerId;

    console.warn(`  Provider ${company.providerId} is not in the current provider table; importing ${company.name} jobs without a provider link.`);
    return null;
  }

  const upsertCompany = db.prepare(`
    INSERT INTO job_companies (id, name, provider_id, careers_url, board_type, board_token, board_url, status, notes, updated_at)
    VALUES (@id, @name, @providerId, @careersUrl, @boardType, @boardToken, @boardUrl, @status, @notes, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      provider_id = excluded.provider_id,
      careers_url = excluded.careers_url,
      board_type = excluded.board_type,
      board_token = excluded.board_token,
      board_url = excluded.board_url,
      notes = excluded.notes,
      status = excluded.status,
      updated_at = datetime('now')
  `);

  const deactivateCompanyJobs = db.prepare('UPDATE ai_jobs SET active = 0, updated_at = datetime(\'now\') WHERE company_id = ?');
  const upsertJob = db.prepare(`
    INSERT INTO ai_jobs (
      id, company_id, provider_id, title, team, location, location_group, workplace_type,
      commitment, function_category, url, posted_at, listed_at, source, active, updated_at
    )
    VALUES (
      @id, @companyId, @providerId, @title, @team, @location, @locationGroup, @workplaceType,
      @commitment, @functionCategory, @url, @postedAt, @listedAt, @source, 1, datetime('now')
    )
    ON CONFLICT(id) DO UPDATE SET
      company_id = excluded.company_id,
      provider_id = excluded.provider_id,
      title = excluded.title,
      team = excluded.team,
      location = excluded.location,
      location_group = excluded.location_group,
      workplace_type = excluded.workplace_type,
      commitment = excluded.commitment,
      function_category = excluded.function_category,
      url = excluded.url,
      posted_at = excluded.posted_at,
      listed_at = excluded.listed_at,
      source = excluded.source,
      active = 1,
      updated_at = datetime('now')
  `);

  const deleteSnapshot = db.prepare('DELETE FROM ai_job_snapshots WHERE snapshot_date = ? AND company_id = ?');
  const insertSnapshot = db.prepare(`
    INSERT INTO ai_job_snapshots (
      snapshot_date, company_id, provider_id, open_role_count, remote_role_count,
      research_role_count, engineering_role_count, product_role_count, gtm_role_count,
      operations_role_count, other_role_count, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  let importedJobs = 0;
  const failures: string[] = [];

  function markCompanyUnavailable(company: CompanyConfig, providerId: string | null) {
    const writeUnavailable = db.transaction(() => {
      upsertCompany.run({
        id: company.id,
        name: company.name,
        providerId,
        careersUrl: company.careersUrl,
        boardType: company.boardType,
        boardToken: company.boardToken,
        boardUrl: company.boardUrl,
        status: 'unavailable',
        notes: company.notes ?? null,
      });

      deactivateCompanyJobs.run(company.id);
      deleteSnapshot.run(snapshotDate, company.id);
      insertSnapshot.run(
        snapshotDate,
        company.id,
        providerId,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
      );
    });

    writeUnavailable();
  }

  for (const company of COMPANIES) {
    const providerId = resolveProviderId(company);
    try {
      console.log(`Fetching jobs for ${company.name}...`);
      const companyForImport = { ...company, providerId };
      const payload = await fetchJson(company.boardUrl);
      const jobs = companyForImport.boardType === 'greenhouse'
        ? parseGreenhouseJobs(companyForImport, payload)
        : parseLeverJobs(companyForImport, payload);

      const uniqueJobs = Array.from(new Map(jobs.map((job) => [job.id, job])).values());
      const summary = buildSnapshotSummary(uniqueJobs);

      const writeCompany = db.transaction(() => {
        upsertCompany.run({
          id: company.id,
          name: company.name,
          providerId,
          careersUrl: company.careersUrl,
          boardType: company.boardType,
          boardToken: company.boardToken,
          boardUrl: company.boardUrl,
          status: 'active',
          notes: company.notes ?? null,
        });

        deactivateCompanyJobs.run(company.id);
        for (const job of uniqueJobs) {
          upsertJob.run(job);
        }

        deleteSnapshot.run(snapshotDate, company.id);
        insertSnapshot.run(
          snapshotDate,
          company.id,
          providerId,
          summary.openRoleCount,
          summary.remoteRoleCount,
          summary.researchRoleCount,
          summary.engineeringRoleCount,
          summary.productRoleCount,
          summary.gtmRoleCount,
          summary.operationsRoleCount,
          summary.otherRoleCount,
        );
      });

      writeCompany();
      importedJobs += uniqueJobs.length;
      console.log(`  Imported ${uniqueJobs.length} active roles from ${company.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('HTTP 404')) {
        markCompanyUnavailable(company, providerId);
        console.warn(`  Marked ${company.name} as unavailable: ${message}`);
        continue;
      }
      failures.push(`${company.name}: ${message}`);
      console.warn(`  Failed to import ${company.name}: ${message}`);
    }
  }

  if (importedJobs === 0) {
    const message = failures.length > 0
      ? `No job feeds imported. ${failures.join(' | ')}`
      : 'No job feeds imported.';
    logScrapeRun(db, 'jobs', 'error', 0, message);
    throw new Error(message);
  }

  const failureMessage = failures.length > 0 ? failures.join(' | ') : undefined;
  logScrapeRun(db, 'jobs', failures.length > 0 ? 'error' : 'success', importedJobs, failureMessage);

  console.log(`Imported ${importedJobs} roles across ${COMPANIES.length} tracked boards.`);
  if (failures.length > 0) {
    console.warn(`Partial failures: ${failureMessage}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
