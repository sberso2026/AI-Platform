/**
 * EOS-D1K-R3 handoff, response, change, and conflict governance.
 * Records lifecycle evidence around an R1 pin and R2 diagnostic. Does not resolve engineering.
 */

import { D1K_HANDOFF_STATES } from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D1K_R3_CANONICAL_PHASE,
  D1K_R3_CANONICAL_SCOPE,
  D1K_R3_PHASE_TYPE,
  type D1kR2Result,
} from "./interface-compatibility";
import {
  inspectStructuralInterfaceIdentity,
  supersedeStructuralInterfaceSource,
  type D1kR1Actor,
  type D1kR1InterfaceInput,
  type D1kR1InterfaceRecord,
  type D1kR1Store,
} from "./interface-identity-foundation";

export { D1K_R3_CANONICAL_PHASE, D1K_R3_CANONICAL_SCOPE, D1K_R3_PHASE_TYPE };

export const D1K_R3_STATUS = "HANDOFF_GOVERNANCE_DEFINED" as const;
export const D1K_R3_MATURITY_STATE = "STRUCTURAL_INTERFACE_HANDOFF_RESPONSE_CHANGE_CONFLICT_GOVERNANCE_IMPLEMENTED" as const;
export const D1K_R3_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D1K_R3_HANDOFF_RESPONSE_CHANGE_CONFLICT_GOVERNANCE_CLOSEOUT.md" as const;
export const D1K_R3_ARCHITECTURE_READY = true as const;
export const D1K_R3_REFERENCE_RUNTIME_READY = true as const;
export const D1K_R3_EXTERNAL_REFERENCE_READY = false as const;
export const D1K_R3_INTERNAL_DISCIPLINE_INTEGRATION_READY = false as const;
export const D1K_R3_CROSS_DISCIPLINE_INTELLIGENCE_READY = false as const;
export const D1K_R3_ACTOR_ROLES = ["REQUESTER", "PROVIDER", "REVIEWER", "STRUCTURAL_ENGINEER"] as const;
export const D1K_R3_RESPONSE_KINDS = ["PENDING", "CLARIFICATION", "REJECTION", "UNABLE_TO_PROVIDE", "SUPERSEDING_SOURCE_REFERENCE"] as const;
export const D1K_R3_HANDOFF_GOVERNANCE_RUNTIME_COUNT = 1 as const;
export const D1K_R3_REQUEST_GOVERNANCE_RUNTIME_COUNT = 1 as const;
export const D1K_R3_PROVISION_GOVERNANCE_RUNTIME_COUNT = 1 as const;
export const D1K_R3_ACKNOWLEDGEMENT_GOVERNANCE_RUNTIME_COUNT = 1 as const;
export const D1K_R3_RESPONSE_GOVERNANCE_RUNTIME_COUNT = 1 as const;
export const D1K_R3_SOURCE_CHANGE_GOVERNANCE_RUNTIME_COUNT = 1 as const;
export const D1K_R3_STALENESS_GOVERNANCE_RUNTIME_COUNT = 1 as const;
export const D1K_R3_CONFLICT_GOVERNANCE_RUNTIME_COUNT = 1 as const;
export const D1K_R3_HUMAN_DISPOSITION_RUNTIME_COUNT = 1 as const;
export const D1K_R3_AUTOMATIC_ENGINEERING_CONFLICT_RESOLUTION_COUNT = 0 as const;
export const D1K_R3_SCHEMA_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1K_R3_UNIT_CONVERSION_RUNTIME_COUNT = 0 as const;
export const D1K_R3_COORDINATE_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1K_R3_AXIS_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1K_R3_SIGN_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1K_R3_NEW_EXTERNAL_NOTIFICATION_RUNTIME_COUNT = 0 as const;
export const D1K_R3_D2_D8_RUNTIME_STARTED = false as const;
export const D1K_R3_D2_D8_RUNTIME_COUNT = 0 as const;
export const D1K_R3_D9_RUNTIME_STARTED = false as const;
export const D1K_R3_D9_RUNTIME_COUNT = 0 as const;
export const D1K_R3_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1K_R3_CROSS_DISCIPLINE_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D1K_R3_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1K_R3_SOURCE_MUTATION_AUTHORIZED = false as const;
export const D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED = false as const;
export const D1K_R3_SOURCE_REVISION_AUTO_UPGRADED = false as const;
export const D1K_R3_R2_RESULT_AUTO_CARRIED_TO_CHANGED_SOURCE = false as const;
export const D1K_R3_COMPATIBILITY_REEVALUATION_REQUIRED_AFTER_SOURCE_CHANGE = true as const;
export const D1K_R3_INTERFACE_CONFLICT_EQUALS_STRUCTURAL_FAILURE = false as const;
export const D1K_R3_ACKNOWLEDGED_EQUALS_ENGINEERING_ACCEPTED = false as const;
export const D1K_R3_ACKNOWLEDGED_EQUALS_ENGINEERING_APPROVED = false as const;
export const D1K_R3_CONFLICT_RESOLVED_EQUALS_STRUCTURAL_DESIGN_APPROVED = false as const;
export const D1K_R3_CONFLICT_RESOLVED_EQUALS_CERTIFICATION_APPROVED = false as const;
export const D1K_R3_INTERFACE_CLOSED_EQUALS_ENGINEERING_APPROVED = false as const;
export const D1K_R3_INTERFACE_CLOSED_EQUALS_DESIGN_APPROVED = false as const;
export const D1K_R3_INTERFACE_CLOSED_EQUALS_CERTIFIED = false as const;
export const D1K_R3_DIRECT_CALLER_RESOLVED_STATE_INJECTION_ALLOWED = false as const;
export const D1K_R3_SYSTEM_EVENT_CAN_IMPERSONATE_ENGINEERING_AUTHORITY = false as const;
export const D1K_R3_AI_CAN_INVENT_COUNTERPARTY_RESPONSE = false as const;
export const D1K_R3_AI_CAN_INVENT_SOURCE_CHANGE = false as const;
export const D1K_R3_AI_CAN_INVENT_HUMAN_DISPOSITION = false as const;
export const D1K_R3_AI_CAN_AUTO_RESOLVE_ENGINEERING_CONFLICT = false as const;
export const D1K_R3_AI_CAN_PROMOTE_STATE_FROM_FREE_TEXT = false as const;
export const D1K_R3_AI_CAN_CHANGE_SOURCE_AUTHORITY = false as const;
export const D1K_R3_AI_CAN_APPROVE_INTERFACE = false as const;
export const D1K_R3_AI_CAN_APPROVE_ENGINEERING = false as const;
export const D1K_R3_D1L_STARTED = false as const;
export const D1K_R3_D1M_ABSORBED = false as const;
export const D1K_R3_D1N_ABSORBED = false as const;
export const D1K_R3_DATABASE_SCHEMA_CHANGE_REQUIRED = false as const;
export const D1K_R3_NEW_DEPENDENCY_COUNT = 0 as const;
export const D1K_R3_POST_D1J_DEBT_PRESERVED = true as const;
export const D1K_R3_UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D1K_R3_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D1K_R4_HANDOFF_READY = true as const;
export const D1K_R4_CANONICAL_PHASE = "EOS-D1K-R4-INTERNAL-EXTERNAL-REFERENCE-COMPOSITION" as const;
export const D1K_R4_PHASE_TYPE = "STRUCTURAL_INTERFACE_INTERNAL_EXTERNAL_REFERENCE_COMPOSITION" as const;
export const D1K_R4_CANONICAL_SCOPE =
  "Compose governed D1K references through bounded external or manual reference seams and future internal EOS discipline-source seams. Do not implement D2 through D8 engineering runtime, D9 intelligence, an arbitrary payload bus, or engineering approval." as const;

export type D1kR3Role = (typeof D1K_R3_ACTOR_ROLES)[number];
export type D1kHandoffState = (typeof D1K_HANDOFF_STATES)[number];
export type D1kR3Actor = D1kR1Actor & { role: D1kR3Role };

export type D1kR3EventType =
  | "REQUEST_RECORDED"
  | "PROVISION_RECORDED"
  | "ACKNOWLEDGEMENT_RECORDED"
  | "RESPONSE_RECORDED"
  | "SOURCE_CHANGE_RECORDED"
  | "STALE_DEPENDENCY_RECORDED"
  | "COMPATIBILITY_CONFLICT_RECORDED"
  | "HUMAN_DISPOSITION_RECORDED";

export type D1kR3Event = {
  eventId: string;
  sequence: number;
  eventType: D1kR3EventType;
  interfaceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  actorId: string;
  actorRole: D1kR3Role | "DETERMINISTIC_SYSTEM";
  actorAuthority: string;
  sourceId: string;
  sourceRevision: string;
  sourceFingerprint: string;
  sourceAuthority: string;
  evidence: string | null;
  provenance: string;
  compatibilityFingerprint: string | null;
  handoffState: D1kHandoffState;
  predecessorInterfaceId: string | null;
  successorInterfaceId: string | null;
  responseKind: (typeof D1K_R3_RESPONSE_KINDS)[number] | null;
  dispositionStatus: "NONE" | "RECORDED" | "RESOLVED_BY_EVIDENCE";
  conflictPresent: boolean;
  structuralFailure: false;
  engineeringApproval: false;
  designApproved: false;
  certified: false;
  systemGenerated: boolean;
  engineeringAuthority: false;
  fingerprint: string;
  recordedAt: string;
};

export type D1kR3Store = {
  now: () => string;
  sequence: number;
  events: D1kR3Event[];
};

export type D1kR3GovernanceState = {
  interfaceId: string;
  sourceId: string;
  sourceRevision: string;
  sourceFingerprint: string;
  sourceAuthority: string;
  handoffState: D1kHandoffState | null;
  conflictPresent: boolean;
  dispositionStatus: "NONE" | "RECORDED" | "RESOLVED_BY_EVIDENCE";
  stale: boolean;
  responsePending: boolean;
  reevaluationRequired: boolean;
  compatibilityFingerprint: string | null;
  structuralFailure: false;
  engineeringApproval: false;
  designApproved: false;
  certified: false;
  eventFingerprints: readonly string[];
};

function fail(code: string): never {
  throw new Error(code);
}

function blockedAuthority(value: string): boolean {
  const authority = value.trim();
  return !authority || /^AI(?:\b|_)/i.test(authority) || /LLM/i.test(authority) || /OPTIMIZER/i.test(authority) || /^SYSTEM$/i.test(authority);
}

function assertHuman(actor: D1kR3Actor, role: D1kR3Role): void {
  if (!actor.actorId.trim() || blockedAuthority(actor.authority) || actor.role !== role) fail("UNAUTHORIZED");
}

function rejectInjection(input: object): void {
  const record = input as Record<string, unknown>;
  if (record.engineeringApproval === true || record.designApproved === true || record.certified === true) fail("DIRECT_STATE_INJECTION_REJECTED");
  if (typeof record.handoffState === "string") fail("DIRECT_STATE_INJECTION_REJECTED");
  if (record.resolved === true) fail("DIRECT_STATE_INJECTION_REJECTED");
}

function eventsFor(store: D1kR3Store, interfaceId: string): D1kR3Event[] {
  return store.events.filter((row) => row.interfaceId === interfaceId).sort((left, right) => left.sequence - right.sequence);
}

function remember(store: D1kR3Store, draft: Omit<D1kR3Event, "sequence" | "fingerprint" | "recordedAt">): D1kR3Event {
  const fingerprint = fingerprintCanonical({
    eventType: draft.eventType,
    interfaceId: draft.interfaceId,
    tenantId: draft.tenantId,
    workspaceId: draft.workspaceId,
    projectId: draft.projectId,
    actorRole: draft.actorRole,
    sourceId: draft.sourceId,
    sourceRevision: draft.sourceRevision,
    sourceFingerprint: draft.sourceFingerprint,
    sourceAuthority: draft.sourceAuthority,
    evidence: draft.evidence,
    provenance: draft.provenance,
    compatibilityFingerprint: draft.compatibilityFingerprint,
    handoffState: draft.handoffState,
    predecessorInterfaceId: draft.predecessorInterfaceId,
    successorInterfaceId: draft.successorInterfaceId,
    responseKind: draft.responseKind,
    dispositionStatus: draft.dispositionStatus,
    conflictPresent: draft.conflictPresent,
    systemGenerated: draft.systemGenerated,
  });
  const existing = store.events.find((row) => row.fingerprint === fingerprint);
  if (existing) return existing;
  const sameId = store.events.find((row) => row.eventId === draft.eventId);
  if (sameId) fail("EVENT_ALREADY_BOUND");
  const event: D1kR3Event = { ...draft, sequence: store.sequence, fingerprint, recordedAt: store.now() };
  store.sequence += 1;
  store.events.push(event);
  return event;
}

function baseDraft(record: D1kR1InterfaceRecord, actor: D1kR3Actor, eventId: string, eventType: D1kR3EventType, handoffState: D1kHandoffState): Omit<D1kR3Event, "sequence" | "fingerprint" | "recordedAt"> {
  return {
    eventId,
    eventType,
    interfaceId: record.interfaceId,
    tenantId: record.tenantId,
    workspaceId: record.workspaceId,
    projectId: record.projectId,
    actorId: actor.actorId,
    actorRole: actor.role,
    actorAuthority: actor.authority,
    sourceId: record.sourceId,
    sourceRevision: record.sourceRevision,
    sourceFingerprint: record.sourceFingerprint,
    sourceAuthority: record.sourceAuthority,
    evidence: record.evidence,
    provenance: record.provenance,
    compatibilityFingerprint: null,
    handoffState,
    predecessorInterfaceId: record.predecessorInterfaceId,
    successorInterfaceId: null,
    responseKind: null,
    dispositionStatus: "NONE",
    conflictPresent: false,
    structuralFailure: false,
    engineeringApproval: false,
    designApproved: false,
    certified: false,
    systemGenerated: false,
    engineeringAuthority: false,
  };
}

export function createD1kR3Store(now: () => string): D1kR3Store {
  return { now, sequence: 1, events: [] };
}

export function recordInterfaceRequest(interfaces: D1kR1Store, store: D1kR3Store, actor: D1kR3Actor, input: { eventId: string; interfaceId: string; requestedSemanticId: string | null; engineeringApproval?: boolean }): D1kR3Event {
  rejectInjection(input);
  assertHuman(actor, "REQUESTER");
  const record = inspectStructuralInterfaceIdentity(interfaces, actor, input.interfaceId);
  if (!input.requestedSemanticId?.trim()) fail("REQUEST_SUBJECT_REQUIRED");
  const draft = baseDraft(record, actor, input.eventId, "REQUEST_RECORDED", "REQUESTED");
  draft.evidence = input.requestedSemanticId;
  return remember(store, draft);
}

export function recordInterfaceProvision(interfaces: D1kR1Store, store: D1kR3Store, actor: D1kR3Actor, input: { eventId: string; interfaceId: string; sourceId: string; sourceFingerprint: string }): D1kR3Event {
  rejectInjection(input);
  assertHuman(actor, "PROVIDER");
  const record = inspectStructuralInterfaceIdentity(interfaces, actor, input.interfaceId);
  if (!input.sourceId.trim() || input.sourceId.trim().toLowerCase() === "latest" || input.sourceId.trim().toLowerCase() === "current") fail("PROVISION_SOURCE_UNPINNED");
  if (input.sourceId !== record.sourceId || input.sourceFingerprint !== record.sourceFingerprint) fail("FINGERPRINT_MISMATCH");
  return remember(store, baseDraft(record, actor, input.eventId, "PROVISION_RECORDED", "PROVIDED"));
}

export function recordInterfaceAcknowledgement(interfaces: D1kR1Store, store: D1kR3Store, actor: D1kR3Actor, input: { eventId: string; interfaceId: string }): D1kR3Event {
  rejectInjection(input);
  assertHuman(actor, "REVIEWER");
  const record = inspectStructuralInterfaceIdentity(interfaces, actor, input.interfaceId);
  const prior = eventsFor(store, record.interfaceId);
  if (!prior.some((row) => row.eventType === "REQUEST_RECORDED" || row.eventType === "PROVISION_RECORDED")) fail("ACKNOWLEDGEMENT_WITHOUT_SUBJECT");
  return remember(store, baseDraft(record, actor, input.eventId, "ACKNOWLEDGEMENT_RECORDED", "ACKNOWLEDGED"));
}

export function recordInterfaceResponse(interfaces: D1kR1Store, store: D1kR3Store, actor: D1kR3Actor, input: { eventId: string; interfaceId: string; responseKind: (typeof D1K_R3_RESPONSE_KINDS)[number]; evidenceId?: string | null; comment?: string | null; successorInterfaceId?: string | null }): D1kR3Event {
  rejectInjection(input);
  assertHuman(actor, "PROVIDER");
  const record = inspectStructuralInterfaceIdentity(interfaces, actor, input.interfaceId);
  if (!(D1K_R3_RESPONSE_KINDS as readonly string[]).includes(input.responseKind)) fail("RESPONSE_KIND_UNSUPPORTED");
  if (!eventsFor(store, record.interfaceId).some((row) => row.eventType === "REQUEST_RECORDED")) fail("RESPONSE_WITHOUT_REQUEST");
  const changesMeaning = input.responseKind === "SUPERSEDING_SOURCE_REFERENCE";
  if (changesMeaning && (!input.evidenceId?.trim() || !input.successorInterfaceId?.trim())) fail("RESPONSE_EVIDENCE_REQUIRED");
  if (input.successorInterfaceId) {
    const successor = inspectStructuralInterfaceIdentity(interfaces, actor, input.successorInterfaceId);
    if (successor.sourceFingerprint === record.sourceFingerprint) fail("SOURCE_REVISION_UNCHANGED");
  }
  const draft = baseDraft(record, actor, input.eventId, "RESPONSE_RECORDED", input.responseKind === "REJECTION" ? "REJECTED" : "RESPONSE_PENDING");
  draft.responseKind = input.responseKind;
  draft.evidence = input.evidenceId ?? null;
  draft.successorInterfaceId = input.successorInterfaceId ?? null;
  return remember(store, draft);
}

export function recordInterfaceSourceChange(interfaces: D1kR1Store, store: D1kR3Store, actor: D1kR3Actor, input: { eventId: string; predecessorInterfaceId: string; successor: D1kR1InterfaceInput }): { predecessor: D1kR1InterfaceRecord; successor: D1kR1InterfaceRecord; events: readonly D1kR3Event[] } {
  rejectInjection(input);
  assertHuman(actor, "PROVIDER");
  const before = inspectStructuralInterfaceIdentity(interfaces, actor, input.predecessorInterfaceId);
  const beforeSnapshot = JSON.stringify(before);
  const successor = supersedeStructuralInterfaceSource(interfaces, actor, { ...input.successor, predecessorInterfaceId: before.interfaceId });
  if (JSON.stringify(before) !== beforeSnapshot && before.sourceRevision !== JSON.parse(beforeSnapshot).sourceRevision) fail("SOURCE_MUTATION_REJECTED");
  const stale = remember(store, { ...baseDraft(before, actor, `${input.eventId}-stale`, "STALE_DEPENDENCY_RECORDED", "STALE_DEPENDENCY"), systemGenerated: true, actorRole: "DETERMINISTIC_SYSTEM", successorInterfaceId: successor.interfaceId });
  const changed = remember(store, { ...baseDraft(successor, actor, `${input.eventId}-changed`, "SOURCE_CHANGE_RECORDED", "CHANGED"), predecessorInterfaceId: before.interfaceId, systemGenerated: true, actorRole: "DETERMINISTIC_SYSTEM" });
  return { predecessor: before, successor, events: [stale, changed] };
}

export function recordConflictFromCompatibility(interfaces: D1kR1Store, store: D1kR3Store, actor: D1kR3Actor, input: { eventId: string; compatibility: D1kR2Result }): D1kR3Event {
  rejectInjection(input);
  if (!actor.actorId.trim() || blockedAuthority(actor.authority)) fail("UNAUTHORIZED");
  const record = inspectStructuralInterfaceIdentity(interfaces, actor, input.compatibility.interfaceId);
  if (input.compatibility.interfaceFingerprint !== record.fingerprint || input.compatibility.sourceFingerprint !== record.sourceFingerprint) fail("COMPATIBILITY_REEVALUATION_REQUIRED");
  if (input.compatibility.aggregateConclusion === "MATCHING") fail("CONFLICT_NOT_PRESENT");
  const draft = baseDraft(record, actor, input.eventId, "COMPATIBILITY_CONFLICT_RECORDED", "UNRESOLVED_MISMATCH");
  draft.actorRole = "DETERMINISTIC_SYSTEM";
  draft.systemGenerated = true;
  draft.conflictPresent = true;
  draft.compatibilityFingerprint = input.compatibility.fingerprint;
  draft.structuralFailure = false;
  return remember(store, draft);
}

export function recordAuthorityConflict(interfaces: D1kR1Store, store: D1kR3Store, actor: D1kR3Actor, input: { eventId: string; interfaceId: string; claimedAuthority: string }): D1kR3Event {
  rejectInjection(input);
  if (!actor.actorId.trim() || blockedAuthority(actor.authority)) fail("UNAUTHORIZED");
  const record = inspectStructuralInterfaceIdentity(interfaces, actor, input.interfaceId);
  if (!input.claimedAuthority.trim() || input.claimedAuthority === record.sourceAuthority) fail("CONFLICT_NOT_PRESENT");
  const draft = baseDraft(record, actor, input.eventId, "COMPATIBILITY_CONFLICT_RECORDED", "UNRESOLVED_MISMATCH");
  draft.actorRole = "DETERMINISTIC_SYSTEM";
  draft.systemGenerated = true;
  draft.conflictPresent = true;
  draft.evidence = input.claimedAuthority;
  return remember(store, draft);
}

export function recordHumanDisposition(interfaces: D1kR1Store, store: D1kR3Store, actor: D1kR3Actor, input: { eventId: string; interfaceId: string; evidenceId: string | null; dispositionStatus: "RECORDED" | "RESOLVED_BY_EVIDENCE" }): D1kR3Event {
  rejectInjection(input);
  assertHuman(actor, "STRUCTURAL_ENGINEER");
  const record = inspectStructuralInterfaceIdentity(interfaces, actor, input.interfaceId);
  const prior = eventsFor(store, record.interfaceId);
  if (!prior.some((row) => row.eventType === "COMPATIBILITY_CONFLICT_RECORDED")) fail("RESOLUTION_WITHOUT_CONFLICT");
  if (!input.evidenceId?.trim()) fail("RESOLUTION_EVIDENCE_REQUIRED");
  if (input.dispositionStatus !== "RECORDED" && input.dispositionStatus !== "RESOLVED_BY_EVIDENCE") fail("DIRECT_STATE_INJECTION_REJECTED");
  const draft = baseDraft(record, actor, input.eventId, "HUMAN_DISPOSITION_RECORDED", "UNDER_REVIEW");
  draft.dispositionStatus = input.dispositionStatus;
  draft.evidence = input.evidenceId;
  draft.conflictPresent = input.dispositionStatus !== "RESOLVED_BY_EVIDENCE";
  const conflict = [...prior].reverse().find((row) => row.eventType === "COMPATIBILITY_CONFLICT_RECORDED");
  draft.compatibilityFingerprint = conflict?.compatibilityFingerprint ?? null;
  return remember(store, draft);
}

export function deriveInterfaceGovernanceState(interfaces: D1kR1Store, store: D1kR3Store, actor: D1kR1Actor, interfaceId: string): D1kR3GovernanceState {
  if (!actor.actorId.trim() || blockedAuthority(actor.authority)) fail("UNAUTHORIZED");
  const record = inspectStructuralInterfaceIdentity(interfaces, actor, interfaceId);
  const events = eventsFor(store, interfaceId);
  const state: D1kR3GovernanceState = {
    interfaceId: record.interfaceId,
    sourceId: record.sourceId,
    sourceRevision: record.sourceRevision,
    sourceFingerprint: record.sourceFingerprint,
    sourceAuthority: record.sourceAuthority,
    handoffState: null,
    conflictPresent: false,
    dispositionStatus: "NONE",
    stale: false,
    responsePending: false,
    reevaluationRequired: false,
    compatibilityFingerprint: null,
    structuralFailure: false,
    engineeringApproval: false,
    designApproved: false,
    certified: false,
    eventFingerprints: events.map((row) => row.fingerprint),
  };
  for (const event of events) {
    if (event.sourceFingerprint !== record.sourceFingerprint && event.eventType !== "SOURCE_CHANGE_RECORDED") {
      state.stale = true;
      state.reevaluationRequired = true;
      state.handoffState = "STALE_DEPENDENCY";
      state.compatibilityFingerprint = null;
    }
    state.handoffState = event.handoffState;
    if (event.eventType === "SOURCE_CHANGE_RECORDED") {
      state.reevaluationRequired = true;
      state.compatibilityFingerprint = null;
    }
    if (event.eventType === "STALE_DEPENDENCY_RECORDED") {
      state.stale = true;
      state.reevaluationRequired = true;
      state.compatibilityFingerprint = null;
    }
    if (event.eventType === "RESPONSE_RECORDED") state.responsePending = event.responseKind !== "REJECTION";
    if (event.eventType === "COMPATIBILITY_CONFLICT_RECORDED") {
      state.conflictPresent = true;
      state.compatibilityFingerprint = event.compatibilityFingerprint;
    }
    if (event.eventType === "HUMAN_DISPOSITION_RECORDED") {
      state.dispositionStatus = event.dispositionStatus;
      state.conflictPresent = event.dispositionStatus !== "RESOLVED_BY_EVIDENCE";
    }
    state.engineeringApproval = false;
    state.designApproved = false;
    state.certified = false;
    state.structuralFailure = false;
  }
  return state;
}
