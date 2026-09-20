-- ERA-6 — Core engineering_projects / engineering_documents RLS hardening
-- Additive. Does not edit historical migrations. Does not destroy rows.
--
-- BEFORE: tenant-only SELECT/INSERT/UPDATE (20260203000001_batch_20_engineering_rls.sql)
-- AFTER:  tenant + workspace membership, fail-closed for NULL workspace_id
--
-- Affected tables:
--   engineering_projects
--   engineering_documents
--   engineering_document_versions (follows parent document visibility)
--
-- Consumers: Engineering OS, Project Intelligence, Engineering Review, TQ, E12.
-- Ownership model supports workspace_id (nullable FK). Rows with NULL workspace_id
-- remain stored and are visible only to service_role. User JWT cannot read them.
-- That is fail-closed isolation, not data deletion.
--
-- Does not weaken any existing policy.

CREATE OR REPLACE FUNCTION engineering_core_workspace_member(p_workspace_id UUID)
RETURNS BOOLEAN AS $$
  SELECT p_workspace_id IS NOT NULL AND EXISTS (
    SELECT 1
    FROM workspace_memberships
    WHERE user_id = auth.uid()
      AND workspace_id = p_workspace_id
  );
$$ LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION engineering_core_workspace_matches_tenant()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.workspace_id IS NULL THEN
    RAISE EXCEPTION 'engineering core workspace_id is required';
  END IF;
  IF NEW.workspace_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM workspaces w
    WHERE w.id = NEW.workspace_id AND w.tenant_id = NEW.tenant_id
  ) THEN
    RAISE EXCEPTION 'engineering core workspace does not belong to tenant';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION engineering_core_prevent_ownership_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id THEN
    RAISE EXCEPTION 'engineering core tenant_id is immutable';
  END IF;
  -- Legacy NULL workspace_id may be assigned once. Non-null workspace_id is immutable.
  IF OLD.workspace_id IS NOT NULL
     AND NEW.workspace_id IS DISTINCT FROM OLD.workspace_id THEN
    RAISE EXCEPTION 'engineering core workspace_id is immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS engineering_projects_workspace_tenant ON engineering_projects;
CREATE TRIGGER engineering_projects_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_projects
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_projects_ownership_immutable ON engineering_projects;
CREATE TRIGGER engineering_projects_ownership_immutable
  BEFORE UPDATE ON engineering_projects
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_ownership_mutation();

DROP TRIGGER IF EXISTS engineering_documents_workspace_tenant ON engineering_documents;
CREATE TRIGGER engineering_documents_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_documents
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_documents_ownership_immutable ON engineering_documents;
CREATE TRIGGER engineering_documents_ownership_immutable
  BEFORE UPDATE ON engineering_documents
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_ownership_mutation();

-- Replace tenant-only policies. DROP + CREATE in a new migration is the additive
-- replacement; historical files are unchanged.

DROP POLICY IF EXISTS eng_projects_select ON engineering_projects;
DROP POLICY IF EXISTS eng_projects_insert ON engineering_projects;
DROP POLICY IF EXISTS eng_projects_update ON engineering_projects;
DROP POLICY IF EXISTS eng_projects_delete ON engineering_projects;

CREATE POLICY eng_projects_select ON engineering_projects FOR SELECT USING (
  tenant_id = ANY(get_user_tenant_ids())
  AND engineering_core_workspace_member(workspace_id)
);

CREATE POLICY eng_projects_insert ON engineering_projects FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids())
  AND has_permission('engineering', 'execute', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);

CREATE POLICY eng_projects_update ON engineering_projects FOR UPDATE
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_projects_delete ON engineering_projects FOR DELETE USING (
  has_permission('engineering', 'admin', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);

DROP POLICY IF EXISTS eng_documents_select ON engineering_documents;
DROP POLICY IF EXISTS eng_documents_insert ON engineering_documents;
DROP POLICY IF EXISTS eng_documents_update ON engineering_documents;
DROP POLICY IF EXISTS eng_documents_delete ON engineering_documents;

CREATE POLICY eng_documents_select ON engineering_documents FOR SELECT USING (
  tenant_id = ANY(get_user_tenant_ids())
  AND engineering_core_workspace_member(workspace_id)
);

CREATE POLICY eng_documents_insert ON engineering_documents FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids())
  AND has_permission('engineering', 'execute', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);

CREATE POLICY eng_documents_update ON engineering_documents FOR UPDATE
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_documents_delete ON engineering_documents FOR DELETE USING (
  has_permission('engineering', 'admin', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);

DROP POLICY IF EXISTS eng_document_versions_select ON engineering_document_versions;
DROP POLICY IF EXISTS eng_document_versions_manage ON engineering_document_versions;

CREATE POLICY eng_document_versions_select ON engineering_document_versions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM engineering_documents d
    WHERE d.id = document_id
      AND d.tenant_id = ANY(get_user_tenant_ids())
      AND engineering_core_workspace_member(d.workspace_id)
  )
);

CREATE POLICY eng_document_versions_manage ON engineering_document_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM engineering_documents d
      WHERE d.id = document_id
        AND d.tenant_id = ANY(get_user_tenant_ids())
        AND has_permission('engineering', 'execute', d.tenant_id)
        AND engineering_core_workspace_member(d.workspace_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM engineering_documents d
      WHERE d.id = document_id
        AND d.tenant_id = ANY(get_user_tenant_ids())
        AND has_permission('engineering', 'execute', d.tenant_id)
        AND engineering_core_workspace_member(d.workspace_id)
    )
  );

COMMENT ON FUNCTION engineering_core_workspace_member(UUID) IS
  'ERA-6 Core RLS: user JWT may access a project/document only with workspace membership. NULL workspace_id is fail-closed.';
