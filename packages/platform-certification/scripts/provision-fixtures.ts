/**
 * Phase 7B hosted fixture: one tenant, dual OS installs, run-scoped identities.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  assertProvisionEnv,
  CERT_SLUG_PREFIX,
  certUserPassword,
  ENGINEERING_PLAN_ID,
  ENGINEERING_PRODUCT_ID,
  fixturesManifestPath,
  REFERENCE_OS_PLAN_ID,
  REFERENCE_OS_PRODUCT_ID,
  resolveRunId,
  resolveServiceRoleKey,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
  type Platform7bFixturesManifest,
  type Platform7bUserFixture,
  type Platform7bUserRole,
} from "../src/lib/env.js";

const ROLES: Platform7bUserRole[] = [
  "owner",
  "admin",
  "eng_admin",
  "engineer",
  "viewer",
  "unentitled",
];

function log(msg: string): void {
  console.log(`[platform-7b:provision] ${msg}`);
}

function membershipRole(role: Platform7bUserRole): string {
  if (role === "eng_admin") return "engineering_manager";
  if (role === "unentitled") return "viewer";
  return role;
}

async function requireRow<T>(
  label: string,
  result: { data: T | null; error: { message: string } | null },
): Promise<T> {
  if (result.error || !result.data) {
    throw new Error(`${label}: ${result.error?.message ?? "no row"}`);
  }
  return result.data;
}

async function signInJwt(url: string, anonKey: string, email: string, password: string): Promise<string> {
  const anon = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token) {
    throw new Error(`JWT sign-in failed for ${email}: ${error?.message}`);
  }
  return data.session.access_token;
}

async function ensureReferenceOsProduct(admin: SupabaseClient): Promise<void> {
  const product = await admin.from("commercial_products").upsert(
    {
      id: REFERENCE_OS_PRODUCT_ID,
      category_id: "a1000000-0000-4000-8000-000000000001",
      slug: "reference-os",
      name: "Reference OS (Certification Only)",
      product_type: "operating_system",
      description: "Certification-only multi-OS fixture",
      icon: "Box",
      lifecycle_status: "active",
      visibility: "private",
      marketplace_visible: false,
      metadata: { certificationOnly: true },
    },
    { onConflict: "id" },
  );
  if (product.error) throw new Error(`reference-os product upsert: ${product.error.message}`);

  const plan = await admin.from("commercial_plans").upsert(
    {
      id: REFERENCE_OS_PLAN_ID,
      product_id: REFERENCE_OS_PRODUCT_ID,
      slug: "reference-os-cert",
      name: "Reference OS Certification",
      edition: "custom",
      billing_model: "free",
      trial_days: 0,
    },
    { onConflict: "id" },
  );
  if (plan.error) throw new Error(`reference-os plan upsert: ${plan.error.message}`);
}

async function seedOsCommerce(
  admin: SupabaseClient,
  tenantId: string,
  productId: string,
  planId: string,
  workspaceIds: string[],
  seatedUserIds: string[],
  ownerUserId: string,
): Promise<{ installationId: string; licenceId: string; subscriptionId: string }> {
  const billing = await requireRow(
    "billing_account",
    await admin
      .from("commercial_billing_accounts")
      .insert({ tenant_id: tenantId, name: `Cert Billing ${productId.slice(0, 8)}`, is_default: false })
      .select("id")
      .single(),
  );

  const sub = await requireRow(
    "subscription",
    await admin
      .from("commercial_subscriptions")
      .insert({
        tenant_id: tenantId,
        product_id: productId,
        plan_id: planId,
        status: "active",
        metadata: { source: "platform_7b_fixture" },
        billing_account_id: billing.id,
      })
      .select("id")
      .single(),
  );

  const licence = await requireRow(
    "licence",
    await admin
      .from("commercial_licenses")
      .insert({
        tenant_id: tenantId,
        product_id: productId,
        subscription_id: sub.id,
        license_type: "product",
        status: "active",
      })
      .select("id")
      .single(),
  );

  const seatPool = await requireRow(
    "seat_pool",
    await admin
      .from("commercial_seats")
      .insert({
        tenant_id: tenantId,
        product_id: productId,
        subscription_id: sub.id,
        total_seats: 10,
        assigned_seats: seatedUserIds.length,
        workspace_id: workspaceIds[0],
      })
      .select("id")
      .single(),
  );

  for (const userId of seatedUserIds) {
    const seat = await admin.from("commercial_seat_assignments").insert({
      tenant_id: tenantId,
      seat_pool_id: seatPool.id,
      subscription_id: sub.id,
      user_id: userId,
      workspace_id: workspaceIds[0],
      status: "active",
    });
    if (seat.error) throw new Error(`seat_assignment: ${seat.error.message}`);
  }

  const now = new Date().toISOString();
  const installation = await requireRow(
    "installation",
    await admin
      .from("commercial_installations")
      .insert({
        tenant_id: tenantId,
        product_id: productId,
        subscription_id: sub.id,
        licence_id: licence.id,
        status: "active",
        desired_state: "active",
        current_state: "active",
        installed_version: "1.0.0",
        requested_version: "1.0.0",
        started_at: now,
        completed_at: now,
        installed_at: now,
        metadata: { source: "platform_7b_fixture" },
      })
      .select("id,status")
      .single(),
  );

  await admin.from("commercial_installation_events").insert({
    tenant_id: tenantId,
    installation_id: installation.id,
    event_type: "installation.activated",
    from_status: "provisioning",
    to_status: "active",
    payload: {
      source: "platform_7b_fixture",
      request_id: `prov-${installation.id}`,
      correlation_id: `prov-${installation.id}`,
      tenant_id: tenantId,
      actor_id: ownerUserId,
      installation_id: installation.id,
      operating_system_key: productId,
      action: "install",
      previous_state: "provisioning",
      next_state: "active",
      result: "success",
      duration_ms: 0,
    },
  });

  for (const workspaceId of workspaceIds) {
    const assign = await admin.from("commercial_workspace_product_assignments").insert({
      tenant_id: tenantId,
      workspace_id: workspaceId,
      product_id: productId,
      installation_id: installation.id,
      status: "active",
      assigned_by: ownerUserId,
      metadata: { source: "platform_7b_fixture" },
    });
    if (assign.error) throw new Error(`workspace_assignment: ${assign.error.message}`);
  }

  return {
    installationId: installation.id as string,
    licenceId: licence.id as string,
    subscriptionId: sub.id as string,
  };
}

export async function provisionPlatform7bFixtures(pkgDir = process.cwd()): Promise<Platform7bFixturesManifest> {
  assertProvisionEnv();
  const runId = resolveRunId();
  const url = resolveSupabaseUrl()!;
  const serviceKey = resolveServiceRoleKey()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const password = certUserPassword();
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await ensureReferenceOsProduct(admin);

  const tenantSlug = `${CERT_SLUG_PREFIX}${runId}`;
  log(`Creating tenant ${tenantSlug}`);

  // Cleanup same-run leftovers for idempotent retry
  const { data: existing } = await admin.from("tenants").select("id").eq("slug", tenantSlug);
  for (const row of existing ?? []) {
    const { data: memberships } = await admin
      .from("tenant_memberships")
      .select("user_id")
      .eq("tenant_id", row.id);
    for (const m of memberships ?? []) {
      await admin.auth.admin.deleteUser(m.user_id as string).catch(() => undefined);
    }
    await admin.from("tenants").delete().eq("id", row.id);
  }

  const tenant = await requireRow(
    "tenant",
    await admin
      .from("tenants")
      .insert({
        name: `Platform 7B Cert ${runId}`,
        slug: tenantSlug,
        status: "active",
        settings: { cert_fixture: true, phase: "7B", run_id: runId },
      })
      .select("id")
      .single(),
  );
  const tenantId = tenant.id as string;

  await admin.rpc("create_default_tenant_roles", { p_tenant_id: tenantId });

  const workspaces: Platform7bFixturesManifest["workspaces"] = [];
  for (const slug of ["alpha", "beta"]) {
    const ws = await requireRow(
      `workspace_${slug}`,
      await admin
        .from("workspaces")
        .insert({
          tenant_id: tenantId,
          name: `Workspace ${slug} ${runId}`,
          slug: `${slug}-${runId}`,
          type: "default",
          status: "active",
        })
        .select("id,slug,name")
        .single(),
    );
    workspaces.push({
      id: ws.id as string,
      slug: ws.slug as string,
      name: ws.name as string,
    });
  }

  const { data: roles } = await admin.from("roles").select("id,slug").eq("tenant_id", tenantId);
  const roleBySlug = new Map((roles ?? []).map((r) => [r.slug as string, r.id as string]));

  const users = {} as Record<Platform7bUserRole, Platform7bUserFixture>;
  for (const role of ROLES) {
    const email = `cert-7b-${role}-${runId}@rtb-cert.test`;
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { cert_fixture: true, phase: "7B", role },
    });
    if (error || !created.user?.id) throw new Error(`createUser ${email}: ${error?.message}`);
    const userId = created.user.id;
    const memRole = membershipRole(role);
    const roleId = roleBySlug.get(memRole) ?? roleBySlug.get("viewer");
    const mem = await admin.from("tenant_memberships").insert({
      tenant_id: tenantId,
      user_id: userId,
      role_id: roleId,
      status: "active",
    });
    if (mem.error) throw new Error(`membership ${email}: ${mem.error.message}`);
    const jwt = await signInJwt(url, anonKey, email, password);
    users[role] = { userId, email, role, jwt };
  }

  const seatedEng = [users.owner.userId, users.eng_admin.userId, users.engineer.userId, users.viewer.userId];
  const seatedRef = [users.owner.userId, users.admin.userId];

  const eng = await seedOsCommerce(
    admin,
    tenantId,
    ENGINEERING_PRODUCT_ID,
    ENGINEERING_PLAN_ID,
    workspaces.map((w) => w.id),
    seatedEng,
    users.owner.userId,
  );
  const ref = await seedOsCommerce(
    admin,
    tenantId,
    REFERENCE_OS_PRODUCT_ID,
    REFERENCE_OS_PLAN_ID,
    [workspaces[0]!.id],
    seatedRef,
    users.owner.userId,
  );

  const manifest: Platform7bFixturesManifest = {
    runId,
    tenantId,
    tenantSlug,
    workspaces,
    users,
    installations: {
      engineering: {
        id: eng.installationId,
        productId: ENGINEERING_PRODUCT_ID,
        productSlug: "engineering-os",
        status: "active",
      },
      referenceOs: {
        id: ref.installationId,
        productId: REFERENCE_OS_PRODUCT_ID,
        productSlug: "reference-os",
        status: "active",
      },
    },
    createdAt: new Date().toISOString(),
  };

  const out = fixturesManifestPath(pkgDir);
  mkdirSync(resolve(out, ".."), { recursive: true });
  writeFileSync(out, JSON.stringify(manifest, null, 2), "utf8");
  log(`Wrote ${out}`);
  return manifest;
}

if (process.argv[1]?.includes("provision-fixtures")) {
  provisionPlatform7bFixtures(resolve(import.meta.dirname, ".."))
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
