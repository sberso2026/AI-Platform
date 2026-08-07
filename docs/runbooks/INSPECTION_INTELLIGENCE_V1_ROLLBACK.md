# Inspection Intelligence V1 — Rollback

## Principles
- Restore prior **pins** (module/pack/contract/model/policy) without mutating governed inspection records.
- Prefer PATCH rollback (`1.0.1` → `1.0.0`) over destructive resets.
- Tag `inspection-intelligence-v1.0.0` is immutable; never move it.

## Module pin rollback
1. Deploy previous known-good build identity.
2. Confirm public contracts remain `1.0.0` compatible.
3. Re-run drift detection and health checks.

## Pack rollback
1. Restore prior pack version pin via hardened pack registry rollback API.
2. Reject major-incompatible packs.
3. Templates/measurements remain declarative; no executable pack code.

## Model / policy rollback
1. Pin `ii_vision_detector@1.0.0` / `vision_policy_v1` / `vision_provider_approved_v1`.
2. Fail closed on unknown versions; no silent provider fallback.

## Schema rollback
- Prefer forward fix; if required, restore from certified backup and re-apply forward migrations carefully.
- Re-verify immutable evidence hashes after restore.
