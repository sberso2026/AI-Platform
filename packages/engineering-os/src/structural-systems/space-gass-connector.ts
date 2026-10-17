import { createHash } from "node:crypto";
import type {
  D1gR1AdapterRequest,
  D1gR1GovernedContext,
  D1gR1ObjectMapping,
  D1gR1ProviderResult,
  D1gR1ProviderSource,
  D1gR2PackageDocument,
  D1gR2ResourceLimits,
} from "@rtb/types";
import {
  D1G_R2_DEFAULT_RESOURCE_LIMITS,
  D1G_R2_PACKAGE_FORMAT,
  D1G_R2_SCHEMA_VERSION,
  D1G_R4_CONNECTOR_VERSION,
  D1G_R4_FEATURE_FLAG_DEFAULT,
  D1G_R4_PROVIDER_ID,
  D1G_R4_PROVIDER_PRODUCT,
  D1G_R4_SUPPORTED_PROVIDER_VERSIONS,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D1G_R3_SELECTION_RECORD } from "./provider-selection";
import { ingestStructuralResultPackage } from "./result-package";
import { manifestForGovernedMaps, spaceGassAdapter, spaceGassMappingFingerprint, SPACE_GASS_MAPPING_MANIFEST, SPACE_GASS_SIGN_STATEMENTS, SPACE_GASS_UNRESOLVED_MAPPING } from "./space-gass-mapping";

export const D1G_R4_SELECTION_RECORD_VERIFIED =
  D1G_R3_SELECTION_RECORD.selectedProvider === "SPACE_GASS"
  && D1G_R3_SELECTION_RECORD.product === "SPACE GASS"
  && D1G_R3_SELECTION_RECORD.integrationMode === "LOCAL_REST_READ_ONLY"
  && D1G_R3_SELECTION_RECORD.versionScope.includes("API_URL_V1");

export type SpaceGassSnapshotResponse = {
  endpointId: string;
  query: Readonly<Record<string, string>>;
  rawText: string;
};

export type SpaceGassSnapshot = {
  productVersion: string;
  capturedAt: string;
  inertDisplayName?: string | null;
  responses: readonly SpaceGassSnapshotResponse[];
};

export type SpaceGassFinding = { code: string; layer: "PROVIDER" | "CONNECTOR" | "MAPPING" | "R1" | "R2" | "D1F"; message: string };

type ForceRow = { Case?: number; Member?: number; Station?: number[]; Location?: number[]; Fx?: Array<number | null>; Fy?: Array<number | null>; Fz?: Array<number | null>; Mx?: Array<number | null>; My?: Array<number | null>; Mz?: Array<number | null> };
type ReactionRow = { Node?: number; LoadCase?: number; Fx?: number | null; Fy?: number | null; Fz?: number | null };

const COMPONENTS = ["Fx", "Fy", "Fz", "Mx", "My", "Mz"] as const;
const REACTION_COMPONENTS = ["Fx", "Fy", "Fz"] as const;

export type SpaceGassConnectorInput = {
  snapshot: SpaceGassSnapshot;
  governed: D1gR1GovernedContext;
  objectMapping: D1gR1ObjectMapping;
  caseMap: Readonly<Record<string, string>>;
  combinationMap: Readonly<Record<string, string>>;
  limits?: D1gR2ResourceLimits;
};

export function spaceGassReadOnlyConnectorEnabled(flag: boolean = D1G_R4_FEATURE_FLAG_DEFAULT): boolean {
  return flag === true;
}

export function validateSpaceGassProviderVersion(version: string): { ok: true; version: string } | { ok: false; code: "UNSUPPORTED_PROVIDER_VERSION" | "UNRESOLVED_PROVIDER_VERSION" } {
  if (!version) return { ok: false, code: "UNRESOLVED_PROVIDER_VERSION" };
  if (!D1G_R4_SUPPORTED_PROVIDER_VERSIONS.includes(version as never)) return { ok: false, code: "UNSUPPORTED_PROVIDER_VERSION" };
  return { ok: true, version };
}

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function responseText(snapshot: SpaceGassSnapshot, endpointId: string): string | null {
  const rows = snapshot.responses.filter((row) => row.endpointId === endpointId);
  if (rows.length !== 1) return null;
  return rows[0]!.rawText;
}

function readJson(text: string | null): unknown {
  if (text == null) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

function finite(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function axisOrientation(member: { NodeA?: number; NodeB?: number; DirectionAngle?: number }, nodes: readonly { Id?: number; X?: number; Y?: number; Z?: number }[]): { orientation: string; explicit: boolean } {
  const start = nodes.find((node) => node.Id === member.NodeA);
  const end = nodes.find((node) => node.Id === member.NodeB);
  const roll = typeof member.DirectionAngle === "number" && Number.isFinite(member.DirectionAngle) ? `|ROLL:${member.DirectionAngle}` : "";
  if (!start || !end || finite(start.X) == null || finite(start.Y) == null || finite(start.Z) == null || finite(end.X) == null || finite(end.Y) == null || finite(end.Z) == null) {
    return { orientation: `LOCAL_X_NODE_A_TO_NODE_B_COORDINATES_ABSENT${roll}`, explicit: false };
  }
  const vertical = start.X === end.X && start.Z === end.Z && start.Y !== end.Y;
  const base = vertical ? "LOCAL_X_A_TO_B_VERTICAL_LOCAL_Z_FOLLOWS_GLOBAL_Z" : "LOCAL_X_A_TO_B_LOCAL_Y_TOWARD_GLOBAL_Y";
  return { orientation: `${base}${roll}`, explicit: true };
}

export function nativeSnapshotFingerprint(snapshot: SpaceGassSnapshot): string {
  const rows = [...snapshot.responses].sort((left, right) => `${left.endpointId}|${JSON.stringify(left.query)}`.localeCompare(`${right.endpointId}|${JSON.stringify(right.query)}`));
  return sha256(rows.map((row) => `${row.endpointId}\n${JSON.stringify(leftQuery(row.query))}\n${row.rawText}`).join("\n"));
}

function leftQuery(query: Readonly<Record<string, string>>): Record<string, string> {
  return Object.fromEntries(Object.entries(query).sort((left, right) => left[0].localeCompare(right[0])));
}

export function executeSpaceGassReadOnlyConnector(input: SpaceGassConnectorInput) {
  const preserved = input.snapshot.responses.map((row) => row.rawText);
  const findings: SpaceGassFinding[] = [];
  const add = (code: string, layer: SpaceGassFinding["layer"], message: string) => findings.push({ code, layer, message });
  const version = validateSpaceGassProviderVersion(input.snapshot.productVersion);
  if (!version.ok) add(version.code, "PROVIDER", "provider version is outside the explicit tested pairing examples");
  const limits = input.limits ?? D1G_R2_DEFAULT_RESOURCE_LIMITS;
  const nativeFingerprint = nativeSnapshotFingerprint(input.snapshot);
  const unitsText = responseText(input.snapshot, "JOB_UNITS");
  const units = readJson(unitsText);
  const forceUnit = isRecord(units) && typeof units.Force === "string" ? units.Force : null;
  const lengthUnit = isRecord(units) && typeof units.Length === "string" ? units.Length : null;
  const momentUnit = isRecord(units) && typeof units.Moment === "string" ? units.Moment : null;
  if (!forceUnit || !lengthUnit) add("UNIT_MAPPING_FAILED", "MAPPING", "job force and length units were not present on the units response");
  const nodes = arrayOf(readJson(responseText(input.snapshot, "NODES")));
  const members = arrayOf(readJson(responseText(input.snapshot, "MEMBERS")));
  const restraints = arrayOf(readJson(responseText(input.snapshot, "NODE_RESTRAINTS")));
  const cases = arrayOf(readJson(responseText(input.snapshot, "LOAD_CASES")));
  const combinations = arrayOf(readJson(responseText(input.snapshot, "COMBINATION_LOAD_CASES")));
  const forceEnvelope = readJson(responseText(input.snapshot, "MEMBER_INTERMEDIATE_FORCES"));
  const reactionEnvelope = readJson(responseText(input.snapshot, "NODE_REACTIONS"));
  const runBody = readJson(responseText(input.snapshot, "RUN_STATUS"));
  if (unitsText == null || !Array.isArray(nodes) || !Array.isArray(members)) add("SOURCE_INVALID", "CONNECTOR", "the snapshot is missing a required read response");

  const run = isRecord(runBody) ? runBody : null;
  const runStatus = typeof run?.Status === "string" ? run.Status : "";
  const runId = typeof run?.RunId === "number" && Number.isInteger(run.RunId) ? String(run.RunId) : "";
  if (!runId || !["Completed", "Failed", "Cancelled"].includes(runStatus)) add("MODEL_NOT_ANALYZED", "PROVIDER", "run identity or terminal status is unresolved");
  const providerRunId = runId ? `run-${runId}` : "UNRESOLVED";
  const mappedRun = SPACE_GASS_MAPPING_MANIFEST.runStates[runStatus] ?? "";
  const warnings = warningRows(forceEnvelope, reactionEnvelope);
  if (runStatus === "Failed") add("RUN_FAILED", "PROVIDER", "the provider run status is Failed");
  if (runStatus === "Cancelled") add("RUN_FAILED", "PROVIDER", "the provider run status is Cancelled");

  const nodeRows = (nodes ?? []).filter(isRecord);
  const memberRows = (members ?? []).filter(isRecord);
  const restraintRows = (restraints ?? []).filter(isRecord);
  const supportNodes = new Set(restraintRows.map((row) => row.Node).filter((value) => typeof value === "number"));
  for (const node of nodeRows) {
    if (node.NodeType === "Restrained" && typeof node.Id === "number") supportNodes.add(node.Id);
  }

  const extractedCases = (cases ?? []).filter(isRecord).map((row) => ({ providerCaseId: String(row.Id ?? ""), title: typeof row.Title === "string" ? row.Title : "" })).filter((row) => row.providerCaseId !== "undefined" && row.providerCaseId !== "");
  const extractedCombinations = (combinations ?? []).filter(isRecord).map((row) => ({
    providerCombinationId: String(row.Id ?? ""),
    title: typeof row.Title === "string" ? row.Title : "",
    factors: Array.isArray(row.Items) ? row.Items : [],
  })).filter((row) => row.providerCombinationId !== "");

  const results: D1gR1ProviderResult[] = [];
  const forceRows = envelopeRows(forceEnvelope) as ForceRow[];
  for (const row of forceRows) {
    const memberId = row.Member;
    const caseId = row.Case;
    const member = memberRows.find((item) => item.Id === memberId);
    const orientation = member ? axisOrientation(member, nodeRows) : { orientation: "", explicit: false };
    if (!orientation.explicit && orientation.orientation.includes("COORDINATES_ABSENT")) add("AXIS_MAPPING_FAILED", "MAPPING", "member coordinates were absent so local y and z were not guessed");
    const locations = row.Location ?? [];
    const stations = row.Station ?? [];
    if (locations.length !== stations.length) add("RESULT_LOCATION_UNRESOLVED", "MAPPING", "station index and location arrays differ");
    for (let index = 0; index < locations.length; index += 1) {
      const distance = locations[index];
      if (typeof distance !== "number" || !Number.isFinite(distance)) {
        add("RESULT_LOCATION_UNRESOLVED", "MAPPING", "a station distance was absent");
        continue;
      }
      for (const component of COMPONENTS) {
        const series = row[component];
        if (!series || index >= series.length || series[index] == null) continue;
        const value = series[index];
        if (typeof value !== "number" || !Number.isFinite(value)) {
          add("SOURCE_INVALID", "PROVIDER", "a station component was not a finite number");
          continue;
        }
        const unit = component === "Fx" || component === "Fy" || component === "Fz" ? forceUnit : momentUnit;
        if (!unit) {
          add("UNIT_MAPPING_FAILED", "MAPPING", "a station component has no job unit");
          continue;
        }
        results.push(resultRow(`m${memberId}-c${caseId}-s${stations[index]}-${component}`, `m:${memberId}`, "MEMBER_STATION_ACTION", component, value, unit, "SG-MEMBER-LOCAL-V1", "STATION", distance, lengthUnit, orientation.orientation || "UNRESOLVED", caseId));
      }
    }
  }
  const reactionRows = envelopeRows(reactionEnvelope) as ReactionRow[];
  for (const row of reactionRows) {
    if (isRecord(row) && ("Mx" in row || "My" in row || "Mz" in row)) add("UNSUPPORTED_RESULT_TYPE", "MAPPING", "reaction moment fields are unresolved and were not read");
    for (const component of REACTION_COMPONENTS) {
      if (!(component in row) || row[component] == null) continue;
      const value = row[component];
      if (typeof value !== "number" || !Number.isFinite(value)) continue;
      if (!forceUnit) continue;
      results.push(resultRow(`s${row.Node}-c${row.LoadCase}-${component}`, `s:${row.Node}`, "SUPPORT_FORCE", component === "Fx" ? "RFX" : component === "Fy" ? "RFY" : "RFZ", value, forceUnit, "SG-GLOBAL-XYZ-V1", "NODE", null, null, null, row.LoadCase));
    }
  }

  const approved = results.filter((row) => {
    const caseKey = row.providerCaseId ?? row.providerCombinationId ?? "";
    const inCase = row.providerCaseId ? Object.hasOwn(input.caseMap, row.providerCaseId) : false;
    const inCombination = row.providerCombinationId ? Object.hasOwn(input.combinationMap, row.providerCombinationId) : false;
    if (!inCase && !inCombination) {
      add("CASE_MAPPING_FAILED", "MAPPING", "a provider case or combination has no governed map");
      return false;
    }
    const mapped = input.objectMapping.entries.some((entry) => entry.providerObjectId === row.providerObjectId && entry.providerModelId === input.objectMapping.providerModelId);
    if (!mapped) {
      add("OBJECT_MAPPING_FAILED", "MAPPING", "a provider object has no governed mapping");
      return false;
    }
    return caseKey.length > 0;
  });

  const modelId = safeName(input.snapshot.inertDisplayName) ?? `job-${nativeFingerprint.slice(0, 16)}`;
  const manifest = manifestForGovernedMaps(input.caseMap, input.combinationMap);
  const source = buildSource(input, version.ok ? version.version : input.snapshot.productVersion, modelId, providerRunId, runStatus || "UNRESOLVED", warnings, approved);
  const request: D1gR1AdapterRequest = {
    adapter: spaceGassAdapter(),
    source,
    mappingManifest: manifest,
    objectMapping: input.objectMapping,
    governed: input.governed,
    transform: null,
  };
  const bundle = buildBundle({ input, source, request, limits, nativeFingerprint, modelId, providerRunId, findings });
  const mutated = input.snapshot.responses.some((row, index) => row.rawText !== preserved[index]);
  if (mutated) add("SOURCE_INVALID", "CONNECTOR", "native snapshot bytes changed");
  const log = { provider: D1G_R4_PROVIDER_ID, endpoint: "SNAPSHOT", status: runStatus || "UNRESOLVED", resultCount: approved.length, fingerprint: nativeFingerprint };
  return {
    connectorVersion: D1G_R4_CONNECTOR_VERSION,
    providerId: D1G_R4_PROVIDER_ID,
    product: D1G_R4_PROVIDER_PRODUCT,
    productVersion: input.snapshot.productVersion,
    apiGeneration: "v1",
    modelId,
    providerRunId,
    providerRunState: runStatus,
    mappedRunState: mappedRun,
    convergenceState: "NOT_ESTABLISHED",
    mappedConvergenceState: "NOT_CONVERGENCE_PROOF",
    runIdentityUnresolved: !runId,
    units: { forceUnit, lengthUnit, momentUnit },
    cases: extractedCases,
    combinations: extractedCombinations,
    members: memberRows.map((row) => ({ id: `m:${row.Id}`, nodeA: row.NodeA ?? null, nodeB: row.NodeB ?? null, directionAngle: row.DirectionAngle ?? null, orientation: axisOrientation(row, nodeRows).orientation })),
    nodes: nodeRows.map((row) => ({ id: `n:${row.Id}`, x: row.X ?? null, y: row.Y ?? null, z: row.Z ?? null })),
    supports: [...supportNodes].map((node) => ({ id: `s:${node}`, nodeId: `n:${node}`, coordinateSystem: "SG-GLOBAL-XYZ-V1" })),
    stationResults: approved.filter((row) => row.providerCategory === "MEMBER_STATION_ACTION"),
    reactionResults: approved.filter((row) => row.providerCategory === "SUPPORT_FORCE"),
    warnings,
    findings,
    nativeFingerprint,
    mappingFingerprint: spaceGassMappingFingerprint(),
    signStatements: SPACE_GASS_SIGN_STATEMENTS,
    unresolved: SPACE_GASS_UNRESOLVED_MAPPING,
    request,
    bundle,
    log,
    snapshotMutated: mutated,
    canGovern: false,
  };
}

function resultRow(id: string, objectId: string, category: string, quantity: string, value: number, unit: string, coordinate: string, location: string, distance: number | null, lengthUnit: string | null, orientation: string | null, caseId: number | undefined): D1gR1ProviderResult {
  const caseKey = caseId == null ? null : String(caseId);
  return {
    providerResultId: id,
    providerObjectId: objectId,
    providerCategory: category,
    providerQuantityName: quantity,
    value,
    explicitZero: value === 0,
    unit,
    coordinateSystemRef: coordinate,
    signConventionRef: "SG-SIGN-V1",
    location,
    stationValue: distance,
    stationUnit: distance == null ? null : lengthUnit,
    stationOrigin: distance == null ? null : "NODE_A",
    stationOrientation: distance == null ? null : orientation,
    providerCaseId: caseKey,
    providerCombinationId: null,
  };
}

function arrayOf(value: unknown): Record<string, unknown>[] | null {
  return Array.isArray(value) ? value.filter(isRecord) : null;
}

function envelopeRows(value: unknown): Record<string, unknown>[] {
  if (!isRecord(value) || !Array.isArray(value.Results)) return [];
  return value.Results.filter(isRecord);
}

function warningRows(forceEnvelope: unknown, reactionEnvelope: unknown): { warningId: string; code: string; text: string }[] {
  const ids = new Set<number>();
  for (const envelope of [forceEnvelope, reactionEnvelope]) {
    if (!isRecord(envelope) || !isRecord(envelope.Warnings) || !Array.isArray(envelope.Warnings.LoadCasesNotAnalyzed)) continue;
    for (const id of envelope.Warnings.LoadCasesNotAnalyzed) if (typeof id === "number") ids.add(id);
  }
  return [...ids].sort((left, right) => left - right).map((id) => ({ warningId: `unanalysed-${id}`, code: "LOAD_CASES_NOT_ANALYZED", text: `load case ${id} was not analysed` }));
}

function safeName(value: string | null | undefined): string | null {
  if (!value || !/^[A-Za-z0-9._-]{1,64}$/.test(value)) return null;
  return value;
}

function buildSource(input: SpaceGassConnectorInput, version: string, modelId: string, providerRunId: string, runStatus: string, warnings: { warningId: string; code: string; text: string }[], results: readonly D1gR1ProviderResult[]): D1gR1ProviderSource {
  const caseIds = [...new Set(results.map((row) => row.providerCaseId).filter((row): row is string => !!row))].sort();
  return {
    sourcePayloadId: `sg-${modelId}`,
    providerId: D1G_R4_PROVIDER_ID,
    providerName: D1G_R4_PROVIDER_PRODUCT,
    providerVersion: version,
    providerModelVersion: modelId,
    providerRunVersion: providerRunId,
    sourceType: "SPACE_GASS_NATIVE_SNAPSHOT",
    sourceName: "space-gass-native-snapshot",
    sourceVersion: "1",
    sourceTimestamp: input.snapshot.capturedAt,
    projectId: input.governed.projectId,
    tenantId: input.governed.tenantId,
    workspaceId: input.governed.workspaceId,
    providerModelId: modelId,
    analysisType: "STATIC_RESULT_IMPORT",
    unitContextRef: "SG-JOB-UNITS",
    coordinateSystemRef: "SG-MEMBER-LOCAL-V1",
    signConventionRef: "SG-SIGN-V1",
    providerRunId,
    providerRunState: runStatus,
    providerConvergenceState: "NOT_ESTABLISHED",
    warnings,
    cases: caseIds.map((id) => ({ providerCaseId: id, label: id })),
    combinations: [],
    results,
    unknownFields: { unresolved: SPACE_GASS_UNRESOLVED_MAPPING },
  };
}

function buildBundle(args: {
  input: SpaceGassConnectorInput;
  source: D1gR1ProviderSource;
  request: D1gR1AdapterRequest;
  limits: D1gR2ResourceLimits;
  nativeFingerprint: string;
  modelId: string;
  providerRunId: string;
  findings: SpaceGassFinding[];
}) {
  const station = args.source.results.filter((row) => row.providerCategory === "MEMBER_STATION_ACTION").sort((left, right) => left.providerResultId.localeCompare(right.providerResultId));
  const reactions = args.source.results.filter((row) => row.providerCategory === "SUPPORT_FORCE").sort((left, right) => left.providerResultId.localeCompare(right.providerResultId));
  const chunks = [
    ...pack(station, "MEMBER_STATION_FORCES", args).map((rows, index) => packageChunk(args, `station-${index + 1}`, "MEMBER_STATION_FORCES", rows, ["MEMBER_STATION_FORCES"])),
    ...pack(reactions, "SUPPORT_REACTIONS", args).map((rows, index) => packageChunk(args, `reaction-${index + 1}`, "SUPPORT_REACTIONS", rows, ["SUPPORT_REACTIONS"])),
    packageChunk(args, "warnings-1", "WARNINGS_RUN_STATUS", [], ["WARNINGS"]),
  ].filter((chunk) => chunk != null);
  const complete = args.findings.every((row) => row.code !== "MODEL_NOT_ANALYZED" && row.code !== "UNIT_MAPPING_FAILED" && row.code !== "UNSUPPORTED_PROVIDER_VERSION" && row.code !== "UNRESOLVED_PROVIDER_VERSION");
  const descriptors = chunks.map((chunk, index) => ({
    chunkId: chunk.packageId,
    chunkType: chunk.chunkType,
    caseScope: [...new Set(chunk.document.results.map((row) => row.providerCaseId).filter((row): row is string => !!row))].sort(),
    memberScope: chunk.chunkType === "MEMBER_STATION_FORCES" ? [...new Set(chunk.document.results.map((row) => row.providerObjectId))].sort() : [],
    nodeScope: chunk.chunkType === "SUPPORT_REACTIONS" ? [...new Set(chunk.document.results.map((row) => row.providerObjectId))].sort() : [],
    sequence: index + 1,
    resultCount: chunk.document.results.length,
    objectCount: chunk.document.providerObjects.length,
    rawFingerprint: sha256(chunk.bytesText),
    semanticFingerprint: fingerprintCanonical({ subject: "SPACE_GASS_CHUNK", identity: chunk.document.results.map((row) => row.providerResultId).sort() }),
    packageFingerprint: sha256(chunk.bytesText),
    completeness: "PRESENT",
    findings: [] as string[],
  }));
  const fingerprint = spaceGassBundleFingerprint({
    providerVersion: args.source.providerVersion,
    connectorVersion: D1G_R4_CONNECTOR_VERSION,
    mappingManifestFingerprint: spaceGassMappingFingerprint(),
    nativeSourceFingerprint: args.nativeFingerprint,
    chunks: descriptors.map((row) => ({ chunkId: row.chunkId, packageFingerprint: row.packageFingerprint })),
    objectMappingId: args.input.objectMapping.mappingId,
    projectId: args.input.governed.projectId,
  });
  return {
    bundleId: `bundle-${args.modelId}`,
    bundleSchemaVersion: "d1g-r4-1",
    providerId: D1G_R4_PROVIDER_ID,
    providerVersion: args.source.providerVersion,
    connectorVersion: D1G_R4_CONNECTOR_VERSION,
    mappingManifestFingerprint: spaceGassMappingFingerprint(),
    nativeSourceFingerprint: args.nativeFingerprint,
    modelId: args.modelId,
    runId: args.providerRunId,
    chunks: descriptors,
    packages: chunks.map((chunk) => ({ chunkId: chunk.packageId, bytesText: chunk.bytesText })),
    completeness: complete ? "COMPLETE" : "INCOMPLETE",
    provenance: ["D1F_NORMALIZED_RESULT", "D1F_RAW_RESULT", "R1_NEUTRAL_ADAPTER", "R4_SPACE_GASS_CONNECTOR", "PROVIDER_RESULT", "PROVIDER_MODEL_RUN", "NATIVE_SNAPSHOT", "PROVIDER_VERSION", "CONNECTOR_VERSION", "MAPPING_MANIFEST_VERSION"],
    fingerprint,
    request: args.request,
  };
}

function pack(rows: readonly D1gR1ProviderResult[], _kind: string, args: { limits: D1gR2ResourceLimits }): D1gR1ProviderResult[][] {
  const groups: D1gR1ProviderResult[][] = [];
  let current: D1gR1ProviderResult[] = [];
  for (const row of rows) {
    if (current.length === args.limits.maxResultCount) {
      groups.push(current);
      current = [];
    }
    current.push(row);
  }
  if (current.length > 0) groups.push(current);
  return groups;
}

function packageChunk(args: { input: SpaceGassConnectorInput; source: D1gR1ProviderSource; limits: D1gR2ResourceLimits }, packageId: string, chunkType: string, rows: readonly D1gR1ProviderResult[], capabilities: string[]) {
  const objects = [...new Set(rows.map((row) => row.providerObjectId))].sort();
  const cases = [...new Set(rows.map((row) => row.providerCaseId).filter((row): row is string => !!row))].sort();
  const document: D1gR2PackageDocument = {
    packageFormat: D1G_R2_PACKAGE_FORMAT,
    schemaVersion: D1G_R2_SCHEMA_VERSION,
    packageId,
    createdAt: args.input.snapshot.capturedAt,
    completeness: rows.length > 0 ? "COMPLETE" : "PARTIAL",
    producer: { producerId: "d1g-r4-space-gass", producerName: "SPACE_GASS_READ_ONLY_CONNECTOR" },
    provider: { providerId: D1G_R4_PROVIDER_ID, providerName: D1G_R4_PROVIDER_PRODUCT, providerVersion: args.source.providerVersion },
    source: { sourceName: "space-gass-native-snapshot", sourceVersion: "1", sourceTimestamp: args.input.snapshot.capturedAt },
    model: {
      providerModelId: args.source.providerModelId,
      modelVersion: args.source.providerModelVersion,
      analysisType: "STATIC_RESULT_IMPORT",
      unitContextRef: "SG-JOB-UNITS",
      coordinateSystemRef: "SG-MEMBER-LOCAL-V1",
      signConventionRef: "SG-SIGN-V1",
    },
    run: {
      providerRunId: args.source.providerRunId,
      providerRunState: args.source.providerRunState,
      providerConvergenceState: "NOT_ESTABLISHED",
      runVersion: args.source.providerRunVersion,
      runTimestamp: args.input.snapshot.capturedAt,
    },
    capabilities,
    mappingExpectation: { mappingManifestId: SPACE_GASS_MAPPING_MANIFEST.manifestId, mappingManifestVersion: SPACE_GASS_MAPPING_MANIFEST.manifestVersion, mappingManifestFingerprint: null },
    objectMappingExpectation: { objectMappingId: args.input.objectMapping.mappingId, objectMappingVersion: args.input.objectMapping.mappingVersion },
    loadCases: cases.map((id) => ({ providerCaseId: id, providerCaseName: id, providerCaseType: null })),
    loadCombinations: [],
    providerObjects: objects.map((id) => ({ providerObjectId: id, providerObjectType: id.startsWith("s:") ? "SUPPORT" : "ELEMENT", providerModelId: args.source.providerModelId })),
    results: rows.map((row) => ({
      providerResultId: row.providerResultId,
      providerObjectId: row.providerObjectId,
      providerRunId: args.source.providerRunId,
      resultCategory: row.providerCategory,
      providerQuantityName: row.providerQuantityName,
      rawValue: row.value,
      explicitZero: row.explicitZero,
      rawUnit: row.unit,
      coordinateSystem: row.coordinateSystemRef,
      signConvention: row.signConventionRef,
      resultLocation: row.location,
      station: row.stationValue == null ? null : { value: row.stationValue, unit: row.stationUnit ?? "", origin: row.stationOrigin ?? "", orientation: row.stationOrientation ?? "" },
      providerCaseId: row.providerCaseId,
      providerCombinationId: null,
      warningIds: [],
    })),
    warnings: chunkType === "WARNINGS_RUN_STATUS" ? args.source.warnings.map((row) => ({ ...row, resultId: null })) : [],
    extensions: {},
  };
  const bytesText = JSON.stringify(document);
  if (Buffer.byteLength(bytesText) > args.limits.maxFileBytes || document.results.length > args.limits.maxResultCount || document.providerObjects.length > args.limits.maxObjectCount) {
    return null;
  }
  return { packageId, chunkType, document, bytesText };
}

export function spaceGassBundleFingerprint(identity: { providerVersion: string; connectorVersion: string; mappingManifestFingerprint: string; nativeSourceFingerprint: string; chunks: readonly { chunkId: string; packageFingerprint: string }[]; objectMappingId: string; projectId: string }): string {
  return fingerprintCanonical({
    subject: "SPACE_GASS_RESULT_BUNDLE",
    identity: { ...identity, chunks: [...identity.chunks].sort((left, right) => left.chunkId.localeCompare(right.chunkId)) },
  });
}

export function assessSpaceGassBundleCompleteness(expectedChunkIds: readonly string[], presentChunkIds: readonly string[]): "COMPLETE" | "INCOMPLETE" {
  const present = new Set(presentChunkIds);
  return expectedChunkIds.every((id) => present.has(id)) ? "COMPLETE" : "INCOMPLETE";
}

export function ingestSpaceGassChunk(bytesText: string, input: SpaceGassConnectorInput) {
  return ingestStructuralResultPackage({
    bytes: new TextEncoder().encode(bytesText),
    authorized: input.governed,
    profileId: "profile-1",
    registry: { adapters: [spaceGassAdapter()], mappingManifests: [manifestForGovernedMaps(input.caseMap, input.combinationMap)], objectMappings: [input.objectMapping] },
  });
}

export function recordSpaceGassSuccessor(prior: ReturnType<typeof executeSpaceGassReadOnlyConnector>, input: SpaceGassConnectorInput) {
  return { prior, current: executeSpaceGassReadOnlyConnector(input) };
}

export function inspectSource(snapshot: SpaceGassSnapshot): { responseCount: number; fingerprint: string } {
  return { responseCount: snapshot.responses.length, fingerprint: nativeSnapshotFingerprint(snapshot) };
}
export function validateCompatibility(snapshot: SpaceGassSnapshot) {
  return validateSpaceGassProviderVersion(snapshot.productVersion);
}
export function extractProviderMetadata(execution: ReturnType<typeof executeSpaceGassReadOnlyConnector>) {
  return { providerId: execution.providerId, product: execution.product, version: execution.productVersion, modelId: execution.modelId };
}
export function extractRunMetadata(execution: ReturnType<typeof executeSpaceGassReadOnlyConnector>) {
  return { providerRunId: execution.providerRunId, providerRunState: execution.providerRunState, convergenceState: execution.convergenceState, unresolved: execution.runIdentityUnresolved };
}
export function extractObjects(execution: ReturnType<typeof executeSpaceGassReadOnlyConnector>) {
  return { members: execution.members, nodes: execution.nodes, supports: execution.supports };
}
export function extractLoadCases(execution: ReturnType<typeof executeSpaceGassReadOnlyConnector>) {
  return execution.cases;
}
export function extractLoadCombinations(execution: ReturnType<typeof executeSpaceGassReadOnlyConnector>) {
  return execution.combinations;
}
export function extractMemberResults(execution: ReturnType<typeof executeSpaceGassReadOnlyConnector>) {
  return execution.stationResults;
}
export function extractSupportReactions(execution: ReturnType<typeof executeSpaceGassReadOnlyConnector>) {
  return execution.reactionResults;
}
export function extractWarnings(execution: ReturnType<typeof executeSpaceGassReadOnlyConnector>) {
  return execution.warnings;
}
export function produceNeutralAdapterInput(execution: ReturnType<typeof executeSpaceGassReadOnlyConnector>) {
  return execution.request;
}
