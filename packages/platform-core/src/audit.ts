import type { SupabaseClient } from "@rtb/database";
import type { Json } from "@rtb/database";
import type { AuditAction, AuditEvent } from "@rtb/types";

export interface AuditLogInput {
  tenantId: string;
  workspaceId?: string;
  userId?: string;
  action: AuditAction | string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  constructor(private readonly supabase: SupabaseClient) {}

  async log(input: AuditLogInput): Promise<AuditEvent | null> {
    const { data, error } = await this.supabase
      .from("audit_events")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId ?? null,
        user_id: input.userId ?? null,
        action: input.action,
        resource_type: input.resourceType,
        resource_id: input.resourceId ?? null,
        metadata: (input.metadata ?? {}) as Json,
        ip_address: input.ipAddress ?? null,
        user_agent: input.userAgent ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("[AuditService] Failed to log event:", error.message);
      return null;
    }

    return mapAuditEvent(data);
  }

  async query(
    tenantId: string,
    options: {
      workspaceId?: string;
      userId?: string;
      action?: string;
      resourceType?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<AuditEvent[]> {
    let query = this.supabase
      .from("audit_events")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (options.workspaceId) query = query.eq("workspace_id", options.workspaceId);
    if (options.userId) query = query.eq("user_id", options.userId);
    if (options.action) query = query.eq("action", options.action);
    if (options.resourceType) query = query.eq("resource_type", options.resourceType);
    if (options.limit) query = query.limit(options.limit);
    if (options.offset) query = query.range(options.offset, options.offset + (options.limit ?? 50) - 1);

    const { data, error } = await query;
    if (error) throw new Error(`Audit query failed: ${error.message}`);
    return (data ?? []).map(mapAuditEvent);
  }
}

function mapAuditEvent(row: Record<string, unknown>): AuditEvent {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    workspace_id: row.workspace_id as string | undefined,
    user_id: row.user_id as string | undefined,
    action: row.action as string,
    resource_type: row.resource_type as string,
    resource_id: row.resource_id as string | undefined,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    ip_address: row.ip_address as string | undefined,
    user_agent: row.user_agent as string | undefined,
    created_at: row.created_at as string,
  };
}
