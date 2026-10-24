# Internal Security Regression Runbook

**Phase:** 16C.1

## Local

```bash
pnpm --filter @rtb/platform-identity test
pnpm --filter @rtb/platform-identity-certification secret-scan
pnpm --filter @rtb/platform-identity-certification certify:phase16c1
```

Optional SCA (informational; not an external pen test):

```bash
pnpm audit --prod
```

## CI

Workflow: `.github/workflows/phase-16c1-internal-adversarial-security.yml`

Requires:

- failed=0, skipped=0, notExecuted=0
- unexpected5xx=0
- secretExposure=false
- knownCrossTenantLeakageDetected=false
- KnownCriticalInternalSecurityFindingOpen=false
- KnownHighInternalSecurityFindingOpen=false
- S07ExternalPenTestComplete=false
- ExternalPenTestPerformed=false
- Tier1EnterpriseProductionReady=false

## After security defect fixes

1. Add/extend adversarial regression case
2. Record finding remediation + `regressionTest` id
3. Re-run `certify:phase16c1`
4. Do not mark S07 complete

## Reminder

Internal regression PASS ≠ independent external penetration test.
