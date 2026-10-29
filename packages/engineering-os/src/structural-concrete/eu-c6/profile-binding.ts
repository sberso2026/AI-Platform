import {
  EU_C6_MEMBER_SECOND_ORDER_EQUALS_EIGENVALUE_BUCKLING,
  EU_C6_MEMBER_SECOND_ORDER_EQUALS_GENERAL_NONLINEAR_ANALYSIS,
  EU_C6_MEMBER_SECOND_ORDER_EQUALS_GLOBAL_STABILITY,
  EU_C6_R1_CURVATURE_FACTOR_LOWER_BOUND,
  EU_C6_R1_CURVATURE_FACTOR_UPPER_BOUND,
  EU_C6_R1_FALSE_NATIONAL_PROFILE_CLAIM,
  EU_C6_R1_NBAL_PERMITTED_SIMPLIFICATION,
  EU_C6_R1_REFERENCE_PROFILE_GENERATION,
  EU_C6_R1_REFERENCE_PROFILE_ID,
  EU_C6_R1_RUNTIME_METHOD_COUNT,
  EU_C6_R1_SELECTED_METHOD_FAMILY,
  NEW_C6_SECOND_ORDER_METHOD_IMPLEMENTED,
} from "@rtb/types";
import { formulaFingerprint } from "../eu-c1b/fingerprint";

export const EU_C6_R1_PRIMARY_SOURCE_ID = "JRC_WALRAVEN_EC2_ULS_2008_02_02" as const;
export const EU_C6_R1_TRAINING_SOURCE_ID = "MASESOFT_EN1992_TRAINING" as const;
export const EU_C6_R1_FORMULA_SOURCE_ID = "BLUEPRINTS_EN1992_1_1_2004_FORMULAS" as const;
export const EU_C6_R1_CORROBORATING_SOURCE_ID = "USINGEUROCODES_NOMINAL_CURVATURE" as const;

const PROFILE_SOURCES = [
  EU_C6_R1_PRIMARY_SOURCE_ID,
  EU_C6_R1_TRAINING_SOURCE_ID,
  EU_C6_R1_FORMULA_SOURCE_ID,
  EU_C6_R1_CORROBORATING_SOURCE_ID,
] as const;

type C6Rule = {
  ruleId: string;
  operations: readonly string[];
  inputParameterIds: readonly string[];
  output: string;
  units: string;
  applicability: string;
  exclusions: string;
  authorityClass: "VALIDATED_ENGINEERING_REFERENCE" | "ESTABLISHED_ENGINEERING_MECHANICS" | "SATISFIED_BY_EXISTING_RULE";
  sourceIds: readonly string[];
  classification: string;
  formulaFingerprint: string;
  validationState: "PENDING_HUMAN_ENGINEERING_REVIEW";
  profileId: typeof EU_C6_R1_REFERENCE_PROFILE_ID;
  generation: typeof EU_C6_R1_REFERENCE_PROFILE_GENERATION;
  methodFamily: typeof EU_C6_R1_SELECTED_METHOD_FAMILY;
};

function rule(input: Omit<C6Rule, "formulaFingerprint" | "validationState" | "profileId" | "generation" | "methodFamily">): C6Rule {
  return {
    ...input,
    methodFamily: EU_C6_R1_SELECTED_METHOD_FAMILY,
    profileId: EU_C6_R1_REFERENCE_PROFILE_ID,
    generation: EU_C6_R1_REFERENCE_PROFILE_GENERATION,
    validationState: "PENDING_HUMAN_ENGINEERING_REVIEW",
    formulaFingerprint: formulaFingerprint({
      ruleId: input.ruleId,
      operations: input.operations,
      parameterIds: input.inputParameterIds,
    }),
  };
}

export const EU_C6_R1_RULES = [
  rule({
    ruleId: "EU_C6_R1_AXIAL_COMPRESSION",
    operations: ["require_positive_compression"],
    inputParameterIds: ["NEdCompressionN"],
    output: "compression magnitude used by the nominal-curvature chain",
    units: "N",
    applicability: "isolated member in compression",
    exclusions: "tension and zero axial force are rejected",
    authorityClass: "SATISFIED_BY_EXISTING_RULE",
    sourceIds: [EU_C6_R1_TRAINING_SOURCE_ID],
    classification: "SATISFIED_BY_EXISTING_RULE",
  }),
  rule({
    ruleId: "EU_C6_R1_EQUIVALENT_FIRST_ORDER_MOMENT",
    operations: ["equivalent_end_moment"],
    inputParameterIds: ["M01Nmm", "M02Nmm"],
    output: "M0e = 0.6*M02 + 0.4*M01, and not below 0.4*M02",
    units: "Nmm",
    applicability: "end moments with the same sign when they tension the same face; |M02| >= |M01|",
    exclusions: "no invented distribution factor",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C6_R1_PRIMARY_SOURCE_ID],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C6_R1_IMPERFECTION_IN_FIRST_ORDER_MOMENT",
    operations: ["require_explicit_first_order_moment"],
    inputParameterIds: ["M01Nmm", "M02Nmm"],
    output: "first-order moments already include the project imperfection",
    units: "Nmm",
    applicability: "this profile does not calculate a sway angle",
    exclusions: "no default inclination and no minimum eccentricity",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C6_R1_TRAINING_SOURCE_ID, EU_C6_R1_PRIMARY_SOURCE_ID],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C6_R1_EFFECTIVE_LENGTH_INPUT",
    operations: ["require_explicit_length"],
    inputParameterIds: ["l0Mm"],
    output: "effective length is an explicit governed input",
    units: "mm",
    applicability: "isolated member",
    exclusions: "not inferred from support labels",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C6_R1_TRAINING_SOURCE_ID],
    classification: "DESIGNER_INPUT",
  }),
  rule({
    ruleId: "EU_C6_R1_RADIUS_OF_GYRATION",
    operations: ["sqrt_I_over_A"],
    inputParameterIds: ["IMm4", "AcMm2"],
    output: "i = sqrt(I/Ac) of the gross concrete section",
    units: "mm",
    applicability: "rectangular gross section from D1E-1",
    exclusions: "cracked inertia is not used",
    authorityClass: "ESTABLISHED_ENGINEERING_MECHANICS",
    sourceIds: [EU_C6_R1_PRIMARY_SOURCE_ID],
    classification: "ESTABLISHED_MECHANICS",
  }),
  rule({
    ruleId: "EU_C6_R1_SLENDERNESS",
    operations: ["divide"],
    inputParameterIds: ["l0Mm", "iMm"],
    output: "lambda = l0 / i",
    units: "1",
    applicability: "isolated member",
    exclusions: "not a frame eigenvalue",
    authorityClass: "ESTABLISHED_ENGINEERING_MECHANICS",
    sourceIds: [EU_C6_R1_PRIMARY_SOURCE_ID, EU_C6_R1_CORROBORATING_SOURCE_ID],
    classification: "ESTABLISHED_MECHANICS",
  }),
  rule({
    ruleId: "EU_C6_R1_CREEP_INPUT",
    operations: ["require_explicit_phi_ef"],
    inputParameterIds: ["phiEf"],
    output: "effective creep ratio is an explicit input",
    units: "1",
    applicability: "nominal curvature creep factor",
    exclusions: "no Annex B creep model and no default",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C6_R1_CORROBORATING_SOURCE_ID, EU_C6_R1_PRIMARY_SOURCE_ID],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C6_R1_MECHANICAL_REINFORCEMENT_RATIO",
    operations: ["omega"],
    inputParameterIds: ["AsMm2", "fydMPa", "AcMm2", "fcdMPa"],
    output: "omega = As*fyd / (Ac*fcd); nu = 1 + omega",
    units: "1",
    applicability: "total longitudinal reinforcement",
    exclusions: "fyd and fcd come from the existing declared-NDP material path",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C6_R1_FORMULA_SOURCE_ID, EU_C6_R1_CORROBORATING_SOURCE_ID],
    classification: "DERIVED_FROM_GOVERNED_RULE",
  }),
  rule({
    ruleId: "EU_C6_R1_CURVATURE_CORRECTION",
    operations: ["min_ratio_1"],
    inputParameterIds: ["nu", "n", "nBal"],
    output: "Kr = min((nu - n) / (nu - nBal), 1)",
    units: "1",
    applicability: "constant symmetrical section",
    exclusions: "rejected when nu <= nBal or n >= nu",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C6_R1_FORMULA_SOURCE_ID, EU_C6_R1_CORROBORATING_SOURCE_ID],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C6_R1_CREEP_FACTOR",
    operations: ["floor_at_1"],
    inputParameterIds: ["fckMPa", "lambda", "phiEf"],
    output: "Kphi = max(1, 1 + (0.35 + fck/200 - lambda/150) * phiEf)",
    units: "1",
    applicability: "fck in MPa",
    exclusions: "phiEf is not defaulted",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C6_R1_CORROBORATING_SOURCE_ID, EU_C6_R1_PRIMARY_SOURCE_ID],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C6_R1_NOMINAL_CURVATURE",
    operations: ["product"],
    inputParameterIds: ["Kr", "Kphi", "fydMPa", "EsMPa", "dMm"],
    output: "1/r = Kr * Kphi * fyd / (Es * 0.45 * d)",
    units: "1/mm",
    applicability: "reinforcement concentrated on opposite faces; d is explicit",
    exclusions: "distributed reinforcement radius is outside this profile",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C6_R1_FORMULA_SOURCE_ID, EU_C6_R1_TRAINING_SOURCE_ID, EU_C6_R1_CORROBORATING_SOURCE_ID],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C6_R1_SECOND_ORDER_MOMENT",
    operations: ["eccentricity_times_axial"],
    inputParameterIds: ["NEdCompressionN", "curvaturePerMm", "l0Mm", "c"],
    output: "M2 = NEd * (1/r) * l0^2 / c",
    units: "Nmm",
    applicability: "c is selected inside the governed bounds",
    exclusions: "no default c",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C6_R1_FORMULA_SOURCE_ID, EU_C6_R1_TRAINING_SOURCE_ID],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C6_R1_TOTAL_DESIGN_MOMENT",
    operations: ["add"],
    inputParameterIds: ["M0eNmm", "M2Nmm"],
    output: "MEd = M0e + M2",
    units: "Nmm",
    applicability: "uniaxial design moment handed to C3",
    exclusions: "not a resistance",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C6_R1_TRAINING_SOURCE_ID, EU_C6_R1_PRIMARY_SOURCE_ID],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C6_R1_C3_HANDOFF",
    operations: ["sign_convert_axial"],
    inputParameterIds: ["NEdCompressionN", "MEdNmm"],
    output: "C3 receives tension-positive axial force = -NEd and MEd",
    units: "N, Nmm",
    applicability: "existing uniaxial N-M resistance",
    exclusions: "no second resistance formula and no C4 handoff",
    authorityClass: "SATISFIED_BY_EXISTING_RULE",
    sourceIds: [EU_C6_R1_TRAINING_SOURCE_ID],
    classification: "SATISFIED_BY_EXISTING_RULE",
  }),
] as const;

export const EU_C6_R1_PARAMETERS = [
  { parameterId: "l0Mm", value: null, expression: "explicit effective length", units: "mm", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C6_R1_TRAINING_SOURCE_ID], classification: "PROJECT_SPECIFIC" },
  { parameterId: "c", value: null, expression: `designer-selected curvature distribution factor inside [${EU_C6_R1_CURVATURE_FACTOR_LOWER_BOUND}, ${EU_C6_R1_CURVATURE_FACTOR_UPPER_BOUND}]`, units: "1", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C6_R1_TRAINING_SOURCE_ID, EU_C6_R1_CORROBORATING_SOURCE_ID], classification: "DESIGNER_SELECTED_WITHIN_GOVERNED_BOUNDS" },
  { parameterId: "nBal", value: EU_C6_R1_NBAL_PERMITTED_SIMPLIFICATION, expression: "permitted simplification for n at maximum moment resistance", units: "1", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C6_R1_FORMULA_SOURCE_ID, EU_C6_R1_CORROBORATING_SOURCE_ID, EU_C6_R1_PRIMARY_SOURCE_ID], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "phiEf", value: null, expression: "explicit effective creep ratio", units: "1", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C6_R1_CORROBORATING_SOURCE_ID, EU_C6_R1_PRIMARY_SOURCE_ID], classification: "PROJECT_SPECIFIC" },
  { parameterId: "EsMPa", value: null, expression: "explicit reinforcement modulus", units: "MPa", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C6_R1_FORMULA_SOURCE_ID], classification: "MATERIAL_SPECIFIC" },
  { parameterId: "dMm", value: null, expression: "explicit effective depth for reinforcement on opposite faces", units: "mm", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C6_R1_CORROBORATING_SOURCE_ID], classification: "PROJECT_SPECIFIC" },
  { parameterId: "curvatureBaseFactor", value: 0.45, expression: "denominator factor in the nominal curvature base", units: "1", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C6_R1_FORMULA_SOURCE_ID, EU_C6_R1_TRAINING_SOURCE_ID, EU_C6_R1_CORROBORATING_SOURCE_ID], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "betaConstant", value: 0.35, expression: "constant term in the creep-factor beta", units: "1", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C6_R1_CORROBORATING_SOURCE_ID, EU_C6_R1_PRIMARY_SOURCE_ID], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "betaFckDivisor", value: 200, expression: "fck term divisor in beta, with fck in MPa", units: "MPa", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C6_R1_CORROBORATING_SOURCE_ID, EU_C6_R1_PRIMARY_SOURCE_ID], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "betaLambdaDivisor", value: 150, expression: "slenderness term divisor in beta", units: "1", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C6_R1_CORROBORATING_SOURCE_ID, EU_C6_R1_PRIMARY_SOURCE_ID], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "momentWeightHigh", value: 0.6, expression: "weight on the larger end moment", units: "1", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C6_R1_PRIMARY_SOURCE_ID], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "momentWeightLow", value: 0.4, expression: "weight on the smaller end moment and lower bound factor", units: "1", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C6_R1_PRIMARY_SOURCE_ID], classification: "REFERENCE_PROFILE_PARAMETER" },
] as const;

export const EU_C6_R1_SOURCE_CONFLICTS = [
  {
    conflictId: "LAMBDA_LIM_LATEX_PRODUCT",
    cause: "DIFFERENT_NOTATION",
    resolution: "REJECTED",
    detail: "One formula page writes the slenderness-limit denominator as a product of force, area, and stress. That form is not used. This profile does not offer a neglect path.",
  },
  {
    conflictId: "CURVATURE_DISTRIBUTION_FACTOR",
    cause: "DIFFERENT_ASSUMPTIONS",
    resolution: "DESIGNER_SELECTED_BOUNDS",
    detail: "Constant-section use of 10 and the lower limit 8 for constant first-order moment are bounds. No value is selected by the profile.",
  },
  {
    conflictId: "IMPERFECTION_PLACEMENT",
    cause: "DIFFERENT_NOTATION",
    resolution: "EXPLICIT_FIRST_ORDER_MOMENT",
    detail: "One source folds inclination into the first-order moment and another adds a separate inclination eccentricity. This profile requires the supplied end moments to already include imperfection and does not invent an inclination.",
  },
] as const;

export const EU_C6_R1_NDP_PARAMETER_IDS = [] as const;

export const EU_C6_R1_C3_HANDOFF = {
  defined: true,
  c4Required: false,
  axialSign: "C3 tension-positive axial force equals the negative of the compression magnitude",
  moment: "C3 receives MEd = M0e + M2",
  resistanceOwner: "EU_C3",
} as const;

export type EuC6ProfileResolutionInput = {
  profileId: string;
  generation: string;
  nationalAnnexClaim: boolean;
  geometry: string;
  bending: string;
  l0Mm: number | null;
  c: number | null;
  phiEf: number | null;
  M01Nmm: number | null;
  M02Nmm: number | null;
  NEdCompressionN: number | null;
  AcMm2: number | null;
  IMm4: number | null;
  dMm: number | null;
  AsMm2: number | null;
  fcdMPa: number | null;
  fckMPa: number | null;
  fydMPa: number | null;
  EsMPa: number | null;
  sourceConflictUnresolved: boolean;
  stale: boolean;
};

export function resolveEuC6ReferenceProfile(input: EuC6ProfileResolutionInput): { accepted: boolean; code: string } {
  if (NEW_C6_SECOND_ORDER_METHOD_IMPLEMENTED || EU_C6_R1_RUNTIME_METHOD_COUNT !== 0) {
    return { accepted: false, code: "RUNTIME_METHOD_FORBIDDEN_IN_R1" };
  }
  if (EU_C6_MEMBER_SECOND_ORDER_EQUALS_GLOBAL_STABILITY || EU_C6_MEMBER_SECOND_ORDER_EQUALS_EIGENVALUE_BUCKLING || EU_C6_MEMBER_SECOND_ORDER_EQUALS_GENERAL_NONLINEAR_ANALYSIS) {
    return { accepted: false, code: "SCOPE_COLLAPSE" };
  }
  if (input.nationalAnnexClaim || EU_C6_R1_FALSE_NATIONAL_PROFILE_CLAIM) return { accepted: false, code: "FALSE_NATIONAL_PROFILE" };
  if (input.profileId !== EU_C6_R1_REFERENCE_PROFILE_ID) return { accepted: false, code: "PROFILE_MISMATCH" };
  if (input.generation !== EU_C6_R1_REFERENCE_PROFILE_GENERATION) return { accepted: false, code: "GENERATION_MISMATCH" };
  if (input.stale) return { accepted: false, code: "STALE_PROFILE" };
  if (input.sourceConflictUnresolved) return { accepted: false, code: "SOURCE_CONFLICT" };
  if (input.geometry !== "RECTANGULAR") return { accepted: false, code: "UNSUPPORTED_GEOMETRY" };
  if (input.bending !== "UNIAXIAL") return { accepted: false, code: "UNSUPPORTED_ACTION" };
  if (input.l0Mm === null || !(input.l0Mm > 0)) return { accepted: false, code: "MISSING_EFFECTIVE_LENGTH" };
  if (input.c === null) return { accepted: false, code: "MISSING_CURVATURE_FACTOR" };
  if (input.c < EU_C6_R1_CURVATURE_FACTOR_LOWER_BOUND || input.c > EU_C6_R1_CURVATURE_FACTOR_UPPER_BOUND) {
    return { accepted: false, code: "INVALID_CURVATURE_FACTOR" };
  }
  if (input.phiEf === null || !(input.phiEf >= 0)) return { accepted: false, code: "MISSING_CREEP" };
  if (input.M02Nmm === null || input.M02Nmm === 0 || input.M01Nmm === null) return { accepted: false, code: "MISSING_END_MOMENTS" };
  if (Math.abs(input.M01Nmm) > Math.abs(input.M02Nmm)) return { accepted: false, code: "END_MOMENT_ORDER" };
  if (input.NEdCompressionN === null || !(input.NEdCompressionN > 0)) return { accepted: false, code: "UNSUPPORTED_AXIAL" };
  if (input.AcMm2 === null || !(input.AcMm2 > 0) || input.IMm4 === null || !(input.IMm4 > 0)) return { accepted: false, code: "MISSING_SECTION" };
  if (input.dMm === null || !(input.dMm > 0)) return { accepted: false, code: "MISSING_EFFECTIVE_DEPTH" };
  if (input.AsMm2 === null || !(input.AsMm2 > 0)) return { accepted: false, code: "MISSING_REINFORCEMENT" };
  if (input.fcdMPa === null || !(input.fcdMPa > 0) || input.fckMPa === null || !(input.fckMPa > 0) || input.fydMPa === null || !(input.fydMPa > 0)) {
    return { accepted: false, code: "MISSING_MATERIAL" };
  }
  if (input.EsMPa === null || !(input.EsMPa > 0)) return { accepted: false, code: "MISSING_REINFORCEMENT_MODULUS" };
  return { accepted: true, code: "PROFILE_BOUND" };
}

export function validateEuC6ProfilePack(): { status: "PASS"; ruleCount: number; parameterCount: number; unprovenanced: number } {
  const sourceCount = EU_C6_R1_PARAMETERS.reduce((count, parameter) => count + [...parameter.sourceIds].length, 0);
  const missingFingerprint = EU_C6_R1_RULES.filter((item) => !item.formulaFingerprint.startsWith("fp:")).length;
  const unprovenanced = sourceCount < EU_C6_R1_PARAMETERS.length ? EU_C6_R1_PARAMETERS.length - sourceCount : 0;
  if (unprovenanced !== 0 || missingFingerprint !== 0) {
    throw new Error("C6 reference profile pack is incomplete");
  }
  const resolutions = EU_C6_R1_SOURCE_CONFLICTS.map((conflict) => String(conflict.resolution));
  if (resolutions.includes("AVERAGED")) {
    throw new Error("C6 source conflicts must not be averaged");
  }
  return { status: "PASS", ruleCount: EU_C6_R1_RULES.length, parameterCount: EU_C6_R1_PARAMETERS.length, unprovenanced };
}

export const EU_C6_R1_PROFILE_SOURCES = PROFILE_SOURCES;
