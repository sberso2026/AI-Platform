# EOS-A15A-V3 Governed MTO Workbench & Persistence

Target: STAGING / NON-PRODUCTION (`rntonzigxwxcjlcsadip`).  
Baseline: `992b87839c83958b212409c6a32b6915832c5416`.  
Mode: bounded composition overlay on certified V2 Quantity Basis & MTO. **Not** an MTO Intelligence domain.

READY_FOR_PRODUCTION = NO.  
CONTROLLED_PILOT_READY = NO.  
A15B_ELIGIBLE = NO.

Hosted malware remains **DEFERRED_EXTERNAL_DEPENDENCY**. Returned-artifact round trip remains **DEFERRED_DEPENDENT_GATE**. This phase does not accept unscanned returned user files and does not touch scanner implementation.

## Persistence

Smallest canonical model:

- `engineering_mto_snapshots`
- `engineering_mto_items`

Quantity-basis provenance is **embedded on the MTO item**. There is no third Quantity Basis table.

Snapshots do not silently overwrite previous revisions. A new revision creates a new snapshot and marks the prior snapshot `SUPERSEDED`.

## Workflow

Work Plan (STRUCTURAL_MTO / CIVIL_MTO / PIPING_MTO / ELECTRICAL_MTO / MULTIDISCIPLINARY_MTO)
→ Create / Open MTO
→ inspect quantity basis
→ engineer verification
→ controlled snapshot
→ revision comparison
→ XLSX export
→ Change Impact / Pre-Issue Review / Digital Thread.

Unrelated Work Plans are not forced into MTO.

## Verification authority

Snapshot status: `DRAFT` | `UNDER_REVIEW` | `VERIFIED` | `SUPERSEDED`.

Item verification: `UNVERIFIED` | `VERIFIED` | `REJECTED` | `NEEDS_INFORMATION`.

MTO verification means quantity/basis verification, not whole-design approval. `ENGINEERING_APPROVED` is not used.

AI-extracted (`SOURCE_EXTRACTED`) quantities remain `UNVERIFIED` until a human engineer verifies them. AI cannot verify its own extracted quantity. Bulk verification requires explicit selection and confirmation. There is no “verify all AI quantities automatically” action.

Once a snapshot is `VERIFIED`, its governed item set is immutable. Engineering change creates Rev B with `SUPERSEDES`.

## Revision semantics

Rev A → Rev B with `supersedes_snapshot_id`. Deterministic delta kinds: `ADDED` | `REMOVED` | `INCREASED` | `DECREASED` | `UNCHANGED`. Absolute quantity delta only. No automatic dollar or carbon impact.

## RLS

Workspace membership plus tenant match, matching other Engineering OS tables. Application service additionally denies cross-project access. Client cannot supply `tenant_id`, `workspace_id`, `verified_by`, `created_by`, snapshot fingerprint, or supersession authority. Service-role access is not treated as user authorization proof.

## UI

Engineering Workbench / Work Plan → Quantities & MTO (`/engineering/work/plans/[id]/mto`).

Views: overview, snapshot/revision selector, discipline and verification filters, provenance drawer, revision comparison, export. Primary table keeps practical engineering columns; expanded provenance answers “Where did this quantity come from?”

Pagination is 50 rows. 5,000 items are not rendered as naive DOM rows.

## Source freshness

Governing Engineering Information revision change does not mutate a verified snapshot. Staleness: `SOURCE_CHANGED` / `MTO_REVIEW_REQUIRED`. Surfaced in Attention / My Engineering Day as actionable MTO states only (verification, source changed, missing quantity basis, rejected item, new revision comparison). No employee productivity metrics.

## Export

Reuses certified V2 XLSX sheets 01–13. Cost/Carbon sheets only when governed basis exists. Workbook provenance includes project, revision, fingerprint, lifecycle, generated date, verification state. Language: `DRAFT MTO` or `VERIFIED MTO`. Export does not imply IFC or engineering approval.

## Cost / carbon / constructability

No estimating application. Missing approved rate → `COST_NOT_CALCULATED`. Carbon `NOT_APPLICABLE` does not create unnecessary gaps. Required without factor → `CARBON_NOT_CALCULATED`. Constructability exposes deterministic counts/volumes only. No opaque score.

## Pre-Issue and Digital Thread

Pre-Issue checks evidence (missing provenance, unverified AI extraction, stale source, cost/carbon without basis). It does not decide technical correctness of the quantity.

Digital Thread reuses existing relation codes: source → item/snapshot, Rev A `SUPERSEDED_BY` Rev B, MTO → Work Plan / export / Change Impact. No new graph store.

## Demonstrator

Crusher FEED multidisciplinary fixture is persisted. Known Rev A → Rev B: steel +18.4 t, concrete +96 m3, anchor bolts +16 ea. HITL includes deterministic steel mass, unverified extracted concrete, engineer-entered cable assumption, and missing-basis `QUANTITY_NOT_AVAILABLE`.
