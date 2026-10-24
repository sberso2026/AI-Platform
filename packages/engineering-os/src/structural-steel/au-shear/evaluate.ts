import type {
  SteelCapacityEngineInput,
  SteelCapacityEngineOutput,
  SteelShearCheckRecord,
  StructuralCapacityResult,
} from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  BENDING_SHEAR_INTERACTION_IMPLEMENTED,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  CONNECTION_SHEAR_DESIGN_IMPLEMENTED,
  ELASTIC_SHEAR_BUCKLING_EQUALS_CODE_CAPACITY,
  GLOBAL_STEEL_CORE_MODIFIED_FOR_AU_FORMULAS,
  INTERACTION_REVIEW_REQUIRED,
  LLM_SHEAR_CAPACITY_AUTHORITY,
  LLM_STEEL_CAPACITY_AUTHORITY,
  MECHANICS_REFERENCE_EQUALS_CODE_CAPACITY,
  SECTION_CLASSIFICATION_STATE,
  SILENT_SHEAR_AREA_ASSUMPTION,
  TENSION_FIELD_ACTION_IMPLEMENTED,
} from "@rtb/types";
import { toStandardContextRef } from "../../structural-domain/binding";
import { assertAust300NotGlobal } from "../aust300";
import { assertGovernedProperty } from "../properties";
import { assertEngineeringRuleAuthority } from "../au-tension/authority";
import { assertNotCertified } from "../au-tension/confirmation";
import { assertAuSteelStandardProfile } from "../au-tension/profile";
import { toAreaM2 } from "../au-tension/units";
import { bucklingContextRequested, toAuShearContext } from "./context";
import {
  AU_SHEAR_BUCKLING_RULE,
  AU_SHEAR_IMPLEMENTATION_VERSION,
  AU_SHEAR_METHOD_REGISTRY,
  AU_SHEAR_TOOL_REF,
  AU_SHEAR_YIELD_RULE,
} from "./registry";
import {
  bucklingCoefficient,
  demandShearN,
  elasticShearBucklingForceN,
  poissonRatio,
  toElasticModulusPa,
  toLengthM,
  vonMisesShearYieldN,
} from "./units";

function assertLlmBoundary(): void {
  if (LLM_STEEL_CAPACITY_AUTHORITY || LLM_SHEAR_CAPACITY_AUTHORITY) throw new Error("AI cannot originate capacity");
  if (AI_ENGINEERING_APPROVAL || CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL) {
    throw new Error("check result must not equal engineering approval");
  }
  if (GLOBAL_STEEL_CORE_MODIFIED_FOR_AU_FORMULAS) throw new Error("AU formulas must not live in the global steel core");
  if (ELASTIC_SHEAR_BUCKLING_EQUALS_CODE_CAPACITY || MECHANICS_REFERENCE_EQUALS_CODE_CAPACITY) {
    throw new Error("mechanics-reference result must not be labelled code capacity");
  }
  if (SILENT_SHEAR_AREA_ASSUMPTION) throw new Error("shear area must not be assumed silently");
  if (TENSION_FIELD_ACTION_IMPLEMENTED) throw new Error("tension-field action must not be implemented in AU-4");
  if (BENDING_SHEAR_INTERACTION_IMPLEMENTED || CONNECTION_SHEAR_DESIGN_IMPLEMENTED) {
    throw new Error("AU-4 must not implement interaction or connection shear");
  }
  if (!INTERACTION_REVIEW_REQUIRED) throw new Error("interaction review must remain required until AU-5");
}

function assertShearDemand(input: SteelCapacityEngineInput): number {
  if (!input.demand.resultId) throw new Error("steel design fail closed: demand missing");
  if (input.demand.capacityPresent) throw new Error("D1C demand must not contain capacity");
  const shear = input.demand.shear;
  if (!shear || !shear.unit?.trim() || !Number.isFinite(shear.value)) {
    throw new Error("steel design fail closed: demand missing");
  }
  return demandShearN(shear);
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
    sourceSystem: AU_SHEAR_TOOL_REF,
    sourceObjectId: input.designContext.designContextId,
    revision: AU_SHEAR_IMPLEMENTATION_VERSION,
    status: "DEFINED",
    provenance: {
      ...input.designContext.provenanceRef,
      tool: AU_SHEAR_TOOL_REF,
      version: AU_SHEAR_IMPLEMENTATION_VERSION,
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
    toolRef: AU_SHEAR_TOOL_REF,
    methodRef: methodId,
    validationState: "BENCHMARKED",
    llmOriginated: false,
  };
}

export function evaluateAuSteelShear(input: SteelCapacityEngineInput): SteelCapacityEngineOutput {
  assertLlmBoundary();
  if (input.adapterId !== "AU_STEEL") throw new Error("steel design fail closed: unsupported jurisdiction adapter");
  if (input.limitState !== "SHEAR" && input.limitState !== "SHEAR_MAJOR" && input.limitState !== "SHEAR_MINOR") {
    throw new Error("steel design fail closed: unsupported calculation scope");
  }
  assertAuSteelStandardProfile(input.standardContext);
  assertShearDemand(input);
  if (!input.section.sectionFamily?.trim() || input.section.sectionFamily === "unknown") {
    throw new Error("steel design fail closed: unsupported section type");
  }
  if (input.section.catalogSource === "AUST300") assertAust300NotGlobal(input.section.jurisdictionApplicability);
  if (input.material.thicknessDependentMetadata && !input.material.yieldStrength?.provenanceRef) {
    throw new Error("steel design fail closed: missing material.yieldStrength");
  }
  for (const rule of AU_SHEAR_METHOD_REGISTRY) {
    assertEngineeringRuleAuthority(rule.authorityType);
    assertNotCertified(rule, input.designContext.validationState);
  }

  const ctx = toAuShearContext(input);
  const fy = assertGovernedProperty(input.material.yieldStrength, "material.yieldStrength");
  const av = assertGovernedProperty(input.section.shearArea ?? null, "section.shearArea");
  if (/^ai$|^llm|ai-inferred|optimizer-inferred/i.test(av.provenanceRef)) {
    throw new Error("AI cannot supply missing shear parameters");
  }
  const yieldN = vonMisesShearYieldN(fy, av);
  const checks: SteelShearCheckRecord[] = [
    {
      methodId: AU_SHEAR_YIELD_RULE.methodId,
      methodType: "ELASTIC_SHEAR_REFERENCE",
      engineeringRuleRef: AU_SHEAR_YIELD_RULE.ruleId,
      capacityType: AU_SHEAR_YIELD_RULE.outputType,
      resultClass: "MECHANICS_REFERENCE",
      axis: ctx.shearAxis,
      capacityValueN: yieldN,
      units: "N",
      technicalBasisRef: AU_SHEAR_YIELD_RULE.technicalBasisRef,
      standardProfileRef: input.standardContext.contextId,
      validationState: AU_SHEAR_YIELD_RULE.validationState,
      standardConformanceState: AU_SHEAR_YIELD_RULE.standardConformanceState,
      stiffenerState: ctx.stiffenerState,
      webSlendernessRatio: ctx.webSlenderness.slendernessRatio,
    },
  ];

  if (bucklingContextRequested(input)) {
    if (ctx.stiffenerState === "TRANSVERSE_STIFFENED" && !input.shear?.stiffenerSpacing) {
      throw new Error("steel design fail closed: missing shear.stiffenerSpacing");
    }
    const e = assertGovernedProperty(input.material.elasticModulus, "material.elasticModulus");
    const nuProp = assertGovernedProperty(input.material.poissonRatio, "material.poissonRatio");
    const depth = assertGovernedProperty(input.section.webDepth ?? null, "section.webDepth");
    const thickness = assertGovernedProperty(input.section.webThickness ?? null, "section.webThickness");
    const kvProp = assertGovernedProperty(input.shear?.shearBucklingCoefficient ?? null, "shear.shearBucklingCoefficient");
    const bucklingN = elasticShearBucklingForceN({
      EPa: toElasticModulusPa(e, "material.elasticModulus"),
      poisson: poissonRatio(nuProp, "material.poissonRatio"),
      kv: bucklingCoefficient(kvProp),
      webDepthM: toLengthM(depth, "section.webDepth"),
      webThicknessM: toLengthM(thickness, "section.webThickness"),
      shearAreaM2: toAreaM2(av, "section.shearArea"),
    });
    checks.push({
      methodId: AU_SHEAR_BUCKLING_RULE.methodId,
      methodType: "ELASTIC_SHEAR_BUCKLING_REFERENCE",
      engineeringRuleRef: AU_SHEAR_BUCKLING_RULE.ruleId,
      capacityType: AU_SHEAR_BUCKLING_RULE.outputType,
      resultClass: "MECHANICS_REFERENCE",
      axis: ctx.shearAxis,
      capacityValueN: bucklingN,
      units: "N",
      technicalBasisRef: AU_SHEAR_BUCKLING_RULE.technicalBasisRef,
      standardProfileRef: input.standardContext.contextId,
      validationState: AU_SHEAR_BUCKLING_RULE.validationState,
      standardConformanceState: AU_SHEAR_BUCKLING_RULE.standardConformanceState,
      stiffenerState: ctx.stiffenerState,
      webSlendernessRatio: ctx.webSlenderness.slendernessRatio,
    });
  }

  const governing = checks.reduce((lowest, row) => (row.capacityValueN < lowest.capacityValueN ? row : lowest));
  const bucklingEvaluated = checks.some((row) => row.methodType === "ELASTIC_SHEAR_BUCKLING_REFERENCE");
  return {
    adapterId: "AU_STEEL",
    maturity: "BENCHMARKED",
    implemented: true,
    capacity: capacityIdentity(input, governing.methodId, governing.capacityValueN),
    reason: bucklingEvaluated
      ? "AU shear mechanics-reference von Mises yield and elastic plate buckling; intended AS 4100 profile; design-code shear capacity VALIDATION_REQUIRED; not labelled as code shear capacity"
      : "AU shear mechanics-reference von Mises yield PARTIAL; elastic shear buckling not evaluated; intended AS 4100 profile; design-code shear capacity VALIDATION_REQUIRED; not labelled as code shear capacity",
    sourceAuthority: {
      authorityType: "VALIDATED_INTERNAL_ENGINEERING_RULE",
      identifier: governing.engineeringRuleRef,
      clauseRef: null,
      edition: input.standardContext.edition,
      licensedMetadataOnly: true,
    },
    shearChecks: checks,
    governingMethodId: governing.methodId,
    standardConformanceState: "INTENDED_PROFILE",
    implementationBindingState: "IMPLEMENTED_UNVERIFIED_STANDARD_BINDING",
    resultClass: "MECHANICS_REFERENCE",
    designCapacityState: "VALIDATION_REQUIRED",
    sectionClassificationState: SECTION_CLASSIFICATION_STATE,
    interactionReviewRequired: true,
  };
}
