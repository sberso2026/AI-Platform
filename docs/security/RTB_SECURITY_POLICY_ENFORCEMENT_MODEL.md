# RTB Security Policy Enforcement Model

Status: Phase 14C · `existingPolicyEngineReused = true`

## Decision

Reuse existing Platform Commerce entitlement / authorization infrastructure as the
primary **Policy Decision** substrate for Engineering OS product access.

Do **not** create a competing second Policy Engine in Phase 14C.

## Semantics

| Role | Locus |
| --- | --- |
| Policy Decision Point (PDP) | Commerce entitlement + service assertion policies (`assertVerifiedCommerceContext`, route policies) |
| Policy Enforcement Point (PEP) | API route guards, RLS, Engineering service guards, execution-host authz, tool permissions |

## Decision inputs (current / future)

identity · role · tenant · workspace · resource · operation · entitlements ·
(data classification — future) · AI provider · engineering tool · execution host ·
risk/security context (future)

## GA note

Existing PDP/PEP is sufficient for module access enforcement already certified.
Gaps (MFA step-up, classification-aware AI deny) are tracked in the Security Gap
Register — not solved by inventing a second engine.
