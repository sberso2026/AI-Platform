-- Diagnostic only: hosted engineering_object_links shape. Not a migration.
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'engineering_object_links'
ORDER BY ordinal_position;

SELECT
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'engineering_object_links' AND column_name = 'workspace_id'
  ) AS has_workspace_id,
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'engineering_object_links' AND column_name = 'tenant_id'
  ) AS has_tenant_id,
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'engineering_object_links' AND column_name = 'project_id'
  ) AS has_project_id;
