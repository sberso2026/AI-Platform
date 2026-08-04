/**
 * Phase 6C-3E — Live post-meeting transcript probe (metadata only; no content logged).
 */
import {
  requireLiveMicrosoftGraphConfig,
  MicrosoftGraphTokenService,
  createMicrosoftGraphClient,
  validateTeamsMeetingUrl,
  measureLatencyMs,
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
  try {
    const measured = await measureLatencyMs(() =>
      graph.listTranscriptSegments(meetingId, "ci-tx"),
    );
    console.log(
      JSON.stringify({
        ok: true,
        segmentCount: measured.result.length,
        latencyMs: measured.latencyMs,
      }),
    );
  } catch (error) {
    const code =
      (error as { code?: string; message?: string })?.code ||
      (error instanceof Error ? error.message : "unknown");
    if (process.env.PI_TEAMS_ACCEPT_TRANSCRIPT_UNAVAILABLE === "1") {
      console.log(
        JSON.stringify({ ok: true, transcriptClass: "unavailable", code: String(code) }),
      );
      return;
    }
    console.log(JSON.stringify({ ok: false, code: String(code) }));
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Certification step failed");
  process.exit(1);
});
