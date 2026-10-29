/**
 * EOS-D1M-R6 file and API adapter boundary.
 * Records who may later supply evidence and under which contract. It does not parse, ingest, or connect.
 */
import {
  D1M_0_FORMAT_DISPOSITIONS,
  D1M_0_SOURCE_CLASSES,
  D1M_0_SUPPORTED_FORMATS,
  D1M_R1_CANONICAL_PHASE,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D1M_R2_CANONICAL_PHASE } from "./cad-bim-source-revision";
import { D1M_R3_CANONICAL_PHASE } from "./cad-bim-object-mapping";
import { D1M_R4_CANONICAL_PHASE } from "./cad-bim-model-evidence";
import { D1M_R5_CANONICAL_PHASE } from "./cad-bim-reference-context";
import { D1M_R6_CANONICAL_PHASE, D1M_R6_CANONICAL_SCOPE, D1M_R6_PHASE_TYPE as OWNED_R6_PHASE_TYPE } from "./cad-bim-model-relationship";
import { D1L_R6_TRACK_COMPLETE, D1L_R6_TRACK_STATUS } from "./certification-gate-closeout";
import { D1K_R5_CROSS_DISCIPLINE_INTELLIGENCE_READY, D1K_R5_INTERNAL_DISCIPLINE_INTEGRATION_READY } from "./interface-closeout";
import { POST_D1J_STRUCTURAL_DEBT_LEDGER } from "./post-d1j-roadmap";
import {
  D1_STRUCTURAL_PACK_COMPLETE,
  D1G_CERTIFIED_SOLVER_STATUS,
  D1G_CONFORMANCE_VALIDATED,
  D1G_ENGINEER_VALIDATED,
  D1G_LIVE_VALIDATED,
  GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
} from "./roadmap-after-twin-closeout";

export const D1M_R6_PHASE = D1M_R6_CANONICAL_PHASE;
export const D1M_R6_PHASE_TYPE = OWNED_R6_PHASE_TYPE;
export const D1M_R6_STATUS = "ADAPTER_BOUNDARY_IMPLEMENTED" as const;
export const D1M_R6_MATURITY_STATE = "STRUCTURAL_CAD_OR_BIM_FILE_API_ADAPTER_BOUNDARY_IMPLEMENTED" as const;
export const D1M_R6_SCOPE = D1M_R6_CANONICAL_SCOPE;
export const D1M_R6_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1M_R6_FILE_API_ADAPTER_BOUNDARY_CLOSEOUT.md" as const;
export const D1M_R6_PARENT_ARCHITECTURE_PATH = "docs/architecture/engineering-os/EOS_D1M_0_CAD_OR_BIM_INTELLIGENCE_ARCHITECTURE.md" as const;
export const D1M_R6_R1_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1M_R1_CAD_OR_BIM_ARTIFACT_SOURCE_REVISION_FOUNDATION_CLOSEOUT.md" as const;
export const D1M_R6_R2_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1M_R2_SOURCE_OBJECT_STRUCTURAL_TARGET_MAPPING_CLOSEOUT.md" as const;
export const D1M_R6_R3_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1M_R3_GEOMETRY_SEMANTIC_EVIDENCE_CLOSEOUT.md" as const;
export const D1M_R6_R4_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1M_R4_UNIT_COORDINATE_AXIS_REFERENCE_CLOSEOUT.md" as const;
export const D1M_R6_R5_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1M_R5_MODEL_RELATIONSHIP_EVIDENCE_CLOSEOUT.md" as const;
export const D1M_R6_BOUNDARY_CLASSES = ["FILE_SOURCE_BOUNDARY", "API_SOURCE_BOUNDARY"] as const;
export const D1M_R6_PARSER_TRUST_CLASSES = ["UNAVAILABLE", "UNTRUSTED", "ISOLATED"] as const;
export const D1M_R6_PERMITTED_OPERATIONS = [D1M_R1_CANONICAL_PHASE, D1M_R2_CANONICAL_PHASE, D1M_R3_CANONICAL_PHASE, D1M_R4_CANONICAL_PHASE, D1M_R5_CANONICAL_PHASE] as const;
export const D1M_R6_FORMAT_DISPOSITIONS = D1M_0_FORMAT_DISPOSITIONS;
export const D1M_R6_SUPPORTED_FORMATS = D1M_0_SUPPORTED_FORMATS;
export const D1M_R6_ARCHITECTURE_READY = true as const;
export const D1M_R6_SOURCE_REFERENCE_RUNTIME_READY = true as const;
export const D1M_R6_MODEL_EVIDENCE_RUNTIME_READY = true as const;
export const D1M_R6_ADAPTER_BOUNDARY_RUNTIME_READY = true as const;
export const D1M_R6_FORMAT_ADAPTER_RUNTIME_READY = false as const;
export const D1M_R6_STRUCTURAL_INTERPRETATION_RUNTIME_READY = false as const;
export const D1M_R6_CHANGE_GOVERNANCE_RUNTIME_READY = false as const;
export const D1M_R6_ADAPTER_IDENTITY_RUNTIME_IMPLEMENTED = true as const;
export const D1M_R6_ADAPTER_IDENTITY_RUNTIME_COUNT = 1 as const;
export const D1M_R6_EXACT_ADAPTER_VERSION_REQUIRED = true as const;
export const D1M_R6_FLOATING_ADAPTER_VERSION_ALLOWED = false as const;
export const D1M_R6_ADAPTER_VERSION_AUTO_UPGRADED = false as const;
export const D1M_R6_ADAPTER_CONTRACT_RUNTIME_IMPLEMENTED = true as const;
export const D1M_R6_ADAPTER_CONTRACT_RUNTIME_COUNT = 1 as const;
export const D1M_R6_CONTRACT_FINGERPRINT_IMPLEMENTED = true as const;
export const D1M_R6_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D1M_R6_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D1M_R6_CAPABILITY_DECLARATION_RUNTIME_IMPLEMENTED = true as const;
export const D1M_R6_CAPABILITY_DECLARATION_RUNTIME_COUNT = 1 as const;
export const D1M_R6_DECLARED_CAPABILITY_EQUALS_SUPPORTED = false as const;
export const D1M_R6_DECLARED_SOURCE_FORMAT_EQUALS_SUPPORTED = false as const;
export const D1M_R6_SUPPORTED_FORMAT_COUNT = D1M_0_SUPPORTED_FORMATS.length;
export const D1M_R6_UNSUPPORTED_FORMAT_AUTO_ACCEPTED = false as const;
export const D1M_R6_UNKNOWN_FORMAT_DEFAULTS_SUPPORTED = false as const;
export const D1M_R6_ADAPTER_CAN_SELF_PROMOTE = false as const;
export const D1M_R6_IFC_RUNTIME_SUPPORTED = false as const;
export const D1M_R6_RVT_RUNTIME_SUPPORTED = false as const;
export const D1M_R6_DWG_RUNTIME_SUPPORTED = false as const;
export const D1M_R6_DXF_RUNTIME_SUPPORTED = false as const;
export const D1M_R6_TEKLA_RUNTIME_SUPPORTED = false as const;
export const D1M_R6_FILE_API_DISTINCTION_IMPLEMENTED = true as const;
export const D1M_R6_SOURCE_AUTHENTICATION_IMPLEMENTED = true as const;
export const D1M_R6_AUTHENTICATED_EQUALS_AUTHORIZED = false as const;
export const D1M_R6_AUTHENTICATED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R6_API_AUTHENTICATED_EQUALS_ENGINEERING_APPROVED = false as const;
export const D1M_R6_TRUST_POLICY_RUNTIME_IMPLEMENTED = true as const;
export const D1M_R6_TRUST_POLICY_RUNTIME_COUNT = 1 as const;
export const D1M_R6_PARSER_TRUST_SCORE_IMPLEMENTED = false as const;
export const D1M_R6_PARSER_TRUSTED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R6_PARSER_OUTPUT_EQUALS_VALIDATED_EVIDENCE = false as const;
export const D1M_R6_AUTHORITY_PRESERVED = true as const;
export const D1M_R6_PROVENANCE_PRESERVED = true as const;
export const D1M_R6_AUTHORITY_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1M_R6_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const D1M_R6_ADMIN_EQUALS_ENGINEERING_AUTHORITY = false as const;
export const D1M_R6_R1_REUSED = true as const;
export const D1M_R6_PARALLEL_ARTIFACT_GOVERNANCE_CREATED = false as const;
export const D1M_R6_R2_REUSED = true as const;
export const D1M_R6_PARALLEL_MAPPING_ENGINE_CREATED = false as const;
export const D1M_R6_R3_REUSED = true as const;
export const D1M_R6_PARALLEL_EVIDENCE_ENGINE_CREATED = false as const;
export const D1M_R6_R4_REUSED = true as const;
export const D1M_R6_PARALLEL_REFERENCE_ENGINE_CREATED = false as const;
export const D1M_R6_R5_REUSED = true as const;
export const D1M_R6_PARALLEL_RELATIONSHIP_ENGINE_CREATED = false as const;
export const D1M_R6_CAN_BYPASS_R1 = false as const;
export const D1M_R6_CAN_BYPASS_R2 = false as const;
export const D1M_R6_CAN_BYPASS_R3 = false as const;
export const D1M_R6_CAN_BYPASS_R4 = false as const;
export const D1M_R6_CAN_BYPASS_R5 = false as const;
export const D1M_R6_OUTPUT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R6_OUTPUT_EQUALS_INTERPRETATION_APPROVED = false as const;
export const D1M_R6_OUTPUT_EQUALS_CERTIFIED = false as const;
export const D1M_R6_CAN_SUBMIT_WITHOUT_PROVENANCE = false as const;
export const D1M_R6_SILENT_MUTATION_ALLOWED = false as const;
export const D1M_R6_CONTRACT_AUTO_UPGRADED = false as const;
export const D1M_R6_CAPABILITY_AUTO_PROMOTED = false as const;
export const D1M_R6_CONTRACT_HISTORY_PRESERVED = true as const;
export const D1M_R6_CAPABILITY_HISTORY_PRESERVED = true as const;
export const D1M_R6_DUPLICATE_SUBMISSION_GOVERNED = true as const;
export const D1M_R6_AI_CAN_INVENT_IDENTITY = false as const;
export const D1M_R6_AI_CAN_INVENT_VERSION = false as const;
export const D1M_R6_AI_CAN_DECLARE_FORMAT_SUPPORTED = false as const;
export const D1M_R6_AI_CAN_DECLARE_PARSER_TRUSTED = false as const;
export const D1M_R6_AI_CAN_INVENT_PROVENANCE = false as const;
export const D1M_R6_AI_CAN_BYPASS_UNSUPPORTED_FORMAT = false as const;
export const D1M_R6_AI_CAN_MARK_OUTPUT_VALIDATED = false as const;
export const D1M_R6_SCOPE_ENFORCED = true as const;
export const D1M_R6_CROSS_WORKSPACE_ALLOWED = false as const;
export const D1M_R6_CROSS_PROJECT_ALLOWED = false as const;
export const D1M_R6_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D1M_R6_API_HIGHER_TRUST_THAN_FILE = false as const;
export const D1M_R6_FORMAT_ADAPTER_RUNTIME_COUNT = 0 as const;
export const D1M_R6_PARSE_RUNTIME_COUNT = 0 as const;
export const D1M_R6_OBJECT_EXTRACTION_RUNTIME_COUNT = 0 as const;
export const D1M_R6_FILE_INGESTION_RUNTIME_COUNT = 0 as const;
export const D1M_R6_GENERIC_FILE_INGESTION_RUNTIME_COUNT = 0 as const;
export const D1M_R6_VENDOR_CONNECTOR_RUNTIME_COUNT = 0 as const;
export const D1M_R6_CONNECTOR_RUNTIME_COUNT = 0 as const;
export const D1M_R6_URL_FETCH_RUNTIME_COUNT = 0 as const;
export const D1M_R6_AI_PARSE_RUNTIME_COUNT = 0 as const;
export const D1M_R6_AI_FORMAT_ADAPTER_RUNTIME_COUNT = 0 as const;
export const D1M_R6_UNIT_CONVERSION_RUNTIME_COUNT = 0 as const;
export const D1M_R6_COORDINATE_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1M_R6_AXIS_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R6_AXIS_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1M_R6_GEOMETRY_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1M_R6_GEOMETRY_RELATIONSHIP_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R6_SEMANTIC_RELATIONSHIP_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R6_TOPOLOGY_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R6_TRANSITIVE_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R6_CONNECTIVITY_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R6_LOAD_PATH_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R6_CLASH_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R6_COORDINATION_RUNTIME_COUNT = 0 as const;
export const D1M_R6_GLOBAL_DEPENDENCY_REASONING_RUNTIME_COUNT = 0 as const;
export const D1M_R6_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R6_ENGINEERING_PROPERTY_INTERPRETATION_RUNTIME_COUNT = 0 as const;
export const D1M_R6_MODEL_CORRECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R6_CAD_AUTHORING_RUNTIME_COUNT = 0 as const;
export const D1M_R6_BIM_AUTHORING_RUNTIME_COUNT = 0 as const;
export const D1M_R6_CANONICAL_DIGITAL_THREAD_REUSED = true as const;
export const D1M_R6_PARALLEL_DIGITAL_THREAD_CREATED = false as const;
export const D1M_R6_D1K_GOVERNANCE_REUSED = true as const;
export const D1M_R6_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED = false as const;
export const D1M_R6_D1K_INTERNAL_INTEGRATION_READY = D1K_R5_INTERNAL_DISCIPLINE_INTEGRATION_READY;
export const D1M_R6_D1K_INTELLIGENCE_READY = D1K_R5_CROSS_DISCIPLINE_INTELLIGENCE_READY;
export const D1M_R6_D1L_TRACK_COMPLETE = D1L_R6_TRACK_COMPLETE;
export const D1M_R6_D1L_TRACK_STATUS = D1L_R6_TRACK_STATUS;
export const D1M_R6_EQUALS_D1L_CERTIFICATION_ELIGIBLE = false as const;
export const D1M_R6_D1N_CURRENT_STATUS = "NOT_ABSORBED" as const;
export const D1M_R6_D1N_ABSORBED = false as const;
export const D1M_R6_D1N_RUNTIME_STARTED = false as const;
export const D1M_R6_D1N_RUNTIME_COUNT = 0 as const;
export const D1M_R6_D9_ABSORBED = false as const;
export const D1M_R6_D9_RUNTIME_STARTED = false as const;
export const D1M_R6_D9_RUNTIME_COUNT = 0 as const;
export const D1M_R6_D2_D8_RUNTIME_STARTED = false as const;
export const D1M_R6_D2_D8_RUNTIME_COUNT = 0 as const;
export const D1M_R6_RUNTIME_STARTED = true as const;
export const D1M_R6_RUNTIME_COUNT = 6 as const;
export const D1M_R6_DATABASE_SCHEMA_CHANGED = false as const;
export const D1M_R6_NEW_DEPENDENCY_ADDED = false as const;
export const D1M_R6_STRUCTURAL_PACK_COMPLETE = D1_STRUCTURAL_PACK_COMPLETE;
export const D1M_R6_D1G_BLOCKER_PRESERVED = D1G_LIVE_VALIDATED === false && D1G_ENGINEER_VALIDATED === false && D1G_CONFORMANCE_VALIDATED === false && D1G_CERTIFIED_SOLVER_STATUS === "NOT_CERTIFIED";
export const D1M_R6_POST_D1J_DEBT_PRESERVED = POST_D1J_STRUCTURAL_DEBT_LEDGER;
export const D1M_R6_D1K_LIMITATIONS_PRESERVED = D1M_R6_D1K_INTERNAL_INTEGRATION_READY === false && D1M_R6_D1K_INTELLIGENCE_READY === false;
export const D1M_R6_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY;
export const D1M_R6_UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D1M_R6_UNTRUSTED_FILE_POLICY = {
  parserIsolationRequired: true,
  resourceLimitsRequired: true,
  decompressionLimitsRequired: true,
  malformedPayloadRejected: true,
  externalReferenceFetchAllowed: false,
  pathTraversalAllowed: false,
  unsafeEmbeddedContentAllowed: false,
  arbitraryUrlFetchAllowed: false,
} as const;
export const D1M_R7_CANONICAL_PHASE = "EOS-D1M-R7-CHANGE-STALENESS-SUPERSESSION" as const;
export const D1M_R7_PHASE_TYPE = "CAD_OR_BIM_CHANGE_STALENESS_SUPERSESSION" as const;
export const D1M_R7_CANONICAL_SCOPE =
  "Record governed change, staleness, and supersession across the existing D1M evidence chain. Keep historical records immutable. Do not automatically revalidate, reinterpret, or certify engineering content." as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model", "current bim", "current drawing"]);
const RECORDER = "INTERFACE_RECORD_AUTHORITY";
const REVIEWER = "REVIEWER_AUTHORITY";
const DISPOSITIONS = new Map<string, string>(D1M_0_FORMAT_DISPOSITIONS);

export type D1mR6Actor = { actorId: string; tenantId: string; workspaceId: string; projectId: string; authority: string };
export type D1mR6BoundaryClass = (typeof D1M_R6_BOUNDARY_CLASSES)[number];
export type D1mR6ParserTrust = (typeof D1M_R6_PARSER_TRUST_CLASSES)[number];

export type D1mR6IdentityInput = {
  adapterId: string;
  adapterVersion: string;
  boundaryClass: string;
  sourceClass: string;
  owningModule: string;
  provenanceRef: string;
  displayName?: string;
};
export type D1mR6ContractInput = {
  contractId: string;
  adapterId: string;
  contractVersion: string;
  permittedOperation: string;
  parserTrust: string;
  provenanceRef: string;
  predecessorContractId?: string | null;
  trustScore?: number;
};
export type D1mR6CapabilityInput = {
  capabilityId: string;
  contractId: string;
  formatToken: string;
  disposition: string;
  formatSupported?: boolean;
  provenanceRef: string;
};
export type D1mR6SubmissionInput = {
  submissionId: string;
  contractId: string;
  capabilityId: string;
  authenticatorId: string;
  authenticated: boolean;
  sourceAuthorized?: boolean;
  declaredSourceFormat?: string;
  evidenceFingerprint: string;
  intendedOperation: string;
  locator: string;
  provenanceRef: string;
  execute?: boolean;
  ingestFile?: boolean;
  connectVendor?: boolean;
  fetchUrl?: boolean;
  engineeringValidated?: boolean;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D1mR6Identity = {
  adapterId: string;
  adapterVersion: string;
  boundaryClass: D1mR6BoundaryClass;
  sourceClass: (typeof D1M_0_SOURCE_CLASSES)[number];
  owningModule: string;
  provenanceRef: string;
  identityFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  recordedBy: string;
  formatSupported: false;
};
export type D1mR6Contract = {
  contractId: string;
  adapterId: string;
  adapterVersion: string;
  contractVersion: string;
  boundaryClass: D1mR6BoundaryClass;
  permittedOperation: (typeof D1M_R6_PERMITTED_OPERATIONS)[number];
  parserTrust: D1mR6ParserTrust;
  provenanceRef: string;
  contractFingerprint: string;
  predecessorContractId: string | null;
  recordStatus: "CURRENT" | "SUPERSEDED";
  tenantId: string;
  workspaceId: string;
  projectId: string;
  formatSupported: false;
  engineeringValidated: false;
  certified: false;
  apiHigherTrustThanFile: false;
};
export type D1mR6Capability = {
  capabilityId: string;
  contractId: string;
  formatToken: string;
  disposition: string;
  formatSupported: false;
  capabilityFingerprint: string;
  recordStatus: "CURRENT";
};
export type D1mR6Submission = {
  submissionId: string;
  contractId: string;
  contractFingerprint: string;
  capabilityId: string;
  authenticatorId: string;
  authenticated: boolean;
  sourceAuthorized: false;
  engineeringValidated: false;
  engineeringApproved: false;
  declaredSourceFormat: string | null;
  declaredSourceFormatEqualsSupported: false;
  evidenceFingerprint: string;
  intendedOperation: (typeof D1M_R6_PERMITTED_OPERATIONS)[number];
  locator: string;
  provenanceRef: string;
  executionPerformed: false;
  formatSupported: false;
  submissionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};
export type D1mR6History = { historyId: string; subjectId: string; action: "CREATED" | "SUPERSEDED"; fingerprint: string; recordedAt: string };
export type D1mR6Store = { now: () => string; identities: D1mR6Identity[]; contracts: D1mR6Contract[]; capabilities: D1mR6Capability[]; submissions: D1mR6Submission[]; history: D1mR6History[] };

function fail(code: string): never {
  throw new Error(code);
}
function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}
function floating(value: string): boolean {
  return FLOATING.has(value.trim().toLowerCase());
}
function assertRecorder(actor: D1mR6Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_ADAPTER_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_ADAPTER_AUTHORITY");
  if (actor.authority === "ENGINEERING_APPROVAL_AUTHORITY") fail("ADAPTER_AUTHORITY_NOT_ENGINEERING_APPROVAL");
  if (actor.authority === "CERTIFICATION_AUTHORITY") fail("ADAPTER_AUTHORITY_NOT_CERTIFIER");
  if (actor.authority !== RECORDER && actor.authority !== REVIEWER) fail("UNAUTHORIZED");
  if (actor.authority === REVIEWER) fail("UNAUTHORIZED");
}
function remember(store: D1mR6Store, subjectId: string, action: D1mR6History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectId, action, fingerprint, recordedAt: store.now() });
}
function unsafeLocator(value: string): boolean {
  return value.includes("..") || value.includes("://") || value.startsWith("\\\\") || /^[a-zA-Z]:[\\/]/.test(value) || value.startsWith("/");
}

export function createD1mR6Store(now: () => string): D1mR6Store {
  return { now, identities: [], contracts: [], capabilities: [], submissions: [], history: [] };
}

export function recordAdapterIdentity(store: D1mR6Store, actor: D1mR6Actor, input: D1mR6IdentityInput): D1mR6Identity {
  assertRecorder(actor);
  if (!input.adapterId.trim() || floating(input.adapterId) || blockedParty(input.adapterId)) fail("ADAPTER_IDENTITY_REQUIRED");
  if (!input.adapterVersion.trim() || floating(input.adapterVersion)) fail("FLOATING_ADAPTER_VERSION_REJECTED");
  if (!(D1M_R6_BOUNDARY_CLASSES as readonly string[]).includes(input.boundaryClass)) fail("BOUNDARY_CLASS_UNSUPPORTED");
  if (!(D1M_0_SOURCE_CLASSES as readonly string[]).includes(input.sourceClass)) fail("SOURCE_CLASS_UNSUPPORTED");
  if (!input.owningModule.trim() || !input.provenanceRef.trim() || blockedParty(input.provenanceRef)) fail("MISSING_ADAPTER_PROVENANCE");
  const identityFingerprint = fingerprintCanonical({
    adapterId: input.adapterId, adapterVersion: input.adapterVersion, boundaryClass: input.boundaryClass, sourceClass: input.sourceClass,
    owningModule: input.owningModule, provenanceRef: input.provenanceRef, tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId,
  });
  const existing = store.identities.find((row) => row.adapterId === input.adapterId);
  if (existing) {
    if (existing.identityFingerprint === identityFingerprint) return existing;
    fail("ADAPTER_ALREADY_RECORDED");
  }
  const identity: D1mR6Identity = {
    adapterId: input.adapterId, adapterVersion: input.adapterVersion, boundaryClass: input.boundaryClass as D1mR6BoundaryClass,
    sourceClass: input.sourceClass as D1mR6Identity["sourceClass"], owningModule: input.owningModule, provenanceRef: input.provenanceRef,
    identityFingerprint, tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, recordedBy: actor.actorId, formatSupported: false,
  };
  store.identities.push(identity);
  remember(store, identity.adapterId, "CREATED", identityFingerprint);
  return identity;
}

export function recordAdapterContract(store: D1mR6Store, actor: D1mR6Actor, input: D1mR6ContractInput): D1mR6Contract {
  assertRecorder(actor);
  if (input.trustScore != null) fail("PARSER_TRUST_SCORE_REJECTED");
  if (!input.contractId.trim() || floating(input.contractId)) fail("CONTRACT_IDENTITY_REQUIRED");
  if (!input.contractVersion.trim() || floating(input.contractVersion)) fail("FLOATING_CONTRACT_VERSION_REJECTED");
  if (!input.provenanceRef.trim() || blockedParty(input.provenanceRef)) fail("MISSING_ADAPTER_PROVENANCE");
  if (!(D1M_R6_PARSER_TRUST_CLASSES as readonly string[]).includes(input.parserTrust)) fail("PARSER_TRUST_UNSUPPORTED");
  if (!(D1M_R6_PERMITTED_OPERATIONS as readonly string[]).includes(input.permittedOperation)) fail("OPERATION_UNSUPPORTED");
  const identity = store.identities.find((row) => row.adapterId === input.adapterId);
  if (!identity) fail("ADAPTER_IDENTITY_REQUIRED");
  if (identity.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (identity.workspaceId !== actor.workspaceId || identity.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  const predecessor = input.predecessorContractId ? store.contracts.find((row) => row.contractId === input.predecessorContractId) : null;
  if (input.predecessorContractId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.adapterId !== identity.adapterId)) fail("PREDECESSOR_NOT_CURRENT");
  const contractFingerprint = fingerprintCanonical({
    contractId: input.contractId, adapterId: identity.adapterId, adapterVersion: identity.adapterVersion, contractVersion: input.contractVersion,
    boundaryClass: identity.boundaryClass, permittedOperation: input.permittedOperation, parserTrust: input.parserTrust, provenanceRef: input.provenanceRef,
    tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, predecessorContractId: predecessor?.contractId ?? null,
  });
  if (predecessor && predecessor.contractVersion === input.contractVersion && predecessor.parserTrust === input.parserTrust && predecessor.permittedOperation === input.permittedOperation) fail("CONTRACT_UNCHANGED");
  const existing = store.contracts.find((row) => row.contractId === input.contractId);
  if (existing) {
    if (existing.contractFingerprint === contractFingerprint && !predecessor) return existing;
    fail("CONTRACT_ALREADY_RECORDED");
  }
  const contract: D1mR6Contract = {
    contractId: input.contractId, adapterId: identity.adapterId, adapterVersion: identity.adapterVersion, contractVersion: input.contractVersion,
    boundaryClass: identity.boundaryClass, permittedOperation: input.permittedOperation as D1mR6Contract["permittedOperation"],
    parserTrust: input.parserTrust as D1mR6ParserTrust, provenanceRef: input.provenanceRef, contractFingerprint, predecessorContractId: predecessor?.contractId ?? null,
    recordStatus: "CURRENT", tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId,
    formatSupported: false, engineeringValidated: false, certified: false, apiHigherTrustThanFile: false,
  };
  if (predecessor) {
    predecessor.recordStatus = "SUPERSEDED";
    remember(store, predecessor.contractId, "SUPERSEDED", predecessor.contractFingerprint);
  }
  store.contracts.push(contract);
  remember(store, contract.contractId, "CREATED", contractFingerprint);
  return contract;
}

export function declareFormatCapability(store: D1mR6Store, actor: D1mR6Actor, input: D1mR6CapabilityInput): D1mR6Capability {
  assertRecorder(actor);
  if (input.formatSupported === true || input.disposition === "SUPPORTED") fail("ADAPTER_SELF_PROMOTION_REJECTED");
  if (!input.provenanceRef.trim() || blockedParty(input.provenanceRef)) fail("MISSING_ADAPTER_PROVENANCE");
  const contract = store.contracts.find((row) => row.contractId === input.contractId && row.recordStatus === "CURRENT");
  if (!contract) fail("ADAPTER_CONTRACT_REQUIRED");
  if (contract.tenantId !== actor.tenantId || contract.workspaceId !== actor.workspaceId || contract.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  const governed = DISPOSITIONS.get(input.formatToken);
  if (!governed) fail("UNKNOWN_FORMAT_NOT_SUPPORTED");
  if (input.disposition !== governed) fail("CAPABILITY_SUBSTITUTION_REJECTED");
  const capabilityFingerprint = fingerprintCanonical({
    capabilityId: input.capabilityId, contractId: contract.contractId, contractFingerprint: contract.contractFingerprint,
    formatToken: input.formatToken, disposition: governed, formatSupported: false, provenanceRef: input.provenanceRef,
  });
  const existing = store.capabilities.find((row) => row.capabilityId === input.capabilityId);
  if (existing) {
    if (existing.capabilityFingerprint === capabilityFingerprint) return existing;
    fail("CAPABILITY_ALREADY_RECORDED");
  }
  const active = store.capabilities.find((row) => row.recordStatus === "CURRENT" && row.contractId === contract.contractId && row.formatToken === input.formatToken);
  if (active && active.capabilityId !== input.capabilityId) fail("CAPABILITY_CONFLICT");
  const capability: D1mR6Capability = {
    capabilityId: input.capabilityId, contractId: contract.contractId, formatToken: input.formatToken, disposition: governed,
    formatSupported: false, capabilityFingerprint, recordStatus: "CURRENT",
  };
  store.capabilities.push(capability);
  remember(store, capability.capabilityId, "CREATED", capabilityFingerprint);
  return capability;
}

export function submitAdapterEvidence(store: D1mR6Store, actor: D1mR6Actor, input: D1mR6SubmissionInput): D1mR6Submission {
  assertRecorder(actor);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if ((input.workspaceId != null && input.workspaceId !== actor.workspaceId) || (input.projectId != null && input.projectId !== actor.projectId)) fail("CROSS_PROJECT_OPERATION");
  if (input.execute === true || input.ingestFile === true) fail("ADAPTER_GOVERNANCE_BYPASS_REJECTED");
  if (input.connectVendor === true) fail("VENDOR_CONNECTOR_NOT_IN_R6");
  if (input.fetchUrl === true) fail("ARBITRARY_URL_FETCH_REJECTED");
  if (input.engineeringValidated === true) fail("ENGINEERING_VALIDATION_NOT_IN_R6");
  if (input.sourceAuthorized === true) fail("AUTHENTICATION_NOT_AUTHORIZATION");
  if (!input.provenanceRef.trim() || blockedParty(input.provenanceRef) || !input.evidenceFingerprint.trim() || !input.authenticatorId.trim()) fail("MISSING_ADAPTER_PROVENANCE");
  if (!input.locator.trim() || unsafeLocator(input.locator)) fail("UNSAFE_LOCATOR_REJECTED");
  const contract = store.contracts.find((row) => row.contractId === input.contractId && row.recordStatus === "CURRENT");
  if (!contract) fail("ADAPTER_CONTRACT_REQUIRED");
  if (contract.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (contract.workspaceId !== actor.workspaceId || contract.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (input.intendedOperation !== contract.permittedOperation) fail("CONTRACT_SUBSTITUTION_REJECTED");
  const capability = store.capabilities.find((row) => row.capabilityId === input.capabilityId && row.contractId === contract.contractId);
  if (!capability) fail("CAPABILITY_REQUIRED");
  if (capability.formatSupported) fail("FORMAT_SUPPORT_NOT_AUTHORIZED");
  if (input.declaredSourceFormat && input.declaredSourceFormat !== capability.formatToken) fail("CAPABILITY_SUBSTITUTION_REJECTED");
  const submissionFingerprint = fingerprintCanonical({
    submissionId: input.submissionId, contractId: contract.contractId, contractFingerprint: contract.contractFingerprint,
    capabilityId: capability.capabilityId, capabilityFingerprint: capability.capabilityFingerprint, authenticatorId: input.authenticatorId,
    evidenceFingerprint: input.evidenceFingerprint, intendedOperation: contract.permittedOperation, locator: input.locator, provenanceRef: input.provenanceRef,
    tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId,
  });
  const existing = store.submissions.find((row) => row.submissionId === input.submissionId);
  if (existing) {
    if (existing.submissionFingerprint === submissionFingerprint) return existing;
    fail("SUBMISSION_ALREADY_RECORDED");
  }
  const replay = store.submissions.find((row) => row.contractId === contract.contractId && row.evidenceFingerprint === input.evidenceFingerprint && row.intendedOperation === contract.permittedOperation);
  if (replay) fail("DUPLICATE_SUBMISSION_REJECTED");
  const submission: D1mR6Submission = {
    submissionId: input.submissionId, contractId: contract.contractId, contractFingerprint: contract.contractFingerprint, capabilityId: capability.capabilityId,
    authenticatorId: input.authenticatorId, authenticated: input.authenticated, sourceAuthorized: false, engineeringValidated: false, engineeringApproved: false,
    declaredSourceFormat: input.declaredSourceFormat ?? null, declaredSourceFormatEqualsSupported: false, evidenceFingerprint: input.evidenceFingerprint,
    intendedOperation: contract.permittedOperation, locator: input.locator, provenanceRef: input.provenanceRef, executionPerformed: false, formatSupported: false,
    submissionFingerprint, tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId,
  };
  store.submissions.push(submission);
  remember(store, submission.submissionId, "CREATED", submissionFingerprint);
  return submission;
}

export function mutateAdapterContract(): never { return fail("SILENT_ADAPTER_MUTATION_REJECTED"); }
export function upgradeAdapterContract(): never { return fail("ADAPTER_AUTO_UPGRADE_REJECTED"); }
export function promoteFormatSupport(): never { return fail("ADAPTER_SELF_PROMOTION_REJECTED"); }
export function parseCadBimArtifact(): never { return fail("PARSE_NOT_IN_R6"); }
export function extractCadBimObjects(): never { return fail("OBJECT_EXTRACTION_NOT_IN_R6"); }
export function ingestCadBimFile(): never { return fail("FILE_INGESTION_NOT_IN_R6"); }
export function fetchExternalUrl(): never { return fail("ARBITRARY_URL_FETCH_REJECTED"); }
export function connectCadBimVendor(): never { return fail("VENDOR_CONNECTOR_NOT_IN_R6"); }
export function adaptCadBimFormat(): never { return fail("FORMAT_ADAPTER_NOT_IN_R6"); }
export function convertAdapterUnits(): never { return fail("UNIT_CONVERSION_NOT_IN_R6"); }
export function transformAdapterCoordinates(): never { return fail("COORDINATE_TRANSFORMATION_NOT_IN_R6"); }
export function inferAdapterAxis(): never { return fail("AXIS_INFERENCE_NOT_IN_R6"); }
export function transformAdapterGeometry(): never { return fail("GEOMETRY_TRANSFORMATION_NOT_IN_R6"); }
export function inferAdapterRelationship(): never { return fail("RELATIONSHIP_INFERENCE_NOT_IN_R6"); }
export function inferModelTopology(): never { return fail("TOPOLOGY_INFERENCE_NOT_IN_R6"); }
export function inferStructuralConnectivity(): never { return fail("CONNECTIVITY_INFERENCE_NOT_IN_R6"); }
export function inferLoadPath(): never { return fail("LOAD_PATH_INFERENCE_NOT_IN_R6"); }
export function detectCadBimClash(): never { return fail("CLASH_DETECTION_NOT_IN_R6"); }
export function coordinateMultidisciplinaryBim(): never { return fail("MULTIDISCIPLINARY_COORDINATION_NOT_IN_R6"); }
export function reasonGlobalModelDependency(): never { return fail("GLOBAL_DEPENDENCY_REASONING_NOT_IN_R6"); }
export function detectGlobalCycle(): never { return fail("GLOBAL_CYCLE_DETECTION_NOT_IN_R6"); }
export function interpretCadBimEngineeringProperties(): never { return fail("ENGINEERING_PROPERTY_INTERPRETATION_NOT_IN_R6"); }
export function correctCadBimModel(): never { return fail("MODEL_CORRECTION_NOT_IN_R6"); }
export function authorCadModel(): never { return fail("CAD_AUTHORING_NOT_IN_R6"); }
export function authorBimModel(): never { return fail("BIM_AUTHORING_NOT_IN_R6"); }
export function parseByAi(): never { return fail("AI_PARSE_NOT_IN_R6"); }
