/**
 * Phase 6C-3E — Live Entra / Graph token acquisition probe.
 * Never logs token values.
 */
import {
  requireLiveMicrosoftGraphConfig,
  MicrosoftGraphTokenService,
} from "@rtb/project-intelligence";

async function main(): Promise<void> {
  const config = requireLiveMicrosoftGraphConfig(process.env);
  if (config.mode !== "live") {
    throw new Error("fixture fallback forbidden");
  }
  const token = await new MicrosoftGraphTokenService(config).getAccessToken("ci-auth");
  if (!token || token.startsWith("fixture-token:")) {
    throw new Error("live token required");
  }
  console.log("live_token_acquired=true");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Certification step failed");
  process.exit(1);
});
