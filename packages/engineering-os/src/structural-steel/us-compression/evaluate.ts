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
  D1C_EQUALS_COMPLETE_US_STABILITY_ANALYSIS,
  DIRECT_CONTRACT_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE,
  EULER_REFERENCE_EQUALS_AISC_MEMBER_STRENGTH,
  FLEXURAL_TORSIONAL_BUCKLING_IMPLEMENTED,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  LLM_US_COMPRESSION_STRENGTH_AUTHORITY,
  MEMBER_STABILITY_EQUALS_GLOBAL_FRAME_STABILITY,
  MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_AISC_CHECK,
  SECTION_CLASSIFICATION_STATE,
  TORSIONAL_BUCKLING_IMPLEMENTED,
  US_COMPRESSION_ASD_FACTOR_SOURCE,
  US_COMPRESSION_LRFD_FACTOR_SOURCE,
  US_CONNECTION_COMPRESSION_DESIGN_IMPLEMENTED,
  US_ELEMENT_CLASSIFICATION_LIMIT_GUESSED,
  US_FLEXURAL_TORSIONAL_BUCKLING_CODE_METHOD_IMPLEMENTED,
  US_MEMBER_COMPRESSION_EQUALS_GLOBAL_FRAME_VALIDATION,
  US_SEISMIC_COMPRESSION_DESIGN_IMPLEMENTED,
  US_TORSIONAL_BUCKLING_CODE_METHOD_IMPLEMENTED,
} from "@rtb/types";
import { toStandardContextRef } from "../../structural-domain/binding";
import { assertAust300NotUsDefault, assertEuCatalogNotUsDefault } from "../us-standard/catalogs";
import { eulerLoadN, toElasticModulusPa, toSecondMomentM4 } from "../mechanics/euler";
import { nominalTensionForceN } from "../mechanics/tension-force";
import { assertGovernedProperty } from "../properties";
import {
  assertMechanicsNotAiscCompressionStrength,
  assertNotCertifiedUsCompression,
  assertUsCompressionBoundaries,
  assertUsCompressionLrfdAsdFactorIsolation,
  assertUsCompressionRuleAuthority,
  rejectUnknownUsCompressionCodeParameter,
  requestUsCompressionAsdFactor,
  requestUsCompressionLrfdFactor,
  requestUsCompressionStrengthRule,
} from "./authority";
import { usElementClassificationState } from "./classification";
import { assertAiscCompressionEditionIsolation, createUsCompressionContext } from "./context";
import {
  US_COMPRESSION_EULER_MAJOR_MECHANICS_RULE,
  US_COMPRESSION_EULER_MINOR_MECHANICS_RULE,
  US_COMPRESSION_IMPLEMENTATION_VERSION,
  US_COMPRESSION_METHOD_REGISTRY,
  US_COMPRESSION_SQUASH_YIELD_MECHANICS_RULE,
  US_COMPRESSION_TOOL_REF,
} from "./registry";

function assertLlmBoundary(): void {
  if (LLM_US_COMPRESSION_STRENGTH_AUTHORITY) throw new Error("AI cannot originate US compression strength");
  if (AI_ENGINEERING_APPROVAL || CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL) {
    throw new Error("check result must not equal engineering approval");
  }
  if (EULER_REFERENCE_EQUALS_AISC_MEMBER_STRENGTH) {
    throw new Error("Euler reference must not be labelled AISC member strength");
  }
  if (MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_AISC_CHECK) {
    throw new Error("mechanics-reference utilization must not be labelled as an AISC check");
  }
  if (MEMBER_STABILITY_EQUALS_GLOBAL_FRAME_STABILITY || US_MEMBER_COMPRESSION_EQUALS_GLOBAL_FRAME_VALIDATION) {
    throw new Error("member stability is not global frame stability");
  }
  if (D1C_EQUALS_COMPLETE_US_STABILITY_ANALYSIS || GENERAL_FEA_CAPABILITY_CLAIMED) {
    throw new Error("D1C is not complete US stability analysis");
  }
  if (
    TORSIONAL_BUCKLING_IMPLEMENTED
    || FLEXURAL_TORSIONAL_BUCKLING_IMPLEMENTED
    || US_TORSIONAL_BUCKLING_CODE_METHOD_IMPLEMENTED
    || US_FLEXURAL_TORSIONAL_BUCKLING_CODE_METHOD_IMPLEMENTED
  ) {
    throw new Error("torsional and flexural-torsional buckling must not be claimed as implemented");
  }
  if (US_SEISMIC_COMPRESSION_DESIGN_IMPLEMENTED || US_CONNECTION_COMPRESSION_DESIGN_IMPLEMENTED) {
    throw new Error("seismic and connection compression design must not be implemented in US-3");
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
    sourceSystem: US_COMPRESSION_TOOL_REF,
    sourceObjectId: input.designContext.designContextId,
    revision: US_COMPRESSION_IMPLEMENTATION_VERSION,
    status: "DEFINED",
    provenance: {
      ...input.designContext.provenanceRef,
      tool: US_COMPRESSION_TOOL_REF,
      version: US_COMPRESSION_IMPLEMENTATION_VERSION,
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
    toolRef: US_COMPRESSION_TOOL_REF,
    methodRef: methodId,
    validationState: "BENCHMARKED",
    llmOriginated: false,
  };
}

export function evaluateUsSteelCompression(input: SteelCapacityEngineInput): SteelCapacityEngineOutput {
  assertLlmBoundary();
  assertUsCompressionBoundaries();
  if (input.adapterId !== "US_STEEL") throw new Error("steel design fail closed: unsupported jurisdiction adapter");
  if (input.limitState !== "COMPRESSION" && input.limitState !== "MEMBER_STABILITY") {
    throw new Error("steel design fail closed: unsupported calculation scope");
  }
  compressionDemandN(input);
  if (!input.section.sectionFamily?.trim() || input.section.sectionFamily === "unknown") {
    throw new Error("steel design fail closed: unsupported section type");
  }
  assertAust300NotUsDefault(input.section.catalogSource);
  assertEuCatalogNotUsDefault(input.section.catalogSource);
  assertNotCertifiedUsCompression(input.designContext.validationState);
  const compressionContext = createUsCompressionContext(input);
  if (DIRECT_CONTRACT_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE && compressionContext.directContractProfile) {
    throw new Error("direct-contract AISC profile is not building-code compliance");
  }
  void usElementClassificationState();
  if (US_ELEMENT_CLASSIFICATION_LIMIT_GUESSED) throw new Error("element classification limits must not be guessed");
  for (const rule of US_COMPRESSION_METHOD_REGISTRY) {
    assertUsCompressionRuleAuthority(rule.authorityType);
    if (rule.methodType === "ENGINEERING_MECHANICS_REFERENCE" || rule.methodType === "ELASTIC_BUCKLING_REFERENCE") {
      assertMechanicsNotAiscCompressionStrength(rule);
    }
    assertAiscCompressionEditionIsolation(rule.aiscEditionRequirement, input.standardContext.edition);
  }

  const fy = assertGovernedProperty(input.material.yieldStrength, "material.yieldStrength");
  const ag = assertGovernedProperty(input.section.area, "section.area");
  const squashN = nominalTensionForceN(fy, ag, "material.yieldStrength", "section.area");
  const checks: SteelCompressionCheckRecord[] = [
    {
      methodId: US_COMPRESSION_SQUASH_YIELD_MECHANICS_RULE.methodId,
      engineeringRuleRef: US_COMPRESSION_SQUASH_YIELD_MECHANICS_RULE.ruleId,
      capacityType: US_COMPRESSION_SQUASH_YIELD_MECHANICS_RULE.outputType,
      resultClass: "MECHANICS_REFERENCE",
      axis: "SQUASH",
      capacityValueN: squashN,
      units: "N",
      technicalBasisRef: US_COMPRESSION_SQUASH_YIELD_MECHANICS_RULE.technicalBasisRef,
      standardProfileRef: compressionContext.standardContextRef,
      validationState: US_COMPRESSION_SQUASH_YIELD_MECHANICS_RULE.validationState,
      standardConformanceState: US_COMPRESSION_SQUASH_YIELD_MECHANICS_RULE.standardConformanceState,
      effectiveLengthM: null,
    },
  ];

  const eulerEligible = compressionContext.stabilityAnalysisMethod !== "DIRECT_ANALYSIS_BASED"
    || compressionContext.effectiveLengthMajorM != null
    || compressionContext.effectiveLengthMinorM != null;
  const computeMajor = eulerEligible && compressionContext.bucklingAxes.includes("MAJOR_AXIS") && compressionContext.effectiveLengthMajorM != null;
  const computeMinor = eulerEligible && compressionContext.bucklingAxes.includes("MINOR_AXIS") && compressionContext.effectiveLengthMinorM != null;
  if (
    compressionContext.stabilityAnalysisMethod !== "DIRECT_ANALYSIS_BASED"
    && compressionContext.bucklingAxes.includes("MAJOR_AXIS")
    && compressionContext.effectiveLengthMajorM == null
  ) {
    throw new Error("steel design fail closed: missing effective length");
  }
  if (
    compressionContext.stabilityAnalysisMethod !== "DIRECT_ANALYSIS_BASED"
    && compressionContext.bucklingAxes.includes("MINOR_AXIS")
    && compressionContext.effectiveLengthMinorM == null
  ) {
    throw new Error("steel design fail closed: missing effective length");
  }
  if (computeMajor || computeMinor) {
    const e = assertGovernedProperty(input.material.elasticModulus, "material.elasticModulus");
    if (computeMajor) {
      const iyy = assertGovernedProperty(input.section.Iyy, "section.Iyy");
      const pcr = eulerLoadN(
        toElasticModulusPa(e, "material.elasticModulus"),
        toSecondMomentM4(iyy, "section.Iyy"),
        compressionContext.effectiveLengthMajorM!,
      );
      checks.push({
        methodId: US_COMPRESSION_EULER_MAJOR_MECHANICS_RULE.methodId,
        engineeringRuleRef: US_COMPRESSION_EULER_MAJOR_MECHANICS_RULE.ruleId,
        capacityType: US_COMPRESSION_EULER_MAJOR_MECHANICS_RULE.outputType,
        resultClass: "MECHANICS_REFERENCE",
        axis: "MAJOR_AXIS",
        capacityValueN: pcr,
        units: "N",
        technicalBasisRef: US_COMPRESSION_EULER_MAJOR_MECHANICS_RULE.technicalBasisRef,
        standardProfileRef: compressionContext.standardContextRef,
        validationState: US_COMPRESSION_EULER_MAJOR_MECHANICS_RULE.validationState,
        standardConformanceState: US_COMPRESSION_EULER_MAJOR_MECHANICS_RULE.standardConformanceState,
        effectiveLengthM: compressionContext.effectiveLengthMajorM,
      });
    }
    if (computeMinor) {
      const izz = assertGovernedProperty(input.section.Izz, "section.Izz");
      const pcr = eulerLoadN(
        toElasticModulusPa(e, "material.elasticModulus"),
        toSecondMomentM4(izz, "section.Izz"),
        compressionContext.effectiveLengthMinorM!,
      );
      checks.push({
        methodId: US_COMPRESSION_EULER_MINOR_MECHANICS_RULE.methodId,
        engineeringRuleRef: US_COMPRESSION_EULER_MINOR_MECHANICS_RULE.ruleId,
        capacityType: US_COMPRESSION_EULER_MINOR_MECHANICS_RULE.outputType,
        resultClass: "MECHANICS_REFERENCE",
        axis: "MINOR_AXIS",
        capacityValueN: pcr,
        units: "N",
        technicalBasisRef: US_COMPRESSION_EULER_MINOR_MECHANICS_RULE.technicalBasisRef,
        standardProfileRef: compressionContext.standardContextRef,
        validationState: US_COMPRESSION_EULER_MINOR_MECHANICS_RULE.validationState,
        standardConformanceState: US_COMPRESSION_EULER_MINOR_MECHANICS_RULE.standardConformanceState,
        effectiveLengthM: compressionContext.effectiveLengthMinorM,
      });
    }
  }

  const governing = checks.reduce((lowest, row) => (row.capacityValueN < lowest.capacityValueN ? row : lowest));
  return {
    adapterId: "US_STEEL",
    maturity: "BENCHMARKED",
    implemented: true,
    capacity: capacityIdentity(input, governing.methodId, governing.capacityValueN),
    reason: `US compression mechanics-reference squash and Euler loads; intended AISC 360 profile; ${compressionContext.designMethod}; Euler is not AISC member compressive strength; code-profile Pn/φcPn/Pn/Ωc FRAMEWORK_ONLY`,
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

export function evaluateUsSteelCompressionCodeProfile(input: SteelCapacityEngineInput): never {
  const context = createUsCompressionContext(input);
  void US_COMPRESSION_LRFD_FACTOR_SOURCE;
  void US_COMPRESSION_ASD_FACTOR_SOURCE;
  if (context.designMethod === "LRFD") {
    assertUsCompressionLrfdAsdFactorIsolation("LRFD", "phi_c");
    requestUsCompressionStrengthRule();
    return requestUsCompressionLrfdFactor();
  }
  if (context.designMethod === "ASD") {
    assertUsCompressionLrfdAsdFactorIsolation("ASD", "Omega_c");
    requestUsCompressionStrengthRule();
    return requestUsCompressionAsdFactor();
  }
  return rejectUnknownUsCompressionCodeParameter("designMethod");
}

export function usCompressionCodeProfileCheckState(input: SteelCapacityEngineInput): SteelCheckVerdict {
  try {
    evaluateUsSteelCompressionCodeProfile(input);
  } catch {
    return "CHECK_UNDETERMINED";
  }
  return "CHECK_UNDETERMINED";
}
