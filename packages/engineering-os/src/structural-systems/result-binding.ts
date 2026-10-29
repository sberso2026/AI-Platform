/**
 * EOS-D1F-R2 analysis-result identity and member action binding.
 * Provider results are normalized and bound. They are not analysed or designed here.
 */

import type { EuC9R2SectionActions } from "../structural-concrete/eu-c9/beam";
import type {
  D1fActionEffectQuantity,
  D1fR2EvaluationInput,
  D1fR2EventType,
  D1fR2RawResult,
  SteelCapacityEngineInput,
  StructuralStandardContext,
} from "@rtb/types";
import {
  D1F_ACTION_EFFECT_QUANTITIES,
  D1F_ANALYSIS_PROVIDER_CLASSES,
  D1F_ANALYSIS_RESULT_AUTHORITY_STATES,
  D1F_RESULT_CATEGORIES,
  D1F_R2_ANALYSIS_MODEL_STATUS_STATES,
  D1F_R2_ANALYSIS_RUN_STATUS_STATES,
  D1F_R2_FORBIDDEN_ENVELOPE_RULES,
  D1F_R2_GENERIC_LOAD_LABELS,
} from "@rtb/types";
import { toForceN, toLengthM, toMomentNm } from "../structural-demand/units";
import { assertGovernedActionEffect, assertResultPromotion } from "./contract";
import { fingerprintStructuralSubject } from "./fingerprint";

const PROVIDERS = new Set<string>(D1F_ANALYSIS_PROVIDER_CLASSES);
const AUTHORITIES = new Set<string>(D1F_ANALYSIS_RESULT_AUTHORITY_STATES);
const MODEL_STATUSES = new Set<string>(D1F_R2_ANALYSIS_MODEL_STATUS_STATES);
const RUN_STATUSES = new Set<string>(D1F_R2_ANALYSIS_RUN_STATUS_STATES);
const QUANTITIES = new Set<string>(D1F_ACTION_EFFECT_QUANTITIES);
const CATEGORIES = new Set<string>(D1F_RESULT_CATEGORIES);
const GENERIC_LABELS = new Set<string>(D1F_R2_GENERIC_LOAD_LABELS);
const FORBIDDEN_RULES = new Set<string>(D1F_R2_FORBIDDEN_ENVELOPE_RULES);
const FORCE = new Set(["N", "V_MAJOR", "V_MINOR"]);
const MOMENT = new Set(["M_MAJOR", "M_MINOR", "T"]);
const CATEGORY_ALIAS: Record<string, string> = {
  NODE_DISPLACEMENT: "NODAL_DISPLACEMENT",
  NODE_REACTION: "NODAL_REACTION",
  MEMBER_ACTION_EFFECT: "MEMBER_FORCE_ACTION_EFFECT",
  BUCKLING_RESULT: "BUCKLING_FACTOR",
  CONVERGENCE_STATE: "ANALYSIS_CONVERGENCE_STATE",
};
const LOCATION_ALIAS: Record<string, string> = {
  START: "MEMBER_START",
  END: "MEMBER_END",
  MEMBER_START: "MEMBER_START",
  MEMBER_END: "MEMBER_END",
  STATION: "STATION",
  SECTION: "SECTION",
  CRITICAL_LOCATION: "CRITICAL_LOCATION",
  GOVERNED_ENVELOPE_LOCATION: "GOVERNING_ENVELOPE_LOCATION",
  GOVERNING_ENVELOPE_LOCATION: "GOVERNING_ENVELOPE_LOCATION",
};

export type D1fR2Finding = { code: string; severity: "INFO" | "WARNING" | "BLOCKING"; subjectId: string; message: string };

export type D1fR2CanonicalAction = {
  canonicalResultId: string;
  sourceRawResultId: string;
  quantity: string;
  value: number | null;
  explicitZero: boolean;
  absent: boolean;
  unit: string | null;
  coordinateSystemRef: string | null;
  signConventionRef: string | null;
  locationKind: string | null;
  analyticalElementId: string;
  loadCaseId: string | null;
  combinationId: string | null;
  normalizationChain: readonly string[];
  transformRef: string | null;
  unitConversionRef: string;
};

export type D1fR2BindingResult = {
  bindingId: string;
  structuralSystemId: string;
  projectId: string;
  topologyFingerprint: string;
  analysisModelId: string;
  analysisModelFingerprint: string;
  analysisRunId: string;
  analysisRunFingerprint: string;
  resultSetId: string;
  resultSetFingerprint: string;
  rawResultFingerprint: string;
  normalizedResultFingerprint: string;
  bindingFingerprint: string;
  physicalMemberId: string | null;
  designMemberId: string | null;
  canonicalActions: readonly D1fR2CanonicalAction[];
  rawResults: readonly D1fR2RawResult[];
  steelDemand: SteelCapacityEngineInput["demand"] | null;
  concreteSectionActions: EuC9R2SectionActions | null;
  authority: string;
  completenessState: "BINDING_COMPLETE_FOR_DECLARED_SCOPE" | "BINDING_INCOMPLETE" | "BINDING_INVALID" | "BINDING_UNDETERMINED" | "STALE";
  canGovern: false | true;
  designPass: false;
  systemAdequacy: false;
  steelChecksExecuted: 0;
  concreteChecksExecuted: 0;
  findings: readonly D1fR2Finding[];
  blockingFindings: readonly D1fR2Finding[];
  warnings: readonly string[];
  provenance: readonly { stage: string; subjectId: string; provenanceRef: string }[];
  events: readonly D1fR2EventType[];
  invalidatesDownstream: boolean;
};

type MutableResult = Omit<D1fR2BindingResult, "canGovern"> & { canGovern: boolean };

export function evaluateAnalysisResultBinding(
  input: D1fR2EvaluationInput,
  standardContext: StructuralStandardContext | null = null,
): D1fR2BindingResult {
  const findings: D1fR2Finding[] = [];
  const add = (code: string, subjectId: string, message: string, severity: D1fR2Finding["severity"] = "BLOCKING") => {
    findings.push({ code, severity, subjectId, message });
  };
  const rawSnapshot = input.rawResults.map((row) => ({ ...row }));
  const modelFingerprint = fingerprintStructuralSubject("ANALYSIS_MODEL", {
    analysisModelId: input.analysisModelId,
    analysisModelVersion: input.analysisModelVersion,
    structuralSystemId: input.structuralSystemId,
    sourceTopologyFingerprint: input.sourceTopologyFingerprint,
    mappingFingerprint: input.mappingFingerprint,
    providerId: input.providerId,
    providerVersion: input.providerVersion,
    providerType: input.providerType,
    modelType: input.modelType,
    unitSystemRef: input.unitSystemRef,
    globalCoordinateSystemRef: input.globalCoordinateSystemRef,
    signConventionRef: input.signConventionRef,
    normalizationRuleVersion: input.normalizationRuleVersion,
  });
  const runFingerprint = fingerprintStructuralSubject("ANALYSIS_RUN", {
    analysisRunId: input.analysisRunId,
    analysisModelFingerprint: modelFingerprint,
    topologyFingerprint: input.sourceTopologyFingerprint,
    providerId: input.providerId,
    providerVersion: input.providerVersion,
    analysisType: input.analysisType,
    inputFingerprint: input.inputFingerprint,
    loadCaseIds: [...input.loadCaseIds].sort(),
    combinationIds: [...input.combinationIds].sort(),
    runStatus: input.runStatus,
    convergenceStatus: input.convergenceStatus,
  });

  if (!input.structuralSystemId || !input.projectId || !input.tenantId || !input.workspaceId) {
    add("MISSING_SYSTEM_CONTEXT", input.structuralSystemId || "system", "structural system and project context are required");
  }
  if (!input.sourceTopologyFingerprint) add("MISSING_TOPOLOGY_BINDING", input.analysisModelId, "an analysis model requires its source topology fingerprint");
  if (!MODEL_STATUSES.has(input.modelStatus) || ["SAFE", "APPROVED", "PASS"].includes(input.modelStatus)) {
    add("INVALID_MODEL_STATUS", input.analysisModelId, "model status cannot be an acceptance state");
  }
  if (input.modelStatus !== "GOVERNED") add("MODEL_NOT_GOVERNED", input.analysisModelId, "only a governed analysis model can bind");
  if (!PROVIDERS.has(input.providerType)) add("UNKNOWN_PROVIDER_AUTHORITY", input.providerId, "provider authority is not canonical");
  if (!input.providerId || !input.providerName) add("MISSING_PROVIDER_IDENTITY", input.analysisRunId, "provider identity is required");
  if (!input.providerVersion) add("MISSING_PROVIDER_VERSION", input.analysisRunId, "provider version is required");
  if (input.providerType === "IMPORTED_UNVERIFIED_RESULT") add("UNVERIFIED_PROVIDER", input.providerId, "an unverified imported result cannot govern");
  if (!RUN_STATUSES.has(input.runStatus)) add("INVALID_RUN_STATUS", input.analysisRunId, "run status is not canonical");
  if (input.runStatus === "FAILED") add("FAILED_ANALYSIS", input.analysisRunId, "a failed run cannot govern");
  if (input.runStatus === "NONCONVERGED" || input.convergenceStatus !== "CONVERGED") {
    add("NONCONVERGED", input.analysisRunId, "a nonconverged run cannot govern");
  }
  if (input.runStatus !== "COMPLETED" && input.runStatus !== "COMPLETED_WITH_WARNINGS") {
    add("RUN_NOT_COMPLETE", input.analysisRunId, "only a completed run can bind");
  }
  const stale =
    input.modelStatus === "STALE" ||
    input.runStatus === "STALE" ||
    input.currentTopologyFingerprint !== input.sourceTopologyFingerprint ||
    input.currentMappingFingerprint !== input.mappingFingerprint ||
    input.currentNormalizationRuleVersion !== input.normalizationRuleVersion;
  if (stale) add("STALE_UPSTREAM", input.analysisModelId, "topology, mapping, or normalization identity no longer matches");
  if (!input.modelValidationEvidenceRef) add("MISSING_MODEL_VALIDATION", input.analysisModelId, "verified use requires model-validation evidence");
  if (input.axisMapAuthority !== "EXPLICIT_GOVERNED") add("AXIS_AUTHORITY", input.analysisModelId, "axis mapping cannot come from AI or UI");
  if (input.automaticEnvelope) add("AUTOMATIC_ENVELOPE", input.resultSetId, "an envelope is not calculated");
  if (input.cardinality === "MANY_TO_ONE" && input.aggregationRuleRef !== "PRESERVE_DISTINCT") {
    add("AGGREGATION_UNRESOLVED", input.designMemberId ?? "mapping", "many-to-one forces are not summed or enveloped", "WARNING");
  }
  if (input.aggregationRuleRef && FORBIDDEN_RULES.has(input.aggregationRuleRef)) {
    add("AUTOMATIC_AGGREGATION", input.designMemberId ?? "mapping", "sum and max-abs are not governing rules");
  }
  if (!input.physicalMemberId) add("MISSING_PHYSICAL_MEMBER", input.analysisModelId, "physical member mapping is required");
  if (!input.designMemberId) add("MISSING_DESIGN_MEMBER", input.analysisModelId, "design member mapping is required");
  if (input.elementDirection === "REVERSED" && !input.reversal?.explicit) {
    add("REVERSAL_NOT_EXPLICIT", input.analysisModelId, "a reversed element requires an explicit end and sign transform");
  }

  const systemsDiffer = input.providerCoordinateSystemRef !== input.canonicalCoordinateSystemRef;
  if (systemsDiffer) {
    const transform = input.transform;
    if (!transform) add("MISSING_TRANSFORM", input.analysisModelId, "differing coordinate systems require an explicit transform");
    else if (["UI_ORIENTATION", "GUESSED", "PROVIDER_NAME"].includes(transform.methodRef)) {
      add("GUESSED_TRANSFORM", transform.transformId, "coordinate transform cannot be guessed from UI or provider name");
    } else if (transform.fromSystem !== input.providerCoordinateSystemRef || transform.toSystem !== input.canonicalCoordinateSystemRef) {
      add("TRANSFORM_MISMATCH", transform.transformId, "transform endpoints do not match the result frames");
    }
  }
  if (input.signConventionRef && input.signConventionRef === input.providerName) {
    add("PROVIDER_SIGN_ASSUMED", input.analysisModelId, "provider name does not define the sign convention");
  }

  const canonical: D1fR2CanonicalAction[] = [];
  for (const raw of input.rawResults) {
    if (raw.projectId !== input.projectId) add("CROSS_PROJECT_BINDING", raw.resultId, "result project does not match the structural system");
    const category = CATEGORY_ALIAS[raw.category] ?? raw.category;
    if (!CATEGORIES.has(category)) add("UNKNOWN_RESULT_CATEGORY", raw.resultId, "result category is not canonical");
    if (!AUTHORITIES.has(raw.authority)) add("INVALID_RESULT_AUTHORITY", raw.resultId, "result authority is not canonical");
    if (raw.authority !== "VERIFIED_GOVERNED") add("RESULT_NOT_GOVERNING", raw.resultId, "only a verified governed result can bind");
    if (category !== "MEMBER_FORCE_ACTION_EFFECT") continue;
    const quantity = resolveQuantity(raw, input, add);
    const locationKind = resolveLocation(raw, input, add);
    const caseRef = resolveCase(raw, input, add);
    const converted = convertValue(raw, quantity, add);
    if (raw.signConversionsApplied > 0) add("DOUBLE_SIGN_CONVERSION", raw.resultId, "sign conversion is applied once");
    if (raw.signFactor !== 1 && raw.signFactor !== -1) add("MISSING_SIGN_FACTOR", raw.resultId, "sign conversion requires an explicit factor");
    if (raw.value === 0 && !raw.explicitZero) add("ZERO_NOT_EXPLICIT", raw.resultId, "a zero action is valid only when the source marks it as zero");
    const signFactor = raw.signFactor === 1 || raw.signFactor === -1 ? raw.signFactor : null;
    const value = converted == null || signFactor == null || (raw.value === 0 && !raw.explicitZero) ? null : converted * signFactor;
    canonical.push({
      canonicalResultId: `canonical:${raw.resultId}`,
      sourceRawResultId: raw.resultId,
      quantity: quantity ?? raw.quantity,
      value,
      explicitZero: raw.explicitZero && value === 0,
      absent: raw.value == null && !raw.explicitZero,
      unit: quantity && FORCE.has(quantity) ? "N" : quantity && MOMENT.has(quantity) ? "N.m" : null,
      coordinateSystemRef: input.canonicalCoordinateSystemRef,
      signConventionRef: input.signConventionRef,
      locationKind,
      analyticalElementId: raw.analyticalElementId,
      loadCaseId: caseRef.loadCaseId,
      combinationId: caseRef.combinationId,
      normalizationChain: ["UNIT", "SIGN"],
      transformRef: systemsDiffer ? input.transform?.transformId ?? null : "SAME_FRAME",
      unitConversionRef: "D1C_TO_FORCE_OR_MOMENT",
    });
    if (quantity && locationKind && value != null && raw.authority === "VERIFIED_GOVERNED") {
      try {
        assertGovernedActionEffect({
          actionEffectId: `canonical:${raw.resultId}`,
          memberId: input.physicalMemberId ?? "",
          quantity: quantity as D1fActionEffectQuantity,
          value,
          unit: FORCE.has(quantity) ? "N" : "N.m",
          location: { kind: locationKind as "MEMBER_START", stationRef: raw.stationOrigin },
          signConventionRef: input.signConventionRef,
          coordinateTransformRef: systemsDiffer ? input.transform?.transformId ?? null : "SAME_FRAME",
          provenanceRef: raw.provenanceRef,
          sourceResultId: raw.resultId,
          sourceAuthorityState: "VERIFIED_GOVERNED",
          invented: false,
        });
      } catch (error) {
        add("ACTION_CONTRACT", raw.resultId, error instanceof Error ? error.message : "action effect contract rejected");
      }
    }
  }

  const declared = input.declaredQuantities ?? canonical.filter((row) => !row.absent).map((row) => row.quantity);
  for (const quantity of declared) {
    if (!canonical.some((row) => row.quantity === quantity && !row.absent)) {
      add("MISSING_DECLARED_ACTION", quantity, "a declared action is absent and is not treated as zero", "WARNING");
    }
  }
  if (input.governedEnvelope) validateEnvelope(input, add);

  const steelCandidate = completenessFrom(input, findings, stale, canonical.length) === "BINDING_COMPLETE_FOR_DECLARED_SCOPE" && input.designTarget === "D1D_STEEL_MEMBER"
    ? steelDemandFrom(input, canonical, standardContext, add)
    : null;
  const concreteSectionActions = input.designTarget === "D1E_CONCRETE_MEMBER" && !hasDuplicateQuantity(canonical) ? concreteActionsFrom(canonical) : null;
  let completenessState = completenessFrom(input, findings, stale, canonical.length);
  const steelDemand = completenessState === "BINDING_COMPLETE_FOR_DECLARED_SCOPE" ? steelCandidate : null;
  const ordered = [...findings].sort((a, b) => `${a.code}|${a.subjectId}`.localeCompare(`${b.code}|${b.subjectId}`));
  const rawFingerprintValue = fingerprintStructuralSubject("RESULT_SET", { results: rawSnapshot.map(fingerprintRaw).sort(byJson) });
  const normalizedFingerprint = fingerprintStructuralSubject("RESULT_SET", { results: canonical.map(actionFingerprint).sort(byJson), normalizationRuleVersion: input.normalizationRuleVersion });
  const resultSetFingerprint = fingerprintStructuralSubject("RESULT_SET", {
    analysisRunFingerprint: runFingerprint,
    analysisModelFingerprint: modelFingerprint,
    topologyFingerprint: input.sourceTopologyFingerprint,
    providerId: input.providerId,
    providerVersion: input.providerVersion,
    loadCaseIds: [...input.loadCaseIds].sort(),
    combinationIds: [...input.combinationIds].sort(),
    rawFingerprint: rawFingerprintValue,
    normalizedFingerprint,
    transformVersion: input.transform?.version ?? "SAME_FRAME",
    signConventionRef: input.signConventionRef,
  });
  const bindingFingerprint = fingerprintStructuralSubject("MEMBER_BINDING", {
    resultSetFingerprint,
    physicalMemberId: input.physicalMemberId,
    designMemberId: input.designMemberId,
    actions: canonical.map(actionFingerprint).sort(byJson),
    cardinality: input.cardinality,
  });
  const events: D1fR2EventType[] = ["ANALYSIS_MODEL_BOUND", "ANALYSIS_RUN_RECORDED", "RESULT_SET_RECORDED", "RESULT_NORMALIZED", "ACTION_BINDING_CREATED"];
  if (stale) events.push("RESULT_MARKED_STALE", "ACTION_BINDING_INVALIDATED");
  const result: MutableResult = {
    bindingId: `binding:${input.resultSetId}:${input.designMemberId ?? "unmapped"}`,
    structuralSystemId: input.structuralSystemId,
    projectId: input.projectId,
    topologyFingerprint: input.sourceTopologyFingerprint,
    analysisModelId: input.analysisModelId,
    analysisModelFingerprint: modelFingerprint,
    analysisRunId: input.analysisRunId,
    analysisRunFingerprint: runFingerprint,
    resultSetId: input.resultSetId,
    resultSetFingerprint,
    rawResultFingerprint: rawFingerprintValue,
    normalizedResultFingerprint: normalizedFingerprint,
    bindingFingerprint,
    physicalMemberId: input.physicalMemberId,
    designMemberId: input.designMemberId,
    canonicalActions: canonical,
    rawResults: input.rawResults,
    steelDemand: completenessState === "BINDING_COMPLETE_FOR_DECLARED_SCOPE" ? steelDemand : null,
    concreteSectionActions,
    authority: completenessState === "BINDING_COMPLETE_FOR_DECLARED_SCOPE" ? "VERIFIED_GOVERNED" : stale ? "STALE" : "INCOMPLETE",
    completenessState,
    canGovern: completenessState === "BINDING_COMPLETE_FOR_DECLARED_SCOPE",
    designPass: false,
    systemAdequacy: false,
    steelChecksExecuted: 0,
    concreteChecksExecuted: 0,
    findings: ordered,
    blockingFindings: ordered.filter((row) => row.severity === "BLOCKING"),
    warnings: [...input.warnings],
    provenance: [
      { stage: "STRUCTURAL_SYSTEM", subjectId: input.structuralSystemId, provenanceRef: input.runProvenanceRef },
      { stage: "ANALYSIS_MODEL", subjectId: input.analysisModelId, provenanceRef: input.sourceModelRef ?? input.runProvenanceRef },
      { stage: "ANALYSIS_RUN", subjectId: input.analysisRunId, provenanceRef: input.runProvenanceRef },
      ...input.rawResults.map((row) => ({ stage: "RAW_RESULT", subjectId: row.resultId, provenanceRef: row.provenanceRef })),
      ...canonical.map((row) => ({ stage: "NORMALIZED_RESULT", subjectId: row.canonicalResultId, provenanceRef: row.sourceRawResultId })),
      { stage: "PHYSICAL_MEMBER", subjectId: input.physicalMemberId ?? "", provenanceRef: input.runProvenanceRef },
      { stage: "DESIGN_MEMBER", subjectId: input.designMemberId ?? "", provenanceRef: input.runProvenanceRef },
      { stage: "ACTION_BINDING", subjectId: input.resultSetId, provenanceRef: input.runProvenanceRef },
    ],
    events,
    invalidatesDownstream: stale,
  };
  for (const raw of input.rawResults) {
    const before = rawSnapshot.find((row) => row.resultId === raw.resultId);
    if (!before || before.value !== raw.value || before.unit !== raw.unit) {
      add("RAW_MUTATED", raw.resultId, "normalization must not change the raw result");
    }
  }
  return result;
}

export function promoteAnalysisResultAuthority(action: { actor: "HUMAN" | "AI" | "AUTOMATIC"; explicit: boolean; evidenceId: string | null; from: "IMPORTED_PENDING_VERIFICATION" | "VERIFIED_GOVERNED" | "STALE" | "INVALID" | "INCOMPLETE" | "FAILED_ANALYSIS" }): { ok: true } | { ok: false; reason: string } {
  if (action.actor !== "HUMAN" || !action.explicit) return { ok: false, reason: "result authority promotion requires an explicit human action" };
  try {
    assertResultPromotion({ from: action.from, humanVerificationEvidenceId: action.evidenceId });
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : "promotion rejected" };
  }
  return { ok: true };
}

export function recordSuccessorAnalysisRun(prior: D1fR2BindingResult, next: D1fR2EvaluationInput, standardContext: StructuralStandardContext | null = null): { prior: D1fR2BindingResult; current: D1fR2BindingResult; history: readonly D1fR2BindingResult[] } {
  const current = evaluateAnalysisResultBinding(next, standardContext);
  return {
    prior: { ...prior, authority: "STALE" },
    current,
    history: [prior, current],
  };
}

function completenessFrom(input: D1fR2EvaluationInput, findings: readonly D1fR2Finding[], stale: boolean, actionCount: number): D1fR2BindingResult["completenessState"] {
  const blocking = findings.filter((row) => row.severity === "BLOCKING");
  const incomplete = findings.some((row) => row.code === "MISSING_DECLARED_ACTION" || row.code === "AGGREGATION_UNRESOLVED" || row.code === "STEEL_COMPONENT_ABSENT");
  if (!input.structuralSystemId || !input.projectId) return "BINDING_UNDETERMINED";
  if (stale && blocking.every((row) => row.code === "STALE_UPSTREAM" || row.code === "MISSING_MODEL_VALIDATION" || row.code === "MODEL_NOT_GOVERNED")) return "STALE";
  if (blocking.length > 0) return "BINDING_INVALID";
  if (incomplete || actionCount === 0) return "BINDING_INCOMPLETE";
  return "BINDING_COMPLETE_FOR_DECLARED_SCOPE";
}

function hasDuplicateQuantity(actions: readonly D1fR2CanonicalAction[]): boolean {
  const seen = new Set<string>();
  for (const action of actions) {
    const key = `${action.quantity}|${action.analyticalElementId}|${action.locationKind}|${action.combinationId}|${action.loadCaseId}`;
    if (seen.has(key)) return true;
    seen.add(key);
  }
  const byQuantity = new Map<string, number>();
  for (const action of actions) byQuantity.set(action.quantity, (byQuantity.get(action.quantity) ?? 0) + 1);
  return [...byQuantity.values()].some((count) => count > 1);
}

function resolveQuantity(raw: D1fR2RawResult, input: D1fR2EvaluationInput, add: (code: string, subjectId: string, message: string) => void): string | null {
  if (!(raw.quantity in input.axisMap)) {
    add("AXIS_MAPPING_MISSING", raw.resultId, "provider action axes require an explicit map");
    return null;
  }
  const mapped = input.axisMap[raw.quantity] ?? null;
  if (!mapped || !QUANTITIES.has(mapped)) {
    add("UNKNOWN_QUANTITY", raw.resultId, "action quantity is not a canonical member action");
    return null;
  }
  if (input.providerCoordinateSystemRef !== input.canonicalCoordinateSystemRef && input.transform && !(raw.quantity in input.transform.componentMap)) {
    add("MISSING_COMPONENT_MAP", raw.resultId, "a changed frame requires an explicit component map entry");
  }
  return mapped;
}

function resolveLocation(raw: D1fR2RawResult, input: D1fR2EvaluationInput, add: (code: string, subjectId: string, message: string) => void): string | null {
  if (!raw.locationKind) {
    add("MISSING_LOCATION", raw.resultId, "result location is required");
    return null;
  }
  if (raw.locationKind === "PROVIDER_LOCATION") {
    add("UNMAPPED_PROVIDER_LOCATION", raw.resultId, "a provider location must be explicitly mapped");
    return null;
  }
  let kind = LOCATION_ALIAS[raw.locationKind] ?? null;
  if (input.elementDirection === "REVERSED" && input.reversal?.explicit) {
    kind = input.reversal.endMap[kind ?? ""] ?? null;
    if (!kind) add("REVERSAL_NOT_EXPLICIT", raw.resultId, "reversed end mapping is incomplete");
  }
  if (!kind) {
    add("UNKNOWN_LOCATION", raw.resultId, "result location is not canonical");
    return null;
  }
  if (kind === "STATION") {
    const length = raw.stationUnit ? safeLength(raw.stationCoordinate, raw.stationUnit) : null;
    const dimensionless = raw.stationUnit === "DIMENSIONLESS" && raw.stationCoordinate != null && raw.stationCoordinate >= 0 && raw.stationCoordinate <= 1;
    if ((!length && !dimensionless) || !raw.stationOrigin || !raw.stationOrientation) {
      add("AMBIGUOUS_STATION", raw.resultId, "station location requires coordinate, unit or dimensionless convention, origin, and orientation");
      return null;
    }
  }
  return kind;
}

function resolveCase(raw: D1fR2RawResult, input: D1fR2EvaluationInput, add: (code: string, subjectId: string, message: string) => void): { loadCaseId: string | null; combinationId: string | null } {
  const label = raw.loadCaseId ?? raw.combinationId ?? "";
  if (!raw.loadCaseId && !raw.combinationId) add("MISSING_CASE", raw.resultId, "a load case or combination id is required");
  if (raw.loadCaseId && raw.combinationId) add("AMBIGUOUS_CASE", raw.resultId, "a result identifies a load case or a combination");
  if (GENERIC_LABELS.has(label)) add("GENERIC_LOAD_LABEL", raw.resultId, "generic load labels cannot govern");
  if (raw.loadCaseId && !input.loadCaseIds.includes(raw.loadCaseId)) add("UNKNOWN_CASE", raw.resultId, "load case is not on the analysis run");
  if (raw.combinationId && !input.combinationIds.includes(raw.combinationId)) add("UNKNOWN_COMBINATION", raw.resultId, "combination is not on the analysis run");
  return { loadCaseId: raw.loadCaseId, combinationId: raw.combinationId };
}

function convertValue(raw: D1fR2RawResult, quantity: string | null, add: (code: string, subjectId: string, message: string) => void): number | null {
  if (raw.value == null) return null;
  if (!quantity) return null;
  const forceUnit = raw.unit === "N" || raw.unit === "kN";
  const momentUnit = raw.unit === "N.m" || raw.unit === "kN.m";
  if (FORCE.has(quantity) && momentUnit) {
    add("DIMENSION_MISMATCH", raw.resultId, "force action cannot use a moment unit");
    return null;
  }
  if (MOMENT.has(quantity) && forceUnit) {
    add("DIMENSION_MISMATCH", raw.resultId, "moment action cannot use a force unit");
    return null;
  }
  try {
    const quantityInput = { value: raw.value, unit: raw.unit ?? "" };
    if (FORCE.has(quantity)) return toForceN(quantityInput);
    if (MOMENT.has(quantity)) return toMomentNm(quantityInput);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    add(message.includes("unsupported") || !raw.unit ? "UNKNOWN_UNIT" : "DIMENSION_MISMATCH", raw.resultId, "unit normalization failed closed");
  }
  return null;
}

function validateEnvelope(input: D1fR2EvaluationInput, add: (code: string, subjectId: string, message: string) => void): void {
  const envelope = input.governedEnvelope;
  if (!envelope) return;
  if (FORBIDDEN_RULES.has(envelope.selectionRule)) add("MAX_ABS_ENVELOPE", envelope.envelopeId, "max-abs is not a governing rule");
  const source = input.rawResults.find((row) => envelope.sourceResultIds.includes(row.resultId) && row.value === envelope.governingValue);
  if (!source) add("ENVELOPE_VALUE_NOT_SOURCED", envelope.envelopeId, "a governed envelope value must already exist on a source result");
}

function steelDemandFrom(input: D1fR2EvaluationInput, actions: readonly D1fR2CanonicalAction[], standardContext: StructuralStandardContext | null, add: (code: string, subjectId: string, message: string) => void): SteelCapacityEngineInput["demand"] | null {
  if (!standardContext) {
    add("STEEL_CONTEXT_MISSING", input.designMemberId ?? "steel", "steel binding requires the existing standard context");
    return null;
  }
  const axial = one(actions, "N");
  const shear = one(actions, "V_MAJOR");
  const moment = one(actions, "M_MAJOR");
  if (!axial || !shear || !moment || axial.absent || shear.absent || moment.absent || axial.value == null || shear.value == null || moment.value == null || !shear.locationKind || !moment.locationKind) {
    add("STEEL_COMPONENT_ABSENT", input.designMemberId ?? "steel", "steel demand is not filled with absent actions");
    return null;
  }
  const locationM = shear.locationKind === "MEMBER_START" ? 0 : 1;
  return {
    resultId: input.resultSetId,
    memberId: input.designMemberId ?? "",
    shear: { value: shear.value, unit: "N", locationM, signed: shear.value },
    moment: { value: moment.value, unit: "N.m", locationM: moment.locationKind === "MEMBER_START" ? 0 : 1, signed: moment.value },
    axial: { valueN: axial.value, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "deflection is not derived by this binding" },
    capacityPresent: false,
    standardContext,
    inputEvidenceRefs: [{ evidenceId: axial.sourceRawResultId, sourceKind: "solver_output", reference: input.runProvenanceRef }],
    combinationId: axial.combinationId,
  };
}

function concreteActionsFrom(actions: readonly D1fR2CanonicalAction[]): EuC9R2SectionActions {
  return {
    axial: componentAxial(one(actions, "N")),
    majorMoment: componentMoment(one(actions, "M_MAJOR")),
    minorMoment: componentMoment(one(actions, "M_MINOR")),
  };
}

function componentAxial(action: D1fR2CanonicalAction | null): EuC9R2SectionActions["axial"] {
  if (!action || action.absent || action.value == null) return { status: "NO_AXIAL_COMPONENTS", valueN: 0 };
  return { status: "AXIAL_DIRECT", valueN: action.value };
}

function componentMoment(action: D1fR2CanonicalAction | null): EuC9R2SectionActions["majorMoment"] {
  if (!action || action.absent || action.value == null) return { status: "ABSENT" };
  return { status: "PRESENT", signedNm: action.value };
}

function one(actions: readonly D1fR2CanonicalAction[], quantity: string): D1fR2CanonicalAction | null {
  const matches = actions.filter((row) => row.quantity === quantity);
  return matches.length === 1 ? matches[0] : null;
}

function safeLength(value: number | null, unit: string): number | null {
  if (value == null) return null;
  try {
    return toLengthM(Math.abs(value), unit);
  } catch {
    return null;
  }
}

function fingerprintRaw(row: D1fR2RawResult) {
  return { resultId: row.resultId, quantity: row.quantity, value: row.value, unit: row.unit, locationKind: row.locationKind, loadCaseId: row.loadCaseId, combinationId: row.combinationId };
}

function actionFingerprint(row: D1fR2CanonicalAction) {
  return { id: row.canonicalResultId, quantity: row.quantity, value: row.value, unit: row.unit, locationKind: row.locationKind, loadCaseId: row.loadCaseId, combinationId: row.combinationId, analyticalElementId: row.analyticalElementId };
}

function byJson(left: unknown, right: unknown): number {
  const a = JSON.stringify(left);
  const b = JSON.stringify(right);
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}
