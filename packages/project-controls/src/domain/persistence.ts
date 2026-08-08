/**
 * Phase 11E — Project Controls persistence port and memory adapter.
 *
 * The memory adapter exists for tests and certification units only;
 * `assertProductionRepositorySafe` makes choosing it in production a throw
 * rather than a silent data-loss bug.
 */

import { randomUUID } from "node:crypto";
import type {
  ProgressAssessmentState,
  ProgressEvidence,
  ProgressReviewRecord,
  ProgressSnapshot,
  ProgressTimelineEvent,
  ProjectProfile,
  ProjectScopeRef,
} from "./progress";
import { scopeKey } from "./progress";
import type {
  ScheduleAssessmentState,
  ScheduleEvidence,
  ScheduleReviewRecord,
  ScheduleSnapshot,
  ScheduleTimelineEvent,
} from "./schedule";
import type {
  ChangeCandidate,
  ChangeClassification,
  ChangeConfidence,
  ChangeEvidence,
  ChangeIntelligenceState,
  ChangeReviewRecord,
  ProjectSnapshot,
  ProjectTimelineEvent,
} from "./change";
import { changeStateKey } from "./change";
import type {
  CostConfidence,
  CostEvidence,
  CostIntelligenceState,
  CostReviewRecord,
} from "./cost";
import { costStateKey } from "./cost";
import type {
  ProductivityAssessmentState,
  ProductivityConfidence,
  ProductivityEvidence,
  ProductivityReviewRecord,
} from "./productivity";
import { productivityStateKey } from "./productivity";
import type {
  ForecastAssessmentState,
  ForecastConfidence,
  ForecastEvidence,
  ForecastReviewRecord,
} from "./forecast";
import { forecastStateKey } from "./forecast";
import type {
  DecisionAssessmentState,
  DecisionConfidence,
  DecisionEvidence,
  DecisionReviewRecord,
} from "./decision";
import { decisionStateKey } from "./decision";
import type {
  ScenarioAssessmentState,
  ScenarioConfidence,
  ScenarioEvidence,
  ScenarioReviewRecord,
} from "./scenario";
import { scenarioStateKey } from "./scenario";
import type {
  RiskOpportunityAssessmentState,
  RiskOpportunityConfidence,
  RiskOpportunityEvidence,
  RiskOpportunityReviewRecord,
} from "./risk-opportunity";
import { riskOpportunityStateKey } from "./risk-opportunity";
import type { ProjectControlsEvent } from "./events";
import { PRODUCTION_MEMORY_REPOSITORY_ALLOWED as VERSION_MEMORY_LOCK } from "../version";

export type PersistedProgressEvidence = ProgressEvidence & {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  assessmentStateId: string;
  recordedAt: string;
  createdBy?: string;
};

export type PersistedProgressAssessment = ProgressAssessmentState;
export type PersistedProgressReview = ProgressReviewRecord;
export type PersistedProgressSnapshot = ProgressSnapshot;
export type PersistedProgressTimelineEvent = ProgressTimelineEvent;
export type PersistedProjectProfile = ProjectProfile;

export type PersistedScheduleEvidence = ScheduleEvidence & {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  assessmentStateId: string;
  recordedAt: string;
  createdBy?: string;
};

export type PersistedScheduleAssessment = ScheduleAssessmentState;
export type PersistedScheduleReview = ScheduleReviewRecord;
export type PersistedScheduleSnapshot = ScheduleSnapshot;
export type PersistedScheduleTimelineEvent = ScheduleTimelineEvent;

export type PersistedChangeEvidence = ChangeEvidence & {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  changeStateId: string;
  recordedAt: string;
  createdBy?: string;
};

export type PersistedChangeState = ChangeIntelligenceState;
export type PersistedChangeCandidate = ChangeCandidate;
export type PersistedChangeReview = ChangeReviewRecord;
export type PersistedChangeConfidence = ChangeConfidence & {
  changeStateId: string;
  recordedAt: string;
};

export type PersistedCostEvidence = CostEvidence & {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  costStateId: string;
  recordedAt: string;
  createdBy?: string;
};

export type PersistedCostState = CostIntelligenceState;
export type PersistedCostReview = CostReviewRecord;
export type PersistedCostConfidence = CostConfidence & {
  costStateId: string;
  recordedAt: string;
};

export type PersistedProductivityEvidence = ProductivityEvidence & {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  productivityStateId: string;
  recordedAt: string;
  createdBy?: string;
};

export type PersistedProductivityState = ProductivityAssessmentState;
export type PersistedProductivityReview = ProductivityReviewRecord;
export type PersistedProductivityConfidence = ProductivityConfidence & {
  productivityStateId: string;
  recordedAt: string;
};

export type PersistedForecastEvidence = ForecastEvidence & {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  forecastStateId: string;
  recordedAt: string;
  createdBy?: string;
};

export type PersistedForecastState = ForecastAssessmentState;
export type PersistedForecastReview = ForecastReviewRecord;
export type PersistedForecastConfidence = ForecastConfidence & {
  forecastStateId: string;
  recordedAt: string;
};

export type PersistedDecisionEvidence = DecisionEvidence & {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  decisionStateId: string;
  recordedAt: string;
  createdBy?: string;
};

export type PersistedDecisionState = DecisionAssessmentState;
export type PersistedDecisionReview = DecisionReviewRecord;
export type PersistedDecisionConfidence = DecisionConfidence & {
  decisionStateId: string;
  recordedAt: string;
};

export type PersistedScenarioEvidence = ScenarioEvidence & {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scenarioStateId: string;
  recordedAt: string;
  createdBy?: string;
};

export type PersistedScenarioState = ScenarioAssessmentState;
export type PersistedScenarioReview = ScenarioReviewRecord;
export type PersistedScenarioConfidence = ScenarioConfidence & {
  scenarioStateId: string;
  recordedAt: string;
};

export type PersistedRiskOpportunityEvidence = RiskOpportunityEvidence & {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  riskOpportunityStateId: string;
  recordedAt: string;
  createdBy?: string;
};

export type PersistedRiskOpportunityState = RiskOpportunityAssessmentState;
export type PersistedRiskOpportunityReview = RiskOpportunityReviewRecord;
export type PersistedRiskOpportunityConfidence = RiskOpportunityConfidence & {
  riskOpportunityStateId: string;
  recordedAt: string;
};

export type PersistedProjectSnapshot = ProjectSnapshot;
export type PersistedProjectTimelineEvent = ProjectTimelineEvent;

export type IdempotencyRecord = {
  tenantId: string;
  workspaceId: string;
  idempotencyKey: string;
  operation: string;
  resourceId?: string;
  responsePayload: Record<string, unknown>;
  createdAt: string;
};

export type OutboxEventRecord = {
  outboxId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  eventType: string;
  payload: Record<string, unknown>;
  correlationId?: string;
  stateId?: string;
  published: boolean;
  createdAt: string;
  publishedAt?: string;
};

export type ProjectControlsRepositoryPort = {
  readonly adapterKind: "memory" | "postgres";
  newId(prefix: string): string;

  saveProgressAssessment(
    state: PersistedProgressAssessment,
  ): Promise<PersistedProgressAssessment>;
  getProgressAssessmentById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedProgressAssessment | null>;
  latestProgressAssessment(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    asOf?: string,
  ): Promise<PersistedProgressAssessment | undefined>;
  listProgressAssessments(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProgressAssessment[]>;
  nextProgressAssessmentVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    expectedVersion?: number,
  ): Promise<number>;

  saveProgressEvidence(
    evidence: readonly PersistedProgressEvidence[],
  ): Promise<PersistedProgressEvidence[]>;
  listProgressEvidence(
    tenantId: string,
    workspaceId: string,
    assessmentStateId: string,
  ): Promise<PersistedProgressEvidence[]>;

  saveProgressReview(review: PersistedProgressReview): Promise<PersistedProgressReview>;
  listProgressReviews(
    tenantId: string,
    workspaceId: string,
    assessmentStateId?: string,
  ): Promise<PersistedProgressReview[]>;

  saveProgressSnapshot(snapshot: PersistedProgressSnapshot): Promise<PersistedProgressSnapshot>;
  listProgressSnapshots(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProgressSnapshot[]>;

  appendProgressTimeline(
    entry: PersistedProgressTimelineEvent,
  ): Promise<PersistedProgressTimelineEvent>;
  listProgressTimeline(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProgressTimelineEvent[]>;

  saveScheduleAssessment(
    state: PersistedScheduleAssessment,
  ): Promise<PersistedScheduleAssessment>;
  getScheduleAssessmentById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedScheduleAssessment | null>;
  latestScheduleAssessment(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    asOf?: string,
  ): Promise<PersistedScheduleAssessment | undefined>;
  listScheduleAssessments(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedScheduleAssessment[]>;
  nextScheduleAssessmentVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    expectedVersion?: number,
  ): Promise<number>;

  saveScheduleEvidence(
    evidence: readonly PersistedScheduleEvidence[],
  ): Promise<PersistedScheduleEvidence[]>;
  listScheduleEvidence(
    tenantId: string,
    workspaceId: string,
    assessmentStateId: string,
  ): Promise<PersistedScheduleEvidence[]>;

  saveScheduleReview(review: PersistedScheduleReview): Promise<PersistedScheduleReview>;
  listScheduleReviews(
    tenantId: string,
    workspaceId: string,
    assessmentStateId?: string,
  ): Promise<PersistedScheduleReview[]>;

  saveScheduleSnapshot(snapshot: PersistedScheduleSnapshot): Promise<PersistedScheduleSnapshot>;
  listScheduleSnapshots(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedScheduleSnapshot[]>;

  appendScheduleTimeline(
    entry: PersistedScheduleTimelineEvent,
  ): Promise<PersistedScheduleTimelineEvent>;
  listScheduleTimeline(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedScheduleTimelineEvent[]>;

  saveChangeState(state: PersistedChangeState): Promise<PersistedChangeState>;
  getChangeStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedChangeState | null>;
  latestChangeState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    changeClass: ChangeClassification,
    asOf?: string,
  ): Promise<PersistedChangeState | undefined>;
  listChangeStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedChangeState[]>;
  nextChangeStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    changeClass: ChangeClassification,
    expectedVersion?: number,
  ): Promise<number>;

  saveChangeEvidence(
    evidence: readonly PersistedChangeEvidence[],
  ): Promise<PersistedChangeEvidence[]>;
  listChangeEvidence(
    tenantId: string,
    workspaceId: string,
    changeStateId: string,
  ): Promise<PersistedChangeEvidence[]>;

  saveChangeReview(review: PersistedChangeReview): Promise<PersistedChangeReview>;
  listChangeReviews(
    tenantId: string,
    workspaceId: string,
    changeStateId?: string,
  ): Promise<PersistedChangeReview[]>;

  saveChangeConfidence(
    confidence: PersistedChangeConfidence,
  ): Promise<PersistedChangeConfidence>;
  listChangeConfidence(
    tenantId: string,
    workspaceId: string,
    changeStateId: string,
  ): Promise<PersistedChangeConfidence[]>;

  saveChangeCandidate(candidate: PersistedChangeCandidate): Promise<PersistedChangeCandidate>;
  getChangeCandidateById(
    tenantId: string,
    workspaceId: string,
    candidateId: string,
  ): Promise<PersistedChangeCandidate | null>;
  listChangeCandidates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedChangeCandidate[]>;

  saveCostState(state: PersistedCostState): Promise<PersistedCostState>;
  getCostStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedCostState | null>;
  latestCostState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    accountId: string,
    asOf?: string,
  ): Promise<PersistedCostState | undefined>;
  listCostStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedCostState[]>;
  nextCostStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    accountId: string,
    expectedVersion?: number,
  ): Promise<number>;

  saveCostEvidence(
    evidence: readonly PersistedCostEvidence[],
  ): Promise<PersistedCostEvidence[]>;
  listCostEvidence(
    tenantId: string,
    workspaceId: string,
    costStateId: string,
  ): Promise<PersistedCostEvidence[]>;

  saveCostReview(review: PersistedCostReview): Promise<PersistedCostReview>;
  listCostReviews(
    tenantId: string,
    workspaceId: string,
    costStateId?: string,
  ): Promise<PersistedCostReview[]>;

  saveCostConfidence(confidence: PersistedCostConfidence): Promise<PersistedCostConfidence>;
  listCostConfidence(
    tenantId: string,
    workspaceId: string,
    costStateId: string,
  ): Promise<PersistedCostConfidence[]>;

  saveProductivityState(state: PersistedProductivityState): Promise<PersistedProductivityState>;
  getProductivityStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedProductivityState | null>;
  latestProductivityState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    controlUnitId: string,
    asOf?: string,
  ): Promise<PersistedProductivityState | undefined>;
  listProductivityStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProductivityState[]>;
  nextProductivityStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    controlUnitId: string,
    expectedVersion?: number,
  ): Promise<number>;
  saveProductivityEvidence(
    evidence: readonly PersistedProductivityEvidence[],
  ): Promise<PersistedProductivityEvidence[]>;
  listProductivityEvidence(
    tenantId: string,
    workspaceId: string,
    productivityStateId: string,
  ): Promise<PersistedProductivityEvidence[]>;
  saveProductivityReview(review: PersistedProductivityReview): Promise<PersistedProductivityReview>;
  listProductivityReviews(
    tenantId: string,
    workspaceId: string,
    productivityStateId?: string,
  ): Promise<PersistedProductivityReview[]>;
  saveProductivityConfidence(
    confidence: PersistedProductivityConfidence,
  ): Promise<PersistedProductivityConfidence>;
  listProductivityConfidence(
    tenantId: string,
    workspaceId: string,
    productivityStateId: string,
  ): Promise<PersistedProductivityConfidence[]>;

  saveForecastState(state: PersistedForecastState): Promise<PersistedForecastState>;
  getForecastStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedForecastState | null>;
  latestForecastState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    trajectoryUnitId: string,
    asOf?: string,
  ): Promise<PersistedForecastState | undefined>;
  listForecastStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedForecastState[]>;
  nextForecastStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    trajectoryUnitId: string,
    expectedVersion?: number,
  ): Promise<number>;
  saveForecastEvidence(
    evidence: readonly PersistedForecastEvidence[],
  ): Promise<PersistedForecastEvidence[]>;
  listForecastEvidence(
    tenantId: string,
    workspaceId: string,
    forecastStateId: string,
  ): Promise<PersistedForecastEvidence[]>;
  saveForecastReview(review: PersistedForecastReview): Promise<PersistedForecastReview>;
  listForecastReviews(
    tenantId: string,
    workspaceId: string,
    forecastStateId?: string,
  ): Promise<PersistedForecastReview[]>;
  saveForecastConfidence(
    confidence: PersistedForecastConfidence,
  ): Promise<PersistedForecastConfidence>;
  listForecastConfidence(
    tenantId: string,
    workspaceId: string,
    forecastStateId: string,
  ): Promise<PersistedForecastConfidence[]>;

  saveDecisionState(state: PersistedDecisionState): Promise<PersistedDecisionState>;
  getDecisionStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedDecisionState | null>;
  latestDecisionState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    decisionUnitId: string,
    asOf?: string,
  ): Promise<PersistedDecisionState | undefined>;
  listDecisionStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedDecisionState[]>;
  nextDecisionStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    decisionUnitId: string,
    expectedVersion?: number,
  ): Promise<number>;
  saveDecisionEvidence(
    evidence: readonly PersistedDecisionEvidence[],
  ): Promise<PersistedDecisionEvidence[]>;
  listDecisionEvidence(
    tenantId: string,
    workspaceId: string,
    decisionStateId: string,
  ): Promise<PersistedDecisionEvidence[]>;
  saveDecisionReview(review: PersistedDecisionReview): Promise<PersistedDecisionReview>;
  listDecisionReviews(
    tenantId: string,
    workspaceId: string,
    decisionStateId?: string,
  ): Promise<PersistedDecisionReview[]>;
  saveDecisionConfidence(
    confidence: PersistedDecisionConfidence,
  ): Promise<PersistedDecisionConfidence>;
  listDecisionConfidence(
    tenantId: string,
    workspaceId: string,
    decisionStateId: string,
  ): Promise<PersistedDecisionConfidence[]>;

  saveScenarioState(state: PersistedScenarioState): Promise<PersistedScenarioState>;
  getScenarioStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedScenarioState | null>;
  latestScenarioState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    scenarioUnitId: string,
    asOf?: string,
  ): Promise<PersistedScenarioState | undefined>;
  listScenarioStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedScenarioState[]>;
  nextScenarioStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    scenarioUnitId: string,
    expectedVersion?: number,
  ): Promise<number>;
  saveScenarioEvidence(
    evidence: readonly PersistedScenarioEvidence[],
  ): Promise<PersistedScenarioEvidence[]>;
  listScenarioEvidence(
    tenantId: string,
    workspaceId: string,
    scenarioStateId: string,
  ): Promise<PersistedScenarioEvidence[]>;
  saveScenarioReview(review: PersistedScenarioReview): Promise<PersistedScenarioReview>;
  listScenarioReviews(
    tenantId: string,
    workspaceId: string,
    scenarioStateId?: string,
  ): Promise<PersistedScenarioReview[]>;
  saveScenarioConfidence(
    confidence: PersistedScenarioConfidence,
  ): Promise<PersistedScenarioConfidence>;
  listScenarioConfidence(
    tenantId: string,
    workspaceId: string,
    scenarioStateId: string,
  ): Promise<PersistedScenarioConfidence[]>;

  saveRiskOpportunityState(state: PersistedRiskOpportunityState): Promise<PersistedRiskOpportunityState>;
  getRiskOpportunityStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedRiskOpportunityState | null>;
  latestRiskOpportunityState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    riskOpportunityUnitId: string,
    asOf?: string,
  ): Promise<PersistedRiskOpportunityState | undefined>;
  listRiskOpportunityStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedRiskOpportunityState[]>;
  nextRiskOpportunityStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    riskOpportunityUnitId: string,
    expectedVersion?: number,
  ): Promise<number>;
  saveRiskOpportunityEvidence(
    evidence: readonly PersistedRiskOpportunityEvidence[],
  ): Promise<PersistedRiskOpportunityEvidence[]>;
  listRiskOpportunityEvidence(
    tenantId: string,
    workspaceId: string,
    riskOpportunityStateId: string,
  ): Promise<PersistedRiskOpportunityEvidence[]>;
  saveRiskOpportunityReview(
    review: PersistedRiskOpportunityReview,
  ): Promise<PersistedRiskOpportunityReview>;
  listRiskOpportunityReviews(
    tenantId: string,
    workspaceId: string,
    riskOpportunityStateId?: string,
  ): Promise<PersistedRiskOpportunityReview[]>;
  saveRiskOpportunityConfidence(
    confidence: PersistedRiskOpportunityConfidence,
  ): Promise<PersistedRiskOpportunityConfidence>;
  listRiskOpportunityConfidence(
    tenantId: string,
    workspaceId: string,
    riskOpportunityStateId: string,
  ): Promise<PersistedRiskOpportunityConfidence[]>;

  saveProjectSnapshot(snapshot: PersistedProjectSnapshot): Promise<PersistedProjectSnapshot>;
  getProjectSnapshotById(
    tenantId: string,
    workspaceId: string,
    snapshotId: string,
  ): Promise<PersistedProjectSnapshot | null>;
  listProjectSnapshots(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProjectSnapshot[]>;

  appendProjectTimeline(
    entry: PersistedProjectTimelineEvent,
  ): Promise<PersistedProjectTimelineEvent>;
  listProjectTimeline(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProjectTimelineEvent[]>;

  saveProjectProfile(profile: PersistedProjectProfile): Promise<PersistedProjectProfile>;
  latestProjectProfile(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProjectProfile | undefined>;
  nextProjectProfileVersion(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<number>;

  findIdempotency(
    tenantId: string,
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<IdempotencyRecord | null>;
  saveIdempotency(record: IdempotencyRecord): Promise<IdempotencyRecord>;

  enqueueOutbox(record: OutboxEventRecord): Promise<OutboxEventRecord>;
  listOutbox(tenantId: string, workspaceId: string): Promise<OutboxEventRecord[]>;
};

export type DurableProjectControlsStore = {
  progressAssessments: PersistedProgressAssessment[];
  progressEvidence: PersistedProgressEvidence[];
  progressReviews: PersistedProgressReview[];
  progressSnapshots: PersistedProgressSnapshot[];
  progressTimeline: PersistedProgressTimelineEvent[];
  scheduleAssessments: PersistedScheduleAssessment[];
  scheduleEvidence: PersistedScheduleEvidence[];
  scheduleReviews: PersistedScheduleReview[];
  scheduleSnapshots: PersistedScheduleSnapshot[];
  scheduleTimeline: PersistedScheduleTimelineEvent[];
  changeStates: PersistedChangeState[];
  changeEvidence: PersistedChangeEvidence[];
  changeReviews: PersistedChangeReview[];
  changeConfidence: PersistedChangeConfidence[];
  changeCandidates: PersistedChangeCandidate[];
  costStates: PersistedCostState[];
  costEvidence: PersistedCostEvidence[];
  costReviews: PersistedCostReview[];
  costConfidence: PersistedCostConfidence[];
  productivityStates: PersistedProductivityState[];
  productivityEvidence: PersistedProductivityEvidence[];
  productivityReviews: PersistedProductivityReview[];
  productivityConfidence: PersistedProductivityConfidence[];
  forecastStates: PersistedForecastState[];
  forecastEvidence: PersistedForecastEvidence[];
  forecastReviews: PersistedForecastReview[];
  forecastConfidence: PersistedForecastConfidence[];
  decisionStates: PersistedDecisionState[];
  decisionEvidence: PersistedDecisionEvidence[];
  decisionReviews: PersistedDecisionReview[];
  decisionConfidence: PersistedDecisionConfidence[];
  scenarioStates: PersistedScenarioState[];
  scenarioEvidence: PersistedScenarioEvidence[];
  scenarioReviews: PersistedScenarioReview[];
  scenarioConfidence: PersistedScenarioConfidence[];
  riskOpportunityStates: PersistedRiskOpportunityState[];
  riskOpportunityEvidence: PersistedRiskOpportunityEvidence[];
  riskOpportunityReviews: PersistedRiskOpportunityReview[];
  riskOpportunityConfidence: PersistedRiskOpportunityConfidence[];
  projectSnapshots: PersistedProjectSnapshot[];
  projectTimeline: PersistedProjectTimelineEvent[];
  projectProfiles: PersistedProjectProfile[];
  idempotency: IdempotencyRecord[];
  outbox: OutboxEventRecord[];
  events: ProjectControlsEvent[];
};

export function createDurableProjectControlsMemoryStore(): DurableProjectControlsStore {
  return {
    progressAssessments: [],
    progressEvidence: [],
    progressReviews: [],
    progressSnapshots: [],
    progressTimeline: [],
    scheduleAssessments: [],
    scheduleEvidence: [],
    scheduleReviews: [],
    scheduleSnapshots: [],
    scheduleTimeline: [],
    changeStates: [],
    changeEvidence: [],
    changeReviews: [],
    changeConfidence: [],
    changeCandidates: [],
    costStates: [],
    costEvidence: [],
    costReviews: [],
    costConfidence: [],
    productivityStates: [],
    productivityEvidence: [],
    productivityReviews: [],
    productivityConfidence: [],
    forecastStates: [],
    forecastEvidence: [],
    forecastReviews: [],
    forecastConfidence: [],
    decisionStates: [],
    decisionEvidence: [],
    decisionReviews: [],
    decisionConfidence: [],
    scenarioStates: [],
    scenarioEvidence: [],
    scenarioReviews: [],
    scenarioConfidence: [],
    riskOpportunityStates: [],
    riskOpportunityEvidence: [],
    riskOpportunityReviews: [],
    riskOpportunityConfidence: [],
    projectSnapshots: [],
    projectTimeline: [],
    projectProfiles: [],
    idempotency: [],
    outbox: [],
    events: [],
  };
}

function latestAsOf<T extends { recordedAt: string; version: number }>(
  rows: T[],
  asOf?: string,
): T | undefined {
  const filtered = asOf
    ? rows.filter((row) => Date.parse(row.recordedAt) <= Date.parse(asOf))
    : rows;
  return [...filtered].sort(
    (a, b) => b.version - a.version || Date.parse(b.recordedAt) - Date.parse(a.recordedAt),
  )[0];
}

function assertNextVersion(current: number, expectedVersion?: number): void {
  if (expectedVersion !== undefined && expectedVersion !== current) {
    throw new Error(`optimistic_lock_conflict:expected=${expectedVersion};actual=${current}`);
  }
}

/** Test/certification unit adapter only — not for production. */
export class MemoryProjectControlsRepository implements ProjectControlsRepositoryPort {
  readonly adapterKind = "memory" as const;

  constructor(private readonly store: DurableProjectControlsStore) {}

  newId(_prefix: string): string {
    return randomUUID();
  }

  getStore(): DurableProjectControlsStore {
    return this.store;
  }

  async saveProgressAssessment(
    state: PersistedProgressAssessment,
  ): Promise<PersistedProgressAssessment> {
    const clash = this.store.progressAssessments.find(
      (row) =>
        row.tenantId === state.tenantId &&
        row.workspaceId === state.workspaceId &&
        scopeKey(row.scope) === scopeKey(state.scope) &&
        row.version === state.version,
    );
    if (clash) {
      throw new Error(`optimistic_lock_conflict:version=${state.version}`);
    }
    this.store.progressAssessments.push(state);
    return state;
  }

  async getProgressAssessmentById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedProgressAssessment | null> {
    return (
      this.store.progressAssessments.find(
        (row) =>
          row.stateId === stateId &&
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async latestProgressAssessment(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    asOf?: string,
  ): Promise<PersistedProgressAssessment | undefined> {
    return latestAsOf(
      this.store.progressAssessments.filter(
        (row) =>
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId &&
          scopeKey(row.scope) === scopeKey(scope),
      ),
      asOf,
    );
  }

  async listProgressAssessments(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProgressAssessment[]> {
    return this.store.progressAssessments.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async nextProgressAssessmentVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestProgressAssessment(tenantId, workspaceId, scope);
    const current = latest?.version ?? 0;
    assertNextVersion(current, expectedVersion);
    return current + 1;
  }

  async saveProgressEvidence(
    evidence: readonly PersistedProgressEvidence[],
  ): Promise<PersistedProgressEvidence[]> {
    this.store.progressEvidence.push(...evidence);
    return [...evidence];
  }

  async listProgressEvidence(
    tenantId: string,
    workspaceId: string,
    assessmentStateId: string,
  ): Promise<PersistedProgressEvidence[]> {
    return this.store.progressEvidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.assessmentStateId === assessmentStateId,
    );
  }

  async saveProgressReview(review: PersistedProgressReview): Promise<PersistedProgressReview> {
    this.store.progressReviews.push(review);
    return review;
  }

  async listProgressReviews(
    tenantId: string,
    workspaceId: string,
    assessmentStateId?: string,
  ): Promise<PersistedProgressReview[]> {
    return this.store.progressReviews.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        (!assessmentStateId || row.assessmentStateId === assessmentStateId),
    );
  }

  async saveProgressSnapshot(
    snapshot: PersistedProgressSnapshot,
  ): Promise<PersistedProgressSnapshot> {
    this.store.progressSnapshots.push(snapshot);
    return snapshot;
  }

  async listProgressSnapshots(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProgressSnapshot[]> {
    return this.store.progressSnapshots.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async appendProgressTimeline(
    entry: PersistedProgressTimelineEvent,
  ): Promise<PersistedProgressTimelineEvent> {
    this.store.progressTimeline.push(entry);
    return entry;
  }

  async listProgressTimeline(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProgressTimelineEvent[]> {
    return this.store.progressTimeline.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async saveScheduleAssessment(
    state: PersistedScheduleAssessment,
  ): Promise<PersistedScheduleAssessment> {
    const clash = this.store.scheduleAssessments.find(
      (row) =>
        row.tenantId === state.tenantId &&
        row.workspaceId === state.workspaceId &&
        scopeKey(row.scope) === scopeKey(state.scope) &&
        row.version === state.version,
    );
    if (clash) {
      throw new Error(`optimistic_lock_conflict:version=${state.version}`);
    }
    this.store.scheduleAssessments.push(state);
    return state;
  }

  async getScheduleAssessmentById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedScheduleAssessment | null> {
    return (
      this.store.scheduleAssessments.find(
        (row) =>
          row.stateId === stateId &&
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async latestScheduleAssessment(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    asOf?: string,
  ): Promise<PersistedScheduleAssessment | undefined> {
    return latestAsOf(
      this.store.scheduleAssessments.filter(
        (row) =>
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId &&
          scopeKey(row.scope) === scopeKey(scope),
      ),
      asOf,
    );
  }

  async listScheduleAssessments(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedScheduleAssessment[]> {
    return this.store.scheduleAssessments.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async nextScheduleAssessmentVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestScheduleAssessment(tenantId, workspaceId, scope);
    const current = latest?.version ?? 0;
    assertNextVersion(current, expectedVersion);
    return current + 1;
  }

  async saveScheduleEvidence(
    evidence: readonly PersistedScheduleEvidence[],
  ): Promise<PersistedScheduleEvidence[]> {
    this.store.scheduleEvidence.push(...evidence);
    return [...evidence];
  }

  async listScheduleEvidence(
    tenantId: string,
    workspaceId: string,
    assessmentStateId: string,
  ): Promise<PersistedScheduleEvidence[]> {
    return this.store.scheduleEvidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.assessmentStateId === assessmentStateId,
    );
  }

  async saveScheduleReview(review: PersistedScheduleReview): Promise<PersistedScheduleReview> {
    this.store.scheduleReviews.push(review);
    return review;
  }

  async listScheduleReviews(
    tenantId: string,
    workspaceId: string,
    assessmentStateId?: string,
  ): Promise<PersistedScheduleReview[]> {
    return this.store.scheduleReviews.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        (!assessmentStateId || row.assessmentStateId === assessmentStateId),
    );
  }

  async saveScheduleSnapshot(
    snapshot: PersistedScheduleSnapshot,
  ): Promise<PersistedScheduleSnapshot> {
    this.store.scheduleSnapshots.push(snapshot);
    return snapshot;
  }

  async listScheduleSnapshots(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedScheduleSnapshot[]> {
    return this.store.scheduleSnapshots.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async appendScheduleTimeline(
    entry: PersistedScheduleTimelineEvent,
  ): Promise<PersistedScheduleTimelineEvent> {
    this.store.scheduleTimeline.push(entry);
    return entry;
  }

  async listScheduleTimeline(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedScheduleTimelineEvent[]> {
    return this.store.scheduleTimeline.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async saveChangeState(state: PersistedChangeState): Promise<PersistedChangeState> {
    const clash = this.store.changeStates.find(
      (row) =>
        row.tenantId === state.tenantId &&
        row.workspaceId === state.workspaceId &&
        changeStateKey(row.scope, row.changeClass) ===
          changeStateKey(state.scope, state.changeClass) &&
        row.version === state.version,
    );
    if (clash) {
      throw new Error(`optimistic_lock_conflict:change_version=${state.version}`);
    }
    this.store.changeStates.push(state);
    return state;
  }

  async getChangeStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedChangeState | null> {
    return (
      this.store.changeStates.find(
        (row) =>
          row.stateId === stateId &&
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async latestChangeState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    changeClass: ChangeClassification,
    asOf?: string,
  ): Promise<PersistedChangeState | undefined> {
    return latestAsOf(
      this.store.changeStates.filter(
        (row) =>
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId &&
          changeStateKey(row.scope, row.changeClass) === changeStateKey(scope, changeClass),
      ),
      asOf,
    );
  }

  async listChangeStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedChangeState[]> {
    return this.store.changeStates.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async nextChangeStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    changeClass: ChangeClassification,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestChangeState(tenantId, workspaceId, scope, changeClass);
    const current = latest?.version ?? 0;
    assertNextVersion(current, expectedVersion);
    return current + 1;
  }

  async saveChangeEvidence(
    evidence: readonly PersistedChangeEvidence[],
  ): Promise<PersistedChangeEvidence[]> {
    this.store.changeEvidence.push(...evidence);
    return [...evidence];
  }

  async listChangeEvidence(
    tenantId: string,
    workspaceId: string,
    changeStateId: string,
  ): Promise<PersistedChangeEvidence[]> {
    return this.store.changeEvidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.changeStateId === changeStateId,
    );
  }

  async saveChangeReview(review: PersistedChangeReview): Promise<PersistedChangeReview> {
    this.store.changeReviews.push(review);
    return review;
  }

  async listChangeReviews(
    tenantId: string,
    workspaceId: string,
    changeStateId?: string,
  ): Promise<PersistedChangeReview[]> {
    return this.store.changeReviews.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        (!changeStateId || row.changeStateId === changeStateId),
    );
  }

  async saveChangeConfidence(
    confidence: PersistedChangeConfidence,
  ): Promise<PersistedChangeConfidence> {
    this.store.changeConfidence.push(confidence);
    return confidence;
  }

  async listChangeConfidence(
    tenantId: string,
    workspaceId: string,
    changeStateId: string,
  ): Promise<PersistedChangeConfidence[]> {
    return this.store.changeConfidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.changeStateId === changeStateId,
    );
  }

  async saveChangeCandidate(
    candidate: PersistedChangeCandidate,
  ): Promise<PersistedChangeCandidate> {
    this.store.changeCandidates.push(candidate);
    return candidate;
  }

  async getChangeCandidateById(
    tenantId: string,
    workspaceId: string,
    candidateId: string,
  ): Promise<PersistedChangeCandidate | null> {
    return (
      this.store.changeCandidates.find(
        (row) =>
          row.candidateId === candidateId &&
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async listChangeCandidates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedChangeCandidate[]> {
    return this.store.changeCandidates.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async saveCostState(state: PersistedCostState): Promise<PersistedCostState> {
    const accountId = state.controlContext.accountRef.accountId;
    const clash = this.store.costStates.find(
      (row) =>
        row.tenantId === state.tenantId &&
        row.workspaceId === state.workspaceId &&
        costStateKey(row.controlContext.scope, row.controlContext.accountRef.accountId) ===
          costStateKey(state.controlContext.scope, accountId) &&
        row.version === state.version,
    );
    if (clash) {
      throw new Error(`optimistic_lock_conflict:cost_version=${state.version}`);
    }
    this.store.costStates.push(state);
    return state;
  }

  async getCostStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedCostState | null> {
    return (
      this.store.costStates.find(
        (row) =>
          row.stateId === stateId &&
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async latestCostState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    accountId: string,
    asOf?: string,
  ): Promise<PersistedCostState | undefined> {
    return latestAsOf(
      this.store.costStates.filter(
        (row) =>
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId &&
          costStateKey(row.controlContext.scope, row.controlContext.accountRef.accountId) ===
            costStateKey(scope, accountId),
      ),
      asOf,
    );
  }

  async listCostStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedCostState[]> {
    return this.store.costStates.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async nextCostStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    accountId: string,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestCostState(tenantId, workspaceId, scope, accountId);
    const current = latest?.version ?? 0;
    assertNextVersion(current, expectedVersion);
    return current + 1;
  }

  async saveCostEvidence(
    evidence: readonly PersistedCostEvidence[],
  ): Promise<PersistedCostEvidence[]> {
    this.store.costEvidence.push(...evidence);
    return [...evidence];
  }

  async listCostEvidence(
    tenantId: string,
    workspaceId: string,
    costStateId: string,
  ): Promise<PersistedCostEvidence[]> {
    return this.store.costEvidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.costStateId === costStateId,
    );
  }

  async saveCostReview(review: PersistedCostReview): Promise<PersistedCostReview> {
    this.store.costReviews.push(review);
    return review;
  }

  async listCostReviews(
    tenantId: string,
    workspaceId: string,
    costStateId?: string,
  ): Promise<PersistedCostReview[]> {
    return this.store.costReviews.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        (!costStateId || row.costStateId === costStateId),
    );
  }

  async saveCostConfidence(
    confidence: PersistedCostConfidence,
  ): Promise<PersistedCostConfidence> {
    this.store.costConfidence.push(confidence);
    return confidence;
  }

  async listCostConfidence(
    tenantId: string,
    workspaceId: string,
    costStateId: string,
  ): Promise<PersistedCostConfidence[]> {
    return this.store.costConfidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.costStateId === costStateId,
    );
  }

  async saveProductivityState(state: PersistedProductivityState): Promise<PersistedProductivityState> {
    const controlUnitId = state.controlContext.controlUnitId;
    const clash = this.store.productivityStates.find(
      (row) =>
        row.tenantId === state.tenantId &&
        row.workspaceId === state.workspaceId &&
        productivityStateKey(row.controlContext.scope, row.controlContext.controlUnitId) ===
          productivityStateKey(state.controlContext.scope, controlUnitId) &&
        row.version === state.version,
    );
    if (clash) {
      throw new Error(`optimistic_lock_conflict:productivity_version=${state.version}`);
    }
    this.store.productivityStates.push(state);
    return state;
  }

  async getProductivityStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedProductivityState | null> {
    return (
      this.store.productivityStates.find(
        (row) =>
          row.stateId === stateId &&
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async latestProductivityState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    controlUnitId: string,
    asOf?: string,
  ): Promise<PersistedProductivityState | undefined> {
    return latestAsOf(
      this.store.productivityStates.filter(
        (row) =>
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId &&
          productivityStateKey(row.controlContext.scope, row.controlContext.controlUnitId) ===
            productivityStateKey(scope, controlUnitId),
      ),
      asOf,
    );
  }

  async listProductivityStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProductivityState[]> {
    return this.store.productivityStates.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async nextProductivityStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    controlUnitId: string,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestProductivityState(tenantId, workspaceId, scope, controlUnitId);
    const current = latest?.version ?? 0;
    assertNextVersion(current, expectedVersion);
    return current + 1;
  }

  async saveProductivityEvidence(
    evidence: readonly PersistedProductivityEvidence[],
  ): Promise<PersistedProductivityEvidence[]> {
    this.store.productivityEvidence.push(...evidence);
    return [...evidence];
  }

  async listProductivityEvidence(
    tenantId: string,
    workspaceId: string,
    productivityStateId: string,
  ): Promise<PersistedProductivityEvidence[]> {
    return this.store.productivityEvidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.productivityStateId === productivityStateId,
    );
  }

  async saveProductivityReview(review: PersistedProductivityReview): Promise<PersistedProductivityReview> {
    this.store.productivityReviews.push(review);
    return review;
  }

  async listProductivityReviews(
    tenantId: string,
    workspaceId: string,
    productivityStateId?: string,
  ): Promise<PersistedProductivityReview[]> {
    return this.store.productivityReviews.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        (!productivityStateId || row.productivityStateId === productivityStateId),
    );
  }

  async saveProductivityConfidence(
    confidence: PersistedProductivityConfidence,
  ): Promise<PersistedProductivityConfidence> {
    this.store.productivityConfidence.push(confidence);
    return confidence;
  }

  async listProductivityConfidence(
    tenantId: string,
    workspaceId: string,
    productivityStateId: string,
  ): Promise<PersistedProductivityConfidence[]> {
    return this.store.productivityConfidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.productivityStateId === productivityStateId,
    );
  }

  async saveForecastState(state: PersistedForecastState): Promise<PersistedForecastState> {
    const trajectoryUnitId = state.controlContext.trajectoryUnitId;
    const clash = this.store.forecastStates.find(
      (row) =>
        row.tenantId === state.tenantId &&
        row.workspaceId === state.workspaceId &&
        forecastStateKey(row.controlContext.scope, row.controlContext.trajectoryUnitId) ===
          forecastStateKey(state.controlContext.scope, trajectoryUnitId) &&
        row.version === state.version,
    );
    if (clash) throw new Error(`optimistic_lock_conflict:forecast_version=${state.version}`);
    this.store.forecastStates.push(state);
    return state;
  }

  async getForecastStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedForecastState | null> {
    return (
      this.store.forecastStates.find(
        (row) =>
          row.stateId === stateId &&
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async latestForecastState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    trajectoryUnitId: string,
    asOf?: string,
  ): Promise<PersistedForecastState | undefined> {
    return latestAsOf(
      this.store.forecastStates.filter(
        (row) =>
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId &&
          forecastStateKey(row.controlContext.scope, row.controlContext.trajectoryUnitId) ===
            forecastStateKey(scope, trajectoryUnitId),
      ),
      asOf,
    );
  }

  async listForecastStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedForecastState[]> {
    return this.store.forecastStates.filter(
      (row) =>
        row.tenantId === tenantId && row.workspaceId === workspaceId && row.projectId === projectId,
    );
  }

  async nextForecastStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    trajectoryUnitId: string,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestForecastState(tenantId, workspaceId, scope, trajectoryUnitId);
    const next = (latest?.version ?? 0) + 1;
    if (expectedVersion !== undefined && expectedVersion !== next - 1) {
      throw new Error(`optimistic_lock_conflict:forecast_expected=${expectedVersion}`);
    }
    return next;
  }

  async saveForecastEvidence(
    evidence: readonly PersistedForecastEvidence[],
  ): Promise<PersistedForecastEvidence[]> {
    this.store.forecastEvidence.push(...evidence);
    return [...evidence];
  }

  async listForecastEvidence(
    tenantId: string,
    workspaceId: string,
    forecastStateId: string,
  ): Promise<PersistedForecastEvidence[]> {
    return this.store.forecastEvidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.forecastStateId === forecastStateId,
    );
  }

  async saveForecastReview(review: PersistedForecastReview): Promise<PersistedForecastReview> {
    this.store.forecastReviews.push(review);
    return review;
  }

  async listForecastReviews(
    tenantId: string,
    workspaceId: string,
    forecastStateId?: string,
  ): Promise<PersistedForecastReview[]> {
    return this.store.forecastReviews.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        (!forecastStateId || row.forecastStateId === forecastStateId),
    );
  }

  async saveForecastConfidence(
    confidence: PersistedForecastConfidence,
  ): Promise<PersistedForecastConfidence> {
    this.store.forecastConfidence.push(confidence);
    return confidence;
  }

  async listForecastConfidence(
    tenantId: string,
    workspaceId: string,
    forecastStateId: string,
  ): Promise<PersistedForecastConfidence[]> {
    return this.store.forecastConfidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.forecastStateId === forecastStateId,
    );
  }

  async saveDecisionState(state: PersistedDecisionState): Promise<PersistedDecisionState> {
    const decisionUnitId = state.controlContext.decisionUnitId;
    const clash = this.store.decisionStates.find(
      (row) =>
        row.tenantId === state.tenantId &&
        row.workspaceId === state.workspaceId &&
        decisionStateKey(row.controlContext.scope, row.controlContext.decisionUnitId) ===
          decisionStateKey(state.controlContext.scope, decisionUnitId) &&
        row.version === state.version,
    );
    if (clash) throw new Error(`optimistic_lock_conflict:decision_version=${state.version}`);
    this.store.decisionStates.push(state);
    return state;
  }

  async getDecisionStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedDecisionState | null> {
    return (
      this.store.decisionStates.find(
        (row) =>
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId &&
          row.stateId === stateId,
      ) ?? null
    );
  }

  async latestDecisionState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    decisionUnitId: string,
    asOf?: string,
  ): Promise<PersistedDecisionState | undefined> {
    return latestAsOf(
      this.store.decisionStates.filter(
        (row) =>
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId &&
          decisionStateKey(row.controlContext.scope, row.controlContext.decisionUnitId) ===
            decisionStateKey(scope, decisionUnitId),
      ),
      asOf,
    );
  }

  async listDecisionStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedDecisionState[]> {
    return this.store.decisionStates.filter(
      (row) =>
        row.tenantId === tenantId && row.workspaceId === workspaceId && row.projectId === projectId,
    );
  }

  async nextDecisionStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    decisionUnitId: string,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestDecisionState(tenantId, workspaceId, scope, decisionUnitId);
    const next = (latest?.version ?? 0) + 1;
    if (expectedVersion !== undefined && expectedVersion !== next - 1) {
      throw new Error(`optimistic_lock_conflict:decision_expected=${expectedVersion}`);
    }
    return next;
  }

  async saveDecisionEvidence(
    evidence: readonly PersistedDecisionEvidence[],
  ): Promise<PersistedDecisionEvidence[]> {
    this.store.decisionEvidence.push(...evidence);
    return [...evidence];
  }

  async listDecisionEvidence(
    tenantId: string,
    workspaceId: string,
    decisionStateId: string,
  ): Promise<PersistedDecisionEvidence[]> {
    return this.store.decisionEvidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.decisionStateId === decisionStateId,
    );
  }

  async saveDecisionReview(review: PersistedDecisionReview): Promise<PersistedDecisionReview> {
    this.store.decisionReviews.push(review);
    return review;
  }

  async listDecisionReviews(
    tenantId: string,
    workspaceId: string,
    decisionStateId?: string,
  ): Promise<PersistedDecisionReview[]> {
    return this.store.decisionReviews.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        (!decisionStateId || row.decisionStateId === decisionStateId),
    );
  }

  async saveDecisionConfidence(
    confidence: PersistedDecisionConfidence,
  ): Promise<PersistedDecisionConfidence> {
    this.store.decisionConfidence.push(confidence);
    return confidence;
  }

  async listDecisionConfidence(
    tenantId: string,
    workspaceId: string,
    decisionStateId: string,
  ): Promise<PersistedDecisionConfidence[]> {
    return this.store.decisionConfidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.decisionStateId === decisionStateId,
    );
  }

  async saveScenarioState(state: PersistedScenarioState): Promise<PersistedScenarioState> {
    const scenarioUnitId = state.controlContext.scenarioUnitId;
    const clash = this.store.scenarioStates.find(
      (row) =>
        row.tenantId === state.tenantId &&
        row.workspaceId === state.workspaceId &&
        scenarioStateKey(row.controlContext.scope, row.controlContext.scenarioUnitId) ===
          scenarioStateKey(state.controlContext.scope, scenarioUnitId) &&
        row.version === state.version,
    );
    if (clash) throw new Error(`optimistic_lock_conflict:scenario_version=${state.version}`);
    this.store.scenarioStates.push(state);
    return state;
  }

  async getScenarioStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedScenarioState | null> {
    return (
      this.store.scenarioStates.find(
        (row) =>
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId &&
          row.stateId === stateId,
      ) ?? null
    );
  }

  async latestScenarioState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    scenarioUnitId: string,
    asOf?: string,
  ): Promise<PersistedScenarioState | undefined> {
    return latestAsOf(
      this.store.scenarioStates.filter(
        (row) =>
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId &&
          scenarioStateKey(row.controlContext.scope, row.controlContext.scenarioUnitId) ===
            scenarioStateKey(scope, scenarioUnitId),
      ),
      asOf,
    );
  }

  async listScenarioStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedScenarioState[]> {
    return this.store.scenarioStates.filter(
      (row) =>
        row.tenantId === tenantId && row.workspaceId === workspaceId && row.projectId === projectId,
    );
  }

  async nextScenarioStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    scenarioUnitId: string,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestScenarioState(tenantId, workspaceId, scope, scenarioUnitId);
    const next = (latest?.version ?? 0) + 1;
    if (expectedVersion !== undefined && expectedVersion !== next - 1) {
      throw new Error(`optimistic_lock_conflict:scenario_expected=${expectedVersion}`);
    }
    return next;
  }

  async saveScenarioEvidence(
    evidence: readonly PersistedScenarioEvidence[],
  ): Promise<PersistedScenarioEvidence[]> {
    this.store.scenarioEvidence.push(...evidence);
    return [...evidence];
  }

  async listScenarioEvidence(
    tenantId: string,
    workspaceId: string,
    scenarioStateId: string,
  ): Promise<PersistedScenarioEvidence[]> {
    return this.store.scenarioEvidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.scenarioStateId === scenarioStateId,
    );
  }

  async saveScenarioReview(review: PersistedScenarioReview): Promise<PersistedScenarioReview> {
    this.store.scenarioReviews.push(review);
    return review;
  }

  async listScenarioReviews(
    tenantId: string,
    workspaceId: string,
    scenarioStateId?: string,
  ): Promise<PersistedScenarioReview[]> {
    return this.store.scenarioReviews.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        (!scenarioStateId || row.scenarioStateId === scenarioStateId),
    );
  }

  async saveScenarioConfidence(
    confidence: PersistedScenarioConfidence,
  ): Promise<PersistedScenarioConfidence> {
    this.store.scenarioConfidence.push(confidence);
    return confidence;
  }

  async listScenarioConfidence(
    tenantId: string,
    workspaceId: string,
    scenarioStateId: string,
  ): Promise<PersistedScenarioConfidence[]> {
    return this.store.scenarioConfidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.scenarioStateId === scenarioStateId,
    );
  }

  async saveRiskOpportunityState(
    state: PersistedRiskOpportunityState,
  ): Promise<PersistedRiskOpportunityState> {
    const riskOpportunityUnitId = state.controlContext.riskOpportunityUnitId;
    const clash = this.store.riskOpportunityStates.find(
      (row) =>
        row.tenantId === state.tenantId &&
        row.workspaceId === state.workspaceId &&
        riskOpportunityStateKey(row.controlContext.scope, row.controlContext.riskOpportunityUnitId) ===
          riskOpportunityStateKey(state.controlContext.scope, riskOpportunityUnitId) &&
        row.version === state.version,
    );
    if (clash) throw new Error(`optimistic_lock_conflict:risk_opportunity_version=${state.version}`);
    this.store.riskOpportunityStates.push(state);
    return state;
  }

  async getRiskOpportunityStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedRiskOpportunityState | null> {
    return (
      this.store.riskOpportunityStates.find(
        (row) =>
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId &&
          row.stateId === stateId,
      ) ?? null
    );
  }

  async latestRiskOpportunityState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    riskOpportunityUnitId: string,
    asOf?: string,
  ): Promise<PersistedRiskOpportunityState | undefined> {
    return latestAsOf(
      this.store.riskOpportunityStates.filter(
        (row) =>
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId &&
          riskOpportunityStateKey(row.controlContext.scope, row.controlContext.riskOpportunityUnitId) ===
            riskOpportunityStateKey(scope, riskOpportunityUnitId),
      ),
      asOf,
    );
  }

  async listRiskOpportunityStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedRiskOpportunityState[]> {
    return this.store.riskOpportunityStates.filter(
      (row) =>
        row.tenantId === tenantId && row.workspaceId === workspaceId && row.projectId === projectId,
    );
  }

  async nextRiskOpportunityStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    riskOpportunityUnitId: string,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestRiskOpportunityState(
      tenantId,
      workspaceId,
      scope,
      riskOpportunityUnitId,
    );
    const next = (latest?.version ?? 0) + 1;
    if (expectedVersion !== undefined && expectedVersion !== next - 1) {
      throw new Error(`optimistic_lock_conflict:risk_opportunity_expected=${expectedVersion}`);
    }
    return next;
  }

  async saveRiskOpportunityEvidence(
    evidence: readonly PersistedRiskOpportunityEvidence[],
  ): Promise<PersistedRiskOpportunityEvidence[]> {
    this.store.riskOpportunityEvidence.push(...evidence);
    return [...evidence];
  }

  async listRiskOpportunityEvidence(
    tenantId: string,
    workspaceId: string,
    riskOpportunityStateId: string,
  ): Promise<PersistedRiskOpportunityEvidence[]> {
    return this.store.riskOpportunityEvidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.riskOpportunityStateId === riskOpportunityStateId,
    );
  }

  async saveRiskOpportunityReview(
    review: PersistedRiskOpportunityReview,
  ): Promise<PersistedRiskOpportunityReview> {
    this.store.riskOpportunityReviews.push(review);
    return review;
  }

  async listRiskOpportunityReviews(
    tenantId: string,
    workspaceId: string,
    riskOpportunityStateId?: string,
  ): Promise<PersistedRiskOpportunityReview[]> {
    return this.store.riskOpportunityReviews.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        (!riskOpportunityStateId || row.riskOpportunityStateId === riskOpportunityStateId),
    );
  }

  async saveRiskOpportunityConfidence(
    confidence: PersistedRiskOpportunityConfidence,
  ): Promise<PersistedRiskOpportunityConfidence> {
    this.store.riskOpportunityConfidence.push(confidence);
    return confidence;
  }

  async listRiskOpportunityConfidence(
    tenantId: string,
    workspaceId: string,
    riskOpportunityStateId: string,
  ): Promise<PersistedRiskOpportunityConfidence[]> {
    return this.store.riskOpportunityConfidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.riskOpportunityStateId === riskOpportunityStateId,
    );
  }

  async saveProjectSnapshot(
    snapshot: PersistedProjectSnapshot,
  ): Promise<PersistedProjectSnapshot> {
    const clash = this.store.projectSnapshots.find(
      (row) => row.snapshotId === snapshot.snapshotId,
    );
    if (clash) throw new Error("project_snapshot_is_immutable");
    this.store.projectSnapshots.push(snapshot);
    return snapshot;
  }

  async getProjectSnapshotById(
    tenantId: string,
    workspaceId: string,
    snapshotId: string,
  ): Promise<PersistedProjectSnapshot | null> {
    return (
      this.store.projectSnapshots.find(
        (row) =>
          row.snapshotId === snapshotId &&
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async listProjectSnapshots(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProjectSnapshot[]> {
    return this.store.projectSnapshots.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async appendProjectTimeline(
    entry: PersistedProjectTimelineEvent,
  ): Promise<PersistedProjectTimelineEvent> {
    this.store.projectTimeline.push(entry);
    return entry;
  }

  async listProjectTimeline(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProjectTimelineEvent[]> {
    return this.store.projectTimeline.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async saveProjectProfile(profile: PersistedProjectProfile): Promise<PersistedProjectProfile> {
    const clash = this.store.projectProfiles.find(
      (row) =>
        row.tenantId === profile.tenantId &&
        row.workspaceId === profile.workspaceId &&
        row.projectId === profile.projectId &&
        row.version === profile.version,
    );
    if (clash) throw new Error(`optimistic_lock_conflict:profile_version=${profile.version}`);
    this.store.projectProfiles.push(profile);
    return profile;
  }

  async latestProjectProfile(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProjectProfile | undefined> {
    return latestAsOf(
      this.store.projectProfiles.filter(
        (row) =>
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId &&
          row.projectId === projectId,
      ),
    );
  }

  async nextProjectProfileVersion(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<number> {
    const latest = await this.latestProjectProfile(tenantId, workspaceId, projectId);
    return (latest?.version ?? 0) + 1;
  }

  async findIdempotency(
    tenantId: string,
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<IdempotencyRecord | null> {
    return (
      this.store.idempotency.find(
        (row) =>
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId &&
          row.idempotencyKey === idempotencyKey,
      ) ?? null
    );
  }

  async saveIdempotency(record: IdempotencyRecord): Promise<IdempotencyRecord> {
    this.store.idempotency.push(record);
    return record;
  }

  async enqueueOutbox(record: OutboxEventRecord): Promise<OutboxEventRecord> {
    this.store.outbox.push(record);
    return record;
  }

  async listOutbox(tenantId: string, workspaceId: string): Promise<OutboxEventRecord[]> {
    return this.store.outbox.filter(
      (row) => row.tenantId === tenantId && row.workspaceId === workspaceId,
    );
  }
}

export const PRODUCTION_MEMORY_REPOSITORY_ALLOWED = VERSION_MEMORY_LOCK;

export type RepositoryFactoryOptions = {
  adapter?: "memory" | "postgres";
  nodeEnv?: string;
  supabase?: unknown;
  memoryStore?: DurableProjectControlsStore;
};

export function assertProductionRepositorySafe(
  adapterKind: "memory" | "postgres",
  nodeEnv = process.env.NODE_ENV,
): void {
  if (nodeEnv === "production" && adapterKind === "memory") {
    throw new Error("production_memory_repository_forbidden");
  }
}
