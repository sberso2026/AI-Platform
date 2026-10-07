/**
 * Independent C3 N-M golden cases.
 * Same published first-generation equivalent-rectangular block as C2 (η=1, λ=0.8)
 * with bilinear reinforcement, solved at a prescribed axial target.
 * Does not import the production material-integration path.
 */

import {
  EU_C2_INDEPENDENT_HAND_EPS_CU2,
  EU_C2_INDEPENDENT_HAND_ETA,
  EU_C2_INDEPENDENT_HAND_LAMBDA,
  type EuC2IndependentSection,
} from "../eu-c2/golden";

export const EU_C3_INDEPENDENT_BENCHMARK_ASSUMPTION =
  "Independent equivalent-rectangular compression block (published first-generation η=1, λ=0.8 for fck≤50) plus horizontal-bilinear reinforcement at a prescribed axial target; production uses D1E-1 parabola-rectangle fiber integration. Differences are recorded, not forced to identity. Mechanics anchors are not labelled EN 1992 N_Rd." as const;

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

function concreteForceN(section: EuC2IndependentSection, na: number): { N: number; xArmMm: number; yArmMm: number } {
  const eta = EU_C2_INDEPENDENT_HAND_ETA;
  const lambda = EU_C2_INDEPENDENT_HAND_LAMBDA;
  if (section.axis === "MAJOR_AXIS") {
    const yComp = section.momentSign === "POSITIVE" ? section.depthMm : 0;
    const x = Math.abs(yComp - na);
    const block = Math.min(lambda * x, section.depthMm);
    const mag = eta * section.fcdMPa * section.widthMm * block;
    const yBlock = section.momentSign === "POSITIVE" ? yComp - block / 2 : yComp + block / 2;
    return { N: -mag, xArmMm: section.widthMm / 2, yArmMm: yBlock };
  }
  const xComp = section.momentSign === "POSITIVE" ? section.widthMm : 0;
  const x = Math.abs(xComp - na);
  const block = Math.min(lambda * x, section.widthMm);
  const mag = eta * section.fcdMPa * section.depthMm * block;
  const xBlock = section.momentSign === "POSITIVE" ? xComp - block / 2 : xComp + block / 2;
  return { N: -mag, xArmMm: xBlock, yArmMm: section.depthMm / 2 };
}

function nOf(section: EuC2IndependentSection, na: number): number {
  const concrete = concreteForceN(section, na);
  let N = concrete.N;
  for (const bar of section.bars) {
    const eps = kernelStrain(section, na, bar.xMm, bar.yMm);
    const stress = clamp(section.esMPa * eps, -section.fydMPa, section.fydMPa);
    N += stress * bar.areaMm2;
  }
  return N;
}

export function independentEquivalentRectangularNm(
  section: EuC2IndependentSection,
  targetAxialN: number,
): {
  resistanceMomentNm: number;
  axialResidualN: number;
  naMm: number;
  source: "INDEPENDENT_EQUIVALENT_RECTANGULAR_HAND";
} {
  const originX = section.widthMm / 2;
  const originY = section.depthMm / 2;
  const span = section.axis === "MAJOR_AXIS" ? section.depthMm : section.widthMm;
  const edge = 0.004 * span;
  const residual = (na: number) => nOf(section, na) - targetAxialN;
  let a = section.momentSign === "POSITIVE" ? -3 * span : edge;
  let b = section.momentSign === "POSITIVE" ? span - edge : span + 3 * span;
  let Na = residual(a);
  let Nb = residual(b);
  if (Na * Nb > 0) {
    a = edge;
    b = span - edge;
    Na = residual(a);
    Nb = residual(b);
  }
  const samples = 40;
  if (Na * Nb > 0) {
    const lo = a;
    const hi = b;
    for (let i = 1; i < samples; i++) {
      const na = lo + (i / samples) * (hi - lo);
      const Nm = residual(na);
      if (Na * Nm <= 0) {
        b = na;
        Nb = Nm;
        break;
      }
      a = na;
      Na = Nm;
    }
  }
  if (Na * Nb > 0) {
    return { resistanceMomentNm: Number.NaN, axialResidualN: Na + targetAxialN, naMm: 0.5 * (a + b), source: "INDEPENDENT_EQUIVALENT_RECTANGULAR_HAND" };
  }
  let na = 0.5 * (a + b);
  for (let i = 0; i < 80; i++) {
    na = 0.5 * (a + b);
    const Nm = residual(na);
    if (Math.abs(Nm) <= 1) break;
    if (Na * Nm <= 0) {
      b = na;
      Nb = Nm;
    } else {
      a = na;
      Na = Nm;
    }
  }
  const concrete = concreteForceN(section, na);
  let MxNmm = -concrete.N * (concrete.yArmMm - originY);
  let MyNmm = -concrete.N * (concrete.xArmMm - originX);
  let N = concrete.N;
  for (const bar of section.bars) {
    const eps = kernelStrain(section, na, bar.xMm, bar.yMm);
    const stress = clamp(section.esMPa * eps, -section.fydMPa, section.fydMPa);
    const force = stress * bar.areaMm2;
    N += force;
    MxNmm += -force * (bar.yMm - originY);
    MyNmm += -force * (bar.xMm - originX);
  }
  const resistanceMomentNm = (section.axis === "MINOR_AXIS" ? MyNmm : MxNmm) * 1e-3;
  return {
    resistanceMomentNm,
    axialResidualN: N - targetAxialN,
    naMm: na,
    source: "INDEPENDENT_EQUIVALENT_RECTANGULAR_HAND",
  };
}

export function independentUniformCompressionAnchorN(section: EuC2IndependentSection): number {
  const mag = EU_C2_INDEPENDENT_HAND_ETA * section.fcdMPa * section.widthMm * section.depthMm;
  let N = -mag;
  const eps = -EU_C2_INDEPENDENT_HAND_EPS_CU2;
  for (const bar of section.bars) {
    N += clamp(section.esMPa * eps, -section.fydMPa, section.fydMPa) * bar.areaMm2;
  }
  return N;
}

export function independentUniformTensionAnchorN(section: EuC2IndependentSection): number {
  let N = 0;
  for (const bar of section.bars) N += section.fydMPa * bar.areaMm2;
  return N;
}
