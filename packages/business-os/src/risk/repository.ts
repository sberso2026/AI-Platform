import type { Json, SupabaseClient } from "@rtb/database";
import type {
  BusinessRiskActionLink,
  BusinessRiskAssessment,
  BusinessRiskControl,
  BusinessRiskControlLink,
  BusinessRiskEvidenceLink,
  BusinessRiskIncident,
  BusinessRiskObligation,
  BusinessRiskRecord,
  BusinessRiskSettings,
  BusinessRiskTreatment,
} from "@rtb/types";
import {
  mapActionLink,
  mapAssessment,
  mapControl,
  mapControlLink,
  mapEvidence,
  mapIncident,
  mapObligation,
  mapRisk,
  mapSettings,
  mapTreatment,
} from "./mappers";

type Scope = { tenantId: string; workspaceId: string };

function table(supabase: SupabaseClient, name: string) {
  return supabase.from(name as never);
}

function requireRow<T>(data: T | null, error: { message: string } | null, label: string): T {
  if (error) throw new Error(`${label}: ${error.message}`);
  if (!data) throw new Error(`${label}: not found`);
  return data;
}

export function asJson(value: unknown): Json {
  return value as Json;
}

export class BusinessRiskRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listRisks(scope: Scope): Promise<BusinessRiskRecord[]> {
    const { data, error } = await table(this.supabase, "business_os_risks")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(`Failed to list risks: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapRisk);
  }

  async getRisk(scope: Scope, id: string): Promise<BusinessRiskRecord | null> {
    const { data, error } = await table(this.supabase, "business_os_risks")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`Failed to load risk: ${error.message}`);
    return data ? mapRisk(data as Record<string, unknown>) : null;
  }

  async getRiskBySource(scope: Scope, sourceType: string, sourceRef: string): Promise<BusinessRiskRecord | null> {
    const { data, error } = await table(this.supabase, "business_os_risks")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("source_type", sourceType)
      .eq("source_ref", sourceRef)
      .maybeSingle();
    if (error) throw new Error(`Failed to load risk by source: ${error.message}`);
    return data ? mapRisk(data as Record<string, unknown>) : null;
  }

  async insertRisk(row: Record<string, unknown>): Promise<BusinessRiskRecord> {
    const { data, error } = await table(this.supabase, "business_os_risks")
      .insert(row as never)
      .select("*")
      .single();
    return mapRisk(requireRow(data as Record<string, unknown> | null, error, "Risk insert"));
  }

  async updateRisk(scope: Scope, id: string, patch: Record<string, unknown>): Promise<BusinessRiskRecord> {
    const { data, error } = await table(this.supabase, "business_os_risks")
      .update(patch as never)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("id", id)
      .select("*")
      .single();
    return mapRisk(requireRow(data as Record<string, unknown> | null, error, "Risk update"));
  }

  async listAssessments(scope: Scope, riskId?: string): Promise<BusinessRiskAssessment[]> {
    let query = table(this.supabase, "business_os_risk_assessments")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("version", { ascending: false });
    if (riskId) query = query.eq("risk_id", riskId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list assessments: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapAssessment);
  }

  async insertAssessment(row: Record<string, unknown>): Promise<BusinessRiskAssessment> {
    const { data, error } = await table(this.supabase, "business_os_risk_assessments")
      .insert(row as never)
      .select("*")
      .single();
    return mapAssessment(requireRow(data as Record<string, unknown> | null, error, "Assessment insert"));
  }

  async listControls(scope: Scope): Promise<BusinessRiskControl[]> {
    const { data, error } = await table(this.supabase, "business_os_risk_controls")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(`Failed to list controls: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapControl);
  }

  async getControl(scope: Scope, id: string): Promise<BusinessRiskControl | null> {
    const { data, error } = await table(this.supabase, "business_os_risk_controls")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`Failed to load control: ${error.message}`);
    return data ? mapControl(data as Record<string, unknown>) : null;
  }

  async insertControl(row: Record<string, unknown>): Promise<BusinessRiskControl> {
    const { data, error } = await table(this.supabase, "business_os_risk_controls")
      .insert(row as never)
      .select("*")
      .single();
    return mapControl(requireRow(data as Record<string, unknown> | null, error, "Control insert"));
  }

  async updateControl(scope: Scope, id: string, patch: Record<string, unknown>): Promise<BusinessRiskControl> {
    const { data, error } = await table(this.supabase, "business_os_risk_controls")
      .update(patch as never)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("id", id)
      .select("*")
      .single();
    return mapControl(requireRow(data as Record<string, unknown> | null, error, "Control update"));
  }

  async listControlLinks(scope: Scope, riskId?: string): Promise<BusinessRiskControlLink[]> {
    let query = table(this.supabase, "business_os_risk_control_links")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId);
    if (riskId) query = query.eq("risk_id", riskId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list control links: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapControlLink);
  }

  async insertControlLink(row: Record<string, unknown>): Promise<BusinessRiskControlLink> {
    const { data, error } = await table(this.supabase, "business_os_risk_control_links")
      .insert(row as never)
      .select("*")
      .single();
    return mapControlLink(requireRow(data as Record<string, unknown> | null, error, "Control link insert"));
  }

  async listTreatments(scope: Scope, riskId?: string): Promise<BusinessRiskTreatment[]> {
    let query = table(this.supabase, "business_os_risk_treatments")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("updated_at", { ascending: false });
    if (riskId) query = query.eq("risk_id", riskId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list treatments: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapTreatment);
  }

  async insertTreatment(row: Record<string, unknown>): Promise<BusinessRiskTreatment> {
    const { data, error } = await table(this.supabase, "business_os_risk_treatments")
      .insert(row as never)
      .select("*")
      .single();
    return mapTreatment(requireRow(data as Record<string, unknown> | null, error, "Treatment insert"));
  }

  async updateTreatment(scope: Scope, id: string, patch: Record<string, unknown>): Promise<BusinessRiskTreatment> {
    const { data, error } = await table(this.supabase, "business_os_risk_treatments")
      .update(patch as never)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("id", id)
      .select("*")
      .single();
    return mapTreatment(requireRow(data as Record<string, unknown> | null, error, "Treatment update"));
  }

  async listActionLinks(scope: Scope, riskId?: string): Promise<BusinessRiskActionLink[]> {
    let query = table(this.supabase, "business_os_risk_action_links")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId);
    if (riskId) query = query.eq("risk_id", riskId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list action links: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapActionLink);
  }

  async insertActionLink(row: Record<string, unknown>): Promise<BusinessRiskActionLink> {
    const { data, error } = await table(this.supabase, "business_os_risk_action_links")
      .insert(row as never)
      .select("*")
      .single();
    return mapActionLink(requireRow(data as Record<string, unknown> | null, error, "Action link insert"));
  }

  async listObligations(scope: Scope, riskId?: string): Promise<BusinessRiskObligation[]> {
    let query = table(this.supabase, "business_os_risk_obligations")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("due_at", { ascending: true });
    if (riskId) query = query.eq("risk_id", riskId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list obligations: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapObligation);
  }

  async insertObligation(row: Record<string, unknown>): Promise<BusinessRiskObligation> {
    const { data, error } = await table(this.supabase, "business_os_risk_obligations")
      .insert(row as never)
      .select("*")
      .single();
    return mapObligation(requireRow(data as Record<string, unknown> | null, error, "Obligation insert"));
  }

  async updateObligation(scope: Scope, id: string, patch: Record<string, unknown>): Promise<BusinessRiskObligation> {
    const { data, error } = await table(this.supabase, "business_os_risk_obligations")
      .update(patch as never)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("id", id)
      .select("*")
      .single();
    return mapObligation(requireRow(data as Record<string, unknown> | null, error, "Obligation update"));
  }

  async listIncidents(scope: Scope, riskId?: string): Promise<BusinessRiskIncident[]> {
    let query = table(this.supabase, "business_os_risk_incidents")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("occurred_at", { ascending: false });
    if (riskId) query = query.eq("risk_id", riskId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list incidents: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapIncident);
  }

  async insertIncident(row: Record<string, unknown>): Promise<BusinessRiskIncident> {
    const { data, error } = await table(this.supabase, "business_os_risk_incidents")
      .insert(row as never)
      .select("*")
      .single();
    return mapIncident(requireRow(data as Record<string, unknown> | null, error, "Incident insert"));
  }

  async listEvidence(scope: Scope, riskId?: string): Promise<BusinessRiskEvidenceLink[]> {
    let query = table(this.supabase, "business_os_risk_evidence")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("captured_at", { ascending: false });
    if (riskId) query = query.eq("risk_id", riskId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list risk evidence: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapEvidence);
  }

  async insertEvidence(row: Record<string, unknown>): Promise<BusinessRiskEvidenceLink> {
    const { data, error } = await table(this.supabase, "business_os_risk_evidence")
      .insert(row as never)
      .select("*")
      .single();
    return mapEvidence(requireRow(data as Record<string, unknown> | null, error, "Evidence insert"));
  }

  async getSettings(scope: Scope): Promise<BusinessRiskSettings | null> {
    const { data, error } = await table(this.supabase, "business_os_risk_settings")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .maybeSingle();
    if (error) throw new Error(`Failed to load risk settings: ${error.message}`);
    return data ? mapSettings(data as Record<string, unknown>) : null;
  }

  async upsertSettings(row: Record<string, unknown>): Promise<BusinessRiskSettings> {
    const { data, error } = await table(this.supabase, "business_os_risk_settings")
      .upsert(row as never, { onConflict: "tenant_id,workspace_id" })
      .select("*")
      .single();
    return mapSettings(requireRow(data as Record<string, unknown> | null, error, "Settings upsert"));
  }
}
