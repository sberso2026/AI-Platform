# EOS 3.0 Future Capability Tracks

`EOS_3_FUTURE_CAPABILITY_TRACKS_DEFINED=YES`  
`EOS_3_FUTURE_FEATURE_AUTO_GA_INHERITANCE=NO`  
`EOS_3_FUTURE_QUALIFICATION_AUTO_INHERITANCE=NO`

EOS 3.0 GA baseline is frozen. Future work opens as explicitly scoped post-GA programs — not silent baseline reopenings.

## Required candidate tracks

| # | Track | Required now |
|---|-------|--------------|
| 1 | Live LLM validation and enablement | YES (`EOS_3_LIVE_LLM_FUTURE_TRACK_REQUIRED`) |
| 2 | Real enterprise connectors | YES (`EOS_3_REAL_CONNECTOR_FUTURE_TRACK_REQUIRED`) |
| 3 | SPACE GASS execution qualification | YES |
| 4 | Other external solver qualification | YES (`EOS_3_EXTERNAL_SOLVER_QUALIFICATION_TRACK_REQUIRED`) |
| 5 | Non-D1 calculation qualification | YES |
| 6 | Production EOS 2 project migration validation | YES |
| 7 | PITR / recovery enhancement | YES |
| 8 | Formal GA SLO establishment | YES |
| 9 | External customer legal/commercial release | YES (`EOS_3_EXTERNAL_CUSTOMER_RELEASE_GATE_REQUIRED`) |
| 10 | Public/self-service onboarding (if ever required) | YES |
| 11 | SOC 2 readiness/certification | YES |
| 12 | ISO 27001 readiness/certification | YES |
| 13 | EU AI Act conformity/readiness evidence | YES |
| 14 | Additional disciplines and jurisdiction profiles | YES |

Example program IDs:

- `EOS-3-LIVE-LLM-QUALIFICATION`
- `EOS-3-REAL-CONNECTOR-VALIDATION`
- `EOS-3-EXTERNAL-SOLVER-QUALIFICATION`
- `EOS-3-NON-D1-QUALIFICATION`
- `EOS-3-PRODUCTION-MIGRATION-VALIDATION`
- `EOS-3-EXTERNAL-CUSTOMER-RELEASE-GATE`

## Live LLM track must validate

Provider/model provenance; privacy; prompt/tool injection; tenant isolation; authority; tool permissions; failure behavior; evaluation; Production rollout.

## Connector track

Each material connector requires its own security/authority validation. Availability ≠ qualification.

## Solver track

Connector availability does not equal solver qualification. SPACE GASS and other external solvers require explicit execution qualification evidence.

## External customer release gate

Remains separate from technical GA. Hold stays `ACTIVE` until legal/commercial clearance.
