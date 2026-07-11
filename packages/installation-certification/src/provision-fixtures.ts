/**
 * Provisions Tenant A/B certification fixtures with commerce + installation lifecycle data.
 * Writes artifacts/cert-fixtures.json. Tags tenants with slug prefix cert-install-
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
  type CertInstallationFixture,
  type CertTenantFixture,
  type CertUserFixture,
} from "./lib/env.js";

const ROLES = ["owner", "admin", "engineer", "viewer"] as const;
type RoleSlug = (typeof ROLES)[number] | "unassigned";

function log(msg: string): void {
  console.log(`[installation:provision] ${msg}`);
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

async function seedCommerceBaseline(
  admin: ReturnType<typeof createClient>,
  tenantId: string,
  label: string,
  workspaces: CertTenantFixture["workspaces"],
  users: Record<string, CertUserFixture>
): Promise<{
  subscriptionId: string;
  suspendedSubscriptionId: string;
  seatPoolId: string;
  billingAccountId: string;
  licenceId: string;
}> {
  const { data: billing } = await admin
    .from("commercial_billing_accounts")
    .insert({ tenant_id: tenantId, name: `Cert Billing ${label}`, is_default: true })
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
      metadata: { source: "cert_install_fixture" },
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
      metadata: { source: "cert_install_fixture_suspended" },
    })
    .select("id")
    .single();

  const subscriptionId = activeSub?.id as string;
  const suspendedSubscriptionId = suspendedSub?.id as string;

  const { data: productLicence } = await admin
    .from("commercial_licenses")
    .insert({
      tenant_id: tenantId,
      product_id: ENGINEERING_PRODUCT_ID,
      subscription_id: subscriptionId,
      license_type: "product",
      status: "active",
    })
    .select("id")
    .single();

  const licenceId = productLicence?.id as string;

  for (const appKey of ["project_intelligence", "documents"]) {
    await admin.from("commercial_licenses").insert({
      tenant_id: tenantId,
      product_id: ENGINEERING_PRODUCT_ID,
      subscription_id: subscriptionId,
      license_type: "application",
      application_key: appKey,
      status: "active",
    });
  }

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

  return { subscriptionId, suspendedSubscriptionId, seatPoolId, billingAccountId, licenceId };
}

async function seedInstallations(
  admin: ReturnType<typeof createClient>,
  tenantId: string,
  subscriptionId: string,
  licenceId: string,
  workspaces: CertTenantFixture["workspaces"],
  ownerUserId: string
): Promise<CertInstallationFixture> {
  const { data: productInstall } = await admin
    .from("commercial_installations")
    .insert({
      tenant_id: tenantId,
      product_id: ENGINEERING_PRODUCT_ID,
      subscription_id: subscriptionId,
      licence_id: licenceId,
      status: "active",
      desired_state: "active",
      current_state: "active",
      installed_version: "1.0.0",
      requested_version: "1.0.0",
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      installed_at: new Date().toISOString(),
      metadata: { source: "cert_install_fixture" },
    })
    .select("id")
    .single();

  const productInstallationId = productInstall?.id as string;

  await admin.from("commercial_installation_events").insert({
    tenant_id: tenantId,
    installation_id: productInstallationId,
    event_type: "installation.activated",
    from_status: "provisioning",
    to_status: "active",
    payload: { source: "cert_install_fixture" },
  });

  await admin.rpc("bump_commercial_installation_version", { p_tenant_id: tenantId });

  const appInstallationIds: Record<string, string> = {};
  for (const appKey of ["project_intelligence", "documents"]) {
    const { data: appInstall } = await admin
      .from("commercial_application_installations")
      .insert({
        tenant_id: tenantId,
        product_id: ENGINEERING_PRODUCT_ID,
        parent_product_installation_id: productInstallationId,
        application_key: appKey,
        subscription_id: subscriptionId,
        status: "active",
        installed_version: "1.0.0",
        installed_at: new Date().toISOString(),
        metadata: { source: "cert_install_fixture" },
      })
      .select("id")
      .single();
    if (appInstall?.id) appInstallationIds[appKey] = appInstall.id as string;
  }

  const { data: wsAssign } = await admin
    .from("commercial_workspace_product_assignments")
    .insert({
      tenant_id: tenantId,
      workspace_id: workspaces[0]!.id,
      installation_id: productInstallationId,
      product_id: ENGINEERING_PRODUCT_ID,
      status: "active",
      assigned_by: ownerUserId,
      metadata: { source: "cert_install_fixture" },
    })
    .select("id")
    .single();

  return {
    productInstallationId,
    appInstallationIds,
    workspaceProductAssignmentId: wsAssign?.id as string | undefined,
  };
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
      name: `Cert Install Tenant ${label.toUpperCase()}`,
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

  for (const role of [...ROLES, "unassigned"] as RoleSlug[]) {
    const email = `cert-install-${label}-${role}-${runId}@rtb-cert.test`;
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

  const commerce = await seedCommerceBaseline(admin, tenantId, label, workspaces, users);
  const installations = await seedInstallations(
    admin,
    tenantId,
    commerce.subscriptionId,
    commerce.licenceId,
    workspaces,
    users.owner!.userId
  );

  return {
    tenant: {
      id: tenantId,
      slug,
      workspaces,
      users,
      subscriptionId: commerce.subscriptionId,
      suspendedSubscriptionId: commerce.suspendedSubscriptionId,
      seatPoolId: commerce.seatPoolId,
      billingAccountId: commerce.billingAccountId,
      installations,
    },
    orphanTenantIds,
  };
}

async function cleanupStaleCertTenants(admin: ReturnType<typeof createClient>): Promise<void> {
  const patterns = [`${CERT_SLUG_PREFIX}%`, "cert-install-a-%", "cert-install-b-%"];
  for (const pattern of patterns) {
    const { data } = await admin.from("tenants").select("id, slug").like("slug", pattern);
    for (const row of data ?? []) {
      log(`Removing stale cert tenant: ${row.slug as string}`);
      await admin.from("tenants").delete().eq("id", row.id as string);
    }
  }
}

export async function provisionInstallationFixtures(): Promise<CertFixturesManifest> {
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

  return manifest;
}
