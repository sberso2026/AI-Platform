import {
  assertConstraint,
  assertDesignVariable,
  assertObjective,
  ASSUMPTIONS_CONTEXT,
  INTERFACES_CONTEXT,
  REQUIREMENTS_CONTEXT,
} from "./invariants";

export type PreflightFailure = { code: string; message: string };

export type PreflightInput = {
  workspaceId?: string | null;
  projectId?: string | null;
  systemScopeCount: number;
  baselineId?: string | null;
  baselineStatus?: string | null;
  baselineWorkspaceId?: string | null;
  baselineProjectId?: string | null;
  decisionId?: string | null;
  decisionWorkspaceId?: string | null;
  decisionProjectId?: string | null;
  requirementsContext: string;
  assumptionsContext: string;
  interfacesContext: string;
  objectiveCount: number;
  constraintCount?: number;
  alternativeCount: number;
  requirementLinkCount?: number;
  materialAssumptionLinkCount?: number;
  interfaceLinkCount?: number;
  objectives?: Array<Record<string, unknown>>;
  constraints?: Array<Record<string, unknown>>;
  variables?: Array<Record<string, unknown>>;
};

export type PreflightResult = { ok: boolean; failures: PreflightFailure[] };

export function preflightStudy(input: PreflightInput): PreflightResult {
  const failures: PreflightFailure[] = [];
  if (!input.workspaceId) failures.push({ code: "workspace", message: "workspace required" });
  if (!input.projectId) failures.push({ code: "project", message: "project required" });
  if (input.systemScopeCount < 1) {
    failures.push({ code: "system_scope", message: "READY study requires at least one System SCOPED_TO" });
  }
  if (!input.baselineId) {
    failures.push({ code: "baseline", message: "READY study requires a frozen Configuration Baseline" });
  } else if (input.baselineStatus !== "frozen") {
    failures.push({
      code: "baseline_status",
      message: "Configuration Baseline must be frozen; draft baselines cannot execute",
    });
  }
  if (input.baselineWorkspaceId && input.workspaceId && input.baselineWorkspaceId !== input.workspaceId) {
    failures.push({ code: "baseline_workspace", message: "baseline must belong to the same workspace" });
  }
  if (input.baselineProjectId && input.projectId && input.baselineProjectId !== input.projectId) {
    failures.push({ code: "baseline_project", message: "baseline must belong to the same project" });
  }
  if (!input.decisionId) {
    failures.push({ code: "decision", message: "READY study requires a Decision context" });
  }
  if (input.decisionWorkspaceId && input.workspaceId && input.decisionWorkspaceId !== input.workspaceId) {
    failures.push({ code: "decision_workspace", message: "decision must belong to the same workspace" });
  }
  if (input.decisionProjectId && input.projectId && input.decisionProjectId !== input.projectId) {
    failures.push({ code: "decision_project", message: "decision must belong to the same project" });
  }
  if (!(REQUIREMENTS_CONTEXT as readonly string[]).includes(input.requirementsContext) || input.requirementsContext === "UNDECLARED") {
    failures.push({
      code: "requirements_context",
      message: "requirements context must be DECLARED or NONE_APPLICABLE",
    });
  } else if (input.requirementsContext === "DECLARED" && (input.requirementLinkCount ?? 0) < 1) {
    failures.push({
      code: "requirements_declared_empty",
      message: "requirements_context=DECLARED requires at least one in-scope Requirement linked CONSTRAINED_BY",
    });
  }
  if (!(ASSUMPTIONS_CONTEXT as readonly string[]).includes(input.assumptionsContext) || input.assumptionsContext === "UNDECLARED") {
    failures.push({
      code: "assumptions_context",
      message: "assumptions context must be DECLARED or NONE_MATERIAL",
    });
  } else if (input.assumptionsContext === "DECLARED" && (input.materialAssumptionLinkCount ?? 0) < 1) {
    failures.push({
      code: "assumptions_declared_empty",
      message: "assumptions_context=DECLARED requires at least one in-scope material Assumption linked BASED_ON",
    });
  }
  if (!(INTERFACES_CONTEXT as readonly string[]).includes(input.interfacesContext) || input.interfacesContext === "UNDECLARED") {
    failures.push({
      code: "interfaces_context",
      message: "interfaces context must be DECLARED or NONE_APPLICABLE",
    });
  } else if (input.interfacesContext === "DECLARED" && (input.interfaceLinkCount ?? 0) < 1) {
    failures.push({
      code: "interfaces_declared_empty",
      message: "interfaces_context=DECLARED requires at least one in-scope Interface linked CONSTRAINED_BY",
    });
  }
  if (input.objectiveCount < 1) {
    failures.push({ code: "objectives", message: "READY study requires at least one Objective" });
  }
  if (input.alternativeCount < 1) {
    failures.push({
      code: "alternatives",
      message: "READY study requires at least one Alternative (no autonomous generator in A5)",
    });
  }
  for (const objective of input.objectives ?? []) {
    try {
      assertObjective({
        objective_code: String(objective.objective_code ?? ""),
        name: String(objective.name ?? ""),
        metric_key: String(objective.metric_key ?? ""),
        direction: String(objective.direction ?? ""),
        target_value: (objective.target_value as number | null) ?? null,
        unit: (objective.unit as string | null) ?? null,
        priority: (objective.priority as number | null) ?? null,
        weight: (objective.weight as number | null) ?? null,
      });
    } catch (error) {
      failures.push({ code: "objective_invalid", message: error instanceof Error ? error.message : String(error) });
    }
  }
  for (const constraint of input.constraints ?? []) {
    try {
      assertConstraint({
        constraint_code: String(constraint.constraint_code ?? ""),
        name: String(constraint.name ?? ""),
        constraint_kind: String(constraint.constraint_kind ?? ""),
        metric_key: String(constraint.metric_key ?? ""),
        operator: (constraint.operator as string | null) ?? null,
        threshold_value: (constraint.threshold_value as number | null) ?? null,
        unit: (constraint.unit as string | null) ?? null,
        hardness: String(constraint.hardness ?? "HARD"),
        source_object_type: (constraint.source_object_type as string | null) ?? null,
        source_object_id: (constraint.source_object_id as string | null) ?? null,
      });
    } catch (error) {
      failures.push({ code: "constraint_invalid", message: error instanceof Error ? error.message : String(error) });
    }
  }
  for (const variable of input.variables ?? []) {
    try {
      const allowed = variable.allowed_values;
      assertDesignVariable({
        variable_code: String(variable.variable_code ?? ""),
        name: String(variable.name ?? ""),
        variable_type: String(variable.variable_type ?? ""),
        unit: (variable.unit as string | null) ?? null,
        lower_bound: (variable.lower_bound as number | null) ?? null,
        upper_bound: (variable.upper_bound as number | null) ?? null,
        allowed_values: Array.isArray(allowed) ? allowed : null,
        default_value: (variable.default_value as string | null) ?? null,
        description: (variable.description as string | null) ?? null,
      });
    } catch (error) {
      failures.push({ code: "variable_invalid", message: error instanceof Error ? error.message : String(error) });
    }
  }
  return { ok: failures.length === 0, failures };
}

export function contextStaleness(input: {
  studyBaselineId?: string | null;
  currentFrozenBaselineId?: string | null;
  currentAcceptedBaselineId?: string | null;
  pinnedContextFingerprint?: string | null;
  currentContextFingerprint?: string | null;
}): "CURRENT" | "STALE" {
  const current = input.currentFrozenBaselineId ?? input.currentAcceptedBaselineId ?? null;
  if (!input.studyBaselineId) return "STALE";
  if (current && input.studyBaselineId !== current) return "STALE";
  if (input.pinnedContextFingerprint && input.currentContextFingerprint) {
    return input.pinnedContextFingerprint === input.currentContextFingerprint ? "CURRENT" : "STALE";
  }
  return "CURRENT";
}
