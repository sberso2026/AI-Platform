-- EOS-A10C: Engineering Information Requirements, Exchange & Handover Intelligence.
-- Additive after 20260930140000_eos_a10b_engineering_work_context.sql.
-- Models required engineering information and handover packages as references.
-- Does not copy documents, create a second DMS, or infer engineering approval.

CREATE TABLE IF NOT EXISTS engineering_information_requirements (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                 UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                   TEXT NOT NULL,
  requirement_type             TEXT NOT NULL CHECK (requirement_type IN (
    'DESIGN_INPUT', 'INTERFACE_INPUT', 'VENDOR_DATA', 'SURVEY_DATA', 'GEOTECHNICAL_DATA',
    'LOAD_DATA', 'DESIGN_CRITERIA', 'MODEL_INPUT', 'ANALYSIS_INPUT',
    'CONSTRUCTION_INFORMATION', 'COMMISSIONING_INFORMATION', 'HANDOVER_INFORMATION'
  )),
  information_type             TEXT NOT NULL,
  purpose                      TEXT NOT NULL,
  title                        TEXT NOT NULL,
  why_required                 TEXT NOT NULL,
  provider_kind                TEXT NOT NULL,
  provider_discipline          TEXT,
  provider_org                 TEXT,
  provider_role                TEXT,
  consumer_kind                TEXT NOT NULL,
  consumer_discipline          TEXT,
  consumer_org                 TEXT,
  consumer_role                TEXT,
  system_id                    TEXT,
  asset_id                     TEXT,
  package_id                   TEXT,
  interface_id                 TEXT,
  deliverable_id               TEXT,
  lifecycle_stage              TEXT,
  needed_by                    TIMESTAMPTZ,
  required_for_object_type     TEXT,
  required_for_object_id       TEXT,
  work_type                    TEXT,
  acceptance_criteria_ref      TEXT,
  blocking                     BOOLEAN NOT NULL DEFAULT TRUE,
  require_authoritative        BOOLEAN NOT NULL DEFAULT TRUE,
  require_managed_source       BOOLEAN NOT NULL DEFAULT TRUE,
  status                       TEXT NOT NULL CHECK (status IN (
    'PLANNED', 'REQUESTED', 'AWAITING_INFORMATION', 'RECEIVED', 'UNDER_REVIEW',
    'ACCEPTED_FOR_PURPOSE', 'REJECTED', 'SUPERSEDED', 'NOT_APPLICABLE'
  )),
  construction_request_id      TEXT,
  created_by                   TEXT,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eng_information_requirements_ws
  ON engineering_information_requirements (tenant_id, workspace_id, project_id, work_type, status);

DROP TRIGGER IF EXISTS engineering_information_requirements_updated_at ON engineering_information_requirements;
CREATE TRIGGER engineering_information_requirements_updated_at
  BEFORE UPDATE ON engineering_information_requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS engineering_information_requirements_workspace_tenant ON engineering_information_requirements;
CREATE TRIGGER engineering_information_requirements_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_information_requirements
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_information_requirements IS
  'EOS-A10C required engineering information. Distinct from Engineering Requirements. ACCEPTED_FOR_PURPOSE is not engineering approval. Does not store source files.';

CREATE TABLE IF NOT EXISTS engineering_information_requirement_satisfactions (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                 UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  requirement_id               UUID NOT NULL REFERENCES engineering_information_requirements(id) ON DELETE CASCADE,
  information_ref_id           TEXT NOT NULL,
  managed_repository_id        UUID REFERENCES engineering_managed_repositories(id) ON DELETE SET NULL,
  unmanaged_rejected           BOOLEAN NOT NULL DEFAULT FALSE,
  accepted_for_purpose         BOOLEAN NOT NULL DEFAULT FALSE,
  rejected                     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eng_ir_satisfactions_ws
  ON engineering_information_requirement_satisfactions (tenant_id, workspace_id, requirement_id);

DROP TRIGGER IF EXISTS engineering_information_requirement_satisfactions_workspace_tenant ON engineering_information_requirement_satisfactions;
CREATE TRIGGER engineering_information_requirement_satisfactions_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_information_requirement_satisfactions
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_information_requirement_satisfactions IS
  'EOS-A10C satisfaction link from an information requirement to an A10A information ref. Unmanaged local files cannot silently satisfy. engineering_approved is never stored.';

CREATE TABLE IF NOT EXISTS engineering_handover_packages (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                 UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                   TEXT NOT NULL,
  display_name                 TEXT NOT NULL,
  system_id                    TEXT,
  asset_id                     TEXT,
  discipline                   TEXT,
  lifecycle_stage              TEXT,
  state                        TEXT NOT NULL CHECK (state IN (
    'DRAFT', 'ASSEMBLING', 'READY_FOR_REVIEW', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'SUPERSEDED'
  )),
  accepted_by                  TEXT,
  accepted_at                  TIMESTAMPTZ,
  created_by                   TEXT,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eng_handover_packages_ws
  ON engineering_handover_packages (tenant_id, workspace_id, project_id, state);

DROP TRIGGER IF EXISTS engineering_handover_packages_updated_at ON engineering_handover_packages;
CREATE TRIGGER engineering_handover_packages_updated_at
  BEFORE UPDATE ON engineering_handover_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS engineering_handover_packages_workspace_tenant ON engineering_handover_packages;
CREATE TRIGGER engineering_handover_packages_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_handover_packages
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_handover_packages IS
  'EOS-A10C governed handover package. References canonical information requirements; does not duplicate files. Human acceptance is required.';

CREATE TABLE IF NOT EXISTS engineering_handover_package_items (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id                   UUID NOT NULL REFERENCES engineering_handover_packages(id) ON DELETE CASCADE,
  requirement_id               UUID NOT NULL REFERENCES engineering_information_requirements(id) ON DELETE CASCADE,
  UNIQUE (package_id, requirement_id)
);

COMMENT ON TABLE engineering_handover_package_items IS
  'EOS-A10C handover package membership. Items are requirement references, not copied documents.';

ALTER TABLE engineering_information_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_information_requirement_satisfactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_handover_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_handover_package_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_information_requirements_select ON engineering_information_requirements;
DROP POLICY IF EXISTS eng_information_requirements_insert ON engineering_information_requirements;
DROP POLICY IF EXISTS eng_information_requirements_update ON engineering_information_requirements;
DROP POLICY IF EXISTS eng_information_requirements_delete ON engineering_information_requirements;

CREATE POLICY eng_information_requirements_select ON engineering_information_requirements
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_information_requirements_insert ON engineering_information_requirements
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_information_requirements_update ON engineering_information_requirements
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_information_requirements_delete ON engineering_information_requirements
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eng_ir_satisfactions_select ON engineering_information_requirement_satisfactions;
DROP POLICY IF EXISTS eng_ir_satisfactions_insert ON engineering_information_requirement_satisfactions;
DROP POLICY IF EXISTS eng_ir_satisfactions_update ON engineering_information_requirement_satisfactions;
DROP POLICY IF EXISTS eng_ir_satisfactions_delete ON engineering_information_requirement_satisfactions;

CREATE POLICY eng_ir_satisfactions_select ON engineering_information_requirement_satisfactions
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_ir_satisfactions_insert ON engineering_information_requirement_satisfactions
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_ir_satisfactions_update ON engineering_information_requirement_satisfactions
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_ir_satisfactions_delete ON engineering_information_requirement_satisfactions
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eng_handover_packages_select ON engineering_handover_packages;
DROP POLICY IF EXISTS eng_handover_packages_insert ON engineering_handover_packages;
DROP POLICY IF EXISTS eng_handover_packages_update ON engineering_handover_packages;
DROP POLICY IF EXISTS eng_handover_packages_delete ON engineering_handover_packages;

CREATE POLICY eng_handover_packages_select ON engineering_handover_packages
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_handover_packages_insert ON engineering_handover_packages
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_handover_packages_update ON engineering_handover_packages
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_handover_packages_delete ON engineering_handover_packages
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eng_handover_package_items_select ON engineering_handover_package_items;
DROP POLICY IF EXISTS eng_handover_package_items_insert ON engineering_handover_package_items;
DROP POLICY IF EXISTS eng_handover_package_items_update ON engineering_handover_package_items;
DROP POLICY IF EXISTS eng_handover_package_items_delete ON engineering_handover_package_items;

CREATE POLICY eng_handover_package_items_select ON engineering_handover_package_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM engineering_handover_packages p
      WHERE p.id = package_id
        AND p.tenant_id = ANY (get_user_tenant_ids())
        AND engineering_core_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY eng_handover_package_items_insert ON engineering_handover_package_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM engineering_handover_packages p
      WHERE p.id = package_id
        AND p.tenant_id = ANY (get_user_tenant_ids())
        AND engineering_core_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY eng_handover_package_items_update ON engineering_handover_package_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM engineering_handover_packages p
      WHERE p.id = package_id
        AND p.tenant_id = ANY (get_user_tenant_ids())
        AND engineering_core_workspace_member(p.workspace_id)
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM engineering_handover_packages p
      WHERE p.id = package_id
        AND p.tenant_id = ANY (get_user_tenant_ids())
        AND engineering_core_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY eng_handover_package_items_delete ON engineering_handover_package_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM engineering_handover_packages p
      WHERE p.id = package_id
        AND has_permission('engineering', 'admin', p.tenant_id)
        AND engineering_core_workspace_member(p.workspace_id)
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_information_requirements TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_information_requirement_satisfactions TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_handover_packages TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_handover_package_items TO anon, authenticated, service_role;
