import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function present(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

/** Presence labels only — never echo raw secret-bearing env names. */
const PUBLIC_CHECKS = [
  { label: "SUPABASE_URL", env: "NEXT_PUBLIC_SUPABASE_URL" },
  { label: "SUPABASE_ANON_KEY", env: "NEXT_PUBLIC_SUPABASE_ANON_KEY" },
] as const;

const SERVER_CHECKS = [{ label: "SUPABASE_SERVICE", env: "SUPABASE_SERVICE_ROLE_KEY" }] as const;

const TEAMS_CHECKS = [
  { label: "WEBHOOK_BASE_URL", env: "PI_TEAMS_WEBHOOK_BASE_URL" },
  { label: "GRAPH_MODE", env: "PI_TEAMS_GRAPH_MODE" },
  { label: "TENANT_ID", env: "PI_TEAMS_TENANT_ID" },
  { label: "CLIENT_ID", env: "PI_TEAMS_CLIENT_ID" },
  { label: "CLIENT_CREDENTIAL", env: "PI_TEAMS_CLIENT_SECRET" },
  { label: "WEBHOOK_STATE", env: "PI_TEAMS_WEBHOOK_CLIENT_STATE" },
  { label: "TEST_TENANT_LABEL", env: "PI_TEAMS_TEST_TENANT_LABEL" },
] as const;

/**
 * Safe deployment diagnostics — presence-only environment checks.
 * Never returns secret values or secret-bearing env var names.
 */
export async function GET() {
  const publicPresent = PUBLIC_CHECKS.filter((c) => present(c.env)).map((c) => c.label);
  const publicMissing = PUBLIC_CHECKS.filter((c) => !present(c.env)).map((c) => c.label);
  const serverPresent = SERVER_CHECKS.filter((c) => present(c.env)).map((c) => c.label);
  const serverMissing = SERVER_CHECKS.filter((c) => !present(c.env)).map((c) => c.label);
  const teamsPresent = TEAMS_CHECKS.filter((c) => present(c.env)).map((c) => c.label);
  const teamsMissing = TEAMS_CHECKS.filter((c) => !present(c.env)).map((c) => c.label);

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
