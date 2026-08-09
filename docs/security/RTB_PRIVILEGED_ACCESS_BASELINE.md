# RTB Privileged Access Baseline

Status: Phase 14C assessment

## Privileged classes

| Class | Examples |
| --- | --- |
| Platform administration | Tenant owner/admin, catalogue/platform admin |
| Database access | Supabase service role, hosted SQL |
| Production support | Break-glass ops |
| Security administration | Future Sec&Assurance operators |
| Execution hosts | Host admin / provider admin |
| Deployment infrastructure | GitHub Actions secrets, deploy keys |
| AI/provider administration | Provider API keys |

## Required principles

- least privilege
- segregation of duties
- MFA for privileged access **where supported** (gap: not evidenced as enforced)
- access review
- revocation
- audit trail
- break-glass governance

## Assessment

| Control | Status |
| --- | --- |
| Role/permission seeds | implemented_bounded |
| Commerce admin separation | implemented_bounded |
| Privileged MFA enforcement | missing |
| Formal access review cadence | manual / missing |
| Break-glass procedure | missing / not documented |
| Service role isolation from user JWT | implemented |

## GA impact

Privileged MFA + break-glass documentation/enforcement = **REQUIRED_BEFORE_GA**.
