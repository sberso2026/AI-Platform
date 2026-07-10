import type { SupabaseClient } from "@rtb/database";
import { InstallationErrorCode } from "../domain/installation-reason-codes";
import { InstallationDependencyError } from "../domain/errors";
import { InstallationStateMachine } from "../domain/installation-state-machine";
import type { InstallationRepository } from "../repositories/installation-repository";

export interface DependencyRecord {
  dependency_type: string;
  depends_on_product_id?: string | null;
  depends_on_application_key?: string | null;
  minimum_version?: string | null;
  maximum_version?: string | null;
  feature_key?: string | null;
}

export class InstallationDependencyResolver {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly installations: InstallationRepository
  ) {}

  async assertDependencies(tenantId: string, productId: string): Promise<void> {
    const deps = await this.listDependencies(productId);
    for (const dep of deps.filter((d) => d.dependency_type === "required")) {
      if (dep.depends_on_product_id) {
        const parent = await this.installations.getByProduct(tenantId, dep.depends_on_product_id);
        if (!parent || !InstallationStateMachine.isAccessGranting(parent.status)) {
          throw new InstallationDependencyError(
            "Parent product installation required",
            InstallationErrorCode.PARENT_OS_NOT_INSTALLED
          );
        }
        if (dep.minimum_version && parent.installed_version) {
          if (this.compareVersions(parent.installed_version, dep.minimum_version) < 0) {
            throw new InstallationDependencyError(
              `Minimum version ${dep.minimum_version} required`,
              InstallationErrorCode.DEPENDENCY_VERSION_INCOMPATIBLE
            );
          }
        }
      }
    }
  }

  async listDependencies(productId: string): Promise<DependencyRecord[]> {
    const { data, error } = await this.supabase
      .from("commercial_installation_dependencies")
      .select("dependency_type, depends_on_product_id, depends_on_application_key, minimum_version, maximum_version, feature_key")
      .eq("product_id", productId)
      .is("deleted_at", null)
      .or(`tenant_id.is.null`);
    if (error) throw new Error(error.message);
    return (data ?? []) as DependencyRecord[];
  }

  private compareVersions(a: string, b: string): number {
    const pa = a.split(".").map(Number);
    const pb = b.split(".").map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
      if (diff !== 0) return diff;
    }
    return 0;
  }
}
