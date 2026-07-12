/**
 * Provisions a deterministic Project Intelligence entitlement/RLS fixture.
 * Re-running with the same GITHUB_RUN_ID reuses the same cert-pi-* rows.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  assertProvisionEnv,
  certUserPassword,
  ENGINEERING_PLAN_ID,
  ENGINEERING_PRODUCT_ID,
  fixturesManifestPath,
  PI_CERT_SLUG_PREFIX,
  resolveServiceRoleKey,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
  type PiFixtureManifest,
  type PiUserFixture,
} from "./env.js";

// The repository intentionally does not ship generated Supabase database types.
// Keep the service-role provisioning boundary dynamic rather than inferring `never`.
type Admin = any;
const now = () => new Date().toISOString();
const runId = () => process.env.GITHUB_RUN_ID?.replace(/[^a-zA-Z0-9-]/g, "-") || Date.now().toString(36);

function log(message: string): void {
  console.log(`[pi:provision] ${message}`);
}

async function required<T>(promise: Promise<any>, label: string): Promise<T> {
  const { data, error } = await promise;
  if (error || !data) throw new Error(`${label}: ${error?.message ?? "no row returned"}`);
  return data;
}

async function existingOrInsert(
  admin: Admin,
  table: string,
  match: Record<string, unknown>,
  value: Record<string, unknown>,
): Promise<Record<string, any>> {
  const query: any = Object.entries(match).reduce((q: any, [key, item]) => q.eq(key, item), admin.from(table).select("*") as any);
  const { data: existing, error: readError } = await query.maybeSingle();
  if (readError) throw new Error(`${table} lookup: ${readError.message}`);
  if (existing) return existing as Record<string, any>;
  return required(admin.from(table).insert(value).select("*").single(), `${table} insert`) as Promise<Record<string, any>>;
}

async function getOrCreateUser(admin: Admin, email: string, password: string): Promise<string> {
  const users = await required<any>(admin.auth.admin.listUsers({ page: 1, perPage: 1000 }), "list auth users");
  const existing = users.users.find((user: any) => user.email === email);
  if (existing) return existing.id;
  const user = await required<any>(
    admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: email.split("@")[0], cert_fixture: true },
    }),
    `create ${email}`,
  );
  return user.user.id;
}

async function signInJwt(url: string, anonKey: string, email: string, password: string): Promise<string> {
  const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token) throw new Error(`JWT sign-in failed for ${email}: ${error?.message}`);
  return data.session.access_token;
}

async function tenantRole(admin: Admin, tenantId: string, slug: string): Promise<string> {
  const role = await required<any>(admin.from("roles").select("id").eq("tenant_id", tenantId).eq("slug", slug).single(), `role ${slug}`);
  return role!.id as string;
}

async function addMembership(admin: Admin, tenantId: string, workspaceIds: string[], userId: string, role: string): Promise<void> {
  const roleId = await tenantRole(admin, tenantId, role);
  await required(
    admin.from("tenant_memberships").upsert(
      { tenant_id: tenantId, user_id: userId, role_id: roleId, status: "active", joined_at: now() },
      { onConflict: "tenant_id,user_id" },
    ).select("id").single(),
    `tenant membership ${userId}`,
  );
  for (const workspaceId of workspaceIds) {
    await required(
      admin.from("workspace_memberships").upsert({ workspace_id: workspaceId, user_id: userId, role_id: roleId }, { onConflict: "workspace_id,user_id" }).select("id").single(),
      `workspace membership ${userId}`,
    );
  }
}

async function removeOrphanMemberships(admin: Admin, userId: string, keepTenantId: string): Promise<void> {
  const { data: memberships, error } = await admin
    .from("tenant_memberships")
    .select("tenant_id")
    .eq("user_id", userId)
    .eq("status", "active");
  if (error) throw new Error(`list memberships for orphan cleanup: ${error.message}`);
  for (const row of memberships ?? []) {
    const tenantId = row.tenant_id as string;
    if (tenantId === keepTenantId) continue;
    const { data: workspaces } = await admin.from("workspaces").select("id").eq("tenant_id", tenantId);
    for (const workspace of workspaces ?? []) {
      await admin.from("workspace_memberships").delete().eq("user_id", userId).eq("workspace_id", workspace.id);
    }
    await admin.from("tenant_memberships").delete().eq("user_id", userId).eq("tenant_id", tenantId);
    const { count } = await admin
      .from("tenant_memberships")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId);
    if (!count) {
      const { data: tenant } = await admin.from("tenants").select("slug").eq("id", tenantId).maybeSingle();
      // Only auto-delete non-cert tenants created as personal defaults for the user.
      if (tenant && !String(tenant.slug ?? "").startsWith(PI_CERT_SLUG_PREFIX)) {
        await admin.from("tenants").delete().eq("id", tenantId);
      }
    }
  }
}

async function createFixtureUser(
  admin: Admin, url: string, anonKey: string, password: string, key: string, id: string, role: string,
): Promise<PiUserFixture> {
  const email = `${PI_CERT_SLUG_PREFIX}${key}-${id}@rtb-cert.test`;
  const userId = await getOrCreateUser(admin, email, password);
  return { id: userId, email, jwt: await signInJwt(url, anonKey, email, password), role };
}

async function createTenant(admin: Admin, slug: string, label: string, piEnabled: boolean): Promise<Record<string, any>> {
  const tenant = await existingOrInsert(
    admin, "tenants", { slug },
    { name: `PI Certification ${label}`, slug, status: "active", settings: { cert_fixture: true, projectIntelligence: { enabled: piEnabled } } },
  );
  const { error: rolesError } = await admin.rpc("create_default_tenant_roles", { p_tenant_id: tenant.id });
  if (rolesError) throw new Error(`seed tenant roles: ${rolesError.message}`);
  await required(
    admin.from("tenants").update({ settings: { ...(tenant.settings ?? {}), cert_fixture: true, projectIntelligence: { enabled: piEnabled } } }).eq("id", tenant.id).select("id").single(),
    "enable Project Intelligence tenant setting",
  );
  return tenant;
}

async function workspace(admin: Admin, tenantId: string, slug: string): Promise<Record<string, any>> {
  return existingOrInsert(admin, "workspaces", { tenant_id: tenantId, slug }, { tenant_id: tenantId, slug, name: `PI Cert ${slug}`, status: "active" });
}

async function seedEntitlements(
  admin: Admin,
  tenantId: string,
  workspaceId: string,
  ownerId: string,
  options: { includePiApplication?: boolean; suspended?: boolean } = {},
): Promise<{
  installationId: string; appInstallationId?: string; licenceId: string; subscriptionId: string;
}> {
  const { includePiApplication = true, suspended = false } = options;
  const billing = await existingOrInsert(admin, "commercial_billing_accounts", { tenant_id: tenantId, name: "PI Certification Billing" }, { tenant_id: tenantId, name: "PI Certification Billing", is_default: true });
  const subscription = await existingOrInsert(
    admin, "commercial_subscriptions", { tenant_id: tenantId, product_id: ENGINEERING_PRODUCT_ID },
    { tenant_id: tenantId, product_id: ENGINEERING_PRODUCT_ID, plan_id: ENGINEERING_PLAN_ID, billing_account_id: billing.id, status: "active", metadata: { cert_pi_fixture: true } },
  );
  if (!includePiApplication && subscription.plan_id !== null) {
    const { error: removePlanError } = await admin
      .from("commercial_subscriptions")
      .update({ plan_id: null })
      .eq("id", subscription.id);
    if (removePlanError) throw new Error(`remove PI plan entitlement: ${removePlanError.message}`);
    subscription.plan_id = null;
  }
  const licence = await existingOrInsert(
    admin, "commercial_licenses", { tenant_id: tenantId, product_id: ENGINEERING_PRODUCT_ID, license_type: "product" },
    { tenant_id: tenantId, product_id: ENGINEERING_PRODUCT_ID, subscription_id: subscription.id, license_type: "product", status: suspended ? "suspended" : "active" },
  );
  const applicationLicence = includePiApplication
    ? await existingOrInsert(
      admin,
      "commercial_licenses",
      { tenant_id: tenantId, subscription_id: subscription.id, application_key: "project_intelligence" },
      {
        tenant_id: tenantId,
        product_id: ENGINEERING_PRODUCT_ID,
        subscription_id: subscription.id,
        application_key: "project_intelligence",
        license_type: "application",
        status: suspended ? "suspended" : "active",
      },
    )
    : undefined;
  if (!includePiApplication) {
    const { error: deleteApplicationInstallationsError } = await admin
      .from("commercial_application_installations")
      .delete()
      .eq("tenant_id", tenantId)
      .eq("product_id", ENGINEERING_PRODUCT_ID)
      .eq("application_key", "project_intelligence");
    if (deleteApplicationInstallationsError) {
      throw new Error(`remove PI application installation: ${deleteApplicationInstallationsError.message}`);
    }
    const { error: deleteApplicationLicencesError } = await admin
      .from("commercial_licenses")
      .delete()
      .eq("tenant_id", tenantId)
      .eq("subscription_id", subscription.id)
      .eq("application_key", "project_intelligence");
    if (deleteApplicationLicencesError) {
      throw new Error(`remove PI application licence: ${deleteApplicationLicencesError.message}`);
    }
  }
  const installation = await existingOrInsert(
    admin, "commercial_installations", { tenant_id: tenantId, product_id: ENGINEERING_PRODUCT_ID },
    { tenant_id: tenantId, product_id: ENGINEERING_PRODUCT_ID, subscription_id: subscription.id, licence_id: licence.id, status: "active", desired_state: "active", current_state: "active", installed_version: "1.0.0", installed_at: now() },
  );
  const appInstallation = includePiApplication
    ? await existingOrInsert(
      admin, "commercial_application_installations", { tenant_id: tenantId, product_id: ENGINEERING_PRODUCT_ID, application_key: "project_intelligence" },
      { tenant_id: tenantId, product_id: ENGINEERING_PRODUCT_ID, application_key: "project_intelligence", parent_product_installation_id: installation.id, subscription_id: subscription.id, licence_id: applicationLicence!.id, status: "active", installed_version: "1.0.0", installed_at: now() },
    )
    : undefined;
  await existingOrInsert(
    admin, "commercial_workspace_product_assignments", { workspace_id: workspaceId, installation_id: installation.id },
    { tenant_id: tenantId, workspace_id: workspaceId, installation_id: installation.id, product_id: ENGINEERING_PRODUCT_ID, assigned_by: ownerId, status: "active" },
  );
  if (appInstallation) {
    await existingOrInsert(
      admin, "commercial_workspace_application_assignments", { workspace_id: workspaceId, app_installation_id: appInstallation.id },
      { tenant_id: tenantId, workspace_id: workspaceId, app_installation_id: appInstallation.id, application_key: "project_intelligence", assigned_by: ownerId, status: "active" },
    );
  }
  return {
    installationId: installation.id,
    appInstallationId: appInstallation?.id,
    licenceId: applicationLicence?.id ?? licence.id,
    subscriptionId: subscription.id,
  };
}

async function seedSeat(admin: Admin, tenantId: string, workspaceId: string, subscriptionId: string, licenceId: string, userId: string): Promise<string> {
  const pool = await existingOrInsert(
    admin, "commercial_seats", { tenant_id: tenantId, workspace_id: workspaceId, product_id: ENGINEERING_PRODUCT_ID },
    { tenant_id: tenantId, workspace_id: workspaceId, product_id: ENGINEERING_PRODUCT_ID, subscription_id: subscriptionId, license_id: licenceId, total_seats: 10, assigned_seats: 2 },
  );
  const assignment = await existingOrInsert(
    admin, "commercial_seat_assignments", { tenant_id: tenantId, seat_pool_id: pool.id, user_id: userId },
    { tenant_id: tenantId, seat_pool_id: pool.id, subscription_id: subscriptionId, user_id: userId, workspace_id: workspaceId, status: "active" },
  );
  return assignment.id as string;
}

export async function provisionPiFixtures(): Promise<PiFixtureManifest> {
  assertProvisionEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const password = certUserPassword();
  const id = runId();
  const admin = createClient(url, resolveServiceRoleKey()!, { auth: { persistSession: false, autoRefreshToken: false } });

  const baselineTenant = await createTenant(admin, `${PI_CERT_SLUG_PREFIX}baseline-${id}`, "Baseline", true);
  const workspaceA = await workspace(admin, baselineTenant.id, `pi-a-${id}`);
  const workspaceB = await workspace(admin, baselineTenant.id, `pi-b-${id}`);
  const owner = await createFixtureUser(admin, url, anonKey, password, "baseline-owner", id, "owner");
  const administrator = await createFixtureUser(admin, url, anonKey, password, "baseline-admin", id, "admin");
  const engineer = await createFixtureUser(admin, url, anonKey, password, "baseline-engineer", id, "engineer");
  const engineerB = await createFixtureUser(admin, url, anonKey, password, "baseline-engineer-b", id, "engineer");
  const viewer = await createFixtureUser(admin, url, anonKey, password, "baseline-viewer", id, "viewer");
  const userWithoutWorkspace = await createFixtureUser(admin, url, anonKey, password, "workspace-unassigned", id, "engineer");
  await addMembership(admin, baselineTenant.id, [workspaceA.id, workspaceB.id], owner.id, "owner");
  await addMembership(admin, baselineTenant.id, [workspaceA.id, workspaceB.id], administrator.id, "admin");
  await addMembership(admin, baselineTenant.id, [workspaceA.id], engineer.id, "engineer");
  await addMembership(admin, baselineTenant.id, [workspaceB.id], engineerB.id, "engineer");
  await addMembership(admin, baselineTenant.id, [workspaceA.id], viewer.id, "viewer");
  await addMembership(admin, baselineTenant.id, [], userWithoutWorkspace.id, "engineer");
  for (const user of [owner, administrator, engineer, engineerB, viewer, userWithoutWorkspace]) {
    await removeOrphanMemberships(admin, user.id, baselineTenant.id);
  }

  const entitlement = await seedEntitlements(admin, baselineTenant.id, workspaceA.id, owner.id);
  // Also assign Engineering OS + PI to workspace B so multi-workspace principals
  // never fail commercial workspace assignment when B is selected.
  await existingOrInsert(
    admin,
    "commercial_workspace_product_assignments",
    { workspace_id: workspaceB.id, installation_id: entitlement.installationId },
    {
      tenant_id: baselineTenant.id,
      workspace_id: workspaceB.id,
      installation_id: entitlement.installationId,
      product_id: ENGINEERING_PRODUCT_ID,
      assigned_by: owner.id,
      status: "active",
    },
  );
  await existingOrInsert(
    admin,
    "commercial_workspace_application_assignments",
    { workspace_id: workspaceB.id, app_installation_id: entitlement.appInstallationId! },
    {
      tenant_id: baselineTenant.id,
      workspace_id: workspaceB.id,
      app_installation_id: entitlement.appInstallationId!,
      application_key: "project_intelligence",
      assigned_by: owner.id,
      status: "active",
    },
  );
  const ownerSeat = await seedSeat(admin, baselineTenant.id, workspaceA.id, entitlement.subscriptionId, entitlement.licenceId, owner.id);
  const engineerSeat = await seedSeat(admin, baselineTenant.id, workspaceA.id, entitlement.subscriptionId, entitlement.licenceId, engineer.id);
  const project = await existingOrInsert(
    admin, "engineering_projects", { tenant_id: baselineTenant.id, project_code: `PI-${id}` },
    { tenant_id: baselineTenant.id, workspace_id: workspaceA.id, project_code: `PI-${id}`, project_name: "PI Certification Project", status: "active", created_by: owner.id },
  );
  const candidate = await existingOrInsert(
    admin, "project_intelligence_project_mappings", { tenant_id: baselineTenant.id, legacy_project_intelligence_project_id: `candidate-${id}` },
    { tenant_id: baselineTenant.id, workspace_id: workspaceA.id, engineering_project_id: project.id, legacy_project_intelligence_project_id: `candidate-${id}`, mapping_status: "candidate", migration_source: "cert-pi-fixture" },
  );
  const approvedProject = await existingOrInsert(
    admin, "engineering_projects", { tenant_id: baselineTenant.id, project_code: `PI-APPROVED-${id}` },
    { tenant_id: baselineTenant.id, workspace_id: workspaceA.id, project_code: `PI-APPROVED-${id}`, project_name: "PI Certification Approved Project", status: "active", created_by: owner.id },
  );
  const approved = await existingOrInsert(
    admin, "project_intelligence_project_mappings", { tenant_id: baselineTenant.id, legacy_project_intelligence_project_id: `approved-${id}` },
    { tenant_id: baselineTenant.id, workspace_id: workspaceA.id, engineering_project_id: approvedProject.id, legacy_project_intelligence_project_id: `approved-${id}`, mapping_status: "approved", migration_source: "cert-pi-fixture", approved_by: owner.id, approved_at: now() },
  );
  const workspaceBProject = await existingOrInsert(
    admin, "engineering_projects", { tenant_id: baselineTenant.id, project_code: `PI-WORKSPACE-B-${id}` },
    { tenant_id: baselineTenant.id, workspace_id: workspaceB.id, project_code: `PI-WORKSPACE-B-${id}`, project_name: "PI Certification Workspace B Project", status: "active", created_by: owner.id },
  );
  await existingOrInsert(
    admin, "project_intelligence_project_mappings", { tenant_id: baselineTenant.id, legacy_project_intelligence_project_id: `workspace-b-${id}` },
    { tenant_id: baselineTenant.id, workspace_id: workspaceB.id, engineering_project_id: workspaceBProject.id, legacy_project_intelligence_project_id: `workspace-b-${id}`, mapping_status: "candidate", migration_source: "cert-pi-fixture" },
  );

  const otherTenant = await createTenant(admin, `${PI_CERT_SLUG_PREFIX}other-${id}`, "Other tenant", false);
  const otherWorkspace = await workspace(admin, otherTenant.id, `other-${id}`);
  const otherTenantOwner = await createFixtureUser(admin, url, anonKey, password, "other-owner", id, "owner");
  await addMembership(admin, otherTenant.id, [otherWorkspace.id], otherTenantOwner.id, "owner");
  await removeOrphanMemberships(admin, otherTenantOwner.id, otherTenant.id);
  const otherProject = await existingOrInsert(
    admin, "engineering_projects", { tenant_id: otherTenant.id, project_code: `PI-OTHER-${id}` },
    { tenant_id: otherTenant.id, workspace_id: otherWorkspace.id, project_code: `PI-OTHER-${id}`, project_name: "PI Certification Foreign Project", status: "active", created_by: otherTenantOwner.id },
  );
  const foreignMapping = await existingOrInsert(
    admin, "project_intelligence_project_mappings", { tenant_id: otherTenant.id, legacy_project_intelligence_project_id: `foreign-${id}` },
    { tenant_id: otherTenant.id, workspace_id: otherWorkspace.id, engineering_project_id: otherProject.id, legacy_project_intelligence_project_id: `foreign-${id}`, mapping_status: "candidate", migration_source: "cert-pi-fixture" },
  );
  const noPiTenant = await createTenant(admin, `${PI_CERT_SLUG_PREFIX}no-pi-${id}`, "No PI", false);
  const noPiWorkspace = await workspace(admin, noPiTenant.id, `no-pi-${id}`);
  const noPiOwner = await createFixtureUser(admin, url, anonKey, password, "no-pi-owner", id, "owner");
  await addMembership(admin, noPiTenant.id, [noPiWorkspace.id], noPiOwner.id, "owner");
  await removeOrphanMemberships(admin, noPiOwner.id, noPiTenant.id);
  const noPiEntitlement = await seedEntitlements(admin, noPiTenant.id, noPiWorkspace.id, noPiOwner.id, { includePiApplication: false });
  await seedSeat(admin, noPiTenant.id, noPiWorkspace.id, noPiEntitlement.subscriptionId, noPiEntitlement.licenceId, noPiOwner.id);
  const suspendedTenant = await createTenant(admin, `${PI_CERT_SLUG_PREFIX}suspended-${id}`, "Suspended licence", true);
  const suspendedWorkspace = await workspace(admin, suspendedTenant.id, `suspended-${id}`);
  const suspendedOwner = await createFixtureUser(admin, url, anonKey, password, "suspended-owner", id, "owner");
  await addMembership(admin, suspendedTenant.id, [suspendedWorkspace.id], suspendedOwner.id, "owner");
  await removeOrphanMemberships(admin, suspendedOwner.id, suspendedTenant.id);
  const suspended = await seedEntitlements(admin, suspendedTenant.id, suspendedWorkspace.id, suspendedOwner.id, { suspended: true });
  await seedSeat(admin, suspendedTenant.id, suspendedWorkspace.id, suspended.subscriptionId, suspended.licenceId, suspendedOwner.id);

  const manifest: PiFixtureManifest = {
    runId: id, createdAt: now(), slugPrefix: PI_CERT_SLUG_PREFIX,
    baseline: {
      tenantId: baselineTenant.id, workspaceId: workspaceA.id, workspaceBId: workspaceB.id,
      engineeringProjectId: project.id, mappingId: candidate.id, approvedMappingId: approved.id, foreignMappingId: foreignMapping.id,
      users: { owner, admin: administrator, engineer, engineerWorkspaceBOnly: engineerB, viewer, userWithoutWorkspace, otherTenantOwner },
      engineeringOsInstallationId: entitlement.installationId, piApplicationInstallationId: entitlement.appInstallationId!,
      licenceId: entitlement.licenceId, seatAssignments: { owner: ownerSeat, engineer: engineerSeat },
    },
    denial: {
      piNotInstalledTenant: { tenantId: noPiTenant.id, workspaceId: noPiWorkspace.id, owner: noPiOwner, engineeringOsInstallationId: noPiEntitlement.installationId, expectedCode: "project_intelligence_not_installed", expectedReason: "application_not_in_plan" },
      // Commerce excludes suspended licences from its active set, then resolves the
      // plan entitlement to `licence_not_found`; PI normalizes that API error to
      // `licence_suspended`.
      suspendedLicence: { tenantId: suspendedTenant.id, owner: suspendedOwner, licenceId: suspended.licenceId, expectedCode: "licence_suspended", expectedReason: "licence_not_found" },
      seatNotAssigned: { tenantId: baselineTenant.id, workspaceId: workspaceA.id, user: viewer, expectedCode: "seat_not_assigned", expectedReason: "seat_not_assigned" },
      workspaceNotAssigned: { tenantId: baselineTenant.id, userWithoutWorkspace, expectedCode: "workspace_not_assigned", expectedReason: "workspace_not_assigned" },
    },
  };
  mkdirSync(resolve(process.cwd(), "artifacts"), { recursive: true });
  writeFileSync(fixturesManifestPath(), JSON.stringify(manifest, null, 2));
  log(`wrote ${fixturesManifestPath()} (run=${id})`);
  return manifest;
}

