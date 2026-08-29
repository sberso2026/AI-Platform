import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { AuditService } from "@rtb/platform-core";
import { BosConnectorsService } from "./service";
import { createMemoryConnectorStore } from "./store";
import { BOS_CONNECTOR_ADAPTERS, createXeroAdapter } from "./adapters";
import { resolveXeroSecrets } from "./xero-secrets";
import { xeroSafeTelemetry } from "./xero-telemetry";
import { XERO_THREAT_MODEL } from "./xero-policy";
import { containsSecretFields, redactSecrets } from "./security";
import {
  XERO_CONNECTOR_IMPLEMENTED,
  XERO_LIVE_CERTIFICATION_EXECUTED,
  XERO_SECURITY_ARCHITECTURE_READY,
  assessBosLiveXeroEnvironment,
  bosLiveXeroCertified,
  bosProductionEligible,
  liveProviderCredentialsAvailable,
} from "../release";
import { canonicalDomainMutationBypass, crossTenantConnectorAccess, directAgentProviderAccess } from "../version";
import { clearBosCertificationEnv } from "../certification-env-harness";

const ROOT = resolve(import.meta.dirname, "../../../..");
const SCOPE = {
  tenantId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  workspaceId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  userId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
};
const OTHER = {
  tenantId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  workspaceId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
  userId: SCOPE.userId,
};
const HUMAN = { userId: SCOPE.userId, actorType: "human" as const };
const AGENT = { userId: SCOPE.userId, actorType: "agent" as const, agentId: "agent-1" };

function harness() {
  const kernel = createPlatformKernel({} as SupabaseClient);
  const audit = new AuditService({} as SupabaseClient);
  const store = createMemoryConnectorStore();
  const connectors = new BosConnectorsService({} as SupabaseClient, kernel, audit, { store });
  return { connectors, store };
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Xero security architecture", () => {
  it("keeps implementation separate from live certification", () => {
    clearBosCertificationEnv();
    expect(XERO_CONNECTOR_IMPLEMENTED).toBe(true);
    expect(XERO_SECURITY_ARCHITECTURE_READY).toBe(true);
    expect(XERO_LIVE_CERTIFICATION_EXECUTED).toBe(false);
    expect(bosLiveXeroCertified).toBe(false);
    expect(bosProductionEligible).toBe(false);
    expect(liveProviderCredentialsAvailable("xero")).toBe(false);
    expect(assessBosLiveXeroEnvironment()).toEqual({ status: "unavailable", reason: "no_live_configuration" });
    expect(XERO_THREAT_MODEL.map((row) => row.id)).toHaveLength(16);
    expect(directAgentProviderAccess).toBe(false);
    expect(crossTenantConnectorAccess).toBe(false);
    expect(canonicalDomainMutationBypass).toBe(false);
  });

  it("rejects inline secrets, browser public secrets, and agent provider access", async () => {
    const { connectors } = harness();
    await expect(
      connectors.configure(SCOPE, { connectorId: "xero", refreshToken: "rt" } as never, HUMAN),
    ).rejects.toThrow("secret_redaction_required");
    expect(containsSecretFields({ accessToken: "tok" })).toBe(true);
    expect(() => connectors.callProviderFromAgent()).toThrow("direct_provider_access_forbidden");
    await expect(connectors.configure(SCOPE, { connectorId: "xero", mode: "fixture" }, AGENT)).rejects.toThrow(
      "self_registration_forbidden",
    );
    vi.stubEnv("NEXT_PUBLIC_XERO_CLIENT_SECRET", "browser-secret");
    expect(() => liveProviderCredentialsAvailable("xero")).toThrow(/NEXT_PUBLIC/);
    expect(() => resolveXeroSecrets("sec")).toThrow("xero_browser_secret_forbidden");
  });

  it("does not ship NEXT_PUBLIC Xero secrets in web source", () => {
    const configure = readFileSync(
      resolve(ROOT, "apps/web/src/app/api/business/integrations/configure/route.ts"),
      "utf8",
    );
    const integrations = readFileSync(resolve(ROOT, "apps/web/src/app/(platform)/business/integrations/page.tsx"), "utf8");
    expect(`${configure}\n${integrations}`).not.toMatch(/NEXT_PUBLIC_XERO_/);
  });

  it("does not silently treat fixture records as live Xero data", async () => {
    const { connectors, store } = harness();
    const installed = await connectors.configure(
      SCOPE,
      { connectorId: "xero", secretId: "sec_123", mode: "live", expectedProviderOrgId: "xero-org-expected" },
      HUMAN,
    );
    expect(installed.effectiveMode).toBe("live");
    expect(installed.modeLabel).not.toBe("FIXTURE/SANDBOX");
    const run = await connectors.sync(SCOPE, { installationId: installed.id }, HUMAN);
    expect(run.status).toBe("failed");
    expect(run.errorCategory).toBe("xero_secret_retrieval_failed");
    const staged = await store.listStaging(SCOPE);
    expect(JSON.stringify(staged)).not.toContain("INV-1001");
    expect(staged.every((row) => row.becomesCanonical === false)).toBe(true);
  });

  it("marks live Xero unavailable without falling back to fixture mode", async () => {
    const { connectors } = harness();
    const row = await connectors.configure(SCOPE, { connectorId: "xero", mode: "live" }, HUMAN);
    expect(row.effectiveMode).toBe("live");
    expect(row.health).toBe("unavailable");
    expect(row.modeLabel).toBe("LIVE_UNAVAILABLE");
  });

  it("rejects cross-tenant and cross-workspace connector access", async () => {
    const { connectors } = harness();
    const home = await connectors.configure(SCOPE, { connectorId: "xero", mode: "fixture" }, HUMAN);
    await connectors.configure(OTHER, { connectorId: "xero", mode: "fixture" }, HUMAN);
    await expect(connectors.sync(OTHER, { installationId: home.id }, HUMAN)).rejects.toThrow(
      "connector installation not found",
    );
    await expect(connectors.revoke(OTHER, home.id, HUMAN)).rejects.toThrow("connector installation not found");
  });

  it("revokes Xero installations and blocks later sync", async () => {
    const { connectors } = harness();
    const installed = await connectors.configure(SCOPE, { connectorId: "xero", mode: "fixture" }, HUMAN);
    const revoked = await connectors.revoke(SCOPE, installed.id, HUMAN);
    expect(revoked.health).toBe("revoked");
    expect(revoked.secretId).toBeNull();
    expect(revoked.provenance.disconnectedAt).toBeTruthy();
    await expect(connectors.sync(SCOPE, { installationId: installed.id }, HUMAN)).rejects.toThrow("connector_revoked");
  });

  it("redacts tokens and payloads from telemetry", () => {
    const safe = xeroSafeTelemetry({
      provider: "xero",
      operation: "getOrganisation",
      authorization: "Bearer access-token-live-value",
      refresh_token: "refresh-secret",
      payload: { Total: 100 },
      status: 200,
    });
    expect(safe.provider).toBe("xero");
    expect(safe.status).toBe(200);
    expect(safe.authorization).toBe("[redacted]");
    expect(safe.refresh_token).toBe("[redacted]");
    expect(safe.payload).toBe("[redacted]");
    expect(JSON.stringify(redactSecrets({ accessToken: "tok", tenantId: SCOPE.tenantId }))).not.toContain("tok");
  });

  it("fails closed on partial live Xero credentials without printing secrets", () => {
    clearBosCertificationEnv();
    vi.stubEnv("XERO_CLIENT_ID", "client-fixture");
    expect(() => liveProviderCredentialsAvailable("xero")).toThrow(/incomplete/);
    try {
      liveProviderCredentialsAvailable("xero");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      expect(message).not.toContain("client-fixture");
    }
  });

  it("keeps GET-only live adapter from mixing fixture pages", async () => {
    const adapter = createXeroAdapter();
    const live = await adapter.readPage({
      cursor: null,
      secretId: null,
      mode: "live",
      tenantId: SCOPE.tenantId,
      workspaceId: SCOPE.workspaceId,
      installationId: "install-1",
      expectedProviderOrgId: "org",
    });
    expect(live.records).toEqual([]);
    expect(live.errorCategory).toBe("xero_missing_secret");
    expect(JSON.stringify(live)).not.toContain("INV-1001");
    const fixture = await BOS_CONNECTOR_ADAPTERS.xero.readPage({
      cursor: null,
      secretId: null,
      mode: "fixture",
    });
    expect(fixture.records.some((row) => row.externalSourceId === "xero-inv-1001")).toBe(true);
  });
});
