import type { OperatingSystemManifest } from "@rtb/types";
import { BUSINESS_CAPABILITY_DEFINITIONS } from "./capabilities";
import { BUSINESS_OS_VERSION, BUSINESS_OS_ID } from "./version";

const OS_ID = BUSINESS_OS_ID;

export function buildBusinessOsManifest(): OperatingSystemManifest {
  return {
    id: OS_ID,
    name: "Business Operating System",
    description:
      "AI-assisted business operations — Owner Command Centre preview (BOS-1)",
    version: BUSINESS_OS_VERSION,
    author: "RTB",
    certificationOnly: false,
    catalogStatus: "coming_soon",
    permissions: [
      { resource: "business", action: "read" },
      { resource: "business", action: "execute" },
      { resource: "business", action: "admin" },
    ],
    modules: [],
    applications: [],
    routes: [
      { path: "/business", title: "Owner Command Centre", component: "OwnerCommandCentre" },
      { path: "/business/settings", title: "Business OS Settings", component: "BusinessOsSettings" },
    ],
    navigation: [
      {
        id: "bos-home",
        label: "Owner Command",
        path: "/business",
        icon: "Briefcase",
        group: "business",
        order: 1,
      },
      {
        id: "bos-settings",
        label: "Settings",
        path: "/business/settings",
        icon: "Settings",
        group: "business_admin",
        order: 90,
      },
    ],
    capabilities: BUSINESS_CAPABILITY_DEFINITIONS.map((c) => ({
      id: c.id,
      description: c.description,
    })),
    events: [
      { type: "business_os.foundation.status.requested", description: "Foundation status read" },
      { type: "business_os.foundation.access.denied", description: "Foundation access denied" },
      { type: "business_os.foundation.access.granted", description: "Foundation access granted" },
      { type: "business_os.kpi.updated", description: "KPI measurement or configuration updated" },
      { type: "business_os.signal.created", description: "Business signal created" },
      { type: "business_os.signal.resolved", description: "Business signal resolved" },
      { type: "business_os.recommendation.created", description: "Advisory recommendation created" },
      { type: "business_os.decision.created", description: "Owner decision recorded" },
      { type: "business_os.decision.updated", description: "Owner decision updated" },
      { type: "business_os.action.created", description: "Internal action recorded" },
      { type: "business_os.action.completed", description: "Internal action completed" },
    ],
    knowledge: [
      {
        namespace: "business",
        description: "Business OS knowledge namespace (unused in BOS-0; uses Platform Kernel graph)",
      },
    ],
    agents: [],
  };
}

export const BUSINESS_OS_RUNTIME_MANIFEST = buildBusinessOsManifest();

/** Plugin-shaped manifest for existing plugin-sdk consumers. */
export const BUSINESS_OS_MANIFEST = {
  id: "business-os",
  name: BUSINESS_OS_RUNTIME_MANIFEST.name,
  version: BUSINESS_OS_RUNTIME_MANIFEST.version,
  description: BUSINESS_OS_RUNTIME_MANIFEST.description,
  author: BUSINESS_OS_RUNTIME_MANIFEST.author,
  operating_system: OS_ID,
  entry_point: "@rtb/business-os",
  permissions: BUSINESS_OS_RUNTIME_MANIFEST.permissions ?? [],
  routes: (BUSINESS_OS_RUNTIME_MANIFEST.routes ?? []).map((r) => ({
    path: r.path,
    component: r.component ?? "Unknown",
    title: r.title,
  })),
  navigation: (BUSINESS_OS_RUNTIME_MANIFEST.navigation ?? []).map((n) => ({
    id: n.id,
    label: n.label,
    icon: n.icon ?? "Circle",
    path: n.path,
    group: n.group ?? "business",
    order: n.order ?? 99,
  })),
};
