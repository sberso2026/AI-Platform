import type { ConcreteMaterial, EosGlobalProvenanceContract, EuC5TorsionDetail, ReinforcementMaterial } from "@rtb/types";
import {
  EU_C1C_R1_PARAMETER_VERSION,
  EU_C5_T3R_PROFILE_VERSION,
  EU_C5_T3R_REFERENCE_PROFILE_GENERATION,
  EU_C5_T3R_REFERENCE_PROFILE_ID,
  EU_C5_T4_TORSION_RULE_IDS,
} from "@rtb/types";
import { evaluateEuC1ConcreteDesignProperties, evaluateEuC1ReinforcementDesignProperties } from "../eu-c1c-r1/evaluate";
import {
  EU_C5_T3R_CLOSED_SHEAR_FLOW_FACTOR,
  EU_C5_T3R_TORSION_RULES,
  euC5TorsionProfileNumber,
  resolveEuC5TorsionReferenceProfile,
} from "./profile-binding";

const N_MM_PER_N_M = 1000;

export type EuC5TorsionSectionKind = "RECTANGULAR_SOLID" | "RECTANGULAR_HOLLOW" | "OTHER";

export type EuC5TorsionMethodInput = {
  profileId: string;
  generation: string;
  profileVersion: string;
  sectionKind: EuC5TorsionSectionKind;
  widthMm: number;
  heightMm: number;
  actualWallThicknessMm?: number;
  cotTheta: number;
  prestressed: boolean;
  signedTorsionNm: number;
  signedShearN: number;
  shearResistanceMaxN?: number;
  fckMPa: number;
  concreteElasticModulusMPa: number;
  fykLongitudinalMPa: number;
  fykTransverseMPa: number;
  reinforcementElasticModulusMPa: number;
  reinforcementReferenceAreaMm2: number;
  alphaCc: number;
  gammaC: number;
  gammaS: number;
  ndpSourceRef: string;
  transverseProvidedMm2PerMm: number;
  longitudinalProvidedMm2: number;
};

export type EuC5TorsionMethodResult =
  | { ok: false; failReason: "MISSING_GEOMETRY" | "MISSING_MATERIAL_PARAMETER" | "MISSING_NDP" | "MISSING_SHEAR_REINFORCEMENT_DATA" | "MISSING_LONGITUDINAL_REINFORCEMENT" | "UNSUPPORTED_GEOMETRY" | "UNSUPPORTED_RULE_APPLICABILITY" | "RULE_SOURCE_CONFLICT" | "STALE_RESULT" | "INVALID_INPUT"; warning: string }
  | { ok: true; detail: EuC5TorsionDetail; governingRuleIds: readonly string[]; utilization: number | null; checkState: EuC5TorsionDetail["interactionCheck"] };

function finitePositive(value: number | undefined): value is number {
  return value != null && Number.isFinite(value) && value > 0;
}

function materialProvenance(sourceRef: string): EosGlobalProvenanceContract {
  return {
    sourceEvidence: sourceRef,
    sourceRevision: null,
    model: null,
    tool: null,
    solver: null,
    version: EU_C5_T3R_PROFILE_VERSION,
    promptOrTemplate: null,
    timestamp: "2026-10-10T00:00:00.000Z",
    jurisdiction: "EU",
    standard: "EN 1992",
    calculationMethod: EU_C5_T3R_REFERENCE_PROFILE_ID,
    confidence: null,
    validationState: "NUMERICALLY_VALIDATED",
    humanReviewer: null,
    approvalState: "PENDING_HUMAN_ENGINEERING_REVIEW",
  };
}

function concreteMaterial(fckMPa: number, elasticModulusMPa: number, sourceRef: string): ConcreteMaterial {
  const property = (name: string, value: number) => ({
    name,
    value,
    unit: "MPa",
    provenanceRef: sourceRef,
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const,
  });
  return {
    materialRef: sourceRef,
    designation: "DECLARED_FCK",
    compressiveStrength: property("fck", fckMPa),
    tensileStrength: null,
    elasticModulus: property("Ec", elasticModulusMPa),
    density: null,
    poissonRatio: null,
    age: null,
    strengthReferenceAge: null,
    materialClass: null,
    materialStandardRef: sourceRef,
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    testCertificateRef: sourceRef,
    environmentalMetadata: null,
    version: EU_C5_T3R_PROFILE_VERSION,
    provenance: materialProvenance(sourceRef),
  };
}

function reinforcementMaterial(fykMPa: number, elasticModulusMPa: number, sourceRef: string): ReinforcementMaterial {
  const property = (name: string, value: number) => ({
    name,
    value,
    unit: "MPa",
    provenanceRef: sourceRef,
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const,
  });
  return {
    materialRef: sourceRef,
    designation: "DECLARED_FYK",
    yieldStrength: property("fyk", fykMPa),
    ultimateStrength: null,
    elasticModulus: property("Es", elasticModulusMPa),
    ductilityClass: null,
    productStandardRef: sourceRef,
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    version: EU_C5_T3R_PROFILE_VERSION,
    provenance: materialProvenance(sourceRef),
  };
}

function declaredNdp(value: number, sourceRef: string) {
  return {
    value,
    unit: "dimensionless",
    sourceAuthority: "DECLARED_NDP_OR_PROJECT_OVERRIDE" as const,
    provenanceRef: sourceRef,
    ndpIdentity: "DECLARED_PROJECT_OVERRIDE" as const,
    version: EU_C1C_R1_PARAMETER_VERSION,
  };
}

function ratio(required: number, provided: number): { ratio: number | null; check: EuC5TorsionDetail["interactionCheck"] } {
  if (required === 0 && provided >= 0) return { ratio: 0, check: "CHECK_SATISFIED" };
  if (!(provided > 0)) return { ratio: null, check: "CHECK_NOT_SATISFIED" };
  const value = required / provided;
  return { ratio: value, check: value <= 1 ? "CHECK_SATISFIED" : "CHECK_NOT_SATISFIED" };
}

export function evaluateBoundedEuC5Torsion(input: EuC5TorsionMethodInput): EuC5TorsionMethodResult {
  if (EU_C5_T3R_TORSION_RULES.length !== EU_C5_T4_TORSION_RULE_IDS.length) {
    throw new Error("torsion runtime rule list drifted from the bound profile");
  }
  try {
    resolveEuC5TorsionReferenceProfile({
      profileId: input.profileId,
      generation: input.generation,
      profileVersion: input.profileVersion,
      cotTheta: input.cotTheta,
      prestressed: input.prestressed,
      interactionForm: "LINEAR_STRUT",
      sectionKind: input.sectionKind === "RECTANGULAR_HOLLOW" ? "HOLLOW" : input.sectionKind === "RECTANGULAR_SOLID" ? "RECTANGULAR_SOLID" : "OTHER",
      actualWallThicknessMm: input.actualWallThicknessMm,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "profile resolution failed";
    if (message === "PROFILE_MISMATCH" || message === "GENERATION_MISMATCH" || message === "UNSUPPORTED_PRESTRESSED_ALPHA_CW") {
      return { ok: false, failReason: "UNSUPPORTED_RULE_APPLICABILITY", warning: message };
    }
    if (message === "STALE_PROFILE_VERSION") return { ok: false, failReason: "STALE_RESULT", warning: message };
    if (message === "SOURCE_CONFLICT") return { ok: false, failReason: "RULE_SOURCE_CONFLICT", warning: message };
    if (message === "UNSUPPORTED_GEOMETRY") return { ok: false, failReason: "UNSUPPORTED_GEOMETRY", warning: message };
    if (message === "MISSING_PARAMETER") return { ok: false, failReason: "MISSING_GEOMETRY", warning: message };
    return { ok: false, failReason: "INVALID_INPUT", warning: message };
  }
  if (!Number.isFinite(input.signedTorsionNm) || !Number.isFinite(input.signedShearN)) {
    return { ok: false, failReason: "INVALID_INPUT", warning: "torsion and shear demand must be finite" };
  }
  if (!finitePositive(input.widthMm) || !finitePositive(input.heightMm)) {
    return { ok: false, failReason: "MISSING_GEOMETRY", warning: "width and height are required" };
  }
  if (!finitePositive(input.fckMPa) || !finitePositive(input.concreteElasticModulusMPa)) {
    return { ok: false, failReason: "MISSING_MATERIAL_PARAMETER", warning: "fck and concrete elastic modulus are required" };
  }
  if (!input.ndpSourceRef.trim() || !finitePositive(input.alphaCc) || !finitePositive(input.gammaC) || !finitePositive(input.gammaS)) {
    return { ok: false, failReason: "MISSING_NDP", warning: "alpha_cc, gamma_c, and gamma_s must be declared" };
  }
  if (!Number.isFinite(input.transverseProvidedMm2PerMm) || input.transverseProvidedMm2PerMm < 0) {
    return { ok: false, failReason: "MISSING_SHEAR_REINFORCEMENT_DATA", warning: "transverse torsion reinforcement must be explicit" };
  }
  if (!Number.isFinite(input.longitudinalProvidedMm2) || input.longitudinalProvidedMm2 < 0) {
    return { ok: false, failReason: "MISSING_LONGITUDINAL_REINFORCEMENT", warning: "longitudinal torsion reinforcement must be explicit" };
  }
  const flow = EU_C5_T3R_CLOSED_SHEAR_FLOW_FACTOR;
  const outerArea = input.widthMm * input.heightMm;
  const outerPerimeter = flow * (input.widthMm + input.heightMm);
  let thickness = outerArea / outerPerimeter;
  if (input.sectionKind === "RECTANGULAR_HOLLOW") {
    const wall = input.actualWallThicknessMm;
    if (!finitePositive(wall)) {
      return { ok: false, failReason: "MISSING_GEOMETRY", warning: "hollow wall thickness is required" };
    }
    thickness = Math.min(thickness, wall);
  }
  const innerWidth = input.widthMm - thickness;
  const innerHeight = input.heightMm - thickness;
  if (!(innerWidth > 0) || !(innerHeight > 0)) {
    return { ok: false, failReason: "INVALID_INPUT", warning: "centre-line tube is not positive" };
  }
  const enclosed = innerWidth * innerHeight;
  const perimeter = flow * (innerWidth + innerHeight);
  const context = {
    projectOverrideRef: input.ndpSourceRef,
    alpha_cc: declaredNdp(input.alphaCc, input.ndpSourceRef),
    gamma_c: declaredNdp(input.gammaC, input.ndpSourceRef),
    gamma_s: declaredNdp(input.gammaS, input.ndpSourceRef),
  };
  const concrete = evaluateEuC1ConcreteDesignProperties({
    concrete: concreteMaterial(input.fckMPa, input.concreteElasticModulusMPa, input.ndpSourceRef),
    context,
  });
  if (!concrete.ok) return { ok: false, failReason: "MISSING_NDP", warning: concrete.failReason };
  const torsionMagnitudeNm = Math.abs(input.signedTorsionNm);
  const shearMagnitudeN = Math.abs(input.signedShearN);
  let fywd = 0;
  let fyd = 0;
  if (torsionMagnitudeNm > 0) {
    if (!finitePositive(input.fykLongitudinalMPa) || !finitePositive(input.fykTransverseMPa) || !finitePositive(input.reinforcementElasticModulusMPa) || !finitePositive(input.reinforcementReferenceAreaMm2)) {
      return { ok: false, failReason: "MISSING_MATERIAL_PARAMETER", warning: "reinforcement yield, modulus, and reference area are required" };
    }
    const area = {
      name: "Aref",
      value: input.reinforcementReferenceAreaMm2,
      unit: "mm2",
      provenanceRef: input.ndpSourceRef,
      sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const,
    };
    const transverse = evaluateEuC1ReinforcementDesignProperties({
      reinforcement: reinforcementMaterial(input.fykTransverseMPa, input.reinforcementElasticModulusMPa, input.ndpSourceRef),
      area,
      context,
    });
    const longitudinal = evaluateEuC1ReinforcementDesignProperties({
      reinforcement: reinforcementMaterial(input.fykLongitudinalMPa, input.reinforcementElasticModulusMPa, input.ndpSourceRef),
      area,
      context,
    });
    if (!transverse.ok || !longitudinal.ok) {
      return { ok: false, failReason: "MISSING_MATERIAL_PARAMETER", warning: "C1 reinforcement design strength is unresolved" };
    }
    fywd = transverse.outputs.fydMPa;
    fyd = longitudinal.outputs.fydMPa;
  }
  const nu = euC5TorsionProfileNumber("nuCoefficient") * (1 - input.fckMPa / euC5TorsionProfileNumber("nuFckDivisor"));
  if (!(nu > 0)) return { ok: false, failReason: "INVALID_INPUT", warning: "strength reduction is not positive" };
  const alphaCw = euC5TorsionProfileNumber("alphaCw");
  const strut = input.cotTheta / (1 + input.cotTheta * input.cotTheta);
  const resistanceNm = (flow * nu * alphaCw * concrete.outputs.fcdMPa * enclosed * thickness * strut) / N_MM_PER_N_M;
  if (!(resistanceNm > 0)) return { ok: false, failReason: "INVALID_INPUT", warning: "maximum torsional resistance is not positive" };
  let interaction = torsionMagnitudeNm / resistanceNm;
  if (shearMagnitudeN > 0) {
    const shearResistance = input.shearResistanceMaxN;
    if (!finitePositive(shearResistance)) {
      return { ok: false, failReason: "INVALID_INPUT", warning: "VRd,max is required when shear demand is non-zero" };
    }
    interaction += shearMagnitudeN / shearResistance;
  }
  const demandNmm = torsionMagnitudeNm * N_MM_PER_N_M;
  const transverseRequired = torsionMagnitudeNm === 0 ? 0 : demandNmm / (flow * enclosed * fywd * input.cotTheta);
  const longitudinalRequired = torsionMagnitudeNm === 0 ? 0 : (demandNmm * input.cotTheta * perimeter) / (flow * enclosed * fyd);
  const transverse = ratio(transverseRequired, input.transverseProvidedMm2PerMm);
  const longitudinal = ratio(longitudinalRequired, input.longitudinalProvidedMm2);
  const interactionCheck = interaction <= 1 ? "CHECK_SATISFIED" : "CHECK_NOT_SATISFIED";
  const candidates = [
    { id: "STRUT_INTERACTION" as const, ratio: interaction, check: interactionCheck },
    { id: "TRANSVERSE_REINFORCEMENT" as const, ratio: transverse.ratio, check: transverse.check },
    { id: "LONGITUDINAL_REINFORCEMENT" as const, ratio: longitudinal.ratio, check: longitudinal.check },
  ];
  const failed = candidates.find((row) => row.check === "CHECK_NOT_SATISFIED" && row.ratio == null)
    ?? [...candidates].sort((a, b) => (b.ratio ?? Number.POSITIVE_INFINITY) - (a.ratio ?? Number.POSITIVE_INFINITY))[0];
  const detail: EuC5TorsionDetail = {
    profileId: EU_C5_T3R_REFERENCE_PROFILE_ID,
    profileType: "REFERENCE_IMPLEMENTATION_PROFILE",
    signedTorsionalDemandNm: input.signedTorsionNm,
    signedShearDemandN: input.signedShearN,
    maximumTorsionalResistanceNm: resistanceNm,
    interactionRatio: interaction,
    interactionCheck,
    transverseRequirementMm2PerMm: transverseRequired,
    transverseProvidedMm2PerMm: input.transverseProvidedMm2PerMm,
    transverseRatio: transverse.ratio,
    transverseCheck: transverse.check,
    longitudinalRequirementMm2: longitudinalRequired,
    longitudinalProvidedMm2: input.longitudinalProvidedMm2,
    longitudinalRatio: longitudinal.ratio,
    longitudinalCheck: longitudinal.check,
    governingCheck: failed.id,
    materialFingerprint: `fcd:${concrete.outputs.fcdMPa};fywd:${fywd};fyd:${fyd};nu:${nu}`,
    profileFingerprint: `${EU_C5_T3R_REFERENCE_PROFILE_ID}:${EU_C5_T3R_PROFILE_VERSION}:${EU_C5_T3R_REFERENCE_PROFILE_GENERATION}`,
    engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW",
  };
  return {
    ok: true,
    detail,
    governingRuleIds: EU_C5_T4_TORSION_RULE_IDS,
    utilization: failed.ratio,
    checkState: failed.check as EuC5TorsionDetail["interactionCheck"],
  };
}
