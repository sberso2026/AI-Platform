/**
 * EOS-D1E-EU-C8-R1 cover-assembly profile.
 * Spacing, anchorage, and lap expressions were not recovered cleanly and are not bound.
 * No cover, spacing, anchorage, or lap runtime method is implemented here.
 */

export const EU_C8_R1_REFERENCE_PROFILE_ID = "EU-EN1992-1-1-GEN1-C8-DETAILING-REFERENCE" as const;
export const EU_C8_R1_REFERENCE_PROFILE_GENERATION = "EN1992-1-1-GEN1" as const;
export const EU_C8_R1_REFERENCE_PROFILE_VERSION = "c8-r1-cover-assembly-1" as const;
export const EU_C8_R1_REFERENCE_PROFILE_IS_NATIONAL_ANNEX = false as const;
export const EU_C8_R1_REFERENCE_PROFILE_CREATED = true as const;

export const EU_C8_R1_COVER_SOURCE_ID = "JRC_BOUCHON_VIENNA_2010_EN1992_COVER" as const;
export const EU_C8_R1_DETAILING_SOURCE_ID = "JRC_ARRIETA_BRUSSELS_2011_DETAILING" as const;

/** Absolute term inside the cited minimum-cover maximum. Not a deviation allowance. */
export const EU_C8_R1_CMIN_ABSOLUTE_MM = 10 as const;
export const EU_C8_R1_DEVIATION_ALLOWANCE_MM = null;
export const EU_C8_R1_DEVIATION_ALLOWANCE_DEFAULTED = false as const;
export const EU_C8_R1_CMIN_B_DERIVED_FROM_DIAMETER = false as const;
export const EU_C8_R1_CMIN_DUR_DERIVED_FROM_EXPOSURE = false as const;
export const EU_C8_R1_EXPOSURE_CLASS_GUESSED = false as const;
export const EU_C8_R1_BOND_CONDITION_DEFAULTED = false as const;
export const EU_C8_R1_AGGREGATE_SIZE_GUESSED = false as const;
export const EU_C8_R1_NDP_VALUE_GUESSED = false as const;

export const EU_C8_R1_RUNTIME_METHOD_COUNT = 0 as const;
export const NEW_C8_COVER_RUNTIME_METHOD_IMPLEMENTED = false as const;
export const NEW_C8_SPACING_RUNTIME_METHOD_IMPLEMENTED = false as const;
export const NEW_C8_ANCHORAGE_RUNTIME_METHOD_IMPLEMENTED = false as const;
export const NEW_C8_LAP_RUNTIME_METHOD_IMPLEMENTED = false as const;

export const EU_C8_R1_COVER_DURABILITY_PROFILE_COMPLETE = true as const;
export const EU_C8_R1_COVER_CHECK_PROFILE_COMPLETE = true as const;
export const EU_C8_R1_SPACING_DETAILING_PROFILE_COMPLETE = false as const;
export const EU_C8_R1_SPACING_PROFILE_COMPLETE = false as const;
export const EU_C8_R1_ANCHORAGE_PROFILE_COMPLETE = false as const;
export const EU_C8_R1_LAP_PROFILE_COMPLETE = false as const;
export const EU_C8_R1_STRAIGHT_BAR_ONLY_SCOPE_FEASIBLE = false as const;

export const EU_C8_R1_FORMULA_FINGERPRINT = "C8-R1-COVER-ASSEMBLY-1" as const;
export const EU_C8_R1_FORMULA_FINGERPRINT_VALIDATION = "PARTIAL" as const;
export const EU_C8_R1_COVER_FORMULA_FINGERPRINT_VALIDATION = "PASS" as const;
export const EU_C8_R1_PROFILE_PACK_VALIDATION = "PASS_FOR_COVER_ASSEMBLY" as const;
export const EU_C8_R1_PROFILE_INTERNAL_CONSISTENCY = "PASS" as const;
export const EU_C8_R1_PROFILE_BINDING_FAIL_CLOSED = "PASS" as const;
export const EU_C8_R1_CROSS_GENERATION_RULE_MIXING = false as const;
export const EU_C8_R1_RULE_PROVENANCE_COMPLETE = true as const;
export const EU_C8_R1_PARAMETER_PROVENANCE_COMPLETE = true as const;
export const EU_C8_R1_UNPROVENANCED_PARAMETER_COUNT = 0 as const;
export const EU_C8_R1_SOURCE_CONFLICT_FAILS_CLOSED = true as const;

export const EU_C8_R1_FIRST_IMPLEMENTATION_CAPABILITY = "COVER_DURABILITY" as const;
export const EU_C8_R1_READY_FOR_IMPLEMENTATION = true as const;
export const EU_C8_R1_NEXT_PHASE = "EOS-D1E-EU-C8-R2-COVER-DURABILITY" as const;
export const EU_C8_R1_ENGINEER_VALIDATION_STATE = "PENDING_HUMAN_ENGINEERING_REVIEW" as const;

export const AI_C8_ASSISTANCE_ADVISORY_ONLY = true as const;
export const LLM_C8_NUMERICAL_AUTHORITY = false as const;
export const AI_C8_RULE_PARAMETER_AUTHORITY = false as const;
export const AI_C8_EXPOSURE_CLASS_AUTHORITY = false as const;
export const AI_C8_NDP_AUTHORITY = false as const;
export const AI_C8_BOND_CONDITION_AUTHORITY = false as const;
export const AI_C8_BAR_DETAILING_AUTHORITY = false as const;
export const AI_C8_CHECK_OVERRIDE_AUTHORITY = false as const;
export const AI_C8_CONFORMANCE_AUTHORITY = false as const;
export const AI_C8_ENGINEERING_APPROVAL = false as const;

export const EU_C8_R1_RULES = [
  {
    ruleId: "EU_C8_R1_CMIN_ASSEMBLY",
    ruleFamily: "COVER",
    expression: "cminMm = max(bondCoverComponentMm, durabilityCoverComponentMm, absoluteMinimumCoverMm)",
    inputParameterIds: ["bondCoverComponentMm", "durabilityCoverComponentMm", "absoluteMinimumCoverMm"],
    outputSemantics: "minimum cover to the bar surface before execution deviation",
    units: "mm",
    applicability: "ordinary reinforced concrete; components supplied explicitly",
    exclusions: "durability lookup table; bond-cover-from-diameter; fire cover; prestress",
    profile: EU_C8_R1_REFERENCE_PROFILE_ID,
    generation: EU_C8_R1_REFERENCE_PROFILE_GENERATION,
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C8_R1_COVER_SOURCE_ID],
    version: EU_C8_R1_REFERENCE_PROFILE_VERSION,
    validationState: "REFERENCE_IMPLEMENTATION_READY",
    formulaFingerprint: EU_C8_R1_FORMULA_FINGERPRINT,
  },
  {
    ruleId: "EU_C8_R1_CNOM_ASSEMBLY",
    ruleFamily: "COVER",
    expression: "nominalCoverMm = minimumCoverMm + deviationAllowanceMm",
    inputParameterIds: ["minimumCoverMm", "deviationAllowanceMm"],
    outputSemantics: "nominal cover used by the future provided-cover check",
    units: "mm",
    applicability: "explicit non-negative deviation allowance",
    exclusions: "recommended deviation is not applied automatically",
    profile: EU_C8_R1_REFERENCE_PROFILE_ID,
    generation: EU_C8_R1_REFERENCE_PROFILE_GENERATION,
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C8_R1_COVER_SOURCE_ID],
    version: EU_C8_R1_REFERENCE_PROFILE_VERSION,
    validationState: "REFERENCE_IMPLEMENTATION_READY",
    formulaFingerprint: EU_C8_R1_FORMULA_FINGERPRINT,
  },
] as const;

export const EU_C8_R1_PARAMETERS = [
  {
    parameterId: "absoluteMinimumCoverMm",
    value: EU_C8_R1_CMIN_ABSOLUTE_MM,
    units: "mm",
    authority: "STANDARD_DEFINED",
    sourceIds: [EU_C8_R1_COVER_SOURCE_ID],
    profile: EU_C8_R1_REFERENCE_PROFILE_ID,
    generation: EU_C8_R1_REFERENCE_PROFILE_GENERATION,
    applicability: "term inside the minimum-cover maximum",
    dependencies: [],
    version: EU_C8_R1_REFERENCE_PROFILE_VERSION,
    validationState: "REFERENCE_IMPLEMENTATION_READY",
  },
] as const;

export const EU_C8_R1_SOURCE_CONFLICT_RECORDS = [
  {
    conflictId: "CMIN_B_DIAMETER_VERSUS_BRIDGE_FACE",
    classification: "DIFFERENT_SCOPE",
    resolution: "bond cover remains an explicit input",
  },
] as const;

export type EuC8CoverAssemblyRequest = {
  profileId: string;
  generation: string;
  bondCoverComponentMm: number | null;
  durabilityCoverComponentMm: number | null;
  deviationAllowanceMm: number | null;
  exposureClass?: string | null;
};

export type EuC8CoverAssemblyResolution =
  | { ok: true; profileId: typeof EU_C8_R1_REFERENCE_PROFILE_ID; absoluteMinimumCoverMm: 10; runtimeMethodImplemented: false }
  | { ok: false; reason: string };

export function resolveEuC8CoverAssemblyProfile(request: EuC8CoverAssemblyRequest): EuC8CoverAssemblyResolution {
  if (request.profileId !== EU_C8_R1_REFERENCE_PROFILE_ID) return { ok: false, reason: "PROFILE_MISMATCH" };
  if (request.generation !== EU_C8_R1_REFERENCE_PROFILE_GENERATION) return { ok: false, reason: "GENERATION_MISMATCH" };
  if (request.bondCoverComponentMm == null) return { ok: false, reason: "MISSING_BOND_COVER" };
  if (request.durabilityCoverComponentMm == null) return { ok: false, reason: "MISSING_DURABILITY_COVER" };
  if (request.deviationAllowanceMm == null) return { ok: false, reason: "MISSING_DEVIATION_ALLOWANCE" };
  if (request.exposureClass != null && request.durabilityCoverComponentMm == null) return { ok: false, reason: "EXPOSURE_DOES_NOT_SUPPLY_DURABILITY_COVER" };
  return {
    ok: true,
    profileId: EU_C8_R1_REFERENCE_PROFILE_ID,
    absoluteMinimumCoverMm: EU_C8_R1_CMIN_ABSOLUTE_MM,
    runtimeMethodImplemented: false,
  };
}

export function resolveEuC8UnboundSubPack(subPack: "SPACING" | "ANCHORAGE" | "LAP"): { ok: false; reason: "SUBPACK_NOT_READY" } {
  void subPack;
  return { ok: false, reason: "SUBPACK_NOT_READY" };
}
