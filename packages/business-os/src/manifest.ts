import type { OperatingSystemManifest } from "@rtb/types";
import { BUSINESS_CAPABILITY_DEFINITIONS } from "./capabilities";
import { BUSINESS_OS_VERSION, BUSINESS_OS_ID } from "./version";

const OS_ID = BUSINESS_OS_ID;

export function buildBusinessOsManifest(): OperatingSystemManifest {
  return {
    id: OS_ID,
    name: "Business Operating System",
    description:
      "AI-assisted business operations, finance, and strategy — foundation preview (BOS-0)",
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
      { path: "/business", title: "Business OS", component: "BusinessOsFoundation" },
      { path: "/business/settings", title: "Business OS Settings", component: "BusinessOsSettings" },
    ],
    navigation: [
      {
        id: "bos-home",
        label: "Business OS",
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
