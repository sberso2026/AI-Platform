import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { describe, expect, it } from "vitest";
import { inspectDocx, inspectXlsx } from "../artifact-automation/validate";
import { createMemoryArtifactStore } from "../artifact-automation/memory-store";
import { createTestArtifactService } from "../artifact-automation/service";
import { A11A_SYSTEM_ID, CRUSHER_EXPANSION_FEED_PROJECT_ID, CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, feedStructuralSnapshot, WORKFLOW_READINESS } from "../work-generator/fixture";
import { createMemoryWorkPlanStore } from "../work-generator/memory-store";
import { EngineeringWorkGeneratorService } from "../work-generator/service";
import {
  A15A_V4_FEATURE_FREEZE,
  A15A_V4_GENERATOR_VERSION,
  compareDeliverableStaleness,
  composeDeliverableSource,
  DELIVERABLE_HUMAN_AUTHORITY,
  EVIDENCE_CLASSES,
} from "./deliverable-composition";
import { crusherMtoRevAItems, crusherMtoRevBItems } from "./quantity-mto-demonstrator";
import { createMemoryQuantityMtoStore } from "./quantity-mto-store";
import { createTestQuantityMtoService } from "./quantity-mto-service";
import { hostedMalwareScannerAvailable, MALWARE_SCAN_STATUS } from "../tool-orchestration/return-validation";
import type { QuantityItem } from "./quantity-mto";

function commerce(action: "analysis.read" | "analysis.write" = "analysis.write") {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    actorUserId: "cert-er-a1@rtb-cert.test",
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

function harness() {
  const plans = createMemoryWorkPlanStore();
  const work = new EngineeringWorkGeneratorService({ from() { return this; } } as never, plans);
  const mto = createTestQuantityMtoService(createMemoryQuantityMtoStore(), (id) => plans.getPlan(id));
  const artifacts = createMemoryArtifactStore();
  const artifactSvc = createTestArtifactService(artifacts, (id) => plans.getPlan(id));
  artifactSvc.bindQuantityMto((planId) => mto.loadCompositionContext(planId));
  return { plans, work, mto, artifacts, artifactSvc };
}

function xmlText(buffer: Buffer) {
  return inspectDocx(buffer).xml.replace(/<[^>]+>/g, " ");
}

describe("EOS-A15A-V4 governed deliverable composition", () => {
  it("does not create a Deliverable Intelligence domain", () => {
    expect(A15A_V4_FEATURE_FREEZE.newTopLevelDomain).toBe(false);
    expect(A15A_V4_FEATURE_FREEZE.newDeliverableIntelligenceDomain).toBe(false);
    expect(A15A_V4_FEATURE_FREEZE.newMtoIntelligenceDomain).toBe(false);
    expect(A15A_V4_FEATURE_FREEZE.scannerV2).toBe(false);
    expect(DELIVERABLE_HUMAN_AUTHORITY.generationCannotApproveDeliverable).toBe(true);
    expect(EVIDENCE_CLASSES).toContain("AI_DRAFT_NARRATIVE");
    expect(hostedMalwareScannerAvailable({} as NodeJS.ProcessEnv)).toBe(false);
    expect(MALWARE_SCAN_STATUS === "UNAVAILABLE_HOSTED_CLAMAV" || MALWARE_SCAN_STATUS === "HOSTED_CLAMAV_CONFIGURED").toBe(true);
  });

  it("classifies evidence, preserves canonical statuses, and fail-closes cost/carbon/missing quantity", async () => {
    const { work, mto, artifactSvc } = harness();
    const plan = await work.generatePlan(commerce(), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "DESIGN_CALCULATION",
      lifecycleStage: "FEED",
      discipline: "STRUCTURAL",
      systemId: A11A_SYSTEM_ID,
      snapshot: feedStructuralSnapshot(),
      readiness: WORKFLOW_READINESS.detailedReady,
      acknowledged: true,
    });
    await mto.createSnapshot(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: plan.id,
      revision: "A",
      items: crusherMtoRevAItems(),
    });
    const bound = await mto.loadCompositionContext(plan.id);
    const composed = composeDeliverableSource({
      plan,
      templateCode: "EAT-REPORT-DESIGN",
      templateVersion: "1.0.0",
      artifactType: "DESIGN_REPORT",
      snapshot: bound.current,
    });
    expect(composed.engineeringApproved).toBe(false);
    expect(composed.authority).toBe("READY_FOR_ENGINEER_REVIEW");
    expect(composed.manifest.generatorVersion).toBe(A15A_V4_GENERATOR_VERSION);
    expect(composed.manifest.mtoRevision).toBe("A");
    expect(composed.costStatus).toBe("COST_NOT_CALCULATED");
    expect(composed.carbonStatus).toBe("CARBON_NOT_CALCULATED");
    expect(composed.constructabilityScore).toBeNull();
    expect(composed.readiness.costBasis).toBe("MISSING");
    expect(composed.quantityRows.some((row) => row.statusLabel.includes("UNVERIFIED"))).toBe(true);
    expect(composed.quantityRows.some((row) => row.evidenceClass === "ENGINEER_ENTERED_ASSUMPTION")).toBe(true);
    const same = composeDeliverableSource({
      plan,
      templateCode: "EAT-REPORT-DESIGN",
      templateVersion: "1.0.0",
      artifactType: "DESIGN_REPORT",
      snapshot: bound.current,
      generatedAt: composed.manifest.generatedAt,
    });
    expect(same.compositionFingerprint).toBe(composed.compositionFingerprint);
    const report = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id, artifactType: "DESIGN_REPORT" });
    expect(report.ok).toBe(true);
    if (!report.ok) return;
    expect(report.artifact.status).toBe("READY_FOR_ENGINEER_REVIEW");
    expect(report.artifact.provenance.engineeringApproved).toBe(false);
    expect(report.artifact.provenance.sourceManifest).toBeTruthy();
    expect(report.artifact.provenance.mtoRevision).toBe("A");
    const text = xmlText(Buffer.from(report.artifact.contentBase64, "base64"));
    expect(text).toContain("COST_NOT_CALCULATED");
    expect(text).toContain("CARBON_NOT_CALCULATED");
    expect(text).toContain("UNVERIFIED");
    expect(text).toContain("ENGINEER_ENTERED_ASSUMPTION");
    expect(text).not.toMatch(/the structure is adequate|the design complies|constructability is acceptable/i);
    expect(inspectDocx(Buffer.from(report.artifact.contentBase64, "base64")).hasDocumentXml).toBe(true);
  });

  it("binds MTO Rev A, marks the report stale when Rev B supersedes, and preserves the prior artifact", async () => {
    const { work, mto, artifactSvc, artifacts } = harness();
    const plan = await work.generatePlan(commerce(), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "DESIGN_CALCULATION",
      lifecycleStage: "FEED",
      discipline: "STRUCTURAL",
      systemId: A11A_SYSTEM_ID,
      snapshot: feedStructuralSnapshot(),
      readiness: WORKFLOW_READINESS.detailedReady,
      acknowledged: true,
    });
    const revA = await mto.createSnapshot(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: plan.id,
      revision: "A",
      items: crusherMtoRevAItems(),
    });
    const first = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id, artifactType: "DESIGN_REPORT" });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.artifact.provenance.mtoRevision).toBe("A");
    expect(first.thread.links.some((row: { relationship: string }) => row.relationship === "USED_BY" || row.relationship === "PRODUCED")).toBe(true);
    const revB = await mto.createRevision(commerce(), CRUSHER_FEED_TENANT, {
      snapshotId: revA.id,
      revision: "B",
      items: crusherMtoRevBItems(),
    });
    expect(revB.supersedesSnapshotId).toBe(revA.id);
    const boundB = await mto.loadCompositionContext(plan.id);
    const composedB = composeDeliverableSource({
      plan,
      templateCode: "EAT-REPORT-DESIGN",
      templateVersion: "1.0.0",
      artifactType: "DESIGN_REPORT",
      snapshot: boundB.current,
      previousSnapshot: boundB.previous,
    });
    expect(composedB.deltas.find((row) => row.itemCode === "ST-STEEL-UB")?.delta).toBeCloseTo(18.4, 1);
    expect(composedB.deltas.find((row) => row.itemCode === "ST-CONC-FDN")?.delta).toBeCloseTo(96, 0);
    expect(composedB.deltas.find((row) => row.itemCode === "ST-AB-M36")?.delta).toBeCloseTo(16, 0);
    const stale = artifactSvc.compareArtifact(first.artifact, plan.inputFingerprint, revB.snapshotFingerprint);
    expect(stale.stale).toBe(true);
    expect(stale.reason).toBe("MTO_SOURCE_CHANGED");
    expect(stale.regenerationRequired).toBe(true);
    const storedFirst = await artifacts.getArtifact(first.artifact.id);
    expect(storedFirst?.status).not.toBe("SUPERSEDED");
    const second = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id, artifactType: "DESIGN_REPORT" });
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.artifact.id).not.toBe(first.artifact.id);
    expect(second.artifact.provenance.mtoRevision).toBe("B");
    const after = await artifacts.getArtifact(first.artifact.id);
    expect(after?.status).toBe("SUPERSEDED");
    expect(after?.supersededById).toBe(second.artifact.id);
    expect(second.thread.links.some((row: { relationship: string }) => row.relationship === "SUPERSEDED_BY")).toBe(true);
    const text = xmlText(Buffer.from(second.artifact.contentBase64, "base64"));
    expect(second.artifact.provenance.sourceManifest).toBeTruthy();
    expect(text).toMatch(/Rev B|revision B|MTO Rev B/i);
    const steelDelta = second.artifact.provenance.mtoFingerprint !== first.artifact.provenance.mtoFingerprint;
    expect(steelDelta).toBe(true);
    const note = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id, artifactType: "TECHNICAL_MEMORANDUM" });
    expect(note.ok).toBe(true);
    if (!note.ok) return;
    expect(xmlText(Buffer.from(note.artifact.contentBase64, "base64"))).toContain("ENGINEER_CONCLUSION_REQUIRED");
    const xlsx = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id, artifactType: "QUANTITY_SCHEDULE" });
    expect(xlsx.ok).toBe(true);
    if (!xlsx.ok) return;
    const sheets = await inspectXlsx(Buffer.from(xlsx.artifact.contentBase64, "base64"));
    expect(sheets.sheets).toContain("01_Summary");
    expect(xlsx.artifact.provenance.mtoSnapshotId).toBe(revB.id);
  });

  it("keeps the same composition fingerprint for identical inputs and reports plan-only staleness", () => {
    const compared = compareDeliverableStaleness({
      artifactPlanFingerprint: "aaa",
      currentPlanFingerprint: "bbb",
    });
    expect(compared.stale).toBe(true);
    expect(compared.reason).toBe("STALE");
    expect(compareDeliverableStaleness({
      artifactPlanFingerprint: "aaa",
      currentPlanFingerprint: "aaa",
      artifactMtoFingerprint: "m1",
      currentMtoFingerprint: "m1",
    }).stale).toBe(false);
  });

  it("summarizes 100/1000/5000 MTO items in DOCX without embedding every row", async () => {
    const { work, mto, artifactSvc } = harness();
    const plan = await work.generatePlan(commerce(), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "DESIGN_CALCULATION",
      lifecycleStage: "FEED",
      discipline: "STRUCTURAL",
      systemId: A11A_SYSTEM_ID,
      snapshot: feedStructuralSnapshot(),
      readiness: WORKFLOW_READINESS.detailedReady,
      acknowledged: true,
    });
    const sample = crusherMtoRevAItems()[0]!;
    async function run(count: number) {
      const items: QuantityItem[] = Array.from({ length: count }, (_, index) => ({
        ...sample,
        id: `perf-${count}-${index}`,
        itemCode: `ST-STEEL-${index}`,
        basis: { ...sample.basis, id: `qb-${count}-${index}` },
      }));
      const existing = await mto.listSnapshots(commerce("analysis.read"), CRUSHER_FEED_TENANT, { projectId: plan.projectId, workPlanId: plan.id });
      const current = existing.find((row) => row.status !== "SUPERSEDED");
      if (current) {
        await mto.createRevision(commerce(), CRUSHER_FEED_TENANT, { snapshotId: current.id, revision: String(count), items });
      } else {
        await mto.createSnapshot(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id, revision: "A", items });
      }
      const started = Date.now();
      const generated = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id, artifactType: "DESIGN_REPORT" });
      const ms = Date.now() - started;
      expect(generated.ok).toBe(true);
      if (!generated.ok) return { ms, bytes: 0 };
      const buffer = Buffer.from(generated.artifact.contentBase64, "base64");
      const text = xmlText(buffer);
      expect(text).not.toContain("ST-STEEL-2500");
      expect((text.match(/ST-STEEL-/g) ?? []).length).toBeLessThan(30);
      expect(text).toContain("Engineering Quantities");
      return { ms, bytes: buffer.length };
    }
    const p100 = await run(100);
    const p1000 = await run(1000);
    const p5000 = await run(5000);
    expect(p100.ms).toBeLessThan(15_000);
    expect(p1000.ms).toBeLessThan(30_000);
    expect(p5000.ms).toBeLessThan(60_000);
    expect(p5000.bytes).toBeGreaterThan(4_000);
  }, 120_000);
});
