/**
 * Independent C4 P-M-M goldens.
 * Principal-axis cases reuse the C3 equivalent-rectangular hand model.
 * Biaxial 45-degree independent case uses a standalone parabola-rectangle fiber
 * mesh with an εcu2 vertex pivot. Does not import production integration.
 */

import {
  EU_C2_INDEPENDENT_HAND_EPS_CU2,
  type EuC2IndependentSection,
} from "../eu-c2/golden";
import { independentEquivalentRectangularNm } from "../eu-c3/golden";

export const EU_C4_INDEPENDENT_BENCHMARK_ASSUMPTION =
  "Independent first-generation parabola-rectangle (εc2=0.002, εcu2=0.0035, n=2, fck≤50) plus horizontal-bilinear reinforcement on a standalone rectangular fiber mesh; principal axes reuse the C3 equivalent-rectangle hand model. Production uses D1E-1 integration. Differences are recorded, not forced to identity." as const;

function clamp(value: number, lo: number, hi: number): number {
  if (value < lo) return lo;
  if (value > hi) return hi;
  return value;
}

export function independentPrincipalNm(section: EuC2IndependentSection, targetAxialN: number) {
  return independentEquivalentRectangularNm(section, targetAxialN);
}

function independentParabolaRectangleMPa(eps: number, fcdMPa: number): number {
  const epsC2 = 0.002;
  const epsCu2 = EU_C2_INDEPENDENT_HAND_EPS_CU2;
  if (!(eps < 0)) return 0;
  const mag = Math.min(-eps, epsCu2);
  if (mag <= epsC2) return -fcdMPa * (1 - (1 - mag / epsC2) ** 2);
  return -fcdMPa;
}

export function independentDiagonalVertexNm(
  section: EuC2IndependentSection,
  targetAxialN: number,
  theta = Math.PI / 4,
): { mxNm: number; myNm: number; axialResidualN: number; source: "INDEPENDENT_DIAGONAL_FIBER_HAND" } {
  const originX = section.widthMm / 2;
  const originY = section.depthMm / 2;
  const nx = 24;
  const ny = 32;
  const dx = section.widthMm / nx;
  const dy = section.depthMm / ny;
  const cx = Math.sin(theta);
  const cy = Math.cos(theta);
  const xC = cx >= 0 ? section.widthMm : 0;
  const yC = cy >= 0 ? section.depthMm : 0;
  const span = Math.hypot(section.widthMm, section.depthMm);
  const strain = (kappa: number, xMm: number, yMm: number): number => {
    const phix = kappa * cy;
    const phiy = kappa * cx;
    const eps0 = -EU_C2_INDEPENDENT_HAND_EPS_CU2 + phix * (yC - originY) + phiy * (xC - originX);
    return eps0 - phix * (yMm - originY) - phiy * (xMm - originX);
  };
  const resultantsOf = (kappa: number) => {
    let N = 0;
    let MxNmm = 0;
    let MyNmm = 0;
    for (let iy = 0; iy < ny; iy++) {
      for (let ix = 0; ix < nx; ix++) {
        const xMm = (ix + 0.5) * dx;
        const yMm = (iy + 0.5) * dy;
        const force = independentParabolaRectangleMPa(strain(kappa, xMm, yMm), section.fcdMPa) * dx * dy;
        N += force;
        MxNmm += -force * (yMm - originY);
        MyNmm += -force * (xMm - originX);
      }
    }
    for (const bar of section.bars) {
      const force = clamp(section.esMPa * strain(kappa, bar.xMm, bar.yMm), -section.fydMPa, section.fydMPa) * bar.areaMm2;
      N += force;
      MxNmm += -force * (bar.yMm - originY);
      MyNmm += -force * (bar.xMm - originX);
    }
    return { N, MxNmm, MyNmm };
  };
  const kappaHigh = (4 * EU_C2_INDEPENDENT_HAND_EPS_CU2) / Math.max(span, 1);
  let a = 1e-10;
  let b = kappaHigh;
  let Na = resultantsOf(a).N - targetAxialN;
  let Nb = resultantsOf(b).N - targetAxialN;
  for (let i = 1; i < 40 && Na * Nb > 0; i++) {
    const k = a + (i / 40) * (b - a);
    const Nm = resultantsOf(k).N - targetAxialN;
    if (Na * Nm <= 0) {
      b = k;
      Nb = Nm;
      break;
    }
    a = k;
    Na = Nm;
  }
  let kappa = 0.5 * (a + b);
  for (let i = 0; i < 60 && Na * Nb <= 0; i++) {
    kappa = 0.5 * (a + b);
    const Nm = resultantsOf(kappa).N - targetAxialN;
    if (Math.abs(Nm) <= 1) break;
    if (Na * Nm <= 0) {
      b = kappa;
      Nb = Nm;
    } else {
      a = kappa;
      Na = Nm;
    }
  }
  const out = resultantsOf(kappa);
  return { mxNm: out.MxNmm * 1e-3, myNm: out.MyNmm * 1e-3, axialResidualN: out.N - targetAxialN, source: "INDEPENDENT_DIAGONAL_FIBER_HAND" };
}
