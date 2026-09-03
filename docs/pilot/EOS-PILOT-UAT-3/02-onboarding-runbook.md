# Onboarding runbook (canonical only)

Use this **after** a row exists in [00-participant-register.md](./00-participant-register.md) with a real work email. Do not invite hypothetical users.

## Preconditions

- Preview host only: https://eos-pilot.rtbea.com.au
- Founder signed in with password Sign In
- EOS pool has a free seat (after 2026-09-03 release: **3 available**, founder retained) **or** a further fixture seat has just been released ([01-seat-inventory.md](./01-seat-inventory.md))
- Custom SMTP is the configured Auth mailer (activation goes to the participant inbox)
- `assignSeat` is **not** required on invite; assign the seat as a separate Commerce step so capacity cannot be exceeded mid-invite

## Per participant

1. **Identity.** Users & Permissions → Open user management (`/users`). Invite email + tenant role (`admin` / `member` / `viewer` per [03-role-access-matrix.md](./03-role-access-matrix.md)). Canonical POST `/api/platform/identity/members`. Do not tick a seat assign if the pool is still 5/5.
2. **Activation.** Participant receives the Auth activation / recovery mail from configured SMTP. Redirect must be `https://eos-pilot.rtbea.com.au/reset-password` (or the certified recovery path). If 502 `activation_delivery_failed`, use **Resend activation**. Do not auto-confirm.
3. **Password.** Participant sets their own password. No temporary password. No shared inbox. No operator-set password.
4. **Login.** Participant uses **Sign In** (password), not SSO, unless later certified. Confirm they land on Command Centre for RTB Engineering Pilot LAUNCH-1.
5. **Tenant / workspace.** Header shows RTB Engineering. No prompt to join another tenant. If `identity_exists` on another tenant, stop.
6. **Role.** Confirm directory role matches the register. Do not assign `owner`.
7. **Seat.** Licences & Seats → assign that user id to pool `299fe9d8-d0d1-4414-acff-770b7afcaf74`. Confirm pool still ≤ 5/5. Unseated users must hit the seat gate (record that as evidence).
8. **Isolation.** Participant must not see Worley/Yahoo data, WSB-1RC as normal work, or other-tenant projects.

## Forbidden

- Temporary passwords / `breakGlass`
- Auto-confirm (`email_confirm: true`)
- Shared accounts
- Direct Auth SQL
- Creating a second Auth user for the same email
- Removing founder seat
- Production

## Evidence to capture

- Invite HTTP result (activation_sent / pending_activation) without the action_link
- Timestamp of activation email (participant confirms receipt; do not paste tokens)
- First successful login time (participant or operator observation)
- Seat assign outbox event
- Screenshot of Command Centre **after** load (no secrets)
