# RTB Encryption Baseline (Phase 14C)

Assessment only. Classification: **provider-managed** · **RTB-managed** · **customer-managed** · **unknown**.

| Path | Classification | Evidence / notes |
| --- | --- | --- |
| TLS in transit (web/API) | provider-managed / implemented_bounded | Hosted HTTPS; app assumes TLS termination at edge |
| Database encryption at rest | provider-managed | Supabase/Postgres provider encryption; not RTB-managed KMS evidenced |
| Object / Platform Files | provider-managed | Object storage provider encryption |
| Backups | provider-managed / unknown | Provider backup encryption assumed; RTB-owned key hierarchy not evidenced |
| Application secrets at rest | provider-managed / implemented_bounded | Hosting/GitHub secret stores; no plaintext credentials in repo (scan-gated) |
| Execution-host transport | implemented_bounded | Controlled host job channel; not customer-managed keys |
| Customer-managed keys (CMK) | reserved / missing | Not GA requirement unless Tier-1 contract demands |

Unknown **critical** encryption paths that would block GA were not identified beyond honesty of provider-managed assumptions. CMK is not a GA_BLOCKER for Engineering OS V1 unless contractually required.
