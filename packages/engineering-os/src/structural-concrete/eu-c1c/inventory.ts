import type { EuC1cGapClassificationRow, EuC1cGapRuleId } from "@rtb/types";
import {
  EU_C1C_BLOCKED_RULE_IDS,
  EU_C1C_IMPLEMENTED_NUMERICAL_RULE_COUNT,
  EU_C1C_IMPLEMENTATION_READY_RULE_IDS,
  EU_C1C_INITIAL_GAP_COUNT,
  EU_C1C_INITIAL_GAP_RULE_IDS,
  EU_C1C_NUMERICALLY_VALIDATED_RULE_COUNT,
  EU_C2_MISSING_RULE_DEPENDENCIES,
  EU_C2_REMAINING_MISSING_RULE_DEPENDENCIES,
} from "@rtb/types";
import { EU_C1B_INVENTORY_RECLASS, EU_C1B_PARAMETER_PROVENANCE, EU_C1B_RULE_EVIDENCE_RECORDS } from "../eu-c1b";

const BLOCKED_REASON =
  "no independently governed coefficient/formula source is bound in-repository; licensed standard PDF is not the blocker; C1B UNBOUND classification unchanged";

function blocked(ruleId: EuC1cGapRuleId): EuC1cGapClassificationRow {
  return {
    ruleId,
    readiness: "BLOCKED_RULE_AUTHORITY",
    implementable: false,
    dependencyClass: "UNRESOLVED",
    blockedReason: BLOCKED_REASON,
    nationalAnnexDependency: "UNRESOLVED",
  };
}

export const EU_C1C_GAP_CLASSIFICATION: readonly EuC1cGapClassificationRow[] = EU_C1C_INITIAL_GAP_RULE_IDS.map(blocked);

export function assertEuC1cEvidenceLoaded(): void {
  const c1bBlocked = EU_C1B_INVENTORY_RECLASS.filter((row) => row.STILL_BLOCKED).map((row) => row.ruleId);
  if (EU_C1C_INITIAL_GAP_RULE_IDS.length !== EU_C1C_INITIAL_GAP_COUNT) {
    throw new Error("C1C initial gap count drifted");
  }
  for (const id of EU_C1C_INITIAL_GAP_RULE_IDS) {
    if (!c1bBlocked.includes(id)) throw new Error(`C1C gap ${id} is not a C1B blocked rule`);
    const evidence = EU_C1B_RULE_EVIDENCE_RECORDS.find((row) => row.ruleId === id);
    if (!evidence || evidence.implementable || evidence.formulaFingerprint != null) {
      throw new Error(`C1C must not treat ${id} as implementable without C1B governed evidence`);
    }
  }
  for (const id of [...EU_C2_MISSING_RULE_DEPENDENCIES]) {
    if (!(EU_C1C_INITIAL_GAP_RULE_IDS as readonly string[]).includes(id)) {
      throw new Error(`C1 missing C2 dependency ${id} is not on the C1C gap list`);
    }
  }
  const gammaC = EU_C1B_PARAMETER_PROVENANCE.find((row) => row.parameterId === "gamma_c");
  const gammaS = EU_C1B_PARAMETER_PROVENANCE.find((row) => row.parameterId === "gamma_s");
  if (gammaC?.value != null || gammaS?.value != null) throw new Error("C1C must not inherit guessed partial factors");
  if (EU_C1C_IMPLEMENTATION_READY_RULE_IDS.length !== 0) throw new Error("C1C has no implementation-ready gaps");
  if (EU_C1C_BLOCKED_RULE_IDS.length !== EU_C1C_INITIAL_GAP_COUNT) throw new Error("C1C blocked set must equal the nine gaps");
  if (EU_C1C_IMPLEMENTED_NUMERICAL_RULE_COUNT !== 0 || EU_C1C_NUMERICALLY_VALIDATED_RULE_COUNT !== 0) {
    throw new Error("C1C must not claim numerical implementation without governed evidence");
  }
  if (EU_C2_REMAINING_MISSING_RULE_DEPENDENCIES.length !== EU_C1C_INITIAL_GAP_COUNT) {
    throw new Error("C2 remaining gaps must remain the nine unbound rules");
  }
}
