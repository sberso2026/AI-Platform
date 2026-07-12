# Project Intelligence Citations

**Phase:** 6C-2

## Rule

Every factual answer (`answered` / `partially_answered`) **must** include one or more citations. `buildGroundedAnswer` rejects answered contracts without citations (`document_citation_required`).

## Citation fields

- Engineering Core `engineeringDocumentId`
- Document number / title (when known)
- Revision
- Page / section
- Evidence excerpt
- Evidence score
- Chunk ID (`stableChunkId`)
- Source coordinates when available

## Answer statuses

`answered` · `partially_answered` · `abstained` · `conflicting_evidence` · `document_not_ready` · `insufficient_permission`

Abstention and conflict policies live in `abstention.ts`. Material conflicts must surface for human review — never silent pick.
