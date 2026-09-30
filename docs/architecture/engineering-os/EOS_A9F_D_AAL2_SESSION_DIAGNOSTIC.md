# EOS-A9F-D AAL2 Session Diagnostic

Status: **FAIL** for staging / non-production (`rntonzigxwxcjlcsadip`). Additive after EOS-A9F-C. Does not start EOS-A10A.

Authentication was not weakened. MFA was not disabled. TOTP, tokens, cookies, and JWT payloads were not logged. Cases 2–8 were not redefined.

## Observed symptom

A9F-C closed with `MFA_FACTOR_ENROLLED = YES`, `VERIFIED_MFA_FACTORS = 1`, operator TOTP completed in a non-certifying browser, and server-side AAL1 mutation deny PASS. `LIVE_SESSION_AAL` remained UNKNOWN. Browser cases 2–8 were not executed against an independently proven AAL2 session.

Verified factor count is not session AAL2.

## Client AAL before MFA

Certifying browser, password sign-in as `cert-er-a1@rtb-cert.test`, then `/login/mfa`:

| Source | Result |
| --- | --- |
| MFA page `data-pre-mfa-current-level` | aal1 |
| MFA page `data-pre-mfa-next-level` | aal2 |
| MFA page `data-pre-mfa-verified-factors` | 1 |
| Visible readout | Identity assurance: AAL1 |
| `GET /api/platform/identity-assurance` | `authenticated: true`, `currentLevel: aal1`, `nextLevel: aal2`, `verifiedFactors: 1` |

Keys returned by identity-assurance: `authenticated`, `currentLevel`, `nextLevel`, `aal`, `verifiedFactors` only.

## Verify outcome

Human TOTP was **not** entered in the certifying browser during this phase. `mfa.verify` was therefore not observed. MFA_VERIFY remains unproven for this session.

The MFA page now refuses to redirect unless `persistVerifiedMfaSession` reports `verifySucceeded`, `sessionPresent`, `userPresent`, and `currentLevel === aal2`.

## Client AAL immediately after verify

Not observed. Requires human TOTP in the certifying browser.

## Server AAL

Before TOTP, the request-scoped identity route matched the browser: **aal1** / next **aal2**. This is CASE-pre-MFA parity, not CASE C.

Classification after a successful verify is still open:

- CASE A: browser stays aal1 after verify
- CASE B: browser aal2, server aal1/unknown (cookie/SSR)
- CASE C: browser and server both aal2

## Refresh AAL

Not observed. No AAL2 session existed to refresh.

## Root cause

Two defects were confirmed in the committed MFA path, independent of TOTP:

1. **Verify response was not applied to the SSR cookie session before redirect.** `/login/mfa` called `mfa.verify`, then `getAuthenticatorAssuranceLevel`, then `router.replace` without `setSession` / `getSession` on the verify result. A successful TOTP could leave the Next.js cookie store on the previous AAL1 session (CASE A or CASE B).
2. **Identity readout could not prove `nextLevel`.** The route returned `{ authenticated, aal, verifiedFactors }` and did not call `getSession()` before `getAuthenticatorAssuranceLevel()`. AAL2 vs AAL1 was under-specified for certification.

Contributing live-runtime note (not staged): the working tree `createBrowserClient` leftover uses `isSingleton: false`. That is an unrelated ERA change. A9F-D does not commit it. The MFA page now holds one client for the page lifetime and persists the verify session onto that client.

## Exact fix

- `persistVerifiedMfaSession`: on verify success, `setSession` from the verify session when present, then `getSession` + `getUser` + `getAuthenticatorAssuranceLevel`. Returns only sanitized fields.
- MFA challenge page: reuse one browser client; create a fresh challenge per submit; select a verified TOTP factor; do not redirect unless `mfaUpgradeConfirmed`; show `Authentication could not be upgraded. Try again.` if verify succeeds but AAL is not aal2.
- Identity-assurance: request-scoped `createClient()`, `getSession()`, safe contract `{ authenticated, currentLevel, nextLevel, aal, verifiedFactors }`.
- Staging/certification readout `IdentityAssuranceReadout` on the Engineering project context bar (no tokens).

No MFA bypass. No hardcoded aal2. No fake TOTP.

## Security impact

Protected Deliverables/Lifecycle mutations remain AAL2-gated. Live AAL1 POST `/api/engineering/deliverables` from the certifying password session returned **403** `identity_assurance_insufficient` / `mfa_required`. Unauthenticated POST returned **401**. Unauthenticated GET `/engineering/deliverables` returned **307** to login.

## Regression evidence

- `eos-a9f-d-session.test.ts` PASS
- `eos-a9f-c-closeout.test.ts`, `eos-a9f-closeout.test.ts`, `eos-a9e-aal2.test.ts`, `engineering-review-mfa-ui.test.ts` PASS
- `@rtb/engineering-review` `mfa-ux.test.ts` PASS
- `@rtb/engineering-review` tsc PASS
- A9F-D owned apps/web files: 0 introduced tsc errors

## Browser cases 2–8

Preserved from A9E/A9F/A9F-C. Not executed: no independently proven AAL2 session in the certifying browser.

| Case | Workspace | Project | Route | currentLevel | Authorization | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | A1 | ER-A1 (intended) | `/engineering/deliverables` | aal1 at MFA | not entered | AAL2 workspace | Not reached | FAIL |
| 3 | A1 | ER-A1 (intended) | `/engineering/settings/deliverables` | aal1 at MFA | not entered | AAL2 settings | Not reached | FAIL |
| 4 | A1 | ER-A1 (intended) | Revision policies | aal1 at MFA | not entered | Fail closed | Browser not run; unit retained | FAIL |
| 5 | A1 | ER-A1 (intended) | `/engineering/lifecycle` | aal1 at MFA | not entered | AAL2 lifecycle | Not reached | FAIL |
| 6 | A1 vs other | cross-workspace | isolation | aal1 at MFA | not entered | Deny | Browser not run; live RLS retained | FAIL |
| 7 | A1 | ER-A1 (intended) | refresh / re-login | aal1 at MFA | not entered | aal2 survives | Not reached | FAIL |
| 8 | A1 | ER-A1 (intended) | Digital Thread | aal1 at MFA | not entered | Relational thread; KG OFF | Browser not run | FAIL |

## Final certification

A9F-D **FAIL**. Password AAL1 / next AAL2 is proven in the certifying browser. Session upgrade after TOTP, refresh/navigation AAL2, and cases 2–8 remain open until the operator enters TOTP on `http://127.0.0.1:3002/login/mfa` in that same browser.

Do not start EOS-A10A.
