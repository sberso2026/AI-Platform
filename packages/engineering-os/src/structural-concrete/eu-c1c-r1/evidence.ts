import type { EuC1cEvidenceRuleRecord, EuC1cR1TargetRuleId } from "@rtb/types";
import {
  EU_C1C_EVIDENCE_READY_RULE_IDS,
  EU_C1C_R1_IMPLEMENTED_NUMERICAL_RULE_COUNT,
  EU_C1C_R1_IMPLEMENTED_RULE_WITHOUT_GOVERNED_EVIDENCE,
  EU_C1C_R1_TARGET_RULE_COUNT,
  EU_C1C_R1_TARGET_RULE_IDS,
  EU_C1_IMPLEMENTED_NUMERICAL_RULE_COUNT,
  EU_C1C_R1_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT,
} from "@rtb/types";
import { formulaFingerprint } from "../eu-c1b";
import { EU_C1C_EVIDENCE_RULE_RECORDS, assertEuC1cEvidenceRecordsLoaded } from "../eu-c1c";

const GAMMA_OPS = ["REQUIRE_DECLARED_NDP_OR_PROJECT_OVERRIDE", "FORBID_SILENT_CEN_RV_DEFAULT", "FORBID_LOCATION_INFERRED_ANNEX"] as const;
const CONCRETE_DESIGN_OPS = ["MULTIPLY_ALPHA_CC_BY_FCK", "DIVIDE_BY_DECLARED_GAMMA_C", "REQUIRE_DECLARED_ALPHA_CC", "FORBID_DEFAULT_ALPHA_CC"] as const;
const REO_DESIGN_OPS = ["DIVIDE_FYK_BY_DECLARED_GAMMA_S"] as const;

export const EU_C1C_R1_RULE_OPERATIONS = {
  EU_C1_PARTIAL_FACTOR_GAMMA_C: GAMMA_OPS,
  EU_C1_PARTIAL_FACTOR_GAMMA_S: GAMMA_OPS,
  EU_C1_CONCRETE_DESIGN_PROPERTIES: CONCRETE_DESIGN_OPS,
  EU_C1_REINFORCEMENT_DESIGN_PROPERTIES: REO_DESIGN_OPS,
} as const;

export const EU_C1C_R1_RULE_PARAMETER_IDS = {
  EU_C1_PARTIAL_FACTOR_GAMMA_C: ["gamma_c"],
  EU_C1_PARTIAL_FACTOR_GAMMA_S: ["gamma_s"],
  EU_C1_CONCRETE_DESIGN_PROPERTIES: ["fck", "alpha_cc", "gamma_c", "fcd"],
  EU_C1_REINFORCEMENT_DESIGN_PROPERTIES: ["fyk", "gamma_s", "fyd"],
} as const;

export function assertEuC1cR1EvidenceLoaded(): void {
  assertEuC1cEvidenceRecordsLoaded();
  if (EU_C1C_R1_TARGET_RULE_IDS.length !== EU_C1C_R1_TARGET_RULE_COUNT) {
    throw new Error("R1 target rule count drifted");
  }
  if (EU_C1C_R1_IMPLEMENTED_RULE_WITHOUT_GOVERNED_EVIDENCE) {
    throw new Error("R1 must not implement a rule without governed evidence");
  }
  for (const id of EU_C1C_R1_TARGET_RULE_IDS) {
    if (!(EU_C1C_EVIDENCE_READY_RULE_IDS as readonly string[]).includes(id)) {
      throw new Error(`R1 target ${id} is not C1C-EVIDENCE ready`);
    }
  }
  if (EU_C1C_R1_IMPLEMENTED_NUMERICAL_RULE_COUNT !== EU_C1C_R1_TARGET_RULE_COUNT) {
    throw new Error("R1 implemented count must match target count");
  }
  if (EU_C1C_R1_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT !== EU_C1_IMPLEMENTED_NUMERICAL_RULE_COUNT + EU_C1C_R1_IMPLEMENTED_NUMERICAL_RULE_COUNT) {
    throw new Error("R1 cumulative count double-counted or drifted");
  }
}

export function r1EvidenceFor(ruleId: EuC1cR1TargetRuleId): EuC1cEvidenceRuleRecord {
  const row = EU_C1C_EVIDENCE_RULE_RECORDS.find((item) => item.ruleId === ruleId);
  if (!row || row.readiness !== "IMPLEMENTATION_READY") {
    throw new Error(`C1C-EVIDENCE ready record missing for ${ruleId}`);
  }
  return row;
}

export function assertR1FormulaFingerprintMatches(ruleId: EuC1cR1TargetRuleId): string {
  const evidence = r1EvidenceFor(ruleId);
  const computed = formulaFingerprint({
    ruleId,
    operations: EU_C1C_R1_RULE_OPERATIONS[ruleId],
    parameterIds: EU_C1C_R1_RULE_PARAMETER_IDS[ruleId],
  });
  if (!evidence.formulaFingerprintCandidate) throw new Error(`${ruleId} missing evidence formula fingerprint`);
  if (computed !== evidence.formulaFingerprintCandidate) {
    throw new Error(`silent formula drift on ${ruleId}: ${computed} !== ${evidence.formulaFingerprintCandidate}`);
  }
  return computed;
}
