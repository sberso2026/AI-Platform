/**
 * Phase 12C — Governed twin state engine.
 *
 * create state, submit review, publish, supersede, attach representation version,
 * create snapshot, list history. Fail closed on missing provenance; forbid runtime/telemetry/sim/viewer.
 */

import type { EngineeringWorkflowInstance } from "@rtb/engineering-os";
import { assertOwnershipLock } from "../architecture/ownership-lock";
import {
  DIGITAL_TWIN_RUNTIME_IMPLEMENTED,
  LIVE_TELEMETRY_IMPLEMENTED,
  PHYSICAL_ACTUATION_ENABLED,
  SIMULATION_EXECUTION_IMPLEMENTED,
  THREE_D_VIEWER_IMPLEMENTED,
} from "../version";
import {
  snapshotUpdatedEventPayload,
  stateCreatedEventPayload,
  statePublishedEventPayload,
  stateReviewedEventPayload,
  stateSupersededEventPayload,
} from "./state-events";
import type { DigitalTwinRepositoryPort, TwinStateReviewRecord } from "./persistence";
import type { RepresentationVersion } from "./representation-versioning";
import { assertRepresentationAppendOnly } from "./representation-versioning";
import { assertSnapshotNoTelemetry } from "./snapshot";
import {
  assertNoFabricatedState,
  assertProvenanceRequired,
  type StateProvenance,
  type StateReferenceCategory,
  type TwinState,
  type TwinStateSnapshot,
  type TwinStateVersion,
} from "./state";
import {
  assertReviewPublishable,
  startStateReview,
  transitionStateReview,
  type StateReviewAction,
  type StateReviewTargetState,
} from "./review-workflow";
import { createTwinTimelineEvent } from "./timeline";
import { assertCoreForbiddenCapabilities } from "./twin-engine";

export type CreateTwinStateInput = {
  tenantId: string;
  workspaceId: string;
  twinId: string;
  category: StateReferenceCategory;
  provenance: StateProvenance;
  externalRef: string;
  confidence?: number;
  evidenceRefs?: string[];
  createdBy?: string;
};

export type AttachRepresentationVersionInput = {
  tenantId: string;
  workspaceId: string;
  twinId: string;
  representationType: RepresentationVersion["representationType"];
  sourceSystem: string;
  sourceRef: string;
  revision: string;
  effectiveDate: string;
  fidelityLevel: RepresentationVersion["fidelityLevel"];
  coordinateSystem?: string;
  units?: string;
  createdBy?: string;
};

export type CreateSnapshotInput = {
  tenantId: string;
  workspaceId: string;
  twinId: string;
  stateIds: string[];
  representationVersionIds?: string[];
  label?: string;
  createdBy?: string;
};

export type TwinStateHistory = {
  states: TwinState[];
  versions: TwinStateVersion[];
  snapshots: TwinStateSnapshot[];
  representationVersions: RepresentationVersion[];
  timeline: import("./timeline").TwinTimelineEvent[];
};

export type DigitalTwinStateEngineDeps = {
  repository: DigitalTwinRepositoryPort;
  newId?: (prefix: string) => string;
};

export class DigitalTwinStateEngine {
  readonly kind = "digital_twin_state_engine" as const;
  private readonly repository: DigitalTwinRepositoryPort;
  private readonly newId: (prefix: string) => string;

  constructor(deps: DigitalTwinStateEngineDeps) {
    assertCoreForbiddenCapabilities();
    assertStateForbiddenCapabilities();
    assertOwnershipLock();
    this.repository = deps.repository;
    this.newId = deps.newId ?? deps.repository.newId.bind(deps.repository);
  }

  async createState(input: CreateTwinStateInput): Promise<TwinState> {
    assertScope(input.tenantId, input.workspaceId);
    assertNoFabricatedState({ provenance: input.provenance, externalRef: input.externalRef });
    await this.requireTwin(input.tenantId, input.workspaceId, input.twinId);

    const now = new Date().toISOString();
    const stateId = this.newId("dtst");
    const state: TwinState = {
      stateId,
      twinId: input.twinId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      category: input.category,
      lifecycle: "draft",
      currentVersion: 1,
      provenance: input.provenance,
      externalRef: input.externalRef,
      confidence: input.confidence,
      evidenceRefs: input.evidenceRefs ?? [],
      reviewStatus: "not_reviewed",
      createdAt: now,
      updatedAt: now,
      createdBy: input.createdBy,
      simulationExecuted: false,
      liveIngestionEnabled: false,
      storesTelemetryPayload: false,
    };

    const version: TwinStateVersion = {
      stateVersionId: this.newId("dtstv"),
      stateId,
      twinId: input.twinId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      versionNumber: 1,
      category: input.category,
      lifecycle: "draft",
      provenance: input.provenance,
      externalRef: input.externalRef,
      confidence: input.confidence,
      evidenceRefs: input.evidenceRefs ?? [],
      reviewStatus: "not_reviewed",
      createdAt: now,
      createdBy: input.createdBy,
      simulationExecuted: false,
      storesTelemetryPayload: false,
    };

    await this.repository.saveState(state);
    await this.repository.saveStateVersion(version);
    await this.appendTimeline({
      twinId: input.twinId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      eventType: "state_created",
      entityType: "twin_state",
      entityId: stateId,
      summary: `State created (${input.category})`,
      refs: { stateId, externalRef: input.externalRef },
      actorId: input.createdBy,
    });
    await this.repository.enqueueOutbox({
      outboxId: this.newId("dtout"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId: input.twinId,
      eventType: "engineering.digital_twin.state.created",
      payload: stateCreatedEventPayload(state),
      published: false,
      createdAt: now,
    });
    return state;
  }

  async submitStateReview(input: {
    tenantId: string;
    workspaceId: string;
    twinId: string;
    stateId: string;
    startedBy?: string;
  }): Promise<{ instance: EngineeringWorkflowInstance; review: TwinStateReviewRecord; state: TwinState }> {
    assertScope(input.tenantId, input.workspaceId);
    const state = await this.requireState(input.tenantId, input.workspaceId, input.stateId);
    if (state.twinId !== input.twinId) throw new Error("state_twin_mismatch");
    if (state.lifecycle !== "draft") throw new Error("state_review_requires_draft");

    const { instance } = startStateReview(input);
    const now = new Date().toISOString();
    const updated: TwinState = {
      ...state,
      lifecycle: "pending_review",
      reviewStatus: "pending_review",
      reviewWorkflowInstanceId: instance.instanceId,
      updatedAt: now,
    };
    await this.repository.saveState(updated);
    const review: TwinStateReviewRecord = {
      reviewId: this.newId("dtstrev"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId: input.twinId,
      stateId: input.stateId,
      workflowInstanceId: instance.instanceId,
      workflowState: instance.state,
      createdAt: now,
      selfApproved: false,
    };
    await this.repository.saveStateReview(review);
    return { instance, review, state: updated };
  }

  async transitionStateReview(input: {
    tenantId: string;
    workspaceId: string;
    twinId: string;
    stateId: string;
    instance: EngineeringWorkflowInstance;
    action: StateReviewAction;
    to: StateReviewTargetState;
    reviewerId?: string;
    createdBy?: string;
  }): Promise<{ instance: EngineeringWorkflowInstance; state: TwinState }> {
    assertScope(input.tenantId, input.workspaceId);
    const state = await this.requireState(input.tenantId, input.workspaceId, input.stateId);
    if (input.to === "published") {
      assertReviewPublishable({
        workflowState: input.instance.state,
        reviewerId: input.reviewerId,
        createdBy: input.createdBy ?? state.createdBy,
      });
    }
    const transitioned = transitionStateReview({
      instance: input.instance,
      action: input.action,
      to: input.to,
    });
    const now = new Date().toISOString();
    const reviewStatus =
      input.to === "approved"
        ? "approved"
        : input.to === "rejected"
          ? "rejected"
          : input.to === "pending_review"
            ? "pending_review"
            : state.reviewStatus;
    const lifecycle =
      input.to === "published"
        ? "published"
        : input.to === "approved"
          ? state.lifecycle
          : input.to === "rejected"
            ? "draft"
            : "pending_review";

    const updated: TwinState = {
      ...state,
      lifecycle,
      reviewStatus,
      updatedAt: now,
      publishedAt: input.to === "published" ? now : state.publishedAt,
    };
    await this.repository.saveState(updated);
    await this.repository.saveStateReview({
      reviewId: this.newId("dtstrev"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId: input.twinId,
      stateId: input.stateId,
      workflowInstanceId: transitioned.instanceId,
      workflowState: transitioned.state,
      reviewerId: input.reviewerId,
      outcome:
        input.to === "approved" || input.to === "rejected" || input.to === "changes_requested"
          ? input.to
          : undefined,
      createdAt: now,
      selfApproved: false,
    });
    await this.appendTimeline({
      twinId: input.twinId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      eventType: "state_reviewed",
      entityType: "twin_state",
      entityId: input.stateId,
      summary: `State review ${input.to}`,
      refs: { stateId: input.stateId, outcome: input.to },
      actorId: input.reviewerId,
    });
    await this.repository.enqueueOutbox({
      outboxId: this.newId("dtout"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId: input.twinId,
      eventType: "engineering.digital_twin.state.reviewed",
      payload: stateReviewedEventPayload({
        state: updated,
        reviewerId: input.reviewerId,
        outcome: input.to,
      }),
      published: false,
      createdAt: now,
    });
    if (input.to === "published") {
      await this.repository.enqueueOutbox({
        outboxId: this.newId("dtout"),
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        twinId: input.twinId,
        eventType: "engineering.digital_twin.state.published",
        payload: statePublishedEventPayload(updated),
        published: false,
        createdAt: now,
      });
      await this.appendTimeline({
        twinId: input.twinId,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        eventType: "state_published",
        entityType: "twin_state",
        entityId: input.stateId,
        summary: "State published",
        refs: { stateId: input.stateId },
        actorId: input.reviewerId,
      });
    }
    return { instance: transitioned, state: updated };
  }

  async publishState(input: {
    tenantId: string;
    workspaceId: string;
    twinId: string;
    stateId: string;
    instance: EngineeringWorkflowInstance;
    reviewerId: string;
  }): Promise<TwinState> {
    const { state } = await this.transitionStateReview({
      ...input,
      action: "publish",
      to: "published",
    });
    return state;
  }

  async supersedeState(input: {
    tenantId: string;
    workspaceId: string;
    twinId: string;
    stateId: string;
    supersededByStateId: string;
    actorId?: string;
  }): Promise<TwinState> {
    assertScope(input.tenantId, input.workspaceId);
    const state = await this.requireState(input.tenantId, input.workspaceId, input.stateId);
    if (state.lifecycle !== "published") throw new Error("supersede_requires_published_state");
    const successor = await this.requireState(
      input.tenantId,
      input.workspaceId,
      input.supersededByStateId,
    );
    if (successor.twinId !== input.twinId) throw new Error("successor_twin_mismatch");

    const now = new Date().toISOString();
    const updated: TwinState = {
      ...state,
      lifecycle: "superseded",
      supersededAt: now,
      supersededByStateId: input.supersededByStateId,
      updatedAt: now,
    };
    await this.repository.saveState(updated);
    await this.appendTimeline({
      twinId: input.twinId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      eventType: "state_superseded",
      entityType: "twin_state",
      entityId: input.stateId,
      summary: "State superseded",
      refs: { stateId: input.stateId, supersededByStateId: input.supersededByStateId },
      actorId: input.actorId,
    });
    await this.repository.enqueueOutbox({
      outboxId: this.newId("dtout"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId: input.twinId,
      eventType: "engineering.digital_twin.state.superseded",
      payload: stateSupersededEventPayload({
        state: updated,
        supersededByStateId: input.supersededByStateId,
      }),
      published: false,
      createdAt: now,
    });
    return updated;
  }

  async attachRepresentationVersion(
    input: AttachRepresentationVersionInput,
  ): Promise<RepresentationVersion> {
    assertScope(input.tenantId, input.workspaceId);
    await this.requireTwin(input.tenantId, input.workspaceId, input.twinId);
    assertProvenanceRequired({
      sourceModule: input.sourceSystem,
      sourceRef: input.sourceRef,
      capturedAt: input.effectiveDate,
    });

    const existing = await this.repository.listRepresentationVersions(
      input.tenantId,
      input.workspaceId,
      input.twinId,
    );
    assertRepresentationAppendOnly(existing, input);

    const now = new Date().toISOString();
    const version: RepresentationVersion = {
      representationVersionId: this.newId("dtrepv"),
      twinId: input.twinId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      representationType: input.representationType,
      sourceSystem: input.sourceSystem,
      sourceRef: input.sourceRef,
      revision: input.revision,
      effectiveDate: input.effectiveDate,
      fidelityLevel: input.fidelityLevel,
      coordinateSystem: input.coordinateSystem,
      units: input.units,
      createdAt: now,
      createdBy: input.createdBy,
      storesGeometryPayload: false,
      viewerEnabled: false,
      liveTelemetryBound: false,
      overwritesHistoricalVersion: false,
    };
    await this.repository.saveRepresentationVersion(version);
    await this.appendTimeline({
      twinId: input.twinId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      eventType: "representation_updated",
      entityType: "representation_version",
      entityId: version.representationVersionId,
      summary: `Representation version ${input.revision}`,
      refs: {
        representationVersionId: version.representationVersionId,
        revision: input.revision,
      },
      actorId: input.createdBy,
    });
    return version;
  }

  async createSnapshot(input: CreateSnapshotInput): Promise<TwinStateSnapshot> {
    assertScope(input.tenantId, input.workspaceId);
    await this.requireTwin(input.tenantId, input.workspaceId, input.twinId);

    const stateVersionRefs: TwinStateSnapshot["stateVersionRefs"] = [];
    for (const stateId of input.stateIds) {
      const state = await this.requireState(input.tenantId, input.workspaceId, stateId);
      if (state.twinId !== input.twinId) throw new Error("snapshot_state_twin_mismatch");
      if (state.lifecycle !== "published") throw new Error("snapshot_requires_published_state");
      const versions = await this.repository.listStateVersions(
        input.tenantId,
        input.workspaceId,
        stateId,
      );
      const latest = versions.sort((a, b) => b.versionNumber - a.versionNumber)[0];
      if (!latest) throw new Error("snapshot_state_version_missing");
      stateVersionRefs.push({
        stateId,
        stateVersionId: latest.stateVersionId,
        versionNumber: latest.versionNumber,
      });
    }

    const now = new Date().toISOString();
    const snapshot: TwinStateSnapshot = {
      snapshotId: this.newId("dtsnap"),
      twinId: input.twinId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      stateVersionRefs,
      representationVersionIds: input.representationVersionIds,
      label: input.label,
      createdAt: now,
      createdBy: input.createdBy,
      storesTelemetryPayload: false,
    };
    assertSnapshotNoTelemetry(snapshot);
    await this.repository.saveSnapshot(snapshot);
    await this.repository.enqueueOutbox({
      outboxId: this.newId("dtout"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId: input.twinId,
      eventType: "engineering.digital_twin.snapshot.updated",
      payload: snapshotUpdatedEventPayload(snapshot),
      published: false,
      createdAt: now,
    });
    return snapshot;
  }

  async listHistory(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<TwinStateHistory> {
    assertScope(tenantId, workspaceId);
    const [states, versions, snapshots, representationVersions, timeline] = await Promise.all([
      this.repository.listStates(tenantId, workspaceId, twinId),
      this.repository.listStateVersionsForTwin(tenantId, workspaceId, twinId),
      this.repository.listSnapshots(tenantId, workspaceId, twinId),
      this.repository.listRepresentationVersions(tenantId, workspaceId, twinId),
      this.repository.listTimelineEvents(tenantId, workspaceId, twinId),
    ]);
    return { states, versions, snapshots, representationVersions, timeline };
  }

  private async appendTimeline(input: {
    twinId: string;
    tenantId: string;
    workspaceId: string;
    eventType: "state_created" | "state_reviewed" | "state_published" | "state_superseded" | "representation_updated";
    entityType: "twin_state" | "representation_version" | "twin_snapshot";
    entityId: string;
    summary: string;
    refs: Record<string, string>;
    actorId?: string;
  }): Promise<void> {
    await this.repository.appendTimelineEvent(
      createTwinTimelineEvent({
        eventId: this.newId("dttime"),
        twinId: input.twinId,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        eventType: input.eventType,
        entityType: input.entityType,
        entityId: input.entityId,
        recordedAt: new Date().toISOString(),
        actorId: input.actorId,
        summary: input.summary,
        refs: input.refs,
      }),
    );
  }

  private async requireTwin(tenantId: string, workspaceId: string, twinId: string): Promise<void> {
    const identity = await this.repository.getIdentityById(tenantId, workspaceId, twinId);
    if (!identity) throw new Error("twin_identity_not_found");
  }

  private async requireState(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<TwinState> {
    const state = await this.repository.getStateById(tenantId, workspaceId, stateId);
    if (!state) throw new Error("twin_state_not_found");
    return state;
  }
}

export function createDigitalTwinStateEngine(deps: DigitalTwinStateEngineDeps): DigitalTwinStateEngine {
  return new DigitalTwinStateEngine(deps);
}

export function assertStateForbiddenCapabilities(): {
  ok: true;
  runtimeImplemented: false;
  liveTelemetryImplemented: false;
  simulationImplemented: false;
  threeDViewerImplemented: false;
  physicalActuationEnabled: false;
} {
  if (DIGITAL_TWIN_RUNTIME_IMPLEMENTED) {
    throw new Error("digital_twin_runtime_forbidden_in_phase_12c");
  }
  if (LIVE_TELEMETRY_IMPLEMENTED) {
    throw new Error("live_telemetry_forbidden_in_phase_12c");
  }
  if (SIMULATION_EXECUTION_IMPLEMENTED) {
    throw new Error("simulation_execution_forbidden_in_phase_12c");
  }
  if (THREE_D_VIEWER_IMPLEMENTED) {
    throw new Error("three_d_viewer_forbidden_in_phase_12c");
  }
  if (PHYSICAL_ACTUATION_ENABLED) {
    throw new Error("physical_actuation_forbidden_in_phase_12c");
  }
  return {
    ok: true,
    runtimeImplemented: false,
    liveTelemetryImplemented: false,
    simulationImplemented: false,
    threeDViewerImplemented: false,
    physicalActuationEnabled: false,
  };
}

function assertScope(tenantId: string, workspaceId: string): void {
  if (!tenantId || !workspaceId) {
    throw new Error("tenant_and_workspace_required");
  }
}
