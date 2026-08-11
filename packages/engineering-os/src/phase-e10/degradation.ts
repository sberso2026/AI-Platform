/**
 * Graceful degradation helpers — native EOS remains usable.
 */

import type {
  DeploymentProfile,
  EngineeringDegradationEvent,
  EngineeringDegradationResult,
  EngineeringIdentityMode,
} from "./contracts";
import { getEngineeringProfileContract } from "./profiles";

export function resolveDegradation(
  event: EngineeringDegradationEvent,
  profileId: DeploymentProfile = "ESSENTIAL",
): EngineeringDegradationResult {
  switch (event) {
    case "connector_outage":
      return {
        continueNativeEos: true,
        fallback: "native_ask_evidence_reasoning",
        message:
          "Enterprise connector unavailable; native Engineering OS Ask/search/reasoning continues.",
      };
    case "intelligence_pack_unavailable":
      return {
        continueNativeEos: true,
        fallback: "native_ask_evidence_reasoning",
        message:
          "Intelligence pack unavailable; falling back to evidence-grounded Ask/reasoning.",
      };
    case "external_identity_unavailable": {
      const profile = getEngineeringProfileContract(profileId);
      const nativeOk =
        profile.identityMode === "NATIVE" ||
        profile.allowedDeploymentModes.includes("RTB_SAAS");
      return {
        continueNativeEos: nativeOk,
        fallback: "native_identity",
        message: nativeOk
          ? "External identity unavailable; using native identity path where deployment permits."
          : "External identity unavailable; deployment requires federated identity configuration.",
      };
    }
    case "enterprise_feature_not_entitled":
      return {
        continueNativeEos: true,
        fallback: "hide_enterprise_surface",
        message:
          "Enterprise feature not entitled; surface hidden from engineers (admin may inspect).",
      };
    default:
      return {
        continueNativeEos: true,
        fallback: "native_ask_evidence_reasoning",
        message: "Degraded safely to native Engineering OS path.",
      };
  }
}

export function resolveIdentityPath(input: {
  configuredMode: EngineeringIdentityMode;
  externalIdentityAvailable: boolean;
  deploymentPermitsNativeFallback: boolean;
}): { mode: EngineeringIdentityMode; usedNativeFallback: boolean } {
  if (input.configuredMode === "NATIVE") {
    return { mode: "NATIVE", usedNativeFallback: false };
  }
  if (input.externalIdentityAvailable) {
    return { mode: input.configuredMode, usedNativeFallback: false };
  }
  if (input.deploymentPermitsNativeFallback) {
    return { mode: "NATIVE", usedNativeFallback: true };
  }
  return { mode: input.configuredMode, usedNativeFallback: false };
}

/** Corporate Copilot federation is ENTERPRISE-optional only. */
export function resolveCopilotFederation(input: {
  profileId: DeploymentProfile;
  entitled: boolean;
  enabledByAdmin: boolean;
}): {
  available: boolean;
  nativeAssistantRequiredFunctional: true;
  reason: string;
} {
  if (input.profileId !== "ENTERPRISE") {
    return {
      available: false,
      nativeAssistantRequiredFunctional: true,
      reason: "copilot_federation_enterprise_optional_only",
    };
  }
  if (!input.entitled || !input.enabledByAdmin) {
    return {
      available: false,
      nativeAssistantRequiredFunctional: true,
      reason: "not_entitled_or_not_enabled",
    };
  }
  return {
    available: true,
    nativeAssistantRequiredFunctional: true,
    reason: "optional_federation_enabled",
  };
}

/** Domain services remain the same across profiles — packaging only changes visibility. */
export function assertSameDomainServicesAcrossProfiles(): {
  sameCodebase: true;
  services: string[];
} {
  return {
    sameCodebase: true,
    services: [
      "EngineeringProjectService",
      "EngineeringDocumentService",
      "EngineeringSearchService",
      "EngineeringAIService",
      "EngineeringIntelligenceService",
      "EngineeringActionProposalService",
      "EngineeringMemoryCaptureService",
    ],
  };
}

export type ProfilePerfSample = {
  profileId: DeploymentProfile;
  homeMs: number;
  navMs: number;
  askMs: number;
};

/** Instrument home/nav/Ask latency samples (deterministic helper for tests). */
export function recordProfilePerf(
  profileId: DeploymentProfile,
  sample: { homeMs: number; navMs: number; askMs: number },
): ProfilePerfSample {
  return { profileId, ...sample };
}
