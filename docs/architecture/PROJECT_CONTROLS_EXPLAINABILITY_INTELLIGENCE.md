# Project Controls Explainability & Traceability Intelligence (Phase 11L)

Phase 11L adds the eleventh Project Controls contributor: **explainability_intelligence**.

## Semantics

- **Explanation** is a public reason summary with evidence/provenance/dependency traces.
- **Explanation ≠ chain-of-thought ≠ hidden inference**
- **Traceability ≠ approval ≠ verification**

Explainability consumes all published Project Controls contributors (progress through assurance) plus evidence/timeline/governance metadata. It never mutates upstream contributors.

Explainability composes contributor context via `ProjectContextCompositionEngine` (`mutatesUpstreamContributors: false`).

## Deterministic taxonomies

**Explanation status:** `supported | partially_supported | unsupported | conflicting | incomplete | unknown`

**Reason:** `evidence_based | derived | assumed | insufficient_evidence | unknown`

## Fail closed

Missing evidence → `unknown` / `insufficient_evidence` / `incomplete` as appropriate. Never fabricate provenance. Never disclose chain-of-thought.

## Forbidden

- Chain-of-thought / hidden reasoning exposure
- Automatic explanation approval or automatic evidence creation
- Fabricated provenance
- Upstream contributor mutation
- EV/CPM/resource planning/financial posting

## Review

`project_controls.explainability_review` — draft → pending_review → approved → rejected → published. Humans remain approval authorities.

## Version

`0.12.0-explainability-intelligence` · `PHASE_11M_READY = true` (flag only)
