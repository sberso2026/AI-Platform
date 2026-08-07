/**
 * Phase 10C — Asset Intelligence Engine.
 * Orchestrates condition, criticality, review, and Health Composition Engine.
 * Scoring math lives in HealthCompositionEngine — not inline here or on Health Index.
 */

import type { Provenance } from "../architecture/identity-state";
import { assertOwnershipLock } from "../architecture/ownership-lock";
import {
  assessCriticality,
  type AssetCriticalityStateRecord,
} from "./criticality";
import {
  createHealthCompositionEngine,
  type HealthCompositionEngine,
} from "./health-composer";
import type { AssetHealthIndexState } from "./health-index";
import {
  createEvidenceConfidenceEngine,
  type EvidenceConfidenceEngine,
} from "./evidence-confidence";
import { assessReliability, type AssetReliabilityStateRecord } from "./reliability";
import {
  createAssetFailureIntelligenceEngine,
  type AssetFailureIntelligenceEngine,
} from "./failure-engine";
import {
  createAssetTrendIntelligenceEngine,
  type AssetTrendIntelligenceEngine,
} from "./degradation-engine";
import {
  createLifecycleContextEngine,
  type LifecycleContextEngine,
} from "./lifecycle-engine";
import { createEngineeringTimeSeries } from "./time-series";
import type { FailureAssessmentBundle } from "./failure";
import type { TrendDegradationBundle } from "./degradation";
import type { AssetLifecycleReference, MaintenanceState, OperatingState } from "./lifecycle-reference";
import {
  createInMemorySharedDomainIdentityPort,
  type SharedDomainAssetIdentityPort,
} from "./identity-port";
import {
  assertIiPublicContractConsumption,
  toConditionIngestFromPublicSummary,
  type IiConditionIngestInput,
} from "./ii-consumption";
import {
  createAssetIntelligenceEvent,
  type AssetIntelligenceEventPublishPort,
} from "./events";
import {
  startCriticalityReview,
  transitionCriticalityReview,
  startReliabilityReview,
  startFailureReview,
  transitionFailureReview,
  startDegradationReview,
  transitionDegradationReview,
  startLifecycleReview,
  transitionLifecycleReview,
} from "./review-workflow";
import { composeAssetSnapshot, type AssetSnapshot } from "./snapshot";
import { assertRegisteredActiveSource } from "./source-registry";
import { createTimelineEntry, type IntelligenceTimelineEntry } from "./timeline";
import {
  assertFailureCapability,
  type FailureIntelligenceRole,
} from "./role-matrix";
import type { EngineeringWorkflowInstance } from "@rtb/engineering-os";
import type {
  AssetIntelligenceRepositoryPort,
  PersistedConditionState,
  PersistedCriticalityState,
  PersistedDegradationState,
  PersistedFailureModeState,
  PersistedHealthIndexState,
  PersistedLifecycleIntelligenceState,
  PersistedLifecycleTransitionCandidate,
  PersistedReliabilityState,
  PersistedTrendState,
} from "./persistence";

export type AssessConditionCommand = {
  tenantId: string;
  workspaceId: string;
  assetId: string;
  sourceKey?: string;
  ii: IiConditionIngestInput;
  correlationId?: string;
  recordedAt?: string;
  idempotencyKey?: string;
  expectedVersion?: number;
  createdBy?: string;
  status?: PersistedConditionState["status"];
};

export type AssessCriticalityCommand = {
  tenantId: string;
  workspaceId: string;
  assetId: string;
  sourceKey?: string;
  criticalityRating?: string;
  safetyCriticality?: string;
  productionCriticality?: string;
  environmentalCriticality?: string;
  financialCriticality?: string;
  operationalCriticality?: string;
  regulatoryCriticality?: string;
  criticalityMethod?: string;
  criticalityConfidence?: number;
  evidenceRefs?: string[];
  observedAt?: string;
  startReview?: boolean;
  reviewedBy?: string;
  correlationId?: string;
  recordedAt?: string;
  idempotencyKey?: string;
  expectedVersion?: number;
  createdBy?: string;
  status?: PersistedCriticalityState["status"];
};

export type ReviewCriticalityCommand = {
  tenantId: string;
  workspaceId: string;
  assetId: string;
  criticalityStateId: string;
  workflowInstance: EngineeringWorkflowInstance;
  action: "approve" | "reject" | "request_changes" | "resubmit";
  to: "approved" | "rejected" | "changes_requested" | "pending_review";
  reviewerId?: string;
  correlationId?: string;
  recordedAt?: string;
};

export type EngineAssessResult = {
  identityOwner: "engineering_os_shared_domain";
  condition: PersistedConditionState;
  healthIndex: PersistedHealthIndexState;
  timelineEntries: IntelligenceTimelineEntry[];
  snapshot: AssetSnapshot;
  snapshotId: string;
  outboxEventId: string;
  identityMutated: false;
  idempotentReplay?: boolean;
  healthComposedBy: "health_composition_engine";
};

export type EngineCriticalityResult = {
  identityOwner: "engineering_os_shared_domain";
  criticality: PersistedCriticalityState;
  healthIndex: PersistedHealthIndexState;
  timelineEntries: IntelligenceTimelineEntry[];
  snapshot: AssetSnapshot;
  snapshotId: string;
  outboxEventId: string;
  reviewInstanceId?: string;
  reviewWorkflowInstance?: EngineeringWorkflowInstance;
  identityMutated: false;
  idempotentReplay?: boolean;
  healthComposedBy: "health_composition_engine";
};

export type EngineReviewResult = {
  identityOwner: "engineering_os_shared_domain";
  criticality: PersistedCriticalityState;
  workflowInstance: EngineeringWorkflowInstance;
  healthIndex: PersistedHealthIndexState;
  timelineEntries: IntelligenceTimelineEntry[];
  snapshot: AssetSnapshot;
  identityMutated: false;
  healthComposedBy: "health_composition_engine";
};

export type AssessReliabilityCommand = {
  tenantId: string;
  workspaceId: string;
  assetId: string;
  sourceKey?: string;
  assessmentType?: AssetReliabilityStateRecord["assessmentType"];
  reliabilityClass?: string;
  reliabilityScore?: number;
  reliabilityConfidence?: number;
  reliabilityMethod?: string;
  evidenceWindow?: string;
  operatingWindow?: string;
  evidenceRefs?: string[];
  inspectionRefs?: string[];
  failureHistoryRefs?: string[];
  observedAt?: string;
  startReview?: boolean;
  correlationId?: string;
  recordedAt?: string;
  idempotencyKey?: string;
  expectedVersion?: number;
  createdBy?: string;
};

export type EngineReliabilityResult = {
  identityOwner: "engineering_os_shared_domain";
  reliability: PersistedReliabilityState;
  evidenceConfidence: import("./evidence-confidence").EvidenceConfidenceAssessment;
  healthIndex: PersistedHealthIndexState;
  healthProfileId?: string;
  timelineEntries: IntelligenceTimelineEntry[];
  snapshot: AssetSnapshot;
  snapshotId: string;
  outboxEventId: string;
  reviewInstanceId?: string;
  reviewWorkflowInstance?: EngineeringWorkflowInstance;
  identityMutated: false;
  idempotentReplay?: boolean;
  healthComposedBy: "health_composition_engine";
  quantitativeReliabilityCertified: false;
  probabilityOfFailureCertified: false;
  rulClaimsCertified: false;
};

export type AssessFailureCommand = {
  tenantId: string;
  workspaceId: string;
  assetId: string;
  sourceKey?: string;
  failureModeCode: string;
  mechanismCode?: string;
  causeCode?: string;
  causeClassification?: import("./failure").CauseClassification;
  effectCode?: string;
  effectKind?: import("./failure").AssetFailureEffectState["effectKind"];
  consequenceCode?: string;
  consequenceDimensions?: import("./failure").AssetFailureConsequenceState["dimensions"];
  detectionMethodCode?: string;
  evidenceRefs?: string[];
  sourceRefs?: string[];
  alternativeCauses?: string[];
  observedAt?: string;
  startReview?: boolean;
  correlationId?: string;
  recordedAt?: string;
  idempotencyKey?: string;
  expectedVersion?: number;
  createdBy?: string;
  actorRole?: FailureIntelligenceRole;
};

export type EngineFailureResult = {
  identityOwner: "engineering_os_shared_domain";
  bundle: FailureAssessmentBundle;
  failureMode: PersistedFailureModeState;
  evidenceConfidence: import("./evidence-confidence").EvidenceConfidenceAssessment;
  timelineEntries: IntelligenceTimelineEntry[];
  snapshot: AssetSnapshot;
  snapshotId: string;
  outboxEventId: string;
  reviewInstanceId?: string;
  reviewWorkflowInstance?: EngineeringWorkflowInstance;
  identityMutated: false;
  idempotentReplay?: boolean;
  /** Failure does not mutate Health Index in Phase 10E. */
  healthMutated: false;
  failureHealthContributionEnabled: false;
  probabilityOfFailureCertified: false;
  accuracyClaimsCertified: false;
  rulClaimsCertified: false;
  aiMayPublishForbidden: true;
};

export type ReviewFailureCommand = {
  tenantId: string;
  workspaceId: string;
  assetId: string;
  failureModeStateId: string;
  workflowInstance: EngineeringWorkflowInstance;
  action: "approve" | "reject" | "request_changes" | "resubmit";
  to: "approved" | "rejected" | "changes_requested" | "pending_review";
  reviewerId: string;
  reason?: string;
  correlationId?: string;
  recordedAt?: string;
  publish?: boolean;
  actorRole?: FailureIntelligenceRole;
};

export type AssessDegradationCommand = {
  tenantId: string;
  workspaceId: string;
  assetId: string;
  sourceKey?: string;
  attributeKey: string;
  attributeLabel?: string;
  unit: string;
  orientation?: import("./time-series").TimeSeriesOrientation;
  points: import("./time-series").EngineeringTimeSeriesPoint[];
  evidenceRefs?: string[];
  relatedFailureModeCodes?: string[];
  mechanismContext?: string;
  observedAt?: string;
  startReview?: boolean;
  correlationId?: string;
  recordedAt?: string;
  idempotencyKey?: string;
  expectedSeriesVersion?: number;
  expectedTrendVersion?: number;
  expectedDegradationVersion?: number;
  createdBy?: string;
  actorRole?: FailureIntelligenceRole;
};

export type EngineDegradationResult = {
  identityOwner: "engineering_os_shared_domain";
  bundle: TrendDegradationBundle;
  trend: PersistedTrendState;
  degradation: PersistedDegradationState;
  timelineEntries: IntelligenceTimelineEntry[];
  snapshot: AssetSnapshot;
  snapshotId: string;
  outboxEventId: string;
  reviewInstanceId?: string;
  reviewWorkflowInstance?: EngineeringWorkflowInstance;
  identityMutated: false;
  idempotentReplay?: boolean;
  healthMutated: false;
  degradationHealthContributionEnabled: false;
  predictiveMlUsed: false;
  probabilityOfFailureCertified: false;
  rulClaimsCertified: false;
  accuracyClaimsCertified: false;
  aiMayPublishForbidden: true;
};

export type ReviewDegradationCommand = {
  tenantId: string;
  workspaceId: string;
  assetId: string;
  degradationStateId: string;
  workflowInstance: EngineeringWorkflowInstance;
  action: "approve" | "reject" | "request_changes" | "resubmit";
  to: "approved" | "rejected" | "changes_requested" | "pending_review";
  reviewerId: string;
  reason?: string;
  correlationId?: string;
  recordedAt?: string;
  publish?: boolean;
  actorRole?: FailureIntelligenceRole;
};

export type AssessLifecycleCommand = {
  tenantId: string;
  workspaceId: string;
  assetId: string;
  sourceKey?: string;
  /** Read-only canonical lifecycle reference from Shared Domain — required. */
  canonicalLifecycle: AssetLifecycleReference;
  /** Optimistic check against the canonical reference's stageVersion (not our own version). */
  expectedCanonicalLifecycleVersion?: number;
  operatingState?: OperatingState;
  maintenanceState?: MaintenanceState;
  commissionedAt?: string;
  designLifeReference?: string;
  evidenceRefs?: string[];
  observedAt?: string;
  startReview?: boolean;
  correlationId?: string;
  recordedAt?: string;
  idempotencyKey?: string;
  expectedVersion?: number;
  createdBy?: string;
  actorRole?: FailureIntelligenceRole;
};

export type EngineLifecycleResult = {
  identityOwner: "engineering_os_shared_domain";
  lifecycle: PersistedLifecycleIntelligenceState;
  transitionCandidates: PersistedLifecycleTransitionCandidate[];
  evidenceConfidence: import("./evidence-confidence").EvidenceConfidenceAssessment;
  timelineEntries: IntelligenceTimelineEntry[];
  snapshot: AssetSnapshot;
  snapshotId: string;
  outboxEventId: string;
  reviewInstanceId?: string;
  reviewWorkflowInstance?: EngineeringWorkflowInstance;
  identityMutated: false;
  idempotentReplay?: boolean;
  healthMutated: false;
  lifecycleHealthContributionEnabled: false;
  mutatesCanonicalLifecycle: false;
  predictiveMlUsed: false;
  probabilityOfFailureCertified: false;
  rulClaimsCertified: false;
  accuracyClaimsCertified: false;
  aiMayPublishForbidden: true;
};

export type ReviewLifecycleCommand = {
  tenantId: string;
  workspaceId: string;
  assetId: string;
  lifecycleStateId: string;
  workflowInstance: EngineeringWorkflowInstance;
  action: "approve" | "reject" | "request_changes" | "resubmit";
  to: "approved" | "rejected" | "changes_requested" | "pending_review";
  reviewerId: string;
  reason?: string;
  correlationId?: string;
  recordedAt?: string;
  publish?: boolean;
  actorRole?: FailureIntelligenceRole;
};

export type AssetIntelligenceEngineDeps = {
  identityPort: SharedDomainAssetIdentityPort;
  repository: AssetIntelligenceRepositoryPort;
  events: AssetIntelligenceEventPublishPort;
  healthComposer?: HealthCompositionEngine;
  evidenceConfidenceEngine?: EvidenceConfidenceEngine;
  failureIntelligenceEngine?: AssetFailureIntelligenceEngine;
  trendIntelligenceEngine?: AssetTrendIntelligenceEngine;
  lifecycleContextEngine?: LifecycleContextEngine;
};

export class AssetIntelligenceEngine {
  private readonly healthComposer: HealthCompositionEngine;
  private readonly evidenceConfidenceEngine: EvidenceConfidenceEngine;
  private readonly failureIntelligence: AssetFailureIntelligenceEngine;
  private readonly trendIntelligence: AssetTrendIntelligenceEngine;
  private readonly lifecycleContextEngine: LifecycleContextEngine;

  constructor(private readonly deps: AssetIntelligenceEngineDeps) {
    assertOwnershipLock();
    assertIiPublicContractConsumption();
    this.healthComposer = deps.healthComposer ?? createHealthCompositionEngine();
    this.evidenceConfidenceEngine =
      deps.evidenceConfidenceEngine ?? createEvidenceConfidenceEngine();
    this.failureIntelligence =
      deps.failureIntelligenceEngine ??
      createAssetFailureIntelligenceEngine({
        evidenceConfidenceEngine: this.evidenceConfidenceEngine,
        newId: (p) => this.deps.repository.newId(p),
      });
    this.trendIntelligence =
      deps.trendIntelligenceEngine ??
      createAssetTrendIntelligenceEngine({
        newId: (p) => this.deps.repository.newId(p),
      });
    this.lifecycleContextEngine =
      deps.lifecycleContextEngine ??
      createLifecycleContextEngine({
        newId: (p) => this.deps.repository.newId(p),
      });
  }

  private async resolveIdentity(cmd: {
    tenantId: string;
    workspaceId: string;
    assetId: string;
  }) {
    const identity = await this.deps.identityPort.resolve(cmd);
    if (!identity) throw new Error("shared_domain_identity_not_found");
    if (identity.owner !== "engineering_os_shared_domain") {
      throw new Error("identity_owner_must_be_shared_domain");
    }
    if (identity.assetId !== cmd.assetId) throw new Error("identity_asset_id_mismatch");
    return identity;
  }

  private async composeAndPersistHealth(input: {
    tenantId: string;
    workspaceId: string;
    assetId: string;
    recordedAt: string;
    provenance: Provenance;
    sourceKeys: string[];
    compositionMethod?: import("./health-composer").HealthCompositionMethod;
  }): Promise<PersistedHealthIndexState> {
    const condition = await this.deps.repository.latestCondition(
      input.tenantId,
      input.workspaceId,
      input.assetId,
      input.recordedAt,
    );
    const criticality = await this.deps.repository.latestCriticality(
      input.tenantId,
      input.workspaceId,
      input.assetId,
      input.recordedAt,
    );
    const reliability = await this.deps.repository.latestReliability(
      input.tenantId,
      input.workspaceId,
      input.assetId,
      input.recordedAt,
    );

    const evidenceRefs = [
      ...(condition?.provenance.evidenceRefs ?? []),
      ...(reliability?.sourceRefs ?? []),
      ...(reliability?.inspectionRefs ?? []),
    ];
    const evidence = this.evidenceConfidenceEngine.assess({
          assessmentId: this.deps.repository.newId("ec"),
          assetId: input.assetId,
          tenantId: input.tenantId,
          workspaceId: input.workspaceId,
          scope: "health_composition",
          evidenceRefs,
          sourceKeys: input.sourceKeys,
          observedAt: condition?.provenance.observedAt ?? input.provenance.observedAt,
          asOf: input.recordedAt,
          reviewStatus: reliability?.reviewStatus ?? criticality?.reviewStatus,
          confidenceHint: condition?.conditionConfidence,
        });
    await this.deps.repository.saveEvidenceConfidence({
      ...evidence,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      version: 1,
    });

    const composed = this.healthComposer.compose({
      assetId: input.assetId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      stateId: this.deps.repository.newId("health"),
      profileId: this.deps.repository.newId("hprof"),
      recordedAt: input.recordedAt,
      provenance: input.provenance,
      compositionMethod: input.compositionMethod,
      sourceKeys: input.sourceKeys,
      evidenceConfidence: evidence,
      condition: condition
        ? {
            rating: condition.conditionRating,
            index: condition.conditionIndex,
            confidence: condition.conditionConfidence,
            trend: condition.conditionTrend,
            stateId: condition.stateId,
            evidenceRefs: condition.provenance.evidenceRefs,
            observedAt: condition.provenance.observedAt,
          }
        : undefined,
      criticality: criticality
        ? {
            rating: criticality.criticalityRating,
            confidence: criticality.criticalityConfidence,
            stateId: criticality.stateId,
            reviewStatus: criticality.reviewStatus,
            evidenceRefs: criticality.provenance.evidenceRefs,
          }
        : undefined,
      reliability: reliability
        ? {
            rating: reliability.reliabilityClass,
            continuity: reliability.reliabilityScore,
            confidence: reliability.reliabilityConfidence,
            stateId: reliability.stateId,
            reviewStatus: reliability.reviewStatus,
            evidenceRefs: reliability.sourceRefs,
            evidenceSufficient:
              reliability.evidenceConfidence?.dataSufficiency === "sufficient" ||
              reliability.evidenceConfidence?.dataSufficiency === "limited",
          }
        : undefined,
    });

    const healthIndexState = composed.healthIndex;
    const prior = await this.deps.repository.latestHealthIndex(
      input.tenantId,
      input.workspaceId,
      input.assetId,
    );
    const persisted: PersistedHealthIndexState = {
      ...healthIndexState,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      version: (prior?.version ?? 0) + 1,
    };
    await this.deps.repository.saveHealthIndex(persisted);
    await this.deps.repository.saveHealthProfile({
      ...composed.healthProfile,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      version: (prior?.version ?? 0) + 1,
    });
    return persisted;
  }

  /**
   * Transactional condition flow with Health Composition Engine.
   */
  async assessConditionFromInspection(cmd: AssessConditionCommand): Promise<EngineAssessResult> {
    const sourceKey = cmd.sourceKey ?? "inspection_intelligence.public_contracts";
    assertRegisteredActiveSource(sourceKey, "condition");

    if (cmd.idempotencyKey) {
      const existing = await this.deps.repository.findIdempotency(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.idempotencyKey,
      );
      if (existing?.responsePayload?.result) {
        return {
          ...(existing.responsePayload.result as EngineAssessResult),
          idempotentReplay: true,
        };
      }
    }

    const identity = await this.resolveIdentity(cmd);
    const ii = toConditionIngestFromPublicSummary(cmd.ii);
    if (ii.assetReference.identity.assetId !== cmd.assetId) {
      throw new Error("ii_asset_reference_mismatch");
    }

    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const version = await this.deps.repository.nextConditionVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      cmd.expectedVersion,
    );

    const provenance: Provenance = {
      sourceSystem: sourceKey,
      observedAt: ii.observedAt,
      method: ii.conditionMethod ?? "ii_public_condition_summary",
      confidence: ii.conditionConfidence,
      evidenceRefs: [
        ...(ii.evidenceRefs ?? []),
        ...(ii.conditionRatingId ? [`ii.conditionRating:${ii.conditionRatingId}`] : []),
        ...(ii.observationIds?.map((id) => `ii.observation:${id}`) ?? []),
        ...(ii.sessionId ? [`ii.session:${ii.sessionId}`] : []),
      ],
      reviewedBy: ii.reviewedBy,
      approvedAt: ii.approvedAt,
      policyId: "asset_intelligence.condition.ingest.v1",
    };

    const status = cmd.status ?? (ii.approvedAt ? "published" : "observed");
    const condition: PersistedConditionState = {
      kind: "condition",
      assetId: cmd.assetId,
      stateId: this.deps.repository.newId("cond"),
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      version,
      status,
      sourceType: "inspection",
      sourceReference: ii.conditionRatingId
        ? `ii.conditionRating:${ii.conditionRatingId}`
        : ii.sessionId
          ? `ii.session:${ii.sessionId}`
          : undefined,
      recordedAt,
      provenance,
      silentIdentityMutationForbidden: true,
      conditionRating: ii.conditionRating,
      conditionIndex: ii.conditionIndex,
      conditionConfidence: ii.conditionConfidence,
      conditionTrend: ii.conditionTrend,
      conditionSource: sourceKey,
      observedAt: ii.observedAt,
      calculatedAt:
        status === "calculated" || status === "reviewed" || status === "published"
          ? recordedAt
          : undefined,
      reviewedAt:
        status === "reviewed" || status === "published"
          ? (ii.approvedAt ?? recordedAt)
          : undefined,
      publishedAt: status === "published" ? recordedAt : undefined,
      createdBy: cmd.createdBy,
    };

    await this.deps.repository.saveCondition(condition);
    await this.deps.repository.cacheIdentity(identity);
    await this.deps.repository.registerSourceProvenance({
      id: this.deps.repository.newId("src"),
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      sourceKey,
      sourceType: "inspection",
      contractFamily: "ii.public_module_contracts",
      contractVersion: "1.0.0",
      ownership: "inspection_intelligence",
      createdAt: recordedAt,
      metadata: { evidenceRefs: provenance.evidenceRefs },
    });

    assertRegisteredActiveSource(sourceKey, "health_index");
    const healthIndex = await this.composeAndPersistHealth({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      recordedAt,
      provenance: { ...provenance, method: "health_composition_engine" },
      sourceKeys: [sourceKey],
    });

    const timelineEntries = await this.appendStateTimelines({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      recordedAt,
      sourceKey,
      provenance,
      correlationId: cmd.correlationId,
      items: [
        { kind: "condition", stateId: condition.stateId },
        { kind: "health_index", stateId: healthIndex.stateId },
      ],
    });

    const snapshot = composeAssetSnapshot({
      identity,
      asOf: recordedAt,
      condition,
      healthIndex,
      criticality: await this.deps.repository.latestCriticality(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.assetId,
        recordedAt,
      ),
    });
    const snapshotId = this.deps.repository.newId("snap");
    await this.deps.repository.saveSnapshot({
      id: snapshotId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      schemaVersion: "asset_snapshot/1",
      capturedAt: recordedAt,
      conditionStateId: condition.stateId,
      healthIndex,
      identityReference: identity,
      sourceSet: [sourceKey],
      timelinePosition: timelineEntries[timelineEntries.length - 1]?.entryId,
      snapshot,
    });

    const outboxEventId = this.deps.repository.newId("outbox");
    await this.deps.repository.appendOutbox({
      id: outboxEventId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      eventType: "engineering.asset.condition.updated",
      payload: {
        sourceKey,
        kind: "condition",
        status: condition.status,
        version: condition.version,
        silentIdentityMutationForbidden: true,
        rawEvidenceForbidden: true,
        secretsForbidden: true,
      },
      correlationId: cmd.correlationId,
      stateId: condition.stateId,
      published: false,
      createdAt: recordedAt,
    });

    const conditionEvent = createAssetIntelligenceEvent({
      type: "engineering.asset.condition.updated",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: condition.stateId,
      occurredAt: recordedAt,
      correlationId: cmd.correlationId,
      payload: { sourceKey, kind: "condition", status: condition.status },
    });
    await this.deps.events.publish(conditionEvent);
    await this.deps.repository.appendEvent(conditionEvent);
    await this.deps.repository.markOutboxPublished(outboxEventId, recordedAt);

    const healthEvent = createAssetIntelligenceEvent({
      type: "engineering.asset.health_index.updated",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: healthIndex.stateId,
      occurredAt: recordedAt,
      correlationId: cmd.correlationId,
      payload: { sourceKey, kind: "health_index", status: healthIndex.status },
    });
    await this.deps.events.publish(healthEvent);
    await this.deps.repository.appendEvent(healthEvent);

    const result: EngineAssessResult = {
      identityOwner: "engineering_os_shared_domain",
      condition,
      healthIndex,
      timelineEntries,
      snapshot,
      snapshotId,
      outboxEventId,
      identityMutated: false,
      healthComposedBy: "health_composition_engine",
    };

    if (cmd.idempotencyKey) {
      await this.deps.repository.saveIdempotency({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        idempotencyKey: cmd.idempotencyKey,
        operation: "assess_condition_from_inspection",
        resourceId: condition.stateId,
        responsePayload: { result },
      });
    }

    return result;
  }

  async assessCriticality(cmd: AssessCriticalityCommand): Promise<EngineCriticalityResult> {
    const sourceKey = cmd.sourceKey ?? "manual.engineering_assessment";
    assertRegisteredActiveSource(sourceKey, "criticality");

    if (cmd.idempotencyKey) {
      const existing = await this.deps.repository.findIdempotency(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.idempotencyKey,
      );
      if (existing?.responsePayload?.result) {
        return {
          ...(existing.responsePayload.result as EngineCriticalityResult),
          idempotentReplay: true,
        };
      }
    }

    const identity = await this.resolveIdentity(cmd);
    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const version = await this.deps.repository.nextCriticalityVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      cmd.expectedVersion,
    );

    const provenance: Provenance = {
      sourceSystem: sourceKey,
      observedAt: cmd.observedAt ?? recordedAt,
      method: cmd.criticalityMethod ?? "governed_criticality_v1",
      confidence: cmd.criticalityConfidence,
      evidenceRefs: cmd.evidenceRefs ?? [],
      reviewedBy: cmd.reviewedBy,
      policyId: "asset_intelligence.criticality.assess.v1",
    };

    const assessed: AssetCriticalityStateRecord = assessCriticality({
      assetId: cmd.assetId,
      stateId: this.deps.repository.newId("crit"),
      recordedAt,
      provenance,
      criticalityRating: cmd.criticalityRating,
      safetyCriticality: cmd.safetyCriticality,
      productionCriticality: cmd.productionCriticality,
      environmentalCriticality: cmd.environmentalCriticality,
      financialCriticality: cmd.financialCriticality,
      operationalCriticality: cmd.operationalCriticality,
      regulatoryCriticality: cmd.regulatoryCriticality,
      criticalityMethod: cmd.criticalityMethod,
      criticalityConfidence: cmd.criticalityConfidence,
      reviewStatus: cmd.startReview === false ? "draft" : "pending_review",
    });

    let reviewInstanceId: string | undefined;
    let reviewWorkflowInstance: EngineeringWorkflowInstance | undefined;
    if (cmd.startReview !== false && assessed.criticalityRating) {
      const review = startCriticalityReview({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        criticalityStateId: assessed.stateId,
        startedBy: cmd.createdBy ?? cmd.reviewedBy,
      });
      reviewInstanceId = review.instance.instanceId;
      reviewWorkflowInstance = review.instance;
      assessed.reviewInstanceId = reviewInstanceId;
      assessed.reviewStatus = "pending_review";
    }

    const status = cmd.status ?? (assessed.reviewStatus === "approved" ? "published" : "calculated");
    const criticality: PersistedCriticalityState = {
      ...assessed,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      version,
      status,
      sourceType: "manual_engineering_assessment",
      sourceReference: assessed.stateId,
      createdBy: cmd.createdBy,
    };

    await this.deps.repository.saveCriticality(criticality);
    await this.deps.repository.cacheIdentity(identity);
    await this.deps.repository.registerSourceProvenance({
      id: this.deps.repository.newId("src"),
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      sourceKey,
      sourceType: "manual_engineering_assessment",
      ownership: "asset_intelligence",
      createdAt: recordedAt,
      metadata: { reviewInstanceId },
    });

    const healthIndex = await this.composeAndPersistHealth({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      recordedAt,
      provenance: { ...provenance, method: "health_composition_engine" },
      sourceKeys: [sourceKey, "inspection_intelligence.public_contracts"],
    });

    const timelineEntries = await this.appendStateTimelines({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      recordedAt,
      sourceKey,
      provenance,
      correlationId: cmd.correlationId,
      items: [
        { kind: "criticality", stateId: criticality.stateId },
        { kind: "health_index", stateId: healthIndex.stateId },
      ],
    });

    const condition = await this.deps.repository.latestCondition(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      recordedAt,
    );
    const snapshot = composeAssetSnapshot({
      identity,
      asOf: recordedAt,
      condition,
      healthIndex,
      criticality,
    });
    const snapshotId = this.deps.repository.newId("snap");
    await this.deps.repository.saveSnapshot({
      id: snapshotId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      schemaVersion: "asset_snapshot/1",
      capturedAt: recordedAt,
      conditionStateId: condition?.stateId,
      healthIndex,
      identityReference: identity,
      sourceSet: [sourceKey],
      timelinePosition: timelineEntries[timelineEntries.length - 1]?.entryId,
      snapshot,
    });

    const outboxEventId = this.deps.repository.newId("outbox");
    await this.deps.repository.appendOutbox({
      id: outboxEventId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      eventType: "engineering.asset.criticality.updated",
      payload: {
        sourceKey,
        kind: "criticality",
        status: criticality.status,
        version: criticality.version,
        silentIdentityMutationForbidden: true,
        rawEvidenceForbidden: true,
        secretsForbidden: true,
      },
      correlationId: cmd.correlationId,
      stateId: criticality.stateId,
      published: false,
      createdAt: recordedAt,
    });

    const critEvent = createAssetIntelligenceEvent({
      type: "engineering.asset.criticality.updated",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: criticality.stateId,
      occurredAt: recordedAt,
      correlationId: cmd.correlationId,
      payload: { sourceKey, kind: "criticality", status: criticality.reviewStatus },
    });
    await this.deps.events.publish(critEvent);
    await this.deps.repository.appendEvent(critEvent);
    await this.deps.repository.markOutboxPublished(outboxEventId, recordedAt);

    const healthEvent = createAssetIntelligenceEvent({
      type: "engineering.asset.health_index.updated",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: healthIndex.stateId,
      occurredAt: recordedAt,
      correlationId: cmd.correlationId,
      payload: { sourceKey, kind: "health_index", status: healthIndex.status },
    });
    await this.deps.events.publish(healthEvent);
    await this.deps.repository.appendEvent(healthEvent);

    const result: EngineCriticalityResult = {
      identityOwner: "engineering_os_shared_domain",
      criticality,
      healthIndex,
      timelineEntries,
      snapshot,
      snapshotId,
      outboxEventId,
      reviewInstanceId,
      reviewWorkflowInstance,
      identityMutated: false,
      healthComposedBy: "health_composition_engine",
    };

    if (cmd.idempotencyKey) {
      await this.deps.repository.saveIdempotency({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        idempotencyKey: cmd.idempotencyKey,
        operation: "assess_criticality",
        resourceId: criticality.stateId,
        responsePayload: { result },
      });
    }

    return result;
  }

  async reviewCriticality(cmd: ReviewCriticalityCommand): Promise<EngineReviewResult> {
    const identity = await this.resolveIdentity(cmd);
    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const current = await this.deps.repository.latestCriticality(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
    );
    if (!current || current.stateId !== cmd.criticalityStateId) {
      throw new Error("criticality_state_not_found");
    }

    const workflowInstance = transitionCriticalityReview({
      instance: cmd.workflowInstance,
      action: cmd.action,
      to: cmd.to,
    });

    const reviewStatus =
      cmd.to === "approved"
        ? "approved"
        : cmd.to === "rejected"
          ? "rejected"
          : cmd.to === "changes_requested"
            ? "changes_requested"
            : "pending_review";

    const version = await this.deps.repository.nextCriticalityVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
    );
    const criticality: PersistedCriticalityState = {
      ...current,
      stateId: this.deps.repository.newId("crit"),
      version,
      supersedesId: current.stateId,
      recordedAt,
      reviewStatus,
      status: reviewStatus === "approved" ? "published" : "reviewed",
      reviewedAt: recordedAt,
      publishedAt: reviewStatus === "approved" ? recordedAt : undefined,
      provenance: {
        ...current.provenance,
        reviewedBy: cmd.reviewerId ?? current.provenance.reviewedBy,
        approvedAt: reviewStatus === "approved" ? recordedAt : current.provenance.approvedAt,
      },
      reviewInstanceId: workflowInstance.instanceId,
    } as PersistedCriticalityState;

    await this.deps.repository.saveCriticality(criticality);

    const healthIndex = await this.composeAndPersistHealth({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      recordedAt,
      provenance: {
        sourceSystem: "asset_intelligence.review",
        observedAt: recordedAt,
        method: "health_composition_engine",
        reviewedBy: cmd.reviewerId,
      },
      sourceKeys: ["asset_intelligence.review", "manual.engineering_assessment"],
    });

    const timelineEntries = await this.appendStateTimelines({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      recordedAt,
      sourceKey: "asset_intelligence.review",
      provenance: criticality.provenance,
      correlationId: cmd.correlationId,
      items: [
        { kind: "criticality", stateId: criticality.stateId },
        { kind: "health_index", stateId: healthIndex.stateId },
      ],
    });

    const condition = await this.deps.repository.latestCondition(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      recordedAt,
    );
    const snapshot = composeAssetSnapshot({
      identity,
      asOf: recordedAt,
      condition,
      healthIndex,
      criticality,
    });
    await this.deps.repository.saveSnapshot({
      id: this.deps.repository.newId("snap"),
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      schemaVersion: "asset_snapshot/1",
      capturedAt: recordedAt,
      conditionStateId: condition?.stateId,
      healthIndex,
      identityReference: identity,
      sourceSet: ["asset_intelligence.review"],
      timelinePosition: timelineEntries[timelineEntries.length - 1]?.entryId,
      snapshot,
    });

    const reviewEvent = createAssetIntelligenceEvent({
      type: "engineering.asset.criticality.reviewed",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: criticality.stateId,
      occurredAt: recordedAt,
      correlationId: cmd.correlationId,
      payload: { kind: "criticality", status: reviewStatus },
    });
    await this.deps.events.publish(reviewEvent);
    await this.deps.repository.appendEvent(reviewEvent);

    return {
      identityOwner: "engineering_os_shared_domain",
      criticality,
      workflowInstance,
      healthIndex,
      timelineEntries,
      snapshot,
      identityMutated: false,
      healthComposedBy: "health_composition_engine",
    };
  }

  async assessReliability(cmd: AssessReliabilityCommand): Promise<EngineReliabilityResult> {
    const sourceKey = cmd.sourceKey ?? "manual.engineering_assessment";
    assertRegisteredActiveSource(sourceKey, "reliability");

    if (cmd.idempotencyKey) {
      const existing = await this.deps.repository.findIdempotency(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.idempotencyKey,
      );
      if (existing?.responsePayload?.result) {
        return {
          ...(existing.responsePayload.result as EngineReliabilityResult),
          idempotentReplay: true,
        };
      }
    }

    const identity = await this.resolveIdentity(cmd);
    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const evidenceRefs = [
      ...(cmd.evidenceRefs ?? []),
      ...(cmd.inspectionRefs ?? []),
      ...(cmd.failureHistoryRefs ?? []),
    ];
    const evidenceConfidence = this.evidenceConfidenceEngine.assess({
      assessmentId: this.deps.repository.newId("ec"),
      assetId: cmd.assetId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      scope: "reliability",
      evidenceRefs,
      sourceKeys: [sourceKey],
      observedAt: cmd.observedAt ?? recordedAt,
      asOf: recordedAt,
      confidenceHint: cmd.reliabilityConfidence,
    });
    await this.deps.repository.saveEvidenceConfidence({
      ...evidenceConfidence,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      version: 1,
    });

    const version = await this.deps.repository.nextReliabilityVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      cmd.expectedVersion,
    );

    const assessed = assessReliability({
      assetId: cmd.assetId,
      stateId: this.deps.repository.newId("rel"),
      recordedAt,
      provenance: {
        sourceSystem: sourceKey,
        observedAt: cmd.observedAt ?? recordedAt,
        method: cmd.reliabilityMethod ?? "governed_reliability_v1",
        confidence: cmd.reliabilityConfidence,
        evidenceRefs,
        policyId: "asset_intelligence.reliability.assess.v1",
      },
      assessmentType: cmd.assessmentType ?? "qualitative",
      reliabilityClass: cmd.reliabilityClass,
      reliabilityScore:
        cmd.assessmentType === "qualitative" ? undefined : cmd.reliabilityScore,
      reliabilityConfidence: cmd.reliabilityConfidence,
      reliabilityMethod: cmd.reliabilityMethod,
      evidenceWindow: cmd.evidenceWindow,
      operatingWindow: cmd.operatingWindow,
      sourceRefs: cmd.evidenceRefs,
      inspectionRefs: cmd.inspectionRefs,
      failureHistoryRefs: cmd.failureHistoryRefs,
      evidenceConfidence,
      reviewStatus: cmd.startReview === false ? "draft" : "pending_review",
    });

    let reviewInstanceId: string | undefined;
    let reviewWorkflowInstance: EngineeringWorkflowInstance | undefined;
    if (cmd.startReview !== false && assessed.reliabilityClass) {
      const review = startReliabilityReview({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        reliabilityStateId: assessed.stateId,
        startedBy: cmd.createdBy,
      });
      reviewInstanceId = review.instance.instanceId;
      reviewWorkflowInstance = review.instance;
      assessed.reviewInstanceId = reviewInstanceId;
      assessed.reviewStatus = "pending_review";
    }

    const reliability: PersistedReliabilityState = {
      ...assessed,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      version,
      status: assessed.reviewStatus === "published" ? "published" : "calculated",
      sourceType: "manual_engineering_assessment",
      createdBy: cmd.createdBy,
    };
    await this.deps.repository.saveReliability(reliability);
    await this.deps.repository.cacheIdentity(identity);

    const healthIndex = await this.composeAndPersistHealth({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      recordedAt,
      provenance: {
        sourceSystem: sourceKey,
        observedAt: recordedAt,
        method: "health_composition_engine",
      },
      sourceKeys: [sourceKey, "inspection_intelligence.public_contracts"],
    });

    const profile = await this.deps.repository.latestHealthProfile(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
    );

    const timelineEntries = await this.appendStateTimelines({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      recordedAt,
      sourceKey,
      provenance: reliability.provenance,
      correlationId: cmd.correlationId,
      items: [
        { kind: "reliability", stateId: reliability.stateId },
        { kind: "health_index", stateId: healthIndex.stateId },
      ],
    });

    const condition = await this.deps.repository.latestCondition(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      recordedAt,
    );
    const criticality = await this.deps.repository.latestCriticality(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      recordedAt,
    );
    const snapshot = composeAssetSnapshot({
      identity,
      asOf: recordedAt,
      condition,
      healthIndex,
      criticality,
    });
    const snapshotId = this.deps.repository.newId("snap");
    await this.deps.repository.saveSnapshot({
      id: snapshotId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      schemaVersion: "asset_snapshot/1",
      capturedAt: recordedAt,
      conditionStateId: condition?.stateId,
      healthIndex,
      identityReference: identity,
      sourceSet: [sourceKey],
      timelinePosition: timelineEntries[timelineEntries.length - 1]?.entryId,
      snapshot,
    });

    const outboxEventId = this.deps.repository.newId("outbox");
    await this.deps.repository.appendOutbox({
      id: outboxEventId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      eventType: "engineering.asset.reliability.assessed",
      payload: {
        sourceKey,
        kind: "reliability",
        status: reliability.reviewStatus,
        version: reliability.version,
        silentIdentityMutationForbidden: true,
        rawEvidenceForbidden: true,
        secretsForbidden: true,
      },
      correlationId: cmd.correlationId,
      stateId: reliability.stateId,
      published: false,
      createdAt: recordedAt,
    });

    for (const type of [
      "engineering.asset.reliability.assessed",
      "engineering.asset.evidence_confidence.assessed",
      "engineering.asset.health.composed",
    ] as const) {
      const ev = createAssetIntelligenceEvent({
        type,
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        assetId: cmd.assetId,
        stateId: reliability.stateId,
        occurredAt: recordedAt,
        correlationId: cmd.correlationId,
        payload: { sourceKey, kind: type.includes("health") ? "health_index" : "reliability" },
      });
      await this.deps.events.publish(ev);
      await this.deps.repository.appendEvent(ev);
    }
    await this.deps.repository.markOutboxPublished(outboxEventId, recordedAt);

    const result: EngineReliabilityResult = {
      identityOwner: "engineering_os_shared_domain",
      reliability,
      evidenceConfidence,
      healthIndex,
      healthProfileId: profile?.profileId,
      timelineEntries,
      snapshot,
      snapshotId,
      outboxEventId,
      reviewInstanceId,
      reviewWorkflowInstance,
      identityMutated: false,
      healthComposedBy: "health_composition_engine",
      quantitativeReliabilityCertified: false,
      probabilityOfFailureCertified: false,
      rulClaimsCertified: false,
    };

    if (cmd.idempotencyKey) {
      await this.deps.repository.saveIdempotency({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        idempotencyKey: cmd.idempotencyKey,
        operation: "assess_reliability",
        resourceId: reliability.stateId,
        responsePayload: { result },
      });
    }

    return result;
  }

  async assessFailure(cmd: AssessFailureCommand): Promise<EngineFailureResult> {
    if (cmd.actorRole) {
      assertFailureCapability(cmd.actorRole, "failure.assess");
    }

    const sourceKey = cmd.sourceKey ?? "manual.engineering_assessment";
    assertRegisteredActiveSource(sourceKey, "failure");

    if (cmd.idempotencyKey) {
      const existing = await this.deps.repository.findIdempotency(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.idempotencyKey,
      );
      if (existing?.responsePayload?.result) {
        return {
          ...(existing.responsePayload.result as EngineFailureResult),
          idempotentReplay: true,
        };
      }
    }

    const identity = await this.resolveIdentity(cmd);
    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const evidenceRefs = cmd.evidenceRefs ?? [];

    const evidenceConfidence = this.evidenceConfidenceEngine.assess({
      assessmentId: this.deps.repository.newId("ec"),
      assetId: cmd.assetId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      scope: "failure_intelligence",
      evidenceRefs,
      sourceKeys: [sourceKey],
      observedAt: cmd.observedAt ?? recordedAt,
      asOf: recordedAt,
    });
    await this.deps.repository.saveEvidenceConfidence({
      ...evidenceConfidence,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      version: 1,
    });

    const version = await this.deps.repository.nextFailureModeVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      cmd.expectedVersion,
    );

    const bundle = this.failureIntelligence.assess({
      assetId: cmd.assetId,
      recordedAt,
      provenance: {
        sourceSystem: sourceKey,
        observedAt: cmd.observedAt ?? recordedAt,
        method: "governed_failure_intelligence_v1",
        evidenceRefs,
        policyId: "asset_intelligence.failure.assess.v1",
      },
      failureModeCode: cmd.failureModeCode,
      mechanismCode: cmd.mechanismCode,
      causeCode: cmd.causeCode,
      causeClassification: cmd.causeClassification,
      effectCode: cmd.effectCode,
      effectKind: cmd.effectKind,
      consequenceCode: cmd.consequenceCode,
      consequenceDimensions: cmd.consequenceDimensions,
      detectionMethodCode: cmd.detectionMethodCode,
      evidenceRefs,
      sourceRefs: cmd.sourceRefs ?? [sourceKey],
      evidenceConfidence,
      alternativeCauses: cmd.alternativeCauses,
      startReview: cmd.startReview,
    });

    let reviewInstanceId: string | undefined;
    let reviewWorkflowInstance: EngineeringWorkflowInstance | undefined;
    if (!bundle.abstained && cmd.startReview !== false) {
      const review = startFailureReview({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        failureModeStateId: bundle.failureMode.stateId,
        startedBy: cmd.createdBy,
      });
      reviewInstanceId = review.instance.instanceId;
      reviewWorkflowInstance = review.instance;
      bundle.failureMode.reviewInstanceId = reviewInstanceId;
      bundle.failureMode.reviewStatus = "pending_review";
      bundle.failureMode.status = "pending_review";
    }

    const failureMode: PersistedFailureModeState = {
      ...bundle.failureMode,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      version,
      sourceType: "manual_engineering_assessment",
      createdBy: cmd.createdBy,
    };
    await this.deps.repository.saveFailureMode(failureMode);

    if (bundle.mechanism) {
      await this.deps.repository.saveFailureMechanism({
        ...bundle.mechanism,
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        version: 1,
        failureModeStateId: failureMode.stateId,
      });
    }
    if (bundle.cause) {
      await this.deps.repository.saveFailureCause({
        ...bundle.cause,
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        version: 1,
        failureModeStateId: failureMode.stateId,
      });
    }
    if (bundle.effect) {
      await this.deps.repository.saveFailureEffect({
        ...bundle.effect,
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        version: 1,
        failureModeStateId: failureMode.stateId,
      });
    }
    if (bundle.consequence) {
      await this.deps.repository.saveFailureConsequence({
        ...bundle.consequence,
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        version: 1,
        failureModeStateId: failureMode.stateId,
      });
    }
    for (const rel of bundle.relationships) {
      await this.deps.repository.saveFailureRelationship({
        ...rel,
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        assetId: cmd.assetId,
        failureModeStateId: failureMode.stateId,
      });
    }

    await this.deps.repository.cacheIdentity(identity);

    const timelineItems: Array<{
      kind: IntelligenceTimelineEntry["kind"];
      stateId: string;
    }> = [{ kind: "failure_mode", stateId: failureMode.stateId }];
    if (bundle.mechanism) {
      timelineItems.push({ kind: "failure_mechanism", stateId: bundle.mechanism.stateId });
    }
    if (bundle.cause) {
      timelineItems.push({ kind: "failure_cause", stateId: bundle.cause.stateId });
    }

    const timelineEntries = await this.appendStateTimelines({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      recordedAt,
      sourceKey,
      provenance: failureMode.provenance,
      correlationId: cmd.correlationId,
      items: timelineItems,
    });

    const condition = await this.deps.repository.latestCondition(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      recordedAt,
    );
    const criticality = await this.deps.repository.latestCriticality(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      recordedAt,
    );
    const healthIndex = await this.deps.repository.latestHealthIndex(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      recordedAt,
    );
    const snapshot = composeAssetSnapshot({
      identity,
      asOf: recordedAt,
      condition,
      healthIndex,
      criticality,
      failureModes: [failureMode],
      failureMechanisms: bundle.mechanism ? [bundle.mechanism] : undefined,
      evidenceConfidence,
    });
    const snapshotId = this.deps.repository.newId("snap");
    await this.deps.repository.saveSnapshot({
      id: snapshotId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      schemaVersion: "asset_snapshot/1",
      capturedAt: recordedAt,
      conditionStateId: condition?.stateId,
      healthIndex,
      identityReference: identity,
      sourceSet: [sourceKey],
      timelinePosition: timelineEntries[timelineEntries.length - 1]?.entryId,
      snapshot,
    });

    const outboxEventId = this.deps.repository.newId("outbox");
    await this.deps.repository.appendOutbox({
      id: outboxEventId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      eventType: "engineering.asset.failure_mode.assessed",
      payload: {
        sourceKey,
        kind: "failure_mode",
        status: failureMode.reviewStatus,
        silentIdentityMutationForbidden: true,
        rawEvidenceForbidden: true,
        secretsForbidden: true,
      },
      correlationId: cmd.correlationId,
      stateId: failureMode.stateId,
      published: false,
      createdAt: recordedAt,
    });

    const eventTypes: Array<import("./events").AssetIntelligenceEventType> = [
      "engineering.asset.failure_mode.assessed",
      "engineering.asset.evidence_confidence.assessed",
    ];
    if (bundle.mechanism) eventTypes.push("engineering.asset.failure_mechanism.assessed");
    if (bundle.cause) eventTypes.push("engineering.asset.failure_cause.proposed");

    for (const type of eventTypes) {
      const ev = createAssetIntelligenceEvent({
        type,
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        assetId: cmd.assetId,
        stateId: failureMode.stateId,
        occurredAt: recordedAt,
        correlationId: cmd.correlationId,
        payload: { sourceKey, kind: "failure_mode", status: failureMode.reviewStatus },
      });
      await this.deps.events.publish(ev);
      await this.deps.repository.appendEvent(ev);
    }
    await this.deps.repository.markOutboxPublished(outboxEventId, recordedAt);

    const result: EngineFailureResult = {
      identityOwner: "engineering_os_shared_domain",
      bundle,
      failureMode,
      evidenceConfidence,
      timelineEntries,
      snapshot,
      snapshotId,
      outboxEventId,
      reviewInstanceId,
      reviewWorkflowInstance,
      identityMutated: false,
      healthMutated: false,
      failureHealthContributionEnabled: false,
      probabilityOfFailureCertified: false,
      accuracyClaimsCertified: false,
      rulClaimsCertified: false,
      aiMayPublishForbidden: true,
    };

    if (cmd.idempotencyKey) {
      await this.deps.repository.saveIdempotency({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        idempotencyKey: cmd.idempotencyKey,
        operation: "assess_failure",
        resourceId: failureMode.stateId,
        responsePayload: { result },
      });
    }

    return result;
  }

  async reviewFailure(cmd: ReviewFailureCommand): Promise<{
    failureMode: PersistedFailureModeState;
    workflowInstance: EngineeringWorkflowInstance;
    identityMutated: false;
    healthMutated: false;
    aiMayPublishForbidden: true;
  }> {
    const capability =
      cmd.action === "approve"
        ? "failure.approve"
        : cmd.publish
          ? "failure.publish"
          : "failure.review";
    if (cmd.actorRole) {
      assertFailureCapability(cmd.actorRole, capability, {
        actorId: cmd.reviewerId,
      });
    }

    const latest = await this.deps.repository.latestFailureMode(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
    );
    if (!latest || latest.stateId !== cmd.failureModeStateId) {
      throw new Error("failure_mode_state_not_found");
    }
    if (latest.reviewStatus === "published") {
      throw new Error("published_failure_immutable");
    }

    const workflowInstance = transitionFailureReview({
      instance: cmd.workflowInstance,
      action: cmd.action,
      to: cmd.to,
    });

    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const nextStatus =
      cmd.publish && cmd.to === "approved" ? "published" : cmd.to;
    const version = await this.deps.repository.nextFailureModeVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      latest.version,
    );

    const failureMode: PersistedFailureModeState = {
      ...latest,
      stateId: this.deps.repository.newId("fmode"),
      version,
      reviewStatus: nextStatus,
      status: nextStatus,
      reviewedAt: recordedAt,
      publishedAt: nextStatus === "published" ? recordedAt : latest.publishedAt,
      supersedesId: latest.stateId,
      provenance: {
        ...latest.provenance,
        reviewedBy: cmd.reviewerId,
        approvedAt: cmd.to === "approved" ? recordedAt : undefined,
      },
    };
    await this.deps.repository.saveFailureMode(failureMode);
    await this.deps.repository.saveFailureReview({
      reviewId: this.deps.repository.newId("frev"),
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      failureModeStateId: failureMode.stateId,
      reviewInstanceId: workflowInstance.instanceId,
      action: cmd.action,
      reviewerId: cmd.reviewerId,
      reason: cmd.reason,
      stateVersion: version,
      taxonomyVersion: failureMode.taxonomyVersion,
      evidenceConfidenceRef: failureMode.evidenceConfidenceRef,
      correlationId: cmd.correlationId,
      createdAt: recordedAt,
    });

    await this.appendStateTimelines({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      recordedAt,
      sourceKey: "asset_intelligence.review",
      provenance: failureMode.provenance,
      correlationId: cmd.correlationId,
      items: [
        {
          kind: nextStatus === "published" ? "failure_published" : "failure_review",
          stateId: failureMode.stateId,
        },
      ],
    });

    const evType =
      nextStatus === "published"
        ? ("engineering.asset.failure.published" as const)
        : ("engineering.asset.failure.reviewed" as const);
    const ev = createAssetIntelligenceEvent({
      type: evType,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: failureMode.stateId,
      occurredAt: recordedAt,
      correlationId: cmd.correlationId,
      payload: { kind: "failure_mode", status: nextStatus },
    });
    await this.deps.events.publish(ev);
    await this.deps.repository.appendEvent(ev);

    return {
      failureMode,
      workflowInstance,
      identityMutated: false,
      healthMutated: false,
      aiMayPublishForbidden: true,
    };
  }

  async assessDegradation(cmd: AssessDegradationCommand): Promise<EngineDegradationResult> {
    if (cmd.actorRole) {
      assertFailureCapability(cmd.actorRole, "degradation.assess");
    }
    const sourceKey = cmd.sourceKey ?? "manual.engineering_assessment";
    assertRegisteredActiveSource(sourceKey, "degradation");

    if (cmd.idempotencyKey) {
      const existing = await this.deps.repository.findIdempotency(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.idempotencyKey,
      );
      if (existing?.responsePayload?.result) {
        return {
          ...(existing.responsePayload.result as EngineDegradationResult),
          idempotentReplay: true,
        };
      }
    }

    const identity = await this.resolveIdentity(cmd);
    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const evidenceRefs = cmd.evidenceRefs ?? [];

    const evidenceConfidence = this.evidenceConfidenceEngine.assess({
      assessmentId: this.deps.repository.newId("ec"),
      assetId: cmd.assetId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      scope: "degradation_analysis",
      evidenceRefs,
      sourceKeys: [sourceKey],
      observedAt: cmd.observedAt ?? recordedAt,
      asOf: recordedAt,
    });
    await this.deps.repository.saveEvidenceConfidence({
      ...evidenceConfidence,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      version: 1,
    });

    const seriesVersion = await this.deps.repository.nextTimeSeriesVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      cmd.attributeKey,
      cmd.expectedSeriesVersion,
    );
    const series = createEngineeringTimeSeries({
      seriesId: this.deps.repository.newId("ts"),
      assetId: cmd.assetId,
      recordedAt,
      provenance: {
        sourceSystem: sourceKey,
        observedAt: cmd.observedAt ?? recordedAt,
        method: "engineering_time_series_v1",
        evidenceRefs,
      },
      attributeKey: cmd.attributeKey,
      attributeLabel: cmd.attributeLabel,
      unit: cmd.unit,
      orientation: cmd.orientation,
      points: cmd.points,
      sourceRefs: [sourceKey],
      evidenceRefs,
      version: seriesVersion,
      status: "ingested",
    });
    await this.deps.repository.saveTimeSeries({
      ...series,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
    });

    const bundle = this.trendIntelligence.assess({
      assetId: cmd.assetId,
      recordedAt,
      provenance: {
        sourceSystem: sourceKey,
        observedAt: cmd.observedAt ?? recordedAt,
        method: "governed_trend_v1",
        evidenceRefs,
        policyId: "asset_intelligence.degradation.assess.v1",
      },
      series,
      evidenceRefs,
      sourceRefs: [sourceKey],
      relatedFailureModeCodes: cmd.relatedFailureModeCodes,
      mechanismContext: cmd.mechanismContext,
      startReview: cmd.startReview,
      evidenceConfidenceRef: evidenceConfidence.assessmentId,
    });

    await this.deps.repository.saveTrendConfidence({
      ...bundle.trendConfidence,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
    });
    await this.deps.repository.saveChangeDetection({
      ...bundle.changeDetection,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
    });

    const trendVersion = await this.deps.repository.nextTrendVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      cmd.expectedTrendVersion,
    );
    const degradationVersion = await this.deps.repository.nextDegradationVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      cmd.expectedDegradationVersion,
    );

    let reviewInstanceId: string | undefined;
    let reviewWorkflowInstance: EngineeringWorkflowInstance | undefined;
    if (!bundle.abstained && cmd.startReview !== false) {
      const review = startDegradationReview({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        degradationStateId: bundle.degradation.stateId,
        startedBy: cmd.createdBy,
      });
      reviewInstanceId = review.instance.instanceId;
      reviewWorkflowInstance = review.instance;
      bundle.degradation.reviewInstanceId = reviewInstanceId;
      bundle.degradation.reviewStatus = "pending_review";
      bundle.trend.reviewStatus = "pending_review";
    }

    const trend: PersistedTrendState = {
      ...bundle.trend,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      version: trendVersion,
    };
    const degradation: PersistedDegradationState = {
      ...bundle.degradation,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      version: degradationVersion,
      createdBy: cmd.createdBy,
    };
    await this.deps.repository.saveTrendState(trend);
    await this.deps.repository.saveDegradationState(degradation);
    await this.deps.repository.cacheIdentity(identity);

    const timelineEntries = await this.appendStateTimelines({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      recordedAt,
      sourceKey,
      provenance: degradation.provenance,
      correlationId: cmd.correlationId,
      items: [
        { kind: "time_series", stateId: series.seriesId },
        { kind: "change_detection", stateId: bundle.changeDetection.detectionId },
        { kind: "trend", stateId: trend.stateId },
        { kind: "degradation", stateId: degradation.stateId },
      ],
    });

    const condition = await this.deps.repository.latestCondition(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      recordedAt,
    );
    const criticality = await this.deps.repository.latestCriticality(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      recordedAt,
    );
    const healthIndex = await this.deps.repository.latestHealthIndex(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      recordedAt,
    );
    const snapshot = composeAssetSnapshot({
      identity,
      asOf: recordedAt,
      condition,
      healthIndex,
      criticality,
      evidenceConfidence,
    });
    const snapshotId = this.deps.repository.newId("snap");
    await this.deps.repository.saveSnapshot({
      id: snapshotId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      schemaVersion: "asset_snapshot/1",
      capturedAt: recordedAt,
      conditionStateId: condition?.stateId,
      healthIndex,
      identityReference: identity,
      sourceSet: [sourceKey],
      timelinePosition: timelineEntries[timelineEntries.length - 1]?.entryId,
      snapshot,
    });

    const outboxEventId = this.deps.repository.newId("outbox");
    await this.deps.repository.appendOutbox({
      id: outboxEventId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      eventType: "engineering.asset.degradation.assessed",
      payload: {
        sourceKey,
        kind: "degradation",
        status: degradation.reviewStatus,
        silentIdentityMutationForbidden: true,
        rawEvidenceForbidden: true,
        secretsForbidden: true,
      },
      correlationId: cmd.correlationId,
      stateId: degradation.stateId,
      published: false,
      createdAt: recordedAt,
    });

    for (const type of [
      "engineering.asset.time_series.ingested",
      "engineering.asset.change.detected",
      "engineering.asset.trend.assessed",
      "engineering.asset.degradation.assessed",
    ] as const) {
      const ev = createAssetIntelligenceEvent({
        type,
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        assetId: cmd.assetId,
        stateId: degradation.stateId,
        occurredAt: recordedAt,
        correlationId: cmd.correlationId,
        payload: { sourceKey, kind: "degradation", status: degradation.reviewStatus },
      });
      await this.deps.events.publish(ev);
      await this.deps.repository.appendEvent(ev);
    }
    await this.deps.repository.markOutboxPublished(outboxEventId, recordedAt);

    const result: EngineDegradationResult = {
      identityOwner: "engineering_os_shared_domain",
      bundle,
      trend,
      degradation,
      timelineEntries,
      snapshot,
      snapshotId,
      outboxEventId,
      reviewInstanceId,
      reviewWorkflowInstance,
      identityMutated: false,
      healthMutated: false,
      degradationHealthContributionEnabled: false,
      predictiveMlUsed: false,
      probabilityOfFailureCertified: false,
      rulClaimsCertified: false,
      accuracyClaimsCertified: false,
      aiMayPublishForbidden: true,
    };

    if (cmd.idempotencyKey) {
      await this.deps.repository.saveIdempotency({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        idempotencyKey: cmd.idempotencyKey,
        operation: "assess_degradation",
        resourceId: degradation.stateId,
        responsePayload: { result },
      });
    }
    return result;
  }

  async reviewDegradation(cmd: ReviewDegradationCommand): Promise<{
    degradation: PersistedDegradationState;
    workflowInstance: EngineeringWorkflowInstance;
    identityMutated: false;
    healthMutated: false;
    aiMayPublishForbidden: true;
  }> {
    const capability =
      cmd.action === "approve"
        ? "degradation.approve"
        : cmd.publish
          ? "degradation.publish"
          : "degradation.review";
    if (cmd.actorRole) {
      assertFailureCapability(cmd.actorRole, capability, { actorId: cmd.reviewerId });
    }
    const latest = await this.deps.repository.latestDegradationState(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
    );
    if (!latest || latest.stateId !== cmd.degradationStateId) {
      throw new Error("degradation_state_not_found");
    }
    if (latest.reviewStatus === "published") {
      throw new Error("published_degradation_immutable");
    }
    const workflowInstance = transitionDegradationReview({
      instance: cmd.workflowInstance,
      action: cmd.action,
      to: cmd.to,
    });
    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const nextStatus =
      cmd.publish && cmd.to === "approved" ? "published" : cmd.to;
    const version = await this.deps.repository.nextDegradationVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      latest.version,
    );
    const degradation: PersistedDegradationState = {
      ...latest,
      stateId: this.deps.repository.newId("deg"),
      version,
      reviewStatus: nextStatus as PersistedDegradationState["reviewStatus"],
      reviewedAt: recordedAt,
      publishedAt: nextStatus === "published" ? recordedAt : latest.publishedAt,
      supersedesId: latest.stateId,
      provenance: {
        ...latest.provenance,
        reviewedBy: cmd.reviewerId,
        approvedAt: cmd.to === "approved" ? recordedAt : undefined,
      },
    };
    await this.deps.repository.saveDegradationState(degradation);
    await this.deps.repository.saveDegradationReview({
      reviewId: this.deps.repository.newId("drev"),
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      degradationStateId: degradation.stateId,
      reviewInstanceId: workflowInstance.instanceId,
      action: cmd.action,
      reviewerId: cmd.reviewerId,
      reason: cmd.reason,
      stateVersion: version,
      correlationId: cmd.correlationId,
      createdAt: recordedAt,
    });
    await this.appendStateTimelines({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      recordedAt,
      sourceKey: "asset_intelligence.review",
      provenance: degradation.provenance,
      correlationId: cmd.correlationId,
      items: [
        {
          kind: nextStatus === "published" ? "degradation_published" : "degradation_review",
          stateId: degradation.stateId,
        },
      ],
    });
    const ev = createAssetIntelligenceEvent({
      type:
        nextStatus === "published"
          ? "engineering.asset.degradation.published"
          : "engineering.asset.degradation.reviewed",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: degradation.stateId,
      occurredAt: recordedAt,
      correlationId: cmd.correlationId,
      payload: { kind: "degradation", status: nextStatus },
    });
    await this.deps.events.publish(ev);
    await this.deps.repository.appendEvent(ev);
    return {
      degradation,
      workflowInstance,
      identityMutated: false,
      healthMutated: false,
      aiMayPublishForbidden: true,
    };
  }

  async assessLifecycle(cmd: AssessLifecycleCommand): Promise<EngineLifecycleResult> {
    if (cmd.actorRole) {
      assertFailureCapability(cmd.actorRole, "lifecycle.assess");
    }
    const sourceKey = cmd.sourceKey ?? "manual.engineering_assessment";
    assertRegisteredActiveSource(sourceKey, "lifecycle");

    if (cmd.idempotencyKey) {
      const existing = await this.deps.repository.findIdempotency(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.idempotencyKey,
      );
      if (existing?.responsePayload?.result) {
        return {
          ...(existing.responsePayload.result as EngineLifecycleResult),
          idempotentReplay: true,
        };
      }
    }

    const identity = await this.resolveIdentity(cmd);
    const recordedAt = cmd.recordedAt ?? new Date().toISOString();

    if (
      cmd.expectedCanonicalLifecycleVersion !== undefined &&
      cmd.expectedCanonicalLifecycleVersion !== cmd.canonicalLifecycle.stageVersion
    ) {
      throw new Error("canonical_lifecycle_version_conflict");
    }

    const evidenceRefs = cmd.evidenceRefs ?? [];
    const evidenceConfidence = this.evidenceConfidenceEngine.assess({
      assessmentId: this.deps.repository.newId("ec"),
      assetId: cmd.assetId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      scope: "lifecycle_intelligence",
      evidenceRefs,
      sourceKeys: [sourceKey],
      observedAt: cmd.observedAt ?? recordedAt,
      asOf: recordedAt,
    });
    await this.deps.repository.saveEvidenceConfidence({
      ...evidenceConfidence,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      version: 1,
    });

    const isPublished = (status?: string) => status === "published" || status === "approved";

    const [condition, reliability, criticality, failureMode, trend, degradation] =
      await Promise.all([
        this.deps.repository.latestCondition(cmd.tenantId, cmd.workspaceId, cmd.assetId, recordedAt),
        this.deps.repository.latestReliability(
          cmd.tenantId,
          cmd.workspaceId,
          cmd.assetId,
          recordedAt,
        ),
        this.deps.repository.latestCriticality(
          cmd.tenantId,
          cmd.workspaceId,
          cmd.assetId,
          recordedAt,
        ),
        this.deps.repository.latestFailureMode(
          cmd.tenantId,
          cmd.workspaceId,
          cmd.assetId,
          recordedAt,
        ),
        this.deps.repository.latestTrendState(cmd.tenantId, cmd.workspaceId, cmd.assetId),
        this.deps.repository.latestDegradationState(cmd.tenantId, cmd.workspaceId, cmd.assetId),
      ]);

    // Only published/approved slices are forwarded — draft/rejected work must not shape lifecycle context.
    const bundle = this.lifecycleContextEngine.compose({
      assetId: cmd.assetId,
      recordedAt,
      provenance: {
        sourceSystem: sourceKey,
        observedAt: cmd.observedAt ?? recordedAt,
        method: "lifecycle_context_v1",
        evidenceRefs,
        policyId: "asset_intelligence.lifecycle.assess.v1",
      },
      canonicalLifecycle: cmd.canonicalLifecycle,
      operatingState: cmd.operatingState,
      maintenanceState: cmd.maintenanceState,
      condition:
        condition && isPublished(condition.status)
          ? { stateId: condition.stateId, reviewStatus: condition.status, rating: condition.conditionRating }
          : undefined,
      reliability:
        reliability && isPublished(reliability.reviewStatus)
          ? {
              stateId: reliability.stateId,
              reviewStatus: reliability.reviewStatus,
              rating: reliability.reliabilityClass,
            }
          : undefined,
      criticality:
        criticality && isPublished(criticality.reviewStatus)
          ? {
              stateId: criticality.stateId,
              reviewStatus: criticality.reviewStatus,
              rating: criticality.criticalityRating,
            }
          : undefined,
      failures:
        failureMode && isPublished(failureMode.reviewStatus)
          ? [
              {
                stateId: failureMode.stateId,
                reviewStatus: failureMode.reviewStatus,
                code: failureMode.failureModeCode,
              },
            ]
          : [],
      trends:
        trend && isPublished(trend.reviewStatus)
          ? [
              {
                stateId: trend.stateId,
                reviewStatus: trend.reviewStatus,
                direction: trend.trendDirection,
                trendConfidence: trend.trendConfidence,
              },
            ]
          : [],
      degradations:
        degradation && isPublished(degradation.reviewStatus)
          ? [
              {
                stateId: degradation.stateId,
                reviewStatus: degradation.reviewStatus,
                direction: degradation.degradationDirection,
              },
            ]
          : [],
      evidenceConfidence,
      commissionedAt: cmd.commissionedAt,
      designLifeReference: cmd.designLifeReference,
      startReview: cmd.startReview,
    });

    let reviewInstanceId: string | undefined;
    let reviewWorkflowInstance: EngineeringWorkflowInstance | undefined;
    if (!bundle.abstained && cmd.startReview !== false) {
      const review = startLifecycleReview({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        lifecycleStateId: bundle.lifecycle.stateId,
        startedBy: cmd.createdBy,
      });
      reviewInstanceId = review.instance.instanceId;
      reviewWorkflowInstance = review.instance;
      bundle.lifecycle.reviewInstanceId = reviewInstanceId;
      bundle.lifecycle.reviewStatus = "pending_review";
    }

    const version = await this.deps.repository.nextLifecycleVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      cmd.expectedVersion,
    );
    const lifecycle: PersistedLifecycleIntelligenceState = {
      ...bundle.lifecycle,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      version,
      createdBy: cmd.createdBy,
    };
    await this.deps.repository.saveLifecycleState(lifecycle);
    await this.deps.repository.cacheIdentity(identity);

    const transitionCandidates: PersistedLifecycleTransitionCandidate[] = [];
    for (const candidate of bundle.transitionCandidates) {
      const persistedCandidate: PersistedLifecycleTransitionCandidate = {
        ...candidate,
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
      };
      await this.deps.repository.saveLifecycleTransitionCandidate(persistedCandidate);
      transitionCandidates.push(persistedCandidate);
    }

    const timelineItems: Array<{ kind: IntelligenceTimelineEntry["kind"]; stateId: string }> = [
      { kind: "lifecycle_intelligence", stateId: lifecycle.stateId },
    ];
    for (const candidate of transitionCandidates) {
      timelineItems.push({ kind: "lifecycle_transition_candidate", stateId: candidate.candidateId });
    }

    const timelineEntries = await this.appendStateTimelines({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      recordedAt,
      sourceKey,
      provenance: lifecycle.provenance,
      correlationId: cmd.correlationId,
      items: timelineItems,
    });

    const healthIndex = await this.deps.repository.latestHealthIndex(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      recordedAt,
    );
    const snapshot = composeAssetSnapshot({
      identity,
      asOf: recordedAt,
      condition,
      healthIndex,
      criticality,
      evidenceConfidence,
    });
    const snapshotId = this.deps.repository.newId("snap");
    await this.deps.repository.saveSnapshot({
      id: snapshotId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      schemaVersion: "asset_snapshot/1",
      capturedAt: recordedAt,
      conditionStateId: condition?.stateId,
      healthIndex,
      identityReference: identity,
      sourceSet: [sourceKey],
      timelinePosition: timelineEntries[timelineEntries.length - 1]?.entryId,
      snapshot,
    });

    const outboxEventId = this.deps.repository.newId("outbox");
    await this.deps.repository.appendOutbox({
      id: outboxEventId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      eventType: "engineering.asset.lifecycle.assessed",
      payload: {
        sourceKey,
        kind: "lifecycle_intelligence",
        status: lifecycle.reviewStatus,
        silentIdentityMutationForbidden: true,
        rawEvidenceForbidden: true,
        secretsForbidden: true,
      },
      correlationId: cmd.correlationId,
      stateId: lifecycle.stateId,
      published: false,
      createdAt: recordedAt,
    });

    const eventTypes: Array<import("./events").AssetIntelligenceEventType> = [
      "engineering.asset.lifecycle.assessed",
      "engineering.asset.evidence_confidence.assessed",
    ];
    if (transitionCandidates.length > 0) {
      eventTypes.push("engineering.asset.lifecycle.transition_candidate.proposed");
    }
    for (const type of eventTypes) {
      const ev = createAssetIntelligenceEvent({
        type,
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        assetId: cmd.assetId,
        stateId: lifecycle.stateId,
        occurredAt: recordedAt,
        correlationId: cmd.correlationId,
        payload: { sourceKey, kind: "lifecycle_intelligence", status: lifecycle.reviewStatus },
      });
      await this.deps.events.publish(ev);
      await this.deps.repository.appendEvent(ev);
    }
    await this.deps.repository.markOutboxPublished(outboxEventId, recordedAt);

    const result: EngineLifecycleResult = {
      identityOwner: "engineering_os_shared_domain",
      lifecycle,
      transitionCandidates,
      evidenceConfidence,
      timelineEntries,
      snapshot,
      snapshotId,
      outboxEventId,
      reviewInstanceId,
      reviewWorkflowInstance,
      identityMutated: false,
      healthMutated: false,
      lifecycleHealthContributionEnabled: false,
      mutatesCanonicalLifecycle: false,
      predictiveMlUsed: false,
      probabilityOfFailureCertified: false,
      rulClaimsCertified: false,
      accuracyClaimsCertified: false,
      aiMayPublishForbidden: true,
    };

    if (cmd.idempotencyKey) {
      await this.deps.repository.saveIdempotency({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        idempotencyKey: cmd.idempotencyKey,
        operation: "assess_lifecycle",
        resourceId: lifecycle.stateId,
        responsePayload: { result },
      });
    }
    return result;
  }

  async reviewLifecycle(cmd: ReviewLifecycleCommand): Promise<{
    lifecycle: PersistedLifecycleIntelligenceState;
    workflowInstance: EngineeringWorkflowInstance;
    identityMutated: false;
    healthMutated: false;
    aiMayPublishForbidden: true;
  }> {
    const capability =
      cmd.action === "approve"
        ? "lifecycle.approve"
        : cmd.publish
          ? "lifecycle.publish"
          : "lifecycle.review";
    if (cmd.actorRole) {
      assertFailureCapability(cmd.actorRole, capability, { actorId: cmd.reviewerId });
    }
    const latest = await this.deps.repository.latestLifecycleState(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
    );
    if (!latest || latest.stateId !== cmd.lifecycleStateId) {
      throw new Error("lifecycle_state_not_found");
    }
    if (latest.reviewStatus === "published") {
      throw new Error("published_lifecycle_immutable");
    }
    const workflowInstance = transitionLifecycleReview({
      instance: cmd.workflowInstance,
      action: cmd.action,
      to: cmd.to,
    });
    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const nextStatus = cmd.publish && cmd.to === "approved" ? "published" : cmd.to;
    const version = await this.deps.repository.nextLifecycleVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      latest.version,
    );
    const lifecycle: PersistedLifecycleIntelligenceState = {
      ...latest,
      stateId: this.deps.repository.newId("life"),
      version,
      reviewStatus: nextStatus as PersistedLifecycleIntelligenceState["reviewStatus"],
      reviewedAt: recordedAt,
      publishedAt: nextStatus === "published" ? recordedAt : latest.publishedAt,
      supersedesId: latest.stateId,
      provenance: {
        ...latest.provenance,
        reviewedBy: cmd.reviewerId,
        approvedAt: cmd.to === "approved" ? recordedAt : undefined,
      },
    };
    await this.deps.repository.saveLifecycleState(lifecycle);
    await this.deps.repository.saveLifecycleReview({
      reviewId: this.deps.repository.newId("lrev"),
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      lifecycleStateId: lifecycle.stateId,
      reviewInstanceId: workflowInstance.instanceId,
      action: cmd.action,
      reviewerId: cmd.reviewerId,
      reason: cmd.reason,
      stateVersion: version,
      canonicalLifecycleVersion: lifecycle.canonicalLifecycleRef.stageVersion,
      evidenceConfidenceRef: lifecycle.evidenceConfidenceRef,
      trendConfidenceRef: lifecycle.trendConfidenceRef,
      correlationId: cmd.correlationId,
      createdAt: recordedAt,
    });
    await this.appendStateTimelines({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      recordedAt,
      sourceKey: "asset_intelligence.review",
      provenance: lifecycle.provenance,
      correlationId: cmd.correlationId,
      items: [
        {
          kind: nextStatus === "published" ? "lifecycle_published" : "lifecycle_review",
          stateId: lifecycle.stateId,
        },
      ],
    });
    const ev = createAssetIntelligenceEvent({
      type:
        nextStatus === "published"
          ? "engineering.asset.lifecycle.published"
          : "engineering.asset.lifecycle.reviewed",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: lifecycle.stateId,
      occurredAt: recordedAt,
      correlationId: cmd.correlationId,
      payload: { kind: "lifecycle_intelligence", status: nextStatus },
    });
    await this.deps.events.publish(ev);
    await this.deps.repository.appendEvent(ev);
    return {
      lifecycle,
      workflowInstance,
      identityMutated: false,
      healthMutated: false,
      aiMayPublishForbidden: true,
    };
  }

  private async appendStateTimelines(input: {
    tenantId: string;
    workspaceId: string;
    assetId: string;
    recordedAt: string;
    sourceKey: string;
    provenance: Provenance;
    correlationId?: string;
    items: Array<{ kind: IntelligenceTimelineEntry["kind"]; stateId: string }>;
  }): Promise<IntelligenceTimelineEntry[]> {
    const entries: IntelligenceTimelineEntry[] = [];
    for (const item of input.items) {
      const entry = createTimelineEntry({
        entryId: this.deps.repository.newId("tl"),
        assetId: input.assetId,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        stateId: item.stateId,
        kind: item.kind,
        recordedAt: input.recordedAt,
        sourceKey: input.sourceKey,
        provenance: input.provenance,
      });
      await this.deps.repository.appendTimeline(entry);
      entries.push(entry);
      const tlEvent = createAssetIntelligenceEvent({
        type: "engineering.asset.intelligence_timeline.appended",
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        assetId: input.assetId,
        stateId: item.stateId,
        entryId: entry.entryId,
        occurredAt: input.recordedAt,
        correlationId: input.correlationId,
        payload: { sourceKey: input.sourceKey, kind: item.kind },
      });
      await this.deps.events.publish(tlEvent);
      await this.deps.repository.appendEvent(tlEvent);
    }
    return entries;
  }

  async getSnapshot(input: {
    tenantId: string;
    workspaceId: string;
    assetId: string;
    asOf?: string;
  }): Promise<AssetSnapshot | null> {
    const identity = await this.deps.identityPort.resolve(input);
    if (!identity) return null;
    const persisted = await this.deps.repository.latestSnapshot(
      input.tenantId,
      input.workspaceId,
      input.assetId,
    );
    if (persisted) return persisted.snapshot;
    return composeAssetSnapshot({
      identity,
      asOf: input.asOf ?? new Date().toISOString(),
      condition: await this.deps.repository.latestCondition(
        input.tenantId,
        input.workspaceId,
        input.assetId,
        input.asOf,
      ),
      healthIndex: await this.deps.repository.latestHealthIndex(
        input.tenantId,
        input.workspaceId,
        input.assetId,
        input.asOf,
      ),
      criticality: await this.deps.repository.latestCriticality(
        input.tenantId,
        input.workspaceId,
        input.assetId,
        input.asOf,
      ),
    });
  }

  async listTimeline(assetId: string, asOf?: string): Promise<IntelligenceTimelineEntry[]> {
    return this.deps.repository.listTimeline(assetId, asOf);
  }

  async getHealthIndex(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<AssetHealthIndexState | undefined> {
    return this.deps.repository.latestHealthIndex(tenantId, workspaceId, assetId, asOf);
  }

  async getCondition(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<PersistedConditionState | undefined> {
    return this.deps.repository.latestCondition(tenantId, workspaceId, assetId, asOf);
  }

  async getCriticality(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<PersistedCriticalityState | undefined> {
    return this.deps.repository.latestCriticality(tenantId, workspaceId, assetId, asOf);
  }
}

export function createAssetIntelligenceEngine(
  deps: AssetIntelligenceEngineDeps,
): AssetIntelligenceEngine {
  return new AssetIntelligenceEngine(deps);
}

export { createInMemorySharedDomainIdentityPort };
