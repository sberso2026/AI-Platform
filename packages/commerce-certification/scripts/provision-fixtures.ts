/**
 * Provisions Tenant A/B certification fixtures with commerce subscriptions, licences, seats.
 * Writes artifacts/cert-fixtures.json. Tags tenants with slug prefix cert-commerce-
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";

import {
  assertProvisionEnv,
  CERT_SLUG_PREFIX,
  certUserPassword,
  ENGINEERING_PLAN_ID,
  ENGINEERING_PRODUCT_ID,
  fixturesManifestPath,
  resolveSupabaseAnonKey,
  resolveServiceRoleKey,
  resolveSupabaseUrl,
  type CertFixturesManifest,
  type CertTenantFixture,
  type CertUserFixture,
} from "../src/lib/env.js";

const ROLES = ["owner", "admin", "engineer", "viewer"] as const;
type RoleSlug = (typeof ROLES)[number] | "unassigned";

function log(msg: string): void {
  console.log(`[commerce:provision] ${msg}`);
}

function roleSlugForMembership(role: RoleSlug): string {
  if (role === "unassigned") return "engineer";
  return role;
}

async function signInJwt(
  url: string,
  anonKey: string,
  email: string,
  password: string
): Promise<string> {
  const anon = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token) {
    throw new Error(`JWT sign-in failed for ${email}: ${error?.message}`);
  }
  return data.session.access_token;
}

async function removeOrphanMemberships(
  admin: ReturnType<typeof createClient>,
  userId: string,
  keepTenantId: string
): Promise<string[]> {
  const removed: string[] = [];
  const { data: memberships } = await admin
    .from("tenant_memberships")
    .select("tenant_id")
    .eq("user_id", userId)
    .eq("status", "active");

  for (const row of memberships ?? []) {
    const tid = row.tenant_id as string;
    if (tid === keepTenantId) continue;
    await admin.from("tenant_memberships").delete().eq("user_id", userId).eq("tenant_id", tid);
    const { count } = await admin
      .from("tenant_memberships")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tid);
    if (!count) {
      await admin.from("tenants").delete().eq("id", tid);
      removed.push(tid);
    }
  }
  return removed;
}

async function createCertUser(
  admin: ReturnType<typeof createClient>,
  email: string,
  password: string
): Promise<string> {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: email.split("@")[0], cert_fixture: true },
  });
  if (error || !data.user?.id) {
    throw new Error(`createUser failed for ${email}: ${error?.message}`);
  }
  return data.user.id;
}

async function findOrphanTenantForUser(
  admin: ReturnType<typeof createClient>,
  userId: string,
  excludeTenantIds: string[]
): Promise<string | null> {
  const { data } = await admin
    .from("tenant_memberships")
    .select("tenant_id, tenants!inner(slug)")
    .eq("user_id", userId)
    .eq("status", "active");

  for (const row of data ?? []) {
    const tenantId = row.tenant_id as string;
    const slug = (row.tenants as { slug: string }).slug;
    if (!excludeTenantIds.includes(tenantId) && !slug.startsWith(CERT_SLUG_PREFIX)) {
      return tenantId;
    }
  }
  return null;
}

async function provisionTenant(
  admin: ReturnType<typeof createClient>,
  label: "a" | "b",
  runId: string,
  url: string,
  anonKey: string,
  password: string
): Promise<{ tenant: CertTenantFixture; orphanTenantIds: string[] }> {
  const slug = `${CERT_SLUG_PREFIX}${label}-${runId}`;
  const orphanTenantIds: string[] = [];

  const { data: tenantRow, error: tenantError } = await admin
    .from("tenants")
    .insert({
      name: `Cert Commerce Tenant ${label.toUpperCase()}`,
      slug,
      status: "active",
      settings: { cert_fixture: true, run_id: runId },
    })
    .select("id")
    .single();

  if (tenantError || !tenantRow) {
    throw new Error(`tenant create failed: ${tenantError?.message}`);
  }

  const tenantId = tenantRow.id as string;
  await admin.rpc("create_default_tenant_roles", { p_tenant_id: tenantId });

  const workspaces: CertTenantFixture["workspaces"] = [];
  for (const wsSlug of ["alpha", "beta"]) {
    const { data: ws } = await admin
      .from("workspaces")
      .insert({
        tenant_id: tenantId,
        name: `Cert ${wsSlug}`,
        slug: wsSlug,
        status: "active",
      })
      .select("id, slug")
      .single();
    if (ws) workspaces.push({ id: ws.id as string, slug: ws.slug as string });
  }

  const users: Record<string, CertUserFixture> = {};
  const roleIds: Record<string, string> = {};

  for (const role of [...ROLES, "unassigned"] as RoleSlug[]) {
    const email = `cert-${label}-${role}-${runId}@rtb-cert.test`;
    const userId = await createCertUser(admin, email, password);
    const orphan = await findOrphanTenantForUser(admin, userId, [tenantId]);
    if (orphan) orphanTenantIds.push(orphan);

    const membershipRole = roleSlugForMembership(role);
    const { data: roleRow } = await admin
      .from("roles")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("slug", membershipRole)
      .single();

    if (!roleRow?.id) throw new Error(`role ${membershipRole} missing for ${slug}`);
    roleIds[role] = roleRow.id as string;

    await admin.from("tenant_memberships").upsert({
      tenant_id: tenantId,
      user_id: userId,
      role_id: roleRow.id,
      status: "active",
      joined_at: new Date().toISOString(),
    });

    const removed = await removeOrphanMemberships(admin, userId, tenantId);
    orphanTenantIds.push(...removed);

    const jwt = await signInJwt(url, anonKey, email, password);
    users[role] = {
      userId,
      email,
      role,
      jwt,
      hasSeat: role !== "unassigned" && role !== "viewer",
    };
  }

  const { data: billing } = await admin
    .from("commercial_billing_accounts")
    .insert({
      tenant_id: tenantId,
      name: `Cert Billing ${label}`,
      is_default: true,
    })
    .select("id")
    .single();

  const billingAccountId = billing?.id as string;

  const { data: activeSub } = await admin
    .from("commercial_subscriptions")
    .insert({
      tenant_id: tenantId,
      product_id: ENGINEERING_PRODUCT_ID,
      plan_id: ENGINEERING_PLAN_ID,
      status: "active",
      metadata: { source: "cert_fixture" },
      billing_account_id: billingAccountId,
    })
    .select("id")
    .single();

  const { data: suspendedSub } = await admin
    .from("commercial_subscriptions")
    .insert({
      tenant_id: tenantId,
      product_id: ENGINEERING_PRODUCT_ID,
      plan_id: ENGINEERING_PLAN_ID,
      status: "suspended",
      metadata: { source: "cert_fixture_suspended" },
    })
    .select("id")
    .single();

  const subscriptionId = activeSub?.id as string;
  const suspendedSubscriptionId = suspendedSub?.id as string;

  await admin.from("commercial_subscription_events").insert({
    tenant_id: tenantId,
    subscription_id: subscriptionId,
    event_type: "subscription.activated",
    to_status: "active",
    payload: { source: "cert_fixture" },
  });

  await admin.from("commercial_licenses").insert({
    tenant_id: tenantId,
    product_id: ENGINEERING_PRODUCT_ID,
    subscription_id: subscriptionId,
    license_type: "product",
    status: "active",
  });

  const apps = ["project_intelligence", "documents"];
  for (const appKey of apps) {
    await admin.from("commercial_licenses").insert({
      tenant_id: tenantId,
      product_id: ENGINEERING_PRODUCT_ID,
      subscription_id: subscriptionId,
      license_type: "application",
      application_key: appKey,
      status: "active",
    });
  }

  await admin.from("commercial_licenses").insert({
    tenant_id: tenantId,
    product_id: ENGINEERING_PRODUCT_ID,
    subscription_id: subscriptionId,
    license_type: "feature",
    feature_key: "ai_ocr",
    status: "active",
  });

  await admin.from("commercial_licenses").insert({
    tenant_id: tenantId,
    product_id: ENGINEERING_PRODUCT_ID,
    subscription_id: subscriptionId,
    license_type: "application",
    application_key: "documents",
    status: "expired",
    expires_at: new Date(Date.now() - 86_400_000).toISOString(),
  });

  await admin.from("commercial_licenses").insert({
    tenant_id: tenantId,
    product_id: ENGINEERING_PRODUCT_ID,
    subscription_id: subscriptionId,
    license_type: "application",
    application_key: "meetings",
    status: "revoked",
    deactivated_at: new Date().toISOString(),
  });

  await admin.from("commercial_licenses").insert({
    tenant_id: tenantId,
    workspace_id: workspaces[0]!.id,
    product_id: ENGINEERING_PRODUCT_ID,
    subscription_id: subscriptionId,
    license_type: "workspace",
    status: "active",
  });

  const { data: seatPool } = await admin
    .from("commercial_seats")
    .insert({
      tenant_id: tenantId,
      product_id: ENGINEERING_PRODUCT_ID,
      subscription_id: subscriptionId,
      total_seats: 10,
      assigned_seats: 0,
      workspace_id: workspaces[0]!.id,
    })
    .select("id")
    .single();

  const seatPoolId = seatPool?.id as string;

  for (const role of ROLES) {
    if (role === "viewer") continue;
    const user = users[role];
    if (!user) continue;
    await admin.from("commercial_seat_assignments").insert({
      tenant_id: tenantId,
      seat_pool_id: seatPoolId,
      subscription_id: subscriptionId,
      user_id: user.userId,
      workspace_id: workspaces[0]!.id,
      status: "active",
    });
    user.hasSeat = true;
  }

  await admin.from("commercial_entitlement_overrides").insert({
    tenant_id: tenantId,
    workspace_id: workspaces[0]!.id,
    application_key: "documents",
    override_type: "application",
    effect: "allow",
    reason: "cert fixture allow override",
  });

  await admin.from("commercial_entitlement_overrides").insert({
    tenant_id: tenantId,
    application_key: "meetings",
    override_type: "application",
    effect: "deny",
    reason: "cert fixture deny override",
    valid_until: new Date(Date.now() - 86_400_000).toISOString(),
  });

  await admin.from("commercial_outbox_events").insert({
    tenant_id: tenantId,
    aggregate_type: "subscription",
    aggregate_id: subscriptionId,
    event_type: "cert.fixture.created",
    payload: { label },
    status: "pending",
  });

  await admin.from("commercial_invoices").insert({
    tenant_id: tenantId,
    billing_account_id: billingAccountId,
    invoice_number: `CERT-${label.toUpperCase()}-${runId}`,
    status: "draft",
    currency: "AUD",
    subtotal_cents: 0,
    total_cents: 0,
  });

  await admin.from("commercial_credit_ledger").insert({
    tenant_id: tenantId,
    entry_type: "credit",
    amount_cents: 10_000,
    currency: "AUD",
    balance_after_cents: 10_000,
    reason: "cert fixture credit",
  });

  return {
    tenant: {
      id: tenantId,
      slug,
      workspaces,
      users,
      subscriptionId,
      suspendedSubscriptionId,
      seatPoolId,
      billingAccountId,
    },
    orphanTenantIds,
  };
}

async function cleanupStaleCertTenants(admin: ReturnType<typeof createClient>): Promise<void> {
  const patterns = [`${CERT_SLUG_PREFIX}%`, "cert-a-%", "cert-b-%"];
  for (const pattern of patterns) {
    const { data } = await admin.from("tenants").select("id, slug").like("slug", pattern);
    for (const row of data ?? []) {
      log(`Removing stale cert tenant: ${row.slug as string}`);
      await admin.from("tenants").delete().eq("id", row.id as string);
    }
  }
}

async function main(): Promise<void> {
  assertProvisionEnv();

  const url = resolveSupabaseUrl()!;
  const serviceKey = resolveServiceRoleKey()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const password = certUserPassword();
  const runId = Date.now().toString(36);

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await cleanupStaleCertTenants(admin);

  log(`Provisioning cert tenants (run=${runId})`);

  const resultA = await provisionTenant(admin, "a", runId, url, anonKey, password);
  const resultB = await provisionTenant(admin, "b", runId, url, anonKey, password);

  const manifest: CertFixturesManifest = {
    createdAt: new Date().toISOString(),
    slugPrefix: CERT_SLUG_PREFIX,
    tenantA: resultA.tenant,
    tenantB: resultB.tenant,
    orphanTenantIds: [...resultA.orphanTenantIds, ...resultB.orphanTenantIds],
  };

  const outDir = resolve(process.cwd(), "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = fixturesManifestPath();
  writeFileSync(outPath, JSON.stringify(manifest, null, 2));

  log(`Wrote ${outPath}`);
  log(`Tenant A: ${manifest.tenantA.slug} (${manifest.tenantA.id})`);
  log(`Tenant B: ${manifest.tenantB.slug} (${manifest.tenantB.id})`);
  process.exit(0);
}

main().catch((err) => {
  console.error(`[commerce:provision] FAIL: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
