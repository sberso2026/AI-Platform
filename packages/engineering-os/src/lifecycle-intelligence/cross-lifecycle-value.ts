/**
 * EOS-A15A-V1 — Cost, Constructability, and conditional Carbon as
 * governed cross-lifecycle evaluation criteria.
 *
 * This is a composition overlay on existing Lifecycle, Requirements,
 * Discipline, Systems, Optimization, Decision, Work Generator, Review,
 * Change/Impact, Digital Thread, and My Engineering Day modules.
 * It is not a Cost/Constructability/Carbon Intelligence domain.
 */

import { CANONICAL_DISCIPLINE_CODES, DISCIPLINE_CATALOG, type CanonicalDisciplineCode } from "../discipline-intelligence/catalog";
import { CRUSHER_EXPANSION_FEED_PROJECT_ID } from "./fixture";
import type { LifecycleStage } from "./types";
import type { OptionAlternative, OptionCriterion, PotentialImpactCandidate } from "../change-workbench/types";
import type { GeneratorWorkType, WorkPlanContext } from "../work-generator/types";

export const A15A_V1_FEATURE_FREEZE = {
  newCostIntelligenceDomain: false,
  newConstructabilityIntelligenceDomain: false,
  newCarbonIntelligenceDomain: false,
  newLifecycleModel: false,
  newOptimizationEngine: false,
  newDecisionEngine: false,
  newGraphStore: false,
  newEventBus: false,
  newDms: false,
} as const;

export const VALUE_CRITERION_KINDS = ["COST", "CONSTRUCTABILITY", "CARBON"] as const;
export type ValueCriterionKind = (typeof VALUE_CRITERION_KINDS)[number];

export const VALUE_APPLICABILITY = ["REQUIRED", "REPORT_ONLY", "OPTIONAL", "NOT_APPLICABLE"] as const;
export type ValueApplicability = (typeof VALUE_APPLICABILITY)[number];

export const VALUE_EVIDENCE_STATES = [
  "UNKNOWN",
  "REQUIRES_INPUT",
  "NOT_EVALUATED",
  "EVIDENCE_PRESENT",
  "QUANTIFIED_GOVERNED",
  "SYNTHETIC_DEMONSTRATION_DATA",
] as const;
export type ValueEvidenceState = (typeof VALUE_EVIDENCE_STATES)[number];

export const VALUE_LIFECYCLE_KEYS = [
  "CONCEPT",
  "PREFEASIBILITY",
  "FEASIBILITY",
  "FEED",
  "DETAILED_DESIGN",
  "CONSTRUCTION",
  "COMMISSIONING",
  "HANDOVER",
  "OPERATIONS",
  "MODIFICATION",
] as const;
export type ValueLifecycleKey = (typeof VALUE_LIFECYCLE_KEYS)[number];

export const CARBON_REQUIREMENT_SOURCES = [
  "CLIENT_REQUIREMENT",
  "CONTRACT",
  "PROJECT_POLICY",
  "REGULATION",
  "ORGANIZATIONAL_POLICY",
] as const;
export type CarbonRequirementSource = (typeof CARBON_REQUIREMENT_SOURCES)[number];

export const SAFETY_HIERARCHY = {
  mandatoryConstraints: ["SAFETY", "LEGAL_REGULATORY", "CODE_REQUIREMENTS", "CRITICAL_CLIENT_REQUIREMENTS"] as const,
  mayTradeAgainstCost: false,
  mayTradeAgainstConstructability: false,
  mayTradeAgainstCarbon: false,
  mayTradeAgainstSchedule: false,
  safetyIsNegotiableScore: false,
} as const;

export const DEFAULT_PROJECT_VALUE_POLICY = {
  cost: "REQUIRED" as const,
  constructability: "REQUIRED" as const,
  carbon: "NOT_APPLICABLE" as const,
  carbonRequiredBy: null as CarbonRequirementSource | null,
  carbonGloballyMandatory: false as const,
};

export type ProjectValuePolicy = {
  cost: ValueApplicability;
  constructability: ValueApplicability;
  carbon: ValueApplicability;
  carbonRequiredBy: CarbonRequirementSource | null;
  carbonGloballyMandatory: false;
};

export function resolveProjectValuePolicy(input?: {
  cost?: ValueApplicability;
  constructability?: ValueApplicability;
  carbon?: ValueApplicability;
  carbonRequiredBy?: CarbonRequirementSource | null;
}): ProjectValuePolicy {
  const carbonRequested = input?.carbon ?? DEFAULT_PROJECT_VALUE_POLICY.carbon;
  const source = input?.carbonRequiredBy ?? null;
  const carbon =
    carbonRequested !== "NOT_APPLICABLE" && carbonRequested !== "OPTIONAL" && !source
      ? "NOT_APPLICABLE"
      : carbonRequested;
  return {
    cost: input?.cost ?? DEFAULT_PROJECT_VALUE_POLICY.cost,
    constructability: input?.constructability ?? DEFAULT_PROJECT_VALUE_POLICY.constructability,
    carbon,
    carbonRequiredBy: carbon === "NOT_APPLICABLE" ? null : source,
    carbonGloballyMandatory: false,
  };
}

export const LIFECYCLE_VALUE_EXPECTATIONS: Record<
  ValueLifecycleKey,
  Record<ValueCriterionKind, { maturity: string; evidence: string }>
> = {
  CONCEPT: {
    COST: { maturity: "ROM / comparative cost drivers", evidence: "Comparative drivers only; no fabricated CAPEX/OPEX." },
    CONSTRUCTABILITY: { maturity: "Major site/buildability/logistics constraints", evidence: "Constraint record, not a score." },
    CARBON: { maturity: "Strategic screening when applicable", evidence: "Screening only if project carbon policy requires it." },
  },
  PREFEASIBILITY: {
    COST: { maturity: "Option-level CAPEX/OPEX comparison", evidence: "Option comparison inputs; missing rates remain REQUIRES_INPUT." },
    CONSTRUCTABILITY: { maturity: "Construction strategy / modularisation / access", evidence: "Strategy/method notes." },
    CARBON: { maturity: "Relative option carbon comparison", evidence: "Relative only with governed factors." },
  },
  FEASIBILITY: {
    COST: { maturity: "Developed cost basis and uncertainty", evidence: "Basis, class/uncertainty, exclusions." },
    CONSTRUCTABILITY: { maturity: "Buildability validation / lifting / sequencing / logistics", evidence: "Validation notes." },
    CARBON: { maturity: "Credible carbon estimate and reduction opportunities", evidence: "Estimate only with quantity+factor provenance." },
  },
  FEED: {
    COST: { maturity: "Cost baseline / quantities / major cost drivers", evidence: "Quantity/cost basis." },
    CONSTRUCTABILITY: { maturity: "Formal constructability review", evidence: "Review record." },
    CARBON: { maturity: "Carbon budget / target / discipline allocation where required", evidence: "Budget/target evidence if required." },
  },
  DETAILED_DESIGN: {
    COST: { maturity: "Quantity/change control and value engineering", evidence: "Quantity/change implications." },
    CONSTRUCTABILITY: { maturity: "Fabrication / erection / installation / access / temporary works", evidence: "Method/access/temporary works." },
    CARBON: { maturity: "Material/quantity optimization and supplier/material evidence", evidence: "Material evidence with factors." },
  },
  CONSTRUCTION: {
    COST: { maturity: "Actual change / rework / variation implications", evidence: "Potential cost of field change; not auto-quantified." },
    CONSTRUCTABILITY: { maturity: "Field execution / temporary works / access / lifting / sequence", evidence: "Field constraints." },
    CARBON: { maturity: "Actual material / substitution / transport / waste evidence", evidence: "Substitution/transport/waste evidence if required." },
  },
  COMMISSIONING: {
    COST: { maturity: "Deficiency/modification implications", evidence: "Potential cost of deficiencies." },
    CONSTRUCTABILITY: { maturity: "Completion/test access and maintainability", evidence: "Access/maintainability notes." },
    CARBON: { maturity: "Operational-efficiency verification where required", evidence: "Operational verification if required." },
  },
  HANDOVER: {
    COST: { maturity: "Final cost/change evidence and lessons", evidence: "Lessons / change evidence." },
    CONSTRUCTABILITY: { maturity: "Lessons / maintainability evidence", evidence: "Lessons record." },
    CARBON: { maturity: "Final/as-delivered carbon record where required", evidence: "As-delivered record if required." },
  },
  OPERATIONS: {
    COST: { maturity: "OPEX/lifecycle cost", evidence: "OPEX/lifecycle inputs; not an estimating platform." },
    CONSTRUCTABILITY: { maturity: "Maintainability/access performance", evidence: "Access/maintainability performance notes." },
    CARBON: { maturity: "Operational/lifecycle emissions", evidence: "Operational emissions if required." },
  },
  MODIFICATION: {
    COST: { maturity: "Modification economics", evidence: "Modification economics inputs." },
    CONSTRUCTABILITY: { maturity: "Brownfield/shutdown/access constraints", evidence: "Brownfield/shutdown constraints." },
    CARBON: { maturity: "Retain/refurbish/replace carbon consequences", evidence: "Consequences only with governed factors." },
  },
};

export type DisciplineValueContribution = {
  code: CanonicalDisciplineCode;
  existingCoreRow: boolean;
  evaluateOnlyWhenAssigned: boolean;
  cost: readonly string[];
  constructability: readonly string[];
  carbon: readonly string[];
  notes: string;
};

export const DISCIPLINE_VALUE_CONTRIBUTIONS: readonly DisciplineValueContribution[] = [
  {
    code: "PROCESS",
    existingCoreRow: true,
    evaluateOnlyWhenAssigned: true,
    cost: ["process-route CAPEX/OPEX", "energy", "utilities", "water", "reagents", "commissioning complexity"],
    constructability: ["modularity", "commissioning complexity"],
    carbon: ["operational emissions", "energy"],
    notes: "Evaluate only where Process is assigned.",
  },
  {
    code: "MECHANICAL",
    existingCoreRow: true,
    evaluateOnlyWhenAssigned: true,
    cost: ["equipment CAPEX", "lifecycle cost"],
    constructability: ["installation", "lifting", "maintenance/replacement"],
    carbon: ["energy efficiency", "embodied materials"],
    notes: "Evaluate only where Mechanical is assigned.",
  },
  {
    code: "PIPING",
    existingCoreRow: true,
    evaluateOnlyWhenAssigned: true,
    cost: ["pipe/fitting/valve/support quantities", "routing cost"],
    constructability: ["spooling / field welds", "tie-ins", "access"],
    carbon: ["material carbon", "pumping / thermal operating consequences"],
    notes: "Evaluate only where Piping is assigned. Do not invent piping scope.",
  },
  {
    code: "STRUCTURAL",
    existingCoreRow: true,
    evaluateOnlyWhenAssigned: true,
    cost: ["steel/concrete quantities", "fabrication", "foundations"],
    constructability: ["connections", "erection", "lifting", "temporary works"],
    carbon: ["embodied carbon"],
    notes: "Do not optimize structural weight alone.",
  },
  {
    code: "CIVIL",
    existingCoreRow: true,
    evaluateOnlyWhenAssigned: true,
    cost: ["earthworks", "roads", "drainage", "retaining structures"],
    constructability: ["haul distances", "construction access"],
    carbon: ["material/fuel/carbon implications"],
    notes: "Evaluate only where Civil is assigned.",
  },
  {
    code: "GEOTECHNICAL",
    existingCoreRow: true,
    evaluateOnlyWhenAssigned: true,
    cost: ["investigation value", "foundation alternatives", "ground treatment", "piling/temporary support"],
    constructability: ["excavation", "dewatering", "temporary support"],
    carbon: ["foundation/carbon quantities"],
    notes: "Evaluate only where Geotechnical is assigned.",
  },
  {
    code: "ELECTRICAL",
    existingCoreRow: true,
    evaluateOnlyWhenAssigned: true,
    cost: ["equipment/cable CAPEX", "installation"],
    constructability: ["routing", "installation"],
    carbon: ["losses", "efficiency", "operational electricity/carbon"],
    notes: "Evaluate only where Electrical is assigned. Do not invent electrical scope.",
  },
  {
    code: "INSTRUMENTATION_CONTROL",
    existingCoreRow: true,
    evaluateOnlyWhenAssigned: true,
    cost: ["instrument/control architecture cost", "cabling/panels"],
    constructability: ["installation/commissioning"],
    carbon: ["process optimization effects on energy/emissions"],
    notes: "Evaluate only where I&C is assigned.",
  },
  {
    code: "MATERIALS",
    existingCoreRow: DISCIPLINE_CATALOG.find((row) => row.code === "MATERIALS")?.existingCoreRow ?? false,
    evaluateOnlyWhenAssigned: true,
    cost: ["material initial cost", "replacement", "whole-life consequences"],
    constructability: ["fabricability", "availability"],
    carbon: ["embodied carbon", "durability/maintenance consequences"],
    notes: "Do not fabricate Materials assignment where the project has none.",
  },
  {
    code: "SAFETY",
    existingCoreRow: DISCIPLINE_CATALOG.find((row) => row.code === "SAFETY")?.existingCoreRow ?? false,
    evaluateOnlyWhenAssigned: true,
    cost: [],
    constructability: [],
    carbon: [],
    notes: "Safety remains a mandatory constraint, not a negotiable score.",
  },
  {
    code: "ENVIRONMENTAL",
    existingCoreRow: DISCIPLINE_CATALOG.find((row) => row.code === "ENVIRONMENTAL")?.existingCoreRow ?? false,
    evaluateOnlyWhenAssigned: true,
    cost: ["environmental mitigation cost"],
    constructability: ["construction constraints"],
    carbon: ["carbon", "water", "waste", "land disturbance"],
    notes: "Evaluate other project-required environmental metrics only when assigned.",
  },
];

export function disciplineValueContribution(code: CanonicalDisciplineCode): DisciplineValueContribution | null {
  if (!(CANONICAL_DISCIPLINE_CODES as readonly string[]).includes(code)) return null;
  return DISCIPLINE_VALUE_CONTRIBUTIONS.find((row) => row.code === code) ?? null;
}

export function valueLifecycleKeyFor(stage: LifecycleStage, workType?: GeneratorWorkType | null): ValueLifecycleKey {
  if (workType === "HANDOVER_PREPARATION") return "HANDOVER";
  return stage as ValueLifecycleKey;
}

export type WorkPlanValueRequirement = {
  kind: ValueCriterionKind;
  applicability: ValueApplicability;
  maturity: string;
  expectedEvidence: string;
  evidenceState: ValueEvidenceState;
  evidenceRef: { objectType: string; objectId: string; title: string } | null;
  quantified: false | true;
  automaticAcceptance: false;
  includeArtifactSection: boolean;
};

export function valuePolicyForProject(projectId: string): ProjectValuePolicy {
  if (projectId === CRUSHER_EXPANSION_FEED_PROJECT_ID) {
    return resolveProjectValuePolicy({
      cost: "REQUIRED",
      constructability: "REQUIRED",
      carbon: "REQUIRED",
      carbonRequiredBy: "CLIENT_REQUIREMENT",
    });
  }
  return resolveProjectValuePolicy();
}

export function syntheticDemonstrationEvidence(projectId: string, key: ValueLifecycleKey): Partial<Record<ValueCriterionKind, { state: ValueEvidenceState; ref?: WorkPlanValueRequirement["evidenceRef"] }>> | undefined {
  if (projectId !== CRUSHER_EXPANSION_FEED_PROJECT_ID) return undefined;
  const mark = "SYNTHETIC_DEMONSTRATION_DATA" as const;
  return {
    COST: { state: mark, ref: { objectType: "cost_input", objectId: `syn-cost-${key}`, title: `${mark} cost evidence (${key})` } },
    CONSTRUCTABILITY: { state: mark, ref: { objectType: "constructability_review", objectId: `syn-con-${key}`, title: `${mark} constructability evidence (${key})` } },
    CARBON: { state: mark, ref: { objectType: "carbon_record", objectId: `syn-co2-${key}`, title: `${mark} carbon evidence (${key})` } },
  };
}

export function composeWorkPlanValueRequirements(input: {
  stage: LifecycleStage;
  workType?: GeneratorWorkType | null;
  discipline?: string | null;
  assignedDisciplines?: readonly string[] | null;
  policy?: ProjectValuePolicy;
  evidence?: Partial<Record<ValueCriterionKind, { state: ValueEvidenceState; ref?: WorkPlanValueRequirement["evidenceRef"] }>>;
}): WorkPlanValueRequirement[] {
  const policy = input.policy ?? resolveProjectValuePolicy();
  const key = valueLifecycleKeyFor(input.stage, input.workType);
  const assigned = new Set((input.assignedDisciplines ?? (input.discipline ? [input.discipline] : [])).map((row) => row.toUpperCase()));
  if (input.discipline && assigned.size && !DISCIPLINE_VALUE_CONTRIBUTIONS.some((row) => assigned.has(row.code))) {
    // unknown discipline codes are ignored; do not fabricate responsibility
  }
  const applicabilityOf = (kind: ValueCriterionKind): ValueApplicability =>
    kind === "COST" ? policy.cost : kind === "CONSTRUCTABILITY" ? policy.constructability : policy.carbon;

  return VALUE_CRITERION_KINDS.map((kind) => {
    const applicability = applicabilityOf(kind);
    const expectation = LIFECYCLE_VALUE_EXPECTATIONS[key][kind];
    const evidence = input.evidence?.[kind];
    const includeArtifactSection = applicability === "REQUIRED" || applicability === "REPORT_ONLY";
    return {
      kind,
      applicability,
      maturity: expectation.maturity,
      expectedEvidence: expectation.evidence,
      evidenceState: evidence?.state ?? (applicability === "NOT_APPLICABLE" ? "NOT_EVALUATED" : "REQUIRES_INPUT"),
      evidenceRef: evidence?.ref ?? null,
      quantified: evidence?.state === "QUANTIFIED_GOVERNED" || evidence?.state === "SYNTHETIC_DEMONSTRATION_DATA",
      automaticAcceptance: false as const,
      includeArtifactSection,
    };
  });
}

export function withWorkPlanValueRequirements(
  context: WorkPlanContext,
  requirements: WorkPlanValueRequirement[],
): WorkPlanContext {
  return { ...context, evaluationRequirements: requirements };
}

export type CostProvenanceInput = {
  quantityBasis?: string | null;
  rateSource?: string | null;
  currency?: string | null;
  baseDate?: string | null;
  estimateClass?: string | null;
  assumptions?: string[] | null;
  exclusions?: string[] | null;
  uncertainty?: string | null;
  humanEnteredValue?: number | null;
};

export type CostQuantification = {
  state: ValueEvidenceState;
  value: number | null;
  provenance: CostProvenanceInput & { fabricatingPlatform: false };
  reason: string;
};

export function quantifyCost(input: CostProvenanceInput): CostQuantification {
  const missing = [
    !input.quantityBasis ? "quantity basis" : null,
    !input.rateSource ? "rate/reference source" : null,
    !input.currency ? "currency" : null,
    !input.baseDate ? "base date" : null,
  ].filter(Boolean);
  if (missing.length || input.humanEnteredValue == null || !Number.isFinite(input.humanEnteredValue)) {
    return {
      state: missing.length ? "REQUIRES_INPUT" : "NOT_EVALUATED",
      value: null,
      provenance: { ...input, fabricatingPlatform: false },
      reason: `EOS does not fabricate CAPEX/OPEX/unit rates. Missing: ${missing.join(", ") || "human-entered governed value"}.`,
    };
  }
  return {
    state: "QUANTIFIED_GOVERNED",
    value: input.humanEnteredValue,
    provenance: { ...input, fabricatingPlatform: false },
    reason: "Governed quantity, rate source, currency, base date, and human-entered value present. Not an estimating platform.",
  };
}

export type CarbonProvenanceInput = {
  quantity?: number | null;
  quantitySource?: string | null;
  materialOrProcess?: string | null;
  emissionFactor?: number | null;
  factorSource?: string | null;
  factorVersion?: string | null;
  factorDate?: string | null;
  unit?: string | null;
  boundary?: string | null;
  method?: string | null;
  assumptions?: string[] | null;
};

export type CarbonQuantification = {
  state: ValueEvidenceState;
  value: number | null;
  unit: string | null;
  provenance: CarbonProvenanceInput;
  reason: string;
  truthScore: null;
};

export function quantifyCarbon(input: CarbonProvenanceInput): CarbonQuantification {
  const missing = [
    input.quantity == null ? "quantity" : null,
    !input.quantitySource ? "quantity source" : null,
    !input.materialOrProcess ? "material/process" : null,
    input.emissionFactor == null ? "emission factor" : null,
    !input.factorSource ? "factor source" : null,
    !input.factorVersion ? "factor version" : null,
    !input.unit ? "unit" : null,
    !input.boundary ? "system boundary" : null,
  ].filter(Boolean);
  if (missing.length) {
    return {
      state: "NOT_EVALUATED",
      value: null,
      unit: null,
      provenance: input,
      reason: `EOS does not invent emission factors. Missing: ${missing.join(", ")}.`,
      truthScore: null,
    };
  }
  return {
    state: "QUANTIFIED_GOVERNED",
    value: (input.quantity as number) * (input.emissionFactor as number),
    unit: input.unit ?? null,
    provenance: input,
    reason: "Deterministic quantity × governed factor. Not a universal carbon truth score.",
    truthScore: null,
  };
}

export type ConstructabilityEvidence = {
  reviewRecord?: string | null;
  constraint?: string | null;
  constructionMethod?: string | null;
  liftingLogistics?: string | null;
  temporaryWorks?: string | null;
  access?: string | null;
  sequence?: string | null;
  brownfieldShutdown?: string | null;
  opaqueScore: null;
};

export function recordConstructabilityEvidence(input: Omit<ConstructabilityEvidence, "opaqueScore">): ConstructabilityEvidence {
  return { ...input, opaqueScore: null };
}

export const OPTION_VALUE_CRITERION_KEYS = [
  "technical_performance",
  "safety",
  "capex",
  "opex",
  "constructability",
  "schedule",
  "operability",
  "maintainability",
  "carbon",
  "environmental",
  "risk",
  "uncertainty",
] as const;

export function composeOptionValueCriteria(policy: ProjectValuePolicy = resolveProjectValuePolicy()): OptionCriterion[] {
  const rows: Array<OptionCriterion & { role: "OBJECTIVE" | "MANDATORY_CONSTRAINT"; applicability: ValueApplicability }> = [
    { key: "technical_performance", label: "Technical Performance", direction: "MAXIMIZE", unit: "score", weight: 0, weightSource: "HUMAN_ENTERED", role: "OBJECTIVE", applicability: "REQUIRED" },
    { key: "safety", label: "Safety", direction: "MAXIMIZE", unit: "constraint", weight: 0, weightSource: "HUMAN_ENTERED", role: "MANDATORY_CONSTRAINT", applicability: "REQUIRED" },
    { key: "capex", label: "CAPEX", direction: "MINIMIZE", unit: "relative", weight: 0, weightSource: "HUMAN_ENTERED", role: "OBJECTIVE", applicability: policy.cost },
    { key: "opex", label: "OPEX", direction: "MINIMIZE", unit: "relative", weight: 0, weightSource: "HUMAN_ENTERED", role: "OBJECTIVE", applicability: policy.cost },
    { key: "constructability", label: "Constructability", direction: "MAXIMIZE", unit: "narrative", weight: 0, weightSource: "HUMAN_ENTERED", role: "OBJECTIVE", applicability: policy.constructability },
    { key: "schedule", label: "Schedule", direction: "MINIMIZE", unit: "months", weight: 0, weightSource: "HUMAN_ENTERED", role: "OBJECTIVE", applicability: "OPTIONAL" },
    { key: "operability", label: "Operability", direction: "MAXIMIZE", unit: "narrative", weight: 0, weightSource: "HUMAN_ENTERED", role: "OBJECTIVE", applicability: "OPTIONAL" },
    { key: "maintainability", label: "Maintainability", direction: "MAXIMIZE", unit: "score", weight: 0, weightSource: "HUMAN_ENTERED", role: "OBJECTIVE", applicability: "OPTIONAL" },
    { key: "carbon", label: "Carbon", direction: "MINIMIZE", unit: "relative", weight: 0, weightSource: "HUMAN_ENTERED", role: "OBJECTIVE", applicability: policy.carbon },
    { key: "environmental", label: "Environmental", direction: "MINIMIZE", unit: "relative", weight: 0, weightSource: "HUMAN_ENTERED", role: "OBJECTIVE", applicability: policy.carbon === "REQUIRED" ? "REPORT_ONLY" : "OPTIONAL" },
    { key: "risk", label: "Risk", direction: "MINIMIZE", unit: "narrative", weight: 0, weightSource: "HUMAN_ENTERED", role: "OBJECTIVE", applicability: "OPTIONAL" },
    { key: "uncertainty", label: "Uncertainty", direction: "MINIMIZE", unit: "narrative", weight: 0, weightSource: "HUMAN_ENTERED", role: "OBJECTIVE", applicability: "OPTIONAL" },
  ];
  return rows.map((row) => ({
    key: row.key,
    label: row.label,
    direction: row.direction,
    unit: row.unit,
    weight: row.weight,
    weightSource: row.weightSource,
    role: row.role,
    applicability: row.applicability,
  }));
}

export function optionObjectivesForPareto(criteria: Array<OptionCriterion & { role?: string; applicability?: string }>): OptionCriterion[] {
  return criteria.filter((row) => row.role !== "MANDATORY_CONSTRAINT" && row.applicability !== "NOT_APPLICABLE" && row.weight > 0);
}

export type DecisionValueComposition = {
  criteria: Array<{ key: string; label: string; weight: number | null; weightSource: "HUMAN_ENTERED" | "NOT_CONFIGURED" }>;
  evidence: string[];
  tradeOffs: string[];
  humanRationale: string | null;
  inferredRationale: false;
  automaticWinner: false;
};

export function composeDecisionValueRecord(input: {
  criteria: OptionCriterion[];
  evidence: string[];
  tradeOffs: string[];
  humanRationale?: string | null;
}): DecisionValueComposition {
  return {
    criteria: input.criteria.map((row) => ({
      key: row.key,
      label: row.label,
      weight: row.weight > 0 ? row.weight : null,
      weightSource: row.weight > 0 ? "HUMAN_ENTERED" : "NOT_CONFIGURED",
    })),
    evidence: input.evidence,
    tradeOffs: input.tradeOffs,
    humanRationale: input.humanRationale ?? null,
    inferredRationale: false,
    automaticWinner: false,
  };
}

export const IMPACT_VALUE_DIMENSIONS = ["TECHNICAL", "QUANTITY", "COST", "CONSTRUCTABILITY", "SCHEDULE", "CARBON"] as const;
export type ImpactValueDimension = (typeof IMPACT_VALUE_DIMENSIONS)[number];

export type PotentialValueImpact = {
  dimension: ImpactValueDimension;
  status: "POTENTIAL";
  quantified: false;
  autoConfirmed: false;
  objectType: string;
  objectId: string;
  reason: string;
};

export function composePotentialValueImpacts(input: {
  candidates: PotentialImpactCandidate[];
  policy?: ProjectValuePolicy;
  costQuantified?: boolean;
  carbonQuantified?: boolean;
}): PotentialValueImpact[] {
  const policy = input.policy ?? resolveProjectValuePolicy();
  const rows: PotentialValueImpact[] = [];
  for (const candidate of input.candidates) {
    rows.push({
      dimension: "TECHNICAL",
      status: "POTENTIAL",
      quantified: false,
      autoConfirmed: false,
      objectType: candidate.objectType,
      objectId: candidate.objectId,
      reason: candidate.reason,
    });
    rows.push({
      dimension: "QUANTITY",
      status: "POTENTIAL",
      quantified: false,
      autoConfirmed: false,
      objectType: candidate.objectType,
      objectId: candidate.objectId,
      reason: "Potential quantity implication. Quantity delta is evidence, not a cost or carbon result.",
    });
    if (policy.cost !== "NOT_APPLICABLE") {
      rows.push({
        dimension: "COST",
        status: "POTENTIAL",
        quantified: false,
        autoConfirmed: false,
        objectType: candidate.objectType,
        objectId: candidate.objectId,
        reason: input.costQuantified
          ? "Potential cost implication. Human confirmation required."
          : "Potential cost implication. Unavailable cost is not automatically quantified.",
      });
    }
    if (policy.constructability !== "NOT_APPLICABLE") {
      rows.push({
        dimension: "CONSTRUCTABILITY",
        status: "POTENTIAL",
        quantified: false,
        autoConfirmed: false,
        objectType: candidate.objectType,
        objectId: candidate.objectId,
        reason: "Potential constructability implication. Related is not confirmed impact.",
      });
    }
    rows.push({
      dimension: "SCHEDULE",
      status: "POTENTIAL",
      quantified: false,
      autoConfirmed: false,
      objectType: candidate.objectType,
      objectId: candidate.objectId,
      reason: "Potential schedule implication. Not a planning-system forecast.",
    });
    if (policy.carbon !== "NOT_APPLICABLE") {
      rows.push({
        dimension: "CARBON",
        status: "POTENTIAL",
        quantified: false,
        autoConfirmed: false,
        objectType: candidate.objectType,
        objectId: candidate.objectId,
        reason: input.carbonQuantified
          ? "Potential carbon implication. Human confirmation required."
          : "Potential carbon implication. Unavailable carbon is not automatically quantified.",
      });
    }
  }
  return rows;
}

export type SystemValueConsequence = {
  trigger: string;
  steps: string[];
  disciplines: CanonicalDisciplineCode[];
  automaticQuantification: false;
  classification: "POTENTIAL";
};

export function composeSystemValueConsequences(kind: "LARGER_PIPE"): SystemValueConsequence {
  if (kind === "LARGER_PIPE") {
    return {
      trigger: "larger pipe",
      steps: [
        "increased piping CAPEX",
        "reduced pressure loss",
        "reduced pump power",
        "electrical / OPEX / carbon consequence",
      ],
      disciplines: ["PIPING", "MECHANICAL", "ELECTRICAL"],
      automaticQuantification: false,
      classification: "POTENTIAL",
    };
  }
  return { trigger: kind, steps: [], disciplines: [], automaticQuantification: false, classification: "POTENTIAL" };
}

export type ValueReviewCheck = {
  kind: ValueCriterionKind;
  evidenceExists: boolean;
  conclusion: "EVIDENCE_PRESENT" | "EVIDENCE_MISSING" | "NOT_APPLICABLE";
  costAcceptable: false;
  constructable: false;
  carbonCompliant: false;
};

export function reviewValueEvidence(requirements: WorkPlanValueRequirement[] | undefined | null): ValueReviewCheck[] {
  return (requirements ?? []).map((row) => {
    if (row.applicability === "NOT_APPLICABLE") {
      return { kind: row.kind, evidenceExists: false, conclusion: "NOT_APPLICABLE", costAcceptable: false, constructable: false, carbonCompliant: false };
    }
    const present = row.evidenceState === "EVIDENCE_PRESENT" || row.evidenceState === "QUANTIFIED_GOVERNED" || row.evidenceState === "SYNTHETIC_DEMONSTRATION_DATA";
    return {
      kind: row.kind,
      evidenceExists: present,
      conclusion: present ? "EVIDENCE_PRESENT" : "EVIDENCE_MISSING",
      costAcceptable: false,
      constructable: false,
      carbonCompliant: false,
    };
  });
}

export function valueArtifactSections(requirements: WorkPlanValueRequirement[] | undefined | null): Array<{ kind: ValueCriterionKind; heading: string; body: string }> {
  return (requirements ?? [])
    .filter((row) => row.includeArtifactSection)
    .map((row) => ({
      kind: row.kind,
      heading: row.kind === "COST" ? "Cost" : row.kind === "CONSTRUCTABILITY" ? "Constructability" : "Carbon / Sustainability",
      body: `${row.maturity}. Evidence: ${row.evidenceState}. ${row.expectedEvidence} Not automatically accepted.`,
    }));
}

export function infeasibleAgainstSafetyHierarchy(option: OptionAlternative): boolean {
  if (option.safetyFeasible === false) return true;
  return false;
}

export const A15A_V1_FUTURE_PILOT_METRICS = [
  "assemble Cost/Constructability/Carbon evidence",
  "compare options including applicable value criteria",
  "identify affected cost/constructability/carbon context after change",
  "prepare lifecycle reports with applicable value sections",
  "support engineering decisions without employee surveillance",
] as const;
