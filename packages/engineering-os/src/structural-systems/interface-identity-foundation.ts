/**
 * EOS-D1K-R1 structural interface identity and exact source-reference foundation.
 * In-memory records only. No compatibility assessment, handoff, or other-discipline runtime.
 */

import type { EosCrossDisciplineRelation, EosDisciplineId, EosEvidenceSourceKind } from "@rtb/types";
import {
  D1K_SOURCE_CLASSES,
  EOS_CROSS_DISCIPLINE_RELATIONS,
  EOS_DISCIPLINE_IDS,
  EOS_EVIDENCE_SOURCE_KINDS,
  STRUCTURAL_OBJECT_KINDS,
} from "@rtb/types";
import type { StructuralObjectKind } from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";

export const D1K_R1_PHASE = "EOS-D1K-R1-INTERFACE-IDENTITY-SOURCE-REFERENCE-FOUNDATION" as const;
export const D1K_R1_PHASE_TYPE = "STRUCTURAL_INTERFACE_IDENTITY_SOURCE_REFERENCE_FOUNDATION" as const;
export const D1K_R1_STATUS = "REFERENCE_FOUNDATION_DEFINED" as const;
export const D1K_R1_MATURITY_STATE = "STRUCTURAL_INTERFACE_IDENTITY_SOURCE_REFERENCE_FOUNDATION_IMPLEMENTED" as const;
export const D1K_R1_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D1K_R1_INTERFACE_IDENTITY_SOURCE_REFERENCE_FOUNDATION_CLOSEOUT.md" as const;
export const D1K_R1_PARENT_ARCHITECTURE_PATH =
  "docs/architecture/engineering-os/EOS_D1K_0_CROSS_DISCIPLINE_STRUCTURAL_INTERFACES_ARCHITECTURE.md" as const;
export const D1K_R1_PARENT_ROADMAP_PATH = "docs/architecture/engineering-os/EOS_POST_D1J_CANONICAL_ROADMAP.md" as const;
export const D1K_R1_CANONICAL_SCOPE =
  "Record a governed structural interface identity that extends the D0 contract, pins a D1A or D1F structural target, an allowlisted counterparty discipline, a governed relation, and an exact source reference with revision, authority, evidence, and fingerprint. Do not assess compatibility, execute a handoff, start D2 through D8, start D9, convert units, infer coordinates or axes, or approve engineering." as const;

export const D1K_R1_D0_INTERFACE_CONTRACT_REUSED = true as const;
export const D1K_R1_D1A_STRUCTURAL_TARGET_IDENTITY_REUSED = true as const;
export const D1K_R1_D1F_IDENTITY_REUSED = true as const;
export const D1K_R1_D1F_TARGET_KINDS = ["STRUCTURAL_SYSTEM", "MEMBER", "SUPPORT", "FOUNDATION_INTERFACE"] as const;
export const D1K_R1_RELATION_ALLOWLIST_REUSED = true as const;
export const D1K_R1_DISCIPLINE_ALLOWLIST_REUSED = true as const;
export const D1K_R1_PARALLEL_INTERFACE_IDENTITY_CREATED = false as const;
export const D1K_R1_PARALLEL_STRUCTURAL_ASSET_IDENTITY_CREATED = false as const;
export const D1K_R1_FREEFORM_DISCIPLINE_IDENTITY_ALLOWED = false as const;
export const D1K_R1_INTERFACE_IDENTITY_RUNTIME_IMPLEMENTED = true as const;
export const D1K_R1_INTERFACE_IDENTITY_RUNTIME_COUNT = 1 as const;
export const D1K_R1_EXACT_SOURCE_REFERENCE_RUNTIME_IMPLEMENTED = true as const;
export const D1K_R1_EXACT_SOURCE_REFERENCE_RUNTIME_COUNT = 1 as const;
export const D1K_R1_PROJECT_WORKSPACE_SCOPE_ENFORCED = true as const;
export const D1K_R1_STRUCTURAL_TARGET_BINDING_IMPLEMENTED = true as const;
export const D1K_R1_COUNTERPARTY_DISCIPLINE_ALLOWLIST_ENFORCED = true as const;
export const D1K_R1_GOVERNED_RELATION_ENFORCED = true as const;
export const D1K_R1_SOURCE_REVISION_VERSION_PINNED = true as const;
export const D1K_R1_FLOATING_LATEST_SOURCE_ALLOWED = false as const;
export const D1K_R1_SOURCE_AUTHORITY_PRESERVED = true as const;
export const D1K_R1_EVIDENCE_REFERENCE_PRESERVED = true as const;
export const D1K_R1_PROVENANCE_PRESERVED = true as const;
export const D1K_R1_UPSTREAM_SOURCE_MUTATION_AUTHORIZED = false as const;
export const D1K_R1_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D1K_R1_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D1K_R1_DETERMINISTIC_INTERFACE_FINGERPRINT_IMPLEMENTED = true as const;
export const D1K_R1_SOURCE_REVISION_CHANGE_AFFECTS_FINGERPRINT = true as const;
export const D1K_R1_INTERFACE_HISTORY_PRESERVED = true as const;
export const D1K_R1_APPEND_ONLY_HISTORY = true as const;
export const D1K_R1_SILENT_SOURCE_REPOINTING_ALLOWED = false as const;
export const D1K_R1_SEMANTIC_COMPATIBILITY_RUNTIME_COUNT = 0 as const;
export const D1K_R1_INTERFACE_COMPATIBILITY_RUNTIME_COUNT = 0 as const;
export const D1K_R1_UNIT_COMPATIBILITY_RUNTIME_COUNT = 0 as const;
export const D1K_R1_UNIT_CONVERSION_RUNTIME_COUNT = 0 as const;
export const D1K_R1_COORDINATE_COMPATIBILITY_RUNTIME_COUNT = 0 as const;
export const D1K_R1_COORDINATE_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1K_R1_AXIS_SIGN_COMPATIBILITY_RUNTIME_COUNT = 0 as const;
export const D1K_R1_AXIS_SIGN_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1K_R1_HANDOFF_RUNTIME_COUNT = 0 as const;
export const D1K_R1_INTERFACE_ACCEPTED_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1K_R1_INTERFACE_CLOSED_EQUALS_DESIGN_APPROVAL = false as const;
export const D1K_R1_PARALLEL_APPROVAL_ENGINE_CREATED = false as const;
export const D1K_R1_D2_D8_RUNTIME_STARTED = false as const;
export const D1K_R1_D2_D8_RUNTIME_COUNT = 0 as const;
export const D1K_R1_D9_RUNTIME_STARTED = false as const;
export const D1K_R1_D9_RUNTIME_COUNT = 0 as const;
export const D1K_R1_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1K_R1_CROSS_DISCIPLINE_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D1K_R1_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1K_R1_AI_CAN_INVENT_INTERFACE_IDENTITY = false as const;
export const D1K_R1_AI_CAN_INVENT_STRUCTURAL_TARGET = false as const;
export const D1K_R1_AI_CAN_INVENT_SOURCE_REFERENCE = false as const;
export const D1K_R1_AI_CAN_INVENT_SOURCE_REVISION = false as const;
export const D1K_R1_AI_CAN_INVENT_EVIDENCE = false as const;
export const D1K_R1_AI_CAN_INVENT_PROVENANCE = false as const;
export const D1K_R1_AI_CAN_INVENT_SOURCE_AUTHORITY = false as const;
export const D1K_R1_AI_CAN_APPROVE_INTERFACE = false as const;
export const D1K_R1_AI_CAN_APPROVE_ENGINEERING = false as const;
export const D1K_R1_D1L_STARTED = false as const;
export const D1K_R1_D1M_ABSORBED = false as const;
export const D1K_R1_D1N_ABSORBED = false as const;
export const D1K_R1_DATABASE_SCHEMA_CHANGE_REQUIRED = false as const;
export const D1K_R1_NEW_DEPENDENCY_COUNT = 0 as const;
export const D1K_R1_ARCHITECTURE_READY = true as const;
export const D1K_R1_REFERENCE_RUNTIME_READY = true as const;
export const D1K_R1_EXTERNAL_REFERENCE_READY = false as const;
export const D1K_R1_INTERNAL_DISCIPLINE_INTEGRATION_READY = false as const;
export const D1K_R1_CROSS_DISCIPLINE_INTELLIGENCE_READY = false as const;
export const D1K_R1_POST_D1J_DEBT_PRESERVED = true as const;
export const D1K_R1_UNAUTHORIZED_VALIDATION_PROMOTION = false as const;
export const D1K_R1_UNAUTHORIZED_CONFORMANCE_PROMOTION = false as const;
export const D1K_R1_UNAUTHORIZED_CERTIFICATION_PROMOTION = false as const;
export const D1K_R1_UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D1K_R1_REGISTRATION_PROMOTES_SOURCE_AUTHORITY = false as const;
export const D1K_R1_SOURCE_BODY_COPIED = false as const;
export const D1K_R2_HANDOFF_READY = true as const;
export const D1K_R2_CANONICAL_PHASE = "EOS-D1K-R2-SEMANTIC-UNIT-COORDINATE-AXIS-COMPATIBILITY" as const;
export const D1K_R2_PHASE_TYPE = "STRUCTURAL_INTERFACE_SEMANTIC_UNIT_COORDINATE_AXIS_COMPATIBILITY" as const;
export const D1K_R2_CANONICAL_SCOPE =
  "Record semantic, schema, unit, coordinate, and axis compatibility diagnostics for a governed D1K-R1 interface and exact source pin. Do not convert units, transform coordinates, infer axis or sign conventions, execute a handoff, start D2 through D8, start D9, or approve engineering." as const;

const FLOATING_REVISIONS = new Set(["latest", "current"]);

export type D1kR1Actor = {
  actorId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  authority: string;
};

export type D1kR1StructuralTarget = {
  kind: StructuralObjectKind;
  id: string;
  structuralSystemId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  revision: string;
};

export type D1kR1CatalogSource = {
  sourceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  sourceClass: (typeof D1K_SOURCE_CLASSES)[number];
  sourceDiscipline: EosDisciplineId;
  objectId: string;
  documentId: string;
  revision: string;
  evidenceId: string;
  evidenceKind: EosEvidenceSourceKind;
  authority: string;
  provenanceRef: string;
  issuedAt: string | null;
  nativePackContractExposed: boolean;
  operationalExternalReference: boolean;
};

export type D1kR1Catalog = {
  targets: readonly D1kR1StructuralTarget[];
  sources: readonly D1kR1CatalogSource[];
};

export type D1kR1Provenance = {
  provenanceRef: string;
  actorId: string;
  recordedAt: string;
  sourceId: string;
  sourceRevision: string;
  transformation: "NONE";
  aiGenerated: false;
};

export type D1kR1InterfaceRecord = {
  interfaceId: string;
  relation: EosCrossDisciplineRelation;
  sourceDiscipline: EosDisciplineId;
  targetDiscipline: EosDisciplineId;
  sourceObject: string;
  targetObject: string;
  evidence: string;
  status: "declared";
  provenance: string;
  humanReviewRequired: boolean;
  description: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  counterpartyDiscipline: EosDisciplineId;
  structuralTargetKind: StructuralObjectKind;
  structuralTargetId: string;
  structuralSystemId: string;
  sourceId: string;
  sourceClass: (typeof D1K_SOURCE_CLASSES)[number];
  sourceDocumentId: string;
  sourceRevision: string;
  sourceAuthority: string;
  sourceFingerprint: string;
  evidenceKind: EosEvidenceSourceKind;
  provenanceRecord: D1kR1Provenance;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorInterfaceId: string | null;
  fingerprint: string;
  interfaceAccepted: false;
  designApproved: false;
  engineeringApproval: false;
  compatibilityEvaluated: false;
  handoffExecuted: false;
  nativePackIntegration: false;
  externalReferenceOperational: false;
};

export type D1kR1History = {
  historyId: string;
  interfaceId: string;
  action: "CREATED" | "SUPERSEDED";
  sourceId: string;
  sourceRevision: string;
  fingerprint: string;
  predecessorInterfaceId: string | null;
  recordedAt: string;
};

export type D1kR1Store = {
  catalog: D1kR1Catalog;
  now: () => string;
  records: D1kR1InterfaceRecord[];
  history: D1kR1History[];
};

export type D1kR1InterfaceInput = {
  interfaceId: string;
  relation: string;
  sourceDiscipline: string;
  targetDiscipline: string;
  counterpartyDiscipline: string;
  structuralTargetKind: string;
  structuralTargetId: string;
  sourceId: string;
  humanReviewRequired: boolean;
  description: string;
  status?: string | null;
  expectedSourceRevision?: string | null;
  expectedSourceFingerprint?: string | null;
  predecessorInterfaceId?: string | null;
};

function fail(code: string): never {
  throw new Error(code);
}

function isDiscipline(value: string): value is EosDisciplineId {
  return (EOS_DISCIPLINE_IDS as readonly string[]).includes(value);
}

function isRelation(value: string): value is EosCrossDisciplineRelation {
  return (EOS_CROSS_DISCIPLINE_RELATIONS as readonly string[]).includes(value);
}

function isTargetKind(value: string): value is StructuralObjectKind {
  return (STRUCTURAL_OBJECT_KINDS as readonly string[]).includes(value);
}

function isEvidenceKind(value: string): value is EosEvidenceSourceKind {
  return (EOS_EVIDENCE_SOURCE_KINDS as readonly string[]).includes(value);
}

function isSourceClass(value: string): value is (typeof D1K_SOURCE_CLASSES)[number] {
  return (D1K_SOURCE_CLASSES as readonly string[]).includes(value);
}

function blockedAuthority(value: string): boolean {
  const authority = value.trim();
  return !authority || /^AI(?:\b|_)/i.test(authority) || /LLM/i.test(authority) || /OPTIMIZER/i.test(authority) || /^SYSTEM$/i.test(authority);
}

function assertHuman(actor: D1kR1Actor): void {
  if (!actor.actorId.trim() || blockedAuthority(actor.authority)) fail("UNAUTHORIZED");
}

function assertScope(actor: D1kR1Actor, row: { tenantId: string; workspaceId: string; projectId: string }): void {
  if (actor.tenantId !== row.tenantId) fail("CROSS_TENANT_OPERATION");
  if (actor.workspaceId !== row.workspaceId || actor.projectId !== row.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertPinnedRevision(revision: string): void {
  if (!revision.trim()) fail("SOURCE_REVISION_REQUIRED");
  if (FLOATING_REVISIONS.has(revision.trim().toLowerCase())) fail("FLOATING_SOURCE_REJECTED");
}

function sourceFingerprintOf(source: D1kR1CatalogSource): string {
  return fingerprintCanonical({
    tenantId: source.tenantId,
    workspaceId: source.workspaceId,
    projectId: source.projectId,
    sourceId: source.sourceId,
    sourceClass: source.sourceClass,
    sourceDiscipline: source.sourceDiscipline,
    objectId: source.objectId,
    documentId: source.documentId,
    revision: source.revision,
    evidenceId: source.evidenceId,
    evidenceKind: source.evidenceKind,
    authority: source.authority,
    provenanceRef: source.provenanceRef,
    issuedAt: source.issuedAt,
  });
}

function interfaceFingerprintOf(record: Omit<D1kR1InterfaceRecord, "fingerprint" | "provenanceRecord" | "description">): string {
  return fingerprintCanonical({
    interfaceId: record.interfaceId,
    tenantId: record.tenantId,
    workspaceId: record.workspaceId,
    projectId: record.projectId,
    relation: record.relation,
    sourceDiscipline: record.sourceDiscipline,
    targetDiscipline: record.targetDiscipline,
    counterpartyDiscipline: record.counterpartyDiscipline,
    structuralTargetKind: record.structuralTargetKind,
    structuralTargetId: record.structuralTargetId,
    structuralSystemId: record.structuralSystemId,
    sourceObject: record.sourceObject,
    targetObject: record.targetObject,
    sourceId: record.sourceId,
    sourceClass: record.sourceClass,
    sourceDocumentId: record.sourceDocumentId,
    sourceRevision: record.sourceRevision,
    sourceAuthority: record.sourceAuthority,
    sourceFingerprint: record.sourceFingerprint,
    evidence: record.evidence,
    evidenceKind: record.evidenceKind,
    provenance: record.provenance,
    humanReviewRequired: record.humanReviewRequired,
    predecessorInterfaceId: record.predecessorInterfaceId,
    status: record.status,
  });
}

function remember(store: D1kR1Store, record: D1kR1InterfaceRecord, action: D1kR1History["action"]): void {
  store.history.push({
    historyId: `hist-${store.history.length + 1}`,
    interfaceId: record.interfaceId,
    action,
    sourceId: record.sourceId,
    sourceRevision: record.sourceRevision,
    fingerprint: record.fingerprint,
    predecessorInterfaceId: record.predecessorInterfaceId,
    recordedAt: store.now(),
  });
}

function resolveTarget(store: D1kR1Store, actor: D1kR1Actor, kind: string, id: string): D1kR1StructuralTarget {
  if (!isTargetKind(kind)) fail("STRUCTURAL_TARGET_INVALID");
  const target = store.catalog.targets.find((row) => row.kind === kind && row.id === id);
  if (!target) fail("STRUCTURAL_TARGET_NOT_FOUND");
  assertScope(actor, target);
  return target;
}

function resolveSource(store: D1kR1Store, actor: D1kR1Actor, sourceId: string): D1kR1CatalogSource {
  if (!sourceId.trim() || FLOATING_REVISIONS.has(sourceId.trim().toLowerCase())) fail("SOURCE_REFERENCE_REQUIRED");
  const source = store.catalog.sources.find((row) => row.sourceId === sourceId);
  if (!source) fail("SOURCE_NOT_FOUND");
  assertScope(actor, source);
  assertPinnedRevision(source.revision);
  if (!source.objectId.trim() || !source.documentId.trim()) fail("SOURCE_REFERENCE_REQUIRED");
  if (!isSourceClass(source.sourceClass)) fail("SOURCE_CLASS_INVALID");
  if (source.nativePackContractExposed !== false) fail("SOURCE_PACK_NOT_STARTED");
  if (source.operationalExternalReference !== false) fail("EXTERNAL_REFERENCE_NOT_AUTHORIZED");
  if (source.sourceClass === "NATIVE_EOS_DISCIPLINE_SOURCE" && source.sourceDiscipline !== "structural") fail("SOURCE_PACK_NOT_STARTED");
  if (!source.evidenceId.trim()) fail("MISSING_EVIDENCE");
  if (!isEvidenceKind(source.evidenceKind)) fail("EVIDENCE_REFERENCE_INVALID");
  if (!source.provenanceRef.trim() || blockedAuthority(source.provenanceRef)) fail("INVALID_PROVENANCE");
  if (blockedAuthority(source.authority)) fail("SOURCE_AUTHORITY_INVALID");
  return source;
}

function assertDisciplines(input: D1kR1InterfaceInput, source: D1kR1CatalogSource): {
  sourceDiscipline: EosDisciplineId;
  targetDiscipline: EosDisciplineId;
  counterpartyDiscipline: EosDisciplineId;
  relation: EosCrossDisciplineRelation;
} {
  if (!isRelation(input.relation)) fail("RELATION_NOT_ALLOWLISTED");
  if (!isDiscipline(input.sourceDiscipline) || !isDiscipline(input.targetDiscipline) || !isDiscipline(input.counterpartyDiscipline)) {
    fail("DISCIPLINE_NOT_ALLOWLISTED");
  }
  if (input.sourceDiscipline !== source.sourceDiscipline) fail("SOURCE_DISCIPLINE_MISMATCH");
  const structuralSide = [input.sourceDiscipline, input.targetDiscipline].filter((row) => row === "structural").length;
  if (structuralSide === 0) fail("STRUCTURAL_PARTICIPANT_REQUIRED");
  const counterparty = input.sourceDiscipline === input.targetDiscipline ? "structural" : input.sourceDiscipline === "structural" ? input.targetDiscipline : input.sourceDiscipline;
  if (input.counterpartyDiscipline !== counterparty) fail("COUNTERPARTY_DISCIPLINE_MISMATCH");
  return {
    sourceDiscipline: input.sourceDiscipline,
    targetDiscipline: input.targetDiscipline,
    counterpartyDiscipline: input.counterpartyDiscipline,
    relation: input.relation,
  };
}

export function createD1kR1Store(catalog: D1kR1Catalog, now: () => string): D1kR1Store {
  return { catalog, now, records: [], history: [] };
}

export function registerStructuralInterfaceIdentity(store: D1kR1Store, actor: D1kR1Actor, input: D1kR1InterfaceInput): D1kR1InterfaceRecord {
  assertHuman(actor);
  if (!input.interfaceId.trim() || FLOATING_REVISIONS.has(input.interfaceId.trim().toLowerCase())) fail("INTERFACE_IDENTITY_REQUIRED");
  if (input.status != null && input.status !== "declared") fail("INTERFACE_STATUS_NOT_R1");
  if (typeof input.humanReviewRequired !== "boolean") fail("HUMAN_REVIEW_REQUIREMENT_REQUIRED");
  if (!input.description.trim()) fail("DESCRIPTION_REQUIRED");
  const target = resolveTarget(store, actor, input.structuralTargetKind, input.structuralTargetId);
  const source = resolveSource(store, actor, input.sourceId);
  const disciplines = assertDisciplines(input, source);
  if (input.expectedSourceRevision != null && input.expectedSourceRevision !== source.revision) fail("SOURCE_REVISION_MISMATCH");
  const sourceFingerprint = sourceFingerprintOf(source);
  if (input.expectedSourceFingerprint != null && input.expectedSourceFingerprint !== sourceFingerprint) fail("FINGERPRINT_MISMATCH");
  const predecessor = input.predecessorInterfaceId
    ? store.records.find((row) => row.interfaceId === input.predecessorInterfaceId)
    : null;
  if (input.predecessorInterfaceId) {
    if (!predecessor) fail("INTERFACE_NOT_FOUND");
    assertScope(actor, predecessor);
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
    if (predecessor.sourceFingerprint === sourceFingerprint) fail("SOURCE_REVISION_UNCHANGED");
  }
  const draft = {
    interfaceId: input.interfaceId,
    relation: disciplines.relation,
    sourceDiscipline: disciplines.sourceDiscipline,
    targetDiscipline: disciplines.targetDiscipline,
    sourceObject: source.objectId,
    targetObject: target.id,
    evidence: source.evidenceId,
    status: "declared" as const,
    provenance: source.provenanceRef,
    humanReviewRequired: input.humanReviewRequired,
    description: input.description,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    counterpartyDiscipline: disciplines.counterpartyDiscipline,
    structuralTargetKind: target.kind,
    structuralTargetId: target.id,
    structuralSystemId: target.structuralSystemId,
    sourceId: source.sourceId,
    sourceClass: source.sourceClass,
    sourceDocumentId: source.documentId,
    sourceRevision: source.revision,
    sourceAuthority: source.authority,
    sourceFingerprint,
    evidenceKind: source.evidenceKind,
    recordStatus: "CURRENT" as const,
    predecessorInterfaceId: predecessor?.interfaceId ?? null,
    interfaceAccepted: false as const,
    designApproved: false as const,
    engineeringApproval: false as const,
    compatibilityEvaluated: false as const,
    handoffExecuted: false as const,
    nativePackIntegration: false as const,
    externalReferenceOperational: false as const,
  };
  const fingerprint = interfaceFingerprintOf(draft);
  const existing = store.records.find((row) => row.interfaceId === input.interfaceId);
  if (existing) {
    if (existing.fingerprint === fingerprint && !predecessor) return existing;
    fail("INTERFACE_ALREADY_BOUND");
  }
  const recordedAt = store.now();
  const record: D1kR1InterfaceRecord = {
    ...draft,
    fingerprint,
    provenanceRecord: {
      provenanceRef: source.provenanceRef,
      actorId: actor.actorId,
      recordedAt,
      sourceId: source.sourceId,
      sourceRevision: source.revision,
      transformation: "NONE",
      aiGenerated: false,
    },
  };
  if (predecessor) {
    predecessor.recordStatus = "SUPERSEDED";
    remember(store, predecessor, "SUPERSEDED");
  }
  store.records.push(record);
  remember(store, record, "CREATED");
  return record;
}

export function supersedeStructuralInterfaceSource(store: D1kR1Store, actor: D1kR1Actor, input: D1kR1InterfaceInput): D1kR1InterfaceRecord {
  if (!input.predecessorInterfaceId) fail("INTERFACE_NOT_FOUND");
  return registerStructuralInterfaceIdentity(store, actor, input);
}

export function inspectStructuralInterfaceIdentity(store: D1kR1Store, actor: D1kR1Actor, interfaceId: string): D1kR1InterfaceRecord {
  assertHuman(actor);
  const record = store.records.find((row) => row.interfaceId === interfaceId);
  if (!record) fail("INTERFACE_NOT_FOUND");
  assertScope(actor, record);
  return record;
}
