import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  createBusinessOS,
  implementsOwnAiStack,
  duplicateIntegrationStackDetected,
  ExternalWritesDisabled,
} from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { resolveEntitlementTarget } from "../lib/commerce/guards";

const API_ROOT = path.resolve(__dirname, "../app/api/business");

describe("BOS-12 Connectors and Hardening web wiring", () => {
  it("maps /business/integrations to business-os / business_os", () => {
    expect(resolveEntitlementTarget("/business/integrations")).toEqual({
      productKey: "business-os",
      featureKey: "business_os",
    });
  });

  it("does not expose an unrestricted proxy or generic write endpoint", () => {
    expect(implementsOwnAiStack).toBe(false);
    expect(duplicateIntegrationStackDetected).toBe(false);
    expect(ExternalWritesDisabled).toBe(true);
    const bos = createBusinessOS({} as SupabaseClient, createPlatformKernel({} as SupabaseClient));
    expect(bos.connectors).toBeDefined();
    expect(() => bos.connectors.proxyArbitraryUrl()).toThrow("unrestricted_external_proxy_forbidden");
    expect(() => bos.connectors.writeExternal()).toThrow("connector_write_forbidden");
    expect(fs.readFileSync(path.join(API_ROOT, "integrations", "proxy", "route.ts"), "utf8")).toContain(
      "unrestricted_external_proxy_forbidden",
    );
    expect(fs.readFileSync(path.join(API_ROOT, "integrations", "write", "route.ts"), "utf8")).toContain(
      "connector_write_forbidden",
    );
    expect(fs.readFileSync(path.join(API_ROOT, "integrations", "route.ts"), "utf8")).toContain(
      "business_os.connectors.view",
    );
  });

  it("keeps nested reads on view and management on manage", () => {
    expect(fs.readFileSync(path.join(API_ROOT, "integrations", "catalog", "route.ts"), "utf8")).toContain(
      "business_os.connectors.view",
    );
    for (const nested of [
      "configure",
      "revoke",
      "sync",
      "import-preview",
      "import-commit",
      "demo",
      "diagnostics",
      "oauth/start",
      "oauth/callback",
      "oauth/fixture",
    ]) {
      const file = fs.readFileSync(path.join(API_ROOT, "integrations", nested, "route.ts"), "utf8");
      expect(file).toContain("business_os.connectors.manage");
    }
  });

  it("renders catalog, history, import preview, and diagnostics with honest mode labels", () => {
    const page = fs.readFileSync(
      path.resolve(__dirname, "../app/(platform)/business/integrations/page.tsx"),
      "utf8",
    );
    for (const testId of [
      "bos-integrations-overview",
      "bos-integrations-catalog",
      "bos-integrations-history",
      "bos-integrations-import",
      "bos-integrations-diagnostics",
    ]) {
      expect(page).toContain(testId);
    }
    expect(page).toContain("READ ONLY");
    expect(page).toContain("FIXTURE/SANDBOX");
    expect(page).toContain("Connect Xero");
    expect(page).toContain("Connect Microsoft 365");
    expect(page).toContain("Connect HubSpot");
    expect(page).toContain("bos-consent-dialog");
    expect(page).toContain("bos-disconnect-dialog");
    expect(page).toContain("bos-browser-fixture-banner");
    expect(page).not.toMatch(/this fixture is live/i);
    expect(page).not.toMatch(/NEXT_PUBLIC_(XERO|MS365|HUBSPOT)_/);
    expect(page).toContain("LIVE");
    expect(page).toContain("DEGRADED");
    expect(page).toContain("REVOKED");
    expect(page).not.toMatch(/this fixture is live/i);
  });
});
