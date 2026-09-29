import { fingerprintAnalysisInput, type AnalysisFingerprintInput } from "./fingerprint";
import type { AnalysisStalenessReason } from "./types";

export type StalenessCompare = {
  stored: AnalysisFingerprintInput;
  current: AnalysisFingerprintInput;
};

const FIELD_REASONS: Array<{ field: keyof AnalysisFingerprintInput; reason: AnalysisStalenessReason }> = [
  { field: "baselineId", reason: "STALE_BASELINE_CHANGED" },
  { field: "requirementIds", reason: "STALE_REQUIREMENT_CHANGED" },
  { field: "assumptionIds", reason: "STALE_ASSUMPTION_CHANGED" },
  { field: "interfaceIds", reason: "STALE_INTERFACE_CHANGED" },
  { field: "standardCodes", reason: "STALE_STANDARD_CHANGED" },
  { field: "upstreamResultIds", reason: "STALE_UPSTREAM_RESULT_CHANGED" },
  { field: "toolVersion", reason: "STALE_TOOL_VERSION_CHANGED" },
  { field: "adapterVersion", reason: "STALE_ADAPTER_VERSION_CHANGED" },
];

export function explainAnalysisStaleness(compare: StalenessCompare): {
  stale: boolean;
  reasons: AnalysisStalenessReason[];
  storedFingerprint: string;
  currentFingerprint: string;
} {
  const storedFingerprint = fingerprintAnalysisInput(compare.stored);
  const currentFingerprint = fingerprintAnalysisInput(compare.current);
  const reasons: AnalysisStalenessReason[] = [];
  for (const { field, reason } of FIELD_REASONS) {
    const left = JSON.stringify(compare.stored[field] ?? null);
    const right = JSON.stringify(compare.current[field] ?? null);
    if (left !== right) reasons.push(reason);
  }
  return {
    stale: storedFingerprint !== currentFingerprint,
    reasons,
    storedFingerprint,
    currentFingerprint,
  };
}
