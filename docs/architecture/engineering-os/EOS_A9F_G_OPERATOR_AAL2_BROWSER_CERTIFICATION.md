# EOS-A9F-G Operator AAL2 Browser Certification

Status: **PASS_WITH_LIMITATIONS** for staging / non-production (`rntonzigxwxcjlcsadip`). Additive after EOS-A9F-F. No authentication source changed. Does not start EOS-A10A.

No cookies, tokens, TOTP, or passwords were transferred between browser profiles or logged. ERA leftovers were not staged.

## Operator AAL2 proof

Human-in-the-loop, same operator browser/profile that previously showed identity-assurance aal2:

| Check | Operator report |
| --- | --- |
| `GET /api/platform/identity-assurance` | `authenticated: true`, `currentLevel: aal2`, `nextLevel: aal2`, `verifiedFactors: 1` |
| Refresh same URL | still aal2 / next aal2 |
| `/engineering/deliverables` then settings then lifecycle, then identity-assurance | all three pages loaded; identity-assurance remained aal2 |

Client `getAuthenticatorAssuranceLevel()` was **not** injected. Server identity-assurance in that operator browser is the enforcement readout. `CLIENT_LEVEL_OBSERVATION = NOT_DIRECTLY_INSTRUMENTED`.

## Browser/session separation

| Session | AAL |
| --- | --- |
| Operator browser (MFA ceremony) | AAL2 |
| Cursor IDE automation browser | AAL1 |

`SESSION_ISOLATION = CONFIRMED`. This is independent cookie storage, not `SESSION_PERSISTENCE_FAILURE` or SSR propagation failure. Cursor was not required to become AAL2. Credentials were not copied.

## Cases 2–8 (operator HITL)

Preserved from A9E/A9F. Workspace A1 `a795a9e0-9d88-4b43-a96e-bb390a2c3f7b`. Project ER-A1 `4729d258-f953-45f6-927c-2ba2450365a1`. AAL2 confirmed via identity-assurance in the same profile.

| Case | Route | Human action | Expected | Observed | Result |
| --- | --- | --- | --- | --- | --- |
| 2 | `/engineering/deliverables` | Open with ER-A1 | AAL2 workspace; templates separate; project selector | Loaded; selector visible; Identity assurance AAL2; templates not mixed as active expectations | PASS |
| 3 | `/engineering/settings/deliverables` | Open | AAL2 settings; no raw project-id mutation field | Loaded; mapping/profile UI; no free-text project-id authority | PASS |
| 4 | Revision policies | Thread + unit | Fail closed; no lexical latest | Unit PASS (`missing_document` / `ambiguous_effective_revision`). Browser binding inspection not confirmed (operator Other) | PASS (unit); browser inspection unconfirmed |
| 5 | `/engineering/lifecycle` | Open | AAL2 lifecycle; no auto-transition | Loaded; assignment present; controls follow gate state | PASS |
| 6 | Cross-workspace | Deny other WS | Deny; no leak | Not attempted | NOT_TESTED |
| 7 | Refresh | Refresh Deliverables/Lifecycle | AAL2 and project retained | Refreshed; still AAL2; project still shown | PASS |
| 8 | Digital Thread | Open a deliverable row | Relational thread; KG OFF | Thread showed definition/binding/revision/readiness; no KG read UI | PASS |

## Deliverables / Settings / Lifecycle / Digital Thread

| Surface | Result |
| --- | --- |
| Deliverables browser | PASS |
| Settings browser | PASS |
| Lifecycle browser | PASS |
| Digital Thread browser | PASS |

Deliverables write buttons were reported **disabled/missing** in the UI, so adoption/evaluate was not clicked. Settings POST `configureMapping` in the operator browser returned **200** (operator report). That is **not** an MFA deny, so identity assurance passed for a protected settings mutation. AAL2 ≠ authorization was not proven by a denied unauthorized write.

## Mutations

| Check | Result |
| --- | --- |
| AAL1 mutation deny | PASS (retained A9F-D/A9F-F Cursor AAL1 session: 403 `mfa_required`) |
| AAL2 authorized mutation | PASS (settings mapping POST 200, not `identity_assurance_insufficient`) |
| AAL2 unauthorized mutation deny | NOT_TESTED |
| Cross-workspace deny under AAL2 | NOT_TESTED |

## Revision ambiguity

Unit reconfirmed previously: `eos-a9e-certification.test.ts` PASS. **REVISION_AMBIGUITY = PASS**.

## Build / RLS / secrets

No auth/middleware/client/RLS source changes. **WEB_BUILD = PASS**, **LIVE_RLS = PASS**, introduced type errors **0**. Secret scan of this document: no tokens/cookies/TOTP.

## Final A9 status

**OPEN**. Ready for next major domain: **NO** until case 6 and AAL2 unauthorized deny are executed in the operator AAL2 browser. Ready for controlled pilot: **NO**. Production: **NO**. A7C remains deferred.

Remaining HITL: one unauthorized action (expect 403 for role/workspace/authority, not MFA) and one other-workspace access/mutation deny with no extra metadata.
