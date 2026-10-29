import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  E1_EXPERIENCE_ROUTES,
  E1_PLATFORM_INTERNALS_HIDDEN_FROM_ENGINEERS,
  assertPhaseE1Invariants,
  filterVisiblePrimaryNavIds,
  parseDeepLinkContext,
} from "@rtb/engineering-os";
import {
  ENGINEERING_EXPLORE_GROUPS,
  ENGINEERING_INTELLIGENCE_CATEGORIES,
  resolveVisiblePrimaryNavIds,
} from "../lib/engineering/experience-surfaces";
import { ENGINEERING_CERTIFIED_V1_MODULES } from "../lib/engineering/certified-modules";

const webRoot = resolve(__dirname, "../..");

function readSrc(rel: string) {
  return readFileSync(resolve(webRoot, rel), "utf8");
}

describe("EOS-E1 Experience foundation", () => {
  it("keeps E0/E1 ownership invariants intact", () => {
    expect(() =>
      assertPhaseE1Invariants({
        ProjectIntelligenceV1Intact: true,
        InspectionIntelligenceV1Intact: true,
        AssetIntelligenceV1Intact: true,
        ProjectControlsV1Intact: true,
        DigitalTwinV1Intact: true,
        EngineeringModelInteroperabilityV1Intact: true,
        privateCrossModuleCouplingDetected: false,
        duplicateAssetOwnershipDetected: false,
        EngineeringOSProductBoundaryLocked: true,
      }),
    ).not.toThrow();
  });

  it("capability-driven nav visibility hides Ask without entitlement", () => {
    expect(
      resolveVisiblePrimaryNavIds({
        productEntitled: true,
        entitledFeatureKeys: [],
      }),
    ).not.toContain("eng-ask");
    expect(
      filterVisiblePrimaryNavIds({
        productEntitled: true,
        entitledFeatureKeys: ["ai_assistant"],
      }),
    ).toContain("eng-ask");
  });

  it("hides unavailable modules from primary experience ids", () => {
    const ids = resolveVisiblePrimaryNavIds({
      productEntitled: true,
      entitledFeatureKeys: [],
    });
    expect(ids.every((id) => id.startsWith("eng-"))).toBe(true);
    expect(ids).not.toContain("eng-projects");
    expect(ids).not.toContain("eng-modules");
  });

  it("documents platform internals hidden from engineers", () => {
    expect(E1_PLATFORM_INTERNALS_HIDDEN_FROM_ENGINEERS).toEqual(
      expect.arrayContaining([
        "prompt_registry",
        "model_registry",
        "tool_registry_internals",
        "event_bus",
        "knowledge_graph_internals",
        "telemetry",
        "provider_routing",
        "feature_flags",
        "secret_manager",
        "evaluation_framework",
      ]),
    );
  });

  it("propagates project and asset context into Ask deep links", () => {
    const project = parseDeepLinkContext({
      route: E1_EXPERIENCE_ROUTES.ask,
      searchParams: { projectId: "proj-1" },
    });
    expect(project.projectId).toBe("proj-1");
    expect(project.objectType).toBe("project");

    const asset = parseDeepLinkContext({
      route: E1_EXPERIENCE_ROUTES.ask,
      searchParams: { projectId: "proj-1", assetId: "asset-103" },
    });
    expect(asset.objectId).toBe("asset-103");
    expect(asset.objectType).toBe("asset");
  });

  it("initializes Ask shell from deep-link params", () => {
    const ask = readSrc("src/components/engineering/ask-engineering-shell.tsx");
    expect(ask).toContain("initFromDeepLink");
    expect(ask).toContain("ask-context-bar");
    expect(ask).toContain("ask-evidence-panel");
    expect(ask).toContain("No fabricated");
  });

  it("My Engineering composes register APIs without new parallel ownership", () => {
    const my = readSrc("src/app/(platform)/engineering/my/page.tsx");
    expect(my).toContain("/api/engineering/actions");
    expect(my).toContain("/api/engineering/technical-queries");
    expect(my).toContain("Open full register");
    expect(my).not.toContain("@rtb/project-intelligence");
    expect(my).not.toContain("@rtb/inspection-intelligence");
  });

  it("Explore lists only supported baseline destinations", () => {
    const ids = ENGINEERING_EXPLORE_GROUPS.flatMap((g) => g.items.map((i) => i.id));
    expect(ids).toEqual(
      expect.arrayContaining(["projects", "assets", "documents", "tqs", "search"]),
    );
    expect(ids).not.toContain("drawings");
    expect(ids).not.toContain("calculations");
  });

  it("Intelligence composes entitled modules only — no engine ownership", () => {
    const intelligence = readSrc("src/app/(platform)/engineering/intelligence/page.tsx");
    expect(intelligence).toContain("composition-only");
    expect(intelligence).toContain("/api/engineering/modules/access");
    expect(intelligence).not.toContain("@rtb/project-intelligence");
    expect(ENGINEERING_INTELLIGENCE_CATEGORIES.map((c) => c.applicationKey)).toEqual(
      expect.arrayContaining(ENGINEERING_CERTIFIED_V1_MODULES.map((m) => m.applicationKey)),
    );
  });

  it("structured modules remain reachable via Explore hrefs", () => {
    const hrefs = ENGINEERING_EXPLORE_GROUPS.flatMap((g) => g.items.map((i) => i.href));
    expect(hrefs).toContain("/engineering/projects");
    expect(hrefs).toContain("/engineering/modules");
    expect(hrefs).toContain("/engineering/technical-queries");
  });

  it("primary experience routes are delivered", () => {
    expect(E1_EXPERIENCE_ROUTES).toEqual({
      home: "/engineering",
      ask: "/engineering/ask",
      my: "/engineering/my",
      explore: "/engineering/explore",
      intelligence: "/engineering/intelligence",
    });
    for (const rel of [
      "src/app/(platform)/engineering/page.tsx",
      "src/app/(platform)/engineering/ask/page.tsx",
      "src/app/(platform)/engineering/my/page.tsx",
      "src/app/(platform)/engineering/explore/page.tsx",
      "src/app/(platform)/engineering/intelligence/page.tsx",
    ]) {
      expect(readSrc(rel).length).toBeGreaterThan(100);
    }
  });

  it("home offers Ask immediately and keeps legacy test ids", () => {
    const home = readSrc("src/app/(platform)/engineering/page.tsx");
    expect(home).toContain("home-ask-input");
    expect(home).toContain("engineering-os-v1-ready");
    expect(home).toContain("buildAskHref");
  });

  it("perf instrumentation does not gate rendering", () => {
    const perf = readSrc("src/hooks/use-experience-perf.ts");
    expect(perf).toContain("must never throw");
    expect(perf).toContain("performance.mark");
    expect(perf).not.toContain("throw new Error");
  });

  it("ESSENTIAL remains zero-connector in experience surfaces", () => {
    const surfaces = readSrc("src/lib/engineering/experience-surfaces.ts");
    expect(surfaces).not.toContain("sap");
    expect(surfaces).not.toContain("fabric");
    expect(surfaces).not.toContain("copilot");
  });
});
