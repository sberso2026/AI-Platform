import { createHash, randomUUID } from "node:crypto";
import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import type { ArtifactBinaryStore } from "../artifact-automation/binary-store";
import { LegacyRelationalArtifactBinaryStore } from "../artifact-automation/binary-adapters";
import { pointerFromArtifact } from "../artifact-automation/binary-store";
import type { ArtifactStore } from "../artifact-automation/memory-store";
import type { GeneratedEngineeringArtifact } from "../artifact-automation/types";
import { SupabaseArtifactStore } from "../artifact-automation/supabase-store";
import type { EngineeringWorkPlan } from "../work-generator/types";
import { SPACE_GASS_CATALOG_ENTRY } from "../external-tools/catalog";
import { desktopBridgeContract, newHandoffId, protocolUrlFor } from "./desktop-bridge";
import { createMemoryHandoffStore, type HandoffStore } from "./memory-store";
import { SupabaseHandoffStore } from "./supabase-store";
import { validateReturnedPackage, MALWARE_SCAN_STATUS, inferFormat } from "./return-validation";
import { isUnsafeLaunchPayload, issueHandoffSecret, tokensEqual, isPersonalUnmanagedPath } from "./security";
import { CAD_HANDOFF_CONTRACT, officeToolReadiness, spaceGassExecutionBoundary } from "./tools";
import {
  ARTIFACT_BINARY_STORE,
  DESKTOP_BRIDGE_STATUS,
  HANDOFF_TOKEN_TTL_MS,
  OFFICE_HANDOFF_BY_FORMAT,
  TOOL_ORCHESTRATION_PRIVACY,
  TOOL_ORCHESTRATION_RECON,
  type EngineeringToolHandoff,
  type HandoffCapability,
  type HandoffMode,
} from "./types";

export const CALLER_SUPPLIED_HANDOFF_KEYS = ["tenantId", "workspaceId", "aal", "approved", "authoritative", "current", "objectKey"] as const;

export type HandoffEventRecorder = (
  commerce: CommerceExecutionContext,
  tenantId: string,
  input: {
    eventType: "TOOL_HANDOFF_PREPARED" | "TOOL_HANDOFF_STARTED" | "ARTIFACT_RETURNED" | "ARTIFACT_PUBLISHED";
    projectId: string;
    planId: string;
    artifactId?: string | null;
    actorId?: string | null;
  },
) => Promise<void>;

export class EngineeringToolOrchestrationService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly artifacts: ArtifactStore = new SupabaseArtifactStore(supabase),
    private readonly handoffs: HandoffStore = new SupabaseHandoffStore(supabase),
    private readonly loadPlan: (id: string) => Promise<EngineeringWorkPlan | null> = async () => null,
    private readonly recordEvent?: HandoffEventRecorder,
    private readonly prepareAnalysis?: (input: {
      projectId: string;
      capability: string;
      requirementIds: string[];
      assumptionIds: string[];
      requestedBy: string;
    }) => Promise<{ id: string; status: string }>,
    private readonly openManaged?: (
      commerce: CommerceExecutionContext,
      tenantId: string,
      input: { workPlanId: string; sourceTitle?: string | null; projectId: string },
    ) => Promise<{ ok: boolean; href?: string; title?: string; connectorImplemented?: boolean } | null>,
    private readonly binaryStore: ArtifactBinaryStore = new LegacyRelationalArtifactBinaryStore(),
  ) {}

  catalog() {
    return {
      recon: TOOL_ORCHESTRATION_RECON,
      privacy: TOOL_ORCHESTRATION_PRIVACY,
      desktopBridge: desktopBridgeContract(),
      office: officeToolReadiness(),
      spaceGass: spaceGassExecutionBoundary("catalog"),
      cad: CAD_HANDOFF_CONTRACT,
      storage: ARTIFACT_BINARY_STORE,
      malwareScanStatus: MALWARE_SCAN_STATUS,
      pdfExportStatus: "DEFERRED",
      notASecondToolRegistry: true,
    };
  }

  rejectCallerClaims(body: Record<string, unknown>) {
    for (const key of CALLER_SUPPLIED_HANDOFF_KEYS) {
      if (key in body && body[key] != null && body[key] !== "") return "caller_supplied_authority_rejected";
    }
    if (isUnsafeLaunchPayload(body)) return "ARBITRARY_EXECUTABLE_DENIED";
    return null;
  }

  launcher(plan: EngineeringWorkPlan, artifacts: GeneratedEngineeringArtifact[], selectedProjectId?: string | null) {
    const office = artifacts.map((artifact) => {
      const mapping = OFFICE_HANDOFF_BY_FORMAT[artifact.outputFormat];
      return {
        artifactId: artifact.id,
        projectId: artifact.projectId,
        fileName: artifact.fileName,
        action: mapping.label,
        tool: mapping.toolCode,
        mode: mapping.mode,
        launchedNativeApplication: false,
        projectViewDiffers: Boolean(selectedProjectId && selectedProjectId !== artifact.projectId),
      };
    });
    const governing = plan.context.information.map((row) => ({
      title: row.title,
      action: "Open Governing Source",
      href: "/engineering/information",
      privateUrlExposed: false,
    }));
    const drawing = this.currentDrawing(plan);
    return {
      workType: plan.workType,
      steps: [
        "Governing inputs prepared",
        artifacts.length ? "Calculation/report artifacts generated" : "Generate expected outputs",
        "Download and open in Office through browser/OS behavior",
        drawing ? "Current drawing available" : "No current governed drawing",
        "Structural analysis: tool execution currently unavailable",
        "Publish updated artifact explicitly",
      ],
      office,
      governing,
      drawing,
      analysis: {
        available: false,
        message: "Tool execution unavailable / external dependency",
        action: "Prepare Analysis Request",
        spaceGass: spaceGassExecutionBoundary(plan.tenantId),
      },
      autocad: { connected: false, message: "Desktop integration not connected" },
      pdf: this.pdfWorkflow(plan),
      externalToolCenterHref: "/engineering/settings/external-tools",
    };
  }

  currentDrawing(plan: EngineeringWorkPlan) {
    const ranked = [...plan.context.information].filter((row) => /DRAWING|DWG|CAD/i.test(row.informationType) || /drawing/i.test(row.title));
    const current = ranked.find((row) => row.freshness === "CURRENT" && row.authorityOutcome === "AUTHORITATIVE_FOR_PURPOSE")
      ?? ranked.find((row) => row.freshness === "CURRENT")
      ?? null;
    if (!current) return null;
    return {
      title: current.title,
      revision: current.revision ?? null,
      authorityOutcome: current.authorityOutcome ?? null,
      action: "Open Current Drawing",
      selectedMostRecentlyModified: false,
      href: "/engineering/information",
    };
  }

  async prepareHandoff(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      workPlanId: string;
      artifactId?: string | null;
      mode?: HandoffMode;
      toolCode?: string;
      capability?: HandoffCapability;
      executablePath?: string;
      command?: string;
      selectedProjectId?: string | null;
      sourceTitle?: string | null;
    },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (input.executablePath || input.command) throw new Error("ARBITRARY_EXECUTABLE_DENIED");
    const plan = await this.loadPlan(input.workPlanId);
    if (!plan || plan.tenantId !== tenantId || plan.workspaceId !== workspaceId) throw new Error("not_found");
    const artifact = input.artifactId ? await this.artifacts.getArtifact(input.artifactId) : null;
    if (input.artifactId && (!artifact || artifact.tenantId !== tenantId || artifact.workspaceId !== workspaceId)) {
      throw new Error("not_found");
    }
    const projectId = artifact?.projectId ?? plan.projectId;
    if (artifact && (artifact.workPlanId !== plan.id || artifact.projectId !== plan.projectId)) {
      throw new Error("CROSS_PROJECT_MISMATCH");
    }
    const mapping = artifact ? OFFICE_HANDOFF_BY_FORMAT[artifact.outputFormat] : null;
    const mode = input.mode ?? mapping?.mode ?? "BROWSER_DOWNLOAD";
    const toolCode = input.toolCode ?? mapping?.toolCode ?? "microsoft-excel";
    const capability = input.capability ?? mapping?.capability ?? "OPEN_XLSX";
    const started = Date.now();
    if (mode === "EXECUTION_HOST" || toolCode === SPACE_GASS_CATALOG_ENTRY.toolCode || capability === "RUN_STRUCTURAL_ANALYSIS") {
      const space = spaceGassExecutionBoundary(tenantId);
      const failed = this.baseHandoff({
        tenantId, workspaceId, projectId, plan, artifact, toolCode: space.toolCode, capability, mode: "EXECUTION_HOST", commerce,
      });
      failed.status = "FAILED";
      failed.failure = "CAPABILITY_NOT_CERTIFIED";
      failed.explanation = "SPACE GASS execution remains NOT_CERTIFIED. No solver run. GUI automation is prohibited.";
      await this.handoffs.save(failed);
      await this.recordEvent?.(commerce, tenantId, {
        eventType: "TOOL_HANDOFF_PREPARED",
        projectId,
        planId: plan.id,
        artifactId: artifact?.id ?? null,
        actorId: commerce.actorUserId ?? null,
      });
      return { ok: false as const, handoff: failed, token: null, durationMs: Date.now() - started, view: this.projectView(projectId, input.selectedProjectId) };
    }
    if (mode === "DESKTOP_BRIDGE") {
      const row = this.baseHandoff({ tenantId, workspaceId, projectId, plan, artifact, toolCode, capability, mode, commerce });
      row.status = "PREPARED";
      row.failure = "BRIDGE_UNAVAILABLE";
      row.explanation = "Desktop Bridge is CONTRACT_ONLY. Browser cannot launch desktop executables. rtb-eos:// carries only the opaque handoff id.";
      row.protocolUrl = protocolUrlFor(row.id);
      const { token, tokenHash } = issueHandoffSecret();
      row.tokenHash = tokenHash;
      await this.handoffs.save(row);
      await this.recordEvent?.(commerce, tenantId, {
        eventType: "TOOL_HANDOFF_PREPARED",
        projectId,
        planId: plan.id,
        artifactId: artifact?.id ?? null,
        actorId: commerce.actorUserId ?? null,
      });
      return {
        ok: false as const,
        handoff: { ...row, tokenHash: "[redacted]" },
        token,
        desktopBridgeStatus: DESKTOP_BRIDGE_STATUS,
        durationMs: Date.now() - started,
        view: this.projectView(projectId, input.selectedProjectId),
      };
    }
    if (mode === "MANAGED_REPOSITORY_OPEN") {
      const row = this.baseHandoff({ tenantId, workspaceId, projectId, plan, artifact, toolCode, capability, mode, commerce });
      const opened = await this.openManaged?.(commerce, tenantId, { workPlanId: plan.id, projectId });
      const connected = Boolean(opened?.connectorImplemented);
      row.status = "PREPARED";
      row.explanation = connected
        ? "Open the governed SharePoint location for this managed source. Publication is a separate explicit action."
        : "Managed repository open is a governed contract. Native SharePoint/EDMS connectors are not implemented in A11C.";
      await this.handoffs.save(row);
      await this.recordEvent?.(commerce, tenantId, {
        eventType: "TOOL_HANDOFF_PREPARED",
        projectId,
        planId: plan.id,
        artifactId: artifact?.id ?? null,
        actorId: commerce.actorUserId ?? null,
      });
      return {
        ok: true as const,
        handoff: { ...row, tokenHash: "[redacted]" },
        token: null,
        actions: ["Open Managed Source", "View Current Revision", "Download Controlled Copy"],
        connectorImplemented: connected,
        href: opened?.href ?? "/engineering/information",
        durationMs: Date.now() - started,
        view: this.projectView(projectId, input.selectedProjectId),
      };
    }
    const row = this.baseHandoff({ tenantId, workspaceId, projectId, plan, artifact, toolCode, capability, mode: "BROWSER_DOWNLOAD", commerce });
    row.status = "HANDED_OFF";
    row.explanation = "Secure browser download. EOS does not launch Office and does not monitor the local copy after download.";
    const { token, tokenHash } = issueHandoffSecret();
    row.tokenHash = tokenHash;
    await this.handoffs.save(row);
    await this.recordEvent?.(commerce, tenantId, {
      eventType: "TOOL_HANDOFF_STARTED",
      projectId,
      planId: plan.id,
      artifactId: artifact?.id ?? null,
      actorId: commerce.actorUserId ?? null,
    });
    return {
      ok: true as const,
      handoff: { ...row, tokenHash: "[redacted]" },
      token,
      downloadAction: mapping?.label ?? "Download",
      launchedNativeApplication: false,
      durationMs: Date.now() - started,
      view: this.projectView(projectId, input.selectedProjectId),
    };
  }

  async redeemHandoff(commerce: CommerceExecutionContext, tenantId: string, handoffId: string, token: string) {
    assertEngineeringService(commerce, "work.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const row = await this.handoffs.get(handoffId);
    if (!row || row.tenantId !== tenantId || row.workspaceId !== workspaceId) throw new Error("UNAUTHORIZED");
    if (row.consumedAt) throw new Error("HANDOFF_EXPIRED");
    if (new Date(row.expiresAt).getTime() <= Date.now()) throw new Error("HANDOFF_EXPIRED");
    if (!tokensEqual(token, row.tokenHash)) throw new Error("HANDOFF_EXPIRED");
    const consumed = { ...row, consumedAt: new Date().toISOString(), status: row.status === "PREPARED" ? "HANDED_OFF" : row.status } as EngineeringToolHandoff;
    await this.handoffs.save(consumed);
    return { ok: true as const, handoff: { ...consumed, tokenHash: "[redacted]" } };
  }

  async publishUpdatedArtifact(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      originArtifactId: string;
      fileName: string;
      contentBase64: string;
      unmanagedPath?: string | null;
      selectedProjectId?: string | null;
      explicitProjectId?: string | null;
      controlledFixture?: boolean;
    },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (input.unmanagedPath && isPersonalUnmanagedPath(input.unmanagedPath)) {
      throw new Error("PERSONAL_FILE_OUTSIDE_EOS");
    }
    if (!input.originArtifactId) throw new Error("not_found");
    const origin = await this.artifacts.getArtifact(input.originArtifactId);
    if (!origin || origin.tenantId !== tenantId || origin.workspaceId !== workspaceId) throw new Error("not_found");
    const projectId = origin.projectId;
    if (input.explicitProjectId && input.explicitProjectId !== projectId) throw new Error("CROSS_PROJECT_MISMATCH");
    const format = inferFormat(input.fileName, origin.mimeType) ?? origin.outputFormat;
    if (format !== origin.outputFormat) throw new Error("UNSAFE_FILENAME");
    const bytes = Buffer.from(input.contentBase64, "base64");
    const hash = createHash("sha256").update(bytes).digest("hex");
    const started = Date.now();
    const validated = await validateReturnedPackage({
      fileName: input.fileName,
      bytes,
      expectedFormat: format,
      unmanagedPath: input.unmanagedPath,
      controlledFixture: input.controlledFixture,
    });
    if (!validated.ok) {
      throw new Error(validated.failure);
    }
    const returned: GeneratedEngineeringArtifact = {
      ...origin,
      id: randomUUID(),
      sha256: hash,
      byteSize: bytes.length,
      fileName: validated.fileName.replace(/_DRAFT\./i, "_RETURNED."),
      contentBase64: this.binaryStore instanceof LegacyRelationalArtifactBinaryStore ? bytes.toString("base64") : "",
      status: "READY_FOR_ENGINEER_REVIEW",
      createdAt: new Date().toISOString(),
      supersededById: null,
      lineageKind: "RETURNED_FROM_ENGINEER",
      originArtifactId: origin.id,
      originGenerationRunId: origin.generationRunId,
      originSha256: origin.sha256,
      returnedBy: commerce.actorUserId ?? null,
      returnedAt: new Date().toISOString(),
      malwareScanStatus: validated.malware.state,
      warnings: [...origin.warnings, "RETURNED FROM ENGINEER. Formula certification and approval are not inherited. Engineer review required."],
      provenance: {
        ...origin.provenance,
        generatedAt: new Date().toISOString(),
        draft: true,
        engineeringApproved: false,
        exampleOnly: origin.provenance.exampleOnly,
      },
    };
    if (!(this.binaryStore instanceof LegacyRelationalArtifactBinaryStore)) {
      const stored = await this.binaryStore.put(pointerFromArtifact(returned), Uint8Array.from(bytes));
      returned.storageKind = stored.storageKind;
      returned.objectKey = stored.objectKey;
      returned.contentSizeBytes = stored.contentSizeBytes;
      returned.contentSha256 = stored.contentSha256;
      returned.contentType = stored.contentType;
      returned.storageVersion = stored.storageVersion;
      returned.migrationState = stored.migrationState === "IN_PROGRESS" ? "VERIFIED" : stored.migrationState;
      returned.contentBase64 = "";
    }
    const saved = await this.artifacts.saveArtifact(returned);
    await this.recordEvent?.(commerce, tenantId, {
      eventType: "ARTIFACT_RETURNED",
      projectId,
      planId: origin.workPlanId,
      artifactId: saved.id,
      actorId: commerce.actorUserId ?? null,
    });
    await this.recordEvent?.(commerce, tenantId, {
      eventType: "ARTIFACT_PUBLISHED",
      projectId,
      planId: origin.workPlanId,
      artifactId: saved.id,
      actorId: commerce.actorUserId ?? null,
    });
    const original = await this.artifacts.getArtifact(origin.id);
    return {
      ok: true as const,
      returned: { ...saved, contentBase64: "" },
      originalPreserved: original?.id === origin.id && original.sha256 === origin.sha256 && original.lineageKind === "GENERATED_DRAFT",
      projectId,
      selectedProjectIgnored: Boolean(input.selectedProjectId && input.selectedProjectId !== projectId),
      view: this.projectView(projectId, input.selectedProjectId),
      durationMs: Date.now() - started,
      byteSize: bytes.length,
      engineeringApproved: false,
      thread: {
        nodes: [
          { objectType: "engineering_work_plan", objectId: origin.workPlanId },
          { objectType: "engineering_generated_artifact", objectId: origin.id },
          { objectType: "engineering_generated_artifact", objectId: saved.id },
        ],
        links: [
          { relationship: "USES", fromType: "engineering_work_plan", fromId: origin.workPlanId, toType: "engineering_generated_artifact", toId: origin.id },
          { relationship: "SUPERSEDES", fromType: "engineering_generated_artifact", fromId: saved.id, toType: "engineering_generated_artifact", toId: origin.id, meaning: "lineage only; original bytes preserved" },
        ],
      },
    };
  }

  async listHandoffs(commerce: CommerceExecutionContext, tenantId: string, workPlanId: string) {
    assertEngineeringService(commerce, "work.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    return (await this.handoffs.listByPlan(workspaceId, workPlanId)).map((row) => ({ ...row, tokenHash: "[redacted]" }));
  }

  async openGoverningSource(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { workPlanId: string; sourceTitle?: string | null },
  ) {
    assertEngineeringService(commerce, "work.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const plan = await this.loadPlan(input.workPlanId);
    if (!plan || plan.tenantId !== tenantId || plan.workspaceId !== workspaceId) throw new Error("not_found");
    const row = input.sourceTitle
      ? plan.context.information.find((item) => item.title === input.sourceTitle) ?? null
      : plan.context.information[0] ?? null;
    if (!row) return { ok: false as const, reason: "SOURCE_NOT_FOUND" as const, privateUrlExposed: false };
    const opened = await this.openManaged?.(commerce, tenantId, { workPlanId: input.workPlanId, sourceTitle: input.sourceTitle, projectId: plan.projectId });
    return {
      ok: true as const,
      title: opened?.title ?? row.title,
      revision: row.revision ?? null,
      freshness: row.freshness ?? null,
      authorityOutcome: row.authorityOutcome ?? null,
      href: opened?.href ?? "/engineering/information",
      actions: ["Open EOS source detail", "Download Controlled Copy", "Open Managed Source"],
      privateUrlExposed: false,
      connectorImplemented: Boolean(opened?.connectorImplemented),
      provider: opened?.connectorImplemented ? "SharePoint" : undefined,
    };
  }

  pdfWorkflow(plan: EngineeringWorkPlan) {
    const pdfs = plan.context.information.filter((row) => /PDF|REPORT|SPECIFICATION/i.test(row.informationType) || /\.pdf$/i.test(row.title));
    return {
      generation: "DEFERRED" as const,
      editingAutomation: false,
      sources: pdfs.map((row) => ({
        title: row.title,
        revision: row.revision ?? null,
        actions: ["Open Current PDF", "Download Controlled PDF", "Open Related Review"],
        href: "/engineering/information",
      })),
    };
  }

  async prepareAnalysisRequest(commerce: CommerceExecutionContext, tenantId: string, workPlanId: string) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const plan = await this.loadPlan(workPlanId);
    if (!plan || plan.tenantId !== tenantId || plan.workspaceId !== workspaceId) throw new Error("not_found");
    const space = spaceGassExecutionBoundary(tenantId);
    const created = await this.prepareAnalysis?.({
      projectId: plan.projectId,
      capability: "LINEAR_STATIC_ANALYSIS",
      requirementIds: plan.context.requirements.map((row) => row.objectId),
      assumptionIds: plan.context.assumptions.map((row) => row.objectId),
      requestedBy: commerce.actorUserId ?? "engineer",
    });
    return {
      analysisRequest: created ?? {
        id: `prepared:${plan.id}`,
        status: "blocked",
        capability: "LINEAR_STATIC_ANALYSIS",
        projectId: plan.projectId,
        governingInputs: plan.context.information.map((row) => row.title),
      },
      toolReadiness: space,
      execution: { attempted: false, blocked: true, reason: space.reason },
    };
  }

  private projectView(artifactProjectId: string, selectedProjectId?: string | null) {
    if (selectedProjectId && selectedProjectId !== artifactProjectId) {
      return {
        mismatch: true,
        message: `This artifact belongs to Project ${artifactProjectId}.`,
        actions: ["Switch EOS View", "Continue without switching"],
        rewriteMembership: false,
      };
    }
    return { mismatch: false, rewriteMembership: false };
  }

  private baseHandoff(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    plan: EngineeringWorkPlan;
    artifact: GeneratedEngineeringArtifact | null;
    toolCode: string;
    capability: HandoffCapability;
    mode: HandoffMode;
    commerce: CommerceExecutionContext;
  }): EngineeringToolHandoff {
    const now = new Date();
    return {
      id: newHandoffId(),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      workPlanId: input.plan.id,
      artifactId: input.artifact?.id ?? null,
      sourceRef: input.artifact?.fileName ?? null,
      toolCode: input.toolCode,
      capability: input.capability,
      handoffMode: input.mode,
      status: "PREPARED",
      requestedBy: input.commerce.actorUserId ?? null,
      requestedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + HANDOFF_TOKEN_TTL_MS).toISOString(),
      tokenHash: "",
      consumedAt: null,
      inputFingerprint: input.plan.inputFingerprint,
      failure: null,
      explanation: "",
      launchedNativeApplication: false,
      engineeringApproved: false,
      protocolUrl: null,
    };
  }
}

export function createTestOrchestrationService(input: {
  artifacts: ArtifactStore;
  loadPlan: (id: string) => Promise<EngineeringWorkPlan | null>;
  recorder?: HandoffEventRecorder;
  prepareAnalysis?: ConstructorParameters<typeof EngineeringToolOrchestrationService>[5];
  binaryStore?: ArtifactBinaryStore;
}) {
  return new EngineeringToolOrchestrationService(
    { from() { return this; } } as never,
    input.artifacts,
    createMemoryHandoffStore(),
    input.loadPlan,
    input.recorder,
    input.prepareAnalysis,
    undefined,
    input.binaryStore ?? new LegacyRelationalArtifactBinaryStore(),
  );
}
