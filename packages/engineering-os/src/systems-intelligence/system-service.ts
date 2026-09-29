import type { Json, SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import { EngineeringObjectFramework } from "../services/object-framework";
import { assertA3GovernedRelationWrite } from "../decision-intelligence/relations";
import {
  assertNoSelfParent,
  assertSystemAssetRelation,
  assertSystemStatus,
  type SystemAssetRelation,
  type SystemStatus,
} from "./invariants";

async function nextSystemCode(supabase: SupabaseClient, tenantId: string, workspaceId: string): Promise<string> {
  const { count } = await supabase
    .from("engineering_systems")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("workspace_id", workspaceId);
  return `SYS-${String((count ?? 0) + 1).padStart(4, "0")}`;
}

export class EngineeringSystemService {
  private framework: EngineeringObjectFramework;

  constructor(
    private readonly supabase: SupabaseClient,
    kernel?: PlatformKernel,
  ) {
    this.framework = new EngineeringObjectFramework(supabase, kernel);
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, projectId?: string, limit = 100) {
    assertEngineeringService(commerce, "system.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    let q = this.supabase
      .from("engineering_systems")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .order("system_code")
      .limit(limit);
    if (projectId) q = q.eq("project_id", projectId);
    const { data, error } = await q;
    if (error) throw new Error(`Failed to list systems: ${error.message}`);
    return data ?? [];
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "system.get", tenantId);
    const row = await this.requireSystem(tenantId, id, commerce);
    const [children, links] = await Promise.all([
      this.listChildren(commerce, tenantId, id),
      this.framework.listLinks(tenantId, "system", id),
    ]);
    const assets = (links as Record<string, unknown>[]).filter(
      (link) =>
        link.relationship === "CONTAINS" || link.relationship === "USES",
    );
    const interfaces = (links as Record<string, unknown>[]).filter(
      (link) => link.relationship === "CONNECTS" && (link.from_type === "interface" || link.to_type === "interface"),
    );
    const decisions = (links as Record<string, unknown>[]).filter(
      (link) => link.from_type === "decision" || link.to_type === "decision",
    );
    const assumptions = (links as Record<string, unknown>[]).filter(
      (link) => link.from_type === "assumption" || link.to_type === "assumption",
    );
    return { system: row, children, assets, interfaces, decisions, assumptions, links };
  }

  async create(
    commerce: CommerceExecutionContext,
    input: {
      tenantId: string;
      name: string;
      systemCode?: string;
      description?: string;
      status?: SystemStatus;
      criticality?: string;
      ownerId?: string;
      projectId?: string;
      parentSystemId?: string;
      createdBy?: string;
    },
  ) {
    assertEngineeringService(commerce, "system.create", input.tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace required");
    if (input.parentSystemId) assertNoSelfParent("new", input.parentSystemId);
    if (input.status) assertSystemStatus(input.status);
    const code = input.systemCode?.trim() || (await nextSystemCode(this.supabase, input.tenantId, workspaceId));
    const { data, error } = await this.supabase
      .from("engineering_systems")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: workspaceId,
        project_id: input.projectId ?? null,
        parent_system_id: input.parentSystemId ?? null,
        system_code: code,
        name: input.name,
        description: input.description ?? null,
        status: input.status ?? "draft",
        criticality: input.criticality ?? "medium",
        owner_id: input.ownerId ?? input.createdBy ?? null,
        created_by: input.createdBy ?? null,
        metadata: {} as Json,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create system: ${error?.message}`);
    await this.framework.publishCreated({
      tenantId: input.tenantId,
      workspaceId,
      objectType: "system",
      objectId: data.id as string,
      projectId: input.projectId,
      title: `System created: ${input.name}`,
      actorId: input.createdBy,
    }).catch(() => undefined);
    return data;
  }

  async update(
    commerce: CommerceExecutionContext,
    tenantId: string,
    id: string,
    patch: {
      name?: string;
      description?: string;
      status?: string;
      criticality?: string;
      ownerId?: string;
      projectId?: string | null;
    },
    actorId?: string,
  ) {
    assertEngineeringService(commerce, "system.update", tenantId);
    const existing = await this.requireSystem(tenantId, id, commerce);
    if (patch.status) assertSystemStatus(patch.status);
    const row: Record<string, unknown> = {};
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.description !== undefined) row.description = patch.description;
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.criticality !== undefined) row.criticality = patch.criticality;
    if (patch.ownerId !== undefined) row.owner_id = patch.ownerId;
    if (patch.projectId !== undefined) row.project_id = patch.projectId;
    const { data, error } = await this.supabase
      .from("engineering_systems")
      .update(row)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to update system: ${error?.message}`);
    const workspaceId = workspaceScopeId(commerce) ?? undefined;
    if (patch.name && patch.name !== existing.name) {
      await this.framework.recordTimeline({
        tenantId,
        workspaceId,
        eventType: "system.renamed",
        objectType: "system",
        objectId: id,
        title: `System renamed: ${String(existing.name)} → ${patch.name}`,
        actorId,
      }).catch(() => undefined);
    }
    if (patch.status && patch.status !== existing.status) {
      await this.framework.recordTimeline({
        tenantId,
        workspaceId,
        eventType: "system.status_changed",
        objectType: "system",
        objectId: id,
        title: `System status: ${String(existing.status)} → ${patch.status}`,
        actorId,
      }).catch(() => undefined);
    }
    return data;
  }

  async setParent(
    commerce: CommerceExecutionContext,
    tenantId: string,
    id: string,
    parentSystemId: string | null,
    actorId?: string,
  ) {
    assertEngineeringService(commerce, "system.update", tenantId);
    assertNoSelfParent(id, parentSystemId);
    const existing = await this.requireSystem(tenantId, id, commerce);
    if (parentSystemId) await this.requireSystem(tenantId, parentSystemId, commerce);
    const { data, error } = await this.supabase
      .from("engineering_systems")
      .update({ parent_system_id: parentSystemId })
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to set system parent: ${error?.message}`);
    await this.framework.recordTimeline({
      tenantId,
      workspaceId: workspaceScopeId(commerce) ?? undefined,
      eventType: "system.parent_changed",
      objectType: "system",
      objectId: id,
      title: `System parent changed`,
      actorId,
      metadata: { from: existing.parent_system_id, to: parentSystemId },
    }).catch(() => undefined);
    return data;
  }

  async listChildren(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "system.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    const { data, error } = await this.supabase
      .from("engineering_systems")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("parent_system_id", id)
      .order("system_code");
    if (error) throw new Error(`Failed to list child systems: ${error.message}`);
    return data ?? [];
  }

  async linkAsset(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      systemId: string;
      assetId: string;
      relationship?: SystemAssetRelation;
      createdBy?: string;
    },
  ) {
    assertEngineeringService(commerce, "system.update", tenantId);
    const relationship = input.relationship ?? "CONTAINS";
    assertSystemAssetRelation(relationship);
    await this.requireSystem(tenantId, input.systemId, commerce);
    assertA3GovernedRelationWrite({ relationship, fromType: "system", toType: "asset" });
    const link = await this.framework.linkObjects({
      tenantId,
      fromType: "system",
      fromId: input.systemId,
      toType: "asset",
      toId: input.assetId,
      relationship,
      createdBy: input.createdBy,
      governed: true,
    });
    await this.framework.recordTimeline({
      tenantId,
      workspaceId: workspaceScopeId(commerce) ?? undefined,
      eventType: "system.asset_linked",
      objectType: "system",
      objectId: input.systemId,
      assetId: input.assetId,
      title: `System ${relationship} asset`,
      actorId: input.createdBy,
    }).catch(() => undefined);
    return link;
  }

  async unlinkAsset(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { systemId: string; assetId: string; relationship?: SystemAssetRelation; actorId?: string },
  ) {
    assertEngineeringService(commerce, "system.update", tenantId);
    const relationship = input.relationship ?? "CONTAINS";
    assertSystemAssetRelation(relationship);
    await this.requireSystem(tenantId, input.systemId, commerce);
    await this.framework.unlinkObjects({
      tenantId,
      fromType: "system",
      fromId: input.systemId,
      toType: "asset",
      toId: input.assetId,
      relationship,
    });
    await this.framework.recordTimeline({
      tenantId,
      workspaceId: workspaceScopeId(commerce) ?? undefined,
      eventType: "system.asset_unlinked",
      objectType: "system",
      objectId: input.systemId,
      assetId: input.assetId,
      title: `System unlinked asset (${relationship})`,
      actorId: input.actorId,
    }).catch(() => undefined);
  }

  async listParticipatingAssets(commerce: CommerceExecutionContext, tenantId: string, systemId: string) {
    assertEngineeringService(commerce, "system.get", tenantId);
    await this.requireSystem(tenantId, systemId, commerce);
    const links = await this.framework.listLinks(tenantId, "system", systemId);
    return (links as Record<string, unknown>[]).filter(
      (link) =>
        (link.relationship === "CONTAINS" || link.relationship === "USES") &&
        (link.to_type === "asset" || link.from_type === "asset"),
    );
  }

  async listRelatedInterfaces(commerce: CommerceExecutionContext, tenantId: string, systemId: string) {
    assertEngineeringService(commerce, "system.get", tenantId);
    await this.requireSystem(tenantId, systemId, commerce);
    const links = await this.framework.listLinks(tenantId, "system", systemId);
    return (links as Record<string, unknown>[]).filter((link) => link.relationship === "CONNECTS");
  }

  private async requireSystem(tenantId: string, id: string, commerce: CommerceExecutionContext) {
    const workspaceId = workspaceScopeId(commerce);
    let q = this.supabase.from("engineering_systems").select("*").eq("tenant_id", tenantId).eq("id", id);
    if (workspaceId) q = q.eq("workspace_id", workspaceId);
    const { data, error } = await q.maybeSingle();
    if (error || !data) throw new Error("System not found in tenant/workspace scope");
    return data as Record<string, unknown>;
  }
}
