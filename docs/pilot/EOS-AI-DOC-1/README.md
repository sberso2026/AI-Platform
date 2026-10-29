# EOS-AI-DOC-1 — Engineering Document Intelligence

**Host:** https://eos-pilot.rtbea.com.au  
**Production:** not promoted.

Canonical path:

1. Authorised upload attaches a source file to Engineering OS Documents (`engineering-documents` bucket).
2. Attach/create enqueues `pi_document_enqueue_processing` (existing Project Intelligence job).
3. The existing document worker fetches the scoped object, extracts native text (PDF/DOCX/TXT), segments engineering units, persists provenance, and indexes chunks.
4. Engineering AI Ask composes that index (lexical always; vector when the governed embedding model is configured) with tenant/workspace/document/project filters.
5. Answers distinguish DOCUMENT FACT / INFERENCE / ASSUMPTION / MISSING EVIDENCE and cite page/section/figure.

No second AI stack, document registry, storage system, knowledge graph, unrestricted vector database, or direct model-provider access.

Certification pack:

- [architecture.md](architecture.md)
- [ingestion-contract.md](ingestion-contract.md)
- [retrieval-contract.md](retrieval-contract.md)
- [citation-contract.md](citation-contract.md)
- [security-evidence.md](security-evidence.md)
- [uat-evidence.md](uat-evidence.md)
- [performance-evidence.md](performance-evidence.md)
- [known-limitations.md](known-limitations.md)
- [fixtures/asnzs-1252-1996-excerpt.txt](fixtures/asnzs-1252-1996-excerpt.txt)

Live Preview validated on `dpl_4raH2RyQ3hNWwUyuraAmrmgrxp3h`. Production `dpl_EF2DKHT59waxGKL28HSvGMpgtDBG` was not promoted.
