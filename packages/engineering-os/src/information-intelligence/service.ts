import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService, assertEngineeringTenantScope } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import { INFORMATION_TYPE_CATALOG } from "./catalog";
import type { InformationStore } from "./memory-store";
import { SupabaseInformationStore } from "./supabase-store";
import { rejectCallerSuppliedAuthority, resolveEngineeringInformationAuthority } from "./resolver";
import { INFORMATION_AI_BOUNDARY, type EngineeringInformationRef, type InformationAuthorityPolicy, type ResolveInformationInput } from "./types";
import { CALLER_SUPPLIED_AUTHORITY_KEYS } from "./types";

export class EngineeringInformationService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly store: InformationStore = new SupabaseInformationStore(supabase),
  ) {}

  catalog() {
    return {
      types: INFORMATION_TYPE_CATALOG,
      kgRequired: false,
      kgReadsDefault: "OFF",
      aiBoundary: INFORMATION_AI_BOUNDARY,
      universalPrecedence: false,
      engineeringApprovedEqualsAuthoritative: false,
    };
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, projectId: string) {
    assertEngineeringService(commerce, "information.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const rows = await this.store.listRefs(workspaceId, projectId);
    return rows.filter((row) => row.tenantId === tenantId);
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "information.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const row = await this.store.getRef(id);
    if (!row || row.tenantId !== tenantId || row.workspaceId !== workspaceId) return null;
    return row;
  }

  async register(commerce: CommerceExecutionContext, tenantId: string, row: EngineeringInformationRef) {
    assertEngineeringService(commerce, "information.write", tenantId);
    return this.registerAuthorized(commerce, tenantId, row);
  }

  async registerFromConnector(commerce: CommerceExecutionContext, tenantId: string, row: EngineeringInformationRef) {
    assertEngineeringTenantScope(commerce, tenantId);
    return this.registerAuthorized(commerce, tenantId, row);
  }

  private async registerAuthorized(commerce: CommerceExecutionContext, tenantId: string, row: EngineeringInformationRef) {
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (row.tenantId !== tenantId || row.workspaceId !== workspaceId) throw new Error("workspace_mismatch");
    return this.store.saveRef(row);
  }

  async listPolicies(commerce: CommerceExecutionContext, tenantId: string, projectId?: string | null) {
    assertEngineeringService(commerce, "information.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const rows = await this.store.listPolicies(workspaceId, projectId);
    return rows.filter((row) => row.tenantId === tenantId);
  }

  async savePolicy(commerce: CommerceExecutionContext, tenantId: string, row: InformationAuthorityPolicy) {
    assertEngineeringService(commerce, "information.policy.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (row.tenantId !== tenantId || row.workspaceId !== workspaceId) throw new Error("workspace_mismatch");
    return this.store.savePolicy(row);
  }

  async resolve(commerce: CommerceExecutionContext, tenantId: string, request: ResolveInformationInput) {
    assertEngineeringService(commerce, "information.resolve", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const refs = (await this.store.listRefs(workspaceId, request.projectId)).filter((row) => row.tenantId === tenantId);
    const policies = (await this.store.listPolicies(workspaceId, request.projectId)).filter((row) => row.tenantId === tenantId);
    const resolution = resolveEngineeringInformationAuthority({
      tenantId,
      workspaceId,
      refs,
      policies,
      request,
    });
    await this.store.saveResolution(resolution);
    return resolution;
  }

  async listResolutions(commerce: CommerceExecutionContext, tenantId: string, projectId: string) {
    assertEngineeringService(commerce, "information.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    return (await this.store.listResolutions(workspaceId, projectId)).filter((row) => row.tenantId === tenantId);
  }

  async getResolution(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "information.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const row = await this.store.getResolution(id);
    if (!row || row.tenantId !== tenantId || row.workspaceId !== workspaceId) return null;
    return row;
  }

  rejectCallerClaims(body: Record<string, unknown>) {
    return rejectCallerSuppliedAuthority(body);
  }

  callerSuppliedKeys() {
    return CALLER_SUPPLIED_AUTHORITY_KEYS;
  }
}
