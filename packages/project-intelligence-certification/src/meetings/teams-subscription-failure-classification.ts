/**
 * Classify live Graph POST /subscriptions failures for Phase 6C-3E diagnostics.
 * Prefer tenant/admin and request-shape causes over a generic "permission" bucket.
 */

export type SubscriptionFailureClassification =
  | "permission"
  | "unsupported resource"
  | "invalid notification URL"
  | "invalid lifecycle URL"
  | "invalid expiration"
  | "tenant transcript access disabled"
  | "meeting fixture"
  | "product defect";

export type SubscriptionFailureSignals = {
  httpStatus?: number | null;
  code?: string | null;
  graphCode?: string | null;
  graphMessage?: string | null;
  message?: string | null;
  innerErrorCode?: string | null;
};

export function classifySubscriptionFailure(
  error: SubscriptionFailureSignals,
): SubscriptionFailureClassification {
  const status = error.httpStatus ?? 0;
  const code = `${error.graphCode ?? ""} ${error.code ?? ""}`.toLowerCase();
  const inner = `${error.innerErrorCode ?? ""}`.toLowerCase();
  const message = `${error.graphMessage ?? error.message ?? ""}`.toLowerCase();

  if (
    inner.includes("graphaccesstotranscriptsdisabled") ||
    (message.includes("transcript") &&
      (message.includes("disabled") || message.includes("not enabled")))
  ) {
    return "tenant transcript access disabled";
  }
  if (
    code.includes("unsupported") ||
    message.includes("resource not supported") ||
    error.code === "TEAMS_SUBSCRIPTION_RESOURCE_UNSUPPORTED"
  ) {
    return "unsupported resource";
  }
  if (message.includes("notificationurl") || message.includes("notification url")) {
    return "invalid notification URL";
  }
  if (message.includes("lifecycle")) {
    return "invalid lifecycle URL";
  }
  if (message.includes("expiration")) {
    return "invalid expiration";
  }
  if (message.includes("fixture") || code.includes("fixture")) {
    return "meeting fixture";
  }
  if (
    status === 401 ||
    status === 403 ||
    code.includes("authorization") ||
    code.includes("accessdenied") ||
    code.includes("permission_missing") ||
    code.includes("permission")
  ) {
    return "permission";
  }
  return "product defect";
}
