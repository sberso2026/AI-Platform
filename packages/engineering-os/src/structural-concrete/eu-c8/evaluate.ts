/**
 * Bounded Eurocode cover-assembly reference.
 * Scope is COVER_ASSEMBLY_ONLY. Durability cover is an explicit input.
 * Geometric clearance and modelled cover stay on the D1E geometry model.
 */

import { formulaFingerprint } from "../eu-c1b/fingerprint";
import {
  EU_C8_R2_CMIN_FORMULA_FINGERPRINT,
  EU_C8_R2_CNOM_FORMULA_FINGERPRINT,
  EU_C8_R2_COVER_SUBPACK_FORMULA_FINGERPRINT_VALIDATION,
} from "./fingerprints";
import {
  AI_C8_ASSISTANCE_ADVISORY_ONLY,
  AI_C8_CHECK_OVERRIDE_AUTHORITY,
  AI_C8_CONFORMANCE_AUTHORITY,
  AI_C8_ENGINEERING_APPROVAL,
  AI_C8_EXPOSURE_CLASS_AUTHORITY,
  AI_C8_NDP_AUTHORITY,
  AI_C8_RULE_PARAMETER_AUTHORITY,
  EU_C8_R1_PARAMETERS,
  EU_C8_R1_REFERENCE_PROFILE_GENERATION,
  EU_C8_R1_REFERENCE_PROFILE_ID,
  EU_C8_R1_REFERENCE_PROFILE_IS_NATIONAL_ANNEX,
  EU_C8_R1_REFERENCE_PROFILE_VERSION,
  EU_C8_R1_RULES,
  EU_C8_R1_COVER_SOURCE_ID,
} from "./profile";
import { convertLengthToMm, EU_C8_R2_EXPLICIT_COMPONENT_LOWER_BOUND_MM } from "./units";

export const EU_C8_R2_METHOD_ID = "EU_RC_COVER_ASSEMBLY_EN1992_REFERENCE" as const;
export const EU_C8_R2_CAPABILITY_SCOPE = "COVER_ASSEMBLY_ONLY" as const;
export const EU_C8_R2_METHOD_APPLICABILITY =
  "first-generation C8 reference profile; explicit bond-cover component; explicit durability-cover component; explicit deviation allowance; profile-governed absolute minimum; deterministic minimum-cover assembly; deterministic nominal-cover assembly; no durability lookup; no exposure classification; no anchorage; no spacing; no lap design" as const;

export const EU_C8_R2_MINIMUM_COVER_ASSEMBLY_IMPLEMENTED = true as const;
export const EU_C8_R2_NOMINAL_COVER_ASSEMBLY_IMPLEMENTED = true as const;
export const EU_C8_R2_COVER_RUNTIME_METHOD_IMPLEMENTED = true as const;
export const EU_C8_R2_ABSOLUTE_MINIMUM_COVER_FROM_PROFILE = true as const;
export const EU_C8_R2_ABSOLUTE_MINIMUM_COVER_HARDCODED_OUTSIDE_PROFILE = false as const;
export const EU_C8_R2_BOND_COVER_INPUT_EXPLICIT = true as const;
export const EU_C8_R2_BOND_COVER_DEFAULTED = false as const;
export const EU_C8_R2_BOND_COVER_DERIVED_FROM_UNBOUND_BOND_RULE = false as const;
export const EU_C8_R2_DURABILITY_COVER_INPUT_EXPLICIT = true as const;
export const EU_C8_R2_DURABILITY_COVER_DEFAULTED = false as const;
export const EU_C8_R2_DURABILITY_COVER_LOOKUP_IMPLEMENTED = false as const;
export const EU_C8_R2_EXPOSURE_CLASS_TO_COVER_LOOKUP_IMPLEMENTED = false as const;
export const EU_C8_R2_EXPOSURE_CLASS_AUTHORITY = "CONTEXT_ONLY" as const;
export const EXPOSURE_CLASS_INFERRED_FROM_LOCATION = false as const;
export const EU_C8_R2_STRUCTURAL_CLASS_LOOKUP_IMPLEMENTED = false as const;
export const EU_C8_R2_DESIGN_LIFE_COVER_ADJUSTMENT_IMPLEMENTED = false as const;
export const EU_C8_R2_SPECIAL_PROTECTION_ADJUSTMENT_IMPLEMENTED = false as const;
export const EU_C8_R2_DEVIATION_ALLOWANCE_INPUT_EXPLICIT = true as const;
export const EU_C8_R2_DEVIATION_ALLOWANCE_DEFAULTED = false as const;
export const EU_C8_R2_DEVIATION_ALLOWANCE_INFERRED = false as const;
export const EU_C8_R2_REFERENCE_PROFILE_IS_NATIONAL_ANNEX = false as const;
export const EU_C8_R2_FAKE_NATIONAL_VALUES_SUPPLIED = false as const;
export const EU_C8_R2_NDP_VALUE_GUESSED = false as const;
export const EU_C8_R2_MISSING_REQUIRED_NDP_INPUT_FAILS_CLOSED = true as const;
export const EU_C8_R2_NOMINAL_COVER_RULE_PROVENANCE_COMPLETE = true as const;
export const EU_C8_R2_GOVERNING_COVER_COMPONENT_REPORTED = true as const;
export const EU_C8_R2_GOVERNING_COMPONENT_TIE_HANDLING = "MULTIPLE" as const;
export const D1E_MODELLED_COVER_EQUALS_REQUIRED_NOMINAL_COVER = false as const;
export const D1E_GEOMETRIC_CLEARANCE_EQUALS_EN1992_COVER_CHECK = false as const;
export const EU_C8_R2_PROVIDED_COVER_COMPARISON_AUTHORITY = "NOT_BOUND" as const;
export const EU_C8_R2_PROVIDED_COVER_CHECK_IMPLEMENTED = false as const;
export const EU_C8_R2_ZERO_BOND_COVER_ALLOWED = true as const;
export const EU_C8_R2_ZERO_DURABILITY_COVER_ALLOWED = true as const;
export const EU_C8_R2_ZERO_DEVIATION_ALLOWANCE_ALLOWED = true as const;
export const EU_C8_R2_UNIT_SEMANTICS_EXPLICIT = true as const;
export const EU_C8_R2_COVER_ASSEMBLY_EQUALS_MEMBER_COMPLIANCE = false as const;
export const EU_C8_R2_CHECK_STATE_SEMANTICS =
  "COVER_REQUIREMENT_CALCULATED reports assembly of the governed requirement. FAIL_CLOSED reports a missing or invalid binding. Neither state is PROVIDED_COVER_COMPLIES or a SATISFIED member check." as const;
export const EU_C8_R2_RESULT_CONTRACT_GOVERNED = true as const;
export const EU_C8_R2_SPACING_RUNTIME_METHOD_IMPLEMENTED = false as const;
export const EU_C8_R2_NEXT_SUBPACK_CURRENTLY_IMPLEMENTATION_READY = false as const;
export const EU_C8_R2_ANCHORAGE_RUNTIME_METHOD_IMPLEMENTED = false as const;
export const EU_C8_R2_LAP_RUNTIME_METHOD_IMPLEMENTED = false as const;
export const EU_C8_R2_DURABILITY_LOOKUP_DEBT_PRESERVED = true as const;
export const EU_C8_R2_COVER_RULE_SOURCE_INDEPENDENCE_STATE = "SINGLE_GOVERNED_SOURCE" as const;
export const EU_C8_R2_RULE_SOURCE_INDEPENDENCE_STATE = "SINGLE_GOVERNED_SOURCE" as const;
export const STALE_EU_C8_R2_RESULT_REUSE_ALLOWED = false as const;
export const EU_C8_R2_INVERSE_DESIGN_RECHECK_READY = true as const;
export const GENERATIVE_MODEL_CAN_INVENT_COVER_COMPONENTS = false as const;
export const EU_C8_R2_OPTIMIZATION_ACCEPTS_UNDETERMINED = false as const;
export const EU_C8_R2_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE = false as const;
export const AI_DURABILITY_COVER_AUTHORITY = false as const;
export const AI_DEVIATION_ALLOWANCE_AUTHORITY = false as const;
export const AI_BOND_COVER_AUTHORITY = false as const;
export const AI_EXPOSURE_CLASS_AUTHORITY = AI_C8_EXPOSURE_CLASS_AUTHORITY;
export const EU_C8_R2_INPUT_DOMAIN_VALIDATION =
  "NON_NEGATIVE_FINITE_EXPLICIT_LENGTH; NEGATIVE_NAN_INFINITY_REJECTED; ZERO_EXPLICIT_ALLOWED; MISSING_NOT_COERCED_TO_ZERO; NO_INVENTED_UPPER_BOUND" as const;
export const EU_C8_R2_NUMERICAL_TOLERANCE_POLICY = "EXACT_ALGEBRAIC_MM" as const;
export const EU_C8_R2_REQUIRED_INPUT_IDS = [
  "profileId",
  "profileVersion",
  "generation",
  "bondCoverComponentMm",
  "durabilityCoverComponentMm",
  "deviationAllowanceMm",
  "bondProvenanceRef",
  "durabilityProvenanceRef",
  "deviationProvenanceRef",
] as const;
export const EU_C8_R2_PARAMETER_SOURCE_CLASSIFICATIONS = {
  profileId: "PROFILE_PARAMETER",
  profileVersion: "PROFILE_PARAMETER",
  generation: "PROFILE_PARAMETER",
  absoluteMinimumCoverMm: "PROFILE_PARAMETER",
  bondCoverComponentMm: "EXPLICIT_GOVERNED_INPUT",
  durabilityCoverComponentMm: "EXPLICIT_GOVERNED_INPUT",
  deviationAllowanceMm: "EXPLICIT_GOVERNED_INPUT",
  minimumCoverMm: "DERIVED_OUTPUT",
  nominalCoverMm: "DERIVED_OUTPUT",
  governingMinimumComponent: "DERIVED_OUTPUT",
} as const;

export type EuC8GoverningMinimumComponent = "BOND" | "DURABILITY" | "ABSOLUTE_MINIMUM" | "MULTIPLE";
export type EuC8CoverCheckState = "COVER_REQUIREMENT_CALCULATED" | "FAIL_CLOSED";
export type EuC8LengthQuantity = { value: number | null; unit: string | null };
export type EuC8NdpState = "EXPLICIT" | "UNRESOLVED";

export type EuC8CoverAssemblyInput = {
  profileId: string | null;
  profileVersion: string | null;
  generation: string | null;
  stale?: boolean;
  nationalAnnexClaim?: boolean;
  bondCover: EuC8LengthQuantity | null;
  durabilityCover: EuC8LengthQuantity | null;
  deviationAllowance: EuC8LengthQuantity | null;
  bondProvenanceRef: string | null;
  durabilityProvenanceRef: string | null;
  deviationProvenanceRef: string | null;
  durabilityNdpState?: EuC8NdpState | null;
  deviationNdpState?: EuC8NdpState | null;
  exposureContext?: string | null;
  materialContext?: string | null;
  executionContext?: string | null;
  projectRequirementRef?: string | null;
  deriveDurabilityFromExposure?: boolean;
  applyDefaultDeviationAllowance?: boolean;
  requestProvidedCoverComparison?: boolean;
};

export type EuC8CoverAssemblyResult = {
  ok: boolean;
  methodId: typeof EU_C8_R2_METHOD_ID;
  profileId: string | null;
  profileVersion: string | null;
  capabilityScope: typeof EU_C8_R2_CAPABILITY_SCOPE;
  calculationState: EuC8CoverCheckState;
  checkState: EuC8CoverCheckState;
  failReason: string | null;
  bondCoverComponentMm: number | null;
  durabilityCoverComponentMm: number | null;
  absoluteMinimumCoverMm: number | null;
  absoluteMinimumCoverUnits: "mm" | null;
  minimumCoverMm: number | null;
  governingMinimumComponent: EuC8GoverningMinimumComponent | null;
  deviationAllowanceMm: number | null;
  nominalCoverMm: number | null;
  exposureContext: string | null;
  materialContext: string | null;
  executionContext: string | null;
  projectRequirementRef: string | null;
  providedCoverComparisonState: "NOT_BOUND";
  memberCompliance: false;
  governingRuleIds: string[];
  parameterVersions: string[];
  profileFingerprint: string | null;
  inputFingerprint: string | null;
  validationState: "NUMERICALLY_VALIDATED";
  engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW";
  conformanceState: "INTENDED_PROFILE";
  warnings: string[];
  provenance: {
    bondProvenanceRef: string | null;
    durabilityProvenanceRef: string | null;
    deviationProvenanceRef: string | null;
    absoluteMinimumSourceIds: readonly string[];
    ruleIds: readonly string[];
    ruleVersions: readonly string[];
    sourceIds: readonly string[];
  };
  resultFingerprint: string | null;
};

type AbsoluteMinimum = {
  value: number;
  units: "mm";
  version: string;
  sourceIds: readonly string[];
};

export function resolveEuC8AbsoluteMinimumCover(
  parameters: readonly { parameterId: string; value: number | null; units: string; authority: string; version: string; sourceIds: readonly string[] }[] = EU_C8_R1_PARAMETERS,
): { ok: true; parameter: AbsoluteMinimum } | { ok: false; reason: "MISSING_PROFILE_ABSOLUTE_MINIMUM" } {
  const parameter = parameters.find((row) => row.parameterId === "absoluteMinimumCoverMm");
  if (!parameter || parameter.authority !== "STANDARD_DEFINED" || parameter.units !== "mm") {
    return { ok: false, reason: "MISSING_PROFILE_ABSOLUTE_MINIMUM" };
  }
  if (typeof parameter.value !== "number" || !Number.isFinite(parameter.value)) {
    return { ok: false, reason: "MISSING_PROFILE_ABSOLUTE_MINIMUM" };
  }
  return {
    ok: true,
    parameter: {
      value: parameter.value,
      units: "mm",
      version: parameter.version,
      sourceIds: parameter.sourceIds,
    },
  };
}

function presentRef(value: string | null): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

function governingComponent(bond: number, durability: number, absoluteMinimum: number): EuC8GoverningMinimumComponent {
  const minimum = Math.max(bond, durability, absoluteMinimum);
  const hits = [
    bond === minimum ? "BOND" as const : null,
    durability === minimum ? "DURABILITY" as const : null,
    absoluteMinimum === minimum ? "ABSOLUTE_MINIMUM" as const : null,
  ].filter((item): item is "BOND" | "DURABILITY" | "ABSOLUTE_MINIMUM" => item != null);
  const [first, second] = hits;
  if (second || !first) return "MULTIPLE";
  return first;
}

function lengthOrReason(
  quantity: EuC8LengthQuantity | null,
  missingReason: string,
): { ok: true; mm: number } | { ok: false; reason: string } {
  if (quantity == null || quantity.value == null) return { ok: false, reason: missingReason };
  const converted = convertLengthToMm(quantity.value, quantity.unit ?? "");
  if (!converted.ok) {
    return { ok: false, reason: converted.reason === "NOT_FINITE" ? notFiniteReason(quantity.value) : "INVALID_UNITS" };
  }
  if (converted.mm < EU_C8_R2_EXPLICIT_COMPONENT_LOWER_BOUND_MM) return { ok: false, reason: "NEGATIVE_INPUT" };
  return { ok: true, mm: converted.mm };
}

function notFiniteReason(value: number): "NAN_INPUT" | "INFINITY_INPUT" {
  return Number.isNaN(value) ? "NAN_INPUT" : "INFINITY_INPUT";
}

function shell(input: EuC8CoverAssemblyInput, failReason: string | null, warnings: string[]): EuC8CoverAssemblyResult {
  return {
    ok: false,
    methodId: EU_C8_R2_METHOD_ID,
    profileId: input.profileId,
    profileVersion: input.profileVersion,
    capabilityScope: EU_C8_R2_CAPABILITY_SCOPE,
    calculationState: "FAIL_CLOSED",
    checkState: "FAIL_CLOSED",
    failReason,
    bondCoverComponentMm: null,
    durabilityCoverComponentMm: null,
    absoluteMinimumCoverMm: null,
    absoluteMinimumCoverUnits: null,
    minimumCoverMm: null,
    governingMinimumComponent: null,
    deviationAllowanceMm: null,
    nominalCoverMm: null,
    exposureContext: input.exposureContext ?? null,
    materialContext: input.materialContext ?? null,
    executionContext: input.executionContext ?? null,
    projectRequirementRef: input.projectRequirementRef ?? null,
    providedCoverComparisonState: "NOT_BOUND",
    memberCompliance: false,
    governingRuleIds: [],
    parameterVersions: [],
    profileFingerprint: null,
    inputFingerprint: null,
    validationState: "NUMERICALLY_VALIDATED",
    engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW",
    conformanceState: "INTENDED_PROFILE",
    warnings,
    provenance: {
      bondProvenanceRef: input.bondProvenanceRef,
      durabilityProvenanceRef: input.durabilityProvenanceRef,
      deviationProvenanceRef: input.deviationProvenanceRef,
      absoluteMinimumSourceIds: [],
      ruleIds: [],
      ruleVersions: [],
      sourceIds: [],
    },
    resultFingerprint: null,
  };
}

export function euC8CoverResultFingerprint(parts: {
  bondCoverComponentMm: number;
  durabilityCoverComponentMm: number;
  absoluteMinimumCoverMm: number;
  deviationAllowanceMm: number;
  profileId: string;
  profileVersion: string;
  generation: string;
  bondProvenanceRef: string;
  durabilityProvenanceRef: string;
  deviationProvenanceRef: string;
  exposureContext: string | null;
  materialContext: string | null;
  executionContext: string | null;
  projectRequirementRef: string | null;
}): string {
  const rules = EU_C8_R1_RULES.map((rule) => `${rule.ruleId}@${rule.version}`);
  return formulaFingerprint({
    ruleId: EU_C8_R2_METHOD_ID,
    operations: [EU_C8_R2_CMIN_FORMULA_FINGERPRINT, EU_C8_R2_CNOM_FORMULA_FINGERPRINT],
    parameterIds: [
      parts.profileId,
      parts.profileVersion,
      parts.generation,
      String(parts.bondCoverComponentMm),
      String(parts.durabilityCoverComponentMm),
      String(parts.absoluteMinimumCoverMm),
      String(parts.deviationAllowanceMm),
      parts.bondProvenanceRef,
      parts.durabilityProvenanceRef,
      parts.deviationProvenanceRef,
      parts.exposureContext ?? "",
      parts.materialContext ?? "",
      parts.executionContext ?? "",
      parts.projectRequirementRef ?? "",
      ...rules,
    ],
  });
}

export function evaluateEuC8CoverAssembly(input: EuC8CoverAssemblyInput): EuC8CoverAssemblyResult {
  if (EU_C8_R2_COVER_SUBPACK_FORMULA_FINGERPRINT_VALIDATION !== "PASS") {
    return shell(input, "COVER_ASSEMBLY_FORMULA_FINGERPRINT_INCOMPLETE", []);
  }
  if (input.requestProvidedCoverComparison) return shell(input, "UNSUPPORTED_PROVIDED_COVER_COMPARISON", []);
  if (input.deriveDurabilityFromExposure) return shell(input, "EXPOSURE_DOES_NOT_SUPPLY_DURABILITY_COVER", []);
  if (input.applyDefaultDeviationAllowance) return shell(input, "DEVIATION_ALLOWANCE_NOT_DEFAULTED", []);
  if (input.nationalAnnexClaim || EU_C8_R1_REFERENCE_PROFILE_IS_NATIONAL_ANNEX) {
    return shell(input, "NATIONAL_ANNEX_NOT_REFERENCE_PROFILE", []);
  }
  if (input.profileId == null || input.profileId.trim() === "") return shell(input, "MISSING_PROFILE", []);
  if (input.profileId !== EU_C8_R1_REFERENCE_PROFILE_ID) return shell(input, "PROFILE_MISMATCH", []);
  if (input.generation !== EU_C8_R1_REFERENCE_PROFILE_GENERATION) return shell(input, "GENERATION_MISMATCH", []);
  if (input.stale || input.profileVersion !== EU_C8_R1_REFERENCE_PROFILE_VERSION) return shell(input, "STALE_PROFILE", []);

  const absolute = resolveEuC8AbsoluteMinimumCover();
  if (!absolute.ok) return shell(input, absolute.reason, []);
  if (input.durabilityNdpState === "UNRESOLVED" || input.deviationNdpState === "UNRESOLVED") {
    return shell(input, "UNRESOLVED_NDP_INPUT", []);
  }

  const bond = lengthOrReason(input.bondCover, "MISSING_BOND_COVER");
  if (!bond.ok) return shell(input, bond.reason, []);
  const durability = lengthOrReason(input.durabilityCover, "MISSING_DURABILITY_COVER");
  if (!durability.ok) return shell(input, durability.reason, []);
  const deviation = lengthOrReason(input.deviationAllowance, "MISSING_DEVIATION_ALLOWANCE");
  if (!deviation.ok) return shell(input, deviation.reason, []);

  const bondProvenanceRef = presentRef(input.bondProvenanceRef);
  const durabilityProvenanceRef = presentRef(input.durabilityProvenanceRef);
  const deviationProvenanceRef = presentRef(input.deviationProvenanceRef);
  if (!bondProvenanceRef || !durabilityProvenanceRef || !deviationProvenanceRef) {
    return shell(input, "INVALID_PROVENANCE", []);
  }

  const minimumCoverMm = Math.max(bond.mm, durability.mm, absolute.parameter.value);
  const nominalCoverMm = minimumCoverMm + deviation.mm;
  const warnings = input.exposureContext
    ? ["exposure context is provenance only and does not set durabilityCoverComponentMm"]
    : [];
  const fingerprintParts = {
    bondCoverComponentMm: bond.mm,
    durabilityCoverComponentMm: durability.mm,
    absoluteMinimumCoverMm: absolute.parameter.value,
    deviationAllowanceMm: deviation.mm,
    profileId: EU_C8_R1_REFERENCE_PROFILE_ID,
    profileVersion: EU_C8_R1_REFERENCE_PROFILE_VERSION,
    generation: EU_C8_R1_REFERENCE_PROFILE_GENERATION,
    bondProvenanceRef,
    durabilityProvenanceRef,
    deviationProvenanceRef,
    exposureContext: input.exposureContext ?? null,
    materialContext: input.materialContext ?? null,
    executionContext: input.executionContext ?? null,
    projectRequirementRef: input.projectRequirementRef ?? null,
  };
  const resultFingerprint = euC8CoverResultFingerprint(fingerprintParts);
  return {
    ok: true,
    methodId: EU_C8_R2_METHOD_ID,
    profileId: EU_C8_R1_REFERENCE_PROFILE_ID,
    profileVersion: EU_C8_R1_REFERENCE_PROFILE_VERSION,
    capabilityScope: EU_C8_R2_CAPABILITY_SCOPE,
    calculationState: "COVER_REQUIREMENT_CALCULATED",
    checkState: "COVER_REQUIREMENT_CALCULATED",
    failReason: null,
    bondCoverComponentMm: bond.mm,
    durabilityCoverComponentMm: durability.mm,
    absoluteMinimumCoverMm: absolute.parameter.value,
    absoluteMinimumCoverUnits: absolute.parameter.units,
    minimumCoverMm,
    governingMinimumComponent: governingComponent(bond.mm, durability.mm, absolute.parameter.value),
    deviationAllowanceMm: deviation.mm,
    nominalCoverMm,
    exposureContext: input.exposureContext ?? null,
    materialContext: input.materialContext ?? null,
    executionContext: input.executionContext ?? null,
    projectRequirementRef: input.projectRequirementRef ?? null,
    providedCoverComparisonState: "NOT_BOUND",
    memberCompliance: false,
    governingRuleIds: EU_C8_R1_RULES.map((rule) => rule.ruleId),
    parameterVersions: [absolute.parameter.version],
    profileFingerprint: formulaFingerprint({
      ruleId: EU_C8_R1_REFERENCE_PROFILE_ID,
      operations: [EU_C8_R2_CMIN_FORMULA_FINGERPRINT, EU_C8_R2_CNOM_FORMULA_FINGERPRINT],
      parameterIds: [EU_C8_R1_REFERENCE_PROFILE_VERSION, EU_C8_R1_REFERENCE_PROFILE_GENERATION],
    }),
    inputFingerprint: resultFingerprint,
    validationState: "NUMERICALLY_VALIDATED",
    engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW",
    conformanceState: "INTENDED_PROFILE",
    warnings,
    provenance: {
      bondProvenanceRef,
      durabilityProvenanceRef,
      deviationProvenanceRef,
      absoluteMinimumSourceIds: absolute.parameter.sourceIds,
      ruleIds: EU_C8_R1_RULES.map((rule) => rule.ruleId),
      ruleVersions: EU_C8_R1_RULES.map((rule) => rule.version),
      sourceIds: [EU_C8_R1_COVER_SOURCE_ID],
    },
    resultFingerprint,
  };
}

export function assertEuC8CoverResultCurrent(result: EuC8CoverAssemblyResult, input: EuC8CoverAssemblyInput): void {
  if (STALE_EU_C8_R2_RESULT_REUSE_ALLOWED) throw new Error("stale C8 cover result reuse is forbidden");
  const current = evaluateEuC8CoverAssembly(input);
  if (!current.ok || result.resultFingerprint == null || result.resultFingerprint !== current.resultFingerprint) {
    throw new Error("stale C8 cover result");
  }
}

export function assertEuC8CoverOptimizerRejectsUndetermined(state: EuC8CoverCheckState): void {
  if (EU_C8_R2_OPTIMIZATION_ACCEPTS_UNDETERMINED) throw new Error("optimization must reject an undetermined cover assembly");
  if (state !== "COVER_REQUIREMENT_CALCULATED") throw new Error("optimization rejected an undetermined cover assembly");
}

export function assertEuC8CoverParetoRejectsUndetermined(state: EuC8CoverCheckState): void {
  if (EU_C8_R2_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE) throw new Error("Pareto must reject an undetermined cover assembly");
  if (state !== "COVER_REQUIREMENT_CALCULATED") throw new Error("Pareto rejected an undetermined cover assembly");
}

export function recheckEuC8CoverAssemblyRequirement(input: EuC8CoverAssemblyInput): EuC8CoverAssemblyResult {
  return evaluateEuC8CoverAssembly(input);
}

export function inventEuC8CoverComponent(): never {
  if (!GENERATIVE_MODEL_CAN_INVENT_COVER_COMPONENTS) {
    throw new Error("generative models cannot invent cover components");
  }
  throw new Error("generative models cannot invent cover components");
}

export function assertEuC8AiAuthority(): void {
  if (!AI_C8_ASSISTANCE_ADVISORY_ONLY) throw new Error("C8 assistance must stay advisory");
  if (AI_C8_RULE_PARAMETER_AUTHORITY || AI_DURABILITY_COVER_AUTHORITY || AI_DEVIATION_ALLOWANCE_AUTHORITY || AI_BOND_COVER_AUTHORITY) {
    throw new Error("AI cannot author cover parameters");
  }
  if (AI_C8_NDP_AUTHORITY || AI_EXPOSURE_CLASS_AUTHORITY || AI_C8_CHECK_OVERRIDE_AUTHORITY || AI_C8_CONFORMANCE_AUTHORITY || AI_C8_ENGINEERING_APPROVAL) {
    throw new Error("AI cannot approve cover engineering");
  }
}
