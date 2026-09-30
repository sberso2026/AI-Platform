import { ASSURANCE_RULE_CATALOG, resolveEffectiveRules } from "./catalog";
import type { AssuranceRuleSetting, EffectiveAssuranceRule } from "./types";

export function unknownRuleRejected(ruleId: string, ruleVersion: string): boolean {
  return !ASSURANCE_RULE_CATALOG.some((rule) => rule.ruleId === ruleId && rule.ruleVersion === ruleVersion);
}

export function effectiveRuleCatalog(settings: readonly AssuranceRuleSetting[]): EffectiveAssuranceRule[] {
  const override = new Map(settings.map((row) => [`${row.ruleId}:${row.ruleVersion}`, row.enabled]));
  return ASSURANCE_RULE_CATALOG.map((rule) => {
    const key = `${rule.ruleId}:${rule.ruleVersion}`;
    const overrideEnabled = override.has(key) ? Boolean(override.get(key)) : null;
    return {
      ruleId: rule.ruleId,
      ruleVersion: rule.ruleVersion,
      name: rule.name,
      description: rule.description,
      assuranceDomain: rule.assuranceDomain,
      conditionType: rule.conditionType,
      applicableObjectTypes: rule.applicableObjectTypes,
      applicableMaturity: rule.applicableMaturity,
      catalogDefaultEnabled: true as const,
      overrideEnabled,
      effectiveEnabled: overrideEnabled ?? true,
    };
  });
}

export function enabledIdsFromSettings(settings: readonly AssuranceRuleSetting[]): {
  enabledRuleIds: string[];
  disabledRuleIds: string[];
} {
  return resolveEffectiveRules(settings);
}
