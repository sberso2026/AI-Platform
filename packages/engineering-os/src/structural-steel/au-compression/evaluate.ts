import type {
  SteelCapacityEngineInput,
  SteelCapacityEngineOutput,
  SteelCompressionCheckRecord,
  StructuralCapacityResult,
} from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  ELASTIC_BUCKLING_EQUALS_CODE_CAPACITY,
  GLOBAL_STEEL_CORE_MODIFIED_FOR_AU_FORMULAS,
  LLM_COMPRESSION_CAPACITY_AUTHORITY,
  LLM_STEEL_CAPACITY_AUTHORITY,
  SECTION_CLASSIFICATION_STATE,
} from "@rtb/types";
import { toStandardContextRef } from "../../structural-domain/binding";
import { assertAust300NotGlobal } from "../aust300";
import { assertGovernedProperty } from "../properties";
import { assertEngineeringRuleAuthority } from "../au-tension/authority";
import { assertNotCertified } from "../au-tension/confirmation";
import { assertAuSteelStandardProfile } from "../au-tension/profile";
import { nominalTensionForceN } from "../au-tension/units";
import { auSectionClassificationState } from "./classification";
import { toAuCompressionContext } from "./context";
import {
  AU_COMPRESSION_EULER_MAJOR_RULE,
  AU_COMPRESSION_EULER_MINOR_RULE,
  AU_COMPRESSION_IMPLEMENTATION_VERSION,
  AU_COMPRESSION_METHOD_REGISTRY,
  AU_COMPRESSION_SQUASH_RULE,
  AU_COMPRESSION_TOOL_REF,
} from "./registry";
import { eulerLoadN, toElasticModulusPa, toSecondMomentM4 } from "./units";

function assertLlmBoundary(): void {
  if (LLM_STEEL_CAPACITY_AUTHORITY || LLM_COMPRESSION_CAPACITY_AUTHORITY) throw new Error("AI cannot originate capacity");
  if (AI_ENGINEERING_APPROVAL || CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL) {
    throw new Error("check result must not equal engineering approval");
  }
  if (GLOBAL_STEEL_CORE_MODIFIED_FOR_AU_FORMULAS) throw new Error("AU formulas must not live in the global steel core");
  if (ELASTIC_BUCKLING_EQUALS_CODE_CAPACITY) throw new Error("elastic buckling must not be labelled code capacity");
}

function assertCompressionDemand(input: SteelCapacityEngineInput): number {
  if (!input.demand.resultId) throw new Error("steel design fail closed: demand missing");
  if (input.demand.capacityPresent) throw new Error("D1C demand must not contain capacity");
  const axial = input.demand.axial;
  if ("status" in axial && axial.status === "NO_AXIAL_COMPONENTS") {
    throw new Error("steel design fail closed: demand missing");
  }
  if (!("unit" in axial) || axial.unit !== "N") throw new Error("steel design fail closed: units incompatible");
  return axial.valueN;
}

function capacityIdentity(input: SteelCapacityEngineInput, methodId: string, valueN: number): StructuralCapacityResult {
  return {
    objectId: `${input.designContext.designContextId}:${methodId}`,
    objectType: "CAPACITY_RESULT",
    structuralSystemId: input.designContext.memberRef,
    projectId: "not-persisted",
    assetId: null,
    tenantId: "not-persisted",
    workspaceId: "not-persisted",
    externalReference: null,
    sourceSystem: AU_COMPRESSION_TOOL_REF,
    sourceObjectId: input.designContext.designContextId,
    revision: AU_COMPRESSION_IMPLEMENTATION_VERSION,
    status: "DEFINED",
    provenance: {
      ...input.designContext.provenanceRef,
      tool: AU_COMPRESSION_TOOL_REF,
      version: AU_COMPRESSION_IMPLEMENTATION_VERSION,
      calculationMethod: methodId,
      standard: input.standardContext.standardCode,
      validationState: "BENCHMARKED",
      approvalState: "not_approved",
    },
    capacityResultId: `${input.designContext.designContextId}:${methodId}`,
    objectRef: input.designContext.memberRef,
    capacityType: "MECHANICS_REFERENCE",
    value: valueN,
    units: "N",
    standardContextRef: toStandardContextRef(input.standardContext),
    toolRef: AU_COMPRESSION_TOOL_REF,
    methodRef: methodId,
    validationState: "BENCHMARKED",
    llmOriginated: false,
  };
}

export function evaluateAuSteelCompression(input: SteelCapacityEngineInput): SteelCapacityEngineOutput {
  assertLlmBoundary();
  if (input.adapterId !== "AU_STEEL") throw new Error("steel design fail closed: unsupported jurisdiction adapter");
  if (input.limitState !== "COMPRESSION" && input.limitState !== "MEMBER_STABILITY") {
    throw new Error("steel design fail closed: unsupported calculation scope");
  }
  assertAuSteelStandardProfile(input.standardContext);
  assertCompressionDemand(input);
  if (!input.section.sectionFamily?.trim() || input.section.sectionFamily === "unknown") {
    throw new Error("steel design fail closed: unsupported section type");
  }
  if (input.section.catalogSource === "AUST300") assertAust300NotGlobal(input.section.jurisdictionApplicability);
  if (input.material.thicknessDependentMetadata && !input.material.yieldStrength?.provenanceRef) {
    throw new Error("steel design fail closed: missing material.yieldStrength");
  }
  for (const rule of AU_COMPRESSION_METHOD_REGISTRY) {
    assertEngineeringRuleAuthority(rule.authorityType);
    assertNotCertified(rule, input.designContext.validationState);
  }

  const ctx = toAuCompressionContext(input);
  const fy = assertGovernedProperty(input.material.yieldStrength, "material.yieldStrength");
  const e = assertGovernedProperty(input.material.elasticModulus, "material.elasticModulus");
  const ag = assertGovernedProperty(input.section.area, "section.area");
  const squashN = nominalTensionForceN(fy, ag, "material.yieldStrength", "section.area");
  const checks: SteelCompressionCheckRecord[] = [
    {
      methodId: AU_COMPRESSION_SQUASH_RULE.methodId,
      engineeringRuleRef: AU_COMPRESSION_SQUASH_RULE.ruleId,
      capacityType: AU_COMPRESSION_SQUASH_RULE.outputType,
      resultClass: "MECHANICS_REFERENCE",
      axis: "SQUASH",
      capacityValueN: squashN,
      units: "N",
      technicalBasisRef: AU_COMPRESSION_SQUASH_RULE.technicalBasisRef,
      standardProfileRef: input.standardContext.contextId,
      validationState: AU_COMPRESSION_SQUASH_RULE.validationState,
      standardConformanceState: AU_COMPRESSION_SQUASH_RULE.standardConformanceState,
      effectiveLengthM: null,
    },
  ];

  if (ctx.bucklingAxes.includes("MAJOR_AXIS")) {
    const iyy = assertGovernedProperty(input.section.Iyy, "section.Iyy");
    if (ctx.effectiveLengthMajorM == null) throw new Error("steel design fail closed: missing effective length");
    const pcr = eulerLoadN(toElasticModulusPa(e, "material.elasticModulus"), toSecondMomentM4(iyy, "section.Iyy"), ctx.effectiveLengthMajorM);
    checks.push({
      methodId: AU_COMPRESSION_EULER_MAJOR_RULE.methodId,
      engineeringRuleRef: AU_COMPRESSION_EULER_MAJOR_RULE.ruleId,
      capacityType: AU_COMPRESSION_EULER_MAJOR_RULE.outputType,
      resultClass: "MECHANICS_REFERENCE",
      axis: "MAJOR_AXIS",
      capacityValueN: pcr,
      units: "N",
      technicalBasisRef: AU_COMPRESSION_EULER_MAJOR_RULE.technicalBasisRef,
      standardProfileRef: input.standardContext.contextId,
      validationState: AU_COMPRESSION_EULER_MAJOR_RULE.validationState,
      standardConformanceState: AU_COMPRESSION_EULER_MAJOR_RULE.standardConformanceState,
      effectiveLengthM: ctx.effectiveLengthMajorM,
    });
  }
  if (ctx.bucklingAxes.includes("MINOR_AXIS")) {
    const izz = assertGovernedProperty(input.section.Izz, "section.Izz");
    if (ctx.effectiveLengthMinorM == null) throw new Error("steel design fail closed: missing effective length");
    const pcr = eulerLoadN(toElasticModulusPa(e, "material.elasticModulus"), toSecondMomentM4(izz, "section.Izz"), ctx.effectiveLengthMinorM);
    checks.push({
      methodId: AU_COMPRESSION_EULER_MINOR_RULE.methodId,
      engineeringRuleRef: AU_COMPRESSION_EULER_MINOR_RULE.ruleId,
      capacityType: AU_COMPRESSION_EULER_MINOR_RULE.outputType,
      resultClass: "MECHANICS_REFERENCE",
      axis: "MINOR_AXIS",
      capacityValueN: pcr,
      units: "N",
      technicalBasisRef: AU_COMPRESSION_EULER_MINOR_RULE.technicalBasisRef,
      standardProfileRef: input.standardContext.contextId,
      validationState: AU_COMPRESSION_EULER_MINOR_RULE.validationState,
      standardConformanceState: AU_COMPRESSION_EULER_MINOR_RULE.standardConformanceState,
      effectiveLengthM: ctx.effectiveLengthMinorM,
    });
  }

  const governing = checks.reduce((lowest, row) => (row.capacityValueN < lowest.capacityValueN ? row : lowest));
  return {
    adapterId: "AU_STEEL",
    maturity: "BENCHMARKED",
    implemented: true,
    capacity: capacityIdentity(input, governing.methodId, governing.capacityValueN),
    reason: "AU compression mechanics-reference squash and Euler loads; intended AS 4100 profile; design-code member capacity VALIDATION_REQUIRED; not AS4100_DESIGN_CAPACITY",
    sourceAuthority: {
      authorityType: "VALIDATED_INTERNAL_ENGINEERING_RULE",
      identifier: governing.engineeringRuleRef,
      clauseRef: null,
      edition: input.standardContext.edition,
      licensedMetadataOnly: true,
    },
    compressionChecks: checks,
    governingMethodId: governing.methodId,
    standardConformanceState: "INTENDED_PROFILE",
    implementationBindingState: "IMPLEMENTED_UNVERIFIED_STANDARD_BINDING",
    resultClass: "MECHANICS_REFERENCE",
    designCapacityState: "VALIDATION_REQUIRED",
    sectionClassificationState: auSectionClassificationState() ?? SECTION_CLASSIFICATION_STATE,
  };
}
