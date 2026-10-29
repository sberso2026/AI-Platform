import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_BUCKLING_PARAMETER_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_EU_SHEAR_ASSISTANCE_ADVISORY_ONLY,
  AI_NDP_AUTHORITY,
  AI_SHEAR_AREA_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AU_CODE_RULES_REUSED_AS_EU_RULES,
  AUST300_EU_DEFAULT,
  AUTOMATIC_ENGINEERING_APPROVAL,
  AXIAL_SHEAR_INTERACTION_IMPLEMENTED,
  BENDING_SHEAR_INTERACTION_IMPLEMENTED,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  COMBINED_ACTION_IMPLEMENTED,
  COMMON_BENCHMARK_EQUALS_EUROCODE_CONFORMANCE,
  CONNECTION_SHEAR_DESIGN_IMPLEMENTED,
  DEFAULT_EU_NATIONAL_ANNEX,
  ELASTIC_SHEAR_BUCKLING_EQUALS_CODE_CAPACITY,
  EOS_D1D_EU5_PHASE,
  EU_INITIAL_STEEL_STANDARD_PART,
  EU_ONLY_STEEL_CORE,
  EU_OPTIMIZATION_ACCEPTS_UNDETERMINED_SHEAR,
  EU_SHEAR_BUCKLING_COEFFICIENT_GUESSED,
  EU_SHEAR_IMPLEMENTED,
  EU_SHEAR_PARTIAL_FACTOR_GUESSED,
  EU_STEEL_IMPLEMENTATION_MATURITY,
  EU_STEEL_PACK_CERTIFIED,
  EU_TENSION_FIELD_ACTION_IMPLEMENTED,
  EU_WEB_SLENDERNESS_LIMIT_GUESSED,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  GENERIC_SHEAR_MECHANICS_EQUALS_EN1993_CAPACITY,
  LLM_EU_SHEAR_CAPACITY_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_CODE_CHECK,
  MIXED_AUTHORITY_SHEAR_COMPARISON_GOVERNED,
  SCHEMA_CHANGE_REQUIRED_FOR_EU5,
  SHEAR_REDUCTION_RULE_GUESSED,
  SILENT_EU_STANDARD_EDITION_INFERENCE,
  SILENT_SHEAR_AREA_ASSUMPTION,
  SILENT_STIFFENER_ASSUMPTION,
  TORSIONAL_DESIGN_IMPLEMENTED,
  UNKNOWN_EU_SHEAR_CODE_PARAMETER_GUESSED,
  type EurocodeNationalAnnex,
  type EurocodeSteelDesignContext,
  type SteelCapacityEngineInput,
  type SteelDesignContext,
  type SteelMaterialDesignProperties,
  type SteelSectionDesignProperties,
  type SteelShearInputContext,
  type StructuralStandardContext,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import {
  AU_METHOD_VALIDATION_INVENTORY,
  AU_SHEAR_IMPLEMENTATION_REVIEW,
  AU_SHEAR_IMPLEMENTATION_REVIEWED,
  AU_STEEL_VALIDATION_MATRIX,
  COMMON_SHEAR_MECHANICS_REUSED_WHERE_VALID,
  D1D_EU5_D0_RISK_DISPOSITION,
  EU_SHEAR_METHOD_REGISTRY,
  EU_SHEAR_STANDARD_PART_DEPENDENCY_MODEL,
  FRAMEWORK_ONLY_EU_SHEAR_METHODS,
  IMPLEMENTED_EU_BENDING_METHODS,
  IMPLEMENTED_EU_COMPRESSION_METHODS,
  IMPLEMENTED_EU_SHEAR_METHODS,
  IMPLEMENTED_EU_TENSION_METHODS,
  IMPLEMENTED_INTERACTION_METHODS,
  STEEL_ADAPTER_BOUNDARIES,
  US_STEEL_IMPLEMENTATION_SUBPHASES,
  assertAiCannotInventShear,
  assertMixedAuthorityShearComparisonGoverned,
  assertOptimizationEuShearRecheck,
  assertShearGenerationCompatible,
  consumeDemandHandoff,
  createAuSteelStandardProfile,
  denyAiBucklingCoefficientChoice,
  denyAiConformanceClaim,
  denyAiNdpSupply,
  denyAiShearAreaChoice,
  denyAiShearCapacityOrigin,
  denyAiStiffenerChoice,
  denyAiWebSlendernessChoice,
  denyNationalAnnexFromUserLocation,
  elasticShearBucklingForceN,
  euShearCodeProfileCheckState,
  evaluateEuSteelShearCodeProfile,
  evaluateSteelCapacity,
  orchestrateEuShearDesignCheck,
  requestEuSectionShearCapacity,
  requestEuShearAreaFromGross,
  requestEuShearBucklingCoefficient,
  requestEuShearPartialFactor,
  requestEuTensionFieldAction,
  requestEuWebSlendernessLimit,
  requestEuWebStabilityCapacity,
  scoreEuShearBenchmark,
  toAreaM2,
  toElasticModulusPa,
  unknownEurocodeVersion,
  vonMisesShearYieldN,
} from "./index";

const here = dirname(fileURLToPath(import.meta.url));

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

function euStandard(country = "DE"): StructuralStandardContext {
  return {
    ...createConfiguredKnowledgeContext({
      contextId: `ctx-en1993-eu5-${country}`,
      jurisdictionProfileRef: "eu-eea",
      standardFamily: "EN",
      standardCode: "EN 1993-1-1",
      edition: "UNKNOWN_PENDING_CONFIRMATION",
      materialScope: "steel",
    }),
    nationalAnnexRef: {
      annexId: `NA-${country}-EN1993-1-1`,
      country,
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
}

function eurocodeContext(country = "DE", overrides: Partial<EurocodeSteelDesignContext> = {}): EurocodeSteelDesignContext {
  return {
    contextId: `ctx-eu-shear-${country}`,
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-eu5",
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
    projectContextRef: "proj-eu5",
    calculationContextRef: "calc-eu5",
    sourceAuthorityRef: "governed-project-profile",
    intendedStandardProfile: "EN1993",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: "eu5:shear",
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
    ...overrides,
  };
}

function demand(context: StructuralStandardContext, valueN = 400_000): SteelCapacityEngineInput["demand"] {
  return {
    resultId: "demand-eu5",
    memberId: "m-eu5",
    shear: { value: valueN, unit: "N", locationM: 2, signed: valueN },
    moment: { value: 100_000, unit: "N.m", locationM: 4, signed: 100_000 },
    axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "D1C deflection handoff; not recalculated in EU shear" },
    capacityPresent: false,
    standardContext: context,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c", sourceKind: "calculation", reference: "d1c-shear" }],
    combinationId: "comb-eu5",
  };
}

function material(patch: Partial<SteelMaterialDesignProperties> = {}): SteelMaterialDesignProperties {
  return {
    materialRef: "mat-eu5",
    grade: "S355",
    yieldStrength: { name: "fy", value: 300, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    ultimateStrength: { name: "fu", value: 440, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    elasticModulus: { name: "E", value: 200, unit: "GPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    shearModulus: { name: "G", value: 80, unit: "GPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    poissonRatio: { name: "nu", value: 0.3, unit: "1", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    density: null,
    thicknessDependentMetadata: null,
    jurisdictionApplicability: ["eu-eea"],
    ...patch,
  };
}

function section(patch: Partial<SteelSectionDesignProperties> = {}): SteelSectionDesignProperties {
  return {
    sectionRef: "sec-eu5",
    sectionFamily: "IPE",
    catalogSource: "ENGINEER_SUPPLIED",
    catalogVersion: null,
    jurisdictionApplicability: ["eu-eea"],
    area: { name: "Ag", value: 5140, unit: "mm2", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Iyy: { name: "Iyy", value: 100_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Izz: { name: "Izz", value: 20_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    sectionModulusYy: { name: "Zyy", value: 1_000_000, unit: "mm3", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    sectionModulusZz: { name: "Zzz", value: 200_000, unit: "mm3", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    plasticModulusYy: null,
    plasticModulusZz: null,
    torsionConstant: { name: "J", value: 500_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    warpingConstant: { name: "Iw", value: 200_000_000_000, unit: "mm6", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    radiusOfGyrationYy: null,
    radiusOfGyrationZz: null,
    netArea: { name: "An", value: 4500, unit: "mm2", provenanceRef: "engineer-net-area", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    shearArea: { name: "Av", value: 5_000, unit: "mm2", provenanceRef: "engineer-shear-area", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    webDepth: { name: "d", value: 300, unit: "mm", provenanceRef: "engineer-web-geometry", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    webThickness: { name: "tw", value: 8, unit: "mm", provenanceRef: "engineer-web-geometry", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    geometricDimensions: {},
    ...patch,
  };
}

function shearContext(patch: Partial<SteelShearInputContext> = {}): SteelShearInputContext {
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
  return shearContext({ shearBucklingCoefficient: null, stiffenerSpacing: null, panelLength: null, panelBoundaryMetadata: null });
}

function designContext(context: StructuralStandardContext): SteelDesignContext {
  return {
    designContextId: "dc-eu5",
    memberRef: "m-eu5",
    sectionRef: "sec-eu5",
    materialRef: "mat-eu5",
    demandRefs: ["demand-eu5"],
    standardContextRef: context.contextId,
    parameterSetRef: null,
    effectiveLengthContextRef: null,
    restraintContextRef: "shear-eu5",
    stabilityContextRef: null,
    fabricationContextRef: null,
    evidenceRefs: [{ evidenceId: "ev-eng", sourceKind: "human_input", reference: "engineer" }],
    toolRef: "EOS_EU_STEEL_SHEAR",
    methodRef: "EU_SHEAR",
    provenanceRef: governedProvenance({ jurisdiction: "eu-eea", standard: "EN 1993-1-1", calculationMethod: "EU_SHEAR" }),
    validationState: "BENCHMARKED",
    reviewState: "required",
  };
}

function capacityInput(patch: Partial<SteelCapacityEngineInput> = {}): SteelCapacityEngineInput {
  const standardContext = patch.standardContext ?? euStandard();
  return {
    adapterId: "EU_STEEL",
    designContext: designContext(standardContext),
    standardContext,
    material: material(),
    section: section(),
    stability: null,
    demand: demand(standardContext),
    limitState: "SHEAR_MAJOR",
    requiredProperties: ["material.yieldStrength", "section.shearArea"],
    eurocodeContext: eurocodeContext(),
    shear: shearContext(),
    ...patch,
  };
}

describe("EOS-D1D-EU-5 Eurocode steel shear/web stability", () => {
  it("reviews AU shear, reuses common mechanics, and keeps code-profile rules unguessed", () => {
    expect(EOS_D1D_EU5_PHASE).toBe("EOS-D1D-EU-5");
    expect(AU_SHEAR_IMPLEMENTATION_REVIEWED).toBe(true);
    expect(COMMON_SHEAR_MECHANICS_REUSED_WHERE_VALID).toBe(true);
    expect(AU_CODE_RULES_REUSED_AS_EU_RULES).toBe(false);
    expect(AU_SHEAR_IMPLEMENTATION_REVIEW.some((row) => row.classification === "JURISDICTION_NEUTRAL_REUSABLE")).toBe(true);
    expect(IMPLEMENTED_EU_SHEAR_METHODS).toEqual([
      "EU_SHEAR_ELASTIC_MAJOR_MECHANICS",
      "EU_SHEAR_ELASTIC_MINOR_MECHANICS",
      "EU_SHEAR_ELASTIC_BUCKLING_MECHANICS",
    ]);
    expect(FRAMEWORK_ONLY_EU_SHEAR_METHODS).toContain("EU_SECTION_SHEAR_CAPACITY_CODE_PROFILE");
    expect(FRAMEWORK_ONLY_EU_SHEAR_METHODS).toContain("EU_WEB_STABILITY_CODE_PROFILE");
    expect(EU_SHEAR_METHOD_REGISTRY).toHaveLength(7);
    expect(EU_INITIAL_STEEL_STANDARD_PART).toBe("EN_1993_1_1");
    expect(EU_SHEAR_STANDARD_PART_DEPENDENCY_MODEL.webPlateStabilityFrameworkPart).toBe("EN_1993_1_5");
    expect(EU_SHEAR_STANDARD_PART_DEPENDENCY_MODEL.assumedAllWebRulesLiveInEn199311).toBe(false);
    expect(SILENT_EU_STANDARD_EDITION_INFERENCE).toBe(false);
    expect(SILENT_SHEAR_AREA_ASSUMPTION).toBe(false);
    expect(SILENT_STIFFENER_ASSUMPTION).toBe(false);
    expect(GENERIC_SHEAR_MECHANICS_EQUALS_EN1993_CAPACITY).toBe(false);
    expect(ELASTIC_SHEAR_BUCKLING_EQUALS_CODE_CAPACITY).toBe(false);
    expect(EU_WEB_SLENDERNESS_LIMIT_GUESSED).toBe(false);
    expect(EU_SHEAR_BUCKLING_COEFFICIENT_GUESSED).toBe(false);
    expect(EU_SHEAR_PARTIAL_FACTOR_GUESSED).toBe(false);
    expect(UNKNOWN_EU_SHEAR_CODE_PARAMETER_GUESSED).toBe(false);
    expect(EU_TENSION_FIELD_ACTION_IMPLEMENTED).toBe(false);
    expect(() => requestEuWebSlendernessLimit()).toThrow(/webSlendernessLimit/);
    expect(() => requestEuShearBucklingCoefficient()).toThrow(/shearBucklingCoefficient/);
    expect(() => requestEuShearPartialFactor()).toThrow(/partial-factor/);
    expect(() => requestEuSectionShearCapacity()).toThrow(/sectionShearResistance/);
    expect(() => requestEuWebStabilityCapacity()).toThrow(/webStabilityResistance/);
    expect(() => requestEuTensionFieldAction()).toThrow(/tensionFieldAction/);
    expect(() => requestEuShearAreaFromGross()).toThrow(/shearAreaFromGrossOrWeb/);
  });

  it("reuses D1C major/minor shear, requires governed properties, and fails closed", () => {
    const context = euStandard();
    expect(consumeDemandHandoff(demand(context))).toBe("demand-eu5");
    const major = evaluateSteelCapacity(capacityInput({
      material: yieldOnlyMaterial(),
      section: yieldOnlySection(),
      shear: yieldOnlyShear(),
    }));
    expect(major.implemented).toBe(true);
    expect(major.shearChecks?.some((row) => row.axis === "MAJOR_SHEAR")).toBe(true);
    const minor = evaluateSteelCapacity(capacityInput({
      limitState: "SHEAR_MINOR",
      material: yieldOnlyMaterial(),
      section: yieldOnlySection(),
      shear: { ...yieldOnlyShear(), shearAxis: "MINOR_SHEAR" },
    }));
    expect(minor.governingMethodId).toBe("EU_SHEAR_ELASTIC_MINOR_MECHANICS");
    expect(minor.capacity?.value).toBeCloseTo(866_025.4037844386, 6);
    expect(() => evaluateSteelCapacity(capacityInput({
      demand: { ...demand(context), resultId: "" },
    }))).toThrow(/demand missing/);
    expect(() => evaluateSteelCapacity(capacityInput({
      material: yieldOnlyMaterial({ yieldStrength: null }),
      section: yieldOnlySection(),
      shear: yieldOnlyShear(),
    }))).toThrow(/missing material.yieldStrength/);
    expect(() => evaluateSteelCapacity(capacityInput({
      material: yieldOnlyMaterial(),
      section: yieldOnlySection({
        shearArea: { name: "Av", value: 5_000, unit: "mm2", provenanceRef: "ai-inferred", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
      }),
      shear: yieldOnlyShear(),
    }))).toThrow(/AI cannot supply missing shear parameters/);
    expect(() => evaluateSteelCapacity(capacityInput({
      shear: { ...yieldOnlyShear(), stiffenerState: "unknown" },
    }))).toThrow(/unknown required stiffener state/);
    expect(() => evaluateSteelCapacity(capacityInput({ shear: null, limitState: "SHEAR" }))).toThrow(/missing axis/);
    expect(AUST300_EU_DEFAULT).toBe(false);
    expect(() => evaluateSteelCapacity(capacityInput({ section: yieldOnlySection({ catalogSource: "AUST300" }), material: yieldOnlyMaterial(), shear: yieldOnlyShear() }))).toThrow(/not an EU default/);
  });

  it("evaluates elastic shear and buckling as mechanics references, not EN 1993 capacity", () => {
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
    expect(out.resultClass).toBe("MECHANICS_REFERENCE");
    expect(out.capacity?.capacityType).toBe("MECHANICS_REFERENCE");
    expect(out.standardConformanceState).toBe("INTENDED_PROFILE");
    expect(out.shearChecks?.map((row) => row.methodId)).toEqual([
      "EU_SHEAR_ELASTIC_MAJOR_MECHANICS",
      "EU_SHEAR_ELASTIC_BUCKLING_MECHANICS",
    ]);
    expect(out.governingMethodId).toBe("EU_SHEAR_ELASTIC_MAJOR_MECHANICS");
    expect(out.capacity?.value).toBeCloseTo(866_025.4037844386, 6);
    expect(out.reason).not.toMatch(/EN1993_WEB_RESISTANCE|Vpl,Rd certified/);
    expect(out.shearChecks?.find((row) => row.methodType === "ELASTIC_SHEAR_BUCKLING_REFERENCE")?.capacityValueN).toBeCloseTo(3_432_068, 0);
    const yieldBm = scoreEuShearBenchmark("EU-SHEAR-BM-YIELD-MAJOR-HAND-1", 866_025.4037844386);
    const minorBm = scoreEuShearBenchmark("EU-SHEAR-BM-YIELD-MINOR-HAND-1", 866_025.4037844386);
    const bucklingBm = scoreEuShearBenchmark("EU-SHEAR-BM-BUCKLING-HAND-1", 3_432_068);
    expect(yieldBm.evidenceRef).toMatch(/PASS/);
    expect(minorBm.evidenceRef).toMatch(/PASS/);
    expect(bucklingBm.evidenceRef).toMatch(/PASS/);
    expect(COMMON_BENCHMARK_EQUALS_EUROCODE_CONFORMANCE).toBe(false);
    const check = orchestrateEuShearDesignCheck({
      designCheckId: "chk-eu5",
      designContext: designContext(euStandard()),
      capacityInput: capacityInput({ material: yieldOnlyMaterial(), section: yieldOnlySection(), shear: yieldOnlyShear() }),
    });
    expect(check.verdict).toBe("CHECK_UNDETERMINED");
    expect(check.engineeringApproved).toBe(false);
    expect(MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_CODE_CHECK).toBe(false);
    expect(MIXED_AUTHORITY_SHEAR_COMPARISON_GOVERNED).toBe(true);
    expect(() => assertMixedAuthorityShearComparisonGoverned("MECHANICS_REFERENCE", "EUROCODE_PROFILE_SHEAR_CAPACITY")).toThrow(/mixed authority/);
    expect(() => evaluateSteelCapacity(capacityInput({
      shear: shearContext({ stiffenerState: "TRANSVERSE_STIFFENED", stiffenerSpacing: null }),
    }))).toThrow(/missing shear.stiffenerSpacing/);
  });

  it("keeps AU/EU elastic shear and buckling physics identical", () => {
    const fy = { name: "fy", value: 300, unit: "MPa", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
    const av = { name: "Av", value: 5_000, unit: "mm2", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
    const commonVy = vonMisesShearYieldN(fy, av);
    const e = { name: "E", value: 200, unit: "GPa", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
    const nu = { name: "nu", value: 0.3, unit: "1", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
    const commonVcr = elasticShearBucklingForceN({
      EPa: toElasticModulusPa(e, "E"),
      poisson: 0.3,
      kv: 5.34,
      webDepthM: 0.3,
      webThicknessM: 0.008,
      shearAreaM2: toAreaM2(av, "Av"),
    });
    void nu;
    const eu = evaluateSteelCapacity(capacityInput({
      requiredProperties: [
        "material.yieldStrength",
        "material.elasticModulus",
        "material.poissonRatio",
        "section.shearArea",
        "section.webDepth",
        "section.webThickness",
      ],
    }));
    expect(eu.shearChecks?.find((row) => row.methodType === "ELASTIC_SHEAR_REFERENCE")?.capacityValueN).toBe(commonVy);
    expect(eu.shearChecks?.find((row) => row.methodType === "ELASTIC_SHEAR_BUCKLING_REFERENCE")?.capacityValueN).toBeCloseTo(commonVcr, 0);
    const auProfile = createAuSteelStandardProfile({ contextId: "ctx-au-eu5-shear" });
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
      shear: shearContext(),
    });
    expect(au.shearChecks?.find((row) => row.methodType === "ELASTIC_SHEAR_REFERENCE")?.capacityValueN).toBe(commonVy);
    expect(au.shearChecks?.find((row) => row.methodType === "ELASTIC_SHEAR_BUCKLING_REFERENCE")?.capacityValueN).toBeCloseTo(commonVcr, 0);
  });

  it("fails closed for missing NDP, annex mismatch, unknown edition conformance, and AI authority", () => {
    expect(() => evaluateEuSteelShearCodeProfile(capacityInput({ eurocodeContext: eurocodeContext("DE", { nationalAnnex: null }) }))).toThrow(/NATIONAL_ANNEX_REQUIRED/);
    expect(euShearCodeProfileCheckState(capacityInput({ eurocodeContext: eurocodeContext("DE", { nationalAnnex: null }) }))).toBe("CHECK_UNDETERMINED");
    expect(() => evaluateSteelCapacity(capacityInput({
      eurocodeContext: eurocodeContext("DE", { nationalAnnex: annex("FR") }),
    }))).toThrow(/NATIONAL_ANNEX_MISMATCH/);
    expect(() => evaluateSteelCapacity(capacityInput({
      eurocodeContext: eurocodeContext("DE", {
        version: { ...unknownEurocodeVersion("EN 1993-1-1"), edition: "2005" },
        nationalAnnex: annex("DE", { edition: "2010" }),
      }),
    }))).toThrow(/NATIONAL_ANNEX_MISMATCH/);
    expect(() => evaluateSteelCapacity(capacityInput({
      eurocodeContext: eurocodeContext("DE", { standardConformanceState: "CONFORMANCE_VALIDATED" }),
    }))).toThrow(/unknown edition cannot claim code conformance/);
    expect(() => denyNationalAnnexFromUserLocation("ip")).toThrow(/USER_LOCATION_INFERENCE_DENIED/);
    expect(DEFAULT_EU_NATIONAL_ANNEX).toBe(false);
    expect(() => denyAiShearAreaChoice()).toThrow(/shear area/);
    expect(() => assertAiCannotInventShear("AI", false)).toThrow(/shear parameters/);
    expect(() => denyAiWebSlendernessChoice()).toThrow(/web slenderness/);
    expect(() => denyAiBucklingCoefficientChoice()).toThrow(/buckling coefficient/);
    expect(() => denyAiStiffenerChoice()).toThrow(/stiffener/);
    expect(() => denyAiNdpSupply()).toThrow(/cannot supply NDP/);
    expect(() => denyAiShearCapacityOrigin()).toThrow(/originate/);
    expect(() => denyAiConformanceClaim()).toThrow(/cannot claim Eurocode conformance/);
    expect(LLM_EU_SHEAR_CAPACITY_AUTHORITY).toBe(false);
    expect(AI_SHEAR_AREA_AUTHORITY).toBe(false);
    expect(AI_BUCKLING_PARAMETER_AUTHORITY).toBe(false);
    expect(AI_NDP_AUTHORITY).toBe(false);
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(AI_EU_SHEAR_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(() => assertShearGenerationCompatible("SECOND_GENERATION")).toThrow(/STANDARD_VERSION_CONFLICT/);
    expect(() => evaluateSteelCapacity(capacityInput({
      eurocodeContext: eurocodeContext("DE", { version: { ...unknownEurocodeVersion("EN 1993-1-1"), generationFamily: "SECOND_GENERATION" } }),
    }))).toThrow(/STANDARD_VERSION_CONFLICT/);
    expect(() => assertOptimizationEuShearRecheck({
      candidateSectionRef: "ipe-200",
      proposedBy: "AI",
      deterministicRecheckRequired: true,
      rechecked: true,
      memberCheckState: "CHECK_UNDETERMINED",
    })).toThrow(/undetermined shear/);
    expect(EU_OPTIMIZATION_ACCEPTS_UNDETERMINED_SHEAR).toBe(false);
    expect(BENDING_SHEAR_INTERACTION_IMPLEMENTED).toBe(false);
    expect(SHEAR_REDUCTION_RULE_GUESSED).toBe(false);
    expect(AXIAL_SHEAR_INTERACTION_IMPLEMENTED).toBe(false);
    expect(CONNECTION_SHEAR_DESIGN_IMPLEMENTED).toBe(false);
    expect(COMBINED_ACTION_IMPLEMENTED).toBe(false);
    expect(EU_SHEAR_IMPLEMENTED).toBe(false);
    expect(TORSIONAL_DESIGN_IMPLEMENTED).toBe(false);
    expect(GENERAL_FEA_CAPABILITY_CLAIMED).toBe(false);
  });

  it("isolates multi-country annex identities, supports UK extensibility, and keeps AU/US/global core honest", () => {
    const de = evaluateSteelCapacity(capacityInput({
      standardContext: euStandard("DE"),
      designContext: designContext(euStandard("DE")),
      demand: demand(euStandard("DE")),
      eurocodeContext: eurocodeContext("DE"),
      material: yieldOnlyMaterial(),
      section: yieldOnlySection(),
      shear: yieldOnlyShear(),
    }));
    const fr = evaluateSteelCapacity(capacityInput({
      standardContext: euStandard("FR"),
      designContext: { ...designContext(euStandard("FR")), standardContextRef: euStandard("FR").contextId },
      demand: demand(euStandard("FR")),
      eurocodeContext: eurocodeContext("FR"),
      material: yieldOnlyMaterial(),
      section: yieldOnlySection(),
      shear: yieldOnlyShear(),
    }));
    expect(de.capacity?.value).toBe(fr.capacity?.value);
    expect(de.capacity?.standardContextRef?.nationalAnnex).toBe("NA-DE-EN1993-1-1");
    expect(fr.capacity?.standardContextRef?.nationalAnnex).toBe("NA-FR-EN1993-1-1");
    const ukContext = {
      ...createConfiguredKnowledgeContext({
        contextId: "ctx-uk-en1993-eu5",
        jurisdictionProfileRef: "united-kingdom",
        standardFamily: "EN",
        standardCode: "EN 1993-1-1",
        edition: "UNKNOWN_PENDING_CONFIRMATION",
        materialScope: "steel",
      }),
      nationalAnnexRef: {
        annexId: "NA-GB-EN1993-1-1",
        country: "GB",
        jurisdiction: "united-kingdom",
        standardCode: "EN 1993-1-1",
        edition: "UNKNOWN_PENDING_CONFIRMATION",
        annexEdition: null,
        effectiveFrom: "1970-01-01",
        effectiveTo: null,
        parameterSetRef: null,
        sourceReference: "UK Eurocode annex metadata only",
        validationState: "FRAMEWORK_ONLY",
      },
    };
    const uk = evaluateSteelCapacity(capacityInput({
      standardContext: ukContext,
      designContext: { ...designContext(ukContext), standardContextRef: ukContext.contextId },
      demand: demand(ukContext),
      eurocodeContext: eurocodeContext("GB", { jurisdictionProfileRef: "united-kingdom" }),
      material: yieldOnlyMaterial(),
      section: yieldOnlySection(),
      shear: yieldOnlyShear(),
    }));
    expect(uk.implemented).toBe(true);
    expect(IMPLEMENTED_EU_TENSION_METHODS).toEqual(["EU_TENSION_GROSS_YIELD_MECHANICS", "EU_TENSION_NET_FRACTURE_MECHANICS"]);
    expect(IMPLEMENTED_EU_COMPRESSION_METHODS).toEqual([
      "EU_COMPRESSION_SQUASH_YIELD_MECHANICS",
      "EU_COMPRESSION_EULER_MAJOR_MECHANICS",
      "EU_COMPRESSION_EULER_MINOR_MECHANICS",
    ]);
    expect(IMPLEMENTED_EU_BENDING_METHODS).toEqual([
      "EU_BENDING_ELASTIC_MAJOR_MECHANICS",
      "EU_BENDING_ELASTIC_MINOR_MECHANICS",
      "EU_BENDING_ELASTIC_LTB_MECHANICS",
    ]);
    expect(AU_METHOD_VALIDATION_INVENTORY).toHaveLength(18);
    expect(AU_STEEL_VALIDATION_MATRIX).toHaveLength(11);
    expect(IMPLEMENTED_INTERACTION_METHODS).toEqual([]);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.EU_STEEL.implemented).toBe(false);
    expect(US_STEEL_IMPLEMENTATION_SUBPHASES[0]).toMatch(/US-1/);
    expect(EU_STEEL_PACK_CERTIFIED).toBe(false);
    expect(EU_STEEL_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_BOUNDED_METHODS");
    expect(SCHEMA_CHANGE_REQUIRED_FOR_EU5).toBe(false);
    expect(EU_ONLY_STEEL_CORE).toBe(false);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(D1D_EU5_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(D1D_EU5_D0_RISK_DISPOSITION.REDUCED).toEqual(["D0-R01"]);
    expect(CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(AUTOMATIC_ENGINEERING_APPROVAL).toBe(false);
    const euSrc = ["evaluate.ts", "registry.ts"].map((name) => readFileSync(join(here, "eu-shear", name), "utf8")).join("\n");
    expect(euSrc).not.toMatch(/AU_SHEAR_YIELD_REFERENCE|AS 4100|phiVv|0\.6 fy/);
    const mechanicsSrc = readFileSync(join(here, "mechanics", "shear.ts"), "utf8");
    expect(mechanicsSrc).not.toMatch(/EN 1993 shear area|gammaM0|χw|Avz = A - 2btf/);
    const adapterSrc = readFileSync(join(here, "adapters.ts"), "utf8");
    expect(adapterSrc).not.toMatch(/vonMisesShearYieldN|elasticShearBucklingForceN|fy \/ Math.sqrt/);
  });
});
