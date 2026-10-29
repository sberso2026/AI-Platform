# EOS 2.18R Production Remediation Evidence

Production Supabase: `wcydlhqiqdwgoaqrlget`

Before the change: ledger 158, maximum `20261029120000`, mode `controlled_pilot`, enrolled 1, deployment `dpl_9UhYQdVBkiBA6mAd4ajBHRFndhYZ`.

Rollback target retained: `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB`.

The additive migration `20261029140000` was applied only after staging passed. Ledger became 159. Mode and enrollment were unchanged by the migration. The production deploy then used project `prj_3I9XPb2FHdWbnkAOSVo6a0EINjbY` from the clean runtime commit.

`PRODUCTION_REMEDIATION_DEPLOYMENT_ID=dpl_eXE8meiGGdYAvBQ6uKJMFRKbiMkC`

`PRODUCTION_REMEDIATION_SOURCE_COMMIT=031777b75403f6e3390c2aaff5cd909d4fe512e5`

`PRODUCTION_REMEDIATION_SOURCE_PROVENANCE_VERIFIED=YES`

Alias: `https://eos-pilot.rtbea.com.au`. Target production. Status Ready.

## Application workflow

The signed-in pilot engineer opened Engineering Basis. The new panel is labelled `CONTROLLED_PRODUCTION_PILOT_VALIDATION` and states that approval is not granted. Create basis returned `create_basis saved` and the panel showed basis revision 1. A premature create deliverable returned `discipline_required` and did not persist a deliverable.

The remaining writes used the same signed-in `POST /api/engineering/pilot-workflow` route. Every workflow action returned HTTP 200 and `ok=true`: revise basis, create structural object, revise it, create interface, revise interface, create deliverable, create change, record human materiality `NO_MATERIAL_IMPACT` for mechanical, revise the structural object again, and record freeze readiness.

A fresh navigation back to Engineering Basis, after leaving the page, read:

- Basis revision 3
- Structural revision 3
- Interface revision 2, status draft
- Change `pilot-validation-change`
- Deliverable revision 1, freshness `potentially_stale`, approval pending, release `not_released`
- Freeze frozen yes, approval pending, scope stating it is not a customer FEED or IFC approval

The database read of the same project matched that panel. Basis history length 2 and three basis items. Structural history length 2. Two interface rows, one superseded, current source `structural` revision 2, both receivers `mechanical:pending`. Three impacts: mechanical `NO_MATERIAL_IMPACT`, two structural impacts still `UNASSESSED`. Audits: `eos2_create_basis`, `eos2_revise_basis`, `eos2_create_discipline`, `eos2_revise_discipline`, `eos2_create_interface`, `eos2_revise_interface`, `eos2_create_deliverable`, `eos2_create_change`, `eos2_record_materiality`, `eos2_revise_discipline`, `eos2_record_freeze`, and one later `eos2_revise_basis` from the retry's first submit. The second submit of that same request key returned HTTP 200 and did not add a fourth basis revision or a second audit.

## Authority

The same session received HTTP 403 `authority_denied` for accept interface, revise basis with acting role ai, approve freeze, approve deliverable, release deliverable, and record materiality with acting role ai. `approvalGranted` stayed false. `Pilot-0001` as the project id returned HTTP 422 `invalid_project`. The Pilot-0001 basis count in this workspace stayed 0.

## RLS

An authenticated member of a different workspace, with no membership in `5c85d773-3b79-43b2-b138-c6251f566768`, saw 0 basis, discipline, interface, change, deliverable, and freeze rows for the validation project.

`CROSS_WORKSPACE_PRODUCTION_LEAK_COUNT=0`

`PRODUCTION_ENROLLED_WORKSPACE_COUNT_AFTER=1`

## Rollout cycle

`eos2_18r_set_rollout_mode` persisted `off`. The read-back mode was `off`. The audit was `eos2_rollout_mode_set` with `persistedMode=off` and `persisted=true`. The reloaded Engineering Basis page showed `EOS 2 is not enabled`. While that mode was off, `/engineering/projects/f40617a3-2366-48e3-99d2-5954201558ae` rendered Pilot-0001. The following call persisted `controlled_pilot`. The read-back and the audit `persistedMode` were `controlled_pilot`. Enrollment stayed 1. The reloaded validation panel then showed the committed workflow.

## Residual

Hydration #418 was not changed. The delivery lifecycle route was not edited. It remains intermittent and Medium. Favicon 404 remains Low. No MDR route was added. The legacy overview counters on the basis page still show zero items; the validation panel is the authoritative workflow display and matches the database.

The release-governance suite on this runtime commit is 220 passed. The known moderate `GHSA-w5hq-g745-h8pq` remains and is not a new blocker.
