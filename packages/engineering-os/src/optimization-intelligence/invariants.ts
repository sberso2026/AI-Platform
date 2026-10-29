/**
 * EOS-A5 Optimization Intelligence invariants.
 */

export const LIFECYCLE_STAGES = [
  "CONCEPT",
  "PREFEASIBILITY",
  "FEASIBILITY",
  "FEED",
  "DETAILED_DESIGN",
  "CONSTRUCTION",
  "COMMISSIONING",
  "OPERATIONS",
  "MODIFICATION",
] as const;
export type LifecycleStage = (typeof LIFECYCLE_STAGES)[number];

export const STUDY_STATUSES = [
  "draft",
  "defined",
  "ready",
  "running",
  "evaluated",
  "reviewed",
  "closed",
  "superseded",
  "cancelled",
] as const;
export type StudyStatus = (typeof STUDY_STATUSES)[number];

export const REQUIREMENTS_CONTEXT = ["UNDECLARED", "DECLARED", "NONE_APPLICABLE"] as const;
export type RequirementsContext = (typeof REQUIREMENTS_CONTEXT)[number];
export const ASSUMPTIONS_CONTEXT = ["UNDECLARED", "DECLARED", "NONE_MATERIAL"] as const;
export type AssumptionsContext = (typeof ASSUMPTIONS_CONTEXT)[number];
export const INTERFACES_CONTEXT = ["UNDECLARED", "DECLARED", "NONE_APPLICABLE"] as const;
export type InterfacesContext = (typeof INTERFACES_CONTEXT)[number];

export const OBJECTIVE_DIRECTIONS = ["MINIMIZE", "MAXIMIZE", "TARGET"] as const;
export type ObjectiveDirection = (typeof OBJECTIVE_DIRECTIONS)[number];

export const CONSTRAINT_KINDS = [
  "REQUIREMENT",
  "INTERFACE",
  "ASSUMPTION",
  "RULE",
  "ANALYSIS_LIMIT",
  "DESIGN_CRITERION",
] as const;
export type ConstraintKind = (typeof CONSTRAINT_KINDS)[number];

export const CONSTRAINT_OPERATORS = ["<=", ">=", "=", "<", ">"] as const;
export type ConstraintOperator = (typeof CONSTRAINT_OPERATORS)[number];

export const CONSTRAINT_HARDNESS = ["HARD", "SOFT"] as const;
export type ConstraintHardness = (typeof CONSTRAINT_HARDNESS)[number];

export const VARIABLE_TYPES = ["CONTINUOUS", "INTEGER", "DISCRETE", "CATEGORICAL", "BOOLEAN"] as const;
export type VariableType = (typeof VARIABLE_TYPES)[number];

export const ALTERNATIVE_STATUSES = ["draft", "active", "withdrawn", "evaluated"] as const;
export type AlternativeStatus = (typeof ALTERNATIVE_STATUSES)[number];

export const RUN_STATUSES = ["queued", "running", "succeeded", "failed", "cancelled"] as const;
export type RunStatus = (typeof RUN_STATUSES)[number];

export const CONTEXT_DECLARATIONS = [
  "UNDECLARED",
  "DECLARED",
  "NONE_APPLICABLE",
  "NONE_MATERIAL",
] as const;
export type ContextDeclaration = (typeof CONTEXT_DECLARATIONS)[number];

export const MUTABLE_STUDY_STATUSES = ["draft", "defined"] as const;

export const RESULT_SOURCE_KINDS = ["MANUAL", "EXECUTION_HOST", "ADAPTER"] as const;
export type ResultSourceKind = (typeof RESULT_SOURCE_KINDS)[number];

export const OPTIMIZATION_JOB_TYPE = "engineering.optimization.evaluate";

function assertIn<T extends string>(value: string, allowed: readonly T[], label: string): asserts value is T {
  if (!(allowed as readonly string[]).includes(value)) {
    throw new Error(`Unknown ${label}: ${value}`);
  }
}

export function assertLifecycleStage(value: string): asserts value is LifecycleStage {
  assertIn(value, LIFECYCLE_STAGES, "lifecycle stage");
}
export function assertStudyStatus(value: string): asserts value is StudyStatus {
  assertIn(value, STUDY_STATUSES, "study status");
}
export function assertObjectiveDirection(value: string): asserts value is ObjectiveDirection {
  assertIn(value, OBJECTIVE_DIRECTIONS, "objective direction");
}
export function assertConstraintKind(value: string): asserts value is ConstraintKind {
  assertIn(value, CONSTRAINT_KINDS, "constraint kind");
}
export function assertConstraintOperator(value: string): asserts value is ConstraintOperator {
  assertIn(value, CONSTRAINT_OPERATORS, "constraint operator");
}
export function assertConstraintHardness(value: string): asserts value is ConstraintHardness {
  assertIn(value, CONSTRAINT_HARDNESS, "constraint hardness");
}
export function assertVariableType(value: string): asserts value is VariableType {
  assertIn(value, VARIABLE_TYPES, "variable type");
}
export function assertRunStatus(value: string): asserts value is RunStatus {
  assertIn(value, RUN_STATUSES, "run status");
}
export function assertResultSourceKind(value: string): asserts value is ResultSourceKind {
  assertIn(value, RESULT_SOURCE_KINDS, "result source kind");
}

export function assertAllowedValues(value: unknown) {
  if (value == null) return;
  if (!Array.isArray(value)) throw new Error("design variable allowed_values must be an array");
}

export function assertStudyMutable(status: string): void {
  if (!(MUTABLE_STUDY_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`Study is locked for definition changes in status ${status}.`);
  }
}

export function assertObjective(input: {
  objective_code: string;
  name: string;
  metric_key: string;
  direction: string;
  target_value?: number | null;
  unit?: string | null;
  priority?: number | null;
  weight?: number | null;
}) {
  const objective_code = input.objective_code.trim();
  const name = input.name.trim();
  const metric_key = input.metric_key.trim();
  if (!objective_code || !name || !metric_key) {
    throw new Error("Objective code, name, and metric_key are required.");
  }
  assertObjectiveDirection(input.direction);
  if (input.direction === "TARGET" && (input.target_value === null || input.target_value === undefined)) {
    throw new Error("TARGET objectives require an explicit target_value (minimize |value - target|).");
  }
  if (input.weight != null && !Number.isFinite(Number(input.weight))) {
    throw new Error("Objective weight must be numeric when provided; weights never auto-scalarize Pareto.");
  }
  return {
    objective_code,
    name,
    metric_key,
    direction: input.direction,
    target_value: input.target_value ?? null,
    unit: input.unit ?? null,
    priority: input.priority ?? null,
    weight: input.weight ?? null,
  };
}

export function assertConstraint(input: {
  constraint_code: string;
  name: string;
  constraint_kind: string;
  metric_key: string;
  operator?: string | null;
  threshold_value?: number | null;
  unit?: string | null;
  hardness?: string;
  source_object_type?: string | null;
  source_object_id?: string | null;
}) {
  const constraint_code = input.constraint_code.trim();
  const name = input.name.trim();
  const metric_key = input.metric_key.trim();
  if (!constraint_code || !name || !metric_key) {
    throw new Error("Constraint code, name, and metric_key are required.");
  }
  if (/[;]|--|\/\*|\b(select|insert|update|delete|drop|exec)\b/i.test(metric_key) || /[;]|--|\/\*/.test(name)) {
    throw new Error("Constraints cannot store executable SQL or code expressions.");
  }
  assertConstraintKind(input.constraint_kind);
  const hardness = input.hardness ?? "HARD";
  assertConstraintHardness(hardness);
  if (input.operator != null && input.operator !== "") {
    assertConstraintOperator(input.operator);
    if (input.threshold_value === null || input.threshold_value === undefined) {
      throw new Error("Numeric constraint operators require a threshold_value.");
    }
  }
  return {
    constraint_code,
    name,
    constraint_kind: input.constraint_kind,
    metric_key,
    operator: input.operator ?? null,
    threshold_value: input.threshold_value ?? null,
    unit: input.unit ?? null,
    hardness,
    source_object_type: input.source_object_type ?? null,
    source_object_id: input.source_object_id ?? null,
  };
}

export function assertDesignVariable(input: {
  variable_code: string;
  name: string;
  variable_type: string;
  unit?: string | null;
  lower_bound?: number | null;
  upper_bound?: number | null;
  allowed_values?: unknown[] | null;
  default_value?: string | null;
  description?: string | null;
}) {
  const variable_code = input.variable_code.trim();
  const name = input.name.trim();
  if (!variable_code || !name) throw new Error("Design variable code and name are required.");
  assertVariableType(input.variable_type);
  assertAllowedValues(input.allowed_values);
  if (input.variable_type === "CONTINUOUS" || input.variable_type === "INTEGER") {
    if (input.lower_bound == null || input.upper_bound == null) {
      throw new Error(`${input.variable_type} variables require lower_bound and upper_bound.`);
    }
    if (Number(input.lower_bound) > Number(input.upper_bound)) {
      throw new Error("Design variable lower_bound cannot exceed upper_bound.");
    }
  }
  if (input.variable_type === "CATEGORICAL" || input.variable_type === "DISCRETE") {
    if (!input.allowed_values || input.allowed_values.length === 0) {
      throw new Error(`${input.variable_type} variables require allowed_values.`);
    }
  }
  if (input.variable_type === "BOOLEAN" && input.allowed_values && input.allowed_values.length > 0) {
    const ok = input.allowed_values.every((v) => v === true || v === false || v === "true" || v === "false");
    if (!ok) throw new Error("BOOLEAN allowed_values must be true/false.");
  }
  return {
    variable_code,
    name,
    variable_type: input.variable_type,
    unit: input.unit ?? null,
    lower_bound: input.lower_bound ?? null,
    upper_bound: input.upper_bound ?? null,
    allowed_values: input.allowed_values ?? null,
    default_value: input.default_value ?? null,
    description: input.description ?? null,
  };
}

export function assertScenario(input: { scenario_code: string; name: string; description?: string | null }) {
  const scenario_code = input.scenario_code.trim();
  const name = input.name.trim();
  if (!scenario_code || !name) throw new Error("Scenario code and name are required.");
  return { scenario_code, name, description: input.description ?? null };
}

export function assertAlternativeValue(input: {
  variable_type: string;
  numeric_value?: number | null;
  text_value?: string | null;
  lower_bound?: number | null;
  upper_bound?: number | null;
  allowed_values?: unknown[] | null;
}) {
  if (input.variable_type === "CONTINUOUS" || input.variable_type === "INTEGER") {
    if (input.numeric_value == null) throw new Error("Numeric alternative value required.");
    if (input.lower_bound != null && input.numeric_value < Number(input.lower_bound)) {
      throw new Error("Alternative value is below variable lower_bound.");
    }
    if (input.upper_bound != null && input.numeric_value > Number(input.upper_bound)) {
      throw new Error("Alternative value is above variable upper_bound.");
    }
  }
  if (input.variable_type === "CATEGORICAL" || input.variable_type === "DISCRETE" || input.variable_type === "BOOLEAN") {
    const raw = input.text_value ?? (input.numeric_value != null ? String(input.numeric_value) : null);
    if (raw == null) throw new Error("Categorical/discrete/boolean alternative value required.");
    if (input.allowed_values && input.allowed_values.length > 0) {
      const allowed = input.allowed_values.map((v) => String(v));
      if (!allowed.includes(raw) && !allowed.includes(String(input.numeric_value))) {
        throw new Error("Alternative value is not in allowed_values.");
      }
    }
  }
}

export function compareConstraint(operator: string, evaluated: number, threshold: number): boolean {
  switch (operator) {
    case "<=":
      return evaluated <= threshold;
    case ">=":
      return evaluated >= threshold;
    case "=":
      return evaluated === threshold;
    case "<":
      return evaluated < threshold;
    case ">":
      return evaluated > threshold;
    default:
      throw new Error(`Unknown constraint operator: ${operator}`);
  }
}
