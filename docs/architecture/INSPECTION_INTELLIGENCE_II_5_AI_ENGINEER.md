# Inspection Intelligence II-5 — AI Inspection Engineer

**Baseline (II-4 certified):** `bb4c8bd82fc2dd13b5b1e25cb318b674a6c285ef`  
**Branch:** `cursor/inspection-intelligence-next-gen`

II-5 publishes a governed **AI Inspection Engineer** as an advisory assistant over canonical Inspection Intelligence. It reuses the existing Platform AI stack. It does not implement Inspection Command Centre, remaining-life models, autonomous approval, or a second AI runtime.

Known operational limitation carried forward: `II_PERFORMANCE_GA_BLOCKER_OPEN=true`. Write/history/report latencies from II-4 are unchanged. II-5 measures AI latency separately and does not claim the base platform improved.

## Platform AI path

| Concern | Owner |
| --- | --- |
| Runtime | Platform Kernel AI Director (`kernel.aiDirector.run`) |
| Prompt | Platform Prompt Registry key `inspection-intelligence-engineer` version `1.0.0` |
| Model | Platform Model Registry route intent `engineering` |
| Tools | Platform Tool Registry keys bound to user-scoped II compose (Director has no tool loop) |
| Policy / cost / observability / audit | Existing Platform Intelligence / Platform Core |
| Deterministic facts | Inspection Intelligence hosted reads |

`IMPLEMENTS_OWN_AI_STACK=false`  
`DIRECT_PROVIDER_ACCESS_FROM_II=false`  
`DUPLICATE_AGENT_RUNTIME_DETECTED=false`  
`DUPLICATE_PROMPT_REGISTRY_DETECTED=false`  
`DUPLICATE_MODEL_REGISTRY_DETECTED=false`  
`DUPLICATE_TOOL_REGISTRY_DETECTED=false`  
`DUPLICATE_KNOWLEDGE_GRAPH_DETECTED=false`  
`DUPLICATE_MEMORY_STACK_DETECTED=false`

## Tools (read-only)

Registered names (Platform Tool Registry catalog rows are administrative and optional):

- `inspection_intelligence.get_inspection`
- `inspection_intelligence.get_session`
- `inspection_intelligence.get_target_history`
- `inspection_intelligence.get_defects`
- `inspection_intelligence.get_condition_assessment`
- `inspection_intelligence.get_evidence`
- `inspection_intelligence.get_measurements`
- `inspection_intelligence.get_recommendations`
- `inspection_intelligence.get_corrective_actions`
- `inspection_intelligence.get_verifications`
- `inspection_intelligence.get_report_snapshot`
- `inspection_intelligence.get_deterministic_indicators`

No unrestricted SQL, no direct Supabase from the model, no write tools.

## Response contract

Structured fields: `answer`, `summary`, `facts[]`, `interpretations[]`, `unknowns[]`, `limitations[]`, `evidenceRefs[]`, `inspectionRefs[]`, `confidenceBasis`, plus typed `claims[]` (`FACT` | `DETERMINISTIC_RESULT` | `AI_INTERPRETATION` | `UNKNOWN` | `LIMITATION`).

`confidenceBasis` is evidential, not a fabricated probability.

## Grounding and abstention

Context is assembled from hosted inspection reads the authenticated user can already access (session workspace, target history, report snapshot, deterministic indicators). UNKNOWN is preserved when:

- no condition rating exists
- measurements are incompatible for like-for-like comparison
- evidence is absent
- defect severity is unset
- historical records are incomplete
- a report snapshot lists limitations

## Authority

`AI_INSPECTION_ENGINEER_EXTERNAL_WRITES=false`  
`AI_INSPECTION_ENGINEER_AUTONOMOUS_APPROVAL=false`  
`AI_INSPECTION_ENGINEER_AUTONOMOUS_CERTIFICATION=false`  
`AI_INSPECTION_ENGINEER_AUTONOMOUS_REMEDIATION=false`

The assistant must not imply the structure is safe, a defect is acceptable, remediation is unnecessary, or remaining life. Report draft narrative is AI-assisted and never auto-published. The deterministic snapshot remains canonical.

## UI

- `/engineering/apps/inspection-intelligence/engineer`
- Contextual entry from session, defect, target history, and report snapshot
- AI interpretation is visually distinct from recorded facts
- Source references and limitations are shown

## Security

API segment `inspection-intelligence-engineer` is entitled to `inspection.read` for GET and POST (advisory ask is not an inspection write). Tools inherit tenant, workspace, project coupling, InspectionTarget, and RLS. `CROSS_TENANT_AI_ACCESS=false`. `UNRESTRICTED_GRAPH_ACCESS=false`.

## Performance

AI profile fields: `contextAssemblyMs`, `toolMs`, `modelMs`, `totalMs`. These must not be combined with the existing II operational write/history/report limitation to claim GA performance is resolved.

`SCHEMA_CHANGED=false`. No II-specific AI domain tables.
