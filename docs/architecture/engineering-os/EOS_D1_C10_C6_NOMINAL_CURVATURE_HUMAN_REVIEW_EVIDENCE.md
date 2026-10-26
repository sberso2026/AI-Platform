# EOS D1 C10 C6 nominal curvature human review evidence

Path: docs/architecture/engineering-os/EOS_D1_C10_C6_NOMINAL_CURVATURE_HUMAN_REVIEW_EVIDENCE.md

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
C10-R3A-PACK-C6-NOMINAL-CURVATURE
FROZEN_FINGERPRINT:
1f8c8a3dfb56fb30
CAPABILITY:
D1E.EU.C6.NOMINAL_CURVATURE

METHOD_REVIEW:
ACCEPTABLE_FOR_STATED_SCOPE
UNIT_REVIEW:
PASS - geometry is expressed in mm, axial force in N, first-order and second-order moments in N.mm, material stresses in MPa, and curvature in 1/mm. Unit handling is consistent with the frozen method.
ASSUMPTION_REVIEW:
ACCEPTED_WITH_LIMITATIONS - the frozen case represents an isolated prismatic rectangular member under uniaxial compression about the major axis. Effective length l0 = 3000 mm, effective creep ratio phiEf = 1 and curvature-distribution factor c = 10 are explicitly supplied. Effective length is not inferred. The method does not apply a slenderness-neglect rule and does not perform biaxial second-order analysis.
APPLICABILITY_REVIEW:
Applicable to the demonstrated isolated rectangular uniaxial compression case using the supplied effective length, axial force, first-order end moments, reinforcement, concrete properties, effective creep ratio and nominal-curvature profile parameters.
LIMITATION_REVIEW:
The review does not establish full member-design conformity, biaxial second-order behaviour, C6-to-C4 interaction, validated National Annex conformity or automatic effective-length determination. The effective creep ratio phiEf is supplied rather than calculated. The frozen worksheet does not separately expose a geometric-imperfection eccentricity, therefore this review does not establish whether required imperfection effects are already incorporated in the supplied first-order moments.
SUPPLEMENTAL_INDEPENDENT_CALC_REQUIRED:
NO
REVIEW_NUMERICAL_REPRODUCTION:
Using the frozen inputs and nominal-curvature closed-form method, the reviewer reproduces:
- equivalent first-order moment M0e = 16,000,000 N.mm
- Kphi approximately 1.361436
- Kr = 1.0 for the frozen case
- nominal curvature approximately 1.46155E-5 1/mm
- second-order eccentricity e2 approximately 13.15397 mm
- second-order moment M2 approximately 6,576,985.195 N.mm
- total design moment approximately 22,576,985.195 N.mm
EOS_RESULT:
22,576,985.195142463 N.mm
REVIEW_DIFFERENCE:
Effectively zero at the reported calculation precision.
FINDINGS:
No material numerical discrepancy identified. The EOS total design moment is reproduced from the frozen nominal-curvature inputs and stated closed-form method. The method correctly increases the equivalent first-order moment by the calculated second-order contribution for the stated fixture. Effective length and phiEf are supplied inputs. Geometric-imperfection treatment is not separately exposed by the frozen worksheet. Biaxial second-order effects, slenderness-neglect logic, validated National Annex conformity and full member-design conformity remain outside scope.
HUMAN_CONCLUSION:
The frozen C6 nominal-curvature calculation is technically reasonable and numerically reproducible for the stated isolated uniaxial reference-profile scope.
REVIEWER_OUTCOME:
ACCEPTED_FOR_STATED_SCOPE

C10_REVIEWED_SUBJECT_COUNT for this record: 1 subject. Cumulative recorded subjects, including the separate C2 flexure, C3 uniaxial, C4 biaxial, C8 cover, C7 crack-width, C8 spacing, C7 long-term, and C8 anchorage records: 9 of 16.
C10_QUALIFIED_HUMAN_REVIEW_SATISFIED: NO
D1F_ENGINEER_REVIEW_SATISFIED: NO
