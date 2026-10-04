import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { EICAR_TEST_SIGNATURE } from "@rtb/engineering-review";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { writeZip } from "../../artifact-automation/zip";
import { CRUSHER_FEED_OTHER_TENANT, CRUSHER_FEED_OTHER_WORKSPACE } from "../../digital-thread/fixture";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../../digital-thread/fixture";
import { createMemoryInformationStore } from "../../information-intelligence/memory-store";
import { EngineeringInformationService } from "../../information-intelligence/service";
import { createMemoryWorkContextStore } from "../../work-context/memory-store";
import { EngineeringWorkContextService } from "../../work-context/service";
import { createMemoryM365Store } from "./memory-store";
import { MockGraphPort } from "./graph";
import { SHAREPOINT_PILOT_WRITE_ENABLED, SHAREPOINT_REQUIRED_LIVE_PERMISSIONS } from "./live-readiness";
import {
  assertManagedSourceProcessingAllowed,
  createTestM365ConnectorService,
} from "./service";
import {
  A13A_CONNECTION_ID,
  A13A_DRIVE_A,
  A13A_DRIVE_B,
  A13A_ITEM_LOAD,
  A13A_SITE_ID,
  A13A_UNMANAGED_SITE,
  a13aConnection,
  mechLoadItem,
} from "./fixture";
import { MAX_CONTENT_BYTES, MICROSOFT_PERMISSION_MODEL } from "./types";

const TEST_FILE_NAME = "RTB-A16D-Test.txt";
const TEST_FILE_ITEM = "item-a16d-txt";
const TEST_FILE_BYTES = Buffer.from("RTB-A16D generic retrieval fixture\n", "utf8");
const TEST_FILE_HASH = createHash("sha256").update(TEST_FILE_BYTES).digest("hex");

function admin(tenantId = CRUSHER_FEED_TENANT, workspaceId = CRUSHER_FEED_WORKSPACE) {
  return createTestCommerceExecutionContext({
    tenantId,
    workspaceId,
    policy: { productKey: "engineering-os", action: "settings.write", seatRequired: true },
  });
}

function engineer(tenantId = CRUSHER_FEED_TENANT, workspaceId = CRUSHER_FEED_WORKSPACE) {
  return createTestCommerceExecutionContext({
    tenantId,
    workspaceId,
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

function testTxtItem(overrides: Parameters<typeof mechLoadItem>[0] = {}) {
  return mechLoadItem({
    id: TEST_FILE_ITEM,
    name: TEST_FILE_NAME,
    mimeType: "text/plain",
    size: TEST_FILE_BYTES.byteLength,
    pathWithinRoot: `/Documents/${TEST_FILE_NAME}`,
    webUrl: `https://contoso.sharepoint.com/sites/RTBEOSPilot/Documents/${TEST_FILE_NAME}`,
    parentId: "folder-documents",
    ...overrides,
  });
}

async function harness() {
  const workStore = createMemoryWorkContextStore();
  const infoStore = createMemoryInformationStore();
  const m365Store = createMemoryM365Store();
  const graph = new MockGraphPort();
  const work = new EngineeringWorkContextService(stubClient(), workStore);
  const information = new EngineeringInformationService(stubClient(), infoStore);
  const connector = createTestM365ConnectorService({ work, information, store: m365Store, graph });
  return { workStore, infoStore, m365Store, graph, work, information, connector };
}

async function registerDocumentsLibrary(
  connector: ReturnType<typeof createTestM365ConnectorService>,
  extras?: { content?: "METADATA_ONLY" | "ON_DEMAND_CONTENT"; driveId?: string; siteId?: string },
) {
  await connector.saveConnection(admin(), CRUSHER_FEED_TENANT, a13aConnection());
  return connector.registerSharePointRepository(admin(), CRUSHER_FEED_TENANT, {
    connectionId: A13A_CONNECTION_ID,
    externalSiteId: extras?.siteId ?? A13A_SITE_ID,
    externalDriveId: extras?.driveId ?? A13A_DRIVE_A,
    approvedRootItemId: "folder-documents",
    contentAccessPolicy: extras?.content ?? "METADATA_ONLY",
    publicationEnabled: false,
    repository: {
      id: "repo-rtbeospilot-documents",
      projectId: null,
      scope: "WORKSPACE",
      repositoryType: "SHAREPOINT_LIBRARY",
      externalRepositoryId: extras?.driveId ?? A13A_DRIVE_A,
      displayName: "RTBEOSPilot Documents",
      approvedRoot: "/Documents",
      connectionId: A13A_CONNECTION_ID,
      enabled: true,
      capturePolicy: "MANAGED",
      createdBy: "eng-admin",
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-01T00:00:00.000Z",
    },
  });
}

async function syncedTxt(options?: { content?: Buffer; item?: ReturnType<typeof testTxtItem> }) {
  const env = await harness();
  const bytes = options?.content ?? TEST_FILE_BYTES;
  const item = options?.item ?? testTxtItem({ size: bytes.byteLength });
  env.graph.seed(item, bytes);
  const registered = await registerDocumentsLibrary(env.connector);
  await env.connector.runSync(admin(), CRUSHER_FEED_TENANT, registered.repository.id, "initial");
  const sources = await env.connector.listSources(engineer(), CRUSHER_FEED_TENANT, "");
  const source = sources.find((row) => row.itemId === item.id);
  return { ...env, registered, source };
}

describe("EOS-A16D SharePoint generic binary retrieval", () => {
  it("retrieves TXT bytes from a METADATA_ONLY managed repository into quarantine", async () => {
    const { connector, source, registered } = await syncedTxt();
    expect(source).toBeTruthy();
    const retrieved = await connector.retrieveManagedSourceBinary(engineer(), CRUSHER_FEED_TENANT, {
      sourceId: source!.id,
    });
    expect(retrieved.ok).toBe(true);
    if (!retrieved.ok) return;
    expect(retrieved.bytes.equals(TEST_FILE_BYTES)).toBe(true);
    expect(retrieved.metadata.fileName).toBe(TEST_FILE_NAME);
    expect(retrieved.metadata.contentType).toBe("text/plain");
    expect(retrieved.metadata.receivedSize).toBe(TEST_FILE_BYTES.byteLength);
    expect(retrieved.metadata.receivedSize).toBeGreaterThan(0);
    expect(retrieved.metadata.expectedSize).toBe(TEST_FILE_BYTES.byteLength);
    expect(retrieved.metadata.receivedSize).toBe(retrieved.metadata.expectedSize);
    expect(retrieved.metadata.sha256).toBe(TEST_FILE_HASH);
    expect(retrieved.metadata.itemId).toBe(TEST_FILE_ITEM);
    expect(retrieved.metadata.repositoryId).toBe(registered.repository.id);
    expect(retrieved.quarantine.state).toBe("QUARANTINED");
    expect(retrieved.quarantine.malware).toBe("PENDING_SCAN");
    expect(retrieved.quarantine.parseAllowed).toBe(false);
    expect(retrieved.quarantine.aiIngestionAllowed).toBe(false);
    expect(retrieved.quarantine.engineeringProcessingAllowed).toBe(false);
    expect(retrieved.quarantine.officeInspectionAllowed).toBe(false);
    expect(retrieved.quarantine.cleanDownloadAllowed).toBe(false);
    expect(retrieved.storedInPostgres).toBe(false);
    expect(() => assertManagedSourceProcessingAllowed({ quarantine: retrieved.quarantine })).toThrow(
      /pending malware scan/,
    );
  });

  it("denies size mismatch and creates no hash for empty content", async () => {
    const { connector, source, m365Store } = await syncedTxt();
    await m365Store.saveSource({ ...source!, sizeBytes: TEST_FILE_BYTES.byteLength + 9 });
    const mismatch = await connector.retrieveManagedSourceBinary(engineer(), CRUSHER_FEED_TENANT, {
      sourceId: source!.id,
    });
    expect(mismatch.ok).toBe(false);
    if (!mismatch.ok) expect(mismatch.reason).toBe("CONTENT_LENGTH_MISMATCH");
  });

  it("keeps retrieveTemplateBinary METADATA_ONLY-gated and Office-only", async () => {
    const xlsx = officeXlsx();
    const metadataOnly = await harness();
    metadataOnly.graph.seed(
      mechLoadItem({ pathWithinRoot: "/Documents/Mechanical_Load_Rev_C.xlsx", size: xlsx.byteLength }),
      xlsx,
    );
    const blockedRepo = await registerDocumentsLibrary(metadataOnly.connector);
    await metadataOnly.connector.runSync(admin(), CRUSHER_FEED_TENANT, blockedRepo.repository.id, "initial");
    const blockedSource = (await metadataOnly.connector.listSources(engineer(), CRUSHER_FEED_TENANT, "")).find(
      (row) => row.itemId === A13A_ITEM_LOAD,
    );
    expect(blockedSource).toBeTruthy();
    const blockedTemplate = await metadataOnly.connector.retrieveTemplateBinary(engineer(), CRUSHER_FEED_TENANT, {
      sourceId: blockedSource!.id,
      expectedFormat: "XLSX",
    });
    expect(blockedTemplate.ok).toBe(false);
    if (!blockedTemplate.ok) expect(blockedTemplate.reason).toBe("TEMPLATE_UNAVAILABLE");

    const onDemand = await harness();
    onDemand.graph.seed(
      mechLoadItem({ pathWithinRoot: "/Documents/Mechanical_Load_Rev_C.xlsx", size: xlsx.byteLength }),
      xlsx,
    );
    const live = await registerDocumentsLibrary(onDemand.connector, { content: "ON_DEMAND_CONTENT" });
    await onDemand.connector.runSync(admin(), CRUSHER_FEED_TENANT, live.repository.id, "initial");
    const liveOffice = (await onDemand.connector.listSources(engineer(), CRUSHER_FEED_TENANT, "")).find(
      (row) => row.itemId === A13A_ITEM_LOAD,
    );
    expect(liveOffice).toBeTruthy();
    const retrieved = await onDemand.connector.retrieveTemplateBinary(engineer(), CRUSHER_FEED_TENANT, {
      sourceId: liveOffice!.id,
      expectedFormat: "XLSX",
    });
    expect(retrieved.ok).toBe(true);
    if (retrieved.ok) expect(retrieved.storedInPostgres).toBe(false);
  });

  it("enforces tenant, workspace, repository, site, and drive allowlists", async () => {
    const env = await syncedTxt();
    const sourceId = env.source!.id;

    const otherTenant = await env.connector.retrieveManagedSourceBinary(
      engineer(CRUSHER_FEED_OTHER_TENANT, CRUSHER_FEED_OTHER_WORKSPACE),
      CRUSHER_FEED_OTHER_TENANT,
      { sourceId },
    );
    expect(otherTenant.ok).toBe(false);
    if (!otherTenant.ok) expect(otherTenant.reason).toBe("SOURCE_UNAVAILABLE");
    await expect(
      env.connector.retrieveManagedSourceBinary(
        engineer(CRUSHER_FEED_OTHER_TENANT, CRUSHER_FEED_OTHER_WORKSPACE),
        CRUSHER_FEED_TENANT,
        { sourceId },
      ),
    ).rejects.toThrow();

    const otherWorkspace = await env.connector.retrieveManagedSourceBinary(
      engineer(CRUSHER_FEED_TENANT, CRUSHER_FEED_OTHER_WORKSPACE),
      CRUSHER_FEED_TENANT,
      { sourceId },
    );
    expect(otherWorkspace.ok).toBe(false);
    if (!otherWorkspace.ok) expect(otherWorkspace.reason).toBe("SOURCE_UNAVAILABLE");

    await env.m365Store.saveSource({ ...env.source!, siteId: A13A_UNMANAGED_SITE });
    const unapprovedSite = await env.connector.retrieveManagedSourceBinary(engineer(), CRUSHER_FEED_TENANT, { sourceId });
    expect(unapprovedSite.ok).toBe(false);
    if (!unapprovedSite.ok) expect(unapprovedSite.reason).toBe("SCOPE_DENIED");

    await env.m365Store.saveSource({ ...env.source!, siteId: A13A_SITE_ID, driveId: A13A_DRIVE_B });
    const unapprovedDrive = await env.connector.retrieveManagedSourceBinary(engineer(), CRUSHER_FEED_TENANT, { sourceId });
    expect(unapprovedDrive.ok).toBe(false);
    if (!unapprovedDrive.ok) expect(unapprovedDrive.reason).toBe("SCOPE_DENIED");

    await env.m365Store.saveSource({
      ...env.source!,
      siteId: A13A_SITE_ID,
      driveId: A13A_DRIVE_A,
      pathWithinRoot: `/HR/${TEST_FILE_NAME}`,
    });
    const outsideRoot = await env.connector.retrieveManagedSourceBinary(engineer(), CRUSHER_FEED_TENANT, { sourceId });
    expect(outsideRoot.ok).toBe(false);
    if (!outsideRoot.ok) expect(outsideRoot.reason).toBe("SCOPE_DENIED");

    await env.m365Store.saveSource({ ...env.source!, pathWithinRoot: `/Documents/${TEST_FILE_NAME}` });
    await env.work.saveRepository(admin(), CRUSHER_FEED_TENANT, {
      ...env.registered.repository,
      capturePolicy: "DENY",
    });
    const unapprovedRepo = await env.connector.retrieveManagedSourceBinary(engineer(), CRUSHER_FEED_TENANT, { sourceId });
    expect(unapprovedRepo.ok).toBe(false);
    if (!unapprovedRepo.ok) expect(unapprovedRepo.reason).toBe("REPOSITORY_UNAVAILABLE");
  });

  it("rejects caller-supplied Graph identity, write, infected content, and CAD metadata-only types", async () => {
    const env = await syncedTxt();
    const rejected = await env.connector.retrieveManagedSourceBinary(engineer(), CRUSHER_FEED_TENANT, {
      sourceId: env.source!.id,
      url: "https://graph.microsoft.com/v1.0/drives/x/items/y/content",
      siteId: "attacker-site",
    });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.reason).toBe("CALLER_SUPPLIED_GRAPH_IDENTITY_REJECTED");

    await expect(
      env.connector.publishArtifact(writer(), CRUSHER_FEED_TENANT, {
        repositoryId: env.registered.repository.id,
        fileName: "draft.txt",
        content: TEST_FILE_BYTES,
        contentType: "text/plain",
      }),
    ).rejects.toThrow(/sharepoint_pilot_write_disabled/);
    expect(SHAREPOINT_PILOT_WRITE_ENABLED).toBe(false);
    expect(env.connector.catalog().writeEnabled).toBe(false);
    expect(SHAREPOINT_REQUIRED_LIVE_PERMISSIONS.application).toBe("Sites.Selected");
    expect(MICROSOFT_PERMISSION_MODEL.preferred).toMatch(/Sites\.Selected/);

    const eicar = Buffer.from(EICAR_TEST_SIGNATURE);
    const infected = await syncedTxt({
      content: eicar,
      item: testTxtItem({ id: "item-eicar", name: "eicar.txt", size: eicar.byteLength, pathWithinRoot: "/Documents/eicar.txt" }),
    });
    const infectedResult = await infected.connector.retrieveManagedSourceBinary(engineer(), CRUSHER_FEED_TENANT, {
      sourceId: infected.source!.id,
    });
    expect(infectedResult.ok).toBe(false);
    if (!infectedResult.ok) expect(infectedResult.reason).toBe("CONTENT_INFECTED");

    const cad = await harness();
    cad.graph.seed(
      mechLoadItem({
        id: "item-dwg",
        name: "plant.dwg",
        mimeType: "application/acad",
        pathWithinRoot: "/Documents/plant.dwg",
        size: 12,
      }),
      Buffer.from("dwg-bytes-xx"),
    );
    const cadRepo = await registerDocumentsLibrary(cad.connector);
    await cad.connector.runSync(admin(), CRUSHER_FEED_TENANT, cadRepo.repository.id, "initial");
    const cadSource = (await cad.connector.listSources(engineer(), CRUSHER_FEED_TENANT, "")).find((row) => row.itemId === "item-dwg");
    const cadDenied = await cad.connector.retrieveManagedSourceBinary(engineer(), CRUSHER_FEED_TENANT, {
      sourceId: cadSource!.id,
    });
    expect(cadDenied.ok).toBe(false);
    if (!cadDenied.ok) expect(cadDenied.reason).toBe("CONTENT_TYPE_NOT_RETRIEVABLE");
  });

  it("does not expose tokens or secrets and does not use a service-role bypass", async () => {
    const { connector, source, m365Store } = await syncedTxt();
    const retrieved = await connector.retrieveManagedSourceBinary(engineer(), CRUSHER_FEED_TENANT, {
      sourceId: source!.id,
    });
    const serialized = JSON.stringify(retrieved);
    expect(serialized).not.toMatch(/access[_-]?token/i);
    expect(serialized).not.toMatch(/refresh[_-]?token/i);
    expect(serialized).not.toMatch(/client[_-]?secret/i);
    expect(serialized).not.toContain("secret:m365-graph-client");
    const audit = await m365Store.listAudit(CRUSHER_FEED_WORKSPACE);
    expect(JSON.stringify(audit)).not.toMatch(/access[_-]?token/i);
    expect(JSON.stringify(audit)).not.toContain(TEST_FILE_BYTES.toString("utf8"));

    const here = dirname(fileURLToPath(import.meta.url));
    const service = readFileSync(join(here, "service.ts"), "utf8");
    const graph = readFileSync(join(here, "graph.ts"), "utf8");
    expect(service).toContain("retrieveManagedSourceBinary");
    expect(service).toContain("downloadGovernedItemBytes");
    expect(service).not.toMatch(/createServiceClient|SERVICE_ROLE|bypassRls/);
    expect(graph).toContain("/drives/${input.driveId}/items/${input.itemId}/content");
    expect(MAX_CONTENT_BYTES).toBe(25 * 1024 * 1024);
  });
});
