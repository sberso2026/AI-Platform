# Duplicate reconciliation evidence

Tenant `8195e176-5f9f-449a-a1d3-2aedaf403989` (LAUNCH-1). No production-shaped rows were hard-deleted. Retry artifacts were `UPDATE`d to `status=superseded` with `metadata.retry_artifact` and `reconciled_into`.

| Role | Document id | Number | Revision | Notes |
|---|---|---|---|---|
| Canonical | `c1cc8331-8b39-4e5f-871b-b1d237e7101e` | AS/NZS 1252:1996 | A | Source attached; indexed; live Q&A |
| Retry artifact | `c248f5da-…`, `e6fc357c-…`, `24e29c7b-…`, `ed315d20-…` | AS/NZS 1252:1996 | timestamp | Superseded |
| Attach-test artifact | `4a1d9c32-…`, `af62f9e2-…`, `aa1ca1e9-…` | META-* | — | Superseded |
| Separate standard | `3bef9771-…` | AS 1252 | — | Different number; kept |
| Conveyor UAT | `008ff87c-ede6-4007-b94d-480ef54a77e0` | filename fallback `UPL-AS_1755-…` | A | PDF 617088 bytes; 66 pages / 630 chunks |

Live register after reconciliation:

- `VISIBLE_ASNZS1252=1`
- `TIMESTAMP_REVISIONS_VISIBLE=0`
- `DOCUMENT_VISIBLE_DUPLICATES=0` for the same AS/NZS 1252:1996 revision

Audit/timeline links on superseded rows were preserved by not deleting the rows.
