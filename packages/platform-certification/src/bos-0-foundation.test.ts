import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  BUSINESS_OS_RUNTIME_MANIFEST,
  createBusinessOS,
  implementsOwnAiStack,
  BUSINESS_OS_FEATURE_KEY,
} from "@rtb/business-os";
import { OPERATING_SYSTEMS } from "@rtb/platform-core";
import { createPlatformKernel } from "@rtb/platform-kernel";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("BOS-0 Business OS foundation", () => {
  it("creates the business-os package with canonical identity", () => {
    expect(existsSync(resolve(ROOT, "packages/business-os/package.json"))).toBe(true);
    expect(BUSINESS_OS_RUNTIME_MANIFEST.id).toBe("business");
    expect(BUSINESS_OS_FEATURE_KEY).toBe("business_os");
    expect(implementsOwnAiStack).toBe(false);
  });

  it("does not flip catalog coming_soon and does not embed SQL in the OS factory", () => {
    expect(OPERATING_SYSTEMS.find((os) => os.id === "business")?.status).toBe("coming_soon");
    expect(BUSINESS_OS_RUNTIME_MANIFEST.catalogStatus).toBe("coming_soon");
    const files = readFileSync(resolve(ROOT, "packages/business-os/src/business-os.ts"), "utf8");
    expect(files).not.toMatch(/create table/i);
  });

  it("wires createBusinessOS through Platform Kernel", () => {
    const bos = createBusinessOS({} as never, createPlatformKernel({} as never));
    expect(bos.status.configuration().kernelServices.aiDirector).toBe(true);
    expect(bos.capabilities.list().filter((c) => c.implemented).map((c) => c.id)).toEqual([
      "owner_command",
      "financial_intelligence",
      "growth_intelligence",
      "revenue_execution",
      "customer_intelligence",
      "profit_intelligence",
      "work_operations",
    ]);
  });
});
