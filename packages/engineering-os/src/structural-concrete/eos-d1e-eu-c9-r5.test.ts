import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE,
  EU_C1C_R1_PARAMETER_VERSION,
  EU_C3_METHOD_IDS,
  EU_C4_METHOD_IDS,
  EU_C7_R1_PROFILE_VERSION,
  EU_C7_R1_REFERENCE_PROFILE_GENERATION,
  EU_C7_R1_REFERENCE_PROFILE_ID,
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
import { evaluateEuC3DemandPointCheck } from "./eu-c3/evaluate";
import { evaluateEuC4DemandPointCheck } from "./eu-c4/evaluate";
import { evaluateEuConcreteFlexure, type EuConcreteFlexureInput } from "./eu-flexure/evaluate";
import { emptyResolverInput } from "./eu-standard";
import { rectangleSection } from "./section-mechanics";
import { governedProvenance } from "../structural-domain/catalog";
import { createConfiguredKnowledgeContext } from "../structural-domain/binding";
import type { EuC9R2SectionActions } from "./eu-c9/beam";
import {
  AI_ACTION_EFFECT_AUTHORITY,
  AI_BOUNDARY_ELEMENT_AUTHORITY,
  AI_C9_ASSISTANCE_ADVISORY_ONLY,
  AI_CHECK_OVERRIDE_AUTHORITY,
  AI_CONFORMANCE_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_MEMBER_TYPE_AUTHORITY,
  AI_NDP_AUTHORITY,
  AI_REQUIRED_CHECK_SELECTION_AUTHORITY,
  AI_WALL_AXIS_AUTHORITY,
  AI_WALL_SHEAR_AUTHORITY,
  AI_WALL_STABILITY_AUTHORITY,
  C9_WALL_ORCHESTRATION_EQUALS_STANDARD_CONFORMANCE,
  CAPABILITY_MANIFEST_WALL_CLAIM_SECTION_ONLY,
  EU_C9_IMPLEMENTED_MEMBER_ORCHESTRATOR_INVENTORY,
  EU_C9_ORCHESTRATOR_REGISTRY,
  EU_C9_R5_BOUNDARY_ELEMENT_REQUEST_CAN_PASS,
  EU_C9_R5_C6_INVOKED_FOR_WALL,
  EU_C9_R5_C6_WALL_APPLICABILITY,
  EU_C9_R5_CANONICAL_WALL_TYPE,
  EU_C9_R5_CLOSEOUT_NEXT_FEASIBILITY,
  EU_C9_R5_ENGINEER_VALIDATED_WALL_ORCHESTRATOR_COUNT,
  EU_C9_R5_ENGINEER_VALIDATION_STATE,
  EU_C9_R5_FULL_STANDARD_COVERAGE,
  EU_C9_R5_IMPLEMENTED_WALL_ORCHESTRATOR_COUNT,
  EU_C9_R5_NEW_ENGINEERING_FORMULA_IMPLEMENTED,
  EU_C9_R5_PRODUCT_SUBCLAIM,
  EU_C9_R5_R1_WALL_CAPABILITY_MATRIX_RECHECK,
  EU_C9_R5_VALIDATION_DEBT_REDUCED_ITEMS,
  EU_C9_R5_VALIDATION_DEBT_REMAINING_ITEMS,
  EU_C9_R5_WALL_SHEAR_RUNTIME_AVAILABLE,
  LLM_C9_NUMERICAL_AUTHORITY,
  NUMERICAL_WALL_ORCHESTRATION_VALIDATION_EQUALS_ENGINEER_VALIDATION,
  euC9R5WallExecutionDagHasCycle,
  orchestrateEuC9R5WallSection,
  routeEuC9R5WallSection,
  wallSectionMatchesGeometry,
  type EuC9R5WallInput,
} from "./eu-c9/wall";

function flexureActions(patch: Partial<EuC9R2SectionActions> = {}): EuC9R2SectionActions {
  return {
    axial: { status: "AXIAL_DIRECT", valueN: 0 },
    majorMoment: { status: "PRESENT", signedNm: 50000 },
    minorMoment: { status: "ABSENT" },
    ...patch,
  };
}

function wall(patch: Partial<EuC9R5WallInput> = {}): EuC9R5WallInput {
  return {
    memberId: "wall-1",
    memberType: "WALL",
    declaredEvaluationScope: ["SECTION_PURE_FLEXURE"],
    standardContext: { family: "EN1992", generation: "EN1992-1-1-GEN1", profileId: "EU-EN1992-1-1-GEN1" },
    geometryShape: "RECTANGULAR",
    materialRef: "c30",
    reinforcementRef: "b500",
    wallSection: { wallLengthMm: 300, wallThicknessMm: 500, lengthMapsTo: "SECTION_WIDTH" },
    axisMapping: { majorAxisRole: "IN_PLANE", minorAxisRole: "OUT_OF_PLANE" },
    actions: flexureActions(),
    combinationId: "uls-1",
    reinforcementFaceId: "FACE_EXPLICIT",
    ...patch,
  };
}

function property(name: string, value: number, unit: string) {
  return { name, value, unit, provenanceRef: "c9-r5", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
}

function ndp(value: number): EuC1cR1DeclaredNdpValue {
  return {
    value,
    unit: "dimensionless",
    sourceAuthority: EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE,
    provenanceRef: "test-only-non-conformance",
    ndpIdentity: "DECLARED_PROJECT_OVERRIDE",
    version: EU_C1C_R1_PARAMETER_VERSION,
  };
}

function context() {
  return {
    nationalAnnexRef: "DECLARED_TEST_NA",
    gamma_c: ndp(1.5),
    gamma_s: ndp(1.15),
    alpha_cc: ndp(1),
    testOnlyNonConformance: true,
  };
}

const provenance = {
  sourceEvidence: "c9-r5",
  sourceRevision: "0",
  model: null,
  tool: null,
  solver: null,
  version: "c9-r5",
  promptOrTemplate: null,
  timestamp: "2026-10-13T00:00:00.000Z",
  jurisdiction: "EU",
  standard: "EN 1992",
  calculationMethod: "EU_RC_WALL_SECTION_ORCHESTRATION_EN1992_REFERENCE",
  confidence: null,
  validationState: "NUMERICALLY_VALIDATED",
  humanReviewer: null,
  approvalState: "PENDING_HUMAN_ENGINEERING_REVIEW",
};

function concreteMaterial(): ConcreteMaterial {
  return {
    materialRef: "c9-conc",
    designation: "C30",
    compressiveStrength: property("fc", 30, "MPa"),
    tensileStrength: null,
    elasticModulus: property("Ec", 33000, "MPa"),
    density: null,
    poissonRatio: null,
    age: null,
    strengthReferenceAge: null,
    materialClass: null,
    materialStandardRef: "project",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    testCertificateRef: "tc",
    environmentalMetadata: null,
    version: "c9",
    provenance: provenance as never,
  };
}

function reinforcementMaterial(): ReinforcementMaterial {
  return {
    materialRef: "c9-reo",
    designation: "B500",
    yieldStrength: property("fy", 500, "MPa"),
    ultimateStrength: null,
    elasticModulus: property("Es", 200000, "MPa"),
    ductilityClass: null,
    productStandardRef: "project",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    version: "c9",
    provenance: provenance as never,
  };
}

function layout(): ReinforcementLayout {
  const bar = (id: string, yMm: number): ReinforcementLayout["bars"][number] => ({
    barId: id,
    designation: "H20",
    diameterMm: property("d", 20, "mm"),
    areaMm2: property("As", 314, "mm2"),
    count: 1,
    xMm: 150,
    yMm,
    layerId: null,
    face: yMm < 250 ? "bottom" : "top",
    direction: "longitudinal",
    spacingMm: null,
    groupId: null,
    materialRef: "c9-reo",
    anchorageMetadata: null,
    lapMetadata: null,
    provenanceRef: "c9",
  });
  return { layoutId: "c9-lay", bars: [bar("b", 50), bar("t", 450)], groups: [], layers: [], transverse: [], provenanceRef: "c9" };
}

function demand(momentNm: number, axialN: number): StructuralDemandResult {
  return {
    resultId: "demand-wall",
    capacityPresent: false,
    memberId: "wall-1",
    moment: { value: momentNm < 0 ? -momentNm : momentNm, unit: "N.m", locationM: 0, signed: momentNm },
    axial: { valueN: axialN, unit: "N", method: "AXIAL_DIRECT" },
  } as StructuralDemandResult;
}

function c3Payload(momentNm: number, axialN: number) {
  return {
    methodId: EU_C3_METHOD_IDS[0],
    axis: "MAJOR_AXIS" as const,
    momentSign: "POSITIVE" as const,
    geometry: rectangleSection("wall", 300, 500, "wall"),
    layout: layout(),
    concrete: concreteMaterial(),
    reinforcement: reinforcementMaterial(),
    context: context(),
    targetAxialN: axialN,
    resolutionX: 8,
    resolutionY: 8,
    provenanceRef: "wall-c3",
    demand: demand(momentNm, axialN),
  };
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

function anchorageInput(check: boolean, forceState: "TENSION" | "COMPRESSION" = "TENSION"): EuC8BasicAnchorageInput {
  return {
    profileId: EU_C8_R4_ANCHORAGE_PROFILE_ID,
    parentProfileId: EU_C8_R4_PARENT_PROFILE_ID,
    profileVersion: EU_C8_R4_ANCHORAGE_PROFILE_VERSION,
    generation: EU_C8_R4_ANCHORAGE_PROFILE_GENERATION,
    barId: "bar-1",
    forceState,
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

function longTermInput(overrides: Partial<EuC7LongTermInput> = {}): EuC7LongTermInput {
  return {
    profileId: EU_C7_R1_REFERENCE_PROFILE_ID,
    generation: EU_C7_R1_REFERENCE_PROFILE_GENERATION,
    profileVersion: EU_C7_R1_PROFILE_VERSION,
    stale: false,
    presence: "CREEP_AND_SHRINKAGE",
    concrete: concreteMaterial(),
    materialRef: "c9-conc",
    sectionId: "wall-1",
    timeContextId: "t-qp-50y",
    referenceTime: "50y-quasi-permanent",
    loadingAgeDays: 28,
    evaluationAgeDays: 18250,
    expectedTimeContextId: null,
    authority: "HUMAN_AUTHORED_VALIDATED_RULE",
    phi: 2.4,
    phiProvenanceRef: "project-creep-note",
    phiApplicabilityRef: "wall-1-c30",
    shrinkageValue: 0.00032,
    shrinkageUnit: "STRAIN",
    shrinkageSignRepresentation: "SHRINKAGE_MAGNITUDE_POSITIVE",
    shrinkageProvenanceRef: "project-shrink-note",
    shrinkageApplicabilityRef: "wall-1-c30",
    calculateCreep: false,
    calculateShrinkage: false,
    ...overrides,
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
    provenance: governedProvenance({ jurisdiction: "eu-eea", standard: "EN 1992", version: "d1e-eu-c9-r5" }),
    validationState: "STANDARD_BINDING_FRAMEWORK",
    conformanceState: "INTENDED_PROFILE",
    workspaceGlobalAnnexId: null,
    statutoryEuMembershipRequired: false,
    statutoryEuComplianceClaimed: false,
    internationalContractualUse: false,
  };
}

const flexureDemandContext = createConfiguredKnowledgeContext({
  contextId: "ctx-en1992-c9-r5",
  jurisdictionProfileRef: "eu-eea",
  standardFamily: "EN",
  standardCode: "EN 1992",
  edition: "UNKNOWN_PENDING_CONFIRMATION",
  materialScope: "concrete",
});

function flexureBar(id: string, xMm: number, yMm: number): ReinforcementLayout["bars"][number] {
  return {
    barId: id, designation: "H20", diameterMm: property("d", 20, "mm"), areaMm2: property("As", 314, "mm2"),
    count: 1, xMm, yMm, layerId: null, face: "bottom", direction: "longitudinal", spacingMm: null, groupId: null,
    materialRef: "eu-c2-reo", anchorageMetadata: null, lapMetadata: null, provenanceRef: "layout-c2",
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

function flexureDemand(momentNm: number): StructuralDemandResult {
  return {
    resultId: "demand-wall",
    memberId: "wall-1",
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
    provenanceRef: governedProvenance({ jurisdiction: "eu-eea", standard: "EN 1992", version: "d1e-eu-c9-r5" }),
    inputEvidenceRefs: [{ evidenceId: "ev-d", sourceKind: "calculation", reference: "d1c" }],
    foundationReactionHandoff: { startFyN: 0, endFyN: 0, startMzNm: 0, endMzNm: 0, geotechnicalCapacityCalculated: false },
  };
}

function flexurePayload(momentNm = 50000): EuConcreteFlexureInput {
  return {
    methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
    axis: "MAJOR_AXIS",
    geometry: rectangleSection("wall", 300, 500, "wall"),
    layout: {
      layoutId: "lay-wall",
      bars: [flexureBar("b1", 50, 50), flexureBar("b2", 150, 50), flexureBar("b3", 250, 50)],
      groups: [],
      layers: [],
      transverse: [],
      provenanceRef: "layout-wall",
    },
    concrete: flexureConcrete(),
    reinforcement: flexureReinforcement(),
    demand: flexureDemand(momentNm),
    resolverInput: emptyResolverInput({ projectContext: project("DE") }),
    constitutiveContext: context(),
  };
}

describe("EOS-D1E-EU-C9-R5 bounded wall-section orchestration", () => {
  it("keeps the wall check at section scope", () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "eu-c9/wall.ts"), "utf8");
    expect(EU_C9_R5_CANONICAL_WALL_TYPE).toBe("WALL");
    expect(EU_C9_R5_R1_WALL_CAPABILITY_MATRIX_RECHECK["D1E.EU.C2.FLEXURE.UNIAXIAL"]).toBe("APPLICABLE_WITH_RESTRICTIONS");
    expect(EU_C9_R5_R1_WALL_CAPABILITY_MATRIX_RECHECK["D1E.EU.C5.SHEAR"]).toBe("BLOCKED_SCOPE_MISMATCH");
    expect(EU_C9_R5_R1_WALL_CAPABILITY_MATRIX_RECHECK["D1E.EU.C5.PUNCHING"]).toBe("NOT_APPLICABLE");
    expect(EU_C9_R5_R1_WALL_CAPABILITY_MATRIX_RECHECK["D1E.EU.C6.NOMINAL_CURVATURE"]).toBe("NOT_APPLICABLE");
    expect(EU_C9_R5_R1_WALL_CAPABILITY_MATRIX_RECHECK["D1E.EU.C7.SLS_REFERENCE"]).toBe("BLOCKED_SCOPE_MISMATCH");
    expect(EU_C9_R5_C6_WALL_APPLICABILITY).toBe("NOT_IMPLEMENTED_FOR_WALL_MEMBER");
    expect(EU_C9_R5_C6_INVOKED_FOR_WALL).toBe(false);
    expect(EU_C9_R5_WALL_SHEAR_RUNTIME_AVAILABLE).toBe(false);
    expect(EU_C9_R5_NEW_ENGINEERING_FORMULA_IMPLEMENTED).toBe(false);
    expect(EU_C9_R5_FULL_STANDARD_COVERAGE).toBe(false);
    expect(source.includes("evaluateEuC5")).toBe(false);
    expect(source.includes("evaluateEuC6")).toBe(false);
    expect(source.includes("evaluateEuC7CrackWidth")).toBe(false);
    expect(source.includes("fyd")).toBe(false);
    expect(source.includes("Math.")).toBe(false);
    expect(source.includes("releaseEligible")).toBe(false);
    expect(euC9R5WallExecutionDagHasCycle()).toBe(false);
    expect(orchestrateEuC9R5WallSection(wall({ memberType: "COLUMN" })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R5WallSection(wall({ geometryShape: "CIRCULAR" })).overallState).toBe("MEMBER_UNDETERMINED");
    expect(orchestrateEuC9R5WallSection(wall({ standardContext: { family: "OTHER", generation: "EN1992-1-1-GEN1", profileId: "x" } })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R5WallSection(wall({ standardContext: { family: "EN1992", generation: "GEN2", profileId: "x" } })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R5WallSection(wall({ materialRef: null })).overallState).toBe("MEMBER_UNDETERMINED");
    expect(orchestrateEuC9R5WallSection(wall({ reinforcementRef: null })).overallState).toBe("MEMBER_UNDETERMINED");
    expect(orchestrateEuC9R5WallSection(wall({ declaredEvaluationScope: [] })).overallState).toBe("MEMBER_UNDETERMINED");
    expect(orchestrateEuC9R5WallSection(wall({ declaredEvaluationScope: null })).overallState).toBe("MEMBER_UNDETERMINED");
    expect(orchestrateEuC9R5WallSection(wall({ prestressed: true })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R5WallSection(wall({ coupledWall: true })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R5WallSection(wall({ declaredEvaluationScope: ["SECTION_PURE_FLEXURE", "SECTION_UNIAXIAL_NM"] })).overallState).toBe("ORCHESTRATION_BLOCKED");
  });

  it("routes one section method from the declared action state", () => {
    const flexure = routeEuC9R5WallSection({ mode: "SECTION_PURE_FLEXURE", actions: flexureActions() });
    expect(flexure.methodId).toBe("EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR");
    expect(flexure.executesC2).toBe(true);
    expect(flexure.executesC3).toBe(false);
    expect(flexure.executesC4).toBe(false);
    const minor = routeEuC9R5WallSection({
      mode: "SECTION_PURE_FLEXURE",
      actions: flexureActions({ majorMoment: { status: "ABSENT" }, minorMoment: { status: "PRESENT", signedNm: 12000 } }),
    });
    expect(minor.methodId).toBe("EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR");
    expect(minor.executesC3).toBe(false);
    const axialFlexure = routeEuC9R5WallSection({
      mode: "SECTION_PURE_FLEXURE",
      actions: flexureActions({ axial: { status: "AXIAL_DIRECT", valueN: -400000 } }),
    });
    expect(axialFlexure.state).toBe("BLOCKED_SCOPE_MISMATCH");
    expect(axialFlexure.executesC3).toBe(false);
    const uniaxial = routeEuC9R5WallSection({
      mode: "SECTION_UNIAXIAL_NM",
      actions: flexureActions({ axial: { status: "AXIAL_DIRECT", valueN: -500000 }, majorMoment: { status: "PRESENT", signedNm: 20000 } }),
    });
    expect(uniaxial.methodId).toBe("EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MAJOR");
    expect(uniaxial.executesC2).toBe(false);
    expect(uniaxial.executesC3).toBe(true);
    expect(uniaxial.executesC4).toBe(false);
    const both = routeEuC9R5WallSection({
      mode: "SECTION_UNIAXIAL_NM",
      actions: flexureActions({
        axial: { status: "AXIAL_DIRECT", valueN: -500000 },
        minorMoment: { status: "PRESENT", signedNm: 10000 },
      }),
    });
    expect(both.state).toBe("BLOCKED_SCOPE_MISMATCH");
    expect(both.executesC4).toBe(false);
    const biaxial = routeEuC9R5WallSection({
      mode: "SECTION_BIAXIAL_PMM",
      actions: flexureActions({
        axial: { status: "AXIAL_DIRECT", valueN: 0 },
        minorMoment: { status: "PRESENT", signedNm: 10000 },
      }),
    });
    expect(biaxial.methodId).toBe("EU_RC_BIAXIAL_EN1992_PMM_RECTANGULAR");
    expect(biaxial.executesC2).toBe(false);
    expect(biaxial.executesC3).toBe(false);
    expect(biaxial.executesC4).toBe(true);
    const pure = routeEuC9R5WallSection({
      mode: "SECTION_UNIAXIAL_NM",
      actions: flexureActions({ majorMoment: { status: "ABSENT" }, axial: { status: "AXIAL_DIRECT", valueN: -800000 } }),
    });
    expect(pure.reason).toBe("PURE_AXIAL_REQUIRES_EXPLICIT_AXIS");
    expect(pure.methodId).toBeNull();
    const pureAxis = routeEuC9R5WallSection({
      mode: "SECTION_UNIAXIAL_NM",
      actions: flexureActions({
        majorMoment: { status: "ABSENT" },
        axial: { status: "AXIAL_DIRECT", valueN: -800000 },
        pureAxialSectionAxis: "MINOR_AXIS",
      }),
    });
    expect(pureAxis.methodId).toBe("EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MINOR");
    expect(pureAxis.axis).toBe("MINOR_AXIS");
    const missingMoment = orchestrateEuC9R5WallSection(wall({ actions: flexureActions({ majorMoment: { status: "ABSENT" } }) }));
    expect(missingMoment.overallState).toBe("MEMBER_UNDETERMINED");
    expect(missingMoment.executedCapabilityIds).toEqual([]);
    const missingActions = orchestrateEuC9R5WallSection(wall({ actions: null }));
    expect(missingActions.overallState).toBe("MEMBER_UNDETERMINED");
    expect(missingActions.unresolvedInputs).toContain("ACTION_TUPLE");
    const missingAxis = orchestrateEuC9R5WallSection(wall({ axisMapping: null }));
    expect(missingAxis.overallState).toBe("MEMBER_UNDETERMINED");
    expect(missingAxis.unresolvedInputs).toContain("AXIS_MAPPING");
    const sameRoles = orchestrateEuC9R5WallSection(wall({
      axisMapping: { majorAxisRole: "IN_PLANE", minorAxisRole: "IN_PLANE" },
    }));
    expect(sameRoles.unresolvedInputs).toContain("AXIS_MAPPING");
    expect(wallSectionMatchesGeometry(rectangleSection("wall", 300, 500, "wall"), {
      wallLengthMm: 500,
      wallThicknessMm: 300,
      lengthMapsTo: "SECTION_DEPTH",
    })).toBe(true);
    expect(wallSectionMatchesGeometry(rectangleSection("wall", 300, 500, "wall"), {
      wallLengthMm: 500,
      wallThicknessMm: 300,
      lengthMapsTo: "SECTION_WIDTH",
    })).toBe(false);
    const swapped = orchestrateEuC9R5WallSection(wall({
      wallSection: { wallLengthMm: 500, wallThicknessMm: 300, lengthMapsTo: "SECTION_WIDTH" },
      flexure: flexurePayload(),
    }));
    expect(swapped.overallState).toBe("MEMBER_UNDETERMINED");
    expect(swapped.executedCapabilityIds).toEqual([]);
    expect(swapped.unresolvedInputs).toContain("C2_INPUT_DOES_NOT_MATCH_WALL_SECTION");
  });

  it("refuses wall analysis, shear, punching, torsion, and stability substitutes", () => {
    expect(orchestrateEuC9R5WallSection(wall({ generateActions: true })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R5WallSection(wall({ inferEffectiveLength: true })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R5WallSection(wall({ calculateSlenderness: true })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R5WallSection(wall({ runPDelta: true })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R5WallSection(wall({ inferRestraint: true })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R5WallSection(wall({ axisInferredFromUi: true })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R5WallSection(wall({ invokeColumnSecondOrder: true })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R5WallSection(wall({ boundaryElementAutodesign: true })).overallState).toBe("ORCHESTRATION_BLOCKED");
    const second = orchestrateEuC9R5WallSection(wall({ declaredEvaluationScope: ["WALL_SECOND_ORDER"] }));
    expect(second.overallState).toBe("MEMBER_INCOMPLETE");
    expect(second.executedCapabilityIds).toEqual([]);
    const shear = orchestrateEuC9R5WallSection(wall({ declaredEvaluationScope: ["WALL_SHEAR"] }));
    expect(shear.overallState).toBe("MEMBER_INCOMPLETE");
    expect(shear.executedCapabilityIds).toEqual([]);
    expect(shear.unavailableRelevantCapabilities).toContain("D1E.EU.C5.SHEAR");
    const punching = orchestrateEuC9R5WallSection(wall({ declaredEvaluationScope: ["PUNCHING"] }));
    expect(punching.overallState).toBe("MEMBER_UNDETERMINED");
    expect(punching.executedCapabilityIds).toEqual([]);
    expect(punching.notApplicableCapabilities).toContain("D1E.EU.C5.PUNCHING");
    const torsion = orchestrateEuC9R5WallSection(wall({ declaredEvaluationScope: ["TORSION"] }));
    expect(torsion.overallState).toBe("MEMBER_UNDETERMINED");
    expect(torsion.executedCapabilityIds).toEqual([]);
    expect(torsion.notApplicableCapabilities).toContain("D1E.EU.C5.TORSION");
    const crack = orchestrateEuC9R5WallSection(wall({ declaredEvaluationScope: ["CRACK_WIDTH"] }));
    expect(crack.overallState).toBe("MEMBER_INCOMPLETE");
    expect(crack.executedCapabilityIds).toEqual([]);
    const deflection = orchestrateEuC9R5WallSection(wall({ declaredEvaluationScope: ["DEFLECTION"] }));
    expect(deflection.overallState).toBe("MEMBER_INCOMPLETE");
    expect(deflection.evaluationCompleteForDeclaredScope).toBe(false);
    const boundary = orchestrateEuC9R5WallSection(wall({ declaredEvaluationScope: ["BOUNDARY_ELEMENT"] }));
    expect(boundary.overallState).toBe("MEMBER_INCOMPLETE");
    expect(EU_C9_R5_BOUNDARY_ELEMENT_REQUEST_CAN_PASS).toBe(false);
    const seismic = orchestrateEuC9R5WallSection(wall({ declaredEvaluationScope: ["SEISMIC_DETAILING"] }));
    expect(seismic.overallState).toBe("MEMBER_INCOMPLETE");
    const designAnchorage = orchestrateEuC9R5WallSection(wall({ declaredEvaluationScope: ["DESIGN_ANCHORAGE"] }));
    expect(designAnchorage.overallState).toBe("MEMBER_INCOMPLETE");
    const laps = orchestrateEuC9R5WallSection(wall({ declaredEvaluationScope: ["LAPS"] }));
    expect(laps.overallState).toBe("MEMBER_INCOMPLETE");
    expect(laps.deferredCapabilities).toContain("LAPS");
    const compliance = orchestrateEuC9R5WallSection(wall({ declaredEvaluationScope: ["PROVIDED_COVER_COMPLIANCE"] }));
    expect(compliance.overallState).toBe("MEMBER_INCOMPLETE");
    const compression = orchestrateEuC9R5WallSection(wall({
      declaredEvaluationScope: ["BASIC_ANCHORAGE"],
      anchorage: anchorageInput(true, "COMPRESSION"),
    }));
    expect(compression.overallState).toBe("MEMBER_INCOMPLETE");
    expect(compression.executedCapabilityIds).toEqual([]);
    const pureAxial = orchestrateEuC9R5WallSection(wall({
      declaredEvaluationScope: ["SECTION_UNIAXIAL_NM"],
      actions: flexureActions({ majorMoment: { status: "ABSENT" }, axial: { status: "AXIAL_DIRECT", valueN: -800000 } }),
    }));
    expect(pureAxial.overallState).toBe("MEMBER_INCOMPLETE");
    expect(pureAxial.unresolvedInputs).toContain("PURE_AXIAL_REQUIRES_EXPLICIT_AXIS");
    expect(pureAxial.executedCapabilityIds).toEqual([]);
  });

  it("keeps calculation and context out of the required-check pass", () => {
    const coverDirect = evaluateEuC8CoverAssembly(coverInput());
    const cover = orchestrateEuC9R5WallSection(wall({ declaredEvaluationScope: ["COVER_REQUIREMENT"], cover: coverInput() }));
    expect(cover.calculationNodes[0]?.nodeRole).toBe("CALCULATION");
    expect(cover.calculationNodes[0]?.numericalResult).toBe(coverDirect.nominalCoverMm);
    expect(cover.overallState).toBe("MEMBER_UNDETERMINED");
    expect(cover.evaluationCompleteForDeclaredScope).toBe(false);
    const longDirect = evaluateEuC7LongTermState(longTermInput());
    const context = orchestrateEuC9R5WallSection(wall({ declaredEvaluationScope: ["LONG_TERM_CONTEXT"], longTerm: longTermInput() }));
    expect(context.contextNodes[0]?.nodeRole).toBe("CONTEXT");
    expect(context.contextNodes[0]?.executionStatus).toBe(longDirect.accepted ? "AVAILABLE" : "UNDETERMINED");
    expect(context.contextNodes[0]?.requiredCheck).toBe(false);
    expect(context.overallState).toBe("MEMBER_UNDETERMINED");
    const creep = orchestrateEuC9R5WallSection(wall({
      declaredEvaluationScope: ["LONG_TERM_CONTEXT"],
      longTerm: longTermInput({ calculateCreep: true }),
    }));
    expect(creep.overallState).toBe("MEMBER_INCOMPLETE");
    expect(creep.executedCapabilityIds).toEqual([]);
    const spacingDirect = evaluateEuC8MinClearSpacing(spacingInput());
    const spacing = orchestrateEuC9R5WallSection(wall({
      declaredEvaluationScope: ["REINFORCEMENT_SPACING"],
      spacing: spacingInput(),
    }));
    expect(spacing.nodes[0]?.numericalResult).toBe(spacingDirect.measuredClearSpacingMm);
    expect(spacing.nodes[0]?.executionStatus).toBe("SATISFIED");
    expect(spacing.overallState).toBe("MEMBER_SATISFIED_FOR_EXECUTED_BOUNDED_SCOPE");
    expect(spacing.fullStandardCoverage).toBe(false);
    const unequal = orchestrateEuC9R5WallSection(wall({
      declaredEvaluationScope: ["REINFORCEMENT_SPACING"],
      spacing: spacingInput(20),
    }));
    expect(unequal.overallState).toBe("MEMBER_INCOMPLETE");
    expect(unequal.executedCapabilityIds).toEqual([]);
    const guessed = orchestrateEuC9R5WallSection(wall({
      declaredEvaluationScope: ["REINFORCEMENT_SPACING"],
      spacing: spacingInput(),
      guessReinforcementFace: true,
    }));
    expect(guessed.overallState).toBe("MEMBER_INCOMPLETE");
    expect(guessed.executedCapabilityIds).toEqual([]);
    const arbitrary = orchestrateEuC9R5WallSection(wall({
      declaredEvaluationScope: ["REINFORCEMENT_SPACING"],
      spacing: spacingInput(),
      autoClassifyBarPair: true,
    }));
    expect(arbitrary.overallState).toBe("MEMBER_INCOMPLETE");
    const anchorageDirect = evaluateEuC8BasicRequiredAnchorage(anchorageInput(true));
    const anchorage = orchestrateEuC9R5WallSection(wall({
      declaredEvaluationScope: ["BASIC_ANCHORAGE"],
      anchorage: anchorageInput(true),
    }));
    expect(anchorage.nodes[0]?.numericalResult).toBe(anchorageDirect.basicRequiredAnchorageLengthMm);
    expect(anchorage.nodes[0]?.executionStatus).toBe("SATISFIED");
    expect(anchorage.overallState).toBe("MEMBER_SATISFIED_FOR_EXECUTED_BOUNDED_SCOPE");
    const calculation = orchestrateEuC9R5WallSection(wall({
      declaredEvaluationScope: ["BASIC_ANCHORAGE"],
      anchorage: anchorageInput(false),
    }));
    expect(calculation.nodes[0]?.nodeRole).toBe("CALCULATION");
    expect(calculation.nodes[0]?.numericalResult).toBe(evaluateEuC8BasicRequiredAnchorage(anchorageInput(false)).basicRequiredAnchorageLengthMm);
    expect(calculation.overallState).toBe("MEMBER_UNDETERMINED");
  });

  it("preserves a failed section check beside an unavailable request", () => {
    const over = c3Payload(5e6, -500e3);
    const overDirect = evaluateEuC3DemandPointCheck(over);
    const failed = orchestrateEuC9R5WallSection(wall({
      declaredEvaluationScope: ["SECTION_UNIAXIAL_NM", "WALL_SHEAR", "LAPS"],
      actions: flexureActions({ axial: { status: "AXIAL_DIRECT", valueN: -500e3 }, majorMoment: { status: "PRESENT", signedNm: 5e6 } }),
      c3: over,
    }));
    expect(overDirect.checkState).toBe("CHECK_NOT_SATISFIED");
    expect(failed.sectionResult?.checkState).toBe("CHECK_NOT_SATISFIED");
    expect(failed.sectionResult?.numericalResult).toBe(overDirect.utilization);
    expect(failed.overallState).toBe("MEMBER_NOT_SATISFIED");
    expect(failed.failedChecks).toContain("D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL");
    expect(failed.unavailableRelevantCapabilities).toContain("D1E.EU.C5.SHEAR");
    expect(failed.deferredCapabilities).toContain("LAPS");
    expect(failed.executedCapabilityIds).toEqual(["EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MAJOR"]);
    const first = orchestrateEuC9R5WallSection(wall({ declaredEvaluationScope: ["REINFORCEMENT_SPACING"], spacing: spacingInput() }));
    const again = orchestrateEuC9R5WallSection(wall({ declaredEvaluationScope: ["REINFORCEMENT_SPACING"], spacing: spacingInput() }));
    expect(again.memberFingerprint).toBe(first.memberFingerprint);
    expect(JSON.stringify(again)).toBe(JSON.stringify(first));
    const stale = orchestrateEuC9R5WallSection(wall({
      declaredEvaluationScope: ["REINFORCEMENT_SPACING"],
      spacing: spacingInput(),
      wallSection: { wallLengthMm: 320, wallThicknessMm: 500, lengthMapsTo: "SECTION_WIDTH" },
      priorResultFingerprint: first.memberFingerprint,
    }));
    expect(stale.memberFingerprint).not.toBe(first.memberFingerprint);
    expect(stale.staleReuseRejected).toBe(true);
    expect(first.fullStandardCoverage).toBe(false);
    expect(first.engineerValidationState).toBe("PENDING_HUMAN_ENGINEERING_REVIEW");
    expect(first.conformanceState).toBe("INTENDED_PROFILE");
    expect(first.productClaim).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(first.warnings).toContain("WALL_SECTION_CHECK_IS_NOT_WALL_MEMBER_DESIGN");
  });

  it("matches direct C2, C3, and C4 section results", () => {
    const flexure = flexurePayload();
    const directFlexure = evaluateEuConcreteFlexure(flexure);
    const flexureResult = orchestrateEuC9R5WallSection(wall({ flexure }));
    expect(directFlexure.checkState === "CHECK_SATISFIED" || directFlexure.checkState === "CHECK_NOT_SATISFIED").toBe(true);
    expect(flexureResult.sectionResult?.numericalResult).toBe(directFlexure.designRuleUtilization);
    expect(flexureResult.sectionResult?.checkState).toBe(directFlexure.checkState);
    expect(flexureResult.executedCapabilityIds).toEqual(["EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR"]);
    const payload = c3Payload(20000, -500e3);
    const direct = evaluateEuC3DemandPointCheck(payload);
    const uniaxial = orchestrateEuC9R5WallSection(wall({
      declaredEvaluationScope: ["SECTION_UNIAXIAL_NM"],
      actions: flexureActions({ axial: { status: "AXIAL_DIRECT", valueN: -500e3 }, majorMoment: { status: "PRESENT", signedNm: 20000 } }),
      c3: payload,
    }));
    expect(direct.checkState === "CHECK_SATISFIED" || direct.checkState === "CHECK_NOT_SATISFIED").toBe(true);
    expect(uniaxial.sectionResult?.numericalResult).toBe(direct.utilization);
    expect(uniaxial.sectionResult?.checkState).toBe(direct.checkState);
    expect(uniaxial.executedCapabilityIds).toEqual(["EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MAJOR"]);
    const c4Payload = {
      methodId: EU_C4_METHOD_IDS[0],
      geometry: rectangleSection("wall", 300, 500, "wall"),
      layout: layout(),
      concrete: concreteMaterial(),
      reinforcement: reinforcementMaterial(),
      context: context(),
      targetAxialN: 0,
      momentDirectionRad: 0,
      demandMyNm: 10000,
      resolutionX: 8,
      resolutionY: 8,
      provenanceRef: "wall-c4",
      demand: demand(20000, 0),
    };
    const directC4 = evaluateEuC4DemandPointCheck(c4Payload);
    const biaxial = orchestrateEuC9R5WallSection(wall({
      declaredEvaluationScope: ["SECTION_BIAXIAL_PMM"],
      actions: flexureActions({
        axial: { status: "AXIAL_DIRECT", valueN: 0 },
        majorMoment: { status: "PRESENT", signedNm: 20000 },
        minorMoment: { status: "PRESENT", signedNm: 10000 },
      }),
      c4: c4Payload,
    }));
    expect(directC4.checkState === "CHECK_SATISFIED" || directC4.checkState === "CHECK_NOT_SATISFIED").toBe(true);
    expect(biaxial.sectionResult?.numericalResult).toBe(directC4.resistanceRadiusNm);
    expect(biaxial.sectionResult?.checkState).toBe(directC4.checkState);
    expect(biaxial.executedCapabilityIds).toEqual(["EU_RC_BIAXIAL_EN1992_PMM_RECTANGULAR"]);
    expect(biaxial.executedCapabilityIds.filter((id) => id.includes("FLEXURE") || id.includes("AXIAL_FLEXURE"))).toEqual([]);
  }, 180000);

  it("records section-only claims, registry, and remaining validation debt", () => {
    expect(EU_C9_R5_IMPLEMENTED_WALL_ORCHESTRATOR_COUNT).toBe(1);
    expect(EU_C9_R5_ENGINEER_VALIDATED_WALL_ORCHESTRATOR_COUNT).toBe(0);
    expect(EU_C9_R5_ENGINEER_VALIDATION_STATE).toBe("PENDING_HUMAN_ENGINEERING_REVIEW");
    expect(NUMERICAL_WALL_ORCHESTRATION_VALIDATION_EQUALS_ENGINEER_VALIDATION).toBe(false);
    expect(EU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(EU_C9_R5_PRODUCT_SUBCLAIM).toBe("BOUNDED_RC_WALL_SECTION_ORCHESTRATION_REFERENCE_CAPABILITY");
    expect(CAPABILITY_MANIFEST_WALL_CLAIM_SECTION_ONLY).toBe(true);
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(C9_WALL_ORCHESTRATION_EQUALS_STANDARD_CONFORMANCE).toBe(false);
    expect(AI_C9_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(LLM_C9_NUMERICAL_AUTHORITY).toBe(false);
    expect(AI_MEMBER_TYPE_AUTHORITY).toBe(false);
    expect(AI_REQUIRED_CHECK_SELECTION_AUTHORITY).toBe(false);
    expect(AI_ACTION_EFFECT_AUTHORITY).toBe(false);
    expect(AI_WALL_AXIS_AUTHORITY).toBe(false);
    expect(AI_WALL_SHEAR_AUTHORITY).toBe(false);
    expect(AI_WALL_STABILITY_AUTHORITY).toBe(false);
    expect(AI_BOUNDARY_ELEMENT_AUTHORITY).toBe(false);
    expect(AI_NDP_AUTHORITY).toBe(false);
    expect(AI_CHECK_OVERRIDE_AUTHORITY).toBe(false);
    expect(AI_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect([...EU_C9_R5_VALIDATION_DEBT_REDUCED_ITEMS]).toEqual([
      "C9_WALL_SECTION_RUNTIME_ORCHESTRATOR",
      "C9_WALL_SECTION_ROUTING_VALIDATION",
      "C9_WALL_SECTION_AGGREGATION_VALIDATION",
    ]);
    expect(EU_C9_R5_VALIDATION_DEBT_REMAINING_ITEMS).toContain("WALL_GLOBAL_ANALYSIS");
    expect(EU_C9_R5_VALIDATION_DEBT_REMAINING_ITEMS).toContain("WALL_SHEAR");
    expect(EU_C9_R5_VALIDATION_DEBT_REMAINING_ITEMS).toContain("WALL_STABILITY");
    expect(EU_C9_R5_VALIDATION_DEBT_REMAINING_ITEMS).toContain("BOUNDARY_ELEMENTS");
    expect(EU_C9_IMPLEMENTED_MEMBER_ORCHESTRATOR_INVENTORY).toEqual([
      "EU_RC_BEAM_ORCHESTRATION_EN1992_REFERENCE",
      "EU_RC_COLUMN_ORCHESTRATION_EN1992_REFERENCE",
      "EU_RC_SOLID_SLAB_ORCHESTRATION_EN1992_REFERENCE",
      "EU_RC_WALL_SECTION_ORCHESTRATION_EN1992_REFERENCE",
    ]);
    expect(EU_C9_R5_CLOSEOUT_NEXT_FEASIBILITY).toBe("FEASIBLE");
    expect(EU_C9_ORCHESTRATOR_REGISTRY.map((row) => row.orchestratorId)).toEqual([
      "EU_RC_BEAM_ORCHESTRATION_EN1992_REFERENCE",
      "EU_RC_COLUMN_ORCHESTRATION_EN1992_REFERENCE",
      "EU_RC_SOLID_SLAB_ORCHESTRATION_EN1992_REFERENCE",
      "EU_RC_WALL_SECTION_ORCHESTRATION_EN1992_REFERENCE",
    ]);
    expect(EU_C9_ORCHESTRATOR_REGISTRY[3]?.classification).toBe("SECTION_ONLY");
    const manifest = CONCRETE_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1E.EU.C9.WALL_SECTION_ORCHESTRATION");
    expect(manifest?.implementationState).toBe("IMPLEMENTED_NUMERICALLY_VALIDATED");
    expect(manifest?.method).toBe("EU_RC_WALL_SECTION_ORCHESTRATION_EN1992_REFERENCE");
    expect(manifest?.limitations).toContain("section check is not wall-member design");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C9-R5-WALL-ORCHESTRATION")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C9-R6-CLOSEOUT")?.status).toBe("NOT_STARTED");
  });
});
