import { createHash } from "node:crypto";
import type { AnalysisExecutionPort, AnalysisExecutionPortResult, AnalysisExecutionRequest } from "./execution-port";
import { isSyntheticCertificationAdapter } from "./execution-port";
import { SYNTHETIC_CERTIFICATION_ADAPTER_ID, SYNTHETIC_CERTIFICATION_ADAPTER_VERSION } from "./types";
import type { AnalysisMetric } from "./types";

/**
 * Deterministic TEST/DEV certification adapter.
 * Never treated as REAL_ENGINEERING_TOOL. Never certifies a production discipline capability.
 */
export class SyntheticCertificationAnalysisAdapter implements AnalysisExecutionPort {
  async execute(request: AnalysisExecutionRequest): Promise<AnalysisExecutionPortResult> {
    if (!isSyntheticCertificationAdapter(request.adapterId)) {
      return {
        executionRef: request.executionRef,
        accepted: false,
        status: "rejected",
        executionSucceeded: false,
        resultValid: false,
        metrics: [],
        warnings: [],
        limitations: ["adapter_not_synthetic_certification"],
        resultArtifacts: [],
        errorClass: "AUTHORIZATION_FAILED",
        errorMessage: "SyntheticCertificationAnalysisAdapter only accepts SYNTHETIC/TEST/CERTIFICATION adapters.",
        provenance: provenance(request, "failed"),
      };
    }
    const seed = `${request.analysisRequestId}|${request.analysisInputFingerprint}`;
    const channels = request.inputManifest.requested_outputs.length
      ? request.inputManifest.requested_outputs
      : ["CERTIFICATION_METRIC"];
    const metrics: AnalysisMetric[] = channels.map((channel) => ({
      metricCode: channel,
      value: deterministicMetric(seed, channel),
      unit: "1",
      dimension: "CERTIFICATION",
      category: "TEST",
      source: SYNTHETIC_CERTIFICATION_ADAPTER_ID,
      resultChannel: channel,
      confidence: "high",
      provenance: { seed, adapter: SYNTHETIC_CERTIFICATION_ADAPTER_ID },
      shape: "SCALAR",
    }));
    return {
      executionRef: request.executionRef,
      accepted: true,
      status: "succeeded",
      executionSucceeded: true,
      resultValid: true,
      metrics,
      warnings: ["synthetic_certification_adapter_not_a_real_engineering_tool"],
      limitations: ["TEST_DEV_ONLY", "NOT_REAL_ENGINEERING_TOOL", "DOES_NOT_CERTIFY_PRODUCTION_CAPABILITY"],
      resultArtifacts: [],
      provenance: provenance(request, "succeeded"),
    };
  }
}

function deterministicMetric(seed: string, metricCode: string): number {
  const hex = createHash("sha256").update(`${seed}|${metricCode}`).digest("hex").slice(0, 8);
  return Number((Number.parseInt(hex, 16) / 0xffffffff).toFixed(6));
}

function provenance(request: AnalysisExecutionRequest, status: string) {
  const now = new Date().toISOString();
  return {
    toolId: SYNTHETIC_CERTIFICATION_ADAPTER_ID,
    toolVersion: SYNTHETIC_CERTIFICATION_ADAPTER_VERSION,
    adapterId: SYNTHETIC_CERTIFICATION_ADAPTER_ID,
    adapterVersion: SYNTHETIC_CERTIFICATION_ADAPTER_VERSION,
    executionHostId: null,
    sourceKind: "SYNTHETIC_TEST" as const,
    startedAt: now,
    completedAt: now,
    status,
  };
}
