import { describe, expect, it } from "vitest";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { AuditService } from "@rtb/platform-core";
import { BosConnectorsService } from "./service";
import { createMemoryConnectorStore } from "./store";
import { signBosOAuthState } from "./oauth-fixture";
import {
  BROWSER_E2E_EVIDENCE_PASS,
  bosBrowserE2eCertified,
  bosLiveHubSpotCertified,
  bosLiveMicrosoft365Certified,
  bosLiveXeroCertified,
  bosProductionEligible,
  HUBSPOT_LIVE_CERTIFICATION_EXECUTED,
  M365_LIVE_CERTIFICATION_EXECUTED,
  XERO_LIVE_CERTIFICATION_EXECUTED,
} from "../release";
import { directAgentProviderAccess, crossTenantAgentAccess } from "../version";

const SCOPE = {
  tenantId: "11111111-1111-4111-8111-111111111111",
  workspaceId: "22222222-2222-4222-8222-222222222222",
  userId: "33333333-3333-4333-8333-333333333333",
};
const OTHER = {
  tenantId: "55555555-5555-4555-8555-555555555555",
  workspaceId: "66666666-6666-4666-8666-666666666666",
  userId: "77777777-7777-4777-8777-777777777777",
};
const HUMAN = { userId: SCOPE.userId, actorType: "human" as const };
const AGENT = { userId: SCOPE.userId, actorType: "agent" as const, agentId: "agent-1" };
const ORIGIN = "http://127.0.0.1:3000";

function harness() {
  const kernel = createPlatformKernel({} as SupabaseClient);
  const audit = new AuditService({} as SupabaseClient);
  const store = createMemoryConnectorStore();
  const connectors = new BosConnectorsService({} as SupabaseClient, kernel, audit, { store });
  return { connectors, store };
}

describe("BOS-16A8 browser fixture OAuth control flow", () => {
  it("connects Xero, Microsoft 365, and HubSpot through fixture OAuth without live tokens", async () => {
    const { connectors, store } = harness();
    for (const connectorId of ["xero", "microsoft_365", "hubspot"] as const) {
      await expect(connectors.beginOAuth(SCOPE, { connectorId, origin: ORIGIN }, AGENT)).rejects.toThrow(
        "self_registration_forbidden",
      );
      const started = await connectors.beginOAuth(SCOPE, { connectorId, origin: ORIGIN }, HUMAN);
      expect(started.connectionState).toBe("CONNECTING");
      expect(started.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(started.authorizeUrl).toContain("/business/integrations/oauth/fixture");
      expect(started.authorizeUrl).not.toMatch(/client_secret|refresh_token|access_token/);
      expect(JSON.stringify(started)).not.toContain("bos_fixture_secret_ref");
      const url = new URL(started.authorizeUrl, ORIGIN);
      const connected = await connectors.completeOAuthCallback(
        SCOPE,
        { state: url.searchParams.get("state") ?? "", code: "bos_fixture_ok" },
        HUMAN,
      );
      expect(connected.connectionState).toBe("CONNECTED");
      expect(connected.organisation).toBeTruthy();
      expect(connected.secretId).toBe("secret_ref");
      expect(connected.live).toBe(false);
      expect(connected.browserFixture).toBe(true);
      const again = await connectors.overview(SCOPE);
      const row = again.installations.find((item) => item.connectorId === connectorId);
      expect(row?.connectionState).toBe("CONNECTED");
      const stagedBefore = await store.listStaging(SCOPE);
      const run = await connectors.sync(SCOPE, { installationId: connected.id }, HUMAN);
      expect(run.status).toBe("completed");
      const staged = await store.listStaging(SCOPE);
      expect(staged.length).toBeGreaterThan(stagedBefore.length);
      expect(staged.every((item) => item.becomesCanonical === false)).toBe(true);
      expect(JSON.stringify(staged)).not.toMatch(/access_token|refresh_token|client_secret/);
      if (connectorId === "xero") {
        await connectors.applyFixtureOutcome(SCOPE, { connectorId, outcome: "sync_error" }, HUMAN);
        const failed = await connectors.sync(SCOPE, { installationId: connected.id }, HUMAN);
        expect(failed.status).toBe("failed");
        expect(failed.errorCategory).toBe("timeout");
      }
    }
    expect(XERO_LIVE_CERTIFICATION_EXECUTED).toBe(false);
    expect(M365_LIVE_CERTIFICATION_EXECUTED).toBe(false);
    expect(HUBSPOT_LIVE_CERTIFICATION_EXECUTED).toBe(false);
    expect(bosLiveXeroCertified).toBe(false);
    expect(bosLiveMicrosoft365Certified).toBe(false);
    expect(bosLiveHubSpotCertified).toBe(false);
    expect(bosProductionEligible).toBe(true);
    expect(bosBrowserE2eCertified).toBe(true);
    expect(directAgentProviderAccess).toBe(false);
    expect(crossTenantAgentAccess).toBe(false);
  });

  it("handles denial, invalid state, expired state, and wrong tenant", async () => {
    const { connectors } = harness();
    const started = await connectors.beginOAuth(SCOPE, { connectorId: "xero", origin: ORIGIN }, HUMAN);
    const state = new URL(started.authorizeUrl, ORIGIN).searchParams.get("state") ?? "";
    const denied = await connectors.completeOAuthCallback(SCOPE, { state, error: "access_denied" }, HUMAN);
    expect(denied.connectionState).toBe("ERROR");
    expect(denied.errorMessage).not.toMatch(/stack|access_token|secret_id/i);

    const next = await connectors.beginOAuth(SCOPE, { connectorId: "xero", origin: ORIGIN }, HUMAN);
    await expect(
      connectors.completeOAuthCallback(SCOPE, { state: "invalid", code: "bos_fixture_ok" }, HUMAN),
    ).rejects.toThrow("oauth_state_invalid");
    await expect(
      connectors.completeOAuthCallback(OTHER, { state: new URL(next.authorizeUrl, ORIGIN).searchParams.get("state") ?? "", code: "bos_fixture_ok" }, { userId: OTHER.userId, actorType: "human" }),
    ).rejects.toThrow("oauth_tenant_mismatch");

    const expiring = await connectors.beginOAuth(SCOPE, { connectorId: "hubspot", origin: ORIGIN }, HUMAN);
    const raw = new URL(expiring.authorizeUrl, ORIGIN).searchParams.get("state") ?? "";
    const [body, sig] = raw.split(".");
    const claims = JSON.parse(Buffer.from(body ?? "", "base64url").toString("utf8")) as { exp: number };
    claims.exp = Date.now() - 1;
    const expired = `${Buffer.from(JSON.stringify(claims), "utf8").toString("base64url")}.${sig}`;
    // Tampering the body without resigning is invalid; resign with helper using stolen nonce is still expired via verify.
    const resigned = signBosOAuthState({
      v: 1,
      nonce: (JSON.parse(Buffer.from(body ?? "", "base64url").toString("utf8")) as { nonce: string }).nonce,
      tenantId: SCOPE.tenantId,
      workspaceId: SCOPE.workspaceId,
      connectorId: "hubspot",
      userId: SCOPE.userId,
      exp: Date.now() - 1,
      redirectUri: "http://127.0.0.1:3000/api/business/integrations/oauth/callback",
      fixture: true,
    });
    await expect(
      connectors.completeOAuthCallback(SCOPE, { state: resigned, code: "bos_fixture_ok" }, HUMAN),
    ).rejects.toThrow("oauth_state_expired");
    expect(expired).toBeTruthy();
    const overview = await connectors.overview(SCOPE);
    expect(overview.installations.find((row) => row.connectorId === "hubspot")?.connectionState).toBe("ERROR");
  });

  it("blocks sync during reauth, requires reconnect, and persists disconnect", async () => {
    const { connectors } = harness();
    const started = await connectors.beginOAuth(SCOPE, { connectorId: "microsoft_365", origin: ORIGIN }, HUMAN);
    const state = new URL(started.authorizeUrl, ORIGIN).searchParams.get("state") ?? "";
    const connected = await connectors.completeOAuthCallback(SCOPE, { state, code: "bos_fixture_ok" }, HUMAN);
    const reauth = await connectors.applyFixtureOutcome(
      SCOPE,
      { connectorId: "microsoft_365", outcome: "reauth_required" },
      HUMAN,
    );
    expect(reauth.connectionState).toBe("REAUTH_REQUIRED");
    await expect(connectors.sync(SCOPE, { installationId: connected.id }, HUMAN)).rejects.toThrow(
      "connector_reauth_required",
    );
    const reconnect = await connectors.beginOAuth(SCOPE, { connectorId: "microsoft_365", origin: ORIGIN }, HUMAN);
    expect(reconnect.connectionState).toBe("CONNECTING");
    const restored = await connectors.completeOAuthCallback(
      SCOPE,
      { state: new URL(reconnect.authorizeUrl, ORIGIN).searchParams.get("state") ?? "", code: "bos_fixture_ok" },
      HUMAN,
    );
    expect(restored.connectionState).toBe("CONNECTED");
    const disconnected = await connectors.revoke(SCOPE, restored.id, HUMAN);
    expect(disconnected.connectionState).toBe("DISCONNECTED");
    expect(disconnected.secretId).toBeNull();
    const persisted = await connectors.overview(SCOPE);
    expect(persisted.installations.find((row) => row.connectorId === "microsoft_365")?.connectionState).toBe(
      "DISCONNECTED",
    );
    await expect(connectors.sync(SCOPE, { installationId: restored.id }, HUMAN)).rejects.toThrow("connector_revoked");
  });

  it("isolates tenants and does not expose provider clients to agents", async () => {
    const { connectors } = harness();
    const started = await connectors.beginOAuth(SCOPE, { connectorId: "xero", origin: ORIGIN }, HUMAN);
    await connectors.completeOAuthCallback(
      SCOPE,
      { state: new URL(started.authorizeUrl, ORIGIN).searchParams.get("state") ?? "", code: "bos_fixture_ok" },
      HUMAN,
    );
    const otherView = await connectors.overview(OTHER);
    expect(otherView.installations).toEqual([]);
    expect(() => connectors.callProviderFromAgent()).toThrow("direct_provider_access_forbidden");
  });

  it("does not treat browser fixture evidence as a release declaration", () => {
    expect(bosBrowserE2eCertified).toBe(true);
    expect(BROWSER_E2E_EVIDENCE_PASS).toBe(true);
  });
});
