import type { Json, SupabaseClient } from "@rtb/database";
import type { AIMemory, MemoryClassification, MemoryScopeKey } from "@rtb/types";

export class MemoryService {
  constructor(private readonly supabase: SupabaseClient) {}

  async store(input: {
    tenantId: string;
    scopeKey: MemoryScopeKey;
    scopeRefId: string;
    content: string;
    classification?: MemoryClassification;
    createdBy?: string;
    expiresAt?: string;
  }): Promise<AIMemory> {
    const { data, error } = await this.supabase
      .from("ai_memories")
      .insert({
        tenant_id: input.tenantId,
        scope_key: input.scopeKey,
        scope_ref_id: input.scopeRefId,
        content: input.content,
        classification: input.classification ?? "general",
        created_by: input.createdBy ?? null,
        expires_at: input.expiresAt ?? null,
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to store memory: ${error?.message}`);
    return mapMemory(data);
  }

  async retrieve(input: {
    tenantId: string;
    scopeKey: MemoryScopeKey;
    scopeRefId: string;
    limit?: number;
  }): Promise<AIMemory[]> {
    const { data, error } = await this.supabase
      .from("ai_memories")
      .select("*")
      .eq("tenant_id", input.tenantId)
      .eq("scope_key", input.scopeKey)
      .eq("scope_ref_id", input.scopeRefId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(input.limit ?? 20);

    if (error) throw new Error(`Failed to retrieve memory: ${error.message}`);
    return (data ?? []).map(mapMemory);
  }

  async delete(memoryId: string): Promise<void> {
    const { error } = await this.supabase
      .from("ai_memories")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", memoryId);

    if (error) throw new Error(`Failed to delete memory: ${error.message}`);
  }

  async list(tenantId: string, limit = 50): Promise<AIMemory[]> {
    const { data, error } = await this.supabase
      .from("ai_memories")
      .select("*")
      .eq("tenant_id", tenantId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to list memories: ${error.message}`);
    return (data ?? []).map(mapMemory);
  }
}

function mapMemory(row: Record<string, unknown>): AIMemory {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    scope_key: row.scope_key as MemoryScopeKey,
    scope_ref_id: row.scope_ref_id as string,
    content: row.content as string,
    classification: row.classification as MemoryClassification,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    created_by: row.created_by as string | undefined,
    expires_at: row.expires_at as string | undefined,
    deleted_at: row.deleted_at as string | undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
