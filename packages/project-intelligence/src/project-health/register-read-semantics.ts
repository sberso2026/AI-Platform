import type { BoundCollection } from "./source-contracts";

export const REGISTER_LIST_PAGE_LIMIT = 50;

export const REGISTER_READ_STATES = [
  "unread",
  "unavailable",
  "forbidden",
  "unknown_completeness",
  "complete",
] as const;
export type RegisterReadState = (typeof REGISTER_READ_STATES)[number];

export type RegisterReadCompleteness = "complete" | "unknown";

export type RegisterReadAvailability =
  | "ok"
  | "no_data"
  | "unavailable"
  | "forbidden"
  | "stale"
  | "error";

/**
 * Shared PI register-read semantics.
 *
 * GREEN is allowed only after a successful complete read.
 * Unread, unavailable, forbidden, and unknown completeness must not evaluate GREEN.
 */
export function classifyBoundRegisterRead<T>(bound: BoundCollection<T>): RegisterReadState {
  if (!bound.bound) return "unread";
  if (bound.completeness === "unknown") return "unknown_completeness";
  return "complete";
}

export function classifySourcedRegisterRead(input: {
  bound: boolean;
  completeness?: RegisterReadCompleteness;
  availability?: RegisterReadAvailability;
}): RegisterReadState {
  if (input.availability === "error" || input.availability === "unavailable") return "unavailable";
  if (input.availability === "forbidden") return "forbidden";
  if (!input.bound || input.availability === "no_data") return "unread";
  if (input.completeness === "unknown") return "unknown_completeness";
  return "complete";
}

export function completenessFromPageSize(
  itemCount: number,
  pageLimit = REGISTER_LIST_PAGE_LIMIT,
): RegisterReadCompleteness {
  return itemCount >= pageLimit ? "unknown" : "complete";
}

export function registerReadMayEvaluateGreen(state: RegisterReadState): boolean {
  return state === "complete";
}
