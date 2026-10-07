# RTB Migration Release Governance

**Phase:** RTB-REL-1  
**Status:** CERTIFIED  
**Principle:** A file in `supabase/migrations` is not authorization to deploy it to production.

This exists because RTB-SEC-RLS-1B correctly refused to apply staging-certified SQL that referenced Security Assurance tables production does not have. RTB-SEC-RLS-1C then backported the **security invariants** without deploying that product schema. Staging/production catalog drift is legitimate. Ungoverned promotion is not.

## Environment model

| Environment | Project ref | Role |
| --- | --- | --- |
| Staging | `rntonzigxwxcjlcsadip` | Validate future capability |
| Production | `wcydlhqiqdwgoaqrlget` (Engineering OS) | Run explicitly approved capability |
| Inspection Intelligence | `hlqwihvksjgkshipoacd` | Out of scope |
| RTB-Intranet-Production | `vspyrlgvkpcsprzvrorb` | Out of scope |

Do not infer production identity from staging. Do not `supabase db push` the full repository history onto production.

## Migration states

| State | Meaning |
| --- | --- |
| DEVELOPMENT | SQL in git; not on staging or production ledgers |
| STAGING_ONLY | Must not be promoted as-is (product schema that production must not receive by accident) |
| STAGING_VALIDATED | Applied on staging; expected feature drift; not production-approved |
| RELEASE_CANDIDATE | Eligible for an approval review |
| PRODUCTION_APPROVED | Explicitly approved; dependencies satisfied |
| PRODUCTION_APPLIED | Present on the production ledger |
| SUPERSEDED | Replaced by a certified backport or later control |
| BLOCKED | Must not be proposed (unknown SQL, unsafe, or ledger-only) |

**Staging drift is not automatically an error.** Staging-only and staging-validated features are expected. **UNKNOWN_DRIFT is an error** requiring investigation; those IDs are BLOCKED until SQL is recovered or the ledger row is explained.

## Promotion workflow

1. Author SQL under `supabase/migrations/` using `docs/release/MIGRATION_HEADER.template.sql`.
2. Apply to **staging** with the existing hosted apply path. State becomes STAGING_VALIDATED (default) or STAGING_ONLY (manifest override).
3. To release: add a manifest override `PRODUCTION_APPROVED` only if the production promotion guard passes.
4. Apply **that migration only** to production (`wcydlhqiqdwgoaqrlget`). Do not replay neighbors.
5. Refresh ledger snapshots in `docs/release/migration-manifest.json` after a real apply.

## Dependency rules

A migration cannot become PRODUCTION_APPROVED if a required dependency is STAGING_ONLY, BLOCKED, UNKNOWN, or not production-compatible, **unless** a certified backport records that it satisfies the control.

### Security backport model (RLS-1C)

```
20261007120000 RLS-1 (staging)
20261007140000 RLS-1A (staging)
        │
        X requires Security Assurance tables (STAGING_ONLY)
        │
        ▼
20261007160000 RLS-1C production security backport (PRODUCTION_APPLIED)
```

Production received the certified RLS invariants through RLS-1C. Missing Security Assurance **features** are not missing **security controls**.

## Drift interpretation

| Class | Treatment |
| --- | --- |
| EXPECTED_FEATURE_DRIFT | Informational. Do not bulk-sync. |
| SECURITY_BACKPORT | Production control without staging schema replay. |
| RELEASE_CANDIDATE_NOT_PROMOTED | Waiting for explicit approval. |
| SUPERSEDED | Promote the backport, not the original. |
| UNKNOWN_DRIFT | Block. Investigate. |
| MISSING_DEPENDENCY | Block approval. |

Command (read-only, never synchronizes):

```
pnpm --filter @rtb/release-governance report
pnpm --filter @rtb/release-governance guard --proposed 20261007160000 --project-ref wcydlhqiqdwgoaqrlget
```

## Production guard

`evaluateProductionPromotion` fails when:

- project ref is not Engineering OS production
- proposal includes STAGING_ONLY, BLOCKED, SUPERSEDED, or unknown IDs
- migration is not PRODUCTION_APPROVED / PRODUCTION_APPLIED
- dependencies are unsatisfied
- the proposal is empty

It does not connect to the database and does not apply SQL.

## Emergency security remediation

If production has an authorization defect and the staging migration is incompatible:

1. Do **not** bulk-push staging.
2. Do **not** create missing product tables merely to reuse staging SQL.
3. Author a production-schema backport (as RLS-1C did).
4. Record `backports` + SUPERSEDED on the staging files.
5. Apply only the backport after the guard passes.

## Rollback / recovery

Use the existing provider backup/PITR runbook (`docs/security/RTB_PLATFORM_BACKUP_RESTORE_RUNBOOK.md`). Governance tooling does not roll back databases. Restore remains an operator decision on an isolated target.

## Canonical files

| File | Role |
| --- | --- |
| `docs/release/migration-manifest.json` | Ledgers, environments, overrides |
| `packages/release-governance` | Classifier, graph, guard, report, tests |
| `docs/release/MIGRATION_HEADER.template.sql` | Lightweight authoring hints |
