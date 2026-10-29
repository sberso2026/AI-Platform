import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { describe, expect, it } from "vitest";
import { generateEngineeringWorkPlan } from "../work-generator/generator";
import { templateFor } from "../work-generator/catalog";
import {
  A11A_SYSTEM_ID,
  conceptSnapshot,
  constructionSnapshot,
  CRUSHER_EXPANSION_FEED_PROJECT_ID,
  CRUSHER_FEED_TENANT,
  CRUSHER_FEED_WORKSPACE,
  detailedDesignReadySnapshot,
  feedStructuralSnapshot,
  optionStudySnapshot,
  WORKFLOW_READINESS,
} from "../work-generator/fixture";
import { createMemoryWorkPlanStore } from "../work-generator/memory-store";
import { ARTIFACT_AI_BOUNDARY, ARTIFACT_PRIVACY } from "./types";
import { findArtifactTemplate } from "./catalog";
import { escapeSpreadsheetText, isFormulaInjectionRisk, isGovernedFormula } from "./formulas";
import { generateEngineeringArtifact } from "./generator";
import { createMemoryArtifactStore } from "./memory-store";
import { createTestArtifactService } from "./service";
import { inspectDocx, inspectPptx, inspectXlsx } from "./validate";
import { readZip, writeZip } from "./zip";
import { ARTIFACT_DOCUMENT_BOUNDARY } from "./provenance";
import { defaultArtifactFileName } from "./filename";

function commerce(action: "analysis.read" | "analysis.write" = "analysis.write") {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

function planFor(
  workType: Parameters<typeof templateFor>[0],
  lifecycle: Parameters<typeof templateFor>[1],
  snapshot: ReturnType<typeof detailedDesignReadySnapshot>,
  readiness: (typeof WORKFLOW_READINESS)[keyof typeof WORKFLOW_READINESS],
) {
  return generateEngineeringWorkPlan({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    workType,
    template: templateFor(workType, lifecycle)!,
    snapshot,
    readiness,
    discipline: "STRUCTURAL",
    systemId: A11A_SYSTEM_ID,
    generatedBy: "cert-a11b",
  });
}

async function wiredService(plan = planFor("DESIGN_CALCULATION", "DETAILED_DESIGN", detailedDesignReadySnapshot(), WORKFLOW_READINESS.detailedReady)) {
  const plans = createMemoryWorkPlanStore();
  await plans.savePlan(plan);
  const events: string[] = [];
  const artifacts = createMemoryArtifactStore();
  const service = createTestArtifactService(artifacts, (id) => plans.getPlan(id), async (_c, _t, input) => {
    events.push(input.eventType);
  });
  return { service, plan, events, artifacts };
}

describe("EOS-A11B Engineering Artifact Automation", () => {
  it("generates a real XLSX foundation calculation workbook with governed formulas", async () => {
    const { service, plan, events } = await wiredService();
    const result = await service.generate(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: plan.id,
      artifactType: "CALCULATION_WORKBOOK",
      projectCode: "ER-A1",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.artifact.status).toBe("READY_FOR_ENGINEER_REVIEW");
    expect(result.artifact.provenance.engineeringApproved).toBe(false);
    expect(result.artifact.provenance.exampleOnly).toBe(true);
    expect(result.artifact.fileName).toMatch(/ER-A1_STRUCTURAL_CALCULATION_WORKBOOK_DRAFT\.xlsx$/);
    expect(result.deliverable.maturityChanged).toBe(false);
    expect(events).toEqual(["ARTIFACT_GENERATION_STARTED", "ARTIFACT_GENERATED"]);
    const stored = await service.get(commerce("analysis.read"), CRUSHER_FEED_TENANT, result.artifact.id);
    const buffer = Buffer.from(stored!.contentBase64, "base64");
    const inspected = await inspectXlsx(buffer);
    expect(inspected.sheets).toEqual(expect.arrayContaining(["Cover", "Inputs", "Calculations", "Results", "References", "Assumptions", "EOS Context", "Revision History"]));
    expect(inspected.formulas.some((row) => row.includes("B4/B5"))).toBe(true);
    const xml = readZip(buffer).map((row) => row.data.toString("utf8")).join("\n");
    expect(xml).toContain("kPa");
    expect(xml).toContain("EXAMPLE_ONLY");
    expect(xml).toContain("Geotechnical bearing capacity");
    expect(result.run.metrics.byteSize).toBeGreaterThan(1000);
  });

  it("blocks REQUIRE_READY calculation when governing information is missing", async () => {
    const blocked = planFor("DESIGN_CALCULATION", "FEED", feedStructuralSnapshot(), WORKFLOW_READINESS.feedBlocked);
    const { service } = await wiredService(blocked);
    const result = await service.generate(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: blocked.id,
      artifactType: "CALCULATION_WORKBOOK",
    });
    expect(result.ok).toBe(false);
    expect(result.run.status).toBe("GENERATION_BLOCKED");
    expect(result.run.explanation).toMatch(/required information/i);
    expect(result.artifact).toBeNull();
  });

  it("generates a conditional concept memorandum that exposes assumptions and gaps", async () => {
    const plan = planFor("CONCEPT_STUDY", "CONCEPT", conceptSnapshot(), WORKFLOW_READINESS.conceptUnknown);
    const { service } = await wiredService(plan);
    const result = await service.generate(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: plan.id,
      artifactType: "TECHNICAL_MEMORANDUM",
      projectCode: "ER-A1",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const stored = await service.get(commerce("analysis.read"), CRUSHER_FEED_TENANT, result.artifact.id);
    const xml = inspectDocx(Buffer.from(stored!.contentBase64, "base64")).xml;
    expect(xml).toContain("DRAFT FOR ENGINEER REVIEW");
    expect(xml).toContain("CONDITIONAL INPUTS PRESENT");
    expect(xml).toContain("Site access");
    expect(xml).toContain("Geotechnical parameters");
  });

  it("generates a design report DOCX without unsupported conclusions", async () => {
    const plan = planFor("DESIGN_CALCULATION", "DETAILED_DESIGN", detailedDesignReadySnapshot(), WORKFLOW_READINESS.detailedReady);
    const { service } = await wiredService(plan);
    const result = await service.generate(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: plan.id,
      artifactType: "DESIGN_REPORT",
      projectCode: "ER-A1",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const xml = inspectDocx(Buffer.from((await service.get(commerce("analysis.read"), CRUSHER_FEED_TENANT, result.artifact.id))!.contentBase64, "base64")).xml;
    expect(xml).toContain("Foundation capacity");
    expect(xml).toContain("Pad foundation selected");
    expect(xml).toContain("does not invent technical conclusions");
    expect(xml).not.toMatch(/ENGINEERING_APPROVED|IFC_APPROVED/);
  });

  it("generates a specification draft that leaves unsupported values unresolved", async () => {
    const plan = planFor("SPECIFICATION", "FEED", detailedDesignReadySnapshot(), WORKFLOW_READINESS.detailedReady);
    const { service } = await wiredService(plan);
    const result = await service.generate(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: plan.id,
      artifactType: "SPECIFICATION",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const xml = inspectDocx(Buffer.from((await service.get(commerce("analysis.read"), CRUSHER_FEED_TENANT, result.artifact.id))!.contentBase64, "base64")).xml;
    expect(xml).toContain("PLACEHOLDER / UNRESOLVED");
    expect(xml).not.toMatch(/Grade 350|AS 4100:2020 inspection every/);
  });

  it("generates option-study XLSX and PPTX without selecting a winner", async () => {
    const plan = planFor("OPTION_STUDY", "PREFEASIBILITY", optionStudySnapshot(), WORKFLOW_READINESS.optionUnknown);
    const { service } = await wiredService(plan);
    const xlsx = await service.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id, artifactType: "OPTION_STUDY", projectCode: "ER-A1" });
    const pptx = await service.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id, artifactType: "OPTION_STUDY_PRESENTATION", projectCode: "ER-A1" });
    expect(xlsx.ok && pptx.ok).toBe(true);
    if (!xlsx.ok || !pptx.ok) return;
    const book = await inspectXlsx(Buffer.from((await service.get(commerce("analysis.read"), CRUSHER_FEED_TENANT, xlsx.artifact.id))!.contentBase64, "base64"));
    expect(book.sheets).toEqual(expect.arrayContaining(["Options", "Criteria", "Comparison"]));
    const slides = inspectPptx(Buffer.from((await service.get(commerce("analysis.read"), CRUSHER_FEED_TENANT, pptx.artifact.id))!.contentBase64, "base64"));
    expect(slides.slideCount).toBeGreaterThanOrEqual(11);
    expect(slides.text).toContain("No automatic winner");
    expect(slides.text).not.toMatch(/recommended option is Option A/i);
  });

  it("generates RFI and TQ drafts that remain unissued", async () => {
    const plan = generateEngineeringWorkPlan({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "RFI_TQ_RESPONSE",
      template: templateFor("RFI_TQ_RESPONSE", "CONSTRUCTION")!,
      snapshot: constructionSnapshot(),
      readiness: WORKFLOW_READINESS.constructionReady,
      relatedObjectType: "rfi",
      relatedObjectId: "Anchor bolt location clash",
      discipline: "STRUCTURAL",
      generatedBy: "cert-a11b",
    });
    const { service } = await wiredService(plan);
    const rfi = await service.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id, artifactType: "RFI_RESPONSE" });
    const tq = await service.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id, artifactType: "TQ_RESPONSE" });
    expect(rfi.ok && tq.ok).toBe(true);
    if (!rfi.ok || !tq.ok) return;
    const xml = inspectDocx(Buffer.from((await service.get(commerce("analysis.read"), CRUSHER_FEED_TENANT, rfi.artifact.id))!.contentBase64, "base64")).xml;
    expect(xml).toContain("Anchor bolt location clash");
    expect(xml).toContain("DRAFT FOR ENGINEER REVIEW");
    expect(xml).toContain("not issued");
  });

  it("regenerates after source authority change without overwriting the prior artifact", async () => {
    const firstPlan = planFor("DESIGN_CALCULATION", "DETAILED_DESIGN", detailedDesignReadySnapshot(), WORKFLOW_READINESS.detailedReady);
    const { service, artifacts } = await wiredService(firstPlan);
    const first = await service.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: firstPlan.id, artifactType: "CALCULATION_WORKBOOK" });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const nextSnapshot = detailedDesignReadySnapshot();
    nextSnapshot.information = nextSnapshot.information.map((row) =>
      row.sourceObjectId === "ds-str-criteria-b" ? { ...row, revision: "B-updated", title: "Structural design criteria Rev B" } : row,
    );
    const nextPlan = generateEngineeringWorkPlan({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "DESIGN_CALCULATION",
      template: templateFor("DESIGN_CALCULATION", "DETAILED_DESIGN")!,
      snapshot: nextSnapshot,
      readiness: WORKFLOW_READINESS.detailedReady,
      discipline: "STRUCTURAL",
      systemId: A11A_SYSTEM_ID,
      generatedBy: "cert-a11b",
      supersedesPlanId: firstPlan.id,
    });
    const plans = createMemoryWorkPlanStore();
    await plans.savePlan({ ...firstPlan, status: "SUPERSEDED", staleness: "STALE" });
    await plans.savePlan(nextPlan);
    const regenService = createTestArtifactService(artifacts, (id) => plans.getPlan(id));
    const second = await regenService.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: nextPlan.id, artifactType: "CALCULATION_WORKBOOK" });
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.artifact.provenance.inputFingerprint).not.toBe(first.artifact.provenance.inputFingerprint);
    expect(second.artifact.id).not.toBe(first.artifact.id);
    const old = await artifacts.getArtifact(first.artifact.id);
    expect(old?.status === "READY_FOR_ENGINEER_REVIEW" || old?.status === "SUPERSEDED").toBe(true);
    expect(service.compareContext(first.artifact.provenance.inputFingerprint, nextPlan.inputFingerprint).stale).toBe(true);
  });

  it("escapes untrusted formula injection and rejects ungoverned formulas", async () => {
    expect(isFormulaInjectionRisk("=1+1")).toBe(true);
    expect(escapeSpreadsheetText("=1+1")).toBe("'=1+1");
    expect(escapeSpreadsheetText("+cmd")).toBe("'+cmd");
    expect(escapeSpreadsheetText("@SUM")).toBe("'@SUM");
    expect(isGovernedFormula("B4/B5")).toBe(true);
    expect(isGovernedFormula("=HYPERLINK(\"http://evil\")")).toBe(false);
    const snapshot = detailedDesignReadySnapshot();
    snapshot.assumptions = [{ objectType: "assumption", objectId: "evil", title: "=1+1", whyIncluded: "Injection probe" }];
    const plan = planFor("DESIGN_CALCULATION", "DETAILED_DESIGN", snapshot, WORKFLOW_READINESS.detailedReady);
    const result = await generateEngineeringArtifact({
      plan,
      template: findArtifactTemplate("EAT-CALC-EXAMPLE-BEARING")!,
      projectCode: "ER-A1",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const raw = readZip(Buffer.from(result.artifact.contentBase64, "base64")).map((row) => row.data.toString("utf8")).join("\n");
    expect(raw).toMatch(/=1\+1/);
    expect(raw).not.toMatch(/<f[^>]*>\s*=?1\+1/);
    const inspected = await inspectXlsx(Buffer.from(result.artifact.contentBase64, "base64"));
    expect(inspected.formulas.every((row) => !row.includes("1+1"))).toBe(true);
  });

  it("rejects zip path traversal and records document/privacy boundaries", () => {
    expect(() => writeZip([{ name: "../secret.txt", data: Buffer.from("x") }])).toThrow("zip_path_traversal");
    expect(ARTIFACT_PRIVACY.macrosCreated).toBe(false);
    expect(ARTIFACT_PRIVACY.newDmsCreated).toBe(false);
    expect(ARTIFACT_PRIVACY.downloadAutoReingest).toBe(false);
    expect(ARTIFACT_AI_BOUNDARY.mayInventFormulas).toBe(false);
    expect(ARTIFACT_AI_BOUNDARY.maySelectOptionStudyWinner).toBe(false);
    expect(ARTIFACT_DOCUMENT_BOUNDARY.generationCreatesCanonicalDocument).toBe(false);
    expect(defaultArtifactFileName({ projectCode: "ER-A1", discipline: "STR", title: "Foundation Calculation", format: "XLSX" })).toBe("ER-A1_STR_Foundation_Calculation_DRAFT.xlsx");
    expect(serviceScopeDenied());
  });
});

function serviceScopeDenied() {
  expect(ARTIFACT_PRIVACY.localRecursiveScan).toBe("PROHIBITED");
  return true;
}
