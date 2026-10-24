import type { Json, SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import { sanitizePostgrestIlike } from "./postgrest-ilike";
import { EngineeringObjectFramework } from "./object-framework";
import {
  assertApprovalAction,
  assertHumanApprovalActor,
  assertSingleSelectedAlternative,
  assertSupersessionPair,
  type DecisionApprovalAction,
} from "../decision-intelligence/invariants";
import { assertGovernedRelationWrite, type A2WritableRelation } from "../decision-intelligence/relations";
export { EngineeringTechnicalQueryService } from "./technical-query-service";

type EngineeringRegisterTable =
  | "engineering_decisions"
  | "engineering_actions"
  | "engineering_risks"
  | "engineering_issues"
  | "engineering_technical_queries"
  | "engineering_lessons"
  | "engineering_assumptions";

type CreateCommon = {
  tenantId: string;
  workspaceId?: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  disciplineId?: string;
  projectId?: string;
  assetId?: string;
  companyId?: string;
  ownerId?: string;
  assignedTo?: string;
  dueDate?: string;
  createdBy?: string;
  metadata?: Record<string, unknown>;
  aiContext?: Record<string, unknown>;
};

async function nextNumber(
  supabase: SupabaseClient,
  tenantId: string,
  table: EngineeringRegisterTable,
  column: string,
  prefix: string
): Promise<string> {
  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId);
  const seq = String((count ?? 0) + 1).padStart(4, "0");
  return `${prefix}-${seq}`;
}

async function afterCreate(
  framework: EngineeringObjectFramework,
  supabase: SupabaseClient,
  table: EngineeringRegisterTable,
  objectType: string,
  row: Record<string, unknown>,
  input: CreateCommon & { numberField?: string }
) {
  try {
    const knowledgeNodeId = await framework.createKnowledgeNode({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      objectType,
      objectId: row.id as string,
      title: input.title,
      content: { number: input.numberField },
      createdBy: input.createdBy,
    });
    if (knowledgeNodeId) {
      await supabase.from(table).update({ knowledge_node_id: knowledgeNodeId }).eq("id", row.id as string);
      row.knowledge_node_id = knowledgeNodeId;
    }

    // Link to project KG if present
    if (input.projectId && knowledgeNodeId) {
      const { data: project } = await supabase
        .from("engineering_projects")
        .select("knowledge_node_id")
        .eq("id", input.projectId)
        .maybeSingle();
      if (project?.knowledge_node_id) {
        await framework.linkObjects({
          tenantId: input.tenantId,
          fromType: "project",
          fromId: input.projectId,
          toType: objectType,
          toId: row.id as string,
          relationship: "contains",
          createdBy: input.createdBy,
        }).catch(() => undefined);
      }
    }

    // Digital twin from asset if present
    if (input.assetId) {
      const { data: asset } = await supabase
        .from("engineering_assets")
        .select("digital_twin_id, knowledge_node_id")
        .eq("id", input.assetId)
        .maybeSingle();
      if (asset?.digital_twin_id) {
        await supabase
          .from(table)
          .update({ digital_twin_id: asset.digital_twin_id })
          .eq("id", row.id as string);
        row.digital_twin_id = asset.digital_twin_id;
      }
    }

    await framework.publishCreated({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      objectType,
      objectId: row.id as string,
      title: `${objectType}: ${input.title}`,
      projectId: input.projectId,
      assetId: input.assetId,
      actorId: input.createdBy,
    });
  } catch {
    // best-effort platform integrations
  }
  return row;
}

export class EngineeringDecisionService {
  private framework: EngineeringObjectFramework;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel?: PlatformKernel
  ) {
    this.framework = new EngineeringObjectFramework(supabase, kernel);
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, projectId?: string, limit = 50, options?: { aggregate?: boolean }) {
    assertEngineeringService(commerce, "decision.list", tenantId, options);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    let q = this.supabase
      .from("engineering_decisions")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (projectId) q = q.eq("project_id", projectId);
    const { data, error } = await q;
    if (error) throw new Error(`Failed to list decisions: ${error.message}`);
    return data ?? [];
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "decision.get", tenantId);
    const { data, error } = await this.supabase
      .from("engineering_decisions")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .single();
    if (error) return null;
    const workspaceId = workspaceScopeId(commerce);
    if (workspaceId && data.workspace_id && data.workspace_id !== workspaceId) return null;
    const [links, comments, alternatives, approvals] = await Promise.all([
      this.framework.listLinks(tenantId, "decision", id),
      this.framework.listComments(tenantId, "decision", id),
      this.listAlternatives(commerce, tenantId, id),
      this.listApprovals(commerce, tenantId, id),
    ]);
    const assumptionLinks = (links as { to_type?: string; from_type?: string }[]).filter(
      (link) => link.to_type === "assumption" || link.from_type === "assumption",
    );
    return { decision: data, links, comments, alternatives, approvals, assumptionLinks };
  }

  async create(
    commerce: CommerceExecutionContext,
    input: CreateCommon & {
      decisionType?: string;
      category?: string;
      recommendation?: string;
      rationale?: string;
      alternatives?: unknown[];
      consequences?: string;
      confidence?: number;
      decisionQuestion?: string;
      authorityId?: string;
      effectiveAt?: string;
      supersedesDecisionId?: string;
    },
    policyKey = "decision.create"
  ) {
    assertEngineeringService(commerce, policyKey, input.tenantId);
    const number = await nextNumber(
      this.supabase,
      input.tenantId,
      "engineering_decisions",
      "decision_number",
      "DEC"
    );
    const { data, error } = await this.supabase
      .from("engineering_decisions")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId ?? null,
        decision_number: number,
        title: input.title,
        description: input.description ?? null,
        decision_type: input.decisionType ?? null,
        category: input.category ?? null,
        status: input.status ?? "draft",
        priority: input.priority ?? "medium",
        discipline_id: input.disciplineId ?? null,
        project_id: input.projectId ?? null,
        asset_id: input.assetId ?? null,
        company_id: input.companyId ?? null,
        owner_id: input.ownerId ?? input.createdBy ?? null,
        created_by: input.createdBy ?? null,
        assigned_to: input.assignedTo ?? null,
        recommendation: input.recommendation ?? null,
        rationale: input.rationale ?? null,
        alternatives: (input.alternatives ?? []) as Json,
        consequences: input.consequences ?? null,
        confidence: input.confidence ?? null,
        decision_question: input.decisionQuestion ?? null,
        authority_id: input.authorityId ?? input.ownerId ?? null,
        effective_at: input.effectiveAt ?? null,
        supersedes_decision_id: input.supersedesDecisionId ?? null,
        review_status: "pending",
        approval_status: "pending",
        due_date: input.dueDate ?? null,
        ai_context: (input.aiContext ?? {}) as Json,
        metadata: (input.metadata ?? {}) as Json,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create decision: ${error?.message}`);

    if (Array.isArray(input.alternatives) && input.alternatives.length > 0) {
      await this.materializeLegacyAlternatives(data.id as string, input.tenantId, input.alternatives, input.createdBy);
    }

    // Start decision approval workflow if available
    if (this.kernel) {
      try {
        const wf = await this.kernel.workflow.start({
          tenantId: input.tenantId,
          workspaceId: input.workspaceId,
          definitionSlug: "engineering-decision-approval",
          context: { decision_id: data.id, title: input.title },
          startedBy: input.createdBy,
        });
        await this.supabase
          .from("engineering_decisions")
          .update({ workflow_instance_id: (wf as { id?: string }).id })
          .eq("id", data.id as string);
      } catch {
        // workflow optional
      }
    }

    return afterCreate(this.framework, this.supabase, "engineering_decisions", "decision", data, {
      ...input,
      numberField: number,
    });
  }

  async approve(commerce: CommerceExecutionContext, tenantId: string, id: string, approvedBy: string) {
    assertEngineeringService(commerce, "decision.create", tenantId);
    assertHumanApprovalActor("human", approvedBy);
    return this.recordApproval(commerce, tenantId, id, {
      action: "approved",
      actorId: approvedBy,
    });
  }

  async search(commerce: CommerceExecutionContext, tenantId: string, query: string, options?: { aggregate?: boolean }) {
    assertEngineeringService(commerce, "decision.search", tenantId, options);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    const needle = sanitizePostgrestIlike(query);
    if (!needle) return [];
    const { data, error } = await this.supabase
      .from("engineering_decisions")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .or(`decision_number.ilike.%${needle}%,title.ilike.%${needle}%`)
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async listAlternatives(commerce: CommerceExecutionContext, tenantId: string, decisionId: string) {
    assertEngineeringService(commerce, "decision.get", tenantId);
    const { data, error } = await this.supabase
      .from("engineering_decision_alternatives")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("decision_id", decisionId)
      .order("created_at");
    if (error) throw new Error(`Failed to list alternatives: ${error.message}`);
    return data ?? [];
  }

  async listApprovals(commerce: CommerceExecutionContext, tenantId: string, decisionId: string) {
    assertEngineeringService(commerce, "decision.get", tenantId);
    const { data, error } = await this.supabase
      .from("engineering_decision_approvals")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("decision_id", decisionId)
      .order("created_at");
    if (error) throw new Error(`Failed to list approvals: ${error.message}`);
    return data ?? [];
  }

  async createAlternative(
    commerce: CommerceExecutionContext,
    input: {
      tenantId: string;
      decisionId: string;
      name: string;
      alternativeCode?: string;
      description?: string;
      rationale?: string;
      source?: string;
      createdBy?: string;
    },
  ) {
    assertEngineeringService(commerce, "decision.create", input.tenantId);
    const parent = await this.requireDecision(input.tenantId, input.decisionId, commerce);
    const { count } = await this.supabase
      .from("engineering_decision_alternatives")
      .select("*", { count: "exact", head: true })
      .eq("decision_id", input.decisionId)
      .eq("tenant_id", input.tenantId);
    const code = input.alternativeCode?.trim() || `ALT-${String((count ?? 0) + 1).padStart(2, "0")}`;
    const { data, error } = await this.supabase
      .from("engineering_decision_alternatives")
      .insert({
        tenant_id: parent.tenant_id,
        workspace_id: parent.workspace_id ?? null,
        project_id: parent.project_id ?? null,
        decision_id: input.decisionId,
        alternative_code: code,
        name: input.name,
        description: input.description ?? null,
        rationale: input.rationale ?? null,
        source: input.source ?? null,
        status: "considered",
        is_selected: false,
        created_by: input.createdBy ?? null,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create alternative: ${error?.message}`);
    return data;
  }

  async updateAlternative(
    commerce: CommerceExecutionContext,
    tenantId: string,
    alternativeId: string,
    patch: { name?: string; description?: string; rationale?: string; status?: string },
  ) {
    assertEngineeringService(commerce, "decision.create", tenantId);
    const { data, error } = await this.supabase
      .from("engineering_decision_alternatives")
      .update({
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.description !== undefined ? { description: patch.description } : {}),
        ...(patch.rationale !== undefined ? { rationale: patch.rationale } : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
      })
      .eq("id", alternativeId)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to update alternative: ${error?.message}`);
    return data;
  }

  async selectAlternative(
    commerce: CommerceExecutionContext,
    tenantId: string,
    decisionId: string,
    alternativeId: string,
    actorId?: string,
  ) {
    assertEngineeringService(commerce, "decision.create", tenantId);
    const { data: alternative, error: altError } = await this.supabase
      .from("engineering_decision_alternatives")
      .select("*")
      .eq("id", alternativeId)
      .eq("tenant_id", tenantId)
      .eq("decision_id", decisionId)
      .single();
    if (altError || !alternative) throw new Error("Alternative not found for this decision");
    const { data, error } = await this.supabase
      .from("engineering_decisions")
      .update({ selected_alternative_id: alternativeId })
      .eq("id", decisionId)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to select alternative: ${error?.message}`);
    await this.framework.publishCreated({
      tenantId,
      workspaceId: (data.workspace_id as string | undefined) ?? undefined,
      objectType: "decision",
      objectId: decisionId,
      title: `Alternative selected: ${alternative.name}`,
      projectId: data.project_id as string | undefined,
      actorId,
      eventSuffix: "updated",
    });
    await this.framework
      .linkObjects({
        tenantId,
        fromType: "decision",
        fromId: decisionId,
        toType: "alternative",
        toId: alternativeId,
        relationship: "SELECTS",
        createdBy: actorId,
        governed: true,
      })
      .catch(() => undefined);
    return data;
  }

  async recordApproval(
    commerce: CommerceExecutionContext,
    tenantId: string,
    decisionId: string,
    input: {
      action: DecisionApprovalAction | string;
      actorId: string;
      comments?: string;
      authorityRole?: string;
      evidenceRef?: string;
    },
  ) {
    assertEngineeringService(commerce, "decision.create", tenantId);
    assertApprovalAction(input.action);
    assertHumanApprovalActor("human", input.actorId);
    const parent = await this.requireDecision(tenantId, decisionId, commerce);
    const { data: approval, error: approvalError } = await this.supabase
      .from("engineering_decision_approvals")
      .insert({
        tenant_id: parent.tenant_id,
        workspace_id: parent.workspace_id ?? null,
        project_id: parent.project_id ?? null,
        decision_id: decisionId,
        action: input.action,
        actor_id: input.actorId,
        actor_kind: "human",
        authority_role: input.authorityRole ?? null,
        comments: input.comments ?? null,
        evidence_ref: input.evidenceRef ?? null,
      })
      .select()
      .single();
    if (approvalError || !approval) throw new Error(`Failed to record approval: ${approvalError?.message}`);

    const parentPatch: Record<string, unknown> = {};
    if (input.action === "approved") {
      parentPatch.approval_status = "approved";
      parentPatch.review_status = "approved";
      parentPatch.approved_by = input.actorId;
      parentPatch.status = "approved";
      parentPatch.decision_date = new Date().toISOString().slice(0, 10);
      parentPatch.effective_at = parent.effective_at ?? new Date().toISOString();
    } else if (input.action === "rejected") {
      parentPatch.approval_status = "rejected";
      parentPatch.status = "rejected";
    } else if (input.action === "withdrawn") {
      parentPatch.approval_status = "withdrawn";
    } else if (input.action === "submitted") {
      parentPatch.approval_status = "pending";
      parentPatch.review_status = "in_review";
    } else if (input.action === "superseded") {
      parentPatch.status = "superseded";
      parentPatch.approval_status = "superseded";
    }

    let updated = parent;
    if (Object.keys(parentPatch).length > 0) {
      const { data, error } = await this.supabase
        .from("engineering_decisions")
        .update(parentPatch)
        .eq("id", decisionId)
        .eq("tenant_id", tenantId)
        .select()
        .single();
      if (error || !data) throw new Error(`Failed to update decision after approval: ${error?.message}`);
      updated = data as Record<string, unknown>;
    }

    await this.framework.publishCreated({
      tenantId,
      workspaceId: (parent.workspace_id as string | undefined) ?? undefined,
      objectType: "decision",
      objectId: decisionId,
      title: `Decision ${input.action}: ${updated.title}`,
      projectId: updated.project_id as string | undefined,
      actorId: input.actorId,
      eventSuffix: input.action === "approved" ? "approved" : "updated",
    });

    if (input.action === "approved") {
      await this.kernel?.notifications
        .create({
          tenantId,
          userId: input.actorId,
          type: "engineering.decision.approved",
          title: "Decision approved",
          body: String(updated.title),
        })
        .catch(() => undefined);
    }
    return { decision: updated, approval };
  }

  async supersede(
    commerce: CommerceExecutionContext,
    tenantId: string,
    successorId: string,
    supersededId: string,
    actorId: string,
  ) {
    assertEngineeringService(commerce, "decision.create", tenantId);
    const successor = await this.requireDecision(tenantId, successorId, commerce);
    const prior = await this.requireDecision(tenantId, supersededId, commerce);
    assertSupersessionPair({
      decisionId: successorId,
      supersedesDecisionId: supersededId,
      tenantId,
      workspaceId: successor.workspace_id as string | null,
      prior: {
        id: prior.id as string,
        tenant_id: prior.tenant_id as string,
        workspace_id: (prior.workspace_id as string | null) ?? null,
        supersedes_decision_id: (prior.supersedes_decision_id as string | null) ?? null,
      },
    });
    const { data, error } = await this.supabase
      .from("engineering_decisions")
      .update({ supersedes_decision_id: supersededId })
      .eq("id", successorId)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to supersede decision: ${error?.message}`);
    await this.recordApproval(commerce, tenantId, supersededId, {
      action: "superseded",
      actorId,
      comments: `Superseded by ${String(successor.decision_number ?? successorId)}`,
    });
    await this.framework
      .linkObjects({
        tenantId,
        fromType: "decision",
        fromId: successorId,
        toType: "decision",
        toId: supersededId,
        relationship: "SUPERSEDES",
        createdBy: actorId,
        governed: true,
      })
      .catch(() => undefined);
    await this.framework.publishCreated({
      tenantId,
      workspaceId: (data.workspace_id as string | undefined) ?? undefined,
      objectType: "decision",
      objectId: successorId,
      title: "Decision superseded prior record",
      projectId: data.project_id as string | undefined,
      actorId,
      eventSuffix: "updated",
    });
    return data;
  }

  async updateDecision(
    commerce: CommerceExecutionContext,
    tenantId: string,
    id: string,
    patch: {
      title?: string;
      description?: string;
      rationale?: string;
      decisionQuestion?: string;
      authorityId?: string | null;
      confidence?: number | null;
      recommendation?: string;
      effectiveAt?: string | null;
    },
    actorId?: string,
  ) {
    assertEngineeringService(commerce, "decision.create", tenantId);
    const row: Record<string, unknown> = {};
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.description !== undefined) row.description = patch.description;
    if (patch.rationale !== undefined) row.rationale = patch.rationale;
    if (patch.decisionQuestion !== undefined) row.decision_question = patch.decisionQuestion;
    if (patch.authorityId !== undefined) row.authority_id = patch.authorityId;
    if (patch.confidence !== undefined) row.confidence = patch.confidence;
    if (patch.recommendation !== undefined) row.recommendation = patch.recommendation;
    if (patch.effectiveAt !== undefined) row.effective_at = patch.effectiveAt;
    const { data, error } = await this.supabase
      .from("engineering_decisions")
      .update(row)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to update decision: ${error?.message}`);
    await this.framework.publishCreated({
      tenantId,
      workspaceId: (data.workspace_id as string | undefined) ?? undefined,
      objectType: "decision",
      objectId: id,
      title: `Decision updated: ${data.title}`,
      projectId: data.project_id as string | undefined,
      actorId,
      eventSuffix: "updated",
    });
    return data;
  }

  async linkGoverned(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      fromType: string;
      fromId: string;
      toType: string;
      toId: string;
      relationship: A2WritableRelation;
      createdBy?: string;
    },
  ) {
    assertEngineeringService(commerce, "decision.create", tenantId);
    assertGovernedRelationWrite(input);
    return this.framework.linkObjects({
      tenantId,
      fromType: input.fromType,
      fromId: input.fromId,
      toType: input.toType,
      toId: input.toId,
      relationship: input.relationship,
      createdBy: input.createdBy,
      governed: true,
    });
  }

  private async requireDecision(
    tenantId: string,
    id: string,
    commerce: CommerceExecutionContext,
  ): Promise<Record<string, unknown>> {
    const workspaceId = workspaceScopeId(commerce);
    let q = this.supabase.from("engineering_decisions").select("*").eq("tenant_id", tenantId).eq("id", id);
    if (workspaceId) q = q.eq("workspace_id", workspaceId);
    const { data, error } = await q.maybeSingle();
    if (error || !data) throw new Error("Decision not found in tenant/workspace scope");
    return data as Record<string, unknown>;
  }

  private async materializeLegacyAlternatives(
    decisionId: string,
    tenantId: string,
    alternatives: unknown[],
    createdBy?: string,
  ) {
    for (const [index, item] of alternatives.entries()) {
      const name =
        typeof item === "string"
          ? item
          : typeof item === "object" && item && "name" in item
            ? String((item as { name: unknown }).name)
            : `Alternative ${index + 1}`;
      const description =
        typeof item === "object" && item && "description" in item
          ? String((item as { description: unknown }).description ?? "")
          : null;
      await this.supabase.from("engineering_decision_alternatives").insert({
        tenant_id: tenantId,
        decision_id: decisionId,
        alternative_code: `ALT-${String(index + 1).padStart(2, "0")}`,
        name,
        description,
        status: "considered",
        is_selected: false,
        created_by: createdBy ?? null,
      });
    }
  }
}

export class EngineeringActionService {
  private framework: EngineeringObjectFramework;
  constructor(
    private readonly supabase: SupabaseClient,
    kernel?: PlatformKernel
  ) {
    this.framework = new EngineeringObjectFramework(supabase, kernel);
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, projectId?: string, limit = 50, options?: { aggregate?: boolean }) {
    assertEngineeringService(commerce, "action.list", tenantId, options);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    let q = this.supabase
      .from("engineering_actions")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (projectId) q = q.eq("project_id", projectId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "action.get", tenantId);
    const { data, error } = await this.supabase
      .from("engineering_actions")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  }

  async create(
    commerce: CommerceExecutionContext,
    input: CreateCommon & {
      originatingObjectType?: string;
      originatingObjectId?: string;
    }
  ) {
    assertEngineeringService(commerce, "action.create", input.tenantId);
    const number = await nextNumber(this.supabase, input.tenantId, "engineering_actions", "action_number", "ACT");
    const { data, error } = await this.supabase
      .from("engineering_actions")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId ?? null,
        action_number: number,
        title: input.title,
        description: input.description ?? null,
        status: input.status ?? "open",
        priority: input.priority ?? "medium",
        discipline_id: input.disciplineId ?? null,
        project_id: input.projectId ?? null,
        asset_id: input.assetId ?? null,
        company_id: input.companyId ?? null,
        owner_id: input.ownerId ?? input.createdBy ?? null,
        created_by: input.createdBy ?? null,
        assigned_to: input.assignedTo ?? null,
        originating_object_type: input.originatingObjectType ?? null,
        originating_object_id: input.originatingObjectId ?? null,
        due_date: input.dueDate ?? null,
        ai_context: (input.aiContext ?? {}) as Json,
        metadata: (input.metadata ?? {}) as Json,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create action: ${error?.message}`);

    if (input.originatingObjectType && input.originatingObjectId) {
      await this.framework
        .linkObjects({
          tenantId: input.tenantId,
          fromType: input.originatingObjectType,
          fromId: input.originatingObjectId,
          toType: "action",
          toId: data.id as string,
          relationship: "creates",
          createdBy: input.createdBy,
        })
        .catch(() => undefined);
    }

    return afterCreate(this.framework, this.supabase, "engineering_actions", "action", data, {
      ...input,
      numberField: number,
    });
  }

  async search(commerce: CommerceExecutionContext, tenantId: string, query: string, options?: { aggregate?: boolean }) {
    assertEngineeringService(commerce, "action.search", tenantId, options);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    const needle = sanitizePostgrestIlike(query);
    if (!needle) return [];
    const { data, error } = await this.supabase
      .from("engineering_actions")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .or(`action_number.ilike.%${needle}%,title.ilike.%${needle}%`)
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async updateStatus(
    commerce: CommerceExecutionContext,
    tenantId: string,
    id: string,
    status: string
  ) {
    assertEngineeringService(commerce, "action.update", tenantId);
    const allowed = ["open", "in_progress", "completed", "cancelled"] as const;
    if (!allowed.includes(status as (typeof allowed)[number])) {
      throw new Error(`Unsupported action status: ${status}`);
    }
    const { data: existing, error: lookupError } = await this.supabase
      .from("engineering_actions")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (lookupError || !existing) throw new Error("Action not found");
    const { data, error } = await this.supabase
      .from("engineering_actions")
      .update({ status })
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to update action: ${error?.message}`);
    return data;
  }
}

export class EngineeringRiskService {
  private framework: EngineeringObjectFramework;
  constructor(
    private readonly supabase: SupabaseClient,
    kernel?: PlatformKernel
  ) {
    this.framework = new EngineeringObjectFramework(supabase, kernel);
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, projectId?: string, limit = 50, options?: { aggregate?: boolean }) {
    assertEngineeringService(commerce, "risk.list", tenantId, options);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    let q = this.supabase
      .from("engineering_risks")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .order("score", { ascending: false })
      .limit(limit);
    if (projectId) q = q.eq("project_id", projectId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "risk.get", tenantId);
    const { data, error } = await this.supabase
      .from("engineering_risks")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  }

  async create(
    commerce: CommerceExecutionContext,
    input: CreateCommon & {
      category?: string;
      probability?: number;
      consequence?: number;
      mitigation?: string;
      controls?: unknown[];
    }
  ) {
    assertEngineeringService(commerce, "risk.create", input.tenantId);
    const number = await nextNumber(this.supabase, input.tenantId, "engineering_risks", "risk_number", "RSK");
    const probability = input.probability ?? 1;
    const consequence = input.consequence ?? 1;
    const { data, error } = await this.supabase
      .from("engineering_risks")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId ?? null,
        risk_number: number,
        title: input.title,
        description: input.description ?? null,
        category: input.category ?? null,
        status: input.status ?? "open",
        priority: input.priority ?? "medium",
        probability,
        consequence,
        mitigation: input.mitigation ?? null,
        controls: (input.controls ?? []) as Json,
        discipline_id: input.disciplineId ?? null,
        project_id: input.projectId ?? null,
        asset_id: input.assetId ?? null,
        company_id: input.companyId ?? null,
        owner_id: input.ownerId ?? input.createdBy ?? null,
        created_by: input.createdBy ?? null,
        assigned_to: input.assignedTo ?? null,
        due_date: input.dueDate ?? null,
        ai_context: (input.aiContext ?? {}) as Json,
        metadata: (input.metadata ?? {}) as Json,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create risk: ${error?.message}`);

    if (input.assetId) {
      await this.framework
        .linkObjects({
          tenantId: input.tenantId,
          fromType: "asset",
          fromId: input.assetId,
          toType: "risk",
          toId: data.id as string,
          relationship: "affected_by",
          createdBy: input.createdBy,
        })
        .catch(() => undefined);
    }

    return afterCreate(this.framework, this.supabase, "engineering_risks", "risk", data, {
      ...input,
      numberField: number,
    });
  }

  async matrix(commerce: CommerceExecutionContext, tenantId: string) {
    assertEngineeringService(commerce, "risk.list", tenantId);
    const risks = await this.list(commerce, tenantId);
    const cells: Record<string, number> = {};
    for (const r of risks) {
      const key = `${r.probability}x${r.consequence}`;
      cells[key] = (cells[key] ?? 0) + 1;
    }
    return { risks, cells };
  }

  async search(commerce: CommerceExecutionContext, tenantId: string, query: string, options?: { aggregate?: boolean }) {
    assertEngineeringService(commerce, "risk.search", tenantId, options);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    const needle = sanitizePostgrestIlike(query);
    if (!needle) return [];
    const { data, error } = await this.supabase
      .from("engineering_risks")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .or(`risk_number.ilike.%${needle}%,title.ilike.%${needle}%,category.ilike.%${needle}%`)
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async update(
    commerce: CommerceExecutionContext,
    tenantId: string,
    id: string,
    patch: {
      status?: string;
      mitigation?: string;
      probability?: number;
      consequence?: number;
    }
  ) {
    assertEngineeringService(commerce, "risk.update", tenantId);
    const { data: existing, error: lookupError } = await this.supabase
      .from("engineering_risks")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (lookupError || !existing) throw new Error("Risk not found");
    const allowedStatus = ["open", "mitigated", "closed", "accepted"] as const;
    if (patch.status && !allowedStatus.includes(patch.status as (typeof allowedStatus)[number])) {
      throw new Error(`Unsupported risk status: ${patch.status}`);
    }
    const update: Record<string, unknown> = {};
    if (patch.status) update.status = patch.status;
    if (patch.mitigation !== undefined) update.mitigation = patch.mitigation;
    if (patch.probability !== undefined) update.probability = patch.probability;
    if (patch.consequence !== undefined) update.consequence = patch.consequence;
    if (Object.keys(update).length === 0) return existing;
    const { data, error } = await this.supabase
      .from("engineering_risks")
      .update(update)
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to update risk: ${error?.message}`);
    return data;
  }
}

export class EngineeringIssueService {
  private framework: EngineeringObjectFramework;
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel?: PlatformKernel
  ) {
    this.framework = new EngineeringObjectFramework(supabase, kernel);
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, projectId?: string, limit = 50, options?: { aggregate?: boolean }) {
    assertEngineeringService(commerce, "issue.list", tenantId, options);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    let q = this.supabase
      .from("engineering_issues")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (projectId) q = q.eq("project_id", projectId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "issue.get", tenantId);
    const { data, error } = await this.supabase
      .from("engineering_issues")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  }

  async create(
    commerce: CommerceExecutionContext,
    input: CreateCommon & {
      issueType?: string;
      category?: string;
      impact?: string;
      discoveredBy?: string;
    }
  ) {
    assertEngineeringService(commerce, "issue.create", input.tenantId);
    const number = await nextNumber(this.supabase, input.tenantId, "engineering_issues", "issue_number", "ISS");
    const { data, error } = await this.supabase
      .from("engineering_issues")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId ?? null,
        issue_number: number,
        title: input.title,
        description: input.description ?? null,
        issue_type: input.issueType ?? null,
        category: input.category ?? null,
        status: input.status ?? "open",
        priority: input.priority ?? "medium",
        impact: input.impact ?? null,
        discovered_by: input.discoveredBy ?? input.createdBy ?? null,
        discipline_id: input.disciplineId ?? null,
        project_id: input.projectId ?? null,
        asset_id: input.assetId ?? null,
        company_id: input.companyId ?? null,
        owner_id: input.ownerId ?? input.createdBy ?? null,
        created_by: input.createdBy ?? null,
        assigned_to: input.assignedTo ?? null,
        due_date: input.dueDate ?? null,
        ai_context: (input.aiContext ?? {}) as Json,
        metadata: (input.metadata ?? {}) as Json,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create issue: ${error?.message}`);
    return afterCreate(this.framework, this.supabase, "engineering_issues", "issue", data, {
      ...input,
      numberField: number,
    });
  }

  async promoteToDecision(commerce: CommerceExecutionContext, tenantId: string, issueId: string, createdBy?: string) {
    assertEngineeringService(commerce, "issue.create", tenantId);
    const { data: issue, error } = await this.supabase
      .from("engineering_issues")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", issueId)
      .single();
    if (error || !issue) throw new Error("Issue not found");
    const decisions = new EngineeringDecisionService(this.supabase, this.kernel);
    const decision = await decisions.create(
      commerce,
      {
        tenantId,
        workspaceId: issue.workspace_id as string | undefined,
        title: `Decision from ${issue.issue_number}: ${issue.title}`,
        description: issue.description as string | undefined,
        projectId: issue.project_id as string | undefined,
        assetId: issue.asset_id as string | undefined,
        disciplineId: issue.discipline_id as string | undefined,
        createdBy,
        decisionType: "from_issue",
      },
      "issue.create"
    );
    await this.framework.linkObjects({
      tenantId,
      fromType: "issue",
      fromId: issueId,
      toType: "decision",
      toId: decision.id as string,
      relationship: "becomes",
      createdBy,
    });
    return decision;
  }

  async search(commerce: CommerceExecutionContext, tenantId: string, query: string, options?: { aggregate?: boolean }) {
    assertEngineeringService(commerce, "issue.search", tenantId, options);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    const needle = sanitizePostgrestIlike(query);
    if (!needle) return [];
    const { data, error } = await this.supabase
      .from("engineering_issues")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .or(`issue_number.ilike.%${needle}%,title.ilike.%${needle}%`)
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  }
}


export class EngineeringLessonService {
  private framework: EngineeringObjectFramework;
  constructor(
    private readonly supabase: SupabaseClient,
    kernel?: PlatformKernel
  ) {
    this.framework = new EngineeringObjectFramework(supabase, kernel);
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, projectId?: string, limit = 50, options?: { aggregate?: boolean }) {
    assertEngineeringService(commerce, "lesson.list", tenantId, options);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    let q = this.supabase
      .from("engineering_lessons")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (projectId) q = q.eq("project_id", projectId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "lesson.get", tenantId);
    const { data, error } = await this.supabase
      .from("engineering_lessons")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  }

  async create(
    commerce: CommerceExecutionContext,
    input: CreateCommon & {
      lesson: string;
      recommendation?: string;
      rootCause?: string;
      category?: string;
      lessonReferences?: unknown[];
      derivedFromDecisionId?: string;
    }
  ) {
    assertEngineeringService(commerce, "lesson.create", input.tenantId);
    const number = await nextNumber(this.supabase, input.tenantId, "engineering_lessons", "lesson_number", "LL");
    const { data, error } = await this.supabase
      .from("engineering_lessons")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId ?? null,
        lesson_number: number,
        title: input.title,
        description: input.description ?? null,
        lesson: input.lesson,
        recommendation: input.recommendation ?? null,
        root_cause: input.rootCause ?? null,
        category: input.category ?? null,
        status: input.status ?? "draft",
        priority: input.priority ?? "medium",
        lesson_references: (input.lessonReferences ?? []) as Json,
        discipline_id: input.disciplineId ?? null,
        project_id: input.projectId ?? null,
        asset_id: input.assetId ?? null,
        company_id: input.companyId ?? null,
        owner_id: input.ownerId ?? input.createdBy ?? null,
        created_by: input.createdBy ?? null,
        assigned_to: input.assignedTo ?? null,
        due_date: input.dueDate ?? null,
        ai_context: (input.aiContext ?? {}) as Json,
        metadata: (input.metadata ?? {}) as Json,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create lesson: ${error?.message}`);

    if (input.derivedFromDecisionId) {
      await this.framework
        .linkObjects({
          tenantId: input.tenantId,
          fromType: "lesson",
          fromId: data.id as string,
          toType: "decision",
          toId: input.derivedFromDecisionId,
          relationship: "derived_from",
          createdBy: input.createdBy,
        })
        .catch(() => undefined);
    }

    return afterCreate(this.framework, this.supabase, "engineering_lessons", "lesson", data, {
      ...input,
      numberField: number,
    });
  }

  async search(commerce: CommerceExecutionContext, tenantId: string, query: string, options?: { aggregate?: boolean }) {
    assertEngineeringService(commerce, "lesson.search", tenantId, options);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    const needle = sanitizePostgrestIlike(query);
    if (!needle) return [];
    const { data, error } = await this.supabase
      .from("engineering_lessons")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .or(`lesson_number.ilike.%${needle}%,title.ilike.%${needle}%,lesson.ilike.%${needle}%`)
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  }
}
