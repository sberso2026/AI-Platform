/**
 * Resource-specific Microsoft Graph application roles for change-notification subscriptions.
 * Graph authorizes subscriptions via the subscribed resource permission — there is no
 * generic subscription application role for this path.
 */

export const CERTIFIED_TEAMS_TRANSCRIPT_SUBSCRIPTION_RESOURCE =
  "communications/onlineMeetings/getAllTranscripts" as const;

/** Exact resource paths (normalized, no leading slash). */
export const REQUIRED_APPLICATION_ROLES_BY_RESOURCE: Readonly<
  Record<string, readonly string[]>
> = {
  "communications/onlineMeetings/getAllTranscripts": ["OnlineMeetingTranscript.Read.All"],
  "users/{userId}/onlineMeetings/getAllTranscripts": ["OnlineMeetingTranscript.Read.All"],
  "communications/onlineMeetings/{onlineMeetingId}/transcripts": [
    "OnlineMeetingTranscript.Read.All",
  ],
};

const INVALID_GENERIC_SUBSCRIPTION_ROLES = [
  "Subscription.ReadWrite.All",
  "Subscriptions.ReadWrite.All",
] as const;

export function normalizeGraphSubscriptionResource(resource: string): string {
  return resource.trim().replace(/^\/+/, "");
}

/**
 * Resolve required application roles for a Graph subscription resource.
 * Parameterized segments are matched by pattern.
 * Unknown resources throw TEAMS_SUBSCRIPTION_RESOURCE_UNSUPPORTED (fail closed).
 */
export function requiredApplicationRolesForSubscriptionResource(
  resource: string,
): readonly string[] {
  const normalized = normalizeGraphSubscriptionResource(resource);
  const exact = REQUIRED_APPLICATION_ROLES_BY_RESOURCE[normalized];
  if (exact) return exact;

  if (/^communications\/onlineMeetings\/[^/]+\/transcripts$/i.test(normalized)) {
    return ["OnlineMeetingTranscript.Read.All"];
  }
  if (/^users\/[^/]+\/onlineMeetings\/getAllTranscripts$/i.test(normalized)) {
    return ["OnlineMeetingTranscript.Read.All"];
  }

  const err = new Error("TEAMS_SUBSCRIPTION_RESOURCE_UNSUPPORTED");
  (err as Error & { code: string; resource: string }).code =
    "TEAMS_SUBSCRIPTION_RESOURCE_UNSUPPORTED";
  (err as Error & { code: string; resource: string }).resource = normalized;
  throw err;
}

export function assertNoInvalidGenericSubscriptionRoles(roles: readonly string[]): void {
  const hit = roles.find((r) =>
    (INVALID_GENERIC_SUBSCRIPTION_ROLES as readonly string[]).includes(r),
  );
  if (hit) {
    throw new Error(
      `Invalid generic subscription role asserted: ${hit}. Use resource-specific Graph permissions.`,
    );
  }
}

export function tokenRolesSatisfySubscriptionResource(
  resource: string,
  tokenRoles: readonly string[] | null | undefined,
): { ok: boolean; required: readonly string[]; missing: string[] } {
  const required = requiredApplicationRolesForSubscriptionResource(resource);
  assertNoInvalidGenericSubscriptionRoles(required);
  const present = new Set((tokenRoles ?? []).map((r) => r.trim()).filter(Boolean));
  const missing = required.filter((r) => !present.has(r));
  return { ok: missing.length === 0, required, missing };
}

export function isInvalidGenericSubscriptionRoleName(name: string): boolean {
  return (INVALID_GENERIC_SUBSCRIPTION_ROLES as readonly string[]).includes(name);
}

export { INVALID_GENERIC_SUBSCRIPTION_ROLES };

