import type { CommerceAdapterContext } from "@rtb/platform-core";
import { ENGINEERING_APPLICATIONS, ENGINEERING_OS_MANIFEST } from "@rtb/engineering-os/manifest";

/** Default commerce adapter context for tenant UI (registry-backed). */
export function buildDefaultCommerceContext(
  roleSlug = "owner"
): CommerceAdapterContext {
  return {
    roleSlug,
    engineeringOsEnabled: true,
    engineeringEdition: "Enterprise",
    engineeringVersion: ENGINEERING_OS_MANIFEST.version,
    engineeringApplications: ENGINEERING_APPLICATIONS.map((app) => ({
      app_key: app.app_key,
      name: app.name,
      description: app.description,
      version: app.version,
      enabled: app.enabled,
      routes: app.routes,
    })),
    seatUsage: { assigned: 12, total: 25 },
    renewalDate: "2027-01-01",
    currentPlan: "Enterprise",
  };
}
