import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../../..");

function read(rel: string): string {
  return readFileSync(resolve(root, rel), "utf8");
}

const AI = "packages/asset-intelligence/src";
const MIGRATION_58 = "supabase/migrations/20260807190000_batch_58_asset_intelligence_fusion.sql";
const MODEL_DOC = "docs/architecture/ASSET_INTELLIGENCE_MULTI_SOURCE_FUSION_MODEL.md";

describe("Phase 10I Asset Intelligence Fusion architecture lock", () => {
  it("defines exactly 52 gates (A–AZ)", () => {
    const gatesSource = read(
      "packages/asset-intelligence-certification/src/phase10i/gates.ts",
    );
    const ids = [...gatesSource.matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(52);
    expect(ids[0]).toBe("A");
    expect(ids[ids.length - 1]).toBe("AZ");
    expect(new Set(ids).size).toBe(52);
  });

  it("exports fusion readiness and pins the authoritative Phase 10H baseline", () => {
    const version = read(`${AI}/version.ts`);
    expect(version).toMatch(
      /ASSET_INTELLIGENCE_VERSION = "(0\.9\.0-fusion-readiness|0\.10\.0-predictive-governance)"/,
    );
    expect(version).toMatch(/MULTI_SOURCE_FUSION_READY = true/);
    expect(version).toMatch(/SOURCE_RECONCILIATION_ENGINE_READY = true/);
    expect(version).toMatch(/PREDICTIVE_READINESS_ASSESSOR_READY = true/);
    expect(version).toMatch(/ASSET_FUSION_OWNERSHIP = "asset_intelligence"/);
    expect(version).toMatch(
      /PHASE_10H_CERTIFIED_COMMIT = "acec6ce63f9e6eb6968d0f899a61cf442c35ec90"/,
    );
    expect(version).toMatch(/PHASE_10H_HOSTED_RUN = "31158369645"/);
  });

  it("keeps predictive execution and PoF/RUL claims disabled", () => {
    const version = read(`${AI}/version.ts`);
    expect(version).toMatch(/PREDICTIVE_ML_ENABLED = false/);
    expect(version).toMatch(/PREDICTIVE_METHODS_CERTIFIED = false/);
    expect(version).toMatch(/PROBABILITY_OF_FAILURE_CERTIFIED = false/);
    expect(version).toMatch(/RUL_CLAIMS_CERTIFIED = false/);
    expect(version).toMatch(/ACCURACY_CLAIMS_CERTIFIED = false/);
    expect(version).toMatch(/PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/);
    expect(version).toMatch(/PRODUCTION_ASSET_INTELLIGENCE_READY = false/);

    const ownershipLock = read(`${AI}/architecture/ownership-lock.ts`);
    expect(ownershipLock).toMatch(/predictive_execution_forbidden_in_phase_10i/);
    expect(ownershipLock).toMatch(/multi_source_fusion/);
    expect(ownershipLock).toMatch(/source_reconciliation/);
    expect(ownershipLock).toMatch(/predictive_readiness/);
  });

  it("keeps fusion out of Health Index composition", () => {
    const version = read(`${AI}/version.ts`);
    expect(version).toMatch(/FUSION_HEALTH_CONTRIBUTION_ENABLED = false/);

    const hc = read(`${AI}/domain/health-composer.ts`);
    expect(hc).toMatch(/FUSION_HEALTH_CONTRIBUTION_ENABLED = false/);
    expect(hc).toMatch(/RISK_HEALTH_CONTRIBUTION_ENABLED = false/);
    expect(hc).toMatch(/PRIORITY_HEALTH_CONTRIBUTION_ENABLED = false/);
    expect(hc).toMatch(/"compose_condition_reliability_v2"/);

    const fusion = read(`${AI}/domain/fusion.ts`);
    expect(fusion).toMatch(/isHealthFactor: false/);
  });

  it("has the three Phase 10I engines with governed advisory states", () => {
    const fusion = read(`${AI}/domain/fusion.ts`);
    expect(fusion).toMatch(/AssetFusionState/);
    expect(fusion).toMatch(/SourceReconciliationRecord/);
    expect(fusion).toMatch(/PredictiveReadinessState/);
    expect(fusion).toMatch(/method: "multi_source_fusion_v1"/);
    expect(fusion).toMatch(/method: "source_reconciliation_v1"/);
    expect(fusion).toMatch(/method: "predictive_readiness_v1"/);
    expect(fusion).toMatch(/autonomousResolutionForbidden: true/);
    expect(fusion).toMatch(/predictiveMlExecuted: false/);
    expect(fusion).toMatch(/createsCoreRisk: false/);
    expect(fusion).toMatch(/createsWorkOrder: false/);
    expect(fusion).toMatch(/mutatesCanonicalLifecycle: false/);

    const fusionEngine = read(`${AI}/domain/fusion-engine.ts`);
    expect(fusionEngine).toMatch(/class MultiSourceFusionEngine/);
    expect(fusionEngine).toMatch(/publishedSlicePolicy: "published_or_approved_only"/);
    expect(fusionEngine).toMatch(/not_published:/);
    expect(fusionEngine).toMatch(/ii_contract_must_be_1\.0\.0/);

    const reconciliation = read(`${AI}/domain/reconciliation-engine.ts`);
    expect(reconciliation).toMatch(/class SourceReconciliationEngine/);
    expect(reconciliation).toMatch(/class PredictiveReadinessAssessor/);
    expect(reconciliation).toMatch(/require_human_review/);
    expect(reconciliation).toMatch(/autonomous_resolution_forbidden/);
    expect(reconciliation).toMatch(/predictiveAllowed: false/);
  });

  it("governs fusion and predictive readiness through review workflows", () => {
    const workflow = read(`${AI}/domain/review-workflow.ts`);
    expect(workflow).toMatch(/asset_intelligence\.fusion_review/);
    expect(workflow).toMatch(/asset_intelligence\.predictive_readiness_review/);

    const roleMatrix = read(`${AI}/domain/role-matrix.ts`);
    expect(roleMatrix).toMatch(/ENGINEER_SELF_APPROVE_FORBIDDEN = true/);
    expect(roleMatrix).toMatch(/"fusion\.assess"/);
    expect(roleMatrix).toMatch(/"fusion\.approve"/);
    expect(roleMatrix).toMatch(/"fusion\.publish"/);
    expect(roleMatrix).toMatch(/"predictive_readiness\.approve"/);
    expect(roleMatrix).toMatch(/"predictive_readiness\.publish"/);
    expect(roleMatrix).toMatch(/SELF_APPROVE_FORBIDDEN_CAPABILITIES/);

    const engine = read(`${AI}/domain/engine.ts`);
    expect(engine).toMatch(/async assessFusion/);
    expect(engine).toMatch(/async reviewFusion/);
    expect(engine).toMatch(/async assessPredictiveReadiness/);
    expect(engine).toMatch(/async reviewPredictiveReadiness/);
    expect(engine).toMatch(/async assessFusionBundle/);
    expect(engine).toMatch(/published_fusion_immutable/);
    expect(engine).toMatch(/published_predictive_readiness_immutable/);
    expect(engine).toMatch(/aiMayPublishForbidden: true/);
  });

  it("emits typed fusion events and timeline kinds", () => {
    const events = read(`${AI}/domain/events.ts`);
    for (const type of [
      /engineering\.asset\.fusion\.assessed/,
      /engineering\.asset\.fusion\.reviewed/,
      /engineering\.asset\.fusion\.published/,
      /engineering\.asset\.fusion\.superseded/,
      /engineering\.asset\.reconciliation\.recorded/,
      /engineering\.asset\.predictive_readiness\.assessed/,
      /engineering\.asset\.predictive_readiness\.reviewed/,
      /engineering\.asset\.predictive_readiness\.published/,
      /engineering\.asset\.predictive_readiness\.superseded/,
    ]) {
      expect(events).toMatch(type);
    }

    const timeline = read(`${AI}/domain/timeline.ts`);
    expect(timeline).toMatch(/fusion_state/);
    expect(timeline).toMatch(/fusion_review/);
    expect(timeline).toMatch(/fusion_published/);
    expect(timeline).toMatch(/reconciliation_record/);
    expect(timeline).toMatch(/predictive_readiness_published/);
  });

  it("persists fusion state with concurrency and observability hooks", () => {
    const persistence = read(`${AI}/domain/persistence.ts`);
    expect(persistence).toMatch(/nextFusionVersion/);
    expect(persistence).toMatch(/nextPredictiveReadinessVersion/);
    expect(persistence).toMatch(/saveReconciliationRecord/);
    expect(persistence).toMatch(/optimistic_lock_conflict/);

    const postgres = read(`${AI}/domain/postgres-repository.ts`);
    expect(postgres).toMatch(/asset_intelligence_fusion_states/);
    expect(postgres).toMatch(/asset_intelligence_fusion_reviews/);
    expect(postgres).toMatch(/asset_intelligence_reconciliation_records/);
    expect(postgres).toMatch(/asset_intelligence_predictive_readiness_states/);
    expect(postgres).toMatch(/asset_intelligence_predictive_readiness_reviews/);

    const health = read(`${AI}/domain/persistence-health.ts`);
    expect(health).toMatch(/fusionStore/);
    expect(health).toMatch(/reconciliationStore/);
    expect(health).toMatch(/predictiveReadinessStore/);
  });

  it("has docs, batch_58 migration, HTTP routes, workflow, and cert runner", () => {
    for (const rel of [
      MODEL_DOC,
      MIGRATION_58,
      ".github/workflows/phase-10i-asset-intelligence-fusion.yml",
      "packages/asset-intelligence-certification/src/phase10i/gates.ts",
      "packages/asset-intelligence-certification/scripts/run-phase10i-certification.ts",
      "packages/asset-intelligence/tests/phase10i-fusion.test.ts",
      "apps/web/src/app/api/engineering/asset-intelligence/fusion/route.ts",
      "apps/web/src/app/api/engineering/asset-intelligence/predictive-readiness/route.ts",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
  });

  it("documents the published-slice rule and the reconciliation boundary", () => {
    const doc = read(MODEL_DOC);
    expect(doc).toMatch(/## Published-slice rule/);
    expect(doc).toMatch(/## Autonomous resolution forbidden/);
    expect(doc).toMatch(/### Fusion vs Health/);
    expect(doc).toMatch(/does \*\*not\*\* execute predictive ML/);
    expect(doc).toMatch(/Do \*\*not\*\* collapse sources into one opaque score/);
  });

  it("locks batch_58 governance constraints in the migration", () => {
    const migration = read(MIGRATION_58);
    expect(migration).toMatch(/CHECK \(predictive_ml_enabled = false\)/);
    expect(migration).toMatch(/CHECK \(predictive_methods_certified = false\)/);
    expect(migration).toMatch(/CHECK \(predictive_ml_executed = false\)/);
    expect(migration).toMatch(/CHECK \(probability_of_failure_certified = false\)/);
    expect(migration).toMatch(/CHECK \(rul_claims_certified = false\)/);
    expect(migration).toMatch(/CHECK \(is_health_factor = false\)/);
    expect(migration).toMatch(/CHECK \(creates_core_risk = false\)/);
    expect(migration).toMatch(/CHECK \(creates_work_order = false\)/);
    expect(migration).toMatch(/CHECK \(mutates_canonical_lifecycle = false\)/);
    expect(migration).toMatch(/CHECK \(autonomous_resolution_forbidden = true\)/);
    expect(migration).toMatch(/ENABLE ROW LEVEL SECURITY/);
  });

  it("keeps HTTP contracts governed with a nested error envelope", () => {
    const fusionRoute = read(
      "apps/web/src/app/api/engineering/asset-intelligence/fusion/route.ts",
    );
    expect(fusionRoute).toMatch(/error: \{ code, message, requestId, details \}/);
    expect(fusionRoute).toMatch(/predictiveMlEnabled: false/);
    expect(fusionRoute).toMatch(/predictiveMethodsCertified: false/);
    expect(fusionRoute).toMatch(/fusionHealthContributionEnabled: false/);
    expect(fusionRoute).toMatch(/probabilityOfFailureCertified: false/);
    expect(fusionRoute).toMatch(/rulClaimsCertified: false/);
    expect(fusionRoute).toMatch(/autonomousReconciliationForbidden: true/);
    expect(fusionRoute).toMatch(/ii_contract_version_forbidden/);

    const readinessRoute = read(
      "apps/web/src/app/api/engineering/asset-intelligence/predictive-readiness/route.ts",
    );
    expect(readinessRoute).toMatch(/error: \{ code, message, requestId, details \}/);
    expect(readinessRoute).toMatch(/predictive_execution_forbidden/);
    expect(readinessRoute).toMatch(/predictiveMlEnabled: false/);
    expect(readinessRoute).toMatch(/predictiveMethodsCertified: false/);
    expect(readinessRoute).toMatch(/probabilityOfFailureCertified: false/);
    expect(readinessRoute).toMatch(/rulClaimsCertified: false/);
  });
});
