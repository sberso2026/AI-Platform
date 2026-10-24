/**
 * Certified intelligence capability catalog — adapters only.
 * Availability reflects real public contracts; unavailable = capability-only.
 */

import type { EngineeringIntelligenceCapability } from "./contracts";

export const CERTIFIED_ENGINEERING_INTELLIGENCE_CATALOG: EngineeringIntelligenceCapability[] = [
  {
    capabilityId: "project_intelligence.risk_attention",
    name: "Project risk attention",
    owner: "project_intelligence",
    version: "1.0.0-certified",
    supportedObjectTypes: ["PROJECT", "project"],
    supportedIntents: ["what_requires_attention", "what_are_the_options", "what_evidence_supports"],
    authorityClass: "ADVISORY",
    inputContract: { required: ["projectId"], optional: ["query"] },
    outputContract: { resultShape: "project_risk_attention", mayIncludeConfidence: false },
    availability: "AVAILABLE",
    entitlementKey: "project_intelligence",
    provenanceRequirements: ["engine", "version", "evidenceRefs"],
    userConcept: "Projects",
    href: "/engineering/apps/project-intelligence",
    platformCapabilityKey: "project_intelligence",
  },
  {
    capabilityId: "asset_intelligence.condition",
    name: "Asset condition change",
    owner: "asset_intelligence",
    version: "1.0.0-certified",
    supportedObjectTypes: ["ASSET", "asset"],
    supportedIntents: ["what_changed", "what_requires_attention", "what_is_uncertain"],
    authorityClass: "ADVISORY",
    inputContract: { required: ["assetId"], optional: ["asOf"] },
    outputContract: { resultShape: "condition_delta", mayIncludeConfidence: true },
    availability: "AVAILABLE",
    entitlementKey: "asset_intelligence",
    provenanceRequirements: ["engine", "version", "evidenceRefs", "assumptions"],
    userConcept: "Assets",
    href: "/engineering/apps/asset-intelligence",
    platformCapabilityKey: "asset_intelligence.condition",
  },
  {
    capabilityId: "inspection_intelligence.condition",
    name: "Inspection condition evidence",
    owner: "inspection_intelligence",
    version: "1.0.0-certified",
    supportedObjectTypes: ["ASSET", "asset", "INSPECTION", "inspection"],
    supportedIntents: ["what_changed", "what_evidence_supports", "what_needs_human_review"],
    authorityClass: "REQUIRES_HUMAN_REVIEW",
    inputContract: { required: ["assetId"], optional: ["inspectionId"] },
    outputContract: { resultShape: "inspection_condition", mayIncludeConfidence: false },
    availability: "AVAILABLE",
    entitlementKey: "inspection_intelligence",
    provenanceRequirements: ["engine", "version", "evidenceRefs"],
    userConcept: "Inspections",
    href: "/engineering/apps/inspection-intelligence",
    platformCapabilityKey: "inspection_intelligence.condition",
  },
  {
    capabilityId: "project_controls.decision_support",
    name: "Decision support options",
    owner: "project_controls",
    version: "1.0.0-certified",
    supportedObjectTypes: ["PROJECT", "project", "DECISION", "decision"],
    supportedIntents: ["what_are_the_options", "what_needs_human_review", "why"],
    authorityClass: "ADVISORY",
    inputContract: { required: ["projectId"], optional: ["decisionId", "evidence"] },
    outputContract: { resultShape: "decision_options", mayIncludeConfidence: true },
    availability: "AVAILABLE",
    entitlementKey: "project_controls",
    provenanceRequirements: ["engine", "version", "evidenceRefs", "assumptions"],
    userConcept: "Decisions",
    href: "/engineering/apps/project-controls",
    platformCapabilityKey: "project_controls.decision_support",
  },
  {
    capabilityId: "project_controls.scenario_intelligence",
    name: "Scenario intelligence",
    owner: "project_controls",
    version: "1.0.0-certified",
    supportedObjectTypes: ["PROJECT", "project"],
    supportedIntents: ["what_happens_if", "what_is_uncertain"],
    authorityClass: "SCENARIO",
    inputContract: { required: ["projectId", "scenarioHypothesis"], optional: ["asOf"] },
    outputContract: { resultShape: "scenario_outcome", mayIncludeConfidence: false },
    availability: "AVAILABLE",
    entitlementKey: "project_controls",
    provenanceRequirements: ["engine", "version", "assumptions"],
    userConcept: "Scenarios",
    href: "/engineering/apps/project-controls",
    platformCapabilityKey: "project_controls.scenario_intelligence",
  },
  {
    capabilityId: "project_controls.risk_opportunity_intelligence",
    name: "Risk & opportunity intelligence",
    owner: "project_controls",
    version: "1.0.0-certified",
    supportedObjectTypes: ["PROJECT", "project", "RISK", "risk"],
    supportedIntents: ["what_requires_attention", "what_is_uncertain", "what_evidence_supports"],
    authorityClass: "RISK_SIGNAL",
    inputContract: { required: ["projectId"], optional: ["riskId"] },
    outputContract: { resultShape: "risk_opportunity_signals", mayIncludeConfidence: true },
    availability: "AVAILABLE",
    entitlementKey: "project_controls",
    provenanceRequirements: ["engine", "version", "evidenceRefs"],
    userConcept: "Risks",
    href: "/engineering/apps/project-controls",
    platformCapabilityKey: "project_controls.risk_opportunity_intelligence",
  },
  {
    capabilityId: "project_controls.assurance_intelligence",
    name: "Assurance intelligence",
    owner: "project_controls",
    version: "1.0.0-certified",
    supportedObjectTypes: ["PROJECT", "project"],
    supportedIntents: ["what_needs_human_review", "what_evidence_supports", "what_is_uncertain"],
    authorityClass: "ASSURANCE_FINDING",
    inputContract: { required: ["projectId"], optional: ["assuranceScope"] },
    outputContract: { resultShape: "assurance_findings", mayIncludeConfidence: false },
    availability: "AVAILABLE",
    entitlementKey: "project_controls",
    provenanceRequirements: ["engine", "version", "evidenceRefs"],
    userConcept: "Assurance",
    href: "/engineering/apps/project-controls",
    platformCapabilityKey: "project_controls.assurance_intelligence",
  },
  {
    capabilityId: "project_controls.explainability_intelligence",
    name: "Explainability / traceability",
    owner: "project_controls",
    version: "1.0.0-certified",
    supportedObjectTypes: ["PROJECT", "project", "DECISION", "decision", "ASSET", "asset"],
    supportedIntents: ["why", "what_evidence_supports", "what_is_uncertain"],
    authorityClass: "ADVISORY",
    inputContract: { required: ["subjectId"], optional: ["subjectType"] },
    outputContract: { resultShape: "explanation", mayIncludeConfidence: false },
    availability: "AVAILABLE",
    entitlementKey: "project_controls",
    provenanceRequirements: ["engine", "version", "evidenceRefs", "assumptions"],
    userConcept: "Explainability",
    href: "/engineering/apps/project-controls",
    platformCapabilityKey: "project_controls.explainability_intelligence",
  },
  // Capability-only / unavailable — registered honestly, never fabricated
  {
    capabilityId: "asset_intelligence.rul_claims",
    name: "Remaining useful life claims",
    owner: "asset_intelligence",
    version: "0.0.0-unavailable",
    supportedObjectTypes: ["ASSET", "asset"],
    supportedIntents: ["what_is_predicted"],
    authorityClass: "PREDICTION",
    inputContract: { required: ["assetId"] },
    outputContract: { resultShape: "rul", mayIncludeConfidence: false },
    availability: "UNAVAILABLE",
    entitlementKey: "asset_intelligence",
    provenanceRequirements: ["engine", "version"],
    userConcept: "Assets",
    href: null,
    capabilityOnly: true,
  },
];

export function getDefaultIntelligenceCatalog(): EngineeringIntelligenceCapability[] {
  return CERTIFIED_ENGINEERING_INTELLIGENCE_CATALOG.map((c) => ({ ...c }));
}

export function listUserFacingCatalogConcepts(
  entitledKeys: string[] | undefined,
): Array<{
  concept: EngineeringIntelligenceCapability["userConcept"];
  capabilities: EngineeringIntelligenceCapability[];
}> {
  const entitled = new Set(entitledKeys ?? []);
  const available = CERTIFIED_ENGINEERING_INTELLIGENCE_CATALOG.filter(
    (c) =>
      c.availability === "AVAILABLE" &&
      !c.capabilityOnly &&
      (entitled.size === 0 || entitled.has(c.entitlementKey)),
  );
  const byConcept = new Map<
    EngineeringIntelligenceCapability["userConcept"],
    EngineeringIntelligenceCapability[]
  >();
  for (const c of available) {
    const list = byConcept.get(c.userConcept) ?? [];
    list.push(c);
    byConcept.set(c.userConcept, list);
  }
  return [...byConcept.entries()].map(([concept, capabilities]) => ({
    concept,
    capabilities,
  }));
}
