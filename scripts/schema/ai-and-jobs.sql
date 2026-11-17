PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS jobs_rights (
 id TEXT PRIMARY KEY, scope TEXT NOT NULL CHECK(scope IN ('source','dataset','publication')), covers TEXT NOT NULL,
 licence TEXT, licence_url TEXT, attribution_text TEXT, commercial_use TEXT NOT NULL DEFAULT 'unknown' CHECK(commercial_use IN ('allowed','not_allowed','unknown')),
 verified_on TEXT, verified_by TEXT, evidence_url TEXT, status TEXT NOT NULL DEFAULT 'unconfirmed' CHECK(status IN ('confirmed','partial','unconfirmed'))
);
CREATE TABLE IF NOT EXISTS jobs_sources (
 id TEXT PRIMARY KEY,publisher TEXT NOT NULL,name TEXT NOT NULL,source_type TEXT NOT NULL,
 rights_id TEXT NOT NULL REFERENCES jobs_rights(id),access_route TEXT,method_url TEXT NOT NULL,refresh_cadence_days INTEGER NOT NULL CHECK(refresh_cadence_days>0)
);
CREATE TABLE IF NOT EXISTS jobs_series (
 id TEXT PRIMARY KEY,source_id TEXT NOT NULL REFERENCES jobs_sources(id),title TEXT NOT NULL,geography TEXT NOT NULL,unit TEXT NOT NULL,
 frequency TEXT NOT NULL,averaging_window_days INTEGER,kind TEXT NOT NULL CHECK(kind IN ('measured','survey_estimate','model_derived_estimate','modelled_exposure','projection')),
 rights_id TEXT REFERENCES jobs_rights(id)
);
CREATE TABLE IF NOT EXISTS jobs_series_versions (
 id TEXT PRIMARY KEY,series_id TEXT NOT NULL REFERENCES jobs_series(id),version_label TEXT NOT NULL,valid_from TEXT,valid_to TEXT,
 backcast_of TEXT REFERENCES jobs_series_versions(id),backcast_periods TEXT,question_wording TEXT,questionnaire_url TEXT,population TEXT NOT NULL,
 definition TEXT NOT NULL,methodology_version TEXT NOT NULL,methodology_url TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS jobs_observations (
 series_version_id TEXT NOT NULL REFERENCES jobs_series_versions(id),period TEXT NOT NULL,value REAL NOT NULL,
 standard_error REAL,relative_standard_error REAL,interval_lower REAL,interval_upper REAL,interval_type TEXT,confidence_level REAL,
 uncertainty_status TEXT NOT NULL DEFAULT 'not_yet_checked' CHECK(uncertainty_status IN ('published','not_published','not_yet_extracted','not_yet_checked')),
 status TEXT NOT NULL,vintage TEXT NOT NULL,retrieved_at TEXT NOT NULL,source_url TEXT NOT NULL,
 PRIMARY KEY(series_version_id,period,vintage)
);
CREATE TABLE IF NOT EXISTS jobs_studies (
 id TEXT PRIMARY KEY,title TEXT NOT NULL,authors TEXT NOT NULL,venue TEXT,doi TEXT,peer_reviewed INTEGER NOT NULL,status_note TEXT,
 revision_id TEXT NOT NULL,published_at TEXT NOT NULL,retrieved_at TEXT NOT NULL,data_period TEXT NOT NULL,design TEXT NOT NULL,sample TEXT NOT NULL,
 geography TEXT NOT NULL,limitations TEXT NOT NULL,rights_id TEXT NOT NULL REFERENCES jobs_rights(id),url TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS jobs_study_results (
 id TEXT PRIMARY KEY,study_id TEXT NOT NULL REFERENCES jobs_studies(id),kind TEXT NOT NULL CHECK(kind IN ('measured','survey_estimate','model_derived_estimate','modelled_exposure','projection')),
 finding TEXT NOT NULL,effect REAL NOT NULL,effect_unit TEXT NOT NULL,standard_error REAL,relative_standard_error REAL,
 interval_lower REAL,interval_upper REAL,interval_type TEXT,confidence_level REAL,
 uncertainty_status TEXT NOT NULL DEFAULT 'not_yet_checked' CHECK(uncertainty_status IN ('published','not_published','not_yet_extracted','not_yet_checked'))
);
CREATE TABLE IF NOT EXISTS jobs_company_claims (
 id TEXT PRIMARY KEY,company TEXT NOT NULL,claim_type TEXT NOT NULL,ai_role TEXT NOT NULL,
 total_announced_change REAL,total_unit TEXT,total_scope TEXT,ai_attributed_change REAL,ai_attributed_unit TEXT,
 quote TEXT NOT NULL,statement_url TEXT NOT NULL,statement_channel TEXT NOT NULL,statement_date TEXT NOT NULL,
 executive_name TEXT,executive_role TEXT,context_url TEXT NOT NULL,added_by TEXT NOT NULL,checked_by TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status='company_claim'),allowed_domains TEXT,explicit_ai_attribution INTEGER,
 CHECK(added_by<>checked_by),CHECK(ai_attributed_change IS NULL OR explicit_ai_attribution=1)
);
CREATE TRIGGER IF NOT EXISTS jobs_observations_no_update BEFORE UPDATE ON jobs_observations BEGIN SELECT RAISE(ABORT,'append-only observations'); END;
CREATE TRIGGER IF NOT EXISTS jobs_observations_no_delete BEFORE DELETE ON jobs_observations BEGIN SELECT RAISE(ABORT,'append-only observations'); END;
CREATE TRIGGER IF NOT EXISTS jobs_versions_no_update BEFORE UPDATE ON jobs_series_versions BEGIN SELECT RAISE(ABORT,'immutable method'); END;
CREATE TRIGGER IF NOT EXISTS jobs_versions_no_delete BEFORE DELETE ON jobs_series_versions BEGIN SELECT RAISE(ABORT,'immutable method'); END;
