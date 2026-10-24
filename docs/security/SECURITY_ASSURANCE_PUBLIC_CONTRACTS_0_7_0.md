# Security & Assurance Public Contracts — 0.7.0-customer-assurance

Status: draft public contracts (not frozen 1.0.0)

## Version

- Package / contracts: `0.7.0-customer-assurance`
- Phase: 15G Customer Assurance

## Bounded contracts

| Contract | Purpose |
| --- | --- |
| `CustomerAssuranceProfile` | Scope-bound approved assurance categories |
| `AssuranceDisclosurePolicy` | Audience disclosure via Platform Policy Engine |
| `AssuranceClaimReference` | Versioned customer-facing claim with authoritative refs |
| `AssuranceDocumentReference` | Platform Files document metadata + disclosure level |
| `CustomerAssurancePackage` | Versioned, scope/time-bound published package |
| `CustomerSecurityQuestionnaireResponseReference` | Mapping to approved claims/docs only |
| `AssuranceDisclosureRecord` | Auditable disclosure decision (metadata only) |

## Supporting types

- `SubprocessorAssuranceReference`
- `CustomerAssuranceProjection` (internal → policy → customer-safe)
- Disclosure levels: `public` · `customer_safe` · `approved_reviewer` · `restricted_internal` · `never_disclose`
- Claim statuses: `supported` · `partially_supported` · `unsupported` · `unknown` · `not_applicable` · `not_disclosed` · `requires_external_assurance` · `stale` · `requires_review`

## Semantics locks

- Fail closed on unknown disclosure classification
- No fabricated positive assurance
- No automatic external publication
- No full public Trust Center
- S07 / S08 remain incomplete unless independently evidenced / delivered

## Non-goals

Certification authority · GRC replacement · SIEM · public vulnerability disclosure ·
customer self-certification
