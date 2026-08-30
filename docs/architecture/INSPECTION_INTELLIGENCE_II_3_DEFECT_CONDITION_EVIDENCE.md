# Inspection Intelligence II-3 — Defect, Condition, and Evidence Intelligence

**Baseline (II-2 certified):** `784b0893937066d1f9be717edf156f53ee875a91`  
**Branch:** `cursor/inspection-intelligence-next-gen`

II-3 publishes hosted operational surfaces over existing V1 inspection defect, recommendation, corrective-action, assessment, condition-rating, verification, and evidence records. It does not implement Inspection History, full Reporting, or AI Inspection Engineer.

## Canonical tables reused

- `inspection_defects`
- `inspection_recommendations`
- `inspection_corrective_actions`
- `inspection_assessments`
- `inspection_condition_ratings`
- `inspection_verifications`
- `inspection_evidence` (Platform Files pointer + metadata only)
- `inspection_sessions` / `inspection_observations` as provenance sources

No new tables, columns, or RLS policies.

## Routes

- `/engineering/apps/inspection-intelligence` — overview plus deterministic indicators
- `/engineering/apps/inspection-intelligence/defects` — defect list
- `/engineering/apps/inspection-intelligence/defects/[defectId]` — defect detail, recommendations, CA workflow
- `/engineering/apps/inspection-intelligence/condition` — assessments and recorded ratings
- `/engineering/apps/inspection-intelligence/evidence` — evidence gallery
- `/engineering/apps/inspection-intelligence/actions` — recommendations vs inspection CA process
- `/engineering/apps/inspection-intelligence/review` — verification
- `/engineering/apps/inspection-intelligence/sessions/[sessionId]` — execution plus II-3 recording forms

## Ownership boundaries

| Record | Owner | Must not become |
| --- | --- | --- |
| Inspection defect | Inspection process | PI finding, asset defect, Core action |
| Inspection recommendation | Inspection process | Autonomous approval |
| Inspection corrective action | Inspection process state | Engineering Core action copy |
| Condition rating | Human assessor under V1 scheme | AI-canonical rating, missing→good |
| Evidence | Platform Files + inspection metadata | Second file store, auto-approved bytes |

`inspection_corrective_actions` has no `core_action_id`. Enterprise action tracking, if required later, must reference a canonical Engineering Core action rather than fork Core truth.

## Deterministic indicators

Defined in `packages/inspection-intelligence/src/domain/deterministic-intelligence.ts`. Each indicator documents inputs, rule, UNKNOWN behavior, and provenance. Missing status/severity/rating stays unknown. No health score or probability.

## Provenance

Displayed defects, ratings, and indicators trace to inspection/session/observation/evidence/assessment/verification/defect/recommendation/corrective-action ids plus actor and timestamps. Condition ratings retain `assessorUserId` and `assessedAt`. Evidence retains captured-by and Platform file id/hash.

## Authority

- `AUTONOMOUS_INSPECTION_APPROVAL_ENABLED=false`
- `AUTONOMOUS_CONDITION_CERTIFICATION_ENABLED=false`
- `AUTONOMOUS_REMEDIATION_APPROVAL_ENABLED=false`

Insufficient/abstain evidence cannot be stored as a rating (`condition_rating_abstain`). AI-generated assessments stay non-canonical.

## Performance profile (II-3)

Known limitation: repeated observation/measurement/evidence mutations were ~7 s including full workspace reload. Profiled against hosted cert (Engineering OS / `wcydlhqiqdwgoaqrlget`) before changing the cycle.

| Step | Before (ms) | After (ms) |
| --- | ---: | ---: |
| GET execution (warmup) | 4031 | 4809 |
| GET execution | 4128 | 4774 |
| POST observation | 3347 | 3346 |
| GET reload | 4340 | 4526 |
| Save + full reload (server) | 7687 | 7872 |
| Client merge path (POST only) | n/a | 3346 |

`getSessionWorkspace` already reads independent repositories in `Promise.all` (9 parallel reads). The 7 s cycle was two sequential HTTP round trips, not sequential DB reads.

Bounded optimization applied:

- return the newly persisted observation/measurement/evidence row from POST
- merge that row into client workspace state (no immediate GET reload)
- skip a second capabilities fetch on full reload paths

Not applied: speculative cache, RLS weakening, hiding failed writes.

`II_OPERATIONAL_WRITE_GA_PERFORMANCE_ACCEPTABLE=false` — POST still ~3 s; do not treat the 7 s class of latency as resolved for all mutations. II-3 list/detail mutations still reload after POST.

## Out of scope

Inspection History, full Reporting UI, AI Inspection Engineer, computer vision inference, drone/CCTV/NDT/SHM connectors, Asset remaining-life prediction.
