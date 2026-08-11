/**
 * Phase E9 smoke — unified intelligence routing + ownership lock.
 */
import { describe, expect, it } from "vitest";
import {
  PhaseE9UnifiedIntelligenceComplete,
  PhaseE9NoEngineOwnershipDuplication,
  PhaseE9ReusesCertifiedEnginesOnly,
  EngineeringIntelligenceService,
  getPhaseE9Declaration,
  phaseE9Ready,
  implementsOwnAiStack,
} from "@rtb/engineering-os";

describe("eos-e9-unified-intelligence-integration", () => {
  it("exports E9 readiness and no engine ownership duplication", async () => {
    expect(phaseE9Ready).toBe(true);
    expect(PhaseE9UnifiedIntelligenceComplete).toBe(true);
    expect(PhaseE9NoEngineOwnershipDuplication).toBe(true);
    expect(PhaseE9ReusesCertifiedEnginesOnly).toBe(true);
    expect(implementsOwnAiStack).toBe(false);
    expect(getPhaseE9Declaration().platformCapabilityRegistryOwner).toBe(
      "platform_intelligence",
    );

    const svc = new EngineeringIntelligenceService();
    const out = await svc.routeAndInvoke({
      tenantId: "t-web",
      userId: "u1",
      query: "what are the major risks?",
      projectId: "p1",
      objectType: "project",
      entitledKeys: ["project_intelligence", "project_controls"],
    });
    expect(out.results.every((r) => r.provenance.intelligenceIsNotApproval)).toBe(true);
  });
});
