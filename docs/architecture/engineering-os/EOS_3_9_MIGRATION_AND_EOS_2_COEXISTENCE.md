# EOS 3.9 Migration and EOS 2 Coexistence

## Purpose

Governed, opt-in, project-scoped migration from EOS 2.0 GA to EOS 3.0-development, with explicit generation coexistence. Production EOS 3 remains disabled.

## Core rules

- `EOS_2_PROJECT != EOS_3_PROJECT_UNTIL_EXPLICITLY_MIGRATED`
- `MIGRATION_ELIGIBLE != MIGRATION_AUTHORIZED`
- `MIGRATION_AUTHORIZED != MIGRATION_SUCCESSFUL`
- `MIGRATION_SUCCESSFUL != ENGINEERING_REQUALIFICATION`
- `NO_AUTOMATIC_MIGRATION`

## Preserved baselines

- EOS 2.0 GA baseline preserved; maintenance separated from EOS 3 development.
- EOS 2 external customer hold preserved.
- Production EOS 2 migration ledger remains `161`.
- EOS 3.1–3.8 baselines preserved (foundation through project-asset).

## Coexistence

A tenant/workspace may host EOS 2 projects, EOS 3 development projects, migration-eligible EOS 2 projects, and migrated EOS 3 staging targets. Generation is explicit via project metadata. Legacy absence of EOS 3 metadata resolves to EOS 2-compatible behavior.

## No automatic migration

Login, entitlement, enrollment, route open, bulk jobs, and EOS 3 UI open never migrate a project.

## Entitlement and enrollment

EOS 2 entitlement/enrollment do not grant EOS 3. EOS 3 remains generation-specific and explicit.

## Migration lifecycle

1. Eligibility (deterministic reasons)
2. Preflight
3. Immutable manifest
4. Human authorization (`AI_MIGRATION_AUTHORITY=NO`)
5. Execution (source immutable; target separate; staging only)
6. Verification + evidence fingerprint
7. Rollback (target only; source unchanged)

## Production

`EOS_3_PRODUCTION_ACTIVATION_PERFORMED=NO`. Migration engine refuses Production targets.

## Modules

- `apps/web/src/lib/engineering/eos3-migration-engine.ts`
- `apps/web/src/lib/engineering/eos3-coexistence.ts`
- `apps/web/src/lib/engineering/eos3-migration-staging.ts`
- `supabase/migrations/20261030100000_eos_3_9_migration_coexistence.sql`

## Next phase

`EOS-3.10-INTEGRATED-VALIDATION`
