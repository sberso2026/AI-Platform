import type { OperatingSystem } from "@rtb/types";
import { OPERATING_SYSTEMS } from "../operating-systems";
import type {
  CommercialActionId,
  CommercialApplicationView,
  CommercialCatalogSummary,
  CommercialProductView,
  CommerceAdapterContext,
  EngineeringApplicationSeed,
  InstallationStatus,
  LicenceStatus,
  PlatformCommerceData,
  ProductCatalogTab,
  SubscriptionStatus,
} from "./commerce-types";

const OS_PRODUCT_SLUG: Record<string, string> = {
  engineering: "engineering-os",
  business: "business-os",
  industrial: "industrial-os",
  fleet: "fleet-os",
  infrastructure: "infrastructure-os",
  "smart-building": "smart-building-os",
  "smart-city": "smart-city-os",
  autonomous: "autonomous-os",
};

const AVAILABLE_ENGINEERING_APP_KEYS = new Set([
  "inspection_intelligence",
  "project_controls",
  "digital_twin",
  "asset_intelligence",
  "meeting_intelligence",
  "document_intelligence",
  "structural_intelligence",
  "standards_intelligence",
]);

/** Display alias for standards_intelligence per commerce UI spec */
const APPLICATION_DISPLAY_NAMES: Record<string, string> = {
  standards_intelligence: "Engineering Knowledge",
  project_intelligence: "Project Intelligence",
  inspection_intelligence: "Inspection Intelligence",
  project_controls: "Project Controls",
  documents: "Documents",
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  trialing: "Trialing",
  active: "Active",
  past_due: "Past Due",
  cancelled: "Cancelled",
  expired: "Expired",
};

export const LICENCE_STATUS_LABELS: Record<LicenceStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  expired: "Expired",
};

export const INSTALLATION_STATUS_LABELS: Record<string, string> = {
  not_installed: "Not Installed",
  requested: "Requested",
  provisioning: "Provisioning",
  validating: "Validating",
  active: "Active",
  installing: "Provisioning",
  healthy: "Active",
  degraded: "Degraded",
  suspended: "Suspended",
  failed: "Failed",
  uninstalling: "Uninstalling",
  uninstalled: "Uninstalled",
};

export const CATALOG_TAB_LABELS: Record<ProductCatalogTab, string> = {
  installed: "Installed",
  available: "Available",
  trials: "Trials",
  coming_soon: "Coming Soon",
};

export function productSlugForOsId(osId: string): string {
  return OS_PRODUCT_SLUG[osId] ?? osId;
}

export function osIdForProductSlug(slug: string): string | undefined {
  const entry = Object.entries(OS_PRODUCT_SLUG).find(([, s]) => s === slug);
  return entry?.[0];
}

function displayAppName(app: EngineeringApplicationSeed): string {
  return APPLICATION_DISPLAY_NAMES[app.app_key] ?? app.name;
}

function resolveEngineeringCatalogTab(
  os: OperatingSystem,
  context: CommerceAdapterContext
): ProductCatalogTab {
  if (os.id === "engineering" && context.engineeringOsEnabled) {
    return "installed";
  }
  if (os.status === "coming_soon") return "coming_soon";
  if (os.status === "available") return "available";
  return "coming_soon";
}

function resolveGenericCatalogTab(os: OperatingSystem): ProductCatalogTab {
  if (os.status === "installed") return "installed";
  if (os.status === "coming_soon") return "coming_soon";
  return "available";
}

function buildEngineeringProduct(
  os: OperatingSystem,
  context: CommerceAdapterContext
): CommercialProductView {
  const apps = context.engineeringApplications ?? [];
  const installedApps = apps.filter((a) => a.enabled).map(displayAppName);
  const includedApps = apps.map(displayAppName);
  const seats = context.seatUsage ?? { assigned: 12, total: 25 };

  return {
    slug: "engineering-os",
    osId: "engineering",
    name: os.name,
    productType: "Operating System",
    description: os.description,
    edition: context.engineeringEdition ?? "Enterprise",
    subscriptionStatus: "active",
    licenceStatus: "active",
    installationStatus: "active",
    version: context.engineeringVersion ?? os.version ?? "0.2.0",
    seatUsage: seats,
    renewalDate: context.renewalDate ?? "2027-01-01",
    includedApplications: includedApps,
    installedApplications: installedApps,
    usageSummary: "Core engineering workspace active",
    catalogTab: resolveEngineeringCatalogTab(os, context),
    icon: os.icon,
    openHref: "/engineering",
    manageHref: "/system/products/engineering-os",
    trialEligible: false,
    primaryAction: "open",
    secondaryAction: "manage",
  };
}

function buildPlaceholderProduct(
  os: OperatingSystem,
  catalogTab: ProductCatalogTab
): CommercialProductView {
  const slug = productSlugForOsId(os.id);
  const isComingSoon = catalogTab === "coming_soon";
  const isAvailable = catalogTab === "available";
  const isTrial = catalogTab === "trials";

  return {
    slug,
    osId: os.id,
    name: os.name,
    productType: "Operating System",
    description: os.description,
    edition: isComingSoon ? undefined : "Standard",
    subscriptionStatus: isTrial ? "trialing" : isComingSoon ? "expired" : "expired",
    licenceStatus: isComingSoon ? "expired" : "active",
    installationStatus: isComingSoon ? "not_installed" : "not_installed",
    version: os.version,
    includedApplications: [],
    installedApplications: [],
    usageSummary: isComingSoon ? undefined : "Not yet provisioned",
    catalogTab,
    icon: os.icon,
    trialEligible: isAvailable || isTrial,
    primaryAction: isComingSoon
      ? undefined
      : isTrial
        ? "open"
        : isAvailable
          ? "start_trial"
          : undefined,
    secondaryAction: isComingSoon
      ? "contact_support"
      : isAvailable
        ? "request_quote"
        : undefined,
  };
}

/**
 * Maps legacy OS registry (+ optional engineering seed data) into commerce view models.
 * When Platform Commerce tables are available, pass `commerceData` to override registry mapping.
 */
export function mapRegistryToCommercialProducts(
  context: CommerceAdapterContext,
  commerceData?: PlatformCommerceData
): CommercialProductView[] {
  if (commerceData?.commercial_products?.length) {
    return mapFromPlatformCommerce(commerceData, context);
  }

  const products: CommercialProductView[] = [];

  for (const os of OPERATING_SYSTEMS) {
    if (os.id === "platform") continue;

    if (os.id === "engineering") {
      products.push(buildEngineeringProduct(os, context));
      continue;
    }

    const catalogTab = resolveGenericCatalogTab(os);
    products.push(buildPlaceholderProduct(os, catalogTab));
  }

  return products;
}

const APPLICATION_OPEN_HREFS: Record<string, string> = {
  "engineering-os": "/engineering",
  "project-intelligence": "/engineering/apps/project-intelligence",
  "inspection-intelligence": "/engineering/apps/inspection-intelligence",
};

function slugToAppKey(slug: string): string {
  return slug.replace(/-/g, "_");
}

function displayNameForAppKey(appKey: string): string {
  if (APPLICATION_DISPLAY_NAMES[appKey]) return APPLICATION_DISPLAY_NAMES[appKey];
  return appKey
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isOperatingSystemType(productType: string): boolean {
  return /operating[_ ]system/i.test(productType);
}

function isApplicationType(productType: string): boolean {
  return /application/i.test(productType);
}

function isSubscriptionAccessGranting(status?: SubscriptionStatus): boolean {
  return status === "active" || status === "trialing" || status === "past_due";
}

function tenantEntitledToProduct(
  product: { id: string; slug: string },
  data: PlatformCommerceData
): boolean {
  if (data.commercial_subscriptions?.some((s) => s.product_id === product.id && isSubscriptionAccessGranting(s.status))) {
    return true;
  }
  if (data.commercial_licenses?.some((l) => l.product_id === product.id && l.status === "active")) {
    return true;
  }
  if (data.product_installations?.some((i) => i.product_id === product.id && isInstallationAccessGranting(i.status))) {
    return true;
  }
  const appKey = slugToAppKey(product.slug);
  return Boolean(
    data.commercial_licenses?.some(
      (l) => l.license_type === "application" && l.application_key === appKey && l.status === "active"
    )
  );
}

function shouldExposeCatalogProduct(
  product: { id: string; slug: string; lifecycle_status?: string; marketplace_visible?: boolean },
  data: PlatformCommerceData
): boolean {
  if (tenantEntitledToProduct(product, data)) return true;
  if (product.lifecycle_status === "draft" || product.lifecycle_status === "retired") return false;
  if (product.marketplace_visible === false) return false;
  return true;
}

function resolveOpenHref(slug: string): string {
  return APPLICATION_OPEN_HREFS[slug] ?? `/system/products/${slug}`;
}

function resolveProductActions(input: {
  catalogTab: ProductCatalogTab;
  productType: string;
  subscriptionStatus?: SubscriptionStatus;
  installationStatus?: string;
  currentUserSeated: boolean;
  roleSlug: string;
  seatRequired: boolean;
}): { primary?: CommercialActionId; secondary?: CommercialActionId } {
  if (input.catalogTab === "installed") {
    if (!input.seatRequired || input.currentUserSeated) {
      return { primary: "open", secondary: "manage" };
    }
    if (canManageSeats(input.roleSlug)) {
      return { primary: "manage_seats", secondary: "manage" };
    }
    return { primary: "seat_required", secondary: "manage" };
  }

  if (
    isSubscriptionAccessGranting(input.subscriptionStatus) &&
    !isInstallationAccessGranting(input.installationStatus)
  ) {
    return { primary: "install", secondary: "manage" };
  }

  if (input.catalogTab === "available") {
    if (isApplicationType(input.productType)) {
      return { primary: "request_quote", secondary: "contact_support" };
    }
    return { primary: "start_trial", secondary: "request_quote" };
  }

  if (input.catalogTab === "trials") {
    return { primary: "open", secondary: "manage" };
  }

  return { primary: undefined, secondary: "contact_support" };
}

function mapFromPlatformCommerce(
  data: PlatformCommerceData,
  context: CommerceAdapterContext
): CommercialProductView[] {
  const seatedIds = new Set([
    ...(context.seatedProductIds ?? []),
    ...(data.current_user_seated_product_ids ?? []),
  ]);

  return (data.commercial_products ?? [])
    .filter((product) => shouldExposeCatalogProduct(product, data))
    .map((product) => {
      const appKey = slugToAppKey(product.slug);
      const appLicense = data.commercial_licenses?.find(
        (l) => l.license_type === "application" && l.application_key === appKey && l.status === "active"
      );
      const parentProductId = isApplicationType(product.product_type)
        ? appLicense?.product_id ?? product.id
        : product.id;

      const subscription = data.commercial_subscriptions?.find((s) => s.product_id === parentProductId);
      const plan =
        data.commercial_plans?.find((p) => subscription?.plan_id && p.id === subscription.plan_id) ??
        data.commercial_plans?.find((p) => p.product_id === parentProductId);
      const productLicense = data.commercial_licenses?.find(
        (l) => l.product_id === parentProductId && (l.license_type === "product" || !l.license_type)
      );
      const license = appLicense ?? productLicense;
      const installation = data.product_installations?.find((i) => i.product_id === parentProductId);
      const appInstallation = data.application_installations?.find((i) => i.application_key === appKey);
      const seats = data.commercial_seat_pools?.find((s) => s.product_id === parentProductId);
      const usage = data.commercial_usage_aggregates?.find((u) => u.product_id === parentProductId);

      const catalogTab = resolveCatalogTabFromProduct(
        product.lifecycle_status,
        subscription?.status,
        installation?.status,
        Boolean(license && license.status === "active" && isInstallationAccessGranting(installation?.status))
      );

      const installedAppNames = (data.commercial_licenses ?? [])
        .filter(
          (l) =>
            l.product_id === parentProductId &&
            l.license_type === "application" &&
            l.status === "active" &&
            l.application_key
        )
        .map((l) => displayNameForAppKey(l.application_key as string));

      const mappedOsId = osIdForProductSlug(product.slug);
      const currentUserSeated = seatedIds.has(parentProductId);
      const seatRequired = Boolean(seats && seats.total > 0);
      const actions = resolveProductActions({
        catalogTab,
        productType: product.product_type,
        subscriptionStatus: subscription?.status,
        installationStatus: installation?.status,
        currentUserSeated,
        roleSlug: context.roleSlug,
        seatRequired,
      });

      return {
        slug: product.slug,
        productId: product.id,
        osId: mappedOsId as CommercialProductView["osId"],
        name: product.name,
        productType: product.product_type,
        description: product.description,
        edition: plan?.edition,
        subscriptionStatus: subscription?.status ?? "expired",
        licenceStatus: license?.status ?? "expired",
        installationStatus: normalizeInstallationStatus(
          isApplicationType(product.product_type)
            ? appInstallation?.status ?? installation?.status
            : installation?.status
        ),
        version: installation?.installed_version ?? installation?.version,
        seatUsage: seats ? { assigned: seats.assigned, total: seats.total } : undefined,
        renewalDate: subscription?.renewal_date,
        includedApplications: installedAppNames,
        installedApplications: isOperatingSystemType(product.product_type) ? installedAppNames : [],
        usageSummary: usage?.summary,
        catalogTab,
        icon: product.icon ?? "Boxes",
        openHref: resolveOpenHref(product.slug),
        manageHref: `/system/products/${product.slug}`,
        trialEligible: catalogTab === "available" && isOperatingSystemType(product.product_type),
        primaryAction: actions.primary,
        secondaryAction: actions.secondary,
        currentUserSeated,
        certificationOnly: product.marketplace_visible === false,
      };
    });
}

function normalizeInstallationStatus(status?: string): InstallationStatus {
  if (!status) return "not_installed";
  if (status === "healthy") return "active";
  if (status === "installing" || status === "queued") return "provisioning";
  return status as InstallationStatus;
}

function isInstallationAccessGranting(status?: string): boolean {
  const normalized = normalizeInstallationStatus(status);
  return normalized === "active" || normalized === "degraded";
}

function resolveCatalogTabFromProduct(
  lifecycleStatus: string | undefined,
  subscriptionStatus?: SubscriptionStatus,
  installationStatus?: string,
  licensedAndInstalled = false
): ProductCatalogTab {
  const entitledAndInstalled =
    licensedAndInstalled ||
    (isSubscriptionAccessGranting(subscriptionStatus) && isInstallationAccessGranting(installationStatus));
  if (entitledAndInstalled) return "installed";
  if (subscriptionStatus === "trialing") return "trials";
  if (isSubscriptionAccessGranting(subscriptionStatus)) return "available";
  if (lifecycleStatus === "draft" || lifecycleStatus === "retired") return "coming_soon";
  if (lifecycleStatus === "preview") return "coming_soon";
  if (lifecycleStatus === "active") return "available";
  return "coming_soon";
}

export function filterProductsByTab(
  products: CommercialProductView[],
  tab: ProductCatalogTab
): CommercialProductView[] {
  return products.filter((p) => p.catalogTab === tab);
}

export function buildCatalogSummary(
  products: CommercialProductView[],
  context: CommerceAdapterContext
): CommercialCatalogSummary {
  const installed = products.filter((p) => p.catalogTab === "installed");
  const installedOs = installed.filter((p) => isOperatingSystemType(p.productType));
  const installedAppProducts = installed.filter((p) => isApplicationType(p.productType));
  const appNames = new Set<string>();
  for (const product of installedOs) {
    for (const name of product.installedApplications) appNames.add(name);
  }
  for (const product of installedAppProducts) {
    appNames.add(product.name);
  }
  const seatTotals = installedOs.reduce(
    (acc, p) => {
      if (p.seatUsage) {
        acc.assigned += p.seatUsage.assigned;
        acc.total += p.seatUsage.total;
      }
      return acc;
    },
    { assigned: 0, total: 0 }
  );

  const engineering = installed.find((p) => p.osId === "engineering" || p.slug === "engineering-os");

  return {
    installedProducts: installedOs.length,
    installedApplications: appNames.size,
    assignedSeats: seatTotals.assigned || context.seatUsage?.assigned || 0,
    totalSeats: seatTotals.total || context.seatUsage?.total || 0,
    renewalDate: engineering?.renewalDate ?? context.renewalDate,
    currentPlan: context.currentPlan ?? engineering?.edition ?? "Enterprise",
  };
}

export function getProductBySlug(
  products: CommercialProductView[],
  slug: string
): CommercialProductView | undefined {
  return products.find((p) => p.slug === slug);
}

export function mapEngineeringApplications(
  apps: EngineeringApplicationSeed[],
  context: CommerceAdapterContext
): CommercialApplicationView[] {
  const views: CommercialApplicationView[] = [];

  for (const app of apps) {
    const displayName = displayAppName(app);

    if (app.enabled) {
      views.push({
        appKey: app.app_key,
        name: displayName,
        description: app.description,
        version: app.version,
        licenceStatus: "active",
        installationStatus: "active",
        section: "installed",
        openHref: app.routes?.[0],
        primaryAction: "open",
        secondaryAction: canManageApplications(context.roleSlug)
          ? "manage"
          : undefined,
      });
      continue;
    }

    if (app.app_key === "project_intelligence" || app.app_key === "engineering_reports") {
      continue;
    }

    if (AVAILABLE_ENGINEERING_APP_KEYS.has(app.app_key)) {
      views.push({
        appKey: app.app_key,
        name: displayName,
        description: app.description,
        version: app.version,
        licenceStatus: "expired",
        installationStatus: "not_installed",
        section: "available",
        primaryAction: canManageApplications(context.roleSlug)
          ? "install"
          : undefined,
        secondaryAction: canManageApplications(context.roleSlug)
          ? "start_trial"
          : "request_quote",
      });
    }
  }

  return views;
}

export function filterApplicationsBySection(
  apps: CommercialApplicationView[],
  section: "installed" | "available"
): CommercialApplicationView[] {
  return apps.filter((a) => a.section === section);
}

export function canManageApplications(roleSlug: string): boolean {
  return roleSlug === "owner" || roleSlug === "admin";
}

export function canManageBilling(roleSlug: string): boolean {
  return roleSlug === "owner";
}

export function canManageLicences(roleSlug: string): boolean {
  return roleSlug === "owner";
}

export function canManageSeats(roleSlug: string): boolean {
  return roleSlug === "owner" || roleSlug === "admin";
}

export function canManageProducts(roleSlug: string): boolean {
  return roleSlug === "owner" || roleSlug === "admin";
}

export function isActionVisible(
  action: CommercialActionId,
  roleSlug: string
): boolean {
  switch (action) {
    case "open":
      return true;
    case "manage":
    case "install":
    case "upgrade":
      return canManageProducts(roleSlug);
    case "manage_seats":
    case "view_usage":
      return canManageSeats(roleSlug);
    case "view_billing":
    case "renew":
      return canManageBilling(roleSlug);
    case "start_trial":
    case "request_quote":
      return canManageProducts(roleSlug);
    case "seat_required":
      return true;
    case "contact_support":
      return true;
    default:
      return false;
  }
}

export const COMMERCIAL_ACTION_LABELS: Record<CommercialActionId, string> = {
  open: "Open",
  manage: "Manage",
  install: "Install",
  start_trial: "Start Trial",
  seat_required: "Seat required",
  request_quote: "Request Quote",
  upgrade: "Upgrade",
  manage_seats: "Manage Seats",
  view_usage: "View Usage",
  view_billing: "View Billing",
  renew: "Renew",
  contact_support: "Contact Support",
};
