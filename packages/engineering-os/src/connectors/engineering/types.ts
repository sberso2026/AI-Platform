/**
 * EOS-A13B Engineering, EDMS, construction and planning connectors.
 * Extends the A13A connector foundation. External systems own source objects.
 * EOS stores identity, project binding, references, provenance, relationships,
 * workflow state, authority context, and derived Attention.
 */

export const ENGINEERING_CONNECTOR_RECON = {
  a13aConnectorFoundation: "REUSE",
  secrets: "REUSE",
  jobService: "REUSE",
  eventBus: "REUSE",
  audit: "REUSE",
  telemetry: "REUSE",
  managedEngineeringRepository: "REUSE",
  engineeringWorkEvent: "COMPOSE",
  engineeringInformationRef: "COMPOSE",
  a11eChangeWorkbench: "COMPOSE",
  a11aWorkGenerator: "COMPOSE",
  a11bArtifactAutomation: "COMPOSE",
  a11dPreIssueReview: "COMPOSE",
  a12aTemplateResolver: "REUSE",
  a12bAttention: "COMPOSE",
  a10aAuthority: "REUSE",
  a9dStatusMapping: "REUSE",
  a7bAnalysis: "COMPOSE",
  a7cSolver: "DEFERRED_EXTERNAL_DEPENDENCY",
  search: "REUSE",
  digitalThread: "REUSE",
  aconex: "CONTRACT",
  autodeskAcc: "CONTRACT",
  primaveraP6: "CONTRACT",
  spaceGass: "REUSE",
  newConnectorFramework: false,
  newEventBus: false,
  newJobSystem: false,
  newDms: false,
  newGraphStore: false,
  newRfiDomain: false,
  newChangeDomain: false,
  newReviewEngine: false,
} as const;

export const ENGINEERING_CONNECTOR_PRIVACY = {
  defaultCapturePolicy: "DENY" as const,
  defaultWritePolicy: "READ_ONLY" as const,
  personalEmailAccess: "PROHIBITED" as const,
  personalCloudDriveScan: "PROHIBITED" as const,
  employeeActivityCapture: "PROHIBITED" as const,
  binaryDuplication: "NO" as const,
  newContentBase64Usage: false,
  geometryEngineCreated: false,
  cadGeometryExtraction: false,
  spaceGassGuiAutomation: false,
  autonomousRfiIssue: false,
  autonomousFieldChangeApproval: false,
  scheduleAutoCompletesDeliverable: false,
} as const;

export const ENGINEERING_CONNECTOR_AI_BOUNDARY = {
  maySummarizeExternalQuery: true,
  mayDraftResponse: true,
  maySummarizeScheduleContext: true,
  mayExplainSourceChange: true,
  maySuggestEngineeringActions: true,
  maySelectProjectBinding: false,
  mayIssueRfi: false,
  mayCloseTq: false,
  mayApproveDocument: false,
  mayAcceptFieldChange: false,
  mayPublishFormalResponse: false,
  mayChangeSchedule: false,
  mayConfirmEngineeringImpact: false,
} as const;

export const CONNECTOR_CATEGORIES = [
  "EDMS",
  "CONSTRUCTION_MANAGEMENT",
  "BIM_DOCUMENT_SYSTEM",
  "PLANNING_SCHEDULE",
  "ENGINEERING_APPLICATION",
  "OTHER_APPROVED_ENTERPRISE_SOURCE",
] as const;
export type ConnectorCategory = (typeof CONNECTOR_CATEGORIES)[number];

export const CONNECTOR_VENDORS = ["ACONEX", "ACC", "P6", "MSPROJECT", "SHAREPOINT", "SPACE_GASS", "OTHER"] as const;
export type ConnectorVendor = (typeof CONNECTOR_VENDORS)[number];

export const CONNECTOR_AUTH_MODES = ["OAUTH", "API_TOKEN", "CERTIFICATE", "MANAGED_IDENTITY", "VENDOR_SERVICE"] as const;
export type ConnectorAuthMode = (typeof CONNECTOR_AUTH_MODES)[number];

export const CONNECTOR_WRITE_POLICIES = [
  "READ_ONLY",
  "PUBLISH_DOCUMENT",
  "SUBMIT_DRAFT_RESPONSE",
  "UPDATE_REFERENCE_METADATA",
] as const;
export type ConnectorWritePolicy = (typeof CONNECTOR_WRITE_POLICIES)[number];

export const NORMALIZED_EXTERNAL_OBJECT_TYPES = [
  "DOCUMENT",
  "DRAWING",
  "MODEL",
  "RFI",
  "TQ",
  "TRANSMITTAL",
  "FIELD_CHANGE",
  "ISSUE",
  "SCHEDULE_ACTIVITY",
  "MILESTONE",
  "ANALYSIS_FILE",
  "VENDOR_DATA",
] as const;
export type NormalizedExternalObjectType = (typeof NORMALIZED_EXTERNAL_OBJECT_TYPES)[number];

export const CONNECTOR_CERTIFICATION_STATES = [
  "CONTRACT_ONLY",
  "FIXTURE_CERTIFIED",
  "LIVE_CERTIFIED_READ",
  "LIVE_CERTIFIED_WRITE",
] as const;
export type ConnectorCertificationState = (typeof CONNECTOR_CERTIFICATION_STATES)[number];

export const EXTERNAL_JOB_TYPE = "engineering.external.connector.sync" as const;

export const CONNECTOR_CERTIFICATION_MATRIX = [
  {
    connector: "SHAREPOINT_LIBRARY",
    vendor: "SHAREPOINT",
    capability: "Managed document repository",
    contract: "IMPLEMENTED",
    fixture: "FIXTURE_CERTIFIED",
    liveRead: "NOT_TESTED",
    liveWrite: "NOT_TESTED",
    authMode: "CLIENT_SECRET",
    managedScope: "allowlisted site/library/root",
    projectBinding: "YES",
    sourceOwnership: "EXTERNAL",
    status: "A13A IMPLEMENTED / LIVE NOT_TESTED",
  },
  {
    connector: "EDMS_RFI_DOCUMENT",
    vendor: "ACONEX",
    capability: "Document, revision, transmittal, RFI/TQ, correspondence references",
    contract: "CONTRACT_ONLY",
    fixture: "FIXTURE_CERTIFIED",
    liveRead: "NOT_TESTED",
    liveWrite: "NOT_TESTED",
    authMode: "OAUTH",
    managedScope: "bound external project/register",
    projectBinding: "YES",
    sourceOwnership: "EXTERNAL",
    status: "A13B FIXTURE_CERTIFIED / LIVE_ACONEX_CONNECTION NOT_TESTED",
  },
  {
    connector: "BIM_DOCUMENT_SYSTEM",
    vendor: "ACC",
    capability: "Model/drawing/sheet/issue metadata references",
    contract: "CONTRACT_ONLY",
    fixture: "FIXTURE_CERTIFIED",
    liveRead: "NOT_TESTED",
    liveWrite: "NOT_TESTED",
    authMode: "OAUTH",
    managedScope: "bound project/folder",
    projectBinding: "YES",
    sourceOwnership: "EXTERNAL",
    status: "A13B FIXTURE_CERTIFIED / LIVE_BIM_CONNECTION NOT_TESTED",
  },
  {
    connector: "PLANNING_SCHEDULE",
    vendor: "P6",
    capability: "Read-only activity/milestone/WBS context",
    contract: "CONTRACT_ONLY",
    fixture: "FIXTURE_CERTIFIED",
    liveRead: "NOT_TESTED",
    liveWrite: "NOT_TESTED",
    authMode: "API_TOKEN",
    managedScope: "bound external project",
    projectBinding: "YES",
    sourceOwnership: "EXTERNAL",
    status: "A13B FIXTURE_CERTIFIED / LIVE_PLANNING_CONNECTION NOT_TESTED",
  },
  {
    connector: "ENGINEERING_APPLICATION",
    vendor: "SPACE_GASS",
    capability: "Specialist tool/file references via External Tool Governance",
    contract: "CONTRACT_ONLY",
    fixture: "FIXTURE_CERTIFIED",
    liveRead: "NOT_TESTED",
    liveWrite: "NOT_TESTED",
    authMode: "VENDOR_SERVICE",
    managedScope: "managed analysis file reference",
    projectBinding: "YES",
    sourceOwnership: "EXTERNAL",
    status: "A7C DEFERRED_EXTERNAL_DEPENDENCY / no GUI automation",
  },
] as const;

export const EDMS_STATUS_MAPPING = [
  { vendorStatus: "Open", eosQueryState: "OPEN", eosDocumentStatus: null, authority: "UNVERIFIED", issued: false },
  { vendorStatus: "Responded", eosQueryState: "RESPONSE_DRAFTED", eosDocumentStatus: null, authority: "UNVERIFIED", issued: false },
  { vendorStatus: "Closed", eosQueryState: "EXTERNALLY_CLOSED", eosDocumentStatus: null, authority: "UNVERIFIED", issued: false },
  { vendorStatus: "For Information", eosQueryState: null, eosDocumentStatus: "FOR_INFORMATION", authority: "UNVERIFIED", issued: false },
  { vendorStatus: "Issued for Construction", eosQueryState: null, eosDocumentStatus: "IFC", authority: "UNVERIFIED", issued: true },
  { vendorStatus: "Rev D", eosQueryState: null, eosDocumentStatus: "CURRENT_REVISION", authority: "UNVERIFIED", issued: false },
] as const;

export const ALLOWED_EXTERNAL_HOST_SUFFIXES = [
  ".sharepoint.com",
  ".sharepoint.com.au",
  ".aconex.com",
  ".oraclecloud.com",
  ".autodesk.com",
  ".acc.autodesk.com",
] as const;

export const MAX_EXTERNAL_CONTENT_BYTES = 25 * 1024 * 1024;

export type EngineeringExternalConnection = {
  id: string;
  tenantId: string;
  workspaceId: string;
  displayName: string;
  category: ConnectorCategory;
  vendor: ConnectorVendor;
  credentialSecretId: string;
  authMode: ConnectorAuthMode;
  writePolicy: ConnectorWritePolicy;
  status: string;
  enabled: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EngineeringExternalProjectBinding = {
  id: string;
  connectionId: string;
  tenantId: string;
  workspaceId: string;
  eosProjectId: string;
  externalAccountId: string;
  externalProjectId: string;
  externalScope: string | null;
  repositoryId: string | null;
  enabled: boolean;
};

export type EngineeringExternalObjectRef = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  connectionId: string;
  bindingId: string;
  repositoryId: string | null;
  sourceSystem: string;
  externalAccountId: string;
  externalProjectId: string;
  objectType: NormalizedExternalObjectType;
  objectId: string;
  objectNumber: string | null;
  displayName: string;
  webUrl: string | null;
  version: string | null;
  etag: string | null;
  vendorStatus: string | null;
  eosMappedStatus: string | null;
  fingerprint: string;
  availability: "ACTIVE" | "DELETED" | "DISABLED" | "UNAVAILABLE";
  informationRefId: string | null;
  relatedCanonicalType: string | null;
  relatedCanonicalId: string | null;
  occurredAt: string;
  recordedAt: string;
  metadata: Record<string, unknown>;
};

export type EngineeringConnectorSyncState = {
  id: string;
  connectionId: string;
  tenantId: string;
  workspaceId: string;
  status: string;
  cursor: string | null;
  lastSuccessfulSyncAt: string | null;
  lastAttemptedSyncAt: string | null;
  lastError: string | null;
  itemsScanned: number;
  itemsChanged: number;
  throttleCount: number;
  retryCount: number;
  durationMs: number;
  syncMode: "WEBHOOK" | "BOUNDED_POLL";
};

export type VendorExternalObject = {
  objectType: NormalizedExternalObjectType;
  objectId: string;
  objectNumber?: string | null;
  displayName: string;
  externalAccountId: string;
  externalProjectId: string;
  version?: string | null;
  etag?: string | null;
  vendorStatus?: string | null;
  webUrl?: string | null;
  occurredAt: string;
  relatedDocumentIds?: string[];
  systemId?: string | null;
  percentComplete?: number | null;
  neededBy?: string | null;
  summary?: string | null;
  issued?: boolean;
};

export type ConnectorTelemetry = {
  apiRequestDurationMs: number[];
  syncDurationMs: number[];
  itemsProcessed: number;
  errors: number;
  throttles: number;
  retries: number;
};

export type ConnectorAuditEvent = {
  id: string;
  tenantId: string;
  workspaceId: string;
  action: string;
  actorId: string | null;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};
