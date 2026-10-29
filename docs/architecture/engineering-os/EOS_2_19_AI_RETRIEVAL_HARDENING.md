# EOS 2.19 AI Retrieval Hardening

`EOS_2_AI_RETRIEVAL_ABSTENTION_ROOT_CAUSE_IDENTIFIED=YES`

`EOS_2_AI_RETRIEVAL_GROUNDING=PASS`

## Root cause

Ask Engineering AI (`POST /api/engineering/ai`) runs through the existing engineering AI / project-intelligence retrieval path. That corpus indexes documents and project-intelligence objects. EOS 2 controlled-pilot persistence tables consumed by `POST/GET /api/engineering/pilot-workflow` (basis sets, structural deliveries, interface handoffs, change cases, governed deliverables, design freezes) are **not** part of that Ask retrieval corpus.

Therefore representative pilot questions such as “which deliverable may be stale?” return `evidenceState=INSUFFICIENT` when no indexed document evidence exists. This is **correct safety abstention**, not a workspace filter bug and not an instruction to invent answers.

Classification of abstention:

- Correct safety abstention: YES
- Missing indexing of EOS 2 canonical tables into Ask: YES (supported object source gap)
- Unsupported object source today: YES for pilot-workflow tables
- Workspace filter defect: NO evidence
- Provenance threshold forcing false answers: NO

## Hardening applied

1. Documented root cause in this artifact.
2. UI notice on Ask shell (`ask-eos2-retrieval-limit`) stating EOS 2 pilot-workflow tables are outside the corpus and abstention is preferred.
3. Preserved authority boundaries: no approval, materiality finalization, release, or unsupported calculation.
4. Operational grounding for pilot validation continues via authenticated pilot-workflow GET (FACT panel/DB), distinct from Ask generation.

## GA implication

Extending Ask to retrieve EOS 2 canonical rows must go through the governed knowledge architecture with tenant/workspace filters, revision awareness, source ownership, and FACT/INFERENCE/ASSUMPTION discipline. That work is an EOS 2.20 readiness item if GA requires Ask to answer from pilot-workflow tables directly.
