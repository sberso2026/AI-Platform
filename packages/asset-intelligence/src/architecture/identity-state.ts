/**
 * Phase 10A — identity vs intelligence state separation (architecture lock).
 */

export type AssetIdentityReference = {
  tenantId: string;
  workspaceId: string;
  assetId: string;
  owner: "engineering_os_shared_domain";
  equipmentId?: string;
  componentId?: string;
  locationId?: string;
};

/** @deprecated Prefer composeAssetSnapshot / domain AssetSnapshot (Phase 10B). */
export type AssetSnapshotIdentityOnly = {
  identity: AssetIdentityReference;
  asOf: string;
  registerVersion?: string;
};

export type Provenance = {
  sourceSystem: string;
  observedAt: string;
  method?: string;
  confidence?: number;
  evidenceRefs?: string[];
  modelId?: string;
  policyId?: string;
  reviewedBy?: string;
  approvedAt?: string;
};

export type AssetIntelligenceStateBase = {
  assetId: string;
  stateId: string;
  recordedAt: string;
  provenance: Provenance;
  silentIdentityMutationForbidden: true;
};

export type AssetConditionState = AssetIntelligenceStateBase & {
  kind: "condition";
  conditionRating?: string;
  conditionIndex?: number;
  conditionClass?: string;
  conditionConfidence?: number;
  conditionTrend?: string;
  conditionSource?: string;
};

export type AssetCriticalityState = AssetIntelligenceStateBase & {
  kind: "criticality";
  criticalityRating?: string;
  safetyCriticality?: string;
  productionCriticality?: string;
  environmentalCriticality?: string;
  financialCriticality?: string;
  operationalCriticality?: string;
  regulatoryCriticality?: string;
};

export type AssetReliabilityState = AssetIntelligenceStateBase & {
  kind: "reliability";
  availability?: number;
  failureRate?: number;
  mtbf?: number;
  mttr?: number;
  probabilityOfFailure?: number;
  dataWindow?: string;
};

export type AssetRiskState = AssetIntelligenceStateBase & {
  kind: "risk_intelligence";
  riskScore?: number;
  riskSignalId?: string;
  /** Canonical Engineering Risk Register remains separate. */
  canonicalRiskRegisterOwnedBy: "engineering_core";
};

export type AssetLifecycleIntelligenceState = AssetIntelligenceStateBase & {
  kind: "lifecycle_intelligence";
  stage:
    | "design"
    | "procurement"
    | "fabrication"
    | "construction"
    | "commissioning"
    | "operation"
    | "inspection"
    | "maintenance"
    | "upgrade"
    | "mothball"
    | "decommissioning"
    | "retirement";
};

export type AssetIntelligenceState =
  | AssetConditionState
  | AssetCriticalityState
  | AssetReliabilityState
  | AssetRiskState
  | AssetLifecycleIntelligenceState;
