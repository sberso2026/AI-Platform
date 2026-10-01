import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("EOS-A11A work generator UI", () => {
  it("is action-oriented around Start Engineering Work rather than an activity dashboard", () => {
    const page = readApp("src/components/engineering/work-workspace.tsx");
    const plan = readApp("src/app/(platform)/engineering/work/plans/[id]/page.tsx");
    expect(page).toContain("Start Engineering Work");
    expect(page).toContain("Continue Work");
    expect(page).toContain("What can EOS prepare for me?");
    expect(page).toContain("Engineering day summary");
    expect(page).toContain("not an employee productivity score");
    expect(page).toContain("EngineeringProjectContextBar");
    expect(page).not.toMatch(/keystroke|idle time|productivity score =/i);
    expect(plan).toContain("Start Engineering Work");
    expect(plan).toContain("Refresh Engineering Context");
    expect(plan).toContain("Governing Information");
    expect(plan).toContain("Generate Calculation Workbook");
    expect(plan).toContain("Download");
    expect(plan).toContain("View Provenance");
    expect(plan).toContain("not engineering approval");
  });
});
