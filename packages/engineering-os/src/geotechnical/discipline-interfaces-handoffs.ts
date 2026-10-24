/**
 * EOS-D3-R8 discipline interfaces and handoffs.
 * One bounded runtime. Transports exact D3 revisions to Structural and Civil
 * and records future-discipline placeholders. Does not reason across disciplines.
 */
import {
  ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY as ARCH_ADMIN_EQUALS,
  AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY as ARCH_AI_EQUALS,
  D1_TO_D3_REFERENCE_SUBJECTS,
  D2_D4_D8_FUTURE_INTERFACE_TOPICS,
  D2_REOPENED as ARCH_D2_REOPENED,
  D2_TO_D3_REFERENCE_SUBJECTS,
  D3_0_CANONICAL_CURRENTNESS_REUSED,
  D3_0_CANONICAL_FINGERPRINT_REUSED,
  D3_0_SECOND_FINGERPRINT_ALGORITHM_CREATED,
  D3_CURRENTNESS_STATES,
  D3_D1_AUTHORITY_TRANSFER_ALLOWED as ARCH_D1_TRANSFER,
  D3_D2_AUTHORITY_TRANSFER_ALLOWED as ARCH_D2_TRANSFER,
  D3_D2_INTERFACE_REUSES_CIVIL_CONTRACT,
  D3_EQUALS_D1_STRUCTURAL_AUTHORITY as ARCH_EQUALS_D1,
  D3_EQUALS_D2_CIVIL_AUTHORITY as ARCH_EQUALS_D2,
  D3_EVIDENCE_PROVENANCE_REQUIRED as ARCH_PROVENANCE_REQUIRED,
  D3_IMPLEMENTATION_PHASES,
  D3_TO_D1_HANDOFF_SUBJECTS,
  D3_TO_D2_HANDOFF_SUBJECTS,
  PARALLEL_D3_CURRENTNESS_ENGINE_CREATED as ARCH_PARALLEL_CURRENTNESS,
} from "@rtb/types";
import { D2_R8_HANDOFF_STATUSES } from "../civil/discipline-interfaces-handoffs";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D1K_R3_ACKNOWLEDGED_EQUALS_ENGINEERING_APPROVED,
  D1K_R3_AI_CAN_APPROVE_INTERFACE,
  D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED,
} from "../structural-systems/interface-handoff-governance";
import type { D1kR1Store } from "../structural-systems/interface-identity-foundation";
import type { D2R1Store } from "../civil/identity-foundation";
import {
  D3_CONTEXT_AUTHORITY,
  D3_DISCIPLINE,
  type D3R1Actor,
} from "./identity-foundation";
import {
  D3_FIELD_LAB_TEST_RUNTIME_READY as R4_TEST_READY,
  D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY as R6_CONTEXT_READY,
  D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY,
  D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY as R5_PARAMETER_READY,
  D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY as R7_CHANGE_READY,
  D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY as R2_EVIDENCE_READY,
  D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY as R3_READY,
  type D3R7Store,
} from "./requirements-assumptions-change";

export const D3_R8_STATUS = "DISCIPLINE_INTERFACES_AND_HANDOFFS_IMPLEMENTED" as const;
export const D3_R8_MATURITY = "DISCIPLINE_INTERFACES_AND_HANDOFFS_IMPLEMENTED" as const;
export const D3_R8_MATURITY_STATE = D3_R8_MATURITY;
export const D3_R8_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D3_R8_DISCIPLINE_INTERFACES_AND_HANDOFFS_CLOSEOUT.md" as const;
export const D3_REUSES_CANONICAL_INTERFACE_GOVERNANCE = true as const;
export const D3_REUSES_CANONICAL_HANDOFF_GOVERNANCE = true as const;
export const PARALLEL_D3_INTERFACE_FRAMEWORK_CREATED = false as const;
export const PARALLEL_D3_HANDOFF_FRAMEWORK_CREATED = false as const;
export const D3_RUNTIME_STARTED = true as const;
export const D3_RUNTIME_COUNT = 8 as const;
export const D3_DISCIPLINE_INTERFACE_RUNTIME_IMPLEMENTED = true as const;
export const D3_DISCIPLINE_INTERFACE_RUNTIME_COUNT = 1 as const;
export const D3_DISCIPLINE_INTERFACE_RUNTIME_READY = true as const;
export const D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY = R2_EVIDENCE_READY;
export const D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY = R3_READY;
export const D3_FIELD_LAB_TEST_RUNTIME_READY = R4_TEST_READY;
export const D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY = R5_PARAMETER_READY;
export const D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY = R6_CONTEXT_READY;
export const D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = R7_CHANGE_READY;
export const EXACT_D3_INTERFACE_SOURCE_REVISION_REQUIRED = true as const;
export const FLOATING_D3_INTERFACE_SOURCE_REFERENCE_ALLOWED = false as const;
export const D3_INTERFACE_SOURCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D3_D1_INTERFACE_IMPLEMENTED = true as const;
export const D3_D1_HANDOFF_SUPPORTED = true as const;
export const D3_D1_AUTHORITY_TRANSFER_ALLOWED = ARCH_D1_TRANSFER;
export const D1_TO_D3_COUNTERPART_REFERENCE_SUPPORTED = true as const;
export const D1_COUNTERPART_REFERENCE_EQUALS_D3_VALIDATION = false as const;
export const D3_D2_INTERFACE_IMPLEMENTED = true as const;
export const D3_D2_HANDOFF_SUPPORTED = true as const;
export const D3_D2_AUTHORITY_TRANSFER_ALLOWED = ARCH_D2_TRANSFER;
export const D3_D2_INTERFACE_CONTRACT_REUSES_CIVIL = D3_D2_INTERFACE_REUSES_CIVIL_CONTRACT;
export const D2_TO_D3_COUNTERPART_REFERENCE_SUPPORTED = true as const;
export const D2_COUNTERPART_REFERENCE_EQUALS_D3_VALIDATION = false as const;
export const D3_D4_INTERFACE_CONTRACT_DEFINED = true as const;
export const D3_D5_INTERFACE_CONTRACT_DEFINED = true as const;
export const D3_D6_INTERFACE_CONTRACT_DEFINED = true as const;
export const D3_D7_INTERFACE_CONTRACT_DEFINED = true as const;
export const D3_D8_INTERFACE_CONTRACT_DEFINED = true as const;
export const MISSING_COUNTERPART_AUTO_FABRICATED = false as const;
export const MISSING_COUNTERPART_EQUALS_INTERFACE_COMPLETE = false as const;
export const D3_HANDOFF_CURRENTNESS_EXPLICIT = true as const;
export const D3_HANDOFF_LIMITATIONS_EXPLICIT = true as const;
export const STALE_D3_HANDOFF_EXPOSED_AS_CURRENT = false as const;
export const INCOMPLETE_D3_HANDOFF_EXPOSED_AS_COMPLETE = false as const;
export const D3_HANDOFF_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D3_COUNTERPART_REFERENCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D3_HANDOFF_TRANSFERS_GEOTECHNICAL_AUTHORITY = false as const;
export const D3_EQUALS_D1_STRUCTURAL_AUTHORITY = ARCH_EQUALS_D1;
export const D3_EQUALS_D2_CIVIL_AUTHORITY = ARCH_EQUALS_D2;
export const AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY = ARCH_AI_EQUALS;
export const ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY = ARCH_ADMIN_EQUALS;
export const AI_CAN_APPROVE_D3_INTERFACE = D1K_R3_AI_CAN_APPROVE_INTERFACE;
export const D3_VALIDATES_D1_STRUCTURAL_ENGINEERING = false as const;
export const D3_VALIDATES_D2_CIVIL_ENGINEERING = false as const;
export const D1_COUNTERPART_VALIDATES_D3_AUTOMATICALLY = false as const;
export const D2_COUNTERPART_VALIDATES_D3_AUTOMATICALLY = false as const;
export const D3_INTERFACE_AUTO_MUTATES_D1_OBJECT = false as const;
export const D3_INTERFACE_AUTO_MUTATES_D2_OBJECT = false as const;
export const D1_HANDOFF_AUTO_MUTATES_D3_OBJECT = false as const;
export const D2_HANDOFF_AUTO_MUTATES_D3_OBJECT = false as const;
export const D3_INTERFACE_AUTO_RECALCULATES_PARAMETER = false as const;
export const D3_INTERFACE_AUTO_REDESIGNS_RECOMMENDATION = false as const;
export const D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D3_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT = 0 as const;
export const D3_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D3_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT = 0 as const;
export const D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D3_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 0 as const;
export const D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 0 as const;
export const D3_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;
export const D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D3_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D3_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D3_D9_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const HANDOFF_COMPLETE_EQUALS_ENGINEERING_VALIDATED = false as const;
export const HANDOFF_ACCEPTED_EQUALS_ENGINEERING_APPROVED = D1K_R3_ACKNOWLEDGED_EQUALS_ENGINEERING_APPROVED;
export const CANONICAL_CURRENTNESS_REUSED = D3_0_CANONICAL_CURRENTNESS_REUSED;
export const PARALLEL_D3_CURRENTNESS_ENGINE_CREATED = ARCH_PARALLEL_CURRENTNESS;
export const CANONICAL_FINGERPRINT_REUSED = D3_0_CANONICAL_FINGERPRINT_REUSED;
export const SECOND_FINGERPRINT_ALGORITHM_CREATED = D3_0_SECOND_FINGERPRINT_ALGORITHM_CREATED;
export const D3_R8_PROVENANCE_REQUIRED = ARCH_PROVENANCE_REQUIRED;
export const D3_R8_PROVENANCE_PRESERVED = true as const;
export const SILENT_D3_R8_MUTATION_ALLOWED = false as const;
export const D3_R8_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D3_R8_SCOPE_ENFORCED = true as const;
export const D3_R8_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D3_R8_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D3_R8_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D3_R8_HANDOFF_STATUSES = D2_R8_HANDOFF_STATUSES;
export const D3_R8_DIRECTIONS = ["D3_TO_COUNTERPART", "COUNTERPART_TO_D3"] as const;
export const D3_R8_FUTURE_DISCIPLINES = ["mechanical", "piping", "process", "electrical", "instrumentation_control"] as const;
export const D4_RUNTIME_STARTED = false as const;
export const D5_RUNTIME_STARTED = false as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_COUNT = 0 as const;
export const D2_REOPENED = ARCH_D2_REOPENED;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;
export const UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_R9_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D4_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_D3_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_D3_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_D3_CERTIFICATION_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D3_R9_CANONICAL_PHASE = D3_IMPLEMENTATION_PHASES[8];
export const D3_R9_PHASE_TYPE = "REVIEW_AND_VALIDATION_GOVERNANCE" as const;
export const D3_R9_CANONICAL_SCOPE = "Implement governed Geotechnical review requests, findings, reviewer authority and validation state using exact D3 revisions. Preserve the separation between review, validation, conformance, approval and certification. AI/admin must not automatically validate Geotechnical engineering. Do not start D4-D9." as const;
export const D3_R9_STARTED = false as const;
export const D3_R8_READY_FOR_NEXT_PHASE = true as const;
export const D3_R8_NEXT_PHASE = D3_R9_CANONICAL_PHASE;
export const D3_R8_NEXT_PHASE_TYPE = D3_R9_PHASE_TYPE;
export const D3_R8_CANONICAL_NEXT_PHASE = D3_R9_CANONICAL_PHASE;
export const D3_R8_CANONICAL_NEXT_PHASE_SCOPE = D3_R9_CANONICAL_SCOPE;
export const D3_R8_BLOCKER = "NONE" as const;
export const D3_R8_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["inferred", "unknown", "auto", "default", "nearby", "similar"]);
const FUTURE = new Set<string>(D3_R8_FUTURE_DISCIPLINES);

type Prohibited = {
  transferAuthority?: boolean;
  reasonAcrossDisciplines?: boolean;
  detectConflict?: boolean;
  resolveConflict?: boolean;
  validateCounterpart?: boolean;
  fabricateCounterpart?: boolean;
  approve?: boolean;
  certify?: boolean;
  validate?: boolean;
  redesign?: boolean;
  recalculate?: boolean;
  repoint?: boolean;
  mutateD1?: boolean;
  mutateD2?: boolean;
  mutateD3?: boolean;
  d4Start?: boolean;
  d9Reasoning?: boolean;
};

export type D3R8HandoffInput = Prohibited & {
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
  evidenceReferenceIds: readonly string[];
  requirementContextIds?: readonly string[];
  assumptionContextIds?: readonly string[];
  decisionContextIds?: readonly string[];
  changeContextIds?: readonly string[];
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

export type D3R8CounterpartPin = {
  interfaceId: string;
  sourceRevision: string;
  fingerprint: string;
};

export type D3R8HandoffRecord = {
  handoffId: string;
  contextId: string;
  objectId: string;
  sourceObjectId: string;
  sourceRevision: string;
  sourceObjectFingerprint: string;
  counterpartDiscipline: "structural" | "civil" | (typeof D3_R8_FUTURE_DISCIPLINES)[number];
  direction: (typeof D3_R8_DIRECTIONS)[number];
  interfaceTopic: string;
  counterpart: D3R8CounterpartPin | null;
  evidenceReferenceIds: readonly string[];
  requirementContextIds: readonly string[];
  assumptionContextIds: readonly string[];
  decisionContextIds: readonly string[];
  changeContextIds: readonly string[];
  limitations: string;
  ownership: "GEOTECHNICAL";
  sourceAuthority: typeof D3_CONTEXT_AUTHORITY;
  receivingAuthority: string;
  handoffStatus: (typeof D3_R8_HANDOFF_STATUSES)[number];
  receivingAcknowledged: boolean;
  authorityTransferred: false;
  engineeringValidated: false;
  engineeringApproved: false;
  engineeringCertified: false;
  citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number];
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

export type D3R8History = {
  historyId: string;
  handoffId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D3R8Store = {
  r7: D3R7Store;
  d1: D1kR1Store | null;
  d2: D2R1Store | null;
  now: () => string;
  handoffs: D3R8HandoffRecord[];
  history: D3R8History[];
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

function isCurrentness(value: string): value is (typeof D3_CURRENTNESS_STATES)[number] {
  return (D3_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function assertActor(actor: D3R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_GEOTECHNICAL_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_GEOTECHNICAL_AUTHORITY");
  if (actor.authority === "GEOTECHNICAL_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_GEOTECHNICAL_ENGINEERING_AUTHORITY");
  if (actor.authority !== D3_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertProhibited(input: Prohibited): void {
  if (input.transferAuthority === true) fail("AUTHORITY_TRANSFER_REJECTED");
  if (input.reasonAcrossDisciplines === true || input.d9Reasoning === true) fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R8");
  if (input.detectConflict === true) fail("CONFLICT_DETECTION_NOT_IN_R8");
  if (input.resolveConflict === true) fail("CONFLICT_RESOLUTION_NOT_IN_R8");
  if (input.validateCounterpart === true || input.validate === true) fail("COUNTERPART_VALIDATION_NOT_IN_R8");
  if (input.fabricateCounterpart === true) fail("COUNTERPART_FABRICATION_REJECTED");
  if (input.approve === true) fail("APPROVAL_NOT_IN_R8");
  if (input.certify === true) fail("CERTIFICATION_NOT_IN_R8");
  if (input.redesign === true) fail("REDESIGN_NOT_IN_R8");
  if (input.recalculate === true) fail("RECALCULATION_NOT_IN_R8");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.mutateD1 === true) fail("D1_MUTATION_REJECTED");
  if (input.mutateD2 === true) fail("D2_MUTATION_REJECTED");
  if (input.mutateD3 === true) fail("D3_MUTATION_REJECTED");
  if (input.d4Start === true) fail("FUTURE_DISCIPLINE_RUNTIME_REJECTED");
}

function requireContext(store: D3R8Store, actor: D3R1Actor, contextId: string, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]) {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r7.r6.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === id);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("CROSS_TENANT_OPERATION");
  if (context.discipline !== D3_DISCIPLINE) fail("DISCIPLINE_NOT_GEOTECHNICAL");
  if (citedCurrentness === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  return context;
}

function requireObject(store: D3R8Store, actor: D3R1Actor, contextId: string, objectId: string, objectType: string | null, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number], code: string) {
  const id = explicit(objectId, code);
  const object = store.r7.r6.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === id);
  if (!object || object.contextId !== contextId || object.tenantId !== actor.tenantId) fail(code);
  if (objectType && object.objectType !== objectType) fail(code);
  if (citedCurrentness === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function requireEvidence(store: D3R8Store, actor: D3R1Actor, contextId: string, ids: readonly string[], citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]): string[] {
  if (!ids || ids.length === 0) fail("HANDOFF_WITHOUT_EVIDENCE");
  const resolved: string[] = [];
  for (const raw of ids) {
    const id = explicit(raw, "R2_EVIDENCE_REQUIRED");
    if (resolved.includes(id)) fail("DUPLICATE_EVIDENCE_LINK");
    const row = store.r7.r6.r5.r4.r3.r2.evidence.find((item) => item.evidenceReferenceId === id);
    if (!row || row.tenantId !== actor.tenantId || row.contextId !== contextId) fail("R2_EVIDENCE_NOT_FOUND");
    if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail("R2_EVIDENCE_NOT_CURRENT");
    resolved.push(row.evidenceReferenceId);
  }
  return resolved;
}

function citeGovernance<T extends { contextId: string; recordStatus: string; tenantId: string }>(rows: readonly T[], ids: readonly string[] | undefined, pick: (row: T) => string, code: string, contextId: string, actor: D3R1Actor, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]): string[] {
  const unique = [...new Set((ids ?? []).map((id) => explicit(id, code)))];
  for (const id of unique) {
    const row = rows.find((item) => pick(item) === id);
    if (!row || row.contextId !== contextId || row.tenantId !== actor.tenantId) fail(code);
    if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail("R7_RECORD_NOT_CURRENT");
  }
  return unique;
}

function topicFor(discipline: string, direction: string, topic: string): string {
  const value = explicit(topic, "INTERFACE_TOPIC_REQUIRED");
  const allowed = discipline === "structural"
    ? direction === "D3_TO_COUNTERPART" ? D3_TO_D1_HANDOFF_SUBJECTS : D1_TO_D3_REFERENCE_SUBJECTS
    : discipline === "civil"
      ? direction === "D3_TO_COUNTERPART" ? D3_TO_D2_HANDOFF_SUBJECTS : D2_TO_D3_REFERENCE_SUBJECTS
      : D2_D4_D8_FUTURE_INTERFACE_TOPICS;
  if (!(allowed as readonly string[]).includes(value)) fail("INTERFACE_TOPIC_INVALID");
  return value;
}

function pinCounterpart(store: D3R8Store, actor: D3R1Actor, discipline: string, interfaceId: string | null, revision: string | null, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]): D3R8CounterpartPin | null {
  if (FUTURE.has(discipline)) {
    if (interfaceId != null || revision != null) fail("COUNTERPART_FABRICATION_REJECTED");
    return null;
  }
  if (interfaceId == null) {
    if (revision != null) fail("COUNTERPART_REVISION_WITHOUT_REFERENCE");
    return null;
  }
  const id = explicit(interfaceId, "COUNTERPART_REFERENCE_REQUIRED");
  const sourceRevision = explicit(revision ?? "", "COUNTERPART_REVISION_REQUIRED");
  if (discipline === "structural") {
    const row = store.d1?.records.find((item) => item.interfaceId === id);
    if (!row || row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId) fail("COUNTERPART_NOT_FOUND");
    const sides = [row.sourceDiscipline, row.targetDiscipline];
    if (!sides.includes("structural") || !sides.includes("geotechnical")) fail("COUNTERPART_NOT_D3_STRUCTURAL");
    if (row.sourceRevision !== sourceRevision) fail("COUNTERPART_REVISION_MISMATCH");
    if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail("COUNTERPART_NOT_CURRENT");
    return { interfaceId: row.interfaceId, sourceRevision: row.sourceRevision, fingerprint: row.fingerprint };
  }
  const row = store.d2?.objects.find((item) => item.objectId === id);
  if (!row || row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId) fail("COUNTERPART_NOT_FOUND");
  if (row.provenanceRef !== sourceRevision) fail("COUNTERPART_REVISION_MISMATCH");
  if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail("COUNTERPART_NOT_CURRENT");
  return { interfaceId: row.objectId, sourceRevision: row.provenanceRef, fingerprint: row.fingerprint };
}

export function createD3R8Store(r7: D3R7Store, d1: D1kR1Store | null = null, d2: D2R1Store | null = null, now: () => string = () => r7.now()): D3R8Store {
  return { r7, d1, d2, now, handoffs: [], history: [] };
}

export function recordGeotechnicalInterfaceHandoff(store: D3R8Store, actor: D3R1Actor, input: D3R8HandoffInput): D3R8HandoffRecord {
  if (input.approve === true && (blockedParty(actor.actorId) || blockedParty(actor.authority) || AI_CAN_APPROVE_D3_INTERFACE === false && blockedParty(actor.actorId))) fail("AI_CANNOT_APPROVE_INTERFACE");
  assertActor(actor);
  assertProhibited(input);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  const citedCurrentness = input.citedCurrentness.trim();
  if (!isCurrentness(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const interfaceObject = requireObject(store, actor, context.contextId, input.objectId, "GEOTECHNICAL_INTERFACE", citedCurrentness, "INTERFACE_OBJECT_REQUIRED");
  const sourceObject = requireObject(store, actor, context.contextId, input.sourceObjectId, null, citedCurrentness, "SOURCE_OBJECT_REQUIRED");
  const sourceRevision = explicit(input.sourceRevision, "SOURCE_REVISION_REQUIRED");
  if (sourceRevision !== sourceObject.provenanceRef) fail("SOURCE_REVISION_MISMATCH");
  const discipline = explicit(input.counterpartDiscipline, "COUNTERPART_DISCIPLINE_REQUIRED");
  if (discipline !== "structural" && discipline !== "civil" && !FUTURE.has(discipline)) fail("COUNTERPART_DISCIPLINE_INVALID");
  const direction = explicit(input.direction, "DIRECTION_REQUIRED");
  if (!(D3_R8_DIRECTIONS as readonly string[]).includes(direction)) fail("DIRECTION_INVALID");
  const interfaceTopic = topicFor(discipline, direction, input.interfaceTopic);
  const counterpart = pinCounterpart(store, actor, discipline, input.counterpartInterfaceId, input.counterpartSourceRevision, citedCurrentness);
  const evidenceReferenceIds = requireEvidence(store, actor, context.contextId, input.evidenceReferenceIds, citedCurrentness);
  const requirementContextIds = citeGovernance(store.r7.requirements, input.requirementContextIds, (row) => row.requirementContextId, "REQUIREMENT_REFERENCE_REQUIRED", context.contextId, actor, citedCurrentness);
  const assumptionContextIds = citeGovernance(store.r7.assumptions, input.assumptionContextIds, (row) => row.assumptionContextId, "ASSUMPTION_REFERENCE_REQUIRED", context.contextId, actor, citedCurrentness);
  const decisionContextIds = citeGovernance(store.r7.decisions, input.decisionContextIds, (row) => row.decisionContextId, "DECISION_REFERENCE_REQUIRED", context.contextId, actor, citedCurrentness);
  const changeContextIds = citeGovernance(store.r7.changes, input.changeContextIds, (row) => row.changeContextId, "CHANGE_REFERENCE_REQUIRED", context.contextId, actor, citedCurrentness);
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const handoffStatus = explicit(input.handoffStatus, "HANDOFF_STATUS_REQUIRED");
  if (!(D3_R8_HANDOFF_STATUSES as readonly string[]).includes(handoffStatus)) fail("HANDOFF_STATUS_INVALID");
  if ((FUTURE.has(discipline) || !counterpart) && handoffStatus === "COMPLETE") fail("INCOMPLETE_COUNTERPART_NOT_COMPLETE");
  if (handoffStatus === "COMPLETE" && citedCurrentness !== "CURRENT") fail("CURRENTNESS_STATUS_MISMATCH");
  if ((handoffStatus === "AWAITING_COUNTERPART" || handoffStatus === "NOT_YET_AVAILABLE") && counterpart) fail("COUNTERPART_NOT_AWAITING");
  if (handoffStatus === "STALE" && citedCurrentness !== "STALE") fail("CURRENTNESS_STATUS_MISMATCH");
  if (handoffStatus === "REASSESSMENT_REQUIRED" && citedCurrentness !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
  if (citedCurrentness === "CURRENT" && (handoffStatus === "STALE" || handoffStatus === "REASSESSMENT_REQUIRED")) fail("CURRENTNESS_STATUS_MISMATCH");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const handoffId = explicit(input.handoffId, "HANDOFF_ID_REQUIRED");
  const predecessor = input.predecessorHandoffId ? store.handoffs.find((row) => row.handoffId === input.predecessorHandoffId) : null;
  if (input.predecessorHandoffId && (!predecessor || predecessor.tenantId !== actor.tenantId)) fail("HANDOFF_NOT_FOUND");
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
    evidenceReferenceIds,
    requirementContextIds,
    assumptionContextIds,
    decisionContextIds,
    changeContextIds,
    limitations,
    handoffStatus,
    receivingAcknowledged,
    citedCurrentness,
    provenanceRef,
    authority: D3_CONTEXT_AUTHORITY,
    predecessorHandoffId: predecessor?.handoffId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.handoffs.find((row) => row.handoffId === handoffId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("HANDOFF_ALREADY_RECORDED");
  if (predecessor && predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  const signature = `${interfaceObject.objectId}|${sourceObject.objectId}|${sourceRevision}|${discipline}|${interfaceTopic}|${counterpart?.interfaceId ?? ""}|${counterpart?.sourceRevision ?? ""}`;
  if (store.handoffs.some((row) => row.recordStatus === "CURRENT" && row.handoffId !== predecessor?.handoffId && row.contextId === context.contextId && `${row.objectId}|${row.sourceObjectId}|${row.sourceRevision}|${row.counterpartDiscipline}|${row.interfaceTopic}|${row.counterpart?.interfaceId ?? ""}|${row.counterpart?.sourceRevision ?? ""}` === signature)) fail("DUPLICATE_HANDOFF_REJECTED");
  const beforeObjects = store.r7.r6.r5.r4.r3.r2.r1.objects.map((row) => row.objectId + row.fingerprint).join("|");
  const beforeD1 = store.d1?.records.map((row) => row.interfaceId + row.fingerprint + row.recordStatus).join("|") ?? "";
  const beforeD2 = store.d2?.objects.map((row) => row.objectId + row.fingerprint + row.recordStatus).join("|") ?? "";
  const record: D3R8HandoffRecord = Object.freeze({
    handoffId,
    contextId: context.contextId,
    objectId: interfaceObject.objectId,
    sourceObjectId: sourceObject.objectId,
    sourceRevision,
    sourceObjectFingerprint: sourceObject.fingerprint,
    counterpartDiscipline: discipline as D3R8HandoffRecord["counterpartDiscipline"],
    direction: direction as D3R8HandoffRecord["direction"],
    interfaceTopic,
    counterpart,
    evidenceReferenceIds,
    requirementContextIds,
    assumptionContextIds,
    decisionContextIds,
    changeContextIds,
    limitations,
    ownership: "GEOTECHNICAL",
    sourceAuthority: D3_CONTEXT_AUTHORITY,
    receivingAuthority: discipline,
    handoffStatus: handoffStatus as D3R8HandoffRecord["handoffStatus"],
    receivingAcknowledged,
    authorityTransferred: false,
    engineeringValidated: false,
    engineeringApproved: false,
    engineeringCertified: false,
    citedCurrentness,
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
  if (store.r7.r6.r5.r4.r3.r2.r1.objects.map((row) => row.objectId + row.fingerprint).join("|") !== beforeObjects) fail("D3_MUTATION_REJECTED");
  if ((store.d1?.records.map((row) => row.interfaceId + row.fingerprint + row.recordStatus).join("|") ?? "") !== beforeD1) fail("D1_MUTATION_REJECTED");
  if ((store.d2?.objects.map((row) => row.objectId + row.fingerprint + row.recordStatus).join("|") ?? "") !== beforeD2) fail("D2_MUTATION_REJECTED");
  return record;
}

export function mutateGeotechnicalInterface(): never {
  return fail("INTERFACE_MUTATION_REJECTED");
}

export function repointGeotechnicalHandoff(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function reasonAcrossGeotechnicalDisciplines(): never {
  return fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R8");
}

export function detectGeotechnicalInterfaceConflict(): never {
  return fail("CONFLICT_DETECTION_NOT_IN_R8");
}

export function resolveGeotechnicalInterfaceConflict(): never {
  return fail("CONFLICT_RESOLUTION_NOT_IN_R8");
}

export function validateGeotechnicalCounterpart(): never {
  return fail("COUNTERPART_VALIDATION_NOT_IN_R8");
}
