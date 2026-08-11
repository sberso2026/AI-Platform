/**
 * Phase E5 smoke — reasoning / Why? contracts for Ask.
 */
import { describe, expect, it } from "vitest";
import {
  PhaseE5ReasoningExplainabilityComplete,
  PhaseE5NoHiddenCotExposure,
  EngineeringReasoningService,
  getPhaseE5Declaration,
  phaseE5Ready,
} from "@rtb/engineering-os";

describe("eos-e5-reasoning-explainability", () => {
  it("exports E5 readiness and Why? invariants", async () => {
    expect(phaseE5Ready).toBe(true);
    expect(PhaseE5ReasoningExplainabilityComplete).toBe(true);
    expect(PhaseE5NoHiddenCotExposure).toBe(true);
    expect(getPhaseE5Declaration().contractVersion).toMatch(/e5/);

    const svc = new EngineeringReasoningService();
    const res = await svc.reason({
      query: "explain",
      evidence: [],
    });
    expect(res.abstained).toBe(true);
    expect(res.why.chainOfThoughtExposed).toBe(false);
  });
});
