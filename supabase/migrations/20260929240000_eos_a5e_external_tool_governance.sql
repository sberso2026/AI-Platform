-- EOS-A5E amendment — External Tool governance
-- Generic tenant tool profiles + workspace assignments.
-- Does not certify SPACE GASS. Does not store licence secrets.

CREATE TABLE IF NOT EXISTS engineering_external_tool_profiles (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tool_code                  TEXT NOT NULL,
  name                       TEXT NOT NULL,
  vendor                     TEXT NOT NULL,
  category                   TEXT NOT NULL CHECK (category IN (
    'ANALYSIS_SIMULATION', 'CAD_BIM', 'PROJECT_CONTROLS', 'DOCUMENT_INFORMATION',
    'ERP_COMMERCIAL', 'DATA_ANALYTICS', 'ASSET_OPERATIONS', 'FIELD_INSPECTION',
    'COLLABORATION', 'DATA_SOURCE', 'OTHER'
  )),
  enabled                    BOOLEAN NOT NULL DEFAULT TRUE,
  status                     TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'disabled')),
  environment                TEXT NOT NULL DEFAULT 'unknown' CHECK (environment IN ('staging', 'production', 'unknown')),
  integration_modes          JSONB NOT NULL DEFAULT '[]',
  adapter_id                 TEXT,
  adapter_version            TEXT,
  provider_key               TEXT,
  platform_tool_key          TEXT,
  compatible_tool_versions   JSONB NOT NULL DEFAULT '[]',
  not_certified_tool_versions JSONB NOT NULL DEFAULT '[]',
  min_supported_version      TEXT,
  execution_host_id          TEXT,
  installed_version          TEXT,
  executable_path            TEXT,
  installation_status        TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (installation_status IN (
    'UNKNOWN', 'NOT_INSTALLED', 'INSTALLED', 'INVALID'
  )),
  licence_status             TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (licence_status IN (
    'UNKNOWN', 'AVAILABLE', 'UNAVAILABLE', 'EXPIRED', 'NOT_REQUIRED'
  )),
  automation_permission      TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (automation_permission IN (
    'UNKNOWN', 'PERMITTED', 'NOT_PERMITTED', 'REQUIRES_CONFIRMATION'
  )),
  automation_confirmed_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  automation_confirmed_at    TIMESTAMPTZ,
  automation_basis           TEXT,
  automation_reference       TEXT,
  credential_secret_id       UUID,
  endpoint                   TEXT,
  connector_id               TEXT,
  auth_scopes                JSONB NOT NULL DEFAULT '[]',
  capabilities               JSONB NOT NULL DEFAULT '[]',
  last_validation            JSONB NOT NULL DEFAULT '{"ranAt":null,"overall":"NOT_RUN","checks":[]}',
  owner_id                   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by                 UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by                 UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata                   JSONB NOT NULL DEFAULT '{}',
  UNIQUE (tenant_id, tool_code)
);

CREATE INDEX IF NOT EXISTS idx_eng_ext_tool_profiles_tenant
  ON engineering_external_tool_profiles (tenant_id, tool_code);

CREATE TRIGGER engineering_external_tool_profiles_updated_at
  BEFORE UPDATE ON engineering_external_tool_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE engineering_external_tool_profiles IS
  'Platform/admin External Tool Profile. Installation, licence, automation, and adapter certification. Secrets are references only.';

COMMENT ON COLUMN engineering_external_tool_profiles.credential_secret_id IS
  'Reference to platform secrets.id only. Never store licence keys, tokens, or passwords here.';

COMMENT ON COLUMN engineering_external_tool_profiles.executable_path IS
  'Host installation path. Not a workspace/project setting.';

CREATE TABLE IF NOT EXISTS engineering_external_tool_assignments (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id            UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id              UUID REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  profile_id              UUID NOT NULL REFERENCES engineering_external_tool_profiles(id) ON DELETE CASCADE,
  allowed                 BOOLEAN NOT NULL DEFAULT TRUE,
  permitted_capabilities  JSONB NOT NULL DEFAULT '[]',
  design_standard         TEXT,
  unit_system             TEXT,
  analysis_profile        TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_eng_ext_tool_assign_ws
  ON engineering_external_tool_assignments (tenant_id, workspace_id);

CREATE TRIGGER engineering_external_tool_assignments_updated_at
  BEFORE UPDATE ON engineering_external_tool_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE engineering_external_tool_assignments IS
  'Workspace/project authorization to use an approved External Tool Profile. Cannot redefine executable, licence, or credentials.';

ALTER TABLE engineering_external_tool_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_external_tool_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY eng_ext_tool_profiles_select ON engineering_external_tool_profiles
  FOR SELECT USING (tenant_id = ANY (get_user_tenant_ids()));

CREATE POLICY eng_ext_tool_profiles_insert ON engineering_external_tool_profiles
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY eng_ext_tool_profiles_update ON engineering_external_tool_profiles
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY eng_ext_tool_profiles_delete ON engineering_external_tool_profiles
  FOR DELETE USING (has_permission('engineering', 'admin', tenant_id));

CREATE POLICY eng_ext_tool_assign_select ON engineering_external_tool_assignments
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND (
      has_permission('engineering', 'admin', tenant_id)
      OR engineering_core_workspace_member(workspace_id)
    )
  );

CREATE POLICY eng_ext_tool_assign_insert ON engineering_external_tool_assignments
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY eng_ext_tool_assign_update ON engineering_external_tool_assignments
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY eng_ext_tool_assign_delete ON engineering_external_tool_assignments
  FOR DELETE USING (has_permission('engineering', 'admin', tenant_id));

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_external_tool_profiles TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_external_tool_assignments TO anon, authenticated, service_role;
