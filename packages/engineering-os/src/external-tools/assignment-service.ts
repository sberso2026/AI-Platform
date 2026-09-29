import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import { EngineeringObjectFramework } from "../services/object-framework";
import { ExternalToolGovernanceError } from "./optimization-gate";
import type { ExternalToolWorkspaceAssignment, ExternalToolWorkspaceAssignmentInput } from "./types";

export function mapAssignmentRow(row: Record<string, unknown>): ExternalToolWorkspaceAssignment {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: (row.project_id as string | null) ?? null,
    profileId: String(row.profile_id),
    allowed: Boolean(row.allowed),
    permittedCapabilities: Array.isArray(row.permitted_capabilities) ? (row.permitted_capabilities as string[]) : [],
    designStandard: (row.design_standard as string | null) ?? null,
    unitSystem: (row.unit_system as string | null) ?? null,
    analysisProfile: (row.analysis_profile as string | null) ?? null,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

const WORKSPACE_FORBIDDEN_FIELDS = [
  "executablePath",
  "executable_path",
  "licenceStatus",
  "licence_status",
  "automationPermission",
  "automation_permission",
  "installedVersion",
  "installed_version",
  "credentialSecretId",
  "adapterCompatibilityStatus",
];

export function rejectWorkspacePlatformFields(input: Record<string, unknown>): void {
  for (const key of WORKSPACE_FORBIDDEN_FIELDS) {
    if (input[key] != null) {
      throw new ExternalToolGovernanceError(
        "Workspace assignment cannot set platform installation, licence, automation, or adapter certification.",
        "workspace_cannot_set_platform_install",
      );
    }
  }
}

export class ExternalToolAssignmentService {
  private framework: EngineeringObjectFramework;

  constructor(private readonly supabase: SupabaseClient) {
    this.framework = new EngineeringObjectFramework(supabase);
  }

  async listForWorkspace(
    commerce: CommerceExecutionContext,
    tenantId: string,
    workspaceId?: string,
  ): Promise<ExternalToolWorkspaceAssignment[]> {
    assertEngineeringService(commerce, "external_tools.list", tenantId);
    const scope = workspaceId ?? workspaceScopeId(commerce);
    if (!scope) throw new Error("workspace required");
    const { data, error } = await this.supabase
      .from("engineering_external_tool_assignments")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", scope)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to list tool assignments: ${error.message}`);
    return (data ?? []).map((row) => mapAssignmentRow(row as Record<string, unknown>));
  }

  async listForProfile(
    commerce: CommerceExecutionContext,
    tenantId: string,
    profileId: string,
  ): Promise<ExternalToolWorkspaceAssignment[]> {
    assertEngineeringService(commerce, "external_tools.get", tenantId);
    const { data, error } = await this.supabase
      .from("engineering_external_tool_assignments")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("profile_id", profileId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => mapAssignmentRow(row as Record<string, unknown>));
  }

  async getForWorkspace(
    tenantId: string,
    profileId: string,
    workspaceId: string,
  ): Promise<ExternalToolWorkspaceAssignment | null> {
    const { data, error } = await this.supabase
      .from("engineering_external_tool_assignments")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("profile_id", profileId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapAssignmentRow(data as Record<string, unknown>) : null;
  }

  async assign(
    commerce: CommerceExecutionContext,
    tenantId: string,
    profileId: string,
    input: ExternalToolWorkspaceAssignmentInput,
    actorId?: string | null,
  ): Promise<ExternalToolWorkspaceAssignment> {
    assertEngineeringService(commerce, "external_tools.write", tenantId);
    rejectWorkspacePlatformFields(input as unknown as Record<string, unknown>);
    const { data, error } = await this.supabase
      .from("engineering_external_tool_assignments")
      .upsert(
        {
          tenant_id: tenantId,
          workspace_id: input.workspaceId,
          project_id: input.projectId ?? null,
          profile_id: profileId,
          allowed: input.allowed ?? true,
          permitted_capabilities: input.permittedCapabilities ?? [],
          design_standard: input.designStandard ?? null,
          unit_system: input.unitSystem ?? null,
          analysis_profile: input.analysisProfile ?? null,
        },
        { onConflict: "tenant_id,workspace_id,profile_id" },
      )
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to assign external tool: ${error?.message}`);
    const assignment = mapAssignmentRow(data as Record<string, unknown>);
    try {
      await this.framework.recordActivity({
        tenantId,
        workspaceId: assignment.workspaceId,
        activityType: "external_tool.workspace_assignment_changed",
        objectType: "external_tool_profile",
        objectId: profileId,
        title: `Tool profile assigned to workspace ${assignment.workspaceId.slice(0, 8)}`,
        actorId: actorId ?? undefined,
      });
    } catch {
      // best-effort
    }
    return assignment;
  }
}
