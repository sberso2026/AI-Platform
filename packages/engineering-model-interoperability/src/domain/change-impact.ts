/**
 * Phase 13B — Change-impact records for federated model versions (ids-only signals).
 */

export type EngineeringModelChangeImpactSeverity =
  | "info"
  | "low"
  | "medium"
  | "high"
  | "unknown";

export type EngineeringModelChangeImpact = {
  kind: "engineering_model_change_impact";
  owner: "engineering_model_interoperability";
  changeImpactId: string;
  tenantId: string;
  workspaceId: string;
  modelRefId: string;
  fromModelVersionId?: string;
  toModelVersionId?: string;
  summary: string;
  severity: EngineeringModelChangeImpactSeverity;
  affectedElementCount?: number;
  affectedMappingCount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
