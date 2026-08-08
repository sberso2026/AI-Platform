# Project Controls Organizational Learning Intelligence (Phase 11M)

Phase 11M adds the twelfth Project Controls contributor: **organizational_learning**.

## Semantics

- **Pattern ≠ prediction** — historical patterns are reference signals, not forecasts.
- **Lesson ≠ recommendation** — lessons learned are cited references, not instructions.
- **History ≠ approval** — prior outcomes do not authorize current decisions.
- **Organizational learning ≠ optimisation** — no automatic best-practice enforcement.
- **Similar project ≠ current project** — cross-project references are qualitative only.

Organizational Learning consumes published Project Controls contributors (progress through explainability), lessons-learned register references, project metadata, historical evidence, and knowledge-graph references. It never mutates upstream contributors.

Composition uses `ProjectContextCompositionEngine` with `mutatesUpstreamContributors: false`.

## Deterministic learning taxonomy

`historical_pattern | recurring_issue | recurring_success | lesson_learned | knowledge_gap | best_practice | similar_project | unknown`

## Fail closed

No historical evidence → `unknown`. Never fabricate lessons, unsupported similarity scores, or hallucinated history.

## Forbidden

- Automatic learning approval or knowledge mutation
- Automatic recommendation generation or execution
- Unsupported similarity scoring / fabricated historical evidence
- AI ownership of organizational knowledge
- EV/CPM/resource planning/financial posting

## Review

`project_controls.organizational_learning_review` — draft → pending_review → approved → rejected → published. Humans remain owners of organizational knowledge; AI findings are advisory only.

## Version

`0.13.0-organizational-learning` · `PHASE_11N_READY = true` (flag only — do not implement 11N)
