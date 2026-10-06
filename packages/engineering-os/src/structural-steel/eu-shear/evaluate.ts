import type {
  SteelCapacityEngineInput,
  SteelCapacityEngineOutput,
  SteelCheckVerdict,
  SteelShearCheckRecord,
  StructuralCapacityResult,
} from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  AXIAL_SHEAR_INTERACTION_IMPLEMENTED,
  BENDING_SHEAR_INTERACTION_IMPLEMENTED,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  CONNECTION_SHEAR_DESIGN_IMPLEMENTED,
  ELASTIC_SHEAR_BUCKLING_EQUALS_CODE_CAPACITY,
  EU_SHEAR_PARTIAL_FACTOR_SOURCE,
  EU_TENSION_FIELD_ACTION_IMPLEMENTED,
  GENERIC_SHEAR_MECHANICS_EQUALS_EN1993_CAPACITY,
  LLM_EU_SHEAR_CAPACITY_AUTHORITY,
  MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_CODE_CHECK,
  SECTION_CLASSIFICATION_STATE,
  SHEAR_REDUCTION_RULE_GUESSED,
  SILENT_SHEAR_AREA_ASSUMPTION,
  SILENT_STIFFENER_ASSUMPTION,
  TENSION_FIELD_ACTION_IMPLEMENTED,
} from "@rtb/types";
import { toStandardContextRef } from "../../structural-domain/binding";
import { assertAnnexCompatibleWithContext, resolveNdp } from "../eu-standard/annex";
import { denyNationalAnnexFromUserLocation } from "../eu-standard/authority";
import { assertAust300NotEuDefault } from "../eu-standard/catalogs";
import { toElasticModulusPa } from "../mechanics/euler";
import {
  assertShearAreaNotAssumed,
  bucklingCoefficient,
  bucklingContextRequested,
  demandShearN,
  elasticShearBucklingForceN,
  poissonRatio,
  toAreaM2,
  toLengthM,
  vonMisesShearYieldN,
} from "../mechanics/shear";
import { assertGovernedProperty } from "../properties";
import {
  assertEuShearRuleAuthority,
  assertMechanicsNotEn1993ShearCapacity,
  assertNotCertifiedEuShear,
  rejectUnknownEuShearCodeParameter,
} from "./authority";
import { createEuShearContext } from "./context";
import {
  EU_SECTION_SHEAR_CAPACITY_CODE_PROFILE_RULE,
  EU_SHEAR_ELASTIC_BUCKLING_MECHANICS_RULE,
  EU_SHEAR_ELASTIC_MAJOR_MECHANICS_RULE,
  EU_SHEAR_ELASTIC_MINOR_MECHANICS_RULE,
  EU_SHEAR_IMPLEMENTATION_VERSION,
  EU_SHEAR_METHOD_REGISTRY,
  EU_SHEAR_TOOL_REF,
} from "./registry";

function assertLlmBoundary(): void {
  if (LLM_EU_SHEAR_CAPACITY_AUTHORITY) throw new Error("AI cannot originate EU shear capacity");
  if (AI_ENGINEERING_APPROVAL || CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL) {
    throw new Error("check result must not equal engineering approval");
  }
  if (GENERIC_SHEAR_MECHANICS_EQUALS_EN1993_CAPACITY || ELASTIC_SHEAR_BUCKLING_EQUALS_CODE_CAPACITY) {
    throw new Error("generic shear mechanics must not be labelled EN 1993 capacity");
  }
  if (MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_CODE_CHECK) {
    throw new Error("mechanics-reference utilization must not be labelled as a Eurocode design check");
  }
  if (SILENT_SHEAR_AREA_ASSUMPTION) throw new Error("shear area must not be assumed silently");
  if (SILENT_STIFFENER_ASSUMPTION) throw new Error("stiffener state must not be assumed silently");
  if (EU_TENSION_FIELD_ACTION_IMPLEMENTED || TENSION_FIELD_ACTION_IMPLEMENTED) {
    throw new Error("tension-field action must not be implemented in EU-5");
  }
  if (BENDING_SHEAR_INTERACTION_IMPLEMENTED || AXIAL_SHEAR_INTERACTION_IMPLEMENTED || CONNECTION_SHEAR_DESIGN_IMPLEMENTED) {
    throw new Error("EU-5 must not implement interaction or connection shear");
  }
  if (SHEAR_REDUCTION_RULE_GUESSED) throw new Error("shear reduction rules must not be guessed");
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
    sourceSystem: EU_SHEAR_TOOL_REF,
    sourceObjectId: input.designContext.designContextId,
    revision: EU_SHEAR_IMPLEMENTATION_VERSION,
    status: "DEFINED",
    provenance: {
      ...input.designContext.provenanceRef,
      tool: EU_SHEAR_TOOL_REF,
      version: EU_SHEAR_IMPLEMENTATION_VERSION,
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
    toolRef: EU_SHEAR_TOOL_REF,
    methodRef: methodId,
    validationState: "BENCHMARKED",
    llmOriginated: false,
  };
}

function elasticCheck(
  input: SteelCapacityEngineInput,
  axis: "MAJOR_SHEAR" | "MINOR_SHEAR",
  valueN: number,
  stiffenerState: SteelShearCheckRecord["stiffenerState"],
  slenderness: number | null,
): SteelShearCheckRecord {
  const rule = axis === "MINOR_SHEAR" ? EU_SHEAR_ELASTIC_MINOR_MECHANICS_RULE : EU_SHEAR_ELASTIC_MAJOR_MECHANICS_RULE;
  return {
    methodId: rule.methodId,
    methodType: "ELASTIC_SHEAR_REFERENCE",
    engineeringRuleRef: rule.ruleId,
    capacityType: rule.outputType,
    resultClass: "MECHANICS_REFERENCE",
    axis,
    capacityValueN: valueN,
    units: "N",
    technicalBasisRef: rule.technicalBasisRef,
    standardProfileRef: input.standardContext.contextId,
    validationState: rule.validationState,
    standardConformanceState: rule.standardConformanceState,
    stiffenerState,
    webSlendernessRatio: slenderness,
  };
}

export function evaluateEuSteelShear(input: SteelCapacityEngineInput): SteelCapacityEngineOutput {
  assertLlmBoundary();
  if (input.adapterId !== "EU_STEEL") throw new Error("steel design fail closed: unsupported jurisdiction adapter");
  if (input.limitState !== "SHEAR" && input.limitState !== "SHEAR_MAJOR" && input.limitState !== "SHEAR_MINOR") {
    throw new Error("steel design fail closed: unsupported calculation scope");
  }
  denyNationalAnnexFromUserLocation("explicit");
  assertShearDemand(input);
  if (!input.section.sectionFamily?.trim() || input.section.sectionFamily === "unknown") {
    throw new Error("steel design fail closed: unsupported section type");
  }
  assertAust300NotEuDefault(input.section.catalogSource);
  assertNotCertifiedEuShear(input.designContext.validationState);
  const shearContext = createEuShearContext(input);
  if (input.eurocodeContext?.nationalAnnex) {
    assertAnnexCompatibleWithContext(input.eurocodeContext, input.eurocodeContext.nationalAnnex);
  }
  for (const rule of EU_SHEAR_METHOD_REGISTRY) {
    assertEuShearRuleAuthority(rule.authorityType);
    if (rule.methodType === "ENGINEERING_MECHANICS_REFERENCE") assertMechanicsNotEn1993ShearCapacity(rule);
  }

  const fy = assertGovernedProperty(input.material.yieldStrength, "material.yieldStrength");
  if (input.material.thicknessDependentMetadata && !input.material.yieldStrength?.provenanceRef) {
    throw new Error("steel design fail closed: missing material.yieldStrength");
  }
  const av = assertGovernedProperty(input.section.shearArea ?? null, "section.shearArea");
  assertShearAreaNotAssumed(false);
  if (/^ai$|^llm|ai-inferred|optimizer-inferred/i.test(av.provenanceRef)) {
    throw new Error("AI cannot supply missing shear parameters");
  }
  const yieldN = vonMisesShearYieldN(fy, av);
  const checks: SteelShearCheckRecord[] = [
    elasticCheck(input, shearContext.shearAxis, yieldN, shearContext.stiffenerContext, shearContext.webSlenderness.slendernessRatio),
  ];

  if (bucklingContextRequested(input)) {
    if (
      (shearContext.stiffenerContext === "TRANSVERSE_STIFFENED"
        || shearContext.stiffenerContext === "LONGITUDINALLY_STIFFENED"
        || shearContext.stiffenerContext === "MULTI_STIFFENED")
      && !input.shear?.stiffenerSpacing
    ) {
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
      methodId: EU_SHEAR_ELASTIC_BUCKLING_MECHANICS_RULE.methodId,
      methodType: "ELASTIC_SHEAR_BUCKLING_REFERENCE",
      engineeringRuleRef: EU_SHEAR_ELASTIC_BUCKLING_MECHANICS_RULE.ruleId,
      capacityType: EU_SHEAR_ELASTIC_BUCKLING_MECHANICS_RULE.outputType,
      resultClass: "MECHANICS_REFERENCE",
      axis: shearContext.shearAxis,
      capacityValueN: bucklingN,
      units: "N",
      technicalBasisRef: EU_SHEAR_ELASTIC_BUCKLING_MECHANICS_RULE.technicalBasisRef,
      standardProfileRef: shearContext.standardContextRef,
      validationState: EU_SHEAR_ELASTIC_BUCKLING_MECHANICS_RULE.validationState,
      standardConformanceState: EU_SHEAR_ELASTIC_BUCKLING_MECHANICS_RULE.standardConformanceState,
      stiffenerState: shearContext.stiffenerContext,
      webSlendernessRatio: shearContext.webSlenderness.slendernessRatio,
    });
  }

  const governing = checks.reduce((lowest, row) => (row.capacityValueN < lowest.capacityValueN ? row : lowest));
  const bucklingEvaluated = checks.some((row) => row.methodType === "ELASTIC_SHEAR_BUCKLING_REFERENCE");
  return {
    adapterId: "EU_STEEL",
    maturity: "BENCHMARKED",
    implemented: true,
    capacity: capacityIdentity(input, governing.methodId, governing.capacityValueN),
    reason: bucklingEvaluated
      ? "EU shear mechanics-reference von Mises yield and elastic plate buckling; intended EN 1993-1-1 profile; elastic shear buckling is not EN 1993 web resistance; Av, Vpl,Rd, web slenderness limits, and tension-field FRAMEWORK_ONLY"
      : "EU shear mechanics-reference von Mises yield PARTIAL; elastic shear buckling not evaluated; intended EN 1993-1-1 profile; not labelled as EN 1993 section shear resistance",
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

export function evaluateEuSteelShearCodeProfile(input: SteelCapacityEngineInput): never {
  const rule = EU_SECTION_SHEAR_CAPACITY_CODE_PROFILE_RULE;
  void EU_SHEAR_PARTIAL_FACTOR_SOURCE;
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
  return rejectUnknownEuShearCodeParameter("partial-factor");
}

export function euShearCodeProfileCheckState(input: SteelCapacityEngineInput): SteelCheckVerdict {
  try {
    evaluateEuSteelShearCodeProfile(input);
  } catch {
    return "CHECK_UNDETERMINED";
  }
}
