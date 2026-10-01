# EOS Disaster Recovery Runbook (staging / PROFILE A)

Target: STAGING `rntonzigxwxcjlcsadip` only. READY_FOR_PRODUCTION = NO. PITR is not claimed.

## Application restart

1. Stop the staging Next process on port 3002.
2. Start `scripts/review-staging.mjs` from current HEAD.
3. Confirm `/login` returns 200 and `/engineering/work` redirects rather than 500.
4. Work Plans, artifact metadata, Attention, reviews, and impact rows must come from Postgres, not process memory.

## Database restore

1. Record a provider backup/marker in the Supabase console before any destructive rehearsal.
2. Prefer an **isolated restore target**. Do not overwrite active staging in place unless an explicit operator procedure requires it.
3. Logical metadata restore (A14B rehearsal): export selected generated-artifact **metadata** (`id, storage_kind, object_key, byte_size, sha256, migration_state`), delete the disposable row, re-insert, confirm JWT/RLS still isolates workspace A2 and tenant B.
4. Never log `content_base64`, tokens, or file bodies.

## Storage reconciliation

1. Inventory object keys vs `engineering_generated_artifacts.object_key`.
2. Classify: metadata without object, object without metadata, incomplete `migration_state`, hash mismatch.
3. **Do not auto-delete orphans.**
4. Recreate missing objects from retained legacy `content_base64` only for named fixtures inside the rollback window.
5. After recovery, generate a **new** signed URL after EOS authorization. Expired links remain unusable.

## Job recovery

1. Pending JobService rows retry until `max_retries`.
2. Failed poison items must not block the checkpoint of successful items.
3. Replay EngineeringWorkEvent by `sourceEventId`; Attention fingerprints must not multiply.

## Migration recovery

Use `engineering_artifact_storage_migrations` to identify legacy source, object key, hash, size, and FAILED/ROLLED_BACK state. Pointer switch remains fail-closed.

## Validation checklist before return-to-service

- [ ] Application health 200 without secrets
- [ ] Representative Work Plan readable
- [ ] Artifact metadata + authorized download
- [ ] Cross-workspace JWT deny
- [ ] Kill switch still able to disable pilot (`EOS_CONTROLLED_PILOT_ENABLED=0`)
- [ ] Human approval to resume (named pilot operator / engineering admin)

Return-to-service is not automatic.
