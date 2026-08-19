import { isSuppressedContact, SUPPRESSED_CONTACT_LABEL } from "../context/identity";

export const SUPPRESSED_IDENTITY_KEYS = [
  "displayName",
  "name",
  "fullName",
  "full_name",
  "email",
  "phone",
  "address",
  "externalId",
  "external_id",
  "sourceRef",
  "source_ref",
  "providerId",
  "provider_id",
  "providerIdentifier",
  "hubspotId",
  "xeroContactId",
  "microsoftId",
] as const;

export function redactSuppressedPayload(
  payload: Record<string, unknown>,
  suppressed = Boolean(payload.suppressed),
): Record<string, unknown> {
  const contactSuppressed =
    suppressed ||
    isSuppressedContact({ suppressed, entityType: String(payload.entityType ?? payload.dataClass ?? "contact") });
  if (!contactSuppressed) return payload;
  const next: Record<string, unknown> = {
    ...payload,
    suppressed: true,
    personalFieldsSuppressed: true,
    displayName: SUPPRESSED_CONTACT_LABEL,
  };
  for (const key of SUPPRESSED_IDENTITY_KEYS) {
    if (key in next) {
      next[key] =
        key === "displayName" || key === "name" || key === "fullName" || key === "full_name"
          ? SUPPRESSED_CONTACT_LABEL
          : null;
    }
  }
  if (next.provenance && typeof next.provenance === "object") {
    next.provenance = { source: "redacted", identityStripped: true };
  }
  if (next.metadata && typeof next.metadata === "object") {
    next.metadata = { identityStripped: true };
  }
  return next;
}

export function reconstructableSuppressedIdentityLeak(payload: unknown): boolean {
  const text = JSON.stringify(payload).toLowerCase();
  return (
    text.includes("hidden person") ||
    text.includes("hidden@example.com") ||
    text.includes("+1-555-0100") ||
    text.includes("1 secret lane")
  );
}

export function assertSuppressedIdentityBlocked(payload: unknown): void {
  if (reconstructableSuppressedIdentityLeak(payload)) {
    throw new Error("suppressed_identity_reconstruction_forbidden");
  }
}
