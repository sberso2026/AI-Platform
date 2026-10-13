import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EU_C5_VMIN_EXPRESSION_ID, EU_CONCRETE_PACK_CERTIFIED, EU_CONCRETE_PRODUCT_CLAIM_LEVEL, EU_CONCRETE_STANDARD_CONFORMANCE_STATE } from "@rtb/types";
import { CONCRETE_CAPABILITY_MANIFEST, D1E_INTERNAL_ROADMAP } from "./capability";
import { evaluateEuC5Shear, type EuC5EvaluateInput } from "./eu-c5/evaluate";
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
import {
  EU_C9_R2_C2_C3_REDUNDANT_EXECUTION_FOR_PURE_FLEXURE,
  EU_C9_R2_C6_INVOKED_FOR_BEAM,
  EU_C9_R2_CALCULATION_NODE_CAN_COUNT_AS_SATISFIED,
  EU_C9_R2_COLUMN_NEXT_FEASIBILITY,
  EU_C9_R2_CONTEXT_NODE_CAN_COUNT_AS_SATISFIED,
  EU_C9_R2_EMPTY_REQUIRED_CHECK_SET_CAN_PASS,
  EU_C9_R2_ENGINEER_VALIDATED_BEAM_ORCHESTRATOR_COUNT,
  EU_C9_R2_FULL_STANDARD_COVERAGE,
  EU_C9_R2_IMPLEMENTED_BEAM_ORCHESTRATOR_COUNT,
  EU_C9_R2_NEW_ENGINEERING_FORMULA_IMPLEMENTED,
  EU_C9_R2_PUNCHING_STATE,
  EU_C9_R2_PURE_FLEXURE_ROUTING,
  EU_VALIDATION_DEBT_REDUCED_ITEMS,
  euC9R2BeamExecutionDagHasCycle,
  orchestrateEuC9R2Beam,
  routeEuC9R2SectionAction,
  type EuC9R2BeamInput,
  type EuC9R2SectionActions,
} from "./eu-c9/beam";

function actions(patch: Partial<EuC9R2SectionActions> = {}): EuC9R2SectionActions {
  return {
    axial: { status: "NO_AXIAL_COMPONENTS", valueN: 0 },
    majorMoment: { status: "PRESENT", signedNm: 50000 },
    minorMoment: { status: "ABSENT" },
    ...patch,
  };
}

function beam(patch: Partial<EuC9R2BeamInput> = {}): EuC9R2BeamInput {
  return {
    memberId: "beam-1",
    memberType: "BEAM",
    declaredEvaluationScope: ["ULS_SECTION"],
    standardContext: { family: "EN1992", generation: "EN1992-1-1-GEN1", profileId: "EU-EN1992-1-1-GEN1" },
    geometryShape: "RECTANGULAR",
    actions: actions(),
    combinationId: "uls-1",
    ...patch,
  };
}

function shearDemand(value: number): EuC5EvaluateInput["demand"] {
  return {
    resultId: "d1c-beam-shear",
    capacityPresent: false,
    memberId: "beam-1",
    combinationId: "uls-1",
    shear: { value, unit: "N", locationM: 0, signed: value },
    torsion: { status: "NOT_IMPLEMENTED" },
  };
}

function ndp(value: number, unit: string) {
  return { value, unit, sourceRef: "declared-beam-ndp" };
}

function shearInput(value: number, patch: Partial<EuC5EvaluateInput> = {}): EuC5EvaluateInput {
  return {
    demand: shearDemand(value),
    generation: "FIRST_GENERATION",
    axialForceN: 0,
    designShearReinforcement: "NONE",
    effectiveDepth: ndp(530, "mm"),
    webWidth: ndp(300, "mm"),
    longitudinalTensionArea: ndp(0, "mm2"),
    fck: ndp(30, "MPa"),
    cRdC: ndp(0.12, "dimensionless"),
    vMinCoefficient: ndp(0.035, "dimensionless"),
    vMinExpressionId: EU_C5_VMIN_EXPRESSION_ID,
    ...patch,
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

describe("EOS-D1E-EU-C9-R2 bounded beam orchestration", () => {
  it("routes section actions from exact presence without a redundant flexure pair", () => {
    expect(EU_C9_R2_PURE_FLEXURE_ROUTING).toBe("C2_WHEN_WITHIN_C2_SCOPE");
    expect(EU_C9_R2_C2_C3_REDUNDANT_EXECUTION_FOR_PURE_FLEXURE).toBe(false);
    const major = routeEuC9R2SectionAction(actions());
    expect(major.methodId).toBe("EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR");
    expect(major.executesC2).toBe(true);
    expect(major.executesC3).toBe(false);
    expect(major.executesC4).toBe(false);
    const minor = routeEuC9R2SectionAction(actions({
      majorMoment: { status: "ABSENT" },
      minorMoment: { status: "PRESENT", signedNm: -25000 },
    }));
    expect(minor.methodId).toBe("EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR");
    expect(minor.axis).toBe("MINOR_AXIS");
    expect(minor.momentSign).toBe("NEGATIVE");
    expect(minor.executesC3).toBe(false);
    const axialMajor = routeEuC9R2SectionAction(actions({ axial: { status: "AXIAL_DIRECT", valueN: -100000 } }));
    expect(axialMajor.methodId).toBe("EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MAJOR");
    expect(axialMajor.executesC2).toBe(false);
    expect(axialMajor.executesC3).toBe(true);
    const axialMinor = routeEuC9R2SectionAction(actions({
      axial: { status: "AXIAL_DIRECT", valueN: 80000 },
      majorMoment: { status: "PRESENT", signedNm: 0 },
      minorMoment: { status: "PRESENT", signedNm: 12000 },
    }));
    expect(axialMinor.methodId).toBe("EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MINOR");
    const biaxial = routeEuC9R2SectionAction(actions({
      minorMoment: { status: "PRESENT", signedNm: 10000 },
    }));
    expect(biaxial.methodId).toBe("EU_RC_BIAXIAL_EN1992_PMM_RECTANGULAR");
    expect(biaxial.executesC2).toBe(false);
    expect(biaxial.executesC3).toBe(false);
    const pureAxial = routeEuC9R2SectionAction(actions({
      axial: { status: "AXIAL_DIRECT", valueN: -200000 },
      majorMoment: { status: "PRESENT", signedNm: 0 },
      minorMoment: { status: "ABSENT" },
    }));
    expect(pureAxial.state).toBe("BLOCKED_SCOPE_MISMATCH");
    const pureAxialAxis = routeEuC9R2SectionAction(actions({
      axial: { status: "AXIAL_DIRECT", valueN: -200000 },
      majorMoment: { status: "PRESENT", signedNm: 0 },
      minorMoment: { status: "ABSENT" },
      pureAxialSectionAxis: "MAJOR_AXIS",
    }));
    expect(pureAxialAxis.methodId).toBe("EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MAJOR");
    const zeroMajor = routeEuC9R2SectionAction(actions({ axial: { status: "AXIAL_DIRECT", valueN: 0 } }));
    expect(zeroMajor.methodId).toBe("EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR");
  });

  it("does not execute C3 for pure flexure and does not invoke punching or C6", () => {
    const result = orchestrateEuC9R2Beam(beam());
    expect(result.selectedSectionMethodId).toBe("EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR");
    expect(result.executedCapabilityIds).not.toContain("D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL");
    expect(result.nodes.some((item) => item.capabilityId === "D1E.EU.C5.PUNCHING")).toBe(false);
    expect(result.nodes.some((item) => item.capabilityId === "D1E.EU.C6.NOMINAL_CURVATURE")).toBe(false);
    const punching = orchestrateEuC9R2Beam(beam({ declaredEvaluationScope: ["PUNCHING"] }));
    expect(punching.nodes[0]?.executionStatus).toBe("NOT_APPLICABLE");
    expect(punching.overallState).toBe("MEMBER_UNDETERMINED");
    expect(EU_C9_R2_PUNCHING_STATE).toBe("NOT_APPLICABLE");
    const secondOrder = orchestrateEuC9R2Beam(beam({ declaredEvaluationScope: ["SECOND_ORDER"] }));
    expect(secondOrder.nodes[0]?.capabilityId).toBe("D1E.EU.C6.NOMINAL_CURVATURE");
    expect(secondOrder.nodes[0]?.executionStatus).toBe("NOT_APPLICABLE");
    expect(EU_C9_R2_C6_INVOKED_FOR_BEAM).toBe(false);
    const source = readFileSync(new URL("./eu-c9/beam.ts", import.meta.url), "utf8");
    expect(source).not.toContain("evaluateEuC5Punching");
    expect(source).not.toContain("evaluateEuC6");
    expect(source).not.toContain("fyd");
    expect(source).not.toMatch(/Math\./);
    expect(source).not.toContain("releaseEligible");
  });

  it("keeps shear inside the zero-axial method and matches that method numerically", () => {
    const direct = evaluateEuC5Shear(shearInput(60000));
    const passed = orchestrateEuC9R2Beam(beam({
      declaredEvaluationScope: ["SHEAR"],
      actions: actions({ axial: { status: "AXIAL_DIRECT", valueN: 0 } }),
      shear: shearInput(60000),
    }));
    expect(passed.overallState).toBe("MEMBER_SATISFIED_FOR_EXECUTED_BOUNDED_SCOPE");
    expect(passed.nodes[0]?.numericalResult).toBe(direct.resistance?.value ?? null);
    expect(passed.fullStandardCoverage).toBe(false);
    const failedDirect = evaluateEuC5Shear(shearInput(120000));
    const failed = orchestrateEuC9R2Beam(beam({
      declaredEvaluationScope: ["SHEAR"],
      actions: actions({ axial: { status: "AXIAL_DIRECT", valueN: 0 } }),
      shear: shearInput(120000),
    }));
    expect(failed.overallState).toBe("MEMBER_NOT_SATISFIED");
    expect(failed.nodes[0]?.numericalResult).toBe(failedDirect.resistance?.value ?? null);
    const outside = orchestrateEuC9R2Beam(beam({
      declaredEvaluationScope: ["SHEAR"],
      actions: actions({ axial: { status: "AXIAL_DIRECT", valueN: -50000 } }),
      shear: shearInput(60000),
    }));
    expect(outside.nodes[0]?.executionStatus).toBe("BLOCKED_SCOPE_MISMATCH");
    expect(outside.executedCapabilityIds).not.toContain("D1E.EU.C5.SHEAR");
    const reinforced = orchestrateEuC9R2Beam(beam({
      declaredEvaluationScope: ["SHEAR"],
      actions: actions({ axial: { status: "AXIAL_DIRECT", valueN: 0 } }),
      shear: shearInput(60000, { designShearReinforcement: "PRESENT" }),
    }));
    expect(reinforced.nodes[0]?.executionStatus).toBe("BLOCKED_SCOPE_MISMATCH");
  });

  it("aggregates checks without counting calculation, context, empty, or deferred work as a pass", () => {
    expect(EU_C9_R2_EMPTY_REQUIRED_CHECK_SET_CAN_PASS).toBe(false);
    expect(EU_C9_R2_CALCULATION_NODE_CAN_COUNT_AS_SATISFIED).toBe(false);
    expect(EU_C9_R2_CONTEXT_NODE_CAN_COUNT_AS_SATISFIED).toBe(false);
    expect(orchestrateEuC9R2Beam(beam({ declaredEvaluationScope: [] })).overallState).toBe("MEMBER_UNDETERMINED");
    const coverDirect = evaluateEuC8CoverAssembly(coverInput());
    const cover = orchestrateEuC9R2Beam(beam({ declaredEvaluationScope: ["COVER_REQUIREMENT"], cover: coverInput() }));
    expect(cover.nodes[0]?.nodeRole).toBe("CALCULATION");
    expect(cover.nodes[0]?.executionStatus).toBe("CALCULATED");
    expect(cover.nodes[0]?.numericalResult).toBe(coverDirect.nominalCoverMm);
    expect(cover.overallState).toBe("MEMBER_UNDETERMINED");
    const contextOnly = orchestrateEuC9R2Beam(beam({ declaredEvaluationScope: ["LONG_TERM_CONTEXT"] }));
    expect(contextOnly.nodes[0]?.nodeRole).toBe("CONTEXT");
    expect(contextOnly.nodes[0]?.executionStatus).toBe("UNDETERMINED");
    expect(contextOnly.overallState).toBe("MEMBER_UNDETERMINED");
    const missingCrack = orchestrateEuC9R2Beam(beam({ declaredEvaluationScope: ["SLS_CRACK_WIDTH"] }));
    expect(missingCrack.unresolvedInputs).toContain("sigmaS");
    expect(missingCrack.overallState).toBe("MEMBER_UNDETERMINED");
    const deflection = orchestrateEuC9R2Beam(beam({ declaredEvaluationScope: ["DEFLECTION"] }));
    expect(deflection.overallState).toBe("MEMBER_INCOMPLETE");
    expect(deflection.deferredChecks).toContain("DEFLECTION");
    const creep = orchestrateEuC9R2Beam(beam({ declaredEvaluationScope: ["CALCULATED_CREEP"] }));
    expect(creep.deferredChecks).toContain("CALCULATED_CREEP");
    expect(creep.overallState).toBe("MEMBER_INCOMPLETE");
    const provided = orchestrateEuC9R2Beam(beam({ declaredEvaluationScope: ["PROVIDED_COVER_COMPLIANCE"] }));
    expect(provided.unavailableChecks).toContain("PROVIDED_COVER_COMPLIANCE");
    expect(provided.overallState).toBe("MEMBER_INCOMPLETE");
    const designAnchorage = orchestrateEuC9R2Beam(beam({ declaredEvaluationScope: ["DESIGN_ANCHORAGE"] }));
    expect(designAnchorage.overallState).toBe("MEMBER_INCOMPLETE");
    const laps = orchestrateEuC9R2Beam(beam({ declaredEvaluationScope: ["LAP_DESIGN"] }));
    expect(laps.deferredChecks).toContain("LAPS");
    expect(laps.overallState).toBe("MEMBER_INCOMPLETE");
    const both = orchestrateEuC9R2Beam(beam({
      declaredEvaluationScope: ["SHEAR", "DEFLECTION"],
      actions: actions({ axial: { status: "AXIAL_DIRECT", valueN: 0 } }),
      shear: shearInput(120000),
    }));
    expect(both.overallState).toBe("MEMBER_NOT_SATISFIED");
    expect(both.failedChecks).toContain("D1E.EU.C5.SHEAR");
    expect(both.deferredChecks).toContain("DEFLECTION");
  });

  it("distinguishes spacing, anchorage calculation, and anchorage check", () => {
    const spacingInput = {
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
    };
    const spacingDirect = evaluateEuC8MinClearSpacing(spacingInput);
    const spacing = orchestrateEuC9R2Beam(beam({ declaredEvaluationScope: ["REINFORCEMENT_SPACING"], spacing: spacingInput }));
    expect(spacing.nodes[0]?.executionStatus).toBe("SATISFIED");
    expect(spacing.nodes[0]?.numericalResult).toBe(spacingDirect.measuredClearSpacingMm);
    expect(spacing.overallState).toBe("MEMBER_SATISFIED_FOR_EXECUTED_BOUNDED_SCOPE");
    const unequal = orchestrateEuC9R2Beam(beam({
      declaredEvaluationScope: ["REINFORCEMENT_SPACING"],
      spacing: {
        ...spacingInput,
        barB: { x: { value: 100, unit: "mm" }, y: { value: 0, unit: "mm" }, diameter: { value: 20, unit: "mm" } },
      },
    }));
    expect(unequal.nodes[0]?.executionStatus).toBe("NOT_IMPLEMENTED");
    expect(unequal.overallState).toBe("MEMBER_INCOMPLETE");
    const calculatedDirect = evaluateEuC8BasicRequiredAnchorage(anchorageInput(false));
    const calculated = orchestrateEuC9R2Beam(beam({ declaredEvaluationScope: ["BASIC_ANCHORAGE"], anchorage: anchorageInput(false) }));
    expect(calculated.nodes[0]?.nodeRole).toBe("CALCULATION");
    expect(calculated.nodes[0]?.executionStatus).toBe("CALCULATED");
    expect(calculated.nodes[0]?.numericalResult).toBe(calculatedDirect.basicRequiredAnchorageLengthMm);
    expect(calculated.overallState).toBe("MEMBER_UNDETERMINED");
    const checkedDirect = evaluateEuC8BasicRequiredAnchorage(anchorageInput(true));
    const checked = orchestrateEuC9R2Beam(beam({ declaredEvaluationScope: ["BASIC_ANCHORAGE"], anchorage: anchorageInput(true) }));
    expect(checked.nodes[0]?.nodeRole).toBe("CHECK");
    expect(checked.nodes[0]?.executionStatus).toBe("SATISFIED");
    expect(checked.nodes[0]?.numericalResult).toBe(checkedDirect.basicRequiredAnchorageLengthMm);
    expect(checked.overallState).toBe("MEMBER_SATISFIED_FOR_EXECUTED_BOUNDED_SCOPE");
    expect(checked.evaluationCompleteForDeclaredScope).toBe(true);
  });

  it("fails closed on profile, geometry, torsion inputs, and stale fingerprints", () => {
    expect(orchestrateEuC9R2Beam(beam({ memberType: "COLUMN" })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R2Beam(beam({ geometryShape: "CIRCULAR" })).overallState).toBe("MEMBER_UNDETERMINED");
    expect(orchestrateEuC9R2Beam(beam({ standardContext: { family: "ACI", generation: "EN1992-1-1-GEN1", profileId: "x" } })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R2Beam(beam({ standardContext: { family: "EN1992", generation: "GEN2", profileId: "x" } })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R2Beam(beam({ standardContext: null })).overallState).toBe("ORCHESTRATION_BLOCKED");
    expect(orchestrateEuC9R2Beam(beam({ ndpValueOnlyReuse: true })).overallState).toBe("ORCHESTRATION_BLOCKED");
    const torsion = orchestrateEuC9R2Beam(beam({ declaredEvaluationScope: ["TORSION"] }));
    expect(torsion.unresolvedInputs).toContain("EXPLICIT_TORSION_INPUT");
    expect(torsion.overallState).toBe("MEMBER_UNDETERMINED");
    const first = orchestrateEuC9R2Beam(beam());
    const again = orchestrateEuC9R2Beam(beam());
    expect(again.memberFingerprint).toBe(first.memberFingerprint);
    const changed = orchestrateEuC9R2Beam(beam({ combinationId: "uls-2", priorResultFingerprint: first.memberFingerprint }));
    expect(changed.memberFingerprint).not.toBe(first.memberFingerprint);
    expect(changed.staleReuseRejected).toBe(true);
    expect(euC9R2BeamExecutionDagHasCycle()).toBe(false);
    expect(EU_C9_R2_NEW_ENGINEERING_FORMULA_IMPLEMENTED).toBe(false);
    expect(EU_C9_R2_IMPLEMENTED_BEAM_ORCHESTRATOR_COUNT).toBe(1);
    expect(EU_C9_R2_ENGINEER_VALIDATED_BEAM_ORCHESTRATOR_COUNT).toBe(0);
    expect(EU_C9_R2_FULL_STANDARD_COVERAGE).toBe(false);
    expect(EU_C9_R2_COLUMN_NEXT_FEASIBILITY).toBe("FEASIBLE_BOUNDED_NARROW");
    expect([...EU_VALIDATION_DEBT_REDUCED_ITEMS]).toEqual([
      "C9_BEAM_RUNTIME_ORCHESTRATOR",
      "C9_BEAM_ROUTING_VALIDATION",
      "C9_BEAM_AGGREGATION_VALIDATION",
    ]);
    expect(CONCRETE_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1E.EU.C9.BEAM_ORCHESTRATION")?.implementationState).toBe("IMPLEMENTED_NUMERICALLY_VALIDATED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C9-R2-BEAM-ORCHESTRATION")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C9-R3-COLUMN-ORCHESTRATION")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C9-R4-SOLID-SLAB-ORCHESTRATION")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C9-R5-WALL-ORCHESTRATION")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C9-R6-CLOSEOUT")?.status).toBe("NOT_STARTED");
    expect(EU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
  });
});
