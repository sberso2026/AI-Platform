# Asset Intelligence V1.0 — Rollback Runbook

- Module: `asset_intelligence` 1.0.0
- Release tag: `asset-intelligence-v1.0.0` — **immutable, never move it**
- Previous version: `0.10.0-predictive-governance` (Phase 10J baseline
  `94ba3eccd5b42d9afbc96962bbf7572470485746`)

## Principles

1. Roll back code, not data. Asset Intelligence state is versioned and
   append-only; published states are superseded, never overwritten.
2. Migrations are additive and are **not** rolled back. Batches 55–59 stay
   applied. A 1.0.0 → 0.10.0 code rollback runs against the same schema.
3. The release tag is immutable. A fix ships as a new tag, never as a moved tag.
4. Never roll back by relaxing a governance lock.

## Module pin rollback (code)

Use when a V1.0 build is defective but the schema and data are sound.

1. Identify the last certified commit. For a rollback out of 1.0.0 that is the
   Phase 10J baseline `94ba3ec` unless a later 1.0.x patch was certified.
2. Redeploy the web application and workers at that commit.
3. Confirm the deployed `ASSET_INTELLIGENCE_VERSION` matches the intended
   rollback target.
4. Re-run the certification for the phase that owns the rolled-back commit
   (`certify:phase10j` for the 10J baseline, `certify:phase10k` for a 1.0.x).
5. Announce the rollback with the commit SHA. Do not re-tag.

Expected behaviour after rolling back to 0.10.0: the module reports
`PRODUCTION_ASSET_INTELLIGENCE_READY = false` and the GA surfaces and marker
`asset-intelligence-v1-ready` are absent. All predictive locks stay `false` in
both directions — they are never touched by a rollback.

## Schema rollback

Not supported and not required. The V1.0 schema is a superset of the 0.10.0
schema. Rows written by 1.0.0 remain valid under 0.10.0 code because no 1.0.0
column changed the meaning of an existing 0.10.0 column.

If a migration itself is defective, ship a new additive migration (batch_60+)
that corrects it. Do not edit batches 55–59.

## Registry / manifest rollback

The manifest snapshot is generated, not authored. Rolling back code
automatically rolls back the registries and the manifest. If a manifest is found
to disagree with the deployed code, regenerate rather than hand-edit:

```bash
pnpm --filter @rtb/asset-intelligence-certification exec tsx scripts/generate-module-manifest.ts
```

## UI rollback

The Engineering OS module page is a server component with no client-persisted
state. Rolling back the application removes the page; there is nothing to clean
up. Entitlements are server-resolved and unaffected.

## Data correction without rollback

Preferred over any rollback when the defect produced a wrong published state:

1. Assess again through the normal governed path.
2. Submit, review, approve and publish. The prior state is superseded, and both
   versions remain in the intelligence timeline.
3. The timeline entry records who corrected what and when. This is an audit
   improvement over a rollback, which erases nothing but explains nothing.

## Post-rollback verification

- [ ] Deployed version matches the intended target
- [ ] Certification for the target phase returns PASS
- [ ] Migration lineage batch_55 → 59 still applied
- [ ] All predictive, PoF, RUL and health-contribution locks still `false`
- [ ] `asset-intelligence-v1.0.0` still points at its original commit
