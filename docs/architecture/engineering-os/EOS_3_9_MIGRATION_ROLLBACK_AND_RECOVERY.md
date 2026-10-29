# EOS 3.9 Migration Rollback and Recovery

## Source immutability

Migration never mutates EOS 2 source project records. Target EOS 3 state is written separately.

## State model

`DRAFT` → `PREFLIGHT` → `READY` → `AUTHORIZED` → `RUNNING` → `VERIFYING` → `COMPLETED` | `FAILED` | `ROLLED_BACK`

Partial failure must not mark the target as migrated/complete.

## Target activation

Successful staging migration does not activate Production EOS 3. Migration success ≠ rollout authorization.

## Verification

Post-migration verification covers object/relationship counts, revision chain, baselines, interfaces, decisions, assumptions, deliverables, authority, provenance, qualification, digital thread, and RLS.

## Rollback

Authorized human rollback removes/resets EOS 3 target migration state only. EOS 2 source fingerprint remains unchanged. Audit is retained; job state becomes `ROLLED_BACK`.

## Remigration

After rollback, a fresh authorized migration with a new job is deterministic and idempotent per migration ID.

## Failure / drift / duplicates

- Mid-migration injected failure: target not complete; source unchanged; failure audited.
- Source drift after preflight: blocked; re-preflight required.
- Duplicate execute of same migration ID: no duplicate target records.
