/**
 * Durable persistence store for Inspection Intelligence enterprise foundation.
 * Host wires Supabase; unit tests use the durable memory adapter.
 */
import { createHash, randomUUID } from "node:crypto";
import type { InspectionTarget } from "../architecture/inspection-target";
import { assertInspectionTarget } from "../architecture/inspection-target";
import {
  appendEvidenceVersion,
  type EvidenceKind,
  type ImmutableEvidenceRecord,
} from "../architecture/evidence";
import { createMeasurementEngine, type AcceptanceCriteria } from "../architecture/measurement-engine";
import {
  assertInspectionTransition,
  type InspectionSessionState,
  type TransitionAuth,
} from "./state-machine";
import {
  createEngineeringInspectionEvent,
  type EventPublishPort,
  type InspectionEngineeringEvent,
} from "./engineering-events";

export type PersistedTemplate = {
  id: string;
  tenantId: string;
  workspaceId: string;
  packId: string;
  title: string;
  createdAt: string;
};

export type PersistedTemplateVersion = {
  id: string;
  templateId: string;
  version: number;
  checklistItemTypes: string[];
  content: Record<string, unknown>;
  immutable: true;
  createdAt: string;
};

export type PersistedPlan = {
  id: string;
  tenantId: string;
  workspaceId: string;
  templateId: string;
  templateVersionId: string;
  title: string;
  status: string;
  frequency?: string;
  nextDueAt?: string;
  createdAt: string;
};

export type PersistedTarget = {
  id: string;
  planId?: string;
  sessionId?: string;
  target: InspectionTarget;
};

export type PersistedSession = {
  id: string;
  tenantId: string;
  workspaceId: string;
  planId: string;
  status: InspectionSessionState;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
};

export type DurableInspectionStore = {
  templates: PersistedTemplate[];
  templateVersions: PersistedTemplateVersion[];
  plans: PersistedPlan[];
  targets: PersistedTarget[];
  sessions: PersistedSession[];
  observations: Array<{
    id: string;
    sessionId: string;
    checklistItemType: string;
    body: string;
    recordedAt: string;
  }>;
  measurements: Array<{
    id: string;
    sessionId: string;
    observationId?: string;
    measurementType: string;
    observedValue: number | string | boolean;
    evaluationStatus: string;
    recordedAt: string;
  }>;
  evidence: ImmutableEvidenceRecord[];
  reviews: Array<{
    id: string;
    sessionId: string;
    status: string;
    updatedAt: string;
  }>;
  approvals: Array<{
    id: string;
    sessionId: string;
    status: string;
    updatedAt: string;
  }>;
  packRegistry: Array<{ packId: string; version: string; manifest: Record<string, unknown> }>;
  events: InspectionEngineeringEvent[];
};

export function createDurableMemoryStore(): DurableInspectionStore {
  return {
    templates: [],
    templateVersions: [],
    plans: [],
    targets: [],
    sessions: [],
    observations: [],
    measurements: [],
    evidence: [],
    reviews: [],
    approvals: [],
    packRegistry: [],
    events: [],
  };
}

const engine = createMeasurementEngine();

export class DurableInspectionRepository {
  constructor(
    private store: DurableInspectionStore,
    private events: EventPublishPort,
  ) {}

  async createTemplateVersioned(input: {
    tenantId: string;
    workspaceId: string;
    title: string;
    packId?: string;
    checklistItemTypes: string[];
    content?: Record<string, unknown>;
  }): Promise<{ template: PersistedTemplate; version: PersistedTemplateVersion }> {
    const template: PersistedTemplate = {
      id: randomUUID(),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      packId: input.packId ?? "generic",
      title: input.title,
      createdAt: new Date().toISOString(),
    };
    const version: PersistedTemplateVersion = {
      id: randomUUID(),
      templateId: template.id,
      version: 1,
      checklistItemTypes: input.checklistItemTypes,
      content: input.content ?? {},
      immutable: true,
      createdAt: new Date().toISOString(),
    };
    this.store.templates.push(template);
    this.store.templateVersions.push(version);
    await this.events.publish(
      createEngineeringInspectionEvent({
        type: "TemplateVersionCreated",
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        entityId: version.id,
        payload: { templateId: template.id, version: 1 },
      }),
    );
    return { template, version };
  }

  async reviseTemplate(
    templateId: string,
    checklistItemTypes: string[],
    content: Record<string, unknown>,
  ): Promise<PersistedTemplateVersion> {
    const template = this.store.templates.find((t) => t.id === templateId);
    if (!template) throw new Error("template_not_found");
    const prior = this.store.templateVersions
      .filter((v) => v.templateId === templateId)
      .sort((a, b) => b.version - a.version)[0];
    const version: PersistedTemplateVersion = {
      id: randomUUID(),
      templateId,
      version: (prior?.version ?? 0) + 1,
      checklistItemTypes,
      content,
      immutable: true,
      createdAt: new Date().toISOString(),
    };
    this.store.templateVersions.push(version);
    await this.events.publish(
      createEngineeringInspectionEvent({
        type: "TemplateVersionCreated",
        tenantId: template.tenantId,
        workspaceId: template.workspaceId,
        entityId: version.id,
        payload: { templateId, version: version.version },
      }),
    );
    return version;
  }

  async createPlan(input: {
    tenantId: string;
    workspaceId: string;
    templateId: string;
    templateVersionId: string;
    title: string;
    targets: InspectionTarget[];
    frequency?: string;
    nextDueAt?: string;
  }): Promise<PersistedPlan> {
    for (const t of input.targets) assertInspectionTarget(t);
    const plan: PersistedPlan = {
      id: randomUUID(),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      templateId: input.templateId,
      templateVersionId: input.templateVersionId,
      title: input.title,
      status: "planned",
      frequency: input.frequency,
      nextDueAt: input.nextDueAt,
      createdAt: new Date().toISOString(),
    };
    this.store.plans.push(plan);
    for (const target of input.targets) {
      this.store.targets.push({ id: randomUUID(), planId: plan.id, target });
    }
    await this.events.publish(
      createEngineeringInspectionEvent({
        type: "InspectionCreated",
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        entityId: plan.id,
        payload: { kind: "plan", templateVersionId: input.templateVersionId },
      }),
    );
    return plan;
  }

  async startSession(
    input: { tenantId: string; workspaceId: string; planId: string },
    auth: TransitionAuth,
  ): Promise<PersistedSession> {
    const plan = this.store.plans.find((p) => p.id === input.planId);
    if (!plan) throw new Error("plan_not_found");
    const session: PersistedSession = {
      id: randomUUID(),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      planId: plan.id,
      status: "assigned",
      createdAt: new Date().toISOString(),
    };
    this.store.sessions.push(session);
    for (const t of this.store.targets.filter((x) => x.planId === plan.id)) {
      this.store.targets.push({ id: randomUUID(), sessionId: session.id, target: t.target });
    }
    assertInspectionTransition("assigned", "started", auth);
    session.status = "started";
    session.startedAt = new Date().toISOString();
    await this.events.publish(
      createEngineeringInspectionEvent({
        type: "InspectionStarted",
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        entityId: session.id,
        payload: { planId: plan.id },
      }),
    );
    return session;
  }

  async transitionSession(
    sessionId: string,
    to: InspectionSessionState,
    auth: TransitionAuth,
  ): Promise<PersistedSession> {
    const session = this.store.sessions.find((s) => s.id === sessionId);
    if (!session) throw new Error("session_not_found");
    assertInspectionTransition(session.status, to, auth);
    session.status = to;
    if (to === "completed") session.completedAt = new Date().toISOString();
    if (to === "completed") {
      await this.events.publish(
        createEngineeringInspectionEvent({
          type: "InspectionCompleted",
          tenantId: session.tenantId,
          workspaceId: session.workspaceId,
          entityId: session.id,
          payload: {},
        }),
      );
    }
    if (to === "approved") {
      this.store.approvals.push({
        id: randomUUID(),
        sessionId,
        status: "approved",
        updatedAt: new Date().toISOString(),
      });
      await this.events.publish(
        createEngineeringInspectionEvent({
          type: "ReviewApproved",
          tenantId: session.tenantId,
          workspaceId: session.workspaceId,
          entityId: sessionId,
          payload: { status: "approved" },
        }),
      );
    }
    return session;
  }

  async recordObservation(input: {
    sessionId: string;
    checklistItemType: string;
    body: string;
  }) {
    const session = this.store.sessions.find((s) => s.id === input.sessionId);
    if (!session) throw new Error("session_not_found");
    const row = {
      id: randomUUID(),
      sessionId: input.sessionId,
      checklistItemType: input.checklistItemType,
      body: input.body,
      recordedAt: new Date().toISOString(),
    };
    this.store.observations.push(row);
    return row;
  }

  async recordMeasurement(input: {
    sessionId: string;
    observationId?: string;
    measurementType: string;
    observedValue: number | string | boolean;
    expectedValue?: number | string | boolean | null;
    criteria?: AcceptanceCriteria;
  }) {
    const session = this.store.sessions.find((s) => s.id === input.sessionId);
    if (!session) throw new Error("session_not_found");
    const evaluation = engine.evaluate(
      {
        measurementType: input.measurementType,
        observedValue: input.observedValue,
        expectedValue: input.expectedValue,
        source: "human",
        observedAt: new Date().toISOString(),
      },
      input.criteria,
    );
    const row = {
      id: randomUUID(),
      sessionId: input.sessionId,
      observationId: input.observationId,
      measurementType: input.measurementType,
      observedValue: input.observedValue,
      evaluationStatus: evaluation.status,
      recordedAt: new Date().toISOString(),
    };
    this.store.measurements.push(row);
    await this.events.publish(
      createEngineeringInspectionEvent({
        type: "MeasurementRecorded",
        tenantId: session.tenantId,
        workspaceId: session.workspaceId,
        entityId: row.id,
        payload: { evaluationStatus: evaluation.status },
      }),
    );
    return row;
  }

  async appendImmutableEvidence(input: {
    sessionId: string;
    kind: EvidenceKind;
    content: string;
    fileId?: string;
    capturedByPersonId?: string;
  }) {
    const session = this.store.sessions.find((s) => s.id === input.sessionId);
    if (!session) throw new Error("session_not_found");
    const contentHash = createHash("sha256").update(input.content).digest("hex");
    const previous =
      this.store.evidence
        .filter((e) => e.sessionId === input.sessionId)
        .sort((a, b) => b.version - a.version)[0] ?? null;
    const evidence = appendEvidenceVersion(previous, {
      id: randomUUID(),
      sessionId: input.sessionId,
      kind: input.kind,
      fileId: input.fileId,
      contentHash,
      hashAlgorithm: "sha256",
      provenance: {
        capturedAt: new Date().toISOString(),
        capturedByPersonId: input.capturedByPersonId,
        source: "human",
      },
      chainOfCustody: {
        custodyEvents: [
          {
            at: new Date().toISOString(),
            actorPersonId: input.capturedByPersonId,
            action: "created",
          },
        ],
      },
    });
    this.store.evidence.push(evidence);
    await this.events.publish(
      createEngineeringInspectionEvent({
        type: "EvidenceUploaded",
        tenantId: session.tenantId,
        workspaceId: session.workspaceId,
        entityId: evidence.id,
        payload: { version: evidence.version, contentHash },
      }),
    );
    return evidence;
  }

  async registerPack(manifest: Record<string, unknown> & { packId: string; version: string }) {
    this.store.packRegistry.push({
      packId: manifest.packId,
      version: manifest.version,
      manifest,
    });
    await this.events.publish(
      createEngineeringInspectionEvent({
        type: "PackRegistered",
        tenantId: "system",
        workspaceId: "system",
        entityId: manifest.packId,
        payload: { version: manifest.version },
      }),
    );
  }

  snapshot(): DurableInspectionStore {
    return this.store;
  }
}

export async function runEnterpriseFoundationHappyPath(input: {
  tenantId: string;
  workspaceId: string;
  actorUserId: string;
}): Promise<DurableInspectionStore> {
  const store = createDurableMemoryStore();
  const pipeline = {
    events: store.events,
    async publish(event: InspectionEngineeringEvent) {
      store.events.push(event);
    },
  };
  const repo = new DurableInspectionRepository(store, pipeline);
  const authWrite = {
    action: "inspection.write" as const,
    actorUserId: input.actorUserId,
  };
  const authApprove = {
    action: "inspection.approve" as const,
    actorUserId: input.actorUserId,
  };

  const { template, version } = await repo.createTemplateVersioned({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    title: "Enterprise visual template",
    checklistItemTypes: ["pass_fail", "numeric"],
  });
  await repo.reviseTemplate(template.id, ["pass_fail", "numeric", "photo_required"], {
    note: "v2",
  });
  const plan = await repo.createPlan({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    templateId: template.id,
    templateVersionId: version.id,
    title: "Weekly area A",
    frequency: "weekly",
    nextDueAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    targets: [
      {
        id: randomUUID(),
        kind: "asset",
        canonicalId: "asset-1",
        snapshot: { capturedAt: new Date().toISOString(), label: "Asset 1" },
      },
    ],
  });
  const session = await repo.startSession(
    { tenantId: input.tenantId, workspaceId: input.workspaceId, planId: plan.id },
    authWrite,
  );
  const observation = await repo.recordObservation({
    sessionId: session.id,
    checklistItemType: "pass_fail",
    body: "OK",
  });
  await repo.recordMeasurement({
    sessionId: session.id,
    observationId: observation.id,
    measurementType: "gap_mm",
    observedValue: 4.9,
    expectedValue: 5,
    criteria: { mode: "tolerance", tolerance: { absolute: 0.5 } },
  });
  await repo.appendImmutableEvidence({
    sessionId: session.id,
    kind: "photo",
    content: "bytes",
    fileId: "file-1",
  });
  await repo.transitionSession(session.id, "completed", authWrite);
  await repo.transitionSession(session.id, "submitted", authWrite);
  await repo.transitionSession(session.id, "reviewed", {
    action: "inspection.review",
    actorUserId: input.actorUserId,
  });
  await repo.transitionSession(session.id, "approved", authApprove);
  await repo.registerPack({ packId: "generic", version: "0.3.0", displayName: "Generic" });
  return store;
}
