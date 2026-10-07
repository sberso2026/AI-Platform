import type {
  ConcreteMaterial,
  RcCrackState,
  RcEquilibriumResidual,
  RcGeneralizedStrainState,
  RcReinforcementDisplacementTreatment,
  RcSectionGeometryInput,
  RcSectionResultants,
  ReinforcementLayout,
  ReinforcementMaterial,
} from "@rtb/types";
import { RC_NUMERICAL_TOLERANCE } from "@rtb/types";
import { integrateElasticSection } from "./integration";
import { createStrainState } from "./kinematics";
import { failClosed } from "./units";

export function sectionEquilibriumResidual(calculated: RcSectionResultants, target: { N_N: number; Mx_Nm: number; My_Nm: number }): RcEquilibriumResidual {
  return {
    rN_N: calculated.N_N - target.N_N,
    rMx_Nm: calculated.Mx_Nm - target.Mx_Nm,
    rMy_Nm: calculated.My_Nm - target.My_Nm,
    solverKind: "DETERMINISTIC_SECTION_EQUILIBRIUM",
    labelledCodeDesign: false,
  };
}

export type RcSectionIntegrateFn = (strain: RcGeneralizedStrainState) => RcSectionResultants;

export type RcEquilibriumSolveResult = {
  state: "CONVERGED" | "NOT_CONVERGED" | "CHECK_UNDETERMINED";
  strain: RcGeneralizedStrainState | null;
  resultants: RcSectionResultants | null;
  residual: RcEquilibriumResidual | null;
  iterations: number;
  method: "NEWTON_RAPHSON" | "BRACKETED_AXIAL_BISECTION";
  labelledCodeCapacity: false;
};

export function solveSectionEquilibrium(input: {
  originMm: { xMm: number; yMm: number };
  target: { N_N: number; Mx_Nm: number; My_Nm: number };
  integrate: RcSectionIntegrateFn;
  maxIterations?: number;
  forceTolN?: number;
  momentTolNm?: number;
}): RcEquilibriumSolveResult {
  const method = "NEWTON_RAPHSON" as const;
  let eps = 0;
  let phix = 0;
  let phiy = 0;
  const stepE = RC_NUMERICAL_TOLERANCE.jacobianStrainStep;
  const stepK = RC_NUMERICAL_TOLERANCE.jacobianCurvatureStepPerMm;
  const maxIter = input.maxIterations ?? RC_NUMERICAL_TOLERANCE.maxNewtonIterations;
  const forceTol = input.forceTolN ?? RC_NUMERICAL_TOLERANCE.forceN;
  const momentTol = input.momentTolNm ?? RC_NUMERICAL_TOLERANCE.momentNm;
  for (let iter = 1; iter <= maxIter; iter++) {
    const strain = createStrainState(eps, phix, phiy, input.originMm);
    const resultants = input.integrate(strain);
    const residual = sectionEquilibriumResidual(resultants, input.target);
    const ok =
      Math.abs(residual.rN_N) <= forceTol &&
      Math.abs(residual.rMx_Nm) <= momentTol &&
      Math.abs(residual.rMy_Nm) <= momentTol;
    if (ok) {
      return { state: "CONVERGED", strain, resultants, residual, iterations: iter, method, labelledCodeCapacity: false };
    }
    const col0 = sectionEquilibriumResidual(input.integrate(createStrainState(eps + stepE, phix, phiy, input.originMm)), input.target);
    const col1 = sectionEquilibriumResidual(input.integrate(createStrainState(eps, phix + stepK, phiy, input.originMm)), input.target);
    const col2 = sectionEquilibriumResidual(input.integrate(createStrainState(eps, phix, phiy + stepK, input.originMm)), input.target);
    const J = [
      [(col0.rN_N - residual.rN_N) / stepE, (col1.rN_N - residual.rN_N) / stepK, (col2.rN_N - residual.rN_N) / stepK],
      [(col0.rMx_Nm - residual.rMx_Nm) / stepE, (col1.rMx_Nm - residual.rMx_Nm) / stepK, (col2.rMx_Nm - residual.rMx_Nm) / stepK],
      [(col0.rMy_Nm - residual.rMy_Nm) / stepE, (col1.rMy_Nm - residual.rMy_Nm) / stepK, (col2.rMy_Nm - residual.rMy_Nm) / stepK],
    ];
    const delta = solve3(J, [-residual.rN_N, -residual.rMx_Nm, -residual.rMy_Nm]);
    if (!delta) {
      return { state: "NOT_CONVERGED", strain: null, resultants: null, residual, iterations: iter, method, labelledCodeCapacity: false };
    }
    eps += delta[0];
    phix += delta[1];
    phiy += delta[2];
  }
  return { state: "NOT_CONVERGED", strain: null, resultants: null, residual: null, iterations: maxIter, method, labelledCodeCapacity: false };
}

export function solveElasticEquilibrium(input: {
  geometry: RcSectionGeometryInput;
  layout: ReinforcementLayout;
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  target: { N_N: number; Mx_Nm: number; My_Nm: number };
  originMm: { xMm: number; yMm: number };
  displacementTreatment: RcReinforcementDisplacementTreatment;
  crackState: RcCrackState;
  provenanceRef: string;
}): RcEquilibriumSolveResult {
  return solveSectionEquilibrium({
    originMm: input.originMm,
    target: input.target,
    integrate: (strain) => integrateElasticSection({ ...input, strain }),
  });
}

export function solveAxialEquilibrium1d(input: {
  integrate: RcSectionIntegrateFn;
  strainFromParam: (param: number) => RcGeneralizedStrainState;
  targetN: number;
  paramLow: number;
  paramHigh: number;
  forceTolN: number;
  maxIterations: number;
}): RcEquilibriumSolveResult {
  const method = "BRACKETED_AXIAL_BISECTION" as const;
  const nAt = (param: number): { resultants: RcSectionResultants; residual: RcEquilibriumResidual } | null => {
    try {
      const strain = input.strainFromParam(param);
      const resultants = input.integrate(strain);
      if (!Number.isFinite(resultants.N_N)) return null;
      return { resultants, residual: sectionEquilibriumResidual(resultants, { N_N: input.targetN, Mx_Nm: resultants.Mx_Nm, My_Nm: resultants.My_Nm }) };
    } catch {
      return null;
    }
  };
  let lo = input.paramLow;
  let hi = input.paramHigh;
  const left = nAt(lo);
  const right = nAt(hi);
  if (!left || !right) {
    return { state: "NOT_CONVERGED", strain: null, resultants: null, residual: null, iterations: 0, method, labelledCodeCapacity: false };
  }
  let nLo = left.residual.rN_N;
  let nHi = right.residual.rN_N;
  if (nLo * nHi > 0) {
    return { state: "NOT_CONVERGED", strain: null, resultants: null, residual: left.residual, iterations: 0, method, labelledCodeCapacity: false };
  }
  let best = Math.abs(nLo) < Math.abs(nHi) ? { param: lo, sample: left } : { param: hi, sample: right };
  for (let iter = 1; iter <= input.maxIterations; iter++) {
    const mid = 0.5 * (lo + hi);
    const sample = nAt(mid);
    if (!sample) {
      return { state: "NOT_CONVERGED", strain: null, resultants: null, residual: best.sample.residual, iterations: iter, method, labelledCodeCapacity: false };
    }
    const nMid = sample.residual.rN_N;
    if (Math.abs(nMid) < Math.abs(best.sample.residual.rN_N)) best = { param: mid, sample };
    if (Math.abs(nMid) <= input.forceTolN) {
      return {
        state: "CONVERGED",
        strain: input.strainFromParam(mid),
        resultants: sample.resultants,
        residual: sample.residual,
        iterations: iter,
        method,
        labelledCodeCapacity: false,
      };
    }
    if (nLo * nMid <= 0) {
      hi = mid;
      nHi = nMid;
    } else {
      lo = mid;
      nLo = nMid;
    }
  }
  return {
    state: "NOT_CONVERGED",
    strain: null,
    resultants: null,
    residual: best.sample.residual,
    iterations: input.maxIterations,
    method,
    labelledCodeCapacity: false,
  };
}

function solve3(A: number[][], b: number[]): [number, number, number] | null {
  const m = A.map((row, i) => [...row, b[i] ?? 0]);
  for (let i = 0; i < 3; i++) {
    let pivot = i;
    for (let r = i + 1; r < 3; r++) if (Math.abs(m[r]?.[i] ?? 0) > Math.abs(m[pivot]?.[i] ?? 0)) pivot = r;
    const a = m[i];
    const p = m[pivot];
    if (!a || !p) return null;
    m[i] = p;
    m[pivot] = a;
    const diag = m[i]?.[i] ?? 0;
    if (Math.abs(diag) < 1e-18) return null;
    for (let c = i; c < 4; c++) m[i]![c] = (m[i]![c] ?? 0) / diag;
    for (let r = 0; r < 3; r++) {
      if (r === i) continue;
      const f = m[r]![i] ?? 0;
      for (let c = i; c < 4; c++) m[r]![c] = (m[r]![c] ?? 0) - f * (m[i]![c] ?? 0);
    }
  }
  return [m[0]?.[3] ?? 0, m[1]?.[3] ?? 0, m[2]?.[3] ?? 0];
}

export function assertNonconvergenceFailsClosed(state: "CONVERGED" | "NOT_CONVERGED" | "CHECK_UNDETERMINED"): void {
  if (state === "CONVERGED") return;
  failClosed("equilibrium solver did not converge; last iterate is not accepted capacity");
}
