import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { AuditService } from "@rtb/platform-core";
import { BosConnectorsService } from "./service";
import { createMemoryConnectorStore } from "./store";
import { BOS_CONNECTOR_ADAPTERS, createHubSpotAdapter } from "./adapters";
import { resolveHubSpotSecrets } from "./hubspot-secrets";
import { hubspotSafeTelemetry } from "./hubspot-telemetry";
import { HUBSPOT_SCOPE_MINIMISATION_PASS, HUBSPOT_THREAT_MODEL, HUBSPOT_CURRENT_OAUTH_CONTRACT_VERIFIED, buildHubSpotAuthorizeUrl } from "./hubspot-policy";
import { containsSecretFields, redactSecrets } from "./security";
import { reconstructableSuppressedIdentityLeak } from "./suppression";
import {
  HUBSPOT_CONNECTOR_IMPLEMENTED,
  HUBSPOT_LIVE_CERTIFICATION_EXECUTED,
  HUBSPOT_SECURITY_ARCHITECTURE_READY,
  M365_CONNECTOR_IMPLEMENTED,
  M365_SECURITY_ARCHITECTURE_READY,
  XERO_CONNECTOR_IMPLEMENTED,
  XERO_SECURITY_ARCHITECTURE_READY,
  assessBosLiveHubSpotEnvironment,
  bosLiveHubSpotCertified,
  bosLiveMicrosoft365Certified,
  bosLiveXeroCertified,
  bosProductionEligible,
  liveProviderCredentialsAvailable,
} from "../release";
import { canonicalDomainMutationBypass, crossTenantConnectorAccess, directAgentProviderAccess } from "../version";
import { clearBosCertificationEnv } from "../certification-env-harness";

const ROOT = resolve(import.meta.dirname, "../../../..");
const PORTAL = "12345678";
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

describe("HubSpot security architecture", () => {
  it("keeps implementation separate from live certification and preserves Xero/M365 architecture flags", () => {
    clearBosCertificationEnv();
    expect(HUBSPOT_CONNECTOR_IMPLEMENTED).toBe(true);
    expect(HUBSPOT_SECURITY_ARCHITECTURE_READY).toBe(true);
    expect(HUBSPOT_LIVE_CERTIFICATION_EXECUTED).toBe(false);
    expect(HUBSPOT_SCOPE_MINIMISATION_PASS).toBe(true);
    expect(HUBSPOT_CURRENT_OAUTH_CONTRACT_VERIFIED).toBe(true);
    expect(bosLiveHubSpotCertified).toBe(false);
    expect(bosProductionEligible).toBe(false);
    expect(XERO_CONNECTOR_IMPLEMENTED).toBe(true);
    expect(XERO_SECURITY_ARCHITECTURE_READY).toBe(true);
    expect(bosLiveXeroCertified).toBe(false);
    expect(M365_CONNECTOR_IMPLEMENTED).toBe(true);
    expect(M365_SECURITY_ARCHITECTURE_READY).toBe(true);
    expect(bosLiveMicrosoft365Certified).toBe(false);
    expect(liveProviderCredentialsAvailable("hubspot")).toBe(false);
    expect(assessBosLiveHubSpotEnvironment()).toEqual({ status: "unavailable", reason: "no_live_configuration" });
    expect(HUBSPOT_THREAT_MODEL.map((row) => row.id)).toHaveLength(22);
    expect(directAgentProviderAccess).toBe(false);
    expect(crossTenantConnectorAccess).toBe(false);
    expect(canonicalDomainMutationBypass).toBe(false);
  });

  it("requires explicit human opt-in and rejects inline, browser, private-app, and agent secrets", async () => {
    const { connectors } = harness();
    await expect(
      connectors.configure(SCOPE, { connectorId: "hubspot", accessToken: "pat-live" } as never, HUMAN),
    ).rejects.toThrow("secret_redaction_required");
    await expect(
      connectors.configure(SCOPE, { connectorId: "hubspot", hapikey: "demo" } as never, HUMAN),
    ).rejects.toThrow("secret_redaction_required");
    expect(containsSecretFields({ refreshToken: "rt" })).toBe(true);
    expect(() => connectors.callProviderFromAgent()).toThrow("direct_provider_access_forbidden");
    await expect(connectors.configure(SCOPE, { connectorId: "hubspot", mode: "fixture" }, AGENT)).rejects.toThrow(
      "self_registration_forbidden",
    );
    vi.stubEnv("NEXT_PUBLIC_HUBSPOT_CLIENT_SECRET", "browser-secret");
    expect(() => liveProviderCredentialsAvailable("hubspot")).toThrow(/NEXT_PUBLIC/);
    expect(() => resolveHubSpotSecrets("sec")).toThrow("hubspot_browser_secret_forbidden");
    vi.unstubAllEnvs();
    clearBosCertificationEnv();
    vi.stubEnv("HUBSPOT_ACCESS_TOKEN", "pat-na1-private-app");
    expect(() => liveProviderCredentialsAvailable("hubspot")).toThrow(/private-app/);
    expect(() => resolveHubSpotSecrets("sec")).toThrow("hubspot_private_app_forbidden");
    const authorize = buildHubSpotAuthorizeUrl({
      clientId: "public-client-id",
      redirectUri: "http://localhost:8787/callback",
      state: "state-1",
    });
    expect(authorize).not.toMatch(/client_secret|refresh_token|password/);
  });

  it("does not ship NEXT_PUBLIC HubSpot secrets in web source", () => {
    const configure = readFileSync(
      resolve(ROOT, "apps/web/src/app/api/business/integrations/configure/route.ts"),
      "utf8",
    );
    const integrations = readFileSync(resolve(ROOT, "apps/web/src/app/(platform)/business/integrations/page.tsx"), "utf8");
    expect(`${configure}\n${integrations}`).not.toMatch(/NEXT_PUBLIC_HUBSPOT_/);
  });

  it("does not silently treat fixture records as live HubSpot data", async () => {
    const { connectors, store } = harness();
    const installed = await connectors.configure(
      SCOPE,
      { connectorId: "hubspot", secretId: "sec_123", mode: "live", expectedProviderOrgId: PORTAL },
      HUMAN,
    );
    expect(installed.effectiveMode).toBe("live");
    expect(installed.modeLabel).not.toBe("FIXTURE/SANDBOX");
    expect(installed.connectionState).toBe("CONNECTING");
    const run = await connectors.sync(SCOPE, { installationId: installed.id }, HUMAN);
    expect(run.status).toBe("failed");
    expect(run.errorCategory).toBe("hubspot_secret_retrieval_failed");
    const staged = await store.listStaging(SCOPE);
    expect(JSON.stringify(staged)).not.toContain("hs-contact-1");
    expect(JSON.stringify(staged)).not.toContain("Jordan Buyer");
    expect(staged.every((row) => row.becomesCanonical === false)).toBe(true);
  });

  it("marks live HubSpot unavailable without falling back to fixture mode", async () => {
    const { connectors } = harness();
    const row = await connectors.configure(SCOPE, { connectorId: "hubspot", mode: "live" }, HUMAN);
    expect(row.effectiveMode).toBe("live");
    expect(row.health).toBe("unavailable");
    expect(row.modeLabel).toBe("LIVE_UNAVAILABLE");
    expect(row.connectionState).toBe("ERROR");
  });

  it("rejects cross-tenant and cross-workspace connector access", async () => {
    const { connectors } = harness();
    const home = await connectors.configure(SCOPE, { connectorId: "hubspot", mode: "fixture" }, HUMAN);
    await connectors.configure(OTHER, { connectorId: "hubspot", mode: "fixture" }, HUMAN);
    await expect(connectors.sync(OTHER, { installationId: home.id }, HUMAN)).rejects.toThrow(
      "connector installation not found",
    );
    await expect(connectors.revoke(OTHER, home.id, HUMAN)).rejects.toThrow("connector installation not found");
  });

  it("revokes HubSpot installations and blocks later sync", async () => {
    const { connectors } = harness();
    const installed = await connectors.configure(SCOPE, { connectorId: "hubspot", mode: "fixture" }, HUMAN);
    expect(installed.connectionState).toBe("CONNECTED");
    const revoked = await connectors.revoke(SCOPE, installed.id, HUMAN);
    expect(revoked.health).toBe("revoked");
    expect(revoked.secretId).toBeNull();
    expect(revoked.connectionState).toBe("DISCONNECTED");
    expect(revoked.provenance.disconnectedAt).toBeTruthy();
    expect(revoked.provenance.providerRevocation).toBe("local_only");
    await expect(connectors.sync(SCOPE, { installationId: installed.id }, HUMAN)).rejects.toThrow("connector_revoked");
  });

  it("redacts tokens and contact PII from telemetry", () => {
    const safe = hubspotSafeTelemetry({
      provider: "hubspot",
      operation: "getContactsReadOnly",
      authorization: "Bearer access-token-live-value",
      refresh_token: "refresh-secret",
      client_secret: "app-secret",
      email: "jordan@example.com",
      phone: "+1-555-0100",
      token: "refresh-secret",
      payload: { name: "Jordan Buyer" },
      status: 200,
    });
    expect(safe.provider).toBe("hubspot");
    expect(safe.status).toBe(200);
    expect(safe.authorization).toBe("[redacted]");
    expect(safe.refresh_token).toBe("[redacted]");
    expect(safe.client_secret).toBe("[redacted]");
    expect(safe.email).toBe("[redacted]");
    expect(safe.phone).toBe("[redacted]");
    expect(safe.payload).toBe("[redacted]");
    expect(safe.token).toBe("[redacted]");
    expect(JSON.stringify(redactSecrets({ accessToken: "tok", tenantId: SCOPE.tenantId }))).not.toContain("tok");
  });

  it("fails closed on partial live HubSpot credentials without printing secrets", () => {
    clearBosCertificationEnv();
    vi.stubEnv("HUBSPOT_CLIENT_ID", "client-fixture");
    expect(() => liveProviderCredentialsAvailable("hubspot")).toThrow(/incomplete/);
    try {
      liveProviderCredentialsAvailable("hubspot");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      expect(message).not.toContain("client-fixture");
    }
  });

  it("keeps GET-only live adapter from mixing fixture pages", async () => {
    const adapter = createHubSpotAdapter();
    const live = await adapter.readPage({
      cursor: null,
      secretId: null,
      mode: "live",
      tenantId: SCOPE.tenantId,
      workspaceId: SCOPE.workspaceId,
      installationId: "install-1",
      expectedProviderOrgId: PORTAL,
    });
    expect(live.records).toEqual([]);
    expect(live.errorCategory).toBe("hubspot_missing_secret");
    expect(JSON.stringify(live)).not.toContain("Jordan Buyer");
    const fixture = await BOS_CONNECTOR_ADAPTERS.hubspot.readPage({
      cursor: null,
      secretId: null,
      mode: "fixture",
    });
    expect(fixture.records.some((row) => row.externalSourceId === "hs-contact-1")).toBe(true);
    expect(() => BOS_CONNECTOR_ADAPTERS.hubspot.write()).toThrow("connector_write_forbidden");
  });

  it("cannot reconstruct suppressed identities from HubSpot fixture import", async () => {
    const { connectors, store } = harness();
    const installed = await connectors.configure(SCOPE, { connectorId: "hubspot", mode: "fixture" }, HUMAN);
    await connectors.sync(SCOPE, { installationId: installed.id }, HUMAN);
    const staged = await store.listStaging(SCOPE);
    expect(staged.some((row) => row.suppressed)).toBe(true);
    expect(staged.every((row) => row.becomesCanonical === false)).toBe(true);
    expect(staged.some((row) => reconstructableSuppressedIdentityLeak(row))).toBe(false);
    expect(JSON.stringify(staged)).not.toContain("Hidden Person");
    expect(JSON.stringify(staged)).not.toContain("hidden@example.com");
    expect(connectors.status().suppressedIdentityReconstructionBlocked).toBe(true);
  });

  it("does not ship legacy token-in-path revocation", () => {
    const clientSrc = readFileSync(resolve(ROOT, "packages/business-os/src/connectors/hubspot-client.ts"), "utf8");
    const policySrc = readFileSync(resolve(ROOT, "packages/business-os/src/connectors/hubspot-policy.ts"), "utf8");
    expect(clientSrc).toContain("HUBSPOT_OAUTH_REVOKE_PATH");
    expect(clientSrc).toContain("HUBSPOT_OAUTH_TOKEN_PATH");
    expect(clientSrc).not.toMatch(/oauth\/v1\/refresh-tokens|oauth\/v3\/refresh-tokens/);
    expect(clientSrc).not.toMatch(/method:\s*"DELETE"/);
    expect(policySrc).toContain('HUBSPOT_OAUTH_TOKEN_PATH = "/oauth/2026-03/token"');
    expect(policySrc).toContain('HUBSPOT_OAUTH_REVOKE_PATH = "/oauth/2026-03/token/revoke"');
  });

  it("keeps local disconnect when live HubSpot provider revocation fails", async () => {
    const { connectors } = harness();
    clearBosCertificationEnv();
    vi.stubEnv("HUBSPOT_CLIENT_ID", "client");
    vi.stubEnv("HUBSPOT_CLIENT_SECRET", "super-secret");
    vi.stubEnv("HUBSPOT_SECRET_ID", "sec_123");
    vi.stubEnv("HUBSPOT_PORTAL_ID", PORTAL);
    vi.stubEnv("HUBSPOT_REFRESH_TOKEN", "refresh-secret");
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input) => {
      const url = String(input);
      expect(url).not.toContain("refresh-secret");
      expect(url).not.toContain("super-secret");
      expect(new URL(url).pathname).toBe("/oauth/2026-03/token/revoke");
      return new Response(JSON.stringify({ token: "refresh-secret" }), { status: 401 });
    }) as typeof fetch;
    try {
      const installed = await connectors.configure(
        SCOPE,
        { connectorId: "hubspot", secretId: "sec_123", mode: "live", expectedProviderOrgId: PORTAL },
        HUMAN,
      );
      const revoked = await connectors.revoke(SCOPE, installed.id, HUMAN);
      expect(revoked.health).toBe("revoked");
      expect(revoked.secretId).toBeNull();
      expect(revoked.connectionState).toBe("DISCONNECTED");
      expect(revoked.provenance.providerRevocation).toBe("unavailable");
      expect(revoked.provenance.providerRevocationError).toBe("hubspot_unauthorized");
      expect(JSON.stringify(revoked)).not.toContain("refresh-secret");
      expect(JSON.stringify(revoked)).not.toContain("super-secret");
      await expect(connectors.sync(SCOPE, { installationId: installed.id }, HUMAN)).rejects.toThrow("connector_revoked");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
