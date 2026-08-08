# DIGITAL_TWIN_DIGITAL_THREAD_INTELLIGENCE

Status: `digital_thread` · Phase 12K · Version `0.11.0-digital-thread`

## What Digital Thread is

Digital Thread Intelligence composes **typed references** and **versioned relationships**
across Twin, Asset, Project, Representation, State, Telemetry, Time-series windows,
Inspection/Asset/Project Intelligence, Project Controls, Documents, Simulation artefacts,
Qualification layers, Validation, Reviews, and Knowledge Graph nodes/edges.

It produces:

- `DigitalThreadSnapshot` — versioned as-of view (**refs only**)
- `DigitalThreadProvenance` — fail-closed provenance metadata
- `DigitalThreadTraversalResult` — as-of / historical / current-reference
- `DigitalThreadChangeSet` — snapshot diffs
- `DigitalThreadIntegrityAssessment` — detect-only integrity

## What Digital Thread is NOT

| Concept | Relation to Digital Thread |
| --- | --- |
| Knowledge Graph | Reused via platform KG patterns — **not** a Twin graph engine (`duplicateKnowledgeGraphDetected=false`) |
| TwinTimeline / TwinSnapshot | **Integrated by reference** — DigitalThreadSnapshot does **not** replace TwinSnapshot |
| Workflow history | Not a workflow engine or audit-log substitute |
| Document repository | References documents; never duplicates document stores |
| Reasoning chain | Not an AI reasoning transcript |

Critical separations:

- Traceability ≠ causality
- Association ≠ dependency
- Correlation ≠ causation
- Cross-domain refs ≠ ownership
- Simulation ≠ observed state

## Relationship taxonomy (v1.0.0)

`represents`, `references`, `derived_from`, `observed_from`, `validated_by`,
`reviewed_by`, `qualified_by`, `executed_with`, `produced`, `supersedes`,
`associated_with`, `mapped_to`, `supported_by`, `contradicted_by`, `applies_to`,
`generated_from`, `published_from`, `unknown`

Taxonomy documents **references only** — **no causal inference**.

## Provenance fail-closed

Missing `sourceDomain` / `sourceReference` → `provenanceStatus=unknown`.
Never fabricate provenance fields.

## Integrity

Statuses: `complete` | `partial` | `broken_reference` | `conflicting` | `stale` | `unknown`.
Detection only — **never auto-repair**.

## Composition rule

Compose **REFERENCES only** — never duplicate Assets / Projects / documents / II / AI /
PC / PI / time-series / KG stores / simulation artefact binaries.

`spatialOwnershipFullyResolved=false` · `productionDigitalTwinReady=false`
