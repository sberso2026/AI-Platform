# EOS-A9F AAL2 Live Browser & Release Gate Closeout

Status: **PASS_WITH_LIMITATIONS** for staging / non-production (`rntonzigxwxcjlcsadip`). Additive after EOS-A9E. Does not start Engineering Information Intelligence.

Authentication was not weakened. MFA was not disabled. `requireMfa` was not changed. Tokens were not fabricated. TOTP was not stored, logged, or committed. Service-role was not substituted for browser-user AAL2 evidence.

## Starting state

| Item | Value |
| --- | --- |
| Branch | `cursor/era-7a-engineering-review-pilot-gate` |
| Start HEAD | `2cd9ae20271b62e5fccb81440d1b2638cc6293dc` (EOS-A9E) |
| Staging | `rntonzigxwxcjlcsadip` |
| Named user | `cert-er-a1@rtb-cert.test` |
| Tenant | cert-er-a / `44809b8f-af76-4a50-9a72-f624fc6d72d6` |
| Workspace | A1 `a795a9e0-9d88-4b43-a96e-bb390a2c3f7b` |
| Tenant policy | `engineeringReview.requireMfa=true` |
| Web | `http://127.0.0.1:3002` (`RTB_REVIEW_RUNTIME=staging`) |
| Node / pnpm | v22.23.3 / 9.15.0 (repo `packageManager`) |

A9E remaining gap: verified TOTP factor existed; password session remained AAL1; live AAL2 JWT and browser cases 2–8 were NOT_TESTED.

## MFA enrollment

`packages/engineering-review-persistence/scripts/report-pilot-mfa.ts`:

| Field | Result |
| --- | --- |
| verified_mfa_factors | **1** |
| live_password_aal | **aal1** |
| live_password_decision | **mfa_required** |
| live_aal2_proven | **false** (password-only API session) |
| human_enrollment_required | **false** |
| human_challenge_required | **true** |
| requireMfa | **true** |

A leftover verified factor that the operator had never scanned was unenrolled on staging only (documented recovery in `docs/engineering-review/security/mfa-enrollment.md`). Password was not reset. The operator then enrolled a new authenticator at `/settings/security` and reported MFA passed.

## Human MFA gate

Operator confirmation: MFA challenge completed in the operator browser.

This certification agent **did not** observe `aal=aal2` on a session it controls. The Cursor browser remained at `http://127.0.0.1:3002/login` (`data-review-runtime=staging`, `data-supabase-project-ref=rntonzigxwxcjlcsadip`). Password-only Auth sign-in still yields **aal1**. Raw tokens, cookies, TOTP, and TOTP secrets were not recorded.

| Field | Result |
| --- | --- |
| HUMAN_TOTP_COMPLETED | YES (operator) |
| LIVE_SESSION_AAL | UNKNOWN (not independently read) |
| AAL2 | NOT_PROVEN |

## A9E browser cases 2–8 (preserved, not redefined)

Exact workflow IDs from the A9F closeout charter, mapped to A9E routes:

| Case | Route / workflow | Expected | Actual | Evidence |
| --- | --- | --- | --- | --- |
| 2 | `/engineering/deliverables` | AAL2 workspace loads | NOT_TESTED | No independently proven AAL2 session |
| 3 | `/engineering/settings/deliverables` | AAL2 settings UI | NOT_TESTED | Same |
| 4 | Revision policies | Fail-closed EXACT / CURRENT_EFFECTIVE / BASELINE_PINNED | NOT_TESTED (browser). Unit PASS | `lifecycle-a9d.test.ts` |
| 5 | `/engineering/lifecycle` | AAL2 lifecycle workspace | NOT_TESTED | No independently proven AAL2 session |
| 6 | Cross-tenant/workspace | Deny | NOT_TESTED (browser). Live RLS PASS | A9D live JWT RLS |
| 7 | Refresh/re-login | Persist stored results | NOT_TESTED | Requires AAL2 browser |
| 8 | Digital Thread | Revision, mapping, baseline, assessment | NOT_TESTED (browser). Unit PASS | `composeDeliverableThread` / A9E-27 |

Unauthenticated browser/API (certifying agent):

| Route | Result |
| --- | --- |
| `/engineering/deliverables` | 307 `/login?next=%2Fengineering%2Fdeliverables` |
| `/engineering/lifecycle` | 307 `/login?next=%2Fengineering%2Flifecycle` |
| `/engineering/settings/deliverables` | 307 `/login?next=%2Fengineering%2Fsettings%2Fdeliverables` |
| `/login/mfa` | 307 `/login?next=%2Freview` |
| GET `/api/engineering/deliverables?action=catalog` | 401 |

## Server-side AAL2 (AAL1 negative)

Live AAL1 cookie probe against `127.0.0.1:3002` (`live_password_aal=aal1`):

| Call | Status | Code / reason |
| --- | --- | --- |
| GET `/api/engineering/deliverables?action=catalog` | 403 | `identity_assurance_insufficient` / `mfa_required` |
| POST `/api/engineering/deliverables` | 403 | `identity_assurance_insufficient` / `mfa_required` |
| POST `/api/engineering/lifecycle` | 403 | `identity_assurance_insufficient` / `mfa_required` |
| POST `/api/engineering/settings/deliverables` | 403 | `identity_assurance_insufficient` / `mfa_required` |
| GET `/api/engineering/settings/deliverables` | 200 | AAL1 read still allowed (A9E contract) |

Unit: `eos-a9e-aal2.test.ts` AAL1 deny / AAL2 allow when otherwise authorized.

## Authentication vs authorization

AAL2 is not Engineering authorization. `decideEngineeringIdentityAssurance` can allow while `isReadOnlyEngineeringRole` and commerce entitlement still deny.

Operator evidence after claimed MFA: Command Centre `/engineering` showed “You do not have access to this application / Authorization denied for this route.” That surface is `dashboard.read` → Project Intelligence licence/seat (`getEngineeringApiPolicy("dashboard")`), not the AAL2 Deliverables/Lifecycle gate. Entitlement deny after MFA is expected and does not prove Deliverables authorization.

## Revision ambiguity

Re-run A9D/A9E unit coverage. Missing and ambiguous current-effective revisions remain fail-closed with distinct explanations. No lexical “latest revision” inference. Browser re-check NOT_TESTED.

## Targeted regressions

| Suite | Result |
| --- | --- |
| A9A lifecycle unit + live RLS | PASS |
| A9B lifecycle evidence/schedule unit + live RLS | PASS |
| A9C deliverable maturity unit + live RLS | PASS |
| A9D governance/document status unit + live RLS | PASS |
| A9E identity-assurance unit | PASS (12 web tests with A9F/MFA UI) |
| engineering-os deliverable/lifecycle/assurance | 73 passed |
| commerce access-policy | 10 passed |
| engineering-review `mfa-ux.test.ts` | 11 passed |

## Live RLS

`ENGINEERING_REVIEW_RLS=1` against `rntonzigxwxcjlcsadip`:

- `live-a9a-lifecycle-rls.test.ts` PASS
- `live-a9b-lifecycle-rls.test.ts` PASS
- `live-a9c-deliverable-rls.test.ts` PASS
- `live-a9d-deliverable-governance-rls.test.ts` PASS (includes cross-workspace document binding deny)

DATABASE_CHANGED = NO. RLS_CHANGED = NO.

## Web build

A9E failed ESLint `@next/next/no-html-link-for-pages` on `engineering/settings/page.tsx` `<a href="/engineering/settings/...">`.

A9F minimal fix: `import Link from "next/link"` and replace those internal anchors. Semantically equivalent. Does not change Engineering authority.

Production `next build` (Next 15.5.24): **PASS** (exit 0). Warnings only (including pre-existing unused-vars / hook deps). No A9F-introduced failure.

## Typecheck

`apps/web` `tsc --noEmit`: **329** pre-existing errors. A9F-owned / A9E identity files: **0**. `middleware.ts:239` TS2589 on pre-existing `resolveRequestActorContext`. `packages/engineering-os` `tsc --noEmit`: PASS.

## No auth bypass

Searched A9E/A9F identity paths. No development MFA bypass, localhost bypass, cert-user special case, hard-coded aal2, fake JWT, or `requireMfa=false`. Covered by `eos-a9f-closeout.test.ts`.

## Secret scan

`packages/engineering-review-persistence/scripts/secret-scan.ts`: PASS, 0 findings.

## Limitations

- Live session `aal=aal2` was not independently proven by this agent.
- Browser cases 2–8 remain NOT_TESTED for that reason.
- Authorized AAL2 Deliverables/Lifecycle/Settings mutations were not live-exercised.
- Command Centre deny is entitlement, not an AAL2 failure.
- GET settings/deliverables remains readable at AAL1.
- Pre-existing ERA dirty files were not staged.
- A7C real solver execution remains DEFERRED_EXTERNAL_DEPENDENCY.
- Hosted ClamAV / other ERA pilot blockers remain.

## Readiness

- **READY_FOR_CONTROLLED_PILOT:** NO
- **READY_FOR_PRODUCTION:** NO
- **READY_FOR_NEXT_MAJOR_DOMAIN:** NO — do not start EOS-A10A until live AAL2 and browser cases 2–8 pass under an independently observed session

## Recommended next

Keep the operator on `http://127.0.0.1:3002` as `cert-er-a1@rtb-cert.test` after `/login/mfa`. Independently read `aal` from `getAuthenticatorAssuranceLevel` (no token logging), then execute browser cases 2–8 on Deliverables, Settings → Deliverables, Lifecycle, revision fail-closed UI, cross-workspace deny, refresh, and Digital Thread.
