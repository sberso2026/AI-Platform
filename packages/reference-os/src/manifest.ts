import type { OperatingSystemManifest } from "@rtb/types";
import { REFERENCE_OS_ID } from "@rtb/types";

/**
 * Certification-only second Operating System.
 * Must not be marketed or exposed as a customer product.
 */
export const REFERENCE_OS_MANIFEST: OperatingSystemManifest = {
  id: REFERENCE_OS_ID,
  name: "Reference OS",
  description:
    "Minimal non-business Operating System fixture for multi-OS isolation certification only",
  version: "0.1.0",
  author: "RTB Certification",
  certificationOnly: true,
  catalogStatus: "available",
  routes: [
    {
      path: "/reference-os",
      title: "Reference OS Home",
      component: "ReferenceOsHome",
    },
  ],
  navigation: [
    {
      id: "reference-os-home",
      label: "Reference Home",
      path: "/reference-os",
      icon: "Box",
      group: "reference_os",
      order: 1,
    },
  ],
  capabilities: [{ id: "reference_os.cert.read", description: "Read cert fixture surface" }],
  events: [{ type: "reference_os.cert.ping", description: "Namespaced cert event" }],
  knowledge: [{ namespace: "reference_os", description: "Isolated knowledge namespace" }],
  agents: [
    {
      id: "reference-os-cert-agent",
      name: "Reference Cert Agent",
      description: "Certification-only; must not mutate domain data",
      certificationOnly: true,
    },
  ],
  applications: [
    {
      id: "reference-app",
      name: "Reference Application",
      version: "0.1.0",
      operatingSystemId: REFERENCE_OS_ID,
      features: [
        {
          id: "reference-feature",
          name: "Reference Feature",
          version: "0.1.0",
        },
      ],
    },
  ],
};

export function assertReferenceOsCertificationOnly(): void {
  if (!REFERENCE_OS_MANIFEST.certificationOnly) {
    throw new Error("reference-os must remain certificationOnly");
  }
}
