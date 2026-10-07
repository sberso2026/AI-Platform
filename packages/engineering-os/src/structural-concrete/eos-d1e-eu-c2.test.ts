import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_EU_C2_ASSISTANCE_ADVISORY_ONLY,
  AI_EU_C2_CONFORMANCE_AUTHORITY,
  AI_EU_C2_ENGINEERING_APPROVAL,
  AI_EU_C2_MATERIAL_PARAMETER_AUTHORITY,
  AI_EU_C2_NDP_AUTHORITY,
  AI_SOLVER_OVERRIDE_AUTHORITY,
  D1E1_EQUILIBRIUM_SOLVER_REUSED,
  D1E1_PLANE_SECTION_KINEMATICS_REUSED,
  D1E1_SECTION_GEOMETRY_REUSED,
  D1E1_SECTION_INTEGRATOR_REUSED,
  D1E_FROZEN_ARCHITECTURE_PRESERVED,
  DEFAULT_EU_CONCRETE_NATIONAL_ANNEX,
  EOS_D1E_EU_C2_CLOSED,
  EU_C1C_CONSTITUTIVE_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT,
  EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE,
  EU_C1C_R1_PARAMETER_VERSION,
  EU_C2_AXIAL_APPLICABILITY,
  EU_C2_BENCHMARK_MATRIX_COMPLETE,
  EU_C2_BENCHMARK_SOURCE_INDEPENDENCE,
  EU_C2_CANONICAL_NEXT_PHASE,
  EU_C2_CANONICAL_NEXT_PHASE_SCOPE,
  EU_C2_CHECK_STATE_GOVERNED,
  EU_C2_D1C_MOMENT_DEMAND_REUSED,
  EU_C2_ENGINEER_VALIDATED_FLEXURE_METHOD_COUNT,
  EU_C2_ENGINEER_VALIDATION_STATE,
  EU_C2_EQUILIBRIUM_NONCONVERGENCE_FAILS_CLOSED,
  EU_C2_EXTERNAL_SOFTWARE_COMPARISON,
  EU_C2_FLEXURE_IMPLEMENTATION_MATURITY,
  EU_C2_GENERAL_NM_INTERACTION_IMPLEMENTED,
  EU_C2_IMPLEMENTED_FLEXURE_METHOD_COUNT,
  EU_C2_INTEGRATION_CONVERGENCE_CRITERION,
  EU_C2_METHOD_IDS,
  EU_C2_METHOD_IDS_CANONICAL,
  EU_C2_NEUTRAL_AXIS_EQUALS_CODE_RESISTANCE,
  EU_C2_NONZERO_AXIAL_ACTION_SILENTLY_IGNORED,
  EU_C2_NUMERICALLY_VALIDATED_FLEXURE_METHOD_COUNT,
  EU_C2_NUMERICALLY_VALIDATED_GEOMETRY_TYPES,
  EU_C2_NUMERICAL_TOLERANCE,
  EU_C2_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  EU_C2_RULE_PACK_IMPLEMENTED_COUNT,
  EU_C2_RULE_PACK_LOADED,
  EU_C2_RULE_PACK_NUMERICALLY_VALIDATED_COUNT,
  EU_C2_SECTION_RESISTANCE_STRATEGY,
  EU_C2_SELF_REFERENTIAL_BENCHMARKS,
  EU_C2_SEPARATE_STRESS_BLOCK_REQUIRED,
  EU_C2_SHEAR_IMPLEMENTED,
  EU_C2_SUPPORTED_GEOMETRY_TYPES,
  EU_C2_UNGOVERNED_FAILURE_CRITERION_COUNT,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  EU_FLEXURE_METHOD_COUNT,
  EU_SUPPORTING_RULE_COUNT,
  GENERATIVE_MODEL_CAN_BYPASS_EU_C2,
  LLM_EU_C2_NUMERICAL_AUTHORITY,
  NATIONAL_ANNEX_INFERRED_FROM_LOCATION,
  NUMERICAL_FLEXURE_VALIDATION_EQUALS_STANDARD_CONFORMANCE,
  PARALLEL_EU_C2_METHOD_REGISTRY_CREATED,
  PARALLEL_EU_EQUILIBRIUM_SOLVER_CREATED,
  PARALLEL_EU_FLEXURE_SOLVER_CREATED,
  PARALLEL_EU_SECTION_INTEGRATOR_CREATED,
  PARALLEL_EU_STRAIN_KINEMATICS_CREATED,
  RECOMMENDED_D1E_NEXT_PHASE,
  SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C2,
  TEST_ONLY_NDP_BECOMES_RUNTIME_DEFAULT,
  type ConcreteMaterial,
  type EuC1cR1DeclaredNdpValue,
  type EurocodeConcreteProjectContext,
  type EurocodeNationalAnnex,
  type ReinforcementLayout,
  type ReinforcementMaterial,
  type StructuralDemandResult,
} from "@rtb/types";
import { createConfiguredKnowledgeContext } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import { CONCRETE_CAPABILITY_MANIFEST, D1E_INTERNAL_ROADMAP, D1E_VALIDATION_DEBT_REGISTER } from "./capability";
import {
  EU_C2_INDEPENDENT_BENCHMARK_ASSUMPTION,
  assertStaleEuC2NotReused,
  euC2InvalidationTags,
  evaluateEuC2UniaxialFlexureResistance,
  independentEquivalentRectangularResistance,
} from "./eu-c2";
import { evaluateEuConcreteFlexure } from "./eu-flexure";
import { emptyResolverInput } from "./eu-standard";
import { circularSection, rectangleSection } from "./section-mechanics";

function property(name: string, value: number | null, unit: string | null) {
  return { name, value, unit, provenanceRef: "cert-c2", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
}

function ndp(value: number): EuC1cR1DeclaredNdpValue {
  return {
    value,
    unit: "dimensionless",
    sourceAuthority: "DECLARED_NDP_OR_PROJECT_OVERRIDE",
    provenanceRef: "declared-ndp-c2",
    ndpIdentity: "DECLARED_PROJECT_OVERRIDE",
    version: EU_C1C_R1_PARAMETER_VERSION,
  };
}

function testOnlyNdp(value: number): EuC1cR1DeclaredNdpValue {
  return { ...ndp(value), sourceAuthority: EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE, provenanceRef: "test-only-non-conformance" };
}

function context(testOnly = true) {
  const make = testOnly ? testOnlyNdp : ndp;
  return {
    nationalAnnexRef: "DECLARED_TEST_NA",
    gamma_c: make(1.5),
    gamma_s: make(1.15),
    alpha_cc: make(1),
    testOnlyNonConformance: testOnly,
  };
}

function concrete(fc = 30, unit = "MPa"): ConcreteMaterial {
  return {
    materialRef: "eu-c2-conc",
    designation: "C30",
    compressiveStrength: property("fc", fc, unit),
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

function reo(fy = 500): ReinforcementMaterial {
  return {
    materialRef: "eu-c2-reo",
    designation: "B500B",
    yieldStrength: property("fy", fy, "MPa"),
    ultimateStrength: null,
    elasticModulus: property("Es", 200000, "MPa"),
    ductilityClass: null,
    productStandardRef: "project-certificate",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    version: "c2",
    provenance: governedProvenance({ jurisdiction: "eu", standard: "EN 1992", version: "c2.0" }),
  };
}

function bar(id: string, xMm: number, yMm: number, areaMm2: number, face: string): ReinforcementLayout["bars"][number] {
  return {
    barId: id,
    designation: "H20",
    diameterMm: property("d", 20, "mm"),
    areaMm2: property("As", areaMm2, "mm2"),
    count: 1,
    xMm,
    yMm,
    layerId: null,
    face,
    direction: "longitudinal",
    spacingMm: null,
    groupId: null,
    materialRef: "eu-c2-reo",
    anchorageMetadata: null,
    lapMetadata: null,
    provenanceRef: "layout-c2",
  };
}

function layout(bars: ReinforcementLayout["bars"]): ReinforcementLayout {
  return { layoutId: "lay-c2", bars, groups: [], layers: [], transverse: [], provenanceRef: "layout-c2" };
}

const singlyBottom = layout([bar("b1", 50, 50, 314, "bottom"), bar("b2", 150, 50, 314, "bottom"), bar("b3", 250, 50, 314, "bottom")]);
const doubly = layout([
  bar("b1", 50, 50, 314, "bottom"),
  bar("b2", 150, 50, 314, "bottom"),
  bar("b3", 250, 50, 314, "bottom"),
  bar("t1", 50, 450, 201, "top"),
  bar("t2", 250, 450, 201, "top"),
]);
const symmetric = layout([
  bar("b1", 50, 50, 314, "bottom"),
  bar("b2", 250, 50, 314, "bottom"),
  bar("t1", 50, 450, 314, "top"),
  bar("t2", 250, 450, 314, "top"),
]);
const asymmetric = layout([
  bar("b1", 40, 50, 314, "bottom"),
  bar("b2", 110, 50, 314, "bottom"),
  bar("b3", 180, 50, 314, "bottom"),
  bar("b4", 250, 50, 314, "bottom"),
  bar("t1", 50, 450, 201, "top"),
  bar("t2", 250, 450, 201, "top"),
]);
const lowRatio = layout([bar("b1", 75, 50, 201, "bottom"), bar("b2", 225, 50, 201, "bottom")]);
const minorEdge = layout([bar("l1", 50, 80, 314, "left"), bar("l2", 50, 250, 314, "left"), bar("l3", 50, 420, 314, "left")]);

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
    provenance: governedProvenance({ jurisdiction: "eu-eea", standard: "EN 1992", version: "d1e-eu-c2" }),
    validationState: "STANDARD_BINDING_FRAMEWORK",
    conformanceState: "INTENDED_PROFILE",
    workspaceGlobalAnnexId: null,
    statutoryEuMembershipRequired: false,
    statutoryEuComplianceClaimed: false,
    internationalContractualUse: false,
  };
}

const euDemandContext = createConfiguredKnowledgeContext({
  contextId: "ctx-en1992-c2",
  jurisdictionProfileRef: "eu-eea",
  standardFamily: "EN",
  standardCode: "EN 1992",
  edition: "UNKNOWN_PENDING_CONFIRMATION",
  materialScope: "concrete",
});

function demand(momentNm: number, axialN = 0): StructuralDemandResult {
  return {
    resultId: "demand-c2",
    memberId: "m-c2",
    boundaryCondition: "SIMPLE_SIMPLE",
    spanM: 8,
    combinationId: "comb-1",
    loadCaseIds: ["g"],
    methods: ["SS_BEAM_UDL"],
    reactions: { startFyN: 0, endFyN: 0, startMzNm: 0, endMzNm: 0, unitForce: "N", unitMoment: "N.m" },
    shear: { value: 80000, unit: "N", locationM: 0, signed: 80000 },
    moment: { value: Math.abs(momentNm), unit: "N.m", locationM: 4, signed: momentNm },
    axial: axialN === 0 ? { status: "NO_AXIAL_COMPONENTS", valueN: 0 } : { valueN: axialN, unit: "N", method: "AXIAL_DIRECT" },
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
    standardContext: euDemandContext,
    toolRef: "d1c",
    toolVersion: "d1c",
    provenanceRef: governedProvenance({ jurisdiction: "eu-eea", standard: "EN 1992", version: "d1e-eu-c2" }),
    inputEvidenceRefs: [{ evidenceId: "ev-d", sourceKind: "calculation", reference: "d1c" }],
    foundationReactionHandoff: { startFyN: 0, endFyN: 0, startMzNm: 0, endMzNm: 0, geotechnicalCapacityCalculated: false },
  };
}

function closeAbsRel(actual: number, expected: number, abs: number, rel: number): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(Math.max(abs, rel * Math.abs(expected)));
}

function solve(args: {
  axis?: "MAJOR_AXIS" | "MINOR_AXIS";
  sign?: "POSITIVE" | "NEGATIVE";
  bars?: ReinforcementLayout;
  fc?: number;
  fy?: number;
  mesh?: number;
  maxIter?: number;
}) {
  return evaluateEuC2UniaxialFlexureResistance({
    methodId: args.axis === "MINOR_AXIS" ? "EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR" : "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
    axis: args.axis ?? "MAJOR_AXIS",
    momentSign: args.sign ?? "POSITIVE",
    geometry: rectangleSection("c2-rect", 300, 500, "c2"),
    layout: args.bars ?? singlyBottom,
    concrete: concrete(args.fc ?? 30),
    reinforcement: reo(args.fy ?? 500),
    context: context(true),
    resolutionX: args.mesh ?? 40,
    resolutionY: args.mesh ?? 40,
    maxBisectionIterations: args.maxIter,
    provenanceRef: "c2-test",
  });
}

describe("EOS-D1E-EU-C2 bounded uniaxial flexure", () => {
  it("loads the C1/C1C pack, freezes architecture, and keeps conformance uncertified", () => {
    expect(EU_C2_RULE_PACK_LOADED).toBe(true);
    expect(EU_C2_RULE_PACK_IMPLEMENTED_COUNT).toBeGreaterThanOrEqual(10);
    expect(EU_C2_RULE_PACK_NUMERICALLY_VALIDATED_COUNT).toBeGreaterThanOrEqual(10);
    expect(EU_C2_RULE_PACK_IMPLEMENTED_COUNT).toBe(EU_C1C_CONSTITUTIVE_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT);
    expect(D1E_FROZEN_ARCHITECTURE_PRESERVED).toBe(true);
    expect(PARALLEL_EU_FLEXURE_SOLVER_CREATED).toBe(false);
    expect(PARALLEL_EU_SECTION_INTEGRATOR_CREATED).toBe(false);
    expect(PARALLEL_EU_EQUILIBRIUM_SOLVER_CREATED).toBe(false);
    expect(PARALLEL_EU_STRAIN_KINEMATICS_CREATED).toBe(false);
    expect(PARALLEL_EU_C2_METHOD_REGISTRY_CREATED).toBe(false);
    expect(D1E1_SECTION_GEOMETRY_REUSED).toBe(true);
    expect(D1E1_PLANE_SECTION_KINEMATICS_REUSED).toBe(true);
    expect(D1E1_SECTION_INTEGRATOR_REUSED).toBe(true);
    expect(D1E1_EQUILIBRIUM_SOLVER_REUSED).toBe(true);
    expect(EU_C2_SECTION_RESISTANCE_STRATEGY).toBe("MATERIAL_INTEGRATION");
    expect(EU_C2_SEPARATE_STRESS_BLOCK_REQUIRED).toBe(false);
    expect(EU_C2_METHOD_IDS_CANONICAL).toBe(true);
    expect([...EU_C2_METHOD_IDS]).toEqual([
      "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
      "EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR",
    ]);
    expect(EU_C2_IMPLEMENTED_FLEXURE_METHOD_COUNT).toBe(2);
    expect(EU_C2_NUMERICALLY_VALIDATED_FLEXURE_METHOD_COUNT).toBe(2);
    expect(EU_C2_ENGINEER_VALIDATED_FLEXURE_METHOD_COUNT).toBe(0);
    expect(EU_C2_ENGINEER_VALIDATION_STATE).toBe("PENDING_HUMAN_ENGINEERING_REVIEW");
    expect(EU_SUPPORTING_RULE_COUNT).toBe(EU_C2_RULE_PACK_IMPLEMENTED_COUNT);
    expect(EU_FLEXURE_METHOD_COUNT).toBe(2);
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(NUMERICAL_FLEXURE_VALIDATION_EQUALS_STANDARD_CONFORMANCE).toBe(false);
    expect(EU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(EU_C2_FLEXURE_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_BOUNDED_METHODS");
    expect(DEFAULT_EU_CONCRETE_NATIONAL_ANNEX).toBe(false);
    expect(NATIONAL_ANNEX_INFERRED_FROM_LOCATION).toBe(false);
    expect(TEST_ONLY_NDP_BECOMES_RUNTIME_DEFAULT).toBe(false);
    expect(EU_C2_NEUTRAL_AXIS_EQUALS_CODE_RESISTANCE).toBe(false);
    expect(EU_C2_UNGOVERNED_FAILURE_CRITERION_COUNT).toBe(0);
    expect(EU_C2_GENERAL_NM_INTERACTION_IMPLEMENTED).toBe(false);
    expect(EU_C2_SHEAR_IMPLEMENTED).toBe(false);
    expect(EU_C2_EXTERNAL_SOFTWARE_COMPARISON).toBe("NOT_AVAILABLE");
    expect(LLM_EU_C2_NUMERICAL_AUTHORITY).toBe(false);
    expect(AI_EU_C2_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(AI_EU_C2_MATERIAL_PARAMETER_AUTHORITY).toBe(false);
    expect(AI_EU_C2_NDP_AUTHORITY).toBe(false);
    expect(AI_SOLVER_OVERRIDE_AUTHORITY).toBe(false);
    expect(AI_EU_C2_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_EU_C2_ENGINEERING_APPROVAL).toBe(false);
    expect(GENERATIVE_MODEL_CAN_BYPASS_EU_C2).toBe(false);
    expect(EU_C2_OPTIMIZATION_ACCEPTS_UNDETERMINED).toBe(false);
    expect(SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C2).toBe(false);
    expect(EOS_D1E_EU_C2_CLOSED).toBe(true);
    expect(RECOMMENDED_D1E_NEXT_PHASE).toBe("EOS-D1E-EU-C4");
    expect(EU_C2_CANONICAL_NEXT_PHASE).toBe("EOS-D1E-EU-C3");
    expect(EU_C2_CANONICAL_NEXT_PHASE_SCOPE).toMatch(/P-M|axial-flexure/i);
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C2")?.status).toBe("CLOSED");
    expect(CONCRETE_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1E.EU.C2.FLEXURE.UNIAXIAL")).toBe(true);
    expect(D1E_VALIDATION_DEBT_REGISTER.find((row) => row.debtId === "D1E-EU-VD-FLEXURE")?.blockingState).toBe("PARTIAL");
    expect([...EU_C2_SUPPORTED_GEOMETRY_TYPES]).toEqual(["RECTANGULAR"]);
    expect([...EU_C2_NUMERICALLY_VALIDATED_GEOMETRY_TYPES]).toEqual(["RECTANGULAR"]);
  });

  it("computes independent major-axis resistance and matches the independent equivalent-rectangular benchmark", { timeout: 20_000 }, () => {
    expect(EU_C2_SELF_REFERENTIAL_BENCHMARKS).toBe(false);
    expect(EU_C2_BENCHMARK_SOURCE_INDEPENDENCE).toBe("PASS");
    expect(EU_C2_INDEPENDENT_BENCHMARK_ASSUMPTION.length).toBeGreaterThan(20);
    const production = solve({ bars: singlyBottom, sign: "POSITIVE" });
    expect(production.ok).toBe(true);
    if (!production.ok) return;
    expect(Math.abs(production.equilibriumResidualN)).toBeLessThanOrEqual(EU_C2_NUMERICAL_TOLERANCE.equilibriumResidualN);
    expect(production.labelledEn1992Resistance).toBe(false);
    expect(production.labelledCodeCapacity).toBe(false);
    const independent = independentEquivalentRectangularResistance({
      widthMm: 300,
      depthMm: 500,
      bars: singlyBottom.bars.map((row) => ({ xMm: row.xMm ?? 0, yMm: row.yMm ?? 0, areaMm2: 314 })),
      fcdMPa: 20,
      fydMPa: 500 / 1.15,
      esMPa: 200000,
      axis: "MAJOR_AXIS",
      momentSign: "POSITIVE",
    });
    closeAbsRel(
      production.resistanceMomentNm,
      independent.resistanceMomentNm,
      EU_C2_NUMERICAL_TOLERANCE.resistanceComparisonAbsNm,
      EU_C2_NUMERICAL_TOLERANCE.resistanceComparisonRel,
    );
  });

  it("covers the bounded C2 benchmark matrix without leaving validated geometry", { timeout: 60_000 }, () => {
    expect(EU_C2_BENCHMARK_MATRIX_COMPLETE).toBe(true);
    const cases = [
      solve({ bars: singlyBottom, sign: "POSITIVE" }),
      solve({ bars: doubly, sign: "NEGATIVE" }),
      solve({ axis: "MINOR_AXIS", bars: minorEdge, sign: "POSITIVE" }),
      solve({ bars: doubly, sign: "POSITIVE" }),
      solve({ bars: symmetric, sign: "POSITIVE" }),
      solve({ bars: asymmetric, sign: "POSITIVE" }),
      solve({ bars: lowRatio, sign: "POSITIVE" }),
      solve({ bars: singlyBottom, fc: 40, sign: "POSITIVE" }),
      solve({ bars: singlyBottom, fy: 400, sign: "POSITIVE" }),
    ];
    for (const result of cases) {
      expect(result.ok).toBe(true);
      if (!result.ok) continue;
      expect(Math.abs(result.equilibriumResidualN)).toBeLessThanOrEqual(EU_C2_NUMERICAL_TOLERANCE.equilibriumResidualN);
      expect(Number.isFinite(result.resistanceMomentNm)).toBe(true);
      expect(result.resistanceMomentNm).not.toBe(0);
    }
  });

  it("proves section-integration mesh convergence on a representative rectangle", { timeout: 60_000 }, () => {
    const coarse = solve({ mesh: 20 });
    const mid = solve({ mesh: 40 });
    const fine = solve({ mesh: 80 });
    expect(coarse.ok && mid.ok && fine.ok).toBe(true);
    if (!coarse.ok || !mid.ok || !fine.ok) return;
    closeAbsRel(mid.resistanceMomentNm, fine.resistanceMomentNm, 1, EU_C2_NUMERICAL_TOLERANCE.meshConvergenceRel);
    expect(EU_C2_INTEGRATION_CONVERGENCE_CRITERION.length).toBeGreaterThan(10);
  });

  it("fails closed on nonconvergence, unsupported axial, unsupported geometry, and missing NDP", { timeout: 20_000 }, () => {
    expect(EU_C2_EQUILIBRIUM_NONCONVERGENCE_FAILS_CLOSED).toBe(true);
    expect(EU_C2_NONZERO_AXIAL_ACTION_SILENTLY_IGNORED).toBe(false);
    expect(EU_C2_AXIAL_APPLICABILITY).toBe("PURE_FLEXURE_ZERO_APPLIED_AXIAL_ONLY");
    const limited = solve({ maxIter: 0 });
    expect(limited.ok).toBe(false);
    const circle = evaluateEuC2UniaxialFlexureResistance({
      methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
      axis: "MAJOR_AXIS",
      momentSign: "POSITIVE",
      geometry: circularSection("c2-circ", 400, "c2"),
      layout: singlyBottom,
      concrete: concrete(),
      reinforcement: reo(),
      context: context(true),
      provenanceRef: "c2-circ",
    });
    expect(circle.ok).toBe(false);
    if (circle.ok) return;
    expect(circle.checkState).toBe("UNSUPPORTED_SCOPE");
    const missingNdp = evaluateEuC2UniaxialFlexureResistance({
      methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
      axis: "MAJOR_AXIS",
      momentSign: "POSITIVE",
      geometry: rectangleSection("c2-rect", 300, 500, "c2"),
      layout: singlyBottom,
      concrete: concrete(),
      reinforcement: reo(),
      context: { nationalAnnexRef: "DECLARED_TEST_NA", testOnlyNonConformance: true },
      provenanceRef: "c2-missing-ndp",
    });
    expect(missingNdp.ok).toBe(false);
    const nanGeom = evaluateEuC2UniaxialFlexureResistance({
      methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
      axis: "MAJOR_AXIS",
      momentSign: "POSITIVE",
      geometry: rectangleSection("c2-rect", Number.NaN, 500, "c2"),
      layout: singlyBottom,
      concrete: concrete(),
      reinforcement: reo(),
      context: context(true),
      provenanceRef: "c2-nan",
    });
    expect(nanGeom.ok).toBe(false);
    const highStrength = evaluateEuC2UniaxialFlexureResistance({
      methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
      axis: "MAJOR_AXIS",
      momentSign: "POSITIVE",
      geometry: rectangleSection("c2-rect", 300, 500, "c2"),
      layout: singlyBottom,
      concrete: concrete(90),
      reinforcement: reo(),
      context: context(true),
      provenanceRef: "c2-c90",
    });
    expect(highStrength.ok).toBe(false);
  });

  it("reuses D1C demand, checks utilization only in a valid context, and does not label EN 1992 resistance", { timeout: 30_000 }, () => {
    expect(EU_C2_D1C_MOMENT_DEMAND_REUSED).toBe(true);
    expect(EU_C2_CHECK_STATE_GOVERNED).toBe(true);
    const result = evaluateEuConcreteFlexure({
      methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
      axis: "MAJOR_AXIS",
      geometry: rectangleSection("c2-rect", 300, 500, "c2"),
      layout: singlyBottom,
      concrete: concrete(),
      reinforcement: reo(),
      demand: demand(50_000),
      resolverInput: emptyResolverInput({ projectContext: project("DE") }),
      constitutiveContext: context(true),
    });
    expect(result.checkState).toBe("CHECK_SATISFIED");
    expect(result.en1992Utilization).toBeNull();
    expect(result.designResistanceNm).toBeNull();
    expect(result.labelledEn1992Resistance).toBe(false);
    expect(result.designRuleUtilization).not.toBeNull();
    expect(result.conformanceState).toBe("INTENDED_PROFILE");
    expect(result.detailingComplianceImplied).toBe(false);
    const over = evaluateEuConcreteFlexure({
      methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
      axis: "MAJOR_AXIS",
      geometry: rectangleSection("c2-rect", 300, 500, "c2"),
      layout: singlyBottom,
      concrete: concrete(),
      reinforcement: reo(),
      demand: demand(5_000_000),
      resolverInput: emptyResolverInput({ projectContext: project("DE") }),
      constitutiveContext: context(true),
    });
    expect(over.checkState).toBe("CHECK_NOT_SATISFIED");
    const axial = evaluateEuConcreteFlexure({
      methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
      axis: "MAJOR_AXIS",
      geometry: rectangleSection("c2-rect", 300, 500, "c2"),
      layout: singlyBottom,
      concrete: concrete(),
      reinforcement: reo(),
      demand: demand(50_000, 25000),
      resolverInput: emptyResolverInput({ projectContext: project("DE") }),
      constitutiveContext: context(true),
    });
    expect(axial.checkState).toBe("CHECK_UNDETERMINED");
    expect(axial.warnings).toContain("UNSUPPORTED_AXIAL_ACTION");
    expect(axial.designRuleUtilization).toBeNull();
  });

  it("invalidates fingerprints, keeps unit consistency, and refuses stale reuse", { timeout: 30_000 }, () => {
    const a = solve({ bars: singlyBottom });
    const b = solve({ bars: doubly });
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    const tags = euC2InvalidationTags(a.resultFingerprint, b.resultFingerprint);
    expect(tags.length).toBeGreaterThan(0);
    expect(() => assertStaleEuC2NotReused(tags, true)).toThrow(/stale/i);
    const pa = solve({ fc: 30 });
    const mpa = evaluateEuC2UniaxialFlexureResistance({
      methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
      axis: "MAJOR_AXIS",
      momentSign: "POSITIVE",
      geometry: rectangleSection("c2-rect", 300, 500, "c2"),
      layout: singlyBottom,
      concrete: concrete(30e6, "Pa"),
      reinforcement: reo(),
      context: context(true),
      provenanceRef: "c2-pa",
    });
    expect(pa.ok && mpa.ok).toBe(true);
    if (!pa.ok || !mpa.ok) return;
    closeAbsRel(mpa.resistanceMomentNm, pa.resistanceMomentNm, EU_C2_NUMERICAL_TOLERANCE.unitConsistencyAbsNm, EU_C2_NUMERICAL_TOLERANCE.unitConsistencyRel);
  });

  it("does not reproduce copyrighted standard text in the C2 document", () => {
    const doc = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../../../docs/architecture/engineering-os/EOS_D1E_EU_C2_FLEXURE.md"), "utf8");
    expect(doc).toMatch(/EOS-D1E-EU-C2/);
    expect(doc).not.toMatch(/shall be taken as/i);
  });
});
