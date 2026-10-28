-- EOS 2.1 delivery lifecycle foundation.
-- Additive. Does not rewrite EOS-A9A lifecycle tables and does not classify existing projects.

CREATE TABLE IF NOT EXISTS engineering_delivery_lifecycles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id        TEXT NOT NULL,
  stage             TEXT NOT NULL DEFAULT 'not_classified' CHECK (stage IN (
    'not_classified', 'concept', 'feasibility', 'feed', 'detailed_engineering'
  )),
  maturity          TEXT CHECK (maturity IS NULL OR maturity IN (
    'concept_initial', 'concept_reviewed', 'feasibility_developing', 'feasibility_selected',
    'feed_developing', 'feed_baselined', 'detailed_design_in_progress', 'detailed_design_verified',
    'issued_for_review', 'issued_for_approval', 'issued_for_construction'
  )),
  revision          INTEGER NOT NULL DEFAULT 1,
  state             JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, project_id)
);

CREATE TABLE IF NOT EXISTS engineering_delivery_baselines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lifecycle_id    UUID NOT NULL REFERENCES engineering_delivery_lifecycles(id) ON DELETE CASCADE,
  baseline_type   TEXT NOT NULL CHECK (baseline_type IN (
    'concept_freeze', 'feasibility_selection', 'feed_baseline', 'detailed_design_freeze', 'ifc_baseline'
  )),
  revision        INTEGER NOT NULL CHECK (revision >= 1),
  frozen          BOOLEAN NOT NULL DEFAULT TRUE,
  refs            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (lifecycle_id, baseline_type, revision)
);

CREATE TABLE IF NOT EXISTS engineering_delivery_audit (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lifecycle_id  UUID REFERENCES engineering_delivery_lifecycles(id) ON DELETE CASCADE,
  action        TEXT NOT NULL,
  actor_id      UUID,
  detail        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eng_delivery_lifecycle_ws
  ON engineering_delivery_lifecycles (tenant_id, workspace_id, project_id);
CREATE INDEX IF NOT EXISTS idx_eng_delivery_audit_ws
  ON engineering_delivery_audit (tenant_id, workspace_id, created_at);

DROP TRIGGER IF EXISTS engineering_delivery_lifecycles_updated_at ON engineering_delivery_lifecycles;
CREATE TRIGGER engineering_delivery_lifecycles_updated_at
  BEFORE UPDATE ON engineering_delivery_lifecycles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS engineering_delivery_lifecycles_workspace_tenant ON engineering_delivery_lifecycles;
CREATE TRIGGER engineering_delivery_lifecycles_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_delivery_lifecycles
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_delivery_baselines_workspace_tenant ON engineering_delivery_baselines;
CREATE TRIGGER engineering_delivery_baselines_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_delivery_baselines
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_delivery_audit_workspace_tenant ON engineering_delivery_audit;
CREATE TRIGGER engineering_delivery_audit_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_delivery_audit
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

ALTER TABLE engineering_delivery_lifecycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_delivery_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_delivery_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_delivery_lifecycle_select ON engineering_delivery_lifecycles;
DROP POLICY IF EXISTS eng_delivery_lifecycle_insert ON engineering_delivery_lifecycles;
DROP POLICY IF EXISTS eng_delivery_lifecycle_update ON engineering_delivery_lifecycles;
CREATE POLICY eng_delivery_lifecycle_select ON engineering_delivery_lifecycles
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_delivery_lifecycle_insert ON engineering_delivery_lifecycles
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND has_permission('engineering', 'execute', tenant_id)
  );
CREATE POLICY eng_delivery_lifecycle_update ON engineering_delivery_lifecycles
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND has_permission('engineering', 'execute', tenant_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND has_permission('engineering', 'execute', tenant_id)
  );

DROP POLICY IF EXISTS eng_delivery_baseline_select ON engineering_delivery_baselines;
DROP POLICY IF EXISTS eng_delivery_baseline_insert ON engineering_delivery_baselines;
CREATE POLICY eng_delivery_baseline_select ON engineering_delivery_baselines
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_delivery_baseline_insert ON engineering_delivery_baselines
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND has_permission('engineering', 'execute', tenant_id)
    AND frozen = TRUE
  );

DROP POLICY IF EXISTS eng_delivery_audit_select ON engineering_delivery_audit;
DROP POLICY IF EXISTS eng_delivery_audit_insert ON engineering_delivery_audit;
CREATE POLICY eng_delivery_audit_select ON engineering_delivery_audit
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );
CREATE POLICY eng_delivery_audit_insert ON engineering_delivery_audit
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND has_permission('engineering', 'execute', tenant_id)
  );

COMMENT ON TABLE engineering_delivery_lifecycles IS
  'EOS 2.1 delivery lifecycle. Absence of a row means not_classified. Stage is not maturity, review, approval, or baseline.';
COMMENT ON TABLE engineering_delivery_baselines IS
  'EOS 2.1 frozen configuration baseline references. A later change inserts a new revision. There is no update policy.';
