/**
 * Phase 6C-3E — Live Entra / Graph authentication verification probe.
 * Verifies client_credentials configuration and prints structured AAD diagnostics.
 * Never logs secrets or access tokens.
 */
import { requireLiveMicrosoftGraphConfig } from "@rtb/project-intelligence";

const GRAPH_SCOPE = "https://graph.microsoft.com/.default";

type AadTokenErrorBody = {
  error?: string;
  error_description?: string;
  error_codes?: number[];
  timestamp?: string;
  trace_id?: string;
  correlation_id?: string;
};

function present(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

function assertSecretsLoaded(): void {
  const required = [
    "PI_TEAMS_TENANT_ID",
    "PI_TEAMS_CLIENT_ID",
    "PI_TEAMS_CLIENT_SECRET",
  ] as const;
  const missing = required.filter((name) => !present(name));
  for (const name of required) {
    console.log(`secret_loaded name=${name} present=${present(name) ? "true" : "false"}`);
  }
  if (missing.length) {
    throw new Error(`GitHub Actions secrets not loaded: ${missing.join(",")}`);
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractAadsts(description: string | undefined): string | null {
  if (!description) return null;
  const match = description.match(/AADSTS\d+/i);
  return match ? match[0].toUpperCase() : null;
}

async function main(): Promise<void> {
  assertSecretsLoaded();

  // Fail closed on fixture; require live certification env.
  const config = requireLiveMicrosoftGraphConfig(process.env);
  if (config.mode !== "live") {
    throw new Error("fixture fallback forbidden");
  }

  const tenantId = config.tenantId;
  const clientId = config.clientId;
  const tokenUrl = `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`;

  console.log(
    JSON.stringify({
      verification: "oauth_client_credentials",
      method: "POST",
      tokenUrlHost: "login.microsoftonline.com",
      tokenUrlPath: `/oauth2/v2.0/token`,
      tenantIdPresent: Boolean(tenantId),
      scope: GRAPH_SCOPE,
      grant_type: "client_credentials",
    }),
  );

  if (!tokenUrl.includes("/oauth2/v2.0/token") || !tokenUrl.includes("login.microsoftonline.com")) {
    throw new Error("token endpoint shape mismatch");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: config.clientSecret,
    scope: GRAPH_SCOPE,
    grant_type: "client_credentials",
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "client-request-id": "ci-auth-verify",
    },
    body,
  });

  const rawText = await response.text();
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(rawText) as Record<string, unknown>;
  } catch {
    parsed = {};
  }

  if (!response.ok) {
    const errBody = parsed as AadTokenErrorBody;
    const diagnostics = {
      ok: false,
      httpStatus: response.status,
      aadsts: extractAadsts(errBody.error_description) ?? null,
      error: errBody.error ?? null,
      error_description: errBody.error_description ?? rawText.slice(0, 2000),
      error_codes: errBody.error_codes ?? null,
      trace_id: errBody.trace_id ?? null,
      correlation_id: errBody.correlation_id ?? null,
      timestamp: errBody.timestamp ?? new Date().toISOString(),
    };
    console.error(JSON.stringify(diagnostics, null, 2));
    process.exit(1);
  }

  const accessToken = typeof parsed.access_token === "string" ? parsed.access_token : "";
  if (!accessToken || accessToken.startsWith("fixture-token:")) {
    console.error(
      JSON.stringify({
        ok: false,
        httpStatus: response.status,
        error: "missing_access_token",
        error_description: "Token endpoint returned success without access_token",
        timestamp: new Date().toISOString(),
      }),
    );
    process.exit(1);
  }

  const claims = decodeJwtPayload(accessToken);
  const audience = claims?.aud ?? null;
  const roles = claims?.roles ?? null;
  const scp = claims?.scp ?? null;
  const tokenTenant = claims?.tid ?? tenantId;

  console.log(
    JSON.stringify({
      ok: true,
      live_token_acquired: true,
      tenantId: tokenTenant,
      appId: clientId,
      tokenAudience: audience,
      grantedRoles: roles,
      grantedScopes: scp,
      expiresIn: parsed.expires_in ?? null,
      tokenEndpoint: "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token",
      scope: GRAPH_SCOPE,
      timestamp: new Date().toISOString(),
    }),
  );
}

main().catch((error: unknown) => {
  console.error(
    JSON.stringify({
      ok: false,
      error: "probe_execution_failed",
      error_description: error instanceof Error ? error.message : "Certification step failed",
      timestamp: new Date().toISOString(),
    }),
  );
  process.exit(1);
});
