import type { SupabaseClient } from "@rtb/database";
import {
  BillingRepository,
  InstallationRepository,
  ApplicationInstallationRepository,
  LicenseRepository,
  MarketplaceRepository,
  OutboxRepository,
  PlanRepository,
  ProductRepository,
  SeatAssignmentRepository,
  SeatRepository,
  SubscriptionRepository,
  UsageRepository,
} from "./repositories";
import { SubscriptionChangeRepository } from "./repositories/subscription-change-repository";
import { EntitlementVersionRepository } from "./repositories/entitlement-version-repository";
import { InstallationVersionRepository } from "./repositories/installation-version-repository";
import {
  EntitlementOverrideRepository,
  PlanEntitlementRepository,
  ProductApplicationRepository,
} from "./repositories/entitlement-repository";
import { CommerceAuditService } from "./services/commerce-audit-service";
import { AnalyticsService } from "./services/analytics-service";
import { BillingService } from "./services/billing-service";
import { CatalogDataService } from "./services/catalog-data-service";
import { CommerceEventService } from "./services/commerce-event-service";
import { CommerceOutboxProcessor } from "./services/commerce-outbox-processor";
import { CommerceSchedulerService } from "./services/commerce-scheduler-service";
import { EntitlementCache } from "./services/entitlement-cache";
import { EntitlementService } from "./services/entitlement-service";
import { InstallationService } from "./services/installation-service";
import { InstallationLifecycleService } from "./services/installation-lifecycle-service";
import { ApplicationInstallationLifecycleService } from "./services/application-installation-lifecycle-service";
import { InstallationHealthService } from "./services/installation-health-service";
import { InstallationDependencyResolver } from "./services/installation-dependency-resolver";
import { ProvisioningOrchestrator } from "./services/provisioning-orchestrator";
import { LicenseIssuanceService } from "./services/license-issuance-service";
import { LicenseService } from "./services/license-service";
import { MarketplaceService } from "./services/marketplace-service";
import { PlanService } from "./services/plan-service";
import { ProductService } from "./services/product-service";
import { SeatAssignmentService } from "./services/seat-assignment-service";
import { SeatService } from "./services/seat-service";
import { SubscriptionChangeService } from "./services/subscription-change-service";
import { SubscriptionLifecycleService } from "./services/subscription-lifecycle-service";
import { SubscriptionService } from "./services/subscription-service";
import { TrialService } from "./services/trial-service";
import { UsageService } from "./services/usage-service";

export function createPlatformCommerce(supabase: SupabaseClient) {
  const products = new ProductRepository(supabase);
  const plans = new PlanRepository(supabase);
  const subscriptions = new SubscriptionRepository(supabase);
  const subscriptionChangesRepo = new SubscriptionChangeRepository(supabase);
  const licenses = new LicenseRepository(supabase);
  const seats = new SeatRepository(supabase);
  const seatAssignments = new SeatAssignmentRepository(supabase);
  const installations = new InstallationRepository(supabase);
  const applicationInstallations = new ApplicationInstallationRepository(supabase);
  const usage = new UsageRepository(supabase);
  const billing = new BillingRepository(supabase);
  const marketplace = new MarketplaceRepository(supabase);
  const outbox = new OutboxRepository(supabase);
  const planEntitlements = new PlanEntitlementRepository(supabase);
  const entitlementOverrides = new EntitlementOverrideRepository(supabase);
  const productApplications = new ProductApplicationRepository(supabase);

  const cache = new EntitlementCache();
  const entitlementVersions = new EntitlementVersionRepository(supabase);
  const installationVersions = new InstallationVersionRepository(supabase);
  const events = new CommerceEventService(outbox);
  const outboxProcessor = new CommerceOutboxProcessor(outbox);
  const provisioning = new ProvisioningOrchestrator(supabase);
  const installationDependencies = new InstallationDependencyResolver(supabase, installations);

  const lifecycle = new SubscriptionLifecycleService(subscriptions, events, cache, entitlementVersions);
  const licenceIssuance = new LicenseIssuanceService(
    licenses,
    planEntitlements,
    seats,
    events,
    cache
  );
  const entitlements = new EntitlementService(
    subscriptions,
    licenses,
    seats,
    seatAssignments,
    planEntitlements,
    entitlementOverrides,
    productApplications,
    cache,
    installations,
    entitlementVersions,
    installationVersions
  );
  const installationLifecycle = new InstallationLifecycleService(
    installations,
    subscriptions,
    licenses,
    products,
    events,
    cache,
    installationVersions,
    provisioning,
    installationDependencies,
    supabase
  );
  const installationHealth = new InstallationHealthService(
    installations,
    subscriptions,
    licenses,
    supabase
  );
  const applicationInstallationLifecycle = new ApplicationInstallationLifecycleService(
    applicationInstallations,
    installations,
    subscriptions,
    licenses,
    productApplications,
    events,
    cache,
    installationVersions,
    provisioning,
    installationHealth,
    supabase
  );
  const seatAssignment = new SeatAssignmentService(
    seats,
    seatAssignments,
    subscriptions,
    licenses,
    events,
    cache,
    entitlementVersions
  );
  const trials = new TrialService(subscriptions, lifecycle, licenceIssuance, events);
  const subscriptionChanges = new SubscriptionChangeService(
    subscriptions,
    subscriptionChangesRepo,
    planEntitlements,
    licenses,
    licenceIssuance,
    events,
    cache
  );

  const api = {
    products: new ProductService(products),
    plans: new PlanService(plans),
    subscriptions: new SubscriptionService(subscriptions),
    lifecycle,
    subscriptionChanges,
    licences: licenceIssuance,
    licenses: new LicenseService(licenses),
    seats: new SeatService(seats),
    seatAssignment,
    entitlements,
    trials,
    installations: new InstallationService(installations),
    installationLifecycle,
    applicationInstallationLifecycle,
    installationHealth,
    usage: new UsageService(usage),
    billing: new BillingService(billing),
    marketplace: new MarketplaceService(marketplace),
    analytics: new AnalyticsService(subscriptions, seats, installations, usage, billing),
    audit: new CommerceAuditService(subscriptions, outbox),
    catalog: new CatalogDataService(
      products,
      plans,
      subscriptions,
      licenses,
      seats,
      installations,
      usage
    ),
    events,
    outboxProcessor,
    scheduler: null as CommerceSchedulerService | null,
  };

  api.scheduler = new CommerceSchedulerService(api, outboxProcessor, cache, installationLifecycle, installationHealth);
  return api;
}

export type PlatformCommerce = ReturnType<typeof createPlatformCommerce>;
