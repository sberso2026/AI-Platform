-- EOS-A9A: Lifecycle Intelligence Foundation.
-- Additive after 20260930080000_eos_a8d_assurance_governance.sql.
-- Lifecycle Stage is not schedule, maturity, baseline, or gate approval.
-- Transitions are append-only. AI cannot approve a gate or stage change.

CREATE TABLE IF NOT EXISTS engineering_lifecycle_profile_settings (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id             UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id               UUID,
  profile_id               TEXT NOT NULL,
  profile_version          TEXT NOT NULL,
  enabled_criterion_ids    JSONB,
  omitted_stages           JSONB NOT NULL DEFAULT '[]'::jsonb,
  configured_by            UUID REFERENCES profiles(id) ON DELETE SET NULL,
  configured_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_eng_lifecycle_profile_settings_ws
  ON engineering_lifecycle_profile_settings (tenant_id, workspace_id);

DROP TRIGGER IF EXISTS engineering_lifecycle_profile_settings_updated_at ON engineering_lifecycle_profile_settings;
CREATE TRIGGER engineering_lifecycle_profile_settings_updated_at
  BEFORE UPDATE ON engineering_lifecycle_profile_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS engineering_lifecycle_profile_settings_workspace_tenant ON engineering_lifecycle_profile_settings;
CREATE TRIGGER engineering_lifecycle_profile_settings_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_lifecycle_profile_settings
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_lifecycle_profile_settings IS
  'EOS-A9A governed Lifecycle Profile selection. Code-catalog profile identity/version. Not a workflow DSL.';

CREATE TABLE IF NOT EXISTS engineering_lifecycle_assignments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id       UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id         TEXT NOT NULL,
  scope_type         TEXT NOT NULL CHECK (scope_type IN ('PROJECT', 'SYSTEM', 'ASSET')),
  scope_id           TEXT NOT NULL,
  parent_scope_type  TEXT CHECK (parent_scope_type IS NULL OR parent_scope_type IN ('PROJECT', 'SYSTEM', 'ASSET')),
  parent_scope_id    TEXT,
  stage              TEXT NOT NULL CHECK (stage IN (
    'CONCEPT', 'PREFEASIBILITY', 'FEASIBILITY', 'FEED', 'DETAILED_DESIGN',
    'CONSTRUCTION', 'COMMISSIONING', 'OPERATIONS', 'MODIFICATION'
  )),
  profile_id         TEXT NOT NULL,
  profile_version    TEXT NOT NULL,
  version            INTEGER NOT NULL DEFAULT 1,
  assigned_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, project_id, scope_type, scope_id)
);

CREATE INDEX IF NOT EXISTS idx_eng_lifecycle_assignments_ws
  ON engineering_lifecycle_assignments (tenant_id, workspace_id, project_id);

DROP TRIGGER IF EXISTS engineering_lifecycle_assignments_updated_at ON engineering_lifecycle_assignments;
CREATE TRIGGER engineering_lifecycle_assignments_updated_at
  BEFORE UPDATE ON engineering_lifecycle_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS engineering_lifecycle_assignments_workspace_tenant ON engineering_lifecycle_assignments;
CREATE TRIGGER engineering_lifecycle_assignments_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_lifecycle_assignments
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_lifecycle_assignments IS
  'EOS-A9A governed lifecycle assignment. One architecture for project/system/asset scope. Stage is not schedule or maturity.';

CREATE TABLE IF NOT EXISTS engineering_lifecycle_evaluations (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id             UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  assignment_id            UUID NOT NULL REFERENCES engineering_lifecycle_assignments(id) ON DELETE CASCADE,
  gate_id                  TEXT NOT NULL,
  profile_id               TEXT NOT NULL,
  profile_version          TEXT NOT NULL,
  completeness             TEXT NOT NULL CHECK (completeness IN ('COMPLETE', 'PARTIAL', 'FAILED')),
  readiness                TEXT NOT NULL CHECK (readiness IN (
    'NOT_EVALUATED', 'EVALUATING', 'READY_FOR_REVIEW', 'NOT_READY', 'PARTIAL', 'FAILED', 'STALE'
  )),
  truncated                BOOLEAN NOT NULL DEFAULT FALSE,
  remaining_scope_unknown  BOOLEAN NOT NULL DEFAULT FALSE,
  reason                   TEXT,
  criteria                 JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence_fingerprint     TEXT NOT NULL DEFAULT '',
  stale                    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eng_lifecycle_evaluations_assignment
  ON engineering_lifecycle_evaluations (tenant_id, workspace_id, assignment_id, gate_id, created_at DESC);

DROP TRIGGER IF EXISTS engineering_lifecycle_evaluations_workspace_tenant ON engineering_lifecycle_evaluations;
CREATE TRIGGER engineering_lifecycle_evaluations_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_lifecycle_evaluations
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_lifecycle_evaluations IS
  'EOS-A9A machine gate evaluation. PARTIAL cannot mean READY_FOR_REVIEW. Stale evaluations cannot be reused silently.';

CREATE OR REPLACE FUNCTION engineering_lifecycle_child_same_scope()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  assignment_tenant UUID;
  assignment_ws UUID;
  evaluation_tenant UUID;
  evaluation_ws UUID;
BEGIN
  IF TG_TABLE_NAME = 'engineering_lifecycle_evaluations' OR TG_TABLE_NAME = 'engineering_lifecycle_transitions' THEN
    SELECT tenant_id, workspace_id INTO assignment_tenant, assignment_ws
    FROM engineering_lifecycle_assignments
    WHERE id = NEW.assignment_id;
    IF assignment_tenant IS NULL THEN
      RAISE EXCEPTION 'assignment_not_found';
    END IF;
    IF assignment_tenant <> NEW.tenant_id THEN
      RAISE EXCEPTION 'cross_tenant_transition_denied';
    END IF;
    IF assignment_ws <> NEW.workspace_id THEN
      RAISE EXCEPTION 'cross_workspace_gate_evidence_denied';
    END IF;
  END IF;

  IF TG_TABLE_NAME = 'engineering_lifecycle_gate_decisions' THEN
    SELECT tenant_id, workspace_id INTO evaluation_tenant, evaluation_ws
    FROM engineering_lifecycle_evaluations
    WHERE id = NEW.evaluation_id;
    IF evaluation_tenant IS NULL THEN
      RAISE EXCEPTION 'evaluation_not_found';
    END IF;
    IF evaluation_tenant <> NEW.tenant_id OR evaluation_ws <> NEW.workspace_id THEN
      RAISE EXCEPTION 'cross_workspace_gate_evidence_denied';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS engineering_lifecycle_evaluations_same_scope ON engineering_lifecycle_evaluations;
CREATE TRIGGER engineering_lifecycle_evaluations_same_scope
  BEFORE INSERT OR UPDATE ON engineering_lifecycle_evaluations
  FOR EACH ROW EXECUTE FUNCTION engineering_lifecycle_child_same_scope();

DROP TRIGGER IF EXISTS engineering_lifecycle_decisions_same_scope ON engineering_lifecycle_gate_decisions;
CREATE TRIGGER engineering_lifecycle_decisions_same_scope
  BEFORE INSERT OR UPDATE ON engineering_lifecycle_gate_decisions
  FOR EACH ROW EXECUTE FUNCTION engineering_lifecycle_child_same_scope();

DROP TRIGGER IF EXISTS engineering_lifecycle_transitions_same_scope ON engineering_lifecycle_transitions;
CREATE TRIGGER engineering_lifecycle_transitions_same_scope
  BEFORE INSERT OR UPDATE ON engineering_lifecycle_transitions
  FOR EACH ROW EXECUTE FUNCTION engineering_lifecycle_child_same_scope();

CREATE TABLE IF NOT EXISTS engineering_lifecycle_gate_decisions (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id               UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  evaluation_id              UUID NOT NULL REFERENCES engineering_lifecycle_evaluations(id) ON DELETE CASCADE,
  decision                   TEXT NOT NULL CHECK (decision IN (
    'APPROVED_TO_TRANSITION', 'APPROVED_WITH_CONDITIONS', 'NOT_APPROVED', 'DEFERRED', 'WAIVED'
  )),
  rationale                  TEXT NOT NULL,
  outstanding_condition_ids  JSONB NOT NULL DEFAULT '[]'::jsonb,
  actor_id                   UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  decided_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eng_lifecycle_decisions_eval
  ON engineering_lifecycle_gate_decisions (tenant_id, workspace_id, evaluation_id, decided_at DESC);

DROP TRIGGER IF EXISTS engineering_lifecycle_gate_decisions_workspace_tenant ON engineering_lifecycle_gate_decisions;
CREATE TRIGGER engineering_lifecycle_gate_decisions_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_lifecycle_gate_decisions
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_lifecycle_gate_decisions IS
  'EOS-A9A human gate decision. Distinct from machine gate readiness. Does not resolve Assurance Conditions or create Findings.';

CREATE TABLE IF NOT EXISTS engineering_lifecycle_transitions (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  assignment_id               UUID NOT NULL REFERENCES engineering_lifecycle_assignments(id) ON DELETE RESTRICT,
  from_stage                  TEXT NOT NULL,
  to_stage                    TEXT NOT NULL,
  gate_id                     TEXT,
  evaluation_id               UUID REFERENCES engineering_lifecycle_evaluations(id) ON DELETE RESTRICT,
  decision_id                 UUID REFERENCES engineering_lifecycle_gate_decisions(id) ON DELETE RESTRICT,
  profile_id                  TEXT NOT NULL,
  profile_version             TEXT NOT NULL,
  authorized_by               UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  authorized_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rationale                   TEXT NOT NULL,
  configuration_baseline_id   TEXT,
  evidence_fingerprint        TEXT NOT NULL DEFAULT '',
  snapshot                    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eng_lifecycle_transitions_assignment
  ON engineering_lifecycle_transitions (tenant_id, workspace_id, assignment_id, authorized_at);

DROP TRIGGER IF EXISTS engineering_lifecycle_transitions_workspace_tenant ON engineering_lifecycle_transitions;
CREATE TRIGGER engineering_lifecycle_transitions_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_lifecycle_transitions
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

CREATE OR REPLACE FUNCTION prevent_lifecycle_transition_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role' AND TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'lifecycle_transition_immutable';
END;
$$;

DROP TRIGGER IF EXISTS engineering_lifecycle_transitions_immutable_upd ON engineering_lifecycle_transitions;
CREATE TRIGGER engineering_lifecycle_transitions_immutable_upd
  BEFORE UPDATE ON engineering_lifecycle_transitions
  FOR EACH ROW EXECUTE FUNCTION prevent_lifecycle_transition_mutation();

DROP TRIGGER IF EXISTS engineering_lifecycle_transitions_immutable_del ON engineering_lifecycle_transitions;
CREATE TRIGGER engineering_lifecycle_transitions_immutable_del
  BEFORE DELETE ON engineering_lifecycle_transitions
  FOR EACH ROW EXECUTE FUNCTION prevent_lifecycle_transition_mutation();

COMMENT ON TABLE engineering_lifecycle_transitions IS
  'EOS-A9A append-only lifecycle transition history. Profile/version and evidence snapshot retained. Not AI-approved.';

ALTER TABLE engineering_lifecycle_profile_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_lifecycle_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_lifecycle_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_lifecycle_gate_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_lifecycle_transitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_lifecycle_profile_settings_select ON engineering_lifecycle_profile_settings;
DROP POLICY IF EXISTS eng_lifecycle_profile_settings_insert ON engineering_lifecycle_profile_settings;
DROP POLICY IF EXISTS eng_lifecycle_profile_settings_update ON engineering_lifecycle_profile_settings;
DROP POLICY IF EXISTS eng_lifecycle_profile_settings_delete ON engineering_lifecycle_profile_settings;

CREATE POLICY eng_lifecycle_profile_settings_select ON engineering_lifecycle_profile_settings
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_lifecycle_profile_settings_insert ON engineering_lifecycle_profile_settings
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_lifecycle_profile_settings_update ON engineering_lifecycle_profile_settings
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_lifecycle_profile_settings_delete ON engineering_lifecycle_profile_settings
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eng_lifecycle_assignments_select ON engineering_lifecycle_assignments;
DROP POLICY IF EXISTS eng_lifecycle_assignments_insert ON engineering_lifecycle_assignments;
DROP POLICY IF EXISTS eng_lifecycle_assignments_update ON engineering_lifecycle_assignments;
DROP POLICY IF EXISTS eng_lifecycle_assignments_delete ON engineering_lifecycle_assignments;

CREATE POLICY eng_lifecycle_assignments_select ON engineering_lifecycle_assignments
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_lifecycle_assignments_insert ON engineering_lifecycle_assignments
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_lifecycle_assignments_update ON engineering_lifecycle_assignments
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_lifecycle_assignments_delete ON engineering_lifecycle_assignments
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eng_lifecycle_evaluations_select ON engineering_lifecycle_evaluations;
DROP POLICY IF EXISTS eng_lifecycle_evaluations_insert ON engineering_lifecycle_evaluations;
DROP POLICY IF EXISTS eng_lifecycle_evaluations_update ON engineering_lifecycle_evaluations;
DROP POLICY IF EXISTS eng_lifecycle_evaluations_delete ON engineering_lifecycle_evaluations;

CREATE POLICY eng_lifecycle_evaluations_select ON engineering_lifecycle_evaluations
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_lifecycle_evaluations_insert ON engineering_lifecycle_evaluations
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_lifecycle_evaluations_update ON engineering_lifecycle_evaluations
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_lifecycle_evaluations_delete ON engineering_lifecycle_evaluations
  FOR DELETE USING (false);

DROP POLICY IF EXISTS eng_lifecycle_decisions_select ON engineering_lifecycle_gate_decisions;
DROP POLICY IF EXISTS eng_lifecycle_decisions_insert ON engineering_lifecycle_gate_decisions;
DROP POLICY IF EXISTS eng_lifecycle_decisions_update ON engineering_lifecycle_gate_decisions;
DROP POLICY IF EXISTS eng_lifecycle_decisions_delete ON engineering_lifecycle_gate_decisions;

CREATE POLICY eng_lifecycle_decisions_select ON engineering_lifecycle_gate_decisions
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_lifecycle_decisions_insert ON engineering_lifecycle_gate_decisions
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_lifecycle_decisions_update ON engineering_lifecycle_gate_decisions
  FOR UPDATE USING (false);

CREATE POLICY eng_lifecycle_decisions_delete ON engineering_lifecycle_gate_decisions
  FOR DELETE USING (false);

DROP POLICY IF EXISTS eng_lifecycle_transitions_select ON engineering_lifecycle_transitions;
DROP POLICY IF EXISTS eng_lifecycle_transitions_insert ON engineering_lifecycle_transitions;
DROP POLICY IF EXISTS eng_lifecycle_transitions_update ON engineering_lifecycle_transitions;
DROP POLICY IF EXISTS eng_lifecycle_transitions_delete ON engineering_lifecycle_transitions;

CREATE POLICY eng_lifecycle_transitions_select ON engineering_lifecycle_transitions
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_lifecycle_transitions_insert ON engineering_lifecycle_transitions
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_lifecycle_transitions_update ON engineering_lifecycle_transitions
  FOR UPDATE USING (false);

CREATE POLICY eng_lifecycle_transitions_delete ON engineering_lifecycle_transitions
  FOR DELETE USING (false);
