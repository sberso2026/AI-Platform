import type {
  BusinessEvidenceRef,
  BusinessGrowthEnrichment,
  BusinessGrowthLead,
  BusinessGrowthLeadScore,
  BusinessGrowthMarketSegment,
  BusinessGrowthOpportunity,
  BusinessGrowthOpportunityScore,
  BusinessGrowthSourceType,
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

export function mapLead(row: Record<string, unknown>): BusinessGrowthLead {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    organisationName: str(row.organisation_name),
    website: opt(row.website),
    domain: opt(row.domain),
    industry: opt(row.industry),
    geography: opt(row.geography),
    companySizeBand: opt(row.company_size_band),
    services: opt(row.services),
    targetMarket: opt(row.target_market),
    contactName: opt(row.contact_name),
    contactRole: opt(row.contact_role),
    businessEmail: opt(row.business_email),
    evidenceOfNeed: row.evidence_of_need === null || row.evidence_of_need === undefined ? null : Boolean(row.evidence_of_need),
    relationshipKind: opt(row.relationship_kind),
    sourceType: row.source_type as BusinessGrowthSourceType,
    sourceRef: opt(row.source_ref),
    sourceTimestamp: opt(row.source_timestamp),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    enrichment: (row.enrichment as BusinessGrowthEnrichment) ?? {},
    enrichmentStatus: row.enrichment_status as BusinessGrowthLead["enrichmentStatus"],
    qualificationStatus: row.qualification_status as BusinessGrowthLead["qualificationStatus"],
    score: row.score === null || row.score === undefined ? null : Number(row.score),
    scoreVersion: str(row.score_version || "lead_score.v1"),
    scoreDetail: (row.score_detail as BusinessGrowthLeadScore) ?? {
      total: null,
      components: [],
      missingInputs: [],
      version: "lead_score.v1",
      method: "deterministic_lead_score_v1",
    },
    owner: opt(row.owner),
    suppressed: bool(row.suppressed),
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapOpportunity(row: Record<string, unknown>): BusinessGrowthOpportunity {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    leadId: opt(row.lead_id),
    name: str(row.name),
    description: opt(row.description),
    stage: row.stage as BusinessGrowthOpportunity["stage"],
    estimatedValueMinor: opt(row.estimated_value_minor),
    currency: str(row.currency).trim(),
    scale: Number(row.scale ?? 2),
    probabilityBps: opt(row.probability_bps),
    expectedCloseDate: opt(row.expected_close_date)?.slice(0, 10) ?? null,
    expectedMarginBps: opt(row.expected_margin_bps),
    sourceType: row.source_type as BusinessGrowthSourceType,
    sourceRef: opt(row.source_ref),
    owner: opt(row.owner),
    nextAction: opt(row.next_action),
    strategicFit: opt(row.strategic_fit),
    relationshipStrength: opt(row.relationship_strength),
    deliveryCapability: opt(row.delivery_capability),
    commercialRisk: opt(row.commercial_risk),
    score: row.score === null || row.score === undefined ? null : Number(row.score),
    scoreVersion: str(row.score_version || "opportunity_score.v1"),
    scoreDetail: (row.score_detail as BusinessGrowthOpportunityScore) ?? {
      total: null,
      components: [],
      missingInputs: [],
      version: "opportunity_score.v1",
      method: "deterministic_opportunity_score_v1",
      disclaimer: "",
    },
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    suppressed: bool(row.suppressed),
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapMarket(row: Record<string, unknown>): BusinessGrowthMarketSegment {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    segmentName: str(row.segment_name),
    industry: opt(row.industry),
    geography: opt(row.geography),
    targetCustomerProfile: opt(row.target_customer_profile),
    attractiveness: row.attractiveness as BusinessGrowthMarketSegment["attractiveness"],
    status: row.status as BusinessGrowthMarketSegment["status"],
    evidence: Array.isArray(row.evidence) ? (row.evidence as BusinessEvidenceRef[]) : [],
    sourceType: row.source_type as BusinessGrowthSourceType,
    sourceRef: opt(row.source_ref),
    sourceTimestamp: opt(row.source_timestamp),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    suppressed: bool(row.suppressed),
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}
