import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../../..");

function read(rel: string): string {
  return readFileSync(resolve(root, rel), "utf8");
}

const AI = "packages/asset-intelligence/src";
const MIGRATION_59 =
  "supabase/migrations/20260807200000_batch_59_asset_intelligence_predictive_governance.sql";
const MODEL_DOC = "docs/architecture/ASSET_INTELLIGENCE_PREDICTIVE_GOVERNANCE_MODEL.md";
const GOVERNANCE_ROUTE =
  "apps/web/src/app/api/engineering/asset-intelligence/predictive-governance/route.ts";

describe("Phase 10J Asset Intelligence Predictive Governance architecture lock", () => {
  it("defines exactly 59 gates (A–BG)", () => {
    const gatesSource = read("packages/asset-intelligence-certification/src/phase10j/gates.ts");
    const ids = [...gatesSource.matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(59);
    expect(ids[0]).toBe("A");
    expect(ids[ids.length - 1]).toBe("BG");
    expect(new Set(ids).size).toBe(59);
  });

  it("exports predictive governance readiness and pins the Phase 10I baseline", () => {
    const version = read(`${AI}/version.ts`);
    expect(version).toMatch(/ASSET_INTELLIGENCE_VERSION = "0\.10\.0-predictive-governance"/);
    expect(version).toMatch(/ASSET_INTELLIGENCE_STATUS = "predictive_governance"/);
    expect(version).toMatch(/PREDICTIVE_OBJECTIVE_REGISTRY_READY = true/);
    expect(version).toMatch(/PREDICTIVE_METHOD_REGISTRY_READY = true/);
    expect(version).toMatch(/PREDICTIVE_METHOD_ELIGIBILITY_ENGINE_READY = true/);
    expect(version).toMatch(/PREDICTIVE_METHOD_QUALIFICATION_FRAMEWORK_READY = true/);
    expect(version).toMatch(/PREDICTIVE_VALIDATION_METRIC_REGISTRY_READY = true/);
    expect(version).toMatch(/ASSET_PREDICTIVE_GOVERNANCE_OWNERSHIP = "asset_intelligence"/);
    expect(version).toMatch(
      /PHASE_10I_CERTIFIED_COMMIT = "27fed4e975f015ff01b60a41dd76ab06ea2886a9"/,
    );
    expect(version).toMatch(/PHASE_10I_HOSTED_RUN = "31163563401"/);
  });

  it("keeps production predictive execution and every predictive claim disabled", () => {
    const version = read(`${AI}/version.ts`);
    expect(version).toMatch(/PRODUCTION_PREDICTIVE_EXECUTION_ENABLED = false/);
    expect(version).toMatch(/PREDICTIVE_ML_ENABLED = false/);
    expect(version).toMatch(/PREDICTIVE_METHODS_CERTIFIED = false/);
    expect(version).toMatch(/PROBABILITY_OF_FAILURE_CERTIFIED = false/);
    expect(version).toMatch(/RUL_CLAIMS_CERTIFIED = false/);
    expect(version).toMatch(/ACCURACY_CLAIMS_CERTIFIED = false/);
    expect(version).toMatch(/PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED = false/);
    expect(version).toMatch(/SOURCE_TRUST_MODEL_READY = false/);
    expect(version).toMatch(/PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/);
    expect(version).toMatch(/PRODUCTION_ASSET_INTELLIGENCE_READY = false/);

    const ownershipLock = read(`${AI}/architecture/ownership-lock.ts`);
    expect(ownershipLock).toMatch(/predictive_execution_forbidden_in_phase_10j/);
    expect(ownershipLock).toMatch(/predictive_governance_is_not_a_health_factor/);
  });

  it("keeps predictive governance out of Health Index composition", () => {
    const hc = read(`${AI}/domain/health-composer.ts`);
    expect(hc).toMatch(/PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED = false/);
    expect(hc).toMatch(/FUSION_HEALTH_CONTRIBUTION_ENABLED = false/);
    expect(hc).toMatch(/"compose_condition_reliability_v2"/);

    const governance = read(`${AI}/domain/predictive-governance.ts`);
    expect(governance).toMatch(/isHealthFactor: false/);
    expect(governance).toMatch(/containsPredictionOutput: false/);
  });

  it("registers objectives, methods and metrics without certifying any of them", () => {
    const objectives = read(`${AI}/domain/predictive-objectives.ts`);
    expect(objectives).toMatch(/PREDICTIVE_OBJECTIVE_REGISTRY/);
    expect(objectives).toMatch(/isPermanentlyNotReadyInPhase10J/);
    expect(objectives).toMatch(/probability_of_failure/);
    expect(objectives).toMatch(/remaining_useful_life/);
    expect(objectives).toMatch(/certified: false/);

    const methods = read(`${AI}/domain/predictive-methods.ts`);
    expect(methods).toMatch(/PREDICTIVE_METHOD_REGISTRY/);
    expect(methods).toMatch(/assertNoCertifiedMethods/);
    expect(methods).toMatch(/RESERVED_ML_GOVERNANCE/);
    expect(methods).toMatch(/methodClass: "physics_based"/);
    expect(methods).toMatch(/methodClass: "statistical"/);
    expect(methods).toMatch(/methodClass: "deterministic"/);
    expect(methods).toMatch(/methodClass: "hybrid"/);
    expect(methods).toMatch(/methodClass: "machine_learning"/);
    expect(methods).toMatch(/suspendedFromExecution: true/);

    const metrics = read(`${AI}/domain/predictive-validation-metrics.ts`);
    expect(metrics).toMatch(/VALIDATION_METRIC_REGISTRY/);
    expect(metrics).toMatch(/acceptanceThresholdDefined: false/);
    expect(metrics).toMatch(/certificationImplied: false/);
  });

  it("has the Phase 10J engines producing governance records only", () => {
    const objectiveReadiness = read(`${AI}/domain/predictive-readiness-objective.ts`);
    expect(objectiveReadiness).toMatch(/class ObjectivePredictiveReadinessAssessor/);
    expect(objectiveReadiness).toMatch(/assessObjective/);
    expect(objectiveReadiness).toMatch(/readiness_is_not_permission_to_predict/);

    const eligibility = read(`${AI}/domain/predictive-eligibility-engine.ts`);
    expect(eligibility).toMatch(/class PredictiveMethodEligibilityEngine/);
    expect(eligibility).toMatch(/executionAllowed: false/);
    expect(eligibility).toMatch(/containsPredictionOutput: false/);
    expect(eligibility).toMatch(/eligibility_is_not_permission_to_execute/);

    const qualification = read(`${AI}/domain/predictive-qualification.ts`);
    expect(qualification).toMatch(/createQualificationDraft/);
    expect(qualification).toMatch(/evaluateAgainstAcceptanceCriteria/);
    expect(qualification).toMatch(/qualificationGrantsExecution/);
    expect(qualification).toMatch(/qualification_does_not_grant_certification/);
  });

  it("governs predictive records through their own review workflow", () => {
    const workflow = read(`${AI}/domain/review-workflow.ts`);
    expect(workflow).toMatch(/asset_intelligence\.predictive_method_review/);
    expect(workflow).toMatch(/startPredictiveMethodReview/);
    expect(workflow).toMatch(/transitionPredictiveMethodReview/);
    expect(workflow).toMatch(/grantsProductionExecution: false/);

    const roleMatrix = read(`${AI}/domain/role-matrix.ts`);
    expect(roleMatrix).toMatch(/ENGINEER_SELF_APPROVE_FORBIDDEN = true/);
    for (const capability of [
      /"predictive_governance\.read"/,
      /"predictive_governance\.assess"/,
      /"predictive_governance\.submit"/,
      /"predictive_governance\.review"/,
      /"predictive_governance\.approve"/,
      /"predictive_governance\.publish"/,
    ]) {
      expect(roleMatrix).toMatch(capability);
    }

    const engine = read(`${AI}/domain/engine.ts`);
    expect(engine).toMatch(/async assessObjectivePredictiveReadiness/);
    expect(engine).toMatch(/async evaluateMethodEligibility/);
    expect(engine).toMatch(/async createMethodCandidate/);
    expect(engine).toMatch(/async startMethodQualification/);
    expect(engine).toMatch(/async reviewMethodQualification/);
    expect(engine).toMatch(/async assessPredictiveGovernanceBundle/);
    expect(engine).toMatch(/published_predictive_method_qualification_immutable/);
    expect(engine).toMatch(/segregation_of_duties_violation/);
    expect(engine).toMatch(/productionPredictiveExecutionEnabled: false/);
    expect(engine).toMatch(/containsPredictionOutput: false/);
    expect(engine).toMatch(/aiMayPublishForbidden: true/);
  });

  it("emits typed predictive governance events and timeline kinds", () => {
    const events = read(`${AI}/domain/events.ts`);
    for (const type of [
      /engineering\.asset\.predictive_objective_readiness\.assessed/,
      /engineering\.asset\.predictive_objective_readiness\.reviewed/,
      /engineering\.asset\.predictive_objective_readiness\.published/,
      /engineering\.asset\.predictive_objective_readiness\.superseded/,
      /engineering\.asset\.predictive_method_candidate\.proposed/,
      /engineering\.asset\.predictive_method_candidate\.reviewed/,
      /engineering\.asset\.predictive_method_qualification\.started/,
      /engineering\.asset\.predictive_method_qualification\.evaluated/,
      /engineering\.asset\.predictive_method_qualification\.qualified/,
      /engineering\.asset\.predictive_method_qualification\.rejected/,
    ]) {
      expect(events).toMatch(type);
    }

    const timeline = read(`${AI}/domain/timeline.ts`);
    expect(timeline).toMatch(/predictive_objective_readiness/);
    expect(timeline).toMatch(/predictive_objective_readiness_published/);
    expect(timeline).toMatch(/predictive_method_candidate/);
    expect(timeline).toMatch(/predictive_method_qualification/);
    expect(timeline).toMatch(/predictive_method_qualified/);
  });

  it("persists batch_59 state with concurrency and observability hooks", () => {
    const persistence = read(`${AI}/domain/persistence.ts`);
    expect(persistence).toMatch(/nextObjectivePredictiveReadinessVersion/);
    expect(persistence).toMatch(/nextPredictiveMethodCandidateVersion/);
    expect(persistence).toMatch(/nextPredictiveMethodQualificationVersion/);
    expect(persistence).toMatch(/savePredictiveReview/);
    expect(persistence).toMatch(/optimistic_lock_conflict/);

    const postgres = read(`${AI}/domain/postgres-repository.ts`);
    for (const table of [
      /asset_intelligence_predictive_objectives/,
      /asset_intelligence_objective_predictive_readiness/,
      /asset_intelligence_predictive_methods/,
      /asset_intelligence_predictive_method_candidates/,
      /asset_intelligence_predictive_method_qualifications/,
      /asset_intelligence_predictive_validation_metrics/,
      /asset_intelligence_predictive_reviews/,
    ]) {
      expect(postgres).toMatch(table);
    }

    const health = read(`${AI}/domain/persistence-health.ts`);
    expect(health).toMatch(/predictiveObjectiveStore/);
    expect(health).toMatch(/objectivePredictiveReadinessStore/);
    expect(health).toMatch(/predictiveMethodStore/);
    expect(health).toMatch(/predictiveMethodCandidateStore/);
    expect(health).toMatch(/predictiveMethodQualificationStore/);
    expect(health).toMatch(/predictiveValidationMetricStore/);
    expect(health).toMatch(/predictiveReviewStore/);
  });

  it("has docs, batch_59 migration, HTTP route, workflow, and cert runner", () => {
    for (const rel of [
      MODEL_DOC,
      MIGRATION_59,
      GOVERNANCE_ROUTE,
      ".github/workflows/phase-10j-asset-intelligence-predictive-governance.yml",
      "packages/asset-intelligence-certification/src/phase10j/gates.ts",
      "packages/asset-intelligence-certification/scripts/run-phase10j-certification.ts",
      "packages/asset-intelligence/tests/phase10j-predictive-governance.test.ts",
      `${AI}/domain/predictive-objectives.ts`,
      `${AI}/domain/predictive-methods.ts`,
      `${AI}/domain/predictive-validation-metrics.ts`,
      `${AI}/domain/predictive-governance.ts`,
      `${AI}/domain/predictive-readiness-objective.ts`,
      `${AI}/domain/predictive-eligibility-engine.ts`,
      `${AI}/domain/predictive-qualification.ts`,
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }

    const certRunner = read(
      "packages/asset-intelligence-certification/scripts/run-phase10j-certification.ts",
    );
    expect(certRunner).toMatch(/27fed4e975f015ff01b60a41dd76ab06ea2886a9/);
    expect(certRunner).toMatch(/31163563401/);
    expect(certRunner).toMatch(
      /20260807200000_batch_59_asset_intelligence_predictive_governance\.sql/,
    );
    expect(certRunner).toMatch(/phase10KReady/);
    expect(certRunner).toMatch(/assetIntelligenceGaReadiness/);
  });

  it("documents terminology, execution policy and the reserved boundaries", () => {
    const doc = read(MODEL_DOC);
    expect(doc).toMatch(/## Terminology \(locked\)/);
    expect(doc).toMatch(/## Production execution policy/);
    expect(doc).toMatch(/## Freshness policy/);
    expect(doc).toMatch(/## Reserved objectives — PoF and RUL/);
    expect(doc).toMatch(/## Source Trust \(reserved\)/);
    expect(doc).toMatch(/Predictive readiness ≠ permission to predict/);
    expect(doc).toMatch(/Method qualification ≠ certified predictive accuracy/);
    expect(doc).toMatch(
      /Asset Intelligence V1 remains releasable without PoF\/RUL\/ML certification/,
    );
  });

  it("locks batch_59 governance constraints in the migration", () => {
    const migration = read(MIGRATION_59);
    expect(migration).toMatch(/CHECK \(production_execution_enabled = false\)/);
    expect(migration).toMatch(/CHECK \(predictive_ml_enabled = false\)/);
    expect(migration).toMatch(/CHECK \(predictive_methods_certified = false\)/);
    expect(migration).toMatch(/CHECK \(certification_granted = false\)/);
    expect(migration).toMatch(/CHECK \(contains_prediction_output = false\)/);
    expect(migration).toMatch(/CHECK \(probability_of_failure_certified = false\)/);
    expect(migration).toMatch(/CHECK \(rul_claims_certified = false\)/);
    expect(migration).toMatch(/CHECK \(is_health_factor = false\)/);
    expect(migration).toMatch(/CHECK \(autonomous_execution_forbidden = true\)/);
    expect(migration).toMatch(/CHECK \(grants_production_execution = false\)/);
    expect(migration).toMatch(/CHECK \(grants_certification = false\)/);
    expect(migration).toMatch(/ai_objective_readiness_reserved_objectives_not_ready/);
    expect(migration).toMatch(/ai_predictive_candidates_reserved_objectives_ineligible/);
    expect(migration).toMatch(/ai_predictive_methods_ml_suspended/);
    expect(migration).toMatch(/ENABLE ROW LEVEL SECURITY/);
  });

  it("keeps the HTTP contract governed with a nested error envelope", () => {
    const route = read(GOVERNANCE_ROUTE);
    expect(route).toMatch(/error: \{ code, message, requestId, details \}/);
    expect(route).toMatch(/productionPredictiveExecutionEnabled: false/);
    expect(route).toMatch(/predictiveMlEnabled: false/);
    expect(route).toMatch(/predictiveMethodsCertified: false/);
    expect(route).toMatch(/probabilityOfFailureCertified: false/);
    expect(route).toMatch(/rulClaimsCertified: false/);
    expect(route).toMatch(/predictiveHealthContributionEnabled: false/);
    expect(route).toMatch(/containsPredictionOutput: false/);
    expect(route).toMatch(/aiMayPublishForbidden: true/);
  });
});
