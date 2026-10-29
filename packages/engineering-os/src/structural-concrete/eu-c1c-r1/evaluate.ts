import type {
  ConcreteGovernedProperty,
  ConcreteMaterial,
  EuC1cR1DeclaredNdpValue,
  EuC1cR1FailResult,
  EuC1cR1RuleResult,
  EuC1cR1RuleResultProvenance,
  EuC1cR1SuccessResult,
  EuC1cR1TargetRuleId,
  ReinforcementMaterial,
} from "@rtb/types";
import {
  DEFAULT_EU_CONCRETE_NATIONAL_ANNEX,
  EU_C1C_R1_DEFAULT_NDP_VALUE,
  EU_C1C_R1_ENGINEER_VALIDATION_STATE,
  EU_C1C_R1_EVIDENCE_VERSION,
  EU_C1C_R1_IMPLEMENTATION_VERSION,
  EU_C1C_R1_PARAMETER_VERSION,
  NATIONAL_ANNEX_INFERRED_FROM_LOCATION,
  PARALLEL_EU_MATERIAL_RESPONSE_ENGINE_CREATED,
  PARALLEL_EU_RULE_ENGINE_CREATED,
  PARALLEL_PARTIAL_FACTOR_RESOLVER_CREATED,
  UNSUPPORTED_STANDARD_PROFILE_METADATA_INFERRED,
} from "@rtb/types";
import type { EuC1ProfileContext } from "../eu-c1";
import { evaluateEuC1ConcreteCharProperties, evaluateEuC1ReinforcementCharProperties } from "../eu-c1";
import { assertEuCodeParametersUnpopulated, EU_CONCRETE_PARTIAL_FACTOR_DEPENDENCY } from "../eu-standard";
import { assertEuC1cR1AiBoundary } from "./authority";
import { assertEuC1cR1EvidenceLoaded, assertR1FormulaFingerprintMatches, r1EvidenceFor } from "./evidence";
import { euC1cR1ResultFingerprint } from "./invalidation";
import { convertDeclaredDimensionless } from "./units";

export type EuC1cR1StandardContext = {
  nationalAnnexRef?: string | null;
  projectOverrideRef?: string | null;
  inferredFromLocation?: boolean;
  defaultNdpApplied?: boolean;
  gamma_c?: EuC1cR1DeclaredNdpValue | null;
  gamma_s?: EuC1cR1DeclaredNdpValue | null;
  alpha_cc?: EuC1cR1DeclaredNdpValue | null;
  evidenceVersion?: string;
  profile?: EuC1ProfileContext;
};

export type EuC1cR1GammaInput = { context: EuC1cR1StandardContext };
export type EuC1cR1ConcreteDesignInput = { concrete: ConcreteMaterial; context: EuC1cR1StandardContext };
export type EuC1cR1ReinforcementDesignInput = {
  reinforcement: ReinforcementMaterial;
  area: ConcreteGovernedProperty | null;
  designation?: string | null;
  context: EuC1cR1StandardContext;
};

function mapC1FailState(state: string): EuC1cR1FailResult["checkState"] {
  if (state === "UNSUPPORTED_SCOPE" || state === "STANDARD_CONTEXT_INCOMPLETE" || state === "CHECK_UNDETERMINED" || state === "RULE_EVIDENCE_CONFLICT") {
    return state;
  }
  return "CHECK_UNDETERMINED";
}

function fail(ruleId: EuC1cR1TargetRuleId, checkState: EuC1cR1FailResult["checkState"], failReason: string, inputSnapshot: Record<string, unknown>): EuC1cR1FailResult {
  return {
    ok: false,
    checkState,
    failReason,
    executableForCurrentContext: false,
    outputs: null,
    provenance: provenanceShell(ruleId),
    inputSnapshot,
    resultFingerprint: null,
  };
}

function profileGate(ruleId: EuC1cR1TargetRuleId, profile: EuC1ProfileContext | undefined, snapshot: Record<string, unknown>): EuC1cR1FailResult | null {
  if (UNSUPPORTED_STANDARD_PROFILE_METADATA_INFERRED) {
    return fail(ruleId, "STANDARD_CONTEXT_INCOMPLETE", "unsupported profile metadata must not be inferred", snapshot);
  }
  if (DEFAULT_EU_CONCRETE_NATIONAL_ANNEX || EU_C1C_R1_DEFAULT_NDP_VALUE) {
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
  if (profile?.amendmentState && profile.amendmentState !== "UNKNOWN_PENDING_CONFIRMATION") {
    return fail(ruleId, "STANDARD_CONTEXT_INCOMPLETE", "amendment state is not confirmed and must not be assigned", snapshot);
  }
  return null;
}

function ndpContextGate(ruleId: EuC1cR1TargetRuleId, context: EuC1cR1StandardContext | undefined, snapshot: Record<string, unknown>): EuC1cR1FailResult | null {
  if (!context) return fail(ruleId, "STANDARD_CONTEXT_INCOMPLETE", "declared NDP/standard context is required", snapshot);
  if (context.defaultNdpApplied) {
    return fail(ruleId, "CHECK_UNDETERMINED", "silent default NDP values are forbidden", snapshot);
  }
  if (context.inferredFromLocation) {
    return fail(ruleId, "UNSUPPORTED_SCOPE", "National Annex must not be inferred from location", snapshot);
  }
  const annex = context.nationalAnnexRef?.trim() ?? "";
  const project = context.projectOverrideRef?.trim() ?? "";
  if (!annex && !project) {
    return fail(ruleId, "STANDARD_CONTEXT_INCOMPLETE", "missing declared National Annex or project override identity", snapshot);
  }
  if (context.evidenceVersion && context.evidenceVersion !== EU_C1C_R1_EVIDENCE_VERSION) {
    return fail(ruleId, "CHECK_UNDETERMINED", `stale evidence version ${context.evidenceVersion}`, snapshot);
  }
  return profileGate(ruleId, context.profile, snapshot);
}

function provenanceShell(ruleId: EuC1cR1TargetRuleId): EuC1cR1RuleResultProvenance {
  const evidence = r1EvidenceFor(ruleId);
  return {
    ruleId,
    authorityType: evidence.authorityType,
    sourceEvidenceRefs: [...evidence.sourceRefs],
    independentEvidenceRefs: [...evidence.independentEvidenceRefs],
    formulaFingerprint: evidence.formulaFingerprintCandidate ?? "",
    parameterIds: [...evidence.parameterIds],
    parameterVersions: evidence.parameterIds.map(() => EU_C1C_R1_PARAMETER_VERSION),
    inputUnits: {},
    outputUnits: {},
    applicability: evidence.applicability,
    standardFamily: "EN 1992",
    standardPart: "EN_1992_1_1",
    intendedGeneration: "UNKNOWN_PENDING_CONFIRMATION",
    intendedEdition: "UNKNOWN_PENDING_CONFIRMATION",
    nationalAnnexDependency: true,
    ndpDependency: true,
    dependencyClass: "NDP_DEPENDENT",
    validationState: "NUMERICALLY_VALIDATED",
    engineeringValidationState: EU_C1C_R1_ENGINEER_VALIDATION_STATE,
    conformanceState: "INTENDED_PROFILE",
    implementationVersion: EU_C1C_R1_IMPLEMENTATION_VERSION,
    evidenceVersion: EU_C1C_R1_EVIDENCE_VERSION,
    maturity: "NUMERICALLY_VALIDATED",
    provenance: evidence.provenance,
  };
}

function success<T extends Record<string, number | string>>(
  ruleId: EuC1cR1TargetRuleId,
  outputs: T,
  inputUnits: Record<string, string | null>,
  outputUnits: Record<string, string | null>,
  snapshot: Record<string, unknown>,
): EuC1cR1SuccessResult<T> {
  const provenance = { ...provenanceShell(ruleId), inputUnits, outputUnits };
  const resultFingerprint = euC1cR1ResultFingerprint({
    ruleId,
    version: EU_C1C_R1_IMPLEMENTATION_VERSION,
    evidenceVersion: EU_C1C_R1_EVIDENCE_VERSION,
    fingerprint: provenance.formulaFingerprint,
    parameterVersion: EU_C1C_R1_PARAMETER_VERSION,
    outputs: JSON.stringify(outputs),
    snapshot: JSON.stringify(snapshot),
  });
  return {
    ok: true,
    checkState: "OK",
    failReason: null,
    executableForCurrentContext: true,
    outputs,
    provenance,
    inputSnapshot: snapshot,
    resultFingerprint,
  };
}

function architectureGate(ruleId: EuC1cR1TargetRuleId, snapshot: Record<string, unknown>): EuC1cR1FailResult | null {
  assertEuC1cR1AiBoundary();
  assertEuC1cR1EvidenceLoaded();
  assertEuCodeParametersUnpopulated();
  if (PARALLEL_EU_RULE_ENGINE_CREATED || PARALLEL_EU_MATERIAL_RESPONSE_ENGINE_CREATED || PARALLEL_PARTIAL_FACTOR_RESOLVER_CREATED) {
    return fail(ruleId, "CHECK_UNDETERMINED", "parallel EU rule/material/partial-factor engine is forbidden", snapshot);
  }
  if (EU_CONCRETE_PARTIAL_FACTOR_DEPENDENCY.concreteMaterial.value != null || EU_CONCRETE_PARTIAL_FACTOR_DEPENDENCY.reinforcementMaterial.value != null) {
    return fail(ruleId, "RULE_EVIDENCE_CONFLICT", "adapter packed partial factors must remain unpopulated", snapshot);
  }
  return null;
}

function resolveDeclaredGamma(
  ruleId: "EU_C1_PARTIAL_FACTOR_GAMMA_C" | "EU_C1_PARTIAL_FACTOR_GAMMA_S",
  context: EuC1cR1StandardContext,
  snapshot: Record<string, unknown>,
): EuC1cR1RuleResult<{ gammaC: number } | { gammaS: number }> {
  const blocked = architectureGate(ruleId, snapshot) ?? ndpContextGate(ruleId, context, snapshot);
  if (blocked) return blocked;
  assertR1FormulaFingerprintMatches(ruleId);
  const parameterId = ruleId === "EU_C1_PARTIAL_FACTOR_GAMMA_C" ? "gamma_c" : "gamma_s";
  const declared = parameterId === "gamma_c" ? context.gamma_c : context.gamma_s;
  const converted = convertDeclaredDimensionless(declared, parameterId);
  if (!converted.ok) return fail(ruleId, "STANDARD_CONTEXT_INCOMPLETE", converted.reason, snapshot);
  if (parameterId === "gamma_c") {
    return success(ruleId, { gammaC: converted.value }, { gamma_c: declared?.unit ?? null }, { gamma_c: converted.outputUnit }, snapshot);
  }
  return success(ruleId, { gammaS: converted.value }, { gamma_s: declared?.unit ?? null }, { gamma_s: converted.outputUnit }, snapshot);
}

export function evaluateEuC1PartialFactorGammaC(input: EuC1cR1GammaInput): EuC1cR1RuleResult<{ gammaC: number }> {
  const snapshot = { context: input.context };
  return resolveDeclaredGamma("EU_C1_PARTIAL_FACTOR_GAMMA_C", input.context, snapshot) as EuC1cR1RuleResult<{ gammaC: number }>;
}

export function evaluateEuC1PartialFactorGammaS(input: EuC1cR1GammaInput): EuC1cR1RuleResult<{ gammaS: number }> {
  const snapshot = { context: input.context };
  return resolveDeclaredGamma("EU_C1_PARTIAL_FACTOR_GAMMA_S", input.context, snapshot) as EuC1cR1RuleResult<{ gammaS: number }>;
}

export function evaluateEuC1ConcreteDesignProperties(input: EuC1cR1ConcreteDesignInput): EuC1cR1RuleResult<{
  fckMPa: number;
  alphaCc: number;
  gammaC: number;
  fcdMPa: number;
}> {
  const ruleId = "EU_C1_CONCRETE_DESIGN_PROPERTIES";
  const snapshot = { designation: input.concrete.designation, compressiveStrength: input.concrete.compressiveStrength, context: input.context };
  const blocked = architectureGate(ruleId, snapshot) ?? ndpContextGate(ruleId, input.context, snapshot);
  if (blocked) return blocked;
  assertR1FormulaFingerprintMatches(ruleId);
  const chars = evaluateEuC1ConcreteCharProperties({ concrete: input.concrete, profile: input.context.profile });
  if (!chars.ok) return fail(ruleId, mapC1FailState(chars.checkState), chars.failReason ?? "characteristic concrete properties unresolved", snapshot);
  const gamma = evaluateEuC1PartialFactorGammaC({ context: input.context });
  if (!gamma.ok) return fail(ruleId, gamma.checkState, gamma.failReason, snapshot);
  const alpha = convertDeclaredDimensionless(input.context.alpha_cc, "alpha_cc");
  if (!alpha.ok) return fail(ruleId, "STANDARD_CONTEXT_INCOMPLETE", alpha.reason, snapshot);
  const fcdMPa = (alpha.value * chars.outputs.compressiveStrengthMPa) / gamma.outputs.gammaC;
  if (!Number.isFinite(fcdMPa) || !(fcdMPa > 0)) {
    return fail(ruleId, "CHECK_UNDETERMINED", "design compressive strength is not a finite positive stress", snapshot);
  }
  return success(
    ruleId,
    { fckMPa: chars.outputs.compressiveStrengthMPa, alphaCc: alpha.value, gammaC: gamma.outputs.gammaC, fcdMPa },
    {
      fck: input.concrete.compressiveStrength?.unit ?? null,
      alpha_cc: input.context.alpha_cc?.unit ?? null,
      gamma_c: input.context.gamma_c?.unit ?? null,
    },
    { fck: "MPa", alpha_cc: "dimensionless", gamma_c: "dimensionless", fcd: "MPa" },
    snapshot,
  );
}

export function evaluateEuC1ReinforcementDesignProperties(input: EuC1cR1ReinforcementDesignInput): EuC1cR1RuleResult<{
  fykMPa: number;
  gammaS: number;
  fydMPa: number;
}> {
  const ruleId = "EU_C1_REINFORCEMENT_DESIGN_PROPERTIES";
  const snapshot = { designation: input.designation ?? input.reinforcement.designation, yieldStrength: input.reinforcement.yieldStrength, context: input.context };
  const blocked = architectureGate(ruleId, snapshot) ?? ndpContextGate(ruleId, input.context, snapshot);
  if (blocked) return blocked;
  assertR1FormulaFingerprintMatches(ruleId);
  const chars = evaluateEuC1ReinforcementCharProperties({
    reinforcement: input.reinforcement,
    area: input.area,
    designation: input.designation,
    profile: input.context.profile,
  });
  if (!chars.ok) return fail(ruleId, mapC1FailState(chars.checkState), chars.failReason ?? "characteristic reinforcement properties unresolved", snapshot);
  const gamma = evaluateEuC1PartialFactorGammaS({ context: input.context });
  if (!gamma.ok) return fail(ruleId, gamma.checkState, gamma.failReason, snapshot);
  const fydMPa = chars.outputs.yieldStrengthMPa / gamma.outputs.gammaS;
  if (!Number.isFinite(fydMPa) || !(fydMPa > 0)) {
    return fail(ruleId, "CHECK_UNDETERMINED", "design yield strength is not a finite positive stress", snapshot);
  }
  return success(
    ruleId,
    { fykMPa: chars.outputs.yieldStrengthMPa, gammaS: gamma.outputs.gammaS, fydMPa },
    { fyk: input.reinforcement.yieldStrength?.unit ?? null, gamma_s: input.context.gamma_s?.unit ?? null },
    { fyk: "MPa", gamma_s: "dimensionless", fyd: "MPa" },
    snapshot,
  );
}

export function consumeEuC1cR1RulePack(
  ruleId: EuC1cR1TargetRuleId,
  input: EuC1cR1GammaInput | EuC1cR1ConcreteDesignInput | EuC1cR1ReinforcementDesignInput,
): EuC1cR1RuleResult {
  if (ruleId === "EU_C1_PARTIAL_FACTOR_GAMMA_C") return evaluateEuC1PartialFactorGammaC(input as EuC1cR1GammaInput);
  if (ruleId === "EU_C1_PARTIAL_FACTOR_GAMMA_S") return evaluateEuC1PartialFactorGammaS(input as EuC1cR1GammaInput);
  if (ruleId === "EU_C1_CONCRETE_DESIGN_PROPERTIES") return evaluateEuC1ConcreteDesignProperties(input as EuC1cR1ConcreteDesignInput);
  return evaluateEuC1ReinforcementDesignProperties(input as EuC1cR1ReinforcementDesignInput);
}
