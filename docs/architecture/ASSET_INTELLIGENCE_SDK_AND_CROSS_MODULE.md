# Asset Intelligence — Lifecycle, SDK Reuse, Cross-Module Relationships

## Lifecycle
Canonical lifecycle identity: Shared Domain.  
AI may calculate lifecycle intelligence/recommendations across design→retirement stages.

## SDK reuse (locked)
Must consume Engineering Module, Domain, Workflow SDKs. Evaluate Engineering Pack SDK reuse. Mobile SDK only if future mobile surfaces require it. No competing SDKs without documented gap. Workflows via Engineering Workflow SDK (condition/criticality/reliability/risk/failure/maintenance/prediction/RUL review).

## Inspection Intelligence consumption
Frozen II public contracts `1.0.0` only. Tag `inspection-intelligence-v1.0.0`.

## Project Intelligence
Consume documents/findings/knowledge/reports/meetings via PI shared contracts — do not duplicate PI Knowledge Intelligence. Tag `project-intelligence-v1.0.0`.

## Project Controls (reserved)
Asset-linked cost, maintenance cost signals, schedule/shutdown, capital replacement, change, contingency, forecast — not implemented in 10A.

## SHM (reserved)
Sensor/vibration/strain/temperature/displacement/acoustic/corrosion/environmental via versioned contracts later — no SHM runtime in 10A.

## Knowledge Graph
Contribute reference-oriented nodes/edges to existing Platform KG only — no new graph/embedding plane.
