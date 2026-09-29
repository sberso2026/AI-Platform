import type { RunInputManifestV1 } from "./manifest";

/**
 * Generic Optimization execution contract.
 * Vendor-specific solver fields stay behind adapter boundaries (SPACE GASS / ETABS in EOS-A6).
 */
export type OptimizationExecutionRequest = {
  studyId: string;
  runId: string;
  alternativeId: string;
  scenarioId: string | null;
  baselineId: string;
  tenantId: string;
  workspaceId: string;
  runInputManifest: RunInputManifestV1;
  adapterId: string;
  adapterVersion: string | null;
  toolId: string | null;
  toolVersion: string | null;
  requestedBy: string;
  executionRef: string;
};

export type OptimizationExecutionStatus =
  | "succeeded"
  | "failed"
  | "cancelled"
  | "provider_unavailable"
  | "license_unavailable"
  | "timeout"
  | "unsupported_tool"
  | "invalid_manifest"
  | "malformed_result";

export type OptimizationExecutionResult = {
  executionRef: string;
  status: OptimizationExecutionStatus;
  sourceKind: "EXECUTION_HOST" | "ADAPTER";
  metrics: Array<{ metricKey: string; value: number; unit?: string | null; objectiveId?: string | null }>;
  constraintEvidenceRefs: string[];
  rawArtifactRefs: string[];
  toolProvenance: { toolId: string | null; toolVersion: string | null };
  adapterProvenance: { adapterId: string; adapterVersion: string | null };
  errorCode?: string;
  errorMessage?: string;
  warnings: string[];
};

export interface OptimizationExecutionPort {
  execute(request: OptimizationExecutionRequest): Promise<OptimizationExecutionResult>;
}
