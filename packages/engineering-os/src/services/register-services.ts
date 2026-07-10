import type { Json, SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { EngineeringObjectFramework } from "./object-framework";

type EngineeringRegisterTable =
  | "engineering_decisions"
  | "engineering_actions"
  | "engineering_risks"
  | "engineering_issues"
  | "engineering_technical_queries"
  | "engineering_lessons";

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
    let q = this.supabase
      .from("engineering_decisions")
      .select("*")
      .eq("tenant_id", tenantId)
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
    const [links, comments] = await Promise.all([
      this.framework.listLinks(tenantId, "decision", id),
      this.framework.listComments(tenantId, "decision", id),
    ]);
    return { decision: data, links, comments };
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
        review_status: "pending",
        approval_status: "pending",
        due_date: input.dueDate ?? null,
        ai_context: (input.aiContext ?? {}) as Json,
        metadata: (input.metadata ?? {}) as Json,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create decision: ${error?.message}`);

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
    const { data, error } = await this.supabase
      .from("engineering_decisions")
      .update({
        approval_status: "approved",
        review_status: "approved",
        approved_by: approvedBy,
        status: "approved",
        decision_date: new Date().toISOString().slice(0, 10),
      })
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to approve decision: ${error?.message}`);

    await this.framework.publishCreated({
      tenantId,
      objectType: "decision",
      objectId: id,
      title: `Decision approved: ${data.title}`,
      projectId: data.project_id as string | undefined,
      actorId: approvedBy,
      eventSuffix: "approved",
    });

    if (approvedBy) {
      await this.kernel?.notifications
        .create({
          tenantId,
          userId: approvedBy,
          type: "engineering.decision.approved",
          title: "Decision approved",
          body: String(data.title),
        })
        .catch(() => undefined);
    }
    return data;
  }

  async search(commerce: CommerceExecutionContext, tenantId: string, query: string, options?: { aggregate?: boolean }) {
    assertEngineeringService(commerce, "decision.search", tenantId, options);
    const { data, error } = await this.supabase
      .from("engineering_decisions")
      .select("*")
      .eq("tenant_id", tenantId)
      .or(`decision_number.ilike.%${query}%,title.ilike.%${query}%`)
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
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
    let q = this.supabase
      .from("engineering_actions")
      .select("*")
      .eq("tenant_id", tenantId)
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
    const { data, error } = await this.supabase
      .from("engineering_actions")
      .select("*")
      .eq("tenant_id", tenantId)
      .or(`action_number.ilike.%${query}%,title.ilike.%${query}%`)
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
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
    let q = this.supabase
      .from("engineering_risks")
      .select("*")
      .eq("tenant_id", tenantId)
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
    const { data, error } = await this.supabase
      .from("engineering_risks")
      .select("*")
      .eq("tenant_id", tenantId)
      .or(`risk_number.ilike.%${query}%,title.ilike.%${query}%,category.ilike.%${query}%`)
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
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
    let q = this.supabase
      .from("engineering_issues")
      .select("*")
      .eq("tenant_id", tenantId)
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
    const { data, error } = await this.supabase
      .from("engineering_issues")
      .select("*")
      .eq("tenant_id", tenantId)
      .or(`issue_number.ilike.%${query}%,title.ilike.%${query}%`)
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  }
}

export class EngineeringTechnicalQueryService {
  private framework: EngineeringObjectFramework;
  constructor(
    private readonly supabase: SupabaseClient,
    kernel?: PlatformKernel
  ) {
    this.framework = new EngineeringObjectFramework(supabase, kernel);
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, projectId?: string, limit = 50, options?: { aggregate?: boolean }) {
    assertEngineeringService(commerce, "technical_query.list", tenantId, options);
    let q = this.supabase
      .from("engineering_technical_queries")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (projectId) q = q.eq("project_id", projectId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "technical_query.get", tenantId);
    const { data, error } = await this.supabase
      .from("engineering_technical_queries")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .single();
    if (error) return null;
    const comments = await this.framework.listComments(tenantId, "technical_query", id);
    return { query: data, comments };
  }

  async create(
    commerce: CommerceExecutionContext,
    input: CreateCommon & {
      question: string;
      requesterId?: string;
      responderId?: string;
      documentId?: string;
      responseDue?: string;
    }
  ) {
    assertEngineeringService(commerce, "technical_query.create", input.tenantId);
    const number = await nextNumber(
      this.supabase,
      input.tenantId,
      "engineering_technical_queries",
      "tq_number",
      "TQ"
    );
    const { data, error } = await this.supabase
      .from("engineering_technical_queries")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId ?? null,
        tq_number: number,
        title: input.title,
        question: input.question,
        description: input.description ?? null,
        status: input.status ?? "open",
        priority: input.priority ?? "medium",
        requester_id: input.requesterId ?? input.createdBy ?? null,
        responder_id: input.responderId ?? null,
        document_id: input.documentId ?? null,
        response_due: input.responseDue ?? input.dueDate ?? null,
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
    if (error || !data) throw new Error(`Failed to create TQ: ${error?.message}`);

    if (input.documentId) {
      await this.framework
        .linkObjects({
          tenantId: input.tenantId,
          fromType: "technical_query",
          fromId: data.id as string,
          toType: "document",
          toId: input.documentId,
          relationship: "references",
          createdBy: input.createdBy,
        })
        .catch(() => undefined);
    }

    return afterCreate(
      this.framework,
      this.supabase,
      "engineering_technical_queries",
      "technical_query",
      data,
      { ...input, numberField: number }
    );
  }

  async search(commerce: CommerceExecutionContext, tenantId: string, query: string, options?: { aggregate?: boolean }) {
    assertEngineeringService(commerce, "technical_query.search", tenantId, options);
    const { data, error } = await this.supabase
      .from("engineering_technical_queries")
      .select("*")
      .eq("tenant_id", tenantId)
      .or(`tq_number.ilike.%${query}%,title.ilike.%${query}%,question.ilike.%${query}%`)
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
    let q = this.supabase
      .from("engineering_lessons")
      .select("*")
      .eq("tenant_id", tenantId)
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
    const { data, error } = await this.supabase
      .from("engineering_lessons")
      .select("*")
      .eq("tenant_id", tenantId)
      .or(`lesson_number.ilike.%${query}%,title.ilike.%${query}%,lesson.ilike.%${query}%`)
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  }
}
