# EOS 3.0 Maintenance Governance

`EOS_3_0_MAINTENANCE_MODE=ACTIVE`  
`EOS_3_DEVELOPMENT_PROGRAM_STATUS=CLOSED`  
`EOS_3_0_CANONICAL_BASELINE_FROZEN=YES`  
`EOS_3_0_GA_EVIDENCE_FROZEN=YES`

## Posture

EOS 3.0.0 remains General Availability under `ACTIVE_CONTROLLED_GA`:

- Access: `EXPLICIT_ENTITLEMENT_AND_ENROLLMENT` / default `DENY`
- External customer hold: `ACTIVE` until a separate release gate
- Public self-service: `NO`
- Kill switch and application rollback remain operational
- Canonical GA baseline fingerprint and evidence manifest are frozen (do not rewrite)
- Release tag `engineering-os-v3.0.0` is immutable (do not retarget)

## Support must be able to identify

- Current GA runtime commit (`5ffe47e8b987df53d3afb06703f854910178c4d3` at closeout)
- Production deployment ID (`dpl_9CxbKHsVh7Uvkszz8F82CqCbPqFy` at closeout)
- Migration ledger (`170`)
- Entitlement and enrollment state (1 enrolled Production workspace)
- Kill switch procedure
- Rollback target deployment
- Recovery procedure (WAL-G physical + logical snapshot; PITR not enabled)
- Known limitations register

## Frozen post-GA change classes

Every change must be classified and gated:

1. patch
2. security patch
3. schema migration
4. engineering semantic change
5. qualification-impacting change
6. AI capability expansion
7. connector integration
8. solver qualification
9. jurisdiction/standards expansion
10. external-customer release

`EOS_3_GA_CHANGE_GOVERNANCE_ACTIVE=YES`  
`EOS_3_GA_INCIDENT_MODEL_ACTIVE=YES`

## Release rule

Every post-GA runtime/schema release retains the Security + Release Regression Gate. Tenant/workspace isolation regression is a blocker. Future capabilities do not inherit GA support or qualification merely because EOS 3.0 is GA.

`EOS_3_FUTURE_FEATURE_AUTO_GA_INHERITANCE=NO`  
`EOS_3_FUTURE_QUALIFICATION_AUTO_INHERITANCE=NO`

## EOS 2 coexistence

EOS 2.0 remains independently supported under its own maintenance governance. EOS 2 entitlement/enrollment never auto-enables EOS 3. Production EOS 2→3 project migration remains a separate governed track.
