import type { EngineeringArtifactGenerationRun, GeneratedEngineeringArtifact } from "./types";

export interface ArtifactStore {
  listArtifacts(workspaceId: string, workPlanId: string): Promise<GeneratedEngineeringArtifact[]>;
  getArtifact(id: string): Promise<GeneratedEngineeringArtifact | null>;
  saveArtifact(row: GeneratedEngineeringArtifact): Promise<GeneratedEngineeringArtifact>;
  listRuns(workspaceId: string, workPlanId: string): Promise<EngineeringArtifactGenerationRun[]>;
  getRun(id: string): Promise<EngineeringArtifactGenerationRun | null>;
  saveRun(row: EngineeringArtifactGenerationRun): Promise<EngineeringArtifactGenerationRun>;
}

export function createMemoryArtifactStore(): ArtifactStore {
  const artifacts = new Map<string, GeneratedEngineeringArtifact>();
  const runs = new Map<string, EngineeringArtifactGenerationRun>();
  return {
    async listArtifacts(workspaceId, workPlanId) {
      return [...artifacts.values()].filter((row) => row.workspaceId === workspaceId && row.workPlanId === workPlanId);
    },
    async getArtifact(id) {
      return artifacts.get(id) ?? null;
    },
    async saveArtifact(row) {
      artifacts.set(row.id, row);
      return row;
    },
    async listRuns(workspaceId, workPlanId) {
      return [...runs.values()].filter((row) => row.workspaceId === workspaceId && row.workPlanId === workPlanId);
    },
    async getRun(id) {
      return runs.get(id) ?? null;
    },
    async saveRun(row) {
      runs.set(row.id, row);
      return row;
    },
  };
}
