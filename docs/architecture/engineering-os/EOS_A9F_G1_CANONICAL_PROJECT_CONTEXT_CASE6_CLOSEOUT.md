# EOS-A9F-G1 Canonical Project Context + Case 6 Security Closeout

Status: **PASS_WITH_LIMITATIONS** for staging / non-production (`rntonzigxwxcjlcsadip`). Additive after EOS-A9F-G. Does not rewrite `EOS_A9F_G_OPERATOR_AAL2_BROWSER_CERTIFICATION.md`. Does not start EOS-A10A.

No MFA, identity-assurance, or authentication client source was changed. ERA leftovers were not staged. Schema was not changed. RLS fixture projects were not deleted.

## Amendment: selector contrast (data present, options unreadable)

Human observation after G1: Authorized Project appeared empty because native `<select>` / `<option>` text could match the dark-theme background. This is **not** an empty result set.

| Layer | Count |
| --- | --- |
| `GET /api/engineering/projects` (cert JWT, workspace A1) | **31** including ER-A1 |
| React `projects` options | same as API (`data-authorized-count`) |
| DOM `<option>` nodes | API count + 1 placeholder |

**PROJECT_SELECTOR_ROOT_CAUSE (current):** `SELECTOR_VISUAL_CONTRAST_BUG`

The control is a native `<select>`. It had `className="mt-1 w-full rounded border px-2 py-1"` with no `eos-select`, no option colors, and no local `color-scheme`. Windows/Chrome native option popups do not inherit parent text color reliably.

Fix: apply existing `.eos-select` tokens to the selector; style `select` and `option` (placeholder, hover/checked, disabled, focus); placeholder uses `--eos-text-secondary` (≥4.5:1 on `--eos-bg-secondary`); labels are `Project Name · Code`, never a raw UUID. No RLS/membership/schema change.

Cursor IDE browser cannot open `/engineering/deliverables` (AAL1/unauthenticated → login). Live opened-dropdown certification remains operator AAL2 HITL.

## Clarification of EOS-A9F-G (not a rewrite)

| A9F-G claim | G1 clarification |
| --- | --- |
| AAL2 | Genuinely PASS in the operator browser (`authenticated`, `currentLevel=aal2`, `nextLevel=aal2`, `verifiedFactors=1`; refresh/navigation AAL2) |
| AAL2 authorized mutation | PASS through settings `configureMapping` POST 200; identity assurance passed. Deliverables template adoption was **not** fully certified at that time. **G1 closeout:** STR-DC-FEED adoption is now certified |
| Deliverables page load | PASS |
| Deliverables project selection / adoption | **Not fully certified** in A9F-G (empty Authorized Project dropdown) |
| Browser Case 6 | **NOT_TESTED** in A9F-G |

## Project domain inventory

| Surface | Authoritative source |
| --- | --- |
| Engineering Core | `engineering_projects` via `EngineeringProjectService` / `GET|POST /api/engineering/projects` |
| Deliverables | Same `engineering_projects` id through shared `EngineeringProjectContextBar` → `rtb.engineering.selectedProjectId` |
| Lifecycle | Same shared project context |
| Engineering Review | Same `engineering_projects` directory (`apps/web/src/lib/review/runtime.ts`). Review runs/packages live in `engineering_review_packages` (`project_id` FK). No separate `engineering_review_projects` table |

`/engineering/projects` **page** remains Project Intelligence entitled. The shared selector API must not.

## ER-A1 Review Project A1

| Field | Value |
| --- | --- |
| Physical table | `engineering_projects` |
| Id | `4729d258-f953-45f6-927c-2ba2450365a1` |
| Code / name | `ER-A1` / `Review Project A1` |
| Tenant | `44809b8f-af76-4a50-9a72-f624fc6d72d6` |
| Workspace | `a795a9e0-9d88-4b43-a96e-bb390a2c3f7b` (`cert-er-a1`) |
| Hide flags | none (`certification_fixture` / `hidden_from_pilot_ui` false) |
| Domain | **BOTH** — Engineering Core row consumed by Review as its project directory |
| Linked extra Core row | none; do not duplicate |

Cert JWT can read this row. It was reused. No new certification project was inserted.

## Selector root cause

Trace: Deliverables UI `EngineeringProjectContextBar` → `GET /api/engineering/projects` → `withEngineeringApi("projects")` → `EngineeringProjectService.list` → `engineering_projects` RLS.

Before the policy retarget:

- JWT/RLS list for workspace A1: **29** rows including ER-A1
- Selector API: **403 `application_not_in_plan`**
- UI swallowed non-`data` JSON → empty dropdown

**PROJECT_SELECTOR_ROOT_CAUSE = ENTITLEMENT_DENY**

`projects.read` / `project.list` were bound to `applicationKey: "project_intelligence"`. Tenant A is an Engineering OS certification tenant without Project Intelligence (ERA-PILOT-0E). Deliverables/Lifecycle already used Engineering OS core policy. The shared selector did not.

Not MFA. Not empty Core table. Not ER-A1 Review-only.

## Fix

Retarget canonical Engineering project list/create to Engineering OS core product entitlement (no PI application key):

- `ENGINEERING_API_POLICIES` `projects.read` / `projects.write`
- `ENGINEERING_SERVICE_POLICIES` `project.list` / `get` / `create` / `update` / `search`

The PI **page** `/engineering/projects` is unchanged. Identity-assurance gating of Deliverables/Lifecycle is unchanged.

After the change, cert-user `GET /api/engineering/projects` = **200**, count **29**, includes ER-A1.

## proj-crusher-feed

In-memory unit/synthetic fixture (`packages/engineering-os` deliverable/lifecycle/thread tests). Not a hosted `engineering_projects` row. JWT `project_code=eq.proj-crusher-feed` and `id=eq.proj-crusher-feed` returned empty. Not reused.

## JWT / RLS visibility (cert user, no unauthorized names)

| Probe | Result |
| --- | --- |
| cert workspace A1 list | ALLOW, count 29 |
| ER-A1 | ALLOW |
| same-tenant other-workspace code `ER-A2` | invisible |
| other-tenant code `ER-B1` | invisible |
| anonymous A1 list | 200 with 0 rows |
| engineer POST `engineering_document_status_mappings` | **403 `42501`**, not `mfa_required` |

Live JWT RLS re-run: `live-core-rls`, `live-a9c-deliverable-rls`, `live-a9d-deliverable-governance-rls` — **10 passed**.

## Operator AAL2 HITL (same profile as A9F-G)

| Check | Operator report |
| --- | --- |
| Authorized Project dropdown after reload | Visible (not empty) |
| ER-A1 label independently confirmed | **YES** — operator selected `Review Project A1 · ER-A1` and adopted STR-DC-FEED |
| Selected authorized A1 Engineering project + AAL2 context | PASS |
| Shared context on `/engineering/lifecycle` | PASS |
| Templates Available + Adopt Template | **PASS** — operator adopted **STR-DC-FEED**; it is an active Structural deliverable with Evaluate from canonical evidence. Not `mfa_required` / `identity_assurance_insufficient` |
| Browser Case 6 (no other-workspace/tenant selectable) | **PASS** (revalidated) |

## A9 security closeout (fixtures + Case 6)

MFA and project-context source were not modified in this closeout.

**AAL2 authorized Deliverables mutation:** operator AAL2, project `Review Project A1 · ER-A1`, Adopt Template **STR-DC-FEED** succeeded; row is active with Evaluate from canonical evidence.

**Same-workspace unauthorized write deny** (existing fixtures, membership not weakened):

| Actor | Action | Result |
| --- | --- | --- |
| `cert-er-a1` engineer | POST `engineering_document_status_mappings` | **403 `42501`**, not MFA |
| `cert-er-a1` engineer | POST `engineering_project_deliverable_definitions` | **403 `42501`**, not MFA |
| `cert-er-a-admin` | POST mapping (control) | **201**, then deleted |

RLS role deny is independent of AAL. The same cert engineer is AAL2 in the operator browser; this write is denied for **authority**, not `mfa_required`.

**Cross-workspace / cross-tenant deny** (no unauthorized names leaked):

| Probe | Result |
| --- | --- |
| a1 JWT other-workspace / other-tenant project codes | invisible |
| a2 JWT read of ER-A1 id | invisible |
| b1 JWT read of ER-A1 id | invisible |
| anonymous ER-A1 | invisible |
| a1 selector API | 200, 31 rows, ER-A1 present, ER-A2/ER-B1 codes absent |
| A9D live bind of hidden other-workspace document | denied, title not in body |

**AAL1 API revalidation** (`a9e-aal1-mutation-probe`): GET/POST deliverables, POST lifecycle, POST settings → **403 `identity_assurance_insufficient` / `mfa_required`**. GET settings still 200.

**Browser cases 2–8 revalidation** (operator AAL2, same profile):

| Case | Result |
| --- | --- |
| 2 Deliverables + ER-A1 + STR-DC-FEED | PASS |
| 3 Settings, no raw project-id | PASS |
| 4 Revision fail-closed | PASS (unit, retained) |
| 5 Lifecycle, no auto-transition | PASS |
| 6 Cross-workspace/tenant not selectable | PASS |
| 7 Refresh retains AAL2 + ER-A1 | PASS |
| 8 Digital Thread STR-DC-FEED, no KG | PASS |

## Fixture list

JWT-visible A1 count **29** includes Core RLS leftover insert/update rows. Existing hide flags (`metadata.certification_fixture`, `hidden_from_pilot_ui`) do not mark them. Per A9F-G1: fixture-list hygiene remains **DEFERRED**. Not an A9 closer blocker. Fixtures were not deleted.

## Validation

| Check | Result |
| --- | --- |
| Commerce project policy tests | PASS |
| Engineering project service / workspace-scope tests | PASS |
| Web A9F-G1 / A9F-C / A9F / A9E / MFA UI tests | PASS |
| Engineering OS A9C/A9D/A9E deliverable tests | PASS |
| Live JWT RLS core + A9C + A9D | PASS (re-run this closeout, 10 passed) |
| Secret scan (`engineering-review-persistence`) | PASS, 0 findings |
| Pilot-scoped typecheck | PASS; full web tsc still 328 pre-existing isolated debt; **0 introduced** |
| `apps/web` `next build` | PASS |
| AUTH / MFA / identity-assurance source | unchanged |
| Database schema | unchanged |
| Fixture DATA | unchanged (ER-A1 reused) |

## Readiness

- **A9_SEQUENCE_STATUS:** CLOSED
- **READY_FOR_NEXT_MAJOR_DOMAIN:** YES — EOS-A10A Engineering Information Intelligence Foundation
- **READY_FOR_CONTROLLED_PILOT:** NO
- **READY_FOR_PRODUCTION:** NO
- **A7C_REAL_TOOL_EXECUTION_STATUS:** DEFERRED_EXTERNAL_DEPENDENCY
