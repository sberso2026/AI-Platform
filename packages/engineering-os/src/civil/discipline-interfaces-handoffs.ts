/**
 * EOS-D2-R8 discipline interfaces and handoffs.
 * Records Civil-side handoff context on exact D2 sources and, where a
 * counterpart already exists, an exact D1K interface revision.
 * Does not reason across disciplines or start D3 through D9.
 */
import {
  D1_EQUALS_D2_CIVIL_AUTHORITY as ARCH_D1_EQUALS_D2_CIVIL_AUTHORITY,
  D2_CURRENTNESS_STATES,
  D2_D1_INTERFACE_TOPICS,
  D2_D3_INTERFACE_TOPICS,
  D2_D4_D8_FUTURE_INTERFACE_TOPICS,
  D2_EQUALS_D1_STRUCTURAL_AUTHORITY as ARCH_D2_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D2_EQUALS_D3_GEOTECHNICAL_AUTHORITY as ARCH_D2_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D2_IMPLEMENTATION_PHASES,
  D2_OWNS_D4_D8_ENGINEERING_TRUTH as ARCH_D2_OWNS_D4_D8_ENGINEERING_TRUTH,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D1K_R3_ACKNOWLEDGED_EQUALS_ENGINEERING_APPROVED,
  D1K_R3_AI_CAN_APPROVE_INTERFACE,
  D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED,
} from "../structural-systems/interface-handoff-governance";
import type { D1kR1Store } from "../structural-systems/interface-identity-foundation";
import {
  D2_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY,
  D2_CONTEXT_AUTHORITY,
  D2_DISCIPLINE,
  type D2R1Actor,
} from "./identity-foundation";
import { D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY as R2_SPATIAL_READY } from "./spatial-surface-context";
import { D2_GRADING_EARTHWORKS_RUNTIME_READY as R3_GRADING_READY } from "./grading-earthworks-context";
import { D2_ROADS_ACCESS_RUNTIME_READY as R4_ROADS_READY } from "./roads-access-context";
import { D2_DRAINAGE_STORMWATER_RUNTIME_READY as R5_DRAINAGE_READY } from "./drainage-stormwater-context";
import { D2_CIVIL_UTILITY_CORRIDOR_RUNTIME_READY as R6_UTILITY_READY } from "./utility-corridor-context";
import {
  D2_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY as R7_REQUIREMENTS_READY,
  type D2R7Store,
} from "./requirements-assumptions-change";

export const D2_R8_STATUS = "DISCIPLINE_INTERFACES_AND_HANDOFFS_IMPLEMENTED" as const;
export const D2_R8_MATURITY = "DISCIPLINE_INTERFACES_AND_HANDOFFS_IMPLEMENTED" as const;
export const D2_R8_MATURITY_STATE = D2_R8_MATURITY;
export const D2_R8_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D2_R8_DISCIPLINE_INTERFACES_AND_HANDOFFS_CLOSEOUT.md" as const;
export const D2_RUNTIME_STARTED = true as const;
export const D2_RUNTIME_COUNT = 8 as const;
export const D2_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY = R2_SPATIAL_READY;
export const D2_GRADING_EARTHWORKS_RUNTIME_READY = R3_GRADING_READY;
export const D2_ROADS_ACCESS_RUNTIME_READY = R4_ROADS_READY;
export const D2_DRAINAGE_STORMWATER_RUNTIME_READY = R5_DRAINAGE_READY;
export const D2_CIVIL_UTILITY_CORRIDOR_RUNTIME_READY = R6_UTILITY_READY;
export const D2_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = R7_REQUIREMENTS_READY;
export const D2_DISCIPLINE_INTERFACE_RUNTIME_READY = true as const;
export const D2_DISCIPLINE_INTERFACE_HANDOFF_RUNTIME_IMPLEMENTED = true as const;
export const D2_DISCIPLINE_INTERFACE_HANDOFF_RUNTIME_COUNT = 1 as const;
export const CANONICAL_INTERFACE_GOVERNANCE_REUSED = true as const;
export const PARALLEL_GLOBAL_CROSS_DISCIPLINE_FRAMEWORK_CREATED = false as const;
export const EXACT_D2_INTERFACE_SOURCE_REFERENCE_REQUIRED = true as const;
export const FLOATING_D2_INTERFACE_SOURCE_REFERENCE_ALLOWED = false as const;
export const EXACT_COUNTERPART_REFERENCE_REQUIRED_WHEN_COUNTERPART_EXISTS = true as const;
export const FLOATING_COUNTERPART_REFERENCE_ALLOWED = false as const;
export const D2_D1_INTERFACE_RUNTIME_IMPLEMENTED = true as const;
export const D2_EQUALS_D1_STRUCTURAL_AUTHORITY = ARCH_D2_EQUALS_D1_STRUCTURAL_AUTHORITY;
export const D1_EQUALS_D2_CIVIL_AUTHORITY = ARCH_D1_EQUALS_D2_CIVIL_AUTHORITY;
export const D2_D3_INTERFACE_RUNTIME_IMPLEMENTED = true as const;
export const D2_EQUALS_D3_GEOTECHNICAL_AUTHORITY = ARCH_D2_EQUALS_D3_GEOTECHNICAL_AUTHORITY;
export const D2_D4_D8_FUTURE_HANDOFF_PLACEHOLDERS_IMPLEMENTED = true as const;
export const D2_OWNS_D4_D8_ENGINEERING_TRUTH_REUSED = ARCH_D2_OWNS_D4_D8_ENGINEERING_TRUTH;
export const INTERFACE_HANDOFF_EQUALS_AUTHORITY_TRANSFER = false as const;
export const SOURCE_EVIDENCE_EQUALS_RECEIVING_DISCIPLINE_VALIDATION = false as const;
export const HANDOFF_ACCEPTED_EQUALS_ENGINEERING_APPROVED = D1K_R3_ACKNOWLEDGED_EQUALS_ENGINEERING_APPROVED;
export const AI_CAN_APPROVE_CIVIL_INTERFACE = D1K_R3_AI_CAN_APPROVE_INTERFACE;
export const AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = false as const;
export const D2_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D2_AUTOMATIC_INTERFACE_CONFLICT_DETECTION_RUNTIME_COUNT = 0 as const;
export const D2_AUTOMATIC_INTERFACE_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D2_AUTOMATIC_COUNTERPART_VALIDATION_RUNTIME_COUNT = 0 as const;
export const INCOMPLETE_HANDOFF_EQUALS_VALIDATED_INTERFACE = false as const;
export const MISSING_COUNTERPART_AUTO_FABRICATED = false as const;
export const STALE_HANDOFF_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D2_R8_CREATES_PARALLEL_REQUIREMENT_GOVERNANCE = false as const;
export const D2_R8_CREATES_PARALLEL_ASSUMPTION_GOVERNANCE = false as const;
export const D2_R8_CREATES_PARALLEL_DECISION_GOVERNANCE = false as const;
export const INTERFACE_EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const CANONICAL_CURRENTNESS_REUSED = true as const;
export const PARALLEL_D2_CURRENTNESS_ENGINE_CREATED = false as const;
export const CANONICAL_FINGERPRINT_REUSED = true as const;
export const SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D2_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D2_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D2_INTERFACE_PROVENANCE_REQUIRED = true as const;
export const D2_INTERFACE_PROVENANCE_PRESERVED = true as const;
export const D2_INTERFACE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const SILENT_D2_INTERFACE_MUTATION_ALLOWED = false as const;
export const D2_INTERFACE_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D2_INTERFACE_SCOPE_ENFORCED = true as const;
export const D2_R8_HANDOFF_STATUSES = ["COMPLETE", "INCOMPLETE", "STALE", "AWAITING_COUNTERPART", "AWAITING_REVIEW", "NOT_YET_AVAILABLE", "REASSESSMENT_REQUIRED"] as const;
export const D2_R8_DIRECTIONS = ["D2_TO_COUNTERPART", "COUNTERPART_TO_D2"] as const;
export const D2_R8_FUTURE_DISCIPLINES = ["mechanical", "piping", "process", "electrical", "instrumentation_control"] as const;

export const D2_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D2_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D2_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;
export const D2_AUTOMATIC_GRADING_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_EARTHWORKS_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_ROAD_GEOMETRIC_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_HYDROLOGY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_HYDRAULIC_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_UTILITY_ROUTE_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D2_QUANTITY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_REVIEW_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D2_DEDICATED_CURRENTNESS_DIGITAL_THREAD_RUNTIME_COUNT = 0 as const;
export const D2_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 0 as const;
export const D2_D9_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D3_RUNTIME_STARTED = false as const;
export const D4_RUNTIME_STARTED = false as const;
export const D5_RUNTIME_STARTED = false as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const D3_D9_RUNTIME_STARTED = false as const;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;

export const D2_R9_CANONICAL_PHASE = D2_IMPLEMENTATION_PHASES[8];
export const D2_R9_PHASE_TYPE = "REVIEW_AND_VALIDATION_GOVERNANCE" as const;
export const D2_R9_CANONICAL_SCOPE =
  "Implement bounded Civil review and validation governance using exact D2 records and evidence. Record review requests, reviewer authority, review findings, validation state and evidence requirements without claiming engineering conformance, approval or certification beyond evidence actually present. Preserve human engineering authority. Do not automatically validate calculations, approve designs, certify Civil work, perform calculations, or start D3-D9." as const;
export const D2_R9_STARTED = false as const;
export const D2_R8_READY_FOR_NEXT_PHASE = true as const;
export const D2_R8_NEXT_PHASE = D2_R9_CANONICAL_PHASE;
export const D2_R8_NEXT_PHASE_TYPE = D2_R9_PHASE_TYPE;
export const D2_R8_CANONICAL_NEXT_PHASE = D2_R9_CANONICAL_PHASE;
export const D2_R8_CANONICAL_NEXT_PHASE_SCOPE = D2_R9_CANONICAL_SCOPE;
export const D2_R8_BLOCKER = "NONE" as const;
export const D2_R8_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["inferred", "unknown", "auto", "default"]);
const FUTURE = new Set<string>(D2_R8_FUTURE_DISCIPLINES);

type Prohibited = {
  transferAuthority?: boolean;
  reasonAcrossDisciplines?: boolean;
  detectConflict?: boolean;
  resolveConflict?: boolean;
  validateCounterpart?: boolean;
  fabricateCounterpart?: boolean;
  approve?: boolean;
  certify?: boolean;
  redesign?: boolean;
  recalculate?: boolean;
  repoint?: boolean;
  d3Start?: boolean;
  d9Reasoning?: boolean;
};

export type D2R8HandoffInput = Prohibited & {
  handoffId: string;
  contextId: string;
  objectId: string;
  sourceObjectId: string;
  sourceRevision: string;
  counterpartDiscipline: string;
  direction: string;
  interfaceTopic: string;
  counterpartInterfaceId: string | null;
  counterpartSourceRevision: string | null;
  evidenceObjectIds: readonly string[];
  requirementContextIds: readonly string[];
  assumptionContextIds: readonly string[];
  decisionContextIds: readonly string[];
  changeContextIds: readonly string[];
  limitations: string;
  handoffStatus: string;
  receivingAcknowledged?: boolean;
  citedCurrentness: string;
  provenanceRef: string;
  assertedFingerprint?: string;
  predecessorHandoffId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D2R8CounterpartPin = {
  interfaceId: string;
  sourceRevision: string;
  fingerprint: string;
};

export type D2R8HandoffRecord = {
  handoffId: string;
  contextId: string;
  objectId: string;
  sourceObjectId: string;
  sourceRevision: string;
  sourceObjectFingerprint: string;
  counterpartDiscipline: "structural" | "geotechnical" | (typeof D2_R8_FUTURE_DISCIPLINES)[number];
  direction: (typeof D2_R8_DIRECTIONS)[number];
  interfaceTopic: string;
  counterpart: D2R8CounterpartPin | null;
  evidenceObjectIds: readonly string[];
  requirementContextIds: readonly string[];
  assumptionContextIds: readonly string[];
  decisionContextIds: readonly string[];
  changeContextIds: readonly string[];
  limitations: string;
  ownership: "CIVIL";
  sourceAuthority: typeof D2_CONTEXT_AUTHORITY;
  receivingAuthority: string;
  handoffStatus: (typeof D2_R8_HANDOFF_STATUSES)[number];
  receivingAcknowledged: boolean;
  authorityTransferred: false;
  engineeringValidated: false;
  engineeringApproved: false;
  citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number];
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorHandoffId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D2R8History = {
  historyId: string;
  handoffId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D2R8Store = {
  r7: D2R7Store;
  d1: D1kR1Store | null;
  now: () => string;
  handoffs: D2R8HandoffRecord[];
  history: D2R8History[];
};

function fail(code: string): never {
  throw new Error(code);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function isCurrentness(value: string): value is (typeof D2_CURRENTNESS_STATES)[number] {
  return (D2_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function assertActor(actor: D2R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_CIVIL_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_CIVIL_AUTHORITY");
  if (actor.authority === "CIVIL_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_CIVIL_ENGINEERING_AUTHORITY");
  if (actor.authority !== D2_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertProhibited(input: Prohibited): void {
  if (input.transferAuthority === true) fail("AUTHORITY_TRANSFER_REJECTED");
  if (input.reasonAcrossDisciplines === true || input.d9Reasoning === true) fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R8");
  if (input.detectConflict === true) fail("CONFLICT_DETECTION_NOT_IN_R8");
  if (input.resolveConflict === true) fail("CONFLICT_RESOLUTION_NOT_IN_R8");
  if (input.validateCounterpart === true) fail("COUNTERPART_VALIDATION_NOT_IN_R8");
  if (input.fabricateCounterpart === true) fail("COUNTERPART_FABRICATION_REJECTED");
  if (input.approve === true) fail("APPROVAL_NOT_IN_R8");
  if (input.certify === true) fail("CERTIFICATION_NOT_IN_R8");
  if (input.redesign === true) fail("REDESIGN_NOT_IN_R8");
  if (input.recalculate === true) fail("RECALCULATION_NOT_IN_R8");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.d3Start === true) fail("D3_NOT_STARTED");
}

function requireContext(store: D2R8Store, actor: D2R1Actor, contextId: string, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]) {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r7.r6.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === id);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (context.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (context.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (context.discipline !== D2_DISCIPLINE) fail("DISCIPLINE_NOT_CIVIL");
  if (citedCurrentness === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  return context;
}

function requireObject(store: D2R8Store, actor: D2R1Actor, contextId: string, objectId: string, objectType: string | null, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number], code: string) {
  const id = explicit(objectId, code);
  const object = store.r7.r6.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === id);
  if (!object || object.contextId !== contextId || object.tenantId !== actor.tenantId) fail(code);
  if (objectType && object.objectType !== objectType) fail(code);
  if (citedCurrentness === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function evidenceIds(store: D2R8Store, actor: D2R1Actor, contextId: string, objectIds: readonly string[] | undefined): string[] {
  if (!Array.isArray(objectIds)) fail("EVIDENCE_REFERENCE_REQUIRED");
  const ids = [...new Set(objectIds.map((id) => explicit(id, "EVIDENCE_REFERENCE_REQUIRED")))].sort();
  for (const id of ids) {
    const object = store.r7.r6.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === id);
    if (!object || object.objectType !== "CIVIL_EVIDENCE_REFERENCE" || object.contextId !== contextId || object.tenantId !== actor.tenantId) fail("EVIDENCE_REFERENCE_REQUIRED");
  }
  return ids;
}

function citeGovernance<T extends { contextId: string; recordStatus: string }>(rows: readonly T[], ids: readonly string[] | undefined, pick: (row: T) => string, code: string, contextId: string, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]): string[] {
  if (!Array.isArray(ids)) fail(code);
  const unique = [...new Set(ids.map((id) => explicit(id, code)))].sort();
  for (const id of unique) {
    const row = rows.find((item) => pick(item) === id && item.contextId === contextId);
    if (!row) fail(code);
    if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail("R7_RECORD_NOT_CURRENT");
  }
  return unique;
}

function topicFor(discipline: string, topic: string): string {
  const value = explicit(topic, "INTERFACE_TOPIC_REQUIRED");
  const allowed = discipline === "structural"
    ? D2_D1_INTERFACE_TOPICS
    : discipline === "geotechnical"
      ? D2_D3_INTERFACE_TOPICS
      : D2_D4_D8_FUTURE_INTERFACE_TOPICS;
  if (!(allowed as readonly string[]).includes(value)) fail("INTERFACE_TOPIC_INVALID");
  return value;
}

function pinCounterpart(store: D2R8Store, actor: D2R1Actor, discipline: string, interfaceId: string | null, revision: string | null, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]): D2R8CounterpartPin | null {
  if (discipline !== "structural") {
    if (interfaceId != null || revision != null) fail("COUNTERPART_FABRICATION_REJECTED");
    return null;
  }
  if (interfaceId == null) {
    if (revision != null) fail("COUNTERPART_REVISION_WITHOUT_REFERENCE");
    return null;
  }
  const id = explicit(interfaceId, "COUNTERPART_REFERENCE_REQUIRED");
  const sourceRevision = explicit(revision ?? "", "COUNTERPART_REVISION_REQUIRED");
  const row = store.d1?.records.find((item) => item.interfaceId === id);
  if (!row || row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId) fail("COUNTERPART_NOT_FOUND");
  if (row.targetDiscipline !== "structural" && row.sourceDiscipline !== "structural") fail("COUNTERPART_NOT_STRUCTURAL");
  if (row.sourceRevision !== sourceRevision) fail("COUNTERPART_REVISION_MISMATCH");
  if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail("COUNTERPART_NOT_CURRENT");
  return { interfaceId: row.interfaceId, sourceRevision: row.sourceRevision, fingerprint: row.fingerprint };
}

export function createD2R8Store(r7: D2R7Store, d1: D1kR1Store | null = null, now: () => string = () => "2026-10-22T00:00:00.000Z"): D2R8Store {
  return { r7, d1, now, handoffs: [], history: [] };
}

export function recordCivilInterfaceHandoff(store: D2R8Store, actor: D2R1Actor, input: D2R8HandoffInput): D2R8HandoffRecord {
  if (input.approve === true && (blockedParty(actor.actorId) || blockedParty(actor.authority))) fail("AI_CANNOT_APPROVE_INTERFACE");
  assertActor(actor);
  assertProhibited(input);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  const citedCurrentness = input.citedCurrentness.trim();
  if (!isCurrentness(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const currentness = citedCurrentness;
  const context = requireContext(store, actor, input.contextId, currentness);
  const interfaceObject = requireObject(store, actor, context.contextId, input.objectId, "CIVIL_INTERFACE", currentness, "INTERFACE_OBJECT_REQUIRED");
  const sourceObject = requireObject(store, actor, context.contextId, input.sourceObjectId, null, currentness, "SOURCE_OBJECT_REQUIRED");
  const sourceRevision = explicit(input.sourceRevision, "SOURCE_REVISION_REQUIRED");
  const discipline = explicit(input.counterpartDiscipline, "COUNTERPART_DISCIPLINE_REQUIRED");
  if (discipline !== "structural" && discipline !== "geotechnical" && !FUTURE.has(discipline)) fail("COUNTERPART_DISCIPLINE_INVALID");
  const direction = explicit(input.direction, "DIRECTION_REQUIRED");
  if (!(D2_R8_DIRECTIONS as readonly string[]).includes(direction)) fail("DIRECTION_INVALID");
  const interfaceTopic = topicFor(discipline, input.interfaceTopic);
  const counterpart = pinCounterpart(store, actor, discipline, input.counterpartInterfaceId, input.counterpartSourceRevision, currentness);
  const evidenceObjectIds = evidenceIds(store, actor, context.contextId, input.evidenceObjectIds);
  const requirementContextIds = citeGovernance(store.r7.requirements, input.requirementContextIds, (row) => row.requirementContextId, "REQUIREMENT_REFERENCE_REQUIRED", context.contextId, currentness);
  const assumptionContextIds = citeGovernance(store.r7.assumptions, input.assumptionContextIds, (row) => row.assumptionContextId, "ASSUMPTION_REFERENCE_REQUIRED", context.contextId, currentness);
  const decisionContextIds = citeGovernance(store.r7.decisions, input.decisionContextIds, (row) => row.decisionContextId, "DECISION_REFERENCE_REQUIRED", context.contextId, currentness);
  const changeContextIds = citeGovernance(store.r7.changes, input.changeContextIds, (row) => row.changeContextId, "CHANGE_REFERENCE_REQUIRED", context.contextId, currentness);
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const handoffStatus = explicit(input.handoffStatus, "HANDOFF_STATUS_REQUIRED");
  if (!(D2_R8_HANDOFF_STATUSES as readonly string[]).includes(handoffStatus)) fail("HANDOFF_STATUS_INVALID");
  if (discipline !== "structural" && handoffStatus === "COMPLETE") fail("INCOMPLETE_COUNTERPART_NOT_COMPLETE");
  if (handoffStatus === "COMPLETE" && !counterpart) fail("COUNTERPART_REQUIRED_FOR_COMPLETE");
  if (handoffStatus === "COMPLETE" && evidenceObjectIds.length === 0) fail("EVIDENCE_REQUIRED_FOR_COMPLETE");
  if ((handoffStatus === "AWAITING_COUNTERPART" || handoffStatus === "NOT_YET_AVAILABLE") && counterpart) fail("COUNTERPART_NOT_AWAITING");
  if (handoffStatus === "STALE" && currentness !== "STALE") fail("CURRENTNESS_STATUS_MISMATCH");
  if (handoffStatus === "REASSESSMENT_REQUIRED" && currentness !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
  if (currentness === "CURRENT" && (handoffStatus === "STALE" || handoffStatus === "REASSESSMENT_REQUIRED")) fail("CURRENTNESS_STATUS_MISMATCH");
  if (FUTURE.has(discipline) && handoffStatus === "COMPLETE") fail("INCOMPLETE_COUNTERPART_NOT_COMPLETE");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const handoffId = explicit(input.handoffId, "HANDOFF_ID_REQUIRED");
  const predecessor = input.predecessorHandoffId ? store.handoffs.find((row) => row.handoffId === input.predecessorHandoffId) : null;
  if (input.predecessorHandoffId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.contextId !== context.contextId)) fail("PREDECESSOR_NOT_CURRENT");
  const receivingAcknowledged = input.receivingAcknowledged === true;
  const fingerprint = fingerprintCanonical({
    handoffId,
    contextId: context.contextId,
    objectId: interfaceObject.objectId,
    sourceObjectId: sourceObject.objectId,
    sourceRevision,
    sourceObjectFingerprint: sourceObject.fingerprint,
    counterpartDiscipline: discipline,
    direction,
    interfaceTopic,
    counterpart,
    evidenceObjectIds,
    requirementContextIds,
    assumptionContextIds,
    decisionContextIds,
    changeContextIds,
    limitations,
    handoffStatus,
    receivingAcknowledged,
    citedCurrentness: currentness,
    provenanceRef,
    authority: D2_CONTEXT_AUTHORITY,
    predecessorHandoffId: predecessor?.handoffId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.handoffs.find((row) => row.handoffId === handoffId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("HANDOFF_ALREADY_RECORDED");
  }
  const signature = `${interfaceObject.objectId}|${sourceObject.objectId}|${sourceRevision}|${discipline}|${interfaceTopic}|${counterpart?.interfaceId ?? ""}|${counterpart?.sourceRevision ?? ""}`;
  if (store.handoffs.some((row) => row.recordStatus === "CURRENT" && row.handoffId !== predecessor?.handoffId && row.contextId === context.contextId && `${row.objectId}|${row.sourceObjectId}|${row.sourceRevision}|${row.counterpartDiscipline}|${row.interfaceTopic}|${row.counterpart?.interfaceId ?? ""}|${row.counterpart?.sourceRevision ?? ""}` === signature)) fail("DUPLICATE_HANDOFF_REJECTED");
  const beforeObjects = store.r7.r6.r5.r4.r3.r2.r1.objects.map((row) => row.objectId + row.fingerprint).join("|");
  const beforeD1 = store.d1?.records.map((row) => row.interfaceId + row.fingerprint + row.recordStatus).join("|") ?? "";
  const record: D2R8HandoffRecord = Object.freeze({
    handoffId,
    contextId: context.contextId,
    objectId: interfaceObject.objectId,
    sourceObjectId: sourceObject.objectId,
    sourceRevision,
    sourceObjectFingerprint: sourceObject.fingerprint,
    counterpartDiscipline: discipline as D2R8HandoffRecord["counterpartDiscipline"],
    direction: direction as D2R8HandoffRecord["direction"],
    interfaceTopic,
    counterpart,
    evidenceObjectIds,
    requirementContextIds,
    assumptionContextIds,
    decisionContextIds,
    changeContextIds,
    limitations,
    ownership: "CIVIL",
    sourceAuthority: D2_CONTEXT_AUTHORITY,
    receivingAuthority: discipline,
    handoffStatus: handoffStatus as D2R8HandoffRecord["handoffStatus"],
    receivingAcknowledged,
    authorityTransferred: false,
    engineeringValidated: false,
    engineeringApproved: false,
    citedCurrentness: currentness,
    provenanceRef,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorHandoffId: predecessor?.handoffId ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.handoffs.findIndex((row) => row.handoffId === predecessor.handoffId);
    store.handoffs[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", citedCurrentness: "SUPERSEDED" });
    store.history.push({ historyId: `hist-${store.history.length + 1}`, handoffId: predecessor.handoffId, action: "SUPERSEDED", fingerprint: predecessor.fingerprint, recordedAt: store.now() });
  }
  store.handoffs.push(record);
  store.history.push({ historyId: `hist-${store.history.length + 1}`, handoffId: record.handoffId, action: "CREATED", fingerprint: record.fingerprint, recordedAt: store.now() });
  if (store.r7.r6.r5.r4.r3.r2.r1.objects.map((row) => row.objectId + row.fingerprint).join("|") !== beforeObjects) fail("UPSTREAM_MUTATION_REJECTED");
  if ((store.d1?.records.map((row) => row.interfaceId + row.fingerprint + row.recordStatus).join("|") ?? "") !== beforeD1) fail("COUNTERPART_MUTATION_REJECTED");
  return record;
}

export function mutateCivilInterface(): never {
  return fail("INTERFACE_MUTATION_REJECTED");
}

export function reasonAcrossDisciplines(): never {
  return fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R8");
}

export function detectInterfaceConflict(): never {
  return fail("CONFLICT_DETECTION_NOT_IN_R8");
}

export function resolveInterfaceConflict(): never {
  return fail("CONFLICT_RESOLUTION_NOT_IN_R8");
}

export function validateCounterpart(): never {
  return fail("COUNTERPART_VALIDATION_NOT_IN_R8");
}
