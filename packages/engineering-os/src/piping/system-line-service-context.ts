/**
 * EOS-D5-R2 Piping system, line, and service context.
 * One bounded runtime on exact R1 identities. Descriptive context only.
 */
import {
  D5_CREATES_AUTHORITATIVE_PROCESS_CONDITION,
  D5_CURRENTNESS_STATES,
  D5_IMPLEMENTATION_PHASE_TYPES,
  D5_IMPLEMENTATION_PHASES,
  D5_MATURITY_STATES,
  PIPING_SERVICE_CONTEXT_EQUALS_PROCESS_DESIGN,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_REOPENED,
  D2_TRACK_COMPLETE,
  D3_REOPENED,
  D3_TRACK_COMPLETE,
  D4_REOPENED,
  D4_TRACK_COMPLETE,
  D5_APPROVAL_RUNTIME_COUNT,
  D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D5_AUTOMATIC_ROUTING_RUNTIME_COUNT,
  D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT,
  D5_CERTIFICATION_RUNTIME_COUNT,
  D5_COMPONENT_CONNECTION_VALVE_RUNTIME_COUNT,
  D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D5_CONTEXT_AUTHORITY,
  D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_COUNT,
  D5_DISCIPLINE,
  D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EQUALS_D2_CIVIL_AUTHORITY,
  D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D5_EQUALS_D4_MECHANICAL_AUTHORITY,
  D5_EQUALS_D6_PROCESS_AUTHORITY,
  D5_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
  D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D5_REUSES_CANONICAL_CURRENTNESS,
  D5_REUSES_CANONICAL_FINGERPRINT,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_COUNT,
  D5_RUNTIME_COUNT as R1_RUNTIME_COUNT,
  D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D5_IDENTITY_SYSTEM_CREATED,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  type D5R1Actor,
  type D5R1ObjectRecord,
  type D5R1Store,
} from "./identity-foundation";

export const D5_R2_STATUS = "PIPING_SYSTEM_LINE_AND_SERVICE_CONTEXT_IMPLEMENTED" as const;
export const D5_R2_MATURITY = D5_R2_STATUS;
export const D5_R2_MATURITY_STATE = D5_R2_STATUS;
export const D5_R2_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D5_R2_PIPING_SYSTEM_LINE_AND_SERVICE_CONTEXT_CLOSEOUT.md" as const;
export const D5_R1_IDENTITY_REUSED = R1_IDENTITY_READY;
export const EXACT_D5_R1_IDENTITY_REFERENCE_REQUIRED = true as const;
export const FLOATING_D5_R2_IDENTITY_REFERENCE_ALLOWED = false as const;
export const D5_R2_IDENTITY_AUTO_REPOINTED = false as const;
export const D5_RUNTIME_STARTED = true as const;
export const D5_RUNTIME_COUNT = 2 as const;
export const D5_R1_RUNTIME_COUNT = R1_RUNTIME_COUNT;
export const D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_IMPLEMENTED = true as const;
export const D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_COUNT = 1 as const;
export const D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY = true as const;
export const D5_PIPING_SYSTEM_CONTEXT_IMPLEMENTED = true as const;
export const D5_PIPING_LINE_CONTEXT_IMPLEMENTED = true as const;
export const D5_PIPING_SERVICE_FUNCTION_CONTEXT_IMPLEMENTED = true as const;
export const PIPING_SYSTEM_CONTEXT_EQUALS_PROCESS_SYSTEM_DESIGN = false as const;
export const PIPING_SYSTEM_CONTEXT_EQUALS_VALIDATED_ENGINEERING = false as const;
export const PIPING_LINE_CONTEXT_EQUALS_PROCESS_STREAM = false as const;
export const PIPING_LINE_CONTEXT_EQUALS_DESIGN_CONDITION = false as const;
export const PIPING_LINE_CONTEXT_EQUALS_PIPING_SPECIFICATION = false as const;
export const PIPING_SERVICE_CONTEXT_EQUALS_PROCESS_STREAM = false as const;
export const PIPING_SERVICE_CONTEXT_EQUALS_PROCESS_CONDITION = false as const;
export const D5_PROCESS_SOURCE_REFERENCE_SUPPORTED = true as const;
export const PROCESS_SOURCE_REFERENCE_EQUALS_ADOPTED_PIPING_DESIGN_CONDITION = false as const;
export const D5_EXPLICIT_SYSTEM_LINE_MEMBERSHIP_IMPLEMENTED = true as const;
export const D5_INFERRED_SYSTEM_LINE_MEMBERSHIP_ALLOWED = false as const;
export const D5_EXPLICIT_LINE_SERVICE_ASSOCIATION_REQUIRED = true as const;
export const D5_INFERRED_LINE_SERVICE_ASSOCIATION_ALLOWED = false as const;
export const D5_R2_SOURCE_BASIS_REQUIRED = true as const;
export const D5_R2_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D5_R2_CONTEXT_AUTO_ACCEPTED = false as const;
export const D5_R2_SERVICE_CONTEXT_AUTO_CREATES_DESIGN_CONDITION = false as const;
export const D5_R2_PROVENANCE_REQUIRED = true as const;
export const D5_R2_PROVENANCE_PRESERVED = true as const;
export const D5_R2_AUTO_REPOINTED = false as const;
export const SILENT_D5_R2_MUTATION_ALLOWED = false as const;
export const D5_R2_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D5_R2_SCOPE_ENFORCED = true as const;
export const D5_R2_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D5_R2_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D5_R2_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_COUNT = 0 as const;
export const UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_REOPEN = false as const;
export const UNAUTHORIZED_D4_REOPEN = false as const;
export const UNAUTHORIZED_D5_R3_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D6_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_PROCESS_AUTHORITY_PROMOTION = false as const;
export const UNAUTHORIZED_PIPING_CALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_PIPING_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D5_R3_CANONICAL_PHASE = D5_IMPLEMENTATION_PHASES[2];
export const D5_R3_PHASE_TYPE = D5_IMPLEMENTATION_PHASE_TYPES[2];
export const D5_R3_CANONICAL_SCOPE =
  "Implement governed Piping design-condition and specification/class context using exact R1-R2 identities/context and explicit source/basis. Preserve the distinction between Process-source conditions and adopted Piping design conditions, specification references and code conformance, and material/class context and validated material selection. Do not perform sizing, hydraulics, wall-thickness, flange-rating or other calculations, and do not implement components, routing, stress/support, review/validation, interfaces or D9 runtime." as const;
export const D5_R3_STARTED = false as const;
export const D5_R2_READY_FOR_NEXT_PHASE = true as const;
export const D5_R2_NEXT_PHASE = D5_R3_CANONICAL_PHASE;
export const D5_R2_NEXT_PHASE_TYPE = D5_R3_PHASE_TYPE;
export const D5_R2_CANONICAL_NEXT_PHASE = D5_R3_CANONICAL_PHASE;
export const D5_R2_CANONICAL_NEXT_PHASE_SCOPE = D5_R3_CANONICAL_SCOPE;
export const D5_R2_BLOCKER = "NONE" as const;
export const D5_R2_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export const D5_R2_SYSTEM_CLASSIFICATIONS = [
  "PROCESS_PIPING_SYSTEM",
  "UTILITY_PIPING_SYSTEM",
  "OFFSITE_PIPING_SYSTEM",
  "PACKAGE_PIPING_SYSTEM",
  "OTHER_PIPING_SYSTEM",
] as const;
export const D5_R2_LINE_CLASSIFICATIONS = [
  "PROCESS_LINE",
  "UTILITY_LINE",
  "VENT_LINE",
  "DRAIN_LINE",
  "TRANSFER_LINE",
  "OTHER_PIPING_LINE",
] as const;
export const D5_R2_SERVICE_FUNCTIONS = [
  "TRANSFER",
  "SUPPLY",
  "RETURN",
  "VENT",
  "DRAIN",
  "RELIEF",
  "UTILITY_SERVICE",
  "OTHER_PIPING_FUNCTION",
] as const;

export {
  D5_REUSES_CANONICAL_CURRENTNESS,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  D5_REUSES_CANONICAL_FINGERPRINT,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  PARALLEL_D5_IDENTITY_SYSTEM_CREATED,
  PIPING_SERVICE_CONTEXT_EQUALS_PROCESS_DESIGN,
  D5_CREATES_AUTHORITATIVE_PROCESS_CONDITION,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EQUALS_D2_CIVIL_AUTHORITY,
  D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D5_EQUALS_D4_MECHANICAL_AUTHORITY,
  D5_EQUALS_D6_PROCESS_AUTHORITY,
  D5_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_COUNT,
  D5_COMPONENT_CONNECTION_VALVE_RUNTIME_COUNT,
  D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_COUNT,
  D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT,
  D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D5_AUTOMATIC_ROUTING_RUNTIME_COUNT,
  D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D5_APPROVAL_RUNTIME_COUNT,
  D5_CERTIFICATION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_TRACK_COMPLETE,
  D2_REOPENED,
  D3_TRACK_COMPLETE,
  D3_REOPENED,
  D4_TRACK_COMPLETE,
  D4_REOPENED,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set([
  "inferred",
  "tag_similarity",
  "line_tag_pattern",
  "naming_similarity",
  "line_number_similarity",
  "document_location",
  "document_proximity",
  "common_service_name",
  "common_vendor",
  "shared_vendor",
  "drawing_proximity",
  "semantic_similarity",
  "ai_inference",
  "nearby_text",
  "filename",
]);

type Prohibited = {
  designPressure?: unknown;
  designTemperature?: unknown;
  operatingPressure?: unknown;
  operatingTemperature?: unknown;
  vacuumCase?: unknown;
  testPressure?: unknown;
  corrosionAllowance?: unknown;
  materialSpecification?: unknown;
  pipingClass?: unknown;
  flangeRating?: unknown;
  wallSchedule?: unknown;
  designCondition?: boolean;
  specification?: boolean;
  componentData?: boolean;
  routing?: boolean;
  fabrication?: boolean;
  stressSupport?: boolean;
  testing?: boolean;
  reviewValidation?: boolean;
  disciplineInterface?: boolean;
  d9Source?: boolean;
  engineeringValidated?: boolean;
  adoptProcessCondition?: boolean;
  processDesign?: boolean;
  inferredMembership?: boolean;
  inferredService?: boolean;
  pipeSizing?: boolean;
  hydraulic?: boolean;
  stressCalculation?: boolean;
  automaticRouting?: boolean;
  clashDetection?: boolean;
  repoint?: boolean;
};

type BoundInput = Prohibited & {
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  citedLifecycleStage: string;
  provenanceRef: string;
  sourceBasisRef: string;
  citedCurrentness: string;
  processSourceRef?: string | null;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D5R2SystemInput = BoundInput & {
  systemRecordId: string;
  systemName: string;
  systemDescription: string;
  systemClassification: string;
  systemFunction: string;
  grouping: string;
  applicableScope: string;
  limitations?: string | null;
  predecessorSystemRecordId?: string | null;
};

export type D5R2ContextRecordBase = {
  contextId: string;
  objectId: string;
  objectType: D5R1ObjectRecord["objectType"];
  objectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D5_DISCIPLINE;
  citedLifecycleStage: (typeof D5_MATURITY_STATES)[number];
  provenanceRef: string;
  sourceBasisRef: string;
  processSourceRef: string | null;
  citedCurrentness: (typeof D5_CURRENTNESS_STATES)[number];
  authority: typeof D5_CONTEXT_AUTHORITY;
  pipingEngineeringAuthority: false;
  engineeringValidated: false;
  processDesign: false;
  adoptedDesignCondition: false;
  createsAuthoritativeProcessCondition: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
};

export type D5R2SystemRecord = D5R2ContextRecordBase & {
  systemRecordId: string;
  systemName: string;
  systemDescription: string;
  systemClassification: (typeof D5_R2_SYSTEM_CLASSIFICATIONS)[number];
  systemFunction: (typeof D5_R2_SERVICE_FUNCTIONS)[number];
  grouping: string;
  applicableScope: string;
  limitations: string | null;
  predecessorSystemRecordId: string | null;
};

export type D5R2LineInput = BoundInput & {
  lineRecordId: string;
  lineTag: string;
  lineDescription: string;
  lineClassification: string;
  lineFunction: string;
  applicableScope: string;
  limitations?: string | null;
  predecessorLineRecordId?: string | null;
};

export type D5R2LineRecord = D5R2ContextRecordBase & {
  lineRecordId: string;
  lineTag: string;
  lineDescription: string;
  lineClassification: (typeof D5_R2_LINE_CLASSIFICATIONS)[number];
  lineFunction: (typeof D5_R2_SERVICE_FUNCTIONS)[number];
  applicableScope: string;
  limitations: string | null;
  specificationEstablished: false;
  designConditionEstablished: false;
  predecessorLineRecordId: string | null;
};

export type D5R2ServiceInput = BoundInput & {
  serviceRecordId: string;
  serviceFunction: string;
  serviceDescription: string;
  applicableScope: string;
  limitations?: string | null;
  predecessorServiceRecordId?: string | null;
};

export type D5R2ServiceRecord = D5R2ContextRecordBase & {
  serviceRecordId: string;
  serviceFunction: (typeof D5_R2_SERVICE_FUNCTIONS)[number];
  serviceDescription: string;
  applicableScope: string;
  limitations: string | null;
  processStream: false;
  processCondition: false;
  predecessorServiceRecordId: string | null;
};

export type D5R2MembershipInput = BoundInput & {
  membershipId: string;
  systemObjectId: string;
  systemRevisionFingerprint: string;
  membershipBasis?: string;
  predecessorMembershipId?: string | null;
};

export type D5R2MembershipRecord = {
  membershipId: string;
  contextId: string;
  lineObjectId: string;
  lineRevisionFingerprint: string;
  systemObjectId: string;
  systemRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  membershipBasis: "EXPLICIT";
  provenanceRef: string;
  sourceBasisRef: string;
  citedCurrentness: (typeof D5_CURRENTNESS_STATES)[number];
  authority: typeof D5_CONTEXT_AUTHORITY;
  inferred: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorMembershipId: string | null;
};

export type D5R2AssociationInput = BoundInput & {
  associationId: string;
  serviceObjectId: string;
  serviceRevisionFingerprint: string;
  associationBasis?: string;
  predecessorAssociationId?: string | null;
};

export type D5R2AssociationRecord = {
  associationId: string;
  contextId: string;
  lineObjectId: string;
  lineRevisionFingerprint: string;
  serviceObjectId: string;
  serviceRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  associationBasis: "EXPLICIT";
  provenanceRef: string;
  sourceBasisRef: string;
  citedCurrentness: (typeof D5_CURRENTNESS_STATES)[number];
  authority: typeof D5_CONTEXT_AUTHORITY;
  inferred: false;
  processDesign: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorAssociationId: string | null;
};

export type D5R2History = {
  historyId: string;
  subjectKind: "SYSTEM" | "LINE" | "SERVICE" | "MEMBERSHIP" | "ASSOCIATION";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D5R2Store = {
  r1: D5R1Store;
  now: () => string;
  systems: D5R2SystemRecord[];
  lines: D5R2LineRecord[];
  services: D5R2ServiceRecord[];
  memberships: D5R2MembershipRecord[];
  associations: D5R2AssociationRecord[];
  history: D5R2History[];
};

function fail(code: string): never {
  throw new Error(`D5_R2_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function isStage(value: string): value is (typeof D5_MATURITY_STATES)[number] {
  return (D5_MATURITY_STATES as readonly string[]).includes(value);
}

function isCurrentness(value: string): value is (typeof D5_CURRENTNESS_STATES)[number] {
  return (D5_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function assertActor(actor: D5R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_PIPING_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_PIPING_AUTHORITY");
  if (actor.authority === "PIPING_ENGINEERING_AUTHORITY" || actor.authority === "PROCESS_AUTHORITY") fail("RECORDER_NOT_PIPING_ENGINEERING_AUTHORITY");
  if (actor.authority !== D5_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertScope(actor: D5R1Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertProhibited(input: Prohibited): void {
  if (
    input.designCondition === true ||
    input.designPressure != null ||
    input.designTemperature != null ||
    input.operatingPressure != null ||
    input.operatingTemperature != null ||
    input.vacuumCase != null ||
    input.testPressure != null ||
    input.corrosionAllowance != null ||
    input.materialSpecification != null ||
    input.pipingClass != null ||
    input.flangeRating != null ||
    input.wallSchedule != null ||
    input.specification === true
  ) fail("DESIGN_CONDITION_NOT_IN_R2");
  if (input.componentData === true) fail("COMPONENT_NOT_IN_R2");
  if (input.routing === true || input.fabrication === true) fail("ROUTING_NOT_IN_R2");
  if (input.stressSupport === true || input.testing === true) fail("STRESS_SUPPORT_NOT_IN_R2");
  if (input.reviewValidation === true || input.engineeringValidated === true) fail("VALIDATION_NOT_IN_R2");
  if (input.disciplineInterface === true) fail("DISCIPLINE_INTERFACE_NOT_IN_R2");
  if (input.d9Source === true) fail("D9_SOURCE_NOT_IN_R2");
  if (input.adoptProcessCondition === true || input.processDesign === true) fail("PROCESS_CONDITION_NOT_ADOPTED");
  if (input.inferredMembership === true) fail("INFERRED_MEMBERSHIP_REJECTED");
  if (input.inferredService === true) fail("INFERRED_SERVICE_REJECTED");
  if (input.pipeSizing === true || input.hydraulic === true || input.stressCalculation === true || input.automaticRouting === true || input.clashDetection === true) fail("CALCULATION_NOT_IN_R2");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
}

function remember(store: D5R2Store, subjectKind: D5R2History["subjectKind"], subjectId: string, action: D5R2History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function requireContext(store: D5R2Store, actor: D5R1Actor, contextId: string, citedCurrentness: (typeof D5_CURRENTNESS_STATES)[number]) {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r1.contexts.find((row) => row.contextId === id);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (citedCurrentness === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  return context;
}

function requireObject(store: D5R2Store, actor: D5R1Actor, contextId: string, objectId: string, revisionFingerprint: string, allowed: readonly string[], citedCurrentness: (typeof D5_CURRENTNESS_STATES)[number]) {
  const id = explicit(objectId, "R1_OBJECT_REQUIRED");
  const revision = explicit(revisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r1.objects.find((row) => row.objectId === id);
  if (!object) fail("R1_OBJECT_NOT_FOUND");
  if (object.fingerprint !== revision) fail("R1_REVISION_MISMATCH");
  if (!allowed.includes(object.objectType)) fail("R1_OBJECT_TYPE_MISMATCH");
  if (object.contextId !== contextId) fail("R1_CONTEXT_MISMATCH");
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (citedCurrentness === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function sameLineage(store: D5R2Store, object: D5R1ObjectRecord, priorObjectId: string): boolean {
  let cursor: D5R1ObjectRecord | undefined = object;
  const seen = new Set<string>();
  while (cursor && !seen.has(cursor.objectId)) {
    if (cursor.objectId === priorObjectId) return true;
    seen.add(cursor.objectId);
    const predecessorId: string | null = cursor.predecessorObjectId;
    cursor = predecessorId ? store.r1.objects.find((row) => row.objectId === predecessorId) : undefined;
  }
  return false;
}

function prepare(store: D5R2Store, actor: D5R1Actor, input: BoundInput, allowed: readonly string[]) {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  const context = requireContext(store, actor, input.contextId, cited);
  const object = requireObject(store, actor, context.contextId, input.objectId, input.objectRevisionFingerprint, allowed, cited);
  const stage = input.citedLifecycleStage.trim();
  if (!isStage(stage)) fail("MATURITY_STAGE_INVALID");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const sourceBasisRef = explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS");
  const processSourceRef = input.processSourceRef == null || input.processSourceRef === "" ? null : explicit(input.processSourceRef, "PROCESS_SOURCE_INVALID");
  return { context, object, stage, provenanceRef, sourceBasisRef, processSourceRef, citedCurrentness: cited };
}

function truthBase(actor: D5R1Actor, prepared: ReturnType<typeof prepare>, fingerprint: string) {
  return {
    contextId: prepared.context.contextId,
    objectId: prepared.object.objectId,
    objectType: prepared.object.objectType,
    objectRevisionFingerprint: prepared.object.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D5_DISCIPLINE,
    citedLifecycleStage: prepared.stage,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    processSourceRef: prepared.processSourceRef,
    citedCurrentness: prepared.citedCurrentness,
    authority: D5_CONTEXT_AUTHORITY,
    pipingEngineeringAuthority: false as const,
    engineeringValidated: false as const,
    processDesign: false as const,
    adoptedDesignCondition: false as const,
    createsAuthoritativeProcessCondition: false as const,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: "",
    recordStatus: "CURRENT" as const,
    currentness: "CURRENT" as const,
  };
}

export function createD5R2Store(r1: D5R1Store, now: () => string = () => "2026-10-24T00:00:00.000Z"): D5R2Store {
  return { r1, now, systems: [], lines: [], services: [], memberships: [], associations: [], history: [] };
}

export function recordPipingSystemContext(store: D5R2Store, actor: D5R1Actor, input: D5R2SystemInput): D5R2SystemRecord {
  const prepared = prepare(store, actor, input, ["PIPING_SYSTEM_CONTEXT"]);
  const systemRecordId = explicit(input.systemRecordId, "SYSTEM_CONTEXT_REQUIRED");
  const systemName = explicit(input.systemName, "SYSTEM_NAME_REQUIRED");
  const systemDescription = explicit(input.systemDescription, "SYSTEM_DESCRIPTION_REQUIRED");
  const systemClassification = explicit(input.systemClassification, "SYSTEM_CLASSIFICATION_REQUIRED");
  const systemFunction = explicit(input.systemFunction, "SYSTEM_FUNCTION_REQUIRED");
  const grouping = explicit(input.grouping, "SYSTEM_GROUPING_REQUIRED");
  const applicableScope = explicit(input.applicableScope, "APPLICABLE_SCOPE_REQUIRED");
  const limitations = input.limitations == null || input.limitations === "" ? null : explicit(input.limitations, "LIMITATIONS_INVALID");
  if (!(D5_R2_SYSTEM_CLASSIFICATIONS as readonly string[]).includes(systemClassification)) fail("SYSTEM_CLASSIFICATION_NOT_ALLOWLISTED");
  if (!(D5_R2_SERVICE_FUNCTIONS as readonly string[]).includes(systemFunction)) fail("SYSTEM_FUNCTION_NOT_ALLOWLISTED");
  const predecessor = input.predecessorSystemRecordId ? store.systems.find((row) => row.systemRecordId === input.predecessorSystemRecordId) : null;
  if (input.predecessorSystemRecordId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || !sameLineage(store, prepared.object, predecessor.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    systemRecordId, contextId: prepared.context.contextId, objectId: prepared.object.objectId, objectRevisionFingerprint: prepared.object.fingerprint,
    systemName, systemDescription, systemClassification, systemFunction, grouping, applicableScope, limitations,
    provenanceRef: prepared.provenanceRef, sourceBasisRef: prepared.sourceBasisRef, processSourceRef: prepared.processSourceRef,
    citedLifecycleStage: prepared.stage, citedCurrentness: prepared.citedCurrentness, predecessorSystemRecordId: predecessor?.systemRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.systems.find((row) => row.systemRecordId === systemRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_SYSTEM_REJECTED");
  const duplicate = store.systems.find((row) => row.recordStatus === "CURRENT" && row.systemRecordId !== predecessor?.systemRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.systemClassification === systemClassification && row.systemFunction === systemFunction);
  if (duplicate) fail("DUPLICATE_SYSTEM_REJECTED");
  const record: D5R2SystemRecord = Object.freeze({
    ...truthBase(actor, prepared, fingerprint),
    recordedAt: store.now(),
    systemRecordId,
    systemName,
    systemDescription,
    systemClassification: systemClassification as D5R2SystemRecord["systemClassification"],
    systemFunction: systemFunction as D5R2SystemRecord["systemFunction"],
    grouping,
    applicableScope,
    limitations,
    predecessorSystemRecordId: predecessor?.systemRecordId ?? null,
  });
  if (predecessor) {
    const index = store.systems.findIndex((row) => row.systemRecordId === predecessor.systemRecordId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, currentness: "SUPERSEDED" as const });
    store.systems[index] = superseded;
    remember(store, "SYSTEM", superseded.systemRecordId, "SUPERSEDED", superseded.fingerprint);
  }
  store.systems.push(record);
  remember(store, "SYSTEM", record.systemRecordId, "CREATED", record.fingerprint);
  return record;
}

export function recordPipingLineContext(store: D5R2Store, actor: D5R1Actor, input: D5R2LineInput): D5R2LineRecord {
  const prepared = prepare(store, actor, input, ["PIPING_LINE"]);
  const lineRecordId = explicit(input.lineRecordId, "LINE_CONTEXT_REQUIRED");
  const lineTag = explicit(input.lineTag, "LINE_TAG_REQUIRED");
  const lineDescription = explicit(input.lineDescription, "LINE_DESCRIPTION_REQUIRED");
  const lineClassification = explicit(input.lineClassification, "LINE_CLASSIFICATION_REQUIRED");
  const lineFunction = explicit(input.lineFunction, "LINE_FUNCTION_REQUIRED");
  const applicableScope = explicit(input.applicableScope, "APPLICABLE_SCOPE_REQUIRED");
  const limitations = input.limitations == null || input.limitations === "" ? null : explicit(input.limitations, "LIMITATIONS_INVALID");
  if (!(D5_R2_LINE_CLASSIFICATIONS as readonly string[]).includes(lineClassification)) fail("LINE_CLASSIFICATION_NOT_ALLOWLISTED");
  if (!(D5_R2_SERVICE_FUNCTIONS as readonly string[]).includes(lineFunction)) fail("LINE_FUNCTION_NOT_ALLOWLISTED");
  const predecessor = input.predecessorLineRecordId ? store.lines.find((row) => row.lineRecordId === input.predecessorLineRecordId) : null;
  if (input.predecessorLineRecordId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || !sameLineage(store, prepared.object, predecessor.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    lineRecordId, contextId: prepared.context.contextId, objectId: prepared.object.objectId, objectRevisionFingerprint: prepared.object.fingerprint,
    lineTag, lineDescription, lineClassification, lineFunction, applicableScope, limitations,
    provenanceRef: prepared.provenanceRef, sourceBasisRef: prepared.sourceBasisRef, processSourceRef: prepared.processSourceRef,
    citedLifecycleStage: prepared.stage, citedCurrentness: prepared.citedCurrentness, predecessorLineRecordId: predecessor?.lineRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.lines.find((row) => row.lineRecordId === lineRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_LINE_REJECTED");
  const duplicate = store.lines.find((row) => row.recordStatus === "CURRENT" && row.lineRecordId !== predecessor?.lineRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.lineClassification === lineClassification && row.lineTag === lineTag);
  if (duplicate) fail("DUPLICATE_LINE_REJECTED");
  const record: D5R2LineRecord = Object.freeze({
    ...truthBase(actor, prepared, fingerprint),
    recordedAt: store.now(),
    lineRecordId,
    lineTag,
    lineDescription,
    lineClassification: lineClassification as D5R2LineRecord["lineClassification"],
    lineFunction: lineFunction as D5R2LineRecord["lineFunction"],
    applicableScope,
    limitations,
    specificationEstablished: false,
    designConditionEstablished: false,
    predecessorLineRecordId: predecessor?.lineRecordId ?? null,
  });
  if (predecessor) {
    const index = store.lines.findIndex((row) => row.lineRecordId === predecessor.lineRecordId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, currentness: "SUPERSEDED" as const });
    store.lines[index] = superseded;
    remember(store, "LINE", superseded.lineRecordId, "SUPERSEDED", superseded.fingerprint);
  }
  store.lines.push(record);
  remember(store, "LINE", record.lineRecordId, "CREATED", record.fingerprint);
  return record;
}

export function recordPipingServiceFunction(store: D5R2Store, actor: D5R1Actor, input: D5R2ServiceInput): D5R2ServiceRecord {
  const prepared = prepare(store, actor, input, ["PIPING_SERVICE_CONTEXT"]);
  const serviceRecordId = explicit(input.serviceRecordId, "SERVICE_CONTEXT_REQUIRED");
  const serviceFunction = explicit(input.serviceFunction, "SERVICE_FUNCTION_REQUIRED");
  const serviceDescription = explicit(input.serviceDescription, "SERVICE_DESCRIPTION_REQUIRED");
  const applicableScope = explicit(input.applicableScope, "APPLICABLE_SCOPE_REQUIRED");
  const limitations = input.limitations == null || input.limitations === "" ? null : explicit(input.limitations, "LIMITATIONS_INVALID");
  if (!(D5_R2_SERVICE_FUNCTIONS as readonly string[]).includes(serviceFunction)) fail("SERVICE_FUNCTION_NOT_ALLOWLISTED");
  const predecessor = input.predecessorServiceRecordId ? store.services.find((row) => row.serviceRecordId === input.predecessorServiceRecordId) : null;
  if (input.predecessorServiceRecordId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || !sameLineage(store, prepared.object, predecessor.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    serviceRecordId, contextId: prepared.context.contextId, objectId: prepared.object.objectId, objectRevisionFingerprint: prepared.object.fingerprint,
    serviceFunction, serviceDescription, applicableScope, limitations,
    provenanceRef: prepared.provenanceRef, sourceBasisRef: prepared.sourceBasisRef, processSourceRef: prepared.processSourceRef,
    citedLifecycleStage: prepared.stage, citedCurrentness: prepared.citedCurrentness, predecessorServiceRecordId: predecessor?.serviceRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.services.find((row) => row.serviceRecordId === serviceRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_SERVICE_REJECTED");
  const duplicate = store.services.find((row) => row.recordStatus === "CURRENT" && row.serviceRecordId !== predecessor?.serviceRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.serviceFunction === serviceFunction);
  if (duplicate) fail("DUPLICATE_SERVICE_REJECTED");
  const record: D5R2ServiceRecord = Object.freeze({
    ...truthBase(actor, prepared, fingerprint),
    recordedAt: store.now(),
    serviceRecordId,
    serviceFunction: serviceFunction as D5R2ServiceRecord["serviceFunction"],
    serviceDescription,
    applicableScope,
    limitations,
    processStream: false,
    processCondition: false,
    predecessorServiceRecordId: predecessor?.serviceRecordId ?? null,
  });
  if (predecessor) {
    const index = store.services.findIndex((row) => row.serviceRecordId === predecessor.serviceRecordId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, currentness: "SUPERSEDED" as const });
    store.services[index] = superseded;
    remember(store, "SERVICE", superseded.serviceRecordId, "SUPERSEDED", superseded.fingerprint);
  }
  store.services.push(record);
  remember(store, "SERVICE", record.serviceRecordId, "CREATED", record.fingerprint);
  return record;
}

export function recordPipingSystemLineMembership(store: D5R2Store, actor: D5R1Actor, input: D5R2MembershipInput): D5R2MembershipRecord {
  const prepared = prepare(store, actor, input, ["PIPING_LINE"]);
  if (input.membershipBasis != null && input.membershipBasis !== "EXPLICIT") fail("INFERRED_MEMBERSHIP_REJECTED");
  const membershipId = explicit(input.membershipId, "MEMBERSHIP_REQUIRED");
  const system = requireObject(store, actor, prepared.context.contextId, input.systemObjectId, input.systemRevisionFingerprint, ["PIPING_SYSTEM_CONTEXT"], prepared.citedCurrentness);
  const predecessor = input.predecessorMembershipId ? store.memberships.find((row) => row.membershipId === input.predecessorMembershipId) : null;
  if (input.predecessorMembershipId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    membershipId, contextId: prepared.context.contextId, lineObjectId: prepared.object.objectId, lineRevisionFingerprint: prepared.object.fingerprint,
    systemObjectId: system.objectId, systemRevisionFingerprint: system.fingerprint, membershipBasis: "EXPLICIT",
    provenanceRef: prepared.provenanceRef, sourceBasisRef: prepared.sourceBasisRef, citedCurrentness: prepared.citedCurrentness,
    predecessorMembershipId: predecessor?.membershipId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.memberships.find((row) => row.membershipId === membershipId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_MEMBERSHIP_REJECTED");
  const duplicate = store.memberships.find((row) => row.recordStatus === "CURRENT" && row.membershipId !== predecessor?.membershipId && row.lineObjectId === prepared.object.objectId && row.lineRevisionFingerprint === prepared.object.fingerprint && row.systemObjectId === system.objectId && row.systemRevisionFingerprint === system.fingerprint);
  if (duplicate) fail("DUPLICATE_MEMBERSHIP_REJECTED");
  const record: D5R2MembershipRecord = Object.freeze({
    membershipId,
    contextId: prepared.context.contextId,
    lineObjectId: prepared.object.objectId,
    lineRevisionFingerprint: prepared.object.fingerprint,
    systemObjectId: system.objectId,
    systemRevisionFingerprint: system.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    membershipBasis: "EXPLICIT",
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    citedCurrentness: prepared.citedCurrentness,
    authority: D5_CONTEXT_AUTHORITY,
    inferred: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorMembershipId: predecessor?.membershipId ?? null,
  });
  if (predecessor) {
    const index = store.memberships.findIndex((row) => row.membershipId === predecessor.membershipId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, currentness: "SUPERSEDED" as const });
    store.memberships[index] = superseded;
    remember(store, "MEMBERSHIP", superseded.membershipId, "SUPERSEDED", superseded.fingerprint);
  }
  store.memberships.push(record);
  remember(store, "MEMBERSHIP", record.membershipId, "CREATED", record.fingerprint);
  return record;
}

export function recordPipingLineServiceAssociation(store: D5R2Store, actor: D5R1Actor, input: D5R2AssociationInput): D5R2AssociationRecord {
  const prepared = prepare(store, actor, input, ["PIPING_LINE"]);
  if (input.associationBasis != null && input.associationBasis !== "EXPLICIT") fail("INFERRED_SERVICE_REJECTED");
  const associationId = explicit(input.associationId, "ASSOCIATION_REQUIRED");
  const service = requireObject(store, actor, prepared.context.contextId, input.serviceObjectId, input.serviceRevisionFingerprint, ["PIPING_SERVICE_CONTEXT"], prepared.citedCurrentness);
  const predecessor = input.predecessorAssociationId ? store.associations.find((row) => row.associationId === input.predecessorAssociationId) : null;
  if (input.predecessorAssociationId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    associationId, contextId: prepared.context.contextId, lineObjectId: prepared.object.objectId, lineRevisionFingerprint: prepared.object.fingerprint,
    serviceObjectId: service.objectId, serviceRevisionFingerprint: service.fingerprint, associationBasis: "EXPLICIT",
    provenanceRef: prepared.provenanceRef, sourceBasisRef: prepared.sourceBasisRef, citedCurrentness: prepared.citedCurrentness,
    predecessorAssociationId: predecessor?.associationId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.associations.find((row) => row.associationId === associationId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_ASSOCIATION_REJECTED");
  const duplicate = store.associations.find((row) => row.recordStatus === "CURRENT" && row.associationId !== predecessor?.associationId && row.lineObjectId === prepared.object.objectId && row.lineRevisionFingerprint === prepared.object.fingerprint && row.serviceObjectId === service.objectId && row.serviceRevisionFingerprint === service.fingerprint);
  if (duplicate) fail("DUPLICATE_ASSOCIATION_REJECTED");
  const record: D5R2AssociationRecord = Object.freeze({
    associationId,
    contextId: prepared.context.contextId,
    lineObjectId: prepared.object.objectId,
    lineRevisionFingerprint: prepared.object.fingerprint,
    serviceObjectId: service.objectId,
    serviceRevisionFingerprint: service.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    associationBasis: "EXPLICIT",
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    citedCurrentness: prepared.citedCurrentness,
    authority: D5_CONTEXT_AUTHORITY,
    inferred: false,
    processDesign: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorAssociationId: predecessor?.associationId ?? null,
  });
  if (predecessor) {
    const index = store.associations.findIndex((row) => row.associationId === predecessor.associationId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, currentness: "SUPERSEDED" as const });
    store.associations[index] = superseded;
    remember(store, "ASSOCIATION", superseded.associationId, "SUPERSEDED", superseded.fingerprint);
  }
  store.associations.push(record);
  remember(store, "ASSOCIATION", record.associationId, "CREATED", record.fingerprint);
  return record;
}

export function mutatePipingSystemLineService(): never {
  return fail("CONTEXT_MUTATION_REJECTED");
}

export function repointPipingSystemLineService(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function recordPipingDesignCondition(): never {
  return fail("DESIGN_CONDITION_NOT_IN_R2");
}

export function recordPipingComponent(): never {
  return fail("COMPONENT_NOT_IN_R2");
}

export function recordPipingRoute(): never {
  return fail("ROUTING_NOT_IN_R2");
}

export function recordPipingStressSupport(): never {
  return fail("STRESS_SUPPORT_NOT_IN_R2");
}

export function calculatePiping(): never {
  return fail("CALCULATION_NOT_IN_R2");
}

export function validatePipingEngineering(): never {
  return fail("VALIDATION_NOT_IN_R2");
}
