import { describe, expect, it } from "vitest";
import {
  assertOwnershipLock,
  listConcernsByRelation,
  ASSET_INTELLIGENCE_V1_COMMIT,
  ASSET_INTELLIGENCE_V1_INTACT,
  ASSET_INTELLIGENCE_V1_TAG,
  ASSET_INTELLIGENCE_V1_VERSION,
  BUDGET_LEDGER_IMPLEMENTED,
  CANONICAL_LIFECYCLE_MUTATION_ALLOWED,
  CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS,
  COST_ENGINE_IMPLEMENTED,
  CPM_SCHEDULING_IMPLEMENTED,
  DUPLICATE_ASSET_OWNERSHIP_INTRODUCED,
  EARNED_VALUE_IMPLEMENTED,
  FORECASTING_IMPLEMENTED,
  getProjectControlsDiscoveryDeclaration,
  PRODUCTION_PROJECT_CONTROLS_READY,
  PROJECT_CONTROLS_DISCOVERY_CONCEPTS,
  PROJECT_CONTROLS_DISCOVERY_IMPLEMENTED,
  PROJECT_CONTROLS_IMPLEMENTED,
  PROJECT_CONTROLS_MODULE_KEY,
  PROJECT_CONTROLS_MODULE_REGISTRY_STATUS,
  PROJECT_CONTROLS_OWNERSHIP,
  PROJECT_CONTROLS_OWNERSHIP_MATRIX,
  PROJECT_CONTROLS_PRODUCT_NAME,
  PROJECT_CONTROLS_PRODUCT_TABLES_INTRODUCED,
  PROJECT_CONTROLS_PRODUCT_UI_IMPLEMENTED,
  PROJECT_CONTROLS_STATUS,
  PROJECT_CONTROLS_VERSION,
  PROJECT_IDENTITY_OWNERSHIP,
  RISK_CORE_AUTO_MUTATION_ALLOWED,
  SCHEDULE_EXECUTION_IMPLEMENTED,
  WORK_PACKAGING_UI_IMPLEMENTED,
} from "../src/index";

describe("Phase 11A Project Controls discovery lock", () => {
  it("declares a discovery-only module identity", () => {
    expect(PROJECT_CONTROLS_PRODUCT_NAME).toBe("Project Controls");
    expect(PROJECT_CONTROLS_MODULE_KEY).toBe("project_controls");
    expect(PROJECT_CONTROLS_VERSION).toBe("0.1.0-discovery");
    expect(PROJECT_CONTROLS_STATUS).toBe("discovery");
    expect(PROJECT_CONTROLS_IMPLEMENTED).toBe(false);
    expect(PROJECT_CONTROLS_DISCOVERY_IMPLEMENTED).toBe(true);
    expect(PRODUCTION_PROJECT_CONTROLS_READY).toBe(false);
  });

  it("locks ownership without claiming canonical project identity", () => {
    const lock = assertOwnershipLock();
    expect(lock.ok).toBe(true);
    expect(lock.projectControlsOwnership).toBe("project_controls");
    expect(lock.projectIdentityOwnership).toBe("engineering_core");
    expect(lock.canonicalProjectIdentityClaimedByProjectControls).toBe(false);
    expect(lock.canonicalAssetIdentityOwnership).toBe("engineering_os_shared_domain");
    expect(lock.canonicalEngineeringRiskOwnership).toBe("engineering_core");
    expect(PROJECT_CONTROLS_OWNERSHIP).toBe("project_controls");
    expect(PROJECT_IDENTITY_OWNERSHIP).toBe("engineering_core");
    expect(CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS).toBe(false);
  });

  it("never assigns Asset, Inspection or Project Intelligence to Project Controls", () => {
    const foreign = PROJECT_CONTROLS_OWNERSHIP_MATRIX.filter((row) =>
      [
        "asset_identity_canonical",
        "asset_lifecycle_canonical",
        "asset_intelligence",
        "inspection_intelligence",
        "project_knowledge",
        "project_identity_canonical",
        "canonical_risk_register",
        "financial_ledgers_billing",
      ].includes(row.concern),
    );
    expect(foreign.length).toBe(8);
    for (const row of foreign) {
      expect(row.owner, row.concern).not.toBe("project_controls");
    }
  });

  it("splits the matrix into owns / consumes / forbidden with no gaps", () => {
    const owns = listConcernsByRelation("owns");
    const consumes = listConcernsByRelation("consumes");
    const forbidden = listConcernsByRelation("forbidden");
    expect(owns.length + consumes.length + forbidden.length).toBe(
      PROJECT_CONTROLS_OWNERSHIP_MATRIX.length,
    );
    expect(owns.every((row) => row.owner === "project_controls")).toBe(true);
    expect(owns.length).toBeGreaterThanOrEqual(5);
    expect(forbidden.some((row) => row.concern === "earned_value")).toBe(true);
  });

  it("keeps every Project Controls product capability unimplemented", () => {
    for (const [name, flag] of [
      ["earned value", EARNED_VALUE_IMPLEMENTED],
      ["CPM", CPM_SCHEDULING_IMPLEMENTED],
      ["cost engine", COST_ENGINE_IMPLEMENTED],
      ["schedule execution", SCHEDULE_EXECUTION_IMPLEMENTED],
      ["budget ledger", BUDGET_LEDGER_IMPLEMENTED],
      ["work packaging UI", WORK_PACKAGING_UI_IMPLEMENTED],
      ["forecasting", FORECASTING_IMPLEMENTED],
      ["product tables", PROJECT_CONTROLS_PRODUCT_TABLES_INTRODUCED],
      ["product UI", PROJECT_CONTROLS_PRODUCT_UI_IMPLEMENTED],
      ["duplicate asset ownership", DUPLICATE_ASSET_OWNERSHIP_INTRODUCED],
      ["canonical lifecycle mutation", CANONICAL_LIFECYCLE_MUTATION_ALLOWED],
      ["core risk auto mutation", RISK_CORE_AUTO_MUTATION_ALLOWED],
    ] as const) {
      expect(flag, name).toBe(false);
    }
  });

  it("references the frozen Asset Intelligence V1 tag without depending on it", () => {
    expect(ASSET_INTELLIGENCE_V1_TAG).toBe("asset-intelligence-v1.0.0");
    expect(ASSET_INTELLIGENCE_V1_COMMIT).toBe("925e2ed74025cac6a145c346c17c53320efb8757");
    expect(ASSET_INTELLIGENCE_V1_VERSION).toBe("1.0.0");
    expect(ASSET_INTELLIGENCE_V1_INTACT).toBe(true);
  });

  it("keeps the Engineering OS module registry entry coming_soon", () => {
    expect(PROJECT_CONTROLS_MODULE_REGISTRY_STATUS).toBe("coming_soon");
  });

  it("publishes discovery concepts only", () => {
    expect(PROJECT_CONTROLS_DISCOVERY_CONCEPTS).toContain("cost");
    expect(PROJECT_CONTROLS_DISCOVERY_CONCEPTS).toContain("schedule");
    expect(PROJECT_CONTROLS_DISCOVERY_CONCEPTS).toContain("progress");
    expect(PROJECT_CONTROLS_DISCOVERY_CONCEPTS).toContain("change");
    expect(PROJECT_CONTROLS_DISCOVERY_CONCEPTS).toContain("contingency");
    expect(PROJECT_CONTROLS_DISCOVERY_CONCEPTS).toContain("earned_value_reserved");
    expect(PROJECT_CONTROLS_DISCOVERY_CONCEPTS).toContain("wbs_consumption");
    expect(new Set(PROJECT_CONTROLS_DISCOVERY_CONCEPTS).size).toBe(
      PROJECT_CONTROLS_DISCOVERY_CONCEPTS.length,
    );
  });

  it("exposes a coherent discovery declaration", () => {
    const declaration = getProjectControlsDiscoveryDeclaration();
    expect(declaration.version).toBe("0.1.0-discovery");
    expect(declaration.status).toBe("discovery");
    expect(declaration.phase).toBe("11A");
    expect(declaration.productionProjectControlsReady).toBe(false);
    expect(declaration.projectControlsImplemented).toBe(false);
    expect(declaration.discoveryImplemented).toBe(true);
    expect(declaration.projectIdentityOwnership).toBe("engineering_core");
    expect(declaration.assetIntelligenceV1Intact).toBe(true);
    expect(declaration.hierarchy).toContain("Project Controls");
    expect(declaration.hierarchy).toContain("discovery only");
  });
});
