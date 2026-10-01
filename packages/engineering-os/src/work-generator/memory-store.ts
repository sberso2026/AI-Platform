import type { EngineeringWorkPlan } from "./types";

export interface WorkPlanStore {
  listPlans(workspaceId: string, projectId: string): Promise<EngineeringWorkPlan[]>;
  getPlan(id: string): Promise<EngineeringWorkPlan | null>;
  savePlan(row: EngineeringWorkPlan): Promise<EngineeringWorkPlan>;
}

export function createMemoryWorkPlanStore(): WorkPlanStore {
  const plans = new Map<string, EngineeringWorkPlan>();
  return {
    async listPlans(workspaceId, projectId) {
      return [...plans.values()].filter((row) => row.workspaceId === workspaceId && row.projectId === projectId);
    },
    async getPlan(id) {
      return plans.get(id) ?? null;
    },
    async savePlan(row) {
      plans.set(row.id, row);
      return row;
    },
  };
}
