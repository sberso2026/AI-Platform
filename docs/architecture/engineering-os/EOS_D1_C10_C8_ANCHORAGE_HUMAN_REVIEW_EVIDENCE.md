# EOS D1 C10 C8 anchorage human review evidence

Path: docs/architecture/engineering-os/EOS_D1_C10_C8_ANCHORAGE_HUMAN_REVIEW_EVIDENCE.md

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
C10-R3A-PACK-C8-ANCHORAGE
FROZEN_FINGERPRINT:
02cfe936c1d0413c
CAPABILITY:
D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE

METHOD_REVIEW:
ACCEPTABLE_FOR_STATED_SCOPE
UNIT_REVIEW:
PASS - bar diameter is expressed in mm and design steel stress and design bond stress are expressed in MPa. The stress ratio is dimensionless, producing anchorage length in mm.
ASSUMPTION_REVIEW:
ACCEPTED_WITH_LIMITATIONS - design steel stress sigma_sd = 400 MPa and design bond stress f_bd = 2.5 MPa are supplied project inputs. This frozen method does not derive either value. The bar is a straight deformed tension bar with diameter 16 mm.
APPLICABILITY_REVIEW:
Applicable to calculation of the basic required anchorage length for the demonstrated straight tension bar using explicitly supplied design steel stress and design bond stress.
LIMITATION_REVIEW:
This review covers basic required anchorage length only. It does not establish full design anchorage length, minimum anchorage requirements, anchorage modification factors, bond-condition derivation, available-length adequacy, National Annex conformity, or complete EN 1992 anchorage compliance. No available anchorage length is supplied in the frozen case.
INDEPENDENT_CALC_REQUIRED:
YES
INDEPENDENT_METHOD:
Reviewer-controlled manual calculation using the frozen inputs and the independently referenced basic anchorage relationship: l_b,rqd = (phi / 4) × (sigma_sd / f_bd)
INDEPENDENT_REFERENCE:
European Commission JRC, Eurocode 2 Background and Applications, Arrieta detailing material, basic anchorage length relationship. The review independently applies that relationship to the frozen EOS inputs and does not rely on the EOS result as the reference value.
INDEPENDENT_RESULT:
640
INDEPENDENT_RESULT_UNITS:
mm
EOS_RESULT:
640 mm basic required anchorage length
DIFFERENCE:
0 mm
TOLERANCE_OR_ACCEPTANCE_BASIS:
Exact agreement expected for this deterministic calculation. Independent calculation gives (16 mm / 4) × (400 MPa / 2.5 MPa) = 640 mm.
FINDINGS:
No numerical calculation discrepancy identified. The EOS basic required anchorage length of 640 mm is independently reproduced. Design steel stress 400 MPa and design bond stress 2.5 MPa are supplied rather than derived in this review. Full design anchorage, minimum anchorage requirements, modification factors and available-length comparison are outside the frozen method scope.
REVIEWER_OUTCOME:
ACCEPTED_FOR_STATED_SCOPE

C10_REVIEWED_SUBJECT_COUNT for this record: 1 subject. Cumulative recorded subjects, including the separate C8 cover, C7 crack-width, C8 spacing, and C7 long-term records: 5 of 16.
C10_QUALIFIED_HUMAN_REVIEW_SATISFIED: YES
D1F_ENGINEER_REVIEW_SATISFIED: YES
