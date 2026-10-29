/**
 * Explicit independent C3 nonzero N-M report.
 * Uses the existing equivalent-rectangular hand solver in golden.ts.
 * Does not import the production C3 evaluator, fiber integrator, or production equilibrium routines.
 */

import {
  EU_C2_INDEPENDENT_HAND_EPS_CU2,
  EU_C2_INDEPENDENT_HAND_ETA,
  EU_C2_INDEPENDENT_HAND_LAMBDA,
  type EuC2IndependentSection,
} from "../eu-c2/golden";
import { independentEquivalentRectangularNm } from "./golden";

export const C3_NONZERO_NM_SIGN_CONVENTION =
  "TENSION_POSITIVE_COMPRESSION_NEGATIVE" as const;

export const C3_NONZERO_NM_PRIMARY_TARGET_N = -100_000 as const;
export const C3_NONZERO_NM_SECOND_TARGET_N = -500_000 as const;

export type C3IndependentYieldState = "YIELDED_TENSION" | "YIELDED_COMPRESSION" | "ELASTIC";

export type C3IndependentBarReport = {
  xMm: number;
  yMm: number;
  areaMm2: number;
  strain: number;
  stressMPa: number;
  forceN: number;
  yieldState: C3IndependentYieldState;
};

function clamp(value: number, lo: number, hi: number): number {
  if (value < lo) return lo;
  if (value > hi) return hi;
  return value;
}

function kernelStrain(section: EuC2IndependentSection, na: number, xMm: number, yMm: number): number {
  if (section.axis === "MAJOR_AXIS") {
    const yComp = section.momentSign === "POSITIVE" ? section.depthMm : 0;
    return -EU_C2_INDEPENDENT_HAND_EPS_CU2 * (yMm - na) / (yComp - na);
  }
  const xComp = section.momentSign === "POSITIVE" ? section.widthMm : 0;
  return -EU_C2_INDEPENDENT_HAND_EPS_CU2 * (xMm - na) / (xComp - na);
}

function concreteForceN(section: EuC2IndependentSection, na: number): { N: number; xArmMm: number; yArmMm: number; blockMm: number; neutralAxisDepthMm: number } {
  const eta = EU_C2_INDEPENDENT_HAND_ETA;
  const lambda = EU_C2_INDEPENDENT_HAND_LAMBDA;
  if (section.axis === "MAJOR_AXIS") {
    const yComp = section.momentSign === "POSITIVE" ? section.depthMm : 0;
    const neutralAxisDepthMm = Math.abs(yComp - na);
    const blockMm = Math.min(lambda * neutralAxisDepthMm, section.depthMm);
    const mag = eta * section.fcdMPa * section.widthMm * blockMm;
    const yBlock = section.momentSign === "POSITIVE" ? yComp - blockMm / 2 : yComp + blockMm / 2;
    return { N: -mag, xArmMm: section.widthMm / 2, yArmMm: yBlock, blockMm, neutralAxisDepthMm };
  }
  const xComp = section.momentSign === "POSITIVE" ? section.widthMm : 0;
  const neutralAxisDepthMm = Math.abs(xComp - na);
  const blockMm = Math.min(lambda * neutralAxisDepthMm, section.widthMm);
  const mag = eta * section.fcdMPa * section.depthMm * blockMm;
  const xBlock = section.momentSign === "POSITIVE" ? xComp - blockMm / 2 : xComp + blockMm / 2;
  return { N: -mag, xArmMm: xBlock, yArmMm: section.depthMm / 2, blockMm, neutralAxisDepthMm };
}

export function independentNonzeroNmReport(section: EuC2IndependentSection, targetAxialN: number) {
  const solved = independentEquivalentRectangularNm(section, targetAxialN);
  const concrete = concreteForceN(section, solved.naMm);
  const epsYd = section.fydMPa / section.esMPa;
  const bars: C3IndependentBarReport[] = section.bars.map((bar) => {
    const strain = kernelStrain(section, solved.naMm, bar.xMm, bar.yMm);
    const stressMPa = clamp(section.esMPa * strain, -section.fydMPa, section.fydMPa);
    const forceN = stressMPa * bar.areaMm2;
    const yieldState: C3IndependentYieldState =
      stressMPa >= section.fydMPa - 1e-9 ? "YIELDED_TENSION"
      : stressMPa <= -section.fydMPa + 1e-9 ? "YIELDED_COMPRESSION"
      : "ELASTIC";
    return { xMm: bar.xMm, yMm: bar.yMm, areaMm2: bar.areaMm2, strain, stressMPa, forceN, yieldState };
  });
  const steelForceN = bars.reduce((sum, bar) => sum + bar.forceN, 0);
  const steelMomentArmNumerator = bars.reduce((sum, bar) => sum + bar.forceN * bar.yMm, 0);
  return {
    source: solved.source,
    signConvention: C3_NONZERO_NM_SIGN_CONVENTION,
    targetAxialN,
    fcdMPa: section.fcdMPa,
    fydMPa: section.fydMPa,
    esMPa: section.esMPa,
    eta: EU_C2_INDEPENDENT_HAND_ETA,
    lambda: EU_C2_INDEPENDENT_HAND_LAMBDA,
    epsCu2: EU_C2_INDEPENDENT_HAND_EPS_CU2,
    epsYd,
    neutralAxisCoordinateMm: solved.naMm,
    neutralAxisDepthFromCompressionFaceMm: concrete.neutralAxisDepthMm,
    concreteBlockDepthMm: concrete.blockMm,
    concreteForceN: concrete.N,
    concreteResultantXMm: concrete.xArmMm,
    concreteResultantYMm: concrete.yArmMm,
    steelForceN,
    steelResultantYMm: steelForceN === 0 ? null : steelMomentArmNumerator / steelForceN,
    bars,
    axialForceN: concrete.N + steelForceN,
    axialResidualN: solved.axialResidualN,
    resistanceMomentNm: solved.resistanceMomentNm,
    converged: Number.isFinite(solved.resistanceMomentNm),
  };
}
