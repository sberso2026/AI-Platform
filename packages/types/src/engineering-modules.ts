/**
 * Phase 8A — Engineering OS module registration contracts.
 * Modules register through Engineering OS; they must not bypass the OS.
 */

import type { ModuleManifest } from "./os-runtime";

export type EngineeringModuleStatus =
  | "registered"
  | "available"
  | "installing"
  | "active"
  | "suspended"
  | "disabled"
  | "coming_soon";

export type EngineeringInitialModuleKey =
  | "project_intelligence"
  | "inspection_intelligence"
  | "project_controls"
  | "digital_twin";

export const ENGINEERING_INITIAL_MODULE_KEYS: EngineeringInitialModuleKey[] = [
  "project_intelligence",
  "inspection_intelligence",
  "project_controls",
  "digital_twin",
];

export type EngineeringModuleRegistration = ModuleManifest & {
  moduleKey: EngineeringInitialModuleKey | string;
  /** Commerce bridge — maps to commercial application_key / app install. */
  commerceApplicationKey: string;
  status: EngineeringModuleStatus;
};

export interface EngineeringModuleRegistrySnapshot {
  operatingSystemId: "engineering";
  modules: EngineeringModuleRegistration[];
  registeredAt: string;
}

export function toModuleManifest(
  registration: EngineeringModuleRegistration,
): ModuleManifest {
  const { commerceApplicationKey: _c, status: _s, ...manifest } = registration;
  return manifest;
}

export function assertModuleDoesNotBypassEngineeringOs(
  registration: EngineeringModuleRegistration,
): void {
  if (registration.operatingSystemId !== "engineering") {
    throw new Error(`Module ${registration.moduleKey} must register under engineering OS`);
  }
  for (const route of registration.routes ?? []) {
    if (!route.path.startsWith("/engineering")) {
      throw new Error(
        `Module ${registration.moduleKey} route ${route.path} must be under /engineering`,
      );
    }
  }
}
