import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BUSINESS_OS_RUNTIME_MANIFEST,
  createBusinessOS,
  implementsOwnAiStack,
  duplicateIntegrationStackDetected,
  duplicateAgentRuntimeDetected,
  duplicateKnowledgeGraphDetected,
  ExternalWritesDisabled,
  NoVendorHardDependency,
  agentRegistryMismatchBlocksExecution,
  suppressedIdentityReconstructionBlocked,
  crossTenantConnectorAccess,
  directAgentProviderAccess,
  unrestrictedExternalProxy,
} from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("BOS-12 Connectors and Hardening", () => {
  it("certifies optional connectors over Platform without a second stack", () => {
    expect(implementsOwnAiStack).toBe(false);
    expect(duplicateIntegrationStackDetected).toBe(false);
    expect(duplicateAgentRuntimeDetected).toBe(false);
    expect(duplicateKnowledgeGraphDetected).toBe(false);
    expect(ExternalWritesDisabled).toBe(true);
    expect(NoVendorHardDependency).toBe(true);
    expect(agentRegistryMismatchBlocksExecution).toBe(true);
    expect(suppressedIdentityReconstructionBlocked).toBe(true);
    expect(crossTenantConnectorAccess).toBe(false);
    expect(directAgentProviderAccess).toBe(false);
    expect(unrestrictedExternalProxy).toBe(false);
    const bos = createBusinessOS({} as never, createPlatformKernel({} as never));
    expect(bos.status.snapshot().phase).toBe("BOS-14");
    expect(bos.capabilities.list()).toHaveLength(18);
    expect(bos.capabilities.isImplemented("ai_workforce")).toBe(true);
    expect(bos.connectors.contract().implemented).toBe(true);
    expect(bos.connectors.contract().implementsOwnAiStack).toBe(false);
    expect(bos.connectors.status().requiredForBusinessOs).toBe(false);
    expect(() => bos.connectors.writeExternal()).toThrow("connector_write_forbidden");
    expect(() => bos.connectors.proxyArbitraryUrl()).toThrow("unrestricted_external_proxy_forbidden");
    expect(() => bos.connectors.callProviderFromAgent()).toThrow("direct_provider_access_forbidden");
    expect(() => bos.aiWorkforce.callModelProvider()).toThrow("direct_provider_access_forbidden");
  });

  it("registers /business/integrations and bounded APIs", () => {
    expect(
      BUSINESS_OS_RUNTIME_MANIFEST.routes?.some(
        (r) => r.path === "/business/integrations" && r.title === "Integrations",
      ),
    ).toBe(true);
    const page = readFileSync(resolve(ROOT, "apps/web/src/app/(platform)/business/integrations/page.tsx"), "utf8");
    expect(page).toContain("READ ONLY");
    expect(page).toContain("FIXTURE/SANDBOX");
    expect(page).toContain("bos-integrations-overview");
    expect(page).not.toMatch(/this fixture is live/i);
    expect(existsSync(resolve(ROOT, "apps/web/src/app/api/business/integrations/route.ts"))).toBe(true);
    expect(existsSync(resolve(ROOT, "apps/web/src/app/api/business/integrations/proxy/route.ts"))).toBe(true);
    expect(existsSync(resolve(ROOT, "apps/web/src/app/api/business/integrations/write/route.ts"))).toBe(true);
    expect(readFileSync(resolve(ROOT, "apps/web/src/app/api/business/integrations/proxy/route.ts"), "utf8")).toContain(
      "unrestricted_external_proxy_forbidden",
    );
    expect(readFileSync(resolve(ROOT, "apps/web/src/app/api/business/integrations/write/route.ts"), "utf8")).toContain(
      "connector_write_forbidden",
    );
  });

  it("does not create a second secrets or jobs table", () => {
    const migration = resolve(ROOT, "supabase/migrations/20260819170000_batch_108_business_os_connectors_hardening.sql");
    expect(existsSync(migration)).toBe(true);
    const sql = readFileSync(migration, "utf8");
    expect(sql).toContain("business_os_connector_installations");
    expect(sql).toContain("secret_id text");
    expect(sql.toLowerCase()).not.toContain("create table if not exists secrets");
    expect(sql.toLowerCase()).not.toContain("create table if not exists agents");
    expect(sql.toLowerCase()).not.toContain("create table if not exists jobs");
  });
});
