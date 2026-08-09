/**
 * Enterprise identity events — metadata/IDs only; never tokens or secrets.
 */
export type EnterpriseIdentityEventType =
  | "identity.enterprise.provider.configured"
  | "identity.enterprise.provider.activated"
  | "identity.enterprise.domain.verified"
  | "identity.enterprise.login.succeeded"
  | "identity.enterprise.login.denied"
  | "identity.enterprise.binding.created"
  | "identity.enterprise.binding.revoked"
  | "identity.enterprise.role_mapping.changed";

export function createEnterpriseIdentityEvent(
  eventType: EnterpriseIdentityEventType,
  refs: Record<string, string | number | boolean | null>,
) {
  for (const banned of ["token", "secret", "password", "clientSecret", "client_secret"]) {
    if (Object.prototype.hasOwnProperty.call(refs, banned)) {
      throw new Error("enterprise_identity_event_must_not_contain_secrets");
    }
  }
  return {
    eventType,
    payload: { ...refs, containsSensitivePayload: false as const },
  };
}
