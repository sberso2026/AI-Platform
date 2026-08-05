/**
 * Service-role lifecycle helpers for Phase 7B isolation matrix.
 */
import { createClient } from "@supabase/supabase-js";
import {
  assertProvisionEnv,
  loadFixturesManifest,
  resolveServiceRoleKey,
  resolveSupabaseUrl,
} from "./env.js";

function adminClient() {
  assertProvisionEnv();
  return createClient(resolveSupabaseUrl()!, resolveServiceRoleKey()!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function setInstallationStatus(
  installationId: string,
  status: "active" | "suspended" | "uninstalled",
): Promise<void> {
  const admin = adminClient();
  const patch: Record<string, unknown> = {
    status,
    current_state: status,
    desired_state: status === "uninstalled" ? "uninstalled" : status,
  };
  const { error } = await admin.from("commercial_installations").update(patch).eq("id", installationId);
  if (error) throw new Error(`setInstallationStatus(${status}): ${error.message}`);
}

export async function restoreFixtureInstallations(pkgDir?: string): Promise<void> {
  const manifest = loadFixturesManifest(pkgDir);
  if (!manifest) throw new Error("fixtures missing");
  await setInstallationStatus(manifest.installations.engineering.id, "active");
  await setInstallationStatus(manifest.installations.referenceOs.id, "active");
}

export async function readInstallationStatus(installationId: string): Promise<string> {
  const admin = adminClient();
  const { data, error } = await admin
    .from("commercial_installations")
    .select("status")
    .eq("id", installationId)
    .single();
  if (error || !data) throw new Error(`readInstallationStatus: ${error?.message}`);
  return data.status as string;
}
