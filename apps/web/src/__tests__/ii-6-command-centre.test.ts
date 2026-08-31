import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ENGINEERING_PAGE_POLICIES } from "@rtb/platform-commerce";

const WEB_SRC = resolve(__dirname, "..");

function read(rel: string): string {
  return readFileSync(resolve(WEB_SRC, rel), "utf8");
}

describe("II-6 Inspection Command Centre web surface", () => {
  it("renders Command Centre on landing and dedicated route with drill-down and provenance", () => {
    expect(
      existsSync(resolve(WEB_SRC, "app/(platform)/engineering/apps/inspection-intelligence/command-centre/page.tsx")),
    ).toBe(true);
    const landing = read("app/(platform)/engineering/apps/inspection-intelligence/page.tsx");
    expect(landing).toContain("InspectionCommandCentre");
    expect(landing).toContain("inspection-intelligence-v1-ready");
    const ui = read("components/engineering/inspection-command-centre.tsx");
    expect(ui).toContain('data-testid="inspection-command-centre"');
    expect(ui).toContain("/engineering/apps/inspection-intelligence/plans");
    expect(ui).toContain("/engineering/apps/inspection-intelligence/sessions");
    expect(ui).toContain("/engineering/apps/inspection-intelligence/defects");
    expect(ui).toContain("/engineering/apps/inspection-intelligence/evidence");
    expect(ui).toContain("/engineering/apps/inspection-intelligence/condition");
    expect(ui).toContain("/engineering/apps/inspection-intelligence/actions");
    expect(ui).toContain("/engineering/apps/inspection-intelligence/history");
    expect(ui).toContain("/engineering/apps/inspection-intelligence/reports");
    expect(ui).toContain("/engineering/apps/inspection-intelligence/engineer");
    expect(ui).toContain("command-centre-ai-boundary");
    expect(ui).toContain("data-ai-derived");
    expect(ENGINEERING_PAGE_POLICIES["/engineering/apps/inspection-intelligence/command-centre"]?.applicationKey).toBe(
      "inspection_intelligence",
    );
    const hosted = read("app/api/engineering/inspection-intelligence/hosted/route.ts");
    expect(hosted).toContain("command_centre");
    expect(hosted).not.toContain("createServiceClient");
    const shell = read("components/engineering/inspection-intelligence-shell.tsx");
    expect(shell).toContain("Command Centre");
  });
});
