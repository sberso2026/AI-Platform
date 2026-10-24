/**
 * EOS-D1E-EU-C1C-RESUME-1 — bounded numerical implementation of C1C-EVIDENCE ready rules.
 * Four NDP-dependent design-property/partial-factor rules only. Not flexure. Not conformance.
 */

export const EOS_D1E_EU_C1C_R1_PHASE = "EOS-D1E-EU-C1C-RESUME-1" as const;
export const EU_C1C_R1_GOVERNED_EVIDENCE_LOADED = true as const;
export const EU_C1C_R1_TARGET_RULE_IDS = [
  "EU_C1_PARTIAL_FACTOR_GAMMA_C",
  "EU_C1_PARTIAL_FACTOR_GAMMA_S",
  "EU_C1_CONCRETE_DESIGN_PROPERTIES",
  "EU_C1_REINFORCEMENT_DESIGN_PROPERTIES",
] as const;
export type EuC1cR1TargetRuleId = (typeof EU_C1C_R1_TARGET_RULE_IDS)[number];
export const EU_C1C_R1_TARGET_RULE_COUNT = 4 as const;
export const EU_C1C_PARTIAL_IMPLEMENTATION_RESUME_GATE = "PASS" as const;
export const EU_C1C_R1_RULE_AUTHORITY_MODEL_REUSED = true as const;
export const EU_C1C_R1_IMPLEMENTED_RULE_WITHOUT_GOVERNED_EVIDENCE = false as const;
export const EU_C1C_R1_GAMMA_C_IMPLEMENTED = true as const;
export const EU_C1C_R1_GAMMA_C_DEPENDENCY_CLASS = "NDP_DEPENDENT" as const;
export const EU_C1C_R1_GAMMA_C_VALUE_GUESSED = false as const;
export const EU_C1C_R1_GAMMA_S_IMPLEMENTED = true as const;
export const EU_C1C_R1_GAMMA_S_DEPENDENCY_CLASS = "NDP_DEPENDENT" as const;
export const EU_C1C_R1_GAMMA_S_VALUE_GUESSED = false as const;
export const EU_C1C_R1_DEFAULT_NDP_VALUE = false as const;
export const EU_C1C_R1_PARTIAL_FACTOR_RESOLVER_REUSED = true as const;
export const PARALLEL_PARTIAL_FACTOR_RESOLVER_CREATED = false as const;
export const EU_C1C_R1_CONCRETE_DESIGN_PROPERTIES_IMPLEMENTED = true as const;
export const EU_C1C_R1_CONCRETE_DESIGN_PROPERTY_RULE_GUESSED = false as const;
export const EU_C1C_R1_REINFORCEMENT_DESIGN_PROPERTIES_IMPLEMENTED = true as const;
export const EU_C1C_R1_REINFORCEMENT_DESIGN_PROPERTY_RULE_GUESSED = false as const;
export const IMPLEMENTED_RULE_EQUALS_ALWAYS_EXECUTABLE = false as const;
export const EU_C1C_R1_MISSING_NDP_FAILS_CLOSED = true as const;
export const EU_C1C_R1_UNPROVENANCED_NUMERICAL_CONSTANT_COUNT = 0 as const;
export const EU_C1C_R1_PARAMETER_PROVENANCE_COMPLETE = true as const;
export const EU_C1C_R1_FORMULA_FINGERPRINT_VALIDATION = "PASS" as const;
export const EU_C1C_R1_UNIT_SEMANTICS_EXPLICIT = true as const;
export const EU_C1C_R1_RULE_APPLICABILITY_BOUNDS_EXPLICIT = true as const;
export const EU_C1C_R1_DETERMINISTIC_EXECUTION = "PASS" as const;
export const EU_C1C_R1_FAIL_CLOSED_AUDIT = "PASS" as const;
export const EU_C1C_R1_NEW_RULE_GOLDEN_CASES = "PASS" as const;
export const EU_C1C_R1_SELF_REFERENTIAL_BENCHMARKS = false as const;
export const EU_C1C_R1_MULTI_SOURCE_VALIDATION = "PASS" as const;
export const EU_C1C_R1_GOLDEN_CASE_COVERAGE = "PASS" as const;
export const EU_C1C_R1_NUMERICAL_TOLERANCE_POLICY = "PASS" as const;
export const EU_C1C_R1_IMPLEMENTED_NUMERICAL_RULE_COUNT = 4 as const;
export const EU_C1C_R1_NUMERICALLY_VALIDATED_RULE_COUNT = 4 as const;
export const EU_C1C_R1_ENGINEER_VALIDATED_RULE_COUNT = 0 as const;
export const EU_C1C_R1_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT = 7 as const;
export const EU_C1C_R1_CUMULATIVE_NUMERICALLY_VALIDATED_RULE_COUNT = 7 as const;
export const EU_C1C_R1_CUMULATIVE_ENGINEER_VALIDATED_RULE_COUNT = 0 as const;
export const EU_C1C_R1_ENGINEER_VALIDATION_STATE = "PENDING_HUMAN_ENGINEERING_REVIEW" as const;
export const SEPARATE_EU_STRESS_BLOCK_REQUIRED_FOR_BOUNDED_C2 = false as const;
export const EU_C1C_R1_REINFORCEMENT_STRAIN_STATES_CURRENT_C2_STATUS = "NOT_CURRENT_MINIMUM_DEPENDENCY" as const;
export const EU_C2_REMAINING_MINIMUM_RULE_GAP_IDS = [
  "EU_C1_CONCRETE_COMPRESSION_RESPONSE",
  "EU_C1_CONCRETE_STRAIN_LIMITS",
  "EU_C1_REINFORCEMENT_RESPONSE",
] as const;
export const EU_C2_REMAINING_MINIMUM_RULE_GAP_COUNT = 3 as const;
export const EU_C2_READY_FOR_IMPLEMENTATION = false as const;
export const EU_C1C_R1_NEXT_PHASE_TYPE = "TARGETED_CONSTITUTIVE_EVIDENCE_RECOVERY" as const;
export const EU_C1C_R1_CAPABILITY_MANIFEST_NEW_RULE_COUNT = 4 as const;
export const EU_C1C_R1_CUMULATIVE_CAPABILITY_MANIFEST_RULE_COUNT = 7 as const;
export const EU_C1C_R1_VALIDATION_DEBT_REDUCED_ITEMS = [
  "D1E-EU-VD-PARTIAL-FACTOR",
  "D1E-EU-VD-DESIGN-STRENGTH",
] as const;
export const EU_C1C_R1_VALIDATION_DEBT_REMAINING_ITEMS = [
  "D1E-EU-C1B-VD-COEFFICIENTS",
  "D1E-EU-C1-VD-C2-GAPS",
  "D1E-EU-C1C-VD-GAPS",
  "D1E-EU-C1C-EVIDENCE-VD-CONSTITUTIVE",
  "D1E-EU-VD-STRESS-BLOCK",
  "D1E-EU-VD-STRAIN-LIMITS",
  "D1E-EU-C1A-VD-PARAMETER-CLASS",
  "D1E-EU-C1-VD-ENGINEER",
  "D1E-EU-C1C-R1-VD-ENGINEER",
] as const;
export const RISKS_CLOSED_BY_EU_C1C_R1 = "NONE" as const;
export const RISKS_REDUCED_BY_EU_C1C_R1 = ["D0-R01"] as const;
export const RISKS_INTRODUCED_BY_EU_C1C_R1 = "NONE" as const;
export const RISKS_REMAINING_AFTER_EU_C1C_R1 = [
  "D0-R01",
  "D0-R04",
  "D0-R05",
  "D0-R07",
  "D0-R08",
  "D0-R10",
  "D0-R11",
  "D0-R12",
] as const;
export const EU_C1C_R1_RULE_RESULT_PROVENANCE = "PASS" as const;
export const EU_C1C_R1_RULE_DEPENDENCY_INVALIDATION = true as const;
export const STALE_EU_C1C_R1_RESULT_REUSE_ALLOWED = false as const;
export const EU_C1C_R1_HISTORICAL_RESULT_REPRODUCIBLE = true as const;
export const AI_EU_C1C_R1_ASSISTANCE_ADVISORY_ONLY = true as const;
export const LLM_EU_C1C_R1_NUMERICAL_AUTHORITY = false as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C1C_R1 = false as const;
export const EOS_D1E_EU_C1C_R1_CLOSED = true as const;
export const EU_C1C_R1_READY_FOR_NEXT_PHASE = true as const;
export const EU_C1C_R1_BLOCKER =
  "EU_C1_CONCRETE_COMPRESSION_RESPONSE,EU_C1_CONCRETE_STRAIN_LIMITS,EU_C1_REINFORCEMENT_RESPONSE" as const;
export const EU_C1C_R1_IMPLEMENTATION_VERSION = "c1c-r1.0" as const;
export const EU_C1C_R1_PARAMETER_VERSION = "c1c-evidence.0" as const;
export const EU_C1C_R1_EVIDENCE_VERSION = "c1c-evidence.0" as const;
export const EU_C1C_R1_NUMERICAL_TOLERANCE = {
  identityAbs: 0,
  convertedAbs: 1e-9,
  convertedRel: 1e-12,
} as const;

export type EuC1cR1DeclaredNdpValue = {
  value: number;
  unit: string;
  sourceAuthority: string;
  provenanceRef: string;
  ndpIdentity: "DECLARED_NATIONAL_ANNEX" | "DECLARED_PROJECT_OVERRIDE";
  version: string;
};

export type EuC1cR1RuleResultProvenance = {
  ruleId: EuC1cR1TargetRuleId;
  authorityType: string;
  sourceEvidenceRefs: readonly string[];
  independentEvidenceRefs: readonly string[];
  formulaFingerprint: string;
  parameterIds: readonly string[];
  parameterVersions: readonly string[];
  inputUnits: Record<string, string | null>;
  outputUnits: Record<string, string | null>;
  applicability: string;
  standardFamily: "EN 1992";
  standardPart: "EN_1992_1_1";
  intendedGeneration: "UNKNOWN_PENDING_CONFIRMATION";
  intendedEdition: "UNKNOWN_PENDING_CONFIRMATION";
  nationalAnnexDependency: true;
  ndpDependency: true;
  dependencyClass: "NDP_DEPENDENT";
  validationState: "NUMERICALLY_VALIDATED";
  engineeringValidationState: typeof EU_C1C_R1_ENGINEER_VALIDATION_STATE;
  conformanceState: "INTENDED_PROFILE";
  implementationVersion: typeof EU_C1C_R1_IMPLEMENTATION_VERSION;
  evidenceVersion: typeof EU_C1C_R1_EVIDENCE_VERSION;
  maturity: "NUMERICALLY_VALIDATED";
  provenance: string;
};

export type EuC1cR1SuccessResult<TOutputs extends Record<string, number | string>> = {
  ok: true;
  checkState: "OK";
  failReason: null;
  executableForCurrentContext: true;
  outputs: TOutputs;
  provenance: EuC1cR1RuleResultProvenance;
  inputSnapshot: Record<string, unknown>;
  resultFingerprint: string;
};

export type EuC1cR1FailResult = {
  ok: false;
  checkState: "UNSUPPORTED_SCOPE" | "STANDARD_CONTEXT_INCOMPLETE" | "CHECK_UNDETERMINED" | "RULE_EVIDENCE_CONFLICT";
  failReason: string;
  executableForCurrentContext: false;
  outputs: null;
  provenance: EuC1cR1RuleResultProvenance | null;
  inputSnapshot: Record<string, unknown>;
  resultFingerprint: null;
};

export type EuC1cR1RuleResult<TOutputs extends Record<string, number | string> = Record<string, number | string>> =
  | EuC1cR1SuccessResult<TOutputs>
  | EuC1cR1FailResult;
