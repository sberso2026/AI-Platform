/**
 * Phase E6 smoke — governed tool framework exports.
 */
import { describe, expect, it } from "vitest";
import {
  PhaseE6GovernedToolFrameworkComplete,
  PhaseE6NoSecondToolRegistry,
  EngineeringToolDiscoveryService,
  EngineeringToolInvocationService,
  getPhaseE6Declaration,
  phaseE6Ready,
  duplicateEngineeringToolFrameworkDetected,
} from "@rtb/engineering-os";

describe("eos-e6-governed-tool-framework", () => {
  it("exports E6 readiness and registry ownership lock", async () => {
    expect(phaseE6Ready).toBe(true);
    expect(PhaseE6GovernedToolFrameworkComplete).toBe(true);
    expect(PhaseE6NoSecondToolRegistry).toBe(true);
    expect(duplicateEngineeringToolFrameworkDetected).toBe(false);
    expect(getPhaseE6Declaration().platformRegistryOwner).toBe("platform_intelligence");

    const discovery = new EngineeringToolDiscoveryService();
    expect(discovery.listCatalog().length).toBeGreaterThan(4);

    const inv = new EngineeringToolInvocationService();
    const result = await inv.invoke({
      tenantId: "t-web",
      userId: "u1",
      toolId: "eos.evidence_keyword_check",
      inputs: { haystack: "hello", needle: "hell" },
      permissions: ["engineering_tool.execute"],
    });
    expect(result.provenance.llmGenerated).toBe(false);
  });
});
