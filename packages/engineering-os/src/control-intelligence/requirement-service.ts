import type { Json, SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import { EngineeringObjectFramework } from "../services/object-framework";
import { assertA4GovernedRelationWrite } from "../decision-intelligence/relations";
import {
  assertAllocationTargetType,
  assertRequirementStatus,
  assertRequirementType,
  assertVerificationMethod,
  assertVerificationStatus,
  type AllocationTargetType,
  type RequirementStatus,
  type RequirementType,
  type VerificationMethod,
  type VerificationStatus,
} from "./invariants";

async function nextRequirementCode(supabase: SupabaseClient, tenantId: string, workspaceId: string): Promise<string> {
  const { count } = await supabase
    .from("engineering_requirements")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("workspace_id", workspaceId);
  return `REQ-${String((count ?? 0) + 1).padStart(4, "0")}`;
}

export class EngineeringRequirementService {
  private framework: EngineeringObjectFramework;

  constructor(
    private readonly supabase: SupabaseClient,
    kernel?: PlatformKernel,
  ) {
    this.framework = new EngineeringObjectFramework(supabase, kernel);
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, projectId?: string, limit = 100) {
    assertEngineeringService(commerce, "requirement.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) return [];
    let q = this.supabase
      .from("engineering_requirements")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .order("requirement_code")
      .limit(limit);
    if (projectId) q = q.eq("project_id", projectId);
    const { data, error } = await q;
    if (error) throw new Error(`Failed to list requirements: ${error.message}`);
    return data ?? [];
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "requirement.get", tenantId);
    const row = await this.requireRow(tenantId, id, commerce);
    const links = await this.framework.listLinks(tenantId, "requirement", id);
    const allocations = (links as Record<string, unknown>[]).filter((link) => link.relationship === "ALLOCATED_TO");
    const assumptions = (links as Record<string, unknown>[]).filter(
      (link) =>
        link.relationship === "USED_BY" && (link.from_type === "assumption" || link.to_type === "assumption"),
    );
    const evidence = (links as Record<string, unknown>[]).filter((link) => link.relationship === "VERIFIED_BY");
    return { requirement: row, allocations, assumptions, evidence, links };
  }

  async create(
    commerce: CommerceExecutionContext,
    input: {
      tenantId: string;
      title: string;
      statement: string;
      requirementType: RequirementType | string;
      requirementCode?: string;
      source?: string;
      rationale?: string;
      status?: RequirementStatus;
      priority?: string;
      ownerId?: string;
      projectId?: string;
      acceptanceCriteria?: string;
      verificationMethod?: VerificationMethod;
      verificationStatus?: VerificationStatus;
      createdBy?: string;
    },
  ) {
    assertEngineeringService(commerce, "requirement.create", input.tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace required");
    assertRequirementType(input.requirementType);
    if (input.status) assertRequirementStatus(input.status);
    if (input.verificationMethod) assertVerificationMethod(input.verificationMethod);
    if (input.verificationStatus) assertVerificationStatus(input.verificationStatus);
    const code =
      input.requirementCode?.trim() || (await nextRequirementCode(this.supabase, input.tenantId, workspaceId));
    const { data, error } = await this.supabase
      .from("engineering_requirements")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: workspaceId,
        project_id: input.projectId ?? null,
        requirement_code: code,
        title: input.title,
        statement: input.statement,
        requirement_type: input.requirementType,
        source: input.source ?? null,
        rationale: input.rationale ?? null,
        status: input.status ?? "draft",
        priority: input.priority ?? "medium",
        owner_id: input.ownerId ?? input.createdBy ?? null,
        acceptance_criteria: input.acceptanceCriteria ?? null,
        verification_method: input.verificationMethod ?? null,
        verification_status: input.verificationStatus ?? "unverified",
        created_by: input.createdBy ?? null,
        metadata: {} as Json,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create requirement: ${error?.message}`);
    await this.framework
      .publishCreated({
        tenantId: input.tenantId,
        workspaceId,
        objectType: "requirement",
        objectId: data.id as string,
        projectId: input.projectId,
        title: `Requirement created: ${input.title}`,
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
      statement?: string;
      requirementType?: string;
      source?: string;
      rationale?: string;
      status?: string;
      priority?: string;
      ownerId?: string;
      projectId?: string | null;
      acceptanceCriteria?: string | null;
      verificationMethod?: string | null;
      verificationStatus?: string;
      verificationEvidenceRef?: string | null;
    },
    actorId?: string,
  ) {
    assertEngineeringService(commerce, "requirement.update", tenantId);
    const existing = await this.requireRow(tenantId, id, commerce);
    if (patch.requirementType) assertRequirementType(patch.requirementType);
    if (patch.status) assertRequirementStatus(patch.status);
    if (patch.verificationMethod) assertVerificationMethod(patch.verificationMethod);
    if (patch.verificationStatus) assertVerificationStatus(patch.verificationStatus);
    const row: Record<string, unknown> = {};
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.statement !== undefined) row.statement = patch.statement;
    if (patch.requirementType !== undefined) row.requirement_type = patch.requirementType;
    if (patch.source !== undefined) row.source = patch.source;
    if (patch.rationale !== undefined) row.rationale = patch.rationale;
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.priority !== undefined) row.priority = patch.priority;
    if (patch.ownerId !== undefined) row.owner_id = patch.ownerId;
    if (patch.projectId !== undefined) row.project_id = patch.projectId;
    if (patch.acceptanceCriteria !== undefined) row.acceptance_criteria = patch.acceptanceCriteria;
    if (patch.verificationMethod !== undefined) row.verification_method = patch.verificationMethod;
    if (patch.verificationStatus !== undefined) row.verification_status = patch.verificationStatus;
    if (patch.verificationEvidenceRef !== undefined) row.verification_evidence_ref = patch.verificationEvidenceRef;
    const { data, error } = await this.supabase
      .from("engineering_requirements")
      .update(row)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to update requirement: ${error?.message}`);
    const workspaceId = workspaceScopeId(commerce) ?? undefined;
    if (patch.statement && patch.statement !== existing.statement) {
      await this.framework
        .recordTimeline({
          tenantId,
          workspaceId,
          eventType: "requirement.statement_changed",
          objectType: "requirement",
          objectId: id,
          title: `Requirement statement changed: ${String(existing.requirement_code)}`,
          actorId,
        })
        .catch(() => undefined);
    }
    if (patch.verificationStatus && patch.verificationStatus !== existing.verification_status) {
      await this.framework
        .recordTimeline({
          tenantId,
          workspaceId,
          eventType: "requirement.verification_status_changed",
          objectType: "requirement",
          objectId: id,
          title: `Requirement verification: ${String(existing.verification_status)} → ${patch.verificationStatus}`,
          actorId,
        })
        .catch(() => undefined);
    }
    if (patch.acceptanceCriteria !== undefined && patch.acceptanceCriteria !== existing.acceptance_criteria) {
      await this.framework
        .recordTimeline({
          tenantId,
          workspaceId,
          eventType: "requirement.acceptance_criteria_changed",
          objectType: "requirement",
          objectId: id,
          title: `Requirement acceptance criteria changed: ${String(existing.requirement_code)}`,
          actorId,
        })
        .catch(() => undefined);
    }
    return data;
  }

  async allocate(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { requirementId: string; targetType: AllocationTargetType | string; targetId: string; createdBy?: string },
  ) {
    assertEngineeringService(commerce, "requirement.update", tenantId);
    assertAllocationTargetType(input.targetType);
    await this.requireRow(tenantId, input.requirementId, commerce);
    assertA4GovernedRelationWrite({
      relationship: "ALLOCATED_TO",
      fromType: "requirement",
      toType: input.targetType,
    });
    const link = await this.framework.linkObjects({
      tenantId,
      fromType: "requirement",
      fromId: input.requirementId,
      toType: input.targetType,
      toId: input.targetId,
      relationship: "ALLOCATED_TO",
      createdBy: input.createdBy,
      governed: true,
    });
    await this.framework
      .recordTimeline({
        tenantId,
        workspaceId: workspaceScopeId(commerce) ?? undefined,
        eventType: "requirement.allocated",
        objectType: "requirement",
        objectId: input.requirementId,
        title: `Requirement ALLOCATED_TO ${input.targetType}`,
        actorId: input.createdBy,
      })
      .catch(() => undefined);
    return link;
  }

  async unallocate(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { requirementId: string; targetType: AllocationTargetType | string; targetId: string; actorId?: string },
  ) {
    assertEngineeringService(commerce, "requirement.update", tenantId);
    assertAllocationTargetType(input.targetType);
    await this.requireRow(tenantId, input.requirementId, commerce);
    await this.framework.unlinkObjects({
      tenantId,
      fromType: "requirement",
      fromId: input.requirementId,
      toType: input.targetType,
      toId: input.targetId,
      relationship: "ALLOCATED_TO",
    });
    await this.framework
      .recordTimeline({
        tenantId,
        workspaceId: workspaceScopeId(commerce) ?? undefined,
        eventType: "requirement.unallocated",
        objectType: "requirement",
        objectId: input.requirementId,
        title: `Requirement unallocated from ${input.targetType}`,
        actorId: input.actorId,
      })
      .catch(() => undefined);
  }

  async linkAssumption(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { requirementId: string; assumptionId: string; createdBy?: string },
  ) {
    assertEngineeringService(commerce, "requirement.update", tenantId);
    await this.requireRow(tenantId, input.requirementId, commerce);
    assertA4GovernedRelationWrite({
      relationship: "USED_BY",
      fromType: "assumption",
      toType: "requirement",
    });
    return this.framework.linkObjects({
      tenantId,
      fromType: "assumption",
      fromId: input.assumptionId,
      toType: "requirement",
      toId: input.requirementId,
      relationship: "USED_BY",
      createdBy: input.createdBy,
      governed: true,
    });
  }

  async linkEvidence(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { requirementId: string; evidenceType: "document" | "review_package"; evidenceId: string; createdBy?: string },
  ) {
    assertEngineeringService(commerce, "requirement.update", tenantId);
    await this.requireRow(tenantId, input.requirementId, commerce);
    assertA4GovernedRelationWrite({
      relationship: "VERIFIED_BY",
      fromType: "requirement",
      toType: input.evidenceType,
    });
    return this.framework.linkObjects({
      tenantId,
      fromType: "requirement",
      fromId: input.requirementId,
      toType: input.evidenceType,
      toId: input.evidenceId,
      relationship: "VERIFIED_BY",
      createdBy: input.createdBy,
      governed: true,
    });
  }

  async linkDependsOn(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { requirementId: string; dependsOnRequirementId: string; createdBy?: string },
  ) {
    assertEngineeringService(commerce, "requirement.update", tenantId);
    if (input.requirementId === input.dependsOnRequirementId) {
      throw new Error("requirement cannot depend on itself");
    }
    await this.requireRow(tenantId, input.requirementId, commerce);
    await this.requireRow(tenantId, input.dependsOnRequirementId, commerce);
    assertA4GovernedRelationWrite({
      relationship: "DEPENDS_ON",
      fromType: "requirement",
      toType: "requirement",
    });
    return this.framework.linkObjects({
      tenantId,
      fromType: "requirement",
      fromId: input.requirementId,
      toType: "requirement",
      toId: input.dependsOnRequirementId,
      relationship: "DEPENDS_ON",
      createdBy: input.createdBy,
      governed: true,
    });
  }

  private async requireRow(tenantId: string, id: string, commerce: CommerceExecutionContext) {
    const workspaceId = workspaceScopeId(commerce);
    let q = this.supabase.from("engineering_requirements").select("*").eq("tenant_id", tenantId).eq("id", id);
    if (workspaceId) q = q.eq("workspace_id", workspaceId);
    const { data, error } = await q.maybeSingle();
    if (error || !data) throw new Error("Requirement not found in tenant/workspace scope");
    return data as Record<string, unknown>;
  }
}
