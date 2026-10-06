import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_ENGINEERING_APPROVAL,
  AI_NDP_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AU_CODE_RULES_REUSED_AS_EU_RULES,
  AUST300_EU_DEFAULT,
  AUTOMATIC_ENGINEERING_APPROVAL,
  BENCHMARK_EQUALS_EN1993_CONFORMANCE,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  DEFAULT_EU_NATIONAL_ANNEX,
  EOS_D1D_EU2_PHASE,
  EU_INITIAL_STEEL_STANDARD_PART,
  EU_ONLY_STEEL_CORE,
  EU_PARTIAL_FACTOR_GUESSED,
  EU_PARTIAL_FACTOR_SOURCE,
  EU_STEEL_IMPLEMENTATION_MATURITY,
  EU_STEEL_PACK_CERTIFIED,
  GENERIC_MECHANICS_EQUALS_EN1993_CAPACITY,
  LLM_EU_TENSION_CAPACITY_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  PARALLEL_EU_STEEL_CORE_CREATED,
  SCHEMA_CHANGE_REQUIRED_FOR_EU2,
  SILENT_EU_STANDARD_EDITION_INFERENCE,
  SILENT_NET_AREA_EQUALS_GROSS_AREA,
  UNKNOWN_EU_CODE_PARAMETER_GUESSED,
  type EurocodeNationalAnnex,
  type EurocodeSteelDesignContext,
  type SteelCapacityEngineInput,
  type SteelDesignContext,
  type SteelMaterialDesignProperties,
  type SteelSectionDesignProperties,
  type StructuralStandardContext,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import {
  AU_METHOD_VALIDATION_INVENTORY,
  AU_STEEL_VALIDATION_MATRIX,
  AU_TENSION_IMPLEMENTATION_REVIEW,
  D1D_EU2_D0_RISK_DISPOSITION,
  EU_TENSION_METHOD_REGISTRY,
  FRAMEWORK_ONLY_EU_TENSION_METHODS,
  IMPLEMENTED_EU_TENSION_METHODS,
  IMPLEMENTED_INTERACTION_METHODS,
  STEEL_ADAPTER_BOUNDARIES,
  US_STEEL_IMPLEMENTATION_SUBPHASES,
  assertGenerationCompatible,
  assertOptimizationEuTensionRecheck,
  consumeDemandHandoff,
  denyAiConformanceClaim,
  denyAiNationalAnnexChoice,
  denyAiNdpSupply,
  denyNationalAnnexFromUserLocation,
  evaluateAuSteelTension,
  evaluateEuSteelTensionCodeProfile,
  evaluateSteelCapacity,
  nominalTensionForceN,
  orchestrateEuTensionDesignCheck,
  requestEuTensionPartialFactor,
  resolveNdp,
  scoreEuTensionBenchmark,
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
      contextId: `ctx-en1993-eu2-${country}`,
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
    contextId: `ctx-eu-tension-${country}`,
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-eu2",
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
    projectContextRef: "proj-eu2",
    calculationContextRef: "calc-eu2",
    sourceAuthorityRef: "governed-project-profile",
    intendedStandardProfile: "EN1993",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: "eu2:tension",
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
    ...overrides,
  };
}

function demand(context: StructuralStandardContext, valueN = 1_000_000): SteelCapacityEngineInput["demand"] {
  return {
    resultId: "demand-eu2",
    memberId: "m-eu2",
    shear: { value: 0, unit: "N", locationM: 0, signed: 0 },
    moment: { value: 0, unit: "N.m", locationM: 0, signed: 0 },
    axial: { valueN, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "not required" },
    capacityPresent: false,
    standardContext: context,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c", sourceKind: "calculation", reference: "d1c-axial" }],
    combinationId: "comb-eu2",
  };
}

function material(): SteelMaterialDesignProperties {
  return {
    materialRef: "mat-eu2",
    grade: "S355",
    yieldStrength: { name: "fy", value: 300, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    ultimateStrength: { name: "fu", value: 440, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    elasticModulus: null,
    shearModulus: null,
    poissonRatio: null,
    density: null,
    thicknessDependentMetadata: null,
    jurisdictionApplicability: ["eu-eea"],
  };
}

function section(): SteelSectionDesignProperties {
  return {
    sectionRef: "sec-eu2",
    sectionFamily: "IPE",
    catalogSource: "ENGINEER_SUPPLIED",
    catalogVersion: null,
    jurisdictionApplicability: ["eu-eea"],
    area: { name: "Ag", value: 5140, unit: "mm2", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Iyy: null,
    Izz: null,
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
  };
}

function designContext(context: StructuralStandardContext): SteelDesignContext {
  return {
    designContextId: "dc-eu2",
    memberRef: "m-eu2",
    sectionRef: "sec-eu2",
    materialRef: "mat-eu2",
    demandRefs: ["demand-eu2"],
    standardContextRef: context.contextId,
    parameterSetRef: null,
    effectiveLengthContextRef: null,
    restraintContextRef: null,
    stabilityContextRef: null,
    fabricationContextRef: null,
    evidenceRefs: [{ evidenceId: "ev-eng", sourceKind: "human_input", reference: "engineer" }],
    toolRef: "EOS_EU_STEEL_TENSION",
    methodRef: "EU_TENSION",
    provenanceRef: governedProvenance({ jurisdiction: "eu-eea", standard: "EN 1993-1-1", calculationMethod: "EU_TENSION" }),
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
    limitState: "TENSION",
    requiredProperties: ["material.yieldStrength", "material.ultimateStrength", "section.area", "section.netArea"],
    eurocodeContext: eurocodeContext(),
    ...patch,
  };
}

describe("EOS-D1D-EU-2 Eurocode steel tension", () => {
  it("classifies AU reuse, implements mechanics methods, and keeps code-profile rules unguessed", () => {
    expect(EOS_D1D_EU2_PHASE).toBe("EOS-D1D-EU-2");
    expect(PARALLEL_EU_STEEL_CORE_CREATED).toBe(false);
    expect(AU_CODE_RULES_REUSED_AS_EU_RULES).toBe(false);
    expect(AU_TENSION_IMPLEMENTATION_REVIEW.some((row) => row.classification === "JURISDICTION_NEUTRAL_REUSABLE")).toBe(true);
    expect(IMPLEMENTED_EU_TENSION_METHODS).toEqual(["EU_TENSION_GROSS_YIELD_MECHANICS", "EU_TENSION_NET_FRACTURE_MECHANICS"]);
    expect(FRAMEWORK_ONLY_EU_TENSION_METHODS).toEqual(["EU_TENSION_GROSS_YIELD_CODE_PROFILE", "EU_TENSION_NET_FRACTURE_CODE_PROFILE"]);
    expect(EU_TENSION_METHOD_REGISTRY).toHaveLength(4);
    expect(EU_INITIAL_STEEL_STANDARD_PART).toBe("EN_1993_1_1");
    expect(SILENT_EU_STANDARD_EDITION_INFERENCE).toBe(false);
    expect(DEFAULT_EU_NATIONAL_ANNEX).toBe(false);
    expect(GENERIC_MECHANICS_EQUALS_EN1993_CAPACITY).toBe(false);
    expect(UNKNOWN_EU_CODE_PARAMETER_GUESSED).toBe(false);
    expect(EU_PARTIAL_FACTOR_GUESSED).toBe(false);
    expect(EU_PARTIAL_FACTOR_SOURCE).toBe("VALIDATION_REQUIRED");
    expect(() => requestEuTensionPartialFactor()).toThrow(/partial-factor/);
  });

  it("reuses D1C demand, requires governed material/section areas, and fails closed on missing inputs", () => {
    const context = euStandard();
    expect(consumeDemandHandoff(demand(context))).toBe("demand-eu2");
    expect(() => evaluateSteelCapacity(capacityInput({ material: { ...material(), yieldStrength: null } }))).toThrow(/missing material.yieldStrength/);
    expect(() => evaluateSteelCapacity(capacityInput({ section: { ...section(), area: null } }))).toThrow(/missing section.area/);
    expect(() => evaluateSteelCapacity(capacityInput({ section: { ...section(), netArea: null } }))).toThrow(/missing section.netArea/);
    expect(SILENT_NET_AREA_EQUALS_GROSS_AREA).toBe(false);
    expect(AUST300_EU_DEFAULT).toBe(false);
    expect(() => evaluateSteelCapacity(capacityInput({ section: { ...section(), catalogSource: "AUST300" } }))).toThrow(/not an EU default/);
    expect(() => evaluateSteelCapacity(capacityInput({
      demand: { ...demand(euStandard()), resultId: "" },
    }))).toThrow(/demand missing/);
  });

  it("preserves both mechanics modes, governs deterministically, and does not treat utilization as approval", () => {
    const out = evaluateSteelCapacity(capacityInput());
    expect(out.implemented).toBe(true);
    expect(out.resultClass).toBe("MECHANICS_REFERENCE");
    expect(out.standardConformanceState).toBe("INTENDED_PROFILE");
    expect(out.tensionChecks?.map((row) => row.methodId)).toEqual([
      "EU_TENSION_GROSS_YIELD_MECHANICS",
      "EU_TENSION_NET_FRACTURE_MECHANICS",
    ]);
    expect(out.governingMethodId).toBe("EU_TENSION_GROSS_YIELD_MECHANICS");
    expect(out.capacity?.value).toBe(1_542_000);
    const gross = scoreEuTensionBenchmark("EU-TENSION-BM-GROSS-YIELD-HAND-1", 1_542_000);
    const net = scoreEuTensionBenchmark("EU-TENSION-BM-NET-FRACTURE-HAND-1", 1_980_000);
    expect(gross.evidenceRef).toMatch(/PASS/);
    expect(net.evidenceRef).toMatch(/PASS/);
    expect(BENCHMARK_EQUALS_EN1993_CONFORMANCE).toBe(false);
    const check = orchestrateEuTensionDesignCheck({
      designCheckId: "chk-eu2",
      designContext: designContext(euStandard()),
      capacityInput: capacityInput(),
    });
    expect(check.verdict).toBe("CHECK_SATISFIED");
    expect(check.engineeringApproved).toBe(false);
    expect(check.designCheck.approvalState).toBe("not_approved");
    expect(CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(AUTOMATIC_ENGINEERING_APPROVAL).toBe(false);
  });

  it("fails closed for missing NDP, annex mismatch, AI authority, and second-generation mixing", () => {
    expect(resolveNdp({
      ruleRequiresNdp: true,
      annex: null,
      ndpSet: [],
      parameterId: "partial-factor",
    })).toEqual({ kind: "FAIL_CLOSED", reason: "NATIONAL_ANNEX_REQUIRED", checkState: "CHECK_UNDETERMINED" });
    expect(() => evaluateEuSteelTensionCodeProfile(capacityInput({ eurocodeContext: eurocodeContext("DE", { nationalAnnex: null }) }))).toThrow(/NATIONAL_ANNEX_REQUIRED/);
    expect(() => evaluateSteelCapacity(capacityInput({
      eurocodeContext: eurocodeContext("DE", { nationalAnnex: annex("FR") }),
    }))).toThrow(/NATIONAL_ANNEX_MISMATCH/);
    expect(() => denyNationalAnnexFromUserLocation("ip")).toThrow(/USER_LOCATION_INFERENCE_DENIED/);
    expect(() => denyAiNationalAnnexChoice()).toThrow(/cannot choose a National Annex/);
    expect(() => denyAiNdpSupply()).toThrow(/cannot supply NDP/);
    expect(() => denyAiConformanceClaim()).toThrow(/cannot claim Eurocode conformance/);
    expect(LLM_EU_TENSION_CAPACITY_AUTHORITY).toBe(false);
    expect(AI_NDP_AUTHORITY).toBe(false);
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(() => assertGenerationCompatible("SECOND_GENERATION")).toThrow(/STANDARD_VERSION_CONFLICT/);
    expect(() => evaluateSteelCapacity(capacityInput({
      eurocodeContext: eurocodeContext("DE", { version: { ...unknownEurocodeVersion("EN 1993-1-1"), generationFamily: "SECOND_GENERATION" } }),
    }))).toThrow(/STANDARD_VERSION_CONFLICT/);
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
        contextId: "ctx-uk-en1993",
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
    const mechanicsN = nominalTensionForceN(
      { name: "fy", value: 300, unit: "MPa", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
      { name: "Ag", value: 5140, unit: "mm2", provenanceRef: "x", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
      "material.yieldStrength",
      "section.area",
    );
    expect(mechanicsN).toBe(1_542_000);
    expect(AU_METHOD_VALIDATION_INVENTORY).toHaveLength(18);
    expect(AU_STEEL_VALIDATION_MATRIX).toHaveLength(11);
    expect(IMPLEMENTED_INTERACTION_METHODS).toEqual([]);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(US_STEEL_IMPLEMENTATION_SUBPHASES[0]).toMatch(/US-1/);
    expect(EU_STEEL_PACK_CERTIFIED).toBe(false);
    expect(EU_STEEL_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_BOUNDED_METHODS");
    expect(SCHEMA_CHANGE_REQUIRED_FOR_EU2).toBe(false);
    expect(EU_ONLY_STEEL_CORE).toBe(false);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(D1D_EU2_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(() => assertOptimizationEuTensionRecheck({
      candidateSectionRef: "ipe-200",
      proposedBy: "AI",
      deterministicRecheckRequired: true,
      rechecked: false,
    })).toThrow(/deterministic recheck/);
    const euSrc = ["evaluate.ts", "registry.ts"].map((name) => readFileSync(join(here, "eu-tension", name), "utf8")).join("\n");
    expect(euSrc).not.toMatch(/AU_TENSION_GROSS_YIELD|AS 4100|phiNt/);
    const core = ["adapters.ts", "properties.ts"].map((name) => readFileSync(join(here, name), "utf8")).join("\n");
    expect(core).not.toMatch(/EU_TENSION_GROSS_YIELD_MECHANICS|partial-factor/);
    expect(evaluateAuSteelTension).toBeTypeOf("function");
  });
});
