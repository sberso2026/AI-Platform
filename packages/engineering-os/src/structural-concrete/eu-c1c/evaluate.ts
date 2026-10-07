import type { EuC1cGapRuleId } from "@rtb/types";
import { EU_C1C_INITIAL_GAP_RULE_IDS, STALE_EU_C1C_RESULT_REUSE_ALLOWED } from "@rtb/types";
import { assertEuC1cFailClosed } from "./policy";

export type EuC1cGapEvaluation = {
  ok: false;
  checkState: "CHECK_UNDETERMINED";
  failReason: "BLOCKED_RULE_AUTHORITY";
  ruleId: EuC1cGapRuleId;
  detail: string;
};

export function resolveEuC1cPartialFactor(_parameterId: "gamma_c" | "gamma_s"): EuC1cGapEvaluation {
  assertEuC1cFailClosed();
  return {
    ok: false,
    checkState: "CHECK_UNDETERMINED",
    failReason: "BLOCKED_RULE_AUTHORITY",
    ruleId: _parameterId === "gamma_c" ? "EU_C1_PARTIAL_FACTOR_GAMMA_C" : "EU_C1_PARTIAL_FACTOR_GAMMA_S",
    detail: "no governed partial-factor source; no silent fallback",
  };
}

export function evaluateEuC1cGapRule(ruleId: EuC1cGapRuleId): EuC1cGapEvaluation {
  assertEuC1cFailClosed();
  if (!(EU_C1C_INITIAL_GAP_RULE_IDS as readonly string[]).includes(ruleId)) {
    return {
      ok: false,
      checkState: "CHECK_UNDETERMINED",
      failReason: "BLOCKED_RULE_AUTHORITY",
      ruleId,
      detail: "unknown C1C gap rule",
    };
  }
  return {
    ok: false,
    checkState: "CHECK_UNDETERMINED",
    failReason: "BLOCKED_RULE_AUTHORITY",
    ruleId,
    detail: "no independently governed coefficient/formula source is bound",
  };
}

export function assertStaleEuC1cNotReused(reuseAttempted: boolean): void {
  if (STALE_EU_C1C_RESULT_REUSE_ALLOWED) throw new Error("stale EU C1C result reuse must not be allowed");
  if (reuseAttempted) throw new Error("EU C1C fail closed: stale result reuse");
}
