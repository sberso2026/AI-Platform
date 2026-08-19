import type { BusinessWorkItem, BusinessWorkMilestone, BusinessWorkProgress } from "@rtb/types";
import { WORK_PROGRESS_VERSION } from "@rtb/types";
import { parseMinor } from "../finance/money";

export const WORK_PROGRESS_DISCLAIMER =
  "Progress is source or user supplied, or derived from explicitly weighted milestones that sum to 10000 bps. Missing weights are not invented. AI does not invent progress.";

function bps(value: unknown): bigint | null {
  return parseMinor(value ?? null);
}

export function computeWorkProgress(
  work: Pick<BusinessWorkItem, "progressBps">,
  milestones: Array<Pick<BusinessWorkMilestone, "status" | "weightBps">>,
): BusinessWorkProgress {
  const supplied = bps(work.progressBps);
  if (supplied !== null) {
    return {
      progressBps: supplied.toString(),
      method: "user_supplied",
      missingInputs: [],
      version: WORK_PROGRESS_VERSION,
      disclaimer: WORK_PROGRESS_DISCLAIMER,
    };
  }

  const eligible = milestones.filter((row) => row.status !== "cancelled");
  if (eligible.length === 0) {
    return {
      progressBps: null,
      method: "unknown",
      missingInputs: ["progress_bps", "weighted_milestones"],
      version: WORK_PROGRESS_VERSION,
      disclaimer: WORK_PROGRESS_DISCLAIMER,
    };
  }

  const weights = eligible.map((row) => bps(row.weightBps));
  if (weights.some((weight) => weight === null)) {
    return {
      progressBps: null,
      method: "unknown",
      missingInputs: ["explicit_milestone_weights"],
      version: WORK_PROGRESS_VERSION,
      disclaimer: WORK_PROGRESS_DISCLAIMER,
    };
  }

  const knownWeights = weights as bigint[];
  const total = knownWeights.reduce((sum, weight) => sum + weight, 0n);
  if (total !== 10000n) {
    return {
      progressBps: null,
      method: "unknown",
      missingInputs: ["milestone_weights_must_sum_to_10000_bps"],
      version: WORK_PROGRESS_VERSION,
      disclaimer: WORK_PROGRESS_DISCLAIMER,
    };
  }

  let earned = 0n;
  for (const row of eligible) {
    if (row.status === "completed") {
      earned += bps(row.weightBps) ?? 0n;
    }
  }

  return {
    progressBps: earned.toString(),
    method: "weighted_milestones",
    missingInputs: [],
    version: WORK_PROGRESS_VERSION,
    disclaimer: WORK_PROGRESS_DISCLAIMER,
  };
}
