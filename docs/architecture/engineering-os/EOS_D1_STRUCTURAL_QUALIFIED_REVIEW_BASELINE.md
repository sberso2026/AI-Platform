# EOS D1 structural qualified review baseline

Path: docs/architecture/engineering-os/EOS_D1_STRUCTURAL_QUALIFIED_REVIEW_BASELINE.md

This is the current qualified-review baseline for the bounded D1 Structural pack. It does not rewrite docs/architecture/engineering-os/EOS_D1_STRUCTURAL_REVIEW_BASELINE.md. That historical manifest stays the original freeze. C7 calculated mode was added after that freeze and was separately re-reviewed. This baseline records the evidence set that the qualified review and this closeout accept.

HISTORICAL_ORIGINAL_REVIEW_BASELINE:
docs/architecture/engineering-os/EOS_D1_STRUCTURAL_REVIEW_BASELINE.md
HISTORICAL_FROZEN_RUNTIME_BASELINE:
ef416f1f4ec92e1e97e97096ae625f8d61ca6265
HISTORICAL_FROZEN_BASELINE_FINGERPRINT:
f7c9b3059e9b50cf0a467249324e93c801fda34a
HISTORICAL_FROZEN_BASELINE_PRESERVED:
YES
CURRENT_CLOSING_REPOSITORY_REVISION:
f6170d2a9806d92be3c1581d1375e3987d914d80
CURRENT_QUALIFIED_REVIEW_BASELINE_INCLUDES_C7_RECOVERY:
YES
C7_CALCULATED_REVISION_REVIEWED:
YES
UNREVIEWED_MATERIAL_CHANGE_AFTER_QUALIFIED_REVIEW:
NO

## Reviewer

QUALIFIED_REVIEWER_ATTESTATION:
docs/architecture/engineering-os/EOS_D1_QUALIFIED_STRUCTURAL_REVIEWER_ATTESTATION.md
REVIEWER_NAME:
Silvestre Berso
REVIEWER_ROLE:
Structural Engineer / Qualified Structural Reviewer
REVIEWER_QUALIFICATION:
Master of Engineering, Kogakuin University; ASCE; ASEP; PICE
REVIEWER_AUTHORITY_BASIS:
Qualified Structural Engineer and designated human engineering reviewer for the RTB Engineering OS D1 Structural review scope
REVIEW_DATE:
2026-10-27
ASCE_ASEP_PICE_RECORDED_AS_SUPPLIED_TEXT:
YES
LICENCE_NUMBER_RECORDED:
NO
STATUTORY_REGISTRATION_INFERRED:
NO

## Current C10 set

C10_TOTAL_PACK_COUNT: 16
C10_REVIEW_RECORD_COUNT: 16
ACCEPTED_FOR_STATED_SCOPE_COUNT: 16
REVIEW_INCOMPLETE_COUNT: 0
ALL_C10_TECHNICAL_HUMAN_REVIEW_OUTCOMES_ACCEPTED: YES
C10_QUALIFIED_HUMAN_REVIEW_SATISFIED: YES
INVENTORY: docs/architecture/engineering-os/EOS_D1_C10_HUMAN_REVIEW_INVENTORY.md

C2-FLEXURE fingerprint 7ba624d2658b9f5c, ACCEPTED_FOR_STATED_SCOPE.
C3-UNIAXIAL historical fingerprint a32bf2a00b313d9d remains REVIEW_INCOMPLETE and was not rewritten. Current supplemental evidence docs/architecture/engineering-os/EOS_D1_C10_C3_UNIAXIAL_NONZERO_NM_HUMAN_REREVIEW_EVIDENCE.md, supplemental fingerprint fp:48f5b4c8, ACCEPTED_FOR_STATED_SCOPE. Complete interaction surface, member stability, National Annex validation, and regulatory approval are not established.
C4-BIAXIAL fingerprint fdbdb9b1baa68abe, ACCEPTED_FOR_STATED_SCOPE.
C5-SHEAR fingerprint 37a85c4c722cd6c5, ACCEPTED_FOR_STATED_SCOPE.
C5-PUNCHING fingerprint 1cb263b5b0eab33b, ACCEPTED_FOR_STATED_SCOPE.
C5-TORSION fingerprint e3e353e9a5d8b271, ACCEPTED_FOR_STATED_SCOPE.
C6-NOMINAL-CURVATURE fingerprint 1f8c8a3dfb56fb30, ACCEPTED_FOR_STATED_SCOPE. Effective length and phiEf are supplied. Biaxial second-order integration is outside scope.
C7-CRACK-WIDTH fingerprint 92dd6720e23d0286, ACCEPTED_FOR_STATED_SCOPE.
C7-LONG-TERM historical fingerprint 9b2c325cdad7b78d remains REVIEW_INCOMPLETE, independent result BLANK, and was not rewritten. Current calculated fingerprint fp:ac109d1f, evidence docs/architecture/engineering-os/EOS_D1_C10_C7_LONG_TERM_CALCULATED_HUMAN_REREVIEW_EVIDENCE.md, ACCEPTED_FOR_STATED_SCOPE for cement class N only. Temperature adjustment, phiEf, cement classes S and R, National Annex validation, and regulatory approval are not established. Finite-age creep where the unrecovered size-time cap could bind remains fail-closed.
C8-COVER fingerprint 291c17190f884252, ACCEPTED_FOR_STATED_SCOPE.
C8-SPACING fingerprint 98350cdff747d872, ACCEPTED_FOR_STATED_SCOPE.
C8-ANCHORAGE fingerprint 02cfe936c1d0413c, ACCEPTED_FOR_STATED_SCOPE.
C9-BEAM fingerprint dd03cfddf5076e34, ACCEPTED_FOR_STATED_SCOPE. The accepted result is a routing identity, not beam resistance.
C9-COLUMN fingerprint c11591957014c540, ACCEPTED_FOR_STATED_SCOPE. MEMBER_UNDETERMINED is not an engineering failure.
C9-SLAB fingerprint 3e34916f0a9e44be, ACCEPTED_FOR_STATED_SCOPE. Complete two-way slab analysis and design are outside this review.
C9-WALL fingerprint 826079ee068c5761, ACCEPTED_FOR_STATED_SCOPE. Complete wall design, wall shear, wall second-order behavior, boundary-element design, and seismic wall detailing are not implemented.

## D1F

EVIDENCE: docs/architecture/engineering-os/EOS_D1F_QUALIFIED_STRUCTURAL_ENGINEER_HUMAN_REVIEW_EVIDENCE.md
system-evaluation.ts blob: 1db11bfc7481dc01fabedb320d44d156f2dc4f37
structural-systems-r3.ts blob: 27e902bdba212fcc79adf2c27a99b686f80d7192
D1F_CURRENT_REVIEW_STATUS: ACCEPTED_FOR_STATED_SCOPE
D1F_HUMAN_REVIEW_OUTCOME_RECORDED: YES
D1F_ENGINEER_REVIEW_SATISFIED: YES
D1F_MATERIAL_DEFECT_FOUND: NO

## Post-freeze change that was re-reviewed

The original freeze did not contain calculated C7 creep and shrinkage. That capability was added later, fingerprinted fp:ac109d1f, and accepted by the calculated-mode human re-review for class N only. It does not inherit the historical explicit-state review. No other material engineering change after the qualified review is identified. Structural-systems D1G, D1H, D1I, D1J, and D1K modules do not import the calculated C7 engine.

ACCEPTED_FOR_STATED_SCOPE is not engineering approval, certification, regulatory approval, or project-specific design approval. This baseline is not full code conformance and is not National Annex validation.
