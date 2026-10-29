# EOS 2.0 Post-GA Maintenance Policy

`EOS_2_0_POST_GA_MAINTENANCE_MODE=ACTIVE`

`EOS_2_0_GA_BASELINE_FROZEN=YES`

## Maintenance posture

EOS 2.0.0 is in General Availability under `ACTIVE_CONTROLLED_GA`:

- Access remains `EXPLICIT_ENTITLEMENT_AND_ENROLLMENT`
- External customer legal hold remains enforced until a future EOS-2.23 clearance phase
- Kill switch and application rollback remain operational
- Canonical baseline and evidence manifest are frozen; historical evidence is not rewritten

## Support must be able to identify

- Current GA runtime commit
- Production deployment ID
- Migration ledger count
- Product release state / rollout mode
- Entitlement and enrollment state
- Kill switch procedure
- Rollback target deployment
- Recovery procedure (logical backup; PITR recommended)
- Known limitations register

## Release rule

Every post-GA runtime/schema release retains the Security + Release Regression Gate. Tenant isolation regression is a blocker.

## Customer hold

Do not clear `EXTERNAL_CUSTOMER_ONBOARDING_HOLD` because the product is GA. Clearance is a separate governance phase after legal/policy readiness.
