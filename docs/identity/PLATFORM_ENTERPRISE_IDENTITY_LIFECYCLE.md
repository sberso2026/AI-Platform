# Platform Enterprise Identity Lifecycle

Status: **DEFINED** · Phase 16A · Discovery only

## Authentication vs provisioning

| Concern | Scope |
|---|---|
| SSO authentication | Federated sign-in into authoritative Platform Auth |
| Identity lifecycle provisioning | Create/update/disable users & memberships (SCIM / admin / JIT) |

These are distinct. Closing S08 requires authentication federation first.

## JIT provisioning

- Classification: **OPTIONAL** for initial enterprise SSO
- Not required to begin OIDC federation if users are pre-provisioned / linked
- If enabled later: default bounded tenant membership/role; **no** uncontrolled group→admin mapping
- JIT user ≠ privileged user

## SCIM 2.0

- Classification: **POST_V1** for S08 closure
- May appear as customer-specific Tier-1 procurement dependency
- Not implemented in Phase 16A
- Do not conflate SCIM with SSO authentication

## Account linking

Safe linking for existing local RTB accounts must prevent:

- email takeover
- cross-tenant linking
- duplicate identity
- unverified email matching
- silent privilege escalation

Candidate linking requires governed verification (challenge / admin approval / verified subject).

## Offboarding

When federated identity is disabled/removed at Customer IdP:

- RTB access must terminate according to defined session/policy windows
- Real-time detection may be limited without SCIM/webhook; do not claim instantaneous revocation if not guaranteed
- Token refresh / session revalidation must fail closed when binding revoked

## Break-glass / recovery

- Preserve existing Phase 14D break-glass governance
- Customer SSO outage ≠ uncontrolled Platform password bypass under `SSO_REQUIRED`
- Separate RTB internal emergency administration from customer account recovery
- No shared universal emergency credential
