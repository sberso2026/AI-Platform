# EOS Pilot Gate Closeout

Target: STAGING / NON-PRODUCTION (`rntonzigxwxcjlcsadip`).  
Continuation baseline: `f7ee63304392062c3b612c0ff94ea5d5826f9a8d` (A15A-V1).  
Prior closeout baseline: `60ed9dbb96ea7e9f179bdfb47b8ce39eb3ef7d29` (A15A).  
Feature freeze: preserved. No new engineering domain, connector, solver, Review/Change/Lifecycle engine, DMS, graph store, or Event Bus.

READY_FOR_PRODUCTION = NO.  
CONTROLLED_PILOT_READY = NO.  
A15B_ELIGIBLE = NO.

This continuation closed the dependency-policy blocker with bounded production overrides. It did not weaken MFA, invent hosted malware, or auto-renew expired SCA exceptions.

## Initial blockers (still the only Profile A remainder except dependency)

1. HUMAN_AAL2_GATE = BLOCKED  
2. AUTHENTICATED_BROWSER_HITL = NOT_TESTED  
3. MULTI_PROJECT_BROWSER_HITL = NOT_TESTED  
4. LIFECYCLE_BROWSER_HITL = NOT_TESTED  
5. HOSTED_MALWARE_SCANNER = BLOCKED  
6. RETURNED_ARTIFACT_PILOT = BLOCKED  
7. DEPENDENCY_POLICY_GATE = **PASS** (this continuation)

## Current build (continuation)

localhost:3002 process started 2026-10-01T15:00:29Z via `scripts/review-staging.mjs`.  
`/api/platform/build-identity` 200 with `commitSha=f7ee63304392062c3b612c0ff94ea5d5826f9a8d`, branch `cursor/era-7a-engineering-review-pilot-gate`, `reviewRuntime=staging`, `supabaseProjectRef=rntonzigxwxcjlcsadip`, `dirty=true` (unrelated ERA leftovers not discarded, not staged). `/login` 200. `RTB_REVIEW_CLAMAV_URL` unset (process and `.env.local`).

## AAL2 evidence

Password sign-in as `cert-er-a1@rtb-cert.test` on the current HEAD server reached:

`http://localhost:3002/login/mfa?next=%2Fengineering%2Fwork`

Authenticator code field was shown. Page status: `Identity assurance: AAL1`. Automation **stopped**. TOTP was not requested in chat, not generated, not injected. Browser was unlocked for the operator.

HUMAN_AAL2_GATE = BLOCKED (operator TOTP not completed in this continuation).  
SERVER_AAL2_PROOF = NOT_TESTED (`/api/platform/identity-assurance` requires the same AAL2 session).  
Authenticated Workbench / Work Plan / value-criteria / Option Study / Pre-Issue Review / Change Impact / My Engineering Day / multi-project / lifecycle browser HITL remain NOT_TESTED.

CROSS_PROJECT_CONTAMINATION = NO (no authenticated AAL2 session in which to contaminate; A15A in-process isolation still PASS).

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

Unit CLEAN/EICAR/fail-closed remain architecture evidence only (`malware-scan.test.ts`, `file-ingestion-policy.test.ts`, `eos-a14a-security.test.ts`).

## Dependency closeout (continuation)

Fresh `pnpm audit --prod`: see `EOS_PILOT_GATE_CLOSEOUT_DEPENDENCY.md`.

Bounded overrides added in this continuation (patch/minor or required advisory floor only; no exception renewal):

- `image-size` >= 2.0.3 (resolved 2.0.4; fixed GHSA-5p2g-fcmc-qvqq, GHSA-w3rx-r6r6-pgpr)
- `sharp` >= 0.35.4 (resolved 0.35.5; fixed GHSA-f88m-g3jw-g9cj, GHSA-rgj7-g3m4-5g8c)
- `brace-expansion` pin moved 1.1.20 → 1.1.21 (fixed remaining moderate GHSA-q2hr-2g5m-vwhr without resolving to 5.x)

PPTX generation tests passed against `pptxgenjs@4.0.1` + `image-size@2.0.4`.

critical = 0. high = 0. Remaining raw finding: 1 moderate (`uuid@8.3.2` via exceljs, GHSA-w5hq-g745-h8pq). No new human-governed exception. Expired exceptions were not applied.

DEPENDENCY_POLICY_GATE = PASS.  
RAW_DEPENDENCY_AUDIT = FAIL (moderate remains; pnpm audit --prod exits non-zero).

## Reliability carry-forward (not new blockers)

A14B DATABASE_RESTORE PASS_WITH_LIMITATIONS, SOAK PASS_WITH_LIMITATIONS, MEMORY_GROWTH NOT_TESTED remain **PILOT_LIMITATION / A16 production hardening**. They were not on the A15A exact blocker list.

## Final Profile A matrix

| Gate | State |
|---|---|
| Human AAL2 | BLOCKED |
| Server AAL2 | NOT_TESTED |
| Authenticated Workbench HITL | NOT_TESTED |
| Work Plan HITL | NOT_TESTED |
| Value-criteria HITL | NOT_TESTED |
| Multi-project browser HITL | NOT_TESTED |
| Lifecycle browser HITL | NOT_TESTED |
| RLS / IDOR / service-role / Secrets / object storage / templates | PASS (regression) |
| Hosted malware | BLOCKED |
| Returned-artifact malware gate | BLOCKED |
| OpenXML | PASS (regression) |
| Dependency policy | PASS |
| Pre-Issue Review / Change Impact / RFI/TQ / Digital Thread | PASS (regression; browser HITL NOT_TESTED) |
| Named users / kill switch / runbook | PASS |
| Privacy / no surveillance | PASS |
| Live SharePoint / EDMS / BIM / P6 / solver / EXAMPLE_ONLY calc / PDF | NOT_APPLICABLE |

CONTROLLED_PILOT_READY = NO because mandatory AAL2, authenticated browser HITL, hosted malware, and returned-artifact gates remain BLOCKED or NOT_TESTED.

## Closeout continuation regressions (2026-10-01)

- `@rtb/engineering-os` typecheck: PASS
- `@rtb/engineering-os` tests: 121 files / 787 tests PASS (A9–A15A, A14A security, A14B soak, A15A demonstrator, A15A-V1)
- Live RLS / identity / audit / schema / restore: 21 files / 54 tests PASS against `rntonzigxwxcjlcsadip`
- Web TypeScript errors: 338 pre-existing; continuation introduced 0
- Web production build: PASS
- Secret scan (persistence TARGETS including closeout docs + runbook): PASS (0 findings)
- Feature freeze: preserved (overrides + documentation + SCA report only)

## A15B metrics preparation (not measured)

The following workflow times are the approved pilot metrics. They must be collected from named pilot users after HUMAN_AAL2_GATE = PASS. They are not employee-monitoring signals. This continuation did not measure them because authenticated browser HITL was not completed.

- time to find governing information
- time to create Work Plan
- time to prepare option comparison
- time to prepare Cost evidence
- time to assemble Constructability evidence
- time to assemble Carbon evidence where applicable
- time to draft Design Report
- time to prepare RFI/TQ response
- time to perform initial Change Impact
- time to prepare Review Package
- time to prepare Handover

## A15B

Not eligible. Next: EOS Pilot Gate Closeout continuation — complete operator TOTP in the unlocked MFA browser, then authenticated Workbench / Work Plan / value-criteria / multi-project / lifecycle HITL; deploy a non-localhost hosted ClamAV URL and complete returned-artifact round trip. Do not add EOS product features.
