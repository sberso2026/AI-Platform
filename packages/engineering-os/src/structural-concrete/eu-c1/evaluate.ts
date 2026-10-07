import type {
  ConcreteGovernedProperty,
  ConcreteMaterial,
  EuC1FailResult,
  EuC1ImplementationReadyRuleId,
  EuC1RuleResult,
  EuC1RuleResultProvenance,
  EuC1SuccessResult,
  RcConcreteTensionTreatment,
  ReinforcementMaterial,
} from "@rtb/types";
import {
  CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES,
  DEFAULT_EU_CONCRETE_NATIONAL_ANNEX,
  EU_C1_ENGINEER_VALIDATION_STATE,
  EU_C1_IMPLEMENTATION_VERSION,
  EU_C1_NDP_VALUE_GUESSED,
  EU_C1_PARAMETER_VERSION,
  NATIONAL_ANNEX_INFERRED_FROM_LOCATION,
  PARALLEL_EU_MATERIAL_RESPONSE_ENGINE_CREATED,
  PARALLEL_EU_RULE_ENGINE_CREATED,
  UNGOVERNED_BAR_DESIGNATION_GENERATES_AREA,
  UNSUPPORTED_STANDARD_PROFILE_METADATA_INFERRED,
} from "@rtb/types";
import {
  assertBarAreaNotInferredFromDesignation,
  requireConcreteMaterialProperties,
  requireReinforcementMaterialProperties,
} from "../materials";
import { assertEuC1AiBoundary } from "./authority";
import { assertC1bEvidenceLoaded, assertFormulaFingerprintMatches, c1bEvidenceFor } from "./evidence";
import { euC1ResultFingerprint } from "./invalidation";
import { convertGovernedQuantity } from "./units";

export type EuC1ProfileContext = {
  standardFamily?: string;
  standardPart?: string;
  generation?: string;
  edition?: string;
  amendmentState?: string;
  nationalAnnexRef?: string | null;
  inferredFromLocation?: boolean;
};

export type EuC1ConcreteCharInput = { concrete: ConcreteMaterial; profile?: EuC1ProfileContext };
export type EuC1ReinforcementCharInput = {
  reinforcement: ReinforcementMaterial;
  area: ConcreteGovernedProperty | null;
  designation?: string | null;
  profile?: EuC1ProfileContext;
};
export type EuC1TensionInput = {
  concreteTensionIncludedInUlsFlexure?: boolean;
  requestedTreatment?: RcConcreteTensionTreatment;
  limitState?: "ULS_FLEXURE" | "SLS" | string;
  profile?: EuC1ProfileContext;
};

const CONCRETE_OPS = ["REQUIRE_EXPLICIT_GOVERNED_PROPERTY", "FORBID_GRADE_SYNTHESIS"] as const;
const REO_OPS = ["REQUIRE_EXPLICIT_GOVERNED_PROPERTY", "FORBID_DESIGNATION_AREA_INFERENCE"] as const;
const TENSION_OPS = ["ULS_FLEXURE_DO_NOT_INVENT_CONCRETE_TENSION", "REQUIRE_GOVERNED_MODEL_IF_INCLUDED"] as const;

function fail(ruleId: EuC1ImplementationReadyRuleId, checkState: EuC1FailResult["checkState"], failReason: string, inputSnapshot: Record<string, unknown>): EuC1FailResult {
  return { ok: false, checkState, failReason, outputs: null, provenance: provenanceShell(ruleId), inputSnapshot, resultFingerprint: null };
}

function profileGate(ruleId: EuC1ImplementationReadyRuleId, profile: EuC1ProfileContext | undefined, snapshot: Record<string, unknown>): EuC1FailResult | null {
  if (UNSUPPORTED_STANDARD_PROFILE_METADATA_INFERRED) {
    return fail(ruleId, "STANDARD_CONTEXT_INCOMPLETE", "unsupported profile metadata must not be inferred", snapshot);
  }
  if (DEFAULT_EU_CONCRETE_NATIONAL_ANNEX) {
    return fail(ruleId, "STANDARD_CONTEXT_INCOMPLETE", "default EU National Annex is forbidden", snapshot);
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

function provenanceShell(ruleId: EuC1ImplementationReadyRuleId): EuC1RuleResultProvenance {
  const evidence = c1bEvidenceFor(ruleId);
  return {
    ruleId,
    ruleCategory: evidence.ruleCategory,
    authorityType: evidence.authorityType,
    sourceEvidenceRefs: [evidence.sourceReference, ...evidence.corroboratingEvidenceRefs],
    formulaFingerprint: evidence.formulaFingerprint ?? "",
    parameterRefs: [...evidence.parameterIds],
    parameterVersions: evidence.parameterIds.map(() => EU_C1_PARAMETER_VERSION),
    inputUnits: {},
    outputUnits: {},
    applicability: evidence.applicability,
    standardFamily: "EN 1992",
    standardPart: "EN_1992_1_1",
    intendedGeneration: "UNKNOWN_PENDING_CONFIRMATION",
    intendedEdition: "UNKNOWN_PENDING_CONFIRMATION",
    nationalAnnexDependency: false,
    ndpDependency: false,
    validationState: "NUMERICALLY_VALIDATED",
    engineeringValidationState: EU_C1_ENGINEER_VALIDATION_STATE,
    conformanceState: "INTENDED_PROFILE",
    implementationVersion: EU_C1_IMPLEMENTATION_VERSION,
    maturity: "NUMERICALLY_VALIDATED",
    provenance: evidence.provenance,
  };
}

function success<T extends Record<string, number | boolean | string>>(
  ruleId: EuC1ImplementationReadyRuleId,
  outputs: T,
  inputUnits: Record<string, string | null>,
  outputUnits: Record<string, string | null>,
  snapshot: Record<string, unknown>,
): EuC1SuccessResult<T> {
  const provenance = { ...provenanceShell(ruleId), inputUnits, outputUnits };
  const resultFingerprint = euC1ResultFingerprint({
    ruleId,
    version: EU_C1_IMPLEMENTATION_VERSION,
    fingerprint: provenance.formulaFingerprint,
    parameterVersion: EU_C1_PARAMETER_VERSION,
    outputs: JSON.stringify(outputs),
    snapshot: JSON.stringify(snapshot),
  });
  return { ok: true, checkState: "OK", failReason: null, outputs, provenance, inputSnapshot: snapshot, resultFingerprint };
}

function architectureGate(ruleId: EuC1ImplementationReadyRuleId, snapshot: Record<string, unknown>): EuC1FailResult | null {
  assertEuC1AiBoundary();
  assertC1bEvidenceLoaded();
  if (PARALLEL_EU_RULE_ENGINE_CREATED || PARALLEL_EU_MATERIAL_RESPONSE_ENGINE_CREATED) {
    return fail(ruleId, "CHECK_UNDETERMINED", "parallel EU rule/material engine is forbidden", snapshot);
  }
  if (EU_C1_NDP_VALUE_GUESSED) return fail(ruleId, "RULE_EVIDENCE_CONFLICT", "NDP values must not be guessed", snapshot);
  return null;
}

export function evaluateEuC1ConcreteCharProperties(input: EuC1ConcreteCharInput): EuC1RuleResult<{
  compressiveStrengthMPa: number;
  elasticModulusMPa: number;
}> {
  const ruleId = "EU_C1_CONCRETE_CHAR_PROPERTIES";
  const snapshot = { designation: input.concrete.designation, compressiveStrength: input.concrete.compressiveStrength, elasticModulus: input.concrete.elasticModulus, profile: input.profile ?? null };
  const blocked = architectureGate(ruleId, snapshot) ?? profileGate(ruleId, input.profile, snapshot);
  if (blocked) return blocked;
  assertFormulaFingerprintMatches(ruleId, CONCRETE_OPS, ["compressiveStrength", "elasticModulus"]);
  if (CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES) {
    return fail(ruleId, "CHECK_UNDETERMINED", "grade synthesis is forbidden", snapshot);
  }
  try {
    requireConcreteMaterialProperties(input.concrete, ["compressiveStrength", "elasticModulus"]);
  } catch (error) {
    return fail(ruleId, "CHECK_UNDETERMINED", error instanceof Error ? error.message : "missing governed concrete properties", snapshot);
  }
  const fc = convertGovernedQuantity(input.concrete.compressiveStrength, "STRESS", "compressiveStrength");
  if (!fc.ok) return fail(ruleId, "CHECK_UNDETERMINED", fc.reason, snapshot);
  const e = convertGovernedQuantity(input.concrete.elasticModulus, "STRESS", "elasticModulus");
  if (!e.ok) return fail(ruleId, "CHECK_UNDETERMINED", e.reason, snapshot);
  return success(
    ruleId,
    { compressiveStrengthMPa: fc.value, elasticModulusMPa: e.value },
    { compressiveStrength: input.concrete.compressiveStrength?.unit ?? null, elasticModulus: input.concrete.elasticModulus?.unit ?? null },
    { compressiveStrength: fc.outputUnit, elasticModulus: e.outputUnit },
    snapshot,
  );
}

export function evaluateEuC1ReinforcementCharProperties(input: EuC1ReinforcementCharInput): EuC1RuleResult<{
  yieldStrengthMPa: number;
  elasticModulusMPa: number;
  areaMm2: number;
}> {
  const ruleId = "EU_C1_REINFORCEMENT_CHAR_PROPERTIES";
  const snapshot = { designation: input.designation ?? input.reinforcement.designation, yieldStrength: input.reinforcement.yieldStrength, elasticModulus: input.reinforcement.elasticModulus, area: input.area, profile: input.profile ?? null };
  const blocked = architectureGate(ruleId, snapshot) ?? profileGate(ruleId, input.profile, snapshot);
  if (blocked) return blocked;
  assertFormulaFingerprintMatches(ruleId, REO_OPS, ["yieldStrength", "elasticModulus", "area"]);
  if (UNGOVERNED_BAR_DESIGNATION_GENERATES_AREA) {
    return fail(ruleId, "CHECK_UNDETERMINED", "bar designation must not generate area", snapshot);
  }
  try {
    requireReinforcementMaterialProperties(input.reinforcement, ["yieldStrength", "elasticModulus"]);
    assertBarAreaNotInferredFromDesignation(input.designation ?? input.reinforcement.designation, input.area);
  } catch (error) {
    return fail(ruleId, "CHECK_UNDETERMINED", error instanceof Error ? error.message : "missing governed reinforcement properties", snapshot);
  }
  const fy = convertGovernedQuantity(input.reinforcement.yieldStrength, "STRESS", "yieldStrength");
  if (!fy.ok) return fail(ruleId, "CHECK_UNDETERMINED", fy.reason, snapshot);
  const es = convertGovernedQuantity(input.reinforcement.elasticModulus, "STRESS", "elasticModulus");
  if (!es.ok) return fail(ruleId, "CHECK_UNDETERMINED", es.reason, snapshot);
  const area = convertGovernedQuantity(input.area, "AREA", "area");
  if (!area.ok) return fail(ruleId, "CHECK_UNDETERMINED", area.reason, snapshot);
  return success(
    ruleId,
    { yieldStrengthMPa: fy.value, elasticModulusMPa: es.value, areaMm2: area.value },
    { yieldStrength: input.reinforcement.yieldStrength?.unit ?? null, elasticModulus: input.reinforcement.elasticModulus?.unit ?? null, area: input.area?.unit ?? null },
    { yieldStrength: fy.outputUnit, elasticModulus: es.outputUnit, area: area.outputUnit },
    snapshot,
  );
}

export function evaluateEuC1ConcreteTensionTreatment(input: EuC1TensionInput = {}): EuC1RuleResult<{
  concreteTensionIncludedInUlsFlexure: false;
  kernelTensionTreatment: "NO_TENSION";
}> {
  const ruleId = "EU_C1_CONCRETE_TENSION_TREATMENT";
  const snapshot = { ...input };
  const blocked = architectureGate(ruleId, snapshot) ?? profileGate(ruleId, input.profile, snapshot);
  if (blocked) return blocked;
  assertFormulaFingerprintMatches(ruleId, TENSION_OPS, ["concreteTensionIncludedInUlsFlexure"]);
  const limitState = input.limitState ?? "ULS_FLEXURE";
  if (limitState !== "ULS_FLEXURE") {
    return fail(ruleId, "UNSUPPORTED_SCOPE", `tension treatment is bound only for ULS_FLEXURE; ${limitState} requires a later governed model`, snapshot);
  }
  if (input.concreteTensionIncludedInUlsFlexure === true || input.requestedTreatment === "ELASTIC_TENSION" || input.requestedTreatment === "OTHER_GOVERNED") {
    return fail(ruleId, "UNSUPPORTED_SCOPE", "ULS flexural concrete tension is omitted unless a later governed constitutive model is bound", snapshot);
  }
  if (input.concreteTensionIncludedInUlsFlexure != null && input.concreteTensionIncludedInUlsFlexure !== false) {
    return fail(ruleId, "CHECK_UNDETERMINED", "concreteTensionIncludedInUlsFlexure must be boolean false", snapshot);
  }
  return success(
    ruleId,
    { concreteTensionIncludedInUlsFlexure: false as const, kernelTensionTreatment: "NO_TENSION" as const },
    { concreteTensionIncludedInUlsFlexure: "dimensionless boolean" },
    { concreteTensionIncludedInUlsFlexure: "dimensionless boolean", kernelTensionTreatment: "D1E-1 RcConcreteTensionTreatment" },
    snapshot,
  );
}

export function consumeEuC1RulePack(ruleId: EuC1ImplementationReadyRuleId, input: EuC1ConcreteCharInput | EuC1ReinforcementCharInput | EuC1TensionInput): EuC1RuleResult {
  if (ruleId === "EU_C1_CONCRETE_CHAR_PROPERTIES") return evaluateEuC1ConcreteCharProperties(input as EuC1ConcreteCharInput);
  if (ruleId === "EU_C1_REINFORCEMENT_CHAR_PROPERTIES") return evaluateEuC1ReinforcementCharProperties(input as EuC1ReinforcementCharInput);
  return evaluateEuC1ConcreteTensionTreatment(input as EuC1TensionInput);
}
