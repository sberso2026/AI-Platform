/** Canonical Engineering OS identity onboarding states. Derived from Auth + membership; not a second identity store. */

export const IDENTITY_ONBOARDING_STATES = [
  "pending_activation",
  "active",
  "activation_delivery_failed",
  "suspended",
] as const;

export type IdentityOnboardingState = (typeof IDENTITY_ONBOARDING_STATES)[number];

export const ACTIVATION_RESEND_WINDOW_MS = 60 * 60 * 1000;

export class IdentityProvisioningError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "IdentityProvisioningError";
  }
}

export function deriveOnboardingState(input: {
  emailConfirmed: boolean;
  membershipStatus?: string | null;
  activationDelivery?: string | null;
}): IdentityOnboardingState {
  const membership = (input.membershipStatus ?? "").toLowerCase();
  if (membership === "suspended" || membership === "revoked" || membership === "disabled") {
    return "suspended";
  }
  if (input.emailConfirmed) return "active";
  if ((input.activationDelivery ?? "").toLowerCase() === "failed") return "activation_delivery_failed";
  return "pending_activation";
}

export function buildInviteUserMetadata(input: {
  tenantId: string;
  workspaceId: string;
  roleSlug: string;
  invitedBy: string;
}): Record<string, string> {
  return {
    invited_tenant_id: input.tenantId,
    invited_role_slug: input.roleSlug,
    invited_workspace_id: input.workspaceId,
    invited_by: input.invitedBy,
    activation_delivery: "pending",
  };
}

export function assertActivationResendAllowed(lastSentAt: string | null | undefined, now = Date.now()): void {
  if (!lastSentAt) return;
  const then = Date.parse(lastSentAt);
  if (!Number.isFinite(then)) return;
  const remaining = ACTIVATION_RESEND_WINDOW_MS - (now - then);
  if (remaining > 0) {
    throw new IdentityProvisioningError(
      "rate_limited",
      "Activation was sent recently. Wait before resending.",
      429,
      { retryAfterMs: remaining },
    );
  }
}

export function shouldBlockSeatAssignment(activeCount: number, totalSeats: number): boolean {
  if (!Number.isFinite(activeCount) || !Number.isFinite(totalSeats)) return true;
  return activeCount >= totalSeats;
}

export function classifyIdentityFailure(err: unknown): IdentityProvisioningError {
  if (err instanceof IdentityProvisioningError) return err;
  const message = err instanceof Error ? err.message : String(err ?? "");
  const code =
    err && typeof err === "object" && "code" in err ? String((err as { code?: unknown }).code ?? "") : "";
  const blob = `${code} ${message}`.toLowerCase();

  if (
    blob.includes("over_email_send_rate_limit") ||
    blob.includes("email rate limit") ||
    /rate limit/i.test(blob)
  ) {
    return new IdentityProvisioningError(
      "rate_limited",
      "Auth mailer rate limit exceeded. The pending identity was kept. Retry activation later.",
      429,
    );
  }

  if (
    blob.includes("already been registered") ||
    blob.includes("already registered") ||
    blob.includes("user already exists") ||
    blob.includes("identity_exists")
  ) {
    return new IdentityProvisioningError(
      "identity_exists",
      "An Auth user with this email already exists. Do not create a duplicate.",
      409,
    );
  }

  if (blob.includes("owner tenant role cannot be changed")) {
    return new IdentityProvisioningError(
      "owner_role_locked",
      "Owner tenant role cannot be changed with the invite role selector",
      409,
    );
  }

  if (
    blob.includes("seat_limit_exceeded") ||
    blob.includes("seat_capacity_exceeded") ||
    (blob.includes("seat") && (blob.includes("limit") || blob.includes("exceeded") || blob.includes("capacity")))
  ) {
    return new IdentityProvisioningError(
      "seat_capacity_exceeded",
      "Engineering OS seat capacity is exceeded. Identity can remain pending; application access was not assigned.",
      409,
    );
  }

  if (
    blob.includes("email_address_invalid") ||
    /email address .+ is invalid/i.test(message) ||
    blob.includes("invalid_recipient")
  ) {
    return new IdentityProvisioningError(
      "invalid_recipient",
      "Auth rejected this email address (recipient validation). If an identity was already created, it remains pending activation.",
      422,
    );
  }

  if (
    blob.includes("error sending") ||
    blob.includes("invite email could not be sent") ||
    blob.includes("failed to send") ||
    blob.includes("activation_delivery_failed")
  ) {
    return new IdentityProvisioningError(
      "activation_delivery_failed",
      "Pending Auth identity was kept, but the activation email could not be delivered. Use Resend activation after SMTP is ready.",
      502,
    );
  }

  return new IdentityProvisioningError("identity_failed", message || "Identity provisioning failed", 500);
}
