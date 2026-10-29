/**
 * EOS 3.5 governed event architecture.
 * EVENT != AUTHORITY — events notify/trigger evaluation; they do not approve.
 */

import { buildEos3Provenance } from "../commerce/eos3-provenance";
import { createEos3EventEnvelope } from "../commerce/eos3-events";

export const EOS3_EVENT_SCHEMA_VERSION = "1.0.0" as const;

export const EOS3_EVENT_CATEGORIES = [
  "STATE_CHANGE",
  "REVISION_CHANGE",
  "INTERFACE_CHANGE",
  "REQUIREMENT_CHANGE",
  "ASSUMPTION_CHANGE",
  "IMPACT_CHANGE",
  "DECISION_CHANGE",
  "DELIVERABLE_CHANGE",
  "BASELINE_CHANGE",
  "KNOWLEDGE_CHANGE",
  "OPTIMIZATION_RESULT",
  "SECURITY_GOVERNANCE",
] as const;

export type Eos3EventCategory = (typeof EOS3_EVENT_CATEGORIES)[number];

export type GovernedEventStatus = "RECEIVED" | "PROCESSED" | "FAILED" | "DEAD_LETTER" | "SUPPRESSED_DUPLICATE" | "REJECTED_OUT_OF_ORDER";

export type Eos3GovernedEvent = {
  eventId: string;
  idempotencyKey: string;
  eventType: string;
  category: Eos3EventCategory;
  schemaVersion: typeof EOS3_EVENT_SCHEMA_VERSION;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  objectId: string | null;
  revisionId: string | null;
  actorId: string | null;
  authority: string | null;
  timestamp: string;
  sequence: number;
  correlationId: string;
  causationId: string | null;
  source: string;
  generation: 3;
  payloadVersion: string;
  payload: Record<string, unknown>;
  provenance: Record<string, unknown>;
  status: GovernedEventStatus;
  retryCount: number;
  failureReason: string | null;
  /** Events never grant approval authority. */
  grantsAuthority: false;
};

export type EventObservability = {
  eventVolume: number;
  failures: number;
  retries: number;
  duplicatesSuppressed: number;
  deadLetters: number;
  processingLatencyMsTotal: number;
  cascadeDepthMax: number;
};

export class Eos3GovernedEventBus {
  events: Eos3GovernedEvent[] = [];
  processedKeys = new Set<string>();
  objectSequences = new Map<string, number>();
  causationDepth = new Map<string, number>();
  observability: EventObservability = {
    eventVolume: 0,
    failures: 0,
    retries: 0,
    duplicatesSuppressed: 0,
    deadLetters: 0,
    processingLatencyMsTotal: 0,
    cascadeDepthMax: 0,
  };
  private seq = 0;
  readonly maxCascadeDepth = 8;

  authorizeEventIngest(caller: {
    authenticated: boolean;
    tenantId: string | null;
    workspaceId: string | null;
    eos3Entitled: boolean;
    eos3Enrolled: boolean;
    productionEnvironment?: boolean;
    trustedIngress: boolean;
  }, target: { tenantId: string; workspaceId: string }): { allowed: boolean; reason?: string } {
    if (!caller.authenticated) return { allowed: false, reason: "unauthenticated" };
    if (caller.productionEnvironment) return { allowed: false, reason: "production_denied" };
    if (!caller.eos3Entitled || !caller.eos3Enrolled) return { allowed: false, reason: "not_entitled" };
    if (caller.tenantId !== target.tenantId || caller.workspaceId !== target.workspaceId) {
      return { allowed: false, reason: "workspace_mismatch" };
    }
    // Client-submitted raw events are not trusted as authoritative ingress without trusted path.
    if (!caller.trustedIngress) return { allowed: false, reason: "untrusted_event_injection" };
    return { allowed: true };
  }

  publish(input: {
    eventType: string;
    category: Eos3EventCategory;
    tenantId: string;
    workspaceId: string;
    projectId: string;
    objectId?: string | null;
    revisionId?: string | null;
    actorId?: string | null;
    authority?: string | null;
    correlationId?: string | null;
    causationId?: string | null;
    source: string;
    payload?: Record<string, unknown>;
    idempotencyKey: string;
    sequenceHint?: number;
  }): Eos3GovernedEvent {
    const t0 = performance.now();
    if (this.processedKeys.has(input.idempotencyKey)) {
      this.observability.duplicatesSuppressed += 1;
      const dup: Eos3GovernedEvent = {
        eventId: crypto.randomUUID(),
        idempotencyKey: input.idempotencyKey,
        eventType: input.eventType,
        category: input.category,
        schemaVersion: EOS3_EVENT_SCHEMA_VERSION,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        objectId: input.objectId ?? null,
        revisionId: input.revisionId ?? null,
        actorId: input.actorId ?? null,
        authority: input.authority ?? null,
        timestamp: new Date().toISOString(),
        sequence: input.sequenceHint ?? this.seq,
        correlationId: input.correlationId ?? crypto.randomUUID(),
        causationId: input.causationId ?? null,
        source: input.source,
        generation: 3,
        payloadVersion: "1",
        payload: input.payload ?? {},
        provenance: {},
        status: "SUPPRESSED_DUPLICATE",
        retryCount: 0,
        failureReason: null,
        grantsAuthority: false,
      };
      this.events.push(dup);
      this.observability.eventVolume += 1;
      return dup;
    }

    // Ordering: reject older sequence for same object when newer already applied
    const objKey = `${input.tenantId}:${input.workspaceId}:${input.objectId ?? "none"}`;
    const lastSeq = this.objectSequences.get(objKey) ?? 0;
    const sequence = input.sequenceHint ?? ++this.seq;
    if (input.objectId && sequence < lastSeq) {
      const rejected: Eos3GovernedEvent = {
        eventId: crypto.randomUUID(),
        idempotencyKey: input.idempotencyKey,
        eventType: input.eventType,
        category: input.category,
        schemaVersion: EOS3_EVENT_SCHEMA_VERSION,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        objectId: input.objectId,
        revisionId: input.revisionId ?? null,
        actorId: input.actorId ?? null,
        authority: input.authority ?? null,
        timestamp: new Date().toISOString(),
        sequence,
        correlationId: input.correlationId ?? crypto.randomUUID(),
        causationId: input.causationId ?? null,
        source: input.source,
        generation: 3,
        payloadVersion: "1",
        payload: input.payload ?? {},
        provenance: {},
        status: "REJECTED_OUT_OF_ORDER",
        retryCount: 0,
        failureReason: "older_than_current_object_sequence",
        grantsAuthority: false,
      };
      this.events.push(rejected);
      this.observability.eventVolume += 1;
      return rejected;
    }

    // Cascade / cycle depth
    let depth = 0;
    if (input.causationId) {
      depth = (this.causationDepth.get(input.causationId) ?? 0) + 1;
      if (depth > this.maxCascadeDepth) {
        throw new Error("event_cascade_depth_exceeded");
      }
    }

    const envelope = createEos3EventEnvelope({
      eventType: input.eventType,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      objectId: input.objectId ?? null,
      revisionId: input.revisionId ?? null,
      actorId: input.actorId ?? null,
      authority: input.authority ?? null,
      correlationId: input.correlationId ?? null,
      causationId: input.causationId ?? null,
      provenanceRef: null,
      auditLink: null,
    });

    const event: Eos3GovernedEvent = {
      eventId: crypto.randomUUID(),
      idempotencyKey: input.idempotencyKey,
      eventType: input.eventType,
      category: input.category,
      schemaVersion: EOS3_EVENT_SCHEMA_VERSION,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      objectId: input.objectId ?? null,
      revisionId: input.revisionId ?? null,
      actorId: input.actorId ?? null,
      authority: input.authority ?? null,
      timestamp: envelope.timestamp,
      sequence,
      correlationId: envelope.correlationId ?? crypto.randomUUID(),
      causationId: input.causationId ?? null,
      source: input.source,
      generation: 3,
      payloadVersion: "1",
      payload: input.payload ?? {},
      provenance: buildEos3Provenance({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        objectId: input.objectId ?? null,
        revisionId: input.revisionId ?? null,
        source: input.source,
        actorId: input.actorId ?? null,
        authority: input.authority ?? null,
        method: "publishGovernedEvent",
        toolOrModel: null,
        evidenceClassification: "FACT",
        qualificationState: null,
      }),
      status: "RECEIVED",
      retryCount: 0,
      failureReason: null,
      grantsAuthority: false,
    };

    this.events.push(event);
    this.processedKeys.add(input.idempotencyKey);
    if (input.objectId) this.objectSequences.set(objKey, sequence);
    this.causationDepth.set(event.eventId, depth);
    this.observability.eventVolume += 1;
    this.observability.cascadeDepthMax = Math.max(this.observability.cascadeDepthMax, depth);
    this.observability.processingLatencyMsTotal += performance.now() - t0;
    return event;
  }

  markProcessed(eventId: string): void {
    const e = this.events.find((x) => x.eventId === eventId);
    if (!e) return;
    e.status = "PROCESSED";
  }

  failHandler(eventId: string, reason: string, opts?: { deadLetter?: boolean }): Eos3GovernedEvent {
    const e = this.events.find((x) => x.eventId === eventId);
    if (!e) throw new Error("event_not_found");
    e.retryCount += 1;
    this.observability.retries += 1;
    this.observability.failures += 1;
    if (opts?.deadLetter || e.retryCount >= 3) {
      e.status = "DEAD_LETTER";
      e.failureReason = reason;
      this.observability.deadLetters += 1;
    } else {
      e.status = "FAILED";
      e.failureReason = reason;
    }
    return e;
  }

  /** Replay is evidence-only; does not re-approve or mutate irreversible approvals. */
  replay(eventId: string): { replayed: true; createdApproval: false; bypassedAuthority: false } {
    const e = this.events.find((x) => x.eventId === eventId);
    if (!e) throw new Error("event_not_found");
    if (e.status === "SUPPRESSED_DUPLICATE") {
      return { replayed: true, createdApproval: false, bypassedAuthority: false };
    }
    // Re-publish under new idempotency suffix would be suppressed if same key — use audit-only replay.
    this.events.push({
      ...e,
      eventId: crypto.randomUUID(),
      idempotencyKey: `${e.idempotencyKey}:replay`,
      status: "PROCESSED",
      payload: { ...e.payload, replayOf: e.eventId, replaySafe: true },
      grantsAuthority: false,
    });
    return { replayed: true, createdApproval: false, bypassedAuthority: false };
  }

  /** Event cannot finalize a Decision to DECIDED. */
  eventMayFinalizeDecision(event: Eos3GovernedEvent): false {
    void event;
    return false;
  }
}
