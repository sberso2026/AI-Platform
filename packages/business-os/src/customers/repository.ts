import type { Json, SupabaseClient } from "@rtb/database";
import type {
  BusinessCustomer,
  BusinessCustomerContact,
  BusinessCustomerFinancialFact,
  BusinessCustomerLink,
  BusinessCustomerLinkEntityType,
  BusinessCustomerSettings,
} from "@rtb/types";
import { BUSINESS_CUSTOMER_DEFAULT_THRESHOLDS } from "@rtb/types";
import { parseMinor } from "../finance/money";
import { mapContact, mapCustomer, mapFact, mapLink } from "./mappers";
import {
  CUSTOMER_ACCOUNT_EXPANSION_CONTRACT,
  CUSTOMER_RENEWAL_INTELLIGENCE_CONTRACT,
} from "./extensions";

type Scope = { tenantId: string; workspaceId: string };

function table(supabase: SupabaseClient, name: string) {
  return supabase.from(name as never);
}

function requireRow<T>(data: T | null, error: { message: string } | null, label: string): T {
  if (error) throw new Error(`${label}: ${error.message}`);
  if (!data) throw new Error(`${label}: not found`);
  return data;
}

export function minorCol(value: unknown): string | null {
  const parsed = parseMinor(value ?? null);
  return parsed === null ? null : parsed.toString();
}

export function asJson(value: unknown): Json {
  return value as Json;
}

export class CustomerIntelligenceRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listCustomers(scope: Scope): Promise<BusinessCustomer[]> {
    const { data, error } = await table(this.supabase, "business_os_customers")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(`Failed to list customers: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapCustomer);
  }

  async getCustomerById(scope: Scope, id: string): Promise<BusinessCustomer | null> {
    const { data, error } = await table(this.supabase, "business_os_customers")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`Failed to load customer: ${error.message}`);
    return data ? mapCustomer(data as Record<string, unknown>) : null;
  }

  async getCustomerBySourceRef(
    scope: Scope,
    sourceType: string,
    sourceRef: string,
  ): Promise<BusinessCustomer | null> {
    const { data, error } = await table(this.supabase, "business_os_customers")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("source_type", sourceType)
      .eq("source_ref", sourceRef)
      .maybeSingle();
    if (error) throw new Error(`Failed to load customer by source: ${error.message}`);
    return data ? mapCustomer(data as Record<string, unknown>) : null;
  }

  async insertCustomer(row: Record<string, unknown>): Promise<BusinessCustomer> {
    const { data, error } = await table(this.supabase, "business_os_customers")
      .insert(row as never)
      .select("*")
      .single();
    return mapCustomer(requireRow(data as Record<string, unknown> | null, error, "Customer insert"));
  }

  async updateCustomer(scope: Scope, id: string, patch: Record<string, unknown>): Promise<BusinessCustomer> {
    const { data, error } = await table(this.supabase, "business_os_customers")
      .update({ ...patch, updated_at: new Date().toISOString() } as never)
      .eq("id", id)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .select("*")
      .single();
    return mapCustomer(requireRow(data as Record<string, unknown> | null, error, "Customer update"));
  }

  async listContacts(scope: Scope, customerId?: string): Promise<BusinessCustomerContact[]> {
    let query = table(this.supabase, "business_os_customer_contacts")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId);
    if (customerId) query = query.eq("customer_id", customerId);
    const { data, error } = await query.order("updated_at", { ascending: false });
    if (error) throw new Error(`Failed to list contacts: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapContact);
  }

  async getContactBySourceRef(
    scope: Scope,
    sourceType: string,
    sourceRef: string,
  ): Promise<BusinessCustomerContact | null> {
    const { data, error } = await table(this.supabase, "business_os_customer_contacts")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("source_type", sourceType)
      .eq("source_ref", sourceRef)
      .maybeSingle();
    if (error) throw new Error(`Failed to load contact: ${error.message}`);
    return data ? mapContact(data as Record<string, unknown>) : null;
  }

  async insertContact(row: Record<string, unknown>): Promise<BusinessCustomerContact> {
    const { data, error } = await table(this.supabase, "business_os_customer_contacts")
      .insert(row as never)
      .select("*")
      .single();
    return mapContact(requireRow(data as Record<string, unknown> | null, error, "Contact insert"));
  }

  async updateContact(scope: Scope, id: string, patch: Record<string, unknown>): Promise<BusinessCustomerContact> {
    const { data, error } = await table(this.supabase, "business_os_customer_contacts")
      .update({ ...patch, updated_at: new Date().toISOString() } as never)
      .eq("id", id)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .select("*")
      .single();
    return mapContact(requireRow(data as Record<string, unknown> | null, error, "Contact update"));
  }

  async listFacts(scope: Scope, customerId?: string): Promise<BusinessCustomerFinancialFact[]> {
    let query = table(this.supabase, "business_os_customer_financial_facts")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId);
    if (customerId) query = query.eq("customer_id", customerId);
    const { data, error } = await query.order("period_end", { ascending: false });
    if (error) throw new Error(`Failed to list customer facts: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapFact);
  }

  async getFactBySourceRef(
    scope: Scope,
    sourceType: string,
    sourceRef: string,
  ): Promise<BusinessCustomerFinancialFact | null> {
    const { data, error } = await table(this.supabase, "business_os_customer_financial_facts")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("source_type", sourceType)
      .eq("source_ref", sourceRef)
      .maybeSingle();
    if (error) throw new Error(`Failed to load customer fact: ${error.message}`);
    return data ? mapFact(data as Record<string, unknown>) : null;
  }

  async insertFact(row: Record<string, unknown>): Promise<BusinessCustomerFinancialFact> {
    const { data, error } = await table(this.supabase, "business_os_customer_financial_facts")
      .insert(row as never)
      .select("*")
      .single();
    return mapFact(requireRow(data as Record<string, unknown> | null, error, "Customer fact insert"));
  }

  async updateFact(scope: Scope, id: string, patch: Record<string, unknown>): Promise<BusinessCustomerFinancialFact> {
    const { data, error } = await table(this.supabase, "business_os_customer_financial_facts")
      .update({ ...patch, updated_at: new Date().toISOString() } as never)
      .eq("id", id)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .select("*")
      .single();
    return mapFact(requireRow(data as Record<string, unknown> | null, error, "Customer fact update"));
  }

  async listLinks(scope: Scope, customerId?: string): Promise<BusinessCustomerLink[]> {
    let query = table(this.supabase, "business_os_customer_links")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId);
    if (customerId) query = query.eq("customer_id", customerId);
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to list customer links: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapLink);
  }

  async getLinkForEntity(
    scope: Scope,
    entityType: BusinessCustomerLinkEntityType,
    entityId: string,
  ): Promise<BusinessCustomerLink | null> {
    const { data, error } = await table(this.supabase, "business_os_customer_links")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .maybeSingle();
    if (error) throw new Error(`Failed to load customer link: ${error.message}`);
    return data ? mapLink(data as Record<string, unknown>) : null;
  }

  async insertLink(row: Record<string, unknown>): Promise<BusinessCustomerLink> {
    const { data, error } = await table(this.supabase, "business_os_customer_links")
      .insert(row as never)
      .select("*")
      .single();
    return mapLink(requireRow(data as Record<string, unknown> | null, error, "Customer link insert"));
  }

  async getSettings(scope: Scope): Promise<BusinessCustomerSettings> {
    const { data, error } = await table(this.supabase, "business_os_customer_settings")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .maybeSingle();
    if (error) throw new Error(`Failed to load customer settings: ${error.message}`);
    const t = BUSINESS_CUSTOMER_DEFAULT_THRESHOLDS;
    const row = (data as Record<string, unknown> | null) ?? {};
    const thresholds = (row.thresholds as Record<string, unknown> | undefined) ?? {};
    return {
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      concentrationTop1ThresholdBps: Number(
        thresholds.concentrationTop1ThresholdBps ?? t.topCustomerConcentrationWarningBps,
      ),
      concentrationTop5ThresholdBps: Number(
        thresholds.concentrationTop5ThresholdBps ?? t.top5CustomerConcentrationWarningBps,
      ),
      inactivityDays: Number(thresholds.inactivityDays ?? t.inactivityDays),
      staleDays: Number(thresholds.staleDays ?? 30),
      overdueIncreaseWarningBps: Number(thresholds.overdueIncreaseWarningBps ?? t.overdueRatioWarningBps),
      highValueInactivityMinor: String(thresholds.highValueInactivityMinor ?? "0"),
      provenance: (row.provenance as Record<string, unknown> | null) ?? null,
      updatedAt: row.updated_at ? String(row.updated_at) : new Date().toISOString(),
    };
  }

  async upsertSettings(scope: Scope, thresholds: Record<string, unknown>, createdBy?: string): Promise<void> {
    const { error } = await table(this.supabase, "business_os_customer_settings").upsert(
      {
        tenant_id: scope.tenantId,
        workspace_id: scope.workspaceId,
        thresholds: thresholds as Json,
        provenance: { domain: "customer" } as Json,
        created_by: createdBy ?? null,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "tenant_id,workspace_id" },
    );
    if (error) throw new Error(`Failed to save customer settings: ${error.message}`);
  }

  extensionContracts() {
    return {
      renewal: CUSTOMER_RENEWAL_INTELLIGENCE_CONTRACT,
      expansion: CUSTOMER_ACCOUNT_EXPANSION_CONTRACT,
    };
  }
}
