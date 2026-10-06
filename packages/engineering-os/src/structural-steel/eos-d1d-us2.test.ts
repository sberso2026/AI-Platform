import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_ENGINEERING_APPROVAL,
  AI_FACTOR_AUTHORITY,
  AI_LRFD_ASD_AUTHORITY,
  AI_NET_AREA_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AISC_UNKNOWN_EDITION_TOKEN,
  AU_CODE_RULES_REUSED_AS_US_RULES,
  AUST300_US_DEFAULT,
  AUTOMATIC_ENGINEERING_APPROVAL,
  BENCHMARK_EQUALS_AISC_CONFORMANCE,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  COMMON_BENCHMARK_EQUALS_AISC_CONFORMANCE,
  COMMON_MECHANICS_SHARED_ACROSS_LRFD_ASD,
  COMMON_STEEL_FRAMEWORK_REUSED,
  DEFAULT_LRFD_OR_ASD,
  DIRECT_CONTRACT_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE,
  EOS_D1D_US2_PHASE,
  EU_CODE_RULES_REUSED_AS_US_RULES,
  EU_ONLY_STEEL_CORE,
  EU_SECTION_CATALOG_US_DEFAULT,
  GENERIC_MECHANICS_EQUALS_AISC_DESIGN_STRENGTH,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  LLM_US_TENSION_STRENGTH_AUTHORITY,
  LRFD_ASD_MECHANICS_DUPLICATED,
  MECHANICS_REFERENCE_EQUALS_AISC_NOMINAL_STRENGTH,
  MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_AISC_CHECK,
  PARALLEL_US_STEEL_CORE_CREATED,
  SCHEMA_CHANGE_REQUIRED_FOR_US2,
  SILENT_AISC_EDITION_INFERENCE,
  SILENT_LRFD_ASD_CONVERSION,
  SILENT_NET_AREA_EQUALS_GROSS_AREA,
  US1_STANDARD_BINDING_REUSED,
  US2_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK,
  US_ASD_FACTOR_GUESSED,
  US_BLOCK_SHEAR_IMPLEMENTED,
  US_CONNECTION_TENSION_DESIGN_IMPLEMENTED,
  US_FATIGUE_TENSION_DESIGN_IMPLEMENTED,
  US_HOLE_DEDUCTION_GUESSED,
  US_LRFD_RESISTANCE_FACTOR_GUESSED,
  US_LRFD_RESISTANCE_FACTOR_SOURCE,
  US_OPTIMIZATION_ACCEPTS_UNDETERMINED_TENSION,
  US_SECTION_CATALOG_OPTIONAL,
  US_SEISMIC_TENSION_DESIGN_IMPLEMENTED,
  US_SHEAR_LAG_FACTOR_GUESSED,
  US_STEEL_IMPLEMENTATION_MATURITY,
  US_STEEL_PACK_CERTIFIED,
  US_TENSION_HUMAN_VALIDATION_REQUIRED,
  US_TENSION_INDEPENDENT_BENCHMARK_STATE,
  US_TENSION_STRENGTH_RESULT_STATE,
  UNKNOWN_US_TENSION_CODE_PARAMETER_GUESSED,
  type BuildingCodeAdoptionContext,
  type SteelCapacityEngineInput,
  type SteelDesignContext,
  type SteelMaterialDesignProperties,
  type SteelSectionDesignProperties,
  type StructuralStandardContext,
  type USSteelDesignContext,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext, exampleEurocodeAnnex } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import {
  AU_EU_TENSION_IMPLEMENTATION_REVIEW,
  AU_METHOD_VALIDATION_INVENTORY,
  AU_STEEL_VALIDATION_MATRIX,
  D1D_US2_D0_RISK_DISPOSITION,
  EU_METHOD_VALIDATION_INVENTORY,
  EU_STEEL_VALIDATION_MATRIX,
  FRAMEWORK_ONLY_US_TENSION_METHODS,
  IMPLEMENTED_EU_INTERACTION_METHODS,
  IMPLEMENTED_INTERACTION_METHODS,
  IMPLEMENTED_US_TENSION_METHODS,
  STEEL_ADAPTER_BOUNDARIES,
  US_STEEL_IMPLEMENTATION_SUBPHASES,
  US_TENSION_METHOD_REGISTRY,
  assertAiscTensionEditionIsolation,
  assertLrfdAsdFactorIsolation,
  assertOptimizationUsTensionRecheck,
  consumeDemandHandoff,
  createAuSteelStandardProfile,
  denyAiLrfdAsdChoice,
  denyAiUsCodeStrength,
  denyAiUsConformanceClaim,
  denyAiUsFactor,
  denyAiUsNetArea,
  denyAiUsShearLag,
  denySilentUsDesignMethodChoice,
  evaluateAuSteelTension,
  evaluateEuSteelTension,
  evaluateSteelCapacity,
  evaluateUsSteelTensionCodeProfile,
  evaluateUsSteelTensionEffectiveNet,
  evaluateUsSteelTensionHoleDeduction,
  nominalTensionForceN,
  orchestrateUsTensionDesignCheck,
  requestUsAsdFactor,
  requestUsLrfdResistanceFactor,
  resolveUsSteelContext,
  scoreUsTensionBenchmark,
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
    contextId: "ctx-us-tension",
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-us2",
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
    projectStandardContextRef: "proj-us2",
    calculationContextRef: "calc-us2",
    engineeringRuleAuthorityRefs: ["VALIDATED_ENGINEERING_REFERENCE"],
    projectOverride: null,
    sourcePrecedence: ["MANDATORY_ADOPTED_CODE", "REFERENCED_STANDARD"],
    intendedStandardProfile: "AISC360",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: "us2:tension",
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
    directContractProfile: false,
    ...overrides,
  };
}

function usStandard(id = "ctx-aisc-us2"): StructuralStandardContext {
  return createConfiguredKnowledgeContext({
    contextId: id,
    jurisdictionProfileRef: "united-states",
    standardFamily: "AISC",
    standardCode: "AISC 360",
    edition: AISC_UNKNOWN_EDITION_TOKEN,
    materialScope: "steel",
  });
}

function demand(context: StructuralStandardContext, valueN = 1_000_000): SteelCapacityEngineInput["demand"] {
  return {
    resultId: "demand-us2",
    memberId: "m-us2",
    shear: { value: 0, unit: "N", locationM: 0, signed: 0 },
    moment: { value: 0, unit: "N.m", locationM: 0, signed: 0 },
    axial: { valueN, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "not required" },
    capacityPresent: false,
    standardContext: context,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c", sourceKind: "calculation", reference: "d1c-axial" }],
    combinationId: "comb-us2",
  };
}

function material(): SteelMaterialDesignProperties {
  return {
    materialRef: "mat-us2",
    grade: "A992",
    yieldStrength: { name: "Fy", value: 345, unit: "MPa", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    ultimateStrength: { name: "Fu", value: 450, unit: "MPa", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    elasticModulus: null,
    shearModulus: null,
    poissonRatio: null,
    density: null,
    thicknessDependentMetadata: null,
    jurisdictionApplicability: ["united-states"],
  };
}

function section(): SteelSectionDesignProperties {
  return {
    sectionRef: "sec-us2",
    sectionFamily: "W",
    catalogSource: "ENGINEER_SUPPLIED",
    catalogVersion: null,
    jurisdictionApplicability: ["united-states"],
    area: { name: "Ag", value: 9480, unit: "mm2", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
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
    netArea: { name: "An", value: 8200, unit: "mm2", provenanceRef: "engineer-net-area", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    geometricDimensions: {},
  };
}

function designContext(context: StructuralStandardContext): SteelDesignContext {
  return {
    designContextId: "dc-us2",
    memberRef: "m-us2",
    sectionRef: "sec-us2",
    materialRef: "mat-us2",
    demandRefs: ["demand-us2"],
    standardContextRef: context.contextId,
    parameterSetRef: null,
    effectiveLengthContextRef: null,
    restraintContextRef: null,
    stabilityContextRef: null,
    fabricationContextRef: null,
    evidenceRefs: [{ evidenceId: "ev-eng", sourceKind: "human_input", reference: "engineer" }],
    toolRef: "EOS_US_STEEL_TENSION",
    methodRef: "US_TENSION",
    provenanceRef: governedProvenance({ jurisdiction: "united-states", standard: "AISC 360", calculationMethod: "US_TENSION" }),
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
    limitState: "TENSION",
    requiredProperties: ["material.yieldStrength", "material.ultimateStrength", "section.area", "section.netArea"],
    usSteelContext: usSteel(),
    ...patch,
  };
}

describe("EOS-D1D-US-2 US steel tension", () => {
  it("reuses common mechanics, requires explicit LRFD/ASD, and keeps AISC factors unguessed", () => {
    expect(EOS_D1D_US2_PHASE).toBe("EOS-D1D-US-2");
    expect(COMMON_STEEL_FRAMEWORK_REUSED).toBe(true);
    expect(US1_STANDARD_BINDING_REUSED).toBe(true);
    expect(PARALLEL_US_STEEL_CORE_CREATED).toBe(false);
    expect(AU_CODE_RULES_REUSED_AS_US_RULES).toBe(false);
    expect(EU_CODE_RULES_REUSED_AS_US_RULES).toBe(false);
    expect(AU_EU_TENSION_IMPLEMENTATION_REVIEW.some((row) => row.classification === "JURISDICTION_NEUTRAL_REUSABLE")).toBe(true);
    expect(IMPLEMENTED_US_TENSION_METHODS).toEqual(["US_TENSION_GROSS_YIELD_MECHANICS", "US_TENSION_NET_FRACTURE_MECHANICS"]);
    expect(FRAMEWORK_ONLY_US_TENSION_METHODS).toEqual(expect.arrayContaining([
      "US_TENSION_GROSS_YIELD_LRFD",
      "US_TENSION_GROSS_YIELD_ASD",
      "US_TENSION_EFFECTIVE_NET_FRACTURE",
      "US_TENSION_BLOCK_SHEAR",
    ]));
    expect(US_TENSION_METHOD_REGISTRY).toHaveLength(8);
    expect(SILENT_AISC_EDITION_INFERENCE).toBe(false);
    expect(DEFAULT_LRFD_OR_ASD).toBe(false);
    expect(COMMON_MECHANICS_SHARED_ACROSS_LRFD_ASD).toBe(true);
    expect(LRFD_ASD_MECHANICS_DUPLICATED).toBe(false);
    expect(SILENT_LRFD_ASD_CONVERSION).toBe(false);
    expect(GENERIC_MECHANICS_EQUALS_AISC_DESIGN_STRENGTH).toBe(false);
    expect(MECHANICS_REFERENCE_EQUALS_AISC_NOMINAL_STRENGTH).toBe(false);
    expect(US_LRFD_RESISTANCE_FACTOR_GUESSED).toBe(false);
    expect(US_ASD_FACTOR_GUESSED).toBe(false);
    expect(US_LRFD_RESISTANCE_FACTOR_SOURCE).toBe("VALIDATION_REQUIRED");
    expect(UNKNOWN_US_TENSION_CODE_PARAMETER_GUESSED).toBe(false);
    expect(() => requestUsLrfdResistanceFactor()).toThrow(/phi/);
    expect(() => requestUsAsdFactor()).toThrow(/Omega/);
    expect(() => assertLrfdAsdFactorIsolation("LRFD", "Omega")).toThrow(/ASD factor cannot be used in LRFD/);
    expect(() => assertLrfdAsdFactorIsolation("ASD", "phi")).toThrow(/LRFD factor cannot be used in ASD/);
  });

  it("requires governed US context, D1C demand, material/section areas, and fails closed on missing inputs", () => {
    const context = usStandard();
    expect(consumeDemandHandoff(demand(context))).toBe("demand-us2");
    expect(() => evaluateSteelCapacity(capacityInput({ usSteelContext: null }))).toThrow(/missing AISC context/);
    expect(() => evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({ designMethod: null }),
    }))).toThrow(/DESIGN_METHOD_REQUIRED/);
    expect(() => evaluateSteelCapacity(capacityInput({ material: { ...material(), yieldStrength: null } }))).toThrow(/missing material.yieldStrength/);
    expect(() => evaluateSteelCapacity(capacityInput({ material: { ...material(), ultimateStrength: null } }))).toThrow(/missing material.ultimateStrength/);
    expect(() => evaluateSteelCapacity(capacityInput({ section: { ...section(), area: null } }))).toThrow(/missing section.area/);
    expect(() => evaluateSteelCapacity(capacityInput({ section: { ...section(), netArea: null } }))).toThrow(/missing section.netArea/);
    expect(SILENT_NET_AREA_EQUALS_GROSS_AREA).toBe(false);
    expect(AUST300_US_DEFAULT).toBe(false);
    expect(EU_SECTION_CATALOG_US_DEFAULT).toBe(false);
    expect(US_SECTION_CATALOG_OPTIONAL).toBe(true);
    expect(() => evaluateSteelCapacity(capacityInput({ section: { ...section(), catalogSource: "AUST300" } }))).toThrow(/not a US default/);
    expect(() => evaluateSteelCapacity(capacityInput({ section: { ...section(), catalogSource: "EU_SECTION_CATALOG" } }))).toThrow(/not a US default/);
    expect(() => evaluateSteelCapacity(capacityInput({
      demand: { ...demand(usStandard()), resultId: "" },
    }))).toThrow(/demand missing/);
    expect(() => evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({
        designMethod: "LRFD",
        loadStandard: { standardId: "ASCE_7", standardCode: "ASCE 7", edition: "2022", combinationBasis: "ALLOWABLE", implemented: false },
      }),
    }))).toThrow(/incompatible with a governed allowable load basis/);
  });

  it("preserves both mechanics modes, supports LRFD/ASD unit independence, and does not treat utilization as AISC approval", () => {
    const lrfdCustomary = evaluateSteelCapacity(capacityInput());
    expect(lrfdCustomary.implemented).toBe(true);
    expect(lrfdCustomary.resultClass).toBe("MECHANICS_REFERENCE");
    expect(lrfdCustomary.standardConformanceState).toBe("INTENDED_PROFILE");
    expect(lrfdCustomary.tensionChecks?.map((row) => row.methodId)).toEqual([
      "US_TENSION_GROSS_YIELD_MECHANICS",
      "US_TENSION_NET_FRACTURE_MECHANICS",
    ]);
    expect(lrfdCustomary.governingMethodId).toBe("US_TENSION_GROSS_YIELD_MECHANICS");
    expect(lrfdCustomary.capacity?.value).toBe(3_270_600);
    const asdSi = evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({ designMethod: "ASD", unitSystem: "SI" }),
    }));
    expect(asdSi.implemented).toBe(true);
    expect(asdSi.capacity?.value).toBe(lrfdCustomary.capacity?.value);
    const gross = scoreUsTensionBenchmark("US-TENSION-BM-GROSS-YIELD-HAND-1", 3_270_600);
    const net = scoreUsTensionBenchmark("US-TENSION-BM-NET-FRACTURE-HAND-1", 3_690_000);
    expect(gross.evidenceRef).toMatch(/PASS/);
    expect(net.evidenceRef).toMatch(/PASS/);
    expect(BENCHMARK_EQUALS_AISC_CONFORMANCE).toBe(false);
    expect(COMMON_BENCHMARK_EQUALS_AISC_CONFORMANCE).toBe(false);
    expect(US_TENSION_INDEPENDENT_BENCHMARK_STATE).toBe("PARTIAL");
    expect(US_TENSION_STRENGTH_RESULT_STATE).toBe("PARTIAL");
    const check = orchestrateUsTensionDesignCheck({
      designCheckId: "chk-us2",
      designContext: designContext(usStandard()),
      capacityInput: capacityInput(),
    });
    expect(check.verdict).toBe("CHECK_SATISFIED");
    expect(check.engineeringApproved).toBe(false);
    expect(check.designCheck.approvalState).toBe("not_approved");
    expect(MECHANICS_REFERENCE_UTILIZATION_LABELLED_AS_AISC_CHECK).toBe(false);
    expect(CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(AUTOMATIC_ENGINEERING_APPROVAL).toBe(false);
    expect(US_TENSION_HUMAN_VALIDATION_REQUIRED).toBe(true);
    expect(() => evaluateUsSteelTensionCodeProfile(capacityInput(), "LRFD")).toThrow(/phi/);
    expect(() => evaluateUsSteelTensionCodeProfile(capacityInput({ usSteelContext: usSteel({ designMethod: "ASD" }) }), "ASD")).toThrow(/Omega/);
    expect(() => evaluateUsSteelTensionEffectiveNet(capacityInput())).toThrow(/shear-lag-U/);
    expect(() => evaluateUsSteelTensionHoleDeduction(capacityInput())).toThrow(/hole-deduction/);
  });

  it("supports multi-jurisdiction, direct-contract international profiles, and fail-closed AI/code-profile boundaries", () => {
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
        contextId: "ctx-aisc-other",
        jurisdictionProfileRef: "other",
        standardFamily: "AISC",
        standardCode: "AISC 360",
        edition: AISC_UNKNOWN_EDITION_TOKEN,
        materialScope: "steel",
      }),
      designContext: { ...designContext(usStandard("ctx-aisc-other")), standardContextRef: "ctx-aisc-other" },
      demand: demand(usStandard("ctx-aisc-other")),
      usSteelContext: usSteel({
        jurisdictionProfileRef: "other",
        directContractProfile: true,
        buildingCodeAdoption: null,
        buildingCodeAdoptionRef: null,
      }),
    }));
    expect(international.implemented).toBe(true);
    expect(DIRECT_CONTRACT_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE).toBe(false);
    expect(() => denySilentUsDesignMethodChoice()).toThrow(/LRFD or ASD/);
    expect(() => denyAiLrfdAsdChoice()).toThrow(/LRFD or ASD/);
    expect(() => denyAiUsFactor()).toThrow(/AISC factor/);
    expect(() => denyAiUsNetArea()).toThrow(/net area/);
    expect(() => denyAiUsShearLag()).toThrow(/shear-lag/);
    expect(() => denyAiUsCodeStrength()).toThrow(/code strength/);
    expect(() => denyAiUsConformanceClaim()).toThrow(/compliance/);
    expect(LLM_US_TENSION_STRENGTH_AUTHORITY).toBe(false);
    expect(AI_LRFD_ASD_AUTHORITY).toBe(false);
    expect(AI_FACTOR_AUTHORITY).toBe(false);
    expect(AI_NET_AREA_AUTHORITY).toBe(false);
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(() => assertAiscTensionEditionIsolation("2016", "2022")).toThrow(/STANDARD_VERSION_CONFLICT/);
    expect(() => evaluateSteelCapacity(capacityInput({ designContext: { ...designContext(usStandard()), validationState: "CERTIFIED" } }))).toThrow(/certified/);
    expect(resolveUsSteelContext({
      projectContext: null,
      explicitCalculationContext: usSteel({ standardConformanceState: "CONFORMANCE_VALIDATED" }),
      issuedContext: null,
      adoptionRequired: true,
      loadStandardRequired: false,
      ruleRequiresSeismic: false,
      enforceLoadMethodCompatibility: true,
      unresolvedSourceConflict: false,
      collapseDesignMethodFromUnits: false,
      convertLrfdToAsdSilently: false,
      convertAsdToLrfdSilently: false,
      source: "explicit",
      aiSelectedEdition: false,
      aiSelectedDesignMethod: false,
      aiInventedAmendment: false,
      aiClaimedConformance: false,
      humanConfirmationRequired: false,
    })).toMatchObject({ ok: false, failReason: "AISC_EDITION_REQUIRED" });
    expect(() => assertOptimizationUsTensionRecheck({
      candidateSectionRef: "W12x50",
      proposedBy: "AI",
      deterministicRecheckRequired: true,
      rechecked: true,
      memberCheckState: "CHECK_UNDETERMINED",
    })).toThrow(/undetermined tension/);
    expect(US_OPTIMIZATION_ACCEPTS_UNDETERMINED_TENSION).toBe(false);
    expect(US_BLOCK_SHEAR_IMPLEMENTED).toBe(false);
    expect(US_CONNECTION_TENSION_DESIGN_IMPLEMENTED).toBe(false);
    expect(US_SEISMIC_TENSION_DESIGN_IMPLEMENTED).toBe(false);
    expect(US_FATIGUE_TENSION_DESIGN_IMPLEMENTED).toBe(false);
    expect(US_SHEAR_LAG_FACTOR_GUESSED).toBe(false);
    expect(US_HOLE_DEDUCTION_GUESSED).toBe(false);
  });

  it("keeps AU/EU/US mechanics consistent and does not regress AU/EU or contaminate the global core", () => {
    const sharedMaterial = material();
    const sharedSection = section();
    const auContext = createAuSteelStandardProfile({ contextId: "ctx-as4100-us2" });
    const au = evaluateAuSteelTension({
      adapterId: "AU_STEEL",
      designContext: { ...designContext(auContext), standardContextRef: auContext.contextId, toolRef: "EOS_AU_STEEL_TENSION", methodRef: "AU_TENSION" },
      standardContext: auContext,
      material: { ...sharedMaterial, jurisdictionApplicability: ["australia"] },
      section: { ...sharedSection, sectionFamily: "UB", catalogSource: "ENGINEER_SUPPLIED", jurisdictionApplicability: ["australia"] },
      stability: null,
      demand: demand(auContext),
      limitState: "TENSION",
      requiredProperties: ["material.yieldStrength", "material.ultimateStrength", "section.area", "section.netArea"],
    });
    const euContext = {
      ...createConfiguredKnowledgeContext({
        contextId: "ctx-en1993-us2",
        jurisdictionProfileRef: "eu-eea",
        standardFamily: "EN",
        standardCode: "EN 1993-1-1",
        edition: "UNKNOWN_PENDING_CONFIRMATION",
        materialScope: "steel",
      }),
      nationalAnnexRef: exampleEurocodeAnnex(),
    };
    const eu = evaluateEuSteelTension({
      adapterId: "EU_STEEL",
      designContext: { ...designContext(euContext), standardContextRef: euContext.contextId, toolRef: "EOS_EU_STEEL_TENSION", methodRef: "EU_TENSION" },
      standardContext: euContext,
      material: { ...sharedMaterial, jurisdictionApplicability: ["eu-eea"] },
      section: { ...sharedSection, sectionFamily: "IPE", catalogSource: "ENGINEER_SUPPLIED", jurisdictionApplicability: ["eu-eea"] },
      stability: null,
      demand: demand(euContext),
      limitState: "TENSION",
      requiredProperties: ["material.yieldStrength", "material.ultimateStrength", "section.area", "section.netArea"],
      eurocodeContext: null,
    });
    const us = evaluateSteelCapacity(capacityInput());
    expect(au.capacity?.value).toBe(us.capacity?.value);
    expect(eu.capacity?.value).toBe(us.capacity?.value);
    expect(nominalTensionForceN(sharedMaterial.yieldStrength!, sharedSection.area!, "material.yieldStrength", "section.area")).toBe(3_270_600);
    expect(AU_METHOD_VALIDATION_INVENTORY).toHaveLength(18);
    expect(AU_STEEL_VALIDATION_MATRIX).toHaveLength(11);
    expect(EU_METHOD_VALIDATION_INVENTORY.length).toBeGreaterThan(20);
    expect(EU_STEEL_VALIDATION_MATRIX).toHaveLength(13);
    expect(IMPLEMENTED_INTERACTION_METHODS).toEqual([]);
    expect(IMPLEMENTED_EU_INTERACTION_METHODS).toEqual([]);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL).toEqual({ ready: true, implemented: false, standards: ["AISC 360"], loadContext: ["ASCE 7"] });
    expect(US_STEEL_IMPLEMENTATION_SUBPHASES[1]).toMatch(/US-2 tension/);
    expect(US_STEEL_PACK_CERTIFIED).toBe(false);
    expect(US_STEEL_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_BOUNDED_METHODS");
    expect(SCHEMA_CHANGE_REQUIRED_FOR_US2).toBe(false);
    expect(EU_ONLY_STEEL_CORE).toBe(false);
    expect(US2_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK).toBe(true);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(D1D_US2_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(D1D_US2_D0_RISK_DISPOSITION.REDUCED).toEqual(["D0-R01"]);
    const usSrc = ["evaluate.ts", "registry.ts"].map((name) => readFileSync(join(here, "us-tension", name), "utf8")).join("\n");
    expect(usSrc).not.toMatch(/AU_TENSION_GROSS_YIELD|AS 4100|phiNt|γM0|National Annex/);
    const mechanics = readFileSync(join(here, "mechanics", "tension-force.ts"), "utf8");
    expect(mechanics).not.toMatch(/phi-t-yield|Omega|shear-lag-U/);
  });
});
