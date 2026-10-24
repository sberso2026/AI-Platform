/**
 * EOS-A16A CONNECT freeze.
 * Inventory and classify existing A13/A14 connectivity for a controlled Profile A
 * pilot. Does not rebuild connectors, reopen V5B Structural work, or start HARDEN.
 */

import { CANONICAL_CONNECTOR_CERTIFICATION_MATRIX, DEFAULT_CONNECTOR_WRITE_POLICY } from "./core/types";
import { M365_CONNECTOR_PRIVACY } from "./m365/types";
import { PUBLIC_BUCKET_FORBIDDEN, PUBLIC_BUCKET_REQUIRED } from "../artifact-automation/binary-store";
import { A14A_PILOT_SCOPE } from "../pilot/a14a-profile";
import { INFORMATION_AI_BOUNDARY } from "../information-intelligence/types";
import { WORK_EVENT_TYPES } from "../work-context/types";

export const A16A_PHASE = "CONNECT" as const;
export const A16A_V5B_CERTIFIED_COMMIT = "2ceae81aca55f89992a1897d449eedbc2920f92d";
export const A16A_V5B_REOPEN = false;

export const A16A_ARCHITECTURAL_PRINCIPLE = {
  repositoryDeterminesVisibility: true,
  contextDeterminesMeaning: true,
  eventsDetermineWorkflow: true,
  humansDetermineEngineeringJudgment: true,
  externalSystemsRemainSystemsOfRecord: true,
  eosDoesNotDuplicateRepositoryAuthority: true,
} as const;

export const A16A_STATUS = [
  "IMPLEMENTED",
  "TESTED",
  "LIVE_TESTED",
  "CERTIFIED",
  "DEFERRED",
  "NOT_AVAILABLE",
] as const;
export type A16AStatus = (typeof A16A_STATUS)[number];

export const A16A_PILOT_CLASS = [
  "PILOT_REQUIRED_AND_READY",
  "PILOT_REQUIRED_BLOCKED",
  "PILOT_OPTIONAL_READY",
  "PILOT_OPTIONAL_DEFERRED",
  "OUT_OF_SCOPE",
] as const;
export type A16APilotClass = (typeof A16A_PILOT_CLASS)[number];

/** Honest SharePoint live-test state. No live Graph credentials are wired in this repo. */
export function liveSharePointTestState(): "BLOCKED_EXTERNAL_CONFIGURATION" {
  return "BLOCKED_EXTERNAL_CONFIGURATION";
}

export function hostedMalwareScannerProcessState(env: NodeJS.ProcessEnv = process.env): "DEFERRED_EXTERNAL_DEPENDENCY" | "HOSTED_CLAMAV_CONFIGURED" {
  return env.RTB_REVIEW_CLAMAV_URL?.trim() ? "HOSTED_CLAMAV_CONFIGURED" : "DEFERRED_EXTERNAL_DEPENDENCY";
}

export const A16A_MALWARE_AUTH_MODEL = "UNAUTHENTICATED_HTTP_POST_PRIVATE_NETWORK_REQUIRED" as const;
export const A16A_MALWARE_PUBLIC_ENDPOINT = "PROHIBITED" as const;

export const A16A_OFFICE_INSPECTION_GAP = {
  inspectionReads: "contentBase64",
  objectStoragePointer: "OBJECT_STORAGE",
  boundedAdapterPossible: true,
  boundedAdapterImplemented: false,
  adapterWouldUse: "ArtifactBinaryStore.openRead(pointer, auth)",
  duplicatesStorage: false,
  requiredForMinimumPilotPath: false,
} as const;

export const A16A_CANONICAL_SOURCE_EVENTS = [
  "SOURCE_CREATED",
  "SOURCE_REVISED",
  "SOURCE_PUBLISHED",
  "INFORMATION_RECEIVED",
  "INFORMATION_ACCEPTED",
] as const;

export const A16A_CONNECTIVITY_INVENTORY = [
  {
    connector: "SHAREPOINT_M365",
    implemented: "IMPLEMENTED",
    tested: "TESTED",
    liveTested: "NOT_AVAILABLE",
    certified: "CERTIFIED",
    certifiedScope: "FIXTURE_CERTIFIED_A13A",
    deferred: "DEFERRED",
    deferredItems: ["LIVE_GRAPH", "WEBHOOK_CHANGE_NOTIFICATION", "TEAMS", "OUTLOOK"],
    notAvailable: "NOT_AVAILABLE",
    notAvailableItems: ["PERSONAL_ONEDRIVE", "PERSONAL_EMAIL"],
    pilotClass: "PILOT_REQUIRED_BLOCKED",
    pilotBlocker: "LIVE_SHAREPOINT_TEST=BLOCKED_EXTERNAL_CONFIGURATION",
    readScope: "METADATA_ONLY default; ON_DEMAND_CONTENT allowlisted; READ_CONTENT fixture-certified",
    writeScope: "DEFAULT_READ_ONLY; PUBLISH_DOCUMENT fixture-only; live write NOT_TESTED",
    authenticationModel: "CLIENT_SECRET via ConnectorSecretsPort credentialSecretId; LiveGraphPort client_credentials",
    failureMode: "FAIL_CLOSED GraphPortFailure AUTH/THROTTLE/NETWORK/NOT_FOUND/FORBIDDEN",
    securityStatus: "TENANT_WORKSPACE_PROJECT scoped; SSRF blocked; caller claims rejected; secrets not on records",
  },
  {
    connector: "GENERIC_EDMS",
    implemented: "IMPLEMENTED",
    tested: "TESTED",
    liveTested: "NOT_AVAILABLE",
    certified: "CERTIFIED",
    certifiedScope: "FIXTURE_CERTIFIED_CONTRACT_ONLY_A13B",
    deferred: "DEFERRED",
    deferredItems: ["LIVE_ACONEX", "READ_CONTENT"],
    notAvailable: "NOT_AVAILABLE",
    notAvailableItems: ["READ_CONTENT", "LIVE_WRITE"],
    pilotClass: "PILOT_OPTIONAL_DEFERRED",
    pilotBlocker: null,
    readScope: "DISCOVER/READ_METADATA/DELTA/OPEN_SOURCE fixture; content NOT_AVAILABLE",
    writeScope: "PUBLISH_DOCUMENT CONTRACT_ONLY; UPDATE_RFI_RESPONSE fixture-only",
    authenticationModel: "OAUTH credentialSecretId",
    failureMode: "FAIL_CLOSED capability + classifyConnectorFailure",
    securityStatus: "Distinct EngineeringExternalConnection; no SharePoint duplication",
  },
  {
    connector: "BIM",
    implemented: "IMPLEMENTED",
    tested: "TESTED",
    liveTested: "NOT_AVAILABLE",
    certified: "CERTIFIED",
    certifiedScope: "FIXTURE_CERTIFIED_CONTRACT_ONLY_A13B",
    deferred: "DEFERRED",
    deferredItems: ["LIVE_ACC", "READ_CONTENT"],
    notAvailable: "NOT_AVAILABLE",
    notAvailableItems: ["READ_CONTENT", "PUBLISH_DOCUMENT"],
    pilotClass: "PILOT_OPTIONAL_DEFERRED",
    pilotBlocker: null,
    readScope: "DISCOVER/READ_METADATA/READ_MODEL_METADATA fixture",
    writeScope: "NONE",
    authenticationModel: "OAUTH credentialSecretId",
    failureMode: "FAIL_CLOSED",
    securityStatus: "Project-bound canonical identity; no KG authority",
  },
  {
    connector: "PLANNING",
    implemented: "IMPLEMENTED",
    tested: "TESTED",
    liveTested: "NOT_AVAILABLE",
    certified: "CERTIFIED",
    certifiedScope: "FIXTURE_CERTIFIED_CONTRACT_ONLY_A13B",
    deferred: "DEFERRED",
    deferredItems: ["LIVE_P6"],
    notAvailable: "NOT_AVAILABLE",
    notAvailableItems: ["READ_CONTENT", "OPEN_SOURCE", "PUBLISH_DOCUMENT"],
    pilotClass: "PILOT_OPTIONAL_DEFERRED",
    pilotBlocker: null,
    readScope: "READ_SCHEDULE fixture",
    writeScope: "NONE",
    authenticationModel: "API_TOKEN credentialSecretId",
    failureMode: "FAIL_CLOSED",
    securityStatus: "Same external connector isolation as EDMS/BIM",
  },
  {
    connector: "OBJECT_STORAGE",
    implemented: "IMPLEMENTED",
    tested: "TESTED",
    liveTested: "TESTED",
    certified: "CERTIFIED",
    certifiedScope: "A14A_PRIVATE_OBJECT_STORAGE",
    deferred: "DEFERRED",
    deferredItems: [],
    notAvailable: "NOT_AVAILABLE",
    notAvailableItems: ["PUBLIC_BUCKET"],
    pilotClass: "PILOT_REQUIRED_AND_READY",
    pilotBlocker: null,
    readScope: "Authorized openRead / short-lived signed URL; tenant/workspace/project object key",
    writeScope: "Server-side put only; no public bucket; no permanent links",
    authenticationModel: "Caller commerce + object-key scope assert; not service-role as user substitute",
    failureMode: "FAIL_CLOSED OBJECT_KEY_SCOPE_DENIED / SIGNED_URL_EXPIRED",
    securityStatus: "PUBLIC_BUCKET_FORBIDDEN; non-public engineering-artifacts bucket",
  },
  {
    connector: "MANAGED_REPOSITORY",
    implemented: "IMPLEMENTED",
    tested: "TESTED",
    liveTested: "NOT_AVAILABLE",
    certified: "CERTIFIED",
    certifiedScope: "A10B_A13A_FIXTURE",
    deferred: "DEFERRED",
    deferredItems: ["LIVE_SHAREPOINT_REGISTRATION"],
    notAvailable: "NOT_AVAILABLE",
    notAvailableItems: [],
    pilotClass: "PILOT_REQUIRED_AND_READY",
    pilotBlocker: null,
    readScope: "Allowlisted repository identity + source refs; capture DENY default",
    writeScope: "Registration only; no duplicate document authority",
    authenticationModel: "work.repository.write + tenant/workspace filter",
    failureMode: "FAIL_CLOSED unmanaged / personal OneDrive / cross-tenant",
    securityStatus: "ALLOWLISTED_REPOSITORIES_ONLY",
  },
  {
    connector: "INTERNALLY_GENERATED_ARTIFACT_FLOW",
    implemented: "IMPLEMENTED",
    tested: "TESTED",
    liveTested: "TESTED",
    certified: "CERTIFIED",
    certifiedScope: "A11C_A14A_A15A",
    deferred: "DEFERRED",
    deferredItems: [],
    notAvailable: "NOT_AVAILABLE",
    notAvailableItems: [],
    pilotClass: "PILOT_REQUIRED_AND_READY",
    pilotBlocker: null,
    readScope: "Governed generation + authorized download/handoff",
    writeScope: "EOS-generated drafts only",
    authenticationModel: "Engineering commerce + AAL2 for HITL",
    failureMode: "FAIL_CLOSED generationBlocked / malware not applicable to trusted outbound",
    securityStatus: "Trusted generated-artifact boundary",
  },
  {
    connector: "HOSTED_MALWARE_SCANNER",
    implemented: "IMPLEMENTED",
    tested: "TESTED",
    liveTested: "NOT_AVAILABLE",
    certified: "CERTIFIED",
    certifiedScope: "CONTRACT_AND_LOCAL_FAIL_CLOSED_ONLY",
    deferred: "DEFERRED",
    deferredItems: ["HOSTED_ENDPOINT", "AUTH_HARDENING"],
    notAvailable: "NOT_AVAILABLE",
    notAvailableItems: ["HOSTED_SCAN"],
    pilotClass: "PILOT_OPTIONAL_DEFERRED",
    pilotBlocker: "DEFERRED_EXTERNAL_DEPENDENCY",
    readScope: "POST raw bytes application/octet-stream",
    writeScope: "NONE",
    authenticationModel: A16A_MALWARE_AUTH_MODEL,
    failureMode: "FAIL_CLOSED SCAN_FAILED / SCANNER_UNAVAILABLE / INFECTED",
    securityStatus: "Public scanner PROHIBITED; returned ingest stays disabled until hosted CLEAN proven",
  },
  {
    connector: "RETURNED_EXTERNAL_ARTIFACT_FLOW",
    implemented: "IMPLEMENTED",
    tested: "TESTED",
    liveTested: "NOT_AVAILABLE",
    certified: "CERTIFIED",
    certifiedScope: "FAIL_CLOSED_DISABLED_UNTIL_HOSTED_MALWARE",
    deferred: "DEFERRED",
    deferredItems: ["LIVE_ROUND_TRIP"],
    notAvailable: "NOT_AVAILABLE",
    notAvailableItems: ["PRODUCTION_INGEST"],
    pilotClass: "PILOT_OPTIONAL_DEFERRED",
    pilotBlocker: "HOSTED_MALWARE_SCANNER",
    readScope: "Disabled unless hosted scanner CLEAN",
    writeScope: "NONE until gate PASS",
    authenticationModel: "Same as malware contract",
    failureMode: "FAIL_CLOSED MALWARE_SCAN_FAILED before persist",
    securityStatus: "No bypass for pilot convenience",
  },
  {
    connector: "SPACE_GASS_SOLVER",
    implemented: "IMPLEMENTED",
    tested: "TESTED",
    liveTested: "NOT_AVAILABLE",
    certified: "CERTIFIED",
    certifiedScope: "CONTRACT_ONLY_ADAPTER",
    deferred: "DEFERRED",
    deferredItems: ["LIVE_SOLVER"],
    notAvailable: "NOT_AVAILABLE",
    notAvailableItems: ["CERTIFIED_SOLVER"],
    pilotClass: "OUT_OF_SCOPE",
    pilotBlocker: "NOT_CERTIFIED",
    readScope: "READ_METADATA fixture",
    writeScope: "NONE",
    authenticationModel: "VENDOR_SERVICE",
    failureMode: "FAIL_CLOSED uncertified numerical calculation",
    securityStatus: "Not a design authority",
  },
  {
    connector: "OFFICE_INSPECTION",
    implemented: "IMPLEMENTED",
    tested: "TESTED",
    liveTested: "NOT_AVAILABLE",
    certified: "CERTIFIED",
    certifiedScope: "TRANSIENT_CONTENT_BASE64_ONLY",
    deferred: "DEFERRED",
    deferredItems: ["OBJECT_STORAGE_BYTE_ADAPTER"],
    notAvailable: "NOT_AVAILABLE",
    notAvailableItems: ["OBJECT_STORAGE_CERTIFICATION_PATH"],
    pilotClass: "PILOT_OPTIONAL_DEFERRED",
    pilotBlocker: "OBJECT_STORAGE_POINTER_NOT_DECODED",
    readScope: "inspectArtifactTransient(contentBase64)",
    writeScope: "NONE persisted inspection",
    authenticationModel: "Same as artifact read; adapter not wired",
    failureMode: "Skip / empty decode if contentBase64 absent",
    securityStatus: "Must not duplicate binaries into relational records",
  },
] as const;

export const A16A_PROFILE_A_MINIMUM_CONNECTION_SET = {
  mandatoryForPilot: [
    "OBJECT_STORAGE",
    "INTERNALLY_GENERATED_ARTIFACT_FLOW",
    "MANAGED_REPOSITORY",
    "ENGINEERING_INFORMATION_SOURCE_REFS",
    "PREISSUE_SOURCE_CONDITIONS",
    "SHAREPOINT_M365_READ_PATH",
  ],
  optionalForPilot: ["GENERIC_EDMS", "BIM", "PLANNING", "SHAREPOINT_WRITE_PUBLISH", "OFFICE_INSPECTION_OBJECT_STORAGE_ADAPTER"],
  deferred: ["HOSTED_MALWARE_SCANNER", "RETURNED_EXTERNAL_ARTIFACT_FLOW", "LIVE_SHAREPOINT", "TEAMS", "OUTLOOK", "SPACE_GASS_SOLVER"],
  note: "SharePoint live Graph is the only implemented real enterprise SoR path for Profile A managed sources. Framework is ready; live credentials are absent. Profile A Core EOS still operates on EOS-local sources without live SharePoint.",
} as const;

export const A16A_PILOT_REQUIRED_READY = [
  "OBJECT_STORAGE",
  "INTERNALLY_GENERATED_ARTIFACT_FLOW",
  "MANAGED_REPOSITORY",
  "ENGINEERING_INFORMATION_SOURCE_REFS",
  "PREISSUE_SOURCE_CONDITIONS",
  "SHAREPOINT_M365_READ_PATH_FIXTURE",
] as const;

export const A16A_PILOT_REQUIRED_BLOCKED = ["LIVE_SHAREPOINT_READ"] as const;

export const A16A_PILOT_OPTIONAL_DEFERRED = [
  "GENERIC_EDMS",
  "BIM",
  "PLANNING",
  "SHAREPOINT_WRITE",
  "HOSTED_MALWARE_SCANNER",
  "RETURNED_EXTERNAL_ARTIFACT_FLOW",
  "OFFICE_INSPECTION_OBJECT_STORAGE_ADAPTER",
] as const;

export const A16A_OUT_OF_SCOPE = ["SPACE_GASS_SOLVER", "TEAMS_CONNECTOR", "OUTLOOK_CONNECTOR", "WEBHOOK_CHANGE_NOTIFICATION"] as const;

export function a16aConnectAssertions() {
  if (DEFAULT_CONNECTOR_WRITE_POLICY !== "READ_ONLY") throw new Error("write_policy_regressed");
  if (PUBLIC_BUCKET_REQUIRED !== false || PUBLIC_BUCKET_FORBIDDEN !== true) throw new Error("public_bucket_regressed");
  if (M365_CONNECTOR_PRIVACY.personalOneDriveAccess !== "PROHIBITED") throw new Error("personal_onedrive_regressed");
  if (INFORMATION_AI_BOUNDARY.maySelectAuthoritativeSource !== false) throw new Error("human_authority_regressed");
  if (INFORMATION_AI_BOUNDARY.mayApproveInformation !== false) throw new Error("human_authority_regressed");
  for (const event of A16A_CANONICAL_SOURCE_EVENTS) {
    if (!(WORK_EVENT_TYPES as readonly string[]).includes(event)) throw new Error(`missing_canonical_event:${event}`);
  }
  const sharepoint = CANONICAL_CONNECTOR_CERTIFICATION_MATRIX.find((row) => row.connector === "SHAREPOINT_LIBRARY");
  if (!sharepoint || sharepoint.liveRead !== "NOT_TESTED") throw new Error("sharepoint_live_honesty_regressed");
  if (A14A_PILOT_SCOPE.excluded.includes("returned binary uploads until hosted malware PASS") === false) {
    throw new Error("returned_artifact_exclusion_regressed");
  }
  return {
    phase: A16A_PHASE,
    writePolicy: DEFAULT_CONNECTOR_WRITE_POLICY,
    liveSharePoint: liveSharePointTestState(),
    publicBucketForbidden: PUBLIC_BUCKET_FORBIDDEN,
  } as const;
}
