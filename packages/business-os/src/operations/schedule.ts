import type { BusinessWorkItem, BusinessWorkMilestone } from "@rtb/types";

export function signedUtcDayDiff(fromIsoDate: string, toIsoDate: string): number | null {
  const from = Date.parse(`${fromIsoDate.slice(0, 10)}T00:00:00.000Z`);
  const to = Date.parse(`${toIsoDate.slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) return null;
  return Math.trunc((to - from) / 86_400_000);
}

export function isOpenWorkStatus(status: BusinessWorkItem["status"]): boolean {
  return status === "planned" || status === "ready" || status === "active" || status === "on_hold";
}

export function scheduleVarianceDays(
  work: Pick<BusinessWorkItem, "plannedFinish" | "actualFinish" | "status">,
  asOf: string,
): number | null {
  if (work.status === "completed" && work.plannedFinish && work.actualFinish) {
    return signedUtcDayDiff(work.plannedFinish, work.actualFinish);
  }
  if (isOpenWorkStatus(work.status) && work.plannedFinish) {
    return signedUtcDayDiff(work.plannedFinish, asOf);
  }
  return null;
}

export function isWorkOverdue(
  work: Pick<BusinessWorkItem, "status" | "plannedFinish">,
  asOf: string,
): boolean {
  if (!isOpenWorkStatus(work.status) || !work.plannedFinish) return false;
  const days = signedUtcDayDiff(work.plannedFinish, asOf);
  return days !== null && days > 0;
}

export function isMilestoneOverdue(
  milestone: Pick<BusinessWorkMilestone, "status" | "dueAt">,
  asOf: string,
): boolean {
  if (milestone.status === "completed" || milestone.status === "cancelled" || !milestone.dueAt) return false;
  const days = signedUtcDayDiff(milestone.dueAt, asOf);
  return days !== null && days > 0;
}

export function isStale(updatedAt: string, asOf: string, staleDays: number): boolean {
  const days = signedUtcDayDiff(updatedAt.slice(0, 10), asOf);
  return days !== null && days >= staleDays;
}
