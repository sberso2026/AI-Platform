# EOS-A15A-V4 Governed Engineering Deliverable Composition

Evidence-backed document assembly over existing Engineering OS context. Not a Deliverable Intelligence domain.

## Principle

EOS may assemble, format, summarize, cross-reference, calculate deterministic quantities, draft connecting narrative from governed facts, and identify missing sections. EOS must not invent design values, quantities, loads, capacities, dimensions, grades, compliance, costs, rates, carbon factors, technical conclusions, or approvals merely to complete a document.

Canonical flow: Work Plan → governing Engineering Information → Requirements → Assumptions → Decisions → Interfaces → verified MTO → composition → DOCX / XLSX → engineer review → Pre-Issue Review → governed artifact.

## Deliverable types (bounded)

- `DESIGN_REPORT` — EAT-REPORT-DESIGN DOCX
- `TECHNICAL_MEMORANDUM` — Technical Note (EAT-TECH-MEMO)
- `QUANTITY_SCHEDULE` — XLSX via existing V3 `exportMtoWorkbook` (not a second export engine)

## Source manifest

Every composed artifact carries a machine-readable provenance manifest: Work Plan, project/system/discipline/lifecycle, Engineering Information refs, Requirements, Assumptions, Decisions, Interfaces, MTO snapshot/revision/fingerprint/source revisions, template/version, generation timestamp, generator `EOS-A15A-V4`.

The manifest is provenance, not a duplicate source of truth.

## Evidence classes

`GOVERNED_FACT` · `DETERMINISTIC_RESULT` · `ENGINEER_ENTERED_ASSUMPTION` · `AI_DRAFT_NARRATIVE` · `MISSING_INFORMATION` · `NOT_APPLICABLE`

AI draft narrative cannot become a governed engineering fact because it appears in a document.

## MTO binding and staleness

Artifacts bind to the selected persisted MTO snapshot (revision, verification state, fingerprint, source revisions). Unverified items remain visible. Regeneration after MTO Rev A → Rev B inserts the new artifact first, then marks the prior artifact `SUPERSEDED` (`MTO_SOURCE_CHANGED` / `REGENERATION_REQUIRED`) without mutating bytes. Change Impact remains POTENTIAL except where quantity evidence is deterministic.

## Cost / carbon / constructability

- No approved rate → `COST_NOT_CALCULATED`
- Carbon `NOT_APPLICABLE` → section omitted / N/A
- Carbon required without approved factor → `CARBON_NOT_CALCULATED`
- Constructability lists governed heavy-item / volume / connection facts only. No universal score.

## Human authority

Generation cannot verify MTO, accept an assumption, make a Decision, approve a Requirement, confirm Change Impact, or approve the deliverable. Permitted states: `GENERATED_DRAFT` / `READY_FOR_ENGINEER_REVIEW`. Never `ENGINEERING_APPROVED`, IFC, or CERTIFIED from generation.

## Pre-Issue and Digital Thread

Pre-Issue reuses existing checks plus composed-deliverable evidence: missing source manifest, superseded MTO, MTO fingerprint change, unverified items, open assumptions, missing requirement evidence. Thread reuses PRODUCED / USED_BY / SOURCE_FOR / EVIDENCED_BY / SUPERSEDED_BY. No new graph store.

## UI

Work Plan exposes Generate Deliverable, source readiness (READY / CONDITIONAL / MISSING / NOT_APPLICABLE), MTO revision/status, artifact history, and “What evidence produced this document?”. Readiness is not an engineering approval score.

## Architecture freeze

No new top-level domain. No Deliverable / MTO / Cost / Carbon Intelligence. No Event Bus, DMS, connector framework, solver, or ScannerV2. Hosted malware scanner remains `DEFERRED_EXTERNAL_DEPENDENCY`. Returned inbound files remain fail-closed. `CONTROLLED_PILOT_READY` remains NO.
