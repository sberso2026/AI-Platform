import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  D1C_TORSIONAL_ACTION_AXIS,
  D1C_TORSIONAL_ACTION_ID,
  D1C_TORSIONAL_ACTION_SIGN_CONVENTION,
  D1C_TORSIONAL_ACTION_TYPE,
  D1C_TORSIONAL_ACTION_UNIT,
  EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE,
  EU_C1C_R1_PARAMETER_VERSION,
  EU_C3_METHOD_IDS,
  EU_C4_METHOD_IDS,
  EU_C6_R1_CURVATURE_FACTOR_UPPER_BOUND,
  EU_C6_R1_PROFILE_VERSION,
  EU_C6_R1_REFERENCE_PROFILE_GENERATION,
  EU_C6_R1_REFERENCE_PROFILE_ID,
  EU_C6_R2_AXIAL_SIGN_CONVERSION_COUNT,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  type ConcreteMaterial,
  type EuC1cR1DeclaredNdpValue,
  type ReinforcementLayout,
  type ReinforcementMaterial,
  type StructuralDemandResult,
} from "@rtb/types";
import { CONCRETE_CAPABILITY_MANIFEST, D1E_INTERNAL_ROADMAP } from "./capability";
import { evaluateEuC5Torsion, type EuC5EvaluateInput } from "./eu-c5/evaluate";
import { evaluateEuC6NominalCurvature, type EuC6NominalCurvatureInput } from "./eu-c6/evaluate";
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
import { evaluateEuC8MinClearSpacing } from "./eu-c8/spacing-evaluate";
import { evaluateEuC3DemandPointCheck } from "./eu-c3/evaluate";
import { evaluateEuC4DemandPointCheck } from "./eu-c4/evaluate";
import { rectangleSection } from "./section-mechanics";
import {
  EU_C9_R3_BIAXIAL_SECTION_ROUTING,
  EU_C9_R3_C2_INVOKED_FOR_COLUMN,
  EU_C9_R3_C6_C3_SIGN_CONVERSION_COUNT,
  EU_C9_R3_C6_C4_HANDOFF_STATE,
  EU_C9_R3_C6_OUTPUT_USED_FOR_C4,
  EU_C9_R3_COLUMN_PUNCHING_STATE,
  EU_C9_R3_ENGINEER_VALIDATED_COLUMN_ORCHESTRATOR_COUNT,
  EU_C9_R3_FULL_STANDARD_COVERAGE,
  EU_C9_R3_IMPLEMENTED_COLUMN_ORCHESTRATOR_COUNT,
  EU_C9_R3_NEW_ENGINEERING_FORMULA_IMPLEMENTED,
  EU_C9_R3_SOLID_SLAB_NEXT_FEASIBILITY,
  EU_C9_R3_UNIAXIAL_SECTION_ROUTING,
  EU_C9_R3_VALIDATION_DEBT_REDUCED_ITEMS,
  euC9R3ColumnExecutionDagHasCycle,
  orchestrateEuC9R3Column,
  routeEuC9R3ColumnSection,
  type EuC9R3ColumnInput,
} from "./eu-c9/column";
import { EU_C9_ORCHESTRATOR_REGISTRY } from "./eu-c9/wall";
import type { EuC9R2SectionActions } from "./eu-c9/beam";

function actions(patch: Partial<EuC9R2SectionActions> = {}): EuC9R2SectionActions {
  return {
    axial: { status: "AXIAL_DIRECT", valueN: -500000 },
    majorMoment: { status: "PRESENT", signedNm: 20000 },
    minorMoment: { status: "ABSENT" },
    ...patch,
  };
}

function column(patch: Partial<EuC9R3ColumnInput> = {}): EuC9R3ColumnInput {
  return {
    memberId: "column-1",
    memberType: "COLUMN",
    declaredEvaluationScope: ["SECTION_UNIAXIAL"],
    standardContext: { family: "EN1992", generation: "EN1992-1-1-GEN1", profileId: "EU-EN1992-1-1-GEN1" },
    geometryShape: "RECTANGULAR",
    materialRef: "c30",
    reinforcementRef: "b500",
    actions: actions(),
    combinationId: "uls-1",
    ...patch,
  };
}

function property(name: string, value: number, unit: string) {
  return { name, value, unit, provenanceRef: "c9-r3", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
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
  sourceEvidence: "c9-r3",
  sourceRevision: "0",
  model: null,
  tool: null,
  solver: null,
  version: "c9-r3",
  promptOrTemplate: null,
  timestamp: "2026-10-13T00:00:00.000Z",
  jurisdiction: "EU",
  standard: "EN 1992",
  calculationMethod: "EU_RC_COLUMN_ORCHESTRATION_EN1992_REFERENCE",
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
    resultId: "demand-column",
    capacityPresent: false,
    memberId: "column-1",
    moment: { value: momentNm < 0 ? -momentNm : momentNm, unit: "N.m", locationM: 0, signed: momentNm },
    axial: { valueN: axialN, unit: "N", method: "AXIAL_DIRECT" },
  } as StructuralDemandResult;
}

function c3Payload(momentNm: number, axialN: number) {
  return {
    methodId: EU_C3_METHOD_IDS[0],
    axis: "MAJOR_AXIS" as const,
    momentSign: "POSITIVE" as const,
    geometry: rectangleSection("col", 300, 500, "col"),
    layout: layout(),
    concrete: concreteMaterial(),
    reinforcement: reinforcementMaterial(),
    context: context(),
    targetAxialN: axialN,
    resolutionX: 8,
    resolutionY: 8,
    provenanceRef: "col-c3",
    demand: demand(momentNm, axialN),
  };
}

function c6Input(overrides: Partial<EuC6NominalCurvatureInput> = {}): EuC6NominalCurvatureInput {
  return {
    profileId: EU_C6_R1_REFERENCE_PROFILE_ID,
    generation: EU_C6_R1_REFERENCE_PROFILE_GENERATION,
    profileVersion: EU_C6_R1_PROFILE_VERSION,
    nationalAnnexClaim: false,
    stale: false,
    sourceConflictUnresolved: false,
    geometry: rectangleSection("c6", 300, 500, "c6"),
    axis: "MAJOR_AXIS",
    l0Mm: 3000,
    c: EU_C6_R1_CURVATURE_FACTOR_UPPER_BOUND,
    phiEf: 1,
    esMPa: 200000,
    dMm: 450,
    asMm2: 2000,
    m01Nmm: 10e6,
    m02Nmm: 20e6,
    nEdCompressionN: 500e3,
    concrete: concreteMaterial(),
    reinforcement: reinforcementMaterial(),
    context: context(),
    ...overrides,
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

describe("EOS-D1E-EU-C9-R3 bounded column orchestration", () => {
  it("routes uniaxial and biaxial section states without C2 or a guessed axis", () => {
    expect(EU_C9_R3_UNIAXIAL_SECTION_ROUTING).toBe("C3_WHEN_APPLICABLE");
    expect(EU_C9_R3_BIAXIAL_SECTION_ROUTING).toBe("C4_WHEN_APPLICABLE");
    expect(EU_C9_R3_C2_INVOKED_FOR_COLUMN).toBe(false);
    const uniaxial = routeEuC9R3ColumnSection({ mode: "SECTION_UNIAXIAL", actions: actions() });
    expect(uniaxial.methodId).toBe("EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MAJOR");
    expect(uniaxial.executesC2).toBe(false);
    expect(uniaxial.executesC3).toBe(true);
    expect(uniaxial.executesC4).toBe(false);
    const minor = routeEuC9R3ColumnSection({
      mode: "SECTION_UNIAXIAL",
      actions: actions({ majorMoment: { status: "PRESENT", signedNm: 0 }, minorMoment: { status: "PRESENT", signedNm: 12000 } }),
    });
    expect(minor.methodId).toBe("EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MINOR");
    expect(minor.axis).toBe("MINOR_AXIS");
    const biaxial = routeEuC9R3ColumnSection({
      mode: "SECTION_BIAXIAL",
      actions: actions({ minorMoment: { status: "PRESENT", signedNm: 10000 } }),
    });
    expect(biaxial.methodId).toBe("EU_RC_BIAXIAL_EN1992_PMM_RECTANGULAR");
    expect(biaxial.executesC3).toBe(false);
    expect(biaxial.executesC4).toBe(true);
    const pureAxial = routeEuC9R3ColumnSection({
      mode: "SECTION_UNIAXIAL",
      actions: actions({ majorMoment: { status: "ABSENT" }, minorMoment: { status: "ABSENT" } }),
    });
    expect(pureAxial.state).toBe("BLOCKED_SCOPE_MISMATCH");
    expect(pureAxial.reason).toBe("PURE_AXIAL_REQUIRES_EXPLICIT_AXIS");
    const pureAxialAxis = routeEuC9R3ColumnSection({
      mode: "SECTION_UNIAXIAL",
      actions: actions({ majorMoment: { status: "ABSENT" }, minorMoment: { status: "ABSENT" }, pureAxialSectionAxis: "MAJOR_AXIS" }),
    });
    expect(pureAxialAxis.methodId).toBe("EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MAJOR");
    const flexureOnly = routeEuC9R3ColumnSection({
      mode: "SECTION_UNIAXIAL",
      actions: actions({ axial: { status: "NO_AXIAL_COMPONENTS", valueN: 0 } }),
    });
    expect(flexureOnly.state).toBe("BLOCKED_SCOPE_MISMATCH");
    expect(flexureOnly.reason).toBe("C2_NOT_AVAILABLE_FOR_COLUMN");
  });

  it("keeps excluded column methods unavailable and does not invent member inputs", () => {
    const source = readFileSync(new URL("./eu-c9/column.ts", import.meta.url), "utf8");
    expect(source).not.toContain("evaluateEuConcreteFlexure");
    expect(source).not.toContain("evaluateEuC5Shear");
    expect(source).not.toContain("evaluateEuC5Punching");
    expect(source).not.toContain("evaluateEuC7CrackWidth");
    expect(source).not.toContain("selectEuC6EffectiveLength");
    expect(source).not.toContain("compressionToTension");
    expect(source).not.toContain("fyd");
    expect(source).not.toMatch(/Math\./);
    expect(source).not.toContain("releaseEligible");
    expect(source).not.toContain("phiEf: input.creepCoefficientPhi");
    const c2 = orchestrateEuC9R3Column(column({ declaredEvaluationScope: ["C2_FLEXURE"] }));
    expect(c2.nodes[0]?.executionStatus).toBe("BLOCKED_SCOPE_MISMATCH");
    expect(c2.executedCapabilityIds).not.toContain("EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR");
    const shear = orchestrateEuC9R3Column(column({ declaredEvaluationScope: ["COLUMN_SHEAR"] }));
    expect(shear.nodes[0]?.executionStatus).toBe("BLOCKED_SCOPE_MISMATCH");
    expect(shear.overallState).toBe("MEMBER_INCOMPLETE");
    const punching = orchestrateEuC9R3Column(column({ declaredEvaluationScope: ["PUNCHING"] }));
    expect(punching.nodes[0]?.executionStatus).toBe("NOT_APPLICABLE");
    expect(punching.overallState).toBe("MEMBER_UNDETERMINED");
    expect(EU_C9_R3_COLUMN_PUNCHING_STATE).toBe("NOT_APPLICABLE");
    const crack = orchestrateEuC9R3Column(column({ declaredEvaluationScope: ["CRACK_WIDTH"] }));
    expect(crack.nodes[0]?.executionStatus).toBe("BLOCKED_SCOPE_MISMATCH");
    expect(crack.overallState).toBe("MEMBER_INCOMPLETE");
    const c64 = orchestrateEuC9R3Column(column({ declaredEvaluationScope: ["C6_C4_HANDOFF"] }));
    expect(c64.nodes[0]?.executionStatus).toBe("BLOCKED_MISSING_AUTHORITY");
    expect(c64.executedCapabilityIds).not.toContain("EU_RC_BIAXIAL_EN1992_PMM_RECTANGULAR");
    expect(EU_C9_R3_C6_C4_HANDOFF_STATE).toBe("BLOCKED_MISSING_AUTHORITY");
    expect(EU_C9_R3_C6_OUTPUT_USED_FOR_C4).toBe(false);
    const biaxialSecond = orchestrateEuC9R3Column(column({ declaredEvaluationScope: ["SECTION_BIAXIAL", "MEMBER_SECOND_ORDER_UNIAXIAL"] }));
    expect(biaxialSecond.overallState).toBe("MEMBER_INCOMPLETE");
    expect(biaxialSecond.executedCapabilityIds).not.toContain("EU_RC_SECOND_ORDER_EN1992_NOMINAL_CURVATURE_REFERENCE");
    expect(biaxialSecond.c6Intermediate).toBeNull();
    const inferred = orchestrateEuC9R3Column(column({ effectiveLengthInferenceRequested: true }));
    expect(inferred.overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(inferred.blockingFindings).toContain("EFFECTIVE_LENGTH_INFERENCE_REJECTED");
    expect(orchestrateEuC9R3Column(column({ supportConditionInferenceRequested: true })).blockingFindings).toContain("SUPPORT_CONDITION_INFERENCE_REJECTED");
    expect(orchestrateEuC9R3Column(column({ swayInferenceRequested: true })).blockingFindings).toContain("SWAY_INFERENCE_REJECTED");
    expect(orchestrateEuC9R3Column(column({ additionalImperfectionRequested: true })).blockingFindings).toContain("IMPERFECTION_INVENTION_REJECTED");
    expect(orchestrateEuC9R3Column(column({ slendernessNeglectRequested: true })).blockingFindings).toContain("SLENDERNESS_NEGLECT_REJECTED");
    expect(orchestrateEuC9R3Column(column({ useC7PhiAsPhiEf: true, creepCoefficientPhi: 2 })).blockingFindings).toContain("C7_PHI_SUBSTITUTION_REJECTED");
  });

  it("fails closed on missing second-order inputs and does not start C6 for a section-only column", () => {
    const sectionOnly = orchestrateEuC9R3Column(column({
      declaredEvaluationScope: ["SECTION_UNIAXIAL"],
      actions: actions({ majorMoment: { status: "ABSENT" }, minorMoment: { status: "ABSENT" } }),
    }));
    expect(sectionOnly.executedCapabilityIds).not.toContain("EU_RC_SECOND_ORDER_EN1992_NOMINAL_CURVATURE_REFERENCE");
    expect(sectionOnly.nodes[0]?.executionStatus).toBe("BLOCKED_SCOPE_MISMATCH");
    const missing = (patch: Partial<EuC6NominalCurvatureInput>) => orchestrateEuC9R3Column(column({
      declaredEvaluationScope: ["MEMBER_SECOND_ORDER_UNIAXIAL"],
      secondOrder: {
        axis: "MAJOR_AXIS",
        nEdCompressionN: 500e3,
        m01Nmm: 10e6,
        m02Nmm: 20e6,
        l0Mm: 3000,
        phiEf: 1,
        esMPa: 200000,
        ...patch,
      } as EuC6NominalCurvatureInput,
    }));
    expect(missing({ l0Mm: null }).unresolvedInputs).toContain("l0Mm");
    expect(missing({ m01Nmm: null }).unresolvedInputs).toContain("m01Nmm");
    expect(missing({ m02Nmm: null }).unresolvedInputs).toContain("m02Nmm");
    expect(missing({ phiEf: null }).unresolvedInputs).toContain("phiEf");
    expect(missing({ esMPa: null }).unresolvedInputs).toContain("esMPa");
    const ordered = orchestrateEuC9R3Column(column({
      declaredEvaluationScope: ["MEMBER_SECOND_ORDER_UNIAXIAL"],
      secondOrder: {
        axis: "MAJOR_AXIS",
        nEdCompressionN: 500e3,
        m01Nmm: 30e6,
        m02Nmm: 10e6,
        l0Mm: 3000,
        phiEf: 1,
        esMPa: 200000,
      } as EuC6NominalCurvatureInput,
    }));
    expect(ordered.nodes[0]?.executionStatus).toBe("INVALID_INPUT");
    expect(ordered.overallState).toBe("MEMBER_UNDETERMINED");
    const phiOnly = orchestrateEuC9R3Column(column({
      declaredEvaluationScope: ["MEMBER_SECOND_ORDER_UNIAXIAL"],
      creepCoefficientPhi: 2,
      secondOrder: {
        axis: "MAJOR_AXIS",
        nEdCompressionN: 500e3,
        m01Nmm: 10e6,
        m02Nmm: 20e6,
        l0Mm: 3000,
        phiEf: null,
        esMPa: 200000,
      } as EuC6NominalCurvatureInput,
    }));
    expect(phiOnly.unresolvedInputs).toContain("phiEf");
    expect(phiOnly.c6Intermediate).toBeNull();
    expect(phiOnly.executedCapabilityIds).not.toContain("EU_RC_SECOND_ORDER_EN1992_NOMINAL_CURVATURE_REFERENCE");
  });

  it("aggregates required checks and keeps calculation and context from passing alone", () => {
    expect(orchestrateEuC9R3Column(column({ declaredEvaluationScope: [] })).overallState).toBe("MEMBER_UNDETERMINED");
    expect(orchestrateEuC9R3Column(column({ memberType: "BEAM" })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R3Column(column({ geometryShape: "CIRCULAR" })).overallState).toBe("MEMBER_UNDETERMINED");
    expect(orchestrateEuC9R3Column(column({ standardContext: { family: "OTHER", generation: "EN1992-1-1-GEN1", profileId: "x" } })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R3Column(column({ standardContext: { family: "EN1992", generation: "EN1992-1-1-GEN2", profileId: "x" } })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R3Column(column({ declaredEvaluationScope: ["SECTION_UNIAXIAL"], materialRef: null })).overallState).toBe("MEMBER_UNDETERMINED");
    const coverDirect = evaluateEuC8CoverAssembly(coverInput());
    const cover = orchestrateEuC9R3Column(column({ declaredEvaluationScope: ["COVER_REQUIREMENT"], cover: coverInput() }));
    expect(cover.nodes[0]?.nodeRole).toBe("CALCULATION");
    expect(cover.nodes[0]?.numericalResult).toBe(coverDirect.nominalCoverMm);
    expect(cover.overallState).toBe("MEMBER_UNDETERMINED");
    const contextOnly = orchestrateEuC9R3Column(column({ declaredEvaluationScope: ["LONG_TERM_CONTEXT"] }));
    expect(contextOnly.nodes[0]?.nodeRole).toBe("CONTEXT");
    expect(contextOnly.overallState).toBe("MEMBER_UNDETERMINED");
    const torsionMissing = orchestrateEuC9R3Column(column({ declaredEvaluationScope: ["TORSION"] }));
    expect(torsionMissing.unresolvedInputs).toContain("EXPLICIT_TORSION_INPUT");
    const spacingDirect = evaluateEuC8MinClearSpacing({
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
      barB: { x: { value: 100, unit: "mm" }, y: { value: 0, unit: "mm" }, diameter: { value: 16, unit: "mm" } },
      maximumAggregateSize: { value: 20, unit: "mm" },
      barDiameterCoefficient: 1,
      aggregateAllowance: { value: 5, unit: "mm" },
      barProvenanceRef: "bar-input",
      aggregateProvenanceRef: "aggregate-input",
      barDiameterCoefficientProvenanceRef: "k-input",
      aggregateAllowanceProvenanceRef: "allowance-input",
    });
    const spacing = orchestrateEuC9R3Column(column({
      declaredEvaluationScope: ["REINFORCEMENT_SPACING"],
      spacing: {
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
        barB: { x: { value: 100, unit: "mm" }, y: { value: 0, unit: "mm" }, diameter: { value: 16, unit: "mm" } },
        maximumAggregateSize: { value: 20, unit: "mm" },
        barDiameterCoefficient: 1,
        aggregateAllowance: { value: 5, unit: "mm" },
        barProvenanceRef: "bar-input",
        aggregateProvenanceRef: "aggregate-input",
        barDiameterCoefficientProvenanceRef: "k-input",
        aggregateAllowanceProvenanceRef: "allowance-input",
      },
    }));
    expect(spacing.nodes[0]?.executionStatus).toBe("SATISFIED");
    expect(spacing.nodes[0]?.numericalResult).toBe(spacingDirect.measuredClearSpacingMm);
    const unequal = orchestrateEuC9R3Column(column({
      declaredEvaluationScope: ["REINFORCEMENT_SPACING"],
      spacing: {
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
        barB: { x: { value: 100, unit: "mm" }, y: { value: 0, unit: "mm" }, diameter: { value: 20, unit: "mm" } },
        maximumAggregateSize: { value: 20, unit: "mm" },
        barDiameterCoefficient: 1,
        aggregateAllowance: { value: 5, unit: "mm" },
        barProvenanceRef: "bar-input",
        aggregateProvenanceRef: "aggregate-input",
        barDiameterCoefficientProvenanceRef: "k-input",
        aggregateAllowanceProvenanceRef: "allowance-input",
      },
    }));
    expect(unequal.nodes[0]?.executionStatus).toBe("NOT_IMPLEMENTED");
    expect(unequal.overallState).toBe("MEMBER_INCOMPLETE");
    const anchorageCalculation = evaluateEuC8BasicRequiredAnchorage(anchorageInput(false));
    const calculation = orchestrateEuC9R3Column(column({ declaredEvaluationScope: ["BASIC_ANCHORAGE"], anchorage: anchorageInput(false) }));
    expect(calculation.nodes[0]?.nodeRole).toBe("CALCULATION");
    expect(calculation.nodes[0]?.numericalResult).toBe(anchorageCalculation.basicRequiredAnchorageLengthMm);
    expect(calculation.overallState).toBe("MEMBER_UNDETERMINED");
    const anchorageCheck = evaluateEuC8BasicRequiredAnchorage(anchorageInput(true));
    const check = orchestrateEuC9R3Column(column({ declaredEvaluationScope: ["BASIC_ANCHORAGE"], anchorage: anchorageInput(true) }));
    expect(check.nodes[0]?.executionStatus).toBe("SATISFIED");
    expect(check.nodes[0]?.numericalResult).toBe(anchorageCheck.basicRequiredAnchorageLengthMm);
    const compression = orchestrateEuC9R3Column(column({
      declaredEvaluationScope: ["BASIC_ANCHORAGE"],
      anchorage: { ...anchorageInput(true), forceState: "COMPRESSION" },
    }));
    expect(compression.nodes[0]?.capabilityId).toBe("COMPRESSION_ANCHORAGE");
    expect(compression.nodes[0]?.executionStatus).toBe("NOT_IMPLEMENTED");
    expect(orchestrateEuC9R3Column(column({ declaredEvaluationScope: ["COMPRESSION_ANCHORAGE"] })).overallState).toBe("MEMBER_INCOMPLETE");
    expect(orchestrateEuC9R3Column(column({ declaredEvaluationScope: ["DESIGN_ANCHORAGE"] })).overallState).toBe("MEMBER_INCOMPLETE");
    expect(orchestrateEuC9R3Column(column({ declaredEvaluationScope: ["PROVIDED_COVER_COMPLIANCE"] })).overallState).toBe("MEMBER_INCOMPLETE");
    const laps = orchestrateEuC9R3Column(column({ declaredEvaluationScope: ["LAPS"] }));
    expect(laps.deferredChecks).toContain("LAPS");
    expect(laps.overallState).toBe("MEMBER_INCOMPLETE");
  });

  it("matches explicit torsion and invalidates a changed effective length", () => {
    const torsionDemand = {
      resultId: "d1c-t4",
      capacityPresent: false as const,
      memberId: "column-1",
      combinationId: "uls-t",
      shear: { value: 0, unit: "N" as const, locationM: 0, signed: 0 },
      torsion: {
        status: "TRANSPORTED" as const,
        actionId: D1C_TORSIONAL_ACTION_ID,
        actionType: D1C_TORSIONAL_ACTION_TYPE,
        signedValueNm: 50000,
        unit: D1C_TORSIONAL_ACTION_UNIT,
        axis: D1C_TORSIONAL_ACTION_AXIS,
        signConvention: D1C_TORSIONAL_ACTION_SIGN_CONVENTION,
        combinationId: "uls-t",
        provenance: { evidenceId: "ev-t", sourceDiscipline: "STRUCTURAL" as const, sourceObjectId: "member", revision: "A" },
        fingerprint: "fp-demand",
      },
    };
    const torsionRequest = {
      profileId: "EU-EN1992-1-1-GEN1-TORSION-REFERENCE",
      generation: "EN1992-1-1-FIRST_GENERATION" as const,
      profileVersion: "d1e-eu-c5-t3r.1",
      sectionKind: "RECTANGULAR_SOLID" as const,
      widthMm: 400,
      heightMm: 600,
      cotTheta: 2,
      prestressed: false,
      signedShearN: 0,
      fckMPa: 30,
      concreteElasticModulusMPa: 33000,
      fykLongitudinalMPa: 500,
      fykTransverseMPa: 500,
      reinforcementElasticModulusMPa: 200000,
      reinforcementReferenceAreaMm2: 100,
      alphaCc: 1,
      gammaC: 1.5,
      gammaS: 1.15,
      ndpSourceRef: "declared-project-ndp",
      transverseProvidedMm2PerMm: 2,
      longitudinalProvidedMm2: 4000,
    };
    const torsionInput: EuC5EvaluateInput = { demand: torsionDemand, torsionRequest };
    const direct = evaluateEuC5Torsion(torsionInput);
    const torsion = orchestrateEuC9R3Column(column({ declaredEvaluationScope: ["TORSION"], torsion: torsionInput }));
    expect(torsion.nodes[0]?.numericalResult).toBe(direct.resistance?.value ?? null);
    expect(torsion.nodes[0]?.executionStatus).toBe(direct.checkState === "CHECK_SATISFIED" ? "SATISFIED" : "NOT_SATISFIED");
    const first = orchestrateEuC9R3Column(column({ declaredEvaluationScope: ["MEMBER_SECOND_ORDER_UNIAXIAL"], secondOrder: c6Input({ c3: null }) }));
    const again = orchestrateEuC9R3Column(column({ declaredEvaluationScope: ["MEMBER_SECOND_ORDER_UNIAXIAL"], secondOrder: c6Input({ c3: null }) }));
    expect(again.memberFingerprint).toBe(first.memberFingerprint);
    const changed = orchestrateEuC9R3Column(column({
      declaredEvaluationScope: ["MEMBER_SECOND_ORDER_UNIAXIAL"],
      secondOrder: c6Input({ l0Mm: 4000, c3: null }),
      priorResultFingerprint: first.memberFingerprint,
    }));
    expect(changed.memberFingerprint).not.toBe(first.memberFingerprint);
    expect(changed.staleReuseRejected).toBe(true);
    expect(euC9R3ColumnExecutionDagHasCycle()).toBe(false);
    expect(EU_C9_R3_FULL_STANDARD_COVERAGE).toBe(false);
    expect(EU_C9_R3_NEW_ENGINEERING_FORMULA_IMPLEMENTED).toBe(false);
    expect(EU_C9_R3_IMPLEMENTED_COLUMN_ORCHESTRATOR_COUNT).toBe(1);
    expect(EU_C9_R3_ENGINEER_VALIDATED_COLUMN_ORCHESTRATOR_COUNT).toBe(0);
    expect(EU_C9_R3_C6_C3_SIGN_CONVERSION_COUNT).toBe(EU_C6_R2_AXIAL_SIGN_CONVERSION_COUNT);
    expect(EU_C9_R3_SOLID_SLAB_NEXT_FEASIBILITY).toBe("FEASIBLE_BOUNDED_NARROW");
    expect([...EU_C9_R3_VALIDATION_DEBT_REDUCED_ITEMS]).toEqual([
      "C9_COLUMN_RUNTIME_ORCHESTRATOR",
      "C9_COLUMN_ROUTING_VALIDATION",
      "C9_C6_C3_ORCHESTRATION_VALIDATION",
      "C9_COLUMN_AGGREGATION_VALIDATION",
    ]);
    expect(EU_C9_ORCHESTRATOR_REGISTRY.map((row) => row.orchestratorId)).toEqual([
      "EU_RC_BEAM_ORCHESTRATION_EN1992_REFERENCE",
      "EU_RC_COLUMN_ORCHESTRATION_EN1992_REFERENCE",
      "EU_RC_SOLID_SLAB_ORCHESTRATION_EN1992_REFERENCE",
      "EU_RC_WALL_SECTION_ORCHESTRATION_EN1992_REFERENCE",
    ]);
    expect(CONCRETE_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1E.EU.C9.COLUMN_ORCHESTRATION")?.implementationState).toBe("IMPLEMENTED_NUMERICALLY_VALIDATED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C9-R3-COLUMN-ORCHESTRATION")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C9-R4-SOLID-SLAB-ORCHESTRATION")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C9-R5-WALL-ORCHESTRATION")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C9-R6-CLOSEOUT")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C10-R1-INDEPENDENT-VALIDATION-READINESS")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C10-R2-METHOD-MEMBER-BENCHMARKS")?.status).toBe("NOT_STARTED");
    expect(EU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
  });

  it("matches direct C3 and C4 section checks", () => {
    const payload = c3Payload(20000, -500e3);
    const direct = evaluateEuC3DemandPointCheck(payload);
    const result = orchestrateEuC9R3Column(column({ c3: payload }));
    expect(result.sectionResult?.numericalResult).toBe(direct.utilization);
    expect(result.sectionResult?.checkState).toBe(direct.checkState);
    expect(result.executedCapabilityIds).toEqual(["EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MAJOR"]);
    expect(result.overallState).toBe(direct.checkState === "CHECK_SATISFIED" ? "MEMBER_SATISFIED_FOR_EXECUTED_BOUNDED_SCOPE" : direct.checkState === "CHECK_NOT_SATISFIED" ? "MEMBER_NOT_SATISFIED" : "MEMBER_UNDETERMINED");
    const c4Payload = {
      methodId: EU_C4_METHOD_IDS[0],
      geometry: rectangleSection("col", 300, 500, "col"),
      layout: layout(),
      concrete: concreteMaterial(),
      reinforcement: reinforcementMaterial(),
      context: context(),
      targetAxialN: 0,
      momentDirectionRad: 0,
      demandMyNm: 10000,
      resolutionX: 8,
      resolutionY: 8,
      provenanceRef: "col-c4",
      demand: demand(20000, 0),
    };
    const directC4 = evaluateEuC4DemandPointCheck(c4Payload);
    const biaxial = orchestrateEuC9R3Column(column({
      declaredEvaluationScope: ["SECTION_BIAXIAL"],
      actions: actions({ axial: { status: "AXIAL_DIRECT", valueN: 0 }, minorMoment: { status: "PRESENT", signedNm: 10000 } }),
      c4: c4Payload,
    }));
    expect(biaxial.sectionResult?.numericalResult).toBe(directC4.resistanceRadiusNm);
    expect(biaxial.sectionResult?.checkState).toBe(directC4.checkState);
    expect(biaxial.executedCapabilityIds).toEqual(["EU_RC_BIAXIAL_EN1992_PMM_RECTANGULAR"]);
    const over = c3Payload(5e6, -500e3);
    const overDirect = evaluateEuC3DemandPointCheck(over);
    const failed = orchestrateEuC9R3Column(column({
      declaredEvaluationScope: ["SECTION_UNIAXIAL", "LAPS"],
      actions: actions({ majorMoment: { status: "PRESENT", signedNm: 5e6 } }),
      c3: over,
    }));
    expect(failed.sectionResult?.checkState).toBe(overDirect.checkState);
    expect(failed.overallState).toBe("MEMBER_NOT_SATISFIED");
    expect(failed.failedChecks).toContain("D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL");
    expect(failed.deferredChecks).toContain("LAPS");
  }, 180000);

  it("reuses the governed C6 to C3 handoff once", () => {
    const sample = c6Input({
      c3: { methodId: EU_C3_METHOD_IDS[0], layout: layout(), resolutionX: 8, resolutionY: 8, provenanceRef: "c6-handoff" },
    });
    const direct = evaluateEuC6NominalCurvature(sample);
    const result = orchestrateEuC9R3Column(column({
      declaredEvaluationScope: ["MEMBER_SECOND_ORDER_UNIAXIAL"],
      secondOrder: sample,
    }));
    expect(result.c6Intermediate?.c3AxialInputN).toBe(-500e3);
    expect(result.c6Intermediate?.c3AxialInputN).toBe(direct.c3AxialInputN);
    expect(result.c6Intermediate?.c3MomentInputNm).toBe(direct.c3MomentInputNm);
    expect(result.c6Intermediate?.totalDesignMomentNmm).toBe(direct.totalDesignMomentNmm);
    expect(result.c6Intermediate?.secondOrderMomentNmm).toBe(direct.secondOrderMomentNmm);
    expect(result.c6Intermediate?.nominalCurvaturePerMm).toBe(direct.nominalCurvaturePerMm);
    expect(result.c6Intermediate?.slenderness).toBe(direct.slenderness);
    expect(result.c6Intermediate?.phiEf).toBe(1);
    expect(result.c6Intermediate?.additionalImperfectionNmm).toBe(0);
    expect(result.c6Intermediate?.signConversionCount).toBe(1);
    expect(result.c6Intermediate?.c3Utilization).toBe(direct.c3Utilization);
    expect(result.executedCapabilityIds.filter((id) => id === "EU_RC_SECOND_ORDER_EN1992_NOMINAL_CURVATURE_REFERENCE")).toHaveLength(1);
    expect(result.executedCapabilityIds.filter((id) => id === "EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MAJOR")).toHaveLength(1);
    expect(result.executedCapabilityIds).not.toContain("EU_RC_BIAXIAL_EN1992_PMM_RECTANGULAR");
    expect(result.checkNodes).toHaveLength(1);
    expect(result.overallState).toBe(direct.checkState === "SATISFIED" ? "MEMBER_SATISFIED_FOR_EXECUTED_BOUNDED_SCOPE" : "MEMBER_NOT_SATISFIED");
  }, 180000);
});
