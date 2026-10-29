# EOS 3.1 Migration Foundation

`EOS_3_MIGRATION_FOUNDATION_IMPLEMENTED=YES`

`EOS_2_TO_EOS_3_MIGRATION_EXECUTED=NO`

`EOS_2_AUTO_MIGRATION_TO_EOS_3=NO`

## Scope

Scaffolding only. No projects migrated. No Production migration.

## Manifest scaffold capabilities

- migration eligibility (`unknown` | `eligible` | `ineligible`)
- source generation `2` → target generation `3`
- preflight required
- dry run required
- human authorization required
- executed = `false` always in this phase

Future phases may add migration eligibility records, restore points, evidence packages, and opt-in execution under EOS-3.9.

## Database evolution

Follows `EOS_3_DATABASE_EVOLUTION_STRATEGY_DEFINED=YES`:

- additive migration only;
- historical migrations untouched;
- EOS 2 runtime compatibility preserved;
- RLS + tenant/workspace ownership + audit on new tables;
- operationally reversible (drop tables / revoke grants) without rewriting EOS 2 history.
