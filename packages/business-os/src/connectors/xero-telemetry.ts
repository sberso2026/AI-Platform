import { redactSecrets } from "./security";

const BLOCKED_TELEMETRY = [
  "authorization",
  "access_token",
  "refresh_token",
  "client_secret",
  "payload",
  "bankaccountnumber",
  "taxnumber",
  "emailaddress",
  "phones",
  "addresses",
];

export function xeroSafeTelemetry(input: Record<string, unknown>): Record<string, unknown> {
  const redacted = redactSecrets(input) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(redacted)) {
    if (BLOCKED_TELEMETRY.includes(key.toLowerCase())) {
      out[key] = "[redacted]";
      continue;
    }
    out[key] = value;
  }
  return out;
}
