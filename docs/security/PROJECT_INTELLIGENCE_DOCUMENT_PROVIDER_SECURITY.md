# Project Intelligence — Document Provider Security & Privacy

**Phase:** 6C-2 Production Provider Closure  

---

## Controls

| Control | Requirement |
|---------|-------------|
| Provider keys | Server-only (`PLATFORM_EMBEDDING_*`, `OPENAI_API_KEY`, `AZURE_DOCUMENT_INTELLIGENCE_*`). Never in client bundles or logs. |
| Customer content logging | Document body must not appear in application logs; traces redact body by default. |
| Prompt / trace redaction | Excerpts in diagnostics limited; admin-only may see governed model IDs. |
| Embedding batches | Tenant-scoped; no cross-tenant batching unless explicit policy allows. |
| Provider retention | Documented in provider selection; Azure/OpenAI retention per enterprise terms. |
| Region | Embedding region via OpenAI org / Azure endpoint; OCR local Tesseract keeps content on Platform hosts. |
| Signed file access | Short-lived signed URLs only; job payload must not accept arbitrary storage paths. |
| Authorized content only | Parser/OCR receive bytes only after tenant/workspace authorization. |
| Service role | Worker uses service role with audited RPCs; RLS verified for user JWT paths. |
| Raw embeddings | Not exposed to normal users via API. |
| Cross-tenant vectors | SQL filters + RLS deny cross-tenant retrieval. |
| Deleted / superseded | Soft-deleted chunks and superseded revisions excluded from active retrieval by default. |

---

## Customer-visible diagnostics (allowed)

- Parser type / processing version  
- OCR used (yes/no)  
- Processing warnings  
- Readiness / review requirement  

## Never expose

- Provider secrets  
- Raw request payloads  
- Internal cost (unless admin-authorized)  
- Stack traces / raw provider errors  

---

## Fail-closed modes

- `production` and `hosted_staging` production-readiness: missing embedding configuration → reject.  
- Hash embedding fallback disabled in those modes.  
- Privacy-weakening fallbacks are forbidden.
