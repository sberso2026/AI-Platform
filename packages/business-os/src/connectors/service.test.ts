import { describe, expect, it } from "vitest";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { AuditService } from "@rtb/platform-core";
import { BosConnectorsService } from "./service";
import { createMemoryConnectorStore } from "./store";
import { CONNECTORS_HARDENING_CONTRACT } from "./extensions";
import { BOS_CONNECTOR_ADAPTERS } from "./adapters";
import { getBusinessOsFoundationDeclaration } from "../version";

const SCOPE = {
  tenantId: "11111111-1111-4111-8111-111111111111",
  workspaceId: "22222222-2222-4222-8222-222222222222",
  userId: "33333333-3333-4333-8333-333333333333",
};
const OTHER = {
  tenantId: "55555555-5555-4555-8555-555555555555",
  workspaceId: "66666666-6666-4666-8666-666666666666",
  userId: SCOPE.userId,
};
const HUMAN = { userId: SCOPE.userId, actorType: "human" as const };
const AGENT = { userId: SCOPE.userId, actorType: "agent" as const, agentId: "agent-1" };

function harness() {
  const kernel = createPlatformKernel({} as SupabaseClient);
  const audit = new AuditService({} as SupabaseClient);
  const store = createMemoryConnectorStore();
  const connectors = new BosConnectorsService({} as SupabaseClient, kernel, audit, { store });
  return { connectors, store, kernel };
}

describe("BOS-12 connector contracts", () => {
  it("reuses Platform integration/secrets and forbids a second stack", () => {
    const { connectors } = harness();
    expect(connectors.contract()).toEqual(CONNECTORS_HARDENING_CONTRACT);
    expect(connectors.status().implemented).toBe(true);
    expect(connectors.status().implementsOwnAiStack).toBe(false);
    expect(connectors.status().duplicateIntegrationStackDetected).toBe(false);
    expect(connectors.status().ExternalWritesDisabled).toBe(true);
    expect(connectors.status().NoVendorHardDependency).toBe(true);
    expect(connectors.status().requiredForBusinessOs).toBe(false);
    expect(getBusinessOsFoundationDeclaration().duplicateIntegrationStackDetected).toBe(false);
    expect(() => connectors.writeExternal()).toThrow("connector_write_forbidden");
    expect(() => connectors.proxyArbitraryUrl()).toThrow("unrestricted_external_proxy_forbidden");
    expect(() => connectors.callProviderFromAgent()).toThrow("direct_provider_access_forbidden");
    expect(() => BOS_CONNECTOR_ADAPTERS.xero.write()).toThrow("connector_write_forbidden");
    expect(() => connectors.assertConnectorUrl("xero", "http://127.0.0.1/secrets")).toThrow(
      "unrestricted_external_proxy_forbidden",
    );
    expect(() => connectors.assertConnectorUrl("xero", "https://evil.example/x")).toThrow(
      "unrestricted_external_proxy_forbidden",
    );
    expect(connectors.assertConnectorUrl("xero", "https://api.xero.com/api.xro/2.0/Invoices").host).toBe("api.xero.com");
    expect(connectors.assertConnectorUrl("microsoft_365", "https://graph.microsoft.com/v1.0/me").host).toBe(
      "graph.microsoft.com",
    );
    expect(
      connectors.assertConnectorUrl(
        "microsoft_365",
        "https://login.microsoftonline.com/11111111-1111-4111-8111-111111111111/oauth2/v2.0/token",
      ).host,
    ).toBe("login.microsoftonline.com");
    expect(
      connectors.assertConnectorUrl("hubspot", "https://api.hubapi.com/crm/v3/objects/contacts").host,
    ).toBe("api.hubapi.com");
    expect(() => connectors.assertConnectorUrl("hubspot", "https://evil.example/crm")).toThrow(
      "unrestricted_external_proxy_forbidden",
    );
  });

  it("stays usable with zero connectors configured", async () => {
    const { connectors } = harness();
    const overview = await connectors.overview(SCOPE);
    expect(overview.usableWithoutConnectors).toBe(true);
    expect(overview.installations).toEqual([]);
    expect(overview.catalog).toHaveLength(4);
    expect(overview.catalog.every((row) => row.writeLabel === "READ ONLY" && row.live === false)).toBe(true);
  });

  it("keeps BOS Core operational when a Preview connector is unavailable", async () => {
    const { connectors } = harness();
    for (const connectorId of ["xero", "microsoft_365", "hubspot"] as const) {
      const down = await connectors.configure(SCOPE, { connectorId, mode: "live" }, HUMAN);
      expect(down.health).toBe("unavailable");
    }
    const overview = await connectors.overview(SCOPE);
    expect(overview.usableWithoutConnectors).toBe(true);
    expect(connectors.status().requiredForBusinessOs).toBe(false);
    expect(connectors.status().NoVendorHardDependency).toBe(true);
    await expect(connectors.assertAgentContextGates(SCOPE)).resolves.toEqual({ applied: false });
    const csv = await connectors.configure(SCOPE, { connectorId: "csv_excel", mode: "fixture" }, HUMAN);
    expect(csv.health).not.toBe("unavailable");
  });

  it("isolates Xero, Microsoft 365, and HubSpot failures from each other and from Core", async () => {
    const { connectors } = harness();
    const xeroFixture = await connectors.configure(SCOPE, { connectorId: "xero", mode: "fixture" }, HUMAN);
    await connectors.sync(SCOPE, { installationId: xeroFixture.id }, HUMAN);
    const xeroDown = await connectors.configure(SCOPE, { connectorId: "xero", mode: "live" }, HUMAN);
    expect(xeroDown.health).toBe("unavailable");
    const hubspot = await connectors.configure(SCOPE, { connectorId: "hubspot", mode: "fixture" }, HUMAN);
    await connectors.sync(SCOPE, { installationId: hubspot.id }, HUMAN);
    expect(hubspot.health).not.toBe("unavailable");
    const m365 = await connectors.configure(SCOPE, { connectorId: "microsoft_365", mode: "live" }, HUMAN);
    expect(m365.health).toBe("unavailable");
    const overview = await connectors.overview(SCOPE);
    expect(overview.usableWithoutConnectors).toBe(true);
    await expect(connectors.assertAgentContextGates(SCOPE)).resolves.toEqual({ applied: true });
  });
});

describe("BOS-12 configure, sync, revoke", () => {
  it("configures fixture connectors with secret references only", async () => {
    const { connectors } = harness();
    await expect(
      connectors.configure(SCOPE, { connectorId: "xero", accessToken: "tok_live" } as never, HUMAN),
    ).rejects.toThrow("secret_redaction_required");
    const row = await connectors.configure(SCOPE, { connectorId: "xero", secretId: "sec_123", mode: "fixture" }, HUMAN);
    expect(row.secretId).toBe("secret_ref");
    expect(row.writeLabel).toBe("READ ONLY");
    expect(row.modeLabel).toBe("FIXTURE/SANDBOX");
    expect(JSON.stringify(row)).not.toContain("sec_123");
    await expect(connectors.configure(SCOPE, { connectorId: "xero" }, AGENT)).rejects.toThrow("self_registration_forbidden");
  });

  it("does not represent live mode as healthy without credentials", async () => {
    const { connectors } = harness();
    const row = await connectors.configure(SCOPE, { connectorId: "microsoft_365", mode: "live" }, HUMAN);
    expect(row.health).toBe("unavailable");
    expect(row.effectiveMode).toBe("live");
    expect(row.modeLabel).toBe("LIVE_UNAVAILABLE");
  });

  it("syncs fixture data into staging without making it canonical", async () => {
    const { connectors, store } = harness();
    const installed = await connectors.configure(SCOPE, { connectorId: "hubspot", mode: "fixture" }, HUMAN);
    const run = await connectors.sync(SCOPE, { installationId: installed.id }, HUMAN);
    expect(run.status).toBe("completed");
    const staged = await store.listStaging(SCOPE);
    expect(staged.length).toBeGreaterThan(0);
    expect(staged.every((row) => row.becomesCanonical === false)).toBe(true);
    expect(JSON.stringify(staged)).not.toContain("Hidden Person");
    expect(JSON.stringify(staged)).not.toContain("hidden@example.com");
    const again = await connectors.sync(SCOPE, { installationId: installed.id }, HUMAN);
    expect(again.id).toBe(run.id);
    await expect(connectors.assertAgentContextGates(SCOPE)).resolves.toEqual({ applied: true });
  });

  it("reports partial failure, timeout, cancellation, and revocation", async () => {
    const { connectors } = harness();
    const installed = await connectors.configure(SCOPE, { connectorId: "xero", mode: "fixture" }, HUMAN);
    const timed = await connectors.sync(SCOPE, { installationId: installed.id, simulate: "timeout" }, HUMAN);
    expect(timed.status).toBe("failed");
    expect(timed.errorCategory).toBe("timeout");
    const limited = await connectors.sync(SCOPE, { installationId: installed.id, simulate: "rate_limit" }, HUMAN);
    expect(limited.status).toBe("partial");
    const cancelled = await connectors.sync(SCOPE, { installationId: installed.id, cancel: true }, HUMAN);
    expect(cancelled.status).toBe("cancelled");
    const revoked = await connectors.revoke(SCOPE, installed.id, HUMAN);
    expect(revoked.health).toBe("revoked");
    expect(revoked.secretId).toBeNull();
    await expect(connectors.sync(SCOPE, { installationId: installed.id }, HUMAN)).rejects.toThrow("connector_revoked");
  });

  it("isolates tenant and workspace connector data", async () => {
    const { connectors } = harness();
    const home = await connectors.configure(SCOPE, { connectorId: "xero", mode: "fixture" }, HUMAN);
    const away = await connectors.configure(OTHER, { connectorId: "xero", mode: "fixture" }, HUMAN);
    expect(home.id).not.toBe(away.id);
    expect((await connectors.overview(SCOPE)).installations.every((row) => row.tenantId === SCOPE.tenantId)).toBe(true);
    await expect(connectors.revoke(SCOPE, away.id, HUMAN)).rejects.toThrow("connector installation not found");
  });
});

describe("BOS-12 CSV import", () => {
  it("previews, detects duplicates, and requires explicit commit", async () => {
    const { connectors, store } = harness();
    const csv = "name,external_id\nAcme,ext-1\nAcme,ext-1\n";
    const previewed = await connectors.previewImport(
      SCOPE,
      { filename: "customers.csv", content: csv, entityType: "customer" },
      HUMAN,
    );
    expect(previewed.preview.duplicates).toBe(1);
    expect(previewed.batch.status).toBe("previewed");
    expect(previewed.batch.committedAt).toBeNull();
    const committed = await connectors.commitImport(
      SCOPE,
      { batchId: previewed.batch.id, content: csv },
      HUMAN,
    );
    expect(committed.status).toBe("committed");
    const staged = await store.listStaging(SCOPE);
    expect(staged.some((row) => row.connectorId === "csv_excel" && row.becomesCanonical === false)).toBe(true);
  });
});
