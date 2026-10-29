import type { ConcreteMaterial, EngineeringRuleAuthorityType } from "@rtb/types";
import {
  AI_C7_ASSISTANCE_ADVISORY_ONLY,
  AI_C7_CHECK_OVERRIDE_AUTHORITY,
  AI_C7_CONFORMANCE_AUTHORITY,
  AI_C7_CREEP_VALUE_AUTHORITY,
  AI_C7_ENGINEERING_APPROVAL,
  AI_C7_ENVIRONMENTAL_INPUT_AUTHORITY,
  AI_C7_PHIEF_TRANSFORMATION_AUTHORITY,
  AI_C7_RULE_PARAMETER_AUTHORITY,
  AI_C7_SHRINKAGE_VALUE_AUTHORITY,
  AI_C7_TIME_CONTEXT_AUTHORITY,
  C6_EXISTING_EXPLICIT_PHIEF_PATH_PRESERVED,
  C7_R3_AUTOMATICALLY_RECOMPUTES_R2_CRACK_WIDTH,
  C7_R3_AUTOMATICALLY_REPLACES_C6_PHIEF,
  CONCRETE_MATERIAL_MODEL,
  CONCRETE_TIME_DEPENDENT_BEHAVIOR_FRAMEWORK,
  DEFAULT_CREEP_MODEL,
  DEFAULT_SHRINKAGE_MODEL,
  EU_C7_R1_PROFILE_VERSION,
  EU_C7_R1_REFERENCE_PROFILE_GENERATION,
  EU_C7_R1_REFERENCE_PROFILE_ID,
  EU_C7_R3_BAR_DIAMETER_LIMIT_IMPLEMENTED,
  EU_C7_R3_BAR_SPACING_LIMIT_IMPLEMENTED,
  EU_C7_R3_CALCULATED_CREEP_IMPLEMENTED,
  EU_C7_R3_CALCULATED_SHRINKAGE_IMPLEMENTED,
  EU_C7_R3_CANONICAL_STRAIN_UNIT,
  EU_C7_R3_CREEP_CALCULATED_FROM_ENVIRONMENT,
  EU_C7_R3_CREEP_DEFAULTED,
  EU_C7_R3_CURVATURE_DEFLECTION_IMPLEMENTED,
  EU_C7_R3_ENVIRONMENTAL_CREEP_MODEL_IMPLEMENTED,
  EU_C7_R3_ENVIRONMENTAL_SHRINKAGE_MODEL_IMPLEMENTED,
  EU_C7_R3_IMMEDIATE_DEFLECTION_IMPLEMENTED,
  EU_C7_R3_IMPLEMENTATION_VERSION,
  EU_C7_R3_LONG_TERM_DEFLECTION_IMPLEMENTED,
  EU_C7_R3_LONG_TERM_METHOD_ID,
  EU_C7_R3_MINIMUM_CRACK_REINFORCEMENT_IMPLEMENTED,
  EU_C7_R3_OPTIMIZATION_ACCEPTS_UNGOVERNED_LONG_TERM_STATE,
  EU_C7_R3_PHI_EQUALS_C6_PHIEF_AUTOMATICALLY,
  EU_C7_R3_PHI_TO_PHIEF_TRANSFORMATION_IMPLEMENTED,
  EU_C7_R3_SERVICE_STRESS_LIMIT_IMPLEMENTED,
  EU_C7_R3_SHRINKAGE_CALCULATED_FROM_ENVIRONMENT,
  EU_C7_R3_SHRINKAGE_DEFAULTED,
  EU_C7_R3_SHRINKAGE_SIGN_CONVENTION,
  EU_C7_R3_TIME_CONTEXT_GUESSED,
  EU_CONCRETE_PACK_CERTIFIED,
  GENERATIVE_MODEL_CAN_INVENT_CREEP_VALUE,
  GENERATIVE_MODEL_CAN_INVENT_SHRINKAGE_VALUE,
  LLM_C7_NUMERICAL_AUTHORITY,
  NEW_C7_CREEP_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C7_SHRINKAGE_RUNTIME_METHOD_IMPLEMENTED,
  SI_MICROSTRAIN_PER_UNIT_STRAIN,
  STALE_EU_C7_R3_RESULT_REUSE_ALLOWED,
  type EU_C7_R3_SUPPORTED_LONG_TERM_STATES,
} from "@rtb/types";
import { assertConcreteEngineeringRuleAuthority } from "../authority";
import { formulaFingerprint } from "../eu-c1b/fingerprint";
import { EU_CONCRETE_TIME_DEPENDENT_INTERFACE } from "../eu-standard/profiles";

export type EuC7LongTermPresence = (typeof EU_C7_R3_SUPPORTED_LONG_TERM_STATES)[number];
export type EuC7ShrinkageUnit = "STRAIN" | "MICROSTRAIN";
export type EuC7ShrinkageSignRepresentation = "SHRINKAGE_MAGNITUDE_POSITIVE" | "SHORTENING_NEGATIVE";

export type EuC7LongTermInput = {
  profileId: string;
  generation: string;
  profileVersion: string;
  stale: boolean;
  presence: EuC7LongTermPresence;
  concrete: ConcreteMaterial;
  materialRef: string;
  sectionId: string | null;
  timeContextId: string | null;
  referenceTime: string | null;
  loadingAgeDays: number | null;
  evaluationAgeDays: number | null;
  expectedTimeContextId: string | null;
  authority: EngineeringRuleAuthorityType | null;
  phi: number | null;
  phiProvenanceRef: string | null;
  phiApplicabilityRef: string | null;
  shrinkageValue: number | null;
  shrinkageUnit: EuC7ShrinkageUnit | null;
  shrinkageSignRepresentation: EuC7ShrinkageSignRepresentation | null;
  shrinkageProvenanceRef: string | null;
  shrinkageApplicabilityRef: string | null;
  calculateCreep: boolean;
  calculateShrinkage: boolean;
};

export type EuC7LongTermResult = {
  accepted: boolean;
  failReason: string | null;
  methodId: typeof EU_C7_R3_LONG_TERM_METHOD_ID;
  implementationVersion: typeof EU_C7_R3_IMPLEMENTATION_VERSION;
  profileId: string;
  profileVersion: string;
  presence: EuC7LongTermPresence;
  creepCoefficient: number | null;
  creepUnit: "1";
  creepSource: string | null;
  creepApplicability: string | null;
  shrinkageStrain: number | null;
  shrinkageInputValue: number | null;
  shrinkageInputUnit: EuC7ShrinkageUnit | null;
  shrinkageUnit: typeof EU_C7_R3_CANONICAL_STRAIN_UNIT;
  shrinkageSource: string | null;
  shrinkageApplicability: string | null;
  shrinkageSignConvention: typeof EU_C7_R3_SHRINKAGE_SIGN_CONVENTION;
  timeContextId: string | null;
  referenceTime: string | null;
  loadingAgeDays: number | null;
  evaluationAgeDays: number | null;
  materialRef: string | null;
  sectionId: string | null;
  authority: EngineeringRuleAuthorityType | null;
  validationState: "NUMERICALLY_VALIDATED" | "UNDETERMINED";
  engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW";
  conformanceState: "INTENDED_PROFILE";
  calculatedModel: false;
  phiEqualsPhiEf: false;
  warnings: readonly string[];
  provenance: {
    phiProvenanceRef: string | null;
    shrinkageProvenanceRef: string | null;
    materialProvenanceRef: string;
  };
  resultFingerprint: string;
};

export const EU_C7_R3_PHIEF_TRANSFORMATION_EXTENSION_POINT = {
  defined: true,
  implemented: EU_C7_R3_PHI_TO_PHIEF_TRANSFORMATION_IMPLEMENTED,
  formula: null,
  note: "A later governed transformation may bind here. This phase copies nothing into phiEf.",
} as const;

function text(value: string | null): boolean {
  return value !== null && value.length > 0;
}

function finite(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

function ageOk(value: number | null): boolean {
  return value === null || (Number.isFinite(value) && value >= 0);
}

function blank(input: EuC7LongTermInput, failReason: string): EuC7LongTermResult {
  return {
    accepted: false,
    failReason,
    methodId: EU_C7_R3_LONG_TERM_METHOD_ID,
    implementationVersion: EU_C7_R3_IMPLEMENTATION_VERSION,
    profileId: input.profileId,
    profileVersion: input.profileVersion,
    presence: input.presence,
    creepCoefficient: null,
    creepUnit: "1",
    creepSource: null,
    creepApplicability: null,
    shrinkageStrain: null,
    shrinkageInputValue: input.shrinkageValue,
    shrinkageInputUnit: input.shrinkageUnit,
    shrinkageUnit: EU_C7_R3_CANONICAL_STRAIN_UNIT,
    shrinkageSource: null,
    shrinkageApplicability: null,
    shrinkageSignConvention: EU_C7_R3_SHRINKAGE_SIGN_CONVENTION,
    timeContextId: input.timeContextId,
    referenceTime: input.referenceTime,
    loadingAgeDays: input.loadingAgeDays,
    evaluationAgeDays: input.evaluationAgeDays,
    materialRef: input.materialRef,
    sectionId: input.sectionId,
    authority: input.authority,
    validationState: "UNDETERMINED",
    engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW",
    conformanceState: "INTENDED_PROFILE",
    calculatedModel: false,
    phiEqualsPhiEf: false,
    warnings: ["LONG_TERM_STATE_UNDETERMINED"],
    provenance: {
      phiProvenanceRef: input.phiProvenanceRef,
      shrinkageProvenanceRef: input.shrinkageProvenanceRef,
      materialProvenanceRef: input.concrete.provenance.sourceEvidence ?? "",
    },
    resultFingerprint: fingerprint(input, null, null),
  };
}

function fingerprint(input: EuC7LongTermInput, phi: number | null, strain: number | null): string {
  return formulaFingerprint({
    ruleId: EU_C7_R3_LONG_TERM_METHOD_ID,
    operations: ["explicit_phi", "explicit_shrinkage_magnitude", "no_environmental_model", "no_phi_ef_substitution"],
    parameterIds: [
      EU_C7_R3_IMPLEMENTATION_VERSION,
      input.profileId,
      input.profileVersion,
      input.presence,
      input.materialRef,
      input.sectionId ?? "",
      input.timeContextId ?? "",
      input.referenceTime ?? "",
      String(input.loadingAgeDays),
      String(input.evaluationAgeDays),
      input.authority ?? "",
      String(phi),
      input.phiProvenanceRef ?? "",
      input.phiApplicabilityRef ?? "",
      String(strain),
      EU_C7_R3_CANONICAL_STRAIN_UNIT,
      EU_C7_R3_SHRINKAGE_SIGN_CONVENTION,
      input.shrinkageProvenanceRef ?? "",
      input.shrinkageApplicabilityRef ?? "",
    ],
  });
}

function normalizedShrinkage(value: number, unit: EuC7ShrinkageUnit): number {
  if (unit === "STRAIN") return value;
  return value / SI_MICROSTRAIN_PER_UNIT_STRAIN;
}

function authorityBlocked(): string | null {
  if (
    !CONCRETE_TIME_DEPENDENT_BEHAVIOR_FRAMEWORK
    || !CONCRETE_MATERIAL_MODEL
    || DEFAULT_CREEP_MODEL
    || DEFAULT_SHRINKAGE_MODEL
    || EU_CONCRETE_TIME_DEPENDENT_INTERFACE.creepModelId !== null
    || EU_CONCRETE_TIME_DEPENDENT_INTERFACE.shrinkageModelId !== null
    || EU_CONCRETE_TIME_DEPENDENT_INTERFACE.defaultCreepModel
    || EU_CONCRETE_TIME_DEPENDENT_INTERFACE.defaultShrinkageModel
    || !AI_C7_ASSISTANCE_ADVISORY_ONLY
    || LLM_C7_NUMERICAL_AUTHORITY
    || AI_C7_RULE_PARAMETER_AUTHORITY
    || AI_C7_CREEP_VALUE_AUTHORITY
    || AI_C7_SHRINKAGE_VALUE_AUTHORITY
    || AI_C7_TIME_CONTEXT_AUTHORITY
    || AI_C7_ENVIRONMENTAL_INPUT_AUTHORITY
    || AI_C7_PHIEF_TRANSFORMATION_AUTHORITY
    || AI_C7_CHECK_OVERRIDE_AUTHORITY
    || AI_C7_CONFORMANCE_AUTHORITY
    || AI_C7_ENGINEERING_APPROVAL
    || GENERATIVE_MODEL_CAN_INVENT_CREEP_VALUE
    || GENERATIVE_MODEL_CAN_INVENT_SHRINKAGE_VALUE
    || EU_C7_R3_CREEP_DEFAULTED
    || EU_C7_R3_SHRINKAGE_DEFAULTED
    || EU_C7_R3_CREEP_CALCULATED_FROM_ENVIRONMENT
    || EU_C7_R3_SHRINKAGE_CALCULATED_FROM_ENVIRONMENT
    || EU_C7_R3_CALCULATED_CREEP_IMPLEMENTED
    || EU_C7_R3_CALCULATED_SHRINKAGE_IMPLEMENTED
    || EU_C7_R3_ENVIRONMENTAL_CREEP_MODEL_IMPLEMENTED
    || EU_C7_R3_ENVIRONMENTAL_SHRINKAGE_MODEL_IMPLEMENTED
    || EU_C7_R3_TIME_CONTEXT_GUESSED
    || EU_C7_R3_PHI_EQUALS_C6_PHIEF_AUTOMATICALLY
    || EU_C7_R3_PHI_TO_PHIEF_TRANSFORMATION_IMPLEMENTED
    || C7_R3_AUTOMATICALLY_REPLACES_C6_PHIEF
    || C7_R3_AUTOMATICALLY_RECOMPUTES_R2_CRACK_WIDTH
    || !C6_EXISTING_EXPLICIT_PHIEF_PATH_PRESERVED
    || EU_C7_R3_IMMEDIATE_DEFLECTION_IMPLEMENTED
    || EU_C7_R3_LONG_TERM_DEFLECTION_IMPLEMENTED
    || EU_C7_R3_CURVATURE_DEFLECTION_IMPLEMENTED
    || EU_C7_R3_MINIMUM_CRACK_REINFORCEMENT_IMPLEMENTED
    || EU_C7_R3_BAR_DIAMETER_LIMIT_IMPLEMENTED
    || EU_C7_R3_BAR_SPACING_LIMIT_IMPLEMENTED
    || EU_C7_R3_SERVICE_STRESS_LIMIT_IMPLEMENTED
    || EU_CONCRETE_PACK_CERTIFIED
    || NEW_C7_CREEP_RUNTIME_METHOD_IMPLEMENTED
    || NEW_C7_SHRINKAGE_RUNTIME_METHOD_IMPLEMENTED
  ) {
    return "AUTHORITY_BOUNDARY";
  }
  return null;
}

export function evaluateEuC7LongTermState(input: EuC7LongTermInput): EuC7LongTermResult {
  const blocked = authorityBlocked();
  if (blocked) return blank(input, blocked);
  if (input.profileId !== EU_C7_R1_REFERENCE_PROFILE_ID) return blank(input, "PROFILE_MISMATCH");
  if (input.generation !== EU_C7_R1_REFERENCE_PROFILE_GENERATION) return blank(input, "GENERATION_MISMATCH");
  if (input.profileVersion !== EU_C7_R1_PROFILE_VERSION) return blank(input, "PROFILE_MISMATCH");
  if (input.stale) return blank(input, "STALE_PROFILE");
  if (input.calculateCreep) return blank(input, "CALCULATED_CREEP_NOT_BOUND");
  if (input.calculateShrinkage) return blank(input, "CALCULATED_SHRINKAGE_NOT_BOUND");
  if (!text(input.materialRef) || input.materialRef !== input.concrete.materialRef) return blank(input, "MATERIAL_MISMATCH");
  if (!text(input.timeContextId) || !text(input.referenceTime)) return blank(input, "MISSING_TIME_CONTEXT");
  if (!ageOk(input.loadingAgeDays) || !ageOk(input.evaluationAgeDays)) return blank(input, "INVALID_TIME_CONTEXT");
  if (input.expectedTimeContextId !== null && input.expectedTimeContextId !== input.timeContextId) {
    return blank(input, "TIME_CONTEXT_MISMATCH");
  }
  if (input.authority === null) return blank(input, "AUTHORITY_REJECTED");
  try {
    assertConcreteEngineeringRuleAuthority(input.authority);
  } catch {
    return blank(input, "AUTHORITY_REJECTED");
  }

  const wantsCreep = input.presence === "CREEP_ONLY" || input.presence === "CREEP_AND_SHRINKAGE";
  const wantsShrinkage = input.presence === "SHRINKAGE_ONLY" || input.presence === "CREEP_AND_SHRINKAGE";
  if (wantsCreep && input.shrinkageValue !== null && input.presence === "CREEP_ONLY") return blank(input, "LONG_TERM_STATE_MISMATCH");
  if (wantsShrinkage && input.phi !== null && input.presence === "SHRINKAGE_ONLY") return blank(input, "LONG_TERM_STATE_MISMATCH");

  let phi: number | null = null;
  if (wantsCreep) {
    if (input.phi !== null && !Number.isFinite(input.phi)) return blank(input, "INVALID_NUMBER");
    if (input.phi !== null && input.phi < 0) return blank(input, "NEGATIVE_CREEP");
    if (!finite(input.phi)) return blank(input, "MISSING_CREEP");
    if (!text(input.phiProvenanceRef)) return blank(input, "MISSING_CREEP_PROVENANCE");
    if (!text(input.phiApplicabilityRef)) return blank(input, "MISSING_CREEP_PROVENANCE");
    phi = input.phi;
  }

  let strain: number | null = null;
  if (wantsShrinkage) {
    if (input.shrinkageValue !== null && !Number.isFinite(input.shrinkageValue)) return blank(input, "INVALID_NUMBER");
    if (input.shrinkageSignRepresentation !== EU_C7_R3_SHRINKAGE_SIGN_CONVENTION) return blank(input, "INVALID_SHRINKAGE_SIGN");
    if (input.shrinkageValue !== null && input.shrinkageValue < 0) return blank(input, "INVALID_SHRINKAGE_SIGN");
    if (!finite(input.shrinkageValue)) return blank(input, "MISSING_SHRINKAGE");
    if (input.shrinkageUnit !== "STRAIN" && input.shrinkageUnit !== "MICROSTRAIN") return blank(input, "INVALID_SHRINKAGE_UNIT");
    if (!text(input.shrinkageProvenanceRef)) return blank(input, "MISSING_SHRINKAGE_PROVENANCE");
    if (!text(input.shrinkageApplicabilityRef)) return blank(input, "MISSING_SHRINKAGE_PROVENANCE");
    strain = normalizedShrinkage(input.shrinkageValue, input.shrinkageUnit);
  }

  return {
    accepted: true,
    failReason: null,
    methodId: EU_C7_R3_LONG_TERM_METHOD_ID,
    implementationVersion: EU_C7_R3_IMPLEMENTATION_VERSION,
    profileId: input.profileId,
    profileVersion: input.profileVersion,
    presence: input.presence,
    creepCoefficient: phi,
    creepUnit: "1",
    creepSource: input.phiProvenanceRef,
    creepApplicability: input.phiApplicabilityRef,
    shrinkageStrain: strain,
    shrinkageInputValue: wantsShrinkage ? input.shrinkageValue : null,
    shrinkageInputUnit: wantsShrinkage ? input.shrinkageUnit : null,
    shrinkageUnit: EU_C7_R3_CANONICAL_STRAIN_UNIT,
    shrinkageSource: wantsShrinkage ? input.shrinkageProvenanceRef : null,
    shrinkageApplicability: wantsShrinkage ? input.shrinkageApplicabilityRef : null,
    shrinkageSignConvention: EU_C7_R3_SHRINKAGE_SIGN_CONVENTION,
    timeContextId: input.timeContextId,
    referenceTime: input.referenceTime,
    loadingAgeDays: input.loadingAgeDays,
    evaluationAgeDays: input.evaluationAgeDays,
    materialRef: input.materialRef,
    sectionId: input.sectionId,
    authority: input.authority,
    validationState: "NUMERICALLY_VALIDATED",
    engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW",
    conformanceState: "INTENDED_PROFILE",
    calculatedModel: false,
    phiEqualsPhiEf: false,
    warnings: ["EXPLICIT_INPUT_NOT_ENVIRONMENTAL_PREDICTION", "PHI_IS_NOT_C6_PHIEF"],
    provenance: {
      phiProvenanceRef: wantsCreep ? input.phiProvenanceRef : null,
      shrinkageProvenanceRef: wantsShrinkage ? input.shrinkageProvenanceRef : null,
      materialProvenanceRef: input.concrete.provenance.sourceEvidence ?? "",
    },
    resultFingerprint: fingerprint(input, phi, strain),
  };
}

export function euC7LongTermInputFingerprint(input: EuC7LongTermInput): string {
  const state = evaluateEuC7LongTermState(input);
  return state.resultFingerprint;
}

export function assertEuC7LongTermResultCurrent(result: EuC7LongTermResult, input: EuC7LongTermInput): void {
  if (STALE_EU_C7_R3_RESULT_REUSE_ALLOWED) throw new Error("stale C7 long-term result reuse is forbidden");
  const current = evaluateEuC7LongTermState(input);
  if (current.resultFingerprint !== result.resultFingerprint || current.profileVersion !== result.profileVersion) {
    throw new Error("stale C7 long-term result");
  }
}

export function assertEuC7LongTermOptimizerRejectsUngoverned(state: "GOVERNED" | "UNDETERMINED"): void {
  if (EU_C7_R3_OPTIMIZATION_ACCEPTS_UNGOVERNED_LONG_TERM_STATE) {
    throw new Error("optimization must reject an ungoverned long-term state");
  }
  if (state !== "GOVERNED") throw new Error("optimization must reject an ungoverned long-term state");
}

export type EuC7C6CreepHandoff = {
  accepted: boolean;
  code: string;
  phiEfCandidate: number | null;
  replacesStoredPhiEf: false;
  transformationApplied: false;
};

export function prepareEuC7C6CreepHandoff(
  result: EuC7LongTermResult,
  binding: { explicitPhiAsPhiEf: boolean },
): EuC7C6CreepHandoff {
  const refused = { replacesStoredPhiEf: false as const, transformationApplied: false as const, phiEfCandidate: null };
  if (!result.accepted || result.creepCoefficient === null) return { accepted: false, code: "UNGOVERNED_LONG_TERM_STATE", ...refused };
  if (!binding.explicitPhiAsPhiEf) return { accepted: false, code: "UNSUPPORTED_CONSUMER_BINDING", ...refused };
  return {
    accepted: true,
    code: "EXPLICIT_COPY_NOT_TRANSFORMATION",
    phiEfCandidate: result.creepCoefficient,
    replacesStoredPhiEf: false,
    transformationApplied: false,
  };
}

export type EuC7R2DurationContext = {
  accepted: boolean;
  code: string;
  durationClass: "LONG_TERM" | null;
  recomputesCrackWidth: false;
};

export function prepareEuC7R2DurationContext(
  result: EuC7LongTermResult,
  request: { explicitRequest: boolean },
): EuC7R2DurationContext {
  if (!request.explicitRequest) {
    return { accepted: false, code: "RECOMPUTATION_NOT_REQUESTED", durationClass: null, recomputesCrackWidth: false };
  }
  if (!result.accepted) {
    return { accepted: false, code: "UNGOVERNED_LONG_TERM_STATE", durationClass: null, recomputesCrackWidth: false };
  }
  return { accepted: true, code: "DURATION_CONTEXT_ONLY", durationClass: "LONG_TERM", recomputesCrackWidth: false };
}

export type EuC7R4DeflectionInputs = {
  accepted: boolean;
  code: string;
  phi: number | null;
  epsilonCs: number | null;
  deflectionCalculated: false;
};

export function prepareEuC7R4DeflectionInputs(result: EuC7LongTermResult): EuC7R4DeflectionInputs {
  if (!result.accepted) {
    return { accepted: false, code: "UNGOVERNED_LONG_TERM_STATE", phi: null, epsilonCs: null, deflectionCalculated: false };
  }
  return {
    accepted: true,
    code: "INPUTS_AVAILABLE",
    phi: result.creepCoefficient,
    epsilonCs: result.shrinkageStrain,
    deflectionCalculated: false,
  };
}

export function selectEuC7Creep(): never {
  throw new Error("creep coefficient must be an explicit governed input");
}

export function selectEuC7Shrinkage(): never {
  throw new Error("shrinkage strain must be an explicit governed input");
}

export function selectEuC7TimeContext(): never {
  throw new Error("time context must be an explicit governed input");
}

export function selectEuC7PhiEfTransformation(): never {
  throw new Error("phi to phiEf transformation is not governed");
}
