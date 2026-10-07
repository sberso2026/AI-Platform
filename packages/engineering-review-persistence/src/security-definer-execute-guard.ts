export const INTENTIONAL_AUTHENTICATED_DEFINERS = [
  "get_user_tenant_ids",
  "is_tenant_member",
  "has_permission",
  "is_platform_admin",
] as const;

/** Empty: PUBLIC/anon EXECUTE on SECURITY DEFINER is never implicit. */
export const INTENTIONAL_PUBLIC_ANON_DEFINERS: readonly string[] = [];

export const QUARANTINED_UNTRUSTED_DEFINERS = ["provision_signup_commercial_defaults"] as const;

export type DefinerExecuteRow = {
  name: string;
  grantee: string;
};

export type DefinerExecuteClass = "INTENTIONAL_SAFE" | "QUARANTINED" | "REQUIRES_REVIEW";

export function classifyDefinerExecute(row: DefinerExecuteRow): DefinerExecuteClass {
  if ((QUARANTINED_UNTRUSTED_DEFINERS as readonly string[]).includes(row.name)) {
    return "QUARANTINED";
  }
  if (
    (row.grantee === "PUBLIC" || row.grantee === "anon") &&
    INTENTIONAL_PUBLIC_ANON_DEFINERS.includes(row.name)
  ) {
    return "INTENTIONAL_SAFE";
  }
  if (
    (INTENTIONAL_AUTHENTICATED_DEFINERS as readonly string[]).includes(row.name) &&
    row.grantee === "authenticated"
  ) {
    return "INTENTIONAL_SAFE";
  }
  return "REQUIRES_REVIEW";
}

function isUntrustedGrantee(grantee: string): boolean {
  return grantee === "PUBLIC" || grantee === "anon" || grantee === "authenticated";
}

export function untrustedExecuteOnQuarantined(rows: DefinerExecuteRow[]): string[] {
  return rows
    .filter((row) => classifyDefinerExecute(row) === "QUARANTINED")
    .filter((row) => isUntrustedGrantee(row.grantee))
    .map((row) => `${row.name}:${row.grantee}`);
}

/** Fail closed: PUBLIC/anon/authenticated EXECUTE without explicit reviewed justification. */
export function untrustedExecuteWithoutJustification(rows: DefinerExecuteRow[]): string[] {
  return rows
    .filter((row) => isUntrustedGrantee(row.grantee))
    .filter((row) => classifyDefinerExecute(row) !== "INTENTIONAL_SAFE")
    .map((row) => `${row.name}:${row.grantee}:${classifyDefinerExecute(row)}`);
}
