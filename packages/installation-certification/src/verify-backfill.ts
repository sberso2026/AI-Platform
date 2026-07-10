/**
 * Verifies Batch 32 installation backfill for legacy entitled tenants.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

import { CERT_SLUG_PREFIX, ENGINEERING_PRODUCT_ID, isCertificationMode } from "./lib/env.js";

interface TenantRow {
  id: string;
  slug: string;
  status: string;
  settings?: Record<string, unknown> | null;
}

interface TenantReport {
  slug: string;
  subscriptionStatus?: string;
  hasInstallation: boolean;
  installationStatus?: string;
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

function isCertificationTenant(tenant: TenantRow): boolean {
  if (tenant.slug?.startsWith(CERT_SLUG_PREFIX)) return true;
  if (tenant.slug?.startsWith("cert-commerce-")) return true;
  if (tenant.settings?.cert_fixture === true) return true;
  return false;
}

function log(msg: string): void {
  console.log(`[installation:verify-backfill] ${msg}`);
}

function logError(msg: string): void {
  console.error(`[installation:verify-backfill] FAIL: ${msg}`);
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

export async function verifyInstallationBackfill(): Promise<{ ok: boolean; failures: string[] }> {
  const supabase = createServiceClient();
  const failures: string[] = [];
  const tenantReports: TenantReport[] = [];

  const { data: tenants, error: tenantError } = await supabase
    .from("tenants")
    .select("id, slug, status, settings")
    .eq("status", "active");

  if (tenantError || !tenants) {
    return { ok: false, failures: [`Unable to load tenants: ${tenantError?.message ?? "unknown"}`] };
  }

  const legacyTenants = (tenants as TenantRow[]).filter((t) => !isCertificationTenant(t));
  log(
    `Checking ${legacyTenants.length} legacy tenant(s) (${tenants.length - legacyTenants.length} cert fixture(s) skipped)`
  );

  for (const tenant of legacyTenants) {
    const label = tenant.slug || tenant.id.slice(0, 8);
    const tenantIssues: string[] = [];

    const { data: subscriptions } = await supabase
      .from("commercial_subscriptions")
      .select("id, status")
      .eq("tenant_id", tenant.id)
      .eq("product_id", ENGINEERING_PRODUCT_ID)
      .in("status", ["active", "trial", "trialing", "grace_period", "scheduled_cancellation"])
      .is("deleted_at", null);

    const activeSub = (subscriptions ?? [])[0];
    if (!activeSub) {
      tenantReports.push({
        slug: label,
        hasInstallation: false,
        issues: [],
      });
      continue;
    }

    const { data: productLicence } = await supabase
      .from("commercial_licenses")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("subscription_id", activeSub.id)
      .eq("license_type", "product")
      .eq("status", "active")
      .is("deleted_at", null)
      .maybeSingle();

    if (!productLicence?.id) {
      tenantReports.push({
        slug: label,
        subscriptionStatus: activeSub.status as string,
        hasInstallation: false,
        issues: [],
      });
      continue;
    }

    const { data: installation } = await supabase
      .from("commercial_installations")
      .select("id, status")
      .eq("tenant_id", tenant.id)
      .eq("product_id", ENGINEERING_PRODUCT_ID)
      .is("deleted_at", null)
      .maybeSingle();

    const hasInstallation = Boolean(installation?.id);
    if (!hasInstallation) {
      const msg = `${label}: entitled tenant missing product installation row`;
      failures.push(msg);
      tenantIssues.push(msg);
    }

    tenantReports.push({
      slug: label,
      subscriptionStatus: activeSub.status as string,
      hasInstallation,
      installationStatus: installation?.status as string | undefined,
      issues: tenantIssues,
    });

    if (hasInstallation) {
      log(
        `${label}: subscription=${activeSub.status}, installation=${installation?.status ?? "unknown"}`
      );
    }
  }

  const report: BackfillReport = {
    verifiedAt: new Date().toISOString(),
    environment: process.env.SUPABASE_URL ?? "unknown",
    tenantCount: legacyTenants.length,
    result: failures.length === 0 ? "PASS" : "FAIL",
    failures,
    tenants: tenantReports,
  };

  const outDir = resolve(process.cwd(), "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "installation-backfill-verification.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  log(`Wrote ${outPath}`);
  log(`Result: ${report.result} (${legacyTenants.length} legacy tenant(s) verified)`);

  return { ok: failures.length === 0, failures };
}

async function main(): Promise<void> {
  if (!process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    if (isCertificationMode()) {
      logError("SUPABASE_URL not configured");
      process.exit(1);
    }
    log("SKIP: SUPABASE_URL not configured");
    process.exit(0);
  }

  const result = await verifyInstallationBackfill();
  if (!result.ok) {
    for (const f of result.failures) logError(f);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  logError(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
