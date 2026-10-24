# EOS-A9F-F Same-Session AAL2 Closeout

Status: **FAIL** for staging / non-production (`rntonzigxwxcjlcsadip`). Additive after EOS-A9F-E. No authentication source changed. Does not start EOS-A10A.

TOTP, tokens, cookies, JWTs, and passwords were not logged. ERA leftovers were not staged.

## Source freeze

| Item | Value |
| --- | --- |
| Branch | `cursor/era-7a-engineering-review-pilot-gate` |
| Start HEAD | `e2bcffc4630eb60da055e476ee68abd505de15fe` (EOS-A9F-E) |
| Staging | `rntonzigxwxcjlcsadip` / `http://127.0.0.1:3002` |
| User | `cert-er-a1@rtb-cert.test` |
| Intended project | ER-A1 `4729d258-f953-45f6-927c-2ba2450365a1` |

## Pre-MFA (retained)

Password session in the certifying product: currentLevel **aal1**, nextLevel **aal2**, verifiedFactors **1**.

## Human TOTP

Operator attestation: MFA completed in the same certifying browser. Operator opened `GET /api/platform/identity-assurance` and observed:

`authenticated: true`, `currentLevel: aal2`, `nextLevel: aal2`, `aal: aal2`, `verifiedFactors: 1`.

No TOTP value was requested or recorded.

## Server post-verify (operator evidence)

Recorded as **AAL2 / AAL2** per that live readout.

## Client AAL observation method

Did **not** add diagnostics or call `getAuthenticatorAssuranceLevel()` by injecting a new Auth client.

Supported safe method: `GET /api/platform/identity-assurance` (request-scoped server client + `getAuthenticatorAssuranceLevel` + verified TOTP count). Engineering pages also show `IdentityAssuranceReadout` from that endpoint. The JSON API document has no in-page Supabase browser client.

**Cursor IDE automation tab** (this closeout’s cookie jar) re-read identity-assurance after navigation and `cache: no-store` fetch:

`authenticated: true`, `currentLevel: aal1`, `nextLevel: aal2`, `verifiedFactors: 1`.

Client current/next in that tab: **UNKNOWN** for a true browser-Auth `getAuthenticatorAssuranceLevel` call; server readout in that tab is **aal1**.

## Refresh

Reload of `/api/platform/identity-assurance` in the Cursor tab remained **aal1 / aal2**. Operator-attested refresh in their session was **aal2**. Agent-measured `AAL_AFTER_REFRESH` for the automation cookie jar: **AAL1**.

## Navigation

Same Cursor session:

| Route | Actual |
| --- | --- |
| `/engineering/deliverables` | `/login/mfa?next=%2Fengineering%2Fdeliverables` |
| `/engineering/settings/deliverables` | `/login/mfa?next=%2Fengineering%2Fsettings%2Fdeliverables` |
| `/engineering/lifecycle` | `/login/mfa?next=%2Fengineering%2Flifecycle` |

`AAL_AFTER_NAVIGATION` (automation tab): **AAL1**. GET `/api/engineering/deliverables?action=catalog` from that tab: **403** `identity_assurance_insufficient` / `mfa_required`.

## A9F-D fix status

**FIX_INCOMPLETE** for the Cursor automation session (still aal1). Operator identity-assurance **aal2** indicates the A9F-D persist path can succeed in the browser profile they used. Those two cookie jars are not the same.

No additional auth code was added.

## Cases 2–8

AAL2 workspace cases were **attempted** in the automation tab and did not load protected UI (MFA challenge). They are **NOT_TESTED** as AAL2 browser cases because the session under automation control was not aal2. They are not marked FAIL as product-behavior failures of Deliverables/Lifecycle.

| Case | Route | Workspace / project | AAL | Authz | Action | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | `/engineering/deliverables` | A1 / ER-A1 intended | aal1 in automation tab | n/a | open workspace | AAL2 workspace | MFA challenge | NOT_TESTED |
| 3 | `/engineering/settings/deliverables` | same | aal1 | n/a | open settings | AAL2 settings | MFA challenge | NOT_TESTED |
| 4 | Revision policies | same | n/a | n/a | fail-closed | fail closed | unit PASS; browser not at aal2 | NOT_TESTED (unit PASS) |
| 5 | `/engineering/lifecycle` | same | aal1 | n/a | open lifecycle | AAL2 lifecycle | MFA challenge | NOT_TESTED |
| 6 | Cross-workspace | n/a | aal1 | n/a | deny | deny | not run at aal2 | NOT_TESTED |
| 7 | Refresh continuity | n/a | aal1 | n/a | retain aal2 | aal2 | automation tab aal1 | NOT_TESTED |
| 8 | Digital Thread | ER-A1 intended | aal1 | n/a | thread fields | relational thread; KG OFF | not opened | NOT_TESTED |

## Mutations

| Check | Result |
| --- | --- |
| AAL1 mutation deny | PASS (403 `mfa_required` on catalog GET/POST path) |
| AAL2 authorized mutation | NOT_TESTED |
| AAL2 unauthorized deny | NOT_TESTED |
| Cross-workspace deny under AAL2 | NOT_TESTED |

## Revision ambiguity

Unit re-run: `packages/engineering-os` `eos-a9e-certification.test.ts` PASS (`missing_document`, `ambiguous_effective_revision`, no lexical `10`/`2`). **REVISION_AMBIGUITY = PASS**. Browser re-run NOT_TESTED.

Lifecycle UI gating unit: `eos-a9f-c-lifecycle-controls.test.ts` PASS.

## Build / RLS / secrets

No auth/session/RLS source changes. Preserve **WEB_BUILD = PASS**, **LIVE_RLS = PASS**. Introduced type errors: **0**. Secret scan of this document: no tokens/TOTP.

## Final A9 status

**OPEN**. Ready for next major domain: **NO**. Ready for controlled pilot: **NO**. Production: **NO**. A7C remains deferred.

To close A9F-F, the Cursor IDE certifying tab must share the cookie session that already returns identity-assurance **aal2**, then cases 2–8 can execute. Do not reset MFA. Do not start EOS-A10A.
