/**
 * Phase E3 smoke — canonical context contracts exported to the web app.
 */
import { describe, expect, it } from "vitest";
import {
  PhaseE3CanonicalContextComplete,
  PhaseE3NoSecondKnowledgeGraph,
  EngineeringCanonicalObjectTypes,
  EngineeringContextStates,
  getPhaseE3Declaration,
  phaseE3Ready,
} from "@rtb/engineering-os";

describe("eos-e3-canonical-context", () => {
  it("exports E3 readiness and core taxonomies", () => {
    expect(phaseE3Ready).toBe(true);
    expect(PhaseE3CanonicalContextComplete).toBe(true);
    expect(PhaseE3NoSecondKnowledgeGraph).toBe(true);
    expect(EngineeringCanonicalObjectTypes).toContain("PROJECT");
    expect(EngineeringContextStates).toContain("RESOLVED");
    expect(getPhaseE3Declaration().contractVersion).toMatch(/e3/);
  });
});
