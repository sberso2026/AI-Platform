-- Phase 6C-1: mapping identity immutability and search_path hardening evidence.
-- tenant_id and workspace_id must not move after insert (anti-IDOR / provenance).

CREATE OR REPLACE FUNCTION prevent_pi_mapping_identity_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.tenant_id IS DISTINCT FROM NEW.tenant_id
     OR OLD.workspace_id IS DISTINCT FROM NEW.workspace_id THEN
    RAISE EXCEPTION 'tenant_id and workspace_id are immutable on project_intelligence_project_mappings';
  END IF;
  IF OLD.engineering_project_id IS DISTINCT FROM NEW.engineering_project_id
     AND OLD.approved_at IS NOT NULL THEN
    RAISE EXCEPTION 'engineering_project_id is immutable after approval';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS project_intelligence_project_mappings_identity_immutable
  ON project_intelligence_project_mappings;

CREATE TRIGGER project_intelligence_project_mappings_identity_immutable
  BEFORE UPDATE ON project_intelligence_project_mappings
  FOR EACH ROW EXECUTE FUNCTION prevent_pi_mapping_identity_mutation();

COMMENT ON FUNCTION prevent_pi_mapping_identity_mutation()
  IS 'Blocks tenant/workspace reassignment and post-approval engineering_project_id changes.';
