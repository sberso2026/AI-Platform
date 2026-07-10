import type { LicenseStatus } from "@rtb/types";
import { LicenseRepository } from "../repositories";

export class LicenseService {
  constructor(private readonly licenses: LicenseRepository) {}

  listByTenant = (tenantId: string) => this.licenses.listByTenant(tenantId);

  listByProduct = (tenantId: string, productId: string) =>
    this.licenses.listByProduct(tenantId, productId);

  create = (input: Parameters<LicenseRepository["create"]>[0]) =>
    this.licenses.create(input);

  revoke = (tenantId: string, id: string) =>
    this.licenses.updateStatus(tenantId, id, "revoked" as LicenseStatus);

  suspend = (tenantId: string, id: string) =>
    this.licenses.updateStatus(tenantId, id, "suspended");

  listDueForExpiry = (now: string, limit: number) =>
    this.licenses.listDueForExpiry(now, limit);

  listExpiringWithin = (withinDays: number, limit: number) =>
    this.licenses.listExpiringWithin(withinDays, limit);

  transitionToExpired = (tenantId: string, id: string) =>
    this.licenses.transitionToExpired(tenantId, id);
}
