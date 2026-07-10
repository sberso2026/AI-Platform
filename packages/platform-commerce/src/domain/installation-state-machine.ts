import type { ApplicationInstallationStatus, ProductInstallationStatus } from "@rtb/types";
import { InvalidInstallationTransitionError } from "./errors";

const PRODUCT_TRANSITIONS: Record<ProductInstallationStatus, ProductInstallationStatus[]> = {
  not_installed: ["requested", "awaiting_entitlement"],
  requested: ["awaiting_entitlement", "awaiting_approval", "queued", "failed"],
  awaiting_entitlement: ["awaiting_approval", "queued", "failed"],
  awaiting_approval: ["queued", "failed"],
  queued: ["provisioning", "failed"],
  provisioning: ["validating", "failed", "degraded"],
  validating: ["active", "failed", "degraded"],
  active: ["degraded", "suspended", "upgrade_pending", "uninstall_pending"],
  degraded: ["active", "suspended", "failed", "uninstall_pending"],
  suspended: ["active", "uninstall_pending"],
  upgrade_pending: ["upgrading", "active", "failed"],
  upgrading: ["validating", "active", "failed", "rollback_pending"],
  rollback_pending: ["rolling_back", "active", "failed"],
  rolling_back: ["validating", "active", "failed"],
  failed: ["requested", "queued", "uninstall_pending"],
  uninstall_pending: ["uninstalling"],
  uninstalling: ["uninstalled"],
  uninstalled: ["requested"],
};

const APP_TRANSITIONS: Record<ApplicationInstallationStatus, ApplicationInstallationStatus[]> = {
  not_installed: ["requested", "awaiting_entitlement"],
  requested: ["awaiting_parent", "awaiting_entitlement", "queued", "failed"],
  awaiting_parent: ["awaiting_entitlement", "queued", "failed"],
  awaiting_entitlement: ["queued", "failed"],
  queued: ["provisioning", "failed"],
  provisioning: ["validating", "failed", "degraded"],
  validating: ["active", "failed", "degraded"],
  active: ["degraded", "suspended", "upgrade_pending", "uninstall_pending"],
  degraded: ["active", "suspended", "failed", "uninstall_pending"],
  suspended: ["active", "uninstall_pending"],
  upgrade_pending: ["upgrading", "active", "failed"],
  upgrading: ["validating", "active", "failed"],
  failed: ["requested", "queued", "uninstall_pending"],
  uninstall_pending: ["uninstalling"],
  uninstalling: ["uninstalled"],
  uninstalled: ["requested"],
};

const PRODUCT_EVENTS: Partial<Record<string, string>> = {
  "not_installed→requested": "installation.requested",
  "requested→queued": "installation.queued",
  "queued→provisioning": "installation.provisioning_started",
  "provisioning→validating": "installation.validating",
  "validating→active": "installation.activated",
  "active→suspended": "installation.suspended",
  "suspended→active": "installation.resumed",
  "active→uninstall_pending": "installation.uninstall_requested",
  "uninstall_pending→uninstalling": "installation.uninstalling",
  "uninstalling→uninstalled": "installation.uninstalled",
  "provisioning→failed": "installation.failed",
  "validating→failed": "installation.failed",
};

export class InstallationStateMachine {
  static canTransitionProduct(from: ProductInstallationStatus, to: ProductInstallationStatus): boolean {
    return PRODUCT_TRANSITIONS[from]?.includes(to) ?? false;
  }

  static assertProductTransition(from: ProductInstallationStatus, to: ProductInstallationStatus): void {
    if (!this.canTransitionProduct(from, to)) {
      throw new InvalidInstallationTransitionError(from, to);
    }
  }

  static canTransitionApp(from: ApplicationInstallationStatus, to: ApplicationInstallationStatus): boolean {
    return APP_TRANSITIONS[from]?.includes(to) ?? false;
  }

  static assertAppTransition(from: ApplicationInstallationStatus, to: ApplicationInstallationStatus): void {
    if (!this.canTransitionApp(from, to)) {
      throw new InvalidInstallationTransitionError(from, to);
    }
  }

  static eventTypeForProductTransition(from: ProductInstallationStatus, to: ProductInstallationStatus): string {
    return PRODUCT_EVENTS[`${from}→${to}`] ?? "installation.status_changed";
  }

  static isAccessGranting(status: ProductInstallationStatus): boolean {
    return status === "active" || status === "degraded";
  }

  static normalizeAppStatus(status: string): ApplicationInstallationStatus {
    if (status === "healthy") return "active";
    if (status === "installing") return "provisioning";
    return status as ApplicationInstallationStatus;
  }
}
