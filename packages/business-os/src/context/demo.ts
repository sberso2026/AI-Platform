import {
  BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION,
  type BusinessContextCanonicalLink,
  type BusinessContextCanonicalRecord,
  type BusinessContextNodeType,
  type BusinessContextRelationshipType,
  type BusinessContextSourceDomain,
} from "@rtb/types";
import { buildIdentity } from "./identity";
import { NODE_TYPE_DOMAIN } from "./ontology";
import type { OwnerCommandScope } from "../owner-command/service";

export const BOS_10_DEMO_CUSTOMER_ID = "bos10-customer-abc";
export const BOS_10_DEMO_WORK_ID = "bos10-work-active";
export const BOS_10_DEMO_DECISION_ID = "bos10-decision-1";
export const BOS_10_DEMO_RISK_ID = "bos10-risk-1";

function ev(
  sourceDomain: BusinessContextSourceDomain,
  sourceEntityRef: string,
  sourceEvent: string,
  projectedAt = "2026-08-19T12:00:00.000Z",
): BusinessContextCanonicalLink["evidence"] {
  return {
    sourceDomain,
    sourceEntityRef,
    sourceEvent,
    provenance: { fixture: "bos-10-business-context", live: false },
    projectedAt,
    relationshipVersion: BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION,
    confidence: null,
    status: "active",
  };
}

function node(
  scope: OwnerCommandScope,
  entityType: BusinessContextNodeType,
  entityId: string,
  displayName: string,
  extra?: { suppressed?: boolean; deleted?: boolean; classification?: string; effectiveAt?: string },
): BusinessContextCanonicalRecord {
  return {
    identity: buildIdentity({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      domain: NODE_TYPE_DOMAIN[entityType],
      entityType,
      entityId,
      displayName,
      sourceType: "demo",
      sourceRef: `bos-10-demo:${entityId}`,
      classification: extra?.classification ?? "demo",
      effectiveAt: extra?.effectiveAt ?? "2026-08-19T12:00:00.000Z",
      suppressed: extra?.suppressed,
      deleted: extra?.deleted,
    }),
    links: [],
  };
}

function link(
  from: BusinessContextCanonicalRecord,
  relationshipType: BusinessContextRelationshipType,
  to: BusinessContextCanonicalRecord,
  event: string,
): void {
  from.links.push({
    relationshipType,
    toEntityType: to.identity.entityType,
    toEntityId: to.identity.entityId,
    evidence: ev(from.identity.domain, `${from.identity.entityType}:${from.identity.entityId}`, event),
  });
}

export function demoContextRecords(scope: OwnerCommandScope): BusinessContextCanonicalRecord[] {
  const customer = node(scope, "customer", BOS_10_DEMO_CUSTOMER_ID, "Customer ABC");
  const contact = node(scope, "contact", "bos10-contact-ok", "Alex Owner");
  const suppressed = node(scope, "contact", "bos10-contact-suppressed", "Hidden Person", { suppressed: true });
  const deletedContact = node(scope, "contact", "bos10-contact-deleted", "Gone Person", { deleted: true });
  const lead = node(scope, "lead", "bos10-lead-1", "Inbound lead");
  const opportunity = node(scope, "opportunity", "bos10-opp-1", "Plant upgrade");
  const proposal = node(scope, "proposal", "bos10-proposal-1", "Proposal P-100");
  const work = node(scope, "work", BOS_10_DEMO_WORK_ID, "Active overhaul");
  const segment = node(scope, "market_segment", "bos10-segment-industrial", "Industrial");
  const financial = node(scope, "financial_fact", "bos10-fin-1", "AR fact");
  const profitCustomer = node(scope, "profit_fact", "bos10-profit-customer", "Customer contribution");
  const profitWork = node(scope, "profit_fact", "bos10-profit-work", "Work contribution");
  const cost = node(scope, "financial_fact", "bos10-cost-1", "Operational cost");
  const risk = node(scope, "risk", BOS_10_DEMO_RISK_ID, "Delivery delay risk");
  const control = node(scope, "control", "bos10-control-1", "Milestone review");
  const obligation = node(scope, "obligation", "bos10-obligation-1", "Review obligation");
  const decision = node(scope, "decision", BOS_10_DEMO_DECISION_ID, "Add contingency?");
  const option = node(scope, "evidence", "bos10-option-1", "Selected option: add float");
  const evidence = node(scope, "evidence", "bos10-evidence-1", "Schedule variance evidence");
  const action = node(scope, "action", "bos10-action-1", "Rebaseline programme");
  const signal = node(scope, "signal", "bos10-signal-1", "Low contribution");
  const recommendation = node(scope, "recommendation", "bos10-rec-1", "Review delivery risk");
  const kpi = node(scope, "kpi", "bos10-kpi-1", "Contribution coverage");
  const eng = node(scope, "engineering_project_reference", "bos10-eng-ref", "EOS project REF-9");
  const stale = node(scope, "document_reference", "bos10-stale-doc", "Stale source", {
    effectiveAt: "2020-01-01T00:00:00.000Z",
  });
  const unresolvedHost = node(scope, "customer", "bos10-customer-unresolved-host", "Ambiguous mapping host");

  link(customer, "CUSTOMER_HAS_CONTACT", contact, "business_os.customer.created");
  link(customer, "CUSTOMER_HAS_CONTACT", suppressed, "business_os.customer.updated");
  link(customer, "CUSTOMER_HAS_OPPORTUNITY", opportunity, "business_os.growth.opportunity_created");
  link(customer, "CUSTOMER_HAS_WORK", work, "business_os.operations.work_created");
  link(customer, "CUSTOMER_IN_SEGMENT", segment, "business_os.customer.created");
  link(customer, "CUSTOMER_LINKED_TO_FINANCIAL_FACT", financial, "business_os.customer.financial_fact_ingested");
  link(lead, "LEAD_CONVERTED_TO_CUSTOMER", customer, "business_os.growth.lead_converted");
  link(opportunity, "OPPORTUNITY_HAS_PROPOSAL", proposal, "business_os.revenue.proposal_created");
  link(opportunity, "OPPORTUNITY_CONVERTED_TO_CUSTOMER", customer, "business_os.growth.opportunity_won");
  link(work, "WORK_LINKED_TO_PROFIT_FACT", profitWork, "business_os.profit.fact_ingested");
  link(work, "WORK_LINKED_TO_OPERATIONAL_COST", cost, "business_os.operations.cost_fact_ingested");
  link(work, "WORK_LINKED_TO_ENGINEERING_PROJECT_REFERENCE", eng, "business_os.operations.work_created");
  link(profitCustomer, "PROFIT_FACT_ATTRIBUTED_TO_CUSTOMER", customer, "business_os.profit.fact_ingested");
  link(profitWork, "PROFIT_FACT_ATTRIBUTED_TO_WORK", work, "business_os.profit.fact_ingested");
  link(risk, "RISK_AFFECTS_CUSTOMER", customer, "business_os.risk.created");
  link(risk, "RISK_AFFECTS_WORK", work, "business_os.risk.created");
  link(risk, "RISK_CONTROLLED_BY", control, "business_os.risk.control_updated");
  link(risk, "RISK_REQUIRES_DECISION", decision, "business_os.risk.created");
  link(risk, "RISK_HAS_OBLIGATION", obligation, "business_os.risk.created");
  link(decision, "DECISION_HAS_OPTION", option, "business_os.decision.option_created");
  link(decision, "DECISION_HAS_EVIDENCE", evidence, "business_os.decision.evidence_updated");
  link(decision, "DECISION_CREATES_ACTION", action, "business_os.action.created");
  link(decision, "DECISION_AFFECTS_CUSTOMER", customer, "business_os.decision.selected");
  link(decision, "DECISION_AFFECTS_WORK", work, "business_os.decision.selected");
  link(decision, "DECISION_AFFECTS_RISK", risk, "business_os.decision.selected");
  link(signal, "SIGNAL_TRIGGERED_RECOMMENDATION", recommendation, "business_os.signal.created");
  link(signal, "SIGNAL_AFFECTS_CUSTOMER", customer, "business_os.customer.signal_detected");
  link(recommendation, "RECOMMENDATION_INFORMS_DECISION", decision, "business_os.recommendation.created");
  link(action, "ACTION_MITIGATES_RISK", risk, "business_os.action.created");
  link(action, "ACTION_LINKED_TO_WORK", work, "business_os.action.created");

  unresolvedHost.links.push({
    relationshipType: "CUSTOMER_HAS_WORK",
    toEntityType: "work",
    toEntityId: "missing-work-id",
    evidence: ev("customer", "customer:bos10-customer-unresolved-host", "business_os.customer.updated"),
  });

  return [
    customer,
    contact,
    suppressed,
    deletedContact,
    lead,
    opportunity,
    proposal,
    work,
    segment,
    financial,
    profitCustomer,
    profitWork,
    cost,
    risk,
    control,
    obligation,
    decision,
    option,
    evidence,
    action,
    signal,
    recommendation,
    kpi,
    eng,
    stale,
    unresolvedHost,
  ];
}
