/**
 * EOS-A13A Microsoft 365 / SharePoint connector foundation.
 * External system owns source content. EOS stores engineering context,
 * references, authority policy, provenance, relationships, and workflow state.
 */

export const M365_CONNECTOR_RECON = {
  integrationRegistry: "REUSE",
  connectorAbstractions: "EXTEND",
  microsoft365Contracts: "EXTEND",
  businessOsM365: "COMPOSE",
  sharepoint: "EXTEND",
  graphApi: "EXTEND",
  oauthUtilities: "REUSE",
  entra: "COMPOSE",
  secretsService: "REUSE",
  apiKeys: "REUSE",
  jobService: "REUSE",
  eventBus: "REUSE",
  notifications: "COMPOSE",
  telemetry: "REUSE",
  audit: "REUSE",
  managedEngineeringRepository: "EXTEND",
  engineeringWorkEventNormalizer: "COMPOSE",
  engineeringInformationRef: "COMPOSE",
  documentDomain: "COMPOSE",
  search: "COMPOSE",
  connectorHealthUi: "EXTEND",
  webhookInfrastructure: "REUSE",
  syncCursor: "EXTEND",
  newIntegrationFramework: false,
  newEventBus: false,
  newJobSystem: false,
  newDms: false,
  newGraphStore: false,
} as const;

export const M365_CONNECTOR_PRIVACY = {
  personalOneDriveAccess: "PROHIBITED",
  personalEmailAccess: "PROHIBITED",
  teamsBroadIngestion: "PROHIBITED",
  tenantWideSharePointCrawl: "PROHIBITED",
  employeeProductivityTelemetry: "PROHIBITED",
  defaultCapturePolicy: "DENY",
  allowlistedRepositoriesOnly: true,
  newContentBase64Usage: false,
  connectorBinaryDuplication: false,
} as const;

export const M365_AI_BOUNDARY = {
  mayGuessProjectBinding: false,
  mayGrantAuthorityFromPresence: false,
  mayIngestUnmanagedSites: false,
} as const;

export const M365_JOB_TYPE = "engineering.m365.sharepoint.sync" as const;

export const M365_AUTH_MODES = ["CLIENT_SECRET", "CERTIFICATE", "MANAGED_IDENTITY"] as const;
export type M365AuthMode = (typeof M365_AUTH_MODES)[number];

export const CONNECTOR_STATUSES = [
  "NOT_CONFIGURED",
  "AUTHENTICATING",
  "CONFIGURED",
  "SYNCING",
  "READY",
  "DEGRADED",
  "RATE_LIMITED",
  "RESYNC_REQUIRED",
  "UNAVAILABLE",
  "BLOCKED",
  "AUTHENTICATION_REQUIRED",
] as const;
export type ConnectorStatus = (typeof CONNECTOR_STATUSES)[number];

export const CONTENT_ACCESS_POLICIES = ["METADATA_ONLY", "ON_DEMAND_CONTENT", "INDEX_APPROVED_TYPES"] as const;
export type ContentAccessPolicy = (typeof CONTENT_ACCESS_POLICIES)[number];

export const SOURCE_AVAILABILITY = [
  "ACTIVE",
  "MOVED_OUTSIDE_SCOPE",
  "DELETED",
  "UNAVAILABLE",
  "DISABLED",
] as const;
export type SourceAvailability = (typeof SOURCE_AVAILABILITY)[number];

export const INDEXABLE_ENGINEERING_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/pdf",
  "text/plain",
  "text/csv",
] as const;

export const CAD_BIM_METADATA_ONLY = ["DWG", "DGN", "RVT", "IFC"] as const;

export const MICROSOFT_PERMISSION_MODEL = {
  preferred: "Sites.Selected (application) on explicitly approved SharePoint sites/libraries",
  optionalWrite: "Sites.Selected write on the same approved site for governed artifact publication",
  notRequired: [
    "Sites.Read.All tenant-wide",
    "Files.Read.All tenant-wide",
    "User.Read.All",
    "Mail.Read",
    "Mail.ReadWrite",
    "ChannelMessage.Read.All",
    "Files.Read.All on personal OneDrive",
  ],
  personalOneDrive: "PROHIBITED",
  personalEmail: "PROHIBITED",
} as const;

export const ALLOWED_GRAPH_HOSTS = ["graph.microsoft.com", "login.microsoftonline.com"] as const;
export const ALLOWED_SHAREPOINT_HOST_SUFFIXES = [".sharepoint.com", ".sharepoint.com.au", ".office.com", ".office365.com", ".microsoft.com"] as const;

export const MAX_CONTENT_BYTES = 25 * 1024 * 1024;
export const DEFAULT_PAGE_SIZE = 50;

export type M365Connection = {
  id: string;
  tenantId: string;
  workspaceId: string;
  displayName: string;
  microsoftTenantId: string;
  applicationId: string;
  credentialSecretId: string;
  authMode: M365AuthMode;
  status: ConnectorStatus;
  enabled: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SharePointScope = {
  id: string;
  repositoryId: string;
  tenantId: string;
  workspaceId: string;
  connectionId: string;
  externalSiteId: string;
  externalDriveId: string;
  approvedRootItemId: string | null;
  contentAccessPolicy: ContentAccessPolicy;
  publicationEnabled: boolean;
};

export type ConnectorSyncState = {
  id: string;
  repositoryId: string;
  tenantId: string;
  workspaceId: string;
  status: ConnectorStatus;
  deltaToken: string | null;
  lastSuccessfulSyncAt: string | null;
  lastAttemptedSyncAt: string | null;
  lastError: string | null;
  itemsScanned: number;
  itemsChanged: number;
  throttleCount: number;
  retryCount: number;
  nextRetryAt: string | null;
  resyncRequired: boolean;
  durationMs: number;
};

export type ExternalSourceRef = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  repositoryId: string;
  connectionId: string;
  sourceSystem: "sharepoint";
  microsoftTenantId: string;
  siteId: string;
  driveId: string;
  itemId: string;
  listItemId: string | null;
  parentItemId: string | null;
  displayName: string;
  webUrl: string | null;
  pathWithinRoot: string;
  mimeType: string | null;
  sizeBytes: number | null;
  etag: string | null;
  ctag: string | null;
  versionLabel: string | null;
  lastModifiedAt: string | null;
  lastModifiedBy: string | null;
  availability: SourceAvailability;
  fingerprint: string;
  informationRefId: string | null;
  occurredAt: string;
  recordedAt: string;
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

export type GraphDriveItem = {
  id: string;
  name: string;
  parentId: string | null;
  siteId: string;
  driveId: string;
  driveType?: "documentLibrary" | "personal" | "business" | string;
  webUrl?: string | null;
  mimeType?: string | null;
  size?: number | null;
  etag?: string | null;
  ctag?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: string | null;
  pathWithinRoot?: string;
  deleted?: boolean;
  folder?: boolean;
};

export type GraphPage<T> = {
  items: T[];
  nextLink?: string | null;
  deltaLink?: string | null;
  resyncRequired?: boolean;
  status?: number;
  retryAfterMs?: number;
};

export type ConnectorSecretsPort = {
  getSecretValue(secretId: string): Promise<string | null>;
};

export type ConnectorTelemetry = {
  apiRequestDurationMs: number[];
  syncDurationMs: number[];
  itemsProcessed: number;
  errors: number;
  throttles: number;
  retries: number;
};
