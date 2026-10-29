import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE,
  EU_C1C_R1_PARAMETER_VERSION,
  EU_C3_METHOD_IDS,
  EU_C6_R1_CURVATURE_FACTOR_LOWER_BOUND,
  EU_C6_R1_CURVATURE_FACTOR_UPPER_BOUND,
  EU_C6_R1_PROFILE_VERSION,
  EU_C6_R1_REFERENCE_PROFILE_GENERATION,
  EU_C6_R1_REFERENCE_PROFILE_ID,
  EU_C6_R1_RUNTIME_METHOD_COUNT,
  EU_C6_R2_AXIAL_SIGN_CONVERSION_COUNT,
  EU_C6_R2_IMPLEMENTED_METHOD_COUNT,
  EU_C6_R2_METHOD_ID,
  EU_C6_R2_NUMERICALLY_VALIDATED_METHOD_COUNT,
  EU_CONCRETE_PACK_CERTIFIED,
  NEW_C6_SECOND_ORDER_METHOD_IMPLEMENTED,
  type ConcreteMaterial,
  type EuC1cR1DeclaredNdpValue,
  type ReinforcementLayout,
  type ReinforcementMaterial,
} from "@rtb/types";
import { CONCRETE_CAPABILITY_MANIFEST } from "./capability";
import {
  EU_C6_R1_PARAMETERS,
  EU_C6_R2_METHOD_REGISTRY,
  EU_C6_R2_C_PARAMETER_AUTHORITY,
  assertEuC6OptimizerRejectsUndetermined,
  assertEuC6ParetoRejectsUndetermined,
  assertEuC6ResultCurrent,
  evaluateEuC6NominalCurvature,
  selectEuC6EffectiveLength,
  type EuC6NominalCurvatureInput,
} from "./eu-c6";
import { evaluateEuC1ConcreteDesignProperties, evaluateEuC1ReinforcementDesignProperties } from "./eu-c1c-r1/evaluate";
import { computeGrossSectionProperties, rectangleSection, circularSection } from "./section-mechanics";

function property(name: string, value: number, unit: string) {
  return { name, value, unit, provenanceRef: "c6", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
}
function ndp(value: number): EuC1cR1DeclaredNdpValue {
  return { value, unit: "dimensionless", sourceAuthority: EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE, provenanceRef: "test-only-non-conformance", ndpIdentity: "DECLARED_PROJECT_OVERRIDE", version: EU_C1C_R1_PARAMETER_VERSION };
}
function context(overrides: { gammaC?: EuC1cR1DeclaredNdpValue | null } = {}) {
  return {
    nationalAnnexRef: "DECLARED_TEST_NA",
    gamma_c: overrides.gammaC === undefined ? ndp(1.5) : overrides.gammaC,
    gamma_s: ndp(1.15),
    alpha_cc: ndp(1),
    testOnlyNonConformance: true,
  };
}
function concrete(fc = 30): ConcreteMaterial {
  return {
    materialRef: "c6-conc", designation: "C30", compressiveStrength: property("fc", fc, "MPa"), tensileStrength: null,
    elasticModulus: property("Ec", 33000, "MPa"), density: null, poissonRatio: null, age: null, strengthReferenceAge: null,
    materialClass: null, materialStandardRef: "project", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    testCertificateRef: "tc", environmentalMetadata: null, version: "c6", provenance: property("p", 0, "1") as never,
  };
}
function reo(fy = 500): ReinforcementMaterial {
  return {
    materialRef: "c6-reo", designation: "B500", yieldStrength: property("fy", fy, "MPa"), ultimateStrength: null,
    elasticModulus: property("Es", 200000, "MPa"), ductilityClass: null, productStandardRef: "project",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE", version: "c6", provenance: property("p", 0, "1") as never,
  };
}

const governedProvenance = {
  sourceEvidence: "c6", sourceRevision: "0", model: null, tool: null, solver: null, version: "c6",
  promptOrTemplate: null, timestamp: "2026-10-12T00:00:00.000Z", jurisdiction: "EU", standard: "EN 1992",
  calculationMethod: EU_C6_R2_METHOD_ID, confidence: null, validationState: "NUMERICALLY_VALIDATED",
  humanReviewer: null, approvalState: "PENDING_HUMAN_ENGINEERING_REVIEW",
};

function concreteMaterial(): ConcreteMaterial {
  return { ...concrete(), provenance: governedProvenance };
}
function reinforcementMaterial(): ReinforcementMaterial {
  return { ...reo(), provenance: governedProvenance };
}

function profileValue(id: string): number {
  const row = EU_C6_R1_PARAMETERS.find((parameter) => parameter.parameterId === id);
  if (!row || row.value === null) throw new Error(id);
  return row.value;
}

function input(overrides: Partial<EuC6NominalCurvatureInput> = {}): EuC6NominalCurvatureInput {
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

function independent(sample: EuC6NominalCurvatureInput) {
  const concreteDesign = evaluateEuC1ConcreteDesignProperties({ concrete: sample.concrete, context: sample.context });
  const reinforcementDesign = evaluateEuC1ReinforcementDesignProperties({
    reinforcement: sample.reinforcement,
    area: { name: "As", value: sample.asMm2, unit: "mm2", provenanceRef: "c6", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    context: sample.context,
  });
  if (!concreteDesign.ok || !reinforcementDesign.ok || sample.l0Mm === null || sample.c === null || sample.phiEf === null || sample.esMPa === null || sample.dMm === null || sample.asMm2 === null || sample.m01Nmm === null || sample.m02Nmm === null || sample.nEdCompressionN === null) {
    throw new Error("independent case is incomplete");
  }
  const properties = computeGrossSectionProperties(sample.geometry);
  const inertia = sample.axis === "MAJOR_AXIS" ? properties.IxMm4 : properties.IyMm4;
  const area = properties.grossConcreteAreaMm2;
  const radius = Math.sqrt(inertia / area);
  const slenderness = sample.l0Mm / radius;
  const fcd = concreteDesign.outputs.fcdMPa;
  const fyd = reinforcementDesign.outputs.fydMPa;
  const fck = concreteDesign.outputs.fckMPa;
  const n = sample.nEdCompressionN / (area * fcd);
  const omega = (sample.asMm2 * fyd) / (area * fcd);
  const nu = 1 + omega;
  const nBal = profileValue("nBal");
  const kr = Math.min((nu - n) / (nu - nBal), 1);
  const beta = profileValue("betaConstant") + fck / profileValue("betaFckDivisor") - slenderness / profileValue("betaLambdaDivisor");
  const kphi = Math.max(1, 1 + beta * sample.phiEf);
  const curvature = (kr * kphi * fyd) / (sample.esMPa * profileValue("curvatureBaseFactor") * sample.dMm);
  const high = profileValue("momentWeightHigh");
  const low = profileValue("momentWeightLow");
  const weighted = high * sample.m02Nmm + low * sample.m01Nmm;
  const floor = low * sample.m02Nmm;
  const m0e = sample.m02Nmm >= 0 ? Math.max(weighted, floor) : Math.min(weighted, floor);
  const e2Mm = (curvature * sample.l0Mm * sample.l0Mm) / sample.c;
  const e2FromMetres = ((curvature * 1000) * (sample.l0Mm / 1000) ** 2) / sample.c;
  const m2 = sample.nEdCompressionN * e2Mm;
  const total = m0e + Math.sign(m0e) * m2;
  return { radius, slenderness, omega, kr, kphi, curvature, m0e, e2Mm, e2FromMetres, m2, total, c3Axial: -sample.nEdCompressionN };
}

describe("EOS-D1E-EU-C6-R2 nominal curvature", () => {
  it("keeps the R1 profile identity and reads c bounds from that profile", () => {
    expect(EU_C6_R1_RUNTIME_METHOD_COUNT).toBe(0);
    expect(NEW_C6_SECOND_ORDER_METHOD_IMPLEMENTED).toBe(false);
    expect(EU_C6_R2_IMPLEMENTED_METHOD_COUNT).toBe(1);
    expect(EU_C6_R2_NUMERICALLY_VALIDATED_METHOD_COUNT).toBe(1);
    expect(EU_C6_R2_METHOD_REGISTRY[0]?.methodId).toBe(EU_C6_R2_METHOD_ID);
    expect(EU_C6_R1_CURVATURE_FACTOR_LOWER_BOUND).toBe(8);
    expect(EU_C6_R1_CURVATURE_FACTOR_UPPER_BOUND).toBe(10);
    expect(EU_C6_R2_C_PARAMETER_AUTHORITY).toBe("VALIDATED_ENGINEERING_REFERENCE");
    expect(EU_C6_R2_AXIAL_SIGN_CONVERSION_COUNT).toBe(1);
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(CONCRETE_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1E.EU.C6.NOMINAL_CURVATURE")).toBe(true);
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "eu-c6/evaluate.ts"), "utf8");
    expect(source).not.toMatch(/\b0\.6\b|\b0\.45\b|\b0\.35\b|\b0\.4\b|\b200\b|\b150\b/);
    expect(source.match(/compressionToTensionPositive\(/g)?.length).toBe(2);
  });

  it("matches an independent closed-form chain and equivalent metre units", () => {
    const sample = input();
    const expected = independent(sample);
    const actual = evaluateEuC6NominalCurvature(sample);
    expect(actual.calculationState).toBe("COMPLETE");
    expect(actual.checkState).toBe("UNDETERMINED");
    expect(actual.additionalImperfectionNmm).toBe(0);
    expect(actual.radiusOfGyrationMm).toBeCloseTo(expected.radius, 8);
    expect(actual.slenderness).toBeCloseTo(expected.slenderness, 8);
    expect(actual.mechanicalReinforcementRatio).toBeCloseTo(expected.omega, 8);
    expect(actual.curvatureCorrection).toBeCloseTo(expected.kr, 8);
    expect(actual.creepFactor).toBeCloseTo(expected.kphi, 8);
    expect(actual.nominalCurvaturePerMm).toBeCloseTo(expected.curvature, 12);
    expect(actual.equivalentFirstOrderMomentNmm).toBeCloseTo(expected.m0e, 6);
    expect(actual.secondOrderEccentricityMm).toBeCloseTo(expected.e2Mm, 8);
    expect(expected.e2Mm / 1000).toBeCloseTo(expected.e2FromMetres, 8);
    expect(actual.secondOrderMomentNmm).toBeCloseTo(expected.m2, 4);
    expect(actual.totalDesignMomentNmm).toBeCloseTo(expected.total, 4);
    expect(actual.c3AxialInputN).toBe(expected.c3Axial);
    expect(actual.c3MomentInputNm).toBeCloseTo(expected.total / 1000, 6);
    const again = evaluateEuC6NominalCurvature(sample);
    expect(again.fingerprint).toBe(actual.fingerprint);
    expect(again.totalDesignMomentNmm).toBe(actual.totalDesignMomentNmm);
  });

  it("covers creep, length, compression, c bounds, and end-moment signs", () => {
    const lowCreep = evaluateEuC6NominalCurvature(input({ phiEf: 0 }));
    const highCreep = evaluateEuC6NominalCurvature(input({ phiEf: 2.5 }));
    expect(highCreep.creepFactor).toBeGreaterThan(lowCreep.creepFactor ?? 0);
    const shortMember = evaluateEuC6NominalCurvature(input({ l0Mm: 2000 }));
    const longMember = evaluateEuC6NominalCurvature(input({ l0Mm: 6000 }));
    expect(longMember.secondOrderMomentNmm).toBeGreaterThan(shortMember.secondOrderMomentNmm ?? 0);
    const lowAxial = evaluateEuC6NominalCurvature(input({ nEdCompressionN: 100e3 }));
    const highAxial = evaluateEuC6NominalCurvature(input({ nEdCompressionN: 1500e3 }));
    expect(lowAxial.calculationState).toBe("COMPLETE");
    expect(highAxial.calculationState).toBe("COMPLETE");
    expect(highAxial.curvatureCorrection).toBeLessThanOrEqual(lowAxial.curvatureCorrection ?? 1);
    const lowC = evaluateEuC6NominalCurvature(input({ c: EU_C6_R1_CURVATURE_FACTOR_LOWER_BOUND }));
    const highC = evaluateEuC6NominalCurvature(input({ c: EU_C6_R1_CURVATURE_FACTOR_UPPER_BOUND }));
    expect(lowC.secondOrderEccentricityMm).toBeGreaterThan(highC.secondOrderEccentricityMm ?? 0);
    const opposite = evaluateEuC6NominalCurvature(input({ m01Nmm: -10e6, m02Nmm: 20e6 }));
    const zeroEnd = evaluateEuC6NominalCurvature(input({ m01Nmm: 0, m02Nmm: 20e6 }));
    const equal = evaluateEuC6NominalCurvature(input({ m01Nmm: 20e6, m02Nmm: 20e6 }));
    const negative = evaluateEuC6NominalCurvature(input({ m01Nmm: -10e6, m02Nmm: -20e6 }));
    expect(opposite.calculationState).toBe("COMPLETE");
    expect(zeroEnd.calculationState).toBe("COMPLETE");
    expect(equal.equivalentFirstOrderMomentNmm).toBeCloseTo(20e6, 4);
    expect(negative.totalDesignMomentNmm).toBeLessThan(negative.equivalentFirstOrderMomentNmm ?? 0);
    expect(evaluateEuC6NominalCurvature(input({ c: 7 })).failReason).toBe("INVALID_CURVATURE_FACTOR");
    expect(evaluateEuC6NominalCurvature(input({ c: 11 })).failReason).toBe("INVALID_CURVATURE_FACTOR");
  });

  it("fails closed on missing, invalid, and unsupported input", () => {
    expect(evaluateEuC6NominalCurvature(input({ nEdCompressionN: null })).failReason).toBe("MISSING_OR_INVALID_AXIAL");
    expect(evaluateEuC6NominalCurvature(input({ nEdCompressionN: 0 })).failReason).toBe("UNSUPPORTED_AXIAL");
    expect(evaluateEuC6NominalCurvature(input({ nEdCompressionN: -10 })).failReason).toBe("UNSUPPORTED_AXIAL");
    expect(evaluateEuC6NominalCurvature(input({ nEdCompressionN: Number.NaN })).failReason).toBe("MISSING_OR_INVALID_AXIAL");
    expect(evaluateEuC6NominalCurvature(input({ nEdCompressionN: Number.POSITIVE_INFINITY })).failReason).toBe("MISSING_OR_INVALID_AXIAL");
    expect(evaluateEuC6NominalCurvature(input({ m01Nmm: null })).failReason).toBe("MISSING_END_MOMENTS");
    expect(evaluateEuC6NominalCurvature(input({ m02Nmm: null })).failReason).toBe("MISSING_END_MOMENTS");
    expect(evaluateEuC6NominalCurvature(input({ m01Nmm: 30e6, m02Nmm: 10e6 })).failReason).toBe("INVALID_END_MOMENT_ORDER");
    expect(evaluateEuC6NominalCurvature(input({ m02Nmm: 0 })).failReason).toBe("INVALID_END_MOMENT_ORDER");
    expect(evaluateEuC6NominalCurvature(input({ l0Mm: null })).failReason).toBe("MISSING_EFFECTIVE_LENGTH");
    expect(evaluateEuC6NominalCurvature(input({ l0Mm: 0 })).failReason).toBe("MISSING_EFFECTIVE_LENGTH");
    expect(evaluateEuC6NominalCurvature(input({ l0Mm: -1 })).failReason).toBe("MISSING_EFFECTIVE_LENGTH");
    expect(evaluateEuC6NominalCurvature(input({ geometry: circularSection("c", 400, "c6") })).failReason).toBe("UNSUPPORTED_GEOMETRY");
    expect(evaluateEuC6NominalCurvature(input({ asMm2: null })).failReason).toBe("MISSING_REINFORCEMENT");
    expect(evaluateEuC6NominalCurvature(input({ asMm2: 0 })).failReason).toBe("MISSING_REINFORCEMENT");
    expect(evaluateEuC6NominalCurvature(input({ phiEf: null })).failReason).toBe("MISSING_OR_INVALID_CREEP");
    expect(evaluateEuC6NominalCurvature(input({ phiEf: -0.1 })).failReason).toBe("MISSING_OR_INVALID_CREEP");
    expect(evaluateEuC6NominalCurvature(input({ esMPa: null })).failReason).toBe("MISSING_OR_INVALID_ES");
    expect(evaluateEuC6NominalCurvature(input({ esMPa: 0 })).failReason).toBe("MISSING_OR_INVALID_ES");
    expect(evaluateEuC6NominalCurvature(input({ dMm: null })).failReason).toBe("MISSING_EFFECTIVE_DEPTH");
    expect(evaluateEuC6NominalCurvature(input({ c: null })).failReason).toBe("MISSING_CURVATURE_FACTOR");
    expect(evaluateEuC6NominalCurvature(input({ context: context({ gammaC: null }) })).failReason).toBe("MISSING_UPSTREAM_DESIGN_PROPERTY");
    expect(evaluateEuC6NominalCurvature(input({ profileId: "OTHER" })).failReason).toBe("PROFILE_MISMATCH");
    expect(evaluateEuC6NominalCurvature(input({ generation: "EN1992-1-1-GEN2" })).failReason).toBe("GENERATION_MISMATCH");
    expect(evaluateEuC6NominalCurvature(input({ stale: true })).failReason).toBe("STALE_PROFILE");
    expect(() => selectEuC6EffectiveLength()).toThrow(/effective length/);
  });

  it("invalidates a stale fingerprint and rejects undetermined optimization", () => {
    const first = evaluateEuC6NominalCurvature(input());
    assertEuC6ResultCurrent(first, input());
    expect(() => assertEuC6ResultCurrent(first, input({ l0Mm: 4000 }))).toThrow(/stale/);
    expect(() => assertEuC6OptimizerRejectsUndetermined("UNDETERMINED")).toThrow(/not feasible/);
    expect(() => assertEuC6ParetoRejectsUndetermined("UNDETERMINED")).toThrow(/not feasible/);
    expect(first.calculationState).toBe("COMPLETE");
    expect(first.checkState).toBe("UNDETERMINED");
  });

  it("hands compression to C3 as tension-positive axial force", () => {
    const bar = (id: string, yMm: number): ReinforcementLayout["bars"][number] => ({
      barId: id, designation: "H20", diameterMm: property("d", 20, "mm"), areaMm2: property("As", 314, "mm2"), count: 1,
      xMm: 150, yMm, layerId: null, face: yMm < 250 ? "bottom" : "top", direction: "longitudinal", spacingMm: null, groupId: null,
      materialRef: "c6-reo", anchorageMetadata: null, lapMetadata: null, provenanceRef: "c6",
    });
    const layout: ReinforcementLayout = { layoutId: "c6-lay", bars: [bar("b", 50), bar("t", 450)], groups: [], layers: [], transverse: [], provenanceRef: "c6" };
    const satisfied = evaluateEuC6NominalCurvature(input({
      c3: { methodId: EU_C3_METHOD_IDS[0], layout, resolutionX: 8, resolutionY: 8, provenanceRef: "c6-handoff" },
    }));
    expect(satisfied.c3AxialInputN).toBe(-500e3);
    expect(satisfied.c3CheckState).toBe("CHECK_SATISFIED");
    expect(satisfied.checkState).toBe("SATISFIED");
    const unsatisfied = evaluateEuC6NominalCurvature(input({
      m01Nmm: 4000e6,
      m02Nmm: 5000e6,
      c3: { methodId: EU_C3_METHOD_IDS[0], layout, resolutionX: 8, resolutionY: 8, provenanceRef: "c6-handoff" },
    }));
    expect(unsatisfied.c3AxialInputN).toBe(-500e3);
    expect(unsatisfied.checkState).toBe("NOT_SATISFIED");
  }, 120000);
});
