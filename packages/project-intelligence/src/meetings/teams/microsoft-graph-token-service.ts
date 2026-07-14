import { createHash } from "node:crypto";

export type MicrosoftGraphConfig = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  webhookSecret: string;
  notificationUrl: string | null;
  lifecycleNotificationUrl: string | null;
  mode: "live" | "fixture";
};

export function readMicrosoftGraphConfig(
  env: NodeJS.ProcessEnv = process.env,
): MicrosoftGraphConfig | null {
  const mode = (env.PI_TEAMS_GRAPH_MODE ?? "").trim().toLowerCase();
  if (mode === "fixture") {
    const webhookSecret =
      env.MICROSOFT_GRAPH_WEBHOOK_SECRET?.trim() || "fixture-webhook-client-state";
    return {
      tenantId: env.MICROSOFT_TENANT_ID?.trim() || "fixture-tenant",
      clientId: env.MICROSOFT_CLIENT_ID?.trim() || "fixture-client",
      clientSecret: env.MICROSOFT_CLIENT_SECRET?.trim() || "fixture-secret",
      webhookSecret,
      notificationUrl: env.MICROSOFT_GRAPH_NOTIFICATION_URL?.trim() || null,
      lifecycleNotificationUrl: env.MICROSOFT_GRAPH_LIFECYCLE_NOTIFICATION_URL?.trim() || null,
      mode: "fixture",
    };
  }

  const tenantId = env.MICROSOFT_TENANT_ID?.trim();
  const clientId = env.MICROSOFT_CLIENT_ID?.trim();
  const clientSecret = env.MICROSOFT_CLIENT_SECRET?.trim();
  const webhookSecret = env.MICROSOFT_GRAPH_WEBHOOK_SECRET?.trim();
  if (!tenantId || !clientId || !clientSecret || !webhookSecret) {
    return null;
  }
  return {
    tenantId,
    clientId,
    clientSecret,
    webhookSecret,
    notificationUrl: env.MICROSOFT_GRAPH_NOTIFICATION_URL?.trim() || null,
    lifecycleNotificationUrl: env.MICROSOFT_GRAPH_LIFECYCLE_NOTIFICATION_URL?.trim() || null,
    mode: mode === "live" ? "live" : "live",
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
