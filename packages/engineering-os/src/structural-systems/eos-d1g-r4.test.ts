import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { D1gR1GovernedContext, D1gR1ObjectMapping } from "@rtb/types";
import {
  C10_VALIDATION_LANE_STATUS,
  D1F_R3_STEEL_SYSTEM_DISPATCH_SCOPE,
  D1G_R2_DEFAULT_RESOURCE_LIMITS,
  D1G_R4_CANONICAL_BASE_URL,
  D1G_R4_COMPLETED_EQUALS_CONVERGED,
  D1G_R4_FEATURE_FLAG_DEFAULT,
  D1G_R4_LIVE_TEST_DEFAULT_ENABLED,
  D1G_R4_LOCAL_Y_EQUALS_DESIGN_MAJOR_ASSUMED,
  D1G_R4_MATURITY_STATE,
  D1G_R4_MEMBER_END_FORCE_ENDPOINT_IMPLEMENTED,
  D1G_R4_NATIVE_RESPONSE_SIZE_LIMIT_BYTES,
  D1G_R4_NEW_ENGINEERING_FORMULA_COUNT,
  D1G_R4_REQUEST_CONCURRENCY_LIMIT,
  D1G_R4_STATION_ZERO_AUTO_CLASSIFIED_AS_MEMBER_END,
  D1G_R4_STRUCTURAL_SOLVER_EXECUTION_COUNT,
} from "@rtb/types";
import {
  assessSpaceGassBundleCompleteness,
  executeSpaceGassReadOnlyConnector,
  ingestSpaceGassChunk,
  recordSpaceGassSuccessor,
  spaceGassBundleFingerprint,
  spaceGassReadOnlyConnectorEnabled,
  type SpaceGassSnapshot,
} from "./space-gass-connector";
import { SPACE_GASS_MAPPING_MANIFEST, SPACE_GASS_SIGN_STATEMENTS } from "./space-gass-mapping";
import { D1G_R4_ENDPOINT_ALLOWLIST, readSpaceGassEndpoint, spaceGassTransportInFlight, validateSpaceGassBaseUrl } from "./space-gass-transport";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import { d1gR3SelectionFingerprint } from "./provider-selection";

const HERE = dirname(fileURLToPath(import.meta.url));

function json(value: unknown): string {
  return JSON.stringify(value);
}

function snapshot(version: string, options?: { status?: string; runId?: number | null; stations?: number[]; omitUnits?: boolean; omitMoment?: boolean; reactionMoments?: boolean; unanalysed?: number[]; direction?: number }): SpaceGassSnapshot {
  const stations = options?.stations ?? [0, 6];
  const forces = (member: number, caseId: number) => ({
    Case: caseId,
    Member: member,
    Station: stations.map((_value, index) => index),
    Location: stations,
    Fx: stations.map(() => 12.5),
    Fy: stations.map(() => -3),
    Fz: stations.map(() => 0),
    Mx: stations.map(() => 2),
    My: stations.map(() => 4),
    Mz: stations.map(() => 1),
  });
  const units = options?.omitUnits ? {} : options?.omitMoment ? { Force: "kN", Length: "m" } : { Force: "kN", Length: "m", Moment: "kN.m" };
  const reaction: Record<string, unknown> = { Node: 1, LoadCase: 1, Fx: 1.5, Fy: 8.25, Fz: 0 };
  if (options?.reactionMoments) reaction.Mx = 9;
  return {
    productVersion: version,
    capturedAt: "2026-10-17T00:00:00.000Z",
    inertDisplayName: "beam-a",
    responses: [
      { endpointId: "JOB_UNITS", query: {}, rawText: json(units) },
      { endpointId: "NODES", query: {}, rawText: json([{ Id: 1, X: 0, Y: 0, Z: 0, NodeType: "Restrained" }, { Id: 2, X: 6, Y: 0, Z: 0 }, { Id: 3, X: 0, Y: 0, Z: 0 }, { Id: 4, X: 0, Y: 4, Z: 0, NodeType: "Restrained" }]) },
      { endpointId: "MEMBERS", query: {}, rawText: json([{ Id: 1, NodeA: 1, NodeB: 2, DirectionAngle: options?.direction ?? 15 }, { Id: 2, NodeA: 3, NodeB: 4 }]) },
      { endpointId: "NODE_RESTRAINTS", query: { NodeType: "Restrained" }, rawText: json([{ Node: 1, RestraintCode: "FFFFFF" }, { Node: 4, RestraintCode: "FFFRRR" }]) },
      { endpointId: "LOAD_CASES", query: {}, rawText: json([{ Id: 1, Title: "Dead load" }, { Id: 2, Title: "Live load" }]) },
      { endpointId: "COMBINATION_LOAD_CASES", query: {}, rawText: json([{ Id: 10, Title: "Strength", Items: [{ Case: 1, Factor: 1.2 }, { Case: 2, Factor: 1.5 }] }]) },
      { endpointId: "MEMBER_INTERMEDIATE_FORCES", query: { LoadCases: "1,2", Members: "1,2" }, rawText: json({ Results: [forces(1, 1), forces(1, 2), forces(2, 1), forces(2, 2)], Warnings: { LoadCasesNotAnalyzed: options?.unanalysed ?? [3] } }) },
      { endpointId: "NODE_REACTIONS", query: { Nodes: "1", LoadCases: "1" }, rawText: json({ Results: [reaction], Warnings: { LoadCasesNotAnalyzed: options?.unanalysed ?? [] } }) },
      { endpointId: "RUN_STATUS", query: {}, rawText: json(options?.runId === null ? { Status: options?.status ?? "Completed" } : { RunId: options?.runId ?? 7, Status: options?.status ?? "Completed" }) },
    ],
  };
}

function governed(): D1gR1GovernedContext {
  return {
    projectId: "project-1", tenantId: "tenant-1", workspaceId: "workspace-1", structuralSystemId: "ss-1", analysisModelId: "model-1",
    analysisModelVersion: "1", sourceTopologyFingerprint: "topo-1", currentTopologyFingerprint: "topo-1", modelStatus: "GOVERNED",
    modelValidationEvidenceRef: "validation-1", normalizationRuleVersion: "norm-1", currentNormalizationRuleVersion: "norm-1",
    canonicalCoordinateSystemRef: "SG-MEMBER-LOCAL-V1", signConventionRef: "eos-sign", explicitResultAuthority: "VERIFIED_GOVERNED",
    axisMapAuthority: "EXPLICIT_GOVERNED", currentMappingFingerprint: null,
  };
}

function objects(): D1gR1ObjectMapping {
  return {
    mappingId: "obj-sg-1", mappingVersion: "1", authority: "EXPLICIT_GOVERNED", projectId: "project-1", tenantId: "tenant-1", workspaceId: "workspace-1",
    structuralSystemId: "ss-1", analysisModelId: "model-1", providerModelId: "beam-a",
    entries: [
      { providerObjectId: "m:1", providerModelId: "beam-a", kind: "ELEMENT", analyticalElementId: "ae-1", nodeId: null, supportId: null, physicalMemberId: "member-1", designMemberId: "design-1", elementDirection: "ALIGNED" },
      { providerObjectId: "m:2", providerModelId: "beam-a", kind: "ELEMENT", analyticalElementId: "ae-2", nodeId: null, supportId: null, physicalMemberId: "member-2", designMemberId: "design-2", elementDirection: "ALIGNED" },
      { providerObjectId: "s:1", providerModelId: "beam-a", kind: "SUPPORT", analyticalElementId: null, nodeId: "n:1", supportId: "support-1", physicalMemberId: null, designMemberId: null, elementDirection: "ALIGNED" },
    ],
  };
}

function run(version = "15.0.2", options?: Parameters<typeof snapshot>[1]) {
  return executeSpaceGassReadOnlyConnector({ snapshot: snapshot(version, options), governed: governed(), objectMapping: objects(), caseMap: { "1": "LC-1", "2": "LC-2" }, combinationMap: { "10": "COM-10" } });
}

describe("EOS-D1G-R4 SPACE GASS read-only connector", () => {
  it("maps a synthetic snapshot into neutral records without solver execution", () => {
    const execution = run();
    expect(execution.productVersion).toBe("15.0.2");
    expect(validateSpaceGassProviderVersionSafe(run("15.1.0").productVersion)).toBe(true);
    expect(run("14.5").findings.some((row) => row.code === "UNSUPPORTED_PROVIDER_VERSION")).toBe(true);
    expect(run("16.0.0").findings.some((row) => row.code === "UNSUPPORTED_PROVIDER_VERSION")).toBe(true);
    expect(run("").findings.some((row) => row.code === "UNRESOLVED_PROVIDER_VERSION")).toBe(true);
    expect(execution.cases.map((row) => row.providerCaseId)).toEqual(["1", "2"]);
    expect(execution.cases.every((row) => row.title !== "LC-1" && row.title !== row.providerCaseId)).toBe(true);
    expect(execution.combinations[0]?.providerCombinationId).toBe("10");
    expect(execution.combinations[0]?.factors).toHaveLength(2);
    expect(execution.request.source.combinations).toEqual([]);
    expect(execution.members.find((row) => row.id === "m:1")?.nodeA).toBe(1);
    expect(execution.members.find((row) => row.id === "m:1")?.nodeB).toBe(2);
    expect(execution.members.find((row) => row.id === "m:1")?.orientation).toContain("LOCAL_Y_TOWARD_GLOBAL_Y");
    expect(execution.members.find((row) => row.id === "m:1")?.orientation).toContain("ROLL:15");
    expect(execution.members.find((row) => row.id === "m:2")?.orientation).toContain("VERTICAL_LOCAL_Z_FOLLOWS_GLOBAL_Z");
    expect(execution.supports.map((row) => row.id)).toContain("s:1");
    expect(execution.stationResults.some((row) => row.location === "STATION" && row.stationValue === 0)).toBe(true);
    expect(execution.stationResults.some((row) => row.location === "MEMBER_START" || row.location === "MEMBER_END")).toBe(false);
    expect(execution.stationResults.find((row) => row.providerQuantityName === "Fx")?.value).toBe(12.5);
    expect(execution.stationResults.find((row) => row.providerQuantityName === "Fz")?.explicitZero).toBe(true);
    expect(execution.reactionResults.map((row) => row.providerQuantityName).sort()).toEqual(["RFX", "RFY", "RFZ"]);
    expect(execution.warnings.some((row) => row.code === "LOAD_CASES_NOT_ANALYZED")).toBe(true);
    expect(execution.stationResults.some((row) => row.providerCaseId === "3")).toBe(false);
    expect(execution.mappedRunState).toBe("COMPLETED");
    expect(execution.mappedConvergenceState).not.toBe("CONVERGED");
    expect(D1G_R4_COMPLETED_EQUALS_CONVERGED).toBe(false);
    expect(run("15.0.2", { status: "Failed" }).mappedRunState).toBe("FAILED");
    expect(run("15.0.2", { status: "Cancelled" }).mappedRunState).toBe("INVALID");
    expect(run("15.0.2", { omitUnits: true }).findings.some((row) => row.code === "UNIT_MAPPING_FAILED")).toBe(true);
    expect(run("15.0.2", { reactionMoments: true }).reactionResults.some((row) => row.providerQuantityName === "Mx")).toBe(false);
    const unmapped = executeSpaceGassReadOnlyConnector({ snapshot: snapshot("15.0.2"), governed: governed(), objectMapping: { ...objects(), entries: [] }, caseMap: { "1": "LC-1", "2": "LC-2" }, combinationMap: {} });
    expect(unmapped.findings.some((row) => row.code === "OBJECT_MAPPING_FAILED")).toBe(true);
    expect(unmapped.stationResults).toEqual([]);
    const ingested = ingestSpaceGassChunk(execution.bundle.packages.find((row) => row.chunkId.startsWith("station"))!.bytesText, { snapshot: snapshot("15.0.2"), governed: governed(), objectMapping: objects(), caseMap: { "1": "LC-1", "2": "LC-2" }, combinationMap: { "10": "COM-10" } });
    expect(ingested.schemaValid).toBe(true);
    expect(ingested.status === "PARTIAL" || ingested.status === "INGESTED" || ingested.status === "STALE").toBe(true);
    expect(execution.request.mappingManifest.cases["1"]).toBe("LC-1");
    expect(execution.request.mappingManifest.cases["1"]).not.toBe("Dead load");
    const axial = ingested.adapterExecution?.handoffs.flatMap((row) => row.binding.canonicalActions).find((row) => row.quantity === "N" && row.locationKind === "STATION");
    expect(axial?.value).toBe(12500);
    expect(axial?.unit).toBe("N");
    expect(axial?.locationKind).toBe("STATION");
    expect(ingested.adapterExecution?.handoffs.every((row) => row.binding.steelDemand == null)).toBe(true);
    expect(ingested.adapterExecution?.handoffs.flatMap((row) => row.binding.canonicalActions).some((row) => row.quantity === "V_MAJOR" || row.quantity === "M_MAJOR")).toBe(false);
    expect(ingested.canGovern).toBe(false);
    expect(SPACE_GASS_MAPPING_MANIFEST.signs.Fx).toBe(1);
    expect(SPACE_GASS_SIGN_STATEMENTS.axial).toContain("COMPRESSION");
    expect(D1G_R4_LOCAL_Y_EQUALS_DESIGN_MAJOR_ASSUMED).toBe(false);
    expect(D1G_R4_MEMBER_END_FORCE_ENDPOINT_IMPLEMENTED).toBe(false);
    expect(D1G_R4_STATION_ZERO_AUTO_CLASSIFIED_AS_MEMBER_END).toBe(false);
    expect(execution.snapshotMutated).toBe(false);
    expect(executeSpaceGassReadOnlyConnector(inputOf(execution)).nativeFingerprint).toBe(execution.nativeFingerprint);
    const priorText = snapshot("15.0.2").responses[0]?.rawText;
    const successor = recordSpaceGassSuccessor(execution, { snapshot: snapshot("15.0.2"), governed: governed(), objectMapping: objects(), caseMap: { "1": "LC-1", "2": "LC-2" }, combinationMap: { "10": "COM-10" } });
    expect(successor.prior.nativeFingerprint).toBe(execution.nativeFingerprint);
    expect(priorText).toBe(snapshot("15.0.2").responses[0]?.rawText);
    const stale = ingestSpaceGassChunk(execution.bundle.packages.find((row) => row.chunkId.startsWith("station"))!.bytesText, { snapshot: snapshot("15.0.2"), governed: { ...governed(), currentTopologyFingerprint: "topo-2" }, objectMapping: objects(), caseMap: { "1": "LC-1", "2": "LC-2" }, combinationMap: {} });
    expect(stale.adapterExecution?.handoffs.some((row) => row.binding.findings.some((finding) => finding.code === "STALE_UPSTREAM"))).toBe(true);
    expect(execution.log).not.toHaveProperty("rawText");
    expect(C10_VALIDATION_LANE_STATUS).toBe("PENDING_QUALIFIED_HUMAN_REVIEW");
    expect(D1F_R3_STEEL_SYSTEM_DISPATCH_SCOPE).toBe("D1D_EU_TENSION only");
    expect(D1G_R4_STRUCTURAL_SOLVER_EXECUTION_COUNT).toBe(0);
    expect(D1G_R4_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1G_R4_FEATURE_FLAG_DEFAULT).toBe(false);
    expect(D1G_R4_LIVE_TEST_DEFAULT_ENABLED).toBe(false);
    expect(spaceGassReadOnlyConnectorEnabled()).toBe(false);
    expect(D1G_R4_MATURITY_STATE).toBe("SPACE_GASS_READ_ONLY_CONNECTOR_IMPLEMENTED_OFFLINE_CONFORMANCE_VALIDATED");
    expect(d1gR3SelectionFingerprint()).toHaveLength(64);
    expect(execution.mappingFingerprint).toHaveLength(64);
  });

  it("splits results above the R2 package limit into deterministic chunks", () => {
    const execution = run("15.0.2", { stations: [0, 3, 6] });
    const stationChunks = execution.bundle.chunks.filter((row) => row.chunkType === "MEMBER_STATION_FORCES");
    expect(stationChunks.length).toBeGreaterThan(1);
    expect(stationChunks.every((row) => row.resultCount <= D1G_R2_DEFAULT_RESOURCE_LIMITS.maxResultCount && row.objectCount <= D1G_R2_DEFAULT_RESOURCE_LIMITS.maxObjectCount)).toBe(true);
    expect(execution.bundle.packages.every((row) => Buffer.byteLength(row.bytesText) <= D1G_R2_DEFAULT_RESOURCE_LIMITS.maxFileBytes)).toBe(true);
    expect(run("15.0.2", { stations: [0, 3, 6] }).bundle.fingerprint).toBe(execution.bundle.fingerprint);
    const reversed = spaceGassBundleFingerprint({
      providerVersion: execution.productVersion,
      connectorVersion: execution.connectorVersion,
      mappingManifestFingerprint: execution.mappingFingerprint,
      nativeSourceFingerprint: execution.nativeFingerprint,
      chunks: [...execution.bundle.chunks].reverse().map((row) => ({ chunkId: row.chunkId, packageFingerprint: row.packageFingerprint })),
      objectMappingId: "obj-sg-1",
      projectId: "project-1",
    });
    expect(reversed).toBe(execution.bundle.fingerprint);
    expect(assessSpaceGassBundleCompleteness(execution.bundle.chunks.map((row) => row.chunkId), execution.bundle.chunks.slice(1).map((row) => row.chunkId))).toBe("INCOMPLETE");
  });

  it("rejects non-local hosts, redirects, arbitrary paths, and unbounded reads", async () => {
    expect(validateSpaceGassBaseUrl(D1G_R4_CANONICAL_BASE_URL).ok).toBe(true);
    expect(validateSpaceGassBaseUrl("http://localhost:34560/api/v1").ok).toBe(true);
    for (const url of ["http://example.com/api/v1", "http://192.168.1.10:34560/api/v1", "http://8.8.8.8:34560/api/v1", "http://user:pass@127.0.0.1:34560/api/v1", "http://127.0.0.1:34560/api/v1#x", "https://127.0.0.1:34560/api/v1", "http://127.0.0.1:80/api/v1"]) {
      expect(validateSpaceGassBaseUrl(url).ok, url).toBe(false);
    }
    const calls: string[] = [];
    const fetchImpl = async (url: string, init: { method: string; signal: AbortSignal }) => {
      calls.push(`${init.method} ${url}`);
      expect(spaceGassTransportInFlight()).toBeLessThanOrEqual(D1G_R4_REQUEST_CONCURRENCY_LIMIT);
      if (url.includes("redirect")) return { status: 302, headers: { get: () => "http://example.com" }, body: new Uint8Array() };
      if (url.includes("huge")) return { status: 200, headers: { get: (name: string) => name === "content-length" ? String(D1G_R4_NATIVE_RESPONSE_SIZE_LIMIT_BYTES + 1) : null }, body: new Uint8Array() };
      if (init.signal.aborted) throw new Error("aborted");
      return { status: 200, headers: { get: () => null }, body: new TextEncoder().encode("{}") };
    };
    const disabled = await readSpaceGassEndpoint({ liveEnabled: false, fetchImpl }, "JOB_UNITS");
    expect("code" in disabled && disabled.code).toBe("PROVIDER_UNAVAILABLE");
    expect(calls).toEqual([]);
    const ok = await readSpaceGassEndpoint({ liveEnabled: true, fetchImpl }, "JOB_UNITS", { LoadCases: "1,2" });
    expect(ok).toMatchObject({ ok: true });
    expect(calls[0]).toContain("GET ");
    expect(calls[0]).not.toContain("POST");
    const remote = await readSpaceGassEndpoint({ liveEnabled: true, fetchImpl, baseUrl: "http://example.com/api/v1" }, "JOB_UNITS");
    expect("code" in remote && remote.code).toBe("SOURCE_INVALID");
    const arbitrary = await readSpaceGassEndpoint({ liveEnabled: true, fetchImpl }, "JOB_UNITS", { FilePath: "C:/secret.sg" });
    expect("code" in arbitrary && arbitrary.code).toBe("SOURCE_INVALID");
    const redirected = await readSpaceGassEndpoint({ liveEnabled: true, baseUrl: "http://127.0.0.1:34560/api/v1", fetchImpl: async (url) => ({ status: url.includes("job/units") ? 302 : 200, headers: { get: () => "http://example.com" }, body: new Uint8Array() }) }, "JOB_UNITS");
    expect(redirected).toMatchObject({ code: "SOURCE_INVALID" });
    const huge = await readSpaceGassEndpoint({ liveEnabled: true, fetchImpl: async () => ({ status: 200, headers: { get: () => String(D1G_R4_NATIVE_RESPONSE_SIZE_LIMIT_BYTES + 1) }, body: new Uint8Array(8) }) }, "NODE_REACTIONS");
    expect(huge).toMatchObject({ code: "SOURCE_TOO_LARGE" });
    let attempts = 0;
    const retried = await readSpaceGassEndpoint({ liveEnabled: true, fetchImpl: async () => { attempts += 1; return attempts < 2 ? { status: 503, headers: { get: () => null }, body: null } : { status: 200, headers: { get: () => null }, body: new Uint8Array([123, 125]) }; } }, "LOAD_CASES");
    expect(retried).toMatchObject({ ok: true });
    expect(attempts).toBe(2);
    let denied = 0;
    await readSpaceGassEndpoint({ liveEnabled: true, fetchImpl: async () => { denied += 1; return { status: 404, headers: { get: () => null }, body: null }; } }, "MEMBERS");
    expect(denied).toBe(1);
    const hanging = readSpaceGassEndpoint({ liveEnabled: true, timeoutMs: 20, fetchImpl: (_url, init) => new Promise((_resolve, reject) => { init.signal.addEventListener("abort", () => reject(new Error("aborted"))); }) }, "NODES");
    await expect(hanging).resolves.toMatchObject({ code: "PROVIDER_UNAVAILABLE" });
    expect(D1G_R4_ENDPOINT_ALLOWLIST.JOB_UNITS).toBe("/job/units");
    expect(Object.values(D1G_R4_ENDPOINT_ALLOWLIST).join(" ")).not.toContain("run-linear");
    const transport = readFileSync(join(HERE, "space-gass-transport.ts"), "utf8");
    const connector = readFileSync(join(HERE, "space-gass-connector.ts"), "utf8");
    expect(transport.includes("child_process") || connector.includes("child_process")).toBe(false);
    expect(connector.includes("spawn(")).toBe(false);
    expect(scanAnalysisFormulaBypass("space-gass-connector.ts", connector)).toEqual([]);
    expect(scanAnalysisFormulaBypass("space-gass-transport.ts", transport)).toEqual([]);
  });
});

function validateSpaceGassProviderVersionSafe(version: string): boolean {
  return version === "15.0.2" || version === "15.1.0";
}

function inputOf(_execution: ReturnType<typeof executeSpaceGassReadOnlyConnector>) {
  return { snapshot: snapshot("15.0.2"), governed: governed(), objectMapping: objects(), caseMap: { "1": "LC-1", "2": "LC-2" }, combinationMap: { "10": "COM-10" } };
}
