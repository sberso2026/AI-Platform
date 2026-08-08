import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../../..");

function read(rel: string): string {
  return readFileSync(resolve(root, rel), "utf8");
}

const PC = "packages/project-controls/src";
const MANIFEST_JSON = "packages/project-controls/manifest/project-controls-module-manifest.json";
const UI_BASE = "apps/web/src/app/(platform)/engineering/apps/project-controls";
const CERT = "packages/project-controls-certification";

describe("Phase 11N Project Controls V1.0 GA closure", () => {
  it("defines exactly 65 gates (A–BM)", () => {
    const gatesSource = read(`${CERT}/src/phase11n/gates.ts`);
    const ids = [...gatesSource.matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(65);
    expect(ids[ids.length - 1]).toBe("BM");
    expect(new Set(ids).size).toBe(65);
  });

  it("freezes version.ts at 1.0.0 GA and pins the Phase 11M baseline", () => {
    const version = read(`${PC}/version.ts`);
    expect(version).toMatch(/PROJECT_CONTROLS_VERSION = "1\.0\.0"/);
    expect(version).toMatch(/PROJECT_CONTROLS_STATUS = "ga"/);
    expect(version).toMatch(/PROJECT_CONTROLS_RELEASE_TAG = "project-controls-v1\.0\.0"/);
    expect(version).toMatch(/PROJECT_CONTROLS_READINESS_MARKER = "project-controls-v1-ready"/);
    expect(version).toMatch(/PROJECT_CONTROLS_V1_GA_CERTIFIED = true/);
    expect(version).toMatch(/PROJECT_CONTROLS_V1_FROZEN = true/);
    expect(version).toMatch(/PRODUCTION_PROJECT_CONTROLS_READY = true/);
    expect(version).toMatch(
      /PROJECT_CONTROLS_PREVIOUS_VERSION = "0\.13\.0-organizational-learning"/,
    );
    expect(version).toMatch(
      /PHASE_11M_CERTIFIED_COMMIT =\s*\r?\n?\s*"c115329127266022a6233481671b77dee15ae1d7"/,
    );
    expect(version).toMatch(/PHASE_11M_HOSTED_RUN = "31250607668"/);
  });

  it("keeps forbidden locks closed at GA", () => {
    const version = read(`${PC}/version.ts`);
    for (const lock of [
      /CPM_SCHEDULING_IMPLEMENTED = false/,
      /EARNED_VALUE_IMPLEMENTED = false/,
      /FINANCIAL_POSTING_IMPLEMENTED = false/,
      /SCHEDULE_EXECUTION_IMPLEMENTED = false/,
      /RESOURCE_LEVELING_IMPLEMENTED = false/,
      /AUTOMATIC_DECISION_EXECUTION_ENABLED = false/,
      /AUTOMATIC_LEARNING_APPROVAL_ENABLED = false/,
      /AUTOMATIC_KNOWLEDGE_MUTATION_ENABLED = false/,
      /AUTOMATIC_CONTRACT_INSTRUCTION_ENABLED = false/,
      /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/,
      /DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false/,
    ]) {
      expect(version, String(lock)).toMatch(lock);
    }
  });

  it("aligns both package versions with the module version", () => {
    expect(read("packages/project-controls/package.json")).toMatch(/"version": "1\.0\.0"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "1\.0\.0"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase11n/);
  });

  it("ships frozen registries and drift guard", () => {
    for (const rel of [
      `${PC}/domain/module-manifest.ts`,
      `${PC}/domain/capability-registry.ts`,
      `${PC}/domain/service-registry.ts`,
      `${PC}/domain/event-contracts.ts`,
      `${PC}/domain/public-contracts.ts`,
      `${PC}/domain/unavailable-capabilities.ts`,
      `${PC}/domain/registry-drift.ts`,
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
  });

  it("publishes authoritative GA manifest snapshot", () => {
    const manifest = JSON.parse(read(MANIFEST_JSON)) as Record<string, unknown>;
    expect(manifest.schemaVersion).toBe("project-controls-module-manifest/1");
    expect(manifest.version).toBe("1.0.0");
    expect(manifest.status).toBe("ga");
    expect(manifest.releaseTag).toBe("project-controls-v1.0.0");
    expect((manifest.migrationLineage as string[]).length).toBe(13);
    expect((manifest.featureFlags as Record<string, boolean>).moduleRegistryDriftDetected).toBe(
      false,
    );
  });

  it("ships GA docs and runbooks", () => {
    for (const rel of [
      "docs/release/PROJECT_CONTROLS_V1_CAPABILITY_MATRIX.md",
      "docs/architecture/PROJECT_CONTROLS_V1_PUBLIC_CONTRACTS.md",
      "docs/commercial/PROJECT_CONTROLS_V1_PACKAGING.md",
      "docs/runbooks/PROJECT_CONTROLS_V1_OPERATIONS.md",
      "docs/runbooks/PROJECT_CONTROLS_V1_INCIDENT_RESPONSE.md",
      "docs/runbooks/PROJECT_CONTROLS_V1_RECOVERY.md",
      "docs/runbooks/PROJECT_CONTROLS_V1_ROLLBACK.md",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
  });

  it("exposes Engineering OS module page with GA readiness marker", () => {
    const page = read(`${UI_BASE}/page.tsx`);
    expect(page).toMatch(/data-testid="project-controls-v1-ready"/);
    expect(page).toMatch(/data-testid="project-controls-ga-version"/);
    expect(read(`${UI_BASE}/layout.tsx`)).toMatch(
      /ENGINEERING_PAGE_POLICIES\["\/engineering\/apps\/project-controls"\]/,
    );
    expect(read("packages/platform-commerce/src/domain/commerce-access-policy.ts")).toMatch(
      /"\/engineering\/apps\/project-controls"/,
    );
  });

  it("does not create batch_74 migration", () => {
    expect(
      existsSync(
        resolve(root, "supabase/migrations/20260808140000_batch_74_project_controls_ga.sql"),
      ),
    ).toBe(false);
  });

  it("ships browser gate, workflow and certification runner", () => {
    for (const rel of [
      `${CERT}/playwright/v1-ga.spec.ts`,
      `${CERT}/src/phase11n/gates.ts`,
      `${CERT}/scripts/run-phase11n-certification.ts`,
      "packages/project-controls/tests/phase11n-v1-ga.test.ts",
      ".github/workflows/phase-11n-project-controls-ga.yml",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
  });
});
