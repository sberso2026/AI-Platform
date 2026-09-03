# Canonical identity rules

Identity key (tenant/workspace + normalized number + normalized revision + source SHA-256):

`packages/engineering-os/src/services/document-identity.ts`

Rules:

- Same checksum → reuse the existing document.
- Same number + revision + checksum → reuse.
- Same number + revision, different checksum → conflict / human review (do not silently replace).
- New revision (A/B/C, 0/1/2, P1, IFR/IFC, or an explicit year used as revision) → new row using the existing unique key.
- Timestamp/object-id values such as `1996-1788375243061` are **never** stored as revision. They are rejected and mapped to `A` with `pendingReview`.
- Filename is not identity. Standard numbers are inferred from title/filename (`AS/NZS 1252:1996`, `AS 1755:1986`) only as a proposal.
- If number/revision extraction is low-confidence, revision stays pending-review (`A` + metadata) rather than inventing a unique suffix.

Register list/search hide `superseded` and `obsolete` rows so retry artifacts are not visible after reconciliation.
