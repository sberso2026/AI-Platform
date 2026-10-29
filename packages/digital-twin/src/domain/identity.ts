/**
 * Phase 12B — Digital Twin identity domain types.
 *
 * Twin references canonical entity only — never duplicates Asset or Project
 * identity fields. Optional kernelTwinId links preserved kernel digital_twins.id.
 */

export const CANONICAL_ENTITY_TYPES = [
  "asset",
  "project",
  "facility",
  "structure",
  "location",
  "system",
  "component",
] as const;

export type CanonicalEntityType = (typeof CANONICAL_ENTITY_TYPES)[number];

export const TWIN_STATUSES = [
  "draft",
  "pending_review",
  "approved",
  "rejected",
  "published",
  "archived",
] as const;

export type TwinStatus = (typeof TWIN_STATUSES)[number];

export const TWIN_TYPES = [
  "reference",
  "operational",
  "design",
  "as_built",
  "reserved",
] as const;

export type TwinType = (typeof TWIN_TYPES)[number];

/** Reference to the canonical engineering entity this twin represents. */
export type TwinTargetReference = {
  canonicalEntityType: CanonicalEntityType;
  canonicalEntityId: string;
};

/** Lightweight twin handle for cross-module references. */
export type DigitalTwinReference = {
  twinId: string;
  tenantId: string;
  workspaceId: string;
  target: TwinTargetReference;
  status: TwinStatus;
};

/** Version metadata for a twin identity record. */
export type TwinVersion = {
  twinVersion: number;
  configurationVersion: number;
};

/**
 * Full twin identity. References canonical entity — does NOT embed asset/project
 * identity fields (name, code, lifecycle, etc.).
 */
export type TwinIdentity = {
  twinId: string;
  tenantId: string;
  workspaceId: string;
  target: TwinTargetReference;
  twinType: TwinType;
  version: TwinVersion;
  status: TwinStatus;
  /** Optional REBIND link to preserved kernel digital_twins.id */
  kernelTwinId?: string;
  reviewWorkflowInstanceId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  publishedAt?: string;
  // Forbid locks persisted with identity
  mutatesCanonicalIdentity: false;
  duplicatesAssetFields: false;
  liveTelemetryBound: false;
  simulationExecuted: false;
  runtimeSyncEnabled: false;
  physicalActuationEnabled: false;
};

export function twinTargetKey(target: TwinTargetReference): string {
  return `${target.canonicalEntityType}:${target.canonicalEntityId}`;
}

export function assertNoDuplicatedIdentityFields(input: Record<string, unknown>): void {
  const forbidden = [
    "assetName",
    "assetCode",
    "projectName",
    "projectCode",
    "lifecycleState",
    "serialNumber",
    "manufacturerPartNumber",
  ];
  for (const field of forbidden) {
    if (field in input && input[field] !== undefined) {
      throw new Error(`twin_identity_may_not_duplicate_canonical_field:${field}`);
    }
  }
}
