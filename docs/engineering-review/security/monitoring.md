# Engineering Review security monitoring (ERA-7)

There is **no SIEM** in this platform (platform architecture must not own SIEM). Minimum reliable destination: structured JSON on the Review API process (`console.warn`) plus optional HTTPS webhook.

Events are counts, codes, and IDs only. Engineering document content must not be logged.

| Event | Severity | Destination | Owner | Response expectation |
| --- | --- | --- | --- | --- |
| `review.authn_failed` | medium | structured_log / webhook | review-oncall | Correlate bursts (stolen-credential probe) within 1 business day |
| `review.authz_failed` | medium | structured_log / webhook | review-oncall | Same |
| `review.identity_assurance_failed` | high | structured_log / webhook | review-oncall | Confirm MFA policy still enforced |
| `review.cross_workspace_attempt` | high | structured_log / webhook | review-oncall | Immediate if any data returned |
| `review.cross_tenant_attempt` | critical | structured_log / webhook | review-oncall | Immediate; isolation incident if any row returned |
| `review.malware_detected` | critical | structured_log / webhook | review-oncall | Quarantine; do not parse |
| `review.scanner_failed` | high | structured_log / webhook | review-oncall | Fail closed; do not open external ingest |
| `review.audit_failed` | high | structured_log / webhook | review-oncall | Integrity of trusted path |
| `review.service_role_misuse` | critical | structured_log / webhook | review-oncall | Rotate keys |
| `review.execution_failed` | medium | structured_log / webhook | review-oncall | Investigate sustained failures |
| `review.repeated_access_denied` | high | reserved aggregator | review-oncall | Same as authz bursts |
| `review.external_upload_blocked` | medium | not auto-alerted | review-oncall | Expected in fail-closed pilot |

`RTB_REVIEW_SECURITY_WEBHOOK_URL` is optional. Absence of a webhook is **not** absence of an alert sink: JSON logs remain.

Future SIEM integration should ingest `kind=rtb.review.security_alert` without expanding the payload to include document text.
