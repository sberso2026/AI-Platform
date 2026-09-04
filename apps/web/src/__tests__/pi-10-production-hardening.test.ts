import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ENGINEERING_PAGE_POLICIES } from "@rtb/platform-commerce";

const WEB_SRC = resolve(__dirname, "..");
const PI_SRC = resolve(__dirname, "../../../../packages/project-intelligence/src");

function read(rel: string): string {
  return readFileSync(resolve(WEB_SRC, rel), "utf8");
}

describe("PI-10 production hardening freeze", () => {
  it("does not add a new intelligence domain or PI-11", () => {
    const shell = read("components/engineering/project-intelligence-shell.tsx");
    expect(shell).toContain("Overview");
    expect(shell).toContain("Ask Project Intelligence");
    expect(shell).toContain("Reports");
    expect(shell).toContain("Administration / Diagnostics");
    expect(shell).not.toContain("PI-11");
    const reporting = readFileSync(resolve(PI_SRC, "project-reporting/ownership.ts"), "utf8");
    expect(reporting).toContain("PI_10_IMPLEMENTED = true");
    expect(reporting).toContain("PI_11_IMPLEMENTED = false");
    expect(reporting).toContain("PI_REPORTING_REAL_MODEL_CERTIFIED = true");
    expect(ENGINEERING_PAGE_POLICIES["/engineering/apps/project-intelligence/reports"]?.applicationKey).toBe(
      "project_intelligence",
    );
    expect(ENGINEERING_PAGE_POLICIES["/engineering/apps/project-intelligence/reports"]?.productKey).not.toBe("business_os");
  });

  it("keeps report overlay mock refusal on the Director run provider only", () => {
    const hosted = read("lib/project-intelligence/project-reporting-service.ts");
    expect(hosted).toContain("reportOverlayIsMockSubstitution(answer.aiProvider, answer.aiAvailable)");
    expect(hosted).not.toContain("isMockProvider(answer.runtime.providerType)");
    expect(hosted).not.toContain("new OpenAI");
  });
});
