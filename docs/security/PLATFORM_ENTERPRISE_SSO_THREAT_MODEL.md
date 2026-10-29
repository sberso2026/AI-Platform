# Platform Enterprise SSO Threat Model

Status: **READY** · Phase 16A

## Scope

Threat model for future customer enterprise SSO federation into the authoritative
Platform Auth layer. No production federation is implemented in 16A.

## Assets

- Tenant isolation boundaries
- User identity bindings (`sub` + issuer)
- Session cookies / JWTs
- SSO configuration / secrets references
- Role / entitlement assignments
- Privileged MFA assurance state

## Threats (minimum)

| Threat | Mitigation direction |
|---|---|
| Issuer substitution | Strict issuer allow-list per tenant provider config; reject unknown iss |
| Audience bypass | Validate aud to Platform client/application; reject mismatch |
| Signature / key validation failure | Fail closed; never accept unsigned / wrong-alg tokens |
| Stale JWKS | Cache TTL + forced refresh on kid miss; deny if keys unreachable under policy |
| SAML signature bypass (if SAML used) | Require signed assertions/responses; validate recipient/audience/conditions |
| Email-domain spoofing | Verified domains only; email ≠ identity proof |
| Account-link takeover | Governed linking; verified subject; no silent email match privilege |
| Role/group escalation | Approved mapping policy; privileged mappings require stronger review |
| Tenant confusion | Provider config scoped by tenantId; cross-tenant config IDOR denied |
| Replay | Nonce/state (OIDC); assertion OneTimeUse / NotOnOrAfter (SAML) |
| CSRF / state / nonce failure | Fail closed on state/nonce mismatch |
| Logout / session mismatch | Document IdP logout vs RTB logout; revoke local session on RTB logout |
| IdP misconfiguration | Health checks; configured ≠ healthy |
| Open redirect | Allow-list redirect URIs; no user-controlled open redirects |
| Claim spoofing | Trust only verified IdP signatures; never trust client-supplied claims |
| Subject collision | Composite key issuer+sub; never globalize raw sub alone |
| Domain collision | Unique verified domain ownership per tenant policy |
| Password fallback under SSO_REQUIRED | Forbidden unsafe fallback |
| SSO assumed MFA | Consume AMR/AAL; privileged paths remain Phase 14D fail-closed |

## Fail-closed semantics (locked)

- authenticated externally ≠ authorized internally
- SSO enabled ≠ MFA verified
- email match ≠ identity proof
- domain match ≠ tenant authorization
- IdP group ≠ RTB permission
- JIT user ≠ privileged user
- SSO provider configured ≠ provider healthy
- provider unavailable ≠ password fallback when SSO_REQUIRED

## Out of scope for 16A implementation

Live attack exercises and S07 external pentest are out of scope for this phase.
