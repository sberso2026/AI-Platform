# EOS D1 C10 C2 flexure human review evidence

Path: docs/architecture/engineering-os/EOS_D1_C10_C2_FLEXURE_HUMAN_REVIEW_EVIDENCE.md

This file records reviewer-supplied human review evidence for one frozen subject. The values below are copied from the reviewer. They are not inferred, completed, or restated by the repository.

This record does not review any other C10 pack. It does not review D1F. It does not satisfy C10 qualified human review. It does not satisfy D1 qualified Structural review. It does not change the frozen baseline, the calculation method, the frozen inputs, or runtime code.

Reviewer identity, role, qualification, authority basis, and review date were not supplied. Those fields stay blank.

REVIEWER_NAME:
blank
REVIEWER_ROLE:
blank
REVIEWER_QUALIFICATION:
blank
REVIEWER_AUTHORITY_BASIS:
blank
REVIEW_DATE:
blank

PACK:
C10-R3A-PACK-C2-FLEXURE
FROZEN_FINGERPRINT:
7ba624d2658b9f5c
CAPABILITY:
D1E.EU.C2.FLEXURE.UNIAXIAL

METHOD_REVIEW:
ACCEPTABLE_FOR_STATED_SCOPE
UNIT_REVIEW:
PASS - geometry is expressed in mm and mm2, material stresses in MPa, and resistance moment in N.m. The reported resistance magnitude is consistent with the frozen section and reinforcement.
ASSUMPTION_REVIEW:
ACCEPTED_WITH_LIMITATIONS - the frozen case represents rectangular uniaxial pure flexure about the explicit major axis at zero axial force. Declared test partial factors gamma_c = 1.5, gamma_s = 1.15 and alpha_cc = 1.0 are used. These are declared test-profile values and are not nationally validated parameters.
APPLICABILITY_REVIEW:
Applicable to the demonstrated 300 mm by 500 mm rectangular singly reinforced section with three 314 mm2 bottom bars under positive major-axis pure flexure at N = 0.
LIMITATION_REVIEW:
The review does not establish member stability, unsupported geometry capability, validated National Annex conformity, regulatory approval or full project code compliance. The equivalent-rectangular hand model is a reasonableness comparison and is not identical to the EOS fiber-integration formulation.
SUPPLEMENTAL_INDEPENDENT_CALC_REQUIRED:
NO
REVIEW_REASONABLENESS_CHECK:
An equivalent rectangular hand calculation gives approximately 170.326 kN.m. EOS gives 170.1266 kN.m, a difference of approximately 0.199 kN.m or 0.117 percent. The small difference is consistent with the different concrete stress-block and numerical integration representations.
FINDINGS:
No material numerical or methodological discrepancy identified for the frozen pure-flexure case. The EOS result is consistent with the section geometry, reinforcement, material strengths and zero-axial-force condition. National-profile validation and member stability remain outside the stated scope.
HUMAN_CONCLUSION:
The frozen C2 pure-flexure result is technically reasonable for the stated test-profile scope.
REVIEWER_OUTCOME:
ACCEPTED_FOR_STATED_SCOPE

C10_REVIEWED_SUBJECT_COUNT for this record: 1 subject. Cumulative recorded subjects, including the separate C3 uniaxial, C8 cover, C7 crack-width, C8 spacing, C7 long-term, and C8 anchorage records: 7 of 16.
C10_QUALIFIED_HUMAN_REVIEW_SATISFIED: NO
D1F_ENGINEER_REVIEW_SATISFIED: NO
