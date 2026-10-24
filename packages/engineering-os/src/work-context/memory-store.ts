import type { EngineeringWorkEvent, ManagedEngineeringRepository } from "./types";

export interface WorkContextStore {
  listRepositories(workspaceId: string, projectId?: string | null): Promise<ManagedEngineeringRepository[]>;
  getRepository(id: string): Promise<ManagedEngineeringRepository | null>;
  saveRepository(row: ManagedEngineeringRepository): Promise<ManagedEngineeringRepository>;
  listEvents(workspaceId: string, projectId: string): Promise<EngineeringWorkEvent[]>;
  getEvent(id: string): Promise<EngineeringWorkEvent | null>;
  findEventBySource(input: {
    tenantId: string;
    workspaceId: string;
    sourceSystem: string;
    sourceEventId: string;
  }): Promise<EngineeringWorkEvent | null>;
  saveEvent(row: EngineeringWorkEvent): Promise<EngineeringWorkEvent>;
}

export function createMemoryWorkContextStore(): WorkContextStore {
  const repositories = new Map<string, ManagedEngineeringRepository>();
  const events = new Map<string, EngineeringWorkEvent>();

  return {
    async listRepositories(workspaceId, projectId) {
      return [...repositories.values()].filter((row) => {
        if (row.workspaceId !== workspaceId) return false;
        if (!projectId) return true;
        return row.projectId === projectId || row.projectId == null;
      });
    },
    async getRepository(id) {
      return repositories.get(id) ?? null;
    },
    async saveRepository(row) {
      repositories.set(row.id, row);
      return row;
    },
    async listEvents(workspaceId, projectId) {
      return [...events.values()].filter((row) => row.workspaceId === workspaceId && row.projectId === projectId);
    },
    async getEvent(id) {
      return events.get(id) ?? null;
    },
    async findEventBySource(input) {
      return (
        [...events.values()].find(
          (row) =>
            row.tenantId === input.tenantId &&
            row.workspaceId === input.workspaceId &&
            row.sourceSystem === input.sourceSystem &&
            row.sourceEventId === input.sourceEventId,
        ) ?? null
      );
    },
    async saveEvent(row) {
      events.set(row.id, row);
      return row;
    },
  };
}
