import { describe, expect, it } from "vitest";
import { assertRequirementCompliance } from "./requirements";

describe("BOS-4 proposal requirements", () => {
  it("refuses satisfied without evidence", () => {
    expect(() => assertRequirementCompliance("satisfied", [])).toThrow("requirement_evidence_required");
  });

  it("refuses AI marking a requirement satisfied", () => {
    expect(() =>
      assertRequirementCompliance(
        "satisfied",
        [{ sourceType: "user", sourceRef: "x", title: "note" }],
        "platform_ai_director",
      ),
    ).toThrow("ai_cannot_mark_requirement_satisfied");
  });

  it("allows unknown and unsatisfied without evidence", () => {
    expect(() => assertRequirementCompliance("unknown", [])).not.toThrow();
    expect(() => assertRequirementCompliance("unsatisfied", [], "platform_ai_director")).not.toThrow();
  });
});
