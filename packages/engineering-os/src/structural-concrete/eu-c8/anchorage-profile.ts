import { formulaFingerprint } from "../eu-c1b/fingerprint";
import {
  EU_C8_R1_DETAILING_SOURCE_ID,
  EU_C8_R1_REFERENCE_PROFILE_GENERATION,
  EU_C8_R1_REFERENCE_PROFILE_ID,
  NEW_C8_ANCHORAGE_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C8_LAP_RUNTIME_METHOD_IMPLEMENTED,
} from "./profile";

/**
 * C8-R4 binds one basic required straight-bar anchorage reference.
 * Design-length factors and the bond-stress product stay unbound.
 * This module does not calculate an anchorage length.
 */

export const EU_C8_R4_PARENT_PROFILE_ID = EU_C8_R1_REFERENCE_PROFILE_ID;
export const EU_C8_R4_PARENT_PROFILE_REUSED = true as const;
export const PARALLEL_C8_STANDARD_PROFILE_CREATED = false as const;
export const EU_C8_R4_ANCHORAGE_PROFILE_ID = "EU-EN1992-1-1-GEN1-C8-ANCHORAGE-BASIC-REFERENCE" as const;
export const EU_C8_R4_ANCHORAGE_PROFILE_GENERATION = EU_C8_R1_REFERENCE_PROFILE_GENERATION;
export const EU_C8_R4_ANCHORAGE_PROFILE_VERSION = "c8-r4-basic-anchorage-1" as const;
export const EU_C8_R4_ANCHORAGE_PROFILE_CREATED = true as const;
export const EU_C8_R4_ANCHORAGE_PROFILE_IS_NATIONAL_ANNEX = false as const;
export const EU_C8_R4_SELECTED_METHOD_ID = "EU_RC_BASIC_REQUIRED_ANCHORAGE_EN1992_REFERENCE" as const;
export const EU_C8_R4_SELECTED_CAPABILITY_LEVEL = "BASIC_REQUIRED_STRAIGHT_BAR_ANCHORAGE" as const;
export const EU_C8_R4_SOURCE_ID = EU_C8_R1_DETAILING_SOURCE_ID;
export const EU_C8_R4_SOURCE_CITATION =
  "JRC Eurocode 2 Background and Applications, Brussels, 20-21 October 2011, anchorage-length slides" as const;

export const EU_C8_R4_CANDIDATE_ANCHORAGE_SCOPE =
  "ORDINARY_NON_PRESTRESSED_RC_INDIVIDUAL_STRAIGHT_DEFORMED_BAR_TENSION" as const;
export const EU_C8_R4_LEVEL_A_FEASIBILITY = "YES" as const;
export const EU_C8_R4_LEVEL_B_FEASIBILITY = "NO" as const;
export const EU_C8_R4_BASIC_ANCHORAGE_ALLOWED_AS_INITIAL_CAPABILITY = true as const;
export const EU_C8_R4_FORCE_STATE_SCOPE = "TENSION_ONLY" as const;
export const EU_C8_R4_BAR_DIAMETER_CONTRACT = "NOMINAL_BAR_DIAMETER" as const;
export const EU_C8_R4_BAR_DIAMETER_GUESSED = false as const;
export const EU_C8_R4_DESIGN_STEEL_STRESS_ROUTE = "EXPLICIT_DESIGN_STEEL_STRESS" as const;
export const EU_C8_R4_FYD_AUTOMATICALLY_USED_AS_SIGMA_SD = false as const;
export const EU_C8_R4_DESIGN_STEEL_STRESS_SIGN_CONVENTION = "TENSION_MAGNITUDE" as const;
export const EU_C8_R4_BASIC_ANCHORAGE_RULE_ID = "EU_C8_R4_LB_RQD_BASIC" as const;
export const EU_C8_R4_BASIC_ANCHORAGE_RULE_CHAIN_COMPLETE = true as const;
export const EU_C8_R4_BASIC_EQUALS_DESIGN_ANCHORAGE_AUTOMATICALLY = false as const;
export const EU_C8_R4_DESIGN_BOND_STRENGTH_RULE_CHAIN_COMPLETE = false as const;
export const EU_C8_R4_EXPLICIT_FBD_FALLBACK_FEASIBLE = true as const;
export const EU_C8_R4_CONCRETE_TENSILE_PROPERTY_ROUTE = "NAMED_FCTD_DERIVATION_NOT_RECOVERED" as const;
export const EU_C8_R4_BOND_CONDITION_RULE_STATE = "DIAGRAM_VISIBLE_CLASSIFIER_NOT_BOUND" as const;
export const EU_C8_R4_BOND_CONDITION_CONTRACT = "NOT_REQUIRED_WHEN_DESIGN_BOND_STRENGTH_IS_EXPLICIT" as const;
export const EU_C8_R4_BOND_CONDITION_DEFAULTED = false as const;
export const EU_C8_R4_BAR_DIAMETER_BOND_FACTOR_STATE = "THRESHOLD_NAMED_COEFFICIENT_NOT_STATED" as const;
export const EU_C8_R4_BASIC_ANCHORAGE_UNIT_SEMANTICS_EXPLICIT = true as const;
export const EU_C8_R4_AVAILABLE_ANCHORAGE_LENGTH_CONTRACT = "EXPLICIT_SUPPLIED_LENGTH" as const;
export const EU_C8_R4_CRITICAL_SECTION_CONTRACT = "EXPLICIT_REFERENCE_REQUIRED_WHEN_CHECK_REQUESTED" as const;
export const AI_CRITICAL_SECTION_AUTHORITY = false as const;
export const EU_C8_R4_FUTURE_CHECK_STATE_GOVERNED = true as const;
export const EU_C8_R4_FUTURE_CHECK_STATES = ["SATISFIED", "NOT_SATISFIED", "UNDETERMINED"] as const;
export const EU_C8_R4_ANCHORAGE_AUTODESIGN_PLANNED = false as const;
export const EU_C8_R4_FUTURE_LAP_DEPENDS_ON_ANCHORAGE = true as const;
export const EU_C8_R4_RUNTIME_METHOD_COUNT = 0 as const;
export const C8_SPACING_ZERO_INPUT_DOMAIN_INFERRED_FOR_ANCHORAGE = false as const;
export const C8_REQUIRED_NOMINAL_COVER_EQUALS_ANCHORAGE_ACTUAL_COVER = false as const;
export const C8_SPACING_CHECK_RESULT_EQUALS_ANCHORAGE_CONFINEMENT_FACTOR = false as const;
export const PARALLEL_ANCHORAGE_ENGINE_CREATED = false as const;
export const PARALLEL_BOND_ENGINE_CREATED = false as const;
export const EU_C8_R4_NDP_VALUE_GUESSED = false as const;
export const EU_C8_R4_NATIONAL_ANNEX_GLOBALLY_REQUIRED = false as const;
export const EU_C8_R4_PROFILE_INTERNAL_CONSISTENCY = "PASS" as const;
export const EU_C8_R4_CROSS_GENERATION_RULE_MIXING = false as const;
export const EU_C8_R4_RULE_PROVENANCE_COMPLETE = true as const;
export const EU_C8_R4_PARAMETER_PROVENANCE_COMPLETE = true as const;
export const EU_C8_R4_UNPROVENANCED_PARAMETER_COUNT = 0 as const;
export const EU_C8_R4_PROFILE_PACK_VALIDATION = "PASS" as const;
export const EU_C8_R4_PROFILE_BINDING_FAIL_CLOSED = "PASS" as const;
export const EU_C8_R4_SOURCE_CONFLICT_FAILS_CLOSED = true as const;
export const EU_C8_R4_SOURCE_HIERARCHY_ENFORCED = true as const;
export const PUBLIC_SOURCE_AUTOMATICALLY_AUTHORITATIVE = false as const;
export const EU_C8_R4_RULE_AUTHORITY_POLICY_REUSED = true as const;
export const LLM_MEMORY_ONLY_RULE_ALLOWED = false as const;
export const EU_C8_R4_READY_FOR_IMPLEMENTATION = true as const;
export const EU_C8_R4_FINAL_DISPOSITION = "PROFILE_BOUND_BASIC_ANCHORAGE_REFERENCE_READY" as const;
export const EU_C8_R4_ENGINEER_VALIDATION_STATE = "PENDING_HUMAN_ENGINEERING_REVIEW" as const;
export const AI_DESIGN_BOND_STRENGTH_AUTHORITY = false as const;
export const AI_DESIGN_STEEL_STRESS_AUTHORITY = false as const;
export const AI_ANCHORAGE_OVERRIDE_AUTHORITY = false as const;
export const EU_C8_R4_FBD_DERIVATION_APPLIED = false as const;
export const EU_C8_R4_DESIGN_MODIFIERS_APPLIED = false as const;
export const EU_C8_R4_MINIMUM_ANCHORAGE_APPLIED = false as const;

export const EU_C8_R4_BASIC_ANCHORAGE_CANDIDATE_RULES = [
  {
    ruleId: EU_C8_R4_BASIC_ANCHORAGE_RULE_ID,
    status: "SELECTED",
    expression:
      "basicRequiredAnchorageLengthMm = (nominalBarDiameterMm / basicAnchorageDiameterDivisor) * (designSteelStressMPa / designBondStrengthMPa)",
  },
  {
    ruleId: "EU_C8_R4_FBD_PRODUCT",
    status: "NOT_SELECTED",
    expression: "design bond strength product visible; bar-diameter factor and tensile route not stated",
  },
  {
    ruleId: "EU_C8_R4_DESIGN_LENGTH_PRODUCT",
    status: "NOT_SELECTED",
    expression: "design length is a product of named factors and the basic length, floored by a minimum length",
  },
] as const;

export const EU_C8_R4_REQUIRED_RULE_IDS = [EU_C8_R4_BASIC_ANCHORAGE_RULE_ID] as const;
export const EU_C8_R4_BASIC_ANCHORAGE_REQUIRED_RULE_IDS = EU_C8_R4_REQUIRED_RULE_IDS;
export const EU_C8_R4_DESIGN_BOND_STRENGTH_REQUIRED_RULE_IDS = [] as const;

export const EU_C8_R4_DIAMETER_DIVISOR_PARAMETER_ID = "EU_C8_R4_BASIC_ANCHORAGE_DIAMETER_DIVISOR" as const;

export const EU_C8_R4_PARAMETERS = [
  {
    parameterId: EU_C8_R4_DIAMETER_DIVISOR_PARAMETER_ID,
    value: 4,
    units: "1",
    authority: "VALIDATED_ENGINEERING_REFERENCE",
    sources: [EU_C8_R4_SOURCE_ID],
    profile: EU_C8_R4_ANCHORAGE_PROFILE_ID,
    generation: EU_C8_R4_ANCHORAGE_PROFILE_GENERATION,
    applicability: "basic required tension anchorage length of one straight deformed bar",
    dependencies: [] as const,
    version: EU_C8_R4_ANCHORAGE_PROFILE_VERSION,
    validationState: "REFERENCE_BOUND",
    classification: "STANDARD_DEFINED",
  },
] as const;

export const EU_C8_R4_REQUIRED_PARAMETER_IDS = [
  EU_C8_R4_DIAMETER_DIVISOR_PARAMETER_ID,
  "nominalBarDiameterMm",
  "designSteelStressMPa",
  "designBondStrengthMPa",
] as const;
export const EU_C8_R4_BASIC_ANCHORAGE_REQUIRED_PARAMETER_IDS = EU_C8_R4_REQUIRED_PARAMETER_IDS;
export const EU_C8_R4_DESIGN_BOND_STRENGTH_REQUIRED_PARAMETER_IDS = ["designBondStrengthMPa"] as const;
export const EU_C8_R4_NDP_PARAMETER_IDS = [] as const;
export const EU_C8_R4_PROJECT_SPECIFIC_PARAMETER_IDS = [
  "designSteelStressMPa",
  "designBondStrengthMPa",
  "availableAnchorageLengthMm",
  "criticalSectionRef",
] as const;

export const EU_C8_R4_FORMULA_FINGERPRINT = formulaFingerprint({
  ruleId: EU_C8_R4_BASIC_ANCHORAGE_RULE_ID,
  operations: ["divide", "multiply"],
  parameterIds: [...EU_C8_R4_REQUIRED_PARAMETER_IDS],
});
export const EU_C8_R4_FORMULA_FINGERPRINT_VALIDATION = "PASS" as const;

export const EU_C8_R4_RULES = [
  {
    ruleId: EU_C8_R4_BASIC_ANCHORAGE_RULE_ID,
    ruleFamily: "BASIC_REQUIRED_ANCHORAGE_LENGTH",
    expression: EU_C8_R4_BASIC_ANCHORAGE_CANDIDATE_RULES[0].expression,
    inputs: ["nominalBarDiameterMm", "designSteelStressMPa", "designBondStrengthMPa", EU_C8_R4_DIAMETER_DIVISOR_PARAMETER_ID],
    outputs: ["basicRequiredAnchorageLengthMm"],
    units: { stress: "MPa", barDiameter: "mm", bondStrength: "MPa", length: "mm" },
    applicability: EU_C8_R4_CANDIDATE_ANCHORAGE_SCOPE,
    exclusions: [
      "hooks",
      "bends",
      "welded bars",
      "bundles",
      "compression anchorage",
      "seismic ductile anchorage",
      "prestressing",
      "design-length modification factors",
      "minimum design anchorage",
      "laps",
    ],
    profile: EU_C8_R4_ANCHORAGE_PROFILE_ID,
    generation: EU_C8_R4_ANCHORAGE_PROFILE_GENERATION,
    authority: "VALIDATED_ENGINEERING_REFERENCE",
    sources: [EU_C8_R4_SOURCE_ID],
    version: EU_C8_R4_ANCHORAGE_PROFILE_VERSION,
    validationState: "REFERENCE_BOUND",
    formulaFingerprint: EU_C8_R4_FORMULA_FINGERPRINT,
  },
] as const;

export const EU_C8_R4_RULE_CLASSIFICATIONS = {
  EU_C8_R4_LB_RQD_BASIC: "REFERENCE_IMPLEMENTATION_READY",
  EU_C8_R4_FBD_PRODUCT: "DEFERRED",
  EU_C8_R4_DESIGN_LENGTH_PRODUCT: "DEFERRED",
  EU_C8_R4_BAR_SHAPE_FACTOR: "NOT_REQUIRED_FOR_SELECTED_SCOPE",
  EU_C8_R4_COVER_CONFINEMENT_FACTOR: "DEFERRED",
  EU_C8_R4_TRANSVERSE_REINFORCEMENT_FACTOR: "DEFERRED",
  EU_C8_R4_WELDED_TRANSVERSE_BAR_FACTOR: "NOT_REQUIRED_FOR_SELECTED_SCOPE",
  EU_C8_R4_TRANSVERSE_PRESSURE_FACTOR: "NOT_REQUIRED_FOR_SELECTED_SCOPE",
  EU_C8_R4_MINIMUM_ANCHORAGE: "DEFERRED",
  EU_C8_R4_LAP_LENGTH: "NOT_REQUIRED_FOR_SELECTED_SCOPE",
} as const;

export const EU_C8_R4_PARAMETER_CLASSIFICATIONS = {
  EU_C8_R4_BASIC_ANCHORAGE_DIAMETER_DIVISOR: "STANDARD_DEFINED",
  nominalBarDiameterMm: "GEOMETRY_SPECIFIC",
  designSteelStressMPa: "PROJECT_SPECIFIC",
  designBondStrengthMPa: "PROJECT_SPECIFIC",
  availableAnchorageLengthMm: "PROJECT_SPECIFIC",
  criticalSectionRef: "PROJECT_SPECIFIC",
} as const;

export const EU_C8_R4_SOURCE_CONFLICT_RECORDS = [
  { id: "WORKED_BUILDING_LENGTH_TABLES", classification: "DIFFERENT_SCOPE" },
  { id: "SECTION_HEADING_MESH_AND_TENDONS", classification: "DIFFERENT_SCOPE" },
  { id: "DESIGN_LENGTH_FACTORS_UNQUANTIFIED", classification: "DIFFERENT_METHOD" },
] as const;

export const EU_C8_R4_SOURCE_INDEPENDENCE_RESULT = "SINGLE_GOVERNED_SOURCE" as const;

export const EU_C8_R4_DESIGN_ANCHORAGE_MODIFICATION_FAMILIES = [
  "BAR_SHAPE",
  "COVER_CONFINEMENT",
  "TRANSVERSE_REINFORCEMENT",
  "WELDED_TRANSVERSE_REINFORCEMENT",
  "TRANSVERSE_PRESSURE",
] as const;
export const EU_C8_R4_STRAIGHT_BAR_SHAPE_FACTOR_STATE = "NOT_REQUIRED_FOR_BASIC_REQUIRED_LENGTH" as const;
export const EU_C8_R4_COVER_CONFINEMENT_MODIFIER_STATE = "NAMED_EXPRESSION_NOT_RECOVERED" as const;
export const EU_C8_R4_TRANSVERSE_REINFORCEMENT_MODIFIER_STATE = "NAMED_EXPRESSION_NOT_RECOVERED" as const;
export const EU_C8_R4_WELDED_TRANSVERSE_BAR_MODIFIER_STATE = "NOT_REQUIRED_FOR_SELECTED_SCOPE" as const;
export const EU_C8_R4_TRANSVERSE_PRESSURE_MODIFIER_STATE = "NOT_REQUIRED_FOR_SELECTED_SCOPE" as const;
export const EU_C8_R4_MINIMUM_ANCHORAGE_RULE_STATE = "VISIBLE_COMPLETE_DEFERRED_WITH_DESIGN_ANCHORAGE" as const;

export const C1_RULES_REUSED_FOR_C8_R4 = [] as const;
export const C1_RULES_REQUIRING_C8_R4_EXTENSION = ["CONCRETE_TENSILE_DESIGN_PROPERTY_IF_FBD_IS_LATER_DERIVED"] as const;
export const NEW_C8_R4_MATERIAL_RULES_REQUIRED = false as const;

export const EU_C8_R4_FUTURE_RESULT_CONTRACT = [
  "methodId",
  "profileId",
  "barId",
  "nominalBarDiameterMm",
  "designSteelStressMPa",
  "designBondStrengthMPa",
  "basicRequiredAnchorageLengthMm",
  "availableAnchorageLengthMm",
  "checkState",
  "ruleIds",
  "parameterVersions",
  "materialFingerprint",
  "geometryFingerprint",
  "profileFingerprint",
  "validationState",
  "provenance",
] as const;

export const EU_C8_R4_BASIC_ANCHORAGE_FUTURE_RESULT_CONTRACT = {
  requiredBasicAnchorageLength: "basicRequiredAnchorageLengthMm",
  availableAnchorageLength: "availableAnchorageLengthMm",
  checkState: EU_C8_R4_FUTURE_CHECK_STATES,
} as const;

export type EuC8BasicAnchorageResolveInput = {
  profileId?: string | null;
  parentProfileId?: string | null;
  generation?: string | null;
  profileVersion?: string | null;
  staleProfile?: boolean;
  nationalAnnexClaim?: boolean;
  sourceConflictUnresolved?: boolean;
  nominalBarDiameterMm?: number | null;
  designSteelStressMPa?: number | null;
  designBondStrengthMPa?: number | null;
  reinforcementType?: string | null;
  barShape?: string | null;
  forceState?: string | null;
  deriveBondStrengthRequested?: boolean;
  substituteFydRequested?: boolean;
  bondConditionDefaultRequested?: boolean;
  useRequiredNominalCoverAsConfinement?: boolean;
  useSpacingCheckAsConfinement?: boolean;
  levelBModifierRequested?: boolean;
  lapRequested?: boolean;
  bundleRequested?: boolean;
  weldedRequested?: boolean;
  prestressRequested?: boolean;
  seismicRequested?: boolean;
  checkRequested?: boolean;
  availableAnchorageLengthMm?: number | null;
  criticalSectionRef?: string | null;
};

export type EuC8BasicAnchorageResolveResult =
  | {
      ok: true;
      profileId: typeof EU_C8_R4_ANCHORAGE_PROFILE_ID;
      methodId: typeof EU_C8_R4_SELECTED_METHOD_ID;
      runtimeMethodImplemented: false;
      calculatedBasicAnchorageLengthMm: null;
      designBondStrengthRoute: "EXPLICIT_GOVERNED_DESIGN_BOND_STRENGTH";
    }
  | { ok: false; reason: string };

export function resolveEuC8BasicAnchorageDiameterDivisor(
  rows: readonly { parameterId: string; value: number | null; units: string; authority?: string; sources?: readonly string[] }[] = EU_C8_R4_PARAMETERS,
):
  | {
      ok: true;
      parameterId: typeof EU_C8_R4_DIAMETER_DIVISOR_PARAMETER_ID;
      value: number;
      units: "1";
      authority: string;
      sources: readonly string[];
    }
  | { ok: false; reason: "MISSING_PROFILE_DIAMETER_DIVISOR" | "INVALID_PROFILE_DIAMETER_DIVISOR" } {
  const row = rows.find((item) => item.parameterId === EU_C8_R4_DIAMETER_DIVISOR_PARAMETER_ID);
  if (!row || typeof row.value !== "number" || !Number.isFinite(row.value)) {
    return { ok: false, reason: "MISSING_PROFILE_DIAMETER_DIVISOR" };
  }
  if (!(row.value > 0) || row.units !== EU_C8_R4_PARAMETERS[0].units) {
    return { ok: false, reason: "INVALID_PROFILE_DIAMETER_DIVISOR" };
  }
  return {
    ok: true,
    parameterId: EU_C8_R4_DIAMETER_DIVISOR_PARAMETER_ID,
    value: row.value,
    units: "1",
    authority: row.authority ?? EU_C8_R4_PARAMETERS[0].authority,
    sources: row.sources ?? EU_C8_R4_PARAMETERS[0].sources,
  };
}

function finiteNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function resolveEuC8BasicAnchorageProfile(
  input: EuC8BasicAnchorageResolveInput,
): EuC8BasicAnchorageResolveResult {
  if (input.staleProfile) return { ok: false, reason: "STALE_PROFILE" };
  if (input.profileId !== EU_C8_R4_ANCHORAGE_PROFILE_ID) return { ok: false, reason: "PROFILE_MISMATCH" };
  if (input.parentProfileId !== EU_C8_R4_PARENT_PROFILE_ID) return { ok: false, reason: "PROFILE_MISMATCH" };
  if (input.generation !== EU_C8_R4_ANCHORAGE_PROFILE_GENERATION) return { ok: false, reason: "GENERATION_MISMATCH" };
  if (input.profileVersion !== EU_C8_R4_ANCHORAGE_PROFILE_VERSION) return { ok: false, reason: "PROFILE_VERSION_MISMATCH" };
  if (input.nationalAnnexClaim) return { ok: false, reason: "NATIONAL_ANNEX_NOT_ESTABLISHED" };
  if (input.sourceConflictUnresolved) return { ok: false, reason: "SOURCE_CONFLICT" };
  if (EU_C8_R4_PARAMETERS.length !== 1 || !(EU_C8_R4_PARAMETERS[0].value > 0)) {
    return { ok: false, reason: "MISSING_PROFILE_DIAMETER_DIVISOR" };
  }
  if (input.reinforcementType !== "DEFORMED_BAR") return { ok: false, reason: "UNSUPPORTED_REINFORCEMENT_TYPE" };
  if (input.barShape !== "STRAIGHT") return { ok: false, reason: "UNSUPPORTED_BAR_SHAPE" };
  if (input.forceState !== "TENSION") return { ok: false, reason: "UNSUPPORTED_FORCE_STATE" };
  if (input.bundleRequested) return { ok: false, reason: "BUNDLES_NOT_BOUND" };
  if (input.weldedRequested) return { ok: false, reason: "WELDED_BARS_NOT_BOUND" };
  if (input.prestressRequested) return { ok: false, reason: "PRESTRESS_NOT_BOUND" };
  if (input.seismicRequested) return { ok: false, reason: "SEISMIC_ANCHORAGE_NOT_BOUND" };
  if (input.substituteFydRequested) return { ok: false, reason: "FYD_NOT_SUBSTITUTED_FOR_SIGMA_SD" };
  if (input.deriveBondStrengthRequested || EU_C8_R4_FBD_DERIVATION_APPLIED) {
    return { ok: false, reason: "BOND_STRENGTH_DERIVATION_NOT_BOUND" };
  }
  if (input.bondConditionDefaultRequested || EU_C8_R4_BOND_CONDITION_DEFAULTED) {
    return { ok: false, reason: "BOND_CONDITION_NOT_DEFAULTED" };
  }
  if (input.levelBModifierRequested || EU_C8_R4_DESIGN_MODIFIERS_APPLIED || EU_C8_R4_MINIMUM_ANCHORAGE_APPLIED) {
    return { ok: false, reason: "DESIGN_ANCHORAGE_MODIFIERS_NOT_BOUND" };
  }
  if (input.useRequiredNominalCoverAsConfinement || C8_REQUIRED_NOMINAL_COVER_EQUALS_ANCHORAGE_ACTUAL_COVER) {
    return { ok: false, reason: "COVER_ASSEMBLY_NOT_ANCHORAGE_COVER" };
  }
  if (input.useSpacingCheckAsConfinement || C8_SPACING_CHECK_RESULT_EQUALS_ANCHORAGE_CONFINEMENT_FACTOR) {
    return { ok: false, reason: "SPACING_CHECK_NOT_CONFINEMENT_FACTOR" };
  }
  if (input.lapRequested || NEW_C8_LAP_RUNTIME_METHOD_IMPLEMENTED) return { ok: false, reason: "LAP_NOT_BOUND" };
  if (NEW_C8_ANCHORAGE_RUNTIME_METHOD_IMPLEMENTED || EU_C8_R4_RUNTIME_METHOD_COUNT !== 0) {
    return { ok: false, reason: "ANCHORAGE_RUNTIME_NOT_IN_SCOPE" };
  }
  if (!finiteNumber(input.nominalBarDiameterMm) || input.nominalBarDiameterMm <= 0) {
    return { ok: false, reason: "MISSING_BAR_DIAMETER" };
  }
  if (!finiteNumber(input.designSteelStressMPa) || input.designSteelStressMPa < 0) {
    return { ok: false, reason: "MISSING_DESIGN_STEEL_STRESS" };
  }
  if (!finiteNumber(input.designBondStrengthMPa) || input.designBondStrengthMPa <= 0) {
    return { ok: false, reason: "MISSING_DESIGN_BOND_STRENGTH" };
  }
  if (input.checkRequested) {
    if (!finiteNumber(input.availableAnchorageLengthMm) || input.availableAnchorageLengthMm < 0) {
      return { ok: false, reason: "MISSING_AVAILABLE_ANCHORAGE_LENGTH" };
    }
    if (!input.criticalSectionRef) return { ok: false, reason: "MISSING_CRITICAL_SECTION" };
  }
  return {
    ok: true,
    profileId: EU_C8_R4_ANCHORAGE_PROFILE_ID,
    methodId: EU_C8_R4_SELECTED_METHOD_ID,
    runtimeMethodImplemented: false,
    calculatedBasicAnchorageLengthMm: null,
    designBondStrengthRoute: "EXPLICIT_GOVERNED_DESIGN_BOND_STRENGTH",
  };
}
