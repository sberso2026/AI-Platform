/**
 * EOS 3.4 Optimization Intelligence — OPTIMIZATION_RESULT != ENGINEERING_APPROVAL.
 * OPTIMIZATION_RUN != DECISION. Does not inherit D1 qualification.
 */

import { buildEos3Provenance } from "../commerce/eos3-provenance";

export const AI_OPTIMIZATION_SELECTION_AUTHORITY = false as const;
export const OPTIMIZATION_DOES_NOT_INHERIT_D1_QUALIFICATION = true as const;

export type VariableType = "continuous" | "integer" | "categorical" | "boolean";

export type ObjectiveFunctionClass = "DETERMINISTIC_OBJECTIVE" | "HEURISTIC_OBJECTIVE" | "AI_ESTIMATED_OBJECTIVE";
export type ConstraintFunctionClass = "deterministic" | "rule_based" | "ai_inferred";

export type Eos3OptimizationVariable = {
  variableId: string;
  key: string;
  type: VariableType;
  lower: number | null;
  upper: number | null;
  categories: string[] | null;
  /** No arbitrary executable code allowed. */
  expressionAllowed: false;
};

export type Eos3OptimizationObjectiveFn = {
  key: string;
  direction: "minimize" | "maximize";
  classification: ObjectiveFunctionClass;
  unit: string | null;
};

export type Eos3OptimizationConstraintFn = {
  key: string;
  kind: "hard" | "soft";
  classification: ConstraintFunctionClass;
  limit: number;
  /** Evaluates candidate variable map — deterministic closed form only in this phase. */
  evaluate: (vars: Record<string, number>) => number;
};

export type Eos3OptimizationProblem = {
  problemId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  variables: Eos3OptimizationVariable[];
  objectives: Eos3OptimizationObjectiveFn[];
  constraints: Eos3OptimizationConstraintFn[];
  method: "bounded_enumeration" | "grid_search";
  sourceRevisionId: string | null;
  baselineContextId: string | null;
  qualificationState: "NOT_QUALIFIED" | "IMPLEMENTED";
  inheritsD1Qualification: false;
  provenance: Record<string, unknown>;
};

export type Eos3OptimizationCandidate = {
  candidateId: string;
  variables: Record<string, number>;
  objectives: Record<string, number>;
  constraintValues: Record<string, number>;
  feasible: boolean;
  hardViolations: string[];
  dominated: boolean;
  rank: number | null;
  method: string;
  sourceRevisionId: string | null;
  qualificationState: "NOT_QUALIFIED";
  explanation: string;
  provenance: Record<string, unknown>;
};

export type Eos3OptimizationRunResult = {
  runId: string;
  problemId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  candidates: Eos3OptimizationCandidate[];
  feasibleCount: number;
  status: "COMPLETE" | "NO_FEASIBLE_SOLUTION";
  humanSelectionCandidateId: string | null;
  linkedDecisionCaseId: string | null;
  qualificationState: "NOT_QUALIFIED";
  inheritsD1Qualification: false;
  reproducibleSeed: string;
  audit: Array<{ action: string; actorId: string | null; at: string; detail: Record<string, unknown> }>;
  provenance: Record<string, unknown>;
  createdAt: string;
};

function id(): string {
  return crypto.randomUUID();
}
function now(): string {
  return new Date().toISOString();
}

export function createOptimizationProblem(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  variables: Eos3OptimizationVariable[];
  objectives: Eos3OptimizationObjectiveFn[];
  constraints: Eos3OptimizationConstraintFn[];
  method?: Eos3OptimizationProblem["method"];
  sourceRevisionId?: string | null;
  baselineContextId?: string | null;
}): Eos3OptimizationProblem {
  for (const v of input.variables) {
    if ((v as { expression?: unknown }).expression) throw new Error("executable_variable_forbidden");
  }
  const problemId = id();
  return {
    problemId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    variables: input.variables.map((v) => ({ ...v, expressionAllowed: false as const })),
    objectives: input.objectives,
    constraints: input.constraints,
    method: input.method ?? "bounded_enumeration",
    sourceRevisionId: input.sourceRevisionId ?? null,
    baselineContextId: input.baselineContextId ?? null,
    qualificationState: "NOT_QUALIFIED",
    inheritsD1Qualification: false,
    provenance: buildEos3Provenance({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      objectId: problemId,
      revisionId: input.sourceRevisionId ?? null,
      source: "eos3.optimization.intelligence",
      actorId: null,
      authority: null,
      method: "createOptimizationProblem",
      toolOrModel: "bounded_enumeration",
      evidenceClassification: "RESULT",
      qualificationState: "NOT_QUALIFIED",
    }),
  };
}

/** Deterministic enumeration over discrete integer grids — reproducible. */
export function enumerateCandidates(
  problem: Eos3OptimizationProblem,
  grids: Record<string, number[]>,
): Eos3OptimizationCandidate[] {
  const keys = problem.variables.map((v) => v.key);
  const lists = keys.map((k) => grids[k] ?? []);
  const out: Eos3OptimizationCandidate[] = [];

  function walk(i: number, acc: Record<string, number>) {
    if (i >= keys.length) {
      const objectives: Record<string, number> = {};
      for (const obj of problem.objectives) {
        // Deterministic objective evaluation from variables (synthetic closed form)
        if (obj.key === "weight") objectives.weight = acc.span ?? acc.size ?? Object.values(acc).reduce((a, b) => a + b, 0);
        else if (obj.key === "cost") objectives.cost = (acc.span ?? acc.size ?? 1) * (acc.grade ?? acc.thickness ?? 1) * 10;
        else if (obj.key === "capacity_util") objectives.capacity_util = (acc.load ?? 0) / Math.max(acc.capacity ?? 1, 1);
        else objectives[obj.key] = Object.values(acc).reduce((a, b) => a + b, 0);
      }
      const constraintValues: Record<string, number> = {};
      const hardViolations: string[] = [];
      for (const c of problem.constraints) {
        const val = c.evaluate(acc);
        constraintValues[c.key] = val;
        if (c.kind === "hard" && val > c.limit) hardViolations.push(c.key);
      }
      const feasible = hardViolations.length === 0;
      out.push({
        candidateId: `cand:${keys.map((k) => `${k}=${acc[k]}`).join(",")}`,
        variables: { ...acc },
        objectives,
        constraintValues,
        feasible,
        hardViolations,
        dominated: false,
        rank: null,
        method: problem.method,
        sourceRevisionId: problem.sourceRevisionId,
        qualificationState: "NOT_QUALIFIED",
        explanation: feasible
          ? `Feasible under hard constraints; objectives=${JSON.stringify(objectives)}`
          : `Infeasible: violated ${hardViolations.join(",")}`,
        provenance: buildEos3Provenance({
          tenantId: problem.tenantId,
          workspaceId: problem.workspaceId,
          projectId: problem.projectId,
          objectId: problem.problemId,
          revisionId: problem.sourceRevisionId,
          source: "eos3.optimization.enumeration",
          actorId: null,
          authority: null,
          method: problem.method,
          toolOrModel: "bounded_enumeration",
          evidenceClassification: "RESULT",
          qualificationState: "NOT_QUALIFIED",
        }),
      });
      return;
    }
    const k = keys[i]!;
    for (const val of lists[i]!) {
      walk(i + 1, { ...acc, [k]: val });
    }
  }
  walk(0, {});
  return out;
}

export function markParetoDominance(
  candidates: Eos3OptimizationCandidate[],
  objectives: Eos3OptimizationObjectiveFn[],
): Eos3OptimizationCandidate[] {
  return candidates.map((a) => {
    if (!a.feasible) return { ...a, dominated: true };
    const dominated = candidates.some((b) => {
      if (!b.feasible || b.candidateId === a.candidateId) return false;
      let betterOrEqual = true;
      let strictlyBetter = false;
      for (const obj of objectives) {
        const va = a.objectives[obj.key] ?? 0;
        const vb = b.objectives[obj.key] ?? 0;
        const bBetterOrEqual = obj.direction === "minimize" ? vb <= va : vb >= va;
        const bStrict = obj.direction === "minimize" ? vb < va : vb > va;
        if (!bBetterOrEqual) betterOrEqual = false;
        if (bStrict) strictlyBetter = true;
      }
      return betterOrEqual && strictlyBetter;
    });
    return { ...a, dominated };
  });
}

export function runBoundedOptimization(
  problem: Eos3OptimizationProblem,
  grids: Record<string, number[]>,
  actorId: string | null = null,
): Eos3OptimizationRunResult {
  const seed = JSON.stringify({
    problemId: problem.problemId,
    grids,
    method: problem.method,
    variables: problem.variables.map((v) => v.key),
  });
  let candidates = enumerateCandidates(problem, grids);
  candidates = markParetoDominance(candidates, problem.objectives);
  const feasible = candidates.filter((c) => c.feasible);
  // Rank feasible non-dominated by first objective then second
  const ranked = [...feasible]
    .filter((c) => !c.dominated)
    .sort((a, b) => {
      for (const obj of problem.objectives) {
        const va = a.objectives[obj.key] ?? 0;
        const vb = b.objectives[obj.key] ?? 0;
        if (va === vb) continue;
        return obj.direction === "minimize" ? va - vb : vb - va;
      }
      return a.candidateId.localeCompare(b.candidateId);
    })
    .map((c, i) => ({ ...c, rank: i + 1 }));

  const rankedIds = new Set(ranked.map((r) => r.candidateId));
  candidates = candidates.map((c) => ranked.find((r) => r.candidateId === c.candidateId) ?? c);

  const runId = id();
  return {
    runId,
    problemId: problem.problemId,
    tenantId: problem.tenantId,
    workspaceId: problem.workspaceId,
    projectId: problem.projectId,
    candidates,
    feasibleCount: feasible.length,
    status: feasible.length === 0 ? "NO_FEASIBLE_SOLUTION" : "COMPLETE",
    humanSelectionCandidateId: null,
    linkedDecisionCaseId: null,
    qualificationState: "NOT_QUALIFIED",
    inheritsD1Qualification: false,
    reproducibleSeed: seed,
    audit: [
      {
        action: "optimization_executed",
        actorId,
        at: now(),
        detail: { candidateCount: candidates.length, feasibleCount: feasible.length, ranked: rankedIds.size },
      },
    ],
    provenance: buildEos3Provenance({
      tenantId: problem.tenantId,
      workspaceId: problem.workspaceId,
      projectId: problem.projectId,
      objectId: runId,
      revisionId: problem.sourceRevisionId,
      source: "eos3.optimization.run",
      actorId,
      authority: null,
      method: problem.method,
      toolOrModel: "bounded_enumeration",
      evidenceClassification: "RESULT",
      qualificationState: "NOT_QUALIFIED",
    }),
    createdAt: now(),
  };
}

export function selectOptimizationCandidate(
  run: Eos3OptimizationRunResult,
  candidateId: string,
  actor: { actorId: string; role: "human" | "ai" },
): Eos3OptimizationRunResult {
  if (actor.role === "ai") throw new Error("ai_optimization_selection_denied");
  const cand = run.candidates.find((c) => c.candidateId === candidateId);
  if (!cand) throw new Error("candidate_not_found");
  if (!cand.feasible) throw new Error("infeasible_candidate_not_selectable");
  return {
    ...run,
    humanSelectionCandidateId: candidateId,
    audit: [
      ...run.audit,
      { action: "human_selection", actorId: actor.actorId, at: now(), detail: { candidateId } },
    ],
  };
}

export function authorizeOptimizationAccess(
  caller: {
    authenticated: boolean;
    tenantId: string | null;
    workspaceId: string | null;
    eos3Entitled: boolean;
    eos3Enrolled: boolean;
    productionEnvironment?: boolean;
  },
  target: { tenantId: string; workspaceId: string },
): { allowed: boolean; reason?: string } {
  if (!caller.authenticated) return { allowed: false, reason: "unauthenticated" };
  if (caller.productionEnvironment) return { allowed: false, reason: "production_denied" };
  if (!caller.eos3Entitled || !caller.eos3Enrolled) return { allowed: false, reason: "not_entitled" };
  if (caller.tenantId !== target.tenantId) return { allowed: false, reason: "tenant_mismatch" };
  if (caller.workspaceId !== target.workspaceId) return { allowed: false, reason: "workspace_mismatch" };
  return { allowed: true };
}

export function linkOptimizationToDecision(
  run: Eos3OptimizationRunResult,
  decisionCaseId: string,
): Eos3OptimizationRunResult {
  return {
    ...run,
    linkedDecisionCaseId: decisionCaseId,
    audit: [
      ...run.audit,
      { action: "linked_to_decision_case", actorId: null, at: now(), detail: { decisionCaseId } },
    ],
  };
}
