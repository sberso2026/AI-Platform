# EOS 3 Post-GA Change Classification

`EOS_3_POST_GA_CHANGE_CLASSIFICATION_DEFINED=YES`  
`EOS_3_POST_GA_VERSIONING_POLICY_DEFINED=YES`  
`EOS_3_ENGINEERING_SEMANTIC_CHANGE_GATE_DEFINED=YES`

## Canonical change classes

| # | Class | Typical scope |
|---|-------|---------------|
| 1 | `PATCH` | Non-semantic bugfix; docs; telemetry |
| 2 | `SECURITY_PATCH` | CVE/advisory remediation; authz hardening |
| 3 | `OPERATIONAL_HARDENING` | Observability, supportability, recovery ops |
| 4 | `DEFECT_REMEDIATION` | Tracked defect closure with evidence |
| 5 | `SCHEMA_CHANGE` | Additive or migration SQL |
| 6 | `ENGINEERING_SEMANTIC_CHANGE` | Equations, calc logic, units, axes, code interpretation |
| 7 | `QUALIFICATION_CHANGE` | D1/non-D1/solver claim boundary changes |
| 8 | `AI_CAPABILITY_EXPANSION` | Live LLM or new AI authority surface |
| 9 | `CONNECTOR_ENABLEMENT` | Real third-party connectors |
| 10 | `SOLVER_QUALIFICATION` | SPACE GASS / external solver execution claims |
| 11 | `MIGRATION_CAPABILITY_EXPANSION` | Production EOS 2→3 project migration |
| 12 | `JURISDICTION_OR_STANDARD_EXPANSION` | Codes, standards, locale profiles |
| 13 | `EXTERNAL_CUSTOMER_RELEASE` | Legal/commercial hold clearance |
| 14 | `MAJOR_ARCHITECTURAL_CHANGE` | Candidate EOS 4 trigger review |

## Versioning policy

| Change character | Versioning |
|------------------|------------|
| Patch / security / non-semantic operational fixes within frozen 3.0 claims | `3.0.x` |
| Backward-compatible capability additions after separate validation program | future `3.x` (not automatic; new validation + human authorization) |
| Material architectural or incompatible changes | candidate **EOS 4** program — do not stretch EOS 3 indefinitely |

Rules:

- GA tag `engineering-os-v3.0.0` remains immutable.
- A `3.0.x` release must not broaden qualification, enable live LLM/connectors, or clear external-customer hold without its dedicated track/gate.
- Capability enablement never inherits GA support merely because baseline is GA.

## Engineering semantic change gate

Any change involving equations, calculation logic, result semantics, units, axes, code interpretation, or qualification assumptions **must** open:

`QUALIFICATION_IMPACT_ASSESSMENT`

Minimum outcomes:

- `NONE` — documented no semantic impact; may proceed under class + security gate
- `BOUNDED` — requires qualification evidence update before claim change
- `INVALIDATING` — blocks claim continuity until requalification program completes

`ENGINEERING_SEMANTIC_CHANGE` and `QUALIFICATION_CHANGE` cannot be classified as ordinary `PATCH`.
