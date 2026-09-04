import type { Json, SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import type { CommerceExecutionContext, EngineeringObjectType } from "@rtb/types";
import { REGISTER_KG_NODE_TYPES } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";

type EngineeringObjectTable =
  | "engineering_decisions"
  | "engineering_actions"
  | "engineering_risks"
  | "engineering_issues"
  | "engineering_technical_queries"
  | "engineering_lessons"
  | "engineering_projects"
  | "engineering_assets"
  | "engineering_documents";

export class EngineeringObjectFramework {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel?: PlatformKernel
  ) {}

  async recordTimeline(input: {
    tenantId: string;
    workspaceId?: string;
    eventType: string;
    objectType: string;
    objectId?: string;
    projectId?: string;
    assetId?: string;
    title: string;
    summary?: string;
    actorId?: string;
    metadata?: Record<string, unknown>;
  }) {
    const { data, error } = await this.supabase
      .from("engineering_timeline_events")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId ?? null,
        event_type: input.eventType,
        object_type: input.objectType,
        object_id: input.objectId ?? null,
        project_id: input.projectId ?? null,
        asset_id: input.assetId ?? null,
        title: input.title,
        summary: input.summary ?? null,
        actor_id: input.actorId ?? null,
        metadata: (input.metadata ?? {}) as Json,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to record timeline: ${error.message}`);
    return data;
  }

  async recordActivity(input: {
    tenantId: string;
    workspaceId?: string;
    activityType: string;
    objectType?: string;
    objectId?: string;
    projectId?: string;
    title: string;
    body?: string;
    actorId?: string;
    severity?: string;
    metadata?: Record<string, unknown>;
  }) {
    const { data, error } = await this.supabase
      .from("engineering_activity_events")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId ?? null,
        activity_type: input.activityType,
        object_type: input.objectType ?? null,
        object_id: input.objectId ?? null,
        project_id: input.projectId ?? null,
        title: input.title,
        body: input.body ?? null,
        actor_id: input.actorId ?? null,
        severity: input.severity ?? "info",
        metadata: (input.metadata ?? {}) as Json,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to record activity: ${error.message}`);
    return data;
  }

  async linkObjects(input: {
    tenantId: string;
    fromType: EngineeringObjectType | string;
    fromId: string;
    toType: EngineeringObjectType | string;
    toId: string;
    relationship: string;
    createdBy?: string;
  }) {
    const { data, error } = await this.supabase
      .from("engineering_object_links")
      .upsert({
        tenant_id: input.tenantId,
        from_type: input.fromType,
        from_id: input.fromId,
        to_type: input.toType,
        to_id: input.toId,
        relationship: input.relationship,
        created_by: input.createdBy ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to link objects: ${error.message}`);

    // Best-effort KG edge if both knowledge nodes known
    if (this.kernel) {
      try {
        const fromNode = await this.resolveKnowledgeNode(input.fromType, input.fromId);
        const toNode = await this.resolveKnowledgeNode(input.toType, input.toId);
        if (fromNode && toNode) {
          await this.kernel.knowledgeGraph.createEdge({
            tenantId: input.tenantId,
            fromNodeId: fromNode,
            toNodeId: toNode,
            edgeType: input.relationship,
            createdBy: input.createdBy,
          });
        }
      } catch {
        // ignore
      }
    }
    return data;
  }

  async addComment(input: {
    tenantId: string;
    objectType: string;
    objectId: string;
    body: string;
    createdBy?: string;
  }) {
    const { data, error } = await this.supabase
      .from("engineering_object_comments")
      .insert({
        tenant_id: input.tenantId,
        object_type: input.objectType,
        object_id: input.objectId,
        body: input.body,
        created_by: input.createdBy ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to add comment: ${error.message}`);
    return data;
  }

  async listComments(tenantId: string, objectType: string, objectId: string) {
    const { data, error } = await this.supabase
      .from("engineering_object_comments")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("object_type", objectType)
      .eq("object_id", objectId)
      .order("created_at");
    if (error) throw new Error(`Failed to list comments: ${error.message}`);
    return data ?? [];
  }

  async listLinks(tenantId: string, objectType: string, objectId: string) {
    const { data, error } = await this.supabase
      .from("engineering_object_links")
      .select("*")
      .eq("tenant_id", tenantId)
      .or(
        `and(from_type.eq.${objectType},from_id.eq.${objectId}),and(to_type.eq.${objectType},to_id.eq.${objectId})`
      );
    if (error) throw new Error(`Failed to list links: ${error.message}`);
    return data ?? [];
  }

  async createKnowledgeNode(input: {
    tenantId: string;
    workspaceId?: string;
    objectType: string;
    objectId: string;
    title: string;
    content?: Record<string, unknown>;
    createdBy?: string;
  }): Promise<string | undefined> {
    if (!this.kernel) return undefined;
    const nodeType = REGISTER_KG_NODE_TYPES[input.objectType] ?? `engineering_${input.objectType}`;
    const node = await this.kernel.knowledgeGraph.createNode({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      nodeType,
      title: input.title,
      content: { object_type: input.objectType, object_id: input.objectId, ...(input.content ?? {}) },
      sourceRef: input.objectId,
      createdBy: input.createdBy,
    });
    return node.id;
  }

  async publishCreated(input: {
    tenantId: string;
    workspaceId?: string;
    objectType: string;
    objectId: string;
    title: string;
    projectId?: string;
    assetId?: string;
    actorId?: string;
    eventSuffix?: string;
  }) {
    const eventType = `engineering.${input.objectType}.${input.eventSuffix ?? "created"}`;
    await this.recordTimeline({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      eventType,
      objectType: input.objectType,
      objectId: input.objectId,
      projectId: input.projectId,
      assetId: input.assetId,
      title: input.title,
      actorId: input.actorId,
    });
    await this.recordActivity({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      activityType: eventType,
      objectType: input.objectType,
      objectId: input.objectId,
      projectId: input.projectId,
      title: input.title,
      actorId: input.actorId,
    });
    await this.kernel?.eventBus.publish({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      eventType,
      source: "engineering-os",
      payload: {
        object_type: input.objectType,
        object_id: input.objectId,
        title: input.title,
      },
    });
    await this.supabase.from("engineering_audit_links").insert({
      tenant_id: input.tenantId,
      entity_type: input.objectType,
      entity_id: input.objectId,
      action: input.eventSuffix ?? "create",
    });
  }

  private async resolveKnowledgeNode(objectType: string, objectId: string): Promise<string | null> {
    const table = this.tableForType(objectType);
    if (!table) return null;
    const { data } = await this.supabase
      .from(table)
      .select("knowledge_node_id")
      .eq("id", objectId)
      .maybeSingle();
    return (data?.knowledge_node_id as string) ?? null;
  }

  private tableForType(objectType: string): EngineeringObjectTable | null {
    const map: Record<string, EngineeringObjectTable> = {
      decision: "engineering_decisions",
      action: "engineering_actions",
      risk: "engineering_risks",
      issue: "engineering_issues",
      technical_query: "engineering_technical_queries",
      lesson: "engineering_lessons",
      project: "engineering_projects",
      asset: "engineering_assets",
      document: "engineering_documents",
    };
    return map[objectType] ?? null;
  }
}

export class EngineeringTimelineService {
  constructor(private readonly supabase: SupabaseClient) {}

  async list(commerce: CommerceExecutionContext, tenantId: string, limit = 50, projectId?: string) {
    assertEngineeringService(commerce, "timeline.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    let query = this.supabase
      .from("engineering_timeline_events")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .order("occurred_at", { ascending: false })
      .limit(limit);
    if (projectId) query = query.eq("project_id", projectId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list timeline: ${error.message}`);
    return data ?? [];
  }
}

export class EngineeringActivityService {
  constructor(private readonly supabase: SupabaseClient) {}

  async list(commerce: CommerceExecutionContext, tenantId: string, limit = 50, projectId?: string) {
    assertEngineeringService(commerce, "activity.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    let query = this.supabase
      .from("engineering_activity_events")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (projectId) query = query.eq("project_id", projectId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list activity: ${error.message}`);
    return data ?? [];
  }
}
