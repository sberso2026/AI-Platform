import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("EOS-A15A-V3 MTO workbench UI", () => {
  it("places Quantities & MTO inside Engineering Workbench / Work Plan", () => {
    const plan = readApp("src/app/(platform)/engineering/work/plans/[id]/page.tsx");
    const mto = readApp("src/app/(platform)/engineering/work/plans/[id]/mto/page.tsx");
    const api = readApp("src/app/api/engineering/work/route.ts");
    expect(plan).toContain("Quantities &");
    expect(plan).toContain("Create/Open MTO");
    expect(plan).toContain("/mto");
    expect(plan).not.toContain("Verify all AI quantities automatically");
    expect(mto).toContain("Where did this quantity come from?");
    expect(mto).toContain("QUANTITY_NOT_AVAILABLE");
    expect(mto).toContain("Revision comparison");
    expect(mto).toContain("Export XLSX");
    expect(mto).toContain("I confirm these selected items as the verifying engineer");
    expect(mto).not.toContain("Verify all AI");
    expect(mto).toContain("PAGE_SIZE = 50");
    expect(api).toContain("quantityMto");
    expect(api).toContain("seedMtoDemonstrator");
    expect(api).toContain("exportMto");
    const exportBlock = api.slice(api.indexOf('action === "exportMto"'), api.indexOf("return new NextResponse", api.indexOf('action === "exportMto"')));
    expect(exportBlock).toContain("exportWorkbook(commerce");
    expect(exportBlock).not.toContain('authorizeEngineeringSegment(ctx, "work", "POST"');
    expect(exportBlock).toContain("work.get / analysis.read");
  });
});
