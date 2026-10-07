import {
  EU_C1_RULE_PACK_READY_FOR_FLEXURE,
  EU_C2_MISSING_RULE_DEPENDENCIES,
  EU_C2_REQUIRED_RULE_DEPENDENCIES_COMPLETE,
} from "@rtb/types";
import { EU_C1B_INVENTORY_RECLASS } from "../eu-c1b";

export function euC2MissingRuleDependencies(): readonly string[] {
  return EU_C2_MISSING_RULE_DEPENDENCIES;
}

export function assertEuC2DependencyAudit(): void {
  const missing = EU_C1B_INVENTORY_RECLASS.filter((row) => row.STILL_BLOCKED).map((row) => row.ruleId);
  for (const id of EU_C2_MISSING_RULE_DEPENDENCIES) {
    if (!missing.includes(id)) throw new Error(`C2 missing-rule list drifted from C1B blocked inventory: ${id}`);
  }
  if (EU_C2_REQUIRED_RULE_DEPENDENCIES_COMPLETE) throw new Error("C2 dependencies are not complete");
  if (EU_C1_RULE_PACK_READY_FOR_FLEXURE) throw new Error("C1 rule pack is not ready for flexure");
}
