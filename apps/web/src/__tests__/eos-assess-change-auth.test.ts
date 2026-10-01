import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const api = readFileSync(resolve(__dirname, "../app/api/engineering/work/route.ts"), "utf8");

describe("Assess Change authorization composition", () => {
  it("loads the Work Plan with analysis.read commerce before mutating with analysis.write", () => {
    const block = api.slice(api.indexOf('action === "assessChange"'));
    expect(block).toContain('authorizeEngineeringSegment(ctx, "work", "GET"');
    expect(block).toContain("getPlan(readCommerce");
    expect(block).not.toMatch(/getPlan\(commerce,/);
    expect(block).toContain("changeWorkbench.assess(commerce");
    expect(block).toContain("assertCanonicalWorkPlanOwnership");
    expect(api).toContain('authorizeEngineeringSegment(ctx, "projects", "GET"');
  });
});
