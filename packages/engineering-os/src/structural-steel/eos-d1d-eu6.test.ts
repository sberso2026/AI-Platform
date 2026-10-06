import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_ENGINEERING_APPROVAL,
  AI_EU_INTERACTION_ASSISTANCE_ADVISORY_ONLY,
  AI_INTERACTION_PARAMETER_AUTHORITY,
  AI_NDP_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AU_CODE_RULES_REUSED_AS_EU_RULES,
  AUST300_EU_DEFAULT,
  AUTOMATIC_ENGINEERING_APPROVAL,
  BIAXIAL_LINEAR_INTERACTION_ASSUMED,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  COMBINED_ACTION_IMPLEMENTED,
  COMPONENT_BENCHMARK_EQUALS_INTERACTION_CONFORMANCE,
  COMPONENT_VECTOR_EQUALS_INTERACTION_CHECK,
  CONNECTION_INTERACTION_IMPLEMENTED,
  DEFAULT_EU_NATIONAL_ANNEX,
  EOS_D1D_EU6_PHASE,
  EU_COMBINED_PILOT_EXPOSURE,
  EU_INITIAL_STEEL_STANDARD_PART,
  EU_INTERACTION_CLASSIFICATION_GUESSED,
  EU_INTERACTION_PARAMETER_GUESSED,
  EU_ONLY_STEEL_CORE,
  EU_OPTIMIZATION_ACCEPTS_UNDETERMINED_INTERACTION,
  EU_OPTIMIZATION_INTERACTION_RECHECK_REQUIRED,
  EU_SHEAR_REDUCTION_RULE_GUESSED,
  EU_STEEL_IMPLEMENTATION_MATURITY,
  EU_STEEL_PACK_CERTIFIED,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  LLM_EU_INTERACTION_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  MECHANICS_REFERENCE_AUTOMATICALLY_VALID_FOR_CODE_INTERACTION,
  MEMBER_INTERACTION_EQUALS_GLOBAL_FRAME_STABILITY,
  PARALLEL_INTERACTION_FRAMEWORK_CREATED,
  SCHEMA_CHANGE_REQUIRED_FOR_EU6,
  SILENT_EU_STANDARD_EDITION_INFERENCE,
  TORSIONAL_INTERACTION_IMPLEMENTED,
  UNIVERSAL_AXIAL_BIAXIAL_EQUATION,
  UNIVERSAL_INTERACTION_EQUATION,
  UNIVERSAL_INTERACTION_EQUATION_HARDCODED,
  UNKNOWN_INTERACTION_RELATIONSHIP_GUESSED,
  type EurocodeNationalAnnex,
  type EurocodeSteelDesignContext,
  type SteelCapacityEngineInput,
  type SteelCombinedActionInput,
  type SteelCombinedCapacityComponent,
  type SteelCombinedDemandComponent,
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
  AU_INTERACTION_ARCHITECTURE_REVIEW,
  AU_INTERACTION_ARCHITECTURE_REVIEWED,
  AU_METHOD_VALIDATION_INVENTORY,
  AU_STEEL_VALIDATION_MATRIX,
  COMMON_INTERACTION_ARCHITECTURE_REUSED_WHERE_VALID,
  D1D_EU6_D0_RISK_DISPOSITION,
  EU_INTERACTION_INDEPENDENT_BENCHMARKS,
  EU_INTERACTION_METHOD_REGISTRY,
  EU_INTERACTION_STANDARD_PART_DEPENDENCY_MODEL,
  FRAMEWORK_ONLY_EU_INTERACTION_METHODS,
  IMPLEMENTED_EU_BENDING_METHODS,
  IMPLEMENTED_EU_COMPRESSION_METHODS,
  IMPLEMENTED_EU_INTERACTION_METHODS,
  IMPLEMENTED_EU_SHEAR_METHODS,
  IMPLEMENTED_EU_TENSION_METHODS,
  IMPLEMENTED_INTERACTION_METHODS,
  STEEL_ADAPTER_BOUNDARIES,
  US_STEEL_IMPLEMENTATION_SUBPHASES,
  assertAiCannotCombineIncompatibleCases,
  assertAiCannotInventInteraction,
  assertEuInteractionRuleAuthority,
  assertInteractionGenerationCompatible,
  assertOptimizationEuInteractionRecheck,
  consumeDemandHandoff,
  createEuCombinedActionContext,
  denyAiConformanceClaim,
  denyAiInteractionCoefficient,
  denyAiInteractionEquation,
  denyAiNdpSupply,
  denyNationalAnnexFromUserLocation,
  detectRequiredInteractions,
  euCombinedCodeProfileCheckState,
  evaluateEuSteelCombinedActionCodeProfile,
  evaluateSteelCapacity,
  orchestrateEuCombinedActionDesignCheck,
  requestEuBiaxialLinearInteraction,
  requestEuConnectionInteraction,
  requestEuInteractionClassification,
  requestEuInteractionPartialFactor,
  requestEuShearReduction,
  requestEuTorsionalInteraction,
  requestEuUniversalInteractionEquation,
  unknownEditionBlocksConformance,
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
      contextId: `ctx-en1993-eu6-${country}`,
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
    contextId: `ctx-eu-combined-${country}`,
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-eu6",
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
    projectContextRef: "proj-eu6",
    calculationContextRef: "calc-eu6",
    sourceAuthorityRef: "governed-project-profile",
    intendedStandardProfile: "EN1993",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: "eu6:combined",
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
    ...overrides,
  };
}

function demand(context: StructuralStandardContext, patch: Partial<SteelCapacityEngineInput["demand"]> = {}): SteelCapacityEngineInput["demand"] {
  return {
    resultId: "demand-eu6",
    memberId: "m-eu6",
    shear: { value: 0, unit: "N", locationM: 2, signed: 0 },
    moment: { value: 100_000, unit: "N.m", locationM: 4, signed: 100_000 },
    axial: { valueN: 400_000, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "D1C deflection handoff; not recalculated in EU combined action" },
    capacityPresent: false,
    standardContext: context,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c", sourceKind: "calculation", reference: "d1c-combined" }],
    combinationId: "comb-eu6",
    ...patch,
  };
}

function material(): SteelMaterialDesignProperties {
  return {
    materialRef: "mat-eu6",
    grade: "S355",
    yieldStrength: { name: "fy", value: 300, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    ultimateStrength: { name: "fu", value: 440, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    elasticModulus: { name: "E", value: 200, unit: "GPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    shearModulus: { name: "G", value: 80, unit: "GPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    poissonRatio: { name: "nu", value: 0.3, unit: "1", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    density: null,
    thicknessDependentMetadata: null,
    jurisdictionApplicability: ["eu-eea"],
  };
}

function section(): SteelSectionDesignProperties {
  return {
    sectionRef: "sec-eu6",
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
  };
}

function stability(): SteelStabilityContext {
  return {
    stabilityContextId: "stab-eu6",
    memberLengthM: 8,
    effectiveLengthM: 8,
    unbracedLengthM: 8,
    restraintDescription: "pinned ends, explicit Le supplied",
    bucklingAxis: "BOTH",
    momentGradientRef: "uniform-moment",
    torsionalRestraint: "fork-supports",
    lateralRestraint: "discrete-end-flange",
    sourceEvidenceRef: "engineer-effective-length",
    derived: false,
    effectiveLengthMajorM: 8,
    effectiveLengthMinorM: 8,
    effectiveLengthProvenanceRef: "engineer-effective-length",
    unbracedLengthProvenanceRef: "engineer-unbraced-length",
    warpingRestraint: "fork-supports",
    momentDistributionDescription: "uniform-moment",
    loadApplicationPosition: "shear-centre",
  };
}

function designContext(context: StructuralStandardContext): SteelDesignContext {
  return {
    designContextId: "dc-eu6",
    memberRef: "m-eu6",
    sectionRef: "sec-eu6",
    materialRef: "mat-eu6",
    demandRefs: ["demand-eu6"],
    standardContextRef: context.contextId,
    parameterSetRef: null,
    effectiveLengthContextRef: "stab-eu6",
    restraintContextRef: "stab-eu6",
    stabilityContextRef: "stab-eu6",
    fabricationContextRef: null,
    evidenceRefs: [{ evidenceId: "ev-eng", sourceKind: "human_input", reference: "engineer" }],
    toolRef: "EOS_EU_STEEL_COMBINED_ACTION",
    methodRef: "EU_COMBINED",
    provenanceRef: governedProvenance({ jurisdiction: "eu-eea", standard: "EN 1993-1-1", calculationMethod: "EU_COMBINED" }),
    validationState: "FRAMEWORK_ONLY",
    reviewState: "required",
  };
}

function extraDemand(kind: SteelCombinedDemandComponent["kind"], value: number, unit: string, signed = value): SteelCombinedDemandComponent {
  return {
    resultId: `demand-eu6-${kind.toLowerCase()}`,
    memberId: "m-eu6",
    combinationId: "comb-eu6",
    kind,
    value,
    unit,
    signed,
  };
}

function extraCapacity(
  kind: SteelCombinedCapacityComponent["kind"],
  value: number,
  unit: string,
  contextId: string,
  patch: Partial<SteelCombinedCapacityComponent> = {},
): SteelCombinedCapacityComponent {
  return {
    capacityResultId: `cap-eu6-${kind.toLowerCase()}`,
    methodId: `EU_${kind}_REFERENCE`,
    memberId: "m-eu6",
    combinationId: "comb-eu6",
    kind,
    value,
    unit,
    standardProfileRef: contextId,
    maturity: "BENCHMARKED",
    ...patch,
  };
}

function combined(patch: Partial<SteelCombinedActionInput> = {}): SteelCombinedActionInput {
  return {
    combinationRef: "comb-eu6",
    componentDemands: [],
    componentCapacities: [],
    ...patch,
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
    limitState: "COMBINED_ACTION",
    requiredProperties: [],
    eurocodeContext: eurocodeContext(),
    combined: combined(),
    ...patch,
  };
}

describe("EOS-D1D-EU-6 Eurocode steel combined actions", () => {
  it("reviews AU interaction architecture and keeps Eurocode rules unguessed", () => {
    expect(EOS_D1D_EU6_PHASE).toBe("EOS-D1D-EU-6");
    expect(AU_INTERACTION_ARCHITECTURE_REVIEWED).toBe(true);
    expect(COMMON_INTERACTION_ARCHITECTURE_REUSED_WHERE_VALID).toBe(true);
    expect(AU_CODE_RULES_REUSED_AS_EU_RULES).toBe(false);
    expect(PARALLEL_INTERACTION_FRAMEWORK_CREATED).toBe(false);
    expect(AU_INTERACTION_ARCHITECTURE_REVIEW.some((row) => row.classification === "JURISDICTION_NEUTRAL_REUSABLE")).toBe(true);
    expect(AU_INTERACTION_ARCHITECTURE_REVIEW.some((row) => row.classification === "AU_SPECIFIC")).toBe(true);
    expect(IMPLEMENTED_EU_INTERACTION_METHODS).toEqual([]);
    expect(FRAMEWORK_ONLY_EU_INTERACTION_METHODS).toHaveLength(8);
    expect(FRAMEWORK_ONLY_EU_INTERACTION_METHODS).toEqual(expect.arrayContaining([
      "EU_INTERACTION_TENSION_BENDING",
      "EU_INTERACTION_TENSION_BIAXIAL_BENDING",
      "EU_INTERACTION_COMPRESSION_BENDING",
      "EU_INTERACTION_COMPRESSION_BIAXIAL_BENDING",
      "EU_INTERACTION_BIAXIAL_BENDING",
      "EU_INTERACTION_AXIAL_BIAXIAL_BENDING",
      "EU_INTERACTION_BENDING_SHEAR",
      "EU_INTERACTION_AXIAL_SHEAR",
    ]));
    expect(EU_INTERACTION_METHOD_REGISTRY).toHaveLength(8);
    expect(EU_INTERACTION_METHOD_REGISTRY.every((rule) => rule.applicability.length > 0)).toBe(true);
    expect(EU_INTERACTION_METHOD_REGISTRY.every((rule) => rule.annexDependency === "NDP_REQUIRED")).toBe(true);
    expect(EU_INTERACTION_STANDARD_PART_DEPENDENCY_MODEL.memberInteractionPart).toBe("EN_1993_1_1");
    expect(EU_INTERACTION_STANDARD_PART_DEPENDENCY_MODEL.bendingShearPlatedDependencyPart).toBe("EN_1993_1_5");
    expect(EU_INTERACTION_STANDARD_PART_DEPENDENCY_MODEL.assumedSinglePartGovernsAllInteractions).toBe(false);
    expect(EU_INITIAL_STEEL_STANDARD_PART).toBe("EN_1993_1_1");
    expect(SILENT_EU_STANDARD_EDITION_INFERENCE).toBe(false);
    expect(UNIVERSAL_INTERACTION_EQUATION).toBe(false);
    expect(UNIVERSAL_INTERACTION_EQUATION_HARDCODED).toBe(false);
    expect(UNKNOWN_INTERACTION_RELATIONSHIP_GUESSED).toBe(false);
    expect(UNIVERSAL_AXIAL_BIAXIAL_EQUATION).toBe(false);
    expect(BIAXIAL_LINEAR_INTERACTION_ASSUMED).toBe(false);
    expect(EU_SHEAR_REDUCTION_RULE_GUESSED).toBe(false);
    expect(EU_INTERACTION_PARAMETER_GUESSED).toBe(false);
    expect(EU_INTERACTION_CLASSIFICATION_GUESSED).toBe(false);
    expect(MECHANICS_REFERENCE_AUTOMATICALLY_VALID_FOR_CODE_INTERACTION).toBe(false);
    expect(COMPONENT_VECTOR_EQUALS_INTERACTION_CHECK).toBe(false);
    expect(EU_INTERACTION_INDEPENDENT_BENCHMARKS).toBe("NOT_APPLICABLE");
    expect(COMPONENT_BENCHMARK_EQUALS_INTERACTION_CONFORMANCE).toBe(false);
    expect(() => requestEuUniversalInteractionEquation()).toThrow(/unknown required code parameter/);
    expect(() => requestEuBiaxialLinearInteraction()).toThrow(/unknown required code parameter/);
    expect(() => requestEuShearReduction()).toThrow(/unknown required code parameter/);
    expect(() => requestEuInteractionClassification()).toThrow(/unknown required code parameter/);
    expect(() => requestEuInteractionPartialFactor()).toThrow(/partial-factor/);
    expect(() => requestEuTorsionalInteraction()).toThrow(/unknown required code parameter/);
    expect(() => requestEuConnectionInteraction()).toThrow(/unknown required code parameter/);
    expect(() => assertEuInteractionRuleAuthority("LLM_MEMORY_ONLY")).toThrow(/LLM_MEMORY_ONLY/);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
  });

  it("reuses D1C combined demands, detects interaction, and never treats the component vector as the check", () => {
    const context = euStandard();
    expect(consumeDemandHandoff(demand(context))).toBe("demand-eu6");
    expect(detectRequiredInteractions(capacityInput())).toEqual(["TENSION_BENDING"]);
    expect(detectRequiredInteractions(capacityInput({
      demand: demand(context, { axial: { valueN: -400_000, unit: "N", method: "AXIAL_DIRECT" } }),
      combined: combined({ componentDemands: [extraDemand("MOMENT_MINOR", 20_000, "N.m")] }),
    }))).toEqual([
      "COMPRESSION_BENDING",
      "COMPRESSION_BIAXIAL_BENDING",
      "AXIAL_BIAXIAL_BENDING",
      "BIAXIAL_BENDING",
    ]);
    expect(detectRequiredInteractions(capacityInput({
      demand: demand(context, {
        axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" },
        shear: { value: 400_000, unit: "N", locationM: 2, signed: 400_000 },
      }),
    }))).toEqual(["BENDING_SHEAR"]);
    expect(detectRequiredInteractions(capacityInput({
      demand: demand(context, {
        moment: { value: 0, unit: "N.m", locationM: 4, signed: 0 },
        shear: { value: 400_000, unit: "N", locationM: 2, signed: 400_000 },
      }),
    }))).toEqual(["AXIAL_SHEAR"]);
    expect(detectRequiredInteractions(capacityInput({
      combined: combined({ componentDemands: [extraDemand("MOMENT_MINOR", 20_000, "N.m")] }),
    }))).toEqual([
      "TENSION_BENDING",
      "TENSION_BIAXIAL_BENDING",
      "AXIAL_BIAXIAL_BENDING",
      "BIAXIAL_BENDING",
    ]);

    const tension = evaluateSteelCapacity(capacityInput());
    expect(tension.implemented).toBe(true);
    expect(tension.maturity).toBe("IMPLEMENTED");
    expect(tension.implementationBindingState).toBe("FRAMEWORK_ONLY");
    expect(tension.interactionRequired).toBe(true);
    expect(tension.capacity).toBeNull();
    expect(tension.combinedResults?.map((row) => row.interactionType)).toEqual(["TENSION_BENDING"]);
    expect(tension.combinedResults?.[0]?.checkState).toBe("CHECK_UNDETERMINED");
    expect(tension.combinedResults?.[0]?.reason).toBe("MISSING_CLASSIFICATION");
    expect(tension.combinedResults?.[0]?.interactionValue).toBeNull();
    const ctx = createEuCombinedActionContext(capacityInput(), ["TENSION_BENDING"]);
    expect(ctx.axialDemandRef).toBe("demand-eu6");
    expect(ctx.majorMomentDemandRef).toBe("demand-eu6");
    expect(ctx.sectionClassificationRef).toBe("VALIDATION_REQUIRED");
    expect(ctx.standardPartRefs).toEqual(["EN_1993_1_1", "EN_1993_1_5"]);

    const compression = evaluateSteelCapacity(capacityInput({
      demand: demand(context, { axial: { valueN: -400_000, unit: "N", method: "AXIAL_DIRECT" } }),
    }));
    expect(compression.combinedResults?.map((row) => row.interactionType)).toEqual(["COMPRESSION_BENDING"]);
    expect(compression.combinedResults?.[0]?.checkState).toBe("CHECK_UNDETERMINED");

    const biaxial = evaluateSteelCapacity(capacityInput({
      demand: demand(context, { axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" } }),
      combined: combined({ componentDemands: [extraDemand("MOMENT_MINOR", 20_000, "N.m")] }),
    }));
    expect(biaxial.combinedResults?.map((row) => row.interactionType)).toEqual(["BIAXIAL_BENDING"]);
    expect(biaxial.combinedResults?.[0]?.checkState).toBe("CHECK_UNDETERMINED");

    const axialBiaxial = evaluateSteelCapacity(capacityInput({
      combined: combined({ componentDemands: [extraDemand("MOMENT_MINOR", 20_000, "N.m")] }),
    }));
    expect(axialBiaxial.combinedResults?.map((row) => row.interactionType)).toEqual([
      "TENSION_BENDING",
      "TENSION_BIAXIAL_BENDING",
      "AXIAL_BIAXIAL_BENDING",
      "BIAXIAL_BENDING",
    ]);
    expect(axialBiaxial.combinedResults?.every((row) => row.checkState === "CHECK_UNDETERMINED")).toBe(true);
    expect(axialBiaxial.governingMethodId).toBe("EU_INTERACTION_TENSION_BENDING-V1");

    const bendingShear = evaluateSteelCapacity(capacityInput({
      demand: demand(context, {
        axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" },
        shear: { value: 400_000, unit: "N", locationM: 2, signed: 400_000 },
      }),
    }));
    expect(bendingShear.combinedResults?.map((row) => row.interactionType)).toEqual(["BENDING_SHEAR"]);

    const axialShear = evaluateSteelCapacity(capacityInput({
      demand: demand(context, {
        moment: { value: 0, unit: "N.m", locationM: 4, signed: 0 },
        shear: { value: 400_000, unit: "N", locationM: 2, signed: 400_000 },
      }),
    }));
    expect(axialShear.combinedResults?.map((row) => row.interactionType)).toEqual(["AXIAL_SHEAR"]);
    expect(axialShear.combinedResults?.[0]?.reason).toBe("INTERACTION_RULE_VALIDATION_REQUIRED");

    const vector = evaluateSteelCapacity(capacityInput({
      combined: combined({
        componentCapacities: [
          extraCapacity("TENSION", 1_542_000, "N", context.contextId),
          extraCapacity("BENDING_MAJOR", 300_000, "N.m", context.contextId),
        ],
      }),
    }));
    expect(vector.componentUtilizations?.equalsInteractionCheck).toBe(false);
    expect(vector.componentUtilizations?.rows.find((row) => row.kind === "AXIAL")?.informationalOnly).toBe(true);
    expect(vector.componentUtilizations?.rows.find((row) => row.kind === "AXIAL")?.ratio).toBeCloseTo(400_000 / 1_542_000, 8);
    expect(vector.componentUtilizations?.rows.find((row) => row.kind === "BENDING_MAJOR")?.ratio).toBeCloseTo(100_000 / 300_000, 8);
    expect(vector.combinedResults?.[0]?.checkState).toBe("CHECK_UNDETERMINED");
    expect(vector.combinedResults?.[0]?.checkState).not.toBe("CHECK_SATISFIED");
  });

  it("fails closed for combination, revision, authority, classification, stability, annex, NDP, and edition defects", () => {
    const context = euStandard();
    expect(() => evaluateSteelCapacity(capacityInput({
      combined: combined({
        combinationRef: "comb-other",
        componentDemands: [{ ...extraDemand("MOMENT_MINOR", 20_000, "N.m"), combinationId: "comb-other" }],
      }),
    }))).toThrow(/incompatible load combination/);
    expect(() => evaluateSteelCapacity(capacityInput({
      combined: combined({
        componentDemands: [{ ...extraDemand("MOMENT_MINOR", 20_000, "N.m"), revision: "stale-rev" }],
      }),
    }))).toThrow(/revision mismatch/);
    expect(() => evaluateSteelCapacity(capacityInput({
      combined: combined({
        componentCapacities: [
          extraCapacity("TENSION", 1_542_000, "N", context.contextId, {
            resultClass: "DESIGN_CAPACITY",
            authorityState: "MECHANICS_REFERENCE",
          }),
        ],
      }),
    }))).toThrow(/mechanics-reference capacity must not be treated as Eurocode interaction resistance/);

    const mechanicsOnly = evaluateSteelCapacity(capacityInput({
      demand: demand(context, {
        moment: { value: 0, unit: "N.m", locationM: 4, signed: 0 },
        shear: { value: 400_000, unit: "N", locationM: 2, signed: 400_000 },
      }),
      combined: combined({
        componentCapacities: [
          extraCapacity("TENSION", 1_542_000, "N", context.contextId),
          extraCapacity("SHEAR", 800_000, "N", context.contextId),
        ],
      }),
    }));
    expect(mechanicsOnly.combinedResults?.[0]?.reason).toBe("INSUFFICIENT_COMPONENT_AUTHORITY");
    expect(mechanicsOnly.combinedResults?.[0]?.checkState).toBe("CHECK_UNDETERMINED");
    expect(mechanicsOnly.combinedResults?.[0]?.componentAuthorityStates).toEqual(["MECHANICS_REFERENCE", "MECHANICS_REFERENCE"]);

    const missingClassification = evaluateSteelCapacity(capacityInput());
    expect(missingClassification.combinedResults?.[0]?.reason).toBe("MISSING_CLASSIFICATION");
    expect(missingClassification.combinedResults?.[0]?.checkState).toBe("CHECK_UNDETERMINED");

    const missingStability = evaluateSteelCapacity(capacityInput({
      demand: demand(context, { axial: { valueN: -400_000, unit: "N", method: "AXIAL_DIRECT" } }),
      stability: null,
      designContext: { ...designContext(context), stabilityContextRef: null },
    }));
    expect(missingStability.combinedResults?.[0]?.interactionType).toBe("COMPRESSION_BENDING");
    expect(missingStability.combinedResults?.[0]?.reason).toBe("MISSING_STABILITY");
    expect(missingStability.combinedResults?.[0]?.checkState).toBe("CHECK_UNDETERMINED");

    expect(() => evaluateSteelCapacity(capacityInput({
      designContext: { ...designContext(context), validationState: "CERTIFIED" },
    }))).toThrow(/unvalidated method requested as certified/);
    expect(() => evaluateEuSteelCombinedActionCodeProfile(capacityInput())).toThrow(/NATIONAL_ANNEX_REQUIRED|NDP_REQUIRED|unknown required code parameter/);
    expect(euCombinedCodeProfileCheckState(capacityInput())).toBe("CHECK_UNDETERMINED");
    expect(() => evaluateSteelCapacity(capacityInput({
      eurocodeContext: eurocodeContext("DE", { nationalAnnex: annex("FR") }),
    }))).toThrow(/NATIONAL_ANNEX_MISMATCH/);
    expect(() => evaluateSteelCapacity(capacityInput({
      eurocodeContext: eurocodeContext("DE", { version: { ...unknownEurocodeVersion("EN 1993-1-1"), edition: "2005" } }),
    }))).toThrow(/NATIONAL_ANNEX_MISMATCH/);
    expect(() => unknownEditionBlocksConformance(eurocodeContext("DE", { standardConformanceState: "CONFORMANCE_VALIDATED" }))).toThrow(/STANDARD_EDITION_REQUIRED/);
    expect(() => evaluateSteelCapacity(capacityInput({
      eurocodeContext: eurocodeContext("DE", { standardConformanceState: "CONFORMANCE_VALIDATED" }),
    }))).toThrow(/STANDARD_EDITION_REQUIRED/);
    expect(DEFAULT_EU_NATIONAL_ANNEX).toBe(false);
    expect(() => denyNationalAnnexFromUserLocation("locale")).toThrow(/USER_LOCATION_INFERENCE_DENIED/);
    expect(AUST300_EU_DEFAULT).toBe(false);
    expect(() => evaluateSteelCapacity(capacityInput({
      section: { ...section(), catalogSource: "AUST300" },
    }))).toThrow(/AUST300|EU default/);
  });

  it("does not treat CHECK_UNDETERMINED as approval, optimizer pass, or AI authority", () => {
    const outcome = orchestrateEuCombinedActionDesignCheck({
      designCheckId: "chk-eu6",
      designContext: designContext(euStandard()),
      capacityInput: capacityInput(),
    });
    expect(outcome.verdict).toBe("CHECK_UNDETERMINED");
    expect(outcome.engineeringApproved).toBe(false);
    expect(outcome.designCheck.approvalState).toBe("not_approved");
    expect(outcome.humanReviewRequired).toBe(true);
    expect(CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(AUTOMATIC_ENGINEERING_APPROVAL).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(EU_OPTIMIZATION_INTERACTION_RECHECK_REQUIRED).toBe(true);
    expect(EU_OPTIMIZATION_ACCEPTS_UNDETERMINED_INTERACTION).toBe(false);
    expect(() => assertOptimizationEuInteractionRecheck({
      candidateSectionRef: "ipe-200",
      proposedBy: "OPTIMIZER",
      deterministicRecheckRequired: true,
      rechecked: true,
      interactionCheckState: "CHECK_UNDETERMINED",
    })).toThrow(/undetermined interaction as pass/);
    expect(() => assertAiCannotInventInteraction("N/Nc + Mx/Mcx + My/Mcy <= 1", "AI")).toThrow(/AI cannot invent interaction equation/);
    expect(() => assertAiCannotCombineIncompatibleCases("AI", false)).toThrow(/AI cannot combine incompatible load cases/);
    expect(() => denyAiInteractionEquation()).toThrow(/cannot invent an interaction equation/);
    expect(() => denyAiInteractionCoefficient()).toThrow(/cannot invent an interaction coefficient/);
    expect(() => denyAiNdpSupply()).toThrow(/cannot supply NDP/);
    expect(() => denyAiConformanceClaim()).toThrow(/cannot claim Eurocode conformance/);
    expect(LLM_EU_INTERACTION_AUTHORITY).toBe(false);
    expect(AI_INTERACTION_PARAMETER_AUTHORITY).toBe(false);
    expect(AI_NDP_AUTHORITY).toBe(false);
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_EU_INTERACTION_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(EU_COMBINED_PILOT_EXPOSURE).toBe(false);
    expect(TORSIONAL_INTERACTION_IMPLEMENTED).toBe(false);
    expect(CONNECTION_INTERACTION_IMPLEMENTED).toBe(false);
    expect(MEMBER_INTERACTION_EQUALS_GLOBAL_FRAME_STABILITY).toBe(false);
    expect(GENERAL_FEA_CAPABILITY_CLAIMED).toBe(false);
    expect(COMBINED_ACTION_IMPLEMENTED).toBe(false);
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
    expect(de.combinedResults?.[0]?.checkState).toBe("CHECK_UNDETERMINED");
    expect(fr.combinedResults?.[0]?.checkState).toBe("CHECK_UNDETERMINED");
    expect(de.combinedResults?.[0]?.nationalAnnexRef).toBe("NA-DE-EN1993-1-1");
    expect(fr.combinedResults?.[0]?.nationalAnnexRef).toBe("NA-FR-EN1993-1-1");
    expect(de.combinedResults?.[0]?.ndpSetRef).toBeNull();
    expect(fr.combinedResults?.[0]?.ndpSetRef).toBeNull();
    expect(() => assertInteractionGenerationCompatible("SECOND_GENERATION")).toThrow(/STANDARD_VERSION_CONFLICT/);
    expect(() => evaluateSteelCapacity(capacityInput({
      eurocodeContext: eurocodeContext("DE", { version: { ...unknownEurocodeVersion("EN 1993-1-1"), generationFamily: "SECOND_GENERATION" } }),
    }))).toThrow(/STANDARD_VERSION_CONFLICT/);

    const ukContext = {
      ...createConfiguredKnowledgeContext({
        contextId: "ctx-uk-en1993-eu6",
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
    expect(uk.combinedResults?.[0]?.checkState).toBe("CHECK_UNDETERMINED");
    expect(uk.combinedResults?.[0]?.nationalAnnexRef).toBe("NA-GB-EN1993-1-1");

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
    expect(IMPLEMENTED_EU_SHEAR_METHODS).toEqual([
      "EU_SHEAR_ELASTIC_MAJOR_MECHANICS",
      "EU_SHEAR_ELASTIC_MINOR_MECHANICS",
      "EU_SHEAR_ELASTIC_BUCKLING_MECHANICS",
    ]);
    expect(AU_METHOD_VALIDATION_INVENTORY).toHaveLength(18);
    expect(AU_STEEL_VALIDATION_MATRIX).toHaveLength(11);
    expect(IMPLEMENTED_INTERACTION_METHODS).toEqual([]);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.EU_STEEL.implemented).toBe(false);
    expect(US_STEEL_IMPLEMENTATION_SUBPHASES[0]).toMatch(/US-1/);
    expect(EU_STEEL_PACK_CERTIFIED).toBe(false);
    expect(EU_STEEL_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_BOUNDED_METHODS");
    expect(SCHEMA_CHANGE_REQUIRED_FOR_EU6).toBe(false);
    expect(EU_ONLY_STEEL_CORE).toBe(false);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(D1D_EU6_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(D1D_EU6_D0_RISK_DISPOSITION.REDUCED).toEqual(["D0-R01"]);
    expect(D1D_EU6_D0_RISK_DISPOSITION.REMAINING).toEqual(["D0-R01", "D0-R04", "D0-R05", "D0-R07", "D0-R08", "D0-R10", "D0-R11", "D0-R12"]);
    const euSrc = ["evaluate.ts", "registry.ts", "authority.ts"].map((name) => readFileSync(join(here, "eu-combined", name), "utf8")).join("\n");
    expect(euSrc).not.toMatch(/AS 4100|phi|N\/Nc \+ M\/Mc|AU_INTERACTION_TENSION/);
    const mechanicsSrc = readFileSync(join(here, "mechanics", "interaction.ts"), "utf8");
    expect(mechanicsSrc).not.toMatch(/EN 1993-1-1 clause|gamma_M1|kyy|equivalent moment factor|National Annex/);
    const adapterSrc = readFileSync(join(here, "adapters.ts"), "utf8");
    expect(adapterSrc).not.toMatch(/N\/Nc \+ Mx\/Mcx|interactionValue\s*=\s*[0-9]/);
    const globalCore = readFileSync(join(here, "properties.ts"), "utf8");
    expect(globalCore).not.toMatch(/EU_INTERACTION_|N\/Nc \+ M\/Mc/);
  });
});
