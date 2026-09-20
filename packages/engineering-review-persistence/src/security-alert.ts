import {
  REVIEW_SECURITY_ALERT_SEVERITY,
  assertSecurityEventSafe,
  shouldAlertReviewSecurityEvent,
  type ReviewSecurityEvent,
} from "@rtb/engineering-review";

function webhookUrl(): string | undefined {
  const value = process.env.RTB_REVIEW_SECURITY_WEBHOOK_URL?.trim();
  return value || undefined;
}

export async function emitReviewSecurityAlert(event: ReviewSecurityEvent): Promise<void> {
  assertSecurityEventSafe(event);
  if (!shouldAlertReviewSecurityEvent(event.name)) return;
  const payload = {
    kind: "rtb.review.security_alert",
    severity: REVIEW_SECURITY_ALERT_SEVERITY[event.name],
    destination: webhookUrl() ? "webhook" : "structured_log",
    owner: "review-oncall",
    response_expectation: "triage within 1 business day for high/critical",
    event,
  };
  console.warn(JSON.stringify(payload));
  const url = webhookUrl();
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    console.warn(JSON.stringify({ kind: "rtb.review.security_alert_delivery_failed", name: event.name }));
  }
}
