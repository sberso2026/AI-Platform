# EOS 3.1 Version and Compatibility Contract

`EOS_3_VERSION_IDENTITY_IMPLEMENTED=YES`

`EOS_2_EOS_3_COEXISTENCE_CONTRACT_IMPLEMENTED=YES`

`PROJECT_GENERATION_COMPATIBILITY_MODEL_IMPLEMENTED=YES`

`LEGACY_PROJECT_DEFAULT_BEHAVIOR_PRESERVED=YES`

`EOS_2_AUTO_MIGRATION_TO_EOS_3=NO`

`EOS_3_API_VERSION_FOUNDATION_IMPLEMENTED=YES`

`EOS_2_API_BACKWARD_COMPATIBILITY=PASS`

## Canonical identity

| Field | Value |
| --- | --- |
| Product key | `eos-3` |
| Version | `3.0.0-development` |
| Release status | `DEVELOPMENT` |
| Generation | `3` |

Generation is resolved from project/runtime metadata (`eos_generation` / `eos3.state`), not from UI route names alone.

## Coexistence rules

1. EOS 2 projects remain EOS 2 unless explicitly migrated.
2. EOS 3 projects are identifiable via generation metadata.
3. EOS 2 UI/runtime continues to read EOS 2 data under EOS 2 contracts.
4. EOS 3 code must not silently reinterpret EOS 2 project semantics.
5. Shared canonical services remain backward compatible; version-specific behavior is explicit via API/version context.
6. Auto-migration is forbidden (`eos2AutoMigrationToEos3() === false`).

## Legacy default

Projects with no EOS 3 generation metadata resolve to `eos2_compatible`.

## API version context

- Unspecified consumer ⇒ EOS 2 context (`2.0.0` / `GENERAL_AVAILABILITY`).
- Explicit generation `3` / `eos-3` ⇒ EOS 3 development context.
- Tenant/workspace context, authorization, and audit linkage remain required for writes; EOS 2 contracts stay stable.
