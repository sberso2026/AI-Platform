import type { AssuranceRule } from "./types";

export const ASSURANCE_RULE_CATALOG: readonly AssuranceRule[] = [
  {
    ruleId: "A8C-REQ-001",
    ruleVersion: "v1",
    name: "Required Requirement Allocation Missing",
    description:
      "A non-draft Requirement that requires allocation has no governed ALLOCATED_TO relationship, or the allocation target is not visible in the authorized workspace.",
    conditionType: "MISSING_ALLOCATION",
    assuranceDomain: "REQUIREMENT",
    applicableObjectTypes: ["requirement"],
    applicableMaturity: ["WORKING", "REVIEWED", "VERIFIED", "APPROVED", "ISSUED"],
    enabled: true,
  },
  {
    ruleId: "A8C-DEC-001",
    ruleVersion: "v1",
    name: "Required Decision Evidence Missing",
    description:
      "A Decision that is in use has no governed SUPPORTED_BY or BASED_ON evidence. Does not evaluate whether the Decision is correct.",
    conditionType: "MISSING_SUPPORTING_EVIDENCE",
    assuranceDomain: "DECISION",
    applicableObjectTypes: ["decision"],
    applicableMaturity: ["WORKING", "REVIEWED", "VERIFIED", "APPROVED", "ISSUED"],
    enabled: true,
  },
  {
    ruleId: "A8C-DEC-002",
    ruleVersion: "v1",
    name: "Active Decision References Stale Analysis",
    description:
      "An active Decision is SUPPORTED_BY an Analysis Result that is canonically stale. Does not mark the Decision invalid.",
    conditionType: "STALE_EVIDENCE_REFERENCE",
    assuranceDomain: "DECISION",
    applicableObjectTypes: ["decision", "analysis_result"],
    applicableMaturity: ["WORKING", "REVIEWED", "VERIFIED", "APPROVED", "ISSUED"],
    enabled: true,
  },
  {
    ruleId: "A8C-ANL-001",
    ruleVersion: "v1",
    name: "Required Analysis Review Missing",
    description:
      "An Analysis Result that requires review has no REVIEWS relation from a Review Package.",
    conditionType: "MISSING_REQUIRED_REVIEW",
    assuranceDomain: "ANALYSIS",
    applicableObjectTypes: ["analysis_result"],
    applicableMaturity: ["WORKING", "REVIEWED", "VERIFIED", "APPROVED", "ISSUED"],
    enabled: true,
  },
  {
    ruleId: "A8C-ANL-002",
    ruleVersion: "v1",
    name: "Accepted Analysis Result Became Stale",
    description: "An accepted Analysis Result is canonically stale. Does not rerun analysis.",
    conditionType: "STALE_EVIDENCE_REFERENCE",
    assuranceDomain: "ANALYSIS",
    applicableObjectTypes: ["analysis_result"],
    applicableMaturity: ["WORKING", "REVIEWED", "VERIFIED", "APPROVED", "ISSUED"],
    enabled: true,
  },
  {
    ruleId: "A8C-IFC-001",
    ruleVersion: "v1",
    name: "Required Interface Information Incomplete",
    description:
      "An Interface Information Requirement is REQUIRED, REQUESTED, INCOMPLETE, REJECTED, or SUPERSEDED. Does not mark the Interface defective.",
    conditionType: "INCOMPLETE_INTERFACE_INFORMATION",
    assuranceDomain: "INTERFACE",
    applicableObjectTypes: ["interface"],
    applicableMaturity: ["WORKING", "REVIEWED", "VERIFIED", "APPROVED", "ISSUED"],
    enabled: true,
  },
  {
    ruleId: "A8C-CHG-001",
    ruleVersion: "v1",
    name: "Change Has Unassessed Downstream Dependency",
    description:
      "A Change has AFFECTS / discovered downstream dependencies without a confirmed Impact. Does not create confirmed Impact records.",
    conditionType: "UNRESOLVED_CHANGE_IMPACT_CANDIDATE",
    assuranceDomain: "CHANGE",
    applicableObjectTypes: ["change"],
    applicableMaturity: ["WORKING", "REVIEWED", "VERIFIED", "APPROVED", "ISSUED"],
    enabled: true,
  },
  {
    ruleId: "A8C-CFG-001",
    ruleVersion: "v1",
    name: "Configuration Item Missing Required Provenance",
    description:
      "A Configuration Item snapshot lacks created_at / created_by provenance. Snapshot evidence is not full historical reconstruction.",
    conditionType: "MISSING_CONFIGURATION_PROVENANCE",
    assuranceDomain: "CONFIGURATION",
    applicableObjectTypes: ["configuration_item"],
    applicableMaturity: ["WORKING", "REVIEWED", "VERIFIED", "APPROVED", "ISSUED"],
    enabled: true,
  },
  {
    ruleId: "A8C-AST-001",
    ruleVersion: "v1",
    name: "Material Assumption Invalid or Expired While In Use",
    description:
      "A material Assumption is expired or invalidated and is still referenced by an active Analysis or Decision. Does not invalidate downstream engineering automatically.",
    conditionType: "MISSING_REQUIRED_ASSUMPTION_CONTEXT",
    assuranceDomain: "ASSUMPTION",
    applicableObjectTypes: ["assumption"],
    applicableMaturity: ["WORKING", "REVIEWED", "VERIFIED", "APPROVED", "ISSUED"],
    enabled: true,
  },
  {
    ruleId: "A8D-OPT-001",
    ruleVersion: "v1",
    name: "Decision References Stale or Incomplete Optimization Evidence",
    description:
      "A Decision is SUPPORTED_BY or BASED_ON an Optimization Run that is stale, failed, cancelled, or incomplete. Does not select a winner or declare the Decision wrong.",
    conditionType: "STALE_EVIDENCE_REFERENCE",
    assuranceDomain: "OPTIMIZATION",
    applicableObjectTypes: ["decision", "optimization_run"],
    applicableMaturity: ["WORKING", "REVIEWED", "VERIFIED", "APPROVED", "ISSUED"],
    enabled: true,
  },
  {
    ruleId: "A10A-INF-001",
    ruleVersion: "v1",
    name: "Ambiguous Information Authority",
    description:
      "Multiple eligible sources claim authority for the same information type, scope, and purpose. Does not determine which source is technically correct and does not create a Finding.",
    conditionType: "AMBIGUOUS_INFORMATION_AUTHORITY",
    assuranceDomain: "INFORMATION",
    applicableObjectTypes: ["engineering_information"],
    applicableMaturity: ["WORKING", "REVIEWED", "VERIFIED", "APPROVED", "ISSUED"],
    enabled: true,
  },
  {
    ruleId: "A10A-INF-002",
    ruleVersion: "v1",
    name: "No Authoritative Information Source",
    description:
      "A configured information purpose requires an authoritative source but none can be resolved. This is a governance condition, not a technical defect.",
    conditionType: "NO_AUTHORITATIVE_INFORMATION_SOURCE",
    assuranceDomain: "INFORMATION",
    applicableObjectTypes: ["engineering_information"],
    applicableMaturity: ["WORKING", "REVIEWED", "VERIFIED", "APPROVED", "ISSUED"],
    enabled: true,
  },
  {
    ruleId: "A10A-INF-003",
    ruleVersion: "v1",
    name: "Stale Authoritative Information",
    description:
      "The selected authoritative information source is canonically stale. Does not reverse Decisions or approve replacements.",
    conditionType: "STALE_AUTHORITATIVE_INFORMATION",
    assuranceDomain: "INFORMATION",
    applicableObjectTypes: ["engineering_information"],
    applicableMaturity: ["WORKING", "REVIEWED", "VERIFIED", "APPROVED", "ISSUED"],
    enabled: true,
  },
  {
    ruleId: "A10A-INF-004",
    ruleVersion: "v1",
    name: "Information Authority Policy Missing",
    description:
      "No governed Information Authority Policy is configured for a required information purpose.",
    conditionType: "INFORMATION_AUTHORITY_POLICY_MISSING",
    assuranceDomain: "INFORMATION",
    applicableObjectTypes: ["engineering_information"],
    applicableMaturity: ["WORKING", "REVIEWED", "VERIFIED", "APPROVED", "ISSUED"],
    enabled: true,
  },
  {
    ruleId: "A10A-INF-005",
    ruleVersion: "v1",
    name: "Superseded Information Still Referenced",
    description:
      "A superseded information source remains referenced. Does not infer technical contradiction or reverse a Decision.",
    conditionType: "SUPERSEDED_INFORMATION_STILL_REFERENCED",
    assuranceDomain: "INFORMATION",
    applicableObjectTypes: ["engineering_information"],
    applicableMaturity: ["WORKING", "REVIEWED", "VERIFIED", "APPROVED", "ISSUED"],
    enabled: true,
  },
] as const;

export function assuranceRuleById(ruleId: string): AssuranceRule | undefined {
  return ASSURANCE_RULE_CATALOG.find((rule) => rule.ruleId === ruleId);
}

export function enabledAssuranceRules(enabledRuleIds?: readonly string[] | null): AssuranceRule[] {
  if (enabledRuleIds == null) return [...ASSURANCE_RULE_CATALOG];
  const allowed = new Set(enabledRuleIds);
  return ASSURANCE_RULE_CATALOG.filter((rule) => allowed.has(rule.ruleId));
}

export function resolveEffectiveRules(settings: readonly { ruleId: string; ruleVersion: string; enabled: boolean }[]): {
  rules: AssuranceRule[];
  enabledRuleIds: string[];
  disabledRuleIds: string[];
} {
  const override = new Map(settings.map((row) => [`${row.ruleId}:${row.ruleVersion}`, row.enabled]));
  const enabled: AssuranceRule[] = [];
  const disabledRuleIds: string[] = [];
  for (const rule of ASSURANCE_RULE_CATALOG) {
    const key = `${rule.ruleId}:${rule.ruleVersion}`;
    const effective = override.has(key) ? override.get(key) === true : true;
    if (effective) enabled.push(rule);
    else disabledRuleIds.push(rule.ruleId);
  }
  return { rules: enabled, enabledRuleIds: enabled.map((rule) => rule.ruleId), disabledRuleIds };
}
