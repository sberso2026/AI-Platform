/**
 * Phase 13B — Engineering model element references (ids + metadata; no geometry blobs).
 */

export type EngineeringModelElementReference = {
  kind: "engineering_model_element_reference";
  owner: "source_client_engineering_application";
  federationOwner: "engineering_model_interoperability";
  elementRefId: string;
  modelRefId: string;
  modelVersionId?: string;
  tenantId: string;
  workspaceId: string;
  externalElementId: string;
  globalId?: string;
  elementKind?: string;
  ifcEntityType?: string;
  displayName?: string;
  storeyName?: string;
  sourceProperties?: Record<string, string | number | boolean | null>;
  spatialReferenceId?: string;
  assetId?: string;
  twinId?: string;
  createdAt: string;
  updatedAt: string;
};
