import type { ExpectedOutputType, GeneratorWorkType } from "../work-generator/types";
import type { LifecycleStage } from "../lifecycle-intelligence/types";
import type { EngineeringWorkPlan } from "../work-generator/types";

export const ARTIFACT_AI_BOUNDARY = {
  mayDraftNarrativePlaceholders: true,
  mayInventFormulas: false,
  mayInventLoads: false,
  mayInventMaterialProperties: false,
  mayInventSoilParameters: false,
  mayInventDesignFactors: false,
  mayInventCodeCoefficients: false,
  mayInventAllowableLimits: false,
  mayInventTechnicalConclusions: false,
  maySelectOptionStudyWinner: false,
  mayApproveEngineering: false,
  mayIssueCorrespondence: false,
} as const;

export const ARTIFACT_PRIVACY = {
  newDmsCreated: false,
  newBlobStorageCreated: false,
  localRecursiveScan: "PROHIBITED",
  downloadAutoReingest: false,
  personalFilesOutsideEos: true,
  macrosCreated: false,
  pdfExportStatus: "DEFERRED" as const,
  aiNarrative: "NOT_USED" as const,
};

export const ARTIFACT_OUTPUT_FORMATS = ["XLSX", "DOCX", "PPTX"] as const;
export type ArtifactOutputFormat = (typeof ARTIFACT_OUTPUT_FORMATS)[number];

export const ARTIFACT_TYPES = [
  "CALCULATION_WORKBOOK",
  "DESIGN_REPORT",
  "SPECIFICATION",
  "OPTION_STUDY",
  "OPTION_STUDY_PRESENTATION",
  "RFI_RESPONSE",
  "TQ_RESPONSE",
  "CONCEPT_STUDY",
  "TECHNICAL_MEMORANDUM",
] as const;
export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

export const ARTIFACT_GENERATION_STATUSES = [
  "GENERATING",
  "GENERATED_DRAFT",
  "READY_FOR_ENGINEER_REVIEW",
  "GENERATION_BLOCKED",
  "GENERATION_FAILED",
  "SUPERSEDED",
] as const;
export type ArtifactGenerationStatus = (typeof ARTIFACT_GENERATION_STATUSES)[number];

export const ARTIFACT_TEMPLATE_CERTIFICATION = ["EXAMPLE_ONLY", "VALIDATING", "CERTIFIED", "RETIRED"] as const;
export type ArtifactTemplateCertification = (typeof ARTIFACT_TEMPLATE_CERTIFICATION)[number];

export const GENERATION_READINESS_POLICIES = ["REQUIRE_READY", "ALLOW_READY_WITH_CONDITIONS", "ALLOW_INCOMPLETE_DRAFT"] as const;
export type GenerationReadinessPolicy = (typeof GENERATION_READINESS_POLICIES)[number];

export type GovernedFormula = {
  id: string;
  cell: string;
  formula: string;
  description: string;
  unit: string;
};

export type EngineeringArtifactTemplate = {
  id: string;
  code: string;
  version: string;
  name: string;
  artifactType: ArtifactType;
  outputFormat: ArtifactOutputFormat;
  workTypes: GeneratorWorkType[];
  lifecycleStages: LifecycleStage[];
  expectedOutputType: ExpectedOutputType;
  readinessPolicy: GenerationReadinessPolicy;
  certification: ArtifactTemplateCertification;
  sheetsOrSections: string[];
  formulas: GovernedFormula[];
  reviewRequired: true;
  productionEngineeringUse: false;
};

export type ArtifactProvenanceManifest = {
  projectId: string;
  workspaceId: string;
  workPlanId: string;
  workTemplateCode: string;
  workTemplateVersion: string;
  artifactTemplateCode: string;
  artifactTemplateVersion: string;
  lifecycleStage: string;
  discipline: string | null;
  systemId: string | null;
  assetId: string | null;
  information: Array<{ title: string; revision?: string | null; purpose?: string | null }>;
  requirements: string[];
  assumptions: string[];
  interfaces: string[];
  decisions: string[];
  analyses: string[];
  deliverable: string | null;
  inputFingerprint: string;
  generatedAt: string;
  generationRunId: string;
  draft: true;
  engineeringApproved: false;
  exampleOnly: boolean;
};

export type GeneratedEngineeringArtifact = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  generationRunId: string;
  workPlanId: string;
  templateCode: string;
  templateVersion: string;
  artifactType: ArtifactType;
  outputFormat: ArtifactOutputFormat;
  fileName: string;
  mimeType: string;
  sha256: string;
  byteSize: number;
  status: ArtifactGenerationStatus;
  sheetOrSlideCount: number;
  provenance: ArtifactProvenanceManifest;
  warnings: string[];
  contentBase64: string;
  createdAt: string;
  supersededById: string | null;
  lineageKind: "GENERATED_DRAFT" | "RETURNED_FROM_ENGINEER";
  originArtifactId: string | null;
  originGenerationRunId: string | null;
  originSha256: string | null;
  returnedBy: string | null;
  returnedAt: string | null;
  malwareScanStatus: string;
};

export type EngineeringArtifactGenerationRun = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  workPlanId: string;
  templateCode: string;
  templateVersion: string;
  artifactType: ArtifactType;
  outputFormat: ArtifactOutputFormat;
  requestedBy: string | null;
  generatedAt: string;
  workPlanInputFingerprint: string;
  artifactId: string | null;
  status: ArtifactGenerationStatus;
  warnings: string[];
  explanation: string | null;
  metrics: {
    sourceRefsConsumed: number;
    requirementsConsumed: number;
    durationMs: number;
    byteSize: number;
    sheetOrSlideCount: number;
  };
};

export type ArtifactGenerationResult =
  | { ok: true; run: EngineeringArtifactGenerationRun; artifact: GeneratedEngineeringArtifact }
  | { ok: false; run: EngineeringArtifactGenerationRun; artifact: null };

export type WorkPlanLike = Pick<
  EngineeringWorkPlan,
  | "id"
  | "tenantId"
  | "workspaceId"
  | "projectId"
  | "workType"
  | "templateCode"
  | "templateVersion"
  | "discipline"
  | "systemId"
  | "assetId"
  | "lifecycleStage"
  | "readiness"
  | "inputFingerprint"
  | "context"
  | "relatedObjectId"
  | "relatedObjectType"
>;
