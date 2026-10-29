import type { AnalysisDependencySemantic, AnalysisInputManifestV1, EngineeringAnalysisRequest } from "./types";
import { ANALYSIS_MANIFEST_SCHEMA_VERSION } from "./types";
import { assertManifestSchema } from "./fingerprint";

export type ManifestBuildInput = {
  request: EngineeringAnalysisRequest;
  baselineFrozen: boolean;
  interfaceIds: string[];
  toolCode: string | null;
  toolVersion: string | null;
  toolCapability: string | null;
  adapterId: string | null;
  adapterVersion: string | null;
  executionHostId: string | null;
  unitContext: string | null;
  inputArtifactRefs: string[];
  inputHashes: string[];
  upstream: Array<{ requestId: string; resultId: string | null; semantic: AnalysisDependencySemantic }>;
};

export function buildAnalysisInputManifest(input: ManifestBuildInput): AnalysisInputManifestV1 {
  const manifest: AnalysisInputManifestV1 = {
    schema_version: ANALYSIS_MANIFEST_SCHEMA_VERSION,
    request: {
      id: input.request.id,
      tenant_id: input.request.tenantId,
      workspace_id: input.request.workspaceId,
      project_id: input.request.projectId,
      discipline: input.request.discipline,
      capability: input.request.capability,
    },
    context: {
      system_id: input.request.systemId,
      asset_id: input.request.assetId,
      interface_id: input.request.interfaceId,
    },
    baseline: { id: input.request.configurationBaselineId, frozen: input.baselineFrozen },
    requirements: { ids: [...input.request.requirementIds].sort() },
    assumptions: { ids: [...input.request.assumptionIds].sort() },
    interfaces: { ids: [...input.interfaceIds].sort() },
    standards: { codes: [...input.request.applicableStandardCodes].sort() },
    tool: {
      profile_id: input.request.requestedExternalToolProfileId,
      tool_code: input.toolCode,
      version: input.toolVersion,
      capability: input.toolCapability,
    },
    adapter: { id: input.adapterId, version: input.adapterVersion },
    execution_environment: { host_id: input.executionHostId, unit_context: input.unitContext },
    inputs: { artifact_refs: input.inputArtifactRefs, hashes: input.inputHashes },
    units: { system: input.unitContext },
    requested_outputs: [...input.request.requestedOutputs].sort(),
    upstream_dependencies: input.upstream.map((u) => ({
      request_id: u.requestId,
      result_id: u.resultId,
      semantic: u.semantic,
    })),
    provenance: {
      requested_by: input.request.requestedBy,
      requested_at: input.request.requestedAt,
      actor_kind: input.request.actorKind,
    },
  };
  assertManifestSchema(manifest);
  return manifest;
}
