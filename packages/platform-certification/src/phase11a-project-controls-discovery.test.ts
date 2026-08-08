import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../../..");

function read(rel: string): string {
  return readFileSync(resolve(root, rel), "utf8");
}
function present(rel: string): boolean {
  return existsSync(resolve(root, rel));
}

const PC = "packages/project-controls";
const CERT = "packages/project-controls-certification";
const VERSION = `${PC}/src/version.ts`;
const OWNERSHIP_LOCK = `${PC}/src/architecture/ownership-lock.ts`;
const GATES = `${CERT}/src/phase11a/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase11a-certification.ts`;
const WORKFLOW = ".github/workflows/phase-11a-project-controls-discovery.yml";

const ASSET_INTELLIGENCE_V1_COMMIT = "925e2ed74025cac6a145c346c17c53320efb8757";

describe("Phase 11A Project Controls discovery", () => {
  it("defines exactly 31 gates (A–AE)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(31);
    expect(ids[0]).toBe("A");
    expect(ids[25]).toBe("Z");
    expect(ids[26]).toBe("AA");
    expect(ids[ids.length - 1]).toBe("AE");
    expect(new Set(ids).size).toBe(31);
  });

  it("declares the discovery version and status", () => {
    const version = read(VERSION);
    expect(version).toMatch(/PROJECT_CONTROLS_PRODUCT_NAME = "Project Controls"/);
    expect(version).toMatch(/PROJECT_CONTROLS_MODULE_KEY = "project_controls"/);
    expect(version).toMatch(/PROJECT_CONTROLS_VERSION = "0\.1\.0-discovery"/);
    expect(version).toMatch(/PROJECT_CONTROLS_STATUS = "discovery"/);
    expect(version).toMatch(/PROJECT_CONTROLS_PHASE = "11A"/);
    expect(read(`${PC}/package.json`)).toMatch(/"version": "0\.1\.0-discovery"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "0\.1\.0-discovery"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase11a/);
  });

  it("keeps every Project Controls product lock closed", () => {
    const version = read(VERSION);
    for (const lock of [
      /PROJECT_CONTROLS_IMPLEMENTED = false/,
      /PRODUCTION_PROJECT_CONTROLS_READY = true/,
      /EARNED_VALUE_IMPLEMENTED = false/,
      /CPM_SCHEDULING_IMPLEMENTED = false/,
      /COST_ENGINE_IMPLEMENTED = false/,
      /SCHEDULE_EXECUTION_IMPLEMENTED = false/,
      /BUDGET_LEDGER_IMPLEMENTED = false/,
      /WORK_PACKAGING_UI_IMPLEMENTED = false/,
      /PROGRESS_MEASUREMENT_IMPLEMENTED = false/,
      /CHANGE_CONTROL_IMPLEMENTED = false/,
      /CONTINGENCY_MANAGEMENT_IMPLEMENTED = false/,
      /FORECASTING_IMPLEMENTED = false/,
      /PROJECT_CONTROLS_PRODUCT_TABLES_INTRODUCED = false/,
      /PROJECT_CONTROLS_PRODUCT_UI_IMPLEMENTED = false/,
      /DUPLICATE_ASSET_OWNERSHIP_INTRODUCED = false/,
      /DUPLICATE_PROJECT_OWNERSHIP_INTRODUCED = false/,
      /CANONICAL_LIFECYCLE_MUTATION_ALLOWED = false/,
      /RISK_CORE_AUTO_MUTATION_ALLOWED = false/,
      /CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS = false/,
    ]) {
      expect(version, String(lock)).toMatch(lock);
    }
    expect(version).toMatch(/PROJECT_CONTROLS_DISCOVERY_IMPLEMENTED = true/);
  });

  it("locks ownership without claiming canonical project identity", () => {
    const version = read(VERSION);
    expect(version).toMatch(/PROJECT_CONTROLS_OWNERSHIP = "project_controls"/);
    expect(version).toMatch(/PROJECT_IDENTITY_OWNERSHIP = "engineering_core"/);
    expect(version).toMatch(
      /CANONICAL_ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain"/,
    );
    expect(version).toMatch(
      /CANONICAL_ASSET_LIFECYCLE_OWNERSHIP = "engineering_os_shared_domain"/,
    );
    expect(version).toMatch(/CANONICAL_ENGINEERING_RISK_OWNERSHIP = "engineering_core"/);
    expect(version).toMatch(/FINANCIAL_LEDGER_OWNERSHIP = "platform_commerce_finance"/);
    expect(version).toMatch(/CMMS_WORK_ORDER_OWNERSHIP = "none_in_project_controls"/);

    const lock = read(OWNERSHIP_LOCK);
    expect(lock).toMatch(/export function assertOwnershipLock/);
    expect(lock).toMatch(/PROJECT_CONTROLS_OWNERSHIP_MATRIX/);
    expect(lock).toMatch(/project_controls_may_not_claim_canonical_project_identity/);
    expect(lock).toMatch(/project_controls_may_not_own_asset_identity/);
    expect(lock).toMatch(/project_controls_product_forbidden_in_phase_11a/);
    expect(lock).toMatch(/project_controls_engines_forbidden_in_phase_11a/);
    expect(lock).toMatch(/canonical_lifecycle_mutation_forbidden/);
    expect(lock).toMatch(/core_risk_auto_mutation_forbidden/);
  });

  it("contains no product engines, services or migrations in the discovery package", () => {
    for (const rel of [
      `${PC}/src/domain`,
      `${PC}/src/services`,
      `${PC}/src/engines`,
      `${PC}/src/api`,
      `${PC}/manifest`,
      `${PC}/migrations`,
    ]) {
      expect(present(rel), rel).toBe(false);
    }
    const index = read(`${PC}/src/index.ts`);
    expect(index).toMatch(/\.\/version/);
    expect(index).toMatch(/\.\/architecture\/ownership-lock/);
    expect(index.split("\n").filter((line) => line.trim().length > 0).length).toBe(2);
  });

  it("ships no Project Controls product UI or API surface", () => {
    for (const rel of [
      "apps/web/src/app/(platform)/engineering/apps/project-controls",
      "apps/web/src/app/api/engineering/project-controls",
      "apps/web/src/components/engineering/project-controls-shell.tsx",
    ]) {
      expect(present(rel), rel).toBe(false);
    }
  });

  it("leaves the Engineering OS module registry entry at coming_soon", () => {
    const registry = read("packages/engineering-os/src/module-registry.ts");
    const start = registry.indexOf('id: "project_controls"');
    expect(start).toBeGreaterThan(-1);
    const entry = registry.slice(start, registry.indexOf("\n  {", start));
    expect(entry).toMatch(/status: "coming_soon"/);
    expect(entry).toMatch(/enabled: false/);
    expect(entry).toMatch(/version: "0\.0\.0"/);
  });

  it("keeps the commerce footprint entitlement-only", () => {
    const policy = read("packages/platform-commerce/src/domain/commerce-access-policy.ts");
    expect(policy).toMatch(/"actions\.read": \{[^}]*applicationKey: "project_controls"/);
    expect(policy).toMatch(/"\/engineering\/project-controls": \{[^}]*applicationKey: "project_controls"/);
    expect(policy).not.toMatch(/"\/engineering\/apps\/project-controls"/);
    expect(policy).not.toMatch(/project_controls\.(cost|schedule|earned_value|progress|change)/);
    expect(read("packages/platform-commerce/src/domain/engineering-service-policies.ts")).toMatch(
      /"action\.list": \{[^}]*applicationKey: "project_controls"/,
    );
  });

  it("ships the five discovery documents", () => {
    for (const rel of [
      "docs/architecture/PROJECT_CONTROLS_PHASE_11A_EXISTING_FOOTPRINT.md",
      "docs/architecture/PROJECT_CONTROLS_DOMAIN_MODEL.md",
      "docs/architecture/PROJECT_CONTROLS_OWNERSHIP_MATRIX.md",
      "docs/architecture/PROJECT_CONTROLS_BOUNDARY_MAP.md",
      "docs/architecture/PROJECT_CONTROLS_PHASE_11A_DISCOVERY.md",
    ]) {
      expect(present(rel), rel).toBe(true);
    }

    expect(read("docs/architecture/PROJECT_CONTROLS_PHASE_11A_EXISTING_FOOTPRINT.md")).toMatch(
      /## Confirmed absences before Phase 11A/,
    );
    expect(read("docs/architecture/PROJECT_CONTROLS_DOMAIN_MODEL.md")).toMatch(
      /## Explicitly not implemented in Phase 11A/,
    );
    expect(read("docs/architecture/PROJECT_CONTROLS_OWNERSHIP_MATRIX.md")).toMatch(
      /## What Project Controls does NOT own/,
    );
    expect(read("docs/architecture/PROJECT_CONTROLS_OWNERSHIP_MATRIX.md")).toMatch(
      /## Identity ownership decision/,
    );
    expect(read("docs/architecture/PROJECT_CONTROLS_BOUNDARY_MAP.md")).toMatch(/```mermaid/);
    expect(read("docs/architecture/PROJECT_CONTROLS_PHASE_11A_DISCOVERY.md")).toMatch(
      /## Phase 11B readiness/,
    );
  });

  it("pins the frozen Asset Intelligence V1 baseline everywhere", () => {
    expect(read(VERSION)).toContain(ASSET_INTELLIGENCE_V1_COMMIT);
    expect(read(VERSION)).toMatch(/ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1\.0\.0"/);
    expect(read(GATES)).toContain(ASSET_INTELLIGENCE_V1_COMMIT);
    expect(read(RUNNER)).toContain("PHASE_11A_ASSET_INTELLIGENCE_V1_COMMIT");
    expect(read(WORKFLOW)).toContain(ASSET_INTELLIGENCE_V1_COMMIT);
    // The runner reads the tag; it must never create, move or delete one.
    expect(read(RUNNER)).not.toMatch(/git tag/);
  });

  it("leaves the Asset Intelligence V1 surface at 1.0.0 GA", () => {
    const aiVersion = read("packages/asset-intelligence/src/version.ts");
    expect(aiVersion).toMatch(/ASSET_INTELLIGENCE_VERSION = "1\.0\.0"/);
    expect(aiVersion).toMatch(/ASSET_INTELLIGENCE_STATUS = "ga"/);
    expect(aiVersion).toMatch(/ASSET_INTELLIGENCE_V1_FROZEN = true/);
    expect(aiVersion).toMatch(/ASSET_INTELLIGENCE_PUBLIC_CONTRACT_VERSION = "1\.0\.0"/);
    expect(read("packages/asset-intelligence/package.json")).toMatch(/"version": "1\.0\.0"/);
    // The discovery package must not couple itself to the frozen module.
    expect(read(`${PC}/package.json`)).not.toMatch(/@rtb\/asset-intelligence/);
  });

  it("introduces no Project Controls product migration", () => {
    for (const rel of [
      "supabase/migrations/20260203000002_batch_20_engineering_seed.sql",
      "supabase/migrations/20260209000002_batch_31_commerce_backfill.sql",
    ]) {
      expect(present(rel), rel).toBe(true);
    }
    expect(read(`${PC}/src/version.ts`)).toMatch(
      /PROJECT_CONTROLS_PRODUCT_TABLES_INTRODUCED = false/,
    );
  });

  it("ships the certification runner, secret scan and workflow", () => {
    for (const rel of [
      GATES,
      RUNNER,
      `${CERT}/scripts/secret-exposure-scan.ts`,
      `${PC}/tests/discovery-lock.test.ts`,
      `${PC}/tsconfig.json`,
      WORKFLOW,
    ]) {
      expect(present(rel), rel).toBe(true);
    }

    const workflow = read(WORKFLOW);
    expect(workflow).toMatch(/NODE_VERSION: "22"/);
    expect(workflow).toMatch(/certify:phase11a/);
    expect(workflow).toMatch(/requiredGates\.length===31/);
    expect(workflow).toMatch(/a\.productionProjectControlsReady===false/);
    expect(workflow).toMatch(/a\.version==="0\.1\.0-discovery"/);
    expect(workflow).toMatch(/git fetch --tags --force/);
  });
});
