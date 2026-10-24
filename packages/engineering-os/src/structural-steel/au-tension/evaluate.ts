import type {
  SteelCapacityEngineInput,
  SteelCapacityEngineOutput,
  SteelTensionCheckRecord,
  StructuralCapacityResult,
} from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  GLOBAL_STEEL_CORE_MODIFIED_FOR_AU_FORMULAS,
  LLM_STEEL_CAPACITY_AUTHORITY,
} from "@rtb/types";
import { toStandardContextRef } from "../../structural-domain/binding";
import { assertAust300NotGlobal } from "../aust300";
import { assertGovernedProperty } from "../properties";
import { assertEngineeringRuleAuthority, rejectUnknownCodeParameter } from "./authority";
import { assertNotCertified } from "./confirmation";
import {
  AU_TENSION_GROSS_YIELD_RULE,
  AU_TENSION_IMPLEMENTATION_VERSION,
  AU_TENSION_METHOD_REGISTRY,
  AU_TENSION_NET_FRACTURE_RULE,
  AU_TENSION_TOOL_REF,
} from "./registry";
import { assertAuSteelStandardProfile } from "./profile";
import { nominalTensionForceN, toAreaM2 } from "./units";

function assertLlmBoundary(): void {
  if (LLM_STEEL_CAPACITY_AUTHORITY) throw new Error("AI cannot originate capacity");
  if (AI_ENGINEERING_APPROVAL || CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL) {
    throw new Error("check result must not equal engineering approval");
  }
  if (GLOBAL_STEEL_CORE_MODIFIED_FOR_AU_FORMULAS) {
    throw new Error("AU formulas must not live in the global steel core");
  }
}

function assertTensionDemand(input: SteelCapacityEngineInput): number {
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
    sourceSystem: AU_TENSION_TOOL_REF,
    sourceObjectId: input.designContext.designContextId,
    revision: AU_TENSION_IMPLEMENTATION_VERSION,
    status: "DEFINED",
    provenance: {
      ...input.designContext.provenanceRef,
      tool: AU_TENSION_TOOL_REF,
      version: AU_TENSION_IMPLEMENTATION_VERSION,
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
    toolRef: AU_TENSION_TOOL_REF,
    methodRef: methodId,
    validationState: "BENCHMARKED",
    llmOriginated: false,
  };
}

export function evaluateAuSteelTension(input: SteelCapacityEngineInput): SteelCapacityEngineOutput {
  assertLlmBoundary();
  if (input.adapterId !== "AU_STEEL") throw new Error("steel design fail closed: unsupported jurisdiction adapter");
  if (input.limitState !== "TENSION") throw new Error("steel design fail closed: unsupported calculation scope");
  assertAuSteelStandardProfile(input.standardContext);
  assertTensionDemand(input);
  if (!input.section.sectionFamily?.trim() || input.section.sectionFamily === "unknown") {
    throw new Error("steel design fail closed: unsupported section type");
  }
  if (input.section.catalogSource === "AUST300") {
    assertAust300NotGlobal(input.section.jurisdictionApplicability);
  }
  if (input.material.thicknessDependentMetadata && !input.material.yieldStrength?.provenanceRef) {
    throw new Error("steel design fail closed: missing material.yieldStrength");
  }
  assertNotCertified(AU_TENSION_GROSS_YIELD_RULE, input.designContext.validationState);
  for (const rule of AU_TENSION_METHOD_REGISTRY) {
    assertEngineeringRuleAuthority(rule.authorityType);
    assertNotCertified(rule, null);
  }

  const fy = assertGovernedProperty(input.material.yieldStrength, "material.yieldStrength");
  const fu = assertGovernedProperty(input.material.ultimateStrength, "material.ultimateStrength");
  const ag = assertGovernedProperty(input.section.area, "section.area");
  const an = assertGovernedProperty(input.section.netArea, "section.netArea");

  const agM2 = toAreaM2(ag, "section.area");
  const anM2 = toAreaM2(an, "section.netArea");
  if (anM2 > agM2) throw new Error("steel design fail closed: net area cannot exceed gross area");

  const grossYieldN = nominalTensionForceN(fy, ag, "material.yieldStrength", "section.area");
  const netFractureN = nominalTensionForceN(fu, an, "material.ultimateStrength", "section.netArea");
  const governingN = Math.min(grossYieldN, netFractureN);
  const governingMethodId = grossYieldN <= netFractureN ? AU_TENSION_GROSS_YIELD_RULE.methodId : AU_TENSION_NET_FRACTURE_RULE.methodId;

  const checks: SteelTensionCheckRecord[] = [
    {
      methodId: AU_TENSION_GROSS_YIELD_RULE.methodId,
      engineeringRuleRef: AU_TENSION_GROSS_YIELD_RULE.ruleId,
      capacityType: AU_TENSION_GROSS_YIELD_RULE.outputType,
      capacityValueN: grossYieldN,
      units: "N",
      technicalBasisRef: AU_TENSION_GROSS_YIELD_RULE.technicalBasisRef,
      standardProfileRef: input.standardContext.contextId,
      validationState: AU_TENSION_GROSS_YIELD_RULE.validationState,
      standardConformanceState: AU_TENSION_GROSS_YIELD_RULE.standardConformanceState,
    },
    {
      methodId: AU_TENSION_NET_FRACTURE_RULE.methodId,
      engineeringRuleRef: AU_TENSION_NET_FRACTURE_RULE.ruleId,
      capacityType: AU_TENSION_NET_FRACTURE_RULE.outputType,
      capacityValueN: netFractureN,
      units: "N",
      technicalBasisRef: AU_TENSION_NET_FRACTURE_RULE.technicalBasisRef,
      standardProfileRef: input.standardContext.contextId,
      validationState: AU_TENSION_NET_FRACTURE_RULE.validationState,
      standardConformanceState: AU_TENSION_NET_FRACTURE_RULE.standardConformanceState,
    },
  ];

  return {
    adapterId: "AU_STEEL",
    maturity: "BENCHMARKED",
    implemented: true,
    capacity: capacityIdentity(input, governingMethodId, governingN),
    reason: "AU tension nominal resistances from established engineering mechanics; intended AS 4100 profile; conformance not validated; capacity reduction factor not implemented",
    sourceAuthority: {
      authorityType: "VALIDATED_INTERNAL_ENGINEERING_RULE",
      identifier: AU_TENSION_GROSS_YIELD_RULE.ruleId,
      clauseRef: null,
      edition: input.standardContext.edition,
      licensedMetadataOnly: true,
    },
    tensionChecks: checks,
    governingMethodId,
    standardConformanceState: "INTENDED_PROFILE",
    implementationBindingState: "IMPLEMENTED_UNVERIFIED_STANDARD_BINDING",
  };
}

export function requestAuTensionDesignCapacityReduction(): never {
  return rejectUnknownCodeParameter("capacityReductionFactor");
}
