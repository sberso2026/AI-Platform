# Project Controls Forecast Model (Phase 11G)

## Forecast Control Context

`trajectoryUnitId` identifies the advisory trajectory thread (phase, delivery
thread, etc.). Forecast never uses control-unit productivity semantics for
execution planning.

## Forecast Posture (qualitative only)

`favourable | stable | uncertain | deteriorating | recovery_possible | unknown`

Never numeric, never dates, never percentages.

## Forecast Confidence

`sufficient | limited | insufficient | conflicting | stale` (+ abstain)

## Forecast Evidence

Governed references to composed contributor outputs — never fabricated completion
dates or cost forecasts.

## Project Context Composition Layer

`ProjectContextCompositionEngine` composes Progress, Schedule, Change, Cost and
Productivity without collapsing into an opaque score. Forecast consumes composed
context only and never mutates upstream contributors.

## Forbidden

CPM, critical path, float, EV/CPI/SPI, resource planning, budget ledger, financial
posting, predictive scheduling, deterministic finish dates.
