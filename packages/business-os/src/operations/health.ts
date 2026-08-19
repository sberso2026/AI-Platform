import type {
  BusinessWorkActionLink,
  BusinessWorkCapacityFact,
  BusinessWorkCostProgress,
  BusinessWorkHealth,
  BusinessWorkHealthStatus,
  BusinessWorkItem,
  BusinessWorkMilestone,
  BusinessWorkProgress,
} from "@rtb/types";
import { BUSINESS_OPERATIONS_DEFAULT_THRESHOLDS, WORK_HEALTH_VERSION } from "@rtb/types";
import { parseMinor } from "../finance/money";
import { isMilestoneOverdue, isStale, isWorkOverdue, signedUtcDayDiff } from "./schedule";

export const WORK_HEALTH_DISCLAIMER =
  "Work health is a deterministic management ranking from supplied operational evidence. It is not an enterprise Business Health score and not a statistical delay probability.";

function worse(a: BusinessWorkHealthStatus, b: BusinessWorkHealthStatus): BusinessWorkHealthStatus {
  const rank: Record<BusinessWorkHealthStatus, number> = {
    unknown: 0,
    healthy: 1,
    watch: 2,
    at_risk: 3,
    critical: 4,
  };
  return rank[a] >= rank[b] ? a : b;
}

export function computeWorkHealth(input: {
  work: BusinessWorkItem;
  milestones: BusinessWorkMilestone[];
  actionLinks: Array<BusinessWorkActionLink & { actionStatus?: string }>;
  progress: BusinessWorkProgress;
  costProgress: BusinessWorkCostProgress;
  capacity: BusinessWorkCapacityFact[];
  asOf?: string;
  thresholds?: typeof BUSINESS_OPERATIONS_DEFAULT_THRESHOLDS;
}): BusinessWorkHealth {
  const asOf = input.asOf ?? new Date().toISOString().slice(0, 10);
  const t = input.thresholds ?? BUSINESS_OPERATIONS_DEFAULT_THRESHOLDS;
  const missingComponents: string[] = [];
  const components: BusinessWorkHealth["components"] = [];

  const overdue = isWorkOverdue(input.work, asOf);
  const finishDays = input.work.plannedFinish ? signedUtcDayDiff(asOf, input.work.plannedFinish) : null;
  const progressBps = parseMinor(input.progress.progressBps);
  if (input.work.status === "completed" || input.work.status === "cancelled") {
    components.push({
      id: "schedule",
      label: "Schedule",
      status: overdue ? "watch" : "healthy",
      score: overdue ? 50 : 100,
      evidence: `${input.work.status} work. Overdue during execution: ${overdue ? "yes" : "no"}.`,
    });
  } else if (!input.work.plannedFinish) {
    components.push({
      id: "schedule",
      label: "Schedule",
      status: "unknown",
      score: null,
      evidence: "No planned finish date.",
    });
    missingComponents.push("schedule");
  } else if (overdue) {
    components.push({
      id: "schedule",
      label: "Schedule",
      status: "critical",
      score: 0,
      evidence: `Planned finish ${input.work.plannedFinish} is overdue as of ${asOf}.`,
    });
  } else if (
    finishDays !== null &&
    finishDays <= t.approachingFinishDays &&
    (progressBps === null || progressBps < BigInt(t.lowProgressBps))
  ) {
    components.push({
      id: "schedule",
      label: "Schedule",
      status: progressBps === null ? "watch" : "at_risk",
      score: progressBps === null ? null : 25,
      evidence: `Planned finish in ${finishDays} day(s) with progress ${progressBps?.toString() ?? "unknown"} bps.`,
    });
    if (progressBps === null) missingComponents.push("progress_for_schedule");
  } else {
    components.push({
      id: "schedule",
      label: "Schedule",
      status: "healthy",
      score: 100,
      evidence: `Planned finish ${input.work.plannedFinish} is not overdue.`,
    });
  }

  if (progressBps === null) {
    components.push({
      id: "progress",
      label: "Progress",
      status: "unknown",
      score: null,
      evidence: input.progress.missingInputs.join(", ") || "Progress evidence is missing.",
    });
    missingComponents.push("progress");
  } else if (input.work.status !== "completed" && progressBps < BigInt(t.lowProgressBps) && finishDays !== null && finishDays <= t.approachingFinishDays) {
    components.push({
      id: "progress",
      label: "Progress",
      status: "at_risk",
      score: 25,
      evidence: `Progress ${progressBps.toString()} bps via ${input.progress.method}.`,
    });
  } else {
    components.push({
      id: "progress",
      label: "Progress",
      status: "healthy",
      score: 100,
      evidence: `Progress ${progressBps.toString()} bps via ${input.progress.method}.`,
    });
  }

  if (input.costProgress.unknownReasons.length) {
    components.push({
      id: "cost_progress",
      label: "Cost vs progress",
      status: "unknown",
      score: null,
      evidence: input.costProgress.unknownReasons.join(", "),
    });
    missingComponents.push("cost_progress");
  } else if (input.costProgress.signal) {
    components.push({
      id: "cost_progress",
      label: "Cost vs progress",
      status: "at_risk",
      score: 25,
      evidence: `Actual cost ${input.costProgress.actualCostBpsOfBudget} bps of budget vs progress ${input.costProgress.progressBps} bps (${input.costProgress.version}). Potential overrun, not certainty.`,
    });
  } else {
    components.push({
      id: "cost_progress",
      label: "Cost vs progress",
      status: "healthy",
      score: 100,
      evidence: "Actual cost is not materially ahead of progress.",
    });
  }

  const blockedMilestone = input.milestones.some((row) => row.status === "blocked");
  const blockedAction = input.actionLinks.some((row) => row.actionStatus === "blocked");
  const blocked = input.work.status === "on_hold" || blockedMilestone || blockedAction;
  components.push({
    id: "blocked",
    label: "Blocked / on hold",
    status: blocked ? "critical" : "healthy",
    score: blocked ? 0 : 100,
    evidence: blocked
      ? `Blocked evidence: work=${input.work.status}, milestoneBlocked=${blockedMilestone}, actionBlocked=${blockedAction}.`
      : "No blocked work, milestone, or linked action.",
  });

  if (!input.work.owner) {
    components.push({
      id: "owner",
      label: "Owner",
      status: input.work.status === "completed" || input.work.status === "cancelled" ? "watch" : "at_risk",
      score: 25,
      evidence: "No owner assigned.",
    });
  } else {
    components.push({
      id: "owner",
      label: "Owner",
      status: "healthy",
      score: 100,
      evidence: `Owner ${input.work.owner}.`,
    });
  }

  const staleRef = input.work.lastStatusAt || input.work.updatedAt;
  if (isStale(staleRef, asOf, t.staleDays) && input.work.status !== "completed" && input.work.status !== "cancelled") {
    components.push({
      id: "freshness",
      label: "Status freshness",
      status: "watch",
      score: 50,
      evidence: `Last status update ${staleRef} is stale versus ${t.staleDays}-day threshold.`,
    });
  } else {
    components.push({
      id: "freshness",
      label: "Status freshness",
      status: "healthy",
      score: 100,
      evidence: `Last status update ${staleRef}.`,
    });
  }

  const overdueMilestone = input.milestones.some((row) => isMilestoneOverdue(row, asOf));
  if (input.milestones.length === 0) {
    components.push({
      id: "milestones",
      label: "Milestones",
      status: "unknown",
      score: null,
      evidence: "No milestones supplied.",
    });
    missingComponents.push("milestones");
  } else if (overdueMilestone) {
    components.push({
      id: "milestones",
      label: "Milestones",
      status: "at_risk",
      score: 25,
      evidence: "At least one open milestone is overdue.",
    });
  } else {
    components.push({
      id: "milestones",
      label: "Milestones",
      status: "healthy",
      score: 100,
      evidence: "No open milestone is overdue.",
    });
  }

  const overcommitted = input.capacity.filter((row) => row.capacityStatus === "overcommitted");
  if (input.capacity.length === 0) {
    components.push({
      id: "capacity",
      label: "Capacity",
      status: "unknown",
      score: null,
      evidence: "No capacity facts supplied.",
    });
    missingComponents.push("capacity");
  } else if (overcommitted.length) {
    components.push({
      id: "capacity",
      label: "Capacity",
      status: "at_risk",
      score: 25,
      evidence: `${overcommitted.length} overcommitted capacity fact(s).`,
    });
  } else if (input.capacity.every((row) => row.capacityStatus === "unknown")) {
    components.push({
      id: "capacity",
      label: "Capacity",
      status: "unknown",
      score: null,
      evidence: "Capacity facts exist but available/committed hours are incomplete.",
    });
    missingComponents.push("capacity_hours");
  } else {
    components.push({
      id: "capacity",
      label: "Capacity",
      status: "healthy",
      score: 100,
      evidence: "Capacity facts are not overcommitted.",
    });
  }

  const scored = components.filter((c) => c.status !== "unknown");
  let status: BusinessWorkHealthStatus = "unknown";
  let score: number | null = null;
  if (scored.length >= 3) {
    status = scored.reduce((acc, row) => worse(acc, row.status), "healthy" as BusinessWorkHealthStatus);
    const numeric = scored.filter((c) => c.score !== null);
    score =
      numeric.length === 0
        ? null
        : Math.round(numeric.reduce((sum, c) => sum + (c.score ?? 0), 0) / numeric.length);
  }

  return {
    status,
    score,
    components,
    missingComponents,
    version: WORK_HEALTH_VERSION,
    method: "deterministic_work_health_v1",
    disclaimer: WORK_HEALTH_DISCLAIMER,
  };
}
