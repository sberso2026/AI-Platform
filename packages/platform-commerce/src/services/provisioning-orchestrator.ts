import type { SupabaseClient } from "@rtb/database";
import { InstallationErrorCode } from "../domain/installation-reason-codes";

export interface ProvisioningRunInput {
  tenantId: string;
  installationId: string;
  productSlug: string;
  idempotencyKey: string;
}

const PRODUCT_PROVISIONERS: Record<string, string> = {
  "engineering-os": "engineering_os",
  "project-intelligence": "project_intelligence",
};

export class ProvisioningOrchestrator {
  constructor(private readonly supabase: SupabaseClient) {}

  async runProductProvisioning(input: ProvisioningRunInput): Promise<void> {
    const provisionerKey = PRODUCT_PROVISIONERS[input.productSlug];
    if (!provisionerKey) {
      return;
    }

    const existing = await this.getCompletedRun(input.tenantId, input.idempotencyKey);
    if (existing) return;

    const runId = await this.createRun(input, provisionerKey);

    try {
      if (provisionerKey === "engineering_os") {
        await this.provisionEngineeringOs(input.tenantId, runId);
      } else if (provisionerKey === "project_intelligence") {
        await this.provisionProjectIntelligenceShell(input.tenantId, runId);
      }
      await this.completeRun(runId);
    } catch (err) {
      await this.failRun(runId, err);
      throw err;
    }
  }

  private async provisionEngineeringOs(tenantId: string, runId: string): Promise<void> {
    await this.upsertStep(runId, tenantId, "seed_engineering_os", "running");
    const { error } = await this.supabase.rpc("seed_tenant_engineering_os", {
      p_tenant_id: tenantId,
    });
    if (error) {
      await this.upsertStep(runId, tenantId, "seed_engineering_os", "failed", error.message);
      throw new Error(`seed_tenant_engineering_os failed: ${error.message}`);
    }
    await this.upsertStep(runId, tenantId, "seed_engineering_os", "completed");
  }

  private async provisionProjectIntelligenceShell(tenantId: string, runId: string): Promise<void> {
    await this.upsertStep(runId, tenantId, "register_project_intelligence", "running");
    const engProductId = "c1000000-0000-4000-8000-000000000001";
    const { data: parentInstall } = await this.supabase
      .from("commercial_installations")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("product_id", engProductId)
      .eq("status", "active")
      .maybeSingle();
    if (!parentInstall?.id) {
      throw new Error("Engineering OS installation required");
    }

    const { error } = await this.supabase.from("commercial_application_installations").upsert(
      {
        tenant_id: tenantId,
        product_id: engProductId,
        parent_product_installation_id: parentInstall.id,
        application_key: "project_intelligence",
        status: "active",
        installed_at: new Date().toISOString(),
        metadata: { source: "phase3_provisioning_shell" },
      },
      { onConflict: "tenant_id,product_id,application_key" }
    );
    if (error) {
      await this.upsertStep(runId, tenantId, "register_project_intelligence", "failed", error.message);
      throw new Error(`Project Intelligence registration failed: ${error.message}`);
    }
    await this.upsertStep(runId, tenantId, "register_project_intelligence", "completed");
  }

  private async getCompletedRun(tenantId: string, idempotencyKey: string) {
    const { data } = await this.supabase
      .from("commercial_provisioning_runs")
      .select("id, status")
      .eq("tenant_id", tenantId)
      .eq("idempotency_key", idempotencyKey)
      .eq("status", "completed")
      .maybeSingle();
    return data;
  }

  private async createRun(input: ProvisioningRunInput, provisionerKey: string): Promise<string> {
    const { data, error } = await this.supabase
      .from("commercial_provisioning_runs")
      .insert({
        tenant_id: input.tenantId,
        installation_id: input.installationId,
        provisioner_key: provisionerKey,
        idempotency_key: input.idempotencyKey,
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") {
        const existing = await this.getCompletedRun(input.tenantId, input.idempotencyKey);
        if (existing) return existing.id as string;
      }
      throw new Error(error.message);
    }
    return data.id as string;
  }

  private async completeRun(runId: string): Promise<void> {
    await this.supabase
      .from("commercial_provisioning_runs")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", runId);
  }

  private async failRun(runId: string, err: unknown): Promise<void> {
    await this.supabase
      .from("commercial_provisioning_runs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_code: InstallationErrorCode.PROVISIONING_FAILED,
        error_message: err instanceof Error ? err.message : String(err),
      })
      .eq("id", runId);
  }

  private async upsertStep(
    runId: string,
    tenantId: string,
    stepKey: string,
    status: string,
    errorMessage?: string
  ): Promise<void> {
    const now = new Date().toISOString();
    await this.supabase.from("commercial_provisioning_steps").upsert(
      {
        tenant_id: tenantId,
        run_id: runId,
        step_key: stepKey,
        status,
        started_at: status === "running" ? now : undefined,
        completed_at: status === "completed" || status === "failed" ? now : undefined,
        error_code: status === "failed" ? InstallationErrorCode.PROVISIONING_FAILED : null,
        metadata: errorMessage ? { error: errorMessage } : {},
      },
      { onConflict: "run_id,step_key" }
    );
  }
}
