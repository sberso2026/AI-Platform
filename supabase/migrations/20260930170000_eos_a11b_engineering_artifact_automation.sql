-- EOS-A11B: Engineering Artifact Automation.
-- Additive after 20260930160000_eos_a11a_engineering_work_generator.sql.
-- Persists generation runs and generated Office draft bytes for authenticated download.
-- Artifact templates remain a code-governed catalog. Does not create a DMS, Storage bucket,
-- issued Document, Event Bus, or executable scripts.

CREATE TABLE IF NOT EXISTS engineering_artifact_generation_runs (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                      TEXT NOT NULL,
  work_plan_id                    UUID NOT NULL REFERENCES engineering_work_plans(id) ON DELETE CASCADE,
  template_code                   TEXT NOT NULL,
  template_version                TEXT NOT NULL,
  artifact_type                   TEXT NOT NULL,
  output_format                   TEXT NOT NULL CHECK (output_format IN ('XLSX', 'DOCX', 'PPTX')),
  requested_by                    TEXT,
  generated_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  work_plan_input_fingerprint     TEXT NOT NULL,
  artifact_id                     UUID,
  status                          TEXT NOT NULL CHECK (status IN (
    'GENERATING', 'GENERATED_DRAFT', 'READY_FOR_ENGINEER_REVIEW',
    'GENERATION_BLOCKED', 'GENERATION_FAILED', 'SUPERSEDED'
  )),
  warnings                        JSONB NOT NULL DEFAULT '[]'::jsonb,
  explanation                     TEXT,
  metrics                         JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS engineering_generated_artifacts (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id           UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id             TEXT NOT NULL,
  generation_run_id      UUID NOT NULL REFERENCES engineering_artifact_generation_runs(id) ON DELETE CASCADE,
  work_plan_id           UUID NOT NULL REFERENCES engineering_work_plans(id) ON DELETE CASCADE,
  template_code          TEXT NOT NULL,
  template_version       TEXT NOT NULL,
  artifact_type          TEXT NOT NULL,
  output_format          TEXT NOT NULL CHECK (output_format IN ('XLSX', 'DOCX', 'PPTX')),
  file_name              TEXT NOT NULL,
  mime_type              TEXT NOT NULL,
  sha256                 TEXT NOT NULL,
  byte_size              INTEGER NOT NULL DEFAULT 0,
  status                 TEXT NOT NULL CHECK (status IN (
    'GENERATING', 'GENERATED_DRAFT', 'READY_FOR_ENGINEER_REVIEW',
    'GENERATION_BLOCKED', 'GENERATION_FAILED', 'SUPERSEDED'
  )),
  sheet_or_slide_count   INTEGER NOT NULL DEFAULT 0,
  provenance             JSONB NOT NULL DEFAULT '{}'::jsonb,
  warnings               JSONB NOT NULL DEFAULT '[]'::jsonb,
  content_base64         TEXT NOT NULL DEFAULT '',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  superseded_by_id       UUID REFERENCES engineering_generated_artifacts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_eng_artifact_runs_ws
  ON engineering_artifact_generation_runs (tenant_id, workspace_id, work_plan_id, generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_eng_artifacts_ws
  ON engineering_generated_artifacts (tenant_id, workspace_id, work_plan_id, created_at DESC);

DROP TRIGGER IF EXISTS engineering_artifact_runs_workspace_tenant ON engineering_artifact_generation_runs;
CREATE TRIGGER engineering_artifact_runs_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_artifact_generation_runs
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_generated_artifacts_workspace_tenant ON engineering_generated_artifacts;
CREATE TRIGGER engineering_generated_artifacts_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_generated_artifacts
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_artifact_generation_runs IS
  'EOS-A11B generation run metadata. Not engineering approval. Bytes live on engineering_generated_artifacts.';
COMMENT ON TABLE engineering_generated_artifacts IS
  'EOS-A11B generated Office draft bytes for authenticated download. Not a DMS, issued Document, or local-file capture.';

ALTER TABLE engineering_artifact_generation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_generated_artifacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_artifact_runs_select ON engineering_artifact_generation_runs;
DROP POLICY IF EXISTS eng_artifact_runs_insert ON engineering_artifact_generation_runs;
DROP POLICY IF EXISTS eng_artifact_runs_update ON engineering_artifact_generation_runs;
DROP POLICY IF EXISTS eng_artifact_runs_delete ON engineering_artifact_generation_runs;
DROP POLICY IF EXISTS eng_artifacts_select ON engineering_generated_artifacts;
DROP POLICY IF EXISTS eng_artifacts_insert ON engineering_generated_artifacts;
DROP POLICY IF EXISTS eng_artifacts_update ON engineering_generated_artifacts;
DROP POLICY IF EXISTS eng_artifacts_delete ON engineering_generated_artifacts;

CREATE POLICY eng_artifact_runs_select ON engineering_artifact_generation_runs
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_artifact_runs_insert ON engineering_artifact_generation_runs
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_artifact_runs_update ON engineering_artifact_generation_runs
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_artifact_runs_delete ON engineering_artifact_generation_runs
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_artifacts_select ON engineering_generated_artifacts
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_artifacts_insert ON engineering_generated_artifacts
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_artifacts_update ON engineering_generated_artifacts
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_artifacts_delete ON engineering_generated_artifacts
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_artifact_generation_runs TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_generated_artifacts TO anon, authenticated, service_role;
