/**
 * Phase 13A — Draft public contracts (0.1.0-draft ONLY — NOT 1.0.0).
 *
 * Interfaces / type shapes for discovery. No production runtime adapters.
 */

import { PUBLIC_CONTRACT_VERSION } from "../version";

export const ENGINEERING_INTEROP_PUBLIC_CONTRACT_FAMILIES = [
  "EngineeringModelReference",
  "EngineeringModelAdapter",
  "EngineeringModelElementReference",
  "EngineeringAnalysisResultReference",
  "ExternalSolverProviderReference",
] as const;

export type EngineeringInteropPublicContractFamily =
  (typeof ENGINEERING_INTEROP_PUBLIC_CONTRACT_FAMILIES)[number];

export type EngineeringModelReference = {
  modelRefId: string;
  providerKey: string;
  externalModelId: string;
  displayName?: string;
  /** Federated reference — does NOT transfer ownership to RTB. */
  ownership: "source_client_engineering_application";
  federated: true;
  rtbOwned: false;
  formatFamily?: "ifc" | "native" | "exchange" | "unknown";
  versionHint?: string;
  projectId?: string;
  assetId?: string;
  spatialReferenceId?: string;
};

/** Draft capability surface — interfaces only; no production implementations in 13A. */
export type EngineeringModelAdapterCapability =
  | "identifyModel"
  | "probeVersion"
  | "readMetadata"
  | "listElements"
  | "readElement"
  | "listAnalysisResults"
  | "readAnalysisResult"
  | "readGeometrySummary"
  | "readUnits"
  | "readMaterialsSummary"
  | "exportExchangeSnapshot"
  | "mutateModel"
  | "generateAnalysisModel";

export type EngineeringModelAdapterCapabilities = {
  readonly [K in EngineeringModelAdapterCapability]: boolean;
};

export type EngineeringModelAdapter = {
  adapterId: string;
  providerKey: string;
  displayName: string;
  adapterVersion: string;
  status: "draft" | "discovered" | "reserved" | "unimplemented";
  /** Capability flags are independent — listing ≠ implementing. */
  capabilities: EngineeringModelAdapterCapabilities;
  /** Model accessible ≠ solver executable. */
  solverExecutable: false;
  identifyModel?(input: {
    locator: string;
  }): Promise<EngineeringModelReference>;
  probeVersion?(input: {
    modelRef: EngineeringModelReference;
  }): Promise<{ versionText: string; ok: boolean }>;
  readMetadata?(input: {
    modelRef: EngineeringModelReference;
  }): Promise<Record<string, unknown>>;
  listElements?(input: {
    modelRef: EngineeringModelReference;
  }): Promise<EngineeringModelElementReference[]>;
  readElement?(input: {
    elementRef: EngineeringModelElementReference;
  }): Promise<Record<string, unknown>>;
  listAnalysisResults?(input: {
    modelRef: EngineeringModelReference;
  }): Promise<EngineeringAnalysisResultReference[]>;
  readAnalysisResult?(input: {
    resultRef: EngineeringAnalysisResultReference;
  }): Promise<Record<string, unknown>>;
};

export type EngineeringModelElementReference = {
  elementRefId: string;
  modelRefId: string;
  externalElementId: string;
  elementKind?: string;
  displayName?: string;
  ownership: "source_client_engineering_application";
};

export type EngineeringAnalysisResultReference = {
  resultRefId: string;
  modelRefId: string;
  externalResultId: string;
  resultKind?: string;
  /** Existing federated results are not RTB-generated. */
  provenance: "external_existing" | "rtb_generated";
  rtbGenerated: boolean;
  solverProviderId?: string;
  ownership: "source_client_engineering_application" | "digital_twin";
};

export type ExternalSolverProviderReference = {
  providerId: string;
  displayName: string;
  /** Supported ≠ qualified ≠ project-approved ≠ execution-qualified ≠ engineering-approved. */
  solverSupported: boolean;
  solverQualified: boolean;
  projectApproved: boolean;
  executionQualified: boolean;
  engineeringApproved: boolean;
  ownership: "external_engineering_tool";
  /** Reuse DT EngineeringSolverAdapter when execution is eventually enabled. */
  reusesEngineeringSolverAdapter: true;
  certifiedCapabilityHints?: readonly string[];
};

export const DEFAULT_DRAFT_ADAPTER_CAPABILITIES: EngineeringModelAdapterCapabilities =
  {
    identifyModel: false,
    probeVersion: false,
    readMetadata: false,
    listElements: false,
    readElement: false,
    listAnalysisResults: false,
    readAnalysisResult: false,
    readGeometrySummary: false,
    readUnits: false,
    readMaterialsSummary: false,
    exportExchangeSnapshot: false,
    mutateModel: false,
    generateAnalysisModel: false,
  };

export function assertEngineeringInteropDraftContracts(): {
  ok: true;
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
  families: typeof ENGINEERING_INTEROP_PUBLIC_CONTRACT_FAMILIES;
  ga: false;
  runtimeBacked: false;
} {
  if (PUBLIC_CONTRACT_VERSION !== "0.1.0-draft") {
    throw new Error("interop_contracts_must_be_draft");
  }
  if (PUBLIC_CONTRACT_VERSION === "1.0.0") {
    throw new Error("interop_contracts_must_not_be_ga");
  }
  return {
    ok: true,
    contractVersion: PUBLIC_CONTRACT_VERSION,
    families: ENGINEERING_INTEROP_PUBLIC_CONTRACT_FAMILIES,
    ga: false,
    runtimeBacked: false,
  };
}
