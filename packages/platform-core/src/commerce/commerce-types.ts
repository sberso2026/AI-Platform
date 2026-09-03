import type { OperatingSystemId } from "@rtb/types";

/** Subscription lifecycle — maps to future `commercial_subscriptions` */
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "expired";

/** Licence lifecycle — maps to future `commercial_licenses` */
export type LicenceStatus = "active" | "suspended" | "expired";

/** Installation lifecycle — maps to commercial_installations.status */
export type InstallationStatus =
  | "not_installed"
  | "requested"
  | "provisioning"
  | "validating"
  | "active"
  | "degraded"
  | "suspended"
  | "failed"
  | "uninstalling"
  | "uninstalled"
  /** @deprecated legacy Phase 2 */
  | "installing"
  /** @deprecated legacy Phase 2 */
  | "healthy";

export type ProductCatalogTab =
  | "installed"
  | "available"
  | "trials"
  | "coming_soon";

export type CommercialActionId =
  | "open"
  | "manage"
  | "install"
  | "start_trial"
  | "seat_required"
  | "request_quote"
  | "upgrade"
  | "manage_seats"
  | "view_usage"
  | "view_billing"
  | "renew"
  | "contact_support";

export interface SeatUsage {
  assigned: number;
  total: number;
}

/** UI view model — decoupled from OS registry shape */
export interface CommercialProductView {
  slug: string;
  /** Legacy OS registry id when product maps to an operating system */
  osId?: OperatingSystemId;
  name: string;
  productType: string;
  description: string;
  edition?: string;
  subscriptionStatus: SubscriptionStatus;
  licenceStatus: LicenceStatus;
  installationStatus: InstallationStatus;
  version?: string;
  seatUsage?: SeatUsage;
  renewalDate?: string;
  includedApplications: string[];
  installedApplications: string[];
  usageSummary?: string;
  catalogTab: ProductCatalogTab;
  icon: string;
  openHref?: string;
  manageHref?: string;
  trialEligible: boolean;
  primaryAction?: CommercialActionId;
  secondaryAction?: CommercialActionId;
  /** Canonical commercial_products.id when mapping from Platform Commerce */
  productId?: string;
  /** Whether the current user holds an active seat for this product (or its parent OS). */
  currentUserSeated?: boolean;
  /** Hidden-marketplace / certification fixture shown only because the tenant is entitled */
  certificationOnly?: boolean;
}

export interface CommercialApplicationView {
  appKey: string;
  name: string;
  description: string;
  version?: string;
  subscriptionStatus?: SubscriptionStatus;
  licenceStatus: LicenceStatus;
  installationStatus: InstallationStatus;
  section: "installed" | "available";
  openHref?: string;
  primaryAction?: CommercialActionId;
  secondaryAction?: CommercialActionId;
}

export interface CommercialCatalogSummary {
  installedProducts: number;
  installedApplications: number;
  assignedSeats: number;
  totalSeats: number;
  renewalDate?: string;
  currentPlan?: string;
}

export interface EngineeringApplicationSeed {
  app_key: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  routes?: readonly string[];
}

export interface CommerceAdapterContext {
  roleSlug: string;
  engineeringOsEnabled: boolean;
  engineeringEdition?: string;
  engineeringVersion?: string;
  engineeringApplications?: EngineeringApplicationSeed[];
  seatUsage?: SeatUsage;
  renewalDate?: string;
  currentPlan?: string;
  /** Product IDs (OS or parent OS) where the current user has an active seat */
  seatedProductIds?: string[];
}

/** Future Platform Commerce table shapes (adapter target contract) */
export interface CommercialProductRecord {
  id: string;
  slug: string;
  name: string;
  product_type: string;
  description: string;
  icon?: string;
  lifecycle_status?: string;
  marketplace_visible?: boolean;
}

export interface CommercialPlanRecord {
  id: string;
  product_id: string;
  edition: string;
}

export interface CommercialSubscriptionRecord {
  id: string;
  product_id: string;
  status: SubscriptionStatus;
  renewal_date?: string;
  plan_id?: string;
}

export interface CommercialLicenseRecord {
  id: string;
  product_id: string;
  status: LicenceStatus;
  license_type?: string;
  application_key?: string;
}

export interface ProductInstallationRecord {
  id: string;
  product_id: string;
  status: InstallationStatus;
  version?: string;
  installed_version?: string;
}

export interface ApplicationInstallationRecord {
  id: string;
  application_key: string;
  status: InstallationStatus;
  version?: string;
}

export interface CommercialSeatPoolRecord {
  id: string;
  product_id: string;
  assigned: number;
  total: number;
}

export interface CommercialUsageAggregateRecord {
  id: string;
  product_id: string;
  summary: string;
}

export interface PlatformCommerceData {
  commercial_products?: CommercialProductRecord[];
  commercial_plans?: CommercialPlanRecord[];
  commercial_subscriptions?: CommercialSubscriptionRecord[];
  commercial_licenses?: CommercialLicenseRecord[];
  product_installations?: ProductInstallationRecord[];
  application_installations?: ApplicationInstallationRecord[];
  commercial_seat_pools?: CommercialSeatPoolRecord[];
  commercial_usage_aggregates?: CommercialUsageAggregateRecord[];
  current_user_seated_product_ids?: string[];
}
