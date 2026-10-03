import { describe, expect, it } from "vitest";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { PUBLIC_BUCKET_FORBIDDEN } from "../artifact-automation/binary-store";
import { createMemoryInformationStore } from "../information-intelligence/memory-store";
import { EngineeringInformationService } from "../information-intelligence/service";
import { createMemoryWorkContextStore } from "../work-context/memory-store";
import { EngineeringWorkContextService } from "../work-context/service";
import { observabilitySafe, rejectArbitraryUrlFetch, rejectCallerConnectorCoreClaims } from "./core/security";
import { DEFAULT_CONNECTOR_WRITE_POLICY } from "./core/types";
import {
  A16B_OFFICE_INSPECTION_OBJECT_STORAGE_ADAPTER,
  A16B_PHASE,
  A16B_RETURNED_ARTIFACT_FLOW,
  A16B_RETRY_POLICY,
  A16B_SCANNER_SECURITY_MODEL,
  A16B_V5B_REOPEN,
  a16bHardenAssertions,
} from "./a16b-harden";
import { createMemoryM365Store } from "./m365/memory-store";
import { MockGraphPort } from "./m365/graph";
import { createTestM365ConnectorService } from "./m365/service";
import {
  evaluateSharePointLiveReadiness,
  liveSharePointExternalTestState,
  SHAREPOINT_PILOT_MODE,
  SHAREPOINT_REQUIRED_LIVE_PERMISSIONS,
  validateSharePointLiveReadConfig,
} from "./m365/live-readiness";
import {
  A13A_CONNECTION_ID,
  A13A_DRIVE_A,
  A13A_SITE_ID,
  a13aConnection,
  mechLoadItem,
} from "./m365/fixture";
import { CRUSHER_FEED_OTHER_TENANT, CRUSHER_FEED_OTHER_WORKSPACE } from "../digital-thread/fixture";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../digital-thread/fixture";
import { CRUSHER_EXPANSION_FEED_PROJECT_ID } from "../lifecycle-intelligence/fixture";
import { writeZip } from "../artifact-automation/zip";
import { hostedMalwareScannerAvailable } from "../tool-orchestration/return-validation";
import { returnedBinaryUploadsInPilot } from "../pilot/a14a-profile";

function admin() {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action: "settings.write", seatRequired: true },
  });
}

function engineer() {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action: "analysis.read", seatRequired: true },
  });
}

function writer() {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action: "analysis.write", seatRequired: true },
  });
}

function stubClient() {
  return { from() { return this; } } as never;
}

function officeXlsx() {
  return writeZip([
    { name: "[Content_Types].xml", data: Buffer.from("<Types/>") },
    { name: "xl/workbook.xml", data: Buffer.from("<workbook/>") },
  ]);
}

async function harness(options?: { pilotWriteEnabled?: boolean; secrets?: { getSecretValue(id: string): Promise<string | null> } }) {
  const workStore = createMemoryWorkContextStore();
  const infoStore = createMemoryInformationStore();
  const m365Store = createMemoryM365Store();
  const graph = new MockGraphPort();
  graph.seed(mechLoadItem(), officeXlsx());
  const work = new EngineeringWorkContextService(stubClient(), workStore);
  const information = new EngineeringInformationService(stubClient(), infoStore);
  const connector = createTestM365ConnectorService({
    work,
    information,
    store: m365Store,
    graph,
    secrets: options?.secrets,
    pilotWriteEnabled: options?.pilotWriteEnabled,
  });
  return { graph, connector, m365Store };
}

async function registerAllowlisted(connector: ReturnType<typeof createTestM365ConnectorService>) {
  await connector.saveConnection(admin(), CRUSHER_FEED_TENANT, a13aConnection());
  return connector.registerSharePointRepository(admin(), CRUSHER_FEED_TENANT, {
    connectionId: A13A_CONNECTION_ID,
    externalSiteId: A13A_SITE_ID,
    externalDriveId: A13A_DRIVE_A,
    repository: {
      id: "repo-a16b",
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scope: "PROJECT",
      repositoryType: "SHAREPOINT_LIBRARY",
      externalRepositoryId: A13A_SITE_ID,
      displayName: "Project A library",
      approvedRoot: "/Engineering/Mechanical",
      connectionId: A13A_CONNECTION_ID,
      enabled: true,
      capturePolicy: "MANAGED",
      createdBy: "eng-admin",
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-01T00:00:00.000Z",
    },
  });
}

describe("EOS-A16B HARDEN", () => {
  it("stays HARDEN-only and does not reopen V5B or enable returned ingest", () => {
    expect(A16B_PHASE).toBe("HARDEN");
    expect(A16B_V5B_REOPEN).toBe(false);
    expect(A16B_RETURNED_ARTIFACT_FLOW).toBe("DISABLED");
    expect(A16B_OFFICE_INSPECTION_OBJECT_STORAGE_ADAPTER).toBe("DEFERRED");
    expect(A16B_SCANNER_SECURITY_MODEL.hostedAuthRequired).toBe(true);
    expect(A16B_SCANNER_SECURITY_MODEL.redirectPolicy).toBe("FAIL_CLOSED_NO_FOLLOW");
    expect(A16B_RETRY_POLICY.authDenied).toBe("NO_RETRY");
    expect(a16bHardenAssertions().sharePointPilotMode).toBe("READ_ONLY");
    expect(returnedBinaryUploadsInPilot({})).toBe(false);
    expect(hostedMalwareScannerAvailable({ RTB_REVIEW_CLAMAV_URL: "http://127.0.0.1:3311/scan" } as NodeJS.ProcessEnv)).toBe(false);
    expect(PUBLIC_BUCKET_FORBIDDEN).toBe(true);
  });

  it("keeps SharePoint pilot read-only and requires Sites.Selected", () => {
    expect(SHAREPOINT_PILOT_MODE).toBe("READ_ONLY");
    expect(SHAREPOINT_REQUIRED_LIVE_PERMISSIONS.application).toBe("Sites.Selected");
    expect(SHAREPOINT_REQUIRED_LIVE_PERMISSIONS.writeForPilot).toBe("DISABLED");
    expect(DEFAULT_CONNECTOR_WRITE_POLICY).toBe("READ_ONLY");
    expect(liveSharePointExternalTestState()).toBe("BLOCKED_EXTERNAL_CONFIGURATION");
  });

  it("validates live-read configuration without accepting caller tokens or Graph URLs", () => {
    expect(validateSharePointLiveReadConfig({
      microsoftTenantId: "11111111-2222-3333-4444-555555555555",
      applicationId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      credentialSecretId: "secret:m365",
      externalSiteId: A13A_SITE_ID,
      externalDriveId: A13A_DRIVE_A,
    }).status).toBe("CONFIG_VALID");
    expect(validateSharePointLiveReadConfig({ graphUrl: "https://graph.microsoft.com/v1.0/sites" }).reason).toBe("ARBITRARY_URL_FETCH_PROHIBITED");
    expect(validateSharePointLiveReadConfig({
      microsoftTenantId: "t",
      applicationId: "a",
      credentialSecretId: "s",
      externalSiteId: "site",
      externalDriveId: "drive",
      accessToken: "caller-token",
    }).reason).toBe("caller_supplied_token_rejected");
    expect(rejectArbitraryUrlFetch("https://evil.example")).toBe("ARBITRARY_URL_FETCH_PROHIBITED");
    expect(rejectCallerConnectorCoreClaims({ accessToken: "x" })).toBe("caller_supplied_authority_rejected");
  });

  it("allowlists read, denies non-allowlisted / cross-scope, and fails closed on missing or invalid credentials", async () => {
    const { connector, graph } = await harness();
    const registered = await registerAllowlisted(connector);
    const sync = await connector.runSync(admin(), CRUSHER_FEED_TENANT, registered.repository.id, "initial");
    expect(sync.skipped).toBe(false);
    const sources = await connector.listSources(engineer(), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(sources.length).toBeGreaterThan(0);
    expect(registered.scope.publicationEnabled).toBe(false);
    expect(connector.catalog().writeEnabled).toBe(false);
    expect(connector.catalog().pilotMode).toBe("READ_ONLY");

    await expect(
      connector.publishArtifact(writer(), CRUSHER_FEED_TENANT, {
        repositoryId: registered.repository.id,
        fileName: "draft.xlsx",
        content: officeXlsx(),
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
    ).rejects.toThrow(/sharepoint_pilot_write_disabled/);

    await expect(
      connector.saveConnection(admin(), CRUSHER_FEED_TENANT, {
        ...a13aConnection(),
        accessToken: "caller-token",
      } as never),
    ).rejects.toThrow(/connector_secret_forbidden_on_record/);

    const otherTenant = createTestCommerceExecutionContext({
      tenantId: CRUSHER_FEED_OTHER_TENANT,
      workspaceId: CRUSHER_FEED_OTHER_WORKSPACE,
      policy: { productKey: "engineering-os", action: "settings.write", seatRequired: true },
    });
    await expect(connector.testConnection(otherTenant, CRUSHER_FEED_OTHER_TENANT, A13A_CONNECTION_ID)).rejects.toThrow(/connection_scope_denied/);

    const otherWorkspace = createTestCommerceExecutionContext({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_OTHER_WORKSPACE,
      policy: { productKey: "engineering-os", action: "analysis.read", seatRequired: true },
    });
    const otherWorkspaceSources = await connector.listSources(otherWorkspace, CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(otherWorkspaceSources).toEqual([]);

    const openCross = await connector.openManagedSource(engineer(), CRUSHER_FEED_TENANT, {
      sourceId: sources[0]?.id,
      projectId: "project-b-isolation",
    });
    expect(openCross.ok).toBe(false);

    graph.failAuth = true;
    const auth = await connector.testConnection(admin(), CRUSHER_FEED_TENANT, A13A_CONNECTION_ID);
    expect(auth.status).toBe("AUTHENTICATION_REQUIRED");
    expect(auth.secretsExposed).toBe(false);
    const retry = await connector.runSync(admin(), CRUSHER_FEED_TENANT, registered.repository.id, "delta");
    expect(retry.status).toBe("AUTHENTICATION_REQUIRED");
    const state = await connector.liveReadReadiness(admin(), CRUSHER_FEED_TENANT, registered.repository.id);
    expect(state.status).toBe("AUTH_FAILED");
    expect(state.writeEnabled).toBe(false);
    expect(state.secretsExposed).toBe(false);
    expect(JSON.stringify(state)).not.toContain("secret:m365-graph-client");
  });

  it("reports CONFIG_MISSING / CREDENTIAL_MISSING / SITE_NOT_ALLOWLISTED / READY_FOR_LIVE_READ honestly", async () => {
    const { connector, graph } = await harness({
      secrets: { async getSecretValue() { return "graph-secret"; } },
    });
    expect((await connector.liveReadReadiness(admin(), CRUSHER_FEED_TENANT)).status).toBe("CONFIG_MISSING");
    await connector.saveConnection(admin(), CRUSHER_FEED_TENANT, { ...a13aConnection(), credentialSecretId: "" });
    expect((await connector.liveReadReadiness(admin(), CRUSHER_FEED_TENANT)).status).toBe("CREDENTIAL_MISSING");
    const { connector: readyConnector } = await harness();
    const registered = await registerAllowlisted(readyConnector);
    const ready = await readyConnector.liveReadReadiness(admin(), CRUSHER_FEED_TENANT, registered.repository.id);
    expect(ready.status).toBe("READY_FOR_LIVE_READ");
    expect(ready.permissionModel).toBe("Sites.Selected");
    graph.failNetwork = true;
    expect(evaluateSharePointLiveReadiness({
      connection: a13aConnection(),
      scope: { externalSiteId: A13A_SITE_ID, externalDriveId: A13A_DRIVE_A },
      repositoryEnabled: true,
      repositoryAllowlisted: true,
      graphTest: { ok: false, status: "UNAVAILABLE", message: "network_failure" },
    }).status).toBe("SOURCE_UNAVAILABLE");
    expect(evaluateSharePointLiveReadiness({
      connection: a13aConnection(),
      scope: { externalSiteId: A13A_SITE_ID, externalDriveId: A13A_DRIVE_A },
      repositoryEnabled: true,
      repositoryAllowlisted: true,
      graphTest: { ok: false, status: "DEGRADED", message: "graph_forbidden" },
    }).status).toBe("PERMISSION_DENIED");
  });

  it("redacts connector secrets from observability", () => {
    const safe = observabilitySafe({
      connectorType: "SHAREPOINT",
      operation: "live_read_readiness",
      status: "AUTH_FAILED",
      durationMs: 9,
      tenantId: "t",
      workspaceId: "w",
      projectId: "p",
      accessToken: "secret",
      Authorization: "Bearer secret",
      contentBase64: "AAAA",
    });
    expect(safe.accessToken).toBeUndefined();
    expect(safe.contentBase64).toBeUndefined();
    expect(safe.connectorType).toBe("SHAREPOINT");
  });
});
