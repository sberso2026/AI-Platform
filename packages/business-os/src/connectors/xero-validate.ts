import { XERO_FIELD_POLICY, type XeroFieldClass } from "./xero-policy";
import { XeroConnectorError } from "./xero-errors";

const CURRENCY = /^[A-Z]{3}$/;

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function boolOrUnknown(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

export function moneyToMinor(value: unknown, scale = 2): { amountMinor: number | null; scale: number; unknown: boolean } {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { amountMinor: null, scale, unknown: true };
  }
  return { amountMinor: Math.round(value * 10 ** scale), scale, unknown: false };
}

function pick(record: Record<string, unknown>, policy: Record<string, XeroFieldClass>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, classification] of Object.entries(policy)) {
    if (classification === "discard") continue;
    out[key] = key in record ? record[key] : null;
  }
  return out;
}

export type MinimisedXeroRecord = {
  externalSourceId: string;
  dataClass: string;
  sourceUpdatedAt: string | null;
  payload: Record<string, unknown>;
};

function requireId(value: unknown, label: string): string {
  const id = str(value);
  if (!id) throw new XeroConnectorError("xero_schema_invalid");
  void label;
  return id;
}

export function validateCurrency(value: unknown): string | null {
  const code = str(value);
  if (!code) return null;
  return CURRENCY.test(code) ? code : null;
}

export function minimiseOrganisation(input: unknown): MinimisedXeroRecord {
  if (!input || typeof input !== "object") throw new XeroConnectorError("xero_schema_invalid");
  const raw = input as Record<string, unknown>;
  const id = requireId(raw.OrganisationID, "OrganisationID");
  const picked = pick(raw, XERO_FIELD_POLICY.organisation);
  return {
    externalSourceId: id,
    dataClass: "organisation_read",
    sourceUpdatedAt: str(raw.UpdatedDateUTC),
    payload: {
      ...picked,
      OrganisationID: id,
      Name: str(raw.Name),
      IsDemoCompany: boolOrUnknown(raw.IsDemoCompany),
      CountryCode: str(raw.CountryCode),
      OrganisationStatus: str(raw.OrganisationStatus),
      Class: str(raw.Class),
      canonical: false,
    },
  };
}

export function minimiseAccount(input: unknown): MinimisedXeroRecord {
  if (!input || typeof input !== "object") throw new XeroConnectorError("xero_schema_invalid");
  const raw = input as Record<string, unknown>;
  const id = requireId(raw.AccountID, "AccountID");
  return {
    externalSourceId: id,
    dataClass: "account_balance_read",
    sourceUpdatedAt: str(raw.UpdatedDateUTC),
    payload: {
      AccountID: id,
      Code: str(raw.Code),
      Name: str(raw.Name),
      Type: str(raw.Type),
      Status: str(raw.Status),
      CurrencyCode: validateCurrency(raw.CurrencyCode),
      balanceMinor: null,
      unknown: true,
      canonical: false,
    },
  };
}

export function minimiseInvoice(input: unknown): MinimisedXeroRecord {
  if (!input || typeof input !== "object") throw new XeroConnectorError("xero_schema_invalid");
  const raw = input as Record<string, unknown>;
  const id = requireId(raw.InvoiceID, "InvoiceID");
  const total = moneyToMinor(raw.Total);
  const due = moneyToMinor(raw.AmountDue);
  return {
    externalSourceId: id,
    dataClass: "invoice_read",
    sourceUpdatedAt: str(raw.UpdatedDateUTC),
    payload: {
      InvoiceID: id,
      InvoiceNumber: str(raw.InvoiceNumber),
      Status: str(raw.Status),
      CurrencyCode: validateCurrency(raw.CurrencyCode),
      totalMinor: total.amountMinor,
      amountDueMinor: due.amountMinor,
      scale: 2,
      unknown: total.unknown,
      Date: str(raw.Date),
      canonical: false,
    },
  };
}

export function minimiseContact(input: unknown): MinimisedXeroRecord {
  if (!input || typeof input !== "object") throw new XeroConnectorError("xero_schema_invalid");
  const raw = input as Record<string, unknown>;
  const id = requireId(raw.ContactID, "ContactID");
  const balances = raw.Balances && typeof raw.Balances === "object" ? (raw.Balances as Record<string, unknown>) : null;
  const outstanding = moneyToMinor(
    balances && typeof balances.AccountsReceivable === "object"
      ? (balances.AccountsReceivable as Record<string, unknown>).Outstanding
      : null,
  );
  return {
    externalSourceId: id,
    dataClass: "contact_financial_read",
    sourceUpdatedAt: str(raw.UpdatedDateUTC),
    payload: {
      ContactID: id,
      Name: str(raw.Name),
      ContactStatus: str(raw.ContactStatus),
      IsCustomer: boolOrUnknown(raw.IsCustomer),
      IsSupplier: boolOrUnknown(raw.IsSupplier),
      outstandingMinor: outstanding.amountMinor,
      unknown: outstanding.unknown,
      canonical: false,
    },
  };
}

export function mapValidRecords(
  items: unknown,
  mapper: (item: unknown) => MinimisedXeroRecord,
): { records: MinimisedXeroRecord[]; rejected: number } {
  if (!Array.isArray(items)) throw new XeroConnectorError("xero_schema_invalid");
  const records: MinimisedXeroRecord[] = [];
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
