import ExcelJS from "exceljs";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { describe, expect, it } from "vitest";
import { generateEngineeringWorkPlan } from "../work-generator/generator";
import { templateFor } from "../work-generator/catalog";
import {
  A11A_SYSTEM_ID,
  CRUSHER_EXPANSION_FEED_PROJECT_ID,
  CRUSHER_FEED_TENANT,
  CRUSHER_FEED_WORKSPACE,
  constructionSnapshot,
  detailedDesignReadySnapshot,
  optionStudySnapshot,
  WORKFLOW_READINESS,
} from "../work-generator/fixture";
import { createMemoryWorkPlanStore } from "../work-generator/memory-store";
import { createMemoryArtifactStore } from "../artifact-automation/memory-store";
import { createTestArtifactService } from "../artifact-automation/service";
import { createTestOrchestrationService } from "../tool-orchestration/service";
import { PRE_ISSUE_AI_BOUNDARY, PRE_ISSUE_PRIVACY, PRE_ISSUE_REVIEW_RECON } from "./types";
import { PRE_ISSUE_REVIEW_POLICY } from "./policy";
import { createTestPreIssueService } from "./service";
import type { EngineeringWorkPlan } from "../work-generator/types";
import type { GeneratorWorkType } from "../work-generator/types";
import type { LifecycleStage } from "../lifecycle-intelligence/types";
import type { WorkPlanContextSnapshot } from "../work-generator/types";
import type { WorkReadinessResolution } from "../information-requirements/readiness";

function commerce(action: "analysis.read" | "analysis.write" = "analysis.write") {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

const OTHER_PROJECT = "project-beta-ui-view";

async function desk(
  workType: GeneratorWorkType = "DESIGN_CALCULATION",
  lifecycle: LifecycleStage = "DETAILED_DESIGN",
  snapshot: WorkPlanContextSnapshot = detailedDesignReadySnapshot(),
  readiness: WorkReadinessResolution = WORKFLOW_READINESS.detailedReady,
) {
  const plan = generateEngineeringWorkPlan({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    workType,
    template: templateFor(workType, lifecycle)!,
    snapshot,
    readiness,
    discipline: "STRUCTURAL",
    systemId: A11A_SYSTEM_ID,
    generatedBy: "cert-a11d",
  });
  const plans = createMemoryWorkPlanStore();
  await plans.savePlan(plan);
  const artifacts = createMemoryArtifactStore();
  const events: string[] = [];
  const artifactSvc = createTestArtifactService(artifacts, (id) => plans.getPlan(id));
  const orch = createTestOrchestrationService({ artifacts, loadPlan: (id) => plans.getPlan(id) });
  const review = createTestPreIssueService({
    artifacts,
    loadPlan: (id) => plans.getPlan(id),
    recorder: async (_c, _t, input) => {
      events.push(input.eventType);
    },
  });
  return { plan, plans, orch, artifactSvc, artifacts, review, events };
}

async function generate(
  plan: EngineeringWorkPlan,
  artifactSvc: ReturnType<typeof createTestArtifactService>,
  artifacts: ReturnType<typeof createMemoryArtifactStore>,
  artifactType: "CALCULATION_WORKBOOK" | "DESIGN_REPORT" | "OPTION_STUDY_PRESENTATION" | "RFI_RESPONSE" | "SPECIFICATION",
) {
  const generated = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, {
    workPlanId: plan.id,
    artifactType,
    projectCode: "ER-A1",
  });
  if (!generated.ok) throw new Error(`generate failed: ${JSON.stringify(generated)}`);
  const stored = await artifacts.getArtifact(generated.artifact.id);
  if (!stored) throw new Error("artifact missing from store");
  return stored;
}

describe("EOS-A11D Automated Pre-Issue Engineering Review", () => {
  it("reuses Engineering Review domain and never auto-approves", async () => {
    const { review } = await desk();
    const catalog = review.catalog();
    expect(catalog.recon.engineeringReviewPackage).toBe("REUSE");
    expect(catalog.recon.duplicateReviewEngine).toBe("NO");
    expect(catalog.duplicateReviewEngineCreated).toBe(false);
    expect(catalog.binaryDuplication).toBe("NO");
    expect(catalog.artifactBinaryStorageRisk).toBe("HIGH");
    expect(catalog.policy.version).toBe(PRE_ISSUE_REVIEW_POLICY.version);
    expect(catalog.aiBoundary.mayApproveDesign).toBe(false);
    expect(PRE_ISSUE_AI_BOUNDARY.mayCreateFormalFindingAutomatically).toBe(false);
    expect(PRE_ISSUE_PRIVACY.newReviewEngineCreated).toBe(false);
    expect(PRE_ISSUE_REVIEW_RECON.cadSemanticReview).toBe("CONTRACT_ONLY");
    expect(catalog.forbiddenVerdicts).toEqual(expect.arrayContaining(["DESIGN_APPROVED", "IFC_READY"]));
  });

  it("detects STALE_SOURCE_REFERENCE against A10A authority without declaring the calculation wrong", async () => {
    const { plan, plans, artifactSvc, artifacts, review } = await desk();
    const artifact = await generate(plan, artifactSvc, artifacts, "CALCULATION_WORKBOOK");
    const mechanical = plan.context.information.find((row) => /mechanical/i.test(row.title));
    expect(mechanical).toBeTruthy();
    mechanical!.revision = "B";
    mechanical!.authorityOutcome = "AUTHORITATIVE_FOR_PURPOSE";
    mechanical!.freshness = "CURRENT";
    artifact.provenance.information = artifact.provenance.information.map((row) =>
      /mechanical/i.test(row.title) ? { ...row, revision: "A" } : row,
    );
    await artifacts.saveArtifact(artifact);
    await plans.savePlan(plan);
    const result = await review.run(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: plan.id,
      selectedProjectId: OTHER_PROJECT,
    });
    expect(result.review.targetArtifactId).toBe(artifact.id);
    expect(result.review.projectId).toBe(CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(result.view.mismatch).toBe(true);
    expect(result.view.rewriteMembership).toBe(false);
    const stale = result.review.conditions.find((row) => row.code === "STALE_SOURCE_REFERENCE");
    expect(stale).toBeTruthy();
    expect(stale?.explanation).toMatch(/Rev A/);
    expect(stale?.explanation).toMatch(/Rev B/);
    expect(stale?.explanation).not.toMatch(/\bwrong\b|\bunsafe\b/i);
    expect(stale?.status).toBe("candidate");
    expect(stale?.engineeringVerdict).toBeNull();
    expect(result.findings.every((row) => row.status === "candidate")).toBe(true);
    expect(result.review.automaticFindings).toBe(false);
    expect(result.review.engineeringApproved).toBe(false);
    expect(result.review.binaryDuplication).toBe("NO");
    expect(result.review.deterministicReview).toBe("available");
  });

  it("detects GOVERNED_FORMULA_CHANGED on the returned workbook, not the obsolete draft", async () => {
    const { plan, artifactSvc, artifacts, orch, review } = await desk();
    const origin = await generate(plan, artifactSvc, artifacts, "CALCULATION_WORKBOOK");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(Uint8Array.from(Buffer.from(origin.contentBase64, "base64")) as unknown as ExcelJS.Buffer);
    wb.getWorksheet("Calculations")!.getCell("B6").value = { formula: "B4+B5" };
    const edited = Buffer.from(await wb.xlsx.writeBuffer());
    const published = await orch.publishUpdatedArtifact(commerce(), CRUSHER_FEED_TENANT, {
      originArtifactId: origin.id,
      fileName: origin.fileName,
      contentBase64: edited.toString("base64"),
      selectedProjectId: OTHER_PROJECT,
      controlledFixture: true,
    });
    const result = await review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id });
    expect(result.review.targetArtifactId).toBe(published.returned.id);
    expect(result.review.targetArtifactId).not.toBe(origin.id);
    expect(result.review.targetLineageKind).toBe("RETURNED_FROM_ENGINEER");
    expect(result.review.reviewingGeneratedDraft).toBe(false);
    const changed = result.review.conditions.find((row) => row.code === "GOVERNED_FORMULA_CHANGED");
    expect(changed).toBeTruthy();
    expect(changed?.evidence[0]?.statement).toMatch(/B4\/B5/);
    expect(changed?.evidence[0]?.statement).toMatch(/B4\+B5/);
    expect(changed?.explanation).not.toMatch(/incorrect design/i);
    const still = await artifacts.getArtifact(origin.id);
    expect(still?.sha256).toBe(origin.sha256);
  });

  it("detects missing A10C geotechnical evidence", async () => {
    const { plan, plans, artifactSvc, artifacts, review } = await desk();
    const target = await generate(plan, artifactSvc, artifacts, "CALCULATION_WORKBOOK");
    plan.context.information = plan.context.information.filter((row) => !/geotech/i.test(row.title));
    plan.context.gaps = [{ kind: "missing", title: "Geotechnical bearing capacity", explanation: "Required geotechnical input is not accepted." }];
    target.provenance.information = target.provenance.information.filter((row) => !/geotech/i.test(row.title));
    await artifacts.saveArtifact(target);
    await plans.savePlan(plan);
    const result = await review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id });
    expect(result.review.conditions.some((row) => row.code === "REQUIRED_INFORMATION_EVIDENCE_MISSING")).toBe(true);
  });

  it("detects cross-artifact drawing revision inconsistency", async () => {
    const { plan, artifactSvc, artifacts, review } = await desk();
    const calc = await generate(plan, artifactSvc, artifacts, "CALCULATION_WORKBOOK");
    const report = await generate(plan, artifactSvc, artifacts, "DESIGN_REPORT");
    calc.provenance.information.push({ title: "Drawing S-104", revision: "B", purpose: "FOR_DESIGN_INPUT" });
    report.provenance.information.push({ title: "Drawing S-104", revision: "C", purpose: "FOR_DESIGN_INPUT" });
    plan.context.information.push({
      informationType: "DRAWING",
      title: "Drawing S-104",
      purpose: "FOR_DESIGN_INPUT",
      revision: "C",
      freshness: "CURRENT",
      authorityOutcome: "AUTHORITATIVE_FOR_PURPOSE",
      whyIncluded: "Current governed drawing.",
    });
    await artifacts.saveArtifact(calc);
    await artifacts.saveArtifact(report);
    const result = await review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id });
    expect(result.review.conditions.some((row) => row.code === "CROSS_ARTIFACT_REVISION_INCONSISTENCY")).toBe(true);
  });

  it("surfaces UNSUPPORTED_ASSUMPTION as a candidate, not a formal Finding promotion", async () => {
    const snapshot = detailedDesignReadySnapshot();
    snapshot.assumptions = [{
      objectType: "assumption",
      objectId: "asm-unsupported-geo",
      title: "Allowable bearing 250 kPa",
      whyIncluded: "unsupported pending evidence; without evidence",
      stale: true,
    }];
    const { plan, artifactSvc, artifacts, review } = await desk("DESIGN_CALCULATION", "DETAILED_DESIGN", snapshot, WORKFLOW_READINESS.detailedReady);
    await generate(plan, artifactSvc, artifacts, "CALCULATION_WORKBOOK");
    const result = await review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id });
    const assumption = result.review.conditions.find((row) => row.code === "UNSUPPORTED_ASSUMPTION");
    expect(assumption).toBeTruthy();
    expect(assumption?.status).toBe("candidate");
    expect(result.findings.every((row) => row.status === "candidate")).toBe(true);
  });

  it("detects STALE_ANALYSIS_REFERENCE with Digital Thread evidence", async () => {
    const { plan, plans, artifactSvc, artifacts, review } = await desk();
    await generate(plan, artifactSvc, artifacts, "CALCULATION_WORKBOOK");
    plan.context.analyses = [{
      objectType: "analysis_result",
      objectId: "anl-struct-feed",
      title: "FEED structural analysis",
      whyIncluded: "Referenced analysis became stale after configuration change.",
      stale: true,
    }];
    await plans.savePlan(plan);
    const result = await review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id });
    const stale = result.review.conditions.find((row) => row.code === "STALE_ANALYSIS_REFERENCE");
    expect(stale).toBeTruthy();
    expect(result.thread.links.some((row) => row.relationship === "REVIEWS")).toBe(true);
  });

  it("reviews RFI/TQ drafts without marking correspondence issued", async () => {
    const { plan, artifactSvc, artifacts, review } = await desk("RFI_TQ_RESPONSE", "CONSTRUCTION", constructionSnapshot(), WORKFLOW_READINESS.constructionReady);
    await generate(plan, artifactSvc, artifacts, "RFI_RESPONSE");
    const result = await review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id });
    expect(result.review.engineeringApproved).toBe(false);
    expect(JSON.stringify(result.review)).not.toMatch(/correspondence issued|RFI answered/i);
    expect(result.review.passedChecks.some((row) => row.checkType === "RFI_TQ_CHECK") || result.review.conditions.some((row) => row.checkType === "RFI_TQ_CHECK")).toBe(true);
  });

  it("keeps historical runs when rerunning after context fix", async () => {
    const { plan, plans, artifactSvc, artifacts, review, events } = await desk();
    await generate(plan, artifactSvc, artifacts, "CALCULATION_WORKBOOK");
    const mechanical = plan.context.information.find((row) => /mechanical/i.test(row.title))!;
    const original = mechanical.revision;
    mechanical.revision = "B";
    await plans.savePlan(plan);
    const first = await review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id });
    expect(first.review.conditions.some((row) => row.code === "STALE_SOURCE_REFERENCE")).toBe(true);
    mechanical.revision = original ?? "1";
    await plans.savePlan(plan);
    const second = await review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id });
    expect(second.review.id).not.toBe(first.review.id);
    expect(second.review.reviewRunId).not.toBe(first.review.reviewRunId);
    expect(second.comparison?.previousReviewId).toBe(first.review.id);
    expect(first.review.resultState).not.toBe("NO_BLOCKING_CONDITIONS_IDENTIFIED");
    const latest = await review.latest(commerce("analysis.read"), CRUSHER_FEED_TENANT, plan.id);
    expect(latest.history.map((row) => row.id)).toEqual(expect.arrayContaining([first.review.id, second.review.id]));
    expect(events).toEqual(expect.arrayContaining(["PRE_ISSUE_REVIEW_STARTED", "PRE_ISSUE_REVIEW_COMPLETED", "PRE_ISSUE_REVIEW_RERUN"]));
  });

  it("still completes deterministic review when semantic AI is unavailable", async () => {
    const { plan, artifactSvc, artifacts, review } = await desk("OPTION_STUDY", "PREFEASIBILITY", optionStudySnapshot(), WORKFLOW_READINESS.optionUnknown);
    await generate(plan, artifactSvc, artifacts, "OPTION_STUDY_PRESENTATION");
    const result = await review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id });
    expect(result.review.deterministicReview).toBe("available");
    expect(result.review.semanticAiReview).toBe("unavailable");
    expect(result.review.passedChecks.some((row) => row.checkType === "PPTX_CONTEXT_CHECK")).toBe(true);
  });
});
