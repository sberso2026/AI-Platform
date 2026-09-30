import type { EngineeringAssuranceCondition } from "./types";

export type AssuranceListFilter = {
  status?: string;
  conditionType?: string;
  discipline?: string;
  materiality?: string;
  rootObjectType?: string;
  rootObjectId?: string;
  ruleId?: string;
};

export interface AssuranceConditionStore {
  list(tenantId: string, workspaceId: string, filter?: AssuranceListFilter): Promise<EngineeringAssuranceCondition[]>;
  get(tenantId: string, workspaceId: string, id: string): Promise<EngineeringAssuranceCondition | null>;
  upsertMany(conditions: EngineeringAssuranceCondition[]): Promise<void>;
}

export class MemoryAssuranceStore implements AssuranceConditionStore {
  private rows: EngineeringAssuranceCondition[] = [];

  async list(tenantId: string, workspaceId: string, filter?: AssuranceListFilter): Promise<EngineeringAssuranceCondition[]> {
    return this.rows.filter((row) => {
      if (row.tenantId !== tenantId || row.workspaceId !== workspaceId) return false;
      if (filter?.status && row.status !== filter.status) return false;
      if (filter?.conditionType && row.conditionType !== filter.conditionType) return false;
      if (filter?.discipline && row.discipline !== filter.discipline) return false;
      if (filter?.materiality && row.materiality !== filter.materiality) return false;
      if (filter?.rootObjectType && row.rootObjectType !== filter.rootObjectType) return false;
      if (filter?.rootObjectId && row.rootObjectId !== filter.rootObjectId) return false;
      if (filter?.ruleId && row.ruleId !== filter.ruleId) return false;
      return true;
    });
  }

  async get(tenantId: string, workspaceId: string, id: string): Promise<EngineeringAssuranceCondition | null> {
    return this.rows.find((row) => row.id === id && row.tenantId === tenantId && row.workspaceId === workspaceId) ?? null;
  }

  async upsertMany(conditions: EngineeringAssuranceCondition[]): Promise<void> {
    for (const condition of conditions) {
      const index = this.rows.findIndex(
        (row) =>
          row.tenantId === condition.tenantId &&
          row.workspaceId === condition.workspaceId &&
          row.fingerprint === condition.fingerprint,
      );
      if (index >= 0) this.rows[index] = condition;
      else this.rows.push(condition);
    }
  }
}
