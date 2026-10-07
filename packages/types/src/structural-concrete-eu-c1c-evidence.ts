/**
 * EOS-D1E-EU-C1C-EVIDENCE — public/governed C2 rule-authority recovery.
 * Evidence binding only. No numerical EN 1992 implementation. Not conformance certification.
 */

export const EOS_D1E_EU_C1C_EVIDENCE_PHASE = "EOS-D1E-EU-C1C-EVIDENCE" as const;
export const C1B_RULE_AUTHORITY_POLICY_PRESERVED = true as const;
export const PARALLEL_EU_C1C_EVIDENCE_ARCHITECTURE_CREATED = false as const;
export const EU_C1C_EVIDENCE_EXISTING_RECORDS_LOADED = true as const;
export const EU_C1C_EVIDENCE_INITIAL_GAP_RULE_IDS = [
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
export type EuC1cEvidenceGapRuleId = (typeof EU_C1C_EVIDENCE_INITIAL_GAP_RULE_IDS)[number];
export const EU_C1C_EVIDENCE_INITIAL_GAP_COUNT = 9 as const;
export const EU_C1C_C2_MINIMUM_DEPENDENCY_RECOMPUTED = true as const;
export const EU_C1C_C2_MINIMUM_REQUIRED_RULE_IDS = [
  "EU_C1_CONCRETE_DESIGN_PROPERTIES",
  "EU_C1_REINFORCEMENT_DESIGN_PROPERTIES",
  "EU_C1_PARTIAL_FACTOR_GAMMA_C",
  "EU_C1_PARTIAL_FACTOR_GAMMA_S",
  "EU_C1_CONCRETE_COMPRESSION_RESPONSE",
  "EU_C1_CONCRETE_STRAIN_LIMITS",
  "EU_C1_REINFORCEMENT_RESPONSE",
] as const;
export const EU_C1C_C2_MINIMUM_REQUIRED_RULE_COUNT = 7 as const;
export const EU_C1C_C2_SECTION_RESISTANCE_STRATEGY_RESOLVED = true as const;
export const EU_C1C_EVIDENCE_C2_SECTION_RESISTANCE_STRATEGY = "MATERIAL_INTEGRATION" as const;
export const EU_C1C_EVIDENCE_SOURCE_HIERARCHY_ENFORCED = true as const;
export const EU_C1C_PUBLIC_ENGINEERING_REFERENCE_USE_ALLOWED = true as const;
export const PUBLIC_SOURCE_AUTOMATICALLY_AUTHORITATIVE = false as const;
export const EU_C1C_SOURCE_PROFILE_IDENTITY_RECORDED = true as const;
export const EU_C1C_CROSS_GENERATION_RULE_MIXING = false as const;
export const EU_C1C_EVIDENCE_TRIANGULATION_POLICY = true as const;
export const EU_C1C_EVIDENCE_CONFLICT_FAILS_CLOSED = true as const;
export const EU_C1C_EVIDENCE_GAMMA_C_AUTHORITY_STATE = "IMPLEMENTATION_READY" as const;
export const EU_C1C_EVIDENCE_GAMMA_C_DEPENDENCY_CLASS = "NDP_DEPENDENT" as const;
export const EU_C1C_EVIDENCE_GAMMA_S_AUTHORITY_STATE = "IMPLEMENTATION_READY" as const;
export const EU_C1C_EVIDENCE_GAMMA_S_DEPENDENCY_CLASS = "NDP_DEPENDENT" as const;
export const EU_C1C_PARTIAL_FACTOR_VALUE_GUESSED = false as const;
export const EU_C1C_EVIDENCE_CONCRETE_DESIGN_PROPERTY_AUTHORITY_STATE = "IMPLEMENTATION_READY" as const;
export const EU_C1C_EVIDENCE_REINFORCEMENT_DESIGN_PROPERTY_AUTHORITY_STATE = "IMPLEMENTATION_READY" as const;
export const EU_C1C_DESIGN_PROPERTY_RULE_GUESSED = false as const;
export const EU_C1C_CONCRETE_RESPONSE_AUTHORITY_STATE = "BLOCKED_RULE_AUTHORITY" as const;
export const EU_C1C_EVIDENCE_CONCRETE_RESPONSE_PARAMETER_GUESSED = false as const;
export const EU_C1C_REQUIRED_CONCRETE_STRAIN_STATE_IDS = [] as const;
export const EU_C1C_CONCRETE_STRAIN_AUTHORITY_STATE = "BLOCKED_RULE_AUTHORITY" as const;
export const EU_C1C_EVIDENCE_CONCRETE_STRAIN_VALUE_GUESSED = false as const;
export const EU_C1C_REINFORCEMENT_RESPONSE_AUTHORITY_STATE = "BLOCKED_RULE_AUTHORITY" as const;
export const EU_C1C_EVIDENCE_REINFORCEMENT_RESPONSE_GUESSED = false as const;
export const EU_C1C_REINFORCEMENT_STRAIN_STATE_REQUIREMENT = "UNRESOLVED" as const;
export const EU_C1C_EVIDENCE_REINFORCEMENT_STRAIN_VALUE_GUESSED = false as const;
export const EU_C1C_SECTION_MODEL_REQUIREMENT_STATE = "SATISFIED_BY_MATERIAL_INTEGRATION" as const;
export const EU_C1C_NDP_CLASSIFICATION_EVIDENCE_BASED = true as const;
export const EU_C1C_EVIDENCE_NDP_VALUE_GUESSED = false as const;
export const EU_C1C_RULE_EVIDENCE_RECORDS_UPDATED = true as const;
export const EU_C1C_EVIDENCE_READY_RULE_IDS = [
  "EU_C1_PARTIAL_FACTOR_GAMMA_C",
  "EU_C1_PARTIAL_FACTOR_GAMMA_S",
  "EU_C1_CONCRETE_DESIGN_PROPERTIES",
  "EU_C1_REINFORCEMENT_DESIGN_PROPERTIES",
] as const;
export const EU_C1C_EVIDENCE_READY_RULE_COUNT = 4 as const;
export const EU_C1C_EVIDENCE_BLOCKED_RULE_IDS = [
  "EU_C1_CONCRETE_COMPRESSION_RESPONSE",
  "EU_C1_CONCRETE_STRAIN_LIMITS",
  "EU_C1_REINFORCEMENT_RESPONSE",
  "EU_C1_REINFORCEMENT_STRAIN_STATES",
] as const;
export const EU_C1C_EVIDENCE_NUMERICAL_RULE_IMPLEMENTATION_COUNT = 0 as const;
export const EU_C1C_RESUME_GATE = "FAIL" as const;
export const EU_C2_RULE_AUTHORITY_COMPLETE = false as const;
export const EU_C2_NUMERICAL_RULE_PACK_COMPLETE = false as const;
export const RISKS_CLOSED_BY_EU_C1C_EVIDENCE = "NONE" as const;
export const RISKS_REDUCED_BY_EU_C1C_EVIDENCE = [
  "EU_C1_PARTIAL_FACTOR_GAMMA_C",
  "EU_C1_PARTIAL_FACTOR_GAMMA_S",
  "EU_C1_CONCRETE_DESIGN_PROPERTIES",
  "EU_C1_REINFORCEMENT_DESIGN_PROPERTIES",
] as const;
export const RISKS_INTRODUCED_BY_EU_C1C_EVIDENCE = "NONE" as const;
export const RISKS_REMAINING_AFTER_EU_C1C_EVIDENCE = [
  "EU_C1_CONCRETE_COMPRESSION_RESPONSE",
  "EU_C1_CONCRETE_STRAIN_LIMITS",
  "EU_C1_REINFORCEMENT_RESPONSE",
  "EU_C1_REINFORCEMENT_STRAIN_STATES",
] as const;
export const EU_EVIDENCE_DEBT_RESOLVED_ITEMS = [] as const;
export const EU_EVIDENCE_DEBT_REMAINING_ITEMS = [
  "D1E-EU-C1B-VD-COEFFICIENTS",
  "D1E-EU-C1-VD-C2-GAPS",
  "D1E-EU-C1C-VD-GAPS",
  "D1E-EU-C1C-EVIDENCE-VD-CONSTITUTIVE",
  "D1E-EU-VD-PARTIAL-FACTOR",
  "D1E-EU-VD-DESIGN-STRENGTH",
  "D1E-EU-VD-STRESS-BLOCK",
  "D1E-EU-VD-STRAIN-LIMITS",
  "D1E-EU-C1A-VD-PARAMETER-CLASS",
  "D1E-EU-C1-VD-ENGINEER",
] as const;
export const BLOCKED_PHASE_VALIDATION_REPORTING_UNAMBIGUOUS = true as const;
export const NEW_RULE_GOLDEN_CASES = "NOT_APPLICABLE" as const;
export const NEW_RULE_NUMERICAL_VALIDATION = "NOT_APPLICABLE" as const;
export const NEW_RULE_DETERMINISTIC_EXECUTION = "NOT_APPLICABLE" as const;
export const PARTIAL_FACTOR_RESOLVER_BEHAVIOR = "PASS" as const;
export const PARTIAL_FACTOR_AUTHORITY_RESOLVED = true as const;
export const EOS_D1E_EU_C1C_EVIDENCE_CLOSED = true as const;
export const EU_C1C_EVIDENCE_BLOCKER =
  "EU_C1_CONCRETE_COMPRESSION_RESPONSE,EU_C1_CONCRETE_STRAIN_LIMITS,EU_C1_REINFORCEMENT_RESPONSE,EU_C1_REINFORCEMENT_STRAIN_STATES" as const;
export const READY_TO_RESUME_C1C = true as const;

export const EU_C1C_EVIDENCE_C2_GAP_ROLES = [
  "REQUIRED_FOR_BOUNDED_C2",
  "SATISFIED_BY_EXISTING_RULE",
  "DERIVED_FROM_OTHER_GOVERNED_RULE",
  "ALTERNATIVE_GOVERNED_METHOD_AVAILABLE",
  "NOT_REQUIRED_FOR_BOUNDED_C2",
  "UNRESOLVED",
] as const;
export type EuC1cEvidenceC2GapRole = (typeof EU_C1C_EVIDENCE_C2_GAP_ROLES)[number];

export const EU_C1C_EVIDENCE_READINESS_STATES = [
  "IMPLEMENTATION_READY",
  "SATISFIED_BY_EXISTING_RULE",
  "SATISFIED_BY_MATERIAL_INTEGRATION",
  "NOT_REQUIRED_FOR_BOUNDED_C2",
  "BLOCKED_RULE_AUTHORITY",
  "BLOCKED_SOURCE_CONFLICT",
  "BLOCKED_NDP",
  "BLOCKED_OTHER",
] as const;
export type EuC1cEvidenceReadiness = (typeof EU_C1C_EVIDENCE_READINESS_STATES)[number];

export const EU_C1C_EVIDENCE_SOURCE_TIERS = ["TIER_A", "TIER_B", "TIER_C", "TIER_D"] as const;
export type EuC1cEvidenceSourceTier = (typeof EU_C1C_EVIDENCE_SOURCE_TIERS)[number];

export type EuC1cEvidenceSourceRecord = {
  sourceId: string;
  publisher: string;
  author: string;
  sourceType: string;
  tier: EuC1cEvidenceSourceTier;
  publicationIdentity: string;
  url: string;
  profileClaimedBySource: string;
  generationClaimedBySource: string;
  editionClaimedBySource: string;
  rulesSupported: readonly string[];
  parametersSupported: readonly string[];
  units: string;
  applicability: string;
  independenceGroup: string;
  numericalAuthorityAllowed: boolean;
  evidenceStatus: "BOUND" | "CORROBORATION_ONLY" | "REJECTED";
};

export type EuC1cEvidenceRuleRecord = {
  ruleId: EuC1cEvidenceGapRuleId;
  c2Role: EuC1cEvidenceC2GapRole;
  readiness: EuC1cEvidenceReadiness;
  authorityType: string;
  sourceRefs: readonly string[];
  independentEvidenceRefs: readonly string[];
  intendedProfile: string;
  dependencyClass: "BASE_STANDARD_FIXED" | "NATIONAL_ANNEX_DEPENDENT" | "NDP_DEPENDENT" | "OTHER_GOVERNED_DEPENDENCY" | "UNRESOLVED";
  formulaFingerprintCandidate: string | null;
  parameterIds: readonly string[];
  units: string | null;
  applicability: string;
  nationalAnnexDependency: boolean | "UNRESOLVED";
  ndpDependency: boolean | "UNRESOLVED";
  recommendedValueEvidence: string | null;
  packConstantValue: null;
  validationPlan: string;
  engineeringValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW";
  conformanceState: "INTENDED_PROFILE";
  version: "c1c-evidence.0";
  provenance: string;
};
