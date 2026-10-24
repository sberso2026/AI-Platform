import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("EOS-A12A unified workbench UX", () => {
  it("makes /engineering/work the task-oriented daily engineer surface", () => {
    const page = readApp("src/components/engineering/work-workspace.tsx");
    const home = readApp("src/app/(platform)/engineering/page.tsx");
    const plan = readApp("src/app/(platform)/engineering/work/plans/[id]/page.tsx");
    const settings = readApp("src/app/(platform)/engineering/settings/templates/page.tsx");
    expect(page).toContain("Unified Engineering Workbench");
    expect(page).toContain("Start Engineering Work");
    expect(page).toContain("Continue Work");
    expect(page).toContain("Governing Information");
    expect(page).toContain("Ask EOS");
    expect(page).toContain("No active engineering work for this project.");
    expect(page).not.toMatch(/productivity score =/i);
    expect(page).not.toContain("keystroke");
    expect(home).toContain("Open Engineering Workbench");
    expect(home).toContain("/engineering/work");
    expect(plan).toContain("Using EOS Default Template");
    expect(plan).not.toContain('templateCode: "EAT-IMPACT-REPORT"');
    expect(settings).toContain("OFFICIAL_TEMPLATE_REQUIRED");
    expect(settings).toContain("eos-select");
  });
});
