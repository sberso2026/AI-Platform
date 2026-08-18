import type { Json, SupabaseClient } from "@rtb/database";
import type {
  BusinessGrowthLead,
  BusinessGrowthLeadIngestInput,
  BusinessGrowthMarketIngestInput,
  BusinessGrowthMarketSegment,
  BusinessGrowthOpportunity,
  BusinessGrowthOpportunityIngestInput,
  BusinessGrowthTargetProfile,
} from "@rtb/types";
import {
  BUSINESS_GROWTH_OPPORTUNITY_STAGES,
  BUSINESS_GROWTH_QUALIFICATION_STATUSES,
  BUSINESS_GROWTH_SOURCE_TYPES,
} from "@rtb/types";
import { parseMinor } from "../finance/money";
import { mapLead, mapMarket, mapOpportunity } from "./mappers";
import { enrichmentStatus, scoreLead, type LeadScoreInput } from "./lead-score";
import { scoreOpportunity } from "./opportunity-score";

type Scope = { tenantId: string; workspaceId: string };

function table(supabase: SupabaseClient, name: string) {
  return supabase.from(name as never);
}

function requireRow<T>(data: T | null, error: { message: string } | null, label: string): T {
  if (error) throw new Error(`${label}: ${error.message}`);
  if (!data) throw new Error(`${label}: not found`);
  return data;
}

function minorCol(value: unknown): string | null {
  const parsed = parseMinor(value ?? null);
  return parsed === null ? null : parsed.toString();
}

function parseSignedBps(value: unknown, label: string): number | null {
  const parsed = parseMinor(value ?? null);
  if (parsed === null) return null;
  if (parsed < -10_000n || parsed > 10_000n) throw new Error(`invalid_${label}`);
  return Number(parsed);
}

function parseBps(value: unknown, label: string): number | null {
  const parsed = parseMinor(value ?? null);
  if (parsed === null) return null;
  if (parsed < 0n || parsed > 10_000n) throw new Error(`invalid_${label}`);
  return Number(parsed);
}

export class GrowthRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listLeads(scope: Scope): Promise<BusinessGrowthLead[]> {
    const { data, error } = await table(this.supabase, "business_os_growth_leads")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .is("deleted_at", null)
      .eq("suppressed", false)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(`Failed to list leads: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapLead);
  }

  async listOpportunities(scope: Scope): Promise<BusinessGrowthOpportunity[]> {
    const { data, error } = await table(this.supabase, "business_os_growth_opportunities")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .is("deleted_at", null)
      .eq("suppressed", false)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(`Failed to list opportunities: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapOpportunity);
  }

  async listMarket(scope: Scope): Promise<BusinessGrowthMarketSegment[]> {
    const { data, error } = await table(this.supabase, "business_os_growth_market_segments")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .is("deleted_at", null)
      .eq("suppressed", false)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(`Failed to list market segments: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapMarket);
  }

  async loadSettings(scope: Scope): Promise<Record<string, unknown> | null> {
    const { data, error } = await table(this.supabase, "business_os_growth_settings")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .maybeSingle();
    if (error) throw new Error(`Failed to load growth settings: ${error.message}`);
    return (data as Record<string, unknown> | null) ?? null;
  }

  async upsertSettings(
    scope: Scope,
    input: {
      targetProfile: BusinessGrowthTargetProfile;
      revenueTargetMinor?: string | number | null;
      revenueTargetCurrency?: string | null;
      createdBy?: string;
      isDemo?: boolean;
    },
  ) {
    const existing = await this.loadSettings(scope);
    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      target_profile: input.targetProfile as unknown as Json,
      revenue_target_minor: minorCol(input.revenueTargetMinor ?? null),
      revenue_target_currency: input.revenueTargetCurrency ?? null,
      is_demo: input.isDemo ?? false,
      created_by: input.createdBy ?? null,
    };
    const query = existing
      ? table(this.supabase, "business_os_growth_settings")
          .update(payload as never)
          .eq("id", String(existing.id))
          .select("*")
          .single()
      : table(this.supabase, "business_os_growth_settings").insert(payload as never).select("*").single();
    const { data, error } = await query;
    return requireRow(data as Record<string, unknown> | null, error, "Growth settings upsert");
  }

  targetProfileFromSettings(row: Record<string, unknown> | null): BusinessGrowthTargetProfile {
    const profile = (row?.target_profile as BusinessGrowthTargetProfile | undefined) ?? {
      industries: [],
      geographies: [],
      companySizeBands: [],
      services: [],
      targetMarkets: [],
    };
    return {
      industries: profile.industries ?? [],
      geographies: profile.geographies ?? [],
      companySizeBands: profile.companySizeBands ?? [],
      services: profile.services ?? [],
      targetMarkets: profile.targetMarkets ?? [],
    };
  }

  async ingestLead(
    scope: Scope,
    input: BusinessGrowthLeadIngestInput,
    createdBy?: string,
  ): Promise<{ lead: BusinessGrowthLead; created: boolean }> {
    if (!BUSINESS_GROWTH_SOURCE_TYPES.includes(input.sourceType)) throw new Error("invalid_source_type");
    if (!input.organisationName?.trim()) throw new Error("organisation_name_required");
    if (input.qualificationStatus && !BUSINESS_GROWTH_QUALIFICATION_STATUSES.includes(input.qualificationStatus)) {
      throw new Error("invalid_qualification");
    }
    const settings = await this.loadSettings(scope);
    const profile = this.targetProfileFromSettings(settings);
    const scoreInput: LeadScoreInput = {
      organisationName: input.organisationName,
      industry: input.industry,
      geography: input.geography,
      companySizeBand: input.companySizeBand,
      services: input.services,
      targetMarket: input.targetMarket,
      website: input.website,
      domain: input.domain,
      evidenceOfNeed: input.evidenceOfNeed,
      relationshipKind: input.relationshipKind,
      sourceType: input.sourceType,
    };
    const scoreDetail = scoreLead(scoreInput, profile);
    const now = new Date().toISOString();
    const provenance = {
      ...(input.provenance ?? {}),
      domain: "growth",
      live: input.isDemo ? false : input.provenance?.live === true,
      ingestedAt: now,
      personalContactPresent: Boolean(input.contactName || input.businessEmail),
    } as Json;

    const leads = await this.listLeads(scope);
    const existing =
      input.sourceRef != null && input.sourceRef !== ""
        ? leads.find((l) => l.sourceType === input.sourceType && l.sourceRef === input.sourceRef)
        : undefined;

    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      organisation_name: input.organisationName.trim(),
      website: input.website ?? null,
      domain: input.domain ?? null,
      industry: input.industry ?? null,
      geography: input.geography ?? null,
      company_size_band: input.companySizeBand ?? null,
      services: input.services ?? null,
      target_market: input.targetMarket ?? null,
      contact_name: input.contactName ?? null,
      contact_role: input.contactRole ?? null,
      business_email: input.businessEmail ?? null,
      evidence_of_need: input.evidenceOfNeed ?? null,
      relationship_kind: input.relationshipKind ?? null,
      source_type: input.sourceType,
      source_ref: input.sourceRef ?? null,
      source_timestamp: input.sourceTimestamp ?? null,
      provenance,
      enrichment: (input.enrichment ?? {}) as Json,
      enrichment_status: enrichmentStatus(input),
      qualification_status: input.qualificationStatus ?? existing?.qualificationStatus ?? "unqualified",
      score: scoreDetail.total,
      score_version: scoreDetail.version,
      score_detail: scoreDetail as unknown as Json,
      owner: input.owner ?? null,
      suppressed: input.suppressed ?? false,
      is_demo: input.isDemo ?? false,
      created_by: createdBy ?? null,
    };

    if (existing) {
      const { data, error } = await table(this.supabase, "business_os_growth_leads")
        .update(payload as never)
        .eq("id", existing.id)
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId)
        .select("*")
        .single();
      return { lead: mapLead(requireRow(data as Record<string, unknown> | null, error, "Lead update")), created: false };
    }
    const { data, error } = await table(this.supabase, "business_os_growth_leads")
      .insert(payload as never)
      .select("*")
      .single();
    return { lead: mapLead(requireRow(data as Record<string, unknown> | null, error, "Lead insert")), created: true };
  }

  async qualifyLead(
    scope: Scope,
    leadId: string,
    status: BusinessGrowthLead["qualificationStatus"],
    createdBy?: string,
  ): Promise<BusinessGrowthLead> {
    if (!BUSINESS_GROWTH_QUALIFICATION_STATUSES.includes(status)) throw new Error("invalid_qualification");
    const { data, error } = await table(this.supabase, "business_os_growth_leads")
      .update({ qualification_status: status, created_by: createdBy ?? null } as never)
      .eq("id", leadId)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .select("*")
      .single();
    return mapLead(requireRow(data as Record<string, unknown> | null, error, "Lead qualification"));
  }

  async ingestOpportunity(
    scope: Scope,
    input: BusinessGrowthOpportunityIngestInput,
    createdBy?: string,
  ): Promise<{ opportunity: BusinessGrowthOpportunity; created: boolean }> {
    if (!BUSINESS_GROWTH_SOURCE_TYPES.includes(input.sourceType)) throw new Error("invalid_source_type");
    if (!input.name?.trim()) throw new Error("opportunity_name_required");
    const stage = input.stage ?? "identified";
    if (!BUSINESS_GROWTH_OPPORTUNITY_STAGES.includes(stage)) throw new Error("invalid_stage");
    const currency = input.currency.trim().toUpperCase();
    if (currency.length !== 3) throw new Error("currency_required");
    const scale = input.scale ?? 2;
    if (scale < 0 || scale > 6) throw new Error("invalid_scale");
    const probability = parseBps(input.probabilityBps ?? null, "probability_bps");
    const margin = parseSignedBps(input.expectedMarginBps ?? null, "expected_margin_bps");
    const scoreDetail = scoreOpportunity({
      estimatedValueMinor: input.estimatedValueMinor,
      expectedMarginBps: input.expectedMarginBps,
      expectedCloseDate: input.expectedCloseDate,
      strategicFit: input.strategicFit,
      relationshipStrength: input.relationshipStrength,
      deliveryCapability: input.deliveryCapability,
      commercialRisk: input.commercialRisk,
      nextAction: input.nextAction,
      description: input.description,
    });
    const now = new Date().toISOString();
    const provenance = {
      ...(input.provenance ?? {}),
      domain: "growth",
      live: input.isDemo ? false : input.provenance?.live === true,
      ingestedAt: now,
      probabilityKind: probability === null ? "unknown" : "user_supplied",
      scoreIsNotWinProbability: true,
    } as Json;

    const opps = await this.listOpportunities(scope);
    const existing =
      input.sourceRef != null && input.sourceRef !== ""
        ? opps.find((o) => o.sourceType === input.sourceType && o.sourceRef === input.sourceRef)
        : undefined;

    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      lead_id: input.leadId ?? null,
      name: input.name.trim(),
      description: input.description ?? null,
      stage,
      estimated_value_minor: minorCol(input.estimatedValueMinor ?? null),
      currency,
      scale,
      probability_bps: probability,
      expected_close_date: input.expectedCloseDate ?? null,
      expected_margin_bps: margin,
      source_type: input.sourceType,
      source_ref: input.sourceRef ?? null,
      owner: input.owner ?? null,
      next_action: input.nextAction ?? null,
      strategic_fit: input.strategicFit ?? null,
      relationship_strength: input.relationshipStrength ?? null,
      delivery_capability: input.deliveryCapability ?? null,
      commercial_risk: input.commercialRisk ?? null,
      score: scoreDetail.total,
      score_version: scoreDetail.version,
      score_detail: scoreDetail as unknown as Json,
      provenance,
      suppressed: input.suppressed ?? false,
      is_demo: input.isDemo ?? false,
      created_by: createdBy ?? null,
    };

    if (existing) {
      const { data, error } = await table(this.supabase, "business_os_growth_opportunities")
        .update(payload as never)
        .eq("id", existing.id)
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId)
        .select("*")
        .single();
      return {
        opportunity: mapOpportunity(requireRow(data as Record<string, unknown> | null, error, "Opportunity update")),
        created: false,
      };
    }
    const { data, error } = await table(this.supabase, "business_os_growth_opportunities")
      .insert(payload as never)
      .select("*")
      .single();
    return {
      opportunity: mapOpportunity(requireRow(data as Record<string, unknown> | null, error, "Opportunity insert")),
      created: true,
    };
  }

  async ingestMarket(
    scope: Scope,
    input: BusinessGrowthMarketIngestInput,
    createdBy?: string,
  ): Promise<{ segment: BusinessGrowthMarketSegment; created: boolean }> {
    if (!BUSINESS_GROWTH_SOURCE_TYPES.includes(input.sourceType)) throw new Error("invalid_source_type");
    if (!input.segmentName?.trim()) throw new Error("segment_name_required");
    const now = new Date().toISOString();
    const provenance = {
      ...(input.provenance ?? {}),
      domain: "growth",
      live: input.isDemo ? false : input.provenance?.live === true,
      ingestedAt: now,
    } as Json;
    const existingList = await this.listMarket(scope);
    const existing =
      input.sourceRef != null && input.sourceRef !== ""
        ? existingList.find((s) => s.sourceType === input.sourceType && s.sourceRef === input.sourceRef)
        : undefined;
    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      segment_name: input.segmentName.trim(),
      industry: input.industry ?? null,
      geography: input.geography ?? null,
      target_customer_profile: input.targetCustomerProfile ?? null,
      attractiveness: input.attractiveness ?? "unknown",
      status: input.status ?? "active",
      evidence: (input.evidence ?? []) as unknown as Json,
      source_type: input.sourceType,
      source_ref: input.sourceRef ?? null,
      source_timestamp: input.sourceTimestamp ?? null,
      provenance,
      is_demo: input.isDemo ?? false,
      created_by: createdBy ?? null,
    };
    if (existing) {
      const { data, error } = await table(this.supabase, "business_os_growth_market_segments")
        .update(payload as never)
        .eq("id", existing.id)
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId)
        .select("*")
        .single();
      return {
        segment: mapMarket(requireRow(data as Record<string, unknown> | null, error, "Market update")),
        created: false,
      };
    }
    const { data, error } = await table(this.supabase, "business_os_growth_market_segments")
      .insert(payload as never)
      .select("*")
      .single();
    return {
      segment: mapMarket(requireRow(data as Record<string, unknown> | null, error, "Market insert")),
      created: true,
    };
  }
}
