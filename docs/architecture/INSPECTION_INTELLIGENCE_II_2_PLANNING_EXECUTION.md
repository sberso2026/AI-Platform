# Inspection Intelligence II-2 — Planning and Execution

**Baseline:** `47b95ae0c84d08dab848f9e1b4f67bbacb890f42`  
**Branch:** `cursor/inspection-intelligence-next-gen`

II-2 replaces the Planning and Execution shells with hosted operational pages over the certified V1 engine. It does not implement Command Centre, Defect Intelligence, History, reporting, or AI Inspection Engineer.

Domain mutations stay in `HostedInspectionRepository`. React pages call `/api/engineering/inspection-intelligence/hosted` intents only.

## Routes

- `/engineering/apps/inspection-intelligence` — operational overview
- `/engineering/apps/inspection-intelligence/plans` — plan list
- `/engineering/apps/inspection-intelligence/plans/new` — create plan + InspectionTarget
- `/engineering/apps/inspection-intelligence/plans/[planId]` — plan detail, permitted updates, start/resume
- `/engineering/apps/inspection-intelligence/sessions` — session list
- `/engineering/apps/inspection-intelligence/sessions/[sessionId]` — execution workspace

## Hosted intents

`create_plan`, `update_plan`, `start_session`, `resume_session`, `record_observation`, `record_measurement`, `register_evidence`, `transition_session`

Reads: `overview`, `plans`, `plan`, `sessions`, `execution`, `templates`, `locations`, `capabilities`

