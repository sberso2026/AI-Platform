import { formulaFingerprint } from "../eu-c1b/fingerprint";
import {
  EU_C8_R1_ANCHORAGE_PROFILE_COMPLETE,
  EU_C8_R1_FORMULA_FINGERPRINT_VALIDATION,
  EU_C8_R1_LAP_PROFILE_COMPLETE,
  EU_C8_R1_RULES,
  EU_C8_R1_SPACING_DETAILING_PROFILE_COMPLETE,
} from "./profile";

const CMIN_RULE = EU_C8_R1_RULES.find((rule) => rule.ruleId === "EU_C8_R1_CMIN_ASSEMBLY");
const CNOM_RULE = EU_C8_R1_RULES.find((rule) => rule.ruleId === "EU_C8_R1_CNOM_ASSEMBLY");

function operationsFor(expression: string): string[] {
  const operations: string[] = [];
  if (expression.includes("max(")) operations.push("max");
  if (expression.includes("+")) operations.push("add");
  return operations;
}

function complete(rule: (typeof EU_C8_R1_RULES)[number] | undefined): boolean {
  if (!rule) return false;
  return rule.expression.length > 0
    && operationsFor(rule.expression).length > 0
    && rule.inputParameterIds.length > 0
    && rule.sourceIds.length > 0
    && rule.units === "mm"
    && rule.version.length > 0;
}

export const EU_C8_R2_CMIN_FORMULA_FINGERPRINT = CMIN_RULE
  ? formulaFingerprint({
    ruleId: CMIN_RULE.ruleId,
    operations: operationsFor(CMIN_RULE.expression),
    parameterIds: CMIN_RULE.inputParameterIds,
  })
  : "";

export const EU_C8_R2_CNOM_FORMULA_FINGERPRINT = CNOM_RULE
  ? formulaFingerprint({
    ruleId: CNOM_RULE.ruleId,
    operations: operationsFor(CNOM_RULE.expression),
    parameterIds: CNOM_RULE.inputParameterIds,
  })
  : "";

const unboundSubpacksExplainPartial =
  EU_C8_R1_FORMULA_FINGERPRINT_VALIDATION === "PARTIAL"
  && EU_C8_R1_SPACING_DETAILING_PROFILE_COMPLETE === false
  && EU_C8_R1_ANCHORAGE_PROFILE_COMPLETE === false
  && EU_C8_R1_LAP_PROFILE_COMPLETE === false;

const coverFingerprintsComplete =
  complete(CMIN_RULE)
  && complete(CNOM_RULE)
  && EU_C8_R2_CMIN_FORMULA_FINGERPRINT.startsWith("fp:")
  && EU_C8_R2_CNOM_FORMULA_FINGERPRINT.startsWith("fp:")
  && EU_C8_R2_CMIN_FORMULA_FINGERPRINT !== EU_C8_R2_CNOM_FORMULA_FINGERPRINT;

export const EU_C8_R2_COVER_SUBPACK_FORMULA_FINGERPRINT_VALIDATION =
  coverFingerprintsComplete && unboundSubpacksExplainPartial ? "PASS" as const : "BLOCKED" as const;
