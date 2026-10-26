# C10 supplemental reviewer worksheets

These six worksheets prepare the packs whose C10 status is REQUIRES_SUPPLEMENTAL_INDEPENDENT_CALCULATION. They record frozen repository inputs and the values the existing EOS evaluators return for those inputs.

This file is not human-review evidence. It records no reviewer identity, qualification, registration, organization, signature, review date, finding, or outcome. It does not judge whether an EOS result is correct. The independent-calculation cells are blank. Cursor did not perform that calculation.

A completed review still requires the record defined in EOS_D1_QUALIFIED_STRUCTURAL_REVIEW_ACTION_PACKAGE.md, bound to the pack fingerprint below. For the five packs whose C10 formula fingerprint is NONE, that NONE value is the pack method fingerprint. A method-demonstration fingerprint is not a substitute for it.

Profile generation EN1992-1-1-GEN1 is a repository profile token. These worksheets do not assign a calendar edition or a national annex. National profile state on every C10 pack is NOT_VALIDATED.

## Shared blank record

| Field | Value |
| --- | --- |
| Independent calculation | blank |
| Finding | blank |
| Review outcome | blank |
| Reviewer | blank |
| Review date | blank |

## 1. C10-R3A-PACK-C3-UNIAXIAL

| Field | Value |
| --- | --- |
| Capability | D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL |
| Pack fingerprint | a32bf2a00b313d9d |
| Pack format | c10-r3a.1 |
| C10 benchmark | C10-R2-C3-ZERO-AXIAL |
| C10 benchmark status stored by the ledger | PASS |
| Method id on the executed point | EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MAJOR |
| Method version label | EU_C3_AXIAL_FLEXURE |
| Implementation version inside the result fingerprint | d1e-eu-c3.0 |
| Profile id | DECLARED_TEST_PARTIAL_FACTORS |
| Generation | DECLARED_TEST |
| Standard token inside the result | EN1992_INTENDED_PROFILE |
| Parameter fingerprint | d8fbffde169cf36c |
| Supplemental item | C10-R3A-C3-NONZERO-NM-INDEPENDENT-CALC |
| labelledEn1992Resistance | false |

The C10 formula fingerprint, which the reviewer copies as the reviewed method fingerprint, is the result fingerprint of this zero-axial point:

{"methodId":"EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MAJOR","methodVersion":"d1e-eu-c3.0","axis":"MAJOR_AXIS","momentSign":"POSITIVE","geometryFingerprint":"c10-r2-rect|1|RECTANGULAR|300x500","reinforcementFingerprint":"lay-c10-r2;b1:50:50:314:1;b2:150:50:314:1;b3:250:50:314:1","constitutiveParameterVersion":"c1c-constitutive.0","r1ParameterVersion":"c1c-evidence.0","ndpContextRef":"DECLARED_TEST_NA|1.5|1.15|1|TEST_ONLY_NON_CONFORMANCE|TEST_ONLY_NON_CONFORMANCE","integrationConfiguration":"CARTESIAN_CELL_PLUS_BAR_POINTS:16x16","solverConfiguration":"BRACKETED_AXIAL_BISECTION:MAJOR_AXIS:POSITIVE:N=0:eps_cu2","curveGenerationConfiguration":"GOVERNED_STRAIN_DOMAIN_TRACE_EPS_CU2_PIVOT_PLUS_YIELD_PIVOT_WHERE_REQUIRED","standardProfile":"EN1992_INTENDED_PROFILE","targetAxialN":0}

### Frozen inputs

| Input | Value | Unit |
| --- | --- | --- |
| Section id | c10-r2-rect |  |
| Width | 300 | mm |
| Depth | 500 | mm |
| Geometry kind | RECTANGULAR |  |
| Axis | MAJOR_AXIS |  |
| Moment sign | POSITIVE |  |
| Target axial | 0 | N |
| Mesh | 16 by 16 Cartesian cells plus bar points |  |
| Bar b1 | x 50, y 50, area 314, count 1, designation H20, diameter 20 | mm, mm, mm2, mm |
| Bar b2 | x 150, y 50, area 314, count 1, designation H20, diameter 20 | mm, mm, mm2, mm |
| Bar b3 | x 250, y 50, area 314, count 1, designation H20, diameter 20 | mm, mm, mm2, mm |
| Layout id | lay-c10-r2 |  |
| Concrete designation | C30 |  |
| fc | 30 | MPa |
| Ec | 33000 | MPa |
| Reinforcement designation | B500 |  |
| fy | 500 | MPa |
| Es | 200000 | MPa |
| nationalAnnexRef | DECLARED_TEST_NA |  |
| gamma_c | 1.5 | dimensionless |
| gamma_s | 1.15 | dimensionless |
| alpha_cc | 1 | dimensionless |
| NDP label | TEST_ONLY_NON_CONFORMANCE |  |
| testOnlyNonConformance | true |  |
| Provenance ref | c10-r2-c3 |  |

The comparison fixture stored beside this case sets fcdMPa to 20 and fydMPa to the source expression 500 / 1.15. Those two numbers belong to the equivalent-rectangle comparison fixture. They are not a second EOS output.

### Method and factors

Production path: bracketed axial bisection on the D1E section kernel, strain family EPS_CU2_PIVOT for this point, plane sections remain plane. Concrete model id returned by the section kernel: EU_C1_PARABOLA_RECTANGLE_FCK_LE_50.

Design concrete stress uses fcdMPa = alpha_cc * compressiveStrengthMPa / gamma_c. Concrete compression for a negative kernel strain uses the stored parabola-rectangle parameters eps_c2 = 2.0 per mille, eps_cu2 = 3.5 per mille, n_parabola = 2, and fck_constant_strain_limit = 50 MPa. For compressive strain magnitude epsC at or below eps_c2, kernel stress is -fcd * (1 - (1 - epsC / eps_c2) ^ n). Between eps_c2 and eps_cu2, kernel stress is -fcd. A positive kernel strain returns zero concrete stress. Strain above eps_cu2 fails closed.

Reinforcement uses fyd = fyk / gamma_s and kernel stress Es * strain, clipped to the closed interval from -fyd to fyd.

Constitutive parameter version c1c-constitutive.0. Evidence parameter version c1c-evidence.0. Material rule versions returned with the point: c1c-constitutive.0, c1c-evidence.0, d1e-eu-c3.0.

The C10 comparison model is a separate equivalent-rectangle hand derivation with eta = 1 and lambda = 0.8. The ledger compares the production moment with that hand moment using EU_C2_NUMERICAL_TOLERANCE resistanceComparisonAbsNm = 8000 N.m and resistanceComparisonRel = 0.08. Equilibrium residual tolerance on the production point is equilibriumResidualN = 50 N. This worksheet does not repeat the hand-model moment.

### EOS result for the frozen zero-axial point

| Result | Value | Unit |
| --- | --- | --- |
| strainFamily | EPS_CU2_PIVOT |  |
| axialForceN | 21.723215374804568 | N |
| equilibriumResidualN | 21.723215374804568 | N |
| resistanceMomentNm | 170283.1004094707 | N.m |
| Resultant N_N | 21.723215374804568 | N |
| Resultant Mx_Nm | 170283.1004094707 | N.m |
| Resultant My_Nm | 0 | N.m |
| Axial strain at origin | 0.006898472724318616 | m/m |
| Curvature about x | 0.000041593890897274464 | 1/mm |
| Curvature about y | 0 | 1/mm |
| Strain origin | x 150, y 250 | mm |
| Integration | CARTESIAN_CELL_PLUS_BAR_POINTS:16x16 |  |
| Solver | BRACKETED_AXIAL_BISECTION:MAJOR_AXIS:POSITIVE:N=0:eps_cu2 |  |

### Applicability and limitations

Scope: one uniaxial axial-flexure interaction point on an explicit axis. Exclusions: member stability, biaxial interaction, national-profile validation. The executed C10 case is zero axial only. A zero-axial reduction is not a nonzero interaction case. No frozen nonzero compression-plus-bending input exists in the C10 ledger. This worksheet does not invent one.

### Sources and tests

- packages/engineering-os/src/structural-concrete/eu-c10/benchmarks.ts, case C10-R2-C3-ZERO-AXIAL
- packages/engineering-os/src/structural-concrete/eu-c10/review-packs.ts
- packages/engineering-os/src/structural-concrete/eu-c3/evaluate.ts
- packages/engineering-os/src/structural-concrete/eu-c3/golden.ts
- packages/engineering-os/src/structural-concrete/eu-c1c-constitutive/evaluate.ts
- packages/engineering-os/src/structural-concrete/eu-c1c-constitutive/evidence.ts
- packages/engineering-os/src/structural-concrete/eu-c1c-r1/evaluate.ts
- packages/engineering-os/src/structural-concrete/eos-d1e-eu-c3.test.ts
- packages/types/src/structural-concrete-eu-c2.ts, EU_C2_NUMERICAL_TOLERANCE

## 2. C10-R3A-PACK-C7-CRACK-WIDTH

| Field | Value |
| --- | --- |
| Capability | D1E.EU.C7.CRACK_WIDTH |
| Pack fingerprint | 92dd6720e23d0286 |
| C10 benchmark | C10-R2-C7-CRACK-RECOVERY |
| C10 method id | NOT_EXECUTED |
| C10 formula fingerprint | NONE |
| C10 parameter fingerprint | NONE |
| C10 benchmark status | BLOCKED_INDEPENDENCE |
| Supplemental item | C10-R3A-C7-CRACK-INDEPENDENT-CALC |
| Profile id used by the method fixture | EU-EN1992-1-1-GEN1-C7-SLS-REFERENCE |
| Generation | EN1992-1-1-GEN1 |
| Profile version | c7-r1-sls-reference |
| Method id of the demonstration | EU_RC_CRACK_WIDTH_EN1992_REFERENCE |
| Implementation version | c7-r2-crack-width-1 |
| Demonstration result fingerprint | fp:2d4187b8 |
| Primary source id | JRC_WALRAVEN_EC2_ULS_SLS_WORKSHOP |

The C10 row did not execute a numerical case and did not store an expected number. The values below are the method demonstration in eos-d1e-eu-c7-r2.test.ts. They do not close the C10 independence gap.

### Frozen demonstration inputs

| Input | Value | Unit |
| --- | --- | --- |
| Member | BEAM, not prestressed |  |
| Section | rectangle id beam, width 300, depth 500 | mm |
| Combination | sls-qp-1, quasi_permanent, SLS |  |
| nServiceN | 0 | N |
| mServiceNmm | 80000000 | N.mm |
| Concrete designation | C30 |  |
| fc | 30 | MPa |
| Ecm | 33000 | MPa |
| Reinforcement designation | B500 |  |
| fy | 500 | MPa |
| Es | 200000 | MPa |
| Reinforcement area property | 1600 | mm2 |
| fct,eff | 2.9 | MPa |
| fct,eff provenance | project-fct-eff |  |
| sigma_s | 240 | MPa |
| sigma_s limit state | SLS |  |
| sigma_s provenance | governed-sls-cracked-stress |  |
| Cover to bar surface | 30 | mm |
| Bar diameter | 20 | mm |
| As | 1600 | mm2 |
| Tension width | 300 | mm |
| h | 500 | mm |
| d | 450 | mm |
| x | 180 | mm |
| Surface | HIGH_BOND |  |
| Strain case | BENDING |  |
| Duration | LONG_TERM |  |
| w_max | 0.3 | mm |
| w_max requirement id | project-wmax |  |

sigma_s is an explicit input. The crack-width method does not calculate it.

### Method, factors, and equations

| Parameter | Value | Unit | Rule |
| --- | --- | --- | --- |
| coverCoefficient | 3.4 | 1 | EU_C7_R1_CRACK_SPACING, fp:4ec17e5a |
| barCoefficient | 0.425 | 1 | EU_C7_R1_CRACK_SPACING |
| k1 high bond | 0.8 | 1 |  |
| k1 plain | 1.6 | 1 | not selected by this fixture |
| k2 bending | 0.5 | 1 | selected |
| k2 tension | 1 | 1 | not selected by this fixture |
| kt short | 0.6 | 1 |  |
| kt long | 0.4 | 1 | selected, fp:d73b8891 |
| strainFloorFactor | 0.6 | 1 |  |
| effectiveHeightCoverFactor | 2.5 | 1 | EU_C7_R1_EFFECTIVE_TENSION_HEIGHT, fp:77fa77c2 |
| effectiveHeightAxisDivisor | 3 | 1 | same rule |

Section crack state, fp:ef0399f2: CRACKED when the elastic extreme tension exceeds explicit fct,eff. Effective tension height for bending: min(2.5*(h-d), (h-x)/3, h/2). rho_p,eff = As / Ac,eff, fp:0e5fc82e. alpha_e = Es / Ecm, fp:613766d7. Mean strain difference, fp:a6f8ad19: max((sigma_s - kt * (fct,eff / rho) * (1 + alpha_e * rho)) / Es, strainFloorFactor * sigma_s / Es). sr,max = coverCoefficient * c + k1 * k2 * barCoefficient * phi / rho_p,eff. wk = sr,max * (epsilon_sm - epsilon_cm), fp:a9e125b9.

### EOS demonstration result

| Result | Value | Unit |
| --- | --- | --- |
| calculationState | COMPLETE |  |
| sectionCrackState | CRACKED |  |
| extremeElasticTensionMPa | 6.4 | MPa |
| ecmMPa | 33000 | MPa |
| esMPa | 200000 | MPa |
| effectiveTensionHeightMm | 106.66666666666667 | mm |
| effectiveTensionAreaMm2 | 32000 | mm2 |
| effectiveReinforcementRatio | 0.05 | 1 |
| modularRatio | 6.0606060606060606 | 1 |
| tensionStiffeningFactor | 0.4 | 1 |
| meanStrainDifference | 0.001048848484848485 | 1 |
| maximumCrackSpacingMm | 170 | mm |
| crackWidthMm | 0.17830424242424245 | mm |
| crackLimitMm | 0.3 | mm |
| utilization | 0.5943474747474748 | 1 |
| checkState | SATISFIED | evaluator state against the supplied limit |

checkState is the evaluator state for this fixture. It is not a review outcome.

### Applicability and limitations

Scope stored on the pack: implemented crack-width method awaiting independent evidence. Exclusions include strong validation without independent evidence. Applicability stored on the method registry: ordinary non-prestressed rectangular beam or solid slab, quasi-permanent SLS, with explicit cover, diameter, reinforcement area, fct,eff, moduli, duration, bond, strain case, cracked-section steel stress, and project crack limit. Exclusions stored there: prestress, circular and flanged sections, minimum crack reinforcement, bar-diameter tables, bar-spacing tables, service stress limits, calculated creep, calculated shrinkage, deflection, and reinforcement design. One repository recovery found no second governed numerical source. Self-reference was not used as expected truth.

### Sources and tests

- packages/engineering-os/src/structural-concrete/eu-c7/evaluate.ts
- packages/engineering-os/src/structural-concrete/eu-c7/profile-binding.ts
- packages/engineering-os/src/structural-concrete/eu-c7/registry.ts
- packages/types/src/structural-concrete-eu-c7.ts
- packages/engineering-os/src/structural-concrete/eos-d1e-eu-c7-r2.test.ts
- packages/engineering-os/src/structural-concrete/eu-c10/benchmarks.ts, blocked row C10-R2-C7-CRACK-RECOVERY
- packages/engineering-os/src/structural-concrete/eu-c10/review-packs.ts

## 3. C10-R3A-PACK-C7-LONG-TERM

| Field | Value |
| --- | --- |
| Capability | D1E.EU.C7.EXPLICIT_LONG_TERM_STATE |
| Pack fingerprint | 9b2c325cdad7b78d |
| C10 benchmark | C10-R2-C7-LONG-TERM-RECOVERY |
| C10 method id | NOT_EXECUTED |
| C10 formula fingerprint | NONE |
| C10 parameter fingerprint | NONE |
| C10 benchmark status | BLOCKED_INDEPENDENCE |
| Supplemental item | C10-R3A-C7-LONG-TERM-INDEPENDENT-CALC |
| Profile | EU-EN1992-1-1-GEN1-C7-SLS-REFERENCE, generation EN1992-1-1-GEN1, version c7-r1-sls-reference |
| Method id of the demonstration | EU_RC_LONG_TERM_EXPLICIT_EN1992_REFERENCE |
| Implementation version | c7-r3-long-term-1 |
| Demonstration result fingerprint | fp:8e045af0 |
| Primary source id | JRC_WALRAVEN_EC2_ULS_SLS_WORKSHOP |

### Frozen demonstration inputs

| Input | Value | Unit |
| --- | --- | --- |
| Presence | CREEP_AND_SHRINKAGE |  |
| Concrete material ref | c7-conc, designation C30 |  |
| Section id | beam-a |  |
| Time context id | t-qp-50y |  |
| Reference time | 50y-quasi-permanent |  |
| Loading age | 28 | day |
| Evaluation age | 18250 | day |
| Authority | HUMAN_AUTHORED_VALIDATED_RULE |  |
| phi | 2.4 | 1 |
| phi provenance | project-creep-note-14 |  |
| phi applicability | beam-a-c30 |  |
| Shrinkage value | 0.00032 | strain, dimensionless |
| Shrinkage unit | STRAIN |  |
| Shrinkage sign representation | SHRINKAGE_MAGNITUDE_POSITIVE |  |
| Shrinkage provenance | project-shrink-note-14 |  |
| Shrinkage applicability | beam-a-c30 |  |
| calculateCreep | false |  |
| calculateShrinkage | false |  |

Microstrain normalization, when a caller supplies that unit, divides by SI_MICROSTRAIN_PER_UNIT_STRAIN = 1000000. This frozen case supplies STRAIN, so that divisor is not applied.

### Method

There is no creep equation and no shrinkage equation in this method. phi and the shrinkage magnitude are copied from the explicit inputs. Ages and the time-context labels are stored with the input and are not used to calculate either value. phi is not phiEf. No phi-to-phiEf transformation is implemented.

Profile parameters phi and epsilonCs have null stored values. They are classified TIME_SPECIFIC and remain explicit inputs.

### EOS demonstration result

| Result | Value | Unit |
| --- | --- | --- |
| accepted | true |  |
| presence | CREEP_AND_SHRINKAGE |  |
| creepCoefficient | 2.4 | 1 |
| creepUnit | 1 |  |
| shrinkageStrain | 0.00032 | 1 |
| shrinkageUnit | 1 |  |
| shrinkageSignConvention | SHRINKAGE_MAGNITUDE_POSITIVE |  |
| calculatedModel | false |  |
| phiEqualsPhiEf | false |  |

### Applicability and limitations

Scope: explicit creep coefficient and shrinkage state only. Exclusions: calculated creep model, calculated shrinkage model, and deflection. The C10 row is blocked on independence. No calculated long-term model is claimed.

### Sources and tests

- packages/engineering-os/src/structural-concrete/eu-c7/long-term.ts
- packages/engineering-os/src/structural-concrete/eu-c7/registry.ts
- packages/engineering-os/src/structural-concrete/eu-c7/profile-binding.ts
- packages/types/src/structural-concrete-eu-c7.ts
- packages/engineering-os/src/structural-concrete/eos-d1e-eu-c7-r3.test.ts
- packages/engineering-os/src/structural-concrete/eu-c10/benchmarks.ts, blocked row C10-R2-C7-LONG-TERM-RECOVERY

## 4. C10-R3A-PACK-C8-COVER

| Field | Value |
| --- | --- |
| Capability | D1E.EU.C8.COVER_ASSEMBLY |
| Pack fingerprint | 291c17190f884252 |
| C10 benchmark | C10-R2-C8-COVER-RECOVERY |
| C10 method id | NOT_EXECUTED |
| C10 formula fingerprint | NONE |
| C10 parameter fingerprint | NONE |
| C10 benchmark status | BLOCKED_INDEPENDENCE |
| Supplemental item | C10-R3A-C8-COVER-INDEPENDENT-CALC |
| Profile | EU-EN1992-1-1-GEN1-C8-DETAILING-REFERENCE |
| Profile version | c8-r1-cover-assembly-1 |
| Generation | EN1992-1-1-GEN1 |
| Method id of the demonstration | EU_RC_COVER_ASSEMBLY_EN1992_REFERENCE |
| cmin formula fingerprint | fp:7abcf9da |
| cnom formula fingerprint | fp:e469b9eb |
| Demonstration input fingerprint | fp:d5010bce |
| Source id | JRC_BOUCHON_VIENNA_2010_EN1992_COVER |

### Frozen demonstration inputs

The default fixture in eos-d1e-eu-c8-r2.test.ts:

| Input | Value | Unit |
| --- | --- | --- |
| bondCover | 40 | mm |
| durabilityCover | 25 | mm |
| deviationAllowance | 10 | mm |
| bond provenance | bond-input |  |
| durability provenance | durability-input |  |
| deviation provenance | deviation-input |  |
| absoluteMinimumCoverMm | 10 | mm, profile parameter |
| exposure class | absent |  |
| national annex claim | absent |  |

### Method

cminMm = max(bondCoverComponentMm, durabilityCoverComponentMm, absoluteMinimumCoverMm). nominalCoverMm = minimumCoverMm + deviationAllowanceMm. Durability cover is an explicit component. An exposure string does not set it. The deviation allowance is explicit. The recommended deviation is not applied automatically. Bond cover is not derived from bar diameter.

### EOS demonstration result

| Result | Value | Unit |
| --- | --- | --- |
| bondCoverComponentMm | 40 | mm |
| durabilityCoverComponentMm | 25 | mm |
| absoluteMinimumCoverMm | 10 | mm |
| minimumCoverMm | 40 | mm |
| deviationAllowanceMm | 10 | mm |
| nominalCoverMm | 50 | mm |
| governingMinimumComponent | BOND |  |
| checkState | COVER_REQUIREMENT_CALCULATED |  |
| memberCompliance | false |  |
| providedCoverComparisonState | NOT_BOUND |  |

### Applicability and limitations

Scope: cover assembly from explicit components. Exclusions: durability lookup and provided-cover compliance. The C10 row is blocked on a single governed source. memberCompliance false means this method does not decide member compliance.

### Sources and tests

- packages/engineering-os/src/structural-concrete/eu-c8/profile.ts
- packages/engineering-os/src/structural-concrete/eu-c8/evaluate.ts
- packages/engineering-os/src/structural-concrete/eu-c8/fingerprints.ts
- packages/engineering-os/src/structural-concrete/eos-d1e-eu-c8-r2.test.ts
- packages/engineering-os/src/structural-concrete/eu-c10/benchmarks.ts, blocked row C10-R2-C8-COVER-RECOVERY

## 5. C10-R3A-PACK-C8-SPACING

| Field | Value |
| --- | --- |
| Capability | D1E.EU.C8.MINIMUM_CLEAR_SPACING |
| Pack fingerprint | 98350cdff747d872 |
| C10 benchmark | C10-R2-C8-SPACING-RECOVERY |
| C10 method id | NOT_EXECUTED |
| C10 formula fingerprint | NONE |
| C10 parameter fingerprint | NONE |
| C10 benchmark status | BLOCKED_INDEPENDENCE |
| Supplemental item | C10-R3A-C8-SPACING-INDEPENDENT-CALC |
| Parent profile | EU-EN1992-1-1-GEN1-C8-DETAILING-REFERENCE |
| Spacing profile | EU-EN1992-1-1-GEN1-C8-SPACING-REFERENCE |
| Profile version | c8-r3-spacing-1 |
| Generation | EN1992-1-1-GEN1 |
| Method id of the demonstration | EU_RC_MIN_CLEAR_SPACING_EN1992_REFERENCE |
| smin formula fingerprint | fp:09e4034c |
| Demonstration result fingerprint | fp:68249489 |
| Source id | JRC_ARRIETA_BRUSSELS_2011_DETAILING |

### Frozen demonstration inputs

The default request in eos-d1e-eu-c8-r3b.test.ts:

| Input | Value | Unit |
| --- | --- | --- |
| barIdA, barIdB | bar-a, bar-b |  |
| spacingContext | HORIZONTAL_ADJACENT |  |
| reinforcementType | INDIVIDUAL_DEFORMED_BAR |  |
| nominalBarDiameter | 16 | mm |
| bar A centre | x 0, y 0 | mm |
| bar A diameter | 16 | mm |
| bar B centre | x 100, y 0 | mm |
| bar B diameter | 16 | mm |
| maximumAggregateSize | 20 | mm |
| barDiameterCoefficient | 1 | 1 |
| aggregateAllowance | 5 | mm |
| absoluteMinimumClearSpacingMm | 20 | mm, profile parameter |
| provenances | bar-input, aggregate-input, k-input, allowance-input |  |

Slide recommendations barDiameterCoefficient = 1 and aggregateAllowanceMm = 5 are recorded and are not applied automatically. This fixture supplies those numbers explicitly. The profile parameters for both coefficients remain null until supplied.

### Method

minimumClearSpacingMm = max(barDiameterCoefficient * nominalBarDiameterMm, maximumAggregateSizeMm + aggregateAllowanceMm, absoluteMinimumClearSpacingMm). Measurement is surface to surface. Measured clearance uses the existing bar-pair clearance barPairClearSpacingMm. Scope is equal-diameter adjacent bars. Unequal diameters, bundles, mesh, and prestress are outside the method.

### EOS demonstration result

| Result | Value | Unit |
| --- | --- | --- |
| barDiameterRequirementMm | 16 | mm |
| aggregateRequirementMm | 25 | mm |
| absoluteMinimumClearSpacingMm | 20 | mm |
| requiredClearSpacingMm | 25 | mm |
| governingRequirementComponent | AGGREGATE |  |
| measuredClearSpacingMm | 84 | mm |
| spacingUtilization | 0.2976190476190476 | 1 |
| checkState | SATISFIED | evaluator state for this fixture |

### Applicability and limitations

Scope: minimum clear spacing for equal-diameter adjacent bars. Exclusions: unequal diameter, bundles, mesh, and prestress. Profile and NDP inputs are not validated national parameters. The C10 row is blocked on a single governed source. A 25 mm illustration on the source slide is recorded as notation, not as a second rule.

### Sources and tests

- packages/engineering-os/src/structural-concrete/eu-c8/spacing-profile.ts
- packages/engineering-os/src/structural-concrete/eu-c8/spacing-evaluate.ts
- packages/engineering-os/src/structural-concrete/section-mechanics/bars.ts
- packages/engineering-os/src/structural-concrete/eos-d1e-eu-c8-r3b.test.ts
- packages/engineering-os/src/structural-concrete/eu-c10/benchmarks.ts, blocked row C10-R2-C8-SPACING-RECOVERY

## 6. C10-R3A-PACK-C8-ANCHORAGE

| Field | Value |
| --- | --- |
| Capability | D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE |
| Pack fingerprint | 02cfe936c1d0413c |
| C10 benchmark | C10-R2-C8-ANCHORAGE-RECOVERY |
| C10 method id | NOT_EXECUTED |
| C10 formula fingerprint | NONE |
| C10 parameter fingerprint | NONE |
| C10 benchmark status | BLOCKED_INDEPENDENCE |
| Supplemental item | C10-R3A-C8-ANCHORAGE-INDEPENDENT-CALC |
| Anchorage profile | EU-EN1992-1-1-GEN1-C8-ANCHORAGE-BASIC-REFERENCE |
| Parent profile | EU-EN1992-1-1-GEN1-C8-DETAILING-REFERENCE |
| Profile version | c8-r4-basic-anchorage-1 |
| Generation | EN1992-1-1-GEN1 |
| Method id of the demonstration | EU_RC_BASIC_REQUIRED_ANCHORAGE_EN1992_REFERENCE |
| Rule | EU_C8_R4_LB_RQD_BASIC |
| Formula fingerprint | fp:71b30066 |
| Demonstration result fingerprint | fp:bd2ca240 |
| Source id | JRC_ARRIETA_BRUSSELS_2011_DETAILING |
| Source citation stored on the profile | JRC Eurocode 2 Background and Applications, Brussels, 20-21 October 2011, anchorage-length slides |

### Frozen demonstration inputs

The default request in eos-d1e-eu-c8-r4b.test.ts:

| Input | Value | Unit |
| --- | --- | --- |
| barId | bar-1 |  |
| forceState | TENSION |  |
| barShape | STRAIGHT |  |
| reinforcementType | DEFORMED_BAR |  |
| nominalBarDiameter | 16 | mm |
| designSteelStress | 400 | MPa |
| design steel authority | PROJECT_DESIGN_STRESS |  |
| design steel provenance | sigma-input |  |
| designBondStrength | 2.5 | MPa |
| design bond authority | PROJECT_DESIGN_BOND_STRENGTH |  |
| design bond provenance | fbd-input |  |
| basicAnchorageDiameterDivisor | 4 | 1 |
| available length | absent |  |
| checkRequested | absent |  |

fyd is not substituted for the supplied design steel stress. Design bond strength is not derived inside this method. Design-length factors and the bond-stress product are not selected.

### Method

basicRequiredAnchorageLengthMm = (nominalBarDiameterMm / basicAnchorageDiameterDivisor) * (designSteelStressMPa / designBondStrengthMPa). Zero design steel stress is allowed and returns length 0. Zero design bond strength is rejected. The result is a basic required length. It is not a design anchorage length and not a lap length.

### EOS demonstration result

| Result | Value | Unit |
| --- | --- | --- |
| nominalBarDiameterMm | 16 | mm |
| basicAnchorageDiameterDivisor | 4 | 1 |
| designSteelStressMPa | 400 | MPa |
| designBondStrengthMPa | 2.5 | MPa |
| basicRequiredAnchorageLengthMm | 640 | mm |
| fullDesignAnchorageImplemented | false |  |
| warnings | BASIC_REQUIRED_LENGTH_ONLY |  |
| checkState | null | no available length was supplied |

### Applicability and limitations

Scope: basic required anchorage of one tension straight deformed bar. Exclusions: design anchorage, compression anchorage, and laps. Explicit stress and bond stress are not automatically classified as validated nationally determined parameters. The C10 row is blocked on a single governed source.

### Sources and tests

- packages/engineering-os/src/structural-concrete/eu-c8/anchorage-profile.ts
- packages/engineering-os/src/structural-concrete/eu-c8/anchorage-evaluate.ts
- packages/engineering-os/src/structural-concrete/eos-d1e-eu-c8-r4b.test.ts
- packages/engineering-os/src/structural-concrete/eu-c10/benchmarks.ts, blocked row C10-R2-C8-ANCHORAGE-RECOVERY
