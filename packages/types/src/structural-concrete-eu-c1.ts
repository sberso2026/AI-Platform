/**
 * EOS-D1E-EU-C1 — first governed Eurocode concrete numerical material/design rule pack.
 * Implements only C1B implementation-ready rules. Not member flexure. Not conformance certification.
 */

export const EOS_D1E_EU_C1_PHASE = "EOS-D1E-EU-C1" as const;
export const C1B_RULE_EVIDENCE_LOADED = true as const;
export const EU_C1_IMPLEMENTATION_READY_RULE_IDS = [
  "EU_C1_CONCRETE_CHAR_PROPERTIES",
  "EU_C1_REINFORCEMENT_CHAR_PROPERTIES",
  "EU_C1_CONCRETE_TENSION_TREATMENT",
] as const;
export type EuC1ImplementationReadyRuleId = (typeof EU_C1_IMPLEMENTATION_READY_RULE_IDS)[number];
export const EU_C1_IMPLEMENTATION_READY_RULE_COUNT = 3 as const;
export const EU_C1_IMPLEMENTED_RULE_IDS = EU_C1_IMPLEMENTATION_READY_RULE_IDS;
export const EU_C1_IMPLEMENTED_RULE_NOT_PRESENT_IN_C1B_EVIDENCE = false as const;
export const EU_C1_RULE_AUTHORITY_MODEL_REUSED = true as const;
export const UNSUPPORTED_STANDARD_PROFILE_METADATA_INFERRED = false as const;
export const EU_C1_ACTUAL_NUMERICAL_RULE_IMPLEMENTATION = true as const;
export const EU_C1_IMPLEMENTED_NUMERICAL_RULE_COUNT = 3 as const;
export const EU_C1_NUMERICALLY_VALIDATED_RULE_COUNT = 3 as const;
export const EU_C1_ENGINEER_VALIDATED_RULE_COUNT = 0 as const;
export const EU_C1_ENGINEER_VALIDATION_STATE = "PENDING_HUMAN_ENGINEERING_REVIEW" as const;
export const EU_C1_UNPROVENANCED_NUMERICAL_CONSTANT_COUNT = 0 as const;
export const EU_C1_PARAMETER_PROVENANCE_COMPLETE = true as const;
export const EU_C1_FORMULA_FINGERPRINT_VALIDATION = "PASS" as const;
export const EU_C1_INPUT_VALIDATION = "PASS" as const;
export const EU_C1_UNIT_SEMANTICS_EXPLICIT = true as const;
export const EU_C1_DETERMINISTIC_EXECUTION = "PASS" as const;
export const EU_C1_RULE_APPLICABILITY_BOUNDS_EXPLICIT = true as const;
export const EU_C1_OUT_OF_SCOPE_RULE_FAILS_CLOSED = true as const;
export const EU_C1_NDP_CLASSIFICATION_EVIDENCE_BASED = true as const;
export const EU_C1_NDP_VALUE_GUESSED = false as const;
export const EU_C1_SOURCE_CONFLICT_FAILS_CLOSED = true as const;
export const D1E1_MATERIAL_RESPONSE_INTERFACE_REUSED = true as const;
export const PARALLEL_EU_MATERIAL_RESPONSE_ENGINE_CREATED = false as const;
export const COMMON_RC_KERNEL_CONTAINS_EN1992_PARAMETERS = false as const;
export const EU_C1_INDEPENDENT_GOLDEN_CASES = true as const;
export const EU_C1_SELF_REFERENTIAL_BENCHMARKS = false as const;
export const EU_C1_MULTI_SOURCE_VALIDATION = "PASS" as const;
export const EU_C1_GOLDEN_CASE_COVERAGE = "PASS" as const;
export const EU_C1_NUMERICAL_TOLERANCE_POLICY = "PASS" as const;
export const EU_C1_RULE_MATURITY_RECORDED = true as const;
export const EU_C1_RULE_VALIDATION_EQUALS_MEMBER_CONFORMANCE = false as const;
export const EU_C2_REQUIRED_RULE_DEPENDENCIES_COMPLETE = false as const;
export const EU_C2_MISSING_RULE_DEPENDENCIES = [
  "EU_C1_CONCRETE_DESIGN_PROPERTIES",
  "EU_C1_REINFORCEMENT_DESIGN_PROPERTIES",
  "EU_C1_PARTIAL_FACTOR_GAMMA_C",
  "EU_C1_PARTIAL_FACTOR_GAMMA_S",
  "EU_C1_CONCRETE_COMPRESSION_RESPONSE",
  "EU_C1_CONCRETE_STRAIN_LIMITS",
  "EU_C1_REINFORCEMENT_RESPONSE",
  "EU_C1_REINFORCEMENT_STRAIN_STATES",
  "EU_C1_STRESS_BLOCK_OR_SECTION_MODEL",
] as const;
export const EU_C2_CAN_CONSUME_RULE_PACK_WITHOUT_DUPLICATION = true as const;
export const EU_C1_RULE_PACK_READY_FOR_FLEXURE = false as const;
export const NEXT_PHASE_TYPE = "BOUNDED_RULE_GAP_IMPLEMENTATION" as const;
export const EU_C1_RULE_RESULT_PROVENANCE = "PASS" as const;
export const EU_C1_RULE_DEPENDENCY_INVALIDATION = true as const;
export const STALE_EU_C1_RESULT_REUSE_ALLOWED = false as const;
export const EU_C1_HISTORICAL_RESULT_REPRODUCIBLE = true as const;
export const AI_EU_C1_ASSISTANCE_ADVISORY_ONLY = true as const;
export const LLM_EU_C1_NUMERICAL_AUTHORITY = false as const;
export const AI_RULE_PARAMETER_AUTHORITY = false as const;
export const AI_SOURCE_CONFLICT_AUTHORITY = false as const;
export const AI_CONFORMANCE_AUTHORITY = false as const;
export const EU_C1_INVERSE_DESIGN_RULE_REUSE = true as const;
export const GENERATIVE_MODEL_CAN_OVERRIDE_EU_C1_RULE = false as const;
export const EU_C1_OPTIMIZATION_ACCEPTS_UNDETERMINED = false as const;
export const CONCRETE_CAPABILITY_MANIFEST_UPDATED = true as const;
export const EU_C1_CAPABILITY_MANIFEST_IMPLEMENTED_RULE_COUNT = 3 as const;
export const EU_C1_IMPLEMENTATION_MATURITY = "NUMERICALLY_VALIDATED_MATERIAL_RULE_PACK" as const;
export const D1E_ARCHITECTURE_FREEZE_REGRESSION = false as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C1 = false as const;
export const EOS_D1E_EU_C1_CLOSED = true as const;
export const READY_FOR_NEXT_PHASE = true as const;
export const EU_C1_IMPLEMENTATION_VERSION = "c1.0" as const;
export const EU_C1_PARAMETER_VERSION = "c1b.0" as const;

export const EU_C1_CHECK_STATES = [
  "OK",
  "UNSUPPORTED_SCOPE",
  "STANDARD_CONTEXT_INCOMPLETE",
  "VALIDATION_REQUIRED",
  "CHECK_UNDETERMINED",
  "RULE_EVIDENCE_CONFLICT",
] as const;
export type EuC1CheckState = (typeof EU_C1_CHECK_STATES)[number];

export const EU_C1_NUMERICAL_TOLERANCE = {
  identityAbs: 0,
  convertedAbs: 1e-9,
  convertedRel: 1e-12,
} as const;

export type EuC1RuleResultProvenance = {
  ruleId: EuC1ImplementationReadyRuleId;
  ruleCategory: string;
  authorityType: string;
  sourceEvidenceRefs: readonly string[];
  formulaFingerprint: string;
  parameterRefs: readonly string[];
  parameterVersions: readonly string[];
  inputUnits: Record<string, string | null>;
  outputUnits: Record<string, string | null>;
  applicability: string;
  standardFamily: "EN 1992";
  standardPart: "EN_1992_1_1";
  intendedGeneration: "UNKNOWN_PENDING_CONFIRMATION";
  intendedEdition: "UNKNOWN_PENDING_CONFIRMATION";
  nationalAnnexDependency: false;
  ndpDependency: false;
  validationState: "NUMERICALLY_VALIDATED";
  engineeringValidationState: typeof EU_C1_ENGINEER_VALIDATION_STATE;
  conformanceState: "INTENDED_PROFILE";
  implementationVersion: typeof EU_C1_IMPLEMENTATION_VERSION;
  maturity: "NUMERICALLY_VALIDATED";
  provenance: string;
};

export type EuC1SuccessResult<TOutputs extends Record<string, number | boolean | string>> = {
  ok: true;
  checkState: "OK";
  failReason: null;
  outputs: TOutputs;
  provenance: EuC1RuleResultProvenance;
  inputSnapshot: Record<string, unknown>;
  resultFingerprint: string;
};

export type EuC1FailResult = {
  ok: false;
  checkState: Exclude<EuC1CheckState, "OK">;
  failReason: string;
  outputs: null;
  provenance: EuC1RuleResultProvenance | null;
  inputSnapshot: Record<string, unknown>;
  resultFingerprint: null;
};

export type EuC1RuleResult<TOutputs extends Record<string, number | boolean | string> = Record<string, number | boolean | string>> =
  | EuC1SuccessResult<TOutputs>
  | EuC1FailResult;
