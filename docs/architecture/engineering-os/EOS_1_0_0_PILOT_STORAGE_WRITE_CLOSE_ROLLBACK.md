# EOS 1.0.0 pilot storage write-close rollback

Path: docs/architecture/engineering-os/EOS_1_0_0_PILOT_STORAGE_WRITE_CLOSE_ROLLBACK.md

This is not a migration. Do not place it in `supabase/migrations`. Run it only as a separate governed action if the controlled pilot must restore the previous authenticated `tenant-documents` write policies.

The policy change does not modify storage object bytes or application rows. Restoring the previous policies reopens authenticated writes for `tenant-documents`. That is why this rollback is not applied during the pilot.

Before running it, confirm the target project ref. Staging is `rntonzigxwxcjlcsadip`. Production is `wcydlhqiqdwgoaqrlget`. Do not run it against the wrong project.

```sql
DROP POLICY IF EXISTS tenant_documents_insert_closed ON storage.objects;
DROP POLICY IF EXISTS tenant_documents_update_closed ON storage.objects;
DROP POLICY IF EXISTS tenant_documents_delete_closed ON storage.objects;
DROP POLICY IF EXISTS engineering_documents_insert_closed ON storage.objects;
DROP POLICY IF EXISTS engineering_documents_update_closed ON storage.objects;
DROP POLICY IF EXISTS engineering_documents_delete_closed ON storage.objects;

CREATE POLICY tenant_documents_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'tenant-documents'
    AND ((storage.foldername(name))[1])::uuid = ANY (get_user_tenant_ids())
  );

CREATE POLICY tenant_documents_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'tenant-documents'
    AND ((storage.foldername(name))[1])::uuid = ANY (get_user_tenant_ids())
  )
  WITH CHECK (
    bucket_id = 'tenant-documents'
    AND ((storage.foldername(name))[1])::uuid = ANY (get_user_tenant_ids())
  );

CREATE POLICY tenant_documents_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'tenant-documents'
    AND ((storage.foldername(name))[1])::uuid = ANY (get_user_tenant_ids())
  );
```

`tenant_documents_select` is not changed by the close or by this rollback. `engineering_artifacts_restrict_clients` is not changed. Do not delete the ledger row `20261027233000` as part of this rollback. A later governed migration would record the restoration.
