import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_EU_C4_ASSISTANCE_ADVISORY_ONLY,
  AI_EU_C4_CONFORMANCE_AUTHORITY,
  AI_EU_C4_ENGINEERING_APPROVAL,
  AI_EU_C4_MATERIAL_PARAMETER_AUTHORITY,
  AI_EU_C4_NDP_AUTHORITY,
  AI_EU_C4_SOLVER_OVERRIDE_AUTHORITY,
  AI_SURFACE_OVERRIDE_AUTHORITY,
  D1C_AXIAL_DEMAND_REUSED,
  D1C_BIAXIAL_MOMENT_DEMAND_REUSED,
  D1E1_BIAXIAL_PLANE_SECTION_KINEMATICS_AVAILABLE,
  D1E1_BIAXIAL_PLANE_SECTION_KINEMATICS_REUSED,
  D1E1_BIAXIAL_SECTION_RESULTANTS_SUPPORTED,
  D1E1_COUPLED_BIAXIAL_EQUILIBRIUM_CAPABILITY,
  D1E1_EQUILIBRIUM_SOLVER_REUSED,
  D1E1_REINFORCEMENT_GEOMETRY_REUSED,
  D1E1_SECTION_GEOMETRY_REUSED,
  D1E1_SECTION_INTEGRATOR_REUSED,
  D1E_FROZEN_ARCHITECTURE_PRESERVED,
  DEFAULT_EU_CONCRETE_NATIONAL_ANNEX,
  EOS_D1E_EU_C4_CLOSED,
  EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE,
  EU_C1C_R1_PARAMETER_VERSION,
  EU_C2_METHOD_IDS,
  EU_C3_AXIAL_APPLICABILITY,
  EU_C3_METHOD_IDS,
  EU_C4_ADDITIONAL_REQUIRED_RULE_IDS,
  EU_C4_BENCHMARK_MATRIX_COMPLETE,
  EU_C4_BRESLER_STYLE_RULE_ASSUMED_WITHOUT_AUTHORITY,
  EU_C4_C2_METHODS_LOADED,
  EU_C4_C3_METHODS_LOADED,
  EU_C4_CANONICAL_NEXT_PHASE,
  EU_C4_ELLIPTICAL_INTERACTION_ASSUMED_WITHOUT_AUTHORITY,
  EU_C4_ENGINEER_VALIDATED_BIAXIAL_METHOD_COUNT,
  EU_C4_ENGINEER_VALIDATION_STATE,
  EU_C4_EXTERNAL_SOFTWARE_COMPARISON,
  EU_C4_IMPLEMENTED_BIAXIAL_METHOD_COUNT,
  EU_C4_LINEAR_BIAXIAL_INTERACTION_ASSUMED_WITHOUT_AUTHORITY,
  EU_C4_METHOD_IDS,
  EU_C4_NDP_VALUE_GUESSED,
  EU_C4_NUMERICALLY_VALIDATED_BIAXIAL_METHOD_COUNT,
  EU_C4_NUMERICAL_TOLERANCE,
  EU_C4_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  EU_C4_RULE_DEPENDENCY_AUDIT,
  EU_C4_SECOND_ORDER_EFFECTS_IMPLEMENTED,
  EU_C4_SECTION_PMM_EQUALS_COLUMN_STABILITY,
  EU_C4_SECTION_SURFACE_EQUALS_COLUMN_DESIGN,
  EU_C4_SELF_REFERENTIAL_BENCHMARKS,
  EU_C4_SLENDERNESS_CHECK_IMPLEMENTED,
  EU_C4_SUPPORTED_AXIAL_DOMAIN,
  EU_C4_SUPPORTED_GEOMETRY_TYPES,
  EU_C4_SURFACE_CONVERGENCE_CRITERION,
  EU_C4_UNGOVERNED_SCALAR_INTERACTION_UTILIZATION,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  GENERATIVE_MODEL_CAN_BYPASS_EU_C4,
  IMPLEMENTED_EU_CONCRETE_CODE_BIAXIAL_METHODS,
  LLM_EU_C4_NUMERICAL_AUTHORITY,
  NATIONAL_ANNEX_INFERRED_FROM_LOCATION,
  NUMERICAL_BIAXIAL_VALIDATION_EQUALS_STANDARD_CONFORMANCE,
  PARALLEL_CAPABILITY_MANIFEST_CREATED,
  PARALLEL_EU_BIAXIAL_EQUILIBRIUM_SOLVER_CREATED,
  PARALLEL_EU_BIAXIAL_KINEMATICS_CREATED,
  PARALLEL_EU_BIAXIAL_SECTION_KERNEL_CREATED,
  RECOMMENDED_D1E_NEXT_PHASE,
  SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C4,
  TEST_ONLY_NDP_BECOMES_RUNTIME_DEFAULT,
  type ConcreteMaterial,
  type EuC1cR1DeclaredNdpValue,
  type ReinforcementLayout,
  type ReinforcementMaterial,
  type StructuralDemandResult,
} from "@rtb/types";
import { createConfiguredKnowledgeContext } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import { CONCRETE_CAPABILITY_MANIFEST, D1E_INTERNAL_ROADMAP, D1E_VALIDATION_DEBT_REGISTER } from "./capability";
import {
  EU_C4_INDEPENDENT_BENCHMARK_ASSUMPTION,
  assertEuC4OptimizerRejectsUndetermined,
  assertEuC4ParetoRejectsUndetermined,
  assertStaleEuC4NotReused,
  euC4InvalidationTags,
  evaluateEuC4CoupledDemandSolve,
  evaluateEuC4DemandPointCheck,
  evaluateEuC4InteractionPoint,
  evaluateEuC4InteractionSurface,
  independentDiagonalVertexNm,
  interpolateEuC4SurfaceRadius,
  reproduceC2PureFlexure,
  reproduceC3Principal,
  validateEuC4SurfaceTopology,
} from "./eu-c4";
import { EU_CONCRETE_BIAXIAL_METHODS } from "./eu-flexure";
import { circularSection, rectangleSection } from "./section-mechanics";

function property(name: string, value: number | null, unit: string | null) {
  return { name, value, unit, provenanceRef: "cert-c4", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
}
function ndp(value: number): EuC1cR1DeclaredNdpValue {
  return { value, unit: "dimensionless", sourceAuthority: "DECLARED_NDP_OR_PROJECT_OVERRIDE", provenanceRef: "declared-ndp-c4", ndpIdentity: "DECLARED_PROJECT_OVERRIDE", version: EU_C1C_R1_PARAMETER_VERSION };
}
function testOnlyNdp(value: number): EuC1cR1DeclaredNdpValue {
  return { ...ndp(value), sourceAuthority: EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE, provenanceRef: "test-only-non-conformance" };
}
function context() {
  return { nationalAnnexRef: "DECLARED_TEST_NA", gamma_c: testOnlyNdp(1.5), gamma_s: testOnlyNdp(1.15), alpha_cc: testOnlyNdp(1), testOnlyNonConformance: true };
}
function concrete(fc = 30, unit = "MPa"): ConcreteMaterial {
  return {
    materialRef: "eu-c4-conc", designation: "C30", compressiveStrength: property("fc", fc, unit), tensileStrength: null,
    elasticModulus: property("Ec", 33000, "MPa"), density: null, poissonRatio: null, age: null, strengthReferenceAge: null,
    materialClass: null, materialStandardRef: "project-certificate", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    testCertificateRef: "tc-c4", environmentalMetadata: null, version: "c4",
    provenance: governedProvenance({ jurisdiction: "eu", standard: "EN 1992", version: "c4.0" }),
  };
}
function reo(fy = 500): ReinforcementMaterial {
  return {
    materialRef: "eu-c4-reo", designation: "B500B", yieldStrength: property("fy", fy, "MPa"), ultimateStrength: null,
    elasticModulus: property("Es", 200000, "MPa"), ductilityClass: null, productStandardRef: "project-certificate",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE", version: "c4",
    provenance: governedProvenance({ jurisdiction: "eu", standard: "EN 1992", version: "c4.0" }),
  };
}
function bar(id: string, xMm: number, yMm: number, areaMm2: number, face: string): ReinforcementLayout["bars"][number] {
  return {
    barId: id, designation: "H20", diameterMm: property("d", 20, "mm"), areaMm2: property("As", areaMm2, "mm2"), count: 1,
    xMm, yMm, layerId: null, face, direction: "longitudinal", spacingMm: null, groupId: null, materialRef: "eu-c4-reo",
    anchorageMetadata: null, lapMetadata: null, provenanceRef: "layout-c4",
  };
}
function layout(bars: ReinforcementLayout["bars"], id = "lay-c4"): ReinforcementLayout {
  return { layoutId: id, bars, groups: [], layers: [], transverse: [], provenanceRef: "layout-c4" };
}
const singlyBottom = layout([bar("b1", 50, 50, 314, "bottom"), bar("b2", 150, 50, 314, "bottom"), bar("b3", 250, 50, 314, "bottom")]);
const doubly = layout([
  bar("b1", 50, 50, 314, "bottom"), bar("b2", 150, 50, 314, "bottom"), bar("b3", 250, 50, 314, "bottom"),
  bar("t1", 50, 450, 201, "top"), bar("t2", 250, 450, 201, "top"),
]);
const symmetric = layout([
  bar("b1", 50, 50, 314, "bottom"), bar("b2", 250, 50, 314, "bottom"),
  bar("t1", 50, 450, 314, "top"), bar("t2", 250, 450, 314, "top"),
]);
const asymmetric = layout([
  bar("b1", 40, 50, 314, "bottom"), bar("b2", 110, 50, 314, "bottom"), bar("b3", 180, 50, 314, "bottom"), bar("b4", 250, 50, 314, "bottom"),
  bar("t1", 50, 450, 201, "top"), bar("t2", 250, 450, 201, "top"),
]);

const euDemandContext = createConfiguredKnowledgeContext({
  contextId: "ctx-en1992-c4", jurisdictionProfileRef: "eu-eea", standardFamily: "EN", standardCode: "EN 1992",
  edition: "UNKNOWN_PENDING_CONFIRMATION", materialScope: "concrete",
});
function demand(momentNm: number, axialN = 0): StructuralDemandResult {
  return {
    resultId: "demand-c4", memberId: "m-c4", boundaryCondition: "SIMPLE_SIMPLE", spanM: 8, combinationId: "comb-1",
    loadCaseIds: ["g"], methods: ["SS_BEAM_UDL"],
    reactions: { startFyN: 0, endFyN: 0, startMzNm: 0, endMzNm: 0, unitForce: "N", unitMoment: "N.m" },
    shear: { value: 80000, unit: "N", locationM: 0, signed: 80000 },
    moment: { value: Math.abs(momentNm), unit: "N.m", locationM: 4, signed: momentNm },
    axial: axialN === 0 ? { status: "NO_AXIAL_COMPONENTS", valueN: 0 } : { valueN: axialN, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "elastic D1C not long-term RC" }, torsion: { status: "NOT_IMPLEMENTED" },
    stiffness: null, equilibriumResidual: { forceN: 0, momentNm: 0 }, outputClass: "DETERMINISTIC_DEMAND",
    capacityPresent: false, designPassFailPresent: false, humanReviewRequired: true, approvalState: "not_approved",
    llmOriginated: false, standardContext: euDemandContext, toolRef: "d1c", toolVersion: "d1c",
    provenanceRef: governedProvenance({ jurisdiction: "eu-eea", standard: "EN 1992", version: "d1e-eu-c4" }),
    inputEvidenceRefs: [{ evidenceId: "ev-d", sourceKind: "calculation", reference: "d1c" }],
    foundationReactionHandoff: { startFyN: 0, endFyN: 0, startMzNm: 0, endMzNm: 0, geotechnicalCapacityCalculated: false },
  };
}
function closeAbsRel(actual: number, expected: number, abs: number, rel: number): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(Math.max(abs, rel * Math.abs(expected)));
}
function base(args: { theta?: number; bars?: ReinforcementLayout; fc?: number; fy?: number; mesh?: number; n?: number; maxIter?: number }) {
  return {
    methodId: EU_C4_METHOD_IDS[0],
    geometry: rectangleSection("c4-rect", 300, 500, "c4"),
    layout: args.bars ?? singlyBottom,
    concrete: concrete(args.fc ?? 30),
    reinforcement: reo(args.fy ?? 500),
    context: context(),
    targetAxialN: args.n ?? 0,
    momentDirectionRad: args.theta ?? 0,
    resolutionX: args.mesh ?? 12,
    resolutionY: args.mesh ?? 12,
    maxBisectionIterations: args.maxIter,
    provenanceRef: "c4-test",
  };
}

describe("EOS-D1E-EU-C4 bounded biaxial P-M-M", () => {
  it("audits C2/C3 reuse, architecture freeze, and uncertified conformance", () => {
    expect(EU_C4_C2_METHODS_LOADED).toBe(true);
    expect(EU_C4_C3_METHODS_LOADED).toBe(true);
    expect([...EU_C2_METHOD_IDS]).toEqual(["EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR", "EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR"]);
    expect([...EU_C3_METHOD_IDS]).toEqual(["EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MAJOR", "EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MINOR"]);
    expect(EU_C4_RULE_DEPENDENCY_AUDIT).toBe("PASS");
    expect(EU_C4_ADDITIONAL_REQUIRED_RULE_IDS).toBe("NONE");
    expect(D1E_FROZEN_ARCHITECTURE_PRESERVED).toBe(true);
    expect(PARALLEL_EU_BIAXIAL_SECTION_KERNEL_CREATED).toBe(false);
    expect(PARALLEL_EU_BIAXIAL_KINEMATICS_CREATED).toBe(false);
    expect(PARALLEL_EU_BIAXIAL_EQUILIBRIUM_SOLVER_CREATED).toBe(false);
    expect(PARALLEL_CAPABILITY_MANIFEST_CREATED).toBe(false);
    expect(D1E1_BIAXIAL_PLANE_SECTION_KINEMATICS_AVAILABLE).toBe(true);
    expect(D1E1_BIAXIAL_PLANE_SECTION_KINEMATICS_REUSED).toBe(true);
    expect(D1E1_COUPLED_BIAXIAL_EQUILIBRIUM_CAPABILITY).toBe(true);
    expect(D1E1_BIAXIAL_SECTION_RESULTANTS_SUPPORTED).toBe(true);
    expect(D1E1_SECTION_GEOMETRY_REUSED).toBe(true);
    expect(D1E1_REINFORCEMENT_GEOMETRY_REUSED).toBe(true);
    expect(D1E1_SECTION_INTEGRATOR_REUSED).toBe(true);
    expect(D1E1_EQUILIBRIUM_SOLVER_REUSED).toBe(true);
    expect(D1C_AXIAL_DEMAND_REUSED).toBe(true);
    expect(D1C_BIAXIAL_MOMENT_DEMAND_REUSED).toBe(true);
    expect([...EU_C4_METHOD_IDS]).toEqual(["EU_RC_BIAXIAL_EN1992_PMM_RECTANGULAR"]);
    expect([...IMPLEMENTED_EU_CONCRETE_CODE_BIAXIAL_METHODS]).toEqual([...EU_C4_METHOD_IDS]);
    expect(EU_C4_IMPLEMENTED_BIAXIAL_METHOD_COUNT).toBe(1);
    expect(EU_C4_NUMERICALLY_VALIDATED_BIAXIAL_METHOD_COUNT).toBe(1);
    expect(EU_C4_ENGINEER_VALIDATED_BIAXIAL_METHOD_COUNT).toBe(0);
    expect(EU_C4_ENGINEER_VALIDATION_STATE).toBe("PENDING_HUMAN_ENGINEERING_REVIEW");
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(NUMERICAL_BIAXIAL_VALIDATION_EQUALS_STANDARD_CONFORMANCE).toBe(false);
    expect(EU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(EU_C4_SECTION_SURFACE_EQUALS_COLUMN_DESIGN).toBe(false);
    expect(EU_C4_SECTION_PMM_EQUALS_COLUMN_STABILITY).toBe(false);
    expect(EU_C4_SECOND_ORDER_EFFECTS_IMPLEMENTED).toBe(false);
    expect(EU_C4_SLENDERNESS_CHECK_IMPLEMENTED).toBe(false);
    expect(EU_C4_ELLIPTICAL_INTERACTION_ASSUMED_WITHOUT_AUTHORITY).toBe(false);
    expect(EU_C4_LINEAR_BIAXIAL_INTERACTION_ASSUMED_WITHOUT_AUTHORITY).toBe(false);
    expect(EU_C4_BRESLER_STYLE_RULE_ASSUMED_WITHOUT_AUTHORITY).toBe(false);
    expect(EU_C4_UNGOVERNED_SCALAR_INTERACTION_UTILIZATION).toBe(false);
    expect(DEFAULT_EU_CONCRETE_NATIONAL_ANNEX).toBe(false);
    expect(NATIONAL_ANNEX_INFERRED_FROM_LOCATION).toBe(false);
    expect(EU_C4_NDP_VALUE_GUESSED).toBe(false);
    expect(TEST_ONLY_NDP_BECOMES_RUNTIME_DEFAULT).toBe(false);
    expect(LLM_EU_C4_NUMERICAL_AUTHORITY).toBe(false);
    expect(AI_EU_C4_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(AI_EU_C4_MATERIAL_PARAMETER_AUTHORITY).toBe(false);
    expect(AI_EU_C4_NDP_AUTHORITY).toBe(false);
    expect(AI_EU_C4_SOLVER_OVERRIDE_AUTHORITY).toBe(false);
    expect(AI_SURFACE_OVERRIDE_AUTHORITY).toBe(false);
    expect(AI_EU_C4_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_EU_C4_ENGINEERING_APPROVAL).toBe(false);
    expect(GENERATIVE_MODEL_CAN_BYPASS_EU_C4).toBe(false);
    expect(EU_C4_OPTIMIZATION_ACCEPTS_UNDETERMINED).toBe(false);
    expect(SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C4).toBe(false);
    expect(EOS_D1E_EU_C4_CLOSED).toBe(true);
    expect(RECOMMENDED_D1E_NEXT_PHASE).toBe("EOS-D1E-EU-C5-EVIDENCE");
    expect(EU_C4_CANONICAL_NEXT_PHASE).toBe("EOS-D1E-EU-C5");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C4")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C5")?.status).toBe("CLOSED");
    expect(CONCRETE_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1E.EU.C4.BIAXIAL.PMM")).toBe(true);
    expect(D1E_VALIDATION_DEBT_REGISTER.find((row) => row.debtId === "D1E-EU-VD-BIAXIAL")?.blockingState).toBe("PARTIAL");
    expect([...EU_C4_SUPPORTED_GEOMETRY_TYPES]).toEqual(["RECTANGULAR"]);
    expect(EU_C4_SUPPORTED_AXIAL_DOMAIN).toBe(EU_C3_AXIAL_APPLICABILITY);
    expect(EU_CONCRETE_BIAXIAL_METHODS).toHaveLength(1);
    expect(EU_C4_EXTERNAL_SOFTWARE_COMPARISON).toBe("NOT_AVAILABLE");
    expect(EU_C4_SURFACE_CONVERGENCE_CRITERION.length).toBeGreaterThan(20);
  });

  it("reproduces C3 principal-axis and C2 pure-flexure anchors", { timeout: 60_000 }, () => {
    expect(EU_C4_SELF_REFERENTIAL_BENCHMARKS).toBe(false);
    const major = reproduceC3Principal({ ...base({}), axis: "MAJOR_AXIS" });
    expect("c3Nm" in major).toBe(true);
    if (!("c3Nm" in major)) return;
    closeAbsRel(major.c4Nm, major.c3Nm, EU_C4_NUMERICAL_TOLERANCE.c3AnchorAbsNm, EU_C4_NUMERICAL_TOLERANCE.c3AnchorRel);
    const minor = reproduceC3Principal({ ...base({ bars: doubly }), axis: "MINOR_AXIS" });
    expect("c3Nm" in minor).toBe(true);
    if (!("c3Nm" in minor)) return;
    closeAbsRel(minor.c4Nm, minor.c3Nm, EU_C4_NUMERICAL_TOLERANCE.c3AnchorAbsNm, EU_C4_NUMERICAL_TOLERANCE.c3AnchorRel);
    const c2Major = reproduceC2PureFlexure({ ...base({}), axis: "MAJOR_AXIS" });
    expect("c2Nm" in c2Major).toBe(true);
    if (!("c2Nm" in c2Major)) return;
    closeAbsRel(c2Major.c4Nm, c2Major.c2Nm, EU_C4_NUMERICAL_TOLERANCE.c2AnchorAbsNm, EU_C4_NUMERICAL_TOLERANCE.c2AnchorRel);
    const c2Minor = reproduceC2PureFlexure({ ...base({ bars: doubly }), axis: "MINOR_AXIS" });
    expect("c2Nm" in c2Minor).toBe(true);
    if (!("c2Nm" in c2Minor)) return;
    closeAbsRel(c2Minor.c4Nm, c2Minor.c2Nm, EU_C4_NUMERICAL_TOLERANCE.c2AnchorAbsNm, EU_C4_NUMERICAL_TOLERANCE.c2AnchorRel);
  });

  it("covers biaxial quadrants, independent 45-degree, and symmetry/asymmetry", { timeout: 90_000 }, () => {
    expect(EU_C4_BENCHMARK_MATRIX_COMPLETE).toBe(true);
    const thetas = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
    const results = thetas.map((theta) => evaluateEuC4InteractionPoint(base({ theta, bars: symmetric, n: 0 })));
    for (const result of results) {
      expect(result.ok).toBe(true);
      if (!result.ok) continue;
      expect(Math.abs(result.equilibriumResidualN)).toBeLessThanOrEqual(EU_C4_NUMERICAL_TOLERANCE.equilibriumResidualN);
      expect(Math.hypot(result.mxNm, result.myNm)).toBeGreaterThan(0);
    }
    const diag = evaluateEuC4InteractionPoint(base({ theta: Math.PI / 4, n: 0, bars: symmetric }));
    expect(diag.ok).toBe(true);
    if (!diag.ok) return;
    const independent = independentDiagonalVertexNm({
      widthMm: 300, depthMm: 500,
      bars: symmetric.bars.map((row) => ({ xMm: row.xMm ?? 0, yMm: row.yMm ?? 0, areaMm2: Number(row.areaMm2?.value ?? 0) })),
      fcdMPa: 20, fydMPa: 500 / 1.15, esMPa: 200000, axis: "MAJOR_AXIS", momentSign: "POSITIVE",
    }, 0);
    expect(EU_C4_INDEPENDENT_BENCHMARK_ASSUMPTION.length).toBeGreaterThan(20);
    closeAbsRel(Math.hypot(diag.mxNm, diag.myNm), Math.hypot(independent.mxNm, independent.myNm), EU_C4_NUMERICAL_TOLERANCE.resistanceComparisonAbsNm, EU_C4_NUMERICAL_TOLERANCE.resistanceComparisonRel);
    const pos = evaluateEuC4InteractionPoint(base({ theta: Math.PI / 4, bars: symmetric, n: 0 }));
    const neg = evaluateEuC4InteractionPoint(base({ theta: (7 * Math.PI) / 4, bars: symmetric, n: 0 }));
    expect(pos.ok && neg.ok).toBe(true);
    if (pos.ok && neg.ok) {
      closeAbsRel(Math.hypot(pos.mxNm, pos.myNm), Math.hypot(neg.mxNm, neg.myNm), 1, EU_C4_NUMERICAL_TOLERANCE.symmetryRel);
    }
    const a = evaluateEuC4InteractionPoint(base({ theta: Math.PI / 4, bars: asymmetric, n: 0 }));
    const mirrored = evaluateEuC4InteractionPoint(base({ theta: (7 * Math.PI) / 4, bars: asymmetric, n: 0 }));
    expect(a.ok && mirrored.ok).toBe(true);
    if (a.ok && mirrored.ok) {
      expect(Math.abs(Math.hypot(a.mxNm, a.myNm) - Math.hypot(mirrored.mxNm, mirrored.myNm))).toBeGreaterThan(1);
    }
  });

  it("builds a deterministic surface, interpolates conservatively, and checks D1C demand", { timeout: 120_000 }, () => {
    const coarse = evaluateEuC4InteractionSurface({ ...base({ mesh: 12, bars: symmetric }), axialLevels: 3, angleCount: 8 });
    const coarseAgain = evaluateEuC4InteractionSurface({ ...base({ mesh: 12, bars: symmetric }), axialLevels: 3, angleCount: 8 });
    expect(coarse.ok && coarseAgain.ok).toBe(true);
    if (!coarse.ok || !coarseAgain.ok) return;
    expect(coarse.resultFingerprint).toBe(coarseAgain.resultFingerprint);
    expect(validateEuC4SurfaceTopology(coarse.points)).toBe(true);
    const mid = coarse.points[Math.floor(coarse.points.length / 2)];
    expect(mid).toBeTruthy();
    if (!mid) return;
    const interp = interpolateEuC4SurfaceRadius(coarse.points, mid.axialForceN, mid.momentDirectionRad);
    expect(interp).toBeTruthy();
    if (!interp) return;
    closeAbsRel(interp.radiusNm, mid.radiusNm, EU_C4_NUMERICAL_TOLERANCE.interpolationAbsNm, EU_C4_NUMERICAL_TOLERANCE.interpolationRel);
    expect(interp.conservativeRadiusNm).toBeLessThanOrEqual(interp.radiusNm + 1e-6);
    const rings = coarse.points.filter((p) => Math.abs(p.axialForceN - mid.axialForceN) <= 1).sort((a, b) => a.momentDirectionRad - b.momentDirectionRad);
    for (let i = 1; i < rings.length; i++) {
      const prev = rings[i - 1];
      const cur = rings[i];
      if (!prev || !cur) continue;
      expect(Math.abs(cur.radiusNm - prev.radiusNm)).toBeLessThanOrEqual(
        EU_C4_NUMERICAL_TOLERANCE.continuityRel * Math.max(Math.abs(prev.radiusNm), Math.abs(cur.radiusNm), 1),
      );
    }
    const checkOk = evaluateEuC4DemandPointCheck({ ...base({ n: 0 }), demand: demand(50_000, 0), demandMyNm: 0 });
    expect(checkOk.labelledEn1992Utilization).toBe(false);
    expect(checkOk.ungovernedScalarInteractionUsed).toBe(false);
    expect(["CHECK_SATISFIED", "CHECK_NOT_SATISFIED", "CHECK_UNDETERMINED"]).toContain(checkOk.checkState);
    const over = evaluateEuC4DemandPointCheck({ ...base({}), demand: demand(1e12, 0), demandMyNm: 1e12 });
    expect(over.checkState).toBe("CHECK_NOT_SATISFIED");
    expect(() => assertEuC4OptimizerRejectsUndetermined("CHECK_UNDETERMINED")).toThrow();
    expect(() => assertEuC4ParetoRejectsUndetermined("CHECK_UNDETERMINED")).toThrow();
  });

  it("proves angular/axial/mesh convergence, coupled solver, and invalid inputs", { timeout: 120_000 }, () => {
    const n0 = evaluateEuC4InteractionPoint(base({ theta: Math.PI / 4, n: 0, mesh: 12 }));
    expect(n0.ok).toBe(true);
    if (!n0.ok) return;
    const ringAtN0 = (count: number) => {
      const pts = Array.from({ length: count }, (_, i) => evaluateEuC4InteractionPoint(base({ theta: (i * 2 * Math.PI) / count, n: 0, mesh: 12, bars: symmetric })));
      expect(pts.every((row) => row.ok)).toBe(true);
      return pts.flatMap((row, i) => row.ok ? [{
        axialForceN: 0,
        mxNm: row.mxNm,
        myNm: row.myNm,
        momentDirectionRad: (i * 2 * Math.PI) / count,
        radiusNm: Math.hypot(row.mxNm, row.myNm),
      }] : []);
    };
    const r8 = interpolateEuC4SurfaceRadius(ringAtN0(8), 0, Math.PI / 8);
    const r16 = interpolateEuC4SurfaceRadius(ringAtN0(16), 0, Math.PI / 8);
    expect(r8 && r16).toBeTruthy();
    if (r8 && r16) closeAbsRel(r8.radiusNm, r16.radiusNm, 1, EU_C4_NUMERICAL_TOLERANCE.angularConvergenceRel);
    const axial5 = evaluateEuC4InteractionSurface({ ...base({ mesh: 12, bars: symmetric }), axialLevels: 5, angleCount: 8 });
    expect(axial5.ok).toBe(true);
    if (!axial5.ok) return;
    const loN = axial5.supportedAxialDomainN.nCompressionLimitN * 0.75;
    const hiN = axial5.supportedAxialDomainN.nTensionLimitN * 0.75;
    const probeN = loN + 0.125 * (hiN - loN);
    const directAxial = evaluateEuC4InteractionPoint(base({ theta: Math.PI / 4, n: probeN, mesh: 12, bars: symmetric }));
    const a5 = interpolateEuC4SurfaceRadius(axial5.points, probeN, Math.PI / 4);
    expect(directAxial.ok && a5).toBeTruthy();
    if (directAxial.ok && a5) {
      closeAbsRel(a5.radiusNm, Math.hypot(directAxial.mxNm, directAxial.myNm), 1, EU_C4_NUMERICAL_TOLERANCE.axialLevelConvergenceRel);
    }
    const mid = evaluateEuC4InteractionPoint(base({ theta: Math.PI / 4, n: 0, mesh: 20 }));
    expect(mid.ok).toBe(true);
    if (mid.ok) closeAbsRel(Math.hypot(mid.mxNm, mid.myNm), Math.hypot(n0.mxNm, n0.myNm), 1, EU_C4_NUMERICAL_TOLERANCE.meshConvergenceRel);
    const coupled = evaluateEuC4CoupledDemandSolve({
      ...base({ n: n0.axialForceN }),
      mxNm: n0.mxNm,
      myNm: n0.myNm,
      initial: { axialStrain: n0.strain.axialStrain, curvatureXPerMm: n0.strain.curvatureXPerMm, curvatureYPerMm: n0.strain.curvatureYPerMm },
    });
    expect(coupled.state).toBe("CONVERGED");
    const unreachable = evaluateEuC4CoupledDemandSolve({ ...base({ n: 0, maxIter: 4 }), mxNm: 1e12, myNm: 1e12 });
    expect(unreachable.state).not.toBe("CONVERGED");
    const limited = evaluateEuC4InteractionPoint(base({ theta: Math.PI / 4, maxIter: 0 }));
    expect(limited.ok).toBe(false);
    const circle = evaluateEuC4InteractionPoint({ ...base({}), geometry: circularSection("c4-circ", 400, "c4") });
    expect(circle.ok).toBe(false);
    if (!circle.ok) expect(circle.checkState).toBe("UNSUPPORTED_SCOPE");
    const nan = evaluateEuC4InteractionPoint(base({ n: Number.NaN }));
    expect(nan.ok).toBe(false);
    const inf = evaluateEuC4InteractionPoint(base({ n: Number.POSITIVE_INFINITY }));
    expect(inf.ok).toBe(false);
    const huge = evaluateEuC4InteractionPoint(base({ n: -1e12 }));
    expect(huge.ok).toBe(false);
    if (!huge.ok) expect(huge.checkState).toBe("UNSUPPORTED_SCOPE");
    const missingNdp = evaluateEuC4InteractionPoint({
      ...base({}),
      context: { nationalAnnexRef: "", testOnlyNonConformance: true, gamma_c: testOnlyNdp(1.5), gamma_s: testOnlyNdp(1.15), alpha_cc: testOnlyNdp(1) },
    });
    expect(missingNdp.ok).toBe(false);
    const a = evaluateEuC4InteractionPoint(base({ n: 0, bars: layout(singlyBottom.bars, "lay-a") }));
    const b = evaluateEuC4InteractionPoint(base({ n: 0, bars: layout(doubly.bars, "lay-b") }));
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(a.resultFingerprint).not.toBe(b.resultFingerprint);
      const tags = euC4InvalidationTags(a.resultFingerprint, b.resultFingerprint);
      expect(tags.length).toBeGreaterThan(0);
      expect(() => assertStaleEuC4NotReused(tags, true)).toThrow();
    }
  });

  it("documents C4 without copyrighted standard text", () => {
    const docs = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../../../docs/architecture/engineering-os/EOS_D1E_EU_C4_BIAXIAL_PMM.md"), "utf8");
    expect(docs).toMatch(/EOS-D1E-EU-C4/);
    expect(docs).toMatch(/section resistance/i);
    expect(docs).not.toMatch(/shall be determined according to/);
  });
});
