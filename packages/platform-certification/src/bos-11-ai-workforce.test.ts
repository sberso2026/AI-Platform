import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BUSINESS_OS_RUNTIME_MANIFEST,
  createBusinessOS,
  implementsOwnAiStack,
  duplicateAgentRuntimeDetected,
  autonomousApprovalEnabled,
  directProviderAccess,
  unrestrictedGraphAccess,
  canonicalDomainMutationBypass,
  crossTenantAgentAccess,
} from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("BOS-11 AI Workforce", () => {
  it("reuses Kernel agent/policy stack and forbids a second AI runtime", () => {
    expect(implementsOwnAiStack).toBe(false);
    expect(duplicateAgentRuntimeDetected).toBe(false);
    expect(autonomousApprovalEnabled).toBe(false);
    expect(directProviderAccess).toBe(false);
    expect(unrestrictedGraphAccess).toBe(false);
    expect(canonicalDomainMutationBypass).toBe(false);
    expect(crossTenantAgentAccess).toBe(false);
    const bos = createBusinessOS({} as never, createPlatformKernel({} as never));
    expect(bos.status.snapshot().phase).toBe("BOS-12");
    expect(bos.aiWorkforce).toBeDefined();
    expect(bos.capabilities.isImplemented("ai_workforce")).toBe(true);
    expect(bos.aiWorkforce.contract().implemented).toBe(true);
    expect(bos.aiWorkforce.contract().implementsOwnAiStack).toBe(false);
    expect(bos.aiWorkforce.contract().duplicateAgentRuntimeDetected).toBe(false);
    expect(() => bos.aiWorkforce.executeArbitrary()).toThrow("unrestricted_agent_execution_forbidden");
    expect(() => bos.aiWorkforce.callModelProvider()).toThrow("direct_provider_access_forbidden");
    expect(() => bos.aiWorkforce.mutateCanonicalRecord()).toThrow("canonical_domain_mutation_forbidden");
    expect(typeof createPlatformKernel({} as never).aiDirector.upsertCatalogAgent).toBe("function");
  });

  it("registers /business/ai-workforce and bounded APIs", () => {
    expect(
      BUSINESS_OS_RUNTIME_MANIFEST.routes?.some(
        (r) => r.path === "/business/ai-workforce" && r.title === "AI Workforce",
      ),
    ).toBe(true);
    const page = readFileSync(resolve(ROOT, "apps/web/src/app/(platform)/business/ai-workforce/page.tsx"), "utf8");
    expect(page).toContain("AI Workforce");
    expect(page).toContain("bos-workforce-overview");
    expect(page).toContain("Advisory authority");
    expect(page).not.toMatch(/chain-of-thought/i);
    expect(existsSync(resolve(ROOT, "apps/web/src/app/api/business/ai-workforce/route.ts"))).toBe(true);
    expect(existsSync(resolve(ROOT, "apps/web/src/app/api/business/ai-workforce/execute/route.ts"))).toBe(true);
    const execute = readFileSync(resolve(ROOT, "apps/web/src/app/api/business/ai-workforce/execute/route.ts"), "utf8");
    expect(execute).toContain("unrestricted_agent_execution_forbidden");
  });

  it("does not create a second agents table", () => {
    const migration = resolve(ROOT, "supabase/migrations/20260819160000_batch_107_business_os_ai_workforce.sql");
    expect(existsSync(migration)).toBe(true);
    const sql = readFileSync(migration, "utf8");
    expect(sql).toContain("business_os_workforce_installations");
    expect(sql).toContain("REFERENCES agents(id)");
    expect(sql.toLowerCase()).not.toContain("create table if not exists agents");
    expect(sql.toLowerCase()).not.toContain("create table if not exists agent_runs");
  });
});
