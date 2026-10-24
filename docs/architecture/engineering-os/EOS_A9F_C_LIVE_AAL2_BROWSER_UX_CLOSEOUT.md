# EOS-A9F-C Live AAL2 + Deliverable/Lifecycle Browser UX Closeout

Status: **PASS_WITH_LIMITATIONS** for staging / non-production (`rntonzigxwxcjlcsadip`). Additive after EOS-A9F. Does not start EOS-A10A.

Authentication was not weakened. MFA was not disabled. TOTP/tokens were not stored or logged. Command Centre was not modified.

## Starting A9F limitation

A9F recorded operator MFA completion but **LIVE_SESSION_AAL = UNKNOWN** and browser cases 2–8 **NOT_TESTED**, because the certification agent could not read `aal` from a session it controlled.

## Safe AAL observation method

`GET /api/platform/identity-assurance` uses the authenticated Supabase session:

- `auth.mfa.getAuthenticatorAssuranceLevel()`
- verified TOTP count from `auth.mfa.listFactors()`

Response shape only:

```json
{ "authenticated": true, "aal": "aal2", "verifiedFactors": 1 }
```

Unauthenticated: 401 `unauthenticated`. Password-only sessions remain AAL1. The route does not return tokens, cookies, TOTP, or secrets.

## Live aal2 proof

| Check | Result |
| --- | --- |
| HUMAN_TOTP_COMPLETED | YES (operator, A9F) |
| Password-only API session | aal1 (`a9e-aal1-mutation-probe.ts`) |
| Unauthenticated readout | 401 |
| Operator AAL2 in certifying browser | **NOT independently observed** (Cursor browser remained on `/login`) |
| LIVE_SESSION_AAL | UNKNOWN |
| AAL2 | FAIL (not proven to this agent) |

Do not treat operator screenshots or Command Centre access as `aal=aal2`.

## Dedicated project context

Preferred name: **EOS A9 Browser Certification**. AAL1 `GET /api/engineering/projects` returned 401 in the provision script, so that named project was not created in this run.

Reuse existing authorized fixture in Tenant A / Workspace A1:

- **ER-A1** `4729d258-f953-45f6-927c-2ba2450365a1` / Review Project A1

Deliverables, Lifecycle, and Settings now consume `useResolvedEngineeringProjectId` (header session + `?projectId=`) via `EngineeringProjectContextBar`. Raw “Project id” free-text mutation fields were removed. Server authorization remains mandatory.

## Browser cases 2–8

Preserved from A9E/A9F. Not executed against an independently proven AAL2 session.

| Case | Route / workflow | Result |
| --- | --- | --- |
| 2 | `/engineering/deliverables` | FAIL (not independently run at aal2) |
| 3 | `/engineering/settings/deliverables` | FAIL |
| 4 | Revision policies | FAIL (browser). Unit still PASS |
| 5 | `/engineering/lifecycle` | FAIL |
| 6 | Cross-tenant/workspace | FAIL (browser). Live RLS PASS |
| 7 | Refresh / session continuity | FAIL |
| 8 | Digital Thread | FAIL (browser). Deliverable detail still renders thread fields |

Unauthenticated protected routes still redirect to login (A9F evidence retained).

## Deliverables UI

- Shared project context bar (workspace slug + selected project name)
- Empty state **Browse Templates** (no auto-adopt)
- Adopt disabled unless AAL2 + write role + selected project
- Digital Thread fields remain on expectation detail

## Settings UI

- Same project context bar
- Template → adopt → active expectation copy
- Mapping scope: workspace-wide or selected project (no raw UUID field)
- Writes disabled unless AAL2 + non-viewer role

## Lifecycle UI

`lifecycleControlState` represents canonical authority:

- No assignment: decision/transition/target disabled; CTA Assign Lifecycle Profile or Open Lifecycle Settings
- AAL1: protected actions disabled
- PARTIAL / FAILED / NOT_READY / STALE: decision and transition disabled
- READY_FOR_REVIEW: decision enabled; transition only after approved decision
- Target stage is a select of governed `allowedTransitions` from the current stage

## Negative UI

Encoded in `lifecycleControlState` unit tests and disabled controls. Not re-proven in a live AAL2 browser.

## Digital Thread

Case 8 remains the Deliverable detail thread (`document_revision` / mapping / baseline / assessment composition from A9E). KG reads remain OFF.

## Session continuity

Not independently re-read after refresh. SESSION_AAL_AFTER_REFRESH = FAIL.

## Live RLS

`ENGINEERING_REVIEW_RLS=1` A9A–A9D hosted JWT suites: PASS. AAL2 does not weaken workspace isolation.

## Web build / typecheck

- Production `next build`: PASS (exit 0)
- `@rtb/engineering-os`, `@rtb/types`, `@rtb/platform-commerce` tsc: PASS
- apps/web tsc: 329 pre-existing; A9F-C-owned files: 0

## Deferred debt

- **COMMAND_CENTRE_ENTITLEMENT_UX_DEBT = DEFERRED** (explicitly out of scope)
- **ENGINEERING_REVIEW_FIXTURE_HYGIENE = DEFERRED** (no safe metadata filter; RLS fixtures not deleted)
- Engineering Review empty package: CTA already disabled without selected documents; copy updated so empty packages are not implied

## Readiness

- **A9_SEQUENCE_STATUS:** OPEN
- **READY_FOR_NEXT_MAJOR_DOMAIN:** NO
- **READY_FOR_CONTROLLED_PILOT:** NO
- **READY_FOR_PRODUCTION:** NO

## Recommended next

Operator completes `/login/mfa` in a browser this agent can inspect. `GET /api/platform/identity-assurance` must return `aal=aal2`. Then run cases 2–8 on ER-A1 (or the dedicated certification project) using the shared project selector. Do not start EOS-A10A.
