import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_AS3600_CONFORMANCE_AUTHORITY,
  AI_AU_CONCRETE_ASSISTANCE_ADVISORY_ONLY,
  AI_ENGINEERING_APPROVAL,
  AI_STRESS_BLOCK_AUTHORITY,
  AI_STRENGTH_FACTOR_AUTHORITY,
  AS3600_STRESS_BLOCK_IN_COMMON_KERNEL,
  AU_AXIAL_FLEXURE_CODE_DESIGN_IMPLEMENTED,
  AU_BIAXIAL_CODE_DESIGN_IMPLEMENTED,
  AU_CODE_COVER_CHECK_IMPLEMENTED,
  AU_CODE_CRACK_CONTROL_IMPLEMENTED,
  AU_CONCRETE_COLUMN_CODE_DESIGN_IMPLEMENTED,
  AU_CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES,
  AU_CONCRETE_IMPLEMENTATION_MATURITY,
  AU_CONCRETE_PACK_CERTIFIED,
  AU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  AU_CONCRETE_SHEAR_CODE_METHOD_IMPLEMENTED,
  AU_CONCRETE_STANDARD_AMENDMENT_STATE,
  AU_CONCRETE_STANDARD_EDITION,
  AU_CONCRETE_STANDARD_FAMILY_BOUND,
  AU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  AU_DEVELOPMENT_LENGTH_IMPLEMENTED,
  AU_DUCTILITY_LIMIT_GUESSED,
  AU_FLEXURE_STRENGTH_FACTOR_GUESSED,
  AU_LONG_TERM_DEFLECTION_IMPLEMENTED,
  AU_MAXIMUM_REINFORCEMENT_CODE_CHECK_IMPLEMENTED,
  AU_MINIMUM_REINFORCEMENT_CODE_CHECK_IMPLEMENTED,
  AU_NEUTRAL_AXIS_EQUALS_CODE_CAPACITY_STATE,
  AU_PARAMETER_LEAKAGE_INTO_COMMON_RC_KERNEL,
  AU_PRESTRESSED_CONCRETE_DESIGN_IMPLEMENTED,
  AU_PUNCHING_SHEAR_CODE_METHOD_IMPLEMENTED,
  AU_REINFORCEMENT_STRAIN_LIMIT_GUESSED,
  AU_STRESS_BLOCK_PARAMETER_GUESSED,
  AU_ULTIMATE_CONCRETE_STRAIN_GUESSED,
  AU_UNIAXIAL_FLEXURE_SCOPE,
  AUTOMATIC_AU_CONCRETE_APPROVAL,
  COMMON_RC_BENCHMARK_EQUALS_AS3600_CONFORMANCE,
  COPYRIGHTED_AS3600_TEXT_COMMITTED,
  D1E_AU1_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK,
  D1E_AU1_SCOPE_CONFIRMED,
  DEFAULT_AU_CONCRETE_CARBON_FACTOR,
  DEFAULT_AU_CONCRETE_COST_RATE,
  DEFAULT_AU_REINFORCEMENT_CARBON_FACTOR,
  ELASTIC_RC_REFERENCE_EQUALS_AS3600_FLEXURAL_CAPACITY,
  EOS_D1E_AU1_CLOSED,
  EU_HIGH_WATER_MARK_INHERITED,
  GEOMETRIC_CLEARANCE_EQUALS_AS3600_COVER_COMPLIANCE,
  LLM_AU_CONCRETE_NUMERICAL_AUTHORITY,
  PARALLEL_AU_NEUTRAL_AXIS_SOLVER_CREATED,
  PARALLEL_AU_RC_SECTION_SOLVER_CREATED,
  PARALLEL_CAPABILITY_MANIFEST_CREATED,
  RECOMMENDED_D1E_NEXT_PHASE,
  RECOMMENDED_D1E_NEXT_PHASE_SCOPE,
  SCHEMA_CHANGE_REQUIRED_FOR_D1E_AU1,
  SILENT_AS3600_EDITION_INFERENCE,
  STANDARD_TEXT_REQUIRED_BY_RUNTIME,
  type ConcreteMaterial,
  type ReinforcementLayout,
  type ReinforcementMaterial,
  type StructuralDemandResult,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isEuOnlyArchitecture, isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import { D1D_CAPABILITY_MANIFEST, STEEL_ADAPTER_BOUNDARIES } from "../structural-steel";
import {
  AU_CONCRETE_FLEXURE_METHODS,
  AU_CONCRETE_MATERIAL_CATALOG,
  AU_REINFORCEMENT_CATALOG,
  AU_STRESS_BLOCK_RULE,
  AU_STRENGTH_FACTOR_RULE,
  AU_STRAIN_LIMIT_RULE,
  CONCRETE_ADAPTER_BOUNDARIES,
  CONCRETE_CAPABILITY_MANIFEST,
  D1E_AU1_D0_RISK_DISPOSITION,
  D1E_INTERNAL_ROADMAP,
  D1E_VALIDATION_DEBT_REGISTER,
  FRAMEWORK_ONLY_AU_CONCRETE_FLEXURE_METHODS,
  IMPLEMENTED_AU_CONCRETE_CODE_FLEXURE_METHODS,
  STRUCTURAL_CAPABILITY_MANIFEST,
  assertAuFlexureAiBoundary,
  assertAuOptimizerRejectsUndetermined,
  auFlexureFingerprint,
  auFlexureInvalidationTags,
  assertStaleAuFlexureNotReused,
  bindAuConcreteStandardFamily,
  evaluateAuConcreteFlexure,
  geometricClearances,
  rectangleSection,
  rcSectionMtoHandoff,
  resolveAuConcreteCatalogGrade,
  screenAuRcCandidate,
} from "./index";

const here = dirname(fileURLToPath(import.meta.url));
const E_CONC = 30000;
const RECT_IX = (300 * 500 ** 3) / 12;
const PHIX = 1e-6;
const RECT_MX = (E_CONC * PHIX * RECT_IX) / 1000;

const auContext = createConfiguredKnowledgeContext({
  contextId: "ctx-as3600",
  jurisdictionProfileRef: "australia",
  standardFamily: "AS",
  standardCode: "AS 3600",
  edition: "UNKNOWN_PENDING_CONFIRMATION",
  materialScope: "concrete",
});

function provenance() {
  return governedProvenance({ jurisdiction: "australia", standard: "AS 3600", version: "d1e-au1" });
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

function demand(momentNm = RECT_MX, axialN = 0): StructuralDemandResult {
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

describe("EOS-D1E-AU-1 bounded AU uniaxial RC flexure", () => {
  it("binds the AS 3600 family without inferring edition or claiming conformance", () => {
    expect(D1E_AU1_SCOPE_CONFIRMED).toBe(true);
    expect(AU_CONCRETE_STANDARD_FAMILY_BOUND).toBe(true);
    expect(AU_CONCRETE_STANDARD_EDITION).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(AU_CONCRETE_STANDARD_AMENDMENT_STATE).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(SILENT_AS3600_EDITION_INFERENCE).toBe(false);
    expect(AU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(AU_CONCRETE_PACK_CERTIFIED).toBe(false);
    bindAuConcreteStandardFamily(auContext);
    expect(AU_UNIAXIAL_FLEXURE_SCOPE).toBe(true);
    expect(AU_CONCRETE_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_COMMON_MECHANICS");
    expect(AU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("AU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "D1E-AU")?.status).toBe("THIS_PHASE");
    expect(RECOMMENDED_D1E_NEXT_PHASE).toBe("D1E-EU");
    expect(RECOMMENDED_D1E_NEXT_PHASE_SCOPE).toMatch(/EN 1992/);
    expect(EOS_D1E_AU1_CLOSED).toBe(true);
    expect(SCHEMA_CHANGE_REQUIRED_FOR_D1E_AU1).toBe(false);
  });

  it("reuses the D1E-1 kernel for geometry, kinematics, integration, and elastic equilibrium", () => {
    const result = evaluateAuConcreteFlexure({
      methodId: "AU_RC_FLEXURE_ELASTIC_MAJOR",
      axis: "MAJOR_AXIS",
      geometry: rectangleSection("r", 300, 500, "p"),
      layout: emptyLayout(),
      concrete: concrete(),
      reinforcement: reo(),
      demand: demand(),
      standardContext: auContext,
    });
    expect(result.resultAuthority).toBe("MECHANICS_REFERENCE");
    expect(result.labelledAs3600Capacity).toBe(false);
    expect(result.designMomentCapacityNm).toBeNull();
    expect(result.as3600Utilization).toBeNull();
    expect(result.checkState).toBe("CHECK_UNDETERMINED");
    expect(result.mechanicsState).toBe("EQUILIBRATED");
    expect(result.mechanicsReferenceMomentNm).toBeCloseTo(RECT_MX, 0);
    expect(result.warnings).toEqual(expect.arrayContaining(["AS3600_DESIGN_METHOD_UNAVAILABLE", "HUMAN_ENGINEERING_REVIEW_REQUIRED"]));
    expect(ELASTIC_RC_REFERENCE_EQUALS_AS3600_FLEXURAL_CAPACITY).toBe(false);
    expect(AU_NEUTRAL_AXIS_EQUALS_CODE_CAPACITY_STATE).toBe(false);
    expect(PARALLEL_AU_RC_SECTION_SOLVER_CREATED).toBe(false);
    expect(PARALLEL_AU_NEUTRAL_AXIS_SOLVER_CREATED).toBe(false);
    expect(geometricClearances(twoBarLayout(), rectangleSection("r", 300, 500, "p"))[0]?.codeCoverCompliance).toBe(false);
    expect(GEOMETRIC_CLEARANCE_EQUALS_AS3600_COVER_COMPLIANCE).toBe(false);
  });

  it("keeps AS 3600 code flexure framework-only and fails closed on unknown parameters and axial action", () => {
    expect(IMPLEMENTED_AU_CONCRETE_CODE_FLEXURE_METHODS).toBe("NONE");
    expect(FRAMEWORK_ONLY_AU_CONCRETE_FLEXURE_METHODS).toContain("AU_RC_FLEXURE_AS3600_UNIAXIAL_MAJOR");
    expect(AU_STRESS_BLOCK_RULE.parameters).toBeNull();
    expect(AU_STRENGTH_FACTOR_RULE.value).toBeNull();
    expect(AU_STRAIN_LIMIT_RULE.ultimateConcreteStrain).toBeNull();
    expect(AU_STRESS_BLOCK_PARAMETER_GUESSED).toBe(false);
    expect(AU_FLEXURE_STRENGTH_FACTOR_GUESSED).toBe(false);
    expect(AU_ULTIMATE_CONCRETE_STRAIN_GUESSED).toBe(false);
    expect(AU_REINFORCEMENT_STRAIN_LIMIT_GUESSED).toBe(false);
    const code = evaluateAuConcreteFlexure({
      methodId: "AU_RC_FLEXURE_AS3600_UNIAXIAL_MAJOR",
      axis: "MAJOR_AXIS",
      geometry: rectangleSection("r", 300, 500, "p"),
      layout: twoBarLayout(),
      concrete: concrete(),
      reinforcement: reo(),
      demand: demand(),
      standardContext: auContext,
    });
    expect(code.checkState).toBe("CHECK_UNDETERMINED");
    expect(code.resultAuthority).toBe("CODE_PROFILE_REFERENCE");
    expect(code.designMomentCapacityNm).toBeNull();
    const axial = evaluateAuConcreteFlexure({
      methodId: "AU_RC_FLEXURE_ELASTIC_MAJOR",
      axis: "MAJOR_AXIS",
      geometry: rectangleSection("r", 300, 500, "p"),
      layout: emptyLayout(),
      concrete: concrete(),
      reinforcement: reo(),
      demand: demand(RECT_MX, 25000),
      standardContext: auContext,
    });
    expect(axial.checkState).toBe("CHECK_UNDETERMINED");
    expect(axial.warnings).toContain("UNSUPPORTED_AXIAL_ACTION");
    expect(() => resolveAuConcreteCatalogGrade("N32")).toThrow(/catalog unpopulated/i);
    expect(AU_CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES).toBe(false);
  });

  it("invalidates stale results, rejects invalid candidates, and refuses undetermined optimization", () => {
    const fp1 = auFlexureFingerprint({
      memberRef: "m1",
      sectionGeometryVersion: "1",
      reinforcementFingerprint: "a",
      concreteMaterialRef: "c",
      reinforcementMaterialRef: "r",
      momentDemandRef: "d",
      combinationId: "c1",
      d1cRevision: "d1c",
      standardEdition: "UNKNOWN_PENDING_CONFIRMATION",
      materialModelRef: "e",
      stressBlockRuleRef: null,
      strainLimitRuleRef: null,
      strengthFactorRef: null,
      methodVersion: "d1e-au1.0",
    });
    const fp2 = auFlexureFingerprint({
      memberRef: "m1",
      sectionGeometryVersion: "2",
      reinforcementFingerprint: "a",
      concreteMaterialRef: "c",
      reinforcementMaterialRef: "r",
      momentDemandRef: "d",
      combinationId: "c1",
      d1cRevision: "d1c",
      standardEdition: "UNKNOWN_PENDING_CONFIRMATION",
      materialModelRef: "e",
      stressBlockRuleRef: null,
      strainLimitRuleRef: null,
      strengthFactorRef: null,
      methodVersion: "d1e-au1.0",
    });
    expect(fp1).toBe(fp1);
    expect(auFlexureInvalidationTags(fp1, fp2).length).toBeGreaterThan(0);
    expect(() => assertStaleAuFlexureNotReused(auFlexureInvalidationTags(fp1, fp2), true)).toThrow(/stale/i);
    const geom = rectangleSection("r", 300, 500, "p");
    expect(screenAuRcCandidate({ geometry: geom, layout: twoBarLayout(), concrete: concrete(), reinforcement: reo() }).accepted).toBe(true);
    const bad = twoBarLayout();
    bad.bars = [{ ...bad.bars[0]!, xMm: 900, yMm: 50 }];
    expect(() => screenAuRcCandidate({ geometry: geom, layout: bad, concrete: concrete(), reinforcement: reo() })).toThrow(/fail closed/i);
    expect(() => assertAuOptimizerRejectsUndetermined("CHECK_UNDETERMINED")).toThrow(/undetermined/i);
    expect(rcSectionMtoHandoff({ geometry: geom, layout: twoBarLayout() }).emissionFactorEmbedded).toBe(false);
    expect(DEFAULT_AU_CONCRETE_COST_RATE).toBe(false);
    expect(DEFAULT_AU_CONCRETE_CARBON_FACTOR).toBe(false);
    expect(DEFAULT_AU_REINFORCEMENT_CARBON_FACTOR).toBe(false);
    expect(AU_CONCRETE_MATERIAL_CATALOG.ready).toBe(true);
    expect(AU_REINFORCEMENT_CATALOG.populated).toBe(false);
  });

  it("preserves boundaries, AI limits, debt, and regression gates", () => {
    expect(AU_CONCRETE_FLEXURE_METHODS.every((row) => row.methodScope === "MECHANICS_REFERENCE_ONLY" || row.methodScope === "FRAMEWORK_ONLY")).toBe(true);
    expect(AU_PARAMETER_LEAKAGE_INTO_COMMON_RC_KERNEL).toBe(false);
    expect(AS3600_STRESS_BLOCK_IN_COMMON_KERNEL).toBe(false);
    expect(AU_MINIMUM_REINFORCEMENT_CODE_CHECK_IMPLEMENTED).toBe(false);
    expect(AU_MAXIMUM_REINFORCEMENT_CODE_CHECK_IMPLEMENTED).toBe(false);
    expect(AU_DUCTILITY_LIMIT_GUESSED).toBe(false);
    expect(AU_CONCRETE_SHEAR_CODE_METHOD_IMPLEMENTED).toBe(false);
    expect(AU_CONCRETE_COLUMN_CODE_DESIGN_IMPLEMENTED).toBe(false);
    expect(AU_AXIAL_FLEXURE_CODE_DESIGN_IMPLEMENTED).toBe(false);
    expect(AU_BIAXIAL_CODE_DESIGN_IMPLEMENTED).toBe(false);
    expect(AU_PUNCHING_SHEAR_CODE_METHOD_IMPLEMENTED).toBe(false);
    expect(AU_CODE_CRACK_CONTROL_IMPLEMENTED).toBe(false);
    expect(AU_LONG_TERM_DEFLECTION_IMPLEMENTED).toBe(false);
    expect(AU_DEVELOPMENT_LENGTH_IMPLEMENTED).toBe(false);
    expect(AU_PRESTRESSED_CONCRETE_DESIGN_IMPLEMENTED).toBe(false);
    expect(AU_CODE_COVER_CHECK_IMPLEMENTED).toBe(false);
    expect(COMMON_RC_BENCHMARK_EQUALS_AS3600_CONFORMANCE).toBe(false);
    expect(AI_AU_CONCRETE_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(LLM_AU_CONCRETE_NUMERICAL_AUTHORITY).toBe(false);
    expect(AI_STRESS_BLOCK_AUTHORITY).toBe(false);
    expect(AI_STRENGTH_FACTOR_AUTHORITY).toBe(false);
    expect(AI_AS3600_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(AUTOMATIC_AU_CONCRETE_APPROVAL).toBe(false);
    assertAuFlexureAiBoundary();
    expect(D1E_AU1_D0_RISK_DISPOSITION.CLOSED).toBe("NONE");
    expect(D1E_VALIDATION_DEBT_REGISTER.some((row) => row.debtId === "D1E-AU-VD-CODE-FLEXURE")).toBe(true);
    expect(CONCRETE_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1E.AU.FLEXURE.UNIAXIAL")).toBe(true);
    expect(PARALLEL_CAPABILITY_MANIFEST_CREATED).toBe(false);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.length).toBeGreaterThan(D1D_CAPABILITY_MANIFEST.length);
    expect(CONCRETE_ADAPTER_BOUNDARIES.AU_CONCRETE.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.AU_STEEL.implemented).toBe(true);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(isEuOnlyArchitecture()).toBe(false);
    expect(EU_HIGH_WATER_MARK_INHERITED).toBe(true);
    expect(D1E_AU1_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK).toBe(true);
    expect(STANDARD_TEXT_REQUIRED_BY_RUNTIME).toBe(false);
    expect(COPYRIGHTED_AS3600_TEXT_COMMITTED).toBe(false);
    const corpus = `${readTree(join(here, "au-flexure"))}\n${readFileSync(join(here, "../../../../docs/architecture/engineering-os/EOS_D1E_AU1_RC_FLEXURE.md"), "utf8")}`;
    for (const pattern of [/is AS 3600 compliant/i, /φ\s*=\s*0\.8/, /alpha\s*=\s*0\.85/, /CONCRETE_PACK_CERTIFIED\s*=\s*true/i]) {
      expect(corpus).not.toMatch(pattern);
    }
    expect(corpus).not.toMatch(/AS3600_STRESS_BLOCK_IN_COMMON_KERNEL\s*=\s*true/);
  });
});
