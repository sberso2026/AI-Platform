import type {
  CommercialEntitlementOverride,
  CommercialInstallation,
  CommercialLicense,
  CommercialSubscription,
  EntitlementDiagnosticResult,
  EntitlementDiagnosticStep,
} from "@rtb/types";
import { SubscriptionStateMachine } from "../domain/subscription-state-machine";
import {
  EntitlementReasonCode,
  type EntitlementCheckInput,
  type EntitlementDecision,
} from "../domain/entitlement-reason-codes";
import type { InstallationRepository } from "../repositories/installation-repository";
import { InstallationStateMachine } from "../domain/installation-state-machine";
import type { PlanEntitlementRepository, EntitlementOverrideRepository, ProductApplicationRepository } from "../repositories/entitlement-repository";
import type { SeatAssignmentRepository } from "../repositories/seat-assignment-repository";
import type { SeatRepository } from "../repositories/seat-repository";
import type { SubscriptionRepository } from "../repositories/subscription-repository";
import type { LicenseRepository } from "../repositories/license-repository";
import type { EntitlementVersionRepository } from "../repositories/entitlement-version-repository";
import type { InstallationVersionRepository } from "../repositories/installation-version-repository";
import { EntitlementCache } from "./entitlement-cache";

export type EntitlementEvalProfile = {
  totalMs: number;
  waves: number;
  stages: Record<string, number>;
  overrideListCalls: number;
  usedCache: boolean;
};

type InstallationPrefetch = {
  fetched: boolean;
  value?: CommercialInstallation | null;
  error?: unknown;
};

export class EntitlementService {
  lastProfile: EntitlementEvalProfile | null = null;
  private evalStages: Record<string, number> | null = null;
  private evalWaves = 0;

  constructor(
    private readonly subscriptions: SubscriptionRepository,
    private readonly licenses: LicenseRepository,
    private readonly seats: SeatRepository,
    private readonly seatAssignments: SeatAssignmentRepository,
    private readonly planEntitlements: PlanEntitlementRepository,
    private readonly overrides: EntitlementOverrideRepository,
    private readonly products: ProductApplicationRepository,
    private readonly cache: EntitlementCache,
    private readonly installations?: InstallationRepository,
    private readonly entitlementVersions?: EntitlementVersionRepository,
    private readonly installationVersions?: InstallationVersionRepository
  ) {}

  invalidateTenant(tenantId: string): void {
    this.cache.invalidateTenant(tenantId);
  }

  async check(input: EntitlementCheckInput): Promise<EntitlementDecision> {
    const started = Date.now();
    this.lastProfile = null;
    const useCache = input.cachePolicy !== "fresh";
    const cacheKey = this.cache.buildKey({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      userId: input.userId,
      productKey: input.productKey,
      applicationKey: input.applicationKey,
      featureKey: input.featureKey,
      action: input.action,
    });

    if (useCache && this.cache.hasStoredDecisions()) {
      await this.syncVersionStamps(input.tenantId);
      const cached = this.cache.get<EntitlementDecision>(cacheKey, input.tenantId);
      if (cached) {
        this.lastProfile = {
          totalMs: Date.now() - started,
          waves: 0,
          stages: { cacheHit: Date.now() - started },
          overrideListCalls: 0,
          usedCache: true,
        };
        return cached;
      }
    }

    try {
      const decision = await this.evaluate(input);
      if (useCache && this.cache.hasStoredDecisions()) {
        const versions = await this.readVersionStamps(input.tenantId);
        this.cache.set(cacheKey, decision, false, versions);
      }
      if (this.lastProfile) {
        this.lastProfile = {
          ...this.lastProfile,
          totalMs: Date.now() - started,
          usedCache: false,
        };
      }
      return decision;
    } catch {
      this.lastProfile = {
        totalMs: Date.now() - started,
        waves: this.lastProfile?.waves ?? 0,
        stages: this.lastProfile?.stages ?? {},
        overrideListCalls: this.lastProfile?.overrideListCalls ?? 0,
        usedCache: false,
      };
      return {
        allowed: false,
        decision: "error",
        reasonCode: EntitlementReasonCode.INTERNAL_EVALUATION_ERROR,
      };
    }
  }

  checkFeature(input: Omit<EntitlementCheckInput, "applicationKey" | "productKey"> & {
    featureKey: string;
  }) {
    return this.check({ ...input, action: input.action ?? "use" });
  }

  async diagnose(input: EntitlementCheckInput): Promise<EntitlementDiagnosticResult> {
    const steps: EntitlementDiagnosticStep[] = [];
    const freshInput = { ...input, cachePolicy: "fresh" as const };

    try {
      const overrideRows = await this.overrides.listActive(freshInput.tenantId);
      const overrideDeny = this.matchOverride(overrideRows, freshInput, "deny");
      if (overrideDeny) {
        steps.push({ step: "override_deny", passed: false, detail: overrideDeny.reasonCode });
        return { allowed: false, reasonCode: overrideDeny.reasonCode, steps };
      }
      steps.push({ step: "override_deny", passed: true });

      const overrideAllow = this.matchOverride(overrideRows, freshInput, "allow");
      if (overrideAllow) {
        steps.push({ step: "override_allow", passed: true, detail: overrideAllow.reasonCode });
        return { allowed: true, reasonCode: overrideAllow.reasonCode, steps };
      }
      steps.push({ step: "override_allow", passed: false });

      let productId: string | undefined;
      if (freshInput.productKey) {
        const product = await this.products.getProductBySlug(freshInput.productKey);
        if (!product) {
          steps.push({ step: "product", passed: false, detail: EntitlementReasonCode.DENY_PRODUCT_NOT_FOUND });
          return { allowed: false, reasonCode: EntitlementReasonCode.DENY_PRODUCT_NOT_FOUND, steps };
        }
        if (product.lifecycle_status !== "active" && product.lifecycle_status !== "preview") {
          steps.push({ step: "product", passed: false, detail: EntitlementReasonCode.DENY_PRODUCT_INACTIVE });
          return { allowed: false, reasonCode: EntitlementReasonCode.DENY_PRODUCT_INACTIVE, steps };
        }
        productId = product.id as string;
        steps.push({ step: "product", passed: true, detail: String(product.slug ?? freshInput.productKey) });
      }

      if (!productId && freshInput.applicationKey) {
        const eng = await this.products.getProductBySlug("engineering-os");
        productId = eng?.id as string | undefined;
        steps.push({
          step: "product_implicit",
          passed: !!productId,
          detail: productId ? "engineering-os" : EntitlementReasonCode.DENY_PRODUCT_NOT_FOUND,
        });
      }

      if (!productId) {
        steps.push({ step: "product", passed: false, detail: EntitlementReasonCode.DENY_PRODUCT_NOT_FOUND });
        return { allowed: false, reasonCode: EntitlementReasonCode.DENY_PRODUCT_NOT_FOUND, steps };
      }

      const subscription = await this.subscriptions.findActiveByProduct(freshInput.tenantId, productId);
      if (!subscription) {
        steps.push({ step: "subscription", passed: false, detail: EntitlementReasonCode.DENY_SUBSCRIPTION_NOT_FOUND });
        return { allowed: false, reasonCode: EntitlementReasonCode.DENY_SUBSCRIPTION_NOT_FOUND, steps };
      }
      steps.push({ step: "subscription", passed: true, detail: subscription.status });

      const subDecision = this.evaluateSubscription(subscription);
      if (subDecision) {
        steps.push({ step: "subscription_state", passed: false, detail: subDecision.reasonCode });
        return { allowed: false, reasonCode: subDecision.reasonCode, steps };
      }
      steps.push({ step: "subscription_state", passed: true });

      const tenantLicences = await this.licenses.listByProduct(freshInput.tenantId, productId);
      const activeLicences = tenantLicences.filter((l) => l.status === "active" || l.status === "expiring_soon");
      steps.push({
        step: "licences",
        passed: activeLicences.length > 0,
        detail: `${activeLicences.length} active`,
      });

      let decision: EntitlementDecision;
      if (freshInput.featureKey) {
        decision = await this.evaluateFeature(freshInput, subscription, activeLicences);
        steps.push({
          step: "feature",
          passed: decision.allowed,
          detail: decision.reasonCode,
        });
      } else if (freshInput.applicationKey) {
        decision = await this.evaluateApplication(freshInput, subscription, activeLicences);
        steps.push({
          step: "application",
          passed: decision.allowed,
          detail: decision.reasonCode,
        });
      } else {
        const productLicence = activeLicences.find((l) => l.license_type === "product");
        if (!productLicence) {
          steps.push({ step: "product_licence", passed: false, detail: EntitlementReasonCode.DENY_LICENCE_NOT_FOUND });
          return { allowed: false, reasonCode: EntitlementReasonCode.DENY_LICENCE_NOT_FOUND, steps };
        }
        steps.push({ step: "product_licence", passed: true });
        decision = await this.evaluateSeatAndAllow(freshInput, subscription, productLicence);
      }

      if (decision.seatRequired !== undefined) {
        steps.push({
          step: "seat",
          passed: !decision.seatRequired || !!decision.seatAssigned,
          detail: decision.seatRequired
            ? decision.seatAssigned
              ? "assigned"
              : EntitlementReasonCode.DENY_SEAT_NOT_ASSIGNED
            : "not_required",
        });
      }

      return {
        allowed: decision.allowed,
        reasonCode: decision.reasonCode,
        steps,
      };
    } catch {
      steps.push({ step: "evaluation", passed: false, detail: EntitlementReasonCode.INTERNAL_EVALUATION_ERROR });
      return {
        allowed: false,
        reasonCode: EntitlementReasonCode.INTERNAL_EVALUATION_ERROR,
        steps,
      };
    }
  }

  private async markEval<T>(name: string, work: Promise<T>): Promise<T> {
    const began = Date.now();
    try {
      return await work;
    } finally {
      if (this.evalStages) this.evalStages[name] = Date.now() - began;
    }
  }

  private finishEvaluate(
    decision: EntitlementDecision,
    started: number,
    waves: number,
    stages: Record<string, number>,
    overrideListCalls: number
  ): EntitlementDecision {
    this.lastProfile = {
      totalMs: Date.now() - started,
      waves: Math.max(waves, this.evalWaves),
      stages,
      overrideListCalls,
      usedCache: false,
    };
    return decision;
  }

  private async evaluate(input: EntitlementCheckInput): Promise<EntitlementDecision> {
    const started = Date.now();
    const stages: Record<string, number> = {};
    this.evalStages = stages;
    this.evalWaves = 0;
    let waves = 0;
    let overrideListCalls = 0;
    const mark = async <T>(name: string, work: Promise<T>): Promise<T> => {
      const began = Date.now();
      try {
        return await work;
      } finally {
        stages[name] = Date.now() - began;
      }
    };
    const finish = (decision: EntitlementDecision) =>
      this.finishEvaluate(decision, started, waves, stages, overrideListCalls);

    waves += 1;
    this.evalWaves = waves;
    const [overrideRows, product] = await Promise.all([
      mark("overrides", this.overrides.listActive(input.tenantId)),
      input.productKey
        ? mark("product", this.products.getProductBySlug(input.productKey))
        : Promise.resolve(undefined),
    ]);
    overrideListCalls = 1;

    const overrideDeny = this.matchOverride(overrideRows, input, "deny");
    if (overrideDeny) return finish(overrideDeny);
    const overrideAllow = this.matchOverride(overrideRows, input, "allow");
    if (overrideAllow) return finish(overrideAllow);

    let productId: string | undefined;
    if (input.productKey) {
      if (!product) {
        return finish(deny(EntitlementReasonCode.DENY_PRODUCT_NOT_FOUND));
      }
      if (product.lifecycle_status !== "active" && product.lifecycle_status !== "preview") {
        return finish(deny(EntitlementReasonCode.DENY_PRODUCT_INACTIVE));
      }
      productId = product.id as string;
    }

    if (!productId && input.applicationKey) {
      waves += 1;
      this.evalWaves = waves;
      const eng = await mark("product_implicit", this.products.getProductBySlug("engineering-os"));
      productId = eng?.id as string | undefined;
    }

    if (!productId) {
      return finish(deny(EntitlementReasonCode.DENY_PRODUCT_NOT_FOUND));
    }

    waves += 1;
    this.evalWaves = waves;
    const [subResult, licResult, instResult] = await Promise.allSettled([
      mark("subscription", this.subscriptions.findActiveByProduct(input.tenantId, productId)),
      mark("licences", this.licenses.listByProduct(input.tenantId, productId)),
      this.installations
        ? mark("installation", this.installations.getByProduct(input.tenantId, productId))
        : Promise.resolve(null),
    ]);

    if (subResult.status === "rejected") throw subResult.reason;
    const subscription = subResult.value;
    if (!subscription) {
      return finish(deny(EntitlementReasonCode.DENY_SUBSCRIPTION_NOT_FOUND));
    }

    const subDecision = this.evaluateSubscription(subscription);
    if (subDecision) return finish(subDecision);

    if (licResult.status === "rejected") throw licResult.reason;
    const tenantLicences = licResult.value ?? [];
    const activeLicences = tenantLicences.filter((l) => l.status === "active" || l.status === "expiring_soon");
    const installationPrefetch: InstallationPrefetch = {
      fetched: Boolean(this.installations),
      value: instResult.status === "fulfilled" ? instResult.value : undefined,
      error: instResult.status === "rejected" ? instResult.reason : undefined,
    };

    if (input.featureKey) {
      return finish(await this.evaluateFeature(input, subscription, activeLicences));
    }

    if (input.applicationKey) {
      return finish(await this.evaluateApplication(input, subscription, activeLicences, installationPrefetch));
    }

    const productLicence = activeLicences.find((l) => l.license_type === "product");
    if (!productLicence) {
      return finish(deny(EntitlementReasonCode.DENY_LICENCE_NOT_FOUND));
    }

    const installationDecision = await this.evaluateInstallation(input, productId, installationPrefetch, {
      skipWorkspaceAssignments: true,
    });
    if (installationDecision) return finish(installationDecision);

    return finish(await this.evaluateSeatAndAllow(input, subscription, productLicence, installationPrefetch));
  }

  private async evaluateInstallation(
    input: EntitlementCheckInput,
    productId: string,
    prefetch?: InstallationPrefetch,
    options?: { skipWorkspaceAssignments?: boolean }
  ): Promise<EntitlementDecision | null> {
    if (!this.installations) return null;
    if (prefetch?.error) throw prefetch.error;

    const installation = prefetch?.fetched
      ? prefetch.value ?? null
      : await this.markEval("installation", this.installations.getByProduct(input.tenantId, productId));
    if (!installation) {
      return deny(EntitlementReasonCode.DENY_INSTALLATION_NOT_FOUND);
    }
    const status = InstallationStateMachine.normalizeProductStatus(installation.status);
    if (!InstallationStateMachine.isAccessGranting(status)) {
      return deny(EntitlementReasonCode.DENY_INSTALLATION_NOT_ACTIVE);
    }

    if (input.workspaceId && !options?.skipWorkspaceAssignments) {
      this.evalWaves += 1;
      const assignments = await this.markEval(
        "workspaceAssignments",
        this.installations.listWorkspaceAssignments(input.tenantId, installation.id)
      );
      if (
        assignments.length > 0 &&
        !assignments.some((a) => a.workspace_id === input.workspaceId)
      ) {
        return deny(EntitlementReasonCode.DENY_WORKSPACE_NOT_ASSIGNED);
      }
    }

    return null;
  }

  private evaluateSubscription(subscription: CommercialSubscription): EntitlementDecision | null {
    const status = subscription.status === "trial" ? "trialing" : subscription.status;
    if (status === "suspended") return deny(EntitlementReasonCode.DENY_SUBSCRIPTION_SUSPENDED);
    if (status === "cancelled") {
      const effective = subscription.cancellation_effective_at;
      if (effective && new Date(effective) > new Date()) {
        // cancellation at period end — access preserved
      } else {
        return deny(EntitlementReasonCode.DENY_SUBSCRIPTION_CANCELLED);
      }
    }
    if (status === "expired") return deny(EntitlementReasonCode.DENY_SUBSCRIPTION_EXPIRED);
    if (!SubscriptionStateMachine.isAccessGranting(status)) {
      return deny(EntitlementReasonCode.DENY_SUBSCRIPTION_INACTIVE);
    }
    if (status === "trialing") {
      const trialEnd = subscription.trial_end ?? subscription.trial_ends_at;
      if (trialEnd && new Date(trialEnd) < new Date()) {
        return deny(EntitlementReasonCode.DENY_SUBSCRIPTION_EXPIRED);
      }
    }
    return null;
  }

  private async evaluateFeature(
    input: EntitlementCheckInput,
    subscription: CommercialSubscription,
    licences: CommercialLicense[]
  ): Promise<EntitlementDecision> {
    const featureLicence = licences.find(
      (l) => l.license_type === "feature" && l.feature_key === input.featureKey
    );
    if (!featureLicence) {
      if (subscription.plan_id) {
        const entitlements = await this.planEntitlements.listByPlan(subscription.plan_id);
        const entitled = entitlements.some(
          (e) =>
            e.entitlement_type === "feature_access" &&
            e.entitlement_key === input.featureKey &&
            e.boolean_value !== false
        );
        if (!entitled) return deny(EntitlementReasonCode.DENY_FEATURE_NOT_ENABLED);
      } else {
        return deny(EntitlementReasonCode.DENY_FEATURE_NOT_ENABLED);
      }
    } else if (featureLicence.status !== "active") {
      return deny(EntitlementReasonCode.DENY_LICENCE_REVOKED);
    }
    return {
      allowed: true,
      decision: "allow",
      reasonCode: EntitlementReasonCode.ALLOW_FEATURE_ENABLED,
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      licenceId: featureLicence?.id,
      seatRequired: false,
      seatAssigned: true,
      workspaceAllowed: true,
    };
  }

  private async evaluateApplication(
    input: EntitlementCheckInput,
    subscription: CommercialSubscription,
    licences: CommercialLicense[],
    installationPrefetch?: InstallationPrefetch
  ): Promise<EntitlementDecision> {
    const appLicence = licences.find(
      (l) => l.license_type === "application" && l.application_key === input.applicationKey
    );

    if (!appLicence) {
      if (subscription.plan_id) {
        const entitlements = await this.planEntitlements.listByPlan(subscription.plan_id);
        const entitled = entitlements.some(
          (e) =>
            e.entitlement_type === "application_access" &&
            e.entitlement_key === input.applicationKey &&
            e.boolean_value !== false
        );
        if (!entitled) return deny(EntitlementReasonCode.DENY_APPLICATION_NOT_IN_PLAN);
      } else {
        return deny(EntitlementReasonCode.DENY_APPLICATION_NOT_IN_PLAN);
      }
      return deny(EntitlementReasonCode.DENY_LICENCE_NOT_FOUND);
    }

    if (appLicence.status === "expired") return deny(EntitlementReasonCode.DENY_LICENCE_EXPIRED);
    if (appLicence.status === "revoked" || appLicence.status === "suspended") {
      return deny(EntitlementReasonCode.DENY_LICENCE_REVOKED);
    }

    if (
      input.workspaceId &&
      appLicence.workspace_id &&
      appLicence.workspace_id !== input.workspaceId
    ) {
      return deny(EntitlementReasonCode.DENY_WORKSPACE_NOT_ENTITLED);
    }

    const installationDecision = await this.evaluateInstallation(
      input,
      subscription.product_id as string,
      installationPrefetch,
      { skipWorkspaceAssignments: true }
    );
    if (installationDecision) return installationDecision;

    return this.evaluateSeatAndAllow(input, subscription, appLicence, installationPrefetch);
  }

  private async evaluateSeatAndAllow(
    input: EntitlementCheckInput,
    subscription: CommercialSubscription,
    licence: CommercialLicense,
    installationPrefetch?: InstallationPrefetch
  ): Promise<EntitlementDecision> {
    const seatRequired = (licence.max_seats ?? 0) > 0 || licence.license_type !== "feature";
    let seatAssigned = !seatRequired;
    const installation = installationPrefetch?.fetched ? installationPrefetch.value ?? null : null;

    const assignmentPromise =
      this.installations && input.workspaceId && installation
        ? this.markEval(
            "workspaceAssignments",
            this.installations.listWorkspaceAssignments(input.tenantId, installation.id)
          )
        : Promise.resolve([]);
    const poolPromise =
      seatRequired && input.userId
        ? this.markEval("seatPool", this.seats.getByProduct(input.tenantId, licence.product_id!))
        : Promise.resolve(null);

    this.evalWaves += 1;
    const [assignments, pool] = await Promise.all([assignmentPromise, poolPromise]);
    if (
      input.workspaceId &&
      assignments.length > 0 &&
      !assignments.some((a) => a.workspace_id === input.workspaceId)
    ) {
      return deny(EntitlementReasonCode.DENY_WORKSPACE_NOT_ASSIGNED);
    }

    if (seatRequired && input.userId) {
      if (pool) {
        this.evalWaves += 1;
        const assignment = await this.markEval(
          "seatAssignment",
          this.seatAssignments.getActiveAssignment(input.tenantId, pool.id, input.userId)
        );
        seatAssigned = !!assignment;
      } else {
        seatAssigned = false;
      }
    }

    if (seatRequired && !seatAssigned) {
      return deny(EntitlementReasonCode.DENY_SEAT_NOT_ASSIGNED);
    }

    return {
      allowed: true,
      decision: "allow",
      reasonCode:
        licence.license_type === "application"
          ? EntitlementReasonCode.ALLOW_ACTIVE_APPLICATION_LICENCE
          : EntitlementReasonCode.ALLOW_ACTIVE_PRODUCT_LICENCE,
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      licenceId: licence.id,
      licenceStatus: licence.status,
      seatRequired,
      seatAssigned,
      workspaceAllowed: true,
      validUntil: licence.expires_at ?? subscription.current_period_end ?? null,
      limits: { seatLimit: licence.max_seats ?? null },
    };
  }

  private matchOverride(
    rows: CommercialEntitlementOverride[],
    input: EntitlementCheckInput,
    effect: "allow" | "deny"
  ): EntitlementDecision | null {
    const match = rows.find((o) => {
      if (o.effect !== effect) return false;
      if (o.user_id && input.userId && o.user_id !== input.userId) return false;
      if (o.workspace_id && input.workspaceId && o.workspace_id !== input.workspaceId) return false;
      if (o.application_key && input.applicationKey && o.application_key !== input.applicationKey)
        return false;
      if (o.feature_key && input.featureKey && o.feature_key !== input.featureKey) return false;
      return true;
    });
    if (!match) return null;
    if (effect === "deny") {
      return deny(EntitlementReasonCode.DENY_OVERRIDE_DENY);
    }
    return {
      allowed: true,
      decision: "allow",
      reasonCode: EntitlementReasonCode.ALLOW_OVERRIDE,
      seatRequired: false,
      seatAssigned: true,
      workspaceAllowed: true,
    };
  }

  private async checkOverrides(
    input: EntitlementCheckInput,
    effect: "allow" | "deny"
  ): Promise<EntitlementDecision | null> {
    const rows = await this.overrides.listActive(input.tenantId);
    return this.matchOverride(rows, input, effect);
  }

  private async readVersionStamps(tenantId: string): Promise<{
    entitlementVersion?: number;
    installationVersion?: number;
  }> {
    const [entitlementVersion, installationVersion] = await Promise.all([
      this.entitlementVersions?.getTenantVersion(tenantId) ?? Promise.resolve(0),
      this.installationVersions?.getTenantVersion(tenantId) ?? Promise.resolve(0),
    ]);
    return { entitlementVersion, installationVersion };
  }

  private async syncVersionStamps(tenantId: string): Promise<void> {
    const versions = await this.readVersionStamps(tenantId);
    this.cache.setTenantVersions(
      tenantId,
      versions.entitlementVersion ?? 0,
      versions.installationVersion ?? 0
    );
  }
}

function deny(reasonCode: EntitlementReasonCode): EntitlementDecision {
  return { allowed: false, decision: "deny", reasonCode };
}
