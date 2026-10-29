import { randomUUID } from "node:crypto";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { describe, expect, it } from "vitest";
import { createMemoryArtifactStore } from "../artifact-automation/memory-store";
import { createTestArtifactService } from "../artifact-automation/service";
import { A11E_PROJECT_B } from "../change-workbench/fixture";
import { sampleRequirement } from "../information-requirements/fixture";
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
import { A15A_V5B_REPORTBIND, COMPOSITION_EVIDENCE_RELATIONSHIP } from "./composition-evidence";
import { composeDeliverableSource } from "./deliverable-composition";
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
  return { plans, work, store, mto, structural, artifacts, artifactSvc };
}

async function calcPlan(work: EngineeringWorkGeneratorService, extras: { projectId?: string; systemId?: string | null } = {}) {
  return work.generatePlan(commerce(), extras.projectId ? CRUSHER_FEED_TENANT : CRUSHER_FEED_TENANT, {
    projectId: extras.projectId ?? CRUSHER_EXPANSION_FEED_PROJECT_ID,
    workType: "DESIGN_CALCULATION",
    lifecycleStage: "FEED",
    discipline: "STRUCTURAL",
    systemId: extras.systemId === undefined ? A11A_SYSTEM_ID : extras.systemId,
    snapshot: feedStructuralSnapshot(),
    readiness: WORKFLOW_READINESS.detailedReady,
    acknowledged: true,
  });
}

async function reportPlan(work: EngineeringWorkGeneratorService) {
  return work.generatePlan(commerce(), CRUSHER_FEED_TENANT, {
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    workType: "DESIGN_REPORT",
    lifecycleStage: "FEED",
    discipline: "STRUCTURAL",
    systemId: `${A11A_SYSTEM_ID}-report`,
    snapshot: feedStructuralSnapshot(),
    readiness: WORKFLOW_READINESS.detailedReady,
    acknowledged: true,
  });
}

async function aligned(h: ReturnType<typeof harness>) {
  const mtoPlan = await calcPlan(h.work);
  const designPlan = await reportPlan(h.work);
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

describe("EOS-A15A-V5B-REPORTBIND explicit cross-Work-Plan MTO evidence", () => {
  it("A same-project explicit binding succeeds without copying or owning the MTO", async () => {
    const h = harness();
    const { mtoPlan, designPlan, snapshot, reportCalc } = await aligned(h);
    const bound = await h.mto.bindCompositionEvidence(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: designPlan.id,
      mtoSnapshotId: snapshot.id,
    });
    expect(bound.bindingKind).toBe("EXPLICIT");
    expect(bound.ownershipTransferred).toBe(false);
    expect(bound.snapshotCopied).toBe(false);
    expect(bound.calculationExecuted).toBe(false);
    expect(bound.producingWorkPlanId).toBe(mtoPlan.id);
    expect(bound.mtoSnapshotId).toBe(snapshot.id);
    const ctx = await h.mto.loadCompositionContext(designPlan.id);
    expect(ctx.bindingKind).toBe("EXPLICIT");
    expect(ctx.current?.id).toBe(snapshot.id);
    expect(ctx.current?.workPlanId).toBe(mtoPlan.id);
    expect(ctx.current?.items[0]?.basis.inputRefs).toContain(reportCalc.inputFingerprint);
    const local = await h.mto.listSnapshots(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      projectId: designPlan.projectId,
      workPlanId: designPlan.id,
    });
    expect(local.some((row) => row.id === snapshot.id)).toBe(false);
    const generated = await h.artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id, artifactType: "DESIGN_REPORT" });
    expect(generated.ok).toBe(true);
    if (!generated.ok) return;
    expect(generated.artifact.provenance.mtoSnapshotId).toBe(snapshot.id);
    expect(generated.thread.links.some((row: { relationship: string; fromType: string; toType: string }) =>
      row.relationship === "USES" && row.fromType === "engineering_work_plan" && row.toType === "engineering_mto_snapshot",
    )).toBe(true);
  });

  it("B/C/D cross-project, cross-workspace, and cross-tenant binding fail", async () => {
    const h = harness();
    const { designPlan, snapshot } = await aligned(h);
    const row = await h.store.getSnapshot(snapshot.id);
    expect(row).toBeTruthy();
    const foreignProject = { ...structuredClone(row!), id: randomUUID(), projectId: A11E_PROJECT_B };
    const foreignWorkspace = { ...structuredClone(row!), id: randomUUID(), workspaceId: "ws-other-reportbind" };
    const foreignTenant = { ...structuredClone(row!), id: randomUUID(), tenantId: "tenant-other-reportbind" };
    await h.store.saveSnapshot(foreignProject);
    await h.store.saveSnapshot(foreignWorkspace);
    await h.store.saveSnapshot(foreignTenant);
    await expect(h.mto.bindCompositionEvidence(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: designPlan.id,
      mtoSnapshotId: foreignProject.id,
    })).rejects.toThrow("CROSS_PROJECT_MISMATCH");
    await expect(h.mto.bindCompositionEvidence(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: designPlan.id,
      mtoSnapshotId: foreignWorkspace.id,
    })).rejects.toThrow("CROSS_WORKSPACE");
    await expect(h.mto.bindCompositionEvidence(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: designPlan.id,
      mtoSnapshotId: foreignTenant.id,
    })).rejects.toThrow("CROSS_TENANT");
  });

  it("E explicit bound MTO wins over stale plan-local implicit MTO", async () => {
    const h = harness();
    const { designPlan, snapshot } = await aligned(h);
    const local = historicalLocal(designPlan);
    await h.store.saveSnapshot(local);
    const before = await h.mto.loadCompositionContext(designPlan.id);
    expect(before.bindingKind).toBe("PLAN_LOCAL");
    expect(before.current?.id).toBe(local.id);
    await h.mto.bindCompositionEvidence(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: designPlan.id,
      mtoSnapshotId: snapshot.id,
    });
    const after = await h.mto.loadCompositionContext(designPlan.id);
    expect(after.bindingKind).toBe("EXPLICIT");
    expect(after.current?.id).toBe(snapshot.id);
    expect(after.current?.id).not.toBe(local.id);
    const generated = await h.artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id, artifactType: "DESIGN_REPORT" });
    expect(generated.ok).toBe(true);
    if (!generated.ok) return;
    expect(generated.artifact.provenance.mtoSnapshotId).toBe(snapshot.id);
    expect(generated.artifact.provenance.mtoFingerprint).toBe(snapshot.snapshotFingerprint);
  });

  it("F missing bound MTO fails closed without substituting plan-local", async () => {
    const h = harness();
    const { designPlan } = await aligned(h);
    const local = historicalLocal(designPlan);
    await h.store.saveSnapshot(local);
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
    expect(ctx.bindingKind).toBe("EXPLICIT");
    expect(ctx.current).toBeNull();
    expect(ctx.generationBlocked?.code).toBe("COMPOSITION_SOURCE_NOT_AVAILABLE");
    const generated = await h.artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id, artifactType: "DESIGN_REPORT" });
    expect(generated.ok).toBe(false);
    if (generated.ok) return;
    expect(generated.run.status).toBe("GENERATION_BLOCKED");
    expect(generated.run.explanation).toContain("Fail closed");
  });

  it("G unauthorized bound MTO fails closed", async () => {
    const h = harness();
    const { designPlan, snapshot } = await aligned(h);
    await expect(h.mto.bindCompositionEvidence(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      workPlanId: designPlan.id,
      mtoSnapshotId: snapshot.id,
    })).rejects.toThrow();
    await expect(h.mto.bindCompositionEvidence(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: designPlan.id,
      mtoSnapshotId: snapshot.id,
      selectedProjectId: A11E_PROJECT_B,
    })).rejects.toThrow(/CROSS_PROJECT_WORKPLAN_DENIED|COMPOSITION_SOURCE_UNAUTHORIZED|CROSS_PROJECT_MISMATCH/);
    const row = await h.store.getSnapshot(snapshot.id);
    const foreign = { ...structuredClone(row!), id: randomUUID(), tenantId: "tenant-other-reportbind" };
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
    const generated = await h.artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id, artifactType: "DESIGN_REPORT" });
    expect(generated.ok).toBe(false);
    if (generated.ok) return;
    expect(generated.run.status).toBe("GENERATION_BLOCKED");
  });

  it("H/I fingerprint mismatch blocks generation; compatible fingerprint permits composition", async () => {
    const h = harness();
    const { designPlan, snapshot, reportCalc } = await aligned(h);
    expect(snapshot.items[0]?.basis.inputRefs).toContain(reportCalc.inputFingerprint);
    await h.mto.bindCompositionEvidence(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: designPlan.id,
      mtoSnapshotId: snapshot.id,
    });
    const ok = await h.artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id, artifactType: "DESIGN_REPORT" });
    expect(ok.ok).toBe(true);
    const changed = await h.structural.changeGovernedInput(commerce(), CRUSHER_FEED_TENANT, {
      calculationId: reportCalc.id,
      key: "load.dead.udl",
      value: 12,
      workPlanId: designPlan.id,
    });
    await h.structural.rerun(commerce(), CRUSHER_FEED_TENANT, { calculationId: changed.id, workPlanId: designPlan.id });
    const blocked = await h.artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id, artifactType: "DESIGN_REPORT" });
    expect(blocked.ok).toBe(false);
    if (blocked.ok) return;
    expect(blocked.run.status).toBe("GENERATION_BLOCKED");
    expect(blocked.run.explanation).toContain("ENGINEERING_STATE_MISMATCH");
  });

  it("J cross-Work-Plan calculation execution remains prohibited", async () => {
    const h = harness();
    const { mtoPlan, designPlan, mtoCalc } = await aligned(h);
    await expect(h.structural.runCheck(commerce(), CRUSHER_FEED_TENANT, {
      calculationId: mtoCalc.id,
      workPlanId: designPlan.id,
    })).rejects.toThrow("CROSS_WORK_PLAN_CALCULATION_EXECUTION_PROHIBITED");
    await expect(h.structural.applyToMto(commerce(), CRUSHER_FEED_TENANT, {
      calculationId: mtoCalc.id,
      workPlanId: designPlan.id,
    })).rejects.toThrow("CROSS_WORK_PLAN_CALCULATION_EXECUTION_PROHIBITED");
    await expect(h.structural.changeGovernedInput(commerce(), CRUSHER_FEED_TENANT, {
      calculationId: mtoCalc.id,
      key: "load.dead.udl",
      value: 9,
      workPlanId: designPlan.id,
    })).rejects.toThrow("CROSS_WORK_PLAN_CALCULATION_EXECUTION_PROHIBITED");
    const owned = await h.structural.runCheck(commerce(), CRUSHER_FEED_TENANT, {
      calculationId: mtoCalc.id,
      workPlanId: mtoPlan.id,
    });
    expect(owned.workPlanId).toBe(mtoPlan.id);
    expect(A15A_V5B_REPORTBIND.crossWorkPlanCalculationExecutionAllowed).toBe(false);
  });

  it("K historical local Rev D is not mutated after explicit binding", async () => {
    const h = harness();
    const { designPlan, snapshot } = await aligned(h);
    const local = historicalLocal(designPlan);
    await h.store.saveSnapshot(local);
    const before = structuredClone(await h.store.getSnapshot(local.id));
    await h.mto.bindCompositionEvidence(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: designPlan.id,
      mtoSnapshotId: snapshot.id,
    });
    await h.artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id, artifactType: "DESIGN_REPORT" });
    const after = await h.store.getSnapshot(local.id);
    expect(after?.id).toBe(local.id);
    expect(after?.revision).toBe("D");
    expect(after?.snapshotFingerprint).toBe(before?.snapshotFingerprint);
    expect(after?.items[0]?.unitMass).toBe(40.4);
    expect(after?.items[0]?.quantity).toBe(before?.items[0]?.quantity);
    expect(after?.items[0]?.section).toBe(before?.items[0]?.section);
  });

  it("L artifact source manifest records exact external MTO id + fingerprint", async () => {
    const h = harness();
    const { mtoPlan, designPlan, snapshot, reportCalc } = await aligned(h);
    await h.mto.bindCompositionEvidence(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: designPlan.id,
      mtoSnapshotId: snapshot.id,
    });
    const generated = await h.artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id, artifactType: "DESIGN_REPORT" });
    expect(generated.ok).toBe(true);
    if (!generated.ok) return;
    const manifest = generated.artifact.provenance.sourceManifest as Record<string, unknown>;
    expect(manifest.mtoSourceType).toBe("MTO_SNAPSHOT");
    expect(manifest.mtoSnapshotId).toBe(snapshot.id);
    expect(manifest.mtoFingerprint).toBe(snapshot.snapshotFingerprint);
    expect(manifest.mtoRevision).toBe(snapshot.revision);
    expect(manifest.mtoScope).toBe("STRUCTURAL");
    expect(manifest.mtoProducingWorkPlanId).toBe(mtoPlan.id);
    expect(manifest.mtoBindingKind).toBe("EXPLICIT");
    expect(manifest.mtoVerificationState).toBe("UNVERIFIED");
    expect(manifest.mtoSourceCalculationId).toBe(snapshot.items[0]?.basis.sourceRef);
    expect(manifest.mtoSourceInputRefs).toEqual(expect.arrayContaining([reportCalc.inputFingerprint]));
    expect(manifest.calculationId).toBe(reportCalc.id);
    expect(manifest.calculationInputFingerprint).toBe(reportCalc.inputFingerprint);
    expect(manifest.calculationEngine).toBe(reportCalc.engineId);
    expect(manifest.calculationReviewState).toBe("UNVERIFIED");
    expect(reportCalc.status).toBe("REVIEW_REQUIRED");
    expect(generated.artifact.provenance.engineeringApproved).toBe(false);
  });

  it("M/N successor fingerprint makes the prior artifact stale; regeneration creates a new manifest", async () => {
    const h = harness();
    const { designPlan, snapshot } = await aligned(h);
    await h.mto.bindCompositionEvidence(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: designPlan.id,
      mtoSnapshotId: snapshot.id,
    });
    const first = await h.artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id, artifactType: "DESIGN_REPORT" });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const firstManifest = structuredClone(first.artifact.provenance.sourceManifest);
    const successorItems = snapshot.items.map((item) => ({
      ...item,
      id: randomUUID(),
      quantity: (item.quantity ?? 0) + 0.001,
      totalMass: (item.totalMass ?? 0) + 0.001,
      basis: { ...item.basis, id: randomUUID(), inputRefs: [...(item.basis.inputRefs ?? [])] },
    }));
    const successor = await h.mto.createRevision(commerce(), CRUSHER_FEED_TENANT, {
      snapshotId: snapshot.id,
      revision: "B",
      items: successorItems,
    });
    expect(successor.supersedesSnapshotId).toBe(snapshot.id);
    const ctx = await h.mto.loadCompositionContext(designPlan.id);
    expect(ctx.generationBlocked?.code).toBe("SOURCE_SUPERSEDED");
    expect(ctx.selectedFingerprint).toBe(successor.snapshotFingerprint);
    const stale = h.artifactSvc.compareArtifact(first.artifact, designPlan.inputFingerprint, ctx.selectedFingerprint);
    expect(stale.stale).toBe(true);
    expect(stale.reason).toBe("MTO_SOURCE_CHANGED");
    const blocked = await h.artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id, artifactType: "DESIGN_REPORT" });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.run.status).toBe("GENERATION_BLOCKED");
      expect(blocked.run.explanation).toContain("SOURCE_SUPERSEDED");
      expect(blocked.run.id).not.toBe("blocked-composition-source");
    }
    await h.mto.bindCompositionEvidence(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: designPlan.id,
      mtoSnapshotId: successor.id,
    });
    const second = await h.artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id, artifactType: "DESIGN_REPORT" });
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.artifact.id).not.toBe(first.artifact.id);
    expect(second.artifact.provenance.mtoSnapshotId).toBe(successor.id);
    expect(second.artifact.provenance.mtoFingerprint).toBe(successor.snapshotFingerprint);
    const storedFirst = await h.artifacts.getArtifact(first.artifact.id);
    expect(storedFirst?.provenance.sourceManifest).toEqual(firstManifest);
    expect(storedFirst?.status).toBe("SUPERSEDED");
    expect(storedFirst?.supersededById).toBe(second.artifact.id);
  });

  it("O expectedOutputs and managed-source gates remain unchanged", async () => {
    const h = harness();
    const { mtoPlan, designPlan, snapshot } = await aligned(h);
    expect(designPlan.context.expectedOutputs.map((row) => row.outputType)).toEqual(["DESIGN_REPORT"]);
    expect(mtoPlan.context.expectedOutputs.map((row) => row.outputType)).toContain("STRUCTURAL_MTO");
    expect(mtoPlan.context.expectedOutputs.map((row) => row.outputType)).not.toContain("DESIGN_REPORT");
    await expect(h.mto.createSnapshot(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: designPlan.id,
      revision: "Z",
      items: crusherMtoRevAItems(),
      disciplineScope: "STRUCTURAL",
    })).rejects.toThrow("mto_not_expected_on_work_plan");
    await h.mto.bindCompositionEvidence(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: designPlan.id,
      mtoSnapshotId: snapshot.id,
    });
    expect(designPlan.context.expectedOutputs.map((row) => row.outputType)).toEqual(["DESIGN_REPORT"]);
    expect(sampleRequirement({
      id: "ir-managed",
      requirementType: "DESIGN_INPUT",
      informationType: "DRAWING",
      purpose: "FOR_DESIGN_INPUT",
      title: "Managed source remains required",
    }).requireManagedSource).toBe(true);
    await expect(h.work.generatePlan(commerce(), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "DESIGN_REPORT",
      lifecycleStage: "FEED",
      snapshot: feedStructuralSnapshot(),
      readiness: WORKFLOW_READINESS.detailedReady,
      unmanagedPath: "C:\\\\temp\\\\unmanaged.docx",
    })).rejects.toThrow("unmanaged_file_outside_eos");
  });

  it("P/Q V4/V4C non-null plan-local MTO binding and cost/carbon governance do not regress", async () => {
    const h = harness();
    const plan = await calcPlan(h.work, { systemId: `${A11A_SYSTEM_ID}-v4` });
    const revA = await h.mto.createSnapshot(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: plan.id,
      revision: "A",
      items: crusherMtoRevAItems(),
    });
    const ctx = await h.mto.loadCompositionContext(plan.id);
    expect(ctx.bindingKind).toBe("PLAN_LOCAL");
    expect(ctx.current?.id).toBe(revA.id);
    const composed = composeDeliverableSource({
      plan,
      templateCode: "EAT-REPORT-DESIGN",
      templateVersion: "1.0.0",
      artifactType: "DESIGN_REPORT",
      snapshot: ctx.current,
    });
    expect(composed.manifest.mtoSnapshotId).toBe(revA.id);
    expect(composed.manifest.mtoFingerprint).toBe(revA.snapshotFingerprint);
    expect(composed.costStatus).toBe("COST_NOT_CALCULATED");
    expect(composed.carbonStatus).toBe("CARBON_NOT_CALCULATED");
    expect(composed.constructabilityScore).toBeNull();
    const report = await h.artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id, artifactType: "DESIGN_REPORT" });
    expect(report.ok).toBe(true);
    if (!report.ok) return;
    expect(report.artifact.provenance.mtoSnapshotId).toBe(revA.id);
    expect(report.artifact.provenance.mtoFingerprint).toBe(revA.snapshotFingerprint);
    expect(report.artifact.provenance.costStatus).toBe("COST_NOT_CALCULATED");
    expect(report.artifact.provenance.carbonStatus).toBe("CARBON_NOT_CALCULATED");
    const revB = await h.mto.createRevision(commerce(), CRUSHER_FEED_TENANT, {
      snapshotId: revA.id,
      revision: "B",
      items: crusherMtoRevAItems().map((item) => ({ ...item, quantity: (item.quantity ?? 0) + 1 })),
    });
    const stale = h.artifactSvc.compareArtifact(report.artifact, plan.inputFingerprint, revB.snapshotFingerprint);
    expect(stale.stale).toBe(true);
    expect(stale.reason).toBe("MTO_SOURCE_CHANGED");
  });
});
