# EOS D1 C10 C5 shear human review evidence

Path: docs/architecture/engineering-os/EOS_D1_C10_C5_SHEAR_HUMAN_REVIEW_EVIDENCE.md

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
C10-R3A-PACK-C5-SHEAR
FROZEN_FINGERPRINT:
37a85c4c722cd6c5
CAPABILITY:
D1E.EU.C5.SHEAR

METHOD_REVIEW:
ACCEPTABLE_FOR_STATED_SCOPE
UNIT_REVIEW:
PASS - effective depth and web width are in mm, concrete strength in MPa, reinforcement ratio and coefficients are dimensionless, demand and resistance are in N.
ASSUMPTION_REVIEW:
ACCEPTED_WITH_LIMITATIONS - the frozen case represents shear resistance without design transverse reinforcement at zero axial force. Effective depth d = 372 mm, web width bw = 250 mm, longitudinal reinforcement ratio rho_l = 0.0061, fck = 25 MPa, cRdC = 0.12 and vMinCoefficient = 0.035 are explicitly supplied reference-profile inputs. The coefficients are reference-benchmark assumptions and are not validated National Annex parameters.
APPLICABILITY_REVIEW:
Applicable to the demonstrated first-generation reference-profile shear resistance case without transverse reinforcement and at zero axial force.
LIMITATION_REVIEW:
The review does not establish National Annex validation, nonzero axial-force shear behaviour, design with transverse shear reinforcement, second-generation shear rules or full project code compliance. The worksheet exposes two published resistance anchors, but the displayed frozen input set independently reproduces only the first resistance. The source-case inputs corresponding to the second 62517 N benchmark are not separately exposed in this review worksheet.
SUPPLEMENTAL_INDEPENDENT_CALC_REQUIRED:
NO
REVIEW_NUMERICAL_REPRODUCTION:
For the displayed case:
k = 1 + sqrt(200 / 372) = approximately 1.7332356.
Using:
V_Rd,c = cRdC × k × (100 × rho_l × fck)^(1/3) × bw × d
with:
cRdC = 0.12
rho_l = 0.0061
fck = 25 MPa
bw = 250 mm
d = 372 mm
gives:
V_Rd,c = approximately 47967.28 N.
EOS gives:
47967.2775627201 N.
Demand utilization:
40000 / 47967.2775627201 = 0.8339018187,
matching the frozen EOS utilization.
PUBLISHED_ANCHOR_REVIEW:
First published anchor = 47800 N.
EOS first resistance = 47967.2775627201 N.
Difference = approximately +167.28 N, or +0.35 percent, within the stated 500 N tolerance.
Second published anchor = 62517 N.
EOS second resistance = 62517.29743481617 N.
Difference = approximately +0.30 N, or +0.00048 percent, within the stated 1 N tolerance.
The second resistance is treated as a published benchmark anchor. It is not interpreted as the minimum-resistance branch of the displayed first case because the displayed inputs do not reproduce 62517 N through the stated vMin relationship.
FINDINGS:
No material numerical discrepancy identified for the displayed shear-resistance calculation. The EOS first resistance and utilization are independently reproducible from the frozen inputs. Both EOS resistance values agree with their stated published numeric anchors within the frozen tolerances. However, the source-case inputs behind the second 62517 N published anchor are not separately exposed in this worksheet, so that value is accepted as a published benchmark comparison rather than independently derived from the displayed case. National NDP validation, nonzero axial force and transverse-reinforcement design remain outside scope.
HUMAN_CONCLUSION:
The frozen C5 shear result is technically reasonable and numerically supported for the stated zero-axial, no-transverse-reinforcement reference-profile scope.
REVIEWER_OUTCOME:
ACCEPTED_FOR_STATED_SCOPE

C10_REVIEWED_SUBJECT_COUNT for this record: 1 subject. Cumulative recorded subjects, including the separate C2 flexure, C3 uniaxial, C4 biaxial, C6 nominal-curvature, C8 cover, C7 crack-width, C8 spacing, C7 long-term, and C8 anchorage records: 10 of 16.
C10_QUALIFIED_HUMAN_REVIEW_SATISFIED: YES
D1F_ENGINEER_REVIEW_SATISFIED: YES
