import { createHash } from "node:crypto";
import { ASSURANCE_RULE_CATALOG } from "./catalog";

export function fingerprintAssuranceCondition(input: {
  ruleId: string;
  workspaceId: string;
  rootObjectType: string;
  rootObjectId: string;
  relatedObjectType?: string | null;
  relatedObjectId?: string | null;
  contextKey?: string | null;
}): string {
  const parts = [
    input.ruleId,
    input.workspaceId,
    input.rootObjectType,
    input.rootObjectId,
    input.relatedObjectType ?? "",
    input.relatedObjectId ?? "",
    input.contextKey ?? "",
  ];
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

export function fingerprintAssuranceRuleset(enabledRuleIds: readonly string[]): string {
  const rows = ASSURANCE_RULE_CATALOG.map((rule) => {
    const enabled = enabledRuleIds.includes(rule.ruleId);
    return `${rule.ruleId}:${rule.ruleVersion}:${enabled ? "1" : "0"}`;
  }).sort();
  return createHash("sha256").update(rows.join("|")).digest("hex");
}
