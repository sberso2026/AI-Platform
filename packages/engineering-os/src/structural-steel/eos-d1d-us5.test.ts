import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_BUCKLING_PARAMETER_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_FACTOR_AUTHORITY,
  AI_SHEAR_AREA_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AI_STIFFENER_AUTHORITY,
  AI_US_SHEAR_ASSISTANCE_ADVISORY_ONLY,
  AI_WEB_SLENDERNESS_AUTHORITY,
  AISC_UNKNOWN_EDITION_TOKEN,
  AU_CODE_RULES_REUSED_AS_US_RULES,
  AUTOMATIC_ENGINEERING_APPROVAL,
  BENDING_CLASSIFICATION_EQUALS_SHEAR_CLASSIFICATION,
  BENCHMARK_EQUALS_AISC_CONFORMANCE,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  COMMON_SHEAR_BENCHMARK_EQUALS_AISC_CONFORMANCE,
  COMMON_SHEAR_MECHANICS_SHARED_ACROSS_LRFD_ASD,
  COMMON_STEEL_FRAMEWORK_REUSED,
  DEFAULT_LRFD_OR_ASD,
  DIRECT_CONTRACT_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE,
  ELASTIC_SHEAR_BUCKLING_EQUALS_AISC_WEB_STRENGTH,
  ELASTIC_SHEAR_EQUALS_AISC_SHEAR_STRENGTH,
  EOS_D1D_US5_PHASE,
  EU_CODE_RULES_REUSED_AS_US_RULES,
  EU_ONLY_STEEL_CORE,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  LLM_US_SHEAR_STRENGTH_AUTHORITY,
  LRFD_ASD_SHEAR_MECHANICS_DUPLICATED,
  MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_AISC_CHECK,
  PARALLEL_US_SHEAR_CORE_CREATED,
  SCHEMA_CHANGE_REQUIRED_FOR_US5,
  SILENT_AISC_EDITION_INFERENCE,
  SILENT_LRFD_ASD_CONVERSION,
  SILENT_SHEAR_AREA_ASSUMPTION,
  SILENT_US_SHEAR_AREA_ASSUMPTION,
  SILENT_US_STIFFENER_ASSUMPTION,
  STRUCTURAL_STANDARD_TEXT_EMBEDDED,
  US1_STANDARD_BINDING_REUSED,
  US2_DESIGN_METHOD_ARCHITECTURE_REUSED,
  US3_STABILITY_ARCHITECTURE_REUSED,
  US4_CLASSIFICATION_ARCHITECTURE_REUSED,
  US5_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK,
  US_AXIAL_SHEAR_INTERACTION_IMPLEMENTED,
  US_BENDING_SHEAR_INTERACTION_IMPLEMENTED,
  US_CONNECTION_SHEAR_DESIGN_IMPLEMENTED,
  US_OPTIMIZATION_ACCEPTS_UNDETERMINED_SHEAR,
  US_SEISMIC_SHEAR_DESIGN_IMPLEMENTED,
  US_SHEAR_AREA_RULE_GUESSED,
  US_SHEAR_ASD_FACTOR_GUESSED,
  US_SHEAR_ASD_FACTOR_SOURCE,
  US_SHEAR_BUCKLING_COEFFICIENT_GUESSED,
  US_SHEAR_BUCKLING_COEFFICIENT_SOURCE,
  US_SHEAR_HUMAN_VALIDATION_REQUIRED,
  US_SHEAR_INDEPENDENT_BENCHMARK_STATE,
  US_SHEAR_LRFD_FACTOR_GUESSED,
  US_SHEAR_LRFD_FACTOR_SOURCE,
  US_SHEAR_REDUCTION_RULE_GUESSED,
  US_SHEAR_STRENGTH_RESULT_STATE,
  US_STEEL_IMPLEMENTATION_MATURITY,
  US_STEEL_PACK_CERTIFIED,
  US_STIFFENER_DESIGN_IMPLEMENTED,
  US_TENSION_FIELD_ACTION_IMPLEMENTED,
  US_TENSION_FIELD_ELIGIBILITY_GUESSED,
  US_WEB_SLENDERNESS_LIMIT_GUESSED,
  US_WEB_STABILITY_RULE_GUESSED,
  UNKNOWN_US_SHEAR_CODE_PARAMETER_GUESSED,
  type BuildingCodeAdoptionContext,
  type EurocodeNationalAnnex,
  type EurocodeSteelDesignContext,
  type SteelCapacityEngineInput,
  type SteelDesignContext,
  type SteelMaterialDesignProperties,
  type SteelSectionDesignProperties,
  type SteelShearInputContext,
  type StructuralStandardContext,
  type USSteelDesignContext,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import {
  AU_EU_SHEAR_IMPLEMENTATION_REVIEW,
  AU_METHOD_VALIDATION_INVENTORY,
  AU_STEEL_VALIDATION_MATRIX,
  COMMON_SHEAR_MECHANICS_REUSED_WHERE_VALID,
  D1D_US5_D0_RISK_DISPOSITION,
  EU_METHOD_VALIDATION_INVENTORY,
  EU_STEEL_VALIDATION_MATRIX,
  FRAMEWORK_ONLY_US_SHEAR_METHODS,
  IMPLEMENTED_EU_INTERACTION_METHODS,
  IMPLEMENTED_INTERACTION_METHODS,
  IMPLEMENTED_US_BENDING_METHODS,
  IMPLEMENTED_US_COMPRESSION_METHODS,
  IMPLEMENTED_US_SHEAR_METHODS,
  IMPLEMENTED_US_TENSION_METHODS,
  STEEL_ADAPTER_BOUNDARIES,
  US_SHEAR_METHOD_REGISTRY,
  US_STEEL_IMPLEMENTATION_SUBPHASES,
  US_TENSION_FIELD_FRAMEWORK_STATE,
  US_WEB_SLENDERNESS_FRAMEWORK_STATE,
  assertAiscShearEditionIsolation,
  assertAiCannotInventShear,
  assertOptimizationUsShearRecheck,
  assertUsMixedAuthorityShearComparison,
  assertUsShearLrfdAsdFactorIsolation,
  consumeDemandHandoff,
  createAuSteelStandardProfile,
  denyAiUsBucklingCoefficient,
  denyAiUsConformanceClaim,
  denyAiUsShearArea,
  denyAiUsShearFactor,
  denyAiUsShearStrength,
  denyAiUsStiffener,
  denyAiUsTensionFieldEligibility,
  denyAiUsWebSlenderness,
  elasticShearBucklingForceN,
  evaluateSteelCapacity,
  evaluateUsSteelShearCodeProfile,
  orchestrateUsShearDesignCheck,
  requestUsSectionShearStrength,
  requestUsShearAreaRule,
  requestUsShearAsdFactor,
  requestUsShearBucklingCoefficient,
  requestUsShearLrfdFactor,
  requestUsTensionFieldAction,
  requestUsTensionFieldEligibility,
  requestUsWebSlendernessLimit,
  requestUsWebStabilityRule,
  scoreUsShearBenchmark,
  toAreaM2,
  toElasticModulusPa,
  unknownEurocodeVersion,
  usBendingClassificationContext,
  usShearCodeProfileCheckState,
  usShearElementClassificationState,
  vonMisesShearYieldN,
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
    contextId: "ctx-us-shear",
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-us5",
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
    projectStandardContextRef: "proj-us5",
    calculationContextRef: "calc-us5",
    engineeringRuleAuthorityRefs: ["VALIDATED_ENGINEERING_REFERENCE"],
    projectOverride: null,
    sourcePrecedence: ["MANDATORY_ADOPTED_CODE", "REFERENCED_STANDARD"],
    intendedStandardProfile: "AISC360",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: "us5:shear",
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
    directContractProfile: false,
    ...overrides,
  };
}

function usStandard(id = "ctx-aisc-us5"): StructuralStandardContext {
  return createConfiguredKnowledgeContext({
    contextId: id,
    jurisdictionProfileRef: "united-states",
    standardFamily: "AISC",
    standardCode: "AISC 360",
    edition: AISC_UNKNOWN_EDITION_TOKEN,
    materialScope: "steel",
  });
}

function demand(context: StructuralStandardContext, valueN = 400_000): SteelCapacityEngineInput["demand"] {
  return {
    resultId: "demand-us5",
    memberId: "m-us5",
    shear: { value: valueN, unit: "N", locationM: 2, signed: valueN },
    moment: { value: 100_000, unit: "N.m", locationM: 4, signed: 100_000 },
    axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "D1C demand handoff; not recalculated in US shear" },
    capacityPresent: false,
    standardContext: context,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c", sourceKind: "calculation", reference: "d1c-shear" }],
    combinationId: "comb-us5",
  };
}

function material(patch: Partial<SteelMaterialDesignProperties> = {}): SteelMaterialDesignProperties {
  return {
    materialRef: "mat-us5",
    grade: "A992",
    yieldStrength: { name: "Fy", value: 300, unit: "MPa", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    ultimateStrength: { name: "Fu", value: 450, unit: "MPa", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    elasticModulus: { name: "E", value: 200, unit: "GPa", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    shearModulus: { name: "G", value: 80, unit: "GPa", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    poissonRatio: { name: "nu", value: 0.3, unit: "1", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    density: null,
    thicknessDependentMetadata: null,
    jurisdictionApplicability: ["united-states"],
    ...patch,
  };
}

function section(patch: Partial<SteelSectionDesignProperties> = {}): SteelSectionDesignProperties {
  return {
    sectionRef: "sec-us5",
    sectionFamily: "W",
    catalogSource: "ENGINEER_SUPPLIED",
    catalogVersion: null,
    jurisdictionApplicability: ["united-states"],
    area: { name: "Ag", value: 5140, unit: "mm2", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Iyy: { name: "Iyy", value: 100_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Izz: { name: "Izz", value: 20_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    sectionModulusYy: { name: "Sx", value: 1_000_000, unit: "mm3", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    sectionModulusZz: { name: "Sy", value: 200_000, unit: "mm3", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    plasticModulusYy: null,
    plasticModulusZz: null,
    torsionConstant: { name: "J", value: 500_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    warpingConstant: { name: "Cw", value: 200_000_000_000, unit: "mm6", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    radiusOfGyrationYy: null,
    radiusOfGyrationZz: null,
    netArea: null,
    shearArea: { name: "Aw", value: 5_000, unit: "mm2", provenanceRef: "engineer-shear-area", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    webDepth: { name: "h", value: 300, unit: "mm", provenanceRef: "engineer-web-geometry", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    webThickness: { name: "tw", value: 8, unit: "mm", provenanceRef: "engineer-web-geometry", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    geometricDimensions: {},
    ...patch,
  };
}

function shearInput(patch: Partial<SteelShearInputContext> = {}): SteelShearInputContext {
  return {
    shearAxis: "MAJOR_SHEAR",
    stiffenerState: "UNSTIFFENED",
    shearBucklingCoefficient: { name: "kv", value: 5.34, unit: "1", provenanceRef: "engineer-plate-buckling-kv", sourceAuthority: "VALIDATED_INTERNAL_ENGINEERING_RULE" },
    stiffenerSpacing: null,
    panelLength: { name: "a", value: 900, unit: "mm", provenanceRef: "engineer-panel-length", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    panelBoundaryMetadata: "simply-supported-panel-governed",
    ...patch,
  };
}

function yieldOnlySection(patch: Partial<SteelSectionDesignProperties> = {}): SteelSectionDesignProperties {
  return section({ webDepth: undefined, webThickness: undefined, ...patch });
}

function yieldOnlyMaterial(patch: Partial<SteelMaterialDesignProperties> = {}): SteelMaterialDesignProperties {
  return material({ poissonRatio: null, ...patch });
}

function yieldOnlyShear(): SteelShearInputContext {
  return shearInput({ shearBucklingCoefficient: null, stiffenerSpacing: null, panelLength: null, panelBoundaryMetadata: null });
}

function designContext(context: StructuralStandardContext): SteelDesignContext {
  return {
    designContextId: "dc-us5",
    memberRef: "m-us5",
    sectionRef: "sec-us5",
    materialRef: "mat-us5",
    demandRefs: ["demand-us5"],
    standardContextRef: context.contextId,
    parameterSetRef: null,
    effectiveLengthContextRef: null,
    restraintContextRef: "shear-us5",
    stabilityContextRef: null,
    fabricationContextRef: null,
    evidenceRefs: [{ evidenceId: "ev-eng", sourceKind: "human_input", reference: "engineer" }],
    toolRef: "EOS_US_STEEL_SHEAR",
    methodRef: "US_SHEAR",
    provenanceRef: governedProvenance({ jurisdiction: "united-states", standard: "AISC 360", calculationMethod: "US_SHEAR" }),
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
    stability: null,
    demand: demand(standardContext),
    limitState: "SHEAR_MAJOR",
    requiredProperties: ["material.yieldStrength", "section.shearArea"],
    usSteelContext: usSteel(),
    shear: shearInput(),
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
    contextId: `ctx-eu-us5-${country}`,
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-us5",
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
    projectContextRef: "proj-us5",
    calculationContextRef: "calc-us5",
    sourceAuthorityRef: "governed-project-profile",
    intendedStandardProfile: "EN1993",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: "us5:eu-shear",
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
  };
}

describe("EOS-D1D-US-5 US steel shear/web stability", () => {
  it("reuses common shear mechanics and keeps AISC code-profile rules unguessed", () => {
    expect(EOS_D1D_US5_PHASE).toBe("EOS-D1D-US-5");
    expect(COMMON_STEEL_FRAMEWORK_REUSED).toBe(true);
    expect(US1_STANDARD_BINDING_REUSED).toBe(true);
    expect(US2_DESIGN_METHOD_ARCHITECTURE_REUSED).toBe(true);
    expect(US3_STABILITY_ARCHITECTURE_REUSED).toBe(true);
    expect(US4_CLASSIFICATION_ARCHITECTURE_REUSED).toBe(true);
    expect(PARALLEL_US_SHEAR_CORE_CREATED).toBe(false);
    expect(AU_CODE_RULES_REUSED_AS_US_RULES).toBe(false);
    expect(EU_CODE_RULES_REUSED_AS_US_RULES).toBe(false);
    expect(COMMON_SHEAR_MECHANICS_REUSED_WHERE_VALID).toBe(true);
    expect(AU_EU_SHEAR_IMPLEMENTATION_REVIEW.some((row) => row.classification === "JURISDICTION_NEUTRAL_REUSABLE")).toBe(true);
    expect(IMPLEMENTED_US_SHEAR_METHODS).toEqual([
      "US_SHEAR_ELASTIC_MAJOR_MECHANICS",
      "US_SHEAR_ELASTIC_MINOR_MECHANICS",
      "US_SHEAR_ELASTIC_BUCKLING_MECHANICS",
    ]);
    expect(FRAMEWORK_ONLY_US_SHEAR_METHODS).toEqual(expect.arrayContaining([
      "US_SECTION_SHEAR_STRENGTH_CODE_PROFILE",
      "US_SHEAR_LRFD",
      "US_SHEAR_ASD",
      "US_WEB_STABILITY_CODE_PROFILE",
      "US_TENSION_FIELD_CODE_PROFILE",
    ]));
    expect(US_SHEAR_METHOD_REGISTRY).toHaveLength(9);
    expect(SILENT_AISC_EDITION_INFERENCE).toBe(false);
    expect(DEFAULT_LRFD_OR_ASD).toBe(false);
    expect(SILENT_LRFD_ASD_CONVERSION).toBe(false);
    expect(COMMON_SHEAR_MECHANICS_SHARED_ACROSS_LRFD_ASD).toBe(true);
    expect(LRFD_ASD_SHEAR_MECHANICS_DUPLICATED).toBe(false);
    expect(ELASTIC_SHEAR_EQUALS_AISC_SHEAR_STRENGTH).toBe(false);
    expect(ELASTIC_SHEAR_BUCKLING_EQUALS_AISC_WEB_STRENGTH).toBe(false);
    expect(SILENT_SHEAR_AREA_ASSUMPTION).toBe(false);
    expect(SILENT_US_SHEAR_AREA_ASSUMPTION).toBe(false);
    expect(US_SHEAR_AREA_RULE_GUESSED).toBe(false);
    expect(US_WEB_SLENDERNESS_LIMIT_GUESSED).toBe(false);
    expect(BENDING_CLASSIFICATION_EQUALS_SHEAR_CLASSIFICATION).toBe(false);
    expect(SILENT_US_STIFFENER_ASSUMPTION).toBe(false);
    expect(US_STIFFENER_DESIGN_IMPLEMENTED).toBe(false);
    expect(US_SHEAR_BUCKLING_COEFFICIENT_GUESSED).toBe(false);
    expect(US_WEB_STABILITY_RULE_GUESSED).toBe(false);
    expect(US_TENSION_FIELD_ACTION_IMPLEMENTED).toBe(false);
    expect(US_TENSION_FIELD_ELIGIBILITY_GUESSED).toBe(false);
    expect(US_SHEAR_LRFD_FACTOR_GUESSED).toBe(false);
    expect(US_SHEAR_ASD_FACTOR_GUESSED).toBe(false);
    expect(US_SHEAR_LRFD_FACTOR_SOURCE).toBe("VALIDATION_REQUIRED");
    expect(US_SHEAR_ASD_FACTOR_SOURCE).toBe("VALIDATION_REQUIRED");
    expect(US_SHEAR_BUCKLING_COEFFICIENT_SOURCE).toBe("VALIDATION_REQUIRED");
    expect(UNKNOWN_US_SHEAR_CODE_PARAMETER_GUESSED).toBe(false);
    expect(usShearElementClassificationState()).toBe("VALIDATION_REQUIRED");
    expect(US_WEB_SLENDERNESS_FRAMEWORK_STATE.limitGuessed).toBe(false);
    expect(US_TENSION_FIELD_FRAMEWORK_STATE.actionImplemented).toBe(false);
    const flangeBending = usBendingClassificationContext({ element: "FLANGE", axis: "MAJOR_AXIS", limitState: "BENDING" });
    expect(flangeBending.compactnessState).toBe("VALIDATION_REQUIRED");
    expect(usShearElementClassificationState()).not.toBe("CLASSIFIED");
    expect(() => requestUsShearLrfdFactor()).toThrow(/phi_v/);
    expect(() => requestUsShearAsdFactor()).toThrow(/Omega_v/);
    expect(() => requestUsShearBucklingCoefficient()).toThrow(/shearBucklingCoefficient/);
    expect(() => requestUsWebSlendernessLimit()).toThrow(/webSlendernessLimit/);
    expect(() => requestUsWebStabilityRule()).toThrow(/webStabilityRule/);
    expect(() => requestUsSectionShearStrength()).toThrow(/sectionShearStrength/);
    expect(() => requestUsShearAreaRule()).toThrow(/shearAreaFromGrossOrWeb/);
    expect(() => requestUsTensionFieldAction()).toThrow(/tensionFieldAction/);
    expect(() => requestUsTensionFieldEligibility()).toThrow(/tensionFieldEligibility/);
    expect(() => assertUsShearLrfdAsdFactorIsolation("LRFD", "Omega_v")).toThrow(/ASD factor cannot be used in LRFD/);
    expect(() => assertUsShearLrfdAsdFactorIsolation("ASD", "phi_v")).toThrow(/LRFD factor cannot be used in ASD/);
  });

  it("requires governed US shear context, D1C shear, Av, and fails closed on missing inputs", () => {
    const context = usStandard();
    expect(consumeDemandHandoff(demand(context))).toBe("demand-us5");
    expect(() => evaluateSteelCapacity(capacityInput({ usSteelContext: null, material: yieldOnlyMaterial(), section: yieldOnlySection(), shear: yieldOnlyShear() }))).toThrow(/missing AISC context/);
    expect(() => evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({ designMethod: null }),
      material: yieldOnlyMaterial(),
      section: yieldOnlySection(),
      shear: yieldOnlyShear(),
    }))).toThrow(/DESIGN_METHOD_REQUIRED/);
    expect(() => evaluateSteelCapacity(capacityInput({
      demand: { ...demand(context), resultId: "" },
      material: yieldOnlyMaterial(),
      section: yieldOnlySection(),
      shear: yieldOnlyShear(),
    }))).toThrow(/demand missing/);
    expect(() => evaluateSteelCapacity(capacityInput({
      material: yieldOnlyMaterial({ yieldStrength: null }),
      section: yieldOnlySection(),
      shear: yieldOnlyShear(),
    }))).toThrow(/missing material.yieldStrength/);
    expect(() => evaluateSteelCapacity(capacityInput({
      material: yieldOnlyMaterial(),
      section: yieldOnlySection({ shearArea: null }),
      shear: yieldOnlyShear(),
    }))).toThrow(/missing section.shearArea/);
    expect(() => evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({
        designMethod: "LRFD",
        loadStandard: { standardId: "ASCE_7", standardCode: "ASCE 7", edition: "2022", combinationBasis: "ALLOWABLE", implemented: false },
      }),
      material: yieldOnlyMaterial(),
      section: yieldOnlySection(),
      shear: yieldOnlyShear(),
    }))).toThrow(/incompatible with a governed allowable load basis/);
    expect(() => evaluateSteelCapacity(capacityInput({
      shear: { ...yieldOnlyShear(), stiffenerState: "unknown" },
    }))).toThrow(/unknown required stiffener state/);
    expect(() => evaluateSteelCapacity(capacityInput({ shear: null, limitState: "SHEAR" }))).toThrow(/missing axis/);
    expect(() => evaluateSteelCapacity(capacityInput({
      material: yieldOnlyMaterial(),
      section: yieldOnlySection({
        shearArea: { name: "Aw", value: 5_000, unit: "mm2", provenanceRef: "ai-inferred", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
      }),
      shear: yieldOnlyShear(),
    }))).toThrow(/AI cannot supply missing shear parameters/);
    expect(() => evaluateSteelCapacity(capacityInput({ section: yieldOnlySection({ catalogSource: "AUST300" }), material: yieldOnlyMaterial(), shear: yieldOnlyShear() }))).toThrow(/not a US default/);
  });

  it("evaluates elastic major/minor shear and buckling without labelling them AISC strength", () => {
    const major = evaluateSteelCapacity(capacityInput({
      material: yieldOnlyMaterial(),
      section: yieldOnlySection(),
      shear: yieldOnlyShear(),
    }));
    expect(major.implemented).toBe(true);
    expect(major.resultClass).toBe("MECHANICS_REFERENCE");
    expect(major.capacity?.capacityType).toBe("MECHANICS_REFERENCE");
    expect(major.shearChecks?.map((row) => row.methodId)).toEqual(["US_SHEAR_ELASTIC_MAJOR_MECHANICS"]);
    expect(major.capacity?.value).toBeCloseTo(866_025.4037844386, 6);
    expect(major.interactionReviewRequired).toBe(true);
    const minor = evaluateSteelCapacity(capacityInput({
      limitState: "SHEAR_MINOR",
      material: yieldOnlyMaterial(),
      section: yieldOnlySection(),
      shear: { ...yieldOnlyShear(), shearAxis: "MINOR_SHEAR" },
    }));
    expect(minor.governingMethodId).toBe("US_SHEAR_ELASTIC_MINOR_MECHANICS");
    expect(minor.capacity?.value).toBeCloseTo(866_025.4037844386, 6);
    const out = evaluateSteelCapacity(capacityInput({
      requiredProperties: [
        "material.yieldStrength",
        "material.elasticModulus",
        "material.poissonRatio",
        "section.shearArea",
        "section.webDepth",
        "section.webThickness",
      ],
    }));
    expect(out.shearChecks?.map((row) => row.methodId)).toEqual([
      "US_SHEAR_ELASTIC_MAJOR_MECHANICS",
      "US_SHEAR_ELASTIC_BUCKLING_MECHANICS",
    ]);
    expect(out.governingMethodId).toBe("US_SHEAR_ELASTIC_MAJOR_MECHANICS");
    expect(out.shearChecks?.find((row) => row.methodType === "ELASTIC_SHEAR_BUCKLING_REFERENCE")?.capacityValueN).toBeCloseTo(3_432_068, 0);
    expect(out.reason).not.toMatch(/AISC_NOMINAL|phi_vVn|Vn\/Omega/);
    const yieldBm = scoreUsShearBenchmark("US-SHEAR-BM-YIELD-MAJOR-HAND-1", 866_025.4037844386);
    const minorBm = scoreUsShearBenchmark("US-SHEAR-BM-YIELD-MINOR-HAND-1", 866_025.4037844386);
    const bucklingBm = scoreUsShearBenchmark("US-SHEAR-BM-BUCKLING-HAND-1", 3_432_068);
    expect(yieldBm.evidenceRef).toMatch(/PASS/);
    expect(minorBm.evidenceRef).toMatch(/PASS/);
    expect(bucklingBm.evidenceRef).toMatch(/PASS/);
    expect(BENCHMARK_EQUALS_AISC_CONFORMANCE).toBe(false);
    expect(COMMON_SHEAR_BENCHMARK_EQUALS_AISC_CONFORMANCE).toBe(false);
    expect(US_SHEAR_INDEPENDENT_BENCHMARK_STATE).toBe("PARTIAL");
    expect(US_SHEAR_STRENGTH_RESULT_STATE).toBe("PARTIAL");
    const check = orchestrateUsShearDesignCheck({
      designCheckId: "chk-us5",
      designContext: designContext(usStandard()),
      capacityInput: capacityInput({ material: yieldOnlyMaterial(), section: yieldOnlySection(), shear: yieldOnlyShear() }),
    });
    expect(check.verdict).toBe("CHECK_UNDETERMINED");
    expect(check.engineeringApproved).toBe(false);
    expect(MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_AISC_CHECK).toBe(false);
    expect(CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(AUTOMATIC_ENGINEERING_APPROVAL).toBe(false);
    expect(US_SHEAR_HUMAN_VALIDATION_REQUIRED).toBe(true);
    expect(() => assertUsMixedAuthorityShearComparison("ELASTIC_SHEAR_BUCKLING_REFERENCE", "AISC_LRFD_DESIGN_STRENGTH")).toThrow(/mixed authority/);
    expect(usShearCodeProfileCheckState(capacityInput({ material: yieldOnlyMaterial(), section: yieldOnlySection(), shear: yieldOnlyShear() }))).toBe("CHECK_UNDETERMINED");
    expect(() => evaluateUsSteelShearCodeProfile(capacityInput({ material: yieldOnlyMaterial(), section: yieldOnlySection(), shear: yieldOnlyShear() }))).toThrow(/unknown required code parameter/);
    expect(() => evaluateSteelCapacity(capacityInput({
      shear: shearInput({ stiffenerState: "TRANSVERSE_STIFFENED", stiffenerSpacing: null }),
    }))).toThrow(/missing shear.stiffenerSpacing/);
    const asdSi = evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({ designMethod: "ASD", unitSystem: "SI" }),
      material: yieldOnlyMaterial(),
      section: yieldOnlySection(),
      shear: yieldOnlyShear(),
    }));
    expect(asdSi.capacity?.value).toBe(major.capacity?.value);
    const lrfdSi = evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({ designMethod: "LRFD", unitSystem: "SI" }),
      material: yieldOnlyMaterial(),
      section: yieldOnlySection(),
      shear: yieldOnlyShear(),
    }));
    const asdCustomary = evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({ designMethod: "ASD", unitSystem: "US_CUSTOMARY" }),
      material: yieldOnlyMaterial(),
      section: yieldOnlySection(),
      shear: yieldOnlyShear(),
    }));
    expect(lrfdSi.capacity?.value).toBe(major.capacity?.value);
    expect(asdCustomary.capacity?.value).toBe(major.capacity?.value);
  });

  it("supports multi-jurisdiction, international direct-contract, and AI/optimizer fail-closed boundaries", () => {
    const ca = evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({ buildingCodeAdoptionRef: "ca", buildingCodeAdoption: adoption({ adoptionId: "ca" }) }),
      material: yieldOnlyMaterial(),
      section: yieldOnlySection(),
      shear: yieldOnlyShear(),
    }));
    const tx = evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({
        buildingCodeAdoptionRef: "tx",
        buildingCodeAdoption: adoption({ adoptionId: "tx", jurisdiction: "texas" }),
      }),
      material: yieldOnlyMaterial(),
      section: yieldOnlySection(),
      shear: yieldOnlyShear(),
    }));
    expect(ca.capacity?.value).toBe(tx.capacity?.value);
    const international = evaluateSteelCapacity(capacityInput({
      standardContext: createConfiguredKnowledgeContext({
        contextId: "ctx-aisc-other-us5",
        jurisdictionProfileRef: "other",
        standardFamily: "AISC",
        standardCode: "AISC 360",
        edition: AISC_UNKNOWN_EDITION_TOKEN,
        materialScope: "steel",
      }),
      designContext: { ...designContext(usStandard("ctx-aisc-other-us5")), standardContextRef: "ctx-aisc-other-us5" },
      demand: demand(usStandard("ctx-aisc-other-us5")),
      usSteelContext: usSteel({
        jurisdictionProfileRef: "other",
        directContractProfile: true,
        buildingCodeAdoption: null,
        buildingCodeAdoptionRef: null,
      }),
      material: yieldOnlyMaterial(),
      section: yieldOnlySection(),
      shear: yieldOnlyShear(),
    }));
    expect(international.implemented).toBe(true);
    expect(DIRECT_CONTRACT_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE).toBe(false);
    expect(() => denyAiUsShearArea()).toThrow(/shear area/);
    expect(() => denyAiUsWebSlenderness()).toThrow(/web slenderness/);
    expect(() => denyAiUsStiffener()).toThrow(/stiffener/);
    expect(() => denyAiUsBucklingCoefficient()).toThrow(/buckling coefficient/);
    expect(() => denyAiUsTensionFieldEligibility()).toThrow(/tension-field/);
    expect(() => denyAiUsShearFactor()).toThrow(/shear factor/);
    expect(() => denyAiUsShearStrength()).toThrow(/shear strength/);
    expect(() => denyAiUsConformanceClaim()).toThrow(/compliance/);
    expect(() => assertAiCannotInventShear("AI", false)).toThrow(/shear parameters/);
    expect(AI_US_SHEAR_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(LLM_US_SHEAR_STRENGTH_AUTHORITY).toBe(false);
    expect(AI_SHEAR_AREA_AUTHORITY).toBe(false);
    expect(AI_WEB_SLENDERNESS_AUTHORITY).toBe(false);
    expect(AI_STIFFENER_AUTHORITY).toBe(false);
    expect(AI_BUCKLING_PARAMETER_AUTHORITY).toBe(false);
    expect(AI_FACTOR_AUTHORITY).toBe(false);
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(() => assertAiscShearEditionIsolation("2010", "2016")).toThrow(/STANDARD_VERSION_CONFLICT/);
    expect(GENERAL_FEA_CAPABILITY_CLAIMED).toBe(false);
    expect(US_BENDING_SHEAR_INTERACTION_IMPLEMENTED).toBe(false);
    expect(US_SHEAR_REDUCTION_RULE_GUESSED).toBe(false);
    expect(US_AXIAL_SHEAR_INTERACTION_IMPLEMENTED).toBe(false);
    expect(US_CONNECTION_SHEAR_DESIGN_IMPLEMENTED).toBe(false);
    expect(US_SEISMIC_SHEAR_DESIGN_IMPLEMENTED).toBe(false);
    expect(() => evaluateSteelCapacity(capacityInput({
      designContext: { ...designContext(usStandard()), validationState: "CERTIFIED" },
      material: yieldOnlyMaterial(),
      section: yieldOnlySection(),
      shear: yieldOnlyShear(),
    }))).toThrow(/certified/);
    expect(() => assertOptimizationUsShearRecheck({
      candidateSectionRef: "W12x50",
      proposedBy: "AI",
      deterministicRecheckRequired: true,
      rechecked: true,
      memberCheckState: "CHECK_UNDETERMINED",
    })).toThrow(/undetermined shear/);
    expect(US_OPTIMIZATION_ACCEPTS_UNDETERMINED_SHEAR).toBe(false);
  });

  it("keeps AU/EU/US shear and buckling physics identical and does not regress AU/EU/US packs", () => {
    const fy = { name: "Fy", value: 300, unit: "MPa", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
    const av = { name: "Aw", value: 5_000, unit: "mm2", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
    const commonVy = vonMisesShearYieldN(fy, av);
    const e = { name: "E", value: 200, unit: "GPa", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
    const commonVcr = elasticShearBucklingForceN({
      EPa: toElasticModulusPa(e, "E"),
      poisson: 0.3,
      kv: 5.34,
      webDepthM: 0.3,
      webThicknessM: 0.008,
      shearAreaM2: toAreaM2(av, "Aw"),
    });
    const us = evaluateSteelCapacity(capacityInput({
      requiredProperties: [
        "material.yieldStrength",
        "material.elasticModulus",
        "material.poissonRatio",
        "section.shearArea",
        "section.webDepth",
        "section.webThickness",
      ],
    }));
    expect(us.shearChecks?.find((row) => row.methodType === "ELASTIC_SHEAR_REFERENCE")?.capacityValueN).toBe(commonVy);
    expect(us.shearChecks?.find((row) => row.methodType === "ELASTIC_SHEAR_BUCKLING_REFERENCE")?.capacityValueN).toBeCloseTo(commonVcr, 0);
    const auProfile = createAuSteelStandardProfile({ contextId: "ctx-au-us5-shear" });
    const au = evaluateSteelCapacity({
      adapterId: "AU_STEEL",
      designContext: { ...designContext(auProfile), standardContextRef: auProfile.contextId },
      standardContext: auProfile,
      material: material({ jurisdictionApplicability: ["australia"] }),
      section: section({ catalogSource: "ENGINEER_SUPPLIED", jurisdictionApplicability: ["australia"] }),
      stability: null,
      demand: demand(auProfile),
      limitState: "SHEAR_MAJOR",
      requiredProperties: [
        "material.yieldStrength",
        "material.elasticModulus",
        "material.poissonRatio",
        "section.shearArea",
        "section.webDepth",
        "section.webThickness",
      ],
      shear: shearInput(),
    });
    const euContext = {
      ...createConfiguredKnowledgeContext({
        contextId: "ctx-en1993-us5",
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
      stability: null,
      demand: demand(euContext),
      limitState: "SHEAR_MAJOR",
      requiredProperties: [
        "material.yieldStrength",
        "material.elasticModulus",
        "material.poissonRatio",
        "section.shearArea",
        "section.webDepth",
        "section.webThickness",
      ],
      eurocodeContext: eurocodeContext("DE"),
      shear: shearInput(),
    });
    expect(au.shearChecks?.find((row) => row.methodType === "ELASTIC_SHEAR_REFERENCE")?.capacityValueN).toBe(commonVy);
    expect(eu.shearChecks?.find((row) => row.methodType === "ELASTIC_SHEAR_REFERENCE")?.capacityValueN).toBe(commonVy);
    expect(au.shearChecks?.find((row) => row.methodType === "ELASTIC_SHEAR_BUCKLING_REFERENCE")?.capacityValueN).toBeCloseTo(commonVcr, 0);
    expect(eu.shearChecks?.find((row) => row.methodType === "ELASTIC_SHEAR_BUCKLING_REFERENCE")?.capacityValueN).toBeCloseTo(commonVcr, 0);
    expect(IMPLEMENTED_US_TENSION_METHODS).toEqual(["US_TENSION_GROSS_YIELD_MECHANICS", "US_TENSION_NET_FRACTURE_MECHANICS"]);
    expect(IMPLEMENTED_US_COMPRESSION_METHODS).toEqual([
      "US_COMPRESSION_SQUASH_YIELD_MECHANICS",
      "US_COMPRESSION_EULER_MAJOR_MECHANICS",
      "US_COMPRESSION_EULER_MINOR_MECHANICS",
    ]);
    expect(IMPLEMENTED_US_BENDING_METHODS).toEqual([
      "US_BENDING_ELASTIC_MAJOR_MECHANICS",
      "US_BENDING_ELASTIC_MINOR_MECHANICS",
      "US_BENDING_ELASTIC_LTB_MECHANICS",
    ]);
    expect(AU_METHOD_VALIDATION_INVENTORY).toHaveLength(18);
    expect(AU_STEEL_VALIDATION_MATRIX).toHaveLength(11);
    expect(EU_METHOD_VALIDATION_INVENTORY.length).toBeGreaterThan(20);
    expect(EU_STEEL_VALIDATION_MATRIX).toHaveLength(13);
    expect(IMPLEMENTED_INTERACTION_METHODS).toEqual([]);
    expect(IMPLEMENTED_EU_INTERACTION_METHODS).toEqual([]);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL).toEqual({ ready: true, implemented: false, standards: ["AISC 360"], loadContext: ["ASCE 7"] });
    expect(US_STEEL_IMPLEMENTATION_SUBPHASES[4]).toMatch(/US-5 shear/);
    expect(US_STEEL_PACK_CERTIFIED).toBe(false);
    expect(US_STEEL_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_BOUNDED_METHODS");
    expect(SCHEMA_CHANGE_REQUIRED_FOR_US5).toBe(false);
    expect(EU_ONLY_STEEL_CORE).toBe(false);
    expect(US5_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK).toBe(true);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(STRUCTURAL_STANDARD_TEXT_EMBEDDED).toBe(false);
    expect(D1D_US5_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(D1D_US5_D0_RISK_DISPOSITION.REDUCED).toEqual(["D0-R01"]);
    const usSrc = ["evaluate.ts", "registry.ts"].map((name) => readFileSync(join(here, "us-shear", name), "utf8")).join("\n");
    expect(usSrc).not.toMatch(/AU_SHEAR_YIELD|AS 4100|phiVv|γM1|χw|National Annex|NDP/);
    const mechanicsSrc = readFileSync(join(here, "mechanics", "shear.ts"), "utf8");
    expect(mechanicsSrc).not.toMatch(/phi_v\s*=|Omega_v\s*=|Cv\s*=|h\/tw\s*=/);
  });
});
