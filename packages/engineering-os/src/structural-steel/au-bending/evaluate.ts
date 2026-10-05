import type {
  SteelBendingCheckRecord,
  SteelCapacityEngineInput,
  SteelCapacityEngineOutput,
  StructuralCapacityResult,
} from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  ELASTIC_LTB_EQUALS_CODE_MEMBER_CAPACITY,
  GLOBAL_STEEL_CORE_MODIFIED_FOR_AU_FORMULAS,
  LLM_BENDING_CAPACITY_AUTHORITY,
  LLM_STEEL_CAPACITY_AUTHORITY,
  MECHANICS_REFERENCE_EQUALS_CODE_CAPACITY,
  SECTION_CLASSIFICATION_STATE,
  SILENT_MOMENT_MODIFICATION_FACTOR,
} from "@rtb/types";
import { toStandardContextRef } from "../../structural-domain/binding";
import { assertAust300NotGlobal } from "../aust300";
import { assertGovernedProperty } from "../properties";
import { assertEngineeringRuleAuthority } from "../au-tension/authority";
import { assertNotCertified } from "../au-tension/confirmation";
import { assertAuSteelStandardProfile } from "../au-tension/profile";
import { auBendingSectionClassificationState } from "./classification";
import {
  assertLoadHeightNotGuessed,
  bendingAxisFromLimitState,
  ltbContextRequested,
  requireUnbracedLengthForLtb,
  toAuBendingContext,
} from "./context";
import {
  AU_BENDING_ELASTIC_LTB_RULE,
  AU_BENDING_ELASTIC_MAJOR_RULE,
  AU_BENDING_ELASTIC_MINOR_RULE,
  AU_BENDING_IMPLEMENTATION_VERSION,
  AU_BENDING_METHOD_REGISTRY,
  AU_BENDING_TOOL_REF,
} from "./registry";
import { demandMomentNm, elasticLtbMomentNm, firstYieldMomentNm, toElasticModulusPa, toSecondMomentM4, toWarpingM6 } from "./units";

function assertLlmBoundary(): void {
  if (LLM_STEEL_CAPACITY_AUTHORITY || LLM_BENDING_CAPACITY_AUTHORITY) throw new Error("AI cannot originate capacity");
  if (AI_ENGINEERING_APPROVAL || CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL) {
    throw new Error("check result must not equal engineering approval");
  }
  if (GLOBAL_STEEL_CORE_MODIFIED_FOR_AU_FORMULAS) throw new Error("AU formulas must not live in the global steel core");
  if (ELASTIC_LTB_EQUALS_CODE_MEMBER_CAPACITY || MECHANICS_REFERENCE_EQUALS_CODE_CAPACITY) {
    throw new Error("mechanics-reference result must not be labelled code capacity");
  }
  if (SILENT_MOMENT_MODIFICATION_FACTOR) throw new Error("moment modification factor must not be applied silently");
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
    sourceSystem: AU_BENDING_TOOL_REF,
    sourceObjectId: input.designContext.designContextId,
    revision: AU_BENDING_IMPLEMENTATION_VERSION,
    status: "DEFINED",
    provenance: {
      ...input.designContext.provenanceRef,
      tool: AU_BENDING_TOOL_REF,
      version: AU_BENDING_IMPLEMENTATION_VERSION,
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
    toolRef: AU_BENDING_TOOL_REF,
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
  const rule = axis === "MINOR_AXIS" ? AU_BENDING_ELASTIC_MINOR_RULE : AU_BENDING_ELASTIC_MAJOR_RULE;
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

export function evaluateAuSteelBending(input: SteelCapacityEngineInput): SteelCapacityEngineOutput {
  assertLlmBoundary();
  if (input.adapterId !== "AU_STEEL") throw new Error("steel design fail closed: unsupported jurisdiction adapter");
  if (input.limitState !== "BENDING_MAJOR" && input.limitState !== "BENDING_MINOR") {
    throw new Error("steel design fail closed: unsupported calculation scope");
  }
  assertAuSteelStandardProfile(input.standardContext);
  assertBendingDemand(input);
  if (!input.section.sectionFamily?.trim() || input.section.sectionFamily === "unknown") {
    throw new Error("steel design fail closed: unsupported section type");
  }
  if (input.section.catalogSource === "AUST300") assertAust300NotGlobal(input.section.jurisdictionApplicability);
  if (input.material.thicknessDependentMetadata && !input.material.yieldStrength?.provenanceRef) {
    throw new Error("steel design fail closed: missing material.yieldStrength");
  }
  for (const rule of AU_BENDING_METHOD_REGISTRY) {
    assertEngineeringRuleAuthority(rule.authorityType);
    assertNotCertified(rule, input.designContext.validationState);
  }

  const ctx = toAuBendingContext(input);
  const fy = assertGovernedProperty(input.material.yieldStrength, "material.yieldStrength");
  const z = ctx.bendingAxis === "MINOR_AXIS"
    ? assertGovernedProperty(input.section.sectionModulusZz, "section.sectionModulusZz")
    : assertGovernedProperty(input.section.sectionModulusYy, "section.sectionModulusYy");
  const zLabel = ctx.bendingAxis === "MINOR_AXIS" ? "section.sectionModulusZz" : "section.sectionModulusYy";
  const myNm = firstYieldMomentNm(fy, z, "material.yieldStrength", zLabel);
  const checks: SteelBendingCheckRecord[] = [elasticCheck(input, ctx.bendingAxis, myNm)];

  if (ltbContextRequested(input, ctx.bendingAxis)) {
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
      methodId: AU_BENDING_ELASTIC_LTB_RULE.methodId,
      methodType: "ELASTIC_LTB_REFERENCE",
      engineeringRuleRef: AU_BENDING_ELASTIC_LTB_RULE.ruleId,
      capacityType: AU_BENDING_ELASTIC_LTB_RULE.outputType,
      resultClass: "MECHANICS_REFERENCE",
      axis: "MAJOR_AXIS",
      capacityValueNm: mcrNm,
      units: "N.m",
      technicalBasisRef: AU_BENDING_ELASTIC_LTB_RULE.technicalBasisRef,
      standardProfileRef: input.standardContext.contextId,
      validationState: AU_BENDING_ELASTIC_LTB_RULE.validationState,
      standardConformanceState: AU_BENDING_ELASTIC_LTB_RULE.standardConformanceState,
      unbracedLengthM: lu,
    });
  }

  const governing = checks.reduce((lowest, row) => (row.capacityValueNm < lowest.capacityValueNm ? row : lowest));
  const ltbEvaluated = checks.some((row) => row.methodType === "ELASTIC_LTB_REFERENCE");
  return {
    adapterId: "AU_STEEL",
    maturity: "BENCHMARKED",
    implemented: true,
    capacity: capacityIdentity(input, governing.methodId, governing.capacityValueNm),
    reason: ltbEvaluated
      ? "AU bending mechanics-reference first-yield and uniform-moment elastic LTB; intended AS 4100 profile; design-code member/section capacity VALIDATION_REQUIRED; not labelled as code member capacity"
      : "AU bending mechanics-reference first-yield PARTIAL; LTB not evaluated; intended AS 4100 profile; design-code member/section capacity VALIDATION_REQUIRED; not labelled as code member capacity",
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
    sectionClassificationState: auBendingSectionClassificationState() ?? SECTION_CLASSIFICATION_STATE,
  };
}
