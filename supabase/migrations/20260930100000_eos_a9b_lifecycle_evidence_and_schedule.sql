-- EOS-A9B: Lifecycle evidence harvest snapshots and governed schedule mappings.
-- Additive after 20260930090000_eos_a9a_lifecycle_intelligence.sql.
-- Caller-supplied authoritative evidence is not production authority.
-- Project Controls mappings are descriptive. They do not approve gates or transition stages.

ALTER TABLE engineering_lifecycle_evaluations
  ADD COLUMN IF NOT EXISTS evidence_source TEXT NOT NULL DEFAULT 'CANONICAL'
    CHECK (evidence_source IN ('CANONICAL', 'TEST_FIXTURE'));

ALTER TABLE engineering_lifecycle_evaluations
  ADD COLUMN IF NOT EXISTS harvested_at TIMESTAMPTZ;

ALTER TABLE engineering_lifecycle_evaluations
  ADD COLUMN IF NOT EXISTS evidence_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN engineering_lifecycle_evaluations.evidence_source IS
  'EOS-A9B production harvest is CANONICAL. TEST_FIXTURE is certification/unit injection only.';
COMMENT ON COLUMN engineering_lifecycle_evaluations.evidence_snapshot IS
  'Deterministic harvested evidence references and fingerprint. Does not copy full engineering records.';

CREATE TABLE IF NOT EXISTS engineering_lifecycle_schedule_mappings (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id               UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                 TEXT NOT NULL,
  source_system              TEXT NOT NULL CHECK (source_system IN ('PROJECT_CONTROLS', 'LEGACY_PROJECT_PHASE')),
  schedule_object_id         TEXT NOT NULL,
  schedule_phase_code        TEXT NOT NULL,
  expected_lifecycle_stage   TEXT NOT NULL CHECK (expected_lifecycle_stage IN (
    'CONCEPT', 'PREFEASIBILITY', 'FEASIBILITY', 'FEED', 'DETAILED_DESIGN',
    'CONSTRUCTION', 'COMMISSIONING', 'OPERATIONS', 'MODIFICATION'
  )),
  mapping_type               TEXT NOT NULL CHECK (mapping_type IN (
    'ALIGNS_WITH', 'EXPECTED_DURING', 'GATE_MILESTONE', 'TRANSITION_MILESTONE', 'REFERENCE_ONLY'
  )),
  schedule_status            TEXT NOT NULL DEFAULT 'planned' CHECK (schedule_status IN ('planned', 'active', 'complete')),
  active                     BOOLEAN NOT NULL DEFAULT TRUE,
  configured_by              UUID REFERENCES profiles(id) ON DELETE SET NULL,
  configured_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, project_id, schedule_object_id, mapping_type)
);

CREATE INDEX IF NOT EXISTS idx_eng_lifecycle_schedule_map_ws
  ON engineering_lifecycle_schedule_mappings (tenant_id, workspace_id, project_id);

DROP TRIGGER IF EXISTS engineering_lifecycle_schedule_mappings_updated_at ON engineering_lifecycle_schedule_mappings;
CREATE TRIGGER engineering_lifecycle_schedule_mappings_updated_at
  BEFORE UPDATE ON engineering_lifecycle_schedule_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS engineering_lifecycle_schedule_mappings_workspace_tenant ON engineering_lifecycle_schedule_mappings;
CREATE TRIGGER engineering_lifecycle_schedule_mappings_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_lifecycle_schedule_mappings
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_lifecycle_schedule_mappings IS
  'EOS-A9B governed mapping from Project Controls/legacy phase context to expected lifecycle stage. Not lifecycle SOT. Completing a mapped milestone cannot approve a gate or transition a stage.';

ALTER TABLE engineering_lifecycle_schedule_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_lifecycle_schedule_map_select ON engineering_lifecycle_schedule_mappings;
DROP POLICY IF EXISTS eng_lifecycle_schedule_map_insert ON engineering_lifecycle_schedule_mappings;
DROP POLICY IF EXISTS eng_lifecycle_schedule_map_update ON engineering_lifecycle_schedule_mappings;
DROP POLICY IF EXISTS eng_lifecycle_schedule_map_delete ON engineering_lifecycle_schedule_mappings;

CREATE POLICY eng_lifecycle_schedule_map_select ON engineering_lifecycle_schedule_mappings
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_lifecycle_schedule_map_insert ON engineering_lifecycle_schedule_mappings
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_lifecycle_schedule_map_update ON engineering_lifecycle_schedule_mappings
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_lifecycle_schedule_map_delete ON engineering_lifecycle_schedule_mappings
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
