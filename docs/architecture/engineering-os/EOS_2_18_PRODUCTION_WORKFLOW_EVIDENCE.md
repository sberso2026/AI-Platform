# EOS 2.18 Production Workflow Evidence

Session: authenticated Production session on `https://eos-pilot.rtbea.com.au`, workspace `eos-controlled-pilot / default`, role `pilot_engineer`. Browser: Microsoft Edge. No password, token, cookie, or recovery secret was stored in artifacts.

Database evidence used the Supabase management query API for read-only counts and state. No migration replay and no cohort expansion occurred.

## Project

`PRODUCTION_PILOT_VALIDATION_PROJECT_READY=YES`

Reused labelled project `CONTROLLED_PRODUCTION_PILOT_VALIDATION` created during EOS 2.18R. Panel text states it is a pilot-validation record, not a customer deliverable, and approval granted: no. `Pilot-0001` was not used as the EOS 2 validation project and was left without EOS 2 basis rows (`pilot0001_basis=0`).

## Engineering Basis

`PRODUCTION_ENGINEERING_BASIS_WORKFLOW=PASS`

Independent Production revise advanced persisted basis revision from 3 to 4 via `POST /api/engineering/pilot-workflow` (`revise_basis`). Immediate panel read showed revision 4. Page reload retained revision 4. Database `engineering_basis_sets.revision=4`, history length 3, items 4. Logout completed; post-logout database second read still showed revision 4. Provenance and `eos2_revise_basis` audit present.

## Discipline object

`PRODUCTION_DISCIPLINE_OBJECT_WORKFLOW=PASS`

`DISCIPLINES_WRITTEN_COUNT=1`

Structural discipline object persisted at revision 3. Create/revise/reload path exercised in 2.18R and independently reconfirmed via panel + database this phase. Mechanical was used as receiver/impact target for interface and materiality, not as a second written discipline object.

## Interface

`PRODUCTION_INTERFACE_WORKFLOW=PASS`

Current interface revision 2 status `draft` (`current=true`); revision 1 superseded. Receivers remain `pending` (no inherited acceptance). Source ownership structural, source revision linked. Audit and reload persistence confirmed.

## Revision

`PRODUCTION_REVISION_WORKFLOW=PASS`

Previous basis and discipline revisions preserved in history. Current revisions correct (basis 4, structural 3, interface 2). Historical rows remain available. Interface dependency state updated with supersession. Audit truthful.

## Change impact

`PRODUCTION_CHANGE_IMPACT_WORKFLOW=PASS`

Change case `pilot-validation-change` persisted. Deterministic dependency discovery produced candidate impacts. Human materiality `NO_MATERIAL_IMPACT` recorded for mechanical. AI materiality attempts denied. Downstream impact state and audit verified. AI did not finalize materiality.

## Deliverable

`PRODUCTION_DELIVERABLE_WORKFLOW=PASS`

Governed deliverable revision 1 current: freshness `potentially_stale`, approval `pending`, release `not_released`. Upstream revision linked. No automatic revision, approval, or release observed. Reload persistence confirmed.

## Design freeze

`PRODUCTION_DESIGN_FREEZE_WORKFLOW=PASS`

Frozen readiness snapshot present with approval `pending`. Scope states not a customer FEED or IFC approval. Human authority required for approve. Immutable historical readiness retained. No false customer/project approval issued.

## Data persistence

`PRODUCTION_DATA_PERSISTENCE_VALIDATION=PASS`

Verified after write, immediate read, page reload, logout, and database second read. Panel and database remained consistent at basis revision 4 and matching discipline/interface/deliverable/freeze state. Optimistic UI-only success was not accepted.

## Write retry / duplicate protection

`PRODUCTION_WRITE_RETRY_DUPLICATE_PROTECTION=PASS`

Safe request-key retry of revise_basis returned HTTP 200 without creating an additional basis revision or duplicate audit beyond the first successful submit.

## Legacy overview counters

`LEGACY_OVERVIEW_COUNTER_ASSESSED=YES`

`LEGACY_OVERVIEW_COUNTER_STATUS=UX_LIMITATION`

`GET /api/engineering/engineering-basis` returns `view: emptyView(...)` (unpersisted in-memory graph) plus unused `rows`. The page overview counters bind to that empty view and show zeros while the controlled validation panel matches database state. Classification: UX limitation / data-display defect (Medium OP-018-005), not Blocking for pilot expansion while the panel remains the authoritative EOS 2 display. Not treated as intentional EOS 1-only marketing; engineers must use the panel.

## Rollout mode reliability

`ROLLOUT_MODE_PERSISTENCE_RELIABILITY=PASS`

`ROLLOUT_AUDIT_STATE_MATCH=PASS`

Non-mutating consistency check: tenant settings mode `controlled_pilot` equals latest rollout audit `persistedMode=controlled_pilot` (`persisted=true`) equals UI controlled-pilot behaviour. Full destructive off/on cycle not repeated; EOS 2.18R evidence remains valid for the corrected `eos2_18r_set_rollout_mode` path.

## Hydration #418

`HYDRATION_418_ASSESSED=YES`

`HYDRATION_418_STATUS=INTERMITTENT_NONBLOCKING`

`HYDRATION_418_SEVERITY=MEDIUM`

Route: `/engineering/delivery-lifecycle`. Browser: Microsoft Edge. This run did not reproduce #418 on delivery-lifecycle load. Prior intermittent observations remain. No data difference, action-control failure, navigation failure, persistence impact, or incorrect engineering state attributed to hydration this run.

## MDR surface

`MDR_SURFACE_STATUS=UX_LIMITATION`

Design-freeze / governed-deliverable surfaces plus the validation panel provide sufficient access for controlled pilot use. No separate MDR page was created merely for naming.

## Engineering AI

`PRODUCTION_ENGINEERING_AI_OPERATIONAL_VALIDATION=PASS`

Authoritative operational answers for what changed / stale deliverable / readiness used persisted pilot-workflow GET state (basis 4, interface 2 draft, deliverable potentially_stale, freeze pending). Ask Engineering AI abstained with insufficient evidence for EOS 2 pilot tables not in the Ask retrieval corpus — correct abstention, no invented calculation, no approval, no materiality finalization, no release. Workspace and project boundaries observed.

## Authority and RLS

`PRODUCTION_AUTHORITY_BOUNDARY_TEST=PASS`

Unauthorized accept-interface, AI-as-actor revise/materiality, approve freeze, approve deliverable, and release remained denied. Incident exercise: unauthenticated accept_interface POST returned safe denial without leakage or corruption.

`PRODUCTION_RLS_REGRESSION=PASS`

`CROSS_WORKSPACE_PRODUCTION_LEAK_COUNT=0`

Persisted basis, discipline, revision, interface, change, deliverable, and freeze records were not visible across workspaces.

## EOS 1 coexistence

`EOS_1_COEXISTENCE_REGRESSION=PASS`

`LEGACY_PROJECT_AUTO_MIGRATION=NO`

EOS 1 Pilot-0001 project overview and Assets register (`SL-001`) remained operable after remediation and EOS 2 writes. No auto-migration of legacy projects into EOS 2 workflow tables.
