import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE,
  EU_C1C_R1_PARAMETER_VERSION,
  EU_C3_METHOD_IDS,
  EU_C3_NUMERICAL_TOLERANCE,
  type ConcreteMaterial,
  type EuC1cR1DeclaredNdpValue,
  type ReinforcementLayout,
  type ReinforcementMaterial,
} from "@rtb/types";
import { formulaFingerprint } from "./eu-c1b/fingerprint";
import { evaluateEuC3InteractionPoint } from "./eu-c3/evaluate";
import {
  C3_NONZERO_NM_PRIMARY_TARGET_N,
  C3_NONZERO_NM_SECOND_TARGET_N,
  independentNonzeroNmReport,
} from "./eu-c3/nonzero-nm-independent";
import { rectangleSection } from "./section-mechanics";

function property(name: string, value: number, unit: string) {
  return { name, value, unit, provenanceRef: "c10-r2", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
}
function declaredNdp(value: number): EuC1cR1DeclaredNdpValue {
  return {
    value, unit: "dimensionless", sourceAuthority: EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE,
    provenanceRef: "test-only-non-conformance", ndpIdentity: "DECLARED_PROJECT_OVERRIDE", version: EU_C1C_R1_PARAMETER_VERSION,
  };
}
function concrete(): ConcreteMaterial {
  return {
    materialRef: "c10-r2-conc", designation: "C30", compressiveStrength: property("fc", 30, "MPa"), tensileStrength: null,
    elasticModulus: property("Ec", 33000, "MPa"), density: null, poissonRatio: null, age: null, strengthReferenceAge: null,
    materialClass: null, materialStandardRef: "project", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    testCertificateRef: "tc", environmentalMetadata: null, version: "c10-r2", provenance: property("p", 0, "1") as never,
  };
}
function reo(): ReinforcementMaterial {
  return {
    materialRef: "c10-r2-reo", designation: "B500", yieldStrength: property("fy", 500, "MPa"), ultimateStrength: null,
    elasticModulus: property("Es", 200000, "MPa"), ductilityClass: null, productStandardRef: "project",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE", version: "c10-r2", provenance: property("p", 0, "1") as never,
  };
}
function bar(id: string, xMm: number, yMm: number, areaMm2: number, face: string): ReinforcementLayout["bars"][number] {
  return {
    barId: id, designation: "H20", diameterMm: property("d", 20, "mm"), areaMm2: property("As", areaMm2, "mm2"),
    count: 1, xMm, yMm, layerId: null, face, direction: "longitudinal", spacingMm: null, groupId: null,
    materialRef: "c10-r2-reo", anchorageMetadata: null, lapMetadata: null, provenanceRef: "c10-r2",
  };
}
const singlyBottom: ReinforcementLayout = {
  layoutId: "lay-c10-r2",
  bars: [bar("b1", 50, 50, 314, "bottom"), bar("b2", 150, 50, 314, "bottom"), bar("b3", 250, 50, 314, "bottom")],
  groups: [], layers: [], transverse: [], provenanceRef: "c10-r2",
};
const handSection = {
  widthMm: 300, depthMm: 500,
  bars: singlyBottom.bars.map((row) => ({ xMm: row.xMm ?? 0, yMm: row.yMm ?? 0, areaMm2: Number(row.areaMm2?.value ?? 0) })),
  fcdMPa: 20, fydMPa: 500 / 1.15, esMPa: 200000, axis: "MAJOR_AXIS" as const, momentSign: "POSITIVE" as const,
};

function governedPass(independentMomentNm: number, eosMomentNm: number, residualN: number): boolean {
  const difference = Math.abs(eosMomentNm - independentMomentNm);
  const limit = Math.max(
    EU_C3_NUMERICAL_TOLERANCE.resistanceComparisonAbsNm,
    EU_C3_NUMERICAL_TOLERANCE.resistanceComparisonRel * Math.abs(independentMomentNm),
  );
  return Math.abs(residualN) <= EU_C3_NUMERICAL_TOLERANCE.equilibriumResidualN && difference <= limit;
}

describe("C3 nonzero N-M validation recovery", () => {
  it("keeps the historical zero-axial review incomplete and does not rewrite it", () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
    const historical = readFileSync(join(root, "docs/architecture/engineering-os/EOS_D1_C10_C3_UNIAXIAL_HUMAN_REVIEW_EVIDENCE.md"), "utf8").replace(/\r\n/g, "\n");
    const longTerm = readFileSync(join(root, "docs/architecture/engineering-os/EOS_D1_C10_C7_LONG_TERM_HUMAN_REVIEW_EVIDENCE.md"), "utf8").replace(/\r\n/g, "\n");
    expect(historical).toContain("FROZEN_FINGERPRINT:\na32bf2a00b313d9d");
    expect(historical).toContain("REVIEWER_OUTCOME:\nREVIEW_INCOMPLETE");
    expect(historical).toContain("nonzero N-M");
    expect(longTerm).toContain("REVIEWER_OUTCOME:\nREVIEW_INCOMPLETE");
    expect(longTerm).toContain("INDEPENDENT_RESULT:\nBLANK");
  });

  it("compares an independent nonzero compression benchmark with production C3", () => {
    expect(C3_NONZERO_NM_PRIMARY_TARGET_N).toBe(-100000);
    expect(EU_C3_NUMERICAL_TOLERANCE.equilibriumResidualN).toBe(50);
    expect(EU_C3_NUMERICAL_TOLERANCE.resistanceComparisonAbsNm).toBe(8000);
    expect(EU_C3_NUMERICAL_TOLERANCE.resistanceComparisonRel).toBe(0.08);
    const independent = independentNonzeroNmReport(handSection, C3_NONZERO_NM_PRIMARY_TARGET_N);
    expect(independent.converged).toBe(true);
    expect(independent.fcdMPa).toBe(20);
    expect(independent.fydMPa).toBeCloseTo(500 / 1.15, 10);
    expect(independent.neutralAxisDepthFromCompressionFaceMm).toBeCloseTo(106.15951871871948, 8);
    expect(independent.bars[0]?.strain).toBeCloseTo(0.011336163718612211, 10);
    expect(independent.bars.every((row) => row.yieldState === "YIELDED_TENSION")).toBe(true);
    expect(independent.axialForceN).toBeCloseTo(-100000.47245854925, 6);
    expect(independent.resistanceMomentNm).toBeCloseTo(187666.36658471118, 6);
    const eos = evaluateEuC3InteractionPoint({
      methodId: EU_C3_METHOD_IDS[0], axis: "MAJOR_AXIS", momentSign: "POSITIVE",
      geometry: rectangleSection("c10-r2-rect", 300, 500, "c10-r2"), layout: singlyBottom,
      concrete: concrete(), reinforcement: reo(),
      context: { nationalAnnexRef: "DECLARED_TEST_NA", gamma_c: declaredNdp(1.5), gamma_s: declaredNdp(1.15), alpha_cc: declaredNdp(1), testOnlyNonConformance: true },
      targetAxialN: C3_NONZERO_NM_PRIMARY_TARGET_N, resolutionX: 16, resolutionY: 16, provenanceRef: "c3-nonzero-nm",
    });
    expect(eos.ok).toBe(true);
    if (!eos.ok) return;
    expect(eos.strainFamily).toBe("EPS_CU2_PIVOT");
    expect(governedPass(independent.resistanceMomentNm, eos.resistanceMomentNm, eos.equilibriumResidualN)).toBe(true);
    expect(eos.axialForceN).toBeCloseTo(-100046.01443391509, 6);
    expect(eos.resistanceMomentNm).toBeCloseTo(187353.39590468965, 6);
  });

  it("checks a second preexisting compression magnitude without changing the section", () => {
    expect(C3_NONZERO_NM_SECOND_TARGET_N).toBe(-500000);
    const independent = independentNonzeroNmReport(handSection, C3_NONZERO_NM_SECOND_TARGET_N);
    expect(independent.converged).toBe(true);
    expect(independent.resistanceMomentNm).toBeCloseTo(240361.85129568598, 6);
    const eos = evaluateEuC3InteractionPoint({
      methodId: EU_C3_METHOD_IDS[0], axis: "MAJOR_AXIS", momentSign: "POSITIVE",
      geometry: rectangleSection("c10-r2-rect", 300, 500, "c10-r2"), layout: singlyBottom,
      concrete: concrete(), reinforcement: reo(),
      context: { nationalAnnexRef: "DECLARED_TEST_NA", gamma_c: declaredNdp(1.5), gamma_s: declaredNdp(1.15), alpha_cc: declaredNdp(1), testOnlyNonConformance: true },
      targetAxialN: C3_NONZERO_NM_SECOND_TARGET_N, resolutionX: 16, resolutionY: 16, provenanceRef: "c3-nonzero-nm-second",
    });
    expect(eos.ok).toBe(true);
    if (!eos.ok) return;
    expect(governedPass(independent.resistanceMomentNm, eos.resistanceMomentNm, eos.equilibriumResidualN)).toBe(true);
  });

  it("fingerprints the independent case definition rather than the production result", () => {
    expect(formulaFingerprint({
      ruleId: "C3_NONZERO_NM_INDEPENDENT_EQUIVALENT_RECTANGULAR",
      operations: ["ETA_LAMBDA_BLOCK", "BILINEAR_REINFORCEMENT", "TENSION_POSITIVE_AXIAL"],
      parameterIds: ["N=-100000", "N2=-500000", "b=300", "h=500", "As=3x314", "fck=30", "fyk=500", "gamma_c=1.5", "gamma_s=1.15", "alpha_cc=1"],
    })).toBe("fp:48f5b4c8");
  });
});
