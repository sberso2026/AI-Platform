import { throwTeamsError } from "./capability-contract";
import type { MicrosoftGraphConfig } from "./microsoft-graph-token-service";
import { MicrosoftGraphTokenService } from "./microsoft-graph-token-service";

export type GraphPermissionProbeResult = {
  ok: boolean;
  adminConsentRequired: boolean;
  probed: string[];
  failed: string[];
  correlationId: string;
};

/**
 * Least-privilege permission probe against live Graph.
 * Uses cheap identity/metadata endpoints — never logs tokens or private payload content.
 */
export class MicrosoftGraphPermissionService {
  constructor(
    private readonly config: MicrosoftGraphConfig,
    private readonly tokenService: MicrosoftGraphTokenService,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async validateLeastPrivilege(correlationId: string): Promise<GraphPermissionProbeResult> {
    if (this.config.mode !== "live") {
      throwTeamsError(
        "teams_provider_not_configured",
        "Permission validation requires live Graph mode",
        { teamsCode: "TEAMS_GRAPH_LIVE_CONFIG_MISSING" },
      );
    }

    const token = await this.tokenService.getAccessToken(correlationId);
    const probed: string[] = [];
    const failed: string[] = [];
    let adminConsentRequired = false;

    // Application permissions are validated by attempting a constrained Graph call.
    // We do not dump response bodies (may include directory data).
    const probes: Array<{ name: string; path: string }> = [
      { name: "OnlineMeetings.Read.All", path: "/communications/onlineMeetings?$top=1" },
    ];

    for (const probe of probes) {
      probed.push(probe.name);
      const response = await this.fetchImpl(`https://graph.microsoft.com/v1.0${probe.path}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "client-request-id": correlationId,
        },
      });
      if (response.status === 401 || response.status === 403) {
        failed.push(probe.name);
        adminConsentRequired = true;
        continue;
      }
      if (!response.ok && response.status !== 404) {
        // 404 can mean empty collection depending on API shape; treat non-auth errors cautiously
        failed.push(probe.name);
      }
      // Drain body without logging
      await response.text().catch(() => "");
    }

    if (adminConsentRequired) {
      throwTeamsError(
        "teams_provider_permission_missing",
        "Microsoft Graph admin consent is required for Teams provider permissions",
        {
          teamsCode: "TEAMS_GRAPH_ADMIN_CONSENT_REQUIRED",
          failed,
        },
      );
    }

    return {
      ok: failed.length === 0,
      adminConsentRequired: false,
      probed,
      failed,
      correlationId,
    };
  }
}
