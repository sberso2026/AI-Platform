import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { describe, expect, it } from "vitest";
import { hostedMalwareScannerAvailable, MALWARE_SCAN_STATUS, scanReturnedBytes } from "../tool-orchestration/return-validation";
import {
  A11A_SYSTEM_ID,
  CRUSHER_EXPANSION_FEED_PROJECT_ID,
  CRUSHER_FEED_TENANT,
  CRUSHER_FEED_WORKSPACE,
  feedStructuralSnapshot,
  WORKFLOW_READINESS,
} from "../work-generator/fixture";
import { A11E_PROJECT_B } from "../change-workbench/fixture";
import { createMemoryWorkPlanStore } from "../work-generator/memory-store";
import { EngineeringWorkGeneratorService } from "../work-generator/service";
import { acceptGovernedQuantity, A15A_V3_FEATURE_FREEZE, workPlanExpectsMto } from "./quantity-mto";
import { createMemoryQuantityMtoStore, objectLinkInsertRows } from "./quantity-mto-store";
import { createTestQuantityMtoService } from "./quantity-mto-service";
import { CALLER_SUPPLIED_MTO_KEYS } from "./quantity-mto-persist";

function commerce(action: "analysis.read" | "analysis.write" = "analysis.write", extras: { tenantId?: string; workspaceId?: string; actorUserId?: string } = {}) {
  return createTestCommerceExecutionContext({
    tenantId: extras.tenantId ?? CRUSHER_FEED_TENANT,
    workspaceId: extras.workspaceId ?? CRUSHER_FEED_WORKSPACE,
    actorUserId: extras.actorUserId ?? "cert-er-a1@rtb-cert.test",
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

function harness() {
  const plans = createMemoryWorkPlanStore();
  const work = new EngineeringWorkGeneratorService({ from() { return this; } } as never, plans);
  const mto = createTestQuantityMtoService(createMemoryQuantityMtoStore(), (id) => plans.getPlan(id));
  return { plans, work, mto };
}

describe("EOS-A15A-V3 governed MTO workbench persistence", () => {
  it("does not create a new top-level intelligence domain", () => {
    expect(A15A_V3_FEATURE_FREEZE.newTopLevelDomain).toBe(false);
    expect(A15A_V3_FEATURE_FREEZE.newMtoIntelligenceDomain).toBe(false);
    expect(A15A_V3_FEATURE_FREEZE.quantityBasisIndependentTable).toBe(false);
    expect(A15A_V3_FEATURE_FREEZE.autoVerifyAllAiQuantities).toBe(false);
    expect(A15A_V3_FEATURE_FREEZE.engineeringApprovedSnapshotStatus).toBe(false);
    const svc = createTestQuantityMtoService();
    expect(svc.catalog().newTopLevelDomain).toBe(false);
    expect(svc.rejectCallerClaims({ tenantId: "x" })).toBe("caller_supplied_authority_rejected");
    expect(svc.rejectCallerClaims({ snapshotFingerprint: "abc" })).toBe("caller_supplied_authority_rejected");
    expect(svc.rejectCallerClaims({ verifyAllAi: true })).toBe("caller_supplied_authority_rejected");
    expect(CALLER_SUPPLIED_MTO_KEYS).toContain("verifiedBy");
  });

  it("persists Crusher snapshots with embedded quantity basis, supersession, HITL, cost/carbon fail-closed, and revision compare", async () => {
    const { work, mto, plans } = harness();
    const plan = await work.generatePlan(commerce(), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "DESIGN_CALCULATION",
      lifecycleStage: "FEED",
      discipline: "STRUCTURAL",
      systemId: A11A_SYSTEM_ID,
      snapshot: feedStructuralSnapshot(),
      readiness: WORKFLOW_READINESS.feedBlocked,
      acknowledged: true,
    });
    expect(workPlanExpectsMto(plan.context.expectedOutputs)).toBe(true);
    const seeded = await mto.seedDemonstrator(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id });
    expect(seeded.revA.status).toBe("SUPERSEDED");
    expect(seeded.revB.supersedesSnapshotId).toBe(seeded.revA.id);
    expect(seeded.revB.snapshotFingerprint).toBeTruthy();
    const listed = await mto.listSnapshots(commerce("analysis.read"), CRUSHER_FEED_TENANT, { projectId: plan.projectId, workPlanId: plan.id });
    expect(listed).toHaveLength(2);
    const current = await mto.getSnapshot(commerce("analysis.read"), CRUSHER_FEED_TENANT, { snapshotId: seeded.revB.id, query: { limit: 50 } });
    const steel = current.items.find((row) => row.itemCode === "ST-STEEL-UB")!;
    const extracted = current.items.find((row) => row.itemCode === "ST-CONC-FDN")!;
    const assumption = current.items.find((row) => row.itemCode === "EL-CABLE-PWR")!;
    const missing = current.items.find((row) => row.itemCode === "ST-UNKNOWN-PLATE")!;
    expect(steel.quantityOrigin).toBe("DETERMINISTICALLY_DERIVED");
    expect(extracted.quantityOrigin).toBe("SOURCE_EXTRACTED");
    expect(extracted.verificationStatus).toBe("UNVERIFIED");
    expect(assumption.quantityOrigin).toBe("ENGINEER_ENTERED_ASSUMPTION");
    const missingQty = acceptGovernedQuantity(missing);
    expect(missingQty.ok).toBe(false);
    if (!missingQty.ok) expect(missingQty.code).toBe("QUANTITY_NOT_AVAILABLE");
    expect(current.costs["EL-CABLE-PWR"].state).toBe("COST_NOT_CALCULATED");
    expect(current.costs["ST-STEEL-UB"].state).toBe("DERIVED");
    expect(current.carbons["EL-CABLE-PWR"].state).toBe("CARBON_NOT_CALCULATED");
    expect(current.policy.carbon).toBe("REQUIRED");
    expect(current.constructability.opaqueScore).toBeNull();
    const compared = await mto.compare(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      fromSnapshotId: seeded.revA.id,
      toSnapshotId: seeded.revB.id,
    });
    expect(compared.deltas.find((row) => row.itemCode === "ST-STEEL-UB")?.delta).toBeCloseTo(18.4, 1);
    expect(compared.deltas.find((row) => row.itemCode === "ST-CONC-FDN")?.delta).toBe(96);
    expect(compared.deltas.find((row) => row.itemCode === "ST-AB-M36")?.delta).toBe(16);
    expect(compared.dollarImpact).toBeNull();
    await expect(mto.verifyItem(commerce("analysis.write", { actorUserId: "ai:extractor" }), CRUSHER_FEED_TENANT, {
      snapshotId: seeded.revB.id,
      itemId: extracted.id,
      status: "VERIFIED",
    })).rejects.toThrow(/ai_cannot_verify/);
    await expect(mto.verifyItem(commerce(), CRUSHER_FEED_TENANT, {
      snapshotId: seeded.revB.id,
      itemId: extracted.id,
      status: "VERIFIED",
      itemIds: current.items.map((row) => row.id),
    })).rejects.toThrow(/bulk_verification_confirmation_required/);
    const verifiedItem = await mto.verifyItem(commerce(), CRUSHER_FEED_TENANT, {
      snapshotId: seeded.revB.id,
      itemId: extracted.id,
      status: "VERIFIED",
    });
    expect(verifiedItem.items.find((row) => row.id === extracted.id)?.verificationStatus).toBe("ENGINEER_ACCEPTED");
    expect(verifiedItem.items.find((row) => row.id === extracted.id)?.verifiedBy).toBe("cert-er-a1@rtb-cert.test");
    await mto.verifyItem(commerce(), CRUSHER_FEED_TENANT, {
      snapshotId: seeded.revB.id,
      itemId: assumption.id,
      status: "NEEDS_INFORMATION",
    });
    await expect(mto.getSnapshot(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      snapshotId: seeded.revB.id,
      selectedProjectId: A11E_PROJECT_B,
    })).rejects.toThrow(/CROSS_PROJECT/);
    const stored = await plans.getPlan(plan.id);
    stored!.context.information = [{
      informationType: "DRAWING",
      title: "S-CRU-ST-002",
      revision: "Z",
      whyIncluded: "governing structural drawing",
    }];
    await plans.savePlan(stored!);
    const stale = await mto.refreshFreshness(commerce(), CRUSHER_FEED_TENANT, { snapshotId: seeded.revB.id });
    expect(["SOURCE_CHANGED", "MTO_REVIEW_REQUIRED"]).toContain(stale.staleness);
    const gaps = await mto.attentionGapsForPlan(commerce("analysis.read"), CRUSHER_FEED_TENANT, plan);
    expect(gaps.some((row) => row.title === "MTO source changed" || row.title === "MTO requires verification")).toBe(true);
    const exported = await mto.exportWorkbook(commerce("analysis.read"), CRUSHER_FEED_TENANT, { snapshotId: seeded.revB.id });
    expect(exported.sheets).toEqual(expect.arrayContaining(["01_Summary", "05_Structural", "13_Revision_Changes"]));
    expect(exported.disclaimer).toMatch(/DRAFT MTO|VERIFIED MTO/);
    expect(exported.disclaimer).not.toMatch(/\bIFC\b.*approved/i);
    const review = await mto.reviewPlan(commerce("analysis.read"), CRUSHER_FEED_TENANT, plan.id);
    expect(review.every((row) => row.quantityCorrect === false)).toBe(true);
    const impacts = await mto.changeImpacts(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      fromSnapshotId: seeded.revA.id,
      toSnapshotId: seeded.revB.id,
    });
    expect(impacts.some((row) => row.dimension === "QUANTITY" && row.status === "POTENTIAL")).toBe(true);
  });

  it("keeps verified snapshots immutable and creates a superseding revision instead", async () => {
    const { work, mto } = harness();
    const plan = await work.generatePlan(commerce(), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "DESIGN_CALCULATION",
      lifecycleStage: "FEED",
      discipline: "STRUCTURAL",
      systemId: A11A_SYSTEM_ID,
      snapshot: feedStructuralSnapshot(),
      readiness: WORKFLOW_READINESS.feedBlocked,
      acknowledged: true,
    });
    const created = await mto.createSnapshot(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: plan.id,
      items: [],
      revision: "A",
    });
    const verified = await mto.verifySnapshot(commerce(), CRUSHER_FEED_TENANT, { snapshotId: created.id });
    expect(verified.status).toBe("VERIFIED");
    await expect(mto.verifyItem(commerce(), CRUSHER_FEED_TENANT, {
      snapshotId: created.id,
      itemId: "missing",
      status: "VERIFIED",
    })).rejects.toThrow(/verified_mto_immutable/);
    const revB = await mto.createRevision(commerce(), CRUSHER_FEED_TENANT, { snapshotId: created.id, revision: "B" });
    expect(revB.revision).toBe("B");
    expect(revB.supersedesSnapshotId).toBe(created.id);
    const prior = await mto.getSnapshot(commerce("analysis.read"), CRUSHER_FEED_TENANT, { snapshotId: created.id });
    expect(prior.status).toBe("SUPERSEDED");
  });

  it("paginates persisted queries at 100 / 1,000 / 5,000 items without naive 5,000 DOM rows", async () => {
    const { work, mto } = harness();
    const plan = await work.generatePlan(commerce(), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "DESIGN_CALCULATION",
      lifecycleStage: "FEED",
      discipline: "STRUCTURAL",
      systemId: A11A_SYSTEM_ID,
      snapshot: feedStructuralSnapshot(),
      readiness: WORKFLOW_READINESS.feedBlocked,
      acknowledged: true,
    });
    const timings: Record<string, number> = {};
    for (const count of [100, 1000, 5000]) {
      const items = Array.from({ length: count }, (_, i) => ({
        id: `perf-${count}-${i}`,
        tenantId: CRUSHER_FEED_TENANT,
        workspaceId: CRUSHER_FEED_WORKSPACE,
        projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
        itemCode: `ST-${i}`,
        description: `Member ${i}`,
        discipline: "STRUCTURAL" as const,
        category: "steel",
        material: "Steel",
        grade: "300PLUS",
        specification: null,
        quantity: 1,
        unit: "ea",
        quantityOrigin: "SOURCE_MEASURED" as const,
        quantityMaturity: "FEED_MTO" as const,
        verificationStatus: "UNVERIFIED" as const,
        lifecycleStage: "FEED" as const,
        status: "ACTIVE" as const,
        semantics: "bulk_mto" as const,
        basis: {
          id: `qb-${count}-${i}`,
          sourceType: "SOURCE_MEASURED" as const,
          sourceRef: "S-PERF",
          sourceRevision: "A",
          measurementMethod: "count",
          derivationMethod: null,
          formula: null,
          assumptions: [],
          exclusions: [],
          createdAt: "2026-10-02T00:00:00.000Z",
          createdBy: "perf",
        },
      }));
      const started = Date.now();
      const snapshot = count === 100
        ? await mto.createSnapshot(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id, items, revision: "P100" })
        : await mto.createRevision(commerce(), CRUSHER_FEED_TENANT, {
          snapshotId: (await mto.listSnapshots(commerce("analysis.read"), CRUSHER_FEED_TENANT, { projectId: plan.projectId, workPlanId: plan.id })).find((row) => row.status !== "SUPERSEDED")!.id,
          items,
          revision: `P${count}`,
        });
      const page = await mto.getSnapshot(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
        snapshotId: snapshot.id,
        query: { offset: 0, limit: 50 },
      });
      timings[`n${count}`] = Date.now() - started;
      expect(page.page.items).toHaveLength(50);
      expect(page.page.total).toBe(count);
    }
    expect(timings.n100).toBeGreaterThan(0);
    expect(timings.n1000).toBeGreaterThan(0);
    expect(timings.n5000).toBeGreaterThan(0);
  });

  it("does not write workspace_id or non-UUID endpoints onto engineering_object_links", () => {
    const snapshotId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const priorId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
    const itemId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
    const basisId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
    const planId = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
    const rows = objectLinkInsertRows({
      id: snapshotId,
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workPlanId: planId,
      systemId: A11A_SYSTEM_ID,
      discipline: "STRUCTURAL",
      disciplineScope: "MULTIDISCIPLINARY",
      lifecycleStage: "FEED",
      revision: "B",
      status: "DRAFT",
      verificationState: "UNVERIFIED",
      sourceRevisionSet: ["A"],
      itemCount: 1,
      snapshotFingerprint: "fp",
      staleness: "CURRENT",
      createdAt: "2026-10-02T00:00:00.000Z",
      createdBy: "cert-er-a1@rtb-cert.test",
      verifiedAt: null,
      verifiedBy: null,
      supersedesSnapshotId: priorId,
      exportDisclaimer: "x",
      items: [],
      thread: [
        { fromType: "quantity_basis", fromId: basisId, relationship: "BASED_ON", toType: "engineering_information", toId: "S-CRU-ST-001" },
        { fromType: "quantity_basis", fromId: basisId, relationship: "USED_BY", toType: "mto_item", toId: itemId },
        { fromType: "mto_snapshot", fromId: snapshotId, relationship: "BASED_ON", toType: "mto_item", toId: itemId },
        { fromType: "mto_snapshot", fromId: snapshotId, relationship: "SUPERSEDES", toType: "mto_snapshot", toId: priorId },
        { fromType: "engineering_work_plan", fromId: planId, relationship: "SUPPORTED_BY", toType: "mto_snapshot", toId: snapshotId },
        { fromType: "engineering_work_plan", fromId: planId, relationship: "SUPPORTED_BY", toType: "mto_snapshot", toId: snapshotId },
      ],
    });
    expect(rows.every((row) => !("workspace_id" in row) && !("project_id" in row))).toBe(true);
    expect(rows.every((row) => row.relationship_governed === false)).toBe(true);
    expect(rows.every((row) => row.created_by === null)).toBe(true);
    expect(rows.some((row) => row.to_id === "S-CRU-ST-001")).toBe(false);
    expect(rows.filter((row) => row.relationship === "SUPPORTED_BY")).toHaveLength(1);
    expect(rows.some((row) => row.relationship === "SUPERSEDES" && row.to_id === priorId)).toBe(true);
  });

  it("keeps hosted malware deferred and returned files fail-closed", async () => {
    expect(hostedMalwareScannerAvailable({} as NodeJS.ProcessEnv)).toBe(false);
    expect(MALWARE_SCAN_STATUS === "UNAVAILABLE_HOSTED_CLAMAV" || MALWARE_SCAN_STATUS === "HOSTED_CLAMAV_CONFIGURED").toBe(true);
    const scanned = await scanReturnedBytes(Buffer.from("not-a-scan"), false, {} as NodeJS.ProcessEnv);
    expect(scanned.state === "SCANNER_UNAVAILABLE" || scanned.state === "SCAN_FAILED").toBe(true);
  });
});
