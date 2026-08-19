import type { Json, SupabaseClient } from "@rtb/database";
import type { OwnerCommandScope } from "../owner-command/service";

function table(supabase: SupabaseClient, name: string) {
  return supabase.from(name as never);
}

export class BusinessContextRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getSettings(scope: OwnerCommandScope) {
    try {
      const { data, error } = await table(this.supabase, "business_os_context_settings")
        .select("*")
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId)
        .maybeSingle();
      if (error || !data) {
        return {
          ontologyVersion: "business_context_graph.v1",
          staleAfterHours: 24,
          maxDepth: 2,
          maxNeighbours: 80,
        };
      }
      const row = data as Record<string, unknown>;
      return {
        ontologyVersion: String(row.ontology_version ?? "business_context_graph.v1"),
        staleAfterHours: Number(row.stale_after_hours ?? 24),
        maxDepth: Number(row.max_depth ?? 2),
        maxNeighbours: Number(row.max_neighbours ?? 80),
      };
    } catch {
      return {
        ontologyVersion: "business_context_graph.v1",
        staleAfterHours: 24,
        maxDepth: 2,
        maxNeighbours: 80,
      };
    }
  }

  async upsertSettings(
    scope: OwnerCommandScope,
    input: { staleAfterHours?: number; maxDepth?: number; maxNeighbours?: number; provenance?: Record<string, unknown> },
  ) {
    const existing = await table(this.supabase, "business_os_context_settings")
      .select("tenant_id")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .maybeSingle();
    const row = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      ontology_version: "business_context_graph.v1",
      stale_after_hours: input.staleAfterHours ?? 24,
      max_depth: input.maxDepth ?? 2,
      max_neighbours: input.maxNeighbours ?? 80,
      provenance: (input.provenance ?? {}) as Json,
      created_by: scope.userId,
    };
    if (existing.data) {
      const { error } = await table(this.supabase, "business_os_context_settings")
        .update(row)
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await table(this.supabase, "business_os_context_settings").insert(row);
      if (error) throw new Error(error.message);
    }
  }

  async insertRun(scope: OwnerCommandScope, input: {
    status: "running" | "completed" | "failed";
    trigger: "rebuild" | "event" | "demo" | "deletion";
    nodesProjected: number;
    relationshipsProjected: number;
    unresolved: number;
    failedReason?: string | null;
    provenance?: Record<string, unknown>;
  }) {
    try {
      const { data, error } = await table(this.supabase, "business_os_context_projection_runs")
        .insert({
          tenant_id: scope.tenantId,
          workspace_id: scope.workspaceId,
          status: input.status,
          trigger: input.trigger,
          nodes_projected: input.nodesProjected,
          relationships_projected: input.relationshipsProjected,
          unresolved: input.unresolved,
          failed_reason: input.failedReason ?? null,
          ontology_version: "business_context_graph.v1",
          completed_at: new Date().toISOString(),
          provenance: (input.provenance ?? {}) as Json,
          created_by: scope.userId,
        })
        .select()
        .single();
      if (error) return null;
      return data as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  async latestRun(scope: OwnerCommandScope) {
    try {
      const { data } = await table(this.supabase, "business_os_context_projection_runs")
        .select("*")
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return (data as Record<string, unknown> | null) ?? null;
    } catch {
      return null;
    }
  }

  async listUnresolved(scope: OwnerCommandScope) {
    try {
      const { data } = await table(this.supabase, "business_os_context_unresolved")
        .select("*")
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId)
        .eq("status", "open");
      return ((data ?? []) as Record<string, unknown>[]);
    } catch {
      return [];
    }
  }

  async replaceUnresolved(
    scope: OwnerCommandScope,
    rows: Array<{ relationshipType: string; fromCanonicalRef: string; toRef: string; reason: string; sourceDomain?: string }>,
  ) {
    try {
      await table(this.supabase, "business_os_context_unresolved")
        .delete()
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId)
        .eq("status", "open");
      if (rows.length === 0) return;
      await table(this.supabase, "business_os_context_unresolved").insert(
        rows.map((row) => ({
          tenant_id: scope.tenantId,
          workspace_id: scope.workspaceId,
          relationship_type: row.relationshipType,
          from_canonical_ref: row.fromCanonicalRef,
          to_ref: row.toRef,
          reason: row.reason,
          source_domain: row.sourceDomain ?? null,
          status: "open",
          provenance: {} as Json,
        })),
      );
    } catch {
      // Projection metadata must not fail-close rebuild.
    }
  }

  async insertOverride(scope: OwnerCommandScope, input: {
    relationshipType: string;
    fromCanonicalRef: string;
    toCanonicalRef: string;
    reason: string;
    evidence: Record<string, unknown>;
  }) {
    const { data, error } = await table(this.supabase, "business_os_context_overrides")
      .insert({
        tenant_id: scope.tenantId,
        workspace_id: scope.workspaceId,
        relationship_type: input.relationshipType,
        from_canonical_ref: input.fromCanonicalRef,
        to_canonical_ref: input.toCanonicalRef,
        reason: input.reason,
        status: "active",
        evidence: input.evidence as Json,
        provenance: { reversible: true } as Json,
        created_by: scope.userId,
      })
      .select()
      .single();
    if (error || !data) throw new Error(error?.message ?? "override_failed");
    return data as Record<string, unknown>;
  }

  async reverseOverride(scope: OwnerCommandScope, id: string) {
    const { data, error } = await table(this.supabase, "business_os_context_overrides")
      .update({
        status: "reversed",
        reversed_at: new Date().toISOString(),
        reversed_by: scope.userId,
      })
      .eq("id", id)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .select()
      .single();
    if (error || !data) throw new Error(error?.message ?? "override_not_found");
    return data as Record<string, unknown>;
  }

  async listOverrides(scope: OwnerCommandScope) {
    try {
      const { data } = await table(this.supabase, "business_os_context_overrides")
        .select("*")
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId)
        .eq("status", "active");
      return (data ?? []) as Record<string, unknown>[];
    } catch {
      return [];
    }
  }
}
