/**
 * EOS-D1G-R1 provider-neutral solver adapter.
 * Translates an explicit provider payload into the existing D1F raw-result contract.
 * Values are copied. Units, signs, and coordinates are normalized by D1F.
 */

import type {
  D1fR2EvaluationInput,
  D1fR2RawResult,
  D1gR1AdapterIdentity,
  D1gR1AdapterRequest,
  D1gR1Completeness,
  D1gR1GovernedContext,
  D1gR1MappingManifest,
  D1gR1ObjectMapping,
  D1gR1ObjectMappingEntry,
  D1gR1ProviderResult,
  D1gR1ProviderSource,
} from "@rtb/types";
import {
  D1F_R2_GENERIC_LOAD_LABELS,
  D1G_R1_ADAPTER_CAPABILITIES,
  D1G_R1_DEFAULT_RESOURCE_LIMITS,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { evaluateAnalysisResultBinding, type D1fR2BindingResult } from "./result-binding";

const GENERIC = new Set<string>(D1F_R2_GENERIC_LOAD_LABELS);
const CAPABILITIES = new Set<string>(D1G_R1_ADAPTER_CAPABILITIES);
const DIMENSIONED = new Set(["MEMBER_FORCE_ACTION_EFFECT", "SUPPORT_REACTION", "NODAL_DISPLACEMENT"]);

export type D1gR1Finding = {
  code: string;
  severity: "INFO" | "WARNING" | "BLOCKING";
  subjectId: string;
  message: string;
};

export type D1gR1AdapterExecution = {
  revision: "CURRENT" | "SUPERSEDED";
  adapterId: string;
  adapterVersion: string;
  adapterSchemaVersion: string;
  providerId: string;
  providerName: string;
  providerVersion: string;
  adapterType: string;
  authority: string;
  provenanceRef: string;
  declaredCapabilities: readonly string[];
  sourceFingerprint: string;
  preservedSource: D1gR1ProviderSource;
  mappingManifestFingerprint: string;
  objectMappingFingerprint: string;
  executionFingerprint: string;
  completeness: D1gR1Completeness;
  canGovern: boolean;
  autoPromotedVerifiedGoverned: false;
  governedTopologyCreated: false;
  memberForceCalculated: false;
  supportReactionCalculated: false;
  displacementCalculated: false;
  rawSourceMutated: boolean;
  duplicateDetected: boolean;
  findings: readonly D1gR1Finding[];
  warnings: readonly { warningId: string; code: string; text: string; transportCategory: string }[];
  unmappedResults: readonly D1gR1ProviderResult[];
  rejectedResults: readonly { result: D1gR1ProviderResult; reason: string }[];
  supportReactions: readonly D1fR2RawResult[];
  handoffs: readonly { input: D1fR2EvaluationInput; binding: D1fR2BindingResult }[];
  provenance: readonly { stage: string; subjectId: string; provenanceRef: string }[];
};

type Limits = typeof D1G_R1_DEFAULT_RESOURCE_LIMITS;

export function negotiateAdapterCapabilities(input: { providerName: string; declared: readonly string[] }): readonly string[] {
  void input.providerName;
  return [...input.declared].filter((item) => CAPABILITIES.has(item)).sort();
}

export function executeProviderNeutralAdapter(request: D1gR1AdapterRequest): D1gR1AdapterExecution {
  const sourceText = request.source == null ? null : safeJson(request.source);
  const preserved = sourceText == null ? request.source : (JSON.parse(sourceText) as D1gR1ProviderSource);
  const findings: D1gR1Finding[] = [];
  const add = (code: string, subjectId: string, message: string, severity: D1gR1Finding["severity"] = "BLOCKING") => {
    findings.push({ code, severity, subjectId, message });
  };
  const limits = resolveLimits(request.limits);
  const sourceFingerprint = fingerprintCanonical({ subject: "PROVIDER_SOURCE", identity: request.source });
  const mappingManifestFingerprint = fingerprintCanonical({ subject: "MAPPING_MANIFEST", identity: request.mappingManifest });
  const objectMappingFingerprint = fingerprintCanonical({
    subject: "OBJECT_MAPPING",
    identity: { mapping: request.objectMapping, providerVersion: request.source?.providerVersion ?? "" },
  });
  const fatal = inspectPayload(request, limits, add);
  const executionFingerprint = fingerprintCanonical({
    subject: "SOLVER_ADAPTER_EXECUTION",
    identity: {
      adapterVersion: request.adapter.adapterVersion,
      adapterSchemaVersion: request.adapter.adapterSchemaVersion,
      providerVersion: request.source?.providerVersion ?? "",
      sourceFingerprint,
      mappingManifestFingerprint,
      objectMappingFingerprint,
      requiredCapabilities: [...request.adapter.requiredCapabilities].sort(),
      explicitResultAuthority: request.governed.explicitResultAuthority,
    },
  });
  const base = blankExecution(request, preserved, sourceFingerprint, mappingManifestFingerprint, objectMappingFingerprint, executionFingerprint, findings);
  if (fatal || sourceText == null) {
    return finish(base, "INVALID", false, findings);
  }
  if (unsafeSourceRef(request.source.sourceName) || unsafeSourceRef(request.source.sourceVersion)) {
    add("UNSAFE_SOURCE_REF", request.source.sourcePayloadId, "a provider source ref cannot name a local path");
    return finish(base, "INVALID", false, findings);
  }
  if (!sameScope(request)) {
    add(scopeCode(request), request.source.sourcePayloadId, "provider results cannot bind across project, tenant, or workspace");
    return finish(base, "INVALID", false, findings);
  }
  if (!request.adapter.providerId || !request.source.providerId || !request.source.providerName) {
    add("MISSING_PROVIDER_IDENTITY", request.adapter.adapterId, "provider identity is required");
  }
  if (!request.source.providerVersion) add("MISSING_PROVIDER_VERSION", request.source.providerId, "provider version is required");
  if (request.adapter.providerId !== request.source.providerId) add("ADAPTER_PROVIDER_MISMATCH", request.adapter.adapterId, "adapter provider id must match the source");
  if (!request.adapter.supportedProviderVersions.includes(request.source.providerVersion)) {
    add("UNSUPPORTED_PROVIDER_VERSION", request.source.providerVersion, "an undeclared provider version is not assumed");
  }
  if (request.objectMapping.authority !== "EXPLICIT_GOVERNED") {
    add("OBJECT_MAPPING_AUTHORITY", request.objectMapping.mappingId, "provider object mapping requires explicit governed authority");
  }
  if (request.mappingManifest.authority !== "EXPLICIT_GOVERNED") {
    add("MAPPING_MANIFEST_AUTHORITY", request.mappingManifest.manifestId, "semantic mapping requires explicit governed authority");
  }
  if (request.objectMapping.providerModelId !== request.source.providerModelId || request.objectMapping.analysisModelId !== request.governed.analysisModelId) {
    add("MODEL_MAPPING_REQUIRED", request.source.providerModelId, "the provider model must map to the existing analysis model");
  }
  if (request.source.signConventionRef === request.source.providerName || request.governed.signConventionRef === request.source.providerName) {
    add("SIGN_FROM_BRAND", request.source.providerId, "provider name does not define the sign convention");
  }
  if (!request.source.coordinateSystemRef) add("MISSING_COORDINATE_SYSTEM", request.source.providerModelId, "provider coordinate metadata is required");
  const systemsDiffer = request.source.coordinateSystemRef !== request.governed.canonicalCoordinateSystemRef;
  if (systemsDiffer && (!request.transform || request.transform.methodRef === "PROVIDER_NAME" || request.transform.methodRef === "GUESSED")) {
    add("MISSING_COORDINATE_TRANSFORM", request.source.providerModelId, "a different coordinate system needs an explicit transform");
  }

  const runStatus = request.mappingManifest.runStates[request.source.providerRunState] ?? "";
  const convergenceStatus = request.mappingManifest.convergenceStates[request.source.providerConvergenceState] ?? "";
  if (!runStatus) add("UNKNOWN_RUN_STATE", request.source.providerRunId, "an unknown provider run state cannot govern");
  if (!convergenceStatus) add("UNKNOWN_CONVERGENCE_STATE", request.source.providerRunId, "completion does not imply convergence");
  if (request.source.providerRunState === "SUCCESS" || request.source.providerConvergenceState === "OK") {
    add("SUCCESS_FLAG_NOT_ACCEPTANCE", request.source.providerRunId, "a provider success flag is not engineering acceptance");
  }

  const caseIds = mapLabels(request.source.cases.map((row) => row.providerCaseId), request.mappingManifest.cases, request.source.cases.map((row) => row.label), add, "CASE");
  const combinationIds = mapLabels(request.source.combinations.map((row) => row.providerCombinationId), request.mappingManifest.combinations, request.source.combinations.map((row) => row.label), add, "COMBINATION");
  const warnings = request.source.warnings.map((warning) => ({
    warningId: warning.warningId,
    code: warning.code,
    text: warning.text,
    transportCategory: request.mappingManifest.warningCategories[warning.code] ?? "UNCLASSIFIED",
  }));
  if (request.source.unknownFields && Object.keys(request.source.unknownFields).length > 0) {
    add("UNKNOWN_FIELD_RETAINED", request.source.sourcePayloadId, "unknown provider fields are retained and do not select engineering semantics", "INFO");
  }

  const seen = new Set<string>();
  const unmapped: D1gR1ProviderResult[] = [];
  const rejected: { result: D1gR1ProviderResult; reason: string }[] = [];
  const accepted = new Map<string, { entry: D1gR1ObjectMappingEntry; raw: D1fR2RawResult }[]>();
  const reactions: D1fR2RawResult[] = [];
  let duplicateDetected = false;
  for (const result of request.source.results) {
    const duplicateKey = `${request.source.providerModelId}|${request.source.providerRunId}|${result.providerResultId}`;
    if (seen.has(duplicateKey)) {
      duplicateDetected = true;
      add("DUPLICATE_PROVIDER_RESULT", result.providerResultId, "duplicate provider result identity is rejected");
      rejected.push({ result, reason: "DUPLICATE_PROVIDER_RESULT" });
      continue;
    }
    seen.add(duplicateKey);
    const numeric = inspectNumber(result.value);
    if (numeric === "bad") {
      add("NON_FINITE_OR_NON_NUMERIC", result.providerResultId, "a non-finite or non-numeric provider value cannot govern");
      rejected.push({ result, reason: "NON_FINITE_OR_NON_NUMERIC" });
      continue;
    }
    const category = request.mappingManifest.categories[result.providerCategory] ?? "";
    if (!category) {
      add("UNKNOWN_RESULT_CATEGORY", result.providerResultId, "an unknown provider category is retained and not recast");
      rejected.push({ result, reason: "UNKNOWN_RESULT_CATEGORY" });
      continue;
    }
    const capability = capabilityFor(category, result.location, request.mappingManifest);
    if (!request.adapter.declaredCapabilities.includes(capability as never)) {
      add("UNSUPPORTED_CAPABILITY", result.providerResultId, "an undeclared capability is not invented");
      rejected.push({ result, reason: "UNSUPPORTED_CAPABILITY" });
      continue;
    }
    const entry = request.objectMapping.entries.find((row) => row.providerModelId === request.source.providerModelId && row.providerObjectId === result.providerObjectId);
    if (!entry) {
      add("UNMAPPED_PROVIDER_OBJECT", result.providerResultId, "an unmapped provider object is retained");
      unmapped.push(result);
      continue;
    }
    if (!result.location) {
      add("MISSING_RESULT_LOCATION", result.providerResultId, "a missing result location does not become midspan");
      rejected.push({ result, reason: "MISSING_RESULT_LOCATION" });
      continue;
    }
    const locationKind = request.mappingManifest.locations[result.location] ?? request.mappingManifest.memberEnds[result.location] ?? "";
    if (!locationKind) {
      add("UNMAPPED_LOCATION", result.providerResultId, "provider location is not guessed");
      rejected.push({ result, reason: "UNMAPPED_LOCATION" });
      continue;
    }
    if (locationKind === "STATION" && (result.stationValue == null || !result.stationUnit || !result.stationOrigin || !result.stationOrientation)) {
      add("AMBIGUOUS_STATION", result.providerResultId, "station semantics must be explicit");
      rejected.push({ result, reason: "AMBIGUOUS_STATION" });
      continue;
    }
    if (DIMENSIONED.has(category) && !result.unit) {
      add("MISSING_PROVIDER_UNIT", result.providerResultId, "a dimensioned provider result requires explicit unit metadata");
      rejected.push({ result, reason: "MISSING_PROVIDER_UNIT" });
      continue;
    }
    if (!result.coordinateSystemRef) {
      add("MISSING_RESULT_COORDINATE", result.providerResultId, "a directional result requires its provider coordinate system");
      rejected.push({ result, reason: "MISSING_RESULT_COORDINATE" });
      continue;
    }
    if (!result.signConventionRef || result.signConventionRef === request.source.providerName) {
      add("MISSING_SIGN_CONVENTION", result.providerResultId, "sign convention is not inferred from the provider brand");
      rejected.push({ result, reason: "MISSING_SIGN_CONVENTION" });
      continue;
    }
    const caseRef = resolveRef(result.providerCaseId, result.providerCombinationId, request.mappingManifest, add, result.providerResultId);
    if (!caseRef.ok) {
      rejected.push({ result, reason: caseRef.reason });
      continue;
    }
    let quantity = result.providerQuantityName;
    let signFactor: 1 | -1 | null = 1;
    if (category === "MEMBER_FORCE_ACTION_EFFECT") {
      const mapped = request.mappingManifest.quantities[result.providerQuantityName];
      const sign = request.mappingManifest.signs[result.providerQuantityName];
      if (!mapped || (sign !== 1 && sign !== -1)) {
        add("UNKNOWN_QUANTITY", result.providerResultId, "a provider quantity name alone does not define semantics");
        rejected.push({ result, reason: "UNKNOWN_QUANTITY" });
        continue;
      }
      quantity = result.providerQuantityName;
      signFactor = sign;
      if (!entry.designMemberId || !entry.physicalMemberId || !entry.analyticalElementId) {
        add("UNMAPPED_PROVIDER_OBJECT", result.providerResultId, "a member result needs an explicit design mapping");
        unmapped.push(result);
        continue;
      }
    }
    const raw: D1fR2RawResult = {
      resultId: `raw:${request.source.providerModelId}:${request.source.providerRunId}:${result.providerResultId}`,
      analyticalElementId: entry.analyticalElementId ?? "",
      nodeId: entry.nodeId,
      supportId: entry.supportId,
      category,
      quantity,
      value: numeric,
      explicitZero: result.explicitZero,
      unit: result.unit,
      coordinateSystemRef: result.coordinateSystemRef,
      signConventionRef: result.signConventionRef,
      signFactor,
      signConversionsApplied: 0,
      locationKind,
      stationCoordinate: result.stationValue,
      stationUnit: result.stationUnit,
      stationOrigin: result.stationOrigin,
      stationOrientation: result.stationOrientation,
      loadCaseId: caseRef.loadCaseId,
      combinationId: caseRef.combinationId,
      providerMetadata: `${result.providerResultId}|${result.providerObjectId}|${result.location}|${result.providerQuantityName}`,
      authority: request.governed.explicitResultAuthority,
      provenanceRef: `${request.adapter.provenanceRef}:${request.source.sourcePayloadId}:${result.providerResultId}`,
      projectId: request.governed.projectId,
    };
    if (category === "SUPPORT_REACTION") reactions.push(raw);
    else if (category === "MEMBER_FORCE_ACTION_EFFECT" && entry.designMemberId) {
      const rows = accepted.get(entry.designMemberId) ?? [];
      rows.push({ entry, raw });
      accepted.set(entry.designMemberId, rows);
    } else if (category === "NODAL_DISPLACEMENT" && entry.designMemberId) {
      const rows = accepted.get(entry.designMemberId) ?? [];
      rows.push({ entry, raw });
      accepted.set(entry.designMemberId, rows);
    }
  }

  const blockingBeforeHandoff = findings.some((row) => row.severity === "BLOCKING");
  const handoffs = [...accepted.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([designMemberId, rows]) => {
      const entry = rows[0]?.entry;
      const memberRaw = rows.map((row) => row.raw).sort((left, right) => left.resultId.localeCompare(right.resultId));
      const rawResults = [...memberRaw, ...reactions].sort((left, right) => left.resultId.localeCompare(right.resultId));
      const input = toEvaluationInput(request, runStatus || "INVALID", convergenceStatus || "UNKNOWN", caseIds, combinationIds, warnings.map((row) => row.text), rawResults, entry, designMemberId, objectMappingFingerprint);
      const binding = evaluateAnalysisResultBinding(input);
      return { input, binding };
    });
  for (const handoff of handoffs) {
    for (const raw of handoff.input.rawResults) {
      const sourceValue = request.source.results.find((row) => raw.providerMetadata?.startsWith(`${row.providerResultId}|`));
      if (sourceValue && sourceValue.value !== raw.value) add("RAW_VALUE_CHANGED", raw.resultId, "mapping must not change the provider value");
    }
  }
  const requiredMissing = request.adapter.requiredCapabilities.filter((capability) => !capabilitySatisfied(capability, handoffs, reactions, warnings));
  if (requiredMissing.length > 0) add("PARTIAL_REQUIRED_SCOPE", request.source.sourcePayloadId, "a partial result set does not satisfy missing required scope", "WARNING");
  const rawSourceMutated = safeJson(request.source) !== sourceText;
  if (rawSourceMutated) add("RAW_SOURCE_MUTATED", request.source.sourcePayloadId, "mapping must not mutate the provider source");
  const stale = handoffs.some((row) => row.binding.completenessState === "STALE");
  const governed = !blockingBeforeHandoff && !duplicateDetected && unmapped.length === 0 && rejected.length === 0 && requiredMissing.length === 0 && !rawSourceMutated && handoffs.length > 0 && handoffs.every((row) => row.binding.canGovern);
  let completeness: D1gR1Completeness = "COMPLETE_FOR_DECLARED_ADAPTER_SCOPE";
  if (findings.some((row) => row.code === "UNKNOWN_RUN_STATE" || row.code === "UNSAFE_SOURCE_REF" || row.code === "MISSING_PROVIDER_IDENTITY")) completeness = "INVALID";
  else if (stale) completeness = "STALE";
  else if (unmapped.length > 0 || rejected.length > 0 || requiredMissing.length > 0 || duplicateDetected) completeness = accepted.size > 0 || reactions.length > 0 ? "PARTIAL" : "INCOMPLETE";
  else if (handoffs.length === 0 && reactions.length === 0) completeness = "UNSUPPORTED";
  else if (!governed) completeness = handoffs.some((row) => row.binding.canGovern) ? "PARTIAL" : "INVALID";
  const ordered = [...findings].sort((left, right) => `${left.code}|${left.subjectId}`.localeCompare(`${right.code}|${right.subjectId}`));
  return {
    ...base,
    warnings,
    unmappedResults: unmapped,
    rejectedResults: rejected,
    supportReactions: reactions,
    handoffs,
    duplicateDetected,
    rawSourceMutated,
    findings: ordered,
    completeness,
    canGovern: governed && completeness === "COMPLETE_FOR_DECLARED_ADAPTER_SCOPE",
    provenance: provenance(request, sourceFingerprint, handoffs, reactions),
  };
}

export function recordSuccessorAdapterExecution(prior: D1gR1AdapterExecution, request: D1gR1AdapterRequest): { prior: D1gR1AdapterExecution; current: D1gR1AdapterExecution; history: readonly D1gR1AdapterExecution[] } {
  const current = executeProviderNeutralAdapter(request);
  return { prior: { ...prior, revision: "SUPERSEDED" }, current, history: [prior, current] };
}

export function assessAdapterConformance(execution: D1gR1AdapterExecution): { pass: boolean; gaps: readonly string[] } {
  const gaps: string[] = [];
  if (!execution.providerId || !execution.providerVersion) gaps.push("provider identity");
  if (!execution.adapterVersion) gaps.push("adapter version");
  if (!execution.sourceFingerprint) gaps.push("source fingerprint");
  if (execution.declaredCapabilities.length === 0) gaps.push("capability declaration");
  if (execution.warnings.length === 0) gaps.push("warning preservation");
  if (execution.supportReactions.length === 0) gaps.push("support reaction");
  if (execution.handoffs.length === 0) gaps.push("D1F handoff");
  const raw = execution.handoffs.flatMap((row) => row.input.rawResults);
  if (raw.some((row) => row.category === "MEMBER_FORCE_ACTION_EFFECT" && !row.unit)) gaps.push("unit metadata");
  if (raw.some((row) => row.category === "MEMBER_FORCE_ACTION_EFFECT" && !row.coordinateSystemRef)) gaps.push("axis metadata");
  if (raw.some((row) => row.category === "MEMBER_FORCE_ACTION_EFFECT" && !row.signConventionRef)) gaps.push("sign metadata");
  if (raw.some((row) => row.category === "MEMBER_FORCE_ACTION_EFFECT" && !row.locationKind)) gaps.push("result location");
  if (raw.some((row) => row.category === "MEMBER_FORCE_ACTION_EFFECT" && !row.loadCaseId && !row.combinationId)) gaps.push("case mapping");
  if (!execution.objectMappingFingerprint) gaps.push("object mapping");
  if (execution.preservedSource.sourcePayloadId.length === 0) gaps.push("raw preservation");
  if (!execution.provenance.some((row) => row.stage === "NORMALIZED_RESULT")) gaps.push("provenance");
  if (!execution.executionFingerprint) gaps.push("fingerprint");
  if (execution.autoPromotedVerifiedGoverned !== false) gaps.push("authority promotion");
  if (execution.memberForceCalculated || execution.supportReactionCalculated || execution.displacementCalculated) gaps.push("calculated result");
  return { pass: gaps.length === 0 && execution.canGovern, gaps };
}

export function createD1gFixtureSolverRequest(): D1gR1AdapterRequest {
  const source: D1gR1ProviderSource = {
    sourcePayloadId: "payload-fixture-1",
    providerId: "d1g-fixture-solver",
    providerName: "D1G_FIXTURE_SOLVER",
    providerVersion: "1.0.0",
    providerModelVersion: "model-rev-1",
    providerRunVersion: "run-rev-1",
    sourceType: "DETERMINISTIC_FIXTURE",
    sourceName: "fixture-solver-source",
    sourceVersion: "1",
    sourceTimestamp: "2026-10-17T00:00:00.000Z",
    projectId: "project-1",
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    providerModelId: "fixture-model-1",
    analysisType: "STATIC_RESULT_IMPORT",
    unitContextRef: "FIXTURE_UNITS_V1",
    coordinateSystemRef: "FIXTURE_GLOBAL_V1",
    signConventionRef: "FIXTURE_SIGN_V1",
    providerRunId: "fixture-run-1",
    providerRunState: "PROVIDER_FINISHED",
    providerConvergenceState: "PROVIDER_CONVERGED",
    warnings: [{ warningId: "warn-1", code: "MESH", text: "fixture warning retained" }],
    cases: [{ providerCaseId: "CASE-DEAD", label: "DL" }],
    combinations: [{ providerCombinationId: "COM-1", label: "COM-1" }],
    results: [
      result("r-n", "e-1", "MEMBER_END_ACTION", "P_AX", 12.5, false, "kN", "START", null),
      result("r-v", "e-1", "MEMBER_END_ACTION", "V2_LOCAL", -3, false, "kN", "START", null),
      result("r-m", "e-1", "MEMBER_END_ACTION", "M3_LOCAL", 4, false, "kN.m", "START", null),
      result("r-t", "e-1", "MEMBER_END_ACTION", "T_LOCAL", 0, true, "kN.m", "START", null),
      result("r-station", "e-1", "MEMBER_STATION_ACTION", "V_STATION", 1.5, false, "kN", "STATION", { value: 0.25, unit: "m", origin: "MEMBER_START", orientation: "LOCAL_I_TO_J" }),
      result("r-rev", "e-2", "MEMBER_END_ACTION", "P_AX", 1, false, "kN", "LOCAL-I", null),
      result("r-rz", "s-1", "SUPPORT_FORCE", "FZ_SUP", 8.25, false, "kN", "SUPPORT_POINT", null),
      result("r-ux", "n-1", "NODE_MOVE", "UX_NODE", 0.002, false, "m", "NODE", null),
    ],
    unknownFields: { note: "retained-provider-text", unused: 1 },
  };
  return {
    adapter: fixtureAdapter(),
    source,
    mappingManifest: fixtureManifest(),
    objectMapping: fixtureObjects(),
    governed: fixtureGoverned(),
    transform: null,
  };
}

function result(
  providerResultId: string,
  providerObjectId: string,
  providerCategory: string,
  providerQuantityName: string,
  value: number | null,
  explicitZero: boolean,
  unit: string | null,
  location: string | null,
  station: { value: number; unit: string; origin: string; orientation: string } | null,
): D1gR1ProviderResult {
  return {
    providerResultId,
    providerObjectId,
    providerCategory,
    providerQuantityName,
    value,
    explicitZero,
    unit,
    coordinateSystemRef: "FIXTURE_GLOBAL_V1",
    signConventionRef: "FIXTURE_SIGN_V1",
    location,
    stationValue: station?.value ?? null,
    stationUnit: station?.unit ?? null,
    stationOrigin: station?.origin ?? null,
    stationOrientation: station?.orientation ?? null,
    providerCaseId: null,
    providerCombinationId: "COM-1",
  };
}

function fixtureAdapter(): D1gR1AdapterIdentity {
  return {
    adapterId: "d1g-provider-neutral-adapter",
    adapterVersion: "1.0.0",
    adapterSchemaVersion: "d1g-r1-1",
    providerId: "d1g-fixture-solver",
    supportedProviderVersions: ["1.0.0"],
    adapterType: "FIXTURE_PROVIDER",
    capabilityManifestRef: "cap-d1g-r1",
    mappingManifestRef: "map-d1g-r1",
    declaredCapabilities: ["MODEL_METADATA", "NODES", "ANALYTICAL_ELEMENTS", "LOAD_CASES", "LOAD_COMBINATIONS", "MEMBER_END_FORCES", "MEMBER_STATION_FORCES", "SUPPORT_REACTIONS", "NODE_DISPLACEMENTS", "WARNINGS", "CONVERGENCE_STATUS"],
    requiredCapabilities: ["MEMBER_END_FORCES", "SUPPORT_REACTIONS", "WARNINGS", "CONVERGENCE_STATUS"],
    status: "ADAPTER_READY",
    authority: "TRANSLATOR_NOT_AUTHORITY",
    provenanceRef: "prov-d1g-adapter",
  };
}

function fixtureManifest(): D1gR1MappingManifest {
  return {
    manifestId: "map-d1g-r1",
    manifestVersion: "1",
    authority: "EXPLICIT_GOVERNED",
    categories: { MEMBER_END_ACTION: "MEMBER_FORCE_ACTION_EFFECT", MEMBER_STATION_ACTION: "MEMBER_FORCE_ACTION_EFFECT", SUPPORT_FORCE: "SUPPORT_REACTION", NODE_MOVE: "NODAL_DISPLACEMENT" },
    quantities: { P_AX: "N", V2_LOCAL: "V_MAJOR", M3_LOCAL: "M_MAJOR", T_LOCAL: "T", V_STATION: "V_MINOR" },
    signs: { P_AX: -1, V2_LOCAL: 1, M3_LOCAL: 1, T_LOCAL: 1, V_STATION: 1 },
    memberEnds: { "LOCAL-I": "MEMBER_START", "LOCAL-J": "MEMBER_END", START: "MEMBER_START", END: "MEMBER_END" },
    locations: { START: "MEMBER_START", END: "MEMBER_END", "LOCAL-I": "MEMBER_START", "LOCAL-J": "MEMBER_END", STATION: "STATION", SUPPORT_POINT: "SUPPORT_POINT", NODE: "NODE" },
    cases: { "CASE-DEAD": "LC1" },
    combinations: { "COM-1": "ULS-1" },
    runStates: { PROVIDER_FINISHED: "COMPLETED", PROVIDER_FINISHED_WITH_NOTES: "COMPLETED_WITH_WARNINGS", PROVIDER_FAILED: "FAILED", PROVIDER_DIVERGED: "NONCONVERGED" },
    convergenceStates: { PROVIDER_CONVERGED: "CONVERGED", PROVIDER_NOT_CONVERGED: "NONCONVERGED" },
    warningCategories: { MESH: "TRANSPORT_WARNING" },
  };
}

function fixtureObjects(): D1gR1ObjectMapping {
  return {
    mappingId: "obj-d1g-r1",
    mappingVersion: "1",
    authority: "EXPLICIT_GOVERNED",
    projectId: "project-1",
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    structuralSystemId: "ss-1",
    analysisModelId: "model-1",
    providerModelId: "fixture-model-1",
    entries: [
      entry("e-1", "ELEMENT", "ae-1", null, null, "member-1", "design-1", "ALIGNED"),
      entry("e-2", "ELEMENT", "ae-2", null, null, "member-2", "design-2", "REVERSED"),
      entry("s-1", "SUPPORT", null, "n-support", "support-1", null, null, "ALIGNED"),
      entry("n-1", "NODE", null, "n-1", null, "member-1", "design-1", "ALIGNED"),
    ],
  };
}

function entry(providerObjectId: string, kind: D1gR1ObjectMappingEntry["kind"], analyticalElementId: string | null, nodeId: string | null, supportId: string | null, physicalMemberId: string | null, designMemberId: string | null, elementDirection: "ALIGNED" | "REVERSED"): D1gR1ObjectMappingEntry {
  return { providerObjectId, providerModelId: "fixture-model-1", kind, analyticalElementId, nodeId, supportId, physicalMemberId, designMemberId, elementDirection };
}

function fixtureGoverned(): D1gR1GovernedContext {
  return {
    projectId: "project-1",
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    structuralSystemId: "ss-1",
    analysisModelId: "model-1",
    analysisModelVersion: "1",
    sourceTopologyFingerprint: "topo-1",
    currentTopologyFingerprint: "topo-1",
    modelStatus: "GOVERNED",
    modelValidationEvidenceRef: "validation-1",
    normalizationRuleVersion: "norm-1",
    currentNormalizationRuleVersion: "norm-1",
    canonicalCoordinateSystemRef: "FIXTURE_GLOBAL_V1",
    signConventionRef: "eos-sign",
    explicitResultAuthority: "VERIFIED_GOVERNED",
    axisMapAuthority: "EXPLICIT_GOVERNED",
    currentMappingFingerprint: null,
  };
}

function toEvaluationInput(
  request: D1gR1AdapterRequest,
  runStatus: string,
  convergenceStatus: string,
  loadCaseIds: readonly string[],
  combinationIds: readonly string[],
  warnings: readonly string[],
  rawResults: readonly D1fR2RawResult[],
  entry: D1gR1ObjectMappingEntry | undefined,
  designMemberId: string,
  objectMappingFingerprint: string,
): D1fR2EvaluationInput {
  const mappingFingerprint = objectMappingFingerprint;
  return {
    structuralSystemId: request.governed.structuralSystemId,
    projectId: request.governed.projectId,
    tenantId: request.governed.tenantId,
    workspaceId: request.governed.workspaceId,
    analysisModelId: request.governed.analysisModelId,
    analysisModelVersion: request.governed.analysisModelVersion,
    sourceTopologyFingerprint: request.governed.sourceTopologyFingerprint,
    mappingFingerprint,
    providerId: request.source.providerId,
    providerName: request.source.providerName,
    providerVersion: request.source.providerVersion,
    providerType: "GOVERNED_EXTERNAL_SOLVER",
    modelType: "RESULT_IMPORT",
    unitSystemRef: request.source.unitContextRef,
    globalCoordinateSystemRef: request.governed.canonicalCoordinateSystemRef,
    providerCoordinateSystemRef: request.source.coordinateSystemRef,
    canonicalCoordinateSystemRef: request.governed.canonicalCoordinateSystemRef,
    signConventionRef: request.governed.signConventionRef,
    assumptionsRef: null,
    sourceModelRef: request.source.providerModelId,
    modelStatus: request.governed.modelStatus,
    modelAuthority: request.governed.explicitResultAuthority,
    modelValidationEvidenceRef: request.governed.modelValidationEvidenceRef,
    normalizationRuleVersion: request.governed.normalizationRuleVersion,
    analysisRunId: `run:${request.source.providerModelId}:${request.source.providerRunId}`,
    analysisType: request.source.analysisType,
    inputFingerprint: fingerprintCanonical({ subject: "PROVIDER_SOURCE", identity: request.source }),
    loadCaseIds,
    combinationIds,
    runStatus,
    convergenceStatus,
    warnings,
    runTimestamp: request.source.sourceTimestamp,
    runAuthority: request.governed.explicitResultAuthority,
    runProvenanceRef: request.adapter.provenanceRef,
    resultSetId: `set:${request.source.providerRunId}:${designMemberId}`,
    rawResults,
    transform: request.transform,
    axisMapAuthority: request.governed.axisMapAuthority,
    axisMap: request.mappingManifest.quantities,
    elementDirection: entry?.elementDirection ?? "ALIGNED",
    reversal: entry?.elementDirection === "REVERSED" ? { endMap: { MEMBER_START: "MEMBER_END", MEMBER_END: "MEMBER_START" }, explicit: true } : null,
    cardinality: "ONE_TO_ONE",
    physicalMemberId: entry?.physicalMemberId ?? null,
    designMemberId,
    designTarget: null,
    aggregationRuleRef: null,
    declaredQuantities: null,
    automaticEnvelope: false,
    governedEnvelope: null,
    currentTopologyFingerprint: request.governed.currentTopologyFingerprint,
    currentMappingFingerprint: request.governed.currentMappingFingerprint ?? mappingFingerprint,
    currentNormalizationRuleVersion: request.governed.currentNormalizationRuleVersion,
    promoteActor: null,
  };
}

function capabilityFor(category: string, location: string | null, manifest: D1gR1MappingManifest): string {
  if (category === "SUPPORT_REACTION") return "SUPPORT_REACTIONS";
  if (category === "NODAL_DISPLACEMENT") return "NODE_DISPLACEMENTS";
  if (category === "MODAL_RESULT") return "MODAL_RESULTS";
  if (category === "BUCKLING_FACTOR") return "BUCKLING_RESULTS";
  const kind = location ? manifest.locations[location] ?? manifest.memberEnds[location] : "";
  return kind === "STATION" ? "MEMBER_STATION_FORCES" : "MEMBER_END_FORCES";
}

function capabilitySatisfied(capability: string, handoffs: readonly { input: D1fR2EvaluationInput }[], reactions: readonly D1fR2RawResult[], warnings: readonly { text: string }[]): boolean {
  if (capability === "SUPPORT_REACTIONS") return reactions.length > 0;
  if (capability === "WARNINGS") return warnings.length > 0;
  if (capability === "CONVERGENCE_STATUS") return true;
  if (capability === "MEMBER_END_FORCES") return handoffs.some((row) => row.input.rawResults.some((raw) => raw.category === "MEMBER_FORCE_ACTION_EFFECT" && raw.locationKind !== "STATION"));
  if (capability === "MEMBER_STATION_FORCES") return handoffs.some((row) => row.input.rawResults.some((raw) => raw.locationKind === "STATION"));
  return true;
}

function mapLabels(ids: readonly string[], table: Readonly<Record<string, string>>, labels: readonly string[], add: (code: string, subjectId: string, message: string) => void, kind: string): string[] {
  const mapped: string[] = [];
  for (const label of labels) {
    if (GENERIC.has(label)) add("GENERIC_LOAD_LABEL", label, "a generic ultimate or service label cannot govern");
  }
  for (const id of ids) {
    const target = table[id];
    if (!target || GENERIC.has(id) || GENERIC.has(target)) {
      add("UNKNOWN_CASE_COMBINATION", id, `provider ${kind} mapping is explicit`);
      continue;
    }
    mapped.push(target);
  }
  return mapped;
}

function resolveRef(caseId: string | null, combinationId: string | null, manifest: D1gR1MappingManifest, add: (code: string, subjectId: string, message: string) => void, resultId: string): { ok: true; loadCaseId: string | null; combinationId: string | null } | { ok: false; reason: string } {
  if (caseId && combinationId) {
    add("AMBIGUOUS_CASE", resultId, "a result identifies a load case or a combination");
    return { ok: false, reason: "AMBIGUOUS_CASE" };
  }
  if (!caseId && !combinationId) {
    add("MISSING_CASE", resultId, "a load case or combination mapping is required");
    return { ok: false, reason: "MISSING_CASE" };
  }
  if (caseId) {
    const mapped = manifest.cases[caseId];
    if (!mapped || GENERIC.has(caseId) || GENERIC.has(mapped)) {
      add("UNKNOWN_CASE_COMBINATION", resultId, "the provider case is not explicitly mapped");
      return { ok: false, reason: "UNKNOWN_CASE_COMBINATION" };
    }
    return { ok: true, loadCaseId: mapped, combinationId: null };
  }
  const mapped = manifest.combinations[combinationId ?? ""];
  if (!mapped || GENERIC.has(combinationId ?? "") || GENERIC.has(mapped)) {
    add("UNKNOWN_CASE_COMBINATION", resultId, "the provider combination is not explicitly mapped");
    return { ok: false, reason: "UNKNOWN_CASE_COMBINATION" };
  }
  return { ok: true, loadCaseId: null, combinationId: mapped };
}

function inspectNumber(value: number | null): number | null | "bad" {
  if (value == null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) return "bad";
  return value;
}

function inspectPayload(request: D1gR1AdapterRequest, limits: Limits, add: (code: string, subjectId: string, message: string) => void): boolean {
  const encoded = safeJson(request.source);
  if (encoded == null || request.source == null || typeof request.source !== "object") {
    add("MALFORMED_PAYLOAD", "source", "provider payload is malformed");
    return true;
  }
  if (encoded.length > limits.maxPayloadBytes || request.source.results.length > limits.maxResultCount || exceedsDepth(request.source, limits.maxNestingDepth)) {
    add("RESOURCE_LIMIT", request.source.sourcePayloadId ?? "source", "provider payload exceeds the bounded limit");
    return true;
  }
  const ids = [request.adapter.adapterId, request.source.providerId, request.source.sourcePayloadId, request.source.providerRunId];
  if (ids.some((id) => !id || id.trim().length === 0 || id.length > limits.maxIdentifierLength || unsafeSourceRef(id))) {
    add("INVALID_IDENTIFIER", request.source.sourcePayloadId ?? "source", "provider identifiers must be bounded and path-free");
    return true;
  }
  return false;
}

function exceedsDepth(value: unknown, maxDepth: number): boolean {
  const stack: { value: unknown; depth: number }[] = [{ value, depth: 0 }];
  const seen = new Set<unknown>();
  let visited = 0;
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) break;
    visited += 1;
    if (visited > 10000 || current.depth > maxDepth) return true;
    if (!current.value || typeof current.value !== "object") continue;
    if (seen.has(current.value)) continue;
    seen.add(current.value);
    for (const entry of Object.values(current.value as Record<string, unknown>)) stack.push({ value: entry, depth: current.depth + 1 });
  }
  return false;
}

function unsafeSourceRef(value: string): boolean {
  const text = value.toLowerCase();
  return text.includes("..") || text.includes("file:") || text.includes("\\\\") || text.startsWith("/") || text.startsWith("\\") || /^[a-z]:/.test(text);
}

function sameScope(request: D1gR1AdapterRequest): boolean {
  return request.source.projectId === request.governed.projectId && request.objectMapping.projectId === request.governed.projectId
    && request.source.tenantId === request.governed.tenantId && request.objectMapping.tenantId === request.governed.tenantId
    && request.source.workspaceId === request.governed.workspaceId && request.objectMapping.workspaceId === request.governed.workspaceId;
}

function scopeCode(request: D1gR1AdapterRequest): string {
  if (request.source.tenantId !== request.governed.tenantId || request.objectMapping.tenantId !== request.governed.tenantId) return "CROSS_TENANT";
  if (request.source.workspaceId !== request.governed.workspaceId || request.objectMapping.workspaceId !== request.governed.workspaceId) return "CROSS_WORKSPACE";
  return "CROSS_PROJECT";
}

function resolveLimits(partial: Partial<Limits> | undefined): Limits {
  return {
    maxPayloadBytes: partial?.maxPayloadBytes ?? D1G_R1_DEFAULT_RESOURCE_LIMITS.maxPayloadBytes,
    maxResultCount: partial?.maxResultCount ?? D1G_R1_DEFAULT_RESOURCE_LIMITS.maxResultCount,
    maxNestingDepth: partial?.maxNestingDepth ?? D1G_R1_DEFAULT_RESOURCE_LIMITS.maxNestingDepth,
    maxIdentifierLength: partial?.maxIdentifierLength ?? D1G_R1_DEFAULT_RESOURCE_LIMITS.maxIdentifierLength,
  };
}

function safeJson(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

function blankExecution(request: D1gR1AdapterRequest, preserved: D1gR1ProviderSource | null, sourceFingerprint: string, mappingManifestFingerprint: string, objectMappingFingerprint: string, executionFingerprint: string, findings: readonly D1gR1Finding[]): D1gR1AdapterExecution {
  return {
    revision: "CURRENT",
    adapterId: request.adapter.adapterId,
    adapterVersion: request.adapter.adapterVersion,
    adapterSchemaVersion: request.adapter.adapterSchemaVersion,
    providerId: request.source?.providerId ?? "",
    providerName: request.source?.providerName ?? "",
    providerVersion: request.source?.providerVersion ?? "",
    adapterType: request.adapter.adapterType,
    authority: request.adapter.authority,
    provenanceRef: request.adapter.provenanceRef,
    declaredCapabilities: negotiateAdapterCapabilities({ providerName: request.source?.providerName ?? "", declared: request.adapter.declaredCapabilities }),
    sourceFingerprint,
    preservedSource: preserved ?? ({} as D1gR1ProviderSource),
    mappingManifestFingerprint,
    objectMappingFingerprint,
    executionFingerprint,
    completeness: "INVALID",
    canGovern: false,
    autoPromotedVerifiedGoverned: false,
    governedTopologyCreated: false,
    memberForceCalculated: false,
    supportReactionCalculated: false,
    displacementCalculated: false,
    rawSourceMutated: false,
    duplicateDetected: false,
    findings,
    warnings: [],
    unmappedResults: [],
    rejectedResults: [],
    supportReactions: [],
    handoffs: [],
    provenance: [],
  };
}

function finish(base: D1gR1AdapterExecution, completeness: D1gR1Completeness, canGovern: boolean, findings: readonly D1gR1Finding[]): D1gR1AdapterExecution {
  return { ...base, completeness, canGovern, findings: [...findings] };
}

function provenance(request: D1gR1AdapterRequest, sourceFingerprint: string, handoffs: readonly { binding: D1fR2BindingResult }[], reactions: readonly D1fR2RawResult[]): D1gR1AdapterExecution["provenance"] {
  return [
    { stage: "SOURCE_PAYLOAD", subjectId: request.source.sourcePayloadId, provenanceRef: sourceFingerprint },
    { stage: "ADAPTER", subjectId: request.adapter.adapterId, provenanceRef: request.adapter.provenanceRef },
    { stage: "MAPPING_MANIFEST", subjectId: request.mappingManifest.manifestId, provenanceRef: request.mappingManifest.manifestVersion },
    { stage: "PROVIDER_MODEL", subjectId: request.source.providerModelId, provenanceRef: request.source.providerModelVersion },
    { stage: "PROVIDER_RUN", subjectId: request.source.providerRunId, provenanceRef: request.source.providerRunVersion },
    ...reactions.map((row) => ({ stage: "SUPPORT_REACTION", subjectId: row.resultId, provenanceRef: row.provenanceRef })),
    ...handoffs.flatMap((row) => row.binding.provenance),
  ];
}
