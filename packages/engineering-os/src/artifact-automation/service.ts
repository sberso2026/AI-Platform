import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import type { EngineeringWorkPlan } from "../work-generator/types";
import { ARTIFACT_TEMPLATES, listArtifactTemplates } from "./catalog";
import { generateEngineeringArtifact, selectTemplate } from "./generator";
import { createMemoryArtifactStore, type ArtifactStore } from "./memory-store";
import { ARTIFACT_DOCUMENT_BOUNDARY, artifactThreadGraph, composeDeliverableFromArtifact } from "./provenance";
import { SupabaseArtifactStore } from "./supabase-store";
import { ARTIFACT_AI_BOUNDARY, ARTIFACT_PRIVACY, type ArtifactType } from "./types";

export const CALLER_SUPPLIED_ARTIFACT_KEYS = ["tenantId", "workspaceId", "aal", "approved", "authoritative", "current"] as const;

export type ArtifactEventRecorder = (
  commerce: CommerceExecutionContext,
  tenantId: string,
  input: {
    eventType: "ARTIFACT_GENERATION_STARTED" | "ARTIFACT_GENERATED" | "ARTIFACT_GENERATION_FAILED" | "ARTIFACT_REGENERATED";
    projectId: string;
    planId: string;
    artifactId?: string | null;
    actorId?: string | null;
  },
) => Promise<void>;

export class EngineeringArtifactAutomationService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly store: ArtifactStore = new SupabaseArtifactStore(supabase),
    private readonly loadPlan: (id: string) => Promise<EngineeringWorkPlan | null> = async () => null,
    private readonly recordEvent?: ArtifactEventRecorder,
  ) {}

  catalog() {
    return {
      templates: listArtifactTemplates(),
      aiBoundary: ARTIFACT_AI_BOUNDARY,
      privacy: ARTIFACT_PRIVACY,
      documentBoundary: ARTIFACT_DOCUMENT_BOUNDARY,
      pdfExportStatus: ARTIFACT_PRIVACY.pdfExportStatus,
      macrosCreated: false,
      notADms: true,
      notABlobPlatform: true,
    };
  }

  rejectCallerClaims(body: Record<string, unknown>) {
    for (const key of CALLER_SUPPLIED_ARTIFACT_KEYS) {
      if (key in body && body[key] != null && body[key] !== "") return "caller_supplied_authority_rejected";
    }
    return null;
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, workPlanId: string) {
    assertEngineeringService(commerce, "work.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    return (await this.store.listArtifacts(workspaceId, workPlanId)).filter((row) => row.tenantId === tenantId);
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "work.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const row = await this.store.getArtifact(id);
    if (!row || row.tenantId !== tenantId || row.workspaceId !== workspaceId) return null;
    return row;
  }

  async generate(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      workPlanId: string;
      artifactType?: ArtifactType;
      templateCode?: string;
      templateVersion?: string;
      projectCode?: string | null;
    },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const plan = await this.loadPlan(input.workPlanId);
    if (!plan || plan.tenantId !== tenantId || plan.workspaceId !== workspaceId) throw new Error("not_found");
    const template = selectTemplate(plan, input.artifactType, input.templateCode, input.templateVersion);
    if (!template) throw new Error("artifact_template_not_found");
    await this.recordEvent?.(commerce, tenantId, {
      eventType: "ARTIFACT_GENERATION_STARTED",
      projectId: plan.projectId,
      planId: plan.id,
      actorId: commerce.actorUserId ?? null,
    });
    const previous = (await this.store.listArtifacts(workspaceId, plan.id)).filter(
      (row) => row.tenantId === tenantId && row.templateCode === template.code && row.status !== "SUPERSEDED",
    );
    const result = await generateEngineeringArtifact({
      plan,
      template,
      requestedBy: commerce.actorUserId ?? null,
      projectCode: input.projectCode,
    });
    await this.store.saveRun(result.run);
    if (!result.ok) {
      await this.recordEvent?.(commerce, tenantId, {
        eventType: "ARTIFACT_GENERATION_FAILED",
        projectId: plan.projectId,
        planId: plan.id,
        actorId: commerce.actorUserId ?? null,
      });
      return result;
    }
    for (const older of previous) {
      await this.store.saveArtifact({ ...older, status: "SUPERSEDED", supersededById: result.artifact.id });
    }
    const saved = await this.store.saveArtifact(result.artifact);
    await this.recordEvent?.(commerce, tenantId, {
      eventType: previous.length ? "ARTIFACT_REGENERATED" : "ARTIFACT_GENERATED",
      projectId: plan.projectId,
      planId: plan.id,
      artifactId: saved.id,
      actorId: commerce.actorUserId ?? null,
    });
    return { ok: true as const, run: result.run, artifact: { ...saved, contentBase64: "" }, deliverable: composeDeliverableFromArtifact(), thread: artifactThreadGraph({
      tenantId: saved.tenantId,
      workspaceId: saved.workspaceId,
      projectId: saved.projectId,
      artifactId: saved.id,
      workPlanId: plan.id,
      plan,
    }) };
  }

  compareContext(artifactFingerprint: string, planFingerprint: string) {
    if (artifactFingerprint === planFingerprint) return { stale: false, reason: "CURRENT" as const };
    return { stale: true, reason: "STALE" as const, message: "Artifact generated from older context" };
  }

  downloadMeta() {
    return { localRecursiveScan: "PROHIBITED", autoReingest: false, personalFilesOutsideEos: true };
  }
}

export function createTestArtifactService(store = createMemoryArtifactStore(), loadPlan: (id: string) => Promise<EngineeringWorkPlan | null> = async () => null, recorder?: ArtifactEventRecorder) {
  return new EngineeringArtifactAutomationService({ from() { return this; } } as never, store, loadPlan, recorder);
}

export { ARTIFACT_TEMPLATES };
