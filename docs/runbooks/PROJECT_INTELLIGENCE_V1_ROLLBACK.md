# Project Intelligence V1.0 — Rollback

1. Do not apply destructive reverse migrations in production.
2. Forward-repair preferred: patch release on `project_intelligence` 1.0.x.
3. If release must be withdrawn: redeploy prior certified commit; keep additive schema in place.
4. Tag `project-intelligence-v1.0.0` is immutable; use a new patch tag for repairs.
5. Capture incident notes: failing gate, artifact SHA, migration checksums.
6. Reference Phase 8I certification artifact for last known good identity.
