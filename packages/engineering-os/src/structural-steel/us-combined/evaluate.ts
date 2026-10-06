import type {
  SteelCapacityEngineInput,
  SteelCapacityEngineOutput,
  SteelCheckVerdict,
  SteelCombinedActionResult,
  SteelInteractionType,
} from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  BIAXIAL_LINEAR_INTERACTION_ASSUMED,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  COMPONENT_VECTOR_EQUALS_INTERACTION_CHECK,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  LLM_US_INTERACTION_AUTHORITY,
  MECHANICS_REFERENCE_AUTOMATICALLY_VALID_FOR_AISC_INTERACTION,
  MIXED_LRFD_ASD_COMPONENTS_ALLOWED,
  PARALLEL_US_INTERACTION_FRAMEWORK_CREATED,
  UNIVERSAL_AXIAL_BIAXIAL_EQUATION,
  UNIVERSAL_INTERACTION_EQUATION,
  UNIVERSAL_US_INTERACTION_EQUATION,
  UNKNOWN_US_INTERACTION_RELATIONSHIP_GUESSED,
  US_BENDING_SHEAR_REDUCTION_RULE_GUESSED,
  US_CONNECTION_INTERACTION_IMPLEMENTED,
  US_MEMBER_INTERACTION_EQUALS_GLOBAL_FRAME_VALIDATION,
  US_SEISMIC_INTERACTION_IMPLEMENTED,
  US_SYNTHETIC_INTERACTION_UTILIZATION,
  US_TORSIONAL_INTERACTION_IMPLEMENTED,
} from "@rtb/types";
import {
  assertRevisionCompatibility,
  assertSameCombination,
  componentAuthorityState,
  componentUtilizations,
  detectRequiredInteractions,
  mechanicsReferenceValidForCodeInteraction,
} from "../mechanics/interaction";
import { assertAust300NotUsDefault, assertEuCatalogNotUsDefault } from "../us-standard/catalogs";
import {
  assertNotCertifiedUsInteraction,
  assertUsInteractionApplicability,
  assertUsInteractionLrfdAsdRuleIsolation,
  assertUsInteractionRuleAuthority,
  assertUsMechanicsNotPromotedToAiscInteraction,
  assertUsMixedLrfdAsdComponents,
  assertUsNoUniversalInteractionEquation,
  rejectUnknownUsInteractionParameter,
  requestUsInteractionAsdFactor,
  requestUsInteractionLrfdFactor,
} from "./authority";
import { usInteractionElementClassificationState } from "./classification";
import { assertAiscInteractionEditionIsolation, assertUsStabilityMethodNotMixed, createUsCombinedActionContext } from "./context";
import {
  US_COMBINED_TOOL_REF,
  US_INTERACTION_METHOD_REGISTRY,
  US_INTERACTION_TENSION_BENDING_RULE,
} from "./registry";

function assertLlmBoundary(): void {
  if (LLM_US_INTERACTION_AUTHORITY) throw new Error("AI cannot invent interaction equation");
  if (AI_ENGINEERING_APPROVAL || CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL) {
    throw new Error("check result must not equal engineering approval");
  }
  if (PARALLEL_US_INTERACTION_FRAMEWORK_CREATED) throw new Error("a parallel US interaction framework must not be created");
  if (UNIVERSAL_US_INTERACTION_EQUATION || UNIVERSAL_INTERACTION_EQUATION || UNIVERSAL_AXIAL_BIAXIAL_EQUATION || UNKNOWN_US_INTERACTION_RELATIONSHIP_GUESSED) {
    throw new Error("universal interaction equation is forbidden");
  }
  if (BIAXIAL_LINEAR_INTERACTION_ASSUMED || US_BENDING_SHEAR_REDUCTION_RULE_GUESSED || US_SYNTHETIC_INTERACTION_UTILIZATION) {
    throw new Error("generic mathematics must not be labelled AISC interaction");
  }
  if (US_TORSIONAL_INTERACTION_IMPLEMENTED || US_CONNECTION_INTERACTION_IMPLEMENTED || US_SEISMIC_INTERACTION_IMPLEMENTED) {
    throw new Error("US-6 must not implement torsion, connection, or seismic interaction");
  }
  if (US_MEMBER_INTERACTION_EQUALS_GLOBAL_FRAME_VALIDATION || GENERAL_FEA_CAPABILITY_CLAIMED) {
    throw new Error("member interaction is not global frame stability");
  }
  if (COMPONENT_VECTOR_EQUALS_INTERACTION_CHECK) throw new Error("component utilization vector must not equal interaction check");
  if (MIXED_LRFD_ASD_COMPONENTS_ALLOWED) throw new Error("mixed LRFD/ASD components must not be allowed");
  if (MECHANICS_REFERENCE_AUTOMATICALLY_VALID_FOR_AISC_INTERACTION) {
    throw new Error("mechanics-reference capacity must not be treated as AISC interaction resistance");
  }
}

function ruleFor(type: SteelInteractionType) {
  const methodId = `US_INTERACTION_${type}`;
  const rule = US_INTERACTION_METHOD_REGISTRY.find((item) => item.methodId === methodId);
  if (!rule) throw new Error("steel design fail closed: unknown interaction rule");
  return rule;
}

function undeterminedReason(
  input: SteelCapacityEngineInput,
  type: SteelInteractionType,
): SteelCombinedActionResult["reason"] {
  const rule = ruleFor(type);
  if (input.usSteelContext?.localAmendmentSetRef === "UNKNOWN_REQUIRED") {
    return "LOCAL_AMENDMENT_UNRESOLVED";
  }
  if (rule.stabilityMethodDependencies[0] !== "NONE") {
    const method = input.usStabilityContext?.method;
    if (!input.stability && !input.designContext.stabilityContextRef) return "MISSING_STABILITY";
    if (!method || method === "UNKNOWN") return "MISSING_STABILITY";
    if (input.usStabilityContext?.mixedMethods) return "STABILITY_METHOD_CONFLICT";
  }
  if (rule.ltbDependencies === "REQUIRED") {
    const unbraced = input.stability?.unbracedLengthM;
    if (unbraced == null) return "MISSING_LTB";
  }
  if (rule.classificationDependencies === "REQUIRED" && usInteractionElementClassificationState() === "VALIDATION_REQUIRED") {
    return "MISSING_CLASSIFICATION";
  }
  const capacities = input.combined?.componentCapacities ?? [];
  if (capacities.length > 0 && !mechanicsReferenceValidForCodeInteraction(capacities)) {
    return "INSUFFICIENT_COMPONENT_AUTHORITY";
  }
  return "INTERACTION_RULE_VALIDATION_REQUIRED";
}

function undeterminedResult(
  input: SteelCapacityEngineInput,
  combinationRef: string,
  type: SteelInteractionType,
  ctxDemandRefs: string[],
  ctxCapacityRefs: string[],
  designMethod: "LRFD" | "ASD",
): SteelCombinedActionResult {
  const rule = ruleFor(type);
  const capacities = input.combined?.componentCapacities ?? [];
  const us = input.usSteelContext;
  return {
    resultId: `${input.designContext.designContextId}:${type}`,
    memberRef: input.designContext.memberRef,
    combinationRef,
    interactionType: type,
    componentDemandRefs: ctxDemandRefs,
    componentCapacityRefs: ctxCapacityRefs,
    componentAuthorityStates: capacities.map(componentAuthorityState),
    ruleRef: rule.ruleId,
    interactionValue: null,
    criterion: null,
    checkState: "CHECK_UNDETERMINED",
    reason: undeterminedReason(input, type),
    governingComponent: null,
    technicalBasisRef: rule.technicalBasisRef,
    standardProfileRef: input.standardContext.contextId,
    edition: input.standardContext.edition,
    designMethod,
    unitSystem: us?.unitSystem,
    stabilityMethodRef: input.usStabilityContext?.method ?? null,
    classificationRefs: [usInteractionElementClassificationState()],
    localBucklingRefs: ["VALIDATION_REQUIRED"],
    ltbContextRefs: input.stability?.unbracedLengthProvenanceRef ? [input.stability.unbracedLengthProvenanceRef] : [],
    buildingCodeContextRef: us?.directContractProfile ? null : (us?.buildingCodeAdoptionRef ?? us?.buildingCodeAdoption?.adoptionId ?? null),
    loadStandardContextRef: us?.loadStandard?.standardId ?? null,
    localAmendmentSetRef: us?.localAmendmentSetRef ?? null,
    directContractProfile: us?.directContractProfile ?? false,
    standardConformanceState: rule.standardConformanceState,
    validationState: rule.validationState,
    benchmarkState: "NOT_APPLICABLE",
    humanReviewState: "required",
    llmOriginated: false,
  };
}

export function evaluateUsSteelCombinedAction(input: SteelCapacityEngineInput): SteelCapacityEngineOutput {
  assertLlmBoundary();
  assertUsNoUniversalInteractionEquation();
  if (input.adapterId !== "US_STEEL") throw new Error("steel design fail closed: unsupported jurisdiction adapter");
  if (input.limitState !== "COMBINED_ACTION") throw new Error("steel design fail closed: unsupported calculation scope");
  if (!input.demand.resultId) throw new Error("steel design fail closed: demand missing");
  if (input.demand.capacityPresent) throw new Error("D1C demand must not contain capacity");
  if (!input.section.sectionFamily?.trim() || input.section.sectionFamily === "unknown") {
    throw new Error("steel design fail closed: unsupported section type");
  }
  assertAust300NotUsDefault(input.section.catalogSource);
  assertEuCatalogNotUsDefault(input.section.catalogSource);
  assertNotCertifiedUsInteraction(input.designContext.validationState);
  for (const rule of US_INTERACTION_METHOD_REGISTRY) {
    assertUsInteractionRuleAuthority(rule.authorityType);
    assertUsInteractionApplicability(rule);
    assertAiscInteractionEditionIsolation(rule.aiscEditionRequirement, input.standardContext.edition);
  }
  const combinationRef = assertSameCombination(input);
  assertRevisionCompatibility(input);
  assertUsStabilityMethodNotMixed(input);
  const ctx = createUsCombinedActionContext(input, detectRequiredInteractions(input));
  const capacities = input.combined?.componentCapacities ?? [];
  assertUsMixedLrfdAsdComponents(ctx.designMethod, capacities);
  assertUsMechanicsNotPromotedToAiscInteraction(capacities);
  const types = detectRequiredInteractions(input);
  const demandRefs = [input.demand.resultId, ...((input.combined?.componentDemands ?? []).map((row) => row.resultId))];
  const capacityRefs = capacities.map((row) => row.capacityResultId);
  const results = types.map((type) => undeterminedResult(input, combinationRef, type, [...new Set(demandRefs)], capacityRefs, ctx.designMethod));
  const vector = componentUtilizations(input, combinationRef);
  if (US_SYNTHETIC_INTERACTION_UTILIZATION) {
    throw new Error("synthetic interaction utilization is forbidden");
  }
  const governing = results[0] ?? null;
  return {
    adapterId: "US_STEEL",
    maturity: "IMPLEMENTED",
    implemented: true,
    capacity: null,
    reason: "INTERACTION_RULE_VALIDATION_REQUIRED",
    sourceAuthority: {
      authorityType: "VALIDATED_INTERNAL_ENGINEERING_RULE",
      identifier: US_COMBINED_TOOL_REF,
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
    interactionReviewRequired: true,
  };
}

export function evaluateUsSteelCombinedActionCodeProfile(input: SteelCapacityEngineInput): never {
  const us = input.usSteelContext;
  if (!us?.designMethod) throw new Error("steel design fail closed: DESIGN_METHOD_REQUIRED");
  assertUsInteractionLrfdAsdRuleIsolation(us.designMethod, us.designMethod === "LRFD" ? "phi" : "Omega");
  if (us.designMethod === "LRFD") return requestUsInteractionLrfdFactor();
  if (us.designMethod === "ASD") return requestUsInteractionAsdFactor();
  return rejectUnknownUsInteractionParameter(US_INTERACTION_TENSION_BENDING_RULE.methodId);
}

export function usCombinedCodeProfileCheckState(input: SteelCapacityEngineInput): SteelCheckVerdict {
  try {
    evaluateUsSteelCombinedActionCodeProfile(input);
  } catch {
    return "CHECK_UNDETERMINED";
  }
  return "CHECK_UNDETERMINED";
}
