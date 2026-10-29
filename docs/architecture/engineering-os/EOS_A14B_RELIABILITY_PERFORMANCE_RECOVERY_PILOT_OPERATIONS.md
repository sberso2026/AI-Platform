# EOS-A14B Reliability, Performance, Recovery & Pilot Operations

Target: STAGING / NON-PRODUCTION  
Supabase project: `rntonzigxwxcjlcsadip`  
A14A baseline: `9fe3d24b523260cf9d04e4202f959d14020ee45e`  
Feature freeze: HARDEN only.

## A14A carry-forward blockers (rechecked, not waived)

| Blocker | A14B recheck |
|---|---|
| HUMAN_AAL2_GATE | BLOCKED — operator TOTP not completed; not requested or injected |
| Authenticated / multi-project / lifecycle browser HITL | NOT_TESTED — blocked on AAL2 |
| HOSTED_MALWARE_SCANNER | BLOCKED — `RTB_REVIEW_CLAMAV_URL` unset; unit fail-closed is not hosted certification |
| RETURNED_ARTIFACT_PILOT | BLOCKED |
| DEPENDENCY_POLICY_GATE | BLOCKED — raw audit rerun; exceptions expired 2026-09-30 and not auto-renewed |

CONTROLLED_PILOT_READY remains **NO**. A15A, if run, is DEMONSTRATION_ONLY.

## Reliability model

Question answered: if EOS hits load, crash, restart, partial failure, network failure, database restore, or object-storage recovery in a controlled pilot, can it recover without silently corrupting engineering state?

Failure classes: TRANSIENT_NETWORK, DATABASE_UNAVAILABLE, OBJECT_STORAGE_UNAVAILABLE, MALWARE_SCANNER_UNAVAILABLE, JOB_FAILURE, EVENT_HANDLER_FAILURE, EXTERNAL_CONNECTOR_FAILURE, VALIDATION_FAILURE, AUTHORIZATION_FAILURE, DEPENDENCY_FAILURE, APPLICATION_CRASH.

Retries: transient/job/event/connector/storage/database only. Never retry authorization denial, validation failure, infected/unavailable malware, template conflict, or engineering policy denial.

Timeouts (pilot): object storage 15s, malware 8s, database 10s, connectors 12s, Office validation 8s, signed URL 300s.

## Idempotency

Idempotent: Work Plan by input fingerprint, artifact generation request, binary migration, work-event `sourceEventId` (ingest and EOS `recordMaterialEvent`), Attention fingerprint, Pre-Issue historical rerun, job retry.

Intentionally non-idempotent: human impact confirmation, human Decision, returned artifact new version.

## Database backup / restore

Provider: Supabase staging `rntonzigxwxcjlcsadip`. PITR is **not claimed**. Logical restore rehearsal: disposable generated-artifact metadata export/delete/restore against the live staging database without selecting `content_base64`. Isolated full-cluster restore was not performed; do not treat this as production DR.

## Object-storage recovery

Bucket `engineering-artifacts` is private. Provider durability ≠ EOS artifact versioning. Consistency states: CONSISTENT, OBJECT_MISSING, METADATA_MISSING, HASH_MISMATCH, SIZE_MISMATCH. Orphans are reported, never auto-deleted. Legacy `content_base64` remains the rollback window. Recovered downloads require fresh authorization; expired signed URLs stay expired.

## Job / event / restart

Existing JobService retries pending jobs up to `max_retries`, then fails. Poison items are bounded (connector-core `poisonIsBounded` / A14B `simulateJobAttempt`). Partial batches checkpoint only after bounded poison. Process restart persistence is Postgres metadata + object storage, not in-memory stores.

## Performance (pilot, not enterprise)

Concurrency target: 2 named users, documented small-team 5. Thresholds: interactive p95 3s, work plan 5s, generation 20s, download 5s, review 15s, impact 8s, Attention 3s. Soak is a bounded repeated list/generate window, not a 24-hour claim.

## Observability / incident / operations

Health components: application, database, object storage, malware scanner, jobs, events; optional PROFILE A connectors are NOT_APPLICABLE and must not fail the pilot. `/api/health` must not include secrets or file bodies. Alerts are system-health only. Stop conditions include cross-tenant exposure, malware ingestion, integrity failure, AAL2 bypass, unapproved automation. Kill switch: `EOS_CONTROLLED_PILOT_ENABLED=0` and/or commerce installation suspend; data preserved.

## CONTROLLED_PILOT_READY

NO. Shortest blockers: AAL2 not completed; hosted malware unavailable; dependency policy failed; browser HITL not tested.
