/**
 * Deletes certification tenants, users, and orphan signup tenants from cert-fixtures.json.
 */
import { existsSync, readFileSync, unlinkSync } from "node:fs";

import { createClient } from "@supabase/supabase-js";

import {
  assertProvisionEnv,
  fixturesManifestPath,
  type CertFixturesManifest,
} from "./lib/env.js";

function log(msg: string): void {
  console.log(`[installation:cleanup] ${msg}`);
}

async function deleteTenant(admin: ReturnType<typeof createClient>, tenantId: string): Promise<void> {
  const { error } = await admin.from("tenants").delete().eq("id", tenantId);
  if (error) log(`tenant delete warning ${tenantId}: ${error.message}`);
}

async function deleteUser(admin: ReturnType<typeof createClient>, userId: string): Promise<void> {
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) log(`user delete warning ${userId}: ${error.message}`);
}

export async function cleanupInstallationFixtures(): Promise<void> {
  assertProvisionEnv();

  const manifestPath = fixturesManifestPath();
  if (!existsSync(manifestPath)) {
    log("No cert-fixtures.json — nothing to cleanup");
    return;
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as CertFixturesManifest;
  const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const userIds = new Set<string>();
  for (const tenant of [manifest.tenantA, manifest.tenantB]) {
    for (const user of Object.values(tenant.users)) {
      userIds.add(user.userId);
    }
  }

  log(`Cleanup tenant A: ${manifest.tenantA.slug}`);
  await deleteTenant(admin, manifest.tenantA.id);
  log(`Cleanup tenant B: ${manifest.tenantB.slug}`);
  await deleteTenant(admin, manifest.tenantB.id);

  for (const orphanId of manifest.orphanTenantIds ?? []) {
    log(`Cleanup orphan tenant: ${orphanId}`);
    await deleteTenant(admin, orphanId);
  }

  for (const userId of userIds) {
    await deleteUser(admin, userId);
  }

  unlinkSync(manifestPath);
  log("Removed cert-fixtures.json");
  log("Result: PASS");
}
