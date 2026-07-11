import type { SupabaseClient } from "@rtb/database";
import type { CommercialInstallation, InstallationRequestInput, ProductInstallationStatus } from "@rtb/types";
import { InstallationStateMachine } from "../domain/installation-state-machine";
import { InstallationErrorCode } from "../domain/installation-reason-codes";
import {
  InstallationConflictError,
  InstallationDependencyError,
  InstallationNotFoundError,
  CommercePermissionDeniedError,
} from "../domain/errors";
import { SubscriptionStateMachine } from "../domain/subscription-state-machine";
import type { InstallationRepository } from "../repositories/installation-repository";
import type { InstallationVersionRepository } from "../repositories/installation-version-repository";
import type { SubscriptionRepository } from "../repositories/subscription-repository";
import type { LicenseRepository } from "../repositories/license-repository";
import type { ProductRepository } from "../repositories/product-repository";
import type { CommerceEventService } from "./commerce-event-service";
import type { EntitlementCache } from "./entitlement-cache";
import type { ProvisioningOrchestrator } from "./provisioning-orchestrator";
import type { InstallationDependencyResolver } from "./installation-dependency-resolver";

const INSTALL_STEPS = [
  { key: "entitlement_verified", order: 1, label: "Entitlement verified" },
  { key: "dependencies_validated", order: 2, label: "Dependencies validated" },
  { key: "provisioning", order: 3, label: "Provisioning" },
  { key: "validation", order: 4, label: "Validation" },
  { key: "workspace_assignment", order: 5, label: "Workspace assignment" },
  { key: "activation", order: 6, label: "Activation" },
] as const;

export class InstallationLifecycleService {
  constructor(
    private readonly installations: InstallationRepository,
    private readonly subscriptions: SubscriptionRepository,
    private readonly licenses: LicenseRepository,
    private readonly products: ProductRepository,
    private readonly events: CommerceEventService,
    private readonly cache: EntitlementCache,
    private readonly installationVersions: InstallationVersionRepository,
    private readonly provisioning: ProvisioningOrchestrator,
    private readonly dependencies: InstallationDependencyResolver,
    private readonly supabase: SupabaseClient
  ) {}

  listByTenant = (tenantId: string) => this.installations.listByTenant(tenantId);
  getById = (tenantId: string, id: string) => this.installations.getById(tenantId, id);
  getByProduct = (tenantId: string, productId: string) =>
    this.installations.getByProduct(tenantId, productId);

  async requestInstallation(input: InstallationRequestInput): Promise<CommercialInstallation> {
    const product = input.productSlug
      ? await this.products.getBySlug(input.productSlug)
      : await this.products.getById(input.productId);
    if (!product) {
      throw new InstallationConflictError("Product not found", InstallationErrorCode.INSTALLATION_NOT_FOUND);
    }

    const existing = await this.installations.getByProduct(input.tenantId, product.id);
    if (existing && InstallationStateMachine.isAccessGranting(existing.status)) {
      throw new InstallationConflictError(
        "Product already installed",
        InstallationErrorCode.INSTALLATION_CONFLICT
      );
    }
    if (existing && ["provisioning", "queued", "validating", "requested"].includes(existing.status)) {
      throw new InstallationConflictError(
        "Installation already in progress",
        InstallationErrorCode.INSTALLATION_CONFLICT
      );
    }

    const subs = await this.subscriptions.listByTenant(input.tenantId);
    const activeSub = subs.find(
      (s) =>
        s.product_id === product.id &&
        SubscriptionStateMachine.isAccessGranting(s.status as never)
    );
    if (!activeSub) {
      throw new InstallationDependencyError(
        "Active subscription required",
        InstallationErrorCode.SUBSCRIPTION_INACTIVE
      );
    }

    const productLicences = await this.licenses.listByTenant(input.tenantId);
    const activeLicence = productLicences.find(
      (l) =>
        l.product_id === product.id &&
        l.license_type === "product" &&
        l.status === "active" &&
        l.subscription_id === activeSub.id
    );
    if (!activeLicence) {
      throw new InstallationDependencyError("Product licence required", InstallationErrorCode.LICENCE_MISSING);
    }

    await this.dependencies.assertDependencies(input.tenantId, product.id);

    const installation =
      existing ??
      (await this.installations.create({
        tenantId: input.tenantId,
        productId: product.id,
        subscriptionId: activeSub.id,
        licenceId: activeLicence.id,
        requestedVersion: input.requestedVersion,
        requestedBy: input.requestedBy,
        workspaceId: input.workspaceId,
        status: "requested",
        metadata: { correlationId: input.correlationId },
      }));

    const workflowId = await this.installations.createWorkflow(
      input.tenantId,
      installation.id,
      "install",
      input.correlationId
    );

    await this.installations.upsertWorkflowStep(input.tenantId, workflowId, {
      step_key: INSTALL_STEPS[0].key,
      step_order: INSTALL_STEPS[0].order,
      status: "completed",
    });

    await this.installations.upsertWorkflowStep(input.tenantId, workflowId, {
      step_key: INSTALL_STEPS[1].key,
      step_order: INSTALL_STEPS[1].order,
      status: "completed",
    });

    let current = await this.transition({
      tenantId: input.tenantId,
      installationId: installation.id,
      targetStatus: "queued",
      actorUserId: input.requestedBy,
      correlationId: input.correlationId,
    });

    current = await this.executeProvisioning({
      tenantId: input.tenantId,
      installation: current,
      productSlug: product.slug as string,
      workflowId,
      actorUserId: input.requestedBy,
      workspaceIds: input.workspaceIds,
      correlationId: input.correlationId,
    });

    return current;
  }

  async executeProvisioning(params: {
    tenantId: string;
    installation: CommercialInstallation;
    productSlug: string;
    workflowId: string;
    actorUserId: string;
    workspaceIds?: string[];
    correlationId?: string;
  }): Promise<CommercialInstallation> {
    const { tenantId, installation, productSlug, workflowId, actorUserId } = params;

    await this.installations.upsertWorkflowStep(tenantId, workflowId, {
      step_key: "provisioning",
      step_order: 3,
      status: "running",
    });

    let current = await this.transition({
      tenantId,
      installationId: installation.id,
      targetStatus: "provisioning",
      actorUserId,
      correlationId: params.correlationId,
    });

    try {
      await this.provisioning.runProductProvisioning({
        tenantId,
        installationId: installation.id,
        productSlug,
        idempotencyKey: `install:${installation.id}:${installation.requested_version ?? "default"}`,
      });
    } catch (err) {
      await this.installations.upsertWorkflowStep(tenantId, workflowId, {
        step_key: "provisioning",
        step_order: 3,
        status: "failed",
        error_code: InstallationErrorCode.PROVISIONING_FAILED,
        error_message: err instanceof Error ? err.message : String(err),
      });
      return this.transition({
        tenantId,
        installationId: installation.id,
        targetStatus: "failed",
        actorUserId,
        patch: {
          failure_code: InstallationErrorCode.PROVISIONING_FAILED,
          failure_message: err instanceof Error ? err.message : String(err),
        },
      });
    }

    await this.installations.upsertWorkflowStep(tenantId, workflowId, {
      step_key: "provisioning",
      step_order: 3,
      status: "completed",
    });

    await this.installations.upsertWorkflowStep(tenantId, workflowId, {
      step_key: "validation",
      step_order: 4,
      status: "running",
    });

    current = await this.transition({
      tenantId,
      installationId: installation.id,
      targetStatus: "validating",
      actorUserId,
    });

    await this.installations.upsertWorkflowStep(tenantId, workflowId, {
      step_key: "validation",
      step_order: 4,
      status: "completed",
    });

    if (params.workspaceIds?.length) {
      await this.installations.upsertWorkflowStep(tenantId, workflowId, {
        step_key: "workspace_assignment",
        step_order: 5,
        status: "running",
      });
      for (const workspaceId of params.workspaceIds) {
        await this.assertWorkspaceBelongsToTenant(tenantId, workspaceId);
        await this.installations.assignWorkspace({
          tenantId,
          workspaceId,
          installationId: installation.id,
          productId: installation.product_id,
          assignedBy: actorUserId,
        });
      }
      await this.installations.upsertWorkflowStep(tenantId, workflowId, {
        step_key: "workspace_assignment",
        step_order: 5,
        status: "completed",
      });
    }

    await this.installations.upsertWorkflowStep(tenantId, workflowId, {
      step_key: "activation",
      step_order: 6,
      status: "running",
    });

    current = await this.transition({
      tenantId,
      installationId: installation.id,
      targetStatus: "active",
      actorUserId,
      patch: {
        installed_version: installation.requested_version ?? installation.installed_version ?? "1.0.0",
        failure_code: null,
        failure_message: null,
      },
    });

    await this.installations.upsertWorkflowStep(tenantId, workflowId, {
      step_key: "activation",
      step_order: 6,
      status: "completed",
    });

    await this.supabase
      .from("commercial_installation_workflows")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", workflowId);

    return current;
  }

  async suspend(tenantId: string, installationId: string, actorUserId: string, reason?: string) {
    return this.transition({
      tenantId,
      installationId,
      targetStatus: "suspended",
      actorUserId,
      patch: { failure_message: reason ?? null },
    });
  }

  async resume(tenantId: string, installationId: string, actorUserId: string) {
    const installation = await this.installations.getById(tenantId, installationId);
    if (!installation) throw new InstallationNotFoundError(installationId);

    const subs = await this.subscriptions.listByTenant(tenantId);
    const sub = subs.find((s) => s.id === installation.subscription_id);
    if (!sub || !SubscriptionStateMachine.isAccessGranting(sub.status as never)) {
      throw new InstallationDependencyError(
        "Subscription must be active to resume",
        InstallationErrorCode.SUBSCRIPTION_INACTIVE
      );
    }

    return this.transition({
      tenantId,
      installationId,
      targetStatus: "active",
      actorUserId,
    });
  }

  async requestUninstall(tenantId: string, installationId: string, actorUserId: string) {
    await this.assertNoDependentApplications(tenantId, installationId);
    return this.transition({
      tenantId,
      installationId,
      targetStatus: "uninstall_pending",
      actorUserId,
    });
  }

  async uninstall(tenantId: string, installationId: string, actorUserId: string, options?: { force?: boolean }) {
    if (!options?.force) {
      await this.assertNoDependentApplications(tenantId, installationId);
    }

    let current = await this.transition({
      tenantId,
      installationId,
      targetStatus: "uninstalling",
      actorUserId,
    });

    const assignments = await this.installations.listWorkspaceAssignments(tenantId, installationId);
    for (const assignment of assignments) {
      await this.installations.removeWorkspaceAssignment(tenantId, assignment.id);
    }

    current = await this.transition({
      tenantId,
      installationId,
      targetStatus: "uninstalled",
      actorUserId,
    });

    return current;
  }

  async transition(input: {
    tenantId: string;
    installationId: string;
    targetStatus: ProductInstallationStatus;
    actorUserId?: string;
    correlationId?: string;
    patch?: Record<string, unknown>;
  }): Promise<CommercialInstallation> {
    const existing = await this.installations.getById(input.tenantId, input.installationId);
    if (!existing) throw new InstallationNotFoundError(input.installationId);

    const from = InstallationStateMachine.normalizeProductStatus(existing.status);
    const updated = await this.installations.transition({
      tenantId: input.tenantId,
      installationId: input.installationId,
      targetStatus: input.targetStatus,
      actorUserId: input.actorUserId,
      correlationId: input.correlationId,
      patch: input.patch,
    });

    const eventType = InstallationStateMachine.eventTypeForProductTransition(from, input.targetStatus);
    await this.installations.recordEvent(
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
      aggregateType: "installation",
      aggregateId: input.installationId,
      correlationId: input.correlationId,
      payload: { from, to: input.targetStatus, installationId: input.installationId },
    });

    this.cache.invalidateTenant(input.tenantId);
    await this.installationVersions.bumpTenant(input.tenantId);

    return updated;
  }

  async listEvents(tenantId: string, installationId: string) {
    const { data, error } = await this.supabase
      .from("commercial_installation_events")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("installation_id", installationId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async getWorkflowProgress(tenantId: string, installationId: string) {
    const workflow = await this.installations.getActiveWorkflow(tenantId, installationId);
    if (!workflow) return { steps: [], workflow: null };
    const steps = await this.installations.listWorkflowSteps(tenantId, workflow.id as string);
    return { workflow, steps };
  }

  assignWorkspace(input: {
    tenantId: string;
    workspaceId: string;
    installationId: string;
    productId: string;
    assignedBy: string;
  }) {
    return this.installations.assignWorkspace(input);
  }

  removeWorkspaceAssignment(tenantId: string, assignmentId: string) {
    return this.installations.removeWorkspaceAssignment(tenantId, assignmentId);
  }

  private async assertWorkspaceBelongsToTenant(tenantId: string, workspaceId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from("workspaces")
      .select("id")
      .eq("id", workspaceId)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (error || !data) {
      throw new InstallationDependencyError(
        "Workspace does not belong to tenant",
        InstallationErrorCode.WORKSPACE_LIMIT_EXCEEDED
      );
    }
  }

  static assertInstallPermission(roleSlug: string): void {
    if (!["owner", "admin"].includes(roleSlug)) {
      throw new CommercePermissionDeniedError();
    }
  }

  async runScheduledHealthChecks(
    checkFn: (tenantId: string, installationId: string) => Promise<unknown>
  ): Promise<number> {
    const { data, error } = await this.supabase
      .from("commercial_installations")
      .select("id, tenant_id")
      .in("status", ["active", "degraded"])
      .is("deleted_at", null)
      .limit(100);
    if (error) throw new Error(error.message);
    let count = 0;
    for (const row of data ?? []) {
      await checkFn(row.tenant_id as string, row.id as string);
      count++;
    }
    return count;
  }

  async retryFailedInstallations(): Promise<number> {
    const { data, error } = await this.supabase
      .from("commercial_installations")
      .select("id, tenant_id, product_id, requested_version, metadata")
      .eq("status", "failed")
      .is("deleted_at", null)
      .limit(20);
    if (error) throw new Error(error.message);
    let count = 0;
    for (const row of data ?? []) {
      const product = await this.products.getById(row.product_id as string);
      if (!product) continue;
      const installation = await this.installations.getById(row.tenant_id as string, row.id as string);
      if (!installation) continue;
      await this.transition({
        tenantId: row.tenant_id as string,
        installationId: row.id as string,
        targetStatus: "queued",
        actorUserId: undefined,
      });
      const workflowId = await this.installations.createWorkflow(
        row.tenant_id as string,
        row.id as string,
        "install"
      );
      await this.executeProvisioning({
        tenantId: row.tenant_id as string,
        installation,
        productSlug: product.slug as string,
        workflowId,
        actorUserId: "scheduler",
      });
      count++;
    }
    return count;
  }

  async suspendForInactiveSubscriptions(): Promise<number> {
    const { data, error } = await this.supabase
      .from("commercial_installations")
      .select("id, tenant_id, subscription_id")
      .eq("status", "active")
      .is("deleted_at", null);
    if (error) throw new Error(error.message);
    let count = 0;
    for (const row of data ?? []) {
      if (!row.subscription_id) continue;
      const sub = await this.subscriptions.getById(row.tenant_id as string, row.subscription_id as string);
      if (!sub || !SubscriptionStateMachine.isAccessGranting(sub.status as never)) {
        await this.suspend(row.tenant_id as string, row.id as string, "scheduler", "subscription_inactive");
        count++;
      }
    }
    return count;
  }

  async requestUpgrade(
    tenantId: string,
    installationId: string,
    targetVersion: string,
    actorUserId: string,
    correlationId?: string
  ) {
    const installation = await this.installations.getById(tenantId, installationId);
    if (!installation) throw new InstallationNotFoundError(installationId);
    if (!InstallationStateMachine.isAccessGranting(installation.status)) {
      throw new InstallationConflictError(
        "Installation must be active to upgrade",
        InstallationErrorCode.INSTALLATION_NOT_ACTIVE
      );
    }

    const subs = await this.subscriptions.listByTenant(tenantId);
    const sub = subs.find((s) => s.id === installation.subscription_id);
    if (!sub || !SubscriptionStateMachine.isAccessGranting(sub.status as never)) {
      throw new InstallationDependencyError(
        "Active subscription required",
        InstallationErrorCode.SUBSCRIPTION_INACTIVE
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
    const installation = await this.installations.getById(tenantId, installationId);
    if (!installation) throw new InstallationNotFoundError(installationId);
    const product = await this.products.getById(installation.product_id);

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
        installationId,
        productSlug: (product?.slug as string) ?? "engineering-os",
        idempotencyKey: `upgrade:${installationId}:${targetVersion}`,
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

    current = await this.transition({
      tenantId,
      installationId,
      targetStatus: "active",
      actorUserId,
      patch: {
        installed_version: targetVersion,
        failure_code: null,
        failure_message: null,
      },
    });

    await this.events.emit({
      eventType: "installation.upgraded",
      tenantId,
      actorUserId,
      aggregateType: "installation",
      aggregateId: installationId,
      correlationId,
      payload: { targetVersion, installationId },
    });

    return current;
  }

  async requestRollback(
    tenantId: string,
    installationId: string,
    targetVersion: string | undefined,
    reason: string,
    actorUserId: string,
    correlationId?: string
  ) {
    const installation = await this.installations.getById(tenantId, installationId);
    if (!installation) throw new InstallationNotFoundError(installationId);

    const preVersion = (installation.metadata?.pre_upgrade_version as string | undefined) ?? null;
    const resolvedTarget = targetVersion ?? preVersion;
    if (!preVersion || !resolvedTarget || preVersion !== resolvedTarget) {
      throw new InstallationConflictError(
        "Rollback target version is not supported",
        InstallationErrorCode.DEPENDENCY_VERSION_INCOMPATIBLE
      );
    }

    await this.transition({
      tenantId,
      installationId,
      targetStatus: "rollback_pending",
      actorUserId,
      correlationId,
      patch: { metadata: { ...installation.metadata, rollback_reason: reason } },
    });

    let current = await this.transition({
      tenantId,
      installationId,
      targetStatus: "rolling_back",
      actorUserId,
    });

    const product = await this.products.getById(installation.product_id);
    try {
      await this.provisioning.runProductProvisioning({
        tenantId,
        installationId,
        productSlug: (product?.slug as string) ?? "engineering-os",
        idempotencyKey: `rollback:${installationId}:${resolvedTarget}`,
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

    return this.transition({
      tenantId,
      installationId,
      targetStatus: "active",
      actorUserId,
      patch: {
        installed_version: resolvedTarget,
        requested_version: resolvedTarget,
        failure_code: null,
        failure_message: null,
      },
    });
  }

  async assertNoDependentApplications(tenantId: string, installationId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from("commercial_application_installations")
      .select("id, application_key")
      .eq("tenant_id", tenantId)
      .eq("parent_product_installation_id", installationId)
      .in("status", ["active", "degraded", "provisioning", "validating"]);
    if (error) throw new Error(error.message);
    if ((data?.length ?? 0) > 0) {
      throw new InstallationDependencyError(
        "Dependent applications must be uninstalled first",
        InstallationErrorCode.ACTIVE_DEPENDENCIES_EXIST
      );
    }
  }
}
