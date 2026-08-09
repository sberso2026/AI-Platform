# Platform Backup / Restore Runbook (Phase 14D · S06)

Status: CLOSED · `PlatformBackupRestoreProcedureReady=true` · `PlatformRestoreTestPassed=true`

## Scope

- Database (Supabase provider backups)
- Platform Files / object storage (provider)
- Critical configuration / migration lineage
- Module state required for recovery (fingerprints)

## Procedure

1. Select backup (`backupId`) from provider console
2. Restore to **isolated** target (never overwrite production in-place for test)
3. Verify migration lineage anchor
4. Verify tenant/workspace boundaries on sample rows
5. Verify critical application state readable
6. Record measured restore duration (fixture or isolated target)
7. Record RPO/RTO status truthfully

## RPO / RTO status (truthful)

| Metric | Status | Notes |
| --- | --- | --- |
| RPO | `DEFINED_NOT_TESTED` | Follows provider backup schedule; not an RTB SLA |
| RTO | `MEASURED` | Fixture/isolated restore duration recorded; **not** enterprise SLA |

Allowed statuses: DEFINED_AND_TESTED · DEFINED_NOT_TESTED · MEASURED · NOT_DEFINED · NOT_APPLICABLE

## Certification evidence

- Module: `packages/engineering-os/src/security-closure/backup-restore.ts`
- Fixture runner: `packages/engineering-os-certification/scripts/run-platform-restore-certification.ts`
- Artifact: `artifacts/platform-restore-certification.json`
