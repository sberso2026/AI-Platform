import type { CommercialBillingAccount, CommercialInvoice, CommercialSubscription } from "@rtb/types";
import type { InvoiceAdministrationView, SubscriptionBillingView } from "./administration-types";

function mapSubscriptionStatus(status: string): SubscriptionBillingView["billingStatus"] {
  if (status === "trial") return "trialing";
  if (status === "active" || status === "grace_period" || status === "pending_renewal") {
    return "active";
  }
  if (status === "pending_payment" || status === "paused") return "past_due";
  if (status === "cancelled") return "cancelled";
  return "expired";
}

export function mapSubscriptionBillingViews(
  subscriptions: CommercialSubscription[],
  productNameById: Map<string, string>,
  productSlugById: Map<string, string>,
  billingAccounts: CommercialBillingAccount[],
  includeContractValue: boolean
): SubscriptionBillingView[] {
  const defaultAccount = billingAccounts.find((a) => a.is_default) ?? billingAccounts[0];

  return subscriptions.map((sub) => ({
    id: sub.id,
    productName: sub.product_id ? (productNameById.get(sub.product_id) ?? "Product") : "—",
    productSlug: sub.product_id ? productSlugById.get(sub.product_id) : undefined,
    planName: sub.plan_id ?? undefined,
    billingInterval: sub.billing_period ?? undefined,
    startDate: sub.activated_at ?? sub.created_at,
    currentPeriodStart: sub.current_period_start ?? undefined,
    currentPeriodEnd: sub.current_period_end ?? undefined,
    renewalDate: sub.renewal_date ?? undefined,
    contractValueCents: includeContractValue
      ? ((sub.metadata?.contract_value_cents as number | undefined) ?? undefined)
      : undefined,
    currency: defaultAccount?.currency ?? "AUD",
    billingStatus: mapSubscriptionStatus(sub.status),
    paymentTerms: (sub.metadata?.payment_terms as string | undefined) ?? undefined,
    billingAccountName: defaultAccount?.name,
    billingContact: (defaultAccount?.metadata?.billing_contact as string | undefined) ?? undefined,
    renewalStatus: sub.status === "pending_renewal" ? "Pending renewal" : undefined,
  }));
}

export function mapInvoiceAdministrationViews(
  invoices: CommercialInvoice[]
): InvoiceAdministrationView[] {
  return invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoice_number,
    status: inv.status,
    totalCents: inv.total_cents,
    currency: inv.currency,
    issuedAt: inv.issued_at ?? undefined,
    dueAt: inv.due_at ?? undefined,
    provider: inv.provider,
  }));
}
