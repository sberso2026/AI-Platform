import { existsSync, unlinkSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import {
  assertProvisionEnv,
  fixturesManifestPath,
  loadPiFixturesManifest,
  PI_CERT_SLUG_PREFIX,
  resolveServiceRoleKey,
  resolveSupabaseUrl,
} from "./env.js";

/**
 * Deletes cert-pi tenants and auth users. Child rows cascade from tenants; when
 * FK order blocks tenant delete (stale memberships), purge memberships first.
 */
export async function cleanupPiFixtures(): Promise<void> {
  assertProvisionEnv();
  const admin = createClient(resolveSupabaseUrl()!, resolveServiceRoleKey()!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const manifest = loadPiFixturesManifest();
  const { data: tenants, error } = await admin
    .from("tenants")
    .select("id, slug")
    .like("slug", `${PI_CERT_SLUG_PREFIX}%`);
  if (error) throw new Error(`PI fixture lookup failed: ${error.message}`);

  const emails = new Set<string>();
  const collect = (user?: { email: string }) => user?.email && emails.add(user.email);
  if (manifest) {
    Object.values(manifest.baseline.users).forEach(collect);
    collect(manifest.denial.piNotInstalledTenant.owner);
    collect(manifest.denial.suspendedLicence.owner);
    collect(manifest.denial.seatNotAssigned.user);
    collect(manifest.denial.workspaceNotAssigned.userWithoutWorkspace);
  }

  for (const tenant of tenants ?? []) {
    const { error: membershipError } = await admin
      .from("workspace_memberships")
      .delete()
      .eq("tenant_id", tenant.id);
    // workspace_memberships may not have tenant_id — fall back via workspaces
    if (membershipError) {
      const { data: workspaces } = await admin.from("workspaces").select("id").eq("tenant_id", tenant.id);
      for (const workspace of workspaces ?? []) {
        await admin.from("workspace_memberships").delete().eq("workspace_id", workspace.id);
      }
    }
    await admin.from("tenant_memberships").delete().eq("tenant_id", tenant.id);
    const { error: deleteError } = await admin.from("tenants").delete().eq("id", tenant.id);
    if (deleteError) throw new Error(`failed deleting ${tenant.slug}: ${deleteError.message}`);
  }

  if (emails.size) {
    const { data: users, error: usersError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersError) throw new Error(`list fixture users failed: ${usersError.message}`);
    for (const user of users.users.filter((item) => item.email && emails.has(item.email))) {
      const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
      if (deleteError) throw new Error(`failed deleting ${user.email}: ${deleteError.message}`);
    }
  }

  // Sweep leftover auth users with the cert email prefix (failed prior cleanups).
  const { data: allUsers } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  for (const user of allUsers?.users ?? []) {
    if (user.email?.startsWith(PI_CERT_SLUG_PREFIX) && user.email.endsWith("@rtb-cert.test")) {
      await admin.auth.admin.deleteUser(user.id);
    }
  }

  const path = fixturesManifestPath();
  if (existsSync(path)) unlinkSync(path);
  console.log(`[pi:cleanup] removed ${(tenants ?? []).length} ${PI_CERT_SLUG_PREFIX} tenants`);
}
