import type { CommercialLicense } from "@rtb/types";
import type { LicenseRepository } from "../repositories/license-repository";
import type { PlanEntitlementRepository } from "../repositories/entitlement-repository";
import type { SeatRepository } from "../repositories/seat-repository";
import type { CommerceEventService } from "./commerce-event-service";
import type { EntitlementCache } from "./entitlement-cache";

export class LicenseIssuanceService {
  constructor(
    private readonly licenses: LicenseRepository,
    private readonly planEntitlements: PlanEntitlementRepository,
    private readonly seats: SeatRepository,
    private readonly events: CommerceEventService,
    private readonly cache: EntitlementCache
  ) {}

  listByTenant = (tenantId: string) => this.licenses.listByTenant(tenantId);

  async issueForSubscription(input: {
    tenantId: string;
    subscriptionId: string;
    productId: string;
    planId?: string;
    workspaceId?: string;
    seatLimit?: number;
    issuedBy?: string;
  }): Promise<CommercialLicense[]> {
    const issued: CommercialLicense[] = [];

    const productLicence = await this.licenses.create({
      tenantId: input.tenantId,
      productId: input.productId,
      subscriptionId: input.subscriptionId,
      licenseType: "product",
      maxSeats: input.seatLimit,
      createdBy: input.issuedBy,
    });
    issued.push(productLicence);

    if (input.planId) {
      const entitlements = await this.planEntitlements.listByPlan(input.planId);
      for (const ent of entitlements) {
        if (ent.entitlement_type === "application_access" && ent.boolean_value !== false) {
          const appLicence = await this.licenses.create({
            tenantId: input.tenantId,
            productId: input.productId,
            applicationKey: ent.entitlement_key,
            subscriptionId: input.subscriptionId,
            licenseType: "application",
            createdBy: input.issuedBy,
          });
          issued.push(appLicence);
        }
        if (ent.entitlement_type === "feature_access" && ent.boolean_value !== false) {
          const featureLicence = await this.licenses.create({
            tenantId: input.tenantId,
            productId: input.productId,
            subscriptionId: input.subscriptionId,
            licenseType: "feature",
            featureKey: ent.entitlement_key,
            createdBy: input.issuedBy,
          });
          issued.push(featureLicence);
        }
        if (ent.entitlement_type === "seat_limit" && ent.integer_value) {
          await this.seats.upsertPool({
            tenantId: input.tenantId,
            productId: input.productId,
            subscriptionId: input.subscriptionId,
            totalSeats: ent.integer_value,
            createdBy: input.issuedBy,
          });
        }
      }
    } else if (input.seatLimit) {
      await this.seats.upsertPool({
        tenantId: input.tenantId,
        productId: input.productId,
        subscriptionId: input.subscriptionId,
        totalSeats: input.seatLimit,
        createdBy: input.issuedBy,
      });
    }

    for (const licence of issued) {
      await this.events.emit({
        eventType: "licence.issued",
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        actorUserId: input.issuedBy,
        aggregateType: "licence",
        aggregateId: licence.id,
        payload: { licenceId: licence.id, subscriptionId: input.subscriptionId },
      });
    }

    this.cache.invalidateTenant(input.tenantId);
    return issued;
  }

  static readonly PILOT_APPLICATION_KEYS = [
    "project_intelligence",
    "documents",
    "inspection_intelligence",
    "project_controls",
  ] as const;

  static readonly PILOT_FEATURE_KEYS = ["ai_assistant"] as const;

  async reconcilePilotProfile(input: {
    tenantId: string;
    productId: string;
    subscriptionId: string;
    issuedBy?: string;
  }): Promise<{ issued: CommercialLicense[]; skipped: string[] }> {
    const existing = await this.licenses.listByProduct(input.tenantId, input.productId);
    const issued: CommercialLicense[] = [];
    const skipped: string[] = [];

    for (const applicationKey of LicenseIssuanceService.PILOT_APPLICATION_KEYS) {
      const found = existing.find(
        (l) =>
          l.license_type === "application" &&
          l.application_key === applicationKey &&
          l.status === "active"
      );
      if (found) {
        skipped.push(applicationKey);
        continue;
      }
      const licence = await this.licenses.create({
        tenantId: input.tenantId,
        productId: input.productId,
        applicationKey,
        subscriptionId: input.subscriptionId,
        licenseType: "application",
        createdBy: input.issuedBy,
      });
      issued.push(licence);
      await this.events.emit({
        eventType: "licence.issued",
        tenantId: input.tenantId,
        actorUserId: input.issuedBy,
        aggregateType: "licence",
        aggregateId: licence.id,
        payload: { licenceId: licence.id, applicationKey, source: "pilot_reconcile" },
      });
    }

    for (const featureKey of LicenseIssuanceService.PILOT_FEATURE_KEYS) {
      const found = existing.find(
        (l) => l.license_type === "feature" && l.feature_key === featureKey && l.status === "active"
      );
      if (found) {
        skipped.push(featureKey);
        continue;
      }
      const licence = await this.licenses.create({
        tenantId: input.tenantId,
        productId: input.productId,
        featureKey,
        subscriptionId: input.subscriptionId,
        licenseType: "feature",
        createdBy: input.issuedBy,
      });
      issued.push(licence);
      await this.events.emit({
        eventType: "licence.issued",
        tenantId: input.tenantId,
        actorUserId: input.issuedBy,
        aggregateType: "licence",
        aggregateId: licence.id,
        payload: { licenceId: licence.id, featureKey, source: "pilot_reconcile" },
      });
    }

    this.cache.invalidateTenant(input.tenantId);
    return { issued, skipped };
  }

  async revoke(tenantId: string, licenceId: string, revokedBy?: string, reason?: string) {
    const updated = await this.licenses.updateStatus(tenantId, licenceId, "revoked");
    await this.events.emit({
      eventType: "licence.revoked",
      tenantId,
      actorUserId: revokedBy,
      aggregateType: "licence",
      aggregateId: licenceId,
      payload: { reason },
    });
    this.cache.invalidateTenant(tenantId);
    return updated;
  }

  async suspend(tenantId: string, licenceId: string, actorUserId?: string) {
    const updated = await this.licenses.updateStatus(tenantId, licenceId, "suspended");
    await this.events.emit({
      eventType: "licence.suspended",
      tenantId,
      actorUserId,
      aggregateType: "licence",
      aggregateId: licenceId,
      payload: {},
    });
    this.cache.invalidateTenant(tenantId);
    return updated;
  }

  async resume(tenantId: string, licenceId: string, actorUserId?: string) {
    const updated = await this.licenses.updateStatus(tenantId, licenceId, "active");
    await this.events.emit({
      eventType: "licence.resumed",
      tenantId,
      actorUserId,
      aggregateType: "licence",
      aggregateId: licenceId,
      payload: {},
    });
    this.cache.invalidateTenant(tenantId);
    return updated;
  }
}
