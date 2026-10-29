-- EOS 3.8 Project-to-Asset Digital Thread.
-- Additive. Staging/development only. Not a full EAM/CMMS/ERP.

CREATE TABLE IF NOT EXISTS eos3_operational_assets (
  asset_id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stable_asset_id          TEXT NOT NULL UNIQUE,
  tenant_id                UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id             UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  owner_context            TEXT NOT NULL,
  originating_project_id   TEXT NOT NULL,
  system_object_id         TEXT,
  parent_asset_id          UUID REFERENCES eos3_operational_assets(asset_id),
  asset_class              TEXT NOT NULL,
  hierarchy_level          TEXT NOT NULL,
  lifecycle_state          TEXT NOT NULL,
  jurisdiction_context     TEXT,
  handover_package_id      UUID,
  current_configuration_id UUID,
  provenance               JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (stable_asset_id <> originating_project_id)
);

CREATE INDEX IF NOT EXISTS idx_eos3_assets_ws
  ON eos3_operational_assets (tenant_id, workspace_id);

ALTER TABLE eos3_operational_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_assets_select ON eos3_operational_assets;
CREATE POLICY eos3_assets_select ON eos3_operational_assets
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_assets_write ON eos3_operational_assets;
CREATE POLICY eos3_assets_write ON eos3_operational_assets
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE TABLE IF NOT EXISTS eos3_handover_packages (
  handover_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id    TEXT NOT NULL,
  status        TEXT NOT NULL,
  package       JSONB NOT NULL DEFAULT '{}'::jsonb,
  immutable     BOOLEAN NOT NULL DEFAULT FALSE,
  accepted_by   TEXT,
  accepted_at   TIMESTAMPTZ,
  provenance    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE eos3_handover_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_handover_select ON eos3_handover_packages;
CREATE POLICY eos3_handover_select ON eos3_handover_packages
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_handover_write ON eos3_handover_packages;
CREATE POLICY eos3_handover_write ON eos3_handover_packages
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE TABLE IF NOT EXISTS eos3_asset_configurations (
  configuration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id     UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id         UUID NOT NULL REFERENCES eos3_operational_assets(asset_id) ON DELETE CASCADE,
  version          INTEGER NOT NULL,
  state_class      TEXT NOT NULL,
  source_baseline_object_id TEXT,
  source_handover_package_id UUID,
  modification_project_id TEXT,
  member_refs      JSONB NOT NULL DEFAULT '[]'::jsonb,
  accepted         BOOLEAN NOT NULL DEFAULT FALSE,
  provenance       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (asset_id, version)
);

ALTER TABLE eos3_asset_configurations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_asset_cfg_select ON eos3_asset_configurations;
CREATE POLICY eos3_asset_cfg_select ON eos3_asset_configurations
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_asset_cfg_write ON eos3_asset_configurations;
CREATE POLICY eos3_asset_cfg_write ON eos3_asset_configurations
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE TABLE IF NOT EXISTS eos3_asset_inspections (
  inspection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id      UUID NOT NULL REFERENCES eos3_operational_assets(asset_id) ON DELETE CASCADE,
  record        JSONB NOT NULL DEFAULT '{}'::jsonb,
  disposition   TEXT NOT NULL DEFAULT 'OPEN',
  provenance    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE eos3_asset_inspections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_asset_insp_select ON eos3_asset_inspections;
CREATE POLICY eos3_asset_insp_select ON eos3_asset_inspections
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_asset_insp_write ON eos3_asset_inspections;
CREATE POLICY eos3_asset_insp_write ON eos3_asset_inspections
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE TABLE IF NOT EXISTS eos3_project_asset_mappings (
  mapping_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_object_id TEXT NOT NULL,
  asset_id UUID NOT NULL REFERENCES eos3_operational_assets(asset_id) ON DELETE CASCADE,
  mapping_kind TEXT NOT NULL,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE eos3_project_asset_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_pam_select ON eos3_project_asset_mappings;
CREATE POLICY eos3_pam_select ON eos3_project_asset_mappings
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

COMMENT ON TABLE eos3_operational_assets IS
  'EOS 3.8 operational assets. stable_asset_id survives modification projects; not equal to project id.';
COMMENT ON TABLE eos3_handover_packages IS
  'EOS 3.8 handover packages. Acceptance is human-only; accepted packages are historically immutable.';
