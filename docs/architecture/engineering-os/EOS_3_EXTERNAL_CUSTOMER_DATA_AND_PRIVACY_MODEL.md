# EOS 3 External Customer Data and Privacy Model

`EOS_3_EXTERNAL_CUSTOMER_DATA_CLASSIFICATION_DEFINED=YES`  
`EOS_3_EXTERNAL_CUSTOMER_PRIVACY_READINESS=PASS`  
`EOS_3_EXTERNAL_CUSTOMER_DATA_RESIDENCY_MODEL_DEFINED=YES`  
`EOS_3_EXTERNAL_CUSTOMER_SUBPROCESSOR_REGISTER_READY=YES`  
`EOS_3_EXTERNAL_CUSTOMER_RETENTION_POLICY_DEFINED=YES`  
`EOS_3_EXTERNAL_CUSTOMER_DATA_DELETION_PROCESS_DEFINED=YES`  
`EOS_3_EXTERNAL_CUSTOMER_DATA_EXPORT_PROCESS_DEFINED=YES`

## Data classes

| Class | Examples | Sensitivity |
|-------|----------|-------------|
| Engineering documents / uploads | Drawings, reports, attachments | Confidential |
| Project metadata | Names, codes, lifecycle | Confidential |
| Calculations / requirements / assumptions / decisions / deliverables | EOS 3 objects & revisions | Confidential |
| User identity | Accounts, roles, membership | Personal / confidential |
| Audit / provenance | Action logs, authority records | Integrity-critical |
| Commercially confidential | Customer IP, pricing inputs | Confidential |

## Privacy posture (bounded, no formal certification claim)

- Purpose: provide contracted EOS 3 engineering OS services under explicit entitlement/enrollment.
- Collection: account identity, workspace/project engineering content, audit telemetry needed for security/support.
- Access: least privilege; tenant/workspace RLS; default deny.
- Live LLM egress: **0** — live LLM `NOT_SUPPORTED` / disabled; customer data must not be sent to unvalidated LLM.
- Formal GDPR certification: **not claimed**. Privacy notice / DPA / transfer terms require legal package completion.
- Data subject/customer requests: handled via support + offboarding/export/deletion runbooks after legal terms define SLAs.

## Data residency (actual)

| Item | Actual |
|------|--------|
| Primary Production DB | Supabase project `wcydlhqiqdwgoaqrlget`, region `ap-southeast-2` |
| App hosting | Vercel Production deployment for EOS web runtime |
| Claim rule | Do **not** claim multi-region or customer-selectable residency unless technically enforced |

## Subprocessor register (customer data processing — actual Production path)

| Subprocessor | Role |
|--------------|------|
| Supabase | Managed Postgres, auth, storage APIs as configured for Production |
| Vercel | Application hosting / edge delivery for Production web runtime |

Do not list services that do not process customer Production data for this release.

## Retention architecture

| Data | Retention approach |
|------|--------------------|
| Active customer workspace data | Retained while entitlement/enrollment active |
| Audit / provenance | Retained per security/support needs; may outlive soft-delete |
| Soft-deleted projects/objects | Application delete ≠ immediate physical purge |
| Terminated accounts | Offboarding runbook: revoke access → export if contracted → retention window → deletion |
| Backups | WAL-G physical backups + logical snapshots; expire per backup retention; **not** immediately purged on app delete |

## Deletion process (accurate limits)

1. Application-level deletion / entitlement revoke  
2. Audit/legal retention may preserve selected records  
3. Backup copies persist until backup retention expires  
4. Irreversible deletion of all backup remnants is **not** immediate and must not be promised as instantaneous  

## Export at offboarding

Customer may request export of their workspace engineering objects/metadata and agreed deliverable sets as available via application/export tooling defined at contract time. Audit logs may be provided in summarized form subject to security policy.
