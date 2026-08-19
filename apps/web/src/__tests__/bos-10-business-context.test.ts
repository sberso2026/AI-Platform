import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createBusinessOS, implementsOwnAiStack } from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { resolveEntitlementTarget } from "../lib/commerce/guards";

const API_ROOT = path.resolve(__dirname, "../app/api/business");

describe("BOS-10 Business Context web wiring", () => {
  it("maps /business/context to business-os / business_os", () => {
    expect(resolveEntitlementTarget("/business/context")).toEqual({
      productKey: "business-os",
      featureKey: "business_os",
    });
  });

  it("does not expose a raw graph query or second AI stack", () => {
    expect(implementsOwnAiStack).toBe(false);
    const bos = createBusinessOS({} as SupabaseClient, createPlatformKernel({} as SupabaseClient));
    expect(bos.businessContextGraph).toBeDefined();
    expect(() => bos.businessContextGraph.executeRawGraphQuery()).toThrow("unrestricted_graph_query_forbidden");
    const query = fs.readFileSync(path.join(API_ROOT, "context", "query", "route.ts"), "utf8");
    expect(query).toContain("unrestricted_graph_query_forbidden");
    expect(query).toContain("business_os.business_context.manage");
    expect(fs.readFileSync(path.join(API_ROOT, "context", "route.ts"), "utf8")).toContain(
      "business_os.business_context.view",
    );
    expect(fs.readFileSync(path.join(API_ROOT, "context", "rebuild", "route.ts"), "utf8")).toContain(
      "business_os.business_context.manage",
    );
  });

  it("keeps nested reads on view and rebuild/diagnostics on manage", () => {
    for (const nested of ["entity", "neighbourhood", "relationships", "status", "explain"]) {
      const file = fs.readFileSync(path.join(API_ROOT, "context", nested, "route.ts"), "utf8");
      expect(file).toContain("business_os.business_context.view");
    }
    for (const nested of ["demo", "rebuild", "diagnostics"]) {
      const file = fs.readFileSync(path.join(API_ROOT, "context", nested, "route.ts"), "utf8");
      expect(file).toContain("business_os.business_context.manage");
    }
  });

  it("renders context search, entity context, and data quality", () => {
    const page = fs.readFileSync(
      path.resolve(__dirname, "../app/(platform)/business/context/page.tsx"),
      "utf8",
    );
    for (const testId of ["bos-context-search", "bos-context-entity", "bos-context-quality", "bos-context-relationships"]) {
      expect(page).toContain(testId);
    }
    expect(page).toContain("A link is not a cause");
    expect(page).not.toMatch(/chain-of-thought/i);
  });
});
