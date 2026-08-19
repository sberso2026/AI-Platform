import { describe, expect, it } from "vitest";
import { mixedImpactCurrencies, normalizeImpactQuantification } from "./impact";

describe("BOS-8 impact quantification", () => {
  it("keeps unknown when quantitative value is missing", () => {
    expect(normalizeImpactQuantification({ optionId: "o", dimension: "financial", quantification: "quantitative" })).toEqual({
      quantification: "unknown",
      qualitativeOnly: false,
      valueMinor: null,
    });
  });

  it("labels qualitative impact without inventing a number", () => {
    const result = normalizeImpactQuantification({
      optionId: "o",
      dimension: "customer",
      quantification: "qualitative",
      qualitativeLabel: "Possible delay",
    });
    expect(result.quantification).toBe("qualitative");
    expect(result.qualitativeOnly).toBe(true);
    expect(result.valueMinor).toBeNull();
  });

  it("detects mixed currencies as incomparable", () => {
    expect(
      mixedImpactCurrencies([
        { quantification: "quantitative", currency: "AUD" } as never,
        { quantification: "quantitative", currency: "USD" } as never,
      ]),
    ).toBe(true);
  });
});
