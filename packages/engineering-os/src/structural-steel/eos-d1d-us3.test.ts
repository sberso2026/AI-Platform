import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_EFFECTIVE_LENGTH_FACTOR_AUTHORITY,
  AI_ELEMENT_CLASSIFICATION_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_FACTOR_AUTHORITY,
  AI_STABILITY_METHOD_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AI_US_COMPRESSION_ASSISTANCE_ADVISORY_ONLY,
  AISC_UNKNOWN_EDITION_TOKEN,
  AU_CODE_RULES_REUSED_AS_US_RULES,
  AUTOMATIC_ENGINEERING_APPROVAL,
  BENCHMARK_EQUALS_AISC_CONFORMANCE,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  COMMON_BENCHMARK_EQUALS_AISC_CONFORMANCE,
  COMMON_COMPRESSION_MECHANICS_SHARED_ACROSS_LRFD_ASD,
  COMMON_STEEL_FRAMEWORK_REUSED,
  D1C_EQUALS_COMPLETE_US_STABILITY_ANALYSIS,
  DEFAULT_K_FACTOR,
  DEFAULT_LRFD_OR_ASD,
  DIRECT_CONTRACT_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE,
  EOS_D1D_US3_PHASE,
  EU_CODE_RULES_REUSED_AS_US_RULES,
  EU_ONLY_STEEL_CORE,
  EULER_REFERENCE_EQUALS_AISC_MEMBER_STRENGTH,
  FLEXURAL_TORSIONAL_BUCKLING_IMPLEMENTED,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  LLM_US_COMPRESSION_STRENGTH_AUTHORITY,
  LRFD_ASD_COMPRESSION_MECHANICS_DUPLICATED,
  MEMBER_STABILITY_EQUALS_GLOBAL_FRAME_STABILITY,
  MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_AISC_CHECK,
  MIXED_AUTHORITY_COMPRESSION_COMPARISON_GOVERNED,
  PARALLEL_US_COMPRESSION_CORE_CREATED,
  SCHEMA_CHANGE_REQUIRED_FOR_US3,
  SILENT_AISC_EDITION_INFERENCE,
  SILENT_EFFECTIVE_LENGTH_ASSUMPTION,
  SILENT_LRFD_ASD_CONVERSION,
  STABILITY_ANALYSIS_METHOD_MIXING_ALLOWED,
  STABILITY_METHOD_DETERMINES_EFFECTIVE_LENGTH_REQUIREMENT,
  STRUCTURAL_STANDARD_TEXT_EMBEDDED,
  SUPPORT_LABEL_AUTOMATICALLY_DEFINES_K_FACTOR,
  TORSIONAL_BUCKLING_IMPLEMENTED,
  UNKNOWN_US_COMPRESSION_CODE_PARAMETER_GUESSED,
  US1_STANDARD_BINDING_REUSED,
  US2_DESIGN_METHOD_ARCHITECTURE_REUSED,
  US3_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK,
  US_CODE_SLENDERNESS_LIMIT_GUESSED,
  US_COMPRESSION_ASD_FACTOR_GUESSED,
  US_COMPRESSION_ASD_FACTOR_SOURCE,
  US_COMPRESSION_HUMAN_VALIDATION_REQUIRED,
  US_COMPRESSION_INDEPENDENT_BENCHMARK_STATE,
  US_COMPRESSION_LRFD_FACTOR_GUESSED,
  US_COMPRESSION_LRFD_FACTOR_SOURCE,
  US_COMPRESSION_STRENGTH_RESULT_STATE,
  US_COMPRESSION_STRENGTH_RULE_GUESSED,
  US_CONNECTION_COMPRESSION_DESIGN_IMPLEMENTED,
  US_ELEMENT_CLASSIFICATION_LIMIT_GUESSED,
  US_FLEXURAL_TORSIONAL_BUCKLING_CODE_METHOD_IMPLEMENTED,
  US_MEMBER_COMPRESSION_EQUALS_GLOBAL_FRAME_VALIDATION,
  US_OPTIMIZATION_ACCEPTS_UNDETERMINED_COMPRESSION,
  US_SEISMIC_COMPRESSION_DESIGN_IMPLEMENTED,
  US_STEEL_IMPLEMENTATION_MATURITY,
  US_STEEL_PACK_CERTIFIED,
  US_TORSIONAL_BUCKLING_CODE_METHOD_IMPLEMENTED,
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
  AU_EU_COMPRESSION_IMPLEMENTATION_REVIEW,
  AU_METHOD_VALIDATION_INVENTORY,
  AU_STEEL_VALIDATION_MATRIX,
  D1D_US3_D0_RISK_DISPOSITION,
  EU_METHOD_VALIDATION_INVENTORY,
  EU_STEEL_VALIDATION_MATRIX,
  FRAMEWORK_ONLY_US_COMPRESSION_METHODS,
  IMPLEMENTED_EU_INTERACTION_METHODS,
  IMPLEMENTED_INTERACTION_METHODS,
  IMPLEMENTED_US_COMPRESSION_METHODS,
  IMPLEMENTED_US_TENSION_METHODS,
  STEEL_ADAPTER_BOUNDARIES,
  US_CODE_SLENDERNESS_CONTEXT,
  US_COMPRESSION_METHOD_REGISTRY,
  US_STEEL_IMPLEMENTATION_SUBPHASES,
  assertAiscCompressionEditionIsolation,
  assertD1cNotCompleteUsStabilityAnalysis,
  assertNoDefaultKFactor,
  assertOptimizationUsCompressionRecheck,
  assertSupportLabelDoesNotDefineK,
  assertUsCompressionLrfdAsdFactorIsolation,
  assertUsMemberStabilityNotGlobalFrame,
  assertUsMixedAuthorityCompressionComparison,
  classifyUsCompressionElement,
  consumeDemandHandoff,
  createAuSteelStandardProfile,
  denyAiUsCompressionFactor,
  denyAiUsCompressionStrength,
  denyAiUsConformanceClaim,
  denyAiUsElementClassification,
  denyAiUsKFactor,
  denyAiUsStabilityMethod,
  evaluateSteelCapacity,
  evaluateUsSteelCompressionCodeProfile,
  eulerLoadN,
  orchestrateUsCompressionDesignCheck,
  requestUsCodeSlendernessLimit,
  requestUsCompressionAsdFactor,
  requestUsCompressionLrfdFactor,
  requestUsCompressionStrengthRule,
  requestUsElementClassificationLimits,
  scoreUsCompressionBenchmark,
  toElasticModulusPa,
  toSecondMomentM4,
  unknownEurocodeVersion,
  usCompressionCodeProfileCheckState,
  usElementClassificationState,
  usMemberSlendernessContext,
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
    contextId: "ctx-us-compression",
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-us3",
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
    projectStandardContextRef: "proj-us3",
    calculationContextRef: "calc-us3",
    engineeringRuleAuthorityRefs: ["VALIDATED_ENGINEERING_REFERENCE"],
    projectOverride: null,
    sourcePrecedence: ["MANDATORY_ADOPTED_CODE", "REFERENCED_STANDARD"],
    intendedStandardProfile: "AISC360",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: "us3:compression",
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
    directContractProfile: false,
    ...overrides,
  };
}

function usStability(overrides: Partial<UsStabilityAnalysisContext> = {}): UsStabilityAnalysisContext {
  return {
    method: "EFFECTIVE_LENGTH_BASED",
    secondOrder: "FIRST_ORDER",
    mixedMethods: false,
    ...overrides,
  };
}

function usStandard(id = "ctx-aisc-us3"): StructuralStandardContext {
  return createConfiguredKnowledgeContext({
    contextId: id,
    jurisdictionProfileRef: "united-states",
    standardFamily: "AISC",
    standardCode: "AISC 360",
    edition: AISC_UNKNOWN_EDITION_TOKEN,
    materialScope: "steel",
  });
}

function demand(context: StructuralStandardContext, valueN = -400_000): SteelCapacityEngineInput["demand"] {
  return {
    resultId: "demand-us3",
    memberId: "m-us3",
    shear: { value: 0, unit: "N", locationM: 0, signed: 0 },
    moment: { value: 0, unit: "N.m", locationM: 0, signed: 0 },
    axial: { valueN, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "not required" },
    capacityPresent: false,
    standardContext: context,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c", sourceKind: "calculation", reference: "d1c-axial" }],
    combinationId: "comb-us3",
  };
}

function material(patch: Partial<SteelMaterialDesignProperties> = {}): SteelMaterialDesignProperties {
  return {
    materialRef: "mat-us3",
    grade: "A992",
    yieldStrength: { name: "Fy", value: 300, unit: "MPa", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    ultimateStrength: { name: "Fu", value: 450, unit: "MPa", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    elasticModulus: { name: "E", value: 200, unit: "GPa", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    shearModulus: null,
    poissonRatio: null,
    density: null,
    thicknessDependentMetadata: null,
    jurisdictionApplicability: ["united-states"],
    ...patch,
  };
}

function section(patch: Partial<SteelSectionDesignProperties> = {}): SteelSectionDesignProperties {
  return {
    sectionRef: "sec-us3",
    sectionFamily: "W",
    catalogSource: "ENGINEER_SUPPLIED",
    catalogVersion: null,
    jurisdictionApplicability: ["united-states"],
    area: { name: "Ag", value: 5140, unit: "mm2", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Iyy: { name: "Iyy", value: 100_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Izz: { name: "Izz", value: 20_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    sectionModulusYy: null,
    sectionModulusZz: null,
    plasticModulusYy: null,
    plasticModulusZz: null,
    torsionConstant: null,
    warpingConstant: null,
    radiusOfGyrationYy: null,
    radiusOfGyrationZz: null,
    netArea: null,
    geometricDimensions: {},
    ...patch,
  };
}

function stability(patch: Partial<SteelStabilityContext> = {}): SteelStabilityContext {
  return {
    stabilityContextId: "stab-us3",
    memberLengthM: 8,
    effectiveLengthM: null,
    unbracedLengthM: 8,
    restraintDescription: "pinned ends, explicit Le supplied",
    bucklingAxis: "BOTH",
    momentGradientRef: null,
    torsionalRestraint: null,
    lateralRestraint: null,
    sourceEvidenceRef: "engineer-effective-length",
    derived: false,
    effectiveLengthMajorM: 8,
    effectiveLengthMinorM: 8,
    effectiveLengthProvenanceRef: "engineer-effective-length",
    ...patch,
  };
}

function designContext(context: StructuralStandardContext): SteelDesignContext {
  return {
    designContextId: "dc-us3",
    memberRef: "m-us3",
    sectionRef: "sec-us3",
    materialRef: "mat-us3",
    demandRefs: ["demand-us3"],
    standardContextRef: context.contextId,
    parameterSetRef: null,
    effectiveLengthContextRef: "stab-us3",
    restraintContextRef: "stab-us3",
    stabilityContextRef: "stab-us3",
    fabricationContextRef: null,
    evidenceRefs: [{ evidenceId: "ev-eng", sourceKind: "human_input", reference: "engineer" }],
    toolRef: "EOS_US_STEEL_COMPRESSION",
    methodRef: "US_COMPRESSION",
    provenanceRef: governedProvenance({ jurisdiction: "united-states", standard: "AISC 360", calculationMethod: "US_COMPRESSION" }),
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
    limitState: "COMPRESSION",
    requiredProperties: ["material.yieldStrength", "material.elasticModulus", "section.area", "section.Iyy", "section.Izz"],
    usSteelContext: usSteel(),
    usStabilityContext: usStability(),
    ...patch,
  };
}

function annex(country: string, overrides: Partial<EurocodeNationalAnnex> = {}): EurocodeNationalAnnex {
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
    ...overrides,
  };
}

function eurocodeContext(country = "DE"): EurocodeSteelDesignContext {
  return {
    contextId: `ctx-eu-us3-${country}`,
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-us3",
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
    projectContextRef: "proj-us3",
    calculationContextRef: "calc-us3",
    sourceAuthorityRef: "governed-project-profile",
    intendedStandardProfile: "EN1993",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: "us3:eu-euler",
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
  };
}

describe("EOS-D1D-US-3 US steel compression/stability", () => {
  it("reuses common compression mechanics and keeps AISC code-profile rules unguessed", () => {
    expect(EOS_D1D_US3_PHASE).toBe("EOS-D1D-US-3");
    expect(COMMON_STEEL_FRAMEWORK_REUSED).toBe(true);
    expect(US1_STANDARD_BINDING_REUSED).toBe(true);
    expect(US2_DESIGN_METHOD_ARCHITECTURE_REUSED).toBe(true);
    expect(PARALLEL_US_COMPRESSION_CORE_CREATED).toBe(false);
    expect(AU_CODE_RULES_REUSED_AS_US_RULES).toBe(false);
    expect(EU_CODE_RULES_REUSED_AS_US_RULES).toBe(false);
    expect(AU_EU_COMPRESSION_IMPLEMENTATION_REVIEW.some((row) => row.classification === "JURISDICTION_NEUTRAL_REUSABLE")).toBe(true);
    expect(AU_EU_COMPRESSION_IMPLEMENTATION_REVIEW.some((row) => row.classification === "JURISDICTION_SPECIFIC")).toBe(true);
    expect(IMPLEMENTED_US_COMPRESSION_METHODS).toEqual([
      "US_COMPRESSION_SQUASH_YIELD_MECHANICS",
      "US_COMPRESSION_EULER_MAJOR_MECHANICS",
      "US_COMPRESSION_EULER_MINOR_MECHANICS",
    ]);
    expect(FRAMEWORK_ONLY_US_COMPRESSION_METHODS).toEqual(expect.arrayContaining([
      "US_COMPRESSION_NOMINAL_STRENGTH_CODE_PROFILE",
      "US_COMPRESSION_LRFD_DESIGN_STRENGTH",
      "US_COMPRESSION_ASD_ALLOWABLE_STRENGTH",
      "US_TORSIONAL_BUCKLING_CODE_PROFILE",
      "US_FLEXURAL_TORSIONAL_BUCKLING_CODE_PROFILE",
    ]));
    expect(US_COMPRESSION_METHOD_REGISTRY).toHaveLength(11);
    expect(SILENT_AISC_EDITION_INFERENCE).toBe(false);
    expect(DEFAULT_LRFD_OR_ASD).toBe(false);
    expect(COMMON_COMPRESSION_MECHANICS_SHARED_ACROSS_LRFD_ASD).toBe(true);
    expect(LRFD_ASD_COMPRESSION_MECHANICS_DUPLICATED).toBe(false);
    expect(SILENT_LRFD_ASD_CONVERSION).toBe(false);
    expect(EULER_REFERENCE_EQUALS_AISC_MEMBER_STRENGTH).toBe(false);
    expect(DEFAULT_K_FACTOR).toBe(false);
    expect(SUPPORT_LABEL_AUTOMATICALLY_DEFINES_K_FACTOR).toBe(false);
    expect(STABILITY_ANALYSIS_METHOD_MIXING_ALLOWED).toBe(false);
    expect(STABILITY_METHOD_DETERMINES_EFFECTIVE_LENGTH_REQUIREMENT).toBe(true);
    expect(US_CODE_SLENDERNESS_LIMIT_GUESSED).toBe(false);
    expect(US_ELEMENT_CLASSIFICATION_LIMIT_GUESSED).toBe(false);
    expect(US_COMPRESSION_STRENGTH_RULE_GUESSED).toBe(false);
    expect(US_COMPRESSION_LRFD_FACTOR_GUESSED).toBe(false);
    expect(US_COMPRESSION_ASD_FACTOR_GUESSED).toBe(false);
    expect(US_COMPRESSION_LRFD_FACTOR_SOURCE).toBe("VALIDATION_REQUIRED");
    expect(US_COMPRESSION_ASD_FACTOR_SOURCE).toBe("VALIDATION_REQUIRED");
    expect(UNKNOWN_US_COMPRESSION_CODE_PARAMETER_GUESSED).toBe(false);
    expect(usElementClassificationState()).toBe("VALIDATION_REQUIRED");
    expect(US_CODE_SLENDERNESS_CONTEXT.codeLimitGuessed).toBe(false);
    expect(TORSIONAL_BUCKLING_IMPLEMENTED).toBe(false);
    expect(US_TORSIONAL_BUCKLING_CODE_METHOD_IMPLEMENTED).toBe(false);
    expect(FLEXURAL_TORSIONAL_BUCKLING_IMPLEMENTED).toBe(false);
    expect(US_FLEXURAL_TORSIONAL_BUCKLING_CODE_METHOD_IMPLEMENTED).toBe(false);
    expect(() => requestUsCompressionLrfdFactor()).toThrow(/phi_c/);
    expect(() => requestUsCompressionAsdFactor()).toThrow(/Omega_c/);
    expect(() => requestUsCompressionStrengthRule()).toThrow(/compressionStrengthCurve/);
    expect(() => requestUsElementClassificationLimits()).toThrow(/elementClassificationLimits/);
    expect(() => requestUsCodeSlendernessLimit()).toThrow(/codeSlendernessLimit/);
    expect(() => classifyUsCompressionElement("W")).toThrow(/CHECK_UNDETERMINED/);
    expect(() => assertUsCompressionLrfdAsdFactorIsolation("LRFD", "Omega_c")).toThrow(/ASD factor cannot be used in LRFD/);
    expect(() => assertUsCompressionLrfdAsdFactorIsolation("ASD", "phi_c")).toThrow(/LRFD factor cannot be used in ASD/);
  });

  it("requires governed US compression context, D1C demand, Le/E/Fy, and fails closed on missing inputs", () => {
    const context = usStandard();
    expect(consumeDemandHandoff(demand(context))).toBe("demand-us3");
    expect(() => evaluateSteelCapacity(capacityInput({ usSteelContext: null }))).toThrow(/missing AISC context/);
    expect(() => evaluateSteelCapacity(capacityInput({ usSteelContext: usSteel({ designMethod: null }) }))).toThrow(/DESIGN_METHOD_REQUIRED/);
    expect(() => evaluateSteelCapacity(capacityInput({ usStabilityContext: null }))).toThrow(/unknown stability-analysis method/);
    expect(() => evaluateSteelCapacity(capacityInput({ usStabilityContext: usStability({ method: "UNKNOWN" }) }))).toThrow(/unknown stability-analysis method/);
    expect(() => evaluateSteelCapacity(capacityInput({
      demand: { ...demand(context), resultId: "" },
    }))).toThrow(/demand missing/);
    expect(() => evaluateSteelCapacity(capacityInput({ stability: null }))).toThrow(/stability context|effective length/);
    expect(() => evaluateSteelCapacity(capacityInput({
      stability: stability({
        effectiveLengthMajorM: null,
        effectiveLengthMinorM: null,
        effectiveLengthM: null,
        bucklingAxis: "MAJOR",
        restraintDescription: "PINNED",
      }),
    }))).toThrow(/effective length/);
    expect(() => evaluateSteelCapacity(capacityInput({
      material: material({ elasticModulus: null }),
    }))).toThrow(/missing material.elasticModulus/);
    expect(() => evaluateSteelCapacity(capacityInput({
      material: material({ yieldStrength: null }),
    }))).toThrow(/missing material.yieldStrength/);
    expect(() => evaluateSteelCapacity(capacityInput({
      section: section({ Iyy: null }),
    }))).toThrow(/missing section.Iyy/);
    expect(() => evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({
        designMethod: "LRFD",
        loadStandard: { standardId: "ASCE_7", standardCode: "ASCE 7", edition: "2022", combinationBasis: "ALLOWABLE", implemented: false },
      }),
    }))).toThrow(/incompatible with a governed allowable load basis/);
    expect(() => evaluateSteelCapacity(capacityInput({ section: section({ catalogSource: "AUST300" }) }))).toThrow(/not a US default/);
    expect(() => evaluateSteelCapacity(capacityInput({ section: section({ catalogSource: "EU_SECTION_CATALOG" }) }))).toThrow(/not a US default/);
    assertNoDefaultKFactor();
    expect(() => assertSupportLabelDoesNotDefineK("PINNED")).toThrow(/do not automatically define K/);
    expect(SILENT_EFFECTIVE_LENGTH_ASSUMPTION).toBe(false);
  });

  it("evaluates squash and Euler mechanics without labelling them AISC member strength", () => {
    const out = evaluateSteelCapacity(capacityInput());
    expect(out.implemented).toBe(true);
    expect(out.resultClass).toBe("MECHANICS_REFERENCE");
    expect(out.capacity?.capacityType).toBe("MECHANICS_REFERENCE");
    expect(out.standardConformanceState).toBe("INTENDED_PROFILE");
    expect(out.designCapacityState).toBe("VALIDATION_REQUIRED");
    expect(out.compressionChecks?.map((row) => row.methodId)).toEqual([
      "US_COMPRESSION_SQUASH_YIELD_MECHANICS",
      "US_COMPRESSION_EULER_MAJOR_MECHANICS",
      "US_COMPRESSION_EULER_MINOR_MECHANICS",
    ]);
    expect(out.governingMethodId).toBe("US_COMPRESSION_EULER_MINOR_MECHANICS");
    expect(out.capacity?.value).toBeCloseTo(616_850, 0);
    expect(out.reason).not.toMatch(/AISC_NOMINAL|phiPn|Pn\/Omega/);
    const squash = scoreUsCompressionBenchmark("US-COMPRESSION-BM-SQUASH-HAND-1", 1_542_000);
    const major = scoreUsCompressionBenchmark("US-COMPRESSION-BM-EULER-MAJOR-HAND-1", 3_084_251);
    const minor = scoreUsCompressionBenchmark("US-COMPRESSION-BM-EULER-MINOR-HAND-1", 616_850);
    expect(squash.evidenceRef).toMatch(/PASS/);
    expect(major.evidenceRef).toMatch(/PASS/);
    expect(minor.evidenceRef).toMatch(/PASS/);
    expect(BENCHMARK_EQUALS_AISC_CONFORMANCE).toBe(false);
    expect(COMMON_BENCHMARK_EQUALS_AISC_CONFORMANCE).toBe(false);
    expect(US_COMPRESSION_INDEPENDENT_BENCHMARK_STATE).toBe("PARTIAL");
    expect(US_COMPRESSION_STRENGTH_RESULT_STATE).toBe("PARTIAL");
    const check = orchestrateUsCompressionDesignCheck({
      designCheckId: "chk-us3",
      designContext: designContext(usStandard()),
      capacityInput: capacityInput(),
    });
    expect(check.verdict).toBe("CHECK_UNDETERMINED");
    expect(check.engineeringApproved).toBe(false);
    expect(MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_AISC_CHECK).toBe(false);
    expect(CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(AUTOMATIC_ENGINEERING_APPROVAL).toBe(false);
    expect(US_COMPRESSION_HUMAN_VALIDATION_REQUIRED).toBe(true);
    const majorOnly = evaluateSteelCapacity(capacityInput({
      stability: stability({ bucklingAxis: "MAJOR", effectiveLengthM: 8, effectiveLengthMinorM: null }),
      requiredProperties: ["material.yieldStrength", "material.elasticModulus", "section.area", "section.Iyy"],
    }));
    expect(majorOnly.compressionChecks?.some((row) => row.axis === "MINOR_AXIS")).toBe(false);
    expect(MIXED_AUTHORITY_COMPRESSION_COMPARISON_GOVERNED).toBe(true);
    expect(() => assertUsMixedAuthorityCompressionComparison("ELASTIC_BUCKLING_REFERENCE", "AISC_LRFD_DESIGN_STRENGTH")).toThrow(/mixed authority/);
    expect(usCompressionCodeProfileCheckState(capacityInput())).toBe("CHECK_UNDETERMINED");
    expect(() => evaluateUsSteelCompressionCodeProfile(capacityInput())).toThrow(/unknown required code parameter/);
    const asdSi = evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({ designMethod: "ASD", unitSystem: "SI" }),
    }));
    const lrfdSi = evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({ designMethod: "LRFD", unitSystem: "SI" }),
    }));
    const asdCustomary = evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({ designMethod: "ASD", unitSystem: "US_CUSTOMARY" }),
    }));
    expect(asdSi.capacity?.value).toBe(out.capacity?.value);
    expect(lrfdSi.capacity?.value).toBe(out.capacity?.value);
    expect(asdCustomary.capacity?.value).toBe(out.capacity?.value);
    const slenderness = usMemberSlendernessContext({
      effectiveLengthMajorM: 8,
      effectiveLengthMinorM: 8,
      radiusOfGyrationMajorM: 0.2,
      radiusOfGyrationMinorM: 0.05,
    });
    expect(slenderness.engineeringSlendernessMajor).toBe(40);
    expect(slenderness.codeSlendernessLimit).toBeNull();
  });

  it("isolates stability methods, does not default K, and does not claim frame/FEA capability", () => {
    expect(() => evaluateSteelCapacity(capacityInput({
      usStabilityContext: usStability({ mixedMethods: true }),
    }))).toThrow(/must not mix silently/);
    expect(() => evaluateSteelCapacity(capacityInput({
      usStabilityContext: usStability({ method: "DIRECT_ANALYSIS_BASED" }),
      stability: stability({
        effectiveLengthFactorMajor: { name: "K", value: 1, unit: "1", provenanceRef: "assumed", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
      }),
    }))).toThrow(/must not mix silently/);
    const direct = evaluateSteelCapacity(capacityInput({
      usStabilityContext: usStability({ method: "DIRECT_ANALYSIS_BASED", secondOrder: "P_DELTA" }),
      stability: stability({
        effectiveLengthMajorM: null,
        effectiveLengthMinorM: null,
        effectiveLengthM: null,
        restraintDescription: "direct-analysis workflow, no K",
      }),
      requiredProperties: ["material.yieldStrength", "section.area"],
    }));
    expect(direct.compressionChecks?.map((row) => row.methodId)).toEqual(["US_COMPRESSION_SQUASH_YIELD_MECHANICS"]);
    expect(direct.governingMethodId).toBe("US_COMPRESSION_SQUASH_YIELD_MECHANICS");
    expect(() => assertD1cNotCompleteUsStabilityAnalysis()).toThrow(/not complete US stability analysis/);
    expect(() => assertUsMemberStabilityNotGlobalFrame()).toThrow(/not global frame stability/);
    expect(D1C_EQUALS_COMPLETE_US_STABILITY_ANALYSIS).toBe(false);
    expect(MEMBER_STABILITY_EQUALS_GLOBAL_FRAME_STABILITY).toBe(false);
    expect(US_MEMBER_COMPRESSION_EQUALS_GLOBAL_FRAME_VALIDATION).toBe(false);
    expect(GENERAL_FEA_CAPABILITY_CLAIMED).toBe(false);
    expect(US_SEISMIC_COMPRESSION_DESIGN_IMPLEMENTED).toBe(false);
    expect(US_CONNECTION_COMPRESSION_DESIGN_IMPLEMENTED).toBe(false);
  });

  it("supports multi-jurisdiction, international direct-contract, and AI/optimizer fail-closed boundaries", () => {
    const ca = evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({ buildingCodeAdoptionRef: "ca", buildingCodeAdoption: adoption({ adoptionId: "ca" }) }),
    }));
    const tx = evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({
        buildingCodeAdoptionRef: "tx",
        buildingCodeAdoption: adoption({ adoptionId: "tx", jurisdiction: "texas" }),
      }),
    }));
    expect(ca.capacity?.value).toBe(tx.capacity?.value);
    const international = evaluateSteelCapacity(capacityInput({
      standardContext: createConfiguredKnowledgeContext({
        contextId: "ctx-aisc-other-us3",
        jurisdictionProfileRef: "other",
        standardFamily: "AISC",
        standardCode: "AISC 360",
        edition: AISC_UNKNOWN_EDITION_TOKEN,
        materialScope: "steel",
      }),
      designContext: { ...designContext(usStandard("ctx-aisc-other-us3")), standardContextRef: "ctx-aisc-other-us3" },
      demand: demand(usStandard("ctx-aisc-other-us3")),
      usSteelContext: usSteel({
        jurisdictionProfileRef: "other",
        directContractProfile: true,
        buildingCodeAdoption: null,
        buildingCodeAdoptionRef: null,
      }),
    }));
    expect(international.implemented).toBe(true);
    expect(DIRECT_CONTRACT_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE).toBe(false);
    expect(() => denyAiUsKFactor()).toThrow(/K factor/);
    expect(() => denyAiUsStabilityMethod()).toThrow(/stability-analysis method/);
    expect(() => denyAiUsElementClassification()).toThrow(/element classification/);
    expect(() => denyAiUsCompressionFactor()).toThrow(/compression factor/);
    expect(() => denyAiUsCompressionStrength()).toThrow(/compression strength/);
    expect(() => denyAiUsConformanceClaim()).toThrow(/compliance/);
    expect(AI_US_COMPRESSION_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(LLM_US_COMPRESSION_STRENGTH_AUTHORITY).toBe(false);
    expect(AI_EFFECTIVE_LENGTH_FACTOR_AUTHORITY).toBe(false);
    expect(AI_STABILITY_METHOD_AUTHORITY).toBe(false);
    expect(AI_ELEMENT_CLASSIFICATION_AUTHORITY).toBe(false);
    expect(AI_FACTOR_AUTHORITY).toBe(false);
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(() => assertAiscCompressionEditionIsolation("2010", "2016")).toThrow(/STANDARD_VERSION_CONFLICT/);
    expect(() => evaluateSteelCapacity(capacityInput({
      designContext: { ...designContext(usStandard()), validationState: "CERTIFIED" },
    }))).toThrow(/certified/);
    expect(() => assertOptimizationUsCompressionRecheck({
      candidateSectionRef: "W12x50",
      proposedBy: "AI",
      deterministicRecheckRequired: true,
      rechecked: true,
      memberCheckState: "CHECK_UNDETERMINED",
    })).toThrow(/undetermined compression/);
    expect(US_OPTIMIZATION_ACCEPTS_UNDETERMINED_COMPRESSION).toBe(false);
  });

  it("keeps AU/EU/US Euler physics identical and does not regress AU/EU or contaminate the global core", () => {
    const e = { name: "E", value: 200, unit: "GPa", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
    const iyy = { name: "Iyy", value: 100_000_000, unit: "mm4", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
    const commonMajor = eulerLoadN(toElasticModulusPa(e, "E"), toSecondMomentM4(iyy, "Iyy"), 8);
    const us = evaluateSteelCapacity(capacityInput({
      stability: stability({ bucklingAxis: "MAJOR", effectiveLengthM: 8, effectiveLengthMinorM: null }),
      requiredProperties: ["material.yieldStrength", "material.elasticModulus", "section.area", "section.Iyy"],
    }));
    expect(us.compressionChecks?.find((row) => row.axis === "MAJOR_AXIS")?.capacityValueN).toBeCloseTo(commonMajor, 0);
    const auProfile = createAuSteelStandardProfile({ contextId: "ctx-au-us3-euler" });
    const au = evaluateSteelCapacity({
      adapterId: "AU_STEEL",
      designContext: {
        ...designContext(auProfile),
        standardContextRef: auProfile.contextId,
      },
      standardContext: auProfile,
      material: material({ jurisdictionApplicability: ["australia"] }),
      section: section({ catalogSource: "ENGINEER_SUPPLIED", jurisdictionApplicability: ["australia"] }),
      stability: stability({ bucklingAxis: "MAJOR", effectiveLengthM: 8, effectiveLengthMinorM: null }),
      demand: demand(auProfile),
      limitState: "COMPRESSION",
      requiredProperties: ["material.yieldStrength", "material.elasticModulus", "section.area", "section.Iyy"],
    });
    const euContext = {
      ...createConfiguredKnowledgeContext({
        contextId: "ctx-en1993-us3",
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
      stability: stability({ bucklingAxis: "MAJOR", effectiveLengthM: 8, effectiveLengthMinorM: null }),
      demand: demand(euContext),
      limitState: "COMPRESSION",
      requiredProperties: ["material.yieldStrength", "material.elasticModulus", "section.area", "section.Iyy"],
      eurocodeContext: eurocodeContext("DE"),
    });
    expect(au.compressionChecks?.find((row) => row.axis === "MAJOR_AXIS")?.capacityValueN).toBeCloseTo(commonMajor, 0);
    expect(eu.compressionChecks?.find((row) => row.axis === "MAJOR_AXIS")?.capacityValueN).toBeCloseTo(commonMajor, 0);
    expect(IMPLEMENTED_US_TENSION_METHODS).toEqual(["US_TENSION_GROSS_YIELD_MECHANICS", "US_TENSION_NET_FRACTURE_MECHANICS"]);
    expect(AU_METHOD_VALIDATION_INVENTORY).toHaveLength(18);
    expect(AU_STEEL_VALIDATION_MATRIX).toHaveLength(11);
    expect(EU_METHOD_VALIDATION_INVENTORY.length).toBeGreaterThan(20);
    expect(EU_STEEL_VALIDATION_MATRIX).toHaveLength(13);
    expect(IMPLEMENTED_INTERACTION_METHODS).toEqual([]);
    expect(IMPLEMENTED_EU_INTERACTION_METHODS).toEqual([]);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL).toEqual({ ready: true, implemented: false, standards: ["AISC 360"], loadContext: ["ASCE 7"] });
    expect(US_STEEL_IMPLEMENTATION_SUBPHASES[2]).toMatch(/US-3 compression/);
    expect(US_STEEL_PACK_CERTIFIED).toBe(false);
    expect(US_STEEL_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_BOUNDED_METHODS");
    expect(SCHEMA_CHANGE_REQUIRED_FOR_US3).toBe(false);
    expect(EU_ONLY_STEEL_CORE).toBe(false);
    expect(US3_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK).toBe(true);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(STRUCTURAL_STANDARD_TEXT_EMBEDDED).toBe(false);
    expect(D1D_US3_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(D1D_US3_D0_RISK_DISPOSITION.REDUCED).toEqual(["D0-R01"]);
    const usSrc = ["evaluate.ts", "registry.ts"].map((name) => readFileSync(join(here, "us-compression", name), "utf8")).join("\n");
    expect(usSrc).not.toMatch(/AU_COMPRESSION_SQUASH_YIELD|AS 4100|alpha_b|phiNc|γM1|chi_reduction|National Annex|NDP/);
    const mechanicsSrc = readFileSync(join(here, "mechanics", "euler.ts"), "utf8");
    expect(mechanicsSrc).not.toMatch(/phi_c|Omega_c|AISC Pn|imperfection factor/);
  });
});
