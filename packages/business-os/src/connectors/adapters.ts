import type { BosConnectorContract, BosConnectorId } from "@rtb/types";
import { connectorContract } from "./catalog";

export type AdapterPage = {
  records: Array<{
    externalSourceId: string;
    dataClass: string;
    sourceUpdatedAt: string | null;
    payload: Record<string, unknown>;
    suppressed?: boolean;
  }>;
  nextCursor: string | null;
  rateLimited: boolean;
  timedOut: boolean;
  partial: boolean;
};

export interface ConnectorAdapter {
  contract: BosConnectorContract;
  readPage(input: {
    cursor: string | null;
    secretId: string | null;
    mode: "fixture" | "sandbox" | "live";
    simulate?: "timeout" | "rate_limit" | "partial";
  }): Promise<AdapterPage>;
  write(): never;
}

const NOW = "2026-08-19T18:00:00.000Z";

function fixturePage(connectorId: BosConnectorId): AdapterPage {
  if (connectorId === "xero") {
    return {
      records: [
        {
          externalSourceId: "xero-inv-1001",
          dataClass: "invoice_read",
          sourceUpdatedAt: NOW,
          payload: {
            invoiceNumber: "INV-1001",
            status: "AUTHORISED",
            totalScale: 2,
            currency: "AUD",
            canonical: false,
          },
        },
      ],
      nextCursor: null,
      rateLimited: false,
      timedOut: false,
      partial: false,
    };
  }
  if (connectorId === "microsoft_365") {
    return {
      records: [
        {
          externalSourceId: "m365-event-1",
          dataClass: "calendar_event_read",
          sourceUpdatedAt: NOW,
          payload: { subject: "Quarterly review", type: "event", canonical: false },
        },
      ],
      nextCursor: null,
      rateLimited: false,
      timedOut: false,
      partial: false,
    };
  }
  if (connectorId === "hubspot") {
    return {
      records: [
        {
          externalSourceId: "hs-contact-1",
          dataClass: "contact_read",
          sourceUpdatedAt: NOW,
          payload: { name: "Jordan Buyer", company: "Acme", canonical: false },
        },
        {
          externalSourceId: "hs-contact-suppressed",
          dataClass: "contact_read",
          sourceUpdatedAt: NOW,
          suppressed: true,
          payload: {
            name: "Hidden Person",
            email: "hidden@example.com",
            phone: "+1-555-0100",
            address: "1 Secret Lane",
            canonical: false,
          },
        },
      ],
      nextCursor: null,
      rateLimited: false,
      timedOut: false,
      partial: false,
    };
  }
  return { records: [], nextCursor: null, rateLimited: false, timedOut: false, partial: false };
}

export function createFixtureAdapter(connectorId: BosConnectorId): ConnectorAdapter {
  const contract = connectorContract(connectorId);
  return {
    contract,
    async readPage(input) {
      if (input.mode === "live" && !input.secretId) {
        return { records: [], nextCursor: null, rateLimited: false, timedOut: false, partial: false };
      }
      if (input.simulate === "timeout") {
        return { records: [], nextCursor: input.cursor, rateLimited: false, timedOut: true, partial: true };
      }
      if (input.simulate === "rate_limit") {
        return { records: [], nextCursor: input.cursor, rateLimited: true, timedOut: false, partial: true };
      }
      if (input.cursor === "done") {
        return { records: [], nextCursor: null, rateLimited: false, timedOut: false, partial: false };
      }
      const page = fixturePage(connectorId);
      if (input.simulate === "partial") return { ...page, partial: true, nextCursor: "resume-1" };
      return page;
    },
    write(): never {
      throw new Error("connector_write_forbidden");
    },
  };
}

export const BOS_CONNECTOR_ADAPTERS: Record<BosConnectorId, ConnectorAdapter> = {
  xero: createFixtureAdapter("xero"),
  microsoft_365: createFixtureAdapter("microsoft_365"),
  hubspot: createFixtureAdapter("hubspot"),
  csv_excel: createFixtureAdapter("csv_excel"),
};
