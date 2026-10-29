import type {
  SteelCapacityEngineInput,
  SteelCapacityEngineOutput,
  SteelTensionCheckRecord,
  StructuralCapacityResult,
} from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  EU_PARTIAL_FACTOR_SOURCE,
  GENERIC_MECHANICS_EQUALS_EN1993_CAPACITY,
  LLM_EU_TENSION_CAPACITY_AUTHORITY,
  SILENT_NET_AREA_EQUALS_GROSS_AREA,
} from "@rtb/types";
import { toStandardContextRef } from "../../structural-domain/binding";
import { assertAnnexCompatibleWithContext, resolveNdp } from "../eu-standard/annex";
import { denyNationalAnnexFromUserLocation } from "../eu-standard/authority";
import { assertAust300NotEuDefault } from "../eu-standard/catalogs";
import { nominalTensionForceN, toAreaM2 } from "../mechanics/tension-force";
import { assertGovernedProperty } from "../properties";
import {
  assertEuTensionRuleAuthority,
  assertMechanicsNotEurocodeCapacity,
  assertNotCertifiedEuTension,
  rejectUnknownEuCodeParameter,
} from "./authority";
import { createEuTensionContext } from "./context";
import {
  EU_TENSION_GROSS_YIELD_CODE_PROFILE_RULE,
  EU_TENSION_GROSS_YIELD_MECHANICS_RULE,
  EU_TENSION_IMPLEMENTATION_VERSION,
  EU_TENSION_METHOD_REGISTRY,
  EU_TENSION_NET_FRACTURE_CODE_PROFILE_RULE,
  EU_TENSION_NET_FRACTURE_MECHANICS_RULE,
  EU_TENSION_TOOL_REF,
} from "./registry";

function assertLlmBoundary(): void {
  if (LLM_EU_TENSION_CAPACITY_AUTHORITY) throw new Error("AI cannot originate EU tension capacity");
  if (AI_ENGINEERING_APPROVAL || CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL) {
    throw new Error("check result must not equal engineering approval");
  }
  if (GENERIC_MECHANICS_EQUALS_EN1993_CAPACITY) {
    throw new Error("generic mechanics must not be labelled EN 1993 capacity");
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
    sourceSystem: EU_TENSION_TOOL_REF,
    sourceObjectId: input.designContext.designContextId,
    revision: EU_TENSION_IMPLEMENTATION_VERSION,
    status: "DEFINED",
    provenance: {
      ...input.designContext.provenanceRef,
      tool: EU_TENSION_TOOL_REF,
      version: EU_TENSION_IMPLEMENTATION_VERSION,
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
    toolRef: EU_TENSION_TOOL_REF,
    methodRef: methodId,
    validationState: "BENCHMARKED",
    llmOriginated: false,
  };
}

export function evaluateEuSteelTension(input: SteelCapacityEngineInput): SteelCapacityEngineOutput {
  assertLlmBoundary();
  if (input.adapterId !== "EU_STEEL") throw new Error("steel design fail closed: unsupported jurisdiction adapter");
  if (input.limitState !== "TENSION") throw new Error("steel design fail closed: unsupported calculation scope");
  denyNationalAnnexFromUserLocation("explicit");
  tensileDemandN(input);
  if (!input.section.sectionFamily?.trim() || input.section.sectionFamily === "unknown") {
    throw new Error("steel design fail closed: unsupported section type");
  }
  assertAust300NotEuDefault(input.section.catalogSource);
  assertNotCertifiedEuTension(input.designContext.validationState);
  const tensionContext = createEuTensionContext(input);
  if (input.eurocodeContext?.nationalAnnex) {
    assertAnnexCompatibleWithContext(input.eurocodeContext, input.eurocodeContext.nationalAnnex);
  }
  for (const rule of EU_TENSION_METHOD_REGISTRY) {
    assertEuTensionRuleAuthority(rule.authorityType);
    if (rule.methodType === "ENGINEERING_MECHANICS_REFERENCE") assertMechanicsNotEurocodeCapacity(rule);
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
    ? EU_TENSION_GROSS_YIELD_MECHANICS_RULE.methodId
    : EU_TENSION_NET_FRACTURE_MECHANICS_RULE.methodId;

  const checks: SteelTensionCheckRecord[] = [
    {
      methodId: EU_TENSION_GROSS_YIELD_MECHANICS_RULE.methodId,
      engineeringRuleRef: EU_TENSION_GROSS_YIELD_MECHANICS_RULE.ruleId,
      capacityType: EU_TENSION_GROSS_YIELD_MECHANICS_RULE.outputType,
      capacityValueN: grossYieldN,
      units: "N",
      technicalBasisRef: EU_TENSION_GROSS_YIELD_MECHANICS_RULE.technicalBasisRef,
      standardProfileRef: tensionContext.standardContextRef,
      validationState: EU_TENSION_GROSS_YIELD_MECHANICS_RULE.validationState,
      standardConformanceState: EU_TENSION_GROSS_YIELD_MECHANICS_RULE.standardConformanceState,
    },
    {
      methodId: EU_TENSION_NET_FRACTURE_MECHANICS_RULE.methodId,
      engineeringRuleRef: EU_TENSION_NET_FRACTURE_MECHANICS_RULE.ruleId,
      capacityType: EU_TENSION_NET_FRACTURE_MECHANICS_RULE.outputType,
      capacityValueN: netFractureN,
      units: "N",
      technicalBasisRef: EU_TENSION_NET_FRACTURE_MECHANICS_RULE.technicalBasisRef,
      standardProfileRef: tensionContext.standardContextRef,
      validationState: EU_TENSION_NET_FRACTURE_MECHANICS_RULE.validationState,
      standardConformanceState: EU_TENSION_NET_FRACTURE_MECHANICS_RULE.standardConformanceState,
    },
  ];

  return {
    adapterId: "EU_STEEL",
    maturity: "BENCHMARKED",
    implemented: true,
    capacity: capacityIdentity(input, governingMethodId, governingN),
    reason: "EU tension nominal resistances from established engineering mechanics; intended EN 1993-1-1 profile; conformance not validated; Eurocode-profile partial factors not implemented",
    sourceAuthority: {
      authorityType: "VALIDATED_INTERNAL_ENGINEERING_RULE",
      identifier: EU_TENSION_GROSS_YIELD_MECHANICS_RULE.ruleId,
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

export function evaluateEuSteelTensionCodeProfile(input: SteelCapacityEngineInput): SteelCapacityEngineOutput {
  const rule = EU_TENSION_GROSS_YIELD_CODE_PROFILE_RULE;
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
  void EU_TENSION_NET_FRACTURE_CODE_PROFILE_RULE;
  void EU_PARTIAL_FACTOR_SOURCE;
  return rejectUnknownEuCodeParameter("partial-factor");
}

export function requestEuTensionPartialFactor(): never {
  return rejectUnknownEuCodeParameter("partial-factor");
}
