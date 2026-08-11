import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  assertPhaseE2Invariants,
  PhaseE2NativeZeroConnector,
  PhaseE2NoSecondAssistantStack,
} from "@rtb/engineering-os";

const webRoot = resolve(__dirname, "../..");

function readSrc(rel: string) {
  return readFileSync(resolve(webRoot, rel), "utf8");
}

describe("EOS-E2 grounded Ask experience", () => {
  it("preserves E0/E1/E2 ownership invariants", () => {
    expect(PhaseE2NativeZeroConnector).toBe(true);
    expect(PhaseE2NoSecondAssistantStack).toBe(true);
    expect(() =>
      assertPhaseE2Invariants({
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

  it("Ask UI renders evidence and scope controls", () => {
    const ask = readSrc("src/components/engineering/ask-engineering-shell.tsx");
    expect(ask).toContain("ask-evidence-list");
    expect(ask).toContain("ask-scope-indicator");
    expect(ask).toContain("ask-limitations");
    expect(ask).not.toContain("pending E2 retrieval");
    expect(ask).not.toContain("embedding");
    expect(ask).not.toContain("vector");
  });

  it("API forwards grounded context fields", () => {
    const route = readSrc("src/app/api/engineering/ai/route.ts");
    expect(route).toContain("objectType");
    expect(route).toContain("objectId");
    expect(route).toContain("scope");
    expect(route).toContain("sessionId");
  });

  it("Ask this entry points exist for project/asset/document", () => {
    expect(readSrc("src/app/(platform)/engineering/projects/[projectId]/page.tsx")).toContain(
      "ask-this-project",
    );
    expect(readSrc("src/app/(platform)/engineering/assets/[assetId]/page.tsx")).toContain(
      "ask-this-asset",
    );
    expect(readSrc("src/app/(platform)/engineering/documents/[documentId]/page.tsx")).toContain(
      "ask-this-document",
    );
  });

  it("does not invent unsupported domains in Ask shell", () => {
    const ask = readSrc("src/components/engineering/ask-engineering-shell.tsx");
    expect(ask.toLowerCase()).not.toContain("drawing understanding");
    expect(ask.toLowerCase()).not.toContain("copilot");
    expect(ask.toLowerCase()).not.toContain("sharepoint");
  });
});
