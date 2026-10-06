import type {
  SteelCapacityEngineInput,
  SteelCapacityEngineOutput,
  SteelCheckVerdict,
  SteelCompressionCheckRecord,
  StructuralCapacityResult,
} from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  EULER_REFERENCE_EQUALS_EN1993_MEMBER_CAPACITY,
  EU_COMPRESSION_PARTIAL_FACTOR_SOURCE,
  FLEXURAL_TORSIONAL_BUCKLING_IMPLEMENTED,
  LLM_EU_COMPRESSION_CAPACITY_AUTHORITY,
  MEMBER_STABILITY_EQUALS_GLOBAL_FRAME_STABILITY,
  MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_CODE_CHECK,
  SECTION_CLASSIFICATION_STATE,
  TORSIONAL_BUCKLING_IMPLEMENTED,
} from "@rtb/types";
import { toStandardContextRef } from "../../structural-domain/binding";
import { assertAnnexCompatibleWithContext, resolveNdp } from "../eu-standard/annex";
import { denyNationalAnnexFromUserLocation } from "../eu-standard/authority";
import { assertAust300NotEuDefault } from "../eu-standard/catalogs";
import { eulerLoadN, toElasticModulusPa, toSecondMomentM4 } from "../mechanics/euler";
import { nominalTensionForceN } from "../mechanics/tension-force";
import { assertGovernedProperty } from "../properties";
import {
  assertEuCompressionRuleAuthority,
  assertMechanicsNotEn1993MemberCapacity,
  assertNotCertifiedEuCompression,
  rejectUnknownEuCompressionCodeParameter,
} from "./authority";
import { createEuCompressionContext } from "./context";
import {
  EU_COMPRESSION_EULER_MAJOR_MECHANICS_RULE,
  EU_COMPRESSION_EULER_MINOR_MECHANICS_RULE,
  EU_COMPRESSION_IMPLEMENTATION_VERSION,
  EU_COMPRESSION_MEMBER_CAPACITY_CODE_PROFILE_RULE,
  EU_COMPRESSION_METHOD_REGISTRY,
  EU_COMPRESSION_SQUASH_YIELD_MECHANICS_RULE,
  EU_COMPRESSION_TOOL_REF,
} from "./registry";

function assertLlmBoundary(): void {
  if (LLM_EU_COMPRESSION_CAPACITY_AUTHORITY) throw new Error("AI cannot originate EU compression capacity");
  if (AI_ENGINEERING_APPROVAL || CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL) {
    throw new Error("check result must not equal engineering approval");
  }
  if (EULER_REFERENCE_EQUALS_EN1993_MEMBER_CAPACITY) {
    throw new Error("Euler reference must not be labelled EN 1993 member capacity");
  }
  if (MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_CODE_CHECK) {
    throw new Error("mechanics-reference utilization must not be labelled as a Eurocode design check");
  }
  if (MEMBER_STABILITY_EQUALS_GLOBAL_FRAME_STABILITY) {
    throw new Error("member stability is not global frame stability");
  }
  if (TORSIONAL_BUCKLING_IMPLEMENTED || FLEXURAL_TORSIONAL_BUCKLING_IMPLEMENTED) {
    throw new Error("torsional and flexural-torsional buckling must not be claimed as implemented");
  }
}

function compressionDemandN(input: SteelCapacityEngineInput): number {
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
    sourceSystem: EU_COMPRESSION_TOOL_REF,
    sourceObjectId: input.designContext.designContextId,
    revision: EU_COMPRESSION_IMPLEMENTATION_VERSION,
    status: "DEFINED",
    provenance: {
      ...input.designContext.provenanceRef,
      tool: EU_COMPRESSION_TOOL_REF,
      version: EU_COMPRESSION_IMPLEMENTATION_VERSION,
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
    toolRef: EU_COMPRESSION_TOOL_REF,
    methodRef: methodId,
    validationState: "BENCHMARKED",
    llmOriginated: false,
  };
}

export function evaluateEuSteelCompression(input: SteelCapacityEngineInput): SteelCapacityEngineOutput {
  assertLlmBoundary();
  if (input.adapterId !== "EU_STEEL") throw new Error("steel design fail closed: unsupported jurisdiction adapter");
  if (input.limitState !== "COMPRESSION" && input.limitState !== "MEMBER_STABILITY") {
    throw new Error("steel design fail closed: unsupported calculation scope");
  }
  denyNationalAnnexFromUserLocation("explicit");
  compressionDemandN(input);
  if (!input.section.sectionFamily?.trim() || input.section.sectionFamily === "unknown") {
    throw new Error("steel design fail closed: unsupported section type");
  }
  assertAust300NotEuDefault(input.section.catalogSource);
  assertNotCertifiedEuCompression(input.designContext.validationState);
  const compressionContext = createEuCompressionContext(input);
  if (input.eurocodeContext?.nationalAnnex) {
    assertAnnexCompatibleWithContext(input.eurocodeContext, input.eurocodeContext.nationalAnnex);
  }
  for (const rule of EU_COMPRESSION_METHOD_REGISTRY) {
    assertEuCompressionRuleAuthority(rule.authorityType);
    if (rule.methodType === "ENGINEERING_MECHANICS_REFERENCE") assertMechanicsNotEn1993MemberCapacity(rule);
  }

  const fy = assertGovernedProperty(input.material.yieldStrength, "material.yieldStrength");
  const e = assertGovernedProperty(input.material.elasticModulus, "material.elasticModulus");
  const ag = assertGovernedProperty(input.section.area, "section.area");
  const squashN = nominalTensionForceN(fy, ag, "material.yieldStrength", "section.area");
  const checks: SteelCompressionCheckRecord[] = [
    {
      methodId: EU_COMPRESSION_SQUASH_YIELD_MECHANICS_RULE.methodId,
      engineeringRuleRef: EU_COMPRESSION_SQUASH_YIELD_MECHANICS_RULE.ruleId,
      capacityType: EU_COMPRESSION_SQUASH_YIELD_MECHANICS_RULE.outputType,
      resultClass: "MECHANICS_REFERENCE",
      axis: "SQUASH",
      capacityValueN: squashN,
      units: "N",
      technicalBasisRef: EU_COMPRESSION_SQUASH_YIELD_MECHANICS_RULE.technicalBasisRef,
      standardProfileRef: compressionContext.standardContextRef,
      validationState: EU_COMPRESSION_SQUASH_YIELD_MECHANICS_RULE.validationState,
      standardConformanceState: EU_COMPRESSION_SQUASH_YIELD_MECHANICS_RULE.standardConformanceState,
      effectiveLengthM: null,
    },
  ];

  if (compressionContext.bucklingAxes.includes("MAJOR_AXIS")) {
    const iyy = assertGovernedProperty(input.section.Iyy, "section.Iyy");
    if (compressionContext.effectiveLengthMajorM == null) throw new Error("steel design fail closed: missing effective length");
    const pcr = eulerLoadN(
      toElasticModulusPa(e, "material.elasticModulus"),
      toSecondMomentM4(iyy, "section.Iyy"),
      compressionContext.effectiveLengthMajorM,
    );
    checks.push({
      methodId: EU_COMPRESSION_EULER_MAJOR_MECHANICS_RULE.methodId,
      engineeringRuleRef: EU_COMPRESSION_EULER_MAJOR_MECHANICS_RULE.ruleId,
      capacityType: EU_COMPRESSION_EULER_MAJOR_MECHANICS_RULE.outputType,
      resultClass: "MECHANICS_REFERENCE",
      axis: "MAJOR_AXIS",
      capacityValueN: pcr,
      units: "N",
      technicalBasisRef: EU_COMPRESSION_EULER_MAJOR_MECHANICS_RULE.technicalBasisRef,
      standardProfileRef: compressionContext.standardContextRef,
      validationState: EU_COMPRESSION_EULER_MAJOR_MECHANICS_RULE.validationState,
      standardConformanceState: EU_COMPRESSION_EULER_MAJOR_MECHANICS_RULE.standardConformanceState,
      effectiveLengthM: compressionContext.effectiveLengthMajorM,
    });
  }
  if (compressionContext.bucklingAxes.includes("MINOR_AXIS")) {
    const izz = assertGovernedProperty(input.section.Izz, "section.Izz");
    if (compressionContext.effectiveLengthMinorM == null) throw new Error("steel design fail closed: missing effective length");
    const pcr = eulerLoadN(
      toElasticModulusPa(e, "material.elasticModulus"),
      toSecondMomentM4(izz, "section.Izz"),
      compressionContext.effectiveLengthMinorM,
    );
    checks.push({
      methodId: EU_COMPRESSION_EULER_MINOR_MECHANICS_RULE.methodId,
      engineeringRuleRef: EU_COMPRESSION_EULER_MINOR_MECHANICS_RULE.ruleId,
      capacityType: EU_COMPRESSION_EULER_MINOR_MECHANICS_RULE.outputType,
      resultClass: "MECHANICS_REFERENCE",
      axis: "MINOR_AXIS",
      capacityValueN: pcr,
      units: "N",
      technicalBasisRef: EU_COMPRESSION_EULER_MINOR_MECHANICS_RULE.technicalBasisRef,
      standardProfileRef: compressionContext.standardContextRef,
      validationState: EU_COMPRESSION_EULER_MINOR_MECHANICS_RULE.validationState,
      standardConformanceState: EU_COMPRESSION_EULER_MINOR_MECHANICS_RULE.standardConformanceState,
      effectiveLengthM: compressionContext.effectiveLengthMinorM,
    });
  }

  const governing = checks.reduce((lowest, row) => (row.capacityValueN < lowest.capacityValueN ? row : lowest));
  return {
    adapterId: "EU_STEEL",
    maturity: "BENCHMARKED",
    implemented: true,
    capacity: capacityIdentity(input, governing.methodId, governing.capacityValueN),
    reason: "EU compression mechanics-reference squash and Euler loads; intended EN 1993-1-1 profile; Euler is not EN 1993 member compression resistance; buckling curves, classification, and partial factors FRAMEWORK_ONLY",
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
    sectionClassificationState: SECTION_CLASSIFICATION_STATE,
  };
}

export function evaluateEuSteelCompressionCodeProfile(input: SteelCapacityEngineInput): never {
  const rule = EU_COMPRESSION_MEMBER_CAPACITY_CODE_PROFILE_RULE;
  void EU_COMPRESSION_PARTIAL_FACTOR_SOURCE;
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
  return rejectUnknownEuCompressionCodeParameter("partial-factor");
}

export function euCompressionCodeProfileCheckState(input: SteelCapacityEngineInput): SteelCheckVerdict {
  try {
    evaluateEuSteelCompressionCodeProfile(input);
  } catch {
    return "CHECK_UNDETERMINED";
  }
}
