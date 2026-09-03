import type { Json, SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import type { CommerceExecutionContext } from "@rtb/types";
import { CommerceDomainError } from "@rtb/platform-commerce";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import { EngineeringObjectFramework } from "./object-framework";
import { sanitizePostgrestIlike } from "./postgrest-ilike";
import { mapTechnicalQueryStatus } from "./technical-query-status";
import {
  displayPersonName,
  isClosedWorkflow,
  matchesRegisterView,
  metadataRecord,
  persistPriority,
  persistWorkflowStatus,
  presentTechnicalQuery,
  type TechnicalQueryPerson,
  type TechnicalQueryPresentation,
  type TechnicalQueryReference,
} from "./technical-query-workflow";

type CreateTechnicalQueryInput = {
  tenantId: string;
  workspaceId?: string;
  title?: string;
  question: string;
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
  requesterId?: string;
  responderId?: string;
  documentId?: string;
  responseDue?: string;
  metadata?: Record<string, unknown>;
  aiContext?: Record<string, unknown>;
  submit?: boolean;
  suggestedSolution?: string;
  classification?: string;
  area?: string;
  system?: string;
  subsystem?: string;
  workPackage?: string;
  contractPackage?: string;
  originatingCompany?: string;
  respondingCompany?: string;
  externalReference?: string;
  reviewerUserId?: string;
  approverUserId?: string;
  watchers?: string[];
  requireActionBy?: boolean;
};

function privilegedRole(roleSlug?: string | null): boolean {
  return roleSlug === "owner" || roleSlug === "admin" || roleSlug === "operator";
}

function asId(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function mergeMetadata(
  existing: unknown,
  patch: Record<string, unknown | undefined>,
): Record<string, unknown> {
  const next = { ...metadataRecord(existing) };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    next[key] = value as unknown;
  }
  return next;
}

async function nextTqNumber(supabase: SupabaseClient, tenantId: string): Promise<string> {
  const { count } = await supabase
    .from("engineering_technical_queries")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId);
  return `TQ-${String((count ?? 0) + 1).padStart(3, "0")}`;
}

export class EngineeringTechnicalQueryService {
  private framework: EngineeringObjectFramework;
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel?: PlatformKernel,
  ) {
    this.framework = new EngineeringObjectFramework(supabase, kernel);
  }

  async list(
    commerce: CommerceExecutionContext,
    tenantId: string,
    projectId?: string,
    limit = 50,
    options?: { aggregate?: boolean },
  ) {
    assertEngineeringService(commerce, "technical_query.list", tenantId, options);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    let q = this.supabase
      .from("engineering_technical_queries")
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

  async listPresented(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      projectId?: string;
      view?: string;
      query?: string;
      status?: string;
      disciplineId?: string;
      initiatorId?: string;
      actionById?: string;
      classification?: string;
      priority?: string;
      actorUserId?: string;
      limit?: number;
    } = {},
  ) {
    const rows = (await this.list(
      commerce,
      tenantId,
      input.projectId,
      input.limit ?? 200,
    )) as Record<string, unknown>[];
    const filtered = rows.filter((row) => {
      if (input.view && !matchesRegisterView(row, input.view, input.actorUserId)) return false;
      if (input.status && persistWorkflowStatus(String(row.status ?? "")) !== persistWorkflowStatus(input.status)) {
        return false;
      }
      if (input.disciplineId && row.discipline_id !== input.disciplineId) return false;
      if (input.initiatorId && row.requester_id !== input.initiatorId) return false;
      if (input.actionById && row.assigned_to !== input.actionById && row.responder_id !== input.actionById) {
        return false;
      }
      if (input.priority && persistPriority(String(row.priority ?? "")) !== persistPriority(input.priority)) {
        return false;
      }
      if (input.classification) {
        const classification = metadataRecord(row.metadata).classification;
        if (classification !== input.classification) return false;
      }
      if (input.query) {
        const needle = input.query.toLowerCase();
        const haystack = `${row.tq_number ?? ""} ${row.title ?? ""} ${row.question ?? ""}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
    return this.presentRows(commerce, tenantId, filtered);
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "technical_query.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    const { data, error } = await this.supabase
      .from("engineering_technical_queries")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) return null;
    if (!data) return null;
    if (workspaceId && data.workspace_id && data.workspace_id !== workspaceId) return null;
    const comments = await this.framework.listComments(tenantId, "technical_query", id);
    return { query: data, comments };
  }

  async getPresented(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    const loaded = await this.get(commerce, tenantId, id);
    if (!loaded) return null;
    return this.decoratePresented(commerce, tenantId, loaded.query as Record<string, unknown>, loaded.comments);
  }

  async listDirectory(commerce: CommerceExecutionContext, tenantId: string) {
    assertEngineeringService(commerce, "technical_query.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    const { data, error } = await this.supabase
      .from("workspace_memberships")
      .select("user_id")
      .eq("workspace_id", workspaceId);
    if (error) return [];
    const ids = (data ?? []).map((row) => String((row as { user_id?: string }).user_id ?? "")).filter(Boolean);
    const people = [...(await this.loadPeople(ids, workspaceId)).values()];
    // Filter to eligible assignable users: must have a real full_name (not a fixture/service account).
    // Fixtures/service accounts typically lack a full_name or have metadata.is_fixture = true or
    // metadata.disabled = true. We never delete them — just exclude from the selector.
    return people.filter((person) => {
      // Require a non-empty name that is not an email-style string (which indicates no full_name)
      const name = person.name ?? "";
      if (!name || name === "Unknown person") return false;
      // If the resolved name looks like an email address, the profile has no full_name — exclude.
      if (name.includes("@")) return false;
      return true;
    });
  }

  async create(commerce: CommerceExecutionContext, input: CreateTechnicalQueryInput) {
    assertEngineeringService(commerce, "technical_query.create", input.tenantId);
    const question = input.question?.trim() ?? "";
    const due = input.responseDue ?? input.dueDate ?? null;
    const explicitSubmit = input.submit === true;
    const draft = input.submit === false || input.status === "draft";
    if (explicitSubmit) {
      if (!question) {
        throw new CommerceDomainError("Query / Information Required is required", "invalid_request", 422);
      }
      if (!due) {
        throw new CommerceDomainError("Response Due Date is required", "invalid_request", 422);
      }
    }
    if (explicitSubmit && input.requireActionBy && !input.assignedTo && !input.responderId) {
      throw new CommerceDomainError("Action By is required before submission", "invalid_request", 422);
    }
    const number = await nextTqNumber(this.supabase, input.tenantId);
    const status = explicitSubmit
      ? persistWorkflowStatus(input.status ?? "awaiting_response")
      : draft
        ? "draft"
        : (input.status ?? "open");
    const metadata = mergeMetadata(input.metadata, {
      suggested_solution: input.suggestedSolution ?? null,
      classification: input.classification ?? null,
      area: input.area ?? null,
      system: input.system ?? null,
      subsystem: input.subsystem ?? null,
      work_package: input.workPackage ?? null,
      contract_package: input.contractPackage ?? null,
      originating_company: input.originatingCompany ?? null,
      responding_company: input.respondingCompany ?? null,
      external_reference: input.externalReference ?? null,
      reviewer_user_id: input.reviewerUserId ?? null,
      approver_user_id: input.approverUserId ?? null,
      watchers: input.watchers ?? [],
      date_raised: new Date().toISOString(),
    });
    const title = (input.title ?? question).slice(0, 240) || number;
    const { data, error } = await this.supabase
      .from("engineering_technical_queries")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId ?? null,
        tq_number: number,
        title,
        question,
        description: input.description ?? null,
        status,
        priority: persistPriority(input.priority),
        requester_id: input.requesterId ?? input.createdBy ?? null,
        responder_id: input.responderId ?? input.assignedTo ?? null,
        document_id: input.documentId ?? null,
        response_due: due,
        discipline_id: input.disciplineId ?? null,
        project_id: input.projectId ?? null,
        asset_id: input.assetId ?? null,
        company_id: input.companyId ?? null,
        owner_id: input.ownerId ?? input.createdBy ?? null,
        created_by: input.createdBy ?? null,
        assigned_to: input.assignedTo ?? input.responderId ?? null,
        due_date: due,
        ai_context: (input.aiContext ?? {}) as Json,
        metadata: metadata as Json,
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

    await this.afterCreate(data as Record<string, unknown>, input, number);
    if (explicitSubmit) {
      await this.recordEvent(data as Record<string, unknown>, "submitted", `${number} submitted`, input.createdBy);
      await this.notifyAssigned(data as Record<string, unknown>, input.createdBy);
    } else {
      await this.recordEvent(data as Record<string, unknown>, "created", `${number} ${draft ? "draft saved" : "created"}`, input.createdBy);
      if (!draft && (input.assignedTo || input.responderId)) {
        await this.notifyAssigned(data as Record<string, unknown>, input.createdBy);
      }
    }
    return this.presentAfterWrite(commerce, input.tenantId, data as Record<string, unknown>);
  }

  async respond(
    commerce: CommerceExecutionContext,
    tenantId: string,
    id: string,
    input: { response: string; status?: string; responderId?: string },
  ) {
    return this.applyAction(commerce, tenantId, id, {
      action: "submit_response",
      response: input.response,
      status: input.status,
      actorUserId: input.responderId,
    });
  }

  async applyAction(
    commerce: CommerceExecutionContext,
    tenantId: string,
    id: string,
    input: {
      action: string;
      actorUserId?: string;
      actorRole?: string | null;
      response?: string;
      responseBasis?: string;
      qualifications?: string;
      followUpActions?: string;
      status?: string;
      assignedTo?: string;
      requesterId?: string;
      reviewerUserId?: string;
      approverUserId?: string;
      question?: string;
      title?: string;
      description?: string;
      suggestedSolution?: string;
      responseDue?: string;
      closeoutComments?: string;
      evidenceComplete?: boolean;
      actionsCompleted?: boolean;
      referencesRetained?: boolean;
      comment?: string;
      toType?: string;
      toId?: string;
      relationship?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    assertEngineeringService(commerce, "technical_query.update", tenantId);
    const existing = await this.requireRow(commerce, tenantId, id);
    const actorUserId = input.actorUserId ?? commerce.actorUserId;
    const privileged = privilegedRole(input.actorRole);
    const assignedTo = asId(existing.assigned_to);
    const requesterId = asId(existing.requester_id);
    const metadata = metadataRecord(existing.metadata);
    const reviewerId = typeof metadata.reviewer_user_id === "string" ? metadata.reviewer_user_id : null;
    const approverId = typeof metadata.approver_user_id === "string" ? metadata.approver_user_id : null;
    const canRespond =
      privileged ||
      (actorUserId && (actorUserId === assignedTo || actorUserId === asId(existing.responder_id))) ||
      !assignedTo;
    const canReview = privileged || (actorUserId && (actorUserId === requesterId || actorUserId === reviewerId || actorUserId === approverId));
    const canEditDraft = persistWorkflowStatus(String(existing.status ?? "")) === "draft" &&
      (privileged || actorUserId === requesterId || actorUserId === asId(existing.created_by));

    const patch: Record<string, unknown> = {};
    let metaPatch: Record<string, unknown | undefined> = {};
    let eventSuffix = input.action;
    let eventTitle = `${existing.tq_number} updated`;
    let notify: "assigned" | "review" | "clarification" | "closed" | null = null;

    switch (input.action) {
      case "save_draft":
      case "update_draft": {
        if (!canEditDraft) {
          throw new CommerceDomainError("This technical query can no longer be edited as a draft", "forbidden", 403);
        }
        if (typeof input.question === "string") patch.question = input.question;
        if (typeof input.title === "string") patch.title = input.title;
        if (typeof input.description === "string") patch.description = input.description;
        if (typeof input.responseDue === "string") {
          patch.response_due = input.responseDue;
          patch.due_date = input.responseDue;
        }
        if (typeof input.assignedTo === "string") {
          patch.assigned_to = input.assignedTo || null;
          patch.responder_id = input.assignedTo || null;
        }
        metaPatch.suggested_solution = input.suggestedSolution;
        eventSuffix = "created";
        eventTitle = `${existing.tq_number} draft updated`;
        break;
      }
      case "submit": {
        if (!canEditDraft && persistWorkflowStatus(String(existing.status ?? "")) !== "draft") {
          throw new CommerceDomainError("Only a draft technical query can be submitted", "invalid_transition", 422);
        }
        if (!String(existing.question ?? input.question ?? "").trim()) {
          throw new CommerceDomainError("Query / Information Required is required", "invalid_request", 422);
        }
        const due = input.responseDue ?? asId(existing.response_due) ?? asId(existing.due_date);
        if (!due) {
          throw new CommerceDomainError("Response Due Date is required", "invalid_request", 422);
        }
        patch.status = "awaiting_response";
        patch.response_due = due;
        patch.due_date = due;
        if (typeof input.assignedTo === "string") {
          patch.assigned_to = input.assignedTo || null;
          patch.responder_id = input.assignedTo || null;
        }
        eventSuffix = "submitted";
        eventTitle = `${existing.tq_number} submitted`;
        notify = "assigned";
        break;
      }
      case "assign": {
        if (!privileged && actorUserId !== requesterId) {
          throw new CommerceDomainError("You cannot reassign this technical query", "forbidden", 403);
        }
        patch.assigned_to = input.assignedTo ?? null;
        patch.responder_id = input.assignedTo ?? asId(existing.responder_id);
        eventSuffix = "assigned";
        eventTitle = `${existing.tq_number} assigned`;
        notify = "assigned";
        break;
      }
      case "save_response_draft": {
        if (!canRespond) {
          throw new CommerceDomainError("You are not assigned to respond to this technical query", "forbidden", 403);
        }
        if (typeof input.response === "string") patch.response = input.response;
        metaPatch.response_basis = input.responseBasis;
        metaPatch.qualifications = input.qualifications;
        metaPatch.follow_up_actions = input.followUpActions;
        eventSuffix = "response_drafted";
        eventTitle = `${existing.tq_number} response drafted`;
        break;
      }
      case "submit_response": {
        if (!canRespond) {
          throw new CommerceDomainError("You are not assigned to respond to this technical query", "forbidden", 403);
        }
        const response = (input.response ?? String(existing.response ?? "")).trim();
        if (!response) {
          throw new CommerceDomainError("Client / Technical Response is required", "invalid_request", 422);
        }
        patch.response = response;
        patch.status = input.status ? mapTechnicalQueryStatus(input.status) : "response_submitted";
        patch.responder_id = actorUserId ?? asId(existing.responder_id);
        metaPatch.response_basis = input.responseBasis;
        metaPatch.qualifications = input.qualifications;
        metaPatch.follow_up_actions = input.followUpActions;
        metaPatch.response_submitted_at = new Date().toISOString();
        eventSuffix = "response_submitted";
        eventTitle = `${existing.tq_number} response submitted`;
        notify = "review";
        break;
      }
      case "request_clarification": {
        if (!canReview) {
          throw new CommerceDomainError("You cannot request clarification on this technical query", "forbidden", 403);
        }
        patch.status = "clarification_required";
        if (input.comment) {
          await this.framework.addComment({
            tenantId,
            objectType: "technical_query",
            objectId: id,
            body: input.comment,
            createdBy: actorUserId,
          });
        }
        eventSuffix = "clarification_requested";
        eventTitle = `${existing.tq_number} clarification requested`;
        notify = "clarification";
        break;
      }
      case "accept": {
        if (!canReview) {
          throw new CommerceDomainError("You cannot accept this technical query response", "forbidden", 403);
        }
        patch.status = "accepted";
        metaPatch.accepted_at = new Date().toISOString();
        metaPatch.accepted_by_user_id = actorUserId ?? null;
        eventSuffix = "accepted";
        eventTitle = `${existing.tq_number} accepted`;
        notify = "accept";
        break;
      }
      case "close": {
        if (!canReview) {
          throw new CommerceDomainError("You cannot close this technical query", "forbidden", 403);
        }
        const response = String(existing.response ?? input.response ?? "").trim();
        if (!response) {
          throw new CommerceDomainError("A final response is required before closeout", "invalid_request", 422);
        }
        patch.status = "closed";
        patch.closed_date = new Date().toISOString();
        metaPatch.closeout_comments = input.closeoutComments ?? null;
        metaPatch.evidence_complete = Boolean(input.evidenceComplete);
        metaPatch.actions_completed = Boolean(input.actionsCompleted);
        metaPatch.references_retained = input.referencesRetained !== false;
        metaPatch.closed_at = patch.closed_date;
        eventSuffix = "closed";
        eventTitle = `${existing.tq_number} closed`;
        notify = "closed";
        break;
      }
      case "reopen": {
        if (!privileged && !canReview) {
          throw new CommerceDomainError("You cannot reopen this technical query", "forbidden", 403);
        }
        patch.status = "awaiting_response";
        patch.closed_date = null;
        eventSuffix = "reopened";
        eventTitle = `${existing.tq_number} reopened`;
        notify = "assigned";
        break;
      }
      case "comment": {
        if (!input.comment?.trim()) {
          throw new CommerceDomainError("Comment is required", "invalid_request", 422);
        }
        await this.framework.addComment({
          tenantId,
          objectType: "technical_query",
          objectId: id,
          body: input.comment.trim(),
          createdBy: actorUserId,
        });
        eventSuffix = "commented";
        eventTitle = `${existing.tq_number} discussion updated`;
        break;
      }
      case "link": {
        if (!input.toType || !input.toId) {
          throw new CommerceDomainError("A reference target is required", "invalid_request", 422);
        }
        await this.framework.linkObjects({
          tenantId,
          fromType: "technical_query",
          fromId: id,
          toType: input.toType,
          toId: input.toId,
          relationship: input.relationship ?? "references",
          createdBy: actorUserId,
        });
        if (input.toType === "document" && !existing.document_id) {
          patch.document_id = input.toId;
        }
        eventSuffix = "reference_added";
        eventTitle = `${existing.tq_number} reference added`;
        break;
      }
      default:
        throw new CommerceDomainError(`Unsupported TQ action: ${input.action}`, "invalid_transition", 422);
    }

    if (input.metadata) metaPatch = { ...metaPatch, ...input.metadata };
    if (Object.keys(metaPatch).length) {
      patch.metadata = mergeMetadata(existing.metadata, metaPatch) as Json;
    }

    let data = existing;
    if (Object.keys(patch).length) {
      const updated = await this.supabase
        .from("engineering_technical_queries")
        .update(patch)
        .eq("tenant_id", tenantId)
        .eq("id", id)
        .select()
        .maybeSingle();
      if (updated.error) {
        throw new CommerceDomainError(
          updated.error.message,
          "technical_query_update_failed",
          updated.error.code === "42501" ? 403 : 422,
        );
      }
      if (!updated.data) {
        throw new CommerceDomainError("Technical query not found", "not_found", 404);
      }
      data = updated.data as Record<string, unknown>;
    }

    await this.recordEvent(data, eventSuffix, eventTitle, actorUserId);
    if (notify === "assigned") await this.notifyAssigned(data, actorUserId);
    if (notify === "review") await this.notifyReview(data, actorUserId);
    if (notify === "clarification") await this.notifyAssigned(data, actorUserId, "Clarification requested — please resubmit your response");
    if (notify === "accept") await this.notifyAccept(data, actorUserId);
    if (notify === "closed") await this.notifyWatchers(data, `Technical Query ${data.tq_number} closed`);

    return this.presentAfterWrite(commerce, tenantId, data);
  }

  async search(commerce: CommerceExecutionContext, tenantId: string, query: string, options?: { aggregate?: boolean }) {
    assertEngineeringService(commerce, "technical_query.search", tenantId, options);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    const needle = sanitizePostgrestIlike(query);
    if (!needle) return [];
    const { data, error } = await this.supabase
      .from("engineering_technical_queries")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .or(`tq_number.ilike.%${needle}%,title.ilike.%${needle}%,question.ilike.%${needle}%`)
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  private async presentAfterWrite(
    commerce: CommerceExecutionContext,
    tenantId: string,
    row: Record<string, unknown>,
  ) {
    const comments = await this.framework.listComments(tenantId, "technical_query", String(row.id)).catch(() => []);
    return this.decoratePresented(commerce, tenantId, row, comments);
  }

  private async decoratePresented(
    commerce: CommerceExecutionContext,
    tenantId: string,
    row: Record<string, unknown>,
    comments: unknown,
  ) {
    const id = String(row.id);
    const [presented] = await this.presentRows(commerce, tenantId, [row]);
    const links = await this.framework.listLinks(tenantId, "technical_query", id).catch(() => []);
    const references = await this.resolveReferences(tenantId, links as Record<string, unknown>[]);
    const history = await this.listHistory(tenantId, id);
    return {
      query: row,
      comments,
      links,
      references,
      history,
      presentation: presented?.presentation ?? presentTechnicalQuery({ row }),
    };
  }

  private async requireRow(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    const workspaceId = workspaceScopeId(commerce);
    const { data, error } = await this.supabase
      .from("engineering_technical_queries")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) {
      throw new CommerceDomainError(
        error.message,
        "technical_query_lookup_failed",
        error.code === "42501" ? 403 : 500,
      );
    }
    if (!data) throw new CommerceDomainError("Technical query not found", "not_found", 404);
    if (workspaceId && data.workspace_id && data.workspace_id !== workspaceId) {
      throw new CommerceDomainError("Technical query not found", "not_found", 404);
    }
    return data as Record<string, unknown>;
  }

  private async presentRows(
    commerce: CommerceExecutionContext,
    tenantId: string,
    rows: Record<string, unknown>[],
  ): Promise<Array<Record<string, unknown> & { presentation: TechnicalQueryPresentation }>> {
    if (!rows.length) return [];
    const workspaceId = workspaceScopeId(commerce);
    const userIds = new Set<string>();
    const projectIds = new Set<string>();
    const disciplineIds = new Set<string>();
    const assetIds = new Set<string>();
    for (const row of rows) {
      for (const key of ["requester_id", "assigned_to", "responder_id", "created_by", "owner_id"]) {
        const value = asId(row[key]);
        if (value) userIds.add(value);
      }
      const metadata = metadataRecord(row.metadata);
      for (const key of ["reviewer_user_id", "approver_user_id"]) {
        const value = asId(metadata[key]);
        if (value) userIds.add(value);
      }
      if (Array.isArray(metadata.watchers)) {
        for (const id of metadata.watchers) {
          if (typeof id === "string") userIds.add(id);
        }
      }
      const projectId = asId(row.project_id);
      if (projectId) projectIds.add(projectId);
      const disciplineId = asId(row.discipline_id);
      if (disciplineId) disciplineIds.add(disciplineId);
      const assetId = asId(row.asset_id);
      if (assetId) assetIds.add(assetId);
    }
    const people = await this.loadPeople([...userIds], workspaceId);
    const projects = await this.loadLabels("engineering_projects", [...projectIds], "project_name");
    const disciplines = await this.loadLabels("engineering_disciplines", [...disciplineIds], "name");
    const assets = await this.loadLabels("engineering_assets", [...assetIds], "asset_name");
    return rows.map((row) => {
      const presentation = presentTechnicalQuery({
        row,
        people,
        projectName: asId(row.project_id) ? projects.get(String(row.project_id)) ?? null : null,
        disciplineName: asId(row.discipline_id) ? disciplines.get(String(row.discipline_id)) ?? null : null,
        assetLabel: asId(row.asset_id) ? assets.get(String(row.asset_id)) ?? null : null,
      });
      return {
        ...row,
        initiator_name: presentation.initiator?.name ?? null,
        action_by_name: presentation.actionBy?.name ?? (presentation.assigned ? null : "Unassigned"),
        status_label: presentation.statusLabel,
        priority_label: presentation.priority,
        project_name: presentation.projectName,
        discipline_name: presentation.disciplineName,
        presentation,
      };
    });
  }

  private async loadPeople(ids: string[], workspaceId?: string | null): Promise<Map<string, TechnicalQueryPerson>> {
    const map = new Map<string, TechnicalQueryPerson>();
    if (!ids.length) return map;
    const { data: profiles } = await this.supabase
      .from("profiles")
      .select("id, full_name, email, metadata")
      .in("id", ids);
    const roleByUser = new Map<string, string>();
    if (workspaceId) {
      const { data: memberships } = await this.supabase
        .from("workspace_memberships")
        .select("user_id, role_id")
        .eq("workspace_id", workspaceId)
        .in("user_id", ids);
      const rows = (memberships ?? []) as Array<{ user_id?: string; role_id?: string }>;
      const roleIds = rows.map((row) => row.role_id).filter((id): id is string => Boolean(id));
      const roleById = new Map<string, string>();
      if (roleIds.length) {
        const { data: roles } = await this.supabase.from("roles").select("id, name, slug").in("id", roleIds);
        for (const role of (roles ?? []) as Array<{ id?: string; name?: string; slug?: string }>) {
          if (role.id) roleById.set(role.id, String(role.name ?? role.slug ?? ""));
        }
      }
      for (const row of rows) {
        if (row.user_id && row.role_id && roleById.get(row.role_id)) {
          roleByUser.set(row.user_id, roleById.get(row.role_id) as string);
        }
      }
    }
    for (const profile of profiles ?? []) {
      const metadata = metadataRecord(profile.metadata);
      map.set(String(profile.id), {
        id: String(profile.id),
        name: displayPersonName({
          fullName: typeof profile.full_name === "string" ? profile.full_name : null,
          email: typeof profile.email === "string" ? profile.email : null,
        }),
        role: roleByUser.get(String(profile.id)) ?? (typeof metadata.role === "string" ? metadata.role : null),
        company: typeof metadata.company === "string" ? metadata.company : typeof metadata.company_name === "string" ? metadata.company_name : null,
        discipline: typeof metadata.discipline === "string" ? metadata.discipline : null,
      });
    }
    return map;
  }

  private async loadLabels(
    table: "engineering_projects" | "engineering_disciplines" | "engineering_assets" | "engineering_documents" | "engineering_actions" | "engineering_technical_queries",
    ids: string[],
    column: string,
  ): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (!ids.length) return map;
    const rows = await this.loadIdLabelRows(table, ids, column);
    for (const row of rows) {
      const label = row[column];
      if (typeof label === "string" && label.trim() && row.id) map.set(String(row.id), label);
    }
    return map;
  }

  private async loadIdLabelRows(
    table: "engineering_projects" | "engineering_disciplines" | "engineering_assets" | "engineering_documents" | "engineering_actions" | "engineering_technical_queries",
    ids: string[],
    column: string,
  ): Promise<Array<Record<string, unknown>>> {
    const query =
      table === "engineering_projects"
        ? this.supabase.from(table).select("id, project_name").in("id", ids)
        : table === "engineering_assets"
          ? this.supabase.from(table).select("id, asset_name").in("id", ids)
          : table === "engineering_disciplines"
            ? this.supabase.from(table).select("id, name").in("id", ids)
            : table === "engineering_documents"
              ? this.supabase.from(table).select("id, document_number, title").in("id", ids)
              : table === "engineering_actions"
                ? this.supabase.from(table).select("id, title").in("id", ids)
                : this.supabase.from(table).select("id, tq_number").in("id", ids);
    const { data } = await query;
    return ((data ?? []) as unknown as Array<Record<string, unknown>>).map((row) => {
      if (table === "engineering_projects") return { ...row, project_name: row.project_name, [column]: row.project_name };
      if (table === "engineering_assets") return { ...row, [column]: row.asset_name };
      if (table === "engineering_technical_queries") return { ...row, [column]: row.tq_number };
      if (table === "engineering_documents") return { ...row, [column]: row.title };
      return { ...row, [column]: row[column] ?? row.name ?? row.title };
    });
  }

  private async resolveReferences(
    tenantId: string,
    links: Record<string, unknown>[],
  ): Promise<TechnicalQueryReference[]> {
    const grouped = new Map<string, string[]>();
    for (const link of links) {
      const fromType = String(link.from_type ?? "");
      const toType = String(link.to_type ?? "");
      const fromId = String(link.from_id ?? "");
      const toId = String(link.to_id ?? "");
      const objectType = fromType === "technical_query" ? toType : fromType;
      const objectId = fromType === "technical_query" ? toId : fromId;
      if (!objectType || !objectId) continue;
      grouped.set(objectType, [...(grouped.get(objectType) ?? []), objectId]);
    }
    const docs = await this.loadDocumentRefs(grouped.get("document") ?? []);
    const assets = await this.loadLabels("engineering_assets", grouped.get("asset") ?? [], "asset_name");
    const actions = await this.loadLabels("engineering_actions", grouped.get("action") ?? [], "title");
    const tqs = await this.loadLabels("engineering_technical_queries", grouped.get("technical_query") ?? [], "tq_number");
    return links.map((link) => {
      const fromType = String(link.from_type ?? "");
      const objectType = fromType === "technical_query" ? String(link.to_type ?? "") : fromType;
      const objectId = fromType === "technical_query" ? String(link.to_id ?? "") : String(link.from_id ?? "");
      const doc = docs.get(objectId);
      return {
        objectType,
        objectId,
        relationship: String(link.relationship ?? "references"),
        number: doc?.number ?? tqs.get(objectId) ?? null,
        title: doc?.title ?? assets.get(objectId) ?? actions.get(objectId) ?? null,
        revision: doc?.revision ?? null,
        status: doc?.status ?? null,
        source: doc?.source ?? objectType,
      };
    });
  }

  private async loadDocumentRefs(ids: string[]) {
    const map = new Map<string, { number: string; title: string; revision: string | null; status: string | null; source: string | null }>();
    if (!ids.length) return map;
    const { data } = await this.supabase
      .from("engineering_documents")
      .select("id, document_number, title, revision, status, source")
      .in("id", ids);
    for (const row of data ?? []) {
      map.set(String(row.id), {
        number: String(row.document_number ?? ""),
        title: String(row.title ?? ""),
        revision: typeof row.revision === "string" ? row.revision : null,
        status: typeof row.status === "string" ? row.status : null,
        source: typeof row.source === "string" ? row.source : "document",
      });
    }
    return map;
  }

  private async listHistory(tenantId: string, objectId: string) {
    const { data } = await this.supabase
      .from("engineering_timeline_events")
      .select("event_type, title, summary, occurred_at, actor_id")
      .eq("tenant_id", tenantId)
      .eq("object_id", objectId)
      .order("occurred_at", { ascending: false })
      .limit(50);
    const actorIds = [...new Set((data ?? []).map((row) => asId(row.actor_id)).filter((id): id is string => Boolean(id)))];
    const people = await this.loadPeople(actorIds);
    return (data ?? []).map((row) => ({
      eventType: row.event_type,
      title: row.title,
      summary: row.summary,
      occurredAt: row.occurred_at,
      actorName: asId(row.actor_id) ? people.get(String(row.actor_id))?.name ?? null : null,
    }));
  }

  private async afterCreate(
    row: Record<string, unknown>,
    input: CreateTechnicalQueryInput,
    number: string,
  ) {
    try {
      const knowledgeNodeId = await this.framework.createKnowledgeNode({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        objectType: "technical_query",
        objectId: row.id as string,
        title: String(input.title ?? row.title ?? number),
        content: { number },
        createdBy: input.createdBy,
      });
      if (knowledgeNodeId) {
        await this.supabase
          .from("engineering_technical_queries")
          .update({ knowledge_node_id: knowledgeNodeId })
          .eq("id", row.id as string);
        row.knowledge_node_id = knowledgeNodeId;
      }
      if (input.projectId && knowledgeNodeId) {
        await this.framework
          .linkObjects({
            tenantId: input.tenantId,
            fromType: "project",
            fromId: input.projectId,
            toType: "technical_query",
            toId: row.id as string,
            relationship: "contains",
            createdBy: input.createdBy,
          })
          .catch(() => undefined);
      }
      await this.framework.publishCreated({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        objectType: "technical_query",
        objectId: row.id as string,
        title: `technical_query: ${String(row.title ?? number)}`,
        projectId: input.projectId,
        assetId: input.assetId,
        actorId: input.createdBy,
        eventSuffix: input.submit === false ? "created" : "created",
      });
    } catch {
      // best-effort platform integrations
    }
  }

  private async recordEvent(
    row: Record<string, unknown>,
    eventSuffix: string,
    title: string,
    actorId?: string | null,
  ) {
    await this.framework
      .recordTimeline({
        tenantId: String(row.tenant_id),
        workspaceId: asId(row.workspace_id) ?? undefined,
        eventType: `engineering.technical_query.${eventSuffix}`,
        objectType: "technical_query",
        objectId: String(row.id),
        projectId: asId(row.project_id) ?? undefined,
        assetId: asId(row.asset_id) ?? undefined,
        title,
        actorId: actorId ?? undefined,
      })
      .catch(() => undefined);
    await this.framework
      .recordActivity({
        tenantId: String(row.tenant_id),
        workspaceId: asId(row.workspace_id) ?? undefined,
        activityType: `engineering.technical_query.${eventSuffix}`,
        objectType: "technical_query",
        objectId: String(row.id),
        projectId: asId(row.project_id) ?? undefined,
        title,
        actorId: actorId ?? undefined,
      })
      .catch(() => undefined);
  }

  private async notifyAssigned(row: Record<string, unknown>, actorId?: string | null, title?: string) {
    const userId = asId(row.assigned_to) ?? asId(row.responder_id);
    // Notify the recipient unless they themselves triggered the assignment.
    if (!userId) return;
    const tqNumber = String(row.tq_number ?? "");
    const dueDate = typeof row.response_due === "string" || typeof row.due_date === "string"
      ? String(row.response_due ?? row.due_date ?? "")
      : null;
    const notifyTitle = title
      ? `${tqNumber}: ${title}`
      : `Technical Query ${tqNumber} assigned to you`;
    await this.kernel?.notifications
      .create({
        tenantId: String(row.tenant_id),
        userId,
        type: "task.assigned",
        title: notifyTitle,
        body: [String(row.title ?? row.question ?? ""), dueDate ? `Due ${dueDate}` : null].filter(Boolean).join(" · "),
        linkTarget: `/engineering/technical-queries/${row.id}`,
        metadata: { tq_number: row.tq_number, object_type: "technical_query", actor_id: actorId },
      })
      .catch(() => undefined);
  }

  private async notifyReview(row: Record<string, unknown>, actorId?: string | null) {
    // Notify the initiator (or reviewer if set) that a response is ready.
    const metadata = metadataRecord(row.metadata);
    const reviewerId = asId(metadata.reviewer_user_id);
    const recipientId = reviewerId ?? asId(row.requester_id);
    if (!recipientId) return;
    const tqNumber = String(row.tq_number ?? "");
    await this.kernel?.notifications
      .create({
        tenantId: String(row.tenant_id),
        userId: recipientId,
        type: "review.required",
        title: `Technical Query ${tqNumber} response submitted for review`,
        body: String(row.title ?? ""),
        linkTarget: `/engineering/technical-queries/${row.id}`,
        metadata: { tq_number: row.tq_number, object_type: "technical_query", actor_id: actorId },
      })
      .catch(() => undefined);
  }

  private async notifyAccept(row: Record<string, unknown>, actorId?: string | null) {
    // Notify the responder / Action By that their response was accepted.
    const userId = asId(row.assigned_to) ?? asId(row.responder_id);
    if (!userId) return;
    const tqNumber = String(row.tq_number ?? "");
    await this.kernel?.notifications
      .create({
        tenantId: String(row.tenant_id),
        userId,
        type: "task.assigned",
        title: `Technical Query ${tqNumber} response accepted`,
        body: String(row.title ?? ""),
        linkTarget: `/engineering/technical-queries/${row.id}`,
        metadata: { tq_number: row.tq_number, object_type: "technical_query", actor_id: actorId },
      })
      .catch(() => undefined);
  }

  private async notifyWatchers(row: Record<string, unknown>, title: string, excludeId?: string | null) {
    const metadata = metadataRecord(row.metadata);
    const ids = new Set<string>();
    for (const key of [row.requester_id, row.assigned_to, metadata.reviewer_user_id, metadata.approver_user_id]) {
      const id = asId(key);
      if (id) ids.add(id);
    }
    if (Array.isArray(metadata.watchers)) {
      for (const id of metadata.watchers) {
        if (typeof id === "string") ids.add(id);
      }
    }
    const tqNumber = String(row.tq_number ?? "");
    const notifyTitle = title.startsWith("Technical Query") ? title : `Technical Query ${tqNumber} ${title}`;
    await Promise.all(
      [...ids].filter((id) => id !== excludeId).map((userId) =>
        this.kernel?.notifications
          .create({
            tenantId: String(row.tenant_id),
            userId,
            type: "task.assigned",
            title: notifyTitle,
            body: String(row.title ?? ""),
            linkTarget: `/engineering/technical-queries/${row.id}`,
            metadata: { tq_number: row.tq_number, object_type: "technical_query" },
          })
          .catch(() => undefined),
      ),
    );
  }
}

export { isClosedWorkflow };
