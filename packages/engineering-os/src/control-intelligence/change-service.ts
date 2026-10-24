import type { Json, SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import { EngineeringObjectFramework } from "../services/object-framework";
import { assertA4GovernedRelationWrite } from "../decision-intelligence/relations";
import {
  assertAffectsTargetType,
  assertChangeStatus,
  assertChangeTransition,
  assertChangeType,
  type AffectsTargetType,
  type ChangeStatus,
  type ChangeType,
} from "./invariants";

async function nextChangeCode(supabase: SupabaseClient, tenantId: string, workspaceId: string): Promise<string> {
  const { count } = await supabase
    .from("engineering_changes")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("workspace_id", workspaceId);
  return `CHG-${String((count ?? 0) + 1).padStart(4, "0")}`;
}

export class EngineeringChangeService {
  private framework: EngineeringObjectFramework;

  constructor(
    private readonly supabase: SupabaseClient,
    kernel?: PlatformKernel,
  ) {
    this.framework = new EngineeringObjectFramework(supabase, kernel);
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, projectId?: string, limit = 100) {
    assertEngineeringService(commerce, "change.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    let q = this.supabase
      .from("engineering_changes")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .order("change_code")
      .limit(limit);
    if (projectId) q = q.eq("project_id", projectId);
    const { data, error } = await q;
    if (error) throw new Error(`Failed to list changes: ${error.message}`);
    return data ?? [];
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "change.get", tenantId);
    const row = await this.requireRow(tenantId, id, commerce);
    const workspaceId = workspaceScopeId(commerce);
    const links = await this.framework.listLinks(tenantId, "change", id);
    const affected = (links as Record<string, unknown>[]).filter((link) => link.relationship === "AFFECTS");
    const basedOn = (links as Record<string, unknown>[]).filter((link) => link.relationship === "BASED_ON");
    const caused = (links as Record<string, unknown>[]).filter((link) => link.relationship === "CAUSED_BY");
    const impactIds = caused
      .map((link) => (link.from_type === "impact" ? String(link.from_id) : link.to_type === "impact" ? String(link.to_id) : null))
      .filter((value): value is string => Boolean(value));
    let impacts: Record<string, unknown>[] = [];
    if (workspaceId && impactIds.length) {
      const { data } = await this.supabase
        .from("engineering_impacts")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId)
        .in("id", impactIds)
        .order("impact_code");
      impacts = (data ?? []) as Record<string, unknown>[];
    }
    return {
      change: row,
      affected,
      basedOn,
      causedByLinks: caused,
      impacts,
      affectedCount: affected.length,
      impactCount: impacts.length,
      links,
    };
  }

  async create(
    commerce: CommerceExecutionContext,
    input: {
      tenantId: string;
      title: string;
      changeType: ChangeType | string;
      changeCode?: string;
      description?: string;
      source?: string;
      reason?: string;
      status?: ChangeStatus;
      priority?: string;
      ownerId?: string;
      requestedBy?: string;
      projectId?: string;
      effectiveAt?: string;
      createdBy?: string;
    },
  ) {
    assertEngineeringService(commerce, "change.create", input.tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace required");
    assertChangeType(input.changeType);
    if (input.status) assertChangeStatus(input.status);
    const code = input.changeCode?.trim() || (await nextChangeCode(this.supabase, input.tenantId, workspaceId));
    const { data, error } = await this.supabase
      .from("engineering_changes")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: workspaceId,
        project_id: input.projectId ?? null,
        change_code: code,
        title: input.title,
        description: input.description ?? null,
        change_type: input.changeType,
        source: input.source ?? null,
        reason: input.reason ?? null,
        status: input.status ?? "proposed",
        priority: input.priority ?? "medium",
        owner_id: input.ownerId ?? input.createdBy ?? null,
        requested_by: input.requestedBy ?? null,
        effective_at: input.effectiveAt ?? null,
        created_by: input.createdBy ?? null,
        metadata: {} as Json,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create change: ${error?.message}`);
    await this.framework
      .publishCreated({
        tenantId: input.tenantId,
        workspaceId,
        objectType: "change",
        objectId: data.id as string,
        projectId: input.projectId,
        title: `Change created: ${input.title}`,
        actorId: input.createdBy,
      })
      .catch(() => undefined);
    return data;
  }

  async update(
    commerce: CommerceExecutionContext,
    tenantId: string,
    id: string,
    patch: {
      title?: string;
      description?: string;
      changeType?: string;
      source?: string;
      reason?: string;
      status?: string;
      priority?: string;
      ownerId?: string;
      requestedBy?: string;
      projectId?: string | null;
      effectiveAt?: string | null;
    },
    actorId?: string,
  ) {
    assertEngineeringService(commerce, "change.update", tenantId);
    const existing = await this.requireRow(tenantId, id, commerce);
    if (patch.changeType) assertChangeType(patch.changeType);
    if (patch.status) {
      assertChangeTransition(String(existing.status), patch.status);
    }
    const row: Record<string, unknown> = {};
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.description !== undefined) row.description = patch.description;
    if (patch.changeType !== undefined) row.change_type = patch.changeType;
    if (patch.source !== undefined) row.source = patch.source;
    if (patch.reason !== undefined) row.reason = patch.reason;
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.priority !== undefined) row.priority = patch.priority;
    if (patch.ownerId !== undefined) row.owner_id = patch.ownerId;
    if (patch.requestedBy !== undefined) row.requested_by = patch.requestedBy;
    if (patch.projectId !== undefined) row.project_id = patch.projectId;
    if (patch.effectiveAt !== undefined) row.effective_at = patch.effectiveAt;
    const { data, error } = await this.supabase
      .from("engineering_changes")
      .update(row)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to update change: ${error?.message}`);
    if (patch.status && patch.status !== existing.status) {
      await this.framework
        .recordTimeline({
          tenantId,
          workspaceId: workspaceScopeId(commerce) ?? undefined,
          eventType: "change.status_changed",
          objectType: "change",
          objectId: id,
          title: `Change status: ${String(existing.status)} → ${patch.status}`,
          actorId,
        })
        .catch(() => undefined);
    }
    return data;
  }

  async linkAffected(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { changeId: string; targetType: AffectsTargetType | string; targetId: string; createdBy?: string },
  ) {
    assertEngineeringService(commerce, "change.update", tenantId);
    assertAffectsTargetType(input.targetType);
    await this.requireRow(tenantId, input.changeId, commerce);
    assertA4GovernedRelationWrite({
      relationship: "AFFECTS",
      fromType: "change",
      toType: input.targetType,
    });
    const link = await this.framework.linkObjects({
      tenantId,
      fromType: "change",
      fromId: input.changeId,
      toType: input.targetType,
      toId: input.targetId,
      relationship: "AFFECTS",
      createdBy: input.createdBy,
      governed: true,
    });
    await this.framework
      .recordTimeline({
        tenantId,
        workspaceId: workspaceScopeId(commerce) ?? undefined,
        eventType: "change.affected_added",
        objectType: "change",
        objectId: input.changeId,
        title: `Change AFFECTS ${input.targetType}`,
        actorId: input.createdBy,
      })
      .catch(() => undefined);
    return link;
  }

  async unlinkAffected(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { changeId: string; targetType: AffectsTargetType | string; targetId: string; actorId?: string },
  ) {
    assertEngineeringService(commerce, "change.update", tenantId);
    assertAffectsTargetType(input.targetType);
    await this.requireRow(tenantId, input.changeId, commerce);
    await this.framework.unlinkObjects({
      tenantId,
      fromType: "change",
      fromId: input.changeId,
      toType: input.targetType,
      toId: input.targetId,
      relationship: "AFFECTS",
    });
    await this.framework
      .recordTimeline({
        tenantId,
        workspaceId: workspaceScopeId(commerce) ?? undefined,
        eventType: "change.affected_removed",
        objectType: "change",
        objectId: input.changeId,
        title: `Change unlinked AFFECTS ${input.targetType}`,
        actorId: input.actorId,
      })
      .catch(() => undefined);
  }

  async linkBasedOnDecision(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { changeId: string; decisionId: string; createdBy?: string },
  ) {
    assertEngineeringService(commerce, "change.update", tenantId);
    await this.requireRow(tenantId, input.changeId, commerce);
    assertA4GovernedRelationWrite({
      relationship: "BASED_ON",
      fromType: "change",
      toType: "decision",
    });
    return this.framework.linkObjects({
      tenantId,
      fromType: "change",
      fromId: input.changeId,
      toType: "decision",
      toId: input.decisionId,
      relationship: "BASED_ON",
      createdBy: input.createdBy,
      governed: true,
    });
  }

  private async requireRow(tenantId: string, id: string, commerce: CommerceExecutionContext) {
    const workspaceId = workspaceScopeId(commerce);
    let q = this.supabase.from("engineering_changes").select("*").eq("tenant_id", tenantId).eq("id", id);
    if (workspaceId) q = q.eq("workspace_id", workspaceId);
    const { data, error } = await q.maybeSingle();
    if (error || !data) throw new Error("Change not found in tenant/workspace scope");
    return data as Record<string, unknown>;
  }
}
