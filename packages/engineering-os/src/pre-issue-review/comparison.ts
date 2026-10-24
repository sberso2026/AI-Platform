import type { PreIssueCondition, PreIssueRerunComparison } from "./types";

export function compareReviewRuns(previous: PreIssueCondition[], current: PreIssueCondition[], previousReviewId: string, governingContextChanged: boolean): PreIssueRerunComparison {
  const prev = new Map(previous.map((row) => [row.code, row]));
  const next = new Map(current.map((row) => [row.code, row]));
  const resolved: string[] = [];
  const unchanged: string[] = [];
  const added: string[] = [];
  const noLongerApplicable: string[] = [];
  for (const [code, row] of prev) {
    if (!next.has(code)) {
      resolved.push(row.title);
      noLongerApplicable.push(row.title);
    } else unchanged.push(row.title);
  }
  for (const [code, row] of next) {
    if (!prev.has(code)) added.push(row.title);
  }
  return { previousReviewId, resolved, unchanged, added, noLongerApplicable, governingContextChanged };
}

export function evaluateReviewStaleness(input: {
  storedFingerprint: string;
  currentFingerprint: string;
  storedTargetHash: string;
  currentTargetHash: string;
  authorityChanged: boolean;
}): import("./types").PreIssueStaleness {
  if (input.storedTargetHash !== input.currentTargetHash) return "RERUN_REQUIRED";
  if (input.authorityChanged) return "STALE";
  if (input.storedFingerprint !== input.currentFingerprint) return "POTENTIALLY_STALE";
  return "CURRENT";
}
