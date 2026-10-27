# EOS D1 C10 C4 biaxial human review evidence

Path: docs/architecture/engineering-os/EOS_D1_C10_C4_BIAXIAL_HUMAN_REVIEW_EVIDENCE.md

This file records reviewer-supplied human review evidence for one frozen subject. The values below are copied from the reviewer. They are not inferred, completed, or restated by the repository.

This record does not review any other C10 pack. It does not review D1F. This subject record keeps its original technical outcome. The qualified-review gate for the current D1 set is docs/architecture/engineering-os/EOS_D1_QUALIFIED_STRUCTURAL_REVIEWER_ATTESTATION.md. It does not change the frozen baseline, the calculation method, the frozen inputs, or runtime code.

Reviewer identity, role, qualification, authority basis, and review date were supplied by the human reviewer for the RTB Engineering OS D1 Structural review scope. They were not inferred. Technical findings, limitations, fingerprints, and the review outcome in this record are unchanged. The qualified-review attestation is docs/architecture/engineering-os/EOS_D1_QUALIFIED_STRUCTURAL_REVIEWER_ATTESTATION.md.

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

PACK:
C10-R3A-PACK-C4-BIAXIAL
FROZEN_FINGERPRINT:
fdbdb9b1baa68abe
CAPABILITY:
D1E.EU.C4.BIAXIAL.PMM

METHOD_REVIEW:
ACCEPTABLE_FOR_STATED_SCOPE
UNIT_REVIEW:
PASS - axial force is expressed in N, geometry in mm, moment direction in radians, and resultant moment magnitude in N.m.
ASSUMPTION_REVIEW:
ACCEPTED_WITH_LIMITATIONS - the frozen representative case evaluates a 300 mm by 500 mm rectangular reinforced-concrete section at target axial force N = 0 and moment direction theta = pi/4. Declared test partial factors gamma_c = 1.5, gamma_s = 1.15 and alpha_cc = 1.0 are used. These are declared test-profile parameters and are not validated National Annex parameters.
APPLICABILITY_REVIEW:
Applicable to the demonstrated rectangular biaxial section-interaction point at the supplied axial target and moment direction using the frozen geometry, reinforcement, material model and declared test profile.
LIMITATION_REVIEW:
This review covers only the frozen biaxial section point at N = 0 and theta = pi/4. Member stability, biaxial second-order effects, unsupported geometry, validated National Annex conformity and complete interaction-surface coverage are outside scope. Uniaxial reduction coverage is explicitly missing. The ledger publishes only resultant moment magnitude and does not expose separate Mx and My values for reviewer inspection.
SUPPLEMENTAL_INDEPENDENT_CALC_REQUIRED:
NO
NUMERICAL_REASONABLENESS_REVIEW:
The EOS resultant moment magnitude is 117488.59788861554 N.m. No obvious inconsistency is identified from the frozen geometry, reinforcement, material properties, solver description and declared interaction direction. The result is accepted as a reasonable frozen biaxial section result for the stated scope, but it is not independently numerically reproduced in this human review.
FINDINGS:
No material methodological inconsistency identified for the frozen diagonal biaxial case. The reported resultant magnitude is accepted for the stated section-level scope. However, separate Mx and My values are not exposed in the ledger, uniaxial-reduction coverage is missing, and the frozen evidence represents only partial interaction-domain coverage. Member stability, second-order biaxial effects and validated National Annex conformity remain outside scope.
HUMAN_CONCLUSION:
The frozen C4 biaxial section result is technically reasonable for the stated single-point test-profile scope. This conclusion does not validate the complete P-M-M interaction surface.
REVIEWER_OUTCOME:
ACCEPTED_FOR_STATED_SCOPE

C10_REVIEWED_SUBJECT_COUNT for this record: 1 subject. Cumulative recorded subjects, including the separate C2 flexure, C3 uniaxial, C8 cover, C7 crack-width, C8 spacing, C7 long-term, and C8 anchorage records: 8 of 16.
C10_QUALIFIED_HUMAN_REVIEW_SATISFIED: YES
D1F_ENGINEER_REVIEW_SATISFIED: YES
