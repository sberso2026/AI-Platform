/**
 * Bridge intelligence envelopes into E5 Why? / Ask messaging.
 */

import type { EngineeringReasoningResponse } from "../phase-e5/contracts";
import type { EngineeringIntelligenceResultEnvelope } from "./contracts";

export function applyIntelligenceToReasoning(
  reasoning: EngineeringReasoningResponse,
  results: EngineeringIntelligenceResultEnvelope[],
): EngineeringReasoningResponse {
  if (!results.length) return reasoning;

  const lines = results.map(
    (r) =>
      `Certified intelligence ${r.capabilityId}@${r.version} (owner ${r.owner}) → ${r.authorityStatus}; freshness ${r.freshness}`,
  );
  const summaries = results.map((r) => String(r.result.summary ?? JSON.stringify(r.result)));

  return {
    ...reasoning,
    answer: `${reasoning.answer}\n\nCertified intelligence: ${summaries.join(" · ")} — advisory only; not approval.`,
    limitations: [
      ...new Set([
        ...reasoning.limitations,
        ...results.flatMap((r) => r.limitations),
        "Intelligence ≠ approval; prediction ≠ fact; scenario ≠ forecast authority; risk signal ≠ accepted risk; assurance finding ≠ sign-off.",
      ]),
    ],
    why: {
      ...reasoning.why,
      ruleOrToolBasis: [
        ...reasoning.why.ruleOrToolBasis,
        ...lines.map((l) => `E9 intelligence: ${l}`),
      ],
      uncertaintyAndLimitations: [
        ...reasoning.why.uncertaintyAndLimitations,
        ...results.flatMap((r) => r.uncertaintyNotes ?? []),
        ...results
          .filter((r) => r.freshness === "STALE")
          .map((r) => `Stale result from ${r.capabilityId}`),
      ],
      chainOfThoughtExposed: false as const,
      platformInternalsExposed: false as const,
      authorityState: "REQUIRES_HUMAN_REVIEW",
    },
    authorityStatus: "REQUIRES_HUMAN_REVIEW",
  };
}

export type ContextualIntelligenceAction = {
  id: "analyse" | "explain" | "compare_scenarios" | "review_risk" | "view_assurance";
  label: string;
  capabilityId: string;
  href?: string | null;
};

export function contextualIntelligenceActions(input: {
  objectType?: string | null;
  entitledKeys?: string[];
  catalog: Array<{
    capabilityId: string;
    entitlementKey: string;
    availability: string;
    capabilityOnly?: boolean;
    href?: string | null;
    userConcept: string;
    supportedObjectTypes: string[];
  }>;
}): ContextualIntelligenceAction[] {
  const entitled = new Set(input.entitledKeys ?? []);
  const ot = (input.objectType ?? "").toLowerCase();
  const actions: ContextualIntelligenceAction[] = [];
  const eligible = input.catalog.filter(
    (c) =>
      c.availability === "AVAILABLE" &&
      !c.capabilityOnly &&
      (entitled.size === 0 || entitled.has(c.entitlementKey)) &&
      (!ot || c.supportedObjectTypes.some((t) => t.toLowerCase() === ot)),
  );

  const pick = (capabilityId: string, id: ContextualIntelligenceAction["id"], label: string) => {
    const cap = eligible.find((c) => c.capabilityId === capabilityId);
    if (cap) actions.push({ id, label, capabilityId, href: cap.href });
  };

  pick("asset_intelligence.condition", "analyse", "Analyse");
  pick("project_controls.explainability_intelligence", "explain", "Explain");
  pick("project_controls.scenario_intelligence", "compare_scenarios", "Compare scenarios");
  pick("project_controls.risk_opportunity_intelligence", "review_risk", "Review risk");
  pick("project_controls.assurance_intelligence", "view_assurance", "View assurance");

  return actions;
}
