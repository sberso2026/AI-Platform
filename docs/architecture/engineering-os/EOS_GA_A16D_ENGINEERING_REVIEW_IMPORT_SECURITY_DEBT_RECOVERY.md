# EOS GA A16D engineering-review import security debt recovery

Path: docs/architecture/engineering-os/EOS_GA_A16D_ENGINEERING_REVIEW_IMPORT_SECURITY_DEBT_RECOVERY.md

## Original GA blocker

The readiness reconciliation found one platform GA root cause: engineering-os source imported @rtb/engineering-review. That architecture-boundary violation was the named GA security debt. EOS_GA_READY was the aggregate of that debt, not a second root cause. D1G solver qualification and D1L project eligibility stayed on the certification track and were not this fix.

## Original security failures

Pre-fix canonical suite status was a raw failure on the known baseline. Failure count was 2. Root-cause count was 1. The assertions were the dependency-graph test in packages/engineering-review/src/migration.test.ts and the reverse-import test in packages/engineering-review-persistence/src/boundary.test.ts. Both stopped on the first match, packages/engineering-os/src/connectors/m365/eos-a16d-generic-binary-retrieval.test.ts.

## Architecture rule

Engineering-os, project intelligence, platform-core, platform-kernel, and platform-intelligence must not import @rtb/engineering-review. The review package itself must keep an empty runtime dependency map. The boundary matchers were not changed, skipped, or allow-listed.

## Forbidden imports before the fix

Production imports: the M365 connector service, the engineering-os composition root, the pilot profile, tool-orchestration return validation, and the pre-issue review service. Type-only import: pre-issue review types. Test import: the A16D retrieval test. Count of those imports: 7. Production: 5. Test: 1. Type-only: 1.

## Root cause

ARCHITECTURE_BOUNDARY_VIOLATION. The symbols resolved. This was not a missing export, a package-resolution failure, or a stale test alone. The same forbidden package was used for malware scanning, the EICAR fixture, and the reused review engine.

## Chosen remediation

Shared scanner and finding-category contracts moved to @rtb/types. Engineering-os imports those contracts from @rtb/types. Engineering-review re-exports the same modules through a relative source reference and keeps its runtime dependency map empty, which its package-boundary test requires. Pre-issue review no longer constructs the review engine itself. It calls an injected bridge. The bridge implementation remains in engineering-review and is passed in by the web composition root. The pre-issue consumer tests moved with that bridge so engineering-os source does not import the review package. The A16D retrieval test still covers infected-content rejection, tenant and workspace denial, and metadata-only retrieval. It now takes the EICAR fixture from @rtb/types.

## Dependency direction

Before: engineering-os depended on @rtb/engineering-review. After: engineering-os depends on @rtb/types and does not depend on @rtb/engineering-review. Engineering-review does not gain a package dependency. No new package cycle was introduced. The pre-existing execution-host and model-interoperability cycle is unchanged.

## Moved shared abstractions

Review malware scan and the review error used by that scan now live in @rtb/types and are re-exported by engineering-review. The finding-category list lives in @rtb/types and is re-exported by the review finding module. Review-engine behavior was not copied into engineering-os. Dependency inversion is the pre-issue bridge. Orchestration of the review engine was not rewritten; the same functions run behind the bridge.

## Functional results

A16D retrieval tests passed. Engineering-review tests passed, including malware scan, package boundary, dependency graph, and the moved pre-issue consumer tests: 164 passed, 1 skipped. Engineering-os typecheck passed. Web typecheck passed. Persistence unit tests passed: 34 passed, including the reverse-import assertion and the RLS guard files.

## Boundary results

Pre-fix boundary failure count: 2. Post-fix boundary failure count: 0. Forbidden engineering-os import count after the fix: 0. Forbidden type-only import count after the fix: 0. The boundary rule was not weakened. No security test was removed or skipped. No allow-list exception was added.

## Security suite

Post-fix canonical security suite status: PASS. Failure count: 0. Root-cause count: 0. Security regression gate: PASS. GA security gate: PASS. The accepted development baseline is now also acceptable for GA because the debt it tracked is gone. RLS regression gate: PASS. Secret scan: PASS, 623 files, 0 findings.

## Review impact

D1F reviewed blobs are unchanged: system-evaluation.ts remains 1db11bfc7481dc01fabedb320d44d156f2dc4f37 and structural-systems-r3.ts remains 27e902bdba212fcc79adf2c27a99b686f80d7192. The C7 calculated fingerprint fp:ac109d1f is unchanged. Calculation formulas, database schema, and discipline completion were not changed. Reviewed engineering behavior was not changed. Package composition and the pre-issue constructor now require the review bridge. That is an architecture and API change, not a calculation change.

## GA blocker status

A16D_GA_BLOCKER_STATUS: RESOLVED. Recomputed EOS_GA_READY: YES. EOS_GA remains NO until the final readiness and release decision. D1G certification is still not required for platform GA. D1L eligibility is still not a platform GA blocker. External certification is still not required for platform GA. Dependency audit remains 0 critical, 0 high, 1 moderate, and that moderate finding is not a GA blocker.
