/**
 * EOS-D1E-EU-C1C-CONSTITUTIVE — targeted first-generation constitutive/strain
 * authority recovery plus bounded numerical implementation. Not flexure. Not conformance.
 */

export const EOS_D1E_EU_C1C_CONSTITUTIVE_PHASE = "EOS-D1E-EU-C1C-CONSTITUTIVE" as const;
export const EU_C1C_CONSTITUTIVE_EXISTING_EU_RULE_PACK_LOADED = true as const;
export const EU_C1C_CONSTITUTIVE_TARGET_RULE_IDS = [
  "EU_C1_CONCRETE_COMPRESSION_RESPONSE",
  "EU_C1_CONCRETE_STRAIN_LIMITS",
  "EU_C1_REINFORCEMENT_RESPONSE",
] as const;
export type EuC1cConstitutiveTargetRuleId = (typeof EU_C1C_CONSTITUTIVE_TARGET_RULE_IDS)[number];
export const CONSTITUTIVE_TARGET_RULE_IDS = EU_C1C_CONSTITUTIVE_TARGET_RULE_IDS;
export const EU_C1C_CONSTITUTIVE_TARGET_RULE_COUNT = 3 as const;
export const CONSTITUTIVE_TARGET_RULE_COUNT = EU_C1C_CONSTITUTIVE_TARGET_RULE_COUNT;
export const PARALLEL_CONSTITUTIVE_ARCHITECTURE_CREATED = false as const;
export const CONSTITUTIVE_RULE_AUTHORITY_POLICY_REUSED = true as const;
export const LLM_CONSTITUTIVE_MEMORY_ONLY_RULE_ALLOWED = false as const;
export const CONSTITUTIVE_INTENDED_STANDARD_GENERATION = "FIRST_GENERATION" as const;
export const CONSTITUTIVE_PROFILE_EVIDENCE_STATE =
  "SOURCE_CLAIMED_FIRST_GENERATION_PACK_EDITION_UNKNOWN_PENDING_CONFIRMATION" as const;
export const CONSTITUTIVE_CROSS_GENERATION_RULE_MIXING = false as const;
export const CONSTITUTIVE_SOURCE_HIERARCHY_ENFORCED = true as const;
export const CONSTITUTIVE_PUBLIC_SOURCE_AUTOMATICALLY_AUTHORITATIVE = false as const;
export const CONSTITUTIVE_SOURCE_INDEPENDENCE_CHECK = "PASS" as const;
export const CONSTITUTIVE_SOURCE_CONFLICT_FAILS_CLOSED = true as const;
export const CONCRETE_COMPRESSION_RESPONSE_AUTHORITY_STATE = "IMPLEMENTATION_READY" as const;
export const CONCRETE_COMPRESSION_RESPONSE_IMPLEMENTED = true as const;
export const CONCRETE_COMPRESSION_RESPONSE_PARAMETER_GUESSED = false as const;
export const PARALLEL_EU_CONSTITUTIVE_MATERIAL_RESPONSE_ENGINE_CREATED = false as const;
export const REQUIRED_CONCRETE_STRAIN_STATE_IDS = ["eps_c2", "eps_cu2"] as const;
export const CONCRETE_STRAIN_AUTHORITY_STATE = "IMPLEMENTATION_READY" as const;
export const CONCRETE_STRAIN_LIMITS_IMPLEMENTED = true as const;
export const CONCRETE_STRAIN_VALUE_GUESSED = false as const;
export const CONCRETE_RESPONSE_STRAIN_MODEL_COMPATIBILITY = "PASS" as const;
export const REINFORCEMENT_RESPONSE_STRATEGY = "NEW_EU_RULE_USING_EXISTING_INTERFACE" as const;
export const REINFORCEMENT_RESPONSE_AUTHORITY_STATE = "IMPLEMENTATION_READY" as const;
export const REINFORCEMENT_RESPONSE_IMPLEMENTED = true as const;
export const REINFORCEMENT_RESPONSE_PARAMETER_GUESSED = false as const;
export const REINFORCEMENT_STRAIN_STATES_C2_STATUS = "NOT_REQUIRED_FOR_BOUNDED_C2" as const;
export const CONSTITUTIVE_C2_SECTION_RESISTANCE_STRATEGY = "MATERIAL_INTEGRATION" as const;
export const CONSTITUTIVE_PARAMETER_PROVENANCE_COMPLETE = true as const;
export const CONSTITUTIVE_UNPROVENANCED_NUMERICAL_CONSTANT_COUNT = 0 as const;
export const CONSTITUTIVE_FORMULA_FINGERPRINT_VALIDATION = "PASS" as const;
export const CONSTITUTIVE_UNIT_SEMANTICS_EXPLICIT = true as const;
export const CONSTITUTIVE_SIGN_CONVENTION_COMPATIBILITY = "PASS" as const;
export const CONSTITUTIVE_APPLICABILITY_BOUNDS_EXPLICIT = true as const;
export const CONSTITUTIVE_DETERMINISTIC_EXECUTION = "PASS" as const;
export const CONSTITUTIVE_FAIL_CLOSED_AUDIT = "PASS" as const;
export const CONSTITUTIVE_NEW_RULE_GOLDEN_CASES = "PASS" as const;
export const CONSTITUTIVE_SELF_REFERENTIAL_BENCHMARKS = false as const;
export const CONSTITUTIVE_GOLDEN_CASE_COVERAGE = "PASS" as const;
export const CONSTITUTIVE_MULTI_SOURCE_VALIDATION = "PASS" as const;
export const CONSTITUTIVE_NUMERICAL_TOLERANCE_POLICY = "PASS" as const;
export const CONSTITUTIVE_IMPLEMENTATION_READY_RULE_COUNT = 3 as const;
export const CONSTITUTIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT = 3 as const;
export const CONSTITUTIVE_NUMERICALLY_VALIDATED_RULE_COUNT = 3 as const;
export const CONSTITUTIVE_ENGINEER_VALIDATED_RULE_COUNT = 0 as const;
export const CONSTITUTIVE_ENGINEER_VALIDATION_STATE = "PENDING_HUMAN_ENGINEERING_REVIEW" as const;
export const EU_C1C_CONSTITUTIVE_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT = 10 as const;
export const EU_C1C_CONSTITUTIVE_CUMULATIVE_NUMERICALLY_VALIDATED_RULE_COUNT = 10 as const;
export const EU_C1C_CONSTITUTIVE_CUMULATIVE_ENGINEER_VALIDATED_RULE_COUNT = 0 as const;
export const EU_C1C_CONSTITUTIVE_C2_MINIMUM_DEPENDENCY_RECOMPUTED = true as const;
export const EU_C1C_CONSTITUTIVE_C2_REMAINING_RULE_GAP_IDS = "NONE" as const;
export const EU_C1C_CONSTITUTIVE_C2_REMAINING_RULE_GAP_COUNT = 0 as const;
export const EU_C1C_CONSTITUTIVE_C2_RULE_AUTHORITY_COMPLETE = true as const;
export const EU_C1C_CONSTITUTIVE_C2_NUMERICAL_RULE_PACK_COMPLETE = true as const;
export const EU_C2_PREINTEGRATION_SMOKE_TEST = "PASS" as const;
export const EU_C1C_CONSTITUTIVE_C2_READY_FOR_IMPLEMENTATION = true as const;
export const EU_C1C_CONSTITUTIVE_NEXT_PHASE_TYPE = "EU_C2" as const;
export const EU_C1C_CONSTITUTIVE_CANONICAL_NEXT_PHASE = "EOS-D1E-EU-C2" as const;
export const EU_C1C_CONSTITUTIVE_CANONICAL_NEXT_PHASE_SCOPE =
  "Validated bounded Eurocode RC uniaxial flexural resistance using D1E-1 section kernel, material integration and governed EU rule pack" as const;
export const CONSTITUTIVE_CAPABILITY_MANIFEST_NEW_RULE_COUNT = 3 as const;
export const EU_C1C_CONSTITUTIVE_CUMULATIVE_CAPABILITY_MANIFEST_RULE_COUNT = 10 as const;
export const CONSTITUTIVE_VALIDATION_DEBT_REDUCED_ITEMS = [
  "D1E-EU-C1C-EVIDENCE-VD-CONSTITUTIVE",
  "D1E-EU-VD-STRAIN-LIMITS",
] as const;
export const CONSTITUTIVE_VALIDATION_DEBT_REMAINING_ITEMS = [
  "D1E-EU-C1B-VD-COEFFICIENTS",
  "D1E-EU-C1-VD-C2-GAPS",
  "D1E-EU-C1C-VD-GAPS",
  "D1E-EU-VD-STRESS-BLOCK",
  "D1E-EU-C1A-VD-PARAMETER-CLASS",
  "D1E-EU-C1-VD-ENGINEER",
  "D1E-EU-C1C-R1-VD-ENGINEER",
  "D1E-EU-C1C-CONSTITUTIVE-VD-ENGINEER",
] as const;
export const RISKS_CLOSED_BY_CONSTITUTIVE = "NONE" as const;
export const RISKS_REDUCED_BY_CONSTITUTIVE = ["D0-R01"] as const;
export const RISKS_INTRODUCED_BY_CONSTITUTIVE = "NONE" as const;
export const RISKS_REMAINING_AFTER_CONSTITUTIVE = [
  "D0-R01",
  "D0-R04",
  "D0-R05",
  "D0-R07",
  "D0-R08",
  "D0-R10",
  "D0-R11",
  "D0-R12",
] as const;
export const CONSTITUTIVE_RULE_RESULT_PROVENANCE = "PASS" as const;
export const CONSTITUTIVE_DEPENDENCY_INVALIDATION = true as const;
export const STALE_CONSTITUTIVE_RESULT_REUSE_ALLOWED = false as const;
export const CONSTITUTIVE_HISTORICAL_RESULT_REPRODUCIBLE = true as const;
export const AI_CONSTITUTIVE_ASSISTANCE_ADVISORY_ONLY = true as const;
export const LLM_CONSTITUTIVE_NUMERICAL_AUTHORITY = false as const;
export const AI_CONSTITUTIVE_PARAMETER_AUTHORITY = false as const;
export const AI_CONSTITUTIVE_SOURCE_CONFLICT_AUTHORITY = false as const;
export const AI_CONSTITUTIVE_PROFILE_AUTHORITY = false as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C1C_CONSTITUTIVE = false as const;
export const EOS_D1E_EU_C1C_CONSTITUTIVE_CLOSED = true as const;
export const EU_C1C_CONSTITUTIVE_READY_FOR_NEXT_PHASE = true as const;
export const EU_C1C_CONSTITUTIVE_BLOCKER = "NONE" as const;
export const EU_C1C_CONSTITUTIVE_IMPLEMENTATION_VERSION = "c1c-constitutive.0" as const;
export const EU_C1C_CONSTITUTIVE_PARAMETER_VERSION = "c1c-constitutive.0" as const;
export const EU_C1C_CONSTITUTIVE_EVIDENCE_VERSION = "c1c-constitutive.0" as const;
export const EU_C1C_CONSTITUTIVE_MODEL_ID = "EU_C1_PARABOLA_RECTANGLE_FCK_LE_50" as const;
export const EU_C1C_CONSTITUTIVE_REO_MODEL_ID = "EU_C1_REINFORCEMENT_HORIZONTAL_BILINEAR" as const;
export const EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE = "TEST_ONLY_NON_CONFORMANCE" as const;
export const EU_C1C_CONSTITUTIVE_NUMERICAL_TOLERANCE = {
  stressAbsMPa: 1e-9,
  stressRel: 1e-12,
  strainAbs: 1e-15,
  strainRel: 1e-12,
  forceN: 1e-3,
  momentNm: 1e-3,
} as const;
export const R1_RELEASE_SENSITIVE_CLASSIFICATION_REVIEW =
  "R1 updated CONCRETE_CAPABILITY_MANIFEST in packages/engineering-os/src/structural-concrete/capability.ts; that canonical capability manifest is release-sensitive. R1 reported RELEASE_SENSITIVE_FILES_CHANGED=NONE. Classifier gap closed in this phase without rewriting the R1 commit." as const;
export const R1_RELEASE_SENSITIVE_FILES_ACTUALLY_CHANGED = true as const;
export const R1_RELEASE_CLASSIFIER_GAP = true as const;
export const R1_RELEASE_CLASSIFICATION_DISPOSITION = "RESOLVED" as const;

export type EuC1cConstitutiveParameterRecord = {
  parameterId: string;
  value: number;
  units: string;
  sourceAuthority: string;
  sourceReference: string;
  profileApplicability: string;
  materialApplicability: string;
  version: string;
  validationState: "NUMERICALLY_VALIDATED";
  modelId: string;
};

export type EuC1cConstitutiveRuleResultProvenance = {
  ruleId: EuC1cConstitutiveTargetRuleId;
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
  modelId: string;
  validationState: "NUMERICALLY_VALIDATED";
  engineeringValidationState: typeof CONSTITUTIVE_ENGINEER_VALIDATION_STATE;
  conformanceState: "INTENDED_PROFILE";
  implementationVersion: typeof EU_C1C_CONSTITUTIVE_IMPLEMENTATION_VERSION;
  evidenceVersion: typeof EU_C1C_CONSTITUTIVE_EVIDENCE_VERSION;
  maturity: "NUMERICALLY_VALIDATED";
  provenance: string;
};

export type EuC1cConstitutiveSuccessResult<TOutputs extends Record<string, number | string>> = {
  ok: true;
  checkState: "OK";
  failReason: null;
  executableForCurrentContext: true;
  outputs: TOutputs;
  provenance: EuC1cConstitutiveRuleResultProvenance;
  inputSnapshot: Record<string, unknown>;
  resultFingerprint: string;
};

export type EuC1cConstitutiveFailResult = {
  ok: false;
  checkState: "UNSUPPORTED_SCOPE" | "STANDARD_CONTEXT_INCOMPLETE" | "CHECK_UNDETERMINED" | "RULE_EVIDENCE_CONFLICT";
  failReason: string;
  executableForCurrentContext: false;
  outputs: null;
  provenance: EuC1cConstitutiveRuleResultProvenance | null;
  inputSnapshot: Record<string, unknown>;
  resultFingerprint: null;
};

export type EuC1cConstitutiveRuleResult<TOutputs extends Record<string, number | string> = Record<string, number | string>> =
  | EuC1cConstitutiveSuccessResult<TOutputs>
  | EuC1cConstitutiveFailResult;
