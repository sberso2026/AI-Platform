# EOS GA 1.0.0 security baseline

Path: docs/architecture/engineering-os/EOS_GA_1_0_0_SECURITY_BASELINE.md

PRODUCT: RTB Engineering OS
VERSION: 1.0.0
GA_RELEASE_COMMIT: 407f5a32b0c1651d28e79cb23442da509d5de956
GA_BASELINE_FINGERPRINT: sha256:827f54e1f1327fb8f17dc4e7391ea827062eaebb9e033ea69b6f3d56706c5d70

## Current clean baseline

Recorded in this handoff from a fresh run, not copied as the only evidence:

CANONICAL_SECURITY_SUITE_STATUS: PASS
Engineering-review tests: 164 passed, 1 skipped, including the dependency-graph boundary assertion.
Persistence unit tests: 34 passed, including the reverse-import boundary assertion and the RLS guard tests.
SECURITY_FAILURE_COUNT: 0
SECURITY_ROOT_CAUSE_COUNT: 0
GA_SECURITY_GATE: PASS
RLS_REGRESSION_GATE: PASS
SECRET_SCAN: PASS, 623 files, 0 findings
DEPENDENCY_AUDIT: critical 0, high 0, moderate 1, low 0
ACTIVE_GA_BLOCKER_COUNT: 0
NEW_SECURITY_REGRESSION: NO

## Resolved history

HISTORICAL_A16D_SECURITY_DEBT_PRESERVED: YES
A16D_GA_BLOCKER_STATUS: RESOLVED
OLD_A16D_FAILURE_BASELINE_ACTIVE: NO

The pre-fix failure, engineering-os importing @rtb/engineering-review, remains described in docs/architecture/engineering-os/EOS_GA_A16D_ENGINEERING_REVIEW_IMPORT_SECURITY_DEBT_RECOVERY.md and as a resolved row in docs/architecture/engineering-os/EOS_GA_BLOCKER_REGISTRY.md. That history is not an accepted current failure.

## Post-GA rule

POST_GA_CANONICAL_SECURITY_EXPECTATION: CLEAN_PASS
POST_GA_SECURITY_BASELINE_DEBT_ALLOWANCE: NONE
POST_GA_SECURITY_FAILURE_DEFAULT: RELEASE_BLOCKING_REGRESSION

A later architecture or security failure of the same kind is NEW_SECURITY_REGRESSION. It does not revive the historical A16D baseline. This handoff does not create an exception process. No future exception is pre-authorized.

SECURITY_IMPACT_ASSESSMENT_REQUIRED: YES for a material security-architecture change. That change must rerun the canonical security suite, the GA security gate, RLS regression, secret scan, dependency audit, and release governance.

BOUNDARY_RULE_ACTIVE: YES. packages/engineering-os must not import @rtb/engineering-review. The A16D dependency inversion stays in force: shared contracts in @rtb/types, engineering-os depends on those contracts and an injected bridge, engineering-review supplies the bridge, and the web kernel wires it.

## Residual dependency risk

RESIDUAL_DEPENDENCY_RISK_DISCLOSED: YES
GHSA-w5hq-g745-h8pq remains the one moderate advisory. Accepted posture is 0 critical and 0 high. The advisory is residual risk. It is not zero risk and it is not an active GA blocker.

## What this baseline is not

RLS pass is not a legal-compliance certificate. The security gap register still leaves external penetration test and universal customer SSO as Tier-1 production items, and ISO 27001 and SOC 2 as external assurance. SBOM and signed provenance remain recommended after GA.
