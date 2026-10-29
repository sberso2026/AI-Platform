# Engineering Federation Model (Phase 13A)

Status: locked (`EngineeringFederationModelLocked=true`)

## Purpose

Define how RTB federates external engineering models and results **without**
claiming ownership or collapsing distinct concerns into a single “interop”
runtime.

## Layers (independently governed)

1. **Model Federation** — reference / read access to external models
2. **Result Federation** — reference / read of existing analysis results
3. **Solver Execution** — orchestrated via Digital Twin `EngineeringSolverAdapter`
4. **Model Authoring** — remains in source applications
5. **Analysis Model Generation** — never auto-certified

## Core locks

| Lock | Value |
| --- | --- |
| model accessible ⇒ solver executable | **false** |
| model federated ⇒ RTB ownership | **false** |
| existing results ⇒ RTB-generated | **false** |
| IFC first-class vendor-neutral path | **true** |
| IFC sole pathway | **false** |
| native adapters optional | **true** |
| reuse DT EngineeringSolverAdapter | **true** |
| reuse four-layer qualification | **true** |
| abstain rather than silent substitute | **true** |

## Project-aware solver policy

- Each project maintains an explicit `projectApprovedProviders` allow-list
- If a requested provider is not in the allow-list → **abstain**
- Never silently substitute another provider

## CSI family

- Assess shared `CSIInteropCore` for common plumbing
- Product-specific adapters/qualifications remain separate
  (ETABS / SAP2000 / SAFE / CSiBridge)

## Relation to Digital Twin V1

Federation discovery is additive **outside** `packages/digital-twin`.
Digital Twin V1.0.0 remains intact; reserved stubs are inventoried, not activated.
