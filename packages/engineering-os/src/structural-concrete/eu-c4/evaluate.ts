import type {
  ConcreteMaterial,
  EuC4MethodId,
  RcGeneralizedStrainState,
  RcSectionGeometryInput,
  RcSectionResultants,
  ReinforcementLayout,
  ReinforcementMaterial,
  StructuralDemandResult,
} from "@rtb/types";
import {
  EU_C1C_CONSTITUTIVE_PARAMETER_VERSION,
  EU_C1C_R1_PARAMETER_VERSION,
  EU_C2_DEFAULT_MESH,
  EU_C2_MAX_BISECTION_ITERATIONS,
  EU_C2_METHOD_IDS,
  EU_C3_METHOD_IDS,
  EU_C3_NUMERICAL_TOLERANCE,
  EU_C4_DEFAULT_ANGLE_COUNT,
  EU_C4_DEFAULT_AXIAL_LEVELS,
  EU_C4_ELLIPTICAL_INTERACTION_ASSUMED_WITHOUT_AUTHORITY,
  EU_C4_FLEXURE_IMPLEMENTATION_VERSION,
  EU_C4_INTERACTION_GENERATION_STRATEGY,
  EU_C4_LINEAR_BIAXIAL_INTERACTION_ASSUMED_WITHOUT_AUTHORITY,
  EU_C4_BRESLER_STYLE_RULE_ASSUMED_WITHOUT_AUTHORITY,
  EU_C4_METHOD_IDS,
  EU_C4_NUMERICAL_TOLERANCE,
  EU_C4_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  EU_C4_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE,
  EU_C4_SUPPORTED_GEOMETRY_TYPES,
  EU_C4_UNGOVERNED_SCALAR_INTERACTION_UTILIZATION,
  TEST_ONLY_NDP_BECOMES_RUNTIME_DEFAULT,
} from "@rtb/types";
import type { EuC1cConstitutiveContext } from "../eu-c1c-constitutive";
import { bindEuC2MaterialIntegrator, evaluateEuC2UniaxialFlexureResistance } from "../eu-c2";
import { evaluateEuC3AxialDomain, evaluateEuC3InteractionPoint } from "../eu-c3";
import { consumeD1cSectionActions } from "../section-mechanics/handoff";
import {
  computeGrossSectionProperties,
  createStrainState,
  solveAxialEquilibrium1d,
  solveSectionEquilibrium,
  strainAtPoint,
} from "../section-mechanics";
import { assertEuC4AiBoundary, assertEuC4ArchitectureFreeze } from "./authority";
import { euC4ResultFingerprint } from "./invalidation";

export type EuC4SolveInput = {
  methodId: EuC4MethodId;
  geometry: RcSectionGeometryInput;
  layout: ReinforcementLayout;
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  context: EuC1cConstitutiveContext;
  targetAxialN: number;
  momentDirectionRad: number;
  demandMyNm?: number;
  resolutionX?: number;
  resolutionY?: number;
  maxBisectionIterations?: number;
  provenanceRef: string;
};

export type EuC4PointSuccess = {
  ok: true;
  methodId: EuC4MethodId;
  axialForceN: number;
  mxNm: number;
  myNm: number;
  momentDirectionRad: number;
  units: { force: "N"; moment: "N.m"; length: "mm"; strain: "m/m"; stress: "MPa" };
  resultants: RcSectionResultants;
  strain: RcGeneralizedStrainState;
  strainFamily: "EPS_CU2_PIVOT" | "EPS_YD_PIVOT" | "C3_PRINCIPAL_ANCHOR";
  equilibriumResidualN: number;
  labelledCodeCapacity: false;
  labelledEn1992Resistance: false;
  labelledColumnDesign: false;
  resistanceAuthorityLayer: "NUMERICALLY_VALIDATED_EU_REFERENCE_METHOD";
  geometryFingerprint: string;
  reinforcementFingerprint: string;
  resultFingerprint: string;
  integrationConfiguration: string;
  solverConfiguration: string;
  materialRuleVersions: readonly string[];
  ndpContextRef: string;
};

export type EuC4Fail = {
  ok: false;
  failReason: string;
  checkState: "CHECK_UNDETERMINED" | "UNSUPPORTED_SCOPE" | "STANDARD_CONTEXT_INCOMPLETE";
  labelledCodeCapacity: false;
};

export type EuC4PointResult = EuC4PointSuccess | EuC4Fail;

export type EuC4SurfacePoint = {
  axialForceN: number;
  mxNm: number;
  myNm: number;
  momentDirectionRad: number;
  radiusNm: number;
};

export type EuC4SurfaceSuccess = {
  ok: true;
  methodId: EuC4MethodId;
  points: readonly EuC4SurfacePoint[];
  supportedAxialDomainN: { nCompressionLimitN: number; nTensionLimitN: number };
  validatedDomain: "RECTANGULAR_BIAXIAL_PMM";
  samplingConfiguration: string;
  resultFingerprint: string;
  validationState: "NUMERICALLY_VALIDATED";
  conformanceState: "INTENDED_PROFILE";
  labelledCodeCapacity: false;
};

export type EuC4DemandCheckResult = {
  checkState: "CHECK_SATISFIED" | "CHECK_NOT_SATISFIED" | "CHECK_UNDETERMINED";
  failReason: string | null;
  demandAxialN: number;
  demandMxNm: number;
  demandMyNm: number;
  resistanceRadiusNm: number | null;
  demandRadiusNm: number;
  labelledEn1992Utilization: false;
  ungovernedScalarInteractionUsed: false;
};

function wrapAngle(theta: number): number {
  const twoPi = 2 * Math.PI;
  return ((theta % twoPi) + twoPi) % twoPi;
}

function principalFamily(theta: number): { axis: "MAJOR_AXIS" | "MINOR_AXIS"; sign: "POSITIVE" | "NEGATIVE" } | null {
  const t = wrapAngle(theta);
  const tol = 1e-8;
  if (t <= tol || Math.abs(t - 2 * Math.PI) <= tol) return { axis: "MAJOR_AXIS", sign: "POSITIVE" };
  if (Math.abs(t - Math.PI) <= tol) return { axis: "MAJOR_AXIS", sign: "NEGATIVE" };
  if (Math.abs(t - Math.PI / 2) <= tol) return { axis: "MINOR_AXIS", sign: "POSITIVE" };
  if (Math.abs(t - (3 * Math.PI) / 2) <= tol) return { axis: "MINOR_AXIS", sign: "NEGATIVE" };
  return null;
}

function ndpRef(context: EuC1cConstitutiveContext): string {
  return [
    context.nationalAnnexRef ?? "",
    context.gamma_c?.value ?? "",
    context.gamma_s?.value ?? "",
    context.alpha_cc?.value ?? "",
    context.gamma_c?.sourceAuthority ?? "",
    context.testOnlyNonConformance === true ? "TEST_ONLY_NON_CONFORMANCE" : "DECLARED",
  ].join("|");
}

function geometryFingerprint(geometry: RcSectionGeometryInput, bounds: { xMin: number; xMax: number; yMin: number; yMax: number }): string {
  return `${geometry.sectionId}|${geometry.geometryVersion}|${geometry.shape}|${bounds.xMax - bounds.xMin}x${bounds.yMax - bounds.yMin}`;
}

function reinforcementFingerprint(layout: ReinforcementLayout): string {
  return [layout.layoutId, ...layout.bars.map((bar) => `${bar.barId}:${bar.xMm}:${bar.yMm}:${bar.areaMm2?.value ?? ""}:${bar.count}`)].join(";");
}

function linspace(lo: number, hi: number, count: number): number[] {
  if (count < 2) return [lo];
  const out: number[] = [];
  for (let i = 0; i < count; i++) out.push(lo + (i / (count - 1)) * (hi - lo));
  return out;
}

function compressionVertex(
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number },
  theta: number,
): { xMm: number; yMm: number } {
  const t = wrapAngle(theta);
  const cx = Math.sin(t);
  const cy = Math.cos(t);
  return {
    xMm: cx >= 0 ? bounds.xMax : bounds.xMin,
    yMm: cy >= 0 ? bounds.yMax : bounds.yMin,
  };
}

function tensionVertex(
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number },
  theta: number,
): { xMm: number; yMm: number } {
  const c = compressionVertex(bounds, theta);
  return {
    xMm: c.xMm === bounds.xMax ? bounds.xMin : bounds.xMax,
    yMm: c.yMm === bounds.yMax ? bounds.yMin : bounds.yMax,
  };
}

function ulsStrain(input: {
  family: "EPS_CU2_PIVOT" | "EPS_YD_PIVOT";
  theta: number;
  kappa: number;
  originMm: { xMm: number; yMm: number };
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number };
  epsCu2: number;
  epsYd: number;
}): RcGeneralizedStrainState {
  const t = wrapAngle(input.theta);
  const cx = Math.sin(t);
  const cy = Math.cos(t);
  const mag = Math.hypot(cx, cy) || 1;
  const phix = input.kappa * (cy / mag);
  const phiy = input.kappa * (cx / mag);
  if (input.family === "EPS_CU2_PIVOT") {
    const c = compressionVertex(input.bounds, t);
    const eps0 = -input.epsCu2 + phix * (c.yMm - input.originMm.yMm) + phiy * (c.xMm - input.originMm.xMm);
    return createStrainState(eps0, phix, phiy, input.originMm);
  }
  const ten = tensionVertex(input.bounds, t);
  const eps0 = input.epsYd + phix * (ten.yMm - input.originMm.yMm) + phiy * (ten.xMm - input.originMm.xMm);
  return createStrainState(eps0, phix, phiy, input.originMm);
}

function assertC4Inputs(input: EuC4SolveInput): EuC4Fail | null {
  assertEuC4AiBoundary();
  assertEuC4ArchitectureFreeze();
  if (EU_C4_ELLIPTICAL_INTERACTION_ASSUMED_WITHOUT_AUTHORITY || EU_C4_LINEAR_BIAXIAL_INTERACTION_ASSUMED_WITHOUT_AUTHORITY || EU_C4_BRESLER_STYLE_RULE_ASSUMED_WITHOUT_AUTHORITY) {
    return { ok: false, failReason: "ungoverned biaxial interaction formula", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  if (TEST_ONLY_NDP_BECOMES_RUNTIME_DEFAULT) {
    return { ok: false, failReason: "test-only NDP must not become a runtime default", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  if (!(EU_C4_METHOD_IDS as readonly string[]).includes(input.methodId)) {
    return { ok: false, failReason: "unknown C4 method", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  if (!(EU_C4_SUPPORTED_GEOMETRY_TYPES as readonly string[]).includes(input.geometry.shape)) {
    return { ok: false, failReason: "unsupported geometry", checkState: "UNSUPPORTED_SCOPE", labelledCodeCapacity: false };
  }
  if (!input.layout.bars.length) {
    return { ok: false, failReason: "C4 P-M-M requires reinforcement", checkState: "UNSUPPORTED_SCOPE", labelledCodeCapacity: false };
  }
  for (const value of [input.geometry.regions[0]?.widthMm, input.geometry.regions[0]?.depthMm, input.concrete.compressiveStrength?.value, input.reinforcement.yieldStrength?.value, input.targetAxialN, input.momentDirectionRad]) {
    if (typeof value === "number" && !Number.isFinite(value)) {
      return { ok: false, failReason: "non-finite input", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
    }
  }
  return null;
}

function buildSuccess(input: EuC4SolveInput, args: {
  resultants: RcSectionResultants;
  strain: RcGeneralizedStrainState;
  residualN: number;
  strainFamily: EuC4PointSuccess["strainFamily"];
  theta: number;
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number };
}): EuC4PointSuccess {
  const geom = geometryFingerprint(input.geometry, args.bounds);
  const reoFp = reinforcementFingerprint(input.layout);
  const integrationConfiguration = `CARTESIAN_CELL_PLUS_BAR_POINTS:${input.resolutionX ?? EU_C2_DEFAULT_MESH.resolutionX}x${input.resolutionY ?? EU_C2_DEFAULT_MESH.resolutionY}`;
  const solverConfiguration = `D1E1_1D_KAPPA_BISECTION_OR_C3_PRINCIPAL:${args.strainFamily}:N=${input.targetAxialN}:theta=${args.theta}`;
  const ndpContextRef = ndpRef(input.context);
  return {
    ok: true,
    methodId: input.methodId,
    axialForceN: args.resultants.N_N,
    mxNm: args.resultants.Mx_Nm,
    myNm: args.resultants.My_Nm,
    momentDirectionRad: args.theta,
    units: { force: "N", moment: "N.m", length: "mm", strain: "m/m", stress: "MPa" },
    resultants: args.resultants,
    strain: args.strain,
    strainFamily: args.strainFamily,
    equilibriumResidualN: args.residualN,
    labelledCodeCapacity: false,
    labelledEn1992Resistance: false,
    labelledColumnDesign: false,
    resistanceAuthorityLayer: "NUMERICALLY_VALIDATED_EU_REFERENCE_METHOD",
    geometryFingerprint: geom,
    reinforcementFingerprint: reoFp,
    integrationConfiguration,
    solverConfiguration,
    materialRuleVersions: [EU_C1C_CONSTITUTIVE_PARAMETER_VERSION, EU_C1C_R1_PARAMETER_VERSION, EU_C4_FLEXURE_IMPLEMENTATION_VERSION],
    ndpContextRef,
    resultFingerprint: euC4ResultFingerprint({
      methodId: input.methodId,
      methodVersion: EU_C4_FLEXURE_IMPLEMENTATION_VERSION,
      geometryFingerprint: geom,
      reinforcementFingerprint: reoFp,
      constitutiveParameterVersion: EU_C1C_CONSTITUTIVE_PARAMETER_VERSION,
      r1ParameterVersion: EU_C1C_R1_PARAMETER_VERSION,
      ndpContextRef,
      integrationConfiguration,
      solverConfiguration,
      curveGenerationConfiguration: EU_C4_INTERACTION_GENERATION_STRATEGY,
      standardProfile: "EN1992_INTENDED_PROFILE",
      targetAxialN: input.targetAxialN,
      momentDirectionRad: args.theta,
    }),
  };
}

function tryKappaFamily(input: EuC4SolveInput, family: "EPS_CU2_PIVOT" | "EPS_YD_PIVOT", domain: {
  originMm: { xMm: number; yMm: number };
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number };
  epsCu2: number;
  epsYd: number;
}): EuC4PointSuccess | null {
  const integrate = bindEuC2MaterialIntegrator(input);
  const span = Math.max(domain.bounds.xMax - domain.bounds.xMin, domain.bounds.yMax - domain.bounds.yMin);
  const kappaHigh = (20 * domain.epsCu2) / Math.max(span, 1);
  const strainFromParam = (kappa: number) =>
    ulsStrain({
      family,
      theta: input.momentDirectionRad,
      kappa,
      originMm: domain.originMm,
      bounds: domain.bounds,
      epsCu2: domain.epsCu2,
      epsYd: domain.epsYd,
    });
  const residualN = (kappa: number): number | null => {
    try {
      const n = integrate(strainFromParam(kappa)).N_N;
      return Number.isFinite(n) ? n - input.targetAxialN : null;
    } catch {
      return null;
    }
  };
  let lo = 1e-10;
  let hi = kappaHigh;
  let nLo = residualN(lo);
  let nHi = residualN(hi);
  if (nLo == null || nHi == null) return null;
  if (nLo * nHi > 0) {
    const samples = 32;
    for (let i = 1; i < samples; i++) {
      const k = lo + (i / samples) * (kappaHigh - lo);
      const nMid = residualN(k);
      if (nMid == null) continue;
      if (nLo * nMid <= 0) {
        hi = k;
        nHi = nMid;
        break;
      }
      lo = k;
      nLo = nMid;
    }
  }
  if (nLo == null || nHi == null || nLo * nHi > 0) return null;
  const solved = solveAxialEquilibrium1d({
    integrate,
    strainFromParam,
    targetN: input.targetAxialN,
    paramLow: lo,
    paramHigh: hi,
    forceTolN: EU_C4_NUMERICAL_TOLERANCE.equilibriumResidualN,
    maxIterations: input.maxBisectionIterations ?? EU_C2_MAX_BISECTION_ITERATIONS,
  });
  if (solved.state !== "CONVERGED" || !solved.resultants || !solved.strain || !solved.residual) return null;
  if (family === "EPS_YD_PIVOT") {
    const c = compressionVertex(domain.bounds, input.momentDirectionRad);
    if (strainAtPoint(solved.strain, c) < -domain.epsCu2 - 1e-9) return null;
  }
  return buildSuccess(input, {
    resultants: solved.resultants,
    strain: solved.strain,
    residualN: solved.residual.rN_N,
    strainFamily: family,
    theta: wrapAngle(input.momentDirectionRad),
    bounds: domain.bounds,
  });
}

export function evaluateEuC4InteractionPoint(input: EuC4SolveInput): EuC4PointResult {
  const blocked = assertC4Inputs(input);
  if (blocked) return blocked;
  const domain = evaluateEuC3AxialDomain({
    methodId: EU_C3_METHOD_IDS[0],
    axis: "MAJOR_AXIS",
    momentSign: "POSITIVE",
    geometry: input.geometry,
    layout: input.layout,
    concrete: input.concrete,
    reinforcement: input.reinforcement,
    context: input.context,
    resolutionX: input.resolutionX,
    resolutionY: input.resolutionY,
    provenanceRef: input.provenanceRef,
  });
  if (!domain.ok) return domain;
  const margin = Math.max(EU_C3_NUMERICAL_TOLERANCE.equilibriumResidualN, 0.002 * Math.abs(domain.nCompressionLimitN));
  if (input.targetAxialN < domain.nCompressionLimitN - margin || input.targetAxialN > domain.nTensionLimitN + margin) {
    return { ok: false, failReason: "axial target outside supported C3 mechanics domain", checkState: "UNSUPPORTED_SCOPE", labelledCodeCapacity: false };
  }
  const principal = principalFamily(input.momentDirectionRad);
  if (principal) {
    const c3 = evaluateEuC3InteractionPoint({
      methodId: principal.axis === "MINOR_AXIS" ? EU_C3_METHOD_IDS[1] : EU_C3_METHOD_IDS[0],
      axis: principal.axis,
      momentSign: principal.sign,
      geometry: input.geometry,
      layout: input.layout,
      concrete: input.concrete,
      reinforcement: input.reinforcement,
      context: input.context,
      targetAxialN: input.targetAxialN,
      resolutionX: input.resolutionX,
      resolutionY: input.resolutionY,
      maxBisectionIterations: input.maxBisectionIterations,
      provenanceRef: input.provenanceRef,
    });
    if (!c3.ok) return c3;
    return buildSuccess(input, {
      resultants: c3.resultants,
      strain: c3.strain,
      residualN: c3.equilibriumResidualN,
      strainFamily: "C3_PRINCIPAL_ANCHOR",
      theta: wrapAngle(input.momentDirectionRad),
      bounds: domain.bounds,
    });
  }
  const cu2 = tryKappaFamily(input, "EPS_CU2_PIVOT", domain);
  if (cu2) return cu2;
  const yd = tryKappaFamily(input, "EPS_YD_PIVOT", domain);
  if (yd) return yd;
  return { ok: false, failReason: "equilibrium did not converge", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
}

export function evaluateEuC4InteractionSurface(input: Omit<EuC4SolveInput, "targetAxialN" | "momentDirectionRad"> & {
  axialLevels?: number;
  angleCount?: number;
}): EuC4SurfaceSuccess | EuC4Fail {
  const domain = evaluateEuC3AxialDomain({
    methodId: EU_C3_METHOD_IDS[0],
    axis: "MAJOR_AXIS",
    momentSign: "POSITIVE",
    geometry: input.geometry,
    layout: input.layout,
    concrete: input.concrete,
    reinforcement: input.reinforcement,
    context: input.context,
    resolutionX: input.resolutionX,
    resolutionY: input.resolutionY,
    provenanceRef: input.provenanceRef,
  });
  if (!domain.ok) return domain;
  const nAxial = input.axialLevels ?? EU_C4_DEFAULT_AXIAL_LEVELS;
  const nAng = input.angleCount ?? EU_C4_DEFAULT_ANGLE_COUNT;
  const lo = domain.nCompressionLimitN * 0.75;
  const hi = domain.nTensionLimitN * 0.75;
  const axials = linspace(lo, hi, nAxial);
  if (lo < 0 && hi > 0 && !axials.some((n) => Math.abs(n) <= 1)) axials.push(0);
  axials.sort((a, b) => a - b);
  const angles = linspace(0, 2 * Math.PI, nAng + 1).slice(0, nAng);
  const points: EuC4SurfacePoint[] = [];
  for (const targetAxialN of axials) {
    for (const momentDirectionRad of angles) {
      const solved = evaluateEuC4InteractionPoint({ ...input, methodId: input.methodId, targetAxialN, momentDirectionRad });
      if (!solved.ok) continue;
      points.push({
        axialForceN: targetAxialN,
        mxNm: solved.mxNm,
        myNm: solved.myNm,
        momentDirectionRad: solved.momentDirectionRad,
        radiusNm: Math.hypot(solved.mxNm, solved.myNm),
      });
    }
  }
  if (points.length < 8) {
    return { ok: false, failReason: "interaction surface under-resolved", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  const fingerprint = euC4ResultFingerprint({
    methodId: input.methodId,
    methodVersion: EU_C4_FLEXURE_IMPLEMENTATION_VERSION,
    axialLevels: nAxial,
    angleCount: nAng,
    geometryFingerprint: geometryFingerprint(input.geometry, domain.bounds),
    reinforcementFingerprint: reinforcementFingerprint(input.layout),
    constitutiveParameterVersion: EU_C1C_CONSTITUTIVE_PARAMETER_VERSION,
    ndpContextRef: ndpRef(input.context),
    curveGenerationConfiguration: EU_C4_INTERACTION_GENERATION_STRATEGY,
    integrationConfiguration: `CARTESIAN_CELL_PLUS_BAR_POINTS:${input.resolutionX ?? EU_C2_DEFAULT_MESH.resolutionX}x${input.resolutionY ?? EU_C2_DEFAULT_MESH.resolutionY}`,
    solverConfiguration: "D1E1_1D_KAPPA_BISECTION_OR_C3_PRINCIPAL",
    standardProfile: "EN1992_INTENDED_PROFILE",
  });
  return {
    ok: true,
    methodId: input.methodId,
    points,
    supportedAxialDomainN: { nCompressionLimitN: domain.nCompressionLimitN, nTensionLimitN: domain.nTensionLimitN },
    validatedDomain: "RECTANGULAR_BIAXIAL_PMM",
    samplingConfiguration: `${EU_C4_INTERACTION_GENERATION_STRATEGY}:${nAxial}x${nAng}`,
    resultFingerprint: fingerprint,
    validationState: "NUMERICALLY_VALIDATED",
    conformanceState: "INTENDED_PROFILE",
    labelledCodeCapacity: false,
  };
}

export function interpolateEuC4SurfaceRadius(
  points: readonly EuC4SurfacePoint[],
  axialForceN: number,
  momentDirectionRad: number,
): { radiusNm: number; conservativeRadiusNm: number } | null {
  if (!Number.isFinite(axialForceN) || !Number.isFinite(momentDirectionRad) || points.length < 4) return null;
  const theta = wrapAngle(momentDirectionRad);
  const levels = [...new Set(points.map((p) => p.axialForceN))].sort((a, b) => a - b);
  if (axialForceN < (levels[0] ?? 0) || axialForceN > (levels[levels.length - 1] ?? 0)) return null;
  let n0 = levels[0] ?? 0;
  let n1 = levels[0] ?? 0;
  for (let i = 0; i < levels.length - 1; i++) {
    const a = levels[i];
    const b = levels[i + 1];
    if (a == null || b == null) continue;
    if (axialForceN >= a && axialForceN <= b) {
      n0 = a;
      n1 = b;
      break;
    }
  }
  const ring = (n: number) =>
    points.filter((p) => Math.abs(p.axialForceN - n) <= 1).sort((a, b) => a.momentDirectionRad - b.momentDirectionRad);
  const rAt = (ringPts: EuC4SurfacePoint[], th: number): number | null => {
    if (ringPts.length < 2) return null;
    const extended = [...ringPts, { ...ringPts[0]!, momentDirectionRad: (ringPts[0]?.momentDirectionRad ?? 0) + 2 * Math.PI }];
    for (let i = 0; i < extended.length - 1; i++) {
      const a = extended[i];
      const b = extended[i + 1];
      if (!a || !b) continue;
      const aTh = a.momentDirectionRad;
      let bTh = b.momentDirectionRad;
      let tq = th;
      if (bTh < aTh) bTh += 2 * Math.PI;
      if (tq < aTh) tq += 2 * Math.PI;
      if (tq >= aTh && tq <= bTh) {
        const t = bTh === aTh ? 0 : (tq - aTh) / (bTh - aTh);
        return a.radiusNm + t * (b.radiusNm - a.radiusNm);
      }
    }
    return null;
  };
  const r00 = rAt(ring(n0), theta);
  const r10 = rAt(ring(n1), theta);
  if (r00 == null || r10 == null) return null;
  const tn = n1 === n0 ? 0 : (axialForceN - n0) / (n1 - n0);
  const linear = r00 + tn * (r10 - r00);
  const conservative = Math.min(r00, r10);
  return { radiusNm: linear, conservativeRadiusNm: conservative };
}

export function evaluateEuC4DemandPointCheck(input: EuC4SolveInput & { demand: StructuralDemandResult }): EuC4DemandCheckResult {
  if (EU_C4_UNGOVERNED_SCALAR_INTERACTION_UTILIZATION) {
    return { checkState: "CHECK_UNDETERMINED", failReason: "ungoverned scalar interaction", demandAxialN: 0, demandMxNm: 0, demandMyNm: 0, resistanceRadiusNm: null, demandRadiusNm: 0, labelledEn1992Utilization: false, ungovernedScalarInteractionUsed: false };
  }
  const actions = consumeD1cSectionActions(input.demand);
  const demandMxNm = actions.Mx_Nm;
  const demandMyNm = Number.isFinite(input.demandMyNm) ? (input.demandMyNm as number) : 0;
  const demandAxialN = actions.N_N;
  const demandRadiusNm = Math.hypot(demandMxNm, demandMyNm);
  const theta = demandRadiusNm < 1e-9 ? 0 : Math.atan2(demandMyNm, demandMxNm);
  const solved = evaluateEuC4InteractionPoint({ ...input, targetAxialN: demandAxialN, momentDirectionRad: theta });
  if (!solved.ok) {
    return {
      checkState: solved.checkState === "UNSUPPORTED_SCOPE" ? "CHECK_UNDETERMINED" : "CHECK_UNDETERMINED",
      failReason: solved.failReason,
      demandAxialN,
      demandMxNm,
      demandMyNm,
      resistanceRadiusNm: null,
      demandRadiusNm,
      labelledEn1992Utilization: false,
      ungovernedScalarInteractionUsed: false,
    };
  }
  const resistanceRadiusNm = Math.hypot(solved.mxNm, solved.myNm);
  const band = EU_C4_NUMERICAL_TOLERANCE.boundaryUncertaintyRel * resistanceRadiusNm + EU_C4_NUMERICAL_TOLERANCE.interpolationAbsNm * 0.05;
  if (demandRadiusNm <= resistanceRadiusNm - band) {
    return { checkState: "CHECK_SATISFIED", failReason: null, demandAxialN, demandMxNm, demandMyNm, resistanceRadiusNm, demandRadiusNm, labelledEn1992Utilization: false, ungovernedScalarInteractionUsed: false };
  }
  if (demandRadiusNm >= resistanceRadiusNm + band) {
    return { checkState: "CHECK_NOT_SATISFIED", failReason: null, demandAxialN, demandMxNm, demandMyNm, resistanceRadiusNm, demandRadiusNm, labelledEn1992Utilization: false, ungovernedScalarInteractionUsed: false };
  }
  return { checkState: "CHECK_UNDETERMINED", failReason: "boundary uncertainty", demandAxialN, demandMxNm, demandMyNm, resistanceRadiusNm, demandRadiusNm, labelledEn1992Utilization: false, ungovernedScalarInteractionUsed: false };
}

export function reproduceC3Principal(input: Omit<EuC4SolveInput, "momentDirectionRad"> & { axis: "MAJOR_AXIS" | "MINOR_AXIS"; sign?: "POSITIVE" | "NEGATIVE" }): { c3Nm: number; c4Nm: number } | EuC4Fail {
  const theta = input.axis === "MINOR_AXIS"
    ? (input.sign === "NEGATIVE" ? (3 * Math.PI) / 2 : Math.PI / 2)
    : (input.sign === "NEGATIVE" ? Math.PI : 0);
  const c3 = evaluateEuC3InteractionPoint({
    methodId: input.axis === "MINOR_AXIS" ? EU_C3_METHOD_IDS[1] : EU_C3_METHOD_IDS[0],
    axis: input.axis,
    momentSign: input.sign ?? "POSITIVE",
    geometry: input.geometry,
    layout: input.layout,
    concrete: input.concrete,
    reinforcement: input.reinforcement,
    context: input.context,
    targetAxialN: input.targetAxialN,
    resolutionX: input.resolutionX,
    resolutionY: input.resolutionY,
    maxBisectionIterations: input.maxBisectionIterations,
    provenanceRef: input.provenanceRef,
  });
  if (!c3.ok) return { ok: false, failReason: c3.failReason, checkState: c3.checkState, labelledCodeCapacity: false };
  const c4 = evaluateEuC4InteractionPoint({ ...input, methodId: input.methodId, momentDirectionRad: theta });
  if (!c4.ok) return c4;
  const c4Nm = input.axis === "MINOR_AXIS" ? c4.myNm : c4.mxNm;
  return { c3Nm: c3.resistanceMomentNm, c4Nm };
}

export function reproduceC2PureFlexure(input: Omit<EuC4SolveInput, "targetAxialN" | "momentDirectionRad"> & { axis: "MAJOR_AXIS" | "MINOR_AXIS" }): { c2Nm: number; c4Nm: number } | EuC4Fail {
  const c2 = evaluateEuC2UniaxialFlexureResistance({
    methodId: input.axis === "MINOR_AXIS" ? EU_C2_METHOD_IDS[1] : EU_C2_METHOD_IDS[0],
    axis: input.axis,
    momentSign: "POSITIVE",
    geometry: input.geometry,
    layout: input.layout,
    concrete: input.concrete,
    reinforcement: input.reinforcement,
    context: input.context,
    resolutionX: input.resolutionX,
    resolutionY: input.resolutionY,
    maxBisectionIterations: input.maxBisectionIterations,
    provenanceRef: input.provenanceRef,
  });
  if (!c2.ok) return { ok: false, failReason: c2.failReason, checkState: c2.checkState, labelledCodeCapacity: false };
  const c4 = evaluateEuC4InteractionPoint({
    ...input,
    methodId: input.methodId,
    targetAxialN: 0,
    momentDirectionRad: input.axis === "MINOR_AXIS" ? Math.PI / 2 : 0,
  });
  if (!c4.ok) return c4;
  return { c2Nm: c2.resistanceMomentNm, c4Nm: input.axis === "MINOR_AXIS" ? c4.myNm : c4.mxNm };
}

export function evaluateEuC4CoupledDemandSolve(input: EuC4SolveInput & { mxNm: number; myNm: number; initial?: { axialStrain: number; curvatureXPerMm: number; curvatureYPerMm: number } }) {
  const integrate = bindEuC2MaterialIntegrator(input);
  const props = computeGrossSectionProperties(input.geometry);
  return solveSectionEquilibrium({
    originMm: { xMm: props.centroidXMm, yMm: props.centroidYMm },
    target: { N_N: input.targetAxialN, Mx_Nm: input.mxNm, My_Nm: input.myNm },
    integrate,
    forceTolN: EU_C4_NUMERICAL_TOLERANCE.equilibriumResidualN,
    momentTolNm: EU_C4_NUMERICAL_TOLERANCE.equilibriumResidualNm,
    maxIterations: input.maxBisectionIterations,
    initial: input.initial,
  });
}

export function assertEuC4OptimizerRejectsUndetermined(checkState: EuC4DemandCheckResult["checkState"]): void {
  if (EU_C4_OPTIMIZATION_ACCEPTS_UNDETERMINED) throw new Error("C4 optimizer cannot accept undetermined");
  if (checkState === "CHECK_UNDETERMINED") throw new Error("EU C4 optimizer cannot accept CHECK_UNDETERMINED as design-valid");
}

export function assertEuC4ParetoRejectsUndetermined(checkState: EuC4DemandCheckResult["checkState"]): void {
  if (EU_C4_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE) throw new Error("C4 Pareto cannot accept undetermined as feasible");
  if (checkState === "CHECK_UNDETERMINED") throw new Error("Pareto cannot rank CHECK_UNDETERMINED as C4-feasible");
}

export function validateEuC4SurfaceTopology(points: readonly EuC4SurfacePoint[]): boolean {
  const levels = [...new Set(points.map((p) => p.axialForceN))];
  for (const n of levels) {
    const ring = points.filter((p) => Math.abs(p.axialForceN - n) <= 1).sort((a, b) => a.momentDirectionRad - b.momentDirectionRad);
    if (ring.length < 3) continue;
    for (const p of ring) if (!(p.radiusNm >= 0) || !Number.isFinite(p.radiusNm)) return false;
    let area = 0;
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i];
      const b = ring[(i + 1) % ring.length];
      if (!a || !b) continue;
      area += a.mxNm * b.myNm - b.mxNm * a.myNm;
    }
    if (area < 0) return false;
  }
  return true;
}
