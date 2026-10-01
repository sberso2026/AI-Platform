# EOS Artifact Binary Storage Migration Runbook

Staging migration checksum (applied in A13C live RLS): `f2320fc2936d0f392d8a01a7554013f2d512a0ea78bff51d55eea62efe3e4193` for `supabase/migrations/20261001200000_eos_a13c_platform_consolidation_binary_storage.sql`.


Target environment: STAGING / NON-PRODUCTION  
Supabase project: `rntonzigxwxcjlcsadip`  
Object-storage backend: `CONTRACT_ONLY` (in-memory fixture in A13C; no approved generated-artifact object store)

## Preconditions

1. FEATURE_FREEZE remains intact. This runbook does not add engineering product domains.
2. Additive migration `20261001200000_eos_a13c_platform_consolidation_binary_storage.sql` is applied.
3. `engineering_generated_artifacts.content_base64` still exists and remains the live compatibility store.
4. `storage_kind` is explicit. Do not infer storage from a null `content_base64`.
5. Hosted ClamAV remains unavailable; do not introduce user-upload template binaries as part of this migration.
6. Operator has AAL2 for any administrative migration action that is later exposed.
7. Backup/recovery of staging Postgres is available before any later A14 pointer switch on real data.
8. Do not migrate arbitrary existing staging artifacts unless a named fixture is approved.

## Inventory

Identify legacy artifacts:

```sql
SELECT id, tenant_id, workspace_id, project_id, file_name, byte_size, sha256,
       storage_kind, migration_state, content_size_bytes, content_sha256
FROM engineering_generated_artifacts
WHERE storage_kind = 'LEGACY_RELATIONAL'
  AND migration_state IN ('NOT_STARTED', 'FAILED');
```

Do not select or log `content_base64`.

## Backup

Take a staging Postgres backup / point-in-time recovery marker before any A14 pointer switch. Record the backup identifier in the migration ledger. A13C does not perform this step against production.

## Object write

For each inventoried artifact:

1. Load bytes through `LegacyRelationalArtifactBinaryStore` (`loadFromBase64` / `openRead`).
2. Confirm SHA-256 against `sha256` / `content_sha256`.
3. Confirm size against `byte_size` / `content_size_bytes`.
4. Allocate a server object key: `eos/artifacts/{tenant}/{workspace}/{project}/{artifact}/v{storage_version+1}`.
5. Set `migration_state = IN_PROGRESS` conceptually (do not switch `storage_kind` yet).
6. `put` bytes to the object-store adapter.

A13C rehearsal uses `MemoryObjectArtifactBinaryStore` only.

## Hash verification

After `put`:

1. `openRead` the stored object under the same tenant/workspace/project authorization.
2. Verify byte length.
3. Verify SHA-256.
4. HTTP/adapter success status alone is not sufficient.

Mismatch: leave `storage_kind = LEGACY_RELATIONAL`, set `migration_state = FAILED`, retain legacy bytes, record failure. Do not switch the pointer.

## Metadata switch

Only after verification:

- `storage_kind = OBJECT_STORAGE`
- `object_key` = verified key
- `content_size_bytes` / `content_sha256` / `content_type` / `storage_version` updated
- `migration_state = VERIFIED`
- `content_base64` **retained** during the rollback window

## Read verification

`EngineeringArtifactAutomationService.openBinary` must return the same SHA-256 and size. Download authorization remains EOS tenant/workspace/project policy. Cross-project object keys must deny even if the key is known.

## Rollback

Until legacy bytes are explicitly purged in a later controlled phase:

1. Restore `storage_kind = LEGACY_RELATIONAL`.
2. Restore `object_key` / `storage_version` to the legacy pointer.
3. Set `migration_state = ROLLED_BACK`.
4. Serve reads from `content_base64` via the compatibility adapter.

Do not delete the object-store object during A13C; orphan objects are preferable to losing engineering provenance.

## Legacy retention

Temporary overlap is allowed. Permanent design must not write every artifact indefinitely to object storage **and** `content_base64`. After a defined rollback window in A14, a separate purge decision may null `content_base64` for `VERIFIED` rows only.

## Eventual purge conditions (future A14+, not A13C)

Purge may be considered only when all are true:

- object-store backend is `EXISTING_IMPLEMENTED` and certified
- pointer has been `VERIFIED` for the rollback window
- download/openBinary succeeded on a statistically sampled set
- backup/restore of both metadata and objects has been rehearsed
- an explicit human-governed purge change is approved

A13C implements **no** purge.

## Monitoring

Track counts by `storage_kind` and `migration_state`, failure reasons (`CONTENT_HASH_MISMATCH`, `CONTENT_SIZE_MISMATCH`, authorization denials), and duration. Never log secrets, access tokens, or raw file content.

## Failure recovery

- Crash before pointer switch: replay is safe; new version key avoids duplicate uncontrolled objects.
- Crash after object write but before verification: treat as `FAILED` or restart verification; do not switch.
- Partial inventory: restart from `NOT_STARTED` / `FAILED` rows only.

## Signed access (future)

If signed URLs are introduced later they must be short-lived (≤ 5 minutes), scoped to one object key, generated server-side, never stored permanently, and denied when expired, for the wrong object, or for a different project. Permanent links are prohibited. A13C does not require a public bucket.
