import { randomUUID } from "node:crypto";
import type { ArtifactTemplatePolicyRecord, TenantTemplateFallbackPolicy, TemplateFallbackPolicy } from "./template-policy";
import { DEFAULT_TEMPLATE_FALLBACK_POLICY } from "./template-policy";

export type TemplatePolicyStore = {
  listPolicies(workspaceId: string): Promise<ArtifactTemplatePolicyRecord[]>;
  getPolicy(id: string): Promise<ArtifactTemplatePolicyRecord | null>;
  savePolicy(row: ArtifactTemplatePolicyRecord): Promise<ArtifactTemplatePolicyRecord>;
  getFallback(workspaceId: string): Promise<TenantTemplateFallbackPolicy | null>;
  saveFallback(row: TenantTemplateFallbackPolicy): Promise<TenantTemplateFallbackPolicy>;
};

export function createMemoryTemplatePolicyStore(): TemplatePolicyStore {
  const policies = new Map<string, ArtifactTemplatePolicyRecord>();
  const fallbacks = new Map<string, TenantTemplateFallbackPolicy>();
  return {
    async listPolicies(workspaceId) {
      return [...policies.values()].filter((row) => row.workspaceId === workspaceId);
    },
    async getPolicy(id) {
      return policies.get(id) ?? null;
    },
    async savePolicy(row) {
      const next = { ...row, updatedAt: new Date().toISOString() };
      policies.set(next.id, next);
      return next;
    },
    async getFallback(workspaceId) {
      return fallbacks.get(workspaceId) ?? null;
    },
    async saveFallback(row) {
      const next = { ...row, updatedAt: new Date().toISOString() };
      fallbacks.set(next.workspaceId, next);
      return next;
    },
  };
}

export function policyRecord(input: Partial<ArtifactTemplatePolicyRecord> & Pick<ArtifactTemplatePolicyRecord, "tenantId" | "workspaceId" | "artifactType" | "templateCode" | "name" | "sourceClass" | "packagedAssetKey">): ArtifactTemplatePolicyRecord {
  const now = new Date().toISOString();
  return {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId ?? null,
    artifactType: input.artifactType,
    templateCode: input.templateCode,
    templateVersion: input.templateVersion ?? "1.0.0",
    name: input.name,
    sourceClass: input.sourceClass,
    status: input.status ?? "ACTIVE",
    disciplines: input.disciplines ?? [],
    workTypes: input.workTypes ?? [],
    lifecycleStages: input.lifecycleStages ?? [],
    packagedAssetKey: input.packagedAssetKey,
    binarySourceKind: input.binarySourceKind ?? "PACKAGED",
    externalSourceRefId: input.externalSourceRefId ?? null,
    presentationKind: input.presentationKind ?? "COMBINED",
    branding: input.branding ?? {},
    fallbackPolicy: input.fallbackPolicy ?? DEFAULT_TEMPLATE_FALLBACK_POLICY,
    active: input.active ?? true,
    createdBy: input.createdBy ?? null,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };
}

export function fallbackRecord(
  tenantId: string,
  workspaceId: string,
  fallbackPolicy: TemplateFallbackPolicy = DEFAULT_TEMPLATE_FALLBACK_POLICY,
): TenantTemplateFallbackPolicy {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    tenantId,
    workspaceId,
    fallbackPolicy,
    createdAt: now,
    updatedAt: now,
  };
}
