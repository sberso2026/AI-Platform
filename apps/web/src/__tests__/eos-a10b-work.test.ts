import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("EOS-A10B work UI", () => {
  it("uses readable EOS selectors and does not present a raw event log or productivity score", () => {
    const page = readApp("src/components/engineering/work-workspace.tsx");
    const settings = readApp("src/app/(platform)/engineering/settings/work-context/page.tsx");
    const detail = readApp("src/app/(platform)/engineering/work/[id]/page.tsx");
    expect(page).toContain("eos-select");
    expect(page).toContain("EngineeringProjectContextBar");
    expect(page).toContain("Engineering day summary");
    expect(page).toContain("not an employee productivity score");
    expect(page).not.toMatch(/keystroke|idle time|productivity score =/i);
    expect(settings).toContain("eos-select");
    expect(settings).toContain("AAL2 is required");
    expect(detail).toContain("Capture reason");
    expect(detail).toContain("not show keystrokes");
  });
});
