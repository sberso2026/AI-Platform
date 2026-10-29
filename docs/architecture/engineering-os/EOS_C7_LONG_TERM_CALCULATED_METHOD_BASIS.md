# EOS C7 calculated long-term method basis

Path: docs/architecture/engineering-os/EOS_C7_LONG_TERM_CALCULATED_METHOD_BASIS.md

This document is an RTB-authored engineering specification for a future calculated creep and shrinkage mode. It does not implement that mode. It does not rewrite docs/architecture/engineering-os/EOS_D1_C10_C7_LONG_TERM_HUMAN_REVIEW_EVIDENCE.md. It does not change the frozen runtime baseline. It does not store or reproduce EN 1992.

LICENSED_STANDARD_DOCUMENT_IN_REPOSITORY_REQUIRED: NO
AUTHORITATIVE_ENGINEERING_METHOD_BASIS_REQUIRED: YES
ENGINEERING_METHOD_TRACEABILITY_REQUIRED: YES
INDEPENDENT_VALIDATION_REQUIRED: YES
RTB_INDEPENDENTLY_AUTHORED_METHOD_SPECIFICATION: YES
C7_CALCULATED_MODE_IMPLEMENTED: NO
ENGINEERING_RUNTIME_CHANGED: NO
OLD_DEMONSTRATION_VALUES_USED_AS_CALCULATION_TARGET: NO
OLD_VALUES_REVERSE_ENGINEERED: NO
OLD_VALUES_USED_AS_CALCULATED_BENCHMARK: NO
SELF_REFERENCE_ALLOWED: NO
SILENT_ENGINEERING_DEFAULT_ALLOWED: NO
SILENT_RH_DEFAULT_ALLOWED: NO
SILENT_CEMENT_CLASS_DEFAULT_ALLOWED: NO
SILENT_MICROSTRAIN_INTERPRETATION: NO
MICROSTRAIN_CONVERSION_EXPLICIT: YES

## 1. Method purpose

The future calculated mode estimates a dimensionless creep coefficient at a stated age, and a shrinkage strain split into drying and autogenous parts, from explicit concrete, environment, geometry, cement, and time inputs. The existing explicit mode remains the only implemented long-term path. A supplied creep coefficient and a supplied shrinkage strain stay demonstration or project inputs. They are not the output of this method.

## 2. Standards family

STANDARD_FAMILY: EN 1992
STANDARD_PART: EN 1992-1-1
TARGET_STANDARD: EN 1992-1-1
TARGET_GENERATION: GEN1
PROFILE_FAMILY_ALREADY_USED_BY_EOS: EN1992-1-1-GEN1

The European Commission Joint Research Centre catalogue identifies EN 1992-1-1:2004 as Eurocode 2, Part 1-1, general rules and rules for buildings, inside the first-generation Eurocode 2 family. That page identifies scope and part identity. It does not contain the creep algebra.

## 3. Generation

TARGET_GENERATION: GEN1

This specification does not adopt the second-generation time-dependent model. A later generation has a different annex status and different tabulated long-term values. Those values are outside this method.

## 4. Edition and amendment state

TARGET_BASE_EDITION: 2004
TARGET_AMENDMENT_STATE: A1:2014 is identified. The published contents of EN 1992-1-1:2004/A1:2014 list modifications to the foreword, reinforcement properties, ductility, punching shear, the simplified wall and column method, and bracing without significant shear deformation. That contents list does not include the creep and shrinkage annex or the time-dependent material clauses. A1:2014 is therefore not treated as a change to this method. It is also not treated as a global National Annex.
TARGET_CORRIGENDUM_STATE: UK consolidated metadata for BS EN 1992-1-1:2004+A1:2014 records corrigenda dated January 2008, November 2010, and January 2014. The corrigendum texts were not retrieved. Creep-specific effects of those corrigenda are UNVERIFIED. The calculation basis below is the 2005 Handbook 3 notebook reconstruction of the first-generation informative annex, confirmed against that handbook's own numerical tables. It is not claimed to be a post-corrigendum transcription.

The candidate consolidated label EN 1992-1-1:2004 plus corrigenda plus A1:2014 is supported as an identification of the edition stack. It is not supported as proof that every creep coefficient survived the corrigenda unchanged.

## 5. Authoritative source inventory

AUTHORITATIVE_SOURCE_COUNT: 4

SOURCE_ID: JRC-EC2-CATALOGUE
SOURCE_TITLE: Eurocode 2: Design of concrete structures
SOURCE_OWNER: European Commission Joint Research Centre, Eurocodes site
SOURCE_CLASS: NORMATIVE_STANDARD_METADATA
STANDARD_FAMILY: EN 1992
EDITION_OR_DATE: EN 1992-1-1:2004 listed as Part 1-1
METHOD_SCOPE: part identity and family scope
ROLE_IN_IMPLEMENTATION: names the target part; supplies no creep equation
ROLE_IN_VALIDATION: none
SOURCE_LOCATION: https://eurocodes.jrc.ec.europa.eu/EN-Eurocodes/eurocode-2-design-concrete-structures

SOURCE_ID: JRC-WALRAVEN-2008
SOURCE_TITLE: EN 1992-1-1 Concrete structures, Brussels symposium lecture
SOURCE_OWNER: J. C. Walraven, presented in the JRC Eurocodes background programme, 18-20 February 2008
SOURCE_CLASS: OFFICIAL_EC_JRC_ENGINEERING_GUIDANCE
STANDARD_FAMILY: EN 1992-1-1
EDITION_OR_DATE: 22 February 2008 lecture on the first-generation part
METHOD_SCOPE: annex status, two-part shrinkage, notional size, cement-class strength-development coefficients, and a graphical final-creep example
ROLE_IN_IMPLEMENTATION: establishes that the creep and shrinkage formula annex is informative, that total shrinkage is drying plus autogenous, and that notional size is twice the section area divided by the atmospheric perimeter
ROLE_IN_VALIDATION: the lecture's chart example is not used as a numerical benchmark because the chart is not an algebraic case with a full input record
SOURCE_LOCATION: https://eurocodes.jrc.ec.europa.eu/doc/WS2008/EN1992_1_Walraven.pdf

SOURCE_ID: JRC-HANDBOOK-3-2005
SOURCE_TITLE: Handbook 3, Action effects for buildings, including the concrete-properties annex and the notebooks creep_HB3.nb and shrinkage_HB3.nb
SOURCE_OWNER: Leonardo da Vinci Pilot Project CZ/02/B/F/PP-134007, listed by the JRC Eurocodes site as a first-generation background document
SOURCE_CLASS: OFFICIAL_EC_JRC_CALCULATION_REFERENCE
STANDARD_FAMILY: EN 1992-1-1
EDITION_OR_DATE: Aachen, October 2005; the handbook reference list dates the cited part Brussels, 2005
METHOD_SCOPE: creep coefficient, drying shrinkage, autogenous shrinkage, notional size, cement classes, and published numerical tables produced by the notebooks
ROLE_IN_IMPLEMENTATION: primary algebraic basis, restated below in RTB notation
ROLE_IN_VALIDATION: Handbook 3 Table 6 is the creep benchmark matrix. The cement class N block of Handbook 3 Table 7 is the drying-shrinkage benchmark block
SOURCE_RETRIEVAL: the JRC catalogue page was retrieved. The JRC PDF download was rejected by the host. The calculation text was read from a public mirror of the same titled handbook. Identity was checked by the project code CZ/02/B/F/PP-134007 and by the notebook names creep_HB3.nb and shrinkage_HB3.nb.
SOURCE_LOCATION: http://eurocodes.jrc.ec.europa.eu/publications/handbook-3-action-effects-buildings

SOURCE_ID: BSI-NBS-EN1992-1-1-A1-2014
SOURCE_TITLE: BS EN 1992-1-1:2004+A1:2014 metadata, with the amendment contents list published in the Slovak adoption preview of EN 1992-1-1:2004/A1:2014
SOURCE_OWNER: BSI and CEN adoption metadata; amendment contents from the national preview of the CEN amendment
SOURCE_CLASS: NORMATIVE_STANDARD_METADATA
STANDARD_FAMILY: EN 1992-1-1
EDITION_OR_DATE: base publication 23 December 2004; amendment December 2014; corrigenda recorded as January 2008, November 2010, and January 2014
METHOD_SCOPE: edition, amendment, and corrigendum identification only
ROLE_IN_IMPLEMENTATION: no coefficient is taken from a national annex
ROLE_IN_VALIDATION: none
SOURCE_LOCATION: https://knowledge.bsigroup.com/products/eurocode-2-design-of-concrete-structures-general-rules-and-rules-for-buildings and the NBS record of the incorporated corrigenda

No source in this inventory is an EOS result. No source is the historical explicit pair phi = 2.4 and shrinkage strain = 0.00032.

## 6. Copyright and reference boundary

The specification may name the standard, the annex role, and the public calculation notebooks. It does not paste clauses, tables of recommended nationally determined parameters, or the notebook source as a product implementation. Numerical examples below are the handbook's own published results, used as external benchmarks. Multiplication signs that the PDF text extraction dropped were restored only where the resulting expression reproduces those published results. Coefficients were not fitted to repair a mismatched cell.

## 7. Creep model

CREEP_METHOD_ID: RTB-C7-GEN1-INFORMATIVE-CREEP-HB3

The recovered model evaluates a linear creep coefficient. For a constant stress that does not exceed 0.45 times the characteristic strength at loading, the creep strain increment is the creep coefficient times stress divided by the concrete modulus used with that coefficient. This method returns the coefficient. It does not return the strain unless a later governed use supplies the stress and the modulus.

Let fcm be the 28-day mean cylinder strength in MPa, RH the ambient relative humidity in percent, h0 the notional size in millimetres, t0 the concrete age at loading in days, and t the evaluation age in days.

Strength identity used by the notebook: fcm = fck + 8. If a caller supplies both fck and fcm and they disagree with this identity, the calculation fails closed. The identity is a method relation, not an environmental default.

When fcm is at most 35 MPa:

humidityFactor = 1 + (1 - RH / 100) / (0.1 * h0^(1/3))

When fcm is greater than 35 MPa:

strengthRatio = 35 / fcm
alphaStrength = strengthRatio^0.7
alphaHumidity = strengthRatio^0.2
alphaTime = strengthRatio^0.5
humidityFactor = (1 + (1 - RH / 100) / (0.1 * h0^(1/3)) * alphaStrength) * alphaHumidity

strengthFactor = 16.8 / sqrt(fcm)
loadingAgeFactor = 1 / (0.1 + t0^0.2)
notionalCreep = humidityFactor * strengthFactor * loadingAgeFactor

When fcm is at most 35 MPa:

sizeTimeTerm = 1.5 * (1 + (0.012 * RH)^18) * h0 + 250

When fcm is greater than 35 MPa:

sizeTimeTerm = 1.5 * (1 + (0.012 * RH)^18) * h0 + 250 * alphaTime

timeDevelopment = ((t - t0) / (sizeTimeTerm + t - t0))^0.3
phi(t, t0) = notionalCreep * timeDevelopment

At infinite time, timeDevelopment is 1 and phi equals notionalCreep. Handbook 3 Table 6 is that ultimate coefficient.

The recovered notebook does not apply an upper cap to sizeTimeTerm. A cap was not added. Finite-age results for a large notional size can therefore differ from a formulation that caps that term. Ultimate Table 6 does not use the cap, because timeDevelopment is 1.

The recovered notebook does not adjust t0 for cement class. The handbook states that cement class influences creep, and Table 6 is explicitly cement class N. Classes S and R are not given a recovered age adjustment. Calculated creep therefore accepts only an explicit cement class N. Classes S and R fail closed. Class N is not a silent default.

The handbook also gives a nonlinear coefficient when the stress at loading exceeds 0.45 times fck at that age: the linear coefficient multiplied by exp(1.5 * (stressRatio - 0.45)), where stressRatio is stress divided by fcm at loading. That multiplier is not phi(t, t0). It is not calculated unless stress and the strength at loading are both supplied. If they are omitted, the result records that nonlinear creep was not evaluated.

## 8. Creep inputs

CREEP_REQUIRED_INPUTS: fck in MPa; RH in percent; Ac in mm2; u in mm, or a directly supplied h0 in mm with provenance for Ac and u; cement class; t0 in days; t in days

Optional and not defaulted: stress at loading and fck at loading, used only for the nonlinear multiplier. Temperature is not an input of the recovered notebook. A request to apply a temperature adjustment fails closed.

## 9. Creep intermediate parameters

CREEP_INTERMEDIATE_PARAMETERS: fcm; humidityFactor; alphaStrength; alphaHumidity; alphaTime; strengthFactor; loadingAgeFactor; notionalCreep; sizeTimeTerm; timeDevelopment

alphaStrength, alphaHumidity, and alphaTime are present only when fcm is greater than 35 MPa. They are 1 in effect on the low-strength branch, and the low-strength branch does not multiply by them.

## 10. Creep output

CREEP_OUTPUTS: phi(t, t0), dimensionless; notionalCreep, which is phi at infinite time; the intermediate record above; nonlinearCreepCoefficient only when the stress path is explicitly requested and valid

PHI_CALCULATED: phi(t, t0)
PHI_EF_CALCULATED: NO
PHI_EF_SCOPE_STATUS: OUTSIDE_THIS_METHOD

phi is not phiEf. The C6 nominal-curvature path keeps its own explicit phiEf. This method must not write phi into that input.

## 11. Shrinkage model

SHRINKAGE_METHOD_ID: RTB-C7-GEN1-INFORMATIVE-SHRINKAGE-HB3

The recovered model separates autogenous shrinkage, drying shrinkage, and their sum.

totalShrinkageStrain = dryingShrinkageStrain + autogenousShrinkageStrain

Autogenous ultimate strain = 2.5 * (fck - 10) * 10^(-6)
autogenousTimeFactor = 1 - exp(-0.2 * t^0.5)
autogenousShrinkageStrain = autogenousTimeFactor * autogenous ultimate strain

The notebook prints the autogenous ultimate on a per-mille axis as 2.5 * (fck - 10) * 10^(-3). That display number is per mille. The strain value is the display number divided by 1000, which matches the handbook prose factor 10^(-6).

Drying basic strain, dimensionless, is:

humidityShrinkageFactor = 1.55 * (1 - (RH / 100)^3)
dryingBasicStrain = 0.85 * (220 + 110 * dryingCementFirst) * exp(-dryingCementSecond * fcm / 10) * humidityShrinkageFactor * 10^(-6)

Cement coefficients recovered from shrinkage_HB3.nb:

Class S: dryingCementFirst = 3, dryingCementSecond = 0.13
Class N: dryingCementFirst = 4, dryingCementSecond = 0.12
Class R: dryingCementFirst = 6, dryingCementSecond = 0.11

dryingTimeFactor = (t - ts) / ((t - ts) + 0.04 * sqrt(h0^3))
dryingShrinkageStrain = dryingTimeFactor * sizeFactor * dryingBasicStrain

sizeFactor is the handbook kh term, defined in the notional-size section.

The notebook divides the basic drying expression by 10^3 when it prints per mille. Dimensionless strain is that per-mille number divided by 1000.

## 12. Shrinkage inputs

SHRINKAGE_REQUIRED_INPUTS: fck in MPa; RH in percent; Ac and u, or a traceable h0; cement class S, N, or R; ts in days; t in days

Autogenous shrinkage uses fck and t. It does not use RH, h0, or ts. Drying shrinkage uses all of the required inputs. A calculated total requires every required input even though autogenous ignores some of them. Missing humidity is not filled in order to compute the autogenous part alone unless the caller explicitly asks for the autogenous component only.

## 13. Shrinkage intermediate parameters

SHRINKAGE_INTERMEDIATE_PARAMETERS: fcm; humidityShrinkageFactor; dryingCementFirst; dryingCementSecond; dryingBasicStrain; sizeFactor; dryingTimeFactor; autogenousTimeFactor; autogenousUltimateStrain

## 14. Shrinkage outputs

SHRINKAGE_OUTPUTS: autogenousShrinkageStrain; dryingShrinkageStrain; totalShrinkageStrain

All three are dimensionless strain under the sign convention below. The result also keeps the per-mille display values as evidence, equal to strain times 1000, so a later reader can compare them with Handbook 3 tables without changing the canonical unit.

## 15. Units

CREEP_UNITS: phi is dimensionless. fck and fcm are MPa. RH is percent. Ac is mm2. u and h0 are mm. t, t0, and ts are days. Stress, if supplied for the nonlinear multiplier, is MPa.

SHRINKAGE_UNITS: canonical shrinkage is dimensionless strain. The symbol 1 is the repository canonical strain unit already used by the explicit long-term state. Per mille equals strain times 1000. Microstrain equals strain times 1000000.

A value of 0.00032 strain is 0.32 per mille and 320 microstrain. A bare 320 is not read as strain.

## 16. Sign conventions

SHRINKAGE_STRAIN_UNIT: dimensionless strain
SHRINKAGE_SIGN_CONVENTION: SHRINKAGE_MAGNITUDE_POSITIVE

This matches the explicit-state convention already fixed in the repository. A positive shrinkage magnitude means contraction. The calculated mode must not silently emit a negative shortening strain into a consumer that expects a magnitude. A negative input in explicit mode remains governed by the explicit-state sign representation and is not reinterpreted here.

## 17. Time semantics

TIME_UNIT: DAY
CONCRETE_AGE_AT_LOADING: t0, days after the concrete age origin used for creep
DRYING_START_AGE: ts, days, the age at the end of curing and the start of drying
EVALUATION_AGE: t, days

Invalid and rejected without correction:

t0 <= 0
t <= 0
ts < 0
t < t0 for a creep evaluation
t < ts for a drying evaluation

The notebook's published creep table uses t0 of 1, 7, 28, 90, and 360 days. The formula is not limited to those ages, but t0 must stay positive so that the loading-age power is defined.

## 18. Geometry and notional size

NOTIONAL_SIZE_MODEL_DEFINED: YES
h0 = 2 * Ac / u

AREA_DEFINITION: Ac is the concrete cross-section area, mm2
DRYING_PERIMETER_DEFINITION: u is the perimeter of that section in contact with the atmosphere, mm. It is not the full geometric perimeter unless the caller states that the full perimeter is exposed.
UNIT: mm for h0 and u, mm2 for Ac
VALIDITY: Ac > 0, u > 0, and h0 > 0. The caller supplies Ac and u, or supplies h0 together with the provenance of Ac and u. The engine does not invent an exposed perimeter from a width and a depth.

Published size factor anchors from Handbook 3 Table 8:

h0 = 100 mm, sizeFactor = 1.00
h0 = 200 mm, sizeFactor = 0.85
h0 = 300 mm, sizeFactor = 0.75
h0 >= 500 mm, sizeFactor = 0.70

The notebook does not contain an interpolator. For a deterministic engine, sizeFactor is the anchor value at those sizes, linear between 100 and 200, between 200 and 300, and between 300 and 500, and 0.70 at and above 500 mm. That interpolation is an RTB rule over the published anchors. It is not a transcribed clause. h0 below 100 mm fails closed as NOTIONAL_SIZE_BELOW_PUBLISHED_ANCHOR. No extrapolation below the first anchor is allowed.

## 19. Cement-class semantics

CEMENT_CLASS_MODEL_DEFINED: YES
Enumeration: S, N, R. No other token is accepted. No class is assumed.

Creep: only explicit N is inside the recovered numerical basis. S or R returns CEMENT_CLASS_CREEP_ADJUSTMENT_NOT_IN_RECOVERED_BASIS.

Shrinkage: S, N, and R select the coefficient pairs in section 11. Class N is the block confirmed against Handbook 3 Table 7. Classes S and R keep the notebook coefficients, and their printed table cells do not all reproduce those coefficients. Those cells are not acceptance targets. See the benchmark section.

A separate strength-development coefficient s appears in the handbook and in the 2008 lecture, and the two sources disagree for class N: the handbook table uses 0.35 and the lecture states 0.25. The creep coefficient and the shrinkage strain recovered here do not use s. This specification does not choose either value.

## 20. Humidity semantics

RELATIVE_HUMIDITY_MODEL_DEFINED: YES
RH_UNIT: PERCENT
RH_VALID_RANGE: 0 <= RH <= 100
RH_FAILURE_BEHAVIOUR: missing humidity returns MISSING_RELATIVE_HUMIDITY. A value outside the range returns RELATIVE_HUMIDITY_OUT_OF_RANGE. No value is substituted.

The creep table demonstrates 30, 50, and 80 percent. The shrinkage table demonstrates 20, 40, 60, 80, 90, and 100 percent. The formulas are stated for the whole valid range. At 100 percent the drying humidity factor is zero.

## 21. Applicability

CREEP_APPLICABILITY: normal-weight concrete in the first-generation class range identified by the 2008 lecture, fck from 12 MPa through 90 MPa, using fcm = fck + 8; explicit cement class N; relative humidity from 0 through 100 percent; notional size at or above 100 mm; positive loading and evaluation ages with evaluation not earlier than loading; linear creep. The numerical confirmation set is C30/37, which is fck = 30 MPa and fcm = 38 MPa.

SHRINKAGE_APPLICABILITY: the same strength range, humidity range, notional-size rule, and positive ages, with drying evaluation not earlier than the drying-start age, and an explicit cement class S, N, or R. Numerical confirmation of basic drying strain is the class N block. Autogenous shrinkage is confirmed as the closed form in the notebook and the handbook prose.

Temperature adjustment, lightweight concrete, sealed-curing variants, and a cement-class shift of the loading age are outside the recovered basis.

## 22. Limitations

CREEP_LIMITATIONS: no recovered cement-class adjustment of loading age; no recovered upper cap on sizeTimeTerm; no temperature adjustment; nonlinear creep is separate and optional; phi is not phiEf; ultimate-coefficient confirmation is Table 6, while a digitised finite-age benchmark was not extracted from the handbook figure.

SHRINKAGE_LIMITATIONS: class S and class R printed basic-drying cells are not confirmed against the notebook coefficients; sizeFactor between anchors is an RTB linear rule; autogenous shrinkage ignores humidity and size by the recovered model; the historical explicit values are not a target; member curvature, deflection, and crack width are not outputs of this method.

COMPLETE_INTERACTION_WITH_MEMBER_DESIGN: NO
NATIONAL_ANNEX_VALIDATED: NO
REGULATORY_APPROVAL: NO

## 23. National-profile boundary

NATIONAL_PROFILE_REQUIRED: NO
NATIONAL_PARAMETERS_IDENTIFIED: NONE_IN_RECOVERED_FORMULAS
BASE_METHOD_CAN_RUN_WITHOUT_NATIONAL_PROFILE: YES

The formula annex is informative. A national profile may decline it or replace a coefficient. This specification does not hard-code a UK, German, French, Australian, or other annex. If a future profile supplies a replacement coefficient, that coefficient must be an explicit governed input. It is not a silent override of the base method.

The base method can run for the recovered formulas without a national profile. That run is a reference-method calculation. It is not national conformity.

## 24. Explicit and calculated mode boundary

EXPLICIT_MODE_PRESERVED: YES
EXPLICIT_MODE_CAN_CLAIM_CALCULATED: NO
CALCULATED_MODE_CAN_USE_UNTRACEABLE_FINAL_VALUE: NO

The implemented path remains the explicit long-term state: a supplied phi, a supplied shrinkage magnitude, provenance, authority, and time context. The historical demonstration phi = 2.4 and shrinkage strain = 0.00032 stay on that path. They were not solved backwards and they are not a calculated benchmark.

The future calculated path must carry the method id, the method revision, every intermediate value, and the source ids in this document. A final phi or a final shrinkage strain without that record is rejected.

## 25. Deterministic implementation contract

CALCULATED_MODE_INPUT_MODEL_DEFINED: YES
CALCULATED_MODE_OUTPUT_MODEL_DEFINED: YES

Future function name: calculateLongTermState

INPUT_SCHEMA:
methodRevision: RTB-C7-GEN1-LONG-TERM-HB3-1
fckMPa: number
relativeHumidityPercent: number
sectionAreaMm2: number or null
dryingPerimeterMm: number or null
notionalSizeMm: number or null, allowed only with provenance refs for area and perimeter
cementClass: S, N, or R
loadingAgeDays: number
dryingStartAgeDays: number
evaluationAgeDays: number
stressAtLoadingMPa: number or null
fckAtLoadingMPa: number or null
temperatureAdjustmentRequested: false for this revision

OUTPUT_SCHEMA:
creepCoefficient: number
ultimateCreepCoefficient: number
creepIntermediates: the named factors in section 9
nonlinearCreepCoefficient: number or null
autogenousShrinkageStrain: number
dryingShrinkageStrain: number
totalShrinkageStrain: number
shrinkageIntermediates: the named factors in section 13
shrinkagePerMille: the three strains times 1000, evidence only
unitStrain: 1
signConvention: SHRINKAGE_MAGNITUDE_POSITIVE
methodRevision: RTB-C7-GEN1-LONG-TERM-HB3-1
sourceIds: the four source ids in section 5
cementClassCreepScope: N_ONLY
sizeTimeTermCapApplied: NO

VALIDATION_RULES: the failure states in section 26. No input is replaced by 50, 60, 70, or any other humidity. No cement class is inserted. No age is shifted to make it valid.

PROVENANCE: each output records the source ids, the handbook table used for its benchmark family, and the caller provenance refs for geometry and material.

METHOD_REVISION: RTB-C7-GEN1-LONG-TERM-HB3-1

This contract is not implemented in this phase.

## 26. Failure behaviour

SILENT_ENGINEERING_DEFAULT_ALLOWED: NO

Failure states for this revision:

MISSING_RELATIVE_HUMIDITY
RELATIVE_HUMIDITY_OUT_OF_RANGE
MISSING_NOTIONAL_SIZE_INPUT
NOTIONAL_SIZE_BELOW_PUBLISHED_ANCHOR
MISSING_CEMENT_CLASS
CEMENT_CLASS_OUTSIDE_ENUMERATION
CEMENT_CLASS_CREEP_ADJUSTMENT_NOT_IN_RECOVERED_BASIS
INVALID_LOADING_AGE
INVALID_DRYING_AGE
INVALID_EVALUATION_AGE
FCM_FCK_RELATION_CONFLICT
UNSUPPORTED_STRENGTH_RANGE
TEMPERATURE_ADJUSTMENT_NOT_IN_RECOVERED_BASIS
UNBOUND_METHOD_PROFILE
UNTRACEABLE_FINAL_VALUE

UNSUPPORTED_STRENGTH_RANGE applies when fck is below 12 MPa or above 90 MPa. UNBOUND_METHOD_PROFILE applies when the caller names a national profile or a second-generation method that this revision does not implement.

## 27. Benchmark strategy

CREEP_BENCHMARK_STRATEGY_DEFINED: YES
SHRINKAGE_BENCHMARK_STRATEGY_DEFINED: YES
SELF_REFERENCE_ALLOWED: NO

Creep benchmark family: Handbook 3 Table 6. Concrete C30/37, so fck = 30 MPa and fcm = 38 MPa. Cement class N. Ultimate time, so timeDevelopment = 1. Relative humidity 30, 50, and 80 percent. Notional size 100, 200, 500, and 1000 mm. Loading age 1, 7, 28, 90, and 360 days. That is 60 cells. The recovered expression matches the published one-decimal values. The cell at 80 percent, 200 mm, and 7 days is published as 2.25 rather than one decimal; the expression evaluates to 2.251, which matches 2.25. The future test must compare against these published cells and must not generate the expected column from the production function.

The matrix covers higher humidity (80 percent), earlier loading (1 and 7 days), later loading (90 and 360 days), and different notional sizes (100 through 1000 mm). A shorter evaluation age and a long finite evaluation age are defined by timeDevelopment, but the handbook figure was not digitised. No finite-age expected number is invented. The first acceptance gate is the 60-cell ultimate matrix. A finite-age gate waits for a published digitised point.

Shrinkage benchmark family: the cement class N block of Handbook 3 Table 7, basic drying strain in per mille, before the size factor and before the time factor. fck of 30, 50, and 70 MPa. Relative humidity of 20, 40, 60, 80, 90, and 100 percent. The recovered expression matches that block at two decimals. Class S and class R cells that do not match the notebook coefficients are excluded from the acceptance set. They must not be edited until a cleaner source resolves them.

Autogenous benchmark: for a stated fck, ultimate strain equals 2.5 * (fck - 10) * 10^(-6), and the time factor equals 1 - exp(-0.2 * t^0.5). For fck = 30 MPa the ultimate strain is 0.00005, which is 0.05 per mille and 50 microstrain. This is a direct evaluation of the recovered closed form, checked against the handbook prose factor 10^(-6) and the notebook per-mille display.

Total shrinkage for an acceptance case is drying plus autogenous on a class N case whose basic drying cell is inside the confirmed block, using a published size-factor anchor and an explicit t and ts. The future test must show the three components separately.

OLD_VALUES_USED_AS_CALCULATED_BENCHMARK: NO. The pair 2.4 and 0.00032 is not in the handbook tables and is not a target.

## 28. Validation acceptance strategy

A future implementation passes numerical validation only when an independent checker, separate from the production evaluator, reproduces the creep matrix and the class N drying block from the expressions in this document, and the production evaluator agrees within rounding to the published table. The production evaluator must not be the source of the expected values.

Acceptance does not promote national conformity, does not validate phiEf, and does not complete the C7 human review. After numerical agreement, a qualified human re-review of the calculated mode is still required. The historical explicit-state review remains incomplete until that separate review is supplied. Reviewer identity is not invented by this document.

## 29. C7 human re-review strategy

OLD_C7_HUMAN_REVIEW_PRESERVED: YES
OLD_C7_LONG_TERM_FINGERPRINT: 9b2c325cdad7b78d
C7_LONG_TERM_REVIEW_STATUS: REVIEW_INCOMPLETE

The historical record stays REVIEW_INCOMPLETE because it reviewed an explicit state whose independent result was blank. This method basis is not that review. After implementation and the independent numerical check, the re-review subject is the calculated mode only: inputs, units, the class N creep matrix, the class N drying block, the autogenous closed form, the explicit-mode boundary, and the statement that phi is not phiEf. The re-review does not reopen C3. It does not satisfy C10 while reviewer identity remains blank and D1F remains unfilled.

## 30. Implementation impact

EXPECTED_RUNTIME_FILES: a future packages/engineering-os/src/structural-concrete/eu-c7/long-term-calculated.ts. The existing eu-c7/long-term.ts explicit path stays. No runtime file is added in this phase.
EXPECTED_TYPE_FILES: a future extension of packages/types/src/structural-concrete-eu-c7.ts. The current explicit-state constants stay, including calculated-mode flags set to false.
EXPECTED_PROFILE_FILES: a future method record beside packages/engineering-os/src/structural-concrete/eu-c7/profile-binding.ts. No national profile file is added.
EXPECTED_TEST_FILES: a future packages/engineering-os/src/structural-concrete/eos-d1e-eu-c7-calculated-long-term-validation.test.ts that reads this basis and compares an independent checker with production.
EXPECTED_C10_FILES: a future supplemental C7 calculated-mode human re-review. The historical file EOS_D1_C10_C7_LONG_TERM_HUMAN_REVIEW_EVIDENCE.md is not rewritten.
EXPECTED_D1G_IMPACT: NONE. D1G is not a consumer of this coefficient and is not reopened.
EXPECTED_D1H_IMPACT: NONE. D1H is not a consumer of this coefficient and is not reopened.
EXPECTED_D1I_IMPACT: NONE. D1I is not a consumer of this coefficient and is not reopened.
EXPECTED_D1J_IMPACT: NONE. D1J optimisation evidence does not take a calculated creep coefficient and is not reopened.
EXPECTED_D1K_IMPACT: NONE. D1K internal-integration evidence does not take a calculated creep coefficient and is not reopened.
EXPECTED_HUMAN_REREVIEW_SCOPE: C7 calculated long-term mode only, after numerical validation. C3 stays accepted for its stated scope. C9 member orchestration currently keeps calculated creep unimplemented or deferred. That orchestration is not changed in this phase and is not a D1G-D1K reopen.

C10_REVIEW_RECORD_COUNT: 16
ACCEPTED_FOR_STATED_SCOPE_COUNT: 15
REVIEW_INCOMPLETE_COUNT: 1
ONLY_REMAINING_INCOMPLETE_C10_SUBJECT: C7-LONG-TERM
C3_CURRENT_REVIEW_STATUS: ACCEPTED_FOR_STATED_SCOPE
C3_NONZERO_NM_VALIDATION_SATISFIED: YES
C10_QUALIFIED_HUMAN_REVIEW_SATISFIED: NO
D1F_ENGINEER_REVIEW_SATISFIED: NO
D1_COMPLETED_MILESTONE_COUNT: 13
D1_REMAINING_MILESTONE_COUNT: 2
D1_STRUCTURAL_PACK_COMPLETE: NO
FROZEN_RUNTIME_BASELINE_CHANGED: NO

READY_FOR_CALCULATED_MODE_IMPLEMENTATION: YES
READY_FOR_NEXT_PHASE: YES
NEXT_PHASE: EOS-C7-LONG-TERM-CALCULATED-MODE-IMPLEMENTATION-AND-VALIDATION
NEXT_PHASE_TYPE: TARGETED_ENGINEERING_IMPLEMENTATION_AND_VALIDATION
