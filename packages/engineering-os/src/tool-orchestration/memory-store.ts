import type { EngineeringToolHandoff } from "./types";

export interface HandoffStore {
  save(row: EngineeringToolHandoff): Promise<EngineeringToolHandoff>;
  get(id: string): Promise<EngineeringToolHandoff | null>;
  listByPlan(workspaceId: string, workPlanId: string): Promise<EngineeringToolHandoff[]>;
}

export function createMemoryHandoffStore(): HandoffStore {
  const rows = new Map<string, EngineeringToolHandoff>();
  return {
    async save(row) {
      rows.set(row.id, row);
      return row;
    },
    async get(id) {
      return rows.get(id) ?? null;
    },
    async listByPlan(workspaceId, workPlanId) {
      return [...rows.values()].filter((row) => row.workspaceId === workspaceId && row.workPlanId === workPlanId);
    },
  };
}
