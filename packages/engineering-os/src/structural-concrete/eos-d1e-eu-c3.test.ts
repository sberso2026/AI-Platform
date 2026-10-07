import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_EU_C3_ASSISTANCE_ADVISORY_ONLY,
  AI_EU_C3_CONFORMANCE_AUTHORITY,
  AI_EU_C3_ENGINEERING_APPROVAL,
  AI_EU_C3_MATERIAL_PARAMETER_AUTHORITY,
  AI_EU_C3_NDP_AUTHORITY,
  AI_EU_C3_SOLVER_OVERRIDE_AUTHORITY,
  AI_INTERACTION_CURVE_OVERRIDE_AUTHORITY,
  D1E1_EQUILIBRIUM_SOLVER_REUSED,
  D1E1_PLANE_SECTION_KINEMATICS_REUSED,
  D1E1_SECTION_GEOMETRY_REUSED,
  D1E1_SECTION_INTEGRATOR_REUSED,
  D1E_FROZEN_ARCHITECTURE_PRESERVED,
  DEFAULT_EU_CONCRETE_NATIONAL_ANNEX,
  EOS_D1E_EU_C3_CLOSED,
  EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE,
  EU_C1C_R1_PARAMETER_VERSION,
  EU_C2_METHOD_IDS,
  EU_C3_ADDITIONAL_REQUIRED_RULE_IDS,
  EU_C3_AXIAL_ANCHOR_VALIDATION,
  EU_C3_BENCHMARK_MATRIX_COMPLETE,
  EU_C3_BIAXIAL_PM_INTERACTION_IMPLEMENTED,
  EU_C3_C2_METHODS_LOADED,
  EU_C3_C2_PURE_FLEXURE_ANCHOR,
  EU_C3_CANONICAL_NEXT_PHASE,
  EU_C3_COLUMN_SECOND_ORDER_DESIGN_IMPLEMENTED,
  EU_C3_CURVE_SAMPLING_EQUALS_ENGINEERING_RULE,
  EU_C3_ENGINEER_VALIDATED_PM_METHOD_COUNT,
  EU_C3_ENGINEER_VALIDATION_STATE,
  EU_C3_EXTERNAL_SOFTWARE_COMPARISON,
  EU_C3_IMPLEMENTED_PM_METHOD_COUNT,
  EU_C3_INTERACTION_CURVE_CONVERGENCE_CRITERION,
  EU_C3_LINEAR_INTERACTION_ASSUMED_WITHOUT_AUTHORITY,
  EU_C3_METHOD_IDS,
  EU_C3_NDP_VALUE_GUESSED,
  EU_C3_NUMERICALLY_VALIDATED_PM_METHOD_COUNT,
  EU_C3_NUMERICAL_TOLERANCE,
  EU_C3_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  EU_C3_RULE_DEPENDENCY_AUDIT,
  EU_C3_SECOND_ORDER_EFFECTS_IMPLEMENTED,
  EU_C3_SECTION_INTERACTION_EQUALS_COLUMN_DESIGN,
  EU_C3_SELF_REFERENTIAL_BENCHMARKS,
  EU_C3_SLENDERNESS_CHECK_IMPLEMENTED,
  EU_C3_SUPPORTED_GEOMETRY_TYPES,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  GENERATIVE_MODEL_CAN_BYPASS_EU_C3,
  IMPLEMENTED_EU_CONCRETE_CODE_AXIAL_FLEXURE_METHODS,
  LLM_EU_C3_NUMERICAL_AUTHORITY,
  NATIONAL_ANNEX_INFERRED_FROM_LOCATION,
  NUMERICAL_PM_VALIDATION_EQUALS_STANDARD_CONFORMANCE,
  PARALLEL_EU_PM_SOLVER_CREATED,
  RECOMMENDED_D1E_NEXT_PHASE,
  SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C3,
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
  EU_C3_INDEPENDENT_BENCHMARK_ASSUMPTION,
  assertEuC3OptimizerRejectsUndetermined,
  assertEuC3ParetoRejectsUndetermined,
  assertStaleEuC3NotReused,
  euC3InvalidationTags,
  evaluateEuC3AxialDomain,
  evaluateEuC3DemandPointCheck,
  evaluateEuC3InteractionCurve,
  evaluateEuC3InteractionPoint,
  independentEquivalentRectangularNm,
  interpolateEuC3CurveMoment,
  reproduceC2AtZeroAxial,
} from "./eu-c3";
import { EU_CONCRETE_AXIAL_FLEXURE_METHODS } from "./eu-flexure";
import { circularSection, rectangleSection } from "./section-mechanics";

function property(name: string, value: number | null, unit: string | null) {
  return { name, value, unit, provenanceRef: "cert-c3", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
}
function ndp(value: number): EuC1cR1DeclaredNdpValue {
  return { value, unit: "dimensionless", sourceAuthority: "DECLARED_NDP_OR_PROJECT_OVERRIDE", provenanceRef: "declared-ndp-c3", ndpIdentity: "DECLARED_PROJECT_OVERRIDE", version: EU_C1C_R1_PARAMETER_VERSION };
}
function testOnlyNdp(value: number): EuC1cR1DeclaredNdpValue {
  return { ...ndp(value), sourceAuthority: EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE, provenanceRef: "test-only-non-conformance" };
}
function context() {
  return { nationalAnnexRef: "DECLARED_TEST_NA", gamma_c: testOnlyNdp(1.5), gamma_s: testOnlyNdp(1.15), alpha_cc: testOnlyNdp(1), testOnlyNonConformance: true };
}
function concrete(fc = 30, unit = "MPa"): ConcreteMaterial {
  return {
    materialRef: "eu-c3-conc", designation: "C30", compressiveStrength: property("fc", fc, unit), tensileStrength: null,
    elasticModulus: property("Ec", 33000, "MPa"), density: null, poissonRatio: null, age: null, strengthReferenceAge: null,
    materialClass: null, materialStandardRef: "project-certificate", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    testCertificateRef: "tc-c3", environmentalMetadata: null, version: "c3",
    provenance: governedProvenance({ jurisdiction: "eu", standard: "EN 1992", version: "c3.0" }),
  };
}
function reo(fy = 500): ReinforcementMaterial {
  return {
    materialRef: "eu-c3-reo", designation: "B500B", yieldStrength: property("fy", fy, "MPa"), ultimateStrength: null,
    elasticModulus: property("Es", 200000, "MPa"), ductilityClass: null, productStandardRef: "project-certificate",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE", version: "c3",
    provenance: governedProvenance({ jurisdiction: "eu", standard: "EN 1992", version: "c3.0" }),
  };
}
function bar(id: string, xMm: number, yMm: number, areaMm2: number, face: string): ReinforcementLayout["bars"][number] {
  return {
    barId: id, designation: "H20", diameterMm: property("d", 20, "mm"), areaMm2: property("As", areaMm2, "mm2"), count: 1,
    xMm, yMm, layerId: null, face, direction: "longitudinal", spacingMm: null, groupId: null, materialRef: "eu-c3-reo",
    anchorageMetadata: null, lapMetadata: null, provenanceRef: "layout-c3",
  };
}
function layout(bars: ReinforcementLayout["bars"], id = "lay-c3"): ReinforcementLayout {
  return { layoutId: id, bars, groups: [], layers: [], transverse: [], provenanceRef: "layout-c3" };
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
const minorEdge = layout([bar("l1", 50, 80, 314, "left"), bar("l2", 50, 250, 314, "left"), bar("l3", 50, 420, 314, "left")]);

const euDemandContext = createConfiguredKnowledgeContext({
  contextId: "ctx-en1992-c3", jurisdictionProfileRef: "eu-eea", standardFamily: "EN", standardCode: "EN 1992",
  edition: "UNKNOWN_PENDING_CONFIRMATION", materialScope: "concrete",
});
function demand(momentNm: number, axialN = 0): StructuralDemandResult {
  return {
    resultId: "demand-c3", memberId: "m-c3", boundaryCondition: "SIMPLE_SIMPLE", spanM: 8, combinationId: "comb-1",
    loadCaseIds: ["g"], methods: ["SS_BEAM_UDL"],
    reactions: { startFyN: 0, endFyN: 0, startMzNm: 0, endMzNm: 0, unitForce: "N", unitMoment: "N.m" },
    shear: { value: 80000, unit: "N", locationM: 0, signed: 80000 },
    moment: { value: Math.abs(momentNm), unit: "N.m", locationM: 4, signed: momentNm },
    axial: axialN === 0 ? { status: "NO_AXIAL_COMPONENTS", valueN: 0 } : { valueN: axialN, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "elastic D1C not long-term RC" }, torsion: { status: "NOT_IMPLEMENTED" },
    stiffness: null, equilibriumResidual: { forceN: 0, momentNm: 0 }, outputClass: "DETERMINISTIC_DEMAND",
    capacityPresent: false, designPassFailPresent: false, humanReviewRequired: true, approvalState: "not_approved",
    llmOriginated: false, standardContext: euDemandContext, toolRef: "d1c", toolVersion: "d1c",
    provenanceRef: governedProvenance({ jurisdiction: "eu-eea", standard: "EN 1992", version: "d1e-eu-c3" }),
    inputEvidenceRefs: [{ evidenceId: "ev-d", sourceKind: "calculation", reference: "d1c" }],
    foundationReactionHandoff: { startFyN: 0, endFyN: 0, startMzNm: 0, endMzNm: 0, geotechnicalCapacityCalculated: false },
  };
}
function closeAbsRel(actual: number, expected: number, abs: number, rel: number): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(Math.max(abs, rel * Math.abs(expected)));
}
function base(args: { axis?: "MAJOR_AXIS" | "MINOR_AXIS"; sign?: "POSITIVE" | "NEGATIVE"; bars?: ReinforcementLayout; fc?: number; fy?: number; mesh?: number; n?: number; maxIter?: number }) {
  return {
    methodId: args.axis === "MINOR_AXIS" ? EU_C3_METHOD_IDS[1] : EU_C3_METHOD_IDS[0],
    axis: args.axis ?? "MAJOR_AXIS" as const,
    momentSign: args.sign ?? "POSITIVE" as const,
    geometry: rectangleSection("c3-rect", 300, 500, "c3"),
    layout: args.bars ?? singlyBottom,
    concrete: concrete(args.fc ?? 30),
    reinforcement: reo(args.fy ?? 500),
    context: context(),
    targetAxialN: args.n ?? 0,
    resolutionX: args.mesh ?? 16,
    resolutionY: args.mesh ?? 16,
    maxBisectionIterations: args.maxIter,
    provenanceRef: "c3-test",
  };
}

describe("EOS-D1E-EU-C3 bounded uniaxial N-M", () => {
  it("audits C2 reuse, architecture freeze, and uncertified conformance", () => {
    expect(EU_C3_C2_METHODS_LOADED).toBe(true);
    expect([...EU_C2_METHOD_IDS]).toEqual(["EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR", "EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR"]);
    expect(EU_C3_RULE_DEPENDENCY_AUDIT).toBe("PASS");
    expect(EU_C3_ADDITIONAL_REQUIRED_RULE_IDS).toBe("NONE");
    expect(D1E_FROZEN_ARCHITECTURE_PRESERVED).toBe(true);
    expect(PARALLEL_EU_PM_SOLVER_CREATED).toBe(false);
    expect(D1E1_SECTION_GEOMETRY_REUSED).toBe(true);
    expect(D1E1_PLANE_SECTION_KINEMATICS_REUSED).toBe(true);
    expect(D1E1_SECTION_INTEGRATOR_REUSED).toBe(true);
    expect(D1E1_EQUILIBRIUM_SOLVER_REUSED).toBe(true);
    expect([...EU_C3_METHOD_IDS]).toEqual(["EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MAJOR", "EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MINOR"]);
    expect([...IMPLEMENTED_EU_CONCRETE_CODE_AXIAL_FLEXURE_METHODS]).toEqual([...EU_C3_METHOD_IDS]);
    expect(EU_C3_IMPLEMENTED_PM_METHOD_COUNT).toBe(2);
    expect(EU_C3_NUMERICALLY_VALIDATED_PM_METHOD_COUNT).toBe(2);
    expect(EU_C3_ENGINEER_VALIDATED_PM_METHOD_COUNT).toBe(0);
    expect(EU_C3_ENGINEER_VALIDATION_STATE).toBe("PENDING_HUMAN_ENGINEERING_REVIEW");
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(NUMERICAL_PM_VALIDATION_EQUALS_STANDARD_CONFORMANCE).toBe(false);
    expect(EU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(EU_C3_SECTION_INTERACTION_EQUALS_COLUMN_DESIGN).toBe(false);
    expect(EU_C3_SECOND_ORDER_EFFECTS_IMPLEMENTED).toBe(false);
    expect(EU_C3_SLENDERNESS_CHECK_IMPLEMENTED).toBe(false);
    expect(EU_C3_BIAXIAL_PM_INTERACTION_IMPLEMENTED).toBe(false);
    expect(EU_C3_COLUMN_SECOND_ORDER_DESIGN_IMPLEMENTED).toBe(false);
    expect(EU_C3_LINEAR_INTERACTION_ASSUMED_WITHOUT_AUTHORITY).toBe(false);
    expect(EU_C3_CURVE_SAMPLING_EQUALS_ENGINEERING_RULE).toBe(false);
    expect(DEFAULT_EU_CONCRETE_NATIONAL_ANNEX).toBe(false);
    expect(NATIONAL_ANNEX_INFERRED_FROM_LOCATION).toBe(false);
    expect(EU_C3_NDP_VALUE_GUESSED).toBe(false);
    expect(TEST_ONLY_NDP_BECOMES_RUNTIME_DEFAULT).toBe(false);
    expect(LLM_EU_C3_NUMERICAL_AUTHORITY).toBe(false);
    expect(AI_EU_C3_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(AI_EU_C3_MATERIAL_PARAMETER_AUTHORITY).toBe(false);
    expect(AI_EU_C3_NDP_AUTHORITY).toBe(false);
    expect(AI_EU_C3_SOLVER_OVERRIDE_AUTHORITY).toBe(false);
    expect(AI_INTERACTION_CURVE_OVERRIDE_AUTHORITY).toBe(false);
    expect(AI_EU_C3_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_EU_C3_ENGINEERING_APPROVAL).toBe(false);
    expect(GENERATIVE_MODEL_CAN_BYPASS_EU_C3).toBe(false);
    expect(EU_C3_OPTIMIZATION_ACCEPTS_UNDETERMINED).toBe(false);
    expect(SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C3).toBe(false);
    expect(EOS_D1E_EU_C3_CLOSED).toBe(true);
    expect(RECOMMENDED_D1E_NEXT_PHASE).toBe("EOS-D1E-EU-C4");
    expect(EU_C3_CANONICAL_NEXT_PHASE).toBe("EOS-D1E-EU-C4");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C3")?.status).toBe("CLOSED");
    expect(CONCRETE_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL")).toBe(true);
    expect(D1E_VALIDATION_DEBT_REGISTER.find((row) => row.debtId === "D1E-EU-VD-AXIAL-FLEXURE")?.blockingState).toBe("PARTIAL");
    expect([...EU_C3_SUPPORTED_GEOMETRY_TYPES]).toEqual(["RECTANGULAR"]);
    expect(EU_CONCRETE_AXIAL_FLEXURE_METHODS).toHaveLength(2);
    expect(EU_C3_EXTERNAL_SOFTWARE_COMPARISON).toBe("NOT_AVAILABLE");
    expect(EU_C3_AXIAL_ANCHOR_VALIDATION).toBe("PARTIAL");
    expect(EU_C3_INTERACTION_CURVE_CONVERGENCE_CRITERION.length).toBeGreaterThan(20);
  });

  it("reproduces C2 at N=0 and matches independent equivalent-rectangle N-M", { timeout: 40_000 }, () => {
    expect(EU_C3_SELF_REFERENTIAL_BENCHMARKS).toBe(false);
    expect(EU_C3_C2_PURE_FLEXURE_ANCHOR).toBe("PASS");
    const anchor = reproduceC2AtZeroAxial(base({}));
    expect("c2Nm" in anchor).toBe(true);
    if (!("c2Nm" in anchor)) return;
    closeAbsRel(anchor.c3Nm, anchor.c2Nm, EU_C3_NUMERICAL_TOLERANCE.c2AnchorAbsNm, EU_C3_NUMERICAL_TOLERANCE.c2AnchorRel);
    const zero = evaluateEuC3InteractionPoint(base({ n: 0 }));
    expect(zero.ok).toBe(true);
    if (zero.ok) expect(zero.strainFamily).toBe("EPS_CU2_PIVOT");
    const domain = evaluateEuC3AxialDomain(base({}));
    expect(domain.ok).toBe(true);
    if (!domain.ok) return;
    const nComp = 0.3 * domain.nCompressionLimitN;
    const production = evaluateEuC3InteractionPoint(base({ n: nComp }));
    expect(production.ok).toBe(true);
    if (!production.ok) return;
    expect(Math.abs(production.equilibriumResidualN)).toBeLessThanOrEqual(EU_C3_NUMERICAL_TOLERANCE.equilibriumResidualN);
    expect(production.labelledEn1992Resistance).toBe(false);
    expect(production.labelledColumnDesign).toBe(false);
    const independent = independentEquivalentRectangularNm({
      widthMm: 300, depthMm: 500,
      bars: singlyBottom.bars.map((row) => ({ xMm: row.xMm ?? 0, yMm: row.yMm ?? 0, areaMm2: 314 })),
      fcdMPa: 20, fydMPa: 500 / 1.15, esMPa: 200000, axis: "MAJOR_AXIS", momentSign: "POSITIVE",
    }, nComp);
    expect(EU_C3_INDEPENDENT_BENCHMARK_ASSUMPTION.length).toBeGreaterThan(20);
    closeAbsRel(production.resistanceMomentNm, independent.resistanceMomentNm, EU_C3_NUMERICAL_TOLERANCE.resistanceComparisonAbsNm, EU_C3_NUMERICAL_TOLERANCE.resistanceComparisonRel);
  });

  it("covers the bounded C3 N-M matrix including signs, axes, and tension/compression", { timeout: 90_000 }, () => {
    expect(EU_C3_BENCHMARK_MATRIX_COMPLETE).toBe(true);
    const domain = evaluateEuC3AxialDomain(base({}));
    expect(domain.ok).toBe(true);
    if (!domain.ok) return;
    const nC = 0.25 * domain.nCompressionLimitN;
    const nT = 0.35 * domain.nTensionLimitN;
    const cases = [
      evaluateEuC3InteractionPoint(base({ n: nC, sign: "POSITIVE" })),
      evaluateEuC3InteractionPoint(base({ n: 0, sign: "POSITIVE" })),
      evaluateEuC3InteractionPoint(base({ n: nT, sign: "POSITIVE" })),
      evaluateEuC3InteractionPoint(base({ n: nC, bars: doubly, sign: "NEGATIVE" })),
      evaluateEuC3InteractionPoint(base({ axis: "MINOR_AXIS", bars: minorEdge, n: nC, sign: "POSITIVE" })),
      evaluateEuC3InteractionPoint(base({ axis: "MINOR_AXIS", bars: minorEdge, n: 0, sign: "POSITIVE" })),
      evaluateEuC3InteractionPoint(base({ bars: symmetric, n: nC })),
      evaluateEuC3InteractionPoint(base({ bars: asymmetric, n: nC })),
      evaluateEuC3InteractionPoint(base({ fc: 40, n: nC })),
      evaluateEuC3InteractionPoint(base({ fy: 400, n: nC })),
    ];
    for (const result of cases) {
      expect(result.ok).toBe(true);
      if (!result.ok) continue;
      expect(Math.abs(result.equilibriumResidualN)).toBeLessThanOrEqual(EU_C3_NUMERICAL_TOLERANCE.equilibriumResidualN);
      expect(Number.isFinite(result.resistanceMomentNm)).toBe(true);
    }
  });

  it("builds a deterministic curve, interpolates conservatively, and checks D1C demand", { timeout: 90_000 }, () => {
    const coarse = evaluateEuC3InteractionCurve({ ...base({ mesh: 12 }), pointCount: 7 });
    const coarseAgain = evaluateEuC3InteractionCurve({ ...base({ mesh: 12 }), pointCount: 7 });
    expect(coarse.ok && coarseAgain.ok).toBe(true);
    if (!coarse.ok || !coarseAgain.ok) return;
    expect(coarse.resultFingerprint).toBe(coarseAgain.resultFingerprint);
    const midN = coarse.points[Math.floor(coarse.points.length / 2)]?.axialForceN ?? 0;
    const interp = interpolateEuC3CurveMoment(coarse.points, midN);
    const direct = evaluateEuC3InteractionPoint(base({ n: midN }));
    expect(interp).toBeTruthy();
    expect(direct.ok).toBe(true);
    if (!interp || !direct.ok) return;
    closeAbsRel(interp.momentNm, direct.resistanceMomentNm, EU_C3_NUMERICAL_TOLERANCE.interpolationAbsNm, EU_C3_NUMERICAL_TOLERANCE.interpolationRel);
    expect(Math.abs(interp.conservativeMomentNm)).toBeLessThanOrEqual(Math.abs(direct.resistanceMomentNm) * (1 + EU_C3_NUMERICAL_TOLERANCE.interpolationRel) + EU_C3_NUMERICAL_TOLERANCE.interpolationAbsNm);
    const ns = coarse.points.map((p) => p.axialForceN);
    for (let i = 1; i < ns.length; i++) expect(ns[i]).toBeGreaterThanOrEqual((ns[i - 1] ?? 0) - 1);
    const checkOk = evaluateEuC3DemandPointCheck({ ...base({ n: 0 }), demand: demand(50_000, 0) });
    expect(checkOk.linearInteractionUsed).toBe(false);
    expect(checkOk.labelledEn1992Utilization).toBe(false);
    expect(["CHECK_SATISFIED", "CHECK_NOT_SATISFIED"]).toContain(checkOk.checkState);
    const over = evaluateEuC3DemandPointCheck({ ...base({}), demand: demand(1e12, 0) });
    expect(over.checkState).toBe("CHECK_NOT_SATISFIED");
    expect(() => assertEuC3OptimizerRejectsUndetermined("CHECK_UNDETERMINED")).toThrow();
    expect(() => assertEuC3ParetoRejectsUndetermined("CHECK_UNDETERMINED")).toThrow();
  });

  it("proves mesh convergence, solver fail-closed, and invalid inputs", { timeout: 60_000 }, () => {
    const domain = evaluateEuC3AxialDomain(base({}));
    expect(domain.ok).toBe(true);
    if (!domain.ok) return;
    const n = 0.2 * domain.nCompressionLimitN;
    const coarse = evaluateEuC3InteractionPoint(base({ n, mesh: 12 }));
    const mid = evaluateEuC3InteractionPoint(base({ n, mesh: 20 }));
    const fine = evaluateEuC3InteractionPoint(base({ n, mesh: 32 }));
    expect(coarse.ok && mid.ok && fine.ok).toBe(true);
    if (!coarse.ok || !mid.ok || !fine.ok) return;
    closeAbsRel(mid.resistanceMomentNm, fine.resistanceMomentNm, 1, EU_C3_NUMERICAL_TOLERANCE.meshConvergenceRel);
    const limited = evaluateEuC3InteractionPoint(base({ n, maxIter: 0 }));
    expect(limited.ok).toBe(false);
    const circle = evaluateEuC3InteractionPoint({ ...base({}), geometry: circularSection("c3-circ", 400, "c3") });
    expect(circle.ok).toBe(false);
    if (!circle.ok) expect(circle.checkState).toBe("UNSUPPORTED_SCOPE");
    const nan = evaluateEuC3InteractionPoint(base({ n: Number.NaN }));
    expect(nan.ok).toBe(false);
    const inf = evaluateEuC3InteractionPoint(base({ n: Number.POSITIVE_INFINITY }));
    expect(inf.ok).toBe(false);
    const huge = evaluateEuC3InteractionPoint(base({ n: -1e12 }));
    expect(huge.ok).toBe(false);
    if (!huge.ok) expect(huge.checkState).toBe("UNSUPPORTED_SCOPE");
    const missingNdp = evaluateEuC3InteractionPoint({
      ...base({}),
      context: { nationalAnnexRef: "", testOnlyNonConformance: true, gamma_c: testOnlyNdp(1.5), gamma_s: testOnlyNdp(1.15), alpha_cc: testOnlyNdp(1) },
    });
    expect(missingNdp.ok).toBe(false);
    const pa = evaluateEuC3InteractionPoint({ ...base({ n }), concrete: concrete(30e6, "Pa") });
    expect(pa.ok && mid.ok).toBe(true);
    if (pa.ok) closeAbsRel(pa.resistanceMomentNm, mid.resistanceMomentNm, EU_C3_NUMERICAL_TOLERANCE.unitConsistencyAbsNm, EU_C3_NUMERICAL_TOLERANCE.unitConsistencyRel);
    const a = evaluateEuC3InteractionPoint(base({ n, bars: layout(singlyBottom.bars, "lay-a") }));
    const b = evaluateEuC3InteractionPoint(base({ n, bars: layout(doubly.bars, "lay-b") }));
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(a.resultFingerprint).not.toBe(b.resultFingerprint);
      const tags = euC3InvalidationTags(a.resultFingerprint, b.resultFingerprint);
      expect(tags.length).toBeGreaterThan(0);
      expect(() => assertStaleEuC3NotReused(tags, true)).toThrow();
    }
  });

  it("documents C3 without copyrighted standard text", () => {
    const docs = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../../../docs/architecture/engineering-os/EOS_D1E_EU_C3_AXIAL_FLEXURE.md"), "utf8");
    expect(docs).toMatch(/EOS-D1E-EU-C3/);
    expect(docs).toMatch(/section resistance/i);
    expect(docs).not.toMatch(/shall be determined according to/);
  });
});
