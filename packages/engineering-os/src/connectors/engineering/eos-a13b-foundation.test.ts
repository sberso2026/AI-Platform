import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { describe, expect, it } from "vitest";
import { createMemoryInformationStore } from "../../information-intelligence/memory-store";
import { EngineeringInformationService } from "../../information-intelligence/service";
import { createMemoryWorkContextStore } from "../../work-context/memory-store";
import { EngineeringWorkContextService } from "../../work-context/service";
import { DEFAULT_CAPTURE_POLICY } from "../../work-context/types";
import { createMemoryWorkPlanStore } from "../../work-generator/memory-store";
import { EngineeringWorkGeneratorService } from "../../work-generator/service";
import { createTestChangeWorkbenchService } from "../../change-workbench/service";
import { fieldChangeFixture } from "../../change-workbench/fixture";
import { createMemoryEngineeringConnectorStore } from "./memory-store";
import { MockVendorPort } from "./ports";
import { createTestEngineeringConnectorService } from "./service";
import {
  A13B_ACCOUNT,
  A13B_PROJECT_A,
  A13B_PROJECT_B,
  A13B_UNREGISTERED_PROJECT,
  CRUSHER_FEED_TENANT,
  CRUSHER_FEED_WORKSPACE,
  a13bConnection,
  bimClash,
  bimModel,
  drawingRevC,
  drawingRevD,
  fieldChangeAnchor,
  projectBRfi,
  rfi142,
  scheduleComplete,
  scheduleMilestone,
  transmittalT12,
  unregisteredProjectDoc,
} from "./fixture";
import {
  CONNECTOR_CERTIFICATION_MATRIX,
  ENGINEERING_CONNECTOR_AI_BOUNDARY,
  ENGINEERING_CONNECTOR_PRIVACY,
  ENGINEERING_CONNECTOR_RECON,
} from "./types";
import { isGovernedExternalWebUrl, rejectArbitraryUrlFetch } from "./security";
import { scheduleDoesNotCompleteDeliverable } from "./compose";
import { SPACE_GASS_CATALOG_ENTRY } from "../../external-tools/catalog";

function admin() {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action: "settings.write", seatRequired: true },
  });
}

function engineer(action: "analysis.read" | "analysis.write" = "analysis.read") {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

function stubClient() {
  return { from() { return this; } } as never;
}

async function harness(portObjects: ReturnType<typeof rfi142>[] = []) {
  const work = new EngineeringWorkContextService(stubClient(), createMemoryWorkContextStore());
  const information = new EngineeringInformationService(stubClient(), createMemoryInformationStore());
  const workGenerator = new EngineeringWorkGeneratorService(stubClient(), createMemoryWorkPlanStore());
  const changeWorkbench = createTestChangeWorkbenchService({ graph: fieldChangeFixture() });
  const store = createMemoryEngineeringConnectorStore();
  const port = new MockVendorPort("ACONEX");
  for (const object of portObjects) port.seed(object);
  const connector = createTestEngineeringConnectorService({ work, information, store, workGenerator, changeWorkbench, ports: new Map() });
  const connection = await connector.saveConnection(admin(), CRUSHER_FEED_TENANT, a13bConnection());
  connector.registerPort(connection.id, port);
  return { work, information, workGenerator, changeWorkbench, connector, port, connection };
}

async function bind(connector: ReturnType<typeof createTestEngineeringConnectorService>, connectionId: string, eosProjectId: string, externalProjectId: string, repoId: string) {
  return connector.bindProject(admin(), CRUSHER_FEED_TENANT, {
    connectionId,
    eosProjectId,
    externalAccountId: A13B_ACCOUNT,
    externalProjectId,
    externalScope: "Engineering",
    repository: { id: repoId, displayName: `${eosProjectId} EDMS`, repositoryType: "ENGINEERING_EDMS" },
  });
}

describe("EOS-A13B engineering EDMS construction connectors", () => {
  it("reuses A13A connector foundation and preserves Feature Freeze", () => {
    expect(ENGINEERING_CONNECTOR_RECON.a13aConnectorFoundation).toBe("REUSE");
    expect(ENGINEERING_CONNECTOR_RECON.secrets).toBe("REUSE");
    expect(ENGINEERING_CONNECTOR_RECON.jobService).toBe("REUSE");
    expect(ENGINEERING_CONNECTOR_RECON.eventBus).toBe("REUSE");
    expect(ENGINEERING_CONNECTOR_RECON.newConnectorFramework).toBe(false);
    expect(ENGINEERING_CONNECTOR_RECON.newDms).toBe(false);
    expect(ENGINEERING_CONNECTOR_RECON.newRfiDomain).toBe(false);
    expect(ENGINEERING_CONNECTOR_RECON.newChangeDomain).toBe(false);
    expect(ENGINEERING_CONNECTOR_PRIVACY.defaultCapturePolicy).toBe("DENY");
    expect(ENGINEERING_CONNECTOR_PRIVACY.defaultWritePolicy).toBe("READ_ONLY");
    expect(ENGINEERING_CONNECTOR_PRIVACY.binaryDuplication).toBe("NO");
    expect(ENGINEERING_CONNECTOR_PRIVACY.geometryEngineCreated).toBe(false);
    expect(ENGINEERING_CONNECTOR_PRIVACY.spaceGassGuiAutomation).toBe(false);
    expect(ENGINEERING_CONNECTOR_AI_BOUNDARY.mayIssueRfi).toBe(false);
    expect(ENGINEERING_CONNECTOR_AI_BOUNDARY.mayPublishFormalResponse).toBe(false);
    expect(CONNECTOR_CERTIFICATION_MATRIX.some((row) => row.vendor === "ACONEX" && row.liveRead === "NOT_TESTED")).toBe(true);
    expect(DEFAULT_CAPTURE_POLICY).toBe("DENY");
    expect(SPACE_GASS_CATALOG_ENTRY.toolCode).toBe("spacegass");
  });

  it("ingests an external RFI into Project A, Work Plan, and engineering-language context", async () => {
    const { connector, connection, workGenerator, work } = await harness([rfi142(), drawingRevC()]);
    await bind(connector, connection.id, A13B_PROJECT_A, "ext-project-a", "repo-edms-a");
    const sync = await connector.runSync(admin(), CRUSHER_FEED_TENANT, connection.id);
    expect(sync.skipped).toBe(false);
    const objects = await connector.listObjects(engineer(), CRUSHER_FEED_TENANT, A13B_PROJECT_A);
    const rfi = objects.find((row) => row.objectNumber === "RFI-142");
    expect(rfi?.projectId).toBe(A13B_PROJECT_A);
    expect(rfi?.presentation.externalSystem).toBe("Aconex");
    expect(rfi?.presentation.restPathHidden).toBe(true);
    expect(rfi?.objectId).toBe("ext-rfi-142");
    await workGenerator.generatePlan(engineer("analysis.write"), CRUSHER_FEED_TENANT, {
      projectId: A13B_PROJECT_A,
      workType: "RFI_TQ_RESPONSE",
      lifecycleStage: "CONSTRUCTION",
      relatedObjectType: "technical_query",
      relatedObjectId: "RFI-142",
    });
    const plans = await workGenerator.listPlans(engineer(), CRUSHER_FEED_TENANT, A13B_PROJECT_A);
    expect(plans.some((row) => row.workType === "RFI_TQ_RESPONSE" && row.relatedObjectId === "RFI-142")).toBe(true);
    const events = await work.list(engineer(), CRUSHER_FEED_TENANT, A13B_PROJECT_A);
    expect(events.some((row) => row.eventType === "RFI_CREATED")).toBe(true);
    const replay = await connector.runSync(admin(), CRUSHER_FEED_TENANT, connection.id);
    expect(replay.itemsChanged).toBe(0);
  });

  it("blocks publication when the external RFI version changed", async () => {
    const { connector, connection, port } = await harness([rfi142()]);
    await bind(connector, connection.id, A13B_PROJECT_A, "ext-project-a", "repo-edms-a");
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, connection.id);
    await connector.setWritePolicy(admin(), CRUSHER_FEED_TENANT, connection.id, "SUBMIT_DRAFT_RESPONSE");
    port.seed({ ...rfi142(), etag: "etag-rfi-b", version: "B", occurredAt: "2026-10-01T09:00:00.000Z" });
    const objects = await connector.listObjects(engineer(), CRUSHER_FEED_TENANT, A13B_PROJECT_A);
    await expect(
      connector.publishEngineeringResponse(engineer("analysis.write"), CRUSHER_FEED_TENANT, {
        objectRefId: objects[0].id,
        preparedEtag: "etag-rfi-a",
        humanConfirmed: true,
        writeAction: "SUBMIT_DRAFT_RESPONSE",
      }),
    ).rejects.toThrow("EXTERNAL_STATE_CHANGED");
  });

  it("preserves drawing identity across Rev C to Rev D without granting authority", async () => {
    const { connector, connection, port } = await harness([drawingRevC()]);
    await bind(connector, connection.id, A13B_PROJECT_A, "ext-project-a", "repo-edms-a");
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, connection.id);
    const first = (await connector.listObjects(engineer(), CRUSHER_FEED_TENANT, A13B_PROJECT_A)).find((row) => row.objectId === "ext-dwg-s104");
    port.seed(drawingRevD());
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, connection.id);
    const next = (await connector.listObjects(engineer(), CRUSHER_FEED_TENANT, A13B_PROJECT_A)).find((row) => row.objectId === "ext-dwg-s104");
    expect(next?.id).toBe(first?.id);
    expect(next?.version).toBe("D");
    expect(next?.metadata.presenceIsNotAuthority).toBe(true);
  });

  it("records transmittal provenance without engineering approval", async () => {
    const { connector, connection } = await harness([transmittalT12(), drawingRevC()]);
    await bind(connector, connection.id, A13B_PROJECT_A, "ext-project-a", "repo-edms-a");
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, connection.id);
    const trn = (await connector.listObjects(engineer(), CRUSHER_FEED_TENANT, A13B_PROJECT_A)).find((row) => row.objectType === "TRANSMITTAL");
    expect(trn?.metadata.transmittalIsNotApproval).toBe(true);
    expect(trn?.metadata.relatedDocumentIds).toEqual(["ext-dwg-s104"]);
  });

  it("composes field change and BIM clash into A11E potential impact only", async () => {
    const { connector, connection, changeWorkbench } = await harness([fieldChangeAnchor(), bimClash()]);
    await bind(connector, connection.id, A13B_PROJECT_A, "ext-project-a", "repo-edms-a");
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, connection.id);
    await changeWorkbench.assess(engineer("analysis.write"), CRUSHER_FEED_TENANT, {
      sourceObjectType: "technical_query",
      sourceObjectId: "FC-75",
      projectId: A13B_PROJECT_A,
      workflow: "FIELD_CHANGE",
      constructionQuery: { id: "FC-75", type: "FIELD_CHANGE", summary: "Move anchor bolts 75 mm" },
    });
    const field = await changeWorkbench.latest(engineer(), CRUSHER_FEED_TENANT, "technical_query", "FC-75");
    expect(field?.snapshot.automaticImpactConfirmation).toBe(false);
    expect(field?.snapshot.candidates.every((row) => row.disposition === "POTENTIAL_IMPACT" || row.autoConfirmed === false)).toBe(true);
  });

  it("references BIM model metadata and opens only governed URLs", async () => {
    const { connector, connection } = await harness([bimModel()]);
    await bind(connector, connection.id, A13B_PROJECT_A, "ext-project-a", "repo-bim-a");
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, connection.id);
    const model = (await connector.listObjects(engineer(), CRUSHER_FEED_TENANT, A13B_PROJECT_A)).find((row) => row.objectType === "MODEL");
    expect(model?.version).toBe("12");
    const opened = await connector.openExternalSource(engineer(), CRUSHER_FEED_TENANT, model!.id);
    expect(opened.href).toContain("autodesk.com");
    expect(rejectArbitraryUrlFetch("https://evil.example/ssrf")).toBe("ARBITRARY_URL_FETCH_PROHIBITED");
    expect(isGovernedExternalWebUrl("http://169.254.169.254/")).toBe(false);
    await expect(connector.openExternalSource(engineer(), CRUSHER_FEED_TENANT, model!.id, "https://evil.example")).rejects.toThrow("ARBITRARY_URL_FETCH_PROHIBITED");
  });

  it("keeps schedule 100% from auto-completing an incomplete engineering Deliverable", async () => {
    const { connector, connection } = await harness([scheduleMilestone(), scheduleComplete()]);
    await bind(connector, connection.id, A13B_PROJECT_A, "ext-project-a", "repo-p6-a");
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, connection.id);
    const objects = await connector.listObjects(engineer(), CRUSHER_FEED_TENANT, A13B_PROJECT_A);
    expect(objects.some((row) => row.objectType === "MILESTONE" && row.metadata.neededBy)).toBe(true);
    const complete = objects.find((row) => row.objectId === "ext-act-100");
    expect(complete?.metadata.percentComplete).toBe(100);
    const gate = scheduleDoesNotCompleteDeliverable(100, true);
    expect(gate.deliverableMaturityUnchanged).toBe(true);
    expect(ENGINEERING_CONNECTOR_PRIVACY.scheduleAutoCompletesDeliverable).toBe(false);
  });

  it("isolates Project A from Project B and ignores unregistered external projects", async () => {
    const { connector, connection, port } = await harness([rfi142(), projectBRfi(), unregisteredProjectDoc()]);
    await bind(connector, connection.id, A13B_PROJECT_A, "ext-project-a", "repo-edms-a");
    await bind(connector, connection.id, A13B_PROJECT_B, "ext-project-b", "repo-edms-b");
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, connection.id);
    const a = await connector.listObjects(engineer(), CRUSHER_FEED_TENANT, A13B_PROJECT_A);
    const b = await connector.listObjects(engineer(), CRUSHER_FEED_TENANT, A13B_PROJECT_B);
    expect(a.some((row) => row.objectNumber === "RFI-142")).toBe(true);
    expect(a.some((row) => row.objectNumber === "RFI-B9")).toBe(false);
    expect(b.some((row) => row.objectNumber === "RFI-B9")).toBe(true);
    expect(a.some((row) => row.externalProjectId === A13B_UNREGISTERED_PROJECT)).toBe(false);
    expect(port).toBeTruthy();
  });

  it("stops sync when disabled and preserves historical references", async () => {
    const { connector, connection } = await harness([rfi142()]);
    await bind(connector, connection.id, A13B_PROJECT_A, "ext-project-a", "repo-edms-a");
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, connection.id);
    await connector.disableConnection(admin(), CRUSHER_FEED_TENANT, connection.id);
    const skipped = await connector.runSync(admin(), CRUSHER_FEED_TENANT, connection.id);
    expect(skipped.skipped).toBe(true);
    const objects = await connector.listObjects(engineer(), CRUSHER_FEED_TENANT, A13B_PROJECT_A);
    expect(objects[0]?.availability).toBe("DISABLED");
    expect(objects[0]?.objectId).toBe("ext-rfi-142");
  });

  it("rejects read-only writes, AI issue, secrets on rows, and rate-limits honestly", async () => {
    const { connector, connection, port } = await harness([rfi142()]);
    await bind(connector, connection.id, A13B_PROJECT_A, "ext-project-a", "repo-edms-a");
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, connection.id);
    const objects = await connector.listObjects(engineer(), CRUSHER_FEED_TENANT, A13B_PROJECT_A);
    await expect(
      connector.publishEngineeringResponse(engineer("analysis.write"), CRUSHER_FEED_TENANT, {
        objectRefId: objects[0].id,
        preparedEtag: "etag-rfi-a",
        humanConfirmed: true,
        writeAction: "SUBMIT_DRAFT_RESPONSE",
      }),
    ).rejects.toThrow("ARBITRARY_EXTERNAL_WRITE_PROHIBITED");
    await connector.setWritePolicy(admin(), CRUSHER_FEED_TENANT, connection.id, "SUBMIT_DRAFT_RESPONSE");
    await expect(
      connector.publishEngineeringResponse(engineer("analysis.write"), CRUSHER_FEED_TENANT, {
        objectRefId: objects[0].id,
        preparedEtag: "etag-rfi-a",
        humanConfirmed: true,
        writeAction: "SUBMIT_DRAFT_RESPONSE",
        aiIssued: true,
      }),
    ).rejects.toThrow("AI_EXTERNAL_ENGINEERING_ISSUE_PROHIBITED");
    expect(connector.rejectCallerClaims({ accessToken: "secret" })).toBe("caller_supplied_authority_rejected");
    expect(connector.rejectPersonal("email")).toBe("PERSONAL_EMAIL_ACCESS_PROHIBITED");
    port.throttleNext = true;
    const throttled = await connector.runSync(admin(), CRUSHER_FEED_TENANT, connection.id);
    expect(throttled.rateLimited).toBe(true);
  });

  it("requires confirmation before rebinding and does not reassign historical objects", async () => {
    const { connector, connection } = await harness([rfi142()]);
    await bind(connector, connection.id, A13B_PROJECT_A, "ext-project-a", "repo-edms-a");
    await connector.runSync(admin(), CRUSHER_FEED_TENANT, connection.id);
    const before = await connector.listObjects(engineer(), CRUSHER_FEED_TENANT, A13B_PROJECT_A);
    await expect(bind(connector, connection.id, A13B_PROJECT_A, "ext-project-b", "repo-edms-b")).rejects.toThrow("PROJECT_REBIND_CONFIRMATION_REQUIRED");
    const rebound = await connector.bindProject(admin(), CRUSHER_FEED_TENANT, {
      connectionId: connection.id,
      eosProjectId: A13B_PROJECT_A,
      externalAccountId: A13B_ACCOUNT,
      externalProjectId: "ext-project-b",
      confirmRebind: true,
      repository: { id: "repo-edms-b", displayName: "rebind", repositoryType: "ENGINEERING_EDMS" },
    });
    expect(rebound.binding.externalProjectId).toBe("ext-project-b");
    const after = await connector.listObjects(engineer(), CRUSHER_FEED_TENANT, A13B_PROJECT_A);
    expect(after.find((row) => row.objectId === "ext-rfi-142")?.externalProjectId).toBe("ext-project-a");
    expect(before[0]?.id).toBe(after.find((row) => row.objectId === "ext-rfi-142")?.id);
  });
});
