# Engineering OS — Phase E0 System-of-Record Policy

Status: Locked (E0)  
Canonical principle: **external record ≠ Engineering OS record**

## Rules

1. **Authoritative external systems remain systems of record** for their native entities
   (e.g. SAP work order, SharePoint library file, Maximo asset master) unless a later
   architecture decision explicitly transfers ownership.

2. Engineering OS stores **canonical engineering context** it must own for product
   integrity: projects, assets (shared domain), engineering registers, governed
   intelligence artefacts, mappings, provenance, and decision evidence.

3. Prefer **references + mappings + provenance** over bulk duplication:
   - external ID / URI
   - connector source key
   - sync/as-of metadata
   - hash / version where available
   - human-readable label cache (non-authoritative)

4. Local materialization is allowed only when required for:
   - offline / low-connectivity engineering work
   - governed review workflows that need immutable evidence snapshots
   - intelligence computation that cannot stream live from the connector
   - contractual data residency / retention obligations

5. Materialized copies must declare:
   - `source_of_truth = external | engineering_os | hybrid`
   - provenance chain
   - freshness / staleness
   - conflict status when external and local diverge

6. **Never fabricate** missing external fields. Represent absence, conflict, or
   partial evidence explicitly in API/UI contracts.

7. Write-back to external systems is a **governed tool action**, never an implicit
   side effect of advisory AI output.

8. Certified module ownership is unchanged: PI/II/AI/PC/DT/EMI continue to own their
   intelligence artefacts; they consume Shared Domain and external refs via contracts.

## Examples

| Scenario | Policy |
| --- | --- |
| SharePoint drawing PDF | External SoR; Engineering OS document metadata + file ref / snapshot if attached |
| SAP functional location | External SoR; map to Shared Asset via connector mapping |
| Engineering Risk register row | Engineering OS SoR |
| Asset Intelligence condition state | Asset Intelligence SoR (derivative); Shared Asset identity unchanged |
| Twin state snapshot | Digital Twin SoR; spatial refs consume Shared Spatial Domain |

## Forbidden

- Silent overwrite of External SoR from Engineering OS without governed workflow
- Treating connector cache as canonical without labelling
- Creating parallel “shadow ERP” schemas for convenience
