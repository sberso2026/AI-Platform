# EOS D1 C10 C3 uniaxial human review evidence

Path: docs/architecture/engineering-os/EOS_D1_C10_C3_UNIAXIAL_HUMAN_REVIEW_EVIDENCE.md

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
C10-R3A-PACK-C3-UNIAXIAL
FROZEN_FINGERPRINT:
a32bf2a00b313d9d
CAPABILITY:
D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL

METHOD_REVIEW:
ACCEPTABLE_FOR ZERO-AXIAL REPRESENTATIVE POINT ONLY
UNIT_REVIEW:
PASS - forces are in N, geometry in mm, material stresses in MPa, moment resistance in N.m, curvature in 1/mm, and strain in m/m.
ASSUMPTION_REVIEW:
ACCEPTED_WITH_LIMITATIONS - the frozen representative point has target axial force N = 0 and therefore behaves as a zero-axial flexural point rather than a nonzero axial-flexure interaction case. The declared test profile uses gamma_c = 1.5, gamma_s = 1.15 and alpha_cc = 1.0. These are test-profile values and are not a validated National Annex profile.
APPLICABILITY_REVIEW:
Applicable to the frozen 300 mm by 500 mm rectangular reinforced-concrete section at the explicit zero axial-force target about the major axis.
LIMITATION_REVIEW:
The frozen case does not validate nonzero N-M interaction. The supplemental requirement specifically identifies missing nonzero N-M independent-calculation coverage, and no frozen nonzero axial-force input exists. Member stability is not validated. National-profile conformance is not established.
INDEPENDENT_CALC_REQUIRED:
YES
INDEPENDENT_METHOD:
Reviewer-controlled equivalent rectangular concrete stress-block hand calculation for the frozen zero-axial representative point. Using As = 942 mm2, fyd = 500/1.15 = 434.783 MPa, fcd = 30/1.5 = 20 MPa, lambda = 0.8, eta = 1.0 and the same-section effective depth of approximately 450 mm, axial equilibrium is imposed with C = T.
INDEPENDENT_REFERENCE:
Independent equivalent rectangular N-M hand derivation consistent with the simplified Eurocode 2 rectangular concrete stress-block approach. The independent calculation is used only to check the zero-axial representative point and is not treated as validation of nonzero N-M interaction.
INDEPENDENT_RESULT:
approximately 170325.7
INDEPENDENT_RESULT_UNITS:
N.m
EOS_RESULT:
170283.1004094707 N.m
DIFFERENCE:
approximately 42.6 N.m, independent hand result higher
RELATIVE_DIFFERENCE:
approximately 0.025 percent
TOLERANCE_OR_ACCEPTANCE_BASIS:
The zero-axial representative result shows very close engineering agreement between the independent simplified rectangular stress-block calculation and the EOS 16 x 16 strain-domain/parabola-rectangle calculation. The approximately 0.025 percent difference is consistent with the different numerical/model representations. EOS axial equilibrium residual 21.72 N is also below its stated 50 N tolerance.
FINDINGS:
The zero-axial resistance result is independently supported and no material numerical discrepancy is identified for that point. However, the frozen representative case has N = 0 and therefore does not satisfy the stated supplemental requirement for nonzero N-M independent-calculation coverage. Nonzero axial-flexure interaction remains unvalidated. Member stability and validated National Annex conformity also remain outside this review.
REVIEWER_OUTCOME:
REVIEW_INCOMPLETE

C10_REVIEWED_SUBJECT_COUNT for this record: 1 subject. Cumulative recorded subjects, including the separate C8 cover, C7 crack-width, C8 spacing, C7 long-term, and C8 anchorage records: 6 of 16.
C10_QUALIFIED_HUMAN_REVIEW_SATISFIED: NO
D1F_ENGINEER_REVIEW_SATISFIED: NO
