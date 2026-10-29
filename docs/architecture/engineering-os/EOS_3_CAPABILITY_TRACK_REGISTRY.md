# EOS 3 Capability Track Registry

`EOS_3_CAPABILITY_TRACK_REGISTRY_CREATED=YES`  
`EOS_3_CAPABILITY_TRACK_STATE_MODEL_DEFINED=YES`

## State model

`PROPOSED` → `ASSESSED` → `APPROVED` → `IN_DEVELOPMENT` → `VALIDATION` → `QUALIFICATION` → `PILOT` → `GA_ENABLED`

Terminal / parking: `DEFERRED` | `REJECTED`

## Registry (initial)

| Track ID | Class affinity | Initial state | Notes |
|----------|----------------|---------------|-------|
| `EOS-3-LIVE-LLM-QUALIFICATION` | AI_CAPABILITY_EXPANSION | PROPOSED | Must validate provenance, privacy, injection, isolation, authority, tools, failure, eval, rollout |
| `EOS-3-REAL-CONNECTOR-VALIDATION` | CONNECTOR_ENABLEMENT | PROPOSED | Per-connector security/authority; remediates D002 control path |
| `EOS-3-SPACE-GASS-EXECUTION-QUALIFICATION` | SOLVER_QUALIFICATION | PROPOSED | Execution certification; connector ≠ qualification |
| `EOS-3-EXTERNAL-SOLVER-QUALIFICATION` | SOLVER_QUALIFICATION | PROPOSED | Global external solver claims |
| `EOS-3-NON-D1-QUALIFICATION` | QUALIFICATION_CHANGE | PROPOSED | Does not inherit D1 |
| `EOS-3-PRODUCTION-MIGRATION-VALIDATION` | MIGRATION_CAPABILITY_EXPANSION | PROPOSED | Production EOS 2→3 project migration |
| `EOS-3-PITR-AND-RECOVERY-HARDENING` | OPERATIONAL_HARDENING | PROPOSED | BL-REC-001 |
| `EOS-3-GA-SLO-MATURATION` | OPERATIONAL_HARDENING | PROPOSED | Evidence-based SLO only |
| `EOS-3-EXTERNAL-CUSTOMER-RELEASE-GATE` | EXTERNAL_CUSTOMER_RELEASE | PROPOSED | Separate from technical GA |
| `EOS-3-PUBLIC-SELF-SERVICE-ONBOARDING` | EXTERNAL_CUSTOMER_RELEASE / access expansion | PROPOSED | After external release policy |
| `EOS-3-SOC2-READINESS` | OPERATIONAL_HARDENING / compliance | PROPOSED | Claim remains NO until certified |
| `EOS-3-ISO27001-READINESS` | compliance | PROPOSED | Claim remains NO until certified |
| `EOS-3-EU-AI-ACT-READINESS` | compliance / AI | PROPOSED | Claim remains NO until certified |
| `EOS-3-ADDITIONAL-DISCIPLINE-QUALIFICATION` | QUALIFICATION_CHANGE | PROPOSED | New disciplines |
| `EOS-3-JURISDICTION-AND-STANDARDS-EXPANSION` | JURISDICTION_OR_STANDARD_EXPANSION | PROPOSED | Codes/standards profiles |

## Authority

AI may propose/assess/draft. Humans authorize state transitions past `APPROVED` and any Production enablement.
