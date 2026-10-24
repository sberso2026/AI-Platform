import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_ENGINEERING_APPROVAL,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AISC_CONFORMANCE_EQUALS_PROJECT_APPROVAL,
  AISC_DESIGN_EQUALS_BUILDING_CODE_COMPLIANCE,
  AISC_MEMBER_CHECK_EQUALS_BUILDING_CODE_COMPLIANCE,
  AISC_NOT_HARDCODED_TO_US_GEOGRAPHY,
  AISC_UNKNOWN_EDITION_TOKEN,
  ANALYSIS_SCOPE_TRUTHFUL,
  BENCHMARK_EQUALS_AISC_CONFORMANCE,
  BUILDING_CODE_AND_STEEL_STANDARD_SEPARATE,
  BUILDING_CODE_COMPLIANCE_EQUALS_PROJECT_APPROVAL,
  COMMON_MECHANICS_EQUALS_COMMON_CODE_AUTHORITY,
  COPYRIGHTED_STANDARD_TEXT_COMMITTED,
  D1C_DEMAND_ENGINE_REUSED,
  D1C_EQUALS_COMPLETE_US_STABILITY_ANALYSIS,
  DEFAULT_K_FACTOR,
  DEFAULT_LRFD_OR_ASD,
  DEFAULT_US_DEFLECTION_LIMIT_GUESSED,
  DESIGN_METHOD_AND_UNIT_SYSTEM_SEPARATE,
  DIRECT_CONTRACT_AISC_EQUALS_BUILDING_CODE_COMPLIANCE,
  ELASTIC_BENDING_EQUALS_AISC_FLEXURAL_STRENGTH,
  ELASTIC_LTB_EQUALS_AISC_FLEXURAL_STRENGTH,
  ELASTIC_SHEAR_BUCKLING_EQUALS_AISC_WEB_STRENGTH,
  ELASTIC_SHEAR_EQUALS_AISC_SHEAR_STRENGTH,
  EMPLOYEE_BEHAVIOR_PROFILING,
  EOS_D1D_US8_PHASE,
  EU_ONLY_STEEL_CORE,
  EU_STEEL_IMPLEMENTATION_MATURITY,
  EU_STEEL_PACK_CERTIFIED,
  EULER_REFERENCE_EQUALS_AISC_MEMBER_STRENGTH,
  FORBIDDEN_ENGINEERING_RULE_AUTHORITIES,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  GENERAL_US_MEMBER_CODE_DESIGN_VALIDATED,
  GLOBAL_MECHANICS_JURISDICTION_NEUTRAL,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  LOCAL_AMENDMENT_VALUE_GUESSED,
  MEMBER_VALIDATION_IMPLIES_CONNECTION_VALIDATION,
  MEMBER_VALIDATION_IMPLIES_FOUNDATION_VALIDATION,
  MEMBER_VALIDATION_IMPLIES_GLOBAL_FRAME_VALIDATION,
  MIXED_LRFD_ASD_DESIGN_AUTHORITY_ALLOWED,
  NEW_MAJOR_DESIGN_METHOD_IMPLEMENTED,
  NUMERICAL_US_INTERACTION_METHODS_AFTER_US8,
  NUMERICAL_VALIDATION_EQUALS_PROJECT_APPROVAL,
  PACK_CERTIFICATION_NOT_OVERSTATED,
  PARALLEL_US_LOAD_COMBINATION_ENGINE,
  SCHEMA_CHANGE_REQUIRED_FOR_US8,
  SELF_REFERENTIAL_BENCHMARKS,
  SILENT_AISC_EDITION_INFERENCE,
  SILENT_ASCE_EDITION_INFERENCE,
  SILENT_LOAD_STANDARD_EDITION_INFERENCE,
  SILENT_LRFD_ASD_CONVERSION,
  SILENT_STANDARD_IDENTITY_INFERENCE,
  SOFTWARE_CERTIFICATION_EQUALS_PROJECT_APPROVAL,
  STANDARD_TEXT_REQUIRED_BY_RUNTIME,
  STRUCTURAL_STANDARD_TEXT_EMBEDDED,
  SUPPORT_LABEL_AUTOMATICALLY_DEFINES_K_FACTOR,
  THREE_JURISDICTION_ARCHITECTURE_VALIDATED,
  US8_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK,
  US_BUILDING_CODE_COMPLIANCE_EVIDENCE_REQUIRED,
  US_CB_FACTOR_GUESSED,
  US_CODE_PROFILE_INFERRED_FROM_USER_LOCATION,
  US_CONFORMANCE_EVIDENCE_REQUIRED,
  US_CONNECTION_DESIGN_VALIDATED,
  US_ELEMENT_CLASSIFICATION_LIMIT_GUESSED,
  US_ENGINEER_METHOD_CONFIRMATION_MODEL,
  US_JURISDICTION_AND_STANDARD_SEPARATE,
  US_LOCAL_BUCKLING_RULE_GUESSED,
  US_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  US_SEISMIC_STEEL_DESIGN_VALIDATED,
  US_STEEL_IMPLEMENTATION_MATURITY,
  US_STEEL_PACK_CERTIFIED,
  US_STEEL_PRODUCT_CLAIM_LEVEL,
  US_STEEL_RELEASE_CLASSIFICATION,
  US_STEEL_RESULT_WARNING_MODEL,
  US_STEEL_STANDARD_CONFORMANCE_STATE,
  US_THIRD_PARTY_VALIDATION_AVAILABLE,
  US_VALIDATION_DIMENSIONS_SEPARATE,
  type BuildingCodeAdoptionContext,
  type SteelCapacityEngineInput,
  type SteelCombinedCapacityComponent,
  type SteelDesignContext,
  type SteelMaterialDesignProperties,
  type SteelSectionDesignProperties,
  type SteelStabilityContext,
  type StructuralStandardContext,
  type USSteelDesignContext,
  type USSteelServiceabilityContext,
  type UsLocalAmendment,
  type UsProjectStandardContext,
  type UsStabilityAnalysisContext,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import {
  AU_METHOD_VALIDATION_INVENTORY,
  AU_STEEL_VALIDATION_MATRIX,
  AU_TENSION_BENCHMARKS,
  COMMON_MECHANICS_AUDIT,
  D1D_US8_D0_RISK_DISPOSITION,
  EU_CODE_PROFILE_METHOD_COUNT,
  EU_METHOD_VALIDATION_INVENTORY,
  EU_STEEL_VALIDATION_MATRIX,
  EU_TENSION_BENCHMARKS,
  IMPLEMENTED_EU_INTERACTION_METHODS,
  IMPLEMENTED_INTERACTION_METHODS,
  IMPLEMENTED_US_INTERACTION_METHODS,
  STEEL_ADAPTER_BOUNDARIES,
  THREE_JURISDICTION_COMMON_MECHANICS_CONSISTENCY,
  THREE_JURISDICTION_STEEL_ARCHITECTURE_AUDIT,
  US_AI_AUTHORITY_AUDIT,
  US_BENCHMARK_AUDIT_BY_METHOD,
  US_BENCHMARK_AUDIT_RESULT,
  US_BENDING_VALIDATION_STATE,
  US_BOUNDED_SUPPORTED_SCOPE,
  US_BUILDING_CODE_ADOPTION_AUDIT,
  US_BUILDING_CODE_COMPLIANCE_SEPARATION_AUDIT,
  US_CODE_PROFILE_IMPLEMENTED_COUNT,
  US_CODE_PROFILE_METHOD_COUNT,
  US_CODE_PROFILE_VALIDATED_COUNT,
  US_COMMON_MECHANICS_AUDIT,
  US_COMPRESSION_VALIDATION_STATE,
  US_DIRECT_CONTRACT_COMPLIANCE_BOUNDARY_AUDIT,
  US_DIRECT_CONTRACT_PROFILE_AUDIT,
  US_FAIL_CLOSED_AUDIT,
  US_FOUR_LAYER_RESULT_MODEL_AUDIT,
  US_HUMAN_OVERSIGHT_AUDIT,
  US_INTERACTION_GAP_FAILS_CLOSED,
  US_JURISDICTION_STANDARD_SEPARATION_AUDIT,
  US_LOAD_STANDARD_DEPENDENCY_AUDIT,
  US_LOCAL_AMENDMENT_AUDIT,
  US_LRFD_ASD_GOVERNANCE_AUDIT,
  US_LRFD_ASD_UNIT_INDEPENDENCE_AUDIT,
  US_MEMBER_ORCHESTRATOR_VALIDATION,
  US_METHOD_VALIDATION_INVENTORY,
  US_MULTI_JURISDICTION_GOVERNANCE_AUDIT,
  US_NUMERICAL_METHOD_IDS,
  US_SERVICEABILITY_ORCHESTRATION_VALIDATED,
  US_SHEAR_VALIDATION_STATE,
  US_STABILITY_GOVERNANCE_AUDIT,
  US_STALE_RESULT_INVALIDATION_VALIDATED,
  US_STANDARD_CONTEXT_TENANCY_AUDIT,
  US_STANDARD_ECOSYSTEM_AUDIT,
  US_STANDARD_VERSION_AUDIT,
  US_STEEL_IMPLEMENTATION_SUBPHASES,
  US_STEEL_RESULT_WARNINGS,
  US_STEEL_VALIDATION_MATRIX,
  US_TENSION_VALIDATION_STATE,
  US_THIRD_PARTY_VALIDATION_RECORDS,
  US_THIRD_PARTY_VALIDATION_STATE,
  US_VALIDATION_DEBT_REGISTER,
  US_VALIDATION_PRIORITY_PLAN,
  allUsNumericalBenchmarks,
  applyUsMethodEngineeringConfirmation,
  assertAiCannotApproveUsMember,
  assertAiCannotCertifyUsConformance,
  assertAiCannotChooseUsDesignMethod,
  assertAiCannotInventUsServiceabilityCriterion,
  assertAiCannotPromoteUsMethodMaturity,
  assertAiscConformanceNotValidatedWithoutEvidence,
  assertAiscMemberEditionIsolation,
  assertAmendmentCompatibleWithAdoption,
  assertBuildingCodeAndSteelStandardSeparate,
  assertCandidateFullUsMemberRecheck,
  assertJurisdictionAndStandardSeparate,
  assertLrfdAsdFactorIsolation,
  assertMechanicsNotClassifiedAsAiscStrength,
  assertMultiJurisdictionUsContexts,
  assertNoDefaultKFactor,
  assertNoNumericalUsInteractionMethodsAfterUs8,
  assertUsApprovalRemainsSeparate,
  assertUsPackCertificationNotOverstated,
  assertUsRuleAuthority,
  assertUsStandardGovernanceAudits,
  assertUsTenantWorkspaceIsolation,
  assertUsThirdPartyValidationModel,
  auditUsBenchmarkRecord,
  denyAiAiscEditionChoice,
  denyAiLocalAmendment,
  denyAiLrfdAsdChoice,
  denyAiUsBendingClassification,
  denyAiUsBuildingCodeCompliance,
  denyAiUsCbFactor,
  denyAiUsConformanceClaim,
  denyAiUsDesignMethodSelection,
  denyAiUsElementClassification,
  denyAiUsInteractionEquation,
  denyAiUsKFactor,
  denyAiUsMechanicsToAiscPromotion,
  denyAiUsServiceabilityCriterion,
  denyAiUsStabilityMethod,
  denyCodeProfileFromUserLocation,
  deriveUsSteelProductClaim,
  deriveUsSteelReleaseClassification,
  elasticLtbMomentNm,
  eulerLoadN,
  evaluateUsSteelServiceability,
  firstYieldMomentNm,
  historicalUsContextRemainsReproducible,
  INTERNATIONAL_AISC_PROFILE_AUDIT,
  invalidationTags,
  nominalTensionForceN,
  orchestrateAuSteelMemberDesign,
  orchestrateEuSteelMemberDesign,
  orchestrateUsSteelMemberDesign,
  requestUsDefaultDeflectionLimit,
  scoreAllIndependentUsBenchmarks,
  snapshotIssuedUsContext,
  unknownEditionBlocksUsConformance,
  vonMisesShearYieldN,
  elasticShearBucklingForceN,
  warningsForUsSteelResult,
} from "./index";

const here = dirname(fileURLToPath(import.meta.url));

function readSteelTree(dir = here): string {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.map((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") return readSteelTree(path);
    if (entry.name.endsWith(".test.ts")) return "";
    if (entry.name.endsWith(".ts") || entry.name.endsWith(".md")) return readFileSync(path, "utf8");
    return "";
  }).join("\n");
}

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
    contextId: "ctx-us-member",
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-us8",
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
    projectStandardContextRef: "proj-us8",
    calculationContextRef: "calc-us8",
    engineeringRuleAuthorityRefs: ["VALIDATED_ENGINEERING_REFERENCE"],
    projectOverride: null,
    sourcePrecedence: ["MANDATORY_ADOPTED_CODE", "REFERENCED_STANDARD"],
    intendedStandardProfile: "AISC360",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: "us8:member",
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
    directContractProfile: false,
    ...overrides,
  };
}

function usStandard(id = "ctx-aisc-us8"): StructuralStandardContext {
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
    resultId: "demand-us8-uls",
    memberId: "m-us8",
    shear: { value: 0, unit: "N", locationM: 2, signed: 0 },
    moment: { value: 0, unit: "N.m", locationM: 4, signed: 0 },
    axial: { valueN: 1_000_000, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "ULS demand is not a serviceability demand" },
    capacityPresent: false,
    standardContext: context,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c", sourceKind: "calculation", reference: "d1c-uls" }],
    combinationId: "comb-uls",
    ...patch,
  };
}

function material(): SteelMaterialDesignProperties {
  return {
    materialRef: "mat-us8",
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
    sectionRef: "sec-us8",
    sectionFamily: "W",
    catalogSource: "ENGINEER_SUPPLIED",
    catalogVersion: null,
    jurisdictionApplicability: ["united-states"],
    area: { name: "Ag", value: 5140, unit: "mm2", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Iyy: { name: "Iyy", value: 222_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Izz: { name: "Izz", value: 23_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
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
    stabilityContextId: "stab-us8",
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
    designContextId: "dc-us8",
    memberRef: "m-us8",
    sectionRef: "sec-us8",
    materialRef: "mat-us8",
    demandRefs: ["demand-us8-uls"],
    standardContextRef: context.contextId,
    parameterSetRef: null,
    effectiveLengthContextRef: "stab-us8",
    restraintContextRef: "stab-us8",
    stabilityContextRef: "stab-us8",
    fabricationContextRef: null,
    evidenceRefs: [{ evidenceId: "ev-eng", sourceKind: "human_input", reference: "engineer" }],
    toolRef: "EOS_US_STEEL_MEMBER_DESIGN",
    methodRef: "US_MEMBER",
    provenanceRef: governedProvenance({ jurisdiction: "united-states", standard: "AISC 360", calculationMethod: "US_MEMBER" }),
    validationState: "FRAMEWORK_ONLY",
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
    requiredProperties: [],
    usSteelContext: usSteel(),
    usStabilityContext: usStability(),
    ...patch,
  };
}

function extraCapacity(kind: SteelCombinedCapacityComponent["kind"], designMethod: "LRFD" | "ASD"): SteelCombinedCapacityComponent {
  return {
    capacityResultId: `cap-us8-${kind}-${designMethod}`,
    methodId: `US_${kind}_REFERENCE`,
    memberId: "m-us8",
    combinationId: "comb-uls",
    kind,
    value: 1,
    unit: "N",
    standardProfileRef: "ctx-aisc-us8",
    maturity: "IMPLEMENTED",
    designMethod,
  };
}

function laterProject(overrides: Partial<UsProjectStandardContext> = {}): UsProjectStandardContext {
  return {
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-us8",
    jurisdictionProfileRef: "texas",
    buildingCodeFamily: "IBC",
    buildingCodeEdition: "2021",
    aiscEdition: "2022",
    designMethod: "ASD",
    unitSystem: "SI",
    asceEdition: "2022",
    seismicApplicable: false,
    seismicEdition: null,
    localAmendmentSetRef: "tx-1",
    directContractProfile: false,
    workspaceGlobalCodeProfileId: null,
    designBasisReference: null,
    ...overrides,
  };
}

function prop(name: string, value: number, unit: string) {
  return { name, value, unit, provenanceRef: "bm", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
}

describe("EOS-D1D-US-8 US steel validation and conformance gate", () => {
  it("inventories every US method with separate validation dimensions and independent benchmarks", () => {
    expect(EOS_D1D_US8_PHASE).toBe("EOS-D1D-US-8");
    expect(US_VALIDATION_DIMENSIONS_SEPARATE).toBe(true);
    expect(NEW_MAJOR_DESIGN_METHOD_IMPLEMENTED).toBe(false);
    expect(SCHEMA_CHANGE_REQUIRED_FOR_US8).toBe(false);
    const numerical = US_METHOD_VALIDATION_INVENTORY.filter((row) => row.numericalValidationState === "PASS");
    expect(numerical.map((row) => row.methodId).sort()).toEqual([...US_NUMERICAL_METHOD_IDS].sort());
    expect(US_NUMERICAL_METHOD_IDS).toEqual(expect.arrayContaining([
      "US_TENSION_GROSS_YIELD_MECHANICS",
      "US_TENSION_NET_FRACTURE_MECHANICS",
      "US_COMPRESSION_SQUASH_YIELD_MECHANICS",
      "US_COMPRESSION_EULER_MAJOR_MECHANICS",
      "US_COMPRESSION_EULER_MINOR_MECHANICS",
      "US_BENDING_ELASTIC_MAJOR_MECHANICS",
      "US_BENDING_ELASTIC_MINOR_MECHANICS",
      "US_BENDING_ELASTIC_LTB_MECHANICS",
      "US_SHEAR_ELASTIC_MAJOR_MECHANICS",
      "US_SHEAR_ELASTIC_MINOR_MECHANICS",
      "US_SHEAR_ELASTIC_BUCKLING_MECHANICS",
    ]));
    expect(US_NUMERICAL_METHOD_IDS).toHaveLength(11);
    expect(US_METHOD_VALIDATION_INVENTORY.map((row) => row.methodId)).toEqual(expect.arrayContaining([
      "US_SERVICEABILITY_ORCHESTRATION",
      "US_MEMBER_DESIGN_ORCHESTRATION",
    ]));
    for (const row of US_METHOD_VALIDATION_INVENTORY) {
      expect(row.aiscEditionRequirement).toBe(AISC_UNKNOWN_EDITION_TOKEN);
      expect(row.standardConformanceState).toBe("INTENDED_PROFILE");
      expect(row.engineeringValidationState).toBe("VALIDATION_REQUIRED");
      expect(row.humanReviewRequirement).toBe("required");
      expect(row.authorityType).toBeTruthy();
      expect(row.numericalValidationState).toBeTruthy();
      expect(row.classifications.length).toBeGreaterThan(0);
    }
    assertMechanicsNotClassifiedAsAiscStrength();
    expect(US_CODE_PROFILE_METHOD_COUNT).toBe(28);
    expect(US_CODE_PROFILE_IMPLEMENTED_COUNT).toBe(0);
    expect(US_CODE_PROFILE_VALIDATED_COUNT).toBe(0);
    const scored = scoreAllIndependentUsBenchmarks();
    expect(scored).toHaveLength(11);
    expect(scored.every((row) => row.evidenceRef.endsWith(":PASS"))).toBe(true);
    expect(allUsNumericalBenchmarks().every((row) => auditUsBenchmarkRecord(row) === "PARTIAL" || auditUsBenchmarkRecord(row) === "PASS")).toBe(true);
    expect(scored.every((row) => auditUsBenchmarkRecord(row) === "PASS")).toBe(true);
    expect(Object.values(US_BENCHMARK_AUDIT_BY_METHOD).every((state) => state === "PASS")).toBe(true);
    expect(US_BENCHMARK_AUDIT_RESULT).toBe("PASS");
    expect(SELF_REFERENTIAL_BENCHMARKS).toBe(false);
    expect(US_TENSION_VALIDATION_STATE).toMatch(/NUMERICALLY_VALIDATED_MECHANICS/);
    expect(US_COMPRESSION_VALIDATION_STATE).toMatch(/EULER_NOT_AISC/);
    expect(US_BENDING_VALIDATION_STATE).toMatch(/ELASTIC_LTB_NOT_AISC/);
    expect(US_SHEAR_VALIDATION_STATE).toMatch(/ELASTIC_SHEAR_NOT_AISC/);
  });

  it("does not promote mechanics, Euler, LTB, shear, or interaction gaps to AISC design", () => {
    expect(EULER_REFERENCE_EQUALS_AISC_MEMBER_STRENGTH).toBe(false);
    expect(ELASTIC_BENDING_EQUALS_AISC_FLEXURAL_STRENGTH).toBe(false);
    expect(ELASTIC_LTB_EQUALS_AISC_FLEXURAL_STRENGTH).toBe(false);
    expect(ELASTIC_SHEAR_EQUALS_AISC_SHEAR_STRENGTH).toBe(false);
    expect(ELASTIC_SHEAR_BUCKLING_EQUALS_AISC_WEB_STRENGTH).toBe(false);
    expect(BENCHMARK_EQUALS_AISC_CONFORMANCE).toBe(false);
    expect(US_CONFORMANCE_EVIDENCE_REQUIRED).toBe(true);
    expect(COMMON_MECHANICS_EQUALS_COMMON_CODE_AUTHORITY).toBe(false);
    assertNoNumericalUsInteractionMethodsAfterUs8();
    expect(IMPLEMENTED_US_INTERACTION_METHODS).toEqual([]);
    expect(NUMERICAL_US_INTERACTION_METHODS_AFTER_US8).toEqual([]);
    expect(GENERAL_US_MEMBER_CODE_DESIGN_VALIDATED).toBe(false);
    expect(US_MEMBER_ORCHESTRATOR_VALIDATION).toBe("PASS");
    expect(US_INTERACTION_GAP_FAILS_CLOSED).toBe(true);
    expect(US_FOUR_LAYER_RESULT_MODEL_AUDIT).toBe("PASS");

    const tension = orchestrateUsSteelMemberDesign({
      designRecordId: "rec-us8-t",
      createdAt: "2026-10-06T00:00:00.000Z",
      version: 1,
      capacityInput: capacityInput(),
    });
    expect(tension.mechanicsEvaluationState).toBe("COMPLETE_FOR_AVAILABLE_MECHANICS");
    expect(tension.codeDesignCheckState).toBe("CHECK_UNDETERMINED");
    expect(tension.buildingCodeComplianceState).toBe("COMPLIANCE_NOT_VALIDATED");
    expect(tension.aiscCompliantClaim).toBe(false);
    expect(tension.buildingCodeCompliantClaim).toBe(false);
    expect(tension.completenessMatrix.find((row) => row.checkKind === "TENSION")?.state).toBe("CHECK_UNDETERMINED");

    const multi = orchestrateUsSteelMemberDesign({
      designRecordId: "rec-us8-i",
      createdAt: "2026-10-06T00:00:00.000Z",
      version: 1,
      capacityInput: capacityInput({
        demand: demand(usStandard(), { moment: { value: 100_000, unit: "N.m", locationM: 4, signed: 100_000 } }),
        stability: stability(),
      }),
    });
    expect(multi.applicableCheckRegistry).toEqual(expect.arrayContaining(["TENSION", "BENDING_MAJOR", "COMBINED_ACTION"]));
    expect(multi.completenessMatrix.find((row) => row.checkKind === "COMBINED_ACTION")?.state).toBe("CHECK_UNDETERMINED");
    expect(multi.codeDesignCheckState).toBe("CHECK_UNDETERMINED");

    expect(() => orchestrateUsSteelMemberDesign({
      designRecordId: "rec-us8-mixed",
      createdAt: "2026-10-06T00:00:00.000Z",
      version: 1,
      capacityInput: capacityInput({
        combined: {
          combinationRef: "comb-uls",
          componentDemands: [],
          componentCapacities: [extraCapacity("TENSION", "LRFD"), extraCapacity("BENDING_MAJOR", "ASD")],
        },
      }),
    })).toThrow(/mixed LRFD\/ASD/);

    const missingSls = evaluateUsSteelServiceability({
      memberRef: "m-us8",
      standardProfileRef: "ctx-us8",
      directContractProfile: false,
      context: {
        memberRef: "m-us8",
        serviceabilityDemandRef: "d-sls",
        criterionRef: null,
        criterionType: null,
        criterionValue: null,
        criterionUnits: null,
        criterionSource: null,
        loadCaseOrCombinationRef: "comb-sls",
        projectRequirementRef: null,
        standardProfileRef: "ctx-us8",
        evidenceRef: null,
        provenanceRef: null,
        validationState: "VALIDATION_REQUIRED",
        spanM: 8,
        loadBasisRef: "SERVICE",
        buildingCodeContextRef: "adopt-ca-ibc",
        directContractProfileRef: null,
        localAmendmentSetRef: null,
        standardContextRef: "ctx-us8",
        clientRequirementRef: null,
        technicalBasisRef: "us8-sls",
        criterionRequiresBuildingCode: false,
        criterionRequiresLocalAmendment: false,
      } satisfies USSteelServiceabilityContext,
      demand: {
        resultId: "d-sls",
        memberId: "m-us8",
        combinationId: "comb-sls",
        capacityPresent: false,
        deflection: { value: 0.02, unit: "m", locationM: 4, signed: 0.02 },
      },
    });
    expect(missingSls?.reason).toBe("SERVICEABILITY_CRITERION_REQUIRED");
    expect(missingSls?.checkState).toBe("CHECK_UNDETERMINED");
    expect(US_SERVICEABILITY_ORCHESTRATION_VALIDATED).toBe(true);
    expect(DEFAULT_US_DEFLECTION_LIMIT_GUESSED).toBe(false);
    expect(() => requestUsDefaultDeflectionLimit()).toThrow(/defaultDeflectionLimitLn/);
  });

  it("audits AISC identity, building-code, LRFD/ASD, stability, and stale-result isolation", () => {
    expect(US_STANDARD_ECOSYSTEM_AUDIT).toBe("PASS");
    expect(US_BUILDING_CODE_ADOPTION_AUDIT).toBe("PASS");
    expect(US_DIRECT_CONTRACT_PROFILE_AUDIT).toBe("PASS");
    expect(US_LOAD_STANDARD_DEPENDENCY_AUDIT).toBe("PASS");
    expect(US_LRFD_ASD_GOVERNANCE_AUDIT).toBe("PASS");
    expect(US_LOCAL_AMENDMENT_AUDIT).toBe("PASS");
    expect(US_STANDARD_VERSION_AUDIT).toBe("PASS");
    expect(US_STABILITY_GOVERNANCE_AUDIT).toBe("PASS");
    expect(US_JURISDICTION_STANDARD_SEPARATION_AUDIT).toBe("PASS");
    expect(US_LRFD_ASD_UNIT_INDEPENDENCE_AUDIT).toBe("PASS");
    expect(US_MULTI_JURISDICTION_GOVERNANCE_AUDIT).toBe("PASS");
    expect(INTERNATIONAL_AISC_PROFILE_AUDIT).toBe("PASS");
    expect(US_STALE_RESULT_INVALIDATION_VALIDATED).toBe(true);
    expect(SILENT_AISC_EDITION_INFERENCE).toBe(false);
    expect(SILENT_STANDARD_IDENTITY_INFERENCE).toBe(false);
    expect(SILENT_ASCE_EDITION_INFERENCE).toBe(false);
    expect(SILENT_LOAD_STANDARD_EDITION_INFERENCE).toBe(false);
    expect(D1C_DEMAND_ENGINE_REUSED).toBe(true);
    expect(PARALLEL_US_LOAD_COMBINATION_ENGINE).toBe(false);
    expect(DEFAULT_LRFD_OR_ASD).toBe(false);
    expect(SILENT_LRFD_ASD_CONVERSION).toBe(false);
    expect(MIXED_LRFD_ASD_DESIGN_AUTHORITY_ALLOWED).toBe(false);
    expect(DESIGN_METHOD_AND_UNIT_SYSTEM_SEPARATE).toBe(true);
    expect(BUILDING_CODE_AND_STEEL_STANDARD_SEPARATE).toBe(true);
    expect(US_JURISDICTION_AND_STANDARD_SEPARATE).toBe(true);
    expect(AISC_NOT_HARDCODED_TO_US_GEOGRAPHY).toBe(true);
    expect(US_CODE_PROFILE_INFERRED_FROM_USER_LOCATION).toBe(false);
    expect(AISC_DESIGN_EQUALS_BUILDING_CODE_COMPLIANCE).toBe(false);
    expect(AISC_MEMBER_CHECK_EQUALS_BUILDING_CODE_COMPLIANCE).toBe(false);
    expect(DIRECT_CONTRACT_AISC_EQUALS_BUILDING_CODE_COMPLIANCE).toBe(false);
    expect(LOCAL_AMENDMENT_VALUE_GUESSED).toBe(false);
    expect(DEFAULT_K_FACTOR).toBe(false);
    expect(SUPPORT_LABEL_AUTOMATICALLY_DEFINES_K_FACTOR).toBe(false);
    expect(D1C_EQUALS_COMPLETE_US_STABILITY_ANALYSIS).toBe(false);
    expect(US_CB_FACTOR_GUESSED).toBe(false);
    expect(US_ELEMENT_CLASSIFICATION_LIMIT_GUESSED).toBe(false);
    expect(US_LOCAL_BUCKLING_RULE_GUESSED).toBe(false);
    assertUsStandardGovernanceAudits();
    assertNoDefaultKFactor();
    expect(() => assertBuildingCodeAndSteelStandardSeparate("IBC", "AISC 360")).not.toThrow();
    expect(() => assertBuildingCodeAndSteelStandardSeparate("AISC 360", "AISC 360")).toThrow(/not a substitute/);
    expect(() => assertJurisdictionAndStandardSeparate("california", "AISC 360")).not.toThrow();
    expect(() => denyCodeProfileFromUserLocation("locale")).toThrow(/USER_LOCATION_INFERENCE_DENIED/);
    expect(() => assertLrfdAsdFactorIsolation("LRFD", "Omega")).toThrow(/ASD factor cannot be used in LRFD/);
    expect(() => assertLrfdAsdFactorIsolation("ASD", "phi")).toThrow(/LRFD factor cannot be used in ASD/);
    expect(() => unknownEditionBlocksUsConformance(usSteel({ standardConformanceState: "CONFORMANCE_VALIDATED" }))).toThrow(/AISC_EDITION_REQUIRED/);
    expect(() => assertAiscMemberEditionIsolation("2016", "2022")).toThrow(/cannot silently cross editions/);
    const wrongAmendment: UsLocalAmendment = {
      amendmentSetId: "tx-on-ibc-2018",
      jurisdiction: "texas",
      authority: "city",
      baseCodeRef: "IBC",
      editionCompatibility: "2018",
      effectiveDate: null,
      ruleOverrides: [],
      sourceAuthorityRef: "metadata-reference-only",
      validationState: "FRAMEWORK_ONLY",
    };
    expect(() => assertAmendmentCompatibleWithAdoption(adoption({ buildingCodeEdition: "2021" }), wrongAmendment)).toThrow(/LOCAL_AMENDMENT_CONFLICT/);

    const issued = snapshotIssuedUsContext(usSteel({ issued: true, edition: "2016", amendmentErrataState: "2016-s1" }));
    const frozen = historicalUsContextRemainsReproducible(issued, laterProject());
    expect(frozen.edition).toBe("2016");
    expect(frozen.jurisdictionProfileRef).toBe("united-states");
    expect(frozen.designMethod).toBe("LRFD");

    const tags = invalidationTags(
      {
        sectionRef: "a",
        materialRef: "m",
        demandResultId: "d1",
        combinationId: "c1",
        effectiveLengthMajorM: 8,
        effectiveLengthMinorM: 8,
        unbracedLengthM: 8,
        standardContextId: "s1",
        criterionRef: "k1",
        methodVersions: { member: "1" },
        restraintDescription: "pinned",
        designMethod: "LRFD",
        stabilityMethod: "EFFECTIVE_LENGTH_BASED",
        classificationState: "UNKNOWN",
        buildingCodeEdition: "UNKNOWN_PENDING_CONFIRMATION",
        localAmendmentSetRef: "ca-1",
        aiscEdition: "UNKNOWN_PENDING_CONFIRMATION",
        secondOrderContext: "FIRST_ORDER",
      },
      {
        sectionRef: "b",
        materialRef: "m2",
        demandResultId: "d2",
        combinationId: "c2",
        effectiveLengthMajorM: 7,
        effectiveLengthMinorM: 7,
        unbracedLengthM: 6,
        standardContextId: "s2",
        criterionRef: "k2",
        methodVersions: { member: "2" },
        restraintDescription: "fixed",
        designMethod: "ASD",
        stabilityMethod: "DIRECT_ANALYSIS",
        classificationState: "COMPACT",
        buildingCodeEdition: "2021",
        localAmendmentSetRef: "tx-1",
        aiscEdition: "2022",
        secondOrderContext: "SECOND_ORDER",
      },
    );
    expect(tags).toEqual(expect.arrayContaining([
      "SECTION_CHANGED",
      "MATERIAL_CHANGED",
      "LOAD_CHANGED",
      "EFFECTIVE_LENGTH_CHANGED",
      "UNBRACED_LENGTH_CHANGED",
      "SERVICEABILITY_CRITERION_CHANGED",
      "STANDARD_PROFILE_CHANGED",
      "RESTRAINT_CHANGED",
      "DESIGN_METHOD_CHANGED",
      "STABILITY_METHOD_CHANGED",
      "CLASSIFICATION_CHANGED",
      "BUILDING_CODE_EDITION_CHANGED",
      "LOCAL_AMENDMENT_CHANGED",
      "AISC_EDITION_CHANGED",
      "SECOND_ORDER_CHANGED",
    ]));

    const ca = orchestrateUsSteelMemberDesign({
      designRecordId: "rec-ca",
      createdAt: "2026-10-06T00:00:00.000Z",
      version: 1,
      capacityInput: capacityInput({
        usSteelContext: usSteel({
          localAmendmentSetRef: "ca-amend-1",
          buildingCodeAdoption: adoption({ localAmendmentSetRef: "ca-amend-1" }),
        }),
      }),
    });
    const tx = orchestrateUsSteelMemberDesign({
      designRecordId: "rec-tx",
      createdAt: "2026-10-06T00:00:00.000Z",
      version: 1,
      capacityInput: capacityInput({
        usSteelContext: usSteel({
          jurisdictionProfileRef: "texas",
          localAmendmentSetRef: "tx-amend-1",
          buildingCodeAdoption: adoption({
            adoptionId: "adopt-tx-ibc",
            jurisdiction: "texas",
            adoptingAuthority: "state-of-texas",
            localAmendmentSetRef: "tx-amend-1",
          }),
        }),
      }),
    });
    expect(ca.localAmendmentSetRef).toBe("ca-amend-1");
    expect(tx.localAmendmentSetRef).toBe("tx-amend-1");
    expect(ca.fingerprint).not.toEqual(tx.fingerprint);
    expect(ca.buildingCodeComplianceState).not.toBe("COMPLIANCE_VALIDATED");
    assertMultiJurisdictionUsContexts([
      usSteel({ localAmendmentSetRef: "ca-amend-1", buildingCodeAdoptionRef: "adopt-ca-ibc" }),
      usSteel({ jurisdictionProfileRef: "texas", localAmendmentSetRef: "tx-amend-1", buildingCodeAdoptionRef: "adopt-tx-ibc" }),
    ]);
    assertUsTenantWorkspaceIsolation(usSteel(), usSteel({ jurisdictionProfileRef: "texas" }));

    const intlStandard = createConfiguredKnowledgeContext({
      contextId: "ctx-aisc-us8-intl",
      jurisdictionProfileRef: "other",
      standardFamily: "AISC",
      standardCode: "AISC 360",
      edition: AISC_UNKNOWN_EDITION_TOKEN,
      materialScope: "steel",
    });
    const international = orchestrateUsSteelMemberDesign({
      designRecordId: "rec-intl",
      createdAt: "2026-10-06T00:00:00.000Z",
      version: 1,
      capacityInput: capacityInput({
        standardContext: intlStandard,
        designContext: { ...designContext(intlStandard), standardContextRef: intlStandard.contextId },
        demand: demand(intlStandard),
        usSteelContext: usSteel({
          contextId: "ctx-us-member-intl",
          jurisdictionProfileRef: "other",
          directContractProfile: true,
          buildingCodeAdoption: null,
          buildingCodeAdoptionRef: null,
        }),
      }),
    });
    expect(international.buildingCodeComplianceState).toBe("NOT_APPLICABLE");
    expect(international.directContractProfileRef).toBe("ctx-us-member-intl");
    expect(international.codeDesignCheckState).toBe("CHECK_UNDETERMINED");
    expect(US_BUILDING_CODE_COMPLIANCE_SEPARATION_AUDIT).toBe("PASS");
    expect(US_DIRECT_CONTRACT_COMPLIANCE_BOUNDARY_AUDIT).toBe("PASS");

    for (const combo of [
      { designMethod: "LRFD" as const, unitSystem: "US_CUSTOMARY" as const },
      { designMethod: "LRFD" as const, unitSystem: "SI" as const },
      { designMethod: "ASD" as const, unitSystem: "US_CUSTOMARY" as const },
      { designMethod: "ASD" as const, unitSystem: "SI" as const },
    ]) {
      const record = orchestrateUsSteelMemberDesign({
        designRecordId: `rec-${combo.designMethod}-${combo.unitSystem}`,
        createdAt: "2026-10-06T00:00:00.000Z",
        version: 1,
        capacityInput: capacityInput({ usSteelContext: usSteel(combo) }),
      });
      expect(record.designMethod).toBe(combo.designMethod);
      expect(record.unitSystem).toBe(combo.unitSystem);
      expect(record.codeDesignCheckState).toBe("CHECK_UNDETERMINED");
    }

    expect(() => orchestrateUsSteelMemberDesign({
      designRecordId: "rec-k",
      createdAt: "2026-10-06T00:00:00.000Z",
      version: 1,
      capacityInput: capacityInput({ usStabilityContext: usStability({ mixedMethods: true }) }),
    })).toThrow(/cannot mix/);
  });

  it("keeps pack certification, AI, approval, and warnings fail-closed", () => {
    expect(US_STEEL_PACK_CERTIFIED).toBe(false);
    expect(PACK_CERTIFICATION_NOT_OVERSTATED).toBe(true);
    assertUsPackCertificationNotOverstated();
    assertAiscConformanceNotValidatedWithoutEvidence(false);
    expect(() => assertAiscConformanceNotValidatedWithoutEvidence(true)).toThrow(/must not be fabricated/);
    expect(() => deriveUsSteelProductClaim("CERTIFIED_DESIGN_CAPABILITY")).toThrow(/product claim exceeds evidence/);
    expect(deriveUsSteelProductClaim()).toBe("BENCHMARKED_ENGINEERING_REFERENCE_CAPABILITY");
    expect(() => deriveUsSteelReleaseClassification("GENERAL_AVAILABILITY")).toThrow(/release classification exceeds evidence/);
    expect(deriveUsSteelReleaseClassification()).toBe("INTERNAL_ENGINEERING_REFERENCE");
    expect(() => assertAiCannotPromoteUsMethodMaturity("AI", "BENCHMARKED", "CERTIFIED")).toThrow(/AI cannot promote method maturity/);
    expect(() => assertAiCannotCertifyUsConformance("AI")).toThrow(/AI cannot certify conformance/);
    expect(() => assertAiCannotInventUsServiceabilityCriterion("AI")).toThrow(/serviceability criterion/);
    expect(() => assertAiCannotChooseUsDesignMethod("AI")).toThrow(/LRFD or ASD/);
    expect(() => denyAiUsMechanicsToAiscPromotion()).toThrow(/cannot promote mechanics/);
    expect(() => denyAiAiscEditionChoice()).toThrow(/AISC edition/);
    expect(() => denyAiLrfdAsdChoice()).toThrow(/LRFD or ASD/);
    expect(() => denyAiLocalAmendment()).toThrow(/local amendment/);
    expect(() => denyAiUsKFactor()).toThrow(/K factor/);
    expect(() => denyAiUsCbFactor()).toThrow(/Cb/);
    expect(() => denyAiUsBendingClassification()).toThrow(/classification/);
    expect(() => denyAiUsElementClassification()).toThrow(/classification/);
    expect(() => denyAiUsStabilityMethod()).toThrow(/stability/);
    expect(() => denyAiUsInteractionEquation()).toThrow(/interaction/);
    expect(() => denyAiUsConformanceClaim()).toThrow(/compliance/);
    expect(() => denyAiUsBuildingCodeCompliance()).toThrow(/building-code/);
    expect(() => denyAiUsDesignMethodSelection()).toThrow(/LRFD or ASD/);
    expect(() => denyAiUsServiceabilityCriterion()).toThrow(/serviceability criterion/);
    expect(() => assertAiCannotApproveUsMember("AI", "approved")).toThrow(/AI cannot promote result to approval/);
    assertUsApprovalRemainsSeparate();
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(NUMERICAL_VALIDATION_EQUALS_PROJECT_APPROVAL).toBe(false);
    expect(AISC_CONFORMANCE_EQUALS_PROJECT_APPROVAL).toBe(false);
    expect(BUILDING_CODE_COMPLIANCE_EQUALS_PROJECT_APPROVAL).toBe(false);
    expect(SOFTWARE_CERTIFICATION_EQUALS_PROJECT_APPROVAL).toBe(false);
    expect(US_OPTIMIZATION_ACCEPTS_UNDETERMINED).toBe(false);
    expect(() => assertCandidateFullUsMemberRecheck({
      candidateSectionRef: "w12x26",
      proposedBy: "AI",
      deterministicRecheckRequired: true,
      rechecked: true,
      memberCheckState: "CHECK_UNDETERMINED",
    })).toThrow(/undetermined/);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(FORBIDDEN_ENGINEERING_RULE_AUTHORITIES).toEqual(expect.arrayContaining([
      "LLM_MEMORY_ONLY",
      "UNSOURCED_WEB_SUMMARY",
      "UNVERIFIED_GENERATED_RULE",
    ]));
    expect(() => assertUsRuleAuthority("LLM_MEMORY_ONLY")).toThrow(/RULE_AUTHORITY_DENIED/);
    expect(() => assertUsRuleAuthority("UNSOURCED_WEB_SUMMARY")).toThrow(/RULE_AUTHORITY_DENIED/);
    expect(() => assertUsRuleAuthority("UNVERIFIED_GENERATED_RULE")).toThrow(/RULE_AUTHORITY_DENIED/);
    expect(US_STEEL_RESULT_WARNING_MODEL).toBe(true);
    expect(US_STEEL_RESULT_WARNINGS).toEqual(expect.arrayContaining([
      "mechanics reference only",
      "AISC strength not validated",
      "not approved for construction",
    ]));
    expect(warningsForUsSteelResult({ interactionRequired: true, designMethodMissing: true, localAmendmentIncomplete: true })).toEqual(
      expect.arrayContaining(["interaction method unavailable", "LRFD/ASD method context required", "local amendment context incomplete"]),
    );
    expect(applyUsMethodEngineeringConfirmation({
      methodRef: "US_TENSION_GROSS_YIELD_MECHANICS",
      validationScope: "mechanics",
      reviewOutcome: "CONFIRMED",
      evidenceRefs: ["ev"],
      reviewedAt: "2026-10-06T00:00:00.000Z",
      reviewerAuthorityRef: "licensed-engineer",
      projectApprovalImplied: false,
      professionalCertificationImplied: false,
      softwareCertificationImplied: false,
    }).reviewOutcome).toBe("CONFIRMED");
    expect(US_ENGINEER_METHOD_CONFIRMATION_MODEL).toBe(true);
    expect(US_THIRD_PARTY_VALIDATION_AVAILABLE).toBe(false);
    expect(US_THIRD_PARTY_VALIDATION_RECORDS).toEqual([]);
    expect(US_THIRD_PARTY_VALIDATION_STATE).toBe("NOT_AVAILABLE");
    assertUsThirdPartyValidationModel();
    expect(US_CONNECTION_DESIGN_VALIDATED).toBe(false);
    expect(US_SEISMIC_STEEL_DESIGN_VALIDATED).toBe(false);
    expect(MEMBER_VALIDATION_IMPLIES_CONNECTION_VALIDATION).toBe(false);
    expect(MEMBER_VALIDATION_IMPLIES_FOUNDATION_VALIDATION).toBe(false);
    expect(MEMBER_VALIDATION_IMPLIES_GLOBAL_FRAME_VALIDATION).toBe(false);
    expect(GENERAL_FEA_CAPABILITY_CLAIMED).toBe(false);
    expect(ANALYSIS_SCOPE_TRUTHFUL).toBe(true);
    expect(STANDARD_TEXT_REQUIRED_BY_RUNTIME).toBe(false);
    expect(COPYRIGHTED_STANDARD_TEXT_COMMITTED).toBe(false);
    expect(STRUCTURAL_STANDARD_TEXT_EMBEDDED).toBe(false);
    expect(US_FAIL_CLOSED_AUDIT).toBe("PASS");
    expect(US_AI_AUTHORITY_AUDIT).toBe("PASS");
    expect(US_HUMAN_OVERSIGHT_AUDIT).toBe("PASS");
    expect(US_STANDARD_CONTEXT_TENANCY_AUDIT).toBe("PASS");
    expect(EMPLOYEE_BEHAVIOR_PROFILING).toBe(false);
  });

  it("keeps AU/EU isolation, common mechanics consistency, and no false conformance claims", () => {
    expect(AU_TENSION_BENCHMARKS[0]?.expectedResult.value).toBe(EU_TENSION_BENCHMARKS[0]?.expectedResult.value);
    expect(AU_TENSION_BENCHMARKS[0]?.expectedResult.value).not.toBe(3_270_600);
    const fy = prop("Fy", 300, "MPa");
    const Ag = prop("Ag", 5140, "mm2");
    const Sx = prop("Sx", 1_000_000, "mm3");
    const Av = prop("Aw", 5_000, "mm2");
    expect(nominalTensionForceN(fy, Ag, "Fy", "Ag")).toBe(1_542_000);
    expect(eulerLoadN(200e9, 100_000_000 * 1e-12, 8)).toBeCloseTo(3_084_251, 0);
    expect(firstYieldMomentNm(fy, Sx, "Fy", "Sx")).toBe(300_000);
    expect(elasticLtbMomentNm({
      EPa: 200e9,
      GPa: 80e9,
      IminorM4: 20_000_000 * 1e-12,
      JM4: 500_000 * 1e-12,
      IwM6: 200_000_000_000 * 1e-18,
      unbracedLengthM: 8,
    })).toBeCloseTo(168_757, 0);
    expect(vonMisesShearYieldN(fy, Av)).toBeCloseTo(866_025.4037844386, 6);
    expect(elasticShearBucklingForceN({
      EPa: 200e9,
      poisson: 0.3,
      kv: 5.34,
      webDepthM: 0.3,
      webThicknessM: 0.008,
      shearAreaM2: 0.005,
    })).toBeCloseTo(3_432_068, 0);
    expect(COMMON_MECHANICS_AUDIT).toBe("PASS");
    expect(US_COMMON_MECHANICS_AUDIT).toBe("PASS");
    expect(THREE_JURISDICTION_COMMON_MECHANICS_CONSISTENCY).toBe("PASS");
    expect(GLOBAL_MECHANICS_JURISDICTION_NEUTRAL).toBe(true);
    expect(AU_METHOD_VALIDATION_INVENTORY).toHaveLength(18);
    expect(AU_STEEL_VALIDATION_MATRIX).toHaveLength(11);
    expect(EU_METHOD_VALIDATION_INVENTORY.length).toBeGreaterThan(20);
    expect(EU_STEEL_VALIDATION_MATRIX).toHaveLength(13);
    expect(EU_CODE_PROFILE_METHOD_COUNT).toBe(15);
    expect(IMPLEMENTED_INTERACTION_METHODS).toEqual([]);
    expect(IMPLEMENTED_EU_INTERACTION_METHODS).toEqual([]);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(US_STEEL_IMPLEMENTATION_SUBPHASES[7]).toMatch(/US-8/);
    expect(EU_ONLY_STEEL_CORE).toBe(false);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(US_STEEL_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_BOUNDED_METHODS");
    expect(EU_STEEL_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_BOUNDED_METHODS");
    expect(EU_STEEL_PACK_CERTIFIED).toBe(false);
    expect(US_STEEL_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(US_STEEL_PRODUCT_CLAIM_LEVEL).toBe("BENCHMARKED_ENGINEERING_REFERENCE_CAPABILITY");
    expect(US_STEEL_RELEASE_CLASSIFICATION).toBe("INTERNAL_ENGINEERING_REFERENCE");
    expect(US_BOUNDED_SUPPORTED_SCOPE).toMatch(/not complete AISC steel design/);
    expect(US_STEEL_VALIDATION_MATRIX).toHaveLength(15);
    expect(US_STEEL_VALIDATION_MATRIX.every((row) => row.certified === false && row.conformanceValidated === false && row.codeProfileImplemented === false && row.buildingCodeComplianceValidated === false)).toBe(true);
    expect(US_VALIDATION_DEBT_REGISTER.length).toBeGreaterThanOrEqual(16);
    expect(US_VALIDATION_PRIORITY_PLAN[0]?.priority).toBe("SAFETY_CRITICAL");
    expect(D1D_US8_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(D1D_US8_D0_RISK_DISPOSITION.REDUCED).toEqual(["D0-R01", "D0-R03"]);
    expect(US8_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK).toBe(true);
    expect(THREE_JURISDICTION_ARCHITECTURE_VALIDATED).toBe(true);
    expect(THREE_JURISDICTION_STEEL_ARCHITECTURE_AUDIT).toBe("PASS");
    expect(US_BUILDING_CODE_COMPLIANCE_EVIDENCE_REQUIRED).toBe(true);
    expect(typeof orchestrateAuSteelMemberDesign).toBe("function");
    expect(typeof orchestrateEuSteelMemberDesign).toBe("function");

    const steelSrc = readSteelTree();
    const docsDir = join(here, "../../../../docs/architecture/engineering-os");
    const usDocs = readdirSync(docsDir).filter((name) => name.startsWith("EOS_D1D_US")).map((name) => readFileSync(join(docsDir, name), "utf8")).join("\n");
    const corpus = `${steelSrc}\n${usDocs}`;
    const positive = [
      /is AISC compliant/i,
      /is AISC 360 compliant/i,
      /is US code compliant/i,
      /is building-code compliant/i,
      /AISC_COMPLIANT\s*=\s*YES/i,
      /US_STEEL_PACK_CERTIFIED\s*=\s*true/i,
      /US_STEEL_PACK_CERTIFIED\s*=\s*YES/i,
      /is safe for construction/i,
      /is IFC approved/i,
      /is design approved/i,
    ];
    for (const pattern of positive) {
      expect(corpus).not.toMatch(pattern);
    }
    expect(steelSrc).not.toMatch(/\bL\/240\b|\bL\/300\b|\bL\/360\b|\bL\/480\b|\bL\/600\b/);
    const mechanics = ["tension-force.ts", "euler.ts", "effective-length.ts", "bending.ts", "ltb.ts", "shear.ts"]
      .map((name) => readFileSync(join(here, "mechanics", name), "utf8")).join("\n");
    expect(mechanics).toMatch(/Not AS 4100|not AS 4100/);
    expect(mechanics).toMatch(/Not EN 1993|not EN 1993/);
    expect(mechanics).toMatch(/not AISC|or AISC/i);
    expect(mechanics).not.toMatch(/γM0\s*=|gamma_M0\s*=|φNt\s*=|chi\s*=\s*0\.|AISC 360 §|φc\s*=|Ωc\s*=/);
    const auSrc = ["inventory.ts", "matrix.ts"].map((name) => readFileSync(join(here, "au-validation", name), "utf8")).join("\n");
    expect(auSrc).not.toMatch(/US_TENSION_GROSS_YIELD_MECHANICS|φc\s*=|AISC 360 §/);
    const euVal = readFileSync(join(here, "eu-validation", "inventory.ts"), "utf8");
    expect(euVal).not.toMatch(/AUST300 default|0\.9 fy Ag|AS 4100 φ|US_TENSION_GROSS_YIELD_LRFD/);
    const usVal = readFileSync(join(here, "us-validation", "inventory.ts"), "utf8");
    expect(usVal).not.toMatch(/AUST300 default|0\.9 fy Ag|AS 4100 φ|γM0/);
    const invalidation = readFileSync(join(here, "au-member", "invalidation.ts"), "utf8");
    expect(invalidation).not.toMatch(/AISC 360 §|γM0|AS 4100 φ/);
    const globalCore = readFileSync(join(here, "properties.ts"), "utf8");
    expect(globalCore).not.toMatch(/EU_MEMBER_|AS 4100 φ|AISC 360|φc\s*=|Ωc\s*=/);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL).toEqual({ ready: true, implemented: false, standards: ["AISC 360"], loadContext: ["ASCE 7"] });
  });
});
