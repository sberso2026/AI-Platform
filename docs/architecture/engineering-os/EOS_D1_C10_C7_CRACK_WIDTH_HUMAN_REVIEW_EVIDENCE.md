# EOS D1 C10 C7 crack-width human review evidence

Path: docs/architecture/engineering-os/EOS_D1_C10_C7_CRACK_WIDTH_HUMAN_REVIEW_EVIDENCE.md

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
C10-R3A-PACK-C7-CRACK-WIDTH
FROZEN_FINGERPRINT:
92dd6720e23d0286
CAPABILITY:
D1E.EU.C7.CRACK_WIDTH

METHOD_REVIEW:
ACCEPTABLE_FOR_STATED_SCOPE
UNIT_REVIEW:
PASS - dimensions are in mm, reinforcement area in mm2, stresses/moduli in MPa, and calculated crack width in mm.
ASSUMPTION_REVIEW:
ACCEPTED_WITH_LIMITATIONS - steel stress sigma_s = 240 MPa, neutral-axis depth x = 180 mm, effective concrete tensile strength fct,eff = 2.9 MPa, bending condition, high-bond reinforcement, and long-term loading state are supplied inputs to this frozen demonstration. This review does not independently derive sigma_s or x from the service load case.
APPLICABILITY_REVIEW:
Applicable to the demonstrated reinforced-concrete beam crack-width calculation using the supplied service steel stress, geometry, reinforcement, material parameters, high-bond reinforcement, bending condition, and long-term state.
LIMITATION_REVIEW:
The frozen C10 row does not bind a calendar code edition or validated National Annex. The 0.3 mm crack-width limit is a supplied/reference-profile limit. The method does not derive the supplied steel stress sigma_s or neutral-axis depth. This review therefore does not establish full EN 1992 or project-specific code compliance.
INDEPENDENT_CALC_REQUIRED:
YES
INDEPENDENT_METHOD:
Reviewer-controlled manual calculation using the frozen input values and the documented direct crack-width equations, independently evaluated outside the EOS calculation engine.
INDEPENDENT_REFERENCE:
Direct crack-width calculation methodology consistent with EN 1992-1-1 crack-control methodology. Project-specific code edition and National Annex conformity are not established by this review.
INDEPENDENT_RESULT:
0.1783042424
INDEPENDENT_RESULT_UNITS:
mm
EOS_RESULT:
0.1783042424 mm
DIFFERENCE:
0.000000 mm
TOLERANCE_OR_ACCEPTANCE_BASIS:
Exact numerical agreement obtained for the documented deterministic calculation using the same frozen engineering inputs. The independent calculation reproduced effective tension height 106.667 mm, effective tension area 32000 mm2, reinforcement ratio 0.05, maximum crack spacing 170 mm, mean strain difference 0.0010488485, and crack width 0.178304 mm.
FINDINGS:
No numerical calculation discrepancy identified. Steel stress sigma_s = 240 MPa and neutral-axis depth x = 180 mm are supplied rather than independently derived in this review. The frozen C10 row has no bound calendar code edition or validated National Annex, therefore full code-conformance is outside this review outcome.
REVIEWER_OUTCOME:
ACCEPTED_FOR_STATED_SCOPE

C10_REVIEWED_SUBJECT_COUNT for this record: 1 subject. Cumulative recorded subjects, including the separate C8 cover record: 2 of 16.
C10_QUALIFIED_HUMAN_REVIEW_SATISFIED: YES
D1F_ENGINEER_REVIEW_SATISFIED: YES
