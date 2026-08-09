import { describe, expect, it } from "vitest";
import {
  AI_ORCHESTRATION_SEMANTICS,
  ENGINEERING_OS_AGGREGATE_MANIFEST,
  ENGINEERING_OS_COMMERCIAL_PRODUCT,
  ENGINEERING_OS_EVENT_INTEGRATION,
  ENGINEERING_SEARCH_OBJECT_TYPES,
  EngineeringOwnershipNormalizer,
  aggregateEngineeringOSCapabilities,
  aggregateEngineeringOSHealth,
  assertCompatibleOrThrow,
  assertProductionModulesRegistered,
  createEngineeringContext,
  discoverEntitledAiCapabilities,
  filterSearchResultsByPermission,
  listEntitledReportRoutes,
  normalizeEngineeringSearchResult,
  resolveAssetOwnership,
} from "./index";
import {
  ENGINEERING_OS_VERSION,
  EngineeringOSProductIntegrationReady,
  moduleRegistryDriftDetected,
  productionEngineeringOSReady,
} from "../version";

describe("Phase 14B Engineering OS product integration", () => {
  it("builds truthful aggregate manifest", () => {
    expect(ENGINEERING_OS_VERSION).toBe("0.10.0-product-integration");
    expect(EngineeringOSProductIntegrationReady).toBe(true);
    expect(productionEngineeringOSReady).toBe(false);
    expect(moduleRegistryDriftDetected).toBe(false);
    assertProductionModulesRegistered(ENGINEERING_OS_AGGREGATE_MANIFEST);
    expect(ENGINEERING_OS_AGGREGATE_MANIFEST.installedModules).toHaveLength(6);
    expect(
      ENGINEERING_OS_AGGREGATE_MANIFEST.sharedDomainVersions.project,
    ).toBe("0.1.0-shared-project-domain");
    expect(
      ENGINEERING_OS_AGGREGATE_MANIFEST.unavailableCapabilities.some(
        (u) => u.id === "spacegass.live_execution",
      ),
    ).toBe(true);
    assertCompatibleOrThrow();
  });

  it("enforces asset ownership alias without destructive rename", () => {
    const semantic = resolveAssetOwnership(
      EngineeringOwnershipNormalizer.SEMANTIC_ASSET_IDENTITY_OWNERSHIP,
      "semantic",
    );
    const runtime = resolveAssetOwnership(
      EngineeringOwnershipNormalizer.RUNTIME_ASSET_IDENTITY_OWNERSHIP,
      "runtime",
    );
    expect(semantic.resolvedOwner).toBe("engineering_os_shared_domain");
    expect(runtime.resolvedOwner).toBe("engineering_os_shared_domain");
    expect(semantic.duplicateAssetOwnershipDetected).toBe(false);
    EngineeringOwnershipNormalizer.assertAssetOwnershipAliasConsistent([
      "engineering_os_shared_asset_domain",
      "engineering_os_shared_domain",
    ]);
  });

  it("creates EngineeringContext without becoming a domain registry", () => {
    const ctx = createEngineeringContext({
      tenantRef: "t1",
      workspaceRef: "w1",
      userRef: "u1",
      permissions: ["engineering.read"],
      projectRef: "p1",
      activeModule: "project_intelligence",
    });
    expect(ctx.correlationId).toBeTruthy();
    expect(ctx.tenantRef).toBe("t1");
  });

  it("normalizes and permission-filters search results", () => {
    expect(ENGINEERING_SEARCH_OBJECT_TYPES).toContain("engineering_model");
    const result = normalizeEngineeringSearchResult({
      objectType: "engineering_model",
      id: "m1",
      title: "Model",
      moduleOwner: "engineering_model_interoperability",
      sourceModule: "engineering_model_interoperability",
      permissions: ["engineering.read"],
    });
    expect(result.isEngineeringAuthority).toBe(false);
    expect(result.isVerifiedConclusion).toBe(false);
    expect(
      filterSearchResultsByPermission([result], ["engineering.read"]),
    ).toHaveLength(1);
    expect(filterSearchResultsByPermission([result], [])).toHaveLength(0);
  });

  it("aggregates health without treating solver unavailability as OS-down", () => {
    const health = aggregateEngineeringOSHealth();
    expect(health.overall).toBe("healthy");
    expect(
      health.components.find((c) => c.key === "spacegass_live_execution")
        ?.status,
    ).toBe("unavailable");
    const down = aggregateEngineeringOSHealth({
      database: {
        key: "database",
        label: "Database",
        status: "unavailable",
        critical: true,
      },
    });
    expect(down.overall).toBe("unavailable");
  });

  it("wires AI orchestration on one stack", () => {
    expect(AI_ORCHESTRATION_SEMANTICS.implementsOwnAiStack).toBe(false);
    const caps = discoverEntitledAiCapabilities(["*"]);
    expect(caps.some((c) => c.moduleKey === "project_intelligence")).toBe(true);
    expect(caps.some((c) => c.moduleKey === "digital_twin")).toBe(true);
  });

  it("defines commercial product and reporting/event integration", () => {
    expect(ENGINEERING_OS_COMMERCIAL_PRODUCT.productKey).toBe("engineering-os");
    expect(
      ENGINEERING_OS_COMMERCIAL_PRODUCT.notes
        .commercialSolverEntitlementImpliesLicense,
    ).toBe(false);
    expect(listEntitledReportRoutes(["*"]).length).toBeGreaterThanOrEqual(6);
    expect(ENGINEERING_OS_EVENT_INTEGRATION.directHiddenCouplingAllowed).toBe(
      false,
    );
    expect(aggregateEngineeringOSCapabilities().ok).toBe(true);
  });
});
