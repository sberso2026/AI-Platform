# Architecture

Document Ask path:

1. Query planner (`planEngineeringQuery`) — generic intent/subject/property/constraint.
2. Multi-channel lexical search + optional vector.
3. Fusion, lexical rerank, provenance collapse.
4. Evidence relevance class (DIRECT / SUPPORTING / CONTEXTUAL / IRRELEVANT).
5. Generation receives DIRECT + necessary SUPPORTING only.
6. Structured normative extraction from authorised excerpts.
7. Optional AI Director refine.
8. Claim verification; unsupported numerical claims fall back to structured answer.
9. UI presents ANSWER / BASIS / SOURCE.

Hybrid retrieval is used when embeddings exist; `HYBRID_RETRIEVAL_PASS` is true only when semantic evidence improves measured evaluation. Lexical + structured extraction is the quality path for this ticket.
