import { compareConstraint, type ObjectiveDirection } from "./invariants";

export type ConstraintSpec = {
  id: string;
  metric_key: string;
  operator?: string | null;
  threshold_value?: number | null;
  hardness: "HARD" | "SOFT";
  constraint_code?: string;
  name?: string;
  unit?: string | null;
};

export type MetricRow = {
  metric_key: string;
  value: number;
  unit?: string | null;
};

export type ConstraintEvaluation = {
  constraint_id: string;
  evaluated_value: number | null;
  passed: boolean;
  margin: number | null;
  hardness: "HARD" | "SOFT";
  unitMismatch?: boolean;
};

export function normalizeUnit(unit: string | null | undefined): string | null {
  if (unit == null) return null;
  const trimmed = unit.trim().toLowerCase();
  return trimmed.length === 0 ? null : trimmed;
}

export function unitsCompatible(expected: string | null | undefined, actual: string | null | undefined): boolean {
  const left = normalizeUnit(expected);
  const right = normalizeUnit(actual);
  if (left == null && right == null) return true;
  if (left == null || right == null) return false;
  return left === right;
}

export function evaluateConstraints(
  constraints: ConstraintSpec[],
  metrics: MetricRow[],
): ConstraintEvaluation[] {
  const byKey = new Map(metrics.map((m) => [m.metric_key, m]));
  return constraints.map((constraint) => {
    const metric = byKey.get(constraint.metric_key);
    const unitMismatch = metric
      ? !unitsCompatible(constraint.unit, metric.unit)
      : false;
    if (!metric || constraint.operator == null || constraint.threshold_value == null || unitMismatch) {
      return {
        constraint_id: constraint.id,
        evaluated_value: metric?.value ?? null,
        passed: false,
        margin: null,
        hardness: constraint.hardness,
        unitMismatch,
      };
    }
    const value = metric.value;
    const passed = compareConstraint(constraint.operator, value, Number(constraint.threshold_value));
    const threshold = Number(constraint.threshold_value);
    const margin =
      constraint.operator === "<=" || constraint.operator === "<"
        ? threshold - value
        : constraint.operator === ">=" || constraint.operator === ">"
          ? value - threshold
          : value === threshold
            ? 0
            : null;
    return {
      constraint_id: constraint.id,
      evaluated_value: value,
      passed,
      margin,
      hardness: constraint.hardness,
      unitMismatch: false,
    };
  });
}

export function isFeasible(evaluations: ConstraintEvaluation[]): boolean {
  return evaluations.filter((e) => e.hardness === "HARD").every((e) => e.passed);
}

export type ObjectiveSpec = {
  id: string;
  metric_key: string;
  direction: ObjectiveDirection;
  target_value?: number | null;
  unit?: string | null;
};

export type ParetoCandidate = {
  alternativeId: string;
  runId: string;
  metrics: MetricRow[];
  feasible: boolean;
};

export type ParetoStatus = "pareto-optimal" | "dominated" | "infeasible" | "evaluation-incomplete";

export type ParetoResult = {
  alternativeId: string;
  runId: string;
  status: ParetoStatus;
  scores: number[];
};

export type ParetoEligibility = {
  eligible: boolean;
  reason: "ok" | "infeasible" | "missing_metric" | "duplicate_metric" | "unit_mismatch" | "target_missing";
};

export function evaluateParetoEligibility(objectives: ObjectiveSpec[], candidate: ParetoCandidate): ParetoEligibility {
  if (!candidate.feasible) return { eligible: false, reason: "infeasible" };
  const counts = new Map<string, MetricRow[]>();
  for (const metric of candidate.metrics) {
    const list = counts.get(metric.metric_key) ?? [];
    list.push(metric);
    counts.set(metric.metric_key, list);
  }
  for (const objective of objectives) {
    const matches = counts.get(objective.metric_key) ?? [];
    if (matches.length === 0) return { eligible: false, reason: "missing_metric" };
    if (matches.length > 1) {
      const values = new Set(matches.map((m) => m.value));
      if (values.size > 1 || matches.length > 1) return { eligible: false, reason: "duplicate_metric" };
    }
    if (!unitsCompatible(objective.unit, matches[0].unit)) return { eligible: false, reason: "unit_mismatch" };
    if (objective.direction === "TARGET" && (objective.target_value === null || objective.target_value === undefined || Number.isNaN(Number(objective.target_value)))) {
      return { eligible: false, reason: "target_missing" };
    }
  }
  return { eligible: true, reason: "ok" };
}

function score(objectives: ObjectiveSpec[], metrics: MetricRow[]): number[] {
  const byKey = new Map(metrics.map((m) => [m.metric_key, m.value]));
  return objectives.map((objective) => {
    const raw = byKey.get(objective.metric_key);
    if (raw === undefined) return Number.POSITIVE_INFINITY;
    if (objective.direction === "MINIMIZE") return raw;
    if (objective.direction === "MAXIMIZE") return -raw;
    const target = Number(objective.target_value ?? 0);
    return Math.abs(raw - target);
  });
}

function dominates(a: number[], b: number[]): boolean {
  let strictlyBetter = false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] > b[i]) return false;
    if (a[i] < b[i]) strictlyBetter = true;
  }
  return strictlyBetter;
}

/**
 * TARGET objectives are treated as MINIMIZE |value - target_value|.
 * Weights are ignored; Pareto does not scalarize incompatible units.
 * Incomplete or unit-mismatched alternatives are evaluation-incomplete, never Pareto-optimal or dominated.
 */
export function computeParetoSet(
  objectives: ObjectiveSpec[],
  candidates: ParetoCandidate[],
): ParetoResult[] {
  const infeasible: ParetoResult[] = [];
  const incomplete: ParetoResult[] = [];
  const eligible: Array<ParetoCandidate & { scores: number[] }> = [];
  for (const candidate of candidates) {
    const eligibility = evaluateParetoEligibility(objectives, candidate);
    if (eligibility.reason === "infeasible") {
      infeasible.push({
        alternativeId: candidate.alternativeId,
        runId: candidate.runId,
        status: "infeasible",
        scores: score(objectives, candidate.metrics),
      });
      continue;
    }
    if (!eligibility.eligible) {
      incomplete.push({
        alternativeId: candidate.alternativeId,
        runId: candidate.runId,
        status: "evaluation-incomplete",
        scores: score(objectives, candidate.metrics),
      });
      continue;
    }
    eligible.push({ ...candidate, scores: score(objectives, candidate.metrics) });
  }
  return [
    ...infeasible,
    ...incomplete,
    ...eligible.map((row) => {
      const dominated = eligible.some(
        (other) => other.runId !== row.runId && dominates(other.scores, row.scores),
      );
      return {
        alternativeId: row.alternativeId,
        runId: row.runId,
        status: dominated ? ("dominated" as const) : ("pareto-optimal" as const),
        scores: row.scores,
      };
    }),
  ];
}
