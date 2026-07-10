import type { SupabaseClient } from "@rtb/database";
import type {
  ApplicationInstallationStatus,
  CommercialApplicationInstallation,
} from "@rtb/types";
import { BaseRepository } from "./base-repository";
import { InstallationStateMachine } from "../domain/installation-state-machine";

export interface TransitionAppInstallationInput {
  tenantId: string;
  installationId: string;
  targetStatus: ApplicationInstallationStatus;
  actorUserId?: string;
  correlationId?: string;
  patch?: Record<string, unknown>;
}

export class ApplicationInstallationRepository extends BaseRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async listByTenant(tenantId: string): Promise<CommercialApplicationInstallation[]> {
    const { data, error } = await this.supabase
      .from("commercial_application_installations")
      .select("*")
      .eq("tenant_id", tenantId);
    if (error) this.fail("list application installations", error);
    return this.mapRows<CommercialApplicationInstallation>(data).map(this.normalize);
  }

  async getById(tenantId: string, id: string): Promise<CommercialApplicationInstallation | null> {
    const { data, error } = await this.supabase
      .from("commercial_application_installations")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) this.fail("get application installation", error);
    return data ? this.normalize(this.mapRow<CommercialApplicationInstallation>(data)) : null;
  }

  async getByKey(
    tenantId: string,
    productId: string,
    applicationKey: string
  ): Promise<CommercialApplicationInstallation | null> {
    const { data, error } = await this.supabase
      .from("commercial_application_installations")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("product_id", productId)
      .eq("application_key", applicationKey)
      .maybeSingle();
    if (error) this.fail("get application installation by key", error);
    return data ? this.normalize(this.mapRow<CommercialApplicationInstallation>(data)) : null;
  }

  async create(input: {
    tenantId: string;
    productId: string;
    applicationKey: string;
    parentProductInstallationId?: string;
    subscriptionId?: string;
    licenceId?: string;
    requestedVersion?: string;
    requestedBy: string;
    workspaceId?: string | null;
    status?: ApplicationInstallationStatus;
    metadata?: Record<string, unknown>;
  }): Promise<CommercialApplicationInstallation> {
    const now = new Date().toISOString();
    const status = input.status ?? "requested";
    const { data, error } = await this.supabase
      .from("commercial_application_installations")
      .insert({
        tenant_id: input.tenantId,
        product_id: input.productId,
        application_key: input.applicationKey,
        parent_product_installation_id: input.parentProductInstallationId ?? null,
        subscription_id: input.subscriptionId ?? null,
        licence_id: input.licenceId ?? null,
        workspace_id: input.workspaceId ?? null,
        requested_version: input.requestedVersion ?? null,
        requested_by: input.requestedBy,
        status,
        metadata: input.metadata ?? {},
        requested_at: now,
      })
      .select("*")
      .single();
    if (error) this.fail("create application installation", error);
    return this.normalize(this.mapRow<CommercialApplicationInstallation>(data));
  }

  async transition(input: TransitionAppInstallationInput): Promise<CommercialApplicationInstallation> {
    const existing = await this.getById(input.tenantId, input.installationId);
    if (!existing) throw new Error(`Application installation not found: ${input.installationId}`);

    const from = InstallationStateMachine.normalizeAppStatus(existing.status);
    InstallationStateMachine.assertAppTransition(from, input.targetStatus);

    const now = new Date().toISOString();
    const patch: Record<string, unknown> = {
      status: input.targetStatus,
      updated_at: now,
      ...input.patch,
    };
    if (input.targetStatus === "provisioning" && !existing.started_at) patch.started_at = now;
    if (input.targetStatus === "active") {
      patch.completed_at = now;
      patch.installed_at = now;
    }

    const { data, error } = await this.supabase
      .from("commercial_application_installations")
      .update(patch)
      .eq("tenant_id", input.tenantId)
      .eq("id", input.installationId)
      .select("*")
      .single();
    if (error) this.fail("transition application installation", error);
    return this.normalize(this.mapRow<CommercialApplicationInstallation>(data));
  }

  async recordEvent(
    tenantId: string,
    installationId: string,
    eventType: string,
    fromStatus: string | null,
    toStatus: string | null,
    payload: Record<string, unknown>,
    createdBy?: string
  ): Promise<void> {
    const { error } = await this.supabase.from("commercial_installation_events").insert({
      tenant_id: tenantId,
      app_installation_id: installationId,
      event_type: eventType,
      from_status: fromStatus,
      to_status: toStatus,
      payload: { ...payload, aggregate: "application_installation" },
      created_by: createdBy ?? null,
    });
    if (error) this.fail("record application installation event", error);
  }

  async listActiveDependents(
    tenantId: string,
    parentProductInstallationId: string
  ): Promise<CommercialApplicationInstallation[]> {
    const { data, error } = await this.supabase
      .from("commercial_application_installations")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("parent_product_installation_id", parentProductInstallationId)
      .in("status", ["active", "degraded", "provisioning", "validating"]);
    if (error) this.fail("list dependent application installations", error);
    return this.mapRows<CommercialApplicationInstallation>(data);
  }

  private normalize(row: CommercialApplicationInstallation): CommercialApplicationInstallation {
    return {
      ...row,
      installed_version: row.installed_version ?? row.version ?? null,
    };
  }
}
