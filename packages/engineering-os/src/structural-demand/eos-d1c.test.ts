import { describe, expect, it } from "vitest";
import {
  AI_DEMAND_ASSISTANCE_ADVISORY_ONLY,
  AU_ONLY_DEMAND_ENGINE,
  D1C_CAPACITY_ENGINE_PRESENT,
  D1C_DESIGN_PASS_FAIL_PRESENT,
  EU_ONLY_DEMAND_ENGINE,
  GENERIC_ENGINE_HARDCODES_CODE_FACTORS,
  GENERAL_FEA_IMPLEMENTED,
  GEOTECHNICAL_CAPACITY_CALCULATION_PRESENT,
  HUMAN_REVIEW_REQUIRED_FOR_GOVERNED_DEMAND,
  LLM_DEMAND_RESULT_AUTHORITY,
  STRUCTURAL_ACTION_CATEGORIES,
  STRUCTURAL_SIGN_CONVENTION,
  TORSION_DEMAND_SCOPE,
  type StructuralLoadApplication,
  type StructuralStandardContext,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext, exampleEurocodeAnnex } from "../structural-domain/binding";
import { computeSimplySupportedUdlDemand } from "../work-generator/structural/compose";
import { STRUCTURAL_FIXTURE_EXPECTED_DEMAND } from "../work-generator/structural/fixture";
import {
  assertDemandMethodsNotCertifiedByUnitTests,
  boundFactorsFromCombination,
  D1C_D0_RISK_DISPOSITION,
  D1C_RISK_ALLOCATION,
  LOAD_FACTOR_PACK_INTERFACES,
  nearlyEqual,
  provideLoadFactors,
  runDeterministicDemand,
  STRUCTURAL_DEMAND_METHOD_REGISTRY,
  toDemandHandoff,
} from "./index";

const EI = { E: { value: 200, unit: "GPa" as const }, I: { value: 1e-4, unit: "m4" as const } };

function udl(id: string, w: number, unit = "kN/m", L = 8): StructuralLoadApplication {
  return {
    applicationId: id,
    loadCaseId: id,
    actionCategory: "DEAD",
    kind: "UNIFORM_DISTRIBUTED_LOAD",
    coordinateSystem: "LOCAL_MEMBER",
    memberLocalResolved: true,
    targetMemberId: "m1",
    targetNodeId: null,
    positionM: null,
    startM: 0,
    endM: L,
    magnitude: { value: w, unit },
    endMagnitude: null,
    direction: "TRANSVERSE",
    evidenceRef: { evidenceId: `ev-${id}`, sourceKind: "human_input", reference: "engineer" },
    externalSource: null,
  };
}

function point(id: string, P: number, a: number, L = 8): StructuralLoadApplication {
  return {
    ...udl(id, 0, "kN/m", L),
    kind: "POINT_FORCE",
    actionCategory: "LIVE",
    positionM: a,
    startM: null,
    endM: null,
    magnitude: { value: P, unit: "kN" },
  };
}

function moment(id: string, M: number, a: number, L = 8): StructuralLoadApplication {
  return {
    ...udl(id, 0, "kN/m", L),
    kind: "POINT_MOMENT",
    actionCategory: "OTHER",
    positionM: a,
    startM: null,
    endM: null,
    magnitude: { value: M, unit: "kN.m" },
  };
}

function run(apps: StructuralLoadApplication[], extra: Partial<Parameters<typeof runDeterministicDemand>[0]> = {}) {
  return runDeterministicDemand({
    resultId: "d1",
    memberId: "m1",
    spanM: extra.spanM ?? 8,
    spanUnit: "m",
    boundaryCondition: extra.boundaryCondition ?? "SIMPLE_SIMPLE",
    applications: apps,
    factors: extra.factors ?? apps.map((app) => ({ loadCaseId: app.loadCaseId, factor: 1, provenanceRef: "human", source: "HUMAN_ENTERED" })),
    combinationId: extra.combinationId ?? "comb-1",
    standardContext: extra.standardContext ?? "JURISDICTION_NEUTRAL_STATICS",
    stiffness: extra.stiffness,
    evidenceRefs: apps.flatMap((app) => app.evidenceRef ? [app.evidenceRef] : []),
    ...extra,
  });
}

describe("EOS-D1C structural demand engine", () => {
  it("keeps legacy simply-supported UDL results and independent handbook benchmarks", () => {
    const legacy = computeSimplySupportedUdlDemand({
      udlKNpm: STRUCTURAL_FIXTURE_EXPECTED_DEMAND.udlKNpm,
      spanM: STRUCTURAL_FIXTURE_EXPECTED_DEMAND.spanM,
    });
    expect(legacy.shearKN).toBeCloseTo(78);
    expect(legacy.momentKNm).toBeCloseTo(156);
    const ssUdl = run([udl("g", 10)], { stiffness: EI });
    expect(ssUdl.reactions.startFyN / 1000).toBeCloseTo(40);
    expect(ssUdl.reactions.endFyN / 1000).toBeCloseTo(40);
    expect(ssUdl.moment.value / 1000).toBeCloseTo(80);
    expect(ssUdl.moment.locationM).toBeCloseTo(4);
    const expectedDefl = 5 * 10000 * 8 ** 4 / (384 * 200e9 * 1e-4);
    expect("signed" in ssUdl.deflection && nearlyEqual(ssUdl.deflection.signed, expectedDefl, 1e-8)).toBe(true);
    const ssPoint = run([point("q", 40, 4)], { stiffness: EI });
    expect(ssPoint.reactions.startFyN / 1000).toBeCloseTo(20);
    expect(ssPoint.moment.value / 1000).toBeCloseTo(80);
    expect("signed" in ssPoint.deflection && nearlyEqual(ssPoint.deflection.signed, 40000 * 8 ** 3 / (48 * 200e9 * 1e-4), 1e-8)).toBe(true);
    const ssM = run([moment("m", 24, 4)]);
    expect(ssM.reactions.startFyN / 1000).toBeCloseTo(-3);
    expect(ssM.reactions.endFyN / 1000).toBeCloseTo(3);
    expect(ssM.moment.value / 1000).toBeCloseTo(12);
    const cantUdl = run([udl("c", 5)], { boundaryCondition: "FIXED_FREE", stiffness: EI });
    expect(cantUdl.reactions.startFyN / 1000).toBeCloseTo(40);
    expect(cantUdl.moment.value / 1000).toBeCloseTo(160);
    expect(cantUdl.moment.signed / 1000).toBeCloseTo(-160);
    const expectedCant = 5000 * 8 ** 4 / (8 * 200e9 * 1e-4);
    expect("signed" in cantUdl.deflection && nearlyEqual(cantUdl.deflection.signed, expectedCant, 1e-8)).toBe(true);
    const cantP = run([point("p", 20, 8)], { boundaryCondition: "FIXED_FREE", stiffness: EI });
    expect(cantP.reactions.startFyN / 1000).toBeCloseTo(20);
    expect(cantP.moment.value / 1000).toBeCloseTo(160);
    expect("signed" in cantP.deflection && nearlyEqual(cantP.deflection.signed, 20000 * 8 ** 3 / (3 * 200e9 * 1e-4), 1e-8)).toBe(true);
  });

  it("superposes loads, applies bound combination factors, and preserves reaction/moment equilibrium", () => {
    const combo = run([udl("g", 10), point("q", 40, 4)], {
      factors: [
        { loadCaseId: "g", factor: 1.2, provenanceRef: "human", source: "HUMAN_ENTERED" },
        { loadCaseId: "q", factor: 1.5, provenanceRef: "human", source: "HUMAN_ENTERED" },
      ],
    });
    expect(combo.reactions.startFyN / 1000).toBeCloseTo(1.2 * 40 + 1.5 * 20);
    expect(combo.methods).toContain("LINEAR_SUPERPOSITION");
    expect(Math.abs(combo.equilibriumResidual.forceN)).toBeLessThan(1e-4);
    expect(Math.abs(combo.equilibriumResidual.momentNm)).toBeLessThan(1e-4);
    const bound = boundFactorsFromCombination({
      combinationId: "c1",
      components: [{ loadCaseId: "g", factor: 1.2 }, { loadCaseId: "q", factor: 1.5 }],
    });
    expect(bound[0]?.source).toBe("HUMAN_ENTERED");
    expect(GENERIC_ENGINE_HARDCODES_CODE_FACTORS).toBe(false);
    expect(provideLoadFactors({ packId: "AU", standardCode: "AS/NZS 1170", edition: null, nationalAnnexRef: null, combinationCategory: "uls" }).implemented).toBe(false);
    expect(LOAD_FACTOR_PACK_INTERFACES.EU.ready).toBe(true);
  });

  it("validates units, coordinates, supports, and fails closed for unsupported cases", () => {
    expect(() => run([{ ...udl("g", 10), magnitude: { value: 10, unit: "" } }])).toThrow(/units/);
    expect(() => run([{ ...udl("g", 10), coordinateSystem: "GLOBAL", memberLocalResolved: false }])).toThrow(/silently transformed/);
    expect(() => run([udl("g", 10)], { boundaryCondition: "FIXED_FIXED" as never })).toThrow(/UNSUPPORTED_CASE/);
    expect(() => run([{ ...udl("g", 10), kind: "SURFACE_PRESSURE" as never }])).toThrow(/UNSUPPORTED_CASE/);
    const missingEI = run([udl("g", 10)]);
    expect("status" in missingEI.deflection && missingEI.deflection.status === "NOT_IMPLEMENTED").toBe(true);
    expect(() => run([udl("g", 10)], { stiffness: { E: { value: 200, unit: "GPa" }, I: { value: 1, unit: "mm4" as never } } })).toThrow(/unit/);
    expect(STRUCTURAL_SIGN_CONVENTION.momentPositive).toMatch(/sagging/);
    expect(STRUCTURAL_ACTION_CATEGORIES).toEqual(expect.arrayContaining(["DEAD", "LIVE", "PIPING", "WIND", "SEISMIC", "ACCIDENTAL"]));
  });

  it("requires D1B binding for governed calculations and keeps jurisdiction-neutral statics explicit", () => {
    expect(() => run([udl("g", 10)], { standardContext: { ...createConfiguredKnowledgeContext({ contextId: "x", jurisdictionProfileRef: "australia", standardFamily: "AS", standardCode: "", edition: "2020", materialScope: "steel" }) } })).toThrow(/standard code/);
    const eu: StructuralStandardContext = {
      ...createConfiguredKnowledgeContext({
        contextId: "ctx-en1991",
        jurisdictionProfileRef: "eu-eea",
        standardFamily: "EN",
        standardCode: "EN 1991-1-1",
        edition: "2002",
        materialScope: "actions",
      }),
      nationalAnnexRef: exampleEurocodeAnnex("EN 1991-1-1", "2002"),
    };
    const withAnnex = run([udl("g", 10)], { standardContext: eu });
    expect(withAnnex.standardContext.nationalAnnexRef?.standardCode).toBe("EN 1991-1-1");
    expect(withAnnex.provenanceRef.jurisdiction).toBe("eu-eea");
    expect(withAnnex.provenanceRef.standard).toBe("EN 1991-1-1");
    const neutral = run([udl("g", 10)]);
    expect(neutral.standardContext.standardCode).toBe("SYNTHETIC_STATICS");
  });

  it("keeps demand/capacity separation, AI off the result, and D1D/D1E handoff ready", () => {
    const result = run([udl("g", 10), { ...point("n", 50, 0), direction: "AXIAL" }]);
    expect(result.capacityPresent).toBe(false);
    expect(result.designPassFailPresent).toBe(false);
    expect(result.llmOriginated).toBe(false);
    expect(result.humanReviewRequired).toBe(true);
    expect(result.torsion.status).toBe("NOT_IMPLEMENTED");
    expect(result.axial).toEqual({ valueN: 50000, unit: "N", method: "AXIAL_DIRECT" });
    expect(result.foundationReactionHandoff.geotechnicalCapacityCalculated).toBe(false);
    const handoff = toDemandHandoff(result);
    expect(handoff.futureCapacityResultRef).toBeNull();
    expect(handoff.analysisResult.solverSuccessImpliesApproval).toBe(false);
    expect(D1C_CAPACITY_ENGINE_PRESENT).toBe(false);
    expect(D1C_DESIGN_PASS_FAIL_PRESENT).toBe(false);
    expect(LLM_DEMAND_RESULT_AUTHORITY).toBe(false);
    expect(AI_DEMAND_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(HUMAN_REVIEW_REQUIRED_FOR_GOVERNED_DEMAND).toBe(true);
    expect(GENERAL_FEA_IMPLEMENTED).toBe(false);
    expect(GEOTECHNICAL_CAPACITY_CALCULATION_PRESENT).toBe(false);
    expect(TORSION_DEMAND_SCOPE).toBe("NOT_IMPLEMENTED");
    expect(EU_ONLY_DEMAND_ENGINE).toBe(false);
    expect(AU_ONLY_DEMAND_ENGINE).toBe(false);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(() => assertDemandMethodsNotCertifiedByUnitTests()).not.toThrow();
    expect(STRUCTURAL_DEMAND_METHOD_REGISTRY.every((row) => row.maturity === "IMPLEMENTED")).toBe(true);
    expect(result.inputEvidenceRefs[0]?.evidenceId).toBeTruthy();
    const sourced: StructuralLoadApplication = {
      ...udl("pipe", 3),
      actionCategory: "PIPING",
      externalSource: { sourceDiscipline: "piping", sourceObjectId: "sup-1", revision: "A", evidenceId: "ev-pipe", status: "GOVERNED" },
    };
    expect(run([sourced]).loadCaseIds).toContain("pipe");
    expect(D1C_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(D1C_RISK_ALLOCATION.D1D).toMatch(/demand/);
  });
});
