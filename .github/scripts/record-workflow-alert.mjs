import fs from "node:fs";

const required = [
  "ALERT_RUN_ID",
  "ALERT_REPOSITORY",
  "ALERT_WORKFLOW",
  "ALERT_HTML_URL",
  "ALERT_OCCURRED_AT",
];

function writeSummary(title, lines) {
  const text = [`# ${title}`, "", ...lines, ""].join("\n");
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) fs.appendFileSync(summaryPath, text);
  console.log(text);
}

function detailLines() {
  return [
    `- Repository: ${process.env.ALERT_REPOSITORY || ""}`,
    `- Workflow: ${process.env.ALERT_WORKFLOW || ""}`,
    `- Conclusion: ${process.env.ALERT_CONCLUSION || ""}`,
    `- Run: ${process.env.ALERT_HTML_URL || ""}`,
    `- Run ID: ${process.env.ALERT_RUN_ID || ""}`,
    `- SHA: ${process.env.ALERT_HEAD_SHA || ""}`,
    `- Branch: ${process.env.ALERT_HEAD_BRANCH || ""}`,
    `- Event: ${process.env.ALERT_EVENT || ""}`,
    `- Actor: ${process.env.ALERT_TRIGGERING_ACTOR || process.env.ALERT_ACTOR || ""}`,
    `- Time: ${process.env.ALERT_OCCURRED_AT || ""}`,
  ];
}

function redact(error) {
  const secret = process.env.ROOMS_OS_DATABASE_URL || "";
  let message = error && error.message ? error.message : String(error);
  if (secret) message = message.split(secret).join("[redacted]");
  return message.replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted]");
}

const missing = required.filter((name) => !process.env[name]);
if (!process.env.ROOMS_OS_DATABASE_URL || missing.length > 0) {
  const reasons = [];
  if (!process.env.ROOMS_OS_DATABASE_URL) {
    reasons.push("ROOMS_OS_DATABASE_URL is not set on this repository.");
  }
  if (missing.length > 0) reasons.push(`Missing payload: ${missing.join(", ")}.`);
  writeSummary("NOT DELIVERED: workflow failure alert", [
    `Reason: ${reasons.join(" ")}`,
    "",
    ...detailLines(),
    "",
    "Route: public.rooms_os_alert_events in rooms-os-cloud-postgres / neondb.",
    "Key: (source_system, source_stream, source_event_id) = (github-actions, owner/repo, run id).",
    "Reader: public.rooms_os_alert_feed_v, which Rooms OS NOW already reads.",
    "This workflow does not open a GitHub Issue and does not change the repository Issues setting.",
  ]);
  process.exit(1);
}

const repository = process.env.ALERT_REPOSITORY;
const runId = String(process.env.ALERT_RUN_ID);
const workflow = process.env.ALERT_WORKFLOW;
const conclusion = process.env.ALERT_CONCLUSION || "failure";
const htmlUrl = process.env.ALERT_HTML_URL;
const headSha = process.env.ALERT_HEAD_SHA || "";
const headBranch = process.env.ALERT_HEAD_BRANCH || "";
const eventName = process.env.ALERT_EVENT || "";
const actor = process.env.ALERT_ACTOR || "";
const triggeringActor = process.env.ALERT_TRIGGERING_ACTOR || actor;
const occurredAt = process.env.ALERT_OCCURRED_AT;
const workflowPath = process.env.ALERT_WORKFLOW_PATH || "";

const metadata = {
  repository,
  workflow,
  workflowPath,
  workflowRunId: runId,
  conclusion,
  headSha,
  headBranch,
  event: eventName,
  triggeringActor,
  actor,
  linearIssue: "KOL-6328",
  route: "rooms_os_alert_events",
  producer: "workflow-failure-alert",
  issuesEnabled: false,
};

const summary = [
  `${workflow} ${conclusion} in ${repository}.`,
  `Run ${runId} on ${headBranch} at ${headSha.slice(0, 7) || "unknown"}.`,
  `Event ${eventName || "unknown"}, actor ${triggeringActor || "unknown"}, time ${occurredAt}.`,
  htmlUrl,
].join(" ");

const pgModule = await import("pg");
const Client = pgModule.default?.Client || pgModule.Client;
const client = new Client({
  connectionString: process.env.ROOMS_OS_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  const inserted = await client.query(
    `INSERT INTO public.rooms_os_alert_events (
       source_system, source_stream, source_event_id, event_kind, severity,
       title, summary, source_ref_type, source_ref_id, source_url, occurred_at, metadata
     ) VALUES (
       'github-actions', $1, $2, 'workflow_failure', 'WARN',
       $3, $4, 'github_actions_run', $2, $5, $6::timestamptz, $7::jsonb
     )
     ON CONFLICT (source_system, source_stream, source_event_id) DO NOTHING
     RETURNING id::text AS id, ingested_at`,
    [repository, runId, `${workflow} failed`, summary, htmlUrl, occurredAt, JSON.stringify(metadata)],
  );

  let alertId = inserted.rows[0]?.id || "";
  let ingestedAt = inserted.rows[0]?.ingested_at || "";
  let deduped = false;
  if (!alertId) {
    const existing = await client.query(
      `SELECT id::text AS id, ingested_at
         FROM public.rooms_os_alert_events
        WHERE source_system = 'github-actions'
          AND source_stream = $1
          AND source_event_id = $2`,
      [repository, runId],
    );
    alertId = existing.rows[0]?.id || "";
    ingestedAt = existing.rows[0]?.ingested_at || "";
    deduped = true;
  }

  if (!alertId) {
    writeSummary("NOT DELIVERED: workflow failure alert", [
      "Reason: the insert did not return an alert id.",
      "",
      ...detailLines(),
    ]);
    process.exit(1);
  }

  writeSummary("DELIVERED: workflow failure alert", [
    `Alert id: ${alertId}`,
    `Ingested at: ${ingestedAt}`,
    deduped ? "Deduped: this run id was already in rooms_os_alert_events." : "Inserted one rooms_os_alert_events row.",
    "",
    ...detailLines(),
    "",
    "Route: public.rooms_os_alert_events. Reader: public.rooms_os_alert_feed_v.",
  ]);
} catch (error) {
  writeSummary("NOT DELIVERED: workflow failure alert", [
    `Reason: database error ${redact(error)}`,
    "",
    ...detailLines(),
  ]);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
