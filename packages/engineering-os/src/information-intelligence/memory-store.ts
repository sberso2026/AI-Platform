import type { EngineeringInformationRef, InformationAuthorityPolicy, InformationAuthorityResolution } from "./types";

export interface InformationStore {
  listRefs(workspaceId: string, projectId: string): Promise<EngineeringInformationRef[]>;
  getRef(id: string): Promise<EngineeringInformationRef | null>;
  saveRef(row: EngineeringInformationRef): Promise<EngineeringInformationRef>;
  listPolicies(workspaceId: string, projectId?: string | null): Promise<InformationAuthorityPolicy[]>;
  getPolicy(id: string): Promise<InformationAuthorityPolicy | null>;
  savePolicy(row: InformationAuthorityPolicy): Promise<InformationAuthorityPolicy>;
  saveResolution(row: InformationAuthorityResolution): Promise<InformationAuthorityResolution>;
  listResolutions(workspaceId: string, projectId: string): Promise<InformationAuthorityResolution[]>;
  getResolution(id: string): Promise<InformationAuthorityResolution | null>;
}

export function createMemoryInformationStore(): InformationStore {
  const refs = new Map<string, EngineeringInformationRef>();
  const policies = new Map<string, InformationAuthorityPolicy>();
  const resolutions = new Map<string, InformationAuthorityResolution>();

  return {
    async listRefs(workspaceId, projectId) {
      return [...refs.values()].filter((row) => row.workspaceId === workspaceId && row.projectId === projectId);
    },
    async getRef(id) {
      return refs.get(id) ?? null;
    },
    async saveRef(row) {
      refs.set(row.id, row);
      return row;
    },
    async listPolicies(workspaceId, projectId) {
      return [...policies.values()].filter(
        (row) => row.workspaceId === workspaceId && (projectId ? row.projectId === projectId || row.projectId == null : true),
      );
    },
    async getPolicy(id) {
      return policies.get(id) ?? null;
    },
    async savePolicy(row) {
      policies.set(row.id, row);
      return row;
    },
    async saveResolution(row) {
      resolutions.set(row.id, row);
      return row;
    },
    async listResolutions(workspaceId, projectId) {
      return [...resolutions.values()].filter((row) => row.workspaceId === workspaceId && row.projectId === projectId);
    },
    async getResolution(id) {
      return resolutions.get(id) ?? null;
    },
  };
}
