# Inspection Intelligence II-4 — Inspection History and Governed Reporting

**Baseline (II-3 certified):** `266c1da7b160adf6c63b6fc31dc6b5f646f9aabd`  
**Branch:** `cursor/inspection-intelligence-next-gen`

II-4 publishes hosted Inspection History and deterministic governed reports over existing canonical `inspection_*` records. It does not implement AI Inspection Engineer, remaining-life models, PDF infrastructure, or a second history/report truth store.

Known limitation carried forward: `II_OPERATIONAL_WRITE_GA_PERFORMANCE_ACCEPTABLE=false`. Basic mutation POST latency remains approximately 3.3 s. II-4 does not redesign the write path.

## Canonical tables reused

- `inspection_sessions` (history landing, target coupling, session provenance)
- `inspection_plans` / `inspection_templates` (plan title, inspection type / pack id)
- `inspection_observations`
- `inspection_measurements`
- `inspection_evidence`
- `inspection_defects`
- `inspection_recommendations`
- `inspection_corrective_actions`
- `inspection_assessments`
- `inspection_condition_ratings`
- `inspection_verifications`
- `inspection_reporting_outputs` (durable report snapshot/history)

No new tables, columns, or RLS policies. `SCHEMA_CHANGED=false`. `DATABASE_POLICY_CHANGED=false`.

## History projection

History is a read projection over hosted sessions and related inspection rows. It is not:

- Asset Intelligence asset history
- Digital Twin state history
- Project Intelligence project history
- Engineering Core audit/history
- Platform Knowledge Graph
- a second historical event store

Landing filters: project (existing hosted `projectId`), asset / location / InspectionTarget (`kind` + `canonicalId`), plan, session, date/time, inspection type (`template.pack_id`). Inspector/actor is UNKNOWN unless a canonical assignment later records it. Missing timestamps stay missing.

Target history is chronological inspection-derived evidence for one InspectionTarget: sessions, observations, measurements, evidence, defects, recommendations, corrective actions, assessments, condition ratings, and verifications, each with source id and timestamp. Continuity is not inferred when records are absent (`missingContinuity=true`).

Change-over-time is deterministic only when canonical data permits:

- recorded condition-rating history by same `scheme_id`
- repeat defects sharing target identity plus recorded category/title across two or more sessions
- current recorded defect / corrective-action status (not a reconstructed event timeline)
- numeric measurement delta only for like-for-like `measurement_type` + `unit` with timestamps
- evidence/verification identifier history

UNKNOWN remains UNKNOWN. Ordinals are not converted into a deterioration rate. Deltas are not causal claims.

## Report snapshot

One composition layer reuses V1 `INSPECTION_REPORTING_DATA_MODELS` keys and persists to `inspection_reporting_outputs`.

| Report type | V1 `reportKey` | Composition |
| --- | --- | --- |
| Inspection Summary | `inspection.session_summary` | identity, target, session, indicators, limitations, provenance |
| Inspection Report | `inspection.close_out_certificate` | full sections; `closedAt` UNKNOWN if session is not closed |
| Defect / Corrective Action Summary | `inspection.defect_register` | defects, recommendations, CAs, related verifications |
| Condition Assessment Summary | `inspection.condition_rating_snapshot` | assessments, ratings, evidence |

Each snapshot includes authority `draft` at compose time, `aiNarrative=false`, `pdfAvailable=false`, and provenance for target, session, observations, measurements, defects, evidence, assessments, ratings, and verifications. Limitations list UNKNOWN/unrated/unset facts. No AI prose is stored as fact.

## Authority

`AUTONOMOUS_INSPECTION_APPROVAL_ENABLED=false`  
`AUTONOMOUS_CONDITION_CERTIFICATION_ENABLED=false`  
`AUTONOMOUS_REMEDIATION_APPROVAL_ENABLED=false`

Authority transitions are `draft → reviewed → approved → published`. Skipping is rejected. `approved` / `published` require `inspection.approve`. Compose does not auto-publish.

## Export

Markdown/text export is available from the existing snapshot. There is no canonical PDF renderer.

`II_PDF_EXPORT_AVAILABLE=false`

## Deterministic history indicators

Defined in `packages/inspection-intelligence/src/domain/inspection-history.ts`. Each documents inputs, rule, comparability, UNKNOWN behavior, and provenance. No probability, confidence score, remaining-life, or opaque health score.

## Routes

- `/engineering/apps/inspection-intelligence/history`
- `/engineering/apps/inspection-intelligence/history/targets/[kind]/[canonicalId]`
- `/engineering/apps/inspection-intelligence/reports`
- `/engineering/apps/inspection-intelligence/reports/[outputId]`
- `/engineering/apps/inspection-intelligence/sessions/[sessionId]` — link to compose governed report

Hosted API: `history`, `history_intelligence`, `target_history`, `reports`, `report_types`, `report`, `report_export`, `compose_report`, `transition_report`.

## Security

Authenticated Engineering OS access, II application entitlement, tenant/workspace/project isolation, InspectionTarget coupling, and foreign-id anti-enumeration are unchanged. History and reports do not broaden access: project-scoped reads filter sessions and report `entity_id` values. Viewers cannot compose. Missing/foreign report ids return 404.

## Performance

Measured on live hosted certification (Engineering OS / `wcydlhqiqdwgoaqrlget`, `http://127.0.0.1:3011`). No invented certification thresholds. Operational write latency remains a separate known limitation (`II_OPERATIONAL_WRITE_GA_PERFORMANCE_ACCEPTABLE=false`, POST observation ~3.3 s) and is not mixed into report implementation.

| Surface | n | p50 (ms) | p95 (ms) |
| --- | ---: | ---: | ---: |
| History landing (`GET history`) | 5 | 3287 | 3563 |
| Target history (`GET target_history`) | 5 | 4902 | 5051 |
| Report composition (`POST compose_report`) | 1 | 4467 | n/a (insufficient samples) |
| Report read / Markdown export | 6 | 3091 | 3207 |
