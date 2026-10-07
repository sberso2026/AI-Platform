import type { EuC5CheckResult, EuC5FamilyId, EuC5UndeterminedReason, StructuralDemandResult } from "@rtb/types";
import {
  D1C_PUNCHING_ACTIONS_REUSED,
  D1C_SHEAR_DEMAND_REUSED,
  D1C_TORSION_DEMAND_REUSED,
  EU_C5_IMPLEMENTATION_VERSION,
  EU_C5_PUNCHING_BLOCKED_RULE_IDS,
  EU_C5_SHEAR_BLOCKED_RULE_IDS,
  EU_C5_TORSION_BLOCKED_RULE_IDS,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  NUMERICAL_EU_CONCRETE_SHEAR_IMPLEMENTED,
  NUMERICAL_EU_PUNCHING_SHEAR_IMPLEMENTED,
  PARALLEL_EU_SHEAR_DEMAND_ENGINE_CREATED,
} from "@rtb/types";
import { consumeConcreteDemandHandoff } from "../orchestration";
import { assertEuC5FailClosed } from "./policy";
import { euC5ResultFingerprint } from "./invalidation";

export type EuC5EvaluateInput = {
  demand: Pick<StructuralDemandResult, "resultId" | "capacityPresent" | "memberId" | "shear" | "torsion" | "combinationId">;
  geometryFingerprint?: string | null;
  reinforcementFingerprint?: string | null;
  standardProfileContext?: string;
  ndpContext?: string;
};

function undetermined(
  family: EuC5FamilyId,
  input: EuC5EvaluateInput,
  demand: EuC5CheckResult["demand"],
  failReason: EuC5UndeterminedReason,
  governingRuleIds: readonly string[],
  warnings: readonly string[],
): EuC5CheckResult {
  const result: EuC5CheckResult = {
    ok: false,
    family,
    methodId: null,
    demand,
    resistance: null,
    units: { demand: demand.unit, resistance: null },
    checkState: "CHECK_UNDETERMINED",
    governingRuleIds,
    parameterVersions: [EU_C5_IMPLEMENTATION_VERSION],
    geometryFingerprint: input.geometryFingerprint ?? null,
    reinforcementFingerprint: input.reinforcementFingerprint ?? null,
    standardProfileContext: input.standardProfileContext ?? "EN 1992 / EN_1992_1_1 / UNKNOWN_PENDING_CONFIRMATION",
    ndpContext: input.ndpContext ?? "NO_DEFAULT_NATIONAL_ANNEX",
    validationState: "NOT_STARTED",
    conformanceState: EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
    warnings,
    provenance: "EOS-D1E-EU-C5 fail-closed: no governed numerical method",
    failReason,
    fingerprint: "",
  };
  return { ...result, fingerprint: euC5ResultFingerprint(result, input.demand.resultId, input.demand.combinationId ?? null) };
}

export function evaluateEuC5Shear(input: EuC5EvaluateInput): EuC5CheckResult {
  assertEuC5FailClosed();
  if (PARALLEL_EU_SHEAR_DEMAND_ENGINE_CREATED) throw new Error("parallel EU shear demand engine is forbidden");
  if (NUMERICAL_EU_CONCRETE_SHEAR_IMPLEMENTED) throw new Error("C5 must not claim numerical EU shear implementation");
  if (!D1C_SHEAR_DEMAND_REUSED) throw new Error("C5 must reuse D1C shear demand");
  consumeConcreteDemandHandoff(input.demand);
  const shear = input.demand.shear;
  if (!shear || !Number.isFinite(shear.value) || !shear.unit?.trim()) {
    return undetermined(
      "SHEAR",
      input,
      { value: null, unit: null, source: "D1C" },
      "UNSUPPORTED_RULE_APPLICABILITY",
      EU_C5_SHEAR_BLOCKED_RULE_IDS,
      ["D1C shear demand missing or untyped"],
    );
  }
  return undetermined(
    "SHEAR",
    input,
    { value: shear.value, unit: shear.unit, source: "D1C" },
    "BLOCKED_RULE_AUTHORITY",
    EU_C5_SHEAR_BLOCKED_RULE_IDS,
    ["D1C shear demand reused; no governed shear resistance equation"],
  );
}

export function evaluateEuC5Punching(input: EuC5EvaluateInput): EuC5CheckResult {
  assertEuC5FailClosed();
  if (NUMERICAL_EU_PUNCHING_SHEAR_IMPLEMENTED) throw new Error("C5 must not claim numerical EU punching implementation");
  consumeConcreteDemandHandoff(input.demand);
  if (D1C_PUNCHING_ACTIONS_REUSED !== "NOT_APPLICABLE") {
    throw new Error("C5 punching actions must remain NOT_APPLICABLE until a punching demand contract exists");
  }
  return undetermined(
    "PUNCHING",
    input,
    { value: null, unit: null, source: "D1C_PUNCHING_NOT_AVAILABLE" },
    "D1C_PUNCHING_ACTION_NOT_AVAILABLE",
    EU_C5_PUNCHING_BLOCKED_RULE_IDS,
    ["D1C has no punching-action contract; beam shear is not punching demand"],
  );
}

export function evaluateEuC5Torsion(input: EuC5EvaluateInput): EuC5CheckResult {
  assertEuC5FailClosed();
  consumeConcreteDemandHandoff(input.demand);
  if (D1C_TORSION_DEMAND_REUSED !== "NOT_AVAILABLE") {
    throw new Error("C5 must report D1C torsion demand as NOT_AVAILABLE");
  }
  if (input.demand.torsion.status !== "NOT_IMPLEMENTED") {
    throw new Error("C5 must not consume a fabricated torsion demand");
  }
  return undetermined(
    "TORSION",
    input,
    { value: null, unit: null, source: "D1C_TORSION_NOT_IMPLEMENTED" },
    "D1C_TORSION_DEMAND_NOT_AVAILABLE",
    EU_C5_TORSION_BLOCKED_RULE_IDS,
    ["D1C torsion demand is NOT_IMPLEMENTED; shear demand is not a torsion action"],
  );
}

export function evaluateEuC5Family(family: EuC5FamilyId, input: EuC5EvaluateInput): EuC5CheckResult {
  if (family === "SHEAR") return evaluateEuC5Shear(input);
  if (family === "PUNCHING") return evaluateEuC5Punching(input);
  return evaluateEuC5Torsion(input);
}
