export * from "./version";
export * from "./architecture/ownership-lock";
export * from "./architecture/identity-state";
export * from "./architecture/hierarchy";
export * from "./architecture/rul-governance";
export * from "./architecture/contract-drafts";
export * from "./domain/health-index";
export * from "./domain/health-composer";
export * from "./domain/health-profile";
export * from "./domain/evidence-sufficiency";
export * from "./domain/evidence-confidence";
export * from "./domain/criticality";
export * from "./domain/reliability";
export * from "./domain/failure";
export * from "./domain/failure-taxonomy";
export * from "./domain/failure-engine";
export * from "./domain/time-series";
export * from "./domain/trend-confidence";
export * from "./domain/change-detection";
export * from "./domain/degradation";
export * from "./domain/degradation-engine";
export * from "./domain/lifecycle-reference";
export * from "./domain/lifecycle";
export * from "./domain/lifecycle-taxonomy";
export * from "./domain/lifecycle-engine";
export * from "./domain/decision-context";
export * from "./domain/decision-context-engine";
export * from "./domain/risk";
export * from "./domain/risk-engine";
export * from "./domain/maintenance-taxonomy";
export * from "./domain/maintenance-recommendation";
export * from "./domain/priority";
export * from "./domain/fusion";
export * from "./domain/fusion-engine";
export * from "./domain/reconciliation-engine";
export * from "./domain/predictive-objectives";
export * from "./domain/predictive-validation-metrics";
export * from "./domain/predictive-governance";
export * from "./domain/predictive-readiness-objective";
export * from "./domain/predictive-eligibility-engine";
export * from "./domain/predictive-qualification";
export * from "./domain/role-matrix";
export * from "./domain/review-workflow";
export * from "./domain/snapshot";
export * from "./domain/source-registry";
export * from "./domain/timeline";
export * from "./domain/persistence";
export * from "./domain/postgres-repository";
export * from "./domain/repository-factory";
export * from "./domain/persistence-health";
export * from "./domain/events";
export * from "./domain/identity-port";
export * from "./domain/ii-consumption";
export * from "./domain/engine";
export * from "./domain/capabilities";
export * from "./domain/services";
// Phase 10K — frozen V1.0 module registries.
export * from "./domain/capability-registry";
export * from "./domain/service-registry";
export * from "./domain/event-contracts";
export * from "./domain/unavailable-capabilities";
export * from "./domain/module-manifest";
export * from "./domain/registry-drift";

// version.ts is the single authority for these locks; several domain modules
// re-declare them locally for gate visibility, so disambiguate the star exports.
export {
  DEGRADATION_HEALTH_CONTRIBUTION_ENABLED,
  LIFECYCLE_HEALTH_CONTRIBUTION_ENABLED,
  RISK_HEALTH_CONTRIBUTION_ENABLED,
  PRIORITY_HEALTH_CONTRIBUTION_ENABLED,
  FUSION_HEALTH_CONTRIBUTION_ENABLED,
  PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
} from "./version";

// Phase 10J — `predictive-methods` and `predictive-objectives` both name a
// method-class type; the method registry module owns the richer definitions, so
// export it explicitly with the objective-side type kept as the star export.
export {
  PREDICTIVE_METHOD_REGISTRY,
  PREDICTIVE_METHOD_CLASS_REGISTRY,
  PREDICTIVE_METHOD_IDS,
  QUALIFIABLE_METHOD_STATUSES,
  BLOCKED_METHOD_STATUSES,
  RESERVED_ML_GOVERNANCE,
  getPredictiveMethod,
  assertRegisteredMethod,
  getPredictiveMethodClass,
  listMethodsByClass,
  listMethodsForObjective,
  isMethodBlocked,
  assertNoCertifiedMethods,
  type PredictiveMethodStatus,
  type PredictiveMethodClassEntry,
  type PredictiveMlGovernance,
  type PredictiveMethodDefinition,
} from "./domain/predictive-methods";
