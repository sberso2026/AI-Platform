-- EOS-A9D: Deliverable governance, document status semantics, revision-aware bindings.
-- Additive after 20260930110000_eos_a9c_deliverable_maturity.sql.
-- Templates remain non-authoritative until project adoption.
-- Document status mapping is project/workspace governed. IFR/IFA/IFC are not hard-coded.

ALTER TABLE engineering_deliverable_expectations
  ADD COLUMN IF NOT EXISTS adopted_from_template BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE engineering_deliverable_artifact_bindings
  ADD COLUMN IF NOT EXISTS revision_policy TEXT CHECK (
    revision_policy IS NULL OR revision_policy IN (
      'EXACT_REVISION', 'CURRENT_EFFECTIVE_REVISION', 'BASELINE_PINNED_REVISION'
    )
  );

ALTER TABLE engineering_deliverable_artifact_bindings
  ADD COLUMN IF NOT EXISTS resolved_revision TEXT;

ALTER TABLE engineering_deliverable_artifact_bindings
  ADD COLUMN IF NOT EXISTS raw_status_code TEXT;

ALTER TABLE engineering_deliverable_artifact_bindings
  ADD COLUMN IF NOT EXISTS mapped_semantic TEXT CHECK (
    mapped_semantic IS NULL OR mapped_semantic IN (
      'WORK_IN_PROGRESS', 'FOR_COORDINATION', 'FOR_REVIEW', 'FOR_APPROVAL',
      'AUTHORIZED_FOR_CONFIGURED_USE', 'FOR_CONSTRUCTION_USE', 'RECORD',
      'SUPERSEDED', 'VOID', 'UNMAPPED'
    )
  );

ALTER TABLE engineering_deliverable_artifact_bindings
  ADD COLUMN IF NOT EXISTS mapping_version TEXT;

ALTER TABLE engineering_deliverable_artifact_bindings
  ADD COLUMN IF NOT EXISTS baseline_id TEXT;

COMMENT ON COLUMN engineering_deliverable_expectations.adopted_from_template IS
  'EOS-A9D: true when an EXAMPLE/TEMPLATE catalog item was adopted into this project. Catalog rows are not requirements by existence.';

CREATE TABLE IF NOT EXISTS engineering_project_deliverable_definitions (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id               UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                 TEXT NOT NULL,
  definition_id              TEXT NOT NULL,
  definition_version         TEXT NOT NULL,
  code                       TEXT NOT NULL,
  name                       TEXT NOT NULL,
  purpose                    TEXT NOT NULL DEFAULT '',
  origin                     TEXT NOT NULL DEFAULT 'PROJECT_CONFIGURED' CHECK (origin = 'PROJECT_CONFIGURED'),
  artifact_classes           JSONB NOT NULL DEFAULT '["document"]'::jsonb,
  responsible_discipline     TEXT NOT NULL,
  contributing_disciplines   JSONB NOT NULL DEFAULT '[]'::jsonb,
  lifecycle_stages           JSONB NOT NULL DEFAULT '[]'::jsonb,
  multidisciplinary          BOOLEAN NOT NULL DEFAULT FALSE,
  required_roles             JSONB NOT NULL DEFAULT '["PRIMARY"]'::jsonb,
  coordination_required      BOOLEAN NOT NULL DEFAULT FALSE,
  analysis_required          BOOLEAN NOT NULL DEFAULT FALSE,
  review_required            BOOLEAN NOT NULL DEFAULT FALSE,
  traceability_required      BOOLEAN NOT NULL DEFAULT FALSE,
  configuration_required     BOOLEAN NOT NULL DEFAULT FALSE,
  rationale                  TEXT,
  created_by                 TEXT,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, project_id, definition_id, definition_version)
);

CREATE INDEX IF NOT EXISTS idx_eng_project_deliverable_definitions_ws
  ON engineering_project_deliverable_definitions (tenant_id, workspace_id, project_id);

DROP TRIGGER IF EXISTS engineering_project_deliverable_definitions_updated_at ON engineering_project_deliverable_definitions;
CREATE TRIGGER engineering_project_deliverable_definitions_updated_at
  BEFORE UPDATE ON engineering_project_deliverable_definitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS engineering_project_deliverable_definitions_workspace_tenant ON engineering_project_deliverable_definitions;
CREATE TRIGGER engineering_project_deliverable_definitions_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_project_deliverable_definitions
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_project_deliverable_definitions IS
  'EOS-A9D project-scoped deliverable definitions. Must not mutate the global EXAMPLE/TEMPLATE catalog.';

CREATE TABLE IF NOT EXISTS engineering_document_status_mappings (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id       UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id         TEXT,
  source_system      TEXT NOT NULL DEFAULT 'project',
  raw_status_code    TEXT NOT NULL,
  semantic           TEXT NOT NULL CHECK (semantic IN (
    'WORK_IN_PROGRESS', 'FOR_COORDINATION', 'FOR_REVIEW', 'FOR_APPROVAL',
    'AUTHORIZED_FOR_CONFIGURED_USE', 'FOR_CONSTRUCTION_USE', 'RECORD',
    'SUPERSEDED', 'VOID'
  )),
  mapping_version    TEXT NOT NULL,
  enabled            BOOLEAN NOT NULL DEFAULT TRUE,
  description        TEXT,
  configured_by      TEXT,
  configured_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_eng_document_status_mappings
  ON engineering_document_status_mappings (
    tenant_id, workspace_id, COALESCE(project_id, ''), source_system, raw_status_code, mapping_version
  );

CREATE INDEX IF NOT EXISTS idx_eng_document_status_mappings_ws
  ON engineering_document_status_mappings (tenant_id, workspace_id, raw_status_code);

DROP TRIGGER IF EXISTS engineering_document_status_mappings_updated_at ON engineering_document_status_mappings;
CREATE TRIGGER engineering_document_status_mappings_updated_at
  BEFORE UPDATE ON engineering_document_status_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS engineering_document_status_mappings_workspace_tenant ON engineering_document_status_mappings;
CREATE TRIGGER engineering_document_status_mappings_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_document_status_mappings
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

COMMENT ON TABLE engineering_document_status_mappings IS
  'EOS-A9D governed mapping from source-system document status codes to EOS purpose semantics. IFR/IFA/IFC are never universal. Mapped status is contributing evidence, not approval.';

CREATE OR REPLACE FUNCTION engineering_deliverable_document_same_workspace()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  found_id UUID;
BEGIN
  IF NEW.artifact_class <> 'document' THEN
    RETURN NEW;
  END IF;
  IF NEW.artifact_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
    SELECT d.id INTO found_id
    FROM engineering_documents d
    WHERE d.id = NEW.artifact_id::uuid
      AND d.tenant_id = NEW.tenant_id
      AND d.workspace_id = NEW.workspace_id
    LIMIT 1;
    IF found_id IS NULL THEN
      RAISE EXCEPTION 'artifact_not_found';
    END IF;
    RETURN NEW;
  END IF;
  SELECT d.id INTO found_id
  FROM engineering_documents d
  WHERE d.tenant_id = NEW.tenant_id
    AND d.workspace_id = NEW.workspace_id
    AND d.document_number = NEW.artifact_id
  LIMIT 1;
  IF found_id IS NULL THEN
    RAISE EXCEPTION 'artifact_not_found';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS engineering_deliverable_bindings_document_scope ON engineering_deliverable_artifact_bindings;
CREATE TRIGGER engineering_deliverable_bindings_document_scope
  BEFORE INSERT OR UPDATE ON engineering_deliverable_artifact_bindings
  FOR EACH ROW EXECUTE FUNCTION engineering_deliverable_document_same_workspace();

ALTER TABLE engineering_project_deliverable_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_document_status_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eng_project_deliverable_definitions_select ON engineering_project_deliverable_definitions;
DROP POLICY IF EXISTS eng_project_deliverable_definitions_insert ON engineering_project_deliverable_definitions;
DROP POLICY IF EXISTS eng_project_deliverable_definitions_update ON engineering_project_deliverable_definitions;
DROP POLICY IF EXISTS eng_project_deliverable_definitions_delete ON engineering_project_deliverable_definitions;

CREATE POLICY eng_project_deliverable_definitions_select ON engineering_project_deliverable_definitions
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_project_deliverable_definitions_insert ON engineering_project_deliverable_definitions
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_project_deliverable_definitions_update ON engineering_project_deliverable_definitions
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_project_deliverable_definitions_delete ON engineering_project_deliverable_definitions
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eng_document_status_mappings_select ON engineering_document_status_mappings;
DROP POLICY IF EXISTS eng_document_status_mappings_insert ON engineering_document_status_mappings;
DROP POLICY IF EXISTS eng_document_status_mappings_update ON engineering_document_status_mappings;
DROP POLICY IF EXISTS eng_document_status_mappings_delete ON engineering_document_status_mappings;

CREATE POLICY eng_document_status_mappings_select ON engineering_document_status_mappings
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_document_status_mappings_insert ON engineering_document_status_mappings
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_document_status_mappings_update ON engineering_document_status_mappings
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  ) WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_document_status_mappings_delete ON engineering_document_status_mappings
  FOR DELETE USING (
    has_permission('engineering', 'admin', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );
