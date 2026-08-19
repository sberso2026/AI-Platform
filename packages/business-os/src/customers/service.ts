import type { SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import { AuditService } from "@rtb/platform-core";
import type {
  AiDailyBriefNarrative,
  BusinessCustomer,
  BusinessCustomer360,
  BusinessCustomerContactIngestInput,
  BusinessCustomerFactIngestInput,
  BusinessCustomerHealth,
  BusinessCustomerIngestInput,
  BusinessCustomerLinkEntityType,
  BusinessCustomerPaymentBehaviour,
  BusinessCustomerStatus,
  BusinessGrowthLead,
  BusinessGrowthOpportunity,
  BusinessKpi,
  BusinessKpiCategory,
} from "@rtb/types";
import {
  BUSINESS_CUSTOMER_DEFAULT_THRESHOLDS,
  BUSINESS_CUSTOMER_STATUSES,
  BUSINESS_OS_EVENT_TYPES,
} from "@rtb/types";
import { computeBusinessHealth } from "../owner-command/health";
import type { OwnerCommandService, OwnerCommandScope } from "../owner-command/service";
import { GrowthIntelligenceService } from "../growth/service";
import { RevenueExecutionService } from "../revenue/service";
import { parseMinor, toSafeNumber } from "../finance/money";
import { computeConcentration } from "./concentration";
import { assertNotAmbiguous, resolveCustomerMatch } from "./conversion";
import {
  CUSTOMER_DEMO_CONTACTS,
  CUSTOMER_DEMO_CUSTOMERS,
  CUSTOMER_DEMO_FACTS,
  CUSTOMER_DEMO_FIXTURE,
} from "./demo";
import { accountExpansionStatus, renewalIntelligenceStatus } from "./extensions";
import { computeCustomerHealth } from "./health";
import { computePaymentBehaviour, contributionFromFact } from "./payment";
import { asJson, CustomerIntelligenceRepository, minorCol } from "./repository";
import { detectCustomerSignals } from "./signals";

function requireWorkspace(scope: { tenantId: string; workspaceId?: string; userId: string }): OwnerCommandScope {
  if (!scope.workspaceId) throw new Error("workspace_not_assigned");
  return { tenantId: scope.tenantId, workspaceId: scope.workspaceId, userId: scope.userId };
}

function integerMetric(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  return toSafeNumber(BigInt(value));
}

const CUSTOMER_KPI_META: Record<
  string,
  { name: string; category: BusinessKpiCategory; unit: string; direction: BusinessKpi["direction"] }
> = {
  active_customers: {
    name: "Active customers",
    category: "operations",
    unit: "count",
    direction: "higher_is_better",
  },
  new_customers: { name: "New customers", category: "operations", unit: "count", direction: "higher_is_better" },
  customer_revenue: { name: "Customer revenue", category: "revenue", unit: "minor", direction: "higher_is_better" },
  top_customer_concentration: {
    name: "Top customer concentration",
    category: "revenue",
    unit: "bps",
    direction: "lower_is_better",
  },
  top5_customer_concentration: {
    name: "Top 5 customer concentration",
    category: "revenue",
    unit: "bps",
    direction: "lower_is_better",
  },
  customers_at_risk: {
    name: "Customers at risk",
    category: "operations",
    unit: "count",
    direction: "lower_is_better",
  },
  overdue_customer_receivables: {
    name: "Overdue customer receivables",
    category: "receivables",
    unit: "minor",
    direction: "lower_is_better",
  },
  customer_health_coverage: {
    name: "Customer health coverage",
    category: "operations",
    unit: "bps",
    direction: "higher_is_better",
  },
};

export class CustomerIntelligenceService {
  readonly repository: CustomerIntelligenceRepository;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel: PlatformKernel,
    private readonly audit: AuditService,
    private readonly ownerCommand: OwnerCommandService,
    private readonly growthIntelligence: GrowthIntelligenceService,
    private readonly revenueExecution: RevenueExecutionService,
  ) {
    this.repository = new CustomerIntelligenceRepository(supabase);
  }

  writeExternalCrm(): never {
    throw new Error("external_crm_write_forbidden");
  }

  sendToCustomer(): never {
    throw new Error("external_customer_communication_forbidden");
  }

  makeCreditDecision(): never {
    throw new Error("credit_decision_forbidden");
  }

  private async emit(
    scope: OwnerCommandScope,
    eventType: (typeof BUSINESS_OS_EVENT_TYPES)[number],
    payload: Record<string, unknown>,
  ) {
    try {
      await this.kernel.eventBus.publish({
        tenantId: scope.tenantId,
        workspaceId: scope.workspaceId,
        eventType,
        source: "business-os",
        payload,
      });
    } catch {
      // Event persistence must not fail-close the mutation.
    }
  }

  async ingestCustomer(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: BusinessCustomerIngestInput,
  ) {
    const scope = requireWorkspace(raw);
    if (!input.organisationName?.trim()) throw new Error("organisation_name_required");
    if (!input.sourceType) throw new Error("invalid_source_type");
    const status = input.customerStatus ?? "active";
    if (!BUSINESS_CUSTOMER_STATUSES.includes(status)) throw new Error("invalid_customer_status");

    const existingBySource =
      input.sourceRef != null && input.sourceRef !== ""
        ? await this.repository.getCustomerBySourceRef(scope, input.sourceType, input.sourceRef)
        : null;
    const customers = await this.repository.listCustomers(scope);
    const match = existingBySource
      ? ({ kind: "exact" as const, customer: existingBySource })
      : resolveCustomerMatch(customers, {
          organisationName: input.organisationName,
          domain: input.domain,
        });
    const matched = assertNotAmbiguous(match);
    const archivedAt = status === "archived" ? new Date().toISOString() : null;
    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      organisation_name: input.organisationName.trim(),
      trading_name: input.tradingName ?? null,
      external_ids: asJson(input.externalIds ?? {}),
      website: input.website ?? null,
      domain: input.domain?.trim().toLowerCase() || null,
      industry: input.industry ?? null,
      geography: input.geography ?? null,
      customer_status: status,
      relationship_owner: input.relationshipOwner ?? null,
      acquired_at: input.acquiredAt ?? null,
      source_type: input.sourceType,
      source_ref: input.sourceRef ?? null,
      source_timestamp: input.sourceTimestamp ?? null,
      provenance: asJson({ ...(input.provenance ?? {}), domain: "customer", live: false }),
      is_demo: input.isDemo ?? false,
      archived_at: archivedAt,
      created_by: scope.userId,
    };

    const customer = matched
      ? await this.repository.updateCustomer(scope, matched.id, payload)
      : await this.repository.insertCustomer(payload);
    const created = !matched;
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: created ? "create" : "update",
      resourceType: "business_os_customer",
      resourceId: customer.id,
      metadata: { sourceType: input.sourceType, sourceRef: input.sourceRef ?? null, idempotent: !created },
    });
    await this.emit(scope, created ? "business_os.customer.created" : "business_os.customer.updated", {
      id: customer.id,
      created,
    });
    await this.publishToOwnerCommand(scope);
    return { customer, created };
  }

  async ingestContact(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: BusinessCustomerContactIngestInput,
  ) {
    const scope = requireWorkspace(raw);
    if (!input.customerId) throw new Error("customer_id_required");
    if (!input.name?.trim()) throw new Error("contact_name_required");
    const customer = await this.repository.getCustomerById(scope, input.customerId);
    if (!customer) throw new Error("Customer not found");
    const existing =
      input.sourceRef != null && input.sourceRef !== ""
        ? await this.repository.getContactBySourceRef(scope, input.sourceType, input.sourceRef)
        : null;
    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      customer_id: input.customerId,
      name: input.name.trim(),
      role: input.role ?? null,
      business_email: input.suppressed ? null : (input.businessEmail ?? null),
      business_phone: input.suppressed ? null : (input.businessPhone ?? null),
      relationship_type: input.relationshipType ?? null,
      is_primary: input.primary ?? false,
      suppressed: input.suppressed ?? false,
      source_type: input.sourceType,
      source_ref: input.sourceRef ?? null,
      provenance: asJson({ ...(input.provenance ?? {}), domain: "customer" }),
      is_demo: input.isDemo ?? false,
      created_by: scope.userId,
    };
    const contact = existing
      ? await this.repository.updateContact(scope, existing.id, payload)
      : await this.repository.insertContact(payload);
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: existing ? "update" : "create",
      resourceType: "business_os_customer_contact",
      resourceId: contact.id,
      metadata: { customerId: input.customerId, suppressed: contact.suppressed, idempotent: Boolean(existing) },
    });
    await this.emit(scope, "business_os.customer.updated", { id: customer.id, contactId: contact.id });
    return { contact, created: !existing };
  }

  async ingestFact(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: BusinessCustomerFactIngestInput,
  ) {
    const scope = requireWorkspace(raw);
    if (!input.customerId) throw new Error("customer_id_required");
    if (!input.periodStart || !input.periodEnd) throw new Error("invalid_period");
    const currency = input.currency.trim().toUpperCase();
    if (currency.length !== 3) throw new Error("currency_required");
    const customer = await this.repository.getCustomerById(scope, input.customerId);
    if (!customer) throw new Error("Customer not found");
    const existing =
      input.sourceRef != null && input.sourceRef !== ""
        ? await this.repository.getFactBySourceRef(scope, input.sourceType, input.sourceRef)
        : null;
    const draftFact = {
      revenueMinor: minorCol(input.revenueMinor ?? null),
      directCostMinor: minorCol(input.directCostMinor ?? null),
    };
    const contribution = contributionFromFact({
      id: "preview",
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      customerId: input.customerId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      revenueMinor: draftFact.revenueMinor,
      directCostMinor: draftFact.directCostMinor,
      grossContributionMinor: null,
      receivableOutstandingMinor: null,
      receivableOverdueMinor: null,
      ageingCurrentMinor: null,
      ageing130Minor: null,
      ageing3160Minor: null,
      ageing6190Minor: null,
      ageing90PlusMinor: null,
      currency,
      scale: input.scale ?? 2,
      sourceType: input.sourceType,
      provenance: {},
      isDemo: false,
      createdAt: "",
      updatedAt: "",
    });
    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      customer_id: input.customerId,
      period_start: input.periodStart,
      period_end: input.periodEnd,
      revenue_minor: draftFact.revenueMinor,
      direct_cost_minor: draftFact.directCostMinor,
      gross_contribution_minor: contribution,
      receivable_outstanding_minor: minorCol(input.receivableOutstandingMinor ?? null),
      receivable_overdue_minor: minorCol(input.receivableOverdueMinor ?? null),
      ageing_current_minor: minorCol(input.ageingCurrentMinor ?? null),
      ageing_130_minor: minorCol(input.ageing130Minor ?? null),
      ageing_3160_minor: minorCol(input.ageing3160Minor ?? null),
      ageing_6190_minor: minorCol(input.ageing6190Minor ?? null),
      ageing_90plus_minor: minorCol(input.ageing90PlusMinor ?? null),
      due_date: input.dueDate ?? null,
      paid_date: input.paidDate ?? null,
      currency,
      scale: input.scale ?? 2,
      source_type: input.sourceType,
      source_ref: input.sourceRef ?? null,
      provenance: asJson({ ...(input.provenance ?? {}), domain: "customer", profitabilityKnown: contribution !== null }),
      is_demo: input.isDemo ?? false,
      created_by: scope.userId,
    };
    const fact = existing
      ? await this.repository.updateFact(scope, existing.id, payload)
      : await this.repository.insertFact(payload);
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: existing ? "update" : "create",
      resourceType: "business_os_customer_financial_fact",
      resourceId: fact.id,
      metadata: { customerId: input.customerId, contributionKnown: contribution !== null, idempotent: Boolean(existing) },
    });
    await this.emit(scope, "business_os.customer.financial_fact_ingested", { id: fact.id, customerId: customer.id });
    await this.publishToOwnerCommand(scope);
    return { fact, created: !existing };
  }

  async convertFromLead(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: { leadId?: string; sourceRef?: string; customerId?: string },
  ) {
    const scope = requireWorkspace(raw);
    const lead = input.leadId
      ? await this.growthIntelligence.repository.getLeadById(scope, input.leadId)
      : input.sourceRef
        ? await this.growthIntelligence.repository.findLeadBySourceRef(scope, input.sourceRef)
        : null;
    if (!lead) throw new Error("Lead not found");
    return this.convertEntity(scope, "lead", lead, {
      organisationName: lead.organisationName,
      domain: lead.domain,
      customerId: input.customerId,
      sourceType: lead.sourceType,
      sourceRef: lead.sourceRef,
      industry: lead.industry,
      geography: lead.geography,
      website: lead.website,
      owner: lead.owner,
      isDemo: lead.isDemo,
      contact:
        lead.suppressed || !lead.contactName
          ? null
          : {
              name: lead.contactName,
              role: lead.contactRole,
              businessEmail: lead.businessEmail,
              suppressed: lead.suppressed,
            },
    });
  }

  async convertFromOpportunity(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: {
      opportunityId?: string;
      sourceRef?: string;
      customerId?: string;
      organisationName?: string;
      domain?: string;
    },
  ) {
    const scope = requireWorkspace(raw);
    const opportunity = input.opportunityId
      ? await this.growthIntelligence.repository.getOpportunityById(scope, input.opportunityId)
      : input.sourceRef
        ? await this.growthIntelligence.repository.findOpportunityBySourceRef(scope, input.sourceRef)
        : null;
    if (!opportunity) throw new Error("Opportunity not found");
    const lead = opportunity.leadId
      ? await this.growthIntelligence.repository.getLeadById(scope, opportunity.leadId)
      : null;
    const organisationName = input.organisationName ?? lead?.organisationName ?? null;
    const domain = input.domain ?? lead?.domain ?? null;
    if (!input.customerId && !organisationName && !domain) {
      throw new Error("conversion_ambiguous");
    }
    return this.convertEntity(scope, "opportunity", opportunity, {
      organisationName,
      domain,
      customerId: input.customerId,
      sourceType: opportunity.sourceType,
      sourceRef: opportunity.sourceRef,
      industry: lead?.industry,
      geography: lead?.geography,
      website: lead?.website,
      owner: opportunity.owner ?? lead?.owner,
      isDemo: opportunity.isDemo,
      contact: null,
    });
  }

  async linkEntity(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: {
      customerId: string;
      entityType: BusinessCustomerLinkEntityType;
      entityId: string;
      sourceType?: string;
      sourceRef?: string;
    },
  ) {
    const scope = requireWorkspace(raw);
    if (!input.customerId) throw new Error("customer_id_required");
    const customer = await this.repository.getCustomerById(scope, input.customerId);
    if (!customer) throw new Error("Customer not found");
    const existing = await this.repository.getLinkForEntity(scope, input.entityType, input.entityId);
    if (existing) {
      if (existing.customerId !== customer.id) throw new Error("conversion_ambiguous");
      return { customer, link: existing, created: false };
    }
    const link = await this.repository.insertLink({
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      customer_id: customer.id,
      entity_type: input.entityType,
      entity_id: input.entityId,
      source_type: input.sourceType ?? "derived",
      source_ref: input.sourceRef ?? null,
      provenance: asJson({ domain: "customer", conversion: "explicit_link" }),
      is_demo: customer.isDemo,
      created_by: scope.userId,
    });
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: "create",
      resourceType: "business_os_customer_link",
      resourceId: link.id,
      metadata: { customerId: customer.id, entityType: input.entityType, entityId: input.entityId },
    });
    return { customer, link, created: true };
  }

  async archiveCustomer(raw: { tenantId: string; workspaceId?: string; userId: string }, customerId: string) {
    const scope = requireWorkspace(raw);
    const customer = await this.repository.updateCustomer(scope, customerId, {
      customer_status: "archived",
      archived_at: new Date().toISOString(),
    });
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: "update",
      resourceType: "business_os_customer",
      resourceId: customer.id,
      metadata: { archived: true },
    });
    await this.emit(scope, "business_os.customer.updated", { id: customer.id, archived: true });
    await this.publishToOwnerCommand(scope);
    return customer;
  }

  async seedDemo(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    await this.growthIntelligence.seedDemo(scope);
    const customers = [];
    for (const item of CUSTOMER_DEMO_CUSTOMERS) {
      customers.push(await this.ingestCustomer(scope, item));
    }
    const byRef = new Map(customers.map((row) => [row.customer.sourceRef, row.customer]));
    const archived = byRef.get("bos-5-demo-customer-archived");
    if (archived && !archived.archivedAt) {
      await this.archiveCustomer(scope, archived.id);
    }
    const contacts = [];
    for (const item of CUSTOMER_DEMO_CONTACTS) {
      const customer = byRef.get(item.customerSourceRef);
      if (!customer) continue;
      contacts.push(await this.ingestContact(scope, { ...item, customerId: customer.id }));
    }
    const facts = [];
    for (const item of CUSTOMER_DEMO_FACTS) {
      const customer = byRef.get(item.customerSourceRef);
      if (!customer) continue;
      facts.push(await this.ingestFact(scope, { ...item, customerId: customer.id }));
    }

    const conversions = [];
    conversions.push(
      await this.convertFromLead(scope, { sourceRef: "bos-3-demo-lead-northbound" }),
      await this.convertFromLead(scope, { sourceRef: "bos-3-demo-lead-harbour" }),
    );
    const northbound = byRef.get("bos-5-demo-customer-northbound");
    const harbour = byRef.get("bos-5-demo-customer-harbour");
    const metro = byRef.get("bos-5-demo-customer-metro");
    const oppLinks: Array<{ sourceRef: string; customerId?: string }> = [
      { sourceRef: "bos-3-demo-opp-northbound", customerId: northbound?.id },
      { sourceRef: "bos-3-demo-opp-harbour", customerId: harbour?.id },
      { sourceRef: "bos-3-demo-opp-metro", customerId: metro?.id },
    ];
    for (const item of oppLinks) {
      if (!item.customerId) continue;
      const opportunity = await this.growthIntelligence.repository.findOpportunityBySourceRef(scope, item.sourceRef);
      if (!opportunity) continue;
      conversions.push(
        await this.linkEntity(scope, {
          customerId: item.customerId,
          entityType: "opportunity",
          entityId: opportunity.id,
          sourceType: "demo",
          sourceRef: item.sourceRef,
        }),
      );
    }
    let wonWithoutCustomer: string | null = null;
    try {
      await this.convertFromOpportunity(scope, { sourceRef: "bos-3-demo-opp-won" });
    } catch (error) {
      wonWithoutCustomer = error instanceof Error ? error.message : "conversion_failed";
    }

    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: "create",
      resourceType: "business_os_customer_demo",
      resourceId: CUSTOMER_DEMO_FIXTURE,
      metadata: { fixture: CUSTOMER_DEMO_FIXTURE, wonWithoutCustomer },
    });
    await this.publishToOwnerCommand(scope);
    return { customers, contacts, facts, conversions, wonWithoutCustomer, isDemo: true as const };
  }

  async summary(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const bundle = await this.bundle(scope);
    const kpis = (await this.ownerCommand.repository.listKpis(scope)).filter((k) => k.provenance?.domain === "customer");
    return {
      ...bundle,
      health: computeBusinessHealth(kpis),
      containsDemoData: bundle.customers.some((c) => c.isDemo),
      disclaimer:
        "Customer Intelligence aggregates internal commercial, financial, and relationship evidence. It is not a CRM, credit bureau, or outreach tool.",
      renewal: renewalIntelligenceStatus(),
      expansion: accountExpansionStatus(),
    };
  }

  async list(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const bundle = await this.bundle(scope);
    return {
      customers: bundle.listRows,
      concentration: bundle.concentration,
      containsDemoData: bundle.customers.some((c) => c.isDemo),
    };
  }

  async detail360(raw: { tenantId: string; workspaceId?: string; userId: string }, customerId: string) {
    const scope = requireWorkspace(raw);
    if (!customerId) throw new Error("customer_id_required");
    const bundle = await this.bundle(scope);
    const customer = bundle.customers.find((row) => row.id === customerId);
    if (!customer) throw new Error("Customer not found");
    const contacts = bundle.contacts.filter((row) => row.customerId === customerId);
    const facts = bundle.facts.filter((row) => row.customerId === customerId);
    const linkedIds = {
      lead: new Set(bundle.links.filter((l) => l.customerId === customerId && l.entityType === "lead").map((l) => l.entityId)),
      opportunity: new Set(
        bundle.links.filter((l) => l.customerId === customerId && l.entityType === "opportunity").map((l) => l.entityId),
      ),
    };
    const leads = bundle.leads.filter((row) => linkedIds.lead.has(row.id));
    const opportunities = bundle.opportunities.filter((row) => linkedIds.opportunity.has(row.id));
    const opportunityIds = new Set(opportunities.map((row) => row.id));
    const engagements = bundle.engagements.filter((row) => opportunityIds.has(row.opportunityId));
    const proposals = bundle.proposals.filter((row) => opportunityIds.has(row.opportunityId));
    const pricing = bundle.pricing.filter((row) => opportunityIds.has(row.opportunityId));
    const payment = bundle.paymentById.get(customer.id) ?? computePaymentBehaviour(facts);
    const health = bundle.healthById.get(customer.id) ?? computeCustomerHealth({
      customer,
      facts,
      payment,
      opportunities,
      engagements,
      concentrationShareBps: bundle.concentration.shares.find((s) => s.customerId === customer.id)?.shareBps ?? null,
    });
    const sourceTypes = [...new Set([customer.sourceType, ...facts.map((f) => f.sourceType), ...contacts.map((c) => c.sourceType)])];
    const detail: BusinessCustomer360 = {
      customer,
      contacts,
      leads,
      opportunities,
      engagements,
      proposals,
      pricing,
      financialFacts: facts,
      payment,
      health,
      operations: { available: false, reason: "operations_domain_not_implemented" },
      renewal: renewalIntelligenceStatus(),
      expansion: accountExpansionStatus(),
      dataQuality: {
        sourceTypes,
        freshness: customer.updatedAt,
        missingFinancialAttribution: [
          ...(facts.length ? [] : ["financial_facts"]),
          ...(facts.some((f) => f.revenueMinor && !f.directCostMinor) ? ["direct_cost"] : []),
          ...(facts.some((f) => !f.grossContributionMinor) ? ["gross_contribution"] : []),
        ],
        unknownHealthComponents: health.missingComponents,
        personalContactCount: contacts.filter((c) => !c.suppressed && (c.businessEmail || c.businessPhone)).length,
      },
    };
    return detail;
  }

  async contacts(raw: { tenantId: string; workspaceId?: string; userId: string }, customerId?: string) {
    const scope = requireWorkspace(raw);
    return { contacts: await this.repository.listContacts(scope, customerId) };
  }

  async concentration(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const bundle = await this.bundle(scope);
    return bundle.concentration;
  }

  async healthFor(raw: { tenantId: string; workspaceId?: string; userId: string }, customerId: string) {
    const detail = await this.detail360(raw, customerId);
    return detail.health;
  }

  async explain(raw: { tenantId: string; workspaceId?: string; userId: string }): Promise<AiDailyBriefNarrative> {
    const scope = requireWorkspace(raw);
    const summary = await this.summary(scope);
    try {
      const policy = await this.kernel.intelligence.policies.evaluate({
        tenantId: scope.tenantId,
        operatingSystem: "business",
        intent: "customer_intelligence.explain",
        simulation: false,
      });
      if (policy.allowed === false) {
        return emptyNarrative("policy_denied");
      }
      const response = await this.kernel.aiDirector.run({
        tenantId: scope.tenantId,
        workspaceId: scope.workspaceId,
        userId: scope.userId,
        message:
          "Summarise structured customer intelligence for an owner. Do not invent activity, contribution, or churn probability. Do not contact customers.",
        context: {
          evidence: {
            kind: "business_os.customer.evidence",
            activeCustomers: summary.metrics.activeCustomers,
            atRisk: summary.metrics.customersAtRisk,
            concentration: summary.concentration.topCustomerShareBps,
            containsDemoData: summary.containsDemoData,
            instructions: [
              "Use only structured evidence.",
              "Do not invent customer activity or financial contribution.",
              "Do not generate predicted_churn_probability.",
              "Do not infer sensitive personal attributes.",
              "Do not recommend contacting customers from BOS.",
            ],
          },
        },
      });
      const text = response.message?.trim() ?? "";
      if (!text) return emptyNarrative("empty_ai_response");
      return {
        text,
        generatedAt: new Date().toISOString(),
        generatedBy: "platform_ai_director",
        modelProvenance:
          [response.run.model_provider, response.run.model_name].filter(Boolean).join("/") || "platform-ai-director",
        evidenceRefs: [],
        advisory: true,
      };
    } catch {
      return emptyNarrative("ai_director_unavailable");
    }
  }

  private async convertEntity(
    scope: OwnerCommandScope,
    entityType: BusinessCustomerLinkEntityType,
    entity: { id: string; isDemo: boolean },
    input: {
      organisationName?: string | null;
      domain?: string | null;
      customerId?: string;
      sourceType: string;
      sourceRef?: string | null;
      industry?: string | null;
      geography?: string | null;
      website?: string | null;
      owner?: string | null;
      isDemo: boolean;
      contact: {
        name: string;
        role?: string | null;
        businessEmail?: string | null;
        suppressed: boolean;
      } | null;
    },
  ) {
    const existingLink = await this.repository.getLinkForEntity(scope, entityType, entity.id);
    if (existingLink) {
      const customer = await this.repository.getCustomerById(scope, existingLink.customerId);
      if (!customer) throw new Error("Customer not found");
      return { customer, link: existingLink, created: false, converted: false };
    }

    let customer: BusinessCustomer | null = input.customerId
      ? await this.repository.getCustomerById(scope, input.customerId)
      : null;
    if (input.customerId && !customer) throw new Error("Customer not found");
    let created = false;
    if (!customer) {
      const customers = await this.repository.listCustomers(scope);
      const match = resolveCustomerMatch(customers, {
        organisationName: input.organisationName,
        domain: input.domain,
      });
      customer = assertNotAmbiguous(match);
      if (!customer) {
        if (!input.organisationName?.trim()) throw new Error("conversion_ambiguous");
        const ingested = await this.ingestCustomer(scope, {
          organisationName: input.organisationName,
          domain: input.domain,
          website: input.website,
          industry: input.industry,
          geography: input.geography,
          relationshipOwner: input.owner,
          customerStatus: "prospect_converted",
          sourceType: input.sourceType,
          sourceRef: input.sourceRef ? `converted:${entityType}:${input.sourceRef}` : undefined,
          isDemo: input.isDemo,
          provenance: { convertedFrom: entityType, entityId: entity.id },
        });
        customer = ingested.customer;
        created = ingested.created;
      }
    }

    const link = await this.repository.insertLink({
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      customer_id: customer.id,
      entity_type: entityType,
      entity_id: entity.id,
      source_type: input.sourceType,
      source_ref: input.sourceRef ?? null,
      provenance: asJson({
        domain: "customer",
        conversion: "non_destructive",
        originalEntityType: entityType,
        originalEntityId: entity.id,
      }),
      is_demo: input.isDemo,
      created_by: scope.userId,
    });

    if (input.contact && !input.contact.suppressed) {
      const existingContacts = await this.repository.listContacts(scope, customer.id);
      const duplicate = existingContacts.some(
        (row) =>
          row.name.trim().toLowerCase() === input.contact!.name.trim().toLowerCase() ||
          (input.contact!.businessEmail &&
            row.businessEmail?.toLowerCase() === input.contact!.businessEmail.toLowerCase()),
      );
      if (!duplicate) {
        await this.ingestContact(scope, {
          customerId: customer.id,
          name: input.contact.name,
          role: input.contact.role,
          businessEmail: input.contact.businessEmail,
          relationshipType: "commercial",
          primary: existingContacts.length === 0,
          sourceType: input.sourceType,
          sourceRef: input.sourceRef ? `converted-contact:${entityType}:${input.sourceRef}` : undefined,
          isDemo: input.isDemo,
          provenance: { convertedFrom: entityType, entityId: entity.id },
        });
      }
    }

    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: "create",
      resourceType: "business_os_customer_link",
      resourceId: link.id,
      metadata: { entityType, entityId: entity.id, customerId: customer.id, createdCustomer: created },
    });
    await this.emit(scope, "business_os.customer.converted", {
      customerId: customer.id,
      entityType,
      entityId: entity.id,
    });
    await this.publishToOwnerCommand(scope);
    return { customer, link, created, converted: true };
  }

  private async bundle(scope: OwnerCommandScope) {
    const [customers, contacts, facts, links, leads, opportunities, engagements, proposals, pricing] = await Promise.all([
      this.repository.listCustomers(scope),
      this.repository.listContacts(scope),
      this.repository.listFacts(scope),
      this.repository.listLinks(scope),
      this.growthIntelligence.repository.listLeads(scope),
      this.growthIntelligence.repository.listOpportunities(scope),
      this.revenueExecution.repository.listEngagements(scope),
      this.revenueExecution.repository.listProposals(scope),
      this.revenueExecution.repository.listPricing(scope),
    ]);
    const concentration = computeConcentration(customers, facts);
    const paymentById = new Map<string, BusinessCustomerPaymentBehaviour>();
    const healthById = new Map<string, BusinessCustomerHealth>();
    const opportunitiesById = new Map<string, BusinessGrowthOpportunity[]>();
    const leadsById = new Map<string, BusinessGrowthLead[]>();

    for (const link of links) {
      if (link.entityType === "opportunity") {
        const opp = opportunities.find((row) => row.id === link.entityId);
        if (!opp) continue;
        const list = opportunitiesById.get(link.customerId) ?? [];
        list.push(opp);
        opportunitiesById.set(link.customerId, list);
      }
      if (link.entityType === "lead") {
        const lead = leads.find((row) => row.id === link.entityId);
        if (!lead) continue;
        const list = leadsById.get(link.customerId) ?? [];
        list.push(lead);
        leadsById.set(link.customerId, list);
      }
    }

    for (const customer of customers) {
      const customerFacts = facts.filter((row) => row.customerId === customer.id);
      const payment = computePaymentBehaviour(customerFacts);
      paymentById.set(customer.id, payment);
      const customerOpps = opportunitiesById.get(customer.id) ?? [];
      const oppIds = new Set(customerOpps.map((row) => row.id));
      const customerEngagements = engagements.filter((row) => oppIds.has(row.opportunityId));
      healthById.set(
        customer.id,
        computeCustomerHealth({
          customer,
          facts: customerFacts,
          payment,
          opportunities: customerOpps,
          engagements: customerEngagements,
          concentrationShareBps: concentration.shares.find((s) => s.customerId === customer.id)?.shareBps ?? null,
        }),
      );
    }

    const live = customers.filter((c) => !c.archivedAt && c.customerStatus !== "archived");
    const now = new Date().toISOString().slice(0, 10);
    const newCutoff = Date.parse(now) - BUSINESS_CUSTOMER_DEFAULT_THRESHOLDS.newCustomerDays * 86_400_000;
    const activeCustomers = live.filter((c) => c.customerStatus === "active" || c.customerStatus === "at_risk").length;
    const newCustomers = live.filter((c) => Date.parse((c.acquiredAt ?? c.createdAt).slice(0, 10)) >= newCutoff).length;
    const customersAtRisk = live.filter((c) => {
      const health = healthById.get(c.id);
      return c.customerStatus === "at_risk" || health?.status === "at_risk" || health?.status === "critical";
    }).length;
    const knownHealth = live.filter((c) => healthById.get(c.id)?.score !== null).length;
    const coverage =
      live.length === 0 ? null : Math.round((knownHealth / live.length) * 10_000);
    const overdueTotal = concentration.currency
      ? live.reduce((sum, customer) => {
          const overdue = parseMinor(paymentById.get(customer.id)?.overdue?.minor ?? null);
          return overdue === null ? sum : sum + overdue;
        }, 0n)
      : null;

    const listRows = customers.map((customer) => {
      const factsFor = facts.filter((row) => row.customerId === customer.id);
      const latest = [...factsFor].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd))[0];
      const payment = paymentById.get(customer.id);
      const opps = opportunitiesById.get(customer.id) ?? [];
      return {
        customer,
        status: customer.customerStatus,
        relationshipOwner: customer.relationshipOwner,
        revenueMinor: latest?.revenueMinor ?? null,
        currency: latest?.currency ?? null,
        health: healthById.get(customer.id) ?? null,
        outstanding: payment?.outstanding ?? null,
        overdue: payment?.overdue ?? null,
        openOpportunities: opps.filter((o) => o.stage !== "won" && o.stage !== "lost").length,
        freshness: customer.updatedAt,
      };
    });

    return {
      customers,
      contacts,
      facts,
      links,
      leads,
      opportunities,
      engagements,
      proposals,
      pricing,
      concentration,
      paymentById,
      healthById,
      opportunitiesById,
      leadsById,
      listRows,
      metrics: {
        activeCustomers,
        newCustomers,
        customersAtRisk,
        customerRevenueMinor: concentration.totalRevenue?.minor ?? null,
        overdueCustomerReceivablesMinor: overdueTotal === null ? null : overdueTotal.toString(),
        customerHealthCoverageBps: coverage,
        currency: concentration.currency,
      },
    };
  }

  private async publishToOwnerCommand(scope: OwnerCommandScope) {
    const bundle = await this.bundle(scope);
    const t = BUSINESS_CUSTOMER_DEFAULT_THRESHOLDS;
    const isDemo = bundle.customers.some((c) => c.isDemo);
    const values: Record<string, number | null> = {
      active_customers: bundle.metrics.activeCustomers,
      new_customers: bundle.metrics.newCustomers,
      customer_revenue: integerMetric(bundle.metrics.customerRevenueMinor),
      top_customer_concentration: integerMetric(bundle.concentration.topCustomerShareBps),
      top5_customer_concentration: integerMetric(bundle.concentration.top5ShareBps),
      customers_at_risk: bundle.metrics.customersAtRisk,
      overdue_customer_receivables: integerMetric(bundle.metrics.overdueCustomerReceivablesMinor),
      customer_health_coverage: bundle.metrics.customerHealthCoverageBps,
    };
    const extras: Record<string, { warning?: number; critical?: number }> = {
      top_customer_concentration: { warning: t.topCustomerConcentrationWarningBps, critical: 6000 },
      top5_customer_concentration: { warning: t.top5CustomerConcentrationWarningBps, critical: 9000 },
      customers_at_risk: { warning: 1, critical: 3 },
    };

    for (const [key, meta] of Object.entries(CUSTOMER_KPI_META)) {
      await this.ownerCommand.upsertKpi(scope, {
        key,
        name: meta.name,
        category: meta.category,
        unit: meta.unit,
        direction: meta.direction,
        value: values[key] ?? null,
        warningThreshold: extras[key]?.warning ?? null,
        criticalThreshold: extras[key]?.critical ?? null,
        measuredAt: new Date().toISOString(),
        sourceType: isDemo ? "demo" : "derived",
        sourceRef: "customer_intelligence",
        provenance: {
          domain: "customer",
          currency: bundle.metrics.currency,
          scale: 2,
          live: false,
        },
        isDemo,
      });
    }

    const detected = detectCustomerSignals({
      customers: bundle.customers,
      healthById: bundle.healthById,
      paymentById: bundle.paymentById,
      opportunitiesById: bundle.opportunitiesById,
      concentration: bundle.concentration,
    });
    const existing = await this.ownerCommand.repository.listSignals(scope);
    const recs = await this.ownerCommand.repository.listRecommendations(scope);

    for (const draft of detected.signals) {
      const already = existing.some((s) => s.type === draft.type && s.status === "open");
      if (already) continue;
      const created = await this.ownerCommand.repository.insertSignal(scope, {
        type: draft.type,
        severity: draft.severity,
        title: draft.title,
        summary: draft.summary,
        sourceType: isDemo ? "demo" : "derived",
        sourceRef: "customer_intelligence",
        evidence: draft.evidence,
        provenance: draft.provenance,
        detectedAt: new Date().toISOString(),
        status: "open",
        businessImpact: draft.businessImpact,
        isDemo,
        createdBy: scope.userId,
      });
      await this.emit(scope, "business_os.signal.created", { id: created.id, type: created.type });
      await this.emit(scope, "business_os.customer.signal_detected", { id: created.id, ruleId: draft.ruleId });
      if (draft.type === "customer.health_deteriorated" || draft.type === "customer.overdue_receivables") {
        await this.emit(scope, "business_os.customer.risk_detected", { id: created.id, type: draft.type });
      }
    }

    for (const health of bundle.healthById.values()) {
      if (health.status === "at_risk" || health.status === "critical") {
        await this.emit(scope, "business_os.customer.health_updated", { status: health.status, version: health.version });
        break;
      }
    }

    for (const draft of detected.recommendations) {
      const already = recs.some((r) => r.title === draft.title && r.status === "proposed");
      if (already) continue;
      const signal = (await this.ownerCommand.repository.listSignals(scope)).find(
        (s) => s.type === draft.type && s.status === "open",
      );
      const created = await this.ownerCommand.repository.insertRecommendation(scope, {
        signalId: signal?.id ?? null,
        title: draft.title,
        recommendationText: draft.recommendationText,
        rationaleSummary: draft.rationaleSummary,
        expectedImpact: draft.expectedImpact,
        confidence: draft.confidence,
        evidenceRefs: signal?.evidence ?? [],
        status: "proposed",
        generatedBy: "deterministic_rule",
        isDemo,
        createdBy: scope.userId,
      });
      await this.emit(scope, "business_os.recommendation.created", { id: created.id });
    }
  }
}

function emptyNarrative(reason: string): AiDailyBriefNarrative {
  return {
    text: "",
    generatedAt: new Date().toISOString(),
    generatedBy: "platform_ai_director",
    evidenceRefs: [],
    advisory: true,
    unavailableReason: reason,
  };
}

export type { BusinessCustomerStatus };
