import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("EOS-A12B My Engineering Day UX", () => {
  it("adds multi-project attention to the canonical workbench without a dashboard or chatbot-first shell", () => {
    const page = readApp("src/components/engineering/work-workspace.tsx");
    const api = readApp("src/app/api/engineering/work/route.ts");
    expect(page).toContain("My Engineering Day");
    expect(page).toContain("Do Now");
    expect(page).toContain("Waiting on Others");
    expect(page).toContain("Recently Ready");
    expect(page).toContain("Continue Work");
    expect(page).toContain("Start Engineering Work");
    expect(page).toContain("items need action");
    expect(page).not.toMatch(/productivity score =/i);
    expect(page).not.toContain("hours worked");
    expect(page).not.toContain("burndown");
    expect(api).toContain("engineeringDay");
    expect(api).toContain("acknowledgeAttention");
    expect(api).toContain("attention.rejectCallerClaims");
  });
});
