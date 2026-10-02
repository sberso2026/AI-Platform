import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import type { EngineeringWorkPlan } from "../work-generator/types";
import { ARTIFACT_TEMPLATES, listArtifactTemplates } from "./catalog";
import { generateEngineeringArtifact } from "./generator";
import { createMemoryArtifactStore, type ArtifactStore } from "./memory-store";
import { pointerFromArtifact, objectStorageWritesEnabled, type ArtifactBinaryStore } from "./binary-store";
import { LegacyRelationalArtifactBinaryStore, RoutingArtifactBinaryStore } from "./binary-adapters";
import { createMemoryTemplatePolicyStore, type TemplatePolicyStore } from "./memory-template-store";
import { ARTIFACT_DOCUMENT_BOUNDARY, artifactThreadGraph, composeDeliverableFromArtifact } from "./provenance";
import { resolveEngineeringArtifactTemplate } from "./resolve-template";
import { SupabaseArtifactStore } from "./supabase-store";
import { SupabaseTemplatePolicyStore } from "./supabase-template-store";
import { DEFAULT_TEMPLATE_FALLBACK_POLICY, type ArtifactTemplatePolicyRecord, type TenantTemplateFallbackPolicy } from "./template-policy";
import { ARTIFACT_AI_BOUNDARY, ARTIFACT_PRIVACY, type ArtifactType, type GeneratedEngineeringArtifact } from "./types";
import { composeDeliverableSource, compareDeliverableStaleness, A15A_V4_FEATURE_FREEZE } from "../lifecycle-intelligence/deliverable-composition";
import type { PersistedMtoSnapshot } from "../lifecycle-intelligence/quantity-mto-persist";

export const CALLER_SUPPLIED_ARTIFACT_KEYS = ["tenantId", "workspaceId", "aal", "approved", "authoritative", "current", "objectKey", "storageKind"] as const;

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
    private readonly policies: TemplatePolicyStore = new SupabaseTemplatePolicyStore(supabase),
    private readonly templateBinary?: {
      retrieve(
        commerce: CommerceExecutionContext,
        tenantId: string,
        input: { sourceId: string; expectedFormat: "XLSX" | "DOCX" | "PPTX" },
      ): Promise<{ ok: boolean; reason?: string; storedInPostgres?: boolean }>;
    },
    private readonly binaryStore: ArtifactBinaryStore = new LegacyRelationalArtifactBinaryStore(),
  ) {}

  private mtoLoader: ((workPlanId: string) => Promise<{ current: PersistedMtoSnapshot | null; previous: PersistedMtoSnapshot | null } | null>) | null = null;

  bindQuantityMto(loader: (workPlanId: string) => Promise<{ current: PersistedMtoSnapshot | null; previous: PersistedMtoSnapshot | null } | null>) {
    this.mtoLoader = loader;
  }

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
      newDeliverableIntelligenceDomain: A15A_V4_FEATURE_FREEZE.newDeliverableIntelligenceDomain,
      governedDeliverableComposition: true,
      templateBinaryStorage: "PACKAGED_EOS_DEFAULT_PLUS_METADATA_POLICY",
      artifactBinaryStore: "ArtifactBinaryStore",
      objectStorageBackend: "EXISTING_IMPLEMENTED",
      objectStorageProvider: "SUPABASE_STORAGE",
      newWriteStorage: objectStorageWritesEnabled() ? "OBJECT_STORAGE" : "LEGACY_RELATIONAL",
      publicBucketRequired: false,
      newTemplateDomainCreated: false,
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

  async openBinary(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    const row = await this.get(commerce, tenantId, id);
    if (!row) return null;
    const pointer = pointerFromArtifact(row);
    if (pointer.storageKind === "LEGACY_RELATIONAL" && row.contentBase64) {
      if (this.binaryStore instanceof LegacyRelationalArtifactBinaryStore) {
        this.binaryStore.loadFromBase64(pointer, row.contentBase64);
      }
      if (this.binaryStore instanceof RoutingArtifactBinaryStore) {
        this.binaryStore.loadFromBase64(pointer, row.contentBase64);
      }
    }
    const bytes = await this.binaryStore.openRead(pointer, {
      tenantId: row.tenantId,
      workspaceId: row.workspaceId,
      projectId: row.projectId,
    });
    return { row, bytes, pointer };
  }

  async listTemplatePolicies(commerce: CommerceExecutionContext, tenantId: string) {
    assertEngineeringService(commerce, "artifact.template.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const [rows, fallback] = await Promise.all([this.policies.listPolicies(workspaceId), this.policies.getFallback(workspaceId)]);
    return {
      policies: rows.filter((row) => row.tenantId === tenantId),
      fallbackPolicy: fallback?.fallbackPolicy ?? DEFAULT_TEMPLATE_FALLBACK_POLICY,
      packagedDefaults: listArtifactTemplates().map((row) => ({
        code: row.code,
        version: row.version,
        name: row.name,
        artifactType: row.artifactType,
        sourceClass: row.sourceClass,
      })),
    };
  }

  async saveTemplatePolicy(commerce: CommerceExecutionContext, tenantId: string, row: ArtifactTemplatePolicyRecord) {
    assertEngineeringService(commerce, "artifact.template.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (row.tenantId !== tenantId || row.workspaceId !== workspaceId) throw new Error("scope_denied");
    return this.policies.savePolicy(row);
  }

  async saveFallbackPolicy(commerce: CommerceExecutionContext, tenantId: string, row: TenantTemplateFallbackPolicy) {
    assertEngineeringService(commerce, "artifact.template.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (row.tenantId !== tenantId || row.workspaceId !== workspaceId) throw new Error("scope_denied");
    return this.policies.saveFallback(row);
  }

  async resolveTemplate(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { workPlanId: string; artifactType?: ArtifactType; templateCode?: string; templateVersion?: string },
  ) {
    assertEngineeringService(commerce, "work.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const plan = await this.loadPlan(input.workPlanId);
    if (!plan || plan.tenantId !== tenantId || plan.workspaceId !== workspaceId) throw new Error("not_found");
    const [policies, fallback] = await Promise.all([this.policies.listPolicies(workspaceId), this.policies.getFallback(workspaceId)]);
    return resolveEngineeringArtifactTemplate({
      plan,
      artifactType: input.artifactType,
      requestedCode: input.templateCode,
      requestedVersion: input.templateVersion,
      policies: policies.filter((row) => row.tenantId === tenantId),
      fallbackPolicy: fallback?.fallbackPolicy ?? DEFAULT_TEMPLATE_FALLBACK_POLICY,
    });
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
    const [policies, fallback] = await Promise.all([this.policies.listPolicies(workspaceId), this.policies.getFallback(workspaceId)]);
    const resolution = resolveEngineeringArtifactTemplate({
      plan,
      artifactType: input.artifactType,
      requestedCode: input.templateCode,
      requestedVersion: input.templateVersion,
      policies: policies.filter((row) => row.tenantId === tenantId),
      fallbackPolicy: fallback?.fallbackPolicy ?? DEFAULT_TEMPLATE_FALLBACK_POLICY,
    });
    if (!resolution.ok || !resolution.template) {
      const run = {
        id: "blocked-template",
        tenantId: plan.tenantId,
        workspaceId: plan.workspaceId,
        projectId: plan.projectId,
        workPlanId: plan.id,
        templateCode: input.templateCode ?? input.artifactType ?? "UNRESOLVED",
        templateVersion: input.templateVersion ?? "",
        artifactType: input.artifactType ?? resolution.template?.artifactType ?? "TECHNICAL_MEMORANDUM",
        outputFormat: "DOCX" as const,
        requestedBy: commerce.actorUserId ?? null,
        generatedAt: new Date().toISOString(),
        workPlanInputFingerprint: plan.inputFingerprint,
        artifactId: null,
        status: "GENERATION_BLOCKED" as const,
        warnings: [] as string[],
        explanation: resolution.reason,
        metrics: { sourceRefsConsumed: 0, requirementsConsumed: 0, durationMs: 0, byteSize: 0, sheetOrSlideCount: 0 },
      };
      return { ok: false as const, run, artifact: null, resolution };
    }
    const matchedPolicy = policies.find((row) => row.id === resolution.policyId);
    if (matchedPolicy?.binarySourceKind === "SHAREPOINT_MANAGED") {
      const sourceId = matchedPolicy.externalSourceRefId;
      const format = resolution.template.outputFormat === "PPTX" || resolution.template.outputFormat === "XLSX" || resolution.template.outputFormat === "DOCX"
        ? resolution.template.outputFormat
        : "XLSX";
      const fetched = sourceId
        ? await this.templateBinary?.retrieve(commerce, tenantId, { sourceId, expectedFormat: format })
        : { ok: false as const, reason: "TEMPLATE_UNAVAILABLE" };
      if (!fetched?.ok) {
        const unavailable = {
          ...resolution,
          ok: false,
          state: "TEMPLATE_UNAVAILABLE" as const,
          reason: "TEMPLATE_UNAVAILABLE: SharePoint-backed official template could not be retrieved. Tenant policy fails closed. No silent EOS default.",
        };
        return {
          ok: false as const,
          run: {
            id: "blocked-template",
            tenantId: plan.tenantId,
            workspaceId: plan.workspaceId,
            projectId: plan.projectId,
            workPlanId: plan.id,
            templateCode: matchedPolicy.templateCode,
            templateVersion: matchedPolicy.templateVersion,
            artifactType: matchedPolicy.artifactType,
            outputFormat: format,
            requestedBy: commerce.actorUserId ?? null,
            generatedAt: new Date().toISOString(),
            workPlanInputFingerprint: plan.inputFingerprint,
            artifactId: null,
            status: "GENERATION_BLOCKED" as const,
            warnings: [] as string[],
            explanation: unavailable.reason,
            metrics: { sourceRefsConsumed: 0, requirementsConsumed: 0, durationMs: 0, byteSize: 0, sheetOrSlideCount: 0 },
          },
          artifact: null,
          resolution: unavailable,
        };
      }
    }
    const template = resolution.template;
    await this.recordEvent?.(commerce, tenantId, {
      eventType: "ARTIFACT_GENERATION_STARTED",
      projectId: plan.projectId,
      planId: plan.id,
      actorId: commerce.actorUserId ?? null,
    });
    const previous = (await this.store.listArtifacts(workspaceId, plan.id)).filter(
      (row) => row.tenantId === tenantId && row.templateCode === template.code && row.status !== "SUPERSEDED",
    );
    const composedTypes = new Set<ArtifactType>(["DESIGN_REPORT", "QUANTITY_SCHEDULE"]);
    const composeMemo = template.artifactType === "TECHNICAL_MEMORANDUM" && template.code === "EAT-TECH-MEMO";
    const shouldCompose = composedTypes.has(template.artifactType) || composeMemo;
    const mtoContext = shouldCompose && this.mtoLoader
      ? await this.mtoLoader(plan.id).catch(() => null)
      : null;
    const composition = shouldCompose
      ? composeDeliverableSource({
          plan,
          templateCode: template.code,
          templateVersion: template.version,
          artifactType: template.artifactType,
          snapshot: mtoContext?.current ?? null,
          previousSnapshot: mtoContext?.previous ?? null,
        })
      : null;
    const result = await generateEngineeringArtifact({
      plan,
      template,
      requestedBy: commerce.actorUserId ?? null,
      projectCode: input.projectCode,
      resolution,
      branding: resolution.branding,
      composition,
      previousArtifactId: previous[0]?.id ?? null,
    });
    await this.store.saveRun(result.run);
    if (!result.ok) {
      await this.recordEvent?.(commerce, tenantId, {
        eventType: "ARTIFACT_GENERATION_FAILED",
        projectId: plan.projectId,
        planId: plan.id,
        actorId: commerce.actorUserId ?? null,
      });
      return { ...result, resolution };
    }
    let toSave = result.artifact;
    const writeObject = !(this.binaryStore instanceof LegacyRelationalArtifactBinaryStore);
    if (writeObject) {
      const bytes = Uint8Array.from(Buffer.from(result.artifact.contentBase64, "base64"));
      const stored = await this.binaryStore.put(pointerFromArtifact(result.artifact), bytes);
      toSave = {
        ...result.artifact,
        contentBase64: "",
        storageKind: stored.storageKind,
        objectKey: stored.objectKey,
        contentSizeBytes: stored.contentSizeBytes,
        contentSha256: stored.contentSha256,
        contentType: stored.contentType,
        storageVersion: stored.storageVersion,
        migrationState: stored.migrationState === "IN_PROGRESS" ? "VERIFIED" : stored.migrationState,
      };
    }
    const saved = await this.store.saveArtifact(toSave);
    for (const older of previous) {
      await this.store.saveArtifact({ ...older, status: "SUPERSEDED", supersededById: saved.id });
    }
    await this.recordEvent?.(commerce, tenantId, {
      eventType: previous.length ? "ARTIFACT_REGENERATED" : "ARTIFACT_GENERATED",
      projectId: plan.projectId,
      planId: plan.id,
      artifactId: saved.id,
      actorId: commerce.actorUserId ?? null,
    });
    return {
      ok: true as const,
      run: result.run,
      artifact: saved.storageKind === "OBJECT_STORAGE" ? { ...saved, contentBase64: "" } : saved,
      deliverable: composeDeliverableFromArtifact(),
      thread: artifactThreadGraph({
        tenantId: saved.tenantId,
        workspaceId: saved.workspaceId,
        projectId: saved.projectId,
        artifactId: saved.id,
        workPlanId: plan.id,
        plan,
        previousArtifactId: previous[0]?.id ?? null,
        mtoSnapshotId: composition?.manifest.mtoSnapshotId ?? null,
      }),
      resolution,
    };
  }

  compareContext(
    artifactFingerprint: string,
    planFingerprint: string,
    extras?: {
      artifactMtoFingerprint?: string | null;
      currentMtoFingerprint?: string | null;
      artifactCompositionFingerprint?: string | null;
      currentCompositionFingerprint?: string | null;
    },
  ) {
    return compareDeliverableStaleness({
      artifactPlanFingerprint: artifactFingerprint,
      currentPlanFingerprint: planFingerprint,
      artifactMtoFingerprint: extras?.artifactMtoFingerprint,
      currentMtoFingerprint: extras?.currentMtoFingerprint,
      artifactCompositionFingerprint: extras?.artifactCompositionFingerprint,
      currentCompositionFingerprint: extras?.currentCompositionFingerprint,
    });
  }

  compareArtifact(artifact: GeneratedEngineeringArtifact, planFingerprint: string, currentMtoFingerprint?: string | null) {
    return this.compareContext(artifact.provenance.inputFingerprint, planFingerprint, {
      artifactMtoFingerprint: artifact.provenance.mtoFingerprint,
      currentMtoFingerprint,
      artifactCompositionFingerprint: artifact.provenance.compositionFingerprint,
    });
  }

  downloadMeta() {
    return { localRecursiveScan: "PROHIBITED", autoReingest: false, personalFilesOutsideEos: true };
  }
}

export function createTestArtifactService(
  store = createMemoryArtifactStore(),
  loadPlan: (id: string) => Promise<EngineeringWorkPlan | null> = async () => null,
  recorder?: ArtifactEventRecorder,
  policyStore: TemplatePolicyStore = createMemoryTemplatePolicyStore(),
  binaryStore?: ArtifactBinaryStore,
) {
  return new EngineeringArtifactAutomationService(
    { from() { return this; } } as never,
    store,
    loadPlan,
    recorder,
    policyStore,
    undefined,
    binaryStore ?? new LegacyRelationalArtifactBinaryStore(),
  );
}

export { ARTIFACT_TEMPLATES };
