/**
 * EOS-EU-0 — global jurisdiction, AI governance, privacy, and security contracts.
 * Metadata and policy framework only. Not legal certification.
 * EOS remains globally deployable; EU is a high-water-mark profile, not the product.
 */

export const EOS_ARCHITECTURE_LAYERS = [
  "GLOBAL_CORE",
  "JURISDICTION_PROFILE",
  "ENGINEERING_STANDARDS_PROFILE",
  "AI_GOVERNANCE_PROFILE",
  "PRIVACY_DATA_PROFILE",
  "SECURITY_PROFILE",
] as const;
export type EosArchitectureLayer = (typeof EOS_ARCHITECTURE_LAYERS)[number];

export const EOS_GLOBAL_FIRST_ARCHITECTURE = true as const;
export const EOS_EU_ONLY_ARCHITECTURE = false as const;
export const EOS_EU_MARKET_READY = false as const;
export const EOS_AUTONOMOUS_ENGINEERING_APPROVAL = false as const;

export const EOS_JURISDICTION_PROFILE_IDS = [
  "global-baseline",
  "australia",
  "eu-eea",
  "united-kingdom",
  "united-states",
  "canada",
  "middle-east",
  "apac-other",
  "other",
] as const;
export type EosJurisdictionProfileId = (typeof EOS_JURISDICTION_PROFILE_IDS)[number];

export type EosJurisdictionProfile = {
  jurisdictionId: EosJurisdictionProfileId | string;
  country: string | null;
  region: string;
  subJurisdiction: string | null;
  legalRegime: string;
  privacyRegime: string;
  aiRegime: string;
  cybersecurityRegime: string;
  engineeringStandardFamilies: string[];
  professionalApprovalRules: string;
  dataResidencyRules: string;
  internationalTransferRules: string;
  retentionRules: string;
  language: string;
  units: "SI" | "US_CUSTOMARY" | "MIXED" | "CONFIGURABLE";
  effectiveFrom: string;
  effectiveTo: string | null;
  version: string;
  authority: string;
  evidenceReference: string;
};

export type EosEngineeringStandardRecord = {
  standardFamily: string;
  standardCode: string;
  edition: string | null;
  amendment: string | null;
  nationalAnnex: string | null;
  jurisdiction: string;
  discipline: string | null;
  effectiveDate: string | null;
  supersededDate: string | null;
  approvalStatus: "REFERENCE" | "ADVISORY" | "MANDATORY_WHEN_SELECTED" | "SUPERSEDED";
  sourceReference: string;
};

export const EOS_EU_AI_CLASSIFICATIONS = [
  "prohibited",
  "high-risk",
  "limited-transparency",
  "minimal-other",
  "not-applicable",
  "requires-assessment",
] as const;
export type EosEuAiClassification = (typeof EOS_EU_AI_CLASSIFICATIONS)[number];

export const EOS_AI_TYPES = ["GENERATIVE", "CLASSIFIER", "RETRIEVAL", "PLANNING", "TOOL_ORCHESTRATION", "OTHER"] as const;
export type EosAiType = (typeof EOS_AI_TYPES)[number];

export type EosAiCapabilityRecord = {
  capabilityId: string;
  name: string;
  module: string;
  discipline: string | null;
  intendedPurpose: string;
  AIType: EosAiType;
  modelOrTool: string | null;
  provider: string | null;
  version: string;
  inputCategories: string[];
  outputCategories: string[];
  engineeringImpact: "none" | "advisory" | "decision-support" | "design-affecting";
  humanOversightRequired: boolean;
  autonomousActionAllowed: boolean;
  governedNumericalOutputAllowed: boolean;
  evidenceRequired: boolean;
  provenanceRequired: boolean;
  riskClassification: EosEuAiClassification;
  jurisdictionApplicability: string[];
  deploymentRegion: string[];
  dataCategories: string[];
  reviewStatus: "DRAFT" | "REVIEW" | "APPROVED" | "RESTRICTED";
  effectiveVersion: string;
};

export const EOS_DATA_CATEGORIES = [
  "engineeringData",
  "customerConfidential",
  "operationalData",
  "telemetry",
  "employeeData",
  "derivedData",
  "AIInput",
  "AIOutput",
  "personalData",
  "specialCategoryData",
] as const;
export type EosDataCategory = (typeof EOS_DATA_CATEGORIES)[number];

export type EosPrivacyPolicyProfile = {
  profileId: string;
  dataCategory: EosDataCategory;
  personalData: boolean;
  specialCategoryData: boolean;
  purpose: string;
  lawfulBasisProfile: string;
  retentionClass: string;
  deletionPolicy: string;
  residencyPolicy: string;
  transferPolicy: string;
  accessClass: string;
  auditRequirement: string;
  dataSubjectRightsApplicability: "NONE" | "JURISDICTION_PROFILE" | "ALWAYS_EVALUATE";
};

export type EosRegionalDeploymentPolicy = {
  preferredRegion: string | null;
  requiredRegion: string | null;
  allowedRegions: string[];
  prohibitedRegions: string[];
  transferPermitted: boolean;
  transferMechanism: string | null;
  crossBorderApprovalRequired: boolean;
};

export const EOS_HUMAN_AUTHORITY_ROLES = [
  "engineer",
  "reviewer",
  "approver",
  "engineering_manager",
  "administrator",
] as const;
export type EosHumanAuthorityRole = (typeof EOS_HUMAN_AUTHORITY_ROLES)[number];

export const EOS_MACHINE_AUTHORITY_ROLES = ["AI", "automation"] as const;
export type EosMachineAuthorityRole = (typeof EOS_MACHINE_AUTHORITY_ROLES)[number];

export const EOS_ENGINEERING_OUTPUT_CLASSES = [
  "INFORMATIONAL",
  "AI_SUGGESTION",
  "ENGINEERING_FINDING",
  "DETERMINISTIC_RESULT",
  "ENGINEERING_CALCULATION",
  "DESIGN_OPTION",
  "REVIEW_FINDING",
  "APPROVED_ENGINEERING_OUTPUT",
  "ISSUED_DELIVERABLE",
] as const;
export type EosEngineeringOutputClass = (typeof EOS_ENGINEERING_OUTPUT_CLASSES)[number];

export type EosGlobalProvenanceContract = {
  sourceEvidence: string | null;
  sourceRevision: string | null;
  model: string | null;
  tool: string | null;
  solver: string | null;
  version: string | null;
  promptOrTemplate: string | null;
  timestamp: string;
  jurisdiction: string | null;
  standard: string | null;
  calculationMethod: string | null;
  confidence: number | null;
  validationState: string;
  humanReviewer: string | null;
  approvalState: string;
};

export const EOS_COMPLIANCE_STATUSES = [
  "KNOWN",
  "REQUIRES_LEGAL_REVIEW",
  "REQUIRES_TECHNICAL_IMPLEMENTATION",
  "NOT_APPLICABLE",
] as const;
export type EosComplianceStatus = (typeof EOS_COMPLIANCE_STATUSES)[number];

export const EOS_COMPLIANCE_CATEGORIES = [
  "AI_REGULATION",
  "PRIVACY",
  "DATA_RESIDENCY",
  "CROSS_BORDER_TRANSFER",
  "CYBERSECURITY",
  "ENGINEERING_STANDARDS",
  "PROFESSIONAL_ENGINEERING_AUTHORITY",
  "RECORD_RETENTION",
  "AI_TRANSPARENCY",
  "HIGH_RISK_RESTRICTED_USES",
] as const;
export type EosComplianceCategory = (typeof EOS_COMPLIANCE_CATEGORIES)[number];

export type EosComplianceMatrixCell = {
  profileId: EosJurisdictionProfileId;
  category: EosComplianceCategory;
  status: EosComplianceStatus;
  note: string;
};

export type EosHorizontalModuleInventoryRow = {
  MODULE_ID: string;
  MODULE_NAME: string;
  PURPOSE: string;
  AI_PRESENT: "YES" | "NO";
  PERSONAL_DATA_PRESENT: "YES" | "NO" | "POSSIBLE";
  ENGINEERING_DECISION_IMPACT: "NONE" | "ADVISORY" | "MATERIAL";
  EXTERNAL_SYSTEM_ACCESS: "YES" | "NO";
  CURRENT_JURISDICTION_ASSUMPTION: "NONE_GLOBAL_NEUTRAL";
  EU_REVIEW_REQUIRED: "YES" | "NO";
  GLOBAL_REVIEW_REQUIRED: "YES";
};

export type EosDisciplineGapRow = {
  disciplineId: string;
  name: string;
  maturity: "REFERENCE_PARTIALLY_IMPLEMENTED" | "NOT_YET_DEDICATED";
};

export type EosDisciplinePackDeclaration = {
  disciplineId: string;
  engineeringObjects: string[];
  standards: string[];
  jurisdictionApplicability: string[];
  calculations: string[];
  deterministicTools: string[];
  externalTools: string[];
  AIcapabilities: string[];
  evidenceRules: string[];
  reviewRules: string[];
  approvalRules: string[];
  deliverables: string[];
  inspectionModels: string[];
  digitalTwinModels: string[];
  riskModels: string[];
  provenanceRequirements: string[];
};

export const EOS_GLOBAL_POLICY_INHERITANCE = [
  "global_jurisdiction_framework",
  "ai_governance",
  "privacy_data_policy",
  "security_baseline",
  "human_authority_model",
  "provenance_model",
] as const;
export type EosGlobalPolicyInheritance = (typeof EOS_GLOBAL_POLICY_INHERITANCE)[number];

export const EOS_SECURITY_BASELINE_CONTROLS = [
  "MFA",
  "least_privilege",
  "tenant_isolation",
  "workspace_isolation",
  "encryption",
  "security_logging",
  "incident_traceability",
  "secure_sdlc",
  "dependency_governance",
  "vulnerability_handling",
  "backup_recovery",
  "business_continuity",
  "third_party_risk",
  "secret_management",
  "fail_closed_external_services",
] as const;
export type EosSecurityBaselineControl = (typeof EOS_SECURITY_BASELINE_CONTROLS)[number];
