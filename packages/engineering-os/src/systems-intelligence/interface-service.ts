import type { Json, SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import { EngineeringObjectFramework } from "../services/object-framework";
import { assertA3GovernedRelationWrite } from "../decision-intelligence/relations";
import {
  assertEndpointRole,
  assertInterfaceDirectionality,
  assertInterfaceStatus,
  assertInterfaceType,
  assertVerifiedEndpointCount,
  type InterfaceDirectionality,
  type InterfaceEndpointRole,
  type InterfaceStatus,
  type InterfaceType,
} from "./invariants";

const ENDPOINT_OBJECT_TYPES = new Set([
  "system",
  "asset",
  "document",
  "decision",
  "assumption",
  "project",
]);

async function nextInterfaceCode(supabase: SupabaseClient, tenantId: string, workspaceId: string): Promise<string> {
  const { count } = await supabase
    .from("engineering_interfaces")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("workspace_id", workspaceId);
  return `IF-${String((count ?? 0) + 1).padStart(4, "0")}`;
}

export class EngineeringInterfaceService {
  private framework: EngineeringObjectFramework;

  constructor(
    private readonly supabase: SupabaseClient,
    kernel?: PlatformKernel,
  ) {
    this.framework = new EngineeringObjectFramework(supabase, kernel);
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, projectId?: string, limit = 100) {
    assertEngineeringService(commerce, "interface.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    let q = this.supabase
      .from("engineering_interfaces")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .order("interface_code")
      .limit(limit);
    if (projectId) q = q.eq("project_id", projectId);
    const { data, error } = await q;
    if (error) throw new Error(`Failed to list interfaces: ${error.message}`);
    return data ?? [];
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "interface.get", tenantId);
    const row = await this.requireInterface(tenantId, id, commerce);
    const endpoints = await this.listEndpoints(commerce, tenantId, id);
    return { interface: row, endpoints };
  }

  async create(
    commerce: CommerceExecutionContext,
    input: {
      tenantId: string;
      name: string;
      interfaceType: InterfaceType;
      interfaceCode?: string;
      description?: string;
      purpose?: string;
      directionality?: InterfaceDirectionality;
      status?: InterfaceStatus;
      criticality?: string;
      ownerId?: string;
      projectId?: string;
      createdBy?: string;
    },
  ) {
    assertEngineeringService(commerce, "interface.create", input.tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace required");
    assertInterfaceType(input.interfaceType);
    if (input.directionality) assertInterfaceDirectionality(input.directionality);
    if (input.status) {
      assertInterfaceStatus(input.status);
      assertVerifiedEndpointCount(input.status, 0);
    }
    const code = input.interfaceCode?.trim() || (await nextInterfaceCode(this.supabase, input.tenantId, workspaceId));
    const { data, error } = await this.supabase
      .from("engineering_interfaces")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: workspaceId,
        project_id: input.projectId ?? null,
        interface_code: code,
        name: input.name,
        description: input.description ?? null,
        purpose: input.purpose ?? null,
        interface_type: input.interfaceType,
        directionality: input.directionality ?? "undirected",
        status: input.status ?? "identified",
        criticality: input.criticality ?? "medium",
        owner_id: input.ownerId ?? input.createdBy ?? null,
        created_by: input.createdBy ?? null,
        metadata: {} as Json,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create interface: ${error?.message}`);
    await this.framework.publishCreated({
      tenantId: input.tenantId,
      workspaceId,
      objectType: "interface",
      objectId: data.id as string,
      projectId: input.projectId,
      title: `Interface created: ${input.name}`,
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
      purpose?: string;
      interfaceType?: string;
      directionality?: string;
      status?: string;
      criticality?: string;
      ownerId?: string;
    },
    actorId?: string,
  ) {
    assertEngineeringService(commerce, "interface.update", tenantId);
    const existing = await this.requireInterface(tenantId, id, commerce);
    if (patch.interfaceType) assertInterfaceType(patch.interfaceType);
    if (patch.directionality) assertInterfaceDirectionality(patch.directionality);
    if (patch.status) {
      assertInterfaceStatus(patch.status);
      const endpoints = await this.listEndpoints(commerce, tenantId, id);
      assertVerifiedEndpointCount(patch.status, endpoints.length);
    }
    const row: Record<string, unknown> = {};
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.description !== undefined) row.description = patch.description;
    if (patch.purpose !== undefined) row.purpose = patch.purpose;
    if (patch.interfaceType !== undefined) row.interface_type = patch.interfaceType;
    if (patch.directionality !== undefined) row.directionality = patch.directionality;
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.criticality !== undefined) row.criticality = patch.criticality;
    if (patch.ownerId !== undefined) row.owner_id = patch.ownerId;
    const { data, error } = await this.supabase
      .from("engineering_interfaces")
      .update(row)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to update interface: ${error?.message}`);
    const workspaceId = workspaceScopeId(commerce) ?? undefined;
    if (patch.interfaceType && patch.interfaceType !== existing.interface_type) {
      await this.framework.recordTimeline({
        tenantId,
        workspaceId,
        eventType: "interface.classification_changed",
        objectType: "interface",
        objectId: id,
        title: `Interface type: ${String(existing.interface_type)} → ${patch.interfaceType}`,
        actorId,
      }).catch(() => undefined);
    }
    if (patch.status && patch.status !== existing.status) {
      await this.framework.recordTimeline({
        tenantId,
        workspaceId,
        eventType: "interface.status_changed",
        objectType: "interface",
        objectId: id,
        title: `Interface status: ${String(existing.status)} → ${patch.status}`,
        actorId,
      }).catch(() => undefined);
    }
    if (patch.criticality && patch.criticality !== existing.criticality) {
      await this.framework.recordTimeline({
        tenantId,
        workspaceId,
        eventType: "interface.criticality_changed",
        objectType: "interface",
        objectId: id,
        title: `Interface criticality: ${String(existing.criticality)} → ${patch.criticality}`,
        actorId,
      }).catch(() => undefined);
    }
    return data;
  }

  async addEndpoint(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      interfaceId: string;
      objectType: string;
      objectId: string;
      role?: InterfaceEndpointRole;
      direction?: string;
      createdBy?: string;
    },
  ) {
    assertEngineeringService(commerce, "interface.update", tenantId);
    if (!ENDPOINT_OBJECT_TYPES.has(input.objectType)) {
      throw new Error(`Unsupported interface endpoint type: ${input.objectType}`);
    }
    const role = input.role ?? "participant";
    assertEndpointRole(role);
    await this.requireInterface(tenantId, input.interfaceId, commerce);
    assertA3GovernedRelationWrite({
      relationship: "CONNECTS",
      fromType: "interface",
      toType: input.objectType,
    });
    const link = await this.framework.linkObjects({
      tenantId,
      fromType: "interface",
      fromId: input.interfaceId,
      toType: input.objectType,
      toId: input.objectId,
      relationship: "CONNECTS",
      createdBy: input.createdBy,
      governed: true,
      metadata: { endpoint_role: role, direction: input.direction ?? "undirected" },
    });
    await this.framework.recordTimeline({
      tenantId,
      workspaceId: workspaceScopeId(commerce) ?? undefined,
      eventType: "interface.endpoint_added",
      objectType: "interface",
      objectId: input.interfaceId,
      title: `Interface CONNECTS ${input.objectType}`,
      actorId: input.createdBy,
      metadata: { objectType: input.objectType, objectId: input.objectId, role },
    }).catch(() => undefined);
    return link;
  }

  async removeEndpoint(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { interfaceId: string; objectType: string; objectId: string; actorId?: string },
  ) {
    assertEngineeringService(commerce, "interface.update", tenantId);
    const iface = await this.requireInterface(tenantId, input.interfaceId, commerce);
    const endpoints = await this.listEndpoints(commerce, tenantId, input.interfaceId);
    const remaining = endpoints.filter(
      (row) => !(row.to_type === input.objectType && row.to_id === input.objectId),
    );
    const status = String(iface.status ?? "");
    if ((status === "verified" || status === "agreed") && remaining.length < 2) {
      throw new Error("Cannot remove endpoint: agreed/verified interfaces must keep at least two endpoints");
    }
    await this.framework.unlinkObjects({
      tenantId,
      fromType: "interface",
      fromId: input.interfaceId,
      toType: input.objectType,
      toId: input.objectId,
      relationship: "CONNECTS",
    });
    await this.framework.recordTimeline({
      tenantId,
      workspaceId: workspaceScopeId(commerce) ?? undefined,
      eventType: "interface.endpoint_removed",
      objectType: "interface",
      objectId: input.interfaceId,
      title: `Interface endpoint removed (${input.objectType})`,
      actorId: input.actorId,
    }).catch(() => undefined);
  }

  async listEndpoints(commerce: CommerceExecutionContext, tenantId: string, interfaceId: string) {
    assertEngineeringService(commerce, "interface.get", tenantId);
    await this.requireInterface(tenantId, interfaceId, commerce);
    const links = await this.framework.listLinks(tenantId, "interface", interfaceId);
    return (links as Array<Record<string, unknown> & { relationship?: string; from_type?: string }>).filter(
      (link) => link.relationship === "CONNECTS" && link.from_type === "interface",
    );
  }

  private async requireInterface(tenantId: string, id: string, commerce: CommerceExecutionContext) {
    const workspaceId = workspaceScopeId(commerce);
    let q = this.supabase.from("engineering_interfaces").select("*").eq("tenant_id", tenantId).eq("id", id);
    if (workspaceId) q = q.eq("workspace_id", workspaceId);
    const { data, error } = await q.maybeSingle();
    if (error || !data) throw new Error("Interface not found in tenant/workspace scope");
    return data as Record<string, unknown>;
  }
}
