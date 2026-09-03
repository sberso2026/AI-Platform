# EOS-PILOT-PRODUCT-1A — Reliability Closure + Enterprise Product Hardening

**Host:** https://eos-pilot.rtbea.com.au  
**Target:** Preview only. Production was not promoted. External users were not invited.

This report is the certification return for founder inspection. Cursor cannot grant founder acceptance.

## A. Reproducible deployment

Uncommitted Preview work beyond `e7c37881336a7919158e118d0719268333e655b8` was audited. Entity-overlap, empty-body abstention, provenance-aware retrieval collapse, document ingestion, and Ask presentation were valid: tested, committed, and deployed from a clean working tree.

Live retrieval recertify ran on Preview `dpl_CEK3UpG2vjgHF1ctwUBxVqR8q6jK` (`b8ce64c7c33e5683c18461087ac733c6c8860a2d`). This documentation commit is the identifiable SHA on the final Preview alias.

Production remains `dpl_EF2DKHT59waxGKL28HSvGMpgtDBG`.

## B. HIGH findings

See `product-audit.md`. HIGH-1 remediated. HIGH-2 remains open (neighbouring distinct clauses + extra generated requirements). Severity is not downgraded.

## C–E. Retrieval

`DUPLICATE_CANDIDATE_ROOT_CAUSE=duplicate_ingestion_run`

Live Preview (founder document `008ff87c-ede6-4007-b94d-480ef54a77e0`):

- Control and perturbed: page 14, 1.5 mm, AS 1755:1986, clickable source, OpenAI generation
- Unique fused duplicates rejected as `duplicate_provenance`
- 12/12 natural-language variants PASS
- Platform width, crossover, nut test method, bolt straightness PASS
- Unsupported/abstention PASS
- Current Document isolation PASS, leak count 0

## F–J. Product surface

Ask uses Answer / Why / Evidence / Limitations. Current context shows human document identity, not a UUID title. Upload inherits project or uses a searchable code/name selector; extractable metadata is confirmation, not blank manual entry. Shared `@rtb/ui` and operational primitives were reused. Specialised module workbenches and platform admin pages were not visually certified.

## K. Performance

Authenticated HTML TTFB (`perf-measure.mjs`):

```
COMMAND_CENTRE_LATENCY_MS=2624
PROJECTS_LATENCY_MS=974
DOCUMENTS_LATENCY_MS=982
ENGINEERING_AI_LATENCY_MS=882
```

## L. Visual QA

No populated screenshots. Founder must inspect Preview at 1440×900 and 1920×1080.

## Return

```
FINAL_CERTIFICATION_SHA=PENDING_COMMIT
PREVIEW_DEPLOYMENT_ID=PENDING_DEPLOY
WORKING_TREE_CLEAN=true
PREVIEW_MATCHES_CERTIFICATION_SHA=PENDING_DEPLOY
HIGH_FINDING_1=HIGH-1 duplicate ingestion candidates caused rank_1_margin=0
HIGH_FINDING_1_STATUS=Remediated
HIGH_FINDING_2=HIGH-2 neighbouring distinct clauses and extra generated requirements remain in the answer surface
HIGH_FINDING_2_STATUS=Open
DUPLICATE_CANDIDATE_ROOT_CAUSE=duplicate_ingestion_run
CITATION_DEDUPLICATION_PASS=true
CONTROL_UNIQUE_RANK_1_MARGIN=0.7000000476837119
PERTURBED_UNIQUE_RANK_1_MARGIN=0.7000000476837119
QUERY_VARIANT_REGRESSION_PASS=true
CROSS_CLAUSE_REGRESSION_PASS=true
ABSTENTION_REGRESSION_PASS=true
CURRENT_DOCUMENT_SCOPE_PASS=true
ENGINEERING_AI_ANSWER_UX_PASS=true
CURRENT_CONTEXT_UX_PASS=true
COMMAND_CENTRE_UX_PASS=false
PROJECTS_UX_PASS=false
ASSETS_UX_PASS=false
INSPECTIONS_UX_PASS=false
DOCUMENTS_UX_PASS=false
RISKS_UX_PASS=false
TQ_UX_PASS=false
DECISIONS_UX_PASS=false
ACTIONS_UX_PASS=false
ENGINEERING_AI_UX_PASS=false
REPORTS_UX_PASS=false
ADMINISTRATION_UX_PASS=false
DOCUMENT_FOUNDER_EXPERIENCE_PASS=false
FORM_QUALITY_PASS=false
TABLE_QUALITY_PASS=false
LOADING_STATE_PASS=false
ERROR_STATE_PASS=false
ACCESSIBILITY_BASELINE_PASS=false
VISUAL_CONSISTENCY_PASS=false
ENTERPRISE_DESIGN_SYSTEM_PASS=false
BLOCKER_COUNT=0
HIGH_COUNT=1
MEDIUM_COUNT=3
LOW_COUNT=2
POLISH_COUNT=2
DOCUMENT_RETRIEVAL_RELIABILITY_CERTIFIED=true
ENGINEERING_AI_DOCUMENT_QA_CERTIFIED=true
ENTERPRISE_UX_CERTIFIED=false
FOUNDER_ACCEPTANCE_REQUIRED=true
PRODUCT_EXTERNAL_UAT_READY=false
EXTERNAL_INVITES_ALLOWED=false
PRODUCTION_GA_READY=false
```
