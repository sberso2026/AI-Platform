-- EOS 1.0.0 controlled pilot: close authenticated storage writes.
-- File upload is outside this pilot. Anonymous and authenticated clients
-- cannot insert, update, or delete objects in tenant-documents or
-- engineering-documents. tenant-documents SELECT stays limited to the
-- caller's tenant folder. engineering-artifacts stays server-mediated.
-- Service role is unchanged and remains server-only.
-- This file does not replay earlier migrations.
-- Rollback procedure:
-- docs/architecture/engineering-os/EOS_1_0_0_PILOT_STORAGE_WRITE_CLOSE_ROLLBACK.md

INSERT INTO storage.buckets (id, name, public)
VALUES ('tenant-documents', 'tenant-documents', false)
ON CONFLICT (id) DO UPDATE
SET public = false;

INSERT INTO storage.buckets (id, name, public)
VALUES ('engineering-documents', 'engineering-documents', false)
ON CONFLICT (id) DO UPDATE
SET public = false;

DROP POLICY IF EXISTS tenant_documents_insert ON storage.objects;
DROP POLICY IF EXISTS tenant_documents_update ON storage.objects;
DROP POLICY IF EXISTS tenant_documents_delete ON storage.objects;

DROP POLICY IF EXISTS tenant_documents_insert_closed ON storage.objects;
CREATE POLICY tenant_documents_insert_closed ON storage.objects
  AS RESTRICTIVE
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id <> 'tenant-documents');

DROP POLICY IF EXISTS tenant_documents_update_closed ON storage.objects;
CREATE POLICY tenant_documents_update_closed ON storage.objects
  AS RESTRICTIVE
  FOR UPDATE
  TO anon, authenticated
  USING (bucket_id <> 'tenant-documents')
  WITH CHECK (bucket_id <> 'tenant-documents');

DROP POLICY IF EXISTS tenant_documents_delete_closed ON storage.objects;
CREATE POLICY tenant_documents_delete_closed ON storage.objects
  AS RESTRICTIVE
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id <> 'tenant-documents');

DROP POLICY IF EXISTS engineering_documents_insert_closed ON storage.objects;
CREATE POLICY engineering_documents_insert_closed ON storage.objects
  AS RESTRICTIVE
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id <> 'engineering-documents');

DROP POLICY IF EXISTS engineering_documents_update_closed ON storage.objects;
CREATE POLICY engineering_documents_update_closed ON storage.objects
  AS RESTRICTIVE
  FOR UPDATE
  TO anon, authenticated
  USING (bucket_id <> 'engineering-documents')
  WITH CHECK (bucket_id <> 'engineering-documents');

DROP POLICY IF EXISTS engineering_documents_delete_closed ON storage.objects;
CREATE POLICY engineering_documents_delete_closed ON storage.objects
  AS RESTRICTIVE
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id <> 'engineering-documents');

INSERT INTO supabase_migrations.schema_migrations (version, name)
SELECT '20261027233000', 'eos_pilot_storage_writes_closed'
WHERE NOT EXISTS (
  SELECT 1 FROM supabase_migrations.schema_migrations WHERE version = '20261027233000'
);
