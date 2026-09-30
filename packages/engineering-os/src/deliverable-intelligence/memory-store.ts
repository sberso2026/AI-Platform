import type {
  DeliverableAssessment,
  DeliverableArtifactBinding,
  DeliverableExpectation,
  DeliverableProfileSetting,
  DeliverableWaiver,
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
}

export function createMemoryDeliverableStore(): DeliverableStore {
  const settings = new Map<string, DeliverableProfileSetting>();
  const expectations = new Map<string, DeliverableExpectation>();
  const bindings = new Map<string, DeliverableArtifactBinding>();
  const assessments = new Map<string, DeliverableAssessment>();
  const waivers = new Map<string, DeliverableWaiver>();

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
          .sort((a, b) => b.assessedAt.localeCompare(a.assessedAt))[0] ?? null
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
  };
}
