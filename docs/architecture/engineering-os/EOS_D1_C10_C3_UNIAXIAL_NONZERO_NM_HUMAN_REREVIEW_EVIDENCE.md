# EOS D1 C10 C3 uniaxial nonzero N-M human re-review evidence

Path: docs/architecture/engineering-os/EOS_D1_C10_C3_UNIAXIAL_NONZERO_NM_HUMAN_REREVIEW_EVIDENCE.md

This file records reviewer-supplied human re-review evidence for the supplemental nonzero axial-flexure validation. The values below are copied from the reviewer. They are not inferred, completed, or restated by the repository.

This record does not rewrite docs/architecture/engineering-os/EOS_D1_C10_C3_UNIAXIAL_HUMAN_REVIEW_EVIDENCE.md. That historical record remains REVIEW_INCOMPLETE for the original frozen zero-axial case. This record does not review any other C10 pack. It does not review D1F. This subject record keeps its original technical outcome. The qualified-review gate for the current D1 set is docs/architecture/engineering-os/EOS_D1_QUALIFIED_STRUCTURAL_REVIEWER_ATTESTATION.md. It does not change the frozen baseline, the calculation method, the frozen inputs, or runtime code.

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
C10-R3A-PACK-C3-UNIAXIAL
ORIGINAL_FROZEN_FINGERPRINT:
a32bf2a00b313d9d
CAPABILITY:
D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL
SUPPLEMENTAL_VALIDATION_EVIDENCE:
docs/architecture/engineering-os/EOS_D1_C3_NONZERO_NM_VALIDATION_EVIDENCE.md
SUPPLEMENTAL_EVIDENCE_FINGERPRINT:
fp:48f5b4c8

METHOD_REVIEW:
ACCEPTABLE_FOR_STATED_SCOPE
UNIT_REVIEW:
PASS - axial force is expressed in N, stresses in MPa, section dimensions in mm, strain is dimensionless, and resistance moment is expressed in N.m.
ASSUMPTION_REVIEW:
ACCEPTED_WITH_LIMITATIONS - the targeted recovery validates nonzero uniaxial axial-flexure interaction using a compression target of -100000 N under the repository convention TENSION_POSITIVE_COMPRESSION_NEGATIVE. The independent benchmark uses an equivalent rectangular N-M hand derivation while the EOS production method uses its governed strain-domain/fiber formulation. This review does not establish the complete interaction surface.
APPLICABILITY_REVIEW:
Applicable to the demonstrated rectangular reinforced-concrete section under nonzero major-axis axial-flexure interaction, including the independently checked -100000 N compression benchmark and the additional nonzero benchmark recorded in the supplemental validation evidence.
LIMITATION_REVIEW:
The recovery satisfies the previously missing nonzero N-M validation requirement for the stated C3 scope. It does not establish complete interaction-surface validation, member stability, validated National Annex conformity, regulatory approval, or complete member design.
INDEPENDENT_METHOD:
EQUIVALENT_RECTANGULAR_NM_HAND_DERIVATION
INDEPENDENT_METHOD_IMPLEMENTATION_SEPARATE_FROM_PRODUCTION:
YES
EOS_RESULT_USED_AS_REFERENCE:
NO
SELF_REFERENCE_USED:
NO
NONZERO_AXIAL_TARGET:
-100000 N
AXIAL_SIGN_CONVENTION:
TENSION_POSITIVE_COMPRESSION_NEGATIVE
INDEPENDENT_DESIGN_CONCRETE_STRENGTH:
20 MPa
INDEPENDENT_DESIGN_STEEL_STRENGTH:
434.7826086956522 MPa
INDEPENDENT_NEUTRAL_AXIS_DEPTH:
106.15951871871948 mm from the compression face
INDEPENDENT_STEEL_STRAIN:
0.011336163718612211
INDEPENDENT_STEEL_YIELD_STATE:
YIELDED_TENSION
INDEPENDENT_AXIAL_FORCE:
-100000.47245854925 N
INDEPENDENT_RESISTANCE_MOMENT:
187666.36658471118 N.m
EOS_TARGET_AXIAL_FORCE:
-100000 N
EOS_ACHIEVED_AXIAL_FORCE:
-100046.01443391509 N
EOS_AXIAL_RESIDUAL:
-46.014433915086556 N
EOS_RESISTANCE_MOMENT:
187353.39590468965 N.m
EOS_SOLVER_STATUS:
CONVERGED
GOVERNED_EQUILIBRIUM_TOLERANCE:
50 N
GOVERNED_RESISTANCE_TOLERANCE:
8000 N.m or relative 0.08, whichever limit is larger
ABSOLUTE_MOMENT_DIFFERENCE:
312.9706800215354 N.m
RELATIVE_MOMENT_DIFFERENCE:
0.0016676972316201515, approximately 0.167 percent
SECOND_NONZERO_POINT:
PASS, as recorded in the supplemental validation evidence
FINDINGS:
The previously missing nonzero N-M validation requirement is now technically supported by an independent nonzero axial-flexure benchmark that does not use the EOS production result as expected truth.
At the -100000 N compression target, the independent resistance moment is 187666.37 N.m and the EOS resistance moment is 187353.40 N.m, a difference of approximately 312.97 N.m or 0.167 percent, comfortably within the existing governed resistance tolerance.
EOS converged with an axial equilibrium residual magnitude of approximately 46.01 N, which is within the existing 50 N equilibrium tolerance. The residual is relatively close to that threshold and should remain visible as validation evidence, but no tolerance was widened and no runtime defect is identified.
A second nonzero axial-force validation point also passes.
This recovery validates bounded nonzero uniaxial N-M behavior. It does not validate the complete interaction surface, member stability, validated National Annex conformity, or regulatory approval.
HUMAN_CONCLUSION:
The supplemental C3 nonzero N-M evidence resolves the specific validation gap identified in the original frozen human review. The C3 capability is accepted for the stated bounded uniaxial axial-flexure scope.
REVIEWER_OUTCOME:
ACCEPTED_FOR_STATED_SCOPE

ORIGINAL_C3_PACK_RECORD_REWRITTEN: NO
ORIGINAL_C3_PACK_RECORD_OUTCOME: REVIEW_INCOMPLETE
C10_REVIEWED_SUBJECT_COUNT: 16
C10_QUALIFIED_HUMAN_REVIEW_SATISFIED: YES
D1F_ENGINEER_REVIEW_SATISFIED: YES
