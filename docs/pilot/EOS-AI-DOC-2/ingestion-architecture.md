# Ingestion architecture

```
browser → POST /api/engineering/documents/upload-session
       → signed PUT to engineering-documents
       → POST /api/engineering/documents/upload-complete (checksum, attach, enqueue)
       → Project Intelligence document worker
            fetch scoped object
            native PDF (pdf-parse v2 + pdf.js worker) / DOCX / TXT
            engineering segments (clauses, headings, tables, figure captions + nearby text)
            chunk + provenance
            lexical index (embeddings only if governed adapter is configured)
```

Observable states remain on the Engineering document: source attached, ingestion label, AI searchable, pages indexed, warnings.

PDF on Vercel:

- `apps/web` depends on `pdf-parse@2.4.5`.
- `serverExternalPackages` + file tracing include `pdfjs-dist` worker files.
- Parser calls `configurePdfJsWorker` so `globalThis.pdfjsWorker` is loaded before `getText()`.
- Ingest route `maxDuration = 300` so a 66-page PDF can finish in the same drain.

Re-index: `POST /api/engineering/documents/{id}/ingest` (owner/admin/operator). GET for read, not write-action `documents.get`.
