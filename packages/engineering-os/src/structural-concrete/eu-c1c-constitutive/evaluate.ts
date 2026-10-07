import type {
  ConcreteMaterial,
  EuC1cConstitutiveFailResult,
  EuC1cConstitutiveRuleResult,
  EuC1cConstitutiveRuleResultProvenance,
  EuC1cConstitutiveSuccessResult,
  EuC1cConstitutiveTargetRuleId,
  RcMaterialResponse,
  ReinforcementMaterial,
} from "@rtb/types";
import {
  CONSTITUTIVE_CROSS_GENERATION_RULE_MIXING,
  DEFAULT_EU_CONCRETE_NATIONAL_ANNEX,
  CONSTITUTIVE_ENGINEER_VALIDATION_STATE,
  EU_C1C_CONSTITUTIVE_EVIDENCE_VERSION,
  EU_C1C_CONSTITUTIVE_IMPLEMENTATION_VERSION,
  EU_C1C_CONSTITUTIVE_MODEL_ID,
  EU_C1C_CONSTITUTIVE_PARAMETER_VERSION,
  EU_C1C_CONSTITUTIVE_REO_MODEL_ID,
  EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE,
  NATIONAL_ANNEX_INFERRED_FROM_LOCATION,
  PARALLEL_CONSTITUTIVE_ARCHITECTURE_CREATED,
  PARALLEL_EU_MATERIAL_RESPONSE_ENGINE_CREATED,
  PARALLEL_EU_RULE_ENGINE_CREATED,
  UNSUPPORTED_STANDARD_PROFILE_METADATA_INFERRED,
} from "@rtb/types";
import type { EuC1ProfileContext } from "../eu-c1";
import { convertGovernedQuantity } from "../eu-c1";
import type { EuC1cR1StandardContext } from "../eu-c1c-r1";
import { evaluateEuC1ConcreteDesignProperties, evaluateEuC1PartialFactorGammaS } from "../eu-c1c-r1";
import { assertEuCodeParametersUnpopulated } from "../eu-standard";
import type { RcConcreteFiberResponse, RcReinforcementPointResponse } from "../section-mechanics";
import { failClosed } from "../section-mechanics/units";
import { assertEuC1cConstitutiveAiBoundary } from "./authority";
import {
  constitutiveEvidenceRefs,
  constitutiveFormulaFingerprint,
  EU_C1C_CONSTITUTIVE_HIGH_STRENGTH_CONFLICT,
  EU_C1C_CONSTITUTIVE_PARAMETERS,
  assertEuC1cConstitutiveEvidenceLoaded,
} from "./evidence";
import { euC1cConstitutiveResultFingerprint } from "./invalidation";
import { convertGovernedExponent, convertGovernedStrain, convertGovernedStressMPa, finiteNumberOrNull } from "./units";

export type EuC1cConstitutiveContext = EuC1cR1StandardContext & {
  testOnlyNonConformance?: boolean;
  limitState?: "ULS" | "SLS";
};

export type EuC1cConstitutiveConcreteInput = {
  concrete: ConcreteMaterial;
  kernelStrain?: number;
  context: EuC1cConstitutiveContext;
  provenanceRef?: string;
};

export type EuC1cConstitutiveReinforcementInput = {
  reinforcement: ReinforcementMaterial;
  kernelStrain?: number;
  context: EuC1cConstitutiveContext;
  provenanceRef?: string;
};

function fail(ruleId: EuC1cConstitutiveTargetRuleId, checkState: EuC1cConstitutiveFailResult["checkState"], failReason: string, inputSnapshot: Record<string, unknown>): EuC1cConstitutiveFailResult {
  return {
    ok: false,
    checkState,
    failReason,
    executableForCurrentContext: false,
    outputs: null,
    provenance: null,
    inputSnapshot,
    resultFingerprint: null,
  };
}

function profileGate(ruleId: EuC1cConstitutiveTargetRuleId, profile: EuC1ProfileContext | undefined, snapshot: Record<string, unknown>): EuC1cConstitutiveFailResult | null {
  if (UNSUPPORTED_STANDARD_PROFILE_METADATA_INFERRED) {
    return fail(ruleId, "STANDARD_CONTEXT_INCOMPLETE", "unsupported profile metadata must not be inferred", snapshot);
  }
  if (DEFAULT_EU_CONCRETE_NATIONAL_ANNEX) {
    return fail(ruleId, "STANDARD_CONTEXT_INCOMPLETE", "default EU National Annex/NDP is forbidden", snapshot);
  }
  if (NATIONAL_ANNEX_INFERRED_FROM_LOCATION || profile?.inferredFromLocation) {
    return fail(ruleId, "UNSUPPORTED_SCOPE", "National Annex must not be inferred from location", snapshot);
  }
  if (profile?.standardFamily && profile.standardFamily !== "EN 1992") {
    return fail(ruleId, "UNSUPPORTED_SCOPE", `unsupported standard family ${profile.standardFamily}`, snapshot);
  }
  if (profile?.standardPart && profile.standardPart !== "EN_1992_1_1") {
    return fail(ruleId, "UNSUPPORTED_SCOPE", `unsupported standard part ${profile.standardPart}`, snapshot);
  }
  if (profile?.generation && profile.generation !== "UNKNOWN_PENDING_CONFIRMATION") {
    return fail(ruleId, "STANDARD_CONTEXT_INCOMPLETE", "generation is not confirmed and must not be assigned", snapshot);
  }
  if (profile?.edition && profile.edition !== "UNKNOWN_PENDING_CONFIRMATION") {
    return fail(ruleId, "STANDARD_CONTEXT_INCOMPLETE", "edition is not confirmed and must not be assigned", snapshot);
  }
  if (CONSTITUTIVE_CROSS_GENERATION_RULE_MIXING) {
    return fail(ruleId, "RULE_EVIDENCE_CONFLICT", "cross-generation constitutive mixing is forbidden", snapshot);
  }
  return null;
}

function contextGate(ruleId: EuC1cConstitutiveTargetRuleId, context: EuC1cConstitutiveContext | undefined, snapshot: Record<string, unknown>): EuC1cConstitutiveFailResult | null {
  if (!context) return fail(ruleId, "STANDARD_CONTEXT_INCOMPLETE", "declared NDP/standard context is required", snapshot);
  if (context.defaultNdpApplied) return fail(ruleId, "CHECK_UNDETERMINED", "silent default NDP values are forbidden", snapshot);
  if (context.inferredFromLocation) return fail(ruleId, "UNSUPPORTED_SCOPE", "National Annex must not be inferred from location", snapshot);
  const annex = context.nationalAnnexRef?.trim() ?? "";
  const project = context.projectOverrideRef?.trim() ?? "";
  if (!annex && !project) return fail(ruleId, "STANDARD_CONTEXT_INCOMPLETE", "missing declared National Annex or project override identity", snapshot);
  if (context.evidenceVersion && context.evidenceVersion !== EU_C1C_CONSTITUTIVE_EVIDENCE_VERSION && context.evidenceVersion !== "c1c-evidence.0") {
    return fail(ruleId, "CHECK_UNDETERMINED", `stale evidence version ${context.evidenceVersion}`, snapshot);
  }
  if (context.limitState === "SLS") return fail(ruleId, "UNSUPPORTED_SCOPE", "constitutive pack is ULS section-analysis only", snapshot);
  return profileGate(ruleId, context.profile, snapshot);
}

function provenanceShell(ruleId: EuC1cConstitutiveTargetRuleId, modelId: string): EuC1cConstitutiveRuleResultProvenance {
  const refs = constitutiveEvidenceRefs(ruleId);
  return {
    ruleId,
    authorityType: ruleId === "EU_C1_REINFORCEMENT_RESPONSE" ? "ESTABLISHED_ENGINEERING_MECHANICS" : "AUTHORITATIVE_STANDARD_DERIVED",
    sourceEvidenceRefs: refs.sourceRefs,
    independentEvidenceRefs: refs.independentRefs,
    formulaFingerprint: constitutiveFormulaFingerprint(ruleId),
    parameterIds: [...(ruleId === "EU_C1_REINFORCEMENT_RESPONSE"
      ? (["Es", "fyd"] as const)
      : ruleId === "EU_C1_CONCRETE_STRAIN_LIMITS"
        ? (["eps_c2", "eps_cu2", "n_parabola", "fck_constant_strain_limit"] as const)
        : (["fcd", "eps_c2", "eps_cu2", "n_parabola", "fck_constant_strain_limit"] as const))],
    parameterVersions: [EU_C1C_CONSTITUTIVE_PARAMETER_VERSION],
    inputUnits: {},
    outputUnits: {},
    applicability:
      "first-generation EN 1992-1-1 section analysis, static ULS, ambient temperature, normal-weight concrete fck at or below the constant-strain-parameter limit; not member resistance; not CONFORMANCE_VALIDATED",
    standardFamily: "EN 1992",
    standardPart: "EN_1992_1_1",
    intendedGeneration: "UNKNOWN_PENDING_CONFIRMATION",
    intendedEdition: "UNKNOWN_PENDING_CONFIRMATION",
    modelId,
    validationState: "NUMERICALLY_VALIDATED",
    engineeringValidationState: CONSTITUTIVE_ENGINEER_VALIDATION_STATE,
    conformanceState: "INTENDED_PROFILE",
    implementationVersion: EU_C1C_CONSTITUTIVE_IMPLEMENTATION_VERSION,
    evidenceVersion: EU_C1C_CONSTITUTIVE_EVIDENCE_VERSION,
    maturity: "NUMERICALLY_VALIDATED",
    provenance: ruleId,
  };
}

function success<T extends Record<string, number | string>>(
  ruleId: EuC1cConstitutiveTargetRuleId,
  modelId: string,
  outputs: T,
  inputUnits: Record<string, string | null>,
  outputUnits: Record<string, string | null>,
  snapshot: Record<string, unknown>,
): EuC1cConstitutiveSuccessResult<T> {
  const provenance = { ...provenanceShell(ruleId, modelId), inputUnits, outputUnits };
  return {
    ok: true,
    checkState: "OK",
    failReason: null,
    executableForCurrentContext: true,
    outputs,
    provenance,
    inputSnapshot: snapshot,
    resultFingerprint: euC1cConstitutiveResultFingerprint({
      ruleId,
      version: EU_C1C_CONSTITUTIVE_IMPLEMENTATION_VERSION,
      evidenceVersion: EU_C1C_CONSTITUTIVE_EVIDENCE_VERSION,
      fingerprint: provenance.formulaFingerprint,
      parameterVersion: EU_C1C_CONSTITUTIVE_PARAMETER_VERSION,
      modelId,
      outputs: JSON.stringify(outputs),
      snapshot: JSON.stringify(snapshot),
    }),
  };
}

function architectureGate(ruleId: EuC1cConstitutiveTargetRuleId, snapshot: Record<string, unknown>): EuC1cConstitutiveFailResult | null {
  assertEuC1cConstitutiveAiBoundary();
  assertEuC1cConstitutiveEvidenceLoaded();
  assertEuCodeParametersUnpopulated();
  if (PARALLEL_CONSTITUTIVE_ARCHITECTURE_CREATED || PARALLEL_EU_RULE_ENGINE_CREATED || PARALLEL_EU_MATERIAL_RESPONSE_ENGINE_CREATED) {
    return fail(ruleId, "CHECK_UNDETERMINED", "parallel constitutive/EU material engine is forbidden", snapshot);
  }
  return null;
}

function resolvedStrainParameters(ruleId: EuC1cConstitutiveTargetRuleId, snapshot: Record<string, unknown>) {
  const epsC2 = convertGovernedStrain(EU_C1C_CONSTITUTIVE_PARAMETERS.eps_c2.value, EU_C1C_CONSTITUTIVE_PARAMETERS.eps_c2.units, "eps_c2");
  const epsCu2 = convertGovernedStrain(EU_C1C_CONSTITUTIVE_PARAMETERS.eps_cu2.value, EU_C1C_CONSTITUTIVE_PARAMETERS.eps_cu2.units, "eps_cu2");
  const n = convertGovernedExponent(EU_C1C_CONSTITUTIVE_PARAMETERS.n_parabola.value, EU_C1C_CONSTITUTIVE_PARAMETERS.n_parabola.units, "n_parabola");
  const fckLimit = convertGovernedStressMPa(
    EU_C1C_CONSTITUTIVE_PARAMETERS.fck_constant_strain_limit.value,
    EU_C1C_CONSTITUTIVE_PARAMETERS.fck_constant_strain_limit.units,
    "fck_constant_strain_limit",
  );
  if (!epsC2.ok) return fail(ruleId, "CHECK_UNDETERMINED", epsC2.reason, snapshot);
  if (!epsCu2.ok) return fail(ruleId, "CHECK_UNDETERMINED", epsCu2.reason, snapshot);
  if (!n.ok) return fail(ruleId, "CHECK_UNDETERMINED", n.reason, snapshot);
  if (!fckLimit.ok) return fail(ruleId, "CHECK_UNDETERMINED", fckLimit.reason, snapshot);
  if (EU_C1C_CONSTITUTIVE_PARAMETERS.eps_c2.modelId !== EU_C1C_CONSTITUTIVE_MODEL_ID || EU_C1C_CONSTITUTIVE_PARAMETERS.eps_cu2.modelId !== EU_C1C_CONSTITUTIVE_MODEL_ID) {
    return fail(ruleId, "RULE_EVIDENCE_CONFLICT", "incompatible strain/response model", snapshot);
  }
  if (!(epsCu2.value > epsC2.value) || !(epsC2.value > 0)) {
    return fail(ruleId, "CHECK_UNDETERMINED", "strain-state ordering is invalid", snapshot);
  }
  return { epsC2: epsC2.value, epsCu2: epsCu2.value, n: n.value, fckLimitMPa: fckLimit.value };
}

export function evaluateEuC1ConcreteStrainLimits(input: EuC1cConstitutiveConcreteInput): EuC1cConstitutiveRuleResult<{
  epsC2: number;
  epsCu2: number;
  n: number;
  fckLimitMPa: number;
  modelId: string;
}> {
  const ruleId = "EU_C1_CONCRETE_STRAIN_LIMITS";
  const snapshot = { designation: input.concrete.designation, compressiveStrength: input.concrete.compressiveStrength, context: input.context };
  const blocked = architectureGate(ruleId, snapshot) ?? contextGate(ruleId, input.context, snapshot);
  if (blocked) return blocked;
  const design = evaluateEuC1ConcreteDesignProperties({ concrete: input.concrete, context: input.context });
  if (!design.ok) return fail(ruleId, design.checkState, design.failReason ?? "design properties unresolved", snapshot);
  const params = resolvedStrainParameters(ruleId, snapshot);
  if ("ok" in params) return params;
  if (design.outputs.fckMPa > params.fckLimitMPa) {
    return fail(ruleId, "RULE_EVIDENCE_CONFLICT", EU_C1C_CONSTITUTIVE_HIGH_STRENGTH_CONFLICT, snapshot);
  }
  return success(
    ruleId,
    EU_C1C_CONSTITUTIVE_MODEL_ID,
    { epsC2: params.epsC2, epsCu2: params.epsCu2, n: params.n, fckLimitMPa: params.fckLimitMPa, modelId: EU_C1C_CONSTITUTIVE_MODEL_ID },
    { fck: input.concrete.compressiveStrength?.unit ?? null, eps_c2: EU_C1C_CONSTITUTIVE_PARAMETERS.eps_c2.units, eps_cu2: EU_C1C_CONSTITUTIVE_PARAMETERS.eps_cu2.units },
    { eps_c2: "m/m", eps_cu2: "m/m", n: "dimensionless", fck_limit: "MPa" },
    snapshot,
  );
}

export function evaluateEuC1ConcreteCompressionResponse(input: EuC1cConstitutiveConcreteInput): EuC1cConstitutiveRuleResult<{
  kernelStressMPa: number;
  tangentMPa: number;
  fcdMPa: number;
  modelId: string;
}> {
  const ruleId = "EU_C1_CONCRETE_COMPRESSION_RESPONSE";
  const snapshot = { designation: input.concrete.designation, kernelStrain: input.kernelStrain, context: input.context };
  const blocked = architectureGate(ruleId, snapshot) ?? contextGate(ruleId, input.context, snapshot);
  if (blocked) return blocked;
  const strainStates = evaluateEuC1ConcreteStrainLimits(input);
  if (!strainStates.ok) return fail(ruleId, strainStates.checkState, strainStates.failReason ?? "strain states unresolved", snapshot);
  const design = evaluateEuC1ConcreteDesignProperties({ concrete: input.concrete, context: input.context });
  if (!design.ok) return fail(ruleId, design.checkState, design.failReason ?? "design properties unresolved", snapshot);
  if (strainStates.outputs.modelId !== EU_C1C_CONSTITUTIVE_MODEL_ID) {
    return fail(ruleId, "RULE_EVIDENCE_CONFLICT", "incompatible strain/response model", snapshot);
  }
  const eps = finiteNumberOrNull(input.kernelStrain);
  if (eps == null) return fail(ruleId, "CHECK_UNDETERMINED", "kernel strain is not a finite number", snapshot);
  const fcd = design.outputs.fcdMPa;
  const { epsC2, epsCu2, n } = strainStates.outputs;
  if (eps > 0) {
    return success(ruleId, EU_C1C_CONSTITUTIVE_MODEL_ID, { kernelStressMPa: 0, tangentMPa: 0, fcdMPa: fcd, modelId: EU_C1C_CONSTITUTIVE_MODEL_ID }, { strain: "m/m", fcd: "MPa" }, { stress: "MPa", tangent: "MPa" }, snapshot);
  }
  const epsC = -eps;
  if (epsC > epsCu2) return fail(ruleId, "UNSUPPORTED_SCOPE", "kernel compressive strain exceeds eps_cu2", snapshot);
  let kernelStressMPa: number;
  let tangentMPa: number;
  if (epsC <= epsC2) {
    const xi = epsC / epsC2;
    const residual = 1 - xi;
    kernelStressMPa = -fcd * (1 - residual ** n);
    tangentMPa = (fcd * n * residual ** (n - 1)) / epsC2;
  } else {
    kernelStressMPa = -fcd;
    tangentMPa = 0;
  }
  if (!Number.isFinite(kernelStressMPa) || !Number.isFinite(tangentMPa)) {
    return fail(ruleId, "CHECK_UNDETERMINED", "constitutive stress is not finite", snapshot);
  }
  return success(
    ruleId,
    EU_C1C_CONSTITUTIVE_MODEL_ID,
    { kernelStressMPa, tangentMPa, fcdMPa: fcd, modelId: EU_C1C_CONSTITUTIVE_MODEL_ID },
    { strain: "m/m", fcd: "MPa" },
    { stress: "MPa", tangent: "MPa" },
    snapshot,
  );
}

export function evaluateEuC1ReinforcementResponse(input: EuC1cConstitutiveReinforcementInput): EuC1cConstitutiveRuleResult<{
  kernelStressMPa: number;
  tangentMPa: number;
  fydMPa: number;
  esMPa: number;
  modelId: string;
}> {
  const ruleId = "EU_C1_REINFORCEMENT_RESPONSE";
  const snapshot = { designation: input.reinforcement.designation, kernelStrain: input.kernelStrain, context: input.context };
  const blocked = architectureGate(ruleId, snapshot) ?? contextGate(ruleId, input.context, snapshot);
  if (blocked) return blocked;
  const gamma = evaluateEuC1PartialFactorGammaS({ context: input.context });
  if (!gamma.ok) return fail(ruleId, gamma.checkState, gamma.failReason ?? "gamma_s unresolved", snapshot);
  const fyk = convertGovernedQuantity(input.reinforcement.yieldStrength, "STRESS", "fyk");
  if (!fyk.ok) return fail(ruleId, "STANDARD_CONTEXT_INCOMPLETE", fyk.reason, snapshot);
  const es = convertGovernedQuantity(input.reinforcement.elasticModulus, "STRESS", "reinforcement.Es");
  if (!es.ok) return fail(ruleId, "STANDARD_CONTEXT_INCOMPLETE", es.reason, snapshot);
  const eps = finiteNumberOrNull(input.kernelStrain);
  if (eps == null) return fail(ruleId, "CHECK_UNDETERMINED", "kernel strain is not a finite number", snapshot);
  const fyd = fyk.value / gamma.outputs.gammaS;
  if (!Number.isFinite(fyd) || !(fyd > 0)) return fail(ruleId, "CHECK_UNDETERMINED", "design yield strength is not a finite positive stress", snapshot);
  let kernelStressMPa = es.value * eps;
  let tangentMPa = es.value;
  if (kernelStressMPa > fyd) {
    kernelStressMPa = fyd;
    tangentMPa = 0;
  } else if (kernelStressMPa < -fyd) {
    kernelStressMPa = -fyd;
    tangentMPa = 0;
  }
  if (!Number.isFinite(kernelStressMPa)) return fail(ruleId, "CHECK_UNDETERMINED", "reinforcement stress is not finite", snapshot);
  return success(
    ruleId,
    EU_C1C_CONSTITUTIVE_REO_MODEL_ID,
    { kernelStressMPa, tangentMPa, fydMPa: fyd, esMPa: es.value, modelId: EU_C1C_CONSTITUTIVE_REO_MODEL_ID },
    { strain: "m/m", Es: input.reinforcement.elasticModulus?.unit ?? null, fyd: "MPa" },
    { stress: "MPa", tangent: "MPa" },
    snapshot,
  );
}

export function bindEuC1ConcreteFiberResponse(context: EuC1cConstitutiveContext): RcConcreteFiberResponse {
  return (material, strain, _tension, provenanceRef): RcMaterialResponse => {
    const result = evaluateEuC1ConcreteCompressionResponse({ concrete: material, kernelStrain: strain, context, provenanceRef });
    if (!result.ok) failClosed(result.failReason);
    return {
      stressMPa: result.outputs.kernelStressMPa,
      tangentMPa: result.outputs.tangentMPa,
      responseState: EU_C1C_CONSTITUTIVE_MODEL_ID,
      provenanceRef,
    };
  };
}

export function bindEuC1ReinforcementPointResponse(context: EuC1cConstitutiveContext): RcReinforcementPointResponse {
  return (material, strain, provenanceRef): RcMaterialResponse => {
    const result = evaluateEuC1ReinforcementResponse({ reinforcement: material, kernelStrain: strain, context, provenanceRef });
    if (!result.ok) failClosed(result.failReason);
    return {
      stressMPa: result.outputs.kernelStressMPa,
      tangentMPa: result.outputs.tangentMPa,
      responseState: EU_C1C_CONSTITUTIVE_REO_MODEL_ID,
      provenanceRef,
    };
  };
}

export function assertTestOnlyNdpNeverDefault(context: EuC1cConstitutiveContext): void {
  if (context.testOnlyNonConformance && context.defaultNdpApplied) {
    throw new Error("TEST_ONLY_NON_CONFORMANCE must never become a default runtime NDP");
  }
  if (context.testOnlyNonConformance) {
    const marked = [context.gamma_c, context.gamma_s, context.alpha_cc].every(
      (item) => item?.sourceAuthority === EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE,
    );
    if (!marked) throw new Error("test-only NDP values must be labelled TEST_ONLY_NON_CONFORMANCE");
  }
}
