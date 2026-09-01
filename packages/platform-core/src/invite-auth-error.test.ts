import { describe, expect, it } from "vitest";
import { classifyInviteFailure, invitationStatusFromAuth } from "./invite-auth-error";

describe("classifyInviteFailure", () => {
  it("maps GoTrue recipient validation separately from SMTP", () => {
    const result = classifyInviteFailure(new Error('Email address "a@b.com" is invalid'));
    expect(result.code).toBe("invite_invalid_recipient");
    expect(result.status).toBe(422);
    expect(result.inviteState).toBe("invalid_recipient");
  });

  it("maps built-in mailer rate limit", () => {
    const result = classifyInviteFailure({ message: "email rate limit exceeded", code: "over_email_send_rate_limit" });
    expect(result.code).toBe("invite_email_rate_limited");
    expect(result.status).toBe(429);
    expect(result.inviteState).toBe("rate_limited");
  });

  it("maps delivery failure after acceptance", () => {
    const result = classifyInviteFailure(new Error("Invite email could not be sent"));
    expect(result.code).toBe("invite_delivery_failed");
    expect(result.status).toBe(502);
  });
});

describe("invitationStatusFromAuth", () => {
  it("treats confirmed users as accepted", () => {
    expect(invitationStatusFromAuth({ emailConfirmed: true, invited: true })).toBe("accepted");
  });
  it("treats unconfirmed invited users as sent", () => {
    expect(invitationStatusFromAuth({ emailConfirmed: false, invited: true })).toBe("sent");
  });
});
