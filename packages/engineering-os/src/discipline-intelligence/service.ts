import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { CANONICAL_DISCIPLINE_CODES, isCanonicalDisciplineCode, type CanonicalDisciplineCode } from "./catalog";
import { resolveDisciplineContext, type DisciplineContextInput } from "./context-resolver";
import { buildDefaultDisciplineCatalog, buildDefaultDisciplineProfile } from "./profile-defaults";
import { applyEffectiveCapabilities, deriveDisciplineReadiness, rejectDisciplineToolInstallFields } from "./readiness";
import type { DisciplineParticipation, DisciplineProfile, InterfaceInformationRequirement, ProjectDisciplineAssignment } from "./types";

export class DisciplineIntelligenceService {
  constructor(private readonly supabase: SupabaseClient) {}

  list(commerce: CommerceExecutionContext, tenantId: string): DisciplineProfile[] {
    assertEngineeringService(commerce, "discipline_intelligence.list", tenantId);
    return buildDefaultDisciplineCatalog(tenantId);
  }

  get(commerce: CommerceExecutionContext, tenantId: string, code: string): DisciplineProfile {
    assertEngineeringService(commerce, "discipline_intelligence.get", tenantId);
    if (!isCanonicalDisciplineCode(code)) throw new Error("unknown_discipline_code");
    return buildDefaultDisciplineProfile({ tenantId, code });
  }

  resolveContext(commerce: CommerceExecutionContext, tenantId: string, input: DisciplineContextInput): CanonicalDisciplineCode[] {
    assertEngineeringService(commerce, "discipline_intelligence.list", tenantId);
    return resolveDisciplineContext(input);
  }

  async persistProfile(
    commerce: CommerceExecutionContext,
    tenantId: string,
    profile: DisciplineProfile,
    userId: string | null,
  ): Promise<DisciplineProfile> {
    assertEngineeringService(commerce, "discipline_intelligence.write", tenantId);
    rejectDisciplineToolInstallFields(profile as unknown as Record<string, unknown>);
    const db = this.supabase as unknown as {
      from(name: string): {
        upsert(values: Record<string, unknown>, options?: { onConflict: string }): PromiseLike<{ error: { message: string } | null }>;
        insert(values: Record<string, unknown>): PromiseLike<{ error: { message: string } | null }>;
      };
    };
    const { error } = await db.from("engineering_discipline_profiles").upsert(
      {
        tenant_id: tenantId,
        discipline_code: profile.code,
        discipline_key: profile.disciplineKey,
        enabled: profile.enabled,
        status: profile.status,
        owner_id: profile.ownerId,
        capabilities: profile.capabilities,
        standards: profile.standards,
        updated_by: userId,
      },
      { onConflict: "tenant_id,discipline_code" },
    );
    if (error) throw new Error(error.message);
    return profile;
  }

  async bindTool(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      disciplineCode: CanonicalDisciplineCode;
      capabilityKey: string;
      toolCode: string;
      externalToolProfileId: string | null;
      workspaceId: string | null;
      payload?: Record<string, unknown>;
    },
  ): Promise<void> {
    assertEngineeringService(commerce, "discipline_intelligence.write", tenantId);
    rejectDisciplineToolInstallFields(input.payload ?? {});
    const db = this.supabase as unknown as {
      from(name: string): {
        insert(values: Record<string, unknown>): PromiseLike<{ error: { message: string } | null }>;
      };
    };
    const { error } = await db.from("engineering_discipline_tool_bindings").insert({
      tenant_id: tenantId,
      workspace_id: input.workspaceId,
      discipline_code: input.disciplineCode,
      capability_key: input.capabilityKey,
      tool_code: input.toolCode,
      external_tool_profile_id: input.externalToolProfileId,
      certification_status: "NOT_CERTIFIED",
      priority: 1,
    });
    if (error) throw new Error(error.message);
  }
}

export function mergeCatalogWithRows(tenantId: string, rows: Array<Record<string, unknown>>): DisciplineProfile[] {
  const defaults = buildDefaultDisciplineCatalog(tenantId);
  return defaults.map((profile) => {
    const row = rows.find((item) => item.discipline_code === profile.code);
    if (!row) return profile;
    const capabilities = Array.isArray(row.capabilities)
      ? applyEffectiveCapabilities(
          (row.capabilities as DisciplineProfile["capabilities"]).map((cap) => ({
            key: cap.key,
            declaredStatus: cap.declaredStatus ?? cap.effectiveStatus,
            toolIndependent: cap.toolIndependent,
            preferredToolCode: cap.preferredToolCode,
            notes: cap.notes,
          })),
          profile.code === "STRUCTURAL" ? [{ toolCode: "spacegass", profileId: null, readiness: "NOT_CONFIGURED" }] : [],
        )
      : profile.capabilities;
    return {
      ...profile,
      id: String(row.id ?? profile.id),
      enabled: row.enabled !== false,
      status: row.status === "disabled" ? "disabled" : "active",
      ownerId: (row.owner_id as string | null) ?? profile.ownerId,
      capabilities,
      standards: Array.isArray(row.standards) ? (row.standards as DisciplineProfile["standards"]) : profile.standards,
      readiness: deriveDisciplineReadiness(capabilities),
    };
  });
}

export function validateInformationRequirement(row: Pick<InterfaceInformationRequirement, "informationKey" | "sourceDiscipline" | "receivingDiscipline">): void {
  if (!row.informationKey.trim()) throw new Error("information_key_required");
  if (row.sourceDiscipline === row.receivingDiscipline) throw new Error("source_and_receiving_must_differ");
}

export function crusherMechanicalToStructuralRequirements(): Array<Omit<InterfaceInformationRequirement, "id" | "interfaceId">> {
  const keys = [
    "operating_mass",
    "dynamic_loads",
    "centre_of_gravity",
    "anchor_forces",
    "anchor_layout",
    "maintenance_loads",
  ];
  return keys.map((informationKey) => ({
    sourceDiscipline: "MECHANICAL",
    receivingDiscipline: "STRUCTURAL",
    informationKey,
    description: informationKey.replaceAll("_", " "),
    status: "REQUIRED",
  }));
}

export function crossDisciplineTrace(input: {
  requirementId: string;
  systemId: string;
  systemParticipants: DisciplineParticipation[];
  interfaceId: string;
  interfaceParticipants: DisciplineParticipation[];
  information: InterfaceInformationRequirement[];
  reviewPackageId: string;
}): {
  requirementId: string;
  systemId: string;
  disciplines: CanonicalDisciplineCode[];
  interfaceId: string;
  mechanicalSupplies: string[];
  structuralConsumes: string[];
  reviewPackageId: string;
} {
  const disciplines = resolveDisciplineContext({
    objectKind: "SYSTEM",
    systemParticipants: input.systemParticipants,
    interfaceParticipants: input.interfaceParticipants,
  });
  return {
    requirementId: input.requirementId,
    systemId: input.systemId,
    disciplines,
    interfaceId: input.interfaceId,
    mechanicalSupplies: input.information.filter((row) => row.sourceDiscipline === "MECHANICAL").map((row) => row.informationKey),
    structuralConsumes: input.information.filter((row) => row.receivingDiscipline === "STRUCTURAL").map((row) => row.informationKey),
    reviewPackageId: input.reviewPackageId,
  };
}

export { CANONICAL_DISCIPLINE_CODES };
