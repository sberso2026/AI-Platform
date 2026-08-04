/**
 * Phase 6C-3E — Live Teams meeting URL validation + Graph discovery probe.
 * Never logs meeting join URLs beyond presence, and never logs secrets.
 */
import {
  requireLiveMicrosoftGraphConfig,
  MicrosoftGraphTokenService,
  createMicrosoftGraphClient,
  validateTeamsMeetingUrl,
} from "@rtb/project-intelligence";

async function main(): Promise<void> {
  const config = requireLiveMicrosoftGraphConfig(process.env);
  if (config.mode !== "live") {
    throw new Error("fixture fallback forbidden");
  }
  const url = process.env.PI_TEAMS_TEST_MEETING_URL?.trim();
  if (!url) {
    throw new Error("PI_TEAMS_TEST_MEETING_URL required");
  }
  const validated = validateTeamsMeetingUrl(url);
  const meetingId =
    process.env.PI_TEAMS_TEST_PROVIDER_MEETING_ID?.trim() || validated.meetingIdHint;
  if (!meetingId) {
    throw new Error("provider meeting id unresolved");
  }
  const graph = createMicrosoftGraphClient(config, new MicrosoftGraphTokenService(config));
  const meeting = await graph.getOnlineMeeting(meetingId, "ci-discovery");
  if (!meeting) {
    throw new Error("teams_meeting_not_found");
  }
  console.log("live_discovery=ok");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Certification step failed");
  process.exit(1);
});
