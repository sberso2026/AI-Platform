# EOS 2.15 EOS 2.0 Engineering Delivery Qualification Report

## Decision

EOS 2.15R remediates the signed-in evidence gap from EOS 2.15. The qualification status is `QUALIFIED_BOUNDED`. The phase verdict is `PASS_WITH_LIMITATIONS`.

EOS 2.0 is a validated and bounded-qualified multidisciplinary engineering delivery, traceability, interface, change-impact, lifecycle, configuration and deliverable-governance platform for controlled engineering workflows across Concept, Feasibility, FEED and Detailed Engineering.

This claim does not cover unsupported deterministic calculations, global external solver qualification, autonomous engineering approval, regulatory certification, a full enterprise document-management system, or full construction management.

The validated runtime is commit `af6612bdebe40616dab18525ceab4dc70f03621e`, deployed as preview `dpl_Am7AhnHwv7Hjdymx4e73AXrfv75C`. Build identity for that deployment reports branch `cursor/era-7a-engineering-review-pilot-gate`, dirty false, and staging Supabase `rntonzigxwxcjlcsadip`. The documentation commit that records this decision was not deployed. Production promotion was not executed.

## Remediation of QD-001

| ID | Severity | Status | Record |
| --- | --- | --- | --- |
| QD-001 | MEDIUM | RESOLVED | Vercel deployment protection redirected an ordinary browser to Vercel login before EOS login. The preview stayed protected. Qualification used the existing Protection Bypass for Automation, then the normal EOS login. Nineteen routes passed. The hosted P-101 path was executed by the application. |

Root cause: the preview's deployment protection intercepted the browser before the application. Remediation: authorized automation bypass, then application authentication. Evidence: `EOS_2_15R_AUTHENTICATED_BROWSER_VALIDATION.md` and `EOS_2_15R_HOSTED_CRITICAL_PATH_EVIDENCE.md`. Residual limitation: an unauthenticated browser still meets Vercel protection, and receiver or impact decisions are inserted because those tables do not grant update to the application role. Defect history is retained. No additional qualification defect was opened.

Defect count 1. Resolved 1. Unresolved 0. Critical 0. High 0. Medium 1. Low 0.

## Hosted evidence

- Authenticated browser validation: 19 of 19 paths passed on the deployed preview.
- Application login, workspace `eos-qa-a`, qualification project visibility, logout, and the protected route after logout passed.
- Workspace `eos-qa-b` did not see `EOS-QA-001`. Leak count 0.
- The application issued P-101 at `12000 kg` and `75 kW`, revised it to `14000 kg` and `110 kW`, kept historical receiver acceptance, required a new receiver decision, discovered unassessed structural and electrical candidates, recorded human materiality separately, left `str-dwg` at revision 1 and `potentially_stale`, and left the FEED fingerprint prefix `d718a0888df3d926` unchanged.
- AI, owner, and wrong-discipline approval probes were denied. `approvalGranted` remained false.
- The hosted API returned four bounded answers and did not approve, finalize materiality, or release.

## Ledger and production

Staging ledger count 145, maximum version `20261029100000`, thirteen EOS 2.x versions present once, duplicate count 0, order valid. Migrations were not replayed. No new migration was created and the database schema was not changed. Staging commerce rows for the synthetic qualification tenant are fixture data, not a schema change.

Production ledger count 144, maximum `20261027233000`, EOS 2.x versions 0. Production commit `0c1ec9e06eea59ac089753f3c930f1a599b14648` and deployment `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB` were re-read after the staging deploy. Production was not migrated or redeployed.

## Regression measured in this phase

- `@rtb/release-governance`: 220 passed.
- `@rtb/engineering-review`: 166 passed, 1 skipped.
- `@rtb/engineering-review-persistence` unit gate: 37 passed, 1 skipped.
- Secret scan: PASS, 624 files, 0 findings.
- Engineering OS security closure: 7 passed. Integrated project: 2 passed. Qualified D1 review: 2 passed.
- Interface, change-impact, design-freeze, and lifecycle-intelligence tests: 93 passed.
- `@rtb/platform-core`: 162 passed.
- `pnpm audit --prod`: one known moderate `uuid` advisory through `exceljs` (`GHSA-w5hq-g745-h8pq`). No new blocking advisory. The dependency was not upgraded in this phase.

Engineering formulas and result semantics were not changed. The qualified D1 baseline was not invalidated. The application runtime gained a bounded qualification route so the hosted path could be executed. That route does not calculate engineering results.

## Excluded scope

Process, mechanical, piping, civil, geotechnical, electrical, and I&C deterministic calculations remain not qualified. External solver execution is not globally qualified. Synthetic project `EOS-QA-001` validates runtime, workflow, provenance, security, governance, and traceability. It does not qualify an engineering formula.

## Production promotion

Eligible for the next readiness phase only. This report does not deploy production or apply a production migration. The next phase is `EOS-2.16-CONTROLLED-PRODUCTION-PROMOTION-READINESS`.
