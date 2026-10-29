/**
 * Phase 12D — DigitalTwinStateIngestionEngine.
 *
 * Governed observed-state ingestion: validate → candidate → reconcile → review (no auto-publish).
 * MUST NOT: fabricate, overwrite published history, SHM, sim, ML, actuation, mutate canonical identity.
 */

import type { EngineeringWorkflowInstance } from "@rtb/engineering-os";
import { assertOwnershipLock } from "../architecture/ownership-lock";
import {
  AUTOMATIC_OBSERVED_STATE_PUBLICATION_ENABLED,
  HIGH_FREQUENCY_TELEMETRY_IMPLEMENTED,
  LIVE_TELEMETRY_IMPLEMENTED,
  SHM_RUNTIME_IMPLEMENTED,
  NATIVE_ENGINEERING_SOLVER_IMPLEMENTED,
} from "../version";
import {
  stateCandidateReceivedPayload,
  stateCandidateRejectedPayload,
  stateCandidateValidatedPayload,
  stateConflictDetectedPayload,
} from "./ingestion-events";
import type {
  ObservedTwinStateCandidate,
  ObservedCandidateLifecycle,
} from "./observed-state-candidate";
import {
  assertCandidateIsObserved,
  assertCandidateNotPublished,
} from "./observed-state-candidate";
import type { DigitalTwinRepositoryPort } from "./persistence";
import {
  authorityAllowsCandidateAccept,
  DEFAULT_SOURCE_AUTHORITY_POLICY,
  resolveAuthorityRule,
} from "./source-authority";
import {
  assertAdapterCertified,
  assertAdapterSupportsSchema,
  getSourceAdapter,
} from "./source-adapter";
import {
  assertFreshnessAcceptable,
  evaluateSourceFreshness,
} from "./source-freshness";
import {
  createTwinStateReconciliationEngine,
  assertReconciliationAllowsReview,
  type TwinStateReconciliationRecord,
} from "./state-reconciliation";
import { createTwinStateSchemaRegistry } from "./state-schema-registry";
import type { DigitalTwinStateEngine } from "./state-engine";
import {
  startCandidateStateReview,
  transitionCandidateStateReview,
  assertReviewPublishable,
  type CandidateReviewAction,
  type CandidateReviewTargetState,
} from "./review-workflow";
import { assertQuantitativeUnits } from "./unit-governance";
import { assertIngestionForbiddenCapabilities } from "./twin-engine";

export type SubmitObservedStateInput = {
  tenantId: string;
  workspaceId: string;
  twinId: string;
  adapterId: string;
  schemaId: string;
  externalRef: string;
  idempotencyKey: string;
  observedAt: string;
  payload: Record<string, unknown>;
  provenance: {
    sourceModule: string;
    sourceRef: string;
    capturedAt: string;
  };
  unitSystem?: string;
  unitCode?: string;
  conversionMethod?: string;
  confidence?: number;
  evidenceRefs?: string[];
  createdBy?: string;
};

export type IngestionResult = {
  candidate: ObservedTwinStateCandidate;
  reconciliation: TwinStateReconciliationRecord;
  review?: { instance: EngineeringWorkflowInstance };
  replayDetected?: boolean;
};

export type DigitalTwinStateIngestionEngineDeps = {
  repository: DigitalTwinRepositoryPort;
  stateEngine: DigitalTwinStateEngine;
  newId?: (prefix: string) => string;
};

export class DigitalTwinStateIngestionEngine {
  readonly kind = "digital_twin_state_ingestion_engine" as const;
  private readonly repository: DigitalTwinRepositoryPort;
  private readonly stateEngine: DigitalTwinStateEngine;
  private readonly newId: (prefix: string) => string;
  private readonly schemaRegistry = createTwinStateSchemaRegistry();
  private readonly reconciliationEngine = createTwinStateReconciliationEngine();

  constructor(deps: DigitalTwinStateIngestionEngineDeps) {
    assertIngestionForbiddenCapabilities();
    assertOwnershipLock();
    this.repository = deps.repository;
    this.stateEngine = deps.stateEngine;
    this.newId = deps.newId ?? deps.repository.newId.bind(deps.repository);
  }

  async ingestObservedState(input: SubmitObservedStateInput): Promise<IngestionResult> {
    assertScope(input.tenantId, input.workspaceId);
    if (AUTOMATIC_OBSERVED_STATE_PUBLICATION_ENABLED) {
      throw new Error("automatic_observed_state_publication_forbidden");
    }
    if ("telemetryPayload" in input.payload || "sensorData" in input.payload) {
      throw new Error("ingestion_telemetry_payload_forbidden");
    }

    const adapter = getSourceAdapter(input.adapterId);
    if (!adapter) throw new Error(`source_adapter_not_found:${input.adapterId}`);
    assertAdapterCertified(adapter);
    assertAdapterSupportsSchema(adapter, input.schemaId);

    const identity = await this.repository.getIdentityById(
      input.tenantId,
      input.workspaceId,
      input.twinId,
    );
    if (!identity) throw new Error("twin_identity_not_found");

    const existingIdempotency = await this.repository.getIngestionIdempotency(
      input.tenantId,
      input.workspaceId,
      input.idempotencyKey,
    );
    if (existingIdempotency) {
      const candidate = await this.repository.getStateCandidateById(
        input.tenantId,
        input.workspaceId,
        existingIdempotency.candidateId,
      );
      if (!candidate) throw new Error("idempotency_candidate_missing");
      const reconciliation = await this.repository.getStateReconciliationByCandidate(
        input.tenantId,
        input.workspaceId,
        candidate.candidateId,
      );
      if (!reconciliation) throw new Error("idempotency_reconciliation_missing");
      return { candidate, reconciliation, replayDetected: true };
    }

    this.schemaRegistry.validatePayload(input.schemaId, input.payload);
    const schema = this.schemaRegistry.assertSchemaRegistered(input.schemaId);
    const hasQuantitative = schema.fields.some(
      (f) => f.quantitative && f.name in input.payload && input.payload[f.name] != null,
    );
    const unitGovernance = assertQuantitativeUnits({
      hasQuantitativeValue: hasQuantitative,
      unitSystem: input.unitSystem,
      unitCode: input.unitCode,
    });

    const freshness = evaluateSourceFreshness({ observedAt: input.observedAt });
    assertFreshnessAcceptable(freshness);

    const authorityRule = resolveAuthorityRule(DEFAULT_SOURCE_AUTHORITY_POLICY, adapter.sourceType);
    if (!authorityAllowsCandidateAccept(authorityRule)) {
      throw new Error(`source_authority_insufficient:${adapter.sourceType}`);
    }

    const now = new Date().toISOString();
    const candidate: ObservedTwinStateCandidate = {
      candidateId: this.newId("dtcand"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId: input.twinId,
      adapterId: input.adapterId,
      schemaId: input.schemaId,
      schemaVersion: schema.schemaVersion,
      category: "observed",
      lifecycle: "received",
      externalRef: input.externalRef,
      idempotencyKey: input.idempotencyKey,
      observedAt: input.observedAt,
      receivedAt: now,
      freshness,
      payload: input.payload,
      provenance: input.provenance,
      unitGovernance,
      confidence: input.confidence,
      evidenceRefs: input.evidenceRefs ?? [],
      createdBy: input.createdBy,
      updatedAt: now,
      storesTelemetryPayload: false,
      autoPublishAttempted: false,
      simulationExecuted: false,
      liveIngestionEnabled: false,
    };
    assertCandidateIsObserved(candidate);
    await this.repository.saveStateCandidate(candidate);
    await this.repository.saveIngestionIdempotency({
      idempotencyId: this.newId("dtidem"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      idempotencyKey: input.idempotencyKey,
      candidateId: candidate.candidateId,
      createdAt: now,
    });
    await this.enqueueIngestionEvent({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId: input.twinId,
      eventType: "engineering.digital_twin.state_candidate.received",
      payload: stateCandidateReceivedPayload(candidate),
    });

    const validated: ObservedTwinStateCandidate = {
      ...candidate,
      lifecycle: "validated",
      updatedAt: new Date().toISOString(),
    };
    await this.repository.saveStateCandidate(validated);
    await this.enqueueIngestionEvent({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId: input.twinId,
      eventType: "engineering.digital_twin.state_candidate.validated",
      payload: stateCandidateValidatedPayload(validated),
    });

    const publishedStates = await this.repository.listStates(
      input.tenantId,
      input.workspaceId,
      input.twinId,
    );
    const reconciliation = this.reconciliationEngine.reconcile(
      {
        candidate: validated,
        publishedStates,
        authorityAllowsAutoAccept: false,
      },
      this.newId,
    );
    await this.repository.saveStateReconciliation(reconciliation);

    const reconciledCandidate: ObservedTwinStateCandidate = {
      ...validated,
      lifecycle: reconciliation.outcome === "rejected" ? "rejected" : "reconciled",
      reconciliationId: reconciliation.reconciliationId,
      updatedAt: new Date().toISOString(),
    };
    await this.repository.saveStateCandidate(reconciledCandidate);

    if (reconciliation.outcome === "rejected") {
      await this.enqueueIngestionEvent({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        twinId: input.twinId,
        eventType: "engineering.digital_twin.state_candidate.rejected",
        payload: stateCandidateRejectedPayload({
          candidate: reconciledCandidate,
          reason: reconciliation.notes ?? reconciliation.outcome,
        }),
      });
      return { candidate: reconciledCandidate, reconciliation };
    }

    if (reconciliation.outcome === "conflicting") {
      await this.enqueueIngestionEvent({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        twinId: input.twinId,
        eventType: "engineering.digital_twin.state.conflict_detected",
        payload: stateConflictDetectedPayload({
          candidate: reconciledCandidate,
          reconciliation,
        }),
      });
    }

    assertReconciliationAllowsReview(reconciliation);
    const { instance } = startCandidateStateReview({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId: input.twinId,
      candidateId: reconciledCandidate.candidateId,
      startedBy: input.createdBy,
    });
    const pendingReview: ObservedTwinStateCandidate = {
      ...reconciledCandidate,
      lifecycle: "pending_review",
      reviewWorkflowInstanceId: instance.instanceId,
      updatedAt: new Date().toISOString(),
    };
    await this.repository.saveStateCandidate(pendingReview);

    return { candidate: pendingReview, reconciliation, review: { instance } };
  }

  async publishCandidateViaReview(input: {
    tenantId: string;
    workspaceId: string;
    twinId: string;
    candidateId: string;
    instance: EngineeringWorkflowInstance;
    action: CandidateReviewAction;
    to: CandidateReviewTargetState;
    reviewerId: string;
  }): Promise<{ candidate: ObservedTwinStateCandidate; stateId?: string }> {
    assertScope(input.tenantId, input.workspaceId);
    if (input.to === "published" && AUTOMATIC_OBSERVED_STATE_PUBLICATION_ENABLED) {
      throw new Error("automatic_observed_state_publication_forbidden");
    }

    const candidate = await this.requireCandidate(
      input.tenantId,
      input.workspaceId,
      input.candidateId,
    );
    assertCandidateNotPublished(candidate);
    if (candidate.twinId !== input.twinId) throw new Error("candidate_twin_mismatch");

    if (input.to !== "published") {
      const transitioned = transitionCandidateStateReview({
        instance: input.instance,
        action: input.action,
        to: input.to,
      });
      void transitioned;
      const updated: ObservedTwinStateCandidate = {
        ...candidate,
        lifecycle: input.to === "rejected" ? "rejected" : candidate.lifecycle,
        updatedAt: new Date().toISOString(),
      };
      await this.repository.saveStateCandidate(updated);
      if (input.to === "rejected") {
        await this.enqueueIngestionEvent({
          tenantId: input.tenantId,
          workspaceId: input.workspaceId,
          twinId: input.twinId,
          eventType: "engineering.digital_twin.state_candidate.rejected",
          payload: stateCandidateRejectedPayload({ candidate: updated, reason: "review_rejected" }),
        });
      }
      return { candidate: updated };
    }

    assertReviewPublishable({
      workflowState: input.instance.state,
      reviewerId: input.reviewerId,
      createdBy: candidate.createdBy,
    });

    const state = await this.stateEngine.createState({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId: input.twinId,
      category: "observed",
      externalRef: candidate.externalRef,
      provenance: candidate.provenance,
      confidence: candidate.confidence,
      evidenceRefs: candidate.evidenceRefs,
      createdBy: candidate.createdBy,
    });

    const { instance: reviewInstance } = await this.stateEngine.submitStateReview({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId: input.twinId,
      stateId: state.stateId,
      startedBy: input.reviewerId,
    });

    const approved = await this.stateEngine.transitionStateReview({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId: input.twinId,
      stateId: state.stateId,
      instance: reviewInstance,
      action: "approve",
      to: "approved",
      reviewerId: input.reviewerId,
    });

    const published = await this.stateEngine.publishState({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId: input.twinId,
      stateId: state.stateId,
      instance: approved.instance,
      reviewerId: input.reviewerId,
    });

    await this.stateEngine.createSnapshot({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId: input.twinId,
      stateIds: [published.stateId],
      label: `ingestion:${candidate.candidateId}`,
      createdBy: input.reviewerId,
    });

    const publishedCandidate: ObservedTwinStateCandidate = {
      ...candidate,
      lifecycle: "published" as ObservedCandidateLifecycle,
      publishedStateId: published.stateId,
      updatedAt: new Date().toISOString(),
    };
    await this.repository.saveStateCandidate(publishedCandidate);

    return { candidate: publishedCandidate, stateId: published.stateId };
  }

  async getCandidate(
    tenantId: string,
    workspaceId: string,
    candidateId: string,
  ): Promise<ObservedTwinStateCandidate | null> {
    return this.repository.getStateCandidateById(tenantId, workspaceId, candidateId);
  }

  async getReconciliation(
    tenantId: string,
    workspaceId: string,
    candidateId: string,
  ): Promise<TwinStateReconciliationRecord | null> {
    return this.repository.getStateReconciliationByCandidate(tenantId, workspaceId, candidateId);
  }

  async transitionCandidateReview(input: {
    tenantId: string;
    workspaceId: string;
    twinId: string;
    candidateId: string;
    instance: EngineeringWorkflowInstance;
    action: CandidateReviewAction;
    to: CandidateReviewTargetState;
  }): Promise<{ instance: EngineeringWorkflowInstance; candidate: ObservedTwinStateCandidate }> {
    assertScope(input.tenantId, input.workspaceId);
    const candidate = await this.requireCandidate(
      input.tenantId,
      input.workspaceId,
      input.candidateId,
    );
    const transitioned = transitionCandidateStateReview({
      instance: input.instance,
      action: input.action,
      to: input.to,
    });
    const updated: ObservedTwinStateCandidate = {
      ...candidate,
      lifecycle:
        input.to === "rejected"
          ? "rejected"
          : input.to === "pending_review"
            ? "pending_review"
            : candidate.lifecycle,
      updatedAt: new Date().toISOString(),
    };
    await this.repository.saveStateCandidate(updated);
    return { instance: transitioned, candidate: updated };
  }

  private async requireCandidate(
    tenantId: string,
    workspaceId: string,
    candidateId: string,
  ): Promise<ObservedTwinStateCandidate> {
    const candidate = await this.repository.getStateCandidateById(tenantId, workspaceId, candidateId);
    if (!candidate) throw new Error("state_candidate_not_found");
    return candidate;
  }

  private async enqueueIngestionEvent(input: {
    tenantId: string;
    workspaceId: string;
    twinId: string;
    eventType: string;
    payload: Record<string, unknown>;
  }): Promise<void> {
    await this.repository.enqueueOutbox({
      outboxId: this.newId("dtout"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      twinId: input.twinId,
      eventType: input.eventType,
      payload: input.payload,
      published: false,
      createdAt: new Date().toISOString(),
    });
  }
}

export function createDigitalTwinStateIngestionEngine(
  deps: DigitalTwinStateIngestionEngineDeps,
): DigitalTwinStateIngestionEngine {
  return new DigitalTwinStateIngestionEngine(deps);
}

export function assertIngestionRuntimeBounded(): {
  ok: true;
  digitalTwinRuntimeImplemented: true;
  automaticObservedStatePublicationEnabled: false;
  liveTelemetryImplemented: true;
  highFrequencyTelemetryImplemented: false;
  shmRuntimeImplemented: false;
  nativeEngineeringSolverImplemented: false;
  simulationExecutionImplemented: true;
} {
  if (AUTOMATIC_OBSERVED_STATE_PUBLICATION_ENABLED) {
    throw new Error("automatic_observed_state_publication_forbidden");
  }
  if (!LIVE_TELEMETRY_IMPLEMENTED) {
    throw new Error("bounded_live_telemetry_binding_required_in_phase_12e");
  }
  if (HIGH_FREQUENCY_TELEMETRY_IMPLEMENTED) {
    throw new Error("high_frequency_telemetry_forbidden_in_phase_12e");
  }
  if (SHM_RUNTIME_IMPLEMENTED) {
    throw new Error("shm_runtime_forbidden_in_phase_12e");
  }
  if (NATIVE_ENGINEERING_SOLVER_IMPLEMENTED) {
    throw new Error("native_engineering_solver_forbidden");
  }
  return {
    ok: true,
    digitalTwinRuntimeImplemented: true,
    automaticObservedStatePublicationEnabled: false,
    liveTelemetryImplemented: true,
    highFrequencyTelemetryImplemented: false,
    shmRuntimeImplemented: false,
    nativeEngineeringSolverImplemented: false,
    simulationExecutionImplemented: true,
  };
}

function assertScope(tenantId: string, workspaceId: string): void {
  if (!tenantId || !workspaceId) {
    throw new Error("tenant_and_workspace_required");
  }
}
