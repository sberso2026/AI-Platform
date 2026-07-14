import { createHash } from "node:crypto";

import { throwTeamsError, type TeamsErrorCode } from "./capability-contract";

export type MicrosoftGraphConfig = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  webhookSecret: string;
  notificationUrl: string | null;
  lifecycleNotificationUrl: string | null;
  mode: "live" | "fixture";
  tenantLabel: string | null;
  testOrganizer: string | null;
  testMeetingUrl: string | null;
  liveCertEnabled: boolean;
};

function firstEnv(env: NodeJS.ProcessEnv, ...names: string[]): string | undefined {
  for (const name of names) {
    const value = env[name]?.trim();
    if (value) return value;
  }
  return undefined;
}

/** Canonical Graph notification path under the web app. */
export const MICROSOFT_GRAPH_WEBHOOK_PATH = "/api/webhooks/microsoft-graph";
export const MICROSOFT_GRAPH_LIFECYCLE_WEBHOOK_PATH =
  "/api/webhooks/microsoft-graph/lifecycle";

/**
 * Resolves absolute notification URLs from PI_TEAMS_WEBHOOK_BASE_URL.
 * Accepts either an origin (https://pilot.example.com) or a full notification URL.
 */
export function resolveMicrosoftGraphWebhookUrls(baseOrFullUrl: string | null | undefined): {
  notificationUrl: string | null;
  lifecycleNotificationUrl: string | null;
} {
  const raw = baseOrFullUrl?.trim();
  if (!raw) {
    return { notificationUrl: null, lifecycleNotificationUrl: null };
  }

  const withoutTrailingSlash = raw.replace(/\/$/, "");
  if (withoutTrailingSlash.endsWith(MICROSOFT_GRAPH_WEBHOOK_PATH)) {
    return {
      notificationUrl: withoutTrailingSlash,
      lifecycleNotificationUrl: `${withoutTrailingSlash}/lifecycle`,
    };
  }
  if (withoutTrailingSlash.endsWith(`${MICROSOFT_GRAPH_WEBHOOK_PATH}/lifecycle`)) {
    const notificationUrl = withoutTrailingSlash.replace(/\/lifecycle$/, "");
    return {
      notificationUrl,
      lifecycleNotificationUrl: withoutTrailingSlash,
    };
  }

  // Base origin (or host without path) → append canonical routes.
  try {
    const parsed = new URL(withoutTrailingSlash);
    const origin = parsed.origin;
    // If caller already supplied a non-canonical path, keep it (compat).
    if (parsed.pathname && parsed.pathname !== "/") {
      return {
        notificationUrl: withoutTrailingSlash,
        lifecycleNotificationUrl: `${withoutTrailingSlash}/lifecycle`,
      };
    }
    return {
      notificationUrl: `${origin}${MICROSOFT_GRAPH_WEBHOOK_PATH}`,
      lifecycleNotificationUrl: `${origin}${MICROSOFT_GRAPH_LIFECYCLE_WEBHOOK_PATH}`,
    };
  } catch {
    return {
      notificationUrl: `${withoutTrailingSlash}${MICROSOFT_GRAPH_WEBHOOK_PATH}`,
      lifecycleNotificationUrl: `${withoutTrailingSlash}${MICROSOFT_GRAPH_LIFECYCLE_WEBHOOK_PATH}`,
    };
  }
}

/**
 * Reads Graph configuration.
 * Preferred names: PI_TEAMS_* (Phase 6C-3E). Legacy MICROSOFT_* aliases still accepted.
 */
export function readMicrosoftGraphConfig(
  env: NodeJS.ProcessEnv = process.env,
): MicrosoftGraphConfig | null {
  const modeRaw = (env.PI_TEAMS_GRAPH_MODE ?? "").trim().toLowerCase();
  const liveCertEnabled = (env.PI_TEAMS_LIVE_CERT_ENABLED ?? "").trim().toLowerCase() === "true";

  if (modeRaw === "fixture") {
    const webhookSecret =
      firstEnv(env, "PI_TEAMS_WEBHOOK_CLIENT_STATE", "MICROSOFT_GRAPH_WEBHOOK_SECRET") ||
      "fixture-webhook-client-state";
    const webhookUrls = resolveMicrosoftGraphWebhookUrls(
      firstEnv(env, "PI_TEAMS_WEBHOOK_BASE_URL", "MICROSOFT_GRAPH_NOTIFICATION_URL"),
    );
    return {
      tenantId:
        firstEnv(env, "PI_TEAMS_TENANT_ID", "MICROSOFT_TENANT_ID") || "fixture-tenant",
      clientId: firstEnv(env, "PI_TEAMS_CLIENT_ID", "MICROSOFT_CLIENT_ID") || "fixture-client",
      clientSecret:
        firstEnv(env, "PI_TEAMS_CLIENT_SECRET", "MICROSOFT_CLIENT_SECRET") || "fixture-secret",
      webhookSecret,
      notificationUrl: webhookUrls.notificationUrl,
      lifecycleNotificationUrl:
        env.MICROSOFT_GRAPH_LIFECYCLE_NOTIFICATION_URL?.trim() ||
        webhookUrls.lifecycleNotificationUrl,
      mode: "fixture",
      tenantLabel: env.PI_TEAMS_TEST_TENANT_LABEL?.trim() || "fixture",
      testOrganizer: env.PI_TEAMS_TEST_ORGANIZER_USER_ID?.trim() || null,
      testMeetingUrl: env.PI_TEAMS_TEST_MEETING_URL?.trim() || null,
      liveCertEnabled: false,
    };
  }

  const tenantId = firstEnv(env, "PI_TEAMS_TENANT_ID", "MICROSOFT_TENANT_ID");
  const clientId = firstEnv(env, "PI_TEAMS_CLIENT_ID", "MICROSOFT_CLIENT_ID");
  const clientSecret = firstEnv(env, "PI_TEAMS_CLIENT_SECRET", "MICROSOFT_CLIENT_SECRET");
  const webhookSecret = firstEnv(
    env,
    "PI_TEAMS_WEBHOOK_CLIENT_STATE",
    "MICROSOFT_GRAPH_WEBHOOK_SECRET",
  );
  const webhookUrls = resolveMicrosoftGraphWebhookUrls(
    firstEnv(env, "PI_TEAMS_WEBHOOK_BASE_URL", "MICROSOFT_GRAPH_NOTIFICATION_URL"),
  );

  if (!tenantId || !clientId || !clientSecret || !webhookSecret) {
    return null;
  }

  // Live mode: never accept fixture placeholder values when mode is live or implied live.
  if (modeRaw === "live" || modeRaw === "") {
    const placeholders = ["fixture-tenant", "fixture-client", "fixture-secret", "fixture-webhook-client-state"];
    if (
      placeholders.includes(tenantId) ||
      placeholders.includes(clientId) ||
      placeholders.includes(clientSecret) ||
      placeholders.includes(webhookSecret)
    ) {
      return null;
    }
  }

  return {
    tenantId,
    clientId,
    clientSecret,
    webhookSecret,
    notificationUrl: webhookUrls.notificationUrl,
    lifecycleNotificationUrl:
      env.MICROSOFT_GRAPH_LIFECYCLE_NOTIFICATION_URL?.trim() ||
      webhookUrls.lifecycleNotificationUrl,
    mode: "live",
    tenantLabel: env.PI_TEAMS_TEST_TENANT_LABEL?.trim() || null,
    testOrganizer: env.PI_TEAMS_TEST_ORGANIZER_USER_ID?.trim() || null,
    testMeetingUrl: env.PI_TEAMS_TEST_MEETING_URL?.trim() || null,
    liveCertEnabled,
  };
}

/**
 * Require live Graph configuration. Never falls back to fixture.
 * Throws MeetingIntelligenceError with teamsCode TEAMS_GRAPH_LIVE_CONFIG_MISSING.
 */
export function requireLiveMicrosoftGraphConfig(
  env: NodeJS.ProcessEnv = process.env,
): MicrosoftGraphConfig {
  const mode = (env.PI_TEAMS_GRAPH_MODE ?? "").trim().toLowerCase();
  if (mode === "fixture") {
    throwTeamsError(
      "teams_provider_not_configured",
      "Live Graph mode required; fixture mode is not accepted for Phase 6C-3E",
      {
        teamsCode: "TEAMS_GRAPH_LIVE_CONFIG_MISSING",
        reason: "fixture_mode_forbidden",
      },
    );
  }

  const config = readMicrosoftGraphConfig({
    ...env,
    PI_TEAMS_GRAPH_MODE: mode === "live" ? "live" : "live",
  });

  if (!config || config.mode !== "live") {
    throwTeamsError(
      "teams_provider_not_configured",
      "Live Microsoft Entra Graph configuration is missing",
      {
        teamsCode: "TEAMS_GRAPH_LIVE_CONFIG_MISSING",
        requiredNames: [
          "PI_TEAMS_GRAPH_MODE=live",
          "PI_TEAMS_TENANT_ID",
          "PI_TEAMS_CLIENT_ID",
          "PI_TEAMS_CLIENT_SECRET",
          "PI_TEAMS_WEBHOOK_CLIENT_STATE",
        ],
      },
    );
  }

  if ((env.PI_TEAMS_LIVE_CERT_ENABLED ?? "").trim().toLowerCase() !== "true") {
    throwTeamsError(
      "teams_provider_not_configured",
      "PI_TEAMS_LIVE_CERT_ENABLED must be true for live certification",
      {
        teamsCode: "TEAMS_GRAPH_LIVE_CONFIG_MISSING",
        reason: "live_cert_not_enabled",
      },
    );
  }

  return { ...config, mode: "live", liveCertEnabled: true };
}

export function assertLiveGraphModeOrThrow(config: MicrosoftGraphConfig): void {
  if (config.mode !== "live") {
    throwTeamsError(
      "teams_provider_not_configured",
      "Silent fixture fallback is forbidden during live certification",
      { teamsCode: "TEAMS_GRAPH_LIVE_CONFIG_MISSING", graphMode: config.mode },
    );
  }
}

export function liveConfigPresence(env: NodeJS.ProcessEnv = process.env): {
  mode: string;
  liveCertEnabled: boolean;
  namesPresent: string[];
  namesMissing: string[];
} {
  const required = [
    "PI_TEAMS_GRAPH_MODE",
    "PI_TEAMS_TENANT_ID",
    "PI_TEAMS_CLIENT_ID",
    "PI_TEAMS_CLIENT_SECRET",
    "PI_TEAMS_WEBHOOK_CLIENT_STATE",
    "PI_TEAMS_LIVE_CERT_ENABLED",
  ] as const;
  const namesPresent: string[] = [];
  const namesMissing: string[] = [];
  for (const name of required) {
    // Presence-only: never log values. For aliases also check MICROSOFT_* equivalents.
    const present =
      Boolean(env[name]?.trim()) ||
      (name === "PI_TEAMS_TENANT_ID" && Boolean(env.MICROSOFT_TENANT_ID?.trim())) ||
      (name === "PI_TEAMS_CLIENT_ID" && Boolean(env.MICROSOFT_CLIENT_ID?.trim())) ||
      (name === "PI_TEAMS_CLIENT_SECRET" && Boolean(env.MICROSOFT_CLIENT_SECRET?.trim())) ||
      (name === "PI_TEAMS_WEBHOOK_CLIENT_STATE" &&
        Boolean(env.MICROSOFT_GRAPH_WEBHOOK_SECRET?.trim()));
    if (present) namesPresent.push(name);
    else namesMissing.push(name);
  }
  return {
    mode: (env.PI_TEAMS_GRAPH_MODE ?? "").trim() || "unset",
    liveCertEnabled: (env.PI_TEAMS_LIVE_CERT_ENABLED ?? "").trim().toLowerCase() === "true",
    namesPresent,
    namesMissing,
  };
}

export function redactMicrosoftTenantId(tenantId: string): string {
  if (tenantId.length <= 8) return "***";
  return `${tenantId.slice(0, 4)}…${tenantId.slice(-4)}`;
}

export function hashClientState(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export type CachedToken = {
  accessToken: string;
  expiresAtMs: number;
  scopes: string[];
};

export class MicrosoftGraphTokenService {
  private cache: CachedToken | null = null;
  private consecutiveFailures = 0;
  private circuitOpenUntilMs = 0;

  constructor(
    private readonly config: MicrosoftGraphConfig,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  health(): {
    configured: boolean;
    mode: "live" | "fixture";
    tokenCached: boolean;
    circuitOpen: boolean;
    consecutiveFailures: number;
  } {
    return {
      configured: true,
      mode: this.config.mode,
      tokenCached: Boolean(this.cache && this.cache.expiresAtMs > Date.now() + 30_000),
      circuitOpen: Date.now() < this.circuitOpenUntilMs,
      consecutiveFailures: this.consecutiveFailures,
    };
  }

  revokeCache(): void {
    this.cache = null;
  }

  async getAccessToken(correlationId: string): Promise<string> {
    if (Date.now() < this.circuitOpenUntilMs) {
      const err = new Error("teams_rate_limited");
      (err as Error & { code: string }).code = "teams_rate_limited";
      throw err;
    }

    if (this.cache && this.cache.expiresAtMs > Date.now() + 60_000) {
      return this.cache.accessToken;
    }

    if (this.config.mode === "fixture") {
      const token = `fixture-token:${correlationId.slice(0, 8)}`;
      this.cache = {
        accessToken: token,
        expiresAtMs: Date.now() + 3_600_000,
        scopes: ["https://graph.microsoft.com/.default"],
      };
      this.consecutiveFailures = 0;
      return token;
    }

    const tokenUrl = `https://login.microsoftonline.com/${encodeURIComponent(this.config.tenantId)}/oauth2/v2.0/token`;
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const body = new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          scope: "https://graph.microsoft.com/.default",
          grant_type: "client_credentials",
        });
        const response = await this.fetchImpl(tokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "client-request-id": correlationId,
          },
          body,
        });
        if (response.status === 429) {
          const retryAfter = Number(response.headers.get("Retry-After") ?? "5");
          this.consecutiveFailures += 1;
          this.circuitOpenUntilMs = Date.now() + Math.min(Math.max(retryAfter, 1), 60) * 1000;
          await new Promise((r) => setTimeout(r, Math.min(retryAfter, 5) * 1000));
          continue;
        }
        if (!response.ok) {
          this.consecutiveFailures += 1;
          if (this.consecutiveFailures >= 5) {
            this.circuitOpenUntilMs = Date.now() + 30_000;
          }
          // 401/403 from token endpoint often means consent or secret issues
          if (response.status === 400 || response.status === 401) {
            const err = new Error("teams_provider_auth_failed");
            (err as Error & { code: string }).code = "teams_provider_auth_failed";
            throw err;
          }
          const err = new Error("teams_provider_auth_failed");
          (err as Error & { code: string }).code = "teams_provider_auth_failed";
          throw err;
        }
        const json = (await response.json()) as {
          access_token?: string;
          expires_in?: number;
        };
        if (!json.access_token) {
          const err = new Error("teams_provider_auth_failed");
          (err as Error & { code: string }).code = "teams_provider_auth_failed";
          throw err;
        }
        this.cache = {
          accessToken: json.access_token,
          expiresAtMs: Date.now() + Math.max(30, Number(json.expires_in ?? 3600) - 60) * 1000,
          scopes: ["https://graph.microsoft.com/.default"],
        };
        this.consecutiveFailures = 0;
        return json.access_token;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError instanceof Error ? lastError : new Error("teams_provider_auth_failed");
  }
}

export type TeamsLiveErrorCode =
  | "TEAMS_GRAPH_LIVE_CONFIG_MISSING"
  | "TEAMS_GRAPH_ADMIN_CONSENT_REQUIRED";

export function toTeamsLiveErrorCode(details?: Record<string, unknown>): TeamsLiveErrorCode | null {
  const code = details?.teamsCode;
  if (code === "TEAMS_GRAPH_LIVE_CONFIG_MISSING" || code === "TEAMS_GRAPH_ADMIN_CONSENT_REQUIRED") {
    return code;
  }
  return null;
}

export type { TeamsErrorCode };
