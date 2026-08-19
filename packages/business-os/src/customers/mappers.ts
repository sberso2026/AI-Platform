import type {
  BusinessCustomer,
  BusinessCustomerContact,
  BusinessCustomerFinancialFact,
  BusinessCustomerLink,
  BusinessCustomerStatus,
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

export function mapCustomer(row: Record<string, unknown>): BusinessCustomer {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    organisationName: str(row.organisation_name),
    tradingName: opt(row.trading_name),
    externalIds: (row.external_ids as Record<string, string>) ?? {},
    website: opt(row.website),
    domain: opt(row.domain),
    industry: opt(row.industry),
    geography: opt(row.geography),
    customerStatus: row.customer_status as BusinessCustomerStatus,
    relationshipOwner: opt(row.relationship_owner),
    acquiredAt: opt(row.acquired_at)?.slice(0, 10) ?? null,
    sourceType: str(row.source_type),
    sourceRef: opt(row.source_ref),
    sourceTimestamp: opt(row.source_timestamp),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
    archivedAt: opt(row.archived_at),
  };
}

export function mapContact(row: Record<string, unknown>): BusinessCustomerContact {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    customerId: str(row.customer_id),
    name: str(row.name),
    role: opt(row.role),
    businessEmail: opt(row.business_email),
    businessPhone: opt(row.business_phone),
    relationshipType: opt(row.relationship_type),
    primary: bool(row.is_primary),
    suppressed: bool(row.suppressed),
    sourceType: str(row.source_type),
    sourceRef: opt(row.source_ref),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapLink(row: Record<string, unknown>): BusinessCustomerLink {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    customerId: str(row.customer_id),
    entityType: row.entity_type as BusinessCustomerLink["entityType"],
    entityId: str(row.entity_id),
    sourceType: str(row.source_type),
    sourceRef: opt(row.source_ref),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapFact(row: Record<string, unknown>): BusinessCustomerFinancialFact {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    customerId: str(row.customer_id),
    periodStart: str(row.period_start).slice(0, 10),
    periodEnd: str(row.period_end).slice(0, 10),
    revenueMinor: opt(row.revenue_minor),
    directCostMinor: opt(row.direct_cost_minor),
    grossContributionMinor: opt(row.gross_contribution_minor),
    receivableOutstandingMinor: opt(row.receivable_outstanding_minor),
    receivableOverdueMinor: opt(row.receivable_overdue_minor),
    ageingCurrentMinor: opt(row.ageing_current_minor),
    ageing130Minor: opt(row.ageing_130_minor),
    ageing3160Minor: opt(row.ageing_3160_minor),
    ageing6190Minor: opt(row.ageing_6190_minor),
    ageing90PlusMinor: opt(row.ageing_90plus_minor),
    dueDate: opt(row.due_date)?.slice(0, 10) ?? null,
    paidDate: opt(row.paid_date)?.slice(0, 10) ?? null,
    currency: str(row.currency).trim(),
    scale: Number(row.scale ?? 2),
    sourceType: str(row.source_type),
    sourceRef: opt(row.source_ref),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}
