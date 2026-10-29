/**
 * EOS-D1B — governed Structural standard/jurisdiction/edition/annex binding.
 * Binding and validation only. Not design-code engines.
 */

import type { EosGlobalProvenanceContract } from "./global-governance";

export const EOS_D1B_PHASE = "EOS-D1B" as const;

export const SILENT_JURISDICTION_INFERENCE_ALLOWED = false as const;
export const AMBIGUOUS_STANDARD_GOVERNED_RESULT_ALLOWED = false as const;
export const GENERIC_ENGINE_HARDCODES_NATIONAL_VALUES = false as const;
export const TOOL_AVAILABILITY_EQUALS_CERTIFICATION = false as const;
export const SYNTHETIC_UDL_ENGINE_DESIGN_CODE_CERTIFIED = false as const;
export const CONFIGURED_STANDARD_EQUALS_IMPLEMENTED_ENGINE = false as const;
export const IMPLEMENTED_ENGINE_EQUALS_CERTIFIED_ENGINE = false as const;
export const AI_STANDARD_SELECTION_ADVISORY_ONLY = true as const;
export const AI_STANDARD_INTERPRETATION_AUTHORITY = false as const;
export const STANDARD_CONTENT_LICENSING_BOUNDARY = true as const;
export const STRUCTURAL_STANDARD_TEXT_EMBEDDED = false as const;
export const EU_SPECIFIC_METADATA_CONDITIONAL = true as const;
export const GLOBAL_JURISDICTION_FRAMEWORK_REUSED = true as const;
export const PARALLEL_STRUCTURAL_JURISDICTION_FRAMEWORK = false as const;
export const PARALLEL_STANDARD_CONTEXT_REMAINS = false as const;
export const PROFESSIONAL_AUTHORITY_PROFILE_EXTENSIBILITY = true as const;
export const PERSONAL_DATA_MINIMIZED = true as const;
export const TENANT_ISOLATION_PRESERVED = true as const;
export const WORKSPACE_ISOLATION_PRESERVED = true as const;
export const GOVERNED_CALCULATION_JURISDICTION_REQUIRED = true as const;
export const STANDARD_CODE_REQUIRED = true as const;
export const STANDARD_EDITION_REQUIRED_FOR_GOVERNED_CALCULATION = true as const;
export const STANDARD_AMENDMENT_TRACEABILITY = true as const;
export const NATIONAL_ANNEX_BINDING_MODEL = true as const;
export const PROJECT_STANDARD_DEFAULTS_SUPPORTED = true as const;
export const CALCULATION_BINDING_OVERRIDES_PROJECT_DEFAULT = true as const;
export const ISSUED_CALCULATION_STANDARD_CONTEXT_IMMUTABLE = true as const;

export const STRUCTURAL_STANDARD_LIFECYCLES = [
  "ACTIVE",
  "SUPERSEDED",
  "WITHDRAWN",
  "FUTURE",
  "CUSTOMER_APPROVED_LEGACY",
] as const;
export type StructuralStandardLifecycle = (typeof STRUCTURAL_STANDARD_LIFECYCLES)[number];

export const STRUCTURAL_TOOL_CERTIFICATION_STATES = [
  "UNVALIDATED",
  "IMPLEMENTED",
  "BENCHMARKED",
  "HUMAN_VALIDATED",
  "PILOT",
  "CERTIFIED",
  "NOT_CERTIFIED",
] as const;
export type StructuralToolCertificationState = (typeof STRUCTURAL_TOOL_CERTIFICATION_STATES)[number];

export const STRUCTURAL_STANDARD_PACK_MATURITY = [
  "FRAMEWORK_ONLY",
  "IMPLEMENTED",
  "BENCHMARKED",
  "HUMAN_VALIDATED",
  "PILOT",
  "CERTIFIED",
] as const;
export type StructuralStandardPackMaturity = (typeof STRUCTURAL_STANDARD_PACK_MATURITY)[number];

export type StructuralNationalAnnexRef = {
  annexId: string;
  country: string | null;
  jurisdiction: string;
  standardCode: string;
  edition: string;
  annexEdition: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  parameterSetRef: string | null;
  sourceReference: string;
  validationState: string;
};

export type StructuralJurisdictionParameterSet = {
  parameterSetId: string;
  jurisdictionProfileRef: string;
  annexId: string | null;
  declaredParameterKeys: string[];
  hardcodedIntoGenericEngine: false;
};

export type StructuralStandardContext = {
  contextId: string;
  jurisdictionProfileRef: string;
  standardFamily: string;
  standardCode: string;
  edition: string;
  amendment: string | null;
  nationalAnnexRef: StructuralNationalAnnexRef | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  discipline: "structural";
  materialScope: string;
  calculationScope: string;
  sourceReference: string;
  approvalStatus: string;
  validationState: string;
  provenanceRef: EosGlobalProvenanceContract;
  lifecycle: StructuralStandardLifecycle;
};

export type StructuralDeterministicToolScope = {
  toolId: string;
  toolVersion: string;
  supportedStandardCodes: string[];
  supportedEditions: string[];
  supportedJurisdictions: string[];
  supportedCalculationTypes: string[];
  validationState: string;
  certificationState: StructuralToolCertificationState;
  designCodeCertified: boolean;
};

export type StructuralProjectStandardDefaults = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  defaultJurisdictionProfile: string;
  defaultStructuralStandardsProfile: string;
};

export type StructuralGovernedCalculationBinding = {
  calculationId: string;
  jurisdictionProfileRef: string;
  structuralStandardContextRef: string;
  toolRef: string;
  toolVersion: string;
  calculationMethodRef: string;
  inputEvidenceRefs: string[];
  provenanceRef: EosGlobalProvenanceContract;
  issued: boolean;
  humanStandardConfirmation: boolean;
  aiAssistedStandardSelection: boolean;
  aiSuggestionAdvisory: true;
};

export type StructuralStandardPackDeclaration = {
  packId: string;
  jurisdictionProfileRef: string;
  standardCodes: string[];
  maturity: StructuralStandardPackMaturity;
  nationalAnnexRequiredWhenApplicable: boolean;
};

export type StructuralProfessionalAuthorityProfile = {
  profileId: string;
  jurisdictionProfileRef: string;
  roleKey: string;
  confirmationRequiredForStandardSelection: true;
};

export type StructuralStandardAiSuggestion = {
  suggestedContextId: string | null;
  modelOrTool: string;
  source: string;
  confidence: number | null;
  humanConfirmation: boolean;
  advisory: true;
  authoritative: false;
};

export type StructuralKnowledgeEngineCertificationSplit = {
  knowledgeState: "CONFIGURED" | "PROPOSED";
  engineState: "NOT_IMPLEMENTED" | "IMPLEMENTED";
  certificationState: StructuralToolCertificationState;
};
