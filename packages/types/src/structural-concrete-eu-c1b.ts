/**
 * EOS-D1E-EU-C1B — Eurocode concrete rule-authority recovery.
 * Non-reproductive engineering reference model / policy correction.
 * Not a numerical EN 1992 design-method phase.
 */

export const EOS_D1E_EU_C1B_PHASE = "EOS-D1E-EU-C1B" as const;
export const LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_IMPLEMENTATION = false as const;
export const STANDARD_DOCUMENT_REQUIRED_AT_RUNTIME = false as const;
export const STANDARD_DOCUMENT_REQUIRED_IN_REPOSITORY = false as const;
export const FULL_STANDARD_TEXT_REQUIRED_FOR_RULE_IMPLEMENTATION = false as const;
export const COPYRIGHTED_STANDARD_TEXT_REPRODUCED = false as const;
export const STANDARD_CONTENT_IP_REVIEW_SEPARATE_FROM_ENGINEERING_VALIDATION = true as const;
export const NON_REPRODUCTIVE_RULE_IMPLEMENTATION_MODEL = true as const;
export const STANDARD_PROFILE_CAN_BE_BOUND_WITHOUT_STANDARD_DOCUMENT = true as const;
export const EU_C1B_RULE_AUTHORITY_MODEL = true as const;
export const AUTHORITATIVE_STANDARD_DERIVED_REQUIRED_FOR_INITIAL_IMPLEMENTATION = false as const;
export const AUTHORITATIVE_PROFILE_VALIDATION_REQUIRED_FOR_CONFORMANCE = true as const;
export const ENGINEERING_REFERENCE_IMPLEMENTATION_EQUALS_STANDARD_CONFORMANCE = false as const;
export const NUMERICAL_VALIDATION_EQUALS_STANDARD_CONFORMANCE = false as const;
export const EU_C1B_MULTI_SOURCE_RULE_VALIDATION = true as const;
export const SECONDARY_SOURCE_REQUIRES_VALIDATION = true as const;
export const MODEL_SUGGESTED_PARAMETER_REQUIRES_EXTERNAL_VALIDATION = true as const;
export const EU_C1B_RULE_EVIDENCE_RECORD = true as const;
export const EU_C1B_FORMULA_FINGERPRINT = true as const;
export const EU_C1B_PARAMETER_PROVENANCE_REQUIRED = true as const;
export const EU_C1B_RULE_CLASSIFICATION_COMPLETE = true as const;
export const EU_C1B_NDP_CLASSIFICATION_EVIDENCE_BASED = true as const;
export const NATIONAL_ANNEX_INFERRED_FROM_LOCATION = false as const;
export const EU_C1B_RULE_MATURITY_MODEL = true as const;
export const REFERENCE_IMPLEMENTED_REQUIRES_LICENSED_STANDARD_FILE = false as const;
export const EU_C1B_NUMERICAL_VALIDATION_REQUIREMENTS = true as const;
export const EU_C1B_ENGINEER_VALIDATION_REQUIRED_FOR_PROMOTION = true as const;
export const EU_C1B_CONFORMANCE_VALIDATION_STRICT = true as const;
export const EU_C1B_IMPLEMENTABLE_REFERENCE_RULE_COUNT = 3 as const;
export const EU_C1B_IMPLEMENTABLE_NUMERICAL_RULE_COUNT = 3 as const;
export const EU_C1B_PARTIAL_FACTOR_GUESSED = false as const;
export const EU_C1B_STRAIN_PARAMETER_GUESSED = false as const;
export const EU_C1B_SECTION_MODEL_PARAMETER_GUESSED = false as const;
export const EU_C1B_SOURCE_CONFLICT_FAILS_CLOSED = true as const;
export const EXTERNAL_SOFTWARE_RESULT_EQUALS_RULE_AUTHORITY = false as const;
export const EU_C1_ACCEPTANCE_POLICY_CORRECTED = true as const;
export const EU_C1_RESUME_GATE = "PASS" as const;
export const PARALLEL_EU_RULE_ENGINE_CREATED = false as const;
export const READY_TO_RESUME_EU_C1 = true as const;
export const EOS_D1E_EU_C1B_CLOSED = true as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C1B = false as const;

export const EU_C1B_ALLOWED_AUTHORITY_TYPES = [
  "AUTHORITATIVE_STANDARD_DERIVED",
  "VALIDATED_ENGINEERING_REFERENCE",
  "HUMAN_AUTHORED_VALIDATED_RULE",
  "ESTABLISHED_ENGINEERING_MECHANICS",
  "CERTIFIED_EXTERNAL_TOOL_REFERENCE",
  "OTHER_GOVERNED_ENGINEERING_SOURCE",
] as const;
export type EuC1bAllowedAuthority = (typeof EU_C1B_ALLOWED_AUTHORITY_TYPES)[number];

export const EU_C1B_FORBIDDEN_AUTHORITY_TYPES = [
  "LLM_MEMORY_ONLY",
  "UNSOURCED_WEB_RULE",
  "BLOG_OR_FORUM_ONLY",
  "GENERATED_UNVALIDATED_RULE",
] as const;
export type EuC1bForbiddenAuthority = (typeof EU_C1B_FORBIDDEN_AUTHORITY_TYPES)[number];

export const EU_C1B_RULE_CLASSES = [
  "ESTABLISHED_MECHANICS",
  "STANDARD_SPECIFIC",
  "NATIONAL_CHOICE",
  "MATERIAL_SPECIFIC",
  "PROJECT_SPECIFIC",
] as const;
export type EuC1bRuleClass = (typeof EU_C1B_RULE_CLASSES)[number];

export const EU_C1B_RULE_MATURITY_LEVELS = [
  "REFERENCE_IMPLEMENTED",
  "NUMERICALLY_VALIDATED",
  "ENGINEER_VALIDATED",
  "CONFORMANCE_VALIDATED",
] as const;
export type EuC1bRuleMaturity = (typeof EU_C1B_RULE_MATURITY_LEVELS)[number];

export const EU_C1B_RECLASS_FLAGS = [
  "REFERENCE_EVIDENCE_AVAILABLE",
  "IMPLEMENTABLE",
  "REQUIRES_NATIONAL_CHOICE",
  "REQUIRES_ENGINEER_VALIDATION",
  "STILL_BLOCKED",
] as const;
export type EuC1bReclassFlag = (typeof EU_C1B_RECLASS_FLAGS)[number];

export type EuC1bParameterProvenance = {
  parameterId: string;
  value: string | number | boolean | null;
  valueMode: "PACK_CONSTANT" | "EXPLICIT_CALCULATION_INPUT" | "UNBOUND_PENDING_GOVERNED_SOURCE";
  units: string | null;
  authority: EuC1bAllowedAuthority | "UNBOUND";
  source: string;
  applicability: string;
  version: string;
  validationStatus: "BOUND" | "CALCULATION_INPUT" | "UNBOUND";
};

export type EuC1bRuleEvidenceRecord = {
  ruleId: string;
  ruleCategory: string;
  standardFamily: "EN 1992";
  standardPart: "EN_1992_1_1";
  intendedGeneration: "UNKNOWN_PENDING_CONFIRMATION";
  intendedEdition: "UNKNOWN_PENDING_CONFIRMATION";
  authorityType: EuC1bAllowedAuthority | "UNBOUND";
  sourceReference: string;
  sourceType: string;
  formulaFingerprint: string | null;
  parameterIds: readonly string[];
  units: string | null;
  applicability: string;
  corroboratingEvidenceRefs: readonly string[];
  numericalValidationState: "PLAN_ONLY" | "NOT_STARTED" | "NOT_APPLICABLE";
  engineeringValidationState: "REQUIRED_FOR_PROMOTION" | "NOT_STARTED";
  conformanceState: "INTENDED_PROFILE";
  version: "c1b.0";
  provenance: string;
  ruleClass: EuC1bRuleClass;
  maturityClaimed: null | "REFERENCE_IMPLEMENTED";
  nationalChoiceRequired: boolean | "UNRESOLVED";
  referenceEvidenceAvailable: boolean;
  implementable: boolean;
  requiresEngineerValidation: true;
  stillBlocked: boolean;
  blockedReason: string | null;
  independentValidationPlan: string;
};

export type EuC1bInventoryReclassRow = {
  ruleId: string;
  REFERENCE_EVIDENCE_AVAILABLE: boolean;
  IMPLEMENTABLE: boolean;
  REQUIRES_NATIONAL_CHOICE: boolean | "UNRESOLVED";
  REQUIRES_ENGINEER_VALIDATION: true;
  STILL_BLOCKED: boolean;
  blockedReason: string | null;
};
