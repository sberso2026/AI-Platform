# EOS Pilot Gate Closeout

Target: STAGING / NON-PRODUCTION (`rntonzigxwxcjlcsadip`).  
Baseline: `60ed9dbb96ea7e9f179bdfb47b8ce39eb3ef7d29` (A15A).  
Feature freeze: preserved. No new engineering domain, connector, solver, Review/Change/Lifecycle engine, DMS, graph store, or Event Bus.

READY_FOR_PRODUCTION = NO.  
CONTROLLED_PILOT_READY = NO.  
A15B_ELIGIBLE = NO.

This phase closed what could be closed without weakening MFA, inventing hosted malware, or auto-renewing expired SCA exceptions.

## Initial blockers

1. HUMAN_AAL2_GATE = BLOCKED  
2. AUTHENTICATED_BROWSER_HITL = NOT_TESTED  
3. MULTI_PROJECT_BROWSER_HITL = NOT_TESTED  
4. LIFECYCLE_BROWSER_HITL = NOT_TESTED  
5. HOSTED_MALWARE_SCANNER = BLOCKED  
6. RETURNED_ARTIFACT_PILOT = BLOCKED  
7. DEPENDENCY_POLICY_GATE = BLOCKED  

## Current build

localhost:3002 was serving `commitSha=60ed9dbb…`, branch `cursor/era-7a-engineering-review-pilot-gate`, `RTB_REVIEW_RUNTIME=staging`, `/login` 200, `/api/platform/build-identity` 200. `RTB_REVIEW_CLAMAV_URL` unset (process and env files).

## AAL2 evidence

Password sign-in as `cert-er-a1@rtb-cert.test` reached:

`http://localhost:3002/login/mfa?next=%2Fengineering%2Fwork`

Authenticator code field was shown. Automation **stopped**. TOTP was not requested in chat, not generated, not injected. Browser was unlocked for the operator.

HUMAN_AAL2_GATE = BLOCKED (operator TOTP not completed in this closeout).  
SERVER_AAL2_PROOF = NOT_TESTED (`/api/platform/identity-assurance` requires the same AAL2 session).  
All authenticated Workbench / Work Plan / artifact / review / impact / My Engineering Day / multi-project / lifecycle browser HITL remain NOT_TESTED.

CROSS_PROJECT_CONTAMINATION = NO (no authenticated session in which to contaminate; A15A in-process isolation still PASS).

## Hosted malware

Existing Review ClamAV HTTP contract (`RTB_REVIEW_CLAMAV_URL` + `scanWithEstablishedScanner`) is unchanged. No MalwareScanner2.

A valid hosted scanner was **not** present: URL unset; localhost-only ClamAV is not accepted as hosted.

| Check | Result |
|---|---|
| Endpoint class | UNSET |
| Health | UNAVAILABLE (degraded, not a Profile A connector blocker) |
| Live CLEAN XLSX/DOCX/PPTX | NOT_TESTED (no hosted endpoint) |
| Live EICAR | NOT_TESTED |
| Unavailable fail-closed | PASS (A14A test/config path: returned upload blocked when scanner URL unset/unreachable; no silent bypass). Live hosted health path not available. |
| Timeout fail-closed | PASS (A14A test/config path: `RTB_REVIEW_CLAMAV_TIMEOUT_MS=1` against unreachable URL fail-closes) |
| Returned-artifact round trip | BLOCKED |
| Infected return | NOT_TESTED on hosted path |

Unit CLEAN/EICAR/fail-closed remain architecture evidence only.

## Dependency closeout

Fresh `pnpm audit --prod`: see `EOS_PILOT_GATE_CLOSEOUT_DEPENDENCY.md`.

Bounded overrides (patch/minor only; no exception renewal):

- `nanoid` >= 3.3.18 (fixed GHSA-28wg-ghj8-5hjv, GHSA-2v37-7h3g-55p8)
- `brace-expansion` pinned 1.1.20 (fixed four brace-expansion highs; `>=1.1.20` was rejected after it resolved to 5.0.7 which remained vulnerable)
- `postcss` >= 8.5.18 (fixed GHSA-6g55-p6wh-862q, GHSA-r28c-9q8g-f849)

SCA script now ignores **expired** exceptions (`review_by < today`). Expired rows were not extended.

Remaining unaccepted highs (4): sharp ×2, image-size ×2. Not proven non-runtime. DEPENDENCY_POLICY_GATE = BLOCKED.

## Reliability carry-forward (not new blockers)

A14B DATABASE_RESTORE PASS_WITH_LIMITATIONS, SOAK PASS_WITH_LIMITATIONS, MEMORY_GROWTH NOT_TESTED remain **PILOT_LIMITATION / A16 production hardening**. They were not on the A15A exact blocker list.

## Final Profile A matrix

| Gate | State |
|---|---|
| Human AAL2 | BLOCKED |
| Server AAL2 | NOT_TESTED |
| Authenticated / multi-project / lifecycle browser HITL | NOT_TESTED |
| RLS / IDOR / service-role / Secrets / object storage / templates | PASS (regression) |
| Hosted malware / returned-artifact malware gate | BLOCKED |
| Dependency policy | BLOCKED |
| Named users / kill switch / runbook | PASS |
| Live SharePoint / EDMS / BIM / P6 / solver / EXAMPLE_ONLY calc / PDF | NOT_APPLICABLE |

CONTROLLED_PILOT_READY = NO because mandatory gates remain BLOCKED or NOT_TESTED.

## Closeout regressions (2026-10-01)

- `@rtb/engineering-os` tests: 120 files / 779 tests PASS (includes A9–A15A, A14A security, A14B soak, A15A demonstrator)
- Live RLS / identity / audit / schema / restore: 21 files / 54 tests PASS against `rntonzigxwxcjlcsadip`
- Web TypeScript errors: 339 pre-existing; closeout introduced 0
- Web production build: PASS
- Secret scan: PASS (0 findings)
- Feature freeze: preserved (no new product domain, connector, solver, Review/Change/Lifecycle engine, DMS, graph store, or Event Bus)

## A15B

Not eligible. Next: EOS Pilot Gate Closeout continuation — complete operator TOTP in the unlocked MFA browser, deploy a non-localhost hosted ClamAV URL, and finish remaining high-advisory reachability or human-governed exceptions. Do not add EOS product features.
