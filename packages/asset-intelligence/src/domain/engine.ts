/**
 * Phase 10C — Asset Intelligence Engine.
 * Orchestrates condition, criticality, review, and Health Composition Engine.
 * Scoring math lives in HealthCompositionEngine — not inline here or on Health Index.
 */

import type { AssetIdentityReference, Provenance } from "../architecture/identity-state";
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
import {
  createAssetDecisionContextEngine,
  type AssetDecisionContextEngine,
} from "./decision-context-engine";
import type { AssetDecisionContext } from "./decision-context";
import { createRiskSignalEngine, type RiskSignalEngine } from "./risk-engine";
import {
  createMaintenanceRecommendationEngine,
  type MaintenanceRecommendationEngine,
} from "./maintenance-recommendation";
import {
  createAssetPriorityContextEngine,
  type AssetPriorityContextEngine,
} from "./priority";
import {
  createMultiSourceFusionEngine,
  type MultiSourceFusionEngine,
} from "./fusion-engine";
import {
  createPredictiveReadinessAssessor,
  createSourceReconciliationEngine,
  type PredictiveReadinessAssessor,
  type SourceReconciliationEngine,
} from "./reconciliation-engine";
import type { FusionSourceInput } from "./fusion";
import {
  createObjectivePredictiveReadinessAssessor,
  type ObjectivePredictiveReadinessAssessor,
  type ObjectiveReadinessInput,
} from "./predictive-readiness-objective";
import {
  createPredictiveMethodEligibilityEngine,
  type PredictiveEligibilityInput,
  type PredictiveMethodEligibilityEngine,
} from "./predictive-eligibility-engine";
import {
  createQualificationDraft,
  evaluateAgainstAcceptanceCriteria,
  type ObservedMetricValue,
  type QualificationDraftInput,
} from "./predictive-qualification";
import { PREDICTIVE_GOVERNANCE_LOCKS } from "./predictive-governance";
import { listMethodsForObjective } from "./predictive-methods";
import type { PredictiveObjectiveId } from "./predictive-objectives";
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
  startRiskReview,
  transitionRiskReview,
  startMaintenanceRecommendationReview,
  transitionMaintenanceRecommendationReview,
  startPriorityReview,
  transitionPriorityReview,
  startFusionReview,
  transitionFusionReview,
  startPredictiveReadinessReview,
  transitionPredictiveReadinessReview,
  startPredictiveMethodReview,
  transitionPredictiveMethodReview,
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
  PersistedDecisionContext,
  PersistedRiskSignalState,
  PersistedRiskCandidate,
  PersistedMaintenanceRecommendationState,
  PersistedPriorityProfile,
  PersistedFusionState,
  PersistedReconciliationRecord,
  PersistedPredictiveReadinessState,
  PersistedObjectivePredictiveReadinessState,
  PersistedPredictiveMethodCandidate,
  PersistedPredictiveMethodQualification,
} from "./persistence";

/** Governed slices are consumable only once published or approved. */
function isPublishedStatus(status?: string): boolean {
  return status === "published" || status === "approved";
}

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

/** Phase 10H — Decision Context / Risk / Maintenance Recommendation / Priority commands. */
export type ComposeDecisionContextCommand = {
  tenantId: string;
  workspaceId: string;
  assetId: string;
  sourceKey?: string;
  evidenceRefs?: string[];
  observedAt?: string;
  correlationId?: string;
  recordedAt?: string;
  idempotencyKey?: string;
  createdBy?: string;
  actorRole?: FailureIntelligenceRole;
};

export type EngineDecisionContextResult = {
  identityOwner: "engineering_os_shared_domain";
  decisionContext: PersistedDecisionContext;
  evidenceConfidence: import("./evidence-confidence").EvidenceConfidenceAssessment;
  timelineEntries: IntelligenceTimelineEntry[];
  abstained: boolean;
  abstentionReason?: string;
  identityMutated: false;
  healthMutated: false;
  idempotentReplay?: boolean;
  autonomousDecisionAuthority: false;
  createsCoreRisk: false;
  createsWorkOrder: false;
  mutatesCanonicalLifecycle: false;
};

export type AssessRiskCommand = ComposeDecisionContextCommand & {
  startReview?: boolean;
  expectedVersion?: number;
  decisionContextId?: string;
};

export type EngineRiskResult = {
  identityOwner: "engineering_os_shared_domain";
  decisionContext: PersistedDecisionContext;
  riskSignal: PersistedRiskSignalState;
  riskCandidates: PersistedRiskCandidate[];
  evidenceConfidence: import("./evidence-confidence").EvidenceConfidenceAssessment;
  timelineEntries: IntelligenceTimelineEntry[];
  snapshot: AssetSnapshot;
  snapshotId: string;
  outboxEventId: string;
  reviewInstanceId?: string;
  reviewWorkflowInstance?: EngineeringWorkflowInstance;
  abstained: boolean;
  abstentionReason?: string;
  identityMutated: false;
  healthMutated: false;
  idempotentReplay?: boolean;
  riskHealthContributionEnabled: false;
  createsCoreRisk: false;
  riskCoreAutoMutationAllowed: false;
  canonicalEngineeringRiskOwnership: "engineering_core";
  createsWorkOrder: false;
  mutatesCanonicalLifecycle: false;
  predictiveMlUsed: false;
  probabilityOfFailureCertified: false;
  rulClaimsCertified: false;
  accuracyClaimsCertified: false;
  aiMayPublishForbidden: true;
};

export type ReviewRiskCommand = {
  tenantId: string;
  workspaceId: string;
  assetId: string;
  riskSignalStateId: string;
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

export type AssessMaintenanceRecommendationCommand = AssessRiskCommand & {
  riskSignalStateId?: string;
};

export type EngineMaintenanceRecommendationResult = {
  identityOwner: "engineering_os_shared_domain";
  decisionContext: PersistedDecisionContext;
  recommendation: PersistedMaintenanceRecommendationState;
  evidenceConfidence: import("./evidence-confidence").EvidenceConfidenceAssessment;
  timelineEntries: IntelligenceTimelineEntry[];
  outboxEventId: string;
  reviewInstanceId?: string;
  reviewWorkflowInstance?: EngineeringWorkflowInstance;
  abstained: boolean;
  abstentionReason?: string;
  identityMutated: false;
  healthMutated: false;
  idempotentReplay?: boolean;
  createsWorkOrder: false;
  cmmsWorkOrderOwnership: "none_in_asset_intelligence";
  mutatesCanonicalLifecycle: false;
  rulClaimsCertified: false;
  aiMayPublishForbidden: true;
};

export type ReviewMaintenanceRecommendationCommand = Omit<
  ReviewRiskCommand,
  "riskSignalStateId"
> & {
  recommendationStateId: string;
};

export type AssessPriorityCommand = AssessRiskCommand & {
  riskSignalStateId?: string;
  maintenanceRecommendationStateId?: string;
};

export type EnginePriorityResult = {
  identityOwner: "engineering_os_shared_domain";
  decisionContext: PersistedDecisionContext;
  priorityProfile: PersistedPriorityProfile;
  evidenceConfidence: import("./evidence-confidence").EvidenceConfidenceAssessment;
  timelineEntries: IntelligenceTimelineEntry[];
  outboxEventId: string;
  reviewInstanceId?: string;
  reviewWorkflowInstance?: EngineeringWorkflowInstance;
  abstained: boolean;
  abstentionReason?: string;
  identityMutated: false;
  healthMutated: false;
  idempotentReplay?: boolean;
  priorityHealthContributionEnabled: false;
  numericPriorityScoreRequired: false;
  createsWorkOrder: false;
  impliesPoF: false;
  mutatesCanonicalLifecycle: false;
  aiMayPublishForbidden: true;
};

export type ReviewPriorityCommand = Omit<ReviewRiskCommand, "riskSignalStateId"> & {
  priorityProfileId: string;
};

export type AssessRiskPriorityBundleCommand = AssessRiskCommand;

export type EngineRiskPriorityBundleResult = {
  identityOwner: "engineering_os_shared_domain";
  decisionContext: PersistedDecisionContext;
  riskSignal: PersistedRiskSignalState;
  riskCandidates: PersistedRiskCandidate[];
  recommendation: PersistedMaintenanceRecommendationState;
  priorityProfile: PersistedPriorityProfile;
  evidenceConfidence: import("./evidence-confidence").EvidenceConfidenceAssessment;
  timelineEntries: IntelligenceTimelineEntry[];
  snapshot: AssetSnapshot;
  snapshotId: string;
  outboxEventIds: string[];
  riskReviewInstanceId?: string;
  maintenanceReviewInstanceId?: string;
  priorityReviewInstanceId?: string;
  abstained: boolean;
  abstentionReason?: string;
  identityMutated: false;
  healthMutated: false;
  idempotentReplay?: boolean;
  riskHealthContributionEnabled: false;
  priorityHealthContributionEnabled: false;
  createsCoreRisk: false;
  riskCoreAutoMutationAllowed: false;
  canonicalEngineeringRiskOwnership: "engineering_core";
  createsWorkOrder: false;
  cmmsWorkOrderOwnership: "none_in_asset_intelligence";
  mutatesCanonicalLifecycle: false;
  predictiveMlUsed: false;
  probabilityOfFailureCertified: false;
  rulClaimsCertified: false;
  accuracyClaimsCertified: false;
  numericPriorityScoreRequired: false;
  aiMayPublishForbidden: true;
};

/** Phase 10I — Multi-source fusion / reconciliation / predictive readiness commands. */
export type AssessFusionCommand = {
  tenantId: string;
  workspaceId: string;
  assetId: string;
  sourceKey?: string;
  evidenceRefs?: string[];
  observedAt?: string;
  correlationId?: string;
  recordedAt?: string;
  idempotencyKey?: string;
  createdBy?: string;
  actorRole?: FailureIntelligenceRole;
  startReview?: boolean;
  expectedVersion?: number;
  /** Inspection Intelligence public contract version — only "1.0.0" may be fused. */
  inspectionIntelligenceContractVersion?: string;
  inspectionIntelligenceStateId?: string;
  /** Project Intelligence shared/public contract version — approved contracts only. */
  projectIntelligenceContractVersion?: string;
  projectIntelligenceStateId?: string;
};

/** Phase 10I governance flags shared by every fusion-family engine result. */
export type FusionGovernanceFlags = {
  identityMutated: false;
  healthMutated: false;
  fusionHealthContributionEnabled: false;
  isHealthFactor: false;
  createsCoreRisk: false;
  createsWorkOrder: false;
  mutatesCanonicalLifecycle: false;
  predictiveMlEnabled: false;
  predictiveMethodsCertified: false;
  predictiveMlExecuted: false;
  probabilityOfFailureCertified: false;
  rulClaimsCertified: false;
  accuracyClaimsCertified: false;
  autonomousReconciliationForbidden: true;
  aiMayPublishForbidden: true;
};

export type EngineFusionResult = FusionGovernanceFlags & {
  identityOwner: "engineering_os_shared_domain";
  fusionState: PersistedFusionState;
  reconciliation: PersistedReconciliationRecord;
  evidenceConfidence: import("./evidence-confidence").EvidenceConfidenceAssessment;
  timelineEntries: IntelligenceTimelineEntry[];
  snapshot: AssetSnapshot;
  snapshotId: string;
  outboxEventId: string;
  reviewInstanceId?: string;
  reviewWorkflowInstance?: EngineeringWorkflowInstance;
  abstained: boolean;
  abstentionReason?: string;
  idempotentReplay?: boolean;
};

export type ReviewFusionCommand = {
  tenantId: string;
  workspaceId: string;
  assetId: string;
  fusionStateId: string;
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

export type AssessPredictiveReadinessCommand = AssessFusionCommand & {
  fusionStateId?: string;
};

export type EnginePredictiveReadinessResult = FusionGovernanceFlags & {
  identityOwner: "engineering_os_shared_domain";
  fusionState: PersistedFusionState;
  reconciliation?: PersistedReconciliationRecord;
  predictiveReadiness: PersistedPredictiveReadinessState;
  evidenceConfidence: import("./evidence-confidence").EvidenceConfidenceAssessment;
  timelineEntries: IntelligenceTimelineEntry[];
  outboxEventId: string;
  reviewInstanceId?: string;
  reviewWorkflowInstance?: EngineeringWorkflowInstance;
  abstained: boolean;
  abstentionReason?: string;
  idempotentReplay?: boolean;
  predictiveAllowed: false;
};

export type ReviewPredictiveReadinessCommand = Omit<ReviewFusionCommand, "fusionStateId"> & {
  readinessStateId: string;
};

export type AssessFusionBundleCommand = AssessFusionCommand;

export type EngineFusionBundleResult = FusionGovernanceFlags & {
  identityOwner: "engineering_os_shared_domain";
  fusionState: PersistedFusionState;
  reconciliation: PersistedReconciliationRecord;
  predictiveReadiness: PersistedPredictiveReadinessState;
  evidenceConfidence: import("./evidence-confidence").EvidenceConfidenceAssessment;
  timelineEntries: IntelligenceTimelineEntry[];
  snapshot: AssetSnapshot;
  snapshotId: string;
  outboxEventIds: string[];
  fusionReviewInstanceId?: string;
  predictiveReadinessReviewInstanceId?: string;
  abstained: boolean;
  abstentionReason?: string;
  idempotentReplay?: boolean;
  predictiveAllowed: false;
};

/**
 * Phase 10J — predictive governance flags. Every predictive governance result
 * carries these unchanged: the phase establishes the prerequisites for
 * prediction, it never performs one.
 */
export type PredictiveGovernanceFlags = {
  identityMutated: false;
  healthMutated: false;
  isHealthFactor: false;
  predictiveHealthContributionEnabled: false;
  createsCoreRisk: false;
  createsWorkOrder: false;
  mutatesCanonicalLifecycle: false;
  productionPredictiveExecutionEnabled: false;
  predictiveMlEnabled: false;
  predictiveMlExecuted: false;
  predictiveMethodsCertified: false;
  probabilityOfFailureCertified: false;
  rulClaimsCertified: false;
  accuracyClaimsCertified: false;
  containsPredictionOutput: false;
  autonomousExecutionForbidden: true;
  aiMayPublishForbidden: true;
};

const PREDICTIVE_GOVERNANCE_FLAGS: PredictiveGovernanceFlags = {
  identityMutated: false,
  healthMutated: false,
  isHealthFactor: false,
  predictiveHealthContributionEnabled: false,
  createsCoreRisk: false,
  createsWorkOrder: false,
  mutatesCanonicalLifecycle: false,
  productionPredictiveExecutionEnabled: false,
  predictiveMlEnabled: false,
  predictiveMlExecuted: false,
  predictiveMethodsCertified: false,
  probabilityOfFailureCertified: false,
  rulClaimsCertified: false,
  accuracyClaimsCertified: false,
  containsPredictionOutput: false,
  autonomousExecutionForbidden: true,
  aiMayPublishForbidden: true,
};

export type AssessObjectivePredictiveReadinessCommand = AssessFusionCommand & {
  objectiveId: PredictiveObjectiveId | string;
  fusionStateId?: string;
  declaredInputs?: ObjectiveReadinessInput["declaredInputs"];
  observationCount?: number;
  observationWindowDays?: number;
  largestObservationGapDays?: number;
  evidenceAgeDays?: number;
  freshnessPolicy?: ObjectiveReadinessInput["freshnessPolicy"];
  trendConfidence?: import("./trend-confidence").TrendConfidenceAssessment;
};

export type EngineObjectivePredictiveReadinessResult = PredictiveGovernanceFlags & {
  identityOwner: "engineering_os_shared_domain";
  objectiveReadiness: PersistedObjectivePredictiveReadinessState;
  fusionState: PersistedFusionState;
  evidenceConfidence: import("./evidence-confidence").EvidenceConfidenceAssessment;
  timelineEntries: IntelligenceTimelineEntry[];
  outboxEventId: string;
  reviewInstanceId?: string;
  reviewWorkflowInstance?: EngineeringWorkflowInstance;
  abstained: boolean;
  abstentionReason?: string;
  idempotentReplay?: boolean;
  predictiveAllowed: false;
};

export type EvaluateMethodEligibilityCommand = {
  tenantId: string;
  workspaceId: string;
  assetId: string;
  objectiveId: PredictiveObjectiveId | string;
  methodId: string;
  readinessStateId?: string;
  readiness?: PersistedObjectivePredictiveReadinessState;
  assertedAssumptions?: readonly string[];
  violatedAssumptions?: readonly string[];
  satisfiedApplicabilityConditions?: readonly string[];
  freshnessPolicy?: PredictiveEligibilityInput["freshnessPolicy"];
  evidenceConfidence?: import("./evidence-confidence").EvidenceConfidenceAssessment;
  trendConfidence?: import("./trend-confidence").TrendConfidenceAssessment;
  qualificationRef?: string;
  qualificationPassed?: boolean;
  sourceKey?: string;
  correlationId?: string;
  recordedAt?: string;
  idempotencyKey?: string;
  createdBy?: string;
  actorRole?: FailureIntelligenceRole;
  startReview?: boolean;
  expectedVersion?: number;
};

export type EngineMethodCandidateResult = PredictiveGovernanceFlags & {
  identityOwner: "engineering_os_shared_domain";
  candidate: PersistedPredictiveMethodCandidate;
  objectiveReadiness: PersistedObjectivePredictiveReadinessState;
  eligibility: PersistedPredictiveMethodCandidate["eligibility"];
  timelineEntries: IntelligenceTimelineEntry[];
  outboxEventId: string;
  reviewInstanceId?: string;
  reviewWorkflowInstance?: EngineeringWorkflowInstance;
  abstained: boolean;
  abstentionReason?: string;
  idempotentReplay?: boolean;
  executionAllowed: false;
};

export type StartMethodQualificationCommand = Omit<
  QualificationDraftInput,
  "tenantId" | "workspaceId" | "id" | "version"
> & {
  tenantId: string;
  workspaceId: string;
  assetId?: string;
  observedMetrics?: readonly ObservedMetricValue[];
  evaluatorId?: string;
  reproducible?: boolean;
  observedFixtureSetHash?: string;
  correlationId?: string;
  recordedAt?: string;
  idempotencyKey?: string;
  createdBy?: string;
  actorRole?: FailureIntelligenceRole;
  startReview?: boolean;
  expectedVersion?: number;
};

export type EngineMethodQualificationResult = PredictiveGovernanceFlags & {
  qualification: PersistedPredictiveMethodQualification;
  timelineEntries: IntelligenceTimelineEntry[];
  outboxEventId: string;
  reviewInstanceId?: string;
  reviewWorkflowInstance?: EngineeringWorkflowInstance;
  idempotentReplay?: boolean;
  /** Qualification never grants certification or production execution. */
  certificationGranted: false;
  executionAllowed: false;
};

export type ReviewMethodQualificationCommand = {
  tenantId: string;
  workspaceId: string;
  assetId?: string;
  qualificationId: string;
  methodId: string;
  objectiveId: PredictiveObjectiveId | string;
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

export type EngineMethodQualificationReviewResult = PredictiveGovernanceFlags & {
  qualification: PersistedPredictiveMethodQualification;
  workflowInstance: EngineeringWorkflowInstance;
  /** True once a passed qualification is published — still not certification. */
  qualified: boolean;
  certificationGranted: false;
  executionAllowed: false;
};

export type AssessPredictiveGovernanceBundleCommand = AssessObjectivePredictiveReadinessCommand & {
  methodIds?: readonly string[];
};

export type EnginePredictiveGovernanceBundleResult = PredictiveGovernanceFlags & {
  identityOwner: "engineering_os_shared_domain";
  objectiveReadiness: PersistedObjectivePredictiveReadinessState;
  candidates: PersistedPredictiveMethodCandidate[];
  fusionState: PersistedFusionState;
  evidenceConfidence: import("./evidence-confidence").EvidenceConfidenceAssessment;
  timelineEntries: IntelligenceTimelineEntry[];
  outboxEventIds: string[];
  objectiveReadinessReviewInstanceId?: string;
  abstained: boolean;
  abstentionReason?: string;
  predictiveAllowed: false;
  executionAllowed: false;
};

const FUSION_GOVERNANCE_FLAGS: FusionGovernanceFlags = {
  identityMutated: false,
  healthMutated: false,
  fusionHealthContributionEnabled: false,
  isHealthFactor: false,
  createsCoreRisk: false,
  createsWorkOrder: false,
  mutatesCanonicalLifecycle: false,
  predictiveMlEnabled: false,
  predictiveMethodsCertified: false,
  predictiveMlExecuted: false,
  probabilityOfFailureCertified: false,
  rulClaimsCertified: false,
  accuracyClaimsCertified: false,
  autonomousReconciliationForbidden: true,
  aiMayPublishForbidden: true,
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
  decisionContextEngine?: AssetDecisionContextEngine;
  riskSignalEngine?: RiskSignalEngine;
  maintenanceRecommendationEngine?: MaintenanceRecommendationEngine;
  priorityContextEngine?: AssetPriorityContextEngine;
  multiSourceFusionEngine?: MultiSourceFusionEngine;
  sourceReconciliationEngine?: SourceReconciliationEngine;
  predictiveReadinessAssessor?: PredictiveReadinessAssessor;
  objectivePredictiveReadinessAssessor?: ObjectivePredictiveReadinessAssessor;
  predictiveMethodEligibilityEngine?: PredictiveMethodEligibilityEngine;
};

export class AssetIntelligenceEngine {
  private readonly healthComposer: HealthCompositionEngine;
  private readonly evidenceConfidenceEngine: EvidenceConfidenceEngine;
  private readonly failureIntelligence: AssetFailureIntelligenceEngine;
  private readonly trendIntelligence: AssetTrendIntelligenceEngine;
  private readonly lifecycleContextEngine: LifecycleContextEngine;
  private readonly decisionContextEngine: AssetDecisionContextEngine;
  private readonly riskSignalEngine: RiskSignalEngine;
  private readonly maintenanceRecommendationEngine: MaintenanceRecommendationEngine;
  private readonly priorityContextEngine: AssetPriorityContextEngine;
  private readonly multiSourceFusionEngine: MultiSourceFusionEngine;
  private readonly sourceReconciliationEngine: SourceReconciliationEngine;
  private readonly predictiveReadinessAssessor: PredictiveReadinessAssessor;
  private readonly objectivePredictiveReadinessAssessor: ObjectivePredictiveReadinessAssessor;
  private readonly predictiveMethodEligibilityEngine: PredictiveMethodEligibilityEngine;

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
    this.decisionContextEngine =
      deps.decisionContextEngine ??
      createAssetDecisionContextEngine({
        newId: (p) => this.deps.repository.newId(p),
      });
    this.riskSignalEngine =
      deps.riskSignalEngine ??
      createRiskSignalEngine({ newId: (p) => this.deps.repository.newId(p) });
    this.maintenanceRecommendationEngine =
      deps.maintenanceRecommendationEngine ??
      createMaintenanceRecommendationEngine({
        newId: (p) => this.deps.repository.newId(p),
      });
    this.priorityContextEngine =
      deps.priorityContextEngine ??
      createAssetPriorityContextEngine({ newId: (p) => this.deps.repository.newId(p) });
    this.multiSourceFusionEngine =
      deps.multiSourceFusionEngine ??
      createMultiSourceFusionEngine({ newId: (p) => this.deps.repository.newId(p) });
    this.sourceReconciliationEngine =
      deps.sourceReconciliationEngine ??
      createSourceReconciliationEngine({ newId: (p) => this.deps.repository.newId(p) });
    this.predictiveReadinessAssessor =
      deps.predictiveReadinessAssessor ??
      createPredictiveReadinessAssessor({ newId: (p) => this.deps.repository.newId(p) });
    this.objectivePredictiveReadinessAssessor =
      deps.objectivePredictiveReadinessAssessor ??
      createObjectivePredictiveReadinessAssessor({
        newId: (p) => this.deps.repository.newId(p),
      });
    this.predictiveMethodEligibilityEngine =
      deps.predictiveMethodEligibilityEngine ??
      createPredictiveMethodEligibilityEngine({
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

  /**
   * Phase 10H — compose Decision Context from published/approved slices only.
   * Draft, rejected, superseded, and revoked slices never shape the context.
   */
  private async prepareDecisionContext(cmd: {
    tenantId: string;
    workspaceId: string;
    assetId: string;
    sourceKey: string;
    scope: string;
    evidenceRefs?: string[];
    observedAt?: string;
    recordedAt: string;
    correlationId?: string;
    createdBy?: string;
  }): Promise<{
    identity: AssetIdentityReference;
    context: PersistedDecisionContext;
    domainContext: AssetDecisionContext;
    evidenceConfidence: import("./evidence-confidence").EvidenceConfidenceAssessment;
    abstained: boolean;
    abstentionReason?: string;
    timelineEntries: IntelligenceTimelineEntry[];
    healthIndex?: PersistedHealthIndexState;
    condition?: PersistedConditionState;
    criticality?: PersistedCriticalityState;
  }> {
    const identity = await this.resolveIdentity(cmd);
    const recordedAt = cmd.recordedAt;
    const evidenceRefs = cmd.evidenceRefs ?? [];

    const [
      condition,
      reliability,
      criticality,
      failureMode,
      trend,
      degradation,
      lifecycle,
      healthProfile,
      healthIndex,
    ] = await Promise.all([
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
      this.deps.repository.latestLifecycleState(cmd.tenantId, cmd.workspaceId, cmd.assetId),
      this.deps.repository.latestHealthProfile(cmd.tenantId, cmd.workspaceId, cmd.assetId),
      this.deps.repository.latestHealthIndex(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.assetId,
        recordedAt,
      ),
    ]);

    const evidenceConfidence = this.evidenceConfidenceEngine.assess({
      assessmentId: this.deps.repository.newId("ec"),
      assetId: cmd.assetId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      scope: cmd.scope,
      evidenceRefs,
      sourceKeys: [cmd.sourceKey],
      observedAt: cmd.observedAt ?? recordedAt,
      asOf: recordedAt,
      reviewStatus: healthProfile?.reviewStatus ?? condition?.status,
      confidenceHint: condition?.conditionConfidence,
    });
    await this.deps.repository.saveEvidenceConfidence({
      ...evidenceConfidence,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      version: 1,
    });

    // Only published/approved slices are forwarded — draft/rejected work must not shape decision context.
    const composed = this.decisionContextEngine.compose({
      assetId: cmd.assetId,
      snapshotId: healthProfile?.snapshotId,
      healthProfileRef: isPublishedStatus(healthProfile?.reviewStatus)
        ? healthProfile?.profileId
        : undefined,
      condition: condition
        ? { stateId: condition.stateId, reviewStatus: condition.status }
        : undefined,
      reliability: reliability
        ? { stateId: reliability.stateId, reviewStatus: reliability.reviewStatus }
        : undefined,
      criticality: criticality
        ? { stateId: criticality.stateId, reviewStatus: criticality.reviewStatus }
        : undefined,
      lifecycle: lifecycle
        ? { stateId: lifecycle.stateId, reviewStatus: lifecycle.reviewStatus }
        : undefined,
      failures: failureMode
        ? [{ stateId: failureMode.stateId, reviewStatus: failureMode.reviewStatus }]
        : [],
      trends: trend
        ? [
            {
              stateId: trend.stateId,
              reviewStatus: trend.reviewStatus,
              trendConfidence: trend.trendConfidence,
            },
          ]
        : [],
      degradations: degradation
        ? [{ stateId: degradation.stateId, reviewStatus: degradation.reviewStatus }]
        : [],
      evidenceConfidence,
      assessedAt: recordedAt,
    });

    const context: PersistedDecisionContext = {
      ...composed.context,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      createdBy: cmd.createdBy,
    };
    await this.deps.repository.saveDecisionContext(context);
    await this.deps.repository.cacheIdentity(identity);

    const timelineEntries = await this.appendStateTimelines({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      recordedAt,
      sourceKey: cmd.sourceKey,
      provenance: {
        sourceSystem: cmd.sourceKey,
        observedAt: cmd.observedAt ?? recordedAt,
        method: "decision_context_compose_v1",
        evidenceRefs,
        policyId: "asset_intelligence.decision_context.compose.v1",
      },
      correlationId: cmd.correlationId,
      items: [{ kind: "decision_context", stateId: context.id }],
    });

    return {
      identity,
      context,
      domainContext: composed.context,
      evidenceConfidence,
      abstained: composed.abstained,
      abstentionReason: composed.abstentionReason,
      timelineEntries,
      healthIndex,
      condition,
      criticality,
    };
  }

  async composeDecisionContext(
    cmd: ComposeDecisionContextCommand,
  ): Promise<EngineDecisionContextResult> {
    if (cmd.actorRole) assertFailureCapability(cmd.actorRole, "decision_context.read");
    const sourceKey = cmd.sourceKey ?? "manual.engineering_assessment";
    assertRegisteredActiveSource(sourceKey, "decision_context");

    if (cmd.idempotencyKey) {
      const existing = await this.deps.repository.findIdempotency(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.idempotencyKey,
      );
      if (existing?.responsePayload?.result) {
        return {
          ...(existing.responsePayload.result as EngineDecisionContextResult),
          idempotentReplay: true,
        };
      }
    }

    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const prepared = await this.prepareDecisionContext({
      ...cmd,
      sourceKey,
      scope: "decision_context",
      recordedAt,
    });

    const ev = createAssetIntelligenceEvent({
      type: "engineering.asset.decision_context.composed",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: prepared.context.id,
      occurredAt: recordedAt,
      correlationId: cmd.correlationId,
      payload: {
        sourceKey,
        kind: "decision_context",
        status: prepared.context.decisionContextClass,
      },
    });
    await this.deps.events.publish(ev);
    await this.deps.repository.appendEvent(ev);

    const result: EngineDecisionContextResult = {
      identityOwner: "engineering_os_shared_domain",
      decisionContext: prepared.context,
      evidenceConfidence: prepared.evidenceConfidence,
      timelineEntries: prepared.timelineEntries,
      abstained: prepared.abstained,
      abstentionReason: prepared.abstentionReason,
      identityMutated: false,
      healthMutated: false,
      autonomousDecisionAuthority: false,
      createsCoreRisk: false,
      createsWorkOrder: false,
      mutatesCanonicalLifecycle: false,
    };

    if (cmd.idempotencyKey) {
      await this.deps.repository.saveIdempotency({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        idempotencyKey: cmd.idempotencyKey,
        operation: "compose_decision_context",
        resourceId: prepared.context.id,
        responsePayload: { result },
      });
    }
    return result;
  }

  async assessRisk(cmd: AssessRiskCommand): Promise<EngineRiskResult> {
    if (cmd.actorRole) assertFailureCapability(cmd.actorRole, "risk.assess");
    const sourceKey = cmd.sourceKey ?? "manual.engineering_assessment";
    assertRegisteredActiveSource(sourceKey, "risk");

    if (cmd.idempotencyKey) {
      const existing = await this.deps.repository.findIdempotency(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.idempotencyKey,
      );
      if (existing?.responsePayload?.result) {
        return {
          ...(existing.responsePayload.result as EngineRiskResult),
          idempotentReplay: true,
        };
      }
    }

    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const prepared = await this.prepareDecisionContext({
      ...cmd,
      sourceKey,
      scope: "risk_signal",
      recordedAt,
    });

    const assessed = this.riskSignalEngine.assess({
      decisionContext: prepared.domainContext,
      evidenceConfidence: prepared.evidenceConfidence,
      trendConfidence: prepared.domainContext.trendConfidence,
      assessedAt: recordedAt,
      actorId: cmd.createdBy,
    });

    let reviewInstanceId: string | undefined;
    let reviewWorkflowInstance: EngineeringWorkflowInstance | undefined;
    if (!assessed.abstained && cmd.startReview !== false) {
      const review = startRiskReview({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        riskSignalStateId: assessed.riskSignal.id,
        startedBy: cmd.createdBy,
      });
      reviewInstanceId = review.instance.instanceId;
      reviewWorkflowInstance = review.instance;
      assessed.riskSignal.reviewInstanceId = reviewInstanceId;
      assessed.riskSignal.reviewStatus = "pending_review";
    }

    const version = await this.deps.repository.nextRiskVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      cmd.expectedVersion,
    );
    const riskSignal: PersistedRiskSignalState = {
      ...assessed.riskSignal,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      version,
      createdBy: cmd.createdBy,
    };
    await this.deps.repository.saveRiskSignal(riskSignal);

    const riskCandidates: PersistedRiskCandidate[] = [];
    if (assessed.riskCandidate) {
      const candidate: PersistedRiskCandidate = {
        ...assessed.riskCandidate,
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
      };
      await this.deps.repository.saveRiskCandidate(candidate);
      riskCandidates.push(candidate);
    }

    const timelineItems: Array<{ kind: IntelligenceTimelineEntry["kind"]; stateId: string }> = [
      { kind: "risk_signal", stateId: riskSignal.id },
    ];
    for (const candidate of riskCandidates) {
      timelineItems.push({ kind: "risk_candidate", stateId: candidate.candidateId });
    }
    const timelineEntries = [
      ...prepared.timelineEntries,
      ...(await this.appendStateTimelines({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        assetId: cmd.assetId,
        recordedAt,
        sourceKey,
        provenance: {
          sourceSystem: sourceKey,
          observedAt: cmd.observedAt ?? recordedAt,
          method: "risk_signal_compose_v1",
          evidenceRefs: cmd.evidenceRefs ?? [],
          policyId: "asset_intelligence.risk.assess.v1",
        },
        correlationId: cmd.correlationId,
        items: timelineItems,
      })),
    ];

    const snapshot = composeAssetSnapshot({
      identity: prepared.identity,
      asOf: recordedAt,
      condition: prepared.condition,
      healthIndex: prepared.healthIndex,
      criticality: prepared.criticality,
      evidenceConfidence: prepared.evidenceConfidence,
    });
    const snapshotId = this.deps.repository.newId("snap");
    await this.deps.repository.saveSnapshot({
      id: snapshotId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      schemaVersion: "asset_snapshot/1",
      capturedAt: recordedAt,
      conditionStateId: prepared.condition?.stateId,
      healthIndex: prepared.healthIndex,
      identityReference: prepared.identity,
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
      eventType: "engineering.asset.risk_signal.assessed",
      payload: {
        sourceKey,
        kind: "risk_signal",
        status: riskSignal.reviewStatus,
        silentIdentityMutationForbidden: true,
        rawEvidenceForbidden: true,
        secretsForbidden: true,
      },
      correlationId: cmd.correlationId,
      stateId: riskSignal.id,
      published: false,
      createdAt: recordedAt,
    });

    const eventTypes: Array<import("./events").AssetIntelligenceEventType> = [
      "engineering.asset.risk_signal.assessed",
      "engineering.asset.evidence_confidence.assessed",
    ];
    if (riskCandidates.length > 0) {
      eventTypes.push("engineering.asset.risk_candidate.proposed");
    }
    for (const type of eventTypes) {
      const ev = createAssetIntelligenceEvent({
        type,
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        assetId: cmd.assetId,
        stateId: riskSignal.id,
        occurredAt: recordedAt,
        correlationId: cmd.correlationId,
        payload: { sourceKey, kind: "risk_signal", status: riskSignal.reviewStatus },
      });
      await this.deps.events.publish(ev);
      await this.deps.repository.appendEvent(ev);
    }
    await this.deps.repository.markOutboxPublished(outboxEventId, recordedAt);

    const result: EngineRiskResult = {
      identityOwner: "engineering_os_shared_domain",
      decisionContext: prepared.context,
      riskSignal,
      riskCandidates,
      evidenceConfidence: prepared.evidenceConfidence,
      timelineEntries,
      snapshot,
      snapshotId,
      outboxEventId,
      reviewInstanceId,
      reviewWorkflowInstance,
      abstained: assessed.abstained,
      abstentionReason: assessed.abstentionReason,
      identityMutated: false,
      healthMutated: false,
      riskHealthContributionEnabled: false,
      createsCoreRisk: false,
      riskCoreAutoMutationAllowed: false,
      canonicalEngineeringRiskOwnership: "engineering_core",
      createsWorkOrder: false,
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
        operation: "assess_risk",
        resourceId: riskSignal.id,
        responsePayload: { result },
      });
    }
    return result;
  }

  async reviewRisk(cmd: ReviewRiskCommand): Promise<{
    riskSignal: PersistedRiskSignalState;
    workflowInstance: EngineeringWorkflowInstance;
    identityMutated: false;
    healthMutated: false;
    createsCoreRisk: false;
    riskCoreAutoMutationAllowed: false;
    aiMayPublishForbidden: true;
  }> {
    const capability =
      cmd.action === "approve" ? "risk.approve" : cmd.publish ? "risk.publish" : "risk.review";
    if (cmd.actorRole) {
      assertFailureCapability(cmd.actorRole, capability, { actorId: cmd.reviewerId });
    }
    const latest = await this.deps.repository.latestRiskSignal(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
    );
    if (!latest || latest.id !== cmd.riskSignalStateId) {
      throw new Error("risk_signal_state_not_found");
    }
    if (latest.reviewStatus === "published") {
      throw new Error("published_risk_signal_immutable");
    }
    const workflowInstance = transitionRiskReview({
      instance: cmd.workflowInstance,
      action: cmd.action,
      to: cmd.to,
    });
    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const nextStatus = cmd.publish && cmd.to === "approved" ? "published" : cmd.to;
    const version = await this.deps.repository.nextRiskVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      latest.version,
    );
    const riskSignal: PersistedRiskSignalState = {
      ...latest,
      id: this.deps.repository.newId("risk_signal"),
      version,
      reviewStatus: nextStatus,
      reviewedAt: recordedAt,
      publishedAt: nextStatus === "published" ? recordedAt : latest.publishedAt,
      supersedesId: latest.id,
      provenance: {
        ...latest.provenance,
        reviewedBy: cmd.reviewerId,
        approvedAt: cmd.to === "approved" ? recordedAt : undefined,
        riskCoreAutoMutationAllowed: false,
      },
    };
    await this.deps.repository.saveRiskSignal(riskSignal);
    await this.deps.repository.saveRiskReview({
      reviewId: this.deps.repository.newId("rrev"),
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      riskSignalStateId: riskSignal.id,
      reviewInstanceId: workflowInstance.instanceId,
      action: cmd.action,
      reviewerId: cmd.reviewerId,
      reason: cmd.reason,
      stateVersion: version,
      evidenceConfidenceRef: riskSignal.evidenceConfidenceRef,
      trendConfidenceRef: riskSignal.trendConfidenceRef,
      correlationId: cmd.correlationId,
      createdAt: recordedAt,
    });
    await this.appendStateTimelines({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      recordedAt,
      sourceKey: "asset_intelligence.review",
      provenance: {
        sourceSystem: "asset_intelligence.review",
        observedAt: recordedAt,
        method: "risk_signal_compose_v1",
        reviewedBy: cmd.reviewerId,
      },
      correlationId: cmd.correlationId,
      items: [
        {
          kind: nextStatus === "published" ? "risk_published" : "risk_review",
          stateId: riskSignal.id,
        },
      ],
    });
    const ev = createAssetIntelligenceEvent({
      type:
        nextStatus === "published"
          ? "engineering.asset.risk_signal.published"
          : "engineering.asset.risk_signal.reviewed",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: riskSignal.id,
      occurredAt: recordedAt,
      correlationId: cmd.correlationId,
      payload: { kind: "risk_signal", status: nextStatus },
    });
    await this.deps.events.publish(ev);
    await this.deps.repository.appendEvent(ev);
    return {
      riskSignal,
      workflowInstance,
      identityMutated: false,
      healthMutated: false,
      createsCoreRisk: false,
      riskCoreAutoMutationAllowed: false,
      aiMayPublishForbidden: true,
    };
  }

  async assessMaintenanceRecommendation(
    cmd: AssessMaintenanceRecommendationCommand,
  ): Promise<EngineMaintenanceRecommendationResult> {
    if (cmd.actorRole) {
      assertFailureCapability(cmd.actorRole, "maintenance_recommendation.assess");
    }
    const sourceKey = cmd.sourceKey ?? "manual.engineering_assessment";
    assertRegisteredActiveSource(sourceKey, "maintenance_recommendation");

    if (cmd.idempotencyKey) {
      const existing = await this.deps.repository.findIdempotency(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.idempotencyKey,
      );
      if (existing?.responsePayload?.result) {
        return {
          ...(existing.responsePayload.result as EngineMaintenanceRecommendationResult),
          idempotentReplay: true,
        };
      }
    }

    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const prepared = await this.prepareDecisionContext({
      ...cmd,
      sourceKey,
      scope: "maintenance_recommendation",
      recordedAt,
    });
    const riskSignal = await this.deps.repository.latestRiskSignal(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
    );

    const assessed = this.maintenanceRecommendationEngine.assess({
      decisionContext: prepared.domainContext,
      riskSignal,
      evidenceConfidence: prepared.evidenceConfidence,
      trendConfidence: prepared.domainContext.trendConfidence,
      assessedAt: recordedAt,
    });

    let reviewInstanceId: string | undefined;
    let reviewWorkflowInstance: EngineeringWorkflowInstance | undefined;
    if (!assessed.abstained && cmd.startReview !== false) {
      const review = startMaintenanceRecommendationReview({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        recommendationStateId: assessed.recommendation.id,
        startedBy: cmd.createdBy,
      });
      reviewInstanceId = review.instance.instanceId;
      reviewWorkflowInstance = review.instance;
      assessed.recommendation.reviewInstanceId = reviewInstanceId;
      assessed.recommendation.reviewStatus = "pending_review";
    }

    const version = await this.deps.repository.nextMaintenanceRecommendationVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      cmd.expectedVersion,
    );
    const recommendation: PersistedMaintenanceRecommendationState = {
      ...assessed.recommendation,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      version,
      createdBy: cmd.createdBy,
    };
    await this.deps.repository.saveMaintenanceRecommendation(recommendation);

    const timelineEntries = [
      ...prepared.timelineEntries,
      ...(await this.appendStateTimelines({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        assetId: cmd.assetId,
        recordedAt,
        sourceKey,
        provenance: {
          sourceSystem: sourceKey,
          observedAt: cmd.observedAt ?? recordedAt,
          method: "maintenance_recommendation_compose_v1",
          evidenceRefs: cmd.evidenceRefs ?? [],
          policyId: "asset_intelligence.maintenance_recommendation.assess.v1",
        },
        correlationId: cmd.correlationId,
        items: [{ kind: "maintenance_recommendation", stateId: recommendation.id }],
      })),
    ];

    const outboxEventId = this.deps.repository.newId("outbox");
    await this.deps.repository.appendOutbox({
      id: outboxEventId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      eventType: "engineering.asset.maintenance_recommendation.assessed",
      payload: {
        sourceKey,
        kind: "maintenance_recommendation",
        status: recommendation.reviewStatus,
        silentIdentityMutationForbidden: true,
        rawEvidenceForbidden: true,
        secretsForbidden: true,
      },
      correlationId: cmd.correlationId,
      stateId: recommendation.id,
      published: false,
      createdAt: recordedAt,
    });
    const ev = createAssetIntelligenceEvent({
      type: "engineering.asset.maintenance_recommendation.assessed",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: recommendation.id,
      occurredAt: recordedAt,
      correlationId: cmd.correlationId,
      payload: {
        sourceKey,
        kind: "maintenance_recommendation",
        status: recommendation.reviewStatus,
      },
    });
    await this.deps.events.publish(ev);
    await this.deps.repository.appendEvent(ev);
    await this.deps.repository.markOutboxPublished(outboxEventId, recordedAt);

    const result: EngineMaintenanceRecommendationResult = {
      identityOwner: "engineering_os_shared_domain",
      decisionContext: prepared.context,
      recommendation,
      evidenceConfidence: prepared.evidenceConfidence,
      timelineEntries,
      outboxEventId,
      reviewInstanceId,
      reviewWorkflowInstance,
      abstained: assessed.abstained,
      abstentionReason: assessed.abstentionReason,
      identityMutated: false,
      healthMutated: false,
      createsWorkOrder: false,
      cmmsWorkOrderOwnership: "none_in_asset_intelligence",
      mutatesCanonicalLifecycle: false,
      rulClaimsCertified: false,
      aiMayPublishForbidden: true,
    };

    if (cmd.idempotencyKey) {
      await this.deps.repository.saveIdempotency({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        idempotencyKey: cmd.idempotencyKey,
        operation: "assess_maintenance_recommendation",
        resourceId: recommendation.id,
        responsePayload: { result },
      });
    }
    return result;
  }

  async reviewMaintenanceRecommendation(
    cmd: ReviewMaintenanceRecommendationCommand,
  ): Promise<{
    recommendation: PersistedMaintenanceRecommendationState;
    workflowInstance: EngineeringWorkflowInstance;
    identityMutated: false;
    healthMutated: false;
    createsWorkOrder: false;
    aiMayPublishForbidden: true;
  }> {
    const capability =
      cmd.action === "approve"
        ? "maintenance_recommendation.approve"
        : cmd.publish
          ? "maintenance_recommendation.publish"
          : "maintenance_recommendation.review";
    if (cmd.actorRole) {
      assertFailureCapability(cmd.actorRole, capability, { actorId: cmd.reviewerId });
    }
    const latest = await this.deps.repository.latestMaintenanceRecommendation(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
    );
    if (!latest || latest.id !== cmd.recommendationStateId) {
      throw new Error("maintenance_recommendation_state_not_found");
    }
    if (latest.reviewStatus === "published") {
      throw new Error("published_maintenance_recommendation_immutable");
    }
    const workflowInstance = transitionMaintenanceRecommendationReview({
      instance: cmd.workflowInstance,
      action: cmd.action,
      to: cmd.to,
    });
    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const nextStatus = cmd.publish && cmd.to === "approved" ? "published" : cmd.to;
    const version = await this.deps.repository.nextMaintenanceRecommendationVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      latest.version,
    );
    const recommendation: PersistedMaintenanceRecommendationState = {
      ...latest,
      id: this.deps.repository.newId("maint_rec"),
      version,
      reviewStatus: nextStatus,
      reviewedAt: recordedAt,
      publishedAt: nextStatus === "published" ? recordedAt : latest.publishedAt,
      supersedesId: latest.id,
      provenance: {
        ...latest.provenance,
        reviewedBy: cmd.reviewerId,
        approvedAt: cmd.to === "approved" ? recordedAt : undefined,
        createsWorkOrder: false,
      },
    };
    await this.deps.repository.saveMaintenanceRecommendation(recommendation);
    await this.deps.repository.saveMaintenanceRecommendationReview({
      reviewId: this.deps.repository.newId("mrev"),
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      recommendationStateId: recommendation.id,
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
      provenance: {
        sourceSystem: "asset_intelligence.review",
        observedAt: recordedAt,
        method: "maintenance_recommendation_compose_v1",
        reviewedBy: cmd.reviewerId,
      },
      correlationId: cmd.correlationId,
      items: [
        {
          kind:
            nextStatus === "published"
              ? "maintenance_recommendation_published"
              : "maintenance_recommendation_review",
          stateId: recommendation.id,
        },
      ],
    });
    const ev = createAssetIntelligenceEvent({
      type:
        nextStatus === "published"
          ? "engineering.asset.maintenance_recommendation.published"
          : "engineering.asset.maintenance_recommendation.reviewed",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: recommendation.id,
      occurredAt: recordedAt,
      correlationId: cmd.correlationId,
      payload: { kind: "maintenance_recommendation", status: nextStatus },
    });
    await this.deps.events.publish(ev);
    await this.deps.repository.appendEvent(ev);
    return {
      recommendation,
      workflowInstance,
      identityMutated: false,
      healthMutated: false,
      createsWorkOrder: false,
      aiMayPublishForbidden: true,
    };
  }

  async assessPriority(cmd: AssessPriorityCommand): Promise<EnginePriorityResult> {
    if (cmd.actorRole) assertFailureCapability(cmd.actorRole, "priority.assess");
    const sourceKey = cmd.sourceKey ?? "manual.engineering_assessment";
    assertRegisteredActiveSource(sourceKey, "priority");

    if (cmd.idempotencyKey) {
      const existing = await this.deps.repository.findIdempotency(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.idempotencyKey,
      );
      if (existing?.responsePayload?.result) {
        return {
          ...(existing.responsePayload.result as EnginePriorityResult),
          idempotentReplay: true,
        };
      }
    }

    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const prepared = await this.prepareDecisionContext({
      ...cmd,
      sourceKey,
      scope: "priority_context",
      recordedAt,
    });
    const [riskSignal, recommendation] = await Promise.all([
      this.deps.repository.latestRiskSignal(cmd.tenantId, cmd.workspaceId, cmd.assetId),
      this.deps.repository.latestMaintenanceRecommendation(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.assetId,
      ),
    ]);

    const composed = this.priorityContextEngine.compose({
      decisionContext: prepared.domainContext,
      riskSignal,
      maintenanceRecommendations: recommendation ? [recommendation] : [],
      evidenceConfidence: prepared.evidenceConfidence,
      trendConfidence: prepared.domainContext.trendConfidence,
      assessedAt: recordedAt,
    });

    let reviewInstanceId: string | undefined;
    let reviewWorkflowInstance: EngineeringWorkflowInstance | undefined;
    if (!composed.abstained && cmd.startReview !== false) {
      const review = startPriorityReview({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        priorityProfileId: composed.profile.id,
        startedBy: cmd.createdBy,
      });
      reviewInstanceId = review.instance.instanceId;
      reviewWorkflowInstance = review.instance;
      composed.profile.reviewInstanceId = reviewInstanceId;
      composed.profile.reviewStatus = "pending_review";
    }

    const version = await this.deps.repository.nextPriorityVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      cmd.expectedVersion,
    );
    const priorityProfile: PersistedPriorityProfile = {
      ...composed.profile,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      version,
      createdBy: cmd.createdBy,
    };
    await this.deps.repository.savePriorityProfile(priorityProfile);

    const timelineEntries = [
      ...prepared.timelineEntries,
      ...(await this.appendStateTimelines({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        assetId: cmd.assetId,
        recordedAt,
        sourceKey,
        provenance: {
          sourceSystem: sourceKey,
          observedAt: cmd.observedAt ?? recordedAt,
          method: "priority_context_compose_v1",
          evidenceRefs: cmd.evidenceRefs ?? [],
          policyId: "asset_intelligence.priority.assess.v1",
        },
        correlationId: cmd.correlationId,
        items: [{ kind: "priority_profile", stateId: priorityProfile.id }],
      })),
    ];

    const outboxEventId = this.deps.repository.newId("outbox");
    await this.deps.repository.appendOutbox({
      id: outboxEventId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      eventType: "engineering.asset.priority.assessed",
      payload: {
        sourceKey,
        kind: "priority",
        status: priorityProfile.reviewStatus,
        silentIdentityMutationForbidden: true,
        rawEvidenceForbidden: true,
        secretsForbidden: true,
      },
      correlationId: cmd.correlationId,
      stateId: priorityProfile.id,
      published: false,
      createdAt: recordedAt,
    });
    const ev = createAssetIntelligenceEvent({
      type: "engineering.asset.priority.assessed",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: priorityProfile.id,
      occurredAt: recordedAt,
      correlationId: cmd.correlationId,
      payload: { sourceKey, kind: "priority", status: priorityProfile.reviewStatus },
    });
    await this.deps.events.publish(ev);
    await this.deps.repository.appendEvent(ev);
    await this.deps.repository.markOutboxPublished(outboxEventId, recordedAt);

    const result: EnginePriorityResult = {
      identityOwner: "engineering_os_shared_domain",
      decisionContext: prepared.context,
      priorityProfile,
      evidenceConfidence: prepared.evidenceConfidence,
      timelineEntries,
      outboxEventId,
      reviewInstanceId,
      reviewWorkflowInstance,
      abstained: composed.abstained,
      abstentionReason: composed.abstentionReason,
      identityMutated: false,
      healthMutated: false,
      priorityHealthContributionEnabled: false,
      numericPriorityScoreRequired: false,
      createsWorkOrder: false,
      impliesPoF: false,
      mutatesCanonicalLifecycle: false,
      aiMayPublishForbidden: true,
    };

    if (cmd.idempotencyKey) {
      await this.deps.repository.saveIdempotency({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        idempotencyKey: cmd.idempotencyKey,
        operation: "assess_priority",
        resourceId: priorityProfile.id,
        responsePayload: { result },
      });
    }
    return result;
  }

  async reviewPriority(cmd: ReviewPriorityCommand): Promise<{
    priorityProfile: PersistedPriorityProfile;
    workflowInstance: EngineeringWorkflowInstance;
    identityMutated: false;
    healthMutated: false;
    priorityHealthContributionEnabled: false;
    aiMayPublishForbidden: true;
  }> {
    const capability =
      cmd.action === "approve"
        ? "priority.approve"
        : cmd.publish
          ? "priority.publish"
          : "priority.review";
    if (cmd.actorRole) {
      assertFailureCapability(cmd.actorRole, capability, { actorId: cmd.reviewerId });
    }
    const latest = await this.deps.repository.latestPriorityProfile(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
    );
    if (!latest || latest.id !== cmd.priorityProfileId) {
      throw new Error("priority_profile_not_found");
    }
    if (latest.reviewStatus === "published") {
      throw new Error("published_priority_immutable");
    }
    const workflowInstance = transitionPriorityReview({
      instance: cmd.workflowInstance,
      action: cmd.action,
      to: cmd.to,
    });
    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const nextStatus = cmd.publish && cmd.to === "approved" ? "published" : cmd.to;
    const version = await this.deps.repository.nextPriorityVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      latest.version,
    );
    const priorityProfile: PersistedPriorityProfile = {
      ...latest,
      id: this.deps.repository.newId("priority"),
      version,
      reviewStatus: nextStatus,
      reviewedAt: recordedAt,
      publishedAt: nextStatus === "published" ? recordedAt : latest.publishedAt,
      supersedesId: latest.id,
      provenance: {
        ...latest.provenance,
        reviewedBy: cmd.reviewerId,
        approvedAt: cmd.to === "approved" ? recordedAt : undefined,
        isHealthFactor: false,
      },
    };
    await this.deps.repository.savePriorityProfile(priorityProfile);
    await this.deps.repository.savePriorityReview({
      reviewId: this.deps.repository.newId("prev"),
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      priorityProfileId: priorityProfile.id,
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
      provenance: {
        sourceSystem: "asset_intelligence.review",
        observedAt: recordedAt,
        method: "priority_context_compose_v1",
        reviewedBy: cmd.reviewerId,
      },
      correlationId: cmd.correlationId,
      items: [
        {
          kind: nextStatus === "published" ? "priority_published" : "priority_review",
          stateId: priorityProfile.id,
        },
      ],
    });
    const ev = createAssetIntelligenceEvent({
      type:
        nextStatus === "published"
          ? "engineering.asset.priority.published"
          : "engineering.asset.priority.reviewed",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: priorityProfile.id,
      occurredAt: recordedAt,
      correlationId: cmd.correlationId,
      payload: { kind: "priority", status: nextStatus },
    });
    await this.deps.events.publish(ev);
    await this.deps.repository.appendEvent(ev);
    return {
      priorityProfile,
      workflowInstance,
      identityMutated: false,
      healthMutated: false,
      priorityHealthContributionEnabled: false,
      aiMayPublishForbidden: true,
    };
  }

  /**
   * Phase 10H — orchestrated Decision Context → Risk → Maintenance Recommendation → Priority.
   * Never creates Core Risk or work orders; every state is persisted and review-gated.
   */
  async assessRiskPriorityBundle(
    cmd: AssessRiskPriorityBundleCommand,
  ): Promise<EngineRiskPriorityBundleResult> {
    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const risk = await this.assessRisk({ ...cmd, recordedAt });
    const recommendation = await this.assessMaintenanceRecommendation({
      ...cmd,
      recordedAt,
      idempotencyKey: cmd.idempotencyKey ? `${cmd.idempotencyKey}:maintenance` : undefined,
    });
    const priority = await this.assessPriority({
      ...cmd,
      recordedAt,
      idempotencyKey: cmd.idempotencyKey ? `${cmd.idempotencyKey}:priority` : undefined,
    });

    return {
      identityOwner: "engineering_os_shared_domain",
      decisionContext: risk.decisionContext,
      riskSignal: risk.riskSignal,
      riskCandidates: risk.riskCandidates,
      recommendation: recommendation.recommendation,
      priorityProfile: priority.priorityProfile,
      evidenceConfidence: risk.evidenceConfidence,
      timelineEntries: [
        ...risk.timelineEntries,
        ...recommendation.timelineEntries,
        ...priority.timelineEntries,
      ],
      snapshot: risk.snapshot,
      snapshotId: risk.snapshotId,
      outboxEventIds: [
        risk.outboxEventId,
        recommendation.outboxEventId,
        priority.outboxEventId,
      ],
      riskReviewInstanceId: risk.reviewInstanceId,
      maintenanceReviewInstanceId: recommendation.reviewInstanceId,
      priorityReviewInstanceId: priority.reviewInstanceId,
      abstained: risk.abstained || recommendation.abstained || priority.abstained,
      abstentionReason:
        risk.abstentionReason ?? recommendation.abstentionReason ?? priority.abstentionReason,
      identityMutated: false,
      healthMutated: false,
      riskHealthContributionEnabled: false,
      priorityHealthContributionEnabled: false,
      createsCoreRisk: false,
      riskCoreAutoMutationAllowed: false,
      canonicalEngineeringRiskOwnership: "engineering_core",
      createsWorkOrder: false,
      cmmsWorkOrderOwnership: "none_in_asset_intelligence",
      mutatesCanonicalLifecycle: false,
      predictiveMlUsed: false,
      probabilityOfFailureCertified: false,
      rulClaimsCertified: false,
      accuracyClaimsCertified: false,
      numericPriorityScoreRequired: false,
      aiMayPublishForbidden: true,
    };
  }

  /**
   * Phase 10I — load published slices, fuse, reconcile, and persist.
   * Fusion never executes predictive ML and never resolves conflicts autonomously.
   */
  private async prepareFusion(cmd: AssessFusionCommand & { sourceKey: string; recordedAt: string }): Promise<{
    identity: AssetIdentityReference;
    fusionState: PersistedFusionState;
    reconciliation: PersistedReconciliationRecord;
    evidenceConfidence: import("./evidence-confidence").EvidenceConfidenceAssessment;
    timelineEntries: IntelligenceTimelineEntry[];
    abstained: boolean;
    abstentionReason?: string;
    reviewInstanceId?: string;
    reviewWorkflowInstance?: EngineeringWorkflowInstance;
    healthIndex?: PersistedHealthIndexState;
    condition?: PersistedConditionState;
    criticality?: PersistedCriticalityState;
  }> {
    const identity = await this.resolveIdentity(cmd);
    const recordedAt = cmd.recordedAt;
    const evidenceRefs = cmd.evidenceRefs ?? [];

    const [
      condition,
      reliability,
      criticality,
      failureMode,
      trend,
      degradation,
      lifecycle,
      decisionContext,
      riskSignal,
      recommendation,
      priorityProfile,
      healthProfile,
      healthIndex,
    ] = await Promise.all([
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
      this.deps.repository.latestLifecycleState(cmd.tenantId, cmd.workspaceId, cmd.assetId),
      this.deps.repository.latestDecisionContext(cmd.tenantId, cmd.workspaceId, cmd.assetId),
      this.deps.repository.latestRiskSignal(cmd.tenantId, cmd.workspaceId, cmd.assetId),
      this.deps.repository.latestMaintenanceRecommendation(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.assetId,
      ),
      this.deps.repository.latestPriorityProfile(cmd.tenantId, cmd.workspaceId, cmd.assetId),
      this.deps.repository.latestHealthProfile(cmd.tenantId, cmd.workspaceId, cmd.assetId),
      this.deps.repository.latestHealthIndex(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.assetId,
        recordedAt,
      ),
    ]);

    const evidenceConfidence = this.evidenceConfidenceEngine.assess({
      assessmentId: this.deps.repository.newId("ec"),
      assetId: cmd.assetId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      scope: "multi_source_fusion",
      evidenceRefs,
      sourceKeys: [cmd.sourceKey],
      observedAt: cmd.observedAt ?? recordedAt,
      asOf: recordedAt,
      reviewStatus: healthProfile?.reviewStatus ?? condition?.status,
      confidenceHint: condition?.conditionConfidence,
    });
    await this.deps.repository.saveEvidenceConfidence({
      ...evidenceConfidence,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      version: 1,
    });

    // Only published/approved slices are forwarded — draft/rejected work must not shape fusion.
    const sources: FusionSourceInput[] = [];
    const add = (
      kind: FusionSourceInput["kind"],
      stateId: string | undefined,
      reviewStatus: string | undefined,
      extra: Partial<FusionSourceInput> = {},
    ) => {
      if (!stateId) return;
      sources.push({ kind, stateId, reviewStatus: reviewStatus ?? "draft", ...extra });
    };

    add("condition", condition?.stateId, condition?.status, { authorityRank: 3 });
    add("reliability", reliability?.stateId, reliability?.reviewStatus, { authorityRank: 3 });
    add("criticality", criticality?.stateId, criticality?.reviewStatus, { authorityRank: 2 });
    add("health", healthProfile?.profileId, healthProfile?.reviewStatus, { authorityRank: 3 });
    add("failure", failureMode?.stateId, failureMode?.reviewStatus, { authorityRank: 2 });
    add("trend", trend?.stateId, trend?.reviewStatus, {
      authorityRank: 1,
      trendConfidence: trend?.trendConfidence,
    });
    add("degradation", degradation?.stateId, degradation?.reviewStatus, { authorityRank: 2 });
    add("lifecycle", lifecycle?.stateId, lifecycle?.reviewStatus, { authorityRank: 2 });
    add(
      "decision_context",
      decisionContext?.id,
      decisionContext && decisionContext.decisionContextClass !== "abstained"
        ? "published"
        : "draft",
      { authorityRank: 1 },
    );
    add("risk_signal", riskSignal?.id, riskSignal?.reviewStatus, { authorityRank: 2 });
    add("maintenance_recommendation", recommendation?.id, recommendation?.reviewStatus, {
      authorityRank: 1,
    });
    add("priority", priorityProfile?.id, priorityProfile?.reviewStatus, { authorityRank: 1 });
    if (cmd.inspectionIntelligenceStateId) {
      sources.push({
        kind: "inspection_intelligence_public",
        stateId: cmd.inspectionIntelligenceStateId,
        contractVersion: cmd.inspectionIntelligenceContractVersion,
        reviewStatus: "published",
        authorityRank: 3,
      });
    }
    if (cmd.projectIntelligenceStateId) {
      sources.push({
        kind: "project_intelligence_public",
        stateId: cmd.projectIntelligenceStateId,
        contractVersion: cmd.projectIntelligenceContractVersion,
        reviewStatus: "published",
        authorityRank: 1,
      });
    }

    const composed = this.multiSourceFusionEngine.compose({
      assetId: cmd.assetId,
      sources,
      evidenceConfidence,
      assessedAt: recordedAt,
    });

    const reconciled = this.sourceReconciliationEngine.reconcile(composed.fusion);
    composed.fusion.reconciliationRef = reconciled.id;

    let reviewInstanceId: string | undefined;
    let reviewWorkflowInstance: EngineeringWorkflowInstance | undefined;
    if (!composed.abstained && cmd.startReview !== false) {
      const review = startFusionReview({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        fusionStateId: composed.fusion.id,
        startedBy: cmd.createdBy,
      });
      reviewInstanceId = review.instance.instanceId;
      reviewWorkflowInstance = review.instance;
      composed.fusion.reviewInstanceId = reviewInstanceId;
      composed.fusion.reviewStatus = "pending_review";
    }

    const version = await this.deps.repository.nextFusionVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      cmd.expectedVersion,
    );
    const fusionState: PersistedFusionState = {
      ...composed.fusion,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      version,
      createdBy: cmd.createdBy,
    };
    await this.deps.repository.saveFusionState(fusionState);

    const reconciliation: PersistedReconciliationRecord = {
      ...reconciled,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
    };
    await this.deps.repository.saveReconciliationRecord(reconciliation);
    await this.deps.repository.cacheIdentity(identity);

    const timelineEntries = await this.appendStateTimelines({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      recordedAt,
      sourceKey: cmd.sourceKey,
      provenance: {
        sourceSystem: cmd.sourceKey,
        observedAt: cmd.observedAt ?? recordedAt,
        method: "multi_source_fusion_v1",
        evidenceRefs,
        policyId: "asset_intelligence.fusion.assess.v1",
      },
      correlationId: cmd.correlationId,
      items: [
        { kind: "fusion_state", stateId: fusionState.id },
        { kind: "reconciliation_record", stateId: reconciliation.id },
      ],
    });

    const reconciliationEvent = createAssetIntelligenceEvent({
      type: "engineering.asset.reconciliation.recorded",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: reconciliation.id,
      occurredAt: recordedAt,
      correlationId: cmd.correlationId,
      payload: {
        sourceKey: cmd.sourceKey,
        kind: "reconciliation_record",
        status: reconciliation.conflicts.length > 0 ? "conflicts_detected" : "aligned",
      },
    });
    await this.deps.events.publish(reconciliationEvent);
    await this.deps.repository.appendEvent(reconciliationEvent);

    return {
      identity,
      fusionState,
      reconciliation,
      evidenceConfidence,
      timelineEntries,
      abstained: composed.abstained,
      abstentionReason: composed.abstentionReason,
      reviewInstanceId,
      reviewWorkflowInstance,
      healthIndex,
      condition,
      criticality,
    };
  }

  async assessFusion(cmd: AssessFusionCommand): Promise<EngineFusionResult> {
    if (cmd.actorRole) assertFailureCapability(cmd.actorRole, "fusion.assess");
    const sourceKey = cmd.sourceKey ?? "manual.engineering_assessment";
    assertRegisteredActiveSource(sourceKey, "fusion");

    if (cmd.idempotencyKey) {
      const existing = await this.deps.repository.findIdempotency(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.idempotencyKey,
      );
      if (existing?.responsePayload?.result) {
        return {
          ...(existing.responsePayload.result as EngineFusionResult),
          idempotentReplay: true,
        };
      }
    }

    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const prepared = await this.prepareFusion({ ...cmd, sourceKey, recordedAt });

    const snapshot = composeAssetSnapshot({
      identity: prepared.identity,
      asOf: recordedAt,
      condition: prepared.condition,
      healthIndex: prepared.healthIndex,
      criticality: prepared.criticality,
      evidenceConfidence: prepared.evidenceConfidence,
    });
    const snapshotId = this.deps.repository.newId("snap");
    await this.deps.repository.saveSnapshot({
      id: snapshotId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      schemaVersion: "asset_snapshot/1",
      capturedAt: recordedAt,
      conditionStateId: prepared.condition?.stateId,
      healthIndex: prepared.healthIndex,
      identityReference: prepared.identity,
      sourceSet: [sourceKey],
      timelinePosition:
        prepared.timelineEntries[prepared.timelineEntries.length - 1]?.entryId,
      snapshot,
    });

    const outboxEventId = this.deps.repository.newId("outbox");
    await this.deps.repository.appendOutbox({
      id: outboxEventId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      eventType: "engineering.asset.fusion.assessed",
      payload: {
        sourceKey,
        kind: "fusion_state",
        status: prepared.fusionState.reviewStatus,
        silentIdentityMutationForbidden: true,
        rawEvidenceForbidden: true,
        secretsForbidden: true,
      },
      correlationId: cmd.correlationId,
      stateId: prepared.fusionState.id,
      published: false,
      createdAt: recordedAt,
    });

    for (const type of [
      "engineering.asset.fusion.assessed",
      "engineering.asset.evidence_confidence.assessed",
    ] as const) {
      const ev = createAssetIntelligenceEvent({
        type,
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        assetId: cmd.assetId,
        stateId: prepared.fusionState.id,
        occurredAt: recordedAt,
        correlationId: cmd.correlationId,
        payload: {
          sourceKey,
          kind: "fusion_state",
          status: prepared.fusionState.reviewStatus,
        },
      });
      await this.deps.events.publish(ev);
      await this.deps.repository.appendEvent(ev);
    }
    await this.deps.repository.markOutboxPublished(outboxEventId, recordedAt);

    const result: EngineFusionResult = {
      ...FUSION_GOVERNANCE_FLAGS,
      identityOwner: "engineering_os_shared_domain",
      fusionState: prepared.fusionState,
      reconciliation: prepared.reconciliation,
      evidenceConfidence: prepared.evidenceConfidence,
      timelineEntries: prepared.timelineEntries,
      snapshot,
      snapshotId,
      outboxEventId,
      reviewInstanceId: prepared.reviewInstanceId,
      reviewWorkflowInstance: prepared.reviewWorkflowInstance,
      abstained: prepared.abstained,
      abstentionReason: prepared.abstentionReason,
    };

    if (cmd.idempotencyKey) {
      await this.deps.repository.saveIdempotency({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        idempotencyKey: cmd.idempotencyKey,
        operation: "assess_fusion",
        resourceId: prepared.fusionState.id,
        responsePayload: { result },
      });
    }
    return result;
  }

  async reviewFusion(cmd: ReviewFusionCommand): Promise<{
    fusionState: PersistedFusionState;
    workflowInstance: EngineeringWorkflowInstance;
    identityMutated: false;
    healthMutated: false;
    fusionHealthContributionEnabled: false;
    predictiveMlExecuted: false;
    aiMayPublishForbidden: true;
  }> {
    const capability =
      cmd.action === "approve"
        ? "fusion.approve"
        : cmd.publish
          ? "fusion.publish"
          : "fusion.review";
    if (cmd.actorRole) {
      assertFailureCapability(cmd.actorRole, capability, { actorId: cmd.reviewerId });
    }
    const latest = await this.deps.repository.latestFusionState(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
    );
    if (!latest || latest.id !== cmd.fusionStateId) {
      throw new Error("fusion_state_not_found");
    }
    if (latest.reviewStatus === "published") {
      throw new Error("published_fusion_immutable");
    }
    const workflowInstance = transitionFusionReview({
      instance: cmd.workflowInstance,
      action: cmd.action,
      to: cmd.to,
    });
    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const nextStatus = cmd.publish && cmd.to === "approved" ? "published" : cmd.to;
    const version = await this.deps.repository.nextFusionVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      latest.version,
    );
    const fusionState: PersistedFusionState = {
      ...latest,
      id: this.deps.repository.newId("fusion"),
      version,
      reviewStatus: nextStatus,
      reviewedAt: recordedAt,
      publishedAt: nextStatus === "published" ? recordedAt : latest.publishedAt,
      supersedesId: latest.id,
      provenance: {
        ...latest.provenance,
        reviewedBy: cmd.reviewerId,
        approvedAt: cmd.to === "approved" ? recordedAt : undefined,
        predictiveMlExecuted: false,
      },
    };
    await this.deps.repository.saveFusionState(fusionState);
    await this.deps.repository.saveFusionReview({
      reviewId: this.deps.repository.newId("frev"),
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      fusionStateId: fusionState.id,
      reviewInstanceId: workflowInstance.instanceId,
      action: cmd.action,
      reviewerId: cmd.reviewerId,
      reason: cmd.reason,
      stateVersion: version,
      evidenceConfidenceRef: fusionState.evidenceConfidenceRef,
      trendConfidenceRef: fusionState.trendConfidenceRef,
      correlationId: cmd.correlationId,
      createdAt: recordedAt,
    });
    await this.appendStateTimelines({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      recordedAt,
      sourceKey: "asset_intelligence.review",
      provenance: {
        sourceSystem: "asset_intelligence.review",
        observedAt: recordedAt,
        method: "multi_source_fusion_v1",
        reviewedBy: cmd.reviewerId,
      },
      correlationId: cmd.correlationId,
      items: [
        {
          kind: nextStatus === "published" ? "fusion_published" : "fusion_review",
          stateId: fusionState.id,
        },
      ],
    });
    const ev = createAssetIntelligenceEvent({
      type:
        nextStatus === "published"
          ? "engineering.asset.fusion.published"
          : "engineering.asset.fusion.reviewed",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: fusionState.id,
      occurredAt: recordedAt,
      correlationId: cmd.correlationId,
      payload: { kind: "fusion_state", status: nextStatus },
    });
    await this.deps.events.publish(ev);
    await this.deps.repository.appendEvent(ev);
    if (fusionState.supersedesId) {
      const superseded = createAssetIntelligenceEvent({
        type: "engineering.asset.fusion.superseded",
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        assetId: cmd.assetId,
        stateId: fusionState.supersedesId,
        occurredAt: recordedAt,
        correlationId: cmd.correlationId,
        payload: { kind: "fusion_state", status: "superseded" },
      });
      await this.deps.events.publish(superseded);
      await this.deps.repository.appendEvent(superseded);
    }
    return {
      fusionState,
      workflowInstance,
      identityMutated: false,
      healthMutated: false,
      fusionHealthContributionEnabled: false,
      predictiveMlExecuted: false,
      aiMayPublishForbidden: true,
    };
  }

  async assessPredictiveReadiness(
    cmd: AssessPredictiveReadinessCommand,
  ): Promise<EnginePredictiveReadinessResult> {
    if (cmd.actorRole) assertFailureCapability(cmd.actorRole, "predictive_readiness.assess");
    const sourceKey = cmd.sourceKey ?? "manual.engineering_assessment";
    assertRegisteredActiveSource(sourceKey, "predictive_readiness");

    if (cmd.idempotencyKey) {
      const existing = await this.deps.repository.findIdempotency(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.idempotencyKey,
      );
      if (existing?.responsePayload?.result) {
        return {
          ...(existing.responsePayload.result as EnginePredictiveReadinessResult),
          idempotentReplay: true,
        };
      }
    }

    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const history = await this.deps.repository.listFusionHistory(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
    );
    let fusionState = cmd.fusionStateId
      ? history.find((f) => f.id === cmd.fusionStateId)
      : history[history.length - 1];
    let reconciliation: PersistedReconciliationRecord | undefined;
    let evidenceConfidence = fusionState?.evidenceConfidence;
    let timelineEntries: IntelligenceTimelineEntry[] = [];

    if (!fusionState) {
      const prepared = await this.prepareFusion({
        ...cmd,
        sourceKey,
        recordedAt,
        startReview: false,
      });
      fusionState = prepared.fusionState;
      reconciliation = prepared.reconciliation;
      evidenceConfidence = prepared.evidenceConfidence;
      timelineEntries = prepared.timelineEntries;
    } else {
      const records = await this.deps.repository.listReconciliationRecords(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.assetId,
      );
      reconciliation = records.filter((r) => r.fusionStateRef === fusionState!.id).pop();
    }

    if (!evidenceConfidence) {
      evidenceConfidence = this.evidenceConfidenceEngine.assess({
        assessmentId: this.deps.repository.newId("ec"),
        assetId: cmd.assetId,
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        scope: "predictive_readiness",
        evidenceRefs: cmd.evidenceRefs ?? [],
        sourceKeys: [sourceKey],
        observedAt: cmd.observedAt ?? recordedAt,
        asOf: recordedAt,
        reviewStatus: fusionState.reviewStatus,
      });
      await this.deps.repository.saveEvidenceConfidence({
        ...evidenceConfidence,
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        version: 1,
      });
    }

    // Readiness only — Phase 10I never executes predictive methods.
    const assessed = this.predictiveReadinessAssessor.assess({
      fusion: fusionState,
      reconciliation,
      evidenceConfidence,
      assessedAt: recordedAt,
    });
    const abstained =
      assessed.readiness.readinessClass === "insufficient" ||
      assessed.readiness.readinessClass === "conflicting" ||
      assessed.readiness.readinessClass === "not_ready";

    let reviewInstanceId: string | undefined;
    let reviewWorkflowInstance: EngineeringWorkflowInstance | undefined;
    if (!abstained && cmd.startReview !== false) {
      const review = startPredictiveReadinessReview({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        readinessStateId: assessed.readiness.id,
        startedBy: cmd.createdBy,
      });
      reviewInstanceId = review.instance.instanceId;
      reviewWorkflowInstance = review.instance;
      assessed.readiness.reviewInstanceId = reviewInstanceId;
      assessed.readiness.reviewStatus = "pending_review";
    }

    const version = await this.deps.repository.nextPredictiveReadinessVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      cmd.expectedVersion,
    );
    const predictiveReadiness: PersistedPredictiveReadinessState = {
      ...assessed.readiness,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      version,
      createdBy: cmd.createdBy,
    };
    await this.deps.repository.savePredictiveReadiness(predictiveReadiness);

    timelineEntries = [
      ...timelineEntries,
      ...(await this.appendStateTimelines({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        assetId: cmd.assetId,
        recordedAt,
        sourceKey,
        provenance: {
          sourceSystem: sourceKey,
          observedAt: cmd.observedAt ?? recordedAt,
          method: "predictive_readiness_v1",
          evidenceRefs: cmd.evidenceRefs ?? [],
          policyId: "asset_intelligence.predictive_readiness.assess.v1",
        },
        correlationId: cmd.correlationId,
        items: [{ kind: "predictive_readiness", stateId: predictiveReadiness.id }],
      })),
    ];

    const outboxEventId = this.deps.repository.newId("outbox");
    await this.deps.repository.appendOutbox({
      id: outboxEventId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      eventType: "engineering.asset.predictive_readiness.assessed",
      payload: {
        sourceKey,
        kind: "predictive_readiness",
        status: predictiveReadiness.readinessClass,
        silentIdentityMutationForbidden: true,
        rawEvidenceForbidden: true,
        secretsForbidden: true,
      },
      correlationId: cmd.correlationId,
      stateId: predictiveReadiness.id,
      published: false,
      createdAt: recordedAt,
    });
    const ev = createAssetIntelligenceEvent({
      type: "engineering.asset.predictive_readiness.assessed",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: predictiveReadiness.id,
      occurredAt: recordedAt,
      correlationId: cmd.correlationId,
      payload: {
        sourceKey,
        kind: "predictive_readiness",
        status: predictiveReadiness.readinessClass,
      },
    });
    await this.deps.events.publish(ev);
    await this.deps.repository.appendEvent(ev);
    await this.deps.repository.markOutboxPublished(outboxEventId, recordedAt);

    const result: EnginePredictiveReadinessResult = {
      ...FUSION_GOVERNANCE_FLAGS,
      identityOwner: "engineering_os_shared_domain",
      fusionState,
      reconciliation,
      predictiveReadiness,
      evidenceConfidence,
      timelineEntries,
      outboxEventId,
      reviewInstanceId,
      reviewWorkflowInstance,
      abstained,
      abstentionReason: abstained
        ? predictiveReadiness.readinessRationale[0]
        : undefined,
      predictiveAllowed: false,
    };

    if (cmd.idempotencyKey) {
      await this.deps.repository.saveIdempotency({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        idempotencyKey: cmd.idempotencyKey,
        operation: "assess_predictive_readiness",
        resourceId: predictiveReadiness.id,
        responsePayload: { result },
      });
    }
    return result;
  }

  async reviewPredictiveReadiness(cmd: ReviewPredictiveReadinessCommand): Promise<{
    predictiveReadiness: PersistedPredictiveReadinessState;
    workflowInstance: EngineeringWorkflowInstance;
    identityMutated: false;
    healthMutated: false;
    predictiveMlEnabled: false;
    predictiveMethodsCertified: false;
    aiMayPublishForbidden: true;
  }> {
    const capability =
      cmd.action === "approve"
        ? "predictive_readiness.approve"
        : cmd.publish
          ? "predictive_readiness.publish"
          : "predictive_readiness.review";
    if (cmd.actorRole) {
      assertFailureCapability(cmd.actorRole, capability, { actorId: cmd.reviewerId });
    }
    const latest = await this.deps.repository.latestPredictiveReadiness(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
    );
    if (!latest || latest.id !== cmd.readinessStateId) {
      throw new Error("predictive_readiness_state_not_found");
    }
    if (latest.reviewStatus === "published") {
      throw new Error("published_predictive_readiness_immutable");
    }
    const workflowInstance = transitionPredictiveReadinessReview({
      instance: cmd.workflowInstance,
      action: cmd.action,
      to: cmd.to,
    });
    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const nextStatus = cmd.publish && cmd.to === "approved" ? "published" : cmd.to;
    const version = await this.deps.repository.nextPredictiveReadinessVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      latest.version,
    );
    const predictiveReadiness: PersistedPredictiveReadinessState = {
      ...latest,
      id: this.deps.repository.newId("pred_ready"),
      version,
      reviewStatus: nextStatus,
      reviewedAt: recordedAt,
      publishedAt: nextStatus === "published" ? recordedAt : latest.publishedAt,
      supersedesId: latest.id,
      provenance: {
        ...latest.provenance,
        reviewedBy: cmd.reviewerId,
        approvedAt: cmd.to === "approved" ? recordedAt : undefined,
        predictiveMlEnabled: false,
        predictiveMethodsCertified: false,
      },
    };
    await this.deps.repository.savePredictiveReadiness(predictiveReadiness);
    await this.deps.repository.savePredictiveReadinessReview({
      reviewId: this.deps.repository.newId("prrev"),
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      readinessStateId: predictiveReadiness.id,
      reviewInstanceId: workflowInstance.instanceId,
      action: cmd.action,
      reviewerId: cmd.reviewerId,
      reason: cmd.reason,
      stateVersion: version,
      evidenceConfidenceRef: predictiveReadiness.evidenceConfidenceRef,
      correlationId: cmd.correlationId,
      createdAt: recordedAt,
    });
    await this.appendStateTimelines({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      recordedAt,
      sourceKey: "asset_intelligence.review",
      provenance: {
        sourceSystem: "asset_intelligence.review",
        observedAt: recordedAt,
        method: "predictive_readiness_v1",
        reviewedBy: cmd.reviewerId,
      },
      correlationId: cmd.correlationId,
      items: [
        {
          kind:
            nextStatus === "published"
              ? "predictive_readiness_published"
              : "predictive_readiness_review",
          stateId: predictiveReadiness.id,
        },
      ],
    });
    const ev = createAssetIntelligenceEvent({
      type:
        nextStatus === "published"
          ? "engineering.asset.predictive_readiness.published"
          : "engineering.asset.predictive_readiness.reviewed",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: predictiveReadiness.id,
      occurredAt: recordedAt,
      correlationId: cmd.correlationId,
      payload: { kind: "predictive_readiness", status: nextStatus },
    });
    await this.deps.events.publish(ev);
    await this.deps.repository.appendEvent(ev);
    if (predictiveReadiness.supersedesId) {
      const superseded = createAssetIntelligenceEvent({
        type: "engineering.asset.predictive_readiness.superseded",
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        assetId: cmd.assetId,
        stateId: predictiveReadiness.supersedesId,
        occurredAt: recordedAt,
        correlationId: cmd.correlationId,
        payload: { kind: "predictive_readiness", status: "superseded" },
      });
      await this.deps.events.publish(superseded);
      await this.deps.repository.appendEvent(superseded);
    }
    return {
      predictiveReadiness,
      workflowInstance,
      identityMutated: false,
      healthMutated: false,
      predictiveMlEnabled: false,
      predictiveMethodsCertified: false,
      aiMayPublishForbidden: true,
    };
  }

  /**
   * Phase 10I orchestration: published slices → fuse → reconcile → readiness →
   * persist → governed reviews → timeline → snapshot refs → outbox.
   */
  async assessFusionBundle(cmd: AssessFusionBundleCommand): Promise<EngineFusionBundleResult> {
    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const fusion = await this.assessFusion({ ...cmd, recordedAt });
    const readiness = await this.assessPredictiveReadiness({
      ...cmd,
      recordedAt,
      fusionStateId: fusion.fusionState.id,
      idempotencyKey: cmd.idempotencyKey ? `${cmd.idempotencyKey}:readiness` : undefined,
    });

    return {
      ...FUSION_GOVERNANCE_FLAGS,
      identityOwner: "engineering_os_shared_domain",
      fusionState: fusion.fusionState,
      reconciliation: fusion.reconciliation,
      predictiveReadiness: readiness.predictiveReadiness,
      evidenceConfidence: fusion.evidenceConfidence,
      timelineEntries: [...fusion.timelineEntries, ...readiness.timelineEntries],
      snapshot: fusion.snapshot,
      snapshotId: fusion.snapshotId,
      outboxEventIds: [fusion.outboxEventId, readiness.outboxEventId],
      fusionReviewInstanceId: fusion.reviewInstanceId,
      predictiveReadinessReviewInstanceId: readiness.reviewInstanceId,
      abstained: fusion.abstained || readiness.abstained,
      abstentionReason: fusion.abstentionReason ?? readiness.abstentionReason,
      predictiveAllowed: false,
    };
  }

  /**
   * Phase 10J — readiness for one named objective. Probability of failure and
   * remaining useful life are structurally `not_ready` and therefore always
   * abstain.
   */
  async assessObjectivePredictiveReadiness(
    cmd: AssessObjectivePredictiveReadinessCommand,
  ): Promise<EngineObjectivePredictiveReadinessResult> {
    if (cmd.actorRole) assertFailureCapability(cmd.actorRole, "predictive_governance.assess");
    const sourceKey = cmd.sourceKey ?? "manual.engineering_assessment";
    assertRegisteredActiveSource(sourceKey, "predictive_governance");

    if (cmd.idempotencyKey) {
      const existing = await this.deps.repository.findIdempotency(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.idempotencyKey,
      );
      if (existing?.responsePayload?.result) {
        return {
          ...(existing.responsePayload.result as EngineObjectivePredictiveReadinessResult),
          idempotentReplay: true,
        };
      }
    }

    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const base = await this.assessPredictiveReadiness({
      ...cmd,
      recordedAt,
      idempotencyKey: undefined,
      startReview: false,
    });

    const reconciliation = base.reconciliation;
    const assessed = this.objectivePredictiveReadinessAssessor.assessObjective({
      objectiveId: cmd.objectiveId,
      fusion: base.fusionState,
      reconciliation,
      evidenceConfidence: base.evidenceConfidence,
      trendConfidence: cmd.trendConfidence,
      declaredInputs: cmd.declaredInputs,
      observationCount: cmd.observationCount,
      observationWindowDays: cmd.observationWindowDays,
      largestObservationGapDays: cmd.largestObservationGapDays,
      evidenceAgeDays: cmd.evidenceAgeDays,
      freshnessPolicy: cmd.freshnessPolicy,
      globalReadinessRef: base.predictiveReadiness.id,
      assessedAt: recordedAt,
    });

    const abstained =
      assessed.readiness.readinessClass === "insufficient" ||
      assessed.readiness.readinessClass === "conflicting" ||
      assessed.readiness.readinessClass === "not_ready";

    let reviewInstanceId: string | undefined;
    let reviewWorkflowInstance: EngineeringWorkflowInstance | undefined;
    if (!abstained && cmd.startReview !== false) {
      const review = startPredictiveMethodReview({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        subjectId: assessed.readiness.id,
        subjectKind: "objective_readiness",
        startedBy: cmd.createdBy,
      });
      reviewInstanceId = review.instance.instanceId;
      reviewWorkflowInstance = review.instance;
      assessed.readiness.reviewInstanceId = reviewInstanceId;
      assessed.readiness.reviewStatus = "pending_review";
    }

    const version = await this.deps.repository.nextObjectivePredictiveReadinessVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      assessed.readiness.objectiveId,
      cmd.expectedVersion,
    );
    const objectiveReadiness: PersistedObjectivePredictiveReadinessState = {
      ...assessed.readiness,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      version,
      createdBy: cmd.createdBy,
      globalReadinessRef: base.predictiveReadiness.id,
    };
    await this.deps.repository.saveObjectivePredictiveReadiness(objectiveReadiness);

    const timelineEntries = [
      ...base.timelineEntries,
      ...(await this.appendStateTimelines({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        assetId: cmd.assetId,
        recordedAt,
        sourceKey,
        provenance: {
          sourceSystem: sourceKey,
          observedAt: cmd.observedAt ?? recordedAt,
          method: "objective_predictive_readiness_v1",
          evidenceRefs: cmd.evidenceRefs ?? [],
          policyId: "asset_intelligence.predictive_governance.assess.v1",
        },
        correlationId: cmd.correlationId,
        items: [
          { kind: "predictive_objective_readiness", stateId: objectiveReadiness.id },
        ],
      })),
    ];

    const outboxEventId = await this.emitPredictiveGovernanceEvent({
      type: "engineering.asset.predictive_objective_readiness.assessed",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: objectiveReadiness.id,
      recordedAt,
      correlationId: cmd.correlationId,
      payload: {
        sourceKey,
        kind: `predictive_objective_readiness:${objectiveReadiness.objectiveId}`,
        status: objectiveReadiness.readinessClass,
      },
    });

    const result: EngineObjectivePredictiveReadinessResult = {
      ...PREDICTIVE_GOVERNANCE_FLAGS,
      identityOwner: "engineering_os_shared_domain",
      objectiveReadiness,
      fusionState: base.fusionState,
      evidenceConfidence: base.evidenceConfidence,
      timelineEntries,
      outboxEventId,
      reviewInstanceId,
      reviewWorkflowInstance,
      abstained,
      abstentionReason: abstained ? objectiveReadiness.readinessRationale[0] : undefined,
      predictiveAllowed: false,
    };

    if (cmd.idempotencyKey) {
      await this.deps.repository.saveIdempotency({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        idempotencyKey: cmd.idempotencyKey,
        operation: "assess_objective_predictive_readiness",
        resourceId: objectiveReadiness.id,
        responsePayload: { result },
      });
    }
    return result;
  }

  /**
   * Phase 10J — decides whether a method could be considered, and records that
   * judgement as a candidate. The candidate never holds a predicted value.
   */
  async evaluateMethodEligibility(
    cmd: EvaluateMethodEligibilityCommand,
  ): Promise<EngineMethodCandidateResult> {
    if (cmd.actorRole) assertFailureCapability(cmd.actorRole, "predictive_governance.submit");
    const sourceKey = cmd.sourceKey ?? "manual.engineering_assessment";
    assertRegisteredActiveSource(sourceKey, "predictive_governance");

    if (cmd.idempotencyKey) {
      const existing = await this.deps.repository.findIdempotency(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.idempotencyKey,
      );
      if (existing?.responsePayload?.result) {
        return {
          ...(existing.responsePayload.result as EngineMethodCandidateResult),
          idempotentReplay: true,
        };
      }
    }

    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const readiness =
      cmd.readiness ??
      (await this.deps.repository.latestObjectivePredictiveReadiness(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.assetId,
        String(cmd.objectiveId),
      ));
    if (!readiness) throw new Error("objective_predictive_readiness_not_found");
    if (cmd.readinessStateId && readiness.id !== cmd.readinessStateId) {
      throw new Error("objective_predictive_readiness_state_mismatch");
    }

    const evaluated = this.predictiveMethodEligibilityEngine.evaluate({
      objectiveId: String(cmd.objectiveId),
      methodId: cmd.methodId,
      readiness,
      evidenceConfidence: cmd.evidenceConfidence,
      trendConfidence: cmd.trendConfidence,
      assertedAssumptions: cmd.assertedAssumptions,
      violatedAssumptions: cmd.violatedAssumptions,
      satisfiedApplicabilityConditions: cmd.satisfiedApplicabilityConditions,
      freshnessPolicy: cmd.freshnessPolicy,
      qualificationRef: cmd.qualificationRef,
      qualificationPassed: cmd.qualificationPassed,
      proposedAt: recordedAt,
    });

    let reviewInstanceId: string | undefined;
    let reviewWorkflowInstance: EngineeringWorkflowInstance | undefined;
    if (!evaluated.abstained && cmd.startReview !== false) {
      const review = startPredictiveMethodReview({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        subjectId: evaluated.candidate.id,
        subjectKind: "method_candidate",
        startedBy: cmd.createdBy,
      });
      reviewInstanceId = review.instance.instanceId;
      reviewWorkflowInstance = review.instance;
      evaluated.candidate.reviewInstanceId = reviewInstanceId;
      evaluated.candidate.reviewStatus = "pending_review";
    }

    const version = await this.deps.repository.nextPredictiveMethodCandidateVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      evaluated.candidate.objectiveId,
      evaluated.candidate.methodId,
      cmd.expectedVersion,
    );
    const candidate: PersistedPredictiveMethodCandidate = {
      ...evaluated.candidate,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      version,
      createdBy: cmd.createdBy,
    };
    await this.deps.repository.savePredictiveMethodCandidate(candidate);

    const timelineEntries = await this.appendStateTimelines({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      recordedAt,
      sourceKey,
      provenance: {
        sourceSystem: sourceKey,
        observedAt: recordedAt,
        method: "predictive_method_candidate_v1",
        policyId: "asset_intelligence.predictive_governance.submit.v1",
      },
      correlationId: cmd.correlationId,
      items: [{ kind: "predictive_method_candidate", stateId: candidate.id }],
    });

    const outboxEventId = await this.emitPredictiveGovernanceEvent({
      type: "engineering.asset.predictive_method_candidate.proposed",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: candidate.id,
      recordedAt,
      correlationId: cmd.correlationId,
      payload: {
        sourceKey,
        kind: `predictive_method_candidate:${candidate.objectiveId}:${candidate.methodId}`,
        status: candidate.eligibility,
      },
    });

    const result: EngineMethodCandidateResult = {
      ...PREDICTIVE_GOVERNANCE_FLAGS,
      identityOwner: "engineering_os_shared_domain",
      candidate,
      objectiveReadiness: readiness,
      eligibility: candidate.eligibility,
      timelineEntries,
      outboxEventId,
      reviewInstanceId,
      reviewWorkflowInstance,
      abstained: evaluated.abstained,
      abstentionReason: evaluated.abstained ? candidate.unmetRequirements[0] : undefined,
      executionAllowed: false,
    };

    if (cmd.idempotencyKey) {
      await this.deps.repository.saveIdempotency({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        idempotencyKey: cmd.idempotencyKey,
        operation: "evaluate_method_eligibility",
        resourceId: candidate.id,
        responsePayload: { result },
      });
    }
    return result;
  }

  /** Alias for {@link evaluateMethodEligibility} — a candidate is its output. */
  async createMethodCandidate(
    cmd: EvaluateMethodEligibilityCommand,
  ): Promise<EngineMethodCandidateResult> {
    return this.evaluateMethodEligibility(cmd);
  }

  /**
   * Phase 10J — qualify a method against a frozen fixture set. Passing is
   * fixture-bounded acceptability, never certification.
   */
  async startMethodQualification(
    cmd: StartMethodQualificationCommand,
  ): Promise<EngineMethodQualificationResult> {
    if (cmd.actorRole) assertFailureCapability(cmd.actorRole, "predictive_governance.submit");

    if (cmd.idempotencyKey) {
      const existing = await this.deps.repository.findIdempotency(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.idempotencyKey,
      );
      if (existing?.responsePayload?.result) {
        return {
          ...(existing.responsePayload.result as EngineMethodQualificationResult),
          idempotentReplay: true,
        };
      }
    }

    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const version = await this.deps.repository.nextPredictiveMethodQualificationVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.methodId,
      String(cmd.objectiveId),
      cmd.expectedVersion,
    );
    const draft = createQualificationDraft({
      ...cmd,
      id: this.deps.repository.newId("pred_qual"),
      version,
      createdAt: recordedAt,
    });
    const evaluated = cmd.observedMetrics
      ? evaluateAgainstAcceptanceCriteria(draft, cmd.observedMetrics, {
          evaluatedAt: recordedAt,
          evaluatorId: cmd.evaluatorId ?? cmd.createdBy,
          reproducible: cmd.reproducible,
          observedFixtureSetHash: cmd.observedFixtureSetHash,
        })
      : draft;

    let reviewInstanceId: string | undefined;
    let reviewWorkflowInstance: EngineeringWorkflowInstance | undefined;
    if (cmd.startReview !== false && evaluated.qualificationStatus !== "draft") {
      const review = startPredictiveMethodReview({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        subjectId: evaluated.id,
        subjectKind: "method_qualification",
        startedBy: cmd.createdBy,
      });
      reviewInstanceId = review.instance.instanceId;
      reviewWorkflowInstance = review.instance;
      evaluated.reviewInstanceId = reviewInstanceId;
      evaluated.reviewStatus = "pending_review";
    }

    const qualification: PersistedPredictiveMethodQualification = {
      ...evaluated,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      version,
      createdBy: cmd.createdBy,
    };
    await this.deps.repository.savePredictiveMethodQualification(qualification);

    const timelineEntries = cmd.assetId
      ? await this.appendStateTimelines({
          tenantId: cmd.tenantId,
          workspaceId: cmd.workspaceId,
          assetId: cmd.assetId,
          recordedAt,
          sourceKey: "manual.engineering_assessment",
          provenance: {
            sourceSystem: "manual.engineering_assessment",
            observedAt: recordedAt,
            method: "predictive_method_qualification_v1",
            policyId: "asset_intelligence.predictive_governance.submit.v1",
          },
          correlationId: cmd.correlationId,
          items: [{ kind: "predictive_method_qualification", stateId: qualification.id }],
        })
      : [];

    const outboxEventId = await this.emitPredictiveGovernanceEvent({
      type: cmd.observedMetrics
        ? "engineering.asset.predictive_method_qualification.evaluated"
        : "engineering.asset.predictive_method_qualification.started",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: qualification.id,
      recordedAt,
      correlationId: cmd.correlationId,
      payload: {
        kind: `predictive_method_qualification:${qualification.methodId}:${qualification.objectiveId}`,
        status: qualification.qualificationStatus,
      },
    });

    const result: EngineMethodQualificationResult = {
      ...PREDICTIVE_GOVERNANCE_FLAGS,
      qualification,
      timelineEntries,
      outboxEventId,
      reviewInstanceId,
      reviewWorkflowInstance,
      certificationGranted: false,
      executionAllowed: false,
    };

    if (cmd.idempotencyKey) {
      await this.deps.repository.saveIdempotency({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        idempotencyKey: cmd.idempotencyKey,
        operation: "start_method_qualification",
        resourceId: qualification.id,
        responsePayload: { result },
      });
    }
    return result;
  }

  /**
   * Phase 10J — governed review of a qualification. Publishing a passed
   * qualification marks the method qualified; it does not certify it and does
   * not enable production predictive execution.
   */
  async reviewMethodQualification(
    cmd: ReviewMethodQualificationCommand,
  ): Promise<EngineMethodQualificationReviewResult> {
    const capability =
      cmd.action === "approve"
        ? "predictive_governance.approve"
        : cmd.publish
          ? "predictive_governance.publish"
          : "predictive_governance.review";
    if (cmd.actorRole) {
      assertFailureCapability(cmd.actorRole, capability, { actorId: cmd.reviewerId });
    }

    const latest = await this.deps.repository.latestPredictiveMethodQualification(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.methodId,
      String(cmd.objectiveId),
    );
    if (!latest || latest.id !== cmd.qualificationId) {
      throw new Error("predictive_method_qualification_not_found");
    }
    if (latest.reviewStatus === "published") {
      throw new Error("published_predictive_method_qualification_immutable");
    }
    if (latest.createdBy && latest.createdBy === cmd.reviewerId && cmd.action === "approve") {
      throw new Error("segregation_of_duties_violation");
    }

    const workflowInstance = transitionPredictiveMethodReview({
      instance: cmd.workflowInstance,
      action: cmd.action,
      to: cmd.to,
    });
    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const nextStatus = cmd.publish && cmd.to === "approved" ? "published" : cmd.to;
    const version = await this.deps.repository.nextPredictiveMethodQualificationVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.methodId,
      String(cmd.objectiveId),
      latest.version,
    );
    const qualification: PersistedPredictiveMethodQualification = {
      ...latest,
      id: this.deps.repository.newId("pred_qual"),
      version,
      reviewStatus: nextStatus,
      reviewInstanceId: workflowInstance.instanceId,
      supersedesId: latest.id,
      provenance: {
        ...latest.provenance,
        reviewedBy: cmd.reviewerId,
        approvedAt: cmd.to === "approved" ? recordedAt : undefined,
        certificationGranted: false,
        productionExecutionEnabled: false,
      },
      certificationGranted: false,
      productionExecutionEnabled: false,
    };
    await this.deps.repository.savePredictiveMethodQualification(qualification);
    await this.deps.repository.savePredictiveReview({
      id: this.deps.repository.newId("pred_review"),
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      subjectKind: "method_qualification",
      subjectId: qualification.id,
      subjectVersion: version,
      objectiveId: qualification.objectiveId,
      methodId: qualification.methodId,
      reviewInstanceId: workflowInstance.instanceId,
      action: cmd.action,
      reviewerId: cmd.reviewerId,
      reason: cmd.reason,
      correlationId: cmd.correlationId,
      createdAt: recordedAt,
      grantsProductionExecution: false,
      grantsCertification: false,
    });

    const qualified =
      nextStatus === "published" && qualification.qualificationStatus === "passed";
    if (cmd.assetId) {
      await this.appendStateTimelines({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        assetId: cmd.assetId,
        recordedAt,
        sourceKey: "asset_intelligence.review",
        provenance: {
          sourceSystem: "asset_intelligence.review",
          observedAt: recordedAt,
          method: "predictive_method_qualification_v1",
          reviewedBy: cmd.reviewerId,
        },
        correlationId: cmd.correlationId,
        items: [
          {
            kind: qualified
              ? "predictive_method_qualified"
              : "predictive_method_qualification_review",
            stateId: qualification.id,
          },
        ],
      });
    }

    await this.emitPredictiveGovernanceEvent({
      type: qualified
        ? "engineering.asset.predictive_method_qualification.qualified"
        : cmd.to === "rejected"
          ? "engineering.asset.predictive_method_qualification.rejected"
          : "engineering.asset.predictive_method_qualification.reviewed",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: qualification.id,
      recordedAt,
      correlationId: cmd.correlationId,
      payload: {
        kind: `predictive_method_qualification:${qualification.methodId}:${qualification.objectiveId}`,
        status: nextStatus,
      },
      withOutbox: false,
    });

    return {
      ...PREDICTIVE_GOVERNANCE_FLAGS,
      qualification,
      workflowInstance,
      qualified,
      certificationGranted: false,
      executionAllowed: false,
    };
  }

  /**
   * Phase 10J orchestration: objective readiness → method eligibility →
   * candidates. The bundle deliberately stops before execution: it produces no
   * prediction and grants no permission to make one.
   */
  async assessPredictiveGovernanceBundle(
    cmd: AssessPredictiveGovernanceBundleCommand,
  ): Promise<EnginePredictiveGovernanceBundleResult> {
    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const readinessResult = await this.assessObjectivePredictiveReadiness({
      ...cmd,
      recordedAt,
    });

    const methodIds =
      cmd.methodIds ??
      listMethodsForObjective(readinessResult.objectiveReadiness.objectiveId).map(
        (m) => m.methodId,
      );

    const candidates: PersistedPredictiveMethodCandidate[] = [];
    const timelineEntries = [...readinessResult.timelineEntries];
    const outboxEventIds = [readinessResult.outboxEventId];

    for (const methodId of methodIds) {
      const candidateResult = await this.evaluateMethodEligibility({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        assetId: cmd.assetId,
        objectiveId: readinessResult.objectiveReadiness.objectiveId,
        methodId,
        readiness: readinessResult.objectiveReadiness,
        evidenceConfidence: readinessResult.evidenceConfidence,
        trendConfidence: cmd.trendConfidence,
        freshnessPolicy: cmd.freshnessPolicy,
        sourceKey: cmd.sourceKey,
        correlationId: cmd.correlationId,
        recordedAt,
        createdBy: cmd.createdBy,
        actorRole: cmd.actorRole,
        startReview: false,
        idempotencyKey: cmd.idempotencyKey
          ? `${cmd.idempotencyKey}:candidate:${methodId}`
          : undefined,
      });
      candidates.push(candidateResult.candidate);
      timelineEntries.push(...candidateResult.timelineEntries);
      outboxEventIds.push(candidateResult.outboxEventId);
    }

    return {
      ...PREDICTIVE_GOVERNANCE_FLAGS,
      identityOwner: "engineering_os_shared_domain",
      objectiveReadiness: readinessResult.objectiveReadiness,
      candidates,
      fusionState: readinessResult.fusionState,
      evidenceConfidence: readinessResult.evidenceConfidence,
      timelineEntries,
      outboxEventIds,
      objectiveReadinessReviewInstanceId: readinessResult.reviewInstanceId,
      abstained:
        readinessResult.abstained || candidates.every((c) => c.eligibility === "ineligible"),
      abstentionReason: readinessResult.abstentionReason,
      predictiveAllowed: false,
      executionAllowed: false,
    };
  }

  async listObjectivePredictiveReadiness(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    objectiveId?: string,
  ): Promise<PersistedObjectivePredictiveReadinessState[]> {
    return this.deps.repository.listObjectivePredictiveReadiness(
      tenantId,
      workspaceId,
      assetId,
      objectiveId,
    );
  }

  async listPredictiveMethodCandidates(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    objectiveId?: string,
  ): Promise<PersistedPredictiveMethodCandidate[]> {
    return this.deps.repository.listPredictiveMethodCandidates(
      tenantId,
      workspaceId,
      assetId,
      objectiveId,
    );
  }

  async listPredictiveMethodQualifications(
    tenantId: string,
    workspaceId: string,
    methodId?: string,
  ): Promise<PersistedPredictiveMethodQualification[]> {
    return this.deps.repository.listPredictiveMethodQualifications(
      tenantId,
      workspaceId,
      methodId,
    );
  }

  /** Single read point for the Phase 10J execution posture. */
  readPredictiveGovernanceLocks(): typeof PREDICTIVE_GOVERNANCE_LOCKS {
    return PREDICTIVE_GOVERNANCE_LOCKS;
  }

  private async emitPredictiveGovernanceEvent(input: {
    type: Parameters<typeof createAssetIntelligenceEvent>[0]["type"];
    tenantId: string;
    workspaceId: string;
    assetId?: string;
    stateId: string;
    recordedAt: string;
    correlationId?: string;
    payload: { sourceKey?: string; kind?: string; status?: string };
    withOutbox?: boolean;
  }): Promise<string> {
    const payload = {
      sourceKey: input.payload.sourceKey,
      kind: input.payload.kind,
      status: input.payload.status,
      silentIdentityMutationForbidden: true as const,
      rawEvidenceForbidden: true as const,
      secretsForbidden: true as const,
    };
    let outboxEventId = "";
    if (input.withOutbox !== false && input.assetId) {
      outboxEventId = this.deps.repository.newId("outbox");
      await this.deps.repository.appendOutbox({
        id: outboxEventId,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        assetId: input.assetId,
        eventType: input.type,
        payload,
        correlationId: input.correlationId,
        stateId: input.stateId,
        published: false,
        createdAt: input.recordedAt,
      });
    }
    const ev = createAssetIntelligenceEvent({
      type: input.type,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      assetId: input.assetId ?? input.stateId,
      stateId: input.stateId,
      occurredAt: input.recordedAt,
      correlationId: input.correlationId,
      payload,
    });
    await this.deps.events.publish(ev);
    await this.deps.repository.appendEvent(ev);
    if (outboxEventId) {
      await this.deps.repository.markOutboxPublished(outboxEventId, input.recordedAt);
    }
    return outboxEventId;
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

  async getFusionState(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedFusionState | undefined> {
    return this.deps.repository.latestFusionState(tenantId, workspaceId, assetId);
  }

  async listFusionHistory(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedFusionState[]> {
    return this.deps.repository.listFusionHistory(tenantId, workspaceId, assetId);
  }

  async listReconciliationRecords(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedReconciliationRecord[]> {
    return this.deps.repository.listReconciliationRecords(tenantId, workspaceId, assetId);
  }

  async getPredictiveReadiness(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedPredictiveReadinessState | undefined> {
    return this.deps.repository.latestPredictiveReadiness(tenantId, workspaceId, assetId);
  }
}

export function createAssetIntelligenceEngine(
  deps: AssetIntelligenceEngineDeps,
): AssetIntelligenceEngine {
  return new AssetIntelligenceEngine(deps);
}

export { createInMemorySharedDomainIdentityPort };
