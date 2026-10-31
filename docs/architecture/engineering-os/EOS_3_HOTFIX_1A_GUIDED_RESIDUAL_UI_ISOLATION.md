# EOS-3-HOTFIX-1A — Guided Engineering Residual UI Isolation

Minimal corrective hotfix after manual **PILOT-011** validation. Preserves Hotfix-1 isolation behaviour.

## Fixes

1. Change input initializes empty (no 12 t → 15 t demo text); placeholder is generic.
2. Objective field no longer pre-fills PILOT-001 demo mass language.
3. Engineer-facing explanations never show internal `EOS_*` rule identifiers.
4. Unknown load data stays an Information Gap — no auto “Record as assumption” prompt.
5. Lifecycle Stat shows `Opportunity / Concept Definition`; canonical key `pilot-default-p0-g6` unchanged in backend.
6. Jurisdiction provenance distinguishes explicit geography vs KGP/context inference.
7. Standards proposals labeled as structural candidate standards only.

## Schema

`DATABASE_SCHEMA_CHANGED=NO` · `MIGRATION_COUNT_ADDED=0`
