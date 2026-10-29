/**
 * Phase 13E — ETABS input mapper (Simulation Package–compatible shape).
 */

import type { SolverArtifactRef } from "@rtb/digital-twin";
import { ETABS_BOUNDED_METHOD, ETABS_PROVIDER_KEY } from "./etabs-version";

export type EtabsMappedInput = {
  providerKey: typeof ETABS_PROVIDER_KEY;
  methodKey: typeof ETABS_BOUNDED_METHOD;
  unitSystem: string;
  unitCode: string;
  modelRefId: string;
  platformFileRef?: string;
  inputArtifactRefs: SolverArtifactRef[];
  silentSolverFallbackAllowed: false;
  sourceModelMutationAllowed: false;
  analysisModelGenerationAllowed: false;
  liveNativeCom: false;
};

export function mapEtabsExecutionInput(input: {
  requestId: string;
  modelRefId: string;
  artifactDir: string;
  unitSystem: string;
  unitCode: string;
  platformFileRef?: string;
  defaultsManifestVersion: string;
}): EtabsMappedInput {
  if (!input.unitSystem || !input.unitCode) {
    throw new Error("etabs_units_required");
  }
  if (!input.defaultsManifestVersion) {
    throw new Error("etabs_defaults_manifest_required");
  }

  const manifestRef: SolverArtifactRef = {
    artifactRefId: `${input.requestId}_input_manifest`,
    filePathOrId: `${input.artifactDir}/etabs-input-manifest.json`,
    label: "etabs_input_manifest",
    kind: "input",
  };

  const modelRef: SolverArtifactRef = {
    artifactRefId: `${input.requestId}_model_ref`,
    filePathOrId: input.platformFileRef ?? `model:${input.modelRefId}`,
    label: "etabs_model_locator",
    kind: "input",
  };

  return {
    providerKey: ETABS_PROVIDER_KEY,
    methodKey: ETABS_BOUNDED_METHOD,
    unitSystem: input.unitSystem,
    unitCode: input.unitCode,
    modelRefId: input.modelRefId,
    platformFileRef: input.platformFileRef,
    inputArtifactRefs: [manifestRef, modelRef],
    silentSolverFallbackAllowed: false,
    sourceModelMutationAllowed: false,
    analysisModelGenerationAllowed: false,
    liveNativeCom: false,
  };
}
