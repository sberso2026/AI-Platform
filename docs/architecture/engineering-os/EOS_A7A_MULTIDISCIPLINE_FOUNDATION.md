# EOS-A7A Multidiscipline Intelligence Foundation

Status: implemented as a governed foundation. Does **not** execute discipline solvers.

| Field | Value |
| --- | --- |
| Start HEAD | `57d4bda7103eebb7cd298298ff76ae158c11fae4` |
| Branch | `cursor/era-7a-engineering-review-pilot-gate` |
| Target | STAGING / NON-PRODUCTION `rntonzigxwxcjlcsadip` |
| Structural optimization | NOT IMPLEMENTED |
| Real solver execution | NOT IMPLEMENTED |
| LLM-as-solver | PROHIBITED |
| Autonomous approval | NO |

## Purpose

Establish one Discipline Intelligence framework inside Engineering OS so Structural, Mechanical, Process, Piping, Electrical, Civil, Geotechnical, I&C, Materials, Safety, and Environmental capabilities attach later without creating isolated discipline operating systems.

## Registry

Canonical identity remains `engineering_disciplines`. A7A adds overlay codes:

STRUCTURAL, MECHANICAL, PROCESS, PIPING, ELECTRICAL, CIVIL, GEOTECHNICAL, INSTRUMENTATION_CONTROL (`instrumentation`), MATERIALS, SAFETY, ENVIRONMENTAL.

Existing extras (marine, construction, project_controls, quality, hse) are preserved. MATERIALS, SAFETY, and ENVIRONMENTAL are seeded as system catalogue rows if missing.

## Profiles and capabilities

`engineering_discipline_profiles` is a tenant overlay, not a second identity.

Capability statuses: NOT_AVAILABLE, AVAILABLE, TOOL_DEPENDENT, NOT_CERTIFIED, CERTIFIED, BLOCKED, DEGRADED.

AVAILABLE is not CERTIFIED. A connected adapter is not a certified discipline capability.

## Readiness

Derived. STRUCTURAL document/interface/requirement review remains AVAILABLE while LINEAR_STRUCTURAL_ANALYSIS is BLOCKED because SPACE GASS is NOT_CONFIGURED. Overall: PARTIALLY_AVAILABLE.

## Context resolver

Deterministic metadata only: explicit codes/keys, document discipline, asset type, system/interface/review/optimization participants, requirement allocation, project disciplines. LLM classification is not canonical ownership.

## Participation and interfaces

`engineering_object_discipline_participants` is many-to-many. Systems are multidisciplinary. Interfaces reuse `engineering_interfaces` plus SOURCE/RECEIVING participants.

`engineering_interface_information_requirements` records what one discipline needs from another. Status is independent of Interface lifecycle.

## Standards

References only (code, edition, source, applicability). No copyrighted standard text.

## Tool bindings

`engineering_discipline_tool_bindings` references External Tool Governance profile id/code. Executable path, licence, and version are forbidden on discipline records. Tool readiness propagates: SPACE GASS not READY → STRUCTURAL LINEAR_STRUCTURAL_ANALYSIS BLOCKED. EOS-A6 recorded a Windows SPACE GASS trial install; that does not certify LINEAR_STRUCTURAL_ANALYSIS.

## Contracts

Common evidence envelope and normalized `DisciplineAnalysisResult`. Engineering Review remains the review context. Optimization Study remains the optimization context. ERA findings stay ERA findings with optional participant tagging via the participation table. No `structural_findings` or `structural_optimization_studies`.

## Human authority and LLM boundary

LLMs may interpret, retrieve, explain, and prepare review material. They must not replace deterministic solvers. Discipline intelligence must not approve design, issue IFC, certify compliance, accept safety-critical changes, or select a final Optimization solution.

## UI / API / security

Settings → Disciplines at `/engineering/settings/disciplines`. APIs under `discipline-intelligence` map to Engineering OS `settings.read` / `settings.write`.

Platform overlays: tenant read, engineering admin mutate. Workspace-scoped project/interface rows: workspace member read, admin mutate.

## Out of scope

EOS-A7A itself does not execute solvers. EOS-A7B adds the discipline-neutral Analysis Request / Execution Plan / Result foundation (`EOS_A7B_MULTIDISCIPLINE_ANALYSIS_EXECUTION.md`). EOS-A6 remains a bounded structural optimization **pilot**. Live SPACE GASS analysis remains fail-closed. No FEA, process simulation, piping stress, power flow, new job queue, new graph store, or Value Intelligence.
