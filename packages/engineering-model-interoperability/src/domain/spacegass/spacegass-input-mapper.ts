/**
 * Phase 13C — SPACE GASS input mapper (Simulation Package–compatible shape).
 * Maps federated model refs / execution requests into adapter input artifacts.
 * Does not mutate source models; does not generate analysis models for authoring.
 */

import type { SolverArtifactRef } from "@rtb/digital-twin";
import { SPACEGASS_BOUNDED_METHOD, SPACEGASS_PROVIDER_KEY } from "./spacegass-version";

export type SpaceGassMappedInput = {
  providerKey: typeof SPACEGASS_PROVIDER_KEY;
  methodKey: typeof SPACEGASS_BOUNDED_METHOD;
  unitSystem: string;
  unitCode: string;
  modelRefId: string;
  platformFileRef?: string;
  inputArtifactRefs: SolverArtifactRef[];
  silentSolverFallbackAllowed: false;
  sourceModelMutationAllowed: false;
  analysisModelGenerationAllowed: false;
};

export function mapSpaceGassExecutionInput(input: {
  requestId: string;
  modelRefId: string;
  artifactDir: string;
  unitSystem: string;
  unitCode: string;
  platformFileRef?: string;
  defaultsManifestVersion: string;
}): SpaceGassMappedInput {
  if (!input.unitSystem || !input.unitCode) {
    throw new Error("spacegass_units_required");
  }
  if (!input.defaultsManifestVersion) {
    throw new Error("spacegass_defaults_manifest_required");
  }

  const manifestRef: SolverArtifactRef = {
    artifactRefId: `${input.requestId}_input_manifest`,
    filePathOrId: `${input.artifactDir}/spacegass-input-manifest.json`,
    label: "spacegass_input_manifest",
    kind: "input",
  };

  const modelRef: SolverArtifactRef = {
    artifactRefId: `${input.requestId}_model_ref`,
    filePathOrId: input.platformFileRef ?? `model:${input.modelRefId}`,
    label: "spacegass_model_locator",
    kind: "input",
  };

  return {
    providerKey: SPACEGASS_PROVIDER_KEY,
    methodKey: SPACEGASS_BOUNDED_METHOD,
    unitSystem: input.unitSystem,
    unitCode: input.unitCode,
    modelRefId: input.modelRefId,
    platformFileRef: input.platformFileRef,
    inputArtifactRefs: [manifestRef, modelRef],
    silentSolverFallbackAllowed: false,
    sourceModelMutationAllowed: false,
    analysisModelGenerationAllowed: false,
  };
}
