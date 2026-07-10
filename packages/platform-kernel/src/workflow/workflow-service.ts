import type { Json, SupabaseClient } from "@rtb/database";
import type { WorkflowDefinition, WorkflowInstance } from "@rtb/types";
import type { EventBusService } from "../event-bus";

export interface StartWorkflowInput {
  tenantId: string;
  workspaceId?: string;
  definitionSlug: string;
  context?: Record<string, unknown>;
  startedBy?: string;
}

export class WorkflowService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly eventBus?: EventBusService
  ) {}

  async listDefinitions(tenantId: string): Promise<WorkflowDefinition[]> {
    const { data, error } = await this.supabase
      .from("workflow_definitions")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_active", true);

    if (error) throw new Error(`Failed to list workflows: ${error.message}`);
    return (data ?? []).map(mapDefinition);
  }

  async start(input: StartWorkflowInput): Promise<WorkflowInstance> {
    const { data: definition, error: defError } = await this.supabase
      .from("workflow_definitions")
      .select("id")
      .eq("tenant_id", input.tenantId)
      .eq("slug", input.definitionSlug)
      .single();

    if (defError || !definition) throw new Error(`Workflow not found: ${input.definitionSlug}`);

    const defRow = definition as Record<string, unknown>;

    const { data: version, error: verError } = await this.supabase
      .from("workflow_versions")
      .select("id")
      .eq("definition_id", defRow.id as string)
      .eq("status", "published")
      .order("version", { ascending: false })
      .limit(1)
      .single();

    if (verError || !version) throw new Error("No published workflow version found");

    const verRow = version as Record<string, unknown>;

    const { data: firstStep } = await this.supabase
      .from("workflow_steps")
      .select("step_key, step_type")
      .eq("version_id", verRow.id as string)
      .order("position")
      .limit(1)
      .single();

    const stepRow = firstStep as Record<string, unknown> | null;

    const { data: instance, error: instError } = await this.supabase
      .from("workflow_instances")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId ?? null,
        definition_id: defRow.id as string,
        version_id: verRow.id as string,
        status: stepRow?.step_type === "human_review" || stepRow?.step_type === "approval"
          ? "waiting_review"
          : "running",
        current_step_key: (stepRow?.step_key as string) ?? null,
        context: (input.context ?? {}) as Json,
        started_by: input.startedBy ?? null,
      })
      .select()
      .single();

    if (instError || !instance) throw new Error(`Failed to start workflow: ${instError?.message}`);

    if (firstStep) {
      const s = firstStep as Record<string, unknown>;
      await this.supabase.from("workflow_step_runs").insert({
        instance_id: instance.id as string,
        step_key: s.step_key as string,
        step_type: s.step_type as string,
        status: "running",
        started_at: new Date().toISOString(),
      });
    }

    await this.eventBus?.publish({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      eventType: "workflow.started",
      source: "workflow-engine",
      payload: { instance_id: instance.id as string, definition_slug: input.definitionSlug },
    });

    return mapInstance(instance);
  }

  async listInstances(tenantId: string, limit = 50): Promise<WorkflowInstance[]> {
    const { data, error } = await this.supabase
      .from("workflow_instances")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to list instances: ${error.message}`);
    return (data ?? []).map(mapInstance);
  }
}

function mapDefinition(row: Record<string, unknown>): WorkflowDefinition {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: row.description as string | undefined,
    category: row.category as string,
    is_active: row.is_active as boolean,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function mapInstance(row: Record<string, unknown>): WorkflowInstance {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    workspace_id: row.workspace_id as string | undefined,
    definition_id: row.definition_id as string,
    version_id: row.version_id as string,
    status: row.status as WorkflowInstance["status"],
    current_step_key: row.current_step_key as string | undefined,
    context: (row.context as Record<string, unknown>) ?? {},
    started_by: row.started_by as string | undefined,
    started_at: row.started_at as string,
    completed_at: row.completed_at as string | undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
