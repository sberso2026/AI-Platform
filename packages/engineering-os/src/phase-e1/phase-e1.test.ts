import { describe, expect, it } from "vitest";
import {
  AssetIntelligenceV1Intact,
  DigitalTwinV1Intact,
  EngineeringModelInteroperabilityV1Intact,
  EngineeringOSProductBoundaryLocked,
  InspectionIntelligenceV1Intact,
  ProjectControlsV1Intact,
  ProjectIntelligenceV1Intact,
  duplicateAssetOwnershipDetected,
  privateCrossModuleCouplingDetected,
} from "../version";
import {
  E1_EXPERIENCE_ROUTES,
  E1_PLATFORM_INTERNALS_HIDDEN_FROM_ENGINEERS,
  E1_PRIMARY_NAV_IDS,
  PhaseE1DoesNotOwnDomainLogic,
  PhaseE1DoesNotOwnPiIiAiLogic,
  PhaseE1EssentialZeroConnector,
  PhaseE1ExperienceFoundationComplete,
  assertPhaseE1Invariants,
  assertTenantWorkspaceIsolation,
  createEmptyEngineeringContext,
  filterVisiblePrimaryNavIds,
  getPhaseE1Declaration,
  parseDeepLinkContext,
} from "./contracts";

describe("Phase E1 Experience foundation contracts", () => {
  it("locks experience routes and ownership boundaries", () => {
    const decl = getPhaseE1Declaration();
    expect(decl.evolutionPhase).toBe("E1");
    expect(PhaseE1ExperienceFoundationComplete).toBe(true);
    expect(PhaseE1EssentialZeroConnector).toBe(true);
    expect(PhaseE1DoesNotOwnDomainLogic).toBe(true);
    expect(PhaseE1DoesNotOwnPiIiAiLogic).toBe(true);
    expect(decl.routes).toEqual(E1_EXPERIENCE_ROUTES);
    expect([...E1_PRIMARY_NAV_IDS]).toEqual([
      "eng-home",
      "eng-ask",
      "eng-my",
      "eng-explore",
      "eng-intelligence",
    ]);
    expect(E1_PLATFORM_INTERNALS_HIDDEN_FROM_ENGINEERS).toContain("prompt_registry");
    expect(E1_PLATFORM_INTERNALS_HIDDEN_FROM_ENGINEERS).toContain("tool_registry_internals");
  });

  it("preserves E0 certified ownership invariants", () => {
    expect(() =>
      assertPhaseE1Invariants({
        ProjectIntelligenceV1Intact,
        InspectionIntelligenceV1Intact,
        AssetIntelligenceV1Intact,
        ProjectControlsV1Intact,
        DigitalTwinV1Intact,
        EngineeringModelInteroperabilityV1Intact,
        privateCrossModuleCouplingDetected,
        duplicateAssetOwnershipDetected,
        EngineeringOSProductBoundaryLocked,
      }),
    ).not.toThrow();
  });

  it("filters Ask when ai_assistant is not entitled", () => {
    expect(
      filterVisiblePrimaryNavIds({
        productEntitled: true,
        entitledFeatureKeys: [],
      }),
    ).toEqual(["eng-home", "eng-my", "eng-explore", "eng-intelligence"]);
    expect(
      filterVisiblePrimaryNavIds({
        productEntitled: true,
        entitledFeatureKeys: ["ai_assistant"],
      }),
    ).toEqual(["eng-home", "eng-ask", "eng-my", "eng-explore", "eng-intelligence"]);
    expect(
      filterVisiblePrimaryNavIds({
        productEntitled: false,
        entitledFeatureKeys: ["ai_assistant"],
      }),
    ).toEqual([]);
  });

  it("initializes deep-link context for project and asset", () => {
    const projectCtx = parseDeepLinkContext({
      route: "/engineering/ask",
      searchParams: { projectId: "p-1" },
    });
    expect(projectCtx.projectId).toBe("p-1");
    expect(projectCtx.objectType).toBe("project");

    const assetCtx = parseDeepLinkContext({
      route: "/engineering/ask",
      searchParams: { projectId: "p-1", assetId: "a-103" },
    });
    expect(assetCtx.projectId).toBe("p-1");
    expect(assetCtx.objectId).toBe("a-103");
    expect(assetCtx.objectType).toBe("asset");
  });

  it("enforces tenant/workspace isolation helper", () => {
    const a = createEmptyEngineeringContext({ tenantId: "t1", workspaceId: "w1" });
    const b = createEmptyEngineeringContext({ tenantId: "t1", workspaceId: "w1" });
    const c = createEmptyEngineeringContext({ tenantId: "t2", workspaceId: "w1" });
    expect(assertTenantWorkspaceIsolation(a, b)).toBe(true);
    expect(assertTenantWorkspaceIsolation(a, c)).toBe(false);
  });
});
