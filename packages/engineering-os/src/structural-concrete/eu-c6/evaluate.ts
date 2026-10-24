import type { ConcreteMaterial, EuC3MethodId, ReinforcementLayout, ReinforcementMaterial, StructuralDemandResult } from "@rtb/types";
import {
  AI_C6_ASSISTANCE_ADVISORY_ONLY,
  AI_C6_CHECK_OVERRIDE_AUTHORITY,
  AI_C6_CONFORMANCE_AUTHORITY,
  AI_C6_CREEP_AUTHORITY,
  AI_C6_EFFECTIVE_LENGTH_AUTHORITY,
  AI_C6_ENGINEERING_APPROVAL,
  AI_C6_METHOD_SELECTION_FOR_FAVORABLE_RESULT,
  AI_C6_NDP_AUTHORITY,
  EU_C3_METHOD_IDS,
  EU_C6_R1_CURVATURE_FACTOR_LOWER_BOUND,
  EU_C6_R1_CURVATURE_FACTOR_UPPER_BOUND,
  EU_C6_R1_PROFILE_VERSION,
  EU_C6_R1_REFERENCE_PROFILE_GENERATION,
  EU_C6_R1_REFERENCE_PROFILE_ID,
  EU_C6_R2_AXIAL_SIGN_CONVERSION_COUNT,
  EU_C6_R2_BIAXIAL_SECOND_ORDER_IMPLEMENTED,
  EU_C6_R2_CREEP_MODEL_IMPLEMENTED,
  EU_C6_R2_EIGENVALUE_BUCKLING_IMPLEMENTED,
  EU_C6_R2_GENERAL_FEA_IMPLEMENTED,
  EU_C6_R2_GENERAL_FRAME_ANALYSIS_IMPLEMENTED,
  EU_C6_R2_GLOBAL_PDELTA_ANALYSIS_IMPLEMENTED,
  EU_C6_R2_IMPLEMENTATION_VERSION,
  EU_C6_R2_METHOD_ID,
  EU_C6_R2_NOMINAL_STIFFNESS_IMPLEMENTED,
  EU_C6_R2_NONLINEAR_FRAME_ANALYSIS_IMPLEMENTED,
  EU_C6_R2_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  EU_C6_R2_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE,
  EU_C6_R2_SECOND_ORDER_CALCULATION_EQUALS_MEMBER_PASS,
  EU_C6_R2_SECOND_ORDER_NEGLECT_DECISION_IMPLEMENTED,
  EU_C6_R2_SHELL_STABILITY_IMPLEMENTED,
  EU_C6_R2_SLENDERNESS_LIMIT_IMPLEMENTED,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  GENERATIVE_MODEL_CAN_BYPASS_EU_C6,
  LLM_C6_NUMERICAL_AUTHORITY,
  STALE_EU_C6_R2_RESULT_REUSE_ALLOWED,
} from "@rtb/types";
import { formulaFingerprint } from "../eu-c1b/fingerprint";
import { evaluateEuC1ConcreteDesignProperties, evaluateEuC1ReinforcementDesignProperties, type EuC1cR1StandardContext } from "../eu-c1c-r1/evaluate";
import { evaluateEuC3DemandPointCheck, type EuC3SolveInput } from "../eu-c3/evaluate";
import { computeGrossSectionProperties } from "../section-mechanics/geometry";
import { createConfiguredKnowledgeContext } from "../../structural-domain/binding";
import { governedProvenance } from "../../structural-domain/catalog";
import { EU_C6_R1_PARAMETERS, EU_C6_R1_RULES, resolveEuC6ReferenceProfile } from "./profile-binding";

const NMM_PER_NM = 1000;

export const EU_C6_R2_C_PARAMETER_MIN = EU_C6_R1_CURVATURE_FACTOR_LOWER_BOUND;
export const EU_C6_R2_C_PARAMETER_MAX = EU_C6_R1_CURVATURE_FACTOR_UPPER_BOUND;
export const EU_C6_R2_C_PARAMETER_AUTHORITY = "VALIDATED_ENGINEERING_REFERENCE" as const;

export type EuC6Axis = "MAJOR_AXIS" | "MINOR_AXIS";
export type EuC6CheckState = "SATISFIED" | "NOT_SATISFIED" | "UNDETERMINED";

export type EuC6NominalCurvatureInput = {
  profileId: string;
  generation: string;
  profileVersion: string;
  nationalAnnexClaim: boolean;
  stale: boolean;
  sourceConflictUnresolved: boolean;
  geometry: Parameters<typeof computeGrossSectionProperties>[0];
  axis: EuC6Axis;
  l0Mm: number | null;
  c: number | null;
  phiEf: number | null;
  esMPa: number | null;
  dMm: number | null;
  asMm2: number | null;
  m01Nmm: number | null;
  m02Nmm: number | null;
  nEdCompressionN: number | null;
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  context: EuC1cR1StandardContext;
  c3?: {
    methodId: EuC3MethodId;
    layout: ReinforcementLayout;
    resolutionX?: number;
    resolutionY?: number;
    provenanceRef: string;
  } | null;
};

export type EuC6NominalCurvatureResult = {
  methodId: typeof EU_C6_R2_METHOD_ID;
  profileId: typeof EU_C6_R1_REFERENCE_PROFILE_ID;
  calculationState: "COMPLETE" | "UNDETERMINED";
  checkState: EuC6CheckState;
  failReason: string | null;
  nEdCompressionN: number | null;
  m01Nmm: number | null;
  m02Nmm: number | null;
  equivalentFirstOrderMomentNmm: number | null;
  additionalImperfectionNmm: 0;
  effectiveLengthMm: number | null;
  sectionAreaMm2: number | null;
  secondMomentMm4: number | null;
  radiusOfGyrationMm: number | null;
  slenderness: number | null;
  phiEf: number | null;
  mechanicalReinforcementRatio: number | null;
  curvatureCorrection: number | null;
  creepFactor: number | null;
  nominalCurvaturePerMm: number | null;
  secondOrderEccentricityMm: number | null;
  secondOrderMomentNmm: number | null;
  totalDesignMomentNmm: number | null;
  c3AxialInputN: number | null;
  c3MomentInputNm: number | null;
  c3CheckState: "CHECK_SATISFIED" | "CHECK_NOT_SATISFIED" | "CHECK_UNDETERMINED" | null;
  c3Utilization: number | null;
  c3MethodId: string | null;
  governingRuleIds: readonly string[];
  profileVersion: typeof EU_C6_R1_PROFILE_VERSION;
  implementationVersion: typeof EU_C6_R2_IMPLEMENTATION_VERSION;
  validationState: "NUMERICALLY_VALIDATED";
  engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW";
  conformanceState: "INTENDED_PROFILE";
  warnings: readonly string[];
  fingerprint: string;
};

function profileNumber(parameterId: string): number {
  const row = EU_C6_R1_PARAMETERS.find((parameter) => parameter.parameterId === parameterId);
  if (!row || row.value === null || !Number.isFinite(row.value)) {
    throw new Error(`C6 profile parameter ${parameterId} is not a governed number`);
  }
  return row.value;
}

function unityBound(operation: "min_ratio_1" | "floor_at_1"): number {
  const rule = EU_C6_R1_RULES.find((item) => item.operations.includes(operation));
  if (!rule) throw new Error(`C6 rule operation ${operation} is not bound`);
  return 1;
}

function finite(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

function blank(reason: string): EuC6NominalCurvatureResult {
  return {
    methodId: EU_C6_R2_METHOD_ID,
    profileId: EU_C6_R1_REFERENCE_PROFILE_ID,
    calculationState: "UNDETERMINED",
    checkState: "UNDETERMINED",
    failReason: reason,
    nEdCompressionN: null,
    m01Nmm: null,
    m02Nmm: null,
    equivalentFirstOrderMomentNmm: null,
    additionalImperfectionNmm: 0,
    effectiveLengthMm: null,
    sectionAreaMm2: null,
    secondMomentMm4: null,
    radiusOfGyrationMm: null,
    slenderness: null,
    phiEf: null,
    mechanicalReinforcementRatio: null,
    curvatureCorrection: null,
    creepFactor: null,
    nominalCurvaturePerMm: null,
    secondOrderEccentricityMm: null,
    secondOrderMomentNmm: null,
    totalDesignMomentNmm: null,
    c3AxialInputN: null,
    c3MomentInputNm: null,
    c3CheckState: null,
    c3Utilization: null,
    c3MethodId: null,
    governingRuleIds: EU_C6_R1_RULES.map((rule) => rule.ruleId),
    profileVersion: EU_C6_R1_PROFILE_VERSION,
    implementationVersion: EU_C6_R2_IMPLEMENTATION_VERSION,
    validationState: "NUMERICALLY_VALIDATED",
    engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW",
    conformanceState: "INTENDED_PROFILE",
    warnings: [reason],
    fingerprint: "",
  };
}

function compressionToTensionPositive(compressionN: number): number {
  if (EU_C6_R2_AXIAL_SIGN_CONVERSION_COUNT !== 1) throw new Error("C6 axial sign conversion must occur once");
  return -compressionN;
}

function memberDemand(axialN: number, momentNm: number): StructuralDemandResult {
  return {
    resultId: "c6-c3-handoff",
    memberId: "c6-member",
    boundaryCondition: "SIMPLE_SIMPLE",
    spanM: 1,
    combinationId: "c6",
    loadCaseIds: ["c6"],
    methods: ["SS_BEAM_UDL"],
    reactions: { startFyN: 0, endFyN: 0, startMzNm: 0, endMzNm: 0, unitForce: "N", unitMoment: "N.m" },
    shear: { value: 0, unit: "N", locationM: 0, signed: 0 },
    moment: { value: Math.abs(momentNm), unit: "N.m", locationM: 0, signed: momentNm },
    axial: { valueN: axialN, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "C6 does not calculate deflection serviceability" },
    torsion: { status: "NOT_IMPLEMENTED" },
    stiffness: null,
    equilibriumResidual: { forceN: 0, momentNm: 0 },
    outputClass: "DETERMINISTIC_DEMAND",
    capacityPresent: false,
    designPassFailPresent: false,
    humanReviewRequired: true,
    approvalState: "not_approved",
    llmOriginated: false,
    standardContext: createConfiguredKnowledgeContext({
      contextId: "ctx-c6-handoff",
      jurisdictionProfileRef: "eu-eea",
      standardFamily: "EN",
      standardCode: "EN 1992",
      edition: "UNKNOWN_PENDING_CONFIRMATION",
      materialScope: "concrete",
    }),
    toolRef: "c6",
    toolVersion: EU_C6_R2_IMPLEMENTATION_VERSION,
    provenanceRef: governedProvenance({ jurisdiction: "EU", standard: "EN 1992", version: EU_C6_R2_IMPLEMENTATION_VERSION }),
    inputEvidenceRefs: [{ evidenceId: "c6", sourceKind: "calculation", reference: EU_C6_R2_METHOD_ID }],
    foundationReactionHandoff: { startFyN: 0, endFyN: 0, startMzNm: 0, endMzNm: 0, geotechnicalCapacityCalculated: false },
  };
}

function equivalentMoment(m01: number, m02: number, high: number, low: number): number {
  const weighted = high * m02 + low * m01;
  const floor = low * m02;
  return m02 >= 0 ? Math.max(weighted, floor) : Math.min(weighted, floor);
}

export function euC6InputFingerprint(input: EuC6NominalCurvatureInput): string {
  return formulaFingerprint({
    ruleId: EU_C6_R2_METHOD_ID,
    operations: [
      input.profileId,
      input.generation,
      input.profileVersion,
      input.geometry.sectionId,
      input.geometry.geometryVersion,
      input.axis,
      String(input.l0Mm),
      String(input.c),
      String(input.phiEf),
      String(input.esMPa),
      String(input.dMm),
      String(input.asMm2),
      String(input.m01Nmm),
      String(input.m02Nmm),
      String(input.nEdCompressionN),
      String(input.concrete.compressiveStrength?.value ?? ""),
      String(input.reinforcement.yieldStrength?.value ?? ""),
      String(input.context.gamma_c?.value ?? ""),
      String(input.context.gamma_s?.value ?? ""),
      String(input.context.alpha_cc?.value ?? ""),
      input.c3?.methodId ?? "",
      EU_C6_R2_IMPLEMENTATION_VERSION,
    ],
    parameterIds: EU_C6_R1_PARAMETERS.map((parameter) => `${parameter.parameterId}:${parameter.value ?? "input"}`),
  });
}

export function evaluateEuC6NominalCurvature(input: EuC6NominalCurvatureInput): EuC6NominalCurvatureResult {
  if (
    EU_C6_R2_GENERAL_FRAME_ANALYSIS_IMPLEMENTED ||
    EU_C6_R2_GLOBAL_PDELTA_ANALYSIS_IMPLEMENTED ||
    EU_C6_R2_EIGENVALUE_BUCKLING_IMPLEMENTED ||
    EU_C6_R2_NONLINEAR_FRAME_ANALYSIS_IMPLEMENTED ||
    EU_C6_R2_GENERAL_FEA_IMPLEMENTED ||
    EU_C6_R2_SHELL_STABILITY_IMPLEMENTED ||
    EU_C6_R2_BIAXIAL_SECOND_ORDER_IMPLEMENTED ||
    EU_C6_R2_NOMINAL_STIFFNESS_IMPLEMENTED ||
    EU_C6_R2_SLENDERNESS_LIMIT_IMPLEMENTED ||
    EU_C6_R2_SECOND_ORDER_NEGLECT_DECISION_IMPLEMENTED ||
    EU_C6_R2_CREEP_MODEL_IMPLEMENTED ||
    EU_C6_R2_SECOND_ORDER_CALCULATION_EQUALS_MEMBER_PASS ||
    GENERATIVE_MODEL_CAN_BYPASS_EU_C6 ||
    LLM_C6_NUMERICAL_AUTHORITY ||
    !AI_C6_ASSISTANCE_ADVISORY_ONLY ||
    AI_C6_EFFECTIVE_LENGTH_AUTHORITY ||
    AI_C6_CREEP_AUTHORITY ||
    AI_C6_NDP_AUTHORITY ||
    AI_C6_METHOD_SELECTION_FOR_FAVORABLE_RESULT ||
    AI_C6_CHECK_OVERRIDE_AUTHORITY ||
    AI_C6_CONFORMANCE_AUTHORITY ||
    AI_C6_ENGINEERING_APPROVAL ||
    EU_CONCRETE_PACK_CERTIFIED ||
    EU_CONCRETE_STANDARD_CONFORMANCE_STATE !== "INTENDED_PROFILE" ||
    STALE_EU_C6_R2_RESULT_REUSE_ALLOWED
  ) {
    return blank("AUTHORITY_BOUNDARY");
  }
  if (input.axis !== "MAJOR_AXIS" && input.axis !== "MINOR_AXIS") return blank("UNSUPPORTED_ACTION");
  if (!finite(input.nEdCompressionN)) return blank("MISSING_OR_INVALID_AXIAL");
  if (!(input.nEdCompressionN > 0)) return blank("UNSUPPORTED_AXIAL");
  if (!finite(input.m01Nmm) || !finite(input.m02Nmm)) return blank("MISSING_END_MOMENTS");
  if (input.m02Nmm === 0 || Math.abs(input.m01Nmm) > Math.abs(input.m02Nmm)) return blank("INVALID_END_MOMENT_ORDER");
  if (!finite(input.l0Mm) || !(input.l0Mm > 0)) return blank("MISSING_EFFECTIVE_LENGTH");
  if (!finite(input.phiEf) || input.phiEf < 0) return blank("MISSING_OR_INVALID_CREEP");
  if (!finite(input.esMPa) || !(input.esMPa > 0)) return blank("MISSING_OR_INVALID_ES");
  if (!finite(input.dMm) || !(input.dMm > 0)) return blank("MISSING_EFFECTIVE_DEPTH");
  if (!finite(input.asMm2) || !(input.asMm2 > 0)) return blank("MISSING_REINFORCEMENT");
  if (input.c === null || !Number.isFinite(input.c)) return blank("MISSING_CURVATURE_FACTOR");
  if (input.c < EU_C6_R2_C_PARAMETER_MIN || input.c > EU_C6_R2_C_PARAMETER_MAX) return blank("INVALID_CURVATURE_FACTOR");
  if (input.geometry.shape !== "RECTANGULAR") return blank("UNSUPPORTED_GEOMETRY");

  const properties = computeGrossSectionProperties(input.geometry);
  const area = properties.grossConcreteAreaMm2;
  const inertia = input.axis === "MAJOR_AXIS" ? properties.IxMm4 : properties.IyMm4;
  if (!(area > 0) || !(inertia > 0)) return blank("INVALID_GEOMETRY");

  const concrete = evaluateEuC1ConcreteDesignProperties({ concrete: input.concrete, context: input.context });
  if (!concrete.ok) return blank("MISSING_UPSTREAM_DESIGN_PROPERTY");
  const reinforcement = evaluateEuC1ReinforcementDesignProperties({
    reinforcement: input.reinforcement,
    area: {
      name: "As",
      value: input.asMm2,
      unit: "mm2",
      provenanceRef: input.reinforcement.materialRef,
      sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    },
    context: input.context,
  });
  if (!reinforcement.ok) return blank("MISSING_UPSTREAM_DESIGN_PROPERTY");
  const fcd = concrete.outputs.fcdMPa;
  const fck = concrete.outputs.fckMPa;
  const fyd = reinforcement.outputs.fydMPa;

  const resolved = resolveEuC6ReferenceProfile({
    profileId: input.profileId,
    generation: input.generation,
    nationalAnnexClaim: input.nationalAnnexClaim,
    geometry: input.geometry.shape,
    bending: "UNIAXIAL",
    l0Mm: input.l0Mm,
    c: input.c,
    phiEf: input.phiEf,
    M01Nmm: input.m01Nmm,
    M02Nmm: input.m02Nmm,
    NEdCompressionN: input.nEdCompressionN,
    AcMm2: area,
    IMm4: inertia,
    dMm: input.dMm,
    AsMm2: input.asMm2,
    fcdMPa: fcd,
    fckMPa: fck,
    fydMPa: fyd,
    EsMPa: input.esMPa,
    sourceConflictUnresolved: input.sourceConflictUnresolved,
    stale: input.stale || input.profileVersion !== EU_C6_R1_PROFILE_VERSION,
  });
  if (!resolved.accepted) return blank(resolved.code);
  const radius = Math.sqrt(inertia / area);
  const slenderness = input.l0Mm / radius;
  const n = input.nEdCompressionN / (area * fcd);
  const omega = (input.asMm2 * fyd) / (area * fcd);
  let nBal: number;
  let betaConstant: number;
  let betaFckDivisor: number;
  let betaLambdaDivisor: number;
  let curvatureBaseFactor: number;
  let momentWeightHigh: number;
  let momentWeightLow: number;
  try {
    nBal = profileNumber("nBal");
    betaConstant = profileNumber("betaConstant");
    betaFckDivisor = profileNumber("betaFckDivisor");
    betaLambdaDivisor = profileNumber("betaLambdaDivisor");
    curvatureBaseFactor = profileNumber("curvatureBaseFactor");
    momentWeightHigh = profileNumber("momentWeightHigh");
    momentWeightLow = profileNumber("momentWeightLow");
  } catch {
    return blank("MISSING_PROFILE_PARAMETER");
  }
  if (!(unityBound("floor_at_1") + omega > nBal) || !(n < unityBound("floor_at_1") + omega)) return blank("INVALID_CURVATURE_DOMAIN");
  const nu = unityBound("floor_at_1") + omega;
  const curvatureCorrection = Math.min((nu - n) / (nu - nBal), unityBound("min_ratio_1"));
  const beta = betaConstant + fck / betaFckDivisor - slenderness / betaLambdaDivisor;
  const creepFactor = Math.max(unityBound("floor_at_1"), unityBound("floor_at_1") + beta * input.phiEf);
  const nominalCurvaturePerMm = (curvatureCorrection * creepFactor * fyd) / (input.esMPa * curvatureBaseFactor * input.dMm);
  const eccentricityMm = (nominalCurvaturePerMm * input.l0Mm * input.l0Mm) / input.c;
  const secondOrderMomentNmm = input.nEdCompressionN * eccentricityMm;
  const m0e = equivalentMoment(input.m01Nmm, input.m02Nmm, momentWeightHigh, momentWeightLow);
  const totalNmm = m0e + Math.sign(m0e) * secondOrderMomentNmm;
  const c3Axial = compressionToTensionPositive(input.nEdCompressionN);
  const c3MomentNm = totalNmm / NMM_PER_NM;

  let c3Check: EuC6NominalCurvatureResult["c3CheckState"] = null;
  let c3Utilization: number | null = null;
  let c3MethodId: string | null = null;
  let checkState: EuC6CheckState = "UNDETERMINED";
  const warnings: string[] = [];
  if (!input.c3) {
    warnings.push("C3_HANDOFF_NOT_REQUESTED");
  } else {
    const expectedMethod = input.axis === "MINOR_AXIS" ? EU_C3_METHOD_IDS[1] : EU_C3_METHOD_IDS[0];
    if (input.c3.methodId !== expectedMethod) return blank("C3_METHOD_MISMATCH");
    const solve: EuC3SolveInput = {
      methodId: input.c3.methodId,
      axis: input.axis,
      momentSign: c3MomentNm >= 0 ? "POSITIVE" : "NEGATIVE",
      geometry: input.geometry,
      layout: input.c3.layout,
      concrete: input.concrete,
      reinforcement: input.reinforcement,
      context: input.context,
      targetAxialN: c3Axial,
      resolutionX: input.c3.resolutionX,
      resolutionY: input.c3.resolutionY,
      provenanceRef: input.c3.provenanceRef,
    };
    const checked = evaluateEuC3DemandPointCheck({ ...solve, demand: memberDemand(c3Axial, c3MomentNm) });
    c3Check = checked.checkState;
    c3Utilization = checked.utilization;
    c3MethodId = input.c3.methodId;
    checkState = checked.checkState === "CHECK_SATISFIED" ? "SATISFIED" : checked.checkState === "CHECK_NOT_SATISFIED" ? "NOT_SATISFIED" : "UNDETERMINED";
    if (checked.failReason) warnings.push(checked.failReason);
  }

  const result: EuC6NominalCurvatureResult = {
    methodId: EU_C6_R2_METHOD_ID,
    profileId: EU_C6_R1_REFERENCE_PROFILE_ID,
    calculationState: "COMPLETE",
    checkState,
    failReason: null,
    nEdCompressionN: input.nEdCompressionN,
    m01Nmm: input.m01Nmm,
    m02Nmm: input.m02Nmm,
    equivalentFirstOrderMomentNmm: m0e,
    additionalImperfectionNmm: 0,
    effectiveLengthMm: input.l0Mm,
    sectionAreaMm2: area,
    secondMomentMm4: inertia,
    radiusOfGyrationMm: radius,
    slenderness,
    phiEf: input.phiEf,
    mechanicalReinforcementRatio: omega,
    curvatureCorrection,
    creepFactor,
    nominalCurvaturePerMm,
    secondOrderEccentricityMm: eccentricityMm,
    secondOrderMomentNmm,
    totalDesignMomentNmm: totalNmm,
    c3AxialInputN: c3Axial,
    c3MomentInputNm: c3MomentNm,
    c3CheckState: c3Check,
    c3Utilization,
    c3MethodId,
    governingRuleIds: EU_C6_R1_RULES.map((rule) => rule.ruleId),
    profileVersion: EU_C6_R1_PROFILE_VERSION,
    implementationVersion: EU_C6_R2_IMPLEMENTATION_VERSION,
    validationState: "NUMERICALLY_VALIDATED",
    engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW",
    conformanceState: "INTENDED_PROFILE",
    warnings,
    fingerprint: euC6InputFingerprint(input),
  };
  return result;
}

export function assertEuC6ResultCurrent(result: EuC6NominalCurvatureResult, input: EuC6NominalCurvatureInput): void {
  if (STALE_EU_C6_R2_RESULT_REUSE_ALLOWED) throw new Error("stale C6 reuse is forbidden");
  if (result.fingerprint !== euC6InputFingerprint(input) || result.profileVersion !== input.profileVersion) {
    throw new Error("stale C6 result");
  }
}

export function assertEuC6OptimizerRejectsUndetermined(state: EuC6CheckState): void {
  if (EU_C6_R2_OPTIMIZATION_ACCEPTS_UNDETERMINED) throw new Error("C6 optimization must not accept undetermined");
  if (state === "UNDETERMINED") throw new Error("undetermined C6 check is not feasible");
}

export function assertEuC6ParetoRejectsUndetermined(state: EuC6CheckState): void {
  if (EU_C6_R2_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE) throw new Error("C6 Pareto must not accept undetermined");
  if (state === "UNDETERMINED") throw new Error("undetermined C6 check is not feasible");
}

export function selectEuC6EffectiveLength(): never {
  throw new Error("C6 does not select effective length");
}
