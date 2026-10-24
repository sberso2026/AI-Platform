-- EOS-A8C: Engineering Assurance Conditions.
-- Additive. Canonical Digital Thread remains source of truth.
-- Conditions are not defects, findings, or issues.

CREATE TABLE IF NOT EXISTS engineering_assurance_conditions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id            UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id              UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  fingerprint             TEXT NOT NULL,
  rule_id                 TEXT NOT NULL,
  rule_version            TEXT NOT NULL,
  condition_code          TEXT NOT NULL,
  condition_type          TEXT NOT NULL CHECK (condition_type IN (
    'TRACEABILITY_GAP',
    'MISSING_ALLOCATION',
    'MISSING_SUPPORTING_EVIDENCE',
    'MISSING_REQUIRED_REVIEW',
    'STALE_EVIDENCE_REFERENCE',
    'SUPERSEDED_EVIDENCE_REFERENCE',
    'INCOMPLETE_INTERFACE_INFORMATION',
    'CROSS_DISCIPLINE_INFORMATION_GAP',
    'UNRESOLVED_DEPENDENCY',
    'UNRESOLVED_CHANGE_IMPACT_CANDIDATE',
    'MISSING_CONFIGURATION_PROVENANCE',
    'MISSING_REQUIRED_ASSUMPTION_CONTEXT',
    'ANALYSIS_RESULT_NOT_REVIEWED',
    'ANALYSIS_RESULT_NOT_ACCEPTED',
    'REQUIREMENT_VERIFICATION_INCOMPLETE'
  )),
  assurance_domain        TEXT NOT NULL,
  root_object_type        TEXT NOT NULL,
  root_object_id          TEXT NOT NULL,
  related_object_type     TEXT,
  related_object_id       TEXT,
  discipline              TEXT,
  lifecycle_stage         TEXT,
  status                  TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN (
    'OPEN',
    'ACKNOWLEDGED',
    'UNDER_REVIEW',
    'RESOLVED',
    'ACCEPTED_WITH_JUSTIFICATION',
    'NOT_APPLICABLE',
    'SUPERSEDED'
  )),
  materiality             TEXT NOT NULL DEFAULT 'UNASSESSED' CHECK (materiality IN (
    'UNASSESSED', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  )),
  detected_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_evaluated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at             TIMESTAMPTZ,
  resolution_source       TEXT CHECK (resolution_source IS NULL OR resolution_source IN (
    'CANONICAL_STATE_CHANGED', 'HUMAN_DISPOSITION', 'SUPERSEDED_BY_RULE'
  )),
  explanation             TEXT NOT NULL,
  would_resolve_if        TEXT NOT NULL DEFAULT '',
  evidence_path           JSONB NOT NULL DEFAULT '[]',
  digital_thread_path     TEXT NOT NULL DEFAULT '',
  related_objects         JSONB NOT NULL DEFAULT '[]',
  priority_factors        JSONB NOT NULL DEFAULT '{}',
  required_by_at          TIMESTAMPTZ,
  owner_id                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  disposition             TEXT CHECK (disposition IS NULL OR disposition IN (
    'ACCEPT', 'NOT_APPLICABLE', 'DEFER', 'CREATE_REVIEW', 'CREATE_ISSUE', 'RESOLVED_BY_ENGINEERING_CHANGE'
  )),
  disposition_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  disposition_at          TIMESTAMPTZ,
  disposition_rationale   TEXT,
  review_package_id       UUID,
  issue_id                UUID,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_eng_assurance_ws_status
  ON engineering_assurance_conditions (tenant_id, workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_eng_assurance_root
  ON engineering_assurance_conditions (tenant_id, workspace_id, root_object_type, root_object_id);
CREATE INDEX IF NOT EXISTS idx_eng_assurance_type
  ON engineering_assurance_conditions (tenant_id, workspace_id, condition_type);

DROP TRIGGER IF EXISTS engineering_assurance_conditions_updated_at ON engineering_assurance_conditions;
CREATE TRIGGER engineering_assurance_conditions_updated_at
  BEFORE UPDATE ON engineering_assurance_conditions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS engineering_assurance_conditions_workspace_tenant ON engineering_assurance_conditions;
CREATE TRIGGER engineering_assurance_conditions_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_assurance_conditions
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_assurance_conditions IS
  'EOS-A8C deterministic Assurance Conditions. Not defects, Review Findings, or Issues. Canonical Digital Thread remains SOT.';

ALTER TABLE engineering_assurance_conditions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_assurance_select ON engineering_assurance_conditions;
DROP POLICY IF EXISTS eng_assurance_insert ON engineering_assurance_conditions;
DROP POLICY IF EXISTS eng_assurance_update ON engineering_assurance_conditions;
DROP POLICY IF EXISTS eng_assurance_delete ON engineering_assurance_conditions;

CREATE POLICY eng_assurance_select ON engineering_assurance_conditions
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_assurance_insert ON engineering_assurance_conditions
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_assurance_update ON engineering_assurance_conditions
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_assurance_delete ON engineering_assurance_conditions
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_assurance_conditions TO anon, authenticated, service_role;
