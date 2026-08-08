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
