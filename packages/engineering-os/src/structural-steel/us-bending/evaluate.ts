import type {
  SteelBendingCheckRecord,
  SteelCapacityEngineInput,
  SteelCapacityEngineOutput,
  SteelCheckVerdict,
  StructuralCapacityResult,
} from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  DIRECT_CONTRACT_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE,
  ELASTIC_BENDING_EQUALS_AISC_FLEXURAL_STRENGTH,
  ELASTIC_LTB_EQUALS_AISC_FLEXURAL_STRENGTH,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  LLM_US_BENDING_STRENGTH_AUTHORITY,
  MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_AISC_CHECK,
  PLASTIC_CAPACITY_ASSUMED_WITHOUT_CLASSIFICATION,
  SECTION_CLASSIFICATION_STATE,
  US_BENDING_ASD_FACTOR_SOURCE,
  US_BENDING_DEFLECTION_ENGINE_DUPLICATED,
  US_BENDING_LRFD_FACTOR_SOURCE,
  US_COMBINED_ACTION_IMPLEMENTED,
  US_CONNECTION_BENDING_DESIGN_IMPLEMENTED,
  US_MEMBER_BENDING_EQUALS_GLOBAL_FRAME_VALIDATION,
  US_SEISMIC_BENDING_DESIGN_IMPLEMENTED,
  US_SHEAR_DESIGN_IMPLEMENTED,
  US_TORSIONAL_DESIGN_IMPLEMENTED,
} from "@rtb/types";
import { toStandardContextRef } from "../../structural-domain/binding";
import { demandMomentNm, firstYieldMomentNm } from "../mechanics/bending";
import { toElasticModulusPa, toSecondMomentM4 } from "../mechanics/euler";
import {
  assertLoadHeightNotGuessed,
  consumeD1cDeflectionHandoff,
  elasticLtbMomentNm,
  ltbContextRequested,
  requireUnbracedLengthForLtb,
  toWarpingM6,
} from "../mechanics/ltb";
import { assertGovernedProperty } from "../properties";
import { assertAust300NotUsDefault, assertEuCatalogNotUsDefault } from "../us-standard/catalogs";
import {
  assertMechanicsNotAiscFlexuralStrength,
  assertNotCertifiedUsBending,
  assertPlasticCapacityNotAssumedWithoutClassification,
  assertUsBendingBoundaries,
  assertUsBendingLrfdAsdFactorIsolation,
  assertUsBendingRuleAuthority,
  rejectUnknownUsBendingCodeParameter,
  requestUsBendingAsdFactor,
  requestUsBendingLrfdFactor,
  requestUsLtbStrengthRule,
} from "./authority";
import { assertNoPlasticFromSectionModulusAlone, usBendingElementClassificationState } from "./classification";
import { assertAiscBendingEditionIsolation, createUsBendingContext } from "./context";
import {
  US_BENDING_ELASTIC_LTB_MECHANICS_RULE,
  US_BENDING_ELASTIC_MAJOR_MECHANICS_RULE,
  US_BENDING_ELASTIC_MINOR_MECHANICS_RULE,
  US_BENDING_IMPLEMENTATION_VERSION,
  US_BENDING_METHOD_REGISTRY,
  US_BENDING_TOOL_REF,
} from "./registry";

function assertLlmBoundary(): void {
  if (LLM_US_BENDING_STRENGTH_AUTHORITY) throw new Error("AI cannot originate US bending strength");
  if (AI_ENGINEERING_APPROVAL || CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL) {
    throw new Error("check result must not equal engineering approval");
  }
  if (ELASTIC_BENDING_EQUALS_AISC_FLEXURAL_STRENGTH || ELASTIC_LTB_EQUALS_AISC_FLEXURAL_STRENGTH) {
    throw new Error("elastic mechanics must not be labelled AISC flexural strength");
  }
  if (MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_AISC_CHECK) {
    throw new Error("mechanics-reference utilization must not be labelled as an AISC check");
  }
  if (US_MEMBER_BENDING_EQUALS_GLOBAL_FRAME_VALIDATION || GENERAL_FEA_CAPABILITY_CLAIMED) {
    throw new Error("member bending stability is not global frame stability");
  }
  if (US_BENDING_DEFLECTION_ENGINE_DUPLICATED) throw new Error("US bending must not duplicate the D1C deflection engine");
  if (US_COMBINED_ACTION_IMPLEMENTED || US_SHEAR_DESIGN_IMPLEMENTED || US_TORSIONAL_DESIGN_IMPLEMENTED) {
    throw new Error("US-4 must not claim shear, combined action, or torsional design");
  }
  if (US_SEISMIC_BENDING_DESIGN_IMPLEMENTED || US_CONNECTION_BENDING_DESIGN_IMPLEMENTED) {
    throw new Error("seismic and connection bending design must not be implemented in US-4");
  }
  if (PLASTIC_CAPACITY_ASSUMED_WITHOUT_CLASSIFICATION) {
    throw new Error("plastic capacity must not be assumed without classification");
  }
}

function assertBendingDemand(input: SteelCapacityEngineInput): number {
  if (!input.demand.resultId) throw new Error("steel design fail closed: demand missing");
  if (input.demand.capacityPresent) throw new Error("D1C demand must not contain capacity");
  const moment = input.demand.moment;
  if (!moment || !moment.unit?.trim() || !Number.isFinite(moment.value)) {
    throw new Error("steel design fail closed: demand missing");
  }
  return demandMomentNm(moment);
}

function capacityIdentity(input: SteelCapacityEngineInput, methodId: string, valueNm: number): StructuralCapacityResult {
  return {
    objectId: `${input.designContext.designContextId}:${methodId}`,
    objectType: "CAPACITY_RESULT",
    structuralSystemId: input.designContext.memberRef,
    projectId: "not-persisted",
    assetId: null,
    tenantId: "not-persisted",
    workspaceId: "not-persisted",
    externalReference: null,
    sourceSystem: US_BENDING_TOOL_REF,
    sourceObjectId: input.designContext.designContextId,
    revision: US_BENDING_IMPLEMENTATION_VERSION,
    status: "DEFINED",
    provenance: {
      ...input.designContext.provenanceRef,
      tool: US_BENDING_TOOL_REF,
      version: US_BENDING_IMPLEMENTATION_VERSION,
      calculationMethod: methodId,
      standard: input.standardContext.standardCode,
      validationState: "BENCHMARKED",
      approvalState: "not_approved",
    },
    capacityResultId: `${input.designContext.designContextId}:${methodId}`,
    objectRef: input.designContext.memberRef,
    capacityType: "MECHANICS_REFERENCE",
    value: valueNm,
    units: "N.m",
    standardContextRef: toStandardContextRef(input.standardContext),
    toolRef: US_BENDING_TOOL_REF,
    methodRef: methodId,
    validationState: "BENCHMARKED",
    llmOriginated: false,
  };
}

function elasticCheck(
  input: SteelCapacityEngineInput,
  axis: "MAJOR_AXIS" | "MINOR_AXIS",
  valueNm: number,
): SteelBendingCheckRecord {
  const rule = axis === "MINOR_AXIS" ? US_BENDING_ELASTIC_MINOR_MECHANICS_RULE : US_BENDING_ELASTIC_MAJOR_MECHANICS_RULE;
  return {
    methodId: rule.methodId,
    methodType: "ELASTIC_BENDING_REFERENCE",
    engineeringRuleRef: rule.ruleId,
    capacityType: rule.outputType,
    resultClass: "MECHANICS_REFERENCE",
    axis,
    capacityValueNm: valueNm,
    units: "N.m",
    technicalBasisRef: rule.technicalBasisRef,
    standardProfileRef: input.standardContext.contextId,
    validationState: rule.validationState,
    standardConformanceState: rule.standardConformanceState,
    unbracedLengthM: null,
  };
}

export function evaluateUsSteelBending(input: SteelCapacityEngineInput): SteelCapacityEngineOutput {
  assertLlmBoundary();
  assertUsBendingBoundaries();
  if (input.adapterId !== "US_STEEL") throw new Error("steel design fail closed: unsupported jurisdiction adapter");
  if (input.limitState !== "BENDING_MAJOR" && input.limitState !== "BENDING_MINOR") {
    throw new Error("steel design fail closed: unsupported calculation scope");
  }
  assertBendingDemand(input);
  consumeD1cDeflectionHandoff(input.demand);
  if (!input.section.sectionFamily?.trim() || input.section.sectionFamily === "unknown") {
    throw new Error("steel design fail closed: unsupported section type");
  }
  assertAust300NotUsDefault(input.section.catalogSource);
  assertEuCatalogNotUsDefault(input.section.catalogSource);
  assertNotCertifiedUsBending(input.designContext.validationState);
  assertPlasticCapacityNotAssumedWithoutClassification();
  assertNoPlasticFromSectionModulusAlone();
  const bendingContext = createUsBendingContext(input);
  if (DIRECT_CONTRACT_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE && bendingContext.directContractProfile) {
    throw new Error("direct-contract AISC profile is not building-code compliance");
  }
  void usBendingElementClassificationState();
  for (const rule of US_BENDING_METHOD_REGISTRY) {
    assertUsBendingRuleAuthority(rule.authorityType);
    if (rule.methodType === "ELASTIC_BENDING_REFERENCE" || rule.methodType === "ELASTIC_LTB_REFERENCE" || rule.methodType === "ENGINEERING_MECHANICS_REFERENCE") {
      assertMechanicsNotAiscFlexuralStrength(rule);
    }
    assertAiscBendingEditionIsolation(rule.aiscEditionRequirement, input.standardContext.edition);
  }

  const fy = assertGovernedProperty(input.material.yieldStrength, "material.yieldStrength");
  const z = bendingContext.bendingAxis === "MINOR_AXIS"
    ? assertGovernedProperty(input.section.sectionModulusZz, "section.sectionModulusZz")
    : assertGovernedProperty(input.section.sectionModulusYy, "section.sectionModulusYy");
  const zLabel = bendingContext.bendingAxis === "MINOR_AXIS" ? "section.sectionModulusZz" : "section.sectionModulusYy";
  const myNm = firstYieldMomentNm(fy, z, "material.yieldStrength", zLabel);
  const checks: SteelBendingCheckRecord[] = [elasticCheck(input, bendingContext.bendingAxis, myNm)];

  if (ltbContextRequested(input, bendingContext.bendingAxis)) {
    assertLoadHeightNotGuessed(input.stability);
    const lu = requireUnbracedLengthForLtb(input.stability);
    const e = assertGovernedProperty(input.material.elasticModulus, "material.elasticModulus");
    const g = assertGovernedProperty(input.material.shearModulus, "material.shearModulus");
    const izz = assertGovernedProperty(input.section.Izz, "section.Izz");
    const j = assertGovernedProperty(input.section.torsionConstant, "section.torsionConstant");
    const iw = assertGovernedProperty(input.section.warpingConstant, "section.warpingConstant");
    const mcrNm = elasticLtbMomentNm({
      EPa: toElasticModulusPa(e, "material.elasticModulus"),
      GPa: toElasticModulusPa(g, "material.shearModulus"),
      IminorM4: toSecondMomentM4(izz, "section.Izz"),
      JM4: toSecondMomentM4(j, "section.torsionConstant"),
      IwM6: toWarpingM6(iw, "section.warpingConstant"),
      unbracedLengthM: lu,
    });
    checks.push({
      methodId: US_BENDING_ELASTIC_LTB_MECHANICS_RULE.methodId,
      methodType: "ELASTIC_LTB_REFERENCE",
      engineeringRuleRef: US_BENDING_ELASTIC_LTB_MECHANICS_RULE.ruleId,
      capacityType: US_BENDING_ELASTIC_LTB_MECHANICS_RULE.outputType,
      resultClass: "MECHANICS_REFERENCE",
      axis: "MAJOR_AXIS",
      capacityValueNm: mcrNm,
      units: "N.m",
      technicalBasisRef: US_BENDING_ELASTIC_LTB_MECHANICS_RULE.technicalBasisRef,
      standardProfileRef: bendingContext.standardContextRef,
      validationState: US_BENDING_ELASTIC_LTB_MECHANICS_RULE.validationState,
      standardConformanceState: US_BENDING_ELASTIC_LTB_MECHANICS_RULE.standardConformanceState,
      unbracedLengthM: lu,
    });
  }

  const governing = checks.reduce((lowest, row) => (row.capacityValueNm < lowest.capacityValueNm ? row : lowest));
  const ltbEvaluated = checks.some((row) => row.methodType === "ELASTIC_LTB_REFERENCE");
  return {
    adapterId: "US_STEEL",
    maturity: "BENCHMARKED",
    implemented: true,
    capacity: capacityIdentity(input, governing.methodId, governing.capacityValueNm),
    reason: ltbEvaluated
      ? `US bending mechanics-reference first-yield and uniform-moment elastic LTB; intended AISC 360 profile; ${bendingContext.designMethod}; elastic LTB is not AISC Mn; classification, local buckling, Lp/Lr, Cb, and φb/Ωb FRAMEWORK_ONLY`
      : `US bending mechanics-reference first-yield PARTIAL; LTB not evaluated; intended AISC 360 profile; ${bendingContext.designMethod}; not labelled as AISC flexural strength`,
    sourceAuthority: {
      authorityType: "VALIDATED_INTERNAL_ENGINEERING_RULE",
      identifier: governing.engineeringRuleRef,
      clauseRef: null,
      edition: input.standardContext.edition,
      licensedMetadataOnly: true,
    },
    bendingChecks: checks,
    governingMethodId: governing.methodId,
    standardConformanceState: "INTENDED_PROFILE",
    implementationBindingState: "IMPLEMENTED_UNVERIFIED_STANDARD_BINDING",
    resultClass: "MECHANICS_REFERENCE",
    designCapacityState: "VALIDATION_REQUIRED",
    sectionClassificationState: SECTION_CLASSIFICATION_STATE,
  };
}

export function evaluateUsSteelBendingCodeProfile(input: SteelCapacityEngineInput): never {
  const context = createUsBendingContext(input);
  void US_BENDING_LRFD_FACTOR_SOURCE;
  void US_BENDING_ASD_FACTOR_SOURCE;
  if (context.designMethod === "LRFD") {
    assertUsBendingLrfdAsdFactorIsolation("LRFD", "phi_b");
    requestUsLtbStrengthRule();
    return requestUsBendingLrfdFactor();
  }
  if (context.designMethod === "ASD") {
    assertUsBendingLrfdAsdFactorIsolation("ASD", "Omega_b");
    requestUsLtbStrengthRule();
    return requestUsBendingAsdFactor();
  }
  return rejectUnknownUsBendingCodeParameter("designMethod");
}

export function usBendingCodeProfileCheckState(input: SteelCapacityEngineInput): SteelCheckVerdict {
  try {
    evaluateUsSteelBendingCodeProfile(input);
  } catch {
    return "CHECK_UNDETERMINED";
  }
  return "CHECK_UNDETERMINED";
}
