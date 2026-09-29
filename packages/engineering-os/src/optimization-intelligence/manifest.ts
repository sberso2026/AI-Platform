import { fingerprintCanonical, type FingerprintItem } from "./fingerprint";
import {
  assumptionContextProjection,
  interfaceContextProjection,
  requirementContextProjection,
  systemContextProjection,
} from "./context-hash";

export const MANIFEST_SCHEMA_VERSION = 1;

export const CERTIFICATION_STUB_ADAPTER_ID = "optimization.generic.test";
export const CERTIFICATION_STUB_ADAPTER_VERSION = "a5c-1.0.0";

export type RunInputManifestV1 = {
  manifest_schema_version: 1;
  study: {
    study_id: string;
    lifecycle_stage: string | null;
  };
  configuration: {
    baseline_id: string;
    baseline_fingerprint: string;
    pinned_configuration_items: FingerprintItem[];
  };
  system_scope: ReturnType<typeof systemContextProjection>[];
  decision_context: { decision_id: string | null };
  requirements: ReturnType<typeof requirementContextProjection>[];
  assumptions: ReturnType<typeof assumptionContextProjection>[];
  interfaces: ReturnType<typeof interfaceContextProjection>[];
  objectives: Array<{
    objective_id: string;
    code: string;
    metric_key: string;
    direction: string;
    target_value: number | null;
    unit: string | null;
  }>;
  constraints: Array<{
    constraint_id: string;
    code: string;
    metric_key: string;
    operator: string | null;
    threshold_value: number | null;
    unit: string | null;
    hardness: string;
    source_object_type: string | null;
    source_object_id: string | null;
  }>;
  design_variables: Array<{
    variable_id: string;
    code: string;
    variable_type: string;
    unit: string | null;
    lower_bound: number | null;
    upper_bound: number | null;
    allowed_values: unknown[] | null;
  }>;
  scenario: {
    scenario_id: string | null;
    scenario_code: string | null;
    name: string | null;
    description: string | null;
  };
  alternative: {
    alternative_id: string;
    alternative_code: string | null;
    name: string | null;
    values: Array<{
      variable_id: string;
      numeric_value: number | null;
      text_value: string | null;
    }>;
  };
  execution: {
    adapter_id: string;
    adapter_version: string | null;
    tool_id: string | null;
    tool_version: string | null;
    algorithm_id: string | null;
    algorithm_version: string | null;
    random_seed: string | null;
    model_artifact_refs: string[];
    artifact_hashes: string[];
  };
};

export type ManifestBuildInput = {
  studyId: string;
  lifecycleStage: string | null;
  baselineId: string;
  baselineFingerprint: string;
  pinnedItems: FingerprintItem[];
  systems: Array<Record<string, unknown>>;
  decisionId: string | null;
  requirements: Array<Record<string, unknown>>;
  assumptions: Array<Record<string, unknown>>;
  interfaces: Array<Record<string, unknown>>;
  objectives: Array<Record<string, unknown>>;
  constraints: Array<Record<string, unknown>>;
  variables: Array<Record<string, unknown>>;
  scenario: Record<string, unknown> | null;
  alternative: Record<string, unknown>;
  alternativeValues: Array<Record<string, unknown>>;
  adapterId: string;
  adapterVersion: string | null;
  toolId?: string | null;
  toolVersion?: string | null;
  algorithmId: string | null;
  algorithmVersion: string | null;
  randomSeed: string | null;
  modelArtifactRefs?: string[];
  artifactHashes?: string[];
};

export function buildRunInputManifest(input: ManifestBuildInput): RunInputManifestV1 {
  return {
    manifest_schema_version: MANIFEST_SCHEMA_VERSION,
    study: {
      study_id: input.studyId,
      lifecycle_stage: input.lifecycleStage,
    },
    configuration: {
      baseline_id: input.baselineId,
      baseline_fingerprint: input.baselineFingerprint,
      pinned_configuration_items: [...input.pinnedItems].sort((a, b) =>
        `${a.object_type}|${a.object_id}|${a.configuration_item_id}`.localeCompare(
          `${b.object_type}|${b.object_id}|${b.configuration_item_id}`,
        ),
      ),
    },
    system_scope: input.systems.map(systemContextProjection).sort((a, b) => a.id.localeCompare(b.id)),
    decision_context: { decision_id: input.decisionId },
    requirements: input.requirements.map(requirementContextProjection).sort((a, b) => a.id.localeCompare(b.id)),
    assumptions: input.assumptions.map(assumptionContextProjection).sort((a, b) => a.id.localeCompare(b.id)),
    interfaces: input.interfaces.map(interfaceContextProjection).sort((a, b) => a.id.localeCompare(b.id)),
    objectives: input.objectives
      .map((row) => ({
        objective_id: String(row.id),
        code: String(row.objective_code ?? ""),
        metric_key: String(row.metric_key ?? ""),
        direction: String(row.direction ?? ""),
        target_value: row.target_value == null ? null : Number(row.target_value),
        unit: (row.unit as string | null) ?? null,
      }))
      .sort((a, b) => a.objective_id.localeCompare(b.objective_id)),
    constraints: input.constraints
      .map((row) => ({
        constraint_id: String(row.id),
        code: String(row.constraint_code ?? ""),
        metric_key: String(row.metric_key ?? ""),
        operator: (row.operator as string | null) ?? null,
        threshold_value: row.threshold_value == null ? null : Number(row.threshold_value),
        unit: (row.unit as string | null) ?? null,
        hardness: String(row.hardness ?? "HARD"),
        source_object_type: (row.source_object_type as string | null) ?? null,
        source_object_id: (row.source_object_id as string | null) ?? null,
      }))
      .sort((a, b) => a.constraint_id.localeCompare(b.constraint_id)),
    design_variables: input.variables
      .map((row) => ({
        variable_id: String(row.id),
        code: String(row.variable_code ?? ""),
        variable_type: String(row.variable_type ?? ""),
        unit: (row.unit as string | null) ?? null,
        lower_bound: row.lower_bound == null ? null : Number(row.lower_bound),
        upper_bound: row.upper_bound == null ? null : Number(row.upper_bound),
        allowed_values: Array.isArray(row.allowed_values) ? row.allowed_values : null,
      }))
      .sort((a, b) => a.variable_id.localeCompare(b.variable_id)),
    scenario: {
      scenario_id: input.scenario ? String(input.scenario.id) : null,
      scenario_code: input.scenario ? String(input.scenario.scenario_code ?? "") : null,
      name: input.scenario ? String(input.scenario.name ?? "") : null,
      description: input.scenario ? ((input.scenario.description as string | null) ?? null) : null,
    },
    alternative: {
      alternative_id: String(input.alternative.id),
      alternative_code: (input.alternative.alternative_code as string | null) ?? null,
      name: (input.alternative.name as string | null) ?? null,
      values: input.alternativeValues
        .map((row) => ({
          variable_id: String(row.variable_id),
          numeric_value: row.numeric_value == null ? null : Number(row.numeric_value),
          text_value: (row.text_value as string | null) ?? null,
        }))
        .sort((a, b) => a.variable_id.localeCompare(b.variable_id)),
    },
    execution: {
      adapter_id: input.adapterId,
      adapter_version: input.adapterVersion,
      tool_id: input.toolId ?? input.adapterId,
      tool_version: input.toolVersion ?? input.adapterVersion,
      algorithm_id: input.algorithmId,
      algorithm_version: input.algorithmVersion,
      random_seed: input.randomSeed,
      model_artifact_refs: [...(input.modelArtifactRefs ?? [])].sort(),
      artifact_hashes: [...(input.artifactHashes ?? [])].sort(),
    },
  };
}

export function validateRunInputManifest(value: unknown): RunInputManifestV1 {
  if (!value || typeof value !== "object") throw new Error("invalid_manifest");
  const manifest = value as RunInputManifestV1;
  if (Number(manifest.manifest_schema_version) !== MANIFEST_SCHEMA_VERSION) {
    throw new Error(`unsupported_manifest_schema_version:${String(manifest.manifest_schema_version)}`);
  }
  if (!manifest.study?.study_id) throw new Error("invalid_manifest:study");
  if (!manifest.configuration?.baseline_id || !manifest.configuration.baseline_fingerprint) {
    throw new Error("invalid_manifest:configuration");
  }
  if (!manifest.alternative?.alternative_id) throw new Error("invalid_manifest:alternative");
  if (!manifest.execution?.adapter_id) throw new Error("invalid_manifest:execution");
  if (!Array.isArray(manifest.objectives) || manifest.objectives.length < 1) {
    throw new Error("invalid_manifest:objectives");
  }
  return manifest;
}

export function fingerprintRunInputManifest(manifest: RunInputManifestV1): string {
  const validated = validateRunInputManifest(manifest);
  return fingerprintCanonical(validated);
}

/**
 * Forward compatibility: readers accept only schema v1 in EOS-A5C.
 * Later versions must bump manifest_schema_version; unknown v1 fields are hashed if present.
 * Runtime timestamps must never be written into the manifest body.
 */
export const MANIFEST_FORWARD_COMPATIBILITY =
  "v1 is the A5C canonical schema. Additive optional fields inside v1 change the fingerprint. A future v2 requires an explicit version bump and a new validator.";
