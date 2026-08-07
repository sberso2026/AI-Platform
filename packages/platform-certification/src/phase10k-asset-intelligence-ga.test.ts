import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../../..");

function read(rel: string): string {
  return readFileSync(resolve(root, rel), "utf8");
}

const AI = "packages/asset-intelligence/src";
const MANIFEST_JSON =
  "packages/asset-intelligence/manifest/asset-intelligence-module-manifest.json";
const UI_BASE = "apps/web/src/app/(platform)/engineering/apps/asset-intelligence";
const CERT = "packages/asset-intelligence-certification";

describe("Phase 10K Asset Intelligence V1.0 GA closure", () => {
  it("defines exactly 65 gates (A–BM)", () => {
    const gatesSource = read(`${CERT}/src/phase10k/gates.ts`);
    const ids = [...gatesSource.matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(65);
    expect(ids[0]).toBe("A");
    expect(ids[25]).toBe("Z");
    expect(ids[26]).toBe("AA");
    expect(ids[51]).toBe("AZ");
    expect(ids[52]).toBe("BA");
    expect(ids[ids.length - 1]).toBe("BM");
    expect(new Set(ids).size).toBe(65);
  });

  it("freezes version.ts at 1.0.0 GA and pins the Phase 10J baseline", () => {
    const version = read(`${AI}/version.ts`);
    expect(version).toMatch(/ASSET_INTELLIGENCE_VERSION = "1\.0\.0"/);
    expect(version).toMatch(/ASSET_INTELLIGENCE_STATUS = "ga"/);
    expect(version).toMatch(/ASSET_INTELLIGENCE_RELEASE_TAG = "asset-intelligence-v1\.0\.0"/);
    expect(version).toMatch(/ASSET_INTELLIGENCE_READINESS_MARKER = "asset-intelligence-v1-ready"/);
    expect(version).toMatch(/ASSET_INTELLIGENCE_V1_GA_CERTIFIED = true/);
    expect(version).toMatch(/ASSET_INTELLIGENCE_V1_FROZEN = true/);
    expect(version).toMatch(/PRODUCTION_ASSET_INTELLIGENCE_READY = true/);
    expect(version).toMatch(
      /ASSET_INTELLIGENCE_PREVIOUS_VERSION = "0\.10\.0-predictive-governance"/,
    );
    expect(version).toMatch(
      /PHASE_10J_CERTIFIED_COMMIT = "94ba3eccd5b42d9afbc96962bbf7572470485746"/,
    );
    expect(version).toMatch(/PHASE_10J_HOSTED_RUN = "31170793948"/);
  });

  it("keeps every predictive, PoF, RUL and health lock closed at GA", () => {
    const version = read(`${AI}/version.ts`);
    for (const lock of [
      /PRODUCTION_PREDICTIVE_EXECUTION_ENABLED = false/,
      /PREDICTIVE_ML_ENABLED = false/,
      /PREDICTIVE_METHODS_CERTIFIED = false/,
      /PROBABILITY_OF_FAILURE_CERTIFIED = false/,
      /RUL_CLAIMS_CERTIFIED = false/,
      /ACCURACY_CLAIMS_CERTIFIED = false/,
      /QUANTITATIVE_RELIABILITY_CERTIFIED = false/,
      /SOURCE_TRUST_MODEL_READY = false/,
      /CRITICALITY_IS_HEALTH_FACTOR = false/,
      /FAILURE_HEALTH_CONTRIBUTION_ENABLED = false/,
      /DEGRADATION_HEALTH_CONTRIBUTION_ENABLED = false/,
      /LIFECYCLE_HEALTH_CONTRIBUTION_ENABLED = false/,
      /RISK_HEALTH_CONTRIBUTION_ENABLED = false/,
      /PRIORITY_HEALTH_CONTRIBUTION_ENABLED = false/,
      /FUSION_HEALTH_CONTRIBUTION_ENABLED = false/,
      /PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED = false/,
      /RISK_CORE_AUTO_MUTATION_ALLOWED = false/,
      /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/,
    ]) {
      expect(version, String(lock)).toMatch(lock);
    }
  });

  it("aligns both package versions with the module version", () => {
    expect(read("packages/asset-intelligence/package.json")).toMatch(/"version": "1\.0\.0"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "1\.0\.0"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase10k/);
  });

  it("ships the frozen registries and the drift guard", () => {
    for (const rel of [
      `${AI}/domain/module-manifest.ts`,
      `${AI}/domain/capability-registry.ts`,
      `${AI}/domain/service-registry.ts`,
      `${AI}/domain/event-contracts.ts`,
      `${AI}/domain/unavailable-capabilities.ts`,
      `${AI}/domain/registry-drift.ts`,
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }

    expect(read(`${AI}/domain/registry-drift.ts`)).toMatch(
      /export function assertNoModuleRegistryDrift/,
    );
    expect(read(`${AI}/domain/module-manifest.ts`)).toMatch(
      /export function generateAssetIntelligenceModuleManifest/,
    );
    expect(read(`${AI}/domain/capability-registry.ts`)).toMatch(/"ga_advisory"/);
    expect(read(`${AI}/domain/capability-registry.ts`)).toMatch(/"unavailable"/);
    expect(read(`${AI}/domain/service-registry.ts`)).toMatch(/duplicateRuntimeForbidden: true/);
    expect(read(`${AI}/domain/event-contracts.ts`)).toMatch(/containsPredictionOutput: false/);

    const index = read(`${AI}/index.ts`);
    for (const module of [
      "capability-registry",
      "service-registry",
      "event-contracts",
      "unavailable-capabilities",
      "module-manifest",
      "registry-drift",
    ]) {
      expect(index, module).toContain(module);
    }
  });

  it("publishes the authoritative GA manifest snapshot", () => {
    const manifest = JSON.parse(read(MANIFEST_JSON)) as Record<string, unknown>;
    expect(manifest.schemaVersion).toBe("asset-intelligence-module-manifest/1");
    expect(manifest.version).toBe("1.0.0");
    expect(manifest.status).toBe("ga");
    expect(manifest.releaseTag).toBe("asset-intelligence-v1.0.0");
    expect(manifest.previousVersion).toBe("0.10.0-predictive-governance");
    expect((manifest.migrationLineage as string[]).length).toBe(6);
    expect((manifest.featureFlags as Record<string, boolean>).moduleRegistryDriftDetected).toBe(
      false,
    );
    expect(
      (manifest.featureFlags as Record<string, boolean>).productionPredictiveExecutionEnabled,
    ).toBe(false);

    for (const draft of [
      "packages/asset-intelligence/manifest/asset-intelligence-module-manifest.core.json",
      "packages/asset-intelligence/manifest/asset-intelligence-module-manifest.discovery.json",
    ]) {
      const superseded = JSON.parse(read(draft)) as Record<string, unknown>;
      expect(superseded.supersededBy).toBe("asset-intelligence-module-manifest.json");
    }
  });

  it("ships the GA release, contract, packaging and runbook documents", () => {
    for (const rel of [
      "docs/release/ASSET_INTELLIGENCE_V1_CAPABILITY_MATRIX.md",
      "docs/architecture/ASSET_INTELLIGENCE_V1_PUBLIC_CONTRACTS.md",
      "docs/commercial/ASSET_INTELLIGENCE_V1_PACKAGING.md",
      "docs/runbooks/ASSET_INTELLIGENCE_V1_OPERATIONS.md",
      "docs/runbooks/ASSET_INTELLIGENCE_V1_INCIDENT_RESPONSE.md",
      "docs/runbooks/ASSET_INTELLIGENCE_V1_RECOVERY.md",
      "docs/runbooks/ASSET_INTELLIGENCE_V1_ROLLBACK.md",
      "docs/release/ASSET_INTELLIGENCE_V1_PERFORMANCE_BASELINE.md",
      "docs/release/ASSET_INTELLIGENCE_V1_UNAVAILABLE_CAPABILITIES.md",
      "docs/release/ASSET_INTELLIGENCE_V1_LIMITATIONS.md",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }

    expect(read("docs/commercial/ASSET_INTELLIGENCE_V1_PACKAGING.md")).toMatch(
      /## Explicit commercial exclusions/,
    );
    expect(read("docs/release/ASSET_INTELLIGENCE_V1_PERFORMANCE_BASELINE.md")).toMatch(
      /not claimed/,
    );
    expect(read("docs/runbooks/ASSET_INTELLIGENCE_V1_RECOVERY.md")).toMatch(
      /## Restore procedure/,
    );
    expect(read("docs/runbooks/ASSET_INTELLIGENCE_V1_ROLLBACK.md")).toMatch(
      /immutable, never move it/,
    );
  });

  it("exposes the Engineering OS module page with the GA readiness marker", () => {
    for (const rel of [
      `${UI_BASE}/page.tsx`,
      `${UI_BASE}/layout.tsx`,
      `${UI_BASE}/release/page.tsx`,
      "apps/web/src/components/engineering/asset-intelligence-shell.tsx",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }

    const page = read(`${UI_BASE}/page.tsx`);
    expect(page).toMatch(/data-testid="asset-intelligence-v1-ready"/);
    expect(page).toMatch(/data-testid="asset-intelligence-ga-version"/);
    expect(page).toMatch(/data-testid="asset-intelligence-unavailable-capabilities"/);
    expect(page).toMatch(/Predictive execution/);
    expect(page).toMatch(/Probability of Failure \(PoF\)/);
    expect(page).toMatch(/Remaining Useful Life \(RUL\)/);
    expect(page).toMatch(/UNAVAILABLE/);

    expect(read(`${UI_BASE}/layout.tsx`)).toMatch(
      /ENGINEERING_PAGE_POLICIES\["\/engineering\/apps\/asset-intelligence"\]/,
    );
    expect(read("packages/platform-commerce/src/domain/commerce-access-policy.ts")).toMatch(
      /"\/engineering\/apps\/asset-intelligence"/,
    );
  });

  it("ships the browser gate, workflow and certification runner", () => {
    for (const rel of [
      `${CERT}/playwright.config.ts`,
      `${CERT}/playwright/v1-ga.spec.ts`,
      `${CERT}/src/phase10k/gates.ts`,
      `${CERT}/scripts/run-phase10k-certification.ts`,
      `${CERT}/scripts/generate-module-manifest.ts`,
      "packages/asset-intelligence/tests/phase10k-v1-ga.test.ts",
      ".github/workflows/phase-10k-asset-intelligence-ga.yml",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }

    const spec = read(`${CERT}/playwright/v1-ga.spec.ts`);
    expect(spec).toMatch(
      /process\.env\.CERTIFY_BROWSER === "1" \|\| process\.env\.GITHUB_ACTIONS === "true"/,
    );
    expect(spec).toMatch(/asset-intelligence-v1-ready/);
    expect(spec).toMatch(/width: 390, height: 844/);
    expect(spec).toMatch(/width: 768, height: 1024/);

    const workflow = read(".github/workflows/phase-10k-asset-intelligence-ga.yml");
    expect(workflow).toMatch(/CERTIFY_BROWSER: "1"/);
    expect(workflow).toMatch(/playwright install --with-deps chromium/);
    expect(workflow).toMatch(/certify:phase10k/);
    expect(workflow).toMatch(/requiredGates\.length===65/);
  });

  it("does not introduce a batch_60 migration or rewrite batches 55–59", () => {
    for (const rel of [
      "supabase/migrations/20260807160000_batch_55_asset_intelligence_timeseries.sql",
      "supabase/migrations/20260807161000_batch_55b_asset_intelligence_degradation_created_by.sql",
      "supabase/migrations/20260807170000_batch_56_asset_intelligence_lifecycle.sql",
      "supabase/migrations/20260807180000_batch_57_asset_intelligence_risk_priority.sql",
      "supabase/migrations/20260807190000_batch_58_asset_intelligence_fusion.sql",
      "supabase/migrations/20260807200000_batch_59_asset_intelligence_predictive_governance.sql",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
    expect(
      existsSync(
        resolve(root, "supabase/migrations/20260807210000_batch_60_asset_intelligence_ga.sql"),
      ),
    ).toBe(false);
  });

  it("declares the release tag consistently and defers tag creation to the release owner", () => {
    const runner = read(`${CERT}/scripts/run-phase10k-certification.ts`);
    expect(runner).toMatch(/PHASE_10K_RELEASE_TAG/);
    expect(runner).toMatch(/releaseTagDeclared/);
    expect(runner).toMatch(/tagToCreate/);
    expect(runner).toMatch(/94ba3eccd5b42d9afbc96962bbf7572470485746/);
    expect(runner).toMatch(/31170793948/);
    // The runner never creates a tag; the release owner does that after PASS.
    expect(runner).not.toMatch(/git tag/);

    expect(read(`${CERT}/src/phase10k/gates.ts`)).toMatch(
      /PHASE_10K_RELEASE_TAG = "asset-intelligence-v1\.0\.0"/,
    );
    expect(read(`${UI_BASE}/release/page.tsx`)).toMatch(/asset-intelligence-v1\.0\.0/);
  });
});
