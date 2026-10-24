import type {
  ConcreteMaterial,
  EuC2MethodId,
  EuC2MomentSign,
  EuC3MethodId,
  EuFlexureAxis,
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
  EU_C3_DEFAULT_CURVE_POINTS,
  EU_C3_FLEXURE_IMPLEMENTATION_VERSION,
  EU_C3_INTERACTION_GENERATION_STRATEGY,
  EU_C3_LINEAR_INTERACTION_ASSUMED_WITHOUT_AUTHORITY,
  EU_C3_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  EU_C3_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE,
  EU_C3_METHOD_IDS,
  EU_C3_NUMERICAL_TOLERANCE,
  EU_C3_SCAN_SAMPLES,
  EU_C3_SUPPORTED_GEOMETRY_TYPES,
  TEST_ONLY_NDP_BECOMES_RUNTIME_DEFAULT,
} from "@rtb/types";
import type { EuC1cConstitutiveContext } from "../eu-c1c-constitutive";
import { evaluateEuC1ConcreteStrainLimits, evaluateEuC1ReinforcementResponse } from "../eu-c1c-constitutive";
import {
  bindEuC2MaterialIntegrator,
  euC2MomentSignFromDemand,
  euC2RectangularBounds,
  euC2UlsStrainFromNa,
  evaluateEuC2UniaxialFlexureResistance,
} from "../eu-c2";
import { consumeD1cSectionActions } from "../section-mechanics/handoff";
import {
  computeGrossSectionProperties,
  createStrainState,
  solveAxialEquilibrium1d,
  strainAtPoint,
} from "../section-mechanics";
import { assertEuC3AiBoundary, assertEuC3ArchitectureFreeze } from "./authority";
import { euC3ResultFingerprint } from "./invalidation";

export type EuC3SolveInput = {
  methodId: EuC3MethodId;
  axis: EuFlexureAxis;
  momentSign: EuC2MomentSign;
  geometry: RcSectionGeometryInput;
  layout: ReinforcementLayout;
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  context: EuC1cConstitutiveContext;
  targetAxialN: number;
  resolutionX?: number;
  resolutionY?: number;
  maxBisectionIterations?: number;
  provenanceRef: string;
};

export type EuC3PointSuccess = {
  ok: true;
  methodId: EuC3MethodId;
  axis: EuFlexureAxis;
  momentSign: EuC2MomentSign;
  axialForceN: number;
  resistanceMomentNm: number;
  units: { force: "N"; moment: "N.m"; length: "mm"; strain: "m/m"; stress: "MPa" };
  resultants: RcSectionResultants;
  strain: RcGeneralizedStrainState;
  strainFamily: "EPS_CU2_PIVOT" | "EPS_YD_PIVOT" | "UNIFORM_COMPRESSION" | "UNIFORM_TENSION";
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
  curveGenerationConfiguration: string;
  materialRuleVersions: readonly string[];
  ndpContextRef: string;
};

export type EuC3Fail = {
  ok: false;
  failReason: string;
  checkState: "CHECK_UNDETERMINED" | "UNSUPPORTED_SCOPE" | "STANDARD_CONTEXT_INCOMPLETE";
  labelledCodeCapacity: false;
};

export type EuC3PointResult = EuC3PointSuccess | EuC3Fail;

export type EuC3CurvePoint = {
  axialForceN: number;
  resistanceMomentNm: number;
  strainFamily: EuC3PointSuccess["strainFamily"];
};

export type EuC3CurveSuccess = {
  ok: true;
  methodId: EuC3MethodId;
  axis: EuFlexureAxis;
  momentSign: EuC2MomentSign;
  points: readonly EuC3CurvePoint[];
  supportedAxialDomainN: { nCompressionLimitN: number; nTensionLimitN: number };
  validatedDomain: "RECTANGULAR_UNIAXIAL_NM";
  samplingConfiguration: string;
  resultFingerprint: string;
  validationState: "NUMERICALLY_VALIDATED";
  conformanceState: "INTENDED_PROFILE";
  labelledCodeCapacity: false;
};

export type EuC3CurveResult = EuC3CurveSuccess | EuC3Fail;

export type EuC3DemandCheckResult = {
  checkState: "CHECK_SATISFIED" | "CHECK_NOT_SATISFIED" | "CHECK_UNDETERMINED";
  failReason: string | null;
  demandAxialN: number;
  demandMomentNm: number;
  resistanceMomentNm: number | null;
  utilization: number | null;
  labelledEn1992Utilization: false;
  linearInteractionUsed: false;
};

function c2MethodId(methodId: EuC3MethodId): EuC2MethodId {
  return methodId.endsWith("MINOR") ? EU_C2_METHOD_IDS[1] : EU_C2_METHOD_IDS[0];
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

function tensionPivotStrain(input: {
  axis: EuFlexureAxis;
  momentSign: EuC2MomentSign;
  originMm: { xMm: number; yMm: number };
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number };
  naCoordMm: number;
  epsYd: number;
}): RcGeneralizedStrainState {
  if (input.axis === "MAJOR_AXIS") {
    const yTens = input.momentSign === "POSITIVE" ? input.bounds.yMin : input.bounds.yMax;
    const denom = input.naCoordMm - yTens;
    if (!(Math.abs(denom) > 1e-9)) throw new Error("tension-pivot parameter coincides with tension face");
    const phix = input.epsYd / denom;
    return createStrainState(phix * (input.naCoordMm - input.originMm.yMm), phix, 0, input.originMm);
  }
  const xTens = input.momentSign === "POSITIVE" ? input.bounds.xMin : input.bounds.xMax;
  const denom = input.naCoordMm - xTens;
  if (!(Math.abs(denom) > 1e-9)) throw new Error("tension-pivot parameter coincides with tension face");
  const phiy = input.epsYd / denom;
  return createStrainState(phiy * (input.naCoordMm - input.originMm.xMm), 0, phiy, input.originMm);
}

function scanAxis(bounds: { xMin: number; xMax: number; yMin: number; yMax: number }, axis: EuFlexureAxis): { min: number; max: number; span: number } {
  const min = axis === "MAJOR_AXIS" ? bounds.yMin : bounds.xMin;
  const max = axis === "MAJOR_AXIS" ? bounds.yMax : bounds.xMax;
  return { min, max, span: max - min };
}

function linspace(lo: number, hi: number, count: number): number[] {
  if (count < 2) return [lo];
  const out: number[] = [];
  for (let i = 0; i < count; i++) out.push(lo + (i / (count - 1)) * (hi - lo));
  return out;
}

function findBracket(
  samples: readonly { param: number; n: number }[],
  targetN: number,
): { paramLow: number; paramHigh: number } | null {
  for (let i = 0; i < samples.length - 1; i++) {
    const a = samples[i];
    const b = samples[i + 1];
    if (!a || !b || !Number.isFinite(a.n) || !Number.isFinite(b.n)) continue;
    if ((a.n - targetN) * (b.n - targetN) <= 0) {
      return { paramLow: Math.min(a.param, b.param), paramHigh: Math.max(a.param, b.param) };
    }
  }
  return null;
}

function physicalCu2Window(
  axis: EuFlexureAxis,
  momentSign: EuC2MomentSign,
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number },
): { interiorLo: number; interiorHi: number; expandedLo: number; expandedHi: number; compressionFace: number } {
  const { min, max, span } = scanAxis(bounds, axis);
  const edge = 0.004 * span;
  const compressionFace = momentSign === "POSITIVE" ? max : min;
  const interiorLo = min + edge;
  const interiorHi = max - edge;
  if (momentSign === "POSITIVE") {
    return { interiorLo, interiorHi, expandedLo: min - 3 * span, expandedHi: max - edge, compressionFace };
  }
  return { interiorLo, interiorHi, expandedLo: min + edge, expandedHi: max + 3 * span, compressionFace };
}

function physicalTensionWindow(
  axis: EuFlexureAxis,
  momentSign: EuC2MomentSign,
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number },
): { lo: number; hi: number } {
  const { min, max, span } = scanAxis(bounds, axis);
  const edge = 0.004 * span;
  if (momentSign === "POSITIVE") return { lo: min + edge, hi: max + 3 * span };
  return { lo: min - 3 * span, hi: max - edge };
}

function tryAxialBracket(input: {
  integrate: (strain: RcGeneralizedStrainState) => RcSectionResultants;
  strainFromParam: (param: number) => RcGeneralizedStrainState;
  targetN: number;
  paramLow: number;
  paramHigh: number;
  forceTolN: number;
  maxIterations: number;
}) {
  const solved = solveAxialEquilibrium1d(input);
  if (solved.state === "CONVERGED" && solved.resultants && solved.strain && solved.residual) return solved;
  return null;
}

function assertC3Inputs(input: EuC3SolveInput): EuC3Fail | null {
  assertEuC3AiBoundary();
  assertEuC3ArchitectureFreeze();
  if (TEST_ONLY_NDP_BECOMES_RUNTIME_DEFAULT) {
    return { ok: false, failReason: "test-only NDP must not become a runtime default", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  if (!(EU_C3_METHOD_IDS as readonly string[]).includes(input.methodId)) {
    return { ok: false, failReason: "unknown C3 method", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  const expectedAxis = input.methodId.endsWith("MINOR") ? "MINOR_AXIS" : "MAJOR_AXIS";
  if (input.axis !== expectedAxis) {
    return { ok: false, failReason: "method axis mismatch", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  if (!(EU_C3_SUPPORTED_GEOMETRY_TYPES as readonly string[]).includes(input.geometry.shape)) {
    return { ok: false, failReason: "unsupported geometry", checkState: "UNSUPPORTED_SCOPE", labelledCodeCapacity: false };
  }
  if (!input.layout.bars.length) {
    return { ok: false, failReason: "C3 N-M requires reinforcement", checkState: "UNSUPPORTED_SCOPE", labelledCodeCapacity: false };
  }
  for (const value of [input.geometry.regions[0]?.widthMm, input.geometry.regions[0]?.depthMm, input.concrete.compressiveStrength?.value, input.reinforcement.yieldStrength?.value, input.targetAxialN]) {
    if (typeof value === "number" && !Number.isFinite(value)) {
      return { ok: false, failReason: "non-finite input", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
    }
  }
  return null;
}

export function evaluateEuC3AxialDomain(input: Omit<EuC3SolveInput, "targetAxialN" | "methodId"> & { methodId?: EuC3MethodId }): EuC3Fail | {
  ok: true;
  nCompressionLimitN: number;
  nTensionLimitN: number;
  epsCu2: number;
  epsYd: number;
  originMm: { xMm: number; yMm: number };
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number };
} {
  const blocked = assertC3Inputs({
    ...input,
    methodId: input.methodId ?? (input.axis === "MINOR_AXIS" ? EU_C3_METHOD_IDS[1] : EU_C3_METHOD_IDS[0]),
    targetAxialN: 0,
  });
  if (blocked) return blocked;
  const strainLimits = evaluateEuC1ConcreteStrainLimits({ concrete: input.concrete, context: input.context });
  if (!strainLimits.ok) {
    return { ok: false, failReason: strainLimits.failReason ?? "strain limits unresolved", checkState: strainLimits.checkState === "UNSUPPORTED_SCOPE" ? "UNSUPPORTED_SCOPE" : "STANDARD_CONTEXT_INCOMPLETE", labelledCodeCapacity: false };
  }
  const reo = evaluateEuC1ReinforcementResponse({ reinforcement: input.reinforcement, kernelStrain: 0, context: input.context });
  if (!reo.ok) {
    return { ok: false, failReason: reo.failReason ?? "reinforcement response unresolved", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  const props = computeGrossSectionProperties(input.geometry);
  const originMm = { xMm: props.centroidXMm, yMm: props.centroidYMm };
  const bounds = euC2RectangularBounds(input.geometry);
  const integrate = bindEuC2MaterialIntegrator(input);
  const nCompressionLimitN = integrate(createStrainState(-strainLimits.outputs.epsCu2, 0, 0, originMm)).N_N;
  const epsYd = reo.outputs.fydMPa / reo.outputs.esMPa;
  const nTensionLimitN = integrate(createStrainState(epsYd, 0, 0, originMm)).N_N;
  if (!Number.isFinite(nCompressionLimitN) || !Number.isFinite(nTensionLimitN)) {
    return { ok: false, failReason: "axial anchors are not finite", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  return { ok: true, nCompressionLimitN, nTensionLimitN, epsCu2: strainLimits.outputs.epsCu2, epsYd, originMm, bounds };
}

export function evaluateEuC3InteractionPoint(input: EuC3SolveInput): EuC3PointResult {
  const blocked = assertC3Inputs(input);
  if (blocked) return blocked;
  const domain = evaluateEuC3AxialDomain(input);
  if (!domain.ok) return domain;
  const margin = Math.max(EU_C3_NUMERICAL_TOLERANCE.equilibriumResidualN, 0.002 * Math.abs(domain.nCompressionLimitN));
  if (input.targetAxialN < domain.nCompressionLimitN - margin || input.targetAxialN > domain.nTensionLimitN + margin) {
    return { ok: false, failReason: "axial target outside supported mechanics domain", checkState: "UNSUPPORTED_SCOPE", labelledCodeCapacity: false };
  }
  const integrate = bindEuC2MaterialIntegrator(input);
  const window = physicalCu2Window(input.axis, input.momentSign, domain.bounds);
  const maxIterations = input.maxBisectionIterations ?? EU_C2_MAX_BISECTION_ITERATIONS;
  const forceTolN = EU_C3_NUMERICAL_TOLERANCE.equilibriumResidualN;
  const cu2FromNa = (na: number) =>
    euC2UlsStrainFromNa({
      axis: input.axis,
      momentSign: input.momentSign,
      originMm: domain.originMm,
      bounds: domain.bounds,
      naCoordMm: na,
      epsCu2: domain.epsCu2,
    });
  const ydFromNa = (na: number) =>
    tensionPivotStrain({
      axis: input.axis,
      momentSign: input.momentSign,
      originMm: domain.originMm,
      bounds: domain.bounds,
      naCoordMm: na,
      epsYd: domain.epsYd,
    });
  const cu2Interior = tryAxialBracket({
    integrate,
    strainFromParam: cu2FromNa,
    targetN: input.targetAxialN,
    paramLow: window.interiorLo,
    paramHigh: window.interiorHi,
    forceTolN,
    maxIterations,
  });
  const cu2Expanded = cu2Interior ?? tryAxialBracket({
    integrate,
    strainFromParam: cu2FromNa,
    targetN: input.targetAxialN,
    paramLow: window.expandedLo,
    paramHigh: window.expandedHi,
    forceTolN,
    maxIterations,
  });
  const cu2Scanned = cu2Expanded ?? (() => {
    const params = linspace(window.expandedLo, window.expandedHi, EU_C3_SCAN_SAMPLES).filter(
      (na) => Math.abs(na - window.compressionFace) > 1e-4 * (window.interiorHi - window.interiorLo + 1),
    );
    const samples = params.map((param) => {
      try {
        return { param, n: integrate(cu2FromNa(param)).N_N };
      } catch {
        return { param, n: Number.NaN };
      }
    });
    const bracket = findBracket(samples, input.targetAxialN);
    if (!bracket) return null;
    return tryAxialBracket({
      integrate,
      strainFromParam: cu2FromNa,
      targetN: input.targetAxialN,
      paramLow: bracket.paramLow,
      paramHigh: bracket.paramHigh,
      forceTolN,
      maxIterations,
    });
  })();
  const tensionWindow = physicalTensionWindow(input.axis, input.momentSign, domain.bounds);
  const tensionDirect = cu2Scanned ?? tryAxialBracket({
    integrate,
    strainFromParam: ydFromNa,
    targetN: input.targetAxialN,
    paramLow: tensionWindow.lo,
    paramHigh: tensionWindow.hi,
    forceTolN,
    maxIterations,
  });
  const tensionScanned = tensionDirect ?? (() => {
    const params = linspace(tensionWindow.lo, tensionWindow.hi, EU_C3_SCAN_SAMPLES);
    const samples = params.map((param) => {
      try {
        return { param, n: integrate(ydFromNa(param)).N_N };
      } catch {
        return { param, n: Number.NaN };
      }
    });
    const bracket = findBracket(samples, input.targetAxialN);
    if (!bracket) return null;
    return tryAxialBracket({
      integrate,
      strainFromParam: ydFromNa,
      targetN: input.targetAxialN,
      paramLow: bracket.paramLow,
      paramHigh: bracket.paramHigh,
      forceTolN,
      maxIterations,
    });
  })();
  const solved = cu2Scanned ?? tensionScanned;
  if (!solved || !solved.resultants || !solved.strain || !solved.residual) {
    return { ok: false, failReason: "equilibrium did not converge", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  const strainFamily: EuC3PointSuccess["strainFamily"] = cu2Scanned ? "EPS_CU2_PIVOT" : "EPS_YD_PIVOT";
  if (strainFamily === "EPS_YD_PIVOT") {
    const compressionPoint =
      input.axis === "MAJOR_AXIS"
        ? { xMm: domain.originMm.xMm, yMm: window.compressionFace }
        : { xMm: window.compressionFace, yMm: domain.originMm.yMm };
    const extreme = strainAtPoint(solved.strain, compressionPoint);
    if (extreme < -domain.epsCu2 - 1e-9) {
      return { ok: false, failReason: "tension-pivot exceeded governed concrete strain bound", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
    }
  }
  const resistanceMomentNm = input.axis === "MINOR_AXIS" ? solved.resultants.My_Nm : solved.resultants.Mx_Nm;
  const geom = geometryFingerprint(input.geometry, domain.bounds);
  const reoFp = reinforcementFingerprint(input.layout);
  const integrationConfiguration = `CARTESIAN_CELL_PLUS_BAR_POINTS:${input.resolutionX ?? EU_C2_DEFAULT_MESH.resolutionX}x${input.resolutionY ?? EU_C2_DEFAULT_MESH.resolutionY}`;
  const solverConfiguration = `BRACKETED_AXIAL_BISECTION:${input.axis}:${input.momentSign}:N=${input.targetAxialN}:${strainFamily === "EPS_CU2_PIVOT" ? "eps_cu2" : "eps_yd"}`;
  const ndpContextRef = ndpRef(input.context);
  return {
    ok: true,
    methodId: input.methodId,
    axis: input.axis,
    momentSign: input.momentSign,
    axialForceN: solved.resultants.N_N,
    resistanceMomentNm,
    units: { force: "N", moment: "N.m", length: "mm", strain: "m/m", stress: "MPa" },
    resultants: solved.resultants,
    strain: solved.strain,
    strainFamily,
    equilibriumResidualN: solved.residual.rN_N,
    labelledCodeCapacity: false,
    labelledEn1992Resistance: false,
    labelledColumnDesign: false,
    resistanceAuthorityLayer: "NUMERICALLY_VALIDATED_EU_REFERENCE_METHOD",
    geometryFingerprint: geom,
    reinforcementFingerprint: reoFp,
    integrationConfiguration,
    solverConfiguration,
    curveGenerationConfiguration: EU_C3_INTERACTION_GENERATION_STRATEGY,
    materialRuleVersions: [EU_C1C_CONSTITUTIVE_PARAMETER_VERSION, EU_C1C_R1_PARAMETER_VERSION, EU_C3_FLEXURE_IMPLEMENTATION_VERSION],
    ndpContextRef,
    resultFingerprint: euC3ResultFingerprint({
      methodId: input.methodId,
      methodVersion: EU_C3_FLEXURE_IMPLEMENTATION_VERSION,
      axis: input.axis,
      momentSign: input.momentSign,
      geometryFingerprint: geom,
      reinforcementFingerprint: reoFp,
      constitutiveParameterVersion: EU_C1C_CONSTITUTIVE_PARAMETER_VERSION,
      r1ParameterVersion: EU_C1C_R1_PARAMETER_VERSION,
      ndpContextRef,
      integrationConfiguration,
      solverConfiguration,
      curveGenerationConfiguration: EU_C3_INTERACTION_GENERATION_STRATEGY,
      standardProfile: "EN1992_INTENDED_PROFILE",
      targetAxialN: input.targetAxialN,
    }),
  };
}

export function evaluateEuC3InteractionCurve(input: Omit<EuC3SolveInput, "targetAxialN"> & { pointCount?: number }): EuC3CurveResult {
  const domain = evaluateEuC3AxialDomain(input);
  if (!domain.ok) return domain;
  const count = input.pointCount ?? EU_C3_DEFAULT_CURVE_POINTS;
  const lo = domain.nCompressionLimitN;
  const hi = domain.nTensionLimitN;
  const targets = linspace(lo, hi, count);
  const points: EuC3CurvePoint[] = [];
  for (const targetAxialN of targets) {
    const solved = evaluateEuC3InteractionPoint({ ...input, targetAxialN });
    if (!solved.ok) continue;
    points.push({ axialForceN: solved.axialForceN, resistanceMomentNm: solved.resistanceMomentNm, strainFamily: solved.strainFamily });
  }
  if (points.length < 5) {
    return { ok: false, failReason: "interaction curve under-resolved", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  points.sort((a, b) => a.axialForceN - b.axialForceN);
  const fingerprint = euC3ResultFingerprint({
    methodId: input.methodId,
    methodVersion: EU_C3_FLEXURE_IMPLEMENTATION_VERSION,
    axis: input.axis,
    momentSign: input.momentSign,
    geometryFingerprint: geometryFingerprint(input.geometry, domain.bounds),
    reinforcementFingerprint: reinforcementFingerprint(input.layout),
    constitutiveParameterVersion: EU_C1C_CONSTITUTIVE_PARAMETER_VERSION,
    ndpContextRef: ndpRef(input.context),
    curveGenerationConfiguration: EU_C3_INTERACTION_GENERATION_STRATEGY,
    pointCount: count,
    integrationConfiguration: `CARTESIAN_CELL_PLUS_BAR_POINTS:${input.resolutionX ?? EU_C2_DEFAULT_MESH.resolutionX}x${input.resolutionY ?? EU_C2_DEFAULT_MESH.resolutionY}`,
    solverConfiguration: "BRACKETED_AXIAL_BISECTION",
    standardProfile: "EN1992_INTENDED_PROFILE",
  });
  return {
    ok: true,
    methodId: input.methodId,
    axis: input.axis,
    momentSign: input.momentSign,
    points,
    supportedAxialDomainN: { nCompressionLimitN: domain.nCompressionLimitN, nTensionLimitN: domain.nTensionLimitN },
    validatedDomain: "RECTANGULAR_UNIAXIAL_NM",
    samplingConfiguration: `${EU_C3_INTERACTION_GENERATION_STRATEGY}:${count}`,
    resultFingerprint: fingerprint,
    validationState: "NUMERICALLY_VALIDATED",
    conformanceState: "INTENDED_PROFILE",
    labelledCodeCapacity: false,
  };
}

export function interpolateEuC3CurveMoment(points: readonly EuC3CurvePoint[], axialForceN: number): { momentNm: number; conservativeMomentNm: number } | null {
  if (!Number.isFinite(axialForceN) || points.length < 2) return null;
  const sorted = [...points].sort((a, b) => a.axialForceN - b.axialForceN);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) return null;
  if (axialForceN < first.axialForceN || axialForceN > last.axialForceN) return null;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (!a || !b) continue;
    if (axialForceN >= a.axialForceN && axialForceN <= b.axialForceN) {
      const t = b.axialForceN === a.axialForceN ? 0 : (axialForceN - a.axialForceN) / (b.axialForceN - a.axialForceN);
      const linear = a.resistanceMomentNm + t * (b.resistanceMomentNm - a.resistanceMomentNm);
      const conservative = Math.abs(a.resistanceMomentNm) < Math.abs(b.resistanceMomentNm) ? a.resistanceMomentNm : b.resistanceMomentNm;
      return { momentNm: linear, conservativeMomentNm: conservative };
    }
  }
  return null;
}

export function evaluateEuC3DemandPointCheck(input: EuC3SolveInput & { demand: StructuralDemandResult }): EuC3DemandCheckResult {
  if (EU_C3_LINEAR_INTERACTION_ASSUMED_WITHOUT_AUTHORITY) {
    return { checkState: "CHECK_UNDETERMINED", failReason: "linear interaction invented without authority", demandAxialN: 0, demandMomentNm: 0, resistanceMomentNm: null, utilization: null, labelledEn1992Utilization: false, linearInteractionUsed: false };
  }
  const actions = consumeD1cSectionActions(input.demand);
  const demandMomentNm = actions.Mx_Nm;
  const demandAxialN = actions.N_N;
  const momentSign = euC2MomentSignFromDemand(demandMomentNm);
  const solved = evaluateEuC3InteractionPoint({ ...input, targetAxialN: demandAxialN, momentSign });
  if (!solved.ok) {
    return {
      checkState: "CHECK_UNDETERMINED",
      failReason: solved.failReason,
      demandAxialN,
      demandMomentNm,
      resistanceMomentNm: null,
      utilization: null,
      labelledEn1992Utilization: false,
      linearInteractionUsed: false,
    };
  }
  const absDemand = Math.abs(demandMomentNm);
  const absResistance = Math.abs(solved.resistanceMomentNm);
  const utilization = absResistance > 0 ? absDemand / absResistance : null;
  const checkState = utilization == null ? "CHECK_UNDETERMINED" : absDemand <= absResistance ? "CHECK_SATISFIED" : "CHECK_NOT_SATISFIED";
  return {
    checkState,
    failReason: null,
    demandAxialN,
    demandMomentNm,
    resistanceMomentNm: solved.resistanceMomentNm,
    utilization,
    labelledEn1992Utilization: false,
    linearInteractionUsed: false,
  };
}

export function reproduceC2AtZeroAxial(input: Omit<EuC3SolveInput, "targetAxialN">): { c2Nm: number; c3Nm: number } | EuC3Fail {
  const c2 = evaluateEuC2UniaxialFlexureResistance({
    methodId: c2MethodId(input.methodId),
    axis: input.axis,
    momentSign: input.momentSign,
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
  const c3 = evaluateEuC3InteractionPoint({ ...input, targetAxialN: 0 });
  if (!c3.ok) return c3;
  return { c2Nm: c2.resistanceMomentNm, c3Nm: c3.resistanceMomentNm };
}

export function assertEuC3OptimizerRejectsUndetermined(checkState: EuC3DemandCheckResult["checkState"]): void {
  if (EU_C3_OPTIMIZATION_ACCEPTS_UNDETERMINED) throw new Error("C3 optimizer cannot accept undetermined");
  if (checkState === "CHECK_UNDETERMINED") throw new Error("EU C3 optimizer cannot accept CHECK_UNDETERMINED as design-valid");
}

export function assertEuC3ParetoRejectsUndetermined(checkState: EuC3DemandCheckResult["checkState"]): void {
  if (EU_C3_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE) throw new Error("C3 Pareto cannot accept undetermined as feasible");
  if (checkState === "CHECK_UNDETERMINED") throw new Error("Pareto cannot rank CHECK_UNDETERMINED as C3-feasible");
}
