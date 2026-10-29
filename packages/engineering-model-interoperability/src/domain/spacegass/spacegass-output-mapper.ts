/**
 * Phase 13C — SPACE GASS output mapper.
 * Maps adapter outputs into federated result reference metadata.
 * Existing external results remain source_declared unless RTB execution evidence exists.
 */

import type { SolverArtifactRef } from "@rtb/digital-twin";
import type { EngineeringResultTrustClassification } from "../result-reference";
import { SPACEGASS_BOUNDED_METHOD, SPACEGASS_PROVIDER_KEY } from "./spacegass-version";

export type SpaceGassMappedOutput = {
  providerKey: typeof SPACEGASS_PROVIDER_KEY;
  methodKey: typeof SPACEGASS_BOUNDED_METHOD;
  outputArtifactRefs: SolverArtifactRef[];
  mappedSummary: Record<string, unknown>;
  trustClassification: EngineeringResultTrustClassification;
  provenance: "external_existing" | "rtb_generated";
  rtbGenerated: boolean;
  silentFallbackUsed: false;
};

export function mapSpaceGassExistingExternalResult(input: {
  externalResultId: string;
  summary?: Record<string, unknown>;
  platformFileRef?: string;
}): SpaceGassMappedOutput {
  return {
    providerKey: SPACEGASS_PROVIDER_KEY,
    methodKey: SPACEGASS_BOUNDED_METHOD,
    outputArtifactRefs: input.platformFileRef
      ? [
          {
            artifactRefId: `sg_ext_${input.externalResultId}`,
            filePathOrId: input.platformFileRef,
            label: "spacegass_existing_result",
            kind: "output",
          },
        ]
      : [],
    mappedSummary: {
      externalResultId: input.externalResultId,
      ...(input.summary ?? {}),
      existingExternalResult: true,
      rtbExecutionCertified: false,
    },
    trustClassification: "source_declared",
    provenance: "external_existing",
    rtbGenerated: false,
    silentFallbackUsed: false,
  };
}

/**
 * Only callable when a real RTB-governed SPACE GASS execution completed.
 * Hosted certification remains a separate honesty flag.
 */
export function mapSpaceGassRtbExecutionOutput(input: {
  requestId: string;
  artifactDir: string;
  summary?: Record<string, unknown>;
  externalProcessSpawned: boolean;
}): SpaceGassMappedOutput {
  if (!input.externalProcessSpawned) {
    throw new Error("spacegass_rtb_output_requires_external_process");
  }
  return {
    providerKey: SPACEGASS_PROVIDER_KEY,
    methodKey: SPACEGASS_BOUNDED_METHOD,
    outputArtifactRefs: [
      {
        artifactRefId: `${input.requestId}_result_summary`,
        filePathOrId: `${input.artifactDir}/spacegass-result-summary.json`,
        label: "spacegass_result_summary",
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
  };
}
