/**
 * Canonical connector UI states for Xero, Microsoft 365, and HubSpot.
 * Presentation-boundary only — does not duplicate provider runtimes.
 */
import { bosV1ProviderProductStatus } from "../release-scope";

export const BOS_CONNECTOR_UI_STATES = [
  "NOT_CONNECTED",
  "CONNECTING",
  "CONNECTED",
  "SYNCING",
  "ERROR",
  "REAUTH_REQUIRED",
  "DISCONNECTED",
] as const;

export type BosConnectorUiState = (typeof BOS_CONNECTOR_UI_STATES)[number];

export const BOS_OAUTH_CONNECTOR_IDS = ["xero", "microsoft_365", "hubspot"] as const;
export type BosOauthConnectorId = (typeof BOS_OAUTH_CONNECTOR_IDS)[number];

export function isBosOauthConnector(id: string): id is BosOauthConnectorId {
  return (BOS_OAUTH_CONNECTOR_IDS as readonly string[]).includes(id);
}

export const BOS_CONNECTOR_UI_TRANSITIONS: Record<BosConnectorUiState, readonly BosConnectorUiState[]> = {
  NOT_CONNECTED: ["CONNECTING"],
  CONNECTING: ["CONNECTING", "CONNECTED", "ERROR"],
  CONNECTED: ["SYNCING", "REAUTH_REQUIRED", "DISCONNECTED", "ERROR"],
  SYNCING: ["CONNECTED", "ERROR", "SYNCING"],
  ERROR: ["CONNECTING", "DISCONNECTED", "ERROR"],
  REAUTH_REQUIRED: ["CONNECTING", "DISCONNECTED"],
  DISCONNECTED: ["CONNECTING"],
};

export function assertConnectorUiTransition(from: BosConnectorUiState, to: BosConnectorUiState): void {
  if (!(BOS_CONNECTOR_UI_TRANSITIONS[from] as readonly string[]).includes(to)) {
    throw new Error("invalid_connector_ui_transition");
  }
}

export function bosConnectorUiState(input: {
  health: string;
  effectiveMode: string;
  secretId: string | null;
  errorCategory: string | null;
  oauthPending?: boolean;
  inFlightSync?: boolean;
  unauthorizedCategory?: string;
}): BosConnectorUiState {
  if (input.inFlightSync) return "SYNCING";
  if (input.health === "revoked") return "DISCONNECTED";
  if (input.oauthPending || input.errorCategory === "oauth_pending") return "CONNECTING";
  const unauthorized = input.unauthorizedCategory ?? "reauth_required";
  if (
    input.errorCategory === "reauth_required" ||
    input.errorCategory === unauthorized ||
    input.errorCategory === "authentication_expired"
  ) {
    return "REAUTH_REQUIRED";
  }
  if (input.effectiveMode === "live" && input.health === "unavailable") {
    return input.errorCategory === unauthorized ? "REAUTH_REQUIRED" : "ERROR";
  }
  if (input.effectiveMode === "live" && !input.secretId) return "CONNECTING";
  if (input.effectiveMode === "live" && input.health === "configured") return "CONNECTING";
  if (input.health === "degraded") return "ERROR";
  if (input.health === "unavailable") return "ERROR";
  if (input.health === "healthy" || input.health === "configured") return "CONNECTED";
  return "NOT_CONNECTED";
}

export const BOS_CONNECTOR_PRODUCT_STATUS = {
  xero: bosV1ProviderProductStatus("xero"),
  microsoft_365: bosV1ProviderProductStatus("microsoft_365"),
  hubspot: bosV1ProviderProductStatus("hubspot"),
} as const;

export const BOS_CONNECTOR_PREVIEW_DISCLOSURE =
  "Preview. Not live-provider certified. Business OS Core does not require this connector." as const;

export const BOS_CONNECTOR_CONSENT = {
  xero: {
    providerLabel: "Xero",
    capabilitySummary: "Read-only accounting, invoice, and contact information.",
    permissionClass: "accounting.settings.read, accounting.invoices.read, accounting.contacts.read",
    cannot: [
      "no payment action",
      "no invoice or contact modification",
      "no email sending",
      "no file modification",
    ],
  },
  microsoft_365: {
    providerLabel: "Microsoft 365",
    capabilitySummary: "Approved profile, calendar, and file metadata only.",
    permissionClass: "User.Read, Calendars.Read, Files.Read",
    cannot: [
      "no email sending",
      "no calendar modification",
      "no file modification",
      "no directory writes",
    ],
  },
  hubspot: {
    providerLabel: "HubSpot",
    capabilitySummary: "Approved CRM contacts, companies, and deals read-only.",
    permissionClass: "crm.objects.contacts.read, crm.objects.companies.read, crm.objects.deals.read",
    cannot: ["no CRM mutation", "no email sending", "no payment action"],
  },
} as const;

export function connectorStatusChip(state: BosConnectorUiState): "pending" | "approved" | "rejected" | "closed" {
  if (state === "CONNECTED") return "approved";
  if (state === "CONNECTING" || state === "SYNCING") return "pending";
  if (state === "ERROR" || state === "REAUTH_REQUIRED") return "rejected";
  return "closed";
}
