# Security & Assurance V1 Packaging

Status: Frozen · Phase 15I · `SecurityAssuranceV1CommercialPackagingDefined = true`

## Layers

| Layer | Inclusion | Notes |
| --- | --- | --- |
| Platform baseline security | Included | Identity MFA/RLS/JWT, Policy Engine, Audit — owned outside Sec&A |
| Security & Assurance baseline | Included with platform | Control/evidence/assessment/posture; isolation & secure-compute observation |
| Enterprise assurance | Entitled | Extended compliance intelligence views; reviewer disclosure |
| Customer assurance entitlement | Entitled | Authenticated packages, questionnaire mapping, approved documents |
| Future premium / custom mappings | POST_V1 | Continuous monitoring, threat-intel adapters |

## Rules

- Entitlements are **server-side enforced**.
- Critical baseline security controls must **never** become optional premium UI features.
- CustomerTrustCenter / SIEM / certification products are **not** sold as Sec&A V1.
