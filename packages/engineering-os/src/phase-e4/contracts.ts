/**
 * Phase E4 — Enterprise Connector Framework (vendor-neutral, read-first).
 * ESSENTIAL remains fully operational with zero connectors.
 * External system record ≠ Engineering OS record.
 */

import {
  E0ForbidsDuplicatePiIiOwnership,
  E0ForbidsForcedExternalDependency,
  E0PreservesCertifiedModuleOwnership,
  EngineeringIntelligenceLayerContractLocked,
  EnterpriseConnectorsOptional,
  ExternalRecordNotEqualEngineeringOsRecord,
  NoMandatorySapM365CopilotDependency,
  PreferReferencesMappingsProvenance,
  supportsZeroConnectorNativeDeployment,
} from "../phase-e0/contracts";
import {
  PhaseE1DoesNotOwnKgOrMemory,
  PhaseE1DoesNotOwnPiIiAiLogic,
  PhaseE1ExperienceFoundationComplete,
} from "../phase-e1/contracts";
import {
  PhaseE2ComposesExistingSearch,
  PhaseE2GroundedSearchComplete,
  PhaseE2NativeZeroConnector,
  PhaseE2NoFabricatedEvidence,
} from "../phase-e2/contracts";
import {
  PhaseE3CanonicalContextComplete,
  PhaseE3DoesNotOwnConnectors,
  PhaseE3NoSecondKnowledgeGraph,
} from "../phase-e3/contracts";

export const ENGINEERING_OS_EVOLUTION_PHASE_E4 = "E4" as const;
export const ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E4 = "0.1.0-e4" as const;

export const PhaseE4ConnectorFrameworkComplete = true as const;
export const PhaseE4ReadFirst = true as const;
export const PhaseE4EssentialZeroConnector = true as const;
export const PhaseE4ExternalWritesDisabled = true as const;
export const PhaseE4DoesNotOwnExternalSor = true as const;
export const PhaseE4DoesNotOwnKgOrMemory = true as const;
export const PhaseE4DoesNotOwnPiIiAiLogic = true as const;
export const PhaseE4NoVendorHardDependency = true as const;
export const PhaseE4SecretsViaPlatformOnly = true as const;
export const PhaseE4FlowsThroughE3Identity = true as const;
export const PhaseE4NoSilentCanonicalCreate = true as const;
export const PhaseE4ConnectorFailureDegradesGracefully = true as const;

/** Future federation boundary — contracts only; Copilot not required. */
export const EngineeringCopilotFederationBoundary = {
  nativeAssistantRemainsPrimary: true,
  microsoftCopilotRequired: false,
  corporateAiMayCallEngineeringOsApisLater: true,
  e4DefinesContractsOnly: true,
} as const;

/** Logical connector families. */
export const EngineeringConnectorTypes = [
  "DOCUMENT_REPOSITORY",
  "COLLABORATION",
  "EMAIL",
  "EAM_CMMS",
  "DATA_PLATFORM",
  "FILE_IMPORT",
  "GENERIC_API",
  "IDENTITY_PROVIDER",
  "NATIVE_MOCK",
] as const;
export type EngineeringConnectorType =
  | (typeof EngineeringConnectorTypes)[number]
  | string;

/** Adapter identifiers — not domain contracts. */
export const EngineeringConnectorProviders = [
  "NativeMock",
  "Microsoft365",
  "SharePoint",
  "Teams",
  "Outlook",
  "MicrosoftFabric",
  "SAP",
  "IBMMaximo",
  "IFS",
  "Pronto",
  "GoogleWorkspace",
  "GoogleDrive",
  "GenericREST",
  "CSV",
  "Excel",
  "FileSystem",
] as const;
export type EngineeringConnectorProvider =
  | (typeof EngineeringConnectorProviders)[number]
  | string;

export const EngineeringConnectorStatuses = [
  "NOT_CONFIGURED",
  "CONFIGURED",
  "CONNECTING",
  "READY",
  "DEGRADED",
  "ERROR",
  "DISABLED",
] as const;
export type EngineeringConnectorStatus =
  (typeof EngineeringConnectorStatuses)[number];

export const EngineeringConnectorHealthStates = [
  "HEALTHY",
  "DEGRADED",
  "UNAVAILABLE",
  "AUTH_ERROR",
  "RATE_LIMITED",
  "STALE",
  "UNKNOWN",
] as const;
export type EngineeringConnectorHealthState =
  (typeof EngineeringConnectorHealthStates)[number];

export const EngineeringConnectorCapabilities = [
  "SEARCH",
  "FETCH",
  "LIST",
  "INCREMENTAL_SYNC",
  "WEBHOOK",
  "IDENTITY_LOOKUP",
  "DOCUMENT_CONTENT",
  "DOCUMENT_METADATA",
  "EMAIL",
  "COLLABORATION",
  "ASSET_MASTER",
  "MAINTENANCE_HISTORY",
  "WORK_ORDER_READ",
  "DATA_QUERY",
  "FILE_IMPORT",
] as const;
export type EngineeringConnectorCapability =
  | (typeof EngineeringConnectorCapabilities)[number]
  | string;

export const EngineeringConnectorAuthModes = [
  "OAUTH2",
  "SERVICE_ACCOUNT",
  "API_KEY",
  "TOKEN",
  "CLIENT_CREDENTIALS",
  "MANAGED_IDENTITY",
  "FILE_MANUAL_IMPORT",
  "NONE",
] as const;
export type EngineeringConnectorAuthMode =
  (typeof EngineeringConnectorAuthModes)[number];

export const EngineeringPermissionAppliedStates = [
  "true",
  "false",
  "unknown",
] as const;
export type EngineeringPermissionAppliedState =
  | true
  | false
  | "unknown";

export const EngineeringConnectorMaturity = [
  "contract_only",
  "adapter_implemented",
  "live_connection_certified",
] as const;
export type EngineeringConnectorMaturity =
  (typeof EngineeringConnectorMaturity)[number];

export type EngineeringConnectorHealth = {
  state: EngineeringConnectorHealthState;
  message?: string;
  checkedAt: string;
  latencyMs?: number;
};

export type EngineeringConnector = {
  connectorId: string;
  tenantId: string;
  workspaceId?: string | null;
  connectorType: EngineeringConnectorType;
  provider: EngineeringConnectorProvider;
  displayName: string;
  version: string;
  status: EngineeringConnectorStatus;
  capabilities: EngineeringConnectorCapability[];
  authenticationMode: EngineeringConnectorAuthMode;
  /** Secret/config reference IDs only — never plaintext secrets. */
  configurationRef?: string | null;
  credentialSecretId?: string | null;
  health: EngineeringConnectorHealth;
  maturity: EngineeringConnectorMaturity;
  lastSuccessfulOperation?: string | null;
  lastSync?: string | null;
  createdAt: string;
  updatedAt: string;
  /** Explicit when source permissions cannot be faithfully mapped. */
  accessModel?: "source_delegated" | "service_account_scoped" | "admin_restricted" | "unknown";
};

export type EngineeringExternalRecord = {
  externalId: string;
  externalType: string;
  sourceSystem: string;
  title: string;
  projectRef?: string | null;
  assetRef?: string | null;
  metadata?: Record<string, unknown>;
  contentRef?: string | null;
  content?: string | null;
  revision?: string | null;
  authorityStatus?: string | null;
  updatedAt?: string | null;
  retrievedAt: string;
  provenance: {
    connectorId: string;
    provider: string;
    mechanism: "CONNECTOR_READ" | "CONNECTOR_SYNC" | "FILE_IMPORT";
    operation: string;
  };
  permissionsApplied: EngineeringPermissionAppliedState;
  deepLink?: string | null;
  freshness?: {
    retrievedAt: string;
    sourceUpdatedAt?: string | null;
    lastSyncAt?: string | null;
  };
  /** Malicious/unsafe content markers after sanitisation. */
  sanitised?: boolean;
  revoked?: boolean;
};

export type EngineeringConnectorSearchResult = {
  records: EngineeringExternalRecord[];
  cursor?: string | null;
  source: {
    connectorId: string;
    provider: string;
    sourceSystem: string;
  };
  capabilitiesUsed: EngineeringConnectorCapability[];
  queryScope: string;
  retrievedAt: string;
  timingMs?: {
    queryMs: number;
    normalizeMs?: number;
  };
  limitations?: string[];
};

export type EngineeringConnectorSyncState = {
  connectorId: string;
  tenantId: string;
  lastCursor?: string | null;
  lastSuccessfulSync?: string | null;
  lastAttempt?: string | null;
  recordsProcessed: number;
  recordsFailed: number;
  status: "IDLE" | "RUNNING" | "SUCCESS" | "PARTIAL" | "FAILED" | "STALE";
  freshness?: string | null;
};

/**
 * Future controlled write — DISABLED in E4.
 * Do not implement autonomous external writes.
 */
export type EngineeringExternalWriteProposal = {
  proposalId: string;
  tenantId: string;
  connectorId: string;
  operation: string;
  payloadRef: string;
  status: "DISABLED_IN_E4" | "PROPOSED" | "APPROVED" | "REJECTED" | "EXECUTED" | "CONFIRMED";
  policyCheckRequired: true;
  humanApprovalRequired: true;
  createdAt: string;
};

export type EngineeringConnectorOperationTiming = {
  selectionMs: number;
  queryMs: number;
  normalizeMs: number;
  mappingMs: number;
  totalMs: number;
};

export function createDisabledWriteProposal(input: {
  tenantId: string;
  connectorId: string;
  operation: string;
}): EngineeringExternalWriteProposal {
  return {
    proposalId: `write-disabled:${input.connectorId}:${Date.now()}`,
    tenantId: input.tenantId,
    connectorId: input.connectorId,
    operation: input.operation,
    payloadRef: "none",
    status: "DISABLED_IN_E4",
    policyCheckRequired: true,
    humanApprovalRequired: true,
    createdAt: new Date().toISOString(),
  };
}

export function getPhaseE4Declaration() {
  return {
    evolutionPhase: ENGINEERING_OS_EVOLUTION_PHASE_E4,
    contractVersion: ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E4,
    PhaseE4ConnectorFrameworkComplete,
    PhaseE4ReadFirst,
    PhaseE4EssentialZeroConnector,
    PhaseE4ExternalWritesDisabled,
    PhaseE4DoesNotOwnExternalSor,
    PhaseE4DoesNotOwnKgOrMemory,
    PhaseE4DoesNotOwnPiIiAiLogic,
    PhaseE4NoVendorHardDependency,
    PhaseE4SecretsViaPlatformOnly,
    PhaseE4FlowsThroughE3Identity,
    PhaseE4NoSilentCanonicalCreate,
    PhaseE4ConnectorFailureDegradesGracefully,
    connectorTypes: EngineeringConnectorTypes,
    providers: EngineeringConnectorProviders,
    capabilities: EngineeringConnectorCapabilities,
    authModes: EngineeringConnectorAuthModes,
    healthStates: EngineeringConnectorHealthStates,
    statuses: EngineeringConnectorStatuses,
  } as const;
}

export function assertPhaseE4Invariants(input: {
  ProjectIntelligenceV1Intact: boolean;
  InspectionIntelligenceV1Intact: boolean;
  AssetIntelligenceV1Intact: boolean;
  ProjectControlsV1Intact: boolean;
  DigitalTwinV1Intact: boolean;
  EngineeringModelInteroperabilityV1Intact: boolean;
  privateCrossModuleCouplingDetected: boolean;
  duplicateAssetOwnershipDetected: boolean;
  EngineeringOSProductBoundaryLocked: boolean;
  essentialOperatesWithConnectorsDisabled: boolean;
}): void {
  if (
    !EngineeringIntelligenceLayerContractLocked ||
    !PhaseE1ExperienceFoundationComplete ||
    !PhaseE2GroundedSearchComplete ||
    !PhaseE3CanonicalContextComplete
  ) {
    throw new Error("E4 requires E0–E3 contracts locked");
  }
  if (!EnterpriseConnectorsOptional || !supportsZeroConnectorNativeDeployment) {
    throw new Error("E4 requires optional connectors / zero-connector ESSENTIAL");
  }
  if (!PhaseE4EssentialZeroConnector || !input.essentialOperatesWithConnectorsDisabled) {
    throw new Error("E4 ESSENTIAL must operate with connectors disabled");
  }
  if (
    !PhaseE4NoVendorHardDependency ||
    !NoMandatorySapM365CopilotDependency ||
    !E0ForbidsForcedExternalDependency
  ) {
    throw new Error("E4 forbids vendor hard dependency");
  }
  if (
    !ExternalRecordNotEqualEngineeringOsRecord ||
    !PreferReferencesMappingsProvenance ||
    !PhaseE4DoesNotOwnExternalSor
  ) {
    throw new Error("E4 requires external ≠ EOS SoR principle");
  }
  if (!PhaseE4ExternalWritesDisabled || !PhaseE4ReadFirst) {
    throw new Error("E4 is read-first; external writes disabled");
  }
  if (
    !PhaseE4DoesNotOwnKgOrMemory ||
    !PhaseE3NoSecondKnowledgeGraph ||
    !PhaseE1DoesNotOwnKgOrMemory
  ) {
    throw new Error("E4 must not own KG/Memory");
  }
  if (!PhaseE4DoesNotOwnPiIiAiLogic || !PhaseE1DoesNotOwnPiIiAiLogic) {
    throw new Error("E4 must not own PI/II/AI logic");
  }
  if (!PhaseE3DoesNotOwnConnectors && !PhaseE4ConnectorFrameworkComplete) {
    throw new Error("E4 owns connector framework contracts only");
  }
  if (!PhaseE2ComposesExistingSearch || !PhaseE2NoFabricatedEvidence || !PhaseE2NativeZeroConnector) {
    throw new Error("E4 must preserve E2 native/zero-connector fallback");
  }
  if (!E0PreservesCertifiedModuleOwnership || !E0ForbidsDuplicatePiIiOwnership) {
    throw new Error("E4 ownership regression");
  }
  if (
    !input.ProjectIntelligenceV1Intact ||
    !input.InspectionIntelligenceV1Intact ||
    !input.AssetIntelligenceV1Intact ||
    !input.ProjectControlsV1Intact ||
    !input.DigitalTwinV1Intact ||
    !input.EngineeringModelInteroperabilityV1Intact
  ) {
    throw new Error("E4 regression: certified modules");
  }
  if (input.privateCrossModuleCouplingDetected || input.duplicateAssetOwnershipDetected) {
    throw new Error("E4 regression: coupling/ownership");
  }
  if (!input.EngineeringOSProductBoundaryLocked) {
    throw new Error("E4 requires product boundary locked");
  }
  if (!PhaseE4SecretsViaPlatformOnly) {
    throw new Error("E4 must reuse platform secret manager");
  }
  if (!PhaseE4FlowsThroughE3Identity || !PhaseE4NoSilentCanonicalCreate) {
    throw new Error("E4 must flow through E3 identity without silent create");
  }
}
