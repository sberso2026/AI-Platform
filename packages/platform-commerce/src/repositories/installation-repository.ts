import type { SupabaseClient } from "@rtb/database";
import type {
  CommercialInstallation,
  InstallationHealthCheckResult,
  InstallationWorkflowStep,
  ProductInstallationStatus,
  WorkspaceProductAssignment,
} from "@rtb/types";
import { BaseRepository } from "./base-repository";
import { InstallationStateMachine } from "../domain/installation-state-machine";

export interface TransitionInstallationInput {
  tenantId: string;
  installationId: string;
  targetStatus: ProductInstallationStatus;
  actorUserId?: string;
  correlationId?: string;
  patch?: Record<string, unknown>;
}

export class InstallationRepository extends BaseRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async listByTenant(tenantId: string): Promise<CommercialInstallation[]> {
    const { data, error } = await this.supabase
      .from("commercial_installations")
      .select("*")
      .eq("tenant_id", tenantId)
      .is("deleted_at", null);
    if (error) this.fail("list installations", error);
    return this.mapRows<CommercialInstallation>(data).map(this.normalize);
  }

  async getById(tenantId: string, id: string): Promise<CommercialInstallation | null> {
    const { data, error } = await this.supabase
      .from("commercial_installations")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) this.fail("get installation", error);
    return data ? this.normalize(this.mapRow<CommercialInstallation>(data)) : null;
  }

  async getByProduct(tenantId: string, productId: string): Promise<CommercialInstallation | null> {
    const { data, error } = await this.supabase
      .from("commercial_installations")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("product_id", productId)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) this.fail("get installation by product", error);
    return data ? this.normalize(this.mapRow<CommercialInstallation>(data)) : null;
  }

  async create(input: {
    tenantId: string;
    productId: string;
    subscriptionId?: string;
    licenceId?: string;
    requestedVersion?: string;
    requestedBy: string;
    workspaceId?: string | null;
    status?: ProductInstallationStatus;
    metadata?: Record<string, unknown>;
  }): Promise<CommercialInstallation> {
    const now = new Date().toISOString();
    const status = input.status ?? "requested";
    const { data, error } = await this.supabase
      .from("commercial_installations")
      .insert({
        tenant_id: input.tenantId,
        product_id: input.productId,
        subscription_id: input.subscriptionId ?? null,
        licence_id: input.licenceId ?? null,
        workspace_id: input.workspaceId ?? null,
        requested_version: input.requestedVersion ?? null,
        requested_by: input.requestedBy,
        requested_at: now,
        status,
        desired_state: "active",
        current_state: status,
        metadata: input.metadata ?? {},
        created_by: input.requestedBy,
      })
      .select("*")
      .single();
    if (error) this.fail("create installation", error);
    return this.normalize(this.mapRow<CommercialInstallation>(data));
  }

  async transition(input: TransitionInstallationInput): Promise<CommercialInstallation> {
    const existing = await this.getById(input.tenantId, input.installationId);
    if (!existing) throw new Error(`Installation not found: ${input.installationId}`);

    const from = InstallationStateMachine.normalizeProductStatus(existing.status);
    const to = input.targetStatus;
    InstallationStateMachine.assertProductTransition(from, to);

    const now = new Date().toISOString();
    const patch: Record<string, unknown> = {
      status: to,
      current_state: to,
      updated_by: input.actorUserId ?? null,
      ...input.patch,
    };
    if (to === "provisioning" && !existing.started_at) patch.started_at = now;
    if (to === "active") {
      patch.completed_at = now;
      patch.installed_at = now;
    }
    if (to === "failed") patch.failed_at = now;

    const { data, error } = await this.supabase
      .from("commercial_installations")
      .update(patch)
      .eq("tenant_id", input.tenantId)
      .eq("id", input.installationId)
      .select("*")
      .single();
    if (error) this.fail("transition installation", error);
    return this.normalize(this.mapRow<CommercialInstallation>(data));
  }

  async recordEvent(
    tenantId: string,
    installationId: string,
    eventType: string,
    fromStatus: string | null,
    toStatus: string | null,
    payload: Record<string, unknown>,
    createdBy?: string
  ): Promise<void> {
    const { error } = await this.supabase.from("commercial_installation_events").insert({
      tenant_id: tenantId,
      installation_id: installationId,
      event_type: eventType,
      from_status: fromStatus,
      to_status: toStatus,
      payload,
      created_by: createdBy ?? null,
    });
    if (error) this.fail("record installation event", error);
  }

  async createWorkflow(
    tenantId: string,
    installationId: string,
    workflowType: string,
    correlationId?: string
  ): Promise<string> {
    const { data, error } = await this.supabase
      .from("commercial_installation_workflows")
      .insert({
        tenant_id: tenantId,
        installation_id: installationId,
        workflow_type: workflowType,
        status: "pending",
        correlation_id: correlationId ?? null,
      })
      .select("id")
      .single();
    if (error) this.fail("create workflow", error);
    return data.id as string;
  }

  async upsertWorkflowStep(
    tenantId: string,
    workflowId: string,
    step: Pick<InstallationWorkflowStep, "step_key" | "step_order" | "status"> & {
      error_code?: string;
      error_message?: string;
    }
  ): Promise<void> {
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = {
      tenant_id: tenantId,
      workflow_id: workflowId,
      step_key: step.step_key,
      step_order: step.step_order,
      status: step.status,
      error_code: step.error_code ?? null,
      error_message: step.error_message ?? null,
    };
    if (step.status === "running") patch.started_at = now;
    if (step.status === "completed" || step.status === "failed") patch.completed_at = now;

    const { error } = await this.supabase
      .from("commercial_installation_steps")
      .upsert(patch, { onConflict: "workflow_id,step_key" });
    if (error) this.fail("upsert workflow step", error);
  }

  async listWorkflowSteps(tenantId: string, workflowId: string): Promise<InstallationWorkflowStep[]> {
    const { data, error } = await this.supabase
      .from("commercial_installation_steps")
      .select("step_key, step_order, status, started_at, completed_at, error_code, error_message")
      .eq("tenant_id", tenantId)
      .eq("workflow_id", workflowId)
      .order("step_order", { ascending: true });
    if (error) this.fail("list workflow steps", error);
    return (data ?? []) as InstallationWorkflowStep[];
  }

  async getActiveWorkflow(tenantId: string, installationId: string) {
    const { data, error } = await this.supabase
      .from("commercial_installation_workflows")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("installation_id", installationId)
      .in("status", ["pending", "running"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) this.fail("get active workflow", error);
    return data;
  }

  async saveHealthCheck(
    tenantId: string,
    installationId: string,
    result: InstallationHealthCheckResult
  ): Promise<void> {
    const { error: insertError } = await this.supabase
      .from("commercial_installation_health_checks")
      .insert({
        tenant_id: tenantId,
        installation_id: installationId,
        health_state: result.healthState,
        checks: result.checks,
        summary: result.summary ?? null,
        checked_at: result.checkedAt,
      });
    if (insertError) this.fail("save health check", insertError);

    await this.supabase
      .from("commercial_installations")
      .update({ last_health_check_at: result.checkedAt })
      .eq("tenant_id", tenantId)
      .eq("id", installationId);
  }

  async listWorkspaceAssignments(tenantId: string, installationId: string): Promise<WorkspaceProductAssignment[]> {
    const { data, error } = await this.supabase
      .from("commercial_workspace_product_assignments")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("installation_id", installationId)
      .eq("status", "active");
    if (error) this.fail("list workspace assignments", error);
    return this.mapRows<WorkspaceProductAssignment>(data);
  }

  async assignWorkspace(input: {
    tenantId: string;
    workspaceId: string;
    installationId: string;
    productId: string;
    assignedBy: string;
  }): Promise<WorkspaceProductAssignment> {
    const { data, error } = await this.supabase
      .from("commercial_workspace_product_assignments")
      .upsert(
        {
          tenant_id: input.tenantId,
          workspace_id: input.workspaceId,
          installation_id: input.installationId,
          product_id: input.productId,
          status: "active",
          assigned_by: input.assignedBy,
          assigned_at: new Date().toISOString(),
          removed_at: null,
        },
        { onConflict: "workspace_id,installation_id" }
      )
      .select("*")
      .single();
    if (error) this.fail("assign workspace", error);
    return this.mapRow<WorkspaceProductAssignment>(data);
  }

  async removeWorkspaceAssignment(tenantId: string, assignmentId: string): Promise<void> {
    const { error } = await this.supabase
      .from("commercial_workspace_product_assignments")
      .update({ status: "removed", removed_at: new Date().toISOString() })
      .eq("tenant_id", tenantId)
      .eq("id", assignmentId);
    if (error) this.fail("remove workspace assignment", error);
  }

  private normalize(row: CommercialInstallation): CommercialInstallation {
    return {
      ...row,
      status: InstallationStateMachine.normalizeProductStatus(row.status),
      installed_version: row.installed_version ?? row.version ?? null,
    };
  }
}
