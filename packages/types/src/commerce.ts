/**
 * RTB Platform Commerce Engine — Domain Types
 * Shared contracts for services, APIs, and UI adapters.
 */

// ─── Catalog ─────────────────────────────────────────────────────────────────

export type CommercialProductType =
  | "operating_system"
  | "application"
  | "addon"
  | "service"
  | "bundle";

export type ProductLifecycleStatus =
  | "draft"
  | "preview"
  | "active"
  | "deprecated"
  | "retired";

export type ProductVisibility = "private" | "tenant" | "marketplace" | "public";

export type PlanEdition =
  | "free"
  | "trial"
  | "starter"
  | "professional"
  | "business"
  | "enterprise"
  | "custom";

export type BillingModel = "free" | "flat" | "seat" | "usage" | "hybrid" | "custom";

export type BillingPeriod =
  | "monthly"
  | "annual"
  | "multi_year"
  | "one_time"
  | "custom";

export type ReleaseChannel = "alpha" | "beta" | "stable" | "lts";

export interface CommercialCategory {
  id: string;
  tenant_id?: string | null;
  parent_id?: string | null;
  slug: string;
  name: string;
  description?: string | null;
  sort_order: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CommercialProduct {
  id: string;
  tenant_id?: string | null;
  category_id?: string | null;
  slug: string;
  name: string;
  product_type: CommercialProductType;
  description?: string | null;
  icon?: string | null;
  lifecycle_status: ProductLifecycleStatus;
  visibility: ProductVisibility;
  marketplace_visible: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CommercialProductVersion {
  id: string;
  product_id: string;
  version: string;
  release_channel: ReleaseChannel;
  changelog?: string | null;
  is_current: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CommercialPlan {
  id: string;
  product_id: string;
  slug: string;
  name: string;
  edition: PlanEdition;
  description?: string | null;
  billing_model: BillingModel;
  trial_days?: number | null;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CommercialPlanPrice {
  id: string;
  plan_id: string;
  currency: string;
  billing_period: BillingPeriod;
  amount_cents: number;
  seat_price_cents?: number | null;
  usage_unit_price_cents?: number | null;
  min_seats?: number | null;
  max_seats?: number | null;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

export type SubscriptionStatus =
  | "draft"
  | "pending_activation"
  | "trialing"
  | "active"
  | "past_due"
  | "grace_period"
  | "paused"
  | "suspended"
  | "scheduled_cancellation"
  | "cancelled"
  | "expired"
  | "pending_renewal"
  | "pending_payment"
  /** @deprecated use trialing */
  | "trial";

export interface CommercialSubscription {
  id: string;
  tenant_id: string;
  workspace_id?: string | null;
  product_id: string;
  plan_id?: string | null;
  status: SubscriptionStatus;
  billing_period?: string | null;
  quantity: number;
  current_period_start?: string | null;
  current_period_end?: string | null;
  renewal_date?: string | null;
  cancelled_at?: string | null;
  trial_ends_at?: string | null;
  trial_start?: string | null;
  trial_end?: string | null;
  activated_at?: string | null;
  expired_at?: string | null;
  cancellation_requested_at?: string | null;
  cancel_at_period_end?: boolean;
  cancellation_effective_at?: string | null;
  paused_at?: string | null;
  suspended_at?: string | null;
  grace_period_end?: string | null;
  plan_snapshot_json?: Record<string, unknown>;
  scheduled_plan_id?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CommercialSubscriptionEvent {
  id: string;
  tenant_id: string;
  subscription_id: string;
  event_type: string;
  from_status?: string | null;
  to_status?: string | null;
  payload: Record<string, unknown>;
  created_at: string;
}

// ─── Licensing ───────────────────────────────────────────────────────────────

export type LicenseType =
  | "product"
  | "application"
  | "feature"
  | "workspace"
  | "named_user"
  | "seat_pool"
  | "floating";

export type LicenseStatus =
  | "pending"
  | "active"
  | "expiring_soon"
  | "expired"
  | "suspended"
  | "revoked"
  | "cancelled";

export interface CommercialLicense {
  id: string;
  tenant_id: string;
  workspace_id?: string | null;
  product_id?: string | null;
  application_key?: string | null;
  subscription_id?: string | null;
  license_type: LicenseType;
  status: LicenseStatus;
  feature_key?: string | null;
  max_seats?: number | null;
  expires_at?: string | null;
  activated_at?: string | null;
  deactivated_at?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CommercialLicenseAssignment {
  id: string;
  tenant_id: string;
  license_id: string;
  user_id?: string | null;
  workspace_id?: string | null;
  status: "active" | "transferred" | "revoked";
  assigned_at: string;
  revoked_at?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ─── Seats ───────────────────────────────────────────────────────────────────

export interface CommercialSeatPool {
  id: string;
  tenant_id: string;
  workspace_id?: string | null;
  product_id: string;
  subscription_id?: string | null;
  license_id?: string | null;
  pool_name: string;
  total_seats: number;
  assigned_seats: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ─── Installations (Phase 3 lifecycle) ───────────────────────────────────────

/** Product installation states — maps to commercial_installations.status */
export type ProductInstallationStatus =
  | "not_installed"
  | "requested"
  | "awaiting_entitlement"
  | "awaiting_approval"
  | "queued"
  | "provisioning"
  | "validating"
  | "active"
  | "degraded"
  | "suspended"
  | "upgrade_pending"
  | "upgrading"
  | "rollback_pending"
  | "rolling_back"
  | "failed"
  | "uninstall_pending"
  | "uninstalling"
  | "uninstalled";

/** Application installation states */
export type ApplicationInstallationStatus =
  | "not_installed"
  | "requested"
  | "awaiting_parent"
  | "awaiting_entitlement"
  | "queued"
  | "provisioning"
  | "validating"
  | "active"
  | "degraded"
  | "suspended"
  | "upgrade_pending"
  | "upgrading"
  | "failed"
  | "uninstall_pending"
  | "uninstalling"
  | "uninstalled";

/** @deprecated Use ProductInstallationStatus — legacy alias */
export type InstallationStatus = ProductInstallationStatus | "installing" | "healthy";

export type InstallationHealthState = "healthy" | "warning" | "degraded" | "failed" | "suspended" | "unknown";

export interface CommercialInstallation {
  id: string;
  tenant_id: string;
  workspace_id?: string | null;
  product_id: string;
  subscription_id?: string | null;
  licence_id?: string | null;
  version?: string | null;
  requested_version?: string | null;
  installed_version?: string | null;
  status: ProductInstallationStatus;
  desired_state?: string | null;
  current_state?: string | null;
  requested_by?: string | null;
  approved_by?: string | null;
  requested_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  failed_at?: string | null;
  last_health_check_at?: string | null;
  failure_code?: string | null;
  failure_message?: string | null;
  health_message?: string | null;
  installed_at?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CommercialApplicationInstallation {
  id: string;
  tenant_id: string;
  workspace_id?: string | null;
  product_id: string;
  parent_product_installation_id?: string | null;
  application_id?: string | null;
  application_key: string;
  subscription_id?: string | null;
  licence_id?: string | null;
  version?: string | null;
  requested_version?: string | null;
  installed_version?: string | null;
  workspace_scope?: string | null;
  status: ApplicationInstallationStatus;
  requested_by?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  failure_code?: string | null;
  failure_message?: string | null;
  installed_at?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface InstallationRequestInput {
  tenantId: string;
  productId: string;
  productSlug?: string;
  workspaceId?: string | null;
  requestedVersion?: string;
  requestedBy: string;
  correlationId?: string;
  workspaceIds?: string[];
}

export interface InstallationWorkflowStep {
  step_key: string;
  step_order: number;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  started_at?: string | null;
  completed_at?: string | null;
  error_code?: string | null;
  error_message?: string | null;
}

export interface InstallationHealthCheckResult {
  installationId: string;
  healthState: InstallationHealthState;
  checks: Array<{ key: string; passed: boolean; detail?: string }>;
  summary?: string;
  checkedAt: string;
}

export interface WorkspaceProductAssignment {
  id: string;
  tenant_id: string;
  workspace_id: string;
  installation_id: string;
  product_id: string;
  status: "active" | "suspended" | "removed";
  assigned_at: string;
}

// ─── Usage ───────────────────────────────────────────────────────────────────

export type UsageAggregation = "sum" | "max" | "avg" | "last";

export interface CommercialUsageType {
  id: string;
  metric_key: string;
  name: string;
  description?: string | null;
  unit: string;
  aggregation: UsageAggregation;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CommercialUsageRecord {
  id: string;
  tenant_id: string;
  workspace_id?: string | null;
  product_id?: string | null;
  application_key?: string | null;
  metric_key: string;
  quantity: number;
  unit?: string | null;
  period_start: string;
  period_end: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CommercialUsageAggregate {
  metric_key: string;
  name: string;
  unit: string;
  total_quantity: number;
  period_start: string;
  period_end: string;
}

// ─── Billing ─────────────────────────────────────────────────────────────────

export type BillingProvider = "stripe" | "xero" | "manual" | "purchase_order";

export type InvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible";

export type TaxType = "gst" | "vat" | "none";

export interface CommercialBillingAccount {
  id: string;
  tenant_id: string;
  name: string;
  legal_name?: string | null;
  currency: string;
  tax_id?: string | null;
  cost_centre?: string | null;
  parent_id?: string | null;
  provider: BillingProvider;
  external_id?: string | null;
  is_default: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CommercialInvoice {
  id: string;
  tenant_id: string;
  billing_account_id: string;
  subscription_id?: string | null;
  invoice_number: string;
  status: InvoiceStatus;
  currency: string;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  tax_type?: TaxType | null;
  issued_at?: string | null;
  due_at?: string | null;
  paid_at?: string | null;
  provider: BillingProvider;
  external_id?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ─── Marketplace ───────────────────────────────────────────────────────────────

export type PublisherType = "rtb" | "partner" | "verified_third_party";

export interface CommercialPublisher {
  id: string;
  slug: string;
  name: string;
  publisher_type: PublisherType;
  is_verified: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CommercialMarketplaceProduct {
  id: string;
  product_id: string;
  publisher_id: string;
  listing_status: "draft" | "published" | "suspended" | "archived";
  visibility: "public" | "private" | "partner_only";
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ─── Service inputs ──────────────────────────────────────────────────────────

export interface ListProductsInput {
  tenantId: string;
  lifecycleStatus?: ProductLifecycleStatus[];
  visibility?: ProductVisibility[];
  includeMarketplace?: boolean;
}

export interface CreateSubscriptionInput {
  tenantId: string;
  productId: string;
  planId?: string;
  workspaceId?: string;
  status?: SubscriptionStatus;
  quantity?: number;
  createdBy?: string;
  metadata?: Record<string, unknown>;
}

export interface RecordUsageInput {
  tenantId: string;
  metricKey: string;
  quantity: number;
  productId?: string;
  applicationKey?: string;
  workspaceId?: string;
  periodStart: string;
  periodEnd: string;
  createdBy?: string;
}

export interface InstallProductInput {
  tenantId: string;
  productId: string;
  workspaceId?: string;
  version?: string;
  createdBy?: string;
}

export interface AssignSeatInput {
  tenantId: string;
  seatPoolId: string;
  userId: string;
  workspaceId?: string;
  subscriptionId?: string;
  assignedBy?: string;
}

export interface TransferSeatInput {
  tenantId: string;
  seatPoolId: string;
  fromUserId: string;
  toUserId: string;
  transferredBy?: string;
}

export interface RemoveSeatInput {
  tenantId: string;
  seatPoolId: string;
  userId: string;
  removedBy?: string;
}

export interface CommercialSeatAssignment {
  id: string;
  tenant_id: string;
  workspace_id?: string | null;
  seat_pool_id: string;
  subscription_id?: string | null;
  user_id: string;
  status: "active" | "suspended" | "transferred" | "removed";
  assigned_at: string;
  removed_at?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CommercialPlanEntitlement {
  id: string;
  plan_id: string;
  entitlement_type: string;
  entitlement_key: string;
  value_type: "boolean" | "integer" | "decimal" | "text" | "json";
  boolean_value?: boolean | null;
  integer_value?: number | null;
  decimal_value?: number | null;
  text_value?: string | null;
  json_value?: Record<string, unknown> | null;
  effective_from: string;
  effective_until?: string | null;
  metadata: Record<string, unknown>;
}

export interface CommercialSubscriptionChange {
  id: string;
  tenant_id: string;
  subscription_id: string;
  current_plan_id?: string | null;
  target_plan_id: string;
  change_type: "upgrade" | "downgrade" | "conversion" | "override";
  status: "pending" | "scheduled" | "applied" | "cancelled" | "failed";
  requested_at: string;
  requested_by?: string | null;
  effective_at: string;
  applied_at?: string | null;
  cancelled_at?: string | null;
  reason?: string | null;
  metadata: Record<string, unknown>;
}

export interface CommercialEntitlementOverride {
  id: string;
  tenant_id: string;
  workspace_id?: string | null;
  user_id?: string | null;
  product_id?: string | null;
  application_key?: string | null;
  feature_key?: string | null;
  override_type: string;
  effect: "allow" | "deny" | "limit_override" | "expiry_extension";
  valid_from: string;
  valid_until?: string | null;
  reason: string;
  approved_by?: string | null;
  created_by?: string | null;
  revoked_at?: string | null;
}

export interface TransitionSubscriptionInput {
  tenantId: string;
  subscriptionId: string;
  targetStatus: SubscriptionStatus;
  actorUserId?: string;
  actorType?: string;
  source?: string;
  reason?: string;
  correlationId?: string;
  idempotencyKey?: string;
  effectiveAt?: string;
}

export interface TrialEligibilityResult {
  eligible: boolean;
  reason:
    | "eligible"
    | "already_used"
    | "active_subscription_exists"
    | "blocked_tenant"
    | "product_not_trial_enabled"
    | "plan_not_trial_enabled"
    | "owner_approval_required";
}

export interface StartTrialInput {
  tenantId: string;
  productId: string;
  planId: string;
  workspaceId?: string;
  actorUserId?: string;
  trialDays?: number;
  seatLimit?: number;
}

// ─── Commerce execution context (service-layer enforcement) ─────────────────

export type CommerceActorType =
  | "user"
  | "service"
  | "scheduler"
  | "migration"
  | "platform_admin";

export type CommerceCachePolicy = "allow-short-cache" | "fresh";

export interface CommerceAccessPolicy {
  productKey: string;
  applicationKey?: string;
  featureKey?: string;
  action: string;
  seatRequired?: boolean;
  workspaceRequired?: boolean;
  cachePolicy?: CommerceCachePolicy;
  hideResourceExistence?: boolean;
}

export interface VerifiedCommerceAuthorization {
  decisionId: string;
  decision: "allow";
  productKey: string;
  applicationKey?: string;
  featureKey?: string;
  action: string;
  tenantId: string;
  workspaceId?: string;
  userId?: string;
  seatRequired: boolean;
  seatAssigned?: boolean;
  evaluatedAt: string;
  validUntil: string;
  cachePolicy: CommerceCachePolicy;
  signatureOrInternalToken?: string;
}

export interface CommerceExecutionContext {
  tenantId: string;
  workspaceId?: string;
  actorUserId?: string;
  actorType: CommerceActorType;
  correlationId: string;
  authorization: VerifiedCommerceAuthorization;
}

export interface EntitlementDiagnosticStep {
  step: string;
  passed: boolean;
  detail?: string;
}

export interface EntitlementDiagnosticResult {
  allowed: boolean;
  reasonCode: string;
  steps: EntitlementDiagnosticStep[];
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface CommerceAnalyticsSummary {
  active_subscriptions: number;
  trialing_subscriptions: number;
  total_seats_assigned: number;
  total_seats_available: number;
  healthy_installations: number;
  mrr_cents: number;
  usage_metrics_recorded: number;
}

// ─── Extension hooks (Growth Engine — not implemented) ───────────────────────

export interface GrowthEngineHook {
  onSubscriptionCreated?(subscription: CommercialSubscription): Promise<void>;
  onSubscriptionRenewed?(subscription: CommercialSubscription): Promise<void>;
  onUsageRecorded?(record: CommercialUsageRecord): Promise<void>;
  onCreditApplied?(tenantId: string, amountCents: number): Promise<void>;
}

export interface ReferralEngineHook {
  onTenantSignup?(tenantId: string, referralCode?: string): Promise<void>;
}

export interface PartnerCommissionHook {
  onInvoicePaid?(invoiceId: string, publisherId: string): Promise<void>;
}

export interface CommerceExtensionHooks {
  growth?: GrowthEngineHook;
  referral?: ReferralEngineHook;
  partnerCommission?: PartnerCommissionHook;
}
