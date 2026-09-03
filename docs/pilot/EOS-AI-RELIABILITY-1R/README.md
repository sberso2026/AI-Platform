# EOS-AI-RELIABILITY-1R — Live Preview Retrieval Reliability Certification

**Host:** https://eos-pilot.rtbea.com.au  
**Preview deployment:** `dpl_DavEcJJDD6n42oWsb7iaeKsKphfw`  
**Production:** `dpl_EF2DKHT59waxGKL28HSvGMpgtDBG` (unchanged, not promoted)  
**Git commit on branch:** `e7c37881336a7919158e118d0719268333e655b8`  
**Preview payload:** that commit plus uncommitted general entity-overlap / empty-body abstention work deployed from the working tree. No Production promote. No external invites.

Canonical document: `008ff87c-ede6-4007-b94d-480ef54a77e0` (AS 1755:1986, rev A).  
Authenticated path: `POST /api/engineering/ai` with `scope: "document"`, `objectType: "document"`, `objectId` = that document.

## A. Deploy Preview

`eos-pilot.rtbea.com.au` inspects to `dpl_DavEcJJDD6n42oWsb7iaeKsKphfw` / target `preview`.  
Production inspect remains `dpl_EF2DKHT59waxGKL28HSvGMpgtDBG`.

## B. Founder A/B

Both control and perturbed questions:

- retrieve page-14 guard evidence (`chunk=a5b6a04cbbf9efbd6cf1af63f5a796e6`)
- identify 1.5 mm
- cite AS 1755:1986
- cite page 14 (section_path on the gold chunk is null; neighbouring figure label is `Figure 5.1 ).`)
- clickable `sourceLocation` under `/engineering/documents/008ff87c-...`
- generation provider `openai`, not retrieval-only fallback

## C. Natural-language robustness

12 live queries (control + perturbed + 10 listed variants). All 12 retrieved 1.5 mm / AS 1755 / page 14 / clickable source.

## D. Generation path

Supported queries: retrieval PASS and generation PASS with `generationProvider=openai`, `generationFailed=false`, `degraded=false`, `retrievalMode=lexical`.  
This run did not take the retrieval-only degraded path. OpenAI generation did not fail.

## E. Retrieval traces (top-20 retained in `live-certify.json`)

Gold chunk rank 1 on both queries. Rank-2 is a duplicate ingestion of the same page-14 window, so margin vs rank 2 is 0.

Control rank 1 (`a5b6a04cbbf9efbd6cf1af63f5a796e6`):

- fts_score=1.30000007152557
- distinctive_term_score=1
- fallback_score=0.9090909090909091
- semantic_score=null
- fusion_score=1.30000007152557
- rerank_score=1
- rank_1_margin_vs_rank_2=0

Perturbed rank 1: same scores. Gold recovered lexically, not by vector. `HYBRID_RETRIEVAL_PASS=false`.

## F–H. Regression, abstention, scope

Platform width, crossover, AS/NZS 1252 nut test method, and bolt straightness all passed on the live product path.  
Five absent questions abstained with 0 evidence.  
Current Document number `AS 1755:1986`. Nuts question on the conveyor document did not cite AS/NZS 4291.2. `CROSS_DOCUMENT_LEAK_COUNT=0`.

## I. UI observations

See `ui-observations.md`. No UX redesign in this phase.

## J. Certification

Harness anti-hardcoding check on production retrieval files: pass (no AS 1755 / 5.2.1 / 1.5 mm / founder query strings).

```
REMEDIATION_COMMIT=e7c37881336a7919158e118d0719268333e655b8
PREVIEW_DEPLOYMENT_ID=dpl_DavEcJJDD6n42oWsb7iaeKsKphfw
LIVE_PREVIEW_REMEDIATION_DEPLOYED=true
LIVE_CONTROL_QUERY_PASS=true
LIVE_PERTURBED_QUERY_PASS=true
LIVE_QUERY_VARIANT_COUNT=12
LIVE_QUERY_VARIANT_PASS_COUNT=12
LIVE_QUERY_VARIANT_SUCCESS_RATE=1.00
LIVE_RETRIEVAL_PASS=true
LIVE_GENERATION_PASS=true
LIVE_GENERATION_PROVIDER=openai
CONTROL_CORRECT_CHUNK_RANK=1
PERTURBED_CORRECT_CHUNK_RANK=1
CONTROL_RANK_1_MARGIN=0
PERTURBED_RANK_1_MARGIN=0
PLATFORM_WIDTH_REGRESSION_PASS=true
CROSSOVER_REGRESSION_PASS=true
NUT_TEST_METHOD_REGRESSION_PASS=true
BOLT_STRAIGHTNESS_REGRESSION_PASS=true
LIVE_ABSTENTION_PASS=true
CURRENT_DOCUMENT_SCOPE_PASS=true
CROSS_DOCUMENT_LEAK_COUNT=0
ANTI_HARDCODING_PASS=true
HYBRID_RETRIEVAL_PASS=false
BLOCKER_COUNT=0
HIGH_COUNT=2
MEDIUM_COUNT=3
LOW_COUNT=3
DOCUMENT_RETRIEVAL_RELIABILITY_CERTIFIED=true
ENGINEERING_AI_GENERAL_RELIABILITY_CERTIFIED=true
PRODUCT_EXTERNAL_UAT_READY=false
EXTERNAL_INVITES_ALLOWED=false
FOUNDER_ACCEPTANCE_REQUIRED=true
PRODUCTION_GA_READY=false
```

Stop. No external UAT. No Production promote.
