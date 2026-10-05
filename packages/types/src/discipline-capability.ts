/**
 * EOS-D0 — common discipline capability framework contracts.
 * One Engineering OS plus installable discipline packs. Not separate mini-OSs.
 */

import type { EosAiCapabilityRecord, EosDataCategory, EosGlobalPolicyInheritance } from "./global-governance";
import { ENGINEERING_REGISTER_OBJECT_TYPES } from "./engineering-registers";

export const EOS_D0_PHASE = "EOS-D0" as const;
export const EOS_D0_OWNER_PACKAGE = "@rtb/engineering-os" as const;

export const EOS_DISCIPLINE_IDS = [
  "structural",
  "civil",
  "geotechnical",
  "mechanical",
  "piping",
  "process",
  "electrical",
  "instrumentation_control",
] as const;
export type EosDisciplineId = (typeof EOS_DISCIPLINE_IDS)[number];

export const EOS_DISCIPLINE_MATURITY = [
  "PLANNED",
  "FOUNDATION",
  "REFERENCE_PARTIALLY_IMPLEMENTED",
  "PARTIALLY_IMPLEMENTED",
  "PILOT",
  "CERTIFIED",
  "PRODUCTION",
] as const;
export type EosDisciplineMaturity = (typeof EOS_DISCIPLINE_MATURITY)[number];

export const EOS_DISCIPLINE_ACTIVATION = [
  "installed",
  "enabled",
  "disabled",
  "pilot",
  "not_entitled",
] as const;
export type EosDisciplineActivation = (typeof EOS_DISCIPLINE_ACTIVATION)[number];

export const EOS_CORE_OWNED_REGISTERS = ENGINEERING_REGISTER_OBJECT_TYPES;
export type EosCoreOwnedRegister = (typeof EOS_CORE_OWNED_REGISTERS)[number];

export const EOS_FORBIDDEN_PLATFORM_FRAMEWORKS = [
  "authentication",
  "authorization",
  "commerce",
  "entitlement",
  "workflow_engine",
  "ai_stack",
  "model_registry",
  "prompt_registry",
  "knowledge_graph",
  "event_bus",
  "notifications",
  "audit",
  "telemetry",
  "managed_repository",
  "security_engine",
] as const;
export type EosForbiddenPlatformFramework = (typeof EOS_FORBIDDEN_PLATFORM_FRAMEWORKS)[number];

export const EOS_CROSS_DISCIPLINE_RELATIONS = [
  "PROVIDES_INPUT_TO",
  "REQUIRES_INPUT_FROM",
  "LOAD_TRANSFER",
  "DATA_DEPENDENCY",
  "DESIGN_CHANGE_IMPACT",
  "INTERFACE_REQUIREMENT",
  "REVIEW_REQUIRED",
  "ASSUMPTION_DEPENDENCY",
] as const;
export type EosCrossDisciplineRelation = (typeof EOS_CROSS_DISCIPLINE_RELATIONS)[number];

export const EOS_EVIDENCE_SOURCE_KINDS = [
  "source_document",
  "drawing",
  "model",
  "calculation",
  "inspection",
  "measurement",
  "solver_output",
  "approved_standard",
  "human_input",
  "digital_twin_state",
] as const;
export type EosEvidenceSourceKind = (typeof EOS_EVIDENCE_SOURCE_KINDS)[number];

export const LLM_ORIGINATES_GOVERNED_NUMERIC_RESULT = false as const;
export const GOVERNED_NUMERICAL_OUTPUT_ALLOWED_FOR_LLM_DEFAULT = false as const;
export const UNCERTIFIED_TOOL_SILENT_FALLBACK_ALLOWED = false as const;
export const DUPLICATE_PLATFORM_FRAMEWORK_ALLOWED = false as const;
export const DISCIPLINE_SECURITY_OVERRIDE_ALLOWED = false as const;
export const INSPECTION_AI_FINDING_EQUALS_ENGINEERING_APPROVAL = false as const;
export const HUMAN_PERSON_TWIN_ALLOWED_DEFAULT = false as const;
export const DISCIPLINE_ACTIVATION_BYPASSES_PRODUCT_ENTITLEMENT = false as const;

export const EOS_DISCIPLINE_CLASSIFIABLE_DATA = [
  "personalData",
  "engineeringData",
  "customerConfidential",
  "operationalData",
  "telemetry",
  "derivedData",
  "AIInput",
  "AIOutput",
] as const satisfies readonly EosDataCategory[];

export const EOS_INSPECTION_FINDING_CLASSES = [
  "observed_defect",
  "measurement",
  "ai_detection",
  "ai_classification",
  "engineering_interpretation",
  "condition_rating",
  "human_validation",
] as const;
export type EosInspectionFindingClass = (typeof EOS_INSPECTION_FINDING_CLASSES)[number];

export const EOS_OUTPUT_TRANSPARENCY_LABELS = [
  "AI-generated",
  "AI-assisted",
  "deterministic-tool-generated",
  "human-authored",
  "human-reviewed",
  "human-approved",
] as const;
export type EosOutputTransparencyLabel = (typeof EOS_OUTPUT_TRANSPARENCY_LABELS)[number];

export const EOS_DISCIPLINE_ROADMAP_ORDER = [
  "D1_STRUCTURAL",
  "D2_CIVIL",
  "D3_GEOTECHNICAL",
  "D4_MECHANICAL",
  "D5_PIPING",
  "D6_PROCESS",
  "D7_ELECTRICAL",
  "D8_INSTRUMENTATION_CONTROL",
  "D9_CROSS_DISCIPLINE_INTELLIGENCE",
] as const;

export type EosDisciplineGovernanceProfiles = {
  jurisdictionProfile: string;
  engineeringStandardsProfile: string;
  aiGovernanceProfile: string;
  privacyDataProfile: string;
  securityProfile: string;
  provenanceProfile: string;
};

export const EOS_D0_GOVERNANCE_PROFILES: EosDisciplineGovernanceProfiles = {
  jurisdictionProfile: "global-baseline",
  engineeringStandardsProfile: "jurisdiction-selected",
  aiGovernanceProfile: "eos-eu-0",
  privacyDataProfile: "eos-eu-0",
  securityProfile: "eos-eu-0",
  provenanceProfile: "eos-eu-0",
};

export type EosRegisteredObjectType = {
  objectTypeId: string;
  name: string;
  implemented: boolean;
};

export type EosCalculationDefinition = {
  calculationId: string;
  disciplineId: EosDisciplineId;
  name: string;
  purpose: string;
  inputSchema: string;
  outputSchema: string;
  deterministic: boolean;
  toolId: string | null;
  standardRefs: string[];
  jurisdictionApplicability: string[];
  evidenceRequirements: string[];
  provenanceRequirements: string[];
  humanReviewRequired: boolean;
  approvalRequired: boolean;
  validationState: string;
  llmOriginatesGovernedNumericResult: false;
};

export type EosDeterministicToolDeclaration = {
  toolId: string;
  version: string;
  method: string;
  inputs: string[];
  outputs: string[];
  standard: string | null;
  jurisdiction: string | null;
  provenance: string;
  validationState: string;
  kind: "internal" | "external_governed_solver" | "human_entered";
  certified: boolean;
};

export type EosExternalToolDeclaration = {
  toolCode: string;
  name: string;
  certified: boolean;
  silentFallbackAllowed: false;
};

export type EosEvidenceRule = {
  ruleId: string;
  sourceKinds: EosEvidenceSourceKind[];
  aiOutputIsApprovedEvidence: false;
};

export type EosReviewRule = {
  ruleId: string;
  actor: "engineer" | "reviewer" | "discipline_lead" | "engineering_manager";
  aiRecommendationIsReview: false;
};

export type EosApprovalRule = {
  ruleId: string;
  actor: "approver" | "discipline_lead" | "engineering_manager";
  aiRecommendationIsApproval: false;
  humanAuthorityRequired: true;
};

export type EosDeliverableType = {
  deliverableTypeId: string;
  name: string;
  implemented: boolean;
};

export type EosInspectionModelDeclaration = {
  modelId: string;
  name: string;
  implemented: boolean;
  findingClasses: EosInspectionFindingClass[];
  aiFindingEqualsEngineeringApproval: false;
};

export type EosDigitalTwinExtension = {
  extensionId: string;
  name: string;
  measuredStateDistinctFromInferred: true;
  digitalTwinDistinctFromThreadAndAiMemory: true;
  humanPersonTwinAllowed: false;
  implemented: boolean;
};

export type EosCrossDisciplineInterface = {
  interfaceId: string;
  relation: EosCrossDisciplineRelation;
  sourceDiscipline: EosDisciplineId;
  targetDiscipline: EosDisciplineId;
  sourceObject: string | null;
  targetObject: string | null;
  evidence: string | null;
  status: "declared" | "active" | "retired";
  provenance: string | null;
  humanReviewRequired: boolean;
  description: string;
};

export type EosCrossDisciplineImpact = {
  sourceDiscipline: EosDisciplineId;
  sourceObject: string;
  changeType: string;
  affectedDiscipline: EosDisciplineId;
  affectedObject: string;
  impactType: string;
  evidence: string | null;
  confidence: "low" | "medium" | "high" | "unknown";
  reviewRequired: boolean;
  aiSuggestionAdvisory: true;
};

export type EosDisciplineDefinition = {
  disciplineId: EosDisciplineId;
  name: string;
  shortName: string;
  description: string;
  version: string;
  maturity: EosDisciplineMaturity;
  status: EosDisciplineActivation;
  ownerPackage: typeof EOS_D0_OWNER_PACKAGE;
  jurisdictionApplicability: string[];
  standardsApplicability: string[];
  capabilities: string[];
  engineeringObjectTypes: EosRegisteredObjectType[];
  deliverableTypes: EosDeliverableType[];
  calculationDefinitions: EosCalculationDefinition[];
  deterministicTools: EosDeterministicToolDeclaration[];
  externalTools: EosExternalToolDeclaration[];
  aiCapabilities: Array<
    Pick<
      EosAiCapabilityRecord,
      | "capabilityId"
      | "intendedPurpose"
      | "humanOversightRequired"
      | "autonomousActionAllowed"
      | "governedNumericalOutputAllowed"
      | "engineeringImpact"
      | "jurisdictionApplicability"
      | "evidenceRequired"
      | "provenanceRequired"
      | "riskClassification"
      | "dataCategories"
    >
  >;
  evidenceRules: EosEvidenceRule[];
  reviewRules: EosReviewRule[];
  approvalRules: EosApprovalRule[];
  inspectionModels: EosInspectionModelDeclaration[];
  digitalTwinModels: EosDigitalTwinExtension[];
  riskModels: string[];
  crossDisciplineInterfaces: EosCrossDisciplineInterface[];
  dataClassifications: EosDataCategory[];
  provenanceRequirements: string[];
  inheritedProfiles: EosDisciplineGovernanceProfiles;
  inheritedPolicies: readonly EosGlobalPolicyInheritance[];
  euOnlyAssumption: false;
};

export type EosD0GovernanceRisk = {
  id: string;
  risk: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  likelihood: "LOW" | "MEDIUM" | "HIGH";
  mitigation: string;
  owner: string;
  phaseToClose: string;
};
