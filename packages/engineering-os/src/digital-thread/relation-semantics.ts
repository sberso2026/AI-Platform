/**
 * Authoritative governed relation semantics for EOS-A8A Digital Thread.
 * Codes are the existing GOVERNED_RELATION_TYPES — this is metadata, not a second taxonomy.
 */

import { GOVERNED_RELATION_TYPES, type GovernedRelationType } from "../decision-intelligence/relations";

export type LifecycleDirection = "from_is_upstream" | "to_is_upstream" | "symmetric";
export type RelationPairJudgement = "ALLOWED" | "DISCOURAGED" | "FORBIDDEN";

export type GovernedRelationSemantics = {
  code: GovernedRelationType;
  meaning: string;
  inverseLabel: string;
  direction: "from→to";
  lifecycleDirection: LifecycleDirection;
  allowedSourceTypes: readonly string[];
  allowedTargetTypes: readonly string[];
  transitivity: "prohibited" | "allowed_same_type" | "traversal_only";
  traversalRelevant: boolean;
  impactRelevant: boolean;
  assuranceRelevant: boolean;
};

const ANY_ENGINEERING = [
  "project",
  "system",
  "asset",
  "interface",
  "requirement",
  "assumption",
  "decision",
  "alternative",
  "document",
  "analysis_request",
  "analysis_result",
  "review_package",
  "review_evidence",
  "review_finding",
  "change",
  "impact",
  "configuration_baseline",
  "configuration_item",
  "optimization_study",
  "optimization_run",
  "optimization_alternative",
  "optimization_constraint",
  "risk",
  "engineering_information",
  "engineering_work_event",
  "engineering_information_requirement",
  "engineering_handover_package",
  "deliverable_expectation",
] as const;

export const GOVERNED_RELATION_SEMANTICS: Record<GovernedRelationType, GovernedRelationSemantics> = {
  CONTAINS: {
    code: "CONTAINS",
    meaning: "Parent contains child without transferring identity.",
    inverseLabel: "CONTAINED_IN",
    direction: "from→to",
    lifecycleDirection: "from_is_upstream",
    allowedSourceTypes: ["project", "system", "asset", "configuration_baseline", "document"],
    allowedTargetTypes: ["system", "asset", "interface", "document", "configuration_item"],
    transitivity: "allowed_same_type",
    traversalRelevant: true,
    impactRelevant: true,
    assuranceRelevant: false,
  },
  USES: {
    code: "USES",
    meaning: "Subject uses the target as a participant or input without exclusive ownership. EOS-A8A maps A7B USES_RESULT_FROM here (downstream analysis_request USES upstream request/result).",
    inverseLabel: "USED_IN",
    direction: "from→to",
    lifecycleDirection: "to_is_upstream",
    allowedSourceTypes: ["system", "asset", "analysis_request", "optimization_run", "decision", "document", "engineering_information", "engineering_work_event", "engineering_information_requirement", "engineering_handover_package", "deliverable_expectation"],
    allowedTargetTypes: ["asset", "system", "analysis_request", "analysis_result", "document", "interface", "engineering_information", "engineering_information_requirement"],
    transitivity: "traversal_only",
    traversalRelevant: true,
    impactRelevant: true,
    assuranceRelevant: false,
  },
  DEPENDS_ON: {
    code: "DEPENDS_ON",
    meaning: "Subject requires the target to function or to execute. A7B REQUIRES_RESULT_FROM: downstream analysis_request DEPENDS_ON upstream request/result.",
    inverseLabel: "DEPENDED_ON_BY",
    direction: "from→to",
    lifecycleDirection: "to_is_upstream",
    allowedSourceTypes: ["system", "asset", "requirement", "analysis_request", "change", "optimization_run", "engineering_information", "engineering_work_event", "engineering_information_requirement", "interface"],
    allowedTargetTypes: ["system", "asset", "requirement", "analysis_request", "analysis_result", "interface", "document", "engineering_information", "engineering_information_requirement"],
    transitivity: "traversal_only",
    traversalRelevant: true,
    impactRelevant: true,
    assuranceRelevant: true,
  },
  ALLOCATED_TO: {
    code: "ALLOCATED_TO",
    meaning: "Requirement is allocated to a system, asset, or interface.",
    inverseLabel: "HAS_ALLOCATION",
    direction: "from→to",
    lifecycleDirection: "from_is_upstream",
    allowedSourceTypes: ["requirement"],
    allowedTargetTypes: ["system", "asset", "interface"],
    transitivity: "prohibited",
    traversalRelevant: true,
    impactRelevant: true,
    assuranceRelevant: true,
  },
  VERIFIED_BY: {
    code: "VERIFIED_BY",
    meaning: "Subject is verified by evidence, review, or analysis. A7B VALIDATES maps here.",
    inverseLabel: "VERIFIES",
    direction: "from→to",
    lifecycleDirection: "from_is_upstream",
    allowedSourceTypes: ["requirement", "change", "analysis_request", "analysis_result"],
    allowedTargetTypes: ["document", "review_package", "review_evidence", "analysis_result", "analysis_request"],
    transitivity: "prohibited",
    traversalRelevant: true,
    impactRelevant: false,
    assuranceRelevant: true,
  },
  USED_BY: {
    code: "USED_BY",
    meaning: "From-object is used by the to-object (A1: assumption USED_BY consumer). Do not invert this verb.",
    inverseLabel: "USES_ASSUMPTION",
    direction: "from→to",
    lifecycleDirection: "from_is_upstream",
    allowedSourceTypes: ["assumption", "analysis_result", "analysis_request", "document", "optimization_run"],
    allowedTargetTypes: ["decision", "requirement", "analysis_request", "optimization_study", "optimization_run", "document", "calculation", "change"],
    transitivity: "prohibited",
    traversalRelevant: true,
    impactRelevant: true,
    assuranceRelevant: true,
  },
  CONNECTS: {
    code: "CONNECTS",
    meaning: "Interface connects a participant (system, asset, or responsibility).",
    inverseLabel: "CONNECTED_BY",
    direction: "from→to",
    lifecycleDirection: "from_is_upstream",
    allowedSourceTypes: ["interface"],
    allowedTargetTypes: ["system", "asset", "project"],
    transitivity: "prohibited",
    traversalRelevant: true,
    impactRelevant: true,
    assuranceRelevant: true,
  },
  AFFECTS: {
    code: "AFFECTS",
    meaning: "Change (or decision) affects an engineering object. Discovered dependencies are not confirmed Impacts.",
    inverseLabel: "AFFECTED_BY",
    direction: "from→to",
    lifecycleDirection: "from_is_upstream",
    allowedSourceTypes: ["change", "decision", "engineering_work_event"],
    allowedTargetTypes: ANY_ENGINEERING,
    transitivity: "prohibited",
    traversalRelevant: true,
    impactRelevant: true,
    assuranceRelevant: true,
  },
  CAUSED_BY: {
    code: "CAUSED_BY",
    meaning: "Impact is caused by a change (or other governed event).",
    inverseLabel: "CAUSES",
    direction: "from→to",
    lifecycleDirection: "to_is_upstream",
    allowedSourceTypes: ["impact"],
    allowedTargetTypes: ["change"],
    transitivity: "prohibited",
    traversalRelevant: true,
    impactRelevant: true,
    assuranceRelevant: true,
  },
  SELECTS: {
    code: "SELECTS",
    meaning: "Decision selects an alternative.",
    inverseLabel: "SELECTED_BY",
    direction: "from→to",
    lifecycleDirection: "from_is_upstream",
    allowedSourceTypes: ["decision"],
    allowedTargetTypes: ["alternative", "optimization_alternative"],
    transitivity: "prohibited",
    traversalRelevant: true,
    impactRelevant: false,
    assuranceRelevant: true,
  },
  SUPPORTED_BY: {
    code: "SUPPORTED_BY",
    meaning: "Decision, finding, or claim is supported by evidence or an analysis result.",
    inverseLabel: "SUPPORTS",
    direction: "from→to",
    lifecycleDirection: "to_is_upstream",
    allowedSourceTypes: ["decision", "review_finding", "analysis_request", "change"],
    allowedTargetTypes: ["analysis_result", "review_evidence", "document", "assumption", "review_package", "engineering_information"],
    transitivity: "prohibited",
    traversalRelevant: true,
    impactRelevant: false,
    assuranceRelevant: true,
  },
  BASED_ON: {
    code: "BASED_ON",
    meaning: "Subject is based on an assumption, requirement, or other basis.",
    inverseLabel: "BASIS_FOR",
    direction: "from→to",
    lifecycleDirection: "to_is_upstream",
    allowedSourceTypes: ["decision", "analysis_request", "change", "optimization_study", "document"],
    allowedTargetTypes: ["assumption", "requirement", "document", "analysis_result", "engineering_information"],
    transitivity: "prohibited",
    traversalRelevant: true,
    impactRelevant: true,
    assuranceRelevant: true,
  },
  REVIEWS: {
    code: "REVIEWS",
    meaning: "Review package reviews an engineering object.",
    inverseLabel: "REVIEWED_BY",
    direction: "from→to",
    lifecycleDirection: "to_is_upstream",
    allowedSourceTypes: ["review_package"],
    allowedTargetTypes: ANY_ENGINEERING,
    transitivity: "prohibited",
    traversalRelevant: true,
    impactRelevant: false,
    assuranceRelevant: true,
  },
  FOUND_IN: {
    code: "FOUND_IN",
    meaning: "Finding was found in a review run/package.",
    inverseLabel: "HAS_FINDING",
    direction: "from→to",
    lifecycleDirection: "to_is_upstream",
    allowedSourceTypes: ["review_finding"],
    allowedTargetTypes: ["review_package"],
    transitivity: "prohibited",
    traversalRelevant: true,
    impactRelevant: false,
    assuranceRelevant: true,
  },
  RESOLVES: {
    code: "RESOLVES",
    meaning: "Disposition resolves a finding.",
    inverseLabel: "RESOLVED_BY",
    direction: "from→to",
    lifecycleDirection: "from_is_upstream",
    allowedSourceTypes: ["decision", "change"],
    allowedTargetTypes: ["review_finding"],
    transitivity: "prohibited",
    traversalRelevant: true,
    impactRelevant: false,
    assuranceRelevant: true,
  },
  BASELINES: {
    code: "BASELINES",
    meaning: "Configuration baseline baselines configuration items (snapshot, not live reconstruction).",
    inverseLabel: "BASELINED_IN",
    direction: "from→to",
    lifecycleDirection: "from_is_upstream",
    allowedSourceTypes: ["configuration_baseline"],
    allowedTargetTypes: ["configuration_item", "document", "system", "asset", "requirement", "engineering_information"],
    transitivity: "prohibited",
    traversalRelevant: true,
    impactRelevant: false,
    assuranceRelevant: true,
  },
  SUPERSEDES: {
    code: "SUPERSEDES",
    meaning: "Later object supersedes an earlier object of the same class. Loops are prohibited by owning bounded contexts.",
    inverseLabel: "SUPERSEDED_BY",
    direction: "from→to",
    lifecycleDirection: "to_is_upstream",
    allowedSourceTypes: ANY_ENGINEERING,
    allowedTargetTypes: ANY_ENGINEERING,
    transitivity: "allowed_same_type",
    traversalRelevant: true,
    impactRelevant: true,
    assuranceRelevant: true,
  },
  MAPPED_TO: {
    code: "MAPPED_TO",
    meaning: "Model element is mapped to a platform object.",
    inverseLabel: "MAPPED_FROM",
    direction: "from→to",
    lifecycleDirection: "from_is_upstream",
    allowedSourceTypes: ["document", "asset", "system"],
    allowedTargetTypes: ANY_ENGINEERING,
    transitivity: "prohibited",
    traversalRelevant: true,
    impactRelevant: false,
    assuranceRelevant: false,
  },
  REPRESENTED_BY: {
    code: "REPRESENTED_BY",
    meaning: "Engineering object is represented by a Platform KG node or twin identity. Not a Digital Twin operational edge.",
    inverseLabel: "REPRESENTS",
    direction: "from→to",
    lifecycleDirection: "from_is_upstream",
    allowedSourceTypes: ANY_ENGINEERING,
    allowedTargetTypes: ["knowledge_node", "digital_twin"],
    transitivity: "prohibited",
    traversalRelevant: false,
    impactRelevant: false,
    assuranceRelevant: false,
  },
  SCOPED_TO: {
    code: "SCOPED_TO",
    meaning: "Optimization or analysis is scoped to a system, project, or baseline.",
    inverseLabel: "HAS_SCOPE",
    direction: "from→to",
    lifecycleDirection: "from_is_upstream",
    allowedSourceTypes: ["optimization_study", "optimization_run", "analysis_request"],
    allowedTargetTypes: ["system", "project", "configuration_baseline", "asset"],
    transitivity: "prohibited",
    traversalRelevant: true,
    impactRelevant: true,
    assuranceRelevant: false,
  },
  CONSTRAINED_BY: {
    code: "CONSTRAINED_BY",
    meaning: "Optimization or analysis is constrained by a requirement, assumption, or constraint object.",
    inverseLabel: "CONSTRAINS",
    direction: "from→to",
    lifecycleDirection: "to_is_upstream",
    allowedSourceTypes: ["optimization_study", "optimization_run", "optimization_alternative", "analysis_request"],
    allowedTargetTypes: ["requirement", "assumption", "optimization_constraint", "interface"],
    transitivity: "prohibited",
    traversalRelevant: true,
    impactRelevant: true,
    assuranceRelevant: true,
  },
};

export function relationSemantics(code: string): GovernedRelationSemantics | null {
  if (!(GOVERNED_RELATION_TYPES as readonly string[]).includes(code)) return null;
  return GOVERNED_RELATION_SEMANTICS[code as GovernedRelationType];
}

export function isLifecycleUpstreamHop(
  relationship: string,
  currentIsFrom: boolean,
): boolean {
  const sem = relationSemantics(relationship);
  if (!sem) return !currentIsFrom;
  if (sem.lifecycleDirection === "symmetric") return true;
  if (sem.lifecycleDirection === "from_is_upstream") return !currentIsFrom;
  return currentIsFrom;
}

function pairKnown(fromType: string, toType: string, allowedFrom: readonly string[], allowedTo: readonly string[]): boolean {
  return allowedFrom.includes(fromType) && allowedTo.includes(toType);
}

/** Soft type safety: forbid a small set of nonsensical pairs; allow legitimate future combinations. */
export function judgeRelationPair(fromType: string, relationship: string, toType: string): {
  judgement: RelationPairJudgement;
  reason: string;
} {
  const sem = relationSemantics(relationship);
  if (!sem) {
    return { judgement: "DISCOURAGED", reason: "ungoverned_or_legacy_relationship" };
  }
  if (fromType === toType && relationship === "ALLOCATED_TO") {
    return { judgement: "FORBIDDEN", reason: "requirement_cannot_allocate_to_itself" };
  }
  if (relationship === "CONNECTS" && fromType !== "interface") {
    return { judgement: "FORBIDDEN", reason: "CONNECTS_source_must_be_interface" };
  }
  if (relationship === "ALLOCATED_TO" && fromType !== "requirement") {
    return { judgement: "FORBIDDEN", reason: "ALLOCATED_TO_source_must_be_requirement" };
  }
  if (relationship === "CAUSED_BY" && (fromType !== "impact" || toType !== "change")) {
    return { judgement: "FORBIDDEN", reason: "CAUSED_BY_must_be_impact_to_change" };
  }
  if (relationship === "SELECTS" && fromType !== "decision") {
    return { judgement: "FORBIDDEN", reason: "SELECTS_source_must_be_decision" };
  }
  if (relationship === "REVIEWS" && fromType !== "review_package") {
    return { judgement: "FORBIDDEN", reason: "REVIEWS_source_must_be_review_package" };
  }
  if (relationship === "SUPERSEDES" && fromType !== toType) {
    return { judgement: "DISCOURAGED", reason: "supersession_typically_same_object_class" };
  }
  if (fromType === toType && ["fromId", "toId"].length && relationship === "SUPERSEDES") {
    return { judgement: "ALLOWED", reason: "same_class_supersession" };
  }
  if (pairKnown(fromType, toType, sem.allowedSourceTypes, sem.allowedTargetTypes)) {
    return { judgement: "ALLOWED", reason: "taxonomy_allowed" };
  }
  return { judgement: "DISCOURAGED", reason: "pair_not_in_recommended_classes" };
}

export function assertRelationPairAllowed(fromType: string, relationship: string, toType: string): void {
  const judged = judgeRelationPair(fromType, relationship, toType);
  if (judged.judgement === "FORBIDDEN") {
    throw new Error(`Forbidden Digital Thread relation: ${fromType} ${relationship} ${toType} (${judged.reason})`);
  }
}
