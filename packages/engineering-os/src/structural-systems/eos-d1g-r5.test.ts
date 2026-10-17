import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { D1gR1GovernedContext, D1gR1ObjectMapping } from "@rtb/types";
import {
  D1F_R3_STEEL_SYSTEM_DISPATCH_SCOPE,
  D1G_R2_DEFAULT_RESOURCE_LIMITS,
  D1G_R4_FEATURE_FLAG_DEFAULT,
  D1G_R4_NATIVE_RESPONSE_SIZE_LIMIT_BYTES,
  D1G_R5_API_GENERATION,
  D1G_R5_DESIGN_AXIS_BINDING_STATUS,
  D1G_R5_DESKTOP_VERSION_COMPATIBILITY,
  D1G_R5_FINAL_MATURITY_STATE,
  D1G_R5_LIVE_TEST_DEFAULT_ENABLED,
  D1G_R5_MEMBER_END_FORCE_ENDPOINT_IMPLEMENTED,
  D1G_R5_NATIVE_PAGE_LIMIT,
  D1G_R5_REACTION_MOMENT_IMPORT_IMPLEMENTED,
  D1G_R5_SCALE_CLASSIFICATION,
  D1G_ENGINEER_VALIDATED_CONNECTOR_COUNT,
  D1G_LIVE_PROVIDER_VALIDATED_CONNECTOR_COUNT,
  D1G_STRUCTURAL_ANALYSIS_IMPLEMENTED,
} from "@rtb/types";
import {
  assessSpaceGassNativePages,
  executeSpaceGassReadOnlyConnector,
  ingestSpaceGassChunk,
  readSpaceGassBoundedCollection,
  spaceGassBundleFingerprint,
  type SpaceGassSnapshot,
} from "./space-gass-connector";
import { SPACE_GASS_MAPPING_MANIFEST } from "./space-gass-mapping";
import { D1G_R4_ENDPOINT_ALLOWLIST, readSpaceGassEndpoint, validateSpaceGassBaseUrl } from "./space-gass-transport";
import { executeProviderNeutralAdapter } from "./solver-adapter";
import { scanAnalysisFormulaBypass } from "./formula-scan";

const HERE = dirname(fileURLToPath(import.meta.url));

function governed(topology = "topo-1"): D1gR1GovernedContext {
  return {
    projectId: "project-1", tenantId: "tenant-1", workspaceId: "workspace-1", structuralSystemId: "ss-1", analysisModelId: "model-1",
    analysisModelVersion: "1", sourceTopologyFingerprint: "topo-1", currentTopologyFingerprint: topology, modelStatus: "GOVERNED",
    modelValidationEvidenceRef: "validation-1", normalizationRuleVersion: "norm-1", currentNormalizationRuleVersion: "norm-1",
    canonicalCoordinateSystemRef: "SG-MEMBER-LOCAL-V1", signConventionRef: "eos-sign", explicitResultAuthority: "VERIFIED_GOVERNED",
    axisMapAuthority: "EXPLICIT_GOVERNED", currentMappingFingerprint: null,
  };
}

function mapping(ids: number[]): D1gR1ObjectMapping {
  return {
    mappingId: "obj-sg-r5", mappingVersion: "1", authority: "EXPLICIT_GOVERNED", projectId: "project-1", tenantId: "tenant-1", workspaceId: "workspace-1",
    structuralSystemId: "ss-1", analysisModelId: "model-1", providerModelId: "beam-a",
    entries: [
      ...ids.map((id) => ({ providerObjectId: `m:${id}`, providerModelId: "beam-a", kind: "ELEMENT" as const, analyticalElementId: `ae-${id}`, nodeId: null, supportId: null, physicalMemberId: `member-${id}`, designMemberId: `design-${id}`, elementDirection: "ALIGNED" as const })),
      { providerObjectId: "s:1", providerModelId: "beam-a", kind: "SUPPORT" as const, analyticalElementId: null, nodeId: "n:1", supportId: "support-1", physicalMemberId: null, designMemberId: null, elementDirection: "ALIGNED" as const },
    ],
  };
}

function snapshot(version = "15.0.2", patch?: { fx?: number; camel?: boolean; pages?: boolean; missingPage?: boolean; duplicate?: boolean; members?: number; error?: boolean; units?: string }): SpaceGassSnapshot {
  const count = patch?.members ?? 1;
  const memberRows = Array.from({ length: count }, (_value, index) => ({ Id: index + 1, NodeA: 1, NodeB: 2, DirectionAngle: 0 }));
  const force = (member: number) => ({ Case: 1, Member: member, Station: [1], Location: [6], Fx: [patch?.fx ?? 12.5], Mx: [2] });
  const forces = Array.from({ length: count }, (_value, index) => force(index + 1));
  const reaction = { Node: 1, LoadCase: 1, Fx: 1.5, Fy: 0, Fz: 0 };
  const responses: { endpointId: string; query: Record<string, string>; rawText: string }[] = [
    { endpointId: "JOB_UNITS", query: {}, rawText: patch?.units ?? JSON.stringify({ Force: "kN", Length: "m", Moment: "kN.m" }) },
    { endpointId: "NODES", query: {}, rawText: JSON.stringify([{ Id: 1, X: 0, Y: 0, Z: 0, NodeType: "Restrained" }, { Id: 2, X: 6, Y: 0, Z: 0 }]) },
    { endpointId: "MEMBERS", query: {}, rawText: JSON.stringify(memberRows) },
    { endpointId: "NODE_RESTRAINTS", query: {}, rawText: JSON.stringify([{ Node: 1, RestraintCode: "FFFFFF" }]) },
    { endpointId: "LOAD_CASES", query: {}, rawText: JSON.stringify([{ Id: 1, Title: "Dead load" }]) },
    { endpointId: "COMBINATION_LOAD_CASES", query: {}, rawText: JSON.stringify([{ Id: 10, Title: "Strength", Items: [{ Case: 1, Factor: 1.2 }] }]) },
    { endpointId: "RUN_STATUS", query: {}, rawText: JSON.stringify({ RunId: 7, Status: "Completed" }) },
  ];
  if (patch?.camel) {
    responses.push({ endpointId: "MEMBER_INTERMEDIATE_FORCES", query: { loadCases: "1", members: "1" }, rawText: JSON.stringify({ results: [{ loadCase: 1, member: 1, station: [1], location: [6], fx: [12.5], mx: [2] }], warnings: { loadCasesNotAnalyzed: [3] } }) });
    responses.push({ endpointId: "NODE_REACTIONS", query: { nodes: "1", loadCases: "1" }, rawText: JSON.stringify({ results: [{ node: 1, loadCase: 1, fx: 1.5, fy: 0, fz: 0, mx: 4 }], warnings: {} }) });
  } else if (patch?.pages || patch?.missingPage || patch?.duplicate) {
    const second = patch.duplicate ? reaction : { ...reaction, Node: 2 };
    const secondOffset = patch.missingPage ? "2" : "1";
    responses.push({ endpointId: "MEMBER_INTERMEDIATE_FORCES", query: {}, rawText: JSON.stringify({ Results: forces, Warnings: { LoadCasesNotAnalyzed: [] } }) });
    responses.push({ endpointId: "NODE_REACTIONS", query: { nodes: "1", loadCases: "1", offset: "0", limit: "1" }, rawText: JSON.stringify({ Results: [reaction], Warnings: {} }) });
    responses.push({ endpointId: "NODE_REACTIONS", query: { nodes: "1", loadCases: "1", offset: secondOffset, limit: "1" }, rawText: JSON.stringify({ Results: [second], Warnings: {} }) });
  } else if (patch?.error) {
    responses.push({ endpointId: "MEMBER_INTERMEDIATE_FORCES", query: {}, rawText: JSON.stringify({ title: "provider failure" }) });
    responses.push({ endpointId: "NODE_REACTIONS", query: {}, rawText: JSON.stringify({ Results: [reaction], Warnings: {} }) });
  } else {
    responses.push({ endpointId: "MEMBER_INTERMEDIATE_FORCES", query: { loadCases: "1", members: "1" }, rawText: JSON.stringify({ Results: forces, Warnings: { LoadCasesNotAnalyzed: [3] } }) });
    responses.push({ endpointId: "NODE_REACTIONS", query: { nodes: "1", loadCases: "1" }, rawText: JSON.stringify({ Results: [reaction], Warnings: {} }) });
  }
  return { productVersion: version, capturedAt: "2026-10-17T00:00:00.000Z", inertDisplayName: "beam-a", responses };
}

function run(source = snapshot(), topology = "topo-1", ids = [1]) {
  return executeSpaceGassReadOnlyConnector({ snapshot: source, governed: governed(topology), objectMapping: mapping(ids), caseMap: { "1": "LC-1" }, combinationMap: { "10": "COM-10" } });
}

describe("EOS-D1G-R5 SPACE GASS connector hardening", () => {
  it("proves the offline chain without treating the connector as engineering authority", () => {
    const execution = run();
    expect(execution.apiGeneration).toBe(D1G_R5_API_GENERATION);
    expect(execution.desktopCompatibility).toBe(D1G_R5_DESKTOP_VERSION_COMPATIBILITY);
    expect(execution.desktopVersionAcceptedAsCompatible).toBe(false);
    expect(execution.canGovern).toBe(false);
    expect(execution.mappedConvergenceState).not.toBe("CONVERGED");
    expect(execution.stationResults.every((row) => row.location === "STATION")).toBe(true);
    expect(execution.reactionResults.map((row) => row.providerQuantityName).sort()).toEqual(["RFX", "RFY", "RFZ"]);
    expect(execution.request.mappingManifest.cases["1"]).toBe("LC-1");
    expect(execution.request.mappingManifest.cases["1"]).not.toBe("Dead load");
    expect(execution.request.source.combinations).toEqual([]);
    expect(SPACE_GASS_MAPPING_MANIFEST.signs.Fx).toBe(1);
    const adapter = executeProviderNeutralAdapter(execution.request);
    expect(adapter.handoffs.length).toBeGreaterThan(0);
    expect(adapter.handoffs.every((row) => row.binding.canGovern === false)).toBe(true);
    const axial = adapter.handoffs.flatMap((row) => row.binding.canonicalActions).find((row) => row.quantity === "N");
    expect(axial?.value).toBe(12500);
    expect(axial?.unit).toBe("N");
    expect(adapter.handoffs.flatMap((row) => row.binding.canonicalActions).some((row) => row.quantity === "V_MAJOR" || row.quantity === "M_MAJOR")).toBe(false);
    const ingested = ingestSpaceGassChunk(execution.bundle.packages.find((row) => row.chunkId.startsWith("station"))!.bytesText, { snapshot: snapshot(), governed: governed(), objectMapping: mapping([1]), caseMap: { "1": "LC-1" }, combinationMap: {} });
    expect(ingested.schemaValid).toBe(true);
    expect(ingested.canGovern).toBe(false);
    expect(ingested.provenance.map((row) => row.stage)).toContain("RAW_FILE");
    expect(execution.bundle.provenance).toContain("NATIVE_SNAPSHOT");
    expect(execution.bundle.provenance).toContain("MAPPING_MANIFEST_VERSION");
    expect(run().nativeFingerprint).toBe(execution.nativeFingerprint);
    expect(D1G_R5_MEMBER_END_FORCE_ENDPOINT_IMPLEMENTED).toBe(false);
    expect(D1G_R5_REACTION_MOMENT_IMPORT_IMPLEMENTED).toBe(false);
    expect(D1G_R5_DESIGN_AXIS_BINDING_STATUS).toBe("UNRESOLVED_FOR_DESIGN_USE");
    expect(D1G_R4_FEATURE_FLAG_DEFAULT).toBe(false);
    expect(D1G_LIVE_PROVIDER_VALIDATED_CONNECTOR_COUNT).toBe(0);
    expect(D1G_ENGINEER_VALIDATED_CONNECTOR_COUNT).toBe(0);
    expect(D1G_STRUCTURAL_ANALYSIS_IMPLEMENTED).toBe(false);
    expect(D1F_R3_STEEL_SYSTEM_DISPATCH_SCOPE).toBe("D1D_EU_TENSION only");
    expect(D1G_R5_FINAL_MATURITY_STATE).toContain("OFFLINE_CONFORMANCE_VALIDATED");
    expect(D1G_R5_SCALE_CLASSIFICATION).toBe("BOUNDED_FILTERED_PILOT");
    expect(Object.values(D1G_R4_ENDPOINT_ALLOWLIST).join(" ")).not.toContain("member-end-forces");
  });

  it("accepts official camelCase result names and does not import reaction moments", () => {
    const execution = run(snapshot("15.0.2", { camel: true }));
    expect(execution.stationResults.some((row) => row.providerQuantityName === "Fx" && row.value === 12.5)).toBe(true);
    expect(execution.warnings.some((row) => row.code === "LOAD_CASES_NOT_ANALYZED")).toBe(true);
    expect(execution.reactionResults.some((row) => row.providerQuantityName === "Mx" || row.providerQuantityName === "RMX")).toBe(false);
    expect(execution.findings.some((row) => row.code === "UNSUPPORTED_RESULT_TYPE")).toBe(true);
    expect(execution.findings.every((row) => row.layer === "PROVIDER" || row.layer === "CONNECTOR" || row.layer === "MAPPING" || row.layer === "R1" || row.layer === "R2" || row.layer === "D1F")).toBe(true);
  });

  it("propagates staleness and fingerprint changes without vendor contact", () => {
    const execution = run();
    const changedSource = run(snapshot("15.0.2", { fx: 13 }));
    expect(changedSource.nativeFingerprint).not.toBe(execution.nativeFingerprint);
    expect(run(snapshot("15.1.0")).bundle.fingerprint).not.toBe(execution.bundle.fingerprint);
    const base = { providerVersion: execution.productVersion, connectorVersion: execution.connectorVersion, mappingManifestFingerprint: execution.mappingFingerprint, nativeSourceFingerprint: execution.nativeFingerprint, chunks: execution.bundle.chunks.map((row) => ({ chunkId: row.chunkId, packageFingerprint: row.packageFingerprint })), objectMappingId: "obj-sg-r5", projectId: "project-1" };
    expect(spaceGassBundleFingerprint(base)).toBe(execution.bundle.fingerprint);
    expect(spaceGassBundleFingerprint({ ...base, connectorVersion: "other" })).not.toBe(execution.bundle.fingerprint);
    expect(spaceGassBundleFingerprint({ ...base, mappingManifestFingerprint: "other" })).not.toBe(execution.bundle.fingerprint);
    expect(spaceGassBundleFingerprint({ ...base, objectMappingId: "other" })).not.toBe(execution.bundle.fingerprint);
    expect(spaceGassBundleFingerprint({ ...base, chunks: [...base.chunks].reverse() })).toBe(execution.bundle.fingerprint);
    const remapped = executeSpaceGassReadOnlyConnector({ snapshot: snapshot(), governed: governed(), objectMapping: mapping([1]), caseMap: {}, combinationMap: {} });
    expect(remapped.stationResults).toEqual([]);
    expect(remapped.findings.some((row) => row.code === "CASE_MAPPING_FAILED")).toBe(true);
    const stale = ingestSpaceGassChunk(execution.bundle.packages.find((row) => row.chunkId.startsWith("station"))!.bytesText, { snapshot: snapshot(), governed: governed("topo-2"), objectMapping: mapping([1]), caseMap: { "1": "LC-1" }, combinationMap: {} });
    expect(stale.status).not.toBe("INGESTED");
    expect(stale.adapterExecution?.handoffs.some((row) => row.binding.findings.some((finding) => finding.code === "STALE_UPSTREAM"))).toBe(true);
    const current = ingestSpaceGassChunk(execution.bundle.packages.find((row) => row.chunkId.startsWith("station"))!.bytesText, { snapshot: snapshot(), governed: governed(), objectMapping: mapping([1]), caseMap: { "1": "LC-1" }, combinationMap: {} });
    expect(current.adapterExecution?.handoffs.some((row) => row.binding.findings.some((finding) => finding.code === "STALE_UPSTREAM"))).toBe(false);
  });

  it("bounds native pages separately from EOS package chunks", () => {
    const wide = run(snapshot("15.0.2", { members: 70 }), "topo-1", Array.from({ length: 70 }, (_value, index) => index + 1));
    const stationChunks = wide.bundle.chunks.filter((row) => row.chunkType === "MEMBER_STATION_FORCES");
    expect(stationChunks.length).toBeGreaterThan(1);
    expect(stationChunks.every((row) => row.resultCount <= D1G_R2_DEFAULT_RESOURCE_LIMITS.maxResultCount && row.objectCount <= D1G_R2_DEFAULT_RESOURCE_LIMITS.maxObjectCount)).toBe(true);
    expect(wide.bundle.packages.every((row) => Buffer.byteLength(row.bytesText) <= D1G_R2_DEFAULT_RESOURCE_LIMITS.maxFileBytes)).toBe(true);
    expect(wide.bundle.completeness).toBe("COMPLETE");
    const duplicated = run(snapshot("15.0.2", { duplicate: true }));
    expect(duplicated.nativePageDuplicates.length).toBeGreaterThan(0);
    expect(duplicated.bundle.completeness).toBe("INCOMPLETE");
    expect(assessSpaceGassNativePages(snapshot("15.0.2", { missingPage: true }).responses).complete).toBe(false);
    expect(run(snapshot("15.0.2", { missingPage: true })).bundle.completeness).toBe("INCOMPLETE");
    expect(D1G_R4_NATIVE_RESPONSE_SIZE_LIMIT_BYTES).toBe(262144);
  });

  it("keeps live reads local, paged, read-only, and fail-closed", async () => {
    for (const url of ["http://2130706433:34560/api/v1", "http://0x7f000001:34560/api/v1", "http://127.0.0.1.nip.io:34560/api/v1", "http://[::ffff:127.0.0.1]:34560/api/v1", "http://user:pass@127.0.0.1:34560/api/v1", "http://192.168.0.8:34560/api/v1"]) {
      expect(validateSpaceGassBaseUrl(url).ok, url).toBe(false);
    }
    expect(validateSpaceGassBaseUrl("http://127.0.0.1:34560/api/v1").ok).toBe(true);
    expect(validateSpaceGassBaseUrl("http://localhost:34560/api/v1").ok).toBe(true);
    expect(validateSpaceGassBaseUrl("http://[::1]:34560/api/v1").ok).toBe(true);
    const blocked = await readSpaceGassEndpoint({ liveEnabled: true, featureEnabled: false, fetchImpl: async () => { throw new Error("should not be called"); } }, "JOB_UNITS");
    expect(blocked).toMatchObject({ code: "PROVIDER_UNAVAILABLE" });
    const refused = await readSpaceGassEndpoint({ liveEnabled: true, featureEnabled: true, fetchImpl: async () => { throw new Error("refused"); } }, "JOB_UNITS");
    expect(refused).toMatchObject({ code: "PROVIDER_UNAVAILABLE" });
    const html = await readSpaceGassEndpoint({ liveEnabled: true, featureEnabled: true, fetchImpl: async () => ({ status: 200, headers: { get: (name: string) => name === "content-type" ? "text/html" : null }, body: new Uint8Array([60]) }) }, "JOB_UNITS");
    expect(html).toMatchObject({ code: "SOURCE_INVALID" });
    let failures = 0;
    const persistent = await readSpaceGassEndpoint({ liveEnabled: true, featureEnabled: true, fetchImpl: async () => { failures += 1; return { status: 503, headers: { get: () => null }, body: null }; } }, "NODES");
    expect(persistent).toMatchObject({ code: "PROVIDER_UNAVAILABLE" });
    expect(failures).toBe(3);
    const queries: string[] = [];
    const paged = await readSpaceGassBoundedCollection({
      liveEnabled: true,
      featureEnabled: true,
      fetchImpl: async (url) => {
        queries.push(url);
        expect(url.startsWith("http://127.0.0.1:34560/api/v1/job/structure/nodes")).toBe(true);
        expect(url).not.toContain("page=");
        expect(url).not.toContain("cursor=");
        const offset = Number(new URL(url).searchParams.get("offset"));
        const rows = offset === 0 ? Array.from({ length: D1G_R5_NATIVE_PAGE_LIMIT }, (_value, index) => ({ id: index + 1 })) : [{ id: 99 }];
        return { status: 200, headers: { get: () => "application/json" }, body: new TextEncoder().encode(JSON.stringify(rows)) };
      },
    }, "NODES", { nodes: "1-99" });
    expect(paged.complete).toBe(true);
    expect(paged.pages).toBe(2);
    expect(queries.every((url) => url.includes("limit=") && url.includes("offset="))).toBe(true);
    expect(run(snapshot("15.0.2", { units: "{" })).findings.some((row) => row.code === "SOURCE_INVALID")).toBe(true);
    expect(run(snapshot("15.0.2", { error: true })).findings.some((row) => row.code === "OTHER_PROVIDER_ERROR" && row.layer === "PROVIDER")).toBe(true);
    const connector = readFileSync(join(HERE, "space-gass-connector.ts"), "utf8");
    const transport = readFileSync(join(HERE, "space-gass-transport.ts"), "utf8");
    const browser = readFileSync(join(HERE, "../browser.ts"), "utf8");
    expect(browser.includes("space-gass")).toBe(false);
    expect(connector.includes("child_process") || transport.includes("child_process") || connector.includes("spawn(")).toBe(false);
    expect(transport.includes("method: \"GET\"")).toBe(true);
    expect(transport.includes("POST")).toBe(false);
    expect(scanAnalysisFormulaBypass("space-gass-connector.ts", connector)).toEqual([]);
    expect(D1G_R5_LIVE_TEST_DEFAULT_ENABLED).toBe(false);
  });
});
