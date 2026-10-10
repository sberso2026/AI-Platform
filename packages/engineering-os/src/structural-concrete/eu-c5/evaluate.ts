import type { EuC5CheckResult, EuC5FamilyId, EuC5UndeterminedReason, StructuralDemandResult } from "@rtb/types";
import {
  D1C_PUNCHING_ACTIONS_REUSED,
  D1C_SHEAR_DEMAND_REUSED,
  D1C_TORSION_DEMAND_REUSED,
  EU_C5_IMPLEMENTATION_VERSION,
  EU_C5_PARAMETER_VERSION,
  EU_C5_PUNCHING_INTERIOR_METHOD_ID,
  EU_C5_PUNCHING_REQUIRED_RULE_IDS,
  EU_C5_SHEAR_REQUIRED_RULE_IDS,
  EU_C5_SHEAR_WITHOUT_REINFORCEMENT_METHOD_ID,
  EU_C5_TORSION_BLOCKED_RULE_IDS,
  EU_C5_VMIN_EXPRESSION_ID,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  NUMERICAL_EU_CONCRETE_SHEAR_IMPLEMENTED,
  NUMERICAL_EU_PUNCHING_SHEAR_IMPLEMENTED,
  PARALLEL_EU_SHEAR_DEMAND_ENGINE_CREATED,
} from "@rtb/types";
import { consumeConcreteDemandHandoff } from "../orchestration";
import { assertEuC5FailClosed } from "./policy";
import { euC5ResultFingerprint } from "./invalidation";
import { concreteShearStressMPa, interiorRectangularControlPerimeterMm, shearResistanceN } from "./resistance";

export type EuC5Quantity = { value: number; unit: string; sourceRef?: string };

export type EuC5EvaluateInput = {
  demand: Pick<StructuralDemandResult, "resultId" | "capacityPresent" | "memberId" | "shear" | "torsion" | "combinationId">;
  geometryFingerprint?: string | null;
  reinforcementFingerprint?: string | null;
  standardProfileContext?: string;
  ndpContext?: string;
  generation?: "FIRST_GENERATION" | "SECOND_GENERATION" | "UNKNOWN_PENDING_CONFIRMATION";
  evidenceVersion?: string;
  axialForceN?: number | null;
  designShearReinforcement?: "NONE" | "PRESENT";
  effectiveDepth?: EuC5Quantity | null;
  webWidth?: EuC5Quantity | null;
  longitudinalTensionArea?: EuC5Quantity | null;
  fck?: EuC5Quantity | null;
  cRdC?: EuC5Quantity | null;
  vMinCoefficient?: EuC5Quantity | null;
  vMinExpressionId?: string | null;
  punchingForce?: EuC5Quantity | null;
  beta?: EuC5Quantity | null;
  loadedWidth?: EuC5Quantity | null;
  loadedDepth?: EuC5Quantity | null;
  rhoX?: EuC5Quantity | null;
  rhoY?: EuC5Quantity | null;
  supportPosition?: "INTERIOR" | "EDGE" | "CORNER";
  openingPresent?: boolean;
  eccentricityMode?: "EXPLICIT_BETA_ONLY" | "COMPUTE_MOMENT_TRANSFER";
};

function finish(
  family: EuC5FamilyId,
  input: EuC5EvaluateInput,
  partial: Omit<EuC5CheckResult, "fingerprint" | "capabilityFamily" | "checksEqualMemberConformance">,
): EuC5CheckResult {
  const result: EuC5CheckResult = {
    ...partial,
    capabilityFamily: family,
    checksEqualMemberConformance: false,
    fingerprint: "",
  };
  return { ...result, fingerprint: euC5ResultFingerprint(result, input.demand.resultId, input.demand.combinationId ?? null) };
}

function undetermined(
  family: EuC5FamilyId,
  input: EuC5EvaluateInput,
  demand: EuC5CheckResult["demand"],
  failReason: EuC5UndeterminedReason,
  governingRuleIds: readonly string[],
  warnings: readonly string[],
  methodId: string | null = null,
): EuC5CheckResult {
  return finish(family, input, {
    ok: false,
    family,
    methodId,
    demand,
    resistance: null,
    utilization: null,
    units: { demand: demand.unit, resistance: null },
    checkState: "CHECK_UNDETERMINED",
    governingRuleIds,
    parameterVersions: [EU_C5_IMPLEMENTATION_VERSION, EU_C5_PARAMETER_VERSION],
    geometryFingerprint: input.geometryFingerprint ?? null,
    reinforcementFingerprint: input.reinforcementFingerprint ?? null,
    standardProfileContext: input.standardProfileContext ?? "EN 1992 / EN_1992_1_1 / UNKNOWN_PENDING_CONFIRMATION",
    ndpContext: input.ndpContext ?? "NO_DEFAULT_NATIONAL_ANNEX",
    validationState: methodId ? "NUMERICALLY_VALIDATED" : "NOT_STARTED",
    conformanceState: EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
    warnings,
    provenance: methodId
      ? "EOS-D1E-EU-C5 fail-closed before the governed method"
      : "EOS-D1E-EU-C5 fail-closed: no governed numerical method",
    failReason,
  });
}

function generationBlocked(input: EuC5EvaluateInput): boolean {
  return input.generation === "SECOND_GENERATION" || input.evidenceVersion === "SECOND_GENERATION";
}

function declared(quantity: EuC5Quantity | null | undefined, unit: string): number | null {
  if (!quantity || quantity.unit !== unit || !Number.isFinite(quantity.value) || !quantity.sourceRef?.trim()) return null;
  return quantity.value;
}

function ndpReady(input: EuC5EvaluateInput): boolean {
  return input.vMinExpressionId === EU_C5_VMIN_EXPRESSION_ID
    && declared(input.cRdC, "dimensionless") != null
    && declared(input.vMinCoefficient, "dimensionless") != null;
}

export function evaluateEuC5Shear(input: EuC5EvaluateInput): EuC5CheckResult {
  assertEuC5FailClosed();
  if (PARALLEL_EU_SHEAR_DEMAND_ENGINE_CREATED) throw new Error("parallel EU shear demand engine is forbidden");
  if (!NUMERICAL_EU_CONCRETE_SHEAR_IMPLEMENTED) throw new Error("C5 shear method flag drifted");
  if (!D1C_SHEAR_DEMAND_REUSED) throw new Error("C5 must reuse D1C shear demand");
  consumeConcreteDemandHandoff(input.demand);
  const shear = input.demand.shear;
  const demand = !shear || !Number.isFinite(shear.value)
    ? { value: null, unit: null, source: "D1C" }
    : { value: shear.value, unit: shear.unit, source: "D1C" };
  if (!shear || !Number.isFinite(shear.value) || shear.unit !== "N") {
    return undetermined("SHEAR", input, demand, "INVALID_INPUT", EU_C5_SHEAR_REQUIRED_RULE_IDS, ["D1C shear demand must be a finite force in N"]);
  }
  if (generationBlocked(input)) {
    return undetermined("SHEAR", input, demand, "UNSUPPORTED_RULE_APPLICABILITY", EU_C5_SHEAR_REQUIRED_RULE_IDS, ["second-generation shear is not mixed into the first-generation method"]);
  }
  if (input.evidenceVersion && input.evidenceVersion !== EU_C5_IMPLEMENTATION_VERSION && input.evidenceVersion !== "FIRST_GENERATION") {
    return undetermined("SHEAR", input, demand, "STALE_RESULT", EU_C5_SHEAR_REQUIRED_RULE_IDS, ["evidence version does not match the implemented shear rule pack"]);
  }
  if (input.axialForceN == null || !Number.isFinite(input.axialForceN) || input.axialForceN !== 0) {
    return undetermined("SHEAR", input, demand, "UNSUPPORTED_AXIAL_STATE", EU_C5_SHEAR_REQUIRED_RULE_IDS, ["bounded shear v1 requires explicit zero axial force"], EU_C5_SHEAR_WITHOUT_REINFORCEMENT_METHOD_ID);
  }
  if (input.designShearReinforcement == null) {
    return undetermined("SHEAR", input, demand, "MISSING_SHEAR_REINFORCEMENT_DATA", EU_C5_SHEAR_REQUIRED_RULE_IDS, ["design shear reinforcement state is required"], EU_C5_SHEAR_WITHOUT_REINFORCEMENT_METHOD_ID);
  }
  if (input.designShearReinforcement !== "NONE") {
    return undetermined("SHEAR", input, demand, "UNSUPPORTED_RULE_APPLICABILITY", EU_C5_SHEAR_REQUIRED_RULE_IDS, ["shear with design shear reinforcement is outside the bounded method"], EU_C5_SHEAR_WITHOUT_REINFORCEMENT_METHOD_ID);
  }
  const depth = declared(input.effectiveDepth, "mm");
  const width = declared(input.webWidth, "mm");
  if (input.longitudinalTensionArea == null) {
    return undetermined("SHEAR", input, demand, "MISSING_LONGITUDINAL_REINFORCEMENT", EU_C5_SHEAR_REQUIRED_RULE_IDS, ["longitudinal tension area is required"], EU_C5_SHEAR_WITHOUT_REINFORCEMENT_METHOD_ID);
  }
  const area = declared(input.longitudinalTensionArea, "mm2");
  if (depth == null || width == null || area == null || depth <= 0 || width <= 0 || area < 0) {
    return undetermined("SHEAR", input, demand, "MISSING_GEOMETRY", EU_C5_SHEAR_REQUIRED_RULE_IDS, ["effective depth mm, web width mm, and longitudinal area mm2 are required"], EU_C5_SHEAR_WITHOUT_REINFORCEMENT_METHOD_ID);
  }
  const fck = declared(input.fck, "MPa");
  if (fck == null || fck <= 0) {
    return undetermined("SHEAR", input, demand, "MISSING_MATERIAL_PARAMETER", EU_C5_SHEAR_REQUIRED_RULE_IDS, ["fck in MPa is required"], EU_C5_SHEAR_WITHOUT_REINFORCEMENT_METHOD_ID);
  }
  if (!ndpReady(input)) {
    return undetermined("SHEAR", input, demand, "MISSING_NDP", EU_C5_SHEAR_REQUIRED_RULE_IDS, ["declared CRd,c, vmin coefficient, and recommended vmin expression id are required"], EU_C5_SHEAR_WITHOUT_REINFORCEMENT_METHOD_ID);
  }
  const solved = shearResistanceN({
    effectiveDepthMm: depth,
    webWidthMm: width,
    longitudinalTensionAreaMm2: area,
    fckMPa: fck,
    cRdC: input.cRdC!.value,
    vMinCoefficient: input.vMinCoefficient!.value,
  });
  if (!solved) {
    return undetermined("SHEAR", input, demand, "INVALID_INPUT", EU_C5_SHEAR_REQUIRED_RULE_IDS, ["shear resistance inputs did not produce a finite positive resistance"], EU_C5_SHEAR_WITHOUT_REINFORCEMENT_METHOD_ID);
  }
  const utilization = Math.abs(shear.value) / solved.resistanceN;
  const satisfied = utilization <= 1;
  return finish("SHEAR", input, {
    ok: true,
    family: "SHEAR",
    methodId: EU_C5_SHEAR_WITHOUT_REINFORCEMENT_METHOD_ID,
    demand,
    resistance: { value: solved.resistanceN, unit: "N" },
    utilization,
    units: { demand: "N", resistance: "N" },
    checkState: satisfied ? "CHECK_SATISFIED" : "CHECK_NOT_SATISFIED",
    governingRuleIds: EU_C5_SHEAR_REQUIRED_RULE_IDS,
    parameterVersions: [EU_C5_IMPLEMENTATION_VERSION, EU_C5_PARAMETER_VERSION],
    geometryFingerprint: input.geometryFingerprint ?? `d:${depth};bw:${width}`,
    reinforcementFingerprint: input.reinforcementFingerprint ?? `Asl:${area};rho:${solved.rho}`,
    standardProfileContext: input.standardProfileContext ?? "EN 1992 / EN_1992_1_1 / FIRST_GENERATION_CLAIMED_BY_SOURCES",
    ndpContext: input.ndpContext ?? "DECLARED_CRDC_AND_VMIN_NO_DEFAULT_ANNEX",
    validationState: "NUMERICALLY_VALIDATED",
    conformanceState: "INTENDED_PROFILE",
    warnings: ["shear check is not member conformance"],
    provenance: "JRC_WALRAVEN_2011+SOFISTIK_DCE_EN7; declared NDP; D1C shear demand",
    failReason: null,
  });
}

export function evaluateEuC5Punching(input: EuC5EvaluateInput): EuC5CheckResult {
  assertEuC5FailClosed();
  if (!NUMERICAL_EU_PUNCHING_SHEAR_IMPLEMENTED) throw new Error("C5 punching method flag drifted");
  consumeConcreteDemandHandoff(input.demand);
  if (D1C_PUNCHING_ACTIONS_REUSED !== "NOT_APPLICABLE") {
    throw new Error("C5 punching actions must remain NOT_APPLICABLE until a punching demand contract exists");
  }
  if (input.punchingForce == null) {
    return undetermined(
      "PUNCHING",
      input,
      { value: null, unit: null, source: "D1C_PUNCHING_NOT_AVAILABLE" },
      "D1C_PUNCHING_ACTION_NOT_AVAILABLE",
      EU_C5_PUNCHING_REQUIRED_RULE_IDS,
      ["D1C has no punching-action contract; beam shear is not punching demand"],
    );
  }
  const force = declared(input.punchingForce, "N");
  const demand = { value: force, unit: force == null ? input.punchingForce.unit : "N", source: "EXPLICIT_PUNCHING_FORCE" };
  if (force == null || force <= 0) {
    return undetermined("PUNCHING", input, { value: null, unit: input.punchingForce.unit, source: "EXPLICIT_PUNCHING_FORCE" }, "INVALID_INPUT", EU_C5_PUNCHING_REQUIRED_RULE_IDS, ["punching force must be a finite positive value in N"], EU_C5_PUNCHING_INTERIOR_METHOD_ID);
  }
  if (generationBlocked(input)) {
    return undetermined("PUNCHING", input, demand, "UNSUPPORTED_RULE_APPLICABILITY", EU_C5_PUNCHING_REQUIRED_RULE_IDS, ["second-generation punching is not mixed into the first-generation method"], EU_C5_PUNCHING_INTERIOR_METHOD_ID);
  }
  if (input.supportPosition !== "INTERIOR") {
    return undetermined("PUNCHING", input, demand, "UNSUPPORTED_GEOMETRY", EU_C5_PUNCHING_REQUIRED_RULE_IDS, ["only an interior support is in the bounded punching method"], EU_C5_PUNCHING_INTERIOR_METHOD_ID);
  }
  if (input.openingPresent !== false) {
    return undetermined("PUNCHING", input, demand, "UNSUPPORTED_GEOMETRY", EU_C5_PUNCHING_REQUIRED_RULE_IDS, ["openings are outside the bounded punching method"], EU_C5_PUNCHING_INTERIOR_METHOD_ID);
  }
  if (input.eccentricityMode !== "EXPLICIT_BETA_ONLY") {
    return undetermined("PUNCHING", input, demand, "UNSUPPORTED_RULE_APPLICABILITY", EU_C5_PUNCHING_REQUIRED_RULE_IDS, ["moment-transfer eccentricity is not calculated"], EU_C5_PUNCHING_INTERIOR_METHOD_ID);
  }
  const beta = declared(input.beta, "dimensionless");
  const depth = declared(input.effectiveDepth, "mm");
  const c1 = declared(input.loadedWidth, "mm");
  const c2 = declared(input.loadedDepth, "mm");
  const rhoX = declared(input.rhoX, "dimensionless");
  const rhoY = declared(input.rhoY, "dimensionless");
  if (beta == null || beta <= 0 || depth == null || depth <= 0 || c1 == null || c1 <= 0 || c2 == null || c2 <= 0 || rhoX == null || rhoX < 0 || rhoY == null || rhoY < 0) {
    return undetermined("PUNCHING", input, demand, "MISSING_GEOMETRY", EU_C5_PUNCHING_REQUIRED_RULE_IDS, ["interior punching requires beta, depth mm, loaded-area mm, and orthogonal reinforcement ratios"], EU_C5_PUNCHING_INTERIOR_METHOD_ID);
  }
  const fck = declared(input.fck, "MPa");
  if (fck == null || fck <= 0) {
    return undetermined("PUNCHING", input, demand, "MISSING_MATERIAL_PARAMETER", EU_C5_PUNCHING_REQUIRED_RULE_IDS, ["fck in MPa is required"], EU_C5_PUNCHING_INTERIOR_METHOD_ID);
  }
  if (!ndpReady(input)) {
    return undetermined("PUNCHING", input, demand, "MISSING_NDP", EU_C5_PUNCHING_REQUIRED_RULE_IDS, ["declared CRd,c, vmin coefficient, and recommended vmin expression id are required"], EU_C5_PUNCHING_INTERIOR_METHOD_ID);
  }
  const perimeter = interiorRectangularControlPerimeterMm({ loadedWidthMm: c1, loadedDepthMm: c2, effectiveDepthMm: depth });
  const stress = concreteShearStressMPa({
    effectiveDepthMm: depth,
    rho: Math.sqrt(rhoX * rhoY),
    fckMPa: fck,
    cRdC: input.cRdC!.value,
    vMinCoefficient: input.vMinCoefficient!.value,
  });
  if (perimeter == null || stress == null || !(stress.vRdCMPa > 0)) {
    return undetermined("PUNCHING", input, demand, "INVALID_INPUT", EU_C5_PUNCHING_REQUIRED_RULE_IDS, ["punching geometry did not produce a finite perimeter and resistance"], EU_C5_PUNCHING_INTERIOR_METHOD_ID);
  }
  const vEd = (beta * force) / (perimeter * depth);
  const utilization = vEd / stress.vRdCMPa;
  const satisfied = utilization <= 1;
  return finish("PUNCHING", input, {
    ok: true,
    family: "PUNCHING",
    methodId: EU_C5_PUNCHING_INTERIOR_METHOD_ID,
    demand: { value: vEd, unit: "MPa", source: "EXPLICIT_PUNCHING_FORCE" },
    resistance: { value: stress.vRdCMPa, unit: "MPa" },
    utilization,
    units: { demand: "MPa", resistance: "MPa" },
    checkState: satisfied ? "CHECK_SATISFIED" : "CHECK_NOT_SATISFIED",
    governingRuleIds: EU_C5_PUNCHING_REQUIRED_RULE_IDS,
    parameterVersions: [EU_C5_IMPLEMENTATION_VERSION, EU_C5_PARAMETER_VERSION, `u1:${perimeter}`],
    geometryFingerprint: input.geometryFingerprint ?? `u1:${perimeter};d:${depth};c1:${c1};c2:${c2}`,
    reinforcementFingerprint: input.reinforcementFingerprint ?? `rho:${stress.rho}`,
    standardProfileContext: input.standardProfileContext ?? "EN 1992 / EN_1992_1_1 / FIRST_GENERATION_CLAIMED_BY_SOURCES",
    ndpContext: input.ndpContext ?? "DECLARED_CRDC_AND_VMIN_NO_DEFAULT_ANNEX",
    validationState: "NUMERICALLY_VALIDATED",
    conformanceState: "INTENDED_PROFILE",
    warnings: ["punching check is not member conformance", "beam shear was not used as punching demand"],
    provenance: "JRC_WALRAVEN_2011+INFOGRAPH_EN1992_PUNCHING+TCC_LECTURE6_2017; explicit punching force; declared NDP",
    failReason: null,
  });
}

export function evaluateEuC5Torsion(input: EuC5EvaluateInput): EuC5CheckResult {
  assertEuC5FailClosed();
  consumeConcreteDemandHandoff(input.demand);
  if (D1C_TORSION_DEMAND_REUSED !== "NOT_AVAILABLE") {
    throw new Error("C5 must report D1C torsion demand as NOT_AVAILABLE");
  }
  if (input.demand.torsion.status !== "NOT_IMPLEMENTED") {
    throw new Error("C5 must not consume a fabricated torsion demand");
  }
  return undetermined(
    "TORSION",
    input,
    { value: null, unit: null, source: "D1C_TORSION_NOT_IMPLEMENTED" },
    "D1C_TORSION_DEMAND_NOT_AVAILABLE",
    EU_C5_TORSION_BLOCKED_RULE_IDS,
    ["D1C torsion demand is NOT_IMPLEMENTED; shear demand is not a torsion action"],
  );
}

export function evaluateEuC5Family(family: EuC5FamilyId, input: EuC5EvaluateInput): EuC5CheckResult {
  if (family === "SHEAR") return evaluateEuC5Shear(input);
  if (family === "PUNCHING") return evaluateEuC5Punching(input);
  return evaluateEuC5Torsion(input);
}
