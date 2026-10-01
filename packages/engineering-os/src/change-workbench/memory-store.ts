import type { EngineeringImpactAssessment } from "./types";

export interface ImpactAssessmentStore {
  save(row: EngineeringImpactAssessment): Promise<EngineeringImpactAssessment>;
  get(id: string): Promise<EngineeringImpactAssessment | null>;
  listBySource(workspaceId: string, sourceObjectType: string, sourceObjectId: string): Promise<EngineeringImpactAssessment[]>;
  listByProject(workspaceId: string, projectId: string): Promise<EngineeringImpactAssessment[]>;
}

export function createMemoryImpactAssessmentStore(): ImpactAssessmentStore {
  const rows = new Map<string, EngineeringImpactAssessment>();
  return {
    async save(row) {
      rows.set(row.id, row);
      return row;
    },
    async get(id) {
      return rows.get(id) ?? null;
    },
    async listBySource(workspaceId, sourceObjectType, sourceObjectId) {
      return [...rows.values()]
        .filter(
          (row) =>
            row.workspaceId === workspaceId &&
            row.sourceObjectType === sourceObjectType &&
            row.sourceObjectId === sourceObjectId,
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async listByProject(workspaceId, projectId) {
      return [...rows.values()]
        .filter((row) => row.workspaceId === workspaceId && row.projectId === projectId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
  };
}
