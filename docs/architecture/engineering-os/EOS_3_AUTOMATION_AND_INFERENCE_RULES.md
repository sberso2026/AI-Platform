# EOS 3 — Automation & Inference Rules

## Confidence × materiality

| | Low materiality | High materiality |
|--|-----------------|------------------|
| High confidence | AUTO_APPLY | PROPOSE_AND_CONFIRM |
| Low confidence | ASK_ONCE | ASK_ONCE |

Conflict → SURFACE_CONFLICT_AND_REQUEST_DECISION

## Provenance (every generated object)

source, basis, sourceRevision, generatedBy, confidence, materiality, disposition, humanConfirmationStatus, timestamp, resultingObjectStableId

## Explainability

UI exposes “Why EOS suggested this” with source, reasoning, uncertainty.

## Safe bulk acceptance

Only `bulkSafe` + non-HIGH materiality. Never bulk-approve decisions, material assumptions, calculations, risks, gates, qualification, IFC.
