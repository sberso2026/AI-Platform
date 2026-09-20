# Backup / recovery assessment (ERA-6)

**This is not a restore attestation.** Existence of backups is not proof of restore capability.

## Mechanism

RTB AI Platform Staging and production databases are hosted on Supabase (AWS). Point-in-time recovery and daily backups are provider-managed for the project. Review tables live in the same Postgres instance as platform/EOS tables.

## Retention

Provider default for the current plan. RTB has not independently recorded a Review-specific retention override in this phase.

## Restore process

1. Open the Supabase project for the intended environment (staging first).
2. Use provider PITR / backup restore to a new project or restore window per current Supabase dashboard/docs.
3. Re-run hosted Review + Core RLS tests against the restored project.
4. Do not restore over staging solely to satisfy ERA-6.

## RPO / RTO

| Environment | RPO (claimed) | RTO (claimed) | Evidence |
| --- | --- | --- | --- |
| Staging `rntonzigxwxcjlcsadip` | Provider PITR window (not independently measured here) | Not measured | DESIGNED |
| Production | Not authorized for ERA-6 restore exercise | Not measured | DESIGNED |

A controlled restore verification was **not** executed in ERA-6 because it would endanger or interrupt the staging database used for live RLS. Status remains DESIGNED until a scheduled restore drill is performed by an authorized operator.
