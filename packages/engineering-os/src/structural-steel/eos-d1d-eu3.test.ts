import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_BUCKLING_CURVE_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_EU_COMPRESSION_ASSISTANCE_ADVISORY_ONLY,
  AI_NDP_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AU_CODE_RULES_REUSED_AS_EU_RULES,
  AUST300_EU_DEFAULT,
  AUTOMATIC_ENGINEERING_APPROVAL,
  BUCKLING_CURVE_GUESSED,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  COMMON_BENCHMARK_EQUALS_EUROCODE_CONFORMANCE,
  DEFAULT_EU_NATIONAL_ANNEX,
  EOS_D1D_EU3_PHASE,
  EULER_REFERENCE_EQUALS_EN1993_MEMBER_CAPACITY,
  EU_BUCKLING_PARAMETER_GUESSED,
  EU_CODE_SLENDERNESS_RULE_GUESSED,
  EU_COMPRESSION_PARTIAL_FACTOR_GUESSED,
  EU_COMPRESSION_PARTIAL_FACTOR_SOURCE,
  EU_INITIAL_STEEL_STANDARD_PART,
  EU_ONLY_STEEL_CORE,
  EU_OPTIMIZATION_ACCEPTS_UNDETERMINED_STABILITY,
  EU_SECTION_CLASSIFICATION_LIMIT_GUESSED,
  EU_STEEL_IMPLEMENTATION_MATURITY,
  EU_STEEL_PACK_CERTIFIED,
  FLEXURAL_TORSIONAL_BUCKLING_IMPLEMENTED,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  LLM_EU_COMPRESSION_CAPACITY_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  MEMBER_STABILITY_EQUALS_GLOBAL_FRAME_STABILITY,
  MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_CODE_CHECK,
  MIXED_AUTHORITY_RESULT_COMPARISON_GOVERNED,
  SCHEMA_CHANGE_REQUIRED_FOR_EU3,
  SILENT_EFFECTIVE_LENGTH_ASSUMPTION,
  SILENT_EU_STANDARD_EDITION_INFERENCE,
  TORSIONAL_BUCKLING_IMPLEMENTED,
  UNKNOWN_EU_COMPRESSION_CODE_PARAMETER_GUESSED,
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
  AU_COMPRESSION_IMPLEMENTATION_REVIEW,
  AU_COMPRESSION_IMPLEMENTATION_REVIEWED,
  AU_METHOD_VALIDATION_INVENTORY,
  AU_STEEL_VALIDATION_MATRIX,
  COMMON_COMPRESSION_MECHANICS_REUSED_WHERE_VALID,
  D1D_EU3_D0_RISK_DISPOSITION,
  EU_BUCKLING_CURVE_CATALOG,
  EU_CODE_SLENDERNESS_CONTEXT,
  EU_COMPRESSION_METHOD_REGISTRY,
  FRAMEWORK_ONLY_EU_COMPRESSION_METHODS,
  IMPLEMENTED_EU_COMPRESSION_METHODS,
  IMPLEMENTED_EU_TENSION_METHODS,
  IMPLEMENTED_INTERACTION_METHODS,
  STEEL_ADAPTER_BOUNDARIES,
  US_STEEL_IMPLEMENTATION_SUBPHASES,
  assertAiCannotSupplyEffectiveLength,
  assertCompressionGenerationCompatible,
  assertMemberStabilityNotGlobalFrame,
  assertMixedAuthorityComparisonGoverned,
  assertOptimizationEuCompressionRecheck,
  consumeDemandHandoff,
  createAuSteelStandardProfile,
  denyAiBucklingCurveChoice,
  denyAiCompressionCapacityOrigin,
  denyAiConformanceClaim,
  denyAiEffectiveLengthChoice,
  denyAiNdpSupply,
  denyNationalAnnexFromUserLocation,
  euCompressionCodeProfileCheckState,
  euSectionClassificationState,
  evaluateEuSteelCompressionCodeProfile,
  evaluateSteelCapacity,
  eulerLoadN,
  orchestrateEuCompressionDesignCheck,
  requestEuBucklingCurve,
  requestEuBucklingParameter,
  requestEuCompressionPartialFactor,
  requestEuSectionClassificationLimits,
  scoreEuCompressionBenchmark,
  selectEuBucklingCurve,
  toElasticModulusPa,
  toSecondMomentM4,
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
      contextId: `ctx-en1993-eu3-${country}`,
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
    contextId: `ctx-eu-compression-${country}`,
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-eu3",
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
    projectContextRef: "proj-eu3",
    calculationContextRef: "calc-eu3",
    sourceAuthorityRef: "governed-project-profile",
    intendedStandardProfile: "EN1993",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: "eu3:compression",
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
    ...overrides,
  };
}

function demand(context: StructuralStandardContext, valueN = -400_000): SteelCapacityEngineInput["demand"] {
  return {
    resultId: "demand-eu3",
    memberId: "m-eu3",
    shear: { value: 0, unit: "N", locationM: 0, signed: 0 },
    moment: { value: 0, unit: "N.m", locationM: 0, signed: 0 },
    axial: { valueN, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "not required" },
    capacityPresent: false,
    standardContext: context,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c", sourceKind: "calculation", reference: "d1c-axial" }],
    combinationId: "comb-eu3",
  };
}

function material(patch: Partial<SteelMaterialDesignProperties> = {}): SteelMaterialDesignProperties {
  return {
    materialRef: "mat-eu3",
    grade: "S355",
    yieldStrength: { name: "fy", value: 300, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    ultimateStrength: { name: "fu", value: 440, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    elasticModulus: { name: "E", value: 200, unit: "GPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    shearModulus: null,
    poissonRatio: null,
    density: null,
    thicknessDependentMetadata: null,
    jurisdictionApplicability: ["eu-eea"],
    ...patch,
  };
}

function section(patch: Partial<SteelSectionDesignProperties> = {}): SteelSectionDesignProperties {
  return {
    sectionRef: "sec-eu3",
    sectionFamily: "IPE",
    catalogSource: "ENGINEER_SUPPLIED",
    catalogVersion: null,
    jurisdictionApplicability: ["eu-eea"],
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
    netArea: { name: "An", value: 4500, unit: "mm2", provenanceRef: "engineer-net-area", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    geometricDimensions: {},
    ...patch,
  };
}

function stability(patch: Partial<SteelStabilityContext> = {}): SteelStabilityContext {
  return {
    stabilityContextId: "stab-eu3",
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
    designContextId: "dc-eu3",
    memberRef: "m-eu3",
    sectionRef: "sec-eu3",
    materialRef: "mat-eu3",
    demandRefs: ["demand-eu3"],
    standardContextRef: context.contextId,
    parameterSetRef: null,
    effectiveLengthContextRef: "stab-eu3",
    restraintContextRef: "stab-eu3",
    stabilityContextRef: "stab-eu3",
    fabricationContextRef: null,
    evidenceRefs: [{ evidenceId: "ev-eng", sourceKind: "human_input", reference: "engineer" }],
    toolRef: "EOS_EU_STEEL_COMPRESSION",
    methodRef: "EU_COMPRESSION",
    provenanceRef: governedProvenance({ jurisdiction: "eu-eea", standard: "EN 1993-1-1", calculationMethod: "EU_COMPRESSION" }),
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
    limitState: "COMPRESSION",
    requiredProperties: ["material.yieldStrength", "material.elasticModulus", "section.area", "section.Iyy", "section.Izz"],
    eurocodeContext: eurocodeContext(),
    ...patch,
  };
}

describe("EOS-D1D-EU-3 Eurocode steel compression/stability", () => {
  it("reviews AU compression, reuses common Euler mechanics, and keeps code-profile rules unguessed", () => {
    expect(EOS_D1D_EU3_PHASE).toBe("EOS-D1D-EU-3");
    expect(AU_COMPRESSION_IMPLEMENTATION_REVIEWED).toBe(true);
    expect(COMMON_COMPRESSION_MECHANICS_REUSED_WHERE_VALID).toBe(true);
    expect(AU_CODE_RULES_REUSED_AS_EU_RULES).toBe(false);
    expect(AU_COMPRESSION_IMPLEMENTATION_REVIEW.some((row) => row.classification === "JURISDICTION_NEUTRAL_REUSABLE")).toBe(true);
    expect(IMPLEMENTED_EU_COMPRESSION_METHODS).toEqual([
      "EU_COMPRESSION_SQUASH_YIELD_MECHANICS",
      "EU_COMPRESSION_EULER_MAJOR_MECHANICS",
      "EU_COMPRESSION_EULER_MINOR_MECHANICS",
    ]);
    expect(FRAMEWORK_ONLY_EU_COMPRESSION_METHODS).toContain("EU_COMPRESSION_MEMBER_CAPACITY_CODE_PROFILE");
    expect(FRAMEWORK_ONLY_EU_COMPRESSION_METHODS).toContain("EU_BUCKLING_CURVE_SELECTION_CODE_PROFILE");
    expect(EU_COMPRESSION_METHOD_REGISTRY).toHaveLength(8);
    expect(EU_INITIAL_STEEL_STANDARD_PART).toBe("EN_1993_1_1");
    expect(SILENT_EU_STANDARD_EDITION_INFERENCE).toBe(false);
    expect(SILENT_EFFECTIVE_LENGTH_ASSUMPTION).toBe(false);
    expect(EULER_REFERENCE_EQUALS_EN1993_MEMBER_CAPACITY).toBe(false);
    expect(BUCKLING_CURVE_GUESSED).toBe(false);
    expect(EU_BUCKLING_PARAMETER_GUESSED).toBe(false);
    expect(EU_COMPRESSION_PARTIAL_FACTOR_GUESSED).toBe(false);
    expect(EU_SECTION_CLASSIFICATION_LIMIT_GUESSED).toBe(false);
    expect(EU_CODE_SLENDERNESS_RULE_GUESSED).toBe(false);
    expect(UNKNOWN_EU_COMPRESSION_CODE_PARAMETER_GUESSED).toBe(false);
    expect(EU_COMPRESSION_PARTIAL_FACTOR_SOURCE).toBe("VALIDATION_REQUIRED");
    expect(EU_CODE_SLENDERNESS_CONTEXT.state).toBe("VALIDATION_REQUIRED");
    expect(EU_BUCKLING_CURVE_CATALOG).toEqual([]);
    expect(euSectionClassificationState()).toBe("VALIDATION_REQUIRED");
    expect(TORSIONAL_BUCKLING_IMPLEMENTED).toBe(false);
    expect(FLEXURAL_TORSIONAL_BUCKLING_IMPLEMENTED).toBe(false);
    expect(() => requestEuBucklingCurve()).toThrow(/bucklingCurve/);
    expect(() => requestEuBucklingParameter()).toThrow(/bucklingCoefficient/);
    expect(() => requestEuCompressionPartialFactor()).toThrow(/partial-factor/);
    expect(() => requestEuSectionClassificationLimits()).toThrow(/sectionClassificationLimits/);
    expect(() => selectEuBucklingCurve("IPE")).toThrow(/CHECK_UNDETERMINED/);
  });

  it("reuses D1C demand, requires governed Le/E/fy/I, and fails closed on missing inputs", () => {
    const context = euStandard();
    expect(consumeDemandHandoff(demand(context))).toBe("demand-eu3");
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
    expect(AUST300_EU_DEFAULT).toBe(false);
    expect(() => evaluateSteelCapacity(capacityInput({ section: section({ catalogSource: "AUST300" }) }))).toThrow(/not an EU default/);
  });

  it("evaluates squash and Euler mechanics references without labelling them EN 1993 member capacity", () => {
    const out = evaluateSteelCapacity(capacityInput());
    expect(out.implemented).toBe(true);
    expect(out.resultClass).toBe("MECHANICS_REFERENCE");
    expect(out.capacity?.capacityType).toBe("MECHANICS_REFERENCE");
    expect(out.standardConformanceState).toBe("INTENDED_PROFILE");
    expect(out.designCapacityState).toBe("VALIDATION_REQUIRED");
    expect(out.compressionChecks?.map((row) => row.methodId)).toEqual([
      "EU_COMPRESSION_SQUASH_YIELD_MECHANICS",
      "EU_COMPRESSION_EULER_MAJOR_MECHANICS",
      "EU_COMPRESSION_EULER_MINOR_MECHANICS",
    ]);
    expect(out.governingMethodId).toBe("EU_COMPRESSION_EULER_MINOR_MECHANICS");
    expect(out.capacity?.value).toBeCloseTo(616_850, 0);
    expect(out.reason).not.toMatch(/EN1993_CODE_CAPACITY|Nb,Rd certified/);
    const squash = scoreEuCompressionBenchmark("EU-COMPRESSION-BM-SQUASH-HAND-1", 1_542_000);
    const major = scoreEuCompressionBenchmark("EU-COMPRESSION-BM-EULER-MAJOR-HAND-1", 3_084_251);
    const minor = scoreEuCompressionBenchmark("EU-COMPRESSION-BM-EULER-MINOR-HAND-1", 616_850);
    expect(squash.evidenceRef).toMatch(/PASS/);
    expect(major.evidenceRef).toMatch(/PASS/);
    expect(minor.evidenceRef).toMatch(/PASS/);
    expect(COMMON_BENCHMARK_EQUALS_EUROCODE_CONFORMANCE).toBe(false);
    const check = orchestrateEuCompressionDesignCheck({
      designCheckId: "chk-eu3",
      designContext: designContext(euStandard()),
      capacityInput: capacityInput(),
    });
    expect(check.verdict).toBe("CHECK_UNDETERMINED");
    expect(check.engineeringApproved).toBe(false);
    expect(MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_CODE_CHECK).toBe(false);
    expect(CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(AUTOMATIC_ENGINEERING_APPROVAL).toBe(false);
    const majorOnly = evaluateSteelCapacity(capacityInput({
      stability: stability({ bucklingAxis: "MAJOR", effectiveLengthM: 8, effectiveLengthMinorM: null }),
      requiredProperties: ["material.yieldStrength", "material.elasticModulus", "section.area", "section.Iyy"],
    }));
    expect(majorOnly.compressionChecks?.some((row) => row.axis === "MINOR_AXIS")).toBe(false);
    expect(MIXED_AUTHORITY_RESULT_COMPARISON_GOVERNED).toBe(true);
    expect(() => assertMixedAuthorityComparisonGoverned("MECHANICS_REFERENCE", "EUROCODE_PROFILE_MEMBER_CAPACITY")).toThrow(/mixed authority/);
  });

  it("keeps AU/EU Euler physics identical and does not treat common Euler as Eurocode conformance", () => {
    const e = { name: "E", value: 200, unit: "GPa", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
    const iyy = { name: "Iyy", value: 100_000_000, unit: "mm4", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" as const };
    const commonMajor = eulerLoadN(toElasticModulusPa(e, "E"), toSecondMomentM4(iyy, "Iyy"), 8);
    const eu = evaluateSteelCapacity(capacityInput({
      stability: stability({ bucklingAxis: "MAJOR", effectiveLengthM: 8, effectiveLengthMinorM: null }),
      requiredProperties: ["material.yieldStrength", "material.elasticModulus", "section.area", "section.Iyy"],
    }));
    expect(eu.compressionChecks?.find((row) => row.axis === "MAJOR_AXIS")?.capacityValueN).toBeCloseTo(commonMajor, 0);
    const auProfile = createAuSteelStandardProfile({ contextId: "ctx-au-eu3-euler" });
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
    expect(au.compressionChecks?.find((row) => row.axis === "MAJOR_AXIS")?.capacityValueN).toBeCloseTo(commonMajor, 0);
    expect(au.compressionChecks?.find((row) => row.axis === "MAJOR_AXIS")?.capacityValueN)
      .toBeCloseTo(eu.compressionChecks?.find((row) => row.axis === "MAJOR_AXIS")?.capacityValueN ?? 0, 6);
  });

  it("fails closed for missing NDP, annex mismatch, unknown edition conformance, and AI authority", () => {
    expect(() => evaluateEuSteelCompressionCodeProfile(capacityInput({ eurocodeContext: eurocodeContext("DE", { nationalAnnex: null }) }))).toThrow(/NATIONAL_ANNEX_REQUIRED/);
    expect(euCompressionCodeProfileCheckState(capacityInput({ eurocodeContext: eurocodeContext("DE", { nationalAnnex: null }) }))).toBe("CHECK_UNDETERMINED");
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
    expect(() => denyAiEffectiveLengthChoice()).toThrow(/effective length/);
    expect(() => assertAiCannotSupplyEffectiveLength("AI", false)).toThrow(/effective length/);
    expect(() => denyAiBucklingCurveChoice()).toThrow(/buckling curve/);
    expect(() => denyAiNdpSupply()).toThrow(/cannot supply NDP/);
    expect(() => denyAiCompressionCapacityOrigin()).toThrow(/originate/);
    expect(() => denyAiConformanceClaim()).toThrow(/cannot claim Eurocode conformance/);
    expect(LLM_EU_COMPRESSION_CAPACITY_AUTHORITY).toBe(false);
    expect(AI_BUCKLING_CURVE_AUTHORITY).toBe(false);
    expect(AI_NDP_AUTHORITY).toBe(false);
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(AI_EU_COMPRESSION_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(() => assertCompressionGenerationCompatible("SECOND_GENERATION")).toThrow(/STANDARD_VERSION_CONFLICT/);
    expect(() => evaluateSteelCapacity(capacityInput({
      eurocodeContext: eurocodeContext("DE", { version: { ...unknownEurocodeVersion("EN 1993-1-1"), generationFamily: "SECOND_GENERATION" } }),
    }))).toThrow(/STANDARD_VERSION_CONFLICT/);
    expect(() => assertOptimizationEuCompressionRecheck({
      candidateSectionRef: "ipe-200",
      proposedBy: "AI",
      deterministicRecheckRequired: true,
      rechecked: true,
      memberCheckState: "CHECK_UNDETERMINED",
    })).toThrow(/undetermined stability/);
    expect(EU_OPTIMIZATION_ACCEPTS_UNDETERMINED_STABILITY).toBe(false);
    expect(() => assertMemberStabilityNotGlobalFrame()).toThrow(/not global frame stability/);
    expect(MEMBER_STABILITY_EQUALS_GLOBAL_FRAME_STABILITY).toBe(false);
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
        contextId: "ctx-uk-en1993-eu3",
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
    expect(AU_METHOD_VALIDATION_INVENTORY).toHaveLength(18);
    expect(AU_STEEL_VALIDATION_MATRIX).toHaveLength(11);
    expect(IMPLEMENTED_INTERACTION_METHODS).toEqual([]);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.EU_STEEL.implemented).toBe(false);
    expect(US_STEEL_IMPLEMENTATION_SUBPHASES[0]).toMatch(/US-1/);
    expect(EU_STEEL_PACK_CERTIFIED).toBe(false);
    expect(EU_STEEL_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_BOUNDED_METHODS");
    expect(SCHEMA_CHANGE_REQUIRED_FOR_EU3).toBe(false);
    expect(EU_ONLY_STEEL_CORE).toBe(false);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(D1D_EU3_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(D1D_EU3_D0_RISK_DISPOSITION.REDUCED).toEqual(["D0-R01"]);
    const euSrc = ["evaluate.ts", "registry.ts"].map((name) => readFileSync(join(here, "eu-compression", name), "utf8")).join("\n");
    expect(euSrc).not.toMatch(/AU_COMPRESSION_SQUASH_YIELD|AS 4100|alpha_b|phiNc/);
    const mechanicsSrc = readFileSync(join(here, "mechanics", "euler.ts"), "utf8");
    expect(mechanicsSrc).not.toMatch(/EN 1993 buckling curve|imperfection factor|gammaM1|χ/);
    const adapterSrc = readFileSync(join(here, "adapters.ts"), "utf8");
    expect(adapterSrc).not.toMatch(/eulerLoadN|π²|chi_reduction|buckling curve a/);
  });
});
