-- EOS-A7A — Multidiscipline Intelligence Foundation
-- Reuses engineering_disciplines as canonical identity.
-- Does not create per-discipline OS tables, findings tables, or optimization silos.
-- Does not store executable path, licence, or tool version on discipline records.

INSERT INTO engineering_disciplines (tenant_id, discipline_key, name, description, is_system)
SELECT NULL, v.discipline_key, v.name, v.description, TRUE
FROM (
  VALUES
    ('materials', 'Materials', 'Materials engineering'),
    ('safety', 'Safety', 'Safety engineering'),
    ('environmental', 'Environmental', 'Environmental engineering')
) AS v(discipline_key, name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM engineering_disciplines d
  WHERE d.tenant_id IS NULL AND d.is_system = TRUE AND d.discipline_key = v.discipline_key
);

CREATE TABLE IF NOT EXISTS engineering_discipline_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  discipline_code  TEXT NOT NULL CHECK (discipline_code IN (
    'STRUCTURAL', 'MECHANICAL', 'PROCESS', 'PIPING', 'ELECTRICAL', 'CIVIL',
    'GEOTECHNICAL', 'INSTRUMENTATION_CONTROL', 'MATERIALS', 'SAFETY', 'ENVIRONMENTAL'
  )),
  discipline_key   TEXT NOT NULL,
  enabled          BOOLEAN NOT NULL DEFAULT TRUE,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  owner_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  capabilities     JSONB NOT NULL DEFAULT '[]',
  standards        JSONB NOT NULL DEFAULT '[]',
  created_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata         JSONB NOT NULL DEFAULT '{}',
  UNIQUE (tenant_id, discipline_code)
);

CREATE INDEX IF NOT EXISTS idx_eng_disc_profiles_tenant
  ON engineering_discipline_profiles (tenant_id, discipline_code);

CREATE TRIGGER engineering_discipline_profiles_updated_at
  BEFORE UPDATE ON engineering_discipline_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE engineering_discipline_profiles IS
  'EOS-A7A tenant overlay on canonical engineering_disciplines. Not a second identity. Capabilities JSON; no executable/licence fields.';

CREATE TABLE IF NOT EXISTS engineering_discipline_tool_bindings (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id               UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  discipline_code            TEXT NOT NULL,
  capability_key             TEXT NOT NULL,
  tool_code                  TEXT NOT NULL,
  external_tool_profile_id   UUID REFERENCES engineering_external_tool_profiles(id) ON DELETE SET NULL,
  certification_status       TEXT NOT NULL DEFAULT 'NOT_CERTIFIED' CHECK (certification_status IN (
    'NOT_AVAILABLE', 'AVAILABLE', 'TOOL_DEPENDENT', 'NOT_CERTIFIED', 'CERTIFIED', 'BLOCKED', 'DEGRADED'
  )),
  priority                   INTEGER NOT NULL DEFAULT 1,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata                   JSONB NOT NULL DEFAULT '{}'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_eng_disc_tool_bind_unique
  ON engineering_discipline_tool_bindings (
    tenant_id, discipline_code, capability_key, tool_code, COALESCE(workspace_id, '00000000-0000-0000-0000-000000000000')
  );

CREATE INDEX IF NOT EXISTS idx_eng_disc_tool_bind_tenant
  ON engineering_discipline_tool_bindings (tenant_id, discipline_code);

CREATE TRIGGER engineering_discipline_tool_bindings_updated_at
  BEFORE UPDATE ON engineering_discipline_tool_bindings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE engineering_discipline_tool_bindings IS
  'Binds a discipline capability to an External Tool Profile id/code. Executable path, licence, and version stay on External Tool Governance.';

CREATE TABLE IF NOT EXISTS engineering_project_disciplines (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id     UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id       UUID NOT NULL REFERENCES engineering_projects(id) ON DELETE CASCADE,
  discipline_code  TEXT NOT NULL,
  enabled          BOOLEAN NOT NULL DEFAULT TRUE,
  lead_user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  standards        JSONB NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, discipline_code)
);

CREATE INDEX IF NOT EXISTS idx_eng_project_disciplines_ws
  ON engineering_project_disciplines (tenant_id, workspace_id);

CREATE TRIGGER engineering_project_disciplines_updated_at
  BEFORE UPDATE ON engineering_project_disciplines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE engineering_project_disciplines IS
  'Workspace/project selection of canonical disciplines and optional lead assignment. Lead is not design-approval authority.';

CREATE TABLE IF NOT EXISTS engineering_object_discipline_participants (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id     UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  object_kind      TEXT NOT NULL CHECK (object_kind IN (
    'PROJECT', 'SYSTEM', 'ASSET', 'INTERFACE', 'REQUIREMENT', 'ASSUMPTION',
    'DECISION', 'CHANGE', 'IMPACT', 'REVIEW_PACKAGE', 'OPTIMIZATION_STUDY', 'DOCUMENT'
  )),
  object_id        UUID NOT NULL,
  discipline_code  TEXT NOT NULL,
  role             TEXT NOT NULL CHECK (role IN (
    'LEAD', 'CONTRIBUTING', 'REVIEWING', 'CONSULTED', 'INFORMED', 'SOURCE', 'RECEIVING'
  )),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (object_kind, object_id, discipline_code, role)
);

CREATE INDEX IF NOT EXISTS idx_eng_object_disc_ws
  ON engineering_object_discipline_participants (tenant_id, workspace_id, object_kind, object_id);

COMMENT ON TABLE engineering_object_discipline_participants IS
  'Many-to-many discipline participation for Systems, Interfaces, Review, Optimization, Change/Impact. Not a graph store.';

CREATE TABLE IF NOT EXISTS engineering_interface_information_requirements (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  interface_id              UUID NOT NULL REFERENCES engineering_interfaces(id) ON DELETE CASCADE,
  source_discipline_code    TEXT NOT NULL,
  receiving_discipline_code TEXT NOT NULL,
  information_key           TEXT NOT NULL,
  description               TEXT,
  status                    TEXT NOT NULL DEFAULT 'REQUIRED' CHECK (status IN (
    'REQUIRED', 'REQUESTED', 'PROVIDED', 'ACCEPTED', 'REJECTED', 'SUPERSEDED', 'INCOMPLETE'
  )),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (interface_id, source_discipline_code, receiving_discipline_code, information_key)
);

CREATE INDEX IF NOT EXISTS idx_eng_iface_info_req_ws
  ON engineering_interface_information_requirements (tenant_id, workspace_id, interface_id);

CREATE TRIGGER engineering_interface_information_requirements_updated_at
  BEFORE UPDATE ON engineering_interface_information_requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE engineering_interface_information_requirements IS
  'What one discipline requires from another at an Interface. Distinct from Interface lifecycle status. No copyrighted standard text.';

ALTER TABLE engineering_discipline_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_discipline_tool_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_project_disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_object_discipline_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_interface_information_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY eng_disc_profiles_select ON engineering_discipline_profiles
  FOR SELECT USING (tenant_id = ANY (get_user_tenant_ids()));

CREATE POLICY eng_disc_profiles_insert ON engineering_discipline_profiles
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY eng_disc_profiles_update ON engineering_discipline_profiles
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY eng_disc_profiles_delete ON engineering_discipline_profiles
  FOR DELETE USING (has_permission('engineering', 'admin', tenant_id));

CREATE POLICY eng_disc_tool_bind_select ON engineering_discipline_tool_bindings
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND (
      workspace_id IS NULL
      OR has_permission('engineering', 'admin', tenant_id)
      OR engineering_core_workspace_member(workspace_id)
    )
  );

CREATE POLICY eng_disc_tool_bind_insert ON engineering_discipline_tool_bindings
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY eng_disc_tool_bind_update ON engineering_discipline_tool_bindings
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY eng_disc_tool_bind_delete ON engineering_discipline_tool_bindings
  FOR DELETE USING (has_permission('engineering', 'admin', tenant_id));

CREATE POLICY eng_project_disc_select ON engineering_project_disciplines
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND (
      has_permission('engineering', 'admin', tenant_id)
      OR engineering_core_workspace_member(workspace_id)
    )
  );

CREATE POLICY eng_project_disc_insert ON engineering_project_disciplines
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY eng_project_disc_update ON engineering_project_disciplines
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY eng_project_disc_delete ON engineering_project_disciplines
  FOR DELETE USING (has_permission('engineering', 'admin', tenant_id));

CREATE POLICY eng_object_disc_select ON engineering_object_discipline_participants
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND (
      has_permission('engineering', 'admin', tenant_id)
      OR engineering_core_workspace_member(workspace_id)
    )
  );

CREATE POLICY eng_object_disc_insert ON engineering_object_discipline_participants
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY eng_object_disc_update ON engineering_object_discipline_participants
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY eng_object_disc_delete ON engineering_object_discipline_participants
  FOR DELETE USING (has_permission('engineering', 'admin', tenant_id));

CREATE POLICY eng_iface_info_select ON engineering_interface_information_requirements
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND (
      has_permission('engineering', 'admin', tenant_id)
      OR engineering_core_workspace_member(workspace_id)
    )
  );

CREATE POLICY eng_iface_info_insert ON engineering_interface_information_requirements
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY eng_iface_info_update ON engineering_interface_information_requirements
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
  );

CREATE POLICY eng_iface_info_delete ON engineering_interface_information_requirements
  FOR DELETE USING (has_permission('engineering', 'admin', tenant_id));

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_discipline_profiles TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_discipline_tool_bindings TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_project_disciplines TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_object_discipline_participants TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_interface_information_requirements TO anon, authenticated, service_role;
