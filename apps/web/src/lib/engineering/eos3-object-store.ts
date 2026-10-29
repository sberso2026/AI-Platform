/**
 * In-process EOS 3.2 canonical object store for development/staging workflows.
 * Revisions are immutable; AI authority is enforced at write boundaries.
 */

import { createEos3EventEnvelope } from "../commerce/eos3-events";
import { buildEos3Provenance } from "../commerce/eos3-provenance";
import {
  newStableIdentity,
  type Eos3CanonicalObject,
  type Eos3ObjectRevision,
  type Eos3ObjectType,
  type QualificationStatus,
} from "./eos3-canonical-objects";
import { assertHumanAuthority, type AuthorityAction } from "./eos3-object-authority";
import {
  type Eos3CanonicalRelationship,
  type Eos3RelationshipType,
  isTypedRelationship,
} from "./eos3-relationships";
import type { DigitalThreadStoreView } from "./eos3-digital-thread";

function id(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export type Eos3ObjectEventRecord = {
  eventType: string;
  objectId: string;
  envelope: ReturnType<typeof createEos3EventEnvelope>;
};

export class Eos3CanonicalObjectStore {
  objects = new Map<string, Eos3CanonicalObject>();
  revisions = new Map<string, Eos3ObjectRevision>();
  relationships: Eos3CanonicalRelationship[] = [];
  baselineMembers: Array<{
    baselineObjectId: string;
    memberObjectId: string;
    memberRevisionId: string;
    frozenAt: string;
  }> = [];
  events: Eos3ObjectEventRecord[] = [];
  audit: Array<{ action: string; objectId: string; actorId: string | null; at: string; detail: Record<string, unknown> }> =
    [];

  view(): DigitalThreadStoreView {
    return {
      objects: this.objects,
      revisions: this.revisions,
      relationships: this.relationships,
    };
  }

  private emit(
    eventType: string,
    object: Eos3CanonicalObject,
    actorId: string | null,
    authority: string | null,
  ) {
    const envelope = createEos3EventEnvelope({
      eventType,
      tenantId: object.tenantId,
      workspaceId: object.workspaceId,
      projectId: object.projectId,
      objectId: object.id,
      revisionId: object.currentRevisionId,
      actorId,
      authority,
      correlationId: null,
      causationId: null,
      provenanceRef: null,
      auditLink: null,
    });
    this.events.push({ eventType, objectId: object.id, envelope });
  }

  private auditLog(
    action: string,
    objectId: string,
    actorId: string | null,
    detail: Record<string, unknown> = {},
  ) {
    this.audit.push({ action, objectId, actorId, at: now(), detail });
  }

  createObject(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    objectType: Eos3ObjectType;
    stableObjectId: string;
    displayName: string;
    sourceOwnerId: string | null;
    disciplineType?: string | null;
    lifecycleState?: string;
    lifecycleProfileKey?: string | null;
    jurisdictionProfileRef?: string | null;
    payload?: Record<string, unknown>;
    actorId?: string | null;
    authority?: string | null;
  }): Eos3CanonicalObject {
    const identity = newStableIdentity({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      objectType: input.objectType,
      stableObjectId: input.stableObjectId,
    });
    const objectId = id();
    const provenance = buildEos3Provenance({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      objectId,
      revisionId: null,
      source: "eos3.canonical.store",
      actorId: input.actorId ?? null,
      authority: input.authority ?? null,
      method: "createObject",
      toolOrModel: null,
      evidenceClassification: "FACT",
      qualificationState: null,
    });
    const obj: Eos3CanonicalObject = {
      ...identity,
      id: objectId,
      displayName: input.displayName,
      lifecycleState: input.lifecycleState ?? "concept",
      lifecycleProfileKey: input.lifecycleProfileKey ?? "configurable_default",
      jurisdictionProfileRef: input.jurisdictionProfileRef ?? null,
      sourceOwnerId: input.sourceOwnerId,
      disciplineType: input.disciplineType ?? null,
      currentRevisionId: null,
      governedState: "CURRENT",
      payload: input.payload ?? {},
      provenance,
      createdAt: now(),
      updatedAt: now(),
    };
    if (!obj.sourceOwnerId && obj.objectType !== "Evidence") {
      // Evidence may cite external sources; other engineering objects require ownership.
      throw new Error("source_ownership_required");
    }
    this.objects.set(objectId, obj);
    this.emit("OBJECT_CREATED", obj, input.actorId ?? null, input.authority ?? null);
    this.auditLog("OBJECT_CREATED", objectId, input.actorId ?? null);
    return obj;
  }

  createRevision(input: {
    objectId: string;
    revisionIdentifier: string;
    actorId: string | null;
    authority: string | null;
    source: string;
    changeRationale?: string | null;
    payload?: Record<string, unknown>;
    lifecycleState?: string;
  }): Eos3ObjectRevision {
    const obj = this.objects.get(input.objectId);
    if (!obj) throw new Error("object_not_found");
    const prior = obj.currentRevisionId;
    if (prior) {
      const prev = this.revisions.get(prior);
      if (prev) {
        // Historical revisions remain immutable — mark prior non-current without mutating payload.
        this.revisions.set(prior, { ...prev, isCurrent: false });
      }
    }
    const revId = id();
    const provenance = buildEos3Provenance({
      tenantId: obj.tenantId,
      workspaceId: obj.workspaceId,
      projectId: obj.projectId,
      objectId: obj.id,
      revisionId: revId,
      source: input.source,
      actorId: input.actorId,
      authority: input.authority,
      method: "createRevision",
      toolOrModel: null,
      evidenceClassification: "FACT",
      qualificationState: null,
    });
    const rev: Eos3ObjectRevision = {
      id: revId,
      objectId: obj.id,
      revisionIdentifier: input.revisionIdentifier,
      priorRevisionId: prior,
      isCurrent: true,
      actorId: input.actorId,
      authority: input.authority,
      source: input.source,
      changeRationale: input.changeRationale ?? null,
      lifecycleState: input.lifecycleState ?? obj.lifecycleState,
      payload: Object.freeze({ ...(input.payload ?? {}) }) as Record<string, unknown>,
      provenance,
      createdAt: now(),
      immutable: true,
    };
    this.revisions.set(revId, rev);
    this.objects.set(obj.id, {
      ...obj,
      currentRevisionId: revId,
      revisionLineageId: obj.revisionLineageId ?? revId,
      updatedAt: now(),
    });
    this.relate({
      fromObjectId: obj.id,
      toObjectId: obj.id,
      relationshipType: "OBJECT_HAS_REVISION",
      fromRevisionId: null,
      toRevisionId: revId,
      tenantId: obj.tenantId,
      workspaceId: obj.workspaceId,
      projectId: obj.projectId,
    });
    this.emit("REVISION_CREATED", this.objects.get(obj.id)!, input.actorId, input.authority);
    this.auditLog("REVISION_CREATED", obj.id, input.actorId, { revisionId: revId });
    return rev;
  }

  /** Attempting to mutate a revision payload must fail. */
  mutateRevisionPayload(revisionId: string, _patch: Record<string, unknown>): never {
    const rev = this.revisions.get(revisionId);
    if (!rev) throw new Error("revision_not_found");
    throw new Error("revision_immutable");
  }

  relate(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    relationshipType: Eos3RelationshipType | string;
    fromObjectId: string;
    toObjectId: string;
    fromRevisionId?: string | null;
    toRevisionId?: string | null;
    metadata?: Record<string, unknown>;
  }): Eos3CanonicalRelationship {
    if (!isTypedRelationship(input.relationshipType)) {
      throw new Error("untyped_relationship_forbidden");
    }
    const rel: Eos3CanonicalRelationship = {
      id: id(),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      relationshipType: input.relationshipType,
      fromObjectId: input.fromObjectId,
      toObjectId: input.toObjectId,
      fromRevisionId: input.fromRevisionId ?? null,
      toRevisionId: input.toRevisionId ?? null,
      metadata: input.metadata ?? {},
      provenance: buildEos3Provenance({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        objectId: input.fromObjectId,
        revisionId: input.fromRevisionId ?? null,
        source: "eos3.canonical.store",
        actorId: null,
        authority: null,
        method: "relate",
        toolOrModel: null,
        evidenceClassification: "FACT",
        qualificationState: null,
      }),
      createdAt: now(),
    };
    this.relationships.push(rel);
    return rel;
  }

  markImpactCandidate(objectId: string, changeId: string): void {
    const obj = this.objects.get(objectId);
    if (!obj) throw new Error("object_not_found");
    // Do not rewrite engineering payload — only governed awareness state.
    this.objects.set(objectId, {
      ...obj,
      governedState: "IMPACT_CANDIDATE",
      updatedAt: now(),
    });
    this.auditLog("IMPACT_CANDIDATE", objectId, null, { changeId });
  }

  markStale(objectId: string, reason: string): void {
    const obj = this.objects.get(objectId);
    if (!obj) throw new Error("object_not_found");
    this.objects.set(objectId, { ...obj, governedState: "STALE", updatedAt: now() });
    this.auditLog("MARK_STALE", objectId, null, { reason });
  }

  authorize(action: AuthorityAction, actor: { role: "human" | "ai"; authorityRole?: string | null }) {
    assertHumanAuthority(action, actor);
  }

  freezeBaseline(input: {
    baselineObjectId: string;
    members: Array<{ memberObjectId: string; memberRevisionId: string }>;
    actorId: string;
    authorityRole: string;
  }): void {
    this.authorize("freeze_baseline", { role: "human", authorityRole: input.authorityRole });
    const baseline = this.objects.get(input.baselineObjectId);
    if (!baseline || baseline.objectType !== "Baseline") throw new Error("baseline_required");
    const frozenAt = now();
    for (const m of input.members) {
      this.baselineMembers.push({
        baselineObjectId: input.baselineObjectId,
        memberObjectId: m.memberObjectId,
        memberRevisionId: m.memberRevisionId,
        frozenAt,
      });
      this.relate({
        tenantId: baseline.tenantId,
        workspaceId: baseline.workspaceId,
        projectId: baseline.projectId,
        relationshipType: "BASELINE_INCLUDES_REVISION",
        fromObjectId: input.baselineObjectId,
        toObjectId: m.memberObjectId,
        toRevisionId: m.memberRevisionId,
      });
    }
    this.objects.set(input.baselineObjectId, {
      ...baseline,
      governedState: "FROZEN",
      payload: { ...baseline.payload, frozenAt, memberCount: input.members.length },
      updatedAt: frozenAt,
    });
    this.emit("BASELINE_FROZEN", this.objects.get(input.baselineObjectId)!, input.actorId, input.authorityRole);
    this.auditLog("BASELINE_FROZEN", input.baselineObjectId, input.actorId);
  }

  /** Baseline membership cannot be rewritten after freeze. */
  rewriteBaselineMembership(_baselineObjectId: string): never {
    throw new Error("baseline_immutable");
  }

  recordDecision(input: {
    decisionObjectId: string;
    selectedOption: string;
    optionsConsidered: string[];
    rationale: string;
    actorId: string;
    authorityRole: string;
  }): void {
    this.authorize("record_human_decision", {
      role: "human",
      authorityRole: input.authorityRole,
    });
    const decision = this.objects.get(input.decisionObjectId);
    if (!decision || decision.objectType !== "Decision") throw new Error("decision_required");
    this.objects.set(input.decisionObjectId, {
      ...decision,
      payload: {
        ...decision.payload,
        selectedOption: input.selectedOption,
        optionsConsidered: input.optionsConsidered,
        rationale: input.rationale,
        decisionMaker: input.actorId,
        decisionMakerRole: input.authorityRole,
      },
      updatedAt: now(),
    });
    this.emit("DECISION_RECORDED", this.objects.get(input.decisionObjectId)!, input.actorId, input.authorityRole);
    this.auditLog("DECISION_RECORDED", input.decisionObjectId, input.actorId);
  }

  setCalculationQualification(
    calculationObjectId: string,
    qualificationStatus: QualificationStatus,
    meta: { method: string; tool?: string | null; solver?: string | null; deterministic: boolean },
  ): void {
    const calc = this.objects.get(calculationObjectId);
    if (!calc || calc.objectType !== "Calculation") throw new Error("calculation_required");
    this.objects.set(calculationObjectId, {
      ...calc,
      payload: {
        ...calc.payload,
        ...meta,
        qualificationStatus,
        validationStatus: qualificationStatus === "NOT_IMPLEMENTED" ? "NONE" : "RECORDED",
        // Existence of record does not imply qualification.
        recordImpliesQualification: false,
      },
      updatedAt: now(),
    });
  }

  counts(): { objects: number; relationships: number; revisions: number; events: number } {
    return {
      objects: this.objects.size,
      relationships: this.relationships.length,
      revisions: this.revisions.size,
      events: this.events.length,
    };
  }
}
