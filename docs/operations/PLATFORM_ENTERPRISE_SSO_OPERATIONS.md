# Platform Enterprise SSO Operations

Status: Phase 16B · Version `0.2.0-enterprise-sso`

## Provider onboarding

1. Create provider config (`draft`) with issuer, clientId, secret **reference**, audiences.
2. Validate discovery metadata + JWKS reachability.
3. Complete domain verification (DNS / well-known / governed manual with evidence).
4. Set TenantSsoPolicy mode.
5. Approve role mappings (privileged requires review).
6. Activate provider (`active`) only after validation succeeds.

## Domain verification

- Never auto-route unverified domains.
- Revoked domains stop discovery immediately.
- Same domain cannot silently attach to incompatible tenants.

## Provider outage / JWKS failure / key rotation

- Health → `unavailable` / `degraded` / `invalid`.
- SSO-required tenants: **no password fallback**.
- Unknown signing key: deny authentication.
- Support provider JWKS rotation without pinning a single key permanently.

## Secret rotation

- Rotate via Platform secrets infrastructure (`clientSecretRefId`).
- Revoke old secret reference after cutover.
- Never log or emit plaintext secrets.

## Account linking issues

- Require verified subject challenge or admin-governed proof.
- Email-only matching is rejected.
- Cross-tenant linking is rejected.

## Provider disablement / offboarding

- Disable provider / revoke binding / deactivate membership → block new sessions.
- Document delayed external IdP disable detection when SCIM/webhooks absent.
- Do not claim instantaneous global IdP logout unless verified.

## Role mapping issues

- Unknown groups → no privilege.
- Privileged mappings without approval → denied.
- Changes audited.

## Break-glass boundary

- RTB internal emergency administration ≠ customer SSO recovery.
- No shared universal emergency credential.
- SSO outage must not create uncontrolled Platform bypass under `SSO_REQUIRED`.

## Customer support escalation

1. Confirm tenant SSO mode + provider health.
2. Confirm domain verification status.
3. Confirm binding/membership state (no token inspection in tickets).
4. Escalate IdP Conditional Access / MFA issues to customer IdP owners.
