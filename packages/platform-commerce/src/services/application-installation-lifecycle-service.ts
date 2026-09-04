import type { SupabaseClient } from "@rtb/database";
import type {
  ApplicationInstallationStatus,
  CommercialApplicationInstallation,
} from "@rtb/types";
import { InstallationStateMachine } from "../domain/installation-state-machine";
import { InstallationErrorCode } from "../domain/installation-reason-codes";
import {
  InstallationConflictError,
  InstallationDependencyError,
  InstallationNotFoundError,
  CommercePermissionDeniedError,
} from "../domain/errors";
import { SubscriptionStateMachine } from "../domain/subscription-state-machine";
import type { ApplicationInstallationRepository } from "../repositories/application-installation-repository";
import type { InstallationRepository } from "../repositories/installation-repository";
import type { InstallationVersionRepository } from "../repositories/installation-version-repository";
import type { SubscriptionRepository } from "../repositories/subscription-repository";
import type { LicenseRepository } from "../repositories/license-repository";
import type { ProductApplicationRepository } from "../repositories/entitlement-repository";
import type { CommerceEventService } from "./commerce-event-service";
import type { EntitlementCache } from "./entitlement-cache";
import type { ProvisioningOrchestrator } from "./provisioning-orchestrator";
import type { InstallationHealthService } from "./installation-health-service";

export interface ApplicationInstallationRequestInput {
  tenantId: string;
  productId?: string;
  applicationKey: string;
  requestedVersion?: string;
  requestedBy: string;
  workspaceId?: string | null;
  correlationId?: string;
}

const ENGINEERING_PRODUCT_ID = "c1000000-0000-4000-8000-000000000001";

export const ENGINEERING_OS_APPLICATION_KEYS = [
  "project_intelligence",
  "inspection_intelligence",
  "asset_intelligence",
  "project_controls",
  "digital_twin",
  "engineering_model_interoperability",
  "documents",
  "meetings",
  "knowledge",
  "structural_intelligence",
] as const;

export class ApplicationInstallationLifecycleService {
  constructor(
    private readonly appInstallations: ApplicationInstallationRepository,
    private readonly productInstallations: InstallationRepository,
    private readonly subscriptions: SubscriptionRepository,
    private readonly licenses: LicenseRepository,
    private readonly productApplications: ProductApplicationRepository,
    private readonly events: CommerceEventService,
    private readonly cache: EntitlementCache,
    private readonly installationVersions: InstallationVersionRepository,
    private readonly provisioning: ProvisioningOrchestrator,
    private readonly health: InstallationHealthService,
    private readonly supabase: SupabaseClient
  ) {}

  listByTenant = (tenantId: string) => this.appInstallations.listByTenant(tenantId);
  getById = (tenantId: string, id: string) => this.appInstallations.getById(tenantId, id);

  async requestInstallation(
    input: ApplicationInstallationRequestInput
  ): Promise<CommercialApplicationInstallation> {
    const productId =
      input.productId ||
      (ENGINEERING_OS_APPLICATION_KEYS.includes(
        input.applicationKey as (typeof ENGINEERING_OS_APPLICATION_KEYS)[number],
      )
        ? ENGINEERING_PRODUCT_ID
        : "");
    if (!productId) {
      throw new InstallationDependencyError(
        "Parent product is required",
        InstallationErrorCode.PARENT_OS_NOT_INSTALLED
      );
    }

    const parent = await this.productInstallations.getByProduct(input.tenantId, productId);
    if (!parent || !InstallationStateMachine.isAccessGranting(parent.status)) {
      throw new InstallationDependencyError(
        "Active parent product installation required",
        InstallationErrorCode.PARENT_OS_NOT_INSTALLED
      );
    }

    const app = await this.productApplications.getApplicationByKey(input.applicationKey);
    if (!app) {
      throw new InstallationConflictError("Application not found", InstallationErrorCode.INSTALLATION_NOT_FOUND);
    }

    const existing = await this.appInstallations.getByKey(
      input.tenantId,
      productId,
      input.applicationKey
    );
    if (existing && InstallationStateMachine.isAccessGranting(existing.status as never)) {
      throw new InstallationConflictError(
        "Application already installed",
        InstallationErrorCode.INSTALLATION_CONFLICT
      );
    }

    const subs = await this.subscriptions.listByTenant(input.tenantId);
    const activeSub = subs.find(
      (s) =>
        s.product_id === productId &&
        SubscriptionStateMachine.isAccessGranting(s.status as never)
    );
    if (!activeSub) {
      throw new InstallationDependencyError(
        "Active subscription required",
        InstallationErrorCode.SUBSCRIPTION_INACTIVE
      );
    }

    const licences = await this.licenses.listByTenant(input.tenantId);
    const appLicence = licences.find(
      (l) =>
        l.product_id === productId &&
        l.status === "active" &&
        l.subscription_id === activeSub.id &&
        (l.application_key === input.applicationKey || l.license_type === "product")
    );
    if (!appLicence) {
      throw new InstallationDependencyError(
        "Application entitlement required",
        InstallationErrorCode.LICENCE_MISSING
      );
    }

    const installation =
      existing ??
      (await this.appInstallations.create({
        tenantId: input.tenantId,
        productId,
        applicationKey: input.applicationKey,
        parentProductInstallationId: parent.id,
        subscriptionId: activeSub.id,
        licenceId: appLicence.id,
        requestedVersion: input.requestedVersion,
        requestedBy: input.requestedBy,
        workspaceId: input.workspaceId,
        status: "requested",
        metadata: { correlationId: input.correlationId },
      }));

    return this.start(input.tenantId, installation.id, input.requestedBy, input.correlationId);
  }

  async start(
    tenantId: string,
    installationId: string,
    actorUserId: string,
    correlationId?: string
  ): Promise<CommercialApplicationInstallation> {
    const installation = await this.appInstallations.getById(tenantId, installationId);
    if (!installation) throw new InstallationNotFoundError(installationId);

    let current = await this.transition({
      tenantId,
      installationId,
      targetStatus: "queued",
      actorUserId,
      correlationId,
    });

    current = await this.transition({
      tenantId,
      installationId,
      targetStatus: "provisioning",
      actorUserId,
      correlationId,
    });

    try {
      if (installation.application_key === "project_intelligence") {
        await this.provisioning.runProductProvisioning({
          tenantId,
          installationId: installation.parent_product_installation_id ?? installationId,
          productSlug: "project-intelligence",
          idempotencyKey: `app-install:${installationId}:${installation.requested_version ?? "default"}`,
        });
      }
      await this.syncRuntimeRegistration(tenantId, installation.application_key, true);
    } catch (err) {
      return this.transition({
        tenantId,
        installationId,
        targetStatus: "failed",
        actorUserId,
        patch: {
          failure_code: InstallationErrorCode.PROVISIONING_FAILED,
          failure_message: err instanceof Error ? err.message : String(err),
        },
      });
    }

    current = await this.transition({
      tenantId,
      installationId,
      targetStatus: "validating",
      actorUserId,
    });

    return this.transition({
      tenantId,
      installationId,
      targetStatus: "active",
      actorUserId,
      patch: {
        installed_version:
          installation.requested_version ?? installation.installed_version ?? "1.0.0",
        failure_code: null,
        failure_message: null,
      },
    });
  }

  async suspend(tenantId: string, installationId: string, actorUserId: string, reason?: string) {
    await this.syncRuntimeRegistration(
      tenantId,
      (await this.requireInstallation(tenantId, installationId)).application_key,
      false
    );
    return this.transition({
      tenantId,
      installationId,
      targetStatus: "suspended",
      actorUserId,
      patch: { failure_message: reason ?? null },
    });
  }

  async resume(tenantId: string, installationId: string, actorUserId: string) {
    const installation = await this.requireInstallation(tenantId, installationId);
    if (!installation.subscription_id) {
      throw new InstallationDependencyError(
        "Subscription required",
        InstallationErrorCode.SUBSCRIPTION_INACTIVE
      );
    }
    const sub = await this.subscriptions.getById(tenantId, installation.subscription_id);
    if (!sub || !SubscriptionStateMachine.isAccessGranting(sub.status as never)) {
      throw new InstallationDependencyError(
        "Subscription must be active to resume",
        InstallationErrorCode.SUBSCRIPTION_INACTIVE
      );
    }
    const parent = installation.parent_product_installation_id
      ? await this.productInstallations.getById(tenantId, installation.parent_product_installation_id)
      : null;
    if (!parent || !InstallationStateMachine.isAccessGranting(parent.status)) {
      throw new InstallationDependencyError(
        "Parent product installation must be active",
        InstallationErrorCode.PARENT_OS_NOT_INSTALLED
      );
    }
    const current = await this.transition({
      tenantId,
      installationId,
      targetStatus: "active",
      actorUserId,
    });
    await this.syncRuntimeRegistration(tenantId, installation.application_key, true);
    return current;
  }

  async requestUpgrade(
    tenantId: string,
    installationId: string,
    targetVersion: string,
    actorUserId: string,
    correlationId?: string
  ) {
    const installation = await this.requireInstallation(tenantId, installationId);
    if (!InstallationStateMachine.isAccessGranting(installation.status as never)) {
      throw new InstallationConflictError(
        "Installation must be active to upgrade",
        InstallationErrorCode.INSTALLATION_NOT_ACTIVE
      );
    }
    await this.transition({
      tenantId,
      installationId,
      targetStatus: "upgrade_pending",
      actorUserId,
      correlationId,
      patch: {
        requested_version: targetVersion,
        metadata: {
          ...installation.metadata,
          pre_upgrade_version: installation.installed_version,
        },
      },
    });
    return this.executeUpgrade(tenantId, installationId, targetVersion, actorUserId, correlationId);
  }

  async executeUpgrade(
    tenantId: string,
    installationId: string,
    targetVersion: string,
    actorUserId: string,
    correlationId?: string
  ) {
    const installation = await this.requireInstallation(tenantId, installationId);
    let current = await this.transition({
      tenantId,
      installationId,
      targetStatus: "upgrading",
      actorUserId,
      correlationId,
    });

    try {
      await this.provisioning.runProductProvisioning({
        tenantId,
        installationId: installation.parent_product_installation_id ?? installationId,
        productSlug:
          installation.application_key === "project_intelligence"
            ? "project-intelligence"
            : "engineering-os",
        idempotencyKey: `app-upgrade:${installationId}:${targetVersion}`,
      });
    } catch (err) {
      return this.transition({
        tenantId,
        installationId,
        targetStatus: "failed",
        actorUserId,
        patch: {
          failure_code: InstallationErrorCode.PROVISIONING_FAILED,
          failure_message: err instanceof Error ? err.message : String(err),
        },
      });
    }

    current = await this.transition({
      tenantId,
      installationId,
      targetStatus: "validating",
      actorUserId,
    });

    const health = await this.health.checkApplication(tenantId, installationId);
    if (health.healthState === "failed") {
      return this.transition({
        tenantId,
        installationId,
        targetStatus: "degraded",
        actorUserId,
        patch: { failure_message: health.summary ?? "Health check failed after upgrade" },
      });
    }

    current = await this.transition({
      tenantId,
      installationId,
      targetStatus: "active",
      actorUserId,
      patch: { installed_version: targetVersion, failure_code: null, failure_message: null },
    });

    await this.events.emit({
      eventType: "application_installation.upgraded",
      tenantId,
      actorUserId,
      aggregateType: "application_installation",
      aggregateId: installationId,
      correlationId,
      payload: { targetVersion, installationId },
    });

    return current;
  }

  async requestRollback(
    tenantId: string,
    installationId: string,
    targetVersion: string,
    reason: string,
    actorUserId: string,
    correlationId?: string
  ) {
    const installation = await this.requireInstallation(tenantId, installationId);
    const preVersion = (installation.metadata?.pre_upgrade_version as string | undefined) ?? null;
    if (!preVersion || preVersion !== targetVersion) {
      throw new InstallationConflictError(
        "Rollback target version is not supported",
        InstallationErrorCode.DEPENDENCY_VERSION_INCOMPATIBLE
      );
    }

    let current = await this.transition({
      tenantId,
      installationId,
      targetStatus: "upgrading",
      actorUserId,
      correlationId,
      patch: { metadata: { ...installation.metadata, rollback_reason: reason } },
    });

    try {
      await this.provisioning.runProductProvisioning({
        tenantId,
        installationId: installation.parent_product_installation_id ?? installationId,
        productSlug:
          installation.application_key === "project_intelligence"
            ? "project-intelligence"
            : "engineering-os",
        idempotencyKey: `app-rollback:${installationId}:${targetVersion}`,
      });
    } catch (err) {
      return this.transition({
        tenantId,
        installationId,
        targetStatus: "failed",
        actorUserId,
        patch: {
          failure_code: InstallationErrorCode.PROVISIONING_FAILED,
          failure_message: err instanceof Error ? err.message : String(err),
        },
      });
    }

    const health = await this.health.checkApplication(tenantId, installationId);
    if (health.healthState === "failed") {
      throw new InstallationConflictError(
        "Rollback unsafe: health validation failed",
        InstallationErrorCode.PROVISIONING_FAILED
      );
    }

    current = await this.transition({
      tenantId,
      installationId,
      targetStatus: "active",
      actorUserId,
      patch: {
        installed_version: targetVersion,
        requested_version: targetVersion,
        failure_code: null,
        failure_message: null,
      },
    });

    await this.events.emit({
      eventType: "application_installation.rolled_back",
      tenantId,
      actorUserId,
      aggregateType: "application_installation",
      aggregateId: installationId,
      correlationId,
      payload: { targetVersion, reason, installationId },
    });

    return current;
  }

  async uninstall(
    tenantId: string,
    installationId: string,
    actorUserId: string,
    options?: { force?: boolean }
  ) {
    const installation = await this.requireInstallation(tenantId, installationId);
    if (!options?.force && InstallationStateMachine.isAccessGranting(installation.status as never)) {
      await this.transition({
        tenantId,
        installationId,
        targetStatus: "uninstall_pending",
        actorUserId,
      });
    }

    let current = await this.transition({
      tenantId,
      installationId,
      targetStatus: "uninstalling",
      actorUserId,
    });

    await this.syncRuntimeRegistration(tenantId, installation.application_key, false);

    const { error } = await this.supabase
      .from("commercial_workspace_application_assignments")
      .update({ status: "removed", removed_at: new Date().toISOString() })
      .eq("tenant_id", tenantId)
      .eq("application_installation_id", installationId);
    if (error) throw new Error(error.message);

    current = await this.transition({
      tenantId,
      installationId,
      targetStatus: "uninstalled",
      actorUserId,
    });

    return current;
  }

  async listEvents(tenantId: string, installationId: string) {
    const { data, error } = await this.supabase
      .from("commercial_installation_events")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("app_installation_id", installationId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async getHealth(tenantId: string, installationId: string) {
    return this.health.checkApplication(tenantId, installationId);
  }

  static assertInstallPermission(roleSlug: string): void {
    if (!["owner", "admin"].includes(roleSlug)) {
      throw new CommercePermissionDeniedError();
    }
  }

  private async transition(input: {
    tenantId: string;
    installationId: string;
    targetStatus: ApplicationInstallationStatus;
    actorUserId?: string;
    correlationId?: string;
    patch?: Record<string, unknown>;
  }): Promise<CommercialApplicationInstallation> {
    const existing = await this.appInstallations.getById(input.tenantId, input.installationId);
    if (!existing) throw new InstallationNotFoundError(input.installationId);

    const from = existing.status;
    const updated = await this.appInstallations.transition(input);
    const eventType = `application_installation.${input.targetStatus}`;

    await this.appInstallations.recordEvent(
      input.tenantId,
      input.installationId,
      eventType,
      from,
      input.targetStatus,
      { correlationId: input.correlationId },
      input.actorUserId
    );

    await this.events.emit({
      eventType,
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      aggregateType: "application_installation",
      aggregateId: input.installationId,
      correlationId: input.correlationId,
      payload: { from, to: input.targetStatus },
    });

    this.cache.invalidateTenant(input.tenantId);
    await this.installationVersions.bumpTenant(input.tenantId);
    return updated;
  }

  private async requireInstallation(tenantId: string, installationId: string) {
    const installation = await this.appInstallations.getById(tenantId, installationId);
    if (!installation) throw new InstallationNotFoundError(installationId);
    return installation;
  }

  /** Sync engineering runtime registration from commerce installation state. */
  private async syncRuntimeRegistration(
    tenantId: string,
    applicationKey: string,
    enabled: boolean
  ): Promise<void> {
    const { data: app } = await this.supabase
      .from("engineering_application_registry")
      .select("id")
      .eq("app_key", applicationKey)
      .maybeSingle();
    if (!app?.id) return;

    await this.supabase.from("engineering_application_installations").upsert(
      {
        tenant_id: tenantId,
        app_id: app.id,
        enabled,
        installed_at: enabled ? new Date().toISOString() : undefined,
        metadata: { source: "commercial_application_installations" },
      },
      { onConflict: "tenant_id,app_id" }
    );
  }
}
