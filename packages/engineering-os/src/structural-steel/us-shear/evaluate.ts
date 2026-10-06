import type {
  SteelCapacityEngineInput,
  SteelCapacityEngineOutput,
  SteelCheckVerdict,
  SteelShearCheckRecord,
  StructuralCapacityResult,
} from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  DIRECT_CONTRACT_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE,
  ELASTIC_SHEAR_BUCKLING_EQUALS_AISC_WEB_STRENGTH,
  ELASTIC_SHEAR_EQUALS_AISC_SHEAR_STRENGTH,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  LLM_US_SHEAR_STRENGTH_AUTHORITY,
  MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_AISC_CHECK,
  SECTION_CLASSIFICATION_STATE,
  SILENT_US_SHEAR_AREA_ASSUMPTION,
  SILENT_US_STIFFENER_ASSUMPTION,
  US_AXIAL_SHEAR_INTERACTION_IMPLEMENTED,
  US_BENDING_SHEAR_INTERACTION_IMPLEMENTED,
  US_CONNECTION_SHEAR_DESIGN_IMPLEMENTED,
  US_SEISMIC_SHEAR_DESIGN_IMPLEMENTED,
  US_SHEAR_ASD_FACTOR_SOURCE,
  US_SHEAR_LRFD_FACTOR_SOURCE,
  US_SHEAR_REDUCTION_RULE_GUESSED,
  US_STIFFENER_DESIGN_IMPLEMENTED,
  US_TENSION_FIELD_ACTION_IMPLEMENTED,
} from "@rtb/types";
import { toStandardContextRef } from "../../structural-domain/binding";
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
import { assertAust300NotUsDefault, assertEuCatalogNotUsDefault } from "../us-standard/catalogs";
import {
  assertMechanicsNotAiscShearStrength,
  assertNotCertifiedUsShear,
  assertUsShearBoundaries,
  assertUsShearLrfdAsdFactorIsolation,
  assertUsShearRuleAuthority,
  rejectUnknownUsShearCodeParameter,
  requestUsShearAsdFactor,
  requestUsShearLrfdFactor,
  requestUsWebStabilityRule,
} from "./authority";
import { usShearElementClassificationState } from "./classification";
import { assertAiscShearEditionIsolation, createUsShearContext } from "./context";
import {
  US_SHEAR_ELASTIC_BUCKLING_MECHANICS_RULE,
  US_SHEAR_ELASTIC_MAJOR_MECHANICS_RULE,
  US_SHEAR_ELASTIC_MINOR_MECHANICS_RULE,
  US_SHEAR_IMPLEMENTATION_VERSION,
  US_SHEAR_METHOD_REGISTRY,
  US_SHEAR_TOOL_REF,
} from "./registry";

function assertLlmBoundary(): void {
  if (LLM_US_SHEAR_STRENGTH_AUTHORITY) throw new Error("AI cannot originate US shear strength");
  if (AI_ENGINEERING_APPROVAL || CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL) {
    throw new Error("check result must not equal engineering approval");
  }
  if (ELASTIC_SHEAR_EQUALS_AISC_SHEAR_STRENGTH || ELASTIC_SHEAR_BUCKLING_EQUALS_AISC_WEB_STRENGTH) {
    throw new Error("elastic shear mechanics must not be labelled AISC shear strength");
  }
  if (MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_AISC_CHECK) {
    throw new Error("mechanics-reference utilization must not be labelled as an AISC check");
  }
  if (GENERAL_FEA_CAPABILITY_CLAIMED) throw new Error("shear-member checks do not establish global frame adequacy");
  if (SILENT_US_SHEAR_AREA_ASSUMPTION) throw new Error("shear area must not be assumed silently");
  if (SILENT_US_STIFFENER_ASSUMPTION) throw new Error("stiffener state must not be assumed silently");
  if (US_TENSION_FIELD_ACTION_IMPLEMENTED || US_STIFFENER_DESIGN_IMPLEMENTED) {
    throw new Error("tension-field action and stiffener design must not be implemented in US-5");
  }
  if (US_BENDING_SHEAR_INTERACTION_IMPLEMENTED || US_AXIAL_SHEAR_INTERACTION_IMPLEMENTED || US_CONNECTION_SHEAR_DESIGN_IMPLEMENTED) {
    throw new Error("US-5 must not implement interaction or connection shear");
  }
  if (US_SEISMIC_SHEAR_DESIGN_IMPLEMENTED) throw new Error("seismic shear design must not be implemented in US-5");
  if (US_SHEAR_REDUCTION_RULE_GUESSED) throw new Error("shear reduction rules must not be guessed");
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
    sourceSystem: US_SHEAR_TOOL_REF,
    sourceObjectId: input.designContext.designContextId,
    revision: US_SHEAR_IMPLEMENTATION_VERSION,
    status: "DEFINED",
    provenance: {
      ...input.designContext.provenanceRef,
      tool: US_SHEAR_TOOL_REF,
      version: US_SHEAR_IMPLEMENTATION_VERSION,
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
    toolRef: US_SHEAR_TOOL_REF,
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
  const rule = axis === "MINOR_SHEAR" ? US_SHEAR_ELASTIC_MINOR_MECHANICS_RULE : US_SHEAR_ELASTIC_MAJOR_MECHANICS_RULE;
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

export function evaluateUsSteelShear(input: SteelCapacityEngineInput): SteelCapacityEngineOutput {
  assertLlmBoundary();
  assertUsShearBoundaries();
  if (input.adapterId !== "US_STEEL") throw new Error("steel design fail closed: unsupported jurisdiction adapter");
  if (input.limitState !== "SHEAR" && input.limitState !== "SHEAR_MAJOR" && input.limitState !== "SHEAR_MINOR") {
    throw new Error("steel design fail closed: unsupported calculation scope");
  }
  assertShearDemand(input);
  if (!input.section.sectionFamily?.trim() || input.section.sectionFamily === "unknown") {
    throw new Error("steel design fail closed: unsupported section type");
  }
  assertAust300NotUsDefault(input.section.catalogSource);
  assertEuCatalogNotUsDefault(input.section.catalogSource);
  assertNotCertifiedUsShear(input.designContext.validationState);
  const shearContext = createUsShearContext(input);
  if (DIRECT_CONTRACT_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE && shearContext.directContractProfile) {
    throw new Error("direct-contract AISC profile is not building-code compliance");
  }
  void usShearElementClassificationState();
  for (const rule of US_SHEAR_METHOD_REGISTRY) {
    assertUsShearRuleAuthority(rule.authorityType);
    if (rule.methodType === "ELASTIC_SHEAR_REFERENCE" || rule.methodType === "ELASTIC_SHEAR_BUCKLING_REFERENCE" || rule.methodType === "ENGINEERING_MECHANICS_REFERENCE") {
      assertMechanicsNotAiscShearStrength(rule);
    }
    assertAiscShearEditionIsolation(rule.aiscEditionRequirement, input.standardContext.edition);
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
    elasticCheck(input, shearContext.shearAxis, yieldN, shearContext.stiffenerContext, shearContext.webSlendernessContext.slendernessRatio),
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
      methodId: US_SHEAR_ELASTIC_BUCKLING_MECHANICS_RULE.methodId,
      methodType: "ELASTIC_SHEAR_BUCKLING_REFERENCE",
      engineeringRuleRef: US_SHEAR_ELASTIC_BUCKLING_MECHANICS_RULE.ruleId,
      capacityType: US_SHEAR_ELASTIC_BUCKLING_MECHANICS_RULE.outputType,
      resultClass: "MECHANICS_REFERENCE",
      axis: shearContext.shearAxis,
      capacityValueN: bucklingN,
      units: "N",
      technicalBasisRef: US_SHEAR_ELASTIC_BUCKLING_MECHANICS_RULE.technicalBasisRef,
      standardProfileRef: shearContext.standardContextRef,
      validationState: US_SHEAR_ELASTIC_BUCKLING_MECHANICS_RULE.validationState,
      standardConformanceState: US_SHEAR_ELASTIC_BUCKLING_MECHANICS_RULE.standardConformanceState,
      stiffenerState: shearContext.stiffenerContext,
      webSlendernessRatio: shearContext.webSlendernessContext.slendernessRatio,
    });
  }

  const governing = checks.reduce((lowest, row) => (row.capacityValueN < lowest.capacityValueN ? row : lowest));
  const bucklingEvaluated = checks.some((row) => row.methodType === "ELASTIC_SHEAR_BUCKLING_REFERENCE");
  return {
    adapterId: "US_STEEL",
    maturity: "BENCHMARKED",
    implemented: true,
    capacity: capacityIdentity(input, governing.methodId, governing.capacityValueN),
    reason: bucklingEvaluated
      ? `US shear mechanics-reference von Mises yield and elastic plate buckling; intended AISC 360 profile; ${shearContext.designMethod}; elastic shear buckling is not AISC Vn; Av rule, web slenderness limits, Cv, tension-field, and φv/Ωv FRAMEWORK_ONLY`
      : `US shear mechanics-reference von Mises yield PARTIAL; elastic shear buckling not evaluated; intended AISC 360 profile; ${shearContext.designMethod}; not labelled as AISC shear strength`,
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

export function evaluateUsSteelShearCodeProfile(input: SteelCapacityEngineInput): never {
  const context = createUsShearContext(input);
  void US_SHEAR_LRFD_FACTOR_SOURCE;
  void US_SHEAR_ASD_FACTOR_SOURCE;
  if (context.designMethod === "LRFD") {
    assertUsShearLrfdAsdFactorIsolation("LRFD", "phi_v");
    requestUsWebStabilityRule();
    return requestUsShearLrfdFactor();
  }
  if (context.designMethod === "ASD") {
    assertUsShearLrfdAsdFactorIsolation("ASD", "Omega_v");
    requestUsWebStabilityRule();
    return requestUsShearAsdFactor();
  }
  return rejectUnknownUsShearCodeParameter("designMethod");
}

export function usShearCodeProfileCheckState(input: SteelCapacityEngineInput): SteelCheckVerdict {
  try {
    evaluateUsSteelShearCodeProfile(input);
  } catch {
    return "CHECK_UNDETERMINED";
  }
  return "CHECK_UNDETERMINED";
}
