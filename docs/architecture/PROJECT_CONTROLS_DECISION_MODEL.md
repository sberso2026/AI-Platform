# Project Controls Decision Model (Phase 11H)

## Decision Evidence

`DecisionEvidence` records governed references with forbidden execution/approval claims.

## Decision Control Context

`DecisionControlContext` binds scope and decision unit thread for an assessment.

## Decision Confidence

`DecisionConfidence` reports sufficiency: sufficient | limited | insufficient | conflicting | stale.

## Core types

- `DecisionSupportEngine` — assesses advisory options/recommendations
- `DecisionOption` — objective, expected benefit, assumptions, limitations, affected contributors
- `DecisionRecommendation` — versioned advisory recommendation set per assessment
- `DecisionProfileContribution` — rollup embedded in `ProjectProfile`

## Assessment state

`DecisionAssessmentState` holds options, recommendations, confidence, contributor refs, and abstention when basis is insufficient/conflicting/stale.

## Confidence abstention

Anything other than `sufficient` or `limited` forces abstention — no recommendations published.

## Persistence keys

Thread key: `decisionStateKey(scope, decisionUnitId)`

## Governance flags

- `DECISION_SUPPORT_READY = true`
- `PHASE_11I_READY = true` (readiness flag only)
- `AI_MAY_PUBLISH_DECISION_FORBIDDEN = true`
