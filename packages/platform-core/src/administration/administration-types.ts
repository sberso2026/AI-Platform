import type {
  CommercialProductView,
  InstallationStatus,
  LicenceStatus,
  SubscriptionStatus,
} from "../commerce/commerce-types";

/** Customer-facing health status — separate from installation status */
export type HealthStatus = "healthy" | "warning" | "degraded" | "failed" | "suspended";

export type GrowthCreditTransactionType =
  | "earned"
  | "redeemed"
  | "reserved"
  | "released"
  | "expired"
  | "reversed"
  | "adjusted";

export type GrowthCreditSource =
  | "founding_customer"
  | "approved_case_study"
  | "qualified_product_feedback"
  | "customer_advisory_participation"
  | "direct_introduction"
  | "renewal"
  | "training_completion"
  | "design_partner_contribution"
  | "promotional_award"
  | "service_recovery";

export type InstallationWorkflowStepStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | "skipped";

export interface ProductAdministrationView extends CommercialProductView {
  healthStatus: HealthStatus;
  availableVersion?: string;
  workspaceAssignmentCount?: number;
  lastHealthCheckAt?: string;
  installationId?: string;
}

export interface ProductCatalogSummaryView {
  installedOperatingSystems: number;
  installedApplications: number;
  assignedSeats: number;
  totalSeats: number;
  currentPlan?: string;
  renewalDate?: string;
  installationHealth: HealthStatus;
}

export interface SubscriptionBillingView {
  id: string;
  productName: string;
  productSlug?: string;
  planName?: string;
  billingInterval?: string;
  startDate?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  renewalDate?: string;
  contractValueCents?: number;
  currency: string;
  billingStatus: SubscriptionStatus;
  paymentTerms?: string;
  billingAccountName?: string;
  billingContact?: string;
  renewalStatus?: string;
}

export interface InvoiceAdministrationView {
  id: string;
  invoiceNumber: string;
  status: string;
  totalCents: number;
  currency: string;
  issuedAt?: string;
  dueAt?: string;
  provider: string;
}

export interface LicenceSeatPoolView {
  id: string;
  productId: string;
  productName?: string;
  applicationKey?: string;
  licenceStatus: LicenceStatus;
  validFrom?: string;
  validUntil?: string;
  seatType: string;
  seatLimit: number;
  assignedSeats: number;
  availableSeats: number;
  workspaceLimit?: number;
}

export interface SeatAssignmentView {
  id: string;
  userId: string;
  userEmail?: string;
  seatType: string;
  productId?: string;
  workspaceId?: string;
  assignedAt?: string;
  expiresAt?: string;
}

export interface UsageMetricView {
  metricKey: string;
  name: string;
  unit: string;
  includedAllowance?: number;
  consumed: number;
  remaining?: number;
  projectedPeriodUsage?: number;
  thresholdAlert?: boolean;
  billableOverageEstimateCents?: number;
  productId?: string;
  applicationKey?: string;
  workspaceId?: string;
}

export interface GrowthCreditAccountView {
  availableBalance: number;
  reservedBalance: number;
  expiringSoon: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
}

export interface GrowthCreditTransactionView {
  id: string;
  transactionType: GrowthCreditTransactionType;
  amount: number;
  source?: GrowthCreditSource | string;
  description?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface InstallationProgressStepView {
  key: string;
  label: string;
  status: InstallationWorkflowStepStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  evidenceSummary?: string;
  retryStatus?: string;
  errorCode?: string;
}

export interface InstallationProgressView {
  installationId: string;
  productSlug?: string;
  productName?: string;
  installationStatus: InstallationStatus;
  healthStatus?: HealthStatus;
  steps: InstallationProgressStepView[];
  failure?: {
    title: string;
    explanation: string;
    referenceCode: string;
    canRetry: boolean;
  };
}

export interface SystemHealthComponentView {
  key: string;
  label: string;
  status: "operational" | "warning" | "degraded" | "unavailable" | "suspended";
  message?: string;
  productSlug?: string;
}

export interface MyAccountView {
  assignedOperatingSystems: Array<{
    slug: string;
    name: string;
    seatType?: string;
    workspaceNames: string[];
  }>;
  assignedApplications: Array<{
    appKey: string;
    name: string;
    openHref?: string;
  }>;
  seatType?: string;
  workspaceAccess: Array<{ id: string; name: string }>;
  personalUsage: UsageMetricView[];
  licenceExpiry?: string;
}

export interface WorkspaceProductAssignmentView {
  assignmentId: string;
  workspaceId: string;
  workspaceName: string;
  productSlug: string;
  productName: string;
  applications: string[];
  seatUse: number;
  healthStatus: HealthStatus;
}
