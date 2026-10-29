import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { describe, expect, it } from "vitest";
import { generateEngineeringWorkPlan } from "../work-generator/generator";
import { templateFor } from "../work-generator/catalog";
import {
  A11A_SYSTEM_ID,
  CRUSHER_EXPANSION_FEED_PROJECT_ID,
  CRUSHER_FEED_TENANT,
  CRUSHER_FEED_WORKSPACE,
  detailedDesignReadySnapshot,
  optionStudySnapshot,
  WORKFLOW_READINESS,
} from "../work-generator/fixture";
import { createMemoryWorkPlanStore } from "../work-generator/memory-store";
import { createMemoryArtifactStore } from "../artifact-automation/memory-store";
import { createTestArtifactService } from "../artifact-automation/service";
import { TOOL_ORCHESTRATION_PRIVACY, DESKTOP_BRIDGE_STATUS, OFFICE_HANDOFF_BY_FORMAT, A11D_HANDOFF } from "./types";
import { createTestOrchestrationService } from "./service";
import { EICAR_TEST_SIGNATURE, MALWARE_SCAN_STATUS } from "./return-validation";
import { isUnsafeLaunchPayload } from "./security";
import { desktopBridgeContract, protocolUrlFor } from "./desktop-bridge";
import { CAD_HANDOFF_CONTRACT, officeToolReadiness } from "./tools";
import { SPACE_GASS_CATALOG_ENTRY } from "../external-tools/catalog";
import type { EngineeringWorkPlan } from "../work-generator/types";
import type { GeneratorWorkType } from "../work-generator/types";
import type { LifecycleStage } from "../lifecycle-intelligence/types";

function commerce(action: "analysis.read" | "analysis.write" = "analysis.write") {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

const OTHER_PROJECT = "project-beta-ui-view";

async function desk(workType: GeneratorWorkType = "DESIGN_CALCULATION", lifecycle: LifecycleStage = "DETAILED_DESIGN", snapshot = detailedDesignReadySnapshot(), readiness = WORKFLOW_READINESS.detailedReady) {
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
    generatedBy: "cert-a11c",
  });
  plan.context.information.push({
    informationType: "DRAWING",
    title: "Foundation GA drawing",
    purpose: "FOR_DESIGN_INPUT",
    revision: "C",
    freshness: "CURRENT",
    authorityOutcome: "AUTHORITATIVE_FOR_PURPOSE",
    whyIncluded: "Current governed drawing, not the most recently modified file.",
  });
  plan.context.information.push({
    informationType: "DRAWING",
    title: "Superseded excavation sketch",
    purpose: "FOR_INFORMATION",
    revision: "A",
    freshness: "STALE",
    authorityOutcome: "SUPERSEDED",
    whyIncluded: "Must not be selected merely because it was modified later.",
  });
  const plans = createMemoryWorkPlanStore();
  await plans.savePlan(plan);
  const artifacts = createMemoryArtifactStore();
  const events: string[] = [];
  const artifactSvc = createTestArtifactService(artifacts, (id) => plans.getPlan(id));
  const orch = createTestOrchestrationService({
    artifacts,
    loadPlan: (id) => plans.getPlan(id),
    recorder: async (_c, _t, input) => {
      events.push(input.eventType);
    },
  });
  return { plan, orch, artifactSvc, artifacts, events };
}

async function generate(plan: EngineeringWorkPlan, artifactSvc: ReturnType<typeof createTestArtifactService>, artifactType: "CALCULATION_WORKBOOK" | "DESIGN_REPORT" | "OPTION_STUDY_PRESENTATION") {
  const generated = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, {
    workPlanId: plan.id,
    artifactType,
    projectCode: "ER-A1",
  });
  if (!generated.ok) throw new Error("generate failed");
  return generated;
}

describe("EOS-A11C Engineering Tool Orchestration", () => {
  it("reuses External Tool Governance and keeps SPACE GASS unexecuted", async () => {
    const { orch, plan } = await desk("ENGINEERING_ANALYSIS", "FEASIBILITY");
    const catalog = orch.catalog();
    expect(catalog.recon.externalToolGovernance).toBe("REUSE");
    expect(catalog.notASecondToolRegistry).toBe(true);
    expect(catalog.desktopBridge.status).toBe(DESKTOP_BRIDGE_STATUS);
    expect(catalog.spaceGass.toolCode).toBe(SPACE_GASS_CATALOG_ENTRY.toolCode);
    expect(catalog.spaceGass.realSolverExecution).toBe("NOT_CERTIFIED");
    expect(catalog.cad.pluginImplemented).toBe(false);
    expect(CAD_HANDOFF_CONTRACT.commandLevelMonitoring).toBe(false);
    expect(A11D_HANDOFF.autonomousApproval).toBe(false);
    const analysis = await orch.prepareAnalysisRequest(commerce(), CRUSHER_FEED_TENANT, plan.id);
    expect(analysis.execution.attempted).toBe(false);
    expect(analysis.execution.blocked).toBe(true);
    expect(analysis.toolReadiness.reason).toBe("CAPABILITY_NOT_CERTIFIED");
  });

  it("performs browser download handoff for Excel/Word/PowerPoint without claiming native launch", async () => {
    const { orch, plan, artifactSvc } = await desk();
    const xlsx = await generate(plan, artifactSvc, "CALCULATION_WORKBOOK");
    const docx = await generate(plan, artifactSvc, "DESIGN_REPORT");
    const excel = await orch.prepareHandoff(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: plan.id,
      artifactId: xlsx.artifact.id,
      mode: "BROWSER_DOWNLOAD",
    });
    const word = await orch.prepareHandoff(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: plan.id,
      artifactId: docx.artifact.id,
      mode: "BROWSER_DOWNLOAD",
    });
    expect(excel.ok && word.ok).toBe(true);
    if (!excel.ok || !word.ok) return;
    expect(excel.launchedNativeApplication).toBe(false);
    expect(excel.downloadAction).toBe("Download and Open in Excel");
    expect(word.downloadAction).toBe("Download and Open in Word");
    expect(excel.handoff.projectId).toBe(CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(excel.handoff.tokenHash).toBe("[redacted]");
    const option = await desk("OPTION_STUDY", "PREFEASIBILITY", optionStudySnapshot(), WORKFLOW_READINESS.optionUnknown);
    const pptx = await generate(option.plan, option.artifactSvc, "OPTION_STUDY_PRESENTATION");
    const deck = await option.orch.prepareHandoff(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: option.plan.id,
      artifactId: pptx.artifact.id,
      mode: "BROWSER_DOWNLOAD",
    });
    expect(deck.ok).toBe(true);
    if (!deck.ok) return;
    expect(deck.downloadAction).toBe("Download and Open in PowerPoint");
    expect(OFFICE_HANDOFF_BY_FORMAT.PPTX.label).toBe("Download and Open in PowerPoint");
    expect(officeToolReadiness().find((row) => row.toolCode === "microsoft-excel")?.message).toMatch(/does not launch Excel/);
  });

  it("round-trips an edited workbook as a new returned version and preserves the original", async () => {
    const { orch, plan, artifactSvc, artifacts, events } = await desk();
    const generated = await generate(plan, artifactSvc, "CALCULATION_WORKBOOK");
    const origin = await artifacts.getArtifact(generated.artifact.id);
    await orch.prepareHandoff(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: plan.id,
      artifactId: origin!.id,
      mode: "BROWSER_DOWNLOAD",
    });
    const returned = await orch.publishUpdatedArtifact(commerce(), CRUSHER_FEED_TENANT, {
      originArtifactId: origin!.id,
      fileName: origin!.fileName,
      contentBase64: origin!.contentBase64,
      selectedProjectId: OTHER_PROJECT,
      controlledFixture: true,
    });
    expect(returned.originalPreserved).toBe(true);
    expect(returned.returned.lineageKind).toBe("RETURNED_FROM_ENGINEER");
    expect(returned.returned.id).not.toBe(origin!.id);
    expect(returned.returned.originArtifactId).toBe(origin!.id);
    expect(returned.returned.originSha256).toBe(origin!.sha256);
    expect(returned.returned.provenance.engineeringApproved).toBe(false);
    expect(returned.returned.status).toBe("READY_FOR_ENGINEER_REVIEW");
    expect(returned.projectId).toBe(CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(returned.selectedProjectIgnored).toBe(true);
    expect(returned.view.rewriteMembership).toBe(false);
    expect(returned.thread.links.some((row) => row.relationship === "SUPERSEDES")).toBe(true);
    const still = await artifacts.getArtifact(origin!.id);
    expect(still?.sha256).toBe(origin!.sha256);
    expect(still?.lineageKind).toBe("GENERATED_DRAFT");
    expect(events).toEqual(expect.arrayContaining(["TOOL_HANDOFF_STARTED", "ARTIFACT_RETURNED", "ARTIFACT_PUBLISHED"]));
  });

  it("keeps project ownership from artifact lineage and opens the current governed drawing", async () => {
    const { orch, plan, artifactSvc } = await desk();
    const generated = await generate(plan, artifactSvc, "CALCULATION_WORKBOOK");
    const handoff = await orch.prepareHandoff(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: plan.id,
      artifactId: generated.artifact.id,
      mode: "BROWSER_DOWNLOAD",
      selectedProjectId: OTHER_PROJECT,
    });
    expect(handoff.ok).toBe(true);
    if (!handoff.ok) return;
    expect(handoff.handoff.projectId).toBe(CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(handoff.view.mismatch).toBe(true);
    expect(handoff.view.rewriteMembership).toBe(false);
    const drawing = orch.currentDrawing(plan);
    expect(drawing?.title).toBe("Foundation GA drawing");
    expect(drawing?.selectedMostRecentlyModified).toBe(false);
    const source = await orch.openGoverningSource(commerce("analysis.read"), CRUSHER_FEED_TENANT, { workPlanId: plan.id, sourceTitle: "Geotechnical bearing capacity" });
    expect(source.ok).toBe(true);
    if (!source.ok) return;
    expect(source.privateUrlExposed).toBe(false);
    const repo = await orch.prepareHandoff(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: plan.id,
      artifactId: generated.artifact.id,
      mode: "MANAGED_REPOSITORY_OPEN",
    });
    expect(repo.ok).toBe(true);
    if (!repo.ok) return;
    expect(repo.connectorImplemented).toBe(false);
    expect(repo.actions).toEqual(expect.arrayContaining(["Open Managed Source", "View Current Revision", "Download Controlled Copy"]));
    const pdf = orch.pdfWorkflow(plan);
    expect(pdf.generation).toBe("DEFERRED");
    expect(pdf.editingAutomation).toBe(false);
  });

  it("denies arbitrary executables, personal files, command injection, and uncertified execution", async () => {
    const { orch, plan, artifactSvc, artifacts } = await desk();
    const generated = await generate(plan, artifactSvc, "CALCULATION_WORKBOOK");
    const origin = await artifacts.getArtifact(generated.artifact.id);
    expect(isUnsafeLaunchPayload({ executablePath: "C:\\evil.exe" })).toBe(true);
    await expect(
      orch.prepareHandoff(commerce(), CRUSHER_FEED_TENANT, {
        workPlanId: plan.id,
        executablePath: "C:\\Windows\\System32\\cmd.exe",
        command: "powershell -enc",
      }),
    ).rejects.toThrow(/ARBITRARY_EXECUTABLE/);
    const execution = await orch.prepareHandoff(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: plan.id,
      artifactId: generated.artifact.id,
      mode: "EXECUTION_HOST",
      toolCode: SPACE_GASS_CATALOG_ENTRY.toolCode,
      capability: "RUN_STRUCTURAL_ANALYSIS",
    });
    expect(execution.ok).toBe(false);
    if (execution.ok) return;
    expect(execution.handoff.failure).toBe("CAPABILITY_NOT_CERTIFIED");
    const bridge = await orch.prepareHandoff(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: plan.id,
      artifactId: generated.artifact.id,
      mode: "DESKTOP_BRIDGE",
    });
    expect(bridge.ok).toBe(false);
    if (bridge.ok) return;
    expect(bridge.desktopBridgeStatus).toBe("CONTRACT_ONLY");
    expect(bridge.handoff.protocolUrl).toBe(protocolUrlFor(bridge.handoff.id));
    expect(bridge.handoff.protocolUrl).not.toMatch(/eyJ/);
    await expect(
      orch.publishUpdatedArtifact(commerce(), CRUSHER_FEED_TENANT, {
        originArtifactId: origin!.id,
        fileName: "Mortgage.xlsx",
        contentBase64: origin!.contentBase64,
        unmanagedPath: "C:\\Users\\User\\Documents\\Personal\\Mortgage.xlsx",
        controlledFixture: true,
      }),
    ).rejects.toThrow(/PERSONAL_FILE_OUTSIDE_EOS/);
    expect(TOOL_ORCHESTRATION_PRIVACY.localRecursiveScan).toBe("PROHIBITED");
    expect(desktopBridgeContract().mayScanLocalDrives).toBe(false);
    expect(MALWARE_SCAN_STATUS).toMatch(/CLAMAV/);
  });

  it("rejects EICAR, unsafe names, and tampered/expired handoff tokens", async () => {
    const { orch, plan, artifactSvc } = await desk();
    const generated = await generate(plan, artifactSvc, "CALCULATION_WORKBOOK");
    await expect(
      orch.publishUpdatedArtifact(commerce(), CRUSHER_FEED_TENANT, {
        originArtifactId: generated.artifact.id,
        fileName: generated.artifact.fileName,
        contentBase64: Buffer.from(EICAR_TEST_SIGNATURE).toString("base64"),
        controlledFixture: true,
      }),
    ).rejects.toThrow(/MALWARE_INFECTED|UNSAFE_FILENAME/);
    await expect(
      orch.publishUpdatedArtifact(commerce(), CRUSHER_FEED_TENANT, {
        originArtifactId: generated.artifact.id,
        fileName: "..\\evil.xlsx",
        contentBase64: "UEs=",
      }),
    ).rejects.toThrow(/PATH_TRAVERSAL|UNSAFE_FILENAME/);
    const prepared = await orch.prepareHandoff(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: generated.artifact.workPlanId,
      artifactId: generated.artifact.id,
      mode: "BROWSER_DOWNLOAD",
    });
    if (!prepared.ok || !prepared.token) throw new Error("token missing");
    await expect(orch.redeemHandoff(commerce("analysis.read"), CRUSHER_FEED_TENANT, prepared.handoff.id, "tampered")).rejects.toThrow(/HANDOFF_EXPIRED/);
    const redeemed = await orch.redeemHandoff(commerce("analysis.read"), CRUSHER_FEED_TENANT, prepared.handoff.id, prepared.token);
    expect(redeemed.ok).toBe(true);
    await expect(orch.redeemHandoff(commerce("analysis.read"), CRUSHER_FEED_TENANT, prepared.handoff.id, prepared.token)).rejects.toThrow(/HANDOFF_EXPIRED/);
  });
});
