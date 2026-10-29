import type {
  ConcreteCompletenessState,
  ConcreteInvalidationTag,
  ConcreteLimitState,
  ConcreteOptimizationCandidate,
  ConcreteResultFingerprint,
  StructuralDemandResult,
} from "@rtb/types";
import {
  AUTOMATIC_CONCRETE_ENGINEERING_APPROVAL,
  CONCRETE_COMPLETENESS_STATES,
  CONCRETE_LIMIT_STATES,
  CONCRETE_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  DEFAULT_MINIMUM_CONCRETE_COVER,
  PARALLEL_CONCRETE_DEMAND_ENGINE_CREATED,
  STALE_CONCRETE_RESULT_REUSE_ALLOWED,
} from "@rtb/types";
import { OPTIMIZATION_REQUIRES_DETERMINISTIC_RECHECK } from "@rtb/types";

export function consumeConcreteDemandHandoff(
  demand: Pick<StructuralDemandResult, "resultId" | "capacityPresent" | "memberId">,
): string {
  if (PARALLEL_CONCRETE_DEMAND_ENGINE_CREATED) throw new Error("parallel concrete demand engine is forbidden");
  if (demand.capacityPresent) throw new Error("D1C demand must not contain capacity");
  if (!demand.resultId) throw new Error("concrete design fail closed: demand missing");
  return demand.resultId;
}

export function completenessForUnsupported(limitState: ConcreteLimitState): ConcreteCompletenessState {
  if (!CONCRETE_LIMIT_STATES.includes(limitState)) throw new Error("unknown concrete limit state");
  return "METHOD_NOT_IMPLEMENTED";
}

export function failClosedCheckState(reason: ConcreteCompletenessState): "CHECK_UNDETERMINED" {
  if (DEFAULT_MINIMUM_CONCRETE_COVER) throw new Error("default minimum concrete cover is forbidden");
  if (!CONCRETE_COMPLETENESS_STATES.includes(reason)) throw new Error("unknown completeness state");
  if (AUTOMATIC_CONCRETE_ENGINEERING_APPROVAL) throw new Error("automatic concrete engineering approval is forbidden");
  return "CHECK_UNDETERMINED";
}

export function concreteInvalidationTags(previous: ConcreteResultFingerprint | null | undefined, current: ConcreteResultFingerprint): ConcreteInvalidationTag[] {
  if (!previous) return [];
  const tags: ConcreteInvalidationTag[] = [];
  if (previous.sectionRef !== current.sectionRef) tags.push("GEOMETRY_CHANGED");
  if (previous.concreteMaterialRef !== current.concreteMaterialRef) tags.push("CONCRETE_MATERIAL_CHANGED");
  if (previous.reinforcementMaterialRef !== current.reinforcementMaterialRef || previous.reinforcementLayoutRef !== current.reinforcementLayoutRef) {
    tags.push("REINFORCEMENT_CHANGED");
  }
  if (previous.coverFingerprint !== current.coverFingerprint) tags.push("COVER_CHANGED");
  if (previous.demandResultId !== current.demandResultId || previous.combinationId !== current.combinationId) tags.push("DEMAND_CHANGED");
  if (previous.standardContextId !== current.standardContextId) tags.push("STANDARD_CONTEXT_CHANGED");
  if (previous.engineeringRuleRef !== current.engineeringRuleRef) tags.push("ENGINEERING_RULE_CHANGED");
  if (previous.methodVersion !== current.methodVersion) tags.push("METHOD_VERSION_CHANGED");
  if (previous.durabilityContextRef !== current.durabilityContextRef) tags.push("DURABILITY_CONTEXT_CHANGED");
  if (previous.serviceabilityCriterionRef !== current.serviceabilityCriterionRef) tags.push("SERVICEABILITY_CRITERION_CHANGED");
  return tags;
}

export function assertStaleConcreteResultsNotReused(tags: ConcreteInvalidationTag[], reuseAttempted: boolean): void {
  if (STALE_CONCRETE_RESULT_REUSE_ALLOWED) throw new Error("stale concrete result reuse must not be allowed");
  if (reuseAttempted && tags.length > 0) throw new Error("concrete design fail closed: stale result");
}

export function assertCandidateFullConcreteRecheck(candidate: ConcreteOptimizationCandidate): void {
  if (!OPTIMIZATION_REQUIRES_DETERMINISTIC_RECHECK) throw new Error("optimization candidates must be rechecked deterministically");
  if (!candidate.deterministicRecheckRequired) throw new Error("optimization candidates must be rechecked deterministically");
  if (!candidate.rechecked) throw new Error("candidate optimization section requires deterministic recheck");
  if (CONCRETE_OPTIMIZATION_ACCEPTS_UNDETERMINED) throw new Error("optimizer cannot accept undetermined as pass");
  if (candidate.memberCheckState === "CHECK_UNDETERMINED" || candidate.interactionCheckState === "CHECK_UNDETERMINED") {
    throw new Error("optimizer cannot accept undetermined as pass");
  }
  if (candidate.memberCheckState == null) throw new Error("candidate optimization section requires deterministic recheck");
}
