import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { describe, expect, it } from "vitest";
import { writeZip } from "../../artifact-automation/zip";
import { createMemoryInformationStore } from "../../information-intelligence/memory-store";
import { EngineeringInformationService } from "../../information-intelligence/service";
import { mechanicalLoadPolicy } from "../../information-intelligence/fixture";
import { CRUSHER_FEED_OTHER_TENANT, CRUSHER_FEED_OTHER_WORKSPACE } from "../../digital-thread/fixture";
import { createMemoryWorkContextStore } from "../../work-context/memory-store";
import { EngineeringWorkContextService } from "../../work-context/service";
import { DEFAULT_CAPTURE_POLICY } from "../../work-context/types";
import { createMemoryM365Store } from "./memory-store";
import { MockGraphPort } from "./graph";
import { createTestM365ConnectorService } from "./service";
import {
  A13A_CONNECTION_ID,
  A13A_DRIVE_A,
  A13A_DRIVE_B,
  A13A_ITEM_LOAD,
  A13A_SITE_ID,
  CRUSHER_EXPANSION_FEED_PROJECT_ID,
  CRUSHER_FEED_TENANT,
  CRUSHER_FEED_WORKSPACE,
  PROJECT_B_ID,
  a13aConnection,
  mechLoadItem,
  personalOneDriveItem,
  unmanagedSiteItem,
} from "./fixture";
import { M365_CONNECTOR_PRIVACY, M365_CONNECTOR_RECON, MICROSOFT_PERMISSION_MODEL } from "./types";
import { isAllowedGraphUrl, rejectArbitraryUrlFetch } from "./security";
import { microsoftSourceIdentity } from "./identity";

function admin() {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action: "settings.write", seatRequired: true },
  });
}

function engineer(action: "analysis.read" | "analysis.write" | "search.read" = "analysis.read") {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action, seatRequired: true },
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

async function harness(options?: { pilotWriteEnabled?: boolean }) {
  const workStore = createMemoryWorkContextStore();
  const infoStore = createMemoryInformationStore();
  const m365Store = createMemoryM365Store();
  const graph = new MockGraphPort();
  graph.seed(mechLoadItem(), officeXlsx());
  const work = new EngineeringWorkContextService(stubClient(), workStore);
  const information = new EngineeringInformationService(stubClient(), infoStore);
  const connector = createTestM365ConnectorService({ work, information, store: m365Store, graph, pilotWriteEnabled: options?.pilotWriteEnabled });
  return { workStore, infoStore, m365Store, graph, work, information, connector };
}

async function registerProjectA(connector: ReturnType<typeof createTestM365ConnectorService>, extras?: { projectId?: string; driveId?: string; root?: string; publication?: boolean; content?: "METADATA_ONLY" | "ON_DEMAND_CONTENT" }) {
  await connector.saveConnection(admin(), CRUSHER_FEED_TENANT, a13aConnection());
  return connector.registerSharePointRepository(admin(), CRUSHER_FEED_TENANT, {
    connectionId: A13A_CONNECTION_ID,
    externalSiteId: A13A_SITE_ID,
    externalDriveId: extras?.driveId ?? A13A_DRIVE_A,
    approvedRootItemId: "folder-loads",
    contentAccessPolicy: extras?.content ?? "METADATA_ONLY",
    publicationEnabled: extras?.publication ?? true,
    repository: {
      id: extras?.projectId === PROJECT_B_ID ? "repo-b" : "repo-a",
      projectId: extras?.projectId ?? CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scope: "PROJECT",
      repositoryType: "SHAREPOINT_LIBRARY",
      externalRepositoryId: extras?.driveId ?? A13A_DRIVE_A,
      displayName: extras?.projectId === PROJECT_B_ID ? "Project B library" : "Project A SharePoint library",
      approvedRoot: extras?.root ?? "/Engineering/Mechanical",
      connectionId: A13A_CONNECTION_ID,
      enabled: true,
      capturePolicy: "MANAGED",
      createdBy: "eng-admin",
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-01T00:00:00.000Z",
    },
  });
}

describe("EOS-A13A Microsoft 365 / SharePoint connector", () => {
  it("reuses platform integration infrastructure and preserves Feature Freeze boundaries", () => {
    expect(M365_CONNECTOR_RECON.newIntegrationFramework).toBe(false);
    expect(M365_CONNECTOR_RECON.jobService).toBe("REUSE");
    expect(M365_CONNECTOR_RECON.eventBus).toBe("REUSE");
    expect(M365_CONNECTOR_RECON.secretsService).toBe("REUSE");
    expect(M365_CONNECTOR_RECON.newDms).toBe(false);
    expect(M365_CONNECTOR_PRIVACY.defaultCapturePolicy).toBe("DENY");
    expect(M365_CONNECTOR_PRIVACY.allowlistedRepositoriesOnly).toBe(true);
    expect(M365_CONNECTOR_PRIVACY.newContentBase64Usage).toBe(false);
    expect(MICROSOFT_PERMISSION_MODEL.preferred).toMatch(/Sites\.Selected/);
    expect(DEFAULT_CAPTURE_POLICY).toBe("DENY");
  });

  it("registers an approved SharePoint library, syncs metadata-first, and paginates", async () => {
    const { connector, graph } = await harness();
    graph.seed({ ...mechLoadItem(), id: "item-2", name: "Notes.txt", pathWithinRoot: "/Engineering/Mechanical/Notes.txt", mimeType: "text/plain" });
    graph.seed({ ...mechLoadItem(), id: "item-3", name: "Spec.docx", pathWithinRoot: "/Engineering/Mechanical/Spec.docx" });
    graph.pageSize = 1;
    const registered = await registerProjectA(connector);
    expect(registered.repository.capturePolicy).toBe("MANAGED");
    const sync = await connector.runSync(admin(), CRUSHER_FEED_TENANT, registered.repository.id, "initial");
    expect(sync.skipped).toBe(false);
    expect((sync.scanned ?? 0) >= 1).toBe(true);
    const sources = await connector.listSources(engineer(), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(sources.some((row) => row.itemId === A13A_ITEM_LOAD)).toBe(true);
    expect(sources.find((row) => row.itemId === A13A_ITEM_LOAD)?.availability).toBe("ACTIVE");
    const catalog = connector.catalog();
    expect(catalog.defaultContentAccessPolicy).toBe("METADATA_ONLY");
    expect(catalog.personalOneDriveAccess).toBe("NO");
  });

  it("keeps stable Microsoft identity across rename and incremental revision", async () => {
    const { connector, graph, work, information } = await harness();
    const registered = await registerProjectA(connector);
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, registered.repository.id, "initial");
    graph.seed(mechLoadItem({ name: "Mechanical_Load_Rev_C_renamed.xlsx", pathWithinRoot: "/Engineering/Mechanical/Mechanical_Load_Rev_C_renamed.xlsx", etag: "etag-rev-c" }));
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, registered.repository.id, "delta");
    const afterRename = await connector.listSources(engineer(), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    const renamed = afterRename.filter((row) => row.itemId === A13A_ITEM_LOAD);
    expect(renamed).toHaveLength(1);
    expect(renamed[0].displayName).toMatch(/renamed/);
    graph.seed(mechLoadItem({ name: "Mechanical_Load_Rev_D.xlsx", pathWithinRoot: "/Engineering/Mechanical/Mechanical_Load_Rev_D.xlsx", etag: "etag-rev-d", lastModifiedAt: "2026-10-01T12:00:00.000Z" }));
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, registered.repository.id, "delta");
    const revised = (await connector.listSources(engineer(), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID)).find((row) => row.itemId === A13A_ITEM_LOAD);
    expect(revised?.etag).toBe("etag-rev-d");
    expect(microsoftSourceIdentity({ siteId: revised!.siteId, driveId: revised!.driveId, id: revised!.itemId })).toBe(`sp:${A13A_SITE_ID}:${A13A_DRIVE_A}:${A13A_ITEM_LOAD}`);
    const events = await work.list(engineer(), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(events.some((row) => row.eventType === "SOURCE_REVISED")).toBe(true);
    const replay = await connector.runSync(admin(), CRUSHER_FEED_TENANT, registered.repository.id, "delta");
    expect(replay.status === "READY" || replay.skipped).toBeTruthy();
    const replayEvents = await work.list(engineer(), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    const fingerprints = replayEvents.map((row) => row.sourceEventId);
    expect(new Set(fingerprints).size).toBe(fingerprints.length);
    const refs = await information.list(engineer(), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(refs.some((row) => row.sourceKind === "EXTERNAL_REFERENCE")).toBe(true);
  });

  it("protects out-of-order events and does not grant authority from SharePoint presence", async () => {
    const { connector, graph, information } = await harness();
    const registered = await registerProjectA(connector);
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, registered.repository.id, "initial");
    graph.seed(mechLoadItem({ etag: "etag-old", lastModifiedAt: "2026-01-01T00:00:00.000Z" }));
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, registered.repository.id, "delta");
    const source = (await connector.listSources(engineer(), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID)).find((row) => row.itemId === A13A_ITEM_LOAD);
    expect(source?.etag).toBe("etag-rev-c");
    const unresolved = await information.resolve(engineer(), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      informationType: "LOAD_DATA",
      purpose: "FOR_DESIGN_INPUT",
      actorId: "engineer-a1",
    });
    expect(unresolved.authorityState).not.toBe("AUTHORITATIVE_FOR_PURPOSE");
    await information.savePolicy(admin(), CRUSHER_FEED_TENANT, mechanicalLoadPolicy());
    const stillUnverified = await information.resolve(engineer(), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      informationType: "LOAD_DATA",
      purpose: "FOR_DESIGN_INPUT",
      discipline: "MECHANICAL",
      actorId: "engineer-a1",
    });
    expect(stillUnverified.explanation.engineeringApproved).toBe(false);
  });

  it("fails closed for move outside approved root, deletion provenance, and disabled repository", async () => {
    const { connector, graph, work } = await harness();
    const registered = await registerProjectA(connector);
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, registered.repository.id, "initial");
    const before = await connector.listSources(engineer(), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(before[0].availability).toBe("ACTIVE");
    graph.seed(mechLoadItem({ pathWithinRoot: "/Unmanaged/Mechanical_Load_Rev_C.xlsx" }));
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, registered.repository.id, "delta");
    const moved = (await connector.listSources(engineer(), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID)).find((row) => row.itemId === A13A_ITEM_LOAD);
    expect(moved?.availability).toBe("MOVED_OUTSIDE_SCOPE");
    graph.seed(mechLoadItem({ deleted: true, pathWithinRoot: "/Engineering/Mechanical/Mechanical_Load_Rev_C.xlsx" }));
    graph.items.set(`${A13A_DRIVE_A}:${A13A_ITEM_LOAD}`, mechLoadItem({ deleted: true }));
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, registered.repository.id, "initial");
    const deleted = (await connector.listSources(engineer(), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID)).find((row) => row.itemId === A13A_ITEM_LOAD);
    expect(deleted?.id).toBe(moved?.id);
    const events = await work.list(engineer(), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(events.length).toBeGreaterThan(0);
    await connector.disableRepository(admin(), CRUSHER_FEED_TENANT, registered.repository.id);
    graph.seed(mechLoadItem({ etag: "etag-after-disable", lastModifiedAt: "2026-10-02T00:00:00.000Z" }));
    const skipped = await connector.runSync(admin(), CRUSHER_FEED_TENANT, registered.repository.id, "delta");
    expect(skipped.skipped).toBe(true);
  });

  it("prevents cross-project contamination and ignores unmanaged SharePoint sites", async () => {
    const { connector, graph } = await harness();
    graph.seed(unmanagedSiteItem());
    graph.seed({ ...mechLoadItem(), id: "item-b", driveId: A13A_DRIVE_B, name: "ProjectB.xlsx", pathWithinRoot: "/Engineering/ProjectB.xlsx", webUrl: "https://contoso.sharepoint.com/sites/eng/ProjectB.xlsx" });
    const repoA = await registerProjectA(connector);
    const repoB = await registerProjectA(connector, { projectId: PROJECT_B_ID, driveId: A13A_DRIVE_B, root: "/Engineering" });
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, repoA.repository.id, "initial");
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, repoB.repository.id, "initial");
    const aSources = await connector.listSources(engineer(), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    const bSources = await connector.listSources(engineer(), CRUSHER_FEED_TENANT, PROJECT_B_ID);
    expect(aSources.every((row) => row.projectId === CRUSHER_EXPANSION_FEED_PROJECT_ID)).toBe(true);
    expect(bSources.every((row) => row.projectId === PROJECT_B_ID)).toBe(true);
    expect(aSources.some((row) => row.itemId === "item-b")).toBe(false);
    expect(aSources.some((row) => row.siteId === "site-unmanaged")).toBe(false);
    const openCross = await connector.openManagedSource(engineer(), CRUSHER_FEED_TENANT, {
      sourceId: aSources[0]?.id,
      projectId: PROJECT_B_ID,
    });
    expect(openCross.ok).toBe(false);
  });

  it("handles throttle, network, and authentication failures without deleting managed state", async () => {
    const { connector, graph } = await harness();
    const registered = await registerProjectA(connector);
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, registered.repository.id, "initial");
    graph.throttleRemaining = 1;
    const throttled = await connector.runSync(admin(), CRUSHER_FEED_TENANT, registered.repository.id, "delta");
    expect(throttled.status).toBe("RATE_LIMITED");
    graph.failNetwork = true;
    const degraded = await connector.runSync(admin(), CRUSHER_FEED_TENANT, registered.repository.id, "delta");
    expect(degraded.status).toBe("DEGRADED");
    graph.failNetwork = false;
    graph.failAuth = true;
    const auth = await connector.testConnection(admin(), CRUSHER_FEED_TENANT, A13A_CONNECTION_ID);
    expect(auth.status).toBe("AUTHENTICATION_REQUIRED");
    const remaining = await connector.listSources(engineer(), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(remaining.length).toBeGreaterThan(0);
  });

  it("publishes generated artifacts explicitly and retrieves SharePoint templates on demand", async () => {
    const { connector, graph } = await harness({ pilotWriteEnabled: true });
    const registered = await registerProjectA(connector, { content: "ON_DEMAND_CONTENT", publication: true });
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, registered.repository.id, "initial");
    const published = await connector.publishArtifact(engineer("analysis.write"), CRUSHER_FEED_TENANT, {
      repositoryId: registered.repository.id,
      fileName: "ER-A1_STR_Crusher_Support_DRAFT.xlsx",
      content: officeXlsx(),
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      artifactId: "art-1",
    });
    expect(published.ok).toBe(true);
    expect(published.engineeringApproved).toBe(false);
    const sources = await connector.listSources(engineer(), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    const templateSource = sources.find((row) => row.itemId === A13A_ITEM_LOAD)!;
    const retrieved = await connector.retrieveTemplateBinary(engineer(), CRUSHER_FEED_TENANT, {
      sourceId: templateSource.id,
      expectedFormat: "XLSX",
    });
    expect(retrieved.ok).toBe(true);
    if (retrieved.ok) expect(retrieved.storedInPostgres).toBe(false);
    graph.contents.delete(`${A13A_DRIVE_A}:${A13A_ITEM_LOAD}`);
    const missing = await connector.retrieveTemplateBinary(engineer(), CRUSHER_FEED_TENANT, {
      sourceId: templateSource.id,
      expectedFormat: "XLSX",
    });
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.reason).toBe("TEMPLATE_UNAVAILABLE");
  });

  it("does not enumerate personal OneDrive or email and blocks SSRF", async () => {
    const { connector, graph } = await harness();
    graph.seed(personalOneDriveItem());
    const registered = await registerProjectA(connector);
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, registered.repository.id, "initial");
    expect(graph.listedPersonalDrive).toBe(false);
    expect(graph.listedMail).toBe(false);
    const sources = await connector.listSources(engineer(), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(sources.some((row) => row.itemId === "item-personal")).toBe(false);
    expect(isAllowedGraphUrl("https://graph.microsoft.com/v1.0/sites")).toBe(true);
    expect(isAllowedGraphUrl("https://169.254.169.254/latest/meta-data")).toBe(false);
    expect(isAllowedGraphUrl("http://graph.microsoft.com/v1.0/sites")).toBe(false);
    expect(rejectArbitraryUrlFetch("https://evil.example/steal")).toBe("ARBITRARY_URL_FETCH_PROHIBITED");
    expect(connector.rejectCallerClaims({ url: "https://evil.example" })).toBe("ARBITRARY_URL_FETCH_PROHIBITED");
    expect(connector.rejectCallerClaims({ tenantId: "other" })).toBe("caller_supplied_authority_rejected");
    const forgedOpen = await connector.openManagedSource(engineer(), CRUSHER_FEED_TENANT, { url: "https://evil.example" });
    expect(forgedOpen.ok).toBe(false);
  });

  it("denies cross-tenant connection use and keeps secrets off repository rows", async () => {
    const { connector } = await harness();
    await registerProjectA(connector);
    const other = createTestCommerceExecutionContext({
      tenantId: CRUSHER_FEED_OTHER_TENANT,
      workspaceId: CRUSHER_FEED_OTHER_WORKSPACE,
      policy: { productKey: "engineering-os", action: "settings.write", seatRequired: true },
    });
    await expect(
      connector.testConnection(other, CRUSHER_FEED_OTHER_TENANT, A13A_CONNECTION_ID),
    ).rejects.toThrow(/connection_scope_denied/);
    const health = await connector.health(engineer(), CRUSHER_FEED_TENANT);
    expect(health.connections[0]?.secretValuePresent).toBe(false);
    expect(JSON.stringify(a13aConnection())).not.toMatch(/client_secret|BEGIN PRIVATE KEY|eyJ/);
  });

  it("exposes search hits without a second search engine and remains SME-independent", async () => {
    const { connector } = await harness();
    const registered = await registerProjectA(connector);
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, registered.repository.id, "initial");
    const hits = await connector.searchManagedSources(
      createTestCommerceExecutionContext({
        tenantId: CRUSHER_FEED_TENANT,
        workspaceId: CRUSHER_FEED_WORKSPACE,
        policy: { productKey: "engineering-os", action: "search.read", seatRequired: true },
      }),
      CRUSHER_FEED_TENANT,
      CRUSHER_EXPANSION_FEED_PROJECT_ID,
    );
    expect(hits[0]?.objectType).toBe("engineering_external_source");
    expect(hits[0]?.indexedBody).toBe(false);
    expect(connector.catalog().smeIndependent).toBe(true);
    expect(connector.catalog().teamsConnector).toBe("CONTRACT_ONLY");
    expect(connector.catalog().webhookChangeNotification).toBe("DEFERRED");
  });

  it("does not add relational content_base64 columns in the A13A migration", () => {
    const sql = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../../../../supabase/migrations/20261001180000_eos_a13a_m365_sharepoint_connector.sql"), "utf8");
    expect(sql).not.toMatch(/content_base64/i);
    expect(sql).toContain("engineering_m365_connections");
    expect(sql).toContain("engineering_external_source_refs");
  });
});
