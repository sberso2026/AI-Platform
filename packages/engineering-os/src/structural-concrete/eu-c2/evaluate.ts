import type {
  ConcreteMaterial,
  EuC2MethodId,
  EuC2MomentSign,
  EuFlexureAxis,
  RcGeneralizedStrainState,
  RcSectionGeometryInput,
  RcSectionResultants,
  ReinforcementLayout,
  ReinforcementMaterial,
} from "@rtb/types";
import {
  EU_C1C_CONSTITUTIVE_MODEL_ID,
  EU_C1C_CONSTITUTIVE_PARAMETER_VERSION,
  EU_C1C_CONSTITUTIVE_REO_MODEL_ID,
  EU_C1C_R1_PARAMETER_VERSION,
  EU_C2_AXIAL_APPLICABILITY,
  EU_C2_DEFAULT_MESH,
  EU_C2_FLEXURE_IMPLEMENTATION_VERSION,
  EU_C2_MAX_BISECTION_ITERATIONS,
  EU_C2_METHOD_IDS,
  EU_C2_NONZERO_AXIAL_ACTION_SILENTLY_IGNORED,
  EU_C2_NUMERICAL_TOLERANCE,
  EU_C2_SECTION_RESISTANCE_STRATEGY,
  EU_C2_SUPPORTED_GEOMETRY_TYPES,
  TEST_ONLY_NDP_BECOMES_RUNTIME_DEFAULT,
} from "@rtb/types";
import type { EuC1cConstitutiveContext } from "../eu-c1c-constitutive";
import {
  assertTestOnlyNdpNeverDefault,
  bindEuC1ConcreteFiberResponse,
  bindEuC1ReinforcementPointResponse,
  evaluateEuC1ConcreteStrainLimits,
} from "../eu-c1c-constitutive";
import { evaluateEuC1PartialFactorGammaC, evaluateEuC1PartialFactorGammaS } from "../eu-c1c-r1";
import {
  computeGrossSectionProperties,
  createStrainState,
  evaluateBarGeometry,
  integrateSectionWithMaterialResponse,
  solveAxialEquilibrium1d,
  strainAtPoint,
} from "../section-mechanics";
import { failClosed } from "../section-mechanics/units";
import { assertEuC2AiBoundary, assertEuC2ArchitectureFreeze } from "./authority";
import { euC2ResultFingerprint } from "./invalidation";

export type EuC2FlexureSolveInput = {
  methodId: EuC2MethodId;
  axis: EuFlexureAxis;
  momentSign: EuC2MomentSign;
  geometry: RcSectionGeometryInput;
  layout: ReinforcementLayout;
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  context: EuC1cConstitutiveContext;
  resolutionX?: number;
  resolutionY?: number;
  maxBisectionIterations?: number;
  provenanceRef: string;
};

export type EuC2FlexureSolveSuccess = {
  ok: true;
  methodId: EuC2MethodId;
  axis: EuFlexureAxis;
  momentSign: EuC2MomentSign;
  resistanceMomentNm: number;
  resistanceMomentUnit: "N.m";
  resultants: RcSectionResultants;
  strain: RcGeneralizedStrainState;
  equilibriumResidualN: number;
  iterations: number;
  solverMethod: "BRACKETED_AXIAL_BISECTION";
  labelledCodeCapacity: false;
  labelledEn1992Resistance: false;
  resistanceAuthorityLayer: "DESIGN_RULE_RESISTANCE";
  geometryFingerprint: string;
  reinforcementFingerprint: string;
  resultFingerprint: string;
  integrationConfiguration: string;
  solverConfiguration: string;
  materialRuleVersions: readonly string[];
  ndpContextRef: string;
};

export type EuC2FlexureSolveFailure = {
  ok: false;
  failReason: string;
  checkState: "CHECK_UNDETERMINED" | "UNSUPPORTED_SCOPE";
  labelledCodeCapacity: false;
};

export type EuC2FlexureSolveResult = EuC2FlexureSolveSuccess | EuC2FlexureSolveFailure;

export function euC2RectangularBounds(geometry: RcSectionGeometryInput): { xMin: number; xMax: number; yMin: number; yMax: number } {
  if (geometry.shape !== "RECTANGULAR" || geometry.regions[0]?.kind !== "RECTANGLE") {
    failClosed("C2 numerically validated geometry is rectangular only");
  }
  const region = geometry.regions[0];
  const origin = region.originMm ?? failClosed("rectangle origin missing");
  const width = region.widthMm ?? failClosed("rectangle width missing");
  const depth = region.depthMm ?? failClosed("rectangle depth missing");
  if (!(width > 0) || !(depth > 0) || !Number.isFinite(width) || !Number.isFinite(depth)) {
    failClosed("invalid rectangular geometry");
  }
  return { xMin: origin.xMm, xMax: origin.xMm + width, yMin: origin.yMm, yMax: origin.yMm + depth };
}

export function euC2UlsStrainFromNa(input: {
  axis: EuFlexureAxis;
  momentSign: EuC2MomentSign;
  originMm: { xMm: number; yMm: number };
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number };
  naCoordMm: number;
  epsCu2: number;
}): RcGeneralizedStrainState {
  if (input.axis === "MAJOR_AXIS") {
    const yComp = input.momentSign === "POSITIVE" ? input.bounds.yMax : input.bounds.yMin;
    const denom = yComp - input.naCoordMm;
    if (!(Math.abs(denom) > 1e-9)) failClosed("neutral-axis parameter coincides with compression face");
    const phix = input.epsCu2 / denom;
    const eps0 = phix * (input.naCoordMm - input.originMm.yMm);
    return createStrainState(eps0, phix, 0, input.originMm);
  }
  const xComp = input.momentSign === "POSITIVE" ? input.bounds.xMax : input.bounds.xMin;
  const denom = xComp - input.naCoordMm;
  if (!(Math.abs(denom) > 1e-9)) failClosed("neutral-axis parameter coincides with compression face");
  const phiy = input.epsCu2 / denom;
  const eps0 = phiy * (input.naCoordMm - input.originMm.xMm);
  return createStrainState(eps0, 0, phiy, input.originMm);
}

function assertC2Inputs(input: EuC2FlexureSolveInput): EuC2FlexureSolveFailure | null {
  assertEuC2AiBoundary();
  assertEuC2ArchitectureFreeze();
  if (EU_C2_SECTION_RESISTANCE_STRATEGY !== "MATERIAL_INTEGRATION") {
    return { ok: false, failReason: "C2 must use material integration", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  if (TEST_ONLY_NDP_BECOMES_RUNTIME_DEFAULT) {
    return { ok: false, failReason: "test-only NDP must not become a runtime default", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  if (!EU_C2_METHOD_IDS.includes(input.methodId)) {
    return { ok: false, failReason: "unknown C2 method", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  const expectedAxis = input.methodId.endsWith("MINOR") ? "MINOR_AXIS" : "MAJOR_AXIS";
  if (input.axis !== expectedAxis) {
    return { ok: false, failReason: "method axis mismatch", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  if (!(EU_C2_SUPPORTED_GEOMETRY_TYPES as readonly string[]).includes(input.geometry.shape)) {
    return { ok: false, failReason: "unsupported geometry", checkState: "UNSUPPORTED_SCOPE", labelledCodeCapacity: false };
  }
  if (!input.layout.bars.length) {
    return { ok: false, failReason: "C2 pure flexure requires reinforcement", checkState: "UNSUPPORTED_SCOPE", labelledCodeCapacity: false };
  }
  for (const value of [input.geometry.regions[0]?.widthMm, input.geometry.regions[0]?.depthMm, input.concrete.compressiveStrength?.value, input.reinforcement.yieldStrength?.value]) {
    if (typeof value === "number" && !Number.isFinite(value)) {
      return { ok: false, failReason: "non-finite input", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
    }
  }
  return null;
}

export function bindEuC2MaterialIntegrator(input: {
  geometry: RcSectionGeometryInput;
  layout: ReinforcementLayout;
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  context: EuC1cConstitutiveContext;
  resolutionX?: number;
  resolutionY?: number;
  provenanceRef: string;
}): (strain: RcGeneralizedStrainState) => RcSectionResultants {
  const resolutionX = input.resolutionX ?? EU_C2_DEFAULT_MESH.resolutionX;
  const resolutionY = input.resolutionY ?? EU_C2_DEFAULT_MESH.resolutionY;
  return (strain: RcGeneralizedStrainState): RcSectionResultants =>
    integrateSectionWithMaterialResponse({
      geometry: input.geometry,
      layout: input.layout,
      concrete: input.concrete,
      reinforcement: input.reinforcement,
      strain,
      displacementTreatment: "CONCRETE_GROSS_SEPARATE",
      crackState: "CRACK_STATE_NOT_EVALUATED",
      tensionTreatment: "NO_TENSION",
      resolutionX,
      resolutionY,
      provenanceRef: input.provenanceRef,
      concreteResponse: bindEuC1ConcreteFiberResponse(input.context),
      reinforcementResponse: bindEuC1ReinforcementPointResponse(input.context),
      concreteModelId: EU_C1C_CONSTITUTIVE_MODEL_ID,
      reinforcementModelId: EU_C1C_CONSTITUTIVE_REO_MODEL_ID,
      resultAuthority: "MECHANICS_REFERENCE",
    });
}

export function evaluateEuC2UniaxialFlexureResistance(input: EuC2FlexureSolveInput): EuC2FlexureSolveResult {
  if (EU_C2_AXIAL_APPLICABILITY !== "PURE_FLEXURE_ZERO_APPLIED_AXIAL_ONLY" || EU_C2_NONZERO_AXIAL_ACTION_SILENTLY_IGNORED) {
    return { ok: false, failReason: "C2 axial applicability drifted", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  return solveEuProfileUlsAxialTarget({ ...input, targetAxialN: 0 });
}

export function solveEuProfileUlsAxialTarget(input: EuC2FlexureSolveInput & { targetAxialN: number }): EuC2FlexureSolveResult {
  const blocked = assertC2Inputs(input);
  if (blocked) return blocked;
  try {
    assertTestOnlyNdpNeverDefault(input.context);
  } catch (error) {
    return { ok: false, failReason: error instanceof Error ? error.message : "test-only NDP misuse", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  if (!Number.isFinite(input.targetAxialN)) {
    return { ok: false, failReason: "non-finite axial target", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  const gammaC = evaluateEuC1PartialFactorGammaC({ context: input.context });
  const gammaS = evaluateEuC1PartialFactorGammaS({ context: input.context });
  if (!gammaC.ok) return { ok: false, failReason: gammaC.failReason ?? "gamma_c unresolved", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  if (!gammaS.ok) return { ok: false, failReason: gammaS.failReason ?? "gamma_s unresolved", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  const strainLimits = evaluateEuC1ConcreteStrainLimits({ concrete: input.concrete, context: input.context });
  if (!strainLimits.ok) {
    const undetermined = strainLimits.checkState === "UNSUPPORTED_SCOPE" ? "UNSUPPORTED_SCOPE" : "CHECK_UNDETERMINED";
    return { ok: false, failReason: strainLimits.failReason ?? "strain limits unresolved", checkState: undetermined, labelledCodeCapacity: false };
  }
  try {
    evaluateBarGeometry(input.layout, input.geometry);
  } catch (error) {
    return { ok: false, failReason: error instanceof Error ? error.message : "invalid bar geometry", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  const props = computeGrossSectionProperties(input.geometry);
  const originMm = { xMm: props.centroidXMm, yMm: props.centroidYMm };
  const bounds = euC2RectangularBounds(input.geometry);
  const span = input.axis === "MAJOR_AXIS" ? bounds.yMax - bounds.yMin : bounds.xMax - bounds.xMin;
  const lo = (input.axis === "MAJOR_AXIS" ? bounds.yMin : bounds.xMin) + 0.004 * span;
  const hi = (input.axis === "MAJOR_AXIS" ? bounds.yMax : bounds.xMax) - 0.004 * span;
  const resolutionX = input.resolutionX ?? EU_C2_DEFAULT_MESH.resolutionX;
  const resolutionY = input.resolutionY ?? EU_C2_DEFAULT_MESH.resolutionY;
  const integrate = bindEuC2MaterialIntegrator(input);
  const solved = solveAxialEquilibrium1d({
    integrate,
    strainFromParam: (na) =>
      euC2UlsStrainFromNa({
        axis: input.axis,
        momentSign: input.momentSign,
        originMm,
        bounds,
        naCoordMm: na,
        epsCu2: strainLimits.outputs.epsCu2,
      }),
    targetN: input.targetAxialN,
    paramLow: lo,
    paramHigh: hi,
    forceTolN: EU_C2_NUMERICAL_TOLERANCE.equilibriumResidualN,
    maxIterations: input.maxBisectionIterations ?? EU_C2_MAX_BISECTION_ITERATIONS,
  });
  if (solved.state !== "CONVERGED" || !solved.resultants || !solved.strain || !solved.residual) {
    return { ok: false, failReason: "equilibrium did not converge", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  const compressionPoint =
    input.axis === "MAJOR_AXIS"
      ? { xMm: originMm.xMm, yMm: input.momentSign === "POSITIVE" ? bounds.yMax : bounds.yMin }
      : { xMm: input.momentSign === "POSITIVE" ? bounds.xMax : bounds.xMin, yMm: originMm.yMm };
  const extreme = strainAtPoint(solved.strain, compressionPoint);
  if (!(Math.abs(extreme + strainLimits.outputs.epsCu2) <= 1e-9)) {
    return { ok: false, failReason: "governing strain bound not recovered", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  const resistanceMomentNm = input.axis === "MINOR_AXIS" ? solved.resultants.My_Nm : solved.resultants.Mx_Nm;
  if (!Number.isFinite(resistanceMomentNm)) {
    return { ok: false, failReason: "resistance moment is not finite", checkState: "CHECK_UNDETERMINED", labelledCodeCapacity: false };
  }
  const geometryFingerprint = `${input.geometry.sectionId}|${input.geometry.geometryVersion}|${input.geometry.shape}|${bounds.xMax - bounds.xMin}x${bounds.yMax - bounds.yMin}`;
  const reinforcementFingerprint = [
    input.layout.layoutId,
    ...input.layout.bars.map((bar) => `${bar.barId}:${bar.xMm}:${bar.yMm}:${bar.areaMm2?.value ?? ""}:${bar.count}`),
  ].join(";");
  const integrationConfiguration = `CARTESIAN_CELL_PLUS_BAR_POINTS:${resolutionX}x${resolutionY}`;
  const solverConfiguration = `${solved.method}:${input.axis}:${input.momentSign}:N=${input.targetAxialN}:eps_cu2`;
  const ndpContextRef = [
    input.context.nationalAnnexRef ?? "",
    input.context.gamma_c?.value ?? "",
    input.context.gamma_s?.value ?? "",
    input.context.alpha_cc?.value ?? "",
    input.context.gamma_c?.sourceAuthority ?? "",
    input.context.testOnlyNonConformance === true ? "TEST_ONLY_NON_CONFORMANCE" : "DECLARED",
  ].join("|");
  const resultFingerprint = euC2ResultFingerprint({
    methodId: input.methodId,
    methodVersion: EU_C2_FLEXURE_IMPLEMENTATION_VERSION,
    axis: input.axis,
    momentSign: input.momentSign,
    geometryFingerprint,
    reinforcementFingerprint,
    concreteRef: input.concrete.materialRef,
    concreteVersion: input.concrete.version,
    reinforcementRef: input.reinforcement.materialRef,
    reinforcementVersion: input.reinforcement.version,
    constitutiveParameterVersion: EU_C1C_CONSTITUTIVE_PARAMETER_VERSION,
    r1ParameterVersion: EU_C1C_R1_PARAMETER_VERSION,
    ndpContextRef,
    integrationConfiguration,
    solverConfiguration,
    standardProfile: "EN1992_INTENDED_PROFILE",
  });
  return {
    ok: true,
    methodId: input.methodId,
    axis: input.axis,
    momentSign: input.momentSign,
    resistanceMomentNm,
    resistanceMomentUnit: "N.m",
    resultants: solved.resultants,
    strain: solved.strain,
    equilibriumResidualN: solved.residual.rN_N,
    iterations: solved.iterations,
    solverMethod: "BRACKETED_AXIAL_BISECTION",
    labelledCodeCapacity: false,
    labelledEn1992Resistance: false,
    resistanceAuthorityLayer: "DESIGN_RULE_RESISTANCE",
    geometryFingerprint,
    reinforcementFingerprint,
    resultFingerprint,
    integrationConfiguration,
    solverConfiguration,
    materialRuleVersions: [EU_C1C_CONSTITUTIVE_PARAMETER_VERSION, EU_C1C_R1_PARAMETER_VERSION, EU_C2_FLEXURE_IMPLEMENTATION_VERSION],
    ndpContextRef,
  };
}

export function euC2MomentSignFromDemand(demandNm: number): EuC2MomentSign {
  return demandNm < 0 ? "NEGATIVE" : "POSITIVE";
}
