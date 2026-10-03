import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { describe, expect, it } from "vitest";
import { createMemoryArtifactStore } from "../artifact-automation/memory-store";
import { createTestArtifactService } from "../artifact-automation/service";
import { A11E_PROJECT_B } from "../change-workbench/fixture";
import { createTestPreIssueService } from "../pre-issue-review/service";
import {
  A11A_SYSTEM_ID,
  CRUSHER_EXPANSION_FEED_PROJECT_ID,
  CRUSHER_FEED_TENANT,
  CRUSHER_FEED_WORKSPACE,
  feedStructuralSnapshot,
  WORKFLOW_READINESS,
} from "../work-generator/fixture";
import { createMemoryWorkPlanStore } from "../work-generator/memory-store";
import { EngineeringWorkGeneratorService } from "../work-generator/service";
import { createMemoryStructuralStore } from "../work-generator/structural/store";
import { createTestStructuralWorkService } from "../work-generator/structural/service";
import type { EngineeringWorkPlan } from "../work-generator/types";
import {
  A15A_V5B_PREISSUE_BIND,
  A15A_V5B_REPORTBIND,
  COMPOSITION_EVIDENCE_RELATIONSHIP,
} from "./composition-evidence";
import { composeWorkPlanValueRequirements, DEFAULT_PROJECT_VALUE_POLICY, resolveProjectValuePolicy } from "./cross-lifecycle-value";
import { fingerprintItems } from "./quantity-mto";
import { crusherMtoRevAItems } from "./quantity-mto-demonstrator";
import type { PersistedMtoSnapshot } from "./quantity-mto-persist";
import { createMemoryQuantityMtoStore } from "./quantity-mto-store";
import { createTestQuantityMtoService } from "./quantity-mto-service";

function commerce(action: "analysis.read" | "analysis.write" = "analysis.write", extras: { tenantId?: string; workspaceId?: string } = {}) {
  return createTestCommerceExecutionContext({
    tenantId: extras.tenantId ?? CRUSHER_FEED_TENANT,
    workspaceId: extras.workspaceId ?? CRUSHER_FEED_WORKSPACE,
    actorUserId: "cert-er-a1@rtb-cert.test",
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

function applyLiveValuePolicy(plan: EngineeringWorkPlan) {
  plan.context.evaluationRequirements = composeWorkPlanValueRequirements({
    stage: plan.lifecycleStage,
    workType: plan.workType,
    discipline: plan.discipline,
    assignedDisciplines: plan.discipline ? [plan.discipline] : [],
    policy: resolveProjectValuePolicy(),
  });
}

function harness() {
  const plans = createMemoryWorkPlanStore();
  const work = new EngineeringWorkGeneratorService({ from() { return this; } } as never, plans);
  const store = createMemoryQuantityMtoStore();
  const mto = createTestQuantityMtoService(store, (id) => plans.getPlan(id));
  const structuralStore = createMemoryStructuralStore();
  const structural = createTestStructuralWorkService(structuralStore, (id) => plans.getPlan(id), mto);
  const artifacts = createMemoryArtifactStore();
  const artifactSvc = createTestArtifactService(artifacts, (id) => plans.getPlan(id));
  const loadCalc = async (planId: string) => {
    const plan = await plans.getPlan(planId);
    if (!plan) return null;
    const rows = await structuralStore.list(plan.workspaceId, plan.projectId, plan.id);
    const current = rows[0];
    if (!current) return null;
    return {
      id: current.id,
      workPlanId: current.workPlanId,
      inputFingerprint: current.result?.inputFingerprint ?? current.inputFingerprint,
      engineId: current.engineId,
      engineVersion: current.engineVersion,
      method: current.engineId,
      reviewStatus: current.reviewStatus,
    };
  };
  mto.bindStructuralCalculation(loadCalc);
  artifactSvc.bindStructuralCalculation(loadCalc);
  artifactSvc.bindQuantityMto((planId) => mto.loadCompositionContext(planId));
  const review = createTestPreIssueService({ artifacts, loadPlan: (id) => plans.getPlan(id) });
  review.bindQuantityMto((planId) => mto.loadCompositionContext(planId));
  review.bindStructuralCalculation(async (planId) => {
    const plan = await plans.getPlan(planId);
    if (!plan) return null;
    const rows = await structuralStore.list(plan.workspaceId, plan.projectId, plan.id);
    const current = rows[0];
    if (!current) return null;
    return {
      status: current.status,
      reviewStatus: current.reviewStatus,
      inputFingerprint: current.result?.inputFingerprint ?? current.inputFingerprint,
      currentFingerprint: current.inputFingerprint,
      missingCodes: current.missingCodes,
    };
  });
  return { plans, work, store, mto, structural, structuralStore, artifacts, artifactSvc, review };
}

async function calcPlan(work: EngineeringWorkGeneratorService) {
  return work.generatePlan(commerce(), CRUSHER_FEED_TENANT, {
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    workType: "DESIGN_CALCULATION",
    lifecycleStage: "FEED",
    discipline: "STRUCTURAL",
    systemId: A11A_SYSTEM_ID,
    snapshot: feedStructuralSnapshot(),
    readiness: WORKFLOW_READINESS.detailedReady,
    acknowledged: true,
  });
}

async function reportPlan(work: EngineeringWorkGeneratorService, plans: ReturnType<typeof createMemoryWorkPlanStore>) {
  const plan = await work.generatePlan(commerce(), CRUSHER_FEED_TENANT, {
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    workType: "DESIGN_REPORT",
    lifecycleStage: "FEED",
    discipline: "STRUCTURAL",
    systemId: `${A11A_SYSTEM_ID}-report`,
    snapshot: feedStructuralSnapshot(),
    readiness: WORKFLOW_READINESS.detailedReady,
    acknowledged: true,
  });
  applyLiveValuePolicy(plan);
  await plans.savePlan(plan);
  return plan;
}

async function aligned(h: ReturnType<typeof harness>) {
  const mtoPlan = await calcPlan(h.work);
  const designPlan = await reportPlan(h.work, h.plans);
  const mtoSeed = await h.structural.seedFixture(commerce(), CRUSHER_FEED_TENANT, { workPlanId: mtoPlan.id });
  const mtoCalc = await h.structural.runCheck(commerce(), CRUSHER_FEED_TENANT, { calculationId: mtoSeed.id, workPlanId: mtoPlan.id });
  const snapshot = await h.structural.applyToMto(commerce(), CRUSHER_FEED_TENANT, { calculationId: mtoCalc.id, workPlanId: mtoPlan.id });
  const reportSeed = await h.structural.seedFixture(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id });
  const reportCalc = await h.structural.runCheck(commerce(), CRUSHER_FEED_TENANT, { calculationId: reportSeed.id, workPlanId: designPlan.id });
  return { mtoPlan, designPlan, mtoCalc, snapshot, reportCalc };
}

function historicalLocal(plan: { id: string; tenantId: string; workspaceId: string; projectId: string; systemId: string | null; discipline: string | null }): PersistedMtoSnapshot {
  const items = crusherMtoRevAItems().map((item) => ({
    ...item,
    tenantId: plan.tenantId,
    workspaceId: plan.workspaceId,
    projectId: plan.projectId,
    systemId: plan.systemId,
  }));
  return {
    id: randomUUID(),
    tenantId: plan.tenantId,
    workspaceId: plan.workspaceId,
    projectId: plan.projectId,
    workPlanId: plan.id,
    systemId: plan.systemId,
    discipline: plan.discipline,
    disciplineScope: "STRUCTURAL",
    lifecycleStage: "FEED",
    revision: "D",
    status: "DRAFT",
    verificationState: "UNVERIFIED",
    sourceRevisionSet: ["A"],
    itemCount: items.length,
    snapshotFingerprint: fingerprintItems(items),
    staleness: "CURRENT",
    createdAt: "2026-09-01T00:00:00.000Z",
    createdBy: "cert-er-a1@rtb-cert.test",
    verifiedAt: null,
    verifiedBy: null,
    supersedesSnapshotId: null,
    exportDisclaimer: "DRAFT MTO. Export does not imply engineering approval, IFC, or DESIGN ACCEPTED.",
    items,
    thread: [],
  };
}

async function bindExplicit(h: ReturnType<typeof harness>, designPlanId: string, mtoSnapshotId: string) {
  return h.mto.bindCompositionEvidence(commerce(), CRUSHER_FEED_TENANT, {
    workPlanId: designPlanId,
    mtoSnapshotId,
  });
}

async function generateReport(h: ReturnType<typeof harness>, designPlanId: string) {
  const generated = await h.artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlanId, artifactType: "DESIGN_REPORT" });
  expect(generated.ok).toBe(true);
  if (!generated.ok) throw new Error("design_report_generation_failed");
  return generated.artifact;
}

async function verifyMto(h: ReturnType<typeof harness>, snapshotId: string) {
  const row = await h.store.getSnapshot(snapshotId);
  expect(row).toBeTruthy();
  for (const item of row!.items) {
    await h.mto.verifyItem(commerce(), CRUSHER_FEED_TENANT, {
      snapshotId,
      itemId: item.id,
      status: "VERIFIED",
    });
  }
  return h.mto.verifySnapshot(commerce(), CRUSHER_FEED_TENANT, { snapshotId });
}

function codes(result: { review: { conditions: Array<{ code: string }> } }) {
  return result.review.conditions.map((row) => row.code);
}

describe("EOS-A15A-V5B-PREISSUE-BIND explicit MTO source alignment", () => {
  it("reuses loadCompositionContext and does not add a second selector", () => {
    const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../engineering-os.ts"), "utf8");
    expect(src).toContain("preIssueReview.bindQuantityMto((planId) => quantityMto.loadCompositionContext(planId))");
    expect(src).not.toMatch(/preIssueReview\.bindQuantityMto\(\(planId\) => quantityMto\.loadForPlan\(planId\)\)/);
    expect(A15A_V5B_PREISSUE_BIND.canonicalSelector).toBe("loadCompositionContext");
    expect(A15A_V5B_PREISSUE_BIND.newSourceSelectorArchitecture).toBe(false);
    expect(A15A_V5B_REPORTBIND.sourceSelectionPrecedence).toBe("EXPLICIT_BOUND_SOURCE_OVER_PLAN_LOCAL");
  });

  it("A/C explicit-bound MTO precedes plan-local and does not emit ARTIFACT_MTO_SOURCE_CHANGED", async () => {
    const h = harness();
    const { designPlan, snapshot } = await aligned(h);
    const local = historicalLocal(designPlan);
    await h.store.saveSnapshot(local);
    await bindExplicit(h, designPlan.id, snapshot.id);
    const artifact = await generateReport(h, designPlan.id);
    expect(artifact.provenance.mtoSnapshotId).toBe(snapshot.id);
    const planLocal = await h.mto.loadForPlan(designPlan.id);
    expect(planLocal?.snapshotId).toBe(local.id);
    const ctx = await h.mto.loadCompositionContext(designPlan.id);
    expect(ctx.bindingKind).toBe("EXPLICIT");
    expect(ctx.current?.id).toBe(snapshot.id);
    expect(ctx.current?.id).not.toBe(local.id);
    const result = await h.review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id });
    expect(codes(result)).not.toContain("ARTIFACT_MTO_SOURCE_CHANGED");
    expect(local.id).not.toBe(snapshot.id);
    expect(await h.store.getSnapshot(local.id)).toMatchObject({ id: local.id, revision: "D", snapshotFingerprint: local.snapshotFingerprint });
  });

  it("B verified explicit MTO does not emit QUANTITY_AI_EXTRACTION_UNVERIFIED", async () => {
    const h = harness();
    const { designPlan, snapshot } = await aligned(h);
    await h.store.saveSnapshot(historicalLocal(designPlan));
    await bindExplicit(h, designPlan.id, snapshot.id);
    await generateReport(h, designPlan.id);
    await verifyMto(h, snapshot.id);
    const ctx = await h.mto.loadCompositionContext(designPlan.id);
    expect(ctx.current?.verificationState).toBe("VERIFIED");
    const result = await h.review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id });
    expect(codes(result)).not.toContain("QUANTITY_AI_EXTRACTION_UNVERIFIED");
    expect(codes(result)).not.toContain("ARTIFACT_MTO_SOURCE_CHANGED");
  });

  it("D historical plan-local MTO does not create false CROSS_ARTIFACT_REVISION_INCONSISTENCY", async () => {
    const h = harness();
    const { designPlan, snapshot } = await aligned(h);
    const local = historicalLocal(designPlan);
    await h.store.saveSnapshot(local);
    await bindExplicit(h, designPlan.id, snapshot.id);
    const current = await generateReport(h, designPlan.id);
    const leftover = {
      ...current,
      id: randomUUID(),
      sha256: "ab".repeat(32),
      status: "READY_FOR_ENGINEER_REVIEW" as const,
      supersededById: null,
      createdAt: "2026-09-01T00:00:00.000Z",
      fileName: "historical-plan-local-mto.docx",
      provenance: {
        ...current.provenance,
        mtoSnapshotId: local.id,
        mtoFingerprint: local.snapshotFingerprint,
        mtoRevision: local.revision,
      },
    };
    const superseded = {
      ...leftover,
      id: randomUUID(),
      sha256: "cd".repeat(32),
      status: "SUPERSEDED" as const,
      fileName: "prior-design-report.docx",
    };
    await h.artifacts.saveArtifact(leftover);
    await h.artifacts.saveArtifact(superseded);
    const result = await h.review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id, artifactId: current.id });
    expect(codes(result)).not.toContain("CROSS_ARTIFACT_REVISION_INCONSISTENCY");
    expect(codes(result)).not.toContain("ARTIFACT_MTO_SOURCE_CHANGED");
  });

  it("E unverified explicit MTO still blocks with QUANTITY_AI_EXTRACTION_UNVERIFIED", async () => {
    const h = harness();
    const { designPlan, snapshot } = await aligned(h);
    await bindExplicit(h, designPlan.id, snapshot.id);
    await generateReport(h, designPlan.id);
    const ctx = await h.mto.loadCompositionContext(designPlan.id);
    expect(ctx.current?.verificationState).toBe("UNVERIFIED");
    const result = await h.review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id });
    expect(codes(result)).toContain("QUANTITY_AI_EXTRACTION_UNVERIFIED");
  });

  it("F superseded explicit MTO fails closed without plan-local fallback", async () => {
    const h = harness();
    const { designPlan, snapshot, mtoCalc } = await aligned(h);
    const local = historicalLocal(designPlan);
    await h.store.saveSnapshot(local);
    await bindExplicit(h, designPlan.id, snapshot.id);
    await generateReport(h, designPlan.id);
    await h.structural.applyToMto(commerce(), CRUSHER_FEED_TENANT, { calculationId: mtoCalc.id, workPlanId: mtoCalc.workPlanId });
    const ctx = await h.mto.loadCompositionContext(designPlan.id);
    expect(ctx.generationBlocked?.code).toBe("SOURCE_SUPERSEDED");
    expect(ctx.current).toBeNull();
    const result = await h.review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id });
    expect(codes(result)).toContain("SOURCE_SUPERSEDED");
    expect(codes(result)).not.toContain("ARTIFACT_MTO_SOURCE_CHANGED");
    expect((await h.mto.loadForPlan(designPlan.id))?.snapshotId).toBe(local.id);
  });

  it("G missing explicit MTO fails closed", async () => {
    const h = harness();
    const { designPlan, snapshot } = await aligned(h);
    const local = historicalLocal(designPlan);
    await h.store.saveSnapshot(local);
    await bindExplicit(h, designPlan.id, snapshot.id);
    await generateReport(h, designPlan.id);
    await h.store.replaceEvidenceLink({
      tenantId: CRUSHER_FEED_TENANT,
      fromType: "engineering_work_plan",
      fromId: designPlan.id,
      toType: "engineering_mto_snapshot",
      toId: randomUUID(),
      relationship: COMPOSITION_EVIDENCE_RELATIONSHIP,
      createdAt: new Date().toISOString(),
      createdBy: "cert-er-a1@rtb-cert.test",
    });
    const ctx = await h.mto.loadCompositionContext(designPlan.id);
    expect(ctx.generationBlocked?.code).toBe("COMPOSITION_SOURCE_NOT_AVAILABLE");
    const result = await h.review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id });
    expect(codes(result)).toContain("COMPOSITION_SOURCE_NOT_AVAILABLE");
    expect(codes(result)).not.toContain("ARTIFACT_MTO_SOURCE_CHANGED");
  });

  it("H unauthorized explicit MTO fails closed", async () => {
    const h = harness();
    const { designPlan, snapshot } = await aligned(h);
    await expect(h.mto.bindCompositionEvidence(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      workPlanId: designPlan.id,
      mtoSnapshotId: snapshot.id,
    })).rejects.toThrow();
    const local = historicalLocal(designPlan);
    await h.store.saveSnapshot(local);
    await bindExplicit(h, designPlan.id, snapshot.id);
    await generateReport(h, designPlan.id);
    const row = await h.store.getSnapshot(snapshot.id);
    const foreign = { ...structuredClone(row!), id: randomUUID(), tenantId: "tenant-other-preissue-bind" };
    await h.store.saveSnapshot(foreign);
    await h.store.replaceEvidenceLink({
      tenantId: CRUSHER_FEED_TENANT,
      fromType: "engineering_work_plan",
      fromId: designPlan.id,
      toType: "engineering_mto_snapshot",
      toId: foreign.id,
      relationship: COMPOSITION_EVIDENCE_RELATIONSHIP,
      createdAt: new Date().toISOString(),
      createdBy: "cert-er-a1@rtb-cert.test",
    });
    const ctx = await h.mto.loadCompositionContext(designPlan.id);
    expect(ctx.generationBlocked?.code).toBe("CROSS_TENANT");
    const result = await h.review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id });
    expect(codes(result)).toContain("CROSS_TENANT");
    expect(codes(result)).not.toContain("ARTIFACT_MTO_SOURCE_CHANGED");
  });

  it("I cross-project and cross-workspace explicit sources fail closed", async () => {
    const h = harness();
    const { designPlan, snapshot } = await aligned(h);
    const local = historicalLocal(designPlan);
    await h.store.saveSnapshot(local);
    await bindExplicit(h, designPlan.id, snapshot.id);
    await generateReport(h, designPlan.id);
    const row = await h.store.getSnapshot(snapshot.id);
    const foreignProject = { ...structuredClone(row!), id: randomUUID(), projectId: A11E_PROJECT_B };
    await h.store.saveSnapshot(foreignProject);
    await h.store.replaceEvidenceLink({
      tenantId: CRUSHER_FEED_TENANT,
      fromType: "engineering_work_plan",
      fromId: designPlan.id,
      toType: "engineering_mto_snapshot",
      toId: foreignProject.id,
      relationship: COMPOSITION_EVIDENCE_RELATIONSHIP,
      createdAt: new Date().toISOString(),
      createdBy: "cert-er-a1@rtb-cert.test",
    });
    expect((await h.mto.loadCompositionContext(designPlan.id)).generationBlocked?.code).toBe("CROSS_PROJECT_MISMATCH");
    const projectResult = await h.review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id });
    expect(codes(projectResult)).toContain("CROSS_PROJECT_MISMATCH");
    const foreignWorkspace = { ...structuredClone(row!), id: randomUUID(), workspaceId: "ws-other-preissue-bind" };
    await h.store.saveSnapshot(foreignWorkspace);
    await h.store.replaceEvidenceLink({
      tenantId: CRUSHER_FEED_TENANT,
      fromType: "engineering_work_plan",
      fromId: designPlan.id,
      toType: "engineering_mto_snapshot",
      toId: foreignWorkspace.id,
      relationship: COMPOSITION_EVIDENCE_RELATIONSHIP,
      createdAt: new Date().toISOString(),
      createdBy: "cert-er-a1@rtb-cert.test",
    });
    expect((await h.mto.loadCompositionContext(designPlan.id)).generationBlocked?.code).toBe("CROSS_WORKSPACE");
    const workspaceResult = await h.review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id });
    expect(codes(workspaceResult)).toContain("CROSS_WORKSPACE");
  });

  it("J plan-local behavior remains unchanged when no explicit binding exists", async () => {
    const h = harness();
    const { designPlan, reportCalc } = await aligned(h);
    const local = historicalLocal(designPlan);
    local.items = local.items.map((item) => ({
      ...item,
      basis: { ...item.basis, inputRefs: [reportCalc.inputFingerprint] },
    }));
    local.snapshotFingerprint = fingerprintItems(local.items);
    await h.store.saveSnapshot(local);
    const artifact = await generateReport(h, designPlan.id);
    expect(artifact.provenance.mtoSnapshotId).toBe(local.id);
    const ctx = await h.mto.loadCompositionContext(designPlan.id);
    expect(ctx.bindingKind).toBe("PLAN_LOCAL");
    expect(ctx.current?.id).toBe(local.id);
    const result = await h.review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id });
    expect(codes(result)).not.toContain("ARTIFACT_MTO_SOURCE_CHANGED");
    expect(codes(result)).toContain("QUANTITY_AI_EXTRACTION_UNVERIFIED");
  });

  it("K/L verified calculation is recognized; unverified calculation still blocks", async () => {
    const h = harness();
    const { designPlan, snapshot, reportCalc } = await aligned(h);
    await bindExplicit(h, designPlan.id, snapshot.id);
    await generateReport(h, designPlan.id);
    const unverified = await h.review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id });
    expect(codes(unverified)).toContain("UNVERIFIED_CALCULATION");
    await h.structural.review(commerce(), CRUSHER_FEED_TENANT, {
      calculationId: reportCalc.id,
      action: "ACCEPT_FOR_USE",
    });
    const verified = await h.review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id });
    expect(codes(verified)).not.toContain("UNVERIFIED_CALCULATION");
  });

  it("M/N/O cost and constructability remain required; carbon NOT_APPLICABLE has no gap", async () => {
    const h = harness();
    const { designPlan, snapshot } = await aligned(h);
    await bindExplicit(h, designPlan.id, snapshot.id);
    await generateReport(h, designPlan.id);
    await verifyMto(h, snapshot.id);
    const requirements = designPlan.context.evaluationRequirements ?? [];
    const cost = requirements.find((row) => row.kind === "COST");
    const constructability = requirements.find((row) => row.kind === "CONSTRUCTABILITY");
    const carbon = requirements.find((row) => row.kind === "CARBON");
    expect(cost?.applicability).toBe("REQUIRED");
    expect(constructability?.applicability).toBe("REQUIRED");
    expect(carbon?.applicability).toBe(DEFAULT_PROJECT_VALUE_POLICY.carbon);
    expect(carbon?.applicability).toBe("NOT_APPLICABLE");
    expect(cost?.evidenceState).not.toBe("EVIDENCE_PRESENT");
    expect(cost?.evidenceState).not.toBe("QUANTIFIED_GOVERNED");
    const result = await h.review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id });
    expect(codes(result)).toContain("REQUIRED_COST_EVIDENCE_MISSING");
    expect(codes(result)).toContain("REQUIRED_CONSTRUCTABILITY_EVIDENCE_MISSING");
    expect(codes(result)).not.toContain("REQUIRED_CARBON_EVIDENCE_MISSING");
  });

  it("P REPORTBIND selector contract remains EXPLICIT over PLAN_LOCAL", () => {
    expect(A15A_V5B_REPORTBIND.sourceSelectionPrecedence).toBe("EXPLICIT_BOUND_SOURCE_OVER_PLAN_LOCAL");
    expect(A15A_V5B_PREISSUE_BIND.sourceSelectionPrecedence).toBe("EXPLICIT_BOUND_SOURCE_OVER_PLAN_LOCAL");
    expect(A15A_V5B_PREISSUE_BIND.schemaChange).toBe(false);
    expect(A15A_V5B_PREISSUE_BIND.rlsChange).toBe(false);
    expect(A15A_V5B_PREISSUE_BIND.kgNodesAdded).toBe(false);
  });
});
