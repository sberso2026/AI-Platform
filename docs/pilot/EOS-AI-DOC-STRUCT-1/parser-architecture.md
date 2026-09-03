# Parser architecture

`packages/engineering-os/src/services/document-structure.ts` is the shared engine (PI ingest/retrieval imports it; EOS Ask uses the same module).

1. Split numbered clauses and parenthesised list markers.
2. Stack lettered children under the current clause; roman markers under the current letter.
3. Extract requirements per sentence.
4. Inherit property/operator from incomplete parents (`shall not exceed the following:`).
5. Completeness: COMPLETE / REQUIRES_CHILD / REQUIRES_PARENT / REQUIRES_CONTINUATION / REQUIRES_TABLE / REQUIRES_FIGURE / INSUFFICIENT.

Ingestion: `segmentEngineeringPage` splits list units; chunk metadata stores clauseId/parentClauseId/completeness. Query time: retrieval concatenates same-page hits and re-parses so already-ingested Preview documents gain structure without re-ingest.
