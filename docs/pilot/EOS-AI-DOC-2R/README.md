# EOS-AI-DOC-2R — Engineering AI Provider Route + Document Metadata Review

**Host:** https://eos-pilot.rtbea.com.au  
**Preview deployment:** `dpl_BDfJet9p1GbUxSjJLq6weAJtra7H`  
**Production:** `dpl_EF2DKHT59waxGKL28HSvGMpgtDBG` (not promoted)  
**Supabase:** `wcydlhqiqdwgoaqrlget`

Canonical path unchanged:

1. Engineering OS Documents owns identity, review state, and register.
2. Kernel AI Director owns generation through Model Registry and Prompt Registry.
3. Project Intelligence owns extract → chunk → lexical index.
4. Engineering AI Ask composes retrieval + Director generation. No direct provider calls from the app.

## A. Original provider failure

Live `agent_runs` before this repair:

- `provider=mock`, `model=mock-gpt`
- `error=Failed to complete span: Cannot coerce the result to a single JSON object`

Generation reached the mock adapter, then observability `completeSpan().single()` threw and the Director run was marked failed. Ask swallowed that into degraded retrieval.

Contributing mismatches (not the throw site, but they forced mock):

- AI Director registered only `MockModelAdapter`
- Tenant `model_routes` pointed at mock-gpt
- Preview had no chat provider credential in Vercel

Repaired through Kernel / AI Director / Model Registry / Prompt Registry only. Live generated answers now return `generationProvider=openai`.

## Live QA (Preview)

| Question | Result |
|---|---|
| AS/NZS 1252 test method | Generated. Section 3.4 / AS/NZS 4291.2. |
| AS/NZS 1252 M20 straightness | Generated. Figure 2.3 and l' limitation. Numerical M20 value not invented. |
| Conveyor platform width | Generated. 4.2.1 / 600 mm. Canonical number `AS 1755:1986`. |
| Conveyor crossover | Generated. 4.2.3 and 7.2.2 in citations. |
| Absent wind/mast-arm question | ABSTAIN. 0 evidence. |
| Isolation (nuts Q on conveyor) | No AS/NZS 4291.2 leak. |

## Metadata review

Conveyor `008ff87c-ede6-4007-b94d-480ef54a77e0`:

- Review state: `confirmed`
- Canonical number: `AS 1755:1986` (authorised source supports it)
- Number source: `extracted_header`
- Filename fallback retained as `filename_fallback_number`
- Confirm API originally returned 400 `Action mismatch: expected document.read` because write-scoped review called `document.get`. Fixed by loading the row after `document.update` without re-asserting read.

## Performance (re-sampled, not synthetic zero)

n=1 ingest, n=5 QA, n=5 retrieval.

| Metric | Value |
|---|---|
| DOCUMENT_UPLOAD_P95_MS | n/a |
| DOCUMENT_INGESTION_P95_MS | 95092 |
| DOCUMENT_RETRIEVAL_P95_MS | 2158 |
| DOCUMENT_QA_P95_MS | 8318 |

## Flags

```
AI_PROVIDER_FAILURE_LAYER=observability
AI_PROVIDER_FAILURE_CAUSE=complete_span_single_json_coerce
ENGINEERING_AI_PROVIDER_ROUTE_PASS=true
ENGINEERING_AI_GENERATION_PASS=true
ENGINEERING_AI_DEGRADED_MODE_PASS=true
DOCUMENT_METADATA_REVIEW_PASS=true
DOCUMENT_NUMBER_PROVENANCE_PASS=true
DOCUMENT_REVISION_PROVENANCE_PASS=true
CONVEYOR_CANONICAL_NUMBER_PASS=true
SECTION_PATH_QUALITY_PASS=true
CITATION_DEDUPLICATION_PASS=false
HYBRID_RETRIEVAL_PASS=false
ASNZS1252_TEST_METHOD_GENERATED_QA_PASS=true
ASNZS1252_STRAIGHTNESS_GENERATED_QA_PASS=true
CONVEYOR_PLATFORM_WIDTH_GENERATED_QA_PASS=true
CONVEYOR_CROSSOVER_GENERATED_QA_PASS=true
DOCUMENT_ABSTENTION_PASS=true
DOCUMENT_UPLOAD_P95_MS=n/a
DOCUMENT_INGESTION_P95_MS=95092
DOCUMENT_RETRIEVAL_P95_MS=2158
DOCUMENT_QA_P95_MS=8318
BLOCKER_COUNT=0
HIGH_COUNT=0
MEDIUM_COUNT=2
LOW_COUNT=2
ENGINEERING_AI_DOCUMENT_REASONING_PASS=true
EXTERNAL_DOCUMENT_UAT_READY=true
EXTERNAL_ENGINEERING_AI_UAT_READY=true
CONTROLLED_PILOT_CONTINUE=true
PRODUCTION_GA_READY=false
```

See [known-limitations.md](known-limitations.md). Production was not promoted.
