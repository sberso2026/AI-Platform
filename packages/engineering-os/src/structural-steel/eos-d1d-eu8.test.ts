import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_ENGINEERING_APPROVAL,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  ANALYSIS_SCOPE_TRUTHFUL,
  BENCHMARK_EQUALS_EUROCODE_CONFORMANCE,
  COMMON_MECHANICS_EQUALS_COMMON_CODE_AUTHORITY,
  DEFAULT_EU_NATIONAL_ANNEX,
  ELASTIC_BENDING_EQUALS_EN1993_SECTION_RESISTANCE,
  ELASTIC_LTB_EQUALS_EN1993_MEMBER_RESISTANCE,
  ELASTIC_SHEAR_EQUALS_EN1993_RESISTANCE,
  EMPLOYEE_BEHAVIOR_PROFILING,
  EOS_D1D_EU8_PHASE,
  EU_CONFORMANCE_EVIDENCE_REQUIRED,
  EU_CONNECTION_DESIGN_VALIDATED,
  EU_ONLY_STEEL_CORE,
  EU_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  EU_STEEL_IMPLEMENTATION_MATURITY,
  EU_STEEL_PACK_CERTIFIED,
  EU_STEEL_PRODUCT_CLAIM_LEVEL,
  EU_STEEL_RELEASE_CLASSIFICATION,
  EU_STEEL_RESULT_WARNING_MODEL,
  EU_STEEL_STANDARD_CONFORMANCE_STATE,
  EU_THIRD_PARTY_VALIDATION_AVAILABLE,
  EU_VALIDATION_DIMENSIONS_SEPARATE,
  EULER_REFERENCE_EQUALS_EN1993_MEMBER_CAPACITY,
  EUROCODE_NOT_HARDCODED_TO_EU_MEMBERSHIP,
  EUROCODE_UNKNOWN_EDITION_TOKEN,
  FORBIDDEN_ENGINEERING_RULE_AUTHORITIES,
  GENERAL_EU_MEMBER_CODE_DESIGN_VALIDATED,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  MEMBER_VALIDATION_IMPLIES_CONNECTION_VALIDATION,
  MEMBER_VALIDATION_IMPLIES_FOUNDATION_VALIDATION,
  MEMBER_VALIDATION_IMPLIES_GLOBAL_FRAME_VALIDATION,
  NATIONAL_ANNEX_INFERRED_FROM_USER_LOCATION,
  NDP_VALUE_GUESSED,
  NEW_MAJOR_DESIGN_METHOD_IMPLEMENTED,
  NUMERICAL_EU_INTERACTION_METHODS_AFTER_EU8,
  NUMERICAL_VALIDATION_EQUALS_PROJECT_APPROVAL,
  PACK_CERTIFICATION_NOT_OVERSTATED,
  SELF_REFERENTIAL_BENCHMARKS,
  SILENT_STANDARD_IDENTITY_INFERENCE,
  SOFTWARE_CERTIFICATION_EQUALS_PROJECT_APPROVAL,
  STANDARD_CONFORMANCE_EQUALS_PROJECT_APPROVAL,
  type EurocodeNationalAnnex,
  type EurocodeProjectStandardContext,
  type EurocodeSteelDesignContext,
  type SteelCapacityEngineInput,
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
  AU_TENSION_BENCHMARKS,
  COMMON_MECHANICS_AUDIT,
  D1D_EU8_D0_RISK_DISPOSITION,
  EN1993_PART_CATALOG,
  EU_AI_AUTHORITY_AUDIT,
  EU_BENCHMARK_AUDIT_BY_METHOD,
  EU_BENCHMARK_AUDIT_RESULT,
  EU_BENDING_VALIDATION_STATE,
  EU_BOUNDED_SUPPORTED_SCOPE,
  EU_CODE_PROFILE_IMPLEMENTED_COUNT,
  EU_CODE_PROFILE_METHOD_COUNT,
  EU_CODE_PROFILE_VALIDATED_COUNT,
  EU_COMPRESSION_VALIDATION_STATE,
  EU_FAIL_CLOSED_AUDIT,
  EU_MEMBER_ORCHESTRATOR_VALIDATION,
  EU_METHOD_VALIDATION_INVENTORY,
  EU_NUMERICAL_METHOD_IDS,
  EU_SHEAR_VALIDATION_STATE,
  EU_STANDARD_BINDING_AUDIT,
  EU_STEEL_RESULT_WARNINGS,
  EU_STEEL_VALIDATION_MATRIX,
  EU_TENSION_BENCHMARKS,
  EU_TENSION_VALIDATION_STATE,
  EU_THIRD_PARTY_VALIDATION_RECORDS,
  EU_THIRD_PARTY_VALIDATION_STATE,
  EU_VALIDATION_DEBT_REGISTER,
  EU_VALIDATION_PRIORITY_PLAN,
  IMPLEMENTED_EU_INTERACTION_METHODS,
  IMPLEMENTED_INTERACTION_METHODS,
  STEEL_ADAPTER_BOUNDARIES,
  US_STEEL_IMPLEMENTATION_SUBPHASES,
  allEuNumericalBenchmarks,
  applyEuMethodEngineeringConfirmation,
  assertAiCannotApproveEuMember,
  assertAiCannotCertifyEuConformance,
  assertAiCannotInventEuServiceabilityCriterion,
  assertAiCannotPromoteEuMethodMaturity,
  assertAnnexCompatibleWithContext,
  assertCandidateFullEuMemberRecheck,
  assertCountryAndStandardSeparate,
  assertEuApprovalRemainsSeparate,
  assertEuPackCertificationNotOverstated,
  assertEuStandardGovernanceAudits,
  assertEuThirdPartyValidationModel,
  assertEurocodeConformanceNotValidatedWithoutEvidence,
  assertInteractionGenerationCompatible,
  assertMechanicsNotClassifiedAsCodeCapacity,
  assertNoDefaultNationalAnnex,
  assertNoNumericalEuInteractionMethodsAfterEu8,
  auditEuBenchmarkRecord,
  denyAiBucklingCurveChoice,
  denyAiMechanicsToCodePromotion,
  denyAiNationalAnnexChoice,
  denyAiNdpSupply,
  denyNationalAnnexFromUserLocation,
  deriveEuSteelProductClaim,
  deriveEuSteelReleaseClassification,
  evaluateEuSteelServiceability,
  historicalContextRemainsReproducible,
  invalidationTags,
  orchestrateEuSteelMemberDesign,
  resolveNdp,
  scoreAllIndependentEuBenchmarks,
  snapshotIssuedEurocodeContext,
  unknownEditionBlocksConformance,
  unknownEurocodeVersion,
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

function eurocodeContext(country = "DE", overrides: Partial<EurocodeSteelDesignContext> = {}): EurocodeSteelDesignContext {
  return {
    contextId: `ctx-eu8-${country}`,
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-eu8",
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
    projectContextRef: "proj-eu8",
    calculationContextRef: "calc-eu8",
    sourceAuthorityRef: "governed-project-profile",
    intendedStandardProfile: "EN1993",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: "eu8:member",
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
    ...overrides,
  };
}

function euStandard(country = "DE"): StructuralStandardContext {
  return {
    ...createConfiguredKnowledgeContext({
      contextId: `ctx-en1993-eu8-${country}`,
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

function material(): SteelMaterialDesignProperties {
  return {
    materialRef: "mat-eu8",
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
    sectionRef: "sec-eu8",
    sectionFamily: "IPE",
    catalogSource: "ENGINEER_SUPPLIED",
    catalogVersion: null,
    jurisdictionApplicability: ["eu-eea"],
    area: { name: "Ag", value: 5140, unit: "mm2", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Iyy: { name: "Iyy", value: 222_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Izz: { name: "Izz", value: 23_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
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

function capacityInput(patch: Partial<SteelCapacityEngineInput> = {}): SteelCapacityEngineInput {
  const standardContext = patch.standardContext ?? euStandard();
  return {
    adapterId: "EU_STEEL",
    designContext: {
      designContextId: "dc-eu8",
      memberRef: "m-eu8",
      sectionRef: "sec-eu8",
      materialRef: "mat-eu8",
      demandRefs: ["demand-eu8-uls"],
      standardContextRef: standardContext.contextId,
      parameterSetRef: null,
      effectiveLengthContextRef: null,
      restraintContextRef: null,
      stabilityContextRef: null,
      fabricationContextRef: null,
      evidenceRefs: [{ evidenceId: "ev-eng", sourceKind: "human_input", reference: "engineer" }],
      toolRef: "EOS_EU_STEEL_MEMBER_DESIGN",
      methodRef: "EU_MEMBER",
      provenanceRef: governedProvenance({ jurisdiction: "eu-eea", standard: "EN 1993-1-1", calculationMethod: "EU_MEMBER" }),
      validationState: "FRAMEWORK_ONLY",
      reviewState: "required",
    },
    standardContext,
    material: material(),
    section: section(),
    stability: null,
    demand: {
      resultId: "demand-eu8-uls",
      memberId: "m-eu8",
      shear: { value: 0, unit: "N", locationM: 2, signed: 0 },
      moment: { value: 0, unit: "N.m", locationM: 4, signed: 0 },
      axial: { valueN: 1_000_000, unit: "N", method: "AXIAL_DIRECT" },
      deflection: { status: "NOT_IMPLEMENTED", reason: "ULS demand is not a serviceability demand" },
      capacityPresent: false,
      standardContext,
      inputEvidenceRefs: [{ evidenceId: "ev-d1c", sourceKind: "calculation", reference: "d1c-uls" }],
      combinationId: "comb-uls",
    },
    limitState: "TENSION",
    requiredProperties: [],
    eurocodeContext: eurocodeContext(),
    ...patch,
  };
}

describe("EOS-D1D-EU-8 Eurocode steel validation and conformance gate", () => {
  it("inventories every EU method with separate validation dimensions and independent benchmarks", () => {
    expect(EOS_D1D_EU8_PHASE).toBe("EOS-D1D-EU-8");
    expect(EU_VALIDATION_DIMENSIONS_SEPARATE).toBe(true);
    expect(NEW_MAJOR_DESIGN_METHOD_IMPLEMENTED).toBe(false);
    const numerical = EU_METHOD_VALIDATION_INVENTORY.filter((row) => row.numericalValidationState === "PASS");
    expect(numerical.map((row) => row.methodId).sort()).toEqual([...EU_NUMERICAL_METHOD_IDS].sort());
    expect(EU_NUMERICAL_METHOD_IDS).toEqual(expect.arrayContaining([
      "EU_TENSION_GROSS_YIELD_MECHANICS",
      "EU_TENSION_NET_FRACTURE_MECHANICS",
      "EU_COMPRESSION_SQUASH_YIELD_MECHANICS",
      "EU_COMPRESSION_EULER_MAJOR_MECHANICS",
      "EU_COMPRESSION_EULER_MINOR_MECHANICS",
      "EU_BENDING_ELASTIC_MAJOR_MECHANICS",
      "EU_BENDING_ELASTIC_MINOR_MECHANICS",
      "EU_BENDING_ELASTIC_LTB_MECHANICS",
      "EU_SHEAR_ELASTIC_MAJOR_MECHANICS",
      "EU_SHEAR_ELASTIC_MINOR_MECHANICS",
      "EU_SHEAR_ELASTIC_BUCKLING_MECHANICS",
    ]));
    expect(EU_METHOD_VALIDATION_INVENTORY.map((row) => row.methodId)).toEqual(expect.arrayContaining([
      "EU_SERVICEABILITY_ORCHESTRATION",
      "EU_MEMBER_DESIGN_ORCHESTRATION",
    ]));
    for (const row of EU_METHOD_VALIDATION_INVENTORY) {
      expect(row.standardFamily).toBe("EUROCODE");
      expect(row.editionRequirement).toBe(EUROCODE_UNKNOWN_EDITION_TOKEN);
      expect(row.standardConformanceState).toBe("INTENDED_PROFILE");
      expect(row.engineeringValidationState).toBe("VALIDATION_REQUIRED");
      expect(row.humanReviewRequirement).toBe("required");
      expect(row.classifications.length).toBeGreaterThan(0);
    }
    assertMechanicsNotClassifiedAsCodeCapacity();
    expect(EU_CODE_PROFILE_METHOD_COUNT).toBe(15);
    expect(EU_CODE_PROFILE_IMPLEMENTED_COUNT).toBe(0);
    expect(EU_CODE_PROFILE_VALIDATED_COUNT).toBe(0);
    const scored = scoreAllIndependentEuBenchmarks();
    expect(scored).toHaveLength(11);
    expect(scored.every((row) => row.evidenceRef.endsWith(":PASS"))).toBe(true);
    expect(allEuNumericalBenchmarks().every((row) => auditEuBenchmarkRecord(row) === "PARTIAL" || auditEuBenchmarkRecord(row) === "PASS")).toBe(true);
    expect(scored.every((row) => auditEuBenchmarkRecord(row) === "PASS")).toBe(true);
    expect(Object.values(EU_BENCHMARK_AUDIT_BY_METHOD).every((state) => state === "PASS")).toBe(true);
    expect(EU_BENCHMARK_AUDIT_RESULT).toBe("PASS");
    expect(SELF_REFERENTIAL_BENCHMARKS).toBe(false);
    expect(EU_TENSION_VALIDATION_STATE).toMatch(/NUMERICALLY_VALIDATED_MECHANICS/);
    expect(EU_COMPRESSION_VALIDATION_STATE).toMatch(/EULER_NOT_EN1993/);
    expect(EU_BENDING_VALIDATION_STATE).toMatch(/ELASTIC_LTB_NOT_EN1993/);
    expect(EU_SHEAR_VALIDATION_STATE).toMatch(/ELASTIC_SHEAR_NOT_EN1993/);
  });

  it("does not promote mechanics, Euler, LTB, shear, or interaction gaps to Eurocode design", () => {
    expect(EULER_REFERENCE_EQUALS_EN1993_MEMBER_CAPACITY).toBe(false);
    expect(ELASTIC_BENDING_EQUALS_EN1993_SECTION_RESISTANCE).toBe(false);
    expect(ELASTIC_LTB_EQUALS_EN1993_MEMBER_RESISTANCE).toBe(false);
    expect(ELASTIC_SHEAR_EQUALS_EN1993_RESISTANCE).toBe(false);
    expect(BENCHMARK_EQUALS_EUROCODE_CONFORMANCE).toBe(false);
    expect(EU_CONFORMANCE_EVIDENCE_REQUIRED).toBe(true);
    expect(COMMON_MECHANICS_EQUALS_COMMON_CODE_AUTHORITY).toBe(false);
    assertNoNumericalEuInteractionMethodsAfterEu8();
    expect(IMPLEMENTED_EU_INTERACTION_METHODS).toEqual([]);
    expect(NUMERICAL_EU_INTERACTION_METHODS_AFTER_EU8).toEqual([]);
    expect(GENERAL_EU_MEMBER_CODE_DESIGN_VALIDATED).toBe(false);
    expect(EU_MEMBER_ORCHESTRATOR_VALIDATION).toBe("PASS");

    const tension = orchestrateEuSteelMemberDesign({
      designRecordId: "rec-eu8-t",
      createdAt: "2026-10-06T00:00:00.000Z",
      version: 1,
      capacityInput: capacityInput(),
    });
    expect(tension.mechanicsEvaluationState).toBe("COMPLETE_FOR_AVAILABLE_MECHANICS");
    expect(tension.codeDesignCheckState).toBe("CHECK_UNDETERMINED");
    expect(tension.completenessMatrix.find((row) => row.checkKind === "TENSION")?.state).toBe("CHECK_UNDETERMINED");

    const multi = orchestrateEuSteelMemberDesign({
      designRecordId: "rec-eu8-i",
      createdAt: "2026-10-06T00:00:00.000Z",
      version: 1,
      capacityInput: capacityInput({
        demand: {
          ...capacityInput().demand,
          moment: { value: 100_000, unit: "N.m", locationM: 4, signed: 100_000 },
        },
        stability: {
          stabilityContextId: "stab-eu8",
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
        },
      }),
    });
    expect(multi.applicableCheckRegistry).toEqual(expect.arrayContaining(["TENSION", "BENDING_MAJOR", "COMBINED_ACTION"]));
    expect(multi.completenessMatrix.find((row) => row.checkKind === "COMBINED_ACTION")?.state).toBe("CHECK_UNDETERMINED");
    expect(multi.codeDesignCheckState).toBe("CHECK_UNDETERMINED");

    const missingSls = evaluateEuSteelServiceability({
      memberRef: "m-eu8",
      standardProfileRef: "ctx-eu8",
      context: {
        memberRef: "m-eu8",
        serviceabilityDemandRef: "d-sls",
        criterionRef: null,
        criterionType: null,
        criterionValue: null,
        criterionUnits: null,
        criterionSource: null,
        loadCaseOrCombinationRef: "comb-sls",
        projectRequirementRef: null,
        standardProfileRef: "ctx-eu8",
        evidenceRef: null,
        provenanceRef: null,
        validationState: "VALIDATION_REQUIRED",
        spanM: 8,
        standardContextRef: "ctx-eu8",
        standardPartRefs: ["EN_1990"],
        nationalAnnexRef: "NA-DE-EN1993-1-1",
        ndpRefs: [],
        technicalBasisRef: "eu8-sls",
        criterionRequiresNdp: false,
        criterionRequiresAnnex: false,
      },
      demand: {
        resultId: "d-sls",
        memberId: "m-eu8",
        combinationId: "comb-sls",
        capacityPresent: false,
        deflection: { value: 0.02, unit: "m", locationM: 4, signed: 0.02 },
      },
    });
    expect(missingSls?.reason).toBe("SERVICEABILITY_CRITERION_REQUIRED");
    expect(missingSls?.checkState).toBe("CHECK_UNDETERMINED");
  });

  it("audits Eurocode binding, Annex/NDP, second generation, and stale-result isolation", () => {
    expect(EU_STANDARD_BINDING_AUDIT).toBe("PASS");
    expect(SILENT_STANDARD_IDENTITY_INFERENCE).toBe(false);
    assertEuStandardGovernanceAudits();
    expect(DEFAULT_EU_NATIONAL_ANNEX).toBe(false);
    expect(NATIONAL_ANNEX_INFERRED_FROM_USER_LOCATION).toBe(false);
    expect(NDP_VALUE_GUESSED).toBe(false);
    expect(() => assertCountryAndStandardSeparate("DE", "EN 1993-1-1")).not.toThrow();
    expect(() => assertNoDefaultNationalAnnex(null)).not.toThrow();
    expect(() => denyNationalAnnexFromUserLocation("locale")).toThrow(/USER_LOCATION_INFERENCE_DENIED/);
    expect(() => {
      assertAnnexCompatibleWithContext(eurocodeContext("DE"), annex("FR"));
    }).toThrow(/NATIONAL_ANNEX_MISMATCH/);
    expect(() => {
      assertAnnexCompatibleWithContext(
        eurocodeContext("DE", { version: { ...unknownEurocodeVersion("EN 1993-1-1"), edition: "2005" } }),
        annex("DE", { edition: "2010" }),
      );
    }).toThrow(/NATIONAL_ANNEX_MISMATCH/);
    expect(resolveNdp({
      ruleRequiresNdp: true,
      annex: annex("DE"),
      ndpSet: [],
      parameterId: "partial-factor",
    })).toEqual({ kind: "FAIL_CLOSED", reason: "NDP_REQUIRED", checkState: "CHECK_UNDETERMINED" });
    expect(() => unknownEditionBlocksConformance(eurocodeContext("DE", { standardConformanceState: "CONFORMANCE_VALIDATED" }))).toThrow(/STANDARD_EDITION_REQUIRED/);
    expect(() => assertInteractionGenerationCompatible("SECOND_GENERATION")).toThrow(/STANDARD_VERSION_CONFLICT/);
    const issued = snapshotIssuedEurocodeContext(eurocodeContext("DE", { issued: true }));
    const laterProject: EurocodeProjectStandardContext = {
      tenantId: "tenant-a",
      workspaceId: "ws-a",
      projectId: "proj-eu8",
      jurisdictionProfileRef: "eu-eea",
      countryCode: "FR",
      generationFamily: "UNKNOWN_PENDING_CONFIRMATION",
      governingParts: ["EN_1993_1_1"],
      nationalAnnexSet: [annex("FR")],
      projectSpecificGovernedParameters: [],
      designBasisReference: null,
      workspaceGlobalAnnexId: null,
    };
    const frozen = historicalContextRemainsReproducible(issued, laterProject);
    expect(frozen.countryCode).toBe("DE");
    expect(EN1993_PART_CATALOG.some((part) => part.partId === "EN_1993_1_5" && !part.initialSteelDesignPart)).toBe(true);
    expect(EN1993_PART_CATALOG.some((part) => part.partId === "EN_1993_1_8")).toBe(true);

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
        nationalAnnexId: "NA-DE",
        ndpSetRef: "ndp-1",
        edition: "UNKNOWN_PENDING_CONFIRMATION",
        generationFamily: "UNKNOWN_PENDING_CONFIRMATION",
        restraintDescription: "pinned",
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
        nationalAnnexId: "NA-FR",
        ndpSetRef: "ndp-2",
        edition: "2005",
        generationFamily: "FIRST_GENERATION",
        restraintDescription: "fixed",
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
      "NATIONAL_ANNEX_CHANGED",
      "NDP_CHANGED",
      "EDITION_CHANGED",
      "GENERATION_CHANGED",
      "RESTRAINT_CHANGED",
    ]));

    const de = orchestrateEuSteelMemberDesign({
      designRecordId: "rec-de",
      createdAt: "2026-10-06T00:00:00.000Z",
      version: 1,
      capacityInput: capacityInput({ standardContext: euStandard("DE"), eurocodeContext: eurocodeContext("DE") }),
    });
    const fr = orchestrateEuSteelMemberDesign({
      designRecordId: "rec-fr",
      createdAt: "2026-10-06T00:00:00.000Z",
      version: 1,
      capacityInput: capacityInput({
        standardContext: euStandard("FR"),
        designContext: { ...capacityInput().designContext, standardContextRef: euStandard("FR").contextId },
        demand: { ...capacityInput().demand, standardContext: euStandard("FR") },
        eurocodeContext: eurocodeContext("FR"),
      }),
    });
    expect(de.nationalAnnexRef).toBe("NA-DE-EN1993-1-1");
    expect(fr.nationalAnnexRef).toBe("NA-FR-EN1993-1-1");
    expect(de.fingerprint).not.toEqual(fr.fingerprint);
    const reproduced = orchestrateEuSteelMemberDesign({
      designRecordId: "rec-de",
      createdAt: "2026-10-06T00:00:00.000Z",
      version: 1,
      capacityInput: capacityInput({ standardContext: euStandard("DE"), eurocodeContext: eurocodeContext("DE") }),
    });
    expect(reproduced.fingerprint).toEqual(de.fingerprint);

    const ukContext = {
      ...createConfiguredKnowledgeContext({
        contextId: "ctx-uk-en1993-eu8",
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
    const uk = orchestrateEuSteelMemberDesign({
      designRecordId: "rec-uk",
      createdAt: "2026-10-06T00:00:00.000Z",
      version: 1,
      capacityInput: capacityInput({
        standardContext: ukContext,
        designContext: { ...capacityInput().designContext, standardContextRef: ukContext.contextId },
        demand: { ...capacityInput().demand, standardContext: ukContext },
        eurocodeContext: eurocodeContext("GB", { jurisdictionProfileRef: "united-kingdom" }),
      }),
    });
    expect(uk.nationalAnnexRef).toBe("NA-GB-EN1993-1-1");
    expect(EUROCODE_NOT_HARDCODED_TO_EU_MEMBERSHIP).toBe(true);
  });

  it("keeps pack certification, AI, approval, and warnings fail-closed", () => {
    expect(EU_STEEL_PACK_CERTIFIED).toBe(false);
    expect(PACK_CERTIFICATION_NOT_OVERSTATED).toBe(true);
    assertEuPackCertificationNotOverstated();
    assertEurocodeConformanceNotValidatedWithoutEvidence(false);
    expect(() => deriveEuSteelProductClaim("CERTIFIED_DESIGN_CAPABILITY")).toThrow(/product claim exceeds evidence/);
    expect(deriveEuSteelProductClaim()).toBe("BENCHMARKED_ENGINEERING_REFERENCE_CAPABILITY");
    expect(() => deriveEuSteelReleaseClassification("GENERAL_AVAILABILITY")).toThrow(/release classification exceeds evidence/);
    expect(deriveEuSteelReleaseClassification()).toBe("INTERNAL_ENGINEERING_REFERENCE");
    expect(() => assertAiCannotPromoteEuMethodMaturity("AI", "BENCHMARKED", "CERTIFIED")).toThrow(/AI cannot promote method maturity/);
    expect(() => assertAiCannotCertifyEuConformance("AI")).toThrow(/AI cannot certify conformance/);
    expect(() => assertAiCannotInventEuServiceabilityCriterion("AI")).toThrow(/serviceability criterion/);
    expect(() => denyAiMechanicsToCodePromotion()).toThrow(/cannot promote mechanics/);
    expect(() => denyAiNationalAnnexChoice()).toThrow(/National Annex/);
    expect(() => denyAiNdpSupply()).toThrow(/NDP/);
    expect(() => denyAiBucklingCurveChoice()).toThrow(/buckling curve/);
    expect(() => assertAiCannotApproveEuMember("AI", "approved")).toThrow(/AI cannot promote result to approval/);
    assertEuApprovalRemainsSeparate();
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(NUMERICAL_VALIDATION_EQUALS_PROJECT_APPROVAL).toBe(false);
    expect(STANDARD_CONFORMANCE_EQUALS_PROJECT_APPROVAL).toBe(false);
    expect(SOFTWARE_CERTIFICATION_EQUALS_PROJECT_APPROVAL).toBe(false);
    expect(EU_OPTIMIZATION_ACCEPTS_UNDETERMINED).toBe(false);
    expect(() => assertCandidateFullEuMemberRecheck({
      candidateSectionRef: "ipe-200",
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
    expect(EU_STEEL_RESULT_WARNING_MODEL).toBe(true);
    expect(EU_STEEL_RESULT_WARNINGS).toEqual(expect.arrayContaining([
      "mechanics reference only",
      "Eurocode resistance not validated",
      "not approved for construction",
    ]));
    expect(applyEuMethodEngineeringConfirmation({
      methodRef: "EU_TENSION_GROSS_YIELD_MECHANICS",
      validationScope: "mechanics",
      reviewOutcome: "CONFIRMED",
      evidenceRefs: ["ev"],
      reviewedAt: "2026-10-06T00:00:00.000Z",
      reviewerAuthorityRef: "chartered-engineer",
      projectApprovalImplied: false,
      professionalCertificationImplied: false,
      softwareCertificationImplied: false,
    }).reviewOutcome).toBe("CONFIRMED");
    expect(EU_THIRD_PARTY_VALIDATION_AVAILABLE).toBe(false);
    expect(EU_THIRD_PARTY_VALIDATION_RECORDS).toEqual([]);
    expect(EU_THIRD_PARTY_VALIDATION_STATE).toBe("NOT_AVAILABLE");
    assertEuThirdPartyValidationModel();
    expect(EU_CONNECTION_DESIGN_VALIDATED).toBe(false);
    expect(MEMBER_VALIDATION_IMPLIES_CONNECTION_VALIDATION).toBe(false);
    expect(MEMBER_VALIDATION_IMPLIES_FOUNDATION_VALIDATION).toBe(false);
    expect(MEMBER_VALIDATION_IMPLIES_GLOBAL_FRAME_VALIDATION).toBe(false);
    expect(GENERAL_FEA_CAPABILITY_CLAIMED).toBe(false);
    expect(ANALYSIS_SCOPE_TRUTHFUL).toBe(true);
    expect(EU_FAIL_CLOSED_AUDIT).toBe("PASS");
    expect(EU_AI_AUTHORITY_AUDIT).toBe("PASS");
    expect(EMPLOYEE_BEHAVIOR_PROFILING).toBe(false);
  });

  it("keeps AU/US isolation, common mechanics consistency, and no false conformance claims", () => {
    expect(AU_TENSION_BENCHMARKS[0]?.expectedResult.value).toBe(EU_TENSION_BENCHMARKS[0]?.expectedResult.value);
    expect(COMMON_MECHANICS_AUDIT).toBe("PASS");
    expect(AU_METHOD_VALIDATION_INVENTORY).toHaveLength(18);
    expect(AU_STEEL_VALIDATION_MATRIX).toHaveLength(11);
    expect(IMPLEMENTED_INTERACTION_METHODS).toEqual([]);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(US_STEEL_IMPLEMENTATION_SUBPHASES[0]).toMatch(/US-1/);
    expect(EU_ONLY_STEEL_CORE).toBe(false);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(EU_STEEL_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_BOUNDED_METHODS");
    expect(EU_STEEL_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(EU_STEEL_PRODUCT_CLAIM_LEVEL).toBe("BENCHMARKED_ENGINEERING_REFERENCE_CAPABILITY");
    expect(EU_STEEL_RELEASE_CLASSIFICATION).toBe("INTERNAL_ENGINEERING_REFERENCE");
    expect(EU_BOUNDED_SUPPORTED_SCOPE).toMatch(/not complete Eurocode steel design/);
    expect(EU_STEEL_VALIDATION_MATRIX).toHaveLength(13);
    expect(EU_STEEL_VALIDATION_MATRIX.every((row) => row.certified === false && row.conformanceValidated === false && row.codeProfileImplemented === false)).toBe(true);
    expect(EU_VALIDATION_DEBT_REGISTER.length).toBeGreaterThanOrEqual(16);
    expect(EU_VALIDATION_PRIORITY_PLAN[0]?.priority).toBe("SAFETY_CRITICAL");
    expect(D1D_EU8_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(D1D_EU8_D0_RISK_DISPOSITION.REDUCED).toEqual(["D0-R01", "D0-R03"]);

    const steelSrc = readSteelTree();
    const docsDir = join(here, "../../../../docs/architecture/engineering-os");
    const euDocs = readdirSync(docsDir).filter((name) => name.startsWith("EOS_D1D_EU")).map((name) => readFileSync(join(docsDir, name), "utf8")).join("\n");
    const corpus = `${steelSrc}\n${euDocs}`;
    const positive = [
      /is EN 1993 compliant/i,
      /is Eurocode compliant/i,
      /EN1993_COMPLIANT\s*=\s*YES/i,
      /EU_STEEL_PACK_CERTIFIED\s*=\s*true/i,
      /EU_STEEL_PACK_CERTIFIED\s*=\s*YES/i,
      /is safe for construction/i,
      /is IFC approved/i,
      /is design approved/i,
    ];
    for (const pattern of positive) {
      expect(corpus).not.toMatch(pattern);
    }
    const mechanics = ["tension-force.ts", "euler.ts", "effective-length.ts", "bending.ts", "ltb.ts", "shear.ts"]
      .map((name) => readFileSync(join(here, "mechanics", name), "utf8")).join("\n");
    expect(mechanics).toMatch(/Not AS 4100|not AS 4100/);
    expect(mechanics).toMatch(/Not EN 1993|not EN 1993/);
    expect(mechanics).not.toMatch(/γM0\s*=|gamma_M0\s*=|φNt\s*=|chi\s*=\s*0\.|AISC 360 §/);
    const auSrc = ["inventory.ts", "matrix.ts"].map((name) => readFileSync(join(here, "au-validation", name), "utf8")).join("\n");
    expect(auSrc).not.toMatch(/EU_TENSION_GROSS_YIELD_MECHANICS|γM0/);
    const euVal = readFileSync(join(here, "eu-validation", "inventory.ts"), "utf8");
    expect(euVal).not.toMatch(/AUST300 default|0\.9 fy Ag|AS 4100 φ/);
    const globalCore = readFileSync(join(here, "properties.ts"), "utf8");
    expect(globalCore).not.toMatch(/EU_MEMBER_|AS 4100 φ|AISC 360/);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL).toEqual({ ready: true, implemented: false, standards: ["AISC 360"], loadContext: ["ASCE 7"] });
  });
});
