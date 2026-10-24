# ERA-PILOT-0 security re-attestation

**Executed:** 2026-09-24  
**Staging project:** `rntonzigxwxcjlcsadip`  
**Baseline SHA:** `0c32857efbe864bdcfa3fcebb33961aca5615466`

Secrets are not stored in this file.

| Check | Newly executed | Result |
| --- | --- | --- |
| Review RLS | yes — `test:rls` ENGINEERING_REVIEW_RLS=1 | PASS (11) |
| Core RLS | yes | PASS (8) |
| Trusted audit | yes | PASS |
| Security schema | yes | PASS |
| Restore drill | yes | PASS |
| Canonical identity (Tenant A over signup) | yes — live-identity | PASS |
| Tenant A requireMfa | yes | true |
| Named pilot verified MFA factors | yes — report-pilot-mfa | 1 |
| Live AAL2 session | no AAL2 JWT observed | NOT_PROVEN |
| Hosted `RTB_REVIEW_CLAMAV_URL` | process + repo env + GitHub secret name | NOT_CONFIGURED |
| Secret scan | yes | PASS (0 findings) |
| Production dependency audit | yes — `pnpm audit --prod` | critical 0 / high 6 / moderate 2 |
| Review typecheck | yes | PASS (platform tsc debt 326 remains) |
| Production build | yes | PASS |

Historical (not this execution): GitHub workflow `engineering-review-hosted-rls.yml` last success 2026-09-20. Do not treat that run as this phase's evidence.

AAL1 Review rejection remains enforced by policy tests and live-identity. A verified TOTP factor now exists for the named pilot, but LIVE_AAL2 stays NOT_PROVEN until a real AAL2 session is observed and `/review` is authorized with ER-A1 visible.
