import type { TeamsCapabilityMap } from "./capability-contract";
import { HARD_UNSUPPORTED_TEAMS_CAPABILITIES } from "./capability-contract";
import type { MicrosoftGraphConfig } from "./microsoft-graph-token-service";
import { liveConfigPresence, readMicrosoftGraphConfig } from "./microsoft-graph-token-service";

export type TeamsProviderReadinessFlags = {
  microsoftTeamsFixtureCertified: boolean;
  microsoftTeamsLiveTenantConfigured: boolean;
  microsoftTeamsLiveTenantCertified: boolean;
  microsoftTeamsPostMeetingTranscriptCertified: boolean;
  microsoftTeamsRealtimeTranscriptCertified: false;
  microsoftTeamsRecordingCertified: false;
  microsoftTeamsBotJoinCertified: false;
  productionTeamsProviderReady: boolean;
  graphMode: "live" | "fixture" | "unconfigured";
  tenantLabel: string | null;
};

export function computeTeamsProviderReadiness(input: {
  env?: NodeJS.ProcessEnv;
  liveTenantCertified?: boolean;
  postMeetingTranscriptCertified?: boolean;
  capabilities?: TeamsCapabilityMap;
}): TeamsProviderReadinessFlags {
  const env = input.env ?? process.env;
  const config = readMicrosoftGraphConfig(env);
  const presence = liveConfigPresence(env);
  const mode = config?.mode ?? (presence.mode === "fixture" ? "fixture" : "unconfigured");

  const liveConfigured =
    mode === "live" &&
    presence.namesMissing.filter((n) => n !== "PI_TEAMS_LIVE_CERT_ENABLED").length === 0;

  const liveCertified = Boolean(input.liveTenantCertified) && liveConfigured && mode === "live";
  const postMeeting = Boolean(input.postMeetingTranscriptCertified) && liveCertified;

  const unsupportedOk = HARD_UNSUPPORTED_TEAMS_CAPABILITIES.every(
    (name) => !input.capabilities || input.capabilities[name] === "unsupported",
  );

  return {
    microsoftTeamsFixtureCertified: mode === "fixture",
    microsoftTeamsLiveTenantConfigured: liveConfigured,
    microsoftTeamsLiveTenantCertified: liveCertified,
    microsoftTeamsPostMeetingTranscriptCertified: postMeeting,
    microsoftTeamsRealtimeTranscriptCertified: false,
    microsoftTeamsRecordingCertified: false,
    microsoftTeamsBotJoinCertified: false,
    productionTeamsProviderReady: liveCertified && postMeeting && unsupportedOk,
    graphMode: mode === "live" || mode === "fixture" ? mode : "unconfigured",
    tenantLabel: config?.tenantLabel ?? env.PI_TEAMS_TEST_TENANT_LABEL?.trim() ?? null,
  };
}

export function teamsProviderUiCopy(flags: TeamsProviderReadinessFlags): {
  teamsLabel: string;
  explanation: string;
} {
  let teamsLabel = "Unavailable";
  if (flags.microsoftTeamsLiveTenantCertified) {
    teamsLabel = "Live tenant certified";
  } else if (flags.microsoftTeamsFixtureCertified) {
    teamsLabel = "Fixture certified only";
  } else if (flags.microsoftTeamsLiveTenantConfigured) {
    teamsLabel = "Live tenant configured (not certified)";
  }

  return {
    teamsLabel,
    explanation:
      "Teams post-meeting transcript retrieval is certified. Realtime transcript, bot join, and recording are not enabled.",
  };
}

export function summarizeConfigSafely(config: MicrosoftGraphConfig | null): Record<string, unknown> {
  if (!config) return { configured: false, mode: "unconfigured" };
  return {
    configured: true,
    mode: config.mode,
    tenantIdRedacted: config.tenantId.slice(0, 4) + "…",
    tenantLabel: config.tenantLabel,
    hasNotificationUrl: Boolean(config.notificationUrl),
    liveCertEnabled: config.liveCertEnabled,
  };
}
