# EOS D1 C10 C5 punching human review evidence

Path: docs/architecture/engineering-os/EOS_D1_C10_C5_PUNCHING_HUMAN_REVIEW_EVIDENCE.md

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
C10-R3A-PACK-C5-PUNCHING
FROZEN_FINGERPRINT:
1cb263b5b0eab33b
CAPABILITY:
D1E.EU.C5.PUNCHING

METHOD_REVIEW:
ACCEPTABLE_FOR_STATED_SCOPE
UNIT_REVIEW:
PASS - loaded-area dimensions, effective depth and control perimeter are expressed in mm, punching force in N, reinforcement ratios and beta are dimensionless, and punching stress/resistance is expressed in MPa.
ASSUMPTION_REVIEW:
ACCEPTED_WITH_LIMITATIONS - the frozen case represents an interior 500 mm by 500 mm loaded area with effective depth 164 mm, punching force 705000 N, explicit beta = 1.15, no opening, and reinforcement ratios rhoX = 0.0086 and rhoY = 0.0087. The beta value is explicitly supplied and no default National Annex value is inferred.
APPLICABILITY_REVIEW:
Applicable to the demonstrated interior rectangular loaded-area punching-resistance calculation with no opening and an explicitly supplied eccentricity factor beta.
LIMITATION_REVIEW:
This review does not establish edge-column, corner-column, opening, punching-reinforcement, validated National Annex, second-generation, or complete project punching-design conformity. Only the frozen interior concrete punching-resistance case is reviewed.
SUPPLEMENTAL_INDEPENDENT_CALC_REQUIRED:
NO
REVIEW_NUMERICAL_REPRODUCTION:
Control perimeter:
u1 = 2(c1 + c2) + 4*pi*d
= 2(500 + 500) + 4*pi*164
= approximately 4060.8848 mm.
EOS:
4060.884780754904 mm.
Effective reinforcement ratio:
rho_l = sqrt(0.0086*0.0087)
= approximately 0.00864986.
Size factor:
k = min(2, 1 + sqrt(200/164))
= 2.0.
Concrete punching resistance:
vRd,c = 0.12*2*(100*0.00864986*25)^(1/3)
= approximately 0.66864284 MPa.
EOS:
0.668642835097852 MPa.
Published resistance anchor:
0.67 MPa.
Difference:
approximately 0.00136 MPa, about 0.20 percent.
Demand punching stress:
vEd = beta*VEd/(u1*d)
= 1.15*705000/(4060.8848*164)
= approximately 1.21737 MPa.
Demand-to-resistance ratio:
vEd/vRd,c = approximately 1.821.
FINDINGS:
No material numerical discrepancy identified. The EOS control perimeter and concrete punching resistance are independently reproducible from the frozen inputs and agree with the published benchmark.
However, for the representative demand, vEd approximately 1.217 MPa exceeds vRd,c approximately 0.669 MPa. The frozen concrete-only case therefore does not have sufficient punching resistance for the stated demand if those values are directly compared.
Ledger evidence status PASS is an evidence-validation state and must not be interpreted as an engineering punching-capacity pass.
Edge and corner cases, openings, punching reinforcement, National Annex validation and complete punching design remain outside scope.
HUMAN_CONCLUSION:
The frozen C5 punching calculation method and numerical result are technically reasonable and reproducible for the stated interior reference case. The calculation capability is accepted, while the representative demand exceeds the calculated concrete punching resistance and therefore must not be represented as a compliant punching-capacity result.
REVIEWER_OUTCOME:
ACCEPTED_FOR_STATED_SCOPE

C10_REVIEWED_SUBJECT_COUNT for this record: 1 subject. Cumulative recorded subjects, including the separate C2 flexure, C3 uniaxial, C4 biaxial, C5 shear, C6 nominal-curvature, C8 cover, C7 crack-width, C8 spacing, C7 long-term, and C8 anchorage records: 11 of 16.
C10_QUALIFIED_HUMAN_REVIEW_SATISFIED: NO
D1F_ENGINEER_REVIEW_SATISFIED: NO
