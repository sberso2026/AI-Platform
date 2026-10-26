# EOS D1 C10 C5 torsion human review evidence

Path: docs/architecture/engineering-os/EOS_D1_C10_C5_TORSION_HUMAN_REVIEW_EVIDENCE.md

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
C10-R3A-PACK-C5-TORSION
FROZEN_FINGERPRINT:
e3e353e9a5d8b271
CAPABILITY:
D1E.EU.C5.TORSION

METHOD_REVIEW:
ACCEPTABLE_FOR_STATED_SCOPE
UNIT_REVIEW:
PASS - section geometry is expressed in mm, concrete and reinforcement strengths in MPa, reinforcement requirements in mm2/mm and mm2 as applicable, torsional demand and resistance in N.m, and interaction ratios are dimensionless.
ASSUMPTION_REVIEW:
ACCEPTED_WITH_LIMITATIONS - the frozen case represents a solid 400 mm by 600 mm rectangular section under torsion with zero accompanying shear. cot(theta) = 2 is explicitly supplied. alphaCc = 1, gammaC = 1.5 and gammaS = 1.15 are supplied profile parameters. The equivalent thin-wall thickness is based on A/u. The case is non-prestressed.
APPLICABILITY_REVIEW:
Applicable to the demonstrated solid rectangular torsion case using the frozen equivalent closed-form strut model, supplied cot(theta), material strengths, partial factors, transverse reinforcement and longitudinal reinforcement.
LIMITATION_REVIEW:
This review does not establish general combined V-T-N-M interaction, wall torsion, slab torsion, nonrectangular-section torsion, validated National Annex conformity, second-generation torsion rules, or complete member-design conformity. The frozen representative case has zero accompanying shear and therefore does not exercise general shear-torsion interaction.
SUPPLEMENTAL_INDEPENDENT_CALC_REQUIRED:
NO
REVIEW_NUMERICAL_REPRODUCTION:
Section area:
A = 400 x 600 = 240000 mm2.
Section perimeter:
u = 2(400 + 600) = 2000 mm.
Equivalent wall thickness:
teff = A/u = 120 mm.
Equivalent tube centreline dimensions:
280 mm x 480 mm.
Enclosed area:
Ak = 280 x 480 = 134400 mm2.
Equivalent tube perimeter:
uk = 2(280 + 480) = 1520 mm.
Design concrete strength:
fcd = 30/1.5 = 20 MPa.
Design reinforcement strength:
fyd = fywd = 500/1.15 = 434.7826087 MPa.
Frozen concrete reduction factor:
nu = 0.528.
Maximum torsional resistance:
TRd,max =
2 x Ak x teff x nu x fcd /
(cot(theta) + tan(theta))
= 136249.344 N.m.
EOS:
136249.344 N.m.
Difference:
0 N.m at reported precision.
For TEd = 50000 N.m:
TEd/TRd,max =
50000/136249.344
= 0.3669742439.
EOS:
0.3669742439273689.
Transverse reinforcement requirement:
Asw/s =
TEd /
(2 x Ak x fywd x cot(theta))
= 0.2139136905 mm2/mm.
EOS:
0.21391369047619047 mm2/mm.
Provided transverse reinforcement:
2 mm2/mm.
Longitudinal reinforcement requirement:
Asl =
TEd x uk x cot(theta) /
(2 x Ak x fyd)
= 1300.595238 mm2.
EOS:
1300.595238095238 mm2.
Provided longitudinal reinforcement:
4000 mm2.
FINDINGS:
No material numerical or methodological discrepancy identified for the frozen solid-rectangular torsion case. The maximum torsional resistance, strut interaction ratio, transverse reinforcement requirement and longitudinal reinforcement requirement are independently reproduced from the frozen inputs and match the EOS values at reported precision.
The frozen torsion demand of 50000 N.m corresponds to a strut interaction ratio of approximately 0.367 against the calculated maximum torsional resistance of 136249.344 N.m. The provided transverse and longitudinal reinforcement exceed the respective frozen calculated requirements.
The representative case has zero accompanying shear, therefore it does not validate general shear-torsion interaction. General V-T-N-M interaction, wall torsion, slab torsion, nonrectangular geometry, validated National Annex conformity and complete member design remain outside scope.
HUMAN_CONCLUSION:
The frozen C5 torsion calculation is technically reasonable and numerically reproducible for the stated solid rectangular, zero-accompanying-shear reference-profile scope.
REVIEWER_OUTCOME:
ACCEPTED_FOR_STATED_SCOPE

C10_REVIEWED_SUBJECT_COUNT for this record: 1 subject. Cumulative recorded subjects, including the separate C2 flexure, C3 uniaxial, C4 biaxial, C5 shear, C5 punching, C6 nominal-curvature, C8 cover, C7 crack-width, C8 spacing, C7 long-term, and C8 anchorage records: 12 of 16.
C10_QUALIFIED_HUMAN_REVIEW_SATISFIED: NO
D1F_ENGINEER_REVIEW_SATISFIED: NO
