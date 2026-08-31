import { CommerceDomainError } from "@rtb/platform-commerce";

export const TECHNICAL_QUERY_STATUSES = ["open", "responded", "closed"] as const;
export type TechnicalQueryStatus = (typeof TECHNICAL_QUERY_STATUSES)[number];

/** Canonical persistable TQ status. Presentation aliases map in; invalid values are 4xx. */
export function mapTechnicalQueryStatus(input?: string | null): TechnicalQueryStatus {
  const normalized = (input ?? "responded").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (normalized === "open") return "open";
  if (normalized === "responded" || normalized === "answered" || normalized === "response") {
    return "responded";
  }
  if (normalized === "closed" || normalized === "close") return "closed";
  throw new CommerceDomainError(
    `Unsupported TQ status: ${input ?? ""}`,
    "invalid_transition",
    422,
  );
}
