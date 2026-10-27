# EOS D1 C10 C7 calculated long-term re-review worksheet

Path: docs/architecture/engineering-os/EOS_D1_C10_C7_LONG_TERM_CALCULATED_REREVIEW_WORKSHEET.md

This worksheet is the targeted human re-review subject for the calculated class N creep and shrinkage revision. It does not replace docs/architecture/engineering-os/EOS_D1_C10_C7_LONG_TERM_HUMAN_REVIEW_EVIDENCE.md. The historical explicit-state review remains REVIEW_INCOMPLETE, fingerprint 9b2c325cdad7b78d, independent result BLANK. This revision does not inherit that review. The recorded review is in docs/architecture/engineering-os/EOS_D1_C10_C7_LONG_TERM_CALCULATED_HUMAN_REREVIEW_EVIDENCE.md. Reviewer metadata is recorded below and bound by docs/architecture/engineering-os/EOS_D1_QUALIFIED_STRUCTURAL_REVIEWER_ATTESTATION.md.

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
REVIEWER_OUTCOME:
ACCEPTED_FOR_STATED_SCOPE
REVIEWER_INDEPENDENT_RESULT:
blank

METHOD_ID:
RTB-C7-GEN1-INFORMATIVE-CREEP-HB3
SHRINKAGE_METHOD_ID:
RTB-C7-GEN1-INFORMATIVE-SHRINKAGE-HB3
METHOD_REVISION:
RTB-C7-GEN1-LONG-TERM-HB3-1
IMPLEMENTATION_FINGERPRINT:
fp:ac109d1f
OLD_C7_LONG_TERM_FINGERPRINT:
9b2c325cdad7b78d
NEW_REVISION_INHERITS_OLD_HUMAN_REVIEW:
NO
STANDARD_FAMILY:
EN 1992-1-1
GENERATION:
GEN1
BASE_EDITION:
2004
CALCULATION_MODE:
CALCULATED_LONG_TERM_STATE
CEMENT_CLASS:
N
CREEP_MODE:
LINEAR
PHI_CALCULATED:
phi(t,t0)
PHI_EF_CALCULATED:
NO
TEMPERATURE_ADJUSTMENT_IMPLEMENTED:
NO
CREEP_SIZE_TIME_CAP_ASSUMED:
NO
FULL_EN1992_CONFORMANCE:
NO
NATIONAL_ANNEX_VALIDATED:
NO
REGULATORY_APPROVAL:
NO

BENCHMARK_SOURCE:
JRC Handbook 3 Table 6 class N ultimate creep, C30/37, and Handbook 3 Table 7 class N basic drying strain. Autogenous shrinkage uses the published closed form 2.5 * (fck - 10) * 10^-6. Expected values are the published table literals and that closed form. The EOS production result was not used as the expected value.

PRIMARY_CREEP_BENCHMARK_ID:
HB3-TABLE6-N-C30-RH50-H0-100-T0-28-ULTIMATE
PRIMARY_CREEP_INPUTS:
fck 30 MPa, fcm 38 MPa, cement class N, RH 50 percent, h0 100 mm, loading age 28 days, creep horizon ULTIMATE, linear creep, no temperature adjustment
CREEP_INDEPENDENT_RESULT:
2.6 dimensionless
CREEP_EOS_RESULT:
2.641135314028221 dimensionless
CREEP_DIFFERENCE:
absolute 0.041135314028220904, relative 0.015821274626238807
CREEP_TOLERANCE:
0.05 absolute. Half of the published one-decimal place. Fixed from Handbook 3 Table 6 precision before comparison. The two-decimal published cells 2.39 and 2.25 use 0.005 absolute.

PRIMARY_SHRINKAGE_BENCHMARK_ID:
HB3-TABLE7-N-FCK30-RH40-H0-100-ULTIMATE
PRIMARY_SHRINKAGE_INPUTS:
fck 30 MPa, fcm 38 MPa, cement class N, RH 40 percent, h0 100 mm, drying-start age 7 days, shrinkage horizon ULTIMATE, size factor 1.00 at the published 100 mm anchor
SHRINKAGE_AUTOGENOUS_INDEPENDENT_RESULT:
0.00005 dimensionless strain
SHRINKAGE_AUTOGENOUS_EOS_RESULT:
0.000049999999999999996 dimensionless strain
SHRINKAGE_AUTOGENOUS_DIFFERENCE:
4.0e-21 dimensionless strain
SHRINKAGE_AUTOGENOUS_TOLERANCE:
1e-12 absolute. Exact arithmetic of the published closed form.
SHRINKAGE_DRYING_INDEPENDENT_RESULT:
0.00052 dimensionless strain, from published 0.52 per mille
SHRINKAGE_DRYING_EOS_RESULT:
0.0005158603214379045 dimensionless strain
SHRINKAGE_DRYING_DIFFERENCE:
0.000004139678562095411 dimensionless strain
SHRINKAGE_DRYING_TOLERANCE:
0.000005 dimensionless strain. Half of the published hundredth of a per mille.
SHRINKAGE_TOTAL_INDEPENDENT_RESULT:
0.00057 dimensionless strain
SHRINKAGE_TOTAL_EOS_RESULT:
0.0005658603214379046 dimensionless strain
SHRINKAGE_TOTAL_DIFFERENCE:
0.0000041396785620954 dimensionless strain
SHRINKAGE_TOTAL_TOLERANCE:
0.000005 dimensionless strain
SHRINKAGE_SIGN:
SHRINKAGE_MAGNITUDE_POSITIVE
SHRINKAGE_UNIT:
dimensionless strain

ADDITIONAL_COVERAGE:
The same predeclared tolerances cover the remaining 59 Handbook 3 Table 6 class N cells and the remaining 17 Handbook 3 Table 7 class N cells. Disputed class S and class R printed cells are not acceptance targets.

METHOD_APPLICABILITY:
Class N linear ultimate creep and class N shrinkage for fck 12 to 90 MPa, relative humidity 0 to 100 percent, and notional size at or above 100 mm. Notional size is 2Ac/u when area and drying perimeter are supplied. Time unit is the day. Total shrinkage is autogenous shrinkage plus drying shrinkage.

METHOD_LIMITATIONS:
The implementation is a bounded RTB method. It is not full EN 1992 conformance, not a validated National Annex, and not regulatory approval. Cement classes S and R are not in the validated production envelope. No cement-class loading-age adjustment is applied. No temperature adjustment is applied. phi is not phiEf. Explicit supplied values remain explicit. The historical values 2.4 and 0.00032 are not calculated targets. Corrigendum text was not verified and is not claimed as implemented.

FAIL_CLOSED_UNSUPPORTED_DOMAINS:
CALCULATED_CREEP_CEMENT_CLASS_UNSUPPORTED
CALCULATED_SHRINKAGE_CEMENT_CLASS_UNVALIDATED
CREEP_SIZE_TIME_CAP_UNBOUND
TEMPERATURE_ADJUSTMENT_NOT_BOUND
MISSING_RELATIVE_HUMIDITY
RELATIVE_HUMIDITY_OUT_OF_RANGE
MISSING_NOTIONAL_SIZE_INPUT
INVALID_NOTIONAL_SIZE
NOTIONAL_SIZE_CONFLICT
INVALID_CONCRETE_STRENGTH
FCM_FCK_RELATION_CONFLICT
INVALID_LOADING_AGE
INVALID_DRYING_AGE
INVALID_EVALUATION_AGE
UNBOUND_METHOD_PROFILE

Finite evaluation ages later than the loading age fail closed because the size-time term has no recovered upper cap and that cap could change the result. The ultimate horizon and the instant of loading do not depend on that cap.

METHOD_REVIEW:
ACCEPTABLE_FOR_STATED_SCOPE
UNIT_REVIEW:
PASS
ASSUMPTION_REVIEW:
ACCEPTED_WITH_LIMITATIONS
APPLICABILITY_REVIEW:
ACCEPTABLE_FOR_VALIDATED_CLASS_N_CALCULATED_LONG_TERM_SCOPE
HUMAN_CONCLUSION:
The supplemental C7 calculated-mode implementation and independent validation resolve the technical deficiency identified in the original frozen long-term human review. The calculated creep and shrinkage capability is accepted for the stated bounded class-N engineering scope. The original explicit-state implementation remains separately valid as a provenance-controlled supplied-value mode.
C7_CURRENT_REVIEW_STATUS:
ACCEPTED_FOR_STATED_SCOPE
