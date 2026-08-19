import { describe, expect, it } from "vitest";
import { BUSINESS_PROFIT_ATTRIBUTION_METHODS, BUSINESS_PROFIT_DIMENSION_TYPES } from "@rtb/types";
import { WORK_OPERATIONS_PROFIT_CONTRACT } from "../profit/extensions";
import { OPERATIONS_DEMO_COSTS } from "./demo";

describe("BOS-7 profit intelligence integration", () => {
  it("adds work dimension and operations_fact attribution without arbitrary allocation", () => {
    expect(BUSINESS_PROFIT_DIMENSION_TYPES).toContain("work");
    expect(BUSINESS_PROFIT_ATTRIBUTION_METHODS).toContain("operations_fact");
    expect(WORK_OPERATIONS_PROFIT_CONTRACT.implemented).toBe(true);
    expect(WORK_OPERATIONS_PROFIT_CONTRACT.note).toMatch(/no arbitrary allocation/i);
  });

  it("keeps forecast and budget operational costs non-realized", () => {
    const harbour = OPERATIONS_DEMO_COSTS.filter((row) => row.workSourceRef === "bos-7-demo-work-harbour");
    expect(harbour.some((row) => row.valueState === "actual")).toBe(true);
    expect(harbour.some((row) => row.valueState === "forecast")).toBe(true);
    expect(harbour.some((row) => row.valueState === "budget")).toBe(true);
    const realized = harbour.filter((row) => row.valueState === "actual");
    const nonRealized = harbour.filter((row) => row.valueState !== "actual");
    expect(realized.every((row) => row.sourceRef !== nonRealized[0]?.sourceRef)).toBe(true);
  });
});
