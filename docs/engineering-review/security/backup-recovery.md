# Backup / recovery assessment (ERA-7)

**This is not a PITR attestation.** Existence of provider backups is not proof of point-in-time restore.

## Mechanism

RTB AI Platform Staging (`rntonzigxwxcjlcsadip`) is hosted on Supabase (AWS). Review tables live in the same Postgres instance as platform/EOS tables.

## ERA-7 drill actually executed

| Field | Evidence |
| --- | --- |
| Backup source | Logical export of a disposable `engineering_review_packages` row |
| Recovery procedure | Insert → SELECT snapshot → DELETE → re-INSERT same primary key |
| Test object | `engineering_review_packages` named `ERA-7 restore *` |
| Recovery result | Recorded by `live-restore.test.ts` / `scripts/restore-review-package.ts` when hosted credentials are present |
| Elapsed time | Measured in the test (`elapsed_ms`); must be < 30s for the logical drill |
| Observed RPO | Instant of the logical export (not provider WAL) |
| Observed RTO | Same wall-clock as elapsed_ms for this object |
| PITR | **Not executed** — restoring the shared staging database would endanger live RLS evidence |

## Classification

| Environment | Strongest safe test | State |
| --- | --- | --- |
| Staging | Logical Review-row export/delete/reinsert | IMPLEMENTED when hosted tests run |
| Staging PITR to a new project | Not performed | DESIGNED |
| Production | Not authorized | DESIGNED |

Do not mark provider PITR **OPERATING** without a recorded restore window against a non-destructive target.
