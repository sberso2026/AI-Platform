# EOS 3 Post-GA Maintenance Baseline

`PHASE=EOS-3-MAINT-0-POST-GA-MAINTENANCE-BASELINE-AND-CAPABILITY-TRACK-INTAKE`

## Purpose

Operational maintenance baseline after EOS 3.0 GA program closeout. This is **not** EOS 3.15. The EOS 3.0 development program remains closed.

## Frozen GA state (verified)

| Field | Value |
|-------|-------|
| Version | `3.0.0` |
| Release status | `GENERAL_AVAILABILITY` |
| Activation status | `ACTIVE_CONTROLLED_GA` |
| Development program | `CLOSED` |
| Maintenance mode | `ACTIVE` |
| Migration ledger | `170` |
| Release tag | `engineering-os-v3.0.0` → `5ffe47e8b987df53d3afb06703f854910178c4d3` |
| Canonical GA baseline FP | `sha256:3970ed9b7c5748e37beaa2f30ce055d8dc347d43291da00e779af7e724589291` |
| Evidence manifest FP | `sha256:f3ef08cb12f458c5a77d462d6e5061b278fbd09af8784973fec7c012bde04042` |
| Program closeout FP | `sha256:8b4ebbb38e33bdcd7ce3e8d09283f0a8501da42296dcd8af7eadad755d7d4ff8` |

`EOS_3_0_FROZEN_GA_BASELINE_VERIFIED=YES`

## Baseline protection

`EOS_3_0_GA_BASELINE_MUTATION_ALLOWED=NO`

- Do not rewrite frozen GA baseline / evidence / closeout fingerprints.
- Do not retarget `engineering-os-v3.0.0`.
- Do not silently expand GA claims, access, qualification, or disabled capabilities.
- Future work uses governed post-GA change tracks only.

`EOS_3_FUTURE_FEATURE_AUTO_GA_INHERITANCE=NO`  
`EOS_3_FUTURE_QUALIFICATION_AUTO_INHERITANCE=NO`

## Preserved product controls

| Control | Value |
|---------|-------|
| Access model | `EXPLICIT_ENTITLEMENT_AND_ENROLLMENT` / default `DENY` |
| External customer release | `NO` / hold `ACTIVE` |
| Public self-service | `NO` |
| Live LLM | `NOT_SUPPORTED` |
| Real connectors | `NOT_SUPPORTED` |
| D1 | `QUALIFIED_BOUNDED` |
| Non-D1 | `NOT_QUALIFIED` |
| SPACE GASS global | `NO` |
| External solver global | `NO` |
| Formal SOC2 / ISO27001 / EU AI Act | `NO` / `NO` / `NO` |
| Formal GA SLO | `NO` |
| PITR | `NO` (risk acceptance still valid; enhancement backlog exists) |

## Related artifacts

- `EOS_3_POST_GA_CHANGE_CLASSIFICATION.md`
- `EOS_3_POST_GA_RELEASE_GOVERNANCE.md`
- `EOS_3_CAPABILITY_TRACK_REGISTRY.md`
- `EOS_3_CAPABILITY_TRACK_PRIORITY.md`
- `EOS_3_POST_GA_RISK_AND_DEFECT_BACKLOG.md`
- `EOS_4_ARCHITECTURAL_TRIGGER_CRITERIA.md`
