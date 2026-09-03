import { describe, expect, it } from "vitest";
import { classifyEvidenceRelevance } from "../src/documents/evidence-relevance";
import { planEngineeringQuery } from "../src/documents/query-plan";

describe("evidence relevance", () => {
  it("marks neighbouring force text contextual when the asked property is interval", () => {
    const plan = planEngineeringQuery("what is the maximum interval for pull wire supports?");
    const direct = classifyEvidenceRelevance(
      "(e) Supports for cables shall be provided at intervals not exceeding 3.0 m.",
      plan,
    );
    const contextual = classifyEvidenceRelevance(
      "(d) The force required to operate the pull wire stop control shall not exceed 70 N.",
      plan,
    );
    expect(direct).toBe("DIRECT");
    expect(["CONTEXTUAL", "SUPPORTING"]).toContain(contextual);
  });
});
