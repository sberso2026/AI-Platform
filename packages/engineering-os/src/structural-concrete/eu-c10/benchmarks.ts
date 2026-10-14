/**
 * EOS-D1E-EU-C10-R2 independent method and member benchmark execution.
 * Expected numerical truth is a published anchor or a closed-form derivation.
 * Production evaluators are the system under test. They do not mint expected values.
 */
import { createHash } from "node:crypto";
import {
  D1C_TORSIONAL_ACTION_AXIS,
  D1C_TORSIONAL_ACTION_ID,
  D1C_TORSIONAL_ACTION_SIGN_CONVENTION,
  D1C_TORSIONAL_ACTION_TYPE,
  D1C_TORSIONAL_ACTION_UNIT,
  EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE,
  EU_C1C_R1_PARAMETER_VERSION,
  EU_C2_NUMERICAL_TOLERANCE,
  EU_C3_METHOD_IDS,
  EU_C4_METHOD_IDS,
  EU_C4_NUMERICAL_TOLERANCE,
  EU_C5_PUNCHING_PERIMETER_TOLERANCE_MM,
  EU_C5_PUNCHING_PUBLISHED_STRESS_TOLERANCE_MPA,
  EU_C5_SHEAR_PUBLISHED_BENCHMARK_TOLERANCE_N,
  EU_C5_SHEAR_PUBLISHED_FORCE_TOLERANCE_N,
  EU_C5_T4_RELATIVE_TOLERANCE,
  EU_C5_T4_RESISTANCE_TOLERANCE_NM,
  EU_C5_VMIN_EXPRESSION_ID,
  EU_C6_R1_CURVATURE_FACTOR_LOWER_BOUND,
  EU_C6_R1_CURVATURE_FACTOR_UPPER_BOUND,
  EU_C6_R1_PROFILE_VERSION,
  EU_C6_R1_REFERENCE_PROFILE_GENERATION,
  EU_C6_R1_REFERENCE_PROFILE_ID,
  EU_C6_R2_AXIAL_SIGN_CONVERSION_COUNT,
  EU_C6_R2_METHOD_ID,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  type ConcreteMaterial,
  type EuC1cR1DeclaredNdpValue,
  type ReinforcementLayout,
  type ReinforcementMaterial,
} from "@rtb/types";
import { evaluateEuC1ConcreteDesignProperties, evaluateEuC1ReinforcementDesignProperties } from "../eu-c1c-r1/evaluate";
import { evaluateEuC2UniaxialFlexureResistance, independentEquivalentRectangularResistance } from "../eu-c2";
import { evaluateEuC3InteractionPoint, independentEquivalentRectangularNm } from "../eu-c3";
import { evaluateEuC4InteractionPoint, independentDiagonalVertexNm } from "../eu-c4";
import { evaluateEuC5Punching, evaluateEuC5Shear, evaluateEuC5Torsion, type EuC5EvaluateInput } from "../eu-c5";
import { EU_C8_R2_COVER_RULE_SOURCE_INDEPENDENCE_STATE } from "../eu-c8/evaluate";
import { EU_C8_R3B_RULE_SOURCE_INDEPENDENCE_STATE } from "../eu-c8/spacing-evaluate";
import { EU_C8_R4B_RULE_SOURCE_INDEPENDENCE_STATE } from "../eu-c8/anchorage-evaluate";
import {
  EU_C6_R1_PARAMETERS,
  EU_C6_R2_C_PARAMETER_AUTHORITY,
  evaluateEuC6NominalCurvature,
  selectEuC6EffectiveLength,
  type EuC6NominalCurvatureInput,
} from "../eu-c6";
import { EU_C7_R1_PROFILE_SOURCES } from "../eu-c7/profile-binding";
import {
  EU_C9_R2_C6_INVOKED_FOR_BEAM,
  EU_C9_R2_PUNCHING_STATE,
  orchestrateEuC9R2Beam,
  routeEuC9R2SectionAction,
  type EuC9R2SectionActions,
} from "../eu-c9/beam";
import { EU_C9_R3_C6_OUTPUT_USED_FOR_C4, orchestrateEuC9R3Column, routeEuC9R3ColumnSection } from "../eu-c9/column";
import { EU_C9_R4_TWO_WAY_SLAB_BENDING_AUTOMATICALLY_ROUTED_TO_C4, routeEuC9R4StripFlexure } from "../eu-c9/slab";
import { EU_C9_R5_C6_INVOKED_FOR_WALL, orchestrateEuC9R5WallSection, routeEuC9R5WallSection } from "../eu-c9/wall";
import { circularSection, computeGrossSectionProperties, rectangleSection } from "../section-mechanics";
import {
  EU_C10_BENCHMARK_INDEPENDENCE_LEVELS,
  EU_C10_DEFERRED_CAPABILITY_INVENTORY,
  EU_C10_IMPLEMENTED_CAPABILITY_INVENTORY,
  EU_C10_R2_BENCHMARK_GROUPS,
  EU_C10_R2_BENCHMARK_PRIORITY_ORDER,
  EU_C10_TOLERANCE_CATEGORIES,
} from "./readiness";

export const EU_C10_R2_BENCHMARK_EQUALS_ENGINEER_VALIDATION = false as const;
export const EU_C10_R2_BENCHMARK_EQUALS_FORMAL_CONFORMANCE = false as const;
export const EU_C10_R2_BENCHMARK_EQUALS_CERTIFICATION = false as const;
export const EU_C10_R2_MINIMUM_COUNTABLE_INDEPENDENCE_LEVEL = "LEVEL_1_INDEPENDENT_TEST_DERIVATION" as const;
export const LEVEL_0_ACCEPTABLE_AS_INDEPENDENT_VALIDATION = false as const;
export const EU_C10_R2_SELF_REFERENCE_COUNTS_AS_INDEPENDENT = false as const;
export const LLM_GENERATED_EXPECTED_VALUE_ALLOWED = false as const;
export const AUTO_UPDATE_EXPECTED_VALUES_FROM_PRODUCTION = false as const;
export const EU_C10_R2_PROFILE_PARAMETER_EQUALS_NDP = false as const;
export const EU_C10_R2_EXPLICIT_ENGINEERING_INPUT_EQUALS_NDP = false as const;
export const EU_C10_R2_DESIGNER_SELECTED_PARAMETER_EQUALS_NDP = false as const;
export const EU_C10_R2_C6_PHIEF_CLASSIFIED_AS_NDP = false as const;
export const EU_C10_R2_C6_C_CLASSIFIED_AS_NDP = false as const;
export const EU_C10_R2_PROFILE_BOUND_PARAMETER_AUTOMATICALLY_CLASSIFIED_AS_NDP = false as const;
export const EU_C10_R2_GAMMA_FACTOR_CLASSIFICATION_STATE =
  "EXPLICIT_DECLARED_PARTIAL_FACTOR_INPUT_NATIONAL_NDP_STATUS_DEFERRED_TO_C10_R4" as const;
export const EU_C10_R2_GENUINE_NDP_CANDIDATES = [
  "C5_CRd_c_DECLARED_INPUT_NOT_NATIONALLY_VALIDATED",
  "C5_v_min_coefficient_DECLARED_INPUT_NOT_NATIONALLY_VALIDATED",
  "C8_SPACING_barDiameterCoefficient_EXPLICIT_NDP_INPUT_NOT_NATIONALLY_VALIDATED",
  "C8_SPACING_aggregateAllowanceMm_EXPLICIT_NDP_INPUT_NOT_NATIONALLY_VALIDATED",
] as const;
export const EU_C10_R2_PROFILE_PARAMETER_CANDIDATES = [
  "C6_nBal", "C6_betaConstant", "C6_betaFckDivisor", "C6_betaLambdaDivisor", "C6_curvatureBaseFactor",
  "C6_momentWeightHigh", "C6_momentWeightLow", "C7_reference_profile_coefficients",
  "C8_COVER_absoluteMinimumCoverMm", "C8_ANCHORAGE_diameterDivisor",
] as const;
export const EU_C10_R2_EXPLICIT_INPUT_PARAMETERS = [
  "C6_phiEf", "C6_effectiveLength", "C6_endMoments", "C8_BASIC_ANCHORAGE_sigmaSd", "C8_BASIC_ANCHORAGE_fbd",
  "C2_C3_C4_gamma_c_gamma_s_CLASSIFICATION_DEFERRED",
] as const;
export const EU_C10_R2_DESIGNER_SELECTED_PARAMETERS = ["C6_c_WITHIN_GOVERNED_BOUNDS_8_TO_10"] as const;
export const EU_C10_R2_ALL_CAPABILITIES_MUST_PASS_TO_CONTINUE = false as const;
export const EU_C10_R2_SINGLE_GLOBAL_PERCENT_TOLERANCE_USED = false as const;
export const EU_C10_R2_FAILED_BENCHMARK_AUTO_REBASED = false as const;
export const EU_C10_R2_SOURCE_CONFLICT_FAILS_CLOSED = true as const;
export const AI_SOURCE_CONFLICT_SELECTION_AUTHORITY = false as const;
export const EU_C10_R2_STALE_EVIDENCE_REUSE_ALLOWED = false as const;
export const EU_C10_R2_C4_BENCHMARK_PROMOTES_MEMBER_STABILITY = false as const;
export const EU_C10_R2_C6_SLENDERNESS_NEGLECT_RULE_INVENTED = false as const;
export const EU_C10_R2_C6_EFFECTIVE_LENGTH_INFERRED = false as const;
export const EU_C10_R2_C5_SHEAR_BENCHMARK_EQUALS_NDP_VALIDATION = false as const;
export const EU_C10_R2_PUNCHING_SCOPE_BROADENED = false as const;
export const EU_C10_R2_TORSION_SCOPE_BROADENED = false as const;
export const EU_C10_R2_LONG_TERM_BENCHMARK_PROMOTES_CALCULATED_CREEP = false as const;
export const EU_C10_R2_LONG_TERM_BENCHMARK_PROMOTES_CALCULATED_SHRINKAGE = false as const;
export const EU_C10_R2_COVER_BENCHMARK_EQUALS_DURABILITY_DESIGN_VALIDATION = false as const;
export const EU_C10_R2_COVER_BENCHMARK_EQUALS_PROVIDED_COVER_COMPLIANCE = false as const;
export const EU_C10_R2_SPACING_BENCHMARK_PROMOTES_UNEQUAL_DIAMETER_SCOPE = false as const;
export const EU_C10_R2_SPACING_BENCHMARK_EQUALS_ANCHORAGE_CONFINEMENT_VALIDATION = false as const;
export const EU_C10_R2_BASIC_ANCHORAGE_BENCHMARK_EQUALS_DESIGN_ANCHORAGE_VALIDATION = false as const;
export const EU_C10_R2_BASIC_ANCHORAGE_BENCHMARK_EQUALS_COMPRESSION_ANCHORAGE = false as const;
export const EU_C10_R2_BASIC_ANCHORAGE_BENCHMARK_EQUALS_LAP_VALIDATION = false as const;
export const EU_C10_R2_SINGLE_SOURCE_RECOVERY_HARD_STOP_ENFORCED = true as const;
export const EU_C10_R2_ORCHESTRATOR_EQUIVALENCE_PROVES_UNDERLYING_FORMULA_TRUTH = false as const;
export const EU_C10_R2_ORCHESTRATOR_EXPECTED_STATE_SELF_GENERATED = false as const;
export const EU_C10_R2_C3_PURE_AXIAL_AXIS_GUESSED = false as const;
export const EU_C10_R2_BENCHMARK_PASS_AUTOMATICALLY_CHANGES_MATURITY_TO_ENGINEER_VALIDATED = false as const;
export const NEW_C10_R2_ENGINEERING_FORMULA_IMPLEMENTED = false as const;
export const NEW_C10_R2_ENGINEERING_RUNTIME_METHOD_IMPLEMENTED = false as const;
export const NEW_C10_R2_MEMBER_ORCHESTRATOR_IMPLEMENTED = false as const;
export const NEW_STRUCTURAL_ANALYSIS_ENGINE_IMPLEMENTED = false as const;
export const EU_C10_R2_C7_CRACK_WIDTH_INDEPENDENCE_RECOVERY = "NO_SECOND_GOVERNED_SOURCE_IN_REPOSITORY" as const;
export const EU_C10_R2_C7_LONG_TERM_INDEPENDENCE_RECOVERY = "NO_SECOND_GOVERNED_SOURCE_IN_REPOSITORY" as const;
export const EU_C10_R2_C8_COVER_INDEPENDENCE_RECOVERY = "NO_SECOND_GOVERNED_SOURCE_IN_REPOSITORY" as const;
export const EU_C10_R2_C8_SPACING_INDEPENDENCE_RECOVERY = "NO_SECOND_GOVERNED_SOURCE_IN_REPOSITORY" as const;
export const EU_C10_R2_C8_BASIC_ANCHORAGE_INDEPENDENCE_RECOVERY = "NO_SECOND_GOVERNED_SOURCE_IN_REPOSITORY" as const;

export const EU_C10_R2_ITERATIVE_TOLERANCE_CONTRACT = {
  category: "ITERATIVE_EQUILIBRIUM",
  c2: EU_C2_NUMERICAL_TOLERANCE,
  c4: EU_C4_NUMERICAL_TOLERANCE,
  note: "Named equilibrium and resistance-comparison contracts. Not a universal percentage.",
} as const;

export const EU_C10_R2_EXTERNAL_COMPARISON_DIFFERENCE_RECORDS = [
  {
    recordId: "C2_C3_C4_RECTANGLE_VS_PARABOLA",
    classification: "MATERIAL_MODEL_DIFFERENCE",
    detail: "Independent expectation uses an equivalent rectangular concrete block or a standalone fiber hand mesh. Production uses governed material integration. The difference is classified and is not averaged.",
  },
  {
    recordId: "C5_PUBLISHED_ANCHOR_NOT_TOOL_VERSION",
    classification: "PUBLISHED_NUMERIC_ANCHOR",
    detail: "Published numeric anchors are used. No external-tool version comparison was executed.",
  },
] as const;

export type EuC10R2BenchmarkStatus = "PASS" | "FAIL" | "BLOCKED_INDEPENDENCE" | "BLOCKED_PROFILE" | "BLOCKED_SOURCE_CONFLICT" | "NOT_APPLICABLE";

export type EuC10R2BenchmarkRecord = {
  benchmarkId: string;
  capabilityId: string;
  methodId: string;
  methodVersion: string;
  profileId: string;
  generation: string;
  sourceId: string;
  sourceAuthority: string;
  independenceLevel: (typeof EU_C10_BENCHMARK_INDEPENDENCE_LEVELS)[number] | "NOT_COUNTABLE";
  inputSummary: string;
  inputUnits: string;
  expectedSummary: string;
  expectedUnits: string;
  toleranceClass: (typeof EU_C10_TOLERANCE_CATEGORIES)[number] | "NOT_APPLICABLE";
  toleranceRule: string;
  derivationNote: string;
  formulaFingerprint: string;
  parameterFingerprint: string;
  executionResult: string;
  evidenceStatus: EuC10R2BenchmarkStatus;
  limitations: string;
  profileValueAssumed: boolean;
};

function fingerprint(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function within(actual: number, expected: number, abs: number, rel: number): boolean {
  return Number.isFinite(actual) && Number.isFinite(expected) && Math.abs(actual - expected) <= Math.max(abs, rel * Math.abs(expected));
}

function property(name: string, value: number, unit: string) {
  return { name, value, unit, provenanceRef: "c10-r2", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
}

function declaredNdp(value: number): EuC1cR1DeclaredNdpValue {
  return {
    value, unit: "dimensionless", sourceAuthority: EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE,
    provenanceRef: "test-only-non-conformance", ndpIdentity: "DECLARED_PROJECT_OVERRIDE", version: EU_C1C_R1_PARAMETER_VERSION,
  };
}

function context() {
  return { nationalAnnexRef: "DECLARED_TEST_NA", gamma_c: declaredNdp(1.5), gamma_s: declaredNdp(1.15), alpha_cc: declaredNdp(1), testOnlyNonConformance: true };
}

function concrete(fc = 30): ConcreteMaterial {
  return {
    materialRef: "c10-r2-conc", designation: "C30", compressiveStrength: property("fc", fc, "MPa"), tensileStrength: null,
    elasticModulus: property("Ec", 33000, "MPa"), density: null, poissonRatio: null, age: null, strengthReferenceAge: null,
    materialClass: null, materialStandardRef: "project", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    testCertificateRef: "tc", environmentalMetadata: null, version: "c10-r2", provenance: property("p", 0, "1") as never,
  };
}

function reo(fy = 500): ReinforcementMaterial {
  return {
    materialRef: "c10-r2-reo", designation: "B500", yieldStrength: property("fy", fy, "MPa"), ultimateStrength: null,
    elasticModulus: property("Es", 200000, "MPa"), ductilityClass: null, productStandardRef: "project",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE", version: "c10-r2", provenance: property("p", 0, "1") as never,
  };
}

function bar(id: string, xMm: number, yMm: number, areaMm2: number, face: string): ReinforcementLayout["bars"][number] {
  return {
    barId: id, designation: "H20", diameterMm: property("d", 20, "mm"), areaMm2: property("As", areaMm2, "mm2"),
    count: 1, xMm, yMm, layerId: null, face, direction: "longitudinal", spacingMm: null, groupId: null,
    materialRef: "c10-r2-reo", anchorageMetadata: null, lapMetadata: null, provenanceRef: "c10-r2",
  };
}

function layout(rows: ReinforcementLayout["bars"]): ReinforcementLayout {
  return { layoutId: "lay-c10-r2", bars: rows, groups: [], layers: [], transverse: [], provenanceRef: "c10-r2" };
}

const singlyBottom = layout([bar("b1", 50, 50, 314, "bottom"), bar("b2", 150, 50, 314, "bottom"), bar("b3", 250, 50, 314, "bottom")]);
const symmetric = layout([
  bar("b1", 50, 50, 314, "bottom"), bar("b2", 250, 50, 314, "bottom"),
  bar("t1", 50, 450, 314, "top"), bar("t2", 250, 450, 314, "top"),
]);

function handBars(rows: ReinforcementLayout): { xMm: number; yMm: number; areaMm2: number }[] {
  return rows.bars.map((row) => ({ xMm: row.xMm ?? 0, yMm: row.yMm ?? 0, areaMm2: Number(row.areaMm2?.value ?? 0) }));
}

function profileNumber(id: string): number {
  const row = EU_C6_R1_PARAMETERS.find((item) => item.parameterId === id);
  if (typeof row?.value !== "number") throw new Error(`missing C6 profile parameter ${id}`);
  return row.value;
}

function quantity(value: number, unit: string): EuC5EvaluateInput["cRdC"] {
  return { value, unit, sourceRef: "declared-reference-benchmark" };
}

function shearDemand(valueN: number): EuC5EvaluateInput["demand"] {
  return {
    resultId: "d1c-c10-r2", capacityPresent: false, memberId: "m-c10-r2", combinationId: "uls-1",
    shear: { value: valueN, unit: "N", locationM: 0.25, signed: valueN }, torsion: { status: "NOT_IMPLEMENTED" },
  };
}

function shearCase(patch: Partial<EuC5EvaluateInput> = {}): EuC5EvaluateInput {
  return {
    demand: shearDemand(40000), generation: "FIRST_GENERATION", axialForceN: 0, designShearReinforcement: "NONE",
    effectiveDepth: quantity(372, "mm"), webWidth: quantity(250, "mm"),
    longitudinalTensionArea: quantity(0.0061 * 250 * 372, "mm2"), fck: quantity(25, "MPa"),
    cRdC: quantity(0.12, "dimensionless"), vMinCoefficient: quantity(0.035, "dimensionless"),
    vMinExpressionId: EU_C5_VMIN_EXPRESSION_ID, ...patch,
  };
}

function torsionDemand(signedNm: number): EuC5EvaluateInput["demand"] {
  return {
    resultId: "d1c-c10-r2-t", capacityPresent: false, memberId: "m-c10-r2", combinationId: "uls-t",
    shear: { value: 0, unit: "N", locationM: 0, signed: 0 },
    torsion: {
      status: "TRANSPORTED", actionId: D1C_TORSIONAL_ACTION_ID, actionType: D1C_TORSIONAL_ACTION_TYPE,
      signedValueNm: signedNm, unit: D1C_TORSIONAL_ACTION_UNIT, axis: D1C_TORSIONAL_ACTION_AXIS,
      signConvention: D1C_TORSIONAL_ACTION_SIGN_CONVENTION, combinationId: "uls-t",
      provenance: { evidenceId: "ev-t", sourceDiscipline: "STRUCTURAL", sourceObjectId: "member", revision: "A" },
      fingerprint: "fp-c10-r2",
    },
  };
}

function independentTorsionNm(width: number, height: number, wall: number | null, fck: number, alpha: number, gammaC: number, cot: number): number {
  const area = width * height;
  const perimeter = 2 * (width + height);
  const thickness = wall == null ? area / perimeter : Math.min(area / perimeter, wall);
  const innerWidth = width - thickness;
  const innerHeight = height - thickness;
  const enclosed = innerWidth * innerHeight;
  const nu = 0.6 * (1 - fck / 250);
  const fcd = (alpha * fck) / gammaC;
  const strut = cot / (1 + cot * cot);
  return (2 * nu * fcd * enclosed * thickness * strut) / 1000;
}

function actions(patch: Partial<EuC9R2SectionActions> = {}): EuC9R2SectionActions {
  return {
    axial: { status: "NO_AXIAL_COMPONENTS", valueN: 0 },
    majorMoment: { status: "PRESENT", signedNm: 50000 },
    minorMoment: { status: "ABSENT" },
    ...patch,
  };
}

function c6Input(overrides: Partial<EuC6NominalCurvatureInput> = {}): EuC6NominalCurvatureInput {
  return {
    profileId: EU_C6_R1_REFERENCE_PROFILE_ID, generation: EU_C6_R1_REFERENCE_PROFILE_GENERATION, profileVersion: EU_C6_R1_PROFILE_VERSION,
    nationalAnnexClaim: false, stale: false, sourceConflictUnresolved: false,
    geometry: rectangleSection("c10-r2-c6", 300, 500, "c10-r2"), axis: "MAJOR_AXIS", l0Mm: 3000,
    c: EU_C6_R1_CURVATURE_FACTOR_UPPER_BOUND, phiEf: 1, esMPa: 200000, dMm: 450, asMm2: 2000,
    m01Nmm: 10e6, m02Nmm: 20e6, nEdCompressionN: 500e3, concrete: concrete(30), reinforcement: reo(500), context: context(),
    ...overrides,
  };
}

function independentC6(sample: EuC6NominalCurvatureInput) {
  const concreteDesign = evaluateEuC1ConcreteDesignProperties({ concrete: sample.concrete, context: sample.context });
  const reinforcementDesign = evaluateEuC1ReinforcementDesignProperties({
    reinforcement: sample.reinforcement,
    area: { name: "As", value: sample.asMm2 ?? 0, unit: "mm2", provenanceRef: "c10-r2", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    context: sample.context,
  });
  if (!concreteDesign.ok || !reinforcementDesign.ok || sample.l0Mm == null || sample.c == null || sample.phiEf == null || sample.esMPa == null || sample.dMm == null || sample.asMm2 == null || sample.m01Nmm == null || sample.m02Nmm == null || sample.nEdCompressionN == null) {
    throw new Error("C6 independent case is incomplete");
  }
  const properties = computeGrossSectionProperties(sample.geometry);
  const inertia = sample.axis === "MAJOR_AXIS" ? properties.IxMm4 : properties.IyMm4;
  const area = properties.grossConcreteAreaMm2;
  const radius = Math.sqrt(inertia / area);
  const slenderness = sample.l0Mm / radius;
  const fcd = concreteDesign.outputs.fcdMPa;
  const fyd = reinforcementDesign.outputs.fydMPa;
  const fck = concreteDesign.outputs.fckMPa;
  const n = sample.nEdCompressionN / (area * fcd);
  const omega = (sample.asMm2 * fyd) / (area * fcd);
  const nu = 1 + omega;
  const kr = Math.min((nu - n) / (nu - profileNumber("nBal")), 1);
  const beta = profileNumber("betaConstant") + fck / profileNumber("betaFckDivisor") - slenderness / profileNumber("betaLambdaDivisor");
  const kphi = Math.max(1, 1 + beta * sample.phiEf);
  const curvature = (kr * kphi * fyd) / (sample.esMPa * profileNumber("curvatureBaseFactor") * sample.dMm);
  const weighted = profileNumber("momentWeightHigh") * sample.m02Nmm + profileNumber("momentWeightLow") * sample.m01Nmm;
  const floor = profileNumber("momentWeightLow") * sample.m02Nmm;
  const m0e = sample.m02Nmm >= 0 ? Math.max(weighted, floor) : Math.min(weighted, floor);
  const e2Mm = (curvature * sample.l0Mm * sample.l0Mm) / sample.c;
  const e2FromMetres = ((curvature * 1000) * (sample.l0Mm / 1000) ** 2) / sample.c;
  const m2 = sample.nEdCompressionN * e2Mm;
  const total = m0e + Math.sign(m0e) * m2;
  return { slenderness, kr, kphi, curvature, m0e, e2Mm, e2FromMetres, m2, total, c3Axial: -sample.nEdCompressionN };
}

export type EuC10R2Execution = {
  ledger: EuC10R2BenchmarkRecord[];
  negativePass: boolean;
  profileMismatchPass: boolean;
  stalePass: boolean;
  unitPass: boolean;
  c6IntermediateChecked: boolean;
  c6C3Handoff: boolean;
  boundaryResults: Record<string, "PASS" | "FAIL">;
};

export function executeEuC10R2Benchmarks(): EuC10R2Execution {
  const ledger: EuC10R2BenchmarkRecord[] = [];
  let negativePass = true;
  let profileMismatchPass = true;
  let stalePass = true;
  let unitPass = true;
  const boundary: Record<string, "PASS" | "FAIL"> = {};
  const geometry = rectangleSection("c10-r2-rect", 300, 500, "c10-r2");
  const section = { widthMm: 300, depthMm: 500, bars: handBars(singlyBottom), fcdMPa: 20, fydMPa: 500 / 1.15, esMPa: 200000, axis: "MAJOR_AXIS" as const, momentSign: "POSITIVE" as const };

  const c2Expected = independentEquivalentRectangularResistance(section);
  const c2 = evaluateEuC2UniaxialFlexureResistance({
    methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR", axis: "MAJOR_AXIS", momentSign: "POSITIVE", geometry, layout: singlyBottom,
    concrete: concrete(), reinforcement: reo(), context: context(), resolutionX: 20, resolutionY: 20, provenanceRef: "c10-r2-c2",
  });
  const c2Pass = c2.ok && within(c2.resistanceMomentNm, c2Expected.resistanceMomentNm, EU_C2_NUMERICAL_TOLERANCE.resistanceComparisonAbsNm, EU_C2_NUMERICAL_TOLERANCE.resistanceComparisonRel);
  const c2Circle = evaluateEuC2UniaxialFlexureResistance({
    methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR", axis: "MAJOR_AXIS", momentSign: "POSITIVE",
    geometry: circularSection("c10-r2-circ", 400, "c10-r2"), layout: singlyBottom, concrete: concrete(), reinforcement: reo(), context: context(), provenanceRef: "c10-r2-c2-circ",
  });
  const c2Missing = evaluateEuC2UniaxialFlexureResistance({
    methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR", axis: "MAJOR_AXIS", momentSign: "POSITIVE", geometry, layout: singlyBottom,
    concrete: concrete(), reinforcement: reo(), context: { nationalAnnexRef: "DECLARED_TEST_NA", testOnlyNonConformance: true }, provenanceRef: "c10-r2-c2-ndp",
  });
  if (c2Circle.ok || c2Missing.ok) negativePass = false;
  if (c2.ok && c2.resistanceMomentUnit !== "N.m") unitPass = false;
  boundary.C2_UNSUPPORTED_GEOMETRY = c2Circle.ok ? "FAIL" : "PASS";
  boundary.C2_MISSING_PARTIAL_FACTOR = c2Missing.ok ? "FAIL" : "PASS";
  ledger.push({
    benchmarkId: "C10-R2-C2-RECT-FLEXURE", capabilityId: "D1E.EU.C2.FLEXURE.UNIAXIAL", methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
    methodVersion: "EU_C2_FLEXURE", profileId: "DECLARED_TEST_PARTIAL_FACTORS", generation: "DECLARED_TEST",
    sourceId: "EQUIVALENT_RECTANGULAR_HAND_DERIVATION", sourceAuthority: "INDEPENDENT_CLOSED_FORM", independenceLevel: "LEVEL_1_INDEPENDENT_TEST_DERIVATION",
    inputSummary: "300x500 mm, three 314 mm2 bottom bars, fck 30 MPa, fyk 500 MPa", inputUnits: "mm, mm2, MPa",
    expectedSummary: String(c2Expected.resistanceMomentNm), expectedUnits: "N.m", toleranceClass: "ITERATIVE_EQUILIBRIUM",
    toleranceRule: "EU_C2_NUMERICAL_TOLERANCE resistance comparison", derivationNote: "Equivalent rectangle. Production fiber integration may differ. Difference is classified.",
    formulaFingerprint: c2.ok ? c2.resultFingerprint : "NONE", parameterFingerprint: fingerprint("declared-partial-factor-set"),
    executionResult: c2.ok ? String(c2.resistanceMomentNm) : c2.checkState, evidenceStatus: c2Pass ? "PASS" : "FAIL",
    limitations: "LEVEL_1 hand model. Not engineer validation.", profileValueAssumed: false,
  });

  const c3Expected = independentEquivalentRectangularNm(section, 0);
  const c3 = evaluateEuC3InteractionPoint({
    methodId: EU_C3_METHOD_IDS[0], axis: "MAJOR_AXIS", momentSign: "POSITIVE", geometry, layout: singlyBottom,
    concrete: concrete(), reinforcement: reo(), context: context(), targetAxialN: 0, resolutionX: 16, resolutionY: 16, provenanceRef: "c10-r2-c3",
  });
  const c3Pass = c3.ok && within(c3.resistanceMomentNm, c3Expected.resistanceMomentNm, EU_C2_NUMERICAL_TOLERANCE.resistanceComparisonAbsNm, EU_C2_NUMERICAL_TOLERANCE.resistanceComparisonRel);
  const pureMissing = routeEuC9R3ColumnSection({
    mode: "SECTION_UNIAXIAL",
    actions: { axial: { status: "AXIAL_DIRECT", valueN: -100000 }, majorMoment: { status: "ABSENT" }, minorMoment: { status: "ABSENT" } },
  });
  const pureDeclared = routeEuC9R3ColumnSection({
    mode: "SECTION_UNIAXIAL",
    actions: { axial: { status: "AXIAL_DIRECT", valueN: -100000 }, majorMoment: { status: "ABSENT" }, minorMoment: { status: "ABSENT" }, pureAxialSectionAxis: "MAJOR_AXIS" },
  });
  if (pureMissing.reason !== "PURE_AXIAL_REQUIRES_EXPLICIT_AXIS" || pureDeclared.axis !== "MAJOR_AXIS" || !pureDeclared.executesC3) negativePass = false;
  boundary.C3_PURE_AXIAL_EXPLICIT_AXIS = pureDeclared.axis === "MAJOR_AXIS" ? "PASS" : "FAIL";
  ledger.push({
    benchmarkId: "C10-R2-C3-ZERO-AXIAL", capabilityId: "D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL", methodId: EU_C3_METHOD_IDS[0],
    methodVersion: "EU_C3_AXIAL_FLEXURE", profileId: "DECLARED_TEST_PARTIAL_FACTORS", generation: "DECLARED_TEST",
    sourceId: "EQUIVALENT_RECTANGULAR_NM_HAND_DERIVATION", sourceAuthority: "INDEPENDENT_CLOSED_FORM", independenceLevel: "LEVEL_1_INDEPENDENT_TEST_DERIVATION",
    inputSummary: "Same rectangle at explicit target axial 0 N and explicit MAJOR_AXIS", inputUnits: "N, mm, MPa",
    expectedSummary: String(c3Expected.resistanceMomentNm), expectedUnits: "N.m", toleranceClass: "ITERATIVE_EQUILIBRIUM",
    toleranceRule: "EU_C2_NUMERICAL_TOLERANCE resistance comparison", derivationNote: "Zero axial is an explicit target. Pure axial routing requires a declared axis.",
    formulaFingerprint: c3.ok ? c3.resultFingerprint : "NONE", parameterFingerprint: fingerprint("axis=MAJOR;N=0"),
    executionResult: c3.ok ? String(c3.resistanceMomentNm) : c3.checkState, evidenceStatus: c3Pass ? "PASS" : "FAIL",
    limitations: "Does not validate member stability.", profileValueAssumed: false,
  });

  const diagonal = { ...section, bars: handBars(symmetric) };
  const c4Expected = independentDiagonalVertexNm(diagonal, 0);
  const c4 = evaluateEuC4InteractionPoint({
    methodId: EU_C4_METHOD_IDS[0], geometry, layout: symmetric, concrete: concrete(), reinforcement: reo(), context: context(),
    targetAxialN: 0, momentDirectionRad: Math.PI / 4, resolutionX: 12, resolutionY: 12, provenanceRef: "c10-r2-c4",
  });
  const c4Actual = c4.ok ? Math.hypot(c4.mxNm, c4.myNm) : Number.NaN;
  const c4ExpectedMagnitude = Math.hypot(c4Expected.mxNm, c4Expected.myNm);
  const c4Pass = c4.ok && within(c4Actual, c4ExpectedMagnitude, EU_C4_NUMERICAL_TOLERANCE.resistanceComparisonAbsNm, EU_C4_NUMERICAL_TOLERANCE.resistanceComparisonRel);
  const c4Circle = evaluateEuC4InteractionPoint({
    methodId: EU_C4_METHOD_IDS[0], geometry: circularSection("c10-r2-c4", 400, "c10-r2"), layout: symmetric, concrete: concrete(),
    reinforcement: reo(), context: context(), targetAxialN: 0, momentDirectionRad: 0, provenanceRef: "c10-r2-c4-circ",
  });
  if (c4Circle.ok) negativePass = false;
  boundary.C4_UNSUPPORTED_GEOMETRY = c4Circle.ok ? "FAIL" : "PASS";
  ledger.push({
    benchmarkId: "C10-R2-C4-DIAGONAL", capabilityId: "D1E.EU.C4.BIAXIAL.PMM", methodId: EU_C4_METHOD_IDS[0],
    methodVersion: "EU_C4_PMM", profileId: "DECLARED_TEST_PARTIAL_FACTORS", generation: "DECLARED_TEST",
    sourceId: "INDEPENDENT_DIAGONAL_VERTEX", sourceAuthority: "INDEPENDENT_CLOSED_FORM", independenceLevel: "LEVEL_1_INDEPENDENT_TEST_DERIVATION",
    inputSummary: "Symmetric 300x500 rectangle, axial 0 N, direction pi/4", inputUnits: "N, rad, mm",
    expectedSummary: String(c4ExpectedMagnitude), expectedUnits: "N.m", toleranceClass: "INTERACTION_SURFACE",
    toleranceRule: "EU_C4_NUMERICAL_TOLERANCE resistance comparison", derivationNote: "Section P-M-M only. Not member stability.",
    formulaFingerprint: c4.ok ? c4.resultFingerprint : "NONE", parameterFingerprint: fingerprint("theta=pi/4;N=0"),
    executionResult: c4.ok ? String(c4Actual) : c4.checkState, evidenceStatus: c4Pass ? "PASS" : "FAIL",
    limitations: "LEVEL_1 hand mesh versus production integration.", profileValueAssumed: false,
  });

  const sample = c6Input();
  const c6Expected = independentC6(sample);
  const c6 = evaluateEuC6NominalCurvature(sample);
  const c6Low = evaluateEuC6NominalCurvature(c6Input({ phiEf: 0 }));
  const c6High = evaluateEuC6NominalCurvature(c6Input({ phiEf: 2.5 }));
  const c6Short = evaluateEuC6NominalCurvature(c6Input({ l0Mm: 2000 }));
  const c6Long = evaluateEuC6NominalCurvature(c6Input({ l0Mm: 6000 }));
  const c6Bound = evaluateEuC6NominalCurvature(c6Input({ c: EU_C6_R1_CURVATURE_FACTOR_LOWER_BOUND - 1 }));
  const c6Pass = c6.calculationState === "COMPLETE"
    && within(c6.totalDesignMomentNmm ?? Number.NaN, c6Expected.total, 0.05, 1e-8)
    && within(c6.nominalCurvaturePerMm ?? Number.NaN, c6Expected.curvature, 1e-12, 1e-8)
    && within(c6.secondOrderMomentNmm ?? Number.NaN, c6Expected.m2, 0.05, 1e-8)
    && c6.c3AxialInputN === c6Expected.c3Axial
    && within(c6.c3MomentInputNm ?? Number.NaN, c6Expected.total / 1000, 1e-6, 1e-9)
    && Math.abs((c6Expected.e2Mm / 1000) - c6Expected.e2FromMetres) < 1e-8
    && EU_C6_R2_AXIAL_SIGN_CONVERSION_COUNT === 1;
  const c6IntermediateChecked = c6Pass
    && (c6High.creepFactor ?? 0) > (c6Low.creepFactor ?? 0)
    && (c6Long.secondOrderMomentNmm ?? 0) > (c6Short.secondOrderMomentNmm ?? 0);
  const c6Stale = evaluateEuC6NominalCurvature(c6Input({ profileVersion: "stale" }));
  if (c6Stale.calculationState === "COMPLETE") stalePass = false;
  if (c6Bound.calculationState === "COMPLETE") negativePass = false;
  let effectiveLengthThrows = false;
  try { selectEuC6EffectiveLength(); } catch { effectiveLengthThrows = true; }
  const phiClass = String(EU_C6_R1_PARAMETERS.find((item) => item.parameterId === "phiEf")?.classification ?? "");
  const cClass = String(EU_C6_R1_PARAMETERS.find((item) => item.parameterId === "c")?.classification ?? "");
  if (!effectiveLengthThrows || phiClass === "NDP" || cClass === "NDP" || EU_C6_R2_C_PARAMETER_AUTHORITY !== "VALIDATED_ENGINEERING_REFERENCE") negativePass = false;
  boundary.C6_CURVATURE_FACTOR_BOUND = c6Bound.calculationState === "COMPLETE" ? "FAIL" : "PASS";
  boundary.C6_EFFECTIVE_LENGTH_NOT_INFERRED = effectiveLengthThrows ? "PASS" : "FAIL";
  ledger.push({
    benchmarkId: "C10-R2-C6-NOMINAL-CURVATURE", capabilityId: "D1E.EU.C6.NOMINAL_CURVATURE", methodId: EU_C6_R2_METHOD_ID,
    methodVersion: c6.fingerprint, profileId: EU_C6_R1_REFERENCE_PROFILE_ID, generation: EU_C6_R1_REFERENCE_PROFILE_GENERATION,
    sourceId: "PROFILE_PARAMETER_CLOSED_FORM", sourceAuthority: "INDEPENDENT_CLOSED_FORM", independenceLevel: "LEVEL_1_INDEPENDENT_TEST_DERIVATION",
    inputSummary: "300x500, l0 3000 mm, c at upper bound, phiEf 1, explicit end moments and axial compression", inputUnits: "mm, N, N.mm",
    expectedSummary: String(c6Expected.total), expectedUnits: "N.mm", toleranceClass: "FLOATING_POINT_ALGEBRAIC",
    toleranceRule: "absolute 0.05 N.mm on the closed form", derivationNote: "phiEf is an explicit input. c is designer-selected inside 8 to 10. Neither is an NDP.",
    formulaFingerprint: c6.fingerprint, parameterFingerprint: fingerprint(EU_C6_R1_PARAMETERS.map((item) => `${item.parameterId}=${item.value}`).join(";")),
    executionResult: c6.calculationState === "COMPLETE" ? String(c6.totalDesignMomentNmm) : c6.calculationState,
    evidenceStatus: c6Pass ? "PASS" : "FAIL", limitations: "Isolated prismatic rectangular uniaxial compression. No slenderness-neglect rule.", profileValueAssumed: false,
  });

  const shear = evaluateEuC5Shear(shearCase());
  const shearMin = evaluateEuC5Shear(shearCase({
    demand: shearDemand(1000), effectiveDepth: quantity(530, "mm"), webWidth: quantity(300, "mm"),
    longitudinalTensionArea: quantity(0, "mm2"), fck: quantity(30, "MPa"),
  }));
  const shearPass = within(shear.resistance?.value ?? Number.NaN, 47800, EU_C5_SHEAR_PUBLISHED_FORCE_TOLERANCE_N, 0)
    && within(shearMin.resistance?.value ?? Number.NaN, 62517, EU_C5_SHEAR_PUBLISHED_BENCHMARK_TOLERANCE_N, 0);
  const shearGeneration = evaluateEuC5Shear(shearCase({ generation: "SECOND_GENERATION" }));
  if (shearGeneration.ok) profileMismatchPass = false;
  if (shear.resistance?.unit !== "N") unitPass = false;
  boundary.C5_SHEAR_GENERATION_MISMATCH = shearGeneration.ok ? "FAIL" : "PASS";
  ledger.push({
    benchmarkId: "C10-R2-C5-SHEAR-PUBLISHED", capabilityId: "D1E.EU.C5.SHEAR", methodId: shear.methodId ?? "EU_RC_SHEAR",
    methodVersion: shear.fingerprint, profileId: "REFERENCE_PROFILE_ASSUMED", generation: "FIRST_GENERATION",
    sourceId: "PUBLISHED_47800N_AND_62517N", sourceAuthority: "PUBLISHED_NUMERIC_ANCHOR", independenceLevel: "LEVEL_2_INDEPENDENT_REFERENCE_EXAMPLE",
    inputSummary: "PROFILE_VALUE_ASSUMED_FOR_REFERENCE_BENCHMARK cRdC 0.12 and vMinCoefficient 0.035", inputUnits: "mm, MPa, dimensionless",
    expectedSummary: "47800 N and 62517 N", expectedUnits: "N", toleranceClass: "EXTERNAL_TOOL_COMPARISON",
    toleranceRule: "absolute 500 N and absolute 1 N", derivationNote: "Published anchors. Coefficients are reference-benchmark assumptions, not national NDP validation.",
    formulaFingerprint: shear.fingerprint, parameterFingerprint: fingerprint("cRdC=0.12;vmin=0.035"),
    executionResult: `${shear.resistance?.value ?? "NONE"};${shearMin.resistance?.value ?? "NONE"}`, evidenceStatus: shearPass ? "PASS" : "FAIL",
    limitations: "Not NDP validation. Zero axial. No design shear reinforcement.", profileValueAssumed: true,
  });

  const punching = evaluateEuC5Punching(shearCase({
    punchingForce: quantity(705000, "N"), beta: quantity(1.15, "dimensionless"), effectiveDepth: quantity(164, "mm"),
    loadedWidth: quantity(500, "mm"), loadedDepth: quantity(500, "mm"), rhoX: quantity(0.0086, "dimensionless"), rhoY: quantity(0.0087, "dimensionless"),
    supportPosition: "INTERIOR", openingPresent: false, eccentricityMode: "EXPLICIT_BETA_ONLY", fck: quantity(25, "MPa"),
  }));
  const perimeterHand = 2 * (500 + 500) + 2 * Math.PI * 2 * 164;
  const perimeterMatch = punching.geometryFingerprint?.match(/u1:([0-9.]+)/);
  const perimeterActual = perimeterMatch ? Number(perimeterMatch[1]) : Number.NaN;
  const punchingPass = within(punching.resistance?.value ?? Number.NaN, 0.67, EU_C5_PUNCHING_PUBLISHED_STRESS_TOLERANCE_MPA, 0)
    && within(perimeterHand, 4060, EU_C5_PUNCHING_PERIMETER_TOLERANCE_MM, 0)
    && within(perimeterActual, 4060, EU_C5_PUNCHING_PERIMETER_TOLERANCE_MM, 0);
  const punchingEdge = evaluateEuC5Punching(shearCase({
    punchingForce: quantity(705000, "N"), supportPosition: "EDGE", openingPresent: false, eccentricityMode: "EXPLICIT_BETA_ONLY", beta: quantity(1.4, "dimensionless"),
  }));
  if (punchingEdge.ok || punching.resistance?.unit !== "MPa") {
    if (punchingEdge.ok) negativePass = false;
    if (punching.resistance?.unit !== "MPa") unitPass = false;
  }
  boundary.C5_PUNCHING_EDGE = punchingEdge.ok ? "FAIL" : "PASS";
  ledger.push({
    benchmarkId: "C10-R2-C5-PUNCHING-INTERIOR", capabilityId: "D1E.EU.C5.PUNCHING", methodId: punching.methodId ?? "EU_RC_PUNCHING",
    methodVersion: punching.fingerprint, profileId: "REFERENCE_PROFILE_ASSUMED", generation: "FIRST_GENERATION",
    sourceId: "PUBLISHED_INTERIOR_0_67_MPA_PERIMETER_4060", sourceAuthority: "PUBLISHED_NUMERIC_ANCHOR", independenceLevel: "LEVEL_2_INDEPENDENT_REFERENCE_EXAMPLE",
    inputSummary: "Interior 500x500 loaded area, d 164 mm, explicit force 705000 N, beta 1.15, fck 25 MPa", inputUnits: "mm, N, dimensionless",
    expectedSummary: "0.67 MPa and 4060 mm", expectedUnits: "MPa, mm", toleranceClass: "ENGINEERING_ROUNDING",
    toleranceRule: "0.01 MPa and 1 mm", derivationNote: "Interior rectangular loaded area only. Perimeter hand is 2(c1+c2)+2*pi*2*d.",
    formulaFingerprint: punching.fingerprint, parameterFingerprint: fingerprint("interior;beta=1.15"),
    executionResult: `${punching.resistance?.value ?? "NONE"};${perimeterActual}`, evidenceStatus: punchingPass ? "PASS" : "FAIL",
    limitations: "Edge, corner, and openings remain unsupported.", profileValueAssumed: true,
  });

  const torsionExpected = independentTorsionNm(400, 600, null, 30, 1, 1.5, 2);
  const torsionRequest = {
    profileId: "EU-EN1992-1-1-GEN1-TORSION-REFERENCE", generation: "EN1992-1-1-FIRST_GENERATION" as const, profileVersion: "d1e-eu-c5-t3r.1",
    sectionKind: "RECTANGULAR_SOLID" as const, widthMm: 400, heightMm: 600, cotTheta: 2, prestressed: false, signedShearN: 0,
    fckMPa: 30, concreteElasticModulusMPa: 33000, fykLongitudinalMPa: 500, fykTransverseMPa: 500, reinforcementElasticModulusMPa: 200000,
    reinforcementReferenceAreaMm2: 100, alphaCc: 1, gammaC: 1.5, gammaS: 1.15, ndpSourceRef: "declared-project-ndp",
    transverseProvidedMm2PerMm: 2, longitudinalProvidedMm2: 4000,
  };
  const torsion = evaluateEuC5Torsion({ demand: torsionDemand(50000), torsionRequest });
  const torsionOther = evaluateEuC5Torsion({ demand: torsionDemand(10000), torsionRequest: { ...torsionRequest, sectionKind: "OTHER" } });
  const torsionStale = evaluateEuC5Torsion({ demand: torsionDemand(10000), torsionRequest: { ...torsionRequest, profileVersion: "stale" } });
  const torsionProfile = evaluateEuC5Torsion({ demand: torsionDemand(10000), torsionRequest: { ...torsionRequest, profileId: "NA-DE" } });
  const torsionPass = within(torsion.resistance?.value ?? Number.NaN, torsionExpected, EU_C5_T4_RESISTANCE_TOLERANCE_NM, EU_C5_T4_RELATIVE_TOLERANCE);
  if (torsionOther.ok) negativePass = false;
  if (torsionStale.ok) stalePass = false;
  if (torsionProfile.ok) profileMismatchPass = false;
  if (torsion.resistance?.unit !== "N.m") unitPass = false;
  boundary.C5_TORSION_OTHER_SECTION = torsionOther.ok ? "FAIL" : "PASS";
  ledger.push({
    benchmarkId: "C10-R2-C5-TORSION-RECTANGLE", capabilityId: "D1E.EU.C5.TORSION", methodId: torsion.methodId ?? "EU_RC_TORSION",
    methodVersion: torsion.fingerprint, profileId: "EU-EN1992-1-1-GEN1-TORSION-REFERENCE", generation: "EN1992-1-1-FIRST_GENERATION",
    sourceId: "CLOSED_FORM_RECTANGULAR_STRUT", sourceAuthority: "INDEPENDENT_CLOSED_FORM", independenceLevel: "LEVEL_1_INDEPENDENT_TEST_DERIVATION",
    inputSummary: "400x600 mm solid rectangle, fck 30, cot theta 2, declared gammaC 1.5", inputUnits: "mm, MPa, dimensionless",
    expectedSummary: String(torsionExpected), expectedUnits: "N.m", toleranceClass: "FLOATING_POINT_ALGEBRAIC",
    toleranceRule: "EU_C5_T4 absolute and relative tolerances", derivationNote: "Closed form owned by this evidence module. Equivalent tube thickness is A/u.",
    formulaFingerprint: torsion.fingerprint, parameterFingerprint: fingerprint("400x600;cot=2"),
    executionResult: String(torsion.resistance?.value ?? torsion.failReason), evidenceStatus: torsionPass ? "PASS" : "FAIL",
    limitations: "No general V-T-N-M interaction and no wall or slab torsion.", profileValueAssumed: false,
  });

  const blocked = (id: string, capabilityId: string, sourceState: string): EuC10R2BenchmarkRecord => ({
    benchmarkId: id, capabilityId, methodId: "NOT_EXECUTED", methodVersion: "NOT_EXECUTED", profileId: "REFERENCE_PROFILE",
    generation: "REFERENCE", sourceId: "SINGLE_GOVERNED_SOURCE", sourceAuthority: sourceState, independenceLevel: "NOT_COUNTABLE",
    inputSummary: "ONE_REPOSITORY_RECOVERY", inputUnits: "NOT_APPLICABLE", expectedSummary: "NOT_INVENTED", expectedUnits: "NOT_APPLICABLE",
    toleranceClass: "NOT_APPLICABLE", toleranceRule: "NOT_APPLICABLE", derivationNote: "One targeted recovery found no second governed numerical source.",
    formulaFingerprint: "NONE", parameterFingerprint: "NONE", executionResult: "NOT_EXECUTED", evidenceStatus: "BLOCKED_INDEPENDENCE",
    limitations: "Self-reference and model-generated expected truth were not used.", profileValueAssumed: false,
  });
  if (EU_C7_R1_PROFILE_SOURCES.length !== 1) negativePass = false;
  ledger.push(blocked("C10-R2-C7-CRACK-RECOVERY", "D1E.EU.C7.CRACK_WIDTH", "SINGLE_GOVERNED_SOURCE"));
  ledger.push(blocked("C10-R2-C7-LONG-TERM-RECOVERY", "D1E.EU.C7.EXPLICIT_LONG_TERM_STATE", "SINGLE_GOVERNED_SOURCE"));
  ledger.push(blocked("C10-R2-C8-COVER-RECOVERY", "D1E.EU.C8.COVER_ASSEMBLY", EU_C8_R2_COVER_RULE_SOURCE_INDEPENDENCE_STATE));
  ledger.push(blocked("C10-R2-C8-SPACING-RECOVERY", "D1E.EU.C8.MINIMUM_CLEAR_SPACING", EU_C8_R3B_RULE_SOURCE_INDEPENDENCE_STATE));
  ledger.push(blocked("C10-R2-C8-ANCHORAGE-RECOVERY", "D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE", EU_C8_R4B_RULE_SOURCE_INDEPENDENCE_STATE));

  const flexureRoute = routeEuC9R2SectionAction(actions());
  const beamContext = { family: "EN1992", generation: "EN1992-1-1-GEN1", profileId: "EU-EN1992-1-1-GEN1" };
  const beamPunch = orchestrateEuC9R2Beam({
    memberId: "beam-c10-r2", memberType: "BEAM", declaredEvaluationScope: ["PUNCHING"], standardContext: beamContext,
    geometryShape: "RECTANGULAR", materialRef: "c30", reinforcementRef: "b500", actions: actions(), combinationId: "uls-1",
  });
  const beamOrder = orchestrateEuC9R2Beam({
    memberId: "beam-c10-r2", memberType: "BEAM", declaredEvaluationScope: ["SECOND_ORDER"], standardContext: beamContext,
    geometryShape: "RECTANGULAR", materialRef: "c30", reinforcementRef: "b500", actions: actions(), combinationId: "uls-1",
  });
  const beamPass = flexureRoute.capabilityId === "D1E.EU.C2.FLEXURE.UNIAXIAL" && !flexureRoute.executesC3 && !flexureRoute.executesC4
    && beamPunch.nodes[0]?.executionStatus === EU_C9_R2_PUNCHING_STATE
    && beamOrder.nodes[0]?.capabilityId === "D1E.EU.C6.NOMINAL_CURVATURE"
    && beamOrder.nodes[0]?.executionStatus === "NOT_APPLICABLE"
    && EU_C9_R2_C6_INVOKED_FOR_BEAM === false;
  ledger.push({
    benchmarkId: "C10-R2-C9-BEAM-ROUTING", capabilityId: "D1E.EU.C9.BEAM", methodId: "EU_RC_BEAM_ORCHESTRATION",
    methodVersion: "C9-R2", profileId: "EU-EN1992-1-1-GEN1", generation: "EN1992-1-1-GEN1",
    sourceId: "PUBLISHED_BEAM_ORCHESTRATION_CONTRACT", sourceAuthority: "ORCHESTRATION_CONTRACT", independenceLevel: "LEVEL_1_INDEPENDENT_TEST_DERIVATION",
    inputSummary: "Pure flexure route plus punching and second-order declared scopes", inputUnits: "N.m",
    expectedSummary: "C2 only; punching NOT_APPLICABLE; C6 NOT_APPLICABLE", expectedUnits: "state", toleranceClass: "EXACT_ALGEBRAIC",
    toleranceRule: "exact contract state", derivationNote: "Expected states are contract literals. Routing does not prove formula truth.",
    formulaFingerprint: "ROUTING", parameterFingerprint: fingerprint("beam-routing"), executionResult: String(flexureRoute.capabilityId),
    evidenceStatus: beamPass ? "PASS" : "FAIL", limitations: "C7 and C8 remain blocked, so the beam is not end-to-end independently validated.", profileValueAssumed: false,
  });

  const columnUniaxial = routeEuC9R3ColumnSection({ mode: "SECTION_UNIAXIAL", actions: actions({ axial: { status: "AXIAL_DIRECT", valueN: -100000 } }) });
  const columnBiaxial = routeEuC9R3ColumnSection({
    mode: "SECTION_BIAXIAL",
    actions: actions({ axial: { status: "AXIAL_DIRECT", valueN: -100000 }, minorMoment: { status: "PRESENT", signedNm: 20000 } }),
  });
  const columnOrder = orchestrateEuC9R3Column({
    memberId: "column-c10-r2", memberType: "COLUMN", declaredEvaluationScope: ["MEMBER_SECOND_ORDER_UNIAXIAL"], standardContext: beamContext,
    geometryShape: "RECTANGULAR", materialRef: "c30", reinforcementRef: "b500",
    actions: actions({ axial: { status: "AXIAL_DIRECT", valueN: -100000 } }), combinationId: "uls-1",
  });
  const columnPass = columnUniaxial.executesC3 && !columnUniaxial.executesC4 && columnBiaxial.executesC4 && !columnBiaxial.executesC3
    && EU_C9_R3_C6_OUTPUT_USED_FOR_C4 === false && columnOrder.overallState !== "MEMBER_SATISFIED_FOR_EXECUTED_BOUNDED_SCOPE";
  ledger.push({
    benchmarkId: "C10-R2-C9-COLUMN-ROUTING", capabilityId: "D1E.EU.C9.COLUMN", methodId: "EU_RC_COLUMN_ORCHESTRATION",
    methodVersion: "C9-R3", profileId: "EU-EN1992-1-1-GEN1", generation: "EN1992-1-1-GEN1",
    sourceId: "PUBLISHED_COLUMN_ORCHESTRATION_CONTRACT", sourceAuthority: "ORCHESTRATION_CONTRACT", independenceLevel: "LEVEL_1_INDEPENDENT_TEST_DERIVATION",
    inputSummary: "Uniaxial C3, biaxial C4, second-order scope without a C6 request", inputUnits: "N, N.m",
    expectedSummary: "C3 or C4 exclusive; C6 output is not used for C4; incomplete second order stays unsatisfied", expectedUnits: "state",
    toleranceClass: "EXACT_ALGEBRAIC", toleranceRule: "exact contract state",
    derivationNote: "C6 to C3 handoff inputs are checked on the C6 closed form, not by snapshotting the column orchestrator.",
    formulaFingerprint: "ROUTING", parameterFingerprint: fingerprint("column-routing"), executionResult: columnOrder.overallState,
    evidenceStatus: columnPass && c6Pass ? "PASS" : "FAIL", limitations: "No biaxial second order.", profileValueAssumed: false,
  });

  const strip = { stripId: "strip-1", orientation: "MAJOR" as const, widthMm: 1000 };
  const slabActions = actions({ axial: { status: "AXIAL_DIRECT", valueN: 0 } });
  const slabBoth = routeEuC9R4StripFlexure({ strip, actions: { ...slabActions, minorMoment: { status: "PRESENT", signedNm: 10000 } } });
  const slabOne = routeEuC9R4StripFlexure({ strip, actions: slabActions });
  const slabPass = !slabBoth.executesC4 && slabBoth.reason === "ORTHOGONAL_MOMENTS_ARE_NOT_C4" && slabOne.executesC2 && !EU_C9_R4_TWO_WAY_SLAB_BENDING_AUTOMATICALLY_ROUTED_TO_C4;
  ledger.push({
    benchmarkId: "C10-R2-C9-SLAB-BOUNDARY", capabilityId: "D1E.EU.C9.SOLID_SLAB", methodId: "EU_RC_SOLID_SLAB_ORCHESTRATION",
    methodVersion: "C9-R4", profileId: "EU-EN1992-1-1-GEN1", generation: "EN1992-1-1-GEN1",
    sourceId: "PUBLISHED_SLAB_ORCHESTRATION_CONTRACT", sourceAuthority: "ORCHESTRATION_CONTRACT", independenceLevel: "LEVEL_1_INDEPENDENT_TEST_DERIVATION",
    inputSummary: "Supplied strip width and orthogonal moments", inputUnits: "mm, N.m",
    expectedSummary: "C2 for one strip; orthogonal moments are not C4", expectedUnits: "state", toleranceClass: "EXACT_ALGEBRAIC",
    toleranceRule: "exact contract state", derivationNote: "No slab analysis and no support-reaction generation.",
    formulaFingerprint: "ROUTING", parameterFingerprint: fingerprint("slab-routing"), executionResult: String(slabBoth.reason),
    evidenceStatus: slabPass ? "PASS" : "FAIL", limitations: "Punching remains interior rectangular only.", profileValueAssumed: false,
  });

  const wallRoute = routeEuC9R5WallSection({ mode: "SECTION_PURE_FLEXURE", actions: actions({ axial: { status: "AXIAL_DIRECT", valueN: 0 } }) });
  const wall = orchestrateEuC9R5WallSection({
    memberId: "wall-c10-r2", memberType: "WALL",
    declaredEvaluationScope: ["WALL_SHEAR", "WALL_SECOND_ORDER", "BOUNDARY_ELEMENT", "SEISMIC_DETAILING"],
    standardContext: beamContext, geometryShape: "RECTANGULAR", materialRef: "c30", reinforcementRef: "b500",
    wallSection: { wallLengthMm: 3000, wallThicknessMm: 250, lengthMapsTo: "SECTION_WIDTH" },
    axisMapping: { majorAxisRole: "IN_PLANE", minorAxisRole: "OUT_OF_PLANE" },
    actions: actions(), combinationId: "uls-1", reinforcementFaceId: "FACE_EXPLICIT",
  });
  const wallExcluded = wall.nodes.length > 0 && wall.nodes.every((node) => node.executionStatus === "NOT_IMPLEMENTED" || node.executionStatus === "NOT_APPLICABLE" || node.executionStatus === "DEFERRED" || node.executionStatus === "BLOCKED_SCOPE_MISMATCH");
  const wallPass = wallRoute.executesC2 && !wallRoute.executesC3 && !EU_C9_R5_C6_INVOKED_FOR_WALL && wallExcluded;
  ledger.push({
    benchmarkId: "C10-R2-C9-WALL-SECTION", capabilityId: "D1E.EU.C9.WALL_SECTION", methodId: "EU_RC_WALL_SECTION_ORCHESTRATION",
    methodVersion: "C9-R5", profileId: "EU-EN1992-1-1-GEN1", generation: "EN1992-1-1-GEN1",
    sourceId: "PUBLISHED_WALL_SECTION_CONTRACT", sourceAuthority: "ORCHESTRATION_CONTRACT", independenceLevel: "LEVEL_1_INDEPENDENT_TEST_DERIVATION",
    inputSummary: "Canonical WALL with shear, second-order, boundary-element, and seismic scopes", inputUnits: "mm, N.m",
    expectedSummary: "Pure flexure can route to C2; excluded scopes do not execute", expectedUnits: "state", toleranceClass: "EXACT_ALGEBRAIC",
    toleranceRule: "exact contract state", derivationNote: "Section-only. Not wall-member design.",
    formulaFingerprint: "ROUTING", parameterFingerprint: fingerprint("wall-routing"), executionResult: wall.nodes.map((node) => `${node.capabilityId}:${node.executionStatus}`).join("|"),
    evidenceStatus: wallPass ? "PASS" : "FAIL", limitations: "No wall shear, stability, boundary element, or seismic design.", profileValueAssumed: false,
  });

  if (EU_CONCRETE_PACK_CERTIFIED || EU_CONCRETE_STANDARD_CONFORMANCE_STATE !== "INTENDED_PROFILE" || EU_CONCRETE_PRODUCT_CLAIM_LEVEL !== "EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY") {
    negativePass = false;
  }
  return { ledger, negativePass, profileMismatchPass, stalePass, unitPass, c6IntermediateChecked, c6C3Handoff: c6Pass, boundaryResults: boundary };
}

export function evidenceAcceptsFingerprint(row: EuC10R2BenchmarkRecord, currentFingerprint: string): boolean {
  if (EU_C10_R2_STALE_EVIDENCE_REUSE_ALLOWED) return true;
  return row.evidenceStatus !== "PASS" || row.formulaFingerprint === currentFingerprint;
}

export const EU_C10_R2_GROUPS_REUSED = EU_C10_R2_BENCHMARK_GROUPS;
export const EU_C10_R2_EXECUTION_PRIORITY_USED = EU_C10_R2_BENCHMARK_PRIORITY_ORDER;
export const EU_C10_R2_IMPLEMENTED_INVENTORY_REUSED = EU_C10_IMPLEMENTED_CAPABILITY_INVENTORY;
export const EU_C10_R2_DEFERRED_NOT_BENCHMARKED_AS_IMPLEMENTED = EU_C10_DEFERRED_CAPABILITY_INVENTORY;

export const EU_C10_R2_VALIDATION_LAYER_MATRIX = [
  { member: "BEAM", routing: "YES", underlying: "PARTIAL_C2_YES_C7_C8_BLOCKED", endToEnd: "NO" },
  { member: "COLUMN", routing: "YES", underlying: "C3_C4_C6_LEVEL_1", endToEnd: "NO" },
  { member: "SOLID_SLAB", routing: "YES", underlying: "PARTIAL", endToEnd: "NO" },
  { member: "WALL_SECTION", routing: "YES", underlying: "SECTION_METHODS_LEVEL_1", endToEnd: "NO" },
] as const;

export const EU_C10_R3_REVIEW_PACK = [
  "C2 LEVEL_1 rectangle-versus-fiber difference remains for an engineer",
  "C3 explicit-axis pure axial contract remains for an engineer",
  "C4 section surface is not member stability",
  "C5 published anchors assume reference cRd,c and v,min",
  "C6 phiEf and c are not NDPs",
  "C7 and C8 stay blocked until a human supplies an independent calculation",
  "C9 routing is not formula validation",
] as const;
