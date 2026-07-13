import { MeetingIntelligenceError } from "./errors";
import { MEETING_PROVIDER_STATUS, type MeetingProvider, isMeetingProvider } from "./types";

export type MeetingProviderCapabilityReport = {
  provider: MeetingProvider;
  status: (typeof MEETING_PROVIDER_STATUS)[MeetingProvider];
  joinEnabled: boolean;
  botAvailable: boolean;
  realtimeClaimed: boolean;
  phase6c3bCertified: boolean;
};

export function meetingProviderCapabilityReport(
  provider: MeetingProvider,
): MeetingProviderCapabilityReport {
  const status = MEETING_PROVIDER_STATUS[provider];
  const manual = provider === "manual";
  return {
    provider,
    status,
    joinEnabled: false,
    botAvailable: false,
    realtimeClaimed: false,
    phase6c3bCertified: manual && status === "certified_candidate",
  };
}

export function allMeetingProviderCapabilityReports(): MeetingProviderCapabilityReport[] {
  return (Object.keys(MEETING_PROVIDER_STATUS) as MeetingProvider[]).map(
    meetingProviderCapabilityReport,
  );
}

/** Phase 6C-3B only accepts manual provider for create/schedule flows. */
export function assertManualProviderOnly(provider: string): asserts provider is "manual" {
  if (!isMeetingProvider(provider)) {
    throw new MeetingIntelligenceError(
      "meeting_validation_failed",
      "Provider value is not allowed",
      422,
      { provider },
    );
  }
  if (provider !== "manual") {
    throw new MeetingIntelligenceError(
      "meeting_provider_unavailable",
      "External meeting providers are unavailable in Phase 6C-3B",
      422,
      {
        provider,
        status: MEETING_PROVIDER_STATUS[provider],
        joinEnabled: false,
        botAvailable: false,
      },
    );
  }
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
