# EOS GA blocker registry

Path: docs/architecture/engineering-os/EOS_GA_BLOCKER_REGISTRY.md

Active blockers are the current platform GA root causes. Downstream status flags and certification-track limits are recorded separately so they are not counted again. Historical C10 and D1F pending statements are not active.

## Active

BLOCKER_ID: GA-A16D-IMPORT-BOUNDARY
TITLE: Engineering OS imports @rtb/engineering-review
ROOT_CAUSE: ARCHITECTURE_BOUNDARY_VIOLATION
SOURCE_GATE: GA-02 A16D_ENGINEERING_REVIEW_IMPORT_BOUNDARY
CATEGORY: SECURITY
CURRENT_STATE: OPEN
REQUIRED_GA_STATE: both boundary assertions pass without weakening the forbidden-import rule
OWNER_TYPE: INTERNAL_SECURITY_FIX
INTERNAL_OR_EXTERNAL: INTERNAL
DEPENDENCIES: none
CLOSURE_EVIDENCE_REQUIRED: packages/engineering-review/src/migration.test.ts dependency-graph assertion passes, and packages/engineering-review-persistence/src/boundary.test.ts reverse-import assertion passes, after the engineering-os source imports are removed. The first current match is packages/engineering-os/src/connectors/m365/eos-a16d-generic-binary-retrieval.test.ts. Production import sites covered by the same rule must be cleared as well, including the M365 connector service, the engineering-os barrel, the pilot profile, tool-orchestration return validation, and pre-issue review.
STATUS: OPEN
GA_BLOCKING: YES
SEVERITY: P0_GA_BLOCKING

## Derived status, not a second root cause

BLOCKER_ID: GA-SECURITY-DEBT-FLAG
TITLE: GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY
ROOT_CAUSE: GA-A16D-IMPORT-BOUNDARY
CURRENT_STATE: true
STATUS: DERIVED
GA_BLOCKING: YES only as the name of the A16D debt

BLOCKER_ID: GA-READY-FLAG
TITLE: EOS_GA_READY
ROOT_CAUSE: GA-A16D-IMPORT-BOUNDARY
CURRENT_STATE: false
STATUS: DERIVED
GA_BLOCKING: NO as an independent cause

BLOCKER_ID: GA-SECURITY-SUITE-PAIR
TITLE: Two canonical security assertions
ROOT_CAUSE: GA-A16D-IMPORT-BOUNDARY
CURRENT_STATE: 2 failures, 1 root cause
STATUS: SYMPTOM
GA_BLOCKING: YES only through the A16D root

## Not platform GA blockers

BLOCKER_ID: D1G-SOLVER-NOT-CERTIFIED
TITLE: D1G certified solver status
ROOT_CAUSE: certification-claim evidence is unmet
SOURCE_GATE: GA-09
CATEGORY: CERTIFICATION
CURRENT_STATE: NOT_CERTIFIED
REQUIRED_GA_STATE: not required for platform GA
OWNER_TYPE: INTERNAL_VALIDATION for a later certification claim
INTERNAL_OR_EXTERNAL: INTERNAL
STATUS: OPEN_ON_CERTIFICATION_TRACK
GA_BLOCKING: NO
SEVERITY: not P0

BLOCKER_ID: D1L-ELIGIBILITY-UNSATISFIED
TITLE: Project certification eligibility
ROOT_CAUSE: claim evidence and eligibility evaluation remain unsatisfied
SOURCE_GATE: GA-10
CATEGORY: CERTIFICATION
CURRENT_STATE: D1L_R6_CERTIFICATION_ELIGIBILITY_SATISFIED false
REQUIRED_GA_STATE: not required for platform GA
OWNER_TYPE: HUMAN_REVIEW plus INTERNAL_VALIDATION when a project claim is pursued
INTERNAL_OR_EXTERNAL: INTERNAL
D1L_PROJECT_SPECIFIC: YES
D1L_PLATFORM_LEVEL: eligibility runtime only
STATUS: OPEN_ON_CERTIFICATION_TRACK
GA_BLOCKING: NO
SEVERITY: not P0

BLOCKER_ID: DEP-GHSA-W5HQ-G745-H8PQ
TITLE: Moderate uuid advisory through exceljs
ROOT_CAUSE: dependency advisory
SOURCE_GATE: GA-06
CATEGORY: DEPENDENCY_RISK
CURRENT_STATE: 1 moderate, 0 critical, 0 high
REQUIRED_GA_STATE: accepted posture does not require this advisory to be cleared before GA
STATUS: DISCLOSED
GA_BLOCKING: NO
SEVERITY: P2_POST_GA_HARDENING

## History

C10 qualified review and D1F engineer review were pending in older roadmaps. Both are satisfied for their stated scope in the current attestation and D1 closeout. They are not active GA blockers. Bounded product limits, including two-way slab and complete wall design, remain capability limits and are not GA blockers.
