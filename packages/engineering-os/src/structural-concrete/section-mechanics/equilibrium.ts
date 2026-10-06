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
}): {
  state: "CONVERGED" | "NOT_CONVERGED" | "CHECK_UNDETERMINED";
  strain: RcGeneralizedStrainState | null;
  resultants: RcSectionResultants | null;
  residual: RcEquilibriumResidual | null;
  iterations: number;
  method: "NEWTON_RAPHSON";
  labelledCodeCapacity: false;
} {
  const method = "NEWTON_RAPHSON" as const;
  let eps = 0;
  let phix = 0;
  let phiy = 0;
  const stepE = RC_NUMERICAL_TOLERANCE.jacobianStrainStep;
  const stepK = RC_NUMERICAL_TOLERANCE.jacobianCurvatureStepPerMm;
  for (let iter = 1; iter <= RC_NUMERICAL_TOLERANCE.maxNewtonIterations; iter++) {
    const strain = createStrainState(eps, phix, phiy, input.originMm);
    const resultants = integrateElasticSection({ ...input, strain });
    const residual = sectionEquilibriumResidual(resultants, input.target);
    const ok =
      Math.abs(residual.rN_N) <= RC_NUMERICAL_TOLERANCE.forceN &&
      Math.abs(residual.rMx_Nm) <= RC_NUMERICAL_TOLERANCE.momentNm &&
      Math.abs(residual.rMy_Nm) <= RC_NUMERICAL_TOLERANCE.momentNm;
    if (ok) {
      return { state: "CONVERGED", strain, resultants, residual, iterations: iter, method, labelledCodeCapacity: false };
    }
    const col0 = sectionEquilibriumResidual(integrateElasticSection({ ...input, strain: createStrainState(eps + stepE, phix, phiy, input.originMm) }), input.target);
    const col1 = sectionEquilibriumResidual(integrateElasticSection({ ...input, strain: createStrainState(eps, phix + stepK, phiy, input.originMm) }), input.target);
    const col2 = sectionEquilibriumResidual(integrateElasticSection({ ...input, strain: createStrainState(eps, phix, phiy + stepK, input.originMm) }), input.target);
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
  return { state: "NOT_CONVERGED", strain: null, resultants: null, residual: null, iterations: RC_NUMERICAL_TOLERANCE.maxNewtonIterations, method, labelledCodeCapacity: false };
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
