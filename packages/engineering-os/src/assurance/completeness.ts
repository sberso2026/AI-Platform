import type { AssuranceCompleteness } from "./types";

export function completenessFromScan(input: {
  truncated?: boolean;
  failed?: boolean;
  failureReason?: string | null;
}): { completeness: AssuranceCompleteness; reason: string | null; remainingScopeUnknown: boolean } {
  if (input.failed) {
    return { completeness: "FAILED", reason: input.failureReason ?? "evaluation_failed", remainingScopeUnknown: true };
  }
  if (input.truncated) {
    return {
      completeness: "PARTIAL",
      reason: "link_scan_limit_reached",
      remainingScopeUnknown: true,
    };
  }
  return { completeness: "COMPLETE", reason: null, remainingScopeUnknown: false };
}

export function conclusiveZeroConditionsAllowed(completeness: AssuranceCompleteness): boolean {
  return completeness === "COMPLETE";
}
