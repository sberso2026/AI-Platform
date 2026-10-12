import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  EU_C7_R1_PROFILE_VERSION,
  EU_C7_R1_REFERENCE_PROFILE_GENERATION,
  EU_C7_R1_REFERENCE_PROFILE_ID,
  EU_C7_R2_CRACK_WIDTH_METHOD_ID,
  NEW_C7_CRACK_WIDTH_RUNTIME_METHOD_IMPLEMENTED,
  type ConcreteMaterial,
  type ReinforcementMaterial,
} from "@rtb/types";
import {
  EU_C7_R1_PARAMETERS,
  assertEuC7CrackOptimizerRejectsUndetermined,
  assertEuC7CrackParetoRejectsUndetermined,
  assertEuC7CrackResultCurrent,
  evaluateEuC7CrackWidth,
  selectEuC7CrackLimit,
  selectEuC7SigmaS,
  type EuC7CrackWidthInput,
} from "./eu-c7";
import { circularSection, rectangleSection } from "./section-mechanics";

function property(name: string, value: number, unit: string) {
  return { name, value, unit, provenanceRef: "c7", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
}

const governedProvenance = {
  sourceEvidence: "c7", sourceRevision: "0", model: null, tool: null, solver: null, version: "c7",
  promptOrTemplate: null, timestamp: "2026-10-12T00:00:00.000Z", jurisdiction: "EU", standard: "EN 1992",
  calculationMethod: EU_C7_R2_CRACK_WIDTH_METHOD_ID, confidence: null, validationState: "NUMERICALLY_VALIDATED",
  humanReviewer: null, approvalState: "PENDING_HUMAN_ENGINEERING_REVIEW",
};

function concrete(ec = 33000): ConcreteMaterial {
  return {
    materialRef: "c7-conc", designation: "C30", compressiveStrength: property("fc", 30, "MPa"), tensileStrength: null,
    elasticModulus: property("Ec", ec, "MPa"), density: null, poissonRatio: null, age: null, strengthReferenceAge: null,
    materialClass: null, materialStandardRef: "project", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    testCertificateRef: "tc", environmentalMetadata: null, version: "c7", provenance: governedProvenance,
  };
}
function reo(es = 200000): ReinforcementMaterial {
  return {
    materialRef: "c7-reo", designation: "B500", yieldStrength: property("fy", 500, "MPa"), ultimateStrength: null,
    elasticModulus: property("Es", es, "MPa"), ductilityClass: null, productStandardRef: "project",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE", version: "c7", provenance: governedProvenance,
  };
}

function profileValue(id: string): number {
  const row = EU_C7_R1_PARAMETERS.find((parameter) => parameter.parameterId === id);
  if (!row || row.value === null) throw new Error(id);
  return row.value;
}

function independent(input: {
  b: number; h: number; n: number; m: number; fct: number; ecm: number; es: number; sigma: number;
  cover: number; phi: number; as: number; d: number; x: number; thickness: number | null;
  surface: "HIGH_BOND" | "PLAIN"; strain: "BENDING" | "PURE_TENSION" | "INTERMEDIATE"; k2: number | null;
  duration: "SHORT_TERM" | "LONG_TERM";
}) {
  const area = input.b * input.h;
  const inertia = (input.b * input.h ** 3) / 12;
  const cy = input.h / 2;
  const axial = input.n / area;
  const tension = Math.max(0, axial - (input.m * (input.h - cy)) / inertia, axial - (input.m * (0 - cy)) / inertia);
  const cracked = tension > input.fct;
  const coverFactor = profileValue("effectiveHeightCoverFactor");
  const axisDivisor = profileValue("effectiveHeightAxisDivisor");
  const height = input.strain === "PURE_TENSION"
    ? Math.min(coverFactor * (input.cover + input.phi / 2), (input.thickness ?? 0) / 2)
    : Math.min(coverFactor * (input.h - input.d), (input.h - input.x) / axisDivisor, input.h / 2);
  const acEff = input.b * height;
  const rho = input.as / acEff;
  const alpha = input.es / input.ecm;
  const kt = input.duration === "SHORT_TERM" ? profileValue("ktShort") : profileValue("ktLong");
  const k1 = input.surface === "HIGH_BOND" ? profileValue("k1HighBond") : profileValue("k1Plain");
  const k2 = input.strain === "BENDING" ? profileValue("k2Bending") : input.strain === "PURE_TENSION" ? profileValue("k2Tension") : input.k2 ?? Number.NaN;
  const stiffened = (input.sigma - kt * (input.fct / rho) * (1 + alpha * rho)) / input.es;
  const floor = (profileValue("strainFloorFactor") * input.sigma) / input.es;
  const mean = Math.max(stiffened, floor);
  const spacing = profileValue("coverCoefficient") * input.cover + (k1 * k2 * profileValue("barCoefficient") * input.phi) / rho;
  return { tension, cracked, height, acEff, rho, alpha, kt, mean, spacing, width: spacing * mean };
}

function crackInput(overrides: Partial<EuC7CrackWidthInput> = {}): EuC7CrackWidthInput {
  const width = 300;
  const depth = 500;
  return {
    profileId: EU_C7_R1_REFERENCE_PROFILE_ID,
    generation: EU_C7_R1_REFERENCE_PROFILE_GENERATION,
    profileVersion: EU_C7_R1_PROFILE_VERSION,
    nationalAnnexClaim: false,
    stale: false,
    sourceConflictUnresolved: false,
    memberType: "BEAM",
    prestressed: false,
    geometry: rectangleSection("beam", width, depth, "beam"),
    combinationId: "sls-qp-1",
    combinationCategory: "quasi_permanent",
    combinationLimitState: "SLS",
    nServiceN: 0,
    mServiceNmm: 80e6,
    concrete: concrete(),
    reinforcement: reo(),
    reinforcementArea: property("As", 1600, "mm2"),
    fctEffMPa: 2.9,
    fctEffProvenanceRef: "project-fct-eff",
    sigmaSMpa: 240,
    sigmaSLimitState: "SLS",
    sigmaSProvenanceRef: "governed-sls-cracked-stress",
    coverMm: 30,
    phiMm: 20,
    asMm2: 1600,
    widthMm: width,
    hMm: depth,
    dMm: 450,
    xMm: 180,
    thicknessMm: null,
    surface: "HIGH_BOND",
    strainCase: "BENDING",
    k2Intermediate: null,
    duration: "LONG_TERM",
    wMaxMm: 0.3,
    wMaxRequirementId: "project-wmax",
    ...overrides,
  };
}

describe("EOS-D1E-EU-C7-R2 crack width", () => {
  it("matches an independent closed form and keeps the R1 runtime flag absent", () => {
    const input = crackInput();
    const actual = evaluateEuC7CrackWidth(input);
    const expected = independent({
      b: 300, h: 500, n: 0, m: 80e6, fct: 2.9, ecm: 33000, es: 200000, sigma: 240,
      cover: 30, phi: 20, as: 1600, d: 450, x: 180, thickness: null,
      surface: "HIGH_BOND", strain: "BENDING", k2: null, duration: "LONG_TERM",
    });
    expect(NEW_C7_CRACK_WIDTH_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(actual.sectionCrackState).toBe("CRACKED");
    expect(actual.extremeElasticTensionMPa).toBeCloseTo(expected.tension, 6);
    expect(actual.effectiveTensionHeightMm).toBeCloseTo(expected.height, 8);
    expect(actual.effectiveTensionAreaMm2).toBeCloseTo(expected.acEff, 6);
    expect(actual.effectiveReinforcementRatio).toBeCloseTo(expected.rho, 8);
    expect(actual.modularRatio).toBeCloseTo(expected.alpha, 8);
    expect(actual.tensionStiffeningFactor).toBeCloseTo(expected.kt, 8);
    expect(actual.meanStrainDifference).toBeCloseTo(expected.mean, 10);
    expect(actual.maximumCrackSpacingMm).toBeCloseTo(expected.spacing, 6);
    expect(actual.crackWidthMm).toBeCloseTo(expected.width, 8);
    expect(actual.checkState).toBe(expected.width <= 0.3 ? "SATISFIED" : "NOT_SATISFIED");
    expect(actual.utilization).toBeCloseTo(expected.width / 0.3, 8);
    expect(actual.serviceCombinationType).toBe("QUASI_PERMANENT");
    expect(actual.sigmaSRoute).toBe("EXPLICIT_GOVERNED_INPUT");
    expect(actual.coverSemantics).toBe("COVER_TO_BAR_SURFACE");
  });

  it("covers the bounded crack-width matrix", () => {
    const second = evaluateEuC7CrackWidth(crackInput({ hMm: 600, dMm: 540, xMm: 200, mServiceNmm: 90e6, geometry: rectangleSection("beam-2", 300, 600, "beam-2") }));
    const slab = evaluateEuC7CrackWidth(crackInput({
      memberType: "SOLID_SLAB", widthMm: 1000, hMm: 200, dMm: 170, xMm: 50, asMm2: 900,
      mServiceNmm: 40e6, geometry: rectangleSection("slab", 1000, 200, "slab"),
    }));
    const uncracked = evaluateEuC7CrackWidth(crackInput({ mServiceNmm: 1e6, fctEffMPa: 3 }));
    const moreSteel = evaluateEuC7CrackWidth(crackInput({ asMm2: 3200 }));
    const lessSteel = evaluateEuC7CrackWidth(crackInput({ asMm2: 800 }));
    const largerCover = evaluateEuC7CrackWidth(crackInput({ coverMm: 45 }));
    const smallerCover = evaluateEuC7CrackWidth(crackInput({ coverMm: 20 }));
    const otherBar = evaluateEuC7CrackWidth(crackInput({ phiMm: 12 }));
    const plain = evaluateEuC7CrackWidth(crackInput({ surface: "PLAIN" }));
    const tension = evaluateEuC7CrackWidth(crackInput({
      strainCase: "PURE_TENSION", nServiceN: 900e3, mServiceNmm: 0, thicknessMm: 500, hMm: 500,
    }));
    const short = evaluateEuC7CrackWidth(crackInput({ duration: "SHORT_TERM" }));
    const long = evaluateEuC7CrackWidth(crackInput({ duration: "LONG_TERM" }));
    const below = evaluateEuC7CrackWidth(crackInput({ wMaxMm: 5 }));
    const above = evaluateEuC7CrackWidth(crackInput({ wMaxMm: 0.01 }));
    const base = evaluateEuC7CrackWidth(crackInput());
    const boundary = evaluateEuC7CrackWidth(crackInput({ wMaxMm: base.crackWidthMm }));
    expect(second.sectionCrackState).toBe("CRACKED");
    expect(slab.sectionCrackState).toBe("CRACKED");
    expect(uncracked.sectionCrackState).toBe("UNCRACKED");
    expect(uncracked.crackWidthMm).toBe(0);
    expect(uncracked.maximumCrackSpacingMm).toBeNull();
    expect(uncracked.checkState).toBe("SATISFIED");
    expect(moreSteel.crackWidthMm!).toBeLessThan(lessSteel.crackWidthMm!);
    expect(largerCover.maximumCrackSpacingMm!).toBeGreaterThan(smallerCover.maximumCrackSpacingMm!);
    expect(otherBar.maximumCrackSpacingMm).not.toBeCloseTo(base.maximumCrackSpacingMm ?? 0, 4);
    expect(plain.maximumCrackSpacingMm!).toBeGreaterThan(base.maximumCrackSpacingMm!);
    expect(tension.sectionCrackState).toBe("CRACKED");
    expect(tension.strainDistributionClass).toBe("PURE_TENSION");
    expect(short.tensionStiffeningFactor).toBeGreaterThan(long.tensionStiffeningFactor ?? 0);
    expect(short.meanStrainDifference!).toBeLessThan(long.meanStrainDifference!);
    expect(below.checkState).toBe("SATISFIED");
    expect(above.checkState).toBe("NOT_SATISFIED");
    expect(boundary.checkState).toBe("SATISFIED");
    expect(boundary.utilization).toBeCloseTo(1, 8);
    const widthM = (base.maximumCrackSpacingMm! / 1000) * base.meanStrainDifference!;
    expect(base.crackWidthMm).toBeCloseTo(widthM * 1000, 8);
  });

  it("fails closed and invalidates changed dependencies", () => {
    const cases: Array<[string, Partial<EuC7CrackWidthInput>]> = [
      ["MISSING_SERVICE_COMBINATION", { combinationId: null }],
      ["ULS_COMBINATION_REJECTED", { combinationCategory: "uls", combinationLimitState: "ULS" }],
      ["UNSUPPORTED_COMBINATION", { combinationCategory: "frequent" }],
      ["MISSING_TENSILE_STRENGTH", { fctEffMPa: null }],
      ["INVALID_NUMBER", { fctEffMPa: Number.NaN }],
      ["MISSING_CONCRETE_MODULUS", { concrete: { ...concrete(), elasticModulus: null } }],
      ["MISSING_REINFORCEMENT_MODULUS", { reinforcement: { ...reo(), elasticModulus: null } }],
      ["MISSING_STEEL_STRESS", { sigmaSMpa: null }],
      ["INVALID_NUMBER", { sigmaSMpa: Number.POSITIVE_INFINITY }],
      ["ULS_STEEL_STRESS", { sigmaSLimitState: "ULS" }],
      ["UNSUPPORTED_GEOMETRY", { geometry: circularSection("circ", 400, "circ") }],
      ["MISSING_COVER", { coverMm: null }],
      ["MISSING_COVER", { coverMm: 0 }],
      ["MISSING_BAR_DIAMETER", { phiMm: -1 }],
      ["MISSING_REINFORCEMENT", { asMm2: null }],
      ["MISSING_SURFACE_CLASS", { surface: null }],
      ["MISSING_STRAIN_CASE", { strainCase: null }],
      ["INTERMEDIATE_K2_MISSING", { strainCase: "INTERMEDIATE", k2Intermediate: null }],
      ["MISSING_DURATION", { duration: null }],
      ["MISSING_CRACK_LIMIT", { wMaxMm: null }],
      ["MISSING_CRACK_LIMIT", { wMaxRequirementId: null }],
      ["PROFILE_MISMATCH", { profileId: "OTHER" }],
      ["GENERATION_MISMATCH", { generation: "EN1992-1-1-GEN2" }],
      ["STALE_PROFILE", { stale: true }],
      ["INVALID_SECTION", { dMm: 500, hMm: 500 }],
      ["PRESTRESS_OUT_OF_SCOPE", { prestressed: true }],
    ];
    for (const [code, overrides] of cases) {
      expect(evaluateEuC7CrackWidth(crackInput(overrides)).failReason, code).toBe(code);
    }
    const first = evaluateEuC7CrackWidth(crackInput());
    const again = evaluateEuC7CrackWidth(crackInput());
    expect(again.resultFingerprint).toBe(first.resultFingerprint);
    expect(again.crackWidthMm).toBe(first.crackWidthMm);
    assertEuC7CrackResultCurrent(first, crackInput());
    expect(() => assertEuC7CrackResultCurrent(first, crackInput({ coverMm: 40 }))).toThrow(/stale/);
    expect(() => assertEuC7CrackOptimizerRejectsUndetermined("UNDETERMINED")).toThrow(/undetermined/);
    expect(() => assertEuC7CrackParetoRejectsUndetermined("UNDETERMINED")).toThrow(/undetermined/);
    expect(() => selectEuC7CrackLimit()).toThrow(/crack width limit/);
    expect(() => selectEuC7SigmaS()).toThrow(/reinforcement stress/);
    const tensileOnly = concrete();
    tensileOnly.tensileStrength = property("fctm", 2.9, "MPa");
    expect(evaluateEuC7CrackWidth(crackInput({ concrete: tensileOnly, fctEffMPa: null })).failReason).toBe("MISSING_TENSILE_STRENGTH");
  });

  it("does not embed profile coefficients in the runtime file", () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "eu-c7/evaluate.ts"), "utf8");
    expect(source).not.toMatch(/\b(3\.4|0\.425|0\.8|1\.6|0\.6|0\.4|2\.5)\b/);
  });
});
