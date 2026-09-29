import type { Json, SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import { EngineeringObjectFramework } from "../services/object-framework";
import { assertA4GovernedRelationWrite } from "../decision-intelligence/relations";
import {
  assertAffectsTargetType,
  assertImpactLikelihood,
  assertImpactSeverity,
  assertImpactStatus,
  assertImpactType,
  CONFIRMED_ENGINEERING_IMPACT,
  DISCOVERED_DEPENDENCY,
  IMPACT_TRAVERSAL_MAX_DEPTH,
  IMPACT_TRAVERSAL_RELATIONS,
  type AffectsTargetType,
  type ImpactLikelihood,
  type ImpactSeverity,
  type ImpactStatus,
  type ImpactType,
} from "./invariants";

export type ImpactCandidate = {
  kind: typeof DISCOVERED_DEPENDENCY;
  objectType: string;
  objectId: string;
  depth: number;
  via: string;
  path: string[];
};

async function nextImpactCode(supabase: SupabaseClient, tenantId: string, workspaceId: string): Promise<string> {
  const { count } = await supabase
    .from("engineering_impacts")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("workspace_id", workspaceId);
  return `IMP-${String((count ?? 0) + 1).padStart(4, "0")}`;
}

function neighbour(link: Record<string, unknown>, currentType: string, currentId: string) {
  if (link.from_type === currentType && link.from_id === currentId) {
    return { type: String(link.to_type), id: String(link.to_id), relationship: String(link.relationship) };
  }
  if (link.to_type === currentType && link.to_id === currentId) {
    return { type: String(link.from_type), id: String(link.from_id), relationship: String(link.relationship) };
  }
  return null;
}

export function traverseImpactCandidates(
  links: Record<string, unknown>[],
  start: { type: string; id: string },
  options?: { maxDepth?: number; relations?: readonly string[] },
): ImpactCandidate[] {
  const maxDepth = options?.maxDepth ?? IMPACT_TRAVERSAL_MAX_DEPTH;
  const allowed = new Set(options?.relations ?? IMPACT_TRAVERSAL_RELATIONS);
  const seen = new Set<string>([`${start.type}:${start.id}`]);
  const out: ImpactCandidate[] = [];
  const queue: Array<{ type: string; id: string; depth: number; via: string; path: string[] }> = [
    { type: start.type, id: start.id, depth: 0, via: "START", path: [`${start.type}:${start.id}`] },
  ];
  while (queue.length) {
    const node = queue.shift()!;
    if (node.depth >= maxDepth) continue;
    for (const link of links) {
      const rel = String(link.relationship);
      if (!allowed.has(rel)) continue;
      const next = neighbour(link, node.type, node.id);
      if (!next) continue;
      const key = `${next.type}:${next.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const path = [...node.path, key];
      const candidate: ImpactCandidate = {
        kind: DISCOVERED_DEPENDENCY,
        objectType: next.type,
        objectId: next.id,
        depth: node.depth + 1,
        via: next.relationship,
        path,
      };
      out.push(candidate);
      queue.push({
        type: next.type,
        id: next.id,
        depth: node.depth + 1,
        via: next.relationship,
        path,
      });
    }
  }
  return out;
}

export class EngineeringImpactService {
  private framework: EngineeringObjectFramework;

  constructor(
    private readonly supabase: SupabaseClient,
    kernel?: PlatformKernel,
  ) {
    this.framework = new EngineeringObjectFramework(supabase, kernel);
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, projectId?: string, limit = 100) {
    assertEngineeringService(commerce, "impact.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    let q = this.supabase
      .from("engineering_impacts")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .order("impact_code")
      .limit(limit);
    if (projectId) q = q.eq("project_id", projectId);
    const { data, error } = await q;
    if (error) throw new Error(`Failed to list impacts: ${error.message}`);
    return data ?? [];
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "impact.get", tenantId);
    const row = await this.requireRow(tenantId, id, commerce);
    const links = await this.framework.listLinks(tenantId, "impact", id);
    const causes = (links as Record<string, unknown>[]).filter((link) => link.relationship === "CAUSED_BY");
    const affected = (links as Record<string, unknown>[]).filter((link) => link.relationship === "AFFECTS");
    return { impact: row, causes, affected, links };
  }

  async create(
    commerce: CommerceExecutionContext,
    input: {
      tenantId: string;
      title: string;
      impactType: ImpactType | string;
      impactCode?: string;
      description?: string;
      severity?: ImpactSeverity;
      likelihood?: ImpactLikelihood;
      status?: ImpactStatus;
      ownerId?: string;
      projectId?: string;
      createdBy?: string;
    },
  ) {
    assertEngineeringService(commerce, "impact.create", input.tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace required");
    assertImpactType(input.impactType);
    if (input.severity) assertImpactSeverity(input.severity);
    if (input.likelihood) assertImpactLikelihood(input.likelihood);
    if (input.status) assertImpactStatus(input.status);
    const code = input.impactCode?.trim() || (await nextImpactCode(this.supabase, input.tenantId, workspaceId));
    const { data, error } = await this.supabase
      .from("engineering_impacts")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: workspaceId,
        project_id: input.projectId ?? null,
        impact_code: code,
        title: input.title,
        description: input.description ?? null,
        impact_type: input.impactType,
        severity: input.severity ?? "medium",
        likelihood: input.likelihood ?? "unknown",
        status: input.status ?? "candidate",
        owner_id: input.ownerId ?? input.createdBy ?? null,
        created_by: input.createdBy ?? null,
        metadata: {} as Json,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create impact: ${error?.message}`);
    await this.framework
      .publishCreated({
        tenantId: input.tenantId,
        workspaceId,
        objectType: "impact",
        objectId: data.id as string,
        projectId: input.projectId,
        title: `Impact created: ${input.title}`,
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
      impactType?: string;
      severity?: string;
      likelihood?: string;
      status?: string;
      ownerId?: string;
      projectId?: string | null;
    },
    actorId?: string,
  ) {
    assertEngineeringService(commerce, "impact.update", tenantId);
    const existing = await this.requireRow(tenantId, id, commerce);
    if (patch.impactType) assertImpactType(patch.impactType);
    if (patch.severity) assertImpactSeverity(patch.severity);
    if (patch.likelihood) assertImpactLikelihood(patch.likelihood);
    if (patch.status) assertImpactStatus(patch.status);
    const row: Record<string, unknown> = {};
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.description !== undefined) row.description = patch.description;
    if (patch.impactType !== undefined) row.impact_type = patch.impactType;
    if (patch.severity !== undefined) row.severity = patch.severity;
    if (patch.likelihood !== undefined) row.likelihood = patch.likelihood;
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.ownerId !== undefined) row.owner_id = patch.ownerId;
    if (patch.projectId !== undefined) row.project_id = patch.projectId;
    const { data, error } = await this.supabase
      .from("engineering_impacts")
      .update(row)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to update impact: ${error?.message}`);
    const workspaceId = workspaceScopeId(commerce) ?? undefined;
    if (patch.severity && patch.severity !== existing.severity) {
      await this.framework
        .recordTimeline({
          tenantId,
          workspaceId,
          eventType: "impact.severity_changed",
          objectType: "impact",
          objectId: id,
          title: `Impact severity: ${String(existing.severity)} → ${patch.severity}`,
          actorId,
        })
        .catch(() => undefined);
    }
    if (patch.status && patch.status !== existing.status) {
      await this.framework
        .recordTimeline({
          tenantId,
          workspaceId,
          eventType: "impact.status_changed",
          objectType: "impact",
          objectId: id,
          title: `Impact ${patch.status === "confirmed" ? CONFIRMED_ENGINEERING_IMPACT : patch.status}`,
          actorId,
        })
        .catch(() => undefined);
    }
    return data;
  }

  async confirm(commerce: CommerceExecutionContext, tenantId: string, id: string, actorId?: string) {
    return this.update(commerce, tenantId, id, { status: "confirmed" }, actorId);
  }

  async reject(commerce: CommerceExecutionContext, tenantId: string, id: string, actorId?: string) {
    return this.update(commerce, tenantId, id, { status: "rejected" }, actorId);
  }

  async linkCause(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { impactId: string; changeId: string; createdBy?: string },
  ) {
    assertEngineeringService(commerce, "impact.update", tenantId);
    await this.requireRow(tenantId, input.impactId, commerce);
    assertA4GovernedRelationWrite({
      relationship: "CAUSED_BY",
      fromType: "impact",
      toType: "change",
    });
    const link = await this.framework.linkObjects({
      tenantId,
      fromType: "impact",
      fromId: input.impactId,
      toType: "change",
      toId: input.changeId,
      relationship: "CAUSED_BY",
      createdBy: input.createdBy,
      governed: true,
    });
    await this.framework
      .recordTimeline({
        tenantId,
        workspaceId: workspaceScopeId(commerce) ?? undefined,
        eventType: "impact.cause_linked",
        objectType: "impact",
        objectId: input.impactId,
        title: "Impact CAUSED_BY Change",
        actorId: input.createdBy,
      })
      .catch(() => undefined);
    return link;
  }

  async linkAffected(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { impactId: string; targetType: AffectsTargetType | string; targetId: string; createdBy?: string },
  ) {
    assertEngineeringService(commerce, "impact.update", tenantId);
    assertAffectsTargetType(input.targetType);
    await this.requireRow(tenantId, input.impactId, commerce);
    assertA4GovernedRelationWrite({
      relationship: "AFFECTS",
      fromType: "impact",
      toType: input.targetType,
    });
    return this.framework.linkObjects({
      tenantId,
      fromType: "impact",
      fromId: input.impactId,
      toType: input.targetType,
      toId: input.targetId,
      relationship: "AFFECTS",
      createdBy: input.createdBy,
      governed: true,
    });
  }

  async unlinkAffected(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { impactId: string; targetType: AffectsTargetType | string; targetId: string },
  ) {
    assertEngineeringService(commerce, "impact.update", tenantId);
    assertAffectsTargetType(input.targetType);
    await this.requireRow(tenantId, input.impactId, commerce);
    await this.framework.unlinkObjects({
      tenantId,
      fromType: "impact",
      fromId: input.impactId,
      toType: input.targetType,
      toId: input.targetId,
      relationship: "AFFECTS",
    });
  }

  async discoverCandidates(commerce: CommerceExecutionContext, tenantId: string, changeId: string) {
    assertEngineeringService(commerce, "impact.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    const { data, error } = await this.supabase
      .from("engineering_object_links")
      .select("*")
      .eq("tenant_id", tenantId);
    if (error) throw new Error(`Failed to load object links for impact traversal: ${error.message}`);
    const candidates = traverseImpactCandidates((data ?? []) as Record<string, unknown>[], {
      type: "change",
      id: changeId,
    });
    return candidates.map((candidate) => ({
      ...candidate,
      confirmation: DISCOVERED_DEPENDENCY,
      autoConfirmed: false,
    }));
  }

  private async requireRow(tenantId: string, id: string, commerce: CommerceExecutionContext) {
    const workspaceId = workspaceScopeId(commerce);
    let q = this.supabase.from("engineering_impacts").select("*").eq("tenant_id", tenantId).eq("id", id);
    if (workspaceId) q = q.eq("workspace_id", workspaceId);
    const { data, error } = await q.maybeSingle();
    if (error || !data) throw new Error("Impact not found in tenant/workspace scope");
    return data as Record<string, unknown>;
  }
}
