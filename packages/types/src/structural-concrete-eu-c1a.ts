/**
 * EOS-D1E-EU-C1A — Eurocode concrete rule-evidence recovery.
 * Authority resolution and evidence binding only.
 * Not a numerical EN 1992 design-method phase.
 */

export const EOS_D1E_EU_C1A_PHASE = "EOS-D1E-EU-C1A" as const;
export const D1E_FROZEN_ARCHITECTURE_PRESERVED = true as const;
export const PARALLEL_EU_C1A_ARCHITECTURE_CREATED = false as const;
export const EU_C1A_EXISTING_GOVERNED_EVIDENCE_FOUND = true as const;
export const EU_C1A_AUTHORITY_POLICY_ENFORCED = true as const;
export const EU_C1A_STANDARD_FAMILY_CONFIRMED = true as const;
export const EU_C1A_STANDARD_PART_CONFIRMED = true as const;
export const EU_C1A_STANDARD_GENERATION = "UNKNOWN_PENDING_CONFIRMATION" as const;
export const EU_C1A_STANDARD_EDITION = "UNKNOWN_PENDING_CONFIRMATION" as const;
export const EU_C1A_STANDARD_AMENDMENT_STATE = "UNKNOWN_PENDING_CONFIRMATION" as const;
export const EU_C1A_STANDARD_PROFILE_EXACTLY_RESOLVED = false as const;
export const EU_C1A_HUMAN_CONFIRMATION_CONTRACT = true as const;
export const EU_C1A_RULE_EVIDENCE_MANIFEST = true as const;
export const EU_C1A_PARAMETER_DEPENDENCY_CLASSIFICATION_COMPLETE = true as const;
export const EU_C1A_REQUIRED_RULE_INVENTORY_COMPLETE = true as const;
export const EU_C1A_GAMMA_C_DEPENDENCY_CLASS = "UNRESOLVED" as const;
export const EU_C1A_GAMMA_C_AUTHORITY_BOUND = false as const;
export const EU_C1A_GAMMA_S_DEPENDENCY_CLASS = "UNRESOLVED" as const;
export const EU_C1A_GAMMA_S_AUTHORITY_BOUND = false as const;
export const EU_C1A_CONCRETE_STRAIN_PARAMETER_SET_IDENTIFIED = false as const;
export const EU_C1A_CONCRETE_STRAIN_VALUE_GUESSED = false as const;
export const EU_C1A_SECTION_MODEL_PARAMETER_SET_IDENTIFIED = false as const;
export const EU_C1A_SECTION_MODEL_PARAMETER_GUESSED = false as const;
export const EU_C1A_MATERIAL_APPLICABILITY_MODEL = true as const;
export const EU_C1A_NATIONAL_ANNEX_INFERRED_FROM_LOCATION = false as const;
export const EU_C1A_BASE_PROFILE_WITHOUT_ANNEX_SUPPORTED = true as const;
export const EU_C1A_PILOT_NATIONAL_ANNEX = "UNBOUND" as const;
export const EU_C1A_NDP_CATALOG_GOVERNED = true as const;
export const EU_C1A_NDP_VALUE_GUESSED = false as const;
export const EU_C1A_RULE_SOURCE_PRECEDENCE = "PASS" as const;
export const EU_C1A_EVIDENCE_CONFLICT_DETECTION = true as const;
export const UNRESOLVED_EVIDENCE_CONFLICT_FAILS_CLOSED = true as const;
export const EU_C1A_C1_RULE_IDS_STABLE = true as const;
export const EU_C1A_TECHNICAL_BASIS_REFERENCES_COMPLETE = true as const;
export const EU_C1A_RULE_AUTHORITY_MATRIX = true as const;
export const EU_C1A_RULE_READINESS_CLASSIFICATION = true as const;
export const EU_C1A_IMPLEMENTABLE_BASE_RULE_COUNT = 0 as const;
export const EU_C1A_IMPLEMENTABLE_C1_RULE_COUNT = 0 as const;
export const EU_C1A_C2_DEPENDENCY_INVENTORY_COMPLETE = true as const;
export const EU_C1A_HUMAN_ENGINEERING_CONFIRMATION_REQUIRED = true as const;
export const EU_C1A_NUMERICAL_RULE_IMPLEMENTATION_COUNT = 0 as const;
export const UNAUTHORIZED_CAPABILITY_PROMOTION = false as const;
export const EU_C1A_RESUME_GATE = "FAIL" as const;
export const EOS_D1E_EU_C1A_CLOSED = false as const;
export const EU_C1A_READY_TO_RESUME_EU_C1 = false as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C1A = false as const;
export const EU_C1A_HUMAN_INPUT_REQUIRED = true as const;

export const EU_C1A_DEPENDENCY_CLASSES = [
  "BASE_STANDARD_FIXED",
  "EDITION_DEPENDENT",
  "PART_DEPENDENT",
  "NATIONAL_ANNEX_DEPENDENT",
  "NDP_DEPENDENT",
  "PROJECT_OVERRIDE_DEPENDENT",
  "MATERIAL_PROPERTY_DEPENDENT",
  "DERIVED_RULE",
  "NOT_REQUIRED_FOR_C1",
  "UNRESOLVED",
] as const;
export type EuC1aDependencyClass = (typeof EU_C1A_DEPENDENCY_CLASSES)[number];

export const EU_C1A_RULE_READINESS_STATES = [
  "READY_FOR_IMPLEMENTATION",
  "BLOCKED_STANDARD_PROFILE",
  "BLOCKED_AUTHORITY",
  "BLOCKED_NATIONAL_ANNEX",
  "BLOCKED_NDP",
  "BLOCKED_HUMAN_CONFIRMATION",
  "NOT_REQUIRED",
] as const;
export type EuC1aRuleReadiness = (typeof EU_C1A_RULE_READINESS_STATES)[number];

export const EU_C1A_RESUME_BLOCKERS = [
  "MISSING_STANDARD_GENERATION",
  "MISSING_STANDARD_EDITION",
  "MISSING_AMENDMENT_STATE",
  "MISSING_RULE_AUTHORITY",
  "MISSING_PARTIAL_FACTOR_AUTHORITY",
  "MISSING_STRAIN_RULE_AUTHORITY",
  "MISSING_SECTION_MODEL_AUTHORITY",
  "MISSING_NATIONAL_ANNEX",
  "MISSING_NDP",
  "HUMAN_CONFIRMATION_REQUIRED",
] as const;
export type EuC1aResumeBlocker = (typeof EU_C1A_RESUME_BLOCKERS)[number];

export type EuC1aHumanConfirmationInput = {
  standardFamily: "EN 1992";
  standardPart: "EN_1992_1_1";
  standardGeneration: "FIRST_GENERATION" | "SECOND_GENERATION";
  standardEdition: string;
  amendmentState: string;
  corrigendumState: string;
  technicalBasisIdentifier: string;
  authoritySourceIdentifier: string;
  confirmerRef: string;
  confirmedAt: string;
  nationalAnnexRef: string | null;
  ndpSetConfirmed: boolean;
  materialStandardsConfirmed: boolean;
  copyrightedStandardTextNotCommitted: true;
};

export type EuC1aEvidenceRecord = {
  evidenceId: string;
  plannedRuleId: string;
  parameterId: string | null;
  category: string;
  standardFamily: "EN 1992";
  standardGeneration: typeof EU_C1A_STANDARD_GENERATION;
  standardEdition: typeof EU_C1A_STANDARD_EDITION;
  standardPart: "EN_1992_1_1";
  amendmentApplicability: typeof EU_C1A_STANDARD_AMENDMENT_STATE;
  corrigendumApplicability: "UNKNOWN_PENDING_CONFIRMATION";
  dependencyClass: EuC1aDependencyClass;
  frameworkSlotNote: string;
  authorityType: "UNBOUND_PENDING_HUMAN_CONFIRMATION";
  technicalBasisRef: string;
  parameterValue: null;
  units: null;
  applicabilityBounds: "UNBOUND_PENDING_CONFIRMED_PROFILE";
  humanConfirmationState: "REQUIRED";
  validationState: "EVIDENCE_UNBOUND";
  version: "c1a.0";
  provenance: string;
  readiness: EuC1aRuleReadiness;
  readyForImplementation: false;
};

export type EuC1aAuthorityMatrixRow = {
  ruleId: string;
  authority: "UNBOUND_PENDING_HUMAN_CONFIRMATION";
  profile: "EN 1992 / EN_1992_1_1 / UNKNOWN_PENDING_CONFIRMATION";
  part: "EN_1992_1_1";
  annexNdpDependency: EuC1aDependencyClass;
  evidenceState: "UNBOUND";
  readyForImplementation: false;
  readiness: EuC1aRuleReadiness;
};

export type EuC1aC2DependencyRow = {
  dependencyId: string;
  classification: "BOUND" | "UNBOUND" | "NOT_REQUIRED";
  note: string;
};
