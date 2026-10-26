# EOS D1 C10 C8 spacing human review evidence

Path: docs/architecture/engineering-os/EOS_D1_C10_C8_SPACING_HUMAN_REVIEW_EVIDENCE.md

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
C10-R3A-PACK-C8-SPACING
FROZEN_FINGERPRINT:
98350cdff747d872
CAPABILITY:
D1E.EU.C8.MINIMUM_CLEAR_SPACING

METHOD_REVIEW:
ACCEPTABLE_FOR_STATED_SCOPE
UNIT_REVIEW:
PASS - bar diameter, aggregate size, centre spacing, clear spacing and required spacing are consistently expressed in mm.
ASSUMPTION_REVIEW:
ACCEPTED_WITH_LIMITATION - the frozen demonstration explicitly supplies bar-diameter coefficient 1, aggregate allowance 5 mm and absolute minimum clear spacing 20 mm. These parameter values are not independently derived from a validated project-specific National Annex in this review.
APPLICABILITY_REVIEW:
Applicable to the demonstrated minimum clear spacing check for two horizontally adjacent individual deformed bars using the supplied bar diameter, maximum aggregate size, spacing coefficients and absolute-minimum requirement.
LIMITATION_REVIEW:
The frozen C10 row uses a REFERENCE_PROFILE and does not bind a calendar code edition or validated National Annex. This review confirms the spacing calculation and comparison for the supplied parameter values but does not establish universal EN 1992 or project-specific detailing conformity.
INDEPENDENT_CALC_REQUIRED:
YES
INDEPENDENT_METHOD:
Reviewer-controlled manual calculation using the frozen input values and the documented minimum-clear-spacing rule: minimumClearSpacing = max(k × bar diameter, aggregate size + allowance, absolute minimum).
INDEPENDENT_REFERENCE:
Independent manual calculation using the frozen C8-SPACING inputs. The rule is consistent with the EN 1992 minimum clear bar-spacing approach, while project-specific edition and National Annex conformity remain outside this review outcome.
INDEPENDENT_RESULT:
25
INDEPENDENT_RESULT_UNITS:
mm
EOS_RESULT:
25 mm required minimum clear spacing
DIFFERENCE:
0 mm
TOLERANCE_OR_ACCEPTANCE_BASIS:
Exact agreement expected for the deterministic maximum-component calculation. Independent calculation gives max(16 mm, 25 mm, 20 mm) = 25 mm. Actual clear spacing from 100 mm bar centres and two 16 mm bars is 84 mm. EOS utilization 25/84 = 0.297619 also agrees with the independent calculation.
FINDINGS:
No numerical calculation discrepancy identified. Aggregate size plus allowance governs at 25 mm. Actual clear spacing is 84 mm and exceeds the required 25 mm. The frozen row does not bind a calendar code edition or validated National Annex, therefore full code-conformance is outside this review outcome.
REVIEWER_OUTCOME:
ACCEPTED_FOR_STATED_SCOPE

C10_REVIEWED_SUBJECT_COUNT for this record: 1 subject. Cumulative recorded subjects, including the separate C8 cover and C7 crack-width records: 3 of 16.
C10_QUALIFIED_HUMAN_REVIEW_SATISFIED: NO
D1F_ENGINEER_REVIEW_SATISFIED: NO
