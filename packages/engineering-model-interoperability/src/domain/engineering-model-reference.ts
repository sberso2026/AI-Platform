/**
 * Phase 13B — Engineering model / version reference types.
 */

export type EngineeringModelFormatFamily =
  | "ifc"
  | "native"
  | "exchange"
  | "unknown";

export type EngineeringModelReferenceStatus =
  | "draft"
  | "ingested"
  | "federated"
  | "superseded"
  | "rejected"
  | "unknown";

export type EngineeringModelReference = {
  kind: "engineering_model_reference";
  owner: "source_client_engineering_application";
  federationOwner: "engineering_model_interoperability";
  modelRefId: string;
  tenantId: string;
  workspaceId: string;
  providerKey: string;
  externalModelId: string;
  displayName?: string;
  formatFamily: EngineeringModelFormatFamily;
  status: EngineeringModelReferenceStatus;
  /** Platform Files string ref — never a PG binary blob. */
  platformFileRef?: string;
  projectId?: string;
  assetId?: string;
  spatialReferenceId?: string;
  twinId?: string;
  schemaHint?: string;
  notes?: string;
  rtbOwned: false;
  federated: true;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type EngineeringModelVersion = {
  kind: "engineering_model_version";
  owner: "source_client_engineering_application";
  federationOwner: "engineering_model_interoperability";
  modelVersionId: string;
  modelRefId: string;
  tenantId: string;
  workspaceId: string;
  versionLabel: string;
  platformFileRef?: string;
  schemaId?: string;
  parserVersion?: string;
  contentSha256?: string;
  elementCount?: number;
  ingestedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
