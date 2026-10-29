# Engineering Review MFA enrollment and recovery

This documents the ERA-7A MFA enrollment/challenge UI. It does **not** replace server-side Review identity enforcement.

## Product UI

- Enrollment: `/settings/security`
- Challenge: `/login/mfa`
- Mechanism: Supabase Auth TOTP (`auth.mfa.enroll`, `challenge`, `verify`, `listFactors`, `getAuthenticatorAssuranceLevel`)

There is no proprietary TOTP implementation.

## Recovery

This product does **not** issue or store recovery codes.

If a pilot user loses their authenticator:

1. An authorized administrator uses the Supabase Auth dashboard or Admin API for project `rntonzigxwxcjlcsadip` only.
2. The administrator may unenroll the user’s TOTP factor and require re-enrollment at `/settings/security`.
3. Do not use EOS project `wcydlhqiqdwgoaqrlget` for this reset.
4. After reset, Tenant A `requireMfa=true` still rejects AAL1 `/review` access until the user completes enrollment and challenge.

Do not invent an in-app break-glass MFA bypass.

## Unenrollment

Verified-factor removal is deferred in the product UI so the controlled pilot cannot weaken MFA from the security page.
