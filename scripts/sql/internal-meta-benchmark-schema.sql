-- AI Resource Hub internal manual prompt benchmark raw-data schema.
-- This is designed for Postgres first, with JSONB fields for rubrics, source packs,
-- dimension scores, hard-fail flags, caveats, and visible operating metrics.

CREATE TABLE IF NOT EXISTS meta_benchmark_families (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  public_visibility TEXT NOT NULL DEFAULT 'internal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meta_benchmark_prompts (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES meta_benchmark_families(id),
  version TEXT NOT NULL,
  mode_allowed TEXT NOT NULL,
  difficulty_band TEXT NOT NULL,
  task_text TEXT NOT NULL,
  source_pack_id TEXT,
  answer_key_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  scoring_rubric_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  hard_fail_flags_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  private_holdout BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  retire_after TIMESTAMPTZ,
  UNIQUE (id, version)
);

CREATE TABLE IF NOT EXISTS meta_benchmark_sources (
  id TEXT PRIMARY KEY,
  source_pack_id TEXT,
  source_type TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  source_text_ref TEXT,
  verified_at TIMESTAMPTZ,
  caveat TEXT,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meta_benchmark_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id TEXT NOT NULL REFERENCES meta_benchmark_prompts(id),
  prompt_version TEXT NOT NULL,
  family_id TEXT NOT NULL REFERENCES meta_benchmark_families(id),
  provider TEXT NOT NULL,
  product_plan TEXT NOT NULL,
  model_label_shown TEXT NOT NULL,
  tool_mode TEXT NOT NULL,
  harness_id TEXT NOT NULL,
  run_number INTEGER NOT NULL,
  run_datetime TIMESTAMPTZ NOT NULL,
  answer_text_ref TEXT NOT NULL,
  input_context_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (prompt_id, prompt_version, provider, product_plan, model_label_shown, tool_mode, harness_id, run_number, run_datetime)
);

CREATE TABLE IF NOT EXISTS meta_benchmark_scores (
  run_id UUID PRIMARY KEY REFERENCES meta_benchmark_runs(id) ON DELETE CASCADE,
  score_total NUMERIC(5,2),
  weighted_average NUMERIC(5,2),
  weakest_critical_score NUMERIC(5,2),
  dimension_scores_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  hard_fail_flags_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  caveats_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  scorer_id TEXT NOT NULL,
  scorer_notes TEXT,
  scored_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meta_benchmark_operating_metrics (
  run_id UUID PRIMARY KEY REFERENCES meta_benchmark_runs(id) ON DELETE CASCADE,
  wall_time_seconds INTEGER,
  visible_tool_calls INTEGER,
  visible_citation_count INTEGER,
  retry_count INTEGER,
  output_length_words INTEGER,
  input_tokens_visible INTEGER,
  output_tokens_visible INTEGER,
  reasoning_tokens_visible INTEGER,
  cost_visible NUMERIC(12,6),
  ttft_seconds NUMERIC(8,3),
  output_tokens_per_second NUMERIC(8,3),
  tool_errors_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  metrics_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS external_benchmark_operating_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark_id TEXT NOT NULL,
  benchmark_name TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  model_id TEXT NOT NULL,
  model_label TEXT NOT NULL,
  run_configuration TEXT,
  score_label TEXT,
  score_value NUMERIC(8,3),
  score_uncertainty TEXT,
  average_cost_usd NUMERIC(12,6),
  average_time_seconds INTEGER,
  output_tokens_average INTEGER,
  input_tokens_average INTEGER,
  total_tokens_average INTEGER,
  measured_at TIMESTAMPTZ,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  caveat TEXT,
  metrics_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (benchmark_id, source_name, model_id, run_configuration, measured_at)
);

CREATE INDEX IF NOT EXISTS idx_meta_benchmark_prompts_family ON meta_benchmark_prompts(family_id);
CREATE INDEX IF NOT EXISTS idx_meta_benchmark_runs_prompt ON meta_benchmark_runs(prompt_id, prompt_version);
CREATE INDEX IF NOT EXISTS idx_meta_benchmark_runs_model_mode ON meta_benchmark_runs(provider, model_label_shown, tool_mode, harness_id);
CREATE INDEX IF NOT EXISTS idx_meta_benchmark_runs_datetime ON meta_benchmark_runs(run_datetime);
CREATE INDEX IF NOT EXISTS idx_meta_benchmark_sources_pack ON meta_benchmark_sources(source_pack_id);
CREATE INDEX IF NOT EXISTS idx_external_benchmark_operating_model ON external_benchmark_operating_metrics(model_id, benchmark_id);
CREATE INDEX IF NOT EXISTS idx_external_benchmark_operating_source ON external_benchmark_operating_metrics(source_name, captured_at);
