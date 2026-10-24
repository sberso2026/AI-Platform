import type { Json, SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import { EngineeringObjectFramework } from "../services/object-framework";
import {
  assertAssumptionConfidence,
  assertAssumptionMateriality,
  assertAssumptionValidationStatus,
  type AssumptionMateriality,
  type AssumptionValidationStatus,
} from "./invariants";
import { assertGovernedRelationWrite, type A2WritableRelation } from "./relations";

async function nextAssumptionNumber(supabase: SupabaseClient, tenantId: string): Promise<string> {
  const { count } = await supabase
    .from("engineering_assumptions")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId);
  return `ASM-${String((count ?? 0) + 1).padStart(4, "0")}`;
}

export class EngineeringAssumptionService {
  private framework: EngineeringObjectFramework;

  constructor(
    private readonly supabase: SupabaseClient,
    kernel?: PlatformKernel,
  ) {
    this.framework = new EngineeringObjectFramework(supabase, kernel);
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, projectId?: string, limit = 50) {
    assertEngineeringService(commerce, "assumption.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    let q = this.supabase
      .from("engineering_assumptions")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (projectId) q = q.eq("project_id", projectId);
    const { data, error } = await q;
    if (error) throw new Error(`Failed to list assumptions: ${error.message}`);
    return data ?? [];
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "assumption.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    let q = this.supabase
      .from("engineering_assumptions")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id);
    if (workspaceId) q = q.eq("workspace_id", workspaceId);
    const { data, error } = await q.maybeSingle();
    if (error || !data) return null;
    const links = await this.framework.listLinks(tenantId, "assumption", id);
    return { assumption: data, links };
  }

  async create(
    commerce: CommerceExecutionContext,
    input: {
      tenantId: string;
      workspaceId?: string;
      title: string;
      statement: string;
      source?: string;
      rationale?: string;
      status?: string;
      confidence?: number;
      validationStatus?: AssumptionValidationStatus;
      materiality?: AssumptionMateriality;
      ownerId?: string;
      projectId?: string;
      assetId?: string;
      validationDueAt?: string;
      reviewCondition?: string;
      expiresAt?: string;
      createdBy?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    assertEngineeringService(commerce, "assumption.create", input.tenantId);
    const workspaceId = input.workspaceId ?? workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("Assumption workspace_id is required");
    if (!input.statement?.trim()) throw new Error("Assumption statement is required");
    assertAssumptionConfidence(input.confidence);
    if (input.validationStatus) assertAssumptionValidationStatus(input.validationStatus);
    if (input.materiality) assertAssumptionMateriality(input.materiality);
    const number = await nextAssumptionNumber(this.supabase, input.tenantId);
    const { data, error } = await this.supabase
      .from("engineering_assumptions")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: workspaceId,
        project_id: input.projectId ?? null,
        asset_id: input.assetId ?? null,
        assumption_number: number,
        title: input.title,
        statement: input.statement,
        source: input.source ?? null,
        rationale: input.rationale ?? null,
        status: input.status ?? "draft",
        confidence: input.confidence ?? null,
        validation_status: input.validationStatus ?? "unvalidated",
        materiality: input.materiality ?? "medium",
        owner_id: input.ownerId ?? input.createdBy ?? null,
        created_by: input.createdBy ?? null,
        validation_due_at: input.validationDueAt ?? null,
        review_condition: input.reviewCondition ?? null,
        expires_at: input.expiresAt ?? null,
        metadata: (input.metadata ?? {}) as Json,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create assumption: ${error?.message}`);
    await this.framework.publishCreated({
      tenantId: input.tenantId,
      workspaceId,
      objectType: "assumption",
      objectId: data.id as string,
      title: `Assumption: ${input.title}`,
      projectId: input.projectId,
      assetId: input.assetId,
      actorId: input.createdBy,
    });
    return data;
  }

  async update(
    commerce: CommerceExecutionContext,
    tenantId: string,
    id: string,
    patch: {
      title?: string;
      statement?: string;
      source?: string;
      rationale?: string;
      status?: string;
      confidence?: number | null;
      materiality?: AssumptionMateriality;
      ownerId?: string;
      validationDueAt?: string | null;
      reviewCondition?: string | null;
      expiresAt?: string | null;
    },
    actorId?: string,
  ) {
    assertEngineeringService(commerce, "assumption.update", tenantId);
    if (patch.confidence !== undefined) assertAssumptionConfidence(patch.confidence);
    if (patch.materiality) assertAssumptionMateriality(patch.materiality);
    const workspaceId = workspaceScopeId(commerce);
    const row: Record<string, unknown> = {};
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.statement !== undefined) row.statement = patch.statement;
    if (patch.source !== undefined) row.source = patch.source;
    if (patch.rationale !== undefined) row.rationale = patch.rationale;
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.confidence !== undefined) row.confidence = patch.confidence;
    if (patch.materiality !== undefined) row.materiality = patch.materiality;
    if (patch.ownerId !== undefined) row.owner_id = patch.ownerId;
    if (patch.validationDueAt !== undefined) row.validation_due_at = patch.validationDueAt;
    if (patch.reviewCondition !== undefined) row.review_condition = patch.reviewCondition;
    if (patch.expiresAt !== undefined) row.expires_at = patch.expiresAt;
    let q = this.supabase.from("engineering_assumptions").update(row).eq("id", id).eq("tenant_id", tenantId);
    if (workspaceId) q = q.eq("workspace_id", workspaceId);
    const { data, error } = await q.select().single();
    if (error || !data) throw new Error(`Failed to update assumption: ${error?.message}`);
    await this.framework.publishCreated({
      tenantId,
      workspaceId: workspaceId ?? undefined,
      objectType: "assumption",
      objectId: id,
      title: `Assumption updated: ${data.title}`,
      projectId: data.project_id as string | undefined,
      actorId,
      eventSuffix: "updated",
    });
    return data;
  }

  async setValidation(
    commerce: CommerceExecutionContext,
    tenantId: string,
    id: string,
    validationStatus: AssumptionValidationStatus,
    actorId: string,
  ) {
    assertEngineeringService(commerce, "assumption.update", tenantId);
    assertAssumptionValidationStatus(validationStatus);
    const workspaceId = workspaceScopeId(commerce);
    let q = this.supabase
      .from("engineering_assumptions")
      .update({ validation_status: validationStatus })
      .eq("id", id)
      .eq("tenant_id", tenantId);
    if (workspaceId) q = q.eq("workspace_id", workspaceId);
    const { data, error } = await q.select().single();
    if (error || !data) throw new Error(`Failed to set assumption validation: ${error?.message}`);
    const suffix =
      validationStatus === "invalidated"
        ? "invalidated"
        : validationStatus === "validated" || validationStatus === "accepted_risk"
          ? "validated"
          : "updated";
    await this.framework.publishCreated({
      tenantId,
      workspaceId: workspaceId ?? undefined,
      objectType: "assumption",
      objectId: id,
      title: `Assumption ${validationStatus}: ${data.title}`,
      projectId: data.project_id as string | undefined,
      actorId,
      eventSuffix: suffix,
    });
    return data;
  }

  async link(
    commerce: CommerceExecutionContext,
    input: {
      tenantId: string;
      assumptionId: string;
      toType: string;
      toId: string;
      relationship: A2WritableRelation;
      createdBy?: string;
    },
  ) {
    assertEngineeringService(commerce, "assumption.update", input.tenantId);
    const fromType = input.relationship === "BASED_ON" ? input.toType : "assumption";
    const fromId = input.relationship === "BASED_ON" ? input.toId : input.assumptionId;
    const toType = input.relationship === "BASED_ON" ? "assumption" : input.toType;
    const toId = input.relationship === "BASED_ON" ? input.assumptionId : input.toId;
    assertGovernedRelationWrite({
      relationship: input.relationship,
      fromType,
      toType,
    });
    return this.framework.linkObjects({
      tenantId: input.tenantId,
      fromType,
      fromId,
      toType,
      toId,
      relationship: input.relationship,
      createdBy: input.createdBy,
      governed: true,
    });
  }
}
