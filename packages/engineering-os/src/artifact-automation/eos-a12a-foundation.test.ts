import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { describe, expect, it } from "vitest";
import { generateEngineeringWorkPlan } from "../work-generator/generator";
import { templateFor } from "../work-generator/catalog";
import {
  A11A_SYSTEM_ID,
  constructionSnapshot,
  CRUSHER_EXPANSION_FEED_PROJECT_ID,
  CRUSHER_FEED_TENANT,
  CRUSHER_FEED_WORKSPACE,
  detailedDesignReadySnapshot,
  handoverSnapshot,
  optionStudySnapshot,
  WORKFLOW_READINESS,
} from "../work-generator/fixture";
import { createMemoryWorkPlanStore } from "../work-generator/memory-store";
import { createMemoryArtifactStore } from "./memory-store";
import { createTestArtifactService } from "./service";
import { fallbackRecord, policyRecord, createMemoryTemplatePolicyStore } from "./memory-template-store";
import { inspectDocx, inspectPptx, inspectXlsx } from "./validate";
import { readZip } from "./zip";
import { workbenchActionsForLifecycle, WORKBENCH_AI_BOUNDARY, WORKBENCH_DEEP_MODULES } from "../workbench/lifecycle-actions";

const PROJECT_BETA = "project-beta-sme";

function commerce(action: "analysis.read" | "analysis.write" | "settings.write" = "analysis.write") {
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
  projectId = CRUSHER_EXPANSION_FEED_PROJECT_ID,
) {
  return generateEngineeringWorkPlan({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    projectId,
    workType,
    template: templateFor(workType, lifecycle)!,
    snapshot,
    readiness,
    discipline: "STRUCTURAL",
    systemId: A11A_SYSTEM_ID,
    generatedBy: "cert-a12a",
  });
}

async function wired(plan = planFor("DESIGN_CALCULATION", "DETAILED_DESIGN", detailedDesignReadySnapshot(), WORKFLOW_READINESS.detailedReady)) {
  const plans = createMemoryWorkPlanStore();
  await plans.savePlan(plan);
  const policies = createMemoryTemplatePolicyStore();
  const artifacts = createMemoryArtifactStore();
  const service = createTestArtifactService(artifacts, (id) => plans.getPlan(id), undefined, policies);
  return { service, plan, policies, artifacts, plans };
}

describe("EOS-A12A artifact template governance", () => {
  it("uses EOS default when no company or project template is configured", async () => {
    const { service, plan } = await wired();
    const result = await service.generate(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: plan.id,
      artifactType: "CALCULATION_WORKBOOK",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.resolution.sourceClass).toBe("EOS_DEFAULT");
    expect(result.resolution.fallbackUsed).toBe(true);
    expect(result.artifact.provenance.templateSourceClass).toBe("EOS_DEFAULT");
    expect(result.artifact.provenance.exampleOnly).toBe(true);
    expect(result.artifact.provenance.calculationDefinitionCertification).toBe("EXAMPLE_ONLY");
  });

  it("selects project/client approved over company official, and company official for a sibling project", async () => {
    const alpha = planFor("DESIGN_REPORT", "FEED", detailedDesignReadySnapshot(), WORKFLOW_READINESS.detailedReady, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    const beta = planFor("DESIGN_REPORT", "FEED", detailedDesignReadySnapshot(), WORKFLOW_READINESS.detailedReady, PROJECT_BETA);
    const { service, policies, plans } = await wired(alpha);
    await plans.savePlan(beta);
    await policies.savePolicy(
      policyRecord({
        tenantId: CRUSHER_FEED_TENANT,
        workspaceId: CRUSHER_FEED_WORKSPACE,
        artifactType: "DESIGN_REPORT",
        templateCode: "ABC-ENG-REPORT",
        templateVersion: "6.0.0",
        name: "ABC Engineering Design Report",
        sourceClass: "COMPANY_OFFICIAL",
        packagedAssetKey: "EAT-REPORT-DESIGN",
        branding: { companyName: "ABC Engineering" },
      }),
    );
    await policies.savePolicy(
      policyRecord({
        tenantId: CRUSHER_FEED_TENANT,
        workspaceId: CRUSHER_FEED_WORKSPACE,
        projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
        artifactType: "DESIGN_REPORT",
        templateCode: "ALPHA-CLIENT-REPORT",
        templateVersion: "2.0.0",
        name: "Project Alpha Client Design Report",
        sourceClass: "PROJECT_CLIENT_APPROVED",
        packagedAssetKey: "EAT-REPORT-DESIGN",
        branding: { companyName: "Alpha Client Format" },
      }),
    );
    const alphaGen = await service.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: alpha.id, artifactType: "DESIGN_REPORT" });
    expect(alphaGen.ok).toBe(true);
    if (!alphaGen.ok) return;
    expect(alphaGen.resolution.sourceClass).toBe("PROJECT_CLIENT_APPROVED");
    expect(alphaGen.artifact.templateCode).toBe("ALPHA-CLIENT-REPORT");
    expect(alphaGen.artifact.templateVersion).toBe("2.0.0");
    const xml = inspectDocx(Buffer.from((await service.get(commerce("analysis.read"), CRUSHER_FEED_TENANT, alphaGen.artifact.id))!.contentBase64, "base64")).xml;
    expect(xml).toContain("Alpha Client Format");
    expect(xml).not.toContain("RTB Engineering OS");

    const betaGen = await service.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: beta.id, artifactType: "DESIGN_REPORT" });
    expect(betaGen.ok).toBe(true);
    if (!betaGen.ok) return;
    expect(betaGen.resolution.sourceClass).toBe("COMPANY_OFFICIAL");
    expect(betaGen.artifact.templateCode).toBe("ABC-ENG-REPORT");
    expect(betaGen.artifact.provenance.templateFallbackUsed).toBe(false);
  });

  it("fails closed when an official template is configured but cannot be loaded", async () => {
    const { service, plan, policies } = await wired();
    await policies.savePolicy(
      policyRecord({
        tenantId: CRUSHER_FEED_TENANT,
        workspaceId: CRUSHER_FEED_WORKSPACE,
        artifactType: "CALCULATION_WORKBOOK",
        templateCode: "ABC-STR-CALC",
        templateVersion: "7.0.0",
        name: "ABC Structural Calculation",
        sourceClass: "COMPANY_OFFICIAL",
        packagedAssetKey: "EAT-OFFICIAL-MISSING",
      }),
    );
    await policies.saveFallback(fallbackRecord(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, "OFFICIAL_TEMPLATE_REQUIRED"));
    const result = await service.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id, artifactType: "CALCULATION_WORKBOOK" });
    expect(result.ok).toBe(false);
    expect(result.run.status).toBe("GENERATION_BLOCKED");
    expect(result.resolution.state).toBe("TEMPLATE_UNAVAILABLE");
    expect(result.run.explanation).toMatch(/CONFIGURED_TEMPLATE_UNAVAILABLE/);
    expect(result.artifact).toBeNull();
  });

  it("fails closed on equal-precedence template conflict", async () => {
    const { service, plan, policies } = await wired();
    const base = {
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      artifactType: "DESIGN_REPORT" as const,
      sourceClass: "COMPANY_OFFICIAL" as const,
      packagedAssetKey: "EAT-REPORT-DESIGN",
    };
    await policies.savePolicy(policyRecord({ ...base, templateCode: "ABC-REPORT-A", name: "Official A" }));
    await policies.savePolicy(policyRecord({ ...base, templateCode: "ABC-REPORT-B", name: "Official B" }));
    const reportPlan = planFor("DESIGN_REPORT", "FEED", detailedDesignReadySnapshot(), WORKFLOW_READINESS.detailedReady);
    const { service: svc2, policies: pol2, plans } = await wired(reportPlan);
    await pol2.savePolicy(policyRecord({ ...base, templateCode: "ABC-REPORT-A", name: "Official A" }));
    await pol2.savePolicy(policyRecord({ ...base, templateCode: "ABC-REPORT-B", name: "Official B" }));
    void service;
    void plans;
    const result = await svc2.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: reportPlan.id, artifactType: "DESIGN_REPORT" });
    expect(result.ok).toBe(false);
    expect(result.resolution.state).toBe("TEMPLATE_RESOLUTION_CONFLICT");
    expect(result.resolution.conflict).toBe(true);
  });

  it("composes company calculation shell with EXAMPLE_ONLY formula definition", async () => {
    const { service, plan, policies } = await wired();
    await policies.savePolicy(
      policyRecord({
        tenantId: CRUSHER_FEED_TENANT,
        workspaceId: CRUSHER_FEED_WORKSPACE,
        artifactType: "CALCULATION_WORKBOOK",
        templateCode: "ABC-STR-CALC",
        templateVersion: "7.0.0",
        name: "ABC Structural Calculation Shell",
        sourceClass: "COMPANY_OFFICIAL",
        packagedAssetKey: "EAT-CALC-EXAMPLE-BEARING",
        presentationKind: "SHELL",
        branding: { companyName: "ABC Engineering", address: "1 Harbour St" },
      }),
    );
    const result = await service.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id, artifactType: "CALCULATION_WORKBOOK" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.resolution.sourceClass).toBe("COMPANY_OFFICIAL");
    expect(result.artifact.provenance.templateSourceClass).toBe("COMPANY_OFFICIAL");
    expect(result.artifact.provenance.calculationDefinitionCode).toBe("EAT-CALC-EXAMPLE-BEARING");
    expect(result.artifact.provenance.calculationDefinitionCertification).toBe("EXAMPLE_ONLY");
    expect(result.artifact.provenance.exampleOnly).toBe(true);
    const stored = await service.get(commerce("analysis.read"), CRUSHER_FEED_TENANT, result.artifact.id);
    const buffer = Buffer.from(stored!.contentBase64, "base64");
    const inspected = await inspectXlsx(buffer);
    expect(inspected.formulas.some((row) => row.includes("B4/B5"))).toBe(true);
    expect(inspected.sheets).toEqual(expect.arrayContaining(["Cover", "Calculations"]));
    const xml = readZip(buffer).map((row) => row.data.toString("utf8")).join("\n");
    expect(xml).toContain("ABC Engineering");
    expect(xml).toContain("EXAMPLE_ONLY");
    expect(xml).not.toContain("RTB Engineering OS");
  });

  it("resolves A11E impact, option study, RFI and handover artifacts through the same resolver", async () => {
    const impactPlan = planFor("CHANGE_ASSESSMENT", "CONSTRUCTION", constructionSnapshot(), WORKFLOW_READINESS.constructionReady);
    const optionPlan = planFor("OPTION_STUDY", "PREFEASIBILITY", optionStudySnapshot(), WORKFLOW_READINESS.optionUnknown);
    const rfiPlan = planFor("RFI_TQ_RESPONSE", "CONSTRUCTION", constructionSnapshot(), WORKFLOW_READINESS.constructionReady);
    const hoPlan = planFor("HANDOVER_PREPARATION", "COMMISSIONING", handoverSnapshot(), WORKFLOW_READINESS.handoverBlocked);
    const { service, plans } = await wired(impactPlan);
    await plans.savePlan(optionPlan);
    await plans.savePlan(rfiPlan);
    await plans.savePlan(hoPlan);
    const impact = await service.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: impactPlan.id, artifactType: "TECHNICAL_MEMORANDUM" });
    const option = await service.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: optionPlan.id, artifactType: "OPTION_STUDY_PRESENTATION" });
    const rfi = await service.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: rfiPlan.id, artifactType: "RFI_RESPONSE" });
    const ho = await service.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: hoPlan.id, artifactType: "TECHNICAL_MEMORANDUM" });
    expect(impact.ok && option.ok && rfi.ok && ho.ok).toBe(true);
    if (!impact.ok || !option.ok || !rfi.ok || !ho.ok) return;
    expect(impact.resolution.sourceClass).toBe("EOS_DEFAULT");
    expect(impact.artifact.templateCode).toBe("EAT-IMPACT-REPORT");
    expect(option.artifact.templateCode).toBe("EAT-OPTION-PPT");
    expect(rfi.artifact.templateCode).toBe("EAT-RFI-DRAFT");
    expect(ho.artifact.templateCode).toBe("EAT-HANDOVER-REPORT");
    const ppt = inspectPptx(Buffer.from((await service.get(commerce("analysis.read"), CRUSHER_FEED_TENANT, option.artifact.id))!.contentBase64, "base64"));
    expect(ppt.slideCount).toBeGreaterThan(3);
  });

  it("keeps template versions immutable in provenance after a later official version is registered", async () => {
    const { service, plan, policies } = await wired();
    await policies.savePolicy(
      policyRecord({
        id: "official-report-v6",
        tenantId: CRUSHER_FEED_TENANT,
        workspaceId: CRUSHER_FEED_WORKSPACE,
        artifactType: "DESIGN_REPORT",
        templateCode: "ABC-ENG-REPORT",
        templateVersion: "6.0.0",
        name: "ABC Engineering Design Report v6",
        sourceClass: "COMPANY_OFFICIAL",
        packagedAssetKey: "EAT-REPORT-DESIGN",
      }),
    );
    const reportPlan = planFor("DESIGN_REPORT", "FEED", detailedDesignReadySnapshot(), WORKFLOW_READINESS.detailedReady);
    const { service: svc, policies: pol, plans } = await wired(reportPlan);
    await pol.savePolicy(
      policyRecord({
        id: "official-report-v6",
        tenantId: CRUSHER_FEED_TENANT,
        workspaceId: CRUSHER_FEED_WORKSPACE,
        artifactType: "DESIGN_REPORT",
        templateCode: "ABC-ENG-REPORT",
        templateVersion: "6.0.0",
        name: "ABC Engineering Design Report v6",
        sourceClass: "COMPANY_OFFICIAL",
        packagedAssetKey: "EAT-REPORT-DESIGN",
      }),
    );
    const first = await svc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: reportPlan.id, artifactType: "DESIGN_REPORT" });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    await pol.savePolicy(
      policyRecord({
        id: "official-report-v6",
        tenantId: CRUSHER_FEED_TENANT,
        workspaceId: CRUSHER_FEED_WORKSPACE,
        artifactType: "DESIGN_REPORT",
        templateCode: "ABC-ENG-REPORT",
        templateVersion: "8.0.0",
        name: "ABC Engineering Design Report v8",
        sourceClass: "COMPANY_OFFICIAL",
        packagedAssetKey: "EAT-REPORT-DESIGN",
      }),
    );
    const stored = await svc.get(commerce("analysis.read"), CRUSHER_FEED_TENANT, first.artifact.id);
    expect(stored?.provenance.artifactTemplateVersion).toBe("6.0.0");
    void service;
    void plan;
    void policies;
    void plans;
  });

  it("does not create a second template domain or relational template bytes", () => {
    const service = createTestArtifactService();
    expect(service.catalog().newTemplateDomainCreated).toBe(false);
    expect(service.catalog().notADms).toBe(true);
    expect(service.catalog().templateBinaryStorage).toBe("PACKAGED_EOS_DEFAULT_PLUS_METADATA_POLICY");
  });
});

describe("EOS-A12A unified workbench actions", () => {
  it("returns materially different actions across FEED, detailed design, and construction", () => {
    const feed = workbenchActionsForLifecycle("FEED").map((row) => row.code);
    const detailed = workbenchActionsForLifecycle("DETAILED_DESIGN").map((row) => row.code);
    const construction = workbenchActionsForLifecycle("CONSTRUCTION").map((row) => row.code);
    expect(feed).toContain("START_CALCULATION");
    expect(feed).toContain("ASSESS_VENDOR_CHANGE");
    expect(detailed).toContain("ASSESS_DESIGN_CHANGE");
    expect(construction).toContain("RESPOND_RFI_TQ");
    expect(construction).toContain("ASSESS_FIELD_CHANGE");
    expect(feed).not.toEqual(construction);
    expect(detailed).not.toEqual(construction);
    expect(workbenchActionsForLifecycle("CONCEPT").map((row) => row.code)).toContain("START_CONCEPT_STUDY");
    expect(workbenchActionsForLifecycle("PREFEASIBILITY").map((row) => row.code)).toContain("OPTION_STUDY");
    expect(workbenchActionsForLifecycle("FEASIBILITY").map((row) => row.code)).toContain("PREPARE_DESIGN_REPORT");
    expect(workbenchActionsForLifecycle("COMMISSIONING").map((row) => row.code)).toContain("ASSESS_COMMISSIONING_QUERY");
    expect(workbenchActionsForLifecycle("OPERATIONS").map((row) => row.code)).toContain("PREPARE_HANDOVER");
    expect(WORKBENCH_AI_BOUNDARY.mayApproveDesign).toBe(false);
    expect(WORKBENCH_DEEP_MODULES.some((row) => row.href === "/engineering/information")).toBe(true);
  });
});
