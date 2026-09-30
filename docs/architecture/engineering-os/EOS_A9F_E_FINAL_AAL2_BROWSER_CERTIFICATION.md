# EOS-A9F-E Final AAL2 Browser Certification

Status: **FAIL** for staging / non-production (`rntonzigxwxcjlcsadip`). Additive after EOS-A9F-D. Does not start EOS-A10A.

No authentication source was changed in this phase. ERA leftovers were not staged. TOTP, tokens, cookies, and JWT payloads were not logged.

## Source safety

| Item | Value |
| --- | --- |
| Branch | `cursor/era-7a-engineering-review-pilot-gate` |
| HEAD | `9b896d3f75400e5b6797c92cdd12d42f51c5a7ff` (EOS-A9F-D) |
| Staging | `rntonzigxwxcjlcsadip` at `http://127.0.0.1:3002` |
| Named user | `cert-er-a1@rtb-cert.test` |

## Pre-MFA (retained)

From the certifying Cursor browser password session, before this continuation:

| Field | Result |
| --- | --- |
| currentLevel | aal1 |
| nextLevel | aal2 |
| verifiedFactors | 1 |
| MFA factor enrolled | YES |

## Human TOTP

Operator attestation: the current authenticator TOTP was entered and Verify was completed for `cert-er-a1@rtb-cert.test`.

Independent observation in the **Cursor certifying browser** (`viewId` session on `127.0.0.1:3002`):

| Check | Result |
| --- | --- |
| Route after continuation start | `/login/mfa` |
| MFA page `data-verify-succeeded` | empty (verify not observed on this document) |
| Visible identity readout | Identity assurance: AAL1 |
| `GET /api/platform/identity-assurance` | `authenticated: true`, `currentLevel: aal1`, `nextLevel: aal2`, `verifiedFactors: 1` |
| Navigate `/engineering/deliverables` | redirected to `/login/mfa?next=%2Fengineering%2Fdeliverables` |

Identity-assurance keys only: `authenticated`, `currentLevel`, `nextLevel`, `aal`, `verifiedFactors`.

Conclusion: operator TOTP did not upgrade **this** certifying browser session. The likely cause is a different browser/profile than the Cursor certification tab, not a new speculative auth defect. A9F-D `persistVerifiedMfaSession` was not exercised in the observed tab (no post-verify dataset).

## Post-verify client

| Field | Result |
| --- | --- |
| currentLevel | aal1 |
| nextLevel | aal2 |

Required aal2 / aal2 was **not** met. Certification stopped before cases 2–8 per procedure.

## Post-verify server

| Field | Result |
| --- | --- |
| currentLevel | aal1 |
| nextLevel | aal2 |
| verifiedFactors | 1 |

Not SESSION_PROPAGATION_FAILURE (that requires client aal2 and server not aal2). Both sides of this session are aal1.

## Refresh / navigation AAL

Not executed as AAL2 parity tests. Navigation to Deliverables while AAL1 correctly re-challenged MFA.

## A9F-D fix status

**FIX_INCOMPLETE** for the certifying session under observation: after operator-attested TOTP, client currentLevel remained aal1.

## AAL1 regression (executed)

POST `/api/engineering/deliverables` from this session: **403** `identity_assurance_insufficient` / `mfa_required`.

Unauthenticated GET `/api/engineering/deliverables`: **401**. Unauthenticated `/engineering/deliverables`: **307**.

## Cases 2–8

Prerequisite LIVE_SESSION_AAL = aal2 was not available. All reported **NOT_TESTED**, not FAIL.

| Case | Route / workflow | Result |
| --- | --- | --- |
| 2 | `/engineering/deliverables` | NOT_TESTED |
| 3 | `/engineering/settings/deliverables` | NOT_TESTED |
| 4 | Revision policies (browser) | NOT_TESTED (unit fail-closed retained) |
| 5 | `/engineering/lifecycle` | NOT_TESTED |
| 6 | Cross-workspace | NOT_TESTED (live RLS retained) |
| 7 | Refresh / session continuity at aal2 | NOT_TESTED |
| 8 | Digital Thread | NOT_TESTED |

## Mutations at AAL2

| Check | Result |
| --- | --- |
| AAL2 authorized mutation | NOT_TESTED |
| AAL2 unauthorized mutation | NOT_TESTED |
| Cross-workspace deny under AAL2 | NOT_TESTED |

## Revision ambiguity

Unit evidence retained (`ambiguous_effective_revision` in `eos-a9e-certification.test.ts`). No lexical latest. Browser re-run NOT_TESTED.

## Live RLS / web build

No auth/session source changes in A9F-E. Reuse A9F-D hosted JWT A9A–A9D + secret-scan PASS and production `next build` PASS.

## Typecheck

No A9F-E application source. Introduced errors: **0**.

## Final A9 status

A9 sequence remains **OPEN**. Ready for next major domain: **NO**. Ready for controlled pilot: **NO**. Ready for production: **NO**.

To close A9F-E, Verify must complete in the **same Cursor certifying browser** that owns the observed cookies so `persistVerifiedMfaSession` can be measured (`verifySucceeded`, client aal2, server aal2). Do not reset MFA or re-enrol.
