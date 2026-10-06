import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_ENGINEERING_APPROVAL,
  AI_EU_BENDING_ASSISTANCE_ADVISORY_ONLY,
  AI_LTB_CURVE_AUTHORITY,
  AI_NDP_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AU_CODE_RULES_REUSED_AS_EU_RULES,
  AUST300_EU_DEFAULT,
  AUTOMATIC_ENGINEERING_APPROVAL,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  COMBINED_ACTION_IMPLEMENTED,
  COMMON_BENCHMARK_EQUALS_EUROCODE_CONFORMANCE,
  DEFAULT_EU_NATIONAL_ANNEX,
  DEFLECTION_ENGINE_DUPLICATED,
  ELASTIC_LTB_EQUALS_CODE_MEMBER_CAPACITY,
  ELASTIC_MECHANICS_EQUALS_EN1993_BENDING_CAPACITY,
  EOS_D1D_EU4_PHASE,
  EU_BENDING_CLASSIFICATION_LIMIT_GUESSED,
  EU_BENDING_PARTIAL_FACTOR_GUESSED,
  EU_INITIAL_STEEL_STANDARD_PART,
  EU_LTB_CURVE_GUESSED,
  EU_LTB_PARAMETER_GUESSED,
  EU_MOMENT_FACTOR_GUESSED,
  EU_ONLY_STEEL_CORE,
  EU_OPTIMIZATION_ACCEPTS_UNDETERMINED_BENDING,
  EU_SHEAR_IMPLEMENTED,
  EU_STEEL_IMPLEMENTATION_MATURITY,
  EU_STEEL_PACK_CERTIFIED,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  LLM_EU_BENDING_CAPACITY_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  MEMBER_BENDING_STABILITY_EQUALS_GLOBAL_FRAME_STABILITY,
  MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_CODE_CHECK,
  MIXED_AUTHORITY_BENDING_COMPARISON_GOVERNED,
  SCHEMA_CHANGE_REQUIRED_FOR_EU4,
  SILENT_EU_STANDARD_EDITION_INFERENCE,
  SILENT_UNBRACED_LENGTH_ASSUMPTION,
  TORSIONAL_DESIGN_IMPLEMENTED,
  UNKNOWN_EU_BENDING_CODE_PARAMETER_GUESSED,
  type EurocodeNationalAnnex,
  type EurocodeSteelDesignContext,
  type SteelCapacityEngineInput,
  type SteelDesignContext,
  type SteelMaterialDesignProperties,
  type SteelSectionDesignProperties,
  type SteelStabilityContext,
  type StructuralStandardContext,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import {
  AU_BENDING_IMPLEMENTATION_REVIEW,
  AU_BENDING_IMPLEMENTATION_REVIEWED,
  AU_METHOD_VALIDATION_INVENTORY,
  AU_STEEL_VALIDATION_MATRIX,
  COMMON_BENDING_MECHANICS_REUSED_WHERE_VALID,
  D1D_EU4_D0_RISK_DISPOSITION,
  EU_BENDING_METHOD_REGISTRY,
  EU_SECTION_RESISTANCE_CLASS_STATE,
  FRAMEWORK_ONLY_EU_BENDING_METHODS,
  IMPLEMENTED_EU_BENDING_METHODS,
  IMPLEMENTED_EU_COMPRESSION_METHODS,
  IMPLEMENTED_EU_TENSION_METHODS,
  IMPLEMENTED_INTERACTION_METHODS,
  STEEL_ADAPTER_BOUNDARIES,
  US_STEEL_IMPLEMENTATION_SUBPHASES,
  assertAiCannotInventLtb,
  assertBendingGenerationCompatible,
  assertMemberBendingNotGlobalFrame,
  assertMixedAuthorityBendingComparisonGoverned,
  assertOptimizationEuBendingRecheck,
  consumeD1cDeflectionHandoff,
  consumeDemandHandoff,
  createAuSteelStandardProfile,
  denyAiBendingCapacityOrigin,
  denyAiConformanceClaim,
  denyAiLtbCurveChoice,
  denyAiNdpSupply,
  denyAiRestraintChoice,
  denyAiUnbracedLengthChoice,
  denyNationalAnnexFromUserLocation,
  elasticLtbMomentNm,
  euBendingCodeProfileCheckState,
  euBendingSectionClassificationState,
  evaluateEuSteelBendingCodeProfile,
  evaluateSteelCapacity,
  firstYieldMomentNm,
  orchestrateEuBendingDesignCheck,
  requestEuBendingPartialFactor,
  requestEuLtbCurve,
  requestEuLtbParameter,
  requestEuMomentFactor,
  requestEuSectionBendingCapacity,
  scoreEuBendingBenchmark,
  selectEuLtbCurve,
  toElasticModulusPa,
  toSecondMomentM4,
  toWarpingM6,
  unknownEurocodeVersion,
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
      contextId: `ctx-en1993-eu4-${country}`,
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
    contextId: `ctx-eu-bending-${country}`,
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-eu4",
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
    projectContextRef: "proj-eu4",
    calculationContextRef: "calc-eu4",
    sourceAuthorityRef: "governed-project-profile",
    intendedStandardProfile: "EN1993",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: "eu4:bending",
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
    ...overrides,
  };
}

function demand(context: StructuralStandardContext, valueNm = 100_000): SteelCapacityEngineInput["demand"] {
  return {
    resultId: "demand-eu4",
    memberId: "m-eu4",
    shear: { value: 0, unit: "N", locationM: 0, signed: 0 },
    moment: { value: valueNm, unit: "N.m", locationM: 4, signed: valueNm },
    axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "D1C deflection handoff; not recalculated in EU bending" },
    capacityPresent: false,
    standardContext: context,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c", sourceKind: "calculation", reference: "d1c-moment" }],
    combinationId: "comb-eu4",
  };
}

function material(patch: Partial<SteelMaterialDesignProperties> = {}): SteelMaterialDesignProperties {
  return {
    materialRef: "mat-eu4",
    grade: "S355",
    yieldStrength: { name: "fy", value: 300, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    ultimateStrength: { name: "fu", value: 440, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    elasticModulus: { name: "E", value: 200, unit: "GPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    shearModulus: { name: "G", value: 80, unit: "GPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    poissonRatio: null,
    density: null,
    thicknessDependentMetadata: null,
    jurisdictionApplicability: ["eu-eea"],
    ...patch,
  };
}

function section(patch: Partial<SteelSectionDesignProperties> = {}): SteelSectionDesignProperties {
  return {
    sectionRef: "sec-eu4",
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
    geometricDimensions: {},
    ...patch,
  };
}

function stability(patch: Partial<SteelStabilityContext> = {}): SteelStabilityContext {
  return {
    stabilityContextId: "stab-eu4",
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
    designContextId: "dc-eu4",
    memberRef: "m-eu4",
    sectionRef: "sec-eu4",
    materialRef: "mat-eu4",
    demandRefs: ["demand-eu4"],
    standardContextRef: context.contextId,
    parameterSetRef: null,
    effectiveLengthContextRef: null,
    restraintContextRef: "stab-eu4",
    stabilityContextRef: "stab-eu4",
    fabricationContextRef: null,
    evidenceRefs: [{ evidenceId: "ev-eng", sourceKind: "human_input", reference: "engineer" }],
    toolRef: "EOS_EU_STEEL_BENDING",
    methodRef: "EU_BENDING",
    provenanceRef: governedProvenance({ jurisdiction: "eu-eea", standard: "EN 1993-1-1", calculationMethod: "EU_BENDING" }),
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
    stability: stability(),
    demand: demand(standardContext),
    limitState: "BENDING_MAJOR",
    requiredProperties: ["material.yieldStrength", "section.sectionModulusYy"],
    eurocodeContext: eurocodeContext(),
    ...patch,
  };
}

describe("EOS-D1D-EU-4 Eurocode steel bending/LTB", () => {
  it("reviews AU bending, reuses common mechanics, and keeps code-profile rules unguessed", () => {
    expect(EOS_D1D_EU4_PHASE).toBe("EOS-D1D-EU-4");
    expect(AU_BENDING_IMPLEMENTATION_REVIEWED).toBe(true);
    expect(COMMON_BENDING_MECHANICS_REUSED_WHERE_VALID).toBe(true);
    expect(AU_CODE_RULES_REUSED_AS_EU_RULES).toBe(false);
    expect(AU_BENDING_IMPLEMENTATION_REVIEW.some((row) => row.classification === "JURISDICTION_NEUTRAL_REUSABLE")).toBe(true);
    expect(IMPLEMENTED_EU_BENDING_METHODS).toEqual([
      "EU_BENDING_ELASTIC_MAJOR_MECHANICS",
      "EU_BENDING_ELASTIC_MINOR_MECHANICS",
      "EU_BENDING_ELASTIC_LTB_MECHANICS",
    ]);
    expect(FRAMEWORK_ONLY_EU_BENDING_METHODS).toContain("EU_SECTION_BENDING_CAPACITY_CODE_PROFILE");
    expect(FRAMEWORK_ONLY_EU_BENDING_METHODS).toContain("EU_MEMBER_BENDING_LTB_CODE_PROFILE");
    expect(EU_BENDING_METHOD_REGISTRY).toHaveLength(7);
    expect(EU_INITIAL_STEEL_STANDARD_PART).toBe("EN_1993_1_1");
    expect(SILENT_EU_STANDARD_EDITION_INFERENCE).toBe(false);
    expect(SILENT_UNBRACED_LENGTH_ASSUMPTION).toBe(false);
    expect(ELASTIC_MECHANICS_EQUALS_EN1993_BENDING_CAPACITY).toBe(false);
    expect(ELASTIC_LTB_EQUALS_CODE_MEMBER_CAPACITY).toBe(false);
    expect(EU_LTB_CURVE_GUESSED).toBe(false);
    expect(EU_LTB_PARAMETER_GUESSED).toBe(false);
    expect(EU_MOMENT_FACTOR_GUESSED).toBe(false);
    expect(EU_BENDING_PARTIAL_FACTOR_GUESSED).toBe(false);
    expect(EU_BENDING_CLASSIFICATION_LIMIT_GUESSED).toBe(false);
    expect(UNKNOWN_EU_BENDING_CODE_PARAMETER_GUESSED).toBe(false);
    expect(EU_SECTION_RESISTANCE_CLASS_STATE.assumedFromClassification).toBe(false);
    expect(euBendingSectionClassificationState()).toBe("VALIDATION_REQUIRED");
    expect(() => requestEuLtbCurve()).toThrow(/ltbCurve/);
    expect(() => requestEuLtbParameter()).toThrow(/ltbReductionFactor/);
    expect(() => requestEuMomentFactor()).toThrow(/momentFactor/);
    expect(() => requestEuBendingPartialFactor()).toThrow(/partial-factor/);
    expect(() => requestEuSectionBendingCapacity()).toThrow(/sectionBendingResistance/);
    expect(() => selectEuLtbCurve("IPE")).toThrow(/CHECK_UNDETERMINED/);
  });

  it("reuses D1C major/minor moment, requires governed properties, and fails closed", () => {
    const context = euStandard();
    expect(consumeDemandHandoff(demand(context))).toBe("demand-eu4");
    expect(consumeD1cDeflectionHandoff(demand(context))).toEqual(demand(context).deflection);
    expect(DEFLECTION_ENGINE_DUPLICATED).toBe(false);
    const major = evaluateSteelCapacity(capacityInput());
    expect(major.implemented).toBe(true);
    expect(major.bendingChecks?.some((row) => row.axis === "MAJOR_AXIS")).toBe(true);
    const minor = evaluateSteelCapacity(capacityInput({
      limitState: "BENDING_MINOR",
      requiredProperties: ["material.yieldStrength", "section.sectionModulusZz"],
    }));
    expect(minor.governingMethodId).toBe("EU_BENDING_ELASTIC_MINOR_MECHANICS");
    expect(minor.capacity?.value).toBe(60_000);
    expect(() => evaluateSteelCapacity(capacityInput({
      demand: { ...demand(context), resultId: "" },
    }))).toThrow(/demand missing/);
    expect(() => evaluateSteelCapacity(capacityInput({
      material: material({ yieldStrength: null }),
    }))).toThrow(/missing material.yieldStrength/);
    expect(() => evaluateSteelCapacity(capacityInput({
      section: section({ sectionModulusYy: null }),
    }))).toThrow(/missing section.sectionModulusYy/);
    expect(() => evaluateSteelCapacity(capacityInput({
      stability: stability({ unbracedLengthM: null }),
    }))).toThrow(/unbraced length/);
    expect(() => evaluateSteelCapacity(capacityInput({
      stability: stability({ lateralRestraint: "unknown" }),
    }))).toThrow(/unknown restraint/);
    expect(AUST300_EU_DEFAULT).toBe(false);
    expect(() => evaluateSteelCapacity(capacityInput({ section: section({ catalogSource: "AUST300" }) }))).toThrow(/not an EU default/);
  });

  it("evaluates elastic bending and LTB as mechanics references, not EN 1993 capacity", () => {
    const out = evaluateSteelCapacity(capacityInput({
      requiredProperties: [
        "material.yieldStrength",
        "material.elasticModulus",
        "material.shearModulus",
        "section.sectionModulusYy",
        "section.Izz",
        "section.torsionConstant",
        "section.warpingConstant",
      ],
    }));
    expect(out.resultClass).toBe("MECHANICS_REFERENCE");
    expect(out.capacity?.capacityType).toBe("MECHANICS_REFERENCE");
    expect(out.standardConformanceState).toBe("INTENDED_PROFILE");
    expect(out.bendingChecks?.map((row) => row.methodId)).toEqual([
      "EU_BENDING_ELASTIC_MAJOR_MECHANICS",
      "EU_BENDING_ELASTIC_LTB_MECHANICS",
    ]);
    expect(out.governingMethodId).toBe("EU_BENDING_ELASTIC_LTB_MECHANICS");
    expect(out.capacity?.value).toBeCloseTo(168_757, 0);
    expect(out.reason).not.toMatch(/EN1993_MEMBER_BENDING_RESISTANCE|Mc,Rd certified/);
    const majorBm = scoreEuBendingBenchmark("EU-BENDING-BM-ELASTIC-MAJOR-HAND-1", 300_000);
    const minorBm = scoreEuBendingBenchmark("EU-BENDING-BM-ELASTIC-MINOR-HAND-1", 60_000);
    const ltbBm = scoreEuBendingBenchmark("EU-BENDING-BM-ELASTIC-LTB-HAND-1", 168_757);
    expect(majorBm.evidenceRef).toMatch(/PASS/);
    expect(minorBm.evidenceRef).toMatch(/PASS/);
    expect(ltbBm.evidenceRef).toMatch(/PASS/);
    expect(COMMON_BENCHMARK_EQUALS_EUROCODE_CONFORMANCE).toBe(false);
    const check = orchestrateEuBendingDesignCheck({
      designCheckId: "chk-eu4",
      designContext: designContext(euStandard()),
      capacityInput: capacityInput(),
    });
    expect(check.verdict).toBe("CHECK_UNDETERMINED");
    expect(check.engineeringApproved).toBe(false);
    expect(MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_CODE_CHECK).toBe(false);
    expect(MIXED_AUTHORITY_BENDING_COMPARISON_GOVERNED).toBe(true);
    expect(() => assertMixedAuthorityBendingComparisonGoverned("MECHANICS_REFERENCE", "EUROCODE_PROFILE_MEMBER_CAPACITY")).toThrow(/mixed authority/);
    const minorIgnoresLtb = evaluateSteelCapacity(capacityInput({
      limitState: "BENDING_MINOR",
      requiredProperties: ["material.yieldStrength", "section.sectionModulusZz"],
    }));
    expect(minorIgnoresLtb.bendingChecks?.some((row) => row.methodType === "ELASTIC_LTB_REFERENCE")).toBe(false);
  });

  it("keeps AU/EU elastic bending and LTB physics identical", () => {
    const fy = { name: "fy", value: 300, unit: "MPa", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
    const zyy = { name: "Zyy", value: 1_000_000, unit: "mm3", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
    const commonMy = firstYieldMomentNm(fy, zyy, "fy", "Zyy");
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
    const eu = evaluateSteelCapacity(capacityInput({
      requiredProperties: [
        "material.yieldStrength",
        "material.elasticModulus",
        "material.shearModulus",
        "section.sectionModulusYy",
        "section.Izz",
        "section.torsionConstant",
        "section.warpingConstant",
      ],
    }));
    expect(eu.bendingChecks?.find((row) => row.methodType === "ELASTIC_BENDING_REFERENCE")?.capacityValueNm).toBe(commonMy);
    expect(eu.bendingChecks?.find((row) => row.methodType === "ELASTIC_LTB_REFERENCE")?.capacityValueNm).toBeCloseTo(commonMcr, 0);
    const auProfile = createAuSteelStandardProfile({ contextId: "ctx-au-eu4-bending" });
    const au = evaluateSteelCapacity({
      adapterId: "AU_STEEL",
      designContext: { ...designContext(auProfile), standardContextRef: auProfile.contextId },
      standardContext: auProfile,
      material: material({ jurisdictionApplicability: ["australia"] }),
      section: section({ catalogSource: "ENGINEER_SUPPLIED", jurisdictionApplicability: ["australia"] }),
      stability: stability(),
      demand: demand(auProfile),
      limitState: "BENDING_MAJOR",
      requiredProperties: [
        "material.yieldStrength",
        "material.elasticModulus",
        "material.shearModulus",
        "section.sectionModulusYy",
        "section.Izz",
        "section.torsionConstant",
        "section.warpingConstant",
      ],
    });
    expect(au.bendingChecks?.find((row) => row.methodType === "ELASTIC_BENDING_REFERENCE")?.capacityValueNm).toBe(commonMy);
    expect(au.bendingChecks?.find((row) => row.methodType === "ELASTIC_LTB_REFERENCE")?.capacityValueNm).toBeCloseTo(commonMcr, 6);
  });

  it("fails closed for missing NDP, annex mismatch, unknown edition conformance, and AI authority", () => {
    expect(() => evaluateEuSteelBendingCodeProfile(capacityInput({ eurocodeContext: eurocodeContext("DE", { nationalAnnex: null }) }))).toThrow(/NATIONAL_ANNEX_REQUIRED/);
    expect(euBendingCodeProfileCheckState(capacityInput({ eurocodeContext: eurocodeContext("DE", { nationalAnnex: null }) }))).toBe("CHECK_UNDETERMINED");
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
    expect(() => denyAiUnbracedLengthChoice()).toThrow(/LTB values/);
    expect(() => assertAiCannotInventLtb("AI", false)).toThrow(/LTB values/);
    expect(() => denyAiRestraintChoice()).toThrow(/restraint/);
    expect(() => denyAiLtbCurveChoice()).toThrow(/LTB curve/);
    expect(() => denyAiNdpSupply()).toThrow(/cannot supply NDP/);
    expect(() => denyAiBendingCapacityOrigin()).toThrow(/originate/);
    expect(() => denyAiConformanceClaim()).toThrow(/cannot claim Eurocode conformance/);
    expect(LLM_EU_BENDING_CAPACITY_AUTHORITY).toBe(false);
    expect(AI_LTB_CURVE_AUTHORITY).toBe(false);
    expect(AI_NDP_AUTHORITY).toBe(false);
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(AI_EU_BENDING_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(() => assertBendingGenerationCompatible("SECOND_GENERATION")).toThrow(/STANDARD_VERSION_CONFLICT/);
    expect(() => evaluateSteelCapacity(capacityInput({
      eurocodeContext: eurocodeContext("DE", { version: { ...unknownEurocodeVersion("EN 1993-1-1"), generationFamily: "SECOND_GENERATION" } }),
    }))).toThrow(/STANDARD_VERSION_CONFLICT/);
    expect(() => assertOptimizationEuBendingRecheck({
      candidateSectionRef: "ipe-200",
      proposedBy: "AI",
      deterministicRecheckRequired: true,
      rechecked: true,
      memberCheckState: "CHECK_UNDETERMINED",
    })).toThrow(/undetermined bending/);
    expect(EU_OPTIMIZATION_ACCEPTS_UNDETERMINED_BENDING).toBe(false);
    expect(() => assertMemberBendingNotGlobalFrame()).toThrow(/not global frame stability/);
    expect(MEMBER_BENDING_STABILITY_EQUALS_GLOBAL_FRAME_STABILITY).toBe(false);
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
    }));
    const fr = evaluateSteelCapacity(capacityInput({
      standardContext: euStandard("FR"),
      designContext: { ...designContext(euStandard("FR")), standardContextRef: euStandard("FR").contextId },
      demand: demand(euStandard("FR")),
      eurocodeContext: eurocodeContext("FR"),
    }));
    expect(de.capacity?.value).toBe(fr.capacity?.value);
    expect(de.capacity?.standardContextRef?.nationalAnnex).toBe("NA-DE-EN1993-1-1");
    expect(fr.capacity?.standardContextRef?.nationalAnnex).toBe("NA-FR-EN1993-1-1");
    const ukContext = {
      ...createConfiguredKnowledgeContext({
        contextId: "ctx-uk-en1993-eu4",
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
    }));
    expect(uk.implemented).toBe(true);
    expect(IMPLEMENTED_EU_TENSION_METHODS).toEqual(["EU_TENSION_GROSS_YIELD_MECHANICS", "EU_TENSION_NET_FRACTURE_MECHANICS"]);
    expect(IMPLEMENTED_EU_COMPRESSION_METHODS).toEqual([
      "EU_COMPRESSION_SQUASH_YIELD_MECHANICS",
      "EU_COMPRESSION_EULER_MAJOR_MECHANICS",
      "EU_COMPRESSION_EULER_MINOR_MECHANICS",
    ]);
    expect(AU_METHOD_VALIDATION_INVENTORY).toHaveLength(18);
    expect(AU_STEEL_VALIDATION_MATRIX).toHaveLength(11);
    expect(IMPLEMENTED_INTERACTION_METHODS).toEqual([]);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.EU_STEEL.implemented).toBe(false);
    expect(US_STEEL_IMPLEMENTATION_SUBPHASES[0]).toMatch(/US-1/);
    expect(EU_STEEL_PACK_CERTIFIED).toBe(false);
    expect(EU_STEEL_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_BOUNDED_METHODS");
    expect(SCHEMA_CHANGE_REQUIRED_FOR_EU4).toBe(false);
    expect(EU_ONLY_STEEL_CORE).toBe(false);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(D1D_EU4_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(D1D_EU4_D0_RISK_DISPOSITION.REDUCED).toEqual(["D0-R01"]);
    expect(CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(AUTOMATIC_ENGINEERING_APPROVAL).toBe(false);
    const euSrc = ["evaluate.ts", "registry.ts"].map((name) => readFileSync(join(here, "eu-bending", name), "utf8")).join("\n");
    expect(euSrc).not.toMatch(/AU_BENDING_ELASTIC_MAJOR|AS 4100|alpha_m|phiMb/);
    const mechanicsSrc = ["bending.ts", "ltb.ts"].map((name) => readFileSync(join(here, "mechanics", name), "utf8")).join("\n");
    expect(mechanicsSrc).not.toMatch(/EN 1993 LTB curve|imperfection factor|gammaM1|χLT/);
    const adapterSrc = readFileSync(join(here, "adapters.ts"), "utf8");
    expect(adapterSrc).not.toMatch(/firstYieldMomentNm|elasticLtbMomentNm|fy \* Z/);
  });
});
