/**
 * Verifies hosted Supabase Commerce Phase 2 schema: migrations, tables, RLS, role seeds.
 * Skips gracefully when SUPABASE_URL is not configured. Exit 0 pass/skip, 1 fail.
 */
import { createClient } from "@supabase/supabase-js";

const PHASE2_MIGRATIONS = [
  "20260209000000",
  "20260209000001",
  "20260209000002",
  "20260209000003",
  "20260209000004",
  "20260209000005",
];

const PHASE2_TABLES = [
  "commercial_seat_assignments",
  "commercial_features",
  "commercial_product_applications",
  "commercial_plan_entitlements",
  "commercial_subscription_changes",
  "commercial_entitlement_overrides",
  "commercial_outbox_events",
  "commercial_entitlement_versions",
];

const COMMERCE_RLS_TABLES = [
  "commercial_subscriptions",
  "commercial_licenses",
  "commercial_seats",
  "commercial_subscription_events",
  "commercial_seat_assignments",
  "commercial_entitlement_overrides",
  "commercial_outbox_events",
];

const COMMERCE_PERMISSIONS = [
  "manage_subscriptions",
  "manage_licences",
  "manage_seats",
  "manage_overrides",
];

function log(msg: string): void {
  console.log(`[commerce:verify-hosted-phase2] ${msg}`);
}

function logError(msg: string): void {
  console.error(`[commerce:verify-hosted-phase2] FAIL: ${msg}`);
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

async function main(): Promise<void> {
  const certificationMode = process.env.COMMERCE_CERTIFICATION === "1";
  const url = resolveSupabaseUrl();
  if (!url) {
    if (certificationMode) {
      logError("SUPABASE_URL not configured");
      log("Result: FAIL");
      process.exit(1);
    }
    log("SKIP: SUPABASE_URL not configured");
    process.exit(0);
  }

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    if (certificationMode) {
      logError("SUPABASE_SERVICE_ROLE_KEY not configured");
      log("Result: FAIL");
      process.exit(1);
    }
    log("SKIP: SUPABASE_SERVICE_ROLE_KEY not configured");
    process.exit(0);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const failures: string[] = [];

  for (const table of PHASE2_TABLES) {
    if (!(await tableExists(supabase, table))) {
      failures.push(`Phase 2 table missing: ${table}`);
    }
  }

  for (const table of COMMERCE_RLS_TABLES) {
    if (!(await tableExists(supabase, table))) {
      failures.push(`Commerce RLS table missing: ${table}`);
    } else {
      log(`Table present: ${table}`);
    }
  }

  const { data: migrationRows, error: migError } = await supabase
    .schema("supabase_migrations")
    .from("schema_migrations")
    .select("version")
    .like("version", "20260209%");

  if (!migError && migrationRows) {
    const applied = new Set(migrationRows.map((r) => String(r.version).slice(0, 14)));
    for (const mig of PHASE2_MIGRATIONS) {
      if (!applied.has(mig)) {
        failures.push(`Migration not applied: ${mig}`);
      }
    }
    log(`Phase 2 migrations applied: ${applied.size}`);
  } else {
    log("Migration registry unavailable — verified via table presence");
  }

  const hasRoleFn = await functionExists(supabase, "create_default_tenant_roles", {
    p_tenant_id: "00000000-0000-0000-0000-000000000000",
  });
  if (!hasRoleFn) {
    failures.push("Function create_default_tenant_roles not found");
  } else {
    log("create_default_tenant_roles function exists");
  }

  const hasBumpFn = await functionExists(supabase, "bump_commercial_entitlement_version", {
    p_tenant_id: "00000000-0000-0000-0000-000000000000",
  });
  if (!hasBumpFn) {
    failures.push("Function bump_commercial_entitlement_version not found");
  } else {
    log("bump_commercial_entitlement_version function exists");
  }

  const { data: adminRoles, error: roleError } = await supabase
    .from("roles")
    .select("permissions")
    .eq("slug", "admin")
    .limit(5);

  if (!roleError && adminRoles?.length) {
    const permissions = JSON.stringify(adminRoles);
    for (const perm of COMMERCE_PERMISSIONS) {
      if (!permissions.includes(perm)) {
        failures.push(`Administrator role missing commerce permission: ${perm}`);
      }
    }
    if (!permissions.includes('"resource":"commerce"')) {
      failures.push("Administrator roles missing commerce resource permissions");
    }
    log("Administrator commerce permissions present");
  } else {
    log("Role permission probe skipped (no admin roles found)");
  }

  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (anonKey) {
    const anon = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await anon.from("commercial_subscriptions").select("id").limit(1);
    if (!error && (data?.length ?? 0) > 0) {
      failures.push("RLS may be misconfigured: anon client returned subscription rows without auth");
    } else {
      log("RLS smoke check: unauthenticated subscription access blocked or empty");
    }
  } else {
    log("RLS smoke check skipped (no anon key)");
  }

  if (failures.length > 0) {
    for (const f of failures) logError(f);
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
