# EOS-A9E Deliverables and Lifecycle AAL2 / Browser Certification

Status: **PASS_WITH_LIMITATIONS** for staging / non-production (`rntonzigxwxcjlcsadip`). Additive after EOS-A9D. Does not start Engineering Information Intelligence.

Authentication was not weakened. MFA was not disabled. `requireMfa` was not changed. Tokens were not fabricated. Service-role was not substituted for browser-user evidence.

## Purpose

Close demonstrable AAL2 and browser-certification gaps on Deliverables and Lifecycle before another major domain:

1. Named staging user MFA enrollment/challenge and AAL2
2. Server-side enforcement at protected mutation endpoints
3. Browser workflows for deliverables, settings, revision policy, lifecycle, isolation, Digital Thread

## Environment

| Item | Value |
| --- | --- |
| Branch | `cursor/era-7a-engineering-review-pilot-gate` |
| Start HEAD | `183ff65f1cb1c877d5a474da39b0a5c7dd5acc45` (EOS-A9D) |
| Staging | `rntonzigxwxcjlcsadip` |
| Named user | `cert-er-a1@rtb-cert.test` |
| Tenant | cert-er-a / `44809b8f-af76-4a50-9a72-f624fc6d72d6` |
| Workspace | A1 `a795a9e0-9d88-4b43-a96e-bb390a2c3f7b` |
| Tenant policy | `engineeringReview.requireMfa=true` |
| Web | `http://127.0.0.1:3002` (`RTB_REVIEW_RUNTIME=staging`) |

## MFA facts (live, no secrets)

`packages/engineering-review-persistence/scripts/report-pilot-mfa.ts` with env-loaded cert password:

| Field | Result |
| --- | --- |
| verified_mfa_factors | **1** |
| live_password_aal | **aal1** |
| live_password_decision | **mfa_required** |
| live_aal2_proven | **false** |
| human_enrollment_required | **false** |
| human_challenge_required | **true** |

Enrollment is already complete. The remaining human step is TOTP challenge, not enrollment.

## Exact human step (blocks browser cases 2–8)

1. Open staging `http://127.0.0.1:3002/login` (project ref `rntonzigxwxcjlcsadip`).
2. Sign in as `cert-er-a1@rtb-cert.test` with the authorized staging password.
3. At `/login/mfa` enter the current TOTP from the enrolled authenticator.
4. Confirm the session JWT `aal` is `aal2`, then continue Deliverables/Lifecycle UI cases.

This agent does not complete TOTP and does not type the password into the browser tool log.

## Certification cases

| ID | Case | Expected | Actual | Evidence | Blocker |
| --- | --- | --- | --- | --- | --- |
| A9E-01 | Login page on staging | Staging login, project ref staging | PASS | Browser `http://127.0.0.1:3002/login`; `data-supabase-project-ref=rntonzigxwxcjlcsadip`; `data-review-runtime=staging` | None |
| A9E-02 | Unauthenticated Deliverables/Lifecycle | Redirect to login with `next` | PASS | `/engineering/deliverables` → `/login?next=%2Fengineering%2Fdeliverables`; `/engineering/lifecycle` → `/login?next=%2Fengineering%2Flifecycle` | None |
| A9E-03 | Unauthenticated MFA route | Redirect to login | PASS | `/login/mfa` → `/login?next=%2Freview` | None |
| A9E-04 | Password session is AAL1 | AAL1 JWT; policy denies | PASS | `live_password_aal=aal1`, `live_password_decision=mfa_required` | None |
| A9E-05 | Factor exists | Verified TOTP factor | PASS | `verified_mfa_factors=1` | None |
| A9E-06 | Login → MFA → tenant/workspace | AAL2 session in Tenant A / WS A1 | BLOCKED | Factor exists; TOTP not entered | Human TOTP at `/login/mfa` |
| A9E-07 | AAL1 GET/POST `/api/engineering/deliverables` | 403 `identity_assurance_insufficient` | PASS | Live probe: GET catalog and POST adopt both 403 `mfa_required` | None |
| A9E-08 | AAL1 POST `/api/engineering/lifecycle` | 403 `identity_assurance_insufficient` | PASS | Live probe: 403 `mfa_required` | None |
| A9E-09 | AAL1 POST `/api/engineering/settings/deliverables` | 403 `identity_assurance_insufficient` | PASS | Live probe: 403 `mfa_required` | None |
| A9E-10 | AAL1 GET settings/deliverables | Allowed (read inspection; write gated) | PASS | Live probe: GET 200 | None |
| A9E-11 | AAL2 allow when requireMfa | Policy allows `aal2`+totp | PASS (unit) | `decideEngineeringIdentityAssurance` AAL1 deny / AAL2 allow | Live AAL2 JWT not observed |
| A9E-12 | Unadopted template has no expectation/gate | Domain behaviour from A9D | PASS (unit) | `lifecycle-a9d.test.ts` template safety | Browser NOT_TESTED |
| A9E-13 | Authorized adoption / project definition | Domain + commerce settings.write | PASS (unit) | A9D service tests | Browser NOT_TESTED |
| A9E-14 | Unauthorized adoption/definition writes | 403 / denied | PASS (unit) + AAL1 403 | Live AAL1 POST adopt 403; A9D authority tests | Browser member/admin NOT_TESTED |
| A9E-15 | Artifact binding revision + provenance | Binding keeps policy; thread records revision | PASS (unit) | Thread includes `document_revision`, mapping, `baseline_membership`, `deliverable_assessment` | Browser NOT_TESTED |
| A9E-16 | Settings admin write / member read | Commerce + RLS from A9D | PASS (unit/RLS A9D) | A9D live RLS last run; this phase did not change SQL | Browser NOT_TESTED |
| A9E-17 | Project mapping overrides workspace | Domain from A9D | PASS (unit) | A9D mapping tests | Browser NOT_TESTED |
| A9E-18 | Mapping version change stales assessments | Domain from A9D | PASS (unit) | A9D staleness tests | Browser NOT_TESTED |
| A9E-19 | Unmapped IFC remains UNMAPPED | Domain from A9D | PASS (unit) | A9D IFC/ZZ tests | Browser NOT_TESTED |
| A9E-20 | EXACT / CURRENT_EFFECTIVE / BASELINE_PINNED | Document/Configuration authority; no lexical order | PASS (unit) | A9D revision tests + A9E fail-closed explanations | Browser NOT_TESTED |
| A9E-21 | Missing/ambiguous revision fails closed | Distinct useful explanation | PASS (unit) | `ambiguous_effective_revision` / `missing_document` / `exact_revision_not_found`; no lexical pick of `"10"` over `"C"` | Browser NOT_TESTED |
| A9E-22 | Revision/baseline change invalidates assessment | STALE previous fingerprint | PASS (unit) | A9D current-effective staleness | Browser NOT_TESTED |
| A9E-23 | Lifecycle composition; human gate retains actor | Domain from A9A–A9C | PASS (unit) | Existing lifecycle tests | Browser NOT_TESTED |
| A9E-24 | Status/schedule/catalogue cannot auto-approve | Domain from A9D | PASS (unit) | A9D construction-status ≠ approval | Browser NOT_TESTED |
| A9E-25 | Cross-tenant/workspace bind/write denied | Domain + RLS from A9D | PASS (unit/RLS A9D) | `artifact_not_found`; A9D live RLS | Browser NOT_TESTED |
| A9E-26 | Refresh/re-login preserve stored results | Persistence unchanged | NOT_TESTED | Requires AAL2 browser session | Human TOTP |
| A9E-27 | Digital Thread shows revision, mapping, baseline, assessment | Thread composition | PASS (unit) | `composeDeliverableThread` now includes `baseline_membership` | Browser NOT_TESTED |

## What this phase implemented

- Tenant `requireMfa` now applies to Engineering OS **Deliverables**, **Lifecycle**, and **settings mutations** via the same `evaluateReviewIdentityPolicy` used by Review. AAL1 is rejected with `identity_assurance_insufficient`.
- Middleware AAL2-gates `/engineering/deliverables`, `/engineering/lifecycle`, and `/engineering/settings/deliverables`.
- Missing and ambiguous revision resolution fail closed with distinct explanations. Lexical revision ordering is still not used.
- Digital Thread always records `baseline_membership`.

## Validation

| Check | Result |
| --- | --- |
| engineering-os tests (A9C/A9D/A9E) | 24 passed |
| web tests (`eos-a9e-aal2`, MFA UI, UAT-002) | 13 passed |
| engineering-os `tsc --noEmit` | PASS |
| apps/web `tsc --noEmit` | FAIL 329 errors; 0 in A9E identity-assurance / deliverable-intelligence files; `middleware.ts:239` TS2589 on pre-existing `resolveRequestActorContext` (same Review AAL2 call) |
| Live RLS | NOT_RERUN — no SQL/RLS/persistence policy change |
| Live AAL1 HTTP | PASS against `127.0.0.1:3002` |
| Web build | FAIL — Next 15.5.24 compiled with warnings, skipped type validation, then ESLint failed on pre-existing `@next/next/no-html-link-for-pages` in `engineering/settings/page.tsx` (not A9E-owned). A9E files were not in the failure list. |

## Remaining blockers (platform, not A9E-only)

- Live AAL2 JWT / browser TOTP not completed
- ERA-7A / pilot: ClamAV not independently certified in this run; historical LIVE_AAL2 NOT_PROVEN until TOTP
- EOS-A7C SPACE GASS / solver execution still DEFERRED_EXTERNAL_DEPENDENCY
- apps/web application-wide typecheck remains FAIL (pre-existing)
- Dirty ERA leftovers on the branch must not be mixed into this commit

## Readiness

- **READY_FOR_CONTROLLED_PILOT:** NO
- **READY_FOR_PRODUCTION:** NO
- **READY_FOR_NEXT_MAJOR_DOMAIN:** NO — do not start Engineering Information Intelligence to work around the remaining AAL2 browser gap

## Limitations

- Browser workflows 2–8 remain NOT_TESTED until a human completes TOTP
- GET `/api/engineering/settings/deliverables` remains readable at AAL1; writes are AAL2-gated when `requireMfa`
- Screenshots of login are not treated as server-side enforcement; HTTP 403 on AAL1 mutations is
