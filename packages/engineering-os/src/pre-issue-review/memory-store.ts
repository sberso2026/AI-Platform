import type { PreIssueReviewRecord } from "./types";

export interface PreIssueReviewStore {
  save(row: PreIssueReviewRecord): Promise<PreIssueReviewRecord>;
  get(id: string): Promise<PreIssueReviewRecord | null>;
  listByPlan(workspaceId: string, workPlanId: string): Promise<PreIssueReviewRecord[]>;
}

export function createMemoryPreIssueStore(): PreIssueReviewStore {
  const rows = new Map<string, PreIssueReviewRecord>();
  return {
    async save(row) {
      rows.set(row.id, row);
      return row;
    },
    async get(id) {
      return rows.get(id) ?? null;
    },
    async listByPlan(workspaceId, workPlanId) {
      return [...rows.values()]
        .filter((row) => row.workspaceId === workspaceId && row.workPlanId === workPlanId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
  };
}
