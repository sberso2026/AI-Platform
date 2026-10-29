import { randomUUID } from "node:crypto";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { describe, expect, it } from "vitest";
import { ARTIFACT_TEMPLATES } from "../artifact-automation/catalog";
import { createMemoryArtifactStore } from "../artifact-automation/memory-store";
import { createTestArtifactService, isCanonicalGenerationRunId } from "../artifact-automation/service";
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
import { A15A_V5B_REPORTBIND_HARDEN } from "./composition-evidence";
import { composeDeliverableSource, DESIGN_REPORT_SECTIONS } from "./deliverable-composition";
import { createMemoryQuantityMtoStore } from "./quantity-mto-store";
import { createTestQuantityMtoService } from "./quantity-mto-service";

const SENTINEL_RUN_IDS = ["blocked-composition-source", "blocked-engineering-state", "blocked-template"];

function commerce(action: "analysis.read" | "analysis.write" = "analysis.write") {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    actorUserId: "cert-er-a1@rtb-cert.test",
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

function harness() {
  const events: Array<{ eventType: string; planId: string; actorId?: string | null }> = [];
  const plans = createMemoryWorkPlanStore();
  const work = new EngineeringWorkGeneratorService({ from() { return this; } } as never, plans);
  const store = createMemoryQuantityMtoStore();
  const mto = createTestQuantityMtoService(store, (id) => plans.getPlan(id));
  const structuralStore = createMemoryStructuralStore();
  const structural = createTestStructuralWorkService(structuralStore, (id) => plans.getPlan(id), mto);
  const artifacts = createMemoryArtifactStore();
  const artifactSvc = createTestArtifactService(artifacts, (id) => plans.getPlan(id), async (_c, _t, input) => {
    events.push({ eventType: input.eventType, planId: input.planId, actorId: input.actorId ?? null });
  });
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
  return { plans, work, store, mto, structural, artifacts, artifactSvc, events };
}

async function aligned(h: ReturnType<typeof harness>) {
  const mtoPlan = await h.work.generatePlan(commerce(), CRUSHER_FEED_TENANT, {
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    workType: "DESIGN_CALCULATION",
    lifecycleStage: "FEED",
    discipline: "STRUCTURAL",
    systemId: A11A_SYSTEM_ID,
    snapshot: feedStructuralSnapshot(),
    readiness: WORKFLOW_READINESS.detailedReady,
    acknowledged: true,
  });
  const designPlan = await h.work.generatePlan(commerce(), CRUSHER_FEED_TENANT, {
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    workType: "DESIGN_REPORT",
    lifecycleStage: "FEED",
    discipline: "STRUCTURAL",
    systemId: `${A11A_SYSTEM_ID}-report`,
    snapshot: feedStructuralSnapshot(),
    readiness: WORKFLOW_READINESS.detailedReady,
    acknowledged: true,
  });
  const mtoSeed = await h.structural.seedFixture(commerce(), CRUSHER_FEED_TENANT, { workPlanId: mtoPlan.id });
  const mtoCalc = await h.structural.runCheck(commerce(), CRUSHER_FEED_TENANT, { calculationId: mtoSeed.id, workPlanId: mtoPlan.id });
  const snapshot = await h.structural.applyToMto(commerce(), CRUSHER_FEED_TENANT, { calculationId: mtoCalc.id, workPlanId: mtoPlan.id });
  const reportSeed = await h.structural.seedFixture(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id });
  const reportCalc = await h.structural.runCheck(commerce(), CRUSHER_FEED_TENANT, { calculationId: reportSeed.id, workPlanId: designPlan.id });
  return { mtoPlan, designPlan, mtoCalc, snapshot, reportCalc };
}

describe("EOS-A15A-V5B-REPORTBIND-HARDEN", () => {
  it("rejects the live UUID sentinels and accepts canonical run ids", () => {
    for (const id of SENTINEL_RUN_IDS) expect(isCanonicalGenerationRunId(id)).toBe(false);
    expect(isCanonicalGenerationRunId(randomUUID())).toBe(true);
  });

  it("SOURCE_SUPERSEDED returns governed GENERATION_BLOCKED with a persistable UUID run", async () => {
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
    const beforeBind = await h.mto.loadCompositionContext(designPlan.id);
    expect(beforeBind.bindingKind).toBe("EXPLICIT");
    expect(beforeBind.generationBlocked?.code).toBe("SOURCE_SUPERSEDED");
    expect(beforeBind.current).toBeNull();
    expect(beforeBind.previous?.id).toBe(snapshot.id);

    const blocked = await h.artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id, artifactType: "DESIGN_REPORT" });
    expect(blocked.ok).toBe(false);
    if (blocked.ok) return;
    expect(blocked.artifact).toBeNull();
    expect(blocked.run.status).toBe("GENERATION_BLOCKED");
    expect(blocked.run.explanation).toMatch(/^SOURCE_SUPERSEDED\b/);
    expect(blocked.run.explanation).not.toMatch(/invalid input syntax for type uuid/i);
    expect(isCanonicalGenerationRunId(blocked.run.id)).toBe(true);
    expect(SENTINEL_RUN_IDS).not.toContain(blocked.run.id);
    expect(blocked.run.artifactId).toBeNull();
    expect(blocked.run.artifactType).toBe("DESIGN_REPORT");
    expect(blocked.run.workPlanId).toBe(designPlan.id);
    expect(blocked.run.requestedBy).toBe("cert-er-a1@rtb-cert.test");
    expect(blocked.run.warnings.some((row) => row.includes(`boundSourceId=${snapshot.id}`) && row.includes("boundSourceStatus=SUPERSEDED"))).toBe(true);

    const storedRun = await h.artifacts.getRun(blocked.run.id);
    expect(storedRun?.id).toBe(blocked.run.id);
    expect(storedRun?.status).toBe("GENERATION_BLOCKED");
    expect(h.events.map((row) => row.eventType)).toEqual(expect.arrayContaining(["ARTIFACT_GENERATION_STARTED", "ARTIFACT_GENERATION_FAILED"]));
    expect(h.events.some((row) => row.eventType === "ARTIFACT_GENERATED" && row.planId === designPlan.id)).toBe(true);
    expect(h.events.filter((row) => row.eventType === "ARTIFACT_GENERATION_FAILED" && row.planId === designPlan.id).length).toBeGreaterThan(0);

    const after = await h.mto.loadCompositionContext(designPlan.id);
    expect(after.bindingKind).toBe("EXPLICIT");
    expect(after.generationBlocked?.code).toBe("SOURCE_SUPERSEDED");
    expect(after.current).toBeNull();
    expect(after.previous?.id).toBe(snapshot.id);
    expect(after.selectedFingerprint).toBe(successor.snapshotFingerprint);

    const artifacts = await h.artifacts.listArtifacts(designPlan.workspaceId, designPlan.id);
    expect(artifacts.some((row) => row.id === first.artifact.id)).toBe(true);
    expect(artifacts.filter((row) => row.artifactType === "DESIGN_REPORT")).toHaveLength(1);
    const preserved = await h.artifacts.getArtifact(first.artifact.id);
    expect(preserved?.provenance.sourceManifest).toEqual(firstManifest);
    expect(preserved?.status).not.toBe("SUPERSEDED");
  });

  it("UNVERIFIED calculations mutate in place; VERIFIED_BY_ENGINEER calculations clone", async () => {
    expect(A15A_V5B_REPORTBIND_HARDEN.unverifiedCalculationMutable).toBe(true);
    expect(A15A_V5B_REPORTBIND_HARDEN.verifiedCalculationImmutable).toBe(true);
    const h = harness();
    const { mtoPlan, mtoCalc } = await aligned(h);
    expect(mtoCalc.status).toBe("REVIEW_REQUIRED");
    expect(mtoCalc.reviewStatus).toBe("UNVERIFIED");
    const changed = await h.structural.changeGovernedInput(commerce(), CRUSHER_FEED_TENANT, {
      calculationId: mtoCalc.id,
      key: "geometry.span",
      value: 9,
      workPlanId: mtoPlan.id,
    });
    expect(changed.id).toBe(mtoCalc.id);
    expect(changed.status).toBe("STALE");
    expect(changed.designBasis.inputs.find((row) => row.key === "geometry.span")?.value).toBe(9);

    const rerun = await h.structural.rerun(commerce(), CRUSHER_FEED_TENANT, { calculationId: changed.id, workPlanId: mtoPlan.id });
    const verified = await h.structural.review(commerce(), CRUSHER_FEED_TENANT, { calculationId: rerun.id, action: "ACCEPT_FOR_USE" });
    expect(verified.status).toBe("VERIFIED_BY_ENGINEER");
    await expect(h.structural.runCheck(commerce(), CRUSHER_FEED_TENANT, { calculationId: verified.id, workPlanId: mtoPlan.id })).rejects.toThrow("verified_calculation_immutable");
    const next = await h.structural.changeGovernedInput(commerce(), CRUSHER_FEED_TENANT, {
      calculationId: verified.id,
      key: "geometry.span",
      value: 10,
      workPlanId: mtoPlan.id,
    });
    expect(next.id).not.toBe(verified.id);
    expect(next.supersedesId).toBe(verified.id);
    const original = await h.structural.get(commerce("analysis.read"), CRUSHER_FEED_TENANT, { id: verified.id });
    expect(original.status).toBe("VERIFIED_BY_ENGINEER");
    expect(original.designBasis.inputs.find((row) => row.key === "geometry.span")?.value).toBe(9);
  });

  it("Design Report quantity table contract does not require item-level section or unit mass", async () => {
    expect(A15A_V5B_REPORTBIND_HARDEN.sectionAndUnitMassDisplay).toBe("NOT_REQUIRED_BY_CURRENT_TEMPLATE");
    expect(A15A_V5B_REPORTBIND_HARDEN.kgNodeRequiredForV5b).toBe(false);
    const template = ARTIFACT_TEMPLATES.find((row) => row.code === "EAT-REPORT-DESIGN");
    expect(template?.sheetsOrSections).toEqual([...DESIGN_REPORT_SECTIONS]);
    expect(template?.sheetsOrSections.join(" ")).not.toMatch(/unit mass/i);
    const h = harness();
    const { mtoPlan, designPlan, snapshot, reportCalc } = await aligned(h);
    expect(snapshot.items[0]?.section).toBeTruthy();
    expect(snapshot.items[0]?.unitMass).toBeTruthy();
    await h.mto.bindCompositionEvidence(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: designPlan.id,
      mtoSnapshotId: snapshot.id,
    });
    const composed = composeDeliverableSource({
      plan: designPlan,
      templateCode: "EAT-REPORT-DESIGN",
      templateVersion: "1.0.0",
      artifactType: "DESIGN_REPORT",
      snapshot,
      bindingKind: "EXPLICIT",
      calculation: {
        id: reportCalc.id,
        workPlanId: designPlan.id,
        inputFingerprint: reportCalc.inputFingerprint,
        engineId: reportCalc.engineId,
        engineVersion: reportCalc.engineVersion,
        method: reportCalc.engineId,
        reviewStatus: reportCalc.reviewStatus,
      },
    });
    const quantity = composed.sections.find((row) => row.title === "Engineering Quantities / MTO Summary");
    expect(quantity?.rows[0]).toEqual(["Category", "Quantity", "Unit", "Status", "Evidence class", "Items"]);
    expect(quantity?.rows[0]).not.toContain("Section");
    expect(quantity?.rows[0]).not.toContain("Unit mass");
    const generated = await h.artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: designPlan.id, artifactType: "DESIGN_REPORT" });
    expect(generated.ok).toBe(true);
    if (!generated.ok) return;
    const manifest = generated.artifact.provenance.sourceManifest as Record<string, unknown>;
    expect(manifest.mtoSnapshotId).toBe(snapshot.id);
    expect(manifest.mtoFingerprint).toBe(snapshot.snapshotFingerprint);
    expect(manifest.calculationId).toBe(reportCalc.id);
    expect(manifest.calculationInputFingerprint).toBe(reportCalc.inputFingerprint);
    expect(manifest.mtoVerificationState).toBe("UNVERIFIED");
    expect(manifest.calculationReviewState).toBe("UNVERIFIED");
    expect(manifest.mtoProducingWorkPlanId).toBe(mtoPlan.id);
  });
});
