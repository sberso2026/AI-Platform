import type {
  DeliverableAssessment,
  DeliverableArtifactBinding,
  DeliverableExpectation,
  DeliverableProfileSetting,
  DeliverableWaiver,
  DocumentStatusMapping,
  ProjectDeliverableDefinition,
} from "./types";

export interface DeliverableStore {
  getProfileSetting(workspaceId: string): Promise<DeliverableProfileSetting | null>;
  saveProfileSetting(setting: DeliverableProfileSetting): Promise<DeliverableProfileSetting>;
  listExpectations(workspaceId: string, projectId: string): Promise<DeliverableExpectation[]>;
  getExpectation(id: string): Promise<DeliverableExpectation | null>;
  saveExpectation(row: DeliverableExpectation): Promise<DeliverableExpectation>;
  listBindings(expectationId: string): Promise<DeliverableArtifactBinding[]>;
  saveBinding(row: DeliverableArtifactBinding): Promise<DeliverableArtifactBinding>;
  saveAssessment(row: DeliverableAssessment): Promise<DeliverableAssessment>;
  getAssessment(id: string): Promise<DeliverableAssessment | null>;
  latestAssessment(expectationId: string): Promise<DeliverableAssessment | null>;
  markAssessmentStale(id: string): Promise<void>;
  saveWaiver(row: DeliverableWaiver): Promise<DeliverableWaiver>;
  listWaivers(expectationId: string): Promise<DeliverableWaiver[]>;
  overlayWaiver(assessmentId: string, dimensions: DeliverableAssessment["dimensions"], waiverIds: string[]): Promise<void>;
  listStatusMappings(workspaceId: string, projectId?: string | null): Promise<DocumentStatusMapping[]>;
  saveStatusMapping(row: DocumentStatusMapping): Promise<DocumentStatusMapping>;
  getProjectDefinition(workspaceId: string, definitionId: string, version: string): Promise<ProjectDeliverableDefinition | null>;
  listProjectDefinitions(workspaceId: string, projectId: string): Promise<ProjectDeliverableDefinition[]>;
  saveProjectDefinition(row: ProjectDeliverableDefinition): Promise<ProjectDeliverableDefinition>;
  listAssessments(workspaceId: string, projectId?: string): Promise<DeliverableAssessment[]>;
}

export function createMemoryDeliverableStore(): DeliverableStore {
  const settings = new Map<string, DeliverableProfileSetting>();
  const expectations = new Map<string, DeliverableExpectation>();
  const bindings = new Map<string, DeliverableArtifactBinding>();
  const assessments = new Map<string, DeliverableAssessment>();
  const waivers = new Map<string, DeliverableWaiver>();
  const mappings = new Map<string, DocumentStatusMapping>();
  const projectDefinitions = new Map<string, ProjectDeliverableDefinition>();

  return {
    async getProfileSetting(workspaceId) {
      return settings.get(workspaceId) ?? null;
    },
    async saveProfileSetting(setting) {
      settings.set(setting.workspaceId, setting);
      return setting;
    },
    async listExpectations(workspaceId, projectId) {
      return [...expectations.values()].filter((row) => row.workspaceId === workspaceId && row.projectId === projectId);
    },
    async getExpectation(id) {
      return expectations.get(id) ?? null;
    },
    async saveExpectation(row) {
      expectations.set(row.id, row);
      return row;
    },
    async listBindings(expectationId) {
      return [...bindings.values()].filter((row) => row.expectationId === expectationId);
    },
    async saveBinding(row) {
      bindings.set(row.id, row);
      return row;
    },
    async saveAssessment(row) {
      assessments.set(row.id, row);
      return row;
    },
    async getAssessment(id) {
      return assessments.get(id) ?? null;
    },
    async latestAssessment(expectationId) {
      return (
        [...assessments.values()]
          .filter((row) => row.expectationId === expectationId)
          .sort((a, b) => {
            const time = b.assessedAt.localeCompare(a.assessedAt);
            if (time !== 0) return time;
            if (a.stale !== b.stale) return a.stale ? 1 : -1;
            return 0;
          })[0] ?? null
      );
    },
    async markAssessmentStale(id) {
      const row = assessments.get(id);
      if (row) assessments.set(id, { ...row, stale: true, readiness: "STALE" });
    },
    async saveWaiver(row) {
      waivers.set(row.id, row);
      return row;
    },
    async listWaivers(expectationId) {
      return [...waivers.values()].filter((row) => row.expectationId === expectationId);
    },
    async overlayWaiver(assessmentId, dimensions, waiverIds) {
      const row = assessments.get(assessmentId);
      if (row) assessments.set(assessmentId, { ...row, dimensions, waiverIds });
    },
    async listStatusMappings(workspaceId, projectId) {
      return [...mappings.values()].filter(
        (row) => row.workspaceId === workspaceId && (!projectId || !row.projectId || row.projectId === projectId),
      );
    },
    async saveStatusMapping(row) {
      mappings.set(row.id, row);
      return row;
    },
    async getProjectDefinition(workspaceId, definitionId, version) {
      return (
        [...projectDefinitions.values()].find(
          (row) => row.workspaceId === workspaceId && row.definitionId === definitionId && row.definitionVersion === version,
        ) ?? null
      );
    },
    async listProjectDefinitions(workspaceId, projectId) {
      return [...projectDefinitions.values()].filter((row) => row.workspaceId === workspaceId && row.projectId === projectId);
    },
    async saveProjectDefinition(row) {
      projectDefinitions.set(row.definitionId, row);
      return row;
    },
    async listAssessments(workspaceId, projectId) {
      const expectationIds = new Set(
        [...expectations.values()]
          .filter((row) => row.workspaceId === workspaceId && (!projectId || row.projectId === projectId))
          .map((row) => row.id),
      );
      return [...assessments.values()].filter((row) => row.workspaceId === workspaceId && expectationIds.has(row.expectationId));
    },
  };
}
