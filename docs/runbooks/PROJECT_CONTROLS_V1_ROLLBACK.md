# Project Controls V1.0 — Rollback

## Principles

- Release tag `project-controls-v1.0.0` is **immutable, never move it**
- Roll back application code to the tagged commit; do not rewrite migrations 61–73
- No batch_74 — GA closure adds no new business schema

## Application rollback

1. Deploy application artifacts built from tag `project-controls-v1.0.0`
2. Confirm `PROJECT_CONTROLS_VERSION = "1.0.0"` and `PROJECT_CONTROLS_STATUS = "ga"`
3. Re-run Phase 11N certification artifact gate

## Module pin rollback

Pin the Engineering OS module registry and commerce packaging to `project-controls-v1.0.0`. Do not repoint the immutable release tag. When rolling back from a failed upgrade, restore `0.13.0-organizational-learning` baseline behaviour only via the immutable `project-controls-v1.0.0` tag

## Schema rollback

**Not supported** for batches 61–73 in production. Schema is additive-only through Phase 11M. If a bad deploy introduced drift, restore from backup per recovery runbook — do not drop PC tables in place.

## Post-rollback verification

- Health endpoint green
- `moduleRegistryDriftDetected === false`
- Forbidden locks false
