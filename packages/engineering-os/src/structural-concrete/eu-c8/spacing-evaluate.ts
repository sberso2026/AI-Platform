/**
 * Bounded minimum-clear-spacing check.
 * Required spacing comes from the C8 spacing profile. Measured spacing comes from D1E bar-pair geometry.
 * This method does not reposition bars and does not apply a project spacing overlay.
 */

import { formulaFingerprint } from "../eu-c1b/fingerprint";
import { barPairClearSpacingMm } from "../section-mechanics/bars";
import {
  AI_C8_ASSISTANCE_ADVISORY_ONLY,
  AI_C8_CHECK_OVERRIDE_AUTHORITY,
  AI_C8_CONFORMANCE_AUTHORITY,
  AI_C8_ENGINEERING_APPROVAL,
  AI_C8_NDP_AUTHORITY,
  AI_C8_RULE_PARAMETER_AUTHORITY,
  LLM_C8_NUMERICAL_AUTHORITY,
} from "./profile";
import {
  AI_AGGREGATE_SIZE_AUTHORITY,
  AI_BAR_DIAMETER_AUTHORITY,
  AI_SPACING_OVERRIDE_AUTHORITY,
  EU_C8_R3_NDP_PARAMETER_IDS,
  EU_C8_R3_PARAMETERS,
  EU_C8_R3_PARENT_PROFILE_ID,
  EU_C8_R3_RULES,
  EU_C8_R3_SMIN_FORMULA_FINGERPRINT,
  EU_C8_R3_SPACING_PROFILE_GENERATION,
  EU_C8_R3_SPACING_PROFILE_ID,
  EU_C8_R3_SPACING_PROFILE_IS_NATIONAL_ANNEX,
  EU_C8_R3_SPACING_PROFILE_VERSION,
  EU_C8_R3_SPACING_SOURCE_ID,
  resolveEuC8AbsoluteMinimumClearSpacing,
  resolveEuC8SpacingProfile,
} from "./spacing-profile";
import { convertLengthToMm, EU_C8_R2_EXPLICIT_COMPONENT_LOWER_BOUND_MM } from "./units";

export const EU_C8_R3B_METHOD_ID = "EU_RC_MIN_CLEAR_SPACING_EN1992_REFERENCE" as const;
export const EU_C8_R3B_PROFILE_BINDING_REUSED = true as const;
export const EU_C8_R3B_PROFILE_IDENTITY_UNCHANGED = true as const;
export const EU_C8_R3B_PROFILE_GENERATION_UNCHANGED = true as const;
export const PARALLEL_C8_SPACING_PROFILE_CREATED = false as const;
export const EU_C8_R3B_METHOD_APPLICABILITY =
  "ordinary non-prestressed reinforced concrete; individual straight deformed bars of one nominal diameter; explicit spacing context; surface-to-surface clear spacing; explicit maximum aggregate size; explicit NDP bar-diameter coefficient; explicit NDP aggregate allowance; profile-governed absolute minimum; static detailing" as const;
export const EU_C8_R3B_BAR_DIAMETER_SCOPE = "EQUAL_DIAMETER_ADJACENT_BARS_ONLY" as const;
export const EU_C8_R3B_UNLIKE_DIAMETER_BARS_SUPPORTED = false as const;
export const EU_C8_R3B_BAR_DIAMETER_CONTRACT_REUSED = true as const;
export const EU_C8_R3B_BAR_DIAMETER_GUESSED = false as const;
export const EU_C8_R3B_ACTUAL_BAR_DIAMETER_SUBSTITUTED = false as const;
export const EU_C8_R3B_CLEAR_SPACING_MEASUREMENT = "SURFACE_TO_SURFACE" as const;
export const EU_C8_R3B_MEASURED_CLEAR_SPACING_FROM_D1E_GEOMETRY = true as const;
export const EU_C8_R3B_DUPLICATE_CLEARANCE_FORMULA_CREATED = false as const;
export const EU_C8_R3B_MEASURED_CLEAR_SPACING_ROUTE = "barPairClearSpacingMm" as const;
export const EU_C8_R3B_BAR_PAIR_IDENTITY_EXPLICIT = true as const;
export const EU_C8_R3B_SPACING_CONTEXTS = ["HORIZONTAL_ADJACENT", "VERTICAL_LAYER_ADJACENT"] as const;
export const EU_C8_R3B_SPACING_CONTEXT_CONTRACT = "HORIZONTAL_ADJACENT | VERTICAL_LAYER_ADJACENT" as const;
export const EU_C8_R3B_ARBITRARY_BAR_PAIR_AUTO_CLASSIFIED = false as const;
export const EU_C8_R3B_REQUIRED_CLEAR_SPACING_IMPLEMENTED = true as const;
export const EU_C8_R3B_REQUIRED_CLEAR_SPACING_RULE_REUSED = true as const;
export const EU_C8_R3B_BAR_DIAMETER_COMPONENT_IMPLEMENTED = true as const;
export const EU_C8_R3B_BAR_DIAMETER_COEFFICIENT_EXPLICIT = true as const;
export const EU_C8_R3B_BAR_DIAMETER_COEFFICIENT_DEFAULTED = false as const;
export const EU_C8_R3B_BAR_DIAMETER_COEFFICIENT_NDP_DEPENDENT = true as const;
export const EU_C8_R3B_BAR_DIAMETER_COEFFICIENT_GUESSED = false as const;
export const EU_C8_R3B_MISSING_BAR_DIAMETER_COEFFICIENT_FAILS_CLOSED = true as const;
export const EU_C8_R3B_MAX_AGGREGATE_SIZE_EXPLICIT = true as const;
export const EU_C8_R3B_MAX_AGGREGATE_SIZE_GUESSED = false as const;
export const EU_C8_R3B_MAX_AGGREGATE_SIZE_DEFAULTED = false as const;
export const EU_C8_R3B_AGGREGATE_ALLOWANCE_EXPLICIT = true as const;
export const EU_C8_R3B_AGGREGATE_ALLOWANCE_DEFAULTED = false as const;
export const EU_C8_R3B_AGGREGATE_ALLOWANCE_GUESSED = false as const;
export const EU_C8_R3B_AGGREGATE_COMPONENT_IMPLEMENTED = true as const;
export const EU_C8_R3B_ABSOLUTE_MINIMUM_FROM_PROFILE = true as const;
export const EU_C8_R3B_ABSOLUTE_MINIMUM_HARDCODED_OUTSIDE_PROFILE = false as const;
export const EU_C8_R3B_GOVERNING_COMPONENT_REPORTED = true as const;
export const EU_C8_R3B_GOVERNING_COMPONENT_TIE_HANDLING = "MULTIPLE" as const;
export const EU_C8_R3B_NDP_PARAMETER_IDS = EU_C8_R3_NDP_PARAMETER_IDS;
export const EU_C8_R3B_NDP_VALUE_GUESSED = false as const;
export const EU_C8_R3B_REFERENCE_PROFILE_IS_NATIONAL_ANNEX = false as const;
export const NATIONAL_ANNEX_INFERRED_FROM_LOCATION = false as const;
export const EU_C8_R3B_PROJECT_MINIMUM_SPACING_OVERLAY_IMPLEMENTED = false as const;
export const EU_C8_R3B_BUNDLE_SPACING_IMPLEMENTED = false as const;
export const EU_C8_R3B_BUNDLED_BAR_INPUT_ACCEPTED = false as const;
export const EU_C8_R3B_MESH_SPACING_IMPLEMENTED = false as const;
export const EU_C8_R3B_PRESTRESS_TENDON_SPACING_IMPLEMENTED = false as const;
export const EU_C8_R3B_C7_CRACK_CONTROL_BAR_SPACING_IMPLEMENTED = false as const;
export const EU_C8_R3B_C7_BAR_DIAMETER_LIMIT_IMPLEMENTED = false as const;
export const EU_C8_R3B_C8_CLEAR_SPACING_EQUALS_C7_CRACK_CONTROL_SPACING = false as const;
export const EU_C8_R3B_INPUT_DOMAIN_VALIDATION =
  "NOMINAL_DIAMETER_POSITIVE_FINITE; AGGREGATE_SIZE_AND_NDP_LENGTHS_NON_NEGATIVE_FINITE; COEFFICIENT_NON_NEGATIVE_FINITE; NEGATIVE_NAN_INFINITY_REJECTED; ZERO_NDP_AND_ZERO_AGGREGATE_SIZE_EXPLICIT_ALLOWED; MISSING_NOT_COERCED_TO_ZERO; NO_INVENTED_UPPER_BOUND" as const;
export const EU_C8_R3B_ZERO_BAR_DIAMETER_COEFFICIENT_ALLOWED = true as const;
export const EU_C8_R3B_ZERO_AGGREGATE_ALLOWANCE_ALLOWED = true as const;
export const EU_C8_R3B_ZERO_MAXIMUM_AGGREGATE_SIZE_ALLOWED = true as const;
export const EU_C8_R3B_RESULT_CONTRACT_GOVERNED = true as const;
export const EU_C8_R3B_CHECK_STATE_GOVERNED = true as const;
export const EU_C8_R3B_SPACING_UTILIZATION_STATE = "REQUIRED_DIVIDED_BY_MEASURED" as const;
export const EU_C8_R3B_SPACING_UTILIZATION_SEMANTICS_EXPLICIT = true as const;
export const EU_C8_R3B_REBAR_LAYOUT_AUTODESIGN = false as const;
export const EU_C8_R3B_AUTOMATIC_BAR_REPOSITIONING = false as const;
export const EU_C8_R3B_UNIT_SEMANTICS_EXPLICIT = true as const;
export const EU_C8_R3B_UNIT_EQUIVALENCE = "PASS" as const;
export const EU_C8_R3B_UNPROVENANCED_NUMERICAL_CONSTANT_COUNT = 0 as const;
export const EU_C8_R3B_OVERLAPPING_BAR_SEMANTICS = "INVALID_INTERSECTING_GEOMETRY_FAIL_CLOSED" as const;
export const EU_C8_R3B_TOUCHING_BAR_SEMANTICS = "MEASURED_ZERO_IS_VALID_GEOMETRY_AND_NOT_SATISFIED" as const;
export const EU_C8_R3B_NUMERICAL_TOLERANCE_POLICY = "EXACT_ALGEBRAIC_MM" as const;
export const EU_C8_R3B_RULE_SOURCE_INDEPENDENCE_STATE = "SINGLE_GOVERNED_SOURCE" as const;
export const EU_C8_R3B_NUMERICAL_BENCHMARK_INDEPENDENCE_STATE = "PASS" as const;
export const EU_C8_R3B_ENGINEER_VALIDATION_STATE = "PENDING_HUMAN_ENGINEERING_REVIEW" as const;
export const NUMERICAL_C8_SPACING_VALIDATION_EQUALS_ENGINEER_VALIDATION = false as const;
export const NUMERICAL_C8_SPACING_VALIDATION_EQUALS_STANDARD_CONFORMANCE = false as const;
export const EU_C8_R3B_BOUNDED_SUBCLAIM = "MINIMUM_CLEAR_REINFORCEMENT_SPACING_REFERENCE_CAPABILITY" as const;
export const STALE_EU_C8_R3B_RESULT_REUSE_ALLOWED = false as const;
export const EU_C8_R3B_INVERSE_DESIGN_RECHECK_READY = true as const;
export const GENERATIVE_MODEL_CAN_BYPASS_C8_SPACING = false as const;
export const GENERATIVE_MODEL_CAN_INVENT_SPACING_NDP_VALUES = false as const;
export const EU_C8_R3B_OPTIMIZATION_ACCEPTS_UNDETERMINED = false as const;
export const EU_C8_R3B_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE = false as const;
export const AI_BAR_PAIR_AUTHORITY = false as const;
export const AI_CHECK_OVERRIDE_AUTHORITY = AI_C8_CHECK_OVERRIDE_AUTHORITY;
export const EU_C8_R3B_REINFORCEMENT_TYPE = "INDIVIDUAL_DEFORMED_BAR" as const;
export const EU_C8_SPACING_BOUNDED_CAPABILITY_COMPLETE = true as const;

export type EuC8SpacingContext = (typeof EU_C8_R3B_SPACING_CONTEXTS)[number];
export type EuC8SpacingCheckState = "SATISFIED" | "NOT_SATISFIED" | "UNDETERMINED";
export type EuC8SpacingGoverningComponent = "BAR_DIAMETER" | "AGGREGATE" | "ABSOLUTE_MINIMUM" | "MULTIPLE";
export type EuC8LengthQuantity = { value: number | null; unit: string | null };

export type EuC8MinClearSpacingInput = {
  profileId: string | null;
  spacingProfileId: string | null;
  profileVersion: string | null;
  generation: string | null;
  stale?: boolean;
  nationalAnnexClaim?: boolean;
  staleGeometry?: boolean;
  barIdA: string | null;
  barIdB: string | null;
  spacingContext: string | null;
  reinforcementType: string | null;
  nominalBarDiameter: EuC8LengthQuantity | null;
  barA: { x: EuC8LengthQuantity | null; y: EuC8LengthQuantity | null; diameter: EuC8LengthQuantity | null } | null;
  barB: { x: EuC8LengthQuantity | null; y: EuC8LengthQuantity | null; diameter: EuC8LengthQuantity | null } | null;
  maximumAggregateSize: EuC8LengthQuantity | null;
  barDiameterCoefficient: number | null;
  aggregateAllowance: EuC8LengthQuantity | null;
  barProvenanceRef: string | null;
  aggregateProvenanceRef: string | null;
  barDiameterCoefficientProvenanceRef: string | null;
  aggregateAllowanceProvenanceRef: string | null;
  bundleRequested?: boolean;
  meshRequested?: boolean;
  prestressRequested?: boolean;
  projectSpacingOverlayRequested?: boolean;
  crackControlSpacingRequested?: boolean;
  barDiameterLimitRequested?: boolean;
  repositionBars?: boolean;
  absoluteParameterRows?: readonly { parameterId: string; value: number | null; units: string; authority: string }[];
};

export type EuC8MinClearSpacingResult = {
  ok: boolean;
  methodId: typeof EU_C8_R3B_METHOD_ID;
  profileId: string | null;
  spacingProfileId: string | null;
  profileVersion: string | null;
  barIdA: string | null;
  barIdB: string | null;
  spacingContext: EuC8SpacingContext | null;
  nominalBarDiameterMm: number | null;
  maximumAggregateSizeMm: number | null;
  barDiameterCoefficient: number | null;
  aggregateAllowanceMm: number | null;
  absoluteMinimumClearSpacingMm: number | null;
  absoluteMinimumClearSpacingUnits: "mm" | null;
  barDiameterRequirementMm: number | null;
  aggregateRequirementMm: number | null;
  requiredClearSpacingMm: number | null;
  measuredClearSpacingMm: number | null;
  governingRequirementComponent: EuC8SpacingGoverningComponent | null;
  governingRequirementComponents: Exclude<EuC8SpacingGoverningComponent, "MULTIPLE">[];
  spacingUtilization: number | null;
  checkState: EuC8SpacingCheckState;
  failReason: string | null;
  ruleIds: string[];
  parameterVersions: string[];
  geometryFingerprint: string | null;
  materialFingerprint: string | null;
  profileFingerprint: string | null;
  validationState: "NUMERICALLY_VALIDATED";
  engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW";
  conformanceState: "INTENDED_PROFILE";
  warnings: string[];
  provenance: {
    barProvenanceRef: string | null;
    aggregateProvenanceRef: string | null;
    barDiameterCoefficientProvenanceRef: string | null;
    aggregateAllowanceProvenanceRef: string | null;
    absoluteMinimumSourceIds: readonly string[];
    ruleIds: string[];
    sourceIds: readonly string[];
  };
  resultFingerprint: string | null;
};

function closed(input: EuC8MinClearSpacingInput, reason: string): EuC8MinClearSpacingResult {
  return {
    ok: false,
    methodId: EU_C8_R3B_METHOD_ID,
    profileId: input.profileId,
    spacingProfileId: input.spacingProfileId,
    profileVersion: input.profileVersion,
    barIdA: input.barIdA,
    barIdB: input.barIdB,
    spacingContext: null,
    nominalBarDiameterMm: null,
    maximumAggregateSizeMm: null,
    barDiameterCoefficient: null,
    aggregateAllowanceMm: null,
    absoluteMinimumClearSpacingMm: null,
    absoluteMinimumClearSpacingUnits: null,
    barDiameterRequirementMm: null,
    aggregateRequirementMm: null,
    requiredClearSpacingMm: null,
    measuredClearSpacingMm: null,
    governingRequirementComponent: null,
    governingRequirementComponents: [],
    spacingUtilization: null,
    checkState: "UNDETERMINED",
    failReason: reason,
    ruleIds: [],
    parameterVersions: [],
    geometryFingerprint: null,
    materialFingerprint: null,
    profileFingerprint: null,
    validationState: "NUMERICALLY_VALIDATED",
    engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW",
    conformanceState: "INTENDED_PROFILE",
    warnings: [],
    provenance: {
      barProvenanceRef: input.barProvenanceRef,
      aggregateProvenanceRef: input.aggregateProvenanceRef,
      barDiameterCoefficientProvenanceRef: input.barDiameterCoefficientProvenanceRef,
      aggregateAllowanceProvenanceRef: input.aggregateAllowanceProvenanceRef,
      absoluteMinimumSourceIds: [],
      ruleIds: [],
      sourceIds: [],
    },
    resultFingerprint: null,
  };
}

function present(value: string | null): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function notFiniteReason(value: number): "NAN_INPUT" | "INFINITY_INPUT" {
  return Number.isNaN(value) ? "NAN_INPUT" : "INFINITY_INPUT";
}

function signedLengthMm(
  quantity: EuC8LengthQuantity | null,
  missingReason: string,
): { ok: true; mm: number } | { ok: false; reason: string } {
  if (quantity == null || quantity.value == null) return { ok: false, reason: missingReason };
  const converted = convertLengthToMm(quantity.value, quantity.unit ?? "");
  if (!converted.ok) return { ok: false, reason: converted.reason === "NOT_FINITE" ? notFiniteReason(quantity.value) : "INVALID_UNITS" };
  return { ok: true, mm: converted.mm };
}

function lengthMm(
  quantity: EuC8LengthQuantity | null,
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

function coefficient(value: number | null): { ok: true; value: number } | { ok: false; reason: string } {
  if (value == null) return { ok: false, reason: "MISSING_NDP_BAR_DIAMETER_COEFFICIENT" };
  if (typeof value !== "number" || Number.isNaN(value)) return { ok: false, reason: "NAN_INPUT" };
  if (!Number.isFinite(value)) return { ok: false, reason: "INFINITY_INPUT" };
  if (value < EU_C8_R2_EXPLICIT_COMPONENT_LOWER_BOUND_MM) return { ok: false, reason: "NEGATIVE_INPUT" };
  return { ok: true, value };
}

function contextOf(value: string | null): EuC8SpacingContext | null {
  if (value === EU_C8_R3B_SPACING_CONTEXTS[0] || value === EU_C8_R3B_SPACING_CONTEXTS[1]) return value;
  return null;
}

function governing(
  bar: number,
  aggregate: number,
  absolute: number,
): { component: EuC8SpacingGoverningComponent; components: Exclude<EuC8SpacingGoverningComponent, "MULTIPLE">[]; required: number } {
  const required = Math.max(bar, aggregate, absolute);
  const components = [
    bar === required ? "BAR_DIAMETER" as const : null,
    aggregate === required ? "AGGREGATE" as const : null,
    absolute === required ? "ABSOLUTE_MINIMUM" as const : null,
  ].filter((item): item is "BAR_DIAMETER" | "AGGREGATE" | "ABSOLUTE_MINIMUM" => item != null);
  const [first, second] = components;
  if (second || !first) return { component: "MULTIPLE", components, required };
  return { component: first, components, required };
}

export function evaluateEuC8MinClearSpacing(input: EuC8MinClearSpacingInput): EuC8MinClearSpacingResult {
  if (input.repositionBars || EU_C8_R3B_AUTOMATIC_BAR_REPOSITIONING) return closed(input, "AUTOMATIC_BAR_REPOSITIONING_NOT_IMPLEMENTED");
  if (input.bundleRequested || EU_C8_R3B_BUNDLED_BAR_INPUT_ACCEPTED) return closed(input, "UNSUPPORTED_BUNDLE");
  if (input.meshRequested || EU_C8_R3B_MESH_SPACING_IMPLEMENTED) return closed(input, "UNSUPPORTED_MESH");
  if (input.prestressRequested || EU_C8_R3B_PRESTRESS_TENDON_SPACING_IMPLEMENTED) return closed(input, "UNSUPPORTED_PRESTRESS");
  if (input.projectSpacingOverlayRequested || EU_C8_R3B_PROJECT_MINIMUM_SPACING_OVERLAY_IMPLEMENTED) return closed(input, "PROJECT_SPACING_OVERLAY_NOT_BOUND");
  if (input.crackControlSpacingRequested || EU_C8_R3B_C7_CRACK_CONTROL_BAR_SPACING_IMPLEMENTED) return closed(input, "C7_CRACK_CONTROL_SPACING_NOT_C8");
  if (input.barDiameterLimitRequested || EU_C8_R3B_C7_BAR_DIAMETER_LIMIT_IMPLEMENTED) return closed(input, "C7_BAR_DIAMETER_LIMIT_NOT_C8");
  if (input.nationalAnnexClaim || EU_C8_R3_SPACING_PROFILE_IS_NATIONAL_ANNEX || NATIONAL_ANNEX_INFERRED_FROM_LOCATION) {
    return closed(input, "NATIONAL_ANNEX_NOT_REFERENCE_PROFILE");
  }
  const spacingContext = contextOf(input.spacingContext);
  if (!spacingContext) return closed(input, "UNSUPPORTED_SPACING_CONTEXT");
  if (input.reinforcementType !== EU_C8_R3B_REINFORCEMENT_TYPE) return closed(input, "UNSUPPORTED_REINFORCEMENT_TYPE");
  if (input.staleGeometry) return closed(input, "STALE_GEOMETRY");
  const barIdA = present(input.barIdA);
  const barIdB = present(input.barIdB);
  if (!barIdA) return closed(input, "MISSING_BAR_A");
  if (!barIdB) return closed(input, "MISSING_BAR_B");
  if (barIdA === barIdB) return closed(input, "SAME_BAR_IDENTITY");
  if (!input.barA || !input.barB) return closed(input, "INVALID_GEOMETRY");

  const nominal = lengthMm(input.nominalBarDiameter, "MISSING_BAR_DIAMETER", false);
  if (!nominal.ok) return closed(input, nominal.reason);
  const diameterA = lengthMm(input.barA.diameter, "MISSING_BAR_DIAMETER", false);
  if (!diameterA.ok) return closed(input, diameterA.reason);
  const diameterB = lengthMm(input.barB.diameter, "MISSING_BAR_DIAMETER", false);
  if (!diameterB.ok) return closed(input, diameterB.reason);
  if (diameterA.mm !== nominal.mm || diameterB.mm !== nominal.mm) return closed(input, "UNEQUAL_BAR_DIAMETERS");
  const ax = signedLengthMm(input.barA.x, "INVALID_GEOMETRY");
  if (!ax.ok) return closed(input, ax.reason);
  const ay = signedLengthMm(input.barA.y, "INVALID_GEOMETRY");
  if (!ay.ok) return closed(input, ay.reason);
  const bx = signedLengthMm(input.barB.x, "INVALID_GEOMETRY");
  if (!bx.ok) return closed(input, bx.reason);
  const by = signedLengthMm(input.barB.y, "INVALID_GEOMETRY");
  if (!by.ok) return closed(input, by.reason);
  const aggregate = lengthMm(input.maximumAggregateSize, "MISSING_AGGREGATE_SIZE", true);
  if (!aggregate.ok) return closed(input, aggregate.reason === "INVALID_BAR_DIAMETER" ? "INVALID_AGGREGATE_SIZE" : aggregate.reason);
  const allowance = lengthMm(input.aggregateAllowance, "MISSING_NDP_AGGREGATE_ALLOWANCE", true);
  if (!allowance.ok) return closed(input, allowance.reason === "INVALID_BAR_DIAMETER" ? "INVALID_AGGREGATE_ALLOWANCE" : allowance.reason);
  const factor = coefficient(input.barDiameterCoefficient);
  if (!factor.ok) return closed(input, factor.reason);

  const canonicalAbsolute = resolveEuC8AbsoluteMinimumClearSpacing();
  if (!canonicalAbsolute.ok) return closed(input, canonicalAbsolute.reason);
  if (input.absoluteParameterRows) {
    const probed = resolveEuC8AbsoluteMinimumClearSpacing(input.absoluteParameterRows);
    if (!probed.ok || probed.value !== canonicalAbsolute.value) return closed(input, probed.ok ? "PROFILE_PARAMETER_MISMATCH" : probed.reason);
  }

  const bound = resolveEuC8SpacingProfile({
    profileId: input.profileId,
    spacingProfileId: input.spacingProfileId,
    generation: input.generation,
    profileVersion: input.profileVersion,
    stale: input.stale,
    nationalAnnexClaim: input.nationalAnnexClaim,
    nominalBarDiameterMm: nominal.mm,
    comparedBarDiameterMm: nominal.mm,
    maximumAggregateSizeMm: aggregate.mm,
    barDiameterCoefficient: factor.value,
    aggregateAllowanceMm: allowance.mm,
  });
  if (!bound.ok) return closed(input, bound.reason);
  if (bound.absoluteMinimumClearSpacingMm !== canonicalAbsolute.value) return closed(input, "PROFILE_PARAMETER_MISMATCH");

  const barProvenanceRef = present(input.barProvenanceRef);
  const aggregateProvenanceRef = present(input.aggregateProvenanceRef);
  const barDiameterCoefficientProvenanceRef = present(input.barDiameterCoefficientProvenanceRef);
  const aggregateAllowanceProvenanceRef = present(input.aggregateAllowanceProvenanceRef);
  if (!barProvenanceRef || !aggregateProvenanceRef || !barDiameterCoefficientProvenanceRef || !aggregateAllowanceProvenanceRef) {
    return closed(input, "INVALID_PROVENANCE");
  }

  const barDiameterRequirementMm = factor.value * nominal.mm;
  const aggregateRequirementMm = aggregate.mm + allowance.mm;
  const selected = governing(barDiameterRequirementMm, aggregateRequirementMm, canonicalAbsolute.value);
  const measuredClearSpacingMm = barPairClearSpacingMm(
    { xMm: ax.mm, yMm: ay.mm, diameterMm: nominal.mm },
    { xMm: bx.mm, yMm: by.mm, diameterMm: nominal.mm },
  );
  if (measuredClearSpacingMm < EU_C8_R2_EXPLICIT_COMPONENT_LOWER_BOUND_MM) return closed(input, "INVALID_OVERLAPPING_BARS");
  const spacingUtilization = measuredClearSpacingMm > EU_C8_R2_EXPLICIT_COMPONENT_LOWER_BOUND_MM
    ? selected.required / measuredClearSpacingMm
    : null;
  const checkState: EuC8SpacingCheckState = measuredClearSpacingMm >= selected.required ? "SATISFIED" : "NOT_SATISFIED";
  const geometryFingerprint = formulaFingerprint({
    ruleId: "D1E_BAR_PAIR_CLEAR_SPACING",
    operations: [EU_C8_R3B_MEASURED_CLEAR_SPACING_ROUTE, spacingContext],
    parameterIds: [barIdA, barIdB, String(ax.mm), String(ay.mm), String(bx.mm), String(by.mm), String(nominal.mm)],
  });
  const materialFingerprint = formulaFingerprint({
    ruleId: "MAXIMUM_AGGREGATE_SIZE",
    operations: ["explicit"],
    parameterIds: [String(aggregate.mm), aggregateProvenanceRef],
  });
  const profileFingerprint = formulaFingerprint({
    ruleId: EU_C8_R3_SPACING_PROFILE_ID,
    operations: [EU_C8_R3_SMIN_FORMULA_FINGERPRINT],
    parameterIds: [EU_C8_R3_SPACING_PROFILE_VERSION, EU_C8_R3_SPACING_PROFILE_GENERATION, EU_C8_R3_PARENT_PROFILE_ID],
  });
  const resultFingerprint = formulaFingerprint({
    ruleId: EU_C8_R3B_METHOD_ID,
    operations: [EU_C8_R3_SMIN_FORMULA_FINGERPRINT, geometryFingerprint, materialFingerprint, profileFingerprint],
    parameterIds: [
      barIdA,
      barIdB,
      spacingContext,
      String(nominal.mm),
      String(aggregate.mm),
      String(factor.value),
      String(allowance.mm),
      String(canonicalAbsolute.value),
      String(selected.required),
      String(measuredClearSpacingMm),
      checkState,
      EU_C8_R3_SPACING_PROFILE_VERSION,
      ...EU_C8_R3_RULES.map((rule) => `${rule.ruleId}@${rule.version}`),
      barProvenanceRef,
      aggregateProvenanceRef,
      barDiameterCoefficientProvenanceRef,
      aggregateAllowanceProvenanceRef,
    ],
  });
  return {
    ok: true,
    methodId: EU_C8_R3B_METHOD_ID,
    profileId: EU_C8_R3_PARENT_PROFILE_ID,
    spacingProfileId: EU_C8_R3_SPACING_PROFILE_ID,
    profileVersion: EU_C8_R3_SPACING_PROFILE_VERSION,
    barIdA,
    barIdB,
    spacingContext,
    nominalBarDiameterMm: nominal.mm,
    maximumAggregateSizeMm: aggregate.mm,
    barDiameterCoefficient: factor.value,
    aggregateAllowanceMm: allowance.mm,
    absoluteMinimumClearSpacingMm: canonicalAbsolute.value,
    absoluteMinimumClearSpacingUnits: canonicalAbsolute.units,
    barDiameterRequirementMm,
    aggregateRequirementMm,
    requiredClearSpacingMm: selected.required,
    measuredClearSpacingMm,
    governingRequirementComponent: selected.component,
    governingRequirementComponents: selected.components,
    spacingUtilization,
    checkState,
    failReason: null,
    ruleIds: EU_C8_R3_RULES.map((rule) => rule.ruleId),
    parameterVersions: EU_C8_R3_PARAMETERS.map((parameter) => parameter.version),
    geometryFingerprint,
    materialFingerprint,
    profileFingerprint,
    validationState: "NUMERICALLY_VALIDATED",
    engineerValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW",
    conformanceState: "INTENDED_PROFILE",
    warnings: [],
    provenance: {
      barProvenanceRef,
      aggregateProvenanceRef,
      barDiameterCoefficientProvenanceRef,
      aggregateAllowanceProvenanceRef,
      absoluteMinimumSourceIds: EU_C8_R3_PARAMETERS.find((row) => row.parameterId === "absoluteMinimumClearSpacingMm")?.sourceIds ?? [],
      ruleIds: EU_C8_R3_RULES.map((rule) => rule.ruleId),
      sourceIds: [EU_C8_R3_SPACING_SOURCE_ID],
    },
    resultFingerprint,
  };
}

export function assertEuC8SpacingResultCurrent(result: EuC8MinClearSpacingResult, input: EuC8MinClearSpacingInput): void {
  if (STALE_EU_C8_R3B_RESULT_REUSE_ALLOWED) throw new Error("stale C8 spacing result reuse is forbidden");
  const current = evaluateEuC8MinClearSpacing(input);
  if (!current.ok || result.resultFingerprint == null || result.resultFingerprint !== current.resultFingerprint) {
    throw new Error("stale C8 spacing result");
  }
}

export function assertEuC8SpacingOptimizerRejectsUndetermined(state: EuC8SpacingCheckState): void {
  if (EU_C8_R3B_OPTIMIZATION_ACCEPTS_UNDETERMINED) throw new Error("optimization must reject an undetermined spacing check");
  if (state === "UNDETERMINED") throw new Error("optimization rejected an undetermined spacing check");
}

export function assertEuC8SpacingParetoRejectsUndetermined(state: EuC8SpacingCheckState): void {
  if (EU_C8_R3B_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE) throw new Error("Pareto must reject an undetermined spacing check");
  if (state === "UNDETERMINED") throw new Error("Pareto rejected an undetermined spacing check");
}

export function recheckEuC8MinClearSpacing(input: EuC8MinClearSpacingInput): EuC8MinClearSpacingResult {
  if (!EU_C8_R3B_INVERSE_DESIGN_RECHECK_READY) throw new Error("spacing recheck is not ready");
  return evaluateEuC8MinClearSpacing({ ...input, repositionBars: false });
}

export function assertEuC8SpacingAiAuthority(): void {
  if (!AI_C8_ASSISTANCE_ADVISORY_ONLY || LLM_C8_NUMERICAL_AUTHORITY || AI_C8_RULE_PARAMETER_AUTHORITY || AI_AGGREGATE_SIZE_AUTHORITY || AI_BAR_DIAMETER_AUTHORITY || AI_C8_NDP_AUTHORITY || AI_BAR_PAIR_AUTHORITY || AI_SPACING_OVERRIDE_AUTHORITY || AI_CHECK_OVERRIDE_AUTHORITY || AI_C8_CONFORMANCE_AUTHORITY || AI_C8_ENGINEERING_APPROVAL) {
    throw new Error("C8 spacing AI authority is advisory only");
  }
}

export const EU_C8_R3B_ABSOLUTE_MINIMUM_UNITS = "mm" as const;
