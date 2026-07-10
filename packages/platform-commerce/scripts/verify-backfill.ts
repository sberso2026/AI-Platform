/**
 * Verifies Commerce Phase 2 legacy tenant backfill per COMMERCE_PHASE_2_BACKFILL.md.
 * Safe logging — tenant slug only, no user PII. Exit 0 pass, 1 fail.
 * Writes JSON report to artifacts/commerce-backfill-verification.json
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ENGINEERING_PRODUCT_ID = "c1000000-0000-4000-8000-000000000001";
const LEGACY_SOURCE = "migration_legacy_access";
const EXPECTED_SEAT_POOL = 100;
const CERT_SLUG_PREFIX = "cert-commerce-";
const CERT_ORPHAN_SLUG = /^cert-[ab]-/;

interface TenantRow {
  id: string;
  slug: string;
  status: string;
  settings?: Record<string, unknown> | null;
}

function isCertificationTenant(tenant: TenantRow): boolean {
  if (tenant.slug?.startsWith(CERT_SLUG_PREFIX)) return true;
  if (CERT_ORPHAN_SLUG.test(tenant.slug ?? "")) return true;
  if (tenant.settings?.cert_fixture === true) return true;
  return false;
}

interface TenantReport {
  slug: string;
  subscriptionStatus?: string;
  appLicences: number;
  seatTotal: number;
  issues: string[];
}

interface BackfillReport {
  verifiedAt: string;
  environment: string;
  tenantCount: number;
  result: "PASS" | "FAIL";
  failures: string[];
  tenants: TenantReport[];
}

function log(msg: string): void {
  console.log(`[commerce:verify-backfill] ${msg}`);
}

function logError(msg: string): void {
  console.error(`[commerce:verify-backfill] FAIL: ${msg}`);
}

function createServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    logError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
    process.exit(1);
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function main(): Promise<void> {
  const supabase = createServiceClient();
  const failures: string[] = [];
  const tenantReports: TenantReport[] = [];

  const { data: tenants, error: tenantError } = await supabase
    .from("tenants")
    .select("id, slug, status, settings")
    .eq("status", "active");

  if (tenantError || !tenants) {
    logError(`Unable to load tenants: ${tenantError?.message ?? "unknown"}`);
    process.exit(1);
  }

  const legacyTenants = (tenants as TenantRow[]).filter((tenant) => !isCertificationTenant(tenant));
  log(`Checking ${legacyTenants.length} legacy tenant(s) (${tenants.length - legacyTenants.length} cert fixture(s) skipped)`);

  for (const tenant of legacyTenants) {
    const label = tenant.slug || tenant.id.slice(0, 8);
    const tenantIssues: string[] = [];

    const { data: subscriptions } = await supabase
      .from("commercial_subscriptions")
      .select("id, status, metadata")
      .eq("tenant_id", tenant.id)
      .eq("product_id", ENGINEERING_PRODUCT_ID)
      .is("deleted_at", null);

    const subs = subscriptions ?? [];

    if (subs.length > 1) {
      const msg = `${label}: idempotency violation — ${subs.length} Engineering OS subscriptions`;
      failures.push(msg);
      tenantIssues.push(msg);
      tenantReports.push({ slug: label, appLicences: 0, seatTotal: 0, issues: tenantIssues });
      continue;
    }

    if (subs.length === 0) {
      const msg = `${label}: missing Engineering OS subscription`;
      failures.push(msg);
      tenantIssues.push(msg);
      tenantReports.push({ slug: label, appLicences: 0, seatTotal: 0, issues: tenantIssues });
      continue;
    }

    const sub = subs[0]!;
    const metadata = (sub.metadata ?? {}) as Record<string, unknown>;
    const isLegacy = metadata.source === LEGACY_SOURCE;

    if (sub.status !== "active") {
      const msg = `${label}: subscription status is ${sub.status}, expected active`;
      failures.push(msg);
      tenantIssues.push(msg);
    }

    const { count: productLicences } = await supabase
      .from("commercial_licenses")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenant.id)
      .eq("subscription_id", sub.id)
      .eq("license_type", "product")
      .eq("status", "active")
      .is("deleted_at", null);

    if (!productLicences) {
      failures.push(`${label}: missing active product licence`);
    }

    const { data: productApps } = await supabase
      .from("commercial_product_applications")
      .select("application_key")
      .eq("product_id", ENGINEERING_PRODUCT_ID)
      .is("deleted_at", null);

    const { data: appLicences } = await supabase
      .from("commercial_licenses")
      .select("application_key")
      .eq("tenant_id", tenant.id)
      .eq("subscription_id", sub.id)
      .eq("license_type", "application")
      .eq("status", "active")
      .is("deleted_at", null);

    const appKeys = new Set((appLicences ?? []).map((l) => l.application_key));
    for (const app of productApps ?? []) {
      if (!appKeys.has(app.application_key)) {
        failures.push(`${label}: missing application licence for ${app.application_key}`);
      }
    }

    const { data: seatPools } = await supabase
      .from("commercial_seats")
      .select("id, total_seats")
      .eq("tenant_id", tenant.id)
      .eq("product_id", ENGINEERING_PRODUCT_ID)
      .is("deleted_at", null);

    if (!seatPools?.length) {
      failures.push(`${label}: missing seat pool`);
    } else if (isLegacy && seatPools[0]!.total_seats !== EXPECTED_SEAT_POOL) {
      failures.push(
        `${label}: legacy seat pool total_seats=${seatPools[0]!.total_seats}, expected ${EXPECTED_SEAT_POOL}`
      );
    }

    const poolId = seatPools?.[0]?.id;
    if (poolId) {
      const { count: activeMembers } = await supabase
        .from("tenant_memberships")
        .select("user_id", { count: "exact", head: true })
        .eq("tenant_id", tenant.id)
        .eq("status", "active");

      const { count: activeAssignments } = await supabase
        .from("commercial_seat_assignments")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenant.id)
        .eq("seat_pool_id", poolId)
        .eq("status", "active")
        .is("deleted_at", null);

      if (activeMembers !== null && activeAssignments !== null && activeAssignments < activeMembers) {
        failures.push(
          `${label}: seat assignments (${activeAssignments}) < active members (${activeMembers})`
        );
      }
    }

    const { count: activatedEvents } = await supabase
      .from("commercial_subscription_events")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenant.id)
      .eq("subscription_id", sub.id)
      .eq("event_type", "subscription.activated");

    if (!activatedEvents) {
      failures.push(`${label}: missing subscription.activated event`);
    }

    const { count: planEntitlements } = await supabase
      .from("commercial_plan_entitlements")
      .select("id", { count: "exact", head: true })
      .eq("entitlement_type", "product_access")
      .eq("entitlement_key", "engineering-os")
      .is("deleted_at", null);

    if (!planEntitlements) {
      failures.push(`${label}: engineering-os plan entitlement missing from catalog`);
    }

    log(`${label}: subscription=${sub.status}, licences=${appKeys.size} apps, seats=${seatPools?.[0]?.total_seats ?? 0}`);

    tenantReports.push({
      slug: label,
      subscriptionStatus: sub.status,
      appLicences: appKeys.size,
      seatTotal: seatPools?.[0]?.total_seats ?? 0,
      issues: tenantIssues,
    });
  }

  const report: BackfillReport = {
    verifiedAt: new Date().toISOString(),
    environment: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "unknown",
    tenantCount: legacyTenants.length,
    result: failures.length > 0 ? "FAIL" : "PASS",
    failures,
    tenants: tenantReports,
  };

  const artifactsDir = resolve(process.cwd(), "artifacts");
  mkdirSync(artifactsDir, { recursive: true });
  const reportPath = resolve(artifactsDir, "commerce-backfill-verification.json");
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`Wrote ${reportPath}`);

  if (failures.length > 0) {
    for (const f of failures) logError(f);
    log(`Result: FAIL (${failures.length} issue(s))`);
    process.exit(1);
  }

  log(`Result: PASS (${legacyTenants.length} legacy tenant(s) verified)`);
  process.exit(0);
}

main().catch((err) => {
  logError(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
