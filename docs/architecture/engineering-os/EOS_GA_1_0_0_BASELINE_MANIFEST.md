# EOS GA 1.0.0 baseline manifest

Path: docs/architecture/engineering-os/EOS_GA_1_0_0_BASELINE_MANIFEST.md

PRODUCT: RTB Engineering OS
VERSION: 1.0.0
GA_RELEASE_COMMIT: 407f5a32b0c1651d28e79cb23442da509d5de956
GA_STATUS: GENERAL_AVAILABILITY
EOS_GA: YES
EOS_GA_RELEASE_DECISION: APPROVED
EOS_GA_READY: YES

This manifest freezes the governance baseline for that release commit. It does not deploy the product, publish packages, or certify a project.

## Fingerprint

GA_BASELINE_FINGERPRINT: sha256:827f54e1f1327fb8f17dc4e7391ea827062eaebb9e033ea69b6f3d56706c5d70
GA_BASELINE_FINGERPRINT_SCOPE: SHA-256 of the ordered lines path plus git blob id, for the ten artefacts below, taken at commit 407f5a32b0c1651d28e79cb23442da509d5de956. This identifier is release governance. It does not replace D1F blob ids or the C7 fingerprint fp:ac109d1f.

1. docs/architecture/engineering-os/EOS_GA_FINAL_READINESS_AND_RELEASE_DECISION.md 216caac4fcb6ca4c9166eb15692e47d7f3acfb7e
2. docs/architecture/engineering-os/EOS_GA_BLOCKER_REGISTRY.md b8b286c00ec02c10afcc6d4e84fb7a91372e896f
3. docs/architecture/engineering-os/EOS_GA_READINESS_RECONCILIATION.md 5e1862177939d5982453c323409f7aa2c9afa92d
4. docs/architecture/engineering-os/EOS_GA_A16D_ENGINEERING_REVIEW_IMPORT_SECURITY_DEBT_RECOVERY.md 8674b0f2c97dac9a26ab94f19e95fa5a68da0750
5. docs/architecture/engineering-os/EOS_D1_STRUCTURAL_PACK_BOUNDED_CLOSEOUT.md fa3eba8594f33d566bbc42818ad1222f9ae94381
6. docs/architecture/engineering-os/EOS_D1_STRUCTURAL_QUALIFIED_REVIEW_BASELINE.md d4fe31267c01d8030d0d2313be0cb849340efa2d
7. docs/architecture/ENGINEERING_OS_V1_PUBLIC_CONTRACTS.md 3419b21330332c5376dce29bb64b68d011bf16d3
8. docs/security/RTB_ENGINEERING_OS_V1_SECURITY_GAP_REGISTER.md 3d6ed0dee6072c3a9f8634e8bcd9e94200a51263
9. docs/release/migration-manifest.json ddac78fda539ecf814e91f34151fef5911a0daca
10. packages/engineering-os/package.json b59c718c6b474a4b201ba6a26485b41d91a89dc1

## References

GA final decision: docs/architecture/engineering-os/EOS_GA_FINAL_READINESS_AND_RELEASE_DECISION.md
GA blocker registry: docs/architecture/engineering-os/EOS_GA_BLOCKER_REGISTRY.md
Security gap register: docs/security/RTB_ENGINEERING_OS_V1_SECURITY_GAP_REGISTER.md
Security baseline: docs/architecture/engineering-os/EOS_GA_1_0_0_SECURITY_BASELINE.md
Operations handoff: docs/architecture/engineering-os/EOS_GA_1_0_0_OPERATIONS_HANDOFF.md
D1 bounded completion: docs/architecture/engineering-os/EOS_D1_STRUCTURAL_PACK_BOUNDED_CLOSEOUT.md
D2 through D9: each discipline track-complete constant remains true. All nine tracks are COMPLETE_BOUNDED. Weighted progress is 100 percent bounded completion.
Qualified structural review: docs/architecture/engineering-os/EOS_D1_STRUCTURAL_QUALIFIED_REVIEW_BASELINE.md and docs/architecture/engineering-os/EOS_D1_QUALIFIED_STRUCTURAL_REVIEWER_ATTESTATION.md
Release ledger: docs/release/migration-manifest.json, checked by pnpm --filter @rtb/release-governance ledger-only. The ledger is migration provenance. It is not a product-GA flag.
Public contracts: docs/architecture/ENGINEERING_OS_V1_PUBLIC_CONTRACTS.md, version 1.0.0, frozen.
Known limitations: recorded in the final decision and restated in the operations handoff.
Dependency posture at this handoff: critical 0, high 0, moderate 1, GHSA-w5hq-g745-h8pq disclosed and not an active GA blocker.
Package architecture: engineering-os does not import @rtb/engineering-review. Scanner and finding contracts live in @rtb/types. The review bridge is implemented by engineering-review and wired by the web composition root.

## Reviewed identifiers preserved

C7 calculated fingerprint: fp:ac109d1f
system-evaluation.ts: 1db11bfc7481dc01fabedb320d44d156f2dc4f37
structural-systems-r3.ts: 27e902bdba212fcc79adf2c27a99b686f80d7192

## Declaration boundary

GA_DECLARATION_REQUIRES_DEPLOYMENT: NO
GA_DECLARATION_REQUIRES_PUBLICATION: NO
PROJECT_CERTIFICATION_TRACK_STATUS: UNSATISFIED
