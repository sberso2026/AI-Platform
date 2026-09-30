import type {
  LifecycleAssignment,
  LifecycleEvaluation,
  LifecycleGateDecision,
  LifecycleProfileSetting,
  LifecycleTransition,
} from "./types";

export interface LifecycleStore {
  getProfileSetting(workspaceId: string): Promise<LifecycleProfileSetting | null>;
  saveProfileSetting(setting: LifecycleProfileSetting): Promise<LifecycleProfileSetting>;
  listAssignments(workspaceId: string, projectId: string): Promise<LifecycleAssignment[]>;
  getAssignment(id: string): Promise<LifecycleAssignment | null>;
  upsertAssignment(assignment: LifecycleAssignment): Promise<LifecycleAssignment>;
  saveEvaluation(evaluation: LifecycleEvaluation): Promise<LifecycleEvaluation>;
  getEvaluation(id: string): Promise<LifecycleEvaluation | null>;
  latestEvaluation(assignmentId: string, gateId: string): Promise<LifecycleEvaluation | null>;
  markEvaluationStale(id: string): Promise<void>;
  saveDecision(decision: LifecycleGateDecision): Promise<LifecycleGateDecision>;
  latestDecision(evaluationId: string): Promise<LifecycleGateDecision | null>;
  appendTransition(transition: LifecycleTransition): Promise<LifecycleTransition>;
  listTransitions(assignmentId: string): Promise<LifecycleTransition[]>;
  updateAssignmentStage(
    id: string,
    fromStage: LifecycleAssignment["stage"],
    version: number,
    toStage: LifecycleAssignment["stage"],
  ): Promise<LifecycleAssignment | null>;
}

export function createMemoryLifecycleStore(): LifecycleStore {
  const settings = new Map<string, LifecycleProfileSetting>();
  const assignments = new Map<string, LifecycleAssignment>();
  const evaluations = new Map<string, LifecycleEvaluation>();
  const decisions = new Map<string, LifecycleGateDecision>();
  const transitions: LifecycleTransition[] = [];

  return {
    async getProfileSetting(workspaceId) {
      return settings.get(workspaceId) ?? null;
    },
    async saveProfileSetting(setting) {
      settings.set(setting.workspaceId, setting);
      return setting;
    },
    async listAssignments(workspaceId, projectId) {
      return [...assignments.values()].filter((row) => row.workspaceId === workspaceId && row.projectId === projectId);
    },
    async getAssignment(id) {
      return assignments.get(id) ?? null;
    },
    async upsertAssignment(assignment) {
      assignments.set(assignment.id, assignment);
      return assignment;
    },
    async saveEvaluation(evaluation) {
      evaluations.set(evaluation.id, evaluation);
      return evaluation;
    },
    async getEvaluation(id) {
      return evaluations.get(id) ?? null;
    },
    async latestEvaluation(assignmentId, gateId) {
      return (
        [...evaluations.values()]
          .filter((row) => row.assignmentId === assignmentId && row.gateId === gateId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
      );
    },
    async markEvaluationStale(id) {
      const row = evaluations.get(id);
      if (row) evaluations.set(id, { ...row, stale: true, readiness: "STALE" });
    },
    async saveDecision(decision) {
      decisions.set(decision.id, decision);
      return decision;
    },
    async latestDecision(evaluationId) {
      return (
        [...decisions.values()]
          .filter((row) => row.evaluationId === evaluationId)
          .sort((a, b) => b.decidedAt.localeCompare(a.decidedAt))[0] ?? null
      );
    },
    async updateAssignmentStage(id, fromStage, version, toStage) {
      const row = assignments.get(id);
      if (!row || row.stage !== fromStage || row.version !== version) return null;
      const next = { ...row, stage: toStage, version: row.version + 1 };
      assignments.set(id, next);
      return next;
    },
    async appendTransition(transition) {
      transitions.push(transition);
      return transition;
    },
    async listTransitions(assignmentId) {
      return transitions.filter((row) => row.assignmentId === assignmentId);
    },
  };
}
