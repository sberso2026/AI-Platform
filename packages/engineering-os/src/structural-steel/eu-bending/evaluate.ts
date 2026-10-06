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
  COMBINED_ACTION_IMPLEMENTED,
  ELASTIC_LTB_EQUALS_CODE_MEMBER_CAPACITY,
  ELASTIC_MECHANICS_EQUALS_EN1993_BENDING_CAPACITY,
  EU_BENDING_PARTIAL_FACTOR_SOURCE,
  EU_SHEAR_IMPLEMENTED,
  LLM_EU_BENDING_CAPACITY_AUTHORITY,
  MEMBER_BENDING_STABILITY_EQUALS_GLOBAL_FRAME_STABILITY,
  MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_CODE_CHECK,
  SECTION_CLASSIFICATION_STATE,
  TORSIONAL_DESIGN_IMPLEMENTED,
} from "@rtb/types";
import { toStandardContextRef } from "../../structural-domain/binding";
import { assertAnnexCompatibleWithContext, resolveNdp } from "../eu-standard/annex";
import { denyNationalAnnexFromUserLocation } from "../eu-standard/authority";
import { assertAust300NotEuDefault } from "../eu-standard/catalogs";
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
import {
  assertEuBendingRuleAuthority,
  assertMechanicsNotEn1993BendingCapacity,
  assertNotCertifiedEuBending,
  rejectUnknownEuBendingCodeParameter,
} from "./authority";
import { createEuBendingContext } from "./context";
import {
  EU_BENDING_ELASTIC_LTB_MECHANICS_RULE,
  EU_BENDING_ELASTIC_MAJOR_MECHANICS_RULE,
  EU_BENDING_ELASTIC_MINOR_MECHANICS_RULE,
  EU_BENDING_IMPLEMENTATION_VERSION,
  EU_BENDING_METHOD_REGISTRY,
  EU_BENDING_TOOL_REF,
  EU_MEMBER_BENDING_LTB_CODE_PROFILE_RULE,
} from "./registry";

function assertLlmBoundary(): void {
  if (LLM_EU_BENDING_CAPACITY_AUTHORITY) throw new Error("AI cannot originate EU bending capacity");
  if (AI_ENGINEERING_APPROVAL || CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL) {
    throw new Error("check result must not equal engineering approval");
  }
  if (ELASTIC_MECHANICS_EQUALS_EN1993_BENDING_CAPACITY || ELASTIC_LTB_EQUALS_CODE_MEMBER_CAPACITY) {
    throw new Error("elastic mechanics must not be labelled EN 1993 bending capacity");
  }
  if (MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_CODE_CHECK) {
    throw new Error("mechanics-reference utilization must not be labelled as a Eurocode design check");
  }
  if (MEMBER_BENDING_STABILITY_EQUALS_GLOBAL_FRAME_STABILITY) {
    throw new Error("member bending stability is not global frame stability");
  }
  if (COMBINED_ACTION_IMPLEMENTED || EU_SHEAR_IMPLEMENTED || TORSIONAL_DESIGN_IMPLEMENTED) {
    throw new Error("EU-4 must not claim shear, combined action, or torsional design");
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
    sourceSystem: EU_BENDING_TOOL_REF,
    sourceObjectId: input.designContext.designContextId,
    revision: EU_BENDING_IMPLEMENTATION_VERSION,
    status: "DEFINED",
    provenance: {
      ...input.designContext.provenanceRef,
      tool: EU_BENDING_TOOL_REF,
      version: EU_BENDING_IMPLEMENTATION_VERSION,
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
    toolRef: EU_BENDING_TOOL_REF,
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
  const rule = axis === "MINOR_AXIS" ? EU_BENDING_ELASTIC_MINOR_MECHANICS_RULE : EU_BENDING_ELASTIC_MAJOR_MECHANICS_RULE;
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

export function evaluateEuSteelBending(input: SteelCapacityEngineInput): SteelCapacityEngineOutput {
  assertLlmBoundary();
  if (input.adapterId !== "EU_STEEL") throw new Error("steel design fail closed: unsupported jurisdiction adapter");
  if (input.limitState !== "BENDING_MAJOR" && input.limitState !== "BENDING_MINOR") {
    throw new Error("steel design fail closed: unsupported calculation scope");
  }
  denyNationalAnnexFromUserLocation("explicit");
  assertBendingDemand(input);
  consumeD1cDeflectionHandoff(input.demand);
  if (!input.section.sectionFamily?.trim() || input.section.sectionFamily === "unknown") {
    throw new Error("steel design fail closed: unsupported section type");
  }
  assertAust300NotEuDefault(input.section.catalogSource);
  assertNotCertifiedEuBending(input.designContext.validationState);
  const bendingContext = createEuBendingContext(input);
  if (input.eurocodeContext?.nationalAnnex) {
    assertAnnexCompatibleWithContext(input.eurocodeContext, input.eurocodeContext.nationalAnnex);
  }
  for (const rule of EU_BENDING_METHOD_REGISTRY) {
    assertEuBendingRuleAuthority(rule.authorityType);
    if (rule.methodType === "ENGINEERING_MECHANICS_REFERENCE") assertMechanicsNotEn1993BendingCapacity(rule);
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
      methodId: EU_BENDING_ELASTIC_LTB_MECHANICS_RULE.methodId,
      methodType: "ELASTIC_LTB_REFERENCE",
      engineeringRuleRef: EU_BENDING_ELASTIC_LTB_MECHANICS_RULE.ruleId,
      capacityType: EU_BENDING_ELASTIC_LTB_MECHANICS_RULE.outputType,
      resultClass: "MECHANICS_REFERENCE",
      axis: "MAJOR_AXIS",
      capacityValueNm: mcrNm,
      units: "N.m",
      technicalBasisRef: EU_BENDING_ELASTIC_LTB_MECHANICS_RULE.technicalBasisRef,
      standardProfileRef: bendingContext.standardContextRef,
      validationState: EU_BENDING_ELASTIC_LTB_MECHANICS_RULE.validationState,
      standardConformanceState: EU_BENDING_ELASTIC_LTB_MECHANICS_RULE.standardConformanceState,
      unbracedLengthM: lu,
    });
  }

  const governing = checks.reduce((lowest, row) => (row.capacityValueNm < lowest.capacityValueNm ? row : lowest));
  const ltbEvaluated = checks.some((row) => row.methodType === "ELASTIC_LTB_REFERENCE");
  return {
    adapterId: "EU_STEEL",
    maturity: "BENCHMARKED",
    implemented: true,
    capacity: capacityIdentity(input, governing.methodId, governing.capacityValueNm),
    reason: ltbEvaluated
      ? "EU bending mechanics-reference first-yield and uniform-moment elastic LTB; intended EN 1993-1-1 profile; elastic LTB is not EN 1993 member bending resistance; classification, Mc,Rd, Mb,Rd, and LTB curves FRAMEWORK_ONLY"
      : "EU bending mechanics-reference first-yield PARTIAL; LTB not evaluated; intended EN 1993-1-1 profile; not labelled as EN 1993 section or member resistance",
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

export function evaluateEuSteelBendingCodeProfile(input: SteelCapacityEngineInput): never {
  const rule = EU_MEMBER_BENDING_LTB_CODE_PROFILE_RULE;
  void EU_BENDING_PARTIAL_FACTOR_SOURCE;
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
  return rejectUnknownEuBendingCodeParameter("partial-factor");
}

export function euBendingCodeProfileCheckState(input: SteelCapacityEngineInput): SteelCheckVerdict {
  try {
    evaluateEuSteelBendingCodeProfile(input);
  } catch {
    return "CHECK_UNDETERMINED";
  }
}
