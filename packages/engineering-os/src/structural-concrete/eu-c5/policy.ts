import {
  AI_EU_C5_ASSISTANCE_ADVISORY_ONLY,
  AI_EU_C5_CHECK_OVERRIDE_AUTHORITY,
  AI_EU_C5_CONFORMANCE_AUTHORITY,
  AI_EU_C5_ENGINEERING_APPROVAL,
  AI_EU_C5_NDP_AUTHORITY,
  AI_EU_C5_RULE_PARAMETER_AUTHORITY,
  AI_EU_C5_SOURCE_CONFLICT_AUTHORITY,
  COPYRIGHTED_STANDARD_TEXT_REPRODUCED,
  DEFAULT_EU_CONCRETE_NATIONAL_ANNEX,
  EU_C5_CROSS_GENERATION_RULE_MIXING,
  EU_C5_IMPLEMENTED_METHOD_IDS,
  EU_C5_IMPLEMENTED_RULE_IDS,
  EU_C5_PUNCHING_REQUIRED_RULE_IDS,
  EU_C5_SHEAR_REQUIRED_RULE_IDS,
  EU_C5_T4_TORSION_RULE_IDS,
  EU_C5_NDP_VALUE_GUESSED,
  EU_C5_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  EU_C5_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE,
  EU_C5_RULE_AUTHORITY_POLICY_REUSED,
  EU_C5_SHEAR_PUNCHING_TORSION_SEMANTICS_SEPARATE,
  EU_C5_UNGOVERNED_COMBINED_ACTION_INTERACTION,
  EU_C5_UNGOVERNED_TORSION_INTERACTION_USED,
  EU_C5_UNPROVENANCED_NUMERICAL_CONSTANT_COUNT,
  GENERATIVE_MODEL_CAN_BYPASS_EU_C5,
  LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_IMPLEMENTATION,
  LLM_EU_C5_NUMERICAL_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  NATIONAL_ANNEX_INFERRED_FROM_LOCATION,
  PARALLEL_EU_C5_RULE_ENGINE_CREATED,
  PARALLEL_EU_C5_STANDARD_CONTEXT_CREATED,
  PARALLEL_EU_SHEAR_DEMAND_ENGINE_CREATED,
  STANDARD_DOCUMENT_REQUIRED_AT_RUNTIME,
  STANDARD_DOCUMENT_REQUIRED_IN_REPOSITORY,
} from "@rtb/types";
import { assertEuC5EvidenceLoaded, assertEuC5NoGuessedValues } from "./evidence";

export function assertEuC5CopyrightAndAnnexBoundary(): void {
  if (LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_IMPLEMENTATION) {
    throw new Error("licensed standard document must not be an implementation gate");
  }
  if (STANDARD_DOCUMENT_REQUIRED_AT_RUNTIME || STANDARD_DOCUMENT_REQUIRED_IN_REPOSITORY) {
    throw new Error("standard document must not be required at runtime or in-repository");
  }
  if (COPYRIGHTED_STANDARD_TEXT_REPRODUCED) {
    throw new Error("copyrighted standard text must not be reproduced");
  }
  if (DEFAULT_EU_CONCRETE_NATIONAL_ANNEX || NATIONAL_ANNEX_INFERRED_FROM_LOCATION) {
    throw new Error("C5 must not default or infer a National Annex");
  }
  if (EU_C5_NDP_VALUE_GUESSED) throw new Error("C5 must not guess NDP values");
}

export function assertEuC5ArchitectureFreeze(): void {
  if (PARALLEL_EU_C5_RULE_ENGINE_CREATED || PARALLEL_EU_C5_STANDARD_CONTEXT_CREATED) {
    throw new Error("C5 must not create a parallel rule engine or standard context");
  }
  if (PARALLEL_EU_SHEAR_DEMAND_ENGINE_CREATED) {
    throw new Error("C5 must not create a parallel shear demand engine");
  }
  if (!EU_C5_RULE_AUTHORITY_POLICY_REUSED) throw new Error("C5 must reuse the C1B rule-authority policy");
  if (!EU_C5_SHEAR_PUNCHING_TORSION_SEMANTICS_SEPARATE) {
    throw new Error("C5 must keep shear, punching, and torsion semantically separate");
  }
  if (EU_C5_CROSS_GENERATION_RULE_MIXING) throw new Error("C5 must not mix first- and second-generation rules");
}

export function assertEuC5NoGuessedParameters(): void {
  assertEuC5NoGuessedValues();
  if (EU_C5_UNPROVENANCED_NUMERICAL_CONSTANT_COUNT !== 0) {
    throw new Error("C5 must not introduce unprovenanced numerical constants");
  }
  if (
    EU_C5_IMPLEMENTED_RULE_IDS.length
    !== EU_C5_SHEAR_REQUIRED_RULE_IDS.length + EU_C5_PUNCHING_REQUIRED_RULE_IDS.length + EU_C5_T4_TORSION_RULE_IDS.length
    || EU_C5_IMPLEMENTED_METHOD_IDS.length !== 3
  ) {
    throw new Error("C5 implemented shear and punching methods drifted");
  }
  if (EU_C5_UNGOVERNED_TORSION_INTERACTION_USED || EU_C5_UNGOVERNED_COMBINED_ACTION_INTERACTION) {
    throw new Error("C5 must not invent ungoverned combined-action interaction");
  }
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM_MEMORY_ONLY rules are forbidden");
}

export function assertEuC5AiBoundary(): void {
  if (!AI_EU_C5_ASSISTANCE_ADVISORY_ONLY) throw new Error("AI C5 assistance must remain advisory only");
  if (LLM_EU_C5_NUMERICAL_AUTHORITY) throw new Error("LLM must not have C5 numerical authority");
  if (AI_EU_C5_RULE_PARAMETER_AUTHORITY || AI_EU_C5_NDP_AUTHORITY || AI_EU_C5_SOURCE_CONFLICT_AUTHORITY) {
    throw new Error("AI must not have C5 parameter, NDP, or source-conflict authority");
  }
  if (AI_EU_C5_CHECK_OVERRIDE_AUTHORITY || AI_EU_C5_CONFORMANCE_AUTHORITY || AI_EU_C5_ENGINEERING_APPROVAL) {
    throw new Error("AI must not override C5 checks, conformance, or engineering approval");
  }
  if (GENERATIVE_MODEL_CAN_BYPASS_EU_C5) throw new Error("generative models must not bypass C5");
}

export function assertEuC5FailClosed(): void {
  assertEuC5CopyrightAndAnnexBoundary();
  assertEuC5ArchitectureFreeze();
  assertEuC5NoGuessedParameters();
  assertEuC5AiBoundary();
  assertEuC5EvidenceLoaded();
}

export function assertEuC5OptimizerRejectsUndetermined(accepted: boolean): void {
  if (EU_C5_OPTIMIZATION_ACCEPTS_UNDETERMINED) throw new Error("C5 optimizer must not accept UNDETERMINED");
  if (accepted) throw new Error("C5 optimizer rejected: UNDETERMINED is not feasible");
}

export function assertEuC5ParetoRejectsUndetermined(acceptedAsFeasible: boolean): void {
  if (EU_C5_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE) throw new Error("C5 Pareto must not treat UNDETERMINED as feasible");
  if (acceptedAsFeasible) throw new Error("C5 Pareto rejected: UNDETERMINED is not feasible");
}
