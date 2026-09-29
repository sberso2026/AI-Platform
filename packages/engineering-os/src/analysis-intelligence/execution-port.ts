import type { AnalysisFailureClass, AnalysisInputManifestV1, AnalysisMetric, AnalysisSourceKind } from "./types";

export type AnalysisExecutionRequest = {
  analysisRequestId: string;
  executionPlanId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: string;
  capability: string;
  adapterId: string;
  adapterVersion: string | null;
  toolId: string | null;
  toolVersion: string | null;
  executionHostId: string | null;
  inputManifest: AnalysisInputManifestV1;
  analysisInputFingerprint: string;
  requestedBy: string;
  executionRef: string;
};

export type AnalysisExecutionPortResult = {
  executionRef: string;
  accepted: boolean;
  status: "succeeded" | "failed" | "rejected" | "timeout" | "cancelled";
  executionSucceeded: boolean;
  resultValid: boolean;
  metrics: AnalysisMetric[];
  warnings: string[];
  limitations: string[];
  resultArtifacts: Array<{ ref: string; hash: string | null; kind: string }>;
  errorClass?: AnalysisFailureClass;
  errorMessage?: string;
  provenance: {
    toolId: string | null;
    toolVersion: string | null;
    adapterId: string;
    adapterVersion: string | null;
    executionHostId: string | null;
    sourceKind: AnalysisSourceKind;
    startedAt: string;
    completedAt: string;
  };
};

export interface AnalysisExecutionPort {
  execute(request: AnalysisExecutionRequest): Promise<AnalysisExecutionPortResult>;
}

export function isSyntheticCertificationAdapter(adapterId: string | null | undefined): boolean {
  return (
    adapterId === "SYNTHETIC_CERTIFICATION_ANALYSIS_ADAPTER" ||
    adapterId === "SYNTHETIC" ||
    adapterId === "TEST" ||
    adapterId === "CERTIFICATION"
  );
}
