import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE,
  EU_C1C_R1_PARAMETER_VERSION,
  EU_C5_VMIN_EXPRESSION_ID,
  EU_C7_R1_PROFILE_VERSION,
  EU_C7_R1_REFERENCE_PROFILE_GENERATION,
  EU_C7_R1_REFERENCE_PROFILE_ID,
  EU_C7_R2_CRACK_WIDTH_METHOD_ID,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  type ConcreteMaterial,
  type EuC1cR1DeclaredNdpValue,
  type EurocodeConcreteProjectContext,
  type EurocodeNationalAnnex,
  type ReinforcementLayout,
  type ReinforcementMaterial,
  type StructuralDemandResult,
} from "@rtb/types";
import { CONCRETE_CAPABILITY_MANIFEST, D1E_INTERNAL_ROADMAP } from "./capability";
import { evaluateEuC5Punching, evaluateEuC5Shear, type EuC5EvaluateInput } from "./eu-c5/evaluate";
import { evaluateEuC7CrackWidth, type EuC7CrackWidthInput } from "./eu-c7/evaluate";
import { evaluateEuC7LongTermState, type EuC7LongTermInput } from "./eu-c7/long-term";
import {
  EU_C8_R1_REFERENCE_PROFILE_GENERATION,
  EU_C8_R1_REFERENCE_PROFILE_ID,
  EU_C8_R1_REFERENCE_PROFILE_VERSION,
  EU_C8_R3_SPACING_PROFILE_ID,
  EU_C8_R3_SPACING_PROFILE_VERSION,
  EU_C8_R4_ANCHORAGE_PROFILE_GENERATION,
  EU_C8_R4_ANCHORAGE_PROFILE_ID,
  EU_C8_R4_ANCHORAGE_PROFILE_VERSION,
  EU_C8_R4_PARENT_PROFILE_ID,
} from "./eu-c8";
import { evaluateEuC8BasicRequiredAnchorage, type EuC8BasicAnchorageInput } from "./eu-c8/anchorage-evaluate";
import { evaluateEuC8CoverAssembly, type EuC8CoverAssemblyInput } from "./eu-c8/evaluate";
import { evaluateEuC8MinClearSpacing, type EuC8MinClearSpacingInput } from "./eu-c8/spacing-evaluate";
import { evaluateEuConcreteFlexure } from "./eu-flexure/evaluate";
import { emptyResolverInput } from "./eu-standard";
import { rectangleSection } from "./section-mechanics";
import { governedProvenance } from "../structural-domain/catalog";
import { createConfiguredKnowledgeContext } from "../structural-domain/binding";
import type { EuC9R2SectionActions } from "./eu-c9/beam";
import {
  EU_C9_ORCHESTRATOR_REGISTRY,
  EU_C9_R4_C2_SLAB_APPLICABILITY,
  EU_C9_R4_C3_SLAB_APPLICABILITY,
  EU_C9_R4_C4_SLAB_APPLICABILITY,
  EU_C9_R4_C5_ONE_WAY_SHEAR_APPLICABILITY,
  EU_C9_R4_C5_TORSION_SLAB_APPLICABILITY,
  EU_C9_R4_C6_INVOKED_FOR_SLAB,
  EU_C9_R4_C6_SLAB_STATE,
  EU_C9_R4_CANONICAL_SLAB_MEMBER_TYPE,
  EU_C9_R4_ENGINEER_VALIDATED_SLAB_ORCHESTRATOR_COUNT,
  EU_C9_R4_FULL_STANDARD_COVERAGE,
  EU_C9_R4_IMPLEMENTED_SLAB_ORCHESTRATOR_COUNT,
  EU_C9_R4_NEW_ENGINEERING_FORMULA_IMPLEMENTED,
  EU_C9_R4_PUNCHING_METHOD_APPLICABILITY,
  EU_C9_R4_TWO_WAY_SLAB_BENDING_AUTOMATICALLY_ROUTED_TO_C4,
  EU_C9_R4_VALIDATION_DEBT_REDUCED_ITEMS,
  EU_C9_R4_VALIDATION_DEBT_REMAINING_ITEMS,
  EU_C9_R4_WALL_NEXT_FEASIBILITY,
  euC9R4SlabExecutionDagHasCycle,
  orchestrateEuC9R4SolidSlab,
  routeEuC9R4StripFlexure,
  type EuC9R4SlabInput,
  type EuC9R4Strip,
} from "./eu-c9/slab";

function zeroAxialActions(patch: Partial<EuC9R2SectionActions> = {}): EuC9R2SectionActions {
  return {
    axial: { status: "AXIAL_DIRECT", valueN: 0 },
    majorMoment: { status: "PRESENT", signedNm: 50000 },
    minorMoment: { status: "ABSENT" },
    ...patch,
  };
}

function slab(patch: Partial<EuC9R4SlabInput> = {}): EuC9R4SlabInput {
  return {
    memberId: "slab-1",
    memberType: "SLAB",
    slabForm: "SOLID",
    declaredEvaluationScope: ["STRIP_FLEXURE"],
    standardContext: { family: "EN1992", generation: "EN1992-1-1-GEN1", profileId: "EU-EN1992-1-1-GEN1" },
    geometryShape: "RECTANGULAR",
    materialRef: "c30",
    reinforcementRef: "b500",
    strip: { stripId: "strip-x", orientation: "X", widthMm: 1000 },
    actions: zeroAxialActions(),
    combinationId: "uls-1",
    ...patch,
  };
}

function shearDemand(value: number): EuC5EvaluateInput["demand"] {
  return {
    resultId: "d1c-slab-shear",
    capacityPresent: false,
    memberId: "slab-1",
    combinationId: "uls-1",
    shear: { value, unit: "N", locationM: 0, signed: value },
    torsion: { status: "NOT_IMPLEMENTED" },
  };
}

function quantity(value: number, unit: string) {
  return { value, unit, sourceRef: "declared-slab-ndp" };
}

function shearInput(value: number, patch: Partial<EuC5EvaluateInput> = {}): EuC5EvaluateInput {
  return {
    demand: shearDemand(value),
    generation: "FIRST_GENERATION",
    axialForceN: 0,
    designShearReinforcement: "NONE",
    effectiveDepth: quantity(530, "mm"),
    webWidth: quantity(300, "mm"),
    longitudinalTensionArea: quantity(0, "mm2"),
    fck: quantity(30, "MPa"),
    cRdC: quantity(0.12, "dimensionless"),
    vMinCoefficient: quantity(0.035, "dimensionless"),
    vMinExpressionId: EU_C5_VMIN_EXPRESSION_ID,
    ...patch,
  };
}

function punchingInput(patch: Partial<EuC5EvaluateInput> = {}): EuC5EvaluateInput {
  return shearInput(0, {
    punchingForce: quantity(705000, "N"),
    beta: quantity(1.15, "dimensionless"),
    effectiveDepth: quantity(164, "mm"),
    loadedWidth: quantity(500, "mm"),
    loadedDepth: quantity(500, "mm"),
    rhoX: quantity(0.0086, "dimensionless"),
    rhoY: quantity(0.0087, "dimensionless"),
    supportPosition: "INTERIOR",
    openingPresent: false,
    eccentricityMode: "EXPLICIT_BETA_ONLY",
    ...patch,
  });
}

function coverInput(): EuC8CoverAssemblyInput {
  return {
    profileId: EU_C8_R1_REFERENCE_PROFILE_ID,
    profileVersion: EU_C8_R1_REFERENCE_PROFILE_VERSION,
    generation: EU_C8_R1_REFERENCE_PROFILE_GENERATION,
    bondCover: { value: 40, unit: "mm" },
    durabilityCover: { value: 25, unit: "mm" },
    deviationAllowance: { value: 10, unit: "mm" },
    bondProvenanceRef: "bond-input",
    durabilityProvenanceRef: "durability-input",
    deviationProvenanceRef: "deviation-input",
  };
}

function spacingInput(diameterB = 16): EuC8MinClearSpacingInput {
  return {
    profileId: EU_C8_R1_REFERENCE_PROFILE_ID,
    spacingProfileId: EU_C8_R3_SPACING_PROFILE_ID,
    profileVersion: EU_C8_R3_SPACING_PROFILE_VERSION,
    generation: EU_C8_R1_REFERENCE_PROFILE_GENERATION,
    barIdA: "bar-a",
    barIdB: "bar-b",
    spacingContext: "HORIZONTAL_ADJACENT",
    reinforcementType: "INDIVIDUAL_DEFORMED_BAR",
    nominalBarDiameter: { value: 16, unit: "mm" },
    barA: { x: { value: 0, unit: "mm" }, y: { value: 0, unit: "mm" }, diameter: { value: 16, unit: "mm" } },
    barB: { x: { value: 100, unit: "mm" }, y: { value: 0, unit: "mm" }, diameter: { value: diameterB, unit: "mm" } },
    maximumAggregateSize: { value: 20, unit: "mm" },
    barDiameterCoefficient: 1,
    aggregateAllowance: { value: 5, unit: "mm" },
    barProvenanceRef: "bar-input",
    aggregateProvenanceRef: "aggregate-input",
    barDiameterCoefficientProvenanceRef: "k-input",
    aggregateAllowanceProvenanceRef: "allowance-input",
  };
}

function anchorageInput(check: boolean): EuC8BasicAnchorageInput {
  return {
    profileId: EU_C8_R4_ANCHORAGE_PROFILE_ID,
    parentProfileId: EU_C8_R4_PARENT_PROFILE_ID,
    profileVersion: EU_C8_R4_ANCHORAGE_PROFILE_VERSION,
    generation: EU_C8_R4_ANCHORAGE_PROFILE_GENERATION,
    barId: "bar-1",
    forceState: "TENSION",
    barShape: "STRAIGHT",
    reinforcementType: "DEFORMED_BAR",
    nominalBarDiameter: { value: 16, unit: "mm" },
    designSteelStress: {
      value: 400,
      unit: "MPa",
      provenanceRef: "sigma-input",
      authority: "PROJECT_DESIGN_STRESS",
      applicability: "tension bar at the supplied section",
      validationState: "EXPLICIT_GOVERNED_INPUT",
    },
    designBondStrength: {
      value: 2.5,
      unit: "MPa",
      provenanceRef: "fbd-input",
      authority: "PROJECT_DESIGN_BOND_STRENGTH",
      applicability: "supplied design bond strength for this bar",
      profileApplicability: EU_C8_R4_ANCHORAGE_PROFILE_ID,
      validationState: "EXPLICIT_GOVERNED_INPUT",
    },
    checkRequested: check,
    availableAnchorageLength: check ? { value: 10000, unit: "mm" } : null,
    criticalSectionRef: check ? "support-face" : null,
  };
}

function property(name: string, value: number, unit: string) {
  return { name, value, unit, provenanceRef: "c9-r4", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
}

const crackProvenance = {
  sourceEvidence: "c9-r4", sourceRevision: "0", model: null, tool: null, solver: null, version: "c9-r4",
  promptOrTemplate: null, timestamp: "2026-10-13T00:00:00.000Z", jurisdiction: "EU", standard: "EN 1992",
  calculationMethod: EU_C7_R2_CRACK_WIDTH_METHOD_ID, confidence: null, validationState: "NUMERICALLY_VALIDATED",
  humanReviewer: null, approvalState: "PENDING_HUMAN_ENGINEERING_REVIEW",
};

function crackConcrete(): ConcreteMaterial {
  return {
    materialRef: "c7-conc", designation: "C30", compressiveStrength: property("fc", 30, "MPa"), tensileStrength: null,
    elasticModulus: property("Ec", 33000, "MPa"), density: null, poissonRatio: null, age: null, strengthReferenceAge: null,
    materialClass: null, materialStandardRef: "project", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    testCertificateRef: "tc", environmentalMetadata: null, version: "c7", provenance: crackProvenance,
  };
}

function crackReinforcement(): ReinforcementMaterial {
  return {
    materialRef: "c7-reo", designation: "B500", yieldStrength: property("fy", 500, "MPa"), ultimateStrength: null,
    elasticModulus: property("Es", 200000, "MPa"), ductilityClass: null, productStandardRef: "project",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE", version: "c7", provenance: crackProvenance,
  };
}

function crackInput(overrides: Partial<EuC7CrackWidthInput> = {}): EuC7CrackWidthInput {
  return {
    profileId: EU_C7_R1_REFERENCE_PROFILE_ID,
    generation: EU_C7_R1_REFERENCE_PROFILE_GENERATION,
    profileVersion: EU_C7_R1_PROFILE_VERSION,
    nationalAnnexClaim: false,
    stale: false,
    sourceConflictUnresolved: false,
    memberType: "SOLID_SLAB",
    prestressed: false,
    geometry: rectangleSection("slab", 1000, 200, "slab"),
    combinationId: "sls-qp-1",
    combinationCategory: "quasi_permanent",
    combinationLimitState: "SLS",
    nServiceN: 0,
    mServiceNmm: 40e6,
    concrete: crackConcrete(),
    reinforcement: crackReinforcement(),
    reinforcementArea: property("As", 900, "mm2"),
    fctEffMPa: 2.9,
    fctEffProvenanceRef: "project-fct-eff",
    sigmaSMpa: 240,
    sigmaSLimitState: "SLS",
    sigmaSProvenanceRef: "governed-sls-cracked-stress",
    coverMm: 30,
    phiMm: 16,
    asMm2: 900,
    widthMm: 1000,
    hMm: 200,
    dMm: 170,
    xMm: 50,
    thicknessMm: null,
    surface: "HIGH_BOND",
    strainCase: "BENDING",
    k2Intermediate: null,
    duration: "LONG_TERM",
    wMaxMm: 0.4,
    wMaxRequirementId: "project-wmax",
    ...overrides,
  };
}

function longTermInput(overrides: Partial<EuC7LongTermInput> = {}): EuC7LongTermInput {
  return {
    profileId: EU_C7_R1_REFERENCE_PROFILE_ID,
    generation: EU_C7_R1_REFERENCE_PROFILE_GENERATION,
    profileVersion: EU_C7_R1_PROFILE_VERSION,
    stale: false,
    presence: "CREEP_AND_SHRINKAGE",
    concrete: crackConcrete(),
    materialRef: "c7-conc",
    sectionId: "slab-1",
    timeContextId: "t-qp-50y",
    referenceTime: "50y-quasi-permanent",
    loadingAgeDays: 28,
    evaluationAgeDays: 18250,
    expectedTimeContextId: null,
    authority: "HUMAN_AUTHORED_VALIDATED_RULE",
    phi: 2.4,
    phiProvenanceRef: "project-creep-note",
    phiApplicabilityRef: "slab-1-c30",
    shrinkageValue: 0.00032,
    shrinkageUnit: "STRAIN",
    shrinkageSignRepresentation: "SHRINKAGE_MAGNITUDE_POSITIVE",
    shrinkageProvenanceRef: "project-shrink-note",
    shrinkageApplicabilityRef: "slab-1-c30",
    calculateCreep: false,
    calculateShrinkage: false,
    ...overrides,
  };
}

function flexureNdp(value: number): EuC1cR1DeclaredNdpValue {
  return {
    value,
    unit: "dimensionless",
    sourceAuthority: EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE,
    provenanceRef: "test-only-non-conformance",
    ndpIdentity: "DECLARED_PROJECT_OVERRIDE",
    version: EU_C1C_R1_PARAMETER_VERSION,
  };
}

function flexureConcrete(): ConcreteMaterial {
  return {
    materialRef: "eu-c2-conc",
    designation: "C30",
    compressiveStrength: property("fc", 30, "MPa"),
    tensileStrength: null,
    elasticModulus: property("Ec", 33000, "MPa"),
    density: null,
    poissonRatio: null,
    age: null,
    strengthReferenceAge: null,
    materialClass: null,
    materialStandardRef: "project-certificate",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    testCertificateRef: "tc-c2",
    environmentalMetadata: null,
    version: "c2",
    provenance: governedProvenance({ jurisdiction: "eu", standard: "EN 1992", version: "c2.0" }),
  };
}

function flexureReinforcement(): ReinforcementMaterial {
  return {
    materialRef: "eu-c2-reo",
    designation: "B500B",
    yieldStrength: property("fy", 500, "MPa"),
    ultimateStrength: null,
    elasticModulus: property("Es", 200000, "MPa"),
    ductilityClass: null,
    productStandardRef: "project-certificate",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    version: "c2",
    provenance: governedProvenance({ jurisdiction: "eu", standard: "EN 1992", version: "c2.0" }),
  };
}

function flexureBar(id: string, xMm: number, yMm: number): ReinforcementLayout["bars"][number] {
  return {
    barId: id, designation: "H20", diameterMm: property("d", 20, "mm"), areaMm2: property("As", 314, "mm2"),
    count: 1, xMm, yMm, layerId: null, face: "bottom", direction: "longitudinal", spacingMm: null, groupId: null,
    materialRef: "eu-c2-reo", anchorageMetadata: null, lapMetadata: null, provenanceRef: "layout-c2",
  };
}

const flexureDemandContext = createConfiguredKnowledgeContext({
  contextId: "ctx-en1992-c9-r4",
  jurisdictionProfileRef: "eu-eea",
  standardFamily: "EN",
  standardCode: "EN 1992",
  edition: "UNKNOWN_PENDING_CONFIRMATION",
  materialScope: "concrete",
});

function flexureDemand(momentNm: number): StructuralDemandResult {
  return {
    resultId: "demand-slab",
    memberId: "slab-1",
    boundaryCondition: "SIMPLE_SIMPLE",
    spanM: 6,
    combinationId: "uls-1",
    loadCaseIds: ["g"],
    methods: ["SS_BEAM_UDL"],
    reactions: { startFyN: 0, endFyN: 0, startMzNm: 0, endMzNm: 0, unitForce: "N", unitMoment: "N.m" },
    shear: { value: 0, unit: "N", locationM: 0, signed: 0 },
    moment: { value: momentNm, unit: "N.m", locationM: 3, signed: momentNm },
    axial: { status: "NO_AXIAL_COMPONENTS", valueN: 0 },
    deflection: { status: "NOT_IMPLEMENTED", reason: "elastic D1C not long-term RC" },
    torsion: { status: "NOT_IMPLEMENTED" },
    stiffness: null,
    equilibriumResidual: { forceN: 0, momentNm: 0 },
    outputClass: "DETERMINISTIC_DEMAND",
    capacityPresent: false,
    designPassFailPresent: false,
    humanReviewRequired: true,
    approvalState: "not_approved",
    llmOriginated: false,
    standardContext: flexureDemandContext,
    toolRef: "d1c",
    toolVersion: "d1c",
    provenanceRef: governedProvenance({ jurisdiction: "eu-eea", standard: "EN 1992", version: "d1e-eu-c9-r4" }),
    inputEvidenceRefs: [{ evidenceId: "ev-d", sourceKind: "calculation", reference: "d1c" }],
    foundationReactionHandoff: { startFyN: 0, endFyN: 0, startMzNm: 0, endMzNm: 0, geotechnicalCapacityCalculated: false },
  };
}

function annex(country: string): EurocodeNationalAnnex {
  return {
    nationalAnnexId: `NA-${country}-EN1992-1-1`,
    countryCode: country,
    standardPartRef: "EN_1992_1_1",
    edition: "UNKNOWN_PENDING_CONFIRMATION",
    publicationDate: null,
    amendment: null,
    effectiveDate: null,
    status: "FRAMEWORK_ONLY",
    nationalParameterSetRef: `NDP-${country}-EN1992-1-1`,
    sourceAuthorityRef: "project-declared-annex-metadata",
    validationState: "FRAMEWORK_ONLY",
    generationFamily: "UNKNOWN_PENDING_CONFIRMATION",
  };
}

function project(country: string): EurocodeConcreteProjectContext {
  return {
    projectRef: `proj-${country}`,
    tenantId: "tenant-1",
    workspaceId: "ws-1",
    jurisdictionProfileRef: "eu-eea",
    countryCode: country,
    standardFamily: "EN 1992",
    standardGeneration: "UNKNOWN_PENDING_CONFIRMATION",
    standardEdition: "UNKNOWN_PENDING_CONFIRMATION",
    amendmentState: "UNKNOWN_PENDING_CONFIRMATION",
    standardPartRefs: ["EN_1992_1_1"],
    nationalAnnexRef: `NA-${country}-EN1992-1-1`,
    nationalAnnexSet: [annex(country)],
    ndpSetRef: `NDP-${country}-EN1992-1-1`,
    ndpSet: [],
    concreteMaterialStandardRefs: ["EN 206"],
    reinforcementMaterialStandardRefs: ["EN 10080"],
    loadStandardContextRef: "EN 1990/EN 1991",
    durabilityContextRef: null,
    serviceabilityContextRef: null,
    projectOverrideRefs: [],
    authorityRefs: ["VALIDATED_ENGINEERING_REFERENCE"],
    technicalBasisRefs: ["d1e-eu-c2"],
    provenance: governedProvenance({ jurisdiction: "eu-eea", standard: "EN 1992", version: "d1e-eu-c9-r4" }),
    validationState: "STANDARD_BINDING_FRAMEWORK",
    conformanceState: "INTENDED_PROFILE",
    workspaceGlobalAnnexId: null,
    statutoryEuMembershipRequired: false,
    statutoryEuComplianceClaimed: false,
    internationalContractualUse: false,
  };
}

function flexurePayload(momentNm = 50000) {
  return {
    methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
    axis: "MAJOR_AXIS" as const,
    geometry: rectangleSection("strip-x", 300, 500, "slab"),
    layout: {
      layoutId: "lay-slab",
      bars: [flexureBar("b1", 50, 50), flexureBar("b2", 150, 50), flexureBar("b3", 250, 50)],
      groups: [],
      layers: [],
      transverse: [],
      provenanceRef: "layout-slab",
    },
    concrete: flexureConcrete(),
    reinforcement: flexureReinforcement(),
    demand: flexureDemand(momentNm),
    resolverInput: emptyResolverInput({ projectContext: project("DE") }),
    constitutiveContext: {
      nationalAnnexRef: "DECLARED_TEST_NA",
      gamma_c: flexureNdp(1.5),
      gamma_s: flexureNdp(1.15),
      alpha_cc: flexureNdp(1),
      testOnlyNonConformance: true,
    },
  };
}

describe("EOS-D1E-EU-C9-R4 bounded solid slab orchestration", () => {
  it("keeps strip checking distinct from slab analysis", () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "eu-c9/slab.ts"), "utf8");
    expect(EU_C9_R4_CANONICAL_SLAB_MEMBER_TYPE).toBe("SLAB");
    expect(EU_C9_R4_C2_SLAB_APPLICABILITY).toBe("RECTANGULAR_SECTION_PURE_FLEXURE_ZERO_AXIAL");
    expect(EU_C9_R4_C3_SLAB_APPLICABILITY).toContain("NOT_SLAB_MEMBRANE_ANALYSIS");
    expect(EU_C9_R4_C4_SLAB_APPLICABILITY).toContain("NOT_TWO_WAY_SLAB_SOLVER");
    expect(EU_C9_R4_C5_ONE_WAY_SHEAR_APPLICABILITY).toBe("ZERO_AXIAL_WITHOUT_DESIGN_SHEAR_REINFORCEMENT");
    expect(EU_C9_R4_PUNCHING_METHOD_APPLICABILITY).toBe("INTERIOR_RECTANGULAR_LOADED_AREA_ONLY");
    expect(EU_C9_R4_C5_TORSION_SLAB_APPLICABILITY).toContain("NOT_INVOKED_FOR_SLAB_STRIP");
    expect(EU_C9_R4_C6_SLAB_STATE).toBe("NOT_APPLICABLE");
    expect(EU_C9_R4_C6_INVOKED_FOR_SLAB).toBe(false);
    expect(EU_C9_R4_TWO_WAY_SLAB_BENDING_AUTOMATICALLY_ROUTED_TO_C4).toBe(false);
    expect(EU_C9_R4_NEW_ENGINEERING_FORMULA_IMPLEMENTED).toBe(false);
    expect(source.includes("evaluateEuC3")).toBe(false);
    expect(source.includes("evaluateEuC4")).toBe(false);
    expect(source.includes("evaluateEuC6")).toBe(false);
    expect(source.includes("evaluateEuC5Torsion")).toBe(false);
    expect(source.includes("fyd")).toBe(false);
    expect(source.includes("Math.")).toBe(false);
    expect(source.includes("releaseEligible")).toBe(false);
    expect(source.includes("perimeter")).toBe(false);
    expect(euC9R4SlabExecutionDagHasCycle()).toBe(false);
    expect(orchestrateEuC9R4SolidSlab(slab({ memberType: "BEAM" })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R4SolidSlab(slab({ slabForm: "RIBBED" })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: [] })).overallState).toBe("MEMBER_UNDETERMINED");
    expect(orchestrateEuC9R4SolidSlab(slab({ standardContext: { family: "OTHER", generation: "EN1992-1-1-GEN1", profileId: "x" } })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R4SolidSlab(slab({ standardContext: { family: "EN1992", generation: "GEN2", profileId: "x" } })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R4SolidSlab(slab({ materialRef: null })).overallState).toBe("MEMBER_UNDETERMINED");
    expect(orchestrateEuC9R4SolidSlab(slab({ reinforcementRef: null })).overallState).toBe("MEMBER_UNDETERMINED");
  });

  it("routes one explicit strip to C2 and refuses invented slab actions", () => {
    const missingWidth = orchestrateEuC9R4SolidSlab(slab({ strip: { stripId: "strip-x", orientation: "X", widthMm: 0 } }));
    expect(missingWidth.overallState).toBe("MEMBER_UNDETERMINED");
    expect(missingWidth.unresolvedInputs).toContain("STRIP_WIDTH");
    const missingOrientation = orchestrateEuC9R4SolidSlab(slab({
      strip: { stripId: "strip-x", widthMm: 1000 } as EuC9R4Strip,
      globalSlabWidthMm: 1000,
    }));
    expect(missingOrientation.overallState).toBe("MEMBER_UNDETERMINED");
    expect(missingOrientation.unresolvedInputs).toContain("STRIP_ORIENTATION_OR_WIDTH");
    expect(missingOrientation.stripWidthMm).toBeNull();
    const missingMoment = orchestrateEuC9R4SolidSlab(slab({ actions: zeroAxialActions({ majorMoment: { status: "ABSENT" } }) }));
    expect(missingMoment.overallState).toBe("MEMBER_UNDETERMINED");
    expect(missingMoment.unresolvedInputs).toContain("GOVERNED_MOMENT");
    const orthogonal = routeEuC9R4StripFlexure({
      strip: { stripId: "strip-x", orientation: "X", widthMm: 1000 },
      actions: zeroAxialActions({ minorMoment: { status: "PRESENT", signedNm: 20000 } }),
    });
    expect(orthogonal.state).toBe("NOT_IMPLEMENTED");
    expect(orthogonal.executesC4).toBe(false);
    expect(orthogonal.methodId).toBeNull();
    const routed = orchestrateEuC9R4SolidSlab(slab({
      actions: zeroAxialActions({ majorMoment: { status: "PRESENT", signedNm: 20000 }, minorMoment: { status: "PRESENT", signedNm: 10000 } }),
    }));
    expect(routed.overallState).toBe("MEMBER_INCOMPLETE");
    expect(routed.executedCapabilityIds).toEqual([]);
    const twoWay = orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: ["TWO_WAY_ANALYSIS"] }));
    expect(twoWay.overallState).toBe("MEMBER_INCOMPLETE");
    expect(twoWay.nodes[0]?.capabilityId).toBe("TWO_WAY_SLAB_ANALYSIS");
    const membrane = orchestrateEuC9R4SolidSlab(slab({
      actions: zeroAxialActions({ axial: { status: "AXIAL_DIRECT", valueN: 1000 } }),
    }));
    expect(membrane.overallState).toBe("MEMBER_INCOMPLETE");
    expect(membrane.unresolvedInputs).toContain("MEMBRANE_ACTION_UNSUPPORTED");
    const yRoute = routeEuC9R4StripFlexure({
      strip: { stripId: "strip-y", orientation: "Y", widthMm: 1000 },
      actions: zeroAxialActions({ majorMoment: { status: "ABSENT" }, minorMoment: { status: "PRESENT", signedNm: 40000 } }),
    });
    expect(yRoute.methodId).toBe("EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR");
    expect(yRoute.axis).toBe("MINOR_AXIS");
    expect(yRoute.executesC2).toBe(true);
    expect(orchestrateEuC9R4SolidSlab(slab({ generateActions: true })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R4SolidSlab(slab({ inventStripWidth: true })).overallState).toBe("ORCHESTRATION_BLOCKED");
  });

  it("keeps one-way shear and punching inside the existing methods", () => {
    const direct = evaluateEuC5Shear(shearInput(60000));
    const shear = orchestrateEuC9R4SolidSlab(slab({
      declaredEvaluationScope: ["ONE_WAY_SHEAR"],
      actions: zeroAxialActions({ majorMoment: { status: "ABSENT" } }),
      shear: shearInput(60000),
    }));
    expect(shear.nodes[0]?.executionStatus).toBe(direct.checkState === "CHECK_SATISFIED" ? "SATISFIED" : "NOT_SATISFIED");
    expect(shear.nodes[0]?.numericalResult).toBe(direct.resistance?.value);
    expect(shear.executedCapabilityIds).toEqual(["EU_RC_SHEAR_EN1992_WITHOUT_TRANSVERSE_REINFORCEMENT"]);
    const unsupported = orchestrateEuC9R4SolidSlab(slab({
      declaredEvaluationScope: ["ONE_WAY_SHEAR"],
      actions: zeroAxialActions({ axial: { status: "AXIAL_DIRECT", valueN: 1000 } }),
      shear: shearInput(60000),
    }));
    expect(unsupported.overallState).toBe("MEMBER_INCOMPLETE");
    expect(unsupported.executedCapabilityIds).toEqual([]);
    const missingShear = orchestrateEuC9R4SolidSlab(slab({
      declaredEvaluationScope: ["ONE_WAY_SHEAR"],
      actions: zeroAxialActions({ majorMoment: { status: "ABSENT" } }),
    }));
    expect(missingShear.overallState).toBe("MEMBER_UNDETERMINED");
    expect(missingShear.unresolvedInputs).toContain("SHEAR_DEMAND");
    expect(orchestrateEuC9R4SolidSlab(slab({ generateShearFromLoads: true })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R4SolidSlab(slab({ inferSupportReaction: true })).overallState).toBe("ORCHESTRATION_BLOCKED");

    const punchingDirect = evaluateEuC5Punching(punchingInput());
    const punching = orchestrateEuC9R4SolidSlab(slab({
      declaredEvaluationScope: ["PUNCHING"],
      supportId: "column-c1",
      punching: punchingInput(),
    }));
    expect(punching.nodes[0]?.capabilityId).toBe("D1E.EU.C5.PUNCHING");
    expect(punching.nodes[0]?.numericalResult).toBe(punchingDirect.resistance?.value);
    expect(punching.nodes[0]?.executionStatus).toBe("NOT_SATISFIED");
    expect(punching.overallState).toBe("MEMBER_NOT_SATISFIED");
    expect(punching.warnings).toContain("PUNCHING_CHECK_IS_NOT_GLOBAL_SLAB_ANALYSIS");
    const edge = orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: ["PUNCHING"], punching: punchingInput({ supportPosition: "EDGE" }) }));
    const corner = orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: ["PUNCHING"], punching: punchingInput({ supportPosition: "CORNER" }) }));
    const opening = orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: ["PUNCHING"], punching: punchingInput({ openingPresent: true }) }));
    expect(edge.overallState).toBe("MEMBER_INCOMPLETE");
    expect(corner.overallState).toBe("MEMBER_INCOMPLETE");
    expect(opening.overallState).toBe("MEMBER_INCOMPLETE");
    expect(edge.executedCapabilityIds).toEqual([]);
    const missingForce = orchestrateEuC9R4SolidSlab(slab({
      declaredEvaluationScope: ["PUNCHING"],
      punching: punchingInput({ punchingForce: null }),
    }));
    expect(missingForce.overallState).toBe("MEMBER_UNDETERMINED");
    expect(missingForce.unresolvedInputs).toContain("PUNCHING_DEMAND");
    const missingSupport = orchestrateEuC9R4SolidSlab(slab({
      declaredEvaluationScope: ["PUNCHING"],
      punching: punchingInput({ supportPosition: undefined }),
    }));
    expect(missingSupport.overallState).toBe("MEMBER_UNDETERMINED");
    expect(missingSupport.unresolvedInputs).toContain("SUPPORT_GEOMETRY");
    expect(orchestrateEuC9R4SolidSlab(slab({ inventPunchingDemand: true })).overallState).toBe("ORCHESTRATION_BLOCKED");
    const both = orchestrateEuC9R4SolidSlab(slab({
      declaredEvaluationScope: ["ONE_WAY_SHEAR", "PUNCHING"],
      actions: zeroAxialActions({ majorMoment: { status: "ABSENT" } }),
      shear: shearInput(60000),
      punching: punchingInput(),
    }));
    expect(both.checkNodes.map((item) => item.capabilityId)).toEqual(["D1E.EU.C5.SHEAR", "D1E.EU.C5.PUNCHING"]);
    expect(both.checkNodes[0]?.numericalResult).not.toBe(both.checkNodes[1]?.numericalResult);
  });

  it("routes crack width, detailing, and deferred requests without promoting them", () => {
    expect(orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: ["C6_SECOND_ORDER"] })).nodes[0]?.executionStatus).toBe("NOT_APPLICABLE");
    expect(orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: ["C6_SECOND_ORDER"] })).executedCapabilityIds).toEqual([]);
    expect(orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: ["TORSION"] })).nodes[0]?.executionStatus).toBe("NOT_APPLICABLE");
    const crackDirect = evaluateEuC7CrackWidth(crackInput());
    const crack = orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: ["SLS_CRACK_WIDTH"], crackWidth: crackInput() }));
    expect(crack.nodes[0]?.numericalResult).toBe(crackDirect.crackWidthMm);
    expect(crack.nodes[0]?.executionStatus).toBe(crackDirect.checkState === "SATISFIED" ? "SATISFIED" : "NOT_SATISFIED");
    const missingSigma = orchestrateEuC9R4SolidSlab(slab({
      declaredEvaluationScope: ["SLS_CRACK_WIDTH"],
      crackWidth: crackInput({ sigmaSMpa: null }),
    }));
    expect(missingSigma.overallState).toBe("MEMBER_UNDETERMINED");
    expect(missingSigma.unresolvedInputs).toContain("sigmaS");
    const deflection = orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: ["DEFLECTION"] }));
    expect(deflection.nodes[0]?.executionStatus).toBe("DEFERRED");
    expect(deflection.overallState).toBe("MEMBER_INCOMPLETE");
    expect(deflection.evaluationCompleteForDeclaredScope).toBe(false);
    const creep = orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: ["CALCULATED_CREEP"] }));
    expect(creep.overallState).toBe("MEMBER_INCOMPLETE");
    expect(creep.nodes[0]?.capabilityId).toBe("CALCULATED_CREEP");
    const coverDirect = evaluateEuC8CoverAssembly(coverInput());
    const cover = orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: ["COVER_REQUIREMENT"], cover: coverInput() }));
    expect(cover.nodes[0]?.nodeRole).toBe("CALCULATION");
    expect(cover.nodes[0]?.numericalResult).toBe(coverDirect.nominalCoverMm);
    expect(cover.overallState).toBe("MEMBER_UNDETERMINED");
    expect(orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: ["PROVIDED_COVER_COMPLIANCE"] })).overallState).toBe("MEMBER_INCOMPLETE");
    const spacingDirect = evaluateEuC8MinClearSpacing(spacingInput());
    const spacing = orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: ["REINFORCEMENT_SPACING"], spacing: spacingInput() }));
    expect(spacing.nodes[0]?.numericalResult).toBe(spacingDirect.measuredClearSpacingMm);
    expect(spacing.overallState).toBe("MEMBER_SATISFIED_FOR_EXECUTED_BOUNDED_SCOPE");
    const unequal = orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: ["REINFORCEMENT_SPACING"], spacing: spacingInput(20) }));
    expect(unequal.nodes[0]?.executionStatus).toBe("NOT_IMPLEMENTED");
    expect(unequal.executedCapabilityIds).toEqual([]);
    const crossing = orchestrateEuC9R4SolidSlab(slab({
      declaredEvaluationScope: ["REINFORCEMENT_SPACING"],
      spacing: spacingInput(),
      orthogonalBarCrossing: true,
    }));
    expect(crossing.nodes[0]?.executionStatus).toBe("NOT_IMPLEMENTED");
    const layers = orchestrateEuC9R4SolidSlab(slab({
      declaredEvaluationScope: ["REINFORCEMENT_SPACING"],
      spacing: { ...spacingInput(), spacingContext: "VERTICAL_LAYER_ADJACENT" },
    }));
    expect(layers.unresolvedInputs).toContain("BAR_LAYER");
    const anchorageDirect = evaluateEuC8BasicRequiredAnchorage(anchorageInput(false));
    const calculation = orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: ["BASIC_ANCHORAGE"], anchorage: anchorageInput(false) }));
    expect(calculation.nodes[0]?.nodeRole).toBe("CALCULATION");
    expect(calculation.nodes[0]?.numericalResult).toBe(anchorageDirect.basicRequiredAnchorageLengthMm);
    expect(calculation.overallState).toBe("MEMBER_UNDETERMINED");
    const checkDirect = evaluateEuC8BasicRequiredAnchorage(anchorageInput(true));
    const check = orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: ["BASIC_ANCHORAGE"], anchorage: anchorageInput(true) }));
    expect(check.nodes[0]?.nodeRole).toBe("CHECK");
    expect(check.nodes[0]?.numericalResult).toBe(checkDirect.basicRequiredAnchorageLengthMm);
    expect(check.overallState).toBe(checkDirect.checkState === "SATISFIED" ? "MEMBER_SATISFIED_FOR_EXECUTED_BOUNDED_SCOPE" : "MEMBER_NOT_SATISFIED");
    expect(orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: ["DESIGN_ANCHORAGE"] })).overallState).toBe("MEMBER_INCOMPLETE");
    expect(orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: ["LAPS"] })).overallState).toBe("MEMBER_INCOMPLETE");
    const contextDirect = evaluateEuC7LongTermState(longTermInput());
    const context = orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: ["LONG_TERM_CONTEXT"], longTerm: longTermInput() }));
    expect(context.nodes[0]?.nodeRole).toBe("CONTEXT");
    expect(context.nodes[0]?.executionStatus).toBe(contextDirect.accepted ? "AVAILABLE" : "UNDETERMINED");
    expect(context.overallState).toBe("MEMBER_UNDETERMINED");
  });

  it("aggregates failures ahead of deferred work and invalidates stale results", () => {
    const failed = orchestrateEuC9R4SolidSlab(slab({
      declaredEvaluationScope: ["ONE_WAY_SHEAR", "LAPS"],
      actions: zeroAxialActions({ majorMoment: { status: "ABSENT" } }),
      shear: shearInput(120000),
    }));
    expect(failed.overallState).toBe("MEMBER_NOT_SATISFIED");
    expect(failed.failedChecks).toContain("D1E.EU.C5.SHEAR");
    expect(failed.deferredCapabilities).toContain("LAPS");
    const first = orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: ["REINFORCEMENT_SPACING"], spacing: spacingInput() }));
    const again = orchestrateEuC9R4SolidSlab(slab({ declaredEvaluationScope: ["REINFORCEMENT_SPACING"], spacing: spacingInput() }));
    expect(again.memberFingerprint).toBe(first.memberFingerprint);
    const stale = orchestrateEuC9R4SolidSlab(slab({
      declaredEvaluationScope: ["REINFORCEMENT_SPACING"],
      spacing: spacingInput(),
      strip: { stripId: "strip-x", orientation: "X", widthMm: 1200 },
      priorResultFingerprint: first.memberFingerprint,
    }));
    expect(stale.memberFingerprint).not.toBe(first.memberFingerprint);
    expect(stale.staleReuseRejected).toBe(true);
    expect(first.fullStandardCoverage).toBe(false);
    expect(EU_C9_R4_FULL_STANDARD_COVERAGE).toBe(false);
    expect(EU_C9_R4_IMPLEMENTED_SLAB_ORCHESTRATOR_COUNT).toBe(1);
    expect(EU_C9_R4_ENGINEER_VALIDATED_SLAB_ORCHESTRATOR_COUNT).toBe(0);
    expect(EU_C9_R4_WALL_NEXT_FEASIBILITY).toBe("FEASIBLE_SECTION_ONLY");
    expect([...EU_C9_R4_VALIDATION_DEBT_REDUCED_ITEMS]).toEqual([
      "C9_SOLID_SLAB_RUNTIME_ORCHESTRATOR",
      "C9_SOLID_SLAB_ROUTING_VALIDATION",
      "C9_SOLID_SLAB_AGGREGATION_VALIDATION",
    ]);
    expect(EU_C9_R4_VALIDATION_DEBT_REMAINING_ITEMS).toContain("TWO_WAY_SLAB_ANALYSIS");
    expect(EU_C9_R4_VALIDATION_DEBT_REMAINING_ITEMS).toContain("SLAB_DEFLECTION");
    expect(EU_C9_ORCHESTRATOR_REGISTRY.map((row) => row.orchestratorId)).toEqual([
      "EU_RC_BEAM_ORCHESTRATION_EN1992_REFERENCE",
      "EU_RC_COLUMN_ORCHESTRATION_EN1992_REFERENCE",
      "EU_RC_SOLID_SLAB_ORCHESTRATION_EN1992_REFERENCE",
    ]);
    expect(CONCRETE_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1E.EU.C9.SOLID_SLAB_ORCHESTRATION")?.implementationState).toBe("IMPLEMENTED_NUMERICALLY_VALIDATED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C9-R4-SOLID-SLAB-ORCHESTRATION")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C9-R5-WALL-ORCHESTRATION")?.status).toBe("NOT_STARTED");
    expect(EU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
  });

  it("matches a direct C2 strip flexure call", () => {
    const payload = flexurePayload();
    const direct = evaluateEuConcreteFlexure(payload);
    const result = orchestrateEuC9R4SolidSlab(slab({
      strip: { stripId: "strip-x", orientation: "X", widthMm: 300 },
      actions: zeroAxialActions({ majorMoment: { status: "PRESENT", signedNm: 50000 } }),
      flexure: payload,
    }));
    expect(direct.checkState === "CHECK_SATISFIED" || direct.checkState === "CHECK_NOT_SATISFIED").toBe(true);
    expect(typeof direct.designRuleUtilization).toBe("number");
    expect(result.nodes[0]?.numericalResult).toBe(direct.designRuleUtilization);
    expect(result.nodes[0]?.resultFingerprint).toBe(direct.resultFingerprint);
    expect(result.executedCapabilityIds).toEqual(["EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR"]);
    expect(result.fullStandardCoverage).toBe(false);
  });
});
