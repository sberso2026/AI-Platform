import type { EuC1bRuleEvidenceRecord, EuC1ImplementationReadyRuleId } from "@rtb/types";
import {
  C1B_RULE_EVIDENCE_LOADED,
  EU_C1_IMPLEMENTATION_READY_RULE_COUNT,
  EU_C1_IMPLEMENTATION_READY_RULE_IDS,
  EU_C1_IMPLEMENTED_NUMERICAL_RULE_COUNT,
  EU_C1_IMPLEMENTED_RULE_NOT_PRESENT_IN_C1B_EVIDENCE,
} from "@rtb/types";
import { EU_C1B_RULE_EVIDENCE_RECORDS, formulaFingerprint } from "../eu-c1b";

export const EU_C1_READY_EVIDENCE: readonly EuC1bRuleEvidenceRecord[] = EU_C1B_RULE_EVIDENCE_RECORDS.filter((row) => row.implementable);

export function assertC1bEvidenceLoaded(): void {
  if (!C1B_RULE_EVIDENCE_LOADED) throw new Error("C1B rule evidence must be loaded before C1 implementation");
  if (EU_C1_READY_EVIDENCE.length !== EU_C1_IMPLEMENTATION_READY_RULE_COUNT) {
    throw new Error(`C1 ready-rule count drifted: ${EU_C1_READY_EVIDENCE.length}`);
  }
  const ids = EU_C1_READY_EVIDENCE.map((row) => row.ruleId);
  for (const id of EU_C1_IMPLEMENTATION_READY_RULE_IDS) {
    if (!ids.includes(id)) throw new Error(`C1 ready rule ${id} missing from C1B evidence`);
  }
  if (EU_C1_IMPLEMENTED_RULE_NOT_PRESENT_IN_C1B_EVIDENCE) {
    throw new Error("C1 must not implement a rule absent from C1B evidence");
  }
  if (EU_C1_IMPLEMENTED_NUMERICAL_RULE_COUNT !== EU_C1_IMPLEMENTATION_READY_RULE_COUNT) {
    throw new Error("C1 implemented count must match C1B ready count");
  }
}

export function c1bEvidenceFor(ruleId: EuC1ImplementationReadyRuleId): EuC1bRuleEvidenceRecord {
  const row = EU_C1_READY_EVIDENCE.find((item) => item.ruleId === ruleId);
  if (!row) throw new Error(`C1B evidence missing for ${ruleId}`);
  return row;
}

export function assertFormulaFingerprintMatches(ruleId: EuC1ImplementationReadyRuleId, operations: readonly string[], parameterIds: readonly string[]): string {
  const evidence = c1bEvidenceFor(ruleId);
  const computed = formulaFingerprint({ ruleId, operations, parameterIds });
  if (!evidence.formulaFingerprint) throw new Error(`${ruleId} missing C1B formula fingerprint`);
  if (computed !== evidence.formulaFingerprint) {
    throw new Error(`silent formula drift on ${ruleId}: ${computed} !== ${evidence.formulaFingerprint}`);
  }
  return computed;
}
