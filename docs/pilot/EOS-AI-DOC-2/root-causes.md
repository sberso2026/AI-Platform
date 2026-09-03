# Root causes

## DOCUMENT_DUPLICATE_ROOT_CAUSE

`register_identity_used_timestamped_revision_to_bypass_unique(tenant,document_number,revision); retries/UAT created new canonical rows instead of reusing the existing number+revision; checksum was not part of identity`

`engineering_documents` is unique on `(tenant_id, document_number, revision)`. Metadata retries and attach tests wrote values such as `1996-1788375243061` as **revision**, which satisfied uniqueness and created extra visible register rows for the same AS/NZS 1252:1996 source.

## ENGINEERING_AI_PROVIDER_FAILURE_ROOT_CAUSE

`ai_director_or_reasoning_provider_throw; client_mapped_non_ok_http_to_provider_failure_and_dropped_evidence; pdf_parse_worker_module_missing_on_vercel_blocked_conveyor_body_index`

Three stacked failures were observed:

1. AI Director / reasoning generation throws or returns non-OK. The Ask client previously mapped that to “Provider or API failure” / “An unexpected error occurred” and dropped retrieved evidence.
2. Conveyor PDF ingest failed on Vercel because bundled pdf.js fake-imported `./pdf.worker.mjs` from `.next/server/chunks` (file not emitted). After webpack-externalizing `pdf-parse` without a web-app dependency, ingest then failed with `Cannot find module 'pdf-parse'`.
3. Document-scope lexical search treated weak OR matches (and substring hits such as `load` inside `unloading`) as SUFFICIENT evidence, so title/TOC pages were answered and some absent questions did not abstain.

## Repair summary

- Canonical identity + revision validation + checksum reuse (no timestamp revision).
- Supersede retry artifacts; do not SQL-delete production-shaped rows.
- Direct signed upload (413 path closed).
- `pdf-parse` is a web-app dependency, traced, and configured with an in-process pdf.js worker.
- Degraded Ask copy when generation fails but evidence exists.
- Query-term overlap ranking, word-boundary match, sliding-window excerpts, stricter abstention when a rich query has fewer than two specific term hits.
