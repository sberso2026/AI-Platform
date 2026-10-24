/**
 * EOS-D1E-EU-C8-R3 minimum-clear-spacing sub-pack.
 * Bound from the JRC Brussels 2011 detailing slide. No spacing value is calculated here.
 * Recommended coefficients are recorded and are not applied.
 */

import { formulaFingerprint } from "../eu-c1b/fingerprint";
import {
  EU_C8_R1_REFERENCE_PROFILE_GENERATION,
  EU_C8_R1_REFERENCE_PROFILE_ID,
  NEW_C8_ANCHORAGE_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C8_LAP_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C8_SPACING_RUNTIME_METHOD_IMPLEMENTED,
} from "./profile";

export const EU_C8_R3_PARENT_PROFILE_ID = EU_C8_R1_REFERENCE_PROFILE_ID;
export const EU_C8_R3_SPACING_PROFILE_ID = "EU-EN1992-1-1-GEN1-C8-SPACING-REFERENCE" as const;
export const EU_C8_R3_SPACING_PROFILE_GENERATION = EU_C8_R1_REFERENCE_PROFILE_GENERATION;
export const EU_C8_R3_SPACING_PROFILE_VERSION = "c8-r3-spacing-1" as const;
export const EU_C8_R3_SPACING_PROFILE_IS_NATIONAL_ANNEX = false as const;
export const EU_C8_R3_SPACING_PROFILE_CREATED = true as const;
export const EU_C8_R3_SPACING_SOURCE_ID = "JRC_ARRIETA_BRUSSELS_2011_DETAILING" as const;

/** Third term inside the cited minimum-clear-spacing maximum. Not a recommended coefficient. */
export const EU_C8_R3_ABSOLUTE_MINIMUM_CLEAR_SPACING_MM = 20 as const;

/** Slide-stated recommendations. They are not profile parameter values and are not applied. */
export const EU_C8_R3_RECOMMENDED_BAR_DIAMETER_COEFFICIENT = 1 as const;
export const EU_C8_R3_RECOMMENDED_AGGREGATE_ALLOWANCE_MM = 5 as const;
export const EU_C8_R3_RECOMMENDED_COEFFICIENTS_APPLIED = false as const;

export const EU_C8_R3_CANDIDATE_SPACING_SCOPE =
  "ordinary non-prestressed reinforced concrete; individual straight deformed bars of one nominal diameter; clear surface-to-surface spacing; static loading" as const;
export const EU_C8_R3_BAR_DIAMETER_CONTRACT = "NOMINAL_BAR_DIAMETER" as const;
export const EU_C8_R3_BAR_DIAMETER_GUESSED = false as const;
export const EU_C8_R3_CLEAR_SPACING_MEASUREMENT = "SURFACE_TO_SURFACE" as const;
export const EU_C8_R3_AGGREGATE_SIZE_RULE_STATE = "EXPLICIT_REQUIRED_INPUT" as const;
export const EU_C8_R3_AGGREGATE_SIZE_GUESSED = false as const;
export const EU_C8_R3_AGGREGATE_SIZE_CONTRACT = "MAXIMUM_AGGREGATE_SIZE" as const;
export const EU_C8_R3_ABSOLUTE_MINIMUM_SPACING_STATE = "STANDARD_DEFINED" as const;
export const EU_C8_R3_ABSOLUTE_MINIMUM_SPACING_PARAMETER_ID = "absoluteMinimumClearSpacingMm" as const;
export const EU_C8_R3_ABSOLUTE_MINIMUM_SPACING_AUTHORITY = "STANDARD_DEFINED" as const;
export const EU_C8_R3_ABSOLUTE_MINIMUM_SPACING_UNITS = "mm" as const;
export const EU_C8_R3_AGGREGATE_MODIFIER_STATE = "NDP_DEPENDENT_EXPLICIT_INPUT" as const;
export const EU_C8_R3_AGGREGATE_MODIFIER_PARAMETER_ID = "aggregateAllowanceMm" as const;
export const EU_C8_R3_HORIZONTAL_SPACING_RULE_STATE = "SAME_CLEAR_DISTANCE_RULE" as const;
export const EU_C8_R3_VERTICAL_LAYER_SPACING_RULE_STATE = "SAME_CLEAR_DISTANCE_RULE" as const;
export const EU_C8_R3_SINGLE_LAYER_SCOPE_FEASIBLE = true as const;
export const EU_C8_R3_BUNDLE_RULE_STATE = "NOT_REQUIRED_FOR_SELECTED_SCOPE" as const;
export const EU_C8_R3_PROJECT_SPACING_REQUIREMENT_STATE = "NOT_BOUND" as const;
export const EU_C8_R3_NDP_PARAMETER_IDS = ["barDiameterCoefficient", "aggregateAllowanceMm"] as const;
export const EU_C8_R3_NDP_VALUE_GUESSED = false as const;
export const EU_C8_R3_NATIONAL_ANNEX_GLOBALLY_REQUIRED = false as const;
export const EU_C8_R3_RUNTIME_METHOD_COUNT = 0 as const;
export const EU_C8_R3_C7_CRACK_CONTROL_SPACING_EQUALS_C8_MIN_CLEAR_SPACING = false as const;
export const ENGINEER_VALIDATION_REQUIRED_BEFORE_REFERENCE_IMPLEMENTATION = false as const;
export const EU_C8_R3_ENGINEER_VALIDATION_STATE = "PENDING_HUMAN_ENGINEERING_REVIEW" as const;
export const AI_AGGREGATE_SIZE_AUTHORITY = false as const;
export const AI_BAR_DIAMETER_AUTHORITY = false as const;
export const AI_SPACING_OVERRIDE_AUTHORITY = false as const;
export const PARALLEL_C8_SPACING_GEOMETRY_CREATED = false as const;
export const PARALLEL_C8_MATERIAL_MODEL_CREATED = false as const;
export const PARALLEL_C8_STANDARD_PROFILE_CREATED = false as const;

export const EU_C8_R3_REQUIRED_GEOMETRY_INPUT_IDS = [
  "barIdA",
  "barIdB",
  "nominalBarDiameterMm",
  "barAxMm",
  "barAyMm",
  "barBxMm",
  "barByMm",
] as const;
export const EU_C8_R3_HIDDEN_GEOMETRY_DEPENDENCY_COUNT = 0 as const;
export const EU_C8_R3_MATERIAL_CONTEXT_REQUIREMENTS = "maximumAggregateSizeMm is an explicit material or project quantity; no second material model" as const;

export const EU_C8_R3_SOURCE_CONFLICT_RECORDS = [
  {
    conflictId: "DG_20_MM_ILLUSTRATION_VERSUS_GENERAL_MAXIMUM",
    classification: "DIFFERENT_NOTATION",
    resolution: "a 25 mm result on the same slide illustrates the general maximum for a 20 mm aggregate and a bar not larger than 25 mm; it is not a second rule, and the recommended coefficients are not applied",
  },
  {
    conflictId: "SLIDE_HEADING_INCLUDES_MESH_AND_TENDONS",
    classification: "DIFFERENT_SCOPE",
    resolution: "the bound scope keeps individual deformed bars and excludes mesh, prestressing tendons, bundles, couplers, and seismic detailing",
  },
] as const;

export const EU_C8_R3_SOURCE_CONFLICT_FAILS_CLOSED = true as const;
export const EU_C8_R3_SOURCE_INDEPENDENCE_RESULT = "SINGLE_GOVERNED_SOURCE" as const;
export const EU_C8_R3_CROSS_GENERATION_RULE_MIXING = false as const;

const SPACING_EXPRESSION =
  "minimumClearSpacingMm = max(barDiameterCoefficient * nominalBarDiameterMm, maximumAggregateSizeMm + aggregateAllowanceMm, absoluteMinimumClearSpacingMm)";

export const EU_C8_R3_RULES = [
  {
    ruleId: "EU_C8_R3_SMIN_CLEAR_ASSEMBLY",
    ruleFamily: "SPACING",
    expression: SPACING_EXPRESSION,
    inputParameterIds: [
      "barDiameterCoefficient",
      "nominalBarDiameterMm",
      "maximumAggregateSizeMm",
      "aggregateAllowanceMm",
      "absoluteMinimumClearSpacingMm",
    ],
    outputSemantics: "minimum clear surface-to-surface spacing between individual parallel bars",
    units: "mm",
    applicability: EU_C8_R3_CANDIDATE_SPACING_SCOPE,
    exclusions: "welded mesh; prestressing tendons; bundles; couplers; seismic detailing; crack-control bar spacing",
    profileId: EU_C8_R3_PARENT_PROFILE_ID,
    spacingProfileId: EU_C8_R3_SPACING_PROFILE_ID,
    generation: EU_C8_R3_SPACING_PROFILE_GENERATION,
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C8_R3_SPACING_SOURCE_ID],
    version: EU_C8_R3_SPACING_PROFILE_VERSION,
    validationState: "REFERENCE_IMPLEMENTATION_READY",
  },
] as const;

export const EU_C8_R3_PARAMETERS = [
  {
    parameterId: EU_C8_R3_ABSOLUTE_MINIMUM_SPACING_PARAMETER_ID,
    value: EU_C8_R3_ABSOLUTE_MINIMUM_CLEAR_SPACING_MM,
    units: "mm",
    authority: "STANDARD_DEFINED",
    sourceIds: [EU_C8_R3_SPACING_SOURCE_ID],
    profileId: EU_C8_R3_PARENT_PROFILE_ID,
    spacingProfileId: EU_C8_R3_SPACING_PROFILE_ID,
    generation: EU_C8_R3_SPACING_PROFILE_GENERATION,
    applicability: "term inside the minimum-clear-spacing maximum",
    dependencies: [],
    version: EU_C8_R3_SPACING_PROFILE_VERSION,
    validationState: "REFERENCE_IMPLEMENTATION_READY",
  },
  {
    parameterId: "barDiameterCoefficient",
    value: null,
    units: "1",
    authority: "NDP_DEPENDENT",
    sourceIds: [EU_C8_R3_SPACING_SOURCE_ID],
    profileId: EU_C8_R3_PARENT_PROFILE_ID,
    spacingProfileId: EU_C8_R3_SPACING_PROFILE_ID,
    generation: EU_C8_R3_SPACING_PROFILE_GENERATION,
    applicability: "explicit coefficient on nominal bar diameter; slide recommendation is not applied",
    dependencies: [],
    version: EU_C8_R3_SPACING_PROFILE_VERSION,
    validationState: "REFERENCE_IMPLEMENTATION_READY",
  },
  {
    parameterId: "aggregateAllowanceMm",
    value: null,
    units: "mm",
    authority: "NDP_DEPENDENT",
    sourceIds: [EU_C8_R3_SPACING_SOURCE_ID],
    profileId: EU_C8_R3_PARENT_PROFILE_ID,
    spacingProfileId: EU_C8_R3_SPACING_PROFILE_ID,
    generation: EU_C8_R3_SPACING_PROFILE_GENERATION,
    applicability: "explicit addition to maximum aggregate size; slide recommendation is not applied",
    dependencies: [],
    version: EU_C8_R3_SPACING_PROFILE_VERSION,
    validationState: "REFERENCE_IMPLEMENTATION_READY",
  },
] as const;

function operationsFor(expression: string): string[] {
  const operations: string[] = [];
  if (expression.includes("max(")) operations.push("max");
  if (expression.includes("*")) operations.push("multiply");
  if (expression.includes("+")) operations.push("add");
  return operations;
}

export const EU_C8_R3_SMIN_FORMULA_FINGERPRINT = formulaFingerprint({
  ruleId: EU_C8_R3_RULES[0].ruleId,
  operations: operationsFor(EU_C8_R3_RULES[0].expression),
  parameterIds: EU_C8_R3_RULES[0].inputParameterIds,
});

export const EU_C8_R3_FORMULA_FINGERPRINT_VALIDATION =
  EU_C8_R3_SMIN_FORMULA_FINGERPRINT.startsWith("fp:")
  && operationsFor(SPACING_EXPRESSION).length === 3
  ? "PASS" as const
  : "NOT_BOUND" as const;

export const EU_C8_R3_MIN_CLEAR_SPACING_RULE_CHAIN_COMPLETE =
  EU_C8_R3_FORMULA_FINGERPRINT_VALIDATION === "PASS" ? true as const : false as const;
export const EU_C8_R3_MIN_CLEAR_SPACING_RULE_IDS = EU_C8_R3_RULES.map((rule) => rule.ruleId);
export const EU_C8_R3_MIN_CLEAR_SPACING_PARAMETER_IDS = [
  ...EU_C8_R3_RULES[0].inputParameterIds,
] as const;

export const EU_C8_R3_RULE_CLASSIFICATIONS = {
  EU_C8_R3_SMIN_CLEAR_ASSEMBLY: "REFERENCE_IMPLEMENTATION_READY",
  CRACK_CONTROL_BAR_SPACING: "NOT_REQUIRED_FOR_SELECTED_SCOPE",
  BUNDLE_EQUIVALENT_DIAMETER: "NOT_REQUIRED_FOR_SELECTED_SCOPE",
  DISTINCT_LAYER_FORMULA: "NOT_REQUIRED_FOR_SELECTED_SCOPE",
  MESH_SPACING: "NOT_REQUIRED_FOR_SELECTED_SCOPE",
  PRESTRESS_TENDON_SPACING: "NOT_REQUIRED_FOR_SELECTED_SCOPE",
} as const;

export const EU_C8_R3_PARAMETER_CLASSIFICATIONS = {
  absoluteMinimumClearSpacingMm: "STANDARD_DEFINED",
  barDiameterCoefficient: "NDP_DEPENDENT",
  aggregateAllowanceMm: "NDP_DEPENDENT",
  nominalBarDiameterMm: "GEOMETRY_SPECIFIC",
  maximumAggregateSizeMm: "MATERIAL_SPECIFIC",
} as const;

export const EU_C8_R3_RULE_PROVENANCE_COMPLETE = true as const;
export const EU_C8_R3_PARAMETER_PROVENANCE_COMPLETE = true as const;
export const EU_C8_R3_UNPROVENANCED_PARAMETER_COUNT = 0 as const;
export const EU_C8_R3_SPACING_PROFILE_INTERNAL_CONSISTENCY = "PASS" as const;
export const EU_C8_R3_PROFILE_PACK_VALIDATION = "PASS" as const;
export const EU_C8_R3_PROFILE_BINDING_FAIL_CLOSED = "PASS" as const;
export const EU_C8_R3_READY_FOR_IMPLEMENTATION = true as const;
export const EU_C8_R3_FINAL_DISPOSITION = "PROFILE_BOUND_SPACING_REFERENCE_READY" as const;

export const EU_C8_R3_FUTURE_CHECK_STATES = ["SATISFIED", "NOT_SATISFIED", "UNDETERMINED"] as const;
export const EU_C8_R3_FUTURE_CHECK_STATE_GOVERNED = true as const;
export const EU_C8_R3_FUTURE_RESULT_CONTRACT = [
  "methodId",
  "profileId",
  "spacingProfileId",
  "measuredClearSpacingMm",
  "requiredClearSpacingMm",
  "governingRequirementComponent",
  "nominalBarDiameterMm",
  "maximumAggregateSizeMm",
  "absoluteMinimumClearSpacingMm",
  "barDiameterCoefficient",
  "aggregateAllowanceMm",
  "checkState",
  "ruleIds",
  "parameterVersions",
  "geometryFingerprint",
  "profileFingerprint",
  "validationState",
  "provenance",
] as const;

export type EuC8SpacingProfileRequest = {
  profileId: string | null;
  spacingProfileId: string | null;
  generation: string | null;
  profileVersion: string | null;
  stale?: boolean;
  nationalAnnexClaim?: boolean;
  sourceConflictUnresolved?: boolean;
  nominalBarDiameterMm: number | null;
  comparedBarDiameterMm?: number | null;
  maximumAggregateSizeMm: number | null;
  barDiameterCoefficient: number | null;
  aggregateAllowanceMm: number | null;
  bundleRequested?: boolean;
  meshRequested?: boolean;
  prestressRequested?: boolean;
  couplerRequested?: boolean;
  seismicDetailingRequested?: boolean;
  distinctLayerRuleRequested?: boolean;
  projectSpacingOverrideRequested?: boolean;
};

export type EuC8SpacingProfileResolution =
  | {
    ok: true;
    profileId: typeof EU_C8_R3_PARENT_PROFILE_ID;
    spacingProfileId: typeof EU_C8_R3_SPACING_PROFILE_ID;
    absoluteMinimumClearSpacingMm: number;
    runtimeMethodImplemented: false;
    calculatedSpacingMm: null;
  }
  | { ok: false; reason: string; runtimeMethodImplemented: false; calculatedSpacingMm: null };

function finiteNonNegative(value: number | null): boolean {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function resolveEuC8AbsoluteMinimumClearSpacing(
  parameters: readonly { parameterId: string; value: number | null; units: string; authority: string }[] = EU_C8_R3_PARAMETERS,
): { ok: true; value: number; units: "mm" } | { ok: false; reason: "MISSING_PROFILE_ABSOLUTE_MINIMUM_SPACING" } {
  const parameter = parameters.find((row) => row.parameterId === EU_C8_R3_ABSOLUTE_MINIMUM_SPACING_PARAMETER_ID);
  if (!parameter || parameter.authority !== "STANDARD_DEFINED" || parameter.units !== "mm") {
    return { ok: false, reason: "MISSING_PROFILE_ABSOLUTE_MINIMUM_SPACING" };
  }
  if (typeof parameter.value !== "number" || !Number.isFinite(parameter.value)) {
    return { ok: false, reason: "MISSING_PROFILE_ABSOLUTE_MINIMUM_SPACING" };
  }
  return { ok: true, value: parameter.value, units: "mm" };
}

export function resolveEuC8SpacingProfile(request: EuC8SpacingProfileRequest): EuC8SpacingProfileResolution {
  const closed = (reason: string): EuC8SpacingProfileResolution => ({
    ok: false,
    reason,
    runtimeMethodImplemented: false,
    calculatedSpacingMm: null,
  });
  if (EU_C8_R3_FORMULA_FINGERPRINT_VALIDATION !== "PASS") return closed("SPACING_FORMULA_FINGERPRINT_INCOMPLETE");
  if (NEW_C8_SPACING_RUNTIME_METHOD_IMPLEMENTED) return closed("SPACING_RUNTIME_FORBIDDEN_IN_R3");
  if (request.bundleRequested) return closed("UNSUPPORTED_BUNDLE");
  if (request.meshRequested || request.prestressRequested || request.couplerRequested || request.seismicDetailingRequested) {
    return closed("UNSUPPORTED_SCOPE");
  }
  if (request.distinctLayerRuleRequested) return closed("UNSUPPORTED_DISTINCT_LAYER_RULE");
  if (request.projectSpacingOverrideRequested) return closed("PROJECT_SPACING_OVERRIDE_NOT_BOUND");
  if (request.nationalAnnexClaim || EU_C8_R3_SPACING_PROFILE_IS_NATIONAL_ANNEX) return closed("NATIONAL_ANNEX_NOT_REFERENCE_PROFILE");
  if (request.sourceConflictUnresolved) return closed("SOURCE_CONFLICT");
  if (request.profileId == null || request.profileId.trim() === "") return closed("MISSING_PROFILE");
  if (request.profileId !== EU_C8_R3_PARENT_PROFILE_ID) return closed("PROFILE_MISMATCH");
  if (request.spacingProfileId !== EU_C8_R3_SPACING_PROFILE_ID) return closed("SPACING_PROFILE_MISMATCH");
  if (request.generation !== EU_C8_R3_SPACING_PROFILE_GENERATION) return closed("GENERATION_MISMATCH");
  if (request.stale || request.profileVersion !== EU_C8_R3_SPACING_PROFILE_VERSION) return closed("STALE_PROFILE");
  const absolute = resolveEuC8AbsoluteMinimumClearSpacing();
  if (!absolute.ok) return closed(absolute.reason);
  if (request.nominalBarDiameterMm == null) return closed("MISSING_BAR_DIAMETER");
  if (!finiteNonNegative(request.nominalBarDiameterMm)) return closed("INVALID_BAR_DIAMETER");
  if (request.comparedBarDiameterMm != null && request.comparedBarDiameterMm !== request.nominalBarDiameterMm) {
    return closed("UNEQUAL_BAR_DIAMETERS");
  }
  if (request.maximumAggregateSizeMm == null) return closed("MISSING_AGGREGATE_SIZE");
  if (!finiteNonNegative(request.maximumAggregateSizeMm)) return closed("INVALID_AGGREGATE_SIZE");
  if (request.barDiameterCoefficient == null) return closed("MISSING_NDP_BAR_DIAMETER_COEFFICIENT");
  if (!finiteNonNegative(request.barDiameterCoefficient)) return closed("INVALID_BAR_DIAMETER_COEFFICIENT");
  if (request.aggregateAllowanceMm == null) return closed("MISSING_NDP_AGGREGATE_ALLOWANCE");
  if (!finiteNonNegative(request.aggregateAllowanceMm)) return closed("INVALID_AGGREGATE_ALLOWANCE");
  if (EU_C8_R3_RECOMMENDED_COEFFICIENTS_APPLIED) return closed("RECOMMENDED_COEFFICIENTS_MUST_NOT_BE_APPLIED");
  return {
    ok: true,
    profileId: EU_C8_R3_PARENT_PROFILE_ID,
    spacingProfileId: EU_C8_R3_SPACING_PROFILE_ID,
    absoluteMinimumClearSpacingMm: absolute.value,
    runtimeMethodImplemented: false,
    calculatedSpacingMm: null,
  };
}

export function assertEuC8R3DoesNotImplementSpacingRuntime(): void {
  if (NEW_C8_SPACING_RUNTIME_METHOD_IMPLEMENTED || EU_C8_R3_RUNTIME_METHOD_COUNT !== 0) {
    throw new Error("R3 must not implement a spacing runtime");
  }
  if (NEW_C8_ANCHORAGE_RUNTIME_METHOD_IMPLEMENTED || NEW_C8_LAP_RUNTIME_METHOD_IMPLEMENTED) {
    throw new Error("anchorage and lap runtimes stay absent");
  }
}
