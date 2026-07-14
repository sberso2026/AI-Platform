import { MeetingIntelligenceError } from "./errors";
import {
  CERTIFIED_TEAMS_CAPABILITY_SUBSET,
  overallTeamsProviderStatus,
} from "./teams/capability-contract";
import { readMicrosoftGraphConfig } from "./teams/microsoft-graph-token-service";
import { computeTeamsProviderReadiness } from "./teams/teams-provider-readiness";
import { MEETING_PROVIDER_STATUS, type MeetingProvider, isMeetingProvider } from "./types";

export type MeetingProviderCapabilityReport = {
  provider: MeetingProvider;
  status: "certified_candidate" | "unavailable" | "experimental" | "beta" | "certified";
  availableCapabilities: string[];
  authenticationConfigured: boolean;
  webhookConfigured: boolean;
  transcriptSupport: boolean;
  realtimeSupport: boolean;
  recordingSupport: boolean;
  participantSupport: boolean;
  joinEnabled: boolean;
  botAvailable: boolean;
  realtimeClaimed: boolean;
  limitations: string[];
  lastHealthCheck: string | null;
  phase6c3bCertified: boolean;
  phase6c3cCertified: boolean;
  phase6c3dFixtureCertified: boolean;
  phase6c3eLiveCertified: boolean;
  graphMode: "live" | "fixture" | "unconfigured";
};

/** Teams is certified when explicitly enabled or Graph fixture/live config is present. */
export function isMicrosoftTeamsProviderConfigured(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if ((env.PI_TEAMS_PROVIDER_ENABLED ?? "").trim() === "1") return true;
  return readMicrosoftGraphConfig(env) != null;
}

export function meetingProviderCapabilityReport(
  provider: MeetingProvider,
  env: NodeJS.ProcessEnv = process.env,
): MeetingProviderCapabilityReport {
  if (provider === "manual") {
    const status = MEETING_PROVIDER_STATUS.manual;
    return {
      provider,
      status,
      availableCapabilities: [
        "manual_session",
        "manual_transcript_append",
        "processing_enqueue",
        "minutes_review",
      ],
      authenticationConfigured: true,
      webhookConfigured: false,
      transcriptSupport: true,
      realtimeSupport: true,
      recordingSupport: false,
      participantSupport: true,
      joinEnabled: false,
      botAvailable: false,
      realtimeClaimed: false,
      limitations: ["No live provider bot", "RTB-owned manual transcript events only"],
      lastHealthCheck: null,
      phase6c3bCertified: true,
      phase6c3cCertified: status === "certified",
      phase6c3dFixtureCertified: false,
      phase6c3eLiveCertified: false,
      graphMode: "unconfigured",
    };
  }

  if (provider === "microsoft_teams" && isMicrosoftTeamsProviderConfigured(env)) {
    const config = readMicrosoftGraphConfig(env);
    const graphMode = config?.mode ?? "unconfigured";
    const readiness = computeTeamsProviderReadiness({
      env,
      liveTenantCertified: (env.PI_TEAMS_LIVE_TENANT_CERTIFIED ?? "").trim() === "1",
      postMeetingTranscriptCertified:
        (env.PI_TEAMS_POST_MEETING_TRANSCRIPT_CERTIFIED ?? "").trim() === "1",
      capabilities: CERTIFIED_TEAMS_CAPABILITY_SUBSET,
    });
    const capabilities = { ...CERTIFIED_TEAMS_CAPABILITY_SUBSET };
    // Live mode without live cert still shows capabilities as configured-at-runtime via 6C-3D subset
    // but phase6c3eLiveCertified remains false until evidence sets env flags.
    const status = overallTeamsProviderStatus(capabilities);
    const availableCapabilities = Object.entries(capabilities)
      .filter(([, value]) => value === "certified")
      .map(([name]) => name);
    return {
      provider,
      status: status === "certified" ? "certified" : "experimental",
      availableCapabilities,
      authenticationConfigured: true,
      webhookConfigured: true,
      transcriptSupport: capabilities.transcript_retrieval === "certified",
      realtimeSupport: false,
      recordingSupport: false,
      participantSupport: capabilities.participant_metadata === "certified",
      joinEnabled: false,
      botAvailable: false,
      realtimeClaimed: false,
      limitations: [
        "live_transcript unsupported",
        "recording_access unsupported",
        "bot_join unsupported",
        graphMode === "live"
          ? "Post-meeting transcript only (live Graph)"
          : "Post-meeting transcript only (fixture Graph — not live)",
        readiness.microsoftTeamsLiveTenantCertified
          ? "Live tenant certified"
          : "Live tenant not certified",
      ],
      lastHealthCheck: null,
      phase6c3bCertified: false,
      phase6c3cCertified: false,
      phase6c3dFixtureCertified: graphMode === "fixture",
      phase6c3eLiveCertified: readiness.microsoftTeamsLiveTenantCertified,
      graphMode,
    };
  }

  return {
    provider,
    status: "unavailable",
    availableCapabilities: [],
    authenticationConfigured: false,
    webhookConfigured: false,
    transcriptSupport: false,
    realtimeSupport: false,
    recordingSupport: false,
    participantSupport: false,
    joinEnabled: false,
    botAvailable: false,
    realtimeClaimed: false,
    limitations: ["Provider unavailable", "UI actions disabled"],
    lastHealthCheck: null,
    phase6c3bCertified: false,
    phase6c3cCertified: false,
    phase6c3dFixtureCertified: false,
    phase6c3eLiveCertified: false,
    graphMode: "unconfigured",
  };
}

export function allMeetingProviderCapabilityReports(
  env: NodeJS.ProcessEnv = process.env,
): MeetingProviderCapabilityReport[] {
  return (Object.keys(MEETING_PROVIDER_STATUS) as MeetingProvider[]).map((provider) =>
    meetingProviderCapabilityReport(provider, env),
  );
}

/** Allows manual always; microsoft_teams when capability report status is certified. */
export function assertAllowedMeetingProvider(
  provider: string,
  env: NodeJS.ProcessEnv = process.env,
): asserts provider is MeetingProvider {
  if (!isMeetingProvider(provider)) {
    throw new MeetingIntelligenceError(
      "meeting_validation_failed",
      "Provider value is not allowed",
      422,
      { provider },
    );
  }
  const report = meetingProviderCapabilityReport(provider, env);
  if (report.status !== "certified") {
    throw new MeetingIntelligenceError(
      "meeting_provider_unavailable",
      "Meeting provider is unavailable unless certified",
      422,
      {
        provider,
        status: report.status,
        joinEnabled: report.joinEnabled,
        botAvailable: report.botAvailable,
      },
    );
  }
}

/** @deprecated Prefer assertAllowedMeetingProvider. */
export function assertManualProviderOnly(
  provider: string,
  env: NodeJS.ProcessEnv = process.env,
): asserts provider is MeetingProvider {
  assertAllowedMeetingProvider(provider, env);
}

export function assertExternalProvidersUnavailableInUi(labels: string[]): void {
  const forbidden = ["Join Teams", "Join Zoom", "Join Google Meet"];
  for (const label of labels) {
    if (forbidden.includes(label)) {
      throw new MeetingIntelligenceError(
        "meeting_provider_unavailable",
        "External provider join actions must not be enabled",
        422,
        { label },
      );
    }
  }
}
