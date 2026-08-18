import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createBusinessOS, implementsOwnAiStack } from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { resolveEntitlementTarget } from "../lib/commerce/guards";

const API_ROOT = path.resolve(__dirname, "../app/api/business");

function readRoute(segment: string): string {
  return fs.readFileSync(path.join(API_ROOT, segment, "route.ts"), "utf8");
}

describe("BOS-1 Owner Command Centre web wiring", () => {
  it("keeps /business on business-os / business_os", () => {
    expect(resolveEntitlementTarget("/business")).toEqual({
      productKey: "business-os",
      featureKey: "business_os",
    });
  });

  it("does not add a second AI stack", () => {
    expect(implementsOwnAiStack).toBe(false);
    const bos = createBusinessOS({} as SupabaseClient, createPlatformKernel({} as SupabaseClient));
    expect(bos.ownerCommand).toBeDefined();
  });

  it("gates owner-command APIs with view/manage permissions", () => {
    expect(readRoute("command")).toContain("business_os.owner_command.view");
    expect(readRoute("health")).toContain("business_os.owner_command.view");
    expect(readRoute("brief")).toContain("business_os.owner_command.view");
    expect(readRoute("kpis")).toContain("business_os.owner_command.view");
    expect(readRoute("kpis")).toContain("business_os.owner_command.manage");
    expect(readRoute("signals")).toContain("business_os.owner_command.manage");
    expect(readRoute("recommendations")).toContain("business_os.owner_command.manage");
    expect(readRoute("decisions")).toContain("business_os.owner_command.manage");
    expect(readRoute("actions")).toContain("business_os.owner_command.manage");
    expect(readRoute("demo")).toContain("business_os.owner_command.manage");
    expect(readRoute("status")).toContain("withBusinessApi");
  });

  it("does not expose external write or generic mutation endpoints", () => {
    for (const segment of ["command", "health", "brief", "kpis", "signals", "recommendations", "decisions", "actions", "demo"]) {
      const src = readRoute(segment);
      expect(src).not.toMatch(/sendMail|stripe|crm|invoice|payment/i);
      expect(src).not.toContain("export const DELETE");
    }
  });
});
