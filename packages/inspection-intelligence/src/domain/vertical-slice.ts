import { createHash, randomUUID } from "node:crypto";
import type { InspectionTarget } from "../architecture/inspection-target";
import { assertInspectionTarget } from "../architecture/inspection-target";
import type { AcceptanceCriteria } from "../architecture/measurement-engine";
import { createMeasurementEngine } from "../architecture/measurement-engine";
import {
  appendEvidenceVersion,
  type EvidenceKind,
  type ImmutableEvidenceRecord,
} from "../architecture/evidence";
import { createInspectionDomainEvent, type InspectionDomainEvent } from "../architecture/event-flow";
import { GENERIC_INSPECTION_PACK } from "../architecture/inspection-pack";

export type InspectionTemplate = {
  id: string;
  tenantId: string;
  workspaceId: string;
  packId: string;
  title: string;
  revision: number;
  checklistItemTypes: string[];
  createdAt: string;
};

export type InspectionPlan = {
  id: string;
  tenantId: string;
  workspaceId: string;
  templateId: string;
  title: string;
  status: "draft" | "planned" | "scheduled";
  targets: InspectionTarget[];
  createdAt: string;
};

export type InspectionSession = {
  id: string;
  tenantId: string;
  workspaceId: string;
  planId: string;
  status: "assigned" | "started" | "completed" | "submitted" | "reviewed";
  targets: InspectionTarget[];
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
};

export type InspectionObservation = {
  id: string;
  sessionId: string;
  checklistItemType: string;
  body: string;
  recordedAt: string;
};

export type InspectionMeasurementRecord = {
  id: string;
  sessionId: string;
  observationId?: string;
  measurementType: string;
  observedValue: number | string | boolean;
  expectedValue?: number | string | boolean | null;
  unit?: string;
  evaluationStatus: string;
  recordedAt: string;
};

export type InspectionReview = {
  id: string;
  sessionId: string;
  status: "requested" | "approved" | "rejected";
  reviewerPersonId?: string;
  notes?: string;
  updatedAt: string;
};

export type VerticalSliceStore = {
  templates: InspectionTemplate[];
  plans: InspectionPlan[];
  sessions: InspectionSession[];
  observations: InspectionObservation[];
  measurements: InspectionMeasurementRecord[];
  evidence: ImmutableEvidenceRecord[];
  reviews: InspectionReview[];
  events: InspectionDomainEvent[];
};

export function createEmptySliceStore(): VerticalSliceStore {
  return {
    templates: [],
    plans: [],
    sessions: [],
    observations: [],
    measurements: [],
    evidence: [],
    reviews: [],
    events: [],
  };
}

const engine = createMeasurementEngine();

export function createTemplate(
  store: VerticalSliceStore,
  input: {
    tenantId: string;
    workspaceId: string;
    title: string;
    packId?: string;
    checklistItemTypes?: string[];
  },
): InspectionTemplate {
  const packId = input.packId ?? GENERIC_INSPECTION_PACK.packId;
  const template: InspectionTemplate = {
    id: randomUUID(),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    packId,
    title: input.title,
    revision: 1,
    checklistItemTypes:
      input.checklistItemTypes ?? GENERIC_INSPECTION_PACK.checklistItemTypes,
    createdAt: new Date().toISOString(),
  };
  store.templates.push(template);
  store.events.push(
    createInspectionDomainEvent({
      type: "inspection.template.created",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      entityId: template.id,
      payload: { title: template.title, packId },
    }),
  );
  return template;
}

export function createPlan(
  store: VerticalSliceStore,
  input: {
    tenantId: string;
    workspaceId: string;
    templateId: string;
    title: string;
    targets: InspectionTarget[];
  },
): InspectionPlan {
  for (const t of input.targets) assertInspectionTarget(t);
  if (!store.templates.some((x) => x.id === input.templateId)) {
    throw new Error("template_not_found");
  }
  const plan: InspectionPlan = {
    id: randomUUID(),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    templateId: input.templateId,
    title: input.title,
    status: "planned",
    targets: input.targets,
    createdAt: new Date().toISOString(),
  };
  store.plans.push(plan);
  store.events.push(
    createInspectionDomainEvent({
      type: "inspection.plan.created",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      entityId: plan.id,
      targetIds: plan.targets.map((t) => t.id),
      payload: { templateId: plan.templateId },
    }),
  );
  return plan;
}

export function createSession(
  store: VerticalSliceStore,
  input: { tenantId: string; workspaceId: string; planId: string },
): InspectionSession {
  const plan = store.plans.find((p) => p.id === input.planId);
  if (!plan) throw new Error("plan_not_found");
  const session: InspectionSession = {
    id: randomUUID(),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    planId: plan.id,
    status: "started",
    targets: plan.targets,
    startedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  store.sessions.push(session);
  store.events.push(
    createInspectionDomainEvent({
      type: "inspection.session.started",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      entityId: session.id,
      targetIds: session.targets.map((t) => t.id),
      payload: { planId: plan.id },
    }),
  );
  return session;
}

export function completeSession(store: VerticalSliceStore, sessionId: string): InspectionSession {
  const session = store.sessions.find((s) => s.id === sessionId);
  if (!session) throw new Error("session_not_found");
  session.status = "completed";
  session.completedAt = new Date().toISOString();
  store.events.push(
    createInspectionDomainEvent({
      type: "inspection.session.completed",
      tenantId: session.tenantId,
      workspaceId: session.workspaceId,
      entityId: session.id,
      targetIds: session.targets.map((t) => t.id),
      payload: {},
    }),
  );
  return session;
}

export function recordObservation(
  store: VerticalSliceStore,
  input: {
    sessionId: string;
    checklistItemType: string;
    body: string;
  },
): InspectionObservation {
  const session = store.sessions.find((s) => s.id === input.sessionId);
  if (!session) throw new Error("session_not_found");
  const observation: InspectionObservation = {
    id: randomUUID(),
    sessionId: input.sessionId,
    checklistItemType: input.checklistItemType,
    body: input.body,
    recordedAt: new Date().toISOString(),
  };
  store.observations.push(observation);
  store.events.push(
    createInspectionDomainEvent({
      type: "inspection.observation.recorded",
      tenantId: session.tenantId,
      workspaceId: session.workspaceId,
      entityId: observation.id,
      targetIds: session.targets.map((t) => t.id),
      payload: { sessionId: session.id },
    }),
  );
  return observation;
}

export function recordMeasurement(
  store: VerticalSliceStore,
  input: {
    sessionId: string;
    observationId?: string;
    measurementType: string;
    observedValue: number | string | boolean;
    expectedValue?: number | string | boolean | null;
    unit?: string;
    criteria?: AcceptanceCriteria;
  },
): InspectionMeasurementRecord {
  const session = store.sessions.find((s) => s.id === input.sessionId);
  if (!session) throw new Error("session_not_found");
  const evaluation = engine.evaluate(
    {
      measurementType: input.measurementType,
      observedValue: input.observedValue,
      expectedValue: input.expectedValue,
      unit: input.unit,
      source: "human",
      observedAt: new Date().toISOString(),
    },
    input.criteria,
  );
  const record: InspectionMeasurementRecord = {
    id: randomUUID(),
    sessionId: input.sessionId,
    observationId: input.observationId,
    measurementType: input.measurementType,
    observedValue: input.observedValue,
    expectedValue: input.expectedValue,
    unit: input.unit,
    evaluationStatus: evaluation.status,
    recordedAt: new Date().toISOString(),
  };
  store.measurements.push(record);
  store.events.push(
    createInspectionDomainEvent({
      type: "inspection.measurement.recorded",
      tenantId: session.tenantId,
      workspaceId: session.workspaceId,
      entityId: record.id,
      targetIds: session.targets.map((t) => t.id),
      payload: { evaluationStatus: evaluation.status },
    }),
  );
  return record;
}

export function appendEvidence(
  store: VerticalSliceStore,
  input: {
    sessionId: string;
    observationId?: string;
    kind: EvidenceKind;
    fileId?: string;
    externalUrl?: string;
    content: string;
    capturedByPersonId?: string;
  },
): ImmutableEvidenceRecord {
  const session = store.sessions.find((s) => s.id === input.sessionId);
  if (!session) throw new Error("session_not_found");
  const contentHash = createHash("sha256").update(input.content).digest("hex");
  const previous =
    store.evidence.filter((e) => e.sessionId === input.sessionId).sort((a, b) => b.version - a.version)[0] ??
    null;
  const evidence = appendEvidenceVersion(previous, {
    id: randomUUID(),
    sessionId: input.sessionId,
    observationId: input.observationId,
    kind: input.kind,
    fileId: input.fileId,
    externalUrl: input.externalUrl,
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
  store.evidence.push(evidence);
  store.events.push(
    createInspectionDomainEvent({
      type: "inspection.evidence.appended",
      tenantId: session.tenantId,
      workspaceId: session.workspaceId,
      entityId: evidence.id,
      targetIds: session.targets.map((t) => t.id),
      payload: { version: evidence.version, contentHash },
    }),
  );
  return evidence;
}

export function requestReview(
  store: VerticalSliceStore,
  input: { sessionId: string; reviewerPersonId?: string; notes?: string },
): InspectionReview {
  const session = store.sessions.find((s) => s.id === input.sessionId);
  if (!session) throw new Error("session_not_found");
  session.status = "submitted";
  const review: InspectionReview = {
    id: randomUUID(),
    sessionId: input.sessionId,
    status: "requested",
    reviewerPersonId: input.reviewerPersonId,
    notes: input.notes,
    updatedAt: new Date().toISOString(),
  };
  store.reviews.push(review);
  store.events.push(
    createInspectionDomainEvent({
      type: "inspection.review.requested",
      tenantId: session.tenantId,
      workspaceId: session.workspaceId,
      entityId: review.id,
      targetIds: session.targets.map((t) => t.id),
      payload: { sessionId: session.id },
    }),
  );
  return review;
}

export function completeReview(
  store: VerticalSliceStore,
  input: { reviewId: string; status: "approved" | "rejected"; notes?: string },
): InspectionReview {
  const review = store.reviews.find((r) => r.id === input.reviewId);
  if (!review) throw new Error("review_not_found");
  const session = store.sessions.find((s) => s.id === review.sessionId);
  if (!session) throw new Error("session_not_found");
  review.status = input.status;
  review.notes = input.notes ?? review.notes;
  review.updatedAt = new Date().toISOString();
  session.status = "reviewed";
  store.events.push(
    createInspectionDomainEvent({
      type: "inspection.review.completed",
      tenantId: session.tenantId,
      workspaceId: session.workspaceId,
      entityId: review.id,
      targetIds: session.targets.map((t) => t.id),
      payload: { status: review.status },
    }),
  );
  return review;
}

/** Happy-path vertical slice for certification. */
export function runVerticalSliceHappyPath(input: {
  tenantId: string;
  workspaceId: string;
}): VerticalSliceStore {
  const store = createEmptySliceStore();
  const template = createTemplate(store, {
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    title: "Generic visual inspection",
  });
  const plan = createPlan(store, {
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    templateId: template.id,
    title: "Plant area A weekly",
    targets: [
      {
        id: randomUUID(),
        kind: "asset",
        canonicalId: "asset-demo-1",
        snapshot: { capturedAt: new Date().toISOString(), label: "Demo asset" },
      },
    ],
  });
  const session = createSession(store, {
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    planId: plan.id,
  });
  const observation = recordObservation(store, {
    sessionId: session.id,
    checklistItemType: "pass_fail",
    body: "No visible defects",
  });
  recordMeasurement(store, {
    sessionId: session.id,
    observationId: observation.id,
    measurementType: "thickness_mm",
    observedValue: 10.2,
    expectedValue: 10,
    unit: "mm",
    criteria: { mode: "tolerance", tolerance: { absolute: 0.5 } },
  });
  appendEvidence(store, {
    sessionId: session.id,
    observationId: observation.id,
    kind: "photo",
    fileId: "file-demo-1",
    content: "demo-bytes",
  });
  completeSession(store, session.id);
  const review = requestReview(store, { sessionId: session.id });
  completeReview(store, { reviewId: review.id, status: "approved" });
  return store;
}
