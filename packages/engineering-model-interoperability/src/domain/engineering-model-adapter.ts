/**
 * Phase 13B — EngineeringModelAdapter interface + capability flags.
 */

import type { EngineeringModelElementReference } from "./engineering-model-element-reference";
import type { EngineeringModelReference } from "./engineering-model-reference";
import type { EngineeringAnalysisResultReference } from "./result-reference";

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

export type EngineeringModelAdapterStatus =
  | "draft"
  | "discovered"
  | "reserved"
  | "production"
  | "unimplemented";

export type EngineeringModelAdapter = {
  adapterId: string;
  providerKey: string;
  displayName: string;
  adapterVersion: string;
  status: EngineeringModelAdapterStatus;
  capabilities: EngineeringModelAdapterCapabilities;
  /** Model accessible ≠ solver executable. */
  solverExecutable: false;
  identifyModel?(input: {
    locator: string;
    content?: string;
  }): Promise<EngineeringModelReference>;
  probeVersion?(input: {
    modelRef: EngineeringModelReference;
    content?: string;
  }): Promise<{ versionText: string; ok: boolean }>;
  readMetadata?(input: {
    modelRef: EngineeringModelReference;
    content?: string;
  }): Promise<Record<string, unknown>>;
  listElements?(input: {
    modelRef: EngineeringModelReference;
    content?: string;
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

export const FORBIDDEN_ADAPTER_CAPABILITIES: EngineeringModelAdapterCapabilities =
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

export const IFC_FEDERATION_ADAPTER_CAPABILITIES: EngineeringModelAdapterCapabilities =
  {
    identifyModel: true,
    probeVersion: true,
    readMetadata: true,
    listElements: true,
    readElement: true,
    listAnalysisResults: false,
    readAnalysisResult: false,
    readGeometrySummary: false,
    readUnits: true,
    readMaterialsSummary: false,
    exportExchangeSnapshot: false,
    mutateModel: false,
    generateAnalysisModel: false,
  };
