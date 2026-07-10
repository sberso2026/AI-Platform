import type { InstallationHealthCheckResult, InstallationHealthState } from "@rtb/types";
import { InstallationStateMachine } from "../domain/installation-state-machine";
import { SubscriptionStateMachine } from "../domain/subscription-state-machine";
import type { InstallationRepository } from "../repositories/installation-repository";
import type { SubscriptionRepository } from "../repositories/subscription-repository";
import type { LicenseRepository } from "../repositories/license-repository";
import type { SupabaseClient } from "@rtb/database";

export class InstallationHealthService {
  constructor(
    private readonly installations: InstallationRepository,
    private readonly subscriptions: SubscriptionRepository,
    private readonly licenses: LicenseRepository,
    private readonly supabase: SupabaseClient
  ) {}

  async check(tenantId: string, installationId: string): Promise<InstallationHealthCheckResult> {
    const installation = await this.installations.getById(tenantId, installationId);
    if (!installation) {
      return {
        installationId,
        healthState: "failed",
        checks: [{ key: "installation", passed: false, detail: "not_found" }],
        checkedAt: new Date().toISOString(),
      };
    }

    const checks: InstallationHealthCheckResult["checks"] = [];
    let healthState: InstallationHealthState = "healthy";

    if (installation.subscription_id) {
      const subs = await this.subscriptions.listByTenant(tenantId);
      const sub = subs.find((s) => s.id === installation.subscription_id);
      const subOk = Boolean(sub && SubscriptionStateMachine.isAccessGranting(sub.status as never));
      checks.push({ key: "subscription_active", passed: subOk });
      if (!subOk) healthState = "suspended";
    }

    if (installation.licence_id) {
      const licences = await this.licenses.listByTenant(tenantId);
      const lic = licences.find((l) => l.id === installation.licence_id);
      const licOk = lic?.status === "active";
      checks.push({ key: "licence_active", passed: Boolean(licOk) });
      if (!licOk) healthState = healthState === "healthy" ? "degraded" : healthState;
    }

    const installOk = InstallationStateMachine.isAccessGranting(installation.status);
    checks.push({ key: "installation_active", passed: installOk });
    if (!installOk) healthState = installation.status === "suspended" ? "suspended" : "failed";

    if (installation.product_id) {
      const { count } = await this.supabase
        .from("engineering_settings")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId);
      checks.push({ key: "engineering_seed_data", passed: (count ?? 0) > 0 });
    }

    const assignments = await this.installations.listWorkspaceAssignments(tenantId, installationId);
    checks.push({ key: "workspace_assignments_valid", passed: true, detail: String(assignments.length) });

    const result: InstallationHealthCheckResult = {
      installationId,
      healthState,
      checks,
      summary: `${checks.filter((c) => c.passed).length}/${checks.length} checks passed`,
      checkedAt: new Date().toISOString(),
    };

    await this.installations.saveHealthCheck(tenantId, installationId, result);
    return result;
  }
}
