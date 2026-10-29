import { describe, expect, it } from "vitest";
import { planEngineeringQuery } from "../src/documents/query-plan";

describe("planEngineeringQuery", () => {
  it("preserves raw query and strips conversational frames from retrieval channels", () => {
    const plan = planEngineeringQuery(
      "in the design of rotating equipment, what is the minimum coupling guard thickness?",
    );
    expect(plan.rawQuery).toContain("in the design of");
    expect(plan.normalizedQuery.toLowerCase()).not.toMatch(/\bdesign\b/);
    expect(plan.properties).toContain("thickness");
    expect(plan.constraints).toContain("minimum");
    expect(plan.distinctiveTerms).toEqual(expect.arrayContaining(["coupling", "guard", "thickness", "minimum"]));
    expect(plan.distinctiveTerms).not.toContain("design");
    expect(plan.retrievalQueries.some((query) => query.includes(" OR "))).toBe(true);
    expect(plan.engineeringIntent).toBe("property_lookup");
  });

  it("does not require generic frame words for prefix, suffix, or question-form variants", () => {
    const prefixes = [
      "in the design of",
      "for conveyor design",
      "according to this document",
      "for engineering review",
      "please confirm",
      "can you tell me",
      "we are designing a conveyor and need to know",
    ];
    const suffixes = [
      "according to the standard",
      "for design purposes",
      "and provide the clause",
      "and show me the source",
      "and explain why",
    ];
    const forms = [
      "what is the minimum coupling guard thickness",
      "how thick must a coupling guard be",
      "tell me the minimum coupling guard thickness",
      "find the minimum coupling guard thickness",
      "identify the minimum coupling guard thickness",
      "confirm the minimum coupling guard thickness",
      "minimum coupling guard thickness",
      "required coupling guard thickness",
      "does the standard specify the minimum coupling guard thickness",
      "I need to know the minimum coupling guard thickness",
    ];

    for (const prefix of prefixes) {
      const plan = planEngineeringQuery(`${prefix} the minimum coupling guard thickness`);
      expect(plan.distinctiveTerms).toEqual(expect.arrayContaining(["coupling", "guard", "thickness", "minimum"]));
      expect(plan.distinctiveTerms).not.toContain("design");
      expect(plan.distinctiveTerms).not.toContain("conveyor");
    }
    for (const suffix of suffixes) {
      const plan = planEngineeringQuery(`what is the minimum coupling guard thickness ${suffix}`);
      expect(plan.distinctiveTerms).toEqual(expect.arrayContaining(["coupling", "guard", "thickness"]));
    }
    for (const form of forms) {
      const plan = planEngineeringQuery(form);
      expect(plan.distinctiveTerms.some((term) => term === "coupling" || term === "guard")).toBe(true);
      expect(plan.properties).toContain("thickness");
    }
  });
});
