import { CommerceDomainError } from "@rtb/platform-commerce";

export const TECHNICAL_QUERY_STATUSES = [
  "draft",
  "awaiting_response",
  "response_submitted",
  "under_review",
  "clarification_required",
  "accepted",
  "closed",
  "cancelled",
  "superseded",
  "open",
  "responded",
] as const;
export type TechnicalQueryStatus = (typeof TECHNICAL_QUERY_STATUSES)[number];

const STATUS_ALIASES: Record<string, string> = {
  draft: "draft",
  open: "open",
  submitted: "awaiting_response",
  awaiting_response: "awaiting_response",
  responded: "responded",
  answered: "responded",
  response: "responded",
  response_submitted: "response_submitted",
  under_review: "under_review",
  review: "under_review",
  clarification_required: "clarification_required",
  clarification: "clarification_required",
  accepted: "accepted",
  closed: "closed",
  close: "closed",
  cancelled: "cancelled",
  canceled: "cancelled",
  superseded: "superseded",
};

/** Canonical persistable TQ status. Presentation aliases map in; invalid values are 4xx. */
export function mapTechnicalQueryStatus(input?: string | null): string {
  const normalized = (input ?? "responded").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (normalized === "approved") {
    throw new CommerceDomainError(
      `Unsupported TQ status: ${input ?? ""}`,
      "invalid_transition",
      422,
    );
  }
  const mapped = STATUS_ALIASES[normalized];
  if (!mapped) {
    throw new CommerceDomainError(
      `Unsupported TQ status: ${input ?? ""}`,
      "invalid_transition",
      422,
    );
  }
  return mapped;
}
