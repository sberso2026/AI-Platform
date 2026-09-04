export const ENGINEERING_OS_PRODUCT_ID = "c1000000-0000-4000-8000-000000000001";

const PRODUCT_DISPLAY_NAMES: Record<string, string> = {
  "engineering-os": "Engineering OS",
  "business-os": "Business OS",
  "industrial-os": "Industrial OS",
};

export function customerFacingProductName(input: {
  slug?: string | null;
  name?: string | null;
}): string {
  if (input.slug && PRODUCT_DISPLAY_NAMES[input.slug]) {
    return PRODUCT_DISPLAY_NAMES[input.slug];
  }
  if (input.name === "Engineering Operating System") {
    return "Engineering OS";
  }
  return input.name?.trim() || "Unknown product";
}

export function formatLocalDate(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function subscriptionStatusLabel(status: string): string {
  if (status === "trial" || status === "trialing") return "Trialing";
  if (status === "active") return "Active";
  if (status === "paused") return "Paused";
  if (status === "suspended") return "Suspended";
  if (status === "cancelled") return "Cancelled";
  if (status === "expired") return "Expired";
  return status;
}

export function licenceStateLabel(status?: string | null): string {
  if (!status) return "None";
  if (status === "active") return "Active";
  if (status === "suspended") return "Suspended";
  if (status === "revoked") return "Revoked";
  if (status === "expired") return "Expired";
  return status;
}

export type SubscriptionDisplayRow = {
  id: string;
  product_id: string;
  plan_id?: string | null;
  status: string;
  trial_end?: string | null;
  trial_ends_at?: string | null;
  productName: string;
  planName: string;
  statusLabel: string;
  licenceState: string;
  seatAssigned: number;
  seatTotal: number;
  installedApplicationNames: string[];
};

