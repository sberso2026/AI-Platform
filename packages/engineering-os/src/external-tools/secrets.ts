const SECRET_KEY_RE =
  /(password|passwd|secret|token|api[_-]?key|licence[_-]?key|license[_-]?key|client_secret|totp|mfa|otp|private[_-]?key|service[_-]?account|credential)/i;

const SECRET_VALUE_RE =
  /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----|eyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/;

export type SecretScanFinding = { path: string; reason: string };

/**
 * Fail closed if a normal tool-config payload looks like it contains secret *values*.
 * Secret *references* (UUIDs / secret_key names) are allowed on credentialSecretId only.
 */
export function findForbiddenSecretMaterial(
  value: unknown,
  path = "root",
  findings: SecretScanFinding[] = [],
): SecretScanFinding[] {
  if (value == null) return findings;
  if (typeof value === "string") {
    if (SECRET_VALUE_RE.test(value)) findings.push({ path, reason: "secret_value_pattern" });
    return findings;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => findForbiddenSecretMaterial(item, `${path}[${index}]`, findings));
    return findings;
  }
  if (typeof value === "object") {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      const childPath = `${path}.${key}`;
      if (SECRET_KEY_RE.test(key) && key !== "credentialSecretId" && key !== "credential_secret_id") {
        if (typeof child === "string" && child.trim().length > 0 && !isSecretReference(child)) {
          findings.push({ path: childPath, reason: "secret_field_not_a_reference" });
        }
      }
      findForbiddenSecretMaterial(child, childPath, findings);
    }
  }
  return findings;
}

export function isSecretReference(value: string): boolean {
  const trimmed = value.trim();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed)) {
    return true;
  }
  return /^(secrets?:|env:|vault:)/i.test(trimmed);
}

export function assertNoSecretMaterial(value: unknown): void {
  const findings = findForbiddenSecretMaterial(value);
  if (findings.length > 0) {
    throw new Error(`external_tool_secret_forbidden:${findings.map((f) => f.reason).join(",")}`);
  }
}
