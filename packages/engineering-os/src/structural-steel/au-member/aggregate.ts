import type {
  SteelCheckVerdict,
  SteelMemberCompletenessState,
  SteelMemberDesignCheckKind,
  SteelMemberDesignCheckRow,
} from "@rtb/types";
import {
  COMPONENT_CHECKS_CAN_SUBSTITUTE_FOR_INTERACTION,
  HIGHEST_UTILIZATION_ALWAYS_GOVERNS,
  UNDETERMINED_REQUIRED_CHECK_ALLOWS_COMPLETE,
  UNVALIDATED_METHOD_COUNTS_AS_COMPLETE,
} from "@rtb/types";
import { STEEL_MEMBER_DESIGN_CHECK_KINDS } from "@rtb/types";

export function requiredApplicableRows(rows: SteelMemberDesignCheckRow[]): SteelMemberDesignCheckRow[] {
  return rows.filter((row) => row.applicable && row.completeness !== "NOT_APPLICABLE");
}

export function aggregateCompleteness(rows: SteelMemberDesignCheckRow[]): SteelMemberCompletenessState {
  if (UNDETERMINED_REQUIRED_CHECK_ALLOWS_COMPLETE) {
    throw new Error("undetermined required checks must not allow complete");
  }
  if (UNVALIDATED_METHOD_COUNTS_AS_COMPLETE) throw new Error("unvalidated methods must not count as complete");
  const required = requiredApplicableRows(rows);
  if (required.some((row) => row.completeness === "INCOMPLETE_INTERACTION")) return "INCOMPLETE_INTERACTION";
  if (required.some((row) => row.completeness === "INCOMPLETE_REQUIRED_INPUT")) return "INCOMPLETE_REQUIRED_INPUT";
  if (required.some((row) => row.completeness === "INCOMPLETE_METHOD_UNAVAILABLE")) return "INCOMPLETE_METHOD_UNAVAILABLE";
  if (required.some((row) => row.completeness === "INCOMPLETE_VALIDATION_REQUIRED")) return "INCOMPLETE_VALIDATION_REQUIRED";
  if (required.every((row) => row.completeness === "COMPLETE")) return "COMPLETE";
  return "INCOMPLETE_VALIDATION_REQUIRED";
}

export function aggregateEngineeringCheckState(rows: SteelMemberDesignCheckRow[]): SteelCheckVerdict {
  if (COMPONENT_CHECKS_CAN_SUBSTITUTE_FOR_INTERACTION) {
    throw new Error("component checks cannot substitute for interaction");
  }
  const required = requiredApplicableRows(rows);
  if (required.some((row) => row.state === "CHECK_NOT_SATISFIED")) return "CHECK_NOT_SATISFIED";
  if (required.some((row) => row.state === "CHECK_UNDETERMINED" || row.state == null || row.completeness !== "COMPLETE")) {
    return "CHECK_UNDETERMINED";
  }
  if (required.length > 0 && required.every((row) => row.state === "CHECK_SATISFIED" && row.completeness === "COMPLETE")) {
    return "CHECK_SATISFIED";
  }
  return "CHECK_UNDETERMINED";
}

export function selectGoverningCheck(rows: SteelMemberDesignCheckRow[]): SteelMemberDesignCheckRow | null {
  if (HIGHEST_UTILIZATION_ALWAYS_GOVERNS) throw new Error("highest utilization must not always govern");
  const required = requiredApplicableRows(rows);
  const order = STEEL_MEMBER_DESIGN_CHECK_KINDS;
  const byKind = (state: SteelCheckVerdict): SteelMemberDesignCheckRow | undefined =>
    order.map((kind) => required.find((row) => row.checkKind === kind && row.state === state)).find((row) => row != null);
  return byKind("CHECK_NOT_SATISFIED") ?? byKind("CHECK_UNDETERMINED") ?? byKind("CHECK_SATISFIED") ?? null;
}
