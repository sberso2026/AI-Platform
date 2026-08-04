/**
 * Phase 6C-3E — Live Graph least-privilege permission probe.
 * Never logs secrets or token values.
 */
import {
  requireLiveMicrosoftGraphConfig,
  MicrosoftGraphTokenService,
  MicrosoftGraphPermissionService,
} from "@rtb/project-intelligence";

async function main(): Promise<void> {
  const config = requireLiveMicrosoftGraphConfig(process.env);
  if (config.mode !== "live") {
    throw new Error("fixture fallback forbidden");
  }
  const tokens = new MicrosoftGraphTokenService(config);
  await new MicrosoftGraphPermissionService(config, tokens).validateLeastPrivilege("ci-perm");
  console.log("live_permission_probe=ok");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Certification step failed");
  process.exit(1);
});
