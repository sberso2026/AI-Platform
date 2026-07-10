import { InstallationRepository } from "../repositories";

/** Read-only installation queries — mutations use InstallationLifecycleService. */
export class InstallationService {
  constructor(private readonly installations: InstallationRepository) {}

  listByTenant = (tenantId: string) => this.installations.listByTenant(tenantId);

  getById = (tenantId: string, id: string) => this.installations.getById(tenantId, id);

  getByProduct = (tenantId: string, productId: string) =>
    this.installations.getByProduct(tenantId, productId);

  listWorkspaceAssignments = (tenantId: string, installationId: string) =>
    this.installations.listWorkspaceAssignments(tenantId, installationId);
}
