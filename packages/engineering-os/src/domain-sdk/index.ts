/**
 * Engineering Domain SDK — shared domain contracts for all Engineering OS modules.
 * Modules reference shared-domain identities; they do not own Projects/Assets registries.
 */
export const ENGINEERING_DOMAIN_SDK_VERSION = "0.4.0" as const;

export type EngineeringProjectRef = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type EngineeringAssetRef = {
  tenantId: string;
  workspaceId: string;
  assetId: string;
  equipmentId?: string;
};

export type EngineeringLocationRef = {
  tenantId: string;
  workspaceId: string;
  locationId: string;
  siteId?: string;
};

export type EngineeringDocumentRef = {
  tenantId: string;
  workspaceId: string;
  documentId: string;
  revisionId?: string;
};

export type EngineeringEvidenceRef = {
  evidenceId: string;
  fileId?: string;
  contentHash?: string;
  version?: number;
};

export type EngineeringMeasurementRef = {
  measurementId: string;
  measurementType: string;
  unit?: string;
};

export type EngineeringFindingRef = {
  findingId: string;
  sourceModule: string;
};

export type EngineeringDefectRef = {
  defectId: string;
  taxonomyCode?: string;
};

export type EngineeringRecommendationRef = {
  recommendationId: string;
  action: string;
};

export type EngineeringReviewRef = {
  reviewId: string;
  status: string;
};

export type EngineeringApprovalRef = {
  approvalId: string;
  status: string;
};

export type EngineeringWorkflowRef = {
  instanceId: string;
  definitionSlug: string;
};

export type EngineeringTimelineRef = {
  timelineEventId: string;
  entityType: string;
  entityId: string;
};

export type EngineeringReportRef = {
  reportId: string;
  packId?: string;
  reportKey: string;
};

export type EngineeringAuditRef = {
  auditLinkId?: string;
  action: string;
  entityType: string;
  entityId: string;
};

export type EngineeringKnowledgeGraphRef = {
  nodeId?: string;
  edgeId?: string;
  /** Platform KG only — never a private graph. */
  platformOwned: true;
};

export type EngineeringDomainSdkContracts = {
  projects: EngineeringProjectRef;
  assets: EngineeringAssetRef;
  locations: EngineeringLocationRef;
  documents: EngineeringDocumentRef;
  evidence: EngineeringEvidenceRef;
  measurements: EngineeringMeasurementRef;
  findings: EngineeringFindingRef;
  defects: EngineeringDefectRef;
  recommendations: EngineeringRecommendationRef;
  reviews: EngineeringReviewRef;
  approvals: EngineeringApprovalRef;
  workflows: EngineeringWorkflowRef;
  timeline: EngineeringTimelineRef;
  reports: EngineeringReportRef;
  audit: EngineeringAuditRef;
  knowledgeGraph: EngineeringKnowledgeGraphRef;
};

export const ENGINEERING_DOMAIN_SDK_CONTRACT_KEYS = [
  "projects",
  "assets",
  "locations",
  "documents",
  "evidence",
  "measurements",
  "findings",
  "defects",
  "recommendations",
  "reviews",
  "approvals",
  "workflows",
  "timeline",
  "reports",
  "audit",
  "knowledgeGraph",
] as const;

export function assertEngineeringDomainSdkComplete(
  keys: readonly string[] = ENGINEERING_DOMAIN_SDK_CONTRACT_KEYS,
): void {
  for (const key of ENGINEERING_DOMAIN_SDK_CONTRACT_KEYS) {
    if (!keys.includes(key)) {
      throw new Error(`engineering_domain_sdk_missing:${key}`);
    }
  }
}
