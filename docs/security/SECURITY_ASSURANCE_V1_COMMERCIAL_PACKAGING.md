# Security & Assurance V1 Commercial Packaging

Status: Ready · Phase 15H · `SecurityAssuranceV1CommercialPackagingDefined = true`

## Packaging model

| Layer | Inclusion | Notes |
| --- | --- | --- |
| Platform baseline | Included | Control/evidence/assessment/posture foundation; isolation & secure-compute observation |
| Enterprise entitlement | Optional surfaces | Extended compliance intelligence views; enterprise reviewer disclosure |
| Customer assurance entitlement | Optional | Authenticated customer assurance packages / questionnaire mapping |
| Premium assurance (future) | POST_V1 | Continuous monitoring, threat-intel adapters — not V1 required |

## Entitlement rules

- Entitlements are **server-side enforced** (Platform Identity / Entitlements).
- Critical baseline security controls must **never** be exposed only as optional UI toggles.
- Customer-specific packages remain tenant/customer scoped (RLS/IDOR).

## Non-products

Not sold as Sec&A V1 products: SIEM, SOAR, EDR, public Trust Center, certification,
automatic compliance badges.
