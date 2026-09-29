import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { EngineeringObjectFramework } from "../services/object-framework";
import { getCatalogEntry, isExternalToolCategory, isIntegrationMode, type ExternalToolCategory, type ExternalToolIntegrationMode } from "./catalog";
import { assertModeRequirements } from "./readiness";
import { withDerivedState } from "./readiness";
import { assertNoSecretMaterial } from "./secrets";
import { buildNotReadySpaceGassProfile } from "./spacegass-profile";
import type { ExternalToolLastValidation, ExternalToolProfile, ExternalToolProfileInput } from "./types";
import { validateProfile } from "./validation";

function asModes(value: unknown): ExternalToolIntegrationMode[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is ExternalToolIntegrationMode => typeof item === "string" && isIntegrationMode(item));
}

export function mapProfileRow(row: Record<string, unknown>): ExternalToolProfile {
  const lastValidation = (row.last_validation as ExternalToolLastValidation | null) ?? {
    ranAt: null,
    overall: "NOT_RUN",
    checks: [],
  };
  return withDerivedState({
    id: String(row.id),
    tenantId: String(row.tenant_id),
    toolCode: String(row.tool_code),
    name: String(row.name),
    vendor: String(row.vendor),
    category: isExternalToolCategory(String(row.category)) ? (row.category as ExternalToolCategory) : "OTHER",
    enabled: Boolean(row.enabled),
    status: row.status === "disabled" || row.status === "draft" ? row.status : "active",
    environment: row.environment === "production" || row.environment === "staging" ? row.environment : "unknown",
    integrationModes: asModes(row.integration_modes),
    adapterId: (row.adapter_id as string | null) ?? null,
    adapterVersion: (row.adapter_version as string | null) ?? null,
    providerKey: (row.provider_key as string | null) ?? null,
    platformToolKey: (row.platform_tool_key as string | null) ?? null,
    compatibleToolVersions: Array.isArray(row.compatible_tool_versions) ? (row.compatible_tool_versions as string[]) : [],
    notCertifiedToolVersions: Array.isArray(row.not_certified_tool_versions)
      ? (row.not_certified_tool_versions as string[])
      : [],
    minSupportedVersion: (row.min_supported_version as string | null) ?? null,
    executionHostId: (row.execution_host_id as string | null) ?? null,
    installedVersion: (row.installed_version as string | null) ?? null,
    executablePath: (row.executable_path as string | null) ?? null,
    installationStatus:
      row.installation_status === "INSTALLED" || row.installation_status === "INVALID" || row.installation_status === "NOT_INSTALLED"
        ? row.installation_status
        : "UNKNOWN",
    licenceStatus:
      row.licence_status === "AVAILABLE" ||
      row.licence_status === "UNAVAILABLE" ||
      row.licence_status === "EXPIRED" ||
      row.licence_status === "NOT_REQUIRED"
        ? row.licence_status
        : "UNKNOWN",
    automationPermission:
      row.automation_permission === "PERMITTED" ||
      row.automation_permission === "NOT_PERMITTED" ||
      row.automation_permission === "REQUIRES_CONFIRMATION"
        ? row.automation_permission
        : "UNKNOWN",
    automationConfirmedBy: (row.automation_confirmed_by as string | null) ?? null,
    automationConfirmedAt: (row.automation_confirmed_at as string | null) ?? null,
    automationBasis: (row.automation_basis as string | null) ?? null,
    automationReference: (row.automation_reference as string | null) ?? null,
    credentialSecretId: (row.credential_secret_id as string | null) ?? null,
    endpoint: (row.endpoint as string | null) ?? null,
    connectorId: (row.connector_id as string | null) ?? null,
    authScopes: Array.isArray(row.auth_scopes) ? (row.auth_scopes as string[]) : [],
    capabilities: Array.isArray(row.capabilities) ? (row.capabilities as ExternalToolProfile["capabilities"]) : [],
    lastValidation,
    ownerId: (row.owner_id as string | null) ?? null,
    createdBy: (row.created_by as string | null) ?? null,
    updatedBy: (row.updated_by as string | null) ?? null,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  });
}

function toRow(tenantId: string, input: ExternalToolProfileInput, actorId?: string | null): Record<string, unknown> {
  assertNoSecretMaterial(input);
  const catalog = getCatalogEntry(input.toolCode);
  const modes = input.integrationModes;
  const draft = withDerivedState({
    id: "draft",
    tenantId,
    toolCode: input.toolCode,
    name: input.name,
    vendor: input.vendor,
    category: input.category,
    enabled: input.enabled ?? true,
    status: input.status ?? "active",
    environment: input.environment ?? "unknown",
    integrationModes: modes,
    adapterId: input.adapterId ?? catalog?.adapterId ?? null,
    adapterVersion: input.adapterVersion ?? catalog?.adapterVersion ?? null,
    providerKey: input.providerKey ?? catalog?.providerKey ?? null,
    platformToolKey: input.platformToolKey ?? catalog?.platformToolKey ?? null,
    compatibleToolVersions: input.compatibleToolVersions ?? catalog?.compatibleToolVersions ?? [],
    notCertifiedToolVersions: input.notCertifiedToolVersions ?? catalog?.notCertifiedToolVersions ?? [],
    minSupportedVersion: input.minSupportedVersion ?? catalog?.minSupportedVersion ?? null,
    executionHostId: input.executionHostId ?? null,
    installedVersion: input.installedVersion ?? null,
    executablePath: input.executablePath ?? null,
    installationStatus: input.installationStatus ?? "UNKNOWN",
    licenceStatus: input.licenceStatus ?? "UNKNOWN",
    automationPermission: input.automationPermission ?? "UNKNOWN",
    automationConfirmedBy: input.automationConfirmedBy ?? null,
    automationConfirmedAt: input.automationConfirmedAt ?? null,
    automationBasis: input.automationBasis ?? null,
    automationReference: input.automationReference ?? null,
    credentialSecretId: input.credentialSecretId ?? null,
    endpoint: input.endpoint ?? null,
    connectorId: input.connectorId ?? null,
    authScopes: input.authScopes ?? [],
    capabilities: input.capabilities ?? catalog?.capabilities ?? [],
    lastValidation: input.lastValidation ?? { ranAt: null, overall: "NOT_RUN", checks: [] },
    ownerId: input.ownerId ?? null,
    createdBy: actorId ?? null,
    updatedBy: actorId ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  assertModeRequirements(draft);
  return {
    tenant_id: tenantId,
    tool_code: draft.toolCode,
    name: draft.name,
    vendor: draft.vendor,
    category: draft.category,
    enabled: draft.enabled,
    status: draft.status,
    environment: draft.environment,
    integration_modes: draft.integrationModes,
    adapter_id: draft.adapterId,
    adapter_version: draft.adapterVersion,
    provider_key: draft.providerKey,
    platform_tool_key: draft.platformToolKey,
    compatible_tool_versions: draft.compatibleToolVersions,
    not_certified_tool_versions: draft.notCertifiedToolVersions,
    min_supported_version: draft.minSupportedVersion,
    execution_host_id: draft.executionHostId,
    installed_version: draft.installedVersion,
    executable_path: draft.executablePath,
    installation_status: draft.installationStatus,
    licence_status: draft.licenceStatus,
    automation_permission: draft.automationPermission,
    automation_confirmed_by: draft.automationConfirmedBy,
    automation_confirmed_at: draft.automationConfirmedAt,
    automation_basis: draft.automationBasis,
    automation_reference: draft.automationReference,
    credential_secret_id: draft.credentialSecretId,
    endpoint: draft.endpoint,
    connector_id: draft.connectorId,
    auth_scopes: draft.authScopes,
    capabilities: draft.capabilities,
    last_validation: draft.lastValidation,
    owner_id: draft.ownerId,
    created_by: actorId ?? null,
    updated_by: actorId ?? null,
  };
}

export class ExternalToolProfileService {
  private framework: EngineeringObjectFramework;

  constructor(private readonly supabase: SupabaseClient) {
    this.framework = new EngineeringObjectFramework(supabase);
  }

  async list(commerce: CommerceExecutionContext, tenantId: string): Promise<ExternalToolProfile[]> {
    assertEngineeringService(commerce, "external_tools.list", tenantId);
    const { data, error } = await this.supabase
      .from("engineering_external_tool_profiles")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("name", { ascending: true });
    if (error) throw new Error(`Failed to list external tool profiles: ${error.message}`);
    const persisted = (data ?? []).map((row) => mapProfileRow(row as Record<string, unknown>));
    return this.mergeCatalog(tenantId, persisted);
  }

  mergeCatalog(tenantId: string, persisted: ExternalToolProfile[]): ExternalToolProfile[] {
    const codes = new Set(persisted.map((row) => row.toolCode));
    const overlay: ExternalToolProfile[] = [];
    if (!codes.has("spacegass")) {
      overlay.push(buildNotReadySpaceGassProfile({ tenantId, id: "catalog:spacegass" }));
    }
    return [...overlay, ...persisted];
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, profileId: string): Promise<ExternalToolProfile> {
    assertEngineeringService(commerce, "external_tools.get", tenantId);
    if (profileId === "catalog:spacegass") {
      return buildNotReadySpaceGassProfile({ tenantId, id: profileId });
    }
    const { data, error } = await this.supabase
      .from("engineering_external_tool_profiles")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", profileId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("External tool profile not found.");
    return mapProfileRow(data as Record<string, unknown>);
  }

  async getByToolCode(tenantId: string, toolCode: string): Promise<ExternalToolProfile | null> {
    const { data, error } = await this.supabase
      .from("engineering_external_tool_profiles")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("tool_code", toolCode)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapProfileRow(data as Record<string, unknown>) : null;
  }

  async ensureSpaceGassNotReady(
    commerce: CommerceExecutionContext,
    tenantId: string,
    actorId?: string | null,
  ): Promise<ExternalToolProfile> {
    assertEngineeringService(commerce, "external_tools.write", tenantId);
    const existing = await this.getByToolCode(tenantId, "spacegass");
    if (existing) return existing;
    const seed = buildNotReadySpaceGassProfile({ tenantId, createdBy: actorId });
    return this.create(commerce, tenantId, seed, actorId);
  }

  async create(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: ExternalToolProfileInput,
    actorId?: string | null,
  ): Promise<ExternalToolProfile> {
    assertEngineeringService(commerce, "external_tools.write", tenantId);
    const row = toRow(tenantId, input, actorId);
    const { data, error } = await this.supabase.from("engineering_external_tool_profiles").insert(row).select().single();
    if (error || !data) throw new Error(`Failed to create external tool profile: ${error?.message}`);
    const profile = mapProfileRow(data as Record<string, unknown>);
    await this.audit(tenantId, profile.id, "external_tool.profile.created", `External tool ${profile.toolCode} created`, actorId);
    return profile;
  }

  async update(
    commerce: CommerceExecutionContext,
    tenantId: string,
    profileId: string,
    patch: Partial<ExternalToolProfileInput>,
    actorId?: string | null,
  ): Promise<ExternalToolProfile> {
    assertEngineeringService(commerce, "external_tools.write", tenantId);
    assertNoSecretMaterial(patch);
    const current = await this.get(commerce, tenantId, profileId);
    const merged: ExternalToolProfileInput = {
      ...current,
      ...patch,
      toolCode: patch.toolCode ?? current.toolCode,
      name: patch.name ?? current.name,
      vendor: patch.vendor ?? current.vendor,
      category: patch.category ?? current.category,
      integrationModes: patch.integrationModes ?? current.integrationModes,
    };
    const row = toRow(tenantId, merged, actorId);
    delete row.created_by;
    const { data, error } = await this.supabase
      .from("engineering_external_tool_profiles")
      .update(row)
      .eq("id", profileId)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to update external tool profile: ${error?.message}`);
    const profile = mapProfileRow(data as Record<string, unknown>);
    await this.auditChanges(tenantId, current, profile, actorId);
    return profile;
  }

  async runValidation(
    commerce: CommerceExecutionContext,
    tenantId: string,
    profileId: string,
    actorId?: string | null,
  ): Promise<ExternalToolProfile> {
    const current = await this.get(commerce, tenantId, profileId);
    const lastValidation = validateProfile(current);
    return this.update(commerce, tenantId, profileId, { lastValidation }, actorId);
  }

  private async auditChanges(
    tenantId: string,
    before: ExternalToolProfile,
    after: ExternalToolProfile,
    actorId?: string | null,
  ) {
    const events: Array<[string, string]> = [];
    if (before.enabled !== after.enabled) {
      events.push(["external_tool.enabled_changed", `enabled ${before.enabled} → ${after.enabled}`]);
    }
    if (before.executablePath !== after.executablePath) {
      events.push(["external_tool.executable_changed", "executable path updated"]);
    }
    if (before.installedVersion !== after.installedVersion) {
      events.push(["external_tool.version_detected", `version ${after.installedVersion ?? "UNKNOWN"}`]);
    }
    if (before.licenceStatus !== after.licenceStatus) {
      events.push(["external_tool.licence_changed", `licence ${before.licenceStatus} → ${after.licenceStatus}`]);
    }
    if (before.automationPermission !== after.automationPermission) {
      events.push([
        "external_tool.automation_changed",
        `automation ${before.automationPermission} → ${after.automationPermission}`,
      ]);
    }
    if (before.adapterCompatibilityStatus !== after.adapterCompatibilityStatus) {
      events.push([
        "external_tool.adapter_compatibility_changed",
        `${before.adapterCompatibilityStatus} → ${after.adapterCompatibilityStatus}`,
      ]);
    }
    if (before.readiness !== after.readiness) {
      events.push(["external_tool.readiness_changed", `${before.readiness} → ${after.readiness}`]);
    }
    if (JSON.stringify(before.capabilities) !== JSON.stringify(after.capabilities)) {
      events.push(["external_tool.capability_changed", "capability certification updated"]);
    }
    if (JSON.stringify(before.lastValidation) !== JSON.stringify(after.lastValidation)) {
      events.push(["external_tool.validation_run", `validation ${after.lastValidation.overall}`]);
    }
    for (const [type, title] of events) {
      await this.audit(tenantId, after.id, type, title, actorId);
    }
  }

  private async audit(tenantId: string, objectId: string, activityType: string, title: string, actorId?: string | null) {
    try {
      await this.framework.recordActivity({
        tenantId,
        activityType,
        objectType: "external_tool_profile",
        objectId,
        title,
        actorId: actorId ?? undefined,
        metadata: {},
      });
    } catch {
      // best-effort
    }
  }
}
