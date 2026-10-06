import type {
  SteelCapacityEngineInput,
  SteelCapacityEngineOutput,
  SteelTensionCheckRecord,
  StructuralCapacityResult,
} from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  DIRECT_CONTRACT_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE,
  GENERIC_MECHANICS_EQUALS_AISC_DESIGN_STRENGTH,
  LLM_US_TENSION_STRENGTH_AUTHORITY,
  MECHANICS_REFERENCE_EQUALS_AISC_NOMINAL_STRENGTH,
  MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_AISC_CHECK,
  SILENT_NET_AREA_EQUALS_GROSS_AREA,
  US_BLOCK_SHEAR_IMPLEMENTED,
  US_CONNECTION_TENSION_DESIGN_IMPLEMENTED,
  US_FATIGUE_TENSION_DESIGN_IMPLEMENTED,
  US_SEISMIC_TENSION_DESIGN_IMPLEMENTED,
} from "@rtb/types";
import { toStandardContextRef } from "../../structural-domain/binding";
import { assertAust300NotUsDefault, assertEuCatalogNotUsDefault } from "../us-standard/catalogs";
import { denyAiLrfdAsdChoice } from "../us-standard/authority";
import { nominalTensionForceN, toAreaM2 } from "../mechanics/tension-force";
import { assertGovernedProperty } from "../properties";
import {
  assertLrfdAsdFactorIsolation,
  assertMechanicsNotAiscDesignStrength,
  assertNotCertifiedUsTension,
  assertUsTensionBoundaries,
  assertUsTensionRuleAuthority,
  rejectUnknownUsCodeParameter,
  requestUsAsdFactor,
  requestUsHoleDeduction,
  requestUsLrfdResistanceFactor,
  requestUsShearLagFactor,
} from "./authority";
import { assertAiscTensionEditionIsolation, createUsTensionContext } from "./context";
import {
  US_TENSION_GROSS_YIELD_ASD_RULE,
  US_TENSION_GROSS_YIELD_LRFD_RULE,
  US_TENSION_GROSS_YIELD_MECHANICS_RULE,
  US_TENSION_IMPLEMENTATION_VERSION,
  US_TENSION_METHOD_REGISTRY,
  US_TENSION_NET_FRACTURE_ASD_RULE,
  US_TENSION_NET_FRACTURE_LRFD_RULE,
  US_TENSION_NET_FRACTURE_MECHANICS_RULE,
  US_TENSION_TOOL_REF,
} from "./registry";

function assertLlmBoundary(): void {
  if (LLM_US_TENSION_STRENGTH_AUTHORITY) throw new Error("AI cannot originate US tension strength");
  if (AI_ENGINEERING_APPROVAL || CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL) {
    throw new Error("check result must not equal engineering approval");
  }
  if (GENERIC_MECHANICS_EQUALS_AISC_DESIGN_STRENGTH || MECHANICS_REFERENCE_EQUALS_AISC_NOMINAL_STRENGTH) {
    throw new Error("generic mechanics must not be labelled AISC design strength");
  }
  if (MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_AISC_CHECK) {
    throw new Error("mechanics-reference utilization must not be labelled as an AISC check");
  }
}

function tensileDemandN(input: SteelCapacityEngineInput): number {
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
    sourceSystem: US_TENSION_TOOL_REF,
    sourceObjectId: input.designContext.designContextId,
    revision: US_TENSION_IMPLEMENTATION_VERSION,
    status: "DEFINED",
    provenance: {
      ...input.designContext.provenanceRef,
      tool: US_TENSION_TOOL_REF,
      version: US_TENSION_IMPLEMENTATION_VERSION,
      calculationMethod: methodId,
      standard: input.standardContext.standardCode,
      validationState: "BENCHMARKED",
      approvalState: "not_approved",
    },
    capacityResultId: `${input.designContext.designContextId}:${methodId}`,
    objectRef: input.designContext.memberRef,
    capacityType: methodId,
    value: valueN,
    units: "N",
    standardContextRef: toStandardContextRef(input.standardContext),
    toolRef: US_TENSION_TOOL_REF,
    methodRef: methodId,
    validationState: "BENCHMARKED",
    llmOriginated: false,
  };
}

export function evaluateUsSteelTension(input: SteelCapacityEngineInput): SteelCapacityEngineOutput {
  assertLlmBoundary();
  assertUsTensionBoundaries();
  if (input.adapterId !== "US_STEEL") throw new Error("steel design fail closed: unsupported jurisdiction adapter");
  if (input.limitState !== "TENSION") throw new Error("steel design fail closed: unsupported calculation scope");
  tensileDemandN(input);
  if (!input.section.sectionFamily?.trim() || input.section.sectionFamily === "unknown") {
    throw new Error("steel design fail closed: unsupported section type");
  }
  assertAust300NotUsDefault(input.section.catalogSource);
  assertEuCatalogNotUsDefault(input.section.catalogSource);
  assertNotCertifiedUsTension(input.designContext.validationState);
  const tensionContext = createUsTensionContext(input);
  if (DIRECT_CONTRACT_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE && tensionContext.directContractProfile) {
    throw new Error("direct-contract AISC profile is not building-code compliance");
  }
  if (US_SEISMIC_TENSION_DESIGN_IMPLEMENTED || US_CONNECTION_TENSION_DESIGN_IMPLEMENTED || US_BLOCK_SHEAR_IMPLEMENTED || US_FATIGUE_TENSION_DESIGN_IMPLEMENTED) {
    throw new Error("US-2 must not implement seismic, connection, block-shear, or fatigue tension design");
  }
  for (const rule of US_TENSION_METHOD_REGISTRY) {
    assertUsTensionRuleAuthority(rule.authorityType);
    if (rule.methodType === "ENGINEERING_MECHANICS_REFERENCE") assertMechanicsNotAiscDesignStrength(rule);
    assertAiscTensionEditionIsolation(rule.aiscEditionRequirement, input.standardContext.edition);
  }

  const fy = assertGovernedProperty(input.material.yieldStrength, "material.yieldStrength");
  const fu = assertGovernedProperty(input.material.ultimateStrength, "material.ultimateStrength");
  const ag = assertGovernedProperty(input.section.area, "section.area");
  const an = assertGovernedProperty(input.section.netArea, "section.netArea");
  if (SILENT_NET_AREA_EQUALS_GROSS_AREA) throw new Error("net area must not silently equal gross area");
  const agM2 = toAreaM2(ag, "section.area");
  const anM2 = toAreaM2(an, "section.netArea");
  if (anM2 > agM2) throw new Error("steel design fail closed: net area cannot exceed gross area");

  const grossYieldN = nominalTensionForceN(fy, ag, "material.yieldStrength", "section.area");
  const netFractureN = nominalTensionForceN(fu, an, "material.ultimateStrength", "section.netArea");
  const governingN = Math.min(grossYieldN, netFractureN);
  const governingMethodId = grossYieldN <= netFractureN
    ? US_TENSION_GROSS_YIELD_MECHANICS_RULE.methodId
    : US_TENSION_NET_FRACTURE_MECHANICS_RULE.methodId;

  const checks: SteelTensionCheckRecord[] = [
    {
      methodId: US_TENSION_GROSS_YIELD_MECHANICS_RULE.methodId,
      engineeringRuleRef: US_TENSION_GROSS_YIELD_MECHANICS_RULE.ruleId,
      capacityType: US_TENSION_GROSS_YIELD_MECHANICS_RULE.outputType,
      capacityValueN: grossYieldN,
      units: "N",
      technicalBasisRef: US_TENSION_GROSS_YIELD_MECHANICS_RULE.technicalBasisRef,
      standardProfileRef: tensionContext.standardContextRef,
      validationState: US_TENSION_GROSS_YIELD_MECHANICS_RULE.validationState,
      standardConformanceState: US_TENSION_GROSS_YIELD_MECHANICS_RULE.standardConformanceState,
    },
    {
      methodId: US_TENSION_NET_FRACTURE_MECHANICS_RULE.methodId,
      engineeringRuleRef: US_TENSION_NET_FRACTURE_MECHANICS_RULE.ruleId,
      capacityType: US_TENSION_NET_FRACTURE_MECHANICS_RULE.outputType,
      capacityValueN: netFractureN,
      units: "N",
      technicalBasisRef: US_TENSION_NET_FRACTURE_MECHANICS_RULE.technicalBasisRef,
      standardProfileRef: tensionContext.standardContextRef,
      validationState: US_TENSION_NET_FRACTURE_MECHANICS_RULE.validationState,
      standardConformanceState: US_TENSION_NET_FRACTURE_MECHANICS_RULE.standardConformanceState,
    },
  ];

  return {
    adapterId: "US_STEEL",
    maturity: "BENCHMARKED",
    implemented: true,
    capacity: capacityIdentity(input, governingMethodId, governingN),
    reason: "US tension nominal resistances from established engineering mechanics; intended AISC 360 profile; conformance not validated; LRFD/ASD factors not implemented",
    sourceAuthority: {
      authorityType: "VALIDATED_INTERNAL_ENGINEERING_RULE",
      identifier: US_TENSION_GROSS_YIELD_MECHANICS_RULE.ruleId,
      clauseRef: null,
      edition: input.standardContext.edition,
      licensedMetadataOnly: true,
    },
    tensionChecks: checks,
    governingMethodId,
    standardConformanceState: "INTENDED_PROFILE",
    implementationBindingState: "IMPLEMENTED_UNVERIFIED_STANDARD_BINDING",
    resultClass: "MECHANICS_REFERENCE",
    designCapacityState: "VALIDATION_REQUIRED",
  };
}

export function evaluateUsSteelTensionCodeProfile(input: SteelCapacityEngineInput, designMethod: "LRFD" | "ASD"): SteelCapacityEngineOutput {
  createUsTensionContext(input);
  void US_TENSION_GROSS_YIELD_LRFD_RULE;
  void US_TENSION_NET_FRACTURE_LRFD_RULE;
  void US_TENSION_GROSS_YIELD_ASD_RULE;
  void US_TENSION_NET_FRACTURE_ASD_RULE;
  if (designMethod === "LRFD") {
    assertLrfdAsdFactorIsolation("LRFD", "phi");
    return requestUsLrfdResistanceFactor();
  }
  assertLrfdAsdFactorIsolation("ASD", "Omega");
  return requestUsAsdFactor();
}

export function evaluateUsSteelTensionEffectiveNet(input: SteelCapacityEngineInput): never {
  createUsTensionContext(input);
  return requestUsShearLagFactor();
}

export function evaluateUsSteelTensionHoleDeduction(input: SteelCapacityEngineInput): never {
  createUsTensionContext(input);
  return requestUsHoleDeduction();
}

export function requestUsTensionPartialCodeStrength(): never {
  return rejectUnknownUsCodeParameter("AISC-tension-strength");
}

export function denySilentUsDesignMethodChoice(): never {
  return denyAiLrfdAsdChoice();
}
