import { describe, expect, it } from "vitest";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { createMemoryInformationStore } from "../../information-intelligence/memory-store";
import { EngineeringInformationService } from "../../information-intelligence/service";
import { createMemoryWorkContextStore } from "../../work-context/memory-store";
import { EngineeringWorkContextService } from "../../work-context/service";
import { CRUSHER_FEED_OTHER_TENANT, CRUSHER_FEED_OTHER_WORKSPACE } from "../../digital-thread/fixture";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../../digital-thread/fixture";
import { CRUSHER_EXPANSION_FEED_PROJECT_ID } from "../../lifecycle-intelligence/fixture";
import { observabilitySafe, rejectArbitraryUrlFetch, rejectCallerConnectorCoreClaims } from "../core/security";
import { createMemoryM365Store } from "./memory-store";
import { MockGraphPort } from "./graph";
import { createTestM365ConnectorService } from "./service";
import {
  A13A_DRIVE_A,
  A13A_SITE_ID,
  mechLoadItem,
} from "./fixture";
import {
  assertTrustedMicrosoftIdentity,
  parseSharePointSiteUrl,
  proposeSharePointDocumentHints,
  rtbMicrosoftAppConfig,
  type TrustedMicrosoftIdentity,
} from "./onboarding";
import { assertSetupAgentCommand, SETUP_AGENT_FORBIDDEN_ACTIONS, setupAgentNextAction } from "./setup-agent";
import { decodeMicrosoftIdToken, signOAuthState, verifyOAuthState } from "./oauth";
import { DEFAULT_CONNECTOR_WRITE_POLICY } from "../core/types";
import { SHAREPOINT_PILOT_WRITE_ENABLED } from "./live-readiness";

const RTB_APP = { applicationId: "rtb-multitenant-app", credentialSecretId: "secret:rtb-m365-multitenant", configured: true };

function admin(tenantId = CRUSHER_FEED_TENANT, workspaceId = CRUSHER_FEED_WORKSPACE) {
  return createTestCommerceExecutionContext({
    tenantId,
    workspaceId,
    policy: { productKey: "engineering-os", action: "settings.write", seatRequired: true },
  });
}

function stubClient() {
  return { from() { return this; } } as never;
}

function identity(overrides: Partial<TrustedMicrosoftIdentity> = {}): TrustedMicrosoftIdentity {
  return {
    microsoftTenantId: "11111111-2222-3333-4444-555555555555",
    signedInUserId: "oid-admin-1",
    organisationName: "Contoso Engineering",
    adminConsentGranted: true,
    source: "microsoft_token",
    ...overrides,
  };
}

async function harness() {
  const workStore = createMemoryWorkContextStore();
  const infoStore = createMemoryInformationStore();
  const m365Store = createMemoryM365Store();
  const graph = new MockGraphPort();
  graph.seedSite({
    hostname: "contoso.sharepoint.com",
    path: "/sites/ProjectAlpha",
    siteId: A13A_SITE_ID,
    displayName: "Project Alpha",
    webUrl: "https://contoso.sharepoint.com/sites/ProjectAlpha",
  });
  graph.seedLibrary(A13A_SITE_ID, { driveId: A13A_DRIVE_A, name: "Engineering", driveType: "documentLibrary" });
  graph.seed(mechLoadItem());
  const work = new EngineeringWorkContextService(stubClient(), workStore);
  const information = new EngineeringInformationService(stubClient(), infoStore);
  const connector = createTestM365ConnectorService({ work, information, store: m365Store, graph, onboardingApp: RTB_APP });
  return { workStore, infoStore, m365Store, graph, work, information, connector };
}

describe("EOS-A16C Microsoft 365 self-service onboarding", () => {
  it("starts onboarding as not connected and keeps Microsoft optional", async () => {
    const { connector } = await harness();
    const dashboard = await connector.onboardingDashboard(admin(), CRUSHER_FEED_TENANT);
    expect(dashboard.microsoftOptional).toBe(true);
    expect(dashboard.setupState).toBe("NOT_CONNECTED");
    expect(dashboard.writeEnabled).toBe(false);
    expect(dashboard.permissionMode).toMatch(/Sites.Selected/);
    expect(connector.catalog().defaultConnectionMode).toBe("RTB_MANAGED_MICROSOFT");
    expect(connector.catalog().enterpriseManagedMode).toBe("ARCHITECTURAL_EXTENSION");
    expect(connector.catalog().sitesReadAllRequired).toBe(false);
    expect(connector.catalog().filesReadAllRequired).toBe(false);
    expect(SHAREPOINT_PILOT_WRITE_ENABLED).toBe(false);
    expect(DEFAULT_CONNECTOR_WRITE_POLICY).toBe("READ_ONLY");
  });

  it("detects tenant from trusted Microsoft identity and rejects caller tenant or token", async () => {
    const { connector, m365Store } = await harness();
    await expect(connector.completeMicrosoftSignIn(admin(), CRUSHER_FEED_TENANT, identity({ microsoftTenantId: "" }))).rejects.toThrow(/microsoft_tenant_missing/);
    expect(() => assertTrustedMicrosoftIdentity(identity({} as never))).not.toThrow();
    expect(rejectCallerConnectorCoreClaims({ accessToken: "tok" })).toBe("caller_supplied_authority_rejected");
    expect(rejectArbitraryUrlFetch("https://graph.microsoft.com/v1.0/sites")).toBe("ARBITRARY_URL_FETCH_PROHIBITED");
    const connected = await connector.completeMicrosoftSignIn(admin(), CRUSHER_FEED_TENANT, identity());
    expect(connected.setupState).toBe("CONNECTED_NO_SITE");
    const row = await m365Store.getConnection(connected.connectionId!);
    expect(row?.microsoftTenantId).toBe("11111111-2222-3333-4444-555555555555");
    expect(row?.applicationId).toBe(RTB_APP.applicationId);
    expect(row?.credentialSecretId).toBe("secret:rtb-m365-multitenant");
    expect(JSON.stringify(row)).not.toMatch(/client_secret|access_token|Bearer /);
  });

  it("reuses the governed connection on a second authorized Microsoft identity", async () => {
    const { connector, m365Store } = await harness();
    const first = await connector.completeMicrosoftSignIn(admin(), CRUSHER_FEED_TENANT, identity());
    const second = await connector.completeMicrosoftSignIn(admin(), CRUSHER_FEED_TENANT, identity());
    expect(second.connectionId).toBe(first.connectionId);
    expect((await m365Store.listConnections(CRUSHER_FEED_WORKSPACE)).filter((row) => row.tenantId === CRUSHER_FEED_TENANT)).toHaveLength(1);
  });

  it("fails closed when admin consent is missing", async () => {
    const { connector } = await harness();
    const result = await connector.completeMicrosoftSignIn(admin(), CRUSHER_FEED_TENANT, identity({ adminConsentGranted: false, consentRequired: true }));
    expect(result.setupState).toBe("ADMIN_CONSENT_REQUIRED");
    expect(result.connection).toBeNull();
  });

  it("resolves approved site URL through Graph and rejects unapproved or unauthorized sites", async () => {
    const { connector, graph } = await harness();
    await connector.completeMicrosoftSignIn(admin(), CRUSHER_FEED_TENANT, identity());
    const parsed = parseSharePointSiteUrl("https://contoso.sharepoint.com/sites/ProjectAlpha");
    expect(parsed.hostname).toBe("contoso.sharepoint.com");
    expect(() => parseSharePointSiteUrl("http://169.254.169.254/latest")).toThrow(/UNAPPROVED_SITE|governed/i);
    expect(() => parseSharePointSiteUrl("https://contoso-my.sharepoint.com/personal/user")).toThrow(/PERSONAL_ONEDRIVE/);
    const approved = await connector.resolveApprovedSite(admin(), CRUSHER_FEED_TENANT, "https://contoso.sharepoint.com/sites/ProjectAlpha");
    expect(approved.setupState).toBe("LIBRARY_SELECTION_REQUIRED");
    expect(approved.libraries.some((row) => row.name === "Engineering")).toBe(true);
    graph.deniedSites.add("contoso.sharepoint.com/sites/secret");
    graph.seedSite({ hostname: "contoso.sharepoint.com", path: "/sites/secret", siteId: "site-secret", displayName: "Secret", webUrl: "https://contoso.sharepoint.com/sites/secret" });
    const denied = await connector.resolveApprovedSite(admin(), CRUSHER_FEED_TENANT, "https://contoso.sharepoint.com/sites/secret");
    expect(denied.setupState).toBe("SITE_PERMISSION_REQUIRED");
    graph.missingSites.add("contoso.sharepoint.com/sites/missing");
    await expect(connector.resolveApprovedSite(admin(), CRUSHER_FEED_TENANT, "https://contoso.sharepoint.com/sites/missing")).rejects.toThrow(/UNAPPROVED_SITE/);
  });

  it("creates canonical connection, scope, allowlist, and managed repository as read-only", async () => {
    const { connector, m365Store } = await harness();
    await connector.completeMicrosoftSignIn(admin(), CRUSHER_FEED_TENANT, identity());
    const selected = await connector.selectApprovedLibrary(admin(), CRUSHER_FEED_TENANT, {
      siteUrl: "https://contoso.sharepoint.com/sites/ProjectAlpha",
      libraryName: "Engineering",
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    });
    expect(selected.setupState).toBe("READY");
    const dashboard = await connector.onboardingDashboard(admin(), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(dashboard.setupState).toBe("READY");
    expect(dashboard.sites[0]?.displayName).toBe("Engineering");
    const scopes = await m365Store.listScopes(CRUSHER_FEED_WORKSPACE);
    expect(scopes[0]?.externalSiteId).toBe(A13A_SITE_ID);
    expect(scopes[0]?.externalDriveId).toBe(A13A_DRIVE_A);
    expect(scopes[0]?.publicationEnabled).toBe(false);
    expect(dashboard.sites[0]?.enabled).toBe(true);
  });

  it("health-checks without write and maps revoked permission", async () => {
    const { connector, graph } = await harness();
    await connector.completeMicrosoftSignIn(admin(), CRUSHER_FEED_TENANT, identity());
    await connector.selectApprovedLibrary(admin(), CRUSHER_FEED_TENANT, {
      siteUrl: "https://contoso.sharepoint.com/sites/ProjectAlpha",
      libraryName: "Engineering",
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    });
    const ok = await connector.userHealthCheck(admin(), CRUSHER_FEED_TENANT);
    expect(ok.userHealth).toBe("CONNECTED");
    expect(ok.diagnostics.writeEnabled).toBe(false);
    expect(ok.diagnostics.metadataRead).toBe(true);
    graph.failAuth = true;
    const expired = await connector.userHealthCheck(admin(), CRUSHER_FEED_TENANT);
    expect(expired.setupState === "AUTH_EXPIRED" || expired.userHealth === "ATTENTION_REQUIRED").toBe(true);
  });

  it("disconnects without deleting historical source records", async () => {
    const { connector, m365Store } = await harness();
    const connected = await connector.completeMicrosoftSignIn(admin(), CRUSHER_FEED_TENANT, identity());
    const selected = await connector.selectApprovedLibrary(admin(), CRUSHER_FEED_TENANT, {
      siteUrl: "https://contoso.sharepoint.com/sites/ProjectAlpha",
      libraryName: "Engineering",
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    });
    expect(selected.repositoryId).toBeTruthy();
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, selected.repositoryId!, "initial");
    const before = await m365Store.listSources(CRUSHER_FEED_WORKSPACE, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(before.length).toBeGreaterThan(0);
    const disconnected = await connector.disconnectConnection(admin(), CRUSHER_FEED_TENANT, connected.connectionId!);
    expect(disconnected.historicalProvenancePreserved).toBe(true);
    const after = await m365Store.listSources(CRUSHER_FEED_WORKSPACE, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(after).toHaveLength(before.length);
    expect(after.every((row) => row.availability === "DISABLED")).toBe(true);
  });

  it("isolates tenant, workspace, project, connection, and secret references", async () => {
    const { connector } = await harness();
    const connected = await connector.completeMicrosoftSignIn(admin(), CRUSHER_FEED_TENANT, identity());
    const other = createTestCommerceExecutionContext({
      tenantId: CRUSHER_FEED_OTHER_TENANT,
      workspaceId: CRUSHER_FEED_OTHER_WORKSPACE,
      policy: { productKey: "engineering-os", action: "settings.write", seatRequired: true },
    });
    await expect(connector.disconnectConnection(other, CRUSHER_FEED_OTHER_TENANT, connected.connectionId!)).rejects.toThrow(/connection_scope_denied/);
    const otherDash = await connector.onboardingDashboard(other, CRUSHER_FEED_OTHER_TENANT);
    expect(otherDash.connectionId).toBeNull();
  });

  it("keeps the setup agent inside its authority boundary", () => {
    expect(() => assertSetupAgentCommand("grant_microsoft_permissions")).toThrow(/SETUP_AGENT_AUTHORITY_DENIED/);
    expect(() => assertSetupAgentCommand("enable_write")).toThrow(/SETUP_AGENT_AUTHORITY_DENIED/);
    expect(SETUP_AGENT_FORBIDDEN_ACTIONS).toContain("simulate_admin_consent");
    expect(setupAgentNextAction("ADMIN_CONSENT_REQUIRED").command).toBe("check_consent");
  });

  it("decodes Microsoft identity and signs oauth state without exposing tokens", () => {
    const payload = Buffer.from(JSON.stringify({ tid: "tid-1", oid: "oid-1", preferred_username: "admin@contoso.com" })).toString("base64url");
    const decoded = decodeMicrosoftIdToken(`hdr.${payload}.sig`);
    expect(decoded.microsoftTenantId).toBe("tid-1");
    const token = signOAuthState({ nonce: "n1", eosTenantId: CRUSHER_FEED_TENANT, workspaceId: CRUSHER_FEED_WORKSPACE, userId: "user-1", adminConsent: false, exp: Date.now() + 60_000 }, "state-secret");
    expect(verifyOAuthState(token, "state-secret").eosTenantId).toBe(CRUSHER_FEED_TENANT);
    expect(observabilitySafe({ accessToken: "tok", clientSecret: "sec", status: "ok" }).accessToken).toBeUndefined();
    expect(rtbMicrosoftAppConfig({ RTB_M365_APPLICATION_ID: "app" }).configured).toBe(true);
    expect(proposeSharePointDocumentHints("MECH-LOAD-001 Rev C.xlsx")).toEqual({
      proposed: true,
      documentNumber: "MECH-LOAD-001",
      revision: "C",
      discipline: "mechanical",
    });
    expect(proposeSharePointDocumentHints("notes.txt").documentNumber).toBeNull();
  });
});
