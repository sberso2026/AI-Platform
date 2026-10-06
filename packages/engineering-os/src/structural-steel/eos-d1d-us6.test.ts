import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_CLASSIFICATION_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_FACTOR_AUTHORITY,
  AI_INTERACTION_PARAMETER_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AI_STABILITY_METHOD_AUTHORITY,
  AI_US_INTERACTION_ASSISTANCE_ADVISORY_ONLY,
  AISC_UNKNOWN_EDITION_TOKEN,
  AU_CODE_RULES_REUSED_AS_US_RULES,
  AUTOMATIC_ENGINEERING_APPROVAL,
  BIAXIAL_LINEAR_INTERACTION_ASSUMED,
  BENCHMARK_EQUALS_AISC_CONFORMANCE,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  COMMON_STEEL_FRAMEWORK_REUSED,
  COMPONENT_BENCHMARK_EQUALS_AISC_INTERACTION_CONFORMANCE,
  COMPONENT_VECTOR_EQUALS_INTERACTION_CHECK,
  DEFAULT_LRFD_OR_ASD,
  DIRECT_CONTRACT_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE,
  EOS_D1D_US6_PHASE,
  EU_CODE_RULES_REUSED_AS_US_RULES,
  EU_ONLY_STEEL_CORE,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  LLM_US_INTERACTION_AUTHORITY,
  MECHANICS_REFERENCE_AUTOMATICALLY_VALID_FOR_AISC_INTERACTION,
  MIXED_LRFD_ASD_COMPONENTS_ALLOWED,
  PARALLEL_US_INTERACTION_FRAMEWORK_CREATED,
  SCHEMA_CHANGE_REQUIRED_FOR_US6,
  SILENT_AISC_EDITION_INFERENCE,
  SILENT_LRFD_ASD_CONVERSION,
  STRUCTURAL_STANDARD_TEXT_EMBEDDED,
  UNIVERSAL_AXIAL_BIAXIAL_EQUATION,
  UNIVERSAL_INTERACTION_EQUATION,
  UNIVERSAL_US_INTERACTION_EQUATION,
  UNKNOWN_US_INTERACTION_PARAMETER_GUESSED,
  UNKNOWN_US_INTERACTION_RELATIONSHIP_GUESSED,
  US6_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK,
  US_BENDING_SHEAR_INTERACTION_IMPLEMENTED,
  US_BENDING_SHEAR_REDUCTION_RULE_GUESSED,
  US_CONNECTION_INTERACTION_IMPLEMENTED,
  US_INTERACTION_CLASSIFICATION_GUESSED,
  US_INTERACTION_HUMAN_VALIDATION_REQUIRED,
  US_INTERACTION_INDEPENDENT_BENCHMARK_STATE,
  US_INTERACTION_MOMENT_AMPLIFICATION_GUESSED,
  US_INTERACTION_PARAMETER_GUESSED,
  US_MEMBER_INTERACTION_EQUALS_GLOBAL_FRAME_VALIDATION,
  US_OPTIMIZATION_ACCEPTS_UNDETERMINED_INTERACTION,
  US_OPTIMIZATION_INTERACTION_RECHECK_REQUIRED,
  US_SEISMIC_INTERACTION_IMPLEMENTED,
  US_STANDARD_BINDING_REUSED,
  US_STEEL_IMPLEMENTATION_MATURITY,
  US_STEEL_PACK_CERTIFIED,
  US_SYNTHETIC_INTERACTION_UTILIZATION,
  US_TORSIONAL_INTERACTION_IMPLEMENTED,
  type BuildingCodeAdoptionContext,
  type SteelCapacityEngineInput,
  type SteelCombinedActionInput,
  type SteelCombinedCapacityComponent,
  type SteelCombinedDemandComponent,
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
  AU_EU_INTERACTION_ARCHITECTURE_REVIEW,
  COMMON_INTERACTION_ARCHITECTURE_REUSED_WHERE_VALID,
  US_AU_INTERACTION_ARCHITECTURE_REVIEWED,
  US_EU_INTERACTION_ARCHITECTURE_REVIEWED,
  AU_METHOD_VALIDATION_INVENTORY,
  AU_STEEL_VALIDATION_MATRIX,
  D1D_US6_D0_RISK_DISPOSITION,
  EU_METHOD_VALIDATION_INVENTORY,
  EU_STEEL_VALIDATION_MATRIX,
  FRAMEWORK_ONLY_US_INTERACTION_METHODS,
  IMPLEMENTED_EU_INTERACTION_METHODS,
  IMPLEMENTED_INTERACTION_METHODS,
  IMPLEMENTED_US_BENDING_METHODS,
  IMPLEMENTED_US_COMPRESSION_METHODS,
  IMPLEMENTED_US_INTERACTION_METHODS,
  IMPLEMENTED_US_SHEAR_METHODS,
  IMPLEMENTED_US_TENSION_METHODS,
  STEEL_ADAPTER_BOUNDARIES,
  US_INTERACTION_INDEPENDENT_BENCHMARKS,
  US_INTERACTION_METHOD_REGISTRY,
  US_STEEL_IMPLEMENTATION_SUBPHASES,
  assertAiCannotCombineIncompatibleCases,
  assertAiCannotInventInteraction,
  assertAiscInteractionEditionIsolation,
  assertOptimizationUsInteractionRecheck,
  assertUsInteractionLrfdAsdRuleIsolation,
  assertUsInteractionRuleAuthority,
  consumeDemandHandoff,
  createUsCombinedActionContext,
  denyAiUsClassification,
  denyAiUsConformanceClaim,
  denyAiUsInteractionCoefficient,
  denyAiUsInteractionEquation,
  denyAiUsInteractionFactor,
  denyAiUsInteractionResult,
  denyAiUsMixedCombinations,
  denyAiUsMixedDesignMethods,
  denyAiUsMomentAmplification,
  denyAiUsInteractionStabilityChoice,
  detectRequiredInteractions,
  evaluateSteelCapacity,
  evaluateUsSteelCombinedAction,
  evaluateUsSteelCombinedActionCodeProfile,
  orchestrateUsCombinedActionDesignCheck,
  requestUsBiaxialLinearInteraction,
  requestUsConnectionInteraction,
  requestUsInteractionAsdFactor,
  requestUsInteractionClassification,
  requestUsInteractionEquation,
  requestUsInteractionLrfdFactor,
  requestUsInteractionParameter,
  requestUsMomentAmplification,
  requestUsSeismicInteraction,
  requestUsShearReduction,
  requestUsTorsionalInteraction,
  requestUsUniversalInteractionEquation,
  usCombinedCodeProfileCheckState,
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
    contextId: "ctx-us-combined",
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-us6",
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
    projectStandardContextRef: "proj-us6",
    calculationContextRef: "calc-us6",
    engineeringRuleAuthorityRefs: ["VALIDATED_ENGINEERING_REFERENCE"],
    projectOverride: null,
    sourcePrecedence: ["MANDATORY_ADOPTED_CODE", "REFERENCED_STANDARD"],
    intendedStandardProfile: "AISC360",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: "us6:combined",
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
    directContractProfile: false,
    ...overrides,
  };
}

function usStandard(id = "ctx-aisc-us6"): StructuralStandardContext {
  return createConfiguredKnowledgeContext({
    contextId: id,
    jurisdictionProfileRef: "united-states",
    standardFamily: "AISC",
    standardCode: "AISC 360",
    edition: AISC_UNKNOWN_EDITION_TOKEN,
    materialScope: "steel",
  });
}

function usStability(overrides: Partial<UsStabilityAnalysisContext> = {}): UsStabilityAnalysisContext {
  return {
    method: "EFFECTIVE_LENGTH_BASED",
    secondOrder: "FIRST_ORDER",
    mixedMethods: false,
    ...overrides,
  };
}

function demand(context: StructuralStandardContext, patch: Partial<SteelCapacityEngineInput["demand"]> = {}): SteelCapacityEngineInput["demand"] {
  return {
    resultId: "demand-us6",
    memberId: "m-us6",
    shear: { value: 0, unit: "N", locationM: 2, signed: 0 },
    moment: { value: 100_000, unit: "N.m", locationM: 4, signed: 100_000 },
    axial: { valueN: 400_000, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "D1C demand handoff; not recalculated in US combined action" },
    capacityPresent: false,
    standardContext: context,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c", sourceKind: "calculation", reference: "d1c-combined" }],
    combinationId: "comb-us6",
    ...patch,
  };
}

function material(): SteelMaterialDesignProperties {
  return {
    materialRef: "mat-us6",
    grade: "A992",
    yieldStrength: { name: "Fy", value: 345, unit: "MPa", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    ultimateStrength: { name: "Fu", value: 450, unit: "MPa", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    elasticModulus: { name: "E", value: 200, unit: "GPa", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    shearModulus: { name: "G", value: 80, unit: "GPa", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    poissonRatio: { name: "nu", value: 0.3, unit: "1", provenanceRef: "astm-mill", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    density: null,
    thicknessDependentMetadata: null,
    jurisdictionApplicability: ["united-states"],
  };
}

function section(): SteelSectionDesignProperties {
  return {
    sectionRef: "sec-us6",
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
    netArea: { name: "An", value: 4500, unit: "mm2", provenanceRef: "engineer-net-area", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    shearArea: { name: "Aw", value: 5_000, unit: "mm2", provenanceRef: "engineer-shear-area", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    webDepth: { name: "h", value: 300, unit: "mm", provenanceRef: "engineer-web-geometry", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    webThickness: { name: "tw", value: 8, unit: "mm", provenanceRef: "engineer-web-geometry", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    geometricDimensions: {},
  };
}

function stability(): SteelStabilityContext {
  return {
    stabilityContextId: "stab-us6",
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
    designContextId: "dc-us6",
    memberRef: "m-us6",
    sectionRef: "sec-us6",
    materialRef: "mat-us6",
    demandRefs: ["demand-us6"],
    standardContextRef: context.contextId,
    parameterSetRef: null,
    effectiveLengthContextRef: "stab-us6",
    restraintContextRef: "stab-us6",
    stabilityContextRef: "stab-us6",
    fabricationContextRef: null,
    evidenceRefs: [{ evidenceId: "ev-eng", sourceKind: "human_input", reference: "engineer" }],
    toolRef: "EOS_US_STEEL_COMBINED_ACTION",
    methodRef: "US_COMBINED",
    provenanceRef: governedProvenance({ jurisdiction: "united-states", standard: "AISC 360", calculationMethod: "US_COMBINED" }),
    validationState: "FRAMEWORK_ONLY",
    reviewState: "required",
  };
}

function extraDemand(kind: SteelCombinedDemandComponent["kind"], value: number, unit: string, signed = value): SteelCombinedDemandComponent {
  return {
    resultId: `demand-us6-${kind.toLowerCase()}`,
    memberId: "m-us6",
    combinationId: "comb-us6",
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
    capacityResultId: `cap-us6-${kind.toLowerCase()}`,
    methodId: `US_${kind}_REFERENCE`,
    memberId: "m-us6",
    combinationId: "comb-us6",
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
    combinationRef: "comb-us6",
    componentDemands: [],
    componentCapacities: [],
    ...patch,
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
    limitState: "COMBINED_ACTION",
    requiredProperties: [],
    usSteelContext: usSteel(),
    usStabilityContext: usStability(),
    combined: combined(),
    ...patch,
  };
}

describe("EOS-D1D-US-6 US steel combined actions", () => {
  it("reviews AU/EU interaction architecture and keeps AISC interaction unguessed", () => {
    expect(EOS_D1D_US6_PHASE).toBe("EOS-D1D-US-6");
    expect(COMMON_STEEL_FRAMEWORK_REUSED).toBe(true);
    expect(US_STANDARD_BINDING_REUSED).toBe(true);
    expect(US_AU_INTERACTION_ARCHITECTURE_REVIEWED).toBe(true);
    expect(US_EU_INTERACTION_ARCHITECTURE_REVIEWED).toBe(true);
    expect(COMMON_INTERACTION_ARCHITECTURE_REUSED_WHERE_VALID).toBe(true);
    expect(AU_CODE_RULES_REUSED_AS_US_RULES).toBe(false);
    expect(EU_CODE_RULES_REUSED_AS_US_RULES).toBe(false);
    expect(PARALLEL_US_INTERACTION_FRAMEWORK_CREATED).toBe(false);
    expect(AU_EU_INTERACTION_ARCHITECTURE_REVIEW.some((row) => row.classification === "JURISDICTION_NEUTRAL_REUSABLE")).toBe(true);
    expect(AU_EU_INTERACTION_ARCHITECTURE_REVIEW.some((row) => row.classification === "JURISDICTION_SPECIFIC")).toBe(true);
    expect(IMPLEMENTED_US_INTERACTION_METHODS).toEqual([]);
    expect(FRAMEWORK_ONLY_US_INTERACTION_METHODS).toHaveLength(8);
    expect(FRAMEWORK_ONLY_US_INTERACTION_METHODS).toEqual(expect.arrayContaining([
      "US_INTERACTION_TENSION_BENDING",
      "US_INTERACTION_TENSION_BIAXIAL_BENDING",
      "US_INTERACTION_COMPRESSION_BENDING",
      "US_INTERACTION_COMPRESSION_BIAXIAL_BENDING",
      "US_INTERACTION_BIAXIAL_BENDING",
      "US_INTERACTION_AXIAL_BIAXIAL_BENDING",
      "US_INTERACTION_BENDING_SHEAR",
      "US_INTERACTION_AXIAL_SHEAR",
    ]));
    expect(US_INTERACTION_METHOD_REGISTRY).toHaveLength(8);
    expect(US_INTERACTION_METHOD_REGISTRY.every((rule) => rule.applicability.length > 0)).toBe(true);
    expect(US_INTERACTION_METHOD_REGISTRY.every((rule) => rule.aiscEditionRequirement === AISC_UNKNOWN_EDITION_TOKEN)).toBe(true);
    expect(SILENT_AISC_EDITION_INFERENCE).toBe(false);
    expect(DEFAULT_LRFD_OR_ASD).toBe(false);
    expect(SILENT_LRFD_ASD_CONVERSION).toBe(false);
    expect(MIXED_LRFD_ASD_COMPONENTS_ALLOWED).toBe(false);
    expect(UNIVERSAL_INTERACTION_EQUATION).toBe(false);
    expect(UNIVERSAL_US_INTERACTION_EQUATION).toBe(false);
    expect(UNIVERSAL_AXIAL_BIAXIAL_EQUATION).toBe(false);
    expect(BIAXIAL_LINEAR_INTERACTION_ASSUMED).toBe(false);
    expect(UNKNOWN_US_INTERACTION_RELATIONSHIP_GUESSED).toBe(false);
    expect(US_INTERACTION_PARAMETER_GUESSED).toBe(false);
    expect(US_INTERACTION_CLASSIFICATION_GUESSED).toBe(false);
    expect(US_INTERACTION_MOMENT_AMPLIFICATION_GUESSED).toBe(false);
    expect(US_BENDING_SHEAR_REDUCTION_RULE_GUESSED).toBe(false);
    expect(UNKNOWN_US_INTERACTION_PARAMETER_GUESSED).toBe(false);
    expect(US_SYNTHETIC_INTERACTION_UTILIZATION).toBe(false);
    expect(MECHANICS_REFERENCE_AUTOMATICALLY_VALID_FOR_AISC_INTERACTION).toBe(false);
    expect(COMPONENT_VECTOR_EQUALS_INTERACTION_CHECK).toBe(false);
    expect(US_INTERACTION_INDEPENDENT_BENCHMARKS).toBe("NOT_APPLICABLE");
    expect(US_INTERACTION_INDEPENDENT_BENCHMARK_STATE).toBe("NOT_APPLICABLE");
    expect(COMPONENT_BENCHMARK_EQUALS_AISC_INTERACTION_CONFORMANCE).toBe(false);
    expect(BENCHMARK_EQUALS_AISC_CONFORMANCE).toBe(false);
    expect(() => requestUsUniversalInteractionEquation()).toThrow(/unknown required code parameter/);
    expect(() => requestUsBiaxialLinearInteraction()).toThrow(/unknown required code parameter/);
    expect(() => requestUsShearReduction()).toThrow(/unknown required code parameter/);
    expect(() => requestUsInteractionClassification()).toThrow(/unknown required code parameter/);
    expect(() => requestUsInteractionParameter()).toThrow(/unknown required code parameter/);
    expect(() => requestUsMomentAmplification()).toThrow(/unknown required code parameter/);
    expect(() => requestUsInteractionLrfdFactor()).toThrow(/phi/);
    expect(() => requestUsInteractionAsdFactor()).toThrow(/Omega/);
    expect(() => requestUsTorsionalInteraction()).toThrow(/unknown required code parameter/);
    expect(() => requestUsConnectionInteraction()).toThrow(/unknown required code parameter/);
    expect(() => requestUsSeismicInteraction()).toThrow(/unknown required code parameter/);
    expect(() => requestUsInteractionEquation()).toThrow(/unknown required code parameter/);
    expect(() => assertUsInteractionRuleAuthority("LLM_MEMORY_ONLY")).toThrow(/LLM_MEMORY_ONLY/);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(() => assertUsInteractionLrfdAsdRuleIsolation("LRFD", "Omega")).toThrow(/ASD interaction factor/);
    expect(() => assertUsInteractionLrfdAsdRuleIsolation("ASD", "phi")).toThrow(/LRFD interaction factor/);
  });

  it("reuses D1C combined demands, detects interaction, and never treats the component vector as the check", () => {
    const context = usStandard();
    expect(consumeDemandHandoff(demand(context))).toBe("demand-us6");
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
    expect(tension.combinedResults?.[0]?.designMethod).toBe("LRFD");
    const ctx = createUsCombinedActionContext(capacityInput(), ["TENSION_BENDING"]);
    expect(ctx.axialDemandRef).toBe("demand-us6");
    expect(ctx.majorMomentDemandRef).toBe("demand-us6");
    expect(ctx.designMethod).toBe("LRFD");
    expect(ctx.elementClassificationRefs).toEqual(["VALIDATION_REQUIRED"]);

    const asd = evaluateSteelCapacity(capacityInput({ usSteelContext: usSteel({ designMethod: "ASD" }) }));
    expect(asd.combinedResults?.[0]?.designMethod).toBe("ASD");

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
    expect(axialBiaxial.governingMethodId).toBe("US_INTERACTION_TENSION_BENDING-V1");

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

  it("fails closed for combination, revision, mixed methods, authority, classification, and stability defects", () => {
    const context = usStandard();
    expect(() => evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({ designMethod: null }),
    }))).toThrow(/DESIGN_METHOD_REQUIRED/);
    expect(() => evaluateUsSteelCombinedAction(capacityInput({ usSteelContext: undefined }))).toThrow(/missing AISC context/);
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
          extraCapacity("TENSION", 1_542_000, "N", context.contextId, { designMethod: "LRFD" }),
          extraCapacity("BENDING_MAJOR", 300_000, "N.m", context.contextId, { designMethod: "ASD" }),
        ],
      }),
    }))).toThrow(/mixed LRFD\/ASD/);
    expect(() => evaluateSteelCapacity(capacityInput({
      combined: combined({
        componentCapacities: [
          extraCapacity("TENSION", 1_542_000, "N", context.contextId, {
            resultClass: "DESIGN_CAPACITY",
            authorityState: "MECHANICS_REFERENCE",
          }),
        ],
      }),
    }))).toThrow(/mechanics-reference capacity must not be treated as AISC interaction resistance/);

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

    const missingStability = evaluateSteelCapacity(capacityInput({
      demand: demand(context, { axial: { valueN: -400_000, unit: "N", method: "AXIAL_DIRECT" } }),
      stability: null,
      usStabilityContext: usStability({ method: "UNKNOWN" }),
      designContext: { ...designContext(context), stabilityContextRef: null },
    }));
    expect(missingStability.combinedResults?.[0]?.interactionType).toBe("COMPRESSION_BENDING");
    expect(missingStability.combinedResults?.[0]?.reason).toBe("MISSING_STABILITY");

    const missingLtb = evaluateSteelCapacity(capacityInput({
      stability: { ...stability(), unbracedLengthM: null, unbracedLengthProvenanceRef: null },
    }));
    expect(missingLtb.combinedResults?.[0]?.reason).toBe("MISSING_LTB");

    expect(() => evaluateSteelCapacity(capacityInput({
      usStabilityContext: usStability({ mixedMethods: true }),
    }))).toThrow(/stability-analysis methods cannot mix/);
    expect(() => evaluateSteelCapacity(capacityInput({
      designContext: { ...designContext(context), validationState: "CERTIFIED" },
    }))).toThrow(/unvalidated method requested as certified/);
    expect(() => evaluateUsSteelCombinedActionCodeProfile(capacityInput())).toThrow(/unknown required code parameter/);
    expect(usCombinedCodeProfileCheckState(capacityInput())).toBe("CHECK_UNDETERMINED");
    expect(() => evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({ localAmendmentSetRef: "UNKNOWN_REQUIRED" }),
    }))).toThrow(/local amendment/);
    expect(() => evaluateSteelCapacity(capacityInput({
      section: { ...section(), catalogSource: "AUST300" },
    }))).toThrow(/AUST300|US default/);
  });

  it("does not treat CHECK_UNDETERMINED as approval, optimizer pass, or AI authority", () => {
    const outcome = orchestrateUsCombinedActionDesignCheck({
      designCheckId: "chk-us6",
      designContext: designContext(usStandard()),
      capacityInput: capacityInput(),
    });
    expect(outcome.verdict).toBe("CHECK_UNDETERMINED");
    expect(outcome.engineeringApproved).toBe(false);
    expect(outcome.designCheck.approvalState).toBe("not_approved");
    expect(outcome.humanReviewRequired).toBe(true);
    expect(CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(AUTOMATIC_ENGINEERING_APPROVAL).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(US_OPTIMIZATION_INTERACTION_RECHECK_REQUIRED).toBe(true);
    expect(US_OPTIMIZATION_ACCEPTS_UNDETERMINED_INTERACTION).toBe(false);
    expect(() => assertOptimizationUsInteractionRecheck({
      candidateSectionRef: "W12x50",
      proposedBy: "OPTIMIZER",
      deterministicRecheckRequired: true,
      rechecked: true,
      interactionCheckState: "CHECK_UNDETERMINED",
    })).toThrow(/undetermined interaction as pass/);
    expect(() => assertAiCannotInventInteraction("N/Nc + Mx/Mcx + My/Mcy <= 1", "AI")).toThrow(/AI cannot invent interaction equation/);
    expect(() => assertAiCannotCombineIncompatibleCases("AI", false)).toThrow(/AI cannot combine incompatible load cases/);
    expect(() => denyAiUsInteractionEquation()).toThrow(/cannot invent an interaction equation/);
    expect(() => denyAiUsInteractionCoefficient()).toThrow(/cannot invent an interaction coefficient/);
    expect(() => denyAiUsMomentAmplification()).toThrow(/amplify moment/);
    expect(() => denyAiUsInteractionStabilityChoice()).toThrow(/stability method/);
    expect(() => denyAiUsClassification()).toThrow(/classification/);
    expect(() => denyAiUsInteractionFactor()).toThrow(/interaction factor/);
    expect(() => denyAiUsMixedCombinations()).toThrow(/mix load combinations/);
    expect(() => denyAiUsMixedDesignMethods()).toThrow(/mix design methods/);
    expect(() => denyAiUsInteractionResult()).toThrow(/originate AISC interaction/);
    expect(() => denyAiUsConformanceClaim()).toThrow(/compliance|conformance/i);
    expect(LLM_US_INTERACTION_AUTHORITY).toBe(false);
    expect(AI_INTERACTION_PARAMETER_AUTHORITY).toBe(false);
    expect(AI_STABILITY_METHOD_AUTHORITY).toBe(false);
    expect(AI_CLASSIFICATION_AUTHORITY).toBe(false);
    expect(AI_FACTOR_AUTHORITY).toBe(false);
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_US_INTERACTION_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(US_TORSIONAL_INTERACTION_IMPLEMENTED).toBe(false);
    expect(US_CONNECTION_INTERACTION_IMPLEMENTED).toBe(false);
    expect(US_SEISMIC_INTERACTION_IMPLEMENTED).toBe(false);
    expect(US_BENDING_SHEAR_INTERACTION_IMPLEMENTED).toBe(false);
    expect(US_MEMBER_INTERACTION_EQUALS_GLOBAL_FRAME_VALIDATION).toBe(false);
    expect(GENERAL_FEA_CAPABILITY_CLAIMED).toBe(false);
    expect(US_INTERACTION_HUMAN_VALIDATION_REQUIRED).toBe(true);
  });

  it("isolates multi-jurisdiction, direct-contract, LRFD/ASD units, and keeps AU/EU/global core honest", () => {
    const ca = evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({ buildingCodeAdoptionRef: "ca", buildingCodeAdoption: adoption({ adoptionId: "ca" }) }),
    }));
    const tx = evaluateSteelCapacity(capacityInput({
      usSteelContext: usSteel({
        buildingCodeAdoptionRef: "tx",
        buildingCodeAdoption: adoption({ adoptionId: "tx", jurisdiction: "texas" }),
      }),
    }));
    expect(ca.combinedResults?.[0]?.checkState).toBe("CHECK_UNDETERMINED");
    expect(tx.combinedResults?.[0]?.checkState).toBe("CHECK_UNDETERMINED");
    expect(ca.combinedResults?.[0]?.buildingCodeContextRef).toBe("ca");
    expect(tx.combinedResults?.[0]?.buildingCodeContextRef).toBe("tx");

    const international = evaluateSteelCapacity(capacityInput({
      standardContext: createConfiguredKnowledgeContext({
        contextId: "ctx-aisc-other-us6",
        jurisdictionProfileRef: "other",
        standardFamily: "AISC",
        standardCode: "AISC 360",
        edition: AISC_UNKNOWN_EDITION_TOKEN,
        materialScope: "steel",
      }),
      designContext: { ...designContext(usStandard("ctx-aisc-other-us6")), standardContextRef: "ctx-aisc-other-us6" },
      demand: demand(usStandard("ctx-aisc-other-us6")),
      usSteelContext: usSteel({
        jurisdictionProfileRef: "other",
        directContractProfile: true,
        buildingCodeAdoption: null,
        buildingCodeAdoptionRef: null,
      }),
    }));
    expect(international.implemented).toBe(true);
    expect(international.combinedResults?.[0]?.directContractProfile).toBe(true);
    expect(international.combinedResults?.[0]?.buildingCodeContextRef).toBeNull();
    expect(DIRECT_CONTRACT_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE).toBe(false);

    for (const designMethod of ["LRFD", "ASD"] as const) {
      for (const unitSystem of ["US_CUSTOMARY", "SI"] as const) {
        const result = evaluateSteelCapacity(capacityInput({
          usSteelContext: usSteel({ designMethod, unitSystem }),
        }));
        expect(result.combinedResults?.[0]?.designMethod).toBe(designMethod);
        expect(result.combinedResults?.[0]?.unitSystem).toBe(unitSystem);
        expect(result.combinedResults?.[0]?.checkState).toBe("CHECK_UNDETERMINED");
      }
    }

    expect(() => assertAiscInteractionEditionIsolation("2010", "2016")).toThrow(/STANDARD_VERSION_CONFLICT/);
    expect(detectRequiredInteractions(capacityInput())).toEqual(["TENSION_BENDING"]);

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
    expect(IMPLEMENTED_US_SHEAR_METHODS).toEqual([
      "US_SHEAR_ELASTIC_MAJOR_MECHANICS",
      "US_SHEAR_ELASTIC_MINOR_MECHANICS",
      "US_SHEAR_ELASTIC_BUCKLING_MECHANICS",
    ]);
    expect(AU_METHOD_VALIDATION_INVENTORY).toHaveLength(18);
    expect(AU_STEEL_VALIDATION_MATRIX).toHaveLength(11);
    expect(EU_METHOD_VALIDATION_INVENTORY.length).toBeGreaterThan(20);
    expect(EU_STEEL_VALIDATION_MATRIX).toHaveLength(13);
    expect(IMPLEMENTED_INTERACTION_METHODS).toEqual([]);
    expect(IMPLEMENTED_EU_INTERACTION_METHODS).toEqual([]);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL).toEqual({ ready: true, implemented: false, standards: ["AISC 360"], loadContext: ["ASCE 7"] });
    expect(US_STEEL_IMPLEMENTATION_SUBPHASES[5]).toMatch(/US-6 combined/);
    expect(US_STEEL_PACK_CERTIFIED).toBe(false);
    expect(US_STEEL_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_BOUNDED_METHODS");
    expect(SCHEMA_CHANGE_REQUIRED_FOR_US6).toBe(false);
    expect(EU_ONLY_STEEL_CORE).toBe(false);
    expect(US6_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK).toBe(true);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(STRUCTURAL_STANDARD_TEXT_EMBEDDED).toBe(false);
    expect(D1D_US6_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(D1D_US6_D0_RISK_DISPOSITION.REDUCED).toEqual(["D0-R01"]);
    expect(D1D_US6_D0_RISK_DISPOSITION.REMAINING).toEqual(["D0-R01", "D0-R04", "D0-R05", "D0-R07", "D0-R08", "D0-R10", "D0-R11", "D0-R12"]);
    const usSrc = ["evaluate.ts", "registry.ts", "authority.ts"].map((name) => readFileSync(join(here, "us-combined", name), "utf8")).join("\n");
    expect(usSrc).not.toMatch(/AU_INTERACTION_TENSION|AS 4100|phiVv|γM1|kyy|National Annex|NDP/);
    const mechanicsSrc = readFileSync(join(here, "mechanics", "interaction.ts"), "utf8");
    expect(mechanicsSrc).not.toMatch(/AISC H1|phi_c\s*=|Omega_b\s*=|Cm\s*=/);
    const adapterSrc = readFileSync(join(here, "adapters.ts"), "utf8");
    expect(adapterSrc).not.toMatch(/N\/Nc \+ Mx\/Mcx|interactionValue\s*=\s*[0-9]/);
    const globalCore = readFileSync(join(here, "properties.ts"), "utf8");
    expect(globalCore).not.toMatch(/US_INTERACTION_|N\/Nc \+ M\/Mc/);
  });
});
