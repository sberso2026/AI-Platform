export const INVITE_STATES = [
  "pending",
  "sent",
  "accepted",
  "rate_limited",
  "invalid_recipient",
  "delivery_failed",
  "seat_blocked",
] as const;

export type InviteState = (typeof INVITE_STATES)[number];

export type ClassifiedInviteFailure = {
  code: string;
  message: string;
  status: number;
  inviteState: InviteState;
};

function haystack(err: unknown): { message: string; code: string } {
  const message = err instanceof Error ? err.message : String(err ?? "");
  const code =
    err && typeof err === "object" && "code" in err ? String((err as { code?: unknown }).code ?? "") : "";
  return { message, code };
}

/**
 * Map GoTrue / Auth invite failures to bounded Platform invite errors.
 * Does not treat recipient validation as SMTP delivery failure.
 */
export function classifyInviteFailure(err: unknown): ClassifiedInviteFailure {
  const { message, code } = haystack(err);
  const blob = `${code} ${message}`.toLowerCase();

  if (
    blob.includes("over_email_send_rate_limit") ||
    blob.includes("email rate limit") ||
    /rate limit/i.test(blob)
  ) {
    return {
      code: "invite_email_rate_limited",
      message:
        "Invite email could not be sent because the Auth mailer rate limit was exceeded. Retry later. Temporary passwords are internal break-glass only.",
      status: 429,
      inviteState: "rate_limited",
    };
  }

  if (
    blob.includes("email_address_invalid") ||
    /email address .+ is invalid/i.test(message) ||
    blob.includes("invalid_recipient")
  ) {
    return {
      code: "invite_invalid_recipient",
      message:
        "Auth rejected this email address (recipient validation). This is not an SMTP delivery failure. Confirm the mailbox exists, then retry once the mailer window is clear.",
      status: 422,
      inviteState: "invalid_recipient",
    };
  }

  if (blob.includes("seat") && (blob.includes("limit") || blob.includes("exceeded") || blob.includes("not assigned"))) {
    return {
      code: "invite_seat_blocked",
      message: "Invite recorded but Engineering OS seat assignment is blocked by licence capacity.",
      status: 409,
      inviteState: "seat_blocked",
    };
  }

  if (
    blob.includes("error sending") ||
    blob.includes("invite email could not be sent") ||
    blob.includes("failed to send")
  ) {
    return {
      code: "invite_delivery_failed",
      message: "Auth accepted the address but the invite email could not be delivered. Check the Auth mailer/SMTP configuration.",
      status: 502,
      inviteState: "delivery_failed",
    };
  }

  return {
    code: "invite_failed",
    message: message || "Invite failed",
    status: 500,
    inviteState: "delivery_failed",
  };
}

export function invitationStatusFromAuth(input: {
  emailConfirmed: boolean;
  invited: boolean;
}): InviteState {
  if (input.emailConfirmed) return "accepted";
  if (input.invited) return "sent";
  return "pending";
}
