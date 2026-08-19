import type { SupabaseClient } from "@rtb/database";
import type {
  BusinessContextCanonicalLink,
  BusinessContextCanonicalRecord,
  BusinessContextNodeType,
  BusinessContextRelationshipType,
  BusinessContextSourceDomain,
} from "@rtb/types";
import { BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION } from "@rtb/types";
import { buildIdentity } from "./identity";
import { NODE_TYPE_DOMAIN } from "./ontology";
import type { OwnerCommandScope } from "../owner-command/service";

async function loadTable(
  supabase: SupabaseClient,
  table: string,
  scope: OwnerCommandScope,
): Promise<{ missing: boolean; rows: Record<string, unknown>[] }> {
  try {
    const { data, error } = await supabase
      .from(table as never)
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId);
    if (error) return { missing: true, rows: [] };
    return { missing: false, rows: (data ?? []) as Record<string, unknown>[] };
  } catch {
    return { missing: true, rows: [] };
  }
}

function str(value: unknown): string {
  return String(value ?? "");
}

function opt(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function evidence(
  sourceDomain: BusinessContextSourceDomain,
  sourceEntityRef: string,
  sourceEvent?: string,
): BusinessContextCanonicalLink["evidence"] {
  return {
    sourceDomain,
    sourceEntityRef,
    sourceEvent: sourceEvent ?? null,
    provenance: { projection: true, ontologyVersion: BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION },
    projectedAt: new Date().toISOString(),
    relationshipVersion: BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION,
    confidence: null,
    status: "active",
  };
}

function recordOf(
  scope: OwnerCommandScope,
  entityType: BusinessContextNodeType,
  row: Record<string, unknown>,
  displayName: string,
  extra?: Partial<BusinessContextCanonicalRecord["identity"]>,
): BusinessContextCanonicalRecord {
  const id = str(row.id);
  return {
    identity: buildIdentity({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      domain: NODE_TYPE_DOMAIN[entityType],
      entityType,
      entityId: id,
      displayName,
      sourceType: str(row.source_type || extra?.sourceType || "canonical"),
      sourceRef: opt(row.source_ref),
      classification: extra?.classification ?? opt(row.status),
      effectiveAt: str(row.updated_at || row.created_at || new Date().toISOString()),
      suppressed: Boolean(row.suppressed),
      deleted: String(row.status) === "archived" || String(row.status) === "deleted",
    }),
    links: [],
  };
}

function addLink(
  record: BusinessContextCanonicalRecord,
  relationshipType: BusinessContextRelationshipType,
  toEntityType: BusinessContextNodeType,
  toEntityId: string | null,
  sourceDomain: BusinessContextSourceDomain,
  sourceEvent?: string,
) {
  if (!toEntityId) return;
  record.links.push({
    relationshipType,
    toEntityType,
    toEntityId,
    evidence: evidence(sourceDomain, `${record.identity.entityType}:${record.identity.entityId}`, sourceEvent),
  });
}

export async function loadCanonicalRecords(
  supabase: SupabaseClient,
  scope: OwnerCommandScope,
): Promise<{ records: BusinessContextCanonicalRecord[]; missingDomains: string[] }> {
  const missingDomains: string[] = [];
  const tables = {
    customers: await loadTable(supabase, "business_os_customers", scope),
    contacts: await loadTable(supabase, "business_os_customer_contacts", scope),
    leads: await loadTable(supabase, "business_os_leads", scope),
    opportunities: await loadTable(supabase, "business_os_opportunities", scope),
    proposals: await loadTable(supabase, "business_os_proposals", scope),
    work: await loadTable(supabase, "business_os_work_items", scope),
    profit: await loadTable(supabase, "business_os_profit_facts", scope),
    financial: await loadTable(supabase, "business_os_customer_financial_facts", scope),
    segments: await loadTable(supabase, "business_os_market_segments", scope),
    risks: await loadTable(supabase, "business_os_risks", scope),
    controls: await loadTable(supabase, "business_os_risk_controls", scope),
    controlLinks: await loadTable(supabase, "business_os_risk_control_links", scope),
    obligations: await loadTable(supabase, "business_os_risk_obligations", scope),
    decisions: await loadTable(supabase, "business_os_decisions", scope),
    evidenceRows: await loadTable(supabase, "business_os_decision_evidence", scope),
    actions: await loadTable(supabase, "business_os_actions", scope),
    signals: await loadTable(supabase, "business_os_signals", scope),
    recommendations: await loadTable(supabase, "business_os_recommendations", scope),
    kpis: await loadTable(supabase, "business_os_kpis", scope),
  };

  const domainTables: Array<[string, { missing: boolean }]> = [
    ["customer", tables.customers],
    ["growth", tables.leads],
    ["revenue", tables.proposals],
    ["operations", tables.work],
    ["profit", tables.profit],
    ["risk", tables.risks],
    ["decision", tables.decisions],
  ];
  for (const [domain, table] of domainTables) {
    if (table.missing) missingDomains.push(domain);
  }

  const records: BusinessContextCanonicalRecord[] = [];
  const index = new Map<string, BusinessContextCanonicalRecord>();
  const push = (row: BusinessContextCanonicalRecord) => {
    records.push(row);
    index.set(`${row.identity.entityType}:${row.identity.entityId}`, row);
  };

  for (const row of tables.customers.rows) {
    push(recordOf(scope, "customer", row, str(row.organisation_name || row.name || "Customer")));
  }
  for (const row of tables.contacts.rows) {
    const rec = recordOf(scope, "contact", row, str(row.full_name || row.name || "Contact"));
    addLink(rec, "CUSTOMER_HAS_CONTACT", "customer", opt(row.customer_id), "customer", "business_os.customer.updated");
    // Invert: store on customer instead if present
    const customer = index.get(`customer:${str(row.customer_id)}`);
    if (customer) addLink(customer, "CUSTOMER_HAS_CONTACT", "contact", rec.identity.entityId, "customer");
    rec.links = [];
    push(rec);
  }
  for (const row of tables.leads.rows) {
    const rec = recordOf(scope, "lead", row, str(row.organisation_name || row.contact_name || "Lead"));
    addLink(rec, "LEAD_CONVERTED_TO_CUSTOMER", "customer", opt(row.converted_customer_id || row.customer_id), "growth", "business_os.growth.lead_converted");
    push(rec);
  }
  for (const row of tables.opportunities.rows) {
    const rec = recordOf(scope, "opportunity", row, str(row.name || "Opportunity"));
    addLink(rec, "OPPORTUNITY_CONVERTED_TO_CUSTOMER", "customer", opt(row.converted_customer_id), "growth", "business_os.growth.opportunity_won");
    const customer = index.get(`customer:${str(row.customer_id)}`);
    if (customer) addLink(customer, "CUSTOMER_HAS_OPPORTUNITY", "opportunity", rec.identity.entityId, "growth", "business_os.growth.opportunity_created");
    push(rec);
  }
  for (const row of tables.proposals.rows) {
    const rec = recordOf(scope, "proposal", row, str(row.title || row.proposal_number || "Proposal"));
    const opportunity = index.get(`opportunity:${str(row.opportunity_id)}`);
    if (opportunity) addLink(opportunity, "OPPORTUNITY_HAS_PROPOSAL", "proposal", rec.identity.entityId, "revenue", "business_os.revenue.proposal_created");
    push(rec);
  }
  for (const row of tables.work.rows) {
    const rec = recordOf(scope, "work", row, str(row.name || row.reference || "Work"));
    const customer = index.get(`customer:${str(row.customer_id)}`);
    if (customer) addLink(customer, "CUSTOMER_HAS_WORK", "work", rec.identity.entityId, "operations", "business_os.operations.work_created");
    const engRef = opt(row.linked_engineering_project_ref) ?? opt(row.linked_engineering_project_id);
    if (engRef) {
      const stub = recordOf(
        scope,
        "engineering_project_reference",
        { id: engRef, source_type: "engineering_os_ref", updated_at: rec.identity.effectiveAt },
        `Engineering project ${engRef}`,
      );
      push(stub);
      addLink(rec, "WORK_LINKED_TO_ENGINEERING_PROJECT_REFERENCE", "engineering_project_reference", stub.identity.entityId, "engineering_reference");
    }
    push(rec);
  }
  for (const row of tables.profit.rows) {
    const rec = recordOf(scope, "profit_fact", row, str(row.dimension_name || "Profit fact"));
    if (str(row.dimension_type) === "customer") {
      addLink(rec, "PROFIT_FACT_ATTRIBUTED_TO_CUSTOMER", "customer", opt(row.dimension_id), "profit", "business_os.profit.fact_ingested");
    }
    if (str(row.dimension_type) === "work") {
      addLink(rec, "PROFIT_FACT_ATTRIBUTED_TO_WORK", "work", opt(row.dimension_id), "profit", "business_os.profit.fact_ingested");
      const work = index.get(`work:${str(row.dimension_id)}`);
      if (work) addLink(work, "WORK_LINKED_TO_PROFIT_FACT", "profit_fact", rec.identity.entityId, "profit");
    }
    push(rec);
  }
  for (const row of tables.financial.rows) {
    const rec = recordOf(scope, "financial_fact", row, "Customer financial fact");
    const customer = index.get(`customer:${str(row.customer_id)}`);
    if (customer) addLink(customer, "CUSTOMER_LINKED_TO_FINANCIAL_FACT", "financial_fact", rec.identity.entityId, "customer", "business_os.customer.financial_fact_ingested");
    push(rec);
  }
  for (const row of tables.segments.rows) {
    push(recordOf(scope, "market_segment", row, str(row.name || "Segment")));
  }
  for (const row of tables.risks.rows) {
    const rec = recordOf(scope, "risk", row, str(row.title || row.reference || "Risk"));
    addLink(rec, "RISK_REQUIRES_DECISION", "decision", opt(row.linked_decision_id), "risk", "business_os.risk.created");
    const customerId = opt((row.provenance as Record<string, unknown> | undefined)?.customerId);
    const workId = opt((row.provenance as Record<string, unknown> | undefined)?.workId);
    if (customerId) addLink(rec, "RISK_AFFECTS_CUSTOMER", "customer", customerId, "risk");
    if (workId) addLink(rec, "RISK_AFFECTS_WORK", "work", workId, "risk");
    push(rec);
  }
  for (const row of tables.controls.rows) {
    push(recordOf(scope, "control", row, str(row.name || "Control")));
  }
  for (const row of tables.controlLinks.rows) {
    const risk = index.get(`risk:${str(row.risk_id)}`);
    if (risk) addLink(risk, "RISK_CONTROLLED_BY", "control", opt(row.control_id), "risk", "business_os.risk.control_updated");
  }
  for (const row of tables.obligations.rows) {
    const rec = recordOf(scope, "obligation", row, str(row.title || "Obligation"));
    const risk = index.get(`risk:${str(row.risk_id)}`);
    if (risk) addLink(risk, "RISK_HAS_OBLIGATION", "obligation", rec.identity.entityId, "risk");
    push(rec);
  }
  for (const row of tables.decisions.rows) {
    push(recordOf(scope, "decision", row, str(row.statement || row.question || "Decision")));
  }
  for (const row of tables.evidenceRows.rows) {
    const rec = recordOf(scope, "evidence", row, str(row.summary || row.title || "Evidence"));
    const decision = index.get(`decision:${str(row.decision_id)}`);
    if (decision) addLink(decision, "DECISION_HAS_EVIDENCE", "evidence", rec.identity.entityId, "decision", "business_os.decision.evidence_updated");
    push(rec);
  }
  for (const row of tables.actions.rows) {
    const rec = recordOf(scope, "action", row, str(row.title || "Action"));
    const decision = index.get(`decision:${str(row.decision_id)}`);
    if (decision) addLink(decision, "DECISION_CREATES_ACTION", "action", rec.identity.entityId, "decision", "business_os.action.created");
    push(rec);
  }
  for (const row of tables.signals.rows) {
    push(recordOf(scope, "signal", row, str(row.title || "Signal")));
  }
  for (const row of tables.recommendations.rows) {
    const rec = recordOf(scope, "recommendation", row, str(row.title || "Recommendation"));
    addLink(rec, "RECOMMENDATION_INFORMS_DECISION", "decision", opt(row.decision_id), "owner_command", "business_os.recommendation.created");
    const signal = index.get(`signal:${str(row.signal_id)}`);
    if (signal) addLink(signal, "SIGNAL_TRIGGERED_RECOMMENDATION", "recommendation", rec.identity.entityId, "owner_command");
    push(rec);
  }
  for (const row of tables.kpis.rows) {
    push(recordOf(scope, "kpi", row, str(row.name || row.key || "KPI")));
  }

  return { records, missingDomains };
}
