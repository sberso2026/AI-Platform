import type { Json, SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import { EngineeringObjectFramework } from "../services/object-framework";
import { assertA4GovernedRelationWrite } from "../decision-intelligence/relations";
import {
  assertBaselineStatus,
  assertBaselineType,
  assertFrozenBaselineMutable,
  type BaselineStatus,
  type BaselineType,
} from "./invariants";

async function nextBaselineCode(supabase: SupabaseClient, tenantId: string, workspaceId: string): Promise<string> {
  const { count } = await supabase
    .from("engineering_configuration_baselines")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("workspace_id", workspaceId);
  return `BL-${String((count ?? 0) + 1).padStart(4, "0")}`;
}

export class EngineeringConfigurationService {
  private framework: EngineeringObjectFramework;

  constructor(
    private readonly supabase: SupabaseClient,
    kernel?: PlatformKernel,
  ) {
    this.framework = new EngineeringObjectFramework(supabase, kernel);
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, projectId?: string, limit = 100) {
    assertEngineeringService(commerce, "configuration.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    let q = this.supabase
      .from("engineering_configuration_baselines")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .order("baseline_code")
      .limit(limit);
    if (projectId) q = q.eq("project_id", projectId);
    const { data, error } = await q;
    if (error) throw new Error(`Failed to list configuration baselines: ${error.message}`);
    return data ?? [];
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "configuration.get", tenantId);
    const row = await this.requireBaseline(tenantId, id, commerce);
    const { data: items, error } = await this.supabase
      .from("engineering_configuration_items")
      .select("*")
      .eq("baseline_id", id)
      .eq("tenant_id", tenantId)
      .order("captured_at");
    if (error) throw new Error(`Failed to list configuration items: ${error.message}`);
    const links = await this.framework.listLinks(tenantId, "configuration_baseline", id);
    return {
      baseline: row,
      items: items ?? [],
      itemCount: (items ?? []).length,
      links,
    };
  }

  async create(
    commerce: CommerceExecutionContext,
    input: {
      tenantId: string;
      name: string;
      baselineType: BaselineType | string;
      baselineCode?: string;
      description?: string;
      status?: BaselineStatus;
      projectId?: string;
      effectiveAt?: string;
      supersedesBaselineId?: string;
      createdBy?: string;
    },
  ) {
    assertEngineeringService(commerce, "configuration.create", input.tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace required");
    assertBaselineType(input.baselineType);
    if (input.status) assertBaselineStatus(input.status);
    if (input.status && input.status !== "draft") {
      throw new Error("new configuration baselines must be created as draft");
    }
    if (input.supersedesBaselineId) {
      await this.requireBaseline(input.tenantId, input.supersedesBaselineId, commerce);
    }
    const code = input.baselineCode?.trim() || (await nextBaselineCode(this.supabase, input.tenantId, workspaceId));
    const { data, error } = await this.supabase
      .from("engineering_configuration_baselines")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: workspaceId,
        project_id: input.projectId ?? null,
        baseline_code: code,
        name: input.name,
        description: input.description ?? null,
        baseline_type: input.baselineType,
        status: "draft",
        effective_at: input.effectiveAt ?? null,
        supersedes_baseline_id: input.supersedesBaselineId ?? null,
        created_by: input.createdBy ?? null,
        metadata: {} as Json,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create configuration baseline: ${error?.message}`);
    if (input.supersedesBaselineId) {
      await this.framework
        .linkObjects({
          tenantId: input.tenantId,
          fromType: "configuration_baseline",
          fromId: data.id as string,
          toType: "configuration_baseline",
          toId: input.supersedesBaselineId,
          relationship: "SUPERSEDES",
          createdBy: input.createdBy,
          governed: true,
        })
        .catch(() => undefined);
    }
    await this.framework
      .publishCreated({
        tenantId: input.tenantId,
        workspaceId,
        objectType: "configuration_baseline",
        objectId: data.id as string,
        projectId: input.projectId,
        title: `Configuration baseline created: ${input.name}`,
        actorId: input.createdBy,
      })
      .catch(() => undefined);
    return data;
  }

  async addItem(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      baselineId: string;
      objectType: string;
      objectId: string;
      revisionRef?: string | null;
      objectCodeSnapshot?: string | null;
      objectTitleSnapshot?: string | null;
      effectiveState?: string | null;
      capturedBy?: string;
    },
  ) {
    assertEngineeringService(commerce, "configuration.update", tenantId);
    const baseline = await this.requireBaseline(tenantId, input.baselineId, commerce);
    assertFrozenBaselineMutable(String(baseline.status));
    const workspaceId = String(baseline.workspace_id);
    const { data, error } = await this.supabase
      .from("engineering_configuration_items")
      .insert({
        tenant_id: tenantId,
        workspace_id: workspaceId,
        baseline_id: input.baselineId,
        object_type: input.objectType,
        object_id: input.objectId,
        revision_ref: input.revisionRef ?? null,
        object_code_snapshot: input.objectCodeSnapshot ?? null,
        object_title_snapshot: input.objectTitleSnapshot ?? null,
        effective_state: input.effectiveState ?? null,
        captured_by: input.capturedBy ?? null,
        provenance: {
          captured_from: "engineering_core",
          live_object_not_authoritative_after_freeze: true,
        } as Json,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to add configuration item: ${error?.message}`);
    await this.framework
      .recordTimeline({
        tenantId,
        workspaceId,
        eventType: "configuration.item_added",
        objectType: "configuration_baseline",
        objectId: input.baselineId,
        title: `Configuration item added: ${input.objectType}`,
        actorId: input.capturedBy,
      })
      .catch(() => undefined);
    return data;
  }

  async removeItem(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { baselineId: string; itemId: string; actorId?: string },
  ) {
    assertEngineeringService(commerce, "configuration.update", tenantId);
    const baseline = await this.requireBaseline(tenantId, input.baselineId, commerce);
    assertFrozenBaselineMutable(String(baseline.status));
    const { error } = await this.supabase
      .from("engineering_configuration_items")
      .delete()
      .eq("id", input.itemId)
      .eq("baseline_id", input.baselineId)
      .eq("tenant_id", tenantId);
    if (error) throw new Error(`Failed to remove configuration item: ${error.message}`);
    await this.framework
      .recordTimeline({
        tenantId,
        workspaceId: workspaceScopeId(commerce) ?? undefined,
        eventType: "configuration.item_removed",
        objectType: "configuration_baseline",
        objectId: input.baselineId,
        title: "Configuration item removed",
        actorId: input.actorId,
      })
      .catch(() => undefined);
  }

  async freeze(commerce: CommerceExecutionContext, tenantId: string, id: string, actorId?: string) {
    assertEngineeringService(commerce, "configuration.update", tenantId);
    const baseline = await this.requireBaseline(tenantId, id, commerce);
    if (String(baseline.status) !== "draft") {
      throw new Error("only draft configuration baselines can be frozen");
    }
    const { data, error } = await this.supabase
      .from("engineering_configuration_baselines")
      .update({
        status: "frozen",
        frozen_at: new Date().toISOString(),
        frozen_by: actorId ?? null,
      })
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to freeze configuration baseline: ${error?.message}`);
    await this.framework
      .recordTimeline({
        tenantId,
        workspaceId: workspaceScopeId(commerce) ?? undefined,
        eventType: "configuration.frozen",
        objectType: "configuration_baseline",
        objectId: id,
        title: `Configuration baseline frozen: ${String(baseline.baseline_code)}`,
        actorId,
      })
      .catch(() => undefined);
    return data;
  }

  async supersede(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      priorBaselineId: string;
      name: string;
      baselineType?: string;
      copyItems?: boolean;
      createdBy?: string;
    },
  ) {
    assertEngineeringService(commerce, "configuration.create", tenantId);
    const prior = await this.requireBaseline(tenantId, input.priorBaselineId, commerce);
    if (String(prior.status) !== "frozen") {
      throw new Error("only frozen baselines can be superseded");
    }
    const created = await this.create(commerce, {
      tenantId,
      name: input.name,
      baselineType: input.baselineType ?? String(prior.baseline_type),
      projectId: (prior.project_id as string | undefined) ?? undefined,
      supersedesBaselineId: input.priorBaselineId,
      createdBy: input.createdBy,
    });
    const { error: markError } = await this.supabase
      .from("engineering_configuration_baselines")
      .update({ status: "superseded" })
      .eq("id", input.priorBaselineId)
      .eq("tenant_id", tenantId);
    if (markError) throw new Error(`Failed to mark prior baseline superseded: ${markError.message}`);
    if (input.copyItems !== false) {
      const detail = await this.get(commerce, tenantId, input.priorBaselineId);
      for (const item of detail.items as Record<string, unknown>[]) {
        await this.addItem(commerce, tenantId, {
          baselineId: created.id as string,
          objectType: String(item.object_type),
          objectId: String(item.object_id),
          revisionRef: (item.revision_ref as string | null) ?? null,
          objectCodeSnapshot: (item.object_code_snapshot as string | null) ?? null,
          objectTitleSnapshot: (item.object_title_snapshot as string | null) ?? null,
          effectiveState: (item.effective_state as string | null) ?? null,
          capturedBy: input.createdBy,
        });
      }
    }
    assertA4GovernedRelationWrite({
      relationship: "SUPERSEDES",
      fromType: "configuration_baseline",
      toType: "configuration_baseline",
    });
    return created;
  }

  async compare(commerce: CommerceExecutionContext, tenantId: string, leftId: string, rightId: string) {
    assertEngineeringService(commerce, "configuration.get", tenantId);
    const [left, right] = await Promise.all([
      this.get(commerce, tenantId, leftId),
      this.get(commerce, tenantId, rightId),
    ]);
    const keyOf = (item: Record<string, unknown>) =>
      `${String(item.object_type)}:${String(item.object_id)}:${String(item.revision_ref ?? "")}`;
    const leftKeys = new Set((left.items as Record<string, unknown>[]).map(keyOf));
    const rightKeys = new Set((right.items as Record<string, unknown>[]).map(keyOf));
    return {
      left: left.baseline,
      right: right.baseline,
      onlyInLeft: (left.items as Record<string, unknown>[]).filter((item) => !rightKeys.has(keyOf(item))),
      onlyInRight: (right.items as Record<string, unknown>[]).filter((item) => !leftKeys.has(keyOf(item))),
      inBoth: (left.items as Record<string, unknown>[]).filter((item) => rightKeys.has(keyOf(item))),
    };
  }

  private async requireBaseline(tenantId: string, id: string, commerce: CommerceExecutionContext) {
    const workspaceId = workspaceScopeId(commerce);
    let q = this.supabase
      .from("engineering_configuration_baselines")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id);
    if (workspaceId) q = q.eq("workspace_id", workspaceId);
    const { data, error } = await q.maybeSingle();
    if (error || !data) throw new Error("Configuration baseline not found in tenant/workspace scope");
    return data as Record<string, unknown>;
  }
}
