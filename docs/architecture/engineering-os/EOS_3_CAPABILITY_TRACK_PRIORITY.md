# EOS 3 Capability Track Priority

`EOS_3_CAPABILITY_TRACK_PRIORITIZATION_COMPLETE=YES`

## Prioritization principle

Rank for **real commercial usability without weakening engineering governance**.  
Do **not** auto-select live LLM solely because AI is strategic.  
Do **not** prioritize solely by development convenience.

Scoring dimensions used: customer value, engineering value, revenue impact, adoption impact, dependencies, technical risk, security risk, qualification burden, implementation effort, evidence availability, regulatory/compliance impact.

## Ranked list (intake recommendation)

| Rank | Track ID | Rationale (short) |
|------|----------|-------------------|
| 1 | `EOS-3-EXTERNAL-CUSTOMER-RELEASE-GATE` | Highest immediate commercial leverage; clears legal/commercial path while keeping technical GA claims intact |
| 2 | `EOS-3-PRODUCTION-MIGRATION-VALIDATION` | Adoption path for existing EOS 2 Production projects; high conversion leverage |
| 3 | `EOS-3-REAL-CONNECTOR-VALIDATION` | Enterprise workflow usability; remediates D002 under controlled per-connector security |
| 4 | `EOS-3-PITR-AND-RECOVERY-HARDENING` | Production trust / sales risk reduction without changing engineering semantics |
| 5 | `EOS-3-SPACE-GASS-EXECUTION-QUALIFICATION` | High engineering commercial value adjacent to D1; explicit qualification burden |
| 6 | `EOS-3-EXTERNAL-SOLVER-QUALIFICATION` | Broader solver claims; depends on connector/security evidence |
| 7 | `EOS-3-GA-SLO-MATURATION` | Supportability/commercial assurance using observed Production evidence |
| 8 | `EOS-3-LIVE-LLM-QUALIFICATION` | Strategic AI value; high security/privacy/authority burden — not automatic top |
| 9 | `EOS-3-NON-D1-QUALIFICATION` | Expands calculation market; heavy qualification burden; no D1 inheritance |
| 10 | `EOS-3-SOC2-READINESS` | Enterprise procurement often blocked without readiness path |
| 11 | `EOS-3-ISO27001-READINESS` | Regional/enterprise compliance demand |
| 12 | `EOS-3-EU-AI-ACT-READINESS` | Regulatory readiness for AI claims; couples with live-LLM track |
| 13 | `EOS-3-ADDITIONAL-DISCIPLINE-QUALIFICATION` | Growth after core migration/connectors mature |
| 14 | `EOS-3-JURISDICTION-AND-STANDARDS-EXPANSION` | Geographic expansion; semantic/qualification gated |
| 15 | `EOS-3-PUBLIC-SELF-SERVICE-ONBOARDING` | Lowest near-term priority; after external-customer policy and access model redesign |

## Top five (phase output binding)

1. `EOS-3-EXTERNAL-CUSTOMER-RELEASE-GATE`  
2. `EOS-3-PRODUCTION-MIGRATION-VALIDATION`  
3. `EOS-3-REAL-CONNECTOR-VALIDATION`  
4. `EOS-3-PITR-AND-RECOVERY-HARDENING`  
5. `EOS-3-SPACE-GASS-EXECUTION-QUALIFICATION`

## Dependency notes

- External customer release does **not** auto-enable live LLM, connectors, public signup, or broader qualification.
- Migration validation should not run without migration guard + security gate + human GO.
- Connector validation precedes or pairs with solver qualification (availability ≠ qualification).
- Live LLM should not jump ahead of recovery/customer-release readiness solely for product marketing.
- Public self-service depends on external-customer gate and remains default-deny until explicitly authorized.

Human authority required to promote any track beyond `APPROVED`.
