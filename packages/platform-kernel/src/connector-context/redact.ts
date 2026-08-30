const SECRET_KEYS = [
  "secret",
  "token",
  "accessToken",
  "access_token",
  "refreshToken",
  "refresh_token",
  "clientSecret",
  "client_secret",
  "password",
  "apiKey",
  "api_key",
  "bearer",
  "authorization",
  "privateKey",
  "private_key",
  "hapikey",
  "secretId",
  "secret_id",
] as const;

const SUPPRESSED_IDENTITY_KEYS = [
  "displayName",
  "name",
  "fullName",
  "full_name",
  "email",
  "phone",
  "address",
  "externalId",
  "external_id",
] as const;

export function redactConnectorSecrets<T>(value: T): T {
  if (value == null) return value;
  if (typeof value === "string") {
    if (/bearer\s+\S+/i.test(value) || /sk_live|xox[baprs]-|eyJ[A-Za-z0-9_-]+\./.test(value)) {
      return "[redacted]" as T;
    }
    return value;
  }
  if (Array.isArray(value)) return value.map((item) => redactConnectorSecrets(item)) as T;
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (SECRET_KEYS.some((name) => name.toLowerCase() === key.toLowerCase())) {
        continue;
      }
      out[key] = redactConnectorSecrets(item);
    }
    return out as T;
  }
  return value;
}

export function redactSuppressedConnectorPayload(
  payload: Record<string, unknown>,
  suppressed: boolean,
): Record<string, unknown> {
  const next = redactConnectorSecrets({ ...payload });
  if (!suppressed) return next;
  const out: Record<string, unknown> = { ...next, suppressed: true, personalFieldsSuppressed: true };
  for (const key of SUPPRESSED_IDENTITY_KEYS) {
    if (key in out) out[key] = key === "displayName" || key === "name" || key === "fullName" || key === "full_name" ? "[suppressed]" : null;
  }
  return out;
}
