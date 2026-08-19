import type {
  BusinessWorkActionLink,
  BusinessWorkCapacityFact,
  BusinessWorkCostFact,
  BusinessWorkCostType,
  BusinessWorkItem,
  BusinessWorkMilestone,
  BusinessWorkMilestoneStatus,
  BusinessWorkStatus,
  BusinessWorkType,
  BusinessWorkValueState,
} from "@rtb/types";

function str(value: unknown): string {
  return String(value ?? "");
}

function opt(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function bool(value: unknown, fallback = false): boolean {
  if (value === null || value === undefined) return fallback;
  return Boolean(value);
}

export function mapWorkItem(row: Record<string, unknown>): BusinessWorkItem {
  const progressSource = row.progress_source;
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    reference: str(row.reference),
    name: str(row.name),
    description: opt(row.description),
    workType: row.work_type as BusinessWorkType,
    customerId: opt(row.customer_id),
    linkedOpportunityId: opt(row.linked_opportunity_id),
    linkedProposalId: opt(row.linked_proposal_id),
    linkedEngineeringProjectId: opt(row.linked_engineering_project_id),
    linkedEngineeringProjectRef: opt(row.linked_engineering_project_ref),
    owner: opt(row.owner_label),
    status: row.status as BusinessWorkStatus,
    plannedStart: opt(row.planned_start)?.slice(0, 10) ?? null,
    plannedFinish: opt(row.planned_finish)?.slice(0, 10) ?? null,
    actualStart: opt(row.actual_start)?.slice(0, 10) ?? null,
    actualFinish: opt(row.actual_finish)?.slice(0, 10) ?? null,
    progressBps: opt(row.progress_bps),
    progressSource:
      progressSource === "user_supplied" || progressSource === "weighted_milestones" ? progressSource : "unknown",
    currency: str(row.currency).trim().toUpperCase(),
    scale: Number(row.scale ?? 2),
    contractedValueMinor: opt(row.contracted_value_minor),
    budgetCostMinor: opt(row.budget_cost_minor),
    actualCostMinor: opt(row.actual_cost_minor),
    lastStatusAt: str(row.last_status_at || row.updated_at),
    sourceType: str(row.source_type),
    sourceRef: opt(row.source_ref),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapMilestone(row: Record<string, unknown>): BusinessWorkMilestone {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    workId: str(row.work_id),
    name: str(row.name),
    dueAt: opt(row.due_at)?.slice(0, 10) ?? null,
    completedAt: opt(row.completed_at)?.slice(0, 10) ?? null,
    status: row.status as BusinessWorkMilestoneStatus,
    weightBps: opt(row.weight_bps),
    owner: opt(row.owner_label),
    sourceType: str(row.source_type),
    sourceRef: opt(row.source_ref),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapActionLink(row: Record<string, unknown>): BusinessWorkActionLink {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    workId: str(row.work_id),
    actionId: str(row.action_id),
    sourceType: str(row.source_type),
    sourceRef: opt(row.source_ref),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapCostFact(row: Record<string, unknown>): BusinessWorkCostFact {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    workId: str(row.work_id),
    periodStart: str(row.period_start).slice(0, 10),
    periodEnd: str(row.period_end).slice(0, 10),
    costType: row.cost_type as BusinessWorkCostType,
    amountMinor: str(row.amount_minor),
    currency: str(row.currency).trim().toUpperCase(),
    scale: Number(row.scale ?? 2),
    valueState: row.value_state as BusinessWorkValueState,
    sourceType: str(row.source_type),
    sourceRef: opt(row.source_ref),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapCapacityFact(row: Record<string, unknown>): BusinessWorkCapacityFact {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    dimensionType: row.dimension_type as BusinessWorkCapacityFact["dimensionType"],
    dimensionRef: str(row.dimension_ref),
    dimensionName: str(row.dimension_name),
    workId: opt(row.work_id),
    periodStart: str(row.period_start).slice(0, 10),
    periodEnd: str(row.period_end).slice(0, 10),
    availableHoursMinor: opt(row.available_hours_minor),
    committedHoursMinor: opt(row.committed_hours_minor),
    utilizationBps: opt(row.utilization_bps),
    capacityStatus: (row.capacity_status as BusinessWorkCapacityFact["capacityStatus"]) ?? "unknown",
    sourceType: str(row.source_type),
    sourceRef: opt(row.source_ref),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}
