import type { BusinessAction, BusinessDecision } from "@rtb/types";
import { isOverdueOrBlocked } from "../owner-command/brief";

function lagDays(dueDate: string | null | undefined, completedAt: string | null | undefined): number | null {
  if (!dueDate || !completedAt) return null;
  const due = new Date(`${dueDate}T23:59:59.000Z`).getTime();
  const done = new Date(completedAt).getTime();
  if (!Number.isFinite(due) || !Number.isFinite(done)) return null;
  return Math.round((done - due) / 86_400_000);
}

export function computeActionIntelligence(input: {
  actions: BusinessAction[];
  decisions: BusinessDecision[];
  asOf?: Date;
}): {
  overdue: BusinessAction[];
  blocked: BusinessAction[];
  highPriority: BusinessAction[];
  decisionCritical: BusinessAction[];
  completionLag: Array<{ actionId: string; dueDate: string | null; completedAt: string | null; lagDays: number | null }>;
  unresolvedDependencies: Array<{ actionId: string; title: string; blocker: string }>;
} {
  const asOf = input.asOf ?? new Date();
  const open = input.actions.filter((a) => a.status !== "completed" && a.status !== "cancelled");
  const pendingCritical = new Set(
    input.decisions
      .filter((d) => d.status === "pending" || d.status === "approved")
      .map((d) => d.id),
  );
  return {
    overdue: open.filter((a) => isOverdueOrBlocked(a, asOf) && a.status !== "blocked"),
    blocked: open.filter((a) => a.status === "blocked"),
    highPriority: open.filter((a) => a.priority === "high" || a.priority === "critical"),
    decisionCritical: open.filter((a) => Boolean(a.decisionId && pendingCritical.has(a.decisionId))),
    completionLag: input.actions
      .filter((a) => a.status === "completed")
      .map((a) => ({
        actionId: a.id,
        dueDate: a.dueDate ?? null,
        completedAt: a.completedAt ?? null,
        lagDays: lagDays(a.dueDate, a.completedAt),
      })),
    unresolvedDependencies: open
      .filter((a) => a.status === "blocked")
      .map((a) => ({
        actionId: a.id,
        title: a.title,
        blocker: typeof a.completionEvidence.blocker === "string" ? a.completionEvidence.blocker : "blocked",
      })),
  };
}

export function actionCompletionRateBps(actions: BusinessAction[]): number | null {
  const countable = actions.filter((a) => a.status !== "cancelled");
  if (!countable.length) return null;
  const completed = countable.filter((a) => a.status === "completed").length;
  return Math.round((completed / countable.length) * 10000);
}

export function meanCycleTimeDays(decisions: BusinessDecision[]): number | null {
  const closed = decisions.filter((d) => d.decidedAt && (d.status === "approved" || d.status === "rejected" || d.status === "closed"));
  if (!closed.length) return null;
  let total = 0;
  let n = 0;
  for (const decision of closed) {
    const start = new Date(decision.createdAt).getTime();
    const end = new Date(decision.decidedAt!).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
    total += (end - start) / 86_400_000;
    n += 1;
  }
  if (!n) return null;
  return Math.round((total / n) * 100) / 100;
}
