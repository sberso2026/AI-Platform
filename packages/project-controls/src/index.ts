export * from "./version";
export * from "./architecture/ownership-lock";
export * from "./domain/reserved-providers";
export * from "./domain/progress";
export * from "./domain/progress-confidence";
export * from "./domain/progress-engine";
export * from "./domain/schedule";
export * from "./domain/schedule-confidence";
export * from "./domain/schedule-engine";
export * from "./domain/change";
export * from "./domain/change-confidence";
export * from "./domain/change-engine";
export * from "./domain/cost";
export * from "./domain/cost-confidence";
export {
  CostIntelligenceEngine,
  createCostIntelligenceEngine,
  assertNoEarnedValue as assertNoEarnedValueInCostIntelligence,
  assertNoFinancialPosting,
  assertNoForecastEngine,
} from "./domain/cost-engine";
export * from "./domain/productivity";
export * from "./domain/productivity-confidence";
export {
  ProductivityIntelligenceEngine,
  createProductivityIntelligenceEngine,
  assertNoWorkforceManagement,
  assertNoLabourProductivityMetrics,
  assertNoForecastOrEarnedValue as   assertNoForecastOrEarnedValueInProductivityIntelligence,
} from "./domain/productivity-engine";
export * from "./domain/forecast";
export * from "./domain/forecast-confidence";
export {
  ForecastIntelligenceEngine,
  createForecastIntelligenceEngine,
  assertNoPredictiveScheduling,
  assertNoEarnedValueOrCpm,
  assertAdvisoryOnly as assertForecastAdvisoryOnly,
} from "./domain/forecast-engine";
export * from "./domain/decision";
export * from "./domain/decision-confidence";
export {
  DecisionSupportEngine,
  createDecisionSupportEngine,
  assertNoAutoExecution as assertNoAutoExecutionInDecisionSupport,
  assertNoEarnedValueOrCpm as assertNoEarnedValueOrCpmInDecisionSupport,
  assertAdvisoryOnly as assertDecisionAdvisoryOnly,
} from "./domain/decision-engine";
export * from "./domain/scenario";
export * from "./domain/scenario-confidence";
export {
  ProjectControlsScenarioIntelligenceEngine,
  ScenarioIntelligenceEngine,
  createScenarioIntelligenceEngine,
  assertNoAutoExecution,
  assertNoEarnedValueOrCpm as assertNoEarnedValueOrCpmInScenarioIntelligence,
  assertAdvisoryOnly as assertScenarioAdvisoryOnly,
} from "./domain/scenario-engine";
export * from "./domain/risk-opportunity";
export * from "./domain/risk-opportunity-confidence";
export {
  ProjectControlsRiskOpportunityIntelligenceEngine,
  RiskOpportunityIntelligenceEngine,
  createRiskOpportunityIntelligenceEngine,
  assertNoRegisterMutation,
  assertNoTreatmentExecution,
  assertNoEarnedValueOrCpm as assertNoEarnedValueOrCpmInRiskOpportunityIntelligence,
  assertAdvisoryOnly as assertRiskOpportunityAdvisoryOnly,
} from "./domain/risk-opportunity-engine";
export * from "./domain/project-context-composition";
export * from "./domain/baseline-provider";
export * from "./domain/project-context-engine";
export * from "./domain/review-workflow";
export * from "./domain/events";
export * from "./domain/role-matrix";
// `persistence` re-declares PRODUCTION_MEMORY_REPOSITORY_ALLOWED from `version`
// so repository code can import it locally; `version` stays authoritative.
export {
  MemoryProjectControlsRepository,
  assertProductionRepositorySafe,
  createDurableProjectControlsMemoryStore,
  type DurableProjectControlsStore,
  type IdempotencyRecord,
  type OutboxEventRecord,
  type PersistedProgressAssessment,
  type PersistedProgressEvidence,
  type PersistedProgressReview,
  type PersistedProgressSnapshot,
  type PersistedProgressTimelineEvent,
  type PersistedScheduleAssessment,
  type PersistedScheduleEvidence,
  type PersistedScheduleReview,
  type PersistedScheduleSnapshot,
  type PersistedScheduleTimelineEvent,
  type PersistedChangeState,
  type PersistedChangeEvidence,
  type PersistedChangeReview,
  type PersistedChangeConfidence,
  type PersistedChangeCandidate,
  type PersistedCostState,
  type PersistedCostEvidence,
  type PersistedCostReview,
  type PersistedCostConfidence,
  type PersistedProductivityState,
  type PersistedProductivityEvidence,
  type PersistedProductivityReview,
  type PersistedProductivityConfidence,
  type PersistedForecastState,
  type PersistedForecastEvidence,
  type PersistedForecastReview,
  type PersistedForecastConfidence,
  type PersistedDecisionState,
  type PersistedDecisionEvidence,
  type PersistedDecisionReview,
  type PersistedDecisionConfidence,
  type PersistedScenarioState,
  type PersistedScenarioEvidence,
  type PersistedScenarioReview,
  type PersistedScenarioConfidence,
  type PersistedRiskOpportunityState,
  type PersistedRiskOpportunityEvidence,
  type PersistedRiskOpportunityReview,
  type PersistedRiskOpportunityConfidence,
  type PersistedProjectSnapshot,
  type PersistedProjectTimelineEvent,
  type PersistedProjectProfile,
  type ProjectControlsRepositoryPort,
  type RepositoryFactoryOptions,
} from "./domain/persistence";
export * from "./domain/postgres-repository";
export { createProjectControlsRepository } from "./domain/repository-factory";
export * from "./domain/engine";
export * from "./domain/services";
