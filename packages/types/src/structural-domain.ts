/**
 * EOS-D1A — Structural domain object contracts.
 * Domain foundation only. Not design engines, FEA, or persistence.
 */

import type { EosEvidenceSourceKind } from "./discipline-capability";
import type { EosGlobalProvenanceContract } from "./global-governance";

export const EOS_D1A_PHASE = "EOS-D1A" as const;
export const STRUCTURAL_DOMAIN_OWNER_PACKAGE = "@rtb/engineering-os" as const;

export const STRUCTURAL_OBJECT_KINDS = [
  "STRUCTURAL_SYSTEM",
  "FRAME",
  "MEMBER",
  "BEAM",
  "COLUMN",
  "BRACE",
  "PLATE",
  "CONNECTION",
  "NODE",
  "SUPPORT",
  "SECTION",
  "MATERIAL",
  "LOAD_CASE",
  "LOAD_COMBINATION",
  "ANALYSIS_MODEL",
  "ANALYSIS_RESULT",
  "DESIGN_CHECK",
  "CAPACITY_RESULT",
  "UTILIZATION_RESULT",
  "FOUNDATION_INTERFACE",
] as const;
export type StructuralObjectKind = (typeof STRUCTURAL_OBJECT_KINDS)[number];

export const STRUCTURAL_MEMBER_KINDS = ["MEMBER", "BEAM", "COLUMN", "BRACE", "PLATE"] as const;
export type StructuralMemberKind = (typeof STRUCTURAL_MEMBER_KINDS)[number];

export const STRUCTURAL_OBJECT_LIFECYCLE_STATES = [
  "DRAFT",
  "DEFINED",
  "UNDER_ANALYSIS",
  "UNDER_REVIEW",
  "VALIDATED",
  "APPROVED",
  "SUPERSEDED",
  "RETIRED",
] as const;
export type StructuralObjectLifecycle = (typeof STRUCTURAL_OBJECT_LIFECYCLE_STATES)[number];

export const SOLVER_SUCCESS_EQUALS_APPROVAL = false as const;
export const AUTOMATIC_DESIGN_APPROVAL_FROM_UTILIZATION = false as const;
export const CONNECTION_DESIGN_ENGINE_IMPLEMENTED = false as const;
export const LLM_ORIGINATED_CAPACITY_ALLOWED = false as const;
export const AU_SECTION_CATALOG_HARDCODED_AS_GLOBAL = false as const;
export const GEOTECHNICAL_DATA_OWNED_BY_STRUCTURAL = false as const;

export const STRUCTURAL_FORBIDDEN_CORE_CLAUSE_FIELDS = [
  "as4100Clause",
  "eurocodeClause",
  "aiscClause",
  "aciClause",
  "as3600Clause",
] as const;

/** D1B-ready standard/jurisdiction bind. No clause engines. */
export type StructuralStandardContextRef = {
  jurisdictionProfile: string;
  standardProfile: string;
  standardFamily: string | null;
  standardCode: string | null;
  edition: string | null;
  amendment: string | null;
  nationalAnnex: string | null;
  effectiveDate: string | null;
};

export type StructuralEvidenceBinding = {
  evidenceId: string;
  sourceKind: EosEvidenceSourceKind;
  reference: string;
};

export type StructuralObjectIdentity = {
  objectId: string;
  objectType: StructuralObjectKind;
  structuralSystemId: string;
  projectId: string;
  assetId: string | null;
  tenantId: string;
  workspaceId: string;
  externalReference: string | null;
  sourceSystem: string | null;
  sourceObjectId: string | null;
  revision: string;
  status: StructuralObjectLifecycle;
  provenance: EosGlobalProvenanceContract;
};

export type StructuralSystem = {
  structuralSystemId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assetId: string | null;
  name: string;
  description: string;
  systemType: string;
  discipline: "structural";
  status: StructuralObjectLifecycle;
  jurisdictionContextRef: string;
  standardsContextRef: StructuralStandardContextRef;
  provenanceRef: EosGlobalProvenanceContract;
  evidenceRefs: StructuralEvidenceBinding[];
  crossDisciplineInterfaceIds: string[];
  digitalTwinExtensionId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StructuralNode = StructuralObjectIdentity & {
  nodeId: string;
  coordinatesRef: string | null;
  supportRef: string | null;
  solverMappingRef: string | null;
};

export type StructuralSupport = StructuralObjectIdentity & {
  supportId: string;
  nodeRef: string;
  restraintDescription: string | null;
  reactionResultRefs: string[];
  foundationInterfaceRef: string | null;
  solverMappingRef: string | null;
};

export type StructuralMember = StructuralObjectIdentity & {
  memberId: string;
  memberKind: StructuralMemberKind;
  startNodeId: string;
  endNodeId: string;
  sectionRef: string;
  materialRef: string;
  orientation: string | null;
  length: number | null;
  systemRef: string;
  designContextRef: StructuralStandardContextRef | null;
  analysisModelRefs: string[];
  evidenceRefs: StructuralEvidenceBinding[];
};

export type StructuralFrame = StructuralObjectIdentity & {
  frameId: string;
  memberRefs: string[];
  nodeRefs: string[];
  supportRefs: string[];
  systemRef: string;
  geometryContextRef: string | null;
  analysisModelRefs: string[];
  interfaceRefs: string[];
};

export type StructuralSection = StructuralObjectIdentity & {
  sectionId: string;
  designation: string;
  sectionFamily: string;
  geometryPropertiesRef: string | null;
  sourceCatalog: string;
  catalogVersion: string | null;
  jurisdictionApplicability: string[];
  standardRef: StructuralStandardContextRef | null;
};

export type StructuralMaterial = StructuralObjectIdentity & {
  materialId: string;
  materialFamily: string;
  grade: string;
  nominalProperties: Record<string, number | string | null>;
  sourceStandardRef: StructuralStandardContextRef | null;
  jurisdictionApplicability: string[];
  propertySource: string;
  validationState: string;
};

export type StructuralLoadCase = StructuralObjectIdentity & {
  loadCaseId: string;
  name: string;
  actionType: string;
  source: string;
  applicationContext: string | null;
  units: string;
  evidenceRef: StructuralEvidenceBinding | null;
  jurisdictionContextRef: string;
};

export type StructuralLoadCombination = StructuralObjectIdentity & {
  combinationId: string;
  name: string;
  components: Array<{ loadCaseId: string; factor: number | null }>;
  combinationCategory: string;
  sourceStandardRef: StructuralStandardContextRef | null;
  jurisdictionContextRef: string;
  editionAnnexBindingRef: StructuralStandardContextRef | null;
};

export type StructuralAnalysisModel = StructuralObjectIdentity & {
  analysisModelId: string;
  modelType: string;
  structuralSystemRef: string;
  objectRefs: string[];
  solverProfileRef: string | null;
  analysisOrder: "first-order" | "second-order" | "unspecified";
  assumptions: string[];
  inputEvidenceRefs: StructuralEvidenceBinding[];
  jurisdictionContextRef: string;
  validationState: string;
};

export type StructuralAnalysisQuantity = {
  objectRef: string;
  quantity: string;
  value: number | null;
  units: string | null;
};

export type StructuralAnalysisResult = StructuralObjectIdentity & {
  resultId: string;
  analysisModelRef: string;
  toolRef: string | null;
  toolVersion: string | null;
  executionRef: string | null;
  resultType: string;
  memberActions: StructuralAnalysisQuantity[];
  reactions: StructuralAnalysisQuantity[];
  deflections: StructuralAnalysisQuantity[];
  validationState: string;
  humanReviewState: string;
  outputClass: "DETERMINISTIC_RESULT";
  solverSuccessImpliesApproval: false;
};

export type StructuralCapacityResult = StructuralObjectIdentity & {
  capacityResultId: string;
  objectRef: string;
  capacityType: string;
  value: number | null;
  units: string | null;
  standardContextRef: StructuralStandardContextRef | null;
  toolRef: string | null;
  methodRef: string | null;
  validationState: string;
  llmOriginated: false;
};

export type StructuralUtilizationResult = StructuralObjectIdentity & {
  utilizationResultId: string;
  demandRef: string;
  capacityRef: string;
  ratio: number | null;
  governingCombinationRef: string | null;
  standardContextRef: StructuralStandardContextRef | null;
  humanReviewState: string;
  utilizationAtOrBelowOneImpliesApproval: false;
};

export type StructuralDesignCheck = StructuralObjectIdentity & {
  designCheckId: string;
  objectRef: string;
  checkType: string;
  demandRef: string | null;
  capacityRef: string | null;
  standardContextRef: StructuralStandardContextRef | null;
  calculationMethodRef: string | null;
  governingCaseRef: string | null;
  assumptionRefs: string[];
  evidenceRefs: StructuralEvidenceBinding[];
  toolRef: string | null;
  validationState: string;
  reviewState: string;
  approvalState: string;
};

export type StructuralConnection = StructuralObjectIdentity & {
  connectionId: string;
  connectedObjectRefs: string[];
  connectionType: string;
  geometryRef: string | null;
  materialRefs: string[];
  fastenerRefs: string[];
  designCheckRefs: string[];
  evidenceRefs: StructuralEvidenceBinding[];
  designEngineImplemented: false;
};

export type StructuralFoundationInterface = StructuralObjectIdentity & {
  interfaceId: string;
  structuralObjectRef: string;
  reactionResultRefs: string[];
  loadCombinationRefs: string[];
  interfaceGeometryRef: string | null;
  foundationTypeCandidate: string | null;
  groundContextRef: string | null;
  reviewRequired: boolean;
  evidenceRefs: StructuralEvidenceBinding[];
  geotechnicalPropertiesOwnedByStructural: false;
};
