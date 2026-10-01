import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("EOS-A10C information requirements UI", () => {
  it("is action-oriented and does not open as a giant register or completeness percentage", () => {
    const page = readApp("src/components/engineering/information-requirement-workspace.tsx");
    const settings = readApp("src/app/(platform)/engineering/settings/information-requirements/page.tsx");
    expect(page).toContain("eos-select");
    expect(page).toContain("EngineeringProjectContextBar");
    expect(page).toContain("Needed by Me");
    expect(page).toContain("Blocking My Work");
    expect(page).toContain("Start Work");
    expect(page).toContain("Request Missing Information");
    expect(page).toContain("Handover package");
    expect(page).toContain("not a percentage");
    expect(page).toContain("Not a project readiness score");
    expect(settings).toContain("AAL2 is required");
    expect(settings).toContain("code-governed");
  });
});
