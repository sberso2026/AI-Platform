import type { RcGeneralizedStrainState, RcPointMm, RcStrainFieldResult } from "@rtb/types";
import {
  DEFAULT_BOND_SLIP_MODEL,
  PLANE_SECTION_ASSUMPTION_EXPLICIT,
  RC_PLANE_SECTION_ASSUMPTION,
  RC_SECTION_MECHANICS_METHOD_VERSION,
  RC_SECTION_SIGN_CONVENTIONS,
} from "@rtb/types";
import { assertFiniteNumber, failClosed } from "./units";

export function createStrainState(
  axialStrain: number,
  curvatureXPerMm: number,
  curvatureYPerMm: number,
  originMm: RcPointMm,
): RcGeneralizedStrainState {
  if (!PLANE_SECTION_ASSUMPTION_EXPLICIT) failClosed("plane-section assumption must be explicit");
  return {
    axialStrain: assertFiniteNumber(axialStrain, "axialStrain"),
    curvatureXPerMm: assertFiniteNumber(curvatureXPerMm, "curvatureX"),
    curvatureYPerMm: assertFiniteNumber(curvatureYPerMm, "curvatureY"),
    originMm: {
      xMm: assertFiniteNumber(originMm.xMm, "strainOrigin.x"),
      yMm: assertFiniteNumber(originMm.yMm, "strainOrigin.y"),
    },
    planeSectionAssumption: RC_PLANE_SECTION_ASSUMPTION,
    universallyValid: false,
  };
}

export function strainAtPoint(state: RcGeneralizedStrainState, point: RcPointMm): number {
  const dx = assertFiniteNumber(point.xMm, "point.x") - state.originMm.xMm;
  const dy = assertFiniteNumber(point.yMm, "point.y") - state.originMm.yMm;
  return state.axialStrain - state.curvatureXPerMm * dy - state.curvatureYPerMm * dx;
}

export function evaluateStrainField(sectionRef: string, state: RcGeneralizedStrainState, point: RcPointMm, provenanceRef: string): RcStrainFieldResult {
  return {
    resultAuthority: "MECHANICS_REFERENCE",
    sectionRef,
    pointMm: point,
    generalizedStrainState: state,
    strain: strainAtPoint(state, point),
    coordinateConvention: RC_SECTION_SIGN_CONVENTIONS,
    methodVersion: RC_SECTION_MECHANICS_METHOD_VERSION,
    assumptionState: RC_PLANE_SECTION_ASSUMPTION,
    provenanceRef,
    labelledCodeCapacity: false,
  };
}

export function barStrainFromSectionKinematics(state: RcGeneralizedStrainState, barPoint: RcPointMm): number {
  if (DEFAULT_BOND_SLIP_MODEL) failClosed("default bond-slip model is forbidden");
  return strainAtPoint(state, barPoint);
}

export function neutralAxisFromStrainState(state: RcGeneralizedStrainState): {
  exists: boolean;
  pointMm: RcPointMm | null;
  directionRad: number | null;
  labelledCodeCapacity: false;
} {
  const mag = Math.hypot(state.curvatureXPerMm, state.curvatureYPerMm);
  if (mag < 1e-18) {
    return { exists: Math.abs(state.axialStrain) < 1e-18, pointMm: mag === 0 && state.axialStrain === 0 ? state.originMm : null, directionRad: null, labelledCodeCapacity: false };
  }
  const nx = -state.curvatureYPerMm / mag;
  const ny = -state.curvatureXPerMm / mag;
  const offset = state.axialStrain / mag;
  return {
    exists: true,
    pointMm: { xMm: state.originMm.xMm + nx * offset, yMm: state.originMm.yMm + ny * offset },
    directionRad: Math.atan2(state.curvatureXPerMm, state.curvatureYPerMm) + Math.PI / 2,
    labelledCodeCapacity: false,
  };
}
