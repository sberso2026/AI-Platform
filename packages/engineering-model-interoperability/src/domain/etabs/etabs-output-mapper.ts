/**
 * Phase 13E — ETABS output mapper.
 * Existing external results remain source_declared unless RTB execution evidence exists.
 */

import type { SolverArtifactRef } from "@rtb/digital-twin";
import type { EngineeringResultTrustClassification } from "../result-reference";
import { ETABS_BOUNDED_METHOD, ETABS_PROVIDER_KEY } from "./etabs-version";

export type EtabsMappedOutput = {
  providerKey: typeof ETABS_PROVIDER_KEY;
  methodKey: typeof ETABS_BOUNDED_METHOD;
  outputArtifactRefs: SolverArtifactRef[];
  mappedSummary: Record<string, unknown>;
  trustClassification: EngineeringResultTrustClassification;
  provenance: "external_existing" | "rtb_generated";
  rtbGenerated: boolean;
  silentFallbackUsed: false;
  liveNativeCom: false;
};

export function mapEtabsExistingExternalResult(input: {
  externalResultId: string;
  summary?: Record<string, unknown>;
  platformFileRef?: string;
}): EtabsMappedOutput {
  return {
    providerKey: ETABS_PROVIDER_KEY,
    methodKey: ETABS_BOUNDED_METHOD,
    outputArtifactRefs: input.platformFileRef
      ? [
          {
            artifactRefId: `etabs_ext_${input.externalResultId}`,
            filePathOrId: input.platformFileRef,
            label: "etabs_existing_result",
            kind: "output",
          },
        ]
      : [],
    mappedSummary: {
      externalResultId: input.externalResultId,
      ...(input.summary ?? {}),
      existingExternalResult: true,
      rtbExecutionCertified: false,
      exportFederation: true,
      liveNativeCom: false,
    },
    trustClassification: "source_declared",
    provenance: "external_existing",
    rtbGenerated: false,
    silentFallbackUsed: false,
    liveNativeCom: false,
  };
}

/**
 * Only callable when a real RTB-governed ETABS COM execution completed.
 * Hosted/controlled certification remains separate honesty flags.
 */
export function mapEtabsRtbExecutionOutput(input: {
  requestId: string;
  artifactDir: string;
  summary?: Record<string, unknown>;
  externalProcessSpawned: boolean;
}): EtabsMappedOutput {
  if (!input.externalProcessSpawned) {
    throw new Error("etabs_rtb_output_requires_external_process");
  }
  return {
    providerKey: ETABS_PROVIDER_KEY,
    methodKey: ETABS_BOUNDED_METHOD,
    outputArtifactRefs: [
      {
        artifactRefId: `${input.requestId}_result_summary`,
        filePathOrId: `${input.artifactDir}/etabs-result-summary.json`,
        label: "etabs_result_summary",
        kind: "output",
      },
    ],
    mappedSummary: {
      ...(input.summary ?? {}),
      rtbGovernedExecution: true,
    },
    trustClassification: "rtb_execution_certified",
    provenance: "rtb_generated",
    rtbGenerated: true,
    silentFallbackUsed: false,
    liveNativeCom: false,
  };
}
