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
  CONNECTION_INTERACTION_IMPLEMENTED,
  EU_COMBINED_PILOT_EXPOSURE,
  EU_SHEAR_REDUCTION_RULE_GUESSED,
  LLM_EU_INTERACTION_AUTHORITY,
  MEMBER_INTERACTION_EQUALS_GLOBAL_FRAME_STABILITY,
  PARALLEL_INTERACTION_FRAMEWORK_CREATED,
  SECTION_CLASSIFICATION_STATE,
  TORSIONAL_INTERACTION_IMPLEMENTED,
  UNIVERSAL_AXIAL_BIAXIAL_EQUATION,
  UNIVERSAL_INTERACTION_EQUATION,
  UNIVERSAL_INTERACTION_EQUATION_HARDCODED,
  UNKNOWN_INTERACTION_RELATIONSHIP_GUESSED,
} from "@rtb/types";
import { assertAnnexCompatibleWithContext, resolveNdp } from "../eu-standard/annex";
import { denyNationalAnnexFromUserLocation } from "../eu-standard/authority";
import { assertAust300NotEuDefault } from "../eu-standard/catalogs";
import {
  assertMechanicsNotPromotedToCodeInteraction,
  assertRevisionCompatibility,
  assertSameCombination,
  componentAuthorityState,
  componentUtilizations,
  detectRequiredInteractions,
  mechanicsReferenceValidForCodeInteraction,
} from "../mechanics/interaction";
import {
  assertEuInteractionApplicability,
  assertEuInteractionRuleAuthority,
  assertNoUniversalInteractionEquation,
  assertNotCertifiedEuInteraction,
  rejectUnknownEuInteractionParameter,
} from "./authority";
import { createEuCombinedActionContext } from "./context";
import {
  EU_COMBINED_TOOL_REF,
  EU_INTERACTION_METHOD_REGISTRY,
  EU_INTERACTION_TENSION_BENDING_RULE,
} from "./registry";

function assertLlmBoundary(): void {
  if (LLM_EU_INTERACTION_AUTHORITY) throw new Error("AI cannot invent interaction equation");
  if (EU_COMBINED_PILOT_EXPOSURE) throw new Error("unfinished EU interaction must not be exposed to Profile A");
  if (AI_ENGINEERING_APPROVAL || CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL) {
    throw new Error("check result must not equal engineering approval");
  }
  if (PARALLEL_INTERACTION_FRAMEWORK_CREATED) throw new Error("a parallel interaction framework must not be created");
  if (UNIVERSAL_INTERACTION_EQUATION || UNIVERSAL_INTERACTION_EQUATION_HARDCODED || UNKNOWN_INTERACTION_RELATIONSHIP_GUESSED || UNIVERSAL_AXIAL_BIAXIAL_EQUATION) {
    throw new Error("universal interaction equation is forbidden");
  }
  if (BIAXIAL_LINEAR_INTERACTION_ASSUMED || EU_SHEAR_REDUCTION_RULE_GUESSED) {
    throw new Error("generic mathematics must not be labelled code interaction");
  }
  if (TORSIONAL_INTERACTION_IMPLEMENTED || CONNECTION_INTERACTION_IMPLEMENTED) {
    throw new Error("EU-6 must not implement torsion or connection interaction");
  }
  if (MEMBER_INTERACTION_EQUALS_GLOBAL_FRAME_STABILITY) {
    throw new Error("member interaction is not global frame stability");
  }
  if (COMPONENT_VECTOR_EQUALS_INTERACTION_CHECK) throw new Error("component utilization vector must not equal interaction check");
}

function ruleFor(type: SteelInteractionType) {
  const methodId = `EU_INTERACTION_${type}`;
  const rule = EU_INTERACTION_METHOD_REGISTRY.find((item) => item.methodId === methodId);
  if (!rule) throw new Error("steel design fail closed: unknown interaction rule");
  return rule;
}

function undeterminedReason(
  input: SteelCapacityEngineInput,
  type: SteelInteractionType,
): SteelCombinedActionResult["reason"] {
  const rule = ruleFor(type);
  if (rule.stabilityDependency === "REQUIRED" && !input.stability && !input.designContext.stabilityContextRef) {
    return "MISSING_STABILITY";
  }
  if (rule.classificationDependency === "REQUIRED" && SECTION_CLASSIFICATION_STATE === "VALIDATION_REQUIRED") {
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
): SteelCombinedActionResult {
  const rule = ruleFor(type);
  const capacities = input.combined?.componentCapacities ?? [];
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
    standardPartRefs: rule.standardPartRefs,
    edition: input.standardContext.edition,
    nationalAnnexRef: input.eurocodeContext?.nationalAnnex?.nationalAnnexId ?? input.standardContext.nationalAnnexRef?.annexId ?? null,
    ndpSetRef: input.eurocodeContext?.nationalAnnex?.nationalParameterSetRef ?? null,
    standardConformanceState: rule.standardConformanceState,
    validationState: rule.validationState,
    benchmarkState: "NOT_APPLICABLE",
    humanReviewState: "required",
    llmOriginated: false,
  };
}

export function evaluateEuSteelCombinedAction(input: SteelCapacityEngineInput): SteelCapacityEngineOutput {
  assertLlmBoundary();
  assertNoUniversalInteractionEquation();
  if (input.adapterId !== "EU_STEEL") throw new Error("steel design fail closed: unsupported jurisdiction adapter");
  if (input.limitState !== "COMBINED_ACTION") throw new Error("steel design fail closed: unsupported calculation scope");
  denyNationalAnnexFromUserLocation("explicit");
  if (!input.demand.resultId) throw new Error("steel design fail closed: demand missing");
  if (input.demand.capacityPresent) throw new Error("D1C demand must not contain capacity");
  if (!input.section.sectionFamily?.trim() || input.section.sectionFamily === "unknown") {
    throw new Error("steel design fail closed: unsupported section type");
  }
  assertAust300NotEuDefault(input.section.catalogSource);
  assertNotCertifiedEuInteraction(input.designContext.validationState);
  if (input.eurocodeContext?.nationalAnnex) {
    assertAnnexCompatibleWithContext(input.eurocodeContext, input.eurocodeContext.nationalAnnex);
  }
  for (const rule of EU_INTERACTION_METHOD_REGISTRY) {
    assertEuInteractionRuleAuthority(rule.authorityType);
    assertEuInteractionApplicability(rule);
  }
  const combinationRef = assertSameCombination(input);
  assertRevisionCompatibility(input);
  const capacities = input.combined?.componentCapacities ?? [];
  assertMechanicsNotPromotedToCodeInteraction(capacities);
  const types = detectRequiredInteractions(input);
  createEuCombinedActionContext(input, types);
  const demandRefs = [input.demand.resultId, ...((input.combined?.componentDemands ?? []).map((row) => row.resultId))];
  const capacityRefs = capacities.map((row) => row.capacityResultId);
  const results = types.map((type) => undeterminedResult(input, combinationRef, type, [...new Set(demandRefs)], capacityRefs));
  const vector = componentUtilizations(input, combinationRef);
  const governing = results[0] ?? null;
  return {
    adapterId: "EU_STEEL",
    maturity: "IMPLEMENTED",
    implemented: true,
    capacity: null,
    reason: "INTERACTION_RULE_VALIDATION_REQUIRED",
    sourceAuthority: {
      authorityType: "VALIDATED_INTERNAL_ENGINEERING_RULE",
      identifier: EU_COMBINED_TOOL_REF,
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

export function evaluateEuSteelCombinedActionCodeProfile(input: SteelCapacityEngineInput): never {
  const rule = EU_INTERACTION_TENSION_BENDING_RULE;
  const annex = input.eurocodeContext?.nationalAnnex ?? null;
  const resolved = resolveNdp({
    ruleRequiresNdp: rule.ruleRequiresNdp,
    annex,
    ndpSet: input.eurocodeContext?.ndpSet ?? [],
    parameterId: rule.ndpDependencies[0] ?? "partial-factor",
  });
  if (resolved.kind === "FAIL_CLOSED") {
    throw new Error(`steel design fail closed: ${resolved.reason}`);
  }
  return rejectUnknownEuInteractionParameter("partial-factor");
}

export function euCombinedCodeProfileCheckState(input: SteelCapacityEngineInput): SteelCheckVerdict {
  try {
    evaluateEuSteelCombinedActionCodeProfile(input);
  } catch {
    return "CHECK_UNDETERMINED";
  }
  return "CHECK_UNDETERMINED";
}
