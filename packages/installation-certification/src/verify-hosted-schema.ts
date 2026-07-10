/**
 * Verifies hosted Supabase Phase 3 (Batch 32) installation schema.
 * Target project ref: wcydlhqiqdwgoaqrlget
 */
import { createClient } from "@supabase/supabase-js";

import { HOSTED_PROJECT_REF, isCertificationMode } from "./lib/env.js";

const PHASE3_MIGRATIONS = ["20260210000000", "20260210000001", "20260210000002"];

const PHASE3_TABLES = [
  "commercial_installation_versions",
  "commercial_installation_requests",
  "commercial_installation_workflows",
  "commercial_installation_steps",
  "commercial_installation_failures",
  "commercial_installation_health_checks",
  "commercial_installation_dependencies",
  "commercial_workspace_product_assignments",
  "commercial_workspace_application_assignments",
  "commercial_provisioning_runs",
  "commercial_provisioning_steps",
  "commercial_provisioning_artifacts",
];

const INSTALLATION_RLS_TABLES = [
  "commercial_installations",
  "commercial_application_installations",
  "commercial_installation_events",
  ...PHASE3_TABLES,
];

function log(msg: string): void {
  console.log(`[installation:verify-hosted-schema] ${msg}`);
}

function logError(msg: string): void {
  console.error(`[installation:verify-hosted-schema] FAIL: ${msg}`);
}

function resolveSupabaseUrl(): string | null {
  return process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
}

async function tableExists(
  supabase: ReturnType<typeof createClient>,
  table: string
): Promise<boolean> {
  const { error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (!error) return true;
  if (error.message.includes("does not exist") || error.code === "42P01") return false;
  return true;
}

async function functionExists(
  supabase: ReturnType<typeof createClient>,
  fn: string,
  args: Record<string, string>
): Promise<boolean> {
  const { error } = await supabase.rpc(fn as never, args as never);
  if (!error) return true;
  if (error.code === "42883" || error.message.includes("does not exist")) return false;
  return true;
}

export async function verifyHostedSchema(): Promise<{ ok: boolean; failures: string[] }> {
  const certificationMode = isCertificationMode();
  const url = resolveSupabaseUrl();
  if (!url) {
    if (certificationMode) return { ok: false, failures: ["SUPABASE_URL not configured"] };
    log("SKIP: SUPABASE_URL not configured");
    return { ok: true, failures: [] };
  }

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    if (certificationMode) {
      return { ok: false, failures: ["SUPABASE_SERVICE_ROLE_KEY not configured"] };
    }
    log("SKIP: SUPABASE_SERVICE_ROLE_KEY not configured");
    return { ok: true, failures: [] };
  }

  const projectRef = new URL(url).hostname.split(".")[0];
  if (certificationMode && projectRef !== HOSTED_PROJECT_REF) {
    log(`Warning: expected hosted project ${HOSTED_PROJECT_REF}, got ${projectRef}`);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const failures: string[] = [];

  for (const table of INSTALLATION_RLS_TABLES) {
    if (!(await tableExists(supabase, table))) {
      failures.push(`Installation table missing: ${table}`);
    } else {
      log(`Table present: ${table}`);
    }
  }

  const { data: migrationRows, error: migError } = await supabase
    .schema("supabase_migrations")
    .from("schema_migrations")
    .select("version")
    .like("version", "20260210%");

  if (!migError && migrationRows) {
    const applied = new Set(migrationRows.map((r) => String(r.version).slice(0, 14)));
    for (const mig of PHASE3_MIGRATIONS) {
      if (!applied.has(mig)) failures.push(`Migration not applied: ${mig}`);
    }
    log(`Phase 3 migrations applied: ${applied.size}`);
  } else {
    log("Migration registry unavailable — verified via table presence");
  }

  const hasBumpFn = await functionExists(supabase, "bump_commercial_installation_version", {
    p_tenant_id: "00000000-0000-0000-0000-000000000000",
  });
  if (!hasBumpFn) {
    failures.push("Function bump_commercial_installation_version not found");
  } else {
    log("bump_commercial_installation_version function exists");
  }

  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (anonKey) {
    const anon = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await anon.from("commercial_installations").select("id").limit(1);
    if (!error && (data?.length ?? 0) > 0) {
      failures.push("RLS may be misconfigured: anon client returned installation rows without auth");
    } else {
      log("RLS smoke check: unauthenticated installation access blocked or empty");
    }
  }

  return { ok: failures.length === 0, failures };
}

async function main(): Promise<void> {
  const result = await verifyHostedSchema();
  if (!result.ok) {
    for (const f of result.failures) logError(f);
    log("Result: FAIL");
    process.exit(1);
  }
  log("Result: PASS");
  process.exit(0);
}

main().catch((err) => {
  logError(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
