import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { AuditService } from "@rtb/platform-core";
import { BosConnectorsService } from "./service";
import { createMemoryConnectorStore } from "./store";
import { BOS_CONNECTOR_ADAPTERS, createMicrosoft365Adapter } from "./adapters";
import { resolveMs365Secrets } from "./m365-secrets";
import { m365SafeTelemetry } from "./m365-telemetry";
import { MS365_THREAT_MODEL, buildMs365AuthorizeUrl } from "./m365-policy";
import { containsSecretFields, redactSecrets } from "./security";
import {
  M365_CONNECTOR_IMPLEMENTED,
  M365_LIVE_CERTIFICATION_EXECUTED,
  M365_SECURITY_ARCHITECTURE_READY,
  assessBosLiveMicrosoft365Environment,
  bosLiveMicrosoft365Certified,
  bosLiveXeroCertified,
  bosProductionEligible,
  liveProviderCredentialsAvailable,
  XERO_CONNECTOR_IMPLEMENTED,
  XERO_SECURITY_ARCHITECTURE_READY,
} from "../release";
import { canonicalDomainMutationBypass, crossTenantConnectorAccess, directAgentProviderAccess } from "../version";
import { clearBosCertificationEnv } from "../certification-env-harness";

const ROOT = resolve(import.meta.dirname, "../../../..");
const TENANT = "11111111-1111-4111-8111-111111111111";
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

describe("Microsoft 365 security architecture", () => {
  it("keeps implementation separate from live certification and preserves Xero architecture flags", () => {
    clearBosCertificationEnv();
    expect(M365_CONNECTOR_IMPLEMENTED).toBe(true);
    expect(M365_SECURITY_ARCHITECTURE_READY).toBe(true);
    expect(M365_LIVE_CERTIFICATION_EXECUTED).toBe(false);
    expect(bosLiveMicrosoft365Certified).toBe(false);
    expect(bosProductionEligible).toBe(true);
    expect(XERO_CONNECTOR_IMPLEMENTED).toBe(true);
    expect(XERO_SECURITY_ARCHITECTURE_READY).toBe(true);
    expect(bosLiveXeroCertified).toBe(false);
    expect(liveProviderCredentialsAvailable("microsoft_365")).toBe(false);
    expect(assessBosLiveMicrosoft365Environment()).toEqual({ status: "unavailable", reason: "no_live_configuration" });
    expect(MS365_THREAT_MODEL.map((row) => row.id)).toHaveLength(21);
    expect(directAgentProviderAccess).toBe(false);
    expect(crossTenantConnectorAccess).toBe(false);
    expect(canonicalDomainMutationBypass).toBe(false);
  });

  it("requires explicit human opt-in and rejects inline, browser, and agent secrets", async () => {
    const { connectors } = harness();
    await expect(
      connectors.configure(SCOPE, { connectorId: "microsoft_365", refreshToken: "rt" } as never, HUMAN),
    ).rejects.toThrow("secret_redaction_required");
    expect(containsSecretFields({ accessToken: "tok" })).toBe(true);
    expect(() => connectors.callProviderFromAgent()).toThrow("direct_provider_access_forbidden");
    await expect(connectors.configure(SCOPE, { connectorId: "microsoft_365", mode: "fixture" }, AGENT)).rejects.toThrow(
      "self_registration_forbidden",
    );
    vi.stubEnv("NEXT_PUBLIC_MS365_CLIENT_SECRET", "browser-secret");
    expect(() => liveProviderCredentialsAvailable("microsoft_365")).toThrow(/NEXT_PUBLIC/);
    expect(() => resolveMs365Secrets("sec")).toThrow("m365_browser_secret_forbidden");
    const authorize = buildMs365AuthorizeUrl({
      clientId: "public-client-id",
      tenantId: TENANT,
      redirectUri: "http://localhost:8787/callback",
      state: "state-1",
    });
    expect(authorize).not.toMatch(/client_secret|refresh_token/);
  });

  it("does not ship NEXT_PUBLIC Microsoft secrets in web source", () => {
    const configure = readFileSync(
      resolve(ROOT, "apps/web/src/app/api/business/integrations/configure/route.ts"),
      "utf8",
    );
    const integrations = readFileSync(resolve(ROOT, "apps/web/src/app/(platform)/business/integrations/page.tsx"), "utf8");
    expect(`${configure}\n${integrations}`).not.toMatch(/NEXT_PUBLIC_MS365_/);
  });

  it("does not silently treat fixture records as live Microsoft 365 data", async () => {
    const { connectors, store } = harness();
    const installed = await connectors.configure(
      SCOPE,
      { connectorId: "microsoft_365", secretId: "sec_123", mode: "live", expectedProviderOrgId: TENANT },
      HUMAN,
    );
    expect(installed.effectiveMode).toBe("live");
    expect(installed.modeLabel).not.toBe("FIXTURE/SANDBOX");
    expect(installed.connectionState).toBe("CONNECTING");
    const run = await connectors.sync(SCOPE, { installationId: installed.id }, HUMAN);
    expect(run.status).toBe("failed");
    expect(run.errorCategory).toBe("m365_secret_retrieval_failed");
    const staged = await store.listStaging(SCOPE);
    expect(JSON.stringify(staged)).not.toContain("m365-event-1");
    expect(JSON.stringify(staged)).not.toContain("Quarterly review");
    expect(staged.every((row) => row.becomesCanonical === false)).toBe(true);
  });

  it("marks live Microsoft 365 unavailable without falling back to fixture mode", async () => {
    const { connectors } = harness();
    const row = await connectors.configure(SCOPE, { connectorId: "microsoft_365", mode: "live" }, HUMAN);
    expect(row.effectiveMode).toBe("live");
    expect(row.health).toBe("unavailable");
    expect(row.modeLabel).toBe("LIVE_UNAVAILABLE");
    expect(row.connectionState).toBe("ERROR");
  });

  it("rejects cross-tenant and cross-workspace connector access", async () => {
    const { connectors } = harness();
    const home = await connectors.configure(SCOPE, { connectorId: "microsoft_365", mode: "fixture" }, HUMAN);
    await connectors.configure(OTHER, { connectorId: "microsoft_365", mode: "fixture" }, HUMAN);
    await expect(connectors.sync(OTHER, { installationId: home.id }, HUMAN)).rejects.toThrow(
      "connector installation not found",
    );
    await expect(connectors.revoke(OTHER, home.id, HUMAN)).rejects.toThrow("connector installation not found");
  });

  it("revokes Microsoft 365 installations and blocks later sync", async () => {
    const { connectors } = harness();
    const installed = await connectors.configure(SCOPE, { connectorId: "microsoft_365", mode: "fixture" }, HUMAN);
    expect(installed.connectionState).toBe("CONNECTED");
    const revoked = await connectors.revoke(SCOPE, installed.id, HUMAN);
    expect(revoked.health).toBe("revoked");
    expect(revoked.secretId).toBeNull();
    expect(revoked.connectionState).toBe("DISCONNECTED");
    expect(revoked.provenance.disconnectedAt).toBeTruthy();
    await expect(connectors.sync(SCOPE, { installationId: installed.id }, HUMAN)).rejects.toThrow("connector_revoked");
  });

  it("redacts tokens, mail bodies, and file content from telemetry", () => {
    const safe = m365SafeTelemetry({
      provider: "microsoft365",
      operation: "getSignedInUser",
      authorization: "Bearer access-token-live-value",
      refresh_token: "refresh-secret",
      body: "email body",
      attendees: [{ address: "a@contoso.test" }],
      content: "file-bytes",
      status: 200,
    });
    expect(safe.provider).toBe("microsoft365");
    expect(safe.status).toBe(200);
    expect(safe.authorization).toBe("[redacted]");
    expect(safe.refresh_token).toBe("[redacted]");
    expect(safe.body).toBe("[redacted]");
    expect(safe.attendees).toBe("[redacted]");
    expect(safe.content).toBe("[redacted]");
    expect(JSON.stringify(redactSecrets({ accessToken: "tok", tenantId: SCOPE.tenantId }))).not.toContain("tok");
  });

  it("fails closed on partial live Microsoft credentials without printing secrets", () => {
    clearBosCertificationEnv();
    vi.stubEnv("MS365_CLIENT_ID", "client-fixture");
    expect(() => liveProviderCredentialsAvailable("microsoft_365")).toThrow(/incomplete/);
    try {
      liveProviderCredentialsAvailable("microsoft_365");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      expect(message).not.toContain("client-fixture");
    }
  });

  it("keeps GET-only live adapter from mixing fixture pages", async () => {
    const adapter = createMicrosoft365Adapter();
    const live = await adapter.readPage({
      cursor: null,
      secretId: null,
      mode: "live",
      tenantId: SCOPE.tenantId,
      workspaceId: SCOPE.workspaceId,
      installationId: "install-1",
      expectedProviderOrgId: TENANT,
    });
    expect(live.records).toEqual([]);
    expect(live.errorCategory).toBe("m365_missing_secret");
    expect(JSON.stringify(live)).not.toContain("Quarterly review");
    const fixture = await BOS_CONNECTOR_ADAPTERS.microsoft_365.readPage({
      cursor: null,
      secretId: null,
      mode: "fixture",
    });
    expect(fixture.records.some((row) => row.externalSourceId === "m365-event-1")).toBe(true);
    expect(() => BOS_CONNECTOR_ADAPTERS.microsoft_365.write()).toThrow("connector_write_forbidden");
  });
});
