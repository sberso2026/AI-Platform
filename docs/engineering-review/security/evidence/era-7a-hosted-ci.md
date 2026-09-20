# ERA-7A hosted security evidence

No secret values.

| Item | Evidence |
| --- | --- |
| Target | RTB AI Platform Staging `rntonzigxwxcjlcsadip` |
| EOS project used | false (`wcydlhqiqdwgoaqrlget` not used) |
| GitHub secrets present | `REVIEW_STAGING_SUPABASE_URL`, `REVIEW_STAGING_SUPABASE_ANON_KEY`, `REVIEW_STAGING_SUPABASE_SERVICE_ROLE_KEY`, `REVIEW_STAGING_CERT_USER_PASSWORD` |
| Schema SQL applied | `20260920120000_engineering_review_security_schema_status.sql` to staging |
| Local staging suite | 28 passed / 6 files (Review 11, Core 8, audit 3, identity 4, restore 1, schema 1) |
| GitHub Actions | run `35507801752` success; job ID `106070444306`; 28 passed / 6 files |
| Unit workflow | run `35507801747` success |
| Restore elapsed (local) | 783ms logical Review-row export/delete/reinsert |
| Alert observation | `review.audit_failed` structured JSON `console.warn` (`kind: rtb.review.security_alert`, destination `structured_log`, owner `review-oncall`) |
| AAL1 | Live Tenant A password JWT rejected by `requireMfa` |
| AAL2 enrollment | Not performed (HUMAN_DECISION_REQUIRED) |
| ClamAV | Not deployed; external customer upload remains disabled |
