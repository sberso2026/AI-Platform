-- EOS-A11E: Change impact, option study and construction engineering workbench composition.
-- Additive after 20260930190000_eos_a11d_pre_issue_engineering_review.sql.
-- Reuses canonical engineering_changes / engineering_impacts. Does not store artifact bytes.

CREATE TABLE IF NOT EXISTS engineering_impact_assessments (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id               UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                 TEXT NOT NULL,
  source_object_type         TEXT NOT NULL,
  source_object_id           TEXT NOT NULL,
  source_change_id           TEXT,
  workflow                   TEXT NOT NULL DEFAULT 'CHANGE_IMPACT' CHECK (workflow IN (
    'CHANGE_IMPACT',
    'OPTION_STUDY',
    'CONSTRUCTION_RFI',
    'FIELD_CHANGE',
    'COMMISSIONING',
    'HANDOVER',
    'CONCEPT_PFS',
    'FEED_CHANGE',
    'DETAILED_DESIGN_CHANGE'
  )),
  policy_code                TEXT NOT NULL DEFAULT 'EOS-A11E-IMPACT-ASSESSMENT',
  policy_version             TEXT NOT NULL DEFAULT '1.0.0',
  status                     TEXT NOT NULL CHECK (status IN (
    'DRAFT', 'ANALYSING', 'REVIEW_REQUIRED', 'IN_REVIEW', 'CONFIRMED', 'SUPERSEDED', 'CANCELLED'
  )),
  completeness               TEXT NOT NULL CHECK (completeness IN ('COMPLETE', 'PARTIAL', 'FAILED')),
  traversal_status           TEXT NOT NULL CHECK (traversal_status IN ('COMPLETE', 'PARTIAL_TRAVERSAL', 'FAILED')),
  staleness                  TEXT NOT NULL DEFAULT 'CURRENT' CHECK (staleness IN (
    'CURRENT', 'POTENTIALLY_STALE', 'STALE', 'RERUN_REQUIRED'
  )),
  source_fingerprint         TEXT NOT NULL,
  graph_fingerprint          TEXT NOT NULL,
  snapshot                   JSONB NOT NULL DEFAULT '{}'::jsonb,
  supersedes_assessment_id   UUID REFERENCES engineering_impact_assessments(id) ON DELETE SET NULL,
  view_project_mismatch      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by                 TEXT
);

CREATE INDEX IF NOT EXISTS idx_eng_impact_assessments_source
  ON engineering_impact_assessments (tenant_id, workspace_id, source_object_type, source_object_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_eng_impact_assessments_project
  ON engineering_impact_assessments (tenant_id, workspace_id, project_id, created_at DESC);

DROP TRIGGER IF EXISTS engineering_impact_assessments_workspace_tenant ON engineering_impact_assessments;
CREATE TRIGGER engineering_impact_assessments_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_impact_assessments
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_impact_assessments IS
  'EOS-A11E impact assessment composition around canonical Change/Impact. References only. A11E_BINARY_DUPLICATION = NO. Potential impact is not confirmed impact.';

ALTER TABLE engineering_impact_assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_impact_assessments_select ON engineering_impact_assessments;
DROP POLICY IF EXISTS eng_impact_assessments_insert ON engineering_impact_assessments;
DROP POLICY IF EXISTS eng_impact_assessments_update ON engineering_impact_assessments;
DROP POLICY IF EXISTS eng_impact_assessments_delete ON engineering_impact_assessments;

CREATE POLICY eng_impact_assessments_select ON engineering_impact_assessments
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_impact_assessments_insert ON engineering_impact_assessments
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_impact_assessments_update ON engineering_impact_assessments
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_impact_assessments_delete ON engineering_impact_assessments
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_impact_assessments TO anon, authenticated, service_role;
