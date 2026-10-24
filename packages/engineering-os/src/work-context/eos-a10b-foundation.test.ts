import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { describe, expect, it } from "vitest";
import { CRUSHER_FEED_OTHER_TENANT, CRUSHER_FEED_OTHER_WORKSPACE, CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../digital-thread/fixture";
import { CRUSHER_EXPANSION_FEED_PROJECT_ID } from "../lifecycle-intelligence/fixture";
import { A10A_MECH_LOAD_ID, mechanicalLoadRef } from "../information-intelligence/fixture";
import { classifyWorkMateriality, WORKFLOW_CONTRACTS } from "./catalog";
import { composeWorkEventThreadGraph, potentialImpactsForWorkEvents, WORK_CONTEXT_PRIVACY } from "./compose";
import { crusherManagedRepository, officeWorkflowSignals, personalFileSignal, sharePointLikeSignal, unmanagedScratchSignal } from "./fixture";
import { createMemoryWorkContextStore } from "./memory-store";
import { EngineeringWorkContextService } from "./service";
import { DEFAULT_CAPTURE_POLICY, WORK_CONTEXT_AI_BOUNDARY } from "./types";

function commerce(action: "analysis.read" | "analysis.write" | "settings.write", tenantId = CRUSHER_FEED_TENANT, workspaceId = CRUSHER_FEED_WORKSPACE) {
  return createTestCommerceExecutionContext({
    tenantId,
    workspaceId,
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

function stubClient() {
  return { from() { return this; } } as never;
}

async function seededService(bus?: { publish: (event: unknown) => Promise<unknown> }) {
  const store = createMemoryWorkContextStore();
  await store.saveRepository(crusherManagedRepository());
  return {
    store,
    service: new EngineeringWorkContextService(stubClient(), store, bus),
  };
}

describe("EOS-A10B Engineering Work Context & Information Flow", () => {
  it("defaults to DENY and keeps personal files outside EOS scope", async () => {
    const { service } = await seededService();
    const personal = await service.ingest(commerce("analysis.write"), CRUSHER_FEED_TENANT, personalFileSignal());
    expect(DEFAULT_CAPTURE_POLICY).toBe("DENY");
    expect(personal.captured).toBe(false);
    expect(personal.decision).toBe("OUTSIDE_EOS_SCOPE");
    expect(personal.event).toBeNull();
    expect(personal.reason).not.toMatch(/Mortgage/i);
    const listed = await service.list(commerce("analysis.read"), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(listed).toEqual([]);
  });

  it("ignores unmanaged scratch until explicit publish into a managed repository", async () => {
    const { service } = await seededService();
    const ignored = await service.ingest(commerce("analysis.write"), CRUSHER_FEED_TENANT, unmanagedScratchSignal(false));
    expect(ignored.captured).toBe(false);
    expect(ignored.decision).toBe("OUTSIDE_EOS_SCOPE");
    const published = await service.ingest(commerce("analysis.write"), CRUSHER_FEED_TENANT, unmanagedScratchSignal(true));
    expect(published.captured).toBe(true);
    expect(published.event?.managedRepositoryId).toBe(crusherManagedRepository().id);
    expect(published.event?.sourceObjectId).toBe("managed-scratch-calc.xlsx");
  });

  it("trusts managed repository identity rather than a drive letter", async () => {
    const { service } = await seededService();
    const denied = await service.previewEligibility(
      { ...sharePointLikeSignal(), path: "C:\\", managedRepositoryId: null },
      [crusherManagedRepository()],
    );
    expect(denied.decision).toBe("DENIED_DEFAULT");
    const allowed = await service.ingest(commerce("analysis.write"), CRUSHER_FEED_TENANT, sharePointLikeSignal());
    expect(allowed.captured).toBe(true);
    expect(allowed.event?.eventType).toBe("SOURCE_REVISED");
    expect(allowed.reason).toMatch(/Project A Structural Calculations/);
  });

  it("normalizes a synthetic SharePoint-like fixture and is idempotent", async () => {
    const published: unknown[] = [];
    const { service } = await seededService({
      async publish(event) {
        published.push(event);
        return event;
      },
    });
    const first = await service.ingest(
      commerce("analysis.write"),
      CRUSHER_FEED_TENANT,
      sharePointLikeSignal({ sourceEventType: "FILE_CREATED", sourceEventId: "sp-evt-create" }),
    );
    const revised = await service.ingest(commerce("analysis.write"), CRUSHER_FEED_TENANT, sharePointLikeSignal());
    const publishedEvt = await service.ingest(
      commerce("analysis.write"),
      CRUSHER_FEED_TENANT,
      sharePointLikeSignal({ sourceEventType: "FILE_PUBLISHED", sourceEventId: "sp-evt-pub" }),
    );
    const duplicate = await service.ingest(commerce("analysis.write"), CRUSHER_FEED_TENANT, sharePointLikeSignal());
    expect(first.event?.eventType).toBe("SOURCE_CREATED");
    expect(revised.event?.eventType).toBe("SOURCE_REVISED");
    expect(publishedEvt.event?.eventType).toBe("SOURCE_PUBLISHED");
    expect(duplicate.duplicate).toBe(true);
    expect(duplicate.event?.id).toBe(revised.event?.id);
    expect(published.length).toBe(3);
    expect((published[0] as { eventType: string }).eventType).toBe("engineering.work.event");
  });

  it("runs the synthetic office workflow without inferring technical approval", async () => {
    const t0 = Date.now();
    const { service } = await seededService({ async publish(event) { return event; } });
    const captured = [];
    for (const signal of officeWorkflowSignals()) {
      captured.push(await service.ingest(commerce("analysis.write"), CRUSHER_FEED_TENANT, signal));
    }
    const normalizeMs = Date.now() - t0;
    expect(captured.every((row) => row.captured)).toBe(true);
    const events = await service.list(commerce("analysis.read"), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(events.every((row) => row.projectId === CRUSHER_EXPANSION_FEED_PROJECT_ID)).toBe(true);
    expect(events.find((row) => row.eventType === "SOURCE_REVISED")?.informationRefId).toBe(A10A_MECH_LOAD_ID);
    expect(events.some((row) => row.eventType === "INTERFACE_INFORMATION_CHANGED")).toBe(true);
    expect(events.some((row) => row.eventType === "ANALYSIS_EXECUTED")).toBe(true);
    expect(events.some((row) => row.eventType === "CALCULATION_PUBLISHED")).toBe(true);
    expect(events.some((row) => row.eventType === "DRAWING_ISSUED")).toBe(true);
    expect(events.some((row) => row.eventType === "DOCUMENT_REVIEW_COMPLETED")).toBe(true);
    expect(events.some((row) => row.eventType === "DECISION_RECORDED")).toBe(true);
    expect(events.some((row) => row.eventType === "DELIVERABLE_UPDATED")).toBe(true);
    const load = events.find((row) => row.eventType === "SOURCE_REVISED")!;
    const graph = composeWorkEventThreadGraph({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      events,
    });
    const t1 = Date.now();
    const impacts = potentialImpactsForWorkEvents(graph, load.id);
    const threadMs = Date.now() - t1;
    expect(impacts.length).toBeGreaterThan(0);
    expect(impacts.every((row) => row.label === "POTENTIAL IMPACT" && row.confirmedImpact === false)).toBe(true);
    expect(mechanicalLoadRef().id).toBe(A10A_MECH_LOAD_ID);
    const t2 = Date.now();
    const day = await service.dayView(commerce("analysis.read"), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID, "2026-09-29T00:00:00.000Z");
    const aggMs = Date.now() - t2;
    expect(day.sourcesRevised).toBeGreaterThanOrEqual(1);
    expect(day.analysesExecuted).toBeGreaterThanOrEqual(1);
    expect(day.reviewsCompleted).toBeGreaterThanOrEqual(1);
    expect(day.decisionsRecorded).toBeGreaterThanOrEqual(1);
    expect(day.productivityScore).toBeNull();
    expect(JSON.stringify(day)).not.toMatch(/worked hard|productive/i);
    expect(normalizeMs).toBeLessThan(250);
    expect(aggMs).toBeLessThan(50);
    expect(threadMs).toBeLessThan(50);
  });

  it("preserves source occurred_at when events arrive out of order", async () => {
    const { service } = await seededService();
    await service.ingest(
      commerce("analysis.write"),
      CRUSHER_FEED_TENANT,
      sharePointLikeSignal({ sourceEventId: "later", occurredAt: "2026-09-30T12:00:00.000Z" }),
    );
    await service.ingest(
      commerce("analysis.write"),
      CRUSHER_FEED_TENANT,
      sharePointLikeSignal({ sourceEventId: "earlier", occurredAt: "2026-09-30T08:00:00.000Z" }),
    );
    const events = await service.list(commerce("analysis.read"), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    const earlier = events.find((row) => row.sourceEventId === "earlier")!;
    const later = events.find((row) => row.sourceEventId === "later")!;
    expect(earlier.occurredAt).toBe("2026-09-30T08:00:00.000Z");
    expect(later.occurredAt).toBe("2026-09-30T12:00:00.000Z");
    expect(Date.parse(earlier.recordedAt)).toBeGreaterThanOrEqual(Date.parse(earlier.occurredAt));
  });

  it("keeps AI-extracted meeting content as CANDIDATE until human confirmation", async () => {
    const { service } = await seededService();
    const ingested = await service.ingest(
      commerce("analysis.write"),
      CRUSHER_FEED_TENANT,
      sharePointLikeSignal({
        sourceEventType: "MEETING_DECISION_CONFIRMED",
        sourceEventId: "meet-dec-1",
        extractedByAi: true,
      }),
    );
    expect(ingested.event?.confirmationState).toBe("CANDIDATE");
    const confirmed = await service.confirmCandidate(commerce("analysis.write"), CRUSHER_FEED_TENANT, ingested.event!.id, "CONFIRMED");
    expect(confirmed?.confirmationState).toBe("CONFIRMED");
    expect(WORK_CONTEXT_AI_BOUNDARY.mayCreateGovernedDecisionFromTranscript).toBe(false);
  });

  it("classifies materiality deterministically and prohibits productivity scoring", () => {
    expect(classifyWorkMateriality("ANALYSIS_EXECUTED")).toBe("MATERIAL");
    expect(classifyWorkMateriality("SOURCE_REVISED")).toBe("ROUTINE");
    expect(WORK_CONTEXT_PRIVACY.employeeProductivityScoring).toBe("PROHIBITED");
    expect(WORK_CONTEXT_PRIVACY.keystrokeCapture).toBe("PROHIBITED");
    expect(WORK_CONTEXT_PRIVACY.newEventBusCreated).toBe(false);
    expect(WORKFLOW_CONTRACTS.excel.mustNotCapture).toContain("cell edits");
    expect(WORKFLOW_CONTRACTS.sharepoint.connectorImplemented).toBe(true);
    expect(WORKFLOW_CONTRACTS.teams.mustNotIngestAllConversations).toBe(true);
    expect(WORKFLOW_CONTRACTS.outlook.personalEmailOutsideScope).toBe(true);
    expect(WORKFLOW_CONTRACTS.cad.pluginImplemented).toBe(false);
    expect(WORKFLOW_CONTRACTS.analysis.realSolverImplemented).toBe(false);
    expect(WORKFLOW_CONTRACTS.aiTools.independentChatGptOrCopilotMonitored).toBe(false);
  });

  it("rejects prohibited capture classes and caller-supplied authority", async () => {
    const { service } = await seededService();
    const keystroke = await service.ingest(
      commerce("analysis.write"),
      CRUSHER_FEED_TENANT,
      { ...sharePointLikeSignal(), prohibitedClass: "KEYSTROKE" },
    );
    expect(keystroke.captured).toBe(false);
    expect(keystroke.decision).toBe("PROHIBITED");
    expect(service.rejectCallerClaims({ tenantId: "other" })).toBe("caller_supplied_authority_rejected");
    await expect(
      service.saveRepository(commerce("settings.write"), CRUSHER_FEED_TENANT, {
        ...crusherManagedRepository(),
        id: "repo-broaden",
        scope: "TENANT",
        projectId: null,
      }, { actorProjectId: CRUSHER_EXPANSION_FEED_PROJECT_ID }),
    ).rejects.toThrow(/repository_scope_broadening_denied/);
    await expect(
      service.list(commerce("analysis.read"), CRUSHER_FEED_OTHER_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID),
    ).rejects.toThrow();
    const otherWs = createTestCommerceExecutionContext({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_OTHER_WORKSPACE,
      policy: { productKey: "engineering-os", action: "analysis.read", seatRequired: true },
    });
    const hidden = await service.list(otherWs, CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(hidden).toEqual([]);
  });
});
