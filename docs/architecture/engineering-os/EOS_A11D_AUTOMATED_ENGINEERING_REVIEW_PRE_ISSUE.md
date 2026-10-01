# EOS-A11D Automated Engineering Review & Pre-Issue Intelligence

Staging / non-production composition of existing Engineering Review onto Engineering Work Plans. This is not a second review engine, Event Bus, graph store, or DMS.

## Product purpose

EOS must help engineers do engineering work faster. A11D answers:

> Before I issue this engineering work, what should I check or correct?

From an Engineering Work Plan the engineer runs **Pre-Issue Review**. EOS returns practical review conditions with evidence and actions. It does not automatically approve, reject, certify, or declare design safe/unsafe or code compliant.

## Existing Engineering Review reuse

| Capability | Classification |
| --- | --- |
| Review Package / Run / Finding / Evidence / Disposition | REUSE |
| ERA1 detectors | REUSE |
| Review AI (`ReviewInferenceProvider`) | REUSE |
| A8C/A8D assurance | COMPOSE |
| A11A Work Plans | COMPOSE |
| A11B/A11C artifacts | COMPOSE |
| A10A–A10C information | COMPOSE |
| Requirements / Assumptions / Interfaces / Decisions / Analysis / Configuration / Deliverables | COMPOSE |
| Digital Thread | COMPOSE |
| EngineeringWorkEvent | EXTEND |
| Duplicate Review engine | NO |

Preferred path:

`EngineeringWorkPlan → generated/returned artifacts → Review Package → Review Run → candidate conditions → human disposition`

## Pre-Issue Review

One-click from `/engineering/work/plans/[id]`. Target is the latest governed **returned** artifact (`RETURNED_FROM_ENGINEER`). If none exists, the generated draft may be reviewed with `reviewingGeneratedDraft = true`.

Result states:

- `NO_BLOCKING_CONDITIONS_IDENTIFIED`
- `ATTENTION_REQUIRED`
- `CONTEXT_STALE`
- `REVIEW_INCOMPLETE`
- `REVIEW_FAILED`

Never returned: `DESIGN_APPROVED`, `SAFE_TO_BUILD`, `CODE_COMPLIANT`, `IFC_READY`.

## Review target

Supported: CALCULATION_WORKBOOK, DESIGN_REPORT, SPECIFICATION, OPTION_STUDY, RFI_RESPONSE, TQ_RESPONSE, TECHNICAL_MEMORANDUM, REVIEW_PACKAGE, and governed source packages. CAD/model semantic review remains CONTRACT_ONLY.

## Review policy

Versioned `EOS-PRE-ISSUE-REVIEW@1.0.0`. Defines applicable work/artifact types, deterministic checks, that semantic AI is permitted but not required, and that human review is required. Not a scripting DSL. Automatic finding promotion is false. Automatic approval is false.

## Deterministic checks

Facts EOS already knows are not delegated to an LLM:

CURRENT_INFORMATION_CHECK, REVISION_AUTHORITY_CHECK, INFORMATION_REQUIREMENT_CHECK, REQUIREMENT_TRACEABILITY_CHECK, ASSUMPTION_EVIDENCE_CHECK, INTERFACE_STATUS_CHECK, ANALYSIS_STALENESS_CHECK, CONFIGURATION_CONTEXT_CHECK, DELIVERABLE_EVIDENCE_CHECK, ARTIFACT_PROVENANCE_CHECK, WORK_PLAN_FINGERPRINT_CHECK, SOURCE_SUPERSESSION_CHECK, plus XLSX/DOCX/PPTX/RFI and cross-artifact revision checks.

## Semantic AI boundary

AI may compare text, identify potential inconsistency, summarize differences, and suggest where a checker should look.

AI may not approve/reject design, certify calculation, declare code compliance, determine structural safety, select a design option, or modify a governed formula.

Candidates remain `POSSIBLE_*` with model/prompt provenance. They are not automatic Findings.

When no model is configured (`RejectingInferenceProvider`): `DETERMINISTIC_REVIEW = available`, `SEMANTIC_AI_REVIEW = unavailable`.

## Review candidates vs Findings

Automated output starts as Condition / Candidate / Observation. Formal Finding promotion is not automatic. Human disposition reuses existing Review actions: accept, reject, modify, close, reopen, assign.

## XLSX checks and formula deviation

Transient `exceljs` inspection of sheet names, formula cells, source register, EOS context, units, and template provenance. Macros, OLE, and external scripts are not executed. `GOVERNED_FORMULA_CHANGED` / `REMOVED` compare only governed template cells (example: Calculations!B6 = B4/B5). Editable areas are not flagged merely because the engineer changed them. EOS does not declare CALCULATION WRONG.

## DOCX checks

Deterministic document-control / assumptions / limitations / revision / project identity headings. Exact prose is not required.

## Cross-document review

Package-level deterministic revision inconsistency (e.g. calculation cites Drawing Rev B, report cites Rev C, governed source is Rev C). Semantic cross-document candidates reuse ERA1 / Review AI.

## Staleness and rerun

Historical Review Runs are immutable. After governing context or artifact hash change, the stored run is `POTENTIALLY_STALE` / `STALE` / `RERUN_REQUIRED`. Rerun comparison reports resolved, unchanged, added, and no-longer-applicable conditions.

## Human disposition

Existing Engineering Review disposition architecture. Protected disposition/policy actions continue to use existing AAL2 controls. A11D does not add MFA logic.

## Digital Thread

Composition only: Work Plan → Artifact → Review Package → Review Run → Review Condition/Finding → Evidence → Disposition → Deliverable. No new graph store.

## Multi-project isolation

Project is taken from the artifact / Work Plan / Review Package, never from the current global UI project view. Cross-project contamination is rejected.

## Managed repository privacy

DEFAULT_CAPTURE_POLICY remains DENY. Pre-Issue Review uses authorized EOS artifacts, canonical engineering information, and managed project sources only. Personal/unmanaged files are excluded. No local recursive scan.

## Binary storage boundary

A11D_BINARY_DUPLICATION = NO. Review records store artifact id, hash, lineage, and snapshot references. Extraction is transient. `content_base64` HIGH-risk storage is not expanded. Staging size guard = 15 MB (`MAX_REVIEW_EXTRACT_BYTES`). Production object-storage migration remains A13/A14.

## Malware boundary

Hosted ClamAV remains UNAVAILABLE. Fail-closed upload behavior is unchanged. Review of already-governed generated artifacts proceeds within the existing trust boundary. Returned uploads that require malware scanning remain production-blocked unless a controlled fixture/admin prescan path already exists.

## Security / RLS

Additive table `engineering_pre_issue_reviews` uses existing `engineering_core_workspace_member` tenant+workspace policies. Existing Engineering Review RLS is reused for Package/Run/Finding. Anonymous denial. Workspace isolation. Tenant isolation.

## A11E handoff

EOS-A11E Change Impact, Option Study & Construction Engineering Workbench should turn Digital Thread and pre-issue review into governed impact packs and response artifacts without autonomously deciding technical acceptability.
