# Engineering Review security monitoring (ERA-6)

Events are counts, codes, and IDs only. Engineering document content must not be logged.

| Event | When | Alert operators? |
| --- | --- | --- |
| `review.authn_failed` | Missing session on Review API | No (volume) |
| `review.authz_failed` | Workspace missing / read-only mutate | Repeated bursts yes |
| `review.identity_assurance_failed` | Password-only when MFA/SSO required | Yes |
| `review.cross_workspace_attempt` | Domain `cross_workspace_rejected` | Yes |
| `review.cross_tenant_attempt` | Domain `cross_tenant_rejected` | Yes |
| `review.privileged_action` | Reserved | Yes |
| `review.execution_failed` | Unhandled Review API error | Yes if sustained |
| `review.audit_failed` | Trusted audit write throws | Yes |
| `review.repeated_access_denied` | Reserved for aggregator | Yes |
| `review.external_upload_blocked` | Fail-closed file policy | Optional |

Remaining operational setup: export `REVIEW_SECURITY_ALERT_EVENTS` from the Review API process into the existing platform log drain / SIEM. That hook is not implemented in ERA-6.
