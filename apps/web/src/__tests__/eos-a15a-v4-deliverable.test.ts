import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("EOS-A15A-V4 governed deliverable composition UI", () => {
  it("exposes generate deliverable, source readiness, and artifact history on the Work Plan", () => {
    const plan = readApp("src/app/(platform)/engineering/work/plans/[id]/page.tsx");
    const api = readApp("src/app/api/engineering/work/route.ts");
    expect(plan).toContain("Generate Deliverable");
    expect(plan).toContain("Source readiness");
    expect(plan).toContain("Generate Design Report");
    expect(plan).toContain("Generate Technical Note");
    expect(plan).toContain("Export MTO XLSX");
    expect(plan).toContain("Artifact history");
    expect(plan).toContain("What evidence produced this document?");
    expect(plan).toContain("QUANTITY_SCHEDULE");
    expect(api).toContain("composeDeliverableSource");
    expect(api).toContain("deliverableReadiness");
    expect(api).toContain("compareArtifact");
    expect(api).toContain("bindCompositionEvidence");
    expect(plan).toContain("Bind governed MTO evidence");
  });
});
