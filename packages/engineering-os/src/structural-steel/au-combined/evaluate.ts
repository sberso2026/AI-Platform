import type {
  SteelCapacityEngineInput,
  SteelCapacityEngineOutput,
  SteelCombinedActionResult,
  SteelInteractionType,
} from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  BIAXIAL_LINEAR_INTERACTION_ASSUMED,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  COMPONENT_VECTOR_EQUALS_INTERACTION_CHECK,
  CONNECTION_INTERACTION_IMPLEMENTED,
  GENERIC_MATHEMATICS_EQUALS_CODE_INTERACTION,
  GLOBAL_STEEL_CORE_MODIFIED_FOR_AU_FORMULAS,
  LLM_INTERACTION_AUTHORITY,
  LLM_STEEL_CAPACITY_AUTHORITY,
  OPTIMIZATION_ACCEPTS_UNDETERMINED_AS_PASS,
  SECTION_CLASSIFICATION_STATE,
  SHEAR_REDUCTION_RULE_GUESSED,
  TORSIONAL_INTERACTION_IMPLEMENTED,
  UNIVERSAL_INTERACTION_EQUATION,
  UNIVERSAL_INTERACTION_EQUATION_HARDCODED,
  UNKNOWN_INTERACTION_RELATIONSHIP_GUESSED,
} from "@rtb/types";
import { assertAust300NotGlobal } from "../aust300";
import { assertEngineeringRuleAuthority } from "../au-tension/authority";
import { assertNotCertified } from "../au-tension/confirmation";
import { assertAuSteelStandardProfile } from "../au-tension/profile";
import { componentUtilizations } from "../mechanics/interaction";
import { assertSameCombination, detectRequiredInteractions, toAuCombinedContext } from "./detect";
import {
  AU_COMBINED_TOOL_REF,
  AU_INTERACTION_METHOD_REGISTRY,
} from "./registry";

function assertLlmBoundary(): void {
  if (LLM_STEEL_CAPACITY_AUTHORITY || LLM_INTERACTION_AUTHORITY) throw new Error("AI cannot invent interaction equation");
  if (AI_ENGINEERING_APPROVAL || CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL) {
    throw new Error("check result must not equal engineering approval");
  }
  if (GLOBAL_STEEL_CORE_MODIFIED_FOR_AU_FORMULAS) throw new Error("AU formulas must not live in the global steel core");
  if (UNIVERSAL_INTERACTION_EQUATION || UNIVERSAL_INTERACTION_EQUATION_HARDCODED || UNKNOWN_INTERACTION_RELATIONSHIP_GUESSED) {
    throw new Error("universal interaction equation is forbidden");
  }
  if (GENERIC_MATHEMATICS_EQUALS_CODE_INTERACTION || BIAXIAL_LINEAR_INTERACTION_ASSUMED || SHEAR_REDUCTION_RULE_GUESSED) {
    throw new Error("generic mathematics must not be labelled code interaction");
  }
  if (TORSIONAL_INTERACTION_IMPLEMENTED || CONNECTION_INTERACTION_IMPLEMENTED) {
    throw new Error("AU-5 must not implement torsion or connection interaction");
  }
  if (OPTIMIZATION_ACCEPTS_UNDETERMINED_AS_PASS) throw new Error("optimizer cannot accept undetermined interaction as pass");
  if (COMPONENT_VECTOR_EQUALS_INTERACTION_CHECK) throw new Error("component utilization vector must not equal interaction check");
}

function ruleFor(type: SteelInteractionType) {
  const methodId = `AU_INTERACTION_${type}`;
  const rule = AU_INTERACTION_METHOD_REGISTRY.find((item) => item.methodId === methodId);
  if (!rule) throw new Error("steel design fail closed: unknown interaction rule");
  return rule;
}

function undeterminedResult(
  input: SteelCapacityEngineInput,
  combinationRef: string,
  type: SteelInteractionType,
  ctxDemandRefs: string[],
  ctxCapacityRefs: string[],
): SteelCombinedActionResult {
  const rule = ruleFor(type);
  return {
    resultId: `${input.designContext.designContextId}:${type}`,
    memberRef: input.designContext.memberRef,
    combinationRef,
    interactionType: type,
    componentDemandRefs: ctxDemandRefs,
    componentCapacityRefs: ctxCapacityRefs,
    ruleRef: rule.ruleId,
    interactionValue: null,
    criterion: null,
    checkState: "CHECK_UNDETERMINED",
    reason: "INTERACTION_RULE_VALIDATION_REQUIRED",
    governingComponent: null,
    technicalBasisRef: rule.technicalBasisRef,
    standardProfileRef: input.standardContext.contextId,
    standardConformanceState: rule.standardConformanceState,
    validationState: rule.validationState,
    benchmarkState: "NOT_APPLICABLE",
    humanReviewState: "required",
    llmOriginated: false,
  };
}

export function evaluateAuSteelCombinedAction(input: SteelCapacityEngineInput): SteelCapacityEngineOutput {
  assertLlmBoundary();
  if (input.adapterId !== "AU_STEEL") throw new Error("steel design fail closed: unsupported jurisdiction adapter");
  if (input.limitState !== "COMBINED_ACTION") throw new Error("steel design fail closed: unsupported calculation scope");
  assertAuSteelStandardProfile(input.standardContext);
  if (!input.demand.resultId) throw new Error("steel design fail closed: demand missing");
  if (input.demand.capacityPresent) throw new Error("D1C demand must not contain capacity");
  if (!input.section.sectionFamily?.trim() || input.section.sectionFamily === "unknown") {
    throw new Error("steel design fail closed: unsupported section type");
  }
  if (input.section.catalogSource === "AUST300") assertAust300NotGlobal(input.section.jurisdictionApplicability);
  for (const rule of AU_INTERACTION_METHOD_REGISTRY) {
    assertEngineeringRuleAuthority(rule.authorityType);
    assertNotCertified(rule, input.designContext.validationState);
  }
  const combinationRef = assertSameCombination(input);
  const types = detectRequiredInteractions(input);
  toAuCombinedContext(input, types);
  const results = types.map((type) => {
    const demandRefs = [input.demand.resultId, ...((input.combined?.componentDemands ?? []).map((row) => row.resultId))];
    const capacityRefs = (input.combined?.componentCapacities ?? []).map((row) => row.capacityResultId);
    return undeterminedResult(input, combinationRef, type, [...new Set(demandRefs)], capacityRefs);
  });
  const vector = componentUtilizations(input, combinationRef);
  const governing = results[0] ?? null;
  return {
    adapterId: "AU_STEEL",
    maturity: "IMPLEMENTED",
    implemented: true,
    capacity: null,
    reason: "INTERACTION_RULE_VALIDATION_REQUIRED",
    sourceAuthority: {
      authorityType: "VALIDATED_INTERNAL_ENGINEERING_RULE",
      identifier: AU_COMBINED_TOOL_REF,
      clauseRef: null,
      edition: input.standardContext.edition,
      licensedMetadataOnly: true,
    },
    combinedResults: results,
    componentUtilizations: vector,
    interactionRequired: types.length > 0,
    governingMethodId: governing?.ruleRef ?? null,
    standardConformanceState: "INTENDED_PROFILE",
    implementationBindingState: "FRAMEWORK_ONLY",
    resultClass: "MECHANICS_REFERENCE",
    designCapacityState: "VALIDATION_REQUIRED",
    sectionClassificationState: SECTION_CLASSIFICATION_STATE,
    interactionReviewRequired: true,
  };
}
