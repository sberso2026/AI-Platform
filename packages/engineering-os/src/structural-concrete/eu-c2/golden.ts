/**
 * Independent C2 flexural-resistance golden cases.
 * Uses a published first-generation equivalent-rectangular compression block
 * (η = 1.0, λ = 0.8 for fck ≤ 50 MPa) and bilinear reinforcement.
 * Does not import the production material-integration path.
 * Assumption difference vs production: equivalent rectangle vs parabola-rectangle fiber integration.
 */

export const EU_C2_INDEPENDENT_HAND_ETA = 1 as const;
export const EU_C2_INDEPENDENT_HAND_LAMBDA = 0.8 as const;
export const EU_C2_INDEPENDENT_HAND_EPS_CU2 = 0.0035 as const;
export const EU_C2_INDEPENDENT_BENCHMARK_ASSUMPTION =
  "Independent equivalent-rectangular compression block (published first-generation η=1, λ=0.8 for fck≤50) plus horizontal-bilinear reinforcement; production uses D1E-1 material integration of the governed parabola-rectangle. Differences are recorded, not forced to identity." as const;

export type EuC2IndependentBar = { xMm: number; yMm: number; areaMm2: number };

export type EuC2IndependentSection = {
  widthMm: number;
  depthMm: number;
  bars: readonly EuC2IndependentBar[];
  fcdMPa: number;
  fydMPa: number;
  esMPa: number;
  axis: "MAJOR_AXIS" | "MINOR_AXIS";
  momentSign: "POSITIVE" | "NEGATIVE";
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

function concreteForceN(section: EuC2IndependentSection, na: number): { N: number; xArmMm: number; yArmMm: number } {
  const eta = EU_C2_INDEPENDENT_HAND_ETA;
  const lambda = EU_C2_INDEPENDENT_HAND_LAMBDA;
  if (section.axis === "MAJOR_AXIS") {
    const yComp = section.momentSign === "POSITIVE" ? section.depthMm : 0;
    const x = Math.abs(yComp - na);
    const block = Math.min(lambda * x, section.depthMm);
    const mag = eta * section.fcdMPa * section.widthMm * block;
    const yBlock =
      section.momentSign === "POSITIVE" ? yComp - block / 2 : yComp + block / 2;
    return { N: -mag, xArmMm: section.widthMm / 2, yArmMm: yBlock };
  }
  const xComp = section.momentSign === "POSITIVE" ? section.widthMm : 0;
  const x = Math.abs(xComp - na);
  const block = Math.min(lambda * x, section.widthMm);
  const mag = eta * section.fcdMPa * section.depthMm * block;
  const xBlock =
    section.momentSign === "POSITIVE" ? xComp - block / 2 : xComp + block / 2;
  return { N: -mag, xArmMm: xBlock, yArmMm: section.depthMm / 2 };
}

export function independentEquivalentRectangularResistance(section: EuC2IndependentSection): {
  resistanceMomentNm: number;
  axialResidualN: number;
  naMm: number;
  source: "INDEPENDENT_EQUIVALENT_RECTANGULAR_HAND";
} {
  const originX = section.widthMm / 2;
  const originY = section.depthMm / 2;
  const lo = 0.01 * (section.axis === "MAJOR_AXIS" ? section.depthMm : section.widthMm);
  const hi = (section.axis === "MAJOR_AXIS" ? section.depthMm : section.widthMm) - lo;
  const nOf = (na: number): number => {
    const concrete = concreteForceN(section, na);
    let N = concrete.N;
    for (const bar of section.bars) {
      const eps = kernelStrain(section, na, bar.xMm, bar.yMm);
      const stress = clamp(section.esMPa * eps, -section.fydMPa, section.fydMPa);
      N += stress * bar.areaMm2;
    }
    return N;
  };
  let a = lo;
  let b = hi;
  let na = 0.5 * (a + b);
  let Na = nOf(a);
  let Nb = nOf(b);
  if (Na * Nb > 0) {
    return { resistanceMomentNm: Number.NaN, axialResidualN: Na, naMm: na, source: "INDEPENDENT_EQUIVALENT_RECTANGULAR_HAND" };
  }
  for (let i = 0; i < 80; i++) {
    na = 0.5 * (a + b);
    const Nm = nOf(na);
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
    axialResidualN: N,
    naMm: na,
    source: "INDEPENDENT_EQUIVALENT_RECTANGULAR_HAND",
  };
}

export const EU_C2_GOLDEN_CASES = [
  "MAJOR_POSITIVE_SINGLY",
  "MAJOR_NEGATIVE_DOUBLY",
  "MINOR_POSITIVE_EDGE",
  "MAJOR_POSITIVE_DOUBLY",
  "MAJOR_POSITIVE_SYMMETRIC",
  "MAJOR_POSITIVE_ASYMMETRIC",
  "MAJOR_POSITIVE_LOW_RATIO",
  "MAJOR_POSITIVE_C40",
  "MAJOR_POSITIVE_FYK400",
] as const;
