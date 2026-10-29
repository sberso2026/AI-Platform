# EOS 3.9 Migration Eligibility and Authorization

## Eligibility engine

`evaluateMigrationEligibility` returns `ELIGIBLE`, `ELIGIBLE_WITH_LIMITATIONS`, or `NOT_ELIGIBLE` with deterministic reasons.

Minimum checks:

- project generation (must be EOS 2)
- workspace eligibility
- EOS 3 entitlement
- EOS 3 enrollment
- schema/data readiness
- unsupported object types
- qualification-sensitive content
- active workflows
- unresolved integrity issues
- migration policy version
- project size/limits where relevant

`MIGRATION_ELIGIBLE != MIGRATION_AUTHORIZED`.

## Authorization

Only a human actor with migration authority may approve. AI cannot authorize or execute migration (`AI_MIGRATION_AUTHORITY=NO`).

Unauthorized roles (viewer, engineer without migration authority) are denied. Eligibility alone never starts execution.

## Production guard

Production environment migration is denied regardless of eligibility or human role.
