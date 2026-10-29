import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import type { AnalysisInputManifestV1 } from "./types";
import { ANALYSIS_MANIFEST_SCHEMA_VERSION } from "./types";

/** Execution-critical context only. Display metadata is excluded. */
export type AnalysisFingerprintInput = {
  discipline: string;
  capability: string;
  baselineId: string | null;
  requirementIds: string[];
  assumptionIds: string[];
  standardCodes: string[];
  interfaceIds: string[];
  toolProfileId: string | null;
  toolVersion: string | null;
  adapterId: string | null;
  adapterVersion: string | null;
  executionHostId: string | null;
  inputArtifactHashes: string[];
  unitContext: string | null;
  requestedOutputs: string[];
  upstreamResultIds: string[];
};

function sorted(values: string[]): string[] {
  return [...values].map(String).sort((a, b) => a.localeCompare(b));
}

export function canonicalizeAnalysisFingerprintInput(input: AnalysisFingerprintInput): AnalysisFingerprintInput {
  return {
    discipline: input.discipline,
    capability: input.capability,
    baselineId: input.baselineId,
    requirementIds: sorted(input.requirementIds),
    assumptionIds: sorted(input.assumptionIds),
    standardCodes: sorted(input.standardCodes),
    interfaceIds: sorted(input.interfaceIds),
    toolProfileId: input.toolProfileId,
    toolVersion: input.toolVersion,
    adapterId: input.adapterId,
    adapterVersion: input.adapterVersion,
    executionHostId: input.executionHostId,
    inputArtifactHashes: sorted(input.inputArtifactHashes),
    unitContext: input.unitContext,
    requestedOutputs: sorted(input.requestedOutputs),
    upstreamResultIds: sorted(input.upstreamResultIds),
  };
}

export function fingerprintAnalysisInput(input: AnalysisFingerprintInput): string {
  return fingerprintCanonical(canonicalizeAnalysisFingerprintInput(input));
}

export function fingerprintAnalysisManifest(manifest: AnalysisInputManifestV1): string {
  return fingerprintAnalysisInput({
    discipline: manifest.request.discipline,
    capability: manifest.request.capability,
    baselineId: manifest.baseline.id,
    requirementIds: manifest.requirements.ids,
    assumptionIds: manifest.assumptions.ids,
    standardCodes: manifest.standards.codes,
    interfaceIds: manifest.interfaces.ids,
    toolProfileId: manifest.tool.profile_id,
    toolVersion: manifest.tool.version,
    adapterId: manifest.adapter.id,
    adapterVersion: manifest.adapter.version,
    executionHostId: manifest.execution_environment.host_id,
    inputArtifactHashes: manifest.inputs.hashes,
    unitContext: manifest.units.system ?? manifest.execution_environment.unit_context,
    requestedOutputs: manifest.requested_outputs,
    upstreamResultIds: manifest.upstream_dependencies.map((d) => d.result_id ?? d.request_id),
  });
}

export function assertManifestSchema(manifest: AnalysisInputManifestV1): void {
  if (manifest.schema_version !== ANALYSIS_MANIFEST_SCHEMA_VERSION) {
    throw new Error("unsupported_analysis_manifest_schema");
  }
  const serialized = JSON.stringify(manifest);
  if (/password|api[_-]?key|secret|token|totp/i.test(serialized)) {
    throw new Error("analysis_manifest_must_not_embed_secrets");
  }
}
