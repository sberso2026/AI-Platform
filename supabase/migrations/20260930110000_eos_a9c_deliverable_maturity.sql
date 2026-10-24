-- EOS-A9C: Deliverable & Engineering Maturity Intelligence.
-- Additive after 20260930100000_eos_a9b_lifecycle_evidence_and_schedule.sql.
-- A Deliverable is a governed engineering expectation, not a Document.
-- Maturity is purpose-specific evidence. It is not approval, safety, or percent complete.

CREATE TABLE IF NOT EXISTS engineering_deliverable_profile_settings (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id               UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  enabled_definition_ids     JSONB,
  maturity_profile_id        TEXT NOT NULL,
  maturity_profile_version   TEXT NOT NULL,
  configured_by              UUID REFERENCES profiles(id) ON DELETE SET NULL,
  configured_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_eng_deliverable_profile_settings_ws
  ON engineering_deliverable_profile_settings (tenant_id, workspace_id);

DROP TRIGGER IF EXISTS engineering_deliverable_profile_settings_updated_at ON engineering_deliverable_profile_settings;
CREATE TRIGGER engineering_deliverable_profile_settings_updated_at
  BEFORE UPDATE ON engineering_deliverable_profile_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS engineering_deliverable_profile_settings_workspace_tenant ON engineering_deliverable_profile_settings;
CREATE TRIGGER engineering_deliverable_profile_settings_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_deliverable_profile_settings
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_deliverable_profile_settings IS
  'EOS-A9C governed deliverable catalog selection and maturity profile version. Definitions stay in code. Not a DMS or executable rule editor.';

CREATE TABLE IF NOT EXISTS engineering_deliverable_expectations (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                 UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                   TEXT NOT NULL,
  definition_id                TEXT NOT NULL,
  definition_version           TEXT NOT NULL,
  definition_code              TEXT NOT NULL,
  lifecycle_profile_id         TEXT NOT NULL,
  lifecycle_profile_version    TEXT NOT NULL,
  lifecycle_stage              TEXT NOT NULL CHECK (lifecycle_stage IN (
    'CONCEPT', 'PREFEASIBILITY', 'FEASIBILITY', 'FEED', 'DETAILED_DESIGN',
    'CONSTRUCTION', 'COMMISSIONING', 'OPERATIONS', 'MODIFICATION'
  )),
  scope_type                   TEXT NOT NULL CHECK (scope_type IN ('PROJECT', 'SYSTEM', 'ASSET')),
  scope_id                     TEXT NOT NULL,
  requirement_state            TEXT NOT NULL CHECK (requirement_state IN ('REQUIRED', 'OPTIONAL', 'NOT_APPLICABLE')),
  intended_purpose             TEXT NOT NULL CHECK (intended_purpose IN (
    'FOR_INTERNAL_COORDINATION', 'FOR_ENGINEERING_REVIEW', 'FOR_BASELINE',
    'FOR_CONSTRUCTION_USE', 'FOR_COMMISSIONING', 'FOR_OPERATIONS'
  )),
  maturity_profile_id          TEXT NOT NULL,
  maturity_profile_version     TEXT NOT NULL,
  responsible_discipline       TEXT NOT NULL,
  contributing_disciplines     JSONB NOT NULL DEFAULT '[]'::jsonb,
  schedule_object_id           TEXT,
  schedule_status              TEXT CHECK (schedule_status IS NULL OR schedule_status IN ('planned', 'active', 'complete')),
  origin                       TEXT NOT NULL CHECK (origin IN (
    'LIFECYCLE_PROFILE', 'PROJECT_CONFIGURATION', 'DISCIPLINE_CONFIGURATION', 'HUMAN_GOVERNED'
  )),
  created_by                   TEXT,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eng_deliverable_expectations_ws
  ON engineering_deliverable_expectations (tenant_id, workspace_id, project_id);

DROP TRIGGER IF EXISTS engineering_deliverable_expectations_updated_at ON engineering_deliverable_expectations;
CREATE TRIGGER engineering_deliverable_expectations_updated_at
  BEFORE UPDATE ON engineering_deliverable_expectations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS engineering_deliverable_expectations_workspace_tenant ON engineering_deliverable_expectations;
CREATE TRIGGER engineering_deliverable_expectations_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_deliverable_expectations
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_deliverable_expectations IS
  'EOS-A9C governed deliverable expectation applied to a lifecycle scope. Not a document row and not schedule percent-complete authority.';

CREATE TABLE IF NOT EXISTS engineering_deliverable_artifact_bindings (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id       UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  expectation_id     UUID NOT NULL REFERENCES engineering_deliverable_expectations(id) ON DELETE CASCADE,
  artifact_class     TEXT NOT NULL CHECK (artifact_class IN (
    'document', 'analysis_result', 'review_package', 'decision', 'configuration_baseline',
    'interface', 'requirement', 'assumption', 'model', 'register', 'dataset'
  )),
  artifact_id        TEXT NOT NULL,
  artifact_role      TEXT NOT NULL CHECK (artifact_role IN (
    'PRIMARY', 'SUPPORTING', 'EVIDENCE', 'MODEL', 'CALCULATION', 'REVIEW', 'DECISION', 'CONFIGURATION'
  )),
  revision_ref       TEXT,
  bound_by           TEXT,
  bound_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eng_deliverable_bindings_expectation
  ON engineering_deliverable_artifact_bindings (tenant_id, workspace_id, expectation_id);

DROP TRIGGER IF EXISTS engineering_deliverable_bindings_workspace_tenant ON engineering_deliverable_artifact_bindings;
CREATE TRIGGER engineering_deliverable_bindings_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_deliverable_artifact_bindings
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_deliverable_artifact_bindings IS
  'EOS-A9C governed links from a deliverable expectation to canonical Engineering objects. Does not copy document bytes or Review findings.';

CREATE OR REPLACE FUNCTION engineering_deliverable_child_matches_expectation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  parent_tenant UUID;
  parent_workspace UUID;
BEGIN
  SELECT tenant_id, workspace_id INTO parent_tenant, parent_workspace
  FROM engineering_deliverable_expectations
  WHERE id = NEW.expectation_id;
  IF parent_tenant IS NULL OR parent_tenant <> NEW.tenant_id OR parent_workspace <> NEW.workspace_id THEN
    RAISE EXCEPTION 'cross_workspace_artifact_binding_denied';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS engineering_deliverable_bindings_expectation_scope ON engineering_deliverable_artifact_bindings;
CREATE TRIGGER engineering_deliverable_bindings_expectation_scope
  BEFORE INSERT OR UPDATE ON engineering_deliverable_artifact_bindings
  FOR EACH ROW EXECUTE FUNCTION engineering_deliverable_child_matches_expectation();

CREATE TABLE IF NOT EXISTS engineering_deliverable_assessments (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id             UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  expectation_id           UUID NOT NULL REFERENCES engineering_deliverable_expectations(id) ON DELETE CASCADE,
  maturity_profile_id      TEXT NOT NULL,
  maturity_profile_version TEXT NOT NULL,
  intended_purpose         TEXT NOT NULL,
  completeness             TEXT NOT NULL CHECK (completeness IN ('COMPLETE', 'PARTIAL', 'FAILED')),
  readiness                TEXT NOT NULL CHECK (readiness IN (
    'NOT_EVALUATED', 'INCOMPLETE', 'PARTIAL', 'READY_FOR_REVIEW',
    'READY_FOR_CONFIGURED_PURPOSE', 'STALE', 'FAILED'
  )),
  truncated                BOOLEAN NOT NULL DEFAULT FALSE,
  stale                    BOOLEAN NOT NULL DEFAULT FALSE,
  evidence_source          TEXT NOT NULL DEFAULT 'CANONICAL' CHECK (evidence_source IN ('CANONICAL', 'TEST_FIXTURE')),
  evidence_fingerprint     TEXT NOT NULL,
  dimensions               JSONB NOT NULL DEFAULT '[]'::jsonb,
  artifact_refs            JSONB NOT NULL DEFAULT '[]'::jsonb,
  assurance_signals        JSONB NOT NULL DEFAULT '[]'::jsonb,
  digital_thread           TEXT NOT NULL DEFAULT '',
  waiver_ids               JSONB NOT NULL DEFAULT '[]'::jsonb,
  reason                   TEXT,
  assessed_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  harvested_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eng_deliverable_assessments_expectation
  ON engineering_deliverable_assessments (tenant_id, workspace_id, expectation_id, assessed_at DESC);

DROP TRIGGER IF EXISTS engineering_deliverable_assessments_workspace_tenant ON engineering_deliverable_assessments;
CREATE TRIGGER engineering_deliverable_assessments_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_deliverable_assessments
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_deliverable_assessments IS
  'EOS-A9C historical maturity assessments. Append-oriented. A waiver does not rewrite dimension evidence as SATISFIED.';

CREATE TABLE IF NOT EXISTS engineering_deliverable_waivers (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id             UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  expectation_id           UUID NOT NULL REFERENCES engineering_deliverable_expectations(id) ON DELETE CASCADE,
  assessment_id            UUID NOT NULL REFERENCES engineering_deliverable_assessments(id) ON DELETE CASCADE,
  dimension                TEXT NOT NULL,
  rationale                TEXT NOT NULL,
  actor_id                 TEXT NOT NULL,
  supporting_decision_id   TEXT,
  supporting_review_id     TEXT,
  waived_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eng_deliverable_waivers_expectation
  ON engineering_deliverable_waivers (tenant_id, workspace_id, expectation_id);

DROP TRIGGER IF EXISTS engineering_deliverable_waivers_workspace_tenant ON engineering_deliverable_waivers;
CREATE TRIGGER engineering_deliverable_waivers_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_deliverable_waivers
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_deliverable_waivers IS
  'EOS-A9C human exception overlay. Does not fabricate missing evidence or rewrite criterion state as SATISFIED.';

DROP TRIGGER IF EXISTS engineering_deliverable_assessments_expectation_scope ON engineering_deliverable_assessments;
CREATE TRIGGER engineering_deliverable_assessments_expectation_scope
  BEFORE INSERT OR UPDATE ON engineering_deliverable_assessments
  FOR EACH ROW EXECUTE FUNCTION engineering_deliverable_child_matches_expectation();

DROP TRIGGER IF EXISTS engineering_deliverable_waivers_expectation_scope ON engineering_deliverable_waivers;
CREATE TRIGGER engineering_deliverable_waivers_expectation_scope
  BEFORE INSERT OR UPDATE ON engineering_deliverable_waivers
  FOR EACH ROW EXECUTE FUNCTION engineering_deliverable_child_matches_expectation();

ALTER TABLE engineering_deliverable_profile_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_deliverable_expectations ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_deliverable_artifact_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_deliverable_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_deliverable_waivers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_deliverable_profile_settings_select ON engineering_deliverable_profile_settings;
DROP POLICY IF EXISTS eng_deliverable_profile_settings_insert ON engineering_deliverable_profile_settings;
DROP POLICY IF EXISTS eng_deliverable_profile_settings_update ON engineering_deliverable_profile_settings;
DROP POLICY IF EXISTS eng_deliverable_profile_settings_delete ON engineering_deliverable_profile_settings;

CREATE POLICY eng_deliverable_profile_settings_select ON engineering_deliverable_profile_settings
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_deliverable_profile_settings_insert ON engineering_deliverable_profile_settings
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_deliverable_profile_settings_update ON engineering_deliverable_profile_settings
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_deliverable_profile_settings_delete ON engineering_deliverable_profile_settings
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eng_deliverable_expectations_select ON engineering_deliverable_expectations;
DROP POLICY IF EXISTS eng_deliverable_expectations_insert ON engineering_deliverable_expectations;
DROP POLICY IF EXISTS eng_deliverable_expectations_update ON engineering_deliverable_expectations;
DROP POLICY IF EXISTS eng_deliverable_expectations_delete ON engineering_deliverable_expectations;

CREATE POLICY eng_deliverable_expectations_select ON engineering_deliverable_expectations
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_deliverable_expectations_insert ON engineering_deliverable_expectations
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_deliverable_expectations_update ON engineering_deliverable_expectations
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_deliverable_expectations_delete ON engineering_deliverable_expectations
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eng_deliverable_bindings_select ON engineering_deliverable_artifact_bindings;
DROP POLICY IF EXISTS eng_deliverable_bindings_insert ON engineering_deliverable_artifact_bindings;
DROP POLICY IF EXISTS eng_deliverable_bindings_update ON engineering_deliverable_artifact_bindings;
DROP POLICY IF EXISTS eng_deliverable_bindings_delete ON engineering_deliverable_artifact_bindings;

CREATE POLICY eng_deliverable_bindings_select ON engineering_deliverable_artifact_bindings
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_deliverable_bindings_insert ON engineering_deliverable_artifact_bindings
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_deliverable_bindings_update ON engineering_deliverable_artifact_bindings
  FOR UPDATE USING (false);

CREATE POLICY eng_deliverable_bindings_delete ON engineering_deliverable_artifact_bindings
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eng_deliverable_assessments_select ON engineering_deliverable_assessments;
DROP POLICY IF EXISTS eng_deliverable_assessments_insert ON engineering_deliverable_assessments;
DROP POLICY IF EXISTS eng_deliverable_assessments_update ON engineering_deliverable_assessments;
DROP POLICY IF EXISTS eng_deliverable_assessments_delete ON engineering_deliverable_assessments;

CREATE POLICY eng_deliverable_assessments_select ON engineering_deliverable_assessments
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_deliverable_assessments_insert ON engineering_deliverable_assessments
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_deliverable_assessments_update ON engineering_deliverable_assessments
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_deliverable_assessments_delete ON engineering_deliverable_assessments
  FOR DELETE USING (false);

DROP POLICY IF EXISTS eng_deliverable_waivers_select ON engineering_deliverable_waivers;
DROP POLICY IF EXISTS eng_deliverable_waivers_insert ON engineering_deliverable_waivers;
DROP POLICY IF EXISTS eng_deliverable_waivers_update ON engineering_deliverable_waivers;
DROP POLICY IF EXISTS eng_deliverable_waivers_delete ON engineering_deliverable_waivers;

CREATE POLICY eng_deliverable_waivers_select ON engineering_deliverable_waivers
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_deliverable_waivers_insert ON engineering_deliverable_waivers
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_deliverable_waivers_update ON engineering_deliverable_waivers
  FOR UPDATE USING (false);

CREATE POLICY eng_deliverable_waivers_delete ON engineering_deliverable_waivers
  FOR DELETE USING (false);
