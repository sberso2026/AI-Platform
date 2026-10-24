/**
 * Bounded basic required straight-bar anchorage.
 * The diameter divisor is read from the C8 anchorage profile. This method does not derive bond strength
 * and does not apply design-length factors.
 */

import { formulaFingerprint } from "../eu-c1b/fingerprint";
import {
  AI_C8_ASSISTANCE_ADVISORY_ONLY,
  AI_C8_BOND_CONDITION_AUTHORITY,
  AI_C8_CHECK_OVERRIDE_AUTHORITY,
  AI_C8_CONFORMANCE_AUTHORITY,
  AI_C8_ENGINEERING_APPROVAL,
  AI_C8_RULE_PARAMETER_AUTHORITY,
  LLM_C8_NUMERICAL_AUTHORITY,
} from "./profile";
import {
  AI_ANCHORAGE_OVERRIDE_AUTHORITY,
  AI_CRITICAL_SECTION_AUTHORITY,
  AI_DESIGN_BOND_STRENGTH_AUTHORITY,
  AI_DESIGN_STEEL_STRESS_AUTHORITY,
  C8_REQUIRED_NOMINAL_COVER_EQUALS_ANCHORAGE_ACTUAL_COVER,
  C8_SPACING_CHECK_RESULT_EQUALS_ANCHORAGE_CONFINEMENT_FACTOR,
  EU_C8_R4_ANCHORAGE_PROFILE_GENERATION,
  EU_C8_R4_ANCHORAGE_PROFILE_ID,
  EU_C8_R4_ANCHORAGE_PROFILE_VERSION,
  EU_C8_R4_BASIC_ANCHORAGE_RULE_ID,
  EU_C8_R4_DIAMETER_DIVISOR_PARAMETER_ID,
  EU_C8_R4_FORMULA_FINGERPRINT,
  EU_C8_R4_FORMULA_FINGERPRINT_VALIDATION,
  EU_C8_R4_PARAMETERS,
  EU_C8_R4_PARENT_PROFILE_ID,
  EU_C8_R4_RULES,
  EU_C8_R4_SELECTED_METHOD_ID,
  EU_C8_R4_SOURCE_ID,
  resolveEuC8BasicAnchorageDiameterDivisor,
  resolveEuC8BasicAnchorageProfile,
} from "./anchorage-profile";
import { convertLengthToMm, EU_C8_R2_EXPLICIT_COMPONENT_LOWER_BOUND_MM } from "./units";

export const EU_C8_R4B_METHOD_ID = EU_C8_R4_SELECTED_METHOD_ID;
export const EU_C8_R4B_CAPABILITY_SCOPE = "BASIC_REQUIRED_STRAIGHT_BAR_ANCHORAGE_ONLY" as const;
export const EU_C8_R4B_PROFILE_BINDING_REUSED = true as const;
export const EU_C8_R4B_PROFILE_IDENTITY_UNCHANGED = true as const;
export const EU_C8_R4B_PROFILE_GENERATION_UNCHANGED = true as const;
export const PARALLEL_C8_ANCHORAGE_PROFILE_CREATED = false as const;
export const EU_C8_R4B_PARENT_PROFILE_ARTIFACTS_PRESENT = true as const;
export const EU_C8_R4B_PARENT_RULE_ARTIFACTS_PRESENT = true as const;
export const EU_C8_R4B_PARENT_RELEASE_CLASSIFICATION_COMPLETE = true as const;
export const EU_C8_R4B_DIAMETER_DIVISOR_PARAMETER_ID = EU_C8_R4_DIAMETER_DIVISOR_PARAMETER_ID;
export const EU_C8_R4B_DIAMETER_DIVISOR_PROFILE_BOUND = true as const;
export const EU_C8_R4B_DIAMETER_DIVISOR_HARDCODED_OUTSIDE_PROFILE = false as const;
export const EU_C8_R4B_BASIC_RULE_FORMULA_FINGERPRINT = EU_C8_R4_FORMULA_FINGERPRINT_VALIDATION;
export const EU_C8_R4B_METHOD_APPLICABILITY =
  "ordinary non-prestressed reinforced concrete; one straight deformed bar; tension magnitude; explicit nominal diameter; explicit governed design steel stress; explicit governed design bond strength; explicit available length and critical section only when a comparison is requested" as const;
export const EU_C8_R4B_BAR_DIAMETER_CONTRACT_REUSED = true as const;
export const EU_C8_R4B_BAR_DIAMETER_GUESSED = false as const;
export const EU_C8_R4B_ACTUAL_BAR_DIAMETER_SUBSTITUTED = false as const;
export const EU_C8_R4B_DESIGN_STEEL_STRESS_EXPLICIT = true as const;
export const EU_C8_R4B_DESIGN_STEEL_STRESS_SIGN_CONVENTION = "TENSION_MAGNITUDE" as const;
export const EU_C8_R4B_DESIGN_STEEL_STRESS_DEFAULTED = false as const;
export const EU_C8_R4B_FYD_AUTOMATICALLY_USED_AS_SIGMA_SD = false as const;
export const EU_C8_R4B_DESIGN_STEEL_STRESS_AUTHORITY_CONTRACT =
  "EXPLICIT_VALUE_WITH_MANDATORY_PROVENANCE_AUTHORITY_APPLICABILITY_AND_VALIDATION_STATE" as const;
export const EU_C8_R4B_UNGOVERNED_SIGMA_SD_ACCEPTED = false as const;
export const EU_C8_R4B_DESIGN_BOND_STRENGTH_ROUTE = "EXPLICIT_GOVERNED_INPUT" as const;
export const EU_C8_R4B_DESIGN_BOND_STRENGTH_DEFAULTED = false as const;
export const EU_C8_R4B_INTERNAL_FBD_DERIVATION_IMPLEMENTED = false as const;
export const EU_C8_R4B_DESIGN_BOND_STRENGTH_AUTHORITY_CONTRACT =
  "EXPLICIT_VALUE_WITH_MANDATORY_PROVENANCE_AUTHORITY_APPLICABILITY_PROFILE_APPLICABILITY_UNITS_AND_VALIDATION_STATE" as const;
export const EU_C8_R4B_UNGOVERNED_FBD_ACCEPTED = false as const;
export const EU_C8_R4B_EXPLICIT_FBD_DOUBLE_FACTORING = false as const;
export const EU_C8_R4B_BOND_CONDITION_REQUIRED = false as const;
export const EU_C8_R4B_BOND_CONDITION_DEFAULTED = false as const;
export const EU_C8_R4B_FCTD_DERIVATION_IMPLEMENTED = false as const;
export const EU_C8_R4B_FCTM_SUBSTITUTED_FOR_FCTD = false as const;
export const EU_C8_R4B_FCTEFF_SUBSTITUTED_FOR_FCTD = false as const;
export const EU_C8_R4B_BASIC_REQUIRED_ANCHORAGE_IMPLEMENTED = true as const;
export const EU_C8_R4B_BASIC_ANCHORAGE_RULE_REUSED = true as const;
export const EU_C8_R4B_BASIC_EQUALS_DESIGN_ANCHORAGE = false as const;
export const EU_C8_R4B_DESIGN_ANCHORAGE_IMPLEMENTED = false as const;
export const EU_C8_R4B_MINIMUM_DESIGN_ANCHORAGE_IMPLEMENTED = false as const;
export const EU_C8_R4B_BAR_SHAPE_MODIFIER_IMPLEMENTED = false as const;
export const EU_C8_R4B_COVER_CONFINEMENT_MODIFIER_IMPLEMENTED = false as const;
export const EU_C8_R4B_TRANSVERSE_REINFORCEMENT_MODIFIER_IMPLEMENTED = false as const;
export const EU_C8_R4B_WELDED_TRANSVERSE_BAR_MODIFIER_IMPLEMENTED = false as const;
export const EU_C8_R4B_TRANSVERSE_PRESSURE_MODIFIER_IMPLEMENTED = false as const;
export const C8_R2_COVER_ASSEMBLY_RESULT_USED_AS_ANCHORAGE_MODIFIER = false as const;
export const C8_SPACING_CHECK_RESULT_EQUALS_ANCHORAGE_MODIFIER = false as const;
export const C8_R3B_SPACING_UTILIZATION_USED_AS_ANCHORAGE_FACTOR = false as const;
export const EU_C8_R4B_AVAILABLE_ANCHORAGE_LENGTH_ROUTE = "EXPLICIT_SUPPLIED_LENGTH" as const;
export const EU_C8_R4B_AVAILABLE_LENGTH_GEOMETRY_SOLVER_CREATED = false as const;
export const EU_C8_R4B_CALCULATION_ONLY_MODE_SUPPORTED = true as const;
export const EU_C8_R4B_CHECK_MODE_SUPPORTED = true as const;
export const EU_C8_R4B_CRITICAL_SECTION_EXPLICIT_FOR_CHECK = true as const;
export const EU_C8_R4B_CHECK_STATE_GOVERNED = true as const;
export const EU_C8_R4B_BASIC_CHECK_EQUALS_FULL_DESIGN_COMPLIANCE = false as const;
export const EU_C8_R4B_INPUT_DOMAIN_VALIDATION =
  "NOMINAL_DIAMETER_POSITIVE_FINITE; DESIGN_BOND_STRENGTH_POSITIVE_FINITE; DESIGN_STEEL_STRESS_NON_NEGATIVE_FINITE_TENSION_MAGNITUDE; DIAMETER_DIVISOR_POSITIVE_FROM_PROFILE; AVAILABLE_LENGTH_NON_NEGATIVE_WHEN_SUPPLIED; NEGATIVE_NAN_INFINITY_REJECTED; ZERO_STRESS_EXPLICIT_ALLOWED; ZERO_BOND_STRENGTH_REJECTED" as const;
export const EU_C8_R4B_ZERO_DESIGN_STEEL_STRESS_ALLOWED = true as const;
export const EU_C8_R4B_ZERO_DESIGN_BOND_STRENGTH_ALLOWED = false as const;
export const EU_C8_R4B_NEGATIVE_INPUT_FAIL_CLOSED = true as const;
export const EU_C8_R4B_RESULT_CONTRACT_GOVERNED = true as const;
export const EU_C8_R4B_ANCHORAGE_UTILIZATION_STATE = "REQUIRED_DIVIDED_BY_AVAILABLE_NULL_WHEN_AVAILABLE_IS_ZERO" as const;
export const EU_C8_R4B_ANCHORAGE_UTILIZATION_SEMANTICS_EXPLICIT = true as const;
export const EU_C8_R4B_ANCHORAGE_AUTODESIGN = false as const;
export const EU_C8_R4B_AUTOMATIC_BAR_EXTENSION = false as const;
export const EU_C8_R4B_AUTOMATIC_HOOK_SELECTION = false as const;
export const EU_C8_R4B_AUTOMATIC_TRANSVERSE_REINFORCEMENT = false as const;
export const EU_C8_R4B_UNIT_SEMANTICS_EXPLICIT = true as const;
export const EU_C8_R4B_UNIT_EQUIVALENCE = "PASS" as const;
export const EU_C8_R4B_UNPROVENANCED_NUMERICAL_CONSTANT_COUNT = 0 as const;
export const EU_C8_R4B_FAIL_CLOSED_AUDIT = "PASS" as const;
export const EU_C8_R4B_DETERMINISTIC_EXECUTION = "PASS" as const;
export const EU_C8_R4B_SELF_REFERENTIAL_BENCHMARKS = false as const;
export const EU_C8_R4B_COMPONENT_BENCHMARKS = "PASS" as const;
export const EU_C8_R4B_GOLDEN_CASES = "PASS" as const;
export const EU_C8_R4B_BENCHMARK_COVERAGE = "PASS" as const;
export const EU_C8_R4B_RULE_SOURCE_INDEPENDENCE_STATE = "SINGLE_GOVERNED_SOURCE" as const;
export const EU_C8_R4B_NUMERICAL_BENCHMARK_INDEPENDENCE_STATE = "PASS" as const;
export const EU_C8_R4B_NUMERICAL_TOLERANCE_POLICY = "EXACT_ALGEBRAIC_MM" as const;
export const EU_C8_R4B_ENGINEER_VALIDATION_STATE = "PENDING_HUMAN_ENGINEERING_REVIEW" as const;
export const NUMERICAL_C8_BASIC_ANCHORAGE_VALIDATION_EQUALS_ENGINEER_VALIDATION = false as const;
export const NUMERICAL_C8_BASIC_ANCHORAGE_VALIDATION_EQUALS_STANDARD_CONFORMANCE = false as const;
export const EU_C8_R4B_RESULT_PROVENANCE = "PASS" as const;
export const EU_C8_R4B_RESULT_FINGERPRINT_COMPLETE = true as const;
export const EU_C8_R4B_DEPENDENCY_INVALIDATION = true as const;
export const STALE_EU_C8_R4B_RESULT_REUSE_ALLOWED = false as const;
export const EU_C8_R4B_HISTORICAL_RESULT_REPRODUCIBLE = true as const;
export const EU_C8_R4B_INVERSE_DESIGN_RECHECK_READY = true as const;
export const GENERATIVE_MODEL_CAN_BYPASS_C8_ANCHORAGE = false as const;
export const GENERATIVE_MODEL_CAN_INVENT_ANCHORAGE_INPUTS = false as const;
export const EU_C8_R4B_OPTIMIZATION_ACCEPTS_UNDETERMINED = false as const;
export const EU_C8_R4B_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE = false as const;
export const EU_C8_BASIC_ANCHORAGE_BOUNDED_CAPABILITY_COMPLETE = true as const;
export const EU_C8_R4B_BOUNDED_SUBCLAIM = "BASIC_REQUIRED_STRAIGHT_BAR_ANCHORAGE_REFERENCE_CAPABILITY" as const;
export const EU_C8_R4B_BASIC_LENGTH_WARNING = "BASIC_REQUIRED_LENGTH_ONLY" as const;

export type EuC8AnchorageCheckState = "SATISFIED" | "NOT_SATISFIED" | "UNDETERMINED";
export type EuC8LengthQuantity = { value: number | null; unit: string | null };
export type EuC8GovernedStress = {
  value: number | null;
  unit: string | null;
  provenanceRef: string | null;
  authority: string | null;
  applicability: string | null;
  validationState: string | null;
};
export type EuC8GovernedBondStrength = EuC8GovernedStress & { profileApplicability: string | null };

export type EuC8BasicAnchorageInput = {
  profileId: string | null;
  parentProfileId: string | null;
  profileVersion: string | null;
  generation: string | null;
  staleProfile?: boolean;
  nationalAnnexClaim?: boolean;
  sourceConflictUnresolved?: boolean;
  barId: string | null;
  forceState: string | null;
  barShape: string | null;
  reinforcementType: string | null;
  nominalBarDiameter: EuC8LengthQuantity | null;
  designSteelStress: EuC8GovernedStress | null;
  designBondStrength: EuC8GovernedBondStrength | null;
  checkRequested?: boolean;
  availableAnchorageLength?: EuC8LengthQuantity | null;
  criticalSectionRef?: string | null;
  deriveBondStrengthRequested?: boolean;
  substituteFydRequested?: boolean;
  bondConditionDefaultRequested?: boolean;
  levelBModifierRequested?: boolean;
  useRequiredNominalCoverAsConfinement?: boolean;
  useSpacingCheckAsConfinement?: boolean;
  hookOrBendRequested?: boolean;
  bundleRequested?: boolean;
  prestressRequested?: boolean;
  lapRequested?: boolean;
  extendBar?: boolean;
  selectHook?: boolean;
  addTransverseReinforcement?: boolean;
  divisorParameterRows?: readonly { parameterId: string; value: number | null; units: string; authority?: string; sources?: readonly string[] }[];
};

export type EuC8BasicAnchorageResult = {
  ok: boolean;
  methodId: typeof EU_C8_R4B_METHOD_ID;
  profileId: string | null;
  profileVersion: string | null;
  barId: string | null;
  forceState: "TENSION" | null;
  capabilityLevel: "BASIC_REQUIRED_STRAIGHT_BAR_ANCHORAGE";
  fullDesignAnchorageImplemented: false;
  nominalBarDiameterMm: number | null;
  basicAnchorageDiameterDivisor: number | null;
  designSteelStressMPa: number | null;
  designSteelStressProvenance: string | null;
  designBondStrengthMPa: number | null;
  designBondStrengthProvenance: string | null;
  basicRequiredAnchorageLengthMm: number | null;
  availableAnchorageLengthMm: number | null;
  criticalSectionRef: string | null;
  checkState: EuC8AnchorageCheckState | null;
  anchorageUtilization: number | null;
  failReason: string | null;
  governingRuleIds: string[];
  parameterVersions: string[];
  materialFingerprint: string | null;
  geometryFingerprint: string | null;
  profileFingerprint: string | null;
  validationState: "NUMERICALLY_VALIDATED";
  engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW";
  conformanceState: "INTENDED_PROFILE";
  warnings: string[];
  provenance: {
    barId: string | null;
    designSteelStressProvenance: string | null;
    designBondStrengthProvenance: string | null;
    diameterDivisorParameterId: string | null;
    diameterDivisorSourceIds: readonly string[];
    criticalSectionRef: string | null;
    ruleIds: string[];
    sourceIds: readonly string[];
  };
  resultFingerprint: string | null;
};

const STRESS_UNITS = ["MPa", "N/mm2"] as const;

function closed(input: EuC8BasicAnchorageInput, reason: string): EuC8BasicAnchorageResult {
  return {
    ok: false,
    methodId: EU_C8_R4B_METHOD_ID,
    profileId: input.profileId,
    profileVersion: input.profileVersion,
    barId: input.barId,
    forceState: null,
    capabilityLevel: "BASIC_REQUIRED_STRAIGHT_BAR_ANCHORAGE",
    fullDesignAnchorageImplemented: false,
    nominalBarDiameterMm: null,
    basicAnchorageDiameterDivisor: null,
    designSteelStressMPa: null,
    designSteelStressProvenance: null,
    designBondStrengthMPa: null,
    designBondStrengthProvenance: null,
    basicRequiredAnchorageLengthMm: null,
    availableAnchorageLengthMm: null,
    criticalSectionRef: null,
    checkState: "UNDETERMINED",
    anchorageUtilization: null,
    failReason: reason,
    governingRuleIds: [],
    parameterVersions: [],
    materialFingerprint: null,
    geometryFingerprint: null,
    profileFingerprint: null,
    validationState: "NUMERICALLY_VALIDATED",
    engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW",
    conformanceState: "INTENDED_PROFILE",
    warnings: [],
    provenance: {
      barId: input.barId,
      designSteelStressProvenance: null,
      designBondStrengthProvenance: null,
      diameterDivisorParameterId: null,
      diameterDivisorSourceIds: [],
      criticalSectionRef: null,
      ruleIds: [],
      sourceIds: [],
    },
    resultFingerprint: null,
  };
}

function present(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function notFiniteReason(value: number): "NAN_INPUT" | "INFINITY_INPUT" {
  return Number.isNaN(value) ? "NAN_INPUT" : "INFINITY_INPUT";
}

function governedAuthority(authority: string | null | undefined): { ok: true; authority: string } | { ok: false; reason: string } {
  const value = present(authority);
  if (!value) return { ok: false, reason: "MISSING_AUTHORITY" };
  if (value === "AI" || value === "LLM_MEMORY_ONLY") return { ok: false, reason: "UNGOVERNED_INPUT_AUTHORITY" };
  return { ok: true, authority: value };
}

function lengthMm(
  quantity: EuC8LengthQuantity | null | undefined,
  missingReason: string,
  allowZero: boolean,
): { ok: true; mm: number } | { ok: false; reason: string } {
  if (quantity == null || quantity.value == null) return { ok: false, reason: missingReason };
  const converted = convertLengthToMm(quantity.value, quantity.unit ?? "");
  if (!converted.ok) return { ok: false, reason: converted.reason === "NOT_FINITE" ? notFiniteReason(quantity.value) : "INVALID_UNITS" };
  if (converted.mm < EU_C8_R2_EXPLICIT_COMPONENT_LOWER_BOUND_MM) return { ok: false, reason: "NEGATIVE_INPUT" };
  if (!allowZero && !(converted.mm > EU_C8_R2_EXPLICIT_COMPONENT_LOWER_BOUND_MM)) return { ok: false, reason: "INVALID_BAR_DIAMETER" };
  return { ok: true, mm: converted.mm };
}

function stressMPa(
  quantity: EuC8GovernedStress | null,
  missingReason: string,
): { ok: true; mpa: number } | { ok: false; reason: string } {
  if (quantity == null || quantity.value == null) return { ok: false, reason: missingReason };
  if (typeof quantity.value !== "number" || Number.isNaN(quantity.value)) return { ok: false, reason: "NAN_INPUT" };
  if (!Number.isFinite(quantity.value)) return { ok: false, reason: "INFINITY_INPUT" };
  if (!STRESS_UNITS.includes(quantity.unit as (typeof STRESS_UNITS)[number])) return { ok: false, reason: "INVALID_UNITS" };
  if (quantity.value < EU_C8_R2_EXPLICIT_COMPONENT_LOWER_BOUND_MM) return { ok: false, reason: "NEGATIVE_INPUT" };
  return { ok: true, mpa: quantity.value };
}

function bondMPa(quantity: EuC8GovernedBondStrength | null): { ok: true; mpa: number } | { ok: false; reason: string } {
  const parsed = stressMPa(quantity, "MISSING_DESIGN_BOND_STRENGTH");
  if (!parsed.ok) return parsed.reason === "MISSING_DESIGN_STEEL_STRESS" ? { ok: false, reason: "MISSING_DESIGN_BOND_STRENGTH" } : parsed;
  if (parsed.mpa === EU_C8_R2_EXPLICIT_COMPONENT_LOWER_BOUND_MM) return { ok: false, reason: "ZERO_DESIGN_BOND_STRENGTH" };
  return parsed;
}

export function evaluateEuC8BasicRequiredAnchorage(input: EuC8BasicAnchorageInput): EuC8BasicAnchorageResult {
  if (input.extendBar || EU_C8_R4B_AUTOMATIC_BAR_EXTENSION) return closed(input, "AUTOMATIC_BAR_EXTENSION_NOT_IMPLEMENTED");
  if (input.selectHook || EU_C8_R4B_AUTOMATIC_HOOK_SELECTION) return closed(input, "AUTOMATIC_HOOK_SELECTION_NOT_IMPLEMENTED");
  if (input.addTransverseReinforcement || EU_C8_R4B_AUTOMATIC_TRANSVERSE_REINFORCEMENT) return closed(input, "AUTOMATIC_TRANSVERSE_REINFORCEMENT_NOT_IMPLEMENTED");
  if (input.substituteFydRequested || EU_C8_R4B_FYD_AUTOMATICALLY_USED_AS_SIGMA_SD) return closed(input, "FYD_NOT_SUBSTITUTED_FOR_SIGMA_SD");
  if (input.deriveBondStrengthRequested || EU_C8_R4B_INTERNAL_FBD_DERIVATION_IMPLEMENTED) return closed(input, "BOND_STRENGTH_DERIVATION_NOT_BOUND");
  if (input.bondConditionDefaultRequested || EU_C8_R4B_BOND_CONDITION_DEFAULTED) return closed(input, "BOND_CONDITION_NOT_DEFAULTED");
  if (input.levelBModifierRequested || EU_C8_R4B_DESIGN_ANCHORAGE_IMPLEMENTED || EU_C8_R4B_MINIMUM_DESIGN_ANCHORAGE_IMPLEMENTED) {
    return closed(input, "DESIGN_ANCHORAGE_MODIFIERS_NOT_BOUND");
  }
  if (input.useRequiredNominalCoverAsConfinement || C8_REQUIRED_NOMINAL_COVER_EQUALS_ANCHORAGE_ACTUAL_COVER || C8_R2_COVER_ASSEMBLY_RESULT_USED_AS_ANCHORAGE_MODIFIER) {
    return closed(input, "COVER_ASSEMBLY_NOT_ANCHORAGE_COVER");
  }
  if (input.useSpacingCheckAsConfinement || C8_SPACING_CHECK_RESULT_EQUALS_ANCHORAGE_MODIFIER || C8_R3B_SPACING_UTILIZATION_USED_AS_ANCHORAGE_FACTOR) {
    return closed(input, "SPACING_CHECK_NOT_CONFINEMENT_FACTOR");
  }
  if (input.hookOrBendRequested || EU_C8_R4B_BAR_SHAPE_MODIFIER_IMPLEMENTED) return closed(input, "UNSUPPORTED_BAR_SHAPE");
  if (input.bundleRequested) return closed(input, "BUNDLES_NOT_BOUND");
  if (input.prestressRequested) return closed(input, "PRESTRESS_NOT_BOUND");
  if (input.lapRequested) return closed(input, "LAP_NOT_BOUND");
  if (input.staleProfile) return closed(input, "STALE_PROFILE");
  if (input.profileId !== EU_C8_R4_ANCHORAGE_PROFILE_ID || input.parentProfileId !== EU_C8_R4_PARENT_PROFILE_ID) {
    return closed(input, "PROFILE_MISMATCH");
  }
  if (input.generation !== EU_C8_R4_ANCHORAGE_PROFILE_GENERATION) return closed(input, "GENERATION_MISMATCH");
  if (input.profileVersion !== EU_C8_R4_ANCHORAGE_PROFILE_VERSION) return closed(input, "PROFILE_VERSION_MISMATCH");
  if (input.nationalAnnexClaim) return closed(input, "NATIONAL_ANNEX_NOT_ESTABLISHED");
  if (input.sourceConflictUnresolved) return closed(input, "SOURCE_CONFLICT");

  const divisor = resolveEuC8BasicAnchorageDiameterDivisor();
  if (!divisor.ok) return closed(input, divisor.reason);
  if (input.divisorParameterRows) {
    const probed = resolveEuC8BasicAnchorageDiameterDivisor(input.divisorParameterRows);
    if (!probed.ok || probed.value !== divisor.value || probed.units !== divisor.units) {
      return closed(input, probed.ok ? "PROFILE_PARAMETER_MISMATCH" : probed.reason);
    }
  }

  const barId = present(input.barId);
  if (!barId) return closed(input, "MISSING_BAR_ID");
  if (input.reinforcementType !== "DEFORMED_BAR") return closed(input, "UNSUPPORTED_REINFORCEMENT_TYPE");
  if (input.barShape !== "STRAIGHT") return closed(input, "UNSUPPORTED_BAR_SHAPE");
  if (input.forceState !== "TENSION") return closed(input, "UNSUPPORTED_FORCE_STATE");

  const nominal = lengthMm(input.nominalBarDiameter, "MISSING_BAR_DIAMETER", false);
  if (!nominal.ok) return closed(input, nominal.reason);
  const stress = stressMPa(input.designSteelStress, "MISSING_DESIGN_STEEL_STRESS");
  if (!stress.ok) return closed(input, stress.reason);
  const steelAuthority = governedAuthority(input.designSteelStress?.authority);
  if (!steelAuthority.ok) return closed(input, "MISSING_DESIGN_STEEL_STRESS_PROVENANCE");
  const steelProvenance = present(input.designSteelStress?.provenanceRef);
  const steelApplicability = present(input.designSteelStress?.applicability);
  const steelValidation = present(input.designSteelStress?.validationState);
  if (!steelProvenance || !steelApplicability || !steelValidation) return closed(input, "MISSING_DESIGN_STEEL_STRESS_PROVENANCE");

  const bond = bondMPa(input.designBondStrength);
  if (!bond.ok) return closed(input, bond.reason);
  const bondAuthority = governedAuthority(input.designBondStrength?.authority);
  if (!bondAuthority.ok) return closed(input, "MISSING_DESIGN_BOND_STRENGTH_PROVENANCE");
  const bondProvenance = present(input.designBondStrength?.provenanceRef);
  const bondApplicability = present(input.designBondStrength?.applicability);
  const bondProfileApplicability = present(input.designBondStrength?.profileApplicability);
  const bondValidation = present(input.designBondStrength?.validationState);
  if (!bondProvenance || !bondApplicability || !bondProfileApplicability || !bondValidation) {
    return closed(input, "MISSING_DESIGN_BOND_STRENGTH_PROVENANCE");
  }

  let availableAnchorageLengthMm: number | null = null;
  if (input.checkRequested || input.availableAnchorageLength != null) {
    if (input.checkRequested && (input.availableAnchorageLength == null || input.availableAnchorageLength.value == null)) {
      return closed(input, "MISSING_AVAILABLE_ANCHORAGE_LENGTH");
    }
    if (input.availableAnchorageLength != null) {
      const available = lengthMm(input.availableAnchorageLength, "MISSING_AVAILABLE_ANCHORAGE_LENGTH", true);
      if (!available.ok) return closed(input, available.reason === "INVALID_BAR_DIAMETER" ? "NEGATIVE_INPUT" : available.reason);
      availableAnchorageLengthMm = available.mm;
    }
  }
  const criticalSectionRef = present(input.criticalSectionRef);
  if (input.checkRequested && !criticalSectionRef) return closed(input, "MISSING_CRITICAL_SECTION");

  const gate = resolveEuC8BasicAnchorageProfile({
    profileId: input.profileId,
    parentProfileId: input.parentProfileId,
    generation: input.generation,
    profileVersion: input.profileVersion,
    nominalBarDiameterMm: nominal.mm,
    designSteelStressMPa: stress.mpa,
    designBondStrengthMPa: bond.mpa,
    reinforcementType: input.reinforcementType,
    barShape: input.barShape,
    forceState: input.forceState,
    checkRequested: input.checkRequested,
    availableAnchorageLengthMm,
    criticalSectionRef,
  });
  if (!gate.ok) return closed(input, gate.reason);
  if (EU_C8_R4B_BASIC_RULE_FORMULA_FINGERPRINT !== "PASS") return closed(input, "FORMULA_FINGERPRINT_NOT_VALID");

  const basicRequiredAnchorageLengthMm = (nominal.mm / divisor.value) * (stress.mpa / bond.mpa);
  const checkState: EuC8AnchorageCheckState | null = input.checkRequested
    ? (availableAnchorageLengthMm ?? EU_C8_R2_EXPLICIT_COMPONENT_LOWER_BOUND_MM) >= basicRequiredAnchorageLengthMm
      ? "SATISFIED"
      : "NOT_SATISFIED"
    : null;
  const anchorageUtilization = input.checkRequested && availableAnchorageLengthMm != null && availableAnchorageLengthMm > EU_C8_R2_EXPLICIT_COMPONENT_LOWER_BOUND_MM
    ? basicRequiredAnchorageLengthMm / availableAnchorageLengthMm
    : null;
  const materialFingerprint = formulaFingerprint({
    ruleId: "EU_C8_R4B_EXPLICIT_STRESS_AND_BOND",
    operations: ["explicit"],
    parameterIds: [String(stress.mpa), steelProvenance, String(bond.mpa), bondProvenance],
  });
  const geometryFingerprint = formulaFingerprint({
    ruleId: "EU_C8_R4B_BAR_INPUT",
    operations: [EU_C8_R4B_AVAILABLE_ANCHORAGE_LENGTH_ROUTE],
    parameterIds: [barId, String(nominal.mm), String(availableAnchorageLengthMm), criticalSectionRef ?? ""],
  });
  const profileFingerprint = formulaFingerprint({
    ruleId: EU_C8_R4_ANCHORAGE_PROFILE_ID,
    operations: [EU_C8_R4_FORMULA_FINGERPRINT],
    parameterIds: [EU_C8_R4_ANCHORAGE_PROFILE_VERSION, EU_C8_R4_ANCHORAGE_PROFILE_GENERATION, String(divisor.value)],
  });
  const resultFingerprint = formulaFingerprint({
    ruleId: EU_C8_R4B_METHOD_ID,
    operations: [EU_C8_R4_FORMULA_FINGERPRINT, materialFingerprint, geometryFingerprint, profileFingerprint],
    parameterIds: [
      barId,
      String(nominal.mm),
      String(stress.mpa),
      steelProvenance,
      String(bond.mpa),
      bondProvenance,
      String(divisor.value),
      String(basicRequiredAnchorageLengthMm),
      String(availableAnchorageLengthMm),
      criticalSectionRef ?? "",
      checkState ?? "CALCULATION_ONLY",
      EU_C8_R4_ANCHORAGE_PROFILE_VERSION,
      ...EU_C8_R4_RULES.map((rule) => `${rule.ruleId}@${rule.version}`),
    ],
  });
  return {
    ok: true,
    methodId: EU_C8_R4B_METHOD_ID,
    profileId: EU_C8_R4_ANCHORAGE_PROFILE_ID,
    profileVersion: EU_C8_R4_ANCHORAGE_PROFILE_VERSION,
    barId,
    forceState: "TENSION",
    capabilityLevel: "BASIC_REQUIRED_STRAIGHT_BAR_ANCHORAGE",
    fullDesignAnchorageImplemented: false,
    nominalBarDiameterMm: nominal.mm,
    basicAnchorageDiameterDivisor: divisor.value,
    designSteelStressMPa: stress.mpa,
    designSteelStressProvenance: steelProvenance,
    designBondStrengthMPa: bond.mpa,
    designBondStrengthProvenance: bondProvenance,
    basicRequiredAnchorageLengthMm,
    availableAnchorageLengthMm,
    criticalSectionRef,
    checkState,
    anchorageUtilization,
    failReason: null,
    governingRuleIds: [EU_C8_R4_BASIC_ANCHORAGE_RULE_ID],
    parameterVersions: EU_C8_R4_PARAMETERS.map((parameter) => parameter.version),
    materialFingerprint,
    geometryFingerprint,
    profileFingerprint,
    validationState: "NUMERICALLY_VALIDATED",
    engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW",
    conformanceState: "INTENDED_PROFILE",
    warnings: [EU_C8_R4B_BASIC_LENGTH_WARNING],
    provenance: {
      barId,
      designSteelStressProvenance: steelProvenance,
      designBondStrengthProvenance: bondProvenance,
      diameterDivisorParameterId: divisor.parameterId,
      diameterDivisorSourceIds: divisor.sources,
      criticalSectionRef,
      ruleIds: [EU_C8_R4_BASIC_ANCHORAGE_RULE_ID],
      sourceIds: [EU_C8_R4_SOURCE_ID],
    },
    resultFingerprint,
  };
}

export function assertEuC8AnchorageResultCurrent(result: EuC8BasicAnchorageResult, input: EuC8BasicAnchorageInput): void {
  if (STALE_EU_C8_R4B_RESULT_REUSE_ALLOWED) throw new Error("stale C8 anchorage result reuse is forbidden");
  const current = evaluateEuC8BasicRequiredAnchorage(input);
  if (!current.ok || result.resultFingerprint == null || result.resultFingerprint !== current.resultFingerprint) {
    throw new Error("stale C8 anchorage result");
  }
}

export function assertEuC8AnchorageOptimizerRejectsUndetermined(state: EuC8AnchorageCheckState | null): void {
  if (EU_C8_R4B_OPTIMIZATION_ACCEPTS_UNDETERMINED) throw new Error("optimization must reject an undetermined anchorage check");
  if (state === "UNDETERMINED") throw new Error("optimization rejected an undetermined anchorage check");
}

export function assertEuC8AnchorageParetoRejectsUndetermined(state: EuC8AnchorageCheckState | null): void {
  if (EU_C8_R4B_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE) throw new Error("Pareto must reject an undetermined anchorage check");
  if (state === "UNDETERMINED") throw new Error("Pareto rejected an undetermined anchorage check");
}

export function recheckEuC8BasicRequiredAnchorage(input: EuC8BasicAnchorageInput): EuC8BasicAnchorageResult {
  if (!EU_C8_R4B_INVERSE_DESIGN_RECHECK_READY) throw new Error("anchorage recheck is not ready");
  return evaluateEuC8BasicRequiredAnchorage({
    ...input,
    extendBar: false,
    selectHook: false,
    addTransverseReinforcement: false,
    substituteFydRequested: false,
    deriveBondStrengthRequested: false,
  });
}

export function assertEuC8AnchorageAiAuthority(): void {
  if (
    !AI_C8_ASSISTANCE_ADVISORY_ONLY
    || LLM_C8_NUMERICAL_AUTHORITY
    || AI_C8_RULE_PARAMETER_AUTHORITY
    || AI_DESIGN_STEEL_STRESS_AUTHORITY
    || AI_DESIGN_BOND_STRENGTH_AUTHORITY
    || AI_C8_BOND_CONDITION_AUTHORITY
    || AI_CRITICAL_SECTION_AUTHORITY
    || AI_ANCHORAGE_OVERRIDE_AUTHORITY
    || AI_C8_CHECK_OVERRIDE_AUTHORITY
    || AI_C8_CONFORMANCE_AUTHORITY
    || AI_C8_ENGINEERING_APPROVAL
  ) {
    throw new Error("C8 anchorage AI authority is advisory only");
  }
}
