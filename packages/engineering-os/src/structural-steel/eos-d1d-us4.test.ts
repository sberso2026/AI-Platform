import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_CB_FACTOR_AUTHORITY,
  AI_ELEMENT_CLASSIFICATION_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_FACTOR_AUTHORITY,
  AI_LTB_RESTRAINT_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AI_UNBRACED_LENGTH_AUTHORITY,
  AI_US_BENDING_ASSISTANCE_ADVISORY_ONLY,
  AISC_UNKNOWN_EDITION_TOKEN,
  AU_CODE_RULES_REUSED_AS_US_RULES,
  AUTOMATIC_ENGINEERING_APPROVAL,
  BENCHMARK_EQUALS_AISC_CONFORMANCE,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  COMMON_BENDING_BENCHMARK_EQUALS_AISC_CONFORMANCE,
  COMMON_BENDING_MECHANICS_SHARED_ACROSS_LRFD_ASD,
  COMMON_STEEL_FRAMEWORK_REUSED,
  DEFAULT_LRFD_OR_ASD,
  DEFLECTION_ENGINE_DUPLICATED,
  DIRECT_CONTRACT_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE,
  ELASTIC_BENDING_EQUALS_AISC_FLEXURAL_STRENGTH,
  ELASTIC_LTB_EQUALS_AISC_FLEXURAL_STRENGTH,
  EOS_D1D_US4_PHASE,
  EU_CODE_RULES_REUSED_AS_US_RULES,
  EU_ONLY_STEEL_CORE,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  GENERIC_SUPPORT_AUTOMATICALLY_DEFINES_LTB_RESTRAINT,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  LLM_US_BENDING_STRENGTH_AUTHORITY,
  LRFD_ASD_BENDING_MECHANICS_DUPLICATED,
  MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_AISC_CHECK,
  PARALLEL_US_BENDING_CORE_CREATED,
  PLASTIC_CAPACITY_ASSUMED_WITHOUT_CLASSIFICATION,
  SCHEMA_CHANGE_REQUIRED_FOR_US4,
  SILENT_AISC_EDITION_INFERENCE,
  SILENT_LRFD_ASD_CONVERSION,
  SILENT_UNBRACED_LENGTH_ASSUMPTION,
  SILENT_US_LTB_RESTRAINT_ASSUMPTION,
  SILENT_US_UNBRACED_LENGTH_ASSUMPTION,
  STRUCTURAL_STANDARD_TEXT_EMBEDDED,
  US1_STANDARD_BINDING_REUSED,
  US2_DESIGN_METHOD_ARCHITECTURE_REUSED,
  US3_STABILITY_ARCHITECTURE_REUSED,
  US4_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK,
  US_BENDING_ASD_FACTOR_GUESSED,
  US_BENDING_ASD_FACTOR_SOURCE,
  US_BENDING_CLASSIFICATION_LIMIT_GUESSED,
  US_BENDING_DEFLECTION_ENGINE_DUPLICATED,
  US_BENDING_HUMAN_VALIDATION_REQUIRED,
  US_BENDING_INDEPENDENT_BENCHMARK_STATE,
  US_BENDING_LRFD_FACTOR_GUESSED,
  US_BENDING_LRFD_FACTOR_SOURCE,
  US_BENDING_STRENGTH_RESULT_STATE,
  US_CB_FACTOR_GUESSED,
  US_CB_FACTOR_SOURCE,
  US_COMBINED_ACTION_IMPLEMENTED,
  US_CONNECTION_BENDING_DESIGN_IMPLEMENTED,
  US_LOCAL_BUCKLING_RULE_GUESSED,
  US_LTB_STRENGTH_RULE_GUESSED,
  US_LTB_TRANSITION_PARAMETER_GUESSED,
  US_MEMBER_BENDING_EQUALS_GLOBAL_FRAME_VALIDATION,
  US_OPTIMIZATION_ACCEPTS_UNDETERMINED_BENDING,
  US_SEISMIC_BENDING_DESIGN_IMPLEMENTED,
  US_SHEAR_DESIGN_IMPLEMENTED,
  US_STEEL_IMPLEMENTATION_MATURITY,
  US_STEEL_PACK_CERTIFIED,
  US_TORSIONAL_DESIGN_IMPLEMENTED,
  UNKNOWN_US_BENDING_CODE_PARAMETER_GUESSED,
  type BuildingCodeAdoptionContext,
  type EurocodeNationalAnnex,
  type EurocodeSteelDesignContext,
  type SteelCapacityEngineInput,
  type SteelDesignContext,
  type SteelMaterialDesignProperties,
  type SteelSectionDesignProperties,
  type SteelStabilityContext,
  type StructuralStandardContext,
  type USSteelDesignContext,
  type UsStabilityAnalysisContext,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import {
  AU_EU_BENDING_IMPLEMENTATION_REVIEW,
  AU_METHOD_VALIDATION_INVENTORY,
  AU_STEEL_VALIDATION_MATRIX,
  D1D_US4_D0_RISK_DISPOSITION,
  EU_METHOD_VALIDATION_INVENTORY,
  EU_STEEL_VALIDATION_MATRIX,
  FRAMEWORK_ONLY_US_BENDING_METHODS,
  IMPLEMENTED_EU_INTERACTION_METHODS,
  IMPLEMENTED_INTERACTION_METHODS,
  IMPLEMENTED_US_BENDING_METHODS,
  IMPLEMENTED_US_COMPRESSION_METHODS,
  IMPLEMENTED_US_TENSION_METHODS,
  STEEL_ADAPTER_BOUNDARIES,
  US_BENDING_LOCAL_BUCKLING_FRAMEWORK_STATE,
  US_BENDING_METHOD_REGISTRY,
  US_FLEXURAL_BEHAVIOR_CONTEXT,
  US_LTB_TRANSITION_PARAMETER_CONTEXT,
  US_STEEL_IMPLEMENTATION_SUBPHASES,
  assertAiscBendingEditionIsolation,
  assertAiCannotInventLtb,
  assertOptimizationUsBendingRecheck,
  assertPlasticCapacityNotAssumedWithoutClassification,
  assertSupportDoesNotDefineLtbRestraint,
  assertUsBendingLrfdAsdFactorIsolation,
  assertUsMemberBendingNotGlobalFrame,
  assertUsMixedAuthorityBendingComparison,
  classifyUsBendingElement,
  consumeD1cDeflectionHandoff,
  consumeDemandHandoff,
  createAuSteelStandardProfile,
  denyAiUsBendingClassification,
  denyAiUsBendingFactor,
  denyAiUsBendingStrength,
  denyAiUsCbFactor,
  denyAiUsConformanceClaim,
  denyAiUsLtbRestraint,
  denyAiUsLtbRule,
  denyAiUsUnbracedLength,
  elasticLtbMomentNm,
  evaluateSteelCapacity,
  evaluateUsSteelBendingCodeProfile,
  firstYieldMomentNm,
  orchestrateUsBendingDesignCheck,
  requestUsBendingAsdFactor,
  requestUsBendingClassificationLimits,
  requestUsBendingLrfdFactor,
  requestUsCbFactor,
  requestUsLocalBucklingRule,
  requestUsLpLr,
  requestUsLtbStrengthRule,
  scoreUsBendingBenchmark,
  toElasticModulusPa,
  toSecondMomentM4,
  toWarpingM6,
  unknownEurocodeVersion,
  usBendingClassificationContext,
  usBendingCodeProfileCheckState,
  usBendingElementClassificationState,
} from "./index";

const here = dirname(fileURLToPath(import.meta.url));

function adoption(overrides: Partial<BuildingCodeAdoptionContext> = {}): BuildingCodeAdoptionContext {
  return {
    adoptionId: "adopt-ca-ibc",
    jurisdiction: "california",
    adoptingAuthority: "state-of-california",
    buildingCodeFamily: "IBC",
    buildingCodeEdition: "UNKNOWN_PENDING_CONFIRMATION",
    effectiveDate: null,
    localAmendmentSetRef: null,
    referencedStandards: ["AISC 360", "ASCE 7"],
    projectOverrideRefs: [],
    validationState: "FRAMEWORK_ONLY",
    sourceAuthorityRef: "metadata-reference-only",
    ...overrides,
  };
}

function usSteel(overrides: Partial<USSteelDesignContext> = {}): USSteelDesignContext {
  return {
    contextId: "ctx-us-bending",
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-us4",
    assetId: "asset-1",
    jurisdictionProfileRef: "united-states",
    buildingCodeAdoptionRef: "adopt-ca-ibc",
    buildingCodeAdoption: adoption(),
    steelStandardFamily: "AISC",
    steelStandardId: "AISC_360",
    steelStandardCode: "AISC 360",
    edition: AISC_UNKNOWN_EDITION_TOKEN,
    amendmentErrataState: AISC_UNKNOWN_EDITION_TOKEN,
    designMethod: "LRFD",
    unitSystem: "US_CUSTOMARY",
    referencedStandardRefs: ["ASCE 7"],
    localAmendmentSetRef: null,
    localAmendment: null,
    loadStandard: {
      standardId: "ASCE_7",
      standardCode: "ASCE 7",
      edition: AISC_UNKNOWN_EDITION_TOKEN,
      combinationBasis: "UNKNOWN_PENDING_CONFIRMATION",
      implemented: false,
    },
    seismicApplicable: false,
    seismicStandard: null,
    connectionStandardRefs: ["RCSC", "AISC 358"],
    materialSourceKind: "PROJECT_SPECIFICATION",
    sectionCatalogRef: null,
    projectStandardContextRef: "proj-us4",
    calculationContextRef: "calc-us4",
    engineeringRuleAuthorityRefs: ["VALIDATED_ENGINEERING_REFERENCE"],
    projectOverride: null,
    sourcePrecedence: ["MANDATORY_ADOPTED_CODE", "REFERENCED_STANDARD"],
    intendedStandardProfile: "AISC360",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: "us4:bending",
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
    directContractProfile: false,
    ...overrides,
  };
}

function usStability(overrides: Partial<UsStabilityAnalysisContext> = {}): UsStabilityAnalysisContext {
  return { method: "EFFECTIVE_LENGTH_BASED", secondOrder: "FIRST_ORDER", mixedMethods: false, ...overrides };
}

function usStandard(id = "ctx-aisc-us4"): StructuralStandardContext {
  return createConfiguredKnowledgeContext({
    contextId: id,
    jurisdictionProfileRef: "united-states",
    standardFamily: "AISC",
    standardCode: "AISC 360",
    edition: AISC_UNKNOWN_EDITION_TOKEN,
    materialScope: "steel",
  });
}

function demand(context: StructuralStandardContext, valueNm = 100_000): SteelCapacityEngineInput["demand"] {
  return {
    resultId: "demand-us4",
    memberId: "m-us4",
    shear: { value: 0, unit: "N", locationM: 0, signed: 0 },
    moment: { value: valueNm, unit: "N.m", locationM: 4, signed: valueNm },
    axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "D1C deflection handoff; not recalculated in US bending" },
    capacityPresent: false,
    standardContext: context,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c", sourceKind: "calculation", reference: "d1c-moment" }],
    combinationId: "comb-us4",
  };
}

function material(patch: Partial<SteelMaterialDesignProperties> = {}): SteelMaterialDesignProperties {
  return {
    materialRef: "mat-us4",
    grade: "A992",
    yieldStrength: { name: "Fy", value: 300, unit: "MPa", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    ultimateStrength: { name: "Fu", value: 450, unit: "MPa", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    elasticModulus: { name: "E", value: 200, unit: "GPa", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    shearModulus: { name: "G", value: 80, unit: "GPa", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    poissonRatio: null,
    density: null,
    thicknessDependentMetadata: null,
    jurisdictionApplicability: ["united-states"],
    ...patch,
  };
}

function section(patch: Partial<SteelSectionDesignProperties> = {}): SteelSectionDesignProperties {
  return {
    sectionRef: "sec-us4",
    sectionFamily: "W",
    catalogSource: "ENGINEER_SUPPLIED",
    catalogVersion: null,
    jurisdictionApplicability: ["united-states"],
    area: { name: "Ag", value: 5140, unit: "mm2", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Iyy: { name: "Iyy", value: 100_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Izz: { name: "Izz", value: 20_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    sectionModulusYy: { name: "Sx", value: 1_000_000, unit: "mm3", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    sectionModulusZz: { name: "Sy", value: 200_000, unit: "mm3", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    plasticModulusYy: { name: "Zx", value: 1_120_000, unit: "mm3", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    plasticModulusZz: null,
    torsionConstant: { name: "J", value: 500_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    warpingConstant: { name: "Cw", value: 200_000_000_000, unit: "mm6", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    radiusOfGyrationYy: null,
    radiusOfGyrationZz: null,
    netArea: null,
    geometricDimensions: {},
    ...patch,
  };
}

function stability(patch: Partial<SteelStabilityContext> = {}): SteelStabilityContext {
  return {
    stabilityContextId: "stab-us4",
    memberLengthM: 8,
    effectiveLengthM: null,
    unbracedLengthM: 8,
    restraintDescription: "discrete lateral and torsional restraint, explicit Lu",
    bucklingAxis: "MAJOR",
    momentGradientRef: "uniform-moment-governed",
    torsionalRestraint: "full-torsional-restraint",
    lateralRestraint: "full-lateral-restraint",
    sourceEvidenceRef: "engineer-unbraced-length",
    derived: false,
    unbracedLengthProvenanceRef: "engineer-unbraced-length",
    warpingRestraint: "warping-free",
    momentDistributionDescription: "uniform moment, no modification applied",
    loadApplicationPosition: "shear-centre",
    ...patch,
  };
}

function designContext(context: StructuralStandardContext): SteelDesignContext {
  return {
    designContextId: "dc-us4",
    memberRef: "m-us4",
    sectionRef: "sec-us4",
    materialRef: "mat-us4",
    demandRefs: ["demand-us4"],
    standardContextRef: context.contextId,
    parameterSetRef: null,
    effectiveLengthContextRef: null,
    restraintContextRef: "stab-us4",
    stabilityContextRef: "stab-us4",
    fabricationContextRef: null,
    evidenceRefs: [{ evidenceId: "ev-eng", sourceKind: "human_input", reference: "engineer" }],
    toolRef: "EOS_US_STEEL_BENDING",
    methodRef: "US_BENDING",
    provenanceRef: governedProvenance({ jurisdiction: "united-states", standard: "AISC 360", calculationMethod: "US_BENDING" }),
    validationState: "BENCHMARKED",
    reviewState: "required",
  };
}

function capacityInput(patch: Partial<SteelCapacityEngineInput> = {}): SteelCapacityEngineInput {
  const standardContext = patch.standardContext ?? usStandard();
  return {
    adapterId: "US_STEEL",
    designContext: designContext(standardContext),
    standardContext,
    material: material(),
    section: section(),
    stability: stability(),
    demand: demand(standardContext),
    limitState: "BENDING_MAJOR",
    requiredProperties: ["material.yieldStrength", "section.sectionModulusYy"],
    usSteelContext: usSteel(),
    usStabilityContext: usStability(),
    ...patch,
  };
}

function annex(country: string): EurocodeNationalAnnex {
  return {
    nationalAnnexId: `NA-${country}-EN1993-1-1`,
    countryCode: country,
    standardPartRef: "EN_1993_1_1",
    edition: "UNKNOWN_PENDING_CONFIRMATION",
    publicationDate: null,
    amendment: null,
    effectiveDate: null,
    status: "FRAMEWORK_ONLY",
    nationalParameterSetRef: null,
    sourceAuthorityRef: "metadata-reference-only",
    validationState: "FRAMEWORK_ONLY",
    generationFamily: "UNKNOWN_PENDING_CONFIRMATION",
  };
}

function eurocodeContext(country = "DE"): EurocodeSteelDesignContext {
  return {
    contextId: `ctx-eu-us4-${country}`,
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-us4",
    assetId: `asset-${country}`,
    jurisdictionProfileRef: "eu-eea",
    countryCode: country,
    standardFamily: "EUROCODE",
    standardPart: "EN_1993_1_1",
    standardCode: "EN 1993-1-1",
    version: unknownEurocodeVersion("EN 1993-1-1"),
    nationalAnnex: annex(country),
    ndpSet: [],
    materialSourceKind: "PROJECT_SPECIFICATION",
    sectionCatalogRef: null,
    projectContextRef: "proj-us4",
    calculationContextRef: "calc-us4",
    sourceAuthorityRef: "governed-project-profile",
    intendedStandardProfile: "EN1993",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: "us4:eu-bending",
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
  };
}

describe("EOS-D1D-US-4 US steel bending/LTB", () => {
  it("reuses common bending/LTB mechanics and keeps AISC code-profile rules unguessed", () => {
    expect(EOS_D1D_US4_PHASE).toBe("EOS-D1D-US-4");
    expect(COMMON_STEEL_FRAMEWORK_REUSED).toBe(true);
    expect(US1_STANDARD_BINDING_REUSED).toBe(true);
    expect(US2_DESIGN_METHOD_ARCHITECTURE_REUSED).toBe(true);
    expect(US3_STABILITY_ARCHITECTURE_REUSED).toBe(true);
    expect(PARALLEL_US_BENDING_CORE_CREATED).toBe(false);
    expect(AU_CODE_RULES_REUSED_AS_US_RULES).toBe(false);
    expect(EU_CODE_RULES_REUSED_AS_US_RULES).toBe(false);
    expect(AU_EU_BENDING_IMPLEMENTATION_REVIEW.some((row) => row.classification === "JURISDICTION_NEUTRAL_REUSABLE")).toBe(true);
    expect(IMPLEMENTED_US_BENDING_METHODS).toEqual([
      "US_BENDING_ELASTIC_MAJOR_MECHANICS",
      "US_BENDING_ELASTIC_MINOR_MECHANICS",
      "US_BENDING_ELASTIC_LTB_MECHANICS",
    ]);
    expect(FRAMEWORK_ONLY_US_BENDING_METHODS).toEqual(expect.arrayContaining([
      "US_SECTION_FLEXURAL_STRENGTH_CODE_PROFILE",
      "US_BENDING_MAJOR_LRFD",
      "US_BENDING_MAJOR_ASD",
      "US_LTB_STRENGTH_CODE_PROFILE",
      "US_BENDING_LOCAL_BUCKLING_CODE_PROFILE",
    ]));
    expect(US_BENDING_METHOD_REGISTRY).toHaveLength(11);
    expect(SILENT_AISC_EDITION_INFERENCE).toBe(false);
    expect(DEFAULT_LRFD_OR_ASD).toBe(false);
    expect(SILENT_LRFD_ASD_CONVERSION).toBe(false);
    expect(COMMON_BENDING_MECHANICS_SHARED_ACROSS_LRFD_ASD).toBe(true);
    expect(LRFD_ASD_BENDING_MECHANICS_DUPLICATED).toBe(false);
    expect(ELASTIC_BENDING_EQUALS_AISC_FLEXURAL_STRENGTH).toBe(false);
    expect(ELASTIC_LTB_EQUALS_AISC_FLEXURAL_STRENGTH).toBe(false);
    expect(US_BENDING_CLASSIFICATION_LIMIT_GUESSED).toBe(false);
    expect(US_LOCAL_BUCKLING_RULE_GUESSED).toBe(false);
    expect(US_CB_FACTOR_GUESSED).toBe(false);
    expect(US_LTB_TRANSITION_PARAMETER_GUESSED).toBe(false);
    expect(US_LTB_STRENGTH_RULE_GUESSED).toBe(false);
    expect(US_BENDING_LRFD_FACTOR_GUESSED).toBe(false);
    expect(US_BENDING_ASD_FACTOR_GUESSED).toBe(false);
    expect(US_BENDING_LRFD_FACTOR_SOURCE).toBe("VALIDATION_REQUIRED");
    expect(US_BENDING_ASD_FACTOR_SOURCE).toBe("VALIDATION_REQUIRED");
    expect(US_CB_FACTOR_SOURCE).toBe("VALIDATION_REQUIRED");
    expect(UNKNOWN_US_BENDING_CODE_PARAMETER_GUESSED).toBe(false);
    expect(usBendingElementClassificationState()).toBe("VALIDATION_REQUIRED");
    expect(US_BENDING_LOCAL_BUCKLING_FRAMEWORK_STATE.ruleGuessed).toBe(false);
    expect(US_LTB_TRANSITION_PARAMETER_CONTEXT.Lp).toBeNull();
    expect(US_FLEXURAL_BEHAVIOR_CONTEXT.assumedPlasticWithoutClassification).toBe(false);
    expect(PLASTIC_CAPACITY_ASSUMED_WITHOUT_CLASSIFICATION).toBe(false);
    expect(() => requestUsBendingLrfdFactor()).toThrow(/phi_b/);
    expect(() => requestUsBendingAsdFactor()).toThrow(/Omega_b/);
    expect(() => requestUsCbFactor()).toThrow(/Cb/);
    expect(() => requestUsLpLr()).toThrow(/Lp_Lr/);
    expect(() => requestUsLocalBucklingRule()).toThrow(/localBucklingReduction/);
    expect(() => requestUsLtbStrengthRule()).toThrow(/ltbStrengthCurve/);
    expect(() => requestUsBendingClassificationLimits()).toThrow(/elementClassificationLimits/);
    expect(() => classifyUsBendingElement("W")).toThrow(/CHECK_UNDETERMINED/);
    expect(() => assertUsBendingLrfdAsdFactorIsolation("LRFD", "Omega_b")).toThrow(/ASD factor cannot be used in LRFD/);
    expect(() => assertUsBendingLrfdAsdFactorIsolation("ASD", "phi_b")).toThrow(/LRFD factor cannot be used in ASD/);
    const flangeMajor = usBendingClassificationContext({ element: "FLANGE", axis: "MAJOR_AXIS", limitState: "BENDING" });
    const webMinor = usBendingClassificationContext({ element: "WEB", axis: "MINOR_AXIS", limitState: "BENDING" });
    expect(flangeMajor.compactnessState).toBe("VALIDATION_REQUIRED");
    expect(webMinor.element).toBe("WEB");
    expect(flangeMajor.axis).not.toBe(webMinor.axis);
  });

  it("requires governed US bending context, D1C moment, Sx/Sy, and fails closed on missing inputs", () => {
    const context = usStandard();
    expect(consumeDemandHandoff(demand(context))).toBe("demand-us4");
    expect(consumeD1cDeflectionHandoff(demand(context))).toEqual(demand(context).deflection);
    expect(DEFLECTION_ENGINE_DUPLICATED).toBe(false);
    expect(US_BENDING_DEFLECTION_ENGINE_DUPLICATED).toBe(false);
    expect(() => evaluateSteelCapacity(capacityInput({ usSteelContext: null }))).toThrow(/missing AISC context/);
    expect(() => evaluateSteelCapacity(capacityInput({ usSteelContext: usSteel({ designMethod: null }) }))).toThrow(/DESIGN_METHOD_REQUIRED/);
    expect(() => evaluateSteelCapacity(capacityInput({
      demand: { ...demand(context), resultId: "" },
    }))).toThrow(/demand missing/);
    expect(() => evaluateSteelCapacity(capacityInput({
      section: section({ sectionModulusYy: null }),
    }))).toThrow(/missing section.sectionModulusYy/);
    expect(() => evaluateSteelCapacity(capacityInput({
      material: material({ yieldStrength: null }),
    }))).toThrow(/missing material.yieldStrength/);
    expect(() => evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({
        designMethod: "LRFD",
        loadStandard: { standardId: "ASCE_7", standardCode: "ASCE 7", edition: "2022", combinationBasis: "ALLOWABLE", implemented: false },
      }),
    }))).toThrow(/incompatible with a governed allowable load basis/);
    expect(() => evaluateSteelCapacity(capacityInput({
      requiredProperties: ["material.yieldStrength", "section.sectionModulusYy", "material.elasticModulus", "material.shearModulus", "section.Izz", "section.torsionConstant", "section.warpingConstant"],
      stability: stability({ unbracedLengthM: null, unbracedLengthProvenanceRef: "engineer-unbraced-length" }),
    }))).toThrow(/unbraced length/);
    expect(() => evaluateSteelCapacity(capacityInput({
      requiredProperties: ["material.yieldStrength", "section.sectionModulusYy", "material.elasticModulus", "material.shearModulus", "section.Izz", "section.torsionConstant", "section.warpingConstant"],
      stability: stability({
        restraintDescription: "PINNED",
        lateralRestraint: "unknown",
        torsionalRestraint: "unknown",
        warpingRestraint: "unknown",
      }),
    }))).toThrow(/unknown restraint/);
    expect(SILENT_UNBRACED_LENGTH_ASSUMPTION).toBe(false);
    expect(SILENT_US_UNBRACED_LENGTH_ASSUMPTION).toBe(false);
    expect(GENERIC_SUPPORT_AUTOMATICALLY_DEFINES_LTB_RESTRAINT).toBe(false);
    expect(SILENT_US_LTB_RESTRAINT_ASSUMPTION).toBe(false);
    expect(() => assertSupportDoesNotDefineLtbRestraint("PINNED")).toThrow(/do not automatically define LTB restraint/);
    expect(() => evaluateSteelCapacity(capacityInput({ section: section({ catalogSource: "AUST300" }) }))).toThrow(/not a US default/);
  });

  it("evaluates elastic major/minor bending and LTB without labelling them AISC flexural strength", () => {
    const major = evaluateSteelCapacity(capacityInput({
      requiredProperties: ["material.yieldStrength", "section.sectionModulusYy", "material.elasticModulus", "material.shearModulus", "section.Izz", "section.torsionConstant", "section.warpingConstant"],
    }));
    expect(major.implemented).toBe(true);
    expect(major.resultClass).toBe("MECHANICS_REFERENCE");
    expect(major.capacity?.capacityType).toBe("MECHANICS_REFERENCE");
    expect(major.bendingChecks?.map((row) => row.methodId)).toEqual([
      "US_BENDING_ELASTIC_MAJOR_MECHANICS",
      "US_BENDING_ELASTIC_LTB_MECHANICS",
    ]);
    expect(major.governingMethodId).toBe("US_BENDING_ELASTIC_LTB_MECHANICS");
    expect(major.capacity?.value).toBeCloseTo(168_757, 0);
    expect(major.reason).not.toMatch(/AISC_NOMINAL|phi_bMn|Mn\/Omega/);
    const minor = evaluateSteelCapacity(capacityInput({
      limitState: "BENDING_MINOR",
      requiredProperties: ["material.yieldStrength", "section.sectionModulusZz"],
      stability: stability({ lateralRestraint: null, torsionalRestraint: null, warpingRestraint: null, unbracedLengthM: null }),
    }));
    expect(minor.bendingChecks?.map((row) => row.methodId)).toEqual(["US_BENDING_ELASTIC_MINOR_MECHANICS"]);
    expect(minor.capacity?.value).toBe(60_000);
    const withPlastic = evaluateSteelCapacity(capacityInput({
      limitState: "BENDING_MINOR",
      requiredProperties: ["material.yieldStrength", "section.sectionModulusZz"],
      stability: stability({ lateralRestraint: null, torsionalRestraint: null, warpingRestraint: null, unbracedLengthM: null }),
    }));
    expect(withPlastic.capacity?.value).toBe(60_000);
    assertPlasticCapacityNotAssumedWithoutClassification();
    const majorBm = scoreUsBendingBenchmark("US-BENDING-BM-ELASTIC-MAJOR-HAND-1", 300_000);
    const minorBm = scoreUsBendingBenchmark("US-BENDING-BM-ELASTIC-MINOR-HAND-1", 60_000);
    const ltbBm = scoreUsBendingBenchmark("US-BENDING-BM-ELASTIC-LTB-HAND-1", 168_757);
    expect(majorBm.evidenceRef).toMatch(/PASS/);
    expect(minorBm.evidenceRef).toMatch(/PASS/);
    expect(ltbBm.evidenceRef).toMatch(/PASS/);
    expect(BENCHMARK_EQUALS_AISC_CONFORMANCE).toBe(false);
    expect(COMMON_BENDING_BENCHMARK_EQUALS_AISC_CONFORMANCE).toBe(false);
    expect(US_BENDING_INDEPENDENT_BENCHMARK_STATE).toBe("PARTIAL");
    expect(US_BENDING_STRENGTH_RESULT_STATE).toBe("PARTIAL");
    const check = orchestrateUsBendingDesignCheck({
      designCheckId: "chk-us4",
      designContext: designContext(usStandard()),
      capacityInput: capacityInput(),
    });
    expect(check.verdict).toBe("CHECK_UNDETERMINED");
    expect(check.engineeringApproved).toBe(false);
    expect(MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_AISC_CHECK).toBe(false);
    expect(CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(AUTOMATIC_ENGINEERING_APPROVAL).toBe(false);
    expect(US_BENDING_HUMAN_VALIDATION_REQUIRED).toBe(true);
    expect(() => assertUsMixedAuthorityBendingComparison("ELASTIC_LTB_REFERENCE", "AISC_LRFD_DESIGN_STRENGTH")).toThrow(/mixed authority/);
    expect(usBendingCodeProfileCheckState(capacityInput())).toBe("CHECK_UNDETERMINED");
    expect(() => evaluateUsSteelBendingCodeProfile(capacityInput())).toThrow(/unknown required code parameter/);
    const asdSi = evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({ designMethod: "ASD", unitSystem: "SI" }),
      requiredProperties: ["material.yieldStrength", "section.sectionModulusYy", "material.elasticModulus", "material.shearModulus", "section.Izz", "section.torsionConstant", "section.warpingConstant"],
    }));
    expect(asdSi.capacity?.value).toBe(major.capacity?.value);
    const lrfdSi = evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({ designMethod: "LRFD", unitSystem: "SI" }),
      requiredProperties: ["material.yieldStrength", "section.sectionModulusYy", "material.elasticModulus", "material.shearModulus", "section.Izz", "section.torsionConstant", "section.warpingConstant"],
    }));
    const asdCustomary = evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({ designMethod: "ASD", unitSystem: "US_CUSTOMARY" }),
      requiredProperties: ["material.yieldStrength", "section.sectionModulusYy", "material.elasticModulus", "material.shearModulus", "section.Izz", "section.torsionConstant", "section.warpingConstant"],
    }));
    expect(lrfdSi.capacity?.value).toBe(major.capacity?.value);
    expect(asdCustomary.capacity?.value).toBe(major.capacity?.value);
  });

  it("supports multi-jurisdiction, international direct-contract, and AI/optimizer fail-closed boundaries", () => {
    const ca = evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({ buildingCodeAdoptionRef: "ca", buildingCodeAdoption: adoption({ adoptionId: "ca" }) }),
      requiredProperties: ["material.yieldStrength", "section.sectionModulusYy", "material.elasticModulus", "material.shearModulus", "section.Izz", "section.torsionConstant", "section.warpingConstant"],
    }));
    const tx = evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({
        buildingCodeAdoptionRef: "tx",
        buildingCodeAdoption: adoption({ adoptionId: "tx", jurisdiction: "texas" }),
      }),
      requiredProperties: ["material.yieldStrength", "section.sectionModulusYy", "material.elasticModulus", "material.shearModulus", "section.Izz", "section.torsionConstant", "section.warpingConstant"],
    }));
    expect(ca.capacity?.value).toBe(tx.capacity?.value);
    const international = evaluateSteelCapacity(capacityInput({
      standardContext: createConfiguredKnowledgeContext({
        contextId: "ctx-aisc-other-us4",
        jurisdictionProfileRef: "other",
        standardFamily: "AISC",
        standardCode: "AISC 360",
        edition: AISC_UNKNOWN_EDITION_TOKEN,
        materialScope: "steel",
      }),
      designContext: { ...designContext(usStandard("ctx-aisc-other-us4")), standardContextRef: "ctx-aisc-other-us4" },
      demand: demand(usStandard("ctx-aisc-other-us4")),
      usSteelContext: usSteel({
        jurisdictionProfileRef: "other",
        directContractProfile: true,
        buildingCodeAdoption: null,
        buildingCodeAdoptionRef: null,
      }),
      requiredProperties: ["material.yieldStrength", "section.sectionModulusYy", "material.elasticModulus", "material.shearModulus", "section.Izz", "section.torsionConstant", "section.warpingConstant"],
    }));
    expect(international.implemented).toBe(true);
    expect(DIRECT_CONTRACT_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE).toBe(false);
    expect(() => denyAiUsUnbracedLength()).toThrow(/unbraced length/);
    expect(() => denyAiUsLtbRestraint()).toThrow(/LTB restraint/);
    expect(() => denyAiUsCbFactor()).toThrow(/Cb/);
    expect(() => denyAiUsBendingClassification()).toThrow(/element classification/);
    expect(() => denyAiUsBendingFactor()).toThrow(/bending factor/);
    expect(() => denyAiUsLtbRule()).toThrow(/LTB rule/);
    expect(() => denyAiUsBendingStrength()).toThrow(/flexural strength/);
    expect(() => denyAiUsConformanceClaim()).toThrow(/compliance/);
    expect(() => assertAiCannotInventLtb("AI", false)).toThrow(/LTB values/);
    expect(AI_US_BENDING_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(LLM_US_BENDING_STRENGTH_AUTHORITY).toBe(false);
    expect(AI_ELEMENT_CLASSIFICATION_AUTHORITY).toBe(false);
    expect(AI_UNBRACED_LENGTH_AUTHORITY).toBe(false);
    expect(AI_LTB_RESTRAINT_AUTHORITY).toBe(false);
    expect(AI_CB_FACTOR_AUTHORITY).toBe(false);
    expect(AI_FACTOR_AUTHORITY).toBe(false);
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(() => assertAiscBendingEditionIsolation("2010", "2016")).toThrow(/STANDARD_VERSION_CONFLICT/);
    expect(() => assertUsMemberBendingNotGlobalFrame()).toThrow(/not global frame stability/);
    expect(US_MEMBER_BENDING_EQUALS_GLOBAL_FRAME_VALIDATION).toBe(false);
    expect(GENERAL_FEA_CAPABILITY_CLAIMED).toBe(false);
    expect(US_COMBINED_ACTION_IMPLEMENTED).toBe(false);
    expect(US_SHEAR_DESIGN_IMPLEMENTED).toBe(false);
    expect(US_TORSIONAL_DESIGN_IMPLEMENTED).toBe(false);
    expect(US_SEISMIC_BENDING_DESIGN_IMPLEMENTED).toBe(false);
    expect(US_CONNECTION_BENDING_DESIGN_IMPLEMENTED).toBe(false);
    expect(() => evaluateSteelCapacity(capacityInput({
      designContext: { ...designContext(usStandard()), validationState: "CERTIFIED" },
    }))).toThrow(/certified/);
    expect(() => assertOptimizationUsBendingRecheck({
      candidateSectionRef: "W12x50",
      proposedBy: "AI",
      deterministicRecheckRequired: true,
      rechecked: true,
      memberCheckState: "CHECK_UNDETERMINED",
    })).toThrow(/undetermined bending/);
    expect(US_OPTIMIZATION_ACCEPTS_UNDETERMINED_BENDING).toBe(false);
  });

  it("keeps AU/EU/US bending and LTB physics identical and does not regress AU/EU/US packs", () => {
    const fy = { name: "Fy", value: 300, unit: "MPa", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
    const sx = { name: "Sx", value: 1_000_000, unit: "mm3", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
    const commonMy = firstYieldMomentNm(fy, sx, "Fy", "Sx");
    const e = { name: "E", value: 200, unit: "GPa", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
    const g = { name: "G", value: 80, unit: "GPa", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
    const izz = { name: "Izz", value: 20_000_000, unit: "mm4", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
    const j = { name: "J", value: 500_000, unit: "mm4", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
    const iw = { name: "Iw", value: 200_000_000_000, unit: "mm6", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
    const commonMcr = elasticLtbMomentNm({
      EPa: toElasticModulusPa(e, "E"),
      GPa: toElasticModulusPa(g, "G"),
      IminorM4: toSecondMomentM4(izz, "Izz"),
      JM4: toSecondMomentM4(j, "J"),
      IwM6: toWarpingM6(iw, "Iw"),
      unbracedLengthM: 8,
    });
    const us = evaluateSteelCapacity(capacityInput({
      requiredProperties: ["material.yieldStrength", "section.sectionModulusYy", "material.elasticModulus", "material.shearModulus", "section.Izz", "section.torsionConstant", "section.warpingConstant"],
    }));
    expect(us.bendingChecks?.find((row) => row.methodType === "ELASTIC_BENDING_REFERENCE")?.capacityValueNm).toBe(commonMy);
    expect(us.bendingChecks?.find((row) => row.methodType === "ELASTIC_LTB_REFERENCE")?.capacityValueNm).toBeCloseTo(commonMcr, 0);
    const auProfile = createAuSteelStandardProfile({ contextId: "ctx-au-us4-bending" });
    const au = evaluateSteelCapacity({
      adapterId: "AU_STEEL",
      designContext: { ...designContext(auProfile), standardContextRef: auProfile.contextId },
      standardContext: auProfile,
      material: material({ jurisdictionApplicability: ["australia"] }),
      section: section({ catalogSource: "ENGINEER_SUPPLIED", jurisdictionApplicability: ["australia"] }),
      stability: stability(),
      demand: demand(auProfile),
      limitState: "BENDING_MAJOR",
      requiredProperties: ["material.yieldStrength", "section.sectionModulusYy", "material.elasticModulus", "material.shearModulus", "section.Izz", "section.torsionConstant", "section.warpingConstant"],
    });
    const euContext = {
      ...createConfiguredKnowledgeContext({
        contextId: "ctx-en1993-us4",
        jurisdictionProfileRef: "eu-eea",
        standardFamily: "EN",
        standardCode: "EN 1993-1-1",
        edition: "UNKNOWN_PENDING_CONFIRMATION",
        materialScope: "steel",
      }),
      nationalAnnexRef: {
        annexId: "NA-DE-EN1993-1-1",
        country: "DE",
        jurisdiction: "eu-eea",
        standardCode: "EN 1993-1-1",
        edition: "UNKNOWN_PENDING_CONFIRMATION",
        annexEdition: null,
        effectiveFrom: "1970-01-01",
        effectiveTo: null,
        parameterSetRef: null,
        sourceReference: "National Annex metadata reference only",
        validationState: "FRAMEWORK_ONLY",
      },
    };
    const eu = evaluateSteelCapacity({
      adapterId: "EU_STEEL",
      designContext: { ...designContext(euContext), standardContextRef: euContext.contextId },
      standardContext: euContext,
      material: material({ jurisdictionApplicability: ["eu-eea"] }),
      section: section({ sectionFamily: "IPE", catalogSource: "ENGINEER_SUPPLIED", jurisdictionApplicability: ["eu-eea"] }),
      stability: stability(),
      demand: demand(euContext),
      limitState: "BENDING_MAJOR",
      requiredProperties: ["material.yieldStrength", "section.sectionModulusYy", "material.elasticModulus", "material.shearModulus", "section.Izz", "section.torsionConstant", "section.warpingConstant"],
      eurocodeContext: eurocodeContext("DE"),
    });
    expect(au.bendingChecks?.find((row) => row.methodType === "ELASTIC_BENDING_REFERENCE")?.capacityValueNm).toBe(commonMy);
    expect(eu.bendingChecks?.find((row) => row.methodType === "ELASTIC_BENDING_REFERENCE")?.capacityValueNm).toBe(commonMy);
    expect(au.bendingChecks?.find((row) => row.methodType === "ELASTIC_LTB_REFERENCE")?.capacityValueNm).toBeCloseTo(commonMcr, 0);
    expect(eu.bendingChecks?.find((row) => row.methodType === "ELASTIC_LTB_REFERENCE")?.capacityValueNm).toBeCloseTo(commonMcr, 0);
    expect(IMPLEMENTED_US_TENSION_METHODS).toEqual(["US_TENSION_GROSS_YIELD_MECHANICS", "US_TENSION_NET_FRACTURE_MECHANICS"]);
    expect(IMPLEMENTED_US_COMPRESSION_METHODS).toEqual([
      "US_COMPRESSION_SQUASH_YIELD_MECHANICS",
      "US_COMPRESSION_EULER_MAJOR_MECHANICS",
      "US_COMPRESSION_EULER_MINOR_MECHANICS",
    ]);
    expect(AU_METHOD_VALIDATION_INVENTORY).toHaveLength(18);
    expect(AU_STEEL_VALIDATION_MATRIX).toHaveLength(11);
    expect(EU_METHOD_VALIDATION_INVENTORY.length).toBeGreaterThan(20);
    expect(EU_STEEL_VALIDATION_MATRIX).toHaveLength(13);
    expect(IMPLEMENTED_INTERACTION_METHODS).toEqual([]);
    expect(IMPLEMENTED_EU_INTERACTION_METHODS).toEqual([]);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL).toEqual({ ready: true, implemented: false, standards: ["AISC 360"], loadContext: ["ASCE 7"] });
    expect(US_STEEL_IMPLEMENTATION_SUBPHASES[3]).toMatch(/US-4 bending/);
    expect(US_STEEL_PACK_CERTIFIED).toBe(false);
    expect(US_STEEL_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_BOUNDED_METHODS");
    expect(SCHEMA_CHANGE_REQUIRED_FOR_US4).toBe(false);
    expect(EU_ONLY_STEEL_CORE).toBe(false);
    expect(US4_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK).toBe(true);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(STRUCTURAL_STANDARD_TEXT_EMBEDDED).toBe(false);
    expect(D1D_US4_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(D1D_US4_D0_RISK_DISPOSITION.REDUCED).toEqual(["D0-R01"]);
    const usSrc = ["evaluate.ts", "registry.ts"].map((name) => readFileSync(join(here, "us-bending", name), "utf8")).join("\n");
    expect(usSrc).not.toMatch(/AU_BENDING_ELASTIC_MAJOR|AS 4100|alpha_m|phiMb|γM1|χLT|National Annex|NDP/);
    const mechanicsSrc = [readFileSync(join(here, "mechanics", "bending.ts"), "utf8"), readFileSync(join(here, "mechanics", "ltb.ts"), "utf8")].join("\n");
    expect(mechanicsSrc).not.toMatch(/phi_b\s*=|Omega_b\s*=|Cb\s*=|Lp\s*=|Lr\s*=/);
  });
});
