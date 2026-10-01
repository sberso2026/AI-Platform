import { describe, expect, it } from "vitest";
import { CANONICAL_DISCIPLINE_CODES } from "../discipline-intelligence/catalog";
import { CRUSHER_EXPANSION_FEED_PROJECT_ID } from "./fixture";
import {
  A15A_V1_FEATURE_FREEZE,
  DISCIPLINE_VALUE_CONTRIBUTIONS,
  LIFECYCLE_VALUE_EXPECTATIONS,
  SAFETY_HIERARCHY,
  VALUE_LIFECYCLE_KEYS,
  composeDecisionValueRecord,
  composeOptionValueCriteria,
  composePotentialValueImpacts,
  composeSystemValueConsequences,
  composeWorkPlanValueRequirements,
  infeasibleAgainstSafetyHierarchy,
  quantifyCarbon,
  quantifyCost,
  recordConstructabilityEvidence,
  resolveProjectValuePolicy,
  reviewValueEvidence,
  valueArtifactSections,
  valuePolicyForProject,
} from "./cross-lifecycle-value";
import type { PotentialImpactCandidate } from "../change-workbench/types";

function candidate(): PotentialImpactCandidate {
  return {
    id: "requirement:req-load",
    objectType: "requirement",
    objectId: "req-load",
    objectCode: "REQ-1",
    title: "Load",
    category: "REQUIREMENT",
    discipline: "STRUCTURAL",
    systemId: "sys-primary-crushing",
    currentState: "active",
    relationPath: [{ objectType: "change", objectId: "chg-1", depth: 0 }],
    reason: "Related through Digital Thread.",
    traversalDepth: 1,
    sourceEvidence: "fixture",
    disposition: "POTENTIAL_IMPACT",
    autoConfirmed: false,
    confidenceCategory: "DETERMINISTIC_RELATION",
    evidenceFingerprint: "fp",
    rationale: null,
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
  };
}

describe("EOS-A15A-V1 cross-lifecycle cost, constructability, and carbon", () => {
  it("preserves feature freeze and does not create a new intelligence domain", () => {
    expect(A15A_V1_FEATURE_FREEZE.newCostIntelligenceDomain).toBe(false);
    expect(A15A_V1_FEATURE_FREEZE.newConstructabilityIntelligenceDomain).toBe(false);
    expect(A15A_V1_FEATURE_FREEZE.newCarbonIntelligenceDomain).toBe(false);
    expect(A15A_V1_FEATURE_FREEZE.newLifecycleModel).toBe(false);
    expect(A15A_V1_FEATURE_FREEZE.newOptimizationEngine).toBe(false);
  });

  it("keeps carbon not globally mandatory and only required with an explicit source", () => {
    const implicit = resolveProjectValuePolicy({ carbon: "REQUIRED" });
    expect(implicit.carbon).toBe("NOT_APPLICABLE");
    expect(implicit.carbonGloballyMandatory).toBe(false);
    const crusher = valuePolicyForProject(CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(crusher.carbon).toBe("REQUIRED");
    expect(crusher.carbonRequiredBy).toBe("CLIENT_REQUIREMENT");
    expect(valuePolicyForProject("proj-other").carbon).toBe("NOT_APPLICABLE");
  });

  it("covers every canonical lifecycle key and assigned discipline contribution", () => {
    for (const key of VALUE_LIFECYCLE_KEYS) {
      expect(LIFECYCLE_VALUE_EXPECTATIONS[key].COST.maturity.length).toBeGreaterThan(8);
      expect(LIFECYCLE_VALUE_EXPECTATIONS[key].CONSTRUCTABILITY.maturity.length).toBeGreaterThan(8);
      expect(LIFECYCLE_VALUE_EXPECTATIONS[key].CARBON.maturity.length).toBeGreaterThan(8);
    }
    expect(DISCIPLINE_VALUE_CONTRIBUTIONS.map((row) => row.code).sort()).toEqual([...CANONICAL_DISCIPLINE_CODES].sort());
    expect(DISCIPLINE_VALUE_CONTRIBUTIONS.find((row) => row.code === "SAFETY")?.notes).toMatch(/mandatory constraint/i);
    expect(DISCIPLINE_VALUE_CONTRIBUTIONS.find((row) => row.code === "STRUCTURAL")?.notes).toMatch(/weight alone/i);
  });

  it("composes Structural FEED work-plan requirements without fabricating carbon for other projects", () => {
    const feed = composeWorkPlanValueRequirements({
      stage: "FEED",
      workType: "DESIGN_CALCULATION",
      discipline: "STRUCTURAL",
      assignedDisciplines: ["STRUCTURAL"],
      policy: valuePolicyForProject(CRUSHER_EXPANSION_FEED_PROJECT_ID),
    });
    expect(feed.find((row) => row.kind === "COST")?.maturity).toMatch(/cost baseline|quantities|cost drivers/i);
    expect(feed.find((row) => row.kind === "CONSTRUCTABILITY")?.maturity).toMatch(/formal constructability review/i);
    expect(feed.find((row) => row.kind === "CARBON")?.applicability).toBe("REQUIRED");
    expect(feed.every((row) => row.automaticAcceptance === false)).toBe(true);

    const other = composeWorkPlanValueRequirements({
      stage: "FEED",
      workType: "DESIGN_CALCULATION",
      policy: valuePolicyForProject("proj-other"),
    });
    expect(other.find((row) => row.kind === "CARBON")?.includeArtifactSection).toBe(false);
    expect(valueArtifactSections(other).some((row) => row.kind === "CARBON")).toBe(false);
  });

  it("refuses fabricated cost and carbon and keeps constructability non-numeric", () => {
    const cost = quantifyCost({});
    expect(cost.value).toBeNull();
    expect(cost.state).toBe("REQUIRES_INPUT");
    expect(cost.provenance.fabricatingPlatform).toBe(false);
    const carbon = quantifyCarbon({ quantity: 10 });
    expect(carbon.value).toBeNull();
    expect(carbon.truthScore).toBeNull();
    expect(carbon.reason).toMatch(/does not invent emission factors/i);
    const governed = quantifyCarbon({
      quantity: 12,
      quantitySource: "FEED bill of quantities",
      materialOrProcess: "structural steel",
      emissionFactor: 1.5,
      factorSource: "ICE database",
      factorVersion: "v3.0",
      factorDate: "2024-01-01",
      unit: "tCO2e",
      boundary: "A1-A3",
      method: "quantity × factor",
    });
    expect(governed.state).toBe("QUANTIFIED_GOVERNED");
    expect(governed.value).toBe(18);
    expect(recordConstructabilityEvidence({ reviewRecord: "FEED constructability review" }).opaqueScore).toBeNull();
  });

  it("keeps safety as a mandatory constraint and does not pick an option winner", () => {
    expect(SAFETY_HIERARCHY.mayTradeAgainstCost).toBe(false);
    expect(SAFETY_HIERARCHY.safetyIsNegotiableScore).toBe(false);
    const criteria = composeOptionValueCriteria(valuePolicyForProject(CRUSHER_EXPANSION_FEED_PROJECT_ID));
    expect(criteria.map((row) => row.label)).toEqual(expect.arrayContaining([
      "Technical Performance", "Safety", "CAPEX", "OPEX", "Constructability", "Schedule", "Operability", "Maintainability", "Carbon", "Environmental", "Risk", "Uncertainty",
    ]));
    expect(criteria.find((row) => row.key === "safety")?.role).toBe("MANDATORY_CONSTRAINT");
    expect(criteria.every((row) => row.weight === 0)).toBe(true);
    const decision = composeDecisionValueRecord({
      criteria,
      evidence: ["SYNTHETIC_DEMONSTRATION_DATA"],
      tradeOffs: ["steel CAPEX vs modular schedule"],
      humanRationale: null,
    });
    expect(decision.inferredRationale).toBe(false);
    expect(decision.automaticWinner).toBe(false);
    expect(infeasibleAgainstSafetyHierarchy({
      id: "unsafe",
      code: "X",
      name: "Unsafe",
      description: "x",
      metrics: [],
      assumptions: [],
      evidence: [],
      unknowns: [],
      constructability: null,
      operability: null,
      costInputAvailable: false,
      scheduleInputAvailable: false,
      safetyFeasible: false,
    })).toBe(true);
  });

  it("presents impact dimensions as potential only and does not auto-quantify", () => {
    const impacts = composePotentialValueImpacts({
      candidates: [candidate()],
      policy: valuePolicyForProject(CRUSHER_EXPANSION_FEED_PROJECT_ID),
    });
    expect(impacts.map((row) => row.dimension)).toEqual(expect.arrayContaining(["TECHNICAL", "COST", "CONSTRUCTABILITY", "SCHEDULE", "CARBON"]));
    expect(impacts.every((row) => row.status === "POTENTIAL" && row.quantified === false && row.autoConfirmed === false)).toBe(true);
    const pipe = composeSystemValueConsequences("LARGER_PIPE");
    expect(pipe.steps).toEqual(expect.arrayContaining(["increased piping CAPEX", "electrical / OPEX / carbon consequence"]));
    expect(pipe.automaticQuantification).toBe(false);
  });

  it("lets pre-issue verify evidence existence without accepting cost, constructability, or carbon", () => {
    const missing = reviewValueEvidence(composeWorkPlanValueRequirements({ stage: "FEED", workType: "DESIGN_REPORT", policy: valuePolicyForProject("proj-other") }));
    expect(missing.find((row) => row.kind === "COST")?.conclusion).toBe("EVIDENCE_MISSING");
    expect(missing.find((row) => row.kind === "CARBON")?.conclusion).toBe("NOT_APPLICABLE");
    expect(missing.every((row) => row.costAcceptable === false && row.constructable === false && row.carbonCompliant === false)).toBe(true);
  });
});
