/**
 * EOS-D1E-1 independent benchmarks.
 * Expected values are hand-derived closed-form results, not copied from the production kernel.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_CAN_OVERRIDE_DETERMINISTIC_SECTION_KERNEL,
  AI_ENGINEERING_APPROVAL,
  AI_RC_SECTION_ASSISTANCE_ADVISORY_ONLY,
  AU_CONCRETE_PARAMETER_LEAKAGE_INTO_COMMON,
  AU_CONCRETE_STANDARD_EDITION,
  AU_STEEL_PACK_CERTIFIED,
  AUTOMATIC_RC_ENGINEERING_APPROVAL,
  CODE_REINFORCEMENT_RATIO_RULE_IMPLEMENTED,
  CODE_STRESS_BLOCK_IN_COMMON_KERNEL,
  COMMON_RC_KERNEL_READY_FOR_AU_ADAPTER,
  COMMON_RC_KERNEL_READY_FOR_EU_ADAPTER,
  COMMON_RC_KERNEL_READY_FOR_US_ADAPTER,
  CONCRETE_E_DERIVED_FROM_UNGOVERNED_GRADE,
  CONSTRUCTION_STAGE_ANALYSIS_IMPLEMENTED,
  D1C_EQUALS_GENERAL_CONCRETE_ANALYSIS,
  D1E0_CONCRETE_ARCHITECTURE_REUSED,
  D1E1_CANONICAL_SCOPE,
  D1E1_CANONICAL_SCOPE_CONFIRMED,
  D1E1_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK,
  D1E1_PRODUCT_CLAIM_LEVEL,
  D1E1_STANDARD_CONFORMANCE_VALIDATED,
  RC_RESULT_AUTHORITIES,
  DEFAULT_BOND_SLIP_MODEL,
  DEFAULT_CONCRETE_CARBON_FACTOR,
  DEFAULT_CONCRETE_CRACKING_MODEL,
  DEFAULT_CONCRETE_ULTIMATE_STRAIN,
  DEFAULT_CREEP_MODEL,
  DEFAULT_LAP_LENGTH,
  DEFAULT_MINIMUM_CONCRETE_COVER,
  DEFAULT_REINFORCEMENT_CARBON_FACTOR,
  DEFAULT_REINFORCEMENT_STRAIN_LIMIT,
  DEFAULT_SHRINKAGE_MODEL,
  D1D_ARCHITECTURE_CONTRACT_FROZEN,
  EMPLOYEE_BEHAVIOR_PROFILING,
  EOS_D1E1_CLOSED,
  EU_CONCRETE_PARAMETER_LEAKAGE_INTO_COMMON,
  EU_CONCRETE_STANDARD_EDITION,
  EU_HIGH_WATER_MARK_INHERITED,
  EU_STEEL_PACK_CERTIFIED,
  GENERAL_CONCRETE_FEA_CLAIMED,
  GENERATIVE_GEOMETRY_BYPASSES_VALIDATION,
  GEOMETRIC_CLEARANCE_EQUALS_CODE_COVER,
  GLOBAL_CODE_STRESS_BLOCK_IMPLEMENTED,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  LLM_RC_SECTION_NUMERICAL_AUTHORITY,
  LINEAR_ELASTIC_REFERENCE_EQUALS_CODE_CAPACITY,
  NEUTRAL_AXIS_EQUALS_CODE_CAPACITY_STATE,
  NUMERICAL_CODE_CRACK_WIDTH_IMPLEMENTED,
  NUMERICAL_CONCRETE_CODE_SHEAR_IMPLEMENTED,
  NUMERICAL_CONCRETE_TORSION_IMPLEMENTED,
  NUMERICAL_DEVELOPMENT_LENGTH_IMPLEMENTED,
  NUMERICAL_PUNCHING_SHEAR_IMPLEMENTED,
  PARALLEL_AU_CONCRETE_CORE_CREATED,
  PARALLEL_CAPABILITY_MANIFEST_CREATED,
  PARALLEL_EU_CONCRETE_CORE_CREATED,
  PARALLEL_RC_SECTION_ARCHITECTURE_CREATED,
  PARALLEL_RC_SECURITY_MODEL_CREATED,
  PARALLEL_RC_STRUCTURAL_ANALYSIS_ENGINE_CREATED,
  PARALLEL_US_CONCRETE_CORE_CREATED,
  PRESTRESSED_CONCRETE_DESIGN_IMPLEMENTED,
  RC_COMMON_MECHANICS_AUTHORITY_TYPE,
  RC_ELASTIC_REFERENCE_SCOPE_TRUTHFUL,
  RC_LINEAR_ELASTIC_CONCRETE_REFERENCE,
  RC_LINEAR_ELASTIC_REINFORCEMENT_REFERENCE,
  RC_NUMERICAL_TOLERANCE,
  RC_SECTION_CONTEXT_PII_REQUIRED,
  RC_SECTION_EQUILIBRIUM_SOLVER_IMPLEMENTED,
  RC_SECTION_MECHANICS_EQUALS_ENGINEERING_APPROVAL,
  RC_SECTION_MECHANICS_JURISDICTION_NEUTRAL,
  RC_SECTION_SIGN_CONVENTIONS,
  RC_UNCRACKED_ELASTIC_SECTION_REFERENCE,
  RECOMMENDED_D1E_NEXT_PHASE,
  RECOMMENDED_D1E_NEXT_PHASE_SCOPE,
  SCHEMA_CHANGE_REQUIRED_FOR_D1E1,
  SILENT_CONCRETE_STANDARD_EDITION_INFERENCE,
  SILENT_RC_UNIT_CONVERSION,
  STANDARD_TEXT_REQUIRED_BY_RUNTIME,
  TRANSFORMED_SECTION_MODULAR_RATIO_GUESSED,
  UNGOVERNED_BAR_NAME_GENERATES_AREA,
  US_CONCRETE_PARAMETER_LEAKAGE_INTO_COMMON,
  US_CONCRETE_STANDARD_EDITION,
  US_STEEL_PACK_CERTIFIED,
  type ConcreteMaterial,
  type ReinforcementLayout,
  type ReinforcementMaterial,
  type StructuralDemandResult,
} from "@rtb/types";
import { isEuOnlyArchitecture, isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import { D1D_CAPABILITY_MANIFEST, STEEL_ADAPTER_BOUNDARIES } from "../structural-steel";
import {
  CONCRETE_ADAPTER_BOUNDARIES,
  CONCRETE_CAPABILITY_MANIFEST,
  D1E_INTERNAL_ROADMAP,
  D1E_VALIDATION_DEBT_REGISTER,
  D1E1_D0_RISK_DISPOSITION,
  RC_ELASTIC_REFERENCE_EXCLUSIONS,
  STRUCTURAL_CAPABILITY_MANIFEST,
  assertAiCannotOverrideSectionKernel,
  assertDiscretizationConservation,
  assertNonconvergenceFailsClosed,
  barStrainFromSectionKinematics,
  circularSection,
  computeGrossSectionProperties,
  consumeD1cSectionActions,
  createStrainState,
  discretizeSection,
  evaluateBarGeometry,
  evaluateStrainField,
  fingerprintRcSectionConfiguration,
  flangedTSection,
  geometricClearances,
  geometryInvalidationTags,
  integrateElasticSection,
  lSection,
  linearElasticConcreteModel,
  modularRatio,
  neutralAxisFromStrainState,
  polygonalSection,
  rcSectionMtoHandoff,
  rcSectionOptimizationHandoff,
  rectangleSection,
  screenGenerativeRcCandidate,
  sectionEquilibriumResidual,
  solveElasticEquilibrium,
  strainAtPoint,
  uncrackedElasticSectionReference,
} from "./index";

const here = dirname(fileURLToPath(import.meta.url));

const RECT_A = 300 * 500;
const RECT_IX = (300 * 500 ** 3) / 12;
const RECT_IY = (500 * 300 ** 3) / 12;
const CIRCLE_R = 200;
const CIRCLE_A = Math.PI * CIRCLE_R * CIRCLE_R;
const CIRCLE_I = (Math.PI * CIRCLE_R ** 4) / 4;
const T_A = 32000 + 84000;
const T_CY = (32000 * 460 + 84000 * 210) / T_A;
const T_IX =
  (400 * 80 ** 3) / 12 +
  32000 * (460 - T_CY) ** 2 +
  (200 * 420 ** 3) / 12 +
  84000 * (210 - T_CY) ** 2;
const T_IY = (80 * 400 ** 3) / 12 + (420 * 200 ** 3) / 12;
const TRI_A = 0.5 * 400 * 300;
const TRI_CX = 400 / 3;
const TRI_CY = 300 / 3;
const TRI_IX = (400 * 300 ** 3) / 36;
const TRI_IY = (300 * 400 ** 3) / 36;
const VOID_A = RECT_A - 80 * 80;
const VOID_IX = RECT_IX - (80 * 80 ** 3) / 12;
const E_CONC = 30000;
const EPS0 = 1e-4;
const RECT_N = E_CONC * RECT_A * EPS0;
const PHIX = 1e-6;
const RECT_MX = (E_CONC * PHIX * RECT_IX) / 1000;

function provenance() {
  return governedProvenance({ jurisdiction: "australia", standard: "AS 3600", version: "d1e1" });
}

function governed(name: string, value: number, unit: string) {
  return { name, value, unit, provenanceRef: "cert-1", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
}

function concrete(): ConcreteMaterial {
  return {
    materialRef: "conc-1",
    designation: "N32",
    compressiveStrength: governed("fc", 32, "MPa"),
    tensileStrength: null,
    elasticModulus: governed("Ec", E_CONC, "MPa"),
    density: governed("rho", 2400, "kg/m3"),
    poissonRatio: null,
    age: null,
    strengthReferenceAge: null,
    materialClass: null,
    materialStandardRef: "AS 1379",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    testCertificateRef: "mill-1",
    environmentalMetadata: null,
    version: "1",
    provenance: provenance(),
  };
}

function reo(): ReinforcementMaterial {
  return {
    materialRef: "reo-1",
    designation: "D500N",
    yieldStrength: governed("fy", 500, "MPa"),
    ultimateStrength: null,
    elasticModulus: governed("Es", 200000, "MPa"),
    ductilityClass: null,
    productStandardRef: "AS/NZS 4671",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    version: "1",
    provenance: provenance(),
  };
}

function emptyLayout(): ReinforcementLayout {
  return { layoutId: "lay-empty", bars: [], groups: [], layers: [], transverse: [], provenanceRef: "lay-empty" };
}

function twoBarLayout(): ReinforcementLayout {
  const bar = (id: string, x: number, y: number): ReinforcementLayout["bars"][number] => ({
    barId: id,
    designation: "N20",
    diameterMm: governed("d", 20, "mm"),
    areaMm2: governed("As", 314, "mm2"),
    count: 1,
    xMm: x,
    yMm: y,
    layerId: "layer-1",
    face: "bottom",
    direction: "longitudinal",
    spacingMm: 150,
    groupId: "group-1",
    materialRef: "reo-1",
    anchorageMetadata: null,
    lapMetadata: null,
    provenanceRef: "layout-1",
  });
  return {
    layoutId: "lay-1",
    bars: [bar("b1", 50, 50), bar("b2", 250, 50)],
    groups: [{ groupId: "group-1", barIds: ["b1", "b2"], face: "bottom", materialRef: "reo-1", provenanceRef: "layout-1" }],
    layers: [{ layerId: "layer-1", groupIds: ["group-1"], face: "bottom", provenanceRef: "layout-1" }],
    transverse: [],
    provenanceRef: "layout-1",
  };
}

function demand(): StructuralDemandResult {
  const auContext = createConfiguredKnowledgeContext({
    contextId: "ctx-as3600",
    jurisdictionProfileRef: "australia",
    standardFamily: "AS",
    standardCode: "AS 3600",
    edition: "UNKNOWN_PENDING_CONFIRMATION",
    materialScope: "concrete",
  });
  return {
    resultId: "demand-1",
    memberId: "m1",
    boundaryCondition: "SIMPLE_SIMPLE",
    spanM: 8,
    combinationId: "comb-1",
    loadCaseIds: ["g"],
    methods: ["SS_BEAM_UDL"],
    reactions: { startFyN: 0, endFyN: 0, startMzNm: 0, endMzNm: 0, unitForce: "N", unitMoment: "N.m" },
    shear: { value: 80000, unit: "N", locationM: 0, signed: 80000 },
    moment: { value: 160000, unit: "N.m", locationM: 4, signed: 160000 },
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
    standardContext: auContext,
    toolRef: "d1c",
    toolVersion: "d1c",
    provenanceRef: provenance(),
    inputEvidenceRefs: [{ evidenceId: "ev-d", sourceKind: "calculation", reference: "d1c" }],
    foundationReactionHandoff: { startFyN: 0, endFyN: 0, startMzNm: 0, endMzNm: 0, geotechnicalCapacityCalculated: false },
  };
}

function readTree(dir: string): string {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return readTree(path);
      if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".md")) return [];
      return [readFileSync(path, "utf8")];
    })
    .join("\n");
}

describe("EOS-D1E-1 RC section mechanics kernel", () => {
  it("confirms canonical D1E-1 scope, D1E-0 reuse, and truthful product claim", () => {
    expect(D1E1_CANONICAL_SCOPE_CONFIRMED).toBe(true);
    expect(D1E1_CANONICAL_SCOPE).toMatch(/common RC section mechanics/);
    expect(D1E0_CONCRETE_ARCHITECTURE_REUSED).toBe(true);
    expect(PARALLEL_RC_SECTION_ARCHITECTURE_CREATED).toBe(false);
    expect(RC_SECTION_MECHANICS_JURISDICTION_NEUTRAL).toBe(true);
    expect(D1E1_PRODUCT_CLAIM_LEVEL).toBe("DETERMINISTIC_RC_SECTION_GEOMETRY_AND_MECHANICS_FOUNDATION");
    expect(D1E1_STANDARD_CONFORMANCE_VALIDATED).toBe(false);
    expect(RC_COMMON_MECHANICS_AUTHORITY_TYPE).toBe("ESTABLISHED_ENGINEERING_MECHANICS");
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(D1E_INTERNAL_ROADMAP[1]?.id).toBe("D1E-1");
    expect(RECOMMENDED_D1E_NEXT_PHASE).toBe("D1E-AU");
    expect(RECOMMENDED_D1E_NEXT_PHASE_SCOPE).toMatch(/AS 3600/);
    expect(CONCRETE_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1E.GLOBAL.RC_SECTION_MECHANICS")).toBe(true);
    expect(PARALLEL_CAPABILITY_MANIFEST_CREATED).toBe(false);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.length).toBeGreaterThan(D1D_CAPABILITY_MANIFEST.length);
    expect(SCHEMA_CHANGE_REQUIRED_FOR_D1E1).toBe(false);
    expect(EOS_D1E1_CLOSED).toBe(true);
  });

  it("implements independent geometry benchmarks for rectangle, circle, T, triangle, void, translation, and principal axes", () => {
    const rect = computeGrossSectionProperties(rectangleSection("r", 300, 500, "p"));
    expect(rect.resultAuthority).toBe("GEOMETRY_RESULT");
    expect(rect.grossConcreteAreaMm2).toBeCloseTo(RECT_A, 6);
    expect(rect.centroidXMm).toBeCloseTo(150, 6);
    expect(rect.centroidYMm).toBeCloseTo(250, 6);
    expect(rect.IxMm4).toBeCloseTo(RECT_IX, 3);
    expect(rect.IyMm4).toBeCloseTo(RECT_IY, 3);
    expect(rect.IxyMm4).toBeCloseTo(0, 6);

    const circ = computeGrossSectionProperties(circularSection("c", 400, "p"));
    expect(circ.grossConcreteAreaMm2).toBeCloseTo(CIRCLE_A, 4);
    expect(circ.centroidXMm).toBeCloseTo(200, 6);
    expect(circ.IxMm4).toBeCloseTo(CIRCLE_I, 0);

    const tee = computeGrossSectionProperties(flangedTSection("t", 400, 80, 200, 500, "p"));
    expect(tee.grossConcreteAreaMm2).toBeCloseTo(T_A, 6);
    expect(tee.centroidXMm).toBeCloseTo(200, 6);
    expect(tee.centroidYMm).toBeCloseTo(T_CY, 6);
    expect(tee.IxMm4).toBeCloseTo(T_IX, 0);
    expect(tee.IyMm4).toBeCloseTo(T_IY, 0);

    const tri = computeGrossSectionProperties(
      polygonalSection("tri", [{ xMm: 0, yMm: 0 }, { xMm: 400, yMm: 0 }, { xMm: 0, yMm: 300 }], [], "p"),
    );
    expect(tri.grossConcreteAreaMm2).toBeCloseTo(TRI_A, 4);
    expect(tri.centroidXMm).toBeCloseTo(TRI_CX, 4);
    expect(tri.centroidYMm).toBeCloseTo(TRI_CY, 4);
    expect(tri.IxMm4).toBeCloseTo(TRI_IX, 0);
    expect(tri.IyMm4).toBeCloseTo(TRI_IY, 0);
    expect(Math.abs(tri.principalAngleRad)).toBeGreaterThan(0);

    const withVoid = computeGrossSectionProperties(
      polygonalSection(
        "v",
        [{ xMm: 0, yMm: 0 }, { xMm: 300, yMm: 0 }, { xMm: 300, yMm: 500 }, { xMm: 0, yMm: 500 }],
        [{ voidId: "h1", regionId: "h1", kind: "RECTANGLE", voidKind: "VOID", originMm: { xMm: 110, yMm: 210 }, widthMm: 80, depthMm: 80 }],
        "p",
      ),
    );
    expect(withVoid.grossConcreteAreaMm2).toBeCloseTo(VOID_A, 4);
    expect(withVoid.centroidXMm).toBeCloseTo(150, 4);
    expect(withVoid.IxMm4).toBeCloseTo(VOID_IX, 0);

    const shifted = rectangleSection("s", 300, 500, "p");
    shifted.regions = [{ regionId: "s-rect", kind: "RECTANGLE", originMm: { xMm: 100, yMm: 50 }, widthMm: 300, depthMm: 500 }];
    const translated = computeGrossSectionProperties(shifted);
    expect(translated.centroidXMm).toBeCloseTo(250, 6);
    expect(translated.centroidYMm).toBeCloseTo(300, 6);
    expect(translated.IxMm4).toBeCloseTo(RECT_IX, 3);

    const ell = computeGrossSectionProperties(lSection("L", 500, 500, 200, 150, "p"));
    expect(ell.IxyMm4).not.toBeCloseTo(0, 3);
    expect(ell.principalI1Mm4).toBeGreaterThan(ell.principalI2Mm4);
  });

  it("fails closed on invalid polygons, voids, units, bars, and duplicate identifiers", () => {
    expect(() => computeGrossSectionProperties(polygonalSection("bad", [{ xMm: 0, yMm: 0 }, { xMm: 10, yMm: 10 }, { xMm: 0, yMm: 10 }, { xMm: 10, yMm: 0 }], [], "p"))).toThrow(/self-intersecting|fail closed/i);
    expect(() => computeGrossSectionProperties(polygonalSection("z", [{ xMm: 0, yMm: 0 }, { xMm: 1, yMm: 0 }, { xMm: 2, yMm: 0 }], [], "p"))).toThrow(/fail closed/i);
    expect(() => computeGrossSectionProperties(polygonalSection("nan", [{ xMm: Number.NaN, yMm: 0 }, { xMm: 1, yMm: 0 }, { xMm: 0, yMm: 1 }], [], "p"))).toThrow(/fail closed/i);
    expect(() => computeGrossSectionProperties(rectangleSection("neg", -300, 500, "p"))).toThrow(/fail closed/i);
    const outsideVoid = polygonalSection(
      "ov",
      [{ xMm: 0, yMm: 0 }, { xMm: 100, yMm: 0 }, { xMm: 100, yMm: 100 }, { xMm: 0, yMm: 100 }],
      [{ voidId: "out", regionId: "out", kind: "RECTANGLE", voidKind: "VOID", originMm: { xMm: 200, yMm: 200 }, widthMm: 10, depthMm: 10 }],
      "p",
    );
    expect(() => computeGrossSectionProperties(outsideVoid)).toThrow(/fail closed/i);
    const geom = rectangleSection("r", 300, 500, "p");
    const outsideBar = twoBarLayout();
    outsideBar.bars = [{ ...outsideBar.bars[0]!, xMm: 900, yMm: 50, barId: "out" }];
    expect(() => evaluateBarGeometry(outsideBar, geom)).toThrow(/outside/i);
    const voided = polygonalSection(
      "vh",
      [{ xMm: 0, yMm: 0 }, { xMm: 300, yMm: 0 }, { xMm: 300, yMm: 500 }, { xMm: 0, yMm: 500 }],
      [{ voidId: "h1", regionId: "h1", kind: "RECTANGLE", voidKind: "VOID", originMm: { xMm: 110, yMm: 210 }, widthMm: 80, depthMm: 80 }],
      "p",
    );
    const inHole = twoBarLayout();
    inHole.bars = [{ ...inHole.bars[0]!, xMm: 150, yMm: 250, barId: "hole" }];
    expect(() => evaluateBarGeometry(inHole, voided)).toThrow(/void/i);
    const negArea = twoBarLayout();
    negArea.bars = [{ ...negArea.bars[0]!, areaMm2: governed("As", -10, "mm2") }];
    expect(() => evaluateBarGeometry(negArea, geom)).toThrow(/fail closed/i);
    const dup = rectangleSection("d", 300, 500, "p");
    dup.regions = [dup.regions[0]!, { ...dup.regions[0]!, regionId: dup.regions[0]!.regionId }];
    expect(() => computeGrossSectionProperties(dup)).toThrow(/duplicate/i);
    expect(SILENT_RC_UNIT_CONVERSION).toBe(false);
  });

  it("implements independent reinforcement geometry, containment, clearance, and spacing benchmarks", () => {
    const geom = rectangleSection("r", 300, 500, "p");
    const layout = twoBarLayout();
    const bars = evaluateBarGeometry(layout, geom);
    expect(bars.totalAreaMm2).toBeCloseTo(628, 6);
    expect(bars.centroid?.xMm).toBeCloseTo(150, 6);
    expect(bars.centroid?.yMm).toBeCloseTo(50, 6);
    expect(bars.minBarClearSpacingMm).toBeCloseTo(200 - 10 - 10, 6);
    expect(Object.keys(bars.groupCentroids)).toHaveLength(1);
    expect(Object.keys(bars.layerCentroids)).toHaveLength(1);
    const clearance = geometricClearances(layout, geom);
    expect(clearance[0]?.geometricClearanceMm).toBeCloseTo(50 - 10, 6);
    expect(clearance[0]?.codeCoverCompliance).toBe(false);
    expect(GEOMETRIC_CLEARANCE_EQUALS_CODE_COVER).toBe(false);
    expect(DEFAULT_MINIMUM_CONCRETE_COVER).toBe(false);
    expect(UNGOVERNED_BAR_NAME_GENERATES_AREA).toBe(false);
  });

  it("implements independent plane-section kinematics benchmarks", () => {
    const axial = createStrainState(0.001, 0, 0, { xMm: 0, yMm: 0 });
    expect(strainAtPoint(axial, { xMm: 10, yMm: 20 })).toBeCloseTo(0.001, 12);
    expect(strainAtPoint(axial, { xMm: -4, yMm: 99 })).toBeCloseTo(0.001, 12);
    const uni = createStrainState(0, 1e-5, 0, { xMm: 0, yMm: 0 });
    expect(strainAtPoint(uni, { xMm: 0, yMm: 250 })).toBeCloseTo(-0.0025, 12);
    const bi = createStrainState(0, 1e-5, 2e-5, { xMm: 0, yMm: 0 });
    expect(strainAtPoint(bi, { xMm: 100, yMm: 50 })).toBeCloseTo(-0.0025, 12);
    expect(barStrainFromSectionKinematics(bi, { xMm: 50, yMm: 50 })).toBeCloseTo(-0.0015, 12);
    const field = evaluateStrainField("sec-1", axial, { xMm: 1, yMm: 1 }, "p");
    expect(field.resultAuthority).toBe("MECHANICS_REFERENCE");
    expect(field.labelledCodeCapacity).toBe(false);
    const na = neutralAxisFromStrainState(createStrainState(0, 1e-5, 0, { xMm: 150, yMm: 250 }));
    expect(na.exists).toBe(true);
    expect(na.labelledCodeCapacity).toBe(false);
    expect(NEUTRAL_AXIS_EQUALS_CODE_CAPACITY_STATE).toBe(false);
    expect(DEFAULT_BOND_SLIP_MODEL).toBe(false);
    expect(RC_SECTION_SIGN_CONVENTIONS.axialStrainPositive).toMatch(/tension/i);
  });

  it("conserves discretized area, centroid, and second moments and stays deterministic", () => {
    const geom = rectangleSection("r", 300, 500, "p");
    const mesh = discretizeSection(geom, 40, 40);
    const conservation = assertDiscretizationConservation(
      { areaMm2: RECT_A, cxMm: 150, cyMm: 250, IxMm4: RECT_IX, IyMm4: RECT_IY },
      mesh,
    );
    expect(conservation).toEqual({ area: "PASS", centroid: "PASS", secondMoment: "PASS" });
    const again = discretizeSection(geom, 40, 40);
    expect(again.fibers.length).toBe(mesh.fibers.length);
    expect(again.totalAreaMm2).toBe(mesh.totalAreaMm2);
    expect(RC_NUMERICAL_TOLERANCE.maxNewtonIterations).toBeGreaterThan(0);
  });

  it("integrates a linear-elastic reference against independent closed-form resultants", () => {
    const geom = rectangleSection("r", 300, 500, "p");
    const props = computeGrossSectionProperties(geom);
    const axial = createStrainState(EPS0, 0, 0, { xMm: props.centroidXMm, yMm: props.centroidYMm });
    const result = uncrackedElasticSectionReference({
      geometry: geom,
      layout: emptyLayout(),
      concrete: concrete(),
      reinforcement: reo(),
      strain: axial,
      displacementTreatment: "CONCRETE_GROSS_SEPARATE",
      crackState: "UNCRACKED_REFERENCE",
      resolutionX: 40,
      resolutionY: 40,
      provenanceRef: "p",
    });
    expect(result.resultAuthority).toBe("ELASTIC_REFERENCE");
    expect(result.labelledCodeCapacity).toBe(false);
    expect(result.N_N).toBeCloseTo(RECT_N, 0);
    expect(result.Mx_Nm).toBeCloseTo(0, 0);
    const curve = createStrainState(0, PHIX, 0, { xMm: props.centroidXMm, yMm: props.centroidYMm });
    const flex = integrateElasticSection({
      geometry: geom,
      layout: emptyLayout(),
      concrete: concrete(),
      reinforcement: reo(),
      strain: curve,
      displacementTreatment: "CONCRETE_GROSS_SEPARATE",
      crackState: "UNCRACKED_REFERENCE",
      resolutionX: 40,
      resolutionY: 40,
      provenanceRef: "p",
    });
    expect(flex.Mx_Nm).toBeCloseTo(RECT_MX, 0);
    expect(LINEAR_ELASTIC_REFERENCE_EQUALS_CODE_CAPACITY).toBe(false);
    expect(RC_ELASTIC_REFERENCE_EXCLUSIONS).toEqual(expect.arrayContaining(["cracking", "creep", "code stress blocks", "ultimate strength"]));
    expect(RC_ELASTIC_REFERENCE_SCOPE_TRUTHFUL).toBe(true);
    expect(modularRatio(concrete(), reo())).toBeCloseTo(200000 / 30000, 8);
    expect(TRANSFORMED_SECTION_MODULAR_RATIO_GUESSED).toBe(false);
    expect(linearElasticConcreteModel(concrete(), "ELASTIC_TENSION").authorityType).toBe("ESTABLISHED_ENGINEERING_MECHANICS");
  });

  it("computes equilibrium residuals, converges a bounded solver, and fails closed on non-convergence", () => {
    const geom = rectangleSection("r", 300, 500, "p");
    const props = computeGrossSectionProperties(geom);
    const solved = solveElasticEquilibrium({
      geometry: geom,
      layout: emptyLayout(),
      concrete: concrete(),
      reinforcement: reo(),
      target: { N_N: RECT_N, Mx_Nm: 0, My_Nm: 0 },
      originMm: { xMm: props.centroidXMm, yMm: props.centroidYMm },
      displacementTreatment: "CONCRETE_GROSS_SEPARATE",
      crackState: "UNCRACKED_REFERENCE",
      provenanceRef: "p",
    });
    expect(RC_SECTION_EQUILIBRIUM_SOLVER_IMPLEMENTED).toBe(true);
    expect(solved.state).toBe("CONVERGED");
    expect(solved.resultants?.labelledCodeCapacity).toBe(false);
    expect(solved.strain?.axialStrain).toBeCloseTo(EPS0, 6);
    const residual = sectionEquilibriumResidual(solved.resultants!, { N_N: RECT_N, Mx_Nm: 0, My_Nm: 0 });
    expect(Math.abs(residual.rN_N)).toBeLessThan(1);
    expect(() => assertNonconvergenceFailsClosed("NOT_CONVERGED")).toThrow(/not converge/i);
  });

  it("fingerprints configuration, invalidates dependents, and screens inverse-design candidates", () => {
    const geom = rectangleSection("r", 300, 500, "p");
    const layout = twoBarLayout();
    const fp = fingerprintRcSectionConfiguration({
      geometry: geom,
      layout,
      concreteRef: "conc-1",
      reinforcementRef: "reo-1",
      unitContext: "mm",
      displacementTreatment: "CONCRETE_GROSS_SEPARATE",
    });
    const moved = rectangleSection("r", 350, 500, "p");
    const fp2 = fingerprintRcSectionConfiguration({
      geometry: moved,
      layout,
      concreteRef: "conc-1",
      reinforcementRef: "reo-1",
      unitContext: "mm",
      displacementTreatment: "CONCRETE_GROSS_SEPARATE",
    });
    expect(fp).toMatch(/^[a-f0-9]{64}$/);
    expect(fp2).not.toBe(fp);
    expect(geometryInvalidationTags(fp, fp2).length).toBeGreaterThan(0);
    expect(screenGenerativeRcCandidate({ geometry: geom, layout, concrete: concrete(), reinforcement: reo() }).accepted).toBe(true);
    const bad = twoBarLayout();
    bad.bars = [{ ...bad.bars[0]!, xMm: -20, yMm: 50 }];
    expect(() => screenGenerativeRcCandidate({ geometry: geom, layout: bad, concrete: concrete(), reinforcement: reo() })).toThrow(/fail closed/i);
    expect(GENERATIVE_GEOMETRY_BYPASSES_VALIDATION).toBe(false);
    const opt = rcSectionOptimizationHandoff({ geometry: geom, layout, concrete: concrete(), reinforcement: reo(), displacementTreatment: "CONCRETE_GROSS_SEPARATE" });
    expect(opt.areaMm2).toBeCloseTo(RECT_A, 6);
    expect(opt.massVolumeHooks.concreteVolumeM3).toBeNull();
    const mto = rcSectionMtoHandoff({ geometry: geom, layout, memberLengthM: 8 });
    expect(mto.concreteVolumeM3).toBeCloseTo((RECT_A * 1e-6) * 8, 8);
    expect(mto.emissionFactorEmbedded).toBe(false);
    expect(DEFAULT_CONCRETE_CARBON_FACTOR).toBe(false);
    expect(DEFAULT_REINFORCEMENT_CARBON_FACTOR).toBe(false);
    const actions = consumeD1cSectionActions(demand());
    expect(actions.Mx_Nm).toBe(160000);
    expect(D1C_EQUALS_GENERAL_CONCRETE_ANALYSIS).toBe(false);
    expect(PARALLEL_RC_STRUCTURAL_ANALYSIS_ENGINE_CREATED).toBe(false);
  });

  it("keeps code-design, adapter, AI, and boundary flags fail-closed and does not leak jurisdiction rules", () => {
    expect(CODE_STRESS_BLOCK_IN_COMMON_KERNEL).toBe(false);
    expect(GLOBAL_CODE_STRESS_BLOCK_IMPLEMENTED).toBe(false);
    expect(CONCRETE_E_DERIVED_FROM_UNGOVERNED_GRADE).toBe(false);
    expect(DEFAULT_CONCRETE_CRACKING_MODEL).toBe(false);
    expect(DEFAULT_CONCRETE_ULTIMATE_STRAIN).toBe(false);
    expect(DEFAULT_REINFORCEMENT_STRAIN_LIMIT).toBe(false);
    expect(NUMERICAL_CONCRETE_CODE_SHEAR_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_PUNCHING_SHEAR_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_CONCRETE_TORSION_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_CODE_CRACK_WIDTH_IMPLEMENTED).toBe(false);
    expect(DEFAULT_CREEP_MODEL).toBe(false);
    expect(DEFAULT_SHRINKAGE_MODEL).toBe(false);
    expect(NUMERICAL_DEVELOPMENT_LENGTH_IMPLEMENTED).toBe(false);
    expect(DEFAULT_LAP_LENGTH).toBe(false);
    expect(CODE_REINFORCEMENT_RATIO_RULE_IMPLEMENTED).toBe(false);
    expect(PRESTRESSED_CONCRETE_DESIGN_IMPLEMENTED).toBe(false);
    expect(CONSTRUCTION_STAGE_ANALYSIS_IMPLEMENTED).toBe(false);
    expect(GENERAL_CONCRETE_FEA_CLAIMED).toBe(false);
    expect(AU_CONCRETE_PARAMETER_LEAKAGE_INTO_COMMON).toBe(false);
    expect(EU_CONCRETE_PARAMETER_LEAKAGE_INTO_COMMON).toBe(false);
    expect(US_CONCRETE_PARAMETER_LEAKAGE_INTO_COMMON).toBe(false);
    expect(COMMON_RC_KERNEL_READY_FOR_AU_ADAPTER).toBe(true);
    expect(COMMON_RC_KERNEL_READY_FOR_EU_ADAPTER).toBe(true);
    expect(COMMON_RC_KERNEL_READY_FOR_US_ADAPTER).toBe(true);
    expect(AU_CONCRETE_STANDARD_EDITION).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(EU_CONCRETE_STANDARD_EDITION).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(US_CONCRETE_STANDARD_EDITION).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(SILENT_CONCRETE_STANDARD_EDITION_INFERENCE).toBe(false);
    expect(CONCRETE_ADAPTER_BOUNDARIES.AU_CONCRETE.ready).toBe(true);
    expect(CONCRETE_ADAPTER_BOUNDARIES.AU_CONCRETE.implemented).toBe(false);
    expect(AI_RC_SECTION_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(LLM_RC_SECTION_NUMERICAL_AUTHORITY).toBe(false);
    expect(AI_CAN_OVERRIDE_DETERMINISTIC_SECTION_KERNEL).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(RC_SECTION_MECHANICS_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(AUTOMATIC_RC_ENGINEERING_APPROVAL).toBe(false);
    assertAiCannotOverrideSectionKernel();
    expect(RC_SECTION_CONTEXT_PII_REQUIRED).toBe(false);
    expect(EMPLOYEE_BEHAVIOR_PROFILING).toBe(false);
    expect(PARALLEL_RC_SECURITY_MODEL_CREATED).toBe(false);
    expect(STANDARD_TEXT_REQUIRED_BY_RUNTIME).toBe(false);
    expect(D1E1_D0_RISK_DISPOSITION.CLOSED).toBe("NONE");
    expect(D1E1_D0_RISK_DISPOSITION.INTRODUCED).toBe("NONE");
    expect(D1E_VALIDATION_DEBT_REGISTER.some((row) => row.debtId === "D1E-VD-SECTION-ANALYSIS" && row.blockingState === "PARTIAL")).toBe(true);
    expect(RC_RESULT_AUTHORITIES).toEqual(["GEOMETRY_RESULT", "MECHANICS_REFERENCE", "ELASTIC_REFERENCE"]);
    expect(RC_LINEAR_ELASTIC_CONCRETE_REFERENCE).toBe(true);
    expect(RC_LINEAR_ELASTIC_REINFORCEMENT_REFERENCE).toBe(true);
    expect(RC_UNCRACKED_ELASTIC_SECTION_REFERENCE).toBe(true);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(isEuOnlyArchitecture()).toBe(false);
    expect(EU_HIGH_WATER_MARK_INHERITED).toBe(true);
    expect(D1E1_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK).toBe(true);
    expect(D1D_ARCHITECTURE_CONTRACT_FROZEN).toBe(true);
    expect(STEEL_ADAPTER_BOUNDARIES.AU_STEEL.implemented).toBe(true);
    expect(AU_STEEL_PACK_CERTIFIED).toBe(false);
    expect(EU_STEEL_PACK_CERTIFIED).toBe(false);
    expect(US_STEEL_PACK_CERTIFIED).toBe(false);
    expect(PARALLEL_AU_CONCRETE_CORE_CREATED).toBe(false);
    expect(PARALLEL_EU_CONCRETE_CORE_CREATED).toBe(false);
    expect(PARALLEL_US_CONCRETE_CORE_CREATED).toBe(false);
    const corpus = `${readTree(join(here, "section-mechanics"))}\n${readFileSync(join(here, "../../../../docs/architecture/engineering-os/EOS_D1E1_RC_SECTION_MECHANICS.md"), "utf8")}`;
    for (const pattern of [
      /is AS 3600 compliant/i,
      /is Eurocode 2 compliant/i,
      /is ACI 318 compliant/i,
      /φ\s*=\s*0\.9/,
      /gamma_c\s*=/,
      /β1\s*=/,
      /CONCRETE_PACK_CERTIFIED\s*=\s*true/i,
    ]) {
      expect(corpus).not.toMatch(pattern);
    }
  });
});
