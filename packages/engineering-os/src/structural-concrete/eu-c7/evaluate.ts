import type { ConcreteGovernedProperty, ConcreteMaterial, RcSectionGeometryInput, ReinforcementMaterial } from "@rtb/types";
import {
  AI_C7_ASSISTANCE_ADVISORY_ONLY,
  AI_C7_BOND_CLASS_AUTHORITY,
  AI_C7_CHECK_OVERRIDE_AUTHORITY,
  AI_C7_CONFORMANCE_AUTHORITY,
  AI_C7_CRACK_LIMIT_AUTHORITY,
  AI_C7_ENGINEERING_APPROVAL,
  AI_C7_NDP_AUTHORITY,
  AI_C7_RULE_PARAMETER_AUTHORITY,
  AI_C7_SERVICE_COMBINATION_AUTHORITY,
  AI_C7_SIGMA_S_AUTHORITY,
  C7_R2_AUTOMATICALLY_SUPPLIES_C6_PHIEF,
  EU_C7_GENERAL_NONLINEAR_FEA_IMPLEMENTED,
  EU_C7_R1_PROFILE_VERSION,
  EU_C7_R1_REFERENCE_PROFILE_GENERATION,
  EU_C7_R1_REFERENCE_PROFILE_ID,
  EU_C7_R2_BAR_DIAMETER_LIMIT_CHECK_IMPLEMENTED,
  EU_C7_R2_BAR_SPACING_LIMIT_CHECK_IMPLEMENTED,
  EU_C7_R2_BOND_CLASS_DEFAULTED,
  EU_C7_R2_COVER_GUESSED,
  EU_C7_R2_CRACK_LIMIT_DEFAULTED,
  EU_C7_R2_CRACK_WIDTH_METHOD_ID,
  EU_C7_R2_DURATION_DEFAULTED,
  EU_C7_R2_FCTEFF_DEFAULTED,
  EU_C7_R2_IMPLEMENTATION_VERSION,
  EU_C7_R2_K2_DEFAULTED,
  EU_C7_R2_MINIMUM_REINFORCEMENT_CHECK_IMPLEMENTED,
  EU_C7_R2_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  EU_C7_R2_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE,
  EU_C7_R2_REINFORCEMENT_AUTODESIGN,
  EU_C7_R2_SERVICE_STRESS_LIMIT_CHECK_IMPLEMENTED,
  EU_C7_R2_SIGMA_S_DEFAULTED,
  EU_C7_R2_SIGMA_S_ROUTE,
  EU_C7_R2_STRAIN_FLOOR_HARDCODED,
  EU_C7_R2_ULS_ACTIONS_ACCEPTED,
  EU_C7_R2_ULS_STEEL_STRESS_REUSED_AS_SLS,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  GENERATIVE_MODEL_CAN_BYPASS_EU_C7_CRACKING,
  LLM_C7_NUMERICAL_AUTHORITY,
  NEW_C7_CRACK_WIDTH_RUNTIME_METHOD_IMPLEMENTED,
  STALE_EU_C7_R2_RESULT_REUSE_ALLOWED,
} from "@rtb/types";
import { formulaFingerprint } from "../eu-c1b/fingerprint";
import { evaluateEuC1ConcreteCharProperties, evaluateEuC1ReinforcementCharProperties } from "../eu-c1/evaluate";
import { computeGrossSectionProperties } from "../section-mechanics/geometry";
import { EU_C7_R1_CRACK_WIDTH_REQUIRED_RULE_IDS, EU_C7_R1_PARAMETERS } from "./profile-binding";

/** Mathematical identities used by the bound half-depth and unity terms. */
function unity(): number {
  return 1;
}
function half(value: number): number {
  return value / (unity() + unity());
}

export type EuC7MemberType = "BEAM" | "SOLID_SLAB";
export type EuC7CheckState = "SATISFIED" | "NOT_SATISFIED" | "UNDETERMINED";
export type EuC7SectionCrackState = "UNCRACKED" | "CRACKED" | "UNDETERMINED";
export type EuC7Surface = "HIGH_BOND" | "PLAIN";
export type EuC7StrainCase = "BENDING" | "PURE_TENSION" | "INTERMEDIATE";
export type EuC7Duration = "SHORT_TERM" | "LONG_TERM";

export type EuC7CrackWidthInput = {
  profileId: string;
  generation: string;
  profileVersion: string;
  nationalAnnexClaim: boolean;
  stale: boolean;
  sourceConflictUnresolved: boolean;
  memberType: EuC7MemberType;
  prestressed: boolean;
  geometry: RcSectionGeometryInput;
  combinationId: string | null;
  combinationCategory: string | null;
  combinationLimitState: string | null;
  nServiceN: number | null;
  mServiceNmm: number | null;
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  reinforcementArea: ConcreteGovernedProperty | null;
  fctEffMPa: number | null;
  fctEffProvenanceRef: string | null;
  sigmaSMpa: number | null;
  sigmaSLimitState: "SLS" | "ULS" | null;
  sigmaSProvenanceRef: string | null;
  coverMm: number | null;
  phiMm: number | null;
  asMm2: number | null;
  widthMm: number | null;
  hMm: number | null;
  dMm: number | null;
  xMm: number | null;
  thicknessMm: number | null;
  surface: EuC7Surface | null;
  strainCase: EuC7StrainCase | null;
  k2Intermediate: number | null;
  duration: EuC7Duration | null;
  wMaxMm: number | null;
  wMaxRequirementId: string | null;
};

export type EuC7CrackWidthResult = {
  methodId: typeof EU_C7_R2_CRACK_WIDTH_METHOD_ID;
  profileId: typeof EU_C7_R1_REFERENCE_PROFILE_ID;
  profileVersion: typeof EU_C7_R1_PROFILE_VERSION;
  implementationVersion: typeof EU_C7_R2_IMPLEMENTATION_VERSION;
  calculationState: "COMPLETE" | "UNDETERMINED";
  checkState: EuC7CheckState;
  failReason: string | null;
  serviceCombinationId: string | null;
  serviceCombinationType: "QUASI_PERMANENT" | null;
  sectionCrackState: EuC7SectionCrackState;
  extremeElasticTensionMPa: number | null;
  fctEffMPa: number | null;
  ecmMPa: number | null;
  esMPa: number | null;
  sigmaSMpa: number | null;
  sigmaSRoute: typeof EU_C7_R2_SIGMA_S_ROUTE;
  coverMm: number | null;
  coverSemantics: "COVER_TO_BAR_SURFACE";
  barDiameterMm: number | null;
  reinforcementAreaMm2: number | null;
  effectiveTensionHeightMm: number | null;
  effectiveTensionAreaMm2: number | null;
  effectiveReinforcementRatio: number | null;
  modularRatio: number | null;
  bondClass: EuC7Surface | null;
  strainDistributionClass: EuC7StrainCase | null;
  durationClass: EuC7Duration | null;
  tensionStiffeningFactor: number | null;
  meanStrainDifference: number | null;
  maximumCrackSpacingMm: number | null;
  crackWidthMm: number | null;
  crackLimitMm: number | null;
  utilization: number | null;
  governingRuleIds: readonly string[];
  parameterVersions: readonly string[];
  geometryFingerprint: string | null;
  reinforcementFingerprint: string | null;
  materialFingerprint: string | null;
  actionFingerprint: string | null;
  profileFingerprint: string | null;
  validationState: "NUMERICALLY_VALIDATED";
  engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW";
  conformanceState: typeof EU_CONCRETE_STANDARD_CONFORMANCE_STATE;
  warnings: readonly string[];
  provenance: {
    combinationId: string | null;
    fctEffProvenanceRef: string | null;
    sigmaSProvenanceRef: string | null;
    sigmaSLimitState: "SLS" | "ULS" | null;
    wMaxRequirementId: string | null;
    geometryProvenanceRef: string | null;
    concreteProvenanceRef: string | null;
    reinforcementProvenanceRef: string | null;
  };
  resultFingerprint: string | null;
};

function profileNumber(parameterId: string): number {
  const row = EU_C7_R1_PARAMETERS.find((parameter) => parameter.parameterId === parameterId);
  if (!row || row.value === null || !Number.isFinite(row.value)) throw new Error(`MISSING_PROFILE_PARAMETER:${parameterId}`);
  return row.value;
}

function positive(value: number | null): value is number {
  return value !== null && Number.isFinite(value) && value > 0;
}

function finite(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

function blank(input: EuC7CrackWidthInput, failReason: string | null, warnings: readonly string[] = []): EuC7CrackWidthResult {
  return {
    methodId: EU_C7_R2_CRACK_WIDTH_METHOD_ID,
    profileId: EU_C7_R1_REFERENCE_PROFILE_ID,
    profileVersion: EU_C7_R1_PROFILE_VERSION,
    implementationVersion: EU_C7_R2_IMPLEMENTATION_VERSION,
    calculationState: "UNDETERMINED",
    checkState: "UNDETERMINED",
    failReason,
    serviceCombinationId: input.combinationId,
    serviceCombinationType: input.combinationCategory === "quasi_permanent" ? "QUASI_PERMANENT" : null,
    sectionCrackState: "UNDETERMINED",
    extremeElasticTensionMPa: null,
    fctEffMPa: input.fctEffMPa,
    ecmMPa: null,
    esMPa: null,
    sigmaSMpa: null,
    sigmaSRoute: EU_C7_R2_SIGMA_S_ROUTE,
    coverMm: input.coverMm,
    coverSemantics: "COVER_TO_BAR_SURFACE",
    barDiameterMm: input.phiMm,
    reinforcementAreaMm2: input.asMm2,
    effectiveTensionHeightMm: null,
    effectiveTensionAreaMm2: null,
    effectiveReinforcementRatio: null,
    modularRatio: null,
    bondClass: input.surface,
    strainDistributionClass: input.strainCase,
    durationClass: input.duration,
    tensionStiffeningFactor: null,
    meanStrainDifference: null,
    maximumCrackSpacingMm: null,
    crackWidthMm: null,
    crackLimitMm: input.wMaxMm,
    utilization: null,
    governingRuleIds: [],
    parameterVersions: [],
    geometryFingerprint: null,
    reinforcementFingerprint: null,
    materialFingerprint: null,
    actionFingerprint: null,
    profileFingerprint: null,
    validationState: "NUMERICALLY_VALIDATED",
    engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW",
    conformanceState: EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
    warnings,
    provenance: {
      combinationId: input.combinationId,
      fctEffProvenanceRef: input.fctEffProvenanceRef,
      sigmaSProvenanceRef: input.sigmaSProvenanceRef,
      sigmaSLimitState: input.sigmaSLimitState,
      wMaxRequirementId: input.wMaxRequirementId,
      geometryProvenanceRef: input.geometry.provenanceRef,
      concreteProvenanceRef: input.concrete.provenance?.sourceEvidence ?? null,
      reinforcementProvenanceRef: input.reinforcement.provenance?.sourceEvidence ?? null,
    },
    resultFingerprint: null,
  };
}

export function euC7CrackInputFingerprint(input: EuC7CrackWidthInput): string {
  return formulaFingerprint({
    ruleId: EU_C7_R2_CRACK_WIDTH_METHOD_ID,
    operations: ["c7-r2-crack-width"],
    parameterIds: [
      input.profileVersion,
      input.combinationId ?? "",
      input.combinationCategory ?? "",
      input.combinationLimitState ?? "",
      String(input.nServiceN),
      String(input.mServiceNmm),
      input.geometry.geometryVersion,
      input.geometry.shape,
      String(input.fctEffMPa),
      input.fctEffProvenanceRef ?? "",
      String(input.concrete.elasticModulus?.value ?? null),
      String(input.reinforcement.elasticModulus?.value ?? null),
      String(input.sigmaSMpa),
      input.sigmaSLimitState ?? "",
      input.sigmaSProvenanceRef ?? "",
      String(input.coverMm),
      String(input.phiMm),
      String(input.asMm2),
      String(input.widthMm),
      String(input.hMm),
      String(input.dMm),
      String(input.xMm),
      String(input.thicknessMm),
      input.surface ?? "",
      input.strainCase ?? "",
      String(input.k2Intermediate),
      input.duration ?? "",
      String(input.wMaxMm),
      input.wMaxRequirementId ?? "",
      EU_C7_R2_IMPLEMENTATION_VERSION,
    ],
  });
}

export function assertEuC7CrackResultCurrent(result: EuC7CrackWidthResult, input: EuC7CrackWidthInput): void {
  if (STALE_EU_C7_R2_RESULT_REUSE_ALLOWED) throw new Error("stale C7 crack result reuse is forbidden");
  if (result.resultFingerprint !== euC7CrackInputFingerprint(input) || result.profileVersion !== input.profileVersion) {
    throw new Error("stale C7 crack result");
  }
}

export function assertEuC7CrackOptimizerRejectsUndetermined(state: EuC7CheckState): void {
  if (EU_C7_R2_OPTIMIZATION_ACCEPTS_UNDETERMINED) throw new Error("optimization must reject an undetermined crack check");
  if (state === "UNDETERMINED") throw new Error("optimization rejected an undetermined crack check");
}

export function assertEuC7CrackParetoRejectsUndetermined(state: EuC7CheckState): void {
  if (EU_C7_R2_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE) throw new Error("Pareto must reject an undetermined crack check");
  if (state === "UNDETERMINED") throw new Error("Pareto rejected an undetermined crack check");
}

export function selectEuC7CrackLimit(): never {
  throw new Error("crack width limit is a project requirement and is not selected here");
}

export function selectEuC7SigmaS(): never {
  throw new Error("cracked-section reinforcement stress is an explicit service input and is not selected here");
}

function authorityBlocked(): string | null {
  if (
    !AI_C7_ASSISTANCE_ADVISORY_ONLY
    || LLM_C7_NUMERICAL_AUTHORITY
    || AI_C7_RULE_PARAMETER_AUTHORITY
    || AI_C7_NDP_AUTHORITY
    || AI_C7_SERVICE_COMBINATION_AUTHORITY
    || AI_C7_SIGMA_S_AUTHORITY
    || AI_C7_CRACK_LIMIT_AUTHORITY
    || AI_C7_BOND_CLASS_AUTHORITY
    || AI_C7_CHECK_OVERRIDE_AUTHORITY
    || AI_C7_CONFORMANCE_AUTHORITY
    || AI_C7_ENGINEERING_APPROVAL
    || GENERATIVE_MODEL_CAN_BYPASS_EU_C7_CRACKING
    || EU_C7_R2_REINFORCEMENT_AUTODESIGN
    || EU_C7_R2_ULS_ACTIONS_ACCEPTED
    || EU_C7_R2_ULS_STEEL_STRESS_REUSED_AS_SLS
    || EU_C7_R2_FCTEFF_DEFAULTED
    || EU_C7_R2_SIGMA_S_DEFAULTED
    || EU_C7_R2_DURATION_DEFAULTED
    || EU_C7_R2_BOND_CLASS_DEFAULTED
    || EU_C7_R2_K2_DEFAULTED
    || EU_C7_R2_CRACK_LIMIT_DEFAULTED
    || EU_C7_R2_COVER_GUESSED
    || EU_C7_R2_STRAIN_FLOOR_HARDCODED
    || EU_C7_R2_MINIMUM_REINFORCEMENT_CHECK_IMPLEMENTED
    || EU_C7_R2_BAR_DIAMETER_LIMIT_CHECK_IMPLEMENTED
    || EU_C7_R2_BAR_SPACING_LIMIT_CHECK_IMPLEMENTED
    || EU_C7_R2_SERVICE_STRESS_LIMIT_CHECK_IMPLEMENTED
    || C7_R2_AUTOMATICALLY_SUPPLIES_C6_PHIEF
    || EU_C7_GENERAL_NONLINEAR_FEA_IMPLEMENTED
    || EU_CONCRETE_PACK_CERTIFIED
    || NEW_C7_CRACK_WIDTH_RUNTIME_METHOD_IMPLEMENTED
  ) {
    return "AUTHORITY_BOUNDARY";
  }
  return null;
}

function extremeElasticTensionMPa(geometry: RcSectionGeometryInput, axialN: number, momentNmm: number): number | null {
  const gross = computeGrossSectionProperties(geometry);
  const fiberY: number[] = [];
  for (const region of geometry.regions) {
    if (region.kind === "RECTANGLE" && region.originMm && region.depthMm !== undefined) {
      fiberY.push(region.originMm.yMm, region.originMm.yMm + region.depthMm);
    }
  }
  if (fiberY.length === 0 || !(gross.grossConcreteAreaMm2 > 0) || !(gross.IxMm4 > 0)) return null;
  const top = Math.max(...fiberY);
  const bottom = Math.min(...fiberY);
  const axial = axialN / gross.grossConcreteAreaMm2;
  const topStress = axial - (momentNmm * (top - gross.centroidYMm)) / gross.IxMm4;
  const bottomStress = axial - (momentNmm * (bottom - gross.centroidYMm)) / gross.IxMm4;
  return Math.max(topStress, bottomStress, 0);
}

export function evaluateEuC7CrackWidth(input: EuC7CrackWidthInput): EuC7CrackWidthResult {
  const blocked = authorityBlocked();
  if (blocked) return blank(input, blocked);
  if (input.nationalAnnexClaim) return blank(input, "FALSE_NATIONAL_PROFILE");
  if (input.profileId !== EU_C7_R1_REFERENCE_PROFILE_ID) return blank(input, "PROFILE_MISMATCH");
  if (input.generation !== EU_C7_R1_REFERENCE_PROFILE_GENERATION) return blank(input, "GENERATION_MISMATCH");
  if (input.profileVersion !== EU_C7_R1_PROFILE_VERSION) return blank(input, "STALE_PROFILE");
  if (input.stale) return blank(input, "STALE_PROFILE");
  if (input.sourceConflictUnresolved) return blank(input, "SOURCE_CONFLICT");
  if (input.prestressed) return blank(input, "PRESTRESS_OUT_OF_SCOPE");
  if (input.memberType !== "BEAM" && input.memberType !== "SOLID_SLAB") return blank(input, "UNSUPPORTED_MEMBER");
  if (input.geometry.shape !== "RECTANGULAR") return blank(input, "UNSUPPORTED_GEOMETRY");
  if (input.combinationCategory === null || input.combinationLimitState === null || input.combinationId === null || input.combinationId.length === 0) {
    return blank(input, "MISSING_SERVICE_COMBINATION");
  }
  if (input.combinationLimitState === "ULS" || input.combinationCategory === "uls") return blank(input, "ULS_COMBINATION_REJECTED");
  if (input.combinationCategory !== "quasi_permanent" || input.combinationLimitState !== "SLS") return blank(input, "UNSUPPORTED_COMBINATION");
  if (!positive(input.fctEffMPa) || input.fctEffProvenanceRef === null || input.fctEffProvenanceRef.length === 0) {
    return blank(input, input.fctEffMPa !== null && !Number.isFinite(input.fctEffMPa) ? "INVALID_NUMBER" : "MISSING_TENSILE_STRENGTH");
  }
  if (input.nServiceN !== null && !Number.isFinite(input.nServiceN)) return blank(input, "INVALID_NUMBER");
  if (input.mServiceNmm !== null && !Number.isFinite(input.mServiceNmm)) return blank(input, "INVALID_NUMBER");
  if (!finite(input.nServiceN) || !finite(input.mServiceNmm)) return blank(input, "MISSING_SERVICE_ACTIONS");

  const concrete = evaluateEuC1ConcreteCharProperties({ concrete: input.concrete });
  if (!concrete.ok) return blank(input, "MISSING_CONCRETE_MODULUS");
  const reinforcement = evaluateEuC1ReinforcementCharProperties({
    reinforcement: input.reinforcement,
    area: input.reinforcementArea,
    designation: input.reinforcement.designation,
  });
  if (!reinforcement.ok) return blank(input, "MISSING_REINFORCEMENT_MODULUS");
  const ecm = concrete.outputs.elasticModulusMPa;
  const es = reinforcement.outputs.elasticModulusMPa;
  if (!(ecm > 0) || !(es > 0)) return blank(input, "MISSING_CONCRETE_MODULUS");

  const tension = extremeElasticTensionMPa(input.geometry, input.nServiceN, input.mServiceNmm);
  if (tension === null || !Number.isFinite(tension)) return blank(input, "INVALID_GEOMETRY");
  const sectionCrackState: EuC7SectionCrackState = tension > input.fctEffMPa ? "CRACKED" : "UNCRACKED";

  if (!positive(input.wMaxMm) || input.wMaxRequirementId === null || input.wMaxRequirementId.length === 0) {
    const result = blank(input, input.wMaxMm !== null && !Number.isFinite(input.wMaxMm) ? "INVALID_NUMBER" : "MISSING_CRACK_LIMIT");
    result.sectionCrackState = sectionCrackState;
    result.extremeElasticTensionMPa = tension;
    result.ecmMPa = ecm;
    result.esMPa = es;
    return result;
  }

  if (sectionCrackState === "UNCRACKED") {
    const fingerprint = euC7CrackInputFingerprint(input);
    return {
      ...blank(input, null),
      calculationState: "COMPLETE",
      checkState: "SATISFIED",
      failReason: null,
      serviceCombinationType: "QUASI_PERMANENT",
      sectionCrackState,
      extremeElasticTensionMPa: tension,
      ecmMPa: ecm,
      esMPa: es,
      crackWidthMm: 0,
      crackLimitMm: input.wMaxMm,
      utilization: 0,
      governingRuleIds: ["EU_C7_R1_SECTION_CRACK_STATE", "EU_C7_R1_CRACK_LIMIT"],
      parameterVersions: EU_C7_R1_PARAMETERS.map((parameter) => EU_C7_R1_PROFILE_VERSION),
      geometryFingerprint: input.geometry.geometryVersion,
      reinforcementFingerprint: input.reinforcement.version,
      materialFingerprint: input.concrete.version,
      actionFingerprint: input.combinationId,
      profileFingerprint: EU_C7_R1_PROFILE_VERSION,
      warnings: ["UNCRACKED_CRACK_WIDTH_NOT_APPLICABLE"],
      resultFingerprint: fingerprint,
    };
  }

  if (input.sigmaSLimitState === "ULS") return blank(input, "ULS_STEEL_STRESS");
  if (input.sigmaSMpa !== null && !Number.isFinite(input.sigmaSMpa)) return blank(input, "INVALID_NUMBER");
  if (!positive(input.sigmaSMpa) || input.sigmaSLimitState !== "SLS" || input.sigmaSProvenanceRef === null || input.sigmaSProvenanceRef.length === 0) {
    return blank(input, "MISSING_STEEL_STRESS");
  }
  if (input.surface === null) return blank(input, "MISSING_SURFACE_CLASS");
  if (input.duration === null) return blank(input, "MISSING_DURATION");
  if (input.strainCase === null) return blank(input, "MISSING_STRAIN_CASE");
  if (input.coverMm !== null && !Number.isFinite(input.coverMm)) return blank(input, "INVALID_NUMBER");
  if (input.phiMm !== null && !Number.isFinite(input.phiMm)) return blank(input, "INVALID_NUMBER");
  if (input.asMm2 !== null && !Number.isFinite(input.asMm2)) return blank(input, "INVALID_NUMBER");
  if (!positive(input.coverMm)) return blank(input, "MISSING_COVER");
  if (!positive(input.phiMm)) return blank(input, "MISSING_BAR_DIAMETER");
  if (!positive(input.asMm2)) return blank(input, "MISSING_REINFORCEMENT");
  if (!positive(input.widthMm)) return blank(input, "MISSING_SECTION");

  let height: number;
  try {
    const coverFactor = profileNumber("effectiveHeightCoverFactor");
    const axisDivisor = profileNumber("effectiveHeightAxisDivisor");
    if (input.strainCase === "BENDING" || input.strainCase === "INTERMEDIATE") {
      if (!positive(input.hMm) || !positive(input.dMm) || !positive(input.xMm) || input.dMm >= input.hMm || input.xMm >= input.hMm) {
        return blank(input, "INVALID_SECTION");
      }
      height = Math.min(coverFactor * (input.hMm - input.dMm), (input.hMm - input.xMm) / axisDivisor, half(input.hMm));
    } else {
      if (!positive(input.thicknessMm)) return blank(input, "MISSING_SECTION");
      height = Math.min(coverFactor * (input.coverMm + half(input.phiMm)), half(input.thicknessMm));
    }
  } catch (error) {
    return blank(input, error instanceof Error && error.message.startsWith("MISSING_PROFILE_PARAMETER") ? "MISSING_PROFILE_PARAMETER" : "INVALID_NUMBER");
  }
  if (!(height > 0)) return blank(input, "INVALID_GEOMETRY");

  const k2Bending = profileNumber("k2Bending");
  const k2Tension = profileNumber("k2Tension");
  let k2: number;
  if (input.strainCase === "BENDING") k2 = k2Bending;
  else if (input.strainCase === "PURE_TENSION") k2 = k2Tension;
  else if (input.k2Intermediate !== null && input.k2Intermediate > k2Bending && input.k2Intermediate < k2Tension) k2 = input.k2Intermediate;
  else return blank(input, "INTERMEDIATE_K2_MISSING");

  const area = input.widthMm * height;
  const rho = input.asMm2 / area;
  if (!(rho > 0)) return blank(input, "INVALID_REINFORCEMENT");
  const alpha = es / ecm;
  const kt = input.duration === "SHORT_TERM" ? profileNumber("ktShort") : profileNumber("ktLong");
  const k1 = input.surface === "HIGH_BOND" ? profileNumber("k1HighBond") : profileNumber("k1Plain");
  const floorFactor = profileNumber("strainFloorFactor");
  const coverCoefficient = profileNumber("coverCoefficient");
  const barCoefficient = profileNumber("barCoefficient");
  const stiffened = (input.sigmaSMpa - kt * (input.fctEffMPa / rho) * (unity() + alpha * rho)) / es;
  const floorStrain = (floorFactor * input.sigmaSMpa) / es;
  const meanStrain = Math.max(stiffened, floorStrain);
  const spacing = coverCoefficient * input.coverMm + (k1 * k2 * barCoefficient * input.phiMm) / rho;
  const width = spacing * meanStrain;
  if (![meanStrain, spacing, width].every((value) => Number.isFinite(value)) || !(spacing > 0) || !(width >= 0)) {
    return blank(input, "INVALID_NUMBER");
  }
  const utilization = width / input.wMaxMm;
  const fingerprint = euC7CrackInputFingerprint(input);
  return {
    ...blank(input, null),
    calculationState: "COMPLETE",
    checkState: width <= input.wMaxMm ? "SATISFIED" : "NOT_SATISFIED",
    failReason: null,
    serviceCombinationType: "QUASI_PERMANENT",
    sectionCrackState,
    extremeElasticTensionMPa: tension,
    ecmMPa: ecm,
    esMPa: es,
    sigmaSMpa: input.sigmaSMpa,
    effectiveTensionHeightMm: height,
    effectiveTensionAreaMm2: area,
    effectiveReinforcementRatio: rho,
    modularRatio: alpha,
    tensionStiffeningFactor: kt,
    meanStrainDifference: meanStrain,
    maximumCrackSpacingMm: spacing,
    crackWidthMm: width,
    crackLimitMm: input.wMaxMm,
    utilization,
    governingRuleIds: EU_C7_R1_CRACK_WIDTH_REQUIRED_RULE_IDS,
    parameterVersions: EU_C7_R1_PARAMETERS.map((parameter) => EU_C7_R1_PROFILE_VERSION),
    geometryFingerprint: input.geometry.geometryVersion,
    reinforcementFingerprint: input.reinforcement.version,
    materialFingerprint: input.concrete.version,
    actionFingerprint: input.combinationId,
    profileFingerprint: EU_C7_R1_PROFILE_VERSION,
    warnings: [],
    resultFingerprint: fingerprint,
  };
}
