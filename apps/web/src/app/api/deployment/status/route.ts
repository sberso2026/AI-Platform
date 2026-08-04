import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function present(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

/**
 * Safe deployment diagnostics — presence-only environment checks.
 * Never returns secret values.
 */
export async function GET() {
  const requiredPublic = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;
  const requiredServer = ["SUPABASE_SERVICE_ROLE_KEY"] as const;
  const teamsRecommended = [
    "PI_TEAMS_WEBHOOK_BASE_URL",
    "PI_TEAMS_GRAPH_MODE",
    "PI_TEAMS_TENANT_ID",
    "PI_TEAMS_CLIENT_ID",
    "PI_TEAMS_CLIENT_SECRET",
    "PI_TEAMS_WEBHOOK_CLIENT_STATE",
    "PI_TEAMS_TEST_TENANT_LABEL",
  ] as const;

  const publicPresent = requiredPublic.filter((n) => present(n));
  const publicMissing = requiredPublic.filter((n) => !present(n));
  const serverPresent = requiredServer.filter((n) => present(n));
  const serverMissing = requiredServer.filter((n) => !present(n));
  const teamsPresent = teamsRecommended.filter((n) => present(n));
  const teamsMissing = teamsRecommended.filter((n) => !present(n));

  const graphMode = (process.env.PI_TEAMS_GRAPH_MODE ?? "").trim().toLowerCase() || "unset";
  const webhookBaseConfigured = present("PI_TEAMS_WEBHOOK_BASE_URL");

  const ok =
    publicMissing.length === 0 &&
    serverMissing.length === 0 &&
    Boolean(process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL);

  return NextResponse.json({
    ok,
    service: "rtb-ai-os",
    phase: "6C-3E.0",
    dns: {
      vercelUrlConfigured: Boolean(process.env.VERCEL_URL?.trim()),
      appUrlConfigured: Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim()),
    },
    https: {
      expected: true,
      vercelEnv: process.env.VERCEL_ENV ?? null,
    },
    webhook: {
      path: "/api/webhooks/microsoft-graph",
      baseUrlConfigured: webhookBaseConfigured,
      graphMode,
    },
    environment: {
      publicPresent,
      publicMissing,
      serverPresentNames: serverPresent,
      serverMissingNames: serverMissing,
      teamsPresentNames: teamsPresent,
      teamsMissingNames: teamsMissing,
    },
    timestamp: new Date().toISOString(),
  });
}
