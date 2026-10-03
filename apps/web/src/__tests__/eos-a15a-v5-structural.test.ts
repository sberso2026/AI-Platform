import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("EOS-A15A-V5 structural work generator UI", () => {
  it("exposes Structural Workbench, missing-input states, and calculation actions on the Work Plan", () => {
    const plan = readApp("src/app/(platform)/engineering/work/plans/[id]/page.tsx");
    const mto = readApp("src/app/(platform)/engineering/work/plans/[id]/mto/page.tsx");
    const api = readApp("src/app/api/engineering/work/route.ts");
    expect(mto).toContain("No prior like-scope revision to compare.");
    expect(plan).toContain("Structural Workbench");
    expect(plan).toContain("Load incomplete fixture");
    expect(plan).toContain("Load governed fixture");
    expect(plan).toContain("Run deterministic check");
    expect(plan).toContain("Accept for use");
    expect(plan).toContain("Change member section");
    expect(plan).toContain("Download calculation XLSX");
    expect(plan).toContain("SPACE GASS remains unexecuted");
    expect(plan).toContain("SYNTHETIC_DEMONSTRATION_DATA");
    expect(api).toContain("seedStructuralFixture");
    expect(api).toContain("runStructuralCheck");
    expect(api).toContain("exportStructuralCalculation");
    expect(api).toContain("structuralWork");
  });
});
