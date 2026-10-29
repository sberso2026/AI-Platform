import type { EffectiveLifecycle, LifecycleAssignment, LifecycleScopeType, LifecycleStage } from "./types";

export function resolveEffectiveStage(input: {
  assignments: readonly LifecycleAssignment[];
  projectId: string;
  scopeType: LifecycleScopeType;
  scopeId: string;
  parentScopeType?: LifecycleScopeType | null;
  parentScopeId?: string | null;
}): EffectiveLifecycle {
  const explicit = input.assignments.find(
    (row) =>
      row.projectId === input.projectId &&
      row.scopeType === input.scopeType &&
      row.scopeId === input.scopeId,
  );
  if (explicit) return { stage: explicit.stage, source: "explicit", assignment: explicit };

  if (input.parentScopeType && input.parentScopeId) {
    const parent = input.assignments.find(
      (row) =>
        row.projectId === input.projectId &&
        row.scopeType === input.parentScopeType &&
        row.scopeId === input.parentScopeId,
    );
    if (parent) return { stage: parent.stage, source: "parent", assignment: parent };
  }

  const project = input.assignments.find(
    (row) => row.projectId === input.projectId && row.scopeType === "PROJECT" && row.scopeId === input.projectId,
  );
  if (project) return { stage: project.stage, source: "project", assignment: project };

  return { stage: "UNKNOWN", source: "UNKNOWN" };
}

export function mixedScopeView(
  assignments: readonly LifecycleAssignment[],
): Array<{ scopeType: LifecycleScopeType; scopeId: string; stage: LifecycleStage }> {
  return assignments.map((row) => ({ scopeType: row.scopeType, scopeId: row.scopeId, stage: row.stage }));
}
