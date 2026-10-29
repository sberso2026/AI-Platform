# EOS 3.0 / EOS 2 Compatibility and Migration Strategy

`EOS_2_TO_EOS_3_MIGRATION_STRATEGY_DEFINED=YES`

`EOS_2_AUTO_MIGRATION_TO_EOS_3=NO`

`EOS_3_DATABASE_EVOLUTION_STRATEGY_DEFINED=YES`

`EOS_3_VERSIONING_MODEL_DEFINED=YES`

`EOS_3_BRANCH_STRATEGY_DEFINED=YES`

`NO_AUTOMATIC_MIGRATION` is the default.

## Coexistence model

| Concern | Policy |
| --- | --- |
| EOS 2 maintenance | Continues under post-GA change governance |
| EOS 3 development | Separate program; does not bypass EOS 2 gates |
| EOS 2 customer compatibility | GA customers remain on EOS 2 until opt-in |
| EOS 3 access | Explicit entitlement + enrollment (inherited model) |
| Migration eligibility | Documented criteria; human-authorized |
| Migration tooling | Planned in later EOS 3.9; reversible where feasible |
| Data transformation | Versioned, audited, staged |
| Rollback | Required for migration waves |
| Coexistence period | Supported; indefinite until customer opt-in complete |
| Scope of migration | Prefer **project-level** opt-in; tenant-level only when explicitly chosen |

Silent upgrade of customers/projects is forbidden.

## Database evolution

Prefer **additive schema evolution** and bounded new schemas/services over aesthetic redesign. Separate service databases only when isolation/scale justifies. Compatibility and migration safety outrank greenfield purity.

## Versioning

- Architecture program: `EOS-3.0`, `EOS-3.1`, …
- Product semantic version target: `3.0.0` at EOS 3 GA (future)
- EOS 2 remains `2.0.0` GA baseline (`engineering-os-v2.0.0`)

## Branch strategy

- Architecture/docs (this phase): remain on current program branch.
- Implementation of breaking/runtime EOS 3 work: prefer dedicated `eos-3/*` feature branches with PR gates; do not create a long-lived diverged branch solely for documentation.
- EOS 2 hotfixes: EOS 2 maintenance classification on support-appropriate branches per repo practice.

No new long-lived branch was created in this architecture phase.
