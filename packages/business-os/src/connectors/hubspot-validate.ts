import { HubSpotConnectorError } from "./hubspot-errors";
import { HUBSPOT_API_HOST } from "./hubspot-policy";

function str(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function propertiesOf(raw: Record<string, unknown>): Record<string, unknown> {
  const props = raw.properties;
  return props && typeof props === "object" && !Array.isArray(props) ? (props as Record<string, unknown>) : {};
}

function requireId(value: unknown): string {
  const id = str(value);
  if (!id) throw new HubSpotConnectorError("hubspot_schema_invalid");
  return id;
}

function rejectArchived(raw: Record<string, unknown>): void {
  if (raw.archived === true) throw new HubSpotConnectorError("hubspot_schema_invalid");
}

function numericAmount(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return value.trim();
  return null;
}

export type MinimisedHubSpotRecord = {
  externalSourceId: string;
  dataClass: string;
  sourceUpdatedAt: string | null;
  payload: Record<string, unknown>;
};

export function minimiseAccountIdentity(input: unknown): MinimisedHubSpotRecord {
  if (!input || typeof input !== "object") throw new HubSpotConnectorError("hubspot_schema_invalid");
  const raw = input as Record<string, unknown>;
  const portalId = str(raw.portalId ?? raw.portal_id ?? raw.hubId ?? raw.hub_id);
  if (!portalId || !/^\d+$/.test(portalId)) throw new HubSpotConnectorError("hubspot_schema_invalid");
  return {
    externalSourceId: portalId,
    dataClass: "account_identity_read",
    sourceUpdatedAt: null,
    payload: {
      id: portalId,
      portalId,
      canonical: false,
    },
  };
}

export function minimiseContact(input: unknown): MinimisedHubSpotRecord {
  if (!input || typeof input !== "object") throw new HubSpotConnectorError("hubspot_schema_invalid");
  const raw = input as Record<string, unknown>;
  rejectArchived(raw);
  const props = propertiesOf(raw);
  const id = requireId(raw.id ?? props.hs_object_id);
  const first = str(props.firstname);
  const last = str(props.lastname);
  const name = [first, last].filter(Boolean).join(" ") || null;
  return {
    externalSourceId: id,
    dataClass: "contact_read",
    sourceUpdatedAt: str(raw.updatedAt ?? props.lastmodifieddate),
    payload: {
      id,
      name,
      company: str(props.company),
      canonical: false,
    },
  };
}

export function minimiseCompany(input: unknown): MinimisedHubSpotRecord {
  if (!input || typeof input !== "object") throw new HubSpotConnectorError("hubspot_schema_invalid");
  const raw = input as Record<string, unknown>;
  rejectArchived(raw);
  const props = propertiesOf(raw);
  const id = requireId(raw.id ?? props.hs_object_id);
  const name = str(props.name);
  if (!name) throw new HubSpotConnectorError("hubspot_schema_invalid");
  return {
    externalSourceId: id,
    dataClass: "company_read",
    sourceUpdatedAt: str(raw.updatedAt ?? props.hs_lastmodifieddate),
    payload: {
      id,
      name,
      domain: str(props.domain),
      canonical: false,
    },
  };
}

export function minimiseDeal(input: unknown): MinimisedHubSpotRecord {
  if (!input || typeof input !== "object") throw new HubSpotConnectorError("hubspot_schema_invalid");
  const raw = input as Record<string, unknown>;
  rejectArchived(raw);
  const props = propertiesOf(raw);
  const id = requireId(raw.id ?? props.hs_object_id);
  const dealstage = str(props.dealstage);
  if (!dealstage) throw new HubSpotConnectorError("hubspot_schema_invalid");
  return {
    externalSourceId: id,
    dataClass: "deal_read",
    sourceUpdatedAt: str(raw.updatedAt ?? props.hs_lastmodifieddate),
    payload: {
      id,
      dealname: str(props.dealname),
      amount: numericAmount(props.amount),
      dealstage,
      pipeline: str(props.pipeline),
      closedate: str(props.closedate),
      canonical: false,
    },
  };
}

export function mapValidHubSpotRecords(
  items: unknown,
  mapper: (item: unknown) => MinimisedHubSpotRecord,
): { records: MinimisedHubSpotRecord[]; rejected: number } {
  if (!Array.isArray(items)) throw new HubSpotConnectorError("hubspot_schema_invalid");
  const records: MinimisedHubSpotRecord[] = [];
  let rejected = 0;
  for (const item of items) {
    try {
      records.push(mapper(item));
    } catch {
      rejected += 1;
    }
  }
  return { records, rejected };
}

export function validateHubSpotPaging(paging: unknown, allowedPath: string): string | null {
  if (paging == null) return null;
  if (typeof paging !== "object") throw new HubSpotConnectorError("hubspot_pagination_failed");
  const next = (paging as { next?: unknown }).next;
  if (next == null) return null;
  if (typeof next !== "object") throw new HubSpotConnectorError("hubspot_pagination_failed");
  const after = str((next as { after?: unknown }).after);
  const link = (next as { link?: unknown }).link;
  if (link != null) {
    if (typeof link !== "string" || !link.trim()) throw new HubSpotConnectorError("hubspot_pagination_failed");
    let url: URL;
    try {
      url = new URL(link);
    } catch {
      throw new HubSpotConnectorError("hubspot_pagination_failed");
    }
    if (url.protocol !== "https:" || url.hostname.toLowerCase() !== HUBSPOT_API_HOST) {
      throw new HubSpotConnectorError("hubspot_pagination_failed");
    }
    if (url.pathname !== allowedPath) throw new HubSpotConnectorError("hubspot_pagination_failed");
  }
  return after;
}

export function portalIdFromUnknown(value: unknown): string | null {
  const id = str(value);
  return id && /^\d+$/.test(id) ? id : null;
}
