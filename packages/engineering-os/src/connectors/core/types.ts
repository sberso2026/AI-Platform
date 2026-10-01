/**
 * EOS-A13C canonical connector core.
 * Shared internal services for A13A/A13B. Not ConnectorV2 / IntegrationPlatform2.
 */

export const CONNECTOR_CORE_RECON = {
  a13aM365: "KEEP",
  a13bEngineering: "KEEP",
  secrets: "REUSE",
  jobService: "REUSE",
  eventBus: "REUSE",
  managedRepository: "REUSE",
  securityHelpers: "MERGE",
  retryBackoff: "MERGE",
  identity: "MERGE",
  idempotency: "MERGE",
  outOfOrder: "MERGE",
  certification: "MERGE",
  health: "MERGE",
  newFramework: false,
  newJobSystem: false,
  newEventBus: false,
} as const;

export const CONNECTOR_RECONCILIATION = [
  { capability: "connection identity", a13a: "M365Connection", a13b: "EngineeringExternalConnection", owner: "vendor-specific records + core catalog", action: "KEEP" },
  { capability: "Secrets", a13a: "credentialSecretId", a13b: "credentialSecretId", owner: "Platform Secrets", action: "REUSE" },
  { capability: "Managed repository", a13a: "SHAREPOINT_LIBRARY", a13b: "ENGINEERING_EDMS / APPLICATION / OTHER", owner: "ManagedEngineeringRepository", action: "REUSE" },
  { capability: "project binding", a13a: "repository.projectId + SharePointScope", a13b: "EngineeringExternalProjectBinding", owner: "core binding contract", action: "MERGE" },
  { capability: "external identity", a13a: "sp:site:drive:item", a13b: "vendor:account:project:type:id", owner: "core identity helpers", action: "MERGE" },
  { capability: "sync cursor", a13a: "deltaToken per repository", a13b: "cursor per connection", owner: "vendor sync state tables", action: "KEEP" },
  { capability: "retry/backoff", a13a: "local backoff()", a13b: "local backoff()", owner: "core.backoff", action: "MERGE" },
  { capability: "SSRF / hosts", a13a: "Graph + SharePoint suffixes", a13b: "Aconex/ACC/P6 suffixes", owner: "core security + vendor allowlists", action: "MERGE" },
  { capability: "JobService", a13a: "engineering.m365.sharepoint.sync", a13b: "engineering.external.connector.sync", owner: "JobService; mode in payload", action: "REUSE" },
  { capability: "composition", a13a: "ingestFromConnector + registerFromConnector", a13b: "same", owner: "A10A/A10B services", action: "REUSE" },
  { capability: "health vs certification", a13a: "ConnectorStatus", a13b: "CONNECTOR_CERTIFICATION_MATRIX", owner: "core matrix + operational status", action: "MERGE" },
  { capability: "admin UI", a13a: "/engineering/settings/integrations", a13b: "same route", owner: "canonical integrations page", action: "KEEP" },
] as const;

export const CONNECTOR_CERTIFICATION_STATES = [
  "CONTRACT_ONLY",
  "FIXTURE_CERTIFIED",
  "LIVE_CERTIFIED_READ",
  "LIVE_CERTIFIED_WRITE",
] as const;
export type ConnectorCertificationState = (typeof CONNECTOR_CERTIFICATION_STATES)[number];

export const CONNECTOR_OPERATIONAL_STATES = [
  "NOT_CONFIGURED",
  "AUTHENTICATION_REQUIRED",
  "CONFIGURED",
  "SYNCING",
  "READY",
  "DEGRADED",
  "RATE_LIMITED",
  "RESYNC_REQUIRED",
  "UNAVAILABLE",
  "BLOCKED",
] as const;
export type ConnectorOperationalState = (typeof CONNECTOR_OPERATIONAL_STATES)[number];

export const CONNECTOR_CAPABILITIES = [
  "DISCOVER",
  "READ_METADATA",
  "READ_CONTENT",
  "DELTA_SYNC",
  "OPEN_SOURCE",
  "PUBLISH_DOCUMENT",
  "UPDATE_RFI_RESPONSE",
  "READ_SCHEDULE",
  "READ_MODEL_METADATA",
] as const;
export type ConnectorCapability = (typeof CONNECTOR_CAPABILITIES)[number];

export const CONNECTOR_JOB_MODES = ["initial", "incremental", "resync"] as const;
export type ConnectorJobMode = (typeof CONNECTOR_JOB_MODES)[number];

export const CANONICAL_CONNECTOR_CERTIFICATION_MATRIX = [
  {
    connector: "SHAREPOINT_LIBRARY",
    vendor: "SHAREPOINT",
    capabilities: {
      DISCOVER: "FIXTURE_CERTIFIED",
      READ_METADATA: "FIXTURE_CERTIFIED",
      READ_CONTENT: "FIXTURE_CERTIFIED",
      DELTA_SYNC: "FIXTURE_CERTIFIED",
      OPEN_SOURCE: "FIXTURE_CERTIFIED",
      PUBLISH_DOCUMENT: "FIXTURE_CERTIFIED",
      UPDATE_RFI_RESPONSE: "NOT_AVAILABLE",
      READ_SCHEDULE: "NOT_AVAILABLE",
      READ_MODEL_METADATA: "NOT_AVAILABLE",
    },
    contract: "IMPLEMENTED",
    fixture: "FIXTURE_CERTIFIED",
    liveRead: "NOT_TESTED",
    liveWrite: "NOT_TESTED",
    authMode: "CLIENT_SECRET",
    jobType: "engineering.m365.sharepoint.sync",
  },
  {
    connector: "EDMS_RFI_DOCUMENT",
    vendor: "ACONEX",
    capabilities: {
      DISCOVER: "FIXTURE_CERTIFIED",
      READ_METADATA: "FIXTURE_CERTIFIED",
      READ_CONTENT: "NOT_AVAILABLE",
      DELTA_SYNC: "FIXTURE_CERTIFIED",
      OPEN_SOURCE: "FIXTURE_CERTIFIED",
      PUBLISH_DOCUMENT: "CONTRACT_ONLY",
      UPDATE_RFI_RESPONSE: "FIXTURE_CERTIFIED",
      READ_SCHEDULE: "NOT_AVAILABLE",
      READ_MODEL_METADATA: "NOT_AVAILABLE",
    },
    contract: "CONTRACT_ONLY",
    fixture: "FIXTURE_CERTIFIED",
    liveRead: "NOT_TESTED",
    liveWrite: "NOT_TESTED",
    authMode: "OAUTH",
    jobType: "engineering.external.connector.sync",
  },
  {
    connector: "BIM_DOCUMENT_SYSTEM",
    vendor: "ACC",
    capabilities: {
      DISCOVER: "FIXTURE_CERTIFIED",
      READ_METADATA: "FIXTURE_CERTIFIED",
      READ_CONTENT: "NOT_AVAILABLE",
      DELTA_SYNC: "FIXTURE_CERTIFIED",
      OPEN_SOURCE: "FIXTURE_CERTIFIED",
      PUBLISH_DOCUMENT: "NOT_AVAILABLE",
      UPDATE_RFI_RESPONSE: "NOT_AVAILABLE",
      READ_SCHEDULE: "NOT_AVAILABLE",
      READ_MODEL_METADATA: "FIXTURE_CERTIFIED",
    },
    contract: "CONTRACT_ONLY",
    fixture: "FIXTURE_CERTIFIED",
    liveRead: "NOT_TESTED",
    liveWrite: "NOT_TESTED",
    authMode: "OAUTH",
    jobType: "engineering.external.connector.sync",
  },
  {
    connector: "PLANNING_SCHEDULE",
    vendor: "P6",
    capabilities: {
      DISCOVER: "FIXTURE_CERTIFIED",
      READ_METADATA: "FIXTURE_CERTIFIED",
      READ_CONTENT: "NOT_AVAILABLE",
      DELTA_SYNC: "FIXTURE_CERTIFIED",
      OPEN_SOURCE: "NOT_AVAILABLE",
      PUBLISH_DOCUMENT: "NOT_AVAILABLE",
      UPDATE_RFI_RESPONSE: "NOT_AVAILABLE",
      READ_SCHEDULE: "FIXTURE_CERTIFIED",
      READ_MODEL_METADATA: "NOT_AVAILABLE",
    },
    contract: "CONTRACT_ONLY",
    fixture: "FIXTURE_CERTIFIED",
    liveRead: "NOT_TESTED",
    liveWrite: "NOT_TESTED",
    authMode: "API_TOKEN",
    jobType: "engineering.external.connector.sync",
  },
  {
    connector: "ENGINEERING_APPLICATION",
    vendor: "SPACE_GASS",
    capabilities: {
      DISCOVER: "CONTRACT_ONLY",
      READ_METADATA: "FIXTURE_CERTIFIED",
      READ_CONTENT: "NOT_AVAILABLE",
      DELTA_SYNC: "NOT_AVAILABLE",
      OPEN_SOURCE: "NOT_AVAILABLE",
      PUBLISH_DOCUMENT: "NOT_AVAILABLE",
      UPDATE_RFI_RESPONSE: "NOT_AVAILABLE",
      READ_SCHEDULE: "NOT_AVAILABLE",
      READ_MODEL_METADATA: "NOT_AVAILABLE",
    },
    contract: "CONTRACT_ONLY",
    fixture: "FIXTURE_CERTIFIED",
    liveRead: "NOT_TESTED",
    liveWrite: "NOT_TESTED",
    authMode: "VENDOR_SERVICE",
    jobType: "engineering.external.connector.sync",
  },
] as const;

export const CONNECTION_OWNERSHIP = {
  m365Connection: "SharePoint Graph application OAuth connection. Vendor-specific.",
  engineeringExternalConnection: "Canonical non-Microsoft engineering connection (EDMS/BIM/Planning/tools).",
  overlap: "Distinct records. SharePoint is not duplicated as EngineeringExternalConnection in A13C.",
  secrets: "credentialSecretId only. Tokens never persist on connection/binding/object/sync rows.",
} as const;

export const DEFAULT_CONNECTOR_WRITE_POLICY = "READ_ONLY" as const;

export const MALWARE_FLOW_CLASSIFICATION = {
  METADATA_ONLY: "no binary malware scan; bytes are not ingested",
  ON_DEMAND_EXTERNAL_READ: "requires content safety policy; HOSTED_CLAMAV UNAVAILABLE fail-closed for production ingest",
  EOS_USER_UPLOAD: "fail closed if malware scanning required and unavailable",
  EOS_GENERATED_OUTBOUND: "trusted generated-artifact boundary",
  FUTURE_TEMPLATE_UPLOAD: "blocked for production until malware control",
} as const;
