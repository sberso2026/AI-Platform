import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const WEB_SRC = resolve(__dirname, "..");

describe("II-2 operational web routes", () => {
  it("adds planning and execution pages on the hosted API", () => {
    expect(existsSync(resolve(WEB_SRC, "app/(platform)/engineering/apps/inspection-intelligence/plans/new/page.tsx"))).toBe(true);
    expect(
      existsSync(resolve(WEB_SRC, "app/(platform)/engineering/apps/inspection-intelligence/plans/[planId]/page.tsx")),
    ).toBe(true);
    expect(
      existsSync(
        resolve(WEB_SRC, "app/(platform)/engineering/apps/inspection-intelligence/sessions/[sessionId]/page.tsx"),
      ),
    ).toBe(true);
    const hosted = readFileSync(resolve(WEB_SRC, "app/api/engineering/inspection-intelligence/hosted/route.ts"), "utf8");
    expect(hosted).toContain("listPlans");
    expect(hosted).toContain("getSessionWorkspace");
    expect(hosted).toContain("start_session");
    expect(hosted).toContain("resume_session");
    expect(hosted).toContain('resource === "capabilities"');
    const client = readFileSync(resolve(WEB_SRC, "lib/inspection-intelligence/hosted-client.ts"), "utf8");
    expect(client).not.toContain("createServiceClient");
  });
});
