import { describe, expect, it } from "vitest";
import { planEngineeringQuery } from "../src/documents/query-plan";

describe("engineering query planner", () => {
  it("plans fragments, commands, and inverted requirements without interrogative grammar", () => {
    const fragment = planEngineeringQuery("Maximum pull-wire support spacing?");
    expect(fragment.property).toBe("interval");
    expect(fragment.constraint).toBe("maximum");
    expect(fragment.expectedAnswerType).toBe("quantity_with_unit");

    const command = planEngineeringQuery("Find the support interval for emergency stops.");
    expect(command.property).toBe("interval");
    expect(command.intent === "property_lookup" || command.intent === "requirement_lookup").toBe(true);

    const inverted = planEngineeringQuery("Supports shall be spaced at what distance?");
    expect(inverted.property).toBe("interval");
  });

  it("treats or-alternatives as separate subjects", () => {
    const plan = planEngineeringQuery("what is the maximum interval for lanyard or pull wire support?");
    expect(plan.subjects.some((subject) => /lanyard/i.test(subject))).toBe(true);
    expect(plan.subjects.some((subject) => /pull wire/i.test(subject))).toBe(true);
    expect(plan.property).toBe("interval");
    expect(plan.constraint).toBe("maximum");
  });
});
