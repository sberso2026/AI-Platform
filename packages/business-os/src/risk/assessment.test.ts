import { describe, expect, it } from "vitest";
import { assessInherent, scoreToLevel } from "./assessment";
import { BUSINESS_RISK_ASSESSMENT_METHOD, BUSINESS_RISK_ASSESSMENT_RULE } from "@rtb/types";

describe("BOS-9 risk assessment matrix", () => {
  it("uses an explicit versioned likelihood × impact rule", () => {
    expect(BUSINESS_RISK_ASSESSMENT_RULE.method).toBe(BUSINESS_RISK_ASSESSMENT_METHOD);
    expect(assessInherent("likely", "severe")).toEqual(
      expect.objectContaining({
        method: "risk_assessment.v1",
        score: 20,
        level: "extreme",
      }),
    );
    expect(assessInherent("possible", "major").level).toBe("high");
    expect(assessInherent("unlikely", "moderate").level).toBe("moderate");
    expect(assessInherent("rare", "insignificant").level).toBe("low");
    expect(BUSINESS_RISK_ASSESSMENT_RULE.note).toMatch(/not a statistical probability/i);
  });

  it("returns unknown when likelihood or impact is unknown", () => {
    expect(assessInherent("unknown", "severe")).toEqual(expect.objectContaining({ score: null, level: "unknown" }));
    expect(assessInherent("likely", "unknown").level).toBe("unknown");
    expect(assessInherent("unknown", "unknown").level).toBe("unknown");
  });

  it("maps inspectable score bands", () => {
    expect(scoreToLevel(4)).toBe("low");
    expect(scoreToLevel(5)).toBe("moderate");
    expect(scoreToLevel(10)).toBe("high");
    expect(scoreToLevel(17)).toBe("extreme");
    expect(scoreToLevel(null)).toBe("unknown");
  });
});
