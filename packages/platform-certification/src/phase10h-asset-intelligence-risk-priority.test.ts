import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../../..");

describe("Phase 10H Asset Intelligence Risk/Priority architecture lock", () => {
  it("defines exactly 59 gates (A–BG)", () => {
    const gatesSource = readFileSync(
      resolve(root, "packages/asset-intelligence-certification/src/phase10h/gates.ts"),
      "utf8",
    );
    const ids = [...gatesSource.matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(59);
    expect(ids[0]).toBe("A");
    expect(ids[ids.length - 1]).toBe("BG");
    expect(new Set(ids).size).toBe(59);
  });

  it("exports risk/recommendation/priority readiness and pins the Phase 10G baseline", () => {
    const version = readFileSync(
      resolve(root, "packages/asset-intelligence/src/version.ts"),
      "utf8",
    );
    expect(version).toMatch(
      /ASSET_INTELLIGENCE_VERSION = "(0\.8\.0-risk-priority|0\.9\.0-fusion-readiness|0\.10\.0-predictive-governance|1\.0\.0)"/,
    );
    expect(version).toMatch(/ASSET_DECISION_CONTEXT_ENGINE_READY = true/);
    expect(version).toMatch(/RISK_SIGNAL_ENGINE_READY = true/);
    expect(version).toMatch(/MAINTENANCE_RECOMMENDATION_ENGINE_READY = true/);
    expect(version).toMatch(/MAINTENANCE_RECOMMENDATION_TAXONOMY_READY = true/);
    expect(version).toMatch(/ASSET_PRIORITY_ENGINE_READY = true/);
    expect(version).toMatch(/RISK_HEALTH_CONTRIBUTION_ENABLED = false/);
    expect(version).toMatch(/PRIORITY_HEALTH_CONTRIBUTION_ENABLED = false/);
    expect(version).toMatch(/RISK_CORE_AUTO_MUTATION_ALLOWED = false/);
    expect(version).toMatch(/NUMERIC_PRIORITY_SCORE_REQUIRED = false/);
    expect(version).toMatch(/PREDICTIVE_ML_ENABLED = false/);
    expect(version).toMatch(/PREDICTIVE_METHODS_CERTIFIED = false/);
    expect(version).toMatch(
      /CANONICAL_ENGINEERING_RISK_OWNERSHIP = "engineering_core"/,
    );
    expect(version).toMatch(/CMMS_WORK_ORDER_OWNERSHIP = "none_in_asset_intelligence"/);
    expect(version).toMatch(/PROBABILITY_OF_FAILURE_CERTIFIED = false/);
    expect(version).toMatch(/RUL_CLAIMS_CERTIFIED = false/);
    expect(version).toMatch(/ACCURACY_CLAIMS_CERTIFIED = false/);
    expect(version).toMatch(/PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/);
    expect(version).toMatch(/PRODUCTION_ASSET_INTELLIGENCE_READY = (true|false)/);
    expect(version).toMatch(
      /PHASE_10G_CERTIFIED_COMMIT = "f81d6ef1e322b49b823b04fc0464c5272c850e82"/,
    );
    expect(version).toMatch(/PHASE_10G_HOSTED_RUN = "31153833355"/);
  });

  it("keeps risk and priority out of Health Index composition", () => {
    const hc = readFileSync(
      resolve(root, "packages/asset-intelligence/src/domain/health-composer.ts"),
      "utf8",
    );
    expect(hc).toMatch(/RISK_HEALTH_CONTRIBUTION_ENABLED = false/);
    expect(hc).toMatch(/PRIORITY_HEALTH_CONTRIBUTION_ENABLED = false/);
  });

  it("has the four Phase 10H engines with governed advisory states", () => {
    const decisionContext = readFileSync(
      resolve(root, "packages/asset-intelligence/src/domain/decision-context.ts"),
      "utf8",
    );
    expect(decisionContext).toMatch(/autonomousDecisionAuthority: false/);
    expect(decisionContext).toMatch(/createsCoreRisk: false/);
    expect(decisionContext).toMatch(/createsWorkOrder: false/);

    const decisionEngine = readFileSync(
      resolve(root, "packages/asset-intelligence/src/domain/decision-context-engine.ts"),
      "utf8",
    );
    expect(decisionEngine).toMatch(/class AssetDecisionContextEngine/);
    expect(decisionEngine).toMatch(/not_published:/);

    const risk = readFileSync(
      resolve(root, "packages/asset-intelligence/src/domain/risk.ts"),
      "utf8",
    );
    expect(risk).toMatch(/AssetRiskSignalState/);
    expect(risk).toMatch(/AssetRiskCandidate/);
    expect(risk).toMatch(/autoMutatesCoreRisk: false/);
    expect(risk).toMatch(/requiresHumanGatedAdapter: true/);
    expect(risk).toMatch(/isHealthFactor: false/);

    const riskEngine = readFileSync(
      resolve(root, "packages/asset-intelligence/src/domain/risk-engine.ts"),
      "utf8",
    );
    expect(riskEngine).toMatch(/class RiskSignalEngine/);
    expect(riskEngine).toMatch(/canonicalEngineeringRiskOwnership: "engineering_core"/);

    const recommendation = readFileSync(
      resolve(root, "packages/asset-intelligence/src/domain/maintenance-recommendation.ts"),
      "utf8",
    );
    expect(recommendation).toMatch(/class MaintenanceRecommendationEngine/);
    expect(recommendation).toMatch(/createsWorkOrder: false/);
    expect(recommendation).toMatch(/calculatesRul: false/);

    const taxonomy = readFileSync(
      resolve(root, "packages/asset-intelligence/src/domain/maintenance-taxonomy.ts"),
      "utf8",
    );
    expect(taxonomy).toMatch(/class MaintenanceRecommendationTaxonomyRegistry/);
    expect(taxonomy).toMatch(/pack_must_not_redefine_shared_recommendation_code/);

    const priority = readFileSync(
      resolve(root, "packages/asset-intelligence/src/domain/priority.ts"),
      "utf8",
    );
    expect(priority).toMatch(/class AssetPriorityContextEngine/);
    expect(priority).toMatch(/dimensionStates/);
    expect(priority).toMatch(/numericPriorityScoreRequired: false/);
    expect(priority).toMatch(/impliesPoF: false/);
  });

  it("governs risk, recommendation, and priority through review workflows", () => {
    const workflow = readFileSync(
      resolve(root, "packages/asset-intelligence/src/domain/review-workflow.ts"),
      "utf8",
    );
    expect(workflow).toMatch(/asset_intelligence\.risk_review/);
    expect(workflow).toMatch(/asset_intelligence\.maintenance_recommendation_review/);
    expect(workflow).toMatch(/asset_intelligence\.priority_review/);

    const roleMatrix = readFileSync(
      resolve(root, "packages/asset-intelligence/src/domain/role-matrix.ts"),
      "utf8",
    );
    expect(roleMatrix).toMatch(/ENGINEER_SELF_APPROVE_FORBIDDEN = true/);
    expect(roleMatrix).toMatch(/"risk\.assess"/);
    expect(roleMatrix).toMatch(/"maintenance_recommendation\.approve"/);
    expect(roleMatrix).toMatch(/"priority\.publish"/);
    expect(roleMatrix).toMatch(/SELF_APPROVE_FORBIDDEN_CAPABILITIES/);
  });

  it("has docs, batch_57 migration, HTTP routes, workflow, and cert runner", () => {
    for (const rel of [
      "docs/architecture/ASSET_INTELLIGENCE_RISK_MAINTENANCE_PRIORITY_MODEL.md",
      "docs/architecture/ASSET_INTELLIGENCE_CROSS_MODULE_CONTRACT_DRAFTS_10H.md",
      "supabase/migrations/20260807180000_batch_57_asset_intelligence_risk_priority.sql",
      ".github/workflows/phase-10h-asset-intelligence-risk-priority.yml",
      "packages/asset-intelligence-certification/scripts/run-phase10h-certification.ts",
      "apps/web/src/app/api/engineering/asset-intelligence/decision-context/route.ts",
      "apps/web/src/app/api/engineering/asset-intelligence/risk/route.ts",
      "apps/web/src/app/api/engineering/asset-intelligence/maintenance-recommendation/route.ts",
      "apps/web/src/app/api/engineering/asset-intelligence/priority/route.ts",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
  });

  it("locks batch_57 governance constraints in the migration", () => {
    const migration = readFileSync(
      resolve(
        root,
        "supabase/migrations/20260807180000_batch_57_asset_intelligence_risk_priority.sql",
      ),
      "utf8",
    );
    expect(migration).toMatch(/CHECK \(creates_core_risk = false\)/);
    expect(migration).toMatch(/CHECK \(creates_work_order = false\)/);
    expect(migration).toMatch(/CHECK \(auto_mutates_core_risk = false\)/);
    expect(migration).toMatch(/CHECK \(requires_human_gated_adapter = true\)/);
    expect(migration).toMatch(/CHECK \(probability_of_failure_certified = false\)/);
    expect(migration).toMatch(/CHECK \(implies_pof = false\)/);
    expect(migration).toMatch(/CHECK \(mutates_canonical_lifecycle = false\)/);
  });
});
